<?php
/**
 * Versioned database migrations.
 *
 * @package AnalogWP\SiteNotes
 * @since 1.5.0
 */

namespace AnalogWP\SiteNotes\Core\Data;

use AnalogWP\SiteNotes\Utils\Has_Instance;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Runs ordered, version-keyed schema migrations for plugin upgrades.
 *
 * @since 1.5.0
 */
class Migrations {
	use Has_Instance;

	/**
	 * Option that stores the last successfully applied migration version.
	 *
	 * @since 1.5.0
	 * @var string
	 */
	const OPTION_KEY = 'agwp_sn_db_version';

	/**
	 * Get migrations keyed by the plugin version they ship with.
	 *
	 * Each callback must be idempotent and return true on success, false on failure.
	 * Versions are applied in ascending order via version_compare().
	 *
	 * @since 1.5.0
	 * @return array<string, array<int, callable>>
	 */
	private function get_migrations() {
		return array(
			/*
			 * 1.5.0 introduces the migrations runner.
			 * Legacy column ensures (timesheet, comment_title) are included here
			 * because their original shipping version is unknown; each step is
			 * idempotent and safe on any upgrade path into 1.5.0+.
			 */
			'1.5.0' => array(
				array( $this, 'ensure_timesheet_column' ),
				array( $this, 'ensure_comment_title_column' ),
				array( $this, 'ensure_assigned_users_column' ),
			),
		);
	}

	/**
	 * Run any migrations pending for the current plugin version.
	 *
	 * Safe on every request — no-ops when already up to date.
	 * Does not advance the stored version when a migration step fails.
	 *
	 * @since 1.5.0
	 * @return bool True when the database version matches the plugin version.
	 */
	public function maybe_run() {
		$target    = AGWP_SN_VERSION;
		$installed = $this->get_installed_version();

		if ( version_compare( $installed, $target, '>=' ) ) {
			$this->cleanup_legacy_options();
			return true;
		}

		foreach ( $this->get_migrations() as $version => $steps ) {
			if ( version_compare( $installed, $version, '>=' ) ) {
				continue;
			}

			if ( version_compare( $version, $target, '>' ) ) {
				continue;
			}

			foreach ( $steps as $step ) {
				if ( ! is_callable( $step ) ) {
					return false;
				}

				$result = call_user_func( $step );

				if ( true !== $result ) {
					return false;
				}
			}

			update_option( self::OPTION_KEY, $version );
			$installed = $version;
		}

		// Mark current even when this release has no new migrations.
		if ( version_compare( $installed, $target, '<' ) ) {
			update_option( self::OPTION_KEY, $target );
			$installed = $target;
		}

		$this->cleanup_legacy_options();

		return version_compare( $installed, $target, '>=' );
	}

	/**
	 * Resolve the last applied migration version.
	 *
	 * @since 1.5.0
	 * @return string Installed DB version string.
	 */
	private function get_installed_version() {
		$installed = get_option( self::OPTION_KEY, '' );

		if ( is_string( $installed ) && '' !== $installed ) {
			return $installed;
		}

		// Activation-only option used before the migrations runner existed.
		$plugin_version = get_option( 'agwp_sn_version', '' );

		if ( is_string( $plugin_version ) && '' !== $plugin_version ) {
			return $plugin_version;
		}

		return '0.0.0';
	}

	/**
	 * Remove options superseded by the migrations runner.
	 *
	 * @since 1.5.0
	 */
	private function cleanup_legacy_options() {
		delete_option( 'agwp_sn_schema_version' );
	}

	/**
	 * Ensure the timesheet column exists.
	 *
	 * @since 1.5.0
	 * @return bool
	 */
	private function ensure_timesheet_column() {
		return $this->add_comments_column_if_missing( 'timesheet' );
	}

	/**
	 * Ensure the comment_title column exists.
	 *
	 * @since 1.5.0
	 * @return bool
	 */
	private function ensure_comment_title_column() {
		return $this->add_comments_column_if_missing( 'comment_title' );
	}

	/**
	 * Ensure the assigned_users column exists.
	 *
	 * @since 1.5.0
	 * @return bool
	 */
	private function ensure_assigned_users_column() {
		return $this->add_comments_column_if_missing( 'assigned_users' );
	}

	/**
	 * Add a comments-table column when missing, then verify it exists.
	 *
	 * @since 1.5.0
	 * @param string $column Column name.
	 * @return bool True when the column is present after the step.
	 */
	private function add_comments_column_if_missing( $column ) {
		global $wpdb;

		$statements = array(
			'timesheet'      => 'ALTER TABLE %i ADD COLUMN timesheet longtext DEFAULT NULL AFTER time_estimation',
			'comment_title'  => "ALTER TABLE %i ADD COLUMN comment_title varchar(255) DEFAULT '' AFTER assigned_to",
			'assigned_users' => 'ALTER TABLE %i ADD COLUMN assigned_users text DEFAULT NULL AFTER assigned_to',
		);

		if ( ! isset( $statements[ $column ] ) ) {
			return false;
		}

		$table_name = Database::tables( 'comments', 'name' );

		if ( empty( $table_name ) || ! Database::table_exists( $table_name ) ) {
			return false;
		}

		if ( Database::column_exists( $table_name, $column ) ) {
			return true;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange -- Versioned schema migration; table via %i.
		$wpdb->query( $wpdb->prepare( $statements[ $column ], $table_name ) );

		return Database::column_exists( $table_name, $column );
	}
}
