 <?php
     session_start();
     include 'config.php';
     if (!isset($_SESSION['user_id'])) { echo "Not logged in"; exit; }
     $userId = $_SESSION['user_id'];
     $result = $conn->query("SELECT board, current_player FROM games WHERE user_id = $userId");
     if ($row = $result->fetch_assoc()) {
         echo json_encode($row);
     } else echo "No saved game";
     $conn->close();
 ?>
     