<?php
require_once '../config/cors.php';
require_once '../helpers/response.php';

sendSuccess([
    "message"   => "API online",
    "timestamp" => date('Y-m-d H:i:s')
]);