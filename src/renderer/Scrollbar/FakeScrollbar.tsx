import React, { Component, CSSProperties } from 'react';

let styles = {
	container: {
		display: 'flex',
		flexDirection: 'row',
		flex: 1,
	} as CSSProperties,
	scrollTrack: {
		width: 30,
		borderLeft: '1px solid',
		borderLeftColor: '#000',
		background: '#212121',
		position: 'relative',
	} as CSSProperties,
	scrollThumb: {
		position: 'absolute',
		background: 'rgba(0, 0, 0, 0.3)',
		width: '100%',
	} as CSSProperties,
	scrollThumbHover: {
		background: 'rgba(128, 128, 128, 0.2)',
	} as CSSProperties,
	scrollThumbScrolling: {
		background: 'rgba(128, 128, 255, 0.7)',
	} as CSSProperties,
};

const initialState = {
	isScrolling: false,
	scrollingGripPosition: 0,
	scrollTopRelative: 0,
	thumbMouseOver: false,
};

type State = Readonly<typeof initialState>;
type Props = Partial<{
	scrollHeight: number;
}>;

export const ScrollContext = React.createContext(initialState);
export class FakeScrollbar extends Component<Props, State> {

	readonly scrollTrack: React.RefObject<HTMLDivElement>;
	readonly scrollThumb: React.RefObject<HTMLDivElement>;
	readonly state: State = initialState;
	constructor(props: Props) {
		super(props);
		this.scrollTrack = React.createRef();
		this.scrollThumb = React.createRef();
	}

	componentDidMount() {
		window.addEventListener('resize', this.handleResize);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	get thumbPosition() {
		if (!this.scrollTrack.current) {
			return 0;
		}
		return this.scrollTop / this.props.scrollHeight * this.trackHeight;
	}

	get trackHeight() {
		if (!this.scrollTrack.current) {
			return null;
		}
		return this.scrollTrack.current.clientHeight;
	}

	get scrollTop() {
		return this.state.scrollTopRelative * this.scrollTopMax;
	}

	get scrollTopMax() {
		return this.props.scrollHeight - this.trackHeight;
	}

	get thumbHeight() {
		if (!this.scrollTrack.current) {
			return 0;
		}
		return this.thumbRelativeHeight * this.trackHeight;
	}

	get thumbRelativeHeight() {
		return this.trackHeight / this.props.scrollHeight;
	}

	handleWheel = (e: any) => {
		if (e.deltaMode !== 0) {
			console.error('The scrolling is not in pixel mode!');
			return;
		}

		let deltaYPercentage = e.deltaY / this.scrollTopMax;
		let scrollTopRelative = Math.min(
			Math.max(this.state.scrollTopRelative + deltaYPercentage, 0),
			1,
		);
		this.setState({
			scrollTopRelative,
		});
	}

	handleMouseEnterThumb = (e: any) => {
		this.setState({ thumbMouseOver: true });
	}

	handleMouseLeaveThumb = (e: any) => {
		this.setState({ thumbMouseOver: false });
	}

	handleMouseDown = (e: any) => {
		this.setState({
			isScrolling: true,
			scrollingGripPosition: e.clientY - this.scrollThumb.current.offsetTop,
		});
		document.addEventListener('mouseup', this.handleMouseUp);
		document.addEventListener('mousemove', this.handleMouseMove);
	}

	handleMouseUp = (e: any) => {
		this.setState({
			isScrolling: false,
			scrollingGripPosition: 0,
		});
		document.removeEventListener('mouseup', this.handleMouseUp);
		document.removeEventListener('mousemove', this.handleMouseMove);
	}

	handleMouseMove = (e: any) => {
		if (!this.state.isScrolling) {
			return;
		}
		let mousePositionRelativeTrack = e.clientY - this.scrollTrack.current.offsetTop;
		let scrollTopRelative =
			(mousePositionRelativeTrack - this.state.scrollingGripPosition) /
			this.trackHeight *
			this.props.scrollHeight /
			this.scrollTopMax;
		// clamp
		scrollTopRelative = Math.min(Math.max(scrollTopRelative, 0), 1);
		this.setState({
			scrollTopRelative,
		});
	}

	handleResize = () => {
		this.forceUpdate();
	}

	render() {
		let { thumbMouseOver, isScrolling } = this.state;

		return (
			<ScrollContext.Provider value={this.state}>
				<div style={styles.container} onWheel={this.handleWheel}>
					{this.props.children}
					<div ref={this.scrollTrack} style={styles.scrollTrack}>
						<div
							onMouseEnter={this.handleMouseEnterThumb}
							onMouseLeave={this.handleMouseLeaveThumb}
							onMouseDown={this.handleMouseDown}
							ref={this.scrollThumb}
							style={Object.assign(
								{
									top: this.thumbPosition,
									height: this.thumbHeight,
									userSelect: isScrolling ? 'none' : 'auto',
								},
								styles.scrollThumb,
								thumbMouseOver && styles.scrollThumbHover,
								isScrolling && styles.scrollThumbScrolling,
							)}
						/>
					</div>
				</div>
			</ScrollContext.Provider>
		);
	}
}
