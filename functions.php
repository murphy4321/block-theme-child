<?php
/**
 * Enqueue the built navbar script for the child theme block-theme-child-1
 */
function block_theme_child_1_enqueue_navbar() {
    wp_enqueue_script(
        'block-theme-child-1-navbar',
        get_stylesheet_directory_uri() . '/dist/assets/main.js',
        array(),
        null,
        true
    );
    // Optional: enqueue CSS built by Vite (if you choose to bundle CSS)
    wp_enqueue_style(
        'block-theme-child-1-navbar-css',
        get_stylesheet_directory_uri() . '/dist/assets/navbar.css',
        array(),
        null
    );
}
add_action('wp_enqueue_scripts', 'block_theme_child_1_enqueue_navbar');