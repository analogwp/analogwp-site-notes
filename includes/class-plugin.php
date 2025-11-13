<?php
/**
 * Main class for the plugin.
 *
 * @copyright SmallTownDev
 * @package AnalogWP\SiteNotes
 */

namespace AnalogWP\SiteNotes;

use AnalogWP\SiteNotes\Core\Admin;
use AnalogWP\SiteNotes\API\Ajax;
use AnalogWP\SiteNotes\Core\Assets;
use AnalogWP\SiteNotes\Core\Data\Database;

/**
 * Main plugin class
 *
 * @since 1.0.0
 */
final class Plugin {

	/**
	 * Plugin instance.
	 *
	 * @since 1.0.0
	 * @var Plugin|null
	 */
	private static $instance = null;

	/**
	 * Database manager instance.
	 *
	 * @since 1.0.0
	 * @var Database|null
	 */
	public $database = null;

	/**
	 * Admin manager instance.
	 *
	 * @since 1.0.0
	 * @var Admin|null
	 */
	public $admin = null;

	/**
	 * AJAX manager instance.
	 *
	 * @since 1.0.0
	 * @var Ajax|null
	 */
	public $ajax = null;

	/**
	 * Assets manager instance.
	 *
	 * @since 1.0.0
	 * @var Assets|null
	 */
	public $assets = null;

	/**
	 * Loads the plugin main instance and initializes it.
	 *
	 * @return bool True if the plugin main instance could be loaded, false otherwise.
	 */
	public static function load_instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();

			/**
			 * Sites Notes loaded action.
			 *
			 * Fires when Sites Notes is fully loaded and instantiated.
			 *
			 * @since 1.0.2
			 */
			do_action( 'analog_site_notes_loaded' );
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		// Load all else.
		add_action( 'init', array( $this, 'setup' ), -999 );

		// Multisite handling.
		if ( is_multisite() ) {
			// Handle new blog creation on multisite.
			add_action( 'wpmu_new_blog', array( $this, 'create_tables_on_new_blog' ), 10, 1 );

			// Handle blog deletion on multisite.
			add_filter( 'wpmu_drop_tables', array( $this, 'drop_tables_on_blog_delete' ) );
		}

		// Register activation hook.
		register_activation_hook( AGWP_SN_PLUGIN_FILE, array( $this, 'activate' ) );

		// Register deactivation hook.
		register_deactivation_hook( AGWP_SN_PLUGIN_FILE, array( $this, 'deactivate' ) );
	}



	/**
	 * Loads the translation files.
	 *
	 * @since 1.0.2
	 * @access public
	 * @return void
	 */
	public function lang() {
		load_plugin_textdomain( 'analogwp-site-notes', false, AGWP_SN_PLUGIN_PATH . 'languages' );
	}

	/**
	 * Include required files.
	 *
	 * @since 1.0.0
	 */
	private function includes() {
		// Global includes.
		require_once AGWP_SN_PLUGIN_PATH . 'includes/utils/trait-instance.php';
		require_once AGWP_SN_PLUGIN_PATH . 'includes/core/class-assets.php';
		require_once AGWP_SN_PLUGIN_PATH . 'includes/core/data/class-database.php';
		require_once AGWP_SN_PLUGIN_PATH . 'includes/core/class-admin.php';
		require_once AGWP_SN_PLUGIN_PATH . 'includes/api/class-ajax.php';
		require_once AGWP_SN_PLUGIN_PATH . 'includes/class-extensions.php';
	}

	/**
	 * Setup plugin.
	 *
	 * @since 1.0.0
	 */
	public function setup() {
		// Load translation files.
		$this->lang();

		// Include required files.
		$this->includes();

		// Initialize core components.
		$this->database = Database::get_instance();
		$this->assets   = Assets::get_instance();
		$this->admin    = Admin::get_instance();
		$this->ajax     = Ajax::get_instance();
	}

	/**
	 * Plugin activation.
	 *
	 * @since 1.0.0
	 * @param bool $network_wide Whether the plugin is being activated network-wide.
	 */
	public function activate( $network_wide = false ) {
		// Create database tables.
		if ( ! $this->database ) {
			$this->database = Database::get_instance();
		}

		// Handle multisite activation.
		if ( is_multisite() && $network_wide ) {
			// Get all blogs.
			$blog_ids = get_sites( array( 'fields' => 'ids' ) );

			foreach ( $blog_ids as $blog_id ) {
				switch_to_blog( $blog_id );
				$this->database->create_tables();
				update_option( 'agwp_sn_version', AGWP_SN_VERSION );
				restore_current_blog();
			}
		} else {
			// Single site or single blog activation.
			$this->database->create_tables();
			update_option( 'agwp_sn_version', AGWP_SN_VERSION );
		}

		// Flush rewrite rules.
		flush_rewrite_rules();

		do_action( 'agwp_sn_plugin_activated' );
	}

	/**
	 * Plugin deactivation.
	 *
	 * @since 1.0.0
	 */
	public function deactivate() {
		// Flush rewrite rules.
		flush_rewrite_rules();

		do_action( 'agwp_sn_plugin_deactivated' );
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
		update_option( 'agwp_sn_version', AGWP_SN_VERSION );
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

		$tables[] = $wpdb->prefix . 'agwp_sn_comments';
		$tables[] = $wpdb->prefix . 'agwp_sn_comment_replies';

		return $tables;
	}

	/**
	 * Check if current user has access to site notes functionality.
	 *
	 * @since 1.0.0
	 * @return bool True if user has access.
	 */
	public static function user_has_access() {
		// Administrators always have access.
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		// Get allowed roles from settings.
		$settings      = get_option( 'agwp_sn_settings', array() );
		$allowed_roles = isset( $settings['general']['allowed_roles'] ) ? $settings['general']['allowed_roles'] : array( 'administrator', 'editor' );

		// Ensure administrator is always in the list.
		if ( ! in_array( 'administrator', $allowed_roles, true ) ) {
			$allowed_roles[] = 'administrator';
		}

		// Get current user.
		$user = wp_get_current_user();

		if ( ! $user || ! $user->exists() ) {
			return false;
		}

		// Check if user has any of the allowed roles.
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
		$settings = get_option( 'agwp_sn_settings', array() );
		return isset( $settings['general']['enable_frontend_comments'] ) ? (bool) $settings['general']['enable_frontend_comments'] : true;
	}

	/**
	 * Retrieves the main instance of the plugin.
	 *
	 * @since 1.0.0
	 *
	 * @return Plugin Plugin main instance.
	 */
	public static function instance() {
		return self::$instance;
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
