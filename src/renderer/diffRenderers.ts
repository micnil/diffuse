import { createElement, DocumentNode, IElementNode, ITextNode } from 'react-syntax-highlighter';
import { ILineChange } from './diff/diffChange';

const styles = {
	modificationBorder: {
		display: 'block',
		borderBottom: '2px solid rgba(0, 0, 255, 0.2)'
	} as React.CSSProperties,

	lineChangedOriginal: {
		display: 'block',
		backgroundColor: 'rgba(255, 0, 0, 0.1)'
	} as React.CSSProperties,

	charChangedOriginal: {
		backgroundColor: 'rgba(255, 0, 0, 0.1)'
	} as React.CSSProperties,

	lineChangedModified: {
		display: 'block',
		backgroundColor: 'rgba(0, 255, 0, 0.1)'
	} as React.CSSProperties,

	charChangedModified: {
		backgroundColor: 'rgba(0, 255, 0, 0.1)'
	} as React.CSSProperties,
};

interface IGeneralCharChange {
	readonly startColumn: number;
	readonly endColumn: number;
}

export function originalDiffRenderer(lineChanges: ILineChange[], blame: string[]) {
	return ({ rows, stylesheet, useInlineStyles }: any) => {

		let lineChange = lineChanges.shift();
		return rows.map((node: IElementNode, i: number) => {

			// No (more) line changes, just create an element.
			if (!lineChange) {
				return createElement({
					node,
					stylesheet,
					useInlineStyles,
					key: `code-segement${i}`
				});
			}

			let currentline = i + 1;

			// This is a added file, don't do anything
			if (lineChange.originalStartLineNumber == 0) {
				lineChange = lineChanges.shift();
				return createElement({
					node,
					stylesheet,
					useInlineStyles,
					key: `code-segement${i}`
				});
			}

			// This is a position where a line has been added.
			if (currentline === lineChange.originalStartLineNumber &&
				lineChange.originalEndLineNumber == 0) {
				lineChange = lineChanges.shift();
				// Add a border to indicate where content has been added.
				return createElement({
					node,
					stylesheet,
					useInlineStyles,
					style: styles.modificationBorder,
					key: `code-segement${i}`
				});
			}

			// We are currently in range of the lineChange (modification)
			if (currentline >= lineChange.originalStartLineNumber &&
				currentline <= lineChange.originalEndLineNumber) {

				if (lineChange.charChanges) {
					// Get the charchanges for the current line only.
					let currentCharChanges: IGeneralCharChange[] = lineChange.charChanges.filter( charChange =>
						charChange.originalStartLineNumber == currentline
					).map( charChange => ({
						startColumn: charChange.originalStartColumn,
						endColumn: charChange.originalEndColumn,
					}));

					// Only handle charchanges if there are any for this line.
					if (currentCharChanges.length > 0) {
						node.children = handleCharChanges(node.children, currentCharChanges, styles.charChangedOriginal);
					}
				}

				return createElement({
					node,
					stylesheet,
					useInlineStyles,
					style: styles.lineChangedOriginal,
					key: `code-segement${i}`
				});
			}

			// If the current line change has already been handled,
			// get a new one.
			if (lineChange.originalEndLineNumber < i) {
				lineChange = lineChanges.shift();
			}

			return createElement({
				node,
				stylesheet,
				useInlineStyles,
				key: `code-segement${i}`
			});
		}
	); };
}

export function modifiedDiffRenderer(lineChanges: ILineChange[], blame: string[]) {
	return ({ rows, stylesheet, useInlineStyles }: any) => {

		let lineChange = lineChanges.shift();
		return rows.map((node: IElementNode, i: number) => {

			// No (more) line changes, just create an element.
			if (!lineChange) {
				return createElement({
					node,
					stylesheet,
					useInlineStyles,
					key: `code-segement${i}`
				});
			}

			let currentline = i + 1;

			// This is a added file, don't do anything
			if (lineChange.modifiedStartLineNumber == 0) {
				lineChange = lineChanges.shift();
				return createElement({
					node,
					stylesheet,
					useInlineStyles,
					key: `code-segement${i}`
				});
			}

			// This is a position where a line has been added.
			if (currentline === lineChange.modifiedStartLineNumber &&
				lineChange.modifiedEndLineNumber == 0) {
				lineChange = lineChanges.shift();
				// Add a border to indicate where content has been added.
				return createElement({
					node,
					stylesheet,
					useInlineStyles,
					style: styles.modificationBorder,
					key: `code-segement${i}`
				});
			}

			// We are currently in range of the lineChange (modification)
			if (currentline >= lineChange.modifiedStartLineNumber &&
				currentline <= lineChange.modifiedEndLineNumber) {

				if (lineChange.charChanges) {
					// Get the charchanges for the current line only.
					let currentCharChanges = lineChange.charChanges.filter( charChange =>
						charChange.modifiedStartLineNumber == currentline
					).map( charChange => ({
						startColumn: charChange.modifiedStartColumn,
						endColumn: charChange.modifiedEndColumn,
					}));

					// Only handle charchanges if there are any for this line.
					if (currentCharChanges.length > 0) {
						node.children = handleCharChanges(node.children, currentCharChanges, styles.charChangedModified);
					}
				}

				return createElement({
					node,
					stylesheet,
					useInlineStyles,
					style: styles.lineChangedModified,
					key: `code-segement${i}`
				});
			}

			// If the current line change has already been handled,
			// get a new one.
			if (lineChange.modifiedEndLineNumber < i) {
				lineChange = lineChanges.shift();
			}

			return createElement({
				node,
				stylesheet,
				useInlineStyles,
				key: `code-segement${i}`
			});
		}
	); };
}

