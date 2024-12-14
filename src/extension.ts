// src/extension.ts
import * as vscode from "vscode";
import type {
  VimAPI,
  ISneakStartEvent,
  ISneakEndEvent,
  IFindStartEvent,
  IFindEndEvent,
  Mode,
} from "./types/vim";

import { FCharHighlighter } from "./FCharHighlighter";
import { SCharHighlighter } from "./SCharHighlighter";
import { VCharHighlighter } from "./VCharHighlighter";
import {
  decorationConfig,
  disposeCharDecoration,
  updateDecorationConfig,
} from "./decoration";
import { colorChars, colorSChars, getCurrentLine, getCursorPos } from "./utils";

let highlightedLineS: number | null = null;
let highlightedLineF: number | null = null;
let currLine: number | null = null;
let isRelativeLineNumbersShown = false;

let outputChannel: vscode.OutputChannel;
let fCharHighlighter: FCharHighlighter; // 声明 FCharHighlighter 实例
let sCharHighlighter: SCharHighlighter; // 声明 sCharHighlighter 实例
let vCharHighlighter: VCharHighlighter; // 声明 vCharHighlighter 实例

export async function activate(context: vscode.ExtensionContext) {
  // 创建 Output Channel
  outputChannel = vscode.window.createOutputChannel("Vim Enhanced Output");
  outputChannel.appendLine("Vim Enhanced Extension Activated.");

  // 创建 FCharHighlighter 实例并传递 outputChannel
  fCharHighlighter = new FCharHighlighter(outputChannel);
  sCharHighlighter = new SCharHighlighter(outputChannel);
  vCharHighlighter = new VCharHighlighter(outputChannel);

  const vimExtension = vscode.extensions.getExtension<VimAPI>("vscodevim.vim");

  if (vimExtension) {
    if (!vimExtension.isActive) {
      await vimExtension.activate();
    }
    const api = vimExtension.exports;
    if (api && isVimAPI(api)) {
      subscribeToVimEvents(api, context);
    } else {
      outputChannel.appendLine("无法访问 Vim 扩展的 API。");
    }
  } else {
    outputChannel.appendLine("未找到 Vim 扩展。");
  }

  // 监听光标位置变化
  let selectionChangeDisposable = vscode.window.onDidChangeTextEditorSelection(
    (event) => {
      handleSelectionSChange(event);
      handleSelectionFChange(event);
      handleChangeLine(event);
    },
    null,
    context.subscriptions
  );

  // 监听配置变化
  let configurationChangeDisposable = vscode.workspace.onDidChangeConfiguration(
    (e) => {
      const configChanged =
        e.affectsConfiguration("vscodeVimEnhanced.charPrimaryColor") ||
        e.affectsConfiguration("vscodeVimEnhanced.charSecondaryColor") ||
        e.affectsConfiguration("vscodeVimEnhanced.charFontWeight") ||
        e.affectsConfiguration("vscodeVimEnhanced.enableUnderline") ||
        e.affectsConfiguration("vscodeVimEnhanced.visualLineAbove") ||
        e.affectsConfiguration("vscodeVimEnhanced.visualLineBelow");

      if (configChanged) {
        configureDecoration();
      }
    }
  );

  //注册切换相对行号的命令
  let toggleShowRelativeLineNumberDisposable = vscode.commands.registerCommand(
    "vscodeVimEnhanced.toggleShowRelativeLineNumber",
    () => {
      toggleShowRelativeLineNumber();
    }
  );

  configureDecoration();

  context.subscriptions.push(
    selectionChangeDisposable,
    configurationChangeDisposable,
    toggleShowRelativeLineNumberDisposable
  );
}

const configureDecoration = () => {
  updateDecorationConfig();
  disposeCharDecoration();
};

function isVimAPI(api: any): api is VimAPI {
  return (
    api &&
    typeof api.onSneakForwardStart === "function" &&
    typeof api.onSneakForwardEnd === "function" &&
    typeof api.onSneakBackwardStart === "function" &&
    typeof api.onSneakBackwardEnd === "function" &&
    typeof api.onFindForwardStart === "function" &&
    typeof api.onFindForwardEnd === "function" &&
    typeof api.onFindBackwardStart === "function" &&
    typeof api.onFindBackwardEnd === "function" &&
    typeof api.onModeChanged === "function"
  );
}

