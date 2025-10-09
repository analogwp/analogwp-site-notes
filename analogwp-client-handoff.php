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
 * Requires at least: 5.0
 * Tested up to: 6.8.3
 * Requires PHP: 7.4
 *
 * @package AnalogWP_Client_Handoff
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
if ( ! defined( 'AGWP_CHT_VERSION' ) ) {
	define( 'AGWP_CHT_VERSION', '1.0.0' );
}

if ( ! defined( 'AGWP_CHT_PLUGIN_URL' ) ) {
	define( 'AGWP_CHT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}

if ( ! defined( 'AGWP_CHT_PLUGIN_PATH' ) ) {
	define( 'AGWP_CHT_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( 'AGWP_CHT_PLUGIN_FILE' ) ) {
	define( 'AGWP_CHT_PLUGIN_FILE', __FILE__ );
}

if ( ! defined( 'AGWP_CHT_INCLUDES_PATH' ) ) {
	define( 'AGWP_CHT_INCLUDES_PATH', AGWP_CHT_PLUGIN_PATH . 'includes/' );
}

/**
 * Main plugin class
 *
 * @since 1.0.0
 */
final class AGWP_CHT_Client_Handoff_Toolkit {

	/**
	 * Plugin instance.
	 *
	 * @since 1.0.0
	 * @var AGWP_CHT_Client_Handoff_Toolkit|null
	 */
	private static $instance = null;

	/**
	 * Database manager instance.
	 *
	 * @since 1.0.0
	 * @var AGWP_CHT_Database|null
	 */
	public $database = null;

	/**
	 * Admin manager instance.
	 *
	 * @since 1.0.0
	 * @var AGWP_CHT_Admin|null
	 */
	public $admin = null;

	/**
	 * AJAX manager instance.
	 *
	 * @since 1.0.0
	 * @var AGWP_CHT_Ajax|null
	 */
	public $ajax = null;

	/**
	 * Assets manager instance.
	 *
	 * @since 1.0.0
	 * @var AGWP_CHT_Assets|null
	 */
	public $assets = null;

	/**
	 * Get plugin instance.
	 *
	 * @since 1.0.0
	 * @return AGWP_CHT_Client_Handoff_Toolkit
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		$this->includes();
		$this->init();
	}

	/**
	 * Include required files.
	 *
	 * @since 1.0.0
	 */
	private function includes() {
		// Core classes
		require_once AGWP_CHT_INCLUDES_PATH . 'class-database.php';
		require_once AGWP_CHT_INCLUDES_PATH . 'class-assets.php';
		require_once AGWP_CHT_INCLUDES_PATH . 'admin/class-admin.php';
		require_once AGWP_CHT_INCLUDES_PATH . 'ajax/class-ajax.php';
		require_once AGWP_CHT_INCLUDES_PATH . 'class-pro-extensions.php';
	}

	/**
	 * Initialize plugin.
	 *
	 * @since 1.0.0
	 */
	private function init() {
		// Initialize core components
		$this->database = new AGWP_CHT_Database();
		$this->assets   = new AGWP_CHT_Assets();
		$this->admin    = new AGWP_CHT_Admin();
		$this->ajax     = new AGWP_CHT_Ajax();

		// Hook into WordPress
		add_action( 'init', array( $this, 'init_plugin' ) );
		add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );

		// Multisite: Create tables when a new site is created
		if ( is_multisite() ) {
			add_action( 'wpmu_new_blog', array( $this, 'create_tables_on_new_blog' ), 10, 1 );
			add_filter( 'wpmu_drop_tables', array( $this, 'drop_tables_on_blog_delete' ) );
		}

		// Register activation and deactivation hooks
		register_activation_hook( __FILE__, array( $this, 'activate' ) );
		register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );
	}

	/**
	 * Initialize plugin after WordPress is loaded.
	 *
	 * @since 1.0.0
	 */
	public function init_plugin() {
		// Plugin initialization logic
		do_action( 'agwp_cht_init' );
	}

	/**
	 * Load plugin textdomain.
	 *
	 * @since 1.0.0
	 */
	public function load_textdomain() {
		load_plugin_textdomain(
			'analogwp-client-handoff',
			false,
			dirname( plugin_basename( __FILE__ ) ) . '/languages/'
		);
	}

	/**
	 * Plugin activation.
	 *
	 * @since 1.0.0
	 * @param bool $network_wide Whether the plugin is being activated network-wide.
	 */
	public function activate( $network_wide = false ) {
		// Create database tables
		if ( ! $this->database ) {
			$this->database = new AGWP_CHT_Database();
		}

		// Handle multisite activation
		if ( is_multisite() && $network_wide ) {
			// Get all blogs
			$blog_ids = get_sites( array( 'fields' => 'ids' ) );

			foreach ( $blog_ids as $blog_id ) {
				switch_to_blog( $blog_id );
				$this->database->create_tables();
				update_option( 'agwp_cht_version', AGWP_CHT_VERSION );
				restore_current_blog();
			}
		} else {
			// Single site or single blog activation
			$this->database->create_tables();
			update_option( 'agwp_cht_version', AGWP_CHT_VERSION );
		}

		// Flush rewrite rules
		flush_rewrite_rules();

		do_action( 'agwp_cht_activated' );
	}

	/**
	 * Plugin deactivation.
	 *
	 * @since 1.0.0
	 */
	public function deactivate() {
		// Flush rewrite rules
		flush_rewrite_rules();

		do_action( 'agwp_cht_deactivated' );
	}

	/**
	 * Create tables when a new blog is created in multisite.
	 *
	 * @since 1.0.0
	 * @param int $blog_id Blog ID of the created blog.
	 */
	public function create_tables_on_new_blog( $blog_id ) {
		if ( ! is_multisite() ) {
			return;
		}

		switch_to_blog( $blog_id );
		$this->database->create_tables();
		update_option( 'agwp_cht_version', AGWP_CHT_VERSION );
		restore_current_blog();
	}

	/**
	 * Drop plugin tables when a blog is deleted in multisite.
	 *
	 * @since 1.0.0
	 * @param array $tables Tables to drop.
	 * @return array Modified tables array.
	 */
	public function drop_tables_on_blog_delete( $tables ) {
		global $wpdb;

		$tables[] = $wpdb->prefix . 'agwp_cht_comments';
		$tables[] = $wpdb->prefix . 'agwp_cht_comment_replies';

		return $tables;
	}

	/**
	 * Check if current user has access to client handoff functionality.
	 *
	 * @since 1.0.0
	 * @return bool True if user has access.
	 */
	public static function user_has_access() {
		// Administrators always have access
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		// Get allowed roles from settings
		$settings      = get_option( 'agwp_cht_settings', array() );
		$allowed_roles = isset( $settings['general']['allowed_roles'] ) ? $settings['general']['allowed_roles'] : array( 'administrator', 'editor' );

		// Ensure administrator is always in the list
		if ( ! in_array( 'administrator', $allowed_roles, true ) ) {
			$allowed_roles[] = 'administrator';
		}

		// Get current user
		$user = wp_get_current_user();

		if ( ! $user || ! $user->exists() ) {
			return false;
		}

		// Check if user has any of the allowed roles
		foreach ( $allowed_roles as $role ) {
			if ( in_array( $role, $user->roles, true ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Check if frontend comments are enabled.
	 *
	 * @since 1.0.0
	 * @return bool True if frontend comments are enabled.
	 */
	public static function frontend_comments_enabled() {
		$settings = get_option( 'agwp_cht_settings', array() );
		return isset( $settings['general']['enable_frontend_comments'] ) ? (bool) $settings['general']['enable_frontend_comments'] : true;
	}

	/**
	 * Prevent cloning.
	 *
	 * @since 1.0.0
	 */
	private function __clone() {}

	/**
	 * Prevent unserialization.
	 *
	 * @since 1.0.0
	 */
	public function __wakeup() {}
}

// Initialize the plugin
function agwp_cht() {
	return AGWP_CHT_Client_Handoff_Toolkit::get_instance();
}

// Start the plugin
agwp_cht();
