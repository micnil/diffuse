import { createAction, ActionsUnion } from './utils';

export const NAVIGATION = 'NAVIGATION';

export const createNavigation = (route: string) => createAction(NAVIGATION, route);

const actions = {
	createNavigation,
};

export type NavigationActions = ActionsUnion<typeof actions>;
