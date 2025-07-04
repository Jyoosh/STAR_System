<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/db_connection.php';

// Decode incoming JSON
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

// Sanitize and extract inputs
$user_id = intval($input['user_id']);
$total_score = intval($input['total_score']);
$levelScores = $input['levelScores'];
$currentLevel = trim($input['currentLevel']);
$timestamp = $input['timestamp'] ?? date('Y-m-d H:i:s');

// Extract individual scores (default to 0 if missing)
$level1_score = intval($levelScores['level1'] ?? 0);
$level2_score = intval($levelScores['level2'] ?? 0);
$level3_score = intval($levelScores['level3'] ?? 0);
$level4_score = intval($levelScores['level4'] ?? 0);

// Define level max points
$maxPerLevel = [
    'level1' => 10,
    'level2' => 10,
    'level3' => 10,
    'level4' => 10  // 5 questions × 2 pts
];

// Calculate total max score based on attempted levels
$max_score = 0;
foreach ($maxPerLevel as $level => $max) {
    if (isset($levelScores[$level]) && is_numeric($levelScores[$level])) {
        $max_score += $max;
    }
}

// Validate total_score doesn't exceed max_score
if ($total_score > $max_score) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => "Invalid total score: $total_score exceeds max of $max_score."
    ]);
    exit;
}

// Compute accuracy
$accuracy = $max_score > 0 ? round(($total_score / $max_score) * 100, 2) : 0.0;

// Determine reading level label
if (stripos($currentLevel, 'level 1') !== false) {
    $reading_level = 'Level 1';
} else {
    if ($accuracy >= 90) {
        $reading_level = 'Fluent Reader';
    } elseif ($accuracy >= 75) {
        $reading_level = 'Transitional Reader';
    } elseif ($accuracy >= 50) {
        $reading_level = 'Developing Reader';
    } else {
        $reading_level = 'Emerging Reader';
    }
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