function handleCharChanges(nodes: DocumentNode[], charChanges: IGeneralCharChange[], charChangeStyle: React.CSSProperties): DocumentNode[] {
	let highlightedNodes: DocumentNode[] = [...nodes];
	for (let charChange of charChanges) {
		highlightedNodes = handleCharChange(highlightedNodes, charChange, charChangeStyle);
	}
	return highlightedNodes;
}

function handleCharChange(nodes: DocumentNode[], charChange: IGeneralCharChange, charChangeStyle: React.CSSProperties): DocumentNode[] {
	let highlightedNodes: DocumentNode[] = [];
	let startColumn = 1;

	for (let node of nodes) {

		let nodeText  = getText(node);
		let endColumn = startColumn + nodeText.length;

		// char change has already been handled. Should probably exit early in this
		// case, but leaving it like this to keep sanity.
		if (charChange.endColumn <= startColumn) {
			highlightedNodes.push(node);
			startColumn = endColumn;
			continue;
		}

		// Charchange does not affect this node
		if (charChange.startColumn >= endColumn) {
			highlightedNodes.push(node);
			startColumn = endColumn;
			continue;
		}

		// If node is completely encapsulated in charChange, add styling
		if (charChange.startColumn <= startColumn &&
			charChange.endColumn >= endColumn) {
			highlightedNodes.push(highlightNode(node, charChangeStyle));
			startColumn = endColumn;
			continue;
		}

		// If charChange is completely encapsulated in node
		// split the node in three parts
		if (startColumn <= charChange.startColumn &&
			endColumn >= charChange.endColumn) {
			let splitStartIndex = charChange.startColumn - startColumn;
			let splitEndIndex =  charChange.endColumn - startColumn;

			let firstNormalText = nodeText.slice(0, splitStartIndex);
			let highlightedText = nodeText.slice(splitStartIndex, splitEndIndex);
			let secondNormalText = nodeText.slice(splitEndIndex);

			let firstNormalNode = replaceChildren(node, createTextNode(firstNormalText));
			let highlightedNode = replaceChildren(node, createTextNode(highlightedText), charChangeStyle);
			let secondNormalNode = replaceChildren(node, createTextNode(secondNormalText));

			highlightedNodes.push(firstNormalNode, highlightedNode, secondNormalNode);
			startColumn = endColumn;
			continue;
		}

		// If node needs to be split in two
		if (charChange.startColumn <= startColumn) {
			let splitIndex = charChange.endColumn - startColumn;
			let highlightedText = nodeText.slice(0, splitIndex);
			let normalText = nodeText.slice(splitIndex);

			let normalNode = replaceChildren(node, createTextNode(normalText));
			let highlightedNode = replaceChildren(node, createTextNode(highlightedText), charChangeStyle);

			highlightedNodes.push(highlightedNode, normalNode);
			startColumn = endColumn;
			continue;
		}

		// If node needs to be split in two
		if (charChange.endColumn >= endColumn) {
			let splitIndex = charChange.startColumn - startColumn;
			let highlightedText = nodeText.slice(splitIndex);
			let normalText = nodeText.slice(0, splitIndex);

			let normalNode = replaceChildren(node, createTextNode(normalText));
			let highlightedNode = replaceChildren(node, createTextNode(highlightedText), charChangeStyle);

			highlightedNodes.push(normalNode, highlightedNode);
			startColumn = endColumn;
			continue;
		}
	}

	return highlightedNodes;
}

function replaceChildren(node: DocumentNode, child: DocumentNode, style?: React.CSSProperties): DocumentNode {
	let newNode: DocumentNode;

	// If the inout node is an element type, copy it and replace the children.
	// Apply the new styling if defined.
	if (node.type == 'element') {
		newNode = copyNodeWithoutChildren(node);
		newNode.children.push(child);

		if (style) {
			newNode.properties.style = style;
		}
		return newNode;
	}

	// Must be a TextNode, if we have a style defined, we first need
	// to create a parent element node.
	if (style) {
		newNode = createElementNode('span');
		newNode.properties.style = style;
		newNode.children.push(child);
		return newNode;
	}

	// If we are passed a TextNode, and we do not want any styling,
	// just return the child.
	return child;
}

function copyNodeWithoutChildren(node: IElementNode): IElementNode {
	return {
		'type': node.type,
		'tagName': node.tagName,
		'properties': {
			'className': [...node.properties.className],
		},
		'children': []
	};
}

function createTextNode(text: string): ITextNode {
	return {
		'type': 'text',
		'value': text
	};
}

function createElementNode(tagName: string): IElementNode {
	return {
		'type': 'element',
		'tagName': tagName,
		'properties': {
			'className': []
		},
		'children': []
	};
}

function getText(node: DocumentNode): string {
	if ( node.type === 'element') {
		return node.children.reduce((text: string, node: DocumentNode) => {
			return node.type == 'text' ? text + node.value : text;
		}, '');
	} else {
		return node.value;
	}
}

function highlightNode(node: DocumentNode, style: React.CSSProperties): DocumentNode {
	let highlightedNode: DocumentNode;
	if (node.type === 'element') {
		highlightedNode = copyNodeWithoutChildren(node);
		highlightedNode.children.push(...node.children);
		highlightedNode.properties.style = style;
	} else {
		highlightedNode = createElementNode('span');
		highlightedNode.properties.style = style;
		highlightedNode.children.push(createTextNode(node.value));
	}
	return highlightedNode;
}


