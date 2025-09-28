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
		add_action( 'wp_ajax_agwp_cht_update_comment_status', array( $this, 'update_comment_status' ) );
		add_action( 'wp_ajax_agwp_cht_add_reply', array( $this, 'add_reply' ) );
		add_action( 'wp_ajax_agwp_cht_delete_comment', array( $this, 'delete_comment' ) );
		add_action( 'wp_ajax_agwp_cht_get_dashboard_stats', array( $this, 'get_dashboard_stats' ) );
		add_action( 'wp_ajax_agwp_cht_get_admin_data', array( $this, 'get_admin_data' ) );
		add_action( 'wp_ajax_agwp_cht_get_pages', array( $this, 'get_pages' ) );
		add_action( 'wp_ajax_agwp_cht_add_new_task', array( $this, 'add_new_task' ) );

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
		// Verify nonce.
		if ( ! $this->verify_nonce() ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Get POST data.
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
			'post_id'          => isset( $post_data['post_id'] ) ? intval( $post_data['post_id'] ) : 0,
			'comment_text'     => isset( $post_data['comment_text'] ) ? $post_data['comment_text'] : '',
			'element_selector' => isset( $post_data['element_selector'] ) ? $post_data['element_selector'] : '',
			'screenshot_url'   => $screenshot_url,
			'x_position'       => isset( $post_data['x_position'] ) ? intval( $post_data['x_position'] ) : 0,
			'y_position'       => isset( $post_data['y_position'] ) ? intval( $post_data['y_position'] ) : 0,
			'page_url'         => isset( $post_data['page_url'] ) ? $post_data['page_url'] : '',
			'status'           => isset( $post_data['status'] ) ? $post_data['status'] : 'open',
			'priority'         => isset( $post_data['priority'] ) ? $post_data['priority'] : 'medium',
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
		// Verify nonce.
		if ( ! $this->verify_nonce() ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

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
	 * Handle update comment status AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function update_comment_status() {
		// Verify nonce.
		if ( ! $this->verify_nonce() ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		$post_data  = wp_unslash( $_POST );
		$comment_id = isset( $post_data['comment_id'] ) ? intval( $post_data['comment_id'] ) : 0;
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
		// Verify nonce.
		if ( ! $this->verify_nonce() ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		$post_data = wp_unslash( $_POST );

		$reply_data = array(
			'comment_id' => isset( $post_data['comment_id'] ) ? intval( $post_data['comment_id'] ) : 0,
			'reply_text' => isset( $post_data['reply_text'] ) ? $post_data['reply_text'] : '',
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
		// Verify nonce.
		if ( ! $this->verify_nonce() ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Check permissions.
		if ( ! current_user_can( 'manage_options' ) ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-client-handoff' ), 403 );
		}

		$post_data  = wp_unslash( $_POST );
		$comment_id = isset( $post_data['comment_id'] ) ? intval( $post_data['comment_id'] ) : 0;

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
		// Verify nonce.
		if ( ! $this->verify_nonce() ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Check permissions.
		if ( ! current_user_can( 'manage_options' ) ) {
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
		$post_data = wp_unslash( $_POST );
		if ( ! wp_verify_nonce( $post_data['nonce'], 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Check permissions.
		if ( ! current_user_can( 'manage_options' ) ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-client-handoff' ), 403 );
		}

		// Return admin-specific data.
		$admin_data = array(
			'capabilities' => array(
				'manage_comments' => current_user_can( 'manage_options' ),
				'delete_comments' => current_user_can( 'manage_options' ),
			),
			'stats'        => $this->database->get_dashboard_stats(),
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
		$post_data = wp_unslash( $_POST );
		if ( ! wp_verify_nonce( $post_data['nonce'], 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

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

		$all_items = array_merge( $pages, $posts );
		$items     = array();

		foreach ( $all_items as $item ) {
			$items[] = array(
				'id'    => $item->ID,
				'title' => $item->post_title,
				'url'   => get_permalink( $item->ID ),
				'type'  => $item->post_type,
			);
		}

		$this->send_success( $items );
	}

	/**
	 * Handle add new task AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function add_new_task() {
		// Verify nonce via POST data.
		$post_data = wp_unslash( $_POST );
		if ( ! wp_verify_nonce( $post_data['nonce'], 'agwp_cht_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-client-handoff' ), 403 );
		}

		// Prepare task data.
		$task_data = array(
			'post_id'      => isset( $post_data['post_id'] ) ? intval( $post_data['post_id'] ) : 0,
			'comment_text' => isset( $post_data['comment_text'] ) ? $post_data['comment_text'] : '',
			'page_url'     => isset( $post_data['page_url'] ) ? $post_data['page_url'] : get_permalink( intval( $post_data['post_id'] ) ),
			'status'       => isset( $post_data['status'] ) ? $post_data['status'] : 'open',
			'priority'     => isset( $post_data['priority'] ) ? $post_data['priority'] : 'medium',
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
			error_log( 'AGWP CHT Screenshot save error: ' . $e->getMessage() );
			return '';
		}
	}
}
