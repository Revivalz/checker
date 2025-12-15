let board = [];
let currentPlayer = 1;
let selectedSquare = null;
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

// izveido galdu
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
    renderBoard();
}


// Ielādē galdu
function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const isLight = (row + col) % 2 === 0;
            square.className = 'square ' + (isLight ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;
            if (board[row][col] !== 0) {
                if (board[row][col] === 1) square.textContent = '🔴';
                else if (board[row][col] === 2) square.textContent = '⚫';
                else if (board[row][col] === 3) square.textContent = '👑🔴';
                else if (board[row][col] === 4) square.textContent = '👑⚫';
                square.classList.add('piece');
            }
            square.addEventListener('click', handleClick);
            boardElement.appendChild(square);
        }
    }
}



// Gabalu reaģēšana
function handleClick(e) {
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
                console.log('More jumps available');
                selectedSquare = {row, col};
            } else {
                console.log('No more jumps');
                selectedSquare = null;
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                statusElement.textContent = currentPlayer === 1 ? "Red's turn" : "Black's turn";
            }
            checkWin();
        } else {
            console.log('Move invalid');
        }
        renderBoard();
    } else {
        // Var paņemt tikai to krasu, kuram kārta
        const piece = board[row][col];
        if ((currentPlayer === 1 && (piece === 1 || piece === 3)) || (currentPlayer === 2 && (piece === 2 || piece === 4))) {
            console.log('Selecting piece');
            selectedSquare = {row, col};
            e.target.classList.add('selected');
        } else {
            console.log('Selecting enemy team');
        }
    }
}



// Gājienu Parbaude
function isValidMove(from, to) {
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    const piece = board[from.row][from.col];

    console.log(`isValidMove from (${from.row},${from.col}) to (${to.row},${to.col}), piece ${piece}, dr ${dr}, dc ${dc}`);

    if (board[to.row][to.col] !== 0) {
        console.log('Invalid: Destination not empty');
        return false;
    }

    if (piece === 3 || piece === 4) {  // Karaļi
        // Parbauda 1 soļa gājienu
        if (Math.abs(dr) === 1 && Math.abs(dc) === 1) {
            console.log('Valid: King 1-step move');
            return true;
        }
        // pretinieka gabala paņemšasna
        else if (Math.abs(dr) === 2 && Math.abs(dc) === 2) {
            const midRow = (from.row + to.row) / 2;
            const midCol = (from.col + to.col) / 2;
            const midPiece = board[midRow][midCol];
            console.log(`King jump: mid at (${midRow},${midCol}) is ${midPiece}`);
            if ((piece === 3 && (midPiece === 2 || midPiece === 4)) || (piece === 4 && (midPiece === 1 || midPiece === 3))) {
                console.log('Valid: King jump');
                return true;
            }
        }
        // Parbauda vai karalis var iet tāluma
        else if (Math.abs(dr) === Math.abs(dc) && dr !== 0 && Math.abs(dr) > 2) {
            console.log('King long move: Diagonal check passed');
            const stepRow = dr > 0 ? 1 : -1;
            const stepCol = dc > 0 ? 1 : -1;
            let currentRow = from.row + stepRow;
            let currentCol = from.col + stepCol;
            console.log(`Checking path from (${currentRow},${currentCol}) to (${to.row},${to.col})`);
            // Parbauda vai linija ir tīra
            while (currentRow !== to.row && currentCol !== to.col) {
                console.log(`Checking square (${currentRow},${currentCol}): ${board[currentRow][currentCol]}`);
                if (board[currentRow][currentCol] !== 0) {
                    console.log('Invalid: Path blocked');
                    return false;
                }
                currentRow += stepRow;
                currentCol += stepCol;
                if (currentRow < 0 || currentRow > 7 || currentCol < 0 || currentCol > 7) {
                    console.log('Out of bounds');
                    return false;
                }
            }
            console.log('King long move');
            return true;
        } else {
            console.log('King move not diagonal or too short');
        }
    } else {  // Regular pieces
        const direction = piece === 1 ? 1 : -1;  // Red down (+1), Black up (-1)
        console.log(`Regular direction: ${direction}`);
        if (dr === direction && Math.abs(dc) === 1) {
            console.log('Normal move');
            return true;
        }
        if (dr === 2 * direction && Math.abs(dc) === 2) {
            const midRow = (from.row + to.row) / 2;
            const midCol = (from.col + to.col) / 2;
            const midPiece = board[midRow][midCol];
            console.log(`Jump check mid at (${midRow},${midCol}) is ${midPiece}`);
            if ((piece === 1 && (midPiece === 2 || midPiece === 4)) || (piece === 2 && (midPiece === 1 || midPiece === 3))) {
                console.log('Valid Jump');
                return true;
            }
        }
    }

    console.log('Invalid move');
    return false;
}






