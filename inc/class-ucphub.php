<?php

namespace UCPHub;

if (!defined('ABSPATH')) {
    exit;
}

class UCPHub
{
    private static $instance = null;

    public static function get_instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct()
    {
        $this->includes();
        $this->init_hooks();
    }

    private function includes()
    {
        require_once UCPHUB_PLUGIN_DIR . 'inc/class-ucphub-error-helper.php';
        require_once UCPHUB_PLUGIN_DIR . 'inc/class-ucphub-ucp-api.php';
        require_once UCPHUB_PLUGIN_DIR . 'inc/class-ucphub-config.php';
        require_once UCPHUB_PLUGIN_DIR . 'inc/class-ucphub-admin-api.php';
        require_once UCPHUB_PLUGIN_DIR . 'inc/class-ucphub-admin.php';
        require_once UCPHUB_PLUGIN_DIR . 'inc/capabilities/class-ucphub-discovery-capability.php';
    }

    private function init_hooks()
    {
        new UCPHubConfig();
        new UCPHubAdmin();
        new UCPHubAdminAPI();

        add_action('template_redirect', [$this, 'handle_discovery_endpoint']);

        add_filter('woocommerce_rest_check_permissions', '__return_true');
    }

    public function handle_discovery_endpoint()
    {
        $request_uri = isset($_SERVER['REQUEST_URI']) ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'])) : '';

        if (preg_match('#^/\.well-known/ucp/?$#', $request_uri)) {
            $discovery_capability = new \UCPHub\Capabilities\UCPHubDiscoveryCapability();
            $discovery_capability->send_response();
        }
    }

    public static function uninstall()
    {
        UCPHubConfig::delete_all();
        delete_transient('ucphub_discovery_data');
    }

    public static function debug($message)
    {
        if (defined('WP_DEBUG') && defined('UCPHUB_DEBUG_MODE') && WP_DEBUG && UCPHUB_DEBUG_MODE) {
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log, WordPress.PHP.DevelopmentFunctions.error_log_print_r
            error_log('UCPHub: ' . print_r($message, true));
        }
    }
}
