// src/extension.ts
import * as vscode from "vscode";
import type { VimAPI, ISneakStartEvent, ISneakEndEvent } from "./types/vim";

let decorationType: vscode.TextEditorDecorationType | undefined;
let decorations: vscode.DecorationOptions[] = [];
let outputChannel: vscode.OutputChannel;
let highlightedLine: number | null = null;

export async function activate(context: vscode.ExtensionContext) {
  // 创建 Output Channel
  outputChannel = vscode.window.createOutputChannel("Vim Enhanced Output");
  outputChannel.appendLine("Vim Enhanced Extension Activated.");

  const vimExtension = vscode.extensions.getExtension<VimAPI>("vscodevim.vim");

  if (vimExtension) {
    if (!vimExtension.isActive) {
      await vimExtension.activate();
    }
    const api = vimExtension.exports;
    if (api && isVimAPI(api)) {
      // 订阅 SneakForward 事件
      subscribeToVimEvents(api, context);
    } else {
      outputChannel.appendLine("无法访问 Vim 扩展的 API。");
    }
  } else {
    outputChannel.appendLine("未找到 Vim 扩展。");
  }

  // 注册增强 S 键命令
  let enhanceSKeyDisposable = vscode.commands.registerCommand(
    "extension.enhanceSKey",
    () => {
      handleEnhanceSKey();
    }
  );

  // 注册移除高亮命令
  let removeHighlightDisposable = vscode.commands.registerCommand(
    "extension.removeEnhanceSKeyHighlight",
    () => {
      handleRemoveHighlight();
    }
  );

  // 监听光标位置变化
  let selectionChangeDisposable = vscode.window.onDidChangeTextEditorSelection(
    (event) => {
      handleSelectionChange(event);
    },
    null,
    context.subscriptions
  );

  context.subscriptions.push(
    enhanceSKeyDisposable,
    removeHighlightDisposable,
    selectionChangeDisposable
  );
}

function isVimAPI(api: any): api is VimAPI {
  return (
    typeof api.onSneakForwardStart === 'function' &&
    typeof api.onSneakForwardEnd === 'function'
  );
}

function handleEnhanceSKey() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    outputChannel.appendLine("No active editor found.");
    return;
  }

  const document = editor.document;
  const position = editor.selection.active;
  const lineNumber = position.line;
  const lineText = document.lineAt(lineNumber).text;

  outputChannel.appendLine(`Enhancing 's' key at line ${lineNumber + 1}.`);

  // 定义需要高亮的字符模式，例如字母 'e'
  const regex = /e/g;
  let match;
  decorations = [];

  while ((match = regex.exec(lineText)) !== null) {
    const startPos = new vscode.Position(lineNumber, match.index);
    const endPos = new vscode.Position(lineNumber, match.index + 1);
    const decoration = { range: new vscode.Range(startPos, endPos) };
    decorations.push(decoration);
    outputChannel.appendLine(`Found 'e' at position ${match.index}.`);
  }

  if (decorations.length === 0) {
    outputChannel.appendLine("No 'e' characters found to highlight.");
  } else {
    decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: "rgba(255, 255, 0, 0.3)", // 半透明黄色背景
      border: "1px solid yellow",
    });

    editor.setDecorations(decorationType, decorations);
    outputChannel.appendLine(
      `Highlighted ${decorations.length} 'e' characters.`
    );
    vscode.commands.executeCommand("setContext", "enhanceSKeyActive", true);
    highlightedLine = lineNumber;

    //触发Vim扩展的's'命令
    // triggerVimSCommand();
  }
}

function handleRemoveHighlight() {
  const editor = vscode.window.activeTextEditor;
  if (editor && decorationType) {
    editor.setDecorations(decorationType, []);
    decorationType.dispose();
    decorationType = undefined;
    decorations = [];
    highlightedLine = null;

    vscode.commands.executeCommand("setContext", "enhanceSKeyActive", false);
    outputChannel.appendLine("Removed 'e' character highlights.");
  } else {
    outputChannel.appendLine("No highlights to remove.");
  }
}

function handleSelectionChange(event: vscode.TextEditorSelectionChangeEvent) {
  const editor = event.textEditor;
  const currentLine = editor.selection.active.line;

  if (highlightedLine === null) {
    // 无高亮，无需处理
    return;
  }

  if (currentLine !== highlightedLine) {
    outputChannel.appendLine(
      `Cursor moved from line ${highlightedLine + 1} to line ${
        currentLine + 1
      }. Removing highlights.`
    );
    vscode.commands.executeCommand("extension.removeEnhanceSKeyHighlight");
  }
}

// function triggerVimSCommand() {
//   // 替换 'vim.remap.s' 为实际的 Vim 扩展 's' 命令名称
//   const vimSCommand = "vim.command.s"; // 请根据实际情况调整

//   vscode.commands.executeCommand(vimSCommand).then(
//     () => {
//       outputChannel.appendLine(`Triggered Vim command: ${vimSCommand}`);
//     },
//     (err) => {
//       outputChannel.appendLine(`Failed to trigger Vim command: ${vimSCommand}`);
//       outputChannel.appendLine(`Error: ${err}`);
//     }
//   );
// }

// ... existing code ...
function subscribeToVimEvents(api: VimAPI, context: vscode.ExtensionContext) {
  // 正确的实现
  const startDisposable = api.onSneakForwardStart((data: ISneakStartEvent) => {
    outputChannel.appendLine(
      `Sneak Forward Started with keys: ${data.keysPressed.join(", ")}`
    );
    handleEnhanceSKey();
  });

  const endDisposable = api.onSneakForwardEnd((data: ISneakEndEvent) => {
    outputChannel.appendLine(
      `Sneak Forward Ended at line: ${data.line}, searchString: "${data.searchString}"`
    );
    handleRemoveHighlight();
  });

  context.subscriptions.push(startDisposable, endDisposable);
}
// ... existing code ...

export function deactivate() {
  if (decorationType) {
    decorationType.dispose();
  }
  if (outputChannel) {
    outputChannel.appendLine("Vim Enhanced Extension Deactivated.");
    outputChannel.dispose();
  }
}
