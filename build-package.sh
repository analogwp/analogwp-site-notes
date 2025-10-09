#!/bin/bash

# Client Handoff Toolkit - Build and Package Script
# For internal testing releases

set -e  # Exit on any error

# Get plugin directory and version
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_SLUG="analogwp-client-handoff"

# Extract version from main plugin file
VERSION=$(grep "Version:" "$PLUGIN_DIR/analogwp-client-handoff.php" | awk '{print $3}')
if [ -z "$VERSION" ]; then
    echo "❌ Error: Could not extract version from plugin file"
    exit 1
fi

echo "🚀 Building Client Handoff Toolkit v${VERSION} for Internal Testing"
echo "================================================================"

BUILD_DIR="$PLUGIN_DIR/build-package"
PACKAGE_NAME="$PLUGIN_SLUG-v${VERSION}-testing"

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
print_success "Build directory cleaned"

# Step 2: Install dependencies and build
print_step "Installing dependencies..."
if [ -f "$PLUGIN_DIR/package.json" ]; then
    cd "$PLUGIN_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found, running npm install..."
        npm install
    fi
    
    print_step "Building production assets..."
    npm run build
    print_success "Assets built successfully"
else
    print_error "package.json not found!"
    exit 1
fi

# Step 3: Copy plugin files
print_step "Copying plugin files..."
cd "$PLUGIN_DIR"

# Create the package directory
PACKAGE_PATH="$BUILD_DIR/$PACKAGE_NAME"
mkdir -p "$PACKAGE_PATH"

# Copy main plugin files
cp analogwp-client-handoff.php "$PACKAGE_PATH/"
cp README.md "$PACKAGE_PATH/"
cp CHANGELOG.md "$PACKAGE_PATH/"
cp TESTING_GUIDE.md "$PACKAGE_PATH/"
cp DEPLOYMENT_CHECKLIST.md "$PACKAGE_PATH/"

