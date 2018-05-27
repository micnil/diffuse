import React, { Component } from 'react';
import ActivityBar from './containers/ActivityBar';
import SideBar from './containers/SideBar';
import { SplitPane, Pane } from 'react-split-pane';
import Comparison from './containers/Comparison';
import './App.css';

export class App extends Component {
	render() {
		return (
			<div className={'app'}>
				<div className={'activity-bar-container'}>
					<ActivityBar />
				</div>
				<div className={'split-pane-container'}>
					<SplitPane>
						<Pane minSize={'200px'} initialSize={'fit-content'}>
							<SideBar />
						</Pane>
						<Pane>
							<Comparison />
						</Pane>
					</SplitPane>
				</div>
			</div>
		);
	}
}
