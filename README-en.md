# vscode-vim-enhanced

Please forgive my poor English 😀.
**vscode-vim-enhanced** is an enhanced extension for the VSCode Vim plugin, designed to:

1. Provide highlighting for Visual Studio Code's Vim plugin `find` and `sneak` operations to improve editing efficiency. This plugin does not affect the functionality of `find` and `sneak`, it only highlights characters.
2. Display relative line numbers when entering Visual Line and Visual Block modes to facilitate multi-line selection.

**Before installing this plugin, install Vim-api (a slightly modified version of the official Vim, which includes certain APIs necessary for this plugin).**

This plugin was inspired by [magdyamr542/vim-find-highlight: Quickly go to words with vim f command (VSCode extension)](https://github.com/magdyamr542/vim-find-highlight) and improved upon it.

**Find Operation Illustration:** Red indicates that pressing the character will directly jump to the corresponding position; green indicates that pressing the character will not directly jump to that position (multiple jumps are needed).
![find.gif](https://gitee.com/Tom89757/ImageHost/raw/main/obsidian/202412201654988.gif)

**Sneak Operation Illustration:** Red indicates that pressing the character will directly jump to the corresponding position; green indicates that pressing the character will not directly jump to that position (multiple jumps are needed).
![sneak.gif](https://gitee.com/Tom89757/ImageHost/raw/main/obsidian/202412201705636.gif)

**Selecting Multiple Lines in Visual Line Mode:**
![line.gif](https://gitee.com/Tom89757/ImageHost/raw/main/obsidian/202412201706224.gif)

**Selecting Multiple Lines in Visual Block Mode:**
![block.gif](https://gitee.com/Tom89757/ImageHost/raw/main/obsidian/202412201707768.gif)

**Show Output:**
![debug.gif](https://gitee.com/Tom89757/ImageHost/raw/main/obsidian/202412201716347.gif)

## Features

- **Enhanced f/F Key Navigation:** Quickly jump to specified positions by highlighting reachable characters during `find` operations.
- **Enhanced s/S Key Navigation:** Control jumping precision by highlighting two consecutive characters during `sneak` operations.
- **Display Relative Line Numbers when Entering Visual Line and Visual Block Modes:** Conveniently select multiple lines by highlighting relative line numbers.
- **Customizable Highlight Colors and Styles:** Adjust highlight colors, font weight, and whether to add underlines according to personal preferences.
- **Integrated Output Channel:** Output debug information during operations for easy development and debugging.

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions Marketplace and search for `vscode-vim-enhanced`.
3. Click the **Install** button to install.
4. Restart VS Code to activate the plugin.

## Configuration

The plugin provides multiple configuration options, allowing users to customize highlight colors, font weight, and underline styles.

```json
{
  "vscodeVimEnhanced.charPrimaryColor": "red", // Sets the primary highlight color for f/F/s/S keys; pressing the highlighted character once will jump.
  "vscodeVimEnhanced.charSecondaryColor": "green", // Sets the secondary highlight color for f/F/s/S keys; pressing the highlighted character multiple times is required to jump.
  "vscodeVimEnhanced.charFontWeight": "400", // Sets the font weight for highlighted f/F/s/S characters.
  "vscodeVimEnhanced.visualLineAbove": "#4e32cd", // Sets the color of relative line numbers above the cursor when entering Visual Line/Block mode.
  "vscodeVimEnhanced.visualLineBelow": "red" // Sets the color of relative line numbers below the cursor when entering Visual Line/Block mode.
}
```

You can adjust these settings in the `settings.json` file to suit your preferences.

## Contributing

Feel free to submit issues or contribute code. Please refer to the LICENSE for more information.

## License

This project is open-sourced under the Apache License 2.0.
