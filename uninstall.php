<?php

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . 'inc/class-ucphub-config.php';
require_once plugin_dir_path(__FILE__) . 'inc/class-ucphub.php';

\UCPHub\UCPHub::uninstall();
