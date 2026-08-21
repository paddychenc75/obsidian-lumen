# Changelog

All notable changes to Lumen Glass are documented in this file.

The project follows [Semantic Versioning](https://semver.org/).

## [1.0.5] - 2026-08-21

### Changed

- Integrated Claudian 2.2.3 surfaces and controls with Lumen Glass, including compact responsive layouts, segmented navigation, composer alignment, and permission toggle states.
- Aligned the All Properties view with the theme's standard content gutter.
- Refined blockquotes with continuous rails, progressively quieter nesting, and consistent Reading View, Live Preview, and RTL behavior.
- Redesigned Markdown tables with persistent hierarchical grids, document-style typography, numeric alignment, interaction states, responsive overflow, and accessibility adaptations.

## [1.0.4] - 2026-08-21

### Fixed

- Unified internal, external, and unresolved link decoration as a single inset underline in Reading View and Live Preview.
- Improved inline code contrast and boundaries in light and dark modes without changing fenced code blocks.
- Clarified blockquote hierarchy with a stronger outer accent, a softer nested accent, rounded rails, and consistent nested indentation.

## [1.0.3] - 2026-08-20

### Fixed

- Refined file tree indentation, disclosure alignment, truncation, active states, and status bar spacing.
- Improved secondary button contrast and interaction states in both light and dark modes.

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

[1.0.5]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.5
[1.0.4]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.4
[1.0.3]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.3
[1.0.2]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.2
[1.0.1]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.1
[1.0.0]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.0