# Copy includes directory
if [ -d "includes" ]; then
    mkdir -p "$PACKAGE_PATH/includes"
    cp -r includes/* "$PACKAGE_PATH/includes/"
    print_success "Includes directory copied"
else
    print_error "Includes directory not found!"
    exit 1
fi

# Copy src directory (source files)
if [ -d "src" ]; then
    mkdir -p "$PACKAGE_PATH/src"
    cp -r src/* "$PACKAGE_PATH/src/"
    print_success "Source files copied"
else
    print_error "Source directory not found!"
    exit 1
fi

# Copy build directory (compiled assets)
if [ -d "build" ]; then
    mkdir -p "$PACKAGE_PATH/build"
    cp -r build/* "$PACKAGE_PATH/build/"
    print_success "Compiled assets copied"
else
    print_error "Build directory not found! Make sure 'npm run build' completed successfully."
    exit 1
fi

# Copy package.json for reference
cp package.json "$PACKAGE_PATH/"

print_success "Plugin files copied"

# Step 4: Create package information
print_step "Creating package information..."

cat > "$PACKAGE_PATH/PACKAGE_INFO.txt" << EOF
Client Handoff Toolkit - Internal Testing Package
================================================

Version: ${VERSION}
Build Date: $(date)
Package Type: Internal Testing Release

🆕 FEATURES IN v${VERSION}:
- Task editing functionality
- Persistent timesheet system  
- Modern toast notifications
- Enhanced UI/UX improvements

📋 TESTING INSTRUCTIONS:
1. Read TESTING_GUIDE.md for comprehensive testing scenarios
2. Install on WordPress 6.0+ with PHP 7.4+
3. Test all new features thoroughly
4. Report bugs using the template in TESTING_GUIDE.md

🔧 INSTALLATION:
1. Upload to /wp-content/plugins/analogwp-client-handoff/
2. Activate plugin (database will auto-upgrade)
3. Navigate to Client Handoff dashboard
4. Start testing!

⚠️  IMPORTANT NOTES:
- This is a testing release, not for production
- Always backup your database before installation
- Plugin automatically adds 'timesheet' column to comments table
- Rollback instructions available in DEPLOYMENT_CHECKLIST.md

📞 SUPPORT:
- GitHub Issues: Create detailed bug reports
- Slack: #client-handoff-testing
- Emergency: Contact @lushkant directly

Built on: $(hostname)
Build Path: $PACKAGE_PATH
EOF

print_success "Package information created"

# Step 5: Verify critical files
print_step "Verifying package contents..."

REQUIRED_FILES=(
    "analogwp-client-handoff.php"
    "README.md"
    "CHANGELOG.md"
    "TESTING_GUIDE.md"
    "includes/class-database.php"
    "build/admin.js"
    "build/admin.css"
    "src/admin/components/TaskDetail.js"
    "src/admin/components/ToastProvider.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$PACKAGE_PATH/$file" ]; then
        print_success "✓ $file"
    else
        print_error "✗ Missing: $file"
        exit 1
    fi
done

# Step 6: Check file sizes
print_step "Checking file sizes..."
ADMIN_JS_SIZE=$(stat -f%z "$PACKAGE_PATH/build/admin.js" 2>/dev/null || stat -c%s "$PACKAGE_PATH/build/admin.js" 2>/dev/null)
ADMIN_CSS_SIZE=$(stat -f%z "$PACKAGE_PATH/build/admin.css" 2>/dev/null || stat -c%s "$PACKAGE_PATH/build/admin.css" 2>/dev/null)

echo "   - admin.js: $(echo "scale=2; $ADMIN_JS_SIZE/1024" | bc)KB"
echo "   - admin.css: $(echo "scale=2; $ADMIN_CSS_SIZE/1024" | bc)KB"

# Warn if files are too large
if [ "$ADMIN_JS_SIZE" -gt 100000 ]; then
    print_warning "admin.js is quite large (>100KB). Consider code splitting for production."
fi

print_success "File sizes verified"

# Step 7: Create ZIP package
print_step "Creating distribution package..."
cd "$BUILD_DIR"

# Create ZIP file
if command -v zip &> /dev/null; then
    zip -r "$PACKAGE_NAME.zip" "$PACKAGE_NAME/" -x "*.DS_Store" "*/node_modules/*" "*/.git/*"
    print_success "ZIP package created: $BUILD_DIR/$PACKAGE_NAME.zip"
else
    print_warning "ZIP command not available, creating tar.gz instead"
    tar -czf "$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME/"
    print_success "TAR package created: $BUILD_DIR/$PACKAGE_NAME.tar.gz"
fi

# Step 8: Generate testing checklist
print_step "Generating testing checklist..."

cat > "$BUILD_DIR/TESTING_CHECKLIST.md" << EOF
# Testing Checklist for v1.1.0

## Pre-Installation
- [ ] WordPress 6.0+ environment ready
- [ ] PHP 7.4+ confirmed
- [ ] Database backup created
- [ ] Previous version deactivated

## Installation Testing
- [ ] Plugin uploaded to correct directory
- [ ] Plugin activates without errors
- [ ] Database upgrade completes successfully
- [ ] No PHP errors in logs
- [ ] Admin dashboard accessible

## Feature Testing
- [ ] Task editing functionality works
- [ ] Timesheet system operational
- [ ] Toast notifications positioned correctly
- [ ] Edit buttons appear on existing tasks
- [ ] No edit button on new task modal

## Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Data Persistence
- [ ] Timesheet data survives page refresh
- [ ] Each task has separate timesheet
- [ ] Edit changes persist
- [ ] No data loss during operations

## Issue Reporting
Use the bug report template in TESTING_GUIDE.md for any issues found.
EOF

print_success "Testing checklist created"

# Step 9: Final summary
echo ""
echo "🎉 Package Build Complete!"
echo "========================="
echo ""
echo "📦 Package Location: $BUILD_DIR/$PACKAGE_NAME"
if [ -f "$BUILD_DIR/$PACKAGE_NAME.zip" ]; then
    echo "🗜️  ZIP File: $BUILD_DIR/$PACKAGE_NAME.zip"
fi
echo "📋 Testing Checklist: $BUILD_DIR/TESTING_CHECKLIST.md"
echo ""
echo "📨 Ready for Distribution!"
echo ""
echo "Next Steps:"
echo "1. Share the ZIP file with internal testing team"
echo "2. Provide link to testing documentation"
echo "3. Set up communication channels for feedback"
echo "4. Monitor for bug reports and issues"
echo ""
print_success "Build script completed successfully! 🚀"