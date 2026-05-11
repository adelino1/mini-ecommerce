<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Método não permitido', 405);
}

$payload = requireAuth();
$userId = (int) $payload['user_id'];
$isAdmin = ($payload['role'] ?? '') === 'admin';
$id = (int) ($_GET['id'] ?? 0);

if (!$id) {
    sendError('ID inválido');
}

if ($isAdmin) {
    $orderStmt = $pdo->prepare('
        SELECT o.*, u.name as user_name
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.id = ?
    ');
    $orderStmt->execute([$id]);
} else {
    $orderStmt = $pdo->prepare('
        SELECT *
        FROM orders
        WHERE id = ? AND user_id = ?
    ');
    $orderStmt->execute([$id, $userId]);
}

$order = $orderStmt->fetch();
if (!$order) {
    sendError('Pedido não encontrado', 404);
}

$itemsStmt = $pdo->prepare('
    SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price,
           p.name as product_name,
           (oi.quantity * oi.unit_price) as subtotal
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
    ORDER BY oi.id ASC
');
$itemsStmt->execute([$id]);
$order['items'] = $itemsStmt->fetchAll();

sendSuccess($order);
