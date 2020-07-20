const Deck = require('../client/deck/deck.js');
const Ranker = require('handranker');

const gameDeck = new Deck();
const gameState = {
	players: [],
	spectators: [],
	gameDeck,
	action: false,
	board: [],
	pot: 0,
	bigBlindValue: 10,
	smallBlindValue: 5,
	activeBet: 0,
	messages: [],
	winnerMessage: [],
	started: false,
	showdown: false,
	minBet: 20,
	allIn: false
};

const addSpectators = (socketId) => {
	gameState.spectators.push({
		id: socketId,
		name: '',
		view: false,
		bankroll: 1000,
		cards: [],
		action: false,
		button: false,
		smallBlind: false,
		bigBlind: false,
		dealer: '',
		active: false,
		activeBet: 0,
		rebuys: 0
	});
};

const addPlayer = (socketId) => {
	const newPlayer = gameState.spectators.filter((player) => player.id === socketId)[0];
	if(gameState.started === true) {
		newPlayer.view = true;
	}
	gameState.players.push(newPlayer);
	gameState.spectators = gameState.spectators.filter((player) => player.id !== socketId);
};

const dealPlayers = () => {
	gameState.board = [];
	gameState.gameDeck.shuffleDeck();
	for (let i = 0; i < gameState.players.length; i++) {
		if(gameState.players[i].view === false) {
			gameState.players[i].cards = gameState.gameDeck.dealCards(2);
		}
		//gameState.players[i].view = false;
	}
	gameState.action = 'preflop';
};

const blindsToPot = () => {
	// clear pot
	gameState.pot = 0;
	gameState.players.forEach((player) => {
		if (player.smallBlind) {
			console.log("smallBlind is" + player.name);
			player.bankroll -= gameState.smallBlindValue;
			player.activeBet = gameState.smallBlindValue;
			gameState.pot += gameState.smallBlindValue;
		} else if (player.bigBlind) {
				console.log("bigBlind is" + player.name);
			player.bankroll -= gameState.bigBlindValue;
			player.activeBet = gameState.bigBlindValue;
			gameState.pot += gameState.bigBlindValue;
		}
	});

	// set initial bet to join in as BB value
	gameState.activeBet = gameState.bigBlindValue;
};

const setInitialBlinds = () => {

	for(let i = 0; i < gameState.players.length; i++) {
		console.log("player " + i + ": " + gameState.players[i].name);
	}
	var d = 0;
	var num_players = 0;
	for (let i = 0; i < gameState.players.length; i++) {
		if(gameState.players[i].dealer === 'D') {
			d = i;
		}
		if(gameState.players[i].view === false) {
			num_players++;
		}
	}
	gameState.players[d].button = true;

	//set blinds for 2 player game
	if(num_players === 2) {
		if(d === 0) {
			gameState.players[1].smallBlind = true;
		}
		else {
			gameState.players[0].smallBlind = true;
		}
		gameState.players[d].bigBlind = true;	//make dealer big blind
	}
	//set blinds for more than two player game

	else {
		//set small blind:
		if (d+1 < gameState.players.length && gameState.players[d+1].view === false) {
			gameState.players[d+1].smallBlind = true;
		}
		else if (d+1 < gameState.players.length && gameState.players[d+1].view === true) {
			gameState.players[0].smallBlind = true;
		}
		else if (d+1 >= gameState.players.length) {
			gameState.players[0].smallBlind = true;
		}

		//set big blind
		if (d+2 < gameState.players.length && gameState.players[d+1].view === false) {
			gameState.players[d+2].bigBlind = true;
		}
		else if (d+2 < gameState.players.length && gameState.players[d+2].view === true && gameState.players[d+1].view === false) {
			gameState.players[0].bigBlind = true;
		}
		else if (d+2 < gameState.players.length && gameState.players[d+2].view === true && gameState.players[d+1].view === true) {
			gameState.players[1].bigBlind = true;
		}
		else if (d+2 >= gameState.players.length && d+1 >= gameState.players.length) {
			gameState.players[1].bigBlind = true;
		}
		else if (d+2 >= gameState.players.length && d+1 < gameState.players.length) {
			gameState.players[0].bigBlind = true;
		}

		//if(d+1 < gameState.players.length && d+2 < gameState.players.length && gameState.players[d+1].view === false && gameState.players[d+2].view === false)
		//else if (d+1 < gameState.players.length && d+2 >= gameState.players.length &&)
		/*
		if((d-1) >= 0 && (d-2) >= 0) {
			gameState.players[d-1].smallBlind = true;
			gameState.players[d-2].bigBlind = true;
			console.log("setting " + gameState.players[d-1].name + " to smallBlind");
			console.log("setting " + gameState.players[d-2].name + " to bigBlind");
		}
		else if((d-1) >= 0 && (d-2) < 0) {
			gameState.players[d-1].smallBlind = true;
			gameState.players[gameState.players.length-1].bigBlind = true;
			console.log("setting " + gameState.players[d-1].name + " to smallBlind");
			console.log("setting " + gameState.players[gameState.players.length-1].name + " to bigBlind");
		}
		else {
			gameState.players[gameState.players.length-1].smallBlind = true;
			gameState.players[gameState.players.length-2].bigBlind = true;
			console.log("setting " + gameState.players[gameState.players.length-1].name + " to smallBlind");
			console.log("setting " + gameState.players[gameState.players.length-2].name + " to bigBlind");
		}
		*/
	}
	gameState.players[d].active = true;
	blindsToPot();
};

