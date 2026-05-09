<?php
// GET /api/products
// POST /api/products

header('Content-Type: application/json');

// TODO: listar produtos e criar produto
http_response_code(200);
echo json_encode(['message' => 'products index endpoint']);
