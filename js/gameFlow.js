console.log('gamelogic.js connected')

///// Global Variables /////
// Any function should feel free to alter and read these without taking them as arguments

var board
var preview

var thisTurn

var white
var black

///// Game Setup Functions /////

function newGame(whiteName, blackName) {
	white = new Player(whiteName, 'white')
	white.dice = [new Dice(), new Dice()]
	console.log(white.name + ' joined the game.')
	black = new Player(blackName, 'black')
	black.dice = [new Dice(), new Dice()]
	console.log(black.name + ' joined the game.')

	board = new BackgammonBoard()
	console.log('Board created.')
	var whitePieces = []
	for (var i = 1; i <= 15; i++) {
		whitePieces.push(new Piece(i, white))
	}
	var blackPieces = []
	for (var i = 1; i <= 15; i++) {
		blackPieces.push(new Piece(i, black))
	}
	console.log('Created ' + blackPieces.length.toString() + ' black pieces and ' 
						   + whitePieces.length.toString() + ' white pieces.')
	board.point24 = blackPieces.splice(-2)
	board.point19 = whitePieces.splice(-5)
	board.point17 = whitePieces.splice(-3)
	board.point13 = blackPieces.splice(-5)
	board.point12 = whitePieces.splice(-5)
	board.point8 = blackPieces.splice(-3)
	board.point6 = blackPieces.splice(-5)
	board.point1 = whitePieces.splice(-2)
	console.log('Assigned pieces to their point arrays.')
}

///// Gameplay Functions /////

// determines who goes first and what roll they use
function openingRoll() {
	white.dice[0].roll()
	console.log(white.name + ' rolled a ' + white.dice[0].declare())
	black.dice[0].roll()
	console.log(black.name + ' rolled a ' + black.dice[0].declare())
	if (white.dice[0].value === black.dice[0].value) {
		console.log('Tie on opening roll, rolling again...')
 		openingRoll()
 	} else if (white.dice[0].value > black.dice[0].value) {
 		white.dice[1].value = black.dice[0].value
		white.turn = true
		console.log(white.name + ' goes first.')
		console.log('--------------------------')
	} else if (white.dice[0].value < black.dice[0].value) {
		black.dice[1].value = white.dice[0].value
		black.turn = true
		console.log(black.name + ' goes first.')
		console.log('--------------------------')
	} else {
		console.log('!!! the openingRoll function is broken.')
	}
}

// creates a new turn object and builds moves for it
function startTurn(player) {
	thisTurn = new Turn(player) 
	thisTurn.preview()
	console.log('Created new turn for ' + player.name)
	console.log(player.name + ' may move ' + thisTurn.availableResources.join(', '))
	activatePieces()
}

// makes pieces build a move on click
function activatePieces() {
	var $pieces = $('.' + thisTurn.player.color + '-piece')
	$pieces.addClass('active')
	$pieces.on('click', moveBuilder)
	console.log(thisTurn.player.name + "'s pieces are clickable.")
}

// facilitates creating new move objects with DOM clicks
function moveBuilder(){
	if (this.id.substring(0,5) === thisTurn.player.color) {
		move = new Move(DOMtoPiece(this.id), 'point0')
		move.location = DOMtoPosition(this.id, preview)
		console.log('Created a new move with ' + this.id)
		thisTurn.moves.push(move)
		// deactivate pieces
		deactivatePieces()
		//activate points.
		activatePoints()
	} else if (this.class === 'point') {
		thisTurn.moves.slice(-1)[0]
	} else {
		console.log('!!! passed an invalid DOM node to moveBuilder')
	}
}

function deactivatePieces() {
	var $pieces = $('.' + thisTurn.player.color + '-piece')
	$pieces.removeClass('active')
	$pieces.off()
	console.log(thisTurn.player.name + "'s pieces are no longer clickable.")
}

