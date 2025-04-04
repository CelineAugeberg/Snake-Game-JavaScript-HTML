"use strict";
//-----------------------------------------------------------------------------------------
//----------- Import modules, js files  ---------------------------------------------------
//-----------------------------------------------------------------------------------------
import { TSprite } from "./lib/libSprite.js";
import { TPoint } from "./lib/lib2D.js";
import { cvs, imgSheet, SheetData, EDirection, gameBoard, gameBoardSize, EBoardCellInfoType, TBoardCell, gameProps } from "./game.js";
import { moveSnakeElement, ESpriteIndex } from "./snake_lib.js";

//-----------------------------------------------------------------------------------------
//----------- Classes ---------------------------------------------------------------------
//-----------------------------------------------------------------------------------------

export let growSnake = false;

export function TSnakeHead(aBoardCell) {
  const boardCell = aBoardCell;
  const spa = SheetData.Head; //SnakeSheet.Body or SnakeSheet.Tail
  const pos = new TPoint(boardCell.col * spa.width, boardCell.row * spa.height);
  const sp = new TSprite(cvs, imgSheet, spa, pos);
  let boardCellInfo = gameBoard[boardCell.row][boardCell.col];//Henter slangehodet sin posisjon.
  let direction = boardCellInfo.direction; //Lagrer retningen til slangehodet.
  let newDirection = direction; //Oppretter en variabel på en ny retning som starter med å være den samme som den gjeldene.
  boardCellInfo.infoType = EBoardCellInfoType.Snake;

  this.draw = function () { //Tegner slangehodet på spillebrettet.
    sp.setIndex(direction);
    sp.draw();
  };

  this.setDirection = function (aDirection) {
    if ((direction === EDirection.Right || direction === EDirection.Left) && (aDirection === EDirection.Up || aDirection === EDirection.Down)) {
      newDirection = aDirection;
    } else if ((direction === EDirection.Up || direction === EDirection.Down) && (aDirection === EDirection.Right || aDirection === EDirection.Left)) {
      newDirection = aDirection;
    }
  }; //Stopper slangehodet fra å snu seg 180 grader.

  this.update = function () {
    direction = moveSnakeElement(newDirection, boardCell, spa);
    if(!this.checkCollision()){    
      const boardCellInfo = gameBoard[boardCell.row][boardCell.col];//Henter slangen sin posisjon og lagrer den.
      if(boardCellInfo.infoType === EBoardCellInfoType.Bait){ //Sjekker om cellen inneholder en Bait.
        console.log("Bait eaten!");
        gameProps.bait.update(); //Baitet blir gitt en ny tilfeldig celle.
        growSnake = true; //Slangen skal vokse.
        gameProps.score.addScore(1); //For hvert bait som blir spist legger den til et poeng i scoren.

      }
      boardCellInfo.infoType = EBoardCellInfoType.Snake;
    }

    pos.x = boardCell.col * spa.width;
    pos.y = boardCell.row * spa.height;
    sp.updateDestination(pos.x, pos.y);
  };

  this.checkCollision = function () {
    return ((boardCell.row < 0) || (boardCell.row >= gameBoardSize.rows) || (boardCell.col < 0) || (boardCell.col >= gameBoardSize.cols));
  }; //Sjekker at slangehodet er på spillebrettet og ikke har kollidert.

} // End of class TSnakeHead

export function TSnakeBody(aBoardCell, aDirection, aSpriteIndex) {
  const boardCell = aBoardCell;
  const spa = SheetData.Body;
  const pos = new TPoint(boardCell.col * spa.width, boardCell.row * spa.height);
  const sp = new TSprite(cvs, imgSheet, spa, pos);
  let direction = gameBoard[boardCell.row][boardCell.col].direction;
  let spriteIndex = ESpriteIndex.RL;
  if ((aDirection !== undefined) && (aSpriteIndex !== undefined)) {
    direction = aDirection;
    spriteIndex = aSpriteIndex;
  }

  this.draw = function () {
    sp.setIndex(spriteIndex);
    sp.draw();
  };

  this.update = function () {
    spriteIndex = moveSnakeElement(direction, boardCell, spa);
    direction = gameBoard[boardCell.row][boardCell.col].direction;
    pos.x = boardCell.col * spa.width;
    pos.y = boardCell.row * spa.height;
    sp.updateDestination(pos.x, pos.y);
  };

  this.createBody = function () {
    return new TSnakeBody(new TBoardCell(boardCell.col, boardCell.row), direction, spriteIndex);
  };
} // End of class TSnakeBody

export function TSnakeTail(aBoardCell) {
  const boardCell = aBoardCell;
  const spi = SheetData.Tail;
  const pos = new TPoint(boardCell.col * spi.width, boardCell.row * spi.height);
  const sp = new TSprite(cvs, imgSheet, spi, pos);
  let direction = gameBoard[boardCell.row][boardCell.col].direction;

  this.draw = function () {
    sp.setIndex(direction);
    sp.draw();
  };

  this.update = function () {
    if(growSnake){ //Sjekker om growSnake er true.
      growSnake = false; //Setter så growSnake til false siden den allerede har vokst med en kroppsdel og skal ikke fortsette å vokse.
      return; 
    }
    gameBoard[boardCell.row][boardCell.col].infoType = EBoardCellInfoType.Empty;
    direction = moveSnakeElement(direction, boardCell, spi);
    pos.x = boardCell.col * spi.width;
    pos.y = boardCell.row * spi.height;
    sp.updateDestination(pos.x, pos.y);
  };
} // End of class TSnakeTail
