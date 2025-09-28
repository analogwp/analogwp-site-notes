# Client Handoff Toolkit - Visual Commenting System

**A comprehensive WordPress plugin for streamlined agency-client collaboration with an intuitive visual commenting system, task management, and seamless handoff workflow.**

[![WordPress](https://img.shields.io/badge/WordPress-5.0%2B-blue.svg)](https://wordpress.org/)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-purple.svg)](https://php.net/)
[![License](https://img.shields.io/badge/License-GPL%20v2%2B-green.svg)](https://www.gnu.org/licenses/gpl-2.0.html)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)](https://github.com/analogwp/analogwp-client-handoff)

---

## 🎯 **Overview**

The Client Handoff Toolkit transforms how agencies and clients collaborate during website projects. Instead of lengthy email chains and confusing feedback documents, clients can simply **click on any element** of their website to leave visual comments with automatic screenshots.

### **Perfect For:**
- **Web Agencies** - Streamline client feedback collection
- **Freelance Developers** - Professional client collaboration
- **Website Maintenance** - Ongoing client communication
- **Design Reviews** - Visual feedback on layouts and content
- **Bug Reporting** - Clear visual documentation of issues

---

## ✨ **Features Status**

### 🎪 **Visual Commenting System** ✅ **IMPLEMENTED**
- ✅ **One-Click Feedback**: Click anywhere on your website to add comments
- ✅ **Automatic Screenshots**: Captures visual context with every comment using html2canvas
- ✅ **Smart Element Detection**: Identifies and targets specific page elements with CSS selectors
- ✅ **Priority Levels**: Low, Medium, High priority classification system
- ✅ **Real-Time Collaboration**: Reply to comments with threaded conversations

### 📊 **Task Management** ✅ **IMPLEMENTED**
- ✅ **Status Tracking**: Open → In Progress → Resolved workflow
- ✅ **Kanban Board View**: Drag-and-drop interface for task management
- ✅ **Filter & Search**: Find comments by status, user, or priority
- ✅ **Admin Dashboard**: Comprehensive overview with statistics and charts
- ⚠️ **User Assignment**: Basic user tracking (enhancement needed for team assignment)
- ✅ **Page Integration**: Comments linked to specific WordPress pages/posts

### 🎨 **User Experience** ✅ **IMPLEMENTED**
- ✅ **Responsive Design**: Modern interface optimized for all devices
- ✅ **Admin Bar Integration**: Easy toggle controls without disrupting workflow
- ✅ **React-Based Interface**: Modern, fast, and interactive components
- ✅ **WordPress Native**: Seamlessly integrates with WordPress admin styling
- ✅ **Drag & Drop**: Movable comment popups for better usability

### 🔒 **Security & Performance** ✅ **IMPLEMENTED**
- ✅ **Nonce Verification**: All AJAX requests protected against CSRF
- ✅ **User Capability Checks**: Role-based access control system
- ✅ **Data Sanitization**: All inputs sanitized before database storage
- ✅ **SQL Injection Prevention**: Prepared statements used throughout
- ✅ **XSS Protection**: Output escaping implemented properly

### 🚀 **Planned Features** ❌ **NOT YET IMPLEMENTED**
- ❌ **Email Notifications**: Automatic notifications for new comments (v1.1)
- ❌ **Elementor Integration**: Better element targeting for page builders (v1.2)
- ❌ **Advanced Analytics**: Detailed reporting and insights (v1.2)
- ❌ **Multi-language Support**: WPML/Polylang integration (v1.3)
- ❌ **Cloud Storage**: External storage options for screenshots (v1.3)
- ❌ **Team Collaboration**: Advanced user assignment and permissions (v1.2)
- ❌ **CSV Export**: Data export functionality (v1.1)
- ❌ **Mobile App**: Native companion mobile application (Future)

---

## 🚀 **Quick Start Guide**

### **Step 1: Installation**

**Option A: Upload Plugin Files**
1. Download/clone the plugin to `/wp-content/plugins/analogwp-client-handoff/`
2. Install dependencies: `npm install`
3. Build assets: `npm run build`
4. Activate in WordPress Admin > Plugins

**Option B: Development Setup**
```bash
# Clone and setup for development
git clone [repo-url] /path/to/wordpress/wp-content/plugins/analogwp-client-handoff/
cd analogwp-client-handoff
npm install
npm run start  # For development with hot reload
```

### **Step 2: Configure Settings**
1. Go to **WordPress Admin > Client Handoff**
2. Set user permissions (who can add comments)
3. Configure screenshot settings
4. Save settings

### **Step 3: Start Commenting**
1. Visit any page on your website
2. Click **"Page Tasks & Comments"** in the admin bar
3. Click on any element to add a comment
4. Fill out the comment form with priority level
5. Submit - screenshot automatically captured!

---

## 📋 **Detailed Usage**

### **For Clients (Adding Feedback)**

1. **Enable Comment Mode**
   - Look for "Page Tasks & Comments" in the top admin bar
   - Or use the sidebar toggle button (right side of screen)

2. **Add Visual Comments**
   - Click on any element you want to comment on
   - A popup form will appear at the click location
   - Enter your feedback and select priority level
   - Click "Save Comment" - screenshot automatically captured

3. **View Existing Comments**
   - Comments appear as numbered red markers on the page
   - Click any marker to view details and replies
   - Use the sidebar to see all comments in one place

### **For Developers/Agencies (Managing Tasks)**

1. **Admin Dashboard**
   - Navigate to **Client Handoff > Visual Comments**
   - View all comments in a comprehensive table
   - Filter by status, priority, user, or page
   - Export data to CSV for reporting

2. **Task Management**
   - Update comment status: Open → In Progress → Resolved
   - Add replies to client comments
   - Assign tasks to team members
   - Track progress with visual status indicators

3. **Priority Management**
   - High Priority: Red badges for urgent items
   - Medium Priority: Yellow badges for standard tasks
   - Low Priority: Blue badges for minor items

---

## 🛠 **Technical Architecture**

### **Frontend Technology Stack**
- **React 18**: Modern component-based UI
- **SCSS**: Modular styling with WordPress theme compatibility
- **html2canvas**: Screenshot capture technology
- **Webpack**: Asset bundling and optimization

### **WordPress Integration**
- **AJAX Endpoints**: Secure server communication
- **Custom Database Tables**: Optimized storage structure
- **User Capabilities**: WordPress role-based permissions
- **Nonce Security**: Protection against CSRF attacks

### **Database Structure**

**Comments Table** (`wp_agwp_cht_comments`):
```sql
- id (Primary Key)
- post_id (WordPress Post ID)
- user_id (Comment Author)
- comment_text (Feedback Content)
- screenshot_url (Auto-captured Image)
- x_position, y_position (Click Coordinates)
- page_url (Full URL)
- status (open/in_progress/resolved)
- priority (low/medium/high)
- created_at, updated_at (Timestamps)
```

**Replies Table** (`wp_agwp_cht_comment_replies`):
```sql
- id (Primary Key)
- comment_id (Parent Comment)
- user_id (Reply Author)
- reply_text (Reply Content)
- created_at (Timestamp)
```

### **Component Architecture**
```
src/
├── components/
│   ├── VisualCommentsApp.js     # Main application container
│   ├── CommentPopup.js          # Click-to-comment form
│   ├── CommentSidebar.js        # Sliding sidebar interface
│   ├── CommentMarker.js         # On-page comment indicators
│   └── CommentOverlay.js        # Instructions and helpers
├── admin/
│   ├── AdminApp.js              # Admin dashboard React app
│   ├── components/
│   │   ├── TasksKanban.js       # Kanban board view
│   │   ├── TaskDetail.js        # Individual task details
│   │   └── AddTaskModal.js      # New task creation modal
│   └── AdminHeader.js           # Admin navigation and filters
└── styles/
    ├── frontend.scss            # Public-facing styles
    └── admin-new.scss           # Admin interface styles
```

---

## ⚙️ **Configuration Options**

### **User Permissions**
Control who can add comments:
```php
// In WordPress functions.php or custom plugin
update_option('agwp_cht_allowed_roles', ['administrator', 'editor', 'client']);
```

### **Screenshot Settings**
```php
// Disable automatic screenshots
update_option('agwp_cht_auto_screenshot', false);

// Change screenshot quality
update_option('agwp_cht_screenshot_quality', 0.8);
```

### **Styling Customization**
```scss
// Override default colors in your theme
.cht-comment-sidebar {
    --primary-color: #your-brand-color;
    --success-color: #your-success-color;
    --danger-color: #your-error-color;
}
```

---

## 🔧 **Development**

### **Development Commands**
```bash
npm run start      # Development with hot reload
npm run build      # Production build
npm run dev        # Development build
```

### **File Structure**
- **PHP Backend**: `/analogwp-client-handoff.php` - Main plugin file
- **React Frontend**: `/src/` - All JavaScript/React components  
- **Admin Interface**: `/admin/` - WordPress admin pages and React admin app
- **Styles**: `/src/styles/` - SCSS source files
- **Built Assets**: `/build/` - Compiled JavaScript and CSS

### **Build Process**
- Uses `@wordpress/scripts` for consistent WordPress development
- Supports modern JavaScript (ES6+) and JSX
- SCSS compilation with autoprefixer
- Asset optimization and minification for production

---

## 🔒 **Security & Performance**

### **Security Features**
- ✅ **Nonce Verification** - All AJAX requests protected
- ✅ **User Capability Checks** - Role-based access control  
- ✅ **Data Sanitization** - All inputs cleaned before storage
- ✅ **SQL Injection Prevention** - Prepared statements used
- ✅ **XSS Protection** - Output escaping implemented

### **Performance Optimizations**
- ✅ **Lazy Loading** - Components load only when needed
- ✅ **Asset Minification** - Compressed CSS/JS for faster loading
- ✅ **Database Optimization** - Indexed columns for fast queries
- ✅ **Caching Support** - Compatible with WordPress caching plugins

---

## 🌐 **Browser Compatibility**

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 80+ | ✅ Full Support |
| Firefox | 75+ | ✅ Full Support |
| Safari | 13+ | ✅ Full Support |
| Edge | 80+ | ✅ Full Support |
| Mobile Safari | iOS 13+ | ✅ Full Support |
| Chrome Mobile | Android 8+ | ✅ Full Support |

---

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

**� Comments Not Saving**
- Check user has `edit_posts` capability
- Verify WordPress nonces are working
- Ensure database tables were created during activation

**🔴 Screenshots Not Capturing**
- Check browser console for JavaScript errors
- Verify html2canvas library loaded properly
- Ensure no CORS issues with external resources

**🔴 Toggle Button Missing**
- Confirm user is logged in with appropriate permissions
- Check if WordPress admin bar is enabled
- Verify plugin scripts are enqueued properly

**🔴 Sidebar Not Appearing**
- Clear browser cache and WordPress caches
- Check for JavaScript conflicts with other plugins
- Ensure CSS assets compiled correctly

### **Debug Mode**
Enable WordPress debug mode for detailed error information:
```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

---

## 📈 **Development Roadmap**

### **Version 1.0.0** ✅ **CURRENT RELEASE**
- ✅ Visual commenting system with click-to-comment functionality
- ✅ Automatic screenshot capture using html2canvas
- ✅ Task management with Kanban board interface
- ✅ Status tracking (Open, In Progress, Resolved)
- ✅ Priority levels (High, Medium, Low)
- ✅ Admin dashboard with statistics
- ✅ React-based frontend and admin interfaces
- ✅ WordPress security best practices
- ✅ Responsive design for mobile compatibility
- ✅ Database optimization with indexed columns

### **Version 1.1** 🔄 **NEXT RELEASE** 
- ⏳ Email notifications for new comments and status changes
- ⏳ Enhanced mobile interface with touch optimizations
- ⏳ CSV export functionality for reports
- ⏳ Additional screenshot customization options
- ⏳ Improved filtering and search capabilities
- ⏳ Bulk actions for comment management

### **Version 1.2** 📅 **PLANNED**
- 🔗 Elementor integration for better element targeting  
- 📊 Advanced analytics dashboard with charts and insights
- 👥 Enhanced team collaboration with user assignment
- 🎨 Custom branding options for client-facing interface
- 🔧 API endpoints for third-party integrations
- 📱 Progressive Web App (PWA) features

### **Version 1.3** 🔮 **FUTURE**
- 🌍 Multi-language support (WPML/Polylang compatibility)
- ☁️ Cloud storage integration for screenshots (AWS S3, Google Cloud)
- 🤖 AI-powered comment categorization and insights
- 📱 Native mobile app companion
- 🔄 Real-time collaboration with WebSocket support
- 📋 Custom workflow templates

### **Community Requests** 💡 **OPEN FOR FEEDBACK**
- 🎭 Page builder integrations (Beaver Builder, Divi, etc.)
- 📧 Slack/Discord notifications
- 🔐 SSO integration (Google, Microsoft, etc.)
- 📊 Time tracking for tasks
- 🎯 Project templates and presets

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes with proper testing
4. **Commit** with descriptive messages (`git commit -m 'Add amazing feature'`)
5. **Push** to your branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request with detailed description

### **Development Guidelines**
- Follow WordPress coding standards
- Write descriptive commit messages
- Add comments for complex functionality
- Test across multiple browsers
- Update documentation as needed

---

## 📄 **License**

This project is licensed under the **GNU General Public License v2.0 or later**.

You are free to use, modify, and distribute this plugin under the terms of the GPL. See the [LICENSE](LICENSE) file for full details.

---

## 🆘 **Support**

### **Get Help**
- 📖 **Documentation**: Check this README for detailed guidance
- 🐛 **Bug Reports**: Open an issue with steps to reproduce
- 💡 **Feature Requests**: Suggest improvements via GitHub issues
- 💬 **Community**: Join discussions in the issues section

### **Professional Support**
For priority support, custom development, or consulting services, please contact the development team.

---

**Built with ❤️ for WordPress agencies, developers, and their clients.**

*Making website feedback as simple as point and click.*
   - Click on any element you want to comment on
   - A popup will appear asking for your comment
   - Type your feedback and click "Save Comment"
   - A screenshot will be automatically captured

3. **View and Reply to Comments**
   - Existing comments appear as numbered markers
   - Click on any marker to view details
   - Add replies or update status (if permitted)

## 🎯 Technical Implementation

### Dynamic DOM Targeting
The plugin uses two approaches for reliable element targeting:

1. **CSS Selector Generation**: Creates unique selectors for clicked elements
2. **Position-based Fallback**: Stores X/Y coordinates as backup
3. **Screenshot Capture**: Uses html2canvas to capture visual context

### Database Structure

**Comments Table** (`wp_agwp_cht_comments`):
- `id` - Unique comment ID
- `post_id` - Associated WordPress post
- `user_id` - Comment author
- `comment_text` - The actual comment
- `element_selector` - CSS selector for the element
- `screenshot_url` - Base64 or URL of captured screenshot
- `x_position`, `y_position` - Element coordinates
- `page_url` - Full URL where comment was made
- `status` - open, in_progress, resolved
- Timestamps for created/updated

**Replies Table** (`wp_agwp_cht_comment_replies`):
- `id` - Unique reply ID
- `comment_id` - Parent comment reference
- `user_id` - Reply author
- `reply_text` - Reply content
- `created_at` - Timestamp

### React Components Structure

```
src/
├── components/
│   ├── VisualCommentsApp.js     # Main app container
│   ├── CommentToggle.js         # Toggle button component
│   ├── CommentOverlay.js        # Instruction overlay
│   ├── CommentPopup.js          # New comment form
│   ├── CommentsDisplay.js       # Comments manager
│   └── CommentMarker.js         # Individual comment markers
├── admin/
│   └── AdminDashboard.js        # Admin dashboard component
├── styles/
│   ├── frontend.scss            # Frontend styles
│   └── admin.scss               # Admin styles
├── frontend.js                  # Frontend entry point
└── admin.js                     # Admin entry point
```

## 🔧 Development

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run start
   ```
   This will:
   - Watch for file changes
   - Auto-compile SCSS to CSS
   - Bundle JavaScript with hot reload

2. **Code Structure**
   - PHP files handle WordPress integration and AJAX endpoints
   - React components manage the frontend user interface
   - SCSS files provide styling with WordPress admin theme compatibility

3. **Build for Production**
   ```bash
   npm run build
   ```

### Key Files

- `analogwp-client-handoff.php` - Main plugin file with WordPress hooks
- `admin/admin-page.php` - Admin dashboard HTML
- `admin/comments-page.php` - Comments management page
- `src/components/VisualCommentsApp.js` - Main React application
- `package.json` - Dependencies and build scripts
- `webpack.config.js` - Asset bundling configuration

## 🎨 Customization

### Styling
All styles are in SCSS format with CSS variables for easy customization:

```scss
// Custom color scheme
$primary-color: #your-brand-color;
$danger-color: #your-error-color;
$success-color: #your-success-color;
```

### User Permissions
Configure which user roles can add comments:

```php
// In WordPress Admin > Client Handoff > Settings
'allowed_roles' => ['administrator', 'editor', 'author']
```

### Screenshot Settings
Control screenshot capture:

```php
// Disable auto-screenshots
update_option('agwp_cht_auto_screenshot', 0);
```

## 🔒 Security Features

- **Nonce Verification**: All AJAX requests are protected with WordPress nonces
- **User Capability Checks**: Actions restricted based on user permissions
- **Data Sanitization**: All inputs sanitized before database storage
- **Escaped Outputs**: All dynamic content properly escaped for display

## 📋 Browser Support

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the GPL v2 or later - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:
1. Check the WordPress admin for any error messages
2. Enable WordPress debug mode to see detailed errors
3. Ensure all dependencies are installed and assets are built
4. Check browser console for JavaScript errors

### Common Issues

**Comments not saving:**
- Check user permissions
- Verify nonce security tokens
- Ensure database tables were created properly

**Toggle button not appearing:**
- Confirm user has `edit_posts` capability
- Check if admin bar is enabled
- Verify scripts are properly enqueued

**Screenshots not capturing:**
- Ensure html2canvas library loaded
- Check for CORS issues with external resources
- Verify browser supports canvas API

## 🚀 Roadmap

- **v1.1**: Mobile responsive improvements
- **v1.2**: Integration with popular page builders (Elementor, Gutenberg)
- **v1.3**: Email notifications for new comments
- **v1.4**: Advanced filtering and sorting options
- **v1.5**: Multi-language support

---

Built with ❤️ for WordPress agencies and their clients.