// as it turns out, this is where most of the rules are going
function activatePoints() {
	var start = parseInt(thisTurn.moves.slice(-1)[0].location.slice(5))
	var dice = thisTurn.availableResources
	var points = []
	// get all possible moves
	switch(thisTurn.player.color) {
	// if a player doesn't have all pieces in their home quadrant, 
	// don't add home
		case 'white':
			for (var i = 0; i < dice.length; i++) {
				var result
				// for white, you ADD to move to home
				result = 'point' + (start + dice[i]).toString()
				if (result === 'point25') {
					if (thisTurn.player.homeStretch) points.push('point25')
				} else if (result !== 'point0') {
					points.push(result)
				}
			}
			break
		case 'black':
			for (var i = 0; i < dice.length; i++) {
				var result
				// for black, you SUBTRACT to move to home
				result = 'point' + (start - dice[i]).toString()
				if (result === 'point0') {
					if (thisTurn.player.homeStretch) points.push('point0')
				} else if (result !== 'point25') {
					points.push(result)
				}
			}
			break
	}
	// remove occupied points

	//START - work on getting occupied points outta there, finishing first move builder

	// $points.on('click', moveBuilder)
	console.log(points.join(', ') + " are clickable.")
}



// getPlayable(thisTurn, 'pieces')
// getPlayable(thisTurn, 'points')

// function getPlayable(trn, type) {
// 	var prev = trn.preview()
// 	var playablePieces
// 	var playablePoints
// 	if (type === 'pieces') {

// 	} else if (type === 'points') {

// 	} else {
// 		console.log('!!! passed ' + type.toString() + ' to getPlayable')
// 	}

// }

	// START HERE: how should event listeners be employed to create new move objects?
	//1  I need to make an array of pieces the player can move with this setup
	//2  I need to make an array of places the payer can move with this setup
	//3  I need to make both clickable, and when they are clicked, they need to visualize 
	// a move.
	//4 I need to repeat the previous steps, now taking into account the changes the move 
	// makes
	// There is a distinction between previewing a move and committing it, though they are
	// visually identical 


function nextTurn() {
	white.turn = !white.turn
	black.turn = !black.turn
}

// function isWinner(player) {
// 	if (board[player.color].length === 15) {
// 		console.log(player.name + " wins the game!")
// 		return true
// 	} else {
// 		console.log(player.name + " has not won the game.")
// 		return false
// 	}
// }
// this is not the right approach. This is: player clicks on something, I take that in
// and tell player if it's okay or not. It should be, player clicks on something, if it's
// not legal, I don't take the information in.
// Which means I need to start with the activate pieces function. Do not activate pieces
// if they can't be moved
// do not activate points if they can't be moved to.

// function hasOnBar(player) {
// 	var onBar = []
// 	for (var i = 0; i < board.bar.length; i++) {
// 		if (board.bar[i].color === player.color) onBar.push(board.bar[i])
// 	}
// 	return onBar
// }

// function isOnBar(piece) {
// 	var result = false
// 	for (var i = 0; i < board.bar.length; i++) {
// 		if (board.bar[i].id === piece.id) result = true
// 	}
// 	return result
// }


// function isLegalMove(piece, place, player) {
// 	// if there is a same-color piece on the bar and this is not it
// 	if (!!hasOnBar(player).length && !isOnBar(piece)) {
// 		return false
// 	}
// 	// if the place is occupied by more than one of the other color
// 	// else true
// }



///// Game End Functions /////

//reset the board
//	reset global variables
//  save the names
//  

///////////////////////////////

///// Utility and Dev Functions /////

function runGame() {
	newGame('Nora', 'Gus')
	visualizeBoard(board)
	openingRoll()
	var activePlayer = whoseTurn()
	startTurn(activePlayer)
}
runGame()


function whoseTurn() {
	if (white.turn) {
		return white
	} else if (black.turn) {
		return black
	} else {
		console.log("!!! whoseTurn returned null.")
		return null
	}
}

function visualizeBoard(brd) {
	for (var point in brd) {
		for (var i in brd[point]) {
			var $piece = $('#' + brd[point][i].declare())
			$piece.css('left', gridLookup(point, i, 'left'))
			$piece.css('top', gridLookup(point, i, 'top'))
		}
	}
	console.log('!!! updated the DOM with visualizeboard')
	console.log('--------------------------')
}

function DOMtoPiece(id) {
	for (var point in board) {
		for (var i in board[point]) {
			if (board[point][i].declare() === id) return board[point][i]
		}
	}
}

function DOMtoPosition(id, brd) {
	for (var point in brd) {
		for (var i in brd[point]) {
			if (brd[point][i].declare() === id) return point.toString()
		}
	}
}

