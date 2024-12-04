import * as vscode from "vscode";
import { CharColoring } from "./FCharHighighlighter";
import {
  DecorationConfig,
  getCharDecoration,
  getCharDecorationSecondColor,
} from "./decoration";

export const getCurrentLine = () => {
  const activeEditor = getActiveEditor();
  const res = activeEditor?.document.lineAt(
    activeEditor?.selection.active.line
  );
  return res;
};

export const getActiveEditor = () => {
  return vscode.window.activeTextEditor;
};

export const getCursorPos = () => {
  return getActiveEditor()?.selection.active.character;
};

export const colorChars = (
  toColor: CharColoring[],
  decorationConfig: DecorationConfig
) => {
  const editor = getActiveEditor();
  if (!editor) {
    return;
  }
  const firstColorDecorations: vscode.DecorationOptions[] = [];
  const secondColorDecorations: vscode.DecorationOptions[] = [];

  const createPosition = (line: number, char: number) =>
    new vscode.Position(line, char);

  const line = getCurrentLine();
  if (!line) {
    return;
  }

  for (const word of toColor) {
    const startPos = createPosition(line.lineNumber, word.position);
    const endPos = createPosition(line.lineNumber, word.position + 1);


  }
};

export const colorChars2 = (
  toColor: CharColoring[],
  decorationConfig: DecorationConfig
) => {
  const editor = getActiveEditor();
  if (!editor) {
    return;
  }

  const firstColorDecorations: vscode.DecorationOptions[] = [];
  const secondColorDecorations: vscode.DecorationOptions[] = [];

  const createPosition = (line: number, char: number) =>
    new vscode.Position(line, char);

  const line = getCurrentLine();
  if (!line) {
    return;
  }

  for (const charInfo of toColor) {
    const startPos = createPosition(line.lineNumber, charInfo.position);
    const endPos = createPosition(line.lineNumber, charInfo.position + 1);
    const decoration = { range: new vscode.Range(startPos, endPos) };
    
    // Apply first color decorations
    firstColorDecorations.push(decoration);

    // If needed, apply second color based on some condition
    // For example:
    if (charInfo.minTimesToReach > 1) {
      secondColorDecorations.push(decoration);
    }
  }

  // Apply first color decorations
  editor.setDecorations(
    getCharDecoration(
      decorationConfig.firstColor,
      decorationConfig.fontWeight,
      decorationConfig.underline
    ),
    firstColorDecorations
  );

  // Apply second color decorations
  editor.setDecorations(
    getCharDecorationSecondColor(
      decorationConfig.secondColor,
      decorationConfig.fontWeight,
      decorationConfig.underline
    ),
    secondColorDecorations
  );
};