const moveBlinds = () => {
	//set dealer for next round
	var d;
	var num_players = 0;
	for(let i = 0; i < gameState.players.length; i++) {
		if(gameState.players[i].dealer === 'D') {
			d = i;
		}
		if(gameState.players[i].view === false) {
			num_players++;
		}
	}
	if(d+1 < gameState.players.length) {
		gameState.players[d].dealer = '';
		gameState.players[d+1].dealer = 'D';
	}
	else {
		gameState.players[d].dealer = '';
		gameState.players[0].dealer = 'D';
	}
	gameState.players[d].button = true;

	for (let i = 0; i < gameState.players.length; i++) {
		if (gameState.players[i].button === true) {
			// reset active player to match blinds
			gameState.players.forEach((player) => {
				player.active = false;
			});

			// set current button to false and switch to BB
			if(num_players === 2) {
				gameState.players[i].button = false;
				gameState.players[i].smallBlind = false;
				gameState.players[i].bigBlind = true;

				// edge case if BB is last in the array
				if (i + 1 < gameState.players.length) {
					gameState.players[i + 1].button = true;
					gameState.players[i + 1].active = true;
					gameState.players[i + 1].smallBlind = true;
					gameState.players[i + 1].bigBlind = false;
				} else {
					gameState.players[0].button = true;
					gameState.players[0].active = true;
					gameState.players[0].smallBlind = true;
					gameState.players[0].bigBlind = false;
				}
				blindsToPot();
			}
			else {
				for(let x = 0; x < gameState.players.length; x++)
				{
					gameState.players[x].smallBlind = false;
					gameState.players[x].bigBlind = false;
				}
				setInitialBlinds();
			}
			break;
		}
	}
};

