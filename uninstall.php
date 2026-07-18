<?php
/**
 * Uninstall script for AnalogWP Site Notes.
 *
 * @package AnalogWP_Site_Notes
 * @since 1.0.0
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Delete plugin options.
delete_option( 'agwp_sn_version' );
delete_option( 'agwp_sn_db_version' );
delete_option( 'agwp_sn_schema_version' );

// Delete plugin tables.
global $wpdb;

$comments_table = $wpdb->prefix . 'agwp_sn_comments';
$replies_table  = $wpdb->prefix . 'agwp_sn_comment_replies';

$wpdb->query( "DROP TABLE IF EXISTS {$replies_table}" );
$wpdb->query( "DROP TABLE IF EXISTS {$comments_table}" );

// Delete uploaded screenshots.
$upload_dir = wp_upload_dir();
$plugin_dir = $upload_dir['basedir'] . '/agwp-sn-screenshots/';

if ( is_dir( $plugin_dir ) ) {
	$files = glob( $plugin_dir . '*' );
	foreach ( $files as $file ) {
		if ( is_file( $file ) ) {
			unlink( $file );
		}
	}
	rmdir( $plugin_dir );
}

// Clear any cached data.
wp_cache_flush();
