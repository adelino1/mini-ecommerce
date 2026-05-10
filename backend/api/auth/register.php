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

$name     = trim($input['name']     ?? '');
$email    = trim($input['email']    ?? '');
$password = trim($input['password'] ?? '');

if (!$name || !$email || !$password) {
    sendError('Nome, email e password são obrigatórios');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Email inválido');
}

if (strlen($password) < 6) {
    sendError('Password deve ter mínimo 6 caracteres');
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);

if ($stmt->fetch()) {
    sendError('Este email já está registado', 409);
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
);
$stmt->execute([$name, $email, $hash, 'customer']);

$userId = $pdo->lastInsertId();

$token = generateToken([
    'user_id' => (int) $userId,
    'email'   => $email,
    'role'    => 'customer'
]);

sendSuccess([
    'token' => $token,
    'user'  => [
        'id'    => (int) $userId,
        'name'  => $name,
        'email' => $email,
        'role'  => 'customer'
    ]
], 201);