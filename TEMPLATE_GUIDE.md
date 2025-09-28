# 🎨 Advanced Template & Configuration Guide

## 🌟 What's New

Your MDToPDF Converter now includes:
- **10 Built-in Templates** (5 light + 5 dark themes)
- **Custom Template Management** (add your own CSS templates)
- **Configuration System** (save your preferences)
- **Template Persistence** (templates stored in `~/.mdtopdf/`)

---

## 🎨 Built-in Templates

### Light Themes
- **`github`** - GitHub-style markdown with clean typography
- **`academic`** - Academic paper style with proper citations
- **`minimal`** - Clean and minimal design focused on content
- **`modern`** - Modern design with colors and enhanced typography
- **`newspaper`** - Multi-column newspaper-style layout

### Dark Themes 🌙
- **`github-dark`** - GitHub styling with dark background
- **`academic-dark`** - Academic layout with dark theme
- **`minimal-dark`** - Minimal design with dark background
- **`modern-dark`** - Modern design with dark theme and neon accents
- **`newspaper-dark`** - Dark newspaper layout with vintage styling

---

## 📋 Template Management Commands

### List All Templates
```bash
# View all available templates (built-in + custom)
mdtopdf templates list
```

### Add Custom Templates
```bash
# Add with auto-generated name
mdtopdf templates add my-style.css

# Add with custom details
mdtopdf templates add professional.css \
  -n "Professional" \
  -d "Business template with modern styling" \
  -a "Your Name"
```

### Remove Custom Templates
```bash
# Remove a custom template by ID
mdtopdf templates remove my-template-abc123

# Templates are stored in ~/.mdtopdf/templates/
```

---

## ⚙️ Configuration System

### View Current Configuration
```bash
mdtopdf config show
```

### Set Configuration Options
```bash
# Set default template (used when no -t specified)
mdtopdf config set defaultTemplate github-dark

# Set default page format
mdtopdf config set defaultFormat A3

# Set default margins
mdtopdf config set defaultMargins "15mm,20mm,15mm,20mm"

# Set theme preference
mdtopdf config set theme dark
```

### Reset to Defaults
```bash
mdtopdf config reset
```

### Show Config Directories
```bash
mdtopdf config dir
```

---

## 🎯 Usage Examples

### Using Built-in Templates
```bash
# Light themes
mdtopdf convert README.md -t github
mdtopdf convert paper.md -t academic
mdtopdf convert notes.md -t minimal

# Dark themes
mdtopdf convert README.md -t github-dark
mdtopdf convert presentation.md -t modern-dark
mdtopdf convert article.md -t newspaper-dark
```

### Using Custom Templates
```bash
# After adding custom template
mdtopdf convert document.md -t my-custom-template-id

# Direct CSS file usage (no need to add first)
mdtopdf convert document.md -t ./my-styles.css
```

### Using Default Configuration
```bash
# Will use your configured default template
mdtopdf convert document.md -o output.pdf

# Override default template for one conversion
mdtopdf convert document.md -t modern-dark -o output.pdf
```

---

## 🛠️ Custom Template Development

### CSS Template Structure
```css
/* Your Custom Template */
* {
  box-sizing: border-box;
}

body {
  font-family: 'Your Font', sans-serif;
  line-height: 1.6;
  color: #your-color;
  background-color: #your-bg;
  margin: 0;
  padding: 0;
}

.document {
  padding: 40px;
  max-width: 100%;
}

/* Customize headings */
h1, h2, h3, h4, h5, h6 {
  /* Your heading styles */
}

/* Style code blocks */
pre {
  /* Your code block styles */
}

/* Print optimizations */
@media print {
  body {
    font-size: 12pt;
    background-color: white !important;
  }
  /* More print styles */
}
```

### Best Practices
1. **Always include print styles** for PDF optimization
2. **Use relative units** (em, rem, %) for better scaling
3. **Test with different content** to ensure compatibility
4. **Include page-break-* properties** for better pagination
5. **Optimize for readability** in PDF format

---

## 📁 File Locations

### Configuration Directory
- **Linux/Mac**: `~/.mdtopdf/`
- **Windows**: `%USERPROFILE%\.mdtopdf\`

### Files Structure
```
~/.mdtopdf/
├── config.json              # User configuration
├── templates/                # Custom templates directory
│   ├── my-template-123.css  # Custom template files
│   └── metadata.json        # Template metadata
```

---

## 🚀 Advanced Workflows

### Batch Processing with Themes
```bash
# Convert all markdown files with dark theme
mdtopdf convert *.md -t github-dark -o output/

# Interactive selection with custom template
mdtopdf convert -i -p "docs/**/*.md" -t my-custom-template
```

### Configuration Profiles
```bash
# Setup for academic writing
mdtopdf config set defaultTemplate academic
mdtopdf config set defaultFormat A4
mdtopdf config set defaultMargins "25mm,20mm,25mm,20mm"

# Setup for presentations
mdtopdf config set defaultTemplate modern-dark
mdtopdf config set defaultFormat A3
```

### Template Management Workflow
```bash
# 1. Create your CSS template
# 2. Add to system
mdtopdf templates add my-theme.css -n "My Theme"

# 3. Set as default (optional)
mdtopdf config set defaultTemplate my-theme-id

# 4. Use for conversions
mdtopdf convert *.md
```

---

## 🎨 Template Showcase

The new system includes professionally designed templates:

- **Light Themes**: Perfect for traditional documents
- **Dark Themes**: Great for modern presentations and night reading
- **Custom Templates**: Unlimited customization for your brand

Each template is optimized for:
- ✅ **PDF generation**
- ✅ **Print compatibility**
- ✅ **Professional typography**
- ✅ **Responsive layouts**
- ✅ **Code syntax highlighting**

---

## 🔧 Troubleshooting

### Template Not Found
```bash
# Check available templates
mdtopdf templates list

# Verify template ID spelling
mdtopdf config show
```

### Configuration Issues
```bash
# Reset to defaults
mdtopdf config reset

# Check directories exist
mdtopdf config dir
```

### Custom Template Problems
```bash
# Validate CSS file exists
ls -la your-template.css

# Check CSS syntax before adding
```

---

## 📚 Next Steps

1. **Explore all 10 built-in templates**
2. **Create your own custom templates**
3. **Set up your preferred configuration**
4. **Automate with your custom defaults**

Happy converting! 🎉
