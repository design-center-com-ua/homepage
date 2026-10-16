<?php
// sendmail.php

header("Content-Type: application/json; charset=UTF-8");

function invalid_input() {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid input data."]);
    exit;
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
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Message sent."]);
        exit;
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
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Message sent."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to send email."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
}
?>
