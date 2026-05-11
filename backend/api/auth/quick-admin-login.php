<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../helpers/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Método não permitido', 405);
}

$email = 'admin@minishop.local';
$name = 'Administrador';
$defaultPassword = '123456';

$stmt = $pdo->prepare('SELECT id, name, email, role FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    $hash = password_hash($defaultPassword, PASSWORD_BCRYPT);
    $insert = $pdo->prepare('
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
    ');
    $insert->execute([$name, $email, $hash, 'admin']);
    $id = (int) $pdo->lastInsertId();
    $user = [
        'id' => $id,
        'name' => $name,
        'email' => $email,
        'role' => 'admin'
    ];
} elseif (($user['role'] ?? '') !== 'admin') {
    $pdo->prepare('UPDATE users SET role = ? WHERE id = ?')->execute(['admin', $user['id']]);
    $user['role'] = 'admin';
}

$token = generateToken([
    'user_id' => (int) $user['id'],
    'email' => $user['email'],
    'role' => $user['role']
]);

sendSuccess([
    'token' => $token,
    'user' => [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role']
    ],
    'hint_password' => $defaultPassword
]);
