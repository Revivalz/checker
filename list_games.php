<?php
session_start();
include 'config.php';
if (!isset($_SESSION['user_id'])) {
    echo "Not logged in";
    exit;
}
$userId = $_SESSION['user_id'];
$result = $conn->query("SELECT id, current_player FROM games WHERE user_id = $userId");
$games = [];
while ($row = $result->fetch_assoc()) {
    $games[] = $row;
}
echo json_encode($games);
$conn->close();
?>