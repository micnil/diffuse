import { createAction, ActionsUnion } from './utils';
import { Dispatch } from 'redux';
import { ICommit, IError } from '../types';
import { IState } from '../reducers';
import Api from '../api';

export const LOAD_COMMITS_REQUEST = 'LOAD_COMMITS_REQUEST';
export const LOAD_COMMITS_SUCCESS = 'LOAD_COMMITS_SUCCESS';
export const LOAD_COMMITS_FAILURE = 'LOAD_COMMITS_FAILURE';
export const REFRESH_COMMITS_REQUEST = 'REFRESH_COMMITS_REQUEST';
export const REFRESH_COMMITS_SUCCESS = 'REFRESH_COMMITS_SUCCESS';
export const REFRESH_COMMITS_FAILURE = 'REFRESH_COMMITS_FAILURE';

export const loadCommitsRequest = (hash: string) => createAction(LOAD_COMMITS_REQUEST, hash);
export const loadCommitsSuccess = (commits: ICommit[]) => createAction(LOAD_COMMITS_SUCCESS, commits);
export const loadCommitsFailure = (error: IError) => createAction(LOAD_COMMITS_FAILURE, error);
export const loadCommits = (fromHash: string) => {
	return async (dispatch: Dispatch<RepositoryActions>, getState: () => IState, api: Api) => {
		dispatch(loadCommitsRequest(fromHash));

		try {
			let { repository } = getState();
			const commitsToStore = await api.getCommits(repository.repoPath, 20, fromHash);
			dispatch(loadCommitsSuccess(commitsToStore));
		} catch (err) {
			// TODO: implement a more generic approach to errors.
			const error: IError = {
				message: err.message
			};
			dispatch(loadCommitsFailure(error));
			console.error(err);
		}
	};
};

export const refreshCommitsRequest = () => createAction(REFRESH_COMMITS_REQUEST);
export const refreshCommitsSuccess = (commits: ICommit[]) => createAction(REFRESH_COMMITS_SUCCESS, commits);
export const refreshCommitsFailure = (error: IError) => createAction(REFRESH_COMMITS_FAILURE, error);
export const refreshCommits = () => {
	return async (dispatch: Dispatch<RepositoryActions>, getState: () => IState, api: Api) => {
		dispatch(refreshCommitsRequest());

		try {
			let { repository } = getState();
			const commitsToStore = await api.getCommits(repository.repoPath, 30);
			dispatch(refreshCommitsSuccess(commitsToStore));
		} catch (err) {
			// TODO: implement a more generic approach to errors.
			const error: IError = {
				message: err.message
			};
			dispatch(refreshCommitsFailure(error));
			console.error(err);
		}
	};
};


const actions = {
	loadCommitsRequest,
	loadCommitsSuccess,
	loadCommitsFailure,
	refreshCommitsRequest,
	refreshCommitsSuccess,
	refreshCommitsFailure
};

export type RepositoryActions = ActionsUnion<typeof actions>;