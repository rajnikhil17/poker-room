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
	pot2: 0,
	pot3: 0,
	pot4: 0,
	pot5: 0,
	pot6: 0,
	pot7: 0,
	pot8: 0,
	sidePot: 'pot',
	allInPlayers: [],
	bigBlindValue: 2,
	smallBlindValue: 1,
	activeBet: 0,
	messages: [],
	winnerMessage: [],
	started: false,
	showdown: false,
	minBet: 20,
	allIn: false,
	key: 0,
};

const addSpectators = (socketId) => {
	gameState.spectators.push({
		id: socketId,
		name: '',
		room: '',
		toLobby: false,
		view: false,
		bankroll: 1000,
		cards: [],
		action: false,
		button: false,
		smallBlind: false,
		bigBlind: false,
		dealer: '',
		isAllIn: '',
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
	gameState.pot2 = 0;
	gameState.pot3 = 0;
	gameState.pot4 = 0;
	gameState.pot5 = 0;
	gameState.pot6 = 0;
	gameState.pot7 = 0;
	gameState.pot8 = 0;
	gameState.players.forEach((player) => {
		if (player.smallBlind) {
			player.bankroll -= gameState.smallBlindValue;
			player.activeBet = gameState.smallBlindValue;
			gameState.pot += gameState.smallBlindValue;
		} else if (player.bigBlind) {
			player.bankroll -= gameState.bigBlindValue;
			player.activeBet = gameState.bigBlindValue;
			gameState.pot += gameState.bigBlindValue;
		}
	});

	// set initial bet to join in as BB value
	gameState.activeBet = gameState.bigBlindValue;
};

const setInitialBlinds = () => {
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
	var i;
	for (i = 0; i < gameState.players.length; i++) {
		if (gameState.players[i].id === socketId) {
			console.log(gameState.players[i].id);
			break;
		}
	}
	if(gameState.players[i] != null) {
		if(gameState.players[i].view === false) {
			gameState.players[i].action = true;
			for (let j = 0; j < gameState.players.length; j++) {
				gameState.players[j].active = false;
			}
			var count = 1;

			while((i + count) <= gameState.players.length) {
					if((i+count) === gameState.players.length) {
						i = 0;
						count = 0;
					}
					else if(gameState.players[i + count].view === true) {
						count = count + 1;
					}
					else {
						gameState.players[i+count].active = true;
						//gameState.players[i].action = true;
						gameState.players[i].button = true;
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
	}

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
			return false;
		}
	}
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
	var num_players = 0;
	for (let i = 0; i < gameState.players.length; i++) {
		if(gameState.players[i].view === false) {
			num_players = num_players + 1;
		}
	}
	const halfPot = gameState.pot / num_players;
	gameState.players.forEach((player) => {
		if(player.view === false) {
			player.bankroll += halfPot;
		}
	});
	gameState.pot = 0;
};



const incrementPot = () => {
	if(gameState.sidePot === 'pot') {
		gameState.sidePot = 'pot2';
	}
	else if (gameState.sidePot === 'pot2') {
		gameState.sidePot = 'pot3';
	}
	else if (gameState.sidePot === 'pot3') {
		gameState.sidePot = 'pot4';
	}
	else if (gameState.sidePot === 'pot4') {
		gameState.sidePot = 'pot5';
	}
	else if (gameState.sidePot === 'pot5') {
		gameState.sidePot = 'pot6';
	}
	else if (gameState.sidePot === 'pot6') {
		gameState.sidePot = 'pot7';
	}
	else if (gameState.sidePot === 'pot7') {
		gameState.sidePot = 'pot8';
	}
}


const determineWinner = () => {
	const hands = gameState.players;
	const board = gameState.board;
	var num_players = 0;
	for (let i = 0; i < gameState.players.length; i++) {
		if(gameState.players[i].view === false) {
			num_players = num_players + 1;
		}
	}

	// check to see if any players have left during showdown to prevent server crash
	if(gameState.pot2 === 0) {
		if (gameState.players.length > 1 ) {
			const results = Ranker.orderHands(hands, board);
			console.log(results)
			// check for tie
			if (results[0].length > 1) {
				potToTie();
				const tieMsg = 'Tie pot, all players have ' + results[0][0].description;
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
	}
	else {

		//pot --> only allIn player can win? or everyone can?
		//pot2 --> only non-allIn players can win this


		if (gameState.players.length > 1 ){
			const results = Ranker.orderHands(hands, board);
			console.log(results)
			// check for tie
			if (results[0].length > 1) {
				potToTie();
				const tieMsg = 'Tie pot, all players have ' + results[0][0].description;
				gameState.winnerMessage.push({ text: tieMsg, author: 'Game' });

			} else {
				const winnerId = results[0][0].id;
				const winner = gameState.players.filter((player) => player.id === winnerId)[0];
				if(winner.isAllIn === '') {
					const totalPot = gameState.pot + gameState.pot2 + gameState.pot3 + gameState.pot4 + gameState.pot5 + gameState.pot6 + gameState.pot7 + gameState.pot8;
					const winnerMsg = winner.name + ' won $' + totalPot + ' with ' + results[0][0].description;
					gameState.winnerMessage.push({ text: winnerMsg, author: 'Game' });
					winner.bankroll += totalPot;
				}
				else {
					var i;
					for(i = 0; i < gameState.allInPlayers.length; i++) {
						if(gameState.allInPlayers[i] === winner) {
							break;
						}
					}

					var winnerMsg;
					if(i === 0) {
						//give pot to winner and divide rest of pot and give it to rest of playerCards
						potToPlayer(winner);
						winnerMsg = winner.name + ' won $' + gameState.pot + ' with ' + results[0][0].description;
						var remaining = (gameState.pot2 + gameState.pot3 + gameState.pot4 + gameState.pot5 + gameState.pot6 + gameState.pot7 + gameState.pot8)/(num_players-1);
					}
					else if (i === 1) {
						winner.bankroll += gameState.pot2;
						winnerMsg = winner.name + ' won $' + gameState.pot2 + ' with ' + results[0][0].description;
						var remaining = (gameState.pot3 + gameState.pot4 + gameState.pot5 + gameState.pot6 + gameState.pot7 + gameState.pot8)/(num_players-2);
					}
					else if (i === 2) {
						winner.bankroll += gameState.pot3;
						winnerMsg = winner.name + ' won $' + gameState.pot3 + ' with ' + results[0][0].description;
						var remaining = (gameState.pot4 + gameState.pot5 + gameState.pot6 + gameState.pot7 + gameState.pot8)/(num_players-3);
					}
					else if (i === 3) {
						winner.bankroll += gameState.pot4;
						winnerMsg = winner.name + ' won $' + gameState.pot4 + ' with ' + results[0][0].description;
						var remaining = (gameState.pot5 + gameState.pot6 + gameState.pot7 + gameState.pot8)/(num_players-4);
					}
					else if (i === 4) {
						winner.bankroll += gameState.pot5;
						winnerMsg = winner.name + ' won $' + gameState.pot5 + ' with ' + results[0][0].description;
						var remaining = (gameState.pot6 + gameState.pot7 + gameState.pot8)/(num_players-5);
					}
					else if (i === 5) {
						winner.bankroll += gameState.pot6;
						winnerMsg = winner.name + ' won $' + gameState.pot6 + ' with ' + results[0][0].description;
						var remaining = (gameState.pot7 + gameState.pot8)/(num_players-6);
					}
					else if (i === 6) {
						winner.bankroll += gameState.pot7;
						winnerMsg = winner.name + ' won $' + gameState.pot7 + ' with ' + results[0][0].description;
						var remaining = (gameState.pot8)/(num_players-7);
					}
					else if (i === 7) {
						winner.bankroll += gameState.pot8;
						winnerMsg = winner.name + ' won $' + gameState.pot8 + ' with ' + results[0][0].description;
						var remaining = 0;
					}
					//give remaining pot back to players
					gameState.players.forEach((player) => {
						if(player.view === false && player.isAllIn === '') {
							player.bankroll += remaining;
						}
					});
					console.log("remaining: " + remaining);
					gameState.winnerMessage.push({ text: winnerMsg, author: 'Game' });
				}
				//clear pots
				gameState.pot = 0;
				gameState.pot2 = 0;
				gameState.pot3 = 0;
				gameState.pot4 = 0;
				gameState.pot5 = 0;
				gameState.pot6 = 0;
				gameState.pot7 = 0;
				gameState.pot8 = 0;
			}
			return true
		} else {
			return false
		}

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
	console.log("GAME BEING RESET");
	gameState.board = [];
	gameState.messages = [];
	gameState.winnerMessage = [];
	gameState.minBet = 20;
	gameState.sidePot = 'pot';
	gameState.started = false;
	gameState.players.forEach((player) => {
		console.log("RESETTING " + player.name);
		player.cards = [];
		player.room = '';
		player.activeBet = 0;
		player.active = false
		player.view = false;
		player.dealer = '';
		player.isAllIn = '';
		player.smallBlind = false;
		player.bigBlind = false;
		player.button = false;
	});
}

const removePlayer = (socketId) => {

/*
	const removedPlayer = gameState.players.filter((player) => player.id === socketId)[0];
	let i;
	for(i = 0; i < gameState.players.length; i++) {
		if (gameState.players[i] === removedPlayer) {
			break;
		}
	}

	let x;
	for(x = 0; x < gameState.spectators.length; x++) {
		if (gameState.spectators[x] === removedPlayer) {
			break;
		}
	}

	var isTurn = 0;
	if(removedPlayer != null) {
		if(removedPlayer.active === true) {
			isTurn = 1;
		}
	}

	//if(gameState.spectators.length > 0) {
	//	gameState.spectators.pop();
	//}

	gameState.spectators = gameState.spectators.filter((player) => player.id !== socketId);
  gameState.players.splice(i, 1);
	console.log("NUM PLAYERS: " + gameState.players.length);
	console.log("NUM SPECTATORS: " + gameState.spectators.length);

		if(gameState.players.length > 1) {
			if(isTurn === 1) {
				gameState.players[0].active = true;
			}
		}
		else if(gameState.players.length < 1) {
			resetGame();
		}
		else if (gameState.players.length === 1) {
			resetGame();
			gameState.players.forEach((player) => potToPlayer(player));
		}
		*/

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
		player.fold = true;
		check(socketId);

		var num_active = 0;
		for(let i = 0; i < gameState.players.length; i++) {
			if(gameState.players[i].view === false) {
				num_active = num_active + 1;
			}
		}

		if(num_active === 1) {
			for(let i = 0; i < gameState.players.length; i++) {
				if(gameState.players[i].view === false) {
					const winner = gameState.players[i];
					for(let j = 0; j < gameState.players.length; j++) {
						gameState.players[j].view = false;
						gameState.players[j].action = false;
						gameState.players[j].isAllIn = '';
					}

					const winnerMsg = winner.name + ' won $' + gameState.pot;
					gameState.messages.push({ text: winnerMsg, author: "GAME" });
					//gameState.winnerMessage.push({ text: winnerMsg, author: 'Game' });
					potToPlayer(winner);
					//setTimeout(() => {
							dealPlayers();
							resetPlayerAction();
							moveBlinds();
							gameState.minBet = 20
							gameState.winnerMessage = [];
							for (let i = 0; i < gameState.players.length; i++) {
								if (gameState.players[i].bankroll <= 0) {
									io.sockets.emit('rebuy', gameState.players[i].id)
								}
							}
					//		console.log("winner message: " + gameState.winnerMessage);
				//	}, 10000);

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

	/*
	const callDifference = gameState.minBet - callAmount;

	//count number of actual players
	var num_players = 0;
	for (let i = 0; i < gameState.players.length; i++) {
		if(gameState.players[i].view === false) {
			num_players = num_players + 1;
		}
	}
		// add to pot bet amount

		if(gameState.allIn === true && num_players > 2){
			if(callingPlayer.isAllIn === '' && callAmount < gameState.minBet) {
				console.log("CALL");
				console.log("callAmount: " + callAmount);
				console.log("callDifference: " + callDifference);
				incrementPot();
				if(gameState.sidePot === 'pot') {
					gameState.pot += callAmount - callingPlayer.activeBet;

				} else if(gameState.sidePot === 'pot2') {
					gameState.pot2 += callAmount - callingPlayer.activeBet;
					gameState.pot += callDifference;
					gameState.allInPlayers[0].bankroll -= callDifference;
				}
				else if(gameState.sidePot === 'pot3') {
					gameState.pot3 += callAmount - callingPlayer.activeBet;
					gameState.pot2 += callDifference;
					gameState.allInPlayers[1].bankroll -= callDifference;
				}
				else if(gameState.sidePot === 'pot4') {
					gameState.pot4 += callAmount - callingPlayer.activeBet;
					gameState.pot3 += callDifference;
					gameState.allInPlayers[2].bankroll -= callDifference;
				}
				else if(gameState.sidePot === 'pot5') {
					gameState.pot5 += callAmount - callingPlayer.activeBet;
					gameState.pot4 += callDifference;
					gameState.allInPlayers[3].bankroll -= callDifference;
				}
				else if(gameState.sidePot === 'pot6') {
					gameState.pot6 += callAmount - callingPlayer.activeBet;
					gameState.pot5 += callDifference;
					gameState.allInPlayers[4].bankroll -= callDifference;
				}
				else if(gameState.sidePot === 'pot7') {
					gameState.pot7 += callAmount - callingPlayer.activeBet;
					gameState.pot6 += callDifference;
					gameState.allInPlayers[5].bankroll -= callDifference;
				}
				else if(gameState.sidePot === 'pot8') {
					gameState.pot8 += callAmount - callingPlayer.activeBet;
					gameState.pot7 += callDifference;
					gameState.allInPlayers[6].bankroll -= callDifference;
				}
			}
		} else {
			gameState.pot += callAmount - callingPlayer.activeBet;
		}
		*/
	gameState.pot += callAmount - callingPlayer.activeBet;

	callingPlayer.bankroll -= callAmount - callingPlayer.activeBet ;
	callingPlayer.activeBet = callAmount;

	console.log('call amount', callAmount)
	console.log('calling player activeBet', callingPlayer.activeBet)
	// subtract from player stack

	// check to see if player is all in
if (callingPlayer.bankroll <= 0) {

	gameState.allIn = true;
	const allInPlayer = gameState.players.filter((player) => player.id === socketId)[0];
	allInPlayer.isAllIn = 'ALL IN';
	gameState.allInPlayers.push(allInPlayer);

	if(gameState.players.length <= 2) {
		const winner = gameState.players.filter((player) => player.id !== socketId)[0];
		const winnerMsg = winner.name + ' won $' + gameState.pot;
		gameState.messages.push({ text: winnerMsg, author: "GAME" });
		potToPlayer(winner);
		dealPlayers();
		resetPlayerAction();
		moveBlinds();
		gameState.minBet = 20
	}
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
const betDifference = betAmount - gameState.activeBet

//count number of actual players
var num_players = 0;
for (let i = 0; i < gameState.players.length; i++) {
	if(gameState.players[i].view === false) {
		num_players = num_players + 1;
	}
}
	// add to pot bet amount
	if(gameState.allIn === true && num_players > 2){
		console.log("BET:");
		console.log("adding to new side pot: $" + betDifference);
		console.log("adding to main pot: $" + gameState.activeBet);
		if (bettingPlayer.isAllIn === '' && betDifference >= 0) {
			incrementPot();
			if(gameState.sidePot === 'pot') {
				gameState.pot += betAmount;

			} else if(gameState.sidePot === 'pot2') {
				gameState.pot += gameState.activeBet;
				gameState.pot2 += betDifference;
			}
			else if(gameState.sidePot === 'pot3') {
				gameState.pot2 += gameState.activeBet;
				gameState.pot3 += betDifference;
			}
			else if(gameState.sidePot === 'pot4') {
				gameState.pot3 += gameState.activeBet;
				gameState.pot4 += betDifference;
			}
			else if(gameState.sidePot === 'pot5') {
				gameState.pot4 += gameState.activeBet;
				gameState.pot5 += betDifference;
			}
			else if(gameState.sidePot === 'pot6') {
				gameState.pot5 += gameState.activeBet;
				gameState.pot6 += betDifference;
			}
			else if(gameState.sidePot === 'pot7') {
				gameState.pot6 += gameState.activeBet;
				gameState.pot7 += betDifference;
			}
			else if(gameState.sidePot === 'pot8') {
				gameState.pot7 += gameState.activeBet;
				gameState.pot8 += betDifference;
			}
		}
		else if (bettingPlayer.isAllIn === '' && betDifference < 0) {
			incrementPot();
			if(gameState.sidePot === 'pot') {
				gameState.pot += gameState.minBet;

			} else if(gameState.sidePot === 'pot2') {
				gameState.pot2 += betAmount;
				gameState.pot += betDifference;
				gameState.allInPlayers[0].bankroll -= betDifference;
			}
			else if(gameState.sidePot === 'pot3') {
				gameState.pot3 += betAmount;
				gameState.pot2 += betDifference;
				gameState.allInPlayers[1].bankroll -= betDifference;
			}
			else if(gameState.sidePot === 'pot4') {
				gameState.pot4 += betAmount;
				gameState.pot3 += betDifference;
				gameState.allInPlayers[2].bankroll -= betDifference;
			}
			else if(gameState.sidePot === 'pot5') {
				gameState.pot5 += betAmount;
				gameState.pot4 += betDifference;
				gameState.allInPlayers[3].bankroll -= betDifference;
			}
			else if(gameState.sidePot === 'pot6') {
				gameState.pot6 += betAmount;
				gameState.pot5 += betDifference;
				gameState.allInPlayers[4].bankroll -= betDifference;
			}
			else if(gameState.sidePot === 'pot7') {
				gameState.pot7 += betAmount;
				gameState.pot6 += betDifference;
				gameState.allInPlayers[5].bankroll -= betDifference;
			}
			else if(gameState.sidePot === 'pot8') {
				gameState.pot8 += betAmount;
				gameState.pot7 += betDifference;
				gameState.allInPlayers[6].bankroll -= betDifference;
			}
		}
 	} else {
		gameState.pot += betAmount;
	}



	bettingPlayer.activeBet += betAmount;

	// adjust game active bet
	gameState.activeBet = betAmount;

	//subtract from player stack
	bettingPlayer.bankroll -= betAmount;

	// check to see if player is all in
if (bettingPlayer.bankroll <= 0) {
	gameState.allIn = true;
	const allInPlayer = gameState.players.filter((player) => player.id === socketId)[0];
	allInPlayer.isAllIn = 'ALL IN';
	gameState.allInPlayers.push(allInPlayer);

	if(gameState.players.length <= 2) {
		const winner = gameState.players.filter((player) => player.id !== socketId)[0];
		const winnerMsg = winner.name + ' won $' + gameState.pot;
		gameState.messages.push({ text: winnerMsg, author: "GAME" });
		potToPlayer(winner);
		dealPlayers();
		resetPlayerAction();
		moveBlinds();
		gameState.minBet = 20
	}
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

//count number of actual players
var num_players = 0;
for (let i = 0; i < gameState.players.length; i++) {
	if(gameState.players[i].view === false) {
		num_players = num_players + 1;
	}
}
	// add to pot bet amount
	if(gameState.allIn === true && num_players > 2){
		if (raisingPlayer.isAllIn === '' && raiseDifference >= 0) { //and bet is greater than pot then calculate extra and add to side pot

			//create and add to new side pot (side pot)
			incrementPot();
			if(gameState.sidePot === 'pot') {
				gameState.pot += gameState.activeBet;

			} else if(gameState.sidePot === 'pot2') {
				gameState.pot += gameState.activeBet;
				gameState.pot2 += raiseDifference;
			}
			else if(gameState.sidePot === 'pot3') {
				gameState.pot2 += gameState.activeBet;
				gameState.pot3 += raiseDifference;
			}
			else if(gameState.sidePot === 'pot4') {
				gameState.pot3 += gameState.activeBet;
				gameState.pot4 += raiseDifference;
			}
			else if(gameState.sidePot === 'pot5') {
				gameState.pot4 += gameState.activeBet;
				gameState.pot5 += raiseDifference;
			}
			else if(gameState.sidePot === 'pot6') {
				gameState.pot5 += gameState.activeBet;
				gameState.pot6 += raiseDifference;
			}
			else if(gameState.sidePot === 'pot7') {
				gameState.pot6 += gameState.activeBet;
				gameState.pot7 += raiseDifference;
			}
			else if(gameState.sidePot === 'pot8') {
				gameState.pot7 += gameState.activeBet;
				gameState.pot8 += raiseDifference;
			}
		}
		else if (raisingPlayer.isAllIn === '' && raiseDifference < 0) {
			incrementPot();
			if(gameState.sidePot === 'pot') {
				gameState.pot += gameState.minBet;

			} else if(gameState.sidePot === 'pot2') {
				gameState.pot2 += gameState.minBet;
				gameState.pot += raiseDifference;
				gameState.allInPlayers[0].bankroll -= raiseDifference;
			}
			else if(gameState.sidePot === 'pot3') {
				gameState.pot3 += gameState.minBet;
				gameState.pot2 += raiseDifference;
				gameState.allInPlayers[1].bankroll -= raiseDifference;
			}
			else if(gameState.sidePot === 'pot4') {
				gameState.pot4 += gameState.minBet;
				gameState.pot3 += raiseDifference;
				gameState.allInPlayers[2].bankroll -= raiseDifference;
			}
			else if(gameState.sidePot === 'pot5') {
				gameState.pot5 += gameState.minBet;
				gameState.pot4 += raiseDifference;
				gameState.allInPlayers[3].bankroll -= raiseDifference;
			}
			else if(gameState.sidePot === 'pot6') {
				gameState.pot6 += gameState.minBet;
				gameState.pot5 += raiseDifference;
				gameState.allInPlayers[4].bankroll -= raiseDifference;
			}
			else if(gameState.sidePot === 'pot7') {
				gameState.pot7 += gameState.minBet;
				gameState.pot6 += raiseDifference;
				gameState.allInPlayers[5].bankroll -= raiseDifference;
			}
			else if(gameState.sidePot === 'pot8') {
				gameState.pot8 += gameState.minBet;
				gameState.pot7 += raiseDifference;
				gameState.allInPlayers[6].bankroll -= raiseDifference;
			}
		}
	} else {
		gameState.pot += gameState.minBet - raisingPlayer.activeBet;
	}

	//subtract from player stack
	raisingPlayer.bankroll -= gameState.minBet - raisingPlayer.activeBet;

		// check to see if player is all in
if (raisingPlayer.bankroll <= 0) {
	gameState.allIn = true;
	const allInPlayer = gameState.players.filter((player) => player.id === socketId)[0];
	allInPlayer.isAllIn = 'ALL IN';
	gameState.allInPlayers.push(allInPlayer);

	if(gameState.players.length <= 2) {
		const winner = gameState.players.filter((player) => player.id !== socketId)[0];
		const winnerMsg = winner.name + ' won $' + gameState.pot;
		gameState.messages.push({ text: winnerMsg, author: "GAME" });
		potToPlayer(winner);
		dealPlayers();
		resetPlayerAction();
		moveBlinds();
		gameState.minBet = 20
	}
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

const addRoom = (room, socketId) => {
	const changePlayer = gameState.spectators.filter((player) => player.id === socketId)[0];
	changePlayer.room = room;
};

const setToLobby = (socketId) => {
	const changePlayer = gameState.spectators.filter((player) => player.id === socketId)[0];
	changePlayer.toLobby = false;
};

const resetTimer = () => {
	var k = gameState.key + 1;
	for (let i = 0; i < gameState.players.length; i++) {
		gameState.key = k;
	}
}

const rebuyPlayer = (socketId) => {
	const clientPlayer = gameState.players.filter((player) => player.id === socketId)[0]
	clientPlayer.bankroll = 200;
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
	addRoom,
	setToLobby,
	addSpectators,
	resetPlayerAction,
	determineLose,
	allInMode,
	resetGame,
	rebuyPlayer,
	spectatePlayer,
	resetTimer,
};
