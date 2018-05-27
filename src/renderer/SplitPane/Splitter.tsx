import React, { Component, CSSProperties } from 'react';

let styles = {
	container: {
		display: 'flex',
		flexDirection: 'row',
		flex: 1,
		width: '100vh',
	} as CSSProperties,
	bridge: {
		width: '40px',
		height: '100vh',
		position: 'relative',
		background: '#212121',
		cursor: 'ew-resize',
	} as CSSProperties,
};

const initialState = {
	dragging: false,
	leftPaneFlex: 0.5,
	rightPaneFlex: 0.5,
};

type State = Readonly<typeof initialState>;
export interface ISplitterProps {}

export default class Splitter extends Component<ISplitterProps, State> {
	readonly state: State = initialState;
	readonly container: React.RefObject<HTMLDivElement>;
	constructor(props: ISplitterProps) {
		super(props);
		this.container = React.createRef();
	}

	componentDidMount() {
		if (React.Children.count(this.props.children) !== 2) {
			console.error('The splitter needs to `Pane` children to work');
		}
	}

	handleMouseUp = (e: any) => {
		this.setState({ dragging: false });
		document.removeEventListener('mouseup', this.handleMouseUp);
		document.removeEventListener('mousemove', this.handleMouseMove);
	};

	handleMouseMove = (e: any) => {
		if (!this.state.dragging) {
			return;
		}

		let splitterPosition = this.getRelativeContainerX(e.clientX);
		this.setState({
			leftPaneFlex: splitterPosition,
			rightPaneFlex: 1 - splitterPosition,
		});
	};

	handleMouseDown = (e: any) => {
		this.setState({ dragging: true });
		document.addEventListener('mouseup', this.handleMouseUp);
		document.addEventListener('mousemove', this.handleMouseMove);
	};

	getRelativeContainerX(x: number) {
		//let rect = this.container.current.getBoundingClientRect();
		return (x - this.container.current.offsetLeft) / this.container.current.clientWidth;
	}

	render() {
		const { children } = this.props;
		let commonProps = {
			dragging: this.state.dragging,
		};
		const leftPane = React.cloneElement(children[0], {
			...commonProps,
			flex: this.state.leftPaneFlex,
		});
		const rightPane = React.cloneElement(children[1], {
			...commonProps,
			flex: this.state.rightPaneFlex,
		});

		return (
			<div style={styles.container} ref={this.container}>
				{leftPane}
				<div style={{ ...styles.bridge }} onMouseDown={this.handleMouseDown} />
				{rightPane}
			</div>
		);
	}
}
