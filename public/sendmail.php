<?php
// sendmail.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Parse JSON payload
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Sanitize input
    $name = htmlspecialchars(strip_tags(trim($data["name"] ?? '')));
    $email = filter_var(trim($data["email"] ?? ''), FILTER_SANITIZE_EMAIL);
    $subject = htmlspecialchars(strip_tags(trim($data["subject"] ?? '')));
    $message = htmlspecialchars(strip_tags(trim($data["message"] ?? '')));
    
    // Basic validation
    if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid input data."]);
        exit;
    }
    
    // Email Config
    $to = "contact@design-center.com.ua";
    $email_subject = "Новий запит з сайту: $subject";
    
    $email_body = "Ви отримали нове повідомлення з форми на сайті.\n\n";
    $email_body .= "Ім'я: $name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Тема: $subject\n\n";
    $email_body .= "Повідомлення:\n$message\n";
    
    // Headers
    $headers = "From: no-reply@design-center.com.ua\n";
    $headers .= "Reply-To: $email\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\n";
    
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
