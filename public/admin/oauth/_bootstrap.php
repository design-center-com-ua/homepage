<?php
declare(strict_types=1);

function dc_oauth_env(string $name): string
{
    $value = getenv($name);
    return is_string($value) ? trim($value) : '';
}

function dc_oauth_config(): array
{
    static $config = null;
    if (is_array($config)) {
        return $config;
    }

    $config = [
        'client_id' => dc_oauth_env('GITHUB_OAUTH_CLIENT_ID'),
        'client_secret' => dc_oauth_env('GITHUB_OAUTH_CLIENT_SECRET'),
        'redirect_uri' => dc_oauth_env('GITHUB_OAUTH_REDIRECT_URI') ?: 'https://design-center.com.ua/admin/oauth/callback.php',
        'cms_origin' => dc_oauth_env('GITHUB_OAUTH_CMS_ORIGIN') ?: 'https://design-center.com.ua',
        'scope' => dc_oauth_env('GITHUB_OAUTH_SCOPE') ?: 'public_repo read:user user:email',
    ];

    // Recommended on shared hosting: point this environment variable to a PHP
    // file outside the public web root that returns the same keys as above.
    $externalConfigPath = dc_oauth_env('DESIGN_CENTER_OAUTH_CONFIG');
    if ($externalConfigPath === '' && !empty($_SERVER['DOCUMENT_ROOT'])) {
        $documentRoot = rtrim((string) $_SERVER['DOCUMENT_ROOT'], '/');
        $outsideWebRoot = dirname($documentRoot) . '/.design-center-oauth.php';
        $protectedWebRootFallback = $documentRoot . '/private-config/oauth.php';

        // Prefer storage outside the public web root. Some shared hosts jail their
        // file manager to DOCUMENT_ROOT, so fall back to a PHP file in a directory
        // protected by its own .htaccess. A direct PHP request produces no output,
        // while Apache denies access before execution when overrides are enabled.
        $externalConfigPath = is_readable($outsideWebRoot)
            ? $outsideWebRoot
            : $protectedWebRootFallback;
    }
    if ($externalConfigPath !== '' && is_readable($externalConfigPath)) {
        $externalConfig = require $externalConfigPath;
        if (is_array($externalConfig)) {
            foreach (array_keys($config) as $key) {
                if (isset($externalConfig[$key]) && is_string($externalConfig[$key])) {
                    $config[$key] = trim($externalConfig[$key]);
                }
            }
        }
    }

    return $config;
}

function dc_oauth_is_configured(array $config): bool
{
    return $config['client_id'] !== '' && $config['client_secret'] !== '';
}

function dc_oauth_no_store_headers(): void
{
    header('Cache-Control: no-store, max-age=0');
    header('Pragma: no-cache');
    header('Referrer-Policy: no-referrer');
    header('X-Content-Type-Options: nosniff');
}

function dc_oauth_error(string $message, int $status = 400): void
{
    http_response_code($status);
    dc_oauth_no_store_headers();
    header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
    header('Content-Type: text/html; charset=UTF-8');

    $safeMessage = htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    echo '<!doctype html><html><head><meta charset="utf-8"><title>GitHub authentication</title></head>';
    echo '<body style="font-family:system-ui,sans-serif;max-width:42rem;margin:4rem auto;padding:0 1rem">';
    echo '<h1>GitHub authentication</h1><p>' . $safeMessage . '</p></body></html>';
    exit;
}
