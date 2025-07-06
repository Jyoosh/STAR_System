<?php
// public/api/getStudentHistory.php
require __DIR__ . '/db_connection.php';
require __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Validate and extract user_id (e.g. "STD-1")
$user_id = $_GET['student_id'] ?? null;
if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing student_id']);
    exit;
}

try {
    // Convert user_id to internal numeric ID
    $lookup = $pdo->prepare("SELECT id FROM users WHERE user_id = :uid AND role = 'Student' AND is_deleted = 0");
    $lookup->execute([':uid' => $user_id]);
    $student = $lookup->fetch();

    if (!$student) {
        http_response_code(404);
        echo json_encode(['error' => 'Student not found']);
        exit;
    }

    $student_id = $student['id'];

    // Fetch history from assessment_results
    $sql = "
        SELECT
          ar.passage_id,
          ar.total_score,
          ar.accuracy,
          ar.reading_level,
          ar.assessed_at
        FROM assessment_results ar
        WHERE ar.student_id = :sid
        ORDER BY ar.assessed_at DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':sid' => $student_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format dates and ensure numeric values
    foreach ($rows as &$row) {
        $row['total_score'] = (int)$row['total_score'];
        $row['accuracy'] = round((float)$row['accuracy'], 2);
        $row['assessed_at'] = date('Y-m-d H:i:s', strtotime($row['assessed_at']));
    }

    echo json_encode(['success' => true, 'history' => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch history',
        'details' => $e->getMessage()
    ]);
}
