<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/db_connection.php';

// Read incoming JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (
    !isset($input['user_id'], $input['total_score'], $input['levelScores'], $input['currentLevel'])
    || !is_array($input['levelScores'])
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields.']);
    exit;
}

// Sanitize inputs
$user_id = intval($input['user_id']);
$total_score = intval($input['total_score']);
$levelScores = $input['levelScores'];
$currentLevel = $input['currentLevel'];
$timestamp = $input['timestamp'] ?? date('Y-m-d H:i:s');

// Individual scores
$level1_score = intval($levelScores['level1'] ?? 0);
$level2_score = intval($levelScores['level2'] ?? 0);
$level3_score = intval($levelScores['level3'] ?? 0);
$level4_score = intval($levelScores['level4'] ?? 0);

// Count how many levels were attempted (assume max per level is 1)
$max_score = count(array_filter($levelScores, fn($s) => is_numeric($s)));

// Prevent division by zero
$accuracy = $max_score > 0 ? round(($total_score / $max_score) * 100, 2) : 0.0;

// Determine reading level
if ($accuracy >= 90) {
    $reading_level = 'Fluent Reader';
} elseif ($accuracy >= 75) {
    $reading_level = 'Transitional Reader';
} elseif ($accuracy >= 50) {
    $reading_level = 'Developing Reader';
} else {
    $reading_level = 'Emerging Reader';
}

$default_passage_id = 1;

try {
    $stmt = $pdo->prepare("
        INSERT INTO assessment_results 
        (student_id, passage_id, assessed_at, accuracy, reading_level, level, 
         level1_score, level2_score, level3_score, level4_score, 
         total_score, max_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $user_id,
        $default_passage_id,
        $timestamp,
        $accuracy,
        $reading_level,
        $currentLevel,
        $level1_score,
        $level2_score,
        $level3_score,
        $level4_score,
        $total_score,
        $max_score
    ]);

    echo json_encode([
        'success' => true,
        'accuracy' => $accuracy,
        'max_score' => $max_score,
        'reading_level' => $reading_level
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
