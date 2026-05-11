<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Método não permitido', 405);
}

$payload = requireAuth();

if (($payload['role'] ?? '') !== 'admin') {
    sendError('Acesso negado', 403);
}

$stmt = $pdo->query('
    SELECT o.id, u.name as customer_name, u.email as customer_email,
           o.total, o.status, o.created_at
    FROM orders o
    JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
');
$orders = $stmt->fetchAll();

$filename = 'orders-' . date('Y-m-d-His') . '.csv';
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$output = fopen('php://output', 'w');
fputcsv($output, ['order_id', 'customer_name', 'customer_email', 'total', 'status', 'created_at']);
foreach ($orders as $order) {
    fputcsv($output, [
        $order['id'],
        $order['customer_name'],
        $order['customer_email'],
        $order['total'],
        $order['status'],
        $order['created_at']
    ]);
}
fclose($output);
exit();
