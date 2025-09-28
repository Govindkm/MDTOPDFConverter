import { readFile } from 'fs/promises';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { ConversionError } from '../types/index.js';
import { ConfigManager } from './configManager.js';

export type BuiltinTemplate = 
  | 'github' | 'github-dark'
  | 'academic' | 'academic-dark' 
  | 'minimal' | 'minimal-dark'
  | 'modern' | 'modern-dark'
  | 'newspaper' | 'newspaper-dark';

export interface TemplateInfo {
  name: string;
  description: string;
  author: string;
  preview?: string;
}

/**
 * Manages CSS templates for PDF generation with configuration support
 */
export class TemplateManager {
  private builtinTemplates: Map<BuiltinTemplate, TemplateInfo>;
  private templatesCache: Map<string, string>;
  private configManager: ConfigManager;

  constructor() {
    this.builtinTemplates = new Map();
    this.templatesCache = new Map();
    this.configManager = new ConfigManager();
    this.initializeBuiltinTemplates();
  }

  /**
   * Initialize built-in template metadata with light and dark variants
   */
  private initializeBuiltinTemplates(): void {
    // GitHub Templates
    this.builtinTemplates.set('github', {
      name: 'GitHub',
      description: 'GitHub-style markdown with clean typography (Light)',
      author: 'GitHub',
      preview: 'Clean white background with GitHub fonts and spacing'
    });

    this.builtinTemplates.set('github-dark', {
      name: 'GitHub Dark',
      description: 'GitHub-style markdown with dark theme',
      author: 'GitHub',
      preview: 'Dark background with light text and GitHub styling'
    });

    // Academic Templates
    this.builtinTemplates.set('academic', {
      name: 'Academic',
      description: 'Academic paper style with proper citations and typography (Light)',
      author: 'MDToPDF',
      preview: 'Professional academic layout with serif fonts on white'
    });

    this.builtinTemplates.set('academic-dark', {
      name: 'Academic Dark',
      description: 'Academic paper style with dark theme',
      author: 'MDToPDF',
      preview: 'Professional academic layout with dark background'
    });

    // Minimal Templates
    this.builtinTemplates.set('minimal', {
      name: 'Minimal',
      description: 'Clean and minimal design with focus on content (Light)',
      author: 'MDToPDF',
      preview: 'Minimalist black text on white with subtle styling'
    });

    this.builtinTemplates.set('minimal-dark', {
      name: 'Minimal Dark',
      description: 'Clean and minimal design with dark theme',
      author: 'MDToPDF',
      preview: 'Minimalist light text on dark with subtle styling'
    });

    // Modern Templates
    this.builtinTemplates.set('modern', {
      name: 'Modern',
      description: 'Modern design with colors and enhanced typography (Light)',
      author: 'MDToPDF',
      preview: 'Contemporary design with accent colors and modern fonts'
    });

    this.builtinTemplates.set('modern-dark', {
      name: 'Modern Dark',
      description: 'Modern design with dark theme and vibrant accents',
      author: 'MDToPDF',
      preview: 'Contemporary dark design with neon accents and modern fonts'
    });

    // Newspaper Templates
    this.builtinTemplates.set('newspaper', {
      name: 'Newspaper',
      description: 'Newspaper-style layout with columns and classic typography (Light)',
      author: 'MDToPDF',
      preview: 'Multi-column layout with newspaper-style headers'
    });

    this.builtinTemplates.set('newspaper-dark', {
      name: 'Newspaper Dark',
      description: 'Newspaper-style layout with dark theme',
      author: 'MDToPDF',
      preview: 'Multi-column dark layout with vintage newspaper styling'
    });
  }

  /**
   * Get template CSS content with configuration support
   */
  async getTemplate(templateName?: string): Promise<string> {
    // Initialize config manager if needed
    try {
      await this.configManager.initialize();
    } catch (error) {
      console.warn('⚠️  Could not initialize config:', error);
    }

    // Use default template if none specified
    if (!templateName) {
      const config = this.configManager.getConfig();
      templateName = config.defaultTemplate || 'github';
    }

    // Check if it's a built-in template
    if (this.isBuiltinTemplate(templateName)) {
      return this.getBuiltinTemplate(templateName as BuiltinTemplate);
    }

    // Check if it's a custom template
    const customTemplatePath = await this.configManager.getCustomTemplate(templateName);
    if (customTemplatePath) {
      return this.loadCustomTemplate(customTemplatePath);
    }

    // Try to load as custom template file
    return this.loadCustomTemplate(templateName);
  }

  /**
   * Check if template name is a built-in template
   */
  isBuiltinTemplate(templateName: string): boolean {
    return this.builtinTemplates.has(templateName as BuiltinTemplate);
  }

  /**
   * Get built-in template CSS
   */
  private async getBuiltinTemplate(template: BuiltinTemplate): Promise<string> {
    // Check cache first
    if (this.templatesCache.has(template)) {
      return this.templatesCache.get(template)!;
    }

    let css: string;
    switch (template) {
      case 'github':
        css = this.getGitHubTemplate();
        break;
      case 'github-dark':
        css = this.getGitHubDarkTemplate();
        break;
      case 'academic':
        css = this.getAcademicTemplate();
        break;
      case 'academic-dark':
        css = this.getAcademicDarkTemplate();
        break;
      case 'minimal':
        css = this.getMinimalTemplate();
        break;
      case 'minimal-dark':
        css = this.getMinimalDarkTemplate();
        break;
      case 'modern':
        css = this.getModernTemplate();
        break;
      case 'modern-dark':
        css = this.getModernDarkTemplate();
        break;
      case 'newspaper':
        css = this.getNewspaperTemplate();
        break;
      case 'newspaper-dark':
        css = this.getNewspaperDarkTemplate();
        break;
      default:
        css = this.getGitHubTemplate();
    }

    // Cache the template
    this.templatesCache.set(template, css);
    return css;
  }

  /**
   * Load custom template from file
   */
  private async loadCustomTemplate(templatePath: string): Promise<string> {
    try {
      // Check cache first
      if (this.templatesCache.has(templatePath)) {
        return this.templatesCache.get(templatePath)!;
      }

      const resolvedPath = resolve(templatePath);
      
      if (!existsSync(resolvedPath)) {
        throw new ConversionError(`Template file not found: ${templatePath}`);
      }

      const css = await readFile(resolvedPath, 'utf-8');
      
      // Cache the template
      this.templatesCache.set(templatePath, css);
      return css;
      
    } catch (error) {
      console.warn(`⚠️  Could not load custom template: ${templatePath}. Using GitHub template.`);
      return this.getBuiltinTemplate('github');
    }
  }

