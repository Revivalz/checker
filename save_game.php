<?php
session_start();
include 'config.php';
if (!isset($_SESSION['user_id'])) { echo "Not logged in"; exit; }

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['board']) || !isset($input['currentPlayer'])) {
    echo "Invalid data";
    exit;
}

$board = json_encode($input['board']);  // Encode the board array to JSON string
$currentPlayer = $input['currentPlayer'];
$userId = $_SESSION['user_id'];

// Save to DB (REPLACE overwrites existing)
$stmt = $conn->prepare("REPLACE INTO games (user_id, board, current_player) VALUES (?, ?, ?)");
$stmt->bind_param("isi", $userId, $board, $currentPlayer);
if ($stmt->execute()) {
    echo "Game saved";
} else {
    echo "Save failed: " . $stmt->error;
}
$conn->close();
?>