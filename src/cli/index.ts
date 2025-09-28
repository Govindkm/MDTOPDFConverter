#!/usr/bin/env node
import { Command } from 'commander';
import { convertCommand, templatesCommand, configCommand } from './command.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const packageJsonPath = join(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

const program = new Command();

program
  .name('mdtopdf')
  .description('Convert Markdown and HTML files to PDF')
  .version(version)
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