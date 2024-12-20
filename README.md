# vscode-vim-enhanced

**vscode-vim-enhanced** 是一个用于增强 VSCode Vim 的插件，旨在：

1. 为  VSCode Vim 插件的 `find` 和 `sneak` 操作提供高亮功能，提升编辑效率。该插件不影响 `find` 和 `sneak` 的功能，仅对字符进行高亮操作。
2. 在进入 Visual Line 和 Visual Block 模式时显示相对行号，方便选中多行。

**在安装本插件之前，先安装 Vim-api (在官方 Vim 上微改而来，其中添加了本插件必须的某些 api)**

该插件受到[magdyamr542/vim-find-highlight: Quickly go to words with vim f command (VSCode extension)](https://github.com/magdyamr542/vim-find-highlight)的启发，并在其基础上改进得到。

**find 操作示意：** 红色表示按下该字符后可以直接跳转到对应位置，绿色表示不能直接跳转到该位置（需要多次才能跳转到该位置）
![find.gif](https://gitee.com/Tom89757/ImageHost/raw/main/obsidian/202412201654988.gif)

**sneak 操作示意：** 红色表示按下该字符后可以直接跳转到对应位置，绿色表示不能直接跳转到该位置（需要多次才能跳转到该位置）
![sneak.gif](https://gitee.com/Tom89757/ImageHost/raw/main/obsidian/202412201705636.gif)

**Visual Line 模式选中多行：**
![line.gif](https://gitee.com/Tom89757/ImageHost/raw/main/obsidian/202412201706224.gif)

**Visual Block 模式选中多行：**
![block.gif](https://gitee.com/Tom89757/ImageHost/raw/main/obsidian/202412201707768.gif)

**展示插件的运行时输出：**
![debug.gif](https://gitee.com/Tom89757/ImageHost/raw/main/obsidian/202412201716347.gif)

## 功能

- **增强的 f/F 键导航**：通过高亮 `find` 操作的可达字符，快速跳转到指定位置。按下 f 键会高亮光标后面单词中的字符，按下 F 键会高亮光标前面单词中的字符
- **增强的 s/S 键导航**：通过高亮 `sneak` 操作的连续两个字符，支持更精准的跳转控制。按下 s 键会高亮光标后面单词中的字符，按下 S 键会高亮光标前面单词中的字符
- **进入 Visual Line 和 Visual Block 模式时显示相对行号**：通过高亮显示相对行号，可以更方便地选中多行。
- **自定义高亮颜色和样式**：根据个人喜好调整高亮颜色、字体粗细和是否添加下划线。
- **集成输出通道**：在操作过程中输出调试信息，方便开发和调试。

## 安装

1. 打开 Visual Studio Code。
2. 前往扩展市场，搜索 `vscode-vim-enhanced`。
3. 点击 **安装** 按钮进行安装。
4. 重启 VS Code 以激活插件。

## 配置说明

插件提供多种配置选项，允许用户自定义高亮颜色、字体粗细和下划线样式。

```json
{
  "vscodeVimEnhanced.charPrimaryColor": "red", // 设置f/F/s/S的第一高亮颜色，该颜色的高亮字符按下一次即可跳转
  "vscodeVimEnhanced.charSecondaryColor": "green", // 设置f/F/s/S的第二高亮颜色，该颜色的高亮字符需要按下多次才能跳转
  "vscodeVimEnhanced.charFontWeight": "400", // 设置f/F/s/S的高亮字符粗细
  "vscodeVimEnhanced.visualLineAbove": "#4e32cd", // 设置进入Visual Line/Block模式后光标上面行相对行号的颜色
  "vscodeVimEnhanced.visualLineBelow": "red" // 设置进入Visual Line/Block模式后光标下面行相对行号的颜色
}

```

您可以在 settings.json 文件中调整这些设置，以适应您的编辑需求。

## 贡献

欢迎提交问题或贡献代码。请参考 LICENSE 了解更多信息。

## 许可证

该项目基于 Apache License 2.0 许可证开源。