  /**
   * List available built-in templates
   */
  listBuiltinTemplates(): Array<{ id: BuiltinTemplate; info: TemplateInfo }> {
    return Array.from(this.builtinTemplates.entries()).map(([id, info]) => ({ id, info }));
  }

  /**
   * GitHub-style template (enhanced version of current default)
   */
  private getGitHubTemplate(): string {
    return `
      /* GitHub-style Template */
      * {
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #24292f;
        background-color: #ffffff;
        max-width: none;
        margin: 0;
        padding: 0;
        font-size: 16px;
      }

      .document {
        padding: 45px;
        max-width: 100%;
      }

      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
        page-break-after: avoid;
      }

      h1 {
        font-size: 2em;
        font-weight: 600;
        padding-bottom: 0.3em;
        border-bottom: 1px solid #d0d7de;
        margin-bottom: 16px;
      }

      h2 {
        font-size: 1.5em;
        font-weight: 600;
        padding-bottom: 0.3em;
        border-bottom: 1px solid #d0d7de;
      }

      h3 {
        font-size: 1.25em;
        font-weight: 600;
      }

      h4, h5, h6 {
        font-size: 1em;
        font-weight: 600;
      }

      /* Paragraphs */
      p {
        margin-top: 0;
        margin-bottom: 16px;
        orphans: 3;
        widows: 3;
      }

      /* Lists */
      ul, ol {
        margin-top: 0;
        margin-bottom: 16px;
        padding-left: 2em;
      }

      li + li {
        margin-top: 0.25em;
      }

      /* Tables */
      table {
        border-spacing: 0;
        border-collapse: collapse;
        display: block;
        width: max-content;
        max-width: 100%;
        overflow: auto;
        margin-bottom: 16px;
      }

      table th,
      table td {
        padding: 6px 13px;
        border: 1px solid #d0d7de;
      }

      table th {
        font-weight: 600;
        background-color: #f6f8fa;
      }

      table tr {
        background-color: #ffffff;
        border-top: 1px solid #c6cbd1;
      }

      table tr:nth-child(2n) {
        background-color: #f6f8fa;
      }

      /* Code */
      code, tt {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: rgba(175,184,193,0.2);
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
      }

      pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #f6f8fa;
        border-radius: 6px;
        margin-bottom: 16px;
        page-break-inside: avoid;
      }

      pre code {
        display: inline;
        max-width: auto;
        padding: 0;
        margin: 0;
        overflow: visible;
        line-height: inherit;
        word-wrap: normal;
        background-color: transparent;
        border: 0;
      }

      /* Blockquotes */
      blockquote {
        padding: 0 1em;
        color: #656d76;
        border-left: 0.25em solid #d0d7de;
        margin: 0 0 16px 0;
      }

      blockquote > :first-child {
        margin-top: 0;
      }

      blockquote > :last-child {
        margin-bottom: 0;
      }

      /* Links */
      a {
        color: #0969da;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      /* Images */
      img {
        max-width: 100%;
        height: auto;
        box-sizing: content-box;
      }

      /* Horizontal rules */
      hr {
        height: 0.25em;
        padding: 0;
        margin: 24px 0;
        background-color: #d0d7de;
        border: 0;
      }

      /* Print optimizations */
      @media print {
        body {
          font-size: 12pt;
        }
        
        h1 { font-size: 18pt; }
        h2 { font-size: 16pt; }
        h3 { font-size: 14pt; }
        
        pre, code {
          page-break-inside: avoid;
        }
        
        img {
          page-break-inside: avoid;
        }
      }
    `;
  }

  /**
   * Academic paper template
   */
  private getAcademicTemplate(): string {
    return `
      /* Academic Template */
      * {
        box-sizing: border-box;
      }

      body {
        font-family: "Times New Roman", Times, serif;
        line-height: 1.8;
        color: #000000;
        background-color: #ffffff;
        max-width: none;
        margin: 0;
        padding: 0;
        font-size: 12pt;
      }

      .document {
        padding: 1in;
        max-width: 100%;
      }

      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        font-family: Arial, sans-serif;
        font-weight: bold;
        page-break-after: avoid;
        color: #000000;
      }

      h1 {
        font-size: 18pt;
        text-align: center;
        margin: 0 0 24pt 0;
        page-break-after: avoid;
      }

      h2 {
        font-size: 14pt;
        margin: 18pt 0 12pt 0;
        border-bottom: none;
      }

      h3 {
        font-size: 12pt;
        margin: 12pt 0 6pt 0;
      }

      h4, h5, h6 {
        font-size: 12pt;
        font-style: italic;
        margin: 12pt 0 6pt 0;
      }

      /* Paragraphs */
      p {
        margin: 0 0 12pt 0;
        text-align: justify;
        text-indent: 0;
        orphans: 3;
        widows: 3;
      }

      /* Lists */
      ul, ol {
        margin: 0 0 12pt 0;
        padding-left: 36pt;
      }

      li {
        margin-bottom: 6pt;
      }

      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 12pt auto;
        font-size: 10pt;
      }

      table th,
      table td {
        border: 1px solid #000000;
        padding: 6pt 12pt;
        text-align: left;
        vertical-align: top;
      }

      table th {
        background-color: #f0f0f0;
        font-weight: bold;
        text-align: center;
      }

      table caption {
        caption-side: bottom;
        font-size: 10pt;
        font-style: italic;
        margin-top: 6pt;
        text-align: center;
      }

      /* Code */
      code {
        font-family: "Courier New", Courier, monospace;
        font-size: 10pt;
        background-color: #f5f5f5;
        padding: 2pt 4pt;
        border: 1px solid #cccccc;
      }

      pre {
        font-family: "Courier New", Courier, monospace;
        font-size: 10pt;
        background-color: #f5f5f5;
        border: 1px solid #cccccc;
        padding: 12pt;
        margin: 12pt 0;
        page-break-inside: avoid;
        line-height: 1.4;
      }

      /* Blockquotes */
      blockquote {
        margin: 12pt 36pt 12pt 36pt;
        font-style: italic;
        border: none;
        padding: 0;
      }

      /* Links */
      a {
        color: #000000;
        text-decoration: underline;
      }

      /* Images */
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 12pt auto;
      }

      /* Abstract styling */
      .abstract {
        margin: 24pt 72pt;
        font-size: 11pt;
        text-align: justify;
      }

      .abstract h2 {
        text-align: center;
        font-size: 12pt;
        margin-bottom: 12pt;
      }

      /* References */
      .references ol {
        padding-left: 0;
        list-style: none;
        counter-reset: ref-counter;
      }

      .references li {
        counter-increment: ref-counter;
        margin-bottom: 6pt;
        text-indent: -36pt;
        padding-left: 36pt;
      }

      .references li::before {
        content: "[" counter(ref-counter) "] ";
        font-weight: bold;
      }

      /* Print optimizations */
      @media print {
        .document {
          padding: 0.75in;
        }
        
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
        }
        
        pre, table, img {
          page-break-inside: avoid;
        }
      }
    `;
  }

