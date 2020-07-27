import React from 'react';

const Seats = (props) => {
	const players = props.players;
	const clientPlayer = props.clientPlayer;
	var left = 1;
	var diff = 0;
	var i = 0;
	var active = [];


	console.log("client index: " + client_index);

	if (clientPlayer[0]) {

		var client_index = 0;
		players.map((player) => {
			if(player.id === clientPlayer[0].id) {
				client_index = players.indexOf(player);
			}
		})

		if(clientPlayer[0].active === true) {
			active = '-active'
		}
		else {
			active = ''
		}
		console.log("isAllIn: " + clientPlayer[0].isAllIn);
		//seat client player
		return (
			<div>
				<div key={clientPlayer[0].id} className={'seat-1' + active}>
					<div className="player">
						<div className="player-font">{clientPlayer[0].name}<span style={{fontSize:18, fontWeight:'bold', color:'yellow'}}>{" " + clientPlayer[0].dealer}</span></div>
						<div className="player-font">${clientPlayer[0].bankroll}<span style={{fontSize:12, color:'yellow'}}>{" " + clientPlayer[0].isAllIn}</span></div>
					</div>
				</div>

				{players.map((player) => {
						//seat opponent players
						if(player.id != clientPlayer[0].id){
							//seat players on left
							if(players.indexOf(player) > client_index) {
								left = left + 1;

								if(player.view === true) {
									return (
										<div key={player.name} className={'seat-' + left}>
											<div className="player">
												<div className="player-font"> {player.name}<span style={{fontSize:18, fontWeight:'bold', color:'yellow'}}>{" " + player.dealer}</span></div>
												<div className="player-font">${player.bankroll}<span style={{fontSize:12, color:'yellow'}}>{" " + player.isAllIn}</span></div>
											</div>
										</div>
									);
								}
								else if(player.active === true) {
									return (
										<div key={player.name} className={'seat-' + left + '-active'}>
											<div className="player">
												<div className="player-font"> {player.name}<span style={{fontSize:18, fontWeight:'bold', color:'yellow'}}>{" " + player.dealer}</span></div>
												<div className="player-font">${player.bankroll}<span style={{fontSize:12, color:'yellow'}}>{" " + player.isAllIn}</span></div>
											</div>
										</div>
									);
								}
								else {
									return (
										<div key={player.name} className={'seat-' + left}>
											<div className="player">
												<div className="player-font"> {player.name}<span style={{fontSize:18, fontWeight:'bold', color:'yellow'}}>{" " + player.dealer}</span></div>
												<div className="player-font">${player.bankroll}<span style={{fontSize:12, color:'yellow'}}>{" " + player.isAllIn}</span></div>
											</div>
										</div>
									);
								}

							//seat players on right
							} else if(players.indexOf(player) < client_index) {
								diff = client_index - players.indexOf(player);

								if(player.view === true) {
									return (
										<div key={player.name} className={'seat-' + (9 - diff)}>
											<div className="player">
												<div className="player-font"> {player.name}<span style={{fontSize:18, fontWeight:'bold', color:'yellow'}}>{" " + player.dealer}</span></div>
												<div className="player-font">${player.bankroll}<span style={{fontSize:12, color:'yellow'}}>{" " + player.isAllIn}</span></div>
											</div>
										</div>
									);
								}
								else if(player.active === true) {
									return (
										<div key={player.name} className={'seat-' + (9 - diff) + '-active'}>
											<div className="player">
												<div className="player-font"> {player.name}<span style={{fontSize:18, fontWeight:'bold', color:'yellow'}}>{" " + player.dealer}</span></div>
												<div className="player-font">${player.bankroll}<span style={{fontSize:12, color:'yellow'}}>{" " + player.isAllIn}</span></div>
											</div>
										</div>
									);
								}
								else {
									return (
										<div key={player.name} className={'seat-' + (9 - diff)}>
											<div className="player">
												<div className="player-font"> {player.name}<span style={{fontSize:18, fontWeight:'bold', color:'yellow'}}>{" " + player.dealer}</span></div>
												<div className="player-font">${player.bankroll}<span style={{fontSize:12, color:'yellow'}}>{" " + player.isAllIn}</span></div>
											</div>
										</div>
									);
								}

							}
					}
				})}
			</div>
		);
	}
	else if (clientPlayer.length === 0) {
			return (
				<div>
					{players.map((player) => {
						i = i + 1;
						if(player.active === true) {
							return (
								<div key={player.name} className={'seat-' + i + '-active'}>
									<div className="player">
										<div className="player-font"> {player.name}<span style={{fontSize:18, fontWeight:'bold', color:'yellow'}}>{" " + player.dealer}</span></div>
										<div className="player-font">${player.bankroll}<span style={{fontSize:12, color:'yellow'}}>{" " + player.isAllIn}</span></div>
									</div>
								</div>
							);
						}
						else {
							return (
								<div key={player.name} className={'seat-' + i}>
									<div className="player">
										<div className="player-font"> {player.name}<span style={{fontSize:18, fontWeight:'bold', color:'yellow'}}>{" " + player.dealer}</span></div>
										<div className="player-font">${player.bankroll}<span style={{fontSize:12, color:'yellow'}}>{" " + player.isAllIn}</span></div>
									</div>
								</div>
							);
						}
					})}
				</div>
			);
		}
	else {
		return <div>Loading...</div>;
	}
};

export default Seats;
