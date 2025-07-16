<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/db_connection.php';

// ─────────────────────────────────────────────
// ✅ Validate input
// ─────────────────────────────────────────────
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    echo json_encode(['success' => false, 'error' => 'Missing or invalid user ID']);
    exit;
}

$student_id = (int) $_GET['id'];
$limit = isset($_GET['limit']) && is_numeric($_GET['limit']) ? (int) $_GET['limit'] : null;

try {
    $sql = "
        SELECT 
            id,
            assessed_at,
            total_score,
            max_score,
            accuracy,
            reading_level,
            level AS current_level_label,
            level1_score,
            level2_score,
            level3_score,
            level4_score,
            assessment_type
        FROM assessment_results
        WHERE student_id = ?
        ORDER BY assessed_at DESC
    ";

    if ($limit) {
        $sql .= " LIMIT $limit";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$student_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($results as &$row) {
        $row['assessed_at'] = date('Y-m-d H:i:s', strtotime($row['assessed_at']));
        $row['total_score'] = (int) $row['total_score'];
        $row['max_score'] = (int) $row['max_score'];
        $row['accuracy'] = round((float) $row['accuracy'], 2);
        $row['level1_score'] = (int) $row['level1_score'];
        $row['level2_score'] = (int) $row['level2_score'];
        $row['level3_score'] = (int) $row['level3_score'];
        $row['level4_score'] = (int) $row['level4_score'];
        $row['assessment_type'] = $row['assessment_type'] ?? 'Without Speech Defect';
    }

    echo json_encode([
        'success' => true,
        'results' => $results,
        'latest' => $results[0] ?? null
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
