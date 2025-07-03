<?php
// File: public/api/signup.php
require __DIR__ . '/bootstrap.php';

ini_set('display_errors', '1');
error_reporting(E_ALL);
ob_start();

// CORS & JSON headers
header('Content-Type: application/json; charset=utf-8');
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000'];
if (in_array($origin, $allowed, true)) {
  header("Access-Control-Allow-Origin: $origin");
  header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

try {
  // Load PDO connection
  $dbPath = __DIR__ . '/db_connection.php';
  if (! file_exists($dbPath)) {
    throw new Exception("db_connection.php not found at $dbPath");
  }
  require_once $dbPath;  // defines $pdo

  // Decode payload
  $input = json_decode(file_get_contents('php://input'), true);
  foreach (['user_id','first_name','surname','email','password','role'] as $f) {
    if (empty($input[$f])) {
      http_response_code(400);
      throw new Exception("Missing required field: $f");
    }
  }

  // Validate email
  if (! filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    throw new Exception('Invalid email address');
  }

  // Prepare the foreign-key for teacher_id if needed
  $teacherFk = null;
  if ($input['role'] === 'Student' && !empty($input['teacher_id'])) {
    // teacher_id is passed as user_id, e.g. "TCR-1-1"
    $lookup = $pdo->prepare("
      SELECT id
        FROM users
       WHERE user_id = :uid
         AND role = 'Teacher'
       LIMIT 1
    ");
    $lookup->execute([':uid' => $input['teacher_id']]);
    $row = $lookup->fetch();
    if (!$row) {
      http_response_code(422);
      throw new Exception('Invalid supervising teacher ID');
    }
    $teacherFk = (int)$row['id'];
  }

  // Hash password
  $passwordHash = password_hash($input['password'], PASSWORD_DEFAULT);

  // Insert new user
  $sql = "INSERT INTO users
            (user_id, first_name, middle_name, surname,
             email, password_hash, role, teacher_id, student_id)
          VALUES
            (:user_id, :first_name, :middle_name, :surname,
             :email, :password_hash, :role, :teacher_id, :student_id)";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':user_id'       => $input['user_id'],
    ':first_name'    => $input['first_name'],
    ':middle_name'   => $input['middle_name'] ?? null,
    ':surname'       => $input['surname'],
    ':email'         => $input['email'],
    ':password_hash' => $passwordHash,
    ':role'          => $input['role'],
    ':teacher_id'    => $teacherFk,
    ':student_id'    => $input['student_id'] ?? null,
  ]);

  echo json_encode([
    'success'   => true,
    'insert_id' => (int)$pdo->lastInsertId()
  ]);

} catch (Exception $e) {
  ob_clean();
  $code = http_response_code() ?: 500;
  http_response_code($code);
  echo json_encode(['error' => $e->getMessage()]);
}
