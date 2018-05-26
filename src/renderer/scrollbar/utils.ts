import { ILineChange } from '../diff';
import { IGenericLineChange } from '../common/types';

const LINE_HEIGHT = 15;

export const getScrollHeight = (numOriginalLines: number, lineChanges: ILineChange[]): number => {
	let numScrollLines = lineChanges.reduce((height: number, lineChange: ILineChange) => {
		// prettier-ignore
		const numChangedLinesModified =	lineChange.modifiedEndLineNumber !== 0 ?
			lineChange.modifiedEndLineNumber - lineChange.modifiedStartLineNumber + 1 : 0;
		// prettier-ignore
		const numChangedLinesOriginal =	lineChange.originalEndLineNumber !== 0 ? 
		lineChange.originalEndLineNumber - lineChange.originalStartLineNumber + 1 : 0;
		
		const numAddedLines = numChangedLinesModified - numChangedLinesOriginal;

		return numAddedLines > 0 ? height + numAddedLines : height;
	}, 0);
	numScrollLines += numOriginalLines;
	return numScrollLines * LINE_HEIGHT;
};

export const getScrollSyncRanges = (numLines: number, lineChanges: IGenericLineChange): number[] => {
	
	return []
}
