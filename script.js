const gameBoard = document.getElementById("gameBoard");
const cells = document.querySelectorAll(".cell");
const statusDisplay = document.getElementById("status");
const restartButton = document.getElementById("restartButton");
const playerVsPlayerButton = document.getElementById("playerVsPlayer");
const playerVsComputerButton = document.getElementById("playerVsComputer");
const difficultyOptions = document.getElementById("difficultyOptions");
let currentPlayer = "X";
let gameActive = false;
let gameMode = "";
let difficultyLevel = "";

// Winning combinations
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// Start the game mode selection
playerVsPlayerButton.addEventListener("click", () => {
    gameMode = "PvP";
    startGame();
});

playerVsComputerButton.addEventListener("click", () => {
    gameMode = "PvC";
    difficultyOptions.style.display = "block";
});

// Select difficulty level
document.querySelectorAll(".difficulty").forEach(button => {
    button.addEventListener("click", (e) => {
        difficultyLevel = e.target.getAttribute("data-level");
        startGame();
    });
});

// Start the game
function startGame() {
    gameActive = true;
    gameBoard.style.display = "grid";
    restartButton.style.display = "block";
    statusDisplay.innerHTML = `Current Player: ${currentPlayer}`;
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove("cell-clicked");
        cell.addEventListener("click", handleCellClick, { once: true });
    });
    difficultyOptions.style.display = "none"; // Hide difficulty options after selection

    if (gameMode === "PvC" && currentPlayer === "O") {
        setTimeout(computerPlay, 500); // Delay computer's turn
    }
}

// Handle cell click
function handleCellClick(event) {
    const cell = event.target;
    const index = cell.getAttribute("data-index");
    cell.innerHTML = currentPlayer;
    cell.classList.add("cell-clicked");
    checkResult();
    
    if (gameMode === "PvC" && gameActive) {
        setTimeout(computerPlay, 500); // Delay computer's turn
    }
}

// Check result of the game
function checkResult() {
    let roundWon = false;
    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (cells[a].innerHTML === currentPlayer && 
            cells[b].innerHTML === currentPlayer && 
            cells[c].innerHTML === currentPlayer) {
            roundWon = true;
            break;
        }
    }
    if (roundWon) {
        statusDisplay.innerHTML = `${currentPlayer} Wins!`;
        gameActive = false;
        return;
    }
    if ([...cells].every(cell => cell.innerHTML)) {
        statusDisplay.innerHTML = "It's a Tie!";
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDisplay.innerHTML = `Current Player: ${currentPlayer}`;
    }
}

// Computer's turn
function computerPlay() {
    if (!gameActive) return;

    let availableCells = [...cells].filter(cell => !cell.innerHTML);
    let move;

    if (difficultyLevel === "easy") {
        move = availableCells[Math.floor(Math.random() * availableCells.length)];
    } else if (difficultyLevel === "medium") {
        move = getMediumMove(availableCells);
    } else {
        move = getBestMove(); // Hard level
    }

    // Make the computer's move
    move.innerHTML = currentPlayer;
    move.classList.add("cell-clicked");
    checkResult();
}

// Get a move for medium difficulty
function getMediumMove(availableCells) {
    // Check for winning move
    for (let cell of availableCells) {
        cell.innerHTML = "O"; // Use computer's symbol
        if (checkWinningCondition("O")) {
            cell.innerHTML = "O"; // Make the move
            return cell;
        }
        cell.innerHTML = ""; // Reset cell
    }

    // Block player's winning move
    for (let cell of availableCells) {
        cell.innerHTML = "X"; // Use opponent's symbol
        if (checkWinningCondition("X")) {
            cell.innerHTML = "O"; // Block the move
            return cell;
        }
        cell.innerHTML = ""; // Reset cell
    }

    // Random move if no winning or blocking move is available
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}

// Check winning condition
function checkWinningCondition(symbol) {
    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (cells[a].innerHTML === symbol && 
            cells[b].innerHTML === symbol && 
            cells[c].innerHTML === symbol) {
            return true;
        }
    }
    return false;
}

// Get best move for hard difficulty (minimax algorithm)
function getBestMove() {
    let bestScore = -Infinity;
    let move;

    for (let cell of cells) {
        if (!cell.innerHTML) {
            cell.innerHTML = "O"; // Use computer's symbol
            let score = minimax(cells, 0, false);
            cell.innerHTML = ""; // Reset cell
            if (score > bestScore) {
                bestScore = score;
                move = cell;
            }
        }
    }
    return move;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    if (checkWinningCondition("O")) return 1; // Computer wins
    if (checkWinningCondition("X")) return -1; // Player wins
    if ([...board].every(cell => cell.innerHTML)) return 0; // Tie

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let cell of board) {
            if (!cell.innerHTML) {
                cell.innerHTML = "O"; // Use computer's symbol
                let score = minimax(board, depth + 1, false);
                cell.innerHTML = ""; // Reset cell
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let cell of board) {
            if (!cell.innerHTML) {
                cell.innerHTML = "X"; // Use player's symbol
                let score = minimax(board, depth + 1, true);
                cell.innerHTML = ""; // Reset cell
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Restart game
restartButton.addEventListener("click", startGame);
