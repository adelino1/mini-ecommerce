<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../helpers/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Método não permitido', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendError('Dados inválidos');
}

$email    = trim($input['email']    ?? '');
$password = trim($input['password'] ?? '');

if (!$email || !$password) {
    sendError('Email e password são obrigatórios');
}

$stmt = $pdo->prepare(
    'SELECT id, name, email, password, role FROM users WHERE email = ?'
);
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    sendError('Credenciais inválidas', 401);
}

$token = generateToken([
    'user_id' => (int) $user['id'],
    'email'   => $user['email'],
    'role'    => $user['role']
]);

sendSuccess([
    'token' => $token,
    'user'  => [
        'id'    => (int) $user['id'],
        'name'  => $user['name'],
        'email' => $user['email'],
        'role'  => $user['role']
    ]
]);