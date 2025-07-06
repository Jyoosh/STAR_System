<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/db_connection.php';

// Decode JSON input
$input = json_decode(file_get_contents('php://input'), true);
if ($input === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input.']);
    exit;
}

// Required fields
$requiredFields = ['user_id', 'total_score', 'levelScores', 'currentLevel'];
foreach ($requiredFields as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
        exit;
    }
}

if (!is_array($input['levelScores'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'levelScores must be an array']);
    exit;
}

// Sanitize inputs
$user_id = intval($input['user_id']);
if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid user_id']);
    exit;
}

$total_score = intval($input['total_score']);
$levelScores = $input['levelScores'];
$currentLevel = trim($input['currentLevel']);
$timestamp = $input['timestamp'] ?? date('Y-m-d H:i:s');

// Helper to safely extract level score
function getScore($scores, $key) {
    return isset($scores[$key]) && is_numeric($scores[$key]) ? intval($scores[$key]) : 0;
}

$level1 = getScore($levelScores, 'level1');
$level2 = getScore($levelScores, 'level2');
$level3 = getScore($levelScores, 'level3');
$level4 = getScore($levelScores, 'level4');

// Define level max scores
$maxScores = [
    'level1' => 10,
    'level2' => 10,
    'level3' => 10,
    'level4' => 10
];

// Calculate max score based on submitted levels
$max_score = 0;
foreach ($maxScores as $level => $max) {
    if (isset($levelScores[$level]) && is_numeric($levelScores[$level])) {
        $max_score += $max;
    }
}

if ($total_score > $max_score) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => "Total score $total_score exceeds max $max_score"
    ]);
    exit;
}

// Compute accuracy
$accuracy = $max_score > 0 ? round(($total_score / $max_score) * 100, 2) : 0.0;

// Determine reading label
if (stripos($currentLevel, 'level 1') !== false) {
    $reading_level = 'Level 1';
} elseif ($accuracy >= 90) {
    $reading_level = 'Level 4';
} elseif ($accuracy >= 75) {
    $reading_level = 'Level 3';
} elseif ($accuracy >= 50) {
    $reading_level = 'Level 2';
} else {
    $reading_level = 'Level 1';
}

$default_passage_id = 1;

// Create fingerprint for deduplication
$fingerprint = md5(json_encode([
    $user_id,
    $total_score,
    $level1,
    $level2,
    $level3,
    $level4
]));

try {
    // Deduplication check (last 10 seconds, same fingerprint)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM assessment_results 
        WHERE student_id = ?
          AND MD5(CONCAT_WS('-', total_score, level1_score, level2_score, level3_score, level4_score)) = ?
          AND assessed_at >= NOW() - INTERVAL 10 SECOND
    ");
    $stmt->execute([$user_id, $fingerprint]);

    if ($stmt->fetchColumn() > 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Duplicate submission detected. Try again later.'
        ]);
        exit;
    }

    // Insert valid entry
    $insert = $pdo->prepare("
        INSERT INTO assessment_results (
            student_id, passage_id, assessed_at, accuracy, reading_level, level,
            level1_score, level2_score, level3_score, level4_score,
            total_score, max_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $insert->execute([
        $user_id,
        $default_passage_id,
        $timestamp,
        $accuracy,
        $reading_level,
        $currentLevel,
        $level1,
        $level2,
        $level3,
        $level4,
        $total_score,
        $max_score
    ]);

    echo json_encode([
        'success' => true,
        'accuracy' => $accuracy,
        'reading_level' => $reading_level,
        'max_score' => $max_score
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
