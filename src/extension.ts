// src/extension.ts
import * as vscode from "vscode";

let decorationType: vscode.TextEditorDecorationType | undefined;
let decorations: vscode.DecorationOptions[] = [];

export function activate(context: vscode.ExtensionContext) {
  // 注册键盘快捷键命令
  let enhanceSKeyDisposable = vscode.commands.registerCommand(
    "extension.enhanceSKey",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      const position = editor.selection.active;
      const lineText = document.lineAt(position.line).text;

      // 定义需要高亮的字符模式，例如字母 'e'
      const regex = /e/g;
      let match;
      const decorations: vscode.DecorationOptions[] = [];

      while ((match = regex.exec(lineText)) !== null) {
        const startPos = new vscode.Position(position.line, match.index);
        const endPos = new vscode.Position(position.line, match.index + 1);
        const decoration = { range: new vscode.Range(startPos, endPos) };
        decorations.push(decoration);
      }

      // 定义高亮样式
      decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: "yellow",
        // 其他样式属性
      });

      // 应用高亮
      editor.setDecorations(decorationType, decorations);

      // 设置上下文标识高亮激活
      vscode.commands.executeCommand("setContext", "enhanceSKeyActive", true);
    }
  );

  // 注册移除高亮命令
  let removeHighlightDisposable = vscode.commands.registerCommand(
    "extension.removeEnhanceSKeyHighlight",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor && decorationType) {
        editor.setDecorations(decorationType, []);
        decorationType.dispose();
        decorationType = undefined;
        decorations = [];

        // 重置上下文标识
        vscode.commands.executeCommand(
          "setContext",
          "enhanceSKeyActive",
          false
        );
      }
    }
  );

  context.subscriptions.push(enhanceSKeyDisposable, removeHighlightDisposable);

  // 监听键盘事件
  vscode.window.onDidChangeTextEditorSelection(
    async (event) => {
      const editor = event.textEditor;
      const selection = editor.selection;
      const config = vscode.workspace.getConfiguration("vim");

      // 检查是否处于 Normal 模式
      const vimMode = config.get<string>("statusBarModeText");
      if (vimMode !== "Normal") {
        return;
      }

      // 获取最近的键盘输入
      // 注意：VSCode 扩展 API 不直接支持键盘事件监听，可能需要使用其他方法或扩展 VSCode-Vim 插件的功能
    },
    null,
    context.subscriptions
  );
}

export function deactivate() {
  if (decorationType) {
    decorationType.dispose();
  }
}
