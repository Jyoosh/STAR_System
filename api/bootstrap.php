<?php
// File: public/api/bootstrap.php

// ── Error Reporting ──────────────────────────────
ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

// ── CORS & JSON Headers ──────────────────────────
header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:3000',
    'https://tvnhs-star.com'
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Access-Control-Allow-Credentials');

// ── Preflight Request Handling ───────────────────
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Session & DB Initialization ─────────────────
session_start();

// ✅ Load PDO connection from db_connection.php
require_once __DIR__ . '/db_connection.php';
