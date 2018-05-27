import { IError, IComparison, IPatch } from '../common/types';
import {
	AnyAction,
	CREATE_DIFF_REQUEST,
	CREATE_DIFF_SUCCESS,
	CREATE_DIFF_FAILURE,
	SELECT_PATCH,
} from '../actions';

export interface IComparisonState extends IComparison {
	fromHash: string;
	toHash: string;
	selectedPatch?: IPatch;
	isLoading: Boolean;
	error?: IError;
}

const initialState: IComparisonState = {
	isLoading: false,
	fromHash: '',
	toHash: '',
	selectedPatch: undefined,
	allHashes: [],
	diffsByHash: {},
	filesByHash: {},
	error: undefined,
};

export default function comparison(state: IComparisonState = initialState, action: AnyAction) {
	switch (action.type) {
		case CREATE_DIFF_REQUEST:
			return Object.assign({}, state, {
				isLoading: true,
			});
		case CREATE_DIFF_SUCCESS:
			let fromHash = action.payload.allHashes[0];
			let toHash = action.payload.allHashes[action.payload.allHashes.length - 1];
			return Object.assign({}, state, {
				isLoading: false,
				allHashes: action.payload.allHashes,
				diffsByHash: action.payload.diffsByHash,
				filesByHash: action.payload.filesByHash,
				fromHash: fromHash,
				toHash: toHash,
				selectedPatch: action.payload.diffsByHash[fromHash][toHash].patches[0],
			});
		case CREATE_DIFF_FAILURE:
			return Object.assign({}, state, {
				isLoading: false,
				error: action.payload,
			});
		case SELECT_PATCH:
			return Object.assign({}, state, {
				selectedPatch: action.payload.patch,
			});
		default:
			return state;
	}
}
