// Referências aos elementos do DOM
const board = document.querySelector('.ludo-board');
const diceBtn = document.getElementById('roll-dice-btn');
const diceImg = document.getElementById('dice-img');
const statusMessage = document.getElementById('status-message');

// Define a ordem dos jogadores e o jogador atual
const players = ['red', 'blue', 'green', 'yellow'];
let currentPlayerIndex = 0;
let currentPlayer = players[currentPlayerIndex];

// Define as posições do tabuleiro (caminho)
// Você pode expandir este array para incluir todas as 52 posições
const path = [
    // Posições de início e caminho para cada cor
    { id: 'red-start', type: 'start', color: 'red', pos: 0 },
    { id: 'red-1', type: 'path', pos: 1 },
    // ... adicione mais posições aqui para completar o tabuleiro
];

// Mapeia a posição de cada peça
const pawnPositions = {
    'red-1': 'home',
    'red-2': 'home',
    'red-3': 'home',
    'red-4': 'home',
    'blue-1': 'home',
    // ... adicione as outras peças
};

// Funções do Jogo

// Cria as células do tabuleiro dinamicamente
function createBoardCells() {
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            // Aqui você deve adicionar a lógica para colorir as células de caminho, seguras, etc.
            // Por exemplo, if (i === 6 && j > 0 && j < 6) { cell.classList.add('red', 'path-cell'); }
            
            board.appendChild(cell);
        }
    }

    // Coloca o centro
    const center = document.createElement('div');
    center.classList.add('center');
    board.appendChild(center);
}

// Lança o dado
function rollDice() {
    // Desativa o botão enquanto o dado "rola"
    diceBtn.disabled = true;
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        const randomNumber = Math.floor(Math.random() * 6) + 1;
        diceImg.src = `dice/dice-${randomNumber}.png`;
        rollCount++;
        if (rollCount > 10) { // Simula uma "rolagem" de 10 quadros
            clearInterval(rollInterval);
            diceBtn.disabled = false;
            handlePlayerTurn(randomNumber);
        }
    }, 100);
}

// Lida com o turno do jogador
function handlePlayerTurn(diceRoll) {
    statusMessage.textContent = `O jogador ${currentPlayer} tirou ${diceRoll}.`;
    
    // TODO: Adicione a lógica de movimento aqui
    // 1. Verifique se o jogador pode mover uma peça
    // 2. Se o dado for 6, a peça pode sair da base
    // 3. Se houver mais de uma peça que pode ser movida, o jogador deve clicar para escolher
    // 4. Mova a peça e atualize a posição no array pawnPositions
    // 5. Verifique por colisões (se a peça pode "comer" outra)
    // 6. Passe para o próximo jogador, a menos que o dado seja 6

    // Mude para o próximo jogador
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    currentPlayer = players[currentPlayerIndex];
    statusMessage.textContent += ` Vez do jogador ${currentPlayer}.`;
}

// Event Listeners
diceBtn.addEventListener('click', rollDice);

// Inicialização do Jogo
window.onload = () => {
    createBoardCells();
    statusMessage.textContent = `Vez do jogador ${currentPlayer}.`;
};