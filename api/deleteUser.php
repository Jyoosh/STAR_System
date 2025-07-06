<?php
// api/deleteUser.php
require 'db_connection.php';
require __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');

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

  // Soft delete: set is_deleted = 1
  $deleteStmt = $pdo->prepare("UPDATE users SET is_deleted = 1 WHERE user_id = :user_id");
  $success = $deleteStmt->execute([':user_id' => $user_id]);

  if ($success) {
    echo json_encode(['success' => true]);
  } else {
    throw new Exception('Failed to mark user as deleted');
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
