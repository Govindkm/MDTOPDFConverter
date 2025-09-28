/**
 * Core conversion configuration options
 */
export interface ConversionOptions {
  input: string | string[];           // Single file or array of files
  output?: string;                    // Output file or directory
  pattern?: string;                   // Glob pattern for batch processing
  recursive?: boolean;                // Search recursively in subdirectories
  interactive?: boolean;              // Interactive file selection mode
  template?: string;                  // Custom CSS template file path
  margins?: PdfMargins;              // PDF margin settings
  format?: PdfFormat;                // PDF page format
  quality?: number;                  // PDF quality (0-100)
}

/**
 * PDF margin configuration
 */
export interface PdfMargins {
  top?: string;                      // e.g., '10mm', '0.4in'
  right?: string;
  bottom?: string;
  left?: string;
}

/**
 * PDF page format options
 */
export type PdfFormat = 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Tabloid';

/**
 * Result of processing a single file
 */
export interface FileProcessingResult {
  inputFile: string;                 // Original file path
  outputFile: string;                // Generated PDF path
  success: boolean;                  // Whether conversion succeeded
  error?: string;                    // Error message if failed
  processingTime?: number;           // Time taken in milliseconds
  fileSize?: number;                 // Output file size in bytes
}

/**
 * Result of batch processing multiple files
 */
export interface BatchProcessingResult {
  totalFiles: number;                // Total files attempted
  successCount: number;              // Successfully converted files
  failedCount: number;               // Failed conversions
  results: FileProcessingResult[];   // Individual file results
  totalTime: number;                 // Total processing time in milliseconds
}

/**
 * CLI-specific options (before processing)
 */
export interface CliOptions {
  output?: string;
  pattern?: string;
  recursive?: boolean;
  interactive?: boolean;
  template?: string;
  margins?: string;                  // Raw string like "10mm,15mm,10mm,15mm"
  format?: PdfFormat;
  quality?: number;
}

/**
 * File discovery options
 */
export interface FileDiscoveryOptions {
  pattern: string;                   // Glob pattern
  recursive: boolean;                // Search subdirectories
  baseDirectory: string;             // Starting directory
  exclude?: string[];                // Patterns to exclude
}

/**
 * Supported input file types
 */
export type SupportedFileType = 'markdown' | 'html';

/**
 * Custom error types for better error handling
 */
export class ConversionError extends Error {
  constructor(
    message: string,
    public readonly filePath?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ConversionError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}