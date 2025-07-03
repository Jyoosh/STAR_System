<?php
// ── CORS (first thing in the file) ──────────────────────────────────
require __DIR__ . '/bootstrap.php';
session_start(); // Start the session

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
    'http://localhost:3000',
    'http://192.168.8.57:3000',
];
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── END CORS ────────────────────────────────────────────────────────

session_unset(); // Clear session variables
session_destroy(); // Destroy the session
echo json_encode(['success' => true]);
?>
