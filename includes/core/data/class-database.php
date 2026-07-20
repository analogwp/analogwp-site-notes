<?php
/**
 * Database management class.
 *
 * @package AnalogWP\SiteNotes
 * @since 1.0.0
 */

namespace AnalogWP\SiteNotes\Core\Data;

use AnalogWP\SiteNotes\Utils\Has_Instance;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Database class for managing plugin tables and data.
 *
 * @since 1.0.0
 */
class Database {
	use Has_Instance;

	/**
	 * Return table name by key
	 *
	 * @param  string $table table key.
	 * @param  string $return return type: all, name, query.
	 * @return mixed
	 */
	public static function tables( $table = null, $return = 'all' ) {

		global $wpdb;

		$prefix = 'agwp_sn_';

		$tables = array(
			'comments'        => array(
				'name'        => $wpdb->prefix . $prefix . 'comments',
				'export_name' => $prefix . 'comments',
				'query'       => "
						id int(11) NOT NULL AUTO_INCREMENT,
						post_id int(11) NOT NULL,
						user_id int(11) NOT NULL DEFAULT 0,
						assigned_to int(11) DEFAULT 0,
						assigned_users text DEFAULT NULL,
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
					",
			),
			'comment_replies' => array(
				'name'        => $wpdb->prefix . $prefix . 'comment_replies',
				'export_name' => $prefix . 'comment_replies',
				'query'       => '
						id int(11) NOT NULL AUTO_INCREMENT,
						comment_id int(11) NOT NULL,
						user_id int(11) NOT NULL DEFAULT 0,
						reply_text text NOT NULL,
						created_at timestamp DEFAULT CURRENT_TIMESTAMP,
						PRIMARY KEY (id),
						KEY comment_id (comment_id),
						KEY created_at (created_at)
					',
			),
		);

		if ( ! $table && 'all' === $return ) {
			return $tables;
		}

		switch ( $return ) {
			case 'all':
				return isset( $tables[ $table ] ) ? $tables[ $table ] : false;

			case 'name':
				return isset( $tables[ $table ] ) ? $tables[ $table ]['name'] : false;

			case 'query':
				return isset( $tables[ $table ] ) ? $tables[ $table ]['query'] : false;
		}

		return false;
	}

