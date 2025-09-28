# 📦 **NPM Publication Guide**

## 🚀 **Ready to Publish!**

Your CLI tool is now configured for npm publication. Follow these steps:

---

## ✅ **Pre-Publication Checklist**

### **1. Package Configuration**
- ✅ **Package name**: `mdtopdf-converter` (available on npm)
- ✅ **Version**: `1.0.0` (initial release)
- ✅ **Binary**: `mdtopdf` command configured
- ✅ **License**: MIT license added
- ✅ **Files**: Configured to include only necessary files
- ✅ **Keywords**: SEO-optimized for discoverability

### **2. Repository Setup**
- ⚠️ **GitHub repo**: Update URLs in package.json with your actual repo
- ⚠️ **Email**: Update author email in package.json
- ✅ **README**: Comprehensive documentation ready
- ✅ **LICENSE**: MIT license included

### **3. Build & Test**
- ✅ **TypeScript build**: Compiles successfully
- ✅ **CLI executable**: Works with `node dist/cli/index.js`
- ✅ **All templates**: Dark themes with margin fixes working
- ✅ **Configuration**: Template and config management ready

---

## 📝 **Step-by-Step Publication**

### **Step 1: Create npm Account**
```bash
# If you don't have an npm account, create one at npmjs.com
# Then login:
npm login
```

### **Step 2: Update Repository URLs** 
Update these in `package.json` with your actual GitHub repository:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/mdtopdf-converter.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/mdtopdf-converter/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/mdtopdf-converter#readme",
  "author": {
    "name": "govindkm",
    "email": "YOUR_EMAIL@example.com"
  }
}
```

### **Step 3: Check Package Name Availability**
```bash
npm view mdtopdf-converter
# If it returns "npm ERR! 404", the name is available
# If it shows package info, choose a different name
```

### **Step 4: Final Build**
```bash
npm run build
```

### **Step 5: Publish to npm**
```bash
# Dry run first (see what will be published)
npm publish --dry-run

# If everything looks good, publish:
npm publish
```

---

## 🎯 **After Publication**

### **Users Can Install With:**
```bash
# Install globally
npm install -g mdtopdf-converter

# Use anywhere
mdtopdf convert document.md -t github-dark
mdtopdf templates list
mdtopdf config show
```

### **Alternative Installation Methods:**
```bash
# Using npx (no installation needed)
npx mdtopdf-converter convert document.md -t modern-dark

# Using yarn
yarn global add mdtopdf-converter
```

---

## 📊 **Package Features for Users**

When users install your package, they get:

### **🎨 Templates**
- **10 Built-in Templates**: 5 light + 5 dark themes
- **Custom Template Management**: Add, list, remove templates
- **Professional Styling**: GitHub, Academic, Modern, Minimal, Newspaper

### **🌙 Dark Theme Technology**
- **True Dark PDFs**: Complete dark backgrounds (no white margins)
- **Automatic Margin Detection**: Zero margins for dark themes
- **Color Preservation**: Advanced CSS for proper dark rendering

### **⚙️ Configuration System**
- **Persistent Settings**: Save preferences in `~/.mdtopdf/`
- **Default Templates**: Set your preferred template
- **Custom Directories**: Manage template storage

### **🚀 CLI Features**
- **Batch Processing**: Convert multiple files
- **Pattern Matching**: Use glob patterns for file discovery
- **Interactive Mode**: Select files interactively
- **Format Options**: A4, A3, A5, Letter, Legal, Tabloid
- **Custom Margins**: Configurable page margins

---

## 🛠️ **Alternative Names (if needed)**

If `mdtopdf-converter` is taken, try:
- `mdtopdf-cli`
- `markdown-pdf-converter`
- `mdtopdf-generator`
- `markdown-to-pdf-cli`
- `govind-mdtopdf`

---

## 📈 **Promotion Ideas**

### **GitHub**
- Create releases with changelog
- Add topics: `markdown`, `pdf`, `converter`, `cli`, `dark-theme`
- Include demo GIFs/screenshots

### **Documentation**
- Add installation instructions to README
- Create example usage videos
- Document all CLI commands

### **Community**
- Share on dev.to, Reddit (r/node, r/typescript)
- Tweet about the dark theme feature
- Submit to awesome-nodejs lists

---

## 🎉 **Your Package Will Provide**

```bash
# After: npm install -g mdtopdf-converter

# Users can run anywhere:
mdtopdf convert README.md -t github-dark
mdtopdf templates add custom.css -n "Corporate"
mdtopdf config set defaultTemplate modern-dark
mdtopdf convert *.md -o pdfs/ -t newspaper-dark
```

**Ready to make PDF conversion awesome for developers worldwide!** 🌟

---

*Next: Update the repository URLs and run `npm publish`*