function handleEnhanceSKey() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    outputChannel.appendLine("No active editor found.");
    return;
  }

  const position = editor.selection.active;
  const lineNumber = position.line;

  outputChannel.appendLine(`Sneak Forward at line ${lineNumber + 1}.`);

  highlightedLineS = lineNumber;

  //高亮目标字符
  const line = getCurrentLine();
  const cursorPos = getCursorPos();
  if (line?.text.length && cursorPos != undefined) {
    mainS(cursorPos, line.text);
  } else {
    outputChannel.appendLine("disposeCharDecoration() in handleEnhanceFKey()");
    disposeCharDecoration();
  }
}

function handleEnhanceBackSKey() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    outputChannel.appendLine("No active editor found.");
    return;
  }

  const position = editor.selection.active;
  const lineNumber = position.line;

  outputChannel.appendLine(`Sneak Backward at line ${lineNumber + 1}.`);

  highlightedLineS = lineNumber;

  //高亮目标字符
  const line = getCurrentLine();
  const cursorPos = getCursorPos();
  if (line?.text.length && cursorPos != undefined) {
    mainBackS(cursorPos, line.text);
  } else {
    outputChannel.appendLine("disposeCharDecoration() in handleEnhanceFKey()");
    disposeCharDecoration();
  }
}

const mainS = (cursorPos: number, currentLine: string) => {
  const toColor = sCharHighlighter.getCharHighlightingAfterCursor(
    currentLine,
    cursorPos
  );

  // 输出 decorationConfig 的内容到 outputChannel
  outputChannel.appendLine(
    `decorationConfig for SneakForward: ${JSON.stringify(decorationConfig)}`
  );

  colorSChars(toColor, decorationConfig);
};

const mainBackS = (cursorPos: number, currentLine: string) => {
  const toColor = sCharHighlighter.getCharHighlightingBeforeCursor(
    currentLine,
    cursorPos
  );

  // 输出 decorationConfig 的内容到 outputChannel
  outputChannel.appendLine(
    `decorationConfig for SneakBackward: ${JSON.stringify(decorationConfig)}`
  );

  colorSChars(toColor, decorationConfig);
};

function handleEnhanceFKey() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    outputChannel.appendLine("No active editor found.");
    return;
  }

  const position = editor.selection.active;
  const lineNumber = position.line;

  outputChannel.appendLine(`Find Forward at line ${lineNumber + 1}.`);
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

function handleEnhanceBackFKey() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    outputChannel.appendLine("No active editor found.");
    return;
  }

  const position = editor.selection.active;
  const lineNumber = position.line;

  outputChannel.appendLine(`Find Backward at line ${lineNumber + 1}.`);
  highlightedLineF = lineNumber;

  //高亮目标字符
  const line = getCurrentLine();
  const cursorPos = getCursorPos();
  if (line?.text.length && cursorPos != undefined) {
    mainBackF(cursorPos, line.text);
  } else {
    outputChannel.appendLine(
      "disposeCharDecoration() in handleEnhanceBackFKey()"
    );
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
    `decorationConfig for FindForward: ${JSON.stringify(decorationConfig)}`
  );

  colorChars(toColor, decorationConfig);
};

const mainBackF = (cursorPos: number, currentLine: string) => {
  const toColor = fCharHighlighter.getCharHighlightingBeforeCursor(
    currentLine,
    cursorPos
  );

  // 输出 decorationConfig 的内容到 outputChannel
  outputChannel.appendLine(
    `decorationConfig for FindBackward: ${JSON.stringify(decorationConfig)}`
  );

  colorChars(toColor, decorationConfig);
};

function handleRemoveSHighlight() {
  //去除s/S按键高亮
  disposeCharDecoration();
}

function handleRemoveFHighlight() {
  //去除f/F按键高亮
  disposeCharDecoration();
}

