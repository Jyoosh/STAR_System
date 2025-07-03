<?php
// api/deleteUser.php
require 'db_connection.php';
require __DIR__ . '/bootstrap.php';

$data = json_decode(file_get_contents('php://input'), true);
$id   = $data['user_id'] ?? null;

if (!$id) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing user_id']);
  exit;
}

// Soft delete: mark user as deleted (add is_deleted column in your DB if not yet)
$stmt = $pdo->prepare("UPDATE users SET is_deleted = 1 WHERE id = ?");
$success = $stmt->execute([$id]);

if ($success) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to update user']);
}
?>
