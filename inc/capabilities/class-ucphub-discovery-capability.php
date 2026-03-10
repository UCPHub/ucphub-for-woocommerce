<?php

namespace UCPHub\Capabilities;

if (!defined('ABSPATH')) {
    exit;
}

class UCPHubDiscoveryCapability
{
    public function send_response()
    {
        $capabilities = $this->get_capabilities();

        status_header(200);

        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET');

        if (is_string($capabilities)) {
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            echo $capabilities;
        } else {
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            echo json_encode($capabilities, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        }

        exit;
    }

    public function get_capabilities()
    {
        $api_key = \UCPHub\UCPHubConfig::get('api_key');
        if (empty($api_key)) {
            return \UCPHub\UCPHubErrorHelper::create_error(
                'not_configured',
                __('UCPHub is not connected. Please configure the plugin in WordPress admin.', 'ucphub-for-woocommerce')
            );
        }

        $cached = get_transient('ucphub_discovery_data');

        if ($cached !== false && !\UCPHub\UCPHubErrorHelper::is_error($cached)) {
            return $cached;
        }

        $ucp_api = new \UCPHub\UCPHubUCPAPI();
        $discovery_data = $ucp_api->get_discovery();

        $cache_time = \UCPHub\UCPHubErrorHelper::is_error($discovery_data) ? 300 : 3600;
        set_transient('ucphub_discovery_data', $discovery_data, $cache_time);

        return $discovery_data;
    }
}
