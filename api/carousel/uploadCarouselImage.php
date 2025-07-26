<?php
require __DIR__ . '/../bootstrap.php';
header('Content-Type: application/json');

if (!isset($_FILES['image'])) {
  http_response_code(400);
  echo json_encode(['error' => 'No file uploaded']);
  exit;
}

$uploadDir = __DIR__ . '/../../public/assets/carousel/';
$filename = uniqid() . '_' . basename($_FILES['image']['name']);
$targetFile = $uploadDir . $filename;

if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
  $title = $_POST['title'] ?? '';
  $stmt = $pdo->prepare("INSERT INTO carousel_images (filename, title) VALUES (?, ?)");
  $stmt->execute([$filename, $title]);
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to upload file']);
}
