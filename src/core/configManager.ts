import { readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { existsSync, statSync } from 'fs';
import { resolve, join, dirname, basename, extname } from 'path';
import { homedir } from 'os';
import { ValidationError } from '../types/index.js';

export interface UserConfig {
  defaultTemplate?: string;
  defaultFormat?: string;
  defaultMargins?: string;
  customTemplatesDir?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export interface CustomTemplateInfo {
  id: string;
  name: string;
  description: string;
  author: string;
  filePath: string;
  theme?: 'light' | 'dark';
  createdAt: Date;
}

/**
 * Manages user configuration and custom templates
 */
export class ConfigManager {
  private configDir: string;
  private configFile: string;
  private templatesDir: string;
  private config: UserConfig;

  constructor() {
    // Create config directory in user's home
    this.configDir = join(homedir(), '.mdtopdf');
    this.configFile = join(this.configDir, 'config.json');
    this.templatesDir = join(this.configDir, 'templates');
    this.config = {};
  }

  /**
   * Initialize configuration directory and files
   */
  async initialize(): Promise<void> {
    try {
      // Create config directory if it doesn't exist
      if (!existsSync(this.configDir)) {
        await mkdir(this.configDir, { recursive: true });
        console.log(`📁 Created config directory: ${this.configDir}`);
      }

      // Create templates directory if it doesn't exist
      if (!existsSync(this.templatesDir)) {
        await mkdir(this.templatesDir, { recursive: true });
        console.log(`📁 Created templates directory: ${this.templatesDir}`);
      }

      // Load existing config or create default
      await this.loadConfig();
    } catch (error) {
      throw new ValidationError(
        `Failed to initialize configuration: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    try {
      if (existsSync(this.configFile)) {
        const configData = await readFile(this.configFile, 'utf-8');
        this.config = JSON.parse(configData);
      } else {
        // Create default config
        this.config = {
          defaultTemplate: 'github',
          defaultFormat: 'A4',
          defaultMargins: '20mm,20mm,20mm,20mm',
          theme: 'light'
        };
        await this.saveConfig();
      }
    } catch (error) {
      console.warn('⚠️  Could not load config, using defaults:', error);
      this.config = {
        defaultTemplate: 'github',
        defaultFormat: 'A4',
        defaultMargins: '20mm,20mm,20mm,20mm',
        theme: 'light'
      };
    }
  }

  /**
   * Save configuration to file
   */
  private async saveConfig(): Promise<void> {
    try {
      await writeFile(this.configFile, JSON.stringify(this.config, null, 2));
    } catch (error) {
      throw new ValidationError(
        `Failed to save configuration: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): UserConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<UserConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await this.saveConfig();
  }

  /**
   * Get templates directory path
   */
  getTemplatesDir(): string {
    return this.templatesDir;
  }

  /**
   * Add a custom template to the user's collection
   */
  async addCustomTemplate(
    cssFilePath: string,
    templateInfo: Omit<CustomTemplateInfo, 'id' | 'filePath' | 'createdAt'>
  ): Promise<string> {
    try {
      // Validate input file
      if (!existsSync(cssFilePath)) {
        throw new ValidationError(`Template file not found: ${cssFilePath}`);
      }

      const stats = statSync(cssFilePath);
      if (!stats.isFile()) {
        throw new ValidationError(`Path is not a file: ${cssFilePath}`);
      }

      const ext = extname(cssFilePath).toLowerCase();
      if (ext !== '.css') {
        throw new ValidationError(`Template must be a CSS file, got: ${ext}`);
      }

      // Generate unique template ID
      const templateId = this.generateTemplateId(templateInfo.name);
      const targetFile = join(this.templatesDir, `${templateId}.css`);

      // Copy template file
      await copyFile(cssFilePath, targetFile);

      // Save template metadata
      const metadata: CustomTemplateInfo = {
        ...templateInfo,
        id: templateId,
        filePath: targetFile,
        createdAt: new Date()
      };

      await this.saveTemplateMetadata(metadata);

      console.log(`✅ Added custom template: ${templateInfo.name} (${templateId})`);
      return templateId;

    } catch (error) {
      throw new ValidationError(
        `Failed to add custom template: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * List all custom templates
   */
  async listCustomTemplates(): Promise<CustomTemplateInfo[]> {
    try {
      const templates: CustomTemplateInfo[] = [];
      const metadataFile = join(this.templatesDir, 'metadata.json');

      if (existsSync(metadataFile)) {
        const data = await readFile(metadataFile, 'utf-8');
        const metadata = JSON.parse(data);
        
        for (const [id, info] of Object.entries(metadata)) {
          templates.push({
            ...(info as Omit<CustomTemplateInfo, 'id'>),
            id
          });
        }
      }

      return templates;
    } catch (error) {
      console.warn('⚠️  Could not load custom templates:', error);
      return [];
    }
  }

  /**
   * Get custom template file path by ID
   */
  async getCustomTemplate(templateId: string): Promise<string | null> {
    const templates = await this.listCustomTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (template && existsSync(template.filePath)) {
      return template.filePath;
    }
    
    return null;
  }

  /**
   * Remove a custom template
   */
  async removeCustomTemplate(templateId: string): Promise<boolean> {
    try {
      const templates = await this.listCustomTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        return false;
      }

      // Remove file
      if (existsSync(template.filePath)) {
        await import('fs/promises').then(fs => fs.unlink(template.filePath));
      }

      // Update metadata
      const metadataFile = join(this.templatesDir, 'metadata.json');
      if (existsSync(metadataFile)) {
        const data = await readFile(metadataFile, 'utf-8');
        const metadata = JSON.parse(data);
        delete metadata[templateId];
        await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
      }

      console.log(`🗑️  Removed custom template: ${template.name} (${templateId})`);
      return true;

    } catch (error) {
      console.warn('⚠️  Could not remove template:', error);
      return false;
    }
  }

  /**
   * Check if a template exists (built-in or custom)
   */
  async templateExists(templateName: string): Promise<{ exists: boolean; type: 'builtin' | 'custom' | 'file' }> {
    // Check built-in templates
    const builtinTemplates = [
      'github', 'github-dark',
      'academic', 'academic-dark', 
      'minimal', 'minimal-dark',
      'modern', 'modern-dark',
      'newspaper', 'newspaper-dark'
    ];
    
    if (builtinTemplates.includes(templateName.toLowerCase())) {
      return { exists: true, type: 'builtin' };
    }

    // Check custom templates
    const customTemplate = await this.getCustomTemplate(templateName);
    if (customTemplate) {
      return { exists: true, type: 'custom' };
    }

    // Check if it's a file path
    if (existsSync(templateName) && extname(templateName).toLowerCase() === '.css') {
      return { exists: true, type: 'file' };
    }

    return { exists: false, type: 'builtin' };
  }

  /**
   * Get configuration directory path
   */
  getConfigDir(): string {
    return this.configDir;
  }

  /**
   * Generate unique template ID from name
   */
  private generateTemplateId(name: string): string {
    const baseId = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const timestamp = Date.now().toString(36);
    return `${baseId}-${timestamp}`;
  }

  /**
   * Save template metadata
   */
  private async saveTemplateMetadata(template: CustomTemplateInfo): Promise<void> {
    const metadataFile = join(this.templatesDir, 'metadata.json');
    let metadata: Record<string, Omit<CustomTemplateInfo, 'id'>> = {};

    if (existsSync(metadataFile)) {
      try {
        const data = await readFile(metadataFile, 'utf-8');
        metadata = JSON.parse(data);
      } catch (error) {
        console.warn('⚠️  Could not read metadata file, creating new:', error);
      }
    }

    const { id, ...templateInfo } = template;
    metadata[id] = templateInfo;

    await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
  }

  /**
   * Reset configuration to defaults
   */
  async resetConfig(): Promise<void> {
    this.config = {
      defaultTemplate: 'github',
      defaultFormat: 'A4',
      defaultMargins: '20mm,20mm,20mm,20mm',
      theme: 'light'
    };
    await this.saveConfig();
    console.log('🔄 Configuration reset to defaults');
  }

  /**
   * Show current configuration
   */
  showConfig(): void {
    console.log('⚙️  Current Configuration:');
    console.log(`   Default Template: ${this.config.defaultTemplate || 'github'}`);
    console.log(`   Default Format: ${this.config.defaultFormat || 'A4'}`);
    console.log(`   Default Margins: ${this.config.defaultMargins || '20mm,20mm,20mm,20mm'}`);
    console.log(`   Theme: ${this.config.theme || 'light'}`);
    console.log(`   Config Directory: ${this.configDir}`);
    console.log(`   Templates Directory: ${this.templatesDir}`);
  }
}
