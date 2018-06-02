import React, { Component } from 'react';
import { connect } from 'react-redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import { IState } from '@/reducers';
import { Dispatch, ICommit } from '../common/types';
import { loadCommits, createReview, refreshCommits, createComparison } from '../actions';

const styles = {
	list: {
		maxHeight: '100vh',
		overflow: 'auto',
		padding: 0,
	} as React.CSSProperties,

	listItem: {
		overflowX: 'hidden',
	} as React.CSSProperties,

	stickyButtonPanel: {
		backgroundColor: 'white',
	} as React.CSSProperties,

	button: {
		margin: 8,
	} as React.CSSProperties,
};

export interface IHistoryProps {
	commits: ICommit[];
	loadCommits: (fromHash: string) => any;
	refreshCommits: () => any;
	createReview: (hash: string[]) => any;
	createComparison: (hash: string[]) => any;
}

export interface IHistoryState {
	checked: string[];
}

export class History extends Component<IHistoryProps, IHistoryState> {
	state: IHistoryState = {
		checked: [],
	};

	componentDidMount() {
		this.props.refreshCommits();
	}

	onDiffPress() {
		this.props.createComparison([...this.state.checked]);
	}

	handleToggle = (hash: string) => {
		const { checked } = this.state;
		const currentIndex = checked.indexOf(hash);
		const newChecked = [...checked];

		if (currentIndex === -1) {
			newChecked.push(hash);
		} else {
			newChecked.splice(currentIndex, 1);
		}

		this.setState({
			checked: newChecked,
		});
	};

	render() {
		let commitHistoryList = this.props.commits.map(commit => {
			// Crop message to only include the summary.
			let messageSummary =
				commit.message.length > 72 ? commit.message.substr(0, 72) + '...' : commit.message;

			// Set the secondary text to be the commit signature.
			let secondary = commit.date.toLocaleDateString() + ' - ' + commit.author;
			return (
				<ListItem dense key={commit.hash} style={styles.listItem}>
					<ListItemText primary={messageSummary} secondary={secondary} />
					<ListItemSecondaryAction>
						<Checkbox
							onChange={() => this.handleToggle(commit.hash)}
							checked={this.state.checked.indexOf(commit.hash) !== -1}
						/>
					</ListItemSecondaryAction>
				</ListItem>
			);
		});
		return (
			<List style={styles.list}>
				<ListSubheader style={styles.stickyButtonPanel}>
					<Button
						size="small"
						color="default"
						variant="raised"
						style={styles.button}
						onClick={() => {
							this.onDiffPress();
						}}
					>
						Diff
					</Button>
					<Button size="small" color="default" variant="raised" style={styles.button}>
						Create Review
					</Button>
					<IconButton
						color="primary"
						aria-label="Refresh"
						onClick={() => {
							this.props.refreshCommits();
						}}
					>
						<RefreshIcon />
					</IconButton>
				</ListSubheader>
				{commitHistoryList}
			</List>
		);
	}
}

const mapStateToProps = (state: IState) => {
	let {
		repository: { commits: commits },
	} = state;
	const allCommits = commits.allIds.map(id => commits.byId[id]);
	return {
		commits: allCommits,
	};
};

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		loadCommits: (fromHash: string) => {
			dispatch(loadCommits(fromHash));
		},
		refreshCommits: () => {
			dispatch(refreshCommits());
		},
		createReview: (hashes: string[]) => {
			dispatch(createReview(hashes));
		},
		createComparison: (hashes: string[]) => {
			dispatch(createComparison(hashes));
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(History);
