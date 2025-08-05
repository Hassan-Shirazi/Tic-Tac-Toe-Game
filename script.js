    // --- DOM Element Selection ---
        const statusDisplay = document.querySelector('#status-display');
        const cells = document.querySelectorAll('.cell');
        const restartButton = document.querySelector('#restart-button');
        const body = document.body;

        // --- Game State Variables ---
        let gameActive = true;
        let currentPlayer = "X"; // Player always starts as X
        let gameState = ["", "", "", "", "", "", "", "", ""];

        // --- Winning Conditions ---
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]  // Diagonals
        ];

        // --- Messages ---
        const winningMessage = () => `Player ${currentPlayer} has won!`;
        const drawMessage = () => `Game ended in a draw!`;
        const currentPlayerTurn = () => `Your turn (X)`;

        // --- Initial Game Setup ---
        statusDisplay.innerHTML = currentPlayerTurn();

        // --- Game Logic Functions ---

        function handleCellPlayed(clickedCell, clickedCellIndex) {
            gameState[clickedCellIndex] = currentPlayer;
            clickedCell.innerHTML = currentPlayer;
            clickedCell.classList.add(currentPlayer.toLowerCase());
        }

        function handlePlayerChange() {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            if (gameActive) {
                if (currentPlayer === 'O') {
                    statusDisplay.innerHTML = "Computer's turn (O)";
                    body.classList.add('computer-turn');
                    // Computer makes a move after a short delay for better UX
                    setTimeout(computerMove, 700);
                } else {
                    statusDisplay.innerHTML = currentPlayerTurn();
                    body.classList.remove('computer-turn');
                }
            }
        }

        function checkWinOrDraw() {
            let roundWon = false;
            let winner = null;

            for (let i = 0; i < winningConditions.length; i++) {
                const winCondition = winningConditions[i];
                const a = gameState[winCondition[0]];
                const b = gameState[winCondition[1]];
                const c = gameState[winCondition[2]];
                if (a === '' || b === '' || c === '') continue;
                if (a === b && b === c) {
                    roundWon = true;
                    winner = a;
                    break;
                }
            }

            if (roundWon) {
                winCondition.forEach(index => {
                    document.querySelector(`[data-cell-index="${index}"]`).style.backgroundColor = "#b7e4c7";
                    document.querySelector(`[data-cell-index="${index}"]`).style.boxShadow = "0 0 10px #06d6a0";
                });

                statusDisplay.innerHTML = winner === 'X' ? 'You won!' : 'Computer has won!';
                gameActive = false;
                body.classList.remove('computer-turn');
                return true;
            }

            const roundDraw = !gameState.includes("");
            if (roundDraw) {
                statusDisplay.innerHTML = drawMessage();
                gameActive = false;
                body.classList.remove('computer-turn');
                return true;
            }
            return false;
        }

        function handleCellClick(clickedCellEvent) {
            const clickedCell = clickedCellEvent.target;
            const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

            // Only allow player to click on their turn, on an empty cell, while the game is active
            if (gameState[clickedCellIndex] !== "" || !gameActive || currentPlayer === 'O') {
                return;
            }

            handleCellPlayed(clickedCell, clickedCellIndex);
            if (!checkWinOrDraw()) {
                handlePlayerChange();
            }
        }

        function handleRestartGame() {
            gameActive = true;
            currentPlayer = "X";
            gameState = ["", "", "", "", "", "", "", "", ""];
            statusDisplay.innerHTML = currentPlayerTurn();
            cells.forEach(cell => {
                cell.innerHTML = "";
                cell.classList.remove('x', 'o');
            });
            body.classList.remove('computer-turn');
        }

        // --- Computer AI Logic ---
        function computerMove() {
            if (!gameActive) return;

            const bestMoveIndex = findBestMove();
            const cellToPlay = document.querySelector(`[data-cell-index='${bestMoveIndex}']`);
            
            handleCellPlayed(cellToPlay, bestMoveIndex);
            if (!checkWinOrDraw()) {
                handlePlayerChange();
            }
        }

        function findBestMove() {
            // 1. AI: Check if computer can win in the next move
            for (let i = 0; i < gameState.length; i++) {
                if (gameState[i] === "") {
                    gameState[i] = "O"; // Try the move
                    if (isWinner("O")) {
                        gameState[i] = ""; // Reset the board
                        return i;
                    }
                    gameState[i] = ""; // Reset
                }
            }

            // 2. AI: Check if player can win in the next move, and block them
            for (let i = 0; i < gameState.length; i++) {
                if (gameState[i] === "") {
                    gameState[i] = "X"; // Try the move for the player
                    if (isWinner("X")) {
                        gameState[i] = ""; // Reset
                        return i; // Block this move
                    }
                    gameState[i] = ""; // Reset
                }
            }
            
            // 3. AI: Strategy - take the center if available
            const centerIndex = 4;
            if (gameState[centerIndex] === "") return centerIndex;

            // 4. AI: Strategy - take one of the corners
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(i => gameState[i] === "");
            if (availableCorners.length > 0) {
                return availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
            
            // 5. AI: Strategy - take any available side
            const sides = [1, 3, 5, 7];
            const availableSides = sides.filter(i => gameState[i] === "");
            if (availableSides.length > 0) {
                return availableSides[Math.floor(Math.random() * availableSides.length)];
            }
            
            // This part should technically not be reached if there are empty cells
            return gameState.findIndex(cell => cell === "");
        }
        
        // Helper function for the AI to check for a winner without changing game state
        function isWinner(player) {
            for (const condition of winningConditions) {
                if (condition.every(index => gameState[index] === player)) {
                    return true;
                }
            }
            return false;
        }

        // --- Event Listeners ---
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        restartButton.addEventListener('click', handleRestartGame);