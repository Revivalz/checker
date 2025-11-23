<?php
session_start();  // Start session to check it
if (isset($_SESSION['user_id'])) {
    echo "logged_in";  // User is authenticated
} else {
    echo "not_logged_in";  // User needs to log in
}
?>