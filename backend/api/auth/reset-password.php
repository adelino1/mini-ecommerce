<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Método não permitido', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$token = trim($input['token'] ?? '');
$password = trim($input['password'] ?? '');
$email = trim($input['email'] ?? '');

if (!$token || !$password) {
    sendError('Token e password são obrigatórios');
}

if (strlen($password) < 6) {
    sendError('Password deve ter mínimo 6 caracteres');
}

$sql = '
    SELECT id, email, token_hash, expires_at, used_at
    FROM password_resets
    WHERE used_at IS NULL AND expires_at >= NOW()
';
$params = [];
if ($email !== '') {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Email inválido');
    }
    $sql .= ' AND email = ?';
    $params[] = $email;
}
$sql .= ' ORDER BY id DESC LIMIT 100';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$candidates = $stmt->fetchAll();

$reset = null;
foreach ($candidates as $candidate) {
    if (password_verify($token, $candidate['token_hash'])) {
        $reset = $candidate;
        break;
    }
}
if (!$reset) {
    sendError('Token inválido ou expirado', 400);
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$pdo->beginTransaction();
try {
    $pdo->prepare('UPDATE users SET password = ? WHERE email = ?')
        ->execute([$hash, $reset['email']]);
    $pdo->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = ?')
        ->execute([$reset['id']]);
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    sendError('Erro ao redefinir password', 500);
}

sendSuccess(['message' => 'Password atualizada com sucesso']);
