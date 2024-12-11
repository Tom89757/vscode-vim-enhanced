import * as vscode from "vscode";

export interface ICharHighlighter {
  getCharHighlightingAfterCursor: (
    lineText: string,
    cursorPos: number
  ) => CharColoring[];
}

export interface CharColoring {
  position: number;
  minTimesToReach: number;
}

export interface CharPosition {
  positions: number[];
}

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

export class SCharHighlighter implements ICharHighlighter {
  private outputChannel: vscode.OutputChannel;
  private before: string = "";
  private after: string = "";

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  public getCharHighlightingAfterCursor(
    lineText: string,
    cursorPos: number
  ): CharColoring[] {
    const frequencyMap = this.getCharFrequencyMapAfterCursor(
      lineText,
      cursorPos
    );
    return this.getCharPosToColorAfterCursor(frequencyMap, lineText, cursorPos);
  }

  public getCharHighlightingBeforeCursor(
    lineText: string,
    cursorPos: number
  ): CharColoring[] {
    const frequencyMap = this.getCharFrequencyMapBeforeCursor(
      lineText,
      cursorPos
    );
    return this.getCharPosToColorBeforeCursor(
      frequencyMap,
      lineText,
      cursorPos
    );
  }

  private formatFrequencyMap(map: Map<string, CharPosition>): string {
    let formatted = "Character Frequency Map:\n";
    map.forEach((charPos, char) => {
      formatted += `Character: '${char}' -> Positions: [${charPos.positions.join(
        ", "
      )}]\n`;
    });
    return formatted;
  }

  private getCharFrequencyMapAfterCursor(
    text: string,
    cursorPos: number
  ): Map<string, CharPosition> {
    const map: Map<string, CharPosition> = new Map();

    // 遍历光标后所有字符，提取双字母组合
    for (let index = cursorPos; index < text.length - 1; index++) {
      const firstChar = text[index];
      const secondChar = text[index + 1];
      const bigram = firstChar + secondChar;

      if (map.has(bigram)) {
        map.set(bigram, { positions: [...map.get(bigram)!.positions, index] });
      } else {
        map.set(bigram, { positions: [index] });
      }
    }

    this.outputChannel.appendLine(this.formatFrequencyMap(map));
    return map;
  }

  private getCharFrequencyMapBeforeCursor(
    text: string,
    cursorPos: number
  ): Map<string, CharPosition> {
    const map: Map<string, CharPosition> = new Map();

    // 遍历光标前所有字符，提取双字母组合
    for (let index = 1; index < cursorPos; index++) {
      const firstChar = text[index - 1];
      const secondChar = text[index];
      const bigram = firstChar + secondChar;

      if (map.has(bigram)) {
        map.set(bigram, {
          positions: [...map.get(bigram)!.positions, index - 1],
        });
      } else {
        map.set(bigram, { positions: [index - 1] });
      }
    }

    this.outputChannel.appendLine(this.formatFrequencyMap(map));
    return map;
  }

  private formatCharColoringsAsMarkdown(charColorings: CharColoring[]): string {
    let table = `| Position | minTimesToReach |\n|----------|-----------------|\n`;
    charColorings.forEach((coloring) => {
      table += `| ${coloring.position} | ${coloring.minTimesToReach} |\n`;
    });
    return table;
  }

  private displayCharColorings(charColorings: CharColoring[]): void {
    const table = this.formatCharColoringsAsMarkdown(charColorings);
    this.outputChannel.appendLine(table);
  }

  private getCharPosToColorAfterCursor(
    frequencyMap: Map<string, CharPosition>,
    text: string,
    cursorPos: number
  ): CharColoring[] {
    //对于每个word选中需要被高亮的字符
    //只获取光标后的单词
    const { beforeCursor, afterCursor } = this.getWordsWithIndexes(
      text,
      cursorPos
    );

    if (afterCursor.length === 0) {
      return [];
    }

    const result: CharColoring[] = [];
    for (const word of afterCursor) {
      this.outputChannel.appendLine(
        `getCharColoring for ${word.word} in afterCursor`
      );
      result.push(
        this.getCharColoringAfterCursor(frequencyMap, word, cursorPos)
      );
    }

    this.outputChannel.appendLine(
      "getCharPosToColorAfterCursor: res after result.filter: "
    );
    let res = result.filter((w) => w.position !== -1);
    if (this.after.length > 1) {
      res = res.slice(1); //去除第一个元素，该元素为光标所在单词的光标后半截的高亮部分，不需要
    }
    this.displayCharColorings(res);
    return res;
  }

