import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

class Lobby extends Component {
	constructor(props) {
		super(props);
		this.state = {
   open: false,
   name: ''
		};
	}

 handleChange = (event) => {
  this.setState({ name: event.target.value });
	}

	handleClickOpen = () => {
		this.setState({ open: true });
	};

	handleClose = () => {
  this.setState({ open: false });
  this.props.addName(this.state.name)
  console.log(this.state.name)
	};
	render() {
		return (
			<div className="lobby-container">
				<Paper className="lobby" elevation={8}>
					<div style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '50px' }}>
						<Typography align="center" variant="headline" gutterBottom>
							Cuber's Poker
						</Typography>
						<Divider />
					</div>
					<img
						style={{
							width: '25%',
							height: '25%',
							display: 'block',
							marginTop: '50px',
							marginLeft: 'auto',
							marginRight: 'auto'
						}}
						src="splash.png"
					/>
					<Typography style={{ marginTop: '50px' }} align="center" variant="subheading" gutterBottom>
							Active players: {this.props.players.length}
						</Typography>
						<Typography align="center" variant="subheading" gutterBottom>
							Spectators: {this.props.spectators.length}
						</Typography>
					<div style={{ textAlign: 'center', marginTop: '50px', marginBottom: '50px' }}>
						<Button onClick={this.handleClickOpen} variant="contained" color="secondary">
							Join Room
						</Button>
					</div>
				</Paper>
				<Dialog open={this.state.open} onClose={this.handleClose}>
					<DialogTitle >	<Typography align="center" variant="subheading" gutterBottom>
							Please enter your name:
						</Typography></DialogTitle>
					<DialogContent>
     <TextField
          margin="normal"
          onChange={this.handleChange}
          style={{width: '100%'}}
        />
					</DialogContent>
					<DialogActions>
      <div style={{ alignContent: 'center'}}>
						<Button variant="contained" color="secondary" onClick={this.handleClose}>
							Submit
						</Button>
      </div>
					</DialogActions>
				</Dialog>
			</div>
		);
	}
}

export default Lobby;
