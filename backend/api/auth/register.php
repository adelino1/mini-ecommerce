<?php
// POST /api/auth/register

header('Content-Type: application/json');

// TODO: implementar registro
http_response_code(201);
echo json_encode(['message' => 'register endpoint']);
