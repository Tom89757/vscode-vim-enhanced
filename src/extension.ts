// src/extension.ts
import * as vscode from "vscode";
import type {
  VimAPI,
  ISneakStartEvent,
  ISneakEndEvent,
  IFindStartEvent,
  IFindEndEvent,
} from "./types/vim";

import { FCharHighlighter } from "./FCharHighlighter";
import {
  decorationConfig,
  disposeCharDecoration,
  updateDecorationConfig,
} from "./decoration";
import { colorChars, getCurrentLine, getCursorPos } from "./utils";

let decorationTypeS: vscode.TextEditorDecorationType | undefined;
let decorationsS: vscode.DecorationOptions[] = [];
let highlightedLineS: number | null = null;

let highlightedLineF: number | null = null;

let outputChannel: vscode.OutputChannel;
let fCharHighlighter: FCharHighlighter; // 声明 FCharHighlighter 实例

export async function activate(context: vscode.ExtensionContext) {
  // 创建 Output Channel
  outputChannel = vscode.window.createOutputChannel("Vim Enhanced Output");
  outputChannel.appendLine("Vim Enhanced Extension Activated.");

  // 创建 FCharHighlighter 实例并传递 outputChannel
  fCharHighlighter = new FCharHighlighter(outputChannel);

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
    "vscodeVimEnhanced.enhanceSKey",
    () => {
      handleEnhanceSKey();
    }
  );

  // 注册增强 F 键命令
  let enhanceFKeyDisposable = vscode.commands.registerCommand(
    "vscodeVimEnhanced.enhanceFKey",
    () => {
      handleEnhanceFKey();
    }
  );

  // 注册移除高亮命令
  let removeSHighlightDisposable = vscode.commands.registerCommand(
    "vscodeVimEnhanced.removeEnhanceSKeyHighlight",
    () => {
      handleRemoveSHighlight();
    }
  );

  let removeFHighlightDisposable = vscode.commands.registerCommand(
    "vscodeVimEnhanced.removeEnhanceFKeyHighlight",
    () => {
      handleRemoveFHighlight();
    }
  );

  // 监听光标位置变化
  let selectionChangeDisposable = vscode.window.onDidChangeTextEditorSelection(
    (event) => {
      handleSelectionSChange(event);
      handleSelectionFChange(event);
    },
    null,
    context.subscriptions
  );

  context.subscriptions.push(
    enhanceSKeyDisposable,
    enhanceFKeyDisposable,
    removeSHighlightDisposable,
    removeFHighlightDisposable,
    selectionChangeDisposable
  );
}

function isVimAPI(api: any): api is VimAPI {
  return (
    api &&
    typeof api.onSneakForwardStart === "function" &&
    typeof api.onSneakForwardEnd === "function" &&
    typeof api.onFindForwardStart === "function" &&
    typeof api.onFindForwardEnd === "function"
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
  decorationsS = [];

  while ((match = regex.exec(lineText)) !== null) {
    const startPos = new vscode.Position(lineNumber, match.index);
    const endPos = new vscode.Position(lineNumber, match.index + 1);
    const decoration = { range: new vscode.Range(startPos, endPos) };
    decorationsS.push(decoration);
    outputChannel.appendLine(`Found 'e' at position ${match.index}.`);
  }

  if (decorationsS.length === 0) {
    outputChannel.appendLine("No 'e' characters found to highlight.");
  } else {
    decorationTypeS = vscode.window.createTextEditorDecorationType({
      backgroundColor: "rgba(255, 255, 0, 0.3)", // 半透明黄色背景
      border: "1px solid yellow",
    });

    editor.setDecorations(decorationTypeS, decorationsS);
    outputChannel.appendLine(
      `Highlighted ${decorationsS.length} 'e' characters.`
    );
    vscode.commands.executeCommand("setContext", "enhanceSKeyActive", true);
    highlightedLineS = lineNumber;
  }
}

function handleEnhanceFKey() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    outputChannel.appendLine("No active editor found.");
    return;
  }

  const position = editor.selection.active;
  const lineNumber = position.line;
  highlightedLineF = lineNumber;

  //高亮目标字符
  const line = getCurrentLine();
  const cursorPos = getCursorPos();
  if (line?.text.length && cursorPos != undefined) {
    mainF(cursorPos, line.text);
  } else {
    outputChannel.appendLine("disposeCharDecoration() in handleEnhanceFKey()");
    disposeCharDecoration();
  }
}

