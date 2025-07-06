<?php
// public/api/getStudentResults.php
require __DIR__ . '/db_connection.php';
require __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');

$user_id = $_GET['student_id'] ?? null;
if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing student_id']);
    exit;
}

try {
    $lookup = $pdo->prepare("SELECT id FROM users WHERE user_id = :uid AND role = 'Student' AND is_deleted = 0");
    $lookup->execute([':uid' => $user_id]);
    $student = $lookup->fetch();

    if (!$student) {
        http_response_code(404);
        echo json_encode(['error' => 'Student not found']);
        exit;
    }

    $student_id = $student['id'];

    $stmt = $pdo->prepare("
        SELECT
            id,  -- required for dropdown logic
            passage_id,
            reading_level,
            total_score,
            max_score,
            accuracy,
            level,
            level1_score,
            level2_score,
            level3_score,
            level4_score,
            assessed_at
        FROM assessment_results
        WHERE student_id = :sid
        ORDER BY assessed_at DESC
        LIMIT 5
    ");
    $stmt->execute([':sid' => $student_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($results as &$row) {
        $row['accuracy'] = round((float)$row['accuracy'], 2);
        $row['assessed_at'] = date('Y-m-d H:i:s', strtotime($row['assessed_at']));
    }

    echo json_encode(['success' => true, 'results' => $results]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch results',
        'details' => $e->getMessage()
    ]);
}
