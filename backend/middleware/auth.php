<?php
require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/response.php';

function getAuthToken() {
    $headers = getallheaders();

    foreach ($headers as $key => $value) {
        if (strtolower($key) === 'authorization') {
            if (str_starts_with($value, 'Bearer ')) {
                return substr($value, 7);
            }
        }
    }
    return null;
}

function requireAuth() {
    $token = getAuthToken();

    if (!$token) {
        sendError('Não autorizado', 401);
    }

    $payload = validateToken($token);

    if (!$payload) {
        sendError('Token inválido ou expirado', 401);
    }

    return $payload;
}

function requireAdmin() {
    $payload = requireAuth();

    if ($payload['role'] !== 'admin') {
        sendError('Acesso negado', 403);
    }

    return $payload;
}