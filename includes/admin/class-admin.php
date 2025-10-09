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
		// Check if user has access based on allowed roles
		if ( ! AGWP_CHT_Client_Handoff_Toolkit::user_has_access() ) {
			return;
		}

		add_menu_page(
			__( 'Client Handoff', 'analogwp-client-handoff' ),
			__( 'Client Handoff', 'analogwp-client-handoff' ),
			'read', // Use 'read' capability which all logged-in users have
			'agwp-cht-dashboard',
			array( $this, 'render_admin_page' ),
			'dashicons-feedback',
			30
		);

		add_submenu_page(
			'agwp-cht-dashboard',
			__( 'Tasks', 'analogwp-client-handoff' ),
			__( 'Tasks', 'analogwp-client-handoff' ),
			'read',
			'agwp-cht-dashboard',
			array( $this, 'render_admin_page' )
		);

		add_submenu_page(
			'agwp-cht-dashboard',
			__( 'Settings', 'analogwp-client-handoff' ),
			__( 'Settings', 'analogwp-client-handoff' ),
			'manage_options', // Only admins can access settings
			'agwp-cht-settings',
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
		// Only show on frontend, not in admin.
		if ( is_admin() ) {
			return;
		}

		// Check if frontend comments are enabled
		if ( ! AGWP_CHT_Client_Handoff_Toolkit::frontend_comments_enabled() ) {
			return;
		}

		// Check if user has access
		if ( ! AGWP_CHT_Client_Handoff_Toolkit::user_has_access() ) {
			return;
		}

		// Add parent menu item.
		$wp_admin_bar->add_node(
			array(
				'id'    => 'agwp-cht-menu',
				'title' => __( 'Tasks & Comments', 'analogwp-client-handoff' ),
				'href'  => '#',
				'meta'  => array(
					'class' => 'agwp-cht-admin-bar-menu',
				),
			)
		);

		// Add "Turn Comments ON/OFF" submenu item.
		$wp_admin_bar->add_node(
			array(
				'parent' => 'agwp-cht-menu',
				'id'     => 'agwp-cht-toggle',
				'title'  => '<span id="cht-admin-bar-toggle">' . __( 'Turn Comments ON', 'analogwp-client-handoff' ) . '</span>',
				'href'   => '#',
				'meta'   => array(
					'class' => 'agwp-cht-admin-bar-toggle',
				),
			)
		);

		// Add "Tasks Board" submenu item.
		$wp_admin_bar->add_node(
			array(
				'parent' => 'agwp-cht-menu',
				'id'     => 'agwp-cht-tasks-board',
				'title'  => __( 'Tasks Board', 'analogwp-client-handoff' ),
				'href'   => admin_url( 'admin.php?page=agwp-cht-dashboard' ),
			)
		);

		// Add "Settings" submenu item.
		$wp_admin_bar->add_node(
			array(
				'parent' => 'agwp-cht-menu',
				'id'     => 'agwp-cht-settings-link',
				'title'  => __( 'Settings', 'analogwp-client-handoff' ),
				'href'   => admin_url( 'admin.php?page=agwp-cht-settings' ),
			)
		);
	}

	/**
	 * Render admin page.
	 *
	 * @since 1.0.0
	 */
	public function render_admin_page() {
		$current_screen = get_current_screen();
		$page_slug      = '';

		if ( $current_screen && isset( $current_screen->id ) ) {
			$page_slug = $current_screen->id;
		}

		// Check permissions based on page type.
		if ( 'client-handoff_page_agwp-cht-settings' === $page_slug ) {
			// Settings page requires admin access.
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'analogwp-client-handoff' ) );
			}
		} else {
			// Dashboard/Tasks page requires user to have access based on allowed roles.
			if ( ! AGWP_CHT_Client_Handoff_Toolkit::user_has_access() ) {
				wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'analogwp-client-handoff' ) );
			}
		}

		// Determine which admin page to render.
		switch ( $page_slug ) {
			case 'toplevel_page_agwp-cht-dashboard':
			case 'client-handoff_page_agwp-cht-dashboard':
				$this->render_dashboard_page();
				break;
			case 'client-handoff_page_agwp-cht-settings':
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
			<div id="agwp-cht-admin-dashboard"></div>
		</div>
		<?php
	}

	/**
	 * Render comments page.
	 *
	/**
	 * Render settings page.
	 *
	 * @since 1.0.0
	 */
	private function render_settings_page() {
		?>
		<div class="wrap">
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
			'manage_comments' => AGWP_CHT_Client_Handoff_Toolkit::user_has_access(),
			'delete_comments' => AGWP_CHT_Client_Handoff_Toolkit::user_has_access(),
			'view_stats'      => AGWP_CHT_Client_Handoff_Toolkit::user_has_access(),
		);
	}

	/**
	 * Check if user can manage plugin.
	 *
	 * @since 1.0.0
	 * @return bool True if user can manage plugin.
	 */
	public function can_manage_plugin() {
		return AGWP_CHT_Client_Handoff_Toolkit::user_has_access();
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
