# Site Notes: Feedback, Notes with Sitewide Visual Commenting

[![WordPress plugin](https://img.shields.io/wordpress/plugin/dt/analogwp-site-notes.svg?style=flat)](https://wordpress.org/plugins/analogwp-site-notes/)
[![Installs](https://img.shields.io/wordpress/plugin/installs/analogwp-site-notes.svg)](https://wordpress.org/plugins/analogwp-site-notes/)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-purple.svg)](https://php.net/)
[![License](https://img.shields.io/badge/License-GPL%20v2%2B-green.svg)](https://www.gnu.org/licenses/gpl-2.0.html)
[![WordPress plugin](https://img.shields.io/wordpress/plugin/v/analogwp-site-notes.svg?style=flat)](https://wordpress.org/plugins/analogwp-site-notes/)

**Transform client feedback into action.** Your clients click on any website element to leave comments. You manage everything through a beautiful admin dashboard. No more confusing emails or vague "fix the blue thing" requests.

---

## 🚀 Quick Start

### Installation

1. Download or clone this repository
2. Upload to `/wp-content/plugins/analogwp-site-notes`
3. Activate via **WordPress Admin → Plugins**
4. Configure settings at **Site Notes → Settings**
5. Build assets: `npm install && npm run build`

### First Steps

**For Clients:**
1. Look for the toggle button in the WordPress admin bar
2. Click it to enable comment mode
3. Click any element on the page to add feedback
4. Comments are captured automatically with screenshots

**For Administrators:**
1. View all feedback at **Site Notes → Dashboard**
2. Track tasks with status (Open, In Progress, Resolved)
3. Reply to comments and update priorities
4. Manage user access and settings

---

## ✨ Key Features

### Visual Commenting ✅
- **One-click feedback** - Click any element to comment
- **Automatic screenshots** - Context captured with html2canvas
- **Smart element detection** - CSS selectors and position fallback
- **Reply threads** - Full conversation support
- **User avatars** - WordPress Gravatar integration

### Task Management ✅
- **Kanban board** - Organize by status (Open, In Progress, Resolved)
- **Priority levels** - High, Medium, Low classification
- **Category system** - Custom categories for organization
- **Task editing** - Update comments and details
- **Advanced filtering** - Search, filter by status/category/priority

### Timesheet Tracking ✅
- **Time logging** - Track hours per task
- **Persistent storage** - All time entries saved to database
- **Time reports** - View total hours by task/category
- **Edit capabilities** - Modify or delete time entries

### Access Control ✅
- **Role-based access** - Configure which roles can see the plugin
- **Frontend toggle** - Enable/disable comments on frontend
- **Secure AJAX** - Nonce verification on all requests
- **Permission checks** - WordPress capability system

### Modern UI/UX ✅
- **React 18** - Fast, interactive interface
- **Toast notifications** - Real-time feedback with react-toastify
- **Responsive design** - Works on all devices
- **WordPress integration** - Matches admin theme

---

## 📖 Usage Guide

### Creating Visual Comments

1. **Enable Comment Mode**
   - Click the toggle button in the WordPress admin bar
   - Page overlay appears with instructions
   
2. **Add a Comment**
   - Click on any element you want to comment on
   - A popup appears asking for your comment
   - Type your feedback and click "Save Comment"
   - Screenshot is automatically captured

3. **View Comments**
   - Existing comments appear as numbered markers
   - Click any marker to view details and replies
   - Add replies or update status (if permitted)

### Managing Tasks (Admin)

1. **Dashboard Overview**
   - Access via **Site Notes → Dashboard**
   - View statistics: total tasks, open, in progress, resolved
   - Filter by status, category, or priority
   - Search across all comments

2. **Task Actions**
   - **Edit**: Click edit icon to modify task details
   - **Reply**: Add threaded replies with avatars
   - **Status**: Change between Open, In Progress, Resolved
   - **Delete**: Remove tasks (admin only)
   - **Log Time**: Track hours spent on tasks

3. **Timesheet**
   - Access via **Site Notes → Timesheet**
   - View all time entries across tasks
   - Filter by date range, task, or user
   - Export reports (coming soon)

### Configuration

Access settings at **Site Notes → Settings**:

#### General Settings
- **Allowed User Roles**: Select which roles can access the plugin
- **Enable Frontend Comments**: Toggle comments app on frontend

#### Categories & Priorities
- **Categories**: Create custom categories (e.g., Design, Content, Bug)
- **Priorities**: Manage priority levels (High, Medium, Low by default)

---

## 🛠️ Technical Details

<details>
<summary><strong>Architecture & Stack</strong></summary>

### Frontend
- **React 18.2.0** - UI framework
- **WordPress Components** - @wordpress/components for consistency
- **html2canvas** - Screenshot capture
- **react-toastify** - Toast notifications
- **Sass** - Styling with CSS variables

### Backend
- **WordPress 6.0+** - Core platform
- **PHP 7.4+** - Server-side logic
- **MySQL** - Database storage
- **REST API** - AJAX endpoints

### Build System
- **@wordpress/scripts** - Build tooling
- **Webpack 5** - Module bundling
- **Babel** - JavaScript compilation
- **PostCSS** - CSS processing

</details>

<details>
<summary><strong>Database Structure</strong></summary>

### Comments Table (\`wp_agwp_sn_comments\`)
\`\`\`sql
CREATE TABLE wp_agwp_sn_comments (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id bigint(20) UNSIGNED NOT NULL,
  user_id bigint(20) UNSIGNED NOT NULL,
  comment_text text NOT NULL,
  element_selector varchar(500) DEFAULT NULL,
  screenshot_url longtext DEFAULT NULL,
  x_position int(11) DEFAULT NULL,
  y_position int(11) DEFAULT NULL,
  page_url varchar(500) DEFAULT NULL,
  status varchar(20) DEFAULT 'open',
  priority varchar(20) DEFAULT 'medium',
  category varchar(100) DEFAULT NULL,
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY post_id (post_id),
  KEY user_id (user_id),
  KEY status (status),
  KEY priority (priority),
  KEY category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
\`\`\`

### Replies Table (\`wp_agwp_sn_comment_replies\`)
\`\`\`sql
CREATE TABLE wp_agwp_sn_comment_replies (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  comment_id bigint(20) UNSIGNED NOT NULL,
  user_id bigint(20) UNSIGNED NOT NULL,
  reply_text text NOT NULL,
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY comment_id (comment_id),
  KEY user_id (user_id),
  FOREIGN KEY (comment_id) REFERENCES wp_agwp_sn_comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
\`\`\`

### Timesheet Table (\`wp_agwp_sn_timesheet\`)
\`\`\`sql
CREATE TABLE wp_agwp_sn_timesheet (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  comment_id bigint(20) UNSIGNED NOT NULL,
  user_id bigint(20) UNSIGNED NOT NULL,
  hours decimal(10,2) NOT NULL,
  description text DEFAULT NULL,
  logged_at datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY comment_id (comment_id),
  KEY user_id (user_id),
  FOREIGN KEY (comment_id) REFERENCES wp_agwp_sn_comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
\`\`\`

</details>

<details>
<summary><strong>Component Structure</strong></summary>

\`\`\`
src/
├── frontend/
│   ├── components/
│   │   ├── VisualCommentsApp.js     # Main app container
│   │   ├── CommentToggle.js          # Toggle button
│   │   ├── CommentOverlay.js         # Instruction overlay
│   │   ├── CommentPopup.js           # New comment form
│   │   ├── CommentsDisplay.js        # Comments manager
│   │   └── CommentMarker.js          # Individual markers
│   ├── styles/
│   │   └── frontend.scss             # Frontend styles
│   └── frontend.js                   # Entry point
│
├── admin/
│   ├── components/
│   │   ├── Dashboard.js              # Main dashboard
│   │   ├── TaskBoard.js              # Kanban board
│   │   ├── TaskCard.js               # Individual tasks
│   │   ├── TaskDetail.js             # Task detail view
│   │   ├── Timesheet.js              # Timesheet view
│   │   ├── Settings.js               # Settings page
│   │   └── settings/
│   │       ├── AccessControlSettings.js
│   │       ├── CategorySettings.js
│   │       └── PrioritySettings.js
│   ├── styles/
│   │   └── admin.scss                # Admin styles
│   └── admin.js                      # Entry point
│
└── shared/
    └── utils/                        # Shared utilities
\`\`\`

</details>

<details>
<summary><strong>Security Features</strong></summary>

### Implemented Protections
- ✅ **Nonce Verification** - All AJAX requests protected with WordPress nonces
- ✅ **User Capability Checks** - Role-based access control via \`user_has_access()\`
- ✅ **Data Sanitization** - All inputs cleaned with \`sanitize_text_field()\` and \`wp_kses_post()\`
- ✅ **SQL Injection Prevention** - Prepared statements via \`$wpdb->prepare()\`
- ✅ **XSS Protection** - Output escaping with \`esc_html()\`, \`esc_url()\`, \`esc_attr()\`
- ✅ **CSRF Protection** - WordPress nonces on all forms and AJAX calls

### Permission System
\`\`\`php
// Helper method in main plugin class
public static function user_has_access() {
    if ( ! is_user_logged_in() ) {
        return false;
    }
    
    if ( current_user_can( 'manage_options' ) ) {
        return true; // Admin always has access
    }
    
    $settings = get_option( 'agwp_sn_settings', array() );
    $allowed_roles = $settings['general']['allowed_roles'] ?? array();
    
    $user = wp_get_current_user();
    return ! empty( array_intersect( $allowed_roles, $user->roles ) );
}
\`\`\`

</details>

<details>
<summary><strong>Browser Compatibility</strong></summary>

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 80+ | ✅ Full Support |
| Firefox | 75+ | ✅ Full Support |
| Safari | 13+ | ✅ Full Support |
| Edge | 80+ | ✅ Full Support |
| Mobile Safari | iOS 13+ | ✅ Full Support |
| Chrome Mobile | Android 8+ | ✅ Full Support |

</details>

---

## 🔧 Development

### Prerequisites
- Node.js 14+
- npm or yarn
- WordPress development environment

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/analogwp/analogwp-site-notes.git
   cd analogwp-site-notes
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start development**
   \`\`\`bash
   npm run start
   \`\`\`
   This will:
   - Watch for file changes
   - Auto-compile SCSS to CSS
   - Bundle JavaScript with hot reload

4. **Build for production**
   \`\`\`bash
   npm run build
   \`\`\`

### Available Commands

- \`npm run start\` - Start development server with watch mode
- \`npm run build\` - Build optimized production assets
- \`npm run format\` - Format code with Prettier
- \`npm run lint:css\` - Lint SCSS files
- \`npm run lint:js\` - Lint JavaScript files
- \`npm run packages-update\` - Update WordPress packages

### File Structure

**Key PHP Files:**
- \`analogwp-site-notes.php\` - Main plugin file with hooks and helper methods
- \`includes/class-database.php\` - Database operations
- \`includes/class-assets.php\` - Asset enqueuing
- \`includes/ajax/class-ajax.php\` - AJAX endpoint handlers
- \`includes/admin/class-admin.php\` - Admin menu and pages

**React Entry Points:**
- \`src/frontend.js\` - Frontend commenting app
- \`src/admin.js\` - Admin dashboard and settings

**Styles:**
- \`src/frontend/styles/frontend.scss\` - Frontend styles
- \`src/admin/styles/admin.scss\` - Admin dashboard styles

### Customization

**Custom Color Scheme:**
\`\`\`scss
// In your theme or child theme
:root {
  --agwp-sn-primary: #your-brand-color;
  --agwp-sn-danger: #your-error-color;
  --agwp-sn-success: #your-success-color;
}
\`\`\`

**Extend Functionality:**
\`\`\`php
// Add custom comment meta
add_filter( 'agwp_sn_comment_data', function( $data ) {
    $data['custom_field'] = 'custom_value';
    return $data;
} );

// Modify allowed roles programmatically
add_filter( 'agwp_sn_allowed_roles', function( $roles ) {
    $roles[] = 'shop_manager';
    return $roles;
} );
\`\`\`

---

## 🚨 Troubleshooting

<details>
<summary><strong>Comments Not Saving</strong></summary>

**Possible Causes:**
- User doesn't have proper permissions
- WordPress nonces expired
- Database tables missing

**Solutions:**
1. Check user has access via Settings → Allowed User Roles
2. Refresh the page to regenerate nonces
3. Deactivate and reactivate plugin to create tables
4. Check WordPress debug log for errors

</details>

<details>
<summary><strong>Screenshots Not Capturing</strong></summary>

**Possible Causes:**
- html2canvas library not loaded
- CORS issues with external resources
- Browser doesn't support canvas API

**Solutions:**
1. Check browser console for JavaScript errors
2. Ensure all images have proper CORS headers
3. Try on a different browser
4. Disable browser extensions that might interfere

</details>

<details>
<summary><strong>Toggle Button Missing</strong></summary>

**Possible Causes:**
- User not logged in
- User doesn't have access permissions
- Admin bar disabled
- Frontend comments disabled in settings

**Solutions:**
1. Confirm user is logged in to WordPress
2. Check Settings → Allowed User Roles includes user's role
3. Enable WordPress admin bar in user profile
4. Enable Settings → Enable Frontend Comments
5. Clear browser and WordPress caches

</details>

<details>
<summary><strong>Permission Errors in Admin</strong></summary>

**Error:** "You do not have sufficient permissions to access this page"

**Solutions:**
1. Ensure user role is in Settings → Allowed User Roles
2. Clear WordPress object cache
3. Check if \`user_has_access()\` method is working:
   \`\`\`php
   // Add to functions.php temporarily
   add_action( 'admin_init', function() {
       if ( class_exists( 'AGWP_SN_Client_Handoff_Toolkit' ) ) {
           var_dump( AGWP_SN_Client_Handoff_Toolkit::user_has_access() );
       }
   } );
   \`\`\`

</details>

<details>
<summary><strong>Debug Mode</strong></summary>

Enable WordPress debug mode for detailed error logging:

\`\`\`php
// In wp-config.php
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
define( 'SCRIPT_DEBUG', true );
\`\`\`

Check debug log at \`wp-content/debug.log\`

</details>

---

## 📈 Roadmap

### Version 1.1.0 ✅ **CURRENT**
- ✅ Task editing functionality
- ✅ Persistent timesheet tracking
- ✅ Modern toast notifications
- ✅ Enhanced UI/UX improvements
- ✅ Access control system
- ✅ User avatars in replies

### Version 1.2 🔜 **NEXT**
- ⏳ Email notifications for new comments and status changes
- ⏳ Enhanced mobile interface with touch optimizations
- ⏳ CSV/PDF export for timesheet reports
- ⏳ Advanced filtering with saved filter presets
- ⏳ Bulk actions for task management
- ⏳ Custom fields for tasks
- 🎨 Custom branding options

### Version 1.3 📅 **PLANNED**
- ⏳ Advanced analytics dashboard with charts
- ⏳ Custom branding options
- ⏳ REST API endpoints for third-party integrations
- ⏳ Progressive Web App (PWA) features
- ⏳ Multi-language support (WPML/Polylang)

### Future Ideas 🔮
- ⏳ Cloud storage for screenshots (AWS S3, Google Cloud)
- ⏳ AI-powered resolutions
- ⏳ Native mobile app companion
- ⏳ Real-time collaboration with WebSocket
- ⏳ Project templates and workflows

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: \`git checkout -b feature/amazing-feature\`
3. **Make** your changes with proper testing
4. **Commit** with descriptive messages: \`git commit -m 'Add amazing feature'\`
5. **Push** to your branch: \`git push origin feature/amazing-feature\`
6. **Open** a Pull Request with detailed description

### Development Guidelines
- Follow [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- Write descriptive commit messages
- Add code comments for complex functionality
- Test across multiple browsers and WordPress versions
- Update documentation as needed
- Include screenshots for UI changes

---

## 📄 License

This project is licensed under the **GNU General Public License v2.0 or later**.

You are free to use, modify, and distribute this plugin under the terms of the GPL. See the [LICENSE](LICENSE) file for full details.

---

## 🆘 Support

### Get Help
- 📖 **Documentation**: This README and inline code comments
- 🐛 **Bug Reports**: [Open an issue](https://github.com/analogwp/analogwp-site-notes/issues) with reproduction steps
- 💡 **Feature Requests**: [Suggest improvements](https://github.com/analogwp/analogwp-site-notes/issues) via GitHub issues
- 💬 **Discussions**: Join conversations in the [issues section](https://github.com/analogwp/analogwp-site-notes/issues)

### Professional Support
For priority support, custom development, or consulting services, contact the development team.

---

**Built with ❤️ for WordPress agencies, developers, and their clients.**

*Making website feedback as simple as point and click.*
