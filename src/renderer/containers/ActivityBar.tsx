import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IState } from '../reducers';
import { Dispatch } from '../types';
import ListItemIcon from '@material-ui/icons/List';
import ListIcon from '@material-ui/core/List';
import CompareIcon from '@material-ui/icons/Compare';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import { createNavigation } from '../actions';

const styles = {
	listItemIcon: {
		margin: 'auto',
	} as React.CSSProperties
};

interface IActivityBarProps {
	currentRoute: string;
	comparisonDisabled: boolean;
	navigate: (route: string) => void;
}

export class ActivityBar extends Component<IActivityBarProps> {

	render() {
		return (
			<MenuList>
				<MenuItem
					dense
					disableGutters
					selected={this.props.currentRoute === 'History'}
					onClick={() => { this.props.navigate('History'); }}>
					<ListItemIcon style={styles.listItemIcon}>
						<ListIcon />
					</ListItemIcon>
				</MenuItem>
				<MenuItem
					dense
					disableGutters
					disabled={this.props.comparisonDisabled}
					selected={this.props.currentRoute === 'Comparison'}
					onClick={() => { this.props.navigate('Comparison'); }}
				>
					<ListItemIcon style={styles.listItemIcon}>
						<CompareIcon />
					</ListItemIcon>
				</MenuItem>
			</MenuList>
		);
	}
}

const mapStateToProps = (state: IState) => {
	return {
		currentRoute: state.navigation.currentRoute,
		comparisonDisabled: state.comparison.allHashes.length === 0
	};
};

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		navigate: (route: string) => {
			dispatch(createNavigation(route));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityBar);