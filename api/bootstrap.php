<?php
// File: public/api/bootstrap.php

// DEV DEBUG (comment out for production)
// ini_set('display_errors', '1');
// ini_set('display_startup_errors', '1');
// error_reporting(E_ALL);

// PRODUCTION: hide notices & warnings
ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);


// ── CORS & JSON headers ─────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');

$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
    'http://localhost:3000',        // development origin
    'https://tvnhs-star.com'        // production origin
];

if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Access-Control-Allow-Credentials');

// ── Handle Preflight Request ───────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Start Session ───────────────────────────────────────────────────
session_start();
