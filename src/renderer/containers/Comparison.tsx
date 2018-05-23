import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IState } from '../reducers';
import { IFile, Dispatch, IPatch, PatchStatus } from '../types';
import { DiffComputer } from '../diff/diffComputer';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/styles/hljs';
import { ILineChange } from '../diff/diffChange';
import { originalDiffRenderer, modifiedDiffRenderer } from '../diffRenderers';
import { FakeScrollbar, withScrollSync } from '../Scrollbar';
import { Splitter, Pane } from '../SplitPane';

const styles = {
	resizableSplitter: {
		background: atomOneDark.hljs.background,
		opacity: 0.98,
		zIndex: 1,
		boxSizing: 'border-box',
		backgroundClip: 'padding-box',
		width: 40,
		cursor: 'col-resize',
	} as React.CSSProperties,

	code: {
		margin: 8,
	} as React.CSSProperties,

	codeContainer: {
		overflowX: 'hidden',
		margin: -5,
		height: 'fit-content',
		width: 'available',
		tabSize: 2,
	} as React.CSSProperties,

	addition: {
		backgroundColor: 'rgba(0, 255, 0, 0.2)',
	} as React.CSSProperties,

	additionBorder: {
		borderBottom: 'rgba(255, 0, 0, 0.2)',
	} as React.CSSProperties,

	deletion: {
		backgroundColor: 'rgba(255, 0, 0, 0.2)',
	} as React.CSSProperties,
};

export interface IComparisonProps {
	patch?: IPatch;
	originalFile?: IFile;
	modifiedFile?: IFile;
}

export interface IComparisonState {
	lineChanges: ILineChange[];
	originalFileBlame: string[];
	modifiedFileBlame: string[];
	originalFileContent: string;
	modifiedFileContent: string;
	patchStatus: PatchStatus;
}

const initialState: IComparisonState = {
	lineChanges: [],
	originalFileBlame: [],
	modifiedFileBlame: [],
	originalFileContent: 'No content',
	modifiedFileContent: 'No content',
	patchStatus: undefined,
}

let PaneWithScrollSync = withScrollSync(Pane);
export class Comparison extends Component<IComparisonProps, IComparisonState> {

	readonly state = initialState;

	renderSideBySideDiff(originalContent: string, modifiedContent: string, lineChanges: ILineChange[]) {
		return (
			<FakeScrollbar scrollHeight={2100}>
				<Splitter>
					<PaneWithScrollSync style={{background: atomOneDark.hljs.background}}>
						<SyntaxHighlighter
							style={atomOneDark}
							customStyle={styles.codeContainer}
							renderer={originalDiffRenderer([...lineChanges], [])}
							showLineNumbers={true}
						>
							{originalContent}
						</SyntaxHighlighter>
					</PaneWithScrollSync>
					<PaneWithScrollSync style={{background: atomOneDark.hljs.background}}>
						<SyntaxHighlighter
							style={atomOneDark}
							customStyle={styles.codeContainer}
							renderer={modifiedDiffRenderer([...lineChanges], [])}
							showLineNumbers={true}
						>
							{modifiedContent}
						</SyntaxHighlighter>
					</PaneWithScrollSync>
				</Splitter>
			</FakeScrollbar>
		);
	}

	renderSideBySide(originalContent: string, modifiedContent: string) {
		return (
			<FakeScrollbar scrollHeight={2100}>
				<Splitter>
					<PaneWithScrollSync style={{background: atomOneDark.hljs.background}}>
						<SyntaxHighlighter
							style={atomOneDark}
							showLineNumbers={true}
							customStyle={styles.codeContainer}
						>
							{originalContent}
						</SyntaxHighlighter>
					</PaneWithScrollSync>
					<PaneWithScrollSync style={{background: atomOneDark.hljs.background}}>
						<SyntaxHighlighter
							style={atomOneDark}
							showLineNumbers={true}
							customStyle={styles.codeContainer}
						>
							{modifiedContent}
						</SyntaxHighlighter>
					</PaneWithScrollSync>
				</Splitter>
			</FakeScrollbar>
		);
	}

	static getDerivedStateFromProps(nextProps: IComparisonProps, prevState: IComparisonState): IComparisonState | null {
		let { originalFile, modifiedFile, patch } = nextProps;

		// No files selected, render empty codeblocks
		if (!patch) {
			return {
				lineChanges: [],
				originalFileBlame: [],
				modifiedFileBlame: [],
				originalFileContent: 'No content',
				modifiedFileContent: 'No content',
				patchStatus: PatchStatus.Unknown,
			};
		}

		// modified is deleted, render original.
		if (patch.status === PatchStatus.Deleted) {
			return {
				lineChanges: [],
				originalFileBlame: originalFile.blame,
				modifiedFileBlame: [],
				originalFileContent: originalFile.content,
				modifiedFileContent: 'No content',
				patchStatus: patch.status,
			};
		}

		// modified is added, render modified.
		if (patch.status === PatchStatus.Added) {
			return {
				lineChanges: [],
				originalFileBlame: [],
				modifiedFileBlame: modifiedFile.blame,
				originalFileContent: 'No content',
				modifiedFileContent: modifiedFile.content,
				patchStatus: patch.status,
			};
		}

		// Both files exists, must be modification.

		const originalLines = originalFile.content.split('\n');
		const modifiedLines = modifiedFile.content.split('\n');

		let diffComputer = new DiffComputer(originalLines, modifiedLines, {
			shouldPostProcessCharChanges: true,
			shouldIgnoreTrimWhitespace: true,
			shouldMakePrettyDiff: true,
		});

		let lineChanges = diffComputer.computeDiff();
		return {
			lineChanges,
			originalFileBlame: originalFile.blame,
			modifiedFileBlame: modifiedFile.blame,
			originalFileContent: originalFile.content,
			modifiedFileContent: modifiedFile.content,
			patchStatus: patch.status,
		};
	}

	render() {
		const { patchStatus, originalFileContent, modifiedFileContent} = this.state;

		if (patchStatus === PatchStatus.Added ||
			patchStatus === PatchStatus.Deleted ||
			patchStatus === PatchStatus.Unknown) {
			return this.renderSideBySide(originalFileContent, modifiedFileContent)
		}

		const { lineChanges } = this.state;

		return this.renderSideBySideDiff(originalFileContent, modifiedFileContent, lineChanges);
	}
}

const mapStateToProps = (state: IState) => {
	const { comparison: {filesByHash, selectedPatch, fromHash, toHash} } = state;
	let originalFile: IFile;
	let modifiedFile: IFile;
	if (selectedPatch && filesByHash[fromHash] && filesByHash[toHash]) {
		originalFile = filesByHash[fromHash].byFile[selectedPatch.originalFile];
		modifiedFile = filesByHash[toHash].byFile[selectedPatch.modifiedFile];
	}
	return {
		patch: selectedPatch,
		originalFile, 
		modifiedFile
	};
};

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Comparison);
