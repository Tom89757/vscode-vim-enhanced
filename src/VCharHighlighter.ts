import * as vscode from "vscode";
import {
  decorationConfig,
  relativeLineNumberAboveDecoration,
  relativeLineNumberBelowDecoration,
} from "./decoration";

export class VCharHighlighter {
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  showRelativeLineNumbers(
    editor: vscode.TextEditor,
    cursorLine: number,
    DecorationConfig: any
  ) {
    const decorationsAbove: vscode.DecorationOptions[] = [];
    const decorationsBelow: vscode.DecorationOptions[] = [];
    const totalLines = editor.document.lineCount;

    this.outputChannel.appendLine(
      `showRelativeLineNumbers currentLine: ${cursorLine}`
    );

    // Lines above - 从当前行到文档开头
    for (let lineNumber = cursorLine - 1; lineNumber >= 0; lineNumber--) {
      const relativeLineNumber = cursorLine - lineNumber;
      const line = editor.document.lineAt(lineNumber);
      decorationsAbove.push({
        range: new vscode.Range(lineNumber, 0, lineNumber, 0),
        renderOptions: {
          before: {
            contentText: `${relativeLineNumber}`,
            color: decorationConfig.visualLineAbove,
            fontWeight: "bold",
          },
        },
      });
    }

    // Lines below - 从当前行到文档结尾
    for (
      let lineNumber = cursorLine + 1;
      lineNumber < totalLines;
      lineNumber++
    ) {
      const relativeLineNumber = lineNumber - cursorLine;
      const line = editor.document.lineAt(lineNumber);
      decorationsBelow.push({
        range: new vscode.Range(lineNumber, 0, lineNumber, 0),
        renderOptions: {
          before: {
            contentText: `${relativeLineNumber}`,
            color: decorationConfig.visualLineBelow,
            fontWeight: "bold",
          },
        },
      });
    }

    editor.setDecorations(relativeLineNumberAboveDecoration, decorationsAbove);
    editor.setDecorations(relativeLineNumberBelowDecoration, decorationsBelow);
  }

  /**
   * 清除 showRelativeLineNumbers 中设置的相对行号高亮
   * @param editor 当前活动的文本编辑器
   */
  private removeRelativeLineNumbers(editor: vscode.TextEditor) {
    this.outputChannel.appendLine("Removing relative line numbers.");

    // 清除上方的相对行号装饰
    editor.setDecorations(relativeLineNumberAboveDecoration, []);
    this.outputChannel.appendLine("Cleared relativeLineNumberAboveDecoration.");

    // 清除下方的相对行号装饰
    editor.setDecorations(relativeLineNumberBelowDecoration, []);
    this.outputChannel.appendLine("Cleared relativeLineNumberBelowDecoration.");
  }

  /**
   * 调用 removeRelativeLineNumbers 的公共方法，用于外部调用
   * @param editor 当前活动的文本编辑器
   */
  public clearRelativeLineNumbers(editor: vscode.TextEditor) {
    this.removeRelativeLineNumbers(editor);
  }
}