  private getCharPosToColorBeforeCursor(
    frequencyMap: Map<string, CharPosition>,
    text: string,
    cursorPos: number
  ): CharColoring[] {
    //对于每个word选中需要被高亮的字符
    //只获取光标后的单词
    const { beforeCursor, afterCursor } = this.getWordsWithIndexes(
      text,
      cursorPos
    );

    if (beforeCursor.length === 0) {
      return [];
    }

    const result: CharColoring[] = [];
    for (let i = beforeCursor.length - 1; i >= 0; i--) {
      //从后往前遍历
      const word = beforeCursor[i];
      this.outputChannel.appendLine(
        `getCharColoringBeforeCursor for ${word.word} in beforeCursor`
      );
      result.push(
        this.getCharColoringBeforeCursor(frequencyMap, word, cursorPos)
      );
    }

    this.outputChannel.appendLine(
      "getCharPosToColorAfterCursor: res after result.filter: "
    );
    let res = result.filter((w) => w.position !== -1);
    if (this.before.length > 1 && text[cursorPos] !== " ") {
      res = res.slice(1); //去除第一个元素，该元素为光标所在单词的光标后半截的高亮部分，不需要
    }
    this.displayCharColorings(res);
    return res;
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
        this.before = before;
        this.after = after;
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

  private getCharColoringAfterCursor(
    frequencyMap: Map<string, CharPosition>,
    word: WordWithIndexWithCompareFunc,
    cursorPos: number
  ): CharColoring {
    let minFreqForChar = Number.MAX_VALUE;
    let indexOfCharWithMinFreq = -1;

    const chars = word.word.split("");
    for (let index = 0; index < chars.length - 1; index++) {
      const pair = chars[index] + chars[index + 1];
      const actualPos = word.startIndex + index;
      const charPosition = frequencyMap.get(pair);
      if (charPosition) {
        const occurrence = charPosition.positions.indexOf(actualPos);
        if (occurrence !== -1) {
          if (occurrence + 1 < minFreqForChar) {
            minFreqForChar = occurrence + 1;
            indexOfCharWithMinFreq = actualPos;
          }
        }
      }
    }

    return {
      position: indexOfCharWithMinFreq,
      minTimesToReach: minFreqForChar <= 2 ? minFreqForChar : 2,
    };
  }

  private getCharColoringBeforeCursor(
    frequencyMap: Map<string, CharPosition>,
    word: WordWithIndexWithCompareFunc,
    cursorPos: number
  ): CharColoring {
    let minFreqForChar = Number.MAX_VALUE;
    let indexOfCharWithMinFreq = -1;

    const chars = word.word.split("");
    // for (let index = 0; index < chars.length - 1; index++) {
    for (let index = chars.length - 2; index >= 0; index--) {
      const pair = chars[index] + chars[index + 1];
      const actualPos = word.startIndex + index;
      const charPosition = frequencyMap.get(pair);
      if (charPosition) {
        const posIndex = charPosition.positions.indexOf(actualPos);
        if (posIndex !== -1) {
          const occurrence = charPosition.positions.length - posIndex - 1;
          if (occurrence + 1 < minFreqForChar) {
            minFreqForChar = occurrence + 1;
            indexOfCharWithMinFreq = actualPos;
          }
        }
      }
    }

    return {
      position: indexOfCharWithMinFreq,
      minTimesToReach: minFreqForChar <= 2 ? minFreqForChar : 2,
    };
  }
}

const isAlphabetic = (str: string) => {
  const wordRegex = /\w/gi;
  return wordRegex.test(str);
};
