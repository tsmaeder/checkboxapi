// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface Element {
	label: string;
	checked?: vscode.TreeItemCheckboxState | { readonly state: vscode.TreeItemCheckboxState; readonly tooltip?: string; readonly accessibilityInformation?: vscode.AccessibilityInformation };
	children: Element[];
}

const root: Element= {
	label: 'root',
	checked: vscode.TreeItemCheckboxState.Unchecked,
	children: [
		{
			label: 'first',
			children:[]
		}, 
		{
			label: 'second',
			checked: { state: vscode.TreeItemCheckboxState.Checked, tooltip: 'this is the tooltip', accessibilityInformation: { label: 'a label', role: 'checkbox'}},
			children: []
		},
		{
			label: 'third',
			checked: vscode.TreeItemCheckboxState.Unchecked,
			children: []
		}
	]
};


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "checkboxapi" is now active!');

	const onDidChangeTreeDataEmitter= new vscode.EventEmitter<Element[]>();

	const treeDataProvider: vscode.TreeDataProvider<Element>= {
		onDidChangeTreeData: onDidChangeTreeDataEmitter.event,	

		getTreeItem: function (element: Element): vscode.TreeItem | Thenable<vscode.TreeItem> {
			return {
				label: element.label,
				checkboxState: element.checked,
				contextValue: element.checked !== undefined ? 'checkbox': '',
				collapsibleState: element.children.length? vscode.TreeItemCollapsibleState.Collapsed: vscode.TreeItemCollapsibleState.None
			};
		},
		resolveTreeItem(item: vscode.TreeItem, element: Element, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
			return item;
		},
		getChildren: function (parent?: Element): vscode.ProviderResult<Element[]> {
			if (!parent) {
				return [root];
			} else {
				return parent.children;
			}
		}
	};

	const treeView= vscode.window.createTreeView('checkboxapi:treeview', { 
		treeDataProvider: treeDataProvider,
		manageCheckboxStateManually: vscode.workspace.getConfiguration('checkboxapi').get('manageStateManually')
	});

	context.subscriptions.push(vscode.commands.registerCommand('checkboxapi:setChecked', (element: Element) => {
		element.checked= element.checked === vscode.TreeItemCheckboxState.Unchecked ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;
		onDidChangeTreeDataEmitter.fire([element]);
	}));

	context.subscriptions.push(treeView.onDidChangeCheckboxState(evt => {
		evt.items.forEach(([element, state]) => {
			element.checked= state;
		});
		console.log('checkbox state changed');
		console.log(JSON.stringify(evt.items));
	}));

	context.subscriptions.push(treeView);
}

// This method is called when your extension is deactivated
export function deactivate() {}
