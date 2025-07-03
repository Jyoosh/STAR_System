<?php
// api/cors.php
require __DIR__ . '/bootstrap.php';
// Get the requesting origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// List of allowed origins in development
$allowed_origins = [
  'http://localhost:3000',
  'http://192.168.8.57:3000',  // your PC’s LAN IP + port
];

if (in_array($origin, $allowed_origins, true)) {
  header("Access-Control-Allow-Origin: {$origin}");
  header('Access-Control-Allow-Credentials: true');
}

// Common CORS headers
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}
