<?php
/**
 * Trait instance.
 *
 * @package AnalogWP\SiteNotes;
 */

namespace AnalogWP\SiteNotes\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Trait Has_Instance
 *
 * @package AnalogWP\SiteNotes
 */
trait Has_Instance {
	/**
	 * Class instance.
	 *
	 * @var $instance
	 */
	protected static $instance;

	/**
	 * Get instance.
	 *
	 * @return mixed
	 */
	final public static function get_instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}
}