const mainF = (cursorPos: number, currentLine: string) => {
  const toColor = fCharHighlighter.getCharHighlightingAfterCursor(
    currentLine,
    cursorPos
  );

  // 输出 decorationConfig 的内容到 outputChannel
  outputChannel.appendLine(
    `decorationConfig: ${JSON.stringify(decorationConfig)}`
  );

  colorChars(toColor, decorationConfig);
};

function handleRemoveSHighlight() {
  const editor = vscode.window.activeTextEditor;
  if (editor && decorationTypeS) {
    editor.setDecorations(decorationTypeS, []);
    decorationTypeS.dispose();
    decorationTypeS = undefined;
    decorationsS = [];
    highlightedLineS = null;

    vscode.commands.executeCommand("setContext", "enhanceSKeyActive", false);
    outputChannel.appendLine("Removed 'e' character highlights.");
  } else {
    outputChannel.appendLine("No char 'e' highlights to remove.");
  }
}

function handleRemoveFHighlight() {
  //去除f按键高亮
  disposeCharDecoration();
}

function handleSelectionSChange(event: vscode.TextEditorSelectionChangeEvent) {
  if (highlightedLineS === null) {
    // 无高亮，无需处理
    return;
  }

  if (highlightedLineS !== null) {
    setTimeout(() => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const actualCurrentLine = editor.selection.active.line;

      if (highlightedLineS !== null && highlightedLineS !== actualCurrentLine) {
        outputChannel.appendLine(
          `Cursor moved from line ${highlightedLineS + 1} to line ${
            actualCurrentLine + 1
          }. Removing Sneak highlights.`
        );
        vscode.commands.executeCommand(
          "vscodeVimEnhanced.removeEnhanceSKeyHighlight"
        );
      }
    }, 0);

    return;
  }
}

function handleSelectionFChange(event: vscode.TextEditorSelectionChangeEvent) {
  if (highlightedLineF === null) {
    // 无高亮，无需处理
    return;
  }

  if (highlightedLineF !== null) {
    setTimeout(() => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const actualCurrentLine = editor.selection.active.line;

      if (highlightedLineF !== null && highlightedLineF !== actualCurrentLine) {
        // outputChannel.appendLine(
        //   `Cursor moved from line ${highlightedLineF + 1} to line ${
        //     actualCurrentLine + 1
        //   }. Removing Find highlights.`
        // );
        vscode.commands.executeCommand(
          "vscodeVimEnhanced.removeEnhanceFKeyHighlight"
        );
      }
    }, 0);

    return;
  }
}

// ... existing code ...
function subscribeToVimEvents(api: VimAPI, context: vscode.ExtensionContext) {
  // 订阅SneakForward事件
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
    handleRemoveSHighlight();
  });

  // 订阅FindForward事件
  const findStartDisposable = api.onFindForwardStart(
    (data: IFindStartEvent) => {
      outputChannel.appendLine(
        `Find Forward Started with keys: ${data.keysPressed.join(", ")}`
      );
      handleEnhanceFKey();
    }
  );

  const findEndDisposable = api.onFindForwardEnd((data: IFindEndEvent) => {
    outputChannel.appendLine(
      `Find Forward Ended at line: ${data.position.line}, searchString: "${data.searchChar}"`
    );
    handleRemoveFHighlight();
  });

  context.subscriptions.push(
    startDisposable,
    endDisposable,
    findStartDisposable,
    findEndDisposable
  );
}
// ... existing code ...

export function deactivate() {
  if (outputChannel) {
    outputChannel.appendLine("Vim Enhanced Extension Deactivated.");
    outputChannel.dispose();
  }
}
