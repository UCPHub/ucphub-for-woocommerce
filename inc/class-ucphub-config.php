<?php

namespace UCPHub;

if (!defined('ABSPATH')) {
    exit;
}

class UCPHubConfig
{

    private static $key_prefix = 'ucphub_';


    public function __construct()
    {
        add_action('admin_init', [$this, 'register_settings']);
    }

    public function register_settings()
    {
        register_setting('ucphub_settings_group', 'ucphub_debug_mode', [
            'type' => 'boolean',
            'default' => false,
            'sanitize_callback' => 'rest_sanitize_boolean',
        ]);

        register_setting(
            'ucphub_settings_group',
            'ucphub_api_key',
            [
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            ]
        );

        register_setting(
            'ucphub_settings_group',
            'ucphub_store_id',
            [
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            ]
        );

        register_setting(
            'ucphub_settings_group',
            'ucphub_connection_status',
            [
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => 'disconnected',
            ]
        );

        register_setting(
            'ucphub_settings_group',
            'ucphub_backend_url',
            [
                'type'              => 'string',
                'sanitize_callback' => 'esc_url_raw',
                'default'           => 'https://api.ucphub.ai',
            ]
        );
    }

    public static function get($key, $default = false)
    {
        $full_key = self::$key_prefix . $key;
        return get_option($full_key, $default);
    }

    public static function update($key, $value)
    {
        $full_key = self::$key_prefix . $key;
        return update_option($full_key, $value);
    }

    public static function delete($key)
    {
        $full_key = self::$key_prefix . $key;
        return delete_option($full_key);
    }

    public static function delete_all()
    {
        $keys = [
            'api_key',
            'store_id',
            'connection_status',
            'backend_url',
            'debug_mode',
            'pending_integration_id',
        ];

        foreach ($keys as $key) {
            self::delete($key);
        }

        delete_transient('ucphub_discovery_data');
    }
}
