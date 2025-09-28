# 📝 MDToPDF Converter

A powerful, professional CLI tool for converting Markdown and HTML files to PDF with **10 built-in templates**, **dark theme support**, and **custom template management**.

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Key Features

- ✅ **Batch Processing** - Convert multiple files at once
- 🎨 **10 Professional Templates** - 5 light + 5 dark themes
- 🌙 **Dark Theme Support** - All templates have dark variants
- 🛠️ **Custom Templates** - Add your own CSS templates
- ⚙️ **Configuration Management** - Save your preferences
- 🔄 **Pattern Matching** - Use glob patterns for file discovery
- 📱 **Interactive Mode** - Select files interactively
- 📄 **Multiple Formats** - A4, A3, A5, Letter, Legal, Tabloid
- 🎯 **Industry Standards** - TypeScript, ES modules, comprehensive error handling

## 🚀 Quick Start

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd MDTOPDFConverter

# Install dependencies
npm install

# Build the project
npm run build

# Test installation
npm run dev -- --help
```

### Basic Usage
```bash
# Convert single file
mdtopdf convert document.md

# Convert with specific template
mdtopdf convert document.md -t github-dark

# Batch convert all markdown files
mdtopdf convert *.md -o output/

# Interactive file selection
mdtopdf convert -i -p "**/*.md"
```

## 🎨 Template System

### Built-in Templates

#### Light Themes
- **`github`** - Clean GitHub-style markdown
- **`academic`** - Professional academic papers
- **`minimal`** - Minimalist design focused on content
- **`modern`** - Contemporary with colors and gradients
- **`newspaper`** - Multi-column newspaper layout

#### Dark Themes 🌙 (True Dark PDFs)
- **`github-dark`** - GitHub with complete dark background (`#0d1117`)
- **`academic-dark`** - Academic papers with full dark theme (`#1a1a1a`)
- **`minimal-dark`** - Clean dark design with dark background (`#1a1a1a`)
- **`modern-dark`** - Modern with dark theme and neon accents (`#0f172a`)
- **`newspaper-dark`** - Dark newspaper with vintage styling (`#1a1a1a`)

> **✨ Special Feature**: These are **true dark themes** that maintain dark backgrounds in the final PDF, perfect for night reading, presentations, and modern aesthetics.

### Template Management
```bash
# List all templates
mdtopdf templates list

# Add custom template
mdtopdf templates add my-style.css -n "My Template"

# Remove custom template
mdtopdf templates remove template-id
```

## ⚙️ Configuration System

Set your preferences once, use everywhere:

```bash
# View current configuration
mdtopdf config show

# Set default template
mdtopdf config set defaultTemplate modern-dark

# Set default page format
mdtopdf config set defaultFormat A3

# Reset to defaults
mdtopdf config reset
```

## 📖 Usage Examples

### Basic Conversions
```bash
# Single file with GitHub template
mdtopdf convert README.md -t github

# Multiple files with output directory
mdtopdf convert *.md -o pdfs/ -t academic-dark

# Recursive pattern matching
mdtopdf convert -p "docs/**/*.md" -r -t minimal
```

### Advanced Usage
```bash
# Custom margins and format
mdtopdf convert doc.md -m "20mm,15mm,20mm,15mm" -f A3

# Interactive selection with custom template
mdtopdf convert -i -p "*.md" -t ./my-styles.css

# High quality output
mdtopdf convert report.md -q 100 -t modern
```

### Batch Processing
```bash
# Convert all markdown files in project
mdtopdf convert -p "**/*.md" -r -o output/

# Convert with custom settings
mdtopdf convert *.md -t newspaper-dark -f Letter -o reports/
```

## 🛠️ Commands Reference

### Convert Command
```bash
mdtopdf convert [input...] [options]

Options:
  -o, --output <path>         Output file or directory
  -p, --pattern <pattern>     File pattern (e.g., "*.md", "**/*.html")
  -r, --recursive             Search recursively in subdirectories
  -i, --interactive           Interactive file selection mode
  -t, --template <name>       Template name or CSS file path
  -m, --margins <margins>     PDF margins: "top,right,bottom,left"
  -f, --format <format>       PDF page format (A4, A3, A5, Letter, etc.)
  -q, --quality <number>      PDF quality (0-100, default: 80)
```

### Templates Command
```bash
mdtopdf templates <subcommand>

Subcommands:
  list                        List all available templates
  add <css-file> [options]    Add a custom template
  remove <template-id>        Remove a custom template
```

