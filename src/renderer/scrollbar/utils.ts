import { ILineChange } from '../diff';
import { IGenericLineChange } from '../common/types';

const LINE_HEIGHT = 15;
// export interface ScrollSyncRanges {
// 	document: number[];
// 	scroll: number[];
// }

export type ScrollSyncPoint = [number, number];

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

export const getScrollSyncRanges = (
	syncScrollFrom: IGenericLineChange[],
	syncScrollTo: IGenericLineChange[],
): ScrollSyncPoint[] => {
	return syncScrollFrom
		.map((lineChange, i) => [lineChange, syncScrollTo[i]])
		.filter(entry => getNumChangedLines(entry[1]) - getNumChangedLines(entry[0]) > 0)
		.reduce((ranges: ScrollSyncPoint[], entry) => {
			const syncedPoint1: ScrollSyncPoint = [
				(entry[0].startLine - 1) * LINE_HEIGHT,
				(entry[1].startLine - 1) * LINE_HEIGHT,
			];
			const syncedPoint2: ScrollSyncPoint = [
				entry[0].endLine === 0 ? syncedPoint1[0] : entry[0].endLine * LINE_HEIGHT,
				entry[1].endLine === 0 ? syncedPoint1[1] : entry[1].endLine * LINE_HEIGHT,
			];
			return [...ranges, syncedPoint1, syncedPoint2];
		}, []);
};

const getNumChangedLines = (lineChange: IGenericLineChange) => {
	return lineChange.endLine !== 0 ? lineChange.endLine - lineChange.startLine + 1 : 0;
};
