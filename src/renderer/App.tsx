import React, { Component } from 'react';
import ActivityBar from './containers/ActivityBar';
import './App.css';

export class App extends Component {
	render() {
		return (
			<div className={'app'}>
                <div className={'activity-bar-container'}>
					<ActivityBar />
				</div>
			</div>
		);
	}
}