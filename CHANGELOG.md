# Changelog

All notable changes to Lumen Glass are documented in this file.

The project follows [Semantic Versioning](https://semver.org/).

## [1.0.2] - 2026-08-20

### Fixed

- Cleared all Community Directory CSS warnings without weakening Lumen Glass's core style overrides.
- Replaced partially supported text-decoration and multicolumn declarations with compatible visual equivalents.
- Replaced MathJax custom-element selectors with the stable `.MathJax` class.
- Removed all `!important` declarations by scoping essential overrides to Obsidian's light and dark theme body classes.

## [1.0.1] - 2026-08-20

### Changed

- Renamed the public theme from Lumen to Lumen Glass for a unique Community Themes listing.
- Updated the manifest, Style Settings metadata, documentation, and release metadata.
- Removed the custom wallpaper URL setting so the theme cannot initiate remote asset requests.
- Superseded the pre-directory 1.0.0 package, whose release assets retain the former bilingual manifest name.

## [1.0.0] - 2026-08-20

### Added

- Light and dark Lumen color systems.
- Glass chrome with paper-based editor and reading surfaces.
- Desktop, mobile, Live Preview, settings, command palette, and accessibility states.
- Style Settings controls for wallpaper, glass weight, contrast, transparency, and accent color.
- Automated repository validation and tag-based GitHub releases.

[1.0.2]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.2
[1.0.1]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.1
[1.0.0]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.0
