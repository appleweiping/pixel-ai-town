# Pixel AI Town — Art Direction

## Visual Identity

**Style:** Cozy top-down / 3/4 view pixel AI town
**Mood:** Warm, gentle, livable — a place AI agents call home
**Reference method:** Stardew Valley warmth + Terraria asset pipeline discipline
**Original assets only.** No copied game assets, no external sprite packs.

## Technical Specifications

| Property | Value |
|----------|-------|
| Base tile size | 16×16 px |
| Character sprite size | 16×24 px (small NPC) or 16×32 px (detailed) |
| Display scale | 3× (each pixel renders as 3×3 screen pixels) |
| Canvas resolution | 1280×960 (80×60 tiles at 16px, scaled 3× = 3840×2880 viewport) |
| Rendering | `image-rendering: pixelated` / `crisp-edges` |
| Scaling | Integer multiples only (1×, 2×, 3×, 4×) — never fractional |
| Anti-aliasing | Disabled. No smoothing on any pixel art asset. |
| Map format | Tile array (2D grid), not a single background image |

## Color Palette (32 colors max)

### Environment
- Grass: `#5a8c3c`, `#4a7c2f`, `#6b9e4a` (3 shades)
- Dirt/Path: `#8b6b3d`, `#a0804a`, `#6b4e2a` (3 shades)
- Stone: `#7a7a7a`, `#5c5c5c`, `#9a9a9a` (3 shades)
- Water: `#4a8fb8`, `#3a7ca8`, `#5aa0c8` (3 shades)
- Wood: `#8b5e3c`, `#a06b42`, `#6b4530` (3 shades)

### Sky & Atmosphere
- Sky: `#87ceeb`, `#a8d8ea` (day), `#2d3a5c`, `#1a2744` (night)
- Cloud: `#ffffff`, `#e8e8e8`

### Buildings & Props
- Roof: `#c85a4a`, `#4a7ab8`, `#6b8b5a` (red, blue, green variants)
- Wall: `#d4b896`, `#c8a882`, `#e0caa8` (warm stone/plaster)
- Window: `#ffe4a0`, `#ffd080` (warm light glow)
- Door: `#6b4530`, `#8b5e3c`

### UI & Accents
- Accent: `#e94560` (coral red — existing brand color)
- Panel BG: `#16213e` (dark navy — existing)
- Text: `#f8e8d4` (warm cream — existing)
- Highlight: `#ffd6df` (soft pink — existing)

### Characters
- Skin: `#f0c8a0`, `#e0b890`
- Hair: varies per agent (purple, orange, blue, green, teal, navy, brown, red, pink)
- Outline: `#2a2a3a` (dark blue-grey, not pure black)

## Asset Types

| Type | Tile Size | Format | Notes |
|------|-----------|--------|-------|
| Terrain tileset | 16×16 | PNG spritesheet | Grass, dirt, stone, water, edges |
| Path tileset | 16×16 | PNG spritesheet | Cobblestone, dirt path, wooden bridge |
| Building tileset | 16×16 | PNG spritesheet | Walls, roofs, doors, windows |
| Props | 16×16 | PNG spritesheet | Trees, lamps, benches, signs, flowers |
| Character sprites | 16×24 | PNG spritesheet | 4-dir walk (3 frames each) + idle |
| UI panels | 16×16 | PNG 9-slice | Panel borders, buttons |
| Icons | 16×16 | PNG | Status icons, zone markers |

## Character Design Rules

### Player Character (主角)
- Long flowing hair (pastel pink/lavender)
- Soft fantasy head accessory (flower crown / small ornament)
- Gentle, cute anime-inspired silhouette
- Warm color palette
- Must be readable at 16×24 px (48×72 display pixels at 3×)

### Agent NPCs
Each agent has a distinct silhouette and color:
- **Opus:** Purple robe, small crown — wise owl-like
- **PixelCat:** Orange with blue scarf — cat-like
- **Codex:** Blue-purple, screen face — robot-like
- **Sonnet:** Cream/brown, notebook — deer-like
- **Haiku:** Teal-green, tiny — hummingbird-like
- **DeepSeek:** Blue, backpack — whale-like
- **OpenHands:** Brown/grey, tool belt — raccoon-like
- **ARIS:** Purple crystal, geometric — golem-like

## Rendering Rules

1. All tiles align to 16px grid
2. No sub-pixel positioning for static elements
3. Characters may use sub-pixel lerp for smooth movement
4. Z-ordering: terrain < paths < buildings < props < characters < effects < UI
5. Shadows: 1px offset, right-down direction, 30% opacity dark
6. Outlines: 1px `#2a2a3a` on all sprites and building elements
7. No glow effects, no bloom, no blur filters on game layer

## Layer Structure

```
Layer 0: Sky background (gradient, not tiles)
Layer 1: Terrain tiles (grass, dirt, water)
Layer 2: Paths (cobblestone, dirt paths)
Layer 3: Building bases (walls, floors)
Layer 4: Building tops (roofs, upper walls)
Layer 5: Props (trees, lamps, signs, flowers)
Layer 6: Characters (agents + player)
Layer 7: Effects (particles — leaves, sparkles)
Layer 8: UI overlay (panels, HUD — React layer)
Layer 9: Debug overlay (grid, zone borders — hidden by default)
```

## Prohibited

- No realistic rendering
- No 3D perspective
- No glassmorphism on game elements (UI panels may use subtle backdrop-blur)
- No high-resolution illustration pasted as background
- No mixed-resolution assets (everything 16px base)
- No external sprite packs or asset store downloads
- No copied Terraria/Stardew Valley/any game assets
- No AI-generated "one big map image" used as background
- No blurred/smoothed pixel art
- No fractional scaling

## Generation Policy

All visual assets MUST be generated via **gptimage2** (the project's configured image generation endpoint).
- No other image generation model allowed
- No fallback to other providers
- No random internet assets
- Every generated asset must be registered in `manifest.json`
- Every generation prompt must be saved in `prompts/` directory
