<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = (int) ($_GET['id'] ?? 0);

if (!$id) {
    sendError('ID inválido', 400);
}

switch ($method) {
    case 'GET':
        getProduct($pdo, $id);
        break;
    case 'PUT':
        requireAdmin();
        updateProduct($pdo, $id);
        break;
    case 'DELETE':
        requireAdmin();
        deleteProduct($pdo, $id);
        break;
    default:
        sendError('Método não permitido', 405);
}

function getProduct($pdo, $id) {
    $stmt = $pdo->prepare('
        SELECT p.id, p.name, p.description, p.price, p.stock,
               p.image_url, p.active, p.created_at,
               c.id as category_id, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = ? AND p.active = 1
    ');
    $stmt->execute([$id]);
    $product = $stmt->fetch();

    if (!$product) {
        sendError('Produto não encontrado', 404);
    }

    sendSuccess($product);
}

function updateProduct($pdo, $id) {
    $stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        sendError('Produto não encontrado', 404);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    $price = (float) ($input['price'] ?? 0);
    $stock = (int) ($input['stock'] ?? 0);
    $category_id = (int) ($input['category_id'] ?? null);
    $active = (int) ($input['active'] ?? 1);

    if (!$name || $price <= 0 || $stock < 0) {
        sendError('Dados inválidos: nome, preço e stock são obrigatórios');
    }

    $stmt = $pdo->prepare('
        UPDATE products SET
            name = ?, description = ?, price = ?, stock = ?,
            category_id = ?, active = ?
        WHERE id = ?
    ');
    $stmt->execute([$name, $description, $price, $stock, $category_id ?: null, $active, $id]);

    sendSuccess(['message' => 'Produto atualizado com sucesso']);
}

function deleteProduct($pdo, $id) {
    $stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        sendError('Produto não encontrado', 404);
    }

    // Soft delete avoids FK issues with historical order items.
    $stmt = $pdo->prepare('UPDATE products SET active = 0 WHERE id = ?');
    $stmt->execute([$id]);

    sendSuccess(['message' => 'Produto desativado com sucesso']);
}
