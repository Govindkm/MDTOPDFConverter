import { ConversionOptions, BatchProcessingResult, FileProcessingResult, ConversionError, CliOptions } from '../types/index.js';
import { validateDependencies, convertCliToConversionOptions } from '../utils/validator.js';
import { FileProcessor } from './fileProcessor.js';
import { PdfGenerator } from './pdfGenerator.js';

/**
 * Main converter class that orchestrates the entire conversion process
 */
export class Converter {
  private fileProcessor: FileProcessor;
  private pdfGenerator: PdfGenerator;

  constructor() {
    // Validate dependencies on initialization
    validateDependencies();
    
    this.fileProcessor = new FileProcessor();
    this.pdfGenerator = new PdfGenerator();
  }

  /**
   * Main conversion method - entry point from CLI
   */
  async convert(input: string[], cliOptions: CliOptions): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Convert CLI options to internal format
      const options = convertCliToConversionOptions(input, cliOptions);
      
      console.log('🔍 Discovering files to convert...');
      
      // Discover files to process
      const filesToProcess = await this.discoverFiles(options);
      
      if (filesToProcess.length === 0) {
        throw new ConversionError('No files found matching the specified criteria');
      }
      
      console.log(`📁 Found ${filesToProcess.length} file(s) to convert`);
      
      // Handle interactive mode
      const selectedFiles = options.interactive 
        ? await this.interactiveFileSelection(filesToProcess)
        : filesToProcess;
      
      if (selectedFiles.length === 0) {
        console.log('ℹ️  No files selected for conversion');
        return {
          totalFiles: 0,
          successCount: 0,
          failedCount: 0,
          results: [],
          totalTime: Date.now() - startTime
        };
      }
      
      console.log(`🚀 Converting ${selectedFiles.length} file(s)...`);
      
      // Process files
      const results = await this.processFiles(selectedFiles, options);
      
      const totalTime = Date.now() - startTime;
      
      return {
        totalFiles: results.length,
        successCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length,
        results,
        totalTime
      };
      
    } catch (error) {
      throw new ConversionError(
        `Conversion failed: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Discovers files based on input options
   */
  private async discoverFiles(options: ConversionOptions): Promise<string[]> {
    try {
      return await this.fileProcessor.discoverFiles(options);
    } catch (error) {
      throw new ConversionError(
        `File discovery failed: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Interactive file selection using CLI prompts
   * TODO: Implement with inquirer.js for better UX
   */
  private async interactiveFileSelection(files: string[]): Promise<string[]> {
    console.log('🔍 Interactive file selection...');
    console.log('Available files:');
    
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
    
    console.log('\n📝 Note: Interactive file selection not yet implemented.');
    console.log('   For now, all discovered files will be processed.');
    console.log('   Use specific patterns or input files for more control.\n');
    
    // TODO: Implement actual interactive selection with inquirer.js
    // For now, return all files
    return files;
  }

  /**
   * Processes multiple files with progress tracking
   */
  private async processFiles(
    files: string[], 
    options: ConversionOptions
  ): Promise<FileProcessingResult[]> {
    const results: FileProcessingResult[] = [];
    const totalFiles = files.length;
    
    console.log(''); // Empty line for better formatting
    
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i];
      const fileIndex = i + 1;
      
      console.log(`📄 [${fileIndex}/${totalFiles}] Processing: ${filePath}`);
      
      const result = await this.processSingleFile(filePath, options);
      results.push(result);
      
      // Show individual result
      if (result.success) {
        console.log(`   ✅ Success → ${result.outputFile} (${result.processingTime}ms)`);
        if (result.fileSize) {
          console.log(`   📊 Size: ${this.formatFileSize(result.fileSize)}`);
        }
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
      
      console.log(''); // Empty line between files
    }
    
    return results;
  }

  /**
   * Processes a single file conversion
   */
  private async processSingleFile(
    inputFile: string, 
    options: ConversionOptions
  ): Promise<FileProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Generate output file path
      const outputFile = this.fileProcessor.generateOutputPath(inputFile, options);
      
      // Ensure output directory exists
      await this.fileProcessor.ensureOutputDirectory(outputFile);
      
      // Convert file to PDF
      await this.pdfGenerator.convertToPdf(inputFile, outputFile, options);
      
      // Get file size of generated PDF
      const fileSize = await this.fileProcessor.getFileSize(outputFile);
      
      return {
        inputFile,
        outputFile,
        success: true,
        processingTime: Date.now() - startTime,
        fileSize
      };
      
    } catch (error) {
      return {
        inputFile,
        outputFile: '', // No output file created on failure
        success: false,
        error: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Formats file size in human-readable format
   */
  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = Math.round((bytes / Math.pow(1024, i)) * 100) / 100;
    
    return `${size} ${sizes[i]}`;
  }

  /**
   * Get conversion statistics
   */
  getStats(result: BatchProcessingResult): void {
    console.log('\n📊 Conversion Statistics:');
    console.log(`   Total files: ${result.totalFiles}`);
    console.log(`   Successful: ${result.successCount}`);
    console.log(`   Failed: ${result.failedCount}`);
    console.log(`   Success rate: ${Math.round((result.successCount / result.totalFiles) * 100)}%`);
    console.log(`   Total time: ${result.totalTime}ms`);
    
    if (result.successCount > 0) {
      const avgTime = Math.round(
        result.results
          .filter(r => r.success)
          .reduce((sum, r) => sum + (r.processingTime || 0), 0) / result.successCount
      );
      console.log(`   Average time per file: ${avgTime}ms`);
    }
    
    // Show failed files if any
    if (result.failedCount > 0) {
      console.log('\n❌ Failed conversions:');
      result.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   - ${r.inputFile}: ${r.error}`);
        });
    }
  }

  /**
   * Cleanup resources (important for Puppeteer)
   */
  async cleanup(): Promise<void> {
    try {
      await this.pdfGenerator.cleanup();
      console.log('🧹 Cleanup completed');
    } catch (error) {
      console.warn('⚠️  Cleanup warning:', error instanceof Error ? error.message : error);
    }
  }

  /**
   * Graceful shutdown handler
   */
  async gracefulShutdown(): Promise<void> {
    console.log('\n🛑 Shutting down gracefully...');
    await this.cleanup();
    process.exit(0);
  }
}

// Global error handlers for the converter
process.on('SIGINT', async () => {
  console.log('\n⚠️  Received interrupt signal');
  // Note: In real usage, you'd have a global converter instance to cleanup
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Received termination signal');
  // Note: In real usage, you'd have a global converter instance to cleanup
  process.exit(0);
});
