<?php
// File: public/api/getNextUserId.php
require __DIR__ . '/bootstrap.php';
// ── DEV DEBUG & CORS ────────────────────────────────────────────────
ini_set('display_errors', '1');
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000'];
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Load PDO connection (defines $pdo)
    require_once __DIR__ . '/db_connection.php';

    // Query the next AUTO_INCREMENT for 'users'
    $stmt = $pdo->prepare("
        SELECT AUTO_INCREMENT
          FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME   = 'users'
        LIMIT 1
    ");
    $stmt->execute();
    $next = $stmt->fetchColumn();

    if ($next === false) {
        throw new Exception('Could not determine next AUTO_INCREMENT for users');
    }

    echo json_encode(['nextId' => (int)$next]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
