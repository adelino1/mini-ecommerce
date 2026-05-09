<?php
function generateJwt($payload, $secret, $alg = 'HS256') {
    $header = base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => $alg]));
    $payload = base64UrlEncode(json_encode($payload));
    $signature = hash_hmac('sha256', "$header.$payload", $secret, true);
    return "$header.$payload." . base64UrlEncode($signature);
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function verifyJwt($token, $secret) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    list($header, $payload, $signature) = $parts;
    $expected = base64UrlEncode(hash_hmac('sha256', "$header.$payload", $secret, true));
    return hash_equals($expected, $signature);
}
