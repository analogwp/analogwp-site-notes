<?php
/**
 * AJAX functionality class.
 *
 * @package AnalogWP_Client_Handoff
 * @since 1.0.0
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AJAX class for handling all plugin AJAX requests.
 *
 * @since 1.0.0
 */
class AGWP_CHT_Ajax {

	/**
	 * Database instance.
	 *
	 * @since 1.0.0
	 * @var AGWP_CHT_Database
	 */
	private $database;

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		$this->database = new AGWP_CHT_Database();
		$this->init_hooks();
	}

	/**
	 * Initialize AJAX hooks.
	 *
	 * @since 1.0.0
	 */
	private function init_hooks() {
		// AJAX actions for logged-in users.
		add_action( 'wp_ajax_agwp_cht_save_comment', array( $this, 'save_comment' ) );
		add_action( 'wp_ajax_agwp_cht_get_comments', array( $this, 'get_comments' ) );
		add_action( 'wp_ajax_agwp_cht_update_comment', array( $this, 'update_comment' ) );
		add_action( 'wp_ajax_agwp_cht_update_comment_status', array( $this, 'update_comment_status' ) );
		add_action( 'wp_ajax_agwp_cht_add_reply', array( $this, 'add_reply' ) );
		add_action( 'wp_ajax_agwp_cht_delete_comment', array( $this, 'delete_comment' ) );
		add_action( 'wp_ajax_agwp_cht_get_dashboard_stats', array( $this, 'get_dashboard_stats' ) );
		add_action( 'wp_ajax_agwp_cht_get_admin_data', array( $this, 'get_admin_data' ) );
		add_action( 'wp_ajax_agwp_cht_get_pages', array( $this, 'get_pages' ) );
		add_action( 'wp_ajax_agwp_cht_add_new_task', array( $this, 'add_new_task' ) );

		// Settings AJAX actions.
		add_action( 'wp_ajax_agwp_cht_get_settings', array( $this, 'get_settings' ) );
		add_action( 'wp_ajax_agwp_cht_save_settings', array( $this, 'save_settings' ) );

		// AJAX actions for non-logged-in users.
		add_action( 'wp_ajax_nopriv_agwp_cht_save_comment', array( $this, 'save_comment' ) );
		add_action( 'wp_ajax_nopriv_agwp_cht_get_comments', array( $this, 'get_comments' ) );
		add_action( 'wp_ajax_nopriv_agwp_cht_update_comment_status', array( $this, 'update_comment_status' ) );
		add_action( 'wp_ajax_nopriv_agwp_cht_add_reply', array( $this, 'add_reply' ) );
	}

	/**
	 * Verify AJAX nonce.
	 *
	 * @since 1.0.0
	 * @return bool True if nonce is valid.
	 */
	private function verify_nonce() {
		return check_ajax_referer( 'agwp_cht_nonce', 'nonce', false );
	}

	/**
	 * Send JSON error response.
	 *
	 * @since 1.0.0
	 * @param string $message Error message.
	 * @param int    $code    Error code.
	 */
	private function send_error( $message, $code = 400 ) {
		wp_send_json_error(
			array(
				'message' => sanitize_text_field( $message ),
				'code'    => intval( $code ),
			)
		);
	}

	/**
	 * Send JSON success response.
	 *
	 * @since 1.0.0
	 * @param mixed $data Success data.
	 */
	private function send_success( $data = null ) {
		wp_send_json_success( $data );
	}

	/**
	 * Handle save comment AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function save_comment() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Get POST data.
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified via $this->verify_nonce() above.
		$post_data = wp_unslash( $_POST );

		// Handle screenshot URL if provided.
		$screenshot_url = '';
		if ( ! empty( $post_data['screenshot_url'] ) ) {
			if ( 0 === strpos( $post_data['screenshot_url'], 'data:image' ) ) {
				$screenshot_url = $this->save_screenshot_from_data_url( $post_data['screenshot_url'] );
			} else {
				$screenshot_url = sanitize_url( $post_data['screenshot_url'] );
			}
		}

		// Prepare comment data.
		$comment_data = array(
			'post_id'          => isset( $post_data['post_id'] ) ? absint( $post_data['post_id'] ) : 0,
			'comment_title'    => isset( $post_data['comment_title'] ) ? sanitize_text_field( $post_data['comment_title'] ) : '',
			'comment_text'     => isset( $post_data['comment_text'] ) ? sanitize_textarea_field( $post_data['comment_text'] ) : '',
			'element_selector' => isset( $post_data['element_selector'] ) ? sanitize_text_field( $post_data['element_selector'] ) : '',
			'screenshot_url'   => $screenshot_url,
			'x_position'       => isset( $post_data['x_position'] ) ? absint( $post_data['x_position'] ) : 0,
			'y_position'       => isset( $post_data['y_position'] ) ? absint( $post_data['y_position'] ) : 0,
			'page_url'         => isset( $post_data['page_url'] ) ? sanitize_text_field( $post_data['page_url'] ) : '',
			'status'           => isset( $post_data['status'] ) ? sanitize_text_field( $post_data['status'] ) : 'open',
			'priority'         => isset( $post_data['priority'] ) ? sanitize_text_field( $post_data['priority'] ) : 'medium',
		);

		// Save comment.
		$comment_id = $this->database->save_comment( $comment_data );

		if ( ! $comment_id ) {
			$this->send_error( __( 'Failed to save comment', 'analogwp-client-handoff' ) );
		}

		$this->send_success(
			array(
				'id'      => $comment_id,
				'message' => __( 'Comment saved successfully', 'analogwp-client-handoff' ),
			)
		);
	}

	/**
	 * Handle get comments AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function get_comments() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified via $this->verify_nonce() above.
		$post_data = wp_unslash( $_POST );
		$page_url  = isset( $post_data['page_url'] ) ? sanitize_url( $post_data['page_url'] ) : '';

		if ( empty( $page_url ) ) {
			$this->send_error( __( 'Page URL is required', 'analogwp-client-handoff' ) );
		}

		$comments = $this->database->get_comments( $page_url );

		if ( null === $comments ) {
			$this->send_error( __( 'Failed to retrieve comments', 'analogwp-client-handoff' ) );
		}

		$this->send_success( $comments );
	}

	/**
	 * Handle update comment AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function update_comment() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid nonce', 'analogwp-client-handoff' ) ) );
			return;
		}

		// Check user capability.
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error( array( 'message' => __( 'Insufficient permissions', 'analogwp-client-handoff' ) ) );
			return;
		}

		$post_data  = wp_unslash( $_POST );
		$comment_id = isset( $post_data['comment_id'] ) ? absint( $post_data['comment_id'] ) : 0;

		$updates = array();

		// Get data from the 'updates' field (JSON format - main app).
		if ( isset( $post_data['updates'] ) && ! empty( $post_data['updates'] ) ) {
			$updates = json_decode( sanitize_textarea_field( $post_data['updates'] ), true );
		}

		if ( empty( $comment_id ) || empty( $updates ) || ! is_array( $updates ) ) {
			wp_send_json_error( array( 'message' => __( 'Comment ID and updates are required', 'analogwp-client-handoff' ) ) );
			return;
		}

		$result = $this->database->update_comment( $comment_id, $updates );

		if ( ! $result ) {
			wp_send_json_error( array( 'message' => __( 'Failed to update comment', 'analogwp-client-handoff' ) ) );
			return;
		}

		wp_send_json_success( array( 'message' => __( 'Comment updated successfully', 'analogwp-client-handoff' ) ) );
	}

	/**
	 * Handle update comment status AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function update_comment_status() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified via $this->verify_nonce() above.
		$post_data  = wp_unslash( $_POST );
		$comment_id = isset( $post_data['comment_id'] ) ? absint( $post_data['comment_id'] ) : 0;
		$status     = isset( $post_data['status'] ) ? sanitize_text_field( $post_data['status'] ) : '';

		if ( empty( $comment_id ) || empty( $status ) ) {
			$this->send_error( __( 'Comment ID and status are required', 'analogwp-client-handoff' ) );
		}

		$result = $this->database->update_comment_status( $comment_id, $status );

		if ( ! $result ) {
			$this->send_error( __( 'Failed to update status', 'analogwp-client-handoff' ) );
		}

		$this->send_success( __( 'Status updated successfully', 'analogwp-client-handoff' ) );
	}

	/**
	 * Handle add reply AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function add_reply() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		$post_data = wp_unslash( $_POST ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified via $this->verify_nonce() above.

		// Sanitized before use.
		$reply_data = array(
			'comment_id' => isset( $post_data['comment_id'] ) ? absint( $post_data['comment_id'] ) : 0,
			'reply_text' => isset( $post_data['reply_text'] ) ? sanitize_textarea_field( $post_data['reply_text'] ) : '',
		);

		if ( empty( $reply_data['comment_id'] ) || empty( $reply_data['reply_text'] ) ) {
			$this->send_error( __( 'Comment ID and reply text are required', 'analogwp-client-handoff' ) );
		}

		$reply_id = $this->database->add_reply( $reply_data );

		if ( ! $reply_id ) {
			$this->send_error( __( 'Failed to add reply', 'analogwp-client-handoff' ) );
		}

		$this->send_success(
			array(
				'id'      => $reply_id,
				'message' => __( 'Reply added successfully', 'analogwp-client-handoff' ),
			)
		);
	}

	/**
	 * Handle delete comment AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function delete_comment() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Check permissions - user must have access to client handoff.
		if ( ! AGWP_CHT_Client_Handoff_Toolkit::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-client-handoff' ), 403 );
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified via $this->verify_nonce() above.
		$post_data  = wp_unslash( $_POST );

		// Sanitized before use.
		$comment_id = isset( $post_data['comment_id'] ) ? absint( $post_data['comment_id'] ) : 0;

		if ( empty( $comment_id ) ) {
			$this->send_error( __( 'Comment ID is required', 'analogwp-client-handoff' ) );
		}

		$result = $this->database->delete_comment( $comment_id );

		if ( ! $result ) {
			$this->send_error( __( 'Failed to delete comment', 'analogwp-client-handoff' ) );
		}

		$this->send_success( __( 'Comment deleted successfully', 'analogwp-client-handoff' ) );
	}

	/**
	 * Handle get dashboard stats AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function get_dashboard_stats() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Check permissions - user must have access to client handoff.
		if ( ! AGWP_CHT_Client_Handoff_Toolkit::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-client-handoff' ), 403 );
		}

		$stats = $this->database->get_dashboard_stats();
		$this->send_success( $stats );
	}

	/**
	 * Handle get admin data AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function get_admin_data() {
		// Verify nonce via POST data.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Check permissions - user must have access to client handoff.
		if ( ! AGWP_CHT_Client_Handoff_Toolkit::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-client-handoff' ), 403 );
		}

		// Ensure database tables exist.
		global $wpdb;
		$table_name = $wpdb->prefix . 'agwp_cht_comments';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table existence check, safe usage.
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) !== $table_name ) {
			// Tables don't exist, create them.
			$this->database->create_tables();
		}

		// Get all comments/tasks for the admin dashboard.
		$comments = $this->database->get_comments();
		if ( ! is_array( $comments ) ) {
			$comments = array();
		}

		// Enhance comments with complete user data including avatars.
		foreach ( $comments as &$comment ) {
			// Creator information.
			if ( ! empty( $comment->user_id ) ) {
				$user_data = get_userdata( $comment->user_id );
				if ( $user_data ) {
					$comment->creator = array(
						'id'     => (int) $user_data->ID,
						'name'   => $user_data->display_name,
						'email'  => $user_data->user_email,
						'avatar' => get_avatar_url( $user_data->ID, array( 'size' => 40 ) ),
					);
				} else {
					$comment->creator = array(
						'id'     => (int) $comment->user_id,
						'name'   => $comment->user_name ? $comment->user_name : 'Unknown User',
						'email'  => $comment->user_email ? $comment->user_email : '',
						'avatar' => get_avatar_url( $comment->user_id, array( 'size' => 40 ) ),
					);
				}
			} else {
				$comment->creator = array(
					'id'     => 0,
					'name'   => 'Guest',
					'email'  => '',
					'avatar' => get_avatar_url( 0, array( 'size' => 40 ) ),
				);
			}

			// Assigned user information.
			if ( ! empty( $comment->assigned_to ) ) {
				$assigned_data = get_userdata( $comment->assigned_to );
				if ( $assigned_data ) {
					$comment->assignee = array(
						'id'     => (int) $assigned_data->ID,
						'name'   => $assigned_data->display_name,
						'email'  => $assigned_data->user_email,
						'avatar' => get_avatar_url( $assigned_data->ID, array( 'size' => 40 ) ),
					);
				} else {
					$comment->assignee = array(
						'id'     => (int) $comment->assigned_to,
						'name'   => $comment->assigned_name ? $comment->assigned_name : 'Unknown User',
						'email'  => $comment->assigned_email ? $comment->assigned_email : '',
						'avatar' => get_avatar_url( $comment->assigned_to, array( 'size' => 40 ) ),
					);
				}
			} else {
				$comment->assignee = null;
			}

			// Keep backward compatibility with user field (using creator).
			$comment->user = $comment->creator;
		}

		// Get all users who can manage comments or who have created comments.
		$users = get_users(
			array(
				'fields' => array( 'ID', 'display_name', 'user_email' ),
			)
		);

		// Format users for frontend.
		$formatted_users = array();
		foreach ( $users as $user ) {
			$formatted_users[] = array(
				'id'     => (int) $user->ID,
				'name'   => $user->display_name,
				'email'  => $user->user_email,
				'avatar' => get_avatar_url( $user->ID, array( 'size' => 40 ) ),
			);
		}

		// Get categories (we can use post categories or create custom ones later).
		$categories = get_categories( array( 'hide_empty' => false ) );
		$formatted_categories = array();
		foreach ( $categories as $category ) {
			$formatted_categories[] = array(
				'id'   => $category->term_id,
				'name' => $category->name,
				'slug' => $category->slug,
			);
		}

		// Return admin-specific data.
		$stats = $this->database->get_dashboard_stats();
		if ( ! is_array( $stats ) ) {
			$stats = array(
				'open_count'     => 0,
				'resolved_count' => 0,
				'total_count'    => 0,
				'recent_comments' => array(),
			);
		}

		$admin_data = array(
			'comments'     => $comments,
			'users'        => $formatted_users,
			'categories'   => $formatted_categories,
			'capabilities' => array(
				'manage_comments' => AGWP_CHT_Client_Handoff_Toolkit::user_has_access(),
				'delete_comments' => AGWP_CHT_Client_Handoff_Toolkit::user_has_access(),
			),
			'stats'        => $stats,
		);

		$this->send_success( $admin_data );
	}

	/**
	 * Handle get pages AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function get_pages() {
		// Verify nonce via POST data.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		$items = array();

		// Add taxonomy archives.
		// Get all public taxonomies.
		$taxonomies = get_taxonomies(
			array(
				'public' => true,
			),
			'objects'
		);

		foreach ( $taxonomies as $taxonomy ) {
			// Get all terms for this taxonomy.
			$terms = get_terms(
				array(
					'taxonomy'   => $taxonomy->name,
					'hide_empty' => false,
				)
			);

			if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
				foreach ( $terms as $term ) {
					$term_link = get_term_link( $term );
					if ( ! is_wp_error( $term_link ) ) {
						$items[] = array(
							'id'    => 'term-' . $term->term_id,
							'title' => sprintf(
								/* translators: 1: Taxonomy name, 2: Term name */
								__( '%1$s: %2$s', 'analogwp-client-handoff' ),
								$taxonomy->label,
								$term->name
							),
							'url'   => $term_link,
							'type'  => 'taxonomy',
						);
					}
				}
			}
		}

		// Add author archives.
		$authors = get_users(
			array(
				'who'     => 'authors',
				'orderby' => 'display_name',
			)
		);

		foreach ( $authors as $author ) {
			$items[] = array(
				'id'    => 'author-' . $author->ID,
				'title' => sprintf(
					/* translators: %s: Author name */
					__( 'Author: %s', 'analogwp-client-handoff' ),
					$author->display_name
				),
				'url'   => get_author_posts_url( $author->ID ),
				'type'  => 'archive',
			);
		}

		// Add date archive (example).
		$items[] = array(
			'id'    => 'date-archive',
			'title' => __( 'Date Archive', 'analogwp-client-handoff' ),
			'url'   => home_url( '/date/' ),
			'type'  => 'archive',
		);

		// Add search and 404 pages.
		$items[] = array(
			'id'    => 'search',
			'title' => __( 'Search Results', 'analogwp-client-handoff' ),
			'url'   => home_url( '/?s=test' ),
			'type'  => 'special',
		);

		$items[] = array(
			'id'    => '404',
			'title' => __( '404 Error Page', 'analogwp-client-handoff' ),
			'url'   => home_url( '/404-test-page/' ),
			'type'  => 'special',
		);

		// Get all published pages and posts.
		$pages = get_pages(
			array(
				'sort_order'  => 'ASC',
				'sort_column' => 'post_title',
				'post_status' => 'publish',
			)
		);

		$posts = get_posts(
			array(
				'numberposts' => -1,
				'post_status' => 'publish',
				'post_type'   => 'post',
			)
		);

		// Get custom post types.
		$post_types = get_post_types(
			array(
				'public' => true,
				'_builtin' => false,
			),
			'objects'
		);
		$custom_posts = array();
		foreach ( $post_types as $post_type ) {
			$type_posts = get_posts(
				array(
					'numberposts' => 20, // Limit custom post types to avoid too many entries.
					'post_status' => 'publish',
					'post_type'   => $post_type->name,
				)
			);
			$custom_posts = array_merge( $custom_posts, $type_posts );

			// Add post type archive if it has one.
			if ( $post_type->has_archive ) {
				$items[] = array(
					'id'    => $post_type->name . '-archive',
					/* translators: %s: Post type label */
					'title' => sprintf( __( '%s Archive', 'analogwp-client-handoff' ), $post_type->label ),
					'url'   => get_post_type_archive_link( $post_type->name ),
					'type'  => 'archive',
				);
			}
		}

		$all_posts = array_merge( $pages, $posts, $custom_posts );

		foreach ( $all_posts as $item ) {
			$items[] = array(
				'id'    => $item->ID,
				'title' => $item->post_title,
				'url'   => get_permalink( $item->ID ),
				'type'  => $item->post_type,
			);
		}

		$this->send_success( array( 'pages' => $items ) );
	}

	/**
	 * Handle add new task AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function add_new_task() {
		// Verify nonce via POST data.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Check permissions - user must have access to client handoff.
		if ( ! AGWP_CHT_Client_Handoff_Toolkit::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-client-handoff' ), 403 );
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified via $this->verify_nonce() above.
		$post_data  = wp_unslash( $_POST );

		// Prepare task data.
		$task_data = array(
			'post_id'         => isset( $post_data['post_id'] ) ? intval( $post_data['post_id'] ) : 0,
			'comment_title'   => isset( $post_data['comment_title'] ) ? sanitize_text_field( $post_data['comment_title'] ) : '',
			'comment_text'    => isset( $post_data['comment_text'] ) ? sanitize_textarea_field( $post_data['comment_text'] ) : '',
			'page_url'        => isset( $post_data['page_url'] ) ? sanitize_url( $post_data['page_url'] ) : get_permalink( absint( $post_data['post_id'] ) ),
			'status'          => isset( $post_data['status'] ) ? sanitize_text_field( $post_data['status'] ) : 'open',
			'priority'        => isset( $post_data['priority'] ) ? sanitize_text_field( $post_data['priority'] ) : 'medium',
			'assigned_to'     => isset( $post_data['assigned_to'] ) ? absint( $post_data['assigned_to'] ) : 0,
			'categories'      => isset( $post_data['categories'] ) ? sanitize_text_field( $post_data['categories'] ) : array(),
			'due_date'        => isset( $post_data['due_date'] ) ? sanitize_text_field( $post_data['due_date'] ) : '',
			'time_estimation' => isset( $post_data['time_estimation'] ) ? sanitize_text_field( $post_data['time_estimation'] ) : '',
			'timesheet'       => isset( $post_data['timesheet'] ) ? sanitize_textarea_field( $post_data['timesheet'] ) : '',
		);

		$task_id = $this->database->save_comment( $task_data );

		if ( ! $task_id ) {
			$this->send_error( __( 'Failed to save task', 'analogwp-client-handoff' ) );
		}

		$this->send_success(
			array(
				'id'      => $task_id,
				'message' => __( 'Task created successfully', 'analogwp-client-handoff' ),
			)
		);
	}

	/**
	 * Save screenshot from data URL.
	 *
	 * @since 1.0.0
	 * @param string $data_url Data URL.
	 * @return string Screenshot URL or empty string on failure.
	 */
	private function save_screenshot_from_data_url( $data_url ) {
		if ( empty( $data_url ) || 0 !== strpos( $data_url, 'data:image' ) ) {
			return '';
		}

		try {
			// Parse the data URL.
			$data_parts = explode( ',', $data_url );
			if ( count( $data_parts ) < 2 ) {
				return '';
			}

			$encoded_data = $data_parts[1];
			$decoded_data = base64_decode( $encoded_data );

			if ( false === $decoded_data ) {
				return '';
			}

			// Create upload directory.
			$upload_dir = wp_upload_dir();
			$plugin_dir = $upload_dir['basedir'] . '/agwp-cht-screenshots/';

			if ( ! wp_mkdir_p( $plugin_dir ) ) {
				return '';
			}

			// Generate filename.
			$filename = 'screenshot_' . time() . '_' . wp_generate_password( 8, false ) . '.png';
			$filepath = $plugin_dir . $filename;

			// Save file.
			$bytes_written = file_put_contents( $filepath, $decoded_data );
			if ( false === $bytes_written ) {
				return '';
			}

			// Return public URL.
			$file_url = $upload_dir['baseurl'] . '/agwp-cht-screenshots/' . $filename;
			return $file_url;

		} catch ( Exception $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Error logging for debugging screenshot uploads.
				error_log( 'AGWP CHT Screenshot save error: ' . $e->getMessage() );
			}
			return '';
		}
	}

	/**
	 * Handle get settings AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function get_settings() {
		// Verify nonce.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Check user capabilities - users with access can view settings (not edit).
		if ( ! AGWP_CHT_Client_Handoff_Toolkit::user_has_access() ) {
			$this->send_error( __( 'Insufficient permissions.', 'analogwp-client-handoff' ) );
		}

		// Get default settings.
		$default_settings = array(
			'general' => array(
				'allowed_roles'             => array( 'administrator', 'editor' ),
				'enable_frontend_comments'  => true,
				'auto_screenshot'           => true,
				'screenshot_quality'        => 0.8,
				'comments_per_page'         => 20,
				'auto_save_drafts'          => true,
			),
			'advanced' => array(
				'enable_debug_mode'         => false,
				'log_level'                 => 'error',
			),
		);

		// Get saved settings.
		$saved_settings = get_option( 'agwp_cht_settings', array() );
		$settings       = wp_parse_args( $saved_settings, $default_settings );

		// Get categories.
		$categories = get_option( 'agwp_cht_categories', array() );

		// Get priorities with defaults.
		$default_priorities = array(
			array(
				'id'    => 1,
				'key'   => 'high',
				'name'  => 'High',
				'color' => '#ef4444',
			),
			array(
				'id'    => 2,
				'key'   => 'medium',
				'name'  => 'Medium',
				'color' => '#f59e0b',
			),
			array(
				'id'    => 3,
				'key'   => 'low',
				'name'  => 'Low',
				'color' => '#10b981',
			),
		);
		$priorities = get_option( 'agwp_cht_priorities', $default_priorities );

		$this->send_success(
			array(
				'settings'   => $settings,
				'categories' => $categories,
				'priorities' => $priorities,
			)
		);
	}

	/**
	 * Handle save settings AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function save_settings() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Check user capabilities.
		if ( ! current_user_can( 'manage_options' ) ) {
			$this->send_error( __( 'Insufficient permissions.', 'analogwp-client-handoff' ) );
		}

		// Get and sanitize form data.
		$post_data  = wp_unslash( $_POST ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified above.
		$settings   = isset( $post_data['settings'] ) ? json_decode( sanitize_textarea_field( $post_data['settings'] ), true ) : array();
		$categories = isset( $post_data['categories'] ) ? json_decode( sanitize_textarea_field( $post_data['categories'] ), true ) : array();
		$priorities = isset( $post_data['priorities'] ) ? json_decode( sanitize_textarea_field( $post_data['priorities'] ), true ) : array();

		// Validate settings structure.
		if ( ! is_array( $settings ) ) {
			$this->send_error( __( 'Invalid settings data.', 'analogwp-client-handoff' ) );
		}

		// Sanitize general settings.
		if ( isset( $settings['general'] ) ) {
			$settings['general']['allowed_roles']              = isset( $settings['general']['allowed_roles'] ) ? array_map( 'sanitize_text_field', (array) $settings['general']['allowed_roles'] ) : array();
			$settings['general']['enable_frontend_comments']   = isset( $settings['general']['enable_frontend_comments'] ) ? (bool) $settings['general']['enable_frontend_comments'] : true;
			$settings['general']['auto_screenshot']            = isset( $settings['general']['auto_screenshot'] ) ? (bool) $settings['general']['auto_screenshot'] : false;
			$settings['general']['screenshot_quality']         = isset( $settings['general']['screenshot_quality'] ) ? floatval( $settings['general']['screenshot_quality'] ) : 0.8;
			$settings['general']['comments_per_page']          = isset( $settings['general']['comments_per_page'] ) ? intval( $settings['general']['comments_per_page'] ) : 20;
			$settings['general']['auto_save_drafts']           = isset( $settings['general']['auto_save_drafts'] ) ? (bool) $settings['general']['auto_save_drafts'] : true;
		}

		// Sanitize advanced settings.
		if ( isset( $settings['advanced'] ) ) {
			$settings['advanced']['enable_debug_mode'] = isset( $settings['advanced']['enable_debug_mode'] ) ? (bool) $settings['advanced']['enable_debug_mode'] : false;
			$settings['advanced']['log_level']         = isset( $settings['advanced']['log_level'] ) ? sanitize_text_field( $settings['advanced']['log_level'] ) : 'error';
		}

		// Sanitize categories.
		if ( is_array( $categories ) ) {
			foreach ( $categories as $key => $category ) {
				if ( isset( $category['name'] ) ) {
					$categories[ $key ]['name'] = sanitize_text_field( $category['name'] );
				}
				if ( isset( $category['id'] ) ) {
					$categories[ $key ]['id'] = intval( $category['id'] );
				}
			}
		}

		// Sanitize priorities.
		if ( is_array( $priorities ) ) {
			foreach ( $priorities as $key => $priority ) {
				if ( isset( $priority['name'] ) ) {
					$priorities[ $key ]['name'] = sanitize_text_field( $priority['name'] );
				}
				if ( isset( $priority['key'] ) ) {
					$priorities[ $key ]['key'] = sanitize_key( $priority['key'] );
				}
				if ( isset( $priority['color'] ) ) {
					$priorities[ $key ]['color'] = sanitize_hex_color( $priority['color'] );
				}
				if ( isset( $priority['id'] ) ) {
					$priorities[ $key ]['id'] = intval( $priority['id'] );
				}
			}
		}

		// Save settings, categories, and priorities.
		$settings_saved   = update_option( 'agwp_cht_settings', $settings );
		$categories_saved = update_option( 'agwp_cht_categories', $categories );
		$priorities_saved = update_option( 'agwp_cht_priorities', $priorities );

		if ( $settings_saved || $categories_saved || $priorities_saved ) {
			$this->send_success(
				array(
					'message' => __( 'Settings saved successfully.', 'analogwp-client-handoff' ),
				)
			);
		} else {
			$this->send_error( __( 'Failed to save settings. Please try again.', 'analogwp-client-handoff' ) );
		}
	}
}