const check = (socketId) => {
	console.log("IN HERE");
	var i;
	for (i = 0; i < gameState.players.length; i++) {
		if (gameState.players[i].id === socketId) {
			break;
		}
	}
	if(gameState.players[i].view === false) {
		gameState.players[i].action = true;
		for (let j = 0; j < gameState.players.length; j++) {
			gameState.players[j].active = false;
		}
		var count = 1;
		while((i + count) <= gameState.players.length) {
				console.log("i = " + i + ", count = " + count);
				if((i+count) === gameState.players.length) {
					i = 0;
					count = 0;
				}
				else if(gameState.players[i + count].view === true) {
					count = count + 1;
				}
				else {
					gameState.players[i+count].active = true;
					break;
				}
		}
	}
	else {
		for (let j = 0; j < gameState.players.length; j++) {
			gameState.players[j].active = false;
		}
		var count = 1;
		while((i + count) <= gameState.players.length) {
				console.log("i = " + i + ", count = " + count);
				if((i+count) === gameState.players.length) {
					i = 0;
					count = 0;
				}
				else if(gameState.players[i + count].view === true) {
					count = count + 1;
				}
				else {
					gameState.players[i+count].active = true;
					break;
				}
		}
	}


	/*
	for (let i = 0; i < gameState.players.length; i++) {
		if (gameState.players[i].id === socketId && gameState.players[i].view === false) {
		//	if(gameState.players[i].view === false) {
				gameState.players[i].action = true;
		//	}
		//	else {
		//		gameState.players[i].action = false;
		//	}


			/*
			if (i + 1 < gameState.players.length) {
				if(gameState.players[i + 1].view === true) {
					for (let j = 0; j < gameState.players.length; j++) {
						gameState.players[j].active = false;
					}
					//gameState.players[i + 1].active = false;
					//gameState.players[i].active = false;
					gameState.players[0].active = true;
				}
				else if(gameState.players[i + 1].view === false){
					for (let j = 0; j < gameState.players.length; j++) {
						gameState.players[j].active = false;
					}
					gameState.players[i + 1].active = true;
				//	gameState.players[i].active = false;
				}
			}
			else {
				for (let j = 0; j < gameState.players.length; j++) {
					gameState.players[j].active = false;
				}
				gameState.players[0].active = true;
			//	gameState.players[i].active = false;
			}
			*/
	//	}

	//}
	for (let i = 0; i < gameState.players.length; i++) {
		if(gameState.players[i].smallBlind === true) {
				console.log("smallBlind is " + gameState.players[i].name);
		}
		if(gameState.players[i].bigBlind === true) {
				console.log("bigBlind is " + gameState.players[i].name);
		}
	}
};

const playerActionCheck = () => {
	for (let i = 0; i < gameState.players.length; i++) {
		if (gameState.players[i].action === false && gameState.players[i].view === false) {
			console.log("playerActionCheck returning false");
			return false;
		}
	}
	console.log("playerActionCheck returning true");
	return true;
};

const resetPlayerAction = () => {
	gameState.players.forEach((player) => {
		player.action = false;
		player.activeBet = 0;
	});

	// reset active bet as well
	gameState.activeBet = 0;
};

const potToPlayer = (player) => {
	player.bankroll += gameState.pot;
	gameState.pot = 0;
};


const potToTie = () => {
	const halfPot = gameState.pot / 2;
	gameState.players.forEach((player) => {
		player.bankroll += halfPot;
	});
	gameState.pot = 0;
};


const determineWinner = () => {
	const hands = gameState.players;
	const board = gameState.board;

	// check to see if any players have left during showdown to prevent server crash
	if (gameState.players.length > 1 ){
		const results = Ranker.orderHands(hands, board);
		console.log(results)
		// check for tie
		if (results[0].length > 1) {
			potToTie();
			const tieMsg = 'Tie pot, both players have ' + results[0][0].description;
			gameState.winnerMessage.push({ text: tieMsg, author: 'Game' });

		} else {
			const winnerId = results[0][0].id;
			const winner = gameState.players.filter((player) => player.id === winnerId)[0];
			const winnerMsg = winner.name + ' won $' + gameState.pot + ' with ' + results[0][0].description;
			gameState.winnerMessage.push({ text: winnerMsg, author: 'Game' });
			//delay
			potToPlayer(winner)
		}
		return true
	} else {
		return false
	}

};

const determineLose = () => {
		for (let i = 0; i < gameState.players.length; i++) {
			if (gameState.players[i].bankroll <= 0) {
				return gameState.players[i].id
			}
		}
}

const resetActive = () => {
	gameState.players.forEach((player) => {
		if (player.bigBlind) {
			player.active = true;
		} else if (player.button) {
			player.active = false;
		}
	});
};

