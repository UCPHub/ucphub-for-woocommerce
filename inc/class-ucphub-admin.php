<?php

namespace UCPHub;

if (!defined('ABSPATH')) {
    exit;
}

class UCPHubAdmin
{
    public function __construct()
    {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('admin_notices', [$this, 'debug_display_notice']);
        add_action('wp_ajax_ucphub_dismiss_debug_notice', [$this, 'dismiss_debug_display_notice']);
        add_filter('script_loader_tag', [$this, 'add_module_type_to_script'], 10, 3);
    }

    public function add_admin_menu()
    {
        if (class_exists('WooCommerce')) {
            add_submenu_page(
                'woocommerce',
                __('UCPHub Settings', 'ucphub-for-woocommerce'),
                __('UCPHub', 'ucphub-for-woocommerce'),
                'manage_woocommerce',
                'woocommerce-ucphub',
                [$this, 'render_admin_page']
            );
        } else {
            add_options_page(
                __('UCPHub Settings', 'ucphub-for-woocommerce'),
                __('UCPHub', 'ucphub-for-woocommerce'),
                'manage_options',
                'woocommerce-ucphub',
                [$this, 'render_admin_page']
            );
        }
    }

    public function render_admin_page()
    {
        echo '<div id="ucphub-settings-root"></div>';
    }

    public function enqueue_assets($hook)
    {


        $valid_hooks = [
            'woocommerce_page_woocommerce-ucphub',
            'settings_page_woocommerce-ucphub',
        ];

        if (!in_array($hook, $valid_hooks, true)) {
            return;
        }


        $plugin_root_path = dirname(dirname(__FILE__));
        $plugin_root_url = plugin_dir_url($plugin_root_path . '/ucphub-for-woocommerce.php');
        $admin_react_dist_url = $plugin_root_url . 'admin-react/dist/';
        $admin_react_dist_path = $plugin_root_path . '/admin-react/dist';
        $manifest_path = $admin_react_dist_path . '/.vite/manifest.json';
        if (file_exists($manifest_path)) {
            $manifest = json_decode(file_get_contents($manifest_path), true);
            if (isset($manifest['src/main.tsx'])) {
                $entry = $manifest['src/main.tsx'];
                if (isset($entry['css'])) {
                    foreach ($entry['css'] as $css_file) {
                        $css_path = $admin_react_dist_path . '/' . $css_file;
                        if (file_exists($css_path)) {
                            $css_url = $admin_react_dist_url . $css_file;
                            wp_enqueue_style(
                                'ucphub-admin-' . sanitize_file_name(basename($css_file, '.css')),
                                $css_url,
                                [],
                                filemtime($css_path)
                            );
                        }
                    }
                }

                $js_path = $admin_react_dist_path . '/' . $entry['file'];

                if (file_exists($js_path)) {
                    $js_url = $admin_react_dist_url . $entry['file'];

                    wp_enqueue_script(
                        'ucphub-admin',
                        $js_url,
                        [],
                        filemtime($js_path),
                        true
                    );

                    global $wp_version;
                    $wc_version = defined('WC_VERSION') ? WC_VERSION : 'unknown';
                    $locale = get_locale();

                    $localize_data = [
                        'baseUrl'      => $admin_react_dist_url,
                        'restUrl'      => rest_url('ucp/v1/'),
                        'restNonce'    => wp_create_nonce('wp_rest'),
                        'apiUrl'       => get_rest_url(null, 'ucp/v1/'),
                        'backendUrl'   => UCPHubConfig::get('backend_url', 'http://localhost:3000'),
                        'wpVersion'    => $wp_version,
                        'wcVersion'    => $wc_version,
                        'locale'       => $locale,
                    ];

                    wp_localize_script('ucphub-admin', 'ucpHubAdmin', $localize_data);
                }
            }
        }
    }

    public function debug_display_notice()
    {
        if (!defined('WP_DEBUG_DISPLAY') || !WP_DEBUG_DISPLAY) {
            return;
        }

        if (get_user_meta(get_current_user_id(), 'ucphub_dismiss_debug_notice', true)) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen || !in_array($screen->id, ['dashboard', 'woocommerce_page_woocommerce-ucphub'], true)) {
            return;
        }

        echo '<div class="notice notice-warning is-dismissible" id="ucphub-debug-notice"><p>';
        echo esc_html__(
            'WP_DEBUG_DISPLAY is enabled. This may cause PHP errors and notices to appear in your UCP discovery endpoint (/.well-known/ucp), which can prevent AI agents from reading your product catalog. It is recommended to set WP_DEBUG_DISPLAY to false in wp-config.php.',
            'ucphub-for-woocommerce'
        );
        echo '</p></div>';

        $plugin_root_path = dirname(dirname(__FILE__));
        $js_path = $plugin_root_path . '/assets/js/dismiss-notice.js';
        $plugin_root_url = plugin_dir_url($plugin_root_path . '/ucphub-for-woocommerce.php');

        wp_enqueue_script(
            'ucphub-dismiss-notice',
            $plugin_root_url . 'assets/js/dismiss-notice.js',
            ['jquery'],
            file_exists($js_path) ? filemtime($js_path) : UCPHUB_VERSION,
            true
        );
        wp_add_inline_script(
            'ucphub-dismiss-notice',
            'var ucphubDismissNotice = ' . wp_json_encode(['nonce' => wp_create_nonce('ucphub_dismiss_debug_notice')]) . ';',
            'before'
        );
    }

    public function dismiss_debug_display_notice()
    {
        check_ajax_referer('ucphub_dismiss_debug_notice');
        update_user_meta(get_current_user_id(), 'ucphub_dismiss_debug_notice', true);
        wp_die();
    }

    public function add_module_type_to_script($tag, $handle, $src)
    {
        if ($handle === 'ucphub-admin') {
            $tag = str_replace('<script ', '<script type="module" ', $tag);
        }
        return $tag;
    }
}
