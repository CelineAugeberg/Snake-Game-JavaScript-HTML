"use strict";
import { TSprite } from "./lib/libSprite.js";
import { TPoint } from "./lib/lib2D.js";
import { cvs, imgSheet, SheetData, gameBoard, EBoardCellInfoType, TBoardCell } from "./game.js";

export function TBait() {
    const spa = SheetData.Bait;
    const boardCell = new TBoardCell(
        Math.floor(Math.random() * 10), //Oppretter et nytt TBoardCell objekt med tilfeldige kolonne og radverdier mellom 0-9.
        Math.floor(Math.random() * 10)
    );

    const pos = new TPoint(boardCell.col * spa.width, boardCell.row * spa.height); //Oppretter et nytt TPoint objekt basert på kolonne og radverdiene til boardCell.
    
    

    gameBoard[boardCell.row][boardCell.col].infoType = EBoardCellInfoType.Bait;

    let sp = new TSprite(cvs, imgSheet, spa, pos);

    this.update = function(){
        do {
            boardCell.row = Math.floor(Math.random() * 10);
            boardCell.col = Math.floor(Math.random() * 10);
        } while (gameBoard[boardCell.row][boardCell.col].infoType !== EBoardCellInfoType.Empty); //Sjekker at cellen med den nye boardCell posisjonen ikke er tom. Er den ikke det fortsetter den å generere nye tilfeldige col og row verdier til den finner en tom celle.
 gameBoard[boardCell.row][boardCell.col].infoType = EBoardCellInfoType.Bait; //Når løkken finner en tom celle vil den gi den en ny infoType som da er EBoardCellInfoType.Bait.
        pos.x = boardCell.col * spa.width;
        pos.y = boardCell.row * spa.height;
        sp.updateDestination(pos.x, pos.y); //Oppdaterer posisjonen.

    }
    this.draw = function () {
        sp.draw();
    };

}
