import React, { Component, CSSProperties } from 'react';

let styles = {
	scrollContainer: {
		height: '100vh',
		overflow: 'hidden',
	} as CSSProperties,
	pane: {
		flex: 1,
		minWidth: 'fit-content',
		margin: '5px',
	} as CSSProperties,
};

type Props = Partial<{
	forwardedRef: React.Ref<HTMLDivElement>;
	dragging: boolean;
	flex: number;
	style: CSSProperties;
}>;

class Pane extends Component<Props> {
	render() {
		const { forwardedRef, dragging, style, ...rest } = this.props;
		return (
			<div
				ref={forwardedRef}
				style={{ flex: this.props.flex, ...styles.scrollContainer, ...style }}
				{...rest}
			>
				<div
					style={{
						userSelect: dragging ? 'none' : 'auto',
						...styles.pane,
					}}
				>
					{this.props.children}
				</div>
			</div>
		);
	}
}

export default React.forwardRef((props: Props, ref: React.Ref<HTMLDivElement>) => {
	return <Pane {...props} forwardedRef={ref} />;
});
