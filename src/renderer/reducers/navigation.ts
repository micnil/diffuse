import { IError } from '../common/types';
import { AnyAction, NAVIGATION, CREATE_DIFF_SUCCESS } from '../actions';

export interface INavigationState {
	currentRoute: string;
	error?: IError;
}

const initialState: INavigationState = {
	currentRoute: 'History',
	error: undefined,
};

export default function navigation(state: INavigationState = initialState, action: AnyAction) {
	switch (action.type) {
		case NAVIGATION:
			return Object.assign({}, state, {
				currentRoute: action.payload,
			});
		case CREATE_DIFF_SUCCESS:
			return Object.assign({}, state, {
				currentRoute: 'Comparison',
			});
		default:
			return state;
	}
}
