<?php
// ── CORS Headers ────────────────────────────────
require __DIR__ . '/bootstrap.php';
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', '1'); // only on HTTPS
session_start();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.8.57:3000',
    'https://tvnhs-star.com' // ✅ Your live domain
];

if (in_array($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
header('Content-Type: application/json');
header('Access-Control-Allow-Headers: Content-Type');

// ── Handle Preflight Request ─────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Respond with session data ────────────────────
if (isset($_SESSION['user_id'])) {
    // Fetch user details from the database
    require 'db_connection.php'; // Ensure you have the database connection

    $userId = $_SESSION['user_id'];
    $sql = "SELECT id, first_name, middle_name, surname, email, role FROM users WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode([
            'loggedIn' => true,
            'user' => $user
        ]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
} else {
    echo json_encode(['loggedIn' => false]);
}
?>