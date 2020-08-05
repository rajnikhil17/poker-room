import React from 'react';

const OpponentCards = (props) => {
	const showdown = props.showdown;
	const players = props.players;
	const spectator = props.spectator;
	console.log("is spectator? " + spectator);
	const id = props.id;
	const messages = props.messages;
	var left = 1;
	var diff = 0;

	var client_index = 0;
	players.map((player) => {
		if(player.id === id) {
			client_index = players.indexOf(player);
		}
	})
	console.log("before any if statements");
	const otherPlayer = players.filter((player) => player.id !== id);
	// player view
	if (!spectator) {
		console.log("if spectator");
		return (
				otherPlayer.map((player) => {
					//display cards for players seated to the left of client player
					if(players.indexOf(player) > client_index) {
						left = left + 1;
						if (player.cards.length > 0 && showdown === false) {
							return (
								<div className={'boardInner-' + left}>
									<img className="playerCards" src={`/cardImages/blank.png`} />
									<img className="playerCards" src={`/cardImages/blank.png`} />
								</div>
							);
						}

						else if (player.cards.length > 0 && showdown === true) {
							return (
								<div className={'boardInner-' + left}>
									<img className="playerCards" src={`/cardImages/${player.cards[0]}.png`} />
									<img className="playerCards" src={`/cardImages/${player.cards[1]}.png`} />
								</div>
							);
						}

						else {
							return <div />;
						}
						//display cards for players seated to the right of client player
					} else if (players.indexOf(player) < client_index) {
							diff = client_index - players.indexOf(player);
							if (player.cards.length > 0 && showdown === false) {
								return (
									<div className={'boardInner-' + (9 - diff)}>
										<img className="playerCards" src={`/cardImages/blank.png`} />
										<img className="playerCards" src={`/cardImages/blank.png`} />
									</div>
								);
							}

							else if (player.cards.length > 0 && showdown === true) {
								return (
									<div className={'boardInner-' + (9 - diff)}>
										<img className="playerCards" src={`/cardImages/${player.cards[0]}.png`} />
										<img className="playerCards" src={`/cardImages/${player.cards[1]}.png`} />
									</div>
								);
							}

							else {
								return <div />;
							}
					}
				})

		); // spectator view
	} else if(spectator){
		left = 0;
		console.log("not spectator");
		return (
		//	<div>
			<div>
					{players.map((player) => {
						left = left + 1;
						if (player.cards.length > 0 && showdown === false) {
							return (
								<div className={'boardInner-' + left}>
									<img className="playerCards" src={`/cardImages/blank.png`} />
									<img className="playerCards" src={`/cardImages/blank.png`} />
								</div>
							);
						} else if (player.cards.length > 0 && showdown === true) {
							return (
								<div className={'boardInner-' + left}>
									<img className="playerCards" src={`/cardImages/${player.cards[0]}.png`} />
									<img className="playerCards" src={`/cardImages/${player.cards[1]}.png`} />
								</div>
							);
						} else {
							return <div />;
						}
					})}
					</div>
/*
				<div className="playerBoard">
					{otherPlayer.map((player) => {
						if (player.cards.length > 0 && showdown === false && otherPlayer.indexOf(player) === 0) {
							return (
								<div className="boardInner">
									<img className="playerCards" src={`/cardImages/blank.png`} />
									<img className="playerCards" src={`/cardImages/blank.png`} />
								</div>
							);
						} else if (player.cards.length > 0 && showdown === true && otherPlayer.indexOf(player) === 0) {
							return (
								<div className="boardInner">
									<img className="playerCards" src={`/cardImages/${player.cards[0]}.png`} />
									<img className="playerCards" src={`/cardImages/${player.cards[1]}.png`} />
								</div>
							);
						} else {
							return <div />;
						}
					})}
				</div>
				</div>
*/
		);
	}
};

export default OpponentCards;
