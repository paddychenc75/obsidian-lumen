# Changelog

All notable changes to Lumen Glass are documented in this file.

The project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.11] - 2026-08-22

### Fixed

- Flattened the Settings right pane: no page-wide enclosing card and no 1.13 `.setting-items` nest. Inset stays on the rows (16px) and the paper (24px). Dropdowns, textareas and toggles keep their own control borders.
- Restored the 16px horizontal inset on Settings cards so toggles and plugin rows no longer sit flush to the pane edge.
- Dropped the Settings search field's right border so it no longer doubles the pane divider.
- Squared the Settings popout at the titlebar so the top-right corner no longer shows a dark notch. macOS popout modals also keep the 4px frame cap, so the window-control band is not squeezed.
- Lined Claudian's Settings tabs (General / Collab / Providers) into one 36px capsule and aligned labels with the General segment. Headings are titles with a hairline, not stitched card slices.
- Lined Claudian's conversation toolbar with the composer so the nav row and input share one width.

### Changed

- Opened the Community plugins list: 8px row gap and 12px block padding on those names. Options and core plugin rows stay compact.

## [1.0.10] - 2026-08-22

### Fixed

- Replaced the Lumen Stage Live Preview parent selector that used `:has()`. The plugin already toggles `.lmm-embed` on `.cm-embed-block`; the theme now targets that class, so community CSS lint no longer warns and no `!important` is needed.

### Changed

- Tightened the Stage skin to `body .mermaid.lmm-host` and `.lmm-host …`. Those selectors still outrank the plugin fallback, cover Reading View, Live Preview and fullscreen, and drop the repeated `:is(.markdown-rendered, .lmm-fs)` wrapper.

## [1.0.9] - 2026-08-22

### Fixed

- Stopped flattening every settings heading to `padding-block: 0` with a four-class selector. That reset sat above any plugin that draws a divider on the heading and reserves `padding-top` for the gap, so the rule sat on the title. The compact reset is now one class; plugins at two classes keep their spacing, and core headings still have no top border.
- Centred the magnifying glass in Settings search fields against the text. The theme's form floor raises those inputs to `--lg-control-size` while Obsidian still positioned the icon from the default 30px `--input-height`, so the glass sat 3px high; `--input-height` now follows the same token. The clear button already centred itself and stays on that midline.

### Changed

- Replaced the public preview with a dual-mode English hero (light and dark side by side). The community listing still reads `assets/screenshot.png` from the default branch.

## [1.0.8] - 2026-08-22

### Added

- Optional scoped skin for the independent Lumen Stage plugin (`lumen-stage`). The interactive host reuses the code-block header band and language flair; the canvas fills the prose column with no grid and no floating toolbar. Readers without the plugin keep the static Mermaid figure. The plugin works on any theme; this stylesheet only skins `.lmm-*`.

### Changed

- Rebuilt code blocks as one component in both renderers. Live Preview now uses its fence line as a quiet 36px header, separates the first code line from that header with a 16px content inset, gives the language/copy affordance a stable 24px target, carries continuous inset rails across CodeMirror's per-line DOM, and closes with a deliberate footer. Reading View gets the same 10px radius, 16px inset, 1.55 leading and one-pixel structural border. Light and dark appearances use separate surface, divider and highlight tokens; syntax colors are unchanged.
- Turned Mermaid output into a readable figure rather than an unstyled SVG. Diagrams may borrow up to 4rem from each prose gutter, sit on a bordered semantic canvas, use the interface font, and share accessible node, edge and label tokens across flowchart, sequence, state, class and ER diagrams. Dark mode no longer inverts the light Mermaid SVG — it receives a native dark palette instead. Author `classDef` and inline styles still win. Narrow windows keep diagram text readable in a nested horizontal scroller, while print collapses the figure back to page width and a light palette.
- Stopped shipping author comments in `theme.css`. Design notes stay in `src/`; the published file keeps the Style Settings block and a generated-file banner so the community RELEASES size warning has less to weigh.

### Fixed

- Replaced print `break-after` / `break-inside` with `page-break-after` / `page-break-inside`. The community CSS lint maps the unified fragmentation properties to "multicolumn" and still reviews against Obsidian 1.11.4, even though `minAppVersion` is 1.13.0.

## [1.0.7] - 2026-08-21

### Added

- Added a Style Settings control for the Claudian panel, defaulting to the themed treatment. The gate is applied at build time and verified by `npm run check`, so a rule cannot escape it and the adaptation still applies for readers who do not have Style Settings.
- Styled the properties block: separated rows, a wider label column, row hover and focus, and a rule closing it off from the note body. None of Obsidian's 46 metadata variables had been mapped.
- Styled search: file and match rows now differ in weight, matches take the reader's highlight color, and the in-note find bar reads as a floating panel instead of an opaque rectangle.
- Added print styles, a monochrome code palette for paper, and page-break rules for code blocks, tables and callouts.
- Set spacing between Han characters and adjacent Latin or digits in notes, and applied `accent-color` so native controls follow the theme rather than the OS.

### Fixed