  /**
   * Minimal template
   */
  private getMinimalTemplate(): string {
    return `
      /* Minimal Template */
      * {
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.7;
        color: #333333;
        background-color: #ffffff;
        max-width: none;
        margin: 0;
        padding: 0;
        font-size: 14px;
      }

      .document {
        padding: 60px;
        max-width: 100%;
      }

      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        font-weight: 300;
        margin: 40px 0 20px 0;
        page-break-after: avoid;
        color: #222222;
      }

      h1 {
        font-size: 2.5em;
        font-weight: 100;
        margin-bottom: 30px;
      }

      h2 {
        font-size: 1.8em;
        margin-top: 50px;
      }

      h3 {
        font-size: 1.3em;
      }

      h4, h5, h6 {
        font-size: 1em;
        font-weight: 400;
      }

      /* Paragraphs */
      p {
        margin: 0 0 20px 0;
        orphans: 3;
        widows: 3;
      }

      /* Lists */
      ul, ol {
        margin: 0 0 20px 0;
        padding-left: 30px;
      }

      li {
        margin-bottom: 8px;
      }

      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 30px 0;
        border: none;
      }

      table th,
      table td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #eeeeee;
        border-left: none;
        border-right: none;
      }

      table th {
        font-weight: 500;
        border-bottom: 2px solid #333333;
        background: none;
      }

      table tr:last-child td {
        border-bottom: none;
      }

      /* Code */
      code {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 0.9em;
        background: none;
        color: #666666;
        padding: 0;
        border: none;
        border-radius: 0;
      }

      pre {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 0.85em;
        line-height: 1.6;
        background: #fafafa;
        border: none;
        border-left: 3px solid #333333;
        padding: 20px;
        margin: 30px 0;
        page-break-inside: avoid;
      }

      pre code {
        color: #333333;
      }

      /* Blockquotes */
      blockquote {
        margin: 30px 0;
        padding: 0 0 0 30px;
        border-left: 3px solid #333333;
        font-style: italic;
        color: #666666;
      }

      /* Links */
      a {
        color: #333333;
        text-decoration: underline;
        text-decoration-color: #cccccc;
      }

      a:hover {
        text-decoration-color: #333333;
      }

      /* Images */
      img {
        max-width: 100%;
        height: auto;
        margin: 30px 0;
      }

      /* Horizontal rules */
      hr {
        border: none;
        height: 1px;
        background-color: #eeeeee;
        margin: 50px 0;
      }

      /* Print optimizations */
      @media print {
        body {
          font-size: 11pt;
        }
        
        .document {
          padding: 40px;
        }
        
        h1 { font-size: 20pt; }
        h2 { font-size: 16pt; }
        h3 { font-size: 14pt; }
      }
    `;
  }

  /**
   * Modern template with colors
   */
  private getModernTemplate(): string {
    return `
      /* Modern Template */
      * {
        box-sizing: border-box;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #1a202c;
        background-color: #ffffff;
        max-width: none;
        margin: 0;
        padding: 0;
        font-size: 15px;
      }

      .document {
        padding: 50px;
        max-width: 100%;
      }

      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
        margin: 32px 0 16px 0;
        page-break-after: avoid;
        color: #2d3748;
      }

      h1 {
        font-size: 2.25em;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 24px;
      }

      h2 {
        font-size: 1.75em;
        color: #4299e1;
        position: relative;
        padding-bottom: 8px;
      }

      h2::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 50px;
        height: 3px;
        background: linear-gradient(90deg, #4299e1, #63b3ed);
      }

      h3 {
        font-size: 1.375em;
        color: #38b2ac;
      }

      h4, h5, h6 {
        font-size: 1.125em;
        color: #718096;
      }

      /* Paragraphs */
      p {
        margin: 0 0 18px 0;
        orphans: 3;
        widows: 3;
      }

      /* Lists */
      ul, ol {
        margin: 0 0 18px 0;
        padding-left: 28px;
      }

      li {
        margin-bottom: 6px;
        position: relative;
      }

      ul li::marker {
        color: #4299e1;
      }

      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 24px 0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        border-radius: 8px;
        overflow: hidden;
      }

      table th,
      table td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
      }

      table th {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        border-bottom: none;
      }

      table tr:nth-child(even) {
        background-color: #f7fafc;
      }

      table tr:hover {
        background-color: #edf2f7;
      }

      table tr:last-child td {
        border-bottom: none;
      }

      /* Code */
      code {
        font-family: 'Fira Code', 'SF Mono', Monaco, monospace;
        font-size: 0.875em;
        background: linear-gradient(135deg, #667eea20, #764ba220);
        color: #553c9a;
        padding: 3px 6px;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
      }

      pre {
        font-family: 'Fira Code', 'SF Mono', Monaco, monospace;
        font-size: 0.85em;
        line-height: 1.5;
        background: #1a202c;
        color: #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        margin: 24px 0;
        page-break-inside: avoid;
        position: relative;
        overflow: hidden;
      }

      pre::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
      }

      pre code {
        background: none;
        color: #e2e8f0;
        padding: 0;
        border: none;
      }

      /* Blockquotes */
      blockquote {
        margin: 24px 0;
        padding: 16px 24px;
        background: linear-gradient(135deg, #667eea10, #764ba210);
        border-left: 4px solid #4299e1;
        border-radius: 0 8px 8px 0;
        font-style: italic;
        color: #4a5568;
        position: relative;
      }

      blockquote::before {
        content: '"';
        font-size: 4em;
        color: #4299e1;
        position: absolute;
        top: -10px;
        left: 10px;
        opacity: 0.3;
      }

      /* Links */
      a {
        color: #4299e1;
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-color 0.2s;
      }

      a:hover {
        border-bottom-color: #4299e1;
      }

      /* Images */
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin: 24px 0;
      }

      /* Horizontal rules */
      hr {
        border: none;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        margin: 40px 0;
        border-radius: 2px;
      }

      /* Badges/Tags */
      .badge {
        display: inline-block;
        padding: 4px 8px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border-radius: 12px;
        font-size: 0.75em;
        font-weight: 500;
        margin: 2px;
      }

      /* Print optimizations */
      @media print {
        body {
          font-size: 12pt;
        }
        
        h1, h2, h3 {
          color: #000000 !important;
          -webkit-text-fill-color: initial !important;
        }
        
        table {
          box-shadow: none;
        }
        
        img {
          box-shadow: none;
        }
        
        pre {
          background: #f5f5f5 !important;
          color: #000000 !important;
        }
        
        blockquote {
          background: #f5f5f5 !important;
        }
      }
    `;
  }

