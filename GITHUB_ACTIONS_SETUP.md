# 🔧 GitHub Actions Setup Guide

## 🚀 Automated NPM Publishing

This repository includes GitHub Actions workflows that automatically:
- ✅ Test your code on multiple Node.js versions
- ✅ Build the TypeScript project
- ✅ Publish to npm when version changes
- ✅ Create GitHub releases automatically
- ✅ Run security audits

## 🔑 Required Setup: NPM Token

To enable automatic publishing, you need to add your NPM authentication token to GitHub Secrets.

### Step 1: Generate NPM Token

1. **Login to npm**:
   ```bash
   npm login
   ```

2. **Generate an automation token**:
   ```bash
   npm token create --type=automation
   ```
   
   Or create one through the npm website:
   - Go to [npmjs.com](https://www.npmjs.com)
   - Login to your account
   - Go to "Access Tokens" in your profile
   - Click "Generate New Token"
   - Choose "Automation" type
   - Copy the generated token

### Step 2: Add Token to GitHub Secrets

1. **Go to your GitHub repository**:
   - Navigate to `https://github.com/Govindkm/MDTOPDFConverter`

2. **Access Settings**:
   - Click on "Settings" tab
   - Click on "Secrets and variables" → "Actions"

3. **Add New Secret**:
   - Click "New repository secret"
   - **Name**: `NPM_TOKEN`
   - **Value**: Paste your npm token (starts with `npm_...`)
   - Click "Add secret"

## 🔄 How Auto-Publishing Works

### Trigger Conditions

The workflow automatically runs when:
- ✅ You push changes to `master` or `main` branch
- ✅ Files in `package.json`, `src/`, or `dist/` are modified
- ✅ Version in `package.json` is different from published version

### Workflow Steps

1. **Version Check**: Compares `package.json` version with npm registry
2. **Build & Test**: Compiles TypeScript and runs basic tests
3. **Publish**: If version changed, publishes to npm with `--access=public`
4. **Release**: Creates GitHub release with auto-generated notes
5. **Tagging**: Creates git tag for the new version

### Manual Publishing Workflow

To publish a new version:

1. **Update version** in `package.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. **Commit and push**:
   ```bash
   git add package.json
   git commit -m "🔖 Bump version to 1.0.1"
   git push origin master
   ```

3. **GitHub Actions will automatically**:
   - Detect the version change
   - Build the project
   - Publish to npm
   - Create a GitHub release

## 📋 Available Workflows

### 1. `ci-cd.yml` - Comprehensive Testing
- Runs on: All pushes and PRs
- Tests: Multiple Node.js versions (18.x, 20.x, 22.x)
- Features: Security audit, package size check
- Publishes: Only on releases or `[publish]` in commit message

### 2. `auto-publish.yml` - Simple Auto-Publishing
- Runs on: Pushes to master with relevant file changes
- Tests: Basic CLI functionality
- Publishes: Automatically when version changes
- Creates: GitHub releases and tags

## 🎯 Usage Examples

### Version Bump Examples

```bash
# Patch version (1.0.0 → 1.0.1)
npm version patch
git push origin master

# Minor version (1.0.1 → 1.1.0)
npm version minor
git push origin master

# Major version (1.1.0 → 2.0.0)
npm version major
git push origin master
```

### Manual Control

```bash
# Force publish with commit message
git commit -m "Add new template [publish]"
git push origin master

# Skip auto-publish
git commit -m "Update docs [skip-publish]"
git push origin master
```

## 🔒 Security Features

- ✅ **Token Security**: NPM token stored in GitHub Secrets
- ✅ **Audit Checks**: Automated security vulnerability scanning
- ✅ **Package Verification**: Dry-run before publishing
- ✅ **Size Monitoring**: Alerts for large package sizes

## 🎉 Benefits

- 🚀 **Zero-friction releases**: Just update version and push
- 🔄 **Consistent publishing**: Same process every time
- 📝 **Auto-documentation**: Generated release notes
- 🏷️ **Proper tagging**: Semantic versioning tags
- 🧪 **Quality assurance**: Tests run before publishing

## 🆘 Troubleshooting

### Common Issues

**1. NPM_TOKEN not working**
```
Error: npm ERR! code E401
```
- Check if token is correctly added to GitHub Secrets
- Ensure token has "Automation" permissions
- Regenerate token if expired

**2. Version not detected**
```
No version change detected
```
- Ensure `package.json` version is different from npm
- Check if changes are in the right branch (`master`/`main`)

**3. Build failures**
```
npm run build failed
```
- Check TypeScript compilation errors
- Ensure all dependencies are in `package.json`

### Debug Steps

1. **Check workflow runs**: GitHub → Actions tab
2. **View logs**: Click on failed workflow run
3. **Test locally**: Run `npm run build` and `npm pack --dry-run`

## 📞 Support

If you encounter issues:
1. Check the [Actions tab](https://github.com/Govindkm/MDTOPDFConverter/actions) for error logs
2. Verify NPM token is correctly set in repository secrets
3. Test commands locally before pushing

---

**🤖 Your package will now automatically publish whenever you update the version!**
