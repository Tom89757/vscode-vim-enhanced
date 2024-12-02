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

export class CharHighlighter implements ICharHighlighter {
  public getCharHighlightingAfterCursor(
    lineText: string,
    cursorPos: number
  ): CharColoring[] {
    const frequencyMap = this.getCharFrequencyMapAfterCusor(
      lineText,
      cursorPos
    );
    return this.getCharPosToColorAfterCursor(frequencyMap, lineText, cursorPos);
  }

  private getCharFrequencyMapAfterCusor(text: string, cursorPos: number) {
    const map: Map<string, CharPosition> = new Map();
    text.split("").forEach((char, index) => {
      //只统计光标之后的字符
      if (index > cursorPos) {
        if (map.has(char)) {
          map.set(char, { positions: [...map.get(char)!.positions, index] });
        } else {
          map.set(char, { positions: [index] });
        }
      }
    });
    return map;
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
      result.push(this.getCharColoring(frequencyMap, word, cursorPos));
    }
    return result.filter((w) => w.position !== -1);
  }

  private getWordsWithIndexes(text: string, cursorPos: number): LineWords {
    const result: LineWords = { beforeCursor: [], afterCursor: [] };

    const insertWord = (word: WordWithIndex) => {
      if (!isAlphabetic(word.word)) {
        return;
      }
      if (word.startIndex > cursorPos) {
        result.afterCursor.push({
          ...word,
          compare: (charPos, cursorPosition, actualPos) =>
            charPos > cursorPosition && charPos < actualPos,
        });
      } else if (word.startIndex + word.word.length < cursorPos) {
        result.beforeCursor.push({
          ...word,
          compare: (charPos, cursorPosition, actualPos) =>
            charPos < cursorPosition && charPos >= actualPos,
        });
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

  private getCharColoring(
    frequencyMap: Map<string, CharPosition>,
    word: WordWithIndexWithCompareFunc,
    cursorPos: number
  ): CharColoring {
    let minFreqForChar = Number.MAX_VALUE;
    let indexOfCharWithMinFreq = -1;

    for (const [index, char] of word.word.split("").entries()) {
      const mapHasChar = frequencyMap.has(char);
      const actualPos = word.startIndex + index;

      if (!mapHasChar) {
        return {
          position: actualPos,
          minTimesToReach: 1,
        }; //该字符可以用于到达该word（一次jump）
      }

      const positions = frequencyMap.get(char);
      const freq = positions!.positions.filter((p) =>
        word.compare(p, cursorPos, actualPos)
      ).length; //在光标之后该字符的所有出现

      if (freq <= 1) {
        return {
          position: actualPos,
          minTimesToReach: 1,
        };
      }

      //我们不能通过一次jump达到这个word，所以可能可以通过下一个字符来实现
      if (freq < minFreqForChar) {
        minFreqForChar = freq;
        indexOfCharWithMinFreq = actualPos;
      }
    }

    return {
      position: indexOfCharWithMinFreq,
      minTimesToReach: minFreqForChar,
    };
  }
}

const isAlphabetic = (str: string) => {
  const wordRegex = /\w/gi;
  return wordRegex.test(str);
};
