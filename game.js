"use strict";
import { TPoint, TSinesWave } from "./lib/lib2D.js";
import { TSprite, TSpriteButton, TSpriteNumber } from "./lib/libSprite.js";
import { TBait } from "./bait.js";
import { growSnake, TSnakeHead, TSnakeBody, TSnakeTail } from "./snake.js";

//-----------------------------------------------------------------------------------------
//----------- variables and object --------------------------------------------------------
//-----------------------------------------------------------------------------------------
export let cvs = null;
export let ctx = null;
export let imgSheet = null;
export const gameBoardSize = { cols: 24, rows: 18 };
export const SheetData = {
  Head: { x: 0, y: 0, width: 38, height: 38, count: 4 },
  Body: { x: 0, y: 38, width: 38, height: 38, count: 6 },
  Tail: { x: 0, y: 76, width: 38, height: 38, count: 4 },
  Bait: { x: 0, y: 114, width: 38, height: 38, count: 1 },
  Play: { x: 0, y: 155, width: 202, height: 202, count: 10 },
  Retry: { x: 614, y: 995, width: 169, height: 167, count: 1 },
  Resume: { x: 0, y: 357, width: 202, height: 202, count: 2 },
  Home: { x: 65, y: 995, width: 169, height: 167, count: 1 },
  Number: { x: 0, y: 560, width: 81, height: 86, count: 10 },
  GameOver: { x: 0, y: 647, width: 856, height: 580, count: 1 },
};

export const EDirection = { Up: 0, Right: 1, Left: 2, Down: 3 };

export const EBoardCellInfoType = { Empty: 0, Snake: 1, Bait: 2 };

export const EGameStatus = { New: 0, Running: 1, Pause: 2, GameOver: 3 };

export function TBoardCell(aCol, aRow) {
  this.col = aCol;
  this.row = aRow;
}

export function TBoardCellInfo() {
  this.direction = EDirection.Right;
  this.infoType = EBoardCellInfoType.Empty;
}

export let gameBoard = null;
export let gameStatus = EGameStatus.New;

const snakeSpeed = 3;

let hndUpdateGame = null;

export const gameProps = {
  gameOverMenu: null,
  Home: null,
  Retry: null,
  Resume: null,
  snake: [],
  Bait: [],
  score: null
};

//-----------------------------------------------------------------------------------------
//----------- functions -------------------------------------------------------------------
//-----------------------------------------------------------------------------------------

function loadGame() { //Laster inn spillbrettet og andre viktige elementer.
  cvs = document.getElementById("cvs");
  cvs.width = gameBoardSize.cols * SheetData.Head.width;
  cvs.height = gameBoardSize.rows * SheetData.Head.height;
  ctx = cvs.getContext("2d");

  gameProps.playButton = new TSpriteButton(cvs, imgSheet, SheetData.Play, { x: 350, y: 200}, newGame); //Henter play sprite knappen.
  gameProps.score = new TScore();
  gameProps.gameOverMenu = new TGameOverMenu();
  gameProps.resumeButton = new TSpriteButton(cvs, imgSheet, SheetData.Resume, { x: 350, y: 200}, resumeGame); //Henter resume sprite knappen.



  requestAnimationFrame(drawGame);
  console.log("Game canvas is rendering!");
}

//----------------------------------------------------------------------------------------

function newGame() { //Starter spillet.
  gameProps.playButton.disabled = true;
  gameProps.score.resetScore();

  gameStatus = EGameStatus.Running;

  if (hndUpdateGame != null) {
    clearInterval(hndUpdateGame); //Passer på at hndUpdateGame variabelen ikke er null. Dette sikrer at det ikke er flere updateGame funksjoner som kjører samtidig.
  }

  gameBoard = []; //Gjør klar spillbrettet og tømmer det så det er klart for en ny runde eller nytt spill.
  for (let i = 0; i < gameBoardSize.rows; i++) {
    const row = [];
    for (let j = 0; j < gameBoardSize.cols; j++) {
      row.push(new TBoardCellInfo());
    }
    gameBoard.push(row);
  }

  gameProps.snake = []; //Tømmer gameProps.snake arrayen så den er klar for en ny runde eller nytt spill.
  let newSnakeElement = new TSnakeHead(new TBoardCell(2, 10));//Plasserer slangehodet på denne spesefike cellen, gjelder alle elementene under også.
  gameProps.snake.push(newSnakeElement);

  newSnakeElement = new TSnakeBody(new TBoardCell(1, 10));
  gameProps.snake.push(newSnakeElement);

  newSnakeElement = new TSnakeTail(new TBoardCell(0, 10));
  gameProps.snake.push(newSnakeElement);

  gameProps.bait = new TBait(new TBoardCell(1, 1));

   
  hndUpdateGame = setInterval(updateGame, 500/snakeSpeed); //Oppdateringsfrekvensen til spillet basert på snakeSpeed.
  console.log("Game update sequence is running!");
}

//----------------------------------------------------------------------------------------

export function drawGame() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  
  if (gameStatus === EGameStatus.New) {
    gameProps.playButton.draw(); //Tegner play knappen når spillet sin status er GameStatus.New
  };

  if(gameProps.bait){ //Tegner bait objektet.
    gameProps.bait.draw();
  };

  for (let i = 0; i < gameProps.snake.length; i++) {
    gameProps.snake[i].draw(); //Tegner alle elementene til slangen på brettet.
  }
  if (gameStatus === EGameStatus.GameOver) {
    gameProps.gameOverMenu.draw(); //GameOver menyen blir tegnet når spillet sin status er GameStatus.GameOver
  };
  gameProps.score.draw(); //Tegner score tallene.

  if (gameStatus === EGameStatus.Pause) {
    gameProps.resumeButton.draw(); //Tegner resume/pause knappen når spillet sin status er GameStatus.Pause
  };

  requestAnimationFrame(drawGame);
}

