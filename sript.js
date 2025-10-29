// --- Elementos do DOM ---
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const startGameButton = document.getElementById('startGameButton');
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
let cardValues = {}; // Mapeamento de tema para ícones
let cardsArray = [];
let cardsFlipped = [];
let matchedPairs = 0;
let totalPairs = 0;
let moves = 0;
let timerInterval;
let startTime;
let lockBoard = false; // Impede cliques enquanto 2 cartas estão viradas

// --- Definição de Ícones/Valores ---
const ICON_MAP = {
    disney: ['🐭', '❄️', '🦁', '🧜‍♀️', '👑', '🐘', '🧞‍♂️', '🐻', '🐶', '🐈', '🐝', '🦊', '🐸', '🦉', '🦄', '🐲', '🐞', '🦆', '🦢', '🦩', '🦒', '🦓', '🐒', '🦋', '🐢', '🦖', '🦈', '🐳', '🦀', '🦂', '🕸️', '🕷️'],
    animals: ['🦁', '🐘', '🐬', '🐒', '🦒', '🐅', '🦓', '🐼', '🐻', '🐺', '🦊', '🐱', '🐶', '🐰', '🐭', '🐸', '🦉', '🦅', '🦆', '🦋', '🐝', '🐜', '🐞', '🐠', '🐳', '🦈', '🐙', '🦀', '🐍', '🐢', '🐊', '🦎'],
    pokemon: ['⚡', '🔥', '🌱', '💧', '✨', '💀', '🎈', '👻', '🍦', '🍩', '🍔', '🍟', '🍕', '🍣', '🍤', '🍜', '🍚', '🍙', '🍘', '🍠', '🍢', '🍡', '🍧', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒'],
    fruits: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍍', '🥝', '🥑', '🥥', '🥭', '🍑', '🫐', '🍈', '🍏', '🌶️', '🥦', '🥕', '🥔', '🧅', '🌽', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥞'],
    food: ['🍕', '🍔', '🍟', '🍣', '🍩', '🍦', '🍜', '🌮', '🥪', '🍳', '🥓', '🍗', '🍖', '🍤', '🍚', '🍞', '🍰', '🍪', '🍫', '🍬', '☕', '🥤', '🍺', '🍷', '🍶', '🍼', '🥛', '🍯', '🧂', '🌶️', '🍄', '🥒']
};

// --- Funções Auxiliares ---

/**
 * Embaralha um array
 * @param {Array} array
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Formata o tempo (segundos) para MM:SS
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// --- Funções do Jogo ---

/**
 * Inicializa e exibe a grade do jogo.
 */
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
    cardsArray = [...availableIcons, ...availableIcons]; // Cria os pares
    shuffle(cardsArray);

    // 3. Configurar a grade CSS para responsividade
    gameBoard.style.gridTemplateColumns = `repeat(${difficulty}, 1fr)`;
    // Ajuste o tamanho das cartas baseado na dificuldade (exemplo)
    const cardSize = difficulty === 8 ? '70px' : difficulty === 6 ? '85px' : '100px';
    // O JavaScript não precisa mudar o CSS das cartas a cada vez se o CSS for bem escrito.

    // 4. Injetar HTML das cartas
    gameBoard.innerHTML = ''; // Limpa o tabuleiro
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

/**
 * Atualiza o contador de tempo.
 */
function updateTimer() {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = formatTime(elapsedSeconds);
}

/**
 * Lógica para virar uma carta e checar o par.
 * @param {Event} event
 */
function flipCard(event) {
    const clickedCard = event.currentTarget;

    // Se já estiver travado, já combinada, ou já virada, ignora o clique
    if (lockBoard || clickedCard.classList.contains('matched') || clickedCard.classList.contains('flipped')) {
        return;
    }

    clickedCard.classList.add('flipped');
    cardsFlipped.push(clickedCard);

    // Checa se é a segunda carta
    if (cardsFlipped.length === 2) {
        moves++;
        movesCounter.textContent = moves;
        lockBoard = true;
        
        checkForMatch();
    }
}

/**
 * Checa se as duas cartas viradas são um par.
 */
function checkForMatch() {
    const [card1, card2] = cardsFlipped;
    const isMatch = card1.dataset.value === card2.dataset.value;

    isMatch ? disableCards() : unflipCards();
}

/**
 * Ação de Acerto: Mantém as cartas viradas (desabilitadas).
 */
function disableCards() {
    cardsFlipped.forEach(card => {
        card.classList.add('matched');
        card.removeEventListener('click', flipCard); // Opcional, para garantir
    });
    
    matchedPairs++;
    resetBoard();
    
    // Checa se o jogo terminou
    if (matchedPairs === totalPairs) {
        endGame();
    }
}

/**
 * Ação de Erro: Vira as cartas para baixo novamente.
 */
function unflipCards() {
    setTimeout(() => {
        cardsFlipped.forEach(card => card.classList.remove('flipped'));
        resetBoard();
    }, 1000); // 1 segundo de atraso
}

/**
 * Reinicia as variáveis de controle da rodada.
 */
function resetBoard() {
    cardsFlipped = [];
    lockBoard = false;
}

/**
 * Finaliza o jogo e exibe a tela de resultados.
 */
function endGame() {
    clearInterval(timerInterval);
    
    const finalTime = timerDisplay.textContent;

    finalTimeDisplay.textContent = finalTime;
    finalMovesDisplay.textContent = moves;

    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

// --- Event Listeners ---
startGameButton.addEventListener('click', initializeGame);
restartGameButton.addEventListener('click', () => {
    endScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
});

// Inicializa a tela do menu ao carregar
document.addEventListener('DOMContentLoaded', () => {
    gameScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
});