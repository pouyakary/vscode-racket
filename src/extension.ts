//
// Copyright 2016-present by Pouya Kary <kary@gnu.org>
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
// ─── GLOBALS ────────────────────────────────────────────────────────────────────
//

	var repl: vscode.Terminal =
		undefined

//
// ─── ACTIVATION FUNCTION ────────────────────────────────────────────────────────
//

	export function activate(context: vscode.ExtensionContext) {

		context.subscriptions.push(
			vscode.languages.registerCompletionItemProvider(
				'racket', provideSuggestions, '.'
			)
		)

		context.subscriptions.push(
			vscode.commands.registerCommand( 'racket.createTerminal', onCreateTerminal )
		)

		context.subscriptions.push(
			vscode.commands.registerCommand( 'racket.run', onRunRacket )
		)

		if ( 'onDidCloseTerminal' in vscode.window )
			onDidCloseTerminal( )
	}

//
// ─── ON DID CLONE TERMINAL ──────────────────────────────────────────────────────
//

	function onDidCloseTerminal ( ) {
		vscode.window.onDidCloseTerminal(( terminal: vscode.Terminal ) => {
			if ( terminal.name === 'Racket' )
				repl = undefined
		})
	}

//
// ─── ON CREATE TERMINAL ─────────────────────────────────────────────────────────
//

	function onCreateTerminal ( ) {
		repl =
			createReplTerminal( )
		if ( repl )
			repl.show( )
	}

//
// ─── ON RUN RACKET ──────────────────────────────────────────────────────────────
//

	function onRunRacket ( ) {
		const editor =
			vscode.window.activeTextEditor

		if ( !editor )
			return
		if ( !repl )
			repl = createReplTerminal( )
		if ( repl )
			repl.show( )
		else
			return

		repl.sendText(
			editor.document.getText(
				hasSelectedText( editor.selection )
					? editor.selection
					: null
					)
			, true )
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
    const unique_words = new Set(words)

		// suggestions
		let suggestions = new Array<vscode.CompletionItem>( )

		// getting suggestions
		for ( const word of unique_words ) {
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

	function createReplTerminal ( ): vscode.Terminal {
		const racketPath =
			vscode.workspace
				.getConfiguration( )
				.get('racket.racketPath') as string

		if ( !racketPath ) {
			vscode.window.showErrorMessage( 'Path to racket executable has not been set.' )
			return null
		}

		return vscode.window.createTerminal({
			name: 		'Racket',
			shellPath: 	racketPath
		})
	}

//
// ─── SELECTIONL ─────────────────────────────────────────────────────────────────
//

	function hasSelectedText ( selection: vscode.Selection ): boolean {
		return selection.start.line !== selection.end.line ||
			   selection.start.character !== selection.end.character
	}

// ────────────────────────────────────────────────────────────────────────────────
