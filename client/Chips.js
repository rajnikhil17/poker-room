import React from 'react';

const Chip = (props) => {
	const spectator = props.spectator;
	console.log("is spectator? " + spectator);
	const id = props.id;
	const players = props.players;
	const view = props.view;
	var diff = 9;

	var client_index = 0;
	players.map((player) => {
		if(player.id === id) {
			client_index = players.indexOf(player);
		}
	})

	if (!spectator) {
		return (
			<div>
				{players.map((player) => {
					if (player.activeBet === 0) {
						return <div />;
					} else {
							if (player.id === id) {
							return (
								<div className="chip-1">
									<div style={{ marginRight: '5px'}}>${player.activeBet}</div>
									<img className="chipImg" src="/chips/chip.png" />
								</div>
							);
							/*
						} else if (player.id !== id) {
							count = count + 1;
							console.log(player.name + " " + player.smallBlind);
							console.log(player.name + " " + player.bigBlind);
							return (
								<div className={'chip-' + count}>
									<div style={{ marginRight: '5px' }}>${player.activeBet}</div>
									<img className="chipImg"  src="/chips/chip.png" />
								</div>
							);
						}
						*/
					} else if (players.indexOf(player) < client_index) {
							diff = client_index - players.indexOf(player);
							return (
									<div className={"chip-" + (9 - diff)}>
										<div style={{ marginRight: '5px' }}>${player.activeBet}</div>
										<img className="chipImg"  src="/chips/chip.png" />
									</div>
								);
						} else if (players.indexOf(player) > client_index) {
							diff = players.indexOf(player) - client_index;
							return (
									<div className={"chip-" + (diff+1)}>
										<div style={{ marginRight: '5px' }}>${player.activeBet}</div>
										<img className="chipImg"  src="/chips/chip.png" />
									</div>
								);
						}
				}
				})}
			</div>
		);
	}
	else {
		return (
			<div>
				{players.map((player) => {
					if (player.activeBet === 0) {
						return <div />;
					} else if (players.indexOf(player) === 0) {
						return (
							<div className="chip-1">
								<div style={{ marginRight: '5px' }}>${player.activeBet}</div>
								<img className="chipImg"  src="/chips/chip.png" />
							</div>
						);
					} else if (players.indexOf(player) === 1) {
						return (
							<div className="chip-2">
								<div style={{ marginRight: '5px' }}>${player.activeBet}</div>
								<img className="chipImg"  src="/chips/chip.png" />
							</div>
						);
					}
					else if (players.indexOf(player) === 2) {
						return (
							<div className="chip-3">
								<div style={{ marginRight: '5px' }}>${player.activeBet}</div>
								<img className="chipImg"  src="/chips/chip.png" />
							</div>
						);
					}
					else if (players.indexOf(player) === 3) {
						return (
							<div className="chip-4">
								<div style={{ marginRight: '5px' }}>${player.activeBet}</div>
								<img className="chipImg"  src="/chips/chip.png" />
							</div>
						);
					}
					else if (players.indexOf(player) === 4) {
						return (
							<div className="chip-5">
								<div style={{ marginRight: '5px' }}>${player.activeBet}</div>
								<img className="chipImg"  src="/chips/chip.png" />
							</div>
						);
					}
					else if (players.indexOf(player) === 5) {
						return (
							<div className="chip-6">
								<div style={{ marginRight: '5px' }}>${player.activeBet}</div>
								<img className="chipImg"  src="/chips/chip.png" />
							</div>
						);
					}
					else if (players.indexOf(player) === 6) {
						return (
							<div className="chip-7">
								<div style={{ marginRight: '5px' }}>${player.activeBet}</div>
								<img className="chipImg"  src="/chips/chip.png" />
							</div>
						);
					}
					else if (players.indexOf(player) === 7) {
						return (
							<div className="chip-8">
								<div style={{ marginRight: '5px' }}>${player.activeBet}</div>
								<img className="chipImg"  src="/chips/chip.png" />
							</div>
						);
					}
				})}
			</div>
		);
	}

};

export default Chip;
