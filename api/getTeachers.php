<?php
// File: public/api/getTeachers.php
require __DIR__ . '/bootstrap.php';
// ── CORS & JSON bootstrap ───────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
$origin  = $_SERVER['HTTP_ORIGIN']  ?? '';
$allowed = ['http://localhost:3000'];
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Load your PDO connection ────────────────────────────────────────
require_once __DIR__ . '/db_connection.php';  // defines $pdo as PDO

try {
    // Fetch all Teacher-role users
    $stmt = $pdo->query("
      SELECT 
        id,
        user_id,
        first_name,
        middle_name,
        surname,
        email,
        created_at
      FROM users
      WHERE role = 'Teacher'
      ORDER BY id DESC
    ");
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($teachers);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
      'error' => 'Failed to load teachers: ' . $e->getMessage()
    ]);
}
