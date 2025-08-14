
        let currentGrid = [];
        let solutionGrid = [];
        let selectedCell = null;
        let difficulty = 'easy';
        
        const difficultyLevels = {
            easy: 40,
            medium: 50,
            hard: 60
        };

        // Initialize the game
        function initGame() {
            createGrid();
            newGame();
            setupEventListeners();
        }

        function createGrid() {
            const grid = document.getElementById('sudoku-grid');
            grid.innerHTML = '';
            
            for (let i = 0; i < 81; i++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.index = i;
                cell.addEventListener('click', () => selectCell(i));
                grid.appendChild(cell);
            }
        }

        function setupEventListeners() {
            // Keyboard input
            document.addEventListener('keydown', handleKeyPress);
            
            // Difficulty selector
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    difficulty = e.target.dataset.difficulty;
                });
            });
        }

        function handleKeyPress(e) {
            if (!selectedCell) return;
            
            const key = e.key;
            if (key >= '1' && key <= '9') {
                const num = parseInt(key);
                const index = selectedCell.dataset.index;
                if (!selectedCell.classList.contains('given')) {
                    setCell(index, num);
                    validateMove(index, num);
                }
            } else if (key === 'Delete' || key === 'Backspace') {
                const index = selectedCell.dataset.index;
                if (!selectedCell.classList.contains('given')) {
                    setCell(index, 0);
                    selectedCell.classList.remove('error', 'correct');
                }
            }
        }

        function selectCell(index) {
            // Remove previous selection
            if (selectedCell) {
                selectedCell.classList.remove('selected');
            }
            
            // Select new cell
            const cells = document.querySelectorAll('.cell');
            selectedCell = cells[index];
            selectedCell.classList.add('selected');
        }

        function setCell(index, value) {
            const cells = document.querySelectorAll('.cell');
            currentGrid[index] = value;
            cells[index].textContent = value === 0 ? '' : value;
        }

        function newGame() {
            generatePuzzle();
            updateDisplay();
            updateStatus('');
        }

        function generatePuzzle() {
            // Create a solved grid
            currentGrid = new Array(81).fill(0);
            solutionGrid = new Array(81).fill(0);
            
            // Fill the grid with a valid solution
            solveSudoku(solutionGrid);
            
            // Copy solution to current grid
            currentGrid = [...solutionGrid];
            
            // Remove numbers based on difficulty
            const cellsToRemove = difficultyLevels[difficulty];
            const indicesToRemove = [];
            
            while (indicesToRemove.length < cellsToRemove) {
                const index = Math.floor(Math.random() * 81);
                if (!indicesToRemove.includes(index)) {
                    indicesToRemove.push(index);
                }
            }
            
            indicesToRemove.forEach(index => {
                currentGrid[index] = 0;
            });
        }

        function solveSudoku(grid) {
            const emptyCell = findEmptyCell(grid);
            if (!emptyCell) return true; // Solved
            
            const [row, col] = emptyCell;
            const index = row * 9 + col;
            
            const numbers = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
            
            for (let num of numbers) {
                if (isValidMove(grid, row, col, num)) {
                    grid[index] = num;
                    
                    if (solveSudoku(grid)) {
                        return true;
                    }
                    
                    grid[index] = 0;
                }
            }
            
            return false;
        }

        function findEmptyCell(grid) {
            for (let i = 0; i < 81; i++) {
                if (grid[i] === 0) {
                    return [Math.floor(i / 9), i % 9];
                }
            }
            return null;
        }

        function isValidMove(grid, row, col, num) {
            const index = row * 9 + col;
            
            // Check row
            for (let c = 0; c < 9; c++) {
                if (grid[row * 9 + c] === num) return false;
            }
            
            // Check column
            for (let r = 0; r < 9; r++) {
                if (grid[r * 9 + col] === num) return false;
            }
            
            // Check 3x3 box
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;
            
            for (let r = boxRow; r < boxRow + 3; r++) {
                for (let c = boxCol; c < boxCol + 3; c++) {
                    if (grid[r * 9 + c] === num) return false;
                }
            }
            
            return true;
        }

        function validateMove(index, num) {
            const row = Math.floor(index / 9);
            const col = index % 9;
            
            if (isValidMove(currentGrid.map((v, i) => i === index ? 0 : v), row, col, num)) {
                selectedCell.classList.remove('error');
                selectedCell.classList.add('correct');
                setTimeout(() => selectedCell.classList.remove('correct'), 1000);
            } else {
                selectedCell.classList.add('error');
                setTimeout(() => selectedCell.classList.remove('error'), 1000);
            }
        }

        function updateDisplay() {
            const cells = document.querySelectorAll('.cell');
            
            cells.forEach((cell, index) => {
                const value = currentGrid[index];
                cell.textContent = value === 0 ? '' : value;
                cell.classList.remove('given', 'error', 'correct', 'selected');
                
                if (value !== 0 && solutionGrid[index] !== 0 && currentGrid[index] === solutionGrid[index]) {
                    cell.classList.add('given');
                }
            });
            
            selectedCell = null;
        }

        function checkSolution() {
            let isComplete = true;
            let isValid = true;
            
            for (let i = 0; i < 81; i++) {
                if (currentGrid[i] === 0) {
                    isComplete = false;
                    break;
                }
                
                const row = Math.floor(i / 9);
                const col = i % 9;
                
                if (!isValidMove(currentGrid.map((v, idx) => idx === i ? 0 : v), row, col, currentGrid[i])) {
                    isValid = false;
                }
            }
            
            if (isComplete && isValid) {
                updateStatus('🎉 Congratulations! You solved it!', 'win-message');
            } else if (!isValid) {
                updateStatus('❌ There are errors in your solution');
            } else {
                updateStatus('⏳ Keep going! You\'re on the right track');
            }
        }

        function solvePuzzle() {
            currentGrid = [...solutionGrid];
            updateDisplay();
            updateStatus('🤖 Puzzle solved automatically!');
        }

        function clearBoard() {
            const cells = document.querySelectorAll('.cell');
            cells.forEach((cell, index) => {
                if (!cell.classList.contains('given')) {
                    currentGrid[index] = 0;
                    cell.textContent = '';
                    cell.classList.remove('error', 'correct');
                }
            });
            updateStatus('');
        }

        function updateStatus(message, className = '') {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = `status ${className}`;
        }

        // Initialize game when page loads
        document.addEventListener('DOMContentLoaded', initGame);