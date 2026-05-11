<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/response.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Método não permitido', 405);
}

$payload = requireAuth();

$pdo->prepare('DELETE FROM cart_items WHERE user_id = ?')
    ->execute([$payload['user_id']]);

sendSuccess(['message' => 'Carrinho limpo']);