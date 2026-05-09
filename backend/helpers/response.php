<?php
function sendSuccess($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        "success" => true,
        "data"    => $data
    ]);
    exit();
}

function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode([
        "success" => false,
        "message" => $message
    ]);
    exit();
}