  /**
   * Newspaper template
   */
  private getNewspaperTemplate(): string {
    return `
      /* Newspaper Template */
      * {
        box-sizing: border-box;
      }

      body {
        font-family: 'Times New Roman', Georgia, serif;
        line-height: 1.5;
        color: #000000;
        background-color: #ffffff;
        max-width: none;
        margin: 0;
        padding: 0;
        font-size: 11pt;
        column-count: 2;
        column-gap: 30px;
        column-rule: 1px solid #cccccc;
      }

      .document {
        padding: 20px;
        max-width: 100%;
      }

      /* Headings */
      h1 {
        font-family: 'Arial Black', Arial, sans-serif;
        font-size: 28pt;
        font-weight: 900;
        text-transform: uppercase;
        text-align: center;
        margin: 0 0 20px 0;
        column-span: all;
        border-top: 3px solid #000000;
        border-bottom: 1px solid #000000;
        padding: 15px 0 10px 0;
        letter-spacing: 2px;
      }

      h2 {
        font-family: Arial, sans-serif;
        font-size: 16pt;
        font-weight: bold;
        margin: 20px 0 10px 0;
        text-transform: uppercase;
        border-bottom: 2px solid #000000;
        padding-bottom: 5px;
        break-after: avoid;
      }

      h3 {
        font-family: Arial, sans-serif;
        font-size: 14pt;
        font-weight: bold;
        margin: 15px 0 8px 0;
        break-after: avoid;
      }

      h4, h5, h6 {
        font-family: Arial, sans-serif;
        font-size: 12pt;
        font-weight: bold;
        margin: 12px 0 6px 0;
        break-after: avoid;
      }

      /* Paragraphs */
      p {
        margin: 0 0 12px 0;
        text-align: justify;
        text-indent: 15px;
        orphans: 3;
        widows: 3;
      }

      p:first-of-type {
        text-indent: 0;
      }

      p:first-of-type::first-letter {
        font-size: 3em;
        font-weight: bold;
        float: left;
        line-height: 1;
        margin: 0 8px 0 0;
        padding: 0;
      }

      /* Lists */
      ul, ol {
        margin: 0 0 12px 0;
        padding-left: 20px;
        break-inside: avoid;
      }

      li {
        margin-bottom: 4px;
      }

      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 15px 0;
        font-size: 9pt;
        break-inside: avoid;
        column-span: all;
      }

      table th,
      table td {
        border: 1px solid #000000;
        padding: 6px 8px;
        text-align: left;
      }

      table th {
        background-color: #000000;
        color: #ffffff;
        font-weight: bold;
        text-align: center;
      }

      /* Code */
      code {
        font-family: 'Courier New', monospace;
        font-size: 9pt;
        background-color: #f0f0f0;
        padding: 2px 4px;
        border: 1px solid #cccccc;
      }

      pre {
        font-family: 'Courier New', monospace;
        font-size: 9pt;
        background-color: #f0f0f0;
        border: 1px solid #000000;
        padding: 10px;
        margin: 15px 0;
        break-inside: avoid;
        column-span: all;
      }

      /* Blockquotes */
      blockquote {
        margin: 15px 0;
        padding: 10px 15px;
        background-color: #f8f8f8;
        border: 1px solid #cccccc;
        font-style: italic;
        break-inside: avoid;
      }

      blockquote::before {
        content: '"';
        font-size: 2em;
        font-weight: bold;
        float: left;
        margin-right: 5px;
      }

      /* Links */
      a {
        color: #000000;
        text-decoration: underline;
        font-weight: bold;
      }

      /* Images */
      img {
        max-width: 100%;
        height: auto;
        border: 1px solid #000000;
        margin: 10px 0;
        break-inside: avoid;
      }

      /* Article sections */
      .article-meta {
        font-family: Arial, sans-serif;
        font-size: 9pt;
        color: #666666;
        margin-bottom: 15px;
        column-span: all;
        text-align: center;
        border-bottom: 1px solid #cccccc;
        padding-bottom: 10px;
      }

      .byline {
        font-family: Arial, sans-serif;
        font-size: 10pt;
        font-weight: bold;
        margin-bottom: 10px;
        text-transform: uppercase;
      }

      .dateline {
        font-family: Arial, sans-serif;
        font-size: 9pt;
        color: #666666;
        margin-bottom: 15px;
      }

      .pullquote {
        font-size: 14pt;
        font-weight: bold;
        text-align: center;
        margin: 20px 0;
        padding: 15px;
        border-top: 2px solid #000000;
        border-bottom: 2px solid #000000;
        column-span: all;
        background-color: #f8f8f8;
      }

      /* Print optimizations */
      @media print {
        body {
          column-count: 3;
          column-gap: 20px;
          font-size: 10pt;
        }
        
        .document {
          padding: 15px;
        }
        
        h1 {
          font-size: 24pt;
        }
        
        h2 {
          font-size: 14pt;
        }
        
        h3 {
          font-size: 12pt;
        }
        
        table, pre, img, .pullquote {
          break-inside: avoid;
        }
      }
    `;
  }

