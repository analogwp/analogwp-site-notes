# WordPress.org Source Files Documentation

## Overview

This plugin includes source files as required by WordPress.org for plugins that use build processes. This allows WordPress.org reviewers to verify that the built JavaScript and CSS files match the source code.

## What's Included in WordPress.org Package

### Source Files
- **`/src/`** - Complete source code directory
  - `/src/admin/` - Admin panel React components
  - `/src/frontend/` - Frontend comment tool React components  
  - `/src/shared/` - Shared utilities and components

### Build Configuration Files
The following build configuration files are included to allow reviewers to rebuild the assets:

- **`package.json`** - NPM dependencies and build scripts
- **`webpack.config.js`** - Webpack build configuration
- **`postcss.config.js`** - PostCSS configuration (for Tailwind CSS)
- **`tailwind.config.js`** - Tailwind CSS configuration

### Built Assets (Production)
- **`/build/`** - Compiled JavaScript and CSS files
  - `admin.js` - Admin panel bundle
  - `admin.css` - Admin panel styles
  - `frontend.js` - Frontend bundle
  - `frontend.css` - Frontend styles

### Plugin Files
- **`analogwp-client-handoff.php`** - Main plugin file
- **`/includes/`** - PHP backend files
- **`readme.txt`** - WordPress.org readme

## How to Rebuild from Source

If you need to rebuild the plugin from source:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Or build for development with watch mode
npm run dev
```

## What's Excluded

The following files are excluded from the WordPress.org package:

### Development Files
- `package-lock.json` / `yarn.lock` - Lock files (not needed)
- `.eslintrc*` - ESLint configuration
- `.babelrc` - Babel configuration  
- `tsconfig.json` - TypeScript configuration
- `composer.json` - Composer dependencies

### Documentation
- `README.md` - GitHub readme (not needed on WP.org)
- `CHANGELOG.md` - Changelog (use readme.txt instead)
- Other markdown documentation files

### Build Scripts
- `build-package.sh` - Internal build script
- `build-wporg.sh` - WordPress.org build script
- Other shell scripts

### Version Control
- `.git/` - Git repository
- `.github/` - GitHub Actions
- `.gitignore` - Git ignore file

### IDE & Testing
- `.vscode/` - VS Code settings
- `.idea/` - PhpStorm settings
- `/tests/` - Test files
- `/node_modules/` - NPM dependencies

## WordPress.org Review Process

WordPress.org reviewers can:

1. **Verify source code** - Check `/src/` for the original JavaScript/React code
2. **Rebuild assets** - Use `npm install && npm run build` to rebuild
3. **Compare builds** - Ensure built files match source code
4. **Review changes** - See what was modified in each version

## Why Source Files Are Required

WordPress.org requires source files for plugins using build tools because:

1. **Security** - Reviewers can verify minified code matches source
2. **Transparency** - Users can see exactly what code is running
3. **Trust** - Ensures no malicious code in built files
4. **Compliance** - Meets WordPress.org plugin guidelines

## Package Size

The WordPress.org package includes:
- Source files: ~500KB
- Built files: ~300KB
- PHP files: ~100KB
- **Total package**: ~900KB (compressed to ~200KB in ZIP)

The source files add minimal size but provide crucial transparency for WordPress.org review.

## Build Command

To create a WordPress.org package:

```bash
npm run package:wporg
```

This will:
1. Run `npm run build` to compile assets
2. Execute `build-wporg.sh` to create clean package
3. Respect `.distignore` exclusion rules
4. Output to `dist/analogwp-client-handoff.{version}.zip`

## Support

For questions about the source files or build process:
- Check build scripts: `build-wporg.sh`
- Review webpack config: `webpack.config.js`
- See package scripts: `package.json`
