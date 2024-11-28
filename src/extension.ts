// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // 注册命令
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-vim-enhanced.enhancedSneak", () => {
      handleSneak("s");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-vim-enhanced.enhancedFind", () => {
      handleFind("f");
    })
  );

  // 监听光标变化，清除装饰
  vscode.window.onDidChangeTextEditorSelection(() => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.setDecorations(highlightDecorationType, []);
    }
  });
}

// 假设 handleSneak 函数在同一文件中定义
function handleSneak(key: string) {
  // 执行原有的 's' 功能
  vscode.commands.executeCommand("vim.s");

  // 获取当前活动的编辑器
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const line = editor.selection.active.line;
    const text = editor.document.lineAt(line).text;
    const decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: "rgba(255,255,0,0.5)", // 黄色高亮
    });

    // 定义要高亮的字符，例如所有 'a' 字符
    const decorationOptions: vscode.DecorationOptions[] = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "a") {
        // 修改为您需要高亮的字符
        decorationOptions.push({
          range: new vscode.Range(line, i, line, i + 1),
        });
      }
    }

    // 应用装饰
    editor.setDecorations(decorationType, decorationOptions);
  }
}

function handleFind(command: "f") {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const position = editor.selection.active;
    const line = document.lineAt(position.line).text;

    // 示例：高亮所有 'e' 字符
    const decorationOptions: vscode.DecorationOptions[] = [];
    for (let i = 0; i < line.length; i++) {
      if (line[i].toLowerCase() === "e") {
        const range = new vscode.Range(position.line, i, position.line, i + 1);
        decorationOptions.push({ range });
      }
    }

    editor.setDecorations(highlightDecorationType, decorationOptions);
  }
}

const highlightDecorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: "rgba(255, 255, 0, 0.3)", // 半透明黄色背景
  border: "1px solid yellow",
});

// This method is called when your extension is deactivated
export function deactivate() {}
