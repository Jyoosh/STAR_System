<?php
// File: public/api/restoreUser.php
require __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db_connection.php';

ini_set('display_errors', '1');
error_reporting(E_ALL);

// ── CORS Headers ─────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000', 'https://tvnhs-star.com'];
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Handle Request ─────────────────────────────
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing user_id']);
    exit;
}

$ids = is_array($data['user_id']) ? $data['user_id'] : [$data['user_id']];

// Validate IDs as integers
$ids = array_filter($ids, fn($id) => is_numeric($id));

if (empty($ids)) {
    http_response_code(400);
    echo json_encode(['error' => 'No valid IDs provided']);
    exit;
}

try {
    $in = str_repeat('?,', count($ids) - 1) . '?';
    $stmt = $pdo->prepare("UPDATE users SET is_deleted = 0 WHERE id IN ($in)");
    $stmt->execute($ids);

    echo json_encode([
        'success' => true,
        'message' => 'Users restored',
        'restored_count' => $stmt->rowCount()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
