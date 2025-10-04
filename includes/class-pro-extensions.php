<?php
/**
 * Pro Plugin Extensions Handler
 *
 * Provides a foundation for future plugin extensibility.
 * This system allows for seamless integration with future add-ons while
 * maintaining WordPress.org compliance (no upgrade prompts or upselling).
 *
 * The extensibility hooks work in the background and can be utilized
 * by separate plugins without showing any promotional content.
 *
 * @package AnalogWP_Client_Handoff
 * @since 1.1.0
 */if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AGWP_CHT_Pro_Extensions {

	/**
	 * Registered pro features
	 *
	 * @var array
	 */
	private static $pro_features = array();

	/**
	 * Registered pro tabs
	 *
	 * @var array
	 */
	private static $pro_tabs = array();

	/**
	 * Initialize pro extensions
	 */
	public static function init() {
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_pro_data' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_pro_data' ) );

		// Hook for pro plugin to register features
		do_action( 'agwp_cht_register_pro_features' );
	}

	/**
	 * Register a pro feature
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

		self::$pro_features[ $feature_name ] = wp_parse_args( $config, $defaults );
	}

	/**
	 * Register a pro tab
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
			'pro'         => true,
			'component'   => null,
		);

		self::$pro_tabs[ $tab_id ] = wp_parse_args( $config, $defaults );
	}

	/**
	 * Check if a feature is available
	 *
	 * @param string $feature_name Feature to check
	 * @return bool
	 */
	public static function is_feature_available( $feature_name ) {
		return isset( self::$pro_features[ $feature_name ] ) &&
			   self::$pro_features[ $feature_name ]['active'];
	}

	/**
	 * Get all registered pro features
	 *
	 * @return array
	 */
	public static function get_pro_features() {
		return self::$pro_features;
	}

	/**
	 * Get all registered pro tabs
	 *
	 * @return array
	 */
	public static function get_pro_tabs() {
		return self::$pro_tabs;
	}

	/**
	 * Check if pro plugin is active
	 *
	 * @return bool
	 */
	public static function is_pro_active() {
		return defined( 'AGWP_CHT_PRO_VERSION' ) &&
			   is_plugin_active( 'analogwp-client-handoff-pro/analogwp-client-handoff-pro.php' );
	}

	/**
	 * Get pro plugin version
	 *
	 * @return string|null
	 */
	public static function get_pro_version() {
		return defined( 'AGWP_CHT_PRO_VERSION' ) ? AGWP_CHT_PRO_VERSION : null;
	}

	/**
	 * Enqueue pro extension data for JavaScript
	 */
	public static function enqueue_pro_data() {
		if ( ! is_admin() && ! wp_script_is( 'agwp-cht-admin' ) ) {
			return;
		}

		$pro_data = array(
			'isProActive'   => self::is_pro_active(),
			'proVersion'    => self::get_pro_version(),
			'features'      => self::get_pro_features(),
			'tabs'          => self::get_pro_tabs(),
		);

		wp_localize_script( 'agwp-cht-admin', 'agwpChtPro', $pro_data );
	}

	/**
	 * Get upgrade URL - removed for WordPress.org compliance
	 *
	 * @return string
	 */
	public static function get_upgrade_url() {
		return '';
	}   /**
		 * Validate pro setting access
		 *
		 * @param string $setting_path Setting path (e.g., 'notifications.email_notifications')
		 * @return bool
		 */
	public static function validate_pro_setting( $setting_path ) {
		$pro_settings_map = array(
			'notifications' => 'notifications',
			'users'         => 'userManagement',
			'security'      => 'security',
			'advanced'      => 'advanced',
		);

		$setting_parts = explode( '.', $setting_path );
		$main_setting = $setting_parts[0];

		if ( isset( $pro_settings_map[ $main_setting ] ) ) {
			return self::is_feature_available( $pro_settings_map[ $main_setting ] );
		}

		return true; // Allow non-pro settings
	}

	/**
	 * Filter settings to remove pro settings if not available
	 *
	 * @param array $settings Settings array
	 * @return array
	 */
	public static function filter_settings( $settings ) {
		if ( self::is_pro_active() ) {
			return $settings;
		}

		// Remove pro-only settings if pro is not active
		$pro_sections = array( 'notifications', 'users', 'security', 'advanced' );

		foreach ( $pro_sections as $section ) {
			if ( isset( $settings[ $section ] ) ) {
				unset( $settings[ $section ] );
			}
		}

		return $settings;
	}
}

// Initialize pro extensions
add_action( 'init', array( 'AGWP_CHT_Pro_Extensions', 'init' ) );

/**
 * Helper functions for pro features
 */

if ( ! function_exists( 'agwp_cht_is_pro_active' ) ) {
	/**
	 * Check if pro plugin is active
	 *
	 * @return bool
	 */
	function agwp_cht_is_pro_active() {
		return AGWP_CHT_Pro_Extensions::is_pro_active();
	}
}

if ( ! function_exists( 'agwp_cht_is_feature_available' ) ) {
	/**
	 * Check if a pro feature is available
	 *
	 * @param string $feature_name Feature name
	 * @return bool
	 */
	function agwp_cht_is_feature_available( $feature_name ) {
		return AGWP_CHT_Pro_Extensions::is_feature_available( $feature_name );
	}
}

if ( ! function_exists( 'agwp_cht_register_pro_feature' ) ) {
	/**
	 * Register a pro feature
	 *
	 * @param string $feature_name Feature name
	 * @param array  $config       Feature configuration
	 */
	function agwp_cht_register_pro_feature( $feature_name, $config = array() ) {
		AGWP_CHT_Pro_Extensions::register_feature( $feature_name, $config );
	}
}

if ( ! function_exists( 'agwp_cht_register_pro_tab' ) ) {
	/**
	 * Register a pro settings tab
	 *
	 * @param string $tab_id Tab ID
	 * @param array  $config Tab configuration
	 */
	function agwp_cht_register_pro_tab( $tab_id, $config = array() ) {
		AGWP_CHT_Pro_Extensions::register_tab( $tab_id, $config );
	}
}
