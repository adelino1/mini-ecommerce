<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getProducts($pdo);
        break;
    case 'POST':
        requireAdmin();
        createProduct($pdo);
        break;
    default:
        sendError('Método não permitido', 405);
}

function getProducts($pdo) {
    $where  = ['p.active = 1'];
    $params = [];

    if (!empty($_GET['category_id'])) {
        $where[]  = 'p.category_id = ?';
        $params[] = (int) $_GET['category_id'];
    }

    if (!empty($_GET['search'])) {
        $where[]  = 'p.name LIKE ?';
        $params[] = '%' . $_GET['search'] . '%';
    }

    $page  = max(1, (int) ($_GET['page']  ?? 1));
    $limit = max(1, (int) ($_GET['limit'] ?? 12));
    $offset = ($page - 1) * $limit;

    $whereSQL = implode(' AND ', $where);

    $countStmt = $pdo->prepare(
        "SELECT COUNT(*) as total FROM products p WHERE $whereSQL"
    );
    $countStmt->execute($params);
    $total = (int) $countStmt->fetch()['total'];

    $stmt = $pdo->prepare("
        SELECT p.id, p.name, p.description, p.price, p.stock,
               p.image_url, p.active, p.created_at,
               c.id as category_id, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE $whereSQL
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    ");

    $bindIndex = 1;
    foreach ($params as $param) {
        $stmt->bindValue($bindIndex++, $param);
    }
    $stmt->bindValue($bindIndex++, $limit, PDO::PARAM_INT);
    $stmt->bindValue($bindIndex++, $offset, PDO::PARAM_INT);
    $stmt->execute();

    sendSuccess([
        'products' => $stmt->fetchAll(),
        'total'    => $total,
        'page'     => $page,
        'pages'    => (int) ceil($total / $limit)
    ]);
}

function createProduct($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);

    $name        = trim($input['name']        ?? '');
    $description = trim($input['description'] ?? '');
    $price       = $input['price']       ?? null;
    $stock       = $input['stock']       ?? 0;
    $category_id = $input['category_id'] ?? null;
    $image_url   = trim($input['image_url']   ?? '');

    if (!$name) {
        sendError('Nome é obrigatório');
    }

    if ($price === null || $price <= 0) {
        sendError('Preço deve ser maior que zero');
    }

    if ($stock < 0) {
        sendError('Stock não pode ser negativo');
    }

    $stmt = $pdo->prepare('
        INSERT INTO products 
            (name, description, price, stock, category_id, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $name,
        $description,
        $price,
        $stock,
        $category_id ?: null,
        $image_url ?: null
    ]);

    $id = $pdo->lastInsertId();

    $stmt = $pdo->prepare('
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = ?
    ');
    $stmt->execute([$id]);

    sendSuccess($stmt->fetch(), 201);
}