<?php
// GET /api/auth/me

header('Content-Type: application/json');

// TODO: retornar usuário autenticado
http_response_code(200);
echo json_encode(['message' => 'me endpoint']);
