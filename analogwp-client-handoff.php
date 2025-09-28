<?php
/**
 * Plugin Name: Client Handoff Toolkit
 * Plugin URI: https://analogwp.com/analogwp-client-handoff
 * Description: A comprehensive solution for agency-client transitions with visual commenting system, maintenance scheduling, and client-friendly editing mode.
 * Version: 1.0.0
 * Author: AnalogWP
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: analogwp-client-handoff
 * Domain Path: /languages
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
define( 'AGWP_CHT_VERSION', '1.0.0' );
define( 'AGWP_CHT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'AGWP_CHT_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'AGWP_CHT_PLUGIN_FILE', __FILE__ );

// Main Plugin Class
if ( ! class_exists( 'AGWP_CHT_Client_Handoff_Toolkit' ) ) {
	class AGWP_CHT_Client_Handoff_Toolkit {

		private static $instance = null;

		public static function getInstance() {
			if ( self::$instance === null ) {
				self::$instance = new AGWP_CHT_Client_Handoff_Toolkit();
			}
			return self::$instance;
		}

		private function __construct() {
			$this->init();
		}

		private function init() {
			// Hook into WordPress.
			add_action( 'init', array( $this, 'initPlugin' ) );
			add_action( 'admin_menu', array( $this, 'addAdminMenu' ) );
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueueFrontendScripts' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueueAdminScripts' ) );
			add_action( 'wp_ajax_agwp_cht_save_comment', array( $this, 'saveComment' ) );
			add_action( 'wp_ajax_agwp_cht_get_comments', array( $this, 'getComments' ) );
			add_action( 'wp_ajax_agwp_cht_update_comment_status', array( $this, 'updateCommentStatus' ) );
			add_action( 'wp_ajax_agwp_cht_add_reply', array( $this, 'addReply' ) );
			add_action( 'wp_ajax_agwp_cht_delete_comment', array( $this, 'deleteComment' ) );
			add_action( 'wp_ajax_agwp_cht_get_dashboard_stats', array( $this, 'getDashboardStats' ) );
			add_action( 'wp_ajax_agwp_cht_get_admin_data', array( $this, 'getAdminData' ) );
			add_action( 'wp_ajax_agwp_cht_get_pages', array( $this, 'getPages' ) );
			add_action( 'wp_ajax_agwp_cht_add_new_task', array( $this, 'addNewTask' ) );
			add_action( 'admin_bar_menu', array( $this, 'addAdminBarToggle' ), 100 );

			// Register activation and deactivation hooks.
			register_activation_hook( __FILE__, array( $this, 'activate' ) );
			register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );
		}

		public function initPlugin() {
			// Create database tables.
			$this->createTables();

			// Load textdomain.
			load_plugin_textdomain( 'analogwp-client-handoff', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
		}

		public function createTables() {
			global $wpdb;

			$table_name = $wpdb->prefix . 'agwp_cht_comments';

			$charset_collate = $wpdb->get_charset_collate();

			$sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            post_id bigint(20) NOT NULL,
            user_id bigint(20) NOT NULL,
            comment_text longtext NOT NULL,
            element_selector varchar(500) DEFAULT '',
            screenshot_url varchar(500) DEFAULT '',
            x_position int(11) DEFAULT 0,
            y_position int(11) DEFAULT 0,
            page_url varchar(500) NOT NULL,
            status varchar(20) DEFAULT 'open',
            priority varchar(20) DEFAULT 'medium',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY post_id (post_id),
            KEY user_id (user_id),
            KEY status (status)
        ) $charset_collate;";

			$replies_table = $wpdb->prefix . 'agwp_cht_comment_replies';

			$replies_sql = "CREATE TABLE $replies_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            comment_id mediumint(9) NOT NULL,
            user_id bigint(20) NOT NULL,
            reply_text longtext NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY comment_id (comment_id),
            KEY user_id (user_id),
            FOREIGN KEY (comment_id) REFERENCES $table_name(id) ON DELETE CASCADE
        ) $charset_collate;";

			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
			dbDelta( $sql );
			dbDelta( $replies_sql );
		}

		public function addAdminMenu() {
			add_menu_page(
				__( 'Client Handoff', 'analogwp-client-handoff' ),
				__( 'Client Handoff', 'analogwp-client-handoff' ),
				'manage_options',
				'analogwp-client-handoff',
				array( $this, 'adminPage' ),
				'dashicons-feedback',
				30
			);
		}

		public function adminPage() {
			include AGWP_CHT_PLUGIN_PATH . 'admin/admin-page.php';
		}

		public function enqueueFrontendScripts() {
			// Only load for logged-in users who can edit posts
			if ( ! is_user_logged_in() || ! current_user_can( 'edit_posts' ) ) {
				return;
			}

			wp_enqueue_script(
				'cht-frontend',
				AGWP_CHT_PLUGIN_URL . 'assets/dist/frontend.js',
				array( 'wp-element', 'wp-api-fetch' ),
				AGWP_CHT_VERSION,
				true
			);

			wp_enqueue_style(
				'cht-frontend',
				AGWP_CHT_PLUGIN_URL . 'assets/dist/frontend.css',
				array(),
				AGWP_CHT_VERSION
			);

			wp_localize_script(
				'cht-frontend',
				'chtAjax',
				array(
					'ajaxUrl' => admin_url( 'admin-ajax.php' ),
					'nonce' => wp_create_nonce( 'agwp_cht_nonce' ),
					'postId' => get_the_ID(),
					'pageUrl' => get_permalink(),
					'currentUser' => wp_get_current_user(),
					'canManageComments' => current_user_can( 'manage_options' ),
				)
			);
		}

		public function enqueueAdminScripts( $hook ) {
			if ( strpos( $hook, 'analogwp-client-handoff' ) === false ) {
				return;
			}

			wp_enqueue_script(
				'cht-admin',
				AGWP_CHT_PLUGIN_URL . 'assets/dist/admin.js',
				array( 'wp-element', 'wp-api-fetch' ),
				AGWP_CHT_VERSION,
				true
			);

			wp_enqueue_style(
				'cht-admin',
				AGWP_CHT_PLUGIN_URL . 'assets/dist/admin.css',
				array(),
				AGWP_CHT_VERSION
			);

			wp_localize_script(
				'cht-admin',
				'chtAdmin',
				array(
					'ajaxUrl' => admin_url( 'admin-ajax.php' ),
					'nonce' => wp_create_nonce( 'agwp_cht_nonce' ),
				)
			);
		}

		public function addAdminBarToggle( $wp_admin_bar ) {
			if ( ! is_user_logged_in() || ! current_user_can( 'edit_posts' ) || is_admin() ) {
				return;
			}

			$wp_admin_bar->add_node(
				array(
					'id' => 'cht-toggle',
					'title' => '<span id="cht-admin-bar-toggle">' . __( 'Visual Comments', 'analogwp-client-handoff' ) . ' <span class="cht-toggle-status">OFF</span></span>',
					'href' => '#',
					'meta' => array(
						'class' => 'cht-admin-bar-item',
					),
				)
			);
		}

		public function saveComment() {
			check_ajax_referer( 'cht_nonce', 'nonce' );

			if ( ! current_user_can( 'edit_posts' ) ) {
				wp_die( __( 'Unauthorized', 'analogwp-client-handoff' ) );
			}

			global $wpdb;

			$table_name = $wpdb->prefix . 'agwp_cht_comments';

			// Handle screenshot data URL conversion to file
			$screenshot_url = '';
			if ( ! empty( $_POST['screenshot_url'] ) && strpos( $_POST['screenshot_url'], 'data:image' ) === 0 ) {
				$screenshot_url = $this->saveScreenshotFromDataURL( $_POST['screenshot_url'] );
			} elseif ( ! empty( $_POST['screenshot_url'] ) ) {
				$screenshot_url = sanitize_url( $_POST['screenshot_url'] );
			}

			$result = $wpdb->insert(
				$table_name,
				array(
					'post_id' => intval( $_POST['post_id'] ),
					'user_id' => get_current_user_id(),
					'comment_text'     => sanitize_textarea_field( $_POST['comment_text'] ),
					'element_selector' => sanitize_text_field( $_POST['element_selector'] ),
					'screenshot_url' => $screenshot_url,
					'x_position' => intval( $_POST['x_position'] ),
					'y_position' => intval( $_POST['y_position'] ),
					'page_url' => sanitize_url( $_POST['page_url'] ),
					'status' => 'open',
					'priority' => isset( $_POST['priority'] ) ? sanitize_text_field( $_POST['priority'] ) : 'medium',
				)
			);

			if ( $result === false ) {
				wp_send_json_error( __( 'Failed to save comment', 'analogwp-client-handoff' ) );
			}

			wp_send_json_success(
				array(
					'id' => $wpdb->insert_id,
					'message' => __( 'Comment saved successfully', 'analogwp-client-handoff' ),
					'screenshot_url' => $screenshot_url,
				)
			);
		}

		private function saveScreenshotFromDataURL( $data_url ) {
			try {
				// Parse the data URL
				if ( ! preg_match( '/^data:image\/(\w+);base64,(.+)$/', $data_url, $matches ) ) {
					return '';
				}

				$image_type = $matches[1];
				$image_data = base64_decode( $matches[2] );

				if ( $image_data === false ) {
					return '';
				}

				// Create upload directory if it doesn't exist
				$upload_dir = wp_upload_dir();
				$cht_dir = $upload_dir['basedir'] . '/cht-screenshots';

				if ( ! file_exists( $cht_dir ) ) {
					wp_mkdir_p( $cht_dir );
				}

				// Generate unique filename
				$filename = 'cht-screenshot-' . time() . '-' . wp_generate_uuid4() . '.' . $image_type;
				$file_path = $cht_dir . '/' . $filename;

				// Save the image
				if ( file_put_contents( $file_path, $image_data ) !== false ) {
					// Return the URL to the saved image
					return $upload_dir['baseurl'] . '/cht-screenshots/' . $filename;
				}

				return '';
			} catch ( Exception $e ) {
				error_log( 'CHT Screenshot save error: ' . $e->getMessage() );
				return '';
			}
		}

		public function getComments() {
			check_ajax_referer( 'cht_nonce', 'nonce' );

			if ( ! current_user_can( 'edit_posts' ) ) {
				wp_die( __( 'Unauthorized', 'analogwp-client-handoff' ) );
			}

			global $wpdb;

			$table_name = $wpdb->prefix . 'agwp_cht_comments';
			$replies_table = $wpdb->prefix . 'agwp_cht_comment_replies';

			$page_url = sanitize_url( $_POST['page_url'] );

			$comments = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT c.*, u.display_name 
             FROM $table_name c 
             LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID 
             WHERE c.page_url = %s 
             ORDER BY c.created_at DESC",
					$page_url
				)
			);

			foreach ( $comments as &$comment ) {
				$replies = $wpdb->get_results(
					$wpdb->prepare(
						"SELECT r.*, u.display_name 
                 FROM $replies_table r 
                 LEFT JOIN {$wpdb->users} u ON r.user_id = u.ID 
                 WHERE r.comment_id = %d 
                 ORDER BY r.created_at ASC",
						$comment->id
					)
				);

				$comment->replies = $replies;
			}

			wp_send_json_success( $comments );
		}

		public function updateCommentStatus() {
			check_ajax_referer( 'cht_nonce', 'nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( __( 'Unauthorized', 'analogwp-client-handoff' ) );
			}

			global $wpdb;

			$table_name = $wpdb->prefix . 'agwp_cht_comments';

			$result = $wpdb->update(
				$table_name,
				array( 'status' => sanitize_text_field( $_POST['status'] ) ),
				array( 'id' => intval( $_POST['comment_id'] ) )
			);

			if ( $result === false ) {
				wp_send_json_error( __( 'Failed to update status', 'analogwp-client-handoff' ) );
			}

			wp_send_json_success( __( 'Status updated successfully', 'analogwp-client-handoff' ) );
		}

		public function addReply() {
			check_ajax_referer( 'cht_nonce', 'nonce' );

			if ( ! current_user_can( 'edit_posts' ) ) {
				wp_die( __( 'Unauthorized', 'analogwp-client-handoff' ) );
			}

			global $wpdb;

			$replies_table = $wpdb->prefix . 'agwp_cht_comment_replies';

			$result = $wpdb->insert(
				$replies_table,
				array(
					'comment_id' => intval( $_POST['comment_id'] ),
					'user_id' => get_current_user_id(),
					'reply_text' => sanitize_textarea_field( $_POST['reply_text'] ),
				)
			);

			if ( $result === false ) {
				wp_send_json_error( __( 'Failed to save reply', 'analogwp-client-handoff' ) );
			}

			wp_send_json_success(
				array(
					'id' => $wpdb->insert_id,
					'message' => __( 'Reply saved successfully', 'analogwp-client-handoff' ),
				)
			);
		}

		public function deleteComment() {
			check_ajax_referer( 'cht_nonce', 'nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( __( 'Unauthorized', 'analogwp-client-handoff' ) );
			}

			if ( ! isset( $_POST['comment_id'] ) ) {
				wp_send_json_error( array( 'message' => __( 'Comment ID required', 'analogwp-client-handoff' ) ) );
			}

			$comment_id = intval( $_POST['comment_id'] );

			if ( ! $comment_id ) {
				wp_send_json_error( array( 'message' => __( 'Invalid comment ID', 'analogwp-client-handoff' ) ) );
			}

			global $wpdb;

			$comments_table = $wpdb->prefix . 'agwp_cht_comments';
			$replies_table = $wpdb->prefix . 'agwp_cht_comment_replies';

			// Get comment details for screenshot cleanup.
			$comment = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$comments_table} WHERE id = %d", $comment_id ) );

			if ( ! $comment ) {
				wp_send_json_error( array( 'message' => __( 'Comment not found', 'analogwp-client-handoff' ) ) );
			}

			// Delete associated screenshot file if exists.
			if ( $comment->screenshot_url ) {
				$upload_dir = wp_upload_dir();
				$screenshot_path = str_replace( $upload_dir['baseurl'], $upload_dir['basedir'], $comment->screenshot_url );
				if ( file_exists( $screenshot_path ) ) {
					wp_delete_file( $screenshot_path );
				}
			}

			// Delete replies first (foreign key constraint).
			$wpdb->delete( $replies_table, array( 'comment_id' => $comment_id ), array( '%d' ) );

			// Delete the comment.
			$result = $wpdb->delete( $comments_table, array( 'id' => $comment_id ), array( '%d' ) );

			if ( false === $result ) {
				wp_send_json_error( array( 'message' => __( 'Failed to delete comment', 'analogwp-client-handoff' ) ) );
			}

			wp_send_json_success( array( 'message' => __( 'Comment deleted successfully', 'analogwp-client-handoff' ) ) );
		}

		public function getDashboardStats() {
			check_ajax_referer( 'cht_nonce', 'nonce' );

			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( __( 'Unauthorized', 'analogwp-client-handoff' ) );
			}

			global $wpdb;

			$table_name = $wpdb->prefix . 'agwp_cht_comments';

			// Get stats
			$open_count = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'open'" );
			$resolved_count = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name WHERE status = 'resolved'" );
			$total_count = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );

			// Get recent comments
			$recent_comments = $wpdb->get_results(
				"
            SELECT c.*, u.display_name, p.post_title
            FROM $table_name c
            LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID
            LEFT JOIN {$wpdb->posts} p ON c.post_id = p.ID
            ORDER BY c.created_at DESC
            LIMIT 10
        "
			);

			wp_send_json_success(
				array(
					'stats' => array(
						'open' => (int) $open_count,
						'resolved' => (int) $resolved_count,
						'total' => (int) $total_count,
					),
					'recent_comments' => $recent_comments,
				)
			);
		}

		public function getAdminData() {
			// Verify nonce
			if ( ! wp_verify_nonce( $_POST['nonce'], 'agwp_cht_nonce' ) ) {
				wp_die( 'Security check failed' );
			}

			global $wpdb;
			$table_name = $wpdb->prefix . 'agwp_cht_comments';
			$replies_table = $wpdb->prefix . 'agwp_cht_comment_replies';

			// Get all comments
			$comments = $wpdb->get_results(
				"
            SELECT c.*, u.display_name, p.post_title
            FROM $table_name c
            LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID
            LEFT JOIN {$wpdb->posts} p ON c.post_id = p.ID
            ORDER BY c.created_at DESC
        "
			);

			// Get replies for each comment
			$comments_with_replies = array();
			foreach ( $comments as $comment ) {
				$replies = $wpdb->get_results(
					$wpdb->prepare(
						"
                    SELECT r.*, u.display_name
                    FROM $replies_table r
                    LEFT JOIN {$wpdb->users} u ON r.user_id = u.ID
                    WHERE r.comment_id = %d
                    ORDER BY r.created_at ASC
                ",
						$comment->id
					)
				);

				$comment->replies = $replies;
				$comments_with_replies[] = $comment;
			}

			// Get all users who can comment
			$users = get_users(
				array(
					'capability' => 'edit_posts',
					'fields' => array( 'ID', 'display_name', 'user_email' ),
				)
			);

			// Format users data
			$users_formatted = array();
			foreach ( $users as $user ) {
				$users_formatted[] = array(
					'id' => (int) $user->ID,
					'name' => $user->display_name,
					'email' => $user->user_email,
					'avatar' => get_avatar_url( $user->ID, array( 'size' => 32 ) ),
				);
			}

			// Get categories (unique page URLs as categories)
			$categories = array_unique( array_column( $comments_with_replies, 'page_url' ) );

			wp_send_json_success(
				array(
					'comments' => $comments_with_replies,
					'users' => $users_formatted,
					'categories' => array_filter( $categories ),
				)
			);
		}

		public function getPages() {
			// Verify nonce
			if ( ! wp_verify_nonce( $_POST['nonce'], 'agwp_cht_nonce' ) ) {
				wp_die( 'Security check failed' );
			}

			// Get all published pages and posts
			$pages = get_posts(
				array(
					'post_type' => array( 'page', 'post' ),
					'post_status' => 'publish',
					'numberposts' => -1,
					'orderby' => 'title',
					'order' => 'ASC',
				)
			);

			// Add special WordPress pages
			$special_pages = array(
				array(
					'id' => 'home',
					'title' => __( 'Home Page', 'analogwp-client-handoff' ),
					'url' => home_url(),
				),
				array(
					'id' => 'blog',
					'title' => __( 'Blog Page', 'analogwp-client-handoff' ),
					'url' => get_permalink( get_option( 'page_for_posts' ) ),
				),
				array(
					'id' => '404',
					'title' => __( '404 Error Page', 'analogwp-client-handoff' ),
					'url' => home_url( '/404-test-page' ),
				),
				array(
					'id' => 'search',
					'title' => __( 'Search Results', 'analogwp-client-handoff' ),
					'url' => home_url( '?s=test' ),
				),
			);

			// Format regular pages/posts
			$formatted_pages = array();
			foreach ( $pages as $page ) {
				$formatted_pages[] = array(
					'id' => $page->ID,
					'title' => $page->post_title,
					'url' => get_permalink( $page->ID ),
				);
			}

			// Merge special pages with regular pages
			$all_pages = array_merge( $special_pages, $formatted_pages );

			// Get archive pages for custom post types
			$post_types = get_post_types(
				array(
					'public' => true,
					'has_archive' => true,
				),
				'objects'
			);
			foreach ( $post_types as $post_type ) {
				if ( $post_type->name !== 'post' ) {
					$all_pages[] = array(
						'id' => $post_type->name . '_archive',
						'title' => sprintf( __( '%s Archive', 'analogwp-client-handoff' ), $post_type->labels->name ),
						'url' => get_post_type_archive_link( $post_type->name ),
					);
				}
			}

			wp_send_json_success(
				array(
					'pages' => $all_pages,
				)
			);
		}

		public function addNewTask() {
			if ( ! wp_verify_nonce( $_POST['nonce'], 'agwp_cht_nonce' ) ) {
				wp_die( __( 'Unauthorized', 'analogwp-client-handoff' ) );
			}

			global $wpdb;
			$table_name = $wpdb->prefix . 'agwp_cht_comments';

			$result = $wpdb->insert(
				$table_name,
				array(
					'post_id' => intval( $_POST['post_id'] ),
					'user_id' => intval( $_POST['user_id'] ),
					'comment_text' => sanitize_textarea_field( $_POST['comment_text'] ),
					'element_selector' => '',
					'screenshot_url' => '',
					'x_position' => 0,
					'y_position' => 0,
					'page_url' => get_permalink( intval( $_POST['post_id'] ) ),
					'status' => sanitize_text_field( $_POST['status'] ),
					'priority' => sanitize_text_field( $_POST['priority'] ),
				)
			);

			if ( $result === false ) {
				wp_send_json_error( __( 'Failed to save task', 'analogwp-client-handoff' ) );
			}

			wp_send_json_success(
				array(
					'id' => $wpdb->insert_id,
					'message' => __( 'Task created successfully', 'analogwp-client-handoff' ),
				)
			);
		}

		public function activate() {
			$this->createTables();
			flush_rewrite_rules();
		}

		public function deactivate() {
			flush_rewrite_rules();
		}
	}

	// Initialize the plugin
	AGWP_CHT_Client_Handoff_Toolkit::getInstance();
}
