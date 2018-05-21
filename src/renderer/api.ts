import * as Git from 'simple-git/promise';
import { ICommit, IComparison, IDiff, IFile, DiffStatus } from './types';

export default interface Api {
	getCommits(repoPath: string, numCommits: number): Promise<ICommit[]>;
	getCommits(repoPath: string, numCommits: number, fromHash: string): Promise<ICommit[]>;
	diffCommits(repoPath: string, hashes: string[]): Promise<IComparison>;
}


export async function getCommits (repoPath: string, numCommits: number): Promise<ICommit[]>;
export async function getCommits (repoPath: string, numCommits: number, fromHash: string): Promise<ICommit[]>;
export async function getCommits(repoPath: string, numCommits: number, fromHash?: string): Promise<ICommit[]> {
	try {

		let git = Git(repoPath);
		let logSummary = await git.log([`-n ${numCommits}`, '--parents']);

		let commits: ICommit[] = logSummary.all.map( gitCommit => {
			return {
				hash: gitCommit.hash,
				parentHash: gitCommit.parent,
				author: gitCommit.author_name + `<${gitCommit.author_email}>`,
				date: new Date(gitCommit.date),
				message: gitCommit.message
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
				obj[item] = {};
				return obj;
			}, {}),
		filesByHash: hashes.reduce((obj, item) => {
				obj[item] = {
					allFiles: [],
					byFile: {}
				};
				return obj;
			}, {}),
	};

	let showChangedFilesRaw = await git.raw(['show', '--name-only', ...hashes, '--format=%m%H']);
	let changedFiles = parseShowChangedFiles(showChangedFilesRaw);

	for (let from = 0; from < hashes.length; from++) {
		for (let to = from + 1; to < hashes.length; to++) {

			if (!changedFiles[hashes[to]]) {
				continue;
			}

			let rawDiffNameStatuses: string[] = await Promise.all(changedFiles[hashes[to]].map(file => {
				return git.raw(['diff', '--name-status', '--follow', `${hashes[from]}..${hashes[to]}`, '--', file]);
			}));
			let diffNameStatusRaw = rawDiffNameStatuses.join('');
			let diff: IDiff = parseDiffNameStatus(diffNameStatusRaw, hashes[from], hashes[to]);

			for (let patch of diff.patches) {
				if (!comparisons.filesByHash[diff.to].byFile[patch.newFile] && patch.newFile) {
					// get new file
					let newFileBlameRaw = await git.raw(['blame', '-s', '-l', diff.to, '--', patch.newFile]);

					let newFile = parseBlame(newFileBlameRaw, diff.to, patch.newFile);
					comparisons.filesByHash[diff.to].allFiles.push(patch.newFile);
					comparisons.filesByHash[diff.to].byFile[patch.newFile] = newFile;
				}

				if (!comparisons.filesByHash[diff.from].byFile[patch.oldFile] && patch.oldFile) {
					// get old file
					let oldFileBlameRaw = await git.raw(['blame', '-s', '-l', diff.from, '--', patch.oldFile]);

					let oldFile = parseBlame(oldFileBlameRaw, diff.from, patch.oldFile);
					comparisons.filesByHash[diff.from].allFiles.push(patch.oldFile);
					comparisons.filesByHash[diff.from].byFile[patch.oldFile] = oldFile;
				}
			}

			comparisons.diffsByHash[hashes[from]][hashes[to]] = diff;
		}
	}


	return comparisons;
}

function parseBlame(raw: string, hash: string, file: string): IFile {

	let lines = raw.split('\n').filter(Boolean);
	let blame = [];
	let content = [];
	for (let line of lines) {
		// One line of blame typically looks like;
		// "^66535fce3bb71adf27e7c034316c8f63ac52593 17)\t\tborderLeft: '5px solid rgba(255, 255, 255, 0)',"
		// Split by the first "<digit>)" ("17)" in examle above)
		let regexp = / \d+\) ?/g;
		let result = regexp.exec(line);
		if(result) {
			blame.push(line.slice(1, result.index));
			content.push(line.slice(regexp.lastIndex));
		}
	}

	return {
		hash: hash,
		filePath: file,
		blame: blame,
		content: content.join('\n')
	};

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

function parseDiffNameStatus(raw: string, from: string, to: string): IDiff {
	let lines: string[] = raw.split('\n').filter(Boolean);
	let diff: IDiff = {
		from: from,
		to: to,
		patches: []
	};
	for (let line of lines) {

		// Split by space/tabs. First part will be diffstatus,
		// second part will be the file that was changed,
		// the third optional part (only if diffstatus is C or R)
		// is the new name of the file.
		let parts = line.split(/\s+/);

		let oldFile;
		let newFile;
		let diffStatus: DiffStatus;
		switch (parts[0].charAt(0)) {
			case 'A': diffStatus = DiffStatus.Added;
				break;
			case 'C': diffStatus = DiffStatus.Copied;
				break;
			case 'D': diffStatus = DiffStatus.Deleted;
				break;
			case 'M': diffStatus = DiffStatus.Modified;
				break;
			case 'R': diffStatus = DiffStatus.Renamed;
				break;
			case 'U': diffStatus = DiffStatus.Unmerged;
				break;
			case 'T': diffStatus = DiffStatus.TypeChanged;
				break;
			case 'X': diffStatus = DiffStatus.Unknown;
				break;
			case 'B': diffStatus = DiffStatus.Broken;
				break;
			default:
				console.error(`Unknown diff status
					${parts[0].charAt(0)}
				, probably bad input/parsing error.`);
				diffStatus = DiffStatus.Unknown;
		}

		if (diffStatus == DiffStatus.Copied || diffStatus == DiffStatus.Renamed) {
			newFile = parts[2];
			oldFile = parts[1];
		} else if (diffStatus == DiffStatus.Added) {
			newFile = parts[1];
			oldFile = '';
		} else if (diffStatus == DiffStatus.Deleted) {
			newFile = '';
			oldFile = parts[1];
		} else {
			newFile = parts[1];
			oldFile = parts[1];
		}

		diff.patches.push({
			status: diffStatus,
			newFile: newFile,
			oldFile: oldFile
		});
	}

	return diff;
}