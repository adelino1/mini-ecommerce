<?php
require_once '../../config/cors.php';
require_once '../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Método não permitido', 405);
}

$base = strtoupper(trim($_GET['base'] ?? 'EUR'));
$symbols = strtoupper(trim($_GET['symbols'] ?? 'USD,GBP'));
$url = 'https://api.frankfurter.app/latest?base=' . urlencode($base) . '&symbols=' . urlencode($symbols);

$response = @file_get_contents($url);

if ($response === false) {
    sendError('Falha ao consultar API externa', 502);
}

$data = json_decode($response, true);
if (!$data || empty($data['rates'])) {
    sendError('Resposta inválida da API externa', 502);
}

sendSuccess($data);
