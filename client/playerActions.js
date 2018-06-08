import React from 'react';
import Bet from './buttons/Bet';
import Raise from './buttons/Raise';
import Check from './buttons/Check';
import Fold from './buttons/Fold';
import Call from './buttons/Call';

const Actions = (props) => {
	const showdown = props.showdown;
	const clientPlayer = props.clientPlayer;
	const activeBet = props.activeBet;
	return (
		<div>
			{clientPlayer.map((player) => {
				if (player.active === false) {
					return <div className="buttons-container-hidden" key={player.id} />;
				} else if (player.active && activeBet <= player.activeBet && showdown === false) {
					return (
						<div className="buttons-container" key={player.id}>
							<div className="player-buttons">
								<Bet bet={props.bet} activeBet={activeBet} />
							</div>
							<div className="player-buttons">
								<Raise raise={props.raise} activeBet={activeBet} player={clientPlayer} />
							</div>
							<div className="player-buttons">
								<Check check={props.check} />
							</div>
							<div className="player-buttons">
								<Fold fold={props.fold} />
							</div>
						</div>
					);
				} else if (player.active && activeBet > player.activeBet && showdown === false) {
					return (
						<div className="buttons-container" key={player.id}>
							<div className="player-buttons">
								<Bet bet={props.bet} activeBet={activeBet} />
							</div>
							<div className="player-buttons">
								<Raise raise={props.raise} activeBet={activeBet} player={clientPlayer} />
							</div>
							<div className="player-buttons">
								<Call call={props.call} activeBet={activeBet} playerActiveBet={player.activeBet} />
							</div>
							<div className="player-buttons">
								<Fold fold={props.fold} />
							</div>
						</div>
					);
				}
			})}
		</div>
	);
};

export default Actions;