const changeBoard = () => {
	console.log("changeBoard being called");
	if (gameState.action === 'preflop') {
		gameState.action = 'flop';
		resetActive();
		resetPlayerAction();
		gameState.minBet = 10
		gameState.gameDeck.dealCards(3).forEach((card) => gameState.board.push(card));
	} else if (gameState.action === 'flop') {
		gameState.action = 'turn';
		resetActive();
		resetPlayerAction();
		gameState.minBet = 10
		gameState.gameDeck.dealCards(1).forEach((card) => gameState.board.push(card));
	} else if (gameState.action === 'turn') {
		gameState.action = 'river';
		resetActive();
		resetPlayerAction();
		gameState.minBet = 10
		gameState.gameDeck.dealCards(1).forEach((card) => gameState.board.push(card));
	} else if (gameState.action === 'river') {
		// determineWinner();
		gameState.showdown = true
		// dealPlayers();
		// resetPlayerAction();
		// moveBlinds();
	}
};

const resetGame = () => {
	gameState.board = [];
	gameState.messages = [];
	gameState.winnerMessage = [];
	gameState.minBet = 20
	gameState.started = false;
	gameState.players.forEach((player) => {
		player.cards = [];
		player.activeBet = 0;
		player.active = false
		player.view = false;
		player.dealer = '';
		player.smallBlind = false;
		player.bigBlind = false;
		player.button = false;
	});
}

const removePlayer = (socketId) => {
	const oldPlayers = gameState.players.length
	gameState.players = gameState.players.filter((player) => player.id !== socketId);
	if (gameState.players.length !== oldPlayers) {
		resetGame()
		// give pot to remaining player
		gameState.players.forEach((player) => potToPlayer(player));
	}
	gameState.spectators = gameState.spectators.filter((player) => player.id !== socketId);
};

const fold = (socketId) => {
		const player = gameState.players.filter((player) => player.id === socketId)[0];
		player.cards = [];
		player.activeBet = 0;
		player.view = true;
		check(socketId);

		var num_active = 0;
		for(let i = 0; i < gameState.players.length; i++) {
			if(gameState.players[i].view === false) {
				num_active = num_active + 1;
			}
		}

		if(num_active === 1) {
			console.log("ONE PLAYER LEFT");
			for(let i = 0; i < gameState.players.length; i++) {
				if(gameState.players[i].view === false) {
					console.log("winner is " + gameState.players[i].name);
					const winner = gameState.players[i];
					for(let j = 0; j < gameState.players.length; j++) {
						gameState.players[j].view = false;
					}
			  	potToPlayer(winner);
			  	dealPlayers();
			  	resetPlayerAction();
			  	moveBlinds();
				  gameState.minBet = 20;
					break;
				}
			}
		}
};

const allInMode = () => {
	console.log("all In");
	if (gameState.allIn === true) {
		// deal out remaining cards
		if (gameState.action === 'preflop') {
			gameState.gameDeck.dealCards(5).forEach((card) => gameState.board.push(card));
		} else if (gameState.action === 'flop') {
			gameState.gameDeck.dealCards(2).forEach((card) => gameState.board.push(card));
		} else if (gameState.action === 'turn') {
			gameState.gameDeck.dealCards(1).forEach((card) => gameState.board.push(card));
		}
		// go straight to showdown
		gameState.action = 'river'
	}
}


const call = (socketId) => {
	const callingPlayer = gameState.players.filter((player) => player.id === socketId)[0];
	let callAmount = gameState.activeBet;

	// check if call is within player's bankroll, else adjust
	if (callAmount > callingPlayer.bankroll + callingPlayer.activeBet) {
		callAmount = callingPlayer.bankroll + callingPlayer.activeBet
	}
	// add to pot call amount
	gameState.pot += callAmount - callingPlayer.activeBet;
	callingPlayer.bankroll -= callAmount - callingPlayer.activeBet ;
	callingPlayer.activeBet = callAmount;

	console.log('call amount', callAmount)
	console.log('calling player activeBet', callingPlayer.activeBet)
	// subtract from player stack

	// check to see if player is all in
if (callingPlayer.bankroll <= 0) {
	gameState.allIn = true
}
	// use check function to move to next player
	check(socketId);
};

