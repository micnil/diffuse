import { ILineChange } from '../diff/diffChange';
import { IGenericLineChange } from './types';

export const getOriginalLineChanges = (lineChanges: ILineChange[]): IGenericLineChange[] => {
	return lineChanges.reduce(
		(genericChanges: IGenericLineChange[], lineChange: ILineChange): IGenericLineChange[] => {
			const genericChange = {
				startLine: lineChange.originalStartLineNumber,
				endLine: lineChange.originalEndLineNumber,
			};

			return [...genericChanges, genericChange];
		},
		[],
	);
};

export const getModifiedLineChanges = (lineChanges: ILineChange[]): IGenericLineChange[] => {
	return lineChanges.reduce(
		(genericChanges: IGenericLineChange[], lineChange: ILineChange): IGenericLineChange[] => {
			const genericChange = {
				startLine: lineChange.modifiedStartLineNumber,
				endLine: lineChange.modifiedEndLineNumber,
			};

			return [...genericChanges, genericChange];
		},
		[],
	);
};