function handleChangeLine(event: vscode.TextEditorSelectionChangeEvent) {
  if (currLine === null) {
    //无高亮，无需处理
    return;
  }
  if (currLine !== null) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const actualCurrentLine = editor.selection.active.line;

    if (
      currLine !== null &&
      currLine !== actualCurrentLine &&
      isRelativeLineNumbersShown
    ) {
      vscode.commands.executeCommand(
        "vscodeVimEnhanced.toggleShowRelativeLineNumber"
      );
    }
  }
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
        handleRemoveSHighlight();
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
  const sneakStartDisposable = api.onSneakForwardStart(
    (data: ISneakStartEvent) => {
      outputChannel.appendLine(
        `Sneak Forward Started with keys: ${data.keysPressed.join(", ")}`
      );
      handleEnhanceSKey();
    }
  );

  const sneakEndDisposable = api.onSneakForwardEnd((data: ISneakEndEvent) => {
    outputChannel.appendLine(
      `Sneak Forward Ended at line: ${data.line}, searchString: "${data.searchString}"`
    );
    handleRemoveSHighlight();
  });

  // 订阅SneakBackward事件
  const sneakBackwardStartDisposable = api.onSneakBackwardStart(
    (data: ISneakStartEvent) => {
      outputChannel.appendLine(
        `Sneak Backward Started with keys: ${data.keysPressed.join(", ")}`
      );
      handleEnhanceBackSKey();
    }
  );

  const sneakBackwardEndDisposable = api.onSneakBackwardEnd(
    (data: ISneakEndEvent) => {
      outputChannel.appendLine(
        `Sneak Backward Ended at line: ${data.line}, searchString: "${data.searchString}"`
      );
      handleRemoveSHighlight();
    }
  );

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

  // 订阅FindBackward事件
  const findBackwardStartDisposable = api.onFindBackwardStart(
    (data: IFindStartEvent) => {
      outputChannel.appendLine(
        `Find Backward Started with keys: ${data.keysPressed.join(", ")}`
      );
      handleEnhanceBackFKey();
    }
  );

  const findBackwardEndDisposable = api.onFindBackwardEnd(
    (data: IFindEndEvent) => {
      outputChannel.appendLine(
        `Find Backward Ended at line: ${data.position.line}, searchString: "${data.searchChar}"`
      );
      handleRemoveFHighlight();
    }
  );

  const onModeChangedDisposable = api.onModeChanged((data: Mode) => {
    outputChannel.appendLine(`Current Mode: ${data}`);
    const editor = vscode.window.activeTextEditor;
    if (data === 4 || data === 3) {
      if (editor && !isRelativeLineNumbersShown) {
        outputChannel.appendLine("show relative line numbers.");
        vCharHighlighter.showRelativeLineNumbers(
          editor,
          editor.selection.active.line,
          decorationConfig
        );
      } else {
        outputChannel.appendLine("No active editor found.");
      }
    } else {
      outputChannel.appendLine(
        "remove relative line numbers and word indices."
      );
      if (editor && isRelativeLineNumbersShown) {
        vCharHighlighter.clearRelativeLineNumbers(editor);
      } else {
        outputChannel.appendLine("No active editor found.");
      }
    }
    isRelativeLineNumbersShown = !isRelativeLineNumbersShown;
  });

  context.subscriptions.push(
    sneakStartDisposable,
    sneakEndDisposable,
    sneakBackwardStartDisposable,
    sneakBackwardEndDisposable,
    findStartDisposable,
    findEndDisposable,
    findBackwardStartDisposable,
    findBackwardEndDisposable,
    onModeChangedDisposable
  );
}
// ... existing code ...

export function deactivate() {
  if (outputChannel) {
    outputChannel.appendLine("Vim Enhanced Extension Deactivated.");
    outputChannel.dispose();
  }
}
function toggleShowRelativeLineNumber() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const position = editor.selection.active;
  const lineNumber = position.line;
  currLine = lineNumber;

  if (isRelativeLineNumbersShown) {
    vCharHighlighter.clearRelativeLineNumbers(editor);
  } else {
    vCharHighlighter.showRelativeLineNumbers(
      editor,
      editor.selection.active.line,
      decorationConfig
    );
  }
  isRelativeLineNumbersShown = !isRelativeLineNumbersShown;
}
