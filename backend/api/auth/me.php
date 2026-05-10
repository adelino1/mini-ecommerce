<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Método não permitido', 405);
}

$payload = requireAuth();

$stmt = $pdo->prepare(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?'
);
$stmt->execute([$payload['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    sendError('Utilizador não encontrado', 404);
}

sendSuccess($user);