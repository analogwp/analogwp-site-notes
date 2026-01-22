<?php
/**
 * Plugin Name: Site Notes
 * Plugin URI: https://analogwp.com/site-notes/
 * Description: A comprehensive solution for agency-client transitions with visual commenting system, maintenance scheduling, and client-friendly editing mode.
 * Version: 1.1.2
 * Author: AnalogWP
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: analogwp-site-notes
 * Requires at least: 6.2
 * Tested up to: 6.9
 * Requires PHP: 7.4
 *
 * @package AnalogWP_Site_Notes
 */

// Prevent direct access.
defined( 'ABSPATH' ) || exit;

// Define plugin constants.
define( 'AGWP_SN_VERSION', '1.1.2' );
define( 'AGWP_SN_PLUGIN_FILE', __FILE__ );
define( 'AGWP_SN_PLUGIN_URL', plugin_dir_url( AGWP_SN_PLUGIN_FILE ) );
define( 'AGWP_SN_PLUGIN_PATH', plugin_dir_path( AGWP_SN_PLUGIN_FILE ) );

// Load dependencies.
$vendor_file = __DIR__ . '/vendor/autoload.php';

if ( is_readable( $vendor_file ) ) {
	require_once $vendor_file;
}


if ( ! function_exists( 'agwp_sn_fs' ) ) {
	/**
	 * Create a helper function for easy SDK access.
	 *
	 * @since 1.1.0
	 *
	 * @return object
	 */
	function agwp_sn_fs() {
		global $agwp_sn_fs;

		if ( ! isset( $agwp_sn_fs ) ) {
			// Include Freemius SDK.
			// SDK is auto-loaded through Composer.

			$agwp_sn_fs = fs_dynamic_init(
				array(
					'id'             => '22009',
					'slug'           => 'analogwp-site-notes',
					'type'           => 'plugin',
					'public_key'     => 'pk_7c9e9f440cfa3b8d5efd79736df85',
					'is_premium'     => false,
					'has_addons'     => false,
					'has_paid_plans' => false,
					'menu'           => array(
						'slug'           => 'agwp-sn-dashboard',
						'override_exact' => true,
						'first-path'     => 'admin.php?page=agwp-sn-dashboard',
						'account'        => false,
						'support'        => false,
						'contact'        => false,
						'addons'         => false,
					),
				)
			);
		}

		return $agwp_sn_fs;
	}

	// Init Freemius.
	agwp_sn_fs();
	// Signal that SDK was initiated.
	do_action( 'agwp_sn_fs_loaded' );

	/**
	 * Custom settings URL.
	 *
	 * @return string
	 */
	function agwp_sn_fs_settings_url() {
		return admin_url( 'admin.php?page=agwp-sn-dashboard' );
	}

	agwp_sn_fs()->add_filter( 'connect_url', 'agwp_sn_fs_settings_url' );
	agwp_sn_fs()->add_filter( 'after_skip_url', 'agwp_sn_fs_settings_url' );
	agwp_sn_fs()->add_filter( 'after_connect_url', 'agwp_sn_fs_settings_url' );
	agwp_sn_fs()->add_filter( 'after_pending_connect_url', 'agwp_sn_fs_settings_url' );

	// Disable automatic redirect on activation to prevent redirect to settings page before menu is registered.
	agwp_sn_fs()->add_filter( 'redirect_on_activation', '__return_false' );
}

/**
 * Load the main plugin class.
 */
require_once AGWP_SN_PLUGIN_PATH . 'includes/class-plugin.php';

// Initialize the plugin.
\AnalogWP\SiteNotes\Plugin::load_instance();
