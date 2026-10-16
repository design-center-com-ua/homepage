<?php
// sendmail.php

function contact_response($code, $status, $message) {
    $content_type = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    $native_form = in_array($content_type, ['application/x-www-form-urlencoded', 'multipart/form-data'], true);
    $accepts_html = strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'text/html') !== false;
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $native_form && $accepts_html) {
        // Older cached pages and browsers without JS must not land on raw JSON.
        $result = $status === 'success' ? 'success' : ($code === 400 ? 'invalid' : 'error');
        header('Location: /contact.html?contact=' . $result, true, 303);
    } else {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code($code);
        echo json_encode(["status" => $status, "message" => $message]);
    }
    exit;
}

function invalid_input() {
    contact_response(400, 'error', 'Invalid input data.');
}

// Match JavaScript String.length and HTML maxlength without requiring mbstring.
function input_length($value) {
    $characters = preg_match_all('/./us', $value);
    if ($characters === false) invalid_input();
    return $characters + preg_match_all('/[\x{10000}-\x{10FFFF}]/u', $value);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Support both fetch JSON and native browser form submissions.
    $content_type = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($content_type === 'application/json') {
        $payload = json_decode(file_get_contents("php://input"));
        if (!is_object($payload) || json_last_error() !== JSON_ERROR_NONE) invalid_input();
        $data = (array) $payload;
    } elseif ($content_type === 'application/x-www-form-urlencoded' || $content_type === 'multipart/form-data') {
        $data = $_POST;
    } else {
        invalid_input();
    }

    foreach (['name', 'email', 'subject', 'message', 'website'] as $field) {
        if (array_key_exists($field, $data) && !is_string($data[$field])) invalid_input();
    }

    // The email is plain text: HTML escaping changes both content and length.
    $name = trim($data["name"] ?? '');
    $email = trim($data["email"] ?? '');
    $subject = str_replace(["\r", "\n"], ' ', trim($data["subject"] ?? ''));
    $message = trim($data["message"] ?? '');
    $website = trim($data["website"] ?? '');

    if (!empty($website)) {
        contact_response(200, 'success', 'Message sent.');
    }
    
    // Basic validation
    if (input_length($name) < 2 || input_length($name) > 100 || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || input_length($subject) < 3 || input_length($subject) > 200 || input_length($message) > 2000) {
        invalid_input();
    }
    
    // Email Config
    $to = "design_office@ukr.net";
    $email_subject = "Новий запит з сайту: $subject";
    
    $email_body = "Ви отримали нове повідомлення з форми на сайті.\n\n";
    $email_body .= "Ім'я: $name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Тема: $subject\n\n";
    $email_body .= "Повідомлення:\n$message\n";
    
    // Headers
    $headers = "From: no-reply@design-center.com.ua\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    // Send email
    if (mail($to, $email_subject, $email_body, $headers)) {
        contact_response(200, 'success', 'Message sent.');
    } else {
        contact_response(500, 'error', 'Failed to send email.');
    }
} else {
    contact_response(405, 'error', 'Method not allowed.');
}
?>