  /**
   * GitHub Dark template
   */
  private getGitHubDarkTemplate(): string {
    return `
      /* GitHub Dark Template - True Dark Theme */
      * {
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #f0f6fc;
        background-color: #0d1117 !important;
        max-width: none;
        margin: 0;
        padding: 0;
        font-size: 16px;
      }

      .document {
        padding: 45px;
        max-width: 100%;
        background-color: #0d1117 !important;
        min-height: 100vh;
      }

      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
        page-break-after: avoid;
        color: #f0f6fc;
      }

      h1 {
        font-size: 2em;
        font-weight: 600;
        padding-bottom: 0.3em;
        border-bottom: 1px solid #30363d;
        margin-bottom: 16px;
      }

      h2 {
        font-size: 1.5em;
        font-weight: 600;
        padding-bottom: 0.3em;
        border-bottom: 1px solid #30363d;
      }

      h3 {
        font-size: 1.25em;
        font-weight: 600;
      }

      h4, h5, h6 {
        font-size: 1em;
        font-weight: 600;
      }

      /* Paragraphs */
      p {
        margin-top: 0;
        margin-bottom: 16px;
        orphans: 3;
        widows: 3;
        color: #e6edf3;
      }

      /* Lists */
      ul, ol {
        margin-top: 0;
        margin-bottom: 16px;
        padding-left: 2em;
        color: #e6edf3;
      }

      li + li {
        margin-top: 0.25em;
      }

      /* Tables */
      table {
        border-spacing: 0;
        border-collapse: collapse;
        display: block;
        width: max-content;
        max-width: 100%;
        overflow: auto;
        margin-bottom: 16px;
      }

      table th,
      table td {
        padding: 6px 13px;
        border: 1px solid #30363d;
        color: #e6edf3;
      }

      table th {
        font-weight: 600;
        background-color: #21262d;
      }

      table tr {
        background-color: #0d1117;
        border-top: 1px solid #30363d;
      }

      table tr:nth-child(2n) {
        background-color: #161b22;
      }

      /* Code */
      code, tt {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: rgba(110,118,129,0.4);
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
        color: #f0f6fc;
      }

      pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #161b22;
        border-radius: 6px;
        margin-bottom: 16px;
        page-break-inside: avoid;
      }

      pre code {
        display: inline;
        max-width: auto;
        padding: 0;
        margin: 0;
        overflow: visible;
        line-height: inherit;
        word-wrap: normal;
        background-color: transparent;
        border: 0;
        color: #f0f6fc;
      }

      /* Blockquotes */
      blockquote {
        padding: 0 1em;
        color: #8b949e;
        border-left: 0.25em solid #30363d;
        margin: 0 0 16px 0;
      }

      blockquote > :first-child {
        margin-top: 0;
      }

      blockquote > :last-child {
        margin-bottom: 0;
      }

      /* Links */
      a {
        color: #58a6ff;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      /* Images */
      img {
        max-width: 100%;
        height: auto;
        box-sizing: content-box;
      }

      /* Horizontal rules */
      hr {
        height: 0.25em;
        padding: 0;
        margin: 24px 0;
        background-color: #30363d;
        border: 0;
      }

      /* Print optimizations - Maintain dark theme */
      @media print {
        body {
          font-size: 12pt;
          background-color: #0d1117 !important;
          color: #f0f6fc !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .document {
          background-color: #0d1117 !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
          color: #f0f6fc !important;
        }
        
        p, li {
          color: #e6edf3 !important;
        }
        
        table {
          background-color: #0d1117 !important;
        }
        
        table th, table td {
          color: #e6edf3 !important;
          border: 1px solid #30363d !important;
          background-color: inherit !important;
        }
        
        table th {
          background-color: #21262d !important;
        }
        
        table tr:nth-child(2n) {
          background-color: #161b22 !important;
        }
        
        code, pre code {
          color: #f0f6fc !important;
          background-color: rgba(110,118,129,0.4) !important;
        }
        
        pre {
          background-color: #161b22 !important;
        }
        
        blockquote {
          color: #8b949e !important;
          border-left-color: #30363d !important;
        }
        
        hr {
          background-color: #30363d !important;
        }
        
        h1 { font-size: 18pt; }
        h2 { font-size: 16pt; }
        h3 { font-size: 14pt; }
      }
    `;
  }

  /**
   * Academic Dark template
   */
  private getAcademicDarkTemplate(): string {
    return `
      /* Academic Dark Template */
      * {
        box-sizing: border-box;
      }

      body {
        font-family: "Times New Roman", Times, serif;
        line-height: 1.8;
        color: #e8e8e8;
        background-color: #1a1a1a !important;
        max-width: none;
        margin: 0;
        padding: 0;
        font-size: 12pt;
      }

      .document {
        padding: 1in;
        max-width: 100%;
        background-color: #1a1a1a !important;
        min-height: 100vh;
      }

      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        font-family: Arial, sans-serif;
        font-weight: bold;
        page-break-after: avoid;
        color: #ffffff;
      }

      h1 {
        font-size: 18pt;
        text-align: center;
        margin: 0 0 24pt 0;
        page-break-after: avoid;
      }

      h2 {
        font-size: 14pt;
        margin: 18pt 0 12pt 0;
        border-bottom: none;
        color: #cccccc;
      }

      h3 {
        font-size: 12pt;
        margin: 12pt 0 6pt 0;
        color: #cccccc;
      }

      h4, h5, h6 {
        font-size: 12pt;
        font-style: italic;
        margin: 12pt 0 6pt 0;
        color: #bbbbbb;
      }

      /* Paragraphs */
      p {
        margin: 0 0 12pt 0;
        text-align: justify;
        text-indent: 0;
        orphans: 3;
        widows: 3;
        color: #e8e8e8;
      }

      /* Lists */
      ul, ol {
        margin: 0 0 12pt 0;
        padding-left: 36pt;
        color: #e8e8e8;
      }

      li {
        margin-bottom: 6pt;
      }

      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 12pt auto;
        font-size: 10pt;
      }

      table th,
      table td {
        border: 1px solid #555555;
        padding: 6pt 12pt;
        text-align: left;
        vertical-align: top;
        color: #e8e8e8;
      }

      table th {
        background-color: #2a2a2a;
        font-weight: bold;
        text-align: center;
        color: #ffffff;
      }

      table caption {
        caption-side: bottom;
        font-size: 10pt;
        font-style: italic;
        margin-top: 6pt;
        text-align: center;
        color: #cccccc;
      }

      /* Code */
      code {
        font-family: "Courier New", Courier, monospace;
        font-size: 10pt;
        background-color: #2a2a2a;
        color: #ffffff;
        padding: 2pt 4pt;
        border: 1px solid #555555;
      }

      pre {
        font-family: "Courier New", Courier, monospace;
        font-size: 10pt;
        background-color: #2a2a2a;
        color: #ffffff;
        border: 1px solid #555555;
        padding: 12pt;
        margin: 12pt 0;
        page-break-inside: avoid;
        line-height: 1.4;
      }

      /* Blockquotes */
      blockquote {
        margin: 12pt 36pt 12pt 36pt;
        font-style: italic;
        border: none;
        padding: 0;
        color: #cccccc;
      }

      /* Links */
      a {
        color: #66ccff;
        text-decoration: underline;
      }

      /* Images */
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 12pt auto;
      }

      /* Print optimizations - Maintain dark theme */
      @media print {
        body {
          background-color: #1a1a1a !important;
          color: #e8e8e8 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .document {
          background-color: #1a1a1a !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
          color: #ffffff !important;
        }
        
        h2 {
          color: #cccccc !important;
        }
        
        h3 {
          color: #cccccc !important;
        }
        
        h4, h5, h6 {
          color: #bbbbbb !important;
        }
        
        p, li {
          color: #e8e8e8 !important;
        }
        
        table {
          background-color: #1a1a1a !important;
        }
        
        table th, table td {
          color: #e8e8e8 !important;
          border: 1px solid #555555 !important;
          background-color: inherit !important;
        }
        
        table th {
          background-color: #2a2a2a !important;
          color: #ffffff !important;
        }
        
        table caption {
          color: #cccccc !important;
        }
        
        code {
          background-color: #2a2a2a !important;
          color: #ffffff !important;
          border: 1px solid #555555 !important;
        }
        
        pre {
          background-color: #2a2a2a !important;
          color: #ffffff !important;
          border: 1px solid #555555 !important;
        }
        
        blockquote {
          color: #cccccc !important;
        }
        
        a {
          color: #66ccff !important;
        }
      }
    `;
  }

