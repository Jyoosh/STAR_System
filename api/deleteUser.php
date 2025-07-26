<?php
// api/deleteUser.php
require_once __DIR__ . '/cors.php';
require 'db_connection.php';
require __DIR__ . '/bootstrap.php';


header('Content-Type: application/json');

// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000']; // Match your frontend origin
if (in_array($origin, $allowed, true)) {
  header("Access-Control-Allow-Origin: $origin");
  header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// Actual delete logic
$data = json_decode(file_get_contents('php://input'), true);
$user_id = $data['user_id'] ?? null;

if (!$user_id) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing user_id']);
  exit;
}

try {
  // Check if user exists
  $checkStmt = $pdo->prepare("SELECT id FROM users WHERE user_id = :user_id LIMIT 1");
  $checkStmt->execute([':user_id' => $user_id]);
  $user = $checkStmt->fetch();

  if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
  }

  // Soft delete
  $deleteStmt = $pdo->prepare("UPDATE users SET is_deleted = 1 WHERE user_id = :user_id");
  $success = $deleteStmt->execute([':user_id' => $user_id]);

  echo json_encode(['success' => $success]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
