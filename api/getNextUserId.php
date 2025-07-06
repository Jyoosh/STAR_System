<?php
// File: public/api/getNextUserId.php
require __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db_connection.php';

ini_set('display_errors', '1');
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

// CORS headers
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000', 'https://tvnhs-star.com'];
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Query next AUTO_INCREMENT value for the 'users' table
    $stmt = $pdo->prepare("
        SELECT AUTO_INCREMENT
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
        LIMIT 1
    ");
    $stmt->execute();
    $nextId = $stmt->fetchColumn();

    if (!is_numeric($nextId)) {
        throw new Exception('Invalid AUTO_INCREMENT value.');
    }

    // Format IDs for Teacher and Student roles
    echo json_encode([
        'nextId'  => (int)$nextId,
        'Teacher' => "TCR-$nextId",
        'Student' => "STD-$nextId"
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch next user ID', 'details' => $e->getMessage()]);
    exit;
}
