<?php
/**
 * Note priority helpers.
 *
 * @package AnalogWP\SiteNotes
 * @since 1.5.0
 */

namespace AnalogWP\SiteNotes\Core;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared defaults and lookups for note priorities.
 *
 * @since 1.5.0
 */
class Priorities {

	/**
	 * Default High / Medium / Low priority definitions.
	 *
	 * @since 1.5.0
	 * @return array<int, array{id: int, key: string, name: string, color: string}>
	 */
	public static function get_defaults() {
		return array(
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
	}

	/**
	 * Get saved priorities, falling back to defaults when empty.
	 *
	 * @since 1.5.0
	 * @return array<int, array{id: int, key: string, name: string, color: string}>
	 */
	public static function get() {
		$defaults   = self::get_defaults();
		$priorities = get_option( 'agwp_sn_priorities', $defaults );

		if ( ! is_array( $priorities ) || empty( $priorities ) ) {
			return $defaults;
		}

		return array_values( $priorities );
	}

	/**
	 * Get allowed priority keys from saved settings.
	 *
	 * @since 1.5.0
	 * @return string[]
	 */
	public static function get_keys() {
		$keys = array();

		foreach ( self::get() as $priority ) {
			if ( ! empty( $priority['key'] ) ) {
				$keys[] = sanitize_key( $priority['key'] );
			}
		}

		return ! empty( $keys ) ? $keys : array( 'medium' );
	}
}
