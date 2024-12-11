import * as vscode from "vscode";
import {
  CHAR_FONTWEIGHT,
  CHAR_PRIMARY_COLOR,
  CHAR_SECONDARY_COLOR,
} from "./constants";

let charDecoration: vscode.TextEditorDecorationType | undefined;
let charDecorationSecondColor: vscode.TextEditorDecorationType | undefined;

export const disposeCharDecoration = () => {
  charDecoration && charDecoration.dispose();
  charDecorationSecondColor && charDecorationSecondColor.dispose();
  charDecoration = undefined;
  charDecorationSecondColor = undefined;
};

export const getCharDecoration = (
  color: string,
  fontWeight: string,
  underline: boolean
): vscode.TextEditorDecorationType => {
  if (!charDecoration) {
    charDecoration = vscode.window.createTextEditorDecorationType({
      color,
      fontWeight: fontWeight,
      textDecoration: underline === true ? "underline" : undefined,
    });
  }

  return charDecoration;
};

export const getCharDecorationSecondColor = (
  color: string,
  fontWeight: string,
  underline: boolean
) => {
  if (!charDecorationSecondColor) {
    charDecorationSecondColor = vscode.window.createTextEditorDecorationType({
      color,
      fontWeight,
      textDecoration: underline === true ? "underline" : undefined,
    });
  }
  return charDecorationSecondColor;
};


// Define decoration types for relative line numbers above and below
export const relativeLineNumberAboveDecoration = vscode.window.createTextEditorDecorationType({
  after: {
    contentText: "",
    margin: "0 0 0 5px",
    // Additional styling if needed
  },
  isWholeLine: true,
});

export const relativeLineNumberBelowDecoration = vscode.window.createTextEditorDecorationType({
  after: {
    contentText: "",
    margin: "0 0 0 5px",
    // Additional styling if needed
  },
  isWholeLine: true,
});

export class DecorationConfig {
  public firstColor: string;
  public secondColor: string;
  public fontWeight: string;
  public underline: boolean;
  constructor() {
    this.firstColor = CHAR_PRIMARY_COLOR;
    this.secondColor = CHAR_SECONDARY_COLOR;
    this.fontWeight = CHAR_FONTWEIGHT;
    this.underline = true;
  }
}

export const updateDecorationConfig = () => {
  const settings = vscode.workspace.getConfiguration();
  const fontWeight = settings.get("vscodeVimEnhanced.charFontWeight");
  const primaryColor = settings.get("vscodeVimEnhanced.charPrimaryColor");
  const secondaryColor = settings.get("vscodeVimEnhanced.charSecondaryColor");
  const underline = settings.get("vscodeVimEnhanced.enableUnderline");
  decorationConfig.firstColor = primaryColor as string;
  decorationConfig.secondColor = secondaryColor as string;
  decorationConfig.fontWeight = fontWeight as string;
  decorationConfig.underline = underline as boolean;
};

export const decorationConfig = new DecorationConfig();
