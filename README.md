# 琉光 Lumen

**手触琉璃，心落纸上。Glass for the hands. Paper for the mind.**

Lumen 是一套适用于 Obsidian 的浅色与深色主题。界面 chrome 使用克制的环境玻璃，编辑器和阅读区保持稳定纸面，让导航具有层次，同时保证长文与技术文档的可读性。

![Lumen 浅色界面](assets/screenshot.png)

## 特性

- 浅色与深色模式
- 玻璃 ribbon、侧栏、标签栏、状态栏和命令面板
- 实色编辑器、阅读页、代码块、表格、Callout 与设置内容
- 适配 Live Preview、阅读模式、Properties、移动端和独立设置窗口
- 支持降低透明度、增强对比度和减少动态效果
- 可选的 Style Settings 配置
- 不加载远程字体、图片或其他网络资源

## 兼容性

- Obsidian 1.13.0 或更高版本
- macOS、Windows、Linux 与 Obsidian Mobile
- 推荐安装 [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) 以使用全部外观配置

## 安装

### GitHub Release

1. 从 [最新 Release](https://github.com/paddychenc75/obsidian-lumen/releases/latest) 下载 `manifest.json` 和 `theme.css`。
2. 在仓库的 `.obsidian/themes/` 下创建 `琉光 Lumen` 文件夹。
3. 将两个文件放入该文件夹。
4. 在 Obsidian 的“设置 → 外观 → 主题”中选择 **琉光 Lumen**。

### 本地开发

将仓库克隆到 vault 的主题目录：

```bash
git clone https://github.com/paddychenc75/obsidian-lumen.git \
  "/path/to/vault/.obsidian/themes/琉光 Lumen"
```

重新加载 Obsidian 或切换一次主题即可看到修改。

## Style Settings

- 自定义墙纸与环境渗色
- 玻璃重量：轻、标准、厚
- chrome 贴边模式
- 镜面高光开关
- 正文高对比与中性纸面
- 降低透明度与增强对比度
- 自定义强调色

系统级“降低透明度”“增强对比度”和“减少动态效果”也会自动生效。

## 设计原则

Lumen 遵循“chrome 是玻璃，笔记是纸”的分层：

- 导航和临时覆盖层负责环境感与空间层级。
- 笔记内容使用稳定纸面，不让墙纸和模糊影响阅读。
- 选中状态使用内嵌材质，不依赖粗描边或高饱和色块。
- 间距、圆角、交互状态和深浅色均由统一 token 管理。

品牌与实现说明见 [BRAND.md](BRAND.md)、[DESIGN.md](DESIGN.md)、[REVIEW.md](REVIEW.md) 和 [preview.html](preview.html)。

## 开发与校验

项目只依赖 Node.js 自带模块：

```bash
npm run check
```

推送版本 tag 后，GitHub Actions 会校验 tag 与 `manifest.json` 的版本，并自动发布 Obsidian 所需的 `manifest.json` 和 `theme.css`。

## 许可

Lumen 使用 [MIT License](LICENSE)。Apple、Obsidian 及其他产品名称和商标归各自权利人所有。