// parbauda vai ir iespējams vēlviens gājiens uzreiz
function canJumpAgain(pos) {
    const piece = board[pos.row][pos.col];
    const directions = piece === 3 || piece === 4 ? [-1, 1] : [piece === 1 ? 1 : -1];  // Karaļi uz visām pusēm, parastie tikai uz vienu

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

    console.log(`Moving piece ${piece} from (${from.row},${from.col}) to (${to.row},${to.col})`);

    // Parvieto gabalu
    board[to.row][to.col] = piece;
    board[from.row][from.col] = 0;

    // Ja lec pāri tad atņem gabalu
    if (Math.abs(dr) === 2 && Math.abs(dc) === 2) {
        const midRow = (from.row + to.row) / 2;
        const midCol = (from.col + to.col) / 2;
        board[midRow][midCol] = 0;
        console.log('Captured piece at mid position');
    }

    // parasto par karali
    console.log(`Checking promotion to.row=${to.row}, piece=${piece}`);
    if (to.row === 7 && piece === 1) {
        board[to.row][to.col] = 3;
        console.log('Promoted to Red King (3)');
    } else if (to.row === 0 && piece === 2) {
        board[to.row][to.col] = 4;
        console.log('Promoted to Black King (4)');
    } else {
        console.log('No promotion');
    }
    renderBoard();
}


// Parbauda priekš uzvaras
function checkWin() {
    let red = 0, black = 0;
    for (let r of board) for (let c of r) {
        if (c === 1 || c === 3) red++;
        if (c === 2 || c === 4) black++;
    }
    if (red === 0) statusElement.textContent = "Black wins!";
    else if (black === 0) statusElement.textContent = "Red wins!";
}

// pieslēgšanās
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
        data = data.trim();  //izdēš extra linijas un tukšumus
        console.log('Login response (trimmed):', '"' + data + '"');  //Parbauda precīzo stringu
        document.getElementById('authMessage').textContent = data;
        if (data === 'Login successful') {
            console.log('Calling showGame()');  //Apstiprina ka ir mēgina ielādēt
            showGame();
        } else {
            console.log('Response did not match "Login successful"');  // nesanāca pievienoties
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        document.getElementById('authMessage').textContent = 'Login failed: ' + error.message;
    });
}
// reģistrēšanās
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
        data = data.trim();  // Trimo datus
        console.log('Signup response (trimmed):', '"' + data + '"'); // trimoti dati
        document.getElementById('authMessage').textContent = data;
        if (data === 'Signup successful') {
            console.log('Calling showGame()');  // vai mēģina ielādēt spēli
            showGame();
        } else {
            console.log('Response did not match "Signup successful"');  // nesanāca signoties up
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




function showGame(skipInit = false) {
    console.log('showGame called, skipInit:', skipInit);
    document.getElementById('auth').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    if (!skipInit) {
        initBoard();
        console.log('Board after init:', board);
    }
}



// Save
function saveGame() {
    console.log('Board before save:', board);

    // parbauda vai galds ir izveidots
    if (!Array.isArray(board) || board.length !== 8) {
        console.log('Board not initialized, calling initBoard');
        initBoard();
    }

    fetch('save_game.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({board, currentPlayer})
    })
    .then(res => res.text())
    .then(data => {
        console.log('Save response:', data);
        alert(data);
    })
    .catch(error => {
        alert('Save failed: ' + error.message);
    });
}

  


// iziet no konta
function logout() {
    fetch('logout.php')
        .then(res => res.text())
        .then(data => {
            console.log('Logout response:', data);
            showAuth();
        })
        .catch(error => console.error('Logout error:', error));
}
//load
function loadGame() {
    const selectedId = localStorage.getItem('selectedGameId');
    const url = selectedId ? `load_game.php?id=${selectedId}` : 'load_game.php';
    localStorage.removeItem('selectedGameId');
    console.log('Loading game, selectedId:', selectedId, 'URL:', url);

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.text();
        })
        .then(data => {
            console.log('Raw load response:', data);
            data = data.trim();
            if (data === 'No saved game') { // ja nau saglabāta vnk jaunu spēli ielāde fresh
                alert('No saved game found.');
                showGame();
                return;
            }
            if (data === 'Not logged in') {
                alert('Please log in first.');
                showAuth();
                return;
            }
            try {
                const parsed = JSON.parse(data);
                console.log('Parsed data:', parsed);
                const loadedBoard = JSON.parse(parsed.board);
                console.log('Loaded board:', loadedBoard);
                if (!Array.isArray(loadedBoard) || loadedBoard.length !== 8 || !Array.isArray(loadedBoard[0]) || loadedBoard[0].length !== 8) {
                    alert('Saved board is invalid. Loading fresh game.');
                    showGame();  // Fresh game
                    return;
                }
                // Parādi spēles ui bez galda veidošanas
                showGame(true);  // Izlaid galda veidošanu
                board = loadedBoard;
                currentPlayer = parseInt(parsed.current_player);
                renderBoard();
                statusElement.textContent = currentPlayer === 1 ? "Red's turn" : "Black's turn";
                alert('Game loaded!');
            } catch (e) {
                console.error('Error parsing loaded data:', e);
                alert('Failed to load game. Data corrupted.');
                showGame();  // Fallback
            }
        })
        .catch(error => {
            console.error('Load error:', error);
            alert('Load failed: ' + error.message);
        });
}





  



// Check if logged in on load
fetch('check_session.php').then(res => res.text()).then(data => {
    if (data === 'logged_in') {
        if (localStorage.getItem('selectedGameId')) {
            loadGame();  // Load the selected game
        } else {
            showGame();  // New game
        }
    } else {
        showAuth();
    }
});