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

export const getScrollSyncRanges = (numLines: number, lineChanges: IGenericLineChange[]): number[] => {
	const documentHeight = numLines * LINE_HEIGHT;
	return lineChanges.reduce((ranges: number[], lineChange: IGenericLineChange) => {
		const stopPoint1 = ((lineChange.startLine - 1) * LINE_HEIGHT) / documentHeight;
		const stopPoint2 = lineChange.endLine === 0 ? stopPoint1 : (lineChange.endLine * LINE_HEIGHT) / documentHeight;
		return [...ranges, stopPoint1, stopPoint2];
	}, []);
}
