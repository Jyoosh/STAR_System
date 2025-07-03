<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/db_connection.php';

// Ensure student ID is passed
if (!isset($_GET['id'])) {
    echo json_encode(['success' => false, 'error' => 'Missing user ID']);
    exit;
}

$student_id = intval($_GET['id']);

try {
    $stmt = $pdo->prepare("
        SELECT 
            id,
            assessed_at,
            total_score,
            max_score,
            accuracy,
            reading_level,
            level,
            level1_score,
            level2_score,
            level3_score,
            level4_score
        FROM assessment_results
        WHERE student_id = ?
        ORDER BY assessed_at DESC
    ");
    $stmt->execute([$student_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'results' => $results]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
