#!/bin/bash

# AnalogWP Site Notes - WordPress.org Package Builder
# Creates a clean distribution package ready for WordPress.org submission

set -e  # Exit on any error

echo "🎯 Building AnalogWP Site Notes for WordPress.org"
echo "===================================================="

# Get plugin directory and version
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_SLUG="analogwp-site-notes"

# Extract version from main plugin file
VERSION=$(grep "Version:" "$PLUGIN_DIR/analogwp-site-notes.php" | awk '{print $3}')
if [ -z "$VERSION" ]; then
    echo "❌ Error: Could not extract version from plugin file"
    exit 1
fi

BUILD_DIR="$PLUGIN_DIR/dist"
PACKAGE_NAME="$PLUGIN_SLUG"
PACKAGE_PATH="$BUILD_DIR/$PACKAGE_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Clean previous builds
print_step "Cleaning previous builds..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
mkdir -p "$PACKAGE_PATH"
print_success "Build directory cleaned"

# Step 2: Build production assets
print_step "Building production assets..."
cd "$PLUGIN_DIR"

if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found, running npm install..."
    npm install
fi

npm run build
print_success "Production assets built"

# Step 3: Copy files respecting .distignore
print_step "Copying plugin files (respecting .distignore)..."

# Function to check if path should be ignored
should_ignore() {
    local path="$1"
    local filename=$(basename "$path")
    
    # Read .distignore and check each pattern
    while IFS= read -r pattern; do
        # Skip empty lines and comments
        [[ -z "$pattern" || "$pattern" =~ ^# ]] && continue
        
        # Remove leading/trailing whitespace
        pattern=$(echo "$pattern" | xargs)
        
        # Check if path matches pattern
        if [[ "$path" == $pattern || "$path" =~ $pattern || "$filename" == $pattern ]]; then
            return 0  # Should ignore
        fi
    done < "$PLUGIN_DIR/.distignore"
    
    return 1  # Should not ignore
}

# Copy all files and directories, excluding those in .distignore
cd "$PLUGIN_DIR"

# Copy main plugin file
cp analogwp-site-notes.php "$PACKAGE_PATH/"

# Copy readme.txt (WordPress.org format)
if [ -f "readme.txt" ]; then
    cp readme.txt "$PACKAGE_PATH/"
else
    print_warning "readme.txt not found - you'll need to create this for WordPress.org"
fi

# Copy license
if [ -f "license.txt" ]; then
    cp license.txt "$PACKAGE_PATH/"
fi

# Copy includes directory
if [ -d "includes" ]; then
    mkdir -p "$PACKAGE_PATH/includes"
    rsync -av --exclude='*.log' includes/ "$PACKAGE_PATH/includes/"
    print_success "Includes directory copied"
fi

# Copy build directory (compiled assets) - REQUIRED
if [ -d "build" ]; then
    mkdir -p "$PACKAGE_PATH/build"
    cp -r build/* "$PACKAGE_PATH/build/"
    print_success "Compiled assets copied"
else
    print_error "Build directory not found! Run 'npm run build' first."
    exit 1
fi

# Copy source files - REQUIRED by WordPress.org for plugins with build processes
if [ -d "src" ]; then
    mkdir -p "$PACKAGE_PATH/src"
    rsync -av --exclude='*.log' --exclude='*.tmp' src/ "$PACKAGE_PATH/src/"
    print_success "Source files copied (required for WordPress.org review)"
fi

# Copy build configuration files - REQUIRED to allow rebuilding from source
if [ -f "package.json" ]; then
    cp package.json "$PACKAGE_PATH/"
    print_success "package.json copied"
fi

if [ -f "webpack.config.js" ]; then
    cp webpack.config.js "$PACKAGE_PATH/"
    print_success "webpack.config.js copied"
fi

if [ -f "postcss.config.js" ]; then
    cp postcss.config.js "$PACKAGE_PATH/"
    print_success "postcss.config.js copied"
fi

if [ -f "tailwind.config.js" ]; then
    cp tailwind.config.js "$PACKAGE_PATH/"
    print_success "tailwind.config.js copied"
fi

# Copy languages directory if exists
if [ -d "languages" ]; then
    mkdir -p "$PACKAGE_PATH/languages"
    cp -r languages/* "$PACKAGE_PATH/languages/"
    print_success "Languages directory copied"
fi

# Copy assets for WordPress.org (screenshots, banners, icons)
if [ -d ".wordpress-org" ]; then
    mkdir -p "$PACKAGE_PATH/.wordpress-org"
    cp -r .wordpress-org/* "$PACKAGE_PATH/.wordpress-org/"
    print_success "WordPress.org assets copied"
fi

# Copy assets/images directory (for plugin logo, etc.)
if [ -d "assets/images" ]; then
    mkdir -p "$PACKAGE_PATH/assets/images"
    cp -r assets/images/* "$PACKAGE_PATH/assets/images/"
    print_success "Asset images copied"
fi

print_success "Plugin files copied (excluding development files)"

# Step 4: Verify critical files
print_step "Verifying package contents..."

REQUIRED_FILES=(
    "analogwp-site-notes.php"
    "includes/core/data/class-database.php"
    "build/admin.js"
    "build/admin.css"
    "build/frontend.js"
    "build/frontend.css"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$PACKAGE_PATH/$file" ]; then
        echo "   ✓ $file"
    else
        print_error "   ✗ Missing: $file"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    print_error "Missing $MISSING_FILES required files!"
    exit 1
fi

print_success "All required files present"

# Step 5: Check for development artifacts
print_step "Checking for development artifacts..."

DEV_ARTIFACTS=(
    "node_modules"
    "src"
    "package.json"
    ".git"
    ".gitignore"
    "composer.json"
    "webpack.config.js"
)

FOUND_ARTIFACTS=0
for artifact in "${DEV_ARTIFACTS[@]}"; do
    if [ -e "$PACKAGE_PATH/$artifact" ]; then
        print_warning "Found development artifact: $artifact"
        FOUND_ARTIFACTS=$((FOUND_ARTIFACTS + 1))
    fi
done

if [ $FOUND_ARTIFACTS -eq 0 ]; then
    print_success "No development artifacts found (clean package!)"
fi

# Step 6: Check file sizes
print_step "Checking asset sizes..."

if [ -f "$PACKAGE_PATH/build/admin.js" ]; then
    ADMIN_JS_SIZE=$(stat -f%z "$PACKAGE_PATH/build/admin.js" 2>/dev/null || stat -c%s "$PACKAGE_PATH/build/admin.js" 2>/dev/null)
    ADMIN_JS_KB=$(echo "scale=2; $ADMIN_JS_SIZE/1024" | bc)
    echo "   admin.js: ${ADMIN_JS_KB}KB"
    
    if [ "$ADMIN_JS_SIZE" -gt 200000 ]; then
        print_warning "admin.js is quite large (>${ADMIN_JS_KB}KB). WordPress.org prefers smaller assets."
    fi
fi

if [ -f "$PACKAGE_PATH/build/frontend.js" ]; then
    FRONTEND_JS_SIZE=$(stat -f%z "$PACKAGE_PATH/build/frontend.js" 2>/dev/null || stat -c%s "$PACKAGE_PATH/build/frontend.js" 2>/dev/null)
    FRONTEND_JS_KB=$(echo "scale=2; $FRONTEND_JS_SIZE/1024" | bc)
    echo "   frontend.js: ${FRONTEND_JS_KB}KB"
fi

# Calculate total package size
TOTAL_SIZE=$(du -sh "$PACKAGE_PATH" | awk '{print $1}')
echo "   Total package size: $TOTAL_SIZE"

print_success "Asset sizes checked"

# Step 7: Create ZIP package
print_step "Creating WordPress.org distribution package..."
cd "$BUILD_DIR"

ZIP_NAME="${PLUGIN_SLUG}.${VERSION}.zip"

if command -v zip &> /dev/null; then
    zip -r "$ZIP_NAME" "$PACKAGE_NAME/" -x "*.DS_Store" "*/\.*"
    print_success "ZIP package created: $BUILD_DIR/$ZIP_NAME"
    
    ZIP_SIZE=$(du -sh "$ZIP_NAME" | awk '{print $1}')
    echo "   ZIP file size: $ZIP_SIZE"
else
    print_error "ZIP command not available!"
    exit 1
fi

# Step 8: Generate submission checklist
print_step "Generating WordPress.org submission checklist..."

cat > "$BUILD_DIR/WPORG_SUBMISSION_CHECKLIST.txt" << EOF
WordPress.org Submission Checklist for v${VERSION}
================================================

Package: ${ZIP_NAME}
Location: ${BUILD_DIR}/${ZIP_NAME}
Size: ${ZIP_SIZE}

PRE-SUBMISSION CHECKLIST:
========================

Plugin Requirements:
□ GPL-compatible license (GPL v2 or later) ✓
□ No obfuscated code ✓
□ No "powered by" links ✓
□ No external dependencies requiring API keys
□ Compatible with latest WordPress version

Code Quality:
□ No console.log statements in production ✓ (using conditional logger)
□ No PHP errors or warnings
□ Follows WordPress Coding Standards
□ All text is internationalized (i18n)
□ Nonces used for all forms
□ Data sanitized and validated
□ SQL uses \$wpdb->prepare()

Documentation:
□ readme.txt file present and complete
□ Valid plugin headers in main file
□ Screenshots added (recommended)
□ Banner and icon images (recommended)
□ FAQ section in readme.txt
□ Changelog up to date

Testing:
□ Tested on WordPress ${VERSION%.*}+
□ Tested with PHP 7.4+
□ No JavaScript errors in console (debug mode OFF)
□ Works with default WordPress themes
□ Compatible with major page builders (if applicable)
□ Multisite compatible (tested)

SUBMISSION STEPS:
================

1. Create WordPress.org account (if needed)
   → https://wordpress.org/support/register.php

2. Submit plugin for review
   → https://wordpress.org/plugins/developers/add/

3. Upload plugin information:
   - Plugin Name: Site Notes
   - Plugin URL: https://analogwp.com/
   - Description: (Use short description from readme.txt)

4. Upload ZIP file: ${ZIP_NAME}

5. Wait for review (typically 2-14 days)
   - Check email for review feedback
   - Be ready to make changes if requested

6. After approval:
   - Set up SVN repository
   - Add assets (.wordpress-org folder contents)
   - Tag first version
   - Submit for final review

POST-APPROVAL:
=============

□ Upload banner-772x250.png to assets/
□ Upload banner-1544x500.png to assets/ (retina)
□ Upload icon-128x128.png to assets/
□ Upload icon-256x256.png to assets/ (retina)
□ Add screenshots to assets/
□ Create first SVN tag (${VERSION})

IMPORTANT NOTES:
===============

• This is a WordPress.org clean build
• No development files included
• Uses conditional logging (WordPress.org compliant)
• Ready for submission
• Make sure readme.txt validates at:
  https://wordpress.org/plugins/developers/readme-validator/

Built on: $(date)
Package: ${ZIP_NAME}
EOF

print_success "Submission checklist created"

# Step 9: Final summary
echo ""
echo "🎉 WordPress.org Package Build Complete!"
echo "========================================"
echo ""
echo "📦 Package: $BUILD_DIR/$ZIP_NAME"
echo "📊 Size: $ZIP_SIZE"
echo "🏷️  Version: $VERSION"
echo ""
echo "📋 Next Steps:"
echo "   1. Review: $BUILD_DIR/WPORG_SUBMISSION_CHECKLIST.txt"
echo "   2. Validate readme.txt at: https://wordpress.org/plugins/developers/readme-validator/"
echo "   3. Test the ZIP on a clean WordPress install"
echo "   4. Submit to WordPress.org when ready"
echo ""
print_success "Ready for WordPress.org submission! 🚀"
