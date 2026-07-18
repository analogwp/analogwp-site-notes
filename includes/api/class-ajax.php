<?php
/**
 * AJAX functionality class.
 *
 * @package AnalogWP\SiteNotes
 * @since 1.0.0
 */

namespace AnalogWP\SiteNotes\API;

use AnalogWP\SiteNotes\Plugin;
use AnalogWP\SiteNotes\Utils\Has_Instance;
use AnalogWP\SiteNotes\Core\Data\Database;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AJAX class for handling all plugin AJAX requests.
 *
 * @since 1.0.0
 */
class Ajax {
	use Has_Instance;

	/**
	 * Database instance.
	 *
	 * @since 1.0.0
	 * @var Database
	 */
	private $database;

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		$this->database = Plugin::instance()->database;
		$this->init_hooks();
	}

	/**
	 * Initialize AJAX hooks.
	 *
	 * @since 1.0.0
	 */
	private function init_hooks() {
		// AJAX actions for logged-in users.
		add_action( 'wp_ajax_agwp_sn_save_comment', array( $this, 'save_comment' ) );
		add_action( 'wp_ajax_agwp_sn_get_comments', array( $this, 'get_comments' ) );
		add_action( 'wp_ajax_agwp_sn_update_comment', array( $this, 'update_comment' ) );
		add_action( 'wp_ajax_agwp_sn_update_comment_status', array( $this, 'update_comment_status' ) );
		add_action( 'wp_ajax_agwp_sn_add_reply', array( $this, 'add_reply' ) );
		add_action( 'wp_ajax_agwp_sn_delete_comment', array( $this, 'delete_comment' ) );
		add_action( 'wp_ajax_agwp_sn_get_dashboard_stats', array( $this, 'get_dashboard_stats' ) );
		add_action( 'wp_ajax_agwp_sn_get_admin_data', array( $this, 'get_admin_data' ) );
		add_action( 'wp_ajax_agwp_sn_get_pages', array( $this, 'get_pages' ) );
		add_action( 'wp_ajax_agwp_sn_search_pages', array( $this, 'search_pages' ) );
		add_action( 'wp_ajax_agwp_sn_add_new_task', array( $this, 'add_new_task' ) );
		add_action( 'wp_ajax_agwp_sn_admin_add_reply', array( $this, 'admin_add_reply' ) );
		add_action( 'wp_ajax_agwp_sn_admin_delete_reply', array( $this, 'admin_delete_reply' ) );

		// Settings AJAX actions.
		add_action( 'wp_ajax_agwp_sn_get_settings', array( $this, 'get_settings' ) );
		add_action( 'wp_ajax_agwp_sn_save_settings', array( $this, 'save_settings' ) );

		// AJAX actions for non-logged-in users.
		add_action( 'wp_ajax_nopriv_agwp_sn_save_comment', array( $this, 'save_comment' ) );
		add_action( 'wp_ajax_nopriv_agwp_sn_get_comments', array( $this, 'get_comments' ) );
		add_action( 'wp_ajax_nopriv_agwp_sn_update_comment_status', array( $this, 'update_comment_status' ) );
		add_action( 'wp_ajax_nopriv_agwp_sn_add_reply', array( $this, 'add_reply' ) );
	}

	/**
	 * Verify AJAX nonce.
	 *
	 * @since 1.0.0
	 * @return bool True if nonce is valid.
	 */
	private function verify_nonce() {
		return check_ajax_referer( 'agwp_sn_nonce', 'nonce', false );
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
	 * Determine whether the current request is using anonymous-style frontend access.
	 *
	 * @since 1.0.0
	 * @return bool True when the visitor is not allowed to manage Site Notes.
	 */
	private function is_public_frontend_request() {
		return ! Plugin::user_has_access();
	}

	/**
	 * Normalize a page URL for signature and comparison checks.
	 *
	 * @since 1.0.0
	 * @param string $page_url Page URL.
	 * @return string Normalized URL.
	 */
	public static function normalize_page_url( $page_url ) {
		$page_url = sanitize_url( wp_unslash( $page_url ) );

		if ( empty( $page_url ) ) {
			return '';
		}

		$parts = wp_parse_url( $page_url );

		if ( empty( $parts['scheme'] ) || empty( $parts['host'] ) ) {
			return '';
		}

		$normalized = strtolower( $parts['scheme'] ) . '://' . strtolower( $parts['host'] );

		if ( ! empty( $parts['port'] ) ) {
			$normalized .= ':' . intval( $parts['port'] );
		}

		$path        = isset( $parts['path'] ) ? $parts['path'] : '/';
		$path        = '/' . ltrim( $path, '/' );
		$normalized .= '/' === $path ? '/' : untrailingslashit( $path );

		if ( ! empty( $parts['query'] ) ) {
			parse_str( $parts['query'], $query_args );
			ksort( $query_args );
			$query_string = http_build_query( $query_args, '', '&', PHP_QUERY_RFC3986 );
			if ( '' !== $query_string ) {
				$normalized .= '?' . $query_string;
			}
		}

		return $normalized;
	}

	/**
	 * Resolve a relative or absolute URL to a normalized on-site page URL.
	 *
	 * @since 1.5.0
	 * @param string $page_url Submitted page URL (absolute or site-relative).
	 * @return string Normalized on-site URL, or empty string if invalid/off-site.
	 */
	public static function resolve_admin_page_url( $page_url ) {
		$page_url = trim( wp_unslash( (string) $page_url ) );

		if ( '' === $page_url ) {
			return '';
		}

		$parts = wp_parse_url( $page_url );

		// Relative path or query-only → resolve against home URL.
		if ( empty( $parts['scheme'] ) || empty( $parts['host'] ) ) {
			if ( 0 === strpos( $page_url, '/' ) ) {
				$page_url = home_url( $page_url );
			} else {
				$page_url = home_url( '/' . ltrim( $page_url, '/' ) );
			}
		}

		$normalized = self::normalize_page_url( $page_url );

		if ( empty( $normalized ) ) {
			return '';
		}

		$site_parts = wp_parse_url( home_url( '/' ) );
		$page_parts = wp_parse_url( $normalized );

		if ( empty( $site_parts['host'] ) || empty( $page_parts['host'] ) ) {
			return '';
		}

		if ( strtolower( $site_parts['host'] ) !== strtolower( $page_parts['host'] ) ) {
			return '';
		}

		return $normalized;
	}

	/**
	 * Verify that a page-bound frontend request came from a rendered page instance.
	 *
	 * @since 1.0.0
	 * @param string $page_url   Submitted page URL.
	 * @param string $page_token Submitted page token.
	 * @return string Normalized page URL.
	 */
	private function verify_page_request( $page_url, $page_token ) {
		$normalized_page_url = self::normalize_page_url( $page_url );

		if ( empty( $normalized_page_url ) ) {
			$this->send_error( __( 'Invalid page URL.', 'analogwp-site-notes' ), 400 );
		}

		$home_parts = wp_parse_url( home_url() );
		$page_parts = wp_parse_url( $normalized_page_url );

		if ( empty( $home_parts['host'] ) || empty( $page_parts['host'] ) || strtolower( $home_parts['host'] ) !== strtolower( $page_parts['host'] ) ) {
			$this->send_error( __( 'Invalid page request.', 'analogwp-site-notes' ), 403 );
		}

		if ( empty( $page_token ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $page_token ) ), 'agwp_sn_page_' . $normalized_page_url ) ) {
			$this->send_error( __( 'Page verification failed.', 'analogwp-site-notes' ), 403 );
		}

		return $normalized_page_url;
	}

	/**
	 * Validate basic anti-bot fields for anonymous-style frontend requests.
	 *
	 * @since 1.0.0
	 * @param string $honeypot      Honeypot field value.
	 * @param int    $rendered_at   Page render timestamp.
	 * @param string $action_suffix Logical action suffix.
	 */
	private function enforce_public_submission_checks( $honeypot, $rendered_at, $action_suffix ) {
		if ( ! $this->is_public_frontend_request() ) {
			return;
		}

		if ( ! empty( $honeypot ) ) {
			$this->send_error( __( 'Spam check failed.', 'analogwp-site-notes' ), 400 );
		}

		$current_time = time();
		$rendered_at  = absint( $rendered_at );

		if ( empty( $rendered_at ) || $rendered_at > $current_time || ( $current_time - $rendered_at ) < 3 || ( $current_time - $rendered_at ) > DAY_IN_SECONDS ) {
			$this->send_error( __( 'Submission verification failed.', 'analogwp-site-notes' ), 400 );
		}

		$this->enforce_public_rate_limit( $action_suffix );
	}

	/**
	 * Enforce transient-backed rate limits for anonymous-style requests.
	 *
	 * @since 1.0.0
	 * @param string $action_suffix Logical action suffix.
	 */
	private function enforce_public_rate_limit( $action_suffix ) {
		$client_hash = md5( $this->get_client_address() );
		$transient   = 'agwp_sn_rl_' . md5( $action_suffix . '|' . $client_hash );
		$state       = get_transient( $transient );
		$now         = time();

		if ( ! is_array( $state ) || empty( $state['window_started'] ) || ( $now - absint( $state['window_started'] ) ) >= HOUR_IN_SECONDS ) {
			$state = array(
				'window_started' => $now,
				'count'          => 0,
				'last_request'   => 0,
			);
		}

		if ( ! empty( $state['last_request'] ) && ( $now - absint( $state['last_request'] ) ) < 15 ) {
			$this->send_error( __( 'Please wait before submitting again.', 'analogwp-site-notes' ), 429 );
		}

		if ( absint( $state['count'] ) >= 20 ) {
			$this->send_error( __( 'Submission limit reached. Please try again later.', 'analogwp-site-notes' ), 429 );
		}

		$state['count']        = absint( $state['count'] ) + 1;
		$state['last_request'] = $now;

		set_transient( $transient, $state, HOUR_IN_SECONDS );
	}

	/**
	 * Get a client address string for rate limiting.
	 *
	 * @since 1.0.0
	 * @return string Client address.
	 */
	private function get_client_address() {
		$remote_addr = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';

		return (string) apply_filters( 'agwp_sn_client_address', $remote_addr );
	}

	/**
	 * Enforce a max character length.
	 *
	 * @since 1.0.0
	 * @param string $value   Input value.
	 * @param int    $max     Max length.
	 * @param string $message Error message.
	 */
	private function enforce_max_length( $value, $max, $message ) {
		if ( mb_strlen( (string) $value ) > $max ) {
			$this->send_error( $message, 400 );
		}
	}

	/**
	 * Strip sensitive fields from public comment payloads.
	 *
	 * @since 1.0.0
	 * @param array $comments Comments array.
	 * @return array Sanitized comments.
	 */
	private function sanitize_public_comments_response( $comments ) {
		if ( ! is_array( $comments ) || Plugin::user_has_access() ) {
			return $comments;
		}

		foreach ( $comments as $comment ) {
			unset( $comment->user_email, $comment->assigned_email, $comment->user_id, $comment->assigned_to, $comment->assigned_name );

			if ( ! empty( $comment->replies ) && is_array( $comment->replies ) ) {
				foreach ( $comment->replies as $reply ) {
					unset( $reply->user_email, $reply->user_id );
				}
			}
		}

		return $comments;
	}

	/**
	 * Handle save comment AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function save_comment() {
		// Nonce verification is in place via wp_verify_nonce() call.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		// Check permissions for frontend comment participation.
		if ( ! Plugin::current_visitor_can_access_frontend_comments() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		$submitted_page_url   = isset( $_POST['page_url'] ) ? sanitize_text_field( wp_unslash( $_POST['page_url'] ) ) : '';
		$submitted_page_token = isset( $_POST['page_token'] ) ? sanitize_text_field( wp_unslash( $_POST['page_token'] ) ) : '';

		$page_url = $this->verify_page_request(
			$submitted_page_url,
			$submitted_page_token
		);

		$this->enforce_public_submission_checks(
			isset( $_POST['website'] ) ? sanitize_text_field( wp_unslash( $_POST['website'] ) ) : '',
			isset( $_POST['rendered_at'] ) ? absint( wp_unslash( $_POST['rendered_at'] ) ) : 0,
			'comment'
		);

		$comment_title = isset( $_POST['comment_title'] ) ? sanitize_text_field( wp_unslash( $_POST['comment_title'] ) ) : '';
		$comment_text  = isset( $_POST['comment_text'] ) ? sanitize_textarea_field( wp_unslash( $_POST['comment_text'] ) ) : '';
		$priority      = isset( $_POST['priority'] ) ? sanitize_key( wp_unslash( $_POST['priority'] ) ) : 'medium';

		$this->enforce_max_length( $comment_title, 255, __( 'Comment title is too long.', 'analogwp-site-notes' ) );
		$this->enforce_max_length( $comment_text, 5000, __( 'Comment text is too long.', 'analogwp-site-notes' ) );

		if ( ! in_array( $priority, array( 'low', 'medium', 'high' ), true ) ) {
			$priority = 'medium';
		}

		// Sanitize and handle screenshot URL if provided.
		$screenshot_url = '';
		if ( ! empty( $_POST['screenshot_url'] ) ) {
			$sanitized_screenshot_url = sanitize_text_field( wp_unslash( $_POST['screenshot_url'] ) );
			if ( 0 === strpos( $sanitized_screenshot_url, 'data:image' ) ) {
				$screenshot_url = $this->save_screenshot_from_data_url( $sanitized_screenshot_url );
			} else {
				$screenshot_url = sanitize_url( $sanitized_screenshot_url );
			}
		}

		// Prepare comment data.
		$comment_data = array(
			'post_id'          => isset( $_POST['post_id'] ) ? absint( wp_unslash( $_POST['post_id'] ) ) : 0,
			'comment_title'    => $comment_title,
			'comment_text'     => $comment_text,
			'element_selector' => isset( $_POST['element_selector'] ) ? sanitize_text_field( wp_unslash( $_POST['element_selector'] ) ) : '',
			'screenshot_url'   => $screenshot_url,
			'x_position'       => isset( $_POST['x_position'] ) ? absint( wp_unslash( $_POST['x_position'] ) ) : 0,
			'y_position'       => isset( $_POST['y_position'] ) ? absint( wp_unslash( $_POST['y_position'] ) ) : 0,
			'page_url'         => $page_url,
			'status'           => 'open',
			'priority'         => $priority,
		);

		// Save comment.
		$comment_id = $this->database->save_comment( $comment_data );

		if ( ! $comment_id ) {
			$this->send_error( __( 'Failed to save comment', 'analogwp-site-notes' ) );
		}

		$this->send_success(
			array(
				'id'      => $comment_id,
				'message' => __( 'Comment saved successfully', 'analogwp-site-notes' ),
			)
		);
	}

	/**
	 * Handle get comments AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function get_comments() {
		// Nonce verification is in place via wp_verify_nonce() call.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		// Check permissions for frontend comment participation.
		if ( ! Plugin::current_visitor_can_access_frontend_comments() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		$submitted_page_url   = isset( $_POST['page_url'] ) ? sanitize_text_field( wp_unslash( $_POST['page_url'] ) ) : '';
		$submitted_page_token = isset( $_POST['page_token'] ) ? sanitize_text_field( wp_unslash( $_POST['page_token'] ) ) : '';

		$page_url = $this->verify_page_request(
			$submitted_page_url,
			$submitted_page_token
		);

		if ( empty( $page_url ) ) {
			$this->send_error( __( 'Page URL is required', 'analogwp-site-notes' ) );
		}

		$comments = $this->database->get_comments( $page_url );
		$comments = $this->sanitize_public_comments_response( $comments );

		if ( null === $comments ) {
			$this->send_error( __( 'Failed to retrieve comments', 'analogwp-site-notes' ) );
		}

		$this->send_success( $comments );
	}

	/**
	 * Handle update comment AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function update_comment() {
		// Nonce verification is in place via wp_verify_nonce() call.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid nonce', 'analogwp-site-notes' ) ) );
			return;
		}

		// Check permissions - user must have access to site notes.
		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		$comment_id = isset( $_POST['comment_id'] ) ? absint( wp_unslash( $_POST['comment_id'] ) ) : 0;

		$updates = array();

		// Get data from the 'updates' field (JSON format - main app).
		if ( isset( $_POST['updates'] ) && '' !== wp_unslash( $_POST['updates'] ) ) {
			$updates = json_decode( wp_unslash( $_POST['updates'] ), true );
		}

		if ( empty( $comment_id ) || empty( $updates ) || ! is_array( $updates ) ) {
			wp_send_json_error( array( 'message' => __( 'Comment ID and updates are required', 'analogwp-site-notes' ) ) );
			return;
		}

		if ( isset( $updates['page_url'] ) ) {
			$resolved = self::resolve_admin_page_url( $updates['page_url'] );
			if ( empty( $resolved ) ) {
				wp_send_json_error( array( 'message' => __( 'A valid on-site page URL is required', 'analogwp-site-notes' ) ) );
				return;
			}
			$updates['page_url'] = $resolved;
		}

		if ( isset( $updates['post_id'] ) ) {
			$updates['post_id'] = absint( $updates['post_id'] );
			if ( $updates['post_id'] > 0 && ! get_post( $updates['post_id'] ) ) {
				$updates['post_id'] = 0;
			}
		}

		$result = $this->database->update_comment( $comment_id, $updates );

		if ( ! $result ) {
			wp_send_json_error( array( 'message' => __( 'Failed to update comment', 'analogwp-site-notes' ) ) );
			return;
		}

		wp_send_json_success( array( 'message' => __( 'Comment updated successfully', 'analogwp-site-notes' ) ) );
	}

	/**
	 * Handle admin add reply AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function admin_add_reply() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		$comment_id = isset( $_POST['comment_id'] ) ? absint( wp_unslash( $_POST['comment_id'] ) ) : 0;
		$reply_text = isset( $_POST['reply_text'] ) ? sanitize_textarea_field( wp_unslash( $_POST['reply_text'] ) ) : '';

		$this->enforce_max_length( $reply_text, 2000, __( 'Reply text is too long.', 'analogwp-site-notes' ) );

		if ( empty( $comment_id ) || empty( $reply_text ) ) {
			$this->send_error( __( 'Comment ID and reply text are required', 'analogwp-site-notes' ) );
		}

		$comment = $this->database->get_comment( $comment_id );
		if ( empty( $comment ) ) {
			$this->send_error( __( 'Invalid comment target.', 'analogwp-site-notes' ), 404 );
		}

		$reply_id = $this->database->add_reply(
			array(
				'comment_id' => $comment_id,
				'reply_text' => $reply_text,
			)
		);

		if ( ! $reply_id ) {
			$this->send_error( __( 'Failed to add reply', 'analogwp-site-notes' ) );
		}

		$current_user = wp_get_current_user();

		$this->send_success(
			array(
				'reply' => array(
					'id'           => (int) $reply_id,
					'comment_id'   => $comment_id,
					'user_id'      => (int) $current_user->ID,
					'display_name' => $current_user->display_name,
					'reply_text'   => $reply_text,
					'created_at'   => current_time( 'mysql' ),
					'avatar'       => get_avatar_url( $current_user->ID, array( 'size' => 80 ) ),
				),
			)
		);
	}

	/**
	 * Handle admin delete reply AJAX request.
	 *
	 * @since 1.4.0
	 */
	public function admin_delete_reply() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		$reply_id = isset( $_POST['reply_id'] ) ? absint( wp_unslash( $_POST['reply_id'] ) ) : 0;

		if ( empty( $reply_id ) ) {
			$this->send_error( __( 'Reply ID is required', 'analogwp-site-notes' ) );
		}

		$result = $this->database->delete_reply( $reply_id );

		if ( ! $result ) {
			$this->send_error( __( 'Failed to delete comment', 'analogwp-site-notes' ) );
		}

		$this->send_success(
			array(
				'reply_id' => $reply_id,
				'message'  => __( 'Comment deleted successfully', 'analogwp-site-notes' ),
			)
		);
	}

	/**
	 * Handle update comment status AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function update_comment_status() {
		// Nonce verification is in place via wp_verify_nonce() call.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		// Check permissions - user must have access to site notes.
		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		$comment_id = isset( $_POST['comment_id'] ) ? absint( wp_unslash( $_POST['comment_id'] ) ) : 0;
		$status     = isset( $_POST['status'] ) ? sanitize_text_field( wp_unslash( $_POST['status'] ) ) : '';

		if ( empty( $comment_id ) || empty( $status ) ) {
			$this->send_error( __( 'Comment ID and status are required', 'analogwp-site-notes' ) );
		}

		$result = $this->database->update_comment_status( $comment_id, $status );

		if ( ! $result ) {
			$this->send_error( __( 'Failed to update status', 'analogwp-site-notes' ) );
		}

		$this->send_success( __( 'Status updated successfully', 'analogwp-site-notes' ) );
	}

	/**
	 * Handle add reply AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function add_reply() {
		// Nonce verification is in place via wp_verify_nonce() call.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		// Check permissions for frontend comment participation.
		if ( ! Plugin::current_visitor_can_access_frontend_comments() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		$submitted_page_url   = isset( $_POST['page_url'] ) ? sanitize_text_field( wp_unslash( $_POST['page_url'] ) ) : '';
		$submitted_page_token = isset( $_POST['page_token'] ) ? sanitize_text_field( wp_unslash( $_POST['page_token'] ) ) : '';

		$page_url = $this->verify_page_request(
			$submitted_page_url,
			$submitted_page_token
		);

		$this->enforce_public_submission_checks(
			isset( $_POST['website'] ) ? sanitize_text_field( wp_unslash( $_POST['website'] ) ) : '',
			isset( $_POST['rendered_at'] ) ? absint( wp_unslash( $_POST['rendered_at'] ) ) : 0,
			'reply'
		);

		// Sanitized before use.
		$comment_id = isset( $_POST['comment_id'] ) ? absint( wp_unslash( $_POST['comment_id'] ) ) : 0;
		$reply_text = isset( $_POST['reply_text'] ) ? sanitize_textarea_field( wp_unslash( $_POST['reply_text'] ) ) : '';

		$this->enforce_max_length( $reply_text, 2000, __( 'Reply text is too long.', 'analogwp-site-notes' ) );

		$comment = $this->database->get_comment( $comment_id );
		if ( empty( $comment ) || self::normalize_page_url( $comment->page_url ) !== $page_url ) {
			$this->send_error( __( 'Invalid comment target.', 'analogwp-site-notes' ), 403 );
		}

		$reply_data = array(
			'comment_id' => $comment_id,
			'reply_text' => $reply_text,
		);

		if ( empty( $reply_data['comment_id'] ) || empty( $reply_data['reply_text'] ) ) {
			$this->send_error( __( 'Comment ID and reply text are required', 'analogwp-site-notes' ) );
		}

		$reply_id = $this->database->add_reply( $reply_data );

		if ( ! $reply_id ) {
			$this->send_error( __( 'Failed to add reply', 'analogwp-site-notes' ) );
		}

		$this->send_success(
			array(
				'id'      => $reply_id,
				'message' => __( 'Reply added successfully', 'analogwp-site-notes' ),
			)
		);
	}

	/**
	 * Handle delete comment AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function delete_comment() {
		// Nonce verification is in place via wp_verify_nonce() call.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		// Check permissions - user must have access to site notes.
		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		// Sanitized before use.
		$comment_id = isset( $_POST['comment_id'] ) ? absint( wp_unslash( $_POST['comment_id'] ) ) : 0;

		if ( empty( $comment_id ) ) {
			$this->send_error( __( 'Comment ID is required', 'analogwp-site-notes' ) );
		}

		$result = $this->database->delete_comment( $comment_id );

		if ( ! $result ) {
			$this->send_error( __( 'Failed to delete comment', 'analogwp-site-notes' ) );
		}

		$this->send_success( __( 'Comment deleted successfully', 'analogwp-site-notes' ) );
	}

	/**
	 * Handle get dashboard stats AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function get_dashboard_stats() {
		// Nonce verification is in place via wp_verify_nonce() call.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		// Check permissions - user must have access to site notes.
		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
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
		// Nonce verification is in place via wp_verify_nonce() call.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		// Check permissions - user must have access to site notes.
		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		// Ensure database tables exist.
		$table_name = $this->database::tables( 'comments', 'name' );

		if ( ! $this->database::table_exists( $table_name ) ) {
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

			// Assigned users information.
			$comment->assignees = array();

			if ( ! empty( $comment->assigned_user_ids ) && is_array( $comment->assigned_user_ids ) ) {
				foreach ( $comment->assigned_user_ids as $assigned_user_id ) {
					$assigned_data = get_userdata( $assigned_user_id );
					if ( $assigned_data ) {
						$comment->assignees[] = array(
							'id'     => (int) $assigned_data->ID,
							'name'   => $assigned_data->display_name,
							'email'  => $assigned_data->user_email,
							'avatar' => get_avatar_url( $assigned_data->ID, array( 'size' => 40 ) ),
						);
					} else {
						$comment->assignees[] = array(
							'id'     => (int) $assigned_user_id,
							'name'   => 'Unknown User',
							'email'  => '',
							'avatar' => get_avatar_url( $assigned_user_id, array( 'size' => 40 ) ),
						);
					}
				}
			}

			$comment->assignee = ! empty( $comment->assignees ) ? $comment->assignees[0] : null;

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
		$categories           = get_categories( array( 'hide_empty' => false ) );
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
				'open_count'      => 0,
				'resolved_count'  => 0,
				'total_count'     => 0,
				'recent_comments' => array(),
			);
		}

		$admin_data = array(
			'comments'     => $comments,
			'users'        => $formatted_users,
			'categories'   => $formatted_categories,
			'capabilities' => array(
				'manage_comments' => Plugin::user_has_access(),
				'delete_comments' => Plugin::user_has_access(),
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
	/**
	 * Build a page-target list item.
	 *
	 * @since 1.5.0
	 * @param string $id    Stable item ID.
	 * @param string $title Display title.
	 * @param string $url   Absolute URL.
	 * @param string $type  Item type key.
	 * @param string $group Group key: special|archive|content|taxonomy.
	 * @return array|null
	 */
	private function build_page_item( $id, $title, $url, $type, $group ) {
		if ( empty( $url ) || is_wp_error( $url ) ) {
			return null;
		}

		$normalized = self::normalize_page_url( $url );
		if ( empty( $normalized ) ) {
			$normalized = $url;
		}

		return array(
			'id'    => $id,
			'title' => $title,
			'url'   => $normalized,
			'type'  => $type,
			'group' => $group,
		);
	}

	/**
	 * Get always-available special page destinations (home, blog, archives, authors).
	 *
	 * @since 1.0.0
	 */
	public function get_pages() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		$this->send_success( array( 'pages' => $this->get_special_page_targets() ) );
	}

	/**
	 * Search posts, pages, CPTs, and taxonomy terms for the page picker.
	 *
	 * @since 1.5.0
	 */
	public function search_pages() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		$search = isset( $_POST['search'] ) ? sanitize_text_field( wp_unslash( $_POST['search'] ) ) : '';
		$search = trim( $search );

		if ( strlen( $search ) < 2 ) {
			$this->send_success( array( 'pages' => array() ) );
		}

		$this->send_success( array( 'pages' => $this->search_page_targets( $search ) ) );
	}

	/**
	 * Always-available destinations for the page picker.
	 *
	 * @since 1.5.0
	 * @return array
	 */
	private function get_special_page_targets() {
		$items = array();

		$show_on_front  = get_option( 'show_on_front' );
		$page_on_front  = (int) get_option( 'page_on_front' );
		$page_for_posts = (int) get_option( 'page_for_posts' );

		if ( 'page' === $show_on_front && $page_on_front > 0 ) {
			$front_url = get_permalink( $page_on_front );
			$front     = $this->build_page_item(
				'home',
				__( 'Home', 'analogwp-site-notes' ),
				$front_url,
				'special',
				'special'
			);
		} else {
			$front = $this->build_page_item(
				'home',
				__( 'Home', 'analogwp-site-notes' ),
				home_url( '/' ),
				'special',
				'special'
			);
		}

		if ( $front ) {
			$items[] = $front;
		}

		if ( 'page' === $show_on_front && $page_for_posts > 0 ) {
			$blog = $this->build_page_item(
				'blog',
				__( 'Blog', 'analogwp-site-notes' ),
				get_permalink( $page_for_posts ),
				'special',
				'special'
			);
			if ( $blog ) {
				$items[] = $blog;
			}
		}

		$post_types = get_post_types(
			array(
				'public'   => true,
				'_builtin' => false,
			),
			'objects'
		);

		foreach ( $post_types as $post_type ) {
			if ( empty( $post_type->has_archive ) ) {
				continue;
			}

			$archive = $this->build_page_item(
				$post_type->name . '-archive',
				/* translators: %s: Post type label */
				sprintf( __( '%s Archive', 'analogwp-site-notes' ), $post_type->label ),
				get_post_type_archive_link( $post_type->name ),
				'archive',
				'archive'
			);

			if ( $archive ) {
				$items[] = $archive;
			}
		}

		$authors = get_users(
			array(
				'who'     => 'authors',
				'orderby' => 'display_name',
				'number'  => 50,
			)
		);

		foreach ( $authors as $author ) {
			$author_item = $this->build_page_item(
				'author-' . $author->ID,
				/* translators: %s: Author name */
				sprintf( __( 'Author: %s', 'analogwp-site-notes' ), $author->display_name ),
				get_author_posts_url( $author->ID ),
				'archive',
				'archive'
			);

			if ( $author_item ) {
				$items[] = $author_item;
			}
		}

		return $items;
	}

	/**
	 * Search content and taxonomy targets.
	 *
	 * @since 1.5.0
	 * @param string $search Search string (min 2 chars).
	 * @return array
	 */
	private function search_page_targets( $search ) {
		$items      = array();
		$post_types = get_post_types(
			array(
				'public' => true,
			),
			'names'
		);

		$query = new \WP_Query(
			array(
				's'              => $search,
				'post_type'      => array_values( $post_types ),
				'post_status'    => 'publish',
				'posts_per_page' => 20,
				'orderby'        => 'relevance',
				'no_found_rows'  => true,
			)
		);

		foreach ( $query->posts as $post ) {
			$post_type_obj = get_post_type_object( $post->post_type );
			$type_label    = $post_type_obj ? $post_type_obj->labels->singular_name : $post->post_type;
			$title         = sprintf(
				/* translators: 1: Post type label, 2: Post title */
				__( '%1$s · %2$s', 'analogwp-site-notes' ),
				$type_label,
				get_the_title( $post )
			);

			$item = $this->build_page_item(
				(string) $post->ID,
				$title,
				get_permalink( $post->ID ),
				$post->post_type,
				'content'
			);

			if ( $item ) {
				$items[] = $item;
			}
		}

		$taxonomies = get_taxonomies(
			array(
				'public' => true,
			),
			'objects'
		);

		$term_count = 0;
		foreach ( $taxonomies as $taxonomy ) {
			if ( $term_count >= 10 ) {
				break;
			}

			$terms = get_terms(
				array(
					'taxonomy'   => $taxonomy->name,
					'hide_empty' => false,
					'number'     => 10 - $term_count,
					'search'     => $search,
				)
			);

			if ( is_wp_error( $terms ) || empty( $terms ) ) {
				continue;
			}

			foreach ( $terms as $term ) {
				$term_link = get_term_link( $term );
				$title     = sprintf(
					/* translators: 1: Taxonomy name, 2: Term name */
					__( '%1$s · %2$s', 'analogwp-site-notes' ),
					$taxonomy->label,
					$term->name
				);

				$item = $this->build_page_item(
					'term-' . $term->term_id,
					$title,
					$term_link,
					'taxonomy',
					'taxonomy'
				);

				if ( $item ) {
					$items[] = $item;
					++$term_count;
				}

				if ( $term_count >= 10 ) {
					break;
				}
			}
		}

		// Also match special destinations by title when searching.
		foreach ( $this->get_special_page_targets() as $special ) {
			if ( false !== stripos( $special['title'], $search ) ) {
				$items[] = $special;
			}
		}

		// Dedupe by id.
		$seen     = array();
		$deduped  = array();
		foreach ( $items as $item ) {
			$key = (string) $item['id'];
			if ( isset( $seen[ $key ] ) ) {
				continue;
			}
			$seen[ $key ] = true;
			$deduped[]    = $item;
		}

		return array_slice( $deduped, 0, 30 );
	}

	/**
	 * Handle add new task AJAX request.
	 *
	 * @since 1.0.0
	 */
	public function add_new_task() {
		// Nonce verification is in place via wp_verify_nonce() call.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		// Check permissions - user must have access to site notes.
		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		$assigned_user_ids = array();
		if ( isset( $_POST['assigned_users'] ) && '' !== wp_unslash( $_POST['assigned_users'] ) ) {
			$decoded_assigned_users = json_decode( wp_unslash( $_POST['assigned_users'] ), true );
			if ( is_array( $decoded_assigned_users ) ) {
				$assigned_user_ids = array_values( array_filter( array_map( 'absint', $decoded_assigned_users ) ) );
			}
		} elseif ( isset( $_POST['assigned_to'] ) ) {
			$assigned_to = absint( wp_unslash( $_POST['assigned_to'] ) );
			if ( $assigned_to ) {
				$assigned_user_ids = array( $assigned_to );
			}
		}

		$post_id  = isset( $_POST['post_id'] ) ? intval( wp_unslash( $_POST['post_id'] ) ) : 0;
		$page_url = '';

		if ( isset( $_POST['page_url'] ) && '' !== wp_unslash( $_POST['page_url'] ) ) {
			$page_url = self::resolve_admin_page_url( $_POST['page_url'] );
		} elseif ( $post_id > 0 ) {
			$page_url = self::normalize_page_url( get_permalink( $post_id ) );
		}

		if ( empty( $page_url ) ) {
			$this->send_error( __( 'A valid on-site page URL is required', 'analogwp-site-notes' ) );
		}

		// Only keep post_id when it is a real published post matching the URL context.
		if ( $post_id > 0 && ! get_post( $post_id ) ) {
			$post_id = 0;
		}

		// Prepare task data.
		$task_data = array(
			'post_id'         => $post_id,
			'comment_title'   => isset( $_POST['comment_title'] ) ? sanitize_text_field( wp_unslash( $_POST['comment_title'] ) ) : '',
			'comment_text'    => isset( $_POST['comment_text'] ) ? sanitize_textarea_field( wp_unslash( $_POST['comment_text'] ) ) : '',
			'page_url'        => $page_url,
			'status'          => isset( $_POST['status'] ) ? sanitize_text_field( wp_unslash( $_POST['status'] ) ) : 'open',
			'priority'        => isset( $_POST['priority'] ) ? sanitize_text_field( wp_unslash( $_POST['priority'] ) ) : 'medium',
			'assigned_users'  => $assigned_user_ids,
			'categories'      => isset( $_POST['categories'] ) ? sanitize_text_field( wp_unslash( $_POST['categories'] ) ) : array(),
			'due_date'        => isset( $_POST['due_date'] ) ? sanitize_text_field( wp_unslash( $_POST['due_date'] ) ) : '',
			'time_estimation' => isset( $_POST['time_estimation'] ) ? sanitize_text_field( wp_unslash( $_POST['time_estimation'] ) ) : '',
			'timesheet'       => isset( $_POST['timesheet'] ) ? sanitize_textarea_field( wp_unslash( $_POST['timesheet'] ) ) : '',
		);

		$task_id = $this->database->save_comment( $task_data );

		if ( ! $task_id ) {
			$this->send_error( __( 'Failed to save task', 'analogwp-site-notes' ) );
		}

		$this->send_success(
			array(
				'id'      => $task_id,
				'message' => __( 'Task created successfully', 'analogwp-site-notes' ),
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

			$header = $data_parts[0];
			if ( ! preg_match( '#^data:image/(png|jpeg|jpg|webp);base64$#i', $header ) ) {
				return '';
			}

			$encoded_data = $data_parts[1];
			$decoded_data = base64_decode( $encoded_data, true );

			if ( false === $decoded_data ) {
				return '';
			}

			if ( strlen( $decoded_data ) > 2 * MB_IN_BYTES ) {
				return '';
			}

			$image_info    = function_exists( 'getimagesizefromstring' ) ? getimagesizefromstring( $decoded_data ) : false;
			$detected_mime = is_array( $image_info ) && ! empty( $image_info['mime'] ) ? $image_info['mime'] : '';
			if ( empty( $detected_mime ) || ! in_array( $detected_mime, array( 'image/png', 'image/jpeg', 'image/webp' ), true ) ) {
				return '';
			}

			// Create upload directory.
			$upload_dir = wp_upload_dir();
			if ( ! empty( $upload_dir['error'] ) ) {
				return '';
			}

			// Generate filename.
			$extension_map = array(
				'image/png'  => 'png',
				'image/jpeg' => 'jpg',
				'image/webp' => 'webp',
			);
			$filename      = 'screenshot_' . time() . '_' . wp_generate_password( 8, false ) . '.' . $extension_map[ $detected_mime ];

			// Save file.
			$file = wp_upload_bits( $filename, null, $decoded_data );
			if ( ! empty( $file['error'] ) || empty( $file['url'] ) ) {
				return '';
			}

			// Return public URL.
			return sanitize_url( $file['url'] );

		} catch ( \Exception $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Error logging for debugging screenshot uploads.
				error_log( 'AGWP SN Screenshot save error: ' . $e->getMessage() );
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
		// Nonce verification is in place via wp_verify_nonce() call.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		// Check user capabilities - users with access can view settings (not edit).
		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Insufficient permissions.', 'analogwp-site-notes' ) );
		}

		// Get default settings.
		$default_settings = array(
			'general'  => array(
				'allowed_roles'                     => array( 'administrator', 'editor' ),
				'enable_frontend_comments'          => false,
				'allow_anonymous_frontend_comments' => false,
				'auto_screenshot'                   => true,
				'screenshot_quality'                => 0.8,
				'comments_per_page'                 => 20,
				'auto_save_drafts'                  => true,
			),
			'advanced' => array(
				'enable_debug_mode' => false,
				'log_level'         => 'error',
			),
		);

		// Get saved settings.
		$saved_settings = get_option( 'agwp_sn_settings', array() );
		$settings       = wp_parse_args( $saved_settings, $default_settings );

		// Get categories.
		$categories = get_option( 'agwp_sn_categories', array() );

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
		$priorities         = get_option( 'agwp_sn_priorities', $default_priorities );

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
		// Nonce verification is in place via wp_verify_nonce() call.
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'agwp_sn_nonce' ) ) {
			$this->send_error( __( 'Security check failed', 'analogwp-site-notes' ), 403 );
		}

		// Check permissions - user must have access to site notes.
		if ( ! Plugin::user_has_access() ) {
			$this->send_error( __( 'Unauthorized', 'analogwp-site-notes' ), 403 );
		}

		$settings   = isset( $_POST['settings'] ) ? json_decode( sanitize_textarea_field( wp_unslash( $_POST['settings'] ) ), true ) : array();
		$categories = isset( $_POST['categories'] ) ? json_decode( sanitize_textarea_field( wp_unslash( $_POST['categories'] ) ), true ) : array();
		$priorities = isset( $_POST['priorities'] ) ? json_decode( sanitize_textarea_field( wp_unslash( $_POST['priorities'] ) ), true ) : array();

		// Validate settings structure.
		if ( ! is_array( $settings ) ) {
			$this->send_error( __( 'Invalid settings data.', 'analogwp-site-notes' ) );
		}

		// Sanitize general settings.
		if ( isset( $settings['general'] ) ) {
			$settings['general']['allowed_roles']                     = isset( $settings['general']['allowed_roles'] ) ? array_map( 'sanitize_text_field', (array) $settings['general']['allowed_roles'] ) : array();
			$settings['general']['enable_frontend_comments']          = isset( $settings['general']['enable_frontend_comments'] ) ? (bool) $settings['general']['enable_frontend_comments'] : false;
			$settings['general']['allow_anonymous_frontend_comments'] = isset( $settings['general']['allow_anonymous_frontend_comments'] ) ? (bool) $settings['general']['allow_anonymous_frontend_comments'] : false;
			$settings['general']['auto_screenshot']                   = isset( $settings['general']['auto_screenshot'] ) ? (bool) $settings['general']['auto_screenshot'] : false;
			$settings['general']['screenshot_quality']                = isset( $settings['general']['screenshot_quality'] ) ? floatval( $settings['general']['screenshot_quality'] ) : 0.8;
			$settings['general']['comments_per_page']                 = isset( $settings['general']['comments_per_page'] ) ? intval( $settings['general']['comments_per_page'] ) : 20;
			$settings['general']['auto_save_drafts']                  = isset( $settings['general']['auto_save_drafts'] ) ? (bool) $settings['general']['auto_save_drafts'] : true;
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
		$settings_saved   = update_option( 'agwp_sn_settings', $settings );
		$categories_saved = update_option( 'agwp_sn_categories', $categories );
		$priorities_saved = update_option( 'agwp_sn_priorities', $priorities );

		if ( $settings_saved || $categories_saved || $priorities_saved ) {
			$this->send_success(
				array(
					'message' => __( 'Settings saved successfully.', 'analogwp-site-notes' ),
				)
			);
		} else {
			$this->send_error( __( 'Failed to save settings. Please try again.', 'analogwp-site-notes' ) );
		}
	}
}
