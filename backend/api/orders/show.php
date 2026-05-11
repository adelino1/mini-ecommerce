<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$payload = requireAuth();
$userId = (int) $payload['user_id'];
$isAdmin = ($payload['role'] ?? '') === 'admin';
$id = (int) ($_GET['id'] ?? 0);

if (!$id) {
    sendError('ID inválido');
}

switch ($method) {
    case 'GET':
        getOrder($pdo, $id, $userId, $isAdmin);
        break;
    case 'PUT':
        if (!$isAdmin) {
            sendError('Acesso negado', 403);
        }
        updateOrderStatus($pdo, $id);
        break;
    default:
        sendError('Método não permitido', 405);
}

function getOrder($pdo, $id, $userId, $isAdmin) {

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

$priceColumn = hasColumn($pdo, 'order_items', 'unit_price') ? 'unit_price' : 'price';
$itemsStmt = $pdo->prepare("
    SELECT oi.id, oi.product_id, oi.quantity, oi.$priceColumn as unit_price,
           p.name as product_name,
           (oi.quantity * oi.$priceColumn) as subtotal
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
    ORDER BY oi.id ASC
");
$itemsStmt->execute([$id]);
$order['items'] = $itemsStmt->fetchAll();

sendSuccess($order);
}

function updateOrderStatus($pdo, $id) {
    $input = json_decode(file_get_contents('php://input'), true);
    $status = trim($input['status'] ?? '');

    $validStatuses = ['pending', 'shipped', 'delivered'];
    if (!in_array($status, $validStatuses)) {
        sendError('Status inválido');
    }

    $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
    $stmt->execute([$status, $id]);

    if ($stmt->rowCount() === 0) {
        sendError('Pedido não encontrado', 404);
    }

    sendSuccess(['message' => 'Status atualizado com sucesso']);
}

function hasColumn($pdo, $table, $column) {
    $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE ?");
    $stmt->execute([$column]);
    return (bool) $stmt->fetch();
}
}
