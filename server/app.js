const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
// const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;
const {
	gameState,
	addPlayer,
	dealPlayers,
	setInitialBlinds,
	check,
	playerActionCheck,
	changeBoard,
	removePlayer,
	fold,
	call,
	bet,
	raise,
	view,
	addMessage,
	addName,
	addSpectators,
	resetPlayerAction,
	moveBlinds,
	determineWinner,
	determineLose,
	allInMode,
	resetGame,
	rebuyPlayer,
	winnerMessage,
	spectatePlayer
} = require('./gameUtil');

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static middleware
app.use(express.static(path.join(__dirname, '..', 'public')));

// If you want to add routes, they should go here!

// For all GET requests that aren't to an API route,
// we will send the index.html!
app.get('/*', (req, res, next) => {
	res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Handle 404s
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Error handling endware
app.use((err, req, res, next) => {
	console.error(err.message);
	console.error(err.stack);
	res.status(err.status || 500);
	res.send(err.message || 'Internal server error');
});

// db.sync().then(() => {
// 	console.log('The database is synced');
// });

const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
const io = require('socket.io')(server, { pingInterval: 2000, pingTimeout: 5000 });

// server state
// game state storage

io.on('connection', (socket) => {
	console.log('a user connected:', socket.id);
	socket.emit('clientId', socket.id);

	addSpectators(socket.id);

	socket.on('join', () => {
		addPlayer(socket.id);
		if (gameState.players.length > 7) {
			gameState.players[0].dealer = 'D';
			gameState.started = true;
			setInitialBlinds();
			dealPlayers();
			io.sockets.emit('sound', 'dealCards');
		}

		io.sockets.emit('gameState', gameState);
	});
	io.sockets.emit('gameState', gameState);

	socket.on('start', () => {
			gameState.players[0].dealer = 'D';
			setInitialBlinds();
			dealPlayers();
			gameState.started = true;
			io.sockets.emit('sound', 'dealCards');
		io.sockets.emit('gameState', gameState);
	});
	io.sockets.emit('gameState', gameState);



	socket.on('action', (action) => {
		if (action.type === 'check') {
			check(socket.id);
			io.sockets.emit('sound', 'check');
		}

		if (action.type === 'fold') {
			fold(socket.id);
			io.sockets.emit('sound', 'dealCards');
		}

		if (action.type === 'call') {
			call(socket.id);
			io.sockets.emit('sound', 'chips');
		}

		if (action.type === 'bet') {
			bet(socket.id, action.amount);
			io.sockets.emit('sound', 'chips');
		}

		if (action.type === 'raise') {
			raise(socket.id, action.amount);
			io.sockets.emit('sound', 'chips');
		}

		io.sockets.emit('gameState', gameState);

		// check if all players have completed an action

		if (playerActionCheck()) {
			allInMode()
			changeBoard();
			io.sockets.emit('sound', 'dealCards');
			// send updated state
			io.sockets.emit('gameState', gameState);
			if (gameState.showdown === true) {
				// note, if player leaves during setTimeout window, state is stuck waiting until next player joins
				determineWinner();
				for(let i = 0; i < gameState.players.length; i++) {
					gameState.players[i].isAllIn = '';
				}
				io.sockets.emit('gameState', gameState);
				setTimeout(() => {
					if (determineWinner()) {
						for(let i = 0; i < gameState.players.length; i++) {
							console.log("num players app.js: " + gameState.players.length);
							gameState.players[i].view = false;
							gameState.players[i].button = false;
							gameState.players[i].isAllIn = '';
						}
						resetPlayerAction();
						moveBlinds();
						dealPlayers();
						/*
						for(let i = 0; i < gameState.players.length; i++) {
							io.sockets.emit('rebuy', determineLose())
						}
						*/
						for (let i = 0; i < gameState.players.length; i++) {
							if (gameState.players[i].bankroll <= 0) {
								io.sockets.emit('rebuy', gameState.players[i].id)
							}
						}
						gameState.minBet = 20
						gameState.showdown = false;
						gameState.sidePot = 'pot';
						gameState.winnerMessage = [];
						//gameState.started = true;
						gameState.allIn = false;
						io.sockets.emit('gameState', gameState)
						io.sockets.emit('sound', 'dealCards');
					} else {
						resetGame()
					}
				}, 10000);
				//io.sockets.emit('gameState', gameState);
			}
		}
	});

	socket.on('playerRebuy', () => {
		rebuyPlayer(socket.id)
		io.sockets.emit('gameState', gameState)
	})

	socket.on('spectatePlayer', () => {
		spectatePlayer(socket.id)
		resetGame()
		io.sockets.emit('gameState', gameState)
	})

	socket.on('message', (message) => {
		addMessage(message, socket.id);

		// send updated state
		io.sockets.emit('gameState', gameState);
	});

	socket.on('addName', (name) => {
		addName(name, socket.id);
		io.sockets.emit('gameState', gameState);
	});

	socket.on('disconnect', () => {
		console.log('player has disconnected', socket.id);
		removePlayer(socket.id);
		io.sockets.emit('gameState', gameState);
	});
});
