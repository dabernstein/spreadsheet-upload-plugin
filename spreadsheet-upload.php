<?php
/*
Plugin Name: Spreadsheet Upload
Description: Allows you to upload a spreadsheet into a component on your page and set definitions for the headers.
Version: 1.5
Author: Daniel Bernstein
*/

//Adding main component file

function enqueue_custom_spreadsheet_block_script() {
    wp_enqueue_script(
        'custom-spreadsheet-block-script',
        plugins_url('/blocks/custom-spreadsheet-upload/index.js', __FILE__),
        array('wp-blocks', 'wp-editor', 'wp-components', 'wp-element', 'wp-i18n'),
        '1.0',
        true
    );
    wp_enqueue_script(
        'xlsx-library',
        plugins_url('/blocks/custom-spreadsheet-upload/lib/xlsx.full.min.js', __FILE__),
        1.0,
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
}
add_action('enqueue_block_assets', 'enqueue_custom_spreadsheet_styles');
?>