<?php
// ─────────────────────────────────────────────
// ✅ Headers
// ─────────────────────────────────────────────
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// ─────────────────────────────────────────────
// ✅ Error Reporting
// ─────────────────────────────────────────────
error_reporting(E_ALL);
ini_set('display_errors', 1);

date_default_timezone_set('Asia/Manila');

// ─────────────────────────────────────────────
// ✅ Preflight (OPTIONS) handler
// ─────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ─────────────────────────────────────────────
// ✅ Includes and Logging
// ─────────────────────────────────────────────
require_once __DIR__ . '/db_connection.php';
file_put_contents(__DIR__ . '/called.txt', date('[Y-m-d H:i:s] called') . PHP_EOL, FILE_APPEND);

$rawInput = file_get_contents('php://input');
file_put_contents(__DIR__ . '/debug_raw.txt', date('[Y-m-d H:i:s] ') . $rawInput . PHP_EOL, FILE_APPEND);

$input = json_decode($rawInput, true);

// 🔄 Fallback to $_POST
if ($input === null && !empty($_POST)) {
    $input = $_POST;
    file_put_contents(__DIR__ . '/debug_fallback.txt', date('[Y-m-d H:i:s] Using $_POST fallback') . PHP_EOL, FILE_APPEND);
}

if (!is_array($input)) {
    file_put_contents(__DIR__ . '/debug_json_error.txt', date('[Y-m-d H:i:s] JSON decode error: ') . json_last_error_msg() . PHP_EOL, FILE_APPEND);
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON input.',
        'json_error' => json_last_error_msg()
    ]);
    exit;
}

// ─────────────────────────────────────────────
// ✅ Validate Required Fields
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// ✅ Sanitize Input
// ─────────────────────────────────────────────
$user_id = trim($input['user_id']);
if (!preg_match('/^[A-Za-z0-9_-]+$/', $user_id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid user_id format']);
    exit;
}

$total_score = $level1 + $level2 + $level3 + $level4;
$currentLevel = trim($input['currentLevel']);
$timestamp = isset($input['timestamp'])
    ? (new DateTime($input['timestamp'], new DateTimeZone('UTC')))
        ->setTimezone(new DateTimeZone('Asia/Manila'))
        ->format('Y-m-d H:i:s')
    : date('Y-m-d H:i:s');
$assessment_type = trim($input['assessment_type'] ?? 'Without Speech Defect');
$levelScores = $input['levelScores'];

// ─────────────────────────────────────────────
// ✅ Extract Level Scores
// ─────────────────────────────────────────────
function getScore($scores, $key)
{
    return isset($scores[$key]) && is_numeric($scores[$key]) ? intval($scores[$key]) : 0;
}

$level1 = min(getScore($levelScores, 'level1'), 10);
$level2 = min(getScore($levelScores, 'level2'), 10);
$level3 = min(getScore($levelScores, 'level3'), 10);
$level4 = min(getScore($levelScores, 'level4'), 10);


// ─────────────────────────────────────────────
// ✅ Validate Total Score Limit
// ─────────────────────────────────────────────
$maxScores = ['level1' => 10, 'level2' => 10, 'level3' => 10, 'level4' => 10];
$max_score = array_sum($maxScores);

if ($total_score > $max_score) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => "Total score $total_score exceeds max $max_score"
    ]);
    exit;
}

// ─────────────────────────────────────────────
// ✅ Final Reading Level (Frontend-controlled)
// ─────────────────────────────────────────────
$reading_level = isset($input['reading_level']) ? trim($input['reading_level']) : 'Level 1';
$reading_level = $currentLevel;

$validLevels = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];
if (!in_array($reading_level, $validLevels)) {
    $reading_level = 'Level 1';
}

$accuracy = $max_score > 0 ? round(($total_score / $max_score) * 100, 2) : 0.0;

// ─────────────────────────────────────────────
// ✅ Resolve student_id from user_id
// ─────────────────────────────────────────────
try {
    $isNumeric = ctype_digit((string) $user_id);

    if ($isNumeric) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'Student' AND is_deleted = 0 LIMIT 1");
    } else {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE user_id = ? AND role = 'Student' AND is_deleted = 0 LIMIT 1");
    }

    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$user) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "User ID not found or inactive"]);
        exit;
    }

    $student_id = $user['id'];

    // ─────────────────────────────────────────
    // ✅ Insert to assessment_results
    // ─────────────────────────────────────────
    $stmt = $pdo->prepare("
        INSERT INTO assessment_results (
            student_id, passage_id, assessed_at, accuracy, reading_level, level,
            level1_score, level2_score, level3_score, level4_score,
            total_score, max_score, assessment_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $success = $stmt->execute([
        $student_id,
        1, // default passage_id
        $timestamp,
        $accuracy,
        $reading_level,
        $currentLevel,
        $level1,
        $level2,
        $level3,
        $level4,
        $total_score,
        $max_score,
        $assessment_type
    ]);

    if (!$success || $stmt->rowCount() === 0) {
        throw new Exception("Insert failed: " . json_encode($stmt->errorInfo()));
    }

    echo json_encode([
        'success' => true,
        'accuracy' => $accuracy,
        'reading_level' => $reading_level,
        'max_score' => $max_score,
        'timestamp' => $timestamp
    ]);

} catch (Exception $e) {
    http_response_code(500);
    file_put_contents(__DIR__ . '/debug_error.txt', date('[Y-m-d H:i:s] ') . $e->getMessage() . PHP_EOL, FILE_APPEND);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}