// checks to see if a spot on the board is occupied by the
// other player, and so cannot be moved to
function isOccupied(point, brd, thisPlayer) {
	if (brd[point].length > 1) {
		if (brd[point][0].color !== thisPlayer.color) {
			return true
		} else {
			return false 
		}
	} else {
		return false
	}
}

function gridLookup(point, position, axis) {
	if (axis === 'left') {
		var left = {
			point1: 458, point24: 458, 
			point2: 421, point23: 421, 
			point3: 385, point22: 385, 
			point4: 347, point21: 347, 
			point5: 311, point20: 311, 
			point6: 273, point19: 273, 
			point7: 212, point18: 212, 
			point8: 175, point17: 175, 
			point9: 137, point16: 137, 
			point10: 100, point15: 100, 
			point11: 64, point14: 64, 
			point12: 26, point13: 26, 
			bar: 242,
			point0: 515, point25: 515
		}
		return left[point].toString() + 'px'
	} else if (axis === 'top') {
		var top
		if (point.toString() === 'bar') {
			top = {0: 228, 1: 211, 2: 188, 3: 171, 4: 154, 
					5: 154, 6: 154, 7: 154, 8: 154, 9: 154, 
					10: 154, 11: 154, 12: 154, 13: 154, 14: 154}
		} else if (point.toString() === 'point0') {
			top = {0: 20, 1: 28, 2: 36, 3: 44, 4: 52, 
					5: 60, 6: 68, 7: 76, 8: 84, 9: 92, 
					10: 100, 11: 108, 12: 116, 13: 124, 14: 132}
		} else if (point.toString() === 'point25') {
			top = {0: 270, 1: 278, 2: 286, 3: 294, 4: 302, 
					5: 310, 6: 318, 7: 326, 8: 334, 9: 342, 
					10: 350, 11: 358, 12: 366, 13: 374, 14: 382}
		} else if (parseInt(point.toString().slice(5)) <= 12){
			top = {0: 390, 1: 355, 2: 320, 3: 285, 4: 250, 
					5: 240, 6: 240, 7: 240, 8: 240, 9: 240, 
					10: 240, 11: 240, 12: 240, 13: 240, 14: 240}
		} else {
			top = {0: 20, 1: 55, 2: 90, 3: 125, 4: 160, 
					5: 30, 6: 30, 7: 30, 8: 30, 9: 30, 
					10: 30, 11: 30, 12: 30, 13: 30, 14: 30}
		}
		return top[position]
	} else {
		console.log('!!! passed ' + axis.toString() + ' to gridLookup')
	}
}








// plyr = whoseTurn()
// at the beginning of any given turn 

// play turns
	// for a given piece, return legal moves
	// buld a move, submit it or cancel it
// trigger a win
	// a while loop which breaks when either player's home is not full
	// when it's full, a variable is assigned to the player's object,
	// an if statement in the turn function handles it from there


// roll dice - determine how many moves (4 if doubles, 2 otherwise)
// make a player's pieces clickable
// when they click a piece, move that into the turn builder's first spot
// if they click another piece on the same point, 
// also move that into the turn builder's second spot
// if they click the same piece again, or a piece on another point,
// move it out of the turn builder's spot

// if their turn builder puts all of their pieces in their home, they win right away

// if they click undo, empty turn builder
// if they click submit, commit the turn builder
// check if they win the game
// next turn!
// and on an on until the winner variable has some value


// possible moves

// ramifications of move (process move)

// For every point my dice can get me to

// >is empty
// 	move there
// >has one piece of another color
// 	eat it
// >has more than one piece of another color
// 	can't move there



/*

* a graphic should come up and tell you which direction you'll move at game start.
might not be neccesary when dashboard is working?


* When this gets more visually interesting, pieces in the move builder should be locked
to the pointer of the player, so when the final click happens they can just rest right
at whatever spot they were put at




* A "can I take that back" button - which simply alerts you with "no"


* A "stakes" feature, where at setup, I ask - what issue is this game going to settle?

"Who does the dishes."
"Who's the better beatboxer."
"Whether Livia really poisoned Augustus with figs."

That is displayed all throughout the game.

++ if I have the program read "who", and pop a name in there on game win
	or ask who's on what side of an issue - there could be two inputs
	if I see "whether", or "what", maybe I could direct the players to an
	interface that takes two inputs


* is math.random.floor really a fair random engine? Look into that, might be worth finding a better solution.

*/