### Config Command
```bash
mdtopdf config <subcommand>

Subcommands:
  show                        Show current configuration
  set <key> <value>          Set configuration option
  reset                       Reset configuration to defaults
  dir                         Show configuration directories
```

## 🎯 Configuration Options

| Key | Description | Valid Values |
|-----|-------------|--------------|
| `defaultTemplate` | Default template for conversions | Any template name or ID |
| `defaultFormat` | Default PDF page format | A4, A3, A5, Letter, Legal, Tabloid |
| `defaultMargins` | Default PDF margins | "top,right,bottom,left" (e.g., "20mm,20mm,20mm,20mm") |
| `theme` | Theme preference | light, dark, auto |

## 📁 File Structure

```
~/.mdtopdf/                 # Configuration directory
├── config.json            # User preferences
└── templates/              # Custom templates
    ├── my-template.css     # Custom template files
    └── metadata.json       # Template metadata
```

## 🔧 Development

### Project Structure
```
src/
├── cli/                    # CLI commands and interface
│   ├── index.ts           # Main CLI entry point
│   └── command.ts         # Command definitions
├── core/                   # Core functionality
│   ├── converter.ts       # Main conversion orchestrator
│   ├── fileProcessor.ts   # File discovery and processing
│   ├── pdfGenerator.ts    # PDF generation with Puppeteer
│   ├── templateManager.ts # Template management system
│   └── configManager.ts   # Configuration management
├── utils/                  # Utilities
│   └── validator.ts       # Input validation
└── types/                  # TypeScript type definitions
    └── index.ts           # Shared interfaces and types
```

### Build & Development
```bash
# Development mode with hot reload
npm run dev -- convert file.md

# Build TypeScript to JavaScript
npm run build

# Run tests (if implemented)
npm test

# Type checking
npx tsc --noEmit
```

### Creating Custom Templates

1. **Create CSS file** with your styles
2. **Add to system**: `mdtopdf templates add my-style.css`
3. **Use in conversions**: `mdtopdf convert file.md -t my-template-id`

See [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md) for detailed template development guide.

## 🐛 Troubleshooting

### Common Issues

**Template not found**
```bash
# Check available templates
mdtopdf templates list

# Verify spelling
mdtopdf config show
```

**File not found**
```bash
# Check file exists
ls -la your-file.md

# Use absolute paths if needed
mdtopdf convert /full/path/to/file.md
```

**Permission errors**
```bash
# Check output directory permissions
ls -ld output/

# Create directory if needed
mkdir -p output/
```

### Debug Mode
```bash
# Enable verbose logging (if available)
DEBUG=mdtopdf:* mdtopdf convert file.md
```

## 🌙 True Dark Theme Technology

Our dark themes use advanced CSS and Puppeteer configuration to create **genuine dark PDFs**:

### **CSS Implementation**
```css
/* Full page dark background */
html, body {
  background-color: #0d1117 !important;
  margin: 0 !important;
  min-height: 100vh !important;
}

@media print {
  @page { margin: 0 !important; }
  body {
    background-color: #0d1117 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
```

### **Puppeteer Configuration**
```javascript
// Zero margins for dark themes to eliminate white borders
const pdfOptions = {
  printBackground: true,
  margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
};

// Color preservation
await page.addStyleTag({
  content: `* {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }`
});
```

### **Smart Margin Handling**
- **Dark themes**: Automatically use zero margins for full-page dark coverage
- **Light themes**: Use standard 20mm margins for professional appearance  
- **Custom margins**: User-specified margins override automatic behavior

**Result**: PDFs with complete dark backgrounds and no white borders - true dark theme PDFs!

## 📈 Performance

- **Fast conversion**: Optimized Puppeteer usage
- **Memory efficient**: Browser instance reuse
- **Batch processing**: Process multiple files in single browser session
- **Template caching**: Templates cached for repeated use
- **Color preservation**: Advanced CSS ensures dark themes render correctly

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♀️ Support

- 📖 **Documentation**: [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🎉 Acknowledgments

- **Puppeteer** - For reliable PDF generation
- **Commander.js** - For excellent CLI interface
- **TypeScript** - For type safety and developer experience
- **Marked** - For Markdown parsing

---

**Made with ❤️ for developers who love beautiful PDFs**

Start converting with: `mdtopdf convert your-file.md -t modern-dark`
