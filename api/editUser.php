<?php
require_once 'cors.php';
require __DIR__ . '/db_connection.php';
require __DIR__ . '/bootstrap.php';
// api/editUser.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['user_id'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing or invalid user_id']);
  exit;
}

$userId = trim($input['user_id']);

try {
  // Check if user exists
  $checkStmt = $pdo->prepare("SELECT id FROM users WHERE user_id = ?");
  $checkStmt->execute([$userId]);
  $userExists = $checkStmt->fetchColumn();

  if (!$userExists) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
  }

  // Gather fields to update
  $fields = [];
  $params = [];

  if (!empty($input['first_name'])) {
    $fields[] = 'first_name = :first_name';
    $params[':first_name'] = trim($input['first_name']);
  }

  if (isset($input['middle_name'])) {
    $fields[] = 'middle_name = :middle_name';
    $params[':middle_name'] = trim($input['middle_name']);
  }

  if (!empty($input['surname'])) {
    $fields[] = 'surname = :surname';
    $params[':surname'] = trim($input['surname']);
  }

  if (!empty($input['email'])) {
    $fields[] = 'email = :email';
    $params[':email'] = trim($input['email']);
  }

  if (!empty($input['password'])) {
    $fields[] = 'password_hash = :password_hash';
    $fields[] = 'plain_password = :plain_password';
    $params[':password_hash'] = password_hash($input['password'], PASSWORD_DEFAULT);
    $params[':plain_password'] = $input['password'];
  }

  if (isset($input['gender'])) {
    $fields[] = 'gender = :gender';
    $params[':gender'] = trim($input['gender']);
  }

  if (isset($input['birthday'])) {
    $fields[] = 'birthday = :birthday';
    $params[':birthday'] = trim($input['birthday']);
  }

  if (isset($input['age'])) {
    $fields[] = 'age = :age';
    $params[':age'] = intval($input['age']);
  }

  if (isset($input['grade_level'])) {
    $fields[] = 'grade_level = :grade_level';
    $params[':grade_level'] = trim($input['grade_level']);
  }

  if (isset($input['section'])) {
    $fields[] = 'section = :section';
    $params[':section'] = trim($input['section']);
  }

  if (empty($fields)) {
    http_response_code(400);
    echo json_encode(['error' => 'No valid fields to update']);
    exit;
  }

  $params[':user_id'] = $userId;
  $sql = "UPDATE users SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE user_id = :user_id";

  // Safe SQL logging (mask password)
  $logParams = $params;
  if (isset($logParams[':password_hash'])) {
    $logParams[':password_hash'] = '[HIDDEN]';
  }
  error_log("EDIT USER SQL: $sql");
  error_log("EDIT USER PARAMS: " . json_encode($logParams));

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  echo json_encode(['success' => true]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'error' => 'Failed to update user',
    'details' => $e->getMessage(),
    'trace' => $e->getTraceAsString()
  ]);
}
