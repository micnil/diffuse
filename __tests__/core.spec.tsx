import { getOriginalLineChanges, getModifiedLineChanges } from '../src/renderer/common/core';
import { ILineChange } from '../src/renderer/diff';
import { IGenericLineChange } from '../src/renderer/common/types';

describe('Convert line changes to generic line changes', () => {
	test('Original changes to generic', () => {
		const originalLineChanges = getOriginalLineChanges(lineChanges);
		expect(originalLineChanges).toEqual(lineChangesOriginalGeneric);
	});

	test('Modified changes to generic', () => {
		const modifiedLineChanges = getModifiedLineChanges(lineChanges);
		expect(modifiedLineChanges).toEqual(lineChangesModifiedGeneric);
	});
});

const lineChanges: ILineChange[] = [
	{
		originalStartLineNumber: 68,
		originalEndLineNumber: 0,
		modifiedStartLineNumber: 69,
		modifiedEndLineNumber: 74,
	},
	{
		originalStartLineNumber: 139,
		originalEndLineNumber: 0,
		modifiedStartLineNumber: 146,
		modifiedEndLineNumber: 154,
	},
	{
		originalStartLineNumber: 1433,
		originalEndLineNumber: 1435,
		modifiedStartLineNumber: 1448,
		modifiedEndLineNumber: 1450,
		charChanges: [
			{
				originalStartLineNumber: 1433,
				originalStartColumn: 23,
				originalEndLineNumber: 1433,
				originalEndColumn: 24,
				modifiedStartLineNumber: 1448,
				modifiedStartColumn: 23,
				modifiedEndLineNumber: 1448,
				modifiedEndColumn: 24,
			},
			{
				originalStartLineNumber: 1434,
				originalStartColumn: 67,
				originalEndLineNumber: 1434,
				originalEndColumn: 68,
				modifiedStartLineNumber: 1449,
				modifiedStartColumn: 67,
				modifiedEndLineNumber: 1449,
				modifiedEndColumn: 68,
			},
			{
				originalStartLineNumber: 1435,
				originalStartColumn: 28,
				originalEndLineNumber: 1435,
				originalEndColumn: 113,
				modifiedStartLineNumber: 1450,
				modifiedStartColumn: 28,
				modifiedEndLineNumber: 1450,
				modifiedEndColumn: 113,
			},
		],
	},
];

const lineChangesModifiedGeneric: IGenericLineChange[] = [
	{
		startLine: 69,
		endLine: 74,
	},
	{
		startLine: 146,
		endLine: 154,
	},
	{
		startLine: 1448,
		endLine: 1450,
		charChanges: [
			{
				startLine: 1448,
				startColumn: 23,
				endLine: 1448,
				endColumn: 24,
			},
			{
				startLine: 1449,
				startColumn: 67,
				endLine: 1449,
				endColumn: 68,
			},
			{
				startLine: 1450,
				startColumn: 28,
				endLine: 1450,
				endColumn: 113,
			},
		],
	},
];

const lineChangesOriginalGeneric: IGenericLineChange[] = [
	{
		startLine: 68,
		endLine: 0,
	},
	{
		startLine: 139,
		endLine: 0,
	},
	{
		startLine: 1433,
		endLine: 1435,
		charChanges: [
			{
				startLine: 1433,
				startColumn: 23,
				endLine: 1433,
				endColumn: 24,
			},
			{
				startLine: 1434,
				startColumn: 67,
				endLine: 1434,
				endColumn: 68,
			},
			{
				startLine: 1435,
				startColumn: 28,
				endLine: 1435,
				endColumn: 113,
			},
		],
	},
];
