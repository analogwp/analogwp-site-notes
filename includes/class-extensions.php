<?php
/**
 * Plugin Extensions Handler
 *
 * Provides a foundation for future plugin extensibility.
 * This system allows for seamless integration with extensions.
 *
 * The extensibility hooks work in the background and can be utilized
 * by separate plugins without showing any promotional content.
 *
 * @package AnalogWP\SiteNotes
 * @since 1.1.0
 */

namespace AnalogWP\SiteNotes;

use AnalogWP\SiteNotes\Utils\Has_Instance;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class to manage extensions and features
 *
 * @since 1.0.0
 */
class Extensions {
	use Has_Instance;

	/**
	 * Registered ext features
	 *
	 * @var array
	 */
	private static $ext_features = array();

	/**
	 * Registered ext tabs
	 *
	 * @var array
	 */
	private static $ext_tabs = array();

	/**
	 * Initialize ext extensions
	 */
	public static function init() {
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_ext_data' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_ext_data' ) );

		// Hook for ext plugin to register features.
		do_action( 'agwp_sn_register_ext_features' );
	}

	/**
	 * Register an ext feature
	 *
	 * @param string $feature_name Feature identifier
	 * @param array  $config       Feature configuration
	 */
	public static function register_feature( $feature_name, $config = array() ) {
		$defaults = array(
			'name'        => $feature_name,
			'label'       => ucfirst( $feature_name ),
			'description' => '',
			'version'     => '1.0.0',
			'active'      => false,
		);

		self::$ext_features[ $feature_name ] = wp_parse_args( $config, $defaults );
	}

	/**
	 * Register an ext tab
	 *
	 * @param string $tab_id Tab identifier
	 * @param array  $config Tab configuration
	 */
	public static function register_tab( $tab_id, $config = array() ) {
		$defaults = array(
			'id'          => $tab_id,
			'label'       => ucfirst( $tab_id ),
			'icon'        => 'cog',
			'order'       => 100,
			'ext'         => true,
			'component'   => null,
		);

		self::$ext_tabs[ $tab_id ] = wp_parse_args( $config, $defaults );
	}

	/**
	 * Check if a feature is available
	 *
	 * @param string $feature_name Feature to check
	 * @return bool
	 */
	public static function is_feature_available( $feature_name ) {
		return isset( self::$ext_features[ $feature_name ] ) &&
			   self::$ext_features[ $feature_name ]['active'];
	}

	/**
	 * Get all registered extended features
	 *
	 * @return array
	 */
	public static function get_ext_features() {
		return self::$ext_features;
	}

	/**
	 * Get all registered extended tabs
	 *
	 * @return array
	 */
	public static function get_ext_tabs() {
		return self::$ext_tabs;
	}

	/**
	 * Check if ext plugin is active
	 *
	 * @return bool
	 */
	public static function is_ext_active() {
		return defined( 'AGWP_SN_EXT_VERSION' ) && is_plugin_active( 'analogwp-site-notes-ext/analogwp-site-notes-ext.php' );
	}

	/**
	 * Get ext plugin version
	 *
	 * @return string|null
	 */
	public static function get_ext_version() {
		return defined( 'AGWP_SN_EXT_VERSION' ) ? AGWP_SN_EXT_VERSION : null;
	}

	/**
	 * Enqueue extension data for JavaScript
	 */
	public static function enqueue_ext_data() {
		if ( ! is_admin() && ! wp_script_is( 'agwp-sn-admin' ) ) {
			return;
		}

		$ext_data = array(
			'isExtActive'   => self::is_ext_active(),
			'extVersion'    => self::get_ext_version(),
			'features'      => self::get_ext_features(),
			'tabs'          => self::get_ext_tabs(),
		);

		wp_localize_script( 'agwp-sn-admin', 'agwp_sn_ext', $ext_data );
	}

	/**
	 * Validate extended setting access
	 *
	 * @param string $setting_path Setting path (e.g., 'notifications.email_notifications')
	 * @return bool
	 */
	public static function validate_ext_setting( $setting_path ) {
		$ext_settings_map = array(
			'notifications' => 'notifications',
			'users'         => 'userManagement',
			'security'      => 'security',
			'advanced'      => 'advanced',
		);

		$setting_parts = explode( '.', $setting_path );
		$main_setting = $setting_parts[0];

		if ( isset( $ext_settings_map[ $main_setting ] ) ) {
			return self::is_feature_available( $ext_settings_map[ $main_setting ] );
		}

		return true; // Allow non-ext settings.
	}

	/**
	 * Filter settings to remove ext settings if not available
	 *
	 * @param array $settings Settings array
	 * @return array
	 */
	public static function filter_settings( $settings ) {
		if ( self::is_ext_active() ) {
			return $settings;
		}

		// Remove ext-only settings if ext is not active.
		$ext_sections = array( 'notifications', 'users', 'security', 'advanced' );

		foreach ( $ext_sections as $section ) {
			if ( isset( $settings[ $section ] ) ) {
				unset( $settings[ $section ] );
			}
		}

		return $settings;
	}
}

// Initialize extension.
add_action( 'init', array( Extensions::class, 'init' ) );

/**
 * Helper functions for pro features
 */

if ( ! function_exists( 'agwp_sn_is_ext_active' ) ) {
	/**
	 * Check if ext plugin is active
	 *
	 * @return bool
	 */
	function agwp_sn_is_ext_active() {
		return Extensions::is_ext_active();
	}
}

if ( ! function_exists( 'agwp_sn_is_feature_available' ) ) {
	/**
	 * Check if a ext feature is available
	 *
	 * @param string $feature_name Feature name
	 * @return bool
	 */
	function agwp_sn_is_feature_available( $feature_name ) {
		return Extensions::is_feature_available( $feature_name );
	}
}

if ( ! function_exists( 'agwp_sn_register_ext_feature' ) ) {
	/**
	 * Register a ext feature
	 *
	 * @param string $feature_name Feature name
	 * @param array  $config       Feature configuration
	 */
	function agwp_sn_register_ext_feature( $feature_name, $config = array() ) {
		Extensions::register_feature( $feature_name, $config );
	}
}

if ( ! function_exists( 'agwp_sn_register_ext_tab' ) ) {
	/**
	 * Register a ext settings tab
	 *
	 * @param string $tab_id Tab ID
	 * @param array  $config Tab configuration
	 */
	function agwp_sn_register_ext_tab( $tab_id, $config = array() ) {
		Extensions::register_tab( $tab_id, $config );
	}
}