  /**
   * Minimal Dark template
   */
  private getMinimalDarkTemplate(): string {
    return `
      /* Minimal Dark Template */
      * {
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.7;
        color: #e8e8e8;
        background-color: #1a1a1a !important;
        max-width: none;
        margin: 0;
        padding: 0;
        font-size: 14px;
      }

      .document {
        padding: 60px;
        max-width: 100%;
        background-color: #1a1a1a !important;
        min-height: 100vh;
      }

      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        font-weight: 300;
        margin: 40px 0 20px 0;
        page-break-after: avoid;
        color: #ffffff;
      }

      h1 {
        font-size: 2.5em;
        font-weight: 100;
        margin-bottom: 30px;
      }

      h2 {
        font-size: 1.8em;
        margin-top: 50px;
        color: #f0f0f0;
      }

      h3 {
        font-size: 1.3em;
        color: #e0e0e0;
      }

      h4, h5, h6 {
        font-size: 1em;
        font-weight: 400;
        color: #d0d0d0;
      }

      /* Paragraphs */
      p {
        margin: 0 0 20px 0;
        orphans: 3;
        widows: 3;
        color: #e8e8e8;
      }

      /* Lists */
      ul, ol {
        margin: 0 0 20px 0;
        padding-left: 30px;
        color: #e8e8e8;
      }

      li {
        margin-bottom: 8px;
      }

      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 30px 0;
        border: none;
      }

      table th,
      table td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #333333;
        border-left: none;
        border-right: none;
        color: #e8e8e8;
      }

      table th {
        font-weight: 500;
        border-bottom: 2px solid #ffffff;
        background: none;
        color: #ffffff;
      }

      table tr:last-child td {
        border-bottom: none;
      }

      /* Code */
      code {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 0.9em;
        background: none;
        color: #aaaaaa;
        padding: 0;
        border: none;
        border-radius: 0;
      }

      pre {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        font-size: 0.85em;
        line-height: 1.6;
        background: #2a2a2a;
        border: none;
        border-left: 3px solid #ffffff;
        padding: 20px;
        margin: 30px 0;
        page-break-inside: avoid;
      }

      pre code {
        color: #e8e8e8;
      }

      /* Blockquotes */
      blockquote {
        margin: 30px 0;
        padding: 0 0 0 30px;
        border-left: 3px solid #ffffff;
        font-style: italic;
        color: #aaaaaa;
      }

      /* Links */
      a {
        color: #ffffff;
        text-decoration: underline;
        text-decoration-color: #666666;
      }

      a:hover {
        text-decoration-color: #ffffff;
      }

      /* Images */
      img {
        max-width: 100%;
        height: auto;
        margin: 30px 0;
      }

      /* Horizontal rules */
      hr {
        border: none;
        height: 1px;
        background-color: #333333;
        margin: 50px 0;
      }

      /* Print optimizations - Maintain dark theme */
      @media print {
        body {
          background-color: #1a1a1a !important;
          color: #e8e8e8 !important;
          font-size: 11pt;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .document {
          padding: 40px;
          background-color: #1a1a1a !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
          color: #ffffff !important;
        }
        
        h2 {
          color: #f0f0f0 !important;
        }
        
        h3 {
          color: #e0e0e0 !important;
        }
        
        h4, h5, h6 {
          color: #d0d0d0 !important;
        }
        
        p, li {
          color: #e8e8e8 !important;
        }
        
        table th, table td {
          color: #e8e8e8 !important;
          border-bottom: 1px solid #333333 !important;
          background-color: inherit !important;
        }
        
        table th {
          color: #ffffff !important;
          border-bottom: 2px solid #ffffff !important;
        }
        
        code {
          color: #aaaaaa !important;
        }
        
        pre {
          background: #2a2a2a !important;
          color: #e8e8e8 !important;
          border-left: 3px solid #ffffff !important;
        }
        
        blockquote {
          color: #aaaaaa !important;
          border-left: 3px solid #ffffff !important;
        }
        
        a {
          color: #ffffff !important;
        }
        
        hr {
          background-color: #333333 !important;
        }
        
        h1 { font-size: 20pt; }
        h2 { font-size: 16pt; }
        h3 { font-size: 14pt; }
      }
    `;
  }

