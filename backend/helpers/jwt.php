<?php
define('JWT_SECRET', 'meu_segredo_mini_ecommerce_2024');

function generateToken($payload) {
    $header = base64_encode(json_encode([
        'typ' => 'JWT',
        'alg' => 'HS256'
    ]));

    $payload['exp'] = time() + (7 * 24 * 60 * 60);
    $payload        = base64_encode(json_encode($payload));

    $signature = base64_encode(hash_hmac(
        'sha256',
        "$header.$payload",
        JWT_SECRET,
        true
    ));

    return "$header.$payload.$signature";
}

function validateToken($token) {
    $parts = explode('.', $token);

    if (count($parts) !== 3) {
        return false;
    }

    [$header, $payload, $signature] = $parts;

    $validSignature = base64_encode(hash_hmac(
        'sha256',
        "$header.$payload",
        JWT_SECRET,
        true
    ));

    if ($signature !== $validSignature) {
        return false;
    }

    $data = json_decode(base64_decode($payload), true);

    if ($data['exp'] < time()) {
        return false;
    }

    return $data;
}