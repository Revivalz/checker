DROP DATABASE IF EXISTS checkers_db;
CREATE DATABASE checkers_db;
USE checkers_db;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    board TEXT NOT NULL,
    current_player INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
