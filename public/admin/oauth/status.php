<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

$config = dc_oauth_config();
dc_oauth_no_store_headers();
header('Content-Type: application/json; charset=UTF-8');

echo json_encode([
    'configured' => dc_oauth_is_configured($config),
    'provider' => 'github',
    'callback_url' => $config['redirect_uri'],
    'cms_origin' => $config['cms_origin'],
    'scope' => $config['scope'],
], JSON_UNESCAPED_SLASHES);