//----------------------------------------------------------------------------------------

function updateGame() {
  switch (gameStatus) {  //Sjekker om gameStatusen er Running.                               
    case EGameStatus.Running:
  }

  let newBody = null;

  for (let i = 0; i < gameProps.snake.length; i++) {
    const snakeElement = gameProps.snake[i];
    if (snakeElement === gameProps.snake[0]) {
      if (gameProps.snake[0].checkCollision()) {
        gameStatus = EGameStatus.GameOver;
        gameProps.gameOverMenu.draw();
        break;
      }
    }else{
      if(growSnake && i === gameProps.snake.length - 2){ //Sjekker hvis det trengs å legge til en ny kroppsdel på slangen.
        newBody = snakeElement.createBody();
      }
    }
    snakeElement.update();
  }
  if(newBody){ //Sjekker om det ble lagt til en ny kroppsdel.
    const tail = gameProps.snake.pop(); //Fjerner tail fra snake arrayen.
    gameProps.snake.push(newBody); //Det legges til en ny kroppsdel i arrayen.
    gameProps.snake.push(tail); //Dytter tail'en tilbake i arrayen.
  }

  
}


//-----------------------------------------------------------------------------------------
//----------- Score -----------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
function TScore() { //Setter, oppdaterer og lagrer scoren.
  const posScore = new TPoint(70, 10);
  const numberScore = new TSpriteNumber(cvs, imgSheet, SheetData.Number, posScore);
  let score = 0;
  numberScore.setAlpha(50); //Senker gjennomsiktligheten til score spriten.
  numberScore.setValue(score);

  this.draw = function() {
    numberScore.draw();
  };

  this.addScore = function (aValue) { //Øker og oppdaterer score verdien på spillbrettet.
    score += aValue;
    numberScore.setValue(score);
    gameProps.gameOverMenu.setFinalScore(score);
  };

  this.resetScore = function () { //Tilbakestiller scoren med nytt spill.
    score = 0;
    numberScore.setValue(score);
  };
}

//-----------------------------------------------------------------------------------------
//----------- GameOverMenu ----------------------------------------------------------------
//-----------------------------------------------------------------------------------------
function TGameOverMenu() { 
  let scoreFinal = 0;

  const posBoard = new TPoint(35, 35); //Setter posisjonen til GameOver spriten.
  const spriteBoard = new TSprite(cvs, imgSheet, SheetData.GameOver, posBoard);

  const posFinalScore = new TPoint (640, 250); //Setter posisjonen til FinalScore spriten.
  const numberFinalScore = new TSpriteNumber(cvs, imgSheet, SheetData.Number, posFinalScore);
  numberFinalScore.setValue(scoreFinal); //Setter det tallet som spillet endte på.

  const posRetryButton = new TPoint (650, 382); //Setter posisjonen til retry knappen.
  const retryButton = new TSpriteButton(cvs, imgSheet, SheetData.Retry, posRetryButton, retryGame);

  const posHomeButton = new TPoint (100, 382); //Setter posisjonen til Hjem knappen-
  const homeButton = new TSpriteButton(cvs, imgSheet, SheetData.Home, posHomeButton, homeBtn);

  this.draw = function () {
    spriteBoard.draw();
    numberFinalScore.draw();
    retryButton.draw();
    homeButton.draw();
  };

  this.setFinalScore = function (aValue) {
    scoreFinal = aValue;

    numberFinalScore.setValue(scoreFinal);
  };

  
}
function retryGame() {
  gameStatus = EGameStatus.New;

  ctx.clearRect(0, 0, cvs.width, cvs.height); //Rydder opp spillbrettet.

  newGame(); //Starter et nytt spill.
};

function homeBtn() {
  gameStatus = EGameStatus.New;

  ctx.clearRect(0, 0, cvs.width, cvs.height);

  newGame();
};




function resumeGame () {

};



//-----------------------------------------------------------------------------------------
//----------- Events ----------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
export function init(aEvent) {
  console.log("Initializing the game");
  imgSheet = new Image();
  imgSheet.addEventListener("load", imgSheetLoad);
  imgSheet.addEventListener("error", imgSheetError);
  imgSheet.src = "./media/spriteSheet.png";

  document.addEventListener("keydown", keydown);
}
//-----------------------------------------------------------------------------------------

function imgSheetLoad() {
  console.log("Sprite Sheet is loaded, game is ready to start!");
  loadGame();
}
//-----------------------------------------------------------------------------------------

function imgSheetError(aEvent) {
  console.log("Error loading Sprite Sheet!", aEvent.target.src);
}
//-----------------------------------------------------------------------------------------

function keydown(aEvent) {
  const snakeHead = gameProps.snake[0];
  switch (aEvent.key) {
      case "ArrowLeft":
          snakeHead.setDirection(EDirection.Left);
          break;
      case "ArrowRight":
          snakeHead.setDirection(EDirection.Right);
          break;
      case "ArrowUp":
          snakeHead.setDirection(EDirection.Up);
          break;
      case "ArrowDown":
          snakeHead.setDirection(EDirection.Down);
          break;
      case " ":
          if (gameStatus === EGameStatus.Pause) {
              gameStatus = EGameStatus.Running;
              hndUpdateGame = setInterval(updateGame, 500 / snakeSpeed); //Stopper spillet helt ved å trykke på Spacebar. Her stopper slangen helt.
          } else if (gameStatus === EGameStatus.Running) {
              gameStatus = EGameStatus.Pause;
              clearInterval(hndUpdateGame);
          }
          break;
  }
}

