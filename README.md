# vscode-vim-enhanced

**vscode-vim-enhanced** 是一个增强版的 Vim 插件，旨在为 Visual Studio Code 提供更强大的导航和高亮功能，提升编辑效率。

## 功能

- **增强的 F/F 键导航**：通过高亮可达字符，快速跳转到指定位置。
- **增强的 S/S 键导航**：同样提供高亮功能，支持更精准的跳转控制。
- **自定义高亮颜色和样式**：根据个人喜好调整高亮颜色、字体粗细和下划线样式。
- **集成输出通道**：在操作过程中输出调试信息，方便开发和调试。

## 安装

1. 打开 Visual Studio Code。
2. 前往扩展市场，搜索 `vscode-vim-enhanced`。
3. 点击 **安装** 按钮进行安装。
4. 重启 VS Code 以激活插件。

## 使用方法

- **F/F 键导航**：按下 `f` 键后，插件会高亮当前行中所有可达的字符，按下目标字符即可跳转。
- **S/S 键导航**：按下 `s` 键后，同样会高亮可达字符，选择目标字符进行跳转。
- **配置快捷键**：可通过 `package.json` 中的命令进行自定义快捷键设置。

## 配置

插件提供多种配置选项，允许用户自定义高亮颜色、字体粗细和下划线样式。

```json
{
  "vscodeVimEnhanced.charPrimaryColor": "red",
  "vscodeVimEnhanced.charSecondaryColor": "green",
  "vscodeVimEnhanced.charFontWeight": "400",
  "vscodeVimEnhanced.enableUnderline": true,
  "vscodeVimEnhanced.enableAutoHighlight": true
}
```

您可以在 settings.json 文件中调整这些设置，以适应您的编辑需求。例如：

## 命令
插件集成了多个命令，您可以通过命令面板（Ctrl+Shift+P 或 Cmd+Shift+P）访问：

- vscodeVimEnhanced.enhanceFKey：启用 F 键增强功能。
- vscodeVimEnhanced.enhanceBackFKey：启用反向 F 键增强功能。
- vscodeVimEnhanced.removeEnhanceFKeyHighlight：移除 F 键高亮。
- vscodeVimEnhanced.enhanceSKey：启用 S 键增强功能。
- vscodeVimEnhanced.enhanceBackSKey：启用反向 S 键增强功能。
- vscodeVimEnhanced.removeEnhanceSKeyHighlight：移除 S 键高亮。

## 贡献
欢迎提交问题或贡献代码。请参考 LICENSE 了解更多信息。

## 许可证
该项目基于 Apache License 2.0 许可证开源。