     <?php
     session_start();
     include 'config.php';
     $action = $_POST['action'] ?? '';
     $email = $_POST['email'] ?? '';
     $password = $_POST['password'] ?? '';

     if ($action === 'signup') {
         $hashed = password_hash($password, PASSWORD_DEFAULT);
         $stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
         $stmt->bind_param("ss", $email, $hashed);
         if ($stmt->execute()) echo "Signup successful";
         else echo "Error: " . $stmt->error;
     } elseif ($action === 'login') {
         $stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
         $stmt->bind_param("s", $email);
         $stmt->execute();
         $result = $stmt->get_result();
         if ($row = $result->fetch_assoc()) {
             if (password_verify($password, $row['password'])) {
                 $_SESSION['user_id'] = $row['id'];
                 echo "Login successful";
             } else echo "Invalid password";
         } else echo "User not found";
     }
     $conn->close();
     ?>
     