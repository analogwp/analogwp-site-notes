<?php
/**
 * Admin functionality class.
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
 * Admin class for managing WordPress admin interface.
 *
 * @since 1.0.0
 */
class Admin {
	use Has_Instance;

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
		do_action( 'agwp_sn_admin_init' );
	}

	/**
	 * Add admin menu pages.
	 *
	 * @since 1.0.0
	 */
	public function add_admin_menu() {
		// Check if user has access based on allowed roles.
		if ( ! Plugin::user_has_access() ) {
			return;
		}

		add_menu_page(
			__( 'Site Notes', 'analogwp-site-notes' ),
			__( 'Site Notes', 'analogwp-site-notes' ),
			'read', // Use 'read' capability which all logged-in users have.
			'agwp-sn-dashboard',
			array( $this, 'render_admin_page' ),
			'dashicons-feedback',
			30
		);

		add_submenu_page(
			'agwp-sn-dashboard',
			__( 'Tasks', 'analogwp-site-notes' ),
			__( 'Tasks', 'analogwp-site-notes' ),
			'read',
			'agwp-sn-dashboard',
			array( $this, 'render_admin_page' )
		);

		add_submenu_page(
			'agwp-sn-dashboard',
			__( 'Settings', 'analogwp-site-notes' ),
			__( 'Settings', 'analogwp-site-notes' ),
			'manage_options', // Only admins can access settings.
			'agwp-sn-settings',
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

		// Check if frontend comments are enabled.
		if ( ! Plugin::frontend_comments_enabled() ) {
			return;
		}

		// Check if user has access.
		if ( ! Plugin::user_has_access() ) {
			return;
		}

		// Add parent menu item.
		$wp_admin_bar->add_node(
			array(
				'id'    => 'agwp-sn-menu',
				'title' => __( 'Tasks & Comments', 'analogwp-site-notes' ),
				'href'  => '#',
				'meta'  => array(
					'class' => 'agwp-sn-admin-bar-menu',
				),
			)
		);

		// Add "Turn Comments ON/OFF" submenu item.
		$wp_admin_bar->add_node(
			array(
				'parent' => 'agwp-sn-menu',
				'id'     => 'agwp-sn-toggle',
				'title'  => '<span id="sn-admin-bar-toggle">' . __( 'Turn Comments ON', 'analogwp-site-notes' ) . '</span>',
				'href'   => '#',
				'meta'   => array(
					'class' => 'agwp-sn-admin-bar-toggle',
				),
			)
		);

		// Add "Tasks Board" submenu item.
		$wp_admin_bar->add_node(
			array(
				'parent' => 'agwp-sn-menu',
				'id'     => 'agwp-sn-tasks-board',
				'title'  => __( 'Tasks Board', 'analogwp-site-notes' ),
				'href'   => admin_url( 'admin.php?page=agwp-sn-dashboard' ),
			)
		);

		// Add "Settings" submenu item.
		$wp_admin_bar->add_node(
			array(
				'parent' => 'agwp-sn-menu',
				'id'     => 'agwp-sn-settings-link',
				'title'  => __( 'Settings', 'analogwp-site-notes' ),
				'href'   => admin_url( 'admin.php?page=agwp-sn-settings' ),
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
		if ( 'site-notes_page_agwp-sn-settings' === $page_slug ) {
			// Settings page requires admin access.
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'analogwp-site-notes' ) );
			}
		} else {
			// Dashboard/Tasks page requires user to have access based on allowed roles.
			if ( ! Plugin::user_has_access() ) {
				wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'analogwp-site-notes' ) );
			}
		}

		// Determine which admin page to render.
		switch ( $page_slug ) {
			case 'toplevel_page_agwp-sn-dashboard':
			case 'site-notes_page_agwp-sn-dashboard':
				$this->render_dashboard_page();
				break;
			case 'site-notes_page_agwp-sn-settings':
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
			<div id="agwp-sn-admin-dashboard"></div>
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
			<div id="agwp-sn-admin-settings"></div>
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
			'manage_comments' => Plugin::user_has_access(),
			'delete_comments' => Plugin::user_has_access(),
			'view_stats'      => Plugin::user_has_access(),
		);
	}

	/**
	 * Check if user can manage plugin.
	 *
	 * @since 1.0.0
	 * @return bool True if user can manage plugin.
	 */
	public function can_manage_plugin() {
		return Plugin::user_has_access();
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
				'slug'  => 'analogwp-site-notes',
				'title' => __( 'Dashboard', 'analogwp-site-notes' ),
			),
			'comments'  => array(
				'slug'  => 'analogwp-site-notes-comments',
				'title' => __( 'Comments', 'analogwp-site-notes' ),
			),
			'settings'  => array(
				'slug'  => 'analogwp-site-notes-settings',
				'title' => __( 'Settings', 'analogwp-site-notes' ),
			),
		);
	}
}
