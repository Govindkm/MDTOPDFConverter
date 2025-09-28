import { glob } from 'glob';
import { existsSync, statSync, mkdirSync } from 'fs';
import { resolve, dirname, basename, extname, join } from 'path';
import fs from 'fs-extra';
import upath from 'upath';
import { ConversionOptions, FileDiscoveryOptions, ConversionError } from '../types/index.js';

/**
 * Handles all file system operations for the conversion process
 */
export class FileProcessor {
  
  /**
   * Discovers files based on conversion options
   */
  async discoverFiles(options: ConversionOptions): Promise<string[]> {
    const files: string[] = [];
    
    try {
      // Handle direct input files
      if (options.input && Array.isArray(options.input) && options.input.length > 0) {
        for (const inputPath of options.input) {
          const resolvedPath = resolve(inputPath);
          if (this.isValidInputFile(resolvedPath)) {
            files.push(resolvedPath);
          }
        }
        return files;
      }
      
      // Handle pattern-based discovery
      if (options.pattern) {
        const discoveredFiles = await this.discoverFilesByPattern(options);
        files.push(...discoveredFiles);
      }
      
      // Remove duplicates and sort
      const uniqueFiles = [...new Set(files)];
      return uniqueFiles.sort();
      
    } catch (error) {
      throw new ConversionError(
        `File discovery failed: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Discovers files using glob patterns
   */
  private async discoverFilesByPattern(options: ConversionOptions): Promise<string[]> {
    if (!options.pattern) return [];
    
    const discoveryOptions: FileDiscoveryOptions = {
      pattern: options.pattern,
      recursive: options.recursive || false,
      baseDirectory: process.cwd(),
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**'
      ]
    };
    
    try {
      // Build glob pattern
      let globPattern = options.pattern;
      
      // If recursive and pattern doesn't start with **, add it
      if (options.recursive && !globPattern.startsWith('**/')) {
        globPattern = `**/${globPattern}`;
      }
      
      console.log(`🔍 Searching with pattern: ${globPattern}`);
      if (options.recursive) {
        console.log('📁 Recursive search enabled');
      }
      
      // Use glob to find files
      const matches = await glob(globPattern, {
        cwd: discoveryOptions.baseDirectory,
        absolute: true,
        ignore: discoveryOptions.exclude,
        nodir: true // Only return files, not directories
      });
      
      // Filter for supported file types
      const supportedFiles = matches.filter(file => this.isValidInputFile(file));
      
      console.log(`📄 Found ${supportedFiles.length} matching files`);
      
      return supportedFiles;
      
    } catch (error) {
      throw new ConversionError(
        `Pattern matching failed: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Validates if a file is a supported input file
   */
  private isValidInputFile(filePath: string): boolean {
    try {
      // Check if file exists
      if (!existsSync(filePath)) {
        return false;
      }
      
      // Check if it's actually a file
      const stats = statSync(filePath);
      if (!stats.isFile()) {
        return false;
      }
      
      // Check file extension
      const ext = extname(filePath).toLowerCase();
      const supportedExtensions = ['.md', '.markdown', '.html', '.htm'];
      
      return supportedExtensions.includes(ext);
      
    } catch (error) {
      console.warn(`⚠️  Could not validate file ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Generates output file path based on input file and options
   */
  generateOutputPath(inputFile: string, options: ConversionOptions): string {
    const inputPath = upath.normalize(resolve(inputFile));
    const inputBasename = basename(inputFile, extname(inputFile));
    const outputFilename = `${inputBasename}.pdf`;
    
    // If no output specified, place PDF next to input file
    if (!options.output) {
      const inputDir = dirname(inputPath);
      return upath.normalize(join(inputDir, outputFilename));
    }
    
    const outputPath = upath.normalize(resolve(options.output));
    
    // If output is a directory, place PDF inside it
    if (this.isDirectory(outputPath) || outputPath.endsWith('/') || outputPath.endsWith('\\')) {
      return upath.normalize(join(outputPath, outputFilename));
    }
    
    // If output is a file path, use it directly
    // But ensure it has .pdf extension
    if (!outputPath.toLowerCase().endsWith('.pdf')) {
      return `${outputPath}.pdf`;
    }
    
    return outputPath;
  }

  /**
   * Ensures the output directory exists
   */
  async ensureOutputDirectory(outputPath: string): Promise<void> {
    try {
      const outputDir = dirname(outputPath);
      await fs.ensureDir(outputDir);
    } catch (error) {
      throw new ConversionError(
        `Could not create output directory: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Gets file size in bytes
   */
  async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      console.warn(`⚠️  Could not get file size for ${filePath}:`, error);
      return 0;
    }
  }

  /**
   * Checks if a path is a directory
   */
  private isDirectory(path: string): boolean {
    try {
      if (!existsSync(path)) {
        // If path doesn't exist, check if it looks like a directory
        return path.endsWith('/') || path.endsWith('\\') || !extname(path);
      }
      
      const stats = statSync(path);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets file information for display purposes
   */
  async getFileInfo(filePath: string): Promise<{
    path: string;
    name: string;
    extension: string;
    size: number;
    type: 'markdown' | 'html';
    lastModified: Date;
  }> {
    try {
      const stats = await fs.stat(filePath);
      const ext = extname(filePath).toLowerCase();
      
      return {
        path: upath.normalize(filePath),
        name: basename(filePath),
        extension: ext,
        size: stats.size,
        type: ['.md', '.markdown'].includes(ext) ? 'markdown' : 'html',
        lastModified: stats.mtime
      };
    } catch (error) {
      throw new ConversionError(
        `Could not get file info: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Creates a relative path from base directory for display
   */
  getRelativePath(filePath: string, baseDir?: string): string {
    const base = baseDir || process.cwd();
    const normalized = upath.normalize(filePath);
    const normalizedBase = upath.normalize(base);
    
    if (normalized.startsWith(normalizedBase)) {
      return normalized.substring(normalizedBase.length + 1);
    }
    
    return normalized;
  }

  /**
   * Validates that output path is writable
   */
  async validateOutputPath(outputPath: string): Promise<boolean> {
    try {
      const outputDir = dirname(outputPath);
      
      // Ensure directory exists
      await fs.ensureDir(outputDir);
      
      // Check if we can write to the directory
      const testFile = join(outputDir, '.write-test-' + Date.now());
      
      try {
        // Try to create a temporary file
        const fs = await import('fs/promises');
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
        return true;
      } catch (writeError) {
        console.warn(`⚠️  Cannot write to output directory: ${outputDir}`);
        return false;
      }
      
    } catch (error) {
      console.warn(`⚠️  Output path validation failed:`, error);
      return false;
    }
  }

  /**
   * Gets supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['.md', '.markdown', '.html', '.htm'];
  }

  /**
   * Checks if file extension is supported
   */
  isSupportedExtension(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    return this.getSupportedExtensions().includes(ext);
  }

  /**
   * Filters files by supported extensions
   */
  filterSupportedFiles(files: string[]): string[] {
    return files.filter(file => this.isSupportedExtension(file));
  }

  /**
   * Groups files by their type (markdown vs html)
   */
  groupFilesByType(files: string[]): { markdown: string[]; html: string[] } {
    const markdown: string[] = [];
    const html: string[] = [];
    
    for (const file of files) {
      const ext = extname(file).toLowerCase();
      if (['.md', '.markdown'].includes(ext)) {
        markdown.push(file);
      } else if (['.html', '.htm'].includes(ext)) {
        html.push(file);
      }
    }
    
    return { markdown, html };
  }

  /**
   * Cleanup temporary files if any
   */
  async cleanup(): Promise<void> {
    // Currently no cleanup needed for FileProcessor
    // This method is here for consistency and future use
    console.log('🧹 FileProcessor cleanup completed');
  }
}
