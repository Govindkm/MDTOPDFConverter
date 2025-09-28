import puppeteer, { Browser, Page, PDFOptions, PaperFormat } from 'puppeteer';
import { marked } from 'marked';
import { readFile } from 'fs/promises';
import { extname, resolve } from 'path';
import { ConversionOptions, ConversionError, PdfFormat, PdfMargins } from '../types/index.js';
import { TemplateManager } from './templateManager.js';

/**
 * Handles PDF generation using Puppeteer and Markdown parsing
 */
export class PdfGenerator {
  private browser: Browser | null = null;
  private templateManager: TemplateManager;

  constructor() {
    // Configure marked for better HTML output
    this.configureMarked();
    
    // Initialize template manager
    this.templateManager = new TemplateManager();
  }

  /**
   * Initializes Puppeteer browser
   */
  private async initializeBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    try {
      console.log('🌐 Launching browser...');
      
      this.browser = await puppeteer.launch({
        headless: true, // Use headless mode
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      console.log('✅ Browser launched successfully');
      return this.browser;
      
    } catch (error) {
      throw new ConversionError(
        `Failed to launch browser: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Converts a file to PDF
   */
  async convertToPdf(
    inputFile: string, 
    outputFile: string, 
    options: ConversionOptions
  ): Promise<void> {
    let page: Page | undefined;
    
    try {
      // Initialize browser if needed
      const browser = await this.initializeBrowser();
      page = await browser.newPage();

      // Read and process input file
      const htmlContent = await this.processInputFile(inputFile, options);

      // Configure page for dark theme support
      await page.emulateMediaType('print');
      
      // Set content and wait for it to load
      await page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded', // Less strict waiting
        timeout: 15000
      });

      // Check if using dark theme and add appropriate CSS
      const isDarkTheme = this.isDarkTheme(options.template);
      
      if (isDarkTheme) {
        // Add CSS for dark theme with full page coverage
        await page.addStyleTag({
          content: `
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            @page {
              margin: 0 !important;
            }
            
            html {
              background-color: ${this.getDarkThemeColor(options.template)} !important;
              margin: 0 !important;
              padding: 0 !important;
              min-height: 100vh !important;
            }
            
            body {
              background-color: ${this.getDarkThemeColor(options.template)} !important;
              margin: 0 !important;
              padding: 0 !important;
              min-height: 100vh !important;
            }
            
            .document {
              background-color: ${this.getDarkThemeColor(options.template)} !important;
              min-height: 100vh !important;
              padding: 20mm !important;
              margin: 0 !important;
              box-sizing: border-box !important;
            }
          `
        });
      } else {
        // Add CSS for light themes
        await page.addStyleTag({
          content: `
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          `
        });
      }

      // Generate PDF with options
      const pdfOptions = this.buildPdfOptions(options);
      await page.pdf({
        ...pdfOptions,
        path: outputFile
      });

    } catch (error) {
      throw new ConversionError(
        `PDF generation failed for ${inputFile}: ${error instanceof Error ? error.message : error}`,
        inputFile,
        error instanceof Error ? error : undefined
      );
    } finally {
      // Always close the page to free memory
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Processes input file and converts to HTML
   */
  private async processInputFile(
    inputFile: string, 
    options: ConversionOptions
  ): Promise<string> {
    try {
      const fileContent = await readFile(inputFile, 'utf-8');
      const fileExt = extname(inputFile).toLowerCase();
      
      let htmlBody: string;
      
      // Convert based on file type
      if (['.md', '.markdown'].includes(fileExt)) {
        htmlBody = await this.convertMarkdownToHtml(fileContent);
      } else if (['.html', '.htm'].includes(fileExt)) {
        htmlBody = fileContent;
      } else {
        throw new ConversionError(`Unsupported file type: ${fileExt}`);
      }

      // Apply template and return complete HTML document
      return await this.applyTemplate(htmlBody, options, inputFile);
      
    } catch (error) {
      throw new ConversionError(
        `Failed to process input file: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Converts Markdown to HTML using marked
   */
  private async convertMarkdownToHtml(markdown: string): Promise<string> {
    try {
      return marked(markdown);
    } catch (error) {
      throw new ConversionError(
        `Markdown parsing failed: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Applies CSS template to HTML content
   */
  private async applyTemplate(
    htmlBody: string, 
    options: ConversionOptions, 
    inputFile: string
  ): Promise<string> {
    // Get CSS template using the template manager
    const css = await this.templateManager.getTemplate(options.template);

    const title = this.extractTitle(htmlBody, inputFile);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${css}
    </style>
</head>
<body>
    <div class="document">
        ${htmlBody}
    </div>
</body>
</html>`;
  }

  /**
   * Get available built-in templates
   */
  getAvailableTemplates() {
    return this.templateManager.listBuiltinTemplates();
  }

  /**
   * Get template information
   */
  getTemplateInfo(templateName: string) {
    return this.templateManager.getTemplateInfo(templateName);
  }

  /**
   * Extracts title from HTML content or uses filename
   */
  private extractTitle(htmlContent: string, inputFile: string): string {
    // Try to extract title from first h1 tag
    const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match) {
      // Remove HTML tags from title
      return h1Match[1].replace(/<[^>]*>/g, '').trim();
    }

    // Fallback to filename without extension
    const filename = inputFile.split('/').pop() || inputFile;
    return filename.replace(/\.[^.]*$/, '');
  }

  /**
   * Builds PDF options from conversion options
   */
  private buildPdfOptions(options: ConversionOptions): PDFOptions {
    const pdfOptions: PDFOptions = {
      format: this.convertPdfFormat(options.format || 'A4'),
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      timeout: 30000
    };

    // Check if using a dark theme
    const isDarkTheme = this.isDarkTheme(options.template);

    // Apply margins if specified
    if (options.margins) {
      pdfOptions.margin = {
        top: options.margins.top || '20mm',
        right: options.margins.right || '20mm',
        bottom: options.margins.bottom || '20mm',
        left: options.margins.left || '20mm'
      };
    } else {
      // For dark themes, use zero margins to avoid white borders
      if (isDarkTheme) {
        pdfOptions.margin = {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        };
      } else {
        // Default margins for light themes
        pdfOptions.margin = {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        };
      }
    }

    return pdfOptions;
  }

  /**
   * Check if the template is a dark theme
   */
  private isDarkTheme(template?: string): boolean {
    if (!template) return false;
    
    const darkThemes = [
      'github-dark',
      'academic-dark',
      'minimal-dark',
      'modern-dark',
      'newspaper-dark'
    ];
    
    return darkThemes.includes(template.toLowerCase());
  }

  /**
   * Get the background color for dark themes
   */
  private getDarkThemeColor(template?: string): string {
    if (!template) return '#1a1a1a';
    
    const themeColors: Record<string, string> = {
      'github-dark': '#0d1117',
      'academic-dark': '#1a1a1a',
      'minimal-dark': '#1a1a1a',
      'modern-dark': '#0f172a',
      'newspaper-dark': '#1a1a1a'
    };
    
    return themeColors[template.toLowerCase()] || '#1a1a1a';
  }

  /**
   * Converts our PdfFormat to Puppeteer's format
   */
  private convertPdfFormat(format: PdfFormat): PaperFormat {
    const formatMap: Record<PdfFormat, PaperFormat> = {
      'A4': 'a4',
      'A3': 'a3',
      'A5': 'a5',
      'Letter': 'letter',
      'Legal': 'legal',
      'Tabloid': 'tabloid'
    };

    return formatMap[format] || 'a4';
  }

  /**
   * Configures the marked library for better HTML output
   */
  private configureMarked(): void {
    // Configure marked options
    marked.setOptions({
      breaks: true, // Convert \n to <br>
      gfm: true,    // GitHub Flavored Markdown
      silent: false // We want to know about errors
    });

    // Use simple extensions for styling
    marked.use({
      extensions: [
        {
          name: 'table',
          renderer: () => {
            // This will be handled by the default renderer but with CSS classes
            return false; // Let default handler process
          }
        }
      ]
    });
  }



  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      try {
        console.log('🌐 Closing browser...');
        
        // Close all pages first
        const pages = await this.browser.pages();
        await Promise.all(pages.map(page => page.close().catch(() => {})));
        
        // Close browser
        await this.browser.close();
        this.browser = null;
        console.log('✅ Browser closed successfully');
      } catch (error) {
        console.warn('⚠️  Error closing browser:', error);
        
        // Force kill browser process if normal close fails
        if (this.browser) {
          try {
            this.browser.process()?.kill('SIGKILL');
            this.browser = null;
            console.log('🔥 Browser process forcefully terminated');
          } catch (killError) {
            console.warn('⚠️  Could not kill browser process:', killError);
          }
        }
      }
    }
  }

  /**
   * Check if browser is running
   */
  isBrowserRunning(): boolean {
    return this.browser !== null && this.browser.connected;
  }

  /**
   * Get browser version info
   */
  async getBrowserInfo(): Promise<string> {
    if (!this.browser) {
      return 'Browser not initialized';
    }

    try {
      const version = await this.browser.version();
      return version;
    } catch (error) {
      return 'Could not get browser version';
    }
  }
}
