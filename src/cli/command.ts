import { Command } from 'commander';
import { CliOptions, ValidationError } from '../types/index.js';
import { Converter } from '../core/converter.js';
import { validateCliOptions } from '../utils/validator.js';
import { TemplateManager } from '../core/templateManager.js';
import { ConfigManager } from '../core/configManager.js';
import { existsSync } from 'fs';
import { resolve } from 'path';

export const convertCommand = new Command('convert')
  .description('Convert Markdown and HTML files to PDF')
  .argument('[input...]', 'Input file(s) or pattern')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-p, --pattern <pattern>', 'File pattern (e.g., "*.md", "**/*.html")')
  .option('-r, --recursive', 'Search recursively in subdirectories', false)
  .option('-i, --interactive', 'Interactive file selection mode', false)
  .option('-t, --template <path>', 'Custom CSS template file')
  .option('-m, --margins <margins>', 'PDF margins: "top,right,bottom,left" (e.g., "10mm,15mm,10mm,15mm")')
  .option('-f, --format <format>', 'PDF page format', 'A4')
  .option('-q, --quality <number>', 'PDF quality (0-100)', '80')
  .action(async (input: string[], options: CliOptions) => {
    let converter: Converter | null = null;
    
    try {
      // Validate CLI options
      await validateCliOptions(input, options);
      
      console.log('🚀 Starting PDF conversion...');
      
      converter = new Converter();
      const result = await converter.convert(input, options);
      
      // Display results
      if (result.successCount > 0) {
        console.log(`✅ Successfully converted ${result.successCount} file(s)`);
      }
      
      if (result.failedCount > 0) {
        console.log(`❌ Failed to convert ${result.failedCount} file(s)`);
        result.results
          .filter(r => !r.success)
          .forEach(r => console.error(`   - ${r.inputFile}: ${r.error}`));
      }
      
      console.log(`⏱️  Total time: ${result.totalTime}ms`);
      
      // Cleanup and exit successfully
      await converter.cleanup();
      
      // Force exit after a short delay to ensure cleanup completes
      setTimeout(() => {
        process.exit(0);
      }, 100);
      
    } catch (error) {
      // Cleanup on error
      if (converter) {
        try {
          await converter.cleanup();
        } catch (cleanupError) {
          console.warn('⚠️  Cleanup error:', cleanupError);
        }
      }
      
      if (error instanceof ValidationError) {
        console.error(`❌ Validation Error: ${error.message}`);
        process.exit(1);
      }
      
      console.error('❌ Conversion failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Add help examples
convertCommand.addHelpText('after', `
Examples:
  $ mdtopdf convert file.md                          # Convert single file
  $ mdtopdf convert *.md -o output/                  # Convert all .md files to output directory
  $ mdtopdf convert -p "**/*.md" -r                  # Convert all .md files recursively
  $ mdtopdf convert file.md -m "20mm,15mm,20mm,15mm" # Convert with custom margins
  $ mdtopdf convert -i -p "*.md"                     # Interactive file selection
  $ mdtopdf convert file.md -t github                # Use GitHub template
  $ mdtopdf convert file.md -t github-dark           # Use dark theme (auto-adjusts margins)
  $ mdtopdf convert file.md -t ./custom.css          # Use custom CSS template

Note: Dark themes automatically use zero margins for full-page dark backgrounds.
      Use -m option to override with custom margins if needed.
`);

/**
 * Templates command to list and manage templates
 */
export const templatesCommand = new Command('templates')
  .description('Manage templates')
  .addCommand(
    new Command('list')
      .description('List all available templates')
      .action(async () => {
        try {
          const templateManager = new TemplateManager();
          const { builtin, custom } = await templateManager.listAllTemplates();
          
          console.log('📋 Available Templates:\n');
          
          // Built-in templates
          console.log('🎨 Built-in Templates:');
          builtin.forEach(({ id, info }) => {
            console.log(`   ${id.padEnd(15)} - ${info.name}`);
            console.log(`   ${' '.repeat(17)} ${info.description}`);
          });
          
          // Custom templates
          if (custom.length > 0) {
            console.log('\n🛠️  Custom Templates:');
            custom.forEach(({ id, name, description, author }) => {
              console.log(`   ${id.padEnd(15)} - ${name}`);
              console.log(`   ${' '.repeat(17)} ${description} (by ${author})`);
            });
          }
          
          console.log('\n💡 Usage:');
          console.log('   mdtopdf convert file.md -t github       # Use built-in template');
          console.log('   mdtopdf convert file.md -t my-custom    # Use custom template');
          console.log('   mdtopdf convert file.md -t ./style.css  # Use CSS file directly');
          
        } catch (error) {
          console.error('❌ Failed to list templates:', error instanceof Error ? error.message : error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('add')
      .description('Add a custom template')
      .argument('<css-file>', 'Path to CSS template file')
      .option('-n, --name <name>', 'Template name')
      .option('-d, --description <desc>', 'Template description')
      .option('-a, --author <author>', 'Template author', 'User')
      .action(async (cssFile: string, options: { name?: string; description?: string; author: string }) => {
        try {
          const templateManager = new TemplateManager();
          
          // Validate CSS file
          const resolvedPath = resolve(cssFile);
          if (!existsSync(resolvedPath)) {
            throw new ValidationError(`Template file not found: ${cssFile}`);
          }
          
          // Get name from file if not provided
          const name = options.name || cssFile.split('/').pop()?.replace('.css', '') || 'Custom Template';
          const description = options.description || `Custom CSS template: ${name}`;
          
          const templateId = await templateManager.addCustomTemplate(
            resolvedPath,
            name,
            description,
            options.author
          );
          
          console.log(`✅ Successfully added custom template: ${templateId}`);
          console.log(`💡 Use it with: mdtopdf convert file.md -t ${templateId}`);
          
        } catch (error) {
          if (error instanceof ValidationError) {
            console.error(`❌ Validation Error: ${error.message}`);
          } else {
            console.error('❌ Failed to add template:', error instanceof Error ? error.message : error);
          }
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('remove')
      .description('Remove a custom template')
      .argument('<template-id>', 'Custom template ID to remove')
      .action(async (templateId: string) => {
        try {
          const templateManager = new TemplateManager();
          const success = await templateManager.removeCustomTemplate(templateId);
          
          if (success) {
            console.log(`✅ Successfully removed custom template: ${templateId}`);
          } else {
            console.log(`⚠️  Template not found: ${templateId}`);
          }
          
        } catch (error) {
          console.error('❌ Failed to remove template:', error instanceof Error ? error.message : error);
          process.exit(1);
        }
      })
  );

// Add help for templates command
templatesCommand.addHelpText('after', `
Examples:
  $ mdtopdf templates list                    # List all templates
  $ mdtopdf templates add my-style.css        # Add template with auto-generated name
  $ mdtopdf templates add style.css -n "Pro" # Add template with custom name
  $ mdtopdf templates remove my-template-123  # Remove custom template
`);

/**
 * Configuration command for managing user settings
 */
export const configCommand = new Command('config')
  .description('Manage configuration')
  .addCommand(
    new Command('show')
      .description('Show current configuration')
      .action(async () => {
        try {
          const configManager = new ConfigManager();
          await configManager.initialize();
          configManager.showConfig();
        } catch (error) {
          console.error('❌ Failed to show configuration:', error instanceof Error ? error.message : error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('set')
      .description('Set configuration option')
      .argument('<key>', 'Configuration key (defaultTemplate, defaultFormat, defaultMargins, theme)')
      .argument('<value>', 'Configuration value')
      .action(async (key: string, value: string) => {
        try {
          const configManager = new ConfigManager();
          await configManager.initialize();
          
          const validKeys = ['defaultTemplate', 'defaultFormat', 'defaultMargins', 'theme'];
          if (!validKeys.includes(key)) {
            throw new ValidationError(`Invalid configuration key: ${key}. Valid keys: ${validKeys.join(', ')}`);
          }
          
          // Validate specific values
          if (key === 'theme' && !['light', 'dark', 'auto'].includes(value)) {
            throw new ValidationError(`Invalid theme value: ${value}. Valid values: light, dark, auto`);
          }
          
          if (key === 'defaultTemplate') {
            const templateManager = new TemplateManager();
            const templateCheck = await templateManager.getConfigManager().templateExists(value);
            if (!templateCheck.exists) {
              console.warn(`⚠️  Template '${value}' not found, but setting anyway`);
            }
          }
          
          await configManager.updateConfig({ [key]: value });
          console.log(`✅ Configuration updated: ${key} = ${value}`);
          
        } catch (error) {
          if (error instanceof ValidationError) {
            console.error(`❌ Validation Error: ${error.message}`);
          } else {
            console.error('❌ Failed to update configuration:', error instanceof Error ? error.message : error);
          }
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('reset')
      .description('Reset configuration to defaults')
      .action(async () => {
        try {
          const configManager = new ConfigManager();
          await configManager.initialize();
          await configManager.resetConfig();
          console.log('✅ Configuration reset to defaults');
        } catch (error) {
          console.error('❌ Failed to reset configuration:', error instanceof Error ? error.message : error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('dir')
      .description('Show configuration directory')
      .action(async () => {
        try {
          const configManager = new ConfigManager();
          await configManager.initialize();
          console.log(`📁 Configuration directory: ${configManager.getConfigDir()}`);
          console.log(`📁 Templates directory: ${configManager.getTemplatesDir()}`);
        } catch (error) {
          console.error('❌ Failed to show directories:', error instanceof Error ? error.message : error);
          process.exit(1);
        }
      })
  );

// Add help for config command
configCommand.addHelpText('after', `
Examples:
  $ mdtopdf config show                              # Show current configuration
  $ mdtopdf config set defaultTemplate github-dark  # Set default template
  $ mdtopdf config set defaultFormat A3             # Set default page format
  $ mdtopdf config set theme dark                    # Set theme preference
  $ mdtopdf config reset                             # Reset to defaults
  $ mdtopdf config dir                               # Show config directories
`);