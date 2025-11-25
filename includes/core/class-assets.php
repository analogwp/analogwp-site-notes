<?php
/**
 * Assets management class.
 *
 * @package AnalogWP\SiteNotes
 * @since 1.0.0
 */

namespace AnalogWP\SiteNotes\Core;

use AnalogWP\SiteNotes\Plugin;
use AnalogWP\SiteNotes\Utils\Has_Instance;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Assets class for managing plugin scripts and styles.
 *
 * @since 1.0.0
 */
class Assets {
	use Has_Instance;

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_scripts' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
	}

	/**
	 * Enqueue frontend scripts and styles.
	 *
	 * @since 1.0.0
	 */
	public function enqueue_frontend_scripts() {
		// Check if we should load frontend assets.
		if ( ! $this->should_load_frontend_assets() ) {
			return;
		}

		$asset_file = AGWP_SN_PLUGIN_PATH . 'assets/app/frontend.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'agwp-sn-frontend',
			AGWP_SN_PLUGIN_URL . 'assets/app/frontend.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'agwp-sn-frontend',
			AGWP_SN_PLUGIN_URL . 'assets/app/frontend.css',
			array(),
			$asset['version']
		);

		// Localize script with data.
		wp_localize_script(
			'agwp-sn-frontend',
			'agwp_sn_ajax',
			$this->get_frontend_localized_data()
		);
	}

	/**
	 * Enqueue admin scripts and styles.
	 *
	 * @since 1.0.0
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_admin_scripts( $hook ) {
		// Only load on plugin admin pages.
		if ( ! $this->is_plugin_admin_page( $hook ) ) {
			return;
		}

		$asset_file = AGWP_SN_PLUGIN_PATH . 'assets/app/admin.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'agwp-sn-admin',
			AGWP_SN_PLUGIN_URL . 'assets/app/admin.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		// Enqueue WordPress Components and related styles.
		wp_enqueue_style(
			'wp-components',
			includes_url( 'css/dist/components/style.min.css' ),
			array(),
			get_bloginfo( 'version' )
		);

		wp_enqueue_style(
			'agwp-sn-admin',
			AGWP_SN_PLUGIN_URL . 'assets/app/admin.css',
			array( 'wp-components' ),
			$asset['version']
		);

		// Localize script with data.
		wp_localize_script(
			'agwp-sn-admin',
			'agwp_sn_ajax',
			$this->get_admin_localized_data()
		);
	}

	/**
	 * Check if frontend assets should be loaded.
	 *
	 * @since 1.0.0
	 * @return bool True if assets should be loaded.
	 */
	private function should_load_frontend_assets() {
		// Load on frontend pages (not admin).
		if ( is_admin() ) {
			return false;
		}

		// Check if frontend comments are enabled in settings.
		if ( ! Plugin::frontend_comments_enabled() ) {
			return false;
		}

		// Check if current user has access.
		if ( ! Plugin::user_has_access() ) {
			return false;
		}

		// Add any additional conditions here.
		return apply_filters( 'agwp_sn_load_frontend_assets', true );
	}

	/**
	 * Check if current page is a plugin admin page.
	 *
	 * @since 1.0.0
	 * @param string $hook Current admin page hook.
	 * @return bool True if it's a plugin admin page.
	 */
	private function is_plugin_admin_page( $hook ) {
		$plugin_pages = array(
			'toplevel_page_agwp-sn-dashboard',
			'site-notes_page_agwp-sn-dashboard',
			'site-notes_page_agwp-sn-settings',
		);

		return in_array( $hook, $plugin_pages, true );
	}

	/**
	 * Get localized data for frontend scripts.
	 *
	 * @since 1.0.0
	 * @return array Localized data.
	 */
	private function get_frontend_localized_data() {
		// Get plugin settings.
		$default_settings = array(
			'general' => array(
				'auto_screenshot'    => true,
				'screenshot_quality' => 0.8,
			),
		);
		$saved_settings   = get_option( 'agwp_sn_settings', array() );
		$settings         = wp_parse_args( $saved_settings, $default_settings );

		$debug_enabled = isset( $settings['advanced']['enable_debug_mode'] ) ? $settings['advanced']['enable_debug_mode'] : false;
		$log_level = isset( $settings['advanced']['log_level'] ) ? $settings['advanced']['log_level'] : 'error';

		return array(
			'ajaxUrl'           => admin_url( 'admin-ajax.php' ),
			'nonce'             => wp_create_nonce( 'agwp_sn_nonce' ),
			'postId'            => get_the_ID(),
			'pageUrl'           => get_permalink(),
			'currentUser'       => $this->get_current_user_data(),
			'canManageComments' => Plugin::user_has_access(),
			'settings'          => $settings,
			'strings'           => $this->get_frontend_strings(),
			'debug'             => $debug_enabled,
			'logLevel'          => $log_level,
		);
	}

	/**
	 * Get localized data for admin scripts.
	 *
	 * @since 1.0.0
	 * @return array Localized data.
	 */
	private function get_admin_localized_data() {
		$settings = get_option( 'agwp_sn_settings', array() );
		$debug_enabled = isset( $settings['advanced']['enable_debug_mode'] ) ? $settings['advanced']['enable_debug_mode'] : false;
		$log_level = isset( $settings['advanced']['log_level'] ) ? $settings['advanced']['log_level'] : 'error';

		return array(
			'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
			'nonce'         => wp_create_nonce( 'agwp_sn_nonce' ),
			'currentUser'   => $this->get_current_user_data(),
			'strings'       => $this->get_admin_strings(),
			'pluginVersion' => AGWP_SN_VERSION,
			'wpVersion'     => get_bloginfo( 'version' ),
			'phpVersion'    => phpversion(),
			'pluginUrl'     => AGWP_SN_PLUGIN_URL,
			'debug'         => $debug_enabled,
			'logLevel'      => $log_level,
		);
	}

	/**
	 * Get current user data.
	 *
	 * @since 1.0.0
	 * @return array User data.
	 */
	private function get_current_user_data() {
		$current_user = wp_get_current_user();

		if ( ! $current_user->exists() ) {
			return array();
		}

		return array(
			'id'           => $current_user->ID,
			'display_name' => $current_user->display_name,
			'user_email'   => $current_user->user_email,
		);
	}

	/**
	 * Get frontend translatable strings.
	 *
	 * @since 1.0.0
	 * @return array Translatable strings.
	 */
	private function get_frontend_strings() {
		return array(
			'addComment'         => __( 'Add Comment', 'analogwp-site-notes' ),
			'saveComment'        => __( 'Save Comment', 'analogwp-site-notes' ),
			'cancel'             => __( 'Cancel', 'analogwp-site-notes' ),
			'reply'              => __( 'Reply', 'analogwp-site-notes' ),
			'delete'             => __( 'Delete', 'analogwp-site-notes' ),
			'confirmDelete'      => __( 'Are you sure you want to delete this comment?', 'analogwp-site-notes' ),
			'commentSaved'       => __( 'Comment saved successfully!', 'analogwp-site-notes' ),
			'errorSaving'        => __( 'Error saving comment', 'analogwp-site-notes' ),
			'statusUpdated'      => __( 'Status updated successfully!', 'analogwp-site-notes' ),
			'errorUpdatingStatus' => __( 'Error updating status', 'analogwp-site-notes' ),
			'replyAdded'         => __( 'Reply added successfully!', 'analogwp-site-notes' ),
			'errorAddingReply'   => __( 'Error adding reply', 'analogwp-site-notes' ),
			'commentDeleted'     => __( 'Comment deleted successfully!', 'analogwp-site-notes' ),
			'errorDeleting'      => __( 'Error deleting comment', 'analogwp-site-notes' ),
		);
	}

	/**
	 * Get admin translatable strings.
	 *
	 * @since 1.0.0
	 * @return array Translatable strings.
	 */
	private function get_admin_strings() {
		return array(
			'dashboard'     => __( 'Dashboard', 'analogwp-site-notes' ),
			'comments'      => __( 'Comments', 'analogwp-site-notes' ),
			'tasks'         => __( 'Tasks', 'analogwp-site-notes' ),
			'settings'      => __( 'Settings', 'analogwp-site-notes' ),
			'open'          => __( 'Open', 'analogwp-site-notes' ),
			'inProgress'    => __( 'In Progress', 'analogwp-site-notes' ),
			'resolved'      => __( 'Resolved', 'analogwp-site-notes' ),
			'high'          => __( 'High', 'analogwp-site-notes' ),
			'medium'        => __( 'Medium', 'analogwp-site-notes' ),
			'low'           => __( 'Low', 'analogwp-site-notes' ),
			'loading'       => __( 'Loading...', 'analogwp-site-notes' ),
			'noComments'    => __( 'No comments found', 'analogwp-site-notes' ),
			'errorLoading'  => __( 'Error loading data', 'analogwp-site-notes' ),
		);
	}
}
