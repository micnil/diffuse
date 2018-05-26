import {
	Dispatch as ReduxDispatch,
} from 'redux';
import { IState } from '../reducers';

export interface ICommit {
	hash: string;
	parentHash: string | undefined;
	author: string;
	date: Date;
	message: string;
}

export interface IReview {
	id: string;
	parentHash: string | undefined;
	commitsHashes: string[];
}

export interface IError {
	message: string;
	callstack?: string;
}

export enum PatchStatus {
	Added = 'Added',
	Copied = 'Copied',
	Deleted = 'Deleted',
	Modified = 'Modified',
	Renamed = 'Renamed',
	Unmerged = 'Unmerged',
	TypeChanged = 'TypeChanged',
	Unknown = 'Unknown',
	Broken = 'Broken'
}

export interface IDiffHunk {
	content: string;
	line: number;
	added: boolean;
	removed: boolean;
}

export interface IPatch {
	status: PatchStatus;
	modifiedFile: string;
	originalFile: string;
}

export interface IDiff {
	from: string;
	to: string;
	patches: IPatch[];
}

export interface IFile {
	hash: string;
	filePath: string;
	blame: string[];
	content: string;
}

export interface IComparison {
	allHashes: string[];
	diffsByHash: {
		[fromHash: string]: {
			[toHash: string]: IDiff
		}
	};
	filesByHash: {
		[hash: string]: {
			byFile: {
				[file: string]: IFile
			}
			allFiles: string[]
		}
	};
}

export interface IGenericLineChange {
	readonly startLine: number;
	readonly endLine: number;
	readonly charChanges?: IGenericCharChange[];
}

export interface IGenericCharChange {
	readonly startLine: number;
	readonly endLine: number;
	readonly startColumn: number;
	readonly endColumn: number;
}

export type Dispatch = ReduxDispatch<IState>;