  /**
   * Modern Dark template
   */
  private getModernDarkTemplate(): string {
    return `
      /* Modern Dark Template */
      * {
        box-sizing: border-box;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #e2e8f0;
        background-color: #0f172a !important;
        max-width: none;
        margin: 0;
        padding: 0;
        font-size: 15px;
      }

      .document {
        padding: 50px;
        max-width: 100%;
        background-color: #0f172a !important;
        min-height: 100vh;
      }

      /* Headings */
      h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
        margin: 32px 0 16px 0;
        page-break-after: avoid;
        color: #f1f5f9;
      }

      h1 {
        font-size: 2.25em;
        background: linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 24px;
      }

      h2 {
        font-size: 1.75em;
        color: #38bdf8;
        position: relative;
        padding-bottom: 8px;
      }

      h2::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 50px;
        height: 3px;
        background: linear-gradient(90deg, #38bdf8, #0ea5e9);
      }

      h3 {
        font-size: 1.375em;
        color: #06b6d4;
      }

      h4, h5, h6 {
        font-size: 1.125em;
        color: #64748b;
      }

      /* Paragraphs */
      p {
        margin: 0 0 18px 0;
        orphans: 3;
        widows: 3;
        color: #cbd5e1;
      }

      /* Lists */
      ul, ol {
        margin: 0 0 18px 0;
        padding-left: 28px;
        color: #cbd5e1;
      }

      li {
        margin-bottom: 6px;
        position: relative;
      }

      ul li::marker {
        color: #38bdf8;
      }

      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 24px 0;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        overflow: hidden;
      }

      table th,
      table td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #334155;
        color: #cbd5e1;
      }

      table th {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        color: #f1f5f9;
        font-weight: 600;
        border-bottom: none;
      }

      table tr:nth-child(even) {
        background-color: #1e293b;
      }

      table tr:hover {
        background-color: #334155;
      }

      table tr:last-child td {
        border-bottom: none;
      }

      /* Code */
      code {
        font-family: 'Fira Code', 'SF Mono', Monaco, monospace;
        font-size: 0.875em;
        background: linear-gradient(135deg, #00f5ff20, #ff00ff20);
        color: #00f5ff;
        padding: 3px 6px;
        border-radius: 4px;
        border: 1px solid #334155;
      }

      pre {
        font-family: 'Fira Code', 'SF Mono', Monaco, monospace;
        font-size: 0.85em;
        line-height: 1.5;
        background: #020617;
        color: #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        margin: 24px 0;
        page-break-inside: avoid;
        position: relative;
        overflow: hidden;
        border: 1px solid #1e293b;
      }

      pre::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #00f5ff, #ff00ff);
      }

      pre code {
        background: none;
        color: #e2e8f0;
        padding: 0;
        border: none;
      }

      /* Blockquotes */
      blockquote {
        margin: 24px 0;
        padding: 16px 24px;
        background: linear-gradient(135deg, #00f5ff10, #ff00ff10);
        border-left: 4px solid #38bdf8;
        border-radius: 0 8px 8px 0;
        font-style: italic;
        color: #94a3b8;
        position: relative;
      }

      blockquote::before {
        content: '"';
        font-size: 4em;
        color: #38bdf8;
        position: absolute;
        top: -10px;
        left: 10px;
        opacity: 0.3;
      }

      /* Links */
      a {
        color: #38bdf8;
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-color 0.2s;
      }

      a:hover {
        border-bottom-color: #38bdf8;
      }

      /* Images */
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        margin: 24px 0;
      }

      /* Horizontal rules */
      hr {
        border: none;
        height: 3px;
        background: linear-gradient(90deg, #00f5ff, #ff00ff);
        margin: 40px 0;
        border-radius: 2px;
      }

      /* Print optimizations - Maintain dark theme */
      @media print {
        body {
          background-color: #0f172a !important;
          color: #e2e8f0 !important;
          font-size: 12pt;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .document {
          background-color: #0f172a !important;
        }
        
        h1 {
          background: linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
        }
        
        h2, h3, h4, h5, h6 {
          color: #f1f5f9 !important;
        }
        
        h2 {
          color: #38bdf8 !important;
        }
        
        h3 {
          color: #06b6d4 !important;
        }
        
        p, li {
          color: #cbd5e1 !important;
        }
        
        table {
          background-color: #0f172a !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
        }
        
        table th, table td {
          color: #cbd5e1 !important;
          border: 1px solid #334155 !important;
          background-color: inherit !important;
        }
        
        table th {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
          color: #f1f5f9 !important;
        }
        
        table tr:nth-child(even) {
          background-color: #1e293b !important;
        }
        
        code {
          background: linear-gradient(135deg, #00f5ff20, #ff00ff20) !important;
          color: #00f5ff !important;
          border: 1px solid #334155 !important;
        }
        
        pre {
          background: #020617 !important;
          color: #e2e8f0 !important;
          border: 1px solid #1e293b !important;
        }
        
        pre code {
          background: none !important;
          color: #e2e8f0 !important;
          border: none !important;
        }
        
        blockquote {
          background: linear-gradient(135deg, #00f5ff10, #ff00ff10) !important;
          color: #94a3b8 !important;
          border-left: 4px solid #38bdf8 !important;
        }
        
        a {
          color: #38bdf8 !important;
        }
        
        hr {
          background: linear-gradient(90deg, #00f5ff, #ff00ff) !important;
        }
        
        img {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
        }
      }
    `;
  }

