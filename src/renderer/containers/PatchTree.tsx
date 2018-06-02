import React, { Component } from 'react';
import { connect } from 'react-redux';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { IState } from '@/reducers';
import { Dispatch, IDiff, IPatch } from '@/common/types';
import { selectPatch } from '@/actions';

const styles = {
	menuList: {
		maxHeight: '100vh',
		overflow: 'auto',
		padding: 0,
	} as React.CSSProperties,

	menuItem: {
		overflowX: 'hidden',
	} as React.CSSProperties,
};

export interface IPatchTreeProps {
	diff: IDiff;
	selectedOriginalFile: string;
	selectedModifiedFile: string;
	selectPatch: (patch: IPatch) => void;
}

export interface IPatchTreeState {}

export class PatchTree extends Component<IPatchTreeProps, IPatchTreeState> {
	onMenuItemClick(patch: IPatch) {
		this.props.selectPatch(patch);
	}

	render() {
		let fileList = this.props.diff.patches.map(patch => {
			return (
				<MenuItem
					dense
					key={patch.modifiedFile || patch.originalFile}
					style={styles.menuItem}
					selected={
						patch.modifiedFile === this.props.selectedModifiedFile &&
						patch.originalFile === this.props.selectedOriginalFile
					}
					onClick={() => {
						this.onMenuItemClick(patch);
					}}
				>
					<ListItemText
						primary={`${patch.status} - ${patch.modifiedFile || patch.originalFile}`}
						secondary={patch.originalFile}
					/>
				</MenuItem>
			);
		});
		return <MenuList style={styles.menuList}>{fileList}</MenuList>;
	}
}

const mapStateToProps = (state: IState) => {
	let { comparison } = state;
	const diff = comparison.diffsByHash[comparison.fromHash][comparison.toHash];
	const selectedOriginalFile = comparison.selectedPatch
		? comparison.selectedPatch.originalFile
		: undefined;
	const selectedModifiedFile = comparison.selectedPatch
		? comparison.selectedPatch.modifiedFile
		: undefined;
	return {
		selectedOriginalFile: selectedOriginalFile,
		selectedModifiedFile: selectedModifiedFile,
		diff: diff,
	};
};

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		selectPatch: (patch: IPatch) => {
			dispatch(selectPatch(patch));
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(PatchTree);
