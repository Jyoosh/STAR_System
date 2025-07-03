<?php
// File: public/api/getUserCounts.php
require __DIR__ . '/bootstrap.php';

// ── DEV DEBUG & CORS ────────────────────────────────────────────────
ini_set('display_errors', '1');
error_reporting(E_ALL);

// Content and CORS headers
header('Content-Type: application/json; charset=utf-8');

$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
    'http://localhost:3000',
    'https://tvnhs-star.com'
];

if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_connection.php';  // defines $pdo

try {
    // 1) Role counts (Teachers & Students)
    $stmt = $pdo->query("
      SELECT role, COUNT(*) AS cnt
        FROM users
       WHERE role IN ('Teacher','Student')
       GROUP BY role
    ");
    $counts = ['Teacher' => 0, 'Student' => 0];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $counts[$row['role']] = (int)$row['cnt'];
    }

    // 2) Compute max numeric suffix of record_id for each role,
    //    INCLUDING soft‑deleted users so IDs never get reused.
    $maxNums = ['Teacher' => 0, 'Student' => 0];
    foreach (['Teacher' => 'TCR', 'Student' => 'STD'] as $role => $prefix) {
        $sql = "
          SELECT 
            MAX(
              CAST(
                SUBSTRING_INDEX(record_id, '-', -1) 
              AS UNSIGNED)
            ) AS max_num
          FROM users
         WHERE role = :role
           AND record_id LIKE :prefix_like
        ";
        $stm = $pdo->prepare($sql);
        $stm->execute([
          ':role'        => $role,
          ':prefix_like' => $prefix . '-%'
        ]);
        $maxNums[$role] = (int)$stm->fetchColumn();
    }

    // 3) Next record_id for the modal
    $nextIds = [
        'Teacher' => 'TCR-' . ($maxNums['Teacher'] + 1),
        'Student' => 'STD-' . ($maxNums['Student'] + 1),
    ];

    echo json_encode([
      'counts'  => $counts,
      'nextIds' => $nextIds,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
