<?php
// GET /api/products/{id}
// PUT /api/products/{id}
// DELETE /api/products/{id}

header('Content-Type: application/json');

// TODO: manipular produto por ID
http_response_code(200);
echo json_encode(['message' => 'product by id endpoint']);
