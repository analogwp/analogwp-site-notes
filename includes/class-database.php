<?php
/**
 * Database management class.
 *
 * @package AnalogWP_Client_Handoff
 * @since 1.0.0
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Database class for managing plugin tables and data.
 *
 * @since 1.0.0
 */
class AGWP_CHT_Database {

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		// Database-related hooks can be added here if needed.
	}

	/**
	 * Create database tables.
	 *
	 * @since 1.0.0
	 */
	public function create_tables() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		// Comments table.
		$comments_table = $wpdb->prefix . 'agwp_cht_comments';
		$comments_sql   = "CREATE TABLE $comments_table (
			id int(11) NOT NULL AUTO_INCREMENT,
			post_id int(11) NOT NULL,
			user_id int(11) NOT NULL DEFAULT 0,
			comment_text text NOT NULL,
			element_selector varchar(500) DEFAULT '',
			screenshot_url varchar(500) DEFAULT '',
			x_position int(11) DEFAULT 0,
			y_position int(11) DEFAULT 0,
			page_url varchar(500) NOT NULL,
			status varchar(20) DEFAULT 'open',
			priority varchar(20) DEFAULT 'medium',
			created_at timestamp DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY post_id (post_id),
			KEY status (status),
			KEY priority (priority),
			KEY created_at (created_at)
		) $charset_collate;";

		// Replies table.
		$replies_table = $wpdb->prefix . 'agwp_cht_comment_replies';
		$replies_sql   = "CREATE TABLE $replies_table (
			id int(11) NOT NULL AUTO_INCREMENT,
			comment_id int(11) NOT NULL,
			user_id int(11) NOT NULL DEFAULT 0,
			reply_text text NOT NULL,
			created_at timestamp DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY comment_id (comment_id),
			KEY created_at (created_at),
			FOREIGN KEY (comment_id) REFERENCES $comments_table(id) ON DELETE CASCADE
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $comments_sql );
		dbDelta( $replies_sql );

		// Update database version.
		update_option( 'agwp_cht_db_version', AGWP_CHT_VERSION );
	}

	/**
	 * Get comments for a specific page.
	 *
	 * @since 1.0.0
	 * @param string $page_url Page URL.
	 * @return array|null Comments data or null on error.
	 */
	public function get_comments( $page_url ) {
		global $wpdb;

		if ( empty( $page_url ) ) {
			return null;
		}

		$comments_table = $wpdb->prefix . 'agwp_cht_comments';
		$replies_table  = $wpdb->prefix . 'agwp_cht_comment_replies';

		// Prepare and execute query.
		$comments = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT c.*, u.display_name as user_name, u.user_email
                FROM {$comments_table} c
                LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID
                WHERE c.page_url = %s
                ORDER BY c.created_at DESC",
				$page_url
			)
		);

		if ( empty( $comments ) ) {
			return array();
		}

		// Get replies for each comment.
		foreach ( $comments as $comment ) {
			$comment->replies = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT r.*, u.display_name as user_name, u.user_email
                    FROM {$replies_table} r
                    LEFT JOIN {$wpdb->users} u ON r.user_id = u.ID
                    WHERE r.comment_id = %d
                    ORDER BY r.created_at ASC",
					$comment->id
				)
			);
		}

		return $comments;
	}

	/**
	 * Save a new comment.
	 *
	 * @since 1.0.0
	 * @param array $data Comment data.
	 * @return int|false Comment ID on success, false on error.
	 */
	public function save_comment( $data ) {
		global $wpdb;

		// Validate required fields.
		$required_fields = array( 'comment_text', 'page_url' );
		foreach ( $required_fields as $field ) {
			if ( empty( $data[ $field ] ) ) {
				return false;
			}
		}

		$table_name = $wpdb->prefix . 'agwp_cht_comments';

		$insert_data = array(
			'post_id'          => isset( $data['post_id'] ) ? intval( $data['post_id'] ) : 0,
			'user_id'          => isset( $data['user_id'] ) ? intval( $data['user_id'] ) : get_current_user_id(),
			'comment_text'     => sanitize_textarea_field( wp_unslash( $data['comment_text'] ) ),
			'element_selector' => isset( $data['element_selector'] ) ? sanitize_text_field( wp_unslash( $data['element_selector'] ) ) : '',
			'screenshot_url'   => isset( $data['screenshot_url'] ) ? sanitize_url( wp_unslash( $data['screenshot_url'] ) ) : '',
			'x_position'       => isset( $data['x_position'] ) ? intval( $data['x_position'] ) : 0,
			'y_position'       => isset( $data['y_position'] ) ? intval( $data['y_position'] ) : 0,
			'page_url'         => sanitize_url( wp_unslash( $data['page_url'] ) ),
			'status'           => isset( $data['status'] ) ? sanitize_text_field( wp_unslash( $data['status'] ) ) : 'open',
			'priority'         => isset( $data['priority'] ) ? sanitize_text_field( wp_unslash( $data['priority'] ) ) : 'medium',
		);

		$result = $wpdb->insert( $table_name, $insert_data );

		if ( false === $result ) {
			return false;
		}

		return $wpdb->insert_id;
	}

	/**
	 * Update comment status.
	 *
	 * @since 1.0.0
	 * @param int    $comment_id Comment ID.
	 * @param string $status New status.
	 * @return bool True on success, false on error.
	 */
	public function update_comment_status( $comment_id, $status ) {
		global $wpdb;

		if ( empty( $comment_id ) || empty( $status ) ) {
			return false;
		}

		$table_name = $wpdb->prefix . 'agwp_cht_comments';

		$result = $wpdb->update(
			$table_name,
			array( 'status' => sanitize_text_field( $status ) ),
			array( 'id' => intval( $comment_id ) ),
			array( '%s' ),
			array( '%d' )
		);

		return false !== $result;
	}

	/**
	 * Add reply to a comment.
	 *
	 * @since 1.0.0
	 * @param array $data Reply data.
	 * @return int|false Reply ID on success, false on error.
	 */
	public function add_reply( $data ) {
		global $wpdb;

		// Validate required fields.
		if ( empty( $data['comment_id'] ) || empty( $data['reply_text'] ) ) {
			return false;
		}

		$table_name = $wpdb->prefix . 'agwp_cht_comment_replies';

		$insert_data = array(
			'comment_id' => intval( $data['comment_id'] ),
			'user_id'    => isset( $data['user_id'] ) ? intval( $data['user_id'] ) : get_current_user_id(),
			'reply_text' => sanitize_textarea_field( wp_unslash( $data['reply_text'] ) ),
		);

		$result = $wpdb->insert( $table_name, $insert_data );

		if ( false === $result ) {
			return false;
		}

		return $wpdb->insert_id;
	}

	/**
	 * Delete a comment and its replies.
	 *
	 * @since 1.0.0
	 * @param int $comment_id Comment ID.
	 * @return bool True on success, false on error.
	 */
	public function delete_comment( $comment_id ) {
		global $wpdb;

		if ( empty( $comment_id ) ) {
			return false;
		}

		$comments_table = $wpdb->prefix . 'agwp_cht_comments';
		$replies_table  = $wpdb->prefix . 'agwp_cht_comment_replies';

		// Delete replies first.
		$wpdb->delete( $replies_table, array( 'comment_id' => intval( $comment_id ) ), array( '%d' ) );

		// Delete comment.
		$result = $wpdb->delete( $comments_table, array( 'id' => intval( $comment_id ) ), array( '%d' ) );

		return false !== $result;
	}

	/**
	 * Get dashboard statistics.
	 *
	 * @since 1.0.0
	 * @return array Statistics data.
	 */
	public function get_dashboard_stats() {
		global $wpdb;

		$table_name = $wpdb->prefix . 'agwp_cht_comments';

		// Get counts by status.
		$open_count     = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$table_name} WHERE status = %s", 'open' ) );
		$resolved_count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$table_name} WHERE status = %s", 'resolved' ) );
		$total_count    = $wpdb->get_var( "SELECT COUNT(*) FROM {$table_name}" );

		// Get recent comments.
		$recent_comments = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT c.*, u.display_name as user_name
                FROM {$table_name} c
                LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID
                ORDER BY c.created_at DESC
                LIMIT %d",
				10
			)
		);

		return array(
			'open_count'      => intval( $open_count ),
			'resolved_count'  => intval( $resolved_count ),
			'total_count'     => intval( $total_count ),
			'recent_comments' => $recent_comments ?: array(),
		);
	}
}
