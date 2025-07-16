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
  foreach (['user_id','first_name','surname','password','role'] as $f) {
    if (empty($input[$f])) {
      http_response_code(400);
      throw new Exception("Missing required field: $f");
    }
  }

  // Validate email
  // if (! filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
  //   http_response_code(422);
  //   throw new Exception('Invalid email address');
  // }

  // Validate supervising teacher ID if role is Student
  $teacherFk = null;
  if ($input['role'] === 'Student' && !empty($input['teacher_id'])) {
    // teacher_id is passed as numeric `id`, not user_id
    $lookup = $pdo->prepare("
      SELECT id
        FROM users
       WHERE id = :tid
         AND role = 'Teacher'
       LIMIT 1
    ");
    $lookup->execute([':tid' => $input['teacher_id']]);
    $row = $lookup->fetch();
    if (!$row) {
      http_response_code(422);
      throw new Exception('Invalid supervising teacher ID');
    }
    $teacherFk = (int) $input['teacher_id'];
  }

  // Hash password
  $passwordHash = password_hash($input['password'], PASSWORD_DEFAULT);

  // Insert new user
// Insert new user
$sql = "INSERT INTO users
          (record_id, user_id, first_name, middle_name, surname,
           email, password_hash, role, teacher_id, student_id,
           gender, birthday, age, grade_level)
        VALUES
          (:record_id, :user_id, :first_name, :middle_name, :surname,
           :email, :password_hash, :role, :teacher_id, :student_id,
           :gender, :birthday, :age, :grade_level)";
$stmt = $pdo->prepare($sql);
$stmt->execute([
  ':record_id'     => $input['user_id'],
  ':user_id'       => $input['user_id'],
  ':first_name'    => $input['first_name'],
  ':middle_name'   => $input['middle_name'] ?? null,
  ':surname'       => $input['surname'],
  ':email'         => $input['email'],
  ':password_hash' => $passwordHash,
  ':role'          => $input['role'],
  ':teacher_id'    => $teacherFk,
  ':student_id'    => $input['student_id'] ?? null,
  ':gender'        => $input['gender'] ?? null,
  ':birthday'      => $input['birthday'] ?? null,
  ':age'           => $input['age'] ?? null,
  ':grade_level'   => $input['grade_level'] ?? null,
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
