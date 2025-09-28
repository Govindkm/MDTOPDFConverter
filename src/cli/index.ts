#!/usr/bin/env node
import { Command } from 'commander';
import { convertCommand, templatesCommand, configCommand } from './command.js';

const program = new Command();

program
  .name('mdtopdf')
  .description('Convert Markdown and HTML files to PDF')
  .version('0.0.1')
  .configureOutput({
    writeErr: (str) => process.stderr.write(`❌ ${str}`),
    writeOut: (str) => process.stdout.write(`✅ ${str}`)
  });

// Add commands
program.addCommand(convertCommand);
program.addCommand(templatesCommand);
program.addCommand(configCommand);

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled promise rejection:', reason);
  process.exit(1);
});

// Parse CLI arguments
program.parse();