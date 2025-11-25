<?php
/**
 * Plugin Name: AnalogWP Site Notes
 * Plugin URI: https://github.com/analogwp/analogwp-site-notes
 * Description: A comprehensive solution for agency-client transitions with visual commenting system, maintenance scheduling, and client-friendly editing mode.
 * Version: 1.0.3
 * Author: AnalogWP
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: analogwp-site-notes
 * Requires at least: 6.2
 * Tested up to: 6.8.3
 * Requires PHP: 7.4
 *
 * @package AnalogWP_Site_Notes
 */

// Prevent direct access.
defined( 'ABSPATH' ) || exit;

// Define plugin constants.
define( 'AGWP_SN_VERSION', '1.0.3' );
define( 'AGWP_SN_PLUGIN_FILE', __FILE__ );
define( 'AGWP_SN_PLUGIN_URL', plugin_dir_url( AGWP_SN_PLUGIN_FILE ) );
define( 'AGWP_SN_PLUGIN_PATH', plugin_dir_path( AGWP_SN_PLUGIN_FILE ) );

/**
 * Load the main plugin class.
 */
require_once AGWP_SN_PLUGIN_PATH . 'includes/class-plugin.php';

// Initialize the plugin.
\AnalogWP\SiteNotes\Plugin::load_instance();
