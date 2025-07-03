<?php
// api/getStudents.php
require 'db_connection.php';
require __DIR__ . '/bootstrap.php';

$teacher_id = $_GET['teacher_id'] ?? null;
if (!$teacher_id) {
  http_response_code(400);
  echo json_encode(['error'=>'Missing teacher_id']);
  exit;
}

$sql = "SELECT id,name,email FROM users
        WHERE role = 'Student' AND teacher_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$teacher_id]);
echo json_encode($stmt->fetchAll());

?>