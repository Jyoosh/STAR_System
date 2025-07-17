<?php
// api/getStudents.php
require 'db_connection.php';
require __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');

$teacher_id = $_GET['teacher_id'] ?? null;
if (!$teacher_id) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing teacher_id']);
  exit;
}

try {
  $sql = "
  SELECT DISTINCT
    u.record_id,
    u.user_id,
    u.first_name,
    u.middle_name,
    u.surname,
    u.email,
    u.gender,
    u.birthday,
    u.age,
    u.grade_level,
    u.plain_password AS password, -- ✅ Add this line
    ar.total_score AS latest_score,
    ar.reading_level AS latest_level,
    ar.assessed_at AS last_assessed_at,
    ar.assessment_type AS latest_assessment_type
  FROM users u
  LEFT JOIN (
    SELECT ar1.*
    FROM assessment_results ar1
    INNER JOIN (
      SELECT student_id, MAX(assessed_at) AS latest_assessed
      FROM assessment_results
      GROUP BY student_id
    ) ar2
    ON ar1.student_id = ar2.student_id AND ar1.assessed_at = ar2.latest_assessed
  ) ar
  ON u.id = ar.student_id
  WHERE u.role = 'Student'
    AND u.teacher_id = ?
    AND (u.is_deleted IS NULL OR u.is_deleted = 0)
  ORDER BY u.surname ASC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([$teacher_id]);
  $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Optional: filter out duplicates
  $seen = [];
  $uniqueStudents = array_filter($students, function ($s) use (&$seen) {
    if (isset($seen[$s['user_id']])) return false;
    $seen[$s['user_id']] = true;
    return true;
  });

  echo json_encode(array_values($uniqueStudents));
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'error' => 'Failed to fetch students',
    'details' => $e->getMessage()
  ]);
}