const bet = (socketId, actionAmount) => {
	const bettingPlayer = gameState.players.filter((player) => player.id === socketId)[0];

	// currently static for now
	const betAmount = actionAmount;

	// adjust minimum raise
gameState.minBet = betAmount * 2 + gameState.activeBet

	// add to pot bet amount
	gameState.pot += betAmount;
	bettingPlayer.activeBet += betAmount;

	// adjust game active bet
	gameState.activeBet = betAmount;

	//subtract from player stack
	bettingPlayer.bankroll -= betAmount;

	// check to see if player is all in
if (bettingPlayer.bankroll <= 0) {
	gameState.allIn = true
}

	// reset action
	gameState.players.forEach((player) => {
		player.action = false;
	});
console.log('betting set the minbet to:', gameState.minBet)
	// use check function to move to next player
	check(socketId);
};

const raise = (socketId, actionAmount) => {
	const raisingPlayer = gameState.players.filter((player) => player.id === socketId)[0];

	let raiseAmount = actionAmount;

	// check if raise is within player's bankroll, else adjust
	if (raiseAmount > raisingPlayer.bankroll + raisingPlayer.activeBet) {
		raiseAmount = raisingPlayer.bankroll + raisingPlayer.activeBet
	}
console.log('raise amount', raiseAmount)
console.log('active bet', gameState.activeBet)
	// adjust minimum raise
	gameState.minBet = raiseAmount

	// calculating difference in raise
	const raiseDifference = gameState.minBet - gameState.activeBet
console.log('raise difference', raiseDifference)
	// add to pot bet amount
	gameState.pot += gameState.minBet - raisingPlayer.activeBet;

	//subtract from player stack
	raisingPlayer.bankroll -= gameState.minBet - raisingPlayer.activeBet;

		// check to see if player is all in
if (raisingPlayer.bankroll <= 0) {
	gameState.allIn = true
}


	raisingPlayer.activeBet = gameState.minBet
	// adjust game active bet
	gameState.activeBet = gameState.minBet
	console.log('raising set the minbet to:', gameState.minBet)

	// set up minBet for next player
	gameState.minBet = raiseDifference + gameState.activeBet
	// reset action
	gameState.players.forEach((player) => {
		player.action = false;
	});

	// use check function to move to next player
	check(socketId);
};

const addMessage = (message, socketId) => {
	// find if player is active or a spectator
	const activePlayer = gameState.players.filter((player) => player.id === socketId);
	const spectatorPlayer = gameState.spectators.filter((player) => player.id === socketId);

	let name = '';

	if (activePlayer.length > 0) {
		name = activePlayer[0].name;
	} else if (spectatorPlayer.length > 0) {
		name = '(Spectator) ' + spectatorPlayer[0].name;
	}

	gameState.messages.push({ text: message, author: name });
};

const addName = (name, socketId) => {
	const changePlayer = gameState.spectators.filter((player) => player.id === socketId)[0];
	changePlayer.name = name;
};

const rebuyPlayer = (socketId) => {
	const clientPlayer = gameState.players.filter((player) => player.id === socketId)[0]
	clientPlayer.bankroll = 1000
	clientPlayer.rebuys += 1
}

const spectatePlayer = (socketId) => {
	const oldPlayer = gameState.players.filter((player) => player.id == socketId)[0];
	gameState.spectators.push(oldPlayer)
	gameState.players = gameState.players.filter((player) => player.id !== socketId);
};


module.exports = {
	gameState,
	addPlayer,
	dealPlayers,
	setInitialBlinds,
	moveBlinds,
	check,
	playerActionCheck,
	changeBoard,
	removePlayer,
	fold,
	determineWinner,
	call,
	bet,
	raise,
	addMessage,
	addName,
	addSpectators,
	resetPlayerAction,
	determineLose,
	allInMode,
	resetGame,
	rebuyPlayer,
	spectatePlayer
};
