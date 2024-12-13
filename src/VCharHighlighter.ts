import * as vscode from "vscode";
import {
  decorationConfig,
  relativeLineNumberAboveDecoration,
  relativeLineNumberBelowDecoration,
} from "./decoration";

//Add new decoration types for word index
const wordIndexDecoration = vscode.window.createTextEditorDecorationType({
  before: {
    contentText: "",
    color: "yellow",
    fontWeight: "bold",
  },
});

export interface WordWithIndex {
  word: string;
  startIndex: number;
}

export interface WordWithIndexWithCompareFunc extends WordWithIndex {
  compare: (charPos: number, cursorPos: number, actualPos: number) => boolean;
}

export interface LineWords {
  beforeCursor: WordWithIndexWithCompareFunc[];
  afterCursor: WordWithIndexWithCompareFunc[];
}

export class VCharHighlighter {
  private outputChannel: vscode.OutputChannel;

  private wordIndexDecorations: vscode.DecorationOptions[] = [];

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

  /**
   * 显示光标所在单词前后单词的序号
   * @param editor 当前活动的文本编辑器
   * @param cursorWord 当前光标所在的单词
   */

  showWordIndices(editor: vscode.TextEditor, cursorPos: number) {
    const line = editor.document.lineAt(editor.selection.active.line).text;
    const { beforeCursor, afterCursor } = this.getWordsWithIndexes(
      line,
      cursorPos
    );
    // const position = new vscode.Position(
    //   editor.selection.active.line,
    //   cursorPos
    // );
    // const wordRange = editor.document.getWordRangeAtPosition(position);
    // if (!wordRange) return;
    // const cursorWord = editor.document.getText(wordRange);
    // this.outputChannel.appendLine(`cursorWord: ${cursorWord}`);

    // const words = line.split(/[^A-Za-z0-9_]+/);
    // const formattedWords = words.join(", ");
    // this.outputChannel.appendLine(`Words in line: ${formattedWords}`);

    // // New logic to find the correct cursorIndex
    // let cursorIndex = -1;
    // let currentPos = 0;
    // for (let i = 0; i < words.length; i++) {
    //   const word = words[i];
    //   const start = line.indexOf(word, currentPos);
    //   if (
    //     word === cursorWord &&
    //     wordRange.start.character >= start &&
    //     wordRange.end.character <= start + word.length
    //   ) {
    //     cursorIndex = i;
    //     break;
    //   }
    //   currentPos = start + word.length;
    // }
    // this.outputChannel.appendLine(`cursorIndex: ${cursorIndex}`);
    // if (cursorIndex === -1) return;

    // //前面的单词
    // for (
    //   let i = cursorIndex - 1, count = 1;
    //   i >= 0 && count <= 3;
    //   i--, count++
    // ) {
    //   const word = words[i];
    //   const start = line.indexOf(word);
    //   this.wordIndexDecorations.push({
    //     range: new vscode.Range(
    //       editor.selection.active.line,
    //       start,
    //       editor.selection.active.line,
    //       start
    //     ),
    //     renderOptions: {
    //       before: {
    //         contentText: `${count}`,
    //         color: "green",
    //         fontWeight: "bold",
    //       },
    //     },
    //   });
    // }
  }
  // ...existing code...

  // ...existing code...

  /**
   * 清除单词序号高亮
   * @param editor 当前活动的文本编辑器
   */
  public clearWordIndices(editor: vscode.TextEditor) {
    editor.setDecorations(wordIndexDecoration, []);
    this.wordIndexDecorations = [];
  }

  private getWordsWithIndexes(text: string, cursorPos: number): LineWords {
    const result: LineWords = { beforeCursor: [], afterCursor: [] };

    const insertWord = (word: WordWithIndex) => {
      if (!isAlphabetic(word.word)) {
        return;
      }

      // 检查单词是否包含光标位置
      if (
        word.startIndex <= cursorPos &&
        word.startIndex + word.word.length >= cursorPos
      ) {
        const splitIndex = cursorPos - word.startIndex;
        this.outputChannel.appendLine(`splitIndex: ${splitIndex}`);
        const before = word.word.substring(0, splitIndex);
        const after = word.word.substring(splitIndex + 1);
        this.outputChannel.appendLine(`before: ${before}, after: ${after}`);

        if (before) {
          result.beforeCursor.push({
            word: before,
            startIndex: word.startIndex,
            compare: (charPos, cursorPosition, actualPos) =>
              charPos < cursorPosition && charPos >= actualPos,
          });

          this.outputChannel.appendLine(
            `before cursorPos: ${cursorPos}, beforeCursor word: '${before}' at index ${word.startIndex}`
          );
        }

        if (after) {
          result.afterCursor.push({
            word: after,
            startIndex: cursorPos + 1,
            compare: (charPos, cursorPosition, actualPos) =>
              charPos > cursorPosition && charPos < actualPos,
          });

          this.outputChannel.appendLine(
            `after cursorPos: ${cursorPos}, afterCursor word: '${after}' at index ${cursorPos}`
          );
        }
      }
      // 单词完全在光标之后
      else if (word.startIndex > cursorPos) {
        result.afterCursor.push({
          ...word,
          compare: (charPos, cursorPosition, actualPos) =>
            charPos > cursorPosition && charPos < actualPos,
        });

        this.outputChannel.appendLine(
          `afterCursor word: '${word.word}' at index ${word.startIndex}`
        );
      }
      // 单词完全在光标之前
      else if (word.startIndex + word.word.length <= cursorPos) {
        result.beforeCursor.push({
          ...word,
          compare: (charPos, cursorPosition, actualPos) =>
            charPos < cursorPosition && charPos >= actualPos,
        });

        this.outputChannel.appendLine(
          `beforeCursor word: '${word.word}' at index ${word.startIndex}`
        );
      }
    };

    const notWordRegex = /(\W)/gi;
    text
      .split(notWordRegex)
      .reduce<WordWithIndex[]>((prev, currWord, index) => {
        if (index === 0) {
          prev.push({ word: currWord, startIndex: 0 });
          insertWord({ word: currWord, startIndex: 0 });
          return prev;
        }
        const startIndex =
          prev[index - 1].startIndex + prev[index - 1].word.length;
        prev.push({ word: currWord, startIndex });
        insertWord({ word: currWord, startIndex });
        return prev;
      }, []);

    return result;
  }
}

const isAlphabetic = (str: string) => {
  const wordRegex = /\w/gi;
  return wordRegex.test(str);
};
