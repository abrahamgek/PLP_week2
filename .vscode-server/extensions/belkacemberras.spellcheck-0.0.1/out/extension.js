"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const node_fetch_1 = require("node-fetch");
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function createQuickPick(editor, errors, index, text) {
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = errors[index].suggestions.map((suggestion) => ({
        label: suggestion,
    }));
    quickPick.onDidChangeSelection(([item]) => {
        if (item) {
            let aux = text.replace(errors[index].word, item.label);
            vscode.window.showInformationMessage(item.label);
            quickPick.dispose();
            if (errors[index + 1]) {
                createQuickPick(editor, errors, index + 1, aux);
            }
            else {
                editor.edit((edit) => {
                    edit.replace(editor.selection, aux);
                });
                vscode.window.showInformationMessage("Update done, keep up with the good work ! ");
            }
        }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
}
function activate(context) {
    console.log('Congratulations, you activated "Spell Check" ');
    let disposable = vscode.commands.registerCommand("spellcheck.check", () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor; // the text editor where we would choose a word
        if (!editor) {
            vscode.window.showInformationMessage("No editor detected");
            return;
        }
        const text = editor.document.getText(editor.selection);
        try {
            const response = yield node_fetch_1.default("https://jspell-checker.p.rapidapi.com/check", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-rapidapi-key": "469d83cbafmsh6316e64efac12d7p1dc6dajsn422edae87477",
                    "x-rapidapi-host": "jspell-checker.p.rapidapi.com",
                    useQueryString: "true",
                },
                body: JSON.stringify({
                    language: "enUS",
                    fieldvalues: text,
                    config: {
                        forceUpperCase: false,
                        ignoreIrregularCaps: false,
                        ignoreFirstCaps: true,
                        ignoreNumbers: true,
                        ignoreUpper: false,
                        ignoreDouble: false,
                        ignoreWordsWithNumbers: true,
                    },
                }),
            });
            const { spellingErrorCount, elements } = yield response.json();
            if (spellingErrorCount == 0) {
                console.log("no errors found");
                vscode.window.showInformationMessage("no errors found ! well done padwan");
                return;
            }
            else {
                vscode.window.showInformationMessage(`Found ${spellingErrorCount} error(s) ! `);
                createQuickPick(editor, elements[0].errors, 0, text);
            }
        }
        catch (error) {
            console.log(error);
        }
        //   const quickPick = vscode.window.createQuickPick();
        //   quickPick.items = data.elements.map((x: any) => ({ label: x.word }));
        //   quickPick.onDidChangeSelection(([item]) => {
        //     if (item) {
        //       // vscode.window.showInformationMessage(item.label);
        //       editor.edit(edit => {
        //         edit.replace(editor.selection, item.label);
        //       });
        //       quickPick.dispose();
        //     }
        //   });
        //   quickPick.onDidHide(() => quickPick.dispose());
        //   quickPick.show();
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map