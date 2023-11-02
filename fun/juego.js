const canvas = document.querySelector('#juego');
const juego = canvas.getContext('2d');
const firstScreen = document.querySelector('.play');
const startBtn = document.querySelector('.first_btn');
const gameMessages = document.querySelector('.info_juego');
const characterSelector = document.querySelector('.characters');

window.addEventListener('load', empezarJuego);

startBtn.addEventListener('click', setCanvasSize);
const emojis = {
    '-': ' ',
    'O': '🚪',
    'X': '💣',
    'I': '🎁',
    'PLAYER': '',
    'HEART': '❤️',
  };


function pickCharacter() {
    const character = ['🐶', '🐻‍❄️', '🐵', '🐔', '👻', '💀', '👽'];
  
    character.forEach((char) => {
      const selection = document.createElement('div');
      selection.innerHTML = char;
      characterSelector.appendChild(selection);
  
      selection.addEventListener('click', () => {
        const selectedCharacter = document.querySelectorAll('.characters div.selected');
        selectedCharacter.forEach((p) => {
          p.classList.remove('selected');
        });
  
        selection.classList.add('selected');
        emojis.PLAYER = selection.innerHTML;
        console.log(emojis.PLAYER);
      });
    });
  }
  
pickCharacter();



let playerPosition = {
    x: 0,
    y: 0
}

let winPosition = {
    x: 0,
    y: 0
}

let bombsPositions = [];


let canvasSize;

let elementsSize;

let levelGame = 0;

let lives = 3;

let movementsGame = 0;

//Mapas
const maps = [];

    maps.push(`
    IXXXXXXXXX
    -XXXXXXXXX
    -XXXXXXXXX
    -XXXXXXXXX
    -XXXXXXXXX
    -XXXXXXXXX
    -XXXXXXXXX
    -XXXXXXXXX
    -XXXXXXXXX
    OXXXXXXXXX
    `);
    maps.push(`
    O--XXXXXXX
    X--XXXXXXX
    XX----XXXX
    X--XX-XXXX
    X-XXX--XXX
    X-XXXX-XXX
    XX--XX--XX
    XX--XXX-XX
    XXXX---IXX
    XXXXXXXXXX
    `);
    maps.push(`
    I-----XXXX
    XXXXX-XXXX
    XX----XXXX
    XX-XXXXXXX
    XX-----XXX
    XXXXXX-XXX
    XX-----XXX
    XX-XXXXXXX
    XX-----OXX
    XXXXXXXXXX
    `);
    
    
    

//ajustando el tamaño del canvas
function setCanvasSize() {

    if(window.innerHeight > window.innerWidth){
        canvasSize = window.innerWidth * 0.8;
    } else{
        canvasSize = window.innerHeight * 0.75;
    }

    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);

    elementsSize = canvasSize / 10;
    firstScreen.style.display = 'none';
    empezarJuego();
}

//empezar el juego dibujando los mapas
function empezarJuego() {

    juego.font = elementsSize + 'px Verdana';

    if(levelGame < maps.length){
        
        const mapRows = maps[levelGame].trim().split('\n');

        const mapCols = mapRows.map(row => row.trim().split(''));

        //Mostrar las vidas, nivel y movimientos
        showLives();
        showLevel();
        showMovements();
        

        //Limpiar las bombas anteriores pues cada que se ejecuta la funcion empezarJuego se quedan las posiciones anteriores
    
        bombsPositions = [];
    
        //Renderizar todo el juego cada movimiento
        juego.clearRect(0,0,canvasSize,canvasSize)
    
        mapCols.forEach( (row, rowIndice) => {
            row.forEach((col, colInidice) => {
                //Entrar en el emoji según su posicion
                const emoji = emojis[col];
                
    
                //Definir posicion en X y en Y de los emojis
                const posX = elementsSize * colInidice;
    
                const posY = elementsSize * rowIndice + (elementsSize - elementsSize * 0.1);
    
                if (col == 'O'){
                    //Si playerPosition es diferente de 0, si ya tienen algún valor no se volverá a renderizar desde 0
                    if(!playerPosition.x && !playerPosition.y){
                        playerPosition.x = posX;
                        playerPosition.y = posY;
                    }
                    
                } else if (col == 'I'){
                    winPosition.x = posX;
                    winPosition.y = posY;
                } else if (col == 'X'){
                    bombsPositions.push({
                        x: posX,
                        y: posY
                    })
                    
                }
                
                //Dibujar mapa
                juego.fillText(emoji, posX, posY)
            })
        
        })
        
        movePlayer();
    }else{
        allLevelsCompleted();
    }
    
}



