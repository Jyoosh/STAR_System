<?php
// Enable error display for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Always return JSON
header('Content-Type: application/json');

// Ensure DB connection
require_once __DIR__ . '/../bootstrap.php';

try {
    // Attempt to fetch images
    $stmt = $pdo->query("SELECT id, filename, title FROM carousel_images ORDER BY id ASC");
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($images);
} catch (PDOException $e) {
    // Return error as JSON
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
    exit;
} catch (Throwable $e) {
    // Catch any other PHP errors
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
    exit;
}
