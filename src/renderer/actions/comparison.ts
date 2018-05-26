import { createAction, ActionsUnion } from './utils';
import { Dispatch } from 'redux';
import { IState } from '../reducers';
import { IError, IComparison, IPatch } from '../common/types';
import Api from '../common/api';

export const CREATE_DIFF_REQUEST = 'CREATE_DIFF_REQUEST';
export const CREATE_DIFF_SUCCESS = 'CREATE_DIFF_SUCCESS';
export const CREATE_DIFF_FAILURE = 'CREATE_DIFF_FAILURE';
export const SELECT_PATCH = 'SELECT_PATCH';

export const createDiffRequest = () => createAction(CREATE_DIFF_REQUEST);
export const createDiffSuccess = (comparison: IComparison) => createAction(CREATE_DIFF_SUCCESS, comparison);
export const createDiffFailure = (error: IError) => createAction(CREATE_DIFF_FAILURE, error);
export const createComparison = (hashes: string[]) => {
	return async (dispatch: Dispatch<CompareActions>, getState: () => IState, api: Api) => {
		dispatch(createDiffRequest());

		try {
			const { repository } = getState();
			let sortedHashes = hashes.sort((a, b) => {
				return repository.commits.allIds.indexOf(a) - repository.commits.allIds.indexOf(a);
			});
			let baseHash = repository.commits.byId[sortedHashes[sortedHashes.length - 1]].parentHash;
			if (baseHash) {
				sortedHashes.push(baseHash);
			}
			let comparison = await api.diffCommits(repository.repoPath, sortedHashes.reverse());
			dispatch(createDiffSuccess(comparison));
		} catch (err) {
			const error: IError = {
				message: err.message
			};
			dispatch(createDiffFailure(error));
			console.error(err);
		}
	};
};

export const selectPatch = (patch: IPatch) => createAction(SELECT_PATCH, { patch });

const actions = {
	createDiffRequest,
	createDiffSuccess,
	createDiffFailure,
	selectPatch
};

export type CompareActions = ActionsUnion<typeof actions>;