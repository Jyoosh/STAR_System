<?php
// File: public/api/getUsers.php
require __DIR__ . '/bootstrap.php';
ini_set('display_errors', '1');
error_reporting(E_ALL);

// ── CORS Setup ───────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['http://localhost:3000', 'https://tvnhs-star.com'];
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_connection.php'; // defines $pdo

$roleFilter = $_GET['role'] ?? '';
$q = $_GET['q'] ?? '';

function fetchUsers($pdo, $is_deleted, $roleFilter, $q) {
    $sql = "
        SELECT 
            u.id,
            u.record_id,
            u.user_id,
            u.first_name,
            u.middle_name,
            u.surname,
            u.email,
            u.role,
            t.user_id AS teacher_user_id,
            u.is_deleted
        FROM users u
        LEFT JOIN users t ON u.teacher_id = t.id
        WHERE u.role IN ('Teacher', 'Student') 
          AND u.is_deleted = :is_deleted
    ";

    $params = [':is_deleted' => $is_deleted];

    if (in_array($roleFilter, ['Teacher', 'Student'], true)) {
        $sql .= " AND u.role = :role";
        $params[':role'] = $roleFilter;
    }

    if ($q !== '') {
        $sql .= " AND (
            u.user_id LIKE :q
            OR u.first_name LIKE :q
            OR u.middle_name LIKE :q
            OR u.surname LIKE :q
        )";
        $params[':q'] = "%{$q}%";
    }

    $sql .= " ORDER BY u.role, u.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

$activeUsers = fetchUsers($pdo, 0, $roleFilter, $q);
$deletedUsers = fetchUsers($pdo, 1, $roleFilter, $q);

echo json_encode([
    'active' => $activeUsers,
    'deleted' => $deletedUsers
]);
