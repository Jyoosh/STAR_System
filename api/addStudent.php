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

// Sanitize and extract data
$user_id = $data['user_id'];
$record_id = $user_id;
$first_name = trim($data['first_name']);
$middle_name = isset($data['middle_name']) ? trim($data['middle_name']) : null;
$surname = trim($data['surname']);
$email = trim($data['email']);
$password = $data['password'];
$role = $data['role'];
$teacher_user_id = $data['teacher_id'] ?? null;
$student_id = $data['student_id'] ?? null;
$is_reusing_deleted = $data['is_reusing_deleted'] ?? false;
$gender = $data['gender'] ?? null;
$birthday = $data['birthday'] ?? null;
$age = isset($data['age']) ? (int)$data['age'] : null;
$grade_level = $data['grade_level'] ?? null;

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit;
}

// Prevent duplicate active emails
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_deleted = 0");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already in use by an active account']);
    exit;
}

// Resolve teacher ID
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

// Restore deleted user if applicable
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
                    gender = ?,
                    birthday = ?,
                    age = ?,
                    grade_level = ?,
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
                $gender,
                $birthday,
                $age,
                $grade_level,
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

// Create new student
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
            student_id,
            gender,
            birthday,
            age,
            grade_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        $student_id,
        $gender,
        $birthday,
        $age,
        $grade_level
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
