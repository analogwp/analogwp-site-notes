<?php
/**
 * Uninstall script for Client Handoff Toolkit.
 *
 * @package AnalogWP_Client_Handoff
 * @since 1.0.0
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Delete plugin options.
delete_option( 'agwp_cht_version' );
delete_option( 'agwp_cht_db_version' );

// Delete plugin tables.
global $wpdb;

$comments_table = $wpdb->prefix . 'agwp_cht_comments';
$replies_table  = $wpdb->prefix . 'agwp_cht_comment_replies';

$wpdb->query( "DROP TABLE IF EXISTS {$replies_table}" );
$wpdb->query( "DROP TABLE IF EXISTS {$comments_table}" );

// Delete uploaded screenshots.
$upload_dir = wp_upload_dir();
$plugin_dir = $upload_dir['basedir'] . '/agwp-cht-screenshots/';

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
