import React from 'react';

const Board = (props) => {
	const pot = [ props.pot ];
	const pot2 = [ props.pot2 ];
	const pot3 = [ props.pot3 ];
	const pot4 = [ props.pot4 ];
	const pot5 = [ props.pot5 ];
	const pot6 = [ props.pot6 ];
	const pot7 = [ props.pot7 ];
	const pot8 = [ props.pot8 ];
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

				{pot3.map((p3) => {
					if (p3 === 0) {
						return <div />;
					} else {
						return (
							<div>
								${p3} <img className="chipImgBoard" src="/chips/chip.png" />
							</div>
						);
					}
				})}

				{pot4.map((p4) => {
					if (p4 === 0) {
						return <div />;
					} else {
						return (
							<div>
								${p4} <img className="chipImgBoard" src="/chips/chip.png" />
							</div>
						);
					}
				})}

				{pot5.map((p5) => {
					if (p5 === 0) {
						return <div />;
					} else {
						return (
							<div>
								${p5} <img className="chipImgBoard" src="/chips/chip.png" />
							</div>
						);
					}
				})}

				{pot6.map((p6) => {
					if (p6 === 0) {
						return <div />;
					} else {
						return (
							<div>
								${p6} <img className="chipImgBoard" src="/chips/chip.png" />
							</div>
						);
					}
				})}

				{pot7.map((p7) => {
					if (p7 === 0) {
						return <div />;
					} else {
						return (
							<div>
								${p7} <img className="chipImgBoard" src="/chips/chip.png" />
							</div>
						);
					}
				})}

				{pot8.map((p8) => {
					if (p8 === 0) {
						return <div />;
					} else {
						return (
							<div>
								${p8} <img className="chipImgBoard" src="/chips/chip.png" />
							</div>
						);
					}
				})}
			</div>
		</div>
	);
};

export default Board;
