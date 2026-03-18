<?php

namespace UCPHub;

if (!defined('ABSPATH')) {
    exit;
}

class UCPHubCompatibility
{
    private static $wc_compatible_features = [
        'custom_order_tables',
    ];

    public static function init()
    {
        add_action('before_woocommerce_init', [self::class, 'declare_wc_compatibility']);
    }

    public static function declare_wc_compatibility()
    {
        if (!class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
            return;
        }

        foreach (self::$wc_compatible_features as $feature) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility($feature, UCPHUB_FILE, true);
        }
    }
}
