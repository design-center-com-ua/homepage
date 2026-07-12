<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

function dc_oauth_callback_page(string $status, $content, array $config): void
{
    dc_oauth_no_store_headers();
    header('Content-Type: text/html; charset=UTF-8');

    try {
        $nonce = base64_encode(random_bytes(18));
    } catch (Throwable $error) {
        $nonce = base64_encode(hash('sha256', uniqid('', true), true));
    }

    header(
        "Content-Security-Policy: default-src 'none'; script-src 'nonce-" . $nonce .
        "'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"
    );

    $originJson = json_encode($config['cms_origin'], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    $statusJson = json_encode($status, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    $contentJson = json_encode($content, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

    echo '<!doctype html><html><head><meta charset="utf-8"><title>GitHub authentication</title></head>';
    echo '<body style="font-family:system-ui,sans-serif;text-align:center;padding:3rem">';
    echo '<p>Completing GitHub authentication…</p>';
    echo '<script nonce="' . htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') . '">';
    echo '(function(){';
    echo 'const cmsOrigin=' . $originJson . ';';
    echo 'const status=' . $statusJson . ';';
    echo 'const content=' . $contentJson . ';';
    echo 'const response="authorization:github:"+status+":"+JSON.stringify(content);';
    echo 'if(!window.opener){document.body.innerHTML="<p>Return to the Internal page and try again.</p>";return;}';
    echo 'function reply(event){if(event.origin!==cmsOrigin)return;window.opener.postMessage(response,cmsOrigin);}';
    echo 'window.addEventListener("message",reply,false);';
    echo 'window.opener.postMessage("authorizing:github",cmsOrigin);';
    echo '})();';
    echo '</script></body></html>';
    exit;
}

$config = dc_oauth_config();
if (!dc_oauth_is_configured($config)) {
    dc_oauth_callback_page('error', 'GitHub OAuth is not configured on Cityhost.', $config);
}

if (isset($_GET['error'])) {
    $description = isset($_GET['error_description']) ? (string) $_GET['error_description'] : (string) $_GET['error'];
    dc_oauth_callback_page('error', $description, $config);
}

$code = isset($_GET['code']) ? (string) $_GET['code'] : '';
$state = isset($_GET['state']) ? (string) $_GET['state'] : '';
$expectedState = isset($_COOKIE['dc_github_oauth_state']) ? (string) $_COOKIE['dc_github_oauth_state'] : '';

setcookie('dc_github_oauth_state', '', [
    'expires' => time() - 3600,
    'path' => '/admin/oauth/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);

if ($code === '' || $state === '' || $expectedState === '' || !hash_equals($expectedState, $state)) {
    dc_oauth_callback_page('error', 'The authentication session is missing or expired. Please try again.', $config);
}

if (!function_exists('curl_init')) {
    dc_oauth_callback_page('error', 'The Cityhost PHP cURL extension is required for GitHub authentication.', $config);
}

$curl = curl_init('https://github.com/login/oauth/access_token');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/x-www-form-urlencoded',
        'User-Agent: Design-Center-Decap-CMS',
    ],
    CURLOPT_POSTFIELDS => http_build_query([
        'client_id' => $config['client_id'],
        'client_secret' => $config['client_secret'],
        'code' => $code,
        'redirect_uri' => $config['redirect_uri'],
    ], '', '&', PHP_QUERY_RFC3986),
]);

$response = curl_exec($curl);
$httpStatus = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
$curlError = curl_error($curl);
curl_close($curl);

if (!is_string($response) || $response === '' || $httpStatus < 200 || $httpStatus >= 300) {
    $message = $curlError !== '' ? $curlError : 'GitHub rejected the token exchange.';
    dc_oauth_callback_page('error', $message, $config);
}

$tokenResponse = json_decode($response, true);
if (!is_array($tokenResponse) || empty($tokenResponse['access_token'])) {
    $message = is_array($tokenResponse) && !empty($tokenResponse['error_description'])
        ? (string) $tokenResponse['error_description']
        : 'GitHub did not return an access token.';
    dc_oauth_callback_page('error', $message, $config);
}

dc_oauth_callback_page('success', [
    'token' => (string) $tokenResponse['access_token'],
    'provider' => 'github',
], $config);
