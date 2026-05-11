<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Método não permitido', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$token = trim($input['token'] ?? '');
$password = trim($input['password'] ?? '');

if (!$email || !$token || !$password) {
    sendError('Email, token e password são obrigatórios');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Email inválido');
}

if (strlen($password) < 6) {
    sendError('Password deve ter mínimo 6 caracteres');
}

$stmt = $pdo->prepare('
    SELECT id, token_hash, expires_at, used_at
    FROM password_resets
    WHERE email = ?
    ORDER BY id DESC
    LIMIT 1
');
$stmt->execute([$email]);
$reset = $stmt->fetch();

if (!$reset) {
    sendError('Token inválido', 400);
}

if ($reset['used_at'] !== null) {
    sendError('Token já foi utilizado', 400);
}

if (strtotime($reset['expires_at']) < time()) {
    sendError('Token expirado', 400);
}

if (!password_verify($token, $reset['token_hash'])) {
    sendError('Token inválido', 400);
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$pdo->beginTransaction();
try {
    $pdo->prepare('UPDATE users SET password = ? WHERE email = ?')
        ->execute([$hash, $email]);
    $pdo->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = ?')
        ->execute([$reset['id']]);
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    sendError('Erro ao redefinir password', 500);
}

sendSuccess(['message' => 'Password atualizada com sucesso']);
