import {
	AnyAction,
	LOAD_COMMITS_REQUEST,
	LOAD_COMMITS_SUCCESS,
	LOAD_COMMITS_FAILURE,
	REFRESH_COMMITS_REQUEST,
	REFRESH_COMMITS_SUCCESS,
	REFRESH_COMMITS_FAILURE
} from '../actions';
import { ICommit, IError } from '../common/types';
import * as path from 'path';

const initialState: IRepositoryState = {
	repoPath: path.resolve(__dirname, '..', '..', '..', '.git'),
	isLoading: false,
	isRefreshing: false,
	commits: {
		byId: {},
		allIds: []
	},
	error: undefined,
};

export interface IRepositoryState {
	repoPath: string;
	isLoading: boolean;
	isRefreshing: boolean;
	commits: {
		byId: {
			[id: string]: ICommit,
		}
		allIds: string[]
	};
	error?: IError;
}

export default function repository(state: IRepositoryState = initialState, action: AnyAction) {
	switch (action.type) {
		case LOAD_COMMITS_REQUEST:
			return Object.assign({}, state, {
				isLoading: true
			});
		case LOAD_COMMITS_SUCCESS:
			return Object.assign({}, state, {
				isLoading: false,
				commits: {
					byId: Object.assign({}, state.commits.byId, arrayToObject(action.payload, 'hash')),
					allIds: [...state.commits.allIds, ...action.payload.map(commit => commit.hash)]
				}
			});
		case LOAD_COMMITS_FAILURE:
			return Object.assign({}, state, {
				isLoading: false,
				error: action.payload
			});
		case REFRESH_COMMITS_REQUEST:
			return Object.assign({}, state, {
				isRefreshing: true
			});
		case REFRESH_COMMITS_SUCCESS:
			return Object.assign({}, state, {
				isRefreshing: false,
				commits: {
					byId: Object.assign({}, arrayToObject(action.payload, 'hash')),
					allIds: [...action.payload.map(commit => commit.hash)]
				}
			});
		case REFRESH_COMMITS_FAILURE:
			return Object.assign({}, state, {
				isRefreshing: false,
				error: action.payload
			});
		default:
			return state;
	}
}

/**
 * Transforms an array of objects into on "map" object where each
 * object in the original is mapped to a given key.
 * @param array An array with objects
 * @param keyField The field to use as keys for the returning object
 */
function arrayToObject(array: object[], keyField: string): object {
	return array.reduce((obj: any, item: any) => {
		obj[item[keyField]] = item;
		return obj;
	}, {});
}