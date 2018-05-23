import React, { Component } from 'react';
import { ScrollContext } from './FakeScrollbar';

type Props = Partial<{
	forwardedRef: React.Ref<{}>;
	scrollTopRelative: number;
}>;

export const withScrollSync = <OriginalProps extends any>(
	WrappedComponent: React.ComponentType<OriginalProps>
) => {
	class ScrollSynced extends Component<Props> {
		readonly wrappedComponent: React.RefObject<HTMLElement>;

		constructor(props: Props) {
			super(props);
			this.wrappedComponent = React.createRef();
		}

		componentDidUpdate() {
			let { scrollTopRelative } = this.props;
			if (!this.wrappedComponent) {
				return;
			}

			let { scrollHeight, clientHeight } = this.wrappedComponent.current;
			this.wrappedComponent.current.scrollTop = (scrollHeight - clientHeight) * scrollTopRelative;
		}

		render() {
			let { scrollTopRelative, forwardedRef, ...rest } = this.props;
			return <WrappedComponent ref={this.wrappedComponent} {...rest} />;
		}
	}

	return React.forwardRef((props, ref) => (
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