import React, { Component } from 'react';
import io from 'socket.io-client';
import { getPlayer } from './store/clientPlayer';
import { connect } from 'react-redux';
import Seats from './seats';
import Actions from './playerActions';
import Board from './Board';
import SoundEffects from './SoundEffects';
import { setTimeout } from 'timers';
import Chip from './Chips';
import Chatbox from './Chatbox';
import Lobby from './Lobby';
import Join from './buttons/Join';
import Start from './buttons/Start';
import PlayerCards from './playerCards';
import OpponentCards from './opponentCards';
import WinnerMessage from './WinnerMessage';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

let socket;
const mapStateToProps = (state) => ({ state });
const mapDispatchToProps = (dispatch) => ({ getPlayer: (id) => dispatch(getPlayer(id)) });

class Test extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: '',
			name: '',
			view: false,
			dealer: '',
			isAllIn: '',
			seated: false,
			gameState: {
				spectators: [],
				players: [],
				gameDeck: '',
				board: [],
				activeBet: 0,
				pot: 0,
				pot2: 0,
				pot3: 0,
				pot4: 0,
				pot5: 0,
				pot6: 0,
				pot7: 0,
				pot8: 0,
				sidePot: 'pot',
				messages: [],
				winnerMessage: [],
				started: false,
				showdown: false
			},
			sound: 'none',
			joined: false,
			spectator: true,
			betAmount: 10,
			rebuyWindow: false
		};
		this.check = this.check.bind(this);
		this.fold = this.fold.bind(this);
		this.call = this.call.bind(this);
		this.bet = this.bet.bind(this);
		this.raise = this.raise.bind(this);
		this.messageSubmit = this.messageSubmit.bind(this);
		this.addName = this.addName.bind(this);
		this.join = this.join.bind(this);
		this.start = this.start.bind(this);
		this.changeBet = this.changeBet.bind(this);
		socket = io.connect();
		socket.on('clientId', (id) => {
			this.setState({ id });
		});
		socket.on('gameState', (gameState) => {
			this.setState({ gameState, betAmount: gameState.minBet });
		});
		socket.on('sound', (soundEffect) => {
			this.setState({ sound: soundEffect });
			setTimeout(() => {
				this.setState({ sound: 'none' });
			}, 500);
		});
		socket.on('rebuy', (id) => {
			if (id === this.state.id) {
				this.setState({ rebuyWindow: true });
			}
		});

	}

	fold() {
		const action = { type: 'fold' };
		socket.emit('action', action);
	}

	check() {
		const action = { type: 'check' };
		socket.emit('action', action);
	}

	call() {
		const action = { type: 'call' };
		socket.emit('action', action);
	}

	bet() {
		const action = { type: 'bet', amount: this.state.betAmount };
		socket.emit('action', action);
		//clear bet after player action
		this.setState({ betAmount: 0 });
	}

	changeBet(amount) {
		this.setState({ betAmount: amount });
	}

	raise() {
		const action = { type: 'raise', amount: this.state.betAmount };
		socket.emit('action', action);
	}

	messageSubmit(message) {
		socket.emit('message', message);
	}

	addName(name) {
		this.setState({ name });
		socket.emit('addName', name);
	}

	join() {
		socket.emit('join');
		if(this.state.gameState.started === true) {
			this.setState({ joined: true, spectator: false, view: true });
		}
		else {
			this.setState({ joined: true, spectator: false, view: false });
		}
	}

	start() {
		socket.emit('start');
		this.setState({ started: true});
	}

	handleRebuy = () => {
		socket.emit('playerRebuy')
		this.setState({ rebuyWindow: false });
	}

	handleClose = () => {
		socket.emit('spectatePlayer')
		this.setState({ rebuyWindow: false, joined: false });
	}

	state= {
		showTimer: false,
	}

	render() {
		const players = this.state.gameState.players;
		const id = this.state.id;
		const clientPlayer = players.filter((player) => player.id === id);

		if (this.state.name === '') {
			return <Lobby players={players} spectators={this.state.gameState.spectators} addName={this.addName} />;
		} else {
			/*
			//check to see if timer should be shown
			if(this.state.gameState.showdown === false) {
				{players.map((player) => {
					if(player.active === true) {
						this.setState({ showTimer: true });
					}
				})}
			}
*/
			return (
				<div style={{height: '100%'}}>
						<Start joined={this.state.joined} started={this.state.gameState.started} players={this.state.gameState.players} start={this.start} />
					<div className="container">
						<img className="table" src="poker_table.svg" />
						<SoundEffects sound={this.state.sound} />
						<Seats clientPlayer={clientPlayer} id={id} players={players}/>
						<Board pot={this.state.gameState.pot} pot2={this.state.gameState.pot2} pot3={this.state.gameState.pot3} pot4={this.state.gameState.pot4} pot5={this.state.gameState.pot5} pot6={this.state.gameState.pot6} pot7={this.state.gameState.pot7} pot8={this.state.gameState.pot8} players={players} board={this.state.gameState.board} />
						<PlayerCards players={this.state.gameState.players} id={this.state.id} />
						<OpponentCards
							spectator={this.state.spectator}
							showdown={this.state.gameState.showdown}
							players={this.state.gameState.players}
							id={this.state.id}
							messages={this.state.gameState.messages}
							view={this.state.view}
						/>
						<Chip
							spectator={this.state.spectator}
							players={this.state.gameState.players}
							id={this.state.id}
							view={this.state.view}
							clientPlayer={clientPlayer}
						/>
					</div>
					/*
					{this.state.showTimer?<CountdownCircleTimer
						isPlaying
						duration={30}
						colors={[
							['#004777', 0.4],
							['#F7B801', 0.4],
							['#A30000', 0.2],
						]}
						onComplete={() => {
							 this.fold();
							 return [true, 0] // repeat animation in 1.5 seconds
						 }}
					>
						{({ remainingTime }) => remainingTime}
					</CountdownCircleTimer>:null}
*/
					<Actions
						minBet={this.state.gameState.minBet}
						betAmount={this.state.betAmount}
						changeBet={this.changeBet}
						showdown={this.state.gameState.showdown}
						raise={this.raise}
						bet={this.bet}
						call={this.call}
						fold={this.fold}
						clientPlayer={clientPlayer}
						check={this.check}
						activeBet={this.state.gameState.activeBet}
						view={this.state.view}
					/>
					<Join seated={this.state.seated} joined={this.state.joined} spectator={this.state.spectator} started={this.state.gameState.started} players={this.state.gameState.players} join={this.join}/>
					<WinnerMessage winnerMessage={this.state.gameState.winnerMessage} />
					<Chatbox messages={this.state.gameState.messages} messageSubmit={this.messageSubmit} />
					<Dialog open={this.state.rebuyWindow} onClose={this.handleClose}>
						<DialogTitle>
							{' '}
							<Typography align="center" variant="subheading" gutterBottom>
								Would you like to rebuy?
							</Typography>
						</DialogTitle>

						<DialogActions>
							<div style={{ flex:1, alignContent: 'center' }}>
									<Button variant="contained" color="secondary" onClick={this.handleRebuy}>
										Yes
									</Button>
									<Button variant="contained" color="secondary" onClick={this.handleClose}>
										No
									</Button>
							</div>
						</DialogActions>
					</Dialog>
				</div>
			);
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Test);
