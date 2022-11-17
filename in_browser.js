class GameState {
    constructor(opponentCount, myHand, commCards) {
        this.opponentCount = opponentCount ?? 1;
        this.myHand = myHand ?? [];
        this.commCards = commCards ?? [];
    }
    opponentCount;
    myHand;
    commCards;
}

var gameState = new GameState();

var statsBox = createBox('left');
var stateBox = createBox('right');
var foldButton = createButton();

console.clear();
console.defaultInfo = console.info.bind(console);
console.defaultLog = console.log.bind(console);
console.info = handleAction;

async function handleAction() {
    let rawAction = Array.from(arguments).join(' ');
    if (isAnyGameActivity(rawAction)) {
        if (isFirstDeal(rawAction)) {
            resetGameState();
            let playerHands = getActionJSON(rawAction);
            setPlayerCount(playerHands.length);
            let player = findPlayerHand(playerHands);
            setPlayerHand(player);

        }
        else if (isCommDeal(rawAction)) {
            let newCards = getActionJSON(rawAction);
            addCommunityCards(newCards);
        }
        if (isPlaying()) {
            let stats = await fetchStats();
            updateStatsBox(stats);
        }
    }
    else {
        return;
    }
}

async function fetchStats() {
    let res = await fetch('http://127.0.0.1:8081/chances/', {
        method: 'POST',
        body: JSON.stringify(gameState),
        headers: {
            'Accept': '*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
    });
    let json = await res.json();
    return json;
}

function alertStats(json) {
    alert('Win: ' + json.winChance + '\n' + 'Lose: ' + json.loseChance + '\n' + 'Tie: ' + json.tieChance);
}


function isFirstDeal(log) {
    return log.includes('Hole cards');
}

function isCommDeal(log) {
    return log.includes('Community cards');
}

function isAnyGameActivity(log) {
    return isFirstDeal(log) || isCommDeal(log);
}

function getActionJSON(rawAction) {
    return Array.from(JSON.parse(rawAction.split('): ')[1]));
}

function findPlayerHand(playerHands) {
    let playersHand = playerHands.filter(x => x.cards[0] != 'X');
    if (playersHand.length == 0) return null;
    return playersHand[0];
}

function resetGameState() {
    gameState = new GameState(
        0,
        [],
        [],
    );
    console.clear();
    print('Reset game state');
}

function setPlayerCount(playerCount) {
    gameState.opponentCount = playerCount - 1;
    print('Changed player count');
}

function addCommunityCards(newCards) {
    gameState.commCards = gameState.commCards.concat(newCards);
    print('Added community cards');
}

async function foldPlayer() {
    if (gameState.opponentCount > 1) {
        gameState.opponentCount--;
        if (isPlaying()) {
            let stats = await fetchStats();
            updateStatsBox(stats);
        }
    }
    print('Folded player');
}

function setPlayerHand(player) {
    if (player) {
        gameState.myHand = Array.from(player.cards);
        print('Set player hand');
    } else {
        print('Player is not playing');
    }
}

function isPlaying() {
    return gameState.myHand.length != 0;
}

function print(action) {
    console.warn(action + ': ' + JSON.stringify(gameState));
    updateStateBox();
}

function createBox(alignment) {
    let gameBoard = document.querySelector("#root > div > div.Game.Game--holdem");
    let newBox = document.createElement('div');
    let initialText = document.createTextNode('Game about to start...');
    newBox.style.display = 'flex';
    newBox.style.flexDirection = 'column';
    newBox.style.position = 'absolute';
    newBox.style.top = 0;
    if (alignment == 'left') {
        newBox.style.left = 0;
    } else if (alignment == 'right') {
        newBox.style.right = 0;
    }
    newBox.style.fontSize = '30px';
    newBox.style.padding = '50px';
    newBox.style.alignItems = 'center';
    newBox.style.justifyContent = 'space-evenly';
    newBox.appendChild(initialText);
    return gameBoard.appendChild(newBox);
}

function createSpan(text, color) {
    let newSpan = document.createElement('span');
    let newText = document.createTextNode(text);
    newSpan.style.color = color;
    newSpan.appendChild(newText);
    return newSpan;
}

function createButton() {
    let newButton = document.createElement('button');
    let newText = createSpan('Fold player', '#ffffff');
    newButton.appendChild(newText);
    newButton.addEventListener('click', (e) => {
        foldPlayer();
    });
    newButton.style.fontWeight = 'inherit';
    newButton.style.fontStyle = 'inherit';
    newButton.style.fontFamily = 'inherit';
    newButton.style.lineHeight = '1.15';
    newButton.style.overflow = 'visible';
    newButton.style.textTransform = 'none';
    newButton.style.boxSizing = 'inherit';
    newButton.style.boxShadow = '0 .1rem .1rem rgba(0,0,0,.45)';
    newButton.style.display = 'inline-block';
    newButton.style.padding = '1rem';
    newButton.style.margin = '0';
    newButton.style.outline = '0';
    newButton.style.border = '0';
    newButton.style.cursor = 'pointer';
    newButton.style.background = 'linear-gradient(180deg,#f17254,#cf4221 70%)';
    newButton.style.borderRadius = '3rem';
    newButton.style.height = '3rem';
    newButton.style.verticalAlign = 'middle';
    newButton.style.width = '70%';
    newButton.style.minWidth = '17rem';
    newButton.style.fontSize = '13px'
    return newButton;
}

function updateStatsBox(chances) {
    let winSpan = createSpan('Win chance: ' + toTwoDecimals(chances.winChance) + '%', '#22ff22');
    let loseSpan = createSpan('Lose chance: ' + toTwoDecimals(chances.loseChance) + '%', '#ff2222');
    let tieSpan = createSpan('Tie chance: ' + toTwoDecimals(chances.tieChance) + '%', '#333333');

    statsBox.replaceChildren(winSpan, loseSpan, tieSpan, foldButton);
}

function updateStateBox() {
    let opponentCountSpan = createSpan('Opponent count: ' + gameState.opponentCount);
    let myHandSpan = createSpan('My hand: ' + gameState.myHand);
    let commCardsSpan = createSpan('Community cards: ' + gameState.commCards);

    stateBox.replaceChildren(opponentCountSpan, myHandSpan, commCardsSpan);
}

function toTwoDecimals(double) {
    return (Math.round(double * 100) / 100).toFixed(2);
}
