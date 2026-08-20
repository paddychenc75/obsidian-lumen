# Lumen Glass

A light and dark theme for [Obsidian](https://obsidian.md/) with translucent navigation, restrained interface styling, and a clear reading surface.

![Lumen Glass theme preview](assets/screenshot.png)

## Features

- Light and dark color schemes
- Translucent sidebars, tabs, status bar, command palette, and menus
- Readable editor, reading view, code blocks, tables, callouts, and settings
- Support for Live Preview, Properties, pop-out windows, and mobile layouts
- System accessibility preferences for reduced transparency, increased contrast, and reduced motion
- Optional customization through the [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) plugin
- No remote fonts, images, or other runtime network requests

## Requirements

- Obsidian 1.13.0 or later
- macOS, Windows, Linux, or Obsidian Mobile

> [!IMPORTANT]
> The historical 1.0.0 release predates the Lumen Glass rename and contains the former bilingual manifest name. Do not use it for Lumen Glass; the next supported release is 1.0.1.

## Installation

### GitHub release

1. Download `manifest.json` and `theme.css` from the [latest release](https://github.com/paddychenc75/obsidian-lumen/releases/latest).
2. Create a folder named `Lumen Glass` inside your vault's `.obsidian/themes/` directory.
3. Copy both files into the new folder.
4. Open **Settings → Appearance → Themes** and select **Lumen Glass**.

### Git

Clone the repository directly into your vault's themes directory:

```bash
git clone https://github.com/paddychenc75/obsidian-lumen.git \
  "/path/to/vault/.obsidian/themes/Lumen Glass"
```

Reload Obsidian or switch themes after editing `theme.css`.

## Customization

Install [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) to configure:

- Built-in ambient color bleed
- Thin, regular, or thick glass
- Inset or flush interface layout
- Specular highlights
- Neutral or high-contrast reading surfaces
- Transparency and contrast preferences
- Accent color

Lumen Glass also follows the matching accessibility preferences provided by your operating system.

## Development

The validation script requires Node.js 24 or later and has no third-party dependencies.

```bash
npm run check
```

Version tags must match the version in `manifest.json`. Pushing a version tag runs the release workflow and uploads the files required by Obsidian. The 1.0.1 tag must be created from this renamed source state; the existing 1.0.0 tag and release remain immutable historical artifacts.

## Contributing

Bug reports and pull requests are welcome. Please run `npm run check` before submitting a change.

## License

Lumen Glass is available under the [MIT License](LICENSE).
