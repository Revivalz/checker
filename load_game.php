<?php
session_start();
include 'config.php';
if (!isset($_SESSION['user_id'])) { echo "Not logged in"; exit; }
$userId = $_SESSION['user_id'];
$gameId = isset($_GET['id']) ? (int)$_GET['id'] : null;
$query = $gameId ? "SELECT board, current_player FROM games WHERE user_id = $userId AND id = $gameId" : "SELECT board, current_player FROM games WHERE user_id = $userId ORDER BY id DESC LIMIT 1";
$result = $conn->query($query);
if ($row = $result->fetch_assoc()) {
    echo json_encode($row);
} else echo "No saved game";
$conn->close();
?>
