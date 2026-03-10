<?php

/*
Plugin Name: UCPHub for WooCommerce
Description: UCPHub for WooCommerce is a plugin that allows you to utilize UCP to allow for customers to purchase your products using automated AI agents.
Version: 1.0.0
Author: UCPHub
Author URI: https://ucphub.ai
Text Domain: ucphub-for-woocommerce
Domain Path: /languages
Requires Plugins: woocommerce
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

if (! defined('ABSPATH')) {
    exit;
}

function ucphub_check_woocommerce_installed()
{
    // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
    if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
        add_action('admin_notices', function () {
            echo '<div class="error"><p>' . esc_html__('WooCommerce is not installed or activated. Please install and activate WooCommerce to use UCPHub.', 'ucphub-for-woocommerce') . '</p></div>';
        });
        return false;
    }
    return true;
}

if (!ucphub_check_woocommerce_installed()) {
    return;
}

define('UCPHUB_VERSION', '1.0.0');
define('UCPHUB_FILE', __FILE__);
define('UCPHUB_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UCPHUB_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once UCPHUB_PLUGIN_DIR . 'inc/class-ucphub.php';

add_filter('plugin_action_links_' . plugin_basename(UCPHUB_FILE), function ($links) {
    $settings_link = '<a href="admin.php?page=woocommerce-ucphub">' . __('Settings', 'ucphub-for-woocommerce') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
});

function ucphub_activate()
{
    flush_rewrite_rules();
	update_option('ucphub_backend_url', defined('WP_ENVIRONMENT_TYPE') && WP_ENVIRONMENT_TYPE === 'local' ? 'http://localhost:3000' : 'https://api.ucphub.ai');
}
register_activation_hook(UCPHUB_FILE, 'ucphub_activate');

function ucphub_deactivate()
{
    flush_rewrite_rules();
}
register_deactivation_hook(UCPHUB_FILE, 'ucphub_deactivate');

function ucphub_init()
{
    \UCPHub\UCPHub::get_instance();
}
add_action('plugins_loaded', 'ucphub_init');
