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
			assigned_to int(11) DEFAULT 0,
			comment_title varchar(255) DEFAULT '',
			comment_text text NOT NULL,
			element_selector varchar(500) DEFAULT '',
			screenshot_url varchar(500) DEFAULT '',
			x_position int(11) DEFAULT 0,
			y_position int(11) DEFAULT 0,
			page_url varchar(500) NOT NULL,
			status varchar(20) DEFAULT 'open',
			priority varchar(20) DEFAULT 'medium',
			category varchar(100) DEFAULT '',
			due_date date DEFAULT NULL,
			time_estimation varchar(20) DEFAULT '',
			timesheet longtext DEFAULT NULL,
			created_at timestamp DEFAULT CURRENT_TIMESTAMP,
			updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY post_id (post_id),
			KEY user_id (user_id),
			KEY assigned_to (assigned_to),
			KEY status (status),
			KEY priority (priority),
			KEY category (category),
			KEY due_date (due_date),
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
			KEY created_at (created_at)
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $comments_sql );
		dbDelta( $replies_sql );

		// Run database upgrades.
		$this->upgrade_database();

		// Update database version.
		update_option( 'agwp_cht_db_version', AGWP_CHT_VERSION );
	}

	/**
	 * Upgrade database schema if needed.
	 *
	 * @since 1.0.0
	 */
	public function upgrade_database() {
		global $wpdb;

		$comments_table = $wpdb->prefix . 'agwp_cht_comments';

		// Check if timesheet column exists, if not add it.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Schema check query.
		$column_exists = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME = %s',
				DB_NAME,
				$comments_table,
				'timesheet'
			)
		);

		if ( empty( $column_exists ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Required schema update.
			$wpdb->query( "ALTER TABLE {$comments_table} ADD COLUMN timesheet longtext DEFAULT NULL" );
		}

		// Check if comment_title column exists, if not add it.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Schema check query.
		$title_column_exists = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME = %s',
				DB_NAME,
				$comments_table,
				'comment_title'
			)
		);

		if ( empty( $title_column_exists ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Required schema update.
			$wpdb->query( "ALTER TABLE {$comments_table} ADD COLUMN comment_title varchar(255) DEFAULT '' AFTER assigned_to" );
		}
	}

	/**
	 * Get comments for a specific page or all comments.
	 *
	 * @since 1.0.0
	 * @param string $page_url Optional. Page URL. If empty, returns all comments.
	 * @return array|null Comments data or null on error.
	 */
	public function get_comments( $page_url = '' ) {
		global $wpdb;

		$comments_table = $wpdb->prefix . 'agwp_cht_comments';
		$replies_table  = $wpdb->prefix . 'agwp_cht_comment_replies';

		// Prepare query based on whether page_url is provided
		if ( empty( $page_url ) ) {
			// Get all comments for admin dashboard.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Complex query with joins, caching handled at application level.
			$comments = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT c.*, u.display_name as user_name, u.user_email,
					        a.display_name as assigned_name, a.user_email as assigned_email
	                FROM %i c
	                LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID
	                LEFT JOIN {$wpdb->users} a ON c.assigned_to = a.ID
	                ORDER BY c.created_at DESC",
					$comments_table
				)
			);
		} else {
			// Get comments for specific page.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Complex query with joins, caching handled at application level.
			$comments = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT c.*, u.display_name as user_name, u.user_email,
					        a.display_name as assigned_name, a.user_email as assigned_email
					FROM %i c
					LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID
					LEFT JOIN {$wpdb->users} a ON c.assigned_to = a.ID
					WHERE c.page_url = %s
					ORDER BY c.created_at DESC",
					$comments_table,
					$page_url
				)
			);
		}

		if ( empty( $comments ) ) {
			return array();
		}

		// Get replies for each comment.
		foreach ( $comments as $comment ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Replies fetched per comment, part of parent query result.
			$comment->replies = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT r.*, u.display_name, u.user_email
                    FROM %i r
                    LEFT JOIN {$wpdb->users} u ON r.user_id = u.ID
                    WHERE r.comment_id = %d
                    ORDER BY r.created_at ASC",
					$replies_table,
					$comment->id
				)
			);

			// Add avatar URLs to replies
			if ( is_array( $comment->replies ) ) {
				foreach ( $comment->replies as $reply ) {
					if ( ! empty( $reply->user_id ) ) {
						$reply->avatar = get_avatar_url( $reply->user_id, array( 'size' => 80 ) );
					} elseif ( ! empty( $reply->user_email ) ) {
						$reply->avatar = get_avatar_url( $reply->user_email, array( 'size' => 80 ) );
					} else {
						$reply->avatar = get_avatar_url( 0, array( 'size' => 80 ) );
					}
				}
			}

			// Decode categories from JSON
			if ( ! empty( $comment->category ) ) {
				$decoded_categories = json_decode( $comment->category, true );
				$comment->categories = is_array( $decoded_categories ) ? $decoded_categories : array();
			} else {
				$comment->categories = array();
			}
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
			'user_id'          => get_current_user_id(), // Always set to current user (creator).
			'assigned_to'      => isset( $data['assigned_to'] ) ? intval( $data['assigned_to'] ) : 0,
			'comment_title'    => isset( $data['comment_title'] ) ? sanitize_text_field( wp_unslash( $data['comment_title'] ) ) : '',
			'comment_text'     => sanitize_textarea_field( wp_unslash( $data['comment_text'] ) ),
			'element_selector' => isset( $data['element_selector'] ) ? sanitize_text_field( wp_unslash( $data['element_selector'] ) ) : '',
			'screenshot_url'   => isset( $data['screenshot_url'] ) ? sanitize_url( wp_unslash( $data['screenshot_url'] ) ) : '',
			'x_position'       => isset( $data['x_position'] ) ? intval( $data['x_position'] ) : 0,
			'y_position'       => isset( $data['y_position'] ) ? intval( $data['y_position'] ) : 0,
			'page_url'         => sanitize_url( wp_unslash( $data['page_url'] ) ),
			'status'           => isset( $data['status'] ) ? sanitize_text_field( wp_unslash( $data['status'] ) ) : 'open',
			'priority'         => isset( $data['priority'] ) ? sanitize_text_field( wp_unslash( $data['priority'] ) ) : 'medium',
			'category'         => isset( $data['categories'] ) && is_array( $data['categories'] ) ? wp_json_encode( array_map( 'sanitize_text_field', $data['categories'] ) ) : '',
			'due_date'         => isset( $data['due_date'] ) && ! empty( $data['due_date'] ) ? sanitize_text_field( wp_unslash( $data['due_date'] ) ) : null,
			'time_estimation'  => isset( $data['time_estimation'] ) ? sanitize_text_field( wp_unslash( $data['time_estimation'] ) ) : '',
			'timesheet'        => isset( $data['timesheet'] ) ? wp_unslash( $data['timesheet'] ) : '',
		);

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Insert operation, no caching needed.
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

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Update operation, no caching needed.
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
	 * Update comment with multiple fields.
	 *
	 * @since 1.0.0
	 * @param int   $comment_id Comment ID.
	 * @param array $updates Array of field => value pairs to update.
	 * @return bool True on success, false on error.
	 */
	public function update_comment( $comment_id, $data ) {
		global $wpdb;

		// Check if comment exists
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Existence check before update.
		$exists = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT id FROM {$wpdb->prefix}agwp_cht_comments WHERE id = %d",
				$comment_id
			)
		);

		if ( ! $exists ) {
			return false;
		}

		$allowed_fields = array(
			'comment_title',
			'comment_text',
			'post_id',
			'page_url',
			'assigned_to',
			'priority',
			'category',
			'status',
			'due_date',
			'time_estimation',
			'timesheet',
		);

		// Filter data to only include allowed fields.
		$filtered_data = array_intersect_key( $data, array_flip( $allowed_fields ) );

		// Handle categories array - convert to JSON for storage.
		if ( isset( $data['categories'] ) && is_array( $data['categories'] ) ) {
			$filtered_data['category'] = wp_json_encode( array_map( 'sanitize_text_field', $data['categories'] ) );
			unset( $filtered_data['categories'] );
		}

		// Handle NULL values for date fields.
		if ( isset( $filtered_data['due_date'] ) && empty( $filtered_data['due_date'] ) ) {
			$filtered_data['due_date'] = null;
		}

		// Sanitize data.
		foreach ( $filtered_data as $key => $value ) {
			if ( $value === null ) {
				continue; // Keep NULL values as NULL.
			}
			// Skip sanitization for category as it's already JSON-encoded.
			if ( $key === 'category' && is_string( $value ) && strpos( $value, '[' ) === 0 ) {
				continue;
			}
			$filtered_data[ $key ] = sanitize_text_field( $value );
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Update operation, no caching needed.
		$result = $wpdb->update(
			$wpdb->prefix . 'agwp_cht_comments',
			$filtered_data,
			array( 'id' => $comment_id ),
			null,
			array( '%d' )
		);

		return $result !== false;
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

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Insert operation, no caching needed.
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
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Delete operation, no caching needed.
		$wpdb->delete( $replies_table, array( 'comment_id' => intval( $comment_id ) ), array( '%d' ) );

		// Delete comment.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Delete operation, no caching needed.
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
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Dashboard stats, frequently changing data.
		$open_count     = $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE status = %s', $table_name, 'open' ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Dashboard stats, frequently changing data.
		$resolved_count = $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE status = %s', $table_name, 'resolved' ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Dashboard stats, frequently changing data.
		$total_count    = $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i', $table_name ) );

		// Get recent comments.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Dashboard recent items, frequently changing data.
		$recent_comments = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT c.*, u.display_name as user_name
                FROM %i c
                LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID
                ORDER BY c.created_at DESC
                LIMIT %d",
				$table_name,
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
