# Pixel AI Town — Asset Directory

All visual assets in this directory are **original generated assets** created exclusively via **gptimage2**.

## Rules

1. **gptimage2 is the ONLY allowed image generation provider.** No exceptions.
2. No external sprite packs, asset stores, or internet downloads.
3. No copied assets from Terraria, Stardew Valley, or any other game.
4. No "one big map image" used as a background. All maps are tile-composed.
5. Every asset must be registered in `manifest.json` before use.
6. Every generation prompt must be saved in `prompts/`.
7. All assets must share the same pixel density (16px base tile).
8. All assets must use the project palette (see `docs/pixel-ai-town-art-direction.md`).
9. No blurred or smoothed pixel art. Integer scaling only.

## Directory Structure

```
pixel-town/
├── manifest.json          — Asset registry (source, prompt, status)
├── README.md              — This file
├── tiles/
│   ├── terrain/           — Grass, dirt, stone, water tiles
│   ├── paths/             — Cobblestone, dirt path, bridge tiles
│   ├── buildings/         — Wall, roof, door, window tiles
│   └── props/             — Trees, lamps, benches, signs, flowers
├── sprites/
│   ├── player/            — Player character sprite sheets
│   └── agents/            — Agent NPC sprite sheets
├── ui/
│   ├── panels/            — 9-slice panel borders
│   └── icons/             — Status and zone icons
└── prompts/               — gptimage2 generation prompts
```

## Asset Status

- `placeholder` — Prompt defined, awaiting generation
- `generated` — Generated via gptimage2, ready for use
- `active` — Currently used in the game

## Adding New Assets

1. Write the prompt in `prompts/gptimage2-{category}.md`
2. Add entry to `manifest.json` with status `placeholder`
3. Generate via gptimage2 using `art/generate_sideview.py` or direct API call
4. Save output to the correct subdirectory
5. Update manifest status to `generated`
6. Integrate into game code
7. Update manifest status to `active`
