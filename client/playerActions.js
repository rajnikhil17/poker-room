import React from 'react';
import Bet from './buttons/Bet';
import Raise from './buttons/Raise';
import Check from './buttons/Check';
import Fold from './buttons/Fold';
import Call from './buttons/Call';
import BetSlider from './buttons/Slider'
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

const Actions = (props) => {
	const showdown = props.showdown;
	const clientPlayer = props.clientPlayer;
	const activeBet = props.activeBet;
	const view = props.view;
	return (
		<div>
			{clientPlayer.map((player) => {
				if(player.view === true)
				{
					player.active = false;
					console.log("Player " + player.name + " view is " + player.view);
					return (
						<div>

							<div className="buttons-container-hidden" key={player.id} />;
						</div>
					);
				}
				else if (player.active === false || player.view === true) {
					return (
						<div>

							<div className="buttons-container-hidden" key={player.id} />;
						</div>
					);
				}
				else if (player.isAllIn === "ALL IN") {
					return (
					<div>

					<div className="buttons-container" key={player.id}>
						<div className="player-buttons">
							<Check check={props.check} />
						</div>
					</div>
					</div>
				);
				}
				else if (player.active && activeBet <= player.activeBet && showdown === false) {
					return (
						<div>

						<div className="buttons-container" key={player.id}>
							<div className="player-buttons">
								<Bet  betAmount={props.betAmount} bet={props.bet} activeBet={activeBet} />
							</div>
							<div className="player-buttons">
								<Raise bankroll={player.bankroll + player.activeBet} betAmount={props.betAmount} raise={props.raise} activeBet={activeBet} player={clientPlayer} />
							</div>
							<div className="player-buttons">
								<Check check={props.check} />
							</div>
							<div className="player-buttons">
								<Fold fold={props.fold} />
							</div>
						</div>
						<BetSlider  minBet={props.minBet} changeBet={props.changeBet} bankroll={player.bankroll + player.activeBet} />
						</div>
					);
				} else if (player.active && activeBet > player.activeBet && showdown === false) {
					return (
						<div>

						<div className="buttons-container" key={player.id}>
							<div className="player-buttons">
								<Bet  betAmount={props.betAmount} bet={props.bet} activeBet={activeBet} />
							</div>
							<div className="player-buttons">
								<Raise bankroll={player.bankroll + player.activeBet} betAmount={props.betAmount} raise={props.raise} activeBet={activeBet} player={clientPlayer} />
							</div>
							<div className="player-buttons">
								<Call bankroll={player.bankroll + player.activeBet} call={props.call} activeBet={activeBet} playerActiveBet={player.activeBet} />
							</div>
							<div className="player-buttons">
								<Fold fold={props.fold} />
							</div>
						</div>
						<BetSlider  minBet={props.minBet} changeBet={props.changeBet} bankroll={player.bankroll + player.activeBet} />
						</div>
					);
				}
			})}
		</div>
	);
};

export default Actions;
