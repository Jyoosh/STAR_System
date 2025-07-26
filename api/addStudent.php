<?php
// File: api/addStudent.php
require_once 'cors.php';
require 'db_connection.php';
require __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');

// Decode JSON input
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid or missing JSON input']);
  exit;
}

// Required fields
$required = ['user_id', 'first_name', 'surname', 'password', 'role'];
foreach ($required as $field) {
  if (empty($data[$field])) {
    http_response_code(400);
    echo json_encode(['error' => "Missing required field: $field"]);
    exit;
  }
}

// Extract & sanitize
$user_id         = trim($data['user_id']);
$record_id       = $user_id;
$first_name      = trim($data['first_name']);
$middle_name     = $data['middle_name'] ?? null;
$surname         = trim($data['surname']);
$email           = $data['email'] ?? null;
$password        = trim($data['password']);
$role            = trim($data['role']);
$teacher_user_id = $data['teacher_id'] ?? null;
$student_id      = $data['student_id'] ?? null;
$is_reusing_deleted = $data['is_reusing_deleted'] ?? false;
$gender          = $data['gender'] ?? null;
$birthday        = $data['birthday'] ?? null;
$age             = isset($data['age']) ? (int) $data['age'] : null;
$grade_level     = $data['grade_level'] ?? null;
$section         = $data['section'] ?? null;

// Hash password once
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Resolve teacher_id if student
$teacher_id = null;
if ($teacher_user_id && $role === 'Student') {
  $stmt = $pdo->prepare("SELECT id, is_deleted FROM users WHERE user_id = ? AND role = 'Teacher'");
  $stmt->execute([$teacher_user_id]);
  $teacher = $stmt->fetch();

  if (!$teacher) {
    http_response_code(400);
    echo json_encode(['error' => 'Assigned teacher ID not found']);
    exit;
  }

  if ((int)$teacher['is_deleted'] === 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Assigned teacher is deleted. Please choose another.']);
    exit;
  }

  $teacher_id = $teacher['id'];
}

// Fields used in insert
$fields = [
  $record_id,
  $user_id,
  $first_name,
  $middle_name,
  $surname,
  $email,
  $password_hash,
  $password,       // plain_password
  $role,
  $teacher_id,
  $student_id,
  $gender,
  $birthday,
  $age,
  $grade_level,
  $section
];

// Insert reused deleted user
if ($is_reusing_deleted) {
  $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ? AND is_deleted = 1");
  $stmt->execute([$user_id]);
  $deletedUser = $stmt->fetch();

  if ($deletedUser) {
    try {
      $stmt = $pdo->prepare("
        INSERT INTO users (
          record_id,
          user_id,
          first_name,
          middle_name,
          surname,
          email,
          password_hash,
          plain_password,
          role,
          teacher_id,
          student_id,
          gender,
          birthday,
          age,
          grade_level,
          section
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ");
      $stmt->execute($fields);

      echo json_encode(['success' => true, 'user_id' => $user_id, 'restored' => true]);
      exit;
    } catch (PDOException $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Failed to restore deleted user: ' . $e->getMessage()]);
      exit;
    }
  }
}

// Insert new user
try {
  $stmt = $pdo->prepare("
    INSERT INTO users (
      record_id,
      user_id,
      first_name,
      middle_name,
      surname,
      email,
      password_hash,
      plain_password,
      role,
      teacher_id,
      student_id,
      gender,
      birthday,
      age,
      grade_level,
      section
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ");
  $stmt->execute($fields);

  echo json_encode(['success' => true, 'user_id' => $user_id]);
} catch (PDOException $e) {
  if ($e->errorInfo[1] == 1062) {
    http_response_code(409);
    echo json_encode(['error' => 'User ID or Record ID already exists']);
  } else {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
  }
}