  /**
   * Newspaper Dark template
   */
  private getNewspaperDarkTemplate(): string {
    return `
      /* Newspaper Dark Template */
      * {
        box-sizing: border-box;
      }

      body {
        font-family: 'Times New Roman', Georgia, serif;
        line-height: 1.5;
        color: #e8e8e8;
        background-color: #1a1a1a !important;
        max-width: none;
        margin: 0;
        padding: 0;
        font-size: 11pt;
        column-count: 2;
        column-gap: 30px;
        column-rule: 1px solid #444444;
      }

      .document {
        padding: 20px;
        max-width: 100%;
        background-color: #1a1a1a !important;
        min-height: 100vh;
      }

      /* Headings */
      h1 {
        font-family: 'Arial Black', Arial, sans-serif;
        font-size: 28pt;
        font-weight: 900;
        text-transform: uppercase;
        text-align: center;
        margin: 0 0 20px 0;
        column-span: all;
        border-top: 3px solid #ffffff;
        border-bottom: 1px solid #ffffff;
        padding: 15px 0 10px 0;
        letter-spacing: 2px;
        color: #ffffff;
        background-color: #2a2a2a;
      }

      h2 {
        font-family: Arial, sans-serif;
        font-size: 16pt;
        font-weight: bold;
        margin: 20px 0 10px 0;
        text-transform: uppercase;
        border-bottom: 2px solid #ffffff;
        padding-bottom: 5px;
        break-after: avoid;
        color: #ffffff;
      }

      h3 {
        font-family: Arial, sans-serif;
        font-size: 14pt;
        font-weight: bold;
        margin: 15px 0 8px 0;
        break-after: avoid;
        color: #cccccc;
      }

      h4, h5, h6 {
        font-family: Arial, sans-serif;
        font-size: 12pt;
        font-weight: bold;
        margin: 12px 0 6px 0;
        break-after: avoid;
        color: #bbbbbb;
      }

      /* Paragraphs */
      p {
        margin: 0 0 12px 0;
        text-align: justify;
        text-indent: 15px;
        orphans: 3;
        widows: 3;
        color: #e8e8e8;
      }

      p:first-of-type {
        text-indent: 0;
      }

      p:first-of-type::first-letter {
        font-size: 3em;
        font-weight: bold;
        float: left;
        line-height: 1;
        margin: 0 8px 0 0;
        padding: 0;
        color: #ffffff;
        background-color: #333333;
        padding: 5px 8px;
        border-radius: 3px;
      }

      /* Lists */
      ul, ol {
        margin: 0 0 12px 0;
        padding-left: 20px;
        break-inside: avoid;
        color: #e8e8e8;
      }

      li {
        margin-bottom: 4px;
      }

      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 15px 0;
        font-size: 9pt;
        break-inside: avoid;
        column-span: all;
      }

      table th,
      table td {
        border: 1px solid #555555;
        padding: 6px 8px;
        text-align: left;
        color: #e8e8e8;
      }

      table th {
        background-color: #333333;
        color: #ffffff;
        font-weight: bold;
        text-align: center;
      }

      /* Code */
      code {
        font-family: 'Courier New', monospace;
        font-size: 9pt;
        background-color: #2a2a2a;
        color: #ffffff;
        padding: 2px 4px;
        border: 1px solid #555555;
      }

      pre {
        font-family: 'Courier New', monospace;
        font-size: 9pt;
        background-color: #2a2a2a;
        color: #ffffff;
        border: 1px solid #555555;
        padding: 10px;
        margin: 15px 0;
        break-inside: avoid;
        column-span: all;
      }

      /* Blockquotes */
      blockquote {
        margin: 15px 0;
        padding: 10px 15px;
        background-color: #2a2a2a;
        border: 1px solid #555555;
        font-style: italic;
        break-inside: avoid;
        color: #cccccc;
      }

      blockquote::before {
        content: '"';
        font-size: 2em;
        font-weight: bold;
        float: left;
        margin-right: 5px;
        color: #ffffff;
      }

      /* Links */
      a {
        color: #66ccff;
        text-decoration: underline;
        font-weight: bold;
      }

      /* Images */
      img {
        max-width: 100%;
        height: auto;
        border: 1px solid #555555;
        margin: 10px 0;
        break-inside: avoid;
      }

      /* Article sections */
      .article-meta {
        font-family: Arial, sans-serif;
        font-size: 9pt;
        color: #aaaaaa;
        margin-bottom: 15px;
        column-span: all;
        text-align: center;
        border-bottom: 1px solid #555555;
        padding-bottom: 10px;
      }

      .byline {
        font-family: Arial, sans-serif;
        font-size: 10pt;
        font-weight: bold;
        margin-bottom: 10px;
        text-transform: uppercase;
        color: #ffffff;
      }

      .dateline {
        font-family: Arial, sans-serif;
        font-size: 9pt;
        color: #aaaaaa;
        margin-bottom: 15px;
      }

      .pullquote {
        font-size: 14pt;
        font-weight: bold;
        text-align: center;
        margin: 20px 0;
        padding: 15px;
        border-top: 2px solid #ffffff;
        border-bottom: 2px solid #ffffff;
        column-span: all;
        background-color: #2a2a2a;
        color: #ffffff;
      }

      /* Print optimizations - Maintain dark theme */
      @media print {
        body {
          background-color: #1a1a1a !important;
          color: #e8e8e8 !important;
          column-count: 3;
          column-gap: 20px;
          font-size: 10pt;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .document {
          padding: 15px;
          background-color: #1a1a1a !important;
        }
        
        h1 {
          color: #ffffff !important;
          background-color: #2a2a2a !important;
          border-top: 3px solid #ffffff !important;
          border-bottom: 1px solid #ffffff !important;
          font-size: 24pt;
        }
        
        h2 {
          color: #ffffff !important;
          border-bottom: 2px solid #ffffff !important;
          font-size: 14pt;
        }
        
        h3 {
          color: #cccccc !important;
          font-size: 12pt;
        }
        
        h4, h5, h6 {
          color: #bbbbbb !important;
        }
        
        p, li {
          color: #e8e8e8 !important;
        }
        
        p:first-of-type::first-letter {
          color: #ffffff !important;
          background-color: #333333 !important;
        }
        
        table {
          background-color: #1a1a1a !important;
        }
        
        table th, table td {
          color: #e8e8e8 !important;
          border: 1px solid #555555 !important;
          background-color: inherit !important;
        }
        
        table th {
          background-color: #333333 !important;
          color: #ffffff !important;
        }
        
        code {
          background-color: #2a2a2a !important;
          color: #ffffff !important;
          border: 1px solid #555555 !important;
        }
        
        pre {
          background-color: #2a2a2a !important;
          color: #ffffff !important;
          border: 1px solid #555555 !important;
        }
        
        blockquote {
          background-color: #2a2a2a !important;
          color: #cccccc !important;
          border: 1px solid #555555 !important;
        }
        
        blockquote::before {
          color: #ffffff !important;
        }
        
        a {
          color: #66ccff !important;
        }
        
        img {
          border: 1px solid #555555 !important;
        }
        
        .article-meta {
          color: #aaaaaa !important;
          border-bottom: 1px solid #555555 !important;
        }
        
        .byline {
          color: #ffffff !important;
        }
        
        .dateline {
          color: #aaaaaa !important;
        }
        
        .pullquote {
          background-color: #2a2a2a !important;
          color: #ffffff !important;
          border-top: 2px solid #ffffff !important;
          border-bottom: 2px solid #ffffff !important;
        }
      }
    `;
  }

  /**
   * List all available templates (built-in and custom)
   */
  async listAllTemplates(): Promise<{
    builtin: Array<{ id: BuiltinTemplate; info: TemplateInfo }>;
    custom: Array<{ id: string; name: string; description: string; author: string }>;
  }> {
    try {
      await this.configManager.initialize();
      
      const builtin = this.listBuiltinTemplates();
      const customTemplates = await this.configManager.listCustomTemplates();
      const custom = customTemplates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        author: t.author
      }));

      return { builtin, custom };
    } catch (error) {
      console.warn('⚠️  Could not load custom templates:', error);
      return { builtin: this.listBuiltinTemplates(), custom: [] };
    }
  }

  /**
   * Add a custom template
   */
  async addCustomTemplate(
    cssFilePath: string,
    name: string,
    description: string,
    author: string = 'User'
  ): Promise<string> {
    await this.configManager.initialize();
    return this.configManager.addCustomTemplate(cssFilePath, {
      name,
      description,
      author
    });
  }

  /**
   * Remove a custom template
   */
  async removeCustomTemplate(templateId: string): Promise<boolean> {
    await this.configManager.initialize();
    const result = await this.configManager.removeCustomTemplate(templateId);
    
    // Clear cache entry if it exists
    this.templatesCache.delete(templateId);
    
    return result;
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templatesCache.clear();
  }

  /**
   * Get template info
   */
  getTemplateInfo(templateName: string): TemplateInfo | null {
    if (this.isBuiltinTemplate(templateName)) {
      return this.builtinTemplates.get(templateName as BuiltinTemplate) || null;
    }
    return null;
  }

  /**
   * Get configuration manager instance
   */
  getConfigManager(): ConfigManager {
    return this.configManager;
  }
}
