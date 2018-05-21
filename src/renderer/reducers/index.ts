import { combineReducers } from 'redux';
import repository, { IRepositoryState } from './repository';
import comparison, { IComparisonState } from './comparison';
import navigation, { INavigationState } from './navigation';

export interface IState {
	repository: IRepositoryState;
	comparison: IComparisonState;
	navigation: INavigationState;
}

const reducers = combineReducers({
	repository,
	comparison,
	navigation
});

export default reducers;