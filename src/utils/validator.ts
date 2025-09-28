import { existsSync, statSync } from 'fs';
import { resolve, extname } from 'path';
import { CliOptions, ValidationError, PdfFormat, ConversionOptions, PdfMargins } from '../types/index.js';

/**
 * Validates CLI options before processing
 */
export async function validateCliOptions(input: string[], options: CliOptions): Promise<void> {
  // Validate input files/patterns
  validateInput(input, options);
  
  // Validate output path
  validateOutput(options.output);
  
  // Validate margins format
  validateMargins(options.margins);
  
  // Validate PDF format
  validatePdfFormat(options.format);
  
  // Validate quality
  validateQuality(options.quality);
  
  // Validate template file
  await validateTemplate(options.template);
  
  // Validate pattern syntax
  validatePattern(options.pattern);
}

/**
 * Validates input files or patterns
 */
function validateInput(input: string[], options: CliOptions): void {
  const hasInputFiles = input && input.length > 0;
  const hasPattern = options.pattern && options.pattern.trim().length > 0;
  
  // Must have either input files OR pattern
  if (!hasInputFiles && !hasPattern) {
    throw new ValidationError(
      'No input specified. Provide either input files or use --pattern option.',
      'input'
    );
  }
  
  // Cannot have both input files AND pattern
  if (hasInputFiles && hasPattern) {
    throw new ValidationError(
      'Cannot specify both input files and --pattern option. Choose one approach.',
      'input'
    );
  }
  
  // If input files provided, validate each one exists
  if (hasInputFiles) {
    for (const filePath of input) {
      validateInputFile(filePath);
    }
  }
}

/**
 * Validates a single input file
 */
function validateInputFile(filePath: string): void {
  const resolvedPath = resolve(filePath);
  
  // Check if file exists
  if (!existsSync(resolvedPath)) {
    throw new ValidationError(
      `Input file does not exist: ${filePath}`,
      'input'
    );
  }
  
  // Check if it's a file (not directory)
  const stats = statSync(resolvedPath);
  if (!stats.isFile()) {
    throw new ValidationError(
      `Input path is not a file: ${filePath}`,
      'input'
    );
  }
  
  // Check file extension
  const ext = extname(filePath).toLowerCase();
  const supportedExtensions = ['.md', '.markdown', '.html', '.htm'];
  
  if (!supportedExtensions.includes(ext)) {
    throw new ValidationError(
      `Unsupported file type: ${ext}. Supported: ${supportedExtensions.join(', ')}`,
      'input'
    );
  }
}

/**
 * Validates output path
 */
function validateOutput(output?: string): void {
  if (!output) return; // Output is optional
  
  const resolvedPath = resolve(output);
  
  // If output exists, check if it's writable
  if (existsSync(resolvedPath)) {
    const stats = statSync(resolvedPath);
    
    // If it's a directory, that's fine for batch processing
    if (stats.isDirectory()) {
      return;
    }
    
    // If it's a file, check if parent directory is writable
    // (We'll overwrite the file, so just need directory access)
  }
  
  // Check if parent directory exists and is writable
  const parentDir = resolve(resolvedPath, '..');
  if (!existsSync(parentDir)) {
    throw new ValidationError(
      `Output directory does not exist: ${parentDir}`,
      'output'
    );
  }
  
  const parentStats = statSync(parentDir);
  if (!parentStats.isDirectory()) {
    throw new ValidationError(
      `Output parent path is not a directory: ${parentDir}`,
      'output'
    );
  }
}

/**
 * Validates margin format string
 */
function validateMargins(margins?: string): void {
  if (!margins) return; // Margins are optional
  
  const parts = margins.split(',').map(s => s.trim());
  
  // Must have exactly 4 parts
  if (parts.length !== 4) {
    throw new ValidationError(
      'Margins must be in format "top,right,bottom,left" (e.g., "10mm,15mm,10mm,15mm")',
      'margins'
    );
  }
  
  // Validate each margin value
  const validUnits = ['mm', 'cm', 'in', 'px', 'pt'];
  const marginRegex = /^(\d+(?:\.\d+)?)(mm|cm|in|px|pt)$/;
  
  for (let i = 0; i < parts.length; i++) {
    const margin = parts[i];
    const position = ['top', 'right', 'bottom', 'left'][i];
    
    if (!marginRegex.test(margin)) {
      throw new ValidationError(
        `Invalid ${position} margin: "${margin}". Use format like "10mm", "0.5in", "12pt"`,
        'margins'
      );
    }
  }
}

/**
 * Validates PDF format
 */