	/**
	 * Check if given table is exists
	 *
	 * @param  string $table_name Table name.
	 * @return bool
	 */
	public static function table_exists( $table_name ) {
		global $wpdb;

		try {
			// Use prepare to safely include the table name in the query.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Table name cannot be parameterized, but is sanitized.
			$found  = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) );
			$result = ( strtolower( $table_name ) === strtolower( $found ) );
		} catch ( \Exception $e ) {
			$result = false;
		}

		return $result;
	}

	/**
	 * Check if given column exists in a table
	 *
	 * @param  string $table_name Table name.
	 * @param  string $column_name Column name.
	 * @return bool
	 */
	public static function column_exists( $table_name, $column_name ) {
		global $wpdb;

		try {
			// Use prepare to safely include the table and column names in the query.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Table and column names cannot be parameterized, but are sanitized.
			$found = $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME = %s',
					DB_NAME,
					$table_name,
					$column_name
				)
			);

			$result = ( strtolower( $column_name ) === strtolower( $found ) );
		} catch ( \Exception $e ) {
			$result = false;
		}

		return $result;
	}

	/**
	 * Check if table is exists
	 *
	 * @param  string $table Table name.
	 * @return boolean
	 */
	public function is_table_exists( $table = null ) {
		$table_name = $this->tables( $table, 'name' );

		if ( ! $table_name ) {
			return false;
		}

		return self::table_exists( $table_name );
	}

	/**
	 * Create database tables.
	 *
	 * @since 1.0.0
	 */
	public function create_tables() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		foreach ( self::tables() as $table ) {
			$table_name  = $table['name'];
			$table_query = $table['query'];

			if ( ! self::table_exists( $table_name ) ) {
				$sql = "CREATE TABLE $table_name (
						$table_query
					) $charset_collate;";

				require_once ABSPATH . 'wp-admin/includes/upgrade.php';
				dbDelta( $sql );
			}
		}

		Migrations::get_instance()->maybe_run();
	}

	/**
	 * Normalize assigned user IDs from request data.
	 *
	 * @since 1.0.0
	 * @param array $data Request data.
	 * @return array<int>
	 */
	private function normalize_assigned_user_ids( $data ) {
		$ids = array();

		if ( isset( $data['assigned_users'] ) ) {
			$assigned_users = $data['assigned_users'];

			if ( is_string( $assigned_users ) ) {
				$assigned_users = json_decode( wp_unslash( $assigned_users ), true );
			}

			if ( is_array( $assigned_users ) ) {
				foreach ( $assigned_users as $user_id ) {
					$user_id = absint( $user_id );
					if ( $user_id ) {
						$ids[] = $user_id;
					}
				}
			}
		} elseif ( isset( $data['assigned_to'] ) ) {
			$user_id = absint( $data['assigned_to'] );
			if ( $user_id ) {
				$ids[] = $user_id;
			}
		}

		return array_values( array_unique( $ids ) );
	}

	/**
	 * Encode assigned user IDs for storage.
	 *
	 * @since 1.0.0
	 * @param array<int> $user_ids User IDs.
	 * @return string|null
	 */
	private function encode_assigned_user_ids( $user_ids ) {
		if ( empty( $user_ids ) ) {
			return null;
		}

		return wp_json_encode( array_values( array_unique( array_map( 'absint', $user_ids ) ) ) );
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

		$comments_table = self::tables( 'comments', 'name' );

		// Prepare query based on whether page_url is provided.
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

		return $this->hydrate_comments( $comments );
	}

	/**
	 * Query admin notes with filters and pagination.
	 *
	 * @since 1.6.0
	 * @param array $args {
	 *     Optional. Query arguments.
	 *
	 *     @type string $status   Note status slug.
	 *     @type int    $user_id  Creator user ID.
	 *     @type string $category Category name to match in JSON.
	 *     @type string $orderby  created_at|updated_at|priority.
	 *     @type int    $limit    Max rows to return.
	 *     @type int    $offset   Offset for pagination.
	 * }
	 * @return array{comments: array, total: int}
	 */
	public function query_admin_comments( $args = array() ) {
		global $wpdb;

		$args = wp_parse_args(
			$args,
			array(
				'status'   => '',
				'user_id'  => 0,
				'category' => '',
				'orderby'  => 'created_at',
				'limit'    => 10,
				'offset'   => 0,
			)
		);

		$comments_table = self::tables( 'comments', 'name' );
		$limit          = max( 1, absint( $args['limit'] ) );
		$offset         = max( 0, absint( $args['offset'] ) );
		$user_id        = absint( $args['user_id'] );
		$status         = sanitize_key( $args['status'] );
		$category       = sanitize_text_field( $args['category'] );
		$orderby        = sanitize_key( $args['orderby'] );

		$where  = array( '1=1' );
		$values = array( $comments_table );

		if ( '' !== $status ) {
			$where[]  = 'c.status = %s';
			$values[] = $status;
		}

		if ( $user_id > 0 ) {
			$where[]  = 'c.user_id = %d';
			$values[] = $user_id;
		}

		if ( '' !== $category ) {
			$where[]  = 'c.category LIKE %s';
			$values[] = '%' . $wpdb->esc_like( $category ) . '%';
		}

		$where_sql = implode( ' AND ', $where );

		switch ( $orderby ) {
			case 'updated_at':
				$order_sql = 'c.updated_at DESC';
				break;
			case 'priority':
				$order_sql = "FIELD(c.priority, 'high', 'medium', 'low') ASC, c.created_at DESC";
				break;
			case 'created_at':
			default:
				$order_sql = 'c.created_at DESC';
				break;
		}

		$count_values = $values;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Dynamic WHERE built with placeholders.
		$total = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM %i c WHERE {$where_sql}",
				...$count_values
			)
		);

		$query_values   = $values;
		$query_values[] = $limit;
		$query_values[] = $offset;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Dynamic WHERE/ORDER built with placeholders.
		$comments = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT c.*, u.display_name as user_name, u.user_email,
				        a.display_name as assigned_name, a.user_email as assigned_email
				FROM %i c
				LEFT JOIN {$wpdb->users} u ON c.user_id = u.ID
				LEFT JOIN {$wpdb->users} a ON c.assigned_to = a.ID
				WHERE {$where_sql}
				ORDER BY {$order_sql}
				LIMIT %d OFFSET %d",
				...$query_values
			)
		);

		if ( empty( $comments ) ) {
			return array(
				'comments' => array(),
				'total'    => $total,
			);
		}

		return array(
			'comments' => $this->hydrate_comments( $comments ),
			'total'    => $total,
		);
	}

	/**
	 * Hydrate comment rows with avatars, replies, categories, and assignees.
	 *
	 * @since 1.6.0
	 * @param array $comments Comment rows.
	 * @return array
	 */
	private function hydrate_comments( $comments ) {
		global $wpdb;

		$replies_table = self::tables( 'comment_replies', 'name' );

		foreach ( $comments as $comment ) {
			$comment->display_name = ! empty( $comment->user_name ) ? $comment->user_name : __( 'Guest', 'analogwp-site-notes' );
			$comment->user_email   = ! empty( $comment->user_email ) ? $comment->user_email : '';

			if ( ! empty( $comment->user_id ) ) {
				$comment->avatar = get_avatar_url( $comment->user_id, array( 'size' => 64 ) );
			} elseif ( ! empty( $comment->user_email ) ) {
				$comment->avatar = get_avatar_url( $comment->user_email, array( 'size' => 64 ) );
			} else {
				$comment->avatar = get_avatar_url( 0, array( 'size' => 64 ) );
			}

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

			if ( is_array( $comment->replies ) ) {
				foreach ( $comment->replies as $reply ) {
					$reply->display_name = ! empty( $reply->display_name ) ? $reply->display_name : __( 'Guest', 'analogwp-site-notes' );
					$reply->user_email   = ! empty( $reply->user_email ) ? $reply->user_email : '';

					if ( ! empty( $reply->user_id ) ) {
						$reply->avatar = get_avatar_url( $reply->user_id, array( 'size' => 80 ) );
					} elseif ( ! empty( $reply->user_email ) ) {
						$reply->avatar = get_avatar_url( $reply->user_email, array( 'size' => 80 ) );
					} else {
						$reply->avatar = get_avatar_url( 0, array( 'size' => 80 ) );
					}
				}
			}

			if ( ! empty( $comment->category ) ) {
				$decoded_categories  = json_decode( $comment->category, true );
				$comment->categories = is_array( $decoded_categories ) ? $decoded_categories : array();
			} else {
				$comment->categories = array();
			}

			if ( ! empty( $comment->assigned_users ) ) {
				$decoded_assignees          = json_decode( $comment->assigned_users, true );
				$comment->assigned_user_ids = is_array( $decoded_assignees )
					? array_values( array_filter( array_map( 'absint', $decoded_assignees ) ) )
					: array();
			} elseif ( ! empty( $comment->assigned_to ) && absint( $comment->assigned_to ) > 0 ) {
				$comment->assigned_user_ids = array( absint( $comment->assigned_to ) );
			} else {
				$comment->assigned_user_ids = array();
			}
		}

		return $comments;
	}

	/**
	 * Get a single comment by ID.
	 *
	 * @since 1.0.0
	 * @param int $comment_id Comment ID.
	 * @return object|null Comment row or null.
	 */
	public function get_comment( $comment_id ) {
		global $wpdb;

		if ( empty( $comment_id ) ) {
			return null;
		}

		$table_name = self::tables( 'comments', 'name' );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Single row lookup for authorization checks.
		return $wpdb->get_row(
			$wpdb->prepare(
				'SELECT * FROM %i WHERE id = %d',
				$table_name,
				$comment_id
			)
		);
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
		// For comments we require comment_text and page_url, but for notes
		// we allow a title-only note (comment_title) with an empty comment_text.
		// So require that page_url is present and at least one of comment_text or comment_title is non-empty.
		if ( empty( $data['page_url'] ) ) {
			return false;
		}

		$has_text  = ! empty( $data['comment_text'] );
		$has_title = ! empty( $data['comment_title'] );
		if ( ! $has_text && ! $has_title ) {
			return false;
		}

		$table_name = self::tables( 'comments', 'name' );
		$assigned_user_ids = $this->normalize_assigned_user_ids( $data );

		$insert_data = array(
			'post_id'          => isset( $data['post_id'] ) ? intval( $data['post_id'] ) : 0,
			'user_id'          => get_current_user_id(),
			'assigned_to'      => ! empty( $assigned_user_ids ) ? $assigned_user_ids[0] : 0,
			'assigned_users'   => $this->encode_assigned_user_ids( $assigned_user_ids ),
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

		$table_name = self::tables( 'comments', 'name' );

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
	 * @param array $data Array of field => value pairs to update.
	 * @return bool True on success, false on error.
	 */
	public function update_comment( $comment_id, $data ) {
		global $wpdb;

		$table_name = self::tables( 'comments', 'name' );

		// Check if comment exists.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Existence check before update.
		$exists = $wpdb->get_var(
			$wpdb->prepare(
				'SELECT id FROM %i WHERE id = %d',
				$table_name,
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
			'assigned_users',
			'priority',
			'category',
			'status',
			'due_date',
			'time_estimation',
			'timesheet',
		);

		// Filter data to only include allowed fields.
		$filtered_data = array_intersect_key( $data, array_flip( $allowed_fields ) );

		// Handle assignees array - convert to JSON for storage.
		if ( isset( $data['assigned_users'] ) ) {
			$assigned_user_ids               = $this->normalize_assigned_user_ids( $data );
			$filtered_data['assigned_users'] = $this->encode_assigned_user_ids( $assigned_user_ids );
			$filtered_data['assigned_to']    = ! empty( $assigned_user_ids ) ? $assigned_user_ids[0] : 0;
		}

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
			if ( null === $value ) {
				continue; // Keep NULL values as NULL.
			}
			// Skip sanitization for JSON-encoded fields.
			if ( 'category' === $key && is_string( $value ) && strpos( $value, '[' ) === 0 ) {
				continue;
			}
			if ( 'assigned_users' === $key && is_string( $value ) && strpos( $value, '[' ) === 0 ) {
				continue;
			}
			if ( 'timesheet' === $key ) {
				continue;
			}
			if ( 'comment_text' === $key ) {
				$filtered_data[ $key ] = sanitize_textarea_field( $value );
				continue;
			}
			$filtered_data[ $key ] = sanitize_text_field( $value );
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Update operation, no caching needed.
		$result = $wpdb->update(
			$table_name,
			$filtered_data,
			array( 'id' => $comment_id ),
			null,
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

		$table_name = self::tables( 'comment_replies', 'name' );

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
	 * Delete a reply by ID.
	 *
	 * @since 1.4.0
	 * @param int $reply_id Reply ID.
	 * @return bool True on success, false on error.
	 */
	public function delete_reply( $reply_id ) {
		global $wpdb;

		if ( empty( $reply_id ) ) {
			return false;
		}

		$table_name = self::tables( 'comment_replies', 'name' );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Delete operation, no caching needed.
		$result = $wpdb->delete(
			$table_name,
			array( 'id' => intval( $reply_id ) ),
			array( '%d' )
		);

		return false !== $result && $result > 0;
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

		$comments_table = self::tables( 'comments', 'name' );
		$replies_table  = self::tables( 'comment_replies', 'name' );

		// Delete replies first.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Delete operation, no caching needed.
		$wpdb->delete( $replies_table, array( 'comment_id' => intval( $comment_id ) ), array( '%d' ) );

		// Delete comment.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Delete operation, no caching needed.
		$result = $wpdb->delete( $comments_table, array( 'id' => intval( $comment_id ) ), array( '%d' ) );

		return false !== $result;
	}

	/**
	 * Returns total rows count in requested table
	 *
	 * @param  string $table_name  Table name.
	 * @param  string $status Optional. Status to filter by.
	 * @return int
	 */
	public static function count_by_status( $table_name, $status = null ) {
		global $wpdb;

		if ( empty( $table_name ) ) {
			return 0;
		}

		if ( ! empty( $status ) ) {
			return intval(
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Table name cannot be parameterized, but is sanitized.
				$wpdb->get_var(
					$wpdb->prepare(
						'SELECT COUNT(*) FROM %i WHERE status = %s',
						$table_name,
						$status
					)
				)
			);
		}

		return intval(
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Table name cannot be parameterized, but is sanitized.
			$wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM %i',
					$table_name,
				)
			)
		);
	}

	/**
	 * Get dashboard statistics.
	 *
	 * @since 1.0.0
	 * @return array Statistics data.
	 */
	public function get_dashboard_stats() {
		global $wpdb;

		$table_name = self::tables( 'comments', 'name' );

		// Get counts by status.
		$open_count     = self::count_by_status( $table_name, 'open' );
		$resolved_count = self::count_by_status( $table_name, 'resolved' );
		$total_count    = self::count_by_status( $table_name );

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
			'recent_comments' => $recent_comments ? $recent_comments : array(),
		);
	}
}
