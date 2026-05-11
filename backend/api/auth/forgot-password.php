<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Método não permitido', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Email inválido');
}

$userStmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$userStmt->execute([$email]);
$user = $userStmt->fetch();

if ($user) {
    $token = bin2hex(random_bytes(32));
    $tokenHash = password_hash($token, PASSWORD_BCRYPT);
    $expiresAt = date('Y-m-d H:i:s', time() + 3600);

    $pdo->prepare('
        INSERT INTO password_resets (email, token_hash, expires_at)
        VALUES (?, ?, ?)
    ')->execute([$email, $tokenHash, $expiresAt]);

    sendSuccess([
        'message' => 'Token de recuperação gerado',
        'reset_token' => $token
    ]);
}

sendSuccess([
    'message' => 'Se o email existir, um token de recuperação será enviado'
]);
