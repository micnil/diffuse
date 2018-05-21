import React, { Component } from 'react';
import { connect } from 'react-redux';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { IState } from '../reducers';
import { Dispatch, IDiff, IPatch } from '../types';
import { selectPatch } from '../actions';

const styles = {
	menuList: {
		maxHeight: '100%',
		overflow: 'auto',
		padding: 0
	} as React.CSSProperties,

	menuItem: {
		overflowX: 'hidden'
	} as React.CSSProperties,
};

export interface IPatchTreeProps {
	diff: IDiff;
	selectedOldFile: string;
	selectedNewFile: string;
	selectPatch: (patch: IPatch) => void;
}

export interface IPatchTreeState {
}

export class PatchTree extends Component<IPatchTreeProps, IPatchTreeState> {

	onMenuItemClick(patch: IPatch) {
		this.props.selectPatch(patch);
	}

	render() {
		let fileList = this.props.diff.patches.map( patch => {
			return (
				<MenuItem
					dense
					key={patch.newFile || patch.oldFile}
					style={styles.menuItem}
					selected={patch.newFile === this.props.selectedNewFile && patch.oldFile === this.props.selectedOldFile}
					onClick={() => { this.onMenuItemClick(patch); }}
				>
					<ListItemText primary={`${patch.status} - ${patch.newFile || patch.oldFile}`} secondary={patch.oldFile}/>
				</MenuItem>
			);
		});
		return (
			<MenuList style={styles.menuList}>
				{ fileList }
			</MenuList>
		);
	}
}

const mapStateToProps = (state: IState) => {
	let { comparison } = state;
	//const allFiles = comparison.filesByHash[comparison.toHash].allFiles;
	const diff = comparison.diffsByHash[comparison.fromHash][comparison.toHash];
	return {
		selectedOldFile: comparison.selectedOldFile,
		selectedNewFile: comparison.selectedNewFile,
		diff: diff
	};
};

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		selectPatch: (patch: IPatch) => {
			dispatch(selectPatch(patch));
		}
	};
};


export default connect(mapStateToProps, mapDispatchToProps)(PatchTree);