
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

	export function activate( context: vscode.ExtensionContext ) {
		context.subscriptions.push(
			vscode.languages.registerCompletionItemProvider(
				'racket', provideSuggestions, '.'
			)
        )
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

// ────────────────────────────────────────────────────────────────────────────────
