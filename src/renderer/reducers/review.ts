import { IError, IReview } from '../types';
import {
	AnyAction,
	CREATE_REVIEW_REQUEST,
	CREATE_REVIEW_SUCCESS,
	CREATE_REVIEW_FAILURE,
} from '../actions';

export interface IReviewState {
	selectedId?: string;
	isLoading: boolean;
	reviews: {
		byId: {
			[id: string]: IReview,
		}
		allIds: string[]
	};
	error?: IError;
}

const initialState: IReviewState = {
	selectedId: undefined,
	isLoading: false,
	reviews: {
		byId: {},
		allIds: []
	},
	error: undefined,
};

export default function review(state: IReviewState = initialState, action: AnyAction) {
	switch (action.type) {
		case CREATE_REVIEW_REQUEST:
			return Object.assign({}, state, {
				isLoading: true
			});
		case CREATE_REVIEW_SUCCESS:
			const byId: any = {};
			byId[action.payload.id] = action.payload;
			return Object.assign({}, state, {
				isLoading: false,
				commits: {
					byId: Object.assign({}, state.reviews.byId, byId),
					allIds: [...state.reviews.allIds, action.payload.id]
				}
			});
		case CREATE_REVIEW_FAILURE:
			return Object.assign({}, state, {
				isLoading: false,
				error: action.payload
			});
		default:
			return state;
	}
}