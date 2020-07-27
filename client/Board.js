import React from 'react';

const Board = (props) => {
	const pot = [ props.pot ];
	const pot2 = [ props.pot ];
	const board = props.board;
	while (board.length < 5) {
		board.push('empty');
	}
	return (
		<div className="board">
			<div className="boardInner">
				{props.board.map((card) => {
					if (card === 'empty') {
						return <img className="hiddenBoardCards" src={`/cardImages/${card}.png`} />;
					} else {
						return <img className="boardCards" src={`/cardImages/${card}.png`} />;
					}
				})}
			</div>
			<div className="pot">
				{pot.map((p) => {
					if (p === 0) {
						return <div />;
					} else {
						return (
							<div>
								${p} <img className="chipImgBoard" src="/chips/chip.png" />
							</div>
						);
					}
				})}

				{pot2.map((p2) => {
					if (p2 === 0) {
						return <div />;
					} else {
						return (
							<div>
								${p2} <img className="chipImgBoard" src="/chips/chip.png" />
							</div>
						);
					}
				})}
			</div>
		</div>
	);
};

export default Board;
