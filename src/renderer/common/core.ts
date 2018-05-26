import { ILineChange, ICharChange } from '../diff/diffChange';
import { IGenericLineChange, IGenericCharChange } from './types';

export const getOriginalLineChanges = (lineChanges: ILineChange[]): IGenericLineChange[] => {
	return lineChanges.reduce(
		(genericChanges: IGenericLineChange[], lineChange: ILineChange): IGenericLineChange[] => {
			let genericChange: IGenericLineChange = {
				startLine: lineChange.originalStartLineNumber,
				endLine: lineChange.originalEndLineNumber,
				charChanges: lineChange.charChanges
					? getOriginalCharChanges(lineChange.charChanges)
					: undefined,
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
				charChanges: lineChange.charChanges
                    ? getModifiedCharChanges(lineChange.charChanges)
                    : undefined,
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
