# 🧪 GitHub Actions Workflow Testing

## 📦 Auto-Publish Workflow Behavior

The `auto-publish.yml` workflow will **only publish to npm** when:

### ✅ Required Conditions (ALL must be true):

1. **Push to master/main branch** ✅
2. **package.json file is modified** ✅  
3. **Version field in package.json actually changed** ✅
4. **New version is different from published npm version** ✅

### ❌ Will NOT publish when:

- Only source code changes (src/, dist/) without package.json version change
- package.json changes but version stays the same
- Version in package.json matches already published npm version
- Push to other branches
- Only documentation changes

## 🧪 Test Scenarios

### Scenario 1: Version Bump (✅ Will Publish)
```bash
# Current package.json: "version": "1.0.0"
# Edit package.json to: "version": "1.0.1"

git add package.json
git commit -m "🔖 Bump version to 1.0.1"
git push origin master

# Result: ✅ Publishes to npm
```

### Scenario 2: Code Changes Only (❌ Won't Publish)
```bash
# Only modify src/cli/index.ts
git add src/
git commit -m "Fix CLI bug"
git push origin master

# Result: ❌ Workflow doesn't run (package.json not changed)
```

### Scenario 3: package.json Metadata Change (❌ Won't Publish)
```bash
# Change description but keep same version
# "description": "Updated description"
# "version": "1.0.1" (unchanged)

git add package.json
git commit -m "Update description"
git push origin master

# Result: ❌ Workflow runs but skips publish (no version change)
```

### Scenario 4: Same Version as Published (❌ Won't Publish)
```bash
# package.json version: "1.0.1"
# npm published version: "1.0.1" (same)

git add package.json
git commit -m "Try to republish same version"
git push origin master

# Result: ❌ Workflow runs but skips publish (version already published)
```

## 🎯 Quick Version Update Commands

### Using npm version commands (Recommended):
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

### Manual version update:
```bash
# Edit package.json manually
vim package.json  # Change version field

git add package.json
git commit -m "🔖 Release v1.0.2"
git push origin master
```

## 📋 Workflow Logs

When you push changes, check the workflow status:

### ✅ Success Messages:
```
📋 Current package.json version: 1.0.1
📦 Published npm version: 1.0.0
🆕 Version change detected! Will publish 1.0.1
✅ Version changed in package.json: 1.0.0 → 1.0.1
🚀 Publishing version 1.0.1 to NPM...
✅ Successfully published version 1.0.1!
```

### ⏹️ Skip Messages:
```
ℹ️ package.json modified but version unchanged: 1.0.1
🔄 This workflow only publishes when the version in package.json changes
💡 To publish a new version:
   1. Update version in package.json (e.g., 1.0.1 → 1.0.2)
   2. Commit and push the change
   3. This workflow will automatically publish to npm
```

## 🔧 Current Workflow Status

**Trigger**: Only on package.json changes to master/main  
**Version Check**: Compares commit vs npm registry  
**Publishing**: Automatic when version changes  
**Releases**: Auto-generated GitHub releases  

## 💡 Pro Tips

1. **Use semantic versioning**: patch (x.y.Z), minor (x.Y.z), major (X.y.z)
2. **Test locally first**: `npm run build && npm run test:ci`
3. **Check current versions**: `npm run check-version`
4. **Monitor workflow**: Check GitHub Actions tab after pushing

---

**🎯 The workflow is now precisely configured to only publish when package.json version changes!**
