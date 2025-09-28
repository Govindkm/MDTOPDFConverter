#!/bin/bash

# Test Installation Script for mdtopdf-converter
echo "🧪 Testing package installation and functionality..."

# Create test directory
mkdir -p /tmp/mdtopdf-test
cd /tmp/mdtopdf-test

# Create test markdown file
cat > test.md << 'EOF'
# Test Document

This is a test document for **mdtopdf-converter**.

## Features
- Dark theme support
- Custom templates
- Professional output

## Code Example
```javascript
console.log('Hello from mdtopdf-converter!');
```

## List Example
1. First item
2. Second item
3. Third item

> This is a blockquote to test styling.

End of test document.
EOF

echo "✅ Created test markdown file"

# Test package locally (simulate global installation)
echo "🔍 Testing local package..."

# Change back to project directory
cd /home/govind/Desktop/Roughpad/Roughpad/MDTOPDFConverter

# Test all main functions
echo "1. Testing help..."
node dist/cli/index.js --help

echo -e "\n2. Testing version..."
node dist/cli/index.js --version

echo -e "\n3. Testing templates list..."
node dist/cli/index.js templates list

echo -e "\n4. Testing config show..."
node dist/cli/index.js config show

echo -e "\n5. Testing conversion with dark theme..."
node dist/cli/index.js convert /tmp/mdtopdf-test/test.md -t github-dark -o /tmp/mdtopdf-test/test-dark.pdf

echo -e "\n6. Testing conversion with light theme..."
node dist/cli/index.js convert /tmp/mdtopdf-test/test.md -t github -o /tmp/mdtopdf-test/test-light.pdf

echo -e "\n📊 Generated files:"
ls -la /tmp/mdtopdf-test/

echo -e "\n✅ Package testing complete!"
echo "🚀 Ready for npm publish!"
