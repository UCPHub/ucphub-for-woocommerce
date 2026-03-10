<?php

namespace UCPHub;

if (!defined('ABSPATH')) {
    exit;
}

class UCPHubUCPAPI
{
    public function get_discovery()
    {
        $api_key = UCPHubConfig::get('api_key');
        $store_id = UCPHubConfig::get('store_id');

        if (empty($api_key) || empty($store_id)) {
            return UCPHubErrorHelper::create_error(
                'not_configured',
                __('UCPHub is not connected. Please configure the plugin in WordPress admin.', 'ucphub-for-woocommerce')
            );
        }

        UCPHub::debug('Fetching discovery profile');
        UCPHub::debug('API key: ' . $api_key);
        UCPHub::debug('Store ID: ' . $store_id);

        $response = $this->make_request('/api/ucp/profile', [
            'method' => 'GET',
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return UCPHubErrorHelper::from_wp_error($response, 'discovery_failed');
        }

        if ($response['code'] === 401) {
            return UCPHubErrorHelper::create_error(
                'authentication_failed',
                __('Authentication failed. Please reconnect the plugin in WordPress admin.', 'ucphub-for-woocommerce')
            );
        }

        if ($response['code'] !== 200) {
            return UCPHubErrorHelper::from_backend_response(
                $response,
                'discovery_failed',
                __('Failed to fetch discovery', 'ucphub-for-woocommerce')
            );
        }

        $body = $response['body'];
        $decoded = json_decode($body, true);

        return $decoded !== null ? $decoded : $body;
    }

    public function make_request($endpoint, $options = [])
    {
        $backend_url = UCPHubConfig::get('backend_url', 'http://localhost:3000');
        $api_key = UCPHubConfig::get('api_key');
        $store_id = UCPHubConfig::get('store_id');

        $method = $options['method'] ?? 'GET';
        $body = $options['body'] ?? null;
        $headers = $options['headers'] ?? [];
        $timeout = $options['timeout'] ?? 30;

        if (empty($api_key)) {
            return new \WP_Error(
                'api_key_required',
                __('API key is required but not configured', 'ucphub-for-woocommerce')
            );
        }

        if (empty($store_id)) {
            return new \WP_Error(
                'store_id_required',
                __('Store ID is required but not configured', 'ucphub-for-woocommerce')
            );
        }

        if ($body && !isset($headers['Content-Type'])) {
            $headers['Content-Type'] = 'application/json';
        }

        $headers['X-UCP-Hub-API-Key'] = $api_key;
        $headers['X-UCP-Hub-Store-Id'] = $store_id;

        $request_args = [
            'headers' => $headers,
            'timeout' => $timeout,
        ];

        if ($body !== null) {
            if (is_array($body)) {
                $request_args['body'] = json_encode($body);
            } else {
                $request_args['body'] = $body;
            }
        }

        $url = rtrim($backend_url, '/') . $endpoint;

        if ($method === 'POST') {
            $response = wp_remote_post($url, $request_args);
        } elseif ($method === 'PUT') {
            $request_args['method'] = 'PUT';
            $response = wp_remote_request($url, $request_args);
        } elseif ($method === 'PATCH') {
            $request_args['method'] = 'PATCH';
            $response = wp_remote_request($url, $request_args);
        } elseif ($method === 'DELETE') {
            $request_args['method'] = 'DELETE';
            $response = wp_remote_request($url, $request_args);
        } else {
            $response = wp_remote_get($url, $request_args);
        }

        if (is_wp_error($response)) {
            return $response;
        }

        return [
            'code' => wp_remote_retrieve_response_code($response),
            'body' => wp_remote_retrieve_body($response),
            'headers' => wp_remote_retrieve_headers($response),
        ];
    }
}
