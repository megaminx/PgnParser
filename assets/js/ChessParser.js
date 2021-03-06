//Takes a move and a piece configuration and returns the new piece configuration
function parseMove(pieces, move, color) {
    var pieceType = move[0];
    var possibleMovedPieces = removeWrongColorAndTypePieces();
    var pieceNewPosition;
    var newPieces;

    newPieces = findFinalPosition();
    if (isCastling(move)) {
        var pieceY;
        if (color == 0) {
            pieceY = 0;
        }
        else {
            pieceY = 7;
        }
        if (move.length <= 4) {
            castleShort(pieceY);
        }
        else {
            castleLong(pieceY);
        }

        return pieces;
    }
    else {
        var movedPiecePos;

        switch (pieceType) {
            case "N":
                movedPiecePos = findMovedKnightPosition();
                break;
            case "K":
                movedPiecePos = findMovedKingPosition();
                break;
            case "R":
                movedPiecePos = findMovedRookPosition();
                break;
            case "B":
                movedPiecePos = findMovedBishopPosition();
                break;
            case "Q":
                movedPiecePos = findMovedQueenPosition();
                break;

            default:
                movedPiecePos = findMovedPawn();
        }

        newPieces.forEach(function (piece) {
            if (piece.position == movedPiecePos) {
                piece.position = pieceNewPosition;
                if(isPromotion(move)){
                    piece.type = getPromotionPieceType(move);
                }
            }
        });


        return newPieces;
    }


    function castleShort(pieceY) {
        pieces.forEach(function (piece) {
            if (piece.type == "K" && piece.position.y == pieceY) {
                piece.position.x = 6;
            }
            if (piece.type == "R" && piece.position.y == pieceY && piece.position.x == 7) {
                piece.position.x = 5;
            }
        });
    }

    function castleLong(pieceY) {
        pieces.forEach(function (piece) {
            if (piece.type == "K" && piece.position.y == pieceY) {
                piece.position.x = 2;
            }
            if (piece.type == "R" && piece.position.y == pieceY && piece.position.x == 0) {
                piece.position.x = 3;
            }
        });
    }

    function diagonalFilter(piece) {
        return Math.abs(piece.position.x - pieceNewPosition.x) == Math.abs(piece.position.y - pieceNewPosition.y);
    }

    function straightFilter(piece) {
        return piece.position.x == pieceNewPosition.x || piece.position.y == pieceNewPosition.y;
    }

    function freePathFilter(piece) {
        var isPathFree = true;
        if (piece.position.x == pieceNewPosition.x) {
            var minIndex = Math.min(piece.position.y, pieceNewPosition.y);
            var maxIndex = Math.max(piece.position.y, pieceNewPosition.y);
            pieces.forEach(function (piece) {
                if (piece.position.y < maxIndex && piece.position.y > minIndex && piece.position.x == pieceNewPosition.x) {
                    isPathFree = false;
                }
            });
        }
        else {
            var minIndex = Math.min(piece.position.x, pieceNewPosition.x);
            var maxIndex = Math.max(piece.position.x, pieceNewPosition.x);
            pieces.forEach(function (piece) {
                if (piece.position.x < maxIndex && piece.position.x > minIndex && piece.position.y == pieceNewPosition.y) {
                    isPathFree = false;
                }
            });
        }
        return isPathFree;
    }

    function findMovedPawn() {

        possibleMovedPieces = possibleMovedPieces.filter(function (piece) {
            return piece.position.x == chessLetterToCoordinate(move[0]);
        });
        return possibleMovedPieces[0].position;
    }

    function findMovedQueenPosition() {
        var tempPossiblePieces = possibleMovedPieces.slice();
        possibleMovedPieces = possibleMovedPieces.filter(diagonalFilter).concat(tempPossiblePieces.filter(straightFilter));

        movedPieceWithAmbiguity();

        return possibleMovedPieces[0].position;
    }

    function findMovedBishopPosition() {

        possibleMovedPieces = possibleMovedPieces.filter(diagonalFilter);

        movedPieceWithAmbiguity();

        return possibleMovedPieces[0].position;
    }

    function findMovedRookPosition() {
        possibleMovedPieces = possibleMovedPieces.filter(straightFilter);
        possibleMovedPieces = possibleMovedPieces.filter(freePathFilter);
        movedPieceWithAmbiguity();

        return possibleMovedPieces[0].position;
    }

    function findMovedKingPosition() {
        return possibleMovedPieces[0].position;
    }

    function findMovedKnightPosition() {
        possibleMovedPieces = possibleMovedPieces.filter(function (piece) {
            return isAtKnightDistance(piece.position, pieceNewPosition);
        });

        movedPieceWithAmbiguity();

        return possibleMovedPieces[0].position;
    }

    //ex: Nbd7 or R2c4
    function movedPieceWithAmbiguity() {
        if (possibleMovedPieces.length > 1) {
            if (isAChessLetter(move[1])) {
                possibleMovedPieces = possibleMovedPieces.filter(function (piece) {
                    return piece.position.x == chessLetterToCoordinate(move[1]);
                });
            }
            else {
                possibleMovedPieces = possibleMovedPieces.filter(function (piece) {
                    return piece.position.y == chessNumberToBoardCoordinate(move[1]);
                });
            }
        }
    }

    function findFinalPosition() {
        if (isCapture(move)) {
            pieceNewPosition = chessCoordinatesToPosition(move.substring(move.indexOf("x") + 1, move.indexOf("x") + 3));
            return pieces.filter(function (piece) {
                return piece.position.x != pieceNewPosition.x || piece.position.y != pieceNewPosition.y;
            });
        }
        else {
            if (isTypeAPawn(pieceType)) {
                pieceNewPosition = chessCoordinatesToPosition(move.substring(0, 2));
            }
            else {
                move = move.replace("+", "").replace("#", "");
                pieceNewPosition = chessCoordinatesToPosition(move.substring(move.length - 2, move.length));
            }
            return pieces;
        }
    }

    function removeWrongColorAndTypePieces() {
        return pieces.filter(function (piece) {
            if (isTypeAPawn(pieceType)) {
                return piece.color == color && piece.isAPawn();
            } else {
                return piece.color == color && piece.type == pieceType;
            }
        });
    }
}


