import * as Git from 'simple-git/promise';
import { ICommit, IComparison, IPatch, IFile, PatchStatus } from './types';

type GitRawOutput = {
	raw: string;
};

export default interface Api {
	getCommits(repoPath: string, numCommits: number): Promise<ICommit[]>;
	getCommits(repoPath: string, numCommits: number, fromHash: string): Promise<ICommit[]>;
	diffCommits(repoPath: string, hashes: string[]): Promise<IComparison>;
}

export async function getCommits(repoPath: string, numCommits: number): Promise<ICommit[]>;
export async function getCommits(repoPath: string, numCommits: number, fromHash: string): Promise<ICommit[]>;
export async function getCommits(repoPath: string, numCommits: number, fromHash?: string): Promise<ICommit[]> {
	try {
		let git = Git(repoPath);
		let logSummary = await git.log([`-n ${numCommits}`, '--parents']);

		let commits: ICommit[] = logSummary.all.map(gitCommit => {
			return {
				hash: gitCommit.hash,
				parentHash: gitCommit.parent,
				author: gitCommit.author_name + `<${gitCommit.author_email}>`,
				date: new Date(gitCommit.date),
				message: gitCommit.message,
			};
		});

		return commits;
	} catch (err) {
		throw err;
	}
}

export async function diffCommits(repoPath: string, hashes: string[]): Promise<IComparison> {
	let git = Git(repoPath);
	// Initialize the comparison return data
	let comparisons: IComparison = {
		allHashes: hashes,
		diffsByHash: hashes.reduce((obj, item) => {
				// Add the hash as a key with empty object as value
			return Object.assign({}, obj, { [item]: {} });
			}, {}),
		filesByHash: hashes.reduce((obj, item) => {
				return Object.assign({}, obj, {
					[item]: {
						allFiles: [],
						byFile: {},
				},
				});
			}, {}),
	};

	// Start a command to get all file names that has changed in all selected commits
	let showChangedFilesRawJob = git.raw(['show', '--name-only', ...hashes, '--format=%m%H']);

	// Get the diff patches
	const diffTreeJobs = getDiffTree(async (fromHash, toHash) => ({
		fromHash,
		toHash,
		raw: await git.raw(['diff-tree', '--raw', '-r', '-M', `${fromHash}..${toHash}`]),
	}),	hashes);
	const diffTreeRaw: DiffTreeRaw[] = await Promise.all(diffTreeJobs);
	let diffTrees: DiffTree = diffTreeRaw.reduce((patches: DiffTree, diff: DiffTreeRaw) => {
		// TODO: Remove if statement
		if (!diff.raw) {
			console.log(diff);
		}
		const diffTreePatches = parseDiffTree(diff.raw);
		return [
			...patches,
			...diffTreePatches.map(patch => ({
				fromHash: diff.fromHash,
				toHash: diff.toHash,
				...patch,
			})),
		];
	}, []);

	// Filter the patches to only include files that are included in 
	// among the changed files.
	// TODO: Measure if this improves performance
	let changedFiles = parseShowChangedFiles(await showChangedFilesRawJob);
	diffTrees = diffTrees.filter(diff => {
		// Get the hashes included in this patch
		let includedHashes = hashes.slice(
			hashes.findIndex(hash => hash === diff.fromHash), 
			hashes.findIndex(hash => hash === diff.toHash)
		);
		// Get all changed files
		let includedFiles = includedHashes.reduce((files, hash) => {
			return files.concat(changedFiles[hash])
		}, [])
		// Filter
		return includedFiles.includes(diff.originalFileName) || includedFiles.includes(diff.modifiedFileName)
	})

	// get the blame (and file contents)
	const blameJobs = getBlame(async (hash: string, fileName: string) => ({
		hash,
		fileName,
		raw: await git.raw(['blame', '-s', '-l', hash, '--', fileName]),
	}),	diffTrees);

	const rawBlames = await Promise.all(blameJobs);
	const blames: BlameWithFileId[] = rawBlames.map(rawBlame => {
		const blame = parseBlame(rawBlame.raw);
		return {
			hash: rawBlame.hash,
			fileName: rawBlame.fileName,
			content: blame.content,
			blame: blame.blame,
		};
	});

	// Build the output
	diffTrees.forEach(diff => {
		// fromMap initialized for all hashes above
		let fromMap = comparisons.diffsByHash[diff.fromHash];

		// Create Diff object (but don't overwrite anything if it already existed)
		fromMap[diff.toHash] = Object.assign({}, {
				fromHash: diff.fromHash,
				toHash: diff.toHash,
				patches: [],
			}, fromMap[diff.toHash]);

		// Push a new patch
		fromMap[diff.toHash].patches.push({
			status: diff.patchStatus,
			modifiedFile: diff.modifiedFileName,
			originalFile: diff.originalFileName,
		} as IPatch);
	});

	blames.forEach(blame => {
		let fileMap = comparisons.filesByHash[blame.hash];
		fileMap.byFile[blame.fileName] = {
			hash: blame.hash,
			filePath: blame.fileName,
			blame: blame.blame,
			content: blame.content,
		} as IFile;
		fileMap.allFiles.push(blame.fileName);
	});

	return comparisons;
}

