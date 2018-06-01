import React, { Component } from 'react';
import { ScrollContext } from './FakeScrollbar';
import { ScrollSyncPoint } from './utils';

type Props = Partial<{
	forwardedRef: React.Ref<{}>;
	scrollTopRelative: number;
	ranges: ScrollSyncPoint[];
}>;

export const withScrollSync = <OriginalProps extends {}>(
	WrappedComponent: React.ComponentType<OriginalProps>,
) => {
	type ResultProps = OriginalProps & Props;
	class ScrollSynced extends Component<ResultProps> {
		readonly wrappedComponent: React.RefObject<HTMLElement>;
		static displayName = `ScrollSynced(${Component.name})`;
		static defaultProps = {
			ranges: [[0, 0], [1, 1]],
		};
		constructor(props: ResultProps) {
			super(props);
			this.wrappedComponent = React.createRef();
		}

		componentDidUpdate() {
			let { scrollTopRelative } = this.props;
			if (!this.wrappedComponent) {
				return;
			}
			
			let { scrollHeight, clientHeight } = this.wrappedComponent.current;
			// const documentRanges = this.props.ranges
			// 	.map(range => range[0] / clientHeight)
			let scrollTopMax = scrollHeight - clientHeight;
			this.wrappedComponent.current.scrollTop =
				scrollTopMax * lerp(this.props.ranges, scrollTopRelative);
		}

		render() {
			// "as any" due to https://github.com/Microsoft/TypeScript/pull/13288
			let { scrollTopRelative, forwardedRef, ...rest } = this.props as any;
			return <WrappedComponent ref={this.wrappedComponent} {...rest} />;
		}
	}

	return React.forwardRef((props: ResultProps, ref) => (
		<ScrollContext.Consumer>
			{state => (
				<ScrollSynced
					{...props}
					forwardedRef={ref}
					scrollTopRelative={state.scrollTopRelative}
				/>
			)}
		</ScrollContext.Consumer>
	));
};

function lerp(ranges: ScrollSyncPoint[], value: number) {
	// If we have 4 stop points, it means we have 3 ranges of interpolation
	//       range   range  range
	//     |------|-------|-------|
	// 	  ^      ^	     ^       ^
	//  stop    stop    stop    stop
	let rangeTopIndex = ranges.findIndex(range => value < range[1]);

	// The value must be larger than the max value in range,
	// use the last range.
	if (rangeTopIndex == -1) {
		rangeTopIndex = ranges.length - 1;
	}

	// The value is smaller than the first value in range,
	// use the second value in range as "top" in range.
	if (rangeTopIndex == 0) {
		rangeTopIndex = 1;
	}

	// Bottom index is always the index before top.
	let rangeBottomIndex = rangeTopIndex - 1;

	let positionInRange =
		(value - ranges[rangeBottomIndex][1]) /
		(ranges[rangeTopIndex][1] - ranges[rangeBottomIndex][1]);

	// linear interpolation: v0 + t * (v1 - v0);
	return (
		ranges[rangeBottomIndex][0] +
		positionInRange * (ranges[rangeTopIndex][0] - ranges[rangeBottomIndex][0])
	);
}