- Replaced the code syntax palette. Obsidian's default derives from the interface colors, where all nine tokens missed 4.5:1 against this theme's light code surface and function names sat at 1.9:1; every token now clears 4.5:1 in both appearances.
- Declared the chrome separations instead of leaving them to collide: one 4px inset on every panel rendered as 8px between the sidebars and the note, 4px between the tab bar and the note, and 4px at the window edge. The seam is now 12px throughout and the frame 8px, and the seam clears the 10px panel radius so the channel no longer pinches where two rounded corners face each other.
- Capped the frame at 4px on frameless macOS windows, where the system paints its controls over our panels at a fixed inset — measured at x 14..74, y 12..25 — and an 8px frame left the panel edge 4px from buttons it cannot move.
- Stopped the ribbon divider from cutting through the window controls. Their cluster reaches x 74, past the ribbon's inner edge, so the hairline ran between the yellow and green buttons and split a group the system draws as one; it now begins below the control band and the ribbon and sidebar read as a single surface up there.
- Brought the leading icon in sidebar tree rows back inside the row. Rows hang that icon 20px to the left of their text box so that collapsible and plain rows still share one label column, but core gives several views 8px of leading padding instead of the 24px it reserves for the hang, so the icon hung into the panel's own edge margin — 4px from the panel edge in the properties list, about 0 in the link panes, and outside the row's hover shape while the trailing count sat comfortably at 24px. All five panes now read 12px to the highlight, 16px to the icon, 36px to the text and 20px to the count.
- Centred the property icons against their labels in the note's properties block. The key cell aligns its children to the top so a wrapped value keeps its label on the first line, which makes the icon's own height decide where it lands — Obsidian sizes it for its own 28px field while our form floor gives the field 36px, so the icon sat half the difference above the label on all ten rows. The icon now follows `--lg-control-size`, and both shrink together in narrow windows.
- Fixed PDF export from dark mode, which produced black text on a near-black page because Obsidian resets the note's text color for print but not the theme's surfaces.
- Removed the accent rail Obsidian draws on embeds, which duplicated the blockquote's rail whenever an embed was quoted.
- Aligned `--code-radius` with the radius the code block rule actually applied.

### Changed

- Measured the note width in characters of the reader's body text rather than in rem, and shortened it from 46rem to 40em. The old value was a constant 736px regardless of font size, so the line ran 43 Han or 86 Latin characters at the default and swung from 52 down to 35 Han as the reader moved the size from 14px to 21px; it now holds about 37 Han or 77 Latin at any size, with paragraph spacing and leading following the same unit.
- Raised body leading from 1.66 to 1.7 and muted list markers to `--text-faint`.
- Redrew the blockquote rule at 3px and raised it from 56% to 78% opacity in light, 68% to 84% in dark, tightening the nesting ladder to 54% and 38% at the second and third levels. A rule lighter than the text's own stems read as an artifact rather than as structure, and a ladder ending at a quarter made a nested quote read as a broken line. Both ends are now square in both views: live preview draws the rule per line, so a cap could only land on the first or last line currently in the DOM, and CodeMirror keeps only the viewport — the rounded cap appeared wherever scrolling cut the quote off and travelled with the scroll.
- Stacked the glass and overlay shadows into a tight contact layer plus a wide ambient one, holding total darkness near the previous single-blur value.
- Set comments in italic and grouped comments, operators and punctuation into one neutral family, leaving six hues to carry meaning.
- Gave paragraphs and list items `text-wrap: pretty`, and mapped the drag ghost onto the tooltip material instead of its hardcoded black.

## [1.0.6] - 2026-08-21

### Added

- Split the stylesheet into `src/*.css` modules built into `theme.css` by `npm run build`; `npm run check` fails when the two diverge.
- Added a validation guard that fails the build if a plugin adaptation rule escapes its view scope, and a warning for border radii outside the token scale.

### Fixed

- Made the Claudian permission toggle distinguishable: checked and unchecked tracks now clear 3:1 in both appearances, up from 1.08:1 and 1.14:1.
- Filled in the dark-mode call-to-action and glass shadow tokens, which previously inherited light-tuned values.
- Widened the focus ring under `prefers-contrast: more`, which had no effect because a bare `:focus-visible` rule lost on specificity to every component's own focus selector.
- Kept link underlines on both fragments when a link wraps across lines.
- Restored heading hierarchy at h5 and h6, which had collapsed into the body size.

### Changed

- Sized the heading scale in `em` so it tracks the reader's body size setting, with per-level optical tracking and balanced wrapping.
- Consolidated focus rings, durations, and press feedback into single tokens; added a press compression to primary controls.
- Gave the Claudian transcript one shape family and its own reading size, and reduced its surface fills from five levels to three.

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

[1.0.10]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.10
[1.0.9]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.9
[1.0.8]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.8
[1.0.7]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.7
[1.0.6]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.6
[1.0.5]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.5
[1.0.4]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.4
[1.0.3]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.3
[1.0.2]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.2
[1.0.1]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.1
[1.0.0]: https://github.com/paddychenc75/obsidian-lumen/releases/tag/1.0.0
