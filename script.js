let board = [];
let currentPlayer = 1;
let selectedSquare = null;
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

// Initialize board
function initBoard() {
    board = Array(8).fill(null).map(() => Array(8).fill(0));
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                if (row < 3) board[row][col] = 1;
                else if (row > 4) board[row][col] = 2;
            }
        }
    }
    console.log('Board initialized:', board);
    renderBoard();
}


// Render board
function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((row + col) % 2 === 0 ? 'white' : 'black');
            square.dataset.row = row;
            square.dataset.col = col;
            if (board[row][col] !== 0) {
                square.textContent = board[row][col] === 1 ? '🔴' : '⚫';
                square.classList.add('piece');
            }
            square.addEventListener('click', handleClick);
            boardElement.appendChild(square);
        }
    }
}

// Handle clicks
function handleClick(e) {
    console.log('handleClick triggered');
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    console.log(`Clicked (${row},${col})`);

    if (selectedSquare) {
        console.log('Attempting move...');
        if (isValidMove(selectedSquare, {row, col})) {
            console.log('Move valid');
            movePiece(selectedSquare, {row, col});
            const dr = row - selectedSquare.row;
            const dc = col - selectedSquare.col;
            const wasJump = Math.abs(dr) === 2 && Math.abs(dc) === 2;
            if (wasJump && canJumpAgain({row, col})) {
                console.log('More jumps available, keeping piece selected');
                selectedSquare = {row, col};  // Keep selected for another jump
            } else {
                console.log('No more jumps, switching turns');
                selectedSquare = null;
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                statusElement.textContent = currentPlayer === 1 ? "Red's turn" : "Black's turn";
            }
            checkWin();
        } else {
            console.log('Move invalid');
        }
        renderBoard();
    } else if (board[row][col] === currentPlayer) {
        console.log('Selecting piece');
        selectedSquare = {row, col};
        e.target.classList.add('selected');
    }
}


// Basic move validation (add jumps later)
function isValidMove(from, to) {
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    const piece = board[from.row][from.col];

    console.log(`isValidMove: from (${from.row},${from.col}) to (${to.row},${to.col}), piece ${piece}, dr ${dr}, dc ${dc}`);

    if (board[to.row][to.col] !== 0) {
        console.log('Invalid: Destination not empty');
        return false;
    }

    if (piece === 3 || piece === 4) {  // Kings
        if (Math.abs(dr) === 1 && Math.abs(dc) === 1) {
            console.log('Valid: King normal');
            return true;
        }
        if (Math.abs(dr) === 2 && Math.abs(dc) === 2) {
            const midRow = (from.row + to.row) / 2;
            const midCol = (from.col + to.col) / 2;
            const midPiece = board[midRow][midCol];
            console.log(`King jump: mid at (${midRow},${midCol}) is ${midPiece}`);
            if ((piece === 3 && (midPiece === 2 || midPiece === 4)) || (piece === 4 && (midPiece === 1 || midPiece === 3))) {
                console.log('Valid: King jump');
                return true;
            }
        }
    } else {  // Regular pieces
        const direction = piece === 1 ? 1 : -1;  // Red down (+1), Black up (-1)
        console.log(`Regular direction: ${direction}`);
        if (dr === direction && Math.abs(dc) === 1) {
            console.log('Valid: Normal move');
            return true;
        }
        if (dr === 2 * direction && Math.abs(dc) === 2) {
            const midRow = (from.row + to.row) / 2;
            const midCol = (from.col + to.col) / 2;
            const midPiece = board[midRow][midCol];
            console.log(`Jump check: mid at (${midRow},${midCol}) is ${midPiece}`);
            if ((piece === 1 && (midPiece === 2 || midPiece === 4)) || (piece === 2 && (midPiece === 1 || midPiece === 3))) {
                console.log('Valid: Jump');
                return true;
            }
        }
    }

    console.log('Invalid move');
    return false;
}


