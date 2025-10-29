document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // ATENÇÃO: TODO O CÓDIGO DO JAVASCRIPT DEVE ESTAR AQUI DENTRO!
    // -------------------------------------------------------------

    // --- Elementos do DOM --- (Verifique se os IDs estão corretos no HTML!)
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const startGameButton = document.getElementById('startGameButton'); // ID CRÍTICO
    const restartGameButton = document.getElementById('restartGameButton');
    const gameBoard = document.getElementById('game-board');
    const difficultySelect = document.getElementById('difficulty');
    const themeSelect = document.getElementById('theme');
    const movesCounter = document.getElementById('moves-counter');
    const timerDisplay = document.getElementById('timer');
    const finalTimeDisplay = document.getElementById('final-time');
    const finalMovesDisplay = document.getElementById('final-moves');

    // --- Variáveis Globais de Estado do Jogo ---
    let difficulty = 4; // 4x4 padrão
    let theme = 'disney';
    let cardValues = {}; 
    let cardsArray = [];
    let cardsFlipped = [];
    let matchedPairs = 0;
    let totalPairs = 0;
    let moves = 0;
    let timerInterval;
    let startTime;
    let lockBoard = false; 

    // --- Definição de Ícones/Valores ---
    const ICON_MAP = {
        disney: ['🐭', '❄️', '🦁', '🧜‍♀️', '👑', '🐘', '🧞‍♂️', '🐻', '🐶', '🐈', '🐝', '🦊', '🐸', '🦉', '🦄', '🐲', '🐞', '🦆', '🦢', '🦩', '🦒', '🦓', '🐒', '🦋', '🐢', '🦖', '🦈', '🐳', '🦀', '🦂', '🕸️', '🕷️'],
        animals: ['🦁', '🐘', '🐬', '🐒', '🦒', '🐅', '🦓', '🐼', '🐻', '🐺', '🦊', '🐱', '🐶', '🐰', '🐭', '🐸', '🦉', '🦅', '🦆', '🦋', '🐝', '🐜', '🐞', '🐠', '🐳', '🦈', '🐙', '🦀', '🐍', '🐢', '🐊', '🦎'],
        pokemon: ['⚡', '🔥', '🌱', '💧', '✨', '💀', '🎈', '👻', '🍦', '🍩', '🍔', '🍟', '🍕', '🍣', '🍤', '🍜', '🍚', '🍙', '🍘', '🍠', '🍢', '🍡', '🍧', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒'],
        fruits: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍍', '🥝', '🥑', '🥥', '🥭', '🍑', '🫐', '🍈', '🍏', '🌶️', '🥦', '🥕', '🥔', '🧅', '🌽', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥞'],
        food: ['🍕', '🍔', '🍟', '🍣', '🍩', '🍦', '🍜', '🌮', '🥪', '🍳', '🥓', '🍗', '🍖', '🍤', '🍚', '🍞', '🍰', '🍪', '🍫', '🍬', '☕', '🥤', '🍺', '🍷', '🍶', '🍼', '🥛', '🍯', '🧂', '🌶️', '🍄', '🥒']
    };

    // --- Funções Auxiliares ---
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // --- Funções do Jogo ---
    function initializeGame() {
        // 1. Configurar variáveis
        difficulty = parseInt(difficultySelect.value);
        theme = themeSelect.value;
        const gridSize = difficulty * difficulty; // Total de cartas
        totalPairs = gridSize / 2;
        moves = 0;
        matchedPairs = 0;
        cardsFlipped = [];
        lockBoard = false;
        movesCounter.textContent = moves;

        // 2. Gerar e embaralhar as cartas
        const availableIcons = ICON_MAP[theme].slice(0, totalPairs);
        cardsArray = [...availableIcons, ...availableIcons]; 
        shuffle(cardsArray);

        // 3. Configurar a grade CSS para responsividade
        gameBoard.style.gridTemplateColumns = `repeat(${difficulty}, 1fr)`;

        // 4. Injetar HTML das cartas
        gameBoard.innerHTML = ''; 
        cardsArray.forEach((value, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.value = value;
            cardElement.dataset.index = index;
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">${value}</div>
                    <div class="card-back"></div>
                </div>
            `;
            cardElement.addEventListener('click', flipCard);
            gameBoard.appendChild(cardElement);
        });

        // 5. Iniciar Timer
        clearInterval(timerInterval);
        startTime = Date.now();
        timerDisplay.textContent = '00:00';
        timerInterval = setInterval(updateTimer, 1000);

        // 6. Transição de tela
        menuScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        endScreen.classList.add('hidden');
    }

    function updateTimer() {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        timerDisplay.textContent = formatTime(elapsedSeconds);
    }

    function flipCard(event) {
        const clickedCard = event.currentTarget;

        if (lockBoard || clickedCard.classList.contains('matched') || clickedCard.classList.contains('flipped')) {
            return;
        }

        clickedCard.classList.add('flipped');
        cardsFlipped.push(clickedCard);

        if (cardsFlipped.length === 2) {
            moves++;
            movesCounter.textContent = moves;
            lockBoard = true;
            
            checkForMatch();
        }
    }

    function checkForMatch() {
        const [card1, card2] = cardsFlipped;
        const isMatch = card1.dataset.value === card2.dataset.value;

        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        cardsFlipped.forEach(card => {
            card.classList.add('matched');
            card.removeEventListener('click', flipCard); 
        });
        
        matchedPairs++;
        resetBoard();
        
        if (matchedPairs === totalPairs) {
            endGame();
        }
    }

    function unflipCards() {
        setTimeout(() => {
            cardsFlipped.forEach(card => card.classList.remove('flipped'));
            resetBoard();
        }, 1000); 
    }

    function resetBoard() {
        cardsFlipped = [];
        lockBoard = false;
    }

    function endGame() {
        clearInterval(timerInterval);
        
        const finalTime = timerDisplay.textContent;

        finalTimeDisplay.textContent = finalTime;
        finalMovesDisplay.textContent = moves;

        gameScreen.classList.add('hidden');
        endScreen.classList.remove('hidden');
    }


    // --- 🚨 VERIFICAR ESTA SEÇÃO! 🚨 ---

    // 1. ANTES de adicionar o Listener, GARANTA que o botão existe:
    if (startGameButton) {
        // 2. Adicionar o Listener
        startGameButton.addEventListener('click', initializeGame);
    } else {
        console.error("ERRO: O elemento #startGameButton não foi encontrado no HTML!");
    }
    
    // Listener de Reiniciar (para quando o jogo terminar)
    if (restartGameButton) {
        restartGameButton.addEventListener('click', () => {
            endScreen.classList.add('hidden');
            menuScreen.classList.remove('hidden');
        });
    }


    // Garante que apenas o menu inicial está visível ao carregar a página
    gameScreen.classList.add('hidden');
    endScreen.classList.add('hidden');

// -------------------------------------------------------------
});