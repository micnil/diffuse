import React, { Component } from 'react';
import { ScrollContext } from './FakeScrollbar';

type Props = Partial<{
	forwardedRef: React.Ref<{}>;
	scrollTopRelative: number;
}>;

export const withScrollSync = <OriginalProps extends {}>(
	WrappedComponent: React.ComponentType<OriginalProps>
) => {
	type ResultProps = OriginalProps & Props;
	class ScrollSynced extends Component<ResultProps> {
		readonly wrappedComponent: React.RefObject<HTMLElement>;
		static displayName = `ScrollSynced(${Component.name})`;
		
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
			this.wrappedComponent.current.scrollTop = (scrollHeight - clientHeight) * scrollTopRelative;
		}

		render() {
			// "as any" due to https://github.com/Microsoft/TypeScript/pull/13288
			let { scrollTopRelative, forwardedRef, ...rest } = this.props as any;
			return <WrappedComponent ref={this.wrappedComponent} {...rest} />;
		}
	}

	return React.forwardRef((props: OriginalProps, ref) => (
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