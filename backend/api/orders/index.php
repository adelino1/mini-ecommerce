<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$payload = requireAuth();
$userId = (int) $payload['user_id'];
$isAdmin = ($payload['role'] ?? '') === 'admin';

switch ($method) {
    case 'GET':
        listOrders($pdo, $userId, $isAdmin);
        break;
    case 'POST':
        createOrder($pdo, $userId);
        break;
    default:
        sendError('Método não permitido', 405);
}

function listOrders($pdo, $userId, $isAdmin) {
    if ($isAdmin) {
        $stmt = $pdo->query('
            SELECT o.id, o.user_id, o.total, o.status, o.created_at, u.name as user_name
            FROM orders o
            JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC
        ');
        sendSuccess($stmt->fetchAll());
    }

    $stmt = $pdo->prepare('
        SELECT id, user_id, total, status, created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    ');
    $stmt->execute([$userId]);
    sendSuccess($stmt->fetchAll());
}

function createOrder($pdo, $userId) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        sendError('Dados inválidos');
    }

    $required = [
        'shipping_name',
        'shipping_email',
        'shipping_phone',
        'shipping_address',
        'shipping_city',
        'shipping_postal_code'
    ];

    foreach ($required as $field) {
        if (empty(trim($input[$field] ?? ''))) {
            sendError("Campo obrigatório: $field");
        }
    }

    if (!filter_var($input['shipping_email'], FILTER_VALIDATE_EMAIL)) {
        sendError('Email de entrega inválido');
    }

    $cartStmt = $pdo->prepare('
        SELECT ci.product_id, ci.quantity, p.price, p.stock
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = ? AND p.active = 1
    ');
    $cartStmt->execute([$userId]);
    $items = $cartStmt->fetchAll();

    if (empty($items)) {
        sendError('Carrinho vazio');
    }

    $total = 0.0;
    foreach ($items as $item) {
        if ((int) $item['quantity'] > (int) $item['stock']) {
            sendError('Stock insuficiente para um dos produtos');
        }
        $total += ((float) $item['price']) * ((int) $item['quantity']);
    }

    $pdo->beginTransaction();
    try {
        $insertOrder = $pdo->prepare('
            INSERT INTO orders (
                user_id, total, status,
                shipping_name, shipping_email, shipping_phone,
                shipping_address, shipping_city, shipping_postal_code, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $insertOrder->execute([
            $userId,
            round($total, 2),
            'pending',
            trim($input['shipping_name']),
            trim($input['shipping_email']),
            trim($input['shipping_phone']),
            trim($input['shipping_address']),
            trim($input['shipping_city']),
            trim($input['shipping_postal_code']),
            trim($input['notes'] ?? '') ?: null
        ]);
        $orderId = (int) $pdo->lastInsertId();

        $insertItem = $pdo->prepare('
            INSERT INTO order_items (order_id, product_id, quantity, unit_price)
            VALUES (?, ?, ?, ?)
        ');
        $updateStock = $pdo->prepare('
            UPDATE products SET stock = stock - ? WHERE id = ?
        ');

        foreach ($items as $item) {
            $qty = (int) $item['quantity'];
            $productId = (int) $item['product_id'];
            $price = (float) $item['price'];
            $insertItem->execute([$orderId, $productId, $qty, $price]);
            $updateStock->execute([$qty, $productId]);
        }

        $pdo->prepare('DELETE FROM cart_items WHERE user_id = ?')->execute([$userId]);
        $pdo->commit();

        sendSuccess(['id' => $orderId, 'total' => round($total, 2)], 201);
    } catch (Throwable $e) {
        $pdo->rollBack();
        sendError('Erro ao criar pedido', 500);
    }
}
