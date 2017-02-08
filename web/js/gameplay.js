console.log('gamelogic.js connected')

// Going forward, it's important to think from the perspective of the client: what information
// does this browser need to make the game work

// Thank God 'piece', 'point', 'white', and 'black' are all five letters long...

///// Global Variables /////
// Any function should feel free to alter and read these without taking them as arguments

var board // object which holds the state of the game

var thisTurn // object with all kinds of functionality
var preview // copy of board used to test out moves
var thisMoves // array of possible move objects

var white // object for player one
var black // object for player two




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
	console.log('--------------------------')
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
		console.log(white.name + ' goes first.')
		console.log('--------------------------')
		turnBuilder(white)
	} else if (white.dice[0].value < black.dice[0].value) {
		black.dice[1].value = white.dice[0].value
		console.log(black.name + ' goes first.')
		console.log('--------------------------')
		turnBuilder(black)
	} else {
		console.log('!!! the openingRoll function is broken.')
	}
}

// creates a new turn object and builds moves for it
function turnBuilder(player) {
	thisTurn = new Turn(player) 
	thisTurn.updatePreview()
	console.log(player.name + ' may move ' + thisTurn.availableResources.join(', '))
	moveBuilder()

}


function moveBuilder() {

	// reflect the last move in the state of the player
	thisTurn.player.updateState()
	// end game from here if someone has won
	if (thisTurn.player.hasWon) endGame(thisTurn.player)
	// set up for next move, given the the previous moves
	thisMoves = thisTurn.possibleMoves()

	// no more resources, no more possible moves
	if (thisMoves.length === 0) {
		
		// the player hasn't been able to do anything this turn, acknowledge that, next turn
		if (thisTurn.moves.length === 0) {
			console.log('Sorry, ' + thisTurn.player.name + ' there are no possible moves for you.')
			endTurn()
		
		// the player has exhausted all possible moves, provide commit option
		} else {

			// the player has not used all of their dice
			if (thisTurn.availableResources.length !== 0) {
				// display commit button
				console.log('No more possible moves. Feel free to undo and try other moves.')
				
				// while the commit button is clicked
					// remove the commit button
					endTurn()
				
			// the player has used all of their dice, provide commit option	
			} else {
				// display commit button
				console.log("You've used all of your dice!")
				
				// while the commit button is clicked
					// remove the commit button
					endTurn()
			}
		}

	// go ahead with making a new move
	} else {
		updateClickable(thisMoves, 1)

	}
}

// function for updating clickable things on the board
// takes an array of move objects
function updateClickable(arr, timesThrough) {
	var timesThrough = timesThrough
	var clickable = []
	for (var i = 0; i < arr.length; i++) {
		if (clickable.indexOf(arr[i].piece.declare()) === -1) clickable.push(arr[i].piece.declare())
		if (clickable.indexOf(arr[i].destination) === -1) clickable.push(arr[i].destination)
	}
	// make sure there are no errant classes and listeners
	$('.piece, .point').off()	
	$('.piece, .point').removeClass('active')	
	// if clickable is empty, don't make anything active
	if (clickable.length > 0) {	
		// add classes and listeners
		$('#' + clickable.join(',#')).addClass('active')	
		$('#' + clickable.join(',#')).on('click', function(e) {
			// first time through
			if (timesThrough === 1) {
				// is this a piece or a point?
				switch (this.id.substring(0, 5)) {
					case 'point':
						// set thisMoves to only the moves with this point as a destination
						winnowMoves('point', this.id)
						// update clickable with the new array
						break
					case thisTurn.player.color:
						// set thisMoves to only the moves with this point as a destination
						winnowMoves('piece', this.id)
						// update clickable with the new array
						break
					default:
						console.log('!!! the function that is supposed to figure out\
									if things are pieces or points was just fed neither.')
				}
			updateClickable(thisMoves, 2)

			// in cases where, after the first winnow, only one move remains, play it.
			if (thisMoves.length === 1) endMove()

			// second time through
			} else if (timesThrough === 2) {
				// is this a piece or a point?
				switch (this.id.substring(0, 5)) {
					case 'point':
						winnowMoves('point', this.id)
						break
					case thisTurn.player.color:
						winnowMoves('piece', this.id)
						break
					default:
						console.log('!!! the function that is supposed complete a move with\
									 either a piece or a point was just fed neither.')
				}
			endMove()
			}
			
		})	
	}
	console.log(thisMoves.length.toString() + " possible moves remain.")
}

// takes a type (point/piece) as a string and the particular value as a string
// used by updateClickable to narrow thisMoves down to only moves with that value
function winnowMoves(type, id) {
	var result = []
	// loop through thisMoves, cut away everything of the type which isn't the id
	switch(type) {
		case 'point':
			for (var move in thisMoves) {
				if (thisMoves[move].destination === id) result.push(thisMoves[move])
			}
			break
		case 'piece':
			for (var move in thisMoves) {
				if (thisMoves[move].piece.declare() === id) result.push(thisMoves[move]) 
			}
			break
	}
	thisMoves = result
}

// handles the transition into the next move
function endMove() {

	// make sure nothing is clickable
	updateClickable([], 3)
	// push this move to the turn
	thisTurn.moves.push(thisMoves[0])
	// preview the turn
	thisTurn.updatePreview()
	// visualize the preview board
	visualizeBoard(preview)
	// start a new move
	moveBuilder()
}