type FileId = {
	hash: string;
	fileName: string;
};
type BlameRaw = GitRawOutput & FileId;
type BlameCommand = (hash: string, fileName: string) => Promise<BlameRaw>;
function getBlame(blameCommand: BlameCommand, diffTrees: DiffTree): Promise<BlameRaw>[] {
	let filesByHash = {};
	return diffTrees.reduce((blameRawJobs: Promise<BlameRaw>[], patch: DiffTreePatchWithId) => {
		let currentBlameRawJobs: Promise<BlameRaw>[] = [];
		// Initialize if undefined
		filesByHash[patch.fromHash] = filesByHash[patch.fromHash] || {};
		filesByHash[patch.toHash] = filesByHash[patch.toHash] || {};

		if (patch.originalFileName && !filesByHash[patch.fromHash][patch.originalFileName]) {
			currentBlameRawJobs.push(blameCommand(patch.fromHash, patch.originalFileName));
		}

		if (patch.modifiedFileName && !filesByHash[patch.toHash][patch.modifiedFileName]) {
			currentBlameRawJobs.push(blameCommand(patch.toHash, patch.modifiedFileName));
		}
		return [...blameRawJobs, ...currentBlameRawJobs];
	}, []);
}

type ComparisonId = {
	fromHash: string;
	toHash: string;
};
type DiffTreeRaw = GitRawOutput & ComparisonId;
type DiffTreeCommand = (fromHash: string, toHash: string) => Promise<DiffTreeRaw>;
function getDiffTree(diffTreeCommand: DiffTreeCommand, hashes: string[]): Promise<DiffTreeRaw>[] {
	if (hashes.length == 1) return [];
	let [fromHash, ...rest] = hashes;
	let diffTree = rest.map(toHash => diffTreeCommand(fromHash, toHash));
	return diffTree.concat(getDiffTree(diffTreeCommand, rest));
}

type Blame = {
	blame: string[];
	content: string;
};
type BlameWithFileId = Blame & FileId;
function parseBlame(raw: string): Blame {
	let lines = raw.split('\n').filter(Boolean);
	let blame = [];
	let content = [];
	for (let line of lines) {
		// One line of blame typically looks like;
		// "^66535fce3bb71adf27e7c034316c8f63ac52593 17)\t\tborderLeft: '5px solid rgba(255, 255, 255, 0)',"
		// Split by the first "<digit>)" ("17)" in examle above)
		let regexp = / \d+\) ?/g;
		let result = regexp.exec(line);
		if (result) {
			blame.push(line.slice(1, result.index));
			content.push(line.slice(regexp.lastIndex));
		}
	}

	return {
		blame: blame,
		content: content.join('\n'),
	};
}

type DiffTree = Array<DiffTreePatchWithId>;
type DiffTreePatchWithId = DiffTreePatch & ComparisonId;
type DiffTreePatch = {
	originalChecksum: string;
	modifiedChecksum: string;
	originalFileName: string;
	modifiedFileName: string;
	patchStatus: PatchStatus;
};
function parseDiffTree(raw: string): DiffTreePatch[] {
	// Example raw:
	// :000000 100644 1234567... 0000000... D  __tests__/core.spec.tsx
	// :000000 100644 0000000... 1234567... A  jest.config.js
	// :100644 100644 bcd1234... 0123456... M  package.json
	// :100644 100644 abcd123... 1234567... R86 file1 file3
	// :100644 100644 abcd123... 1234567... C68 file1 file2

	let lines: string[] = raw.split('\n').filter(Boolean);
	let patches: DiffTreePatch[] = [];
	for (let line of lines) {
		// Split by space/tabs.
		// Third part is original checksum.
		// Fourth part is modified checksum.
		// Fifth part will be patchStatus.
		// Sixth part will be the file that was changed,
		// the Seventh optional part (only if patchStatus is C or R)
		// is the new name of the file.
		let parts = line.split(/\s+/);

		const originalChecksum = parts[2];
		const modifiedChecksum = parts[3];

		let patchStatus: PatchStatus;
		switch (parts[4].charAt(0)) {
			case 'A':
				patchStatus = PatchStatus.Added;
				break;
			case 'C':
				patchStatus = PatchStatus.Copied;
				break;
			case 'D':
				patchStatus = PatchStatus.Deleted;
				break;
			case 'M':
				patchStatus = PatchStatus.Modified;
				break;
			case 'R':
				patchStatus = PatchStatus.Renamed;
				break;
			case 'U':
				patchStatus = PatchStatus.Unmerged;
				break;
			case 'T':
				patchStatus = PatchStatus.TypeChanged;
				break;
			case 'X':
				patchStatus = PatchStatus.Unknown;
				break;
			case 'B':
				patchStatus = PatchStatus.Broken;
				break;
			default:
				console.error(`Unknown diff status
					${parts[0].charAt(0)}
				, probably bad input/parsing error.`);
				patchStatus = PatchStatus.Unknown;
		}

		let originalFileName;
		let modifiedFileName;
		if (patchStatus == PatchStatus.Copied || patchStatus == PatchStatus.Renamed) {
			modifiedFileName = parts[6];
			originalFileName = parts[5];
		} else if (patchStatus == PatchStatus.Added) {
			modifiedFileName = parts[5];
			originalFileName = '';
		} else if (patchStatus == PatchStatus.Deleted) {
			modifiedFileName = '';
			originalFileName = parts[5];
		} else {
			modifiedFileName = parts[5];
			originalFileName = parts[5];
		}

		patches.push({
			patchStatus,
			originalChecksum,
			modifiedChecksum,
			originalFileName,
			modifiedFileName,
		});
	}

	return patches;
}

function parseShowChangedFiles(raw: string): { [hash: string]: string[] } {
	let filesPerCommit: string[] = raw.split('>');

	let ret = {};

	for (let commit of filesPerCommit) {
		let lines = commit.split('\n').filter(Boolean);
		let hash = lines.shift();
		if (!hash) {
			continue;
		}

		ret[hash] = [];

		for (let file of lines) {
			ret[hash].push(file);
		}
	}
	return ret;
}
