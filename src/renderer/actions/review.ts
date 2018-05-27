import { createAction, ActionsUnion } from './utils';
import { Dispatch } from 'redux';
import { IState } from '../reducers';
import { IError, IReview } from '../common/types';
import Api from '../common/api';
import * as uuid from 'uuid/v4';

export const CREATE_REVIEW_REQUEST = 'CREATE_REVIEW_REQUEST';
export const CREATE_REVIEW_SUCCESS = 'CREATE_REVIEW_SUCCESS';
export const CREATE_REVIEW_FAILURE = 'CREATE_REVIEW_FAILURE';

export const createReviewRequest = () => createAction(CREATE_REVIEW_REQUEST);
export const createReviewSuccess = (review: IReview) => createAction(CREATE_REVIEW_SUCCESS, review);
export const createReviewFailure = (error: IError) => createAction(CREATE_REVIEW_FAILURE, error);
export const createReview = (hashes: string[]) => {
	return async (
		dispatch: Dispatch<ReviewActions>,
		getState: () => IState,
		api: Api,
	): Promise<IReview | undefined> => {
		dispatch(createReviewRequest());

		try {
			const { repository } = getState();
			const review: IReview = {
				id: uuid(),
				// Get the parent hash of the oldest commit (topologically)
				parentHash: repository.commits.byId[hashes[hashes.length - 1]].parentHash,
				commitsHashes: hashes,
			};
			dispatch(createReviewSuccess(review));
			return review;
		} catch (err) {
			const error: IError = {
				message: err.message,
			};
			dispatch(createReviewFailure(error));
			console.error(err);
			return undefined;
		}
	};
};

const actions = {
	createReviewRequest,
	createReviewSuccess,
	createReviewFailure,
};

export type ReviewActions = ActionsUnion<typeof actions>;