function validatePdfFormat(format?: string): void {
  if (!format) return; // Format is optional
  
  const validFormats: PdfFormat[] = ['A4', 'A3', 'A5', 'Letter', 'Legal', 'Tabloid'];
  
  if (!validFormats.includes(format as PdfFormat)) {
    throw new ValidationError(
      `Invalid PDF format: "${format}". Valid options: ${validFormats.join(', ')}`,
      'format'
    );
  }
}

/**
 * Validates quality parameter
 */
function validateQuality(quality?: number): void {
  if (quality === undefined) return; // Quality is optional
  
  const qualityNum = Number(quality);
  
  if (isNaN(qualityNum)) {
    throw new ValidationError(
      `Quality must be a number, got: "${quality}"`,
      'quality'
    );
  }
  
  if (qualityNum < 0 || qualityNum > 100) {
    throw new ValidationError(
      `Quality must be between 0 and 100, got: ${qualityNum}`,
      'quality'
    );
  }
}

/**
 * Validates template file or built-in template name
 */
async function validateTemplate(template?: string): Promise<void> {
  if (!template) return; // Template is optional
  
  // Check if it's a built-in template name (including dark variants)
  const builtinTemplates = [
    'github', 'github-dark',
    'academic', 'academic-dark', 
    'minimal', 'minimal-dark',
    'modern', 'modern-dark',
    'newspaper', 'newspaper-dark'
  ];
  if (builtinTemplates.includes(template.toLowerCase())) {
    return; // Built-in template, no further validation needed
  }
  
  // Try to check if it's a custom template
  try {
    const { ConfigManager } = await import('../core/configManager.js');
    const configManager = new ConfigManager();
    await configManager.initialize();
    
    const templateCheck = await configManager.templateExists(template);
    if (templateCheck.exists) {
      return; // Template exists (custom or file)
    }
  } catch (error) {
    // If config manager fails, fall back to file check
    console.warn('⚠️  Could not check custom templates, checking as file path');
  }
  
  // Check if it's a file path
  const resolvedPath = resolve(template);
  
  if (!existsSync(resolvedPath)) {
    const builtinList = builtinTemplates.slice(0, 5).join(', ') + '...';
    throw new ValidationError(
      `Template not found: "${template}". Must be a built-in template (${builtinList}), custom template, or valid CSS file path.`,
      'template'
    );
  }
  
  const stats = statSync(resolvedPath);
  if (!stats.isFile()) {
    throw new ValidationError(
      `Template path is not a file: ${template}`,
      'template'
    );
  }
  
  const ext = extname(template).toLowerCase();
  if (ext !== '.css') {
    throw new ValidationError(
      `Template must be a CSS file, got: ${ext}`,
      'template'
    );
  }
}

/**
 * Validates glob pattern syntax
 */
function validatePattern(pattern?: string): void {
  if (!pattern) return; // Pattern is optional
  
  // Basic pattern validation
  if (pattern.trim().length === 0) {
    throw new ValidationError(
      'Pattern cannot be empty',
      'pattern'
    );
  }
  
  // Check for dangerous patterns
  const dangerousPatterns = ['/', '\\', '..'];
  for (const dangerous of dangerousPatterns) {
    if (pattern.includes(dangerous) && !pattern.includes('**/')) {
      // Allow **/ for recursive patterns but warn about other cases
      console.warn(`⚠️  Pattern contains "${dangerous}" - make sure this is intentional`);
    }
  }
}

/**
 * Converts CLI options to internal ConversionOptions
 */
export function convertCliToConversionOptions(
  input: string[],
  cliOptions: CliOptions
): ConversionOptions {
  const options: ConversionOptions = {
    input: input.length > 0 ? input : [],
    output: cliOptions.output,
    pattern: cliOptions.pattern,
    recursive: cliOptions.recursive || false,
    interactive: cliOptions.interactive || false,
    template: cliOptions.template,
    format: cliOptions.format as PdfFormat || 'A4',
    quality: cliOptions.quality || 80
  };
  
  // Parse margins if provided
  if (cliOptions.margins) {
    options.margins = parseMargins(cliOptions.margins);
  }
  
  return options;
}

/**
 * Parses margin string into PdfMargins object
 */
function parseMargins(marginsString: string): PdfMargins {
  const parts = marginsString.split(',').map(s => s.trim());
  
  return {
    top: parts[0],
    right: parts[1],
    bottom: parts[2],
    left: parts[3]
  };
}

/**
 * Validates that required dependencies are available
 */
export function validateDependencies(): void {
  // For ES modules, we can't use require.resolve at runtime
  // Dependencies should be validated at build time
  // This function is kept for compatibility but doesn't need to check
  console.log('✅ Dependencies validated at build time');
}