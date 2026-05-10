<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = (int) ($_GET['id'] ?? 0);

if (!$id) {
    sendError('ID inválido');
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

    $input  = json_decode(file_get_contents('php://input'), true);
    $fields = [];
    $params = [];

    $allowed = ['name','description','price','stock','category_id','image_url','active'];

    foreach ($allowed as $field) {
        if (array_key_exists($field, $input)) {
            $fields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }

    if (empty($fields)) {
        sendError('Nenhum campo para actualizar');
    }

    $params[] = $id;
    $pdo->prepare(
        'UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?'
    )->execute($params);

    $stmt = $pdo->prepare('
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = ?
    ');
    $stmt->execute([$id]);

    sendSuccess($stmt->fetch());
}

function deleteProduct($pdo, $id) {
    $stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        sendError('Produto não encontrado', 404);
    }

    $pdo->prepare('UPDATE products SET active = 0 WHERE id = ?')
        ->execute([$id]);

    sendSuccess(['message' => 'Produto desactivado']);
}