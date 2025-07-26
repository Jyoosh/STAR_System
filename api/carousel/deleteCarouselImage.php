<?php
require __DIR__ . '/../bootstrap.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;

if ($id) {
  // Step 1: Get filename from DB
  $stmt = $pdo->prepare("SELECT filename FROM carousel_images WHERE id = ?");
  $stmt->execute([$id]);
  $file = $stmt->fetchColumn();

  // Step 2: Build full path to the file in /public/assets/carousel/
  $filePath = __DIR__ . '/../../public/assets/carousel/' . $file;

  // Step 3: Delete the file if it exists
  if ($file && file_exists($filePath)) {
    unlink($filePath);
  }

  // Step 4: Delete the DB record
  $stmt = $pdo->prepare("DELETE FROM carousel_images WHERE id = ?");
  $stmt->execute([$id]);

  echo json_encode(['success' => true]);
} else {
  http_response_code(400);
  echo json_encode(['error' => 'Missing ID']);
}
