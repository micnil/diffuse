import React, { Component } from 'react';
import { ScrollContext } from './FakeScrollbar';

type Props = Partial<{
	forwardedRef: React.Ref<{}>;
	scrollTopRelative: number;
	ranges: number[];
}>;

export const withScrollSync = <OriginalProps extends {}>(
	WrappedComponent: React.ComponentType<OriginalProps>,
) => {
	type ResultProps = OriginalProps & Props;
	class ScrollSynced extends Component<ResultProps> {
		readonly wrappedComponent: React.RefObject<HTMLElement>;
		static displayName = `ScrollSynced(${Component.name})`;
		static defaultProps = {
			ranges: [0, 1]
		}
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
			this.wrappedComponent.current.scrollTop = (scrollHeight - clientHeight) * lerp(this.props.ranges, scrollTopRelative);
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


function lerp(ranges: number [], value: number) {
	// If we have 4 stop points, it means we have 3 ranges of interpolation
	//       range   range  range
	//     |------|-------|-------|
	// 	  ^      ^	     ^       ^
	//  stop    stop    stop    stop
	let numRanges = ranges.length - 1;

	// Edge case: If we have 3 ranges and value is 1, we want currentRange
	// to be 2 because it is a zero-based index.
	let currentRange = Math.min(Math.floor(value * numRanges), numRanges-1);

	let positionInRange = (value * numRanges) - currentRange;

	// linear interpolation: v0 + t * (v1 - v0);
	return ranges[currentRange] + positionInRange * (ranges[currentRange+1] - ranges[currentRange]);
}