function movePlayer(){
    //se va el valor de playerPosition.x a -4 :(, utilicé un condicional
    if(playerPosition.x < 0){
        playerPosition.x = 0;
    }

    let winX = Math.floor(playerPosition.x) == Math.floor(winPosition.x);
    let winY = Math.floor(playerPosition.y) == Math.floor(winPosition.y);
    let levelWin = winX && winY;
    console.log({playerPosition}, {winPosition})

    if(levelWin){
        levelComplete();
    }

    let bombCollision = bombsPositions.find(bomb => {
        let collisionX = Math.floor(bomb.x) == Math.floor(playerPosition.x);
        let collisionY = Math.floor(bomb.y) == Math.floor(playerPosition.y);

        if(collisionX && collisionY){
            return true;
        }else{
            return false;
        }

    });

    if(bombCollision){
        levelFail();
    }

    juego.fillText(emojis.PLAYER, playerPosition.x, playerPosition.y)
}

function levelComplete() {
    console.log('You win!!')
    if(levelGame < maps.length){
        levelGame++;
        empezarJuego();
    } else{
        allLevelsCompleted();
    }
    
}

function levelFail(){
    console.log('Explotó una bomba');
    lives--;
    if(lives <= 0){
        levelGame = 0;
        lives = 3;
    }

    playerPosition.x = 0;
    playerPosition.y = 0;
    empezarJuego();
}

function allLevelsCompleted(){
    console.log('Haz completado todos los niveles')
    firstScreen.style.display = 'flex';
    firstScreen.innerHTML = `<h2 style="width:80%; text-align: center;">Haz logrado completar todos los niveles, tu récord de movimientos es de ${movementsGame}</h2><button id="restart_btn">Intentarlo de nuevo</button>`

    const restartGame = document.querySelector('#restart_btn')

    restartGame.addEventListener('click', function restart() {
        levelGame = 0;
        lives = 3;
        movementsGame = 0;
        playerPosition.x = 0;
        playerPosition.y = 0;
        empezarJuego();
        setCanvasSize();
        
    })
}

function showLives() {
    const livesMessage = document.querySelector('#lives_game')
    livesMessage.innerHTML = `${emojis['HEART'].repeat(lives)}`
    console.log(livesMessage)
}

function showLevel () {
    const levelMessage = document.querySelector('#level_game')
    levelMessage.innerHTML = levelGame + 1;
    console.log(levelMessage)

}

function showMovements() {
    const movesMessage = document.querySelector('#moves');
    movesMessage.innerHTML = movementsGame;
    console.log(movementsGame)

}

function showTime() {

}



const btnUp = document.querySelector('#up')
const btnLeft = document.querySelector('#left')
const btnRigth = document.querySelector('#rigth')
const btnDown = document.querySelector('#down')


btnUp.addEventListener('click', moveUp)
btnLeft.addEventListener('click', moveLeft)
btnRigth.addEventListener('click', moveRight)
btnDown.addEventListener('click', moveDown)
window.addEventListener('keydown', moveArrows)

//Moviendo conn teclas

function moveArrows(event){

    switch (event.key){
        case "ArrowUp":
            moveUp();
            break;
        
        case "ArrowLeft":
            moveLeft();
            break;

        case "ArrowRight":
            moveRight();
            break;

        case "ArrowDown":
            moveDown();
            break;

        default:
            break;
    }
}

function moveUp(){
    movementsGame++;
    if(Math.floor(playerPosition.y) > Math.floor(elementsSize)){
        playerPosition.y -= elementsSize;
        empezarJuego();
        console.log(playerPosition, elementsSize)
    }else{
        levelFail();
    }
    
}
function moveLeft(){
    movementsGame++;
    if(Math.floor(playerPosition.x + (playerPosition.x * .10)) > Math.floor(elementsSize)){
        playerPosition.x -= elementsSize;
        empezarJuego();
    }else{
        levelFail();
    }
    
}
function moveRight(){
    movementsGame++;
    if((Math.ceil(playerPosition.x + (playerPosition.x * .10)) < 10 * (Math.floor(elementsSize - 1)))){
        playerPosition.x += elementsSize;
        empezarJuego();
        console.log(playerPosition, elementsSize)
    }else{
        levelFail();
    }
}
function moveDown(){
    movementsGame++;
    if(Math.ceil(playerPosition.y + (playerPosition.y * .10)) < (10 * Math.floor(elementsSize))){
        playerPosition.y += elementsSize;
        empezarJuego();
        console.log(playerPosition, elementsSize)
    }else{
        levelFail();
    }

}



    