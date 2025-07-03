<?php
// File: api/addStudent.php
require 'db_connection.php';
require __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

// Required fields
$required = ['user_id', 'first_name', 'surname', 'email', 'password', 'role'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit;
    }
}

$user_id = $data['user_id'];
$record_id = $user_id;
$first_name = trim($data['first_name']);
$middle_name = isset($data['middle_name']) ? trim($data['middle_name']) : null;
$surname = trim($data['surname']);
$email = trim($data['email']);
$password = $data['password'];
$role = $data['role'];
$teacher_user_id = isset($data['teacher_id']) ? trim($data['teacher_id']) : null;
$student_id = isset($data['student_id']) ? trim($data['student_id']) : null;
$is_reusing_deleted = $data['is_reusing_deleted'] ?? false;

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit;
}

// Check for email duplication (excluding deleted)
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_deleted = 0");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already in use by an active account']);
    exit;
}

// Handle teacher ID lookup
$teacher_id = null;
if ($teacher_user_id && $role === 'Student') {
    $stmt = $pdo->prepare("SELECT id, is_deleted FROM users WHERE user_id = ? AND role = 'Teacher'");
    $stmt->execute([$teacher_user_id]);
    $teacher = $stmt->fetch();

    if (!$teacher) {
        http_response_code(400);
        echo json_encode(['error' => 'Teacher ID not found']);
        exit;
    }

    if ((int)$teacher['is_deleted'] === 1) {
        http_response_code(400);
        echo json_encode(['error' => 'This teacher is deleted. Please assign an active teacher.']);
        exit;
    }

    $teacher_id = $teacher['id'];
}

// Reuse deleted user if flagged
if ($is_reusing_deleted) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ? AND is_deleted = 1");
    $stmt->execute([$user_id]);
    $deletedUser = $stmt->fetch();

    if ($deletedUser) {
        try {
            $stmt = $pdo->prepare("
                UPDATE users SET 
                    first_name = ?, 
                    middle_name = ?, 
                    surname = ?, 
                    email = ?, 
                    password_hash = ?, 
                    role = ?, 
                    teacher_id = ?, 
                    student_id = ?, 
                    is_deleted = 0, 
                    deleted_at = NULL,
                    updated_at = NOW()
                WHERE user_id = ?
            ");
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt->execute([
                $first_name,
                $middle_name,
                $surname,
                $email,
                $hash,
                $role,
                $teacher_id,
                $student_id,
                $user_id
            ]);

            echo json_encode(['success' => true, 'user_id' => $user_id]);
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to restore user: ' . $e->getMessage()]);
            exit;
        }
    }
}

// Insert new user
try {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("
        INSERT INTO users (
            record_id,
            user_id, 
            first_name, 
            middle_name, 
            surname, 
            email, 
            password_hash, 
            role, 
            teacher_id, 
            student_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $record_id,
        $user_id,
        $first_name,
        $middle_name,
        $surname,
        $email,
        $hash,
        $role,
        $teacher_id,
        $student_id
    ]);

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
?>
