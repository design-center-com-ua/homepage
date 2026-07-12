<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

$config = dc_oauth_config();
if (!dc_oauth_is_configured($config)) {
    dc_oauth_error(
        'GitHub OAuth is not configured yet. Add the client ID and client secret on Cityhost, then retry.',
        503
    );
}

try {
    $state = bin2hex(random_bytes(32));
} catch (Throwable $error) {
    dc_oauth_error('The server could not start a secure authentication session.', 500);
}

setcookie('dc_github_oauth_state', $state, [
    'expires' => time() + 600,
    'path' => '/admin/oauth/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);

$query = http_build_query([
    'client_id' => $config['client_id'],
    'redirect_uri' => $config['redirect_uri'],
    'scope' => $config['scope'],
    'state' => $state,
    'allow_signup' => 'false',
], '', '&', PHP_QUERY_RFC3986);

dc_oauth_no_store_headers();
header('Location: https://github.com/login/oauth/authorize?' . $query, true, 302);
exit;
