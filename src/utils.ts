import * as vscode from "vscode";

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
