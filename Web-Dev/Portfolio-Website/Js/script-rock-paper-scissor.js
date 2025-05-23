document.addEventListener('DOMContentLoaded', function() {
    // Game variables
    let totalRounds = 5;
    let currentRound = 1;
    let playerScore = 0;
    let computerScore = 0;
    let isGameActive = false;
    
    // DOM Elements
    const setupScreen = document.querySelector('.setup-screen');
    const gameScreen = document.querySelector('.game-screen');
    const endScreen = document.getElementById('end-screen');
    const roundsSlider = document.getElementById('rounds-slider');
    const roundsDisplay = document.getElementById('rounds-display');
    const startButton = document.getElementById('start-game');
    const playerScoreDisplay = document.getElementById('player-score');
    const computerScoreDisplay = document.getElementById('computer-score');
    const roundText = document.getElementById('round-text');
    const controlButtons = document.querySelectorAll('.control-button');
    const playerHandImg = document.getElementById('player-hand');
    const computerHandImg = document.getElementById('computer-hand');
    const battleStatus = document.getElementById('battle-status');
    const finalScoreDisplay = document.getElementById('final-score');
    const resultMessage = document.getElementById('result-message');
    const playAgainButton = document.getElementById('play-again');
    
    // Hand Images
    const handImages = {
        rock: 'https://cdn2.iconfinder.com/data/icons/hand-gestures-glyph/100/hand_gestures6glyph-04-512.png',
        paper: 'https://cdn-icons-png.flaticon.com/512/2541/2541988.png',
        scissors: 'https://cdn-icons-png.flaticon.com/512/10363/10363577.png'
    };
    
    // Initialize setup
    roundsSlider.addEventListener('input', function() {
        totalRounds = parseInt(this.value);
        roundsDisplay.textContent = totalRounds;
    });
    
    // Start game button
    startButton.addEventListener('click', function() {
        setupScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        currentRound = 1;
        playerScore = 0;
        computerScore = 0;
        updateScoreDisplay();
        updateRoundText();
        isGameActive = true;
        
        // Set initial hand images
        playerHandImg.src = handImages.rock;
        computerHandImg.src = handImages.rock;
    });
    
    // Play again button
    playAgainButton.addEventListener('click', function() {
        endScreen.style.display = 'none';
        setupScreen.style.display = 'block';
        gameScreen.style.display = 'none';
    });
    
    // Game controls
    controlButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!isGameActive) return;
            
            const playerChoice = this.getAttribute('data-choice');
            playRound(playerChoice);
        });
    });
    
    // Play a round
    function playRound(playerChoice) {
        // Disable controls temporarily
        isGameActive = false;
        
        // Get computer choice
        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        
        // Animation setup
        playerHandImg.classList.add('shake');
        computerHandImg.classList.add('shake');
        
        setTimeout(() => {
            // Remove shake animation
            playerHandImg.classList.remove('shake');
            computerHandImg.classList.remove('shake');
            
            // Update hand images
            playerHandImg.src = handImages[playerChoice];
            computerHandImg.src = handImages[computerChoice];
            
            // Determine winner
            const result = getWinner(playerChoice, computerChoice);
            showResult(result);
            
            // Update score
            if (result === 'win') {
                playerScore++;
                playerHandImg.classList.add('winner-animation');
                setTimeout(() => {
                    playerHandImg.classList.remove('winner-animation');
                }, 500);
            } else if (result === 'lose') {
                computerScore++;
                computerHandImg.classList.add('winner-animation');
                setTimeout(() => {
                    computerHandImg.classList.remove('winner-animation');
                }, 500);
            }
            
            updateScoreDisplay();
            
            // Check if game is over
            if (currentRound >= totalRounds) {
                setTimeout(endGame, 1500);
            } else {
                currentRound++;
                updateRoundText();
                
                // Re-enable controls after a delay
                setTimeout(() => {
                    isGameActive = true;
                    battleStatus.style.opacity = 0;
                }, 1200);
            }
        }, 500);
    }
    
    // Determine winner
    function getWinner(player, computer) {
        if (player === computer) return 'tie';
        
        if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) {
            return 'win';
        }
        
        return 'lose';
    }
    
    // Show round result
    function showResult(result) {
        battleStatus.style.opacity = 1;
        
        switch(result) {
            case 'win':
                battleStatus.textContent = 'You Win!';
                battleStatus.style.color = '#4ecca3';
                break;
            case 'lose':
                battleStatus.textContent = 'You Lose!';
                battleStatus.style.color = '#e94560';
                break;
            case 'tie':
                battleStatus.textContent = 'Tie!';
                battleStatus.style.color = '#fff';
                break;
        }
    }
    
    // Update score display
    function updateScoreDisplay() {
        playerScoreDisplay.textContent = playerScore;
        computerScoreDisplay.textContent = computerScore;
    }
    
    // Update round text
    function updateRoundText() {
        roundText.textContent = `Round ${currentRound} of ${totalRounds}`;
    }
    
    // End game
    function endGame() {
        gameScreen.style.display = 'none';
        endScreen.style.display = 'block';
        
        finalScoreDisplay.textContent = `You: ${playerScore} - Computer: ${computerScore}`;
        
        if (playerScore > computerScore) {
            resultMessage.textContent = 'You Won the Game!';
            resultMessage.style.color = '#4ecca3';
        } else if (computerScore > playerScore) {
            resultMessage.textContent = 'Computer Won the Game!';
            resultMessage.style.color = '#e94560';
        } else {
            resultMessage.textContent = "It's a Tie!";
            resultMessage.style.color = '#fff';
        }
    }
});