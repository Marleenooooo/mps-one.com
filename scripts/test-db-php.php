<?php
// Read connection from environment with defaults
$host = getenv('DB_HOST') ?: 'srv1631.hstgr.io';
$port = getenv('DB_PORT') ?: '3306';
$db   = getenv('DB_NAME') ?: 'u485208858_mpsonedatabase';
$user = getenv('DB_USER') ?: 'YOUR_DB_USER';
$pass = getenv('DB_PASSWORD') ?: 'YOUR_DB_PASSWORD';

$dsn = 'mysql:host=' . $host . ';port=' . $port . ';dbname=' . $db;
try {
  $pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  $stmt = $pdo->query('SELECT VERSION() AS version, DATABASE() AS db');
  print_r($stmt->fetch());

  // Optional sanity queries if schema is present
  try {
    $stmt2 = $pdo->query('SELECT COUNT(*) AS cnt FROM po');
    print_r($stmt2->fetch());
  } catch (Exception $e) {
    echo 'PO check skipped: ' . $e->getMessage() . PHP_EOL;
  }

  try {
    $stmt3 = $pdo->query('SELECT po_id, ordered_qty, confirmed_qty FROM v_po_item_delivery_totals ORDER BY po_id DESC LIMIT 5');
    foreach ($stmt3->fetchAll() as $row) {
      print_r($row);
    }
  } catch (Exception $e) {
    echo 'View check skipped: ' . $e->getMessage() . PHP_EOL;
  }
} catch (Exception $e) {
  echo 'Connection failed: ' . $e->getMessage() . PHP_EOL;
  exit(1);
}

