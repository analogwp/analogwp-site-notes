# Build & Package Scripts Guide

## Overview

This plugin includes the following build scripts for different distribution purposes:

### 2. `build-package.sh` - WordPress.org Distribution
- Creates clean packages for WordPress.org submission
- Respects `.distignore` file (excludes dev files)
- Validates required files
- Checks for development artifacts
- Generates submission checklist

## NPM Scripts

Added to `package.json`:

```json
{
  "scripts": {
    "build": "wp-scripts build",                    // Build production assets
    "start": "wp-scripts start",                     // Development with hot reload
    "dev": "wp-scripts start",                       // Alias for start
    "package": "npm run build && bash build-package.sh",      // Internal testing package
    "clean": "rm -rf build build-package dist *.zip *.tar.gz" // Clean all builds
  }
}
```

## Usage

### For WordPress.org Submission

```bash
# Build and create WordPress.org package
npm run package:wporg

# Output:
# - build/analogwp-site-notes/
# - build/analogwp-site-notes.1.0.0.zip
# - build/WPORG_SUBMISSION_CHECKLIST.txt
```

**Includes:**
- ✅ Main plugin file
- ✅ readme.txt (WordPress.org format)
- ✅ Compiled assets (`build/`)
- ✅ Includes directory
- ✅ Languages (if present)
- ✅ WordPress.org assets (if present)

**Excludes (via .distignore):**
- ❌ Source files (`src/`)
- ❌ Development files (package.json, webpack.config.js, etc.)
- ❌ Documentation (README.md, CHANGELOG.md, etc.)
- ❌ Build scripts
- ❌ node_modules, vendor
- ❌ Git files
- ❌ IDE files

### Clean All Builds

```bash
npm run clean
```

Removes:
- `build/` directory
- `build-package/` directory
- `dist/` directory
- All `.zip` and `.tar.gz` files

## .distignore File

Created `.distignore` following WordPress.org standards. This file tells the WordPress.org deployment process which files to exclude from the final distribution.

**Key exclusions:**
- Development dependencies (`node_modules`, `vendor`)
- Source files (`src/`)
- Build configurations (`webpack.config.js`, `package.json`)
- Documentation not needed in production
- IDE and version control files
- Build scripts

## Build Script Features

### build-wporg.sh (WordPress.org)
1. ✅ Automatically extracts version from plugin file
2. ✅ Builds production assets
3. ✅ Respects `.distignore` patterns
4. ✅ Copies only production-needed files
5. ✅ Verifies required files are present
6. ✅ Checks for development artifacts (warns if found)
7. ✅ Reports asset sizes
8. ✅ Creates clean ZIP package
9. ✅ Generates WordPress.org submission checklist
10. ✅ Provides submission guidance

## File Structure

### WordPress.org Package
```
analogwp-site-notes/
├── analogwp-site-notes.php
├── readme.txt             ← WordPress.org format
├── license.txt
├── includes/
├── build/                 ← Compiled assets only
├── languages/
└── .wordpress-org/        ← Assets (banners, icons)
```

## Version Management

Both scripts automatically extract the version from the main plugin file:
```php
* Version: 1.0.0
```

This ensures consistency across all builds. To release a new version:
1. Update version in `analogwp-site-notes.php`
2. Update `AGWP_SN_VERSION` constant
3. Update `readme.txt` Stable tag
4. Run build script (version is auto-detected)

## Pre-Submission Checklist

Before running `npm run package:wporg`:

- [ ] Update version in `analogwp-site-notes.php`
- [ ] Update `readme.txt` with changes
- [ ] Run `npm run build` and test locally
- [ ] Verify debug mode OFF shows no console logs
- [ ] Test on clean WordPress install
- [ ] Validate readme.txt at https://wordpress.org/plugins/developers/readme-validator/
- [ ] Check all features work as expected
- [ ] Create screenshots (optional but recommended)
- [ ] Create banner and icon (optional but recommended)

These are automatically included in the WordPress.org package.

## Troubleshooting

### Build fails with "node_modules not found"
```bash
npm install
npm run package
```

### Build fails with "Build directory not found"
```bash
npm run build
npm run package
```

### Version not detected
Check that `analogwp-site-notes.php` has this format:
```php
* Version: 1.0.0
```

### Package too large
- Check asset sizes in build summary
- Consider code splitting for large JS files
- Optimize images in `.wordpress-org/`

### Development files in WordPress.org package
- Check `.distignore` patterns
- Verify `build-wporg.sh` artifact check
- Clean and rebuild: `npm run clean && npm run package:wporg`

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines:

### GitHub Actions Example
```yaml
- name: Build and Package
  run: |
    npm ci
    npm run package:wporg
    
- name: Upload Artifact
  uses: actions/upload-artifact@v3
  with:
    name: plugin-package
    path: dist/*.zip
```

## Summary

✅ **Created Files:**
- `.distignore` - WordPress.org exclusion rules
- `build-wporg.sh` - WordPress.org package builder
- Updated `package.json` - Added npm scripts
- Updated `build-package.sh` - Auto version detection

✅ **NPM Scripts:**
- `npm run package` - Internal testing package
- `npm run package:wporg` - WordPress.org package
- `npm run clean` - Clean all builds

✅ **Features:**
- Automatic version detection
- Respects `.distignore` for WordPress.org
- Verifies required files
- Checks for dev artifacts
- Generates checklists
- Creates clean ZIP packages

Ready for both internal testing and WordPress.org submission! 🚀
