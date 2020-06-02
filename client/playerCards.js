import React from 'react';

const PlayerCards = (props) => {
	const players = props.players;
	const id = props.id;

	const clientPlayer = players.filter((player) => player.id === id);
	return (
			<div className="playerBoard">
				{clientPlayer.map((player) => {
					if (player.cards.length > 0) {
						return (
							<div className="boardInner" style={{top:30, left:0, position: 'absolute'}}>
								<img className="playerCards" src={`/cardImages/${player.cards[0]}.png`} />
								<img className="playerCards" src={`/cardImages/${player.cards[1]}.png`} />
							</div>
						);
					} else {
						return <div />;
					}
				})}
			</div>
	);
};

export default PlayerCards;
