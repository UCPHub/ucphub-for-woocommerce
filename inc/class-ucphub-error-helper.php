<?php

namespace UCPHub;

if (!defined('ABSPATH')) {
    exit;
}

class UCPHubErrorHelper
{
    public static function create_error($code, $message)
    {
        return [
            'error' => $code,
            'message' => $message,
        ];
    }

    public static function from_wp_error($error, $fallback_code = 'unknown_error')
    {
        $code = $error->get_error_code();
        $message = $error->get_error_message();

        return self::create_error(
            !empty($code) ? $code : $fallback_code,
            !empty($message) ? $message : __('An unknown error occurred', 'ucphub-for-woocommerce')
        );
    }

    public static function from_backend_response($response, $code, $prefix = '')
    {
        $error_body = json_decode($response['body'], true);
        $error_message = isset($error_body['message']) ? $error_body['message'] : __('Unknown error', 'ucphub-for-woocommerce');

        $message = $prefix
            /* translators: %1$s: error prefix, %2$d: HTTP status code, %3$s: error message */
            ? sprintf(__('%1$s: HTTP %2$d - %3$s', 'ucphub-for-woocommerce'), $prefix, $response['code'], $error_message)
            /* translators: %1$d: HTTP status code, %2$s: error message */
            : sprintf(__('HTTP %1$d - %2$s', 'ucphub-for-woocommerce'), $response['code'], $error_message);

        return self::create_error($code, $message);
    }

    public static function to_wp_error($error, $status = 500)
    {
        return new \WP_Error(
            $error['error'] ?? 'unknown_error',
            $error['message'] ?? __('An unknown error occurred', 'ucphub-for-woocommerce'),
            ['status' => $status]
        );
    }

    public static function is_error($data)
    {
        return is_array($data) && isset($data['error']);
    }
}
