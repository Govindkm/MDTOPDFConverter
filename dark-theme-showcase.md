# 🌙 Dark Theme Showcase

Welcome to the **Dark Theme PDF Converter**! This document demonstrates how the new dark themes render with **full dark backgrounds** in PDF format.

## 🎨 What Makes This Special

- **True Dark PDFs**: Complete dark backgrounds, not just dark text
- **Eye-friendly**: Perfect for night reading or presentations
- **Professional**: Maintains readability and elegance
- **Color Preserved**: Uses `print-color-adjust: exact` for proper rendering

## 📝 Content Examples

### Code Blocks

Here's some example code with syntax highlighting:

```javascript
// Dark theme JavaScript example
function createDarkTheme() {
  const theme = {
    background: '#0d1117',
    text: '#f0f6fc',
    accent: '#58a6ff'
  };
  
  return theme;
}

console.log('🌙 Dark theme activated!');
```

### Tables

| Template | Background | Text Color | Special Features |
|----------|------------|------------|------------------|
| GitHub Dark | `#0d1117` | `#f0f6fc` | Clean, modern |
| Modern Dark | `#0f172a` | `#e2e8f0` | Gradients, neon accents |
| Minimal Dark | `#1a1a1a` | `#e8e8e8` | Clean, focused |
| Academic Dark | `#1a1a1a` | `#e8e8e8` | Professional, serif |
| Newspaper Dark | `#1a1a1a` | `#e8e8e8` | Multi-column, vintage |

### Blockquotes

> "The best dark themes don't just invert colors - they create a harmonious, professional appearance that's easy on the eyes while maintaining excellent readability."

### Lists and Features

- ✅ **Full page dark backgrounds**
- ✅ **Proper color preservation in PDF**
- ✅ **Optimized for print and screen**
- ✅ **Professional typography**
- ✅ **Consistent styling throughout**

#### Nested Lists

1. **Template Categories**
   - Light themes (original 5)
   - Dark themes (new 5 variants)
   - Custom templates (unlimited)

2. **Technical Features**
   - CSS `print-color-adjust: exact`
   - Puppeteer `printBackground: true`
   - Browser color preservation
   - Professional PDF generation

## 🚀 Usage Examples

### Command Line Usage
```bash
# Use any dark theme
mdtopdf convert document.md -t github-dark
mdtopdf convert report.md -t modern-dark
mdtopdf convert notes.md -t minimal-dark

# Set as default
mdtopdf config set defaultTemplate github-dark
```

### Template Comparison

**Light vs Dark Themes:**

- **GitHub** → **GitHub Dark**: Same layout, dark background
- **Modern** → **Modern Dark**: Neon accents on dark background  
- **Minimal** → **Minimal Dark**: Clean typography, dark aesthetic
- **Academic** → **Academic Dark**: Professional papers, dark theme
- **Newspaper** → **Newspaper Dark**: Vintage columns, dark styling

## 🎯 Perfect For...

- 📖 **Night Reading**: Easy on the eyes in low light
- 🎤 **Presentations**: Professional dark slides
- 💻 **Developer Docs**: Code-friendly dark backgrounds
- 📄 **Modern Reports**: Contemporary business documents
- 🎨 **Creative Work**: Stylish, modern aesthetics

---

## 🔧 Technical Implementation

This dark theme system uses advanced CSS and Puppeteer configuration:

- `background-color: #color !important` - Forces dark backgrounds
- `print-color-adjust: exact !important` - Preserves colors in PDF
- `min-height: 100vh` - Ensures full page coverage
- `printBackground: true` - Puppeteer setting for backgrounds

The result is **true dark theme PDFs** that maintain their dark appearance when printed or viewed, unlike typical dark themes that convert to white backgrounds in print.

---

*Generated with MDToPDF Converter - True Dark Theme Support* 🌙