function canJumpAgain(pos) {
    const piece = board[pos.row][pos.col];
    const directions = piece === 3 || piece === 4 ? [-1, 1] : [piece === 1 ? 1 : -1];  // Kings all directions, regular forward

    for (const dr of (piece === 3 || piece === 4 ? [-2, -1, 1, 2] : [2 * directions[0]])) {
        for (const dc of [-2, -1, 1, 2]) {
            if (Math.abs(dr) === 2 && Math.abs(dc) === 2) {
                const toRow = pos.row + dr;
                const toCol = pos.col + dc;
                if (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8 && board[toRow][toCol] === 0) {
                    const midRow = (pos.row + toRow) / 2;
                    const midCol = (pos.col + toCol) / 2;
                    const midPiece = board[midRow][midCol];
                    if ((piece === 1 && (midPiece === 2 || midPiece === 4)) ||
                        (piece === 2 && (midPiece === 1 || midPiece === 3)) ||
                        (piece === 3 && (midPiece === 2 || midPiece === 4)) ||
                        (piece === 4 && (midPiece === 1 || midPiece === 3))) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}


function movePiece(from, to) {
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    const piece = board[from.row][from.col];

    // Move the piece
    board[to.row][to.col] = piece;
    board[from.row][from.col] = 0;

    // If it's a jump, remove the captured piece
    if (Math.abs(dr) === 2 && Math.abs(dc) === 2) {
        const midRow = (from.row + to.row) / 2;
        const midCol = (from.col + to.col) / 2;
        board[midRow][midCol] = 0;
    }

    // King promotion
    if (to.row === 7 && piece === 1) board[to.row][to.col] = 3;  // Red king at bottom
    if (to.row === 0 && piece === 2) board[to.row][to.col] = 4;  // Black king at top

    renderBoard();
}



// Move piece
function movePiece(from, to) {
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    const piece = board[from.row][from.col];

    // Move the piece
    board[to.row][to.col] = piece;
    board[from.row][from.col] = 0;

    // If it's a jump, remove the captured piece
    if (Math.abs(dr) === 2 && Math.abs(dc) === 2) {
        const midRow = (from.row + to.row) / 2;
        const midCol = (from.col + to.col) / 2;
        board[midRow][midCol] = 0;
    }

    // King promotion
    if (to.row === 7 && piece === 1) board[to.row][to.col] = 3;  // Red king at bottom
    if (to.row === 0 && piece === 2) board[to.row][to.col] = 4;  // Black king at top

    renderBoard();
}


// Check win
function checkWin() {
    let red = 0, black = 0;
    for (let r of board) for (let c of r) {
        if (c === 1 || c === 3) red++;
        if (c === 2 || c === 4) black++;
    }
    if (red === 0) statusElement.textContent = "Black wins!";
    else if (black === 0) statusElement.textContent = "Red wins!";
}

// Auth functions
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    fetch('login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=login&email=${email}&password=${password}`
    }).then(res => res.text()).then(data => {
        document.getElementById('authMessage').textContent = data;
        if (data === 'Login successful') showGame();
    });
}
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    fetch('login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=login&email=${email}&password=${password}`
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.text();
    })
    .then(data => {
        data = data.trim();  // Remove any extra whitespace/newlines
        console.log('Login response (trimmed):', '"' + data + '"');  // Debug: Check exact string
        document.getElementById('authMessage').textContent = data;
        if (data === 'Login successful') {
            console.log('Calling showGame()');  // Debug: Confirm it's reached
            showGame();
        } else {
            console.log('Response did not match "Login successful"');  // Debug
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        document.getElementById('authMessage').textContent = 'Login failed: ' + error.message;
    });
}

function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    fetch('login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=signup&email=${email}&password=${password}`
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.text();
    })
    .then(data => {
        data = data.trim();  // Trim here too
        console.log('Signup response (trimmed):', '"' + data + '"');  // Debug
        document.getElementById('authMessage').textContent = data;
        if (data === 'Signup successful') {
            console.log('Calling showGame()');  // Debug
            showGame();
        } else {
            console.log('Response did not match "Signup successful"');  // Debug
        }
    })
    .catch(error => {
        console.error('Signup error:', error);
        document.getElementById('authMessage').textContent = 'Signup failed: ' + error.message;
    });
}
function showAuth() {
    document.getElementById('auth').style.display = 'block';
    document.getElementById('game').style.display = 'none';
}
function showGame() {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    initBoard();
    console.log('Board after initialization:', board);
}



// Save/Load
function saveGame() {
    console.log('saveGame called. Current board:', board);

    // Validate board is a proper 8x8 array
    if (!Array.isArray(board) || board.length !== 8 || !Array.isArray(board[0]) || board[0].length !== 8) {
        alert('Cannot save: Board is not properly initialized or invalid.');
        console.error('Invalid board data during save:', board);
        return;
    }

    fetch('save_game.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: board, currentPlayer: currentPlayer })
    })
    .then(res => res.text())
    .then(data => {
        console.log('Save response:', data);
        alert(data);
    })
    .catch(error => {
        console.error('Save failed:', error);
        alert('Save failed: ' + error.message);
    });
}

  



function logout() {
    fetch('logout.php')
        .then(res => res.text())
        .then(data => {
            console.log('Logout response:', data);
            showAuth();  // Switch to login immediately
        })
        .catch(error => console.error('Logout error:', error));
}

  function loadGame() {
    fetch('load_game.php')
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.text();  // get raw text first!
    })
    .then(data => {
        data = data.trim();
        console.log('Load response:', data);

        // Handle known string responses before JSON parsing
        if (data === 'No saved game') {
            alert('No saved game found.');
            return;
        }
        if (data === 'Not logged in') {
            alert('Please log in first.');
            showAuth();
            return;
        }

        // If not known string, try JSON parsing
        try {
            const parsed = JSON.parse(data);
            const loadedBoard = JSON.parse(parsed.board);

            if (!Array.isArray(loadedBoard) || loadedBoard.length !== 8 || !Array.isArray(loadedBoard[0]) || loadedBoard[0].length !== 8) {
                alert('Saved board is invalid. Please start a new game and save.');
                return;
            }

            board = loadedBoard;
            currentPlayer = parseInt(parsed.current_player);
            renderBoard();
            statusElement.textContent = currentPlayer === 1 ? "Red's turn" : "Black's turn";
            alert('Game loaded!');
        } catch (e) {
            console.error('Error parsing loaded data:', e);
            alert('Failed to load game — data corrupted.');
        }
    })
    .catch(error => {
        console.error('Load error:', error);
        alert('Failed to load: ' + error.message);
    });
}

  



// Check if logged in on load
fetch('check_session.php').then(res => res.text()).then(data => {
    if (data === 'logged_in') showGame();
    else showAuth();
});