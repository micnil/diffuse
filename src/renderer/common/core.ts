import { ILineChange, ICharChange } from '../diff/diffChange';
import { IGenericLineChange, IGenericCharChange } from './types';

export const getOriginalLineChanges = (lineChanges: ILineChange[]): IGenericLineChange[] => {
	return lineChanges.reduce(
		(genericChanges: IGenericLineChange[], lineChange: ILineChange): IGenericLineChange[] => {
			let genericChange: IGenericLineChange = {
				startLine: lineChange.originalStartLineNumber,
				endLine: lineChange.originalEndLineNumber,
				...(lineChange.charChanges && {
					charChanges: getOriginalCharChanges(lineChange.charChanges),
				}),
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
				...(lineChange.charChanges && {
					charChanges: getModifiedCharChanges(lineChange.charChanges),
				}),
			};

			return [...genericChanges, genericChange];
		},
		[],
	);
};

const getOriginalCharChanges = (charChanges: ICharChange[]): IGenericCharChange[] => {
	return charChanges.map((charChange: ICharChange) => {
		return {
			startColumn: charChange.originalStartColumn,
			endColumn: charChange.originalEndColumn,
			startLine: charChange.originalStartLineNumber,
			endLine: charChange.originalEndLineNumber,
		};
	});
};

const getModifiedCharChanges = (charChanges: ICharChange[]): IGenericCharChange[] => {
	return charChanges.map((charChange: ICharChange) => {
		return {
			startColumn: charChange.modifiedStartColumn,
			endColumn: charChange.modifiedEndColumn,
			startLine: charChange.modifiedStartLineNumber,
			endLine: charChange.modifiedEndLineNumber,
		};
	});
};
