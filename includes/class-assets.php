<?php
/**
 * Assets management class.
 *
 * @package AnalogWP_Client_Handoff
 * @since 1.0.0
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Assets class for managing plugin scripts and styles.
 *
 * @since 1.0.0
 */
class AGWP_CHT_Assets {

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

		$asset_file = AGWP_CHT_PLUGIN_PATH . 'build/frontend.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'agwp-cht-frontend',
			AGWP_CHT_PLUGIN_URL . 'build/frontend.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'agwp-cht-frontend',
			AGWP_CHT_PLUGIN_URL . 'build/frontend.css',
			array(),
			$asset['version']
		);

		// Localize script with data.
		wp_localize_script(
			'agwp-cht-frontend',
			'chtAjax',
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

		$asset_file = AGWP_CHT_PLUGIN_PATH . 'build/admin.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			'agwp-cht-admin',
			AGWP_CHT_PLUGIN_URL . 'build/admin.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'agwp-cht-admin',
			AGWP_CHT_PLUGIN_URL . 'build/admin.css',
			array(),
			$asset['version']
		);

		// Localize script with data.
		wp_localize_script(
			'agwp-cht-admin',
			'agwpChtAjax',
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

		// Add any additional conditions here.
		return apply_filters( 'agwp_cht_load_frontend_assets', true );
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
			'toplevel_page_agwp-cht-dashboard',
			'client-handoff_page_agwp-cht-dashboard',
			'client-handoff_page_agwp-cht-settings',
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
		return array(
			'ajaxUrl'           => admin_url( 'admin-ajax.php' ),
			'nonce'             => wp_create_nonce( 'agwp_cht_nonce' ),
			'postId'            => get_the_ID(),
			'pageUrl'           => get_permalink(),
			'currentUser'       => $this->get_current_user_data(),
			'canManageComments' => current_user_can( 'manage_options' ),
			'strings'           => $this->get_frontend_strings(),
		);
	}

	/**
	 * Get localized data for admin scripts.
	 *
	 * @since 1.0.0
	 * @return array Localized data.
	 */
	private function get_admin_localized_data() {
		return array(
			'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
			'nonce'         => wp_create_nonce( 'agwp_cht_nonce' ),
			'currentUser'   => $this->get_current_user_data(),
			'strings'       => $this->get_admin_strings(),
			'pluginVersion' => AGWP_CHT_VERSION,
			'wpVersion'     => get_bloginfo( 'version' ),
			'phpVersion'    => phpversion(),
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
			'addComment'         => __( 'Add Comment', 'analogwp-client-handoff' ),
			'saveComment'        => __( 'Save Comment', 'analogwp-client-handoff' ),
			'cancel'             => __( 'Cancel', 'analogwp-client-handoff' ),
			'reply'              => __( 'Reply', 'analogwp-client-handoff' ),
			'delete'             => __( 'Delete', 'analogwp-client-handoff' ),
			'confirmDelete'      => __( 'Are you sure you want to delete this comment?', 'analogwp-client-handoff' ),
			'commentSaved'       => __( 'Comment saved successfully!', 'analogwp-client-handoff' ),
			'errorSaving'        => __( 'Error saving comment', 'analogwp-client-handoff' ),
			'statusUpdated'      => __( 'Status updated successfully!', 'analogwp-client-handoff' ),
			'errorUpdatingStatus' => __( 'Error updating status', 'analogwp-client-handoff' ),
			'replyAdded'         => __( 'Reply added successfully!', 'analogwp-client-handoff' ),
			'errorAddingReply'   => __( 'Error adding reply', 'analogwp-client-handoff' ),
			'commentDeleted'     => __( 'Comment deleted successfully!', 'analogwp-client-handoff' ),
			'errorDeleting'      => __( 'Error deleting comment', 'analogwp-client-handoff' ),
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
			'dashboard'     => __( 'Dashboard', 'analogwp-client-handoff' ),
			'comments'      => __( 'Comments', 'analogwp-client-handoff' ),
			'tasks'         => __( 'Tasks', 'analogwp-client-handoff' ),
			'settings'      => __( 'Settings', 'analogwp-client-handoff' ),
			'open'          => __( 'Open', 'analogwp-client-handoff' ),
			'inProgress'    => __( 'In Progress', 'analogwp-client-handoff' ),
			'resolved'      => __( 'Resolved', 'analogwp-client-handoff' ),
			'high'          => __( 'High', 'analogwp-client-handoff' ),
			'medium'        => __( 'Medium', 'analogwp-client-handoff' ),
			'low'           => __( 'Low', 'analogwp-client-handoff' ),
			'loading'       => __( 'Loading...', 'analogwp-client-handoff' ),
			'noComments'    => __( 'No comments found', 'analogwp-client-handoff' ),
			'errorLoading'  => __( 'Error loading data', 'analogwp-client-handoff' ),
		);
	}
}
