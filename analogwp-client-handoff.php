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
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
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
	 */
	public function activate() {
		// Create database tables
		if ( $this->database ) {
			$this->database->create_tables();
		}

		// Flush rewrite rules
		flush_rewrite_rules();

		// Set plugin version
		update_option( 'agwp_cht_version', AGWP_CHT_VERSION );

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
