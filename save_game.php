 <?php
     session_start();
     include 'config.php';
     if (!isset($_SESSION['user_id'])) { echo "Not logged in"; exit; }
     $board = json_encode($_POST['board'] ?? []);
     $currentPlayer = $_POST['currentPlayer'] ?? 1;
     $userId = $_SESSION['user_id'];
     $stmt = $conn->prepare("REPLACE INTO games (user_id, board, current_player) VALUES (?, ?, ?)");
     $stmt->bind_param("isi", $userId, $board, $currentPlayer);
     $stmt->execute();
     echo "Game saved";
     $conn->close();
 ?>
