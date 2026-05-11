<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getCategories($pdo);
        break;
    case 'POST':
        requireAdmin();
        createCategory($pdo);
        break;
    case 'PUT':
        requireAdmin();
        updateCategory($pdo);
        break;
    case 'DELETE':
        requireAdmin();
        deleteCategory($pdo);
        break;
    default:
        sendError('Método não permitido', 405);
}

function getCategories($pdo) {
    $stmt = $pdo->query('
        SELECT c.id, c.name, c.slug, c.created_at,
               COUNT(p.id) as products_count
        FROM categories c
        LEFT JOIN products p 
               ON p.category_id = c.id AND p.active = 1
        GROUP BY c.id
        ORDER BY c.name ASC
    ');
    sendSuccess($stmt->fetchAll());
}

function createCategory($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);

    $name = trim($input['name'] ?? '');
    $slug = trim($input['slug'] ?? '');

    if (!$name || !$slug) {
        sendError('Nome e slug são obrigatórios');
    }

    $stmt = $pdo->prepare('SELECT id FROM categories WHERE slug = ?');
    $stmt->execute([$slug]);
    if ($stmt->fetch()) {
        sendError('Este slug já existe', 409);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO categories (name, slug) VALUES (?, ?)'
    );
    $stmt->execute([$name, $slug]);
    $id = $pdo->lastInsertId();

    sendSuccess([
        'id'   => (int) $id,
        'name' => $name,
        'slug' => $slug
    ], 201);
}

function updateCategory($pdo) {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) {
        sendError('ID inválido');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $name = trim($input['name'] ?? '');
    $slug = trim($input['slug'] ?? '');

    if (!$name || !$slug) {
        sendError('Nome e slug são obrigatórios');
    }

    $exists = $pdo->prepare('SELECT id FROM categories WHERE id = ?');
    $exists->execute([$id]);
    if (!$exists->fetch()) {
        sendError('Categoria não encontrada', 404);
    }

    $dup = $pdo->prepare('SELECT id FROM categories WHERE slug = ? AND id <> ?');
    $dup->execute([$slug, $id]);
    if ($dup->fetch()) {
        sendError('Este slug já existe', 409);
    }

    $stmt = $pdo->prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?');
    $stmt->execute([$name, $slug, $id]);

    sendSuccess(['message' => 'Categoria atualizada']);
}

function deleteCategory($pdo) {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) {
        sendError('ID inválido');
    }

    $exists = $pdo->prepare('SELECT id FROM categories WHERE id = ?');
    $exists->execute([$id]);
    if (!$exists->fetch()) {
        sendError('Categoria não encontrada', 404);
    }

    $pdo->prepare('UPDATE products SET category_id = NULL WHERE category_id = ?')->execute([$id]);
    $pdo->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
    sendSuccess(['message' => 'Categoria removida']);
}