// handles the transition into the next player's turn
function endTurn() {
	// commit this player's moves
	thisTurn.commitToBoard()

	// roll the other player's dice
	getOtherPlayer(thisTurn.player).dice[0].roll()
	getOtherPlayer(thisTurn.player).dice[1].roll()

	// start a new turn with whoever is not this player
	turnBuilder(getOtherPlayer(thisTurn.player))
}

///// Game End Functions /////

function endGame(winner) {

	// commit the most recent player's moves
	thisTurn.commitToBoard()

	// by the bar and the number of pieces in the other player's home
	// if it was a win, gammon, or backgammon
	alert(winner.name + " wins the whole damn game!")
}

//reset the board
//	reset global variables
//  save the names
//  

///// Helper Functions /////

function runGame() {
	newGame('Nora', 'Gus')
	visualizeBoard(board)
	openingRoll()
}
runGame()

function visualizeBoard(brd) {
	for (var point in brd) {
		for (var i in brd[point]) {
			var $piece = $('#' + brd[point][i].declare())
			$piece.css('left', gridLookup(point, i, 'left'))
			$piece.css('top', gridLookup(point, i, 'top'))
		}
	}
	console.log('!!! updated the DOM with visualizeboard')
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

// checks to see if a spot on the given board is occupied by the
// other player, and so cannot be moved to
function isOccupied(point, brd, thisPlayer) {
	// if this gets passed overshoot, just return false
	if (point === 'overshoot') return false
	if (brd[point].length > 1) {
		if (brd[point][0].player === thisPlayer) {
			return false
		} else {
			return true 
		}
	} else {
		return false
	}		
}

//returns the player you don't pass to it
function getOtherPlayer(player) {
	if (player.color === "white") {
		return black
	} else {
		return white
	}
}

//returns an array of this player's pieces on the preview board
function getPieces(player) {
	var pieces = []
	for (var point in preview) {
		for (var i in preview[point]) {
			if (preview[point][i].player === player) pieces.push(preview[point][i])
		}
	}
	return pieces
}

// returns true if a player has a piece on the given point on the preview board
function isThere(player, point) {
		for (var i in preview[point]) {
			if (preview[point][i].player === player) return true
		}
	return false
}

// returns true if a player has all of their pieces in the home stretch
function areAllInHomeStretch(player) {
	if (player.barred) { return false }
	var points = [ 
	'bar',

	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 1).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 2).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 3).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 4).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 5).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 6).toString(),

	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 7).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 8).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 9).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 10).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 11).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 12).toString(),

	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 13).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 14).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 15).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 16).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 17).toString(),
	'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + 18).toString()
	]
	for (var i = 0; i < points.length; i++) {
		if (isThere(player, points[i])) return false
	}
	return true
}

// returns true if a player's pieces are all home
function areAllInHome(player) {
	if (player.barred) { return false }
	if (!player.homeStretch) { return false }
	if (preview[player.home].length === 15) { 
		return true 
	} else {
		return false
	}
}

// given a roll, a player, and a starting position, returns the end position 
function projectMove(start, roll, player) {
	var result
	var blackFictionalPoints = ['point-1','point-2','point-3','point-4','point-5','point-6']
	var whiteFictionalPoints = ['point26','point27','point28','point29','point30','point31']
	var overshoot
	// if the player is barred, project differently
	if (player.barred) {
		result = 'point' + eval(player.barCountOut.slice(5) + player.operator + ' ' + roll).toString()
	// if the player is in their home stretch, project differently
	} else if (player.homeStretch) {
		result = 'point' + eval(start.slice(5) + player.operator + roll).toString()
		// calculate 'overshoot' for the particular player
		if (blackFictionalPoints.indexOf(result) !== -1) overshoot = blackFictionalPoints.indexOf(result) + 1
		if (whiteFictionalPoints.indexOf(result) !== -1) overshoot = whiteFictionalPoints.indexOf(result) + 1
		
		// check if there is overshoot, if not don't mess with the result
		if (overshoot > 0) {
			// compare overshoot to the distance of the farthest occupied point
			// the order of this array is very important - needs to count outward
			var farthestArr = [
				'point' + eval(player.home.slice(5) + getOtherPlayer(player).operator + ' ' + 1).toString(),
				'point' + eval(player.home.slice(5) + getOtherPlayer(player).operator + ' ' + 2).toString(),
				'point' + eval(player.home.slice(5) + getOtherPlayer(player).operator + ' ' + 3).toString(),
				'point' + eval(player.home.slice(5) + getOtherPlayer(player).operator + ' ' + 4).toString(),
				'point' + eval(player.home.slice(5) + getOtherPlayer(player).operator + ' ' + 5).toString(),
				'point' + eval(player.home.slice(5) + getOtherPlayer(player).operator + ' ' + 6).toString()
			]
			var farthest
			for (var i = 0; i < farthestArr.length; i++) {
				if (isThere(player, farthestArr[i])) farthest = i + 1
			}
			// if the dice equals or is less than the farthest occupied point, return overshoot
			if (roll <= farthest) result = 'overshoot'
		}
	} else {
		result = 'point' + eval(start.slice(5) + player.operator + roll).toString()
		// makes sure countOut is actually the board, flattens it to home (which will not be allowed)
		if (blackFictionalPoints.includes(result)) {
			result = 'point0'
		} else if (whiteFictionalPoints.includes(result)) {
			result = 'point25'
		}
	}
	return result
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
		} else if (point.toString() === 'point25') {
			top = {0: 20, 1: 28, 2: 36, 3: 44, 4: 52, 
					5: 60, 6: 68, 7: 76, 8: 84, 9: 92, 
					10: 100, 11: 108, 12: 116, 13: 124, 14: 132}
		} else if (point.toString() === 'point0') {
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


