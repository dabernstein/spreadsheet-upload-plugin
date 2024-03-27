<?php
/*
Plugin Name: Spreadsheet Upload
Plugin URI: https://github.com/dabernstein/spreadsheet-upload-plugin
Description: Allows you to upload a spreadsheet into your page and set and modify the spreadsheet after upload
Version: 1.7.6
Author: Daniel Bernstein
Author URI: https://www.techdbernstein.com
*/

//Adding main component file

require_once plugin_dir_path(__FILE__). 'includes/admin-menu.php';

function enqueue_custom_spreadsheet_block_script() {
    wp_enqueue_script(
        'custom-spreadsheet-block-script',
        plugins_url('/blocks/custom-spreadsheet-upload/index.js', __FILE__),
        array('wp-blocks', 'wp-editor', 'wp-components', 'wp-element', 'wp-i18n'),
        '1.0',
        true
    );
    $custom_fields = get_option('custom_fields', array());
    wp_localize_script(
        'custom-spreadsheet-block-script',
        'customFields',
        $custom_fields
    );
    wp_enqueue_script(
        'xlsx-library',
        plugins_url('/blocks/custom-spreadsheet-upload/lib/xlsx.full.min.js', __FILE__),
        '1.0',
        true
    );
}

add_action( 'enqueue_block_editor_assets', 'enqueue_custom_spreadsheet_block_script' );

function enqueue_custom_table_sort_script() {
    wp_enqueue_script( 
        'custom-table-sort-script', 
        plugins_url('/blocks/custom-spreadsheet-upload/table-sort.js', __FILE__), 
        array('jquery'), 
        '1.0', 
        true 
    );
    $custom_fields = get_option('custom_fields', array());
    wp_localize_script(
        'custom-table-sort-script',
        'customFields',
        $custom_fields
    );
}

add_action( "wp_enqueue_scripts", "enqueue_custom_table_sort_script" );

function enqueue_custom_spreadsheet_styles() {
    wp_enqueue_style(
        'spreadsheet-frontend-styles',
        plugins_url( '/blocks/custom-spreadsheet-upload/style.css', __FILE__ ),
        array(),
        '1.0',
        'all'
    );
    wp_enqueue_style('dashicons');
}
add_action('enqueue_block_assets', 'enqueue_custom_spreadsheet_styles');
?>