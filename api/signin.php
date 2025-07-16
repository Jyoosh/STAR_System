<?php
// File: api/signin.php
require __DIR__ . '/bootstrap.php';
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', '1'); // only on HTTPS
session_start();

// ── DEV DEBUG: show all PHP errors (remove in production) ────────────
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// ── CORS & JSON headers ──────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.8.57:3000'
];
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Credentials');

// Respond to OPTIONS preflight immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Bootstrap DB & Session ───────────────────────────────────────────
require_once __DIR__ . '/db_connection.php'; // defines $pdo as PDO instance

// ── Read JSON body ───────────────────────────────────────────────────
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Validate input: using user_id and password
$userId = trim($data['user_id'] ?? '');
$password = trim($data['password'] ?? '');
if ($userId === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing credentials']);
    exit;
}

try {
    // ── Query user by user_id ───────────────────────────────────────────
    $sql = "SELECT
                id,
                user_id,
                first_name,
                middle_name,
                surname,
                role,
                password_hash,
                teacher_id,
                student_id,
                created_at
            FROM users
            WHERE user_id = :user_id
            LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':user_id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // ── Verify & respond ───────────────────────────────────────────────
    if ($user && password_verify($password, $user['password_hash'])) {
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];

        // Prepare user object to return
        unset($user['password_hash']);
        echo json_encode(['success' => true, 'user' => $user]);
        exit;
    }

    // ── Invalid credentials ─────────────────────────────────────────────
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    exit;
}
?>
