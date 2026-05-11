<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $payload = requireAuth();
        getCart($pdo, $payload['user_id']);
        break;
    case 'POST':
        $payload = requireAuth();
        addToCart($pdo, $payload['user_id']);
        break;
    case 'DELETE':
        $payload = requireAuth();
        removeFromCart($pdo, $payload['user_id']);
        break;
    default:
        sendError('Método não permitido', 405);
}

function getCart($pdo, $userId) {
    $stmt = $pdo->prepare('
        SELECT ci.id, ci.product_id, ci.quantity,
               p.name, p.price, p.image_url, p.stock,
               (p.price * ci.quantity) as subtotal
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = ?
        ORDER BY ci.created_at DESC
    ');
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll();

    $total = array_sum(array_column($items, 'subtotal'));
    $count = array_sum(array_column($items, 'quantity'));

    sendSuccess([
        'items' => $items,
        'total' => round($total, 2),
        'count' => (int) $count
    ]);
}

function addToCart($pdo, $userId) {
    $input      = json_decode(file_get_contents('php://input'), true);
    $product_id = (int) ($input['product_id'] ?? 0);
    $quantity   = (int) ($input['quantity']   ?? 1);

    if (!$product_id || $quantity < 1) {
        sendError('Dados inválidos');
    }

    $stmt = $pdo->prepare(
        'SELECT id, stock FROM products WHERE id = ? AND active = 1'
    );
    $stmt->execute([$product_id]);
    $product = $stmt->fetch();

    if (!$product) {
        sendError('Produto não encontrado', 404);
    }

    $stmt = $pdo->prepare(
        'SELECT quantity FROM cart_items 
         WHERE user_id = ? AND product_id = ?'
    );
    $stmt->execute([$userId, $product_id]);
    $existing = $stmt->fetch();

    $newQty = $existing
        ? $existing['quantity'] + $quantity
        : $quantity;

    if ($newQty > $product['stock']) {
        $newQty = $product['stock'];
    }

    $pdo->prepare('
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = ?
    ')->execute([$userId, $product_id, $newQty, $newQty]);

    getCart($pdo, $userId);
}

function removeFromCart($pdo, $userId) {
    $input      = json_decode(file_get_contents('php://input'), true);
    $product_id = (int) ($input['product_id'] ?? 0);

    if (!$product_id) {
        sendError('product_id é obrigatório');
    }

    $pdo->prepare(
        'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?'
    )->execute([$userId, $product_id]);

    getCart($pdo, $userId);
}