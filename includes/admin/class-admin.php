<?php
/**
 * Admin functionality class.
 *
 * @package AnalogWP_Client_Handoff
 * @since 1.0.0
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin class for managing WordPress admin interface.
 *
 * @since 1.0.0
 */
class AGWP_CHT_Admin {

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_bar_menu', array( $this, 'add_admin_bar_toggle' ), 100 );
		add_action( 'admin_init', array( $this, 'init_admin' ) );
	}

	/**
	 * Initialize admin functionality.
	 *
	 * @since 1.0.0
	 */
	public function init_admin() {
		// Admin initialization logic can go here.
		do_action( 'agwp_cht_admin_init' );
	}

	/**
	 * Add admin menu pages.
	 *
	 * @since 1.0.0
	 */
	public function add_admin_menu() {
		add_menu_page(
			__( 'Client Handoff', 'analogwp-client-handoff' ),
			__( 'Client Handoff', 'analogwp-client-handoff' ),
			'manage_options',
			'analogwp-client-handoff',
			array( $this, 'render_admin_page' ),
			'dashicons-feedback',
			30
		);

		add_submenu_page(
			'analogwp-client-handoff',
			__( 'Dashboard', 'analogwp-client-handoff' ),
			__( 'Dashboard', 'analogwp-client-handoff' ),
			'manage_options',
			'analogwp-client-handoff',
			array( $this, 'render_admin_page' )
		);

		add_submenu_page(
			'analogwp-client-handoff',
			__( 'Comments', 'analogwp-client-handoff' ),
			__( 'Comments', 'analogwp-client-handoff' ),
			'manage_options',
			'analogwp-client-handoff-comments',
			array( $this, 'render_admin_page' )
		);

		add_submenu_page(
			'analogwp-client-handoff',
			__( 'Settings', 'analogwp-client-handoff' ),
			__( 'Settings', 'analogwp-client-handoff' ),
			'manage_options',
			'analogwp-client-handoff-settings',
			array( $this, 'render_admin_page' )
		);
	}

	/**
	 * Add admin bar toggle.
	 *
	 * @since 1.0.0
	 * @param WP_Admin_Bar $wp_admin_bar WordPress admin bar object.
	 */
	public function add_admin_bar_toggle( $wp_admin_bar ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$wp_admin_bar->add_node(
			array(
				'id'    => 'agwp-cht-toggle',
				'title' => __( 'Toggle Comments', 'analogwp-client-handoff' ),
				'href'  => '#',
				'meta'  => array(
					'class' => 'agwp-cht-admin-bar-toggle',
				),
			)
		);
	}

	/**
	 * Render admin page.
	 *
	 * @since 1.0.0
	 */
	public function render_admin_page() {
		// Security check.
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'analogwp-client-handoff' ) );
		}

		$current_screen = get_current_screen();
		$page_slug      = '';

		if ( $current_screen && isset( $current_screen->id ) ) {
			$page_slug = $current_screen->id;
		}

		// Determine which admin page to render.
		switch ( $page_slug ) {
			case 'toplevel_page_analogwp-client-handoff':
				$this->render_dashboard_page();
				break;
			case 'client-handoff_page_analogwp-client-handoff-comments':
				$this->render_comments_page();
				break;
			case 'client-handoff_page_analogwp-client-handoff-settings':
				$this->render_settings_page();
				break;
			default:
				$this->render_dashboard_page();
				break;
		}
	}

	/**
	 * Render dashboard page.
	 *
	 * @since 1.0.0
	 */
	private function render_dashboard_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Client Handoff Dashboard', 'analogwp-client-handoff' ); ?></h1>
			<div id="agwp-cht-admin-dashboard"></div>
		</div>
		<?php
	}

	/**
	 * Render comments page.
	 *
	 * @since 1.0.0
	 */
	private function render_comments_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Client Handoff Comments', 'analogwp-client-handoff' ); ?></h1>
			<div id="agwp-cht-admin-comments"></div>
		</div>
		<?php
	}

	/**
	 * Render settings page.
	 *
	 * @since 1.0.0
	 */
	private function render_settings_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Client Handoff Settings', 'analogwp-client-handoff' ); ?></h1>
			<div id="agwp-cht-admin-settings"></div>
		</div>
		<?php
	}

	/**
	 * Get admin capabilities.
	 *
	 * @since 1.0.0
	 * @return array Admin capabilities.
	 */
	public function get_admin_capabilities() {
		return array(
			'manage_comments' => current_user_can( 'manage_options' ),
			'delete_comments' => current_user_can( 'manage_options' ),
			'view_stats'      => current_user_can( 'manage_options' ),
		);
	}

	/**
	 * Check if user can manage plugin.
	 *
	 * @since 1.0.0
	 * @return bool True if user can manage plugin.
	 */
	public function can_manage_plugin() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get admin menu pages.
	 *
	 * @since 1.0.0
	 * @return array Admin menu pages.
	 */
	public function get_admin_pages() {
		return array(
			'dashboard' => array(
				'slug'  => 'analogwp-client-handoff',
				'title' => __( 'Dashboard', 'analogwp-client-handoff' ),
			),
			'comments'  => array(
				'slug'  => 'analogwp-client-handoff-comments',
				'title' => __( 'Comments', 'analogwp-client-handoff' ),
			),
			'settings'  => array(
				'slug'  => 'analogwp-client-handoff-settings',
				'title' => __( 'Settings', 'analogwp-client-handoff' ),
			),
		);
	}
}
