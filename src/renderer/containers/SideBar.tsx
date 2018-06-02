import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IState } from '@/reducers';
import { Dispatch } from '@/common/types';
import History from './History';
import PatchTree from './PatchTree';

interface ISideBarProps {
	currentRoute: string;
}

export class SideBar extends Component<ISideBarProps> {
	render() {
		let RenderableView;
		switch (this.props.currentRoute) {
			case 'History':
				RenderableView = History;
				break;
			case 'Comparison':
				RenderableView = PatchTree;
				break;
			default:
				RenderableView = History;
		}

		return <RenderableView />;
	}
}

const mapStateToProps = (state: IState) => {
	return {
		currentRoute: state.navigation.currentRoute,
	};
};

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
