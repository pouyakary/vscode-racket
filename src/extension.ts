//
// Copyright 2016 Kary Foundation, Inc.
//   Author: Pouya Kary <k@karyfoundation.org>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

//
// ─── IMPORTS ────────────────────────────────────────────────────────────────────
//

	import * as vscode from 'vscode'

//
// ─── ACTIVATION FUNCTION ────────────────────────────────────────────────────────
//

	export function activate(context: vscode.ExtensionContext) {
		let repl: vscode.Terminal = undefined

		context.subscriptions.push(
			vscode.languages.registerCompletionItemProvider(
				'racket', provideSuggestions, '.'
			)
		)

		context.subscriptions.push(
			vscode.commands.registerCommand( 'racket.createTerminal', ( ) => {
				repl = createReplTerminal( )
				if ( repl )
					repl.show( )
			})
		)

		context.subscriptions.push(
			vscode.commands.registerCommand( 'racket.run', ( ) => {
				const editor = vscode.window.activeTextEditor
				if ( !editor )
					return
				if ( !repl )
					repl = createReplTerminal( )
				if ( repl )
					repl.show( )
				else
					return
				repl.sendText( editor.document.getText( hasSelectedText( editor.selection ) ? editor.selection : null ), true )
			})
		)

		if ( 'onDidCloseTerminal' in vscode.window ) {
			vscode.window.onDidCloseTerminal(( terminal: vscode.Terminal ) => {
				if (terminal.name === 'Racket')
					repl = undefined
			})
		}
	}

//
// ─── DEACTIVATION ───────────────────────────────────────────────────────────────
//

	export function deactivate( ) {
		// nothing goes here
	}

//
// ─── EXPORTS ────────────────────────────────────────────────────────────────────
//

	const provideSuggestions: vscode.CompletionItemProvider = {
		provideCompletionItems: provider
	}

//
// ─── PROVIDER ───────────────────────────────────────────────────────────────────
//

	function provider ( document: vscode.TextDocument,
						position: vscode.Position,
							token: vscode.CancellationToken ): vscode.CompletionItem[ ] {
		// context words
		const words = document.getText( ).split(
			// ./orchestras/space-between-identifiers.orchestra
			/(?:(?:;(?:.)*|[\s\+\*\(\)\[\]]|"(?:(?:\\"|[^"]))*"))+/g )

		// suggestions
		let suggestions = new Array<vscode.CompletionItem>( )

		// getting suggestions
		for ( const word of words ) {
			const suggestion = new vscode.CompletionItem( word )
			suggestion.kind = vscode.CompletionItemKind.Variable
			suggestions.push( suggestion )
		}

		// done
		return suggestions
	}

//
// ─── TERMINAL ───────────────────────────────────────────────────────────────────
//

	function createReplTerminal(): vscode.Terminal {
		const racketPath = vscode.workspace.getConfiguration().get('racket.racketPath') as string
		if (!racketPath) {
			vscode.window.showErrorMessage('Path to racket executable has not been set.')
			return null
		}
		return vscode.window.createTerminal({ name: 'Racket', shellPath: racketPath })
	}

//
// ─── SELECTIONL ─────────────────────────────────────────────────────────────────
//

	function hasSelectedText(selection: vscode.Selection): boolean {
		return !(selection.start.line === selection.end.line && selection.start.character === selection.end.character)
	}

// ────────────────────────────────────────────────────────────────────────────────
