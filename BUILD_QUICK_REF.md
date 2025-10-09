# Build Scripts Quick Reference

## Commands

```bash
# Development
npm run dev                # Start development with hot reload
npm run build             # Build production assets

# Packaging
npm run package           # Internal testing package
npm run package:wporg     # WordPress.org package

# Cleanup
npm run clean             # Remove all builds
```

## Outputs

### Internal Testing (`npm run package`)
```
build-package/
├── analogwp-client-handoff-v1.0.0-testing/
├── analogwp-client-handoff-v1.0.0-testing.zip
└── TESTING_CHECKLIST.md
```
**Includes:** Source files, docs, testing guides

### WordPress.org (`npm run package:wporg`)
```
dist/
├── analogwp-client-handoff/
├── analogwp-client-handoff.1.0.0.zip (136K)
└── WPORG_SUBMISSION_CHECKLIST.txt
```
**Excludes:** Dev files (clean production build)

## Files

- **`.distignore`** - WordPress.org exclusion patterns
- **`build-package.sh`** - Internal testing builder
- **`build-wporg.sh`** - WordPress.org builder
- **`BUILD_SCRIPTS_GUIDE.md`** - Complete documentation

## Release Checklist

Before WordPress.org submission:

1. [ ] Update version in `analogwp-client-handoff.php`
2. [ ] Update `readme.txt` changelog
3. [ ] Run `npm run build` and test
4. [ ] Run `npm run package:wporg`
5. [ ] Test the ZIP on clean WordPress
6. [ ] Verify debug OFF = no console logs
7. [ ] Validate readme.txt online
8. [ ] Review `dist/WPORG_SUBMISSION_CHECKLIST.txt`
9. [ ] Submit to WordPress.org

## Quick Test

```bash
# Build WordPress.org package
npm run package:wporg

# Check contents
unzip -l dist/*.zip

# Review checklist
cat dist/WPORG_SUBMISSION_CHECKLIST.txt
```

## Version Management

Version is auto-detected from `analogwp-client-handoff.php`:
```php
* Version: 1.0.0
```

Update in one place, builds use it automatically!
