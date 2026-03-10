<?php

namespace UCPHub;

if (!defined('ABSPATH')) {
    exit;
}

class UCPHubAdminAPI
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register all admin REST API routes
     */
    public function register_routes()
    {
        // Connect endpoint - handles store connection/disconnection
        register_rest_route(
            'ucp/v1',
            '/connect',
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'connect'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Get settings endpoint
        register_rest_route(
            'ucp/v1',
            '/settings',
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_settings'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Test connection to SaaS backend
        register_rest_route(
            'ucp/v1',
            '/test-connection',
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'test_connection'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Get WooCommerce payment gateways endpoint
        register_rest_route(
            'ucp/v1',
            '/payment-gateways',
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_payment_gateways'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Save and validate credentials (API Key + Store ID)
        register_rest_route(
            'ucp/v1',
            '/save-credentials',
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'save_credentials'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Complete store setup (create store with config OR just get/create API key)
        register_rest_route(
            'ucp/v1',
            '/complete-setup',
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'complete_setup'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Finalize connection after WooCommerce OAuth authorization
        register_rest_route(
            'ucp/v1',
            '/finalize-connection',
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'finalize_connection'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Get current store data
        register_rest_route(
            'ucp/v1',
            '/store',
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_store'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Update store configuration
        register_rest_route(
            'ucp/v1',
            '/store',
            [
                'methods'             => 'PATCH',
                'callback'            => [$this, 'update_store'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Get store capabilities
        register_rest_route(
            'ucp/v1',
            '/store/capabilities',
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_store_capabilities'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Get store UCP profile
        register_rest_route(
            'ucp/v1',
            '/store/profile',
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_store_profile'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Update store integration settings (capabilities, payment handlers)
        register_rest_route(
            'ucp/v1',
            '/store-integration',
            [
                'methods'             => 'PATCH',
                'callback'            => [$this, 'update_store_integration'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Get organization data
        register_rest_route(
            'ucp/v1',
            '/organization',
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_organization'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );

        // Get WP/WC policy page URLs
        register_rest_route(
            'ucp/v1',
            '/policy-pages',
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_policy_pages'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        );
    }

    /**
     * Check permission for REST API requests
     *
     * @param \WP_REST_Request $request Request object (optional)
     * @return bool|\WP_Error
     */
    public function check_permission($request = null)
    {
        if (!current_user_can('manage_woocommerce')) {
            return false;
        }

        $nonce = isset($_SERVER['HTTP_X_WP_NONCE'])
            ? sanitize_text_field(wp_unslash($_SERVER['HTTP_X_WP_NONCE']))
            : (isset($_REQUEST['_wpnonce']) ? sanitize_text_field(wp_unslash($_REQUEST['_wpnonce'])) : '');

        if (!wp_verify_nonce($nonce, 'wp_rest')) {
            return false;
        }

        return true;
    }

    /**
     * REST API callback: Connect/disconnect store
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function connect($request)
    {
        $action = $request->get_param('action');
        $api_key = $request->get_param('api_key');
        $store_id = $request->get_param('store_id');

        if ($action === 'connect') {
            if (empty($api_key) || empty($store_id)) {
                return new \WP_Error(
                    'missing_fields',
                    __('API key and Store ID are required', 'ucphub-for-woocommerce'),
                    ['status' => 400]
                );
            }

            $api_key = sanitize_text_field($api_key);
            $store_id = sanitize_text_field($store_id);

            UCPHubConfig::update('api_key', $api_key);
            UCPHubConfig::update('store_id', $store_id);
            UCPHubConfig::update('connection_status', 'connected');

    

            return new \WP_REST_Response(
                [
                    'success'            => true,
                    'message'            => __('Store connected successfully', 'ucphub-for-woocommerce'),
                    'connection_status'   => 'connected',
                    'store_id'            => $store_id,
                ],
                200
            );
        } elseif ($action === 'disconnect') {
            $api_key = UCPHubConfig::get('api_key');
            $store_id = UCPHubConfig::get('store_id');

            if (!empty($api_key) && !empty($store_id)) {
                $ucp_api = new UCPHubUCPAPI();
                $response = $ucp_api->make_request('/api/store-integrations/disconnect', [
                    'method'  => 'POST',
                    'timeout' => 10,
                ]);

                if (is_wp_error($response)) {
                    return new \WP_Error(
                        'disconnect_failed',
                        /* translators: %s: error message */
                        sprintf(__('Failed to disconnect from backend: %s', 'ucphub-for-woocommerce'), $response->get_error_message()),
                        ['status' => 500]
                    );
                }

                if ($response['code'] !== 200) {
                    $error_body = json_decode($response['body'], true);
                    return new \WP_Error(
                        'disconnect_failed',
                        /* translators: %d: HTTP status code */
                        $error_body['message'] ?? sprintf(__('Failed to disconnect from backend (HTTP %d)', 'ucphub-for-woocommerce'), $response['code']),
                        ['status' => $response['code']]
                    );
                }
            }

            UCPHubConfig::delete_all();

            return new \WP_REST_Response(
                [
                    'success'            => true,
                    'message'            => __('Store disconnected successfully', 'ucphub-for-woocommerce'),
                    'connection_status'   => 'disconnected',
                ],
                200
            );
        }

        return new \WP_Error(
            'invalid_action',
            __('Invalid action. Use "connect" or "disconnect"', 'ucphub-for-woocommerce'),
            ['status' => 400]
        );
    }

    /**
     * REST API callback: Get current settings
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response
     */
    public function get_settings($request)
    {
        return new \WP_REST_Response(
            [
                'api_key'            => UCPHubConfig::get('api_key', ''),
                'store_id'           => UCPHubConfig::get('store_id', ''),
                'connection_status'  => UCPHubConfig::get('connection_status', 'disconnected'),
            ],
            200
        );
    }

    /**
     * REST API callback: Test connection to SaaS backend
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function test_connection($request)
    {
        $store_id = UCPHubConfig::get('store_id');

        if (empty($store_id)) {
            return new \WP_Error(
                'not_connected',
                __('Store is not connected to SaaS backend', 'ucphub-for-woocommerce'),
                ['status' => 400]
            );
        }

        $ucp_api = new UCPHubUCPAPI();

        $response = $ucp_api->make_request('/api/store-integrations/store-info', [
            'method' => 'GET',
            'timeout' => 10,
        ]);

        if (is_wp_error($response)) {
            return new \WP_Error(
                'connection_failed',
                /* translators: %s: error message */
                sprintf(__('Failed to connect: %s', 'ucphub-for-woocommerce'), $response->get_error_message()),
                ['status' => 500]
            );
        }

        if ($response['code'] === 200 || $response['code'] === 201) {
            return new \WP_REST_Response(
                [
                    'success' => true,
                    'message' => __('Connection successful', 'ucphub-for-woocommerce'),
                ],
                200
            );
        }

        return new \WP_Error(
            'connection_failed',
            /* translators: %d: HTTP status code */
            sprintf(__('Connection failed with status code: %d', 'ucphub-for-woocommerce'), $response['code']),
            ['status' => $response['code']]
        );
    }

    /**
     * REST API callback: Save and validate API credentials
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function save_credentials($request)
    {
        $api_key = $request->get_param('api_key');
        $store_id = $request->get_param('store_id');

        if (empty($api_key) || empty($store_id)) {
            return new \WP_Error(
                'invalid_credentials',
                __('API Key and Store ID are required', 'ucphub-for-woocommerce'),
                ['status' => 400]
            );
        }
        
        $backend_url = UCPHubConfig::get('backend_url', 'http://localhost:3000');
        $response = wp_remote_get(
            rtrim($backend_url, '/') . '/api/store-integrations/store-info',
            [
                'headers' => [
                    'X-UCP-Hub-API-Key' => $api_key,
                    'X-UCP-Hub-Store-Id' => $store_id,
                ],
                'timeout' => 15,
            ]
        );

        if (is_wp_error($response)) {
            return new \WP_Error(
                'validation_failed',
                /* translators: %s: error message */
                sprintf(__('Could not validate credentials: %s', 'ucphub-for-woocommerce'), $response->get_error_message()),
                ['status' => 500]
            );
        }

        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 200) {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            return new \WP_Error(
                'invalid_credentials',
                $body['message'] ?? __('Invalid API Key or Store ID', 'ucphub-for-woocommerce'),
                ['status' => 401]
            );
        }

        // Credentials are valid - save them
        UCPHubConfig::update('api_key', $api_key);
        UCPHubConfig::update('store_id', $store_id);

        // Parse store info from response
        $store_info = json_decode(wp_remote_retrieve_body($response), true);

        return new \WP_REST_Response(
            [
                'success' => true,
                'store_id' => $store_id,
                'integration_id' => $store_info['integration']['id'] ?? null,
                'status' => $store_info['integration']['status'] ?? null,
                'store' => $store_info['store'] ?? null,
                'organization' => $store_info['organization'] ?? null,
            ],
            200
        );
    }


    /**
     * REST API callback: Complete store setup
     *
     * In the new flow, store and integration are already created in the web dashboard.
     * This endpoint just updates the integration settings (capabilities, payment handlers)
     * and marks it as connected.
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function complete_setup($request)
    {
        $ucp_capabilities = $request->get_param('ucp_capabilities');
        $ucp_payment_handlers = $request->get_param('ucp_payment_handlers');
        $ucp_links = $request->get_param('ucp_links');

        $raw_body = $request->get_body();
        $json_body = json_decode($raw_body, true);
        if (empty($ucp_capabilities) && isset($json_body['ucp_capabilities'])) {
            $ucp_capabilities = $json_body['ucp_capabilities'];
        }
        if (empty($ucp_payment_handlers) && isset($json_body['ucp_payment_handlers'])) {
            $ucp_payment_handlers = $json_body['ucp_payment_handlers'];
        }
        if (empty($ucp_links) && isset($json_body['ucp_links'])) {
            $ucp_links = $json_body['ucp_links'];
        }

        // Get saved credentials
        $store_id = UCPHubConfig::get('store_id');
        $api_key = UCPHubConfig::get('api_key');

        if (!$store_id || !$api_key) {
            return new \WP_Error(
                'not_connected',
                __('Please save your credentials first', 'ucphub-for-woocommerce'),
                ['status' => 400]
            );
        }

        // Build settings for the complete-setup request
        $settings = [];

        // Add capabilities if provided
        if (!empty($ucp_capabilities) && is_array($ucp_capabilities)) {
            $settings['capabilities'] = array_map('sanitize_text_field', $ucp_capabilities);
        }

        if (!empty($ucp_payment_handlers) && is_array($ucp_payment_handlers)) {
            $payment_handlers = $this->build_payment_handlers($ucp_payment_handlers);
            if (!empty($payment_handlers)) {
                $settings['payment'] = [
                    'handlers' => $payment_handlers,
                ];
            }
        }

        if (!empty($ucp_links) && is_array($ucp_links)) {
            $links = [];
            foreach ($ucp_links as $link) {
                if (isset($link['type']) && isset($link['url']) && !empty($link['url'])) {
                    $sanitized_link = [
                        'type' => sanitize_text_field($link['type']),
                        'url'  => esc_url_raw($link['url']),
                    ];
                    if (!empty($link['title'])) {
                        $sanitized_link['title'] = sanitize_text_field($link['title']);
                    }
                    $links[] = $sanitized_link;
                }
            }
            if (!empty($links)) {
                $settings['links'] = $links;
            }
        }

        // Call the backend complete-setup endpoint
        $ucp_api = new UCPHubUCPAPI();
        $setup_response = $ucp_api->make_request('/api/store-integrations/complete-setup', [
            'method' => 'POST',
            'body' => [
                'settings' => !empty($settings) ? $settings : null,
            ],
            'timeout' => 30,
        ]);

        if (is_wp_error($setup_response)) {
            return new \WP_Error(
                'setup_failed',
                /* translators: %s: error message */
                sprintf(__('Failed to complete setup: %s', 'ucphub-for-woocommerce'), $setup_response->get_error_message()),
                ['status' => 500]
            );
        }

        if ($setup_response['code'] !== 200) {
            $error_data = json_decode($setup_response['body'], true);
            return new \WP_Error(
                'setup_failed',
                $error_data['message'] ?? __('Failed to complete setup', 'ucphub-for-woocommerce'),
                ['status' => $setup_response['code']]
            );
        }

        $setup_data = json_decode($setup_response['body'], true);

        // Now initiate WooCommerce OAuth authorization
        $auth_response = $ucp_api->make_request('/api/store-integrations/authorize/request', [
            'method' => 'POST',
            'timeout' => 30,
        ]);

        if (!is_wp_error($auth_response) && $auth_response['code'] === 201) {
            $auth_data = json_decode($auth_response['body'], true);

            UCPHubConfig::update('pending_integration_id', $setup_data['integrationId'] ?? null);
            UCPHubConfig::update('connection_status', 'pending_authorization');

            return new \WP_REST_Response(
                [
                    'needs_authorization' => true,
                    'auth_url'            => $auth_data['authUrl'],
                    'integration_id'      => $setup_data['integrationId'] ?? null,
                    'api_key'             => $api_key,
                    'store_id'            => $store_id,
                ],
                200
            );
        }

        // OAuth initiation failed - still mark as connected since settings are saved
        UCPHubConfig::update('connection_status', 'connected');

        return new \WP_REST_Response(
            [
                'success'  => true,
                'api_key'  => $api_key,
                'store_id' => $store_id,
                'message'  => __('Setup completed. WooCommerce authorization may be required separately.', 'ucphub-for-woocommerce'),
            ],
            200
        );
    }

    /**
     * REST API callback: Finalize connection after WooCommerce OAuth authorization
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function finalize_connection($request)
    {
        // Mark connection as complete
        UCPHubConfig::update('connection_status', 'connected');
        UCPHubConfig::delete('pending_integration_id');

        return new \WP_REST_Response(
            [
                'success'  => true,
                'api_key'  => UCPHubConfig::get('api_key'),
                'store_id' => UCPHubConfig::get('store_id'),
            ],
            200
        );
    }

    /**
     * REST API callback: Get WooCommerce payment gateways
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_payment_gateways($request)
    {
        if (!class_exists('WC_Payment_Gateways')) {
            return new \WP_Error(
                'woocommerce_not_available',
                __('WooCommerce is not available', 'ucphub-for-woocommerce'),
                ['status' => 400]
            );
        }

        $gateways = WC()->payment_gateways()->get_available_payment_gateways();
        $gateways_list = [];

        foreach ($gateways as $gateway_id => $gateway) {
            $gateways_list[] = [
                'id'          => $gateway_id,
                'title'       => $gateway->get_title(),
                'description' => $gateway->get_description(),
                'enabled'     => $gateway->enabled === 'yes',
            ];
        }

        return new \WP_REST_Response(
            [
                'success'  => true,
                'gateways' => $gateways_list,
            ],
            200
        );
    }

    /**
     * Get UCP discovery profile
     *
     * Delegates to UCPHubUCPAPI for API key authenticated requests.
     *
     * @return array UCP profile data or error array with 'error' and 'message' keys
     */
    public function get_discovery()
    {
        $ucp_api = new UCPHubUCPAPI();
        return $ucp_api->get_discovery();
    }

    /**
     * REST API callback: Get current store data from backend
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_store($request)
    {
        // Use API key auth via the store-info endpoint
        $ucp_api = new UCPHubUCPAPI();

        $store_id = UCPHubConfig::get('store_id');
        if (empty($store_id)) {
            return new \WP_Error(
                'store_not_configured',
                __('Store is not connected. Please connect your store first.', 'ucphub-for-woocommerce'),
                ['status' => 404]
            );
        }

        // Fetch all store info in one API call
        $response = $ucp_api->make_request('/api/store-integrations/store-info', [
            'method' => 'GET',
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return new \WP_Error(
                'store_fetch_failed',
                /* translators: %s: error message */
                sprintf(__('Failed to fetch store: %s', 'ucphub-for-woocommerce'), $response->get_error_message()),
                ['status' => 500]
            );
        }

        if ($response['code'] !== 200) {
            $error_body = json_decode($response['body'], true);
            $error_message = isset($error_body['message']) ? $error_body['message'] : __('Unknown error', 'ucphub-for-woocommerce');
            return new \WP_Error(
                'store_fetch_failed',
                /* translators: %1$d: HTTP status code, %2$s: error message */
                sprintf(__('Failed to fetch store: HTTP %1$d - %2$s', 'ucphub-for-woocommerce'), $response['code'], $error_message),
                ['status' => $response['code']]
            );
        }

        $data = json_decode($response['body'], true);
        $store_data = $data['store'] ?? [];

        // Add integration settings
        if (isset($data['integration']['settings']) && is_array($data['integration']['settings'])) {
            $settings = $data['integration']['settings'];

            // Add capabilities
            if (isset($settings['capabilities'])) {
                $store_data['ucpCapabilities'] = $settings['capabilities'];
            }

            // Add payment handlers
            if (isset($settings['payment']['handlers'])) {
                $store_data['ucpPaymentHandlers'] = $settings['payment']['handlers'];
            }

            // Add links
            if (isset($settings['links'])) {
                $store_data['ucpLinks'] = $settings['links'];
            }
        }

        // Add organization data
        if (isset($data['organization'])) {
            $store_data['organization'] = $data['organization'];
        }

        // Add integration status
        if (isset($data['integration']['status'])) {
            $store_data['integrationStatus'] = $data['integration']['status'];
        }

        return new \WP_REST_Response($store_data, 200);
    }

    /**
     * REST API callback: Update store configuration
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_store($request)
    {
        // Use API key auth for all requests
        $ucp_api = new UCPHubUCPAPI();

        $store_id = UCPHubConfig::get('store_id');
        if (empty($store_id)) {
            return new \WP_Error(
                'store_not_configured',
                __('Store is not connected. Please connect your store first.', 'ucphub-for-woocommerce'),
                ['status' => 404]
            );
        }

        $body = $request->get_json_params();
        if (empty($body)) {
            // Try to get body from raw request if JSON params are empty
            $raw_body = $request->get_body();
            if (!empty($raw_body)) {
                $body = json_decode($raw_body, true);
            }
        }

        if (empty($body)) {
            return new \WP_Error(
                'invalid_request',
                __('Request body is empty or invalid.', 'ucphub-for-woocommerce'),
                ['status' => 400]
            );
        }

        $update_data = [];

        // Map request body to backend format
        // Backend UpdateStoreDto only accepts: name and status
        if (isset($body['name'])) {
            $update_data['name'] = sanitize_text_field($body['name']);
        }
        if (isset($body['status']) && in_array($body['status'], ['active', 'inactive', 'archived'])) {
            $update_data['status'] = sanitize_text_field($body['status']);
        }

        if (empty($update_data)) {
            return new \WP_Error(
                'invalid_request',
                __('No valid update data provided.', 'ucphub-for-woocommerce'),
                ['status' => 400]
            );
        }

        $response = $ucp_api->make_request('/api/stores/' . $store_id, [
            'method' => 'PATCH',
            'body' => $update_data,
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return new \WP_Error(
                'store_update_failed',
                /* translators: %s: error message */
                sprintf(__('Failed to update store: %s', 'ucphub-for-woocommerce'), $response->get_error_message()),
                ['status' => 500]
            );
        }

        if ($response['code'] !== 200) {
            $error_body = json_decode($response['body'], true);
            $error_message = isset($error_body['message']) ? $error_body['message'] : __('Unknown error', 'ucphub-for-woocommerce');

            if (defined('WP_DEBUG') && WP_DEBUG) {
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log, WordPress.PHP.DevelopmentFunctions.error_log_print_r
                error_log('UCPHub Store Update Error: ' . print_r([
                    'code' => $response['code'],
                    'body' => $response['body'],
                    'update_data' => $update_data,
                ], true));
            }

            return new \WP_Error(
                'store_update_failed',
                /* translators: %1$d: HTTP status code, %2$s: error message */
                sprintf(__('Failed to update store: HTTP %1$d - %2$s', 'ucphub-for-woocommerce'), $response['code'], $error_message),
                ['status' => $response['code']]
            );
        }

        $store_data = json_decode($response['body'], true);        


        return new \WP_REST_Response($store_data, 200);
    }

    /**
     * REST API callback: Get available capabilities for the store
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_store_capabilities($request)
    {
        $store_id = UCPHubConfig::get('store_id');
        if (empty($store_id)) {
            return new \WP_Error(
                'store_not_configured',
                __('Store is not connected. Please connect your store first.', 'ucphub-for-woocommerce'),
                ['status' => 404]
            );
        }

        // Get store info via API key authenticated endpoint
        $store_info = $this->get_store_info();
        if (is_wp_error($store_info)) {
            return $store_info;
        }

        if (!isset($store_info['integration'])) {
            return new \WP_Error(
                'integration_not_found',
                __('Store integration not found. Please reconnect your store.', 'ucphub-for-woocommerce'),
                ['status' => 404]
            );
        }

        $settings = $store_info['integration']['settings'] ?? [];
        $capabilities = $settings['capabilities'] ?? [];

        // Return available UCP capabilities (these are the standard ones)
        $available_capabilities = [
            [
                'name' => 'dev.ucp.shopping.checkout',
                'label' => __('Checkout', 'ucphub-for-woocommerce'),
                'description' => __('Enable checkout capabilities', 'ucphub-for-woocommerce'),
            ],
            [
                'name' => 'dev.ucp.shopping.order',
                'label' => __('Order Management', 'ucphub-for-woocommerce'),
                'description' => __('Enable order management capabilities', 'ucphub-for-woocommerce'),
            ],
            [
                'name' => 'dev.ucp.shopping.fulfillment',
                'label' => __('Fulfillment', 'ucphub-for-woocommerce'),
                'description' => __('Enable fulfillment capabilities', 'ucphub-for-woocommerce'),
            ],
            [
                'name' => 'dev.ucp.shopping.discount',
                'label' => __('Discount', 'ucphub-for-woocommerce'),
                'description' => __('Enable discount capabilities', 'ucphub-for-woocommerce'),
            ],
        ];

        return new \WP_REST_Response([
            'available' => $available_capabilities,
            'enabled' => $capabilities,
        ], 200);
    }

    /**
     * REST API callback: Get store UCP profile
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_store_profile($request)
    {
        // Use the existing get_discovery method which fetches the UCP profile
        $profile_data = $this->get_discovery();

        if (isset($profile_data['error'])) {
            return new \WP_Error(
                'profile_fetch_failed',
                $profile_data['message'] ?? __('Failed to fetch profile', 'ucphub-for-woocommerce'),
                ['status' => 500]
            );
        }

        return new \WP_REST_Response($profile_data, 200);
    }

    /**
     * REST API callback: Update store integration settings (capabilities, payment handlers)
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_store_integration($request)
    {
        // Use API key auth for all requests
        $ucp_api = new UCPHubUCPAPI();

        $store_id = UCPHubConfig::get('store_id');
        if (empty($store_id)) {
            return new \WP_Error(
                'store_not_configured',
                __('Store is not connected. Please connect your store first.', 'ucphub-for-woocommerce'),
                ['status' => 404]
            );
        }

        // Parse request body
        $body = $request->get_json_params();
        if (empty($body)) {
            $raw_body = $request->get_body();
            if (!empty($raw_body)) {
                $body = json_decode($raw_body, true);
            }
        }

        if (empty($body)) {
            return new \WP_Error(
                'invalid_request',
                __('Request body is empty or invalid.', 'ucphub-for-woocommerce'),
                ['status' => 400]
            );
        }

        // Fetch current settings via store-info endpoint
        $store_info = $this->get_store_info();
        $current_settings = [];
        if (!is_wp_error($store_info) && isset($store_info['integration']['settings'])) {
            $current_settings = $store_info['integration']['settings'];
        }

        // Build settings update by merging with existing settings
        $merged_settings = $current_settings; // Start with existing settings

        // Handle capabilities
        if (isset($body['capabilities'])) {
            $merged_settings['capabilities'] = is_array($body['capabilities'])
                ? array_map('sanitize_text_field', $body['capabilities'])
                : [];
        }

        if (isset($body['payment_handlers']) && is_array($body['payment_handlers'])) {
            $merged_settings['payment'] = [
                'handlers' => $this->build_payment_handlers($body['payment_handlers']),
            ];
        }

        // Handle links
        if (isset($body['links']) && is_array($body['links'])) {
            $links = [];
            foreach ($body['links'] as $link) {
                if (isset($link['type']) && isset($link['url'])) {
                    $sanitized_link = [
                        'type' => sanitize_text_field($link['type']),
                        'url'  => esc_url_raw($link['url']),
                    ];
                    if (!empty($link['title'])) {
                        $sanitized_link['title'] = sanitize_text_field($link['title']);
                    }
                    $links[] = $sanitized_link;
                }
            }
            $merged_settings['links'] = $links;
        }

        if (empty($merged_settings)) {
            return new \WP_Error(
                'invalid_request',
                __('No valid update data provided.', 'ucphub-for-woocommerce'),
                ['status' => 400]
            );
        }

        // Use the complete-setup endpoint which is API key authenticated
        $response = $ucp_api->make_request('/api/store-integrations/complete-setup', [
            'method' => 'POST',
            'body' => [
                'settings' => $merged_settings,
            ],
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return new \WP_Error(
                'integration_update_failed',
                /* translators: %s: error message */
                sprintf(__('Failed to update store integration: %s', 'ucphub-for-woocommerce'), $response->get_error_message()),
                ['status' => 500]
            );
        }

        if ($response['code'] !== 200) {
            $error_body = json_decode($response['body'], true);
            $error_message = isset($error_body['message']) ? $error_body['message'] : __('Unknown error', 'ucphub-for-woocommerce');

            if (defined('WP_DEBUG') && WP_DEBUG) {
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log, WordPress.PHP.DevelopmentFunctions.error_log_print_r
                error_log('UCPHub Integration Update Error: ' . print_r([
                    'code' => $response['code'],
                    'body' => $response['body'],
                    'settings' => $merged_settings,
                ], true));
            }

            return new \WP_Error(
                'integration_update_failed',
                /* translators: %1$d: HTTP status code, %2$s: error message */
                sprintf(__('Failed to update store integration: HTTP %1$d - %2$s', 'ucphub-for-woocommerce'), $response['code'], $error_message),
                ['status' => $response['code']]
            );
        }    

        // Fetch and return updated store info
        $updated_info = $this->get_store_info();
        if (is_wp_error($updated_info)) {
            return new \WP_REST_Response(['success' => true], 200);
        }

        return new \WP_REST_Response($updated_info['integration'] ?? ['success' => true], 200);
    }

    /**
     * REST API callback: Get organization data
     *
     * @param \WP_REST_Request $request Request object
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_organization($request)
    {
        // Use API key auth via the store-info endpoint
        $ucp_api = new UCPHubUCPAPI();

        $store_id = UCPHubConfig::get('store_id');
        if (empty($store_id)) {
            return new \WP_Error(
                'store_not_configured',
                __('Store is not connected. Please connect your store first.', 'ucphub-for-woocommerce'),
                ['status' => 404]
            );
        }

        // Fetch all store info including organization
        $response = $ucp_api->make_request('/api/store-integrations/store-info', [
            'method' => 'GET',
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return new \WP_Error(
                'org_fetch_failed',
                /* translators: %s: error message */
                sprintf(__('Failed to fetch organization: %s', 'ucphub-for-woocommerce'), $response->get_error_message()),
                ['status' => 500]
            );
        }

        if ($response['code'] !== 200) {
            $error_body = json_decode($response['body'], true);
            $error_message = isset($error_body['message']) ? $error_body['message'] : __('Unknown error', 'ucphub-for-woocommerce');
            return new \WP_Error(
                'org_fetch_failed',
                /* translators: %s: error message */
                sprintf(__('Failed to fetch organization: %s', 'ucphub-for-woocommerce'), $error_message),
                ['status' => $response['code']]
            );
        }

        $data = json_decode($response['body'], true);

        if (!isset($data['organization']) || empty($data['organization'])) {
            return new \WP_Error(
                'org_not_found',
                __('Organization not found for this store', 'ucphub-for-woocommerce'),
                ['status' => 404]
            );
        }

        return new \WP_REST_Response($data['organization'], 200);
    }

    public function get_policy_pages($request)
    {
        $pages = [];

        $privacy_url = get_privacy_policy_url();
        if (!empty($privacy_url)) {
            $pages['privacy_policy'] = $privacy_url;
        }

        if (function_exists('wc_terms_and_conditions_page_id')) {
            $terms_page_id = wc_terms_and_conditions_page_id();
            if ($terms_page_id) {
                $terms_url = get_permalink($terms_page_id);
                if ($terms_url) {
                    $pages['terms_of_service'] = $terms_url;
                }
            }
        }

        $slug_patterns = [
            'refund_policy'   => ['refund', 'refund-policy', 'refunds', 'returns', 'return-policy', 'returns-policy'],
            'shipping_policy' => ['shipping', 'shipping-policy', 'delivery', 'delivery-policy', 'shipping-information'],
            'faq'             => ['faq', 'faqs', 'frequently-asked-questions'],
        ];

        foreach ($slug_patterns as $type => $slugs) {
            if (isset($pages[$type])) {
                continue;
            }

            $found = get_posts([
                'post_type'      => 'page',
                'post_status'    => 'publish',
                'post_name__in'  => $slugs,
                'posts_per_page' => 1,
                'fields'         => 'ids',
            ]);

            if (!empty($found)) {
                $url = get_permalink($found[0]);
                if ($url) {
                    $pages[$type] = $url;
                }
            }
        }

        return new \WP_REST_Response($pages, 200);
    }

    private function build_payment_handlers(array $gateway_ids): array
    {
        $payment_handlers = [];
        $gateways = WC()->payment_gateways()->get_available_payment_gateways();

        foreach ($gateway_ids as $gateway_id) {
            if (isset($gateways[$gateway_id])) {
                $gateway = $gateways[$gateway_id];
                $payment_handlers[] = [
                    'id'                 => $gateway_id,
                    'name'               => 'com.woocommerce.' . $gateway_id,
                    'version'            => gmdate('Y-m-d'),
                    'spec'               => home_url('/wc-api/ucp/payment/' . $gateway_id),
                    'config_schema'      => home_url('/wc-api/ucp/payment/' . $gateway_id . '/config'),
                    'instrument_schemas' => [home_url('/wc-api/ucp/payment/' . $gateway_id . '/instrument')],
                    'config'             => [
                        'title'       => $gateway->get_title(),
                        'description' => $gateway->get_description(),
                    ],
                ];
            }
        }

        return $payment_handlers;
    }

    /**
     * Helper: Get full store info (store, integration, organization)
     *
     * @return array|\WP_Error Store info or WP_Error
     */
    private function get_store_info()
    {
        $ucp_api = new UCPHubUCPAPI();

        $response = $ucp_api->make_request('/api/store-integrations/store-info', [
            'method' => 'GET',
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return new \WP_Error(
                'store_info_failed',
                /* translators: %s: error message */
                sprintf(__('Failed to fetch store info: %s', 'ucphub-for-woocommerce'), $response->get_error_message()),
                ['status' => 500]
            );
        }

        if ($response['code'] !== 200) {
            return new \WP_Error(
                'store_info_failed',
                /* translators: %d: HTTP status code */
                sprintf(__('Failed to fetch store info: HTTP %d', 'ucphub-for-woocommerce'), $response['code']),
                ['status' => $response['code']]
            );
        }

        return json_decode($response['body'], true);
    }
}
