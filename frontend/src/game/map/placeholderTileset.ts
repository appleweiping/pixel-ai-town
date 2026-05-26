import Phaser from 'phaser';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from '../map/cozyMapData';

/**
 * Generates a placeholder tileset texture at runtime.
 * This will be replaced by gptimage2-generated assets.
 */
export function generatePlaceholderTileset(scene: Phaser.Scene): void {
  const size = TILE_SIZE;
  const cols = 16;
  const rows = 8;
  const canvas = document.createElement('canvas');
  canvas.width = cols * size;
  canvas.height = rows * size;
  const ctx = canvas.getContext('2d')!;

  const tiles: Array<{ color: string; label?: string }> = [
    // Row 0: Terrain
    { color: '#5a8c3c' },  // 0: grass
    { color: '#4a7c2f' },  // 1: grass-dark
    { color: '#6b9e4a' },  // 2: grass-light
    { color: '#5a8c3c' },  // 3: grass-flowers
    { color: '#8b6b3d' },  // 4: dirt
    { color: '#a0804a' },  // 5: dirt-light
    { color: '#6b4e2a' },  // 6: dirt-dark
    { color: '#7a7a7a' },  // 7: stone
    { color: '#5c5c5c' },  // 8: stone-dark
    { color: '#4a8fb8' },  // 9: water
    { color: '#3a7ca8' },  // 10: water-dark
    { color: '#87ceeb' },  // 11: sky (unused in tilemap)
    { color: '#8b5e3c' },  // 12: wood
    { color: '#a06b42' },  // 13: wood-light
    { color: '#6b4530' },  // 14: wood-dark
    { color: '#d4b896' },  // 15: plaster

    // Row 1: Paths & edges
    { color: '#9a8a6a' },  // 16: cobblestone
    { color: '#8a7a5a' },  // 17: cobblestone-dark
    { color: '#b09a7a' },  // 18: cobblestone-light
    { color: '#7a6a4a' },  // 19: path-edge
    { color: '#5a8c3c' },  // 20: grass-path-edge-top
    { color: '#5a8c3c' },  // 21: grass-path-edge-bottom
    { color: '#5a8c3c' },  // 22: grass-path-edge-left
    { color: '#5a8c3c' },  // 23: grass-path-edge-right
    { color: '#c8a882' },  // 24: sand
    { color: '#e0caa8' },  // 25: sand-light
    { color: '#6b8b5a' },  // 26: moss
    { color: '#4a6b3a' },  // 27: moss-dark
    { color: '#ffffff' },  // 28: white (placeholder)
    { color: '#ffffff' },  // 29
    { color: '#ffffff' },  // 30
    { color: '#ffffff' },  // 31

    // Row 2: Building walls
    { color: '#d4b896' },  // 32: wall-plaster
    { color: '#c8a882' },  // 33: wall-plaster-window
    { color: '#7a7a7a' },  // 34: wall-stone
    { color: '#6a6a6a' },  // 35: wall-stone-window
    { color: '#8b5e3c' },  // 36: wall-wood
    { color: '#7a5030' },  // 37: wall-wood-window
    { color: '#b85a4a' },  // 38: wall-brick
    { color: '#a04a3a' },  // 39: wall-brick-window
    { color: '#6b4530' },  // 40: door
    { color: '#5a3a25' },  // 41: door-fancy
    { color: '#ffe4a0' },  // 42: window-lit
    { color: '#8a8a6a' },  // 43: window-dark
    { color: '#ffffff' },  // 44
    { color: '#ffffff' },  // 45
    { color: '#ffffff' },  // 46
    { color: '#ffffff' },  // 47

    // Row 3: Roofs
    { color: '#c85a4a' },  // 48: roof-red-left
    { color: '#b84a3a' },  // 49: roof-red-mid
    { color: '#c85a4a' },  // 50: roof-red-right
    { color: '#a83a2a' },  // 51: roof-red-peak
    { color: '#4a7ab8' },  // 52: roof-blue-left
    { color: '#3a6aa8' },  // 53: roof-blue-mid
    { color: '#4a7ab8' },  // 54: roof-blue-right
    { color: '#2a5a98' },  // 55: roof-blue-peak
    { color: '#6b8b5a' },  // 56: roof-green-left
    { color: '#5a7a4a' },  // 57: roof-green-mid
    { color: '#6b8b5a' },  // 58: roof-green-right
    { color: '#4a6a3a' },  // 59: roof-green-peak
    { color: '#ffffff' },  // 60
    { color: '#ffffff' },  // 61
    { color: '#ffffff' },  // 62
    { color: '#ffffff' },  // 63

    // Row 4: Props
    { color: '#3a6a2a' },  // 64: tree-top
    { color: '#5a3a20' },  // 65: tree-trunk
    { color: '#4a8a3a' },  // 66: bush
    { color: '#e85050' },  // 67: flower-red
    { color: '#e8d050' },  // 68: flower-yellow
    { color: '#5080e8' },  // 69: flower-blue
    { color: '#8a8a8a' },  // 70: lamp-top
    { color: '#6a6a6a' },  // 71: lamp-post
    { color: '#8b5e3c' },  // 72: bench
    { color: '#7a7a9a' },  // 73: fountain
    { color: '#8b5e3c' },  // 74: fence-h
    { color: '#8b5e3c' },  // 75: fence-v
    { color: '#8b5e3c' },  // 76: sign
    { color: '#6a5a4a' },  // 77: barrel
    { color: '#7a6a5a' },  // 78: crate
    { color: '#4a8fb8' },  // 79: well
  ];

  for (let i = 0; i < tiles.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * size;
    const y = row * size;

    ctx.fillStyle = tiles[i].color;
    ctx.fillRect(x, y, size, size);

    // Add subtle grid line
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);

    // Add texture variation
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x + 2, y + 2, 4, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(x + size - 6, y + size - 6, 4, 4);
  }

  scene.textures.addCanvas('placeholder-tileset', canvas);
}

export const TILE = {
  GRASS: 0,
  GRASS_DARK: 1,
  GRASS_LIGHT: 2,
  GRASS_FLOWERS: 3,
  DIRT: 4,
  DIRT_LIGHT: 5,
  DIRT_DARK: 6,
  STONE: 7,
  STONE_DARK: 8,
  WATER: 9,
  WATER_DARK: 10,
  WOOD: 12,
  WOOD_LIGHT: 13,
  WOOD_DARK: 14,
  PLASTER: 15,

  COBBLE: 16,
  COBBLE_DARK: 17,
  COBBLE_LIGHT: 18,

  WALL_PLASTER: 32,
  WALL_PLASTER_WIN: 33,
  WALL_STONE: 34,
  WALL_STONE_WIN: 35,
  WALL_WOOD: 36,
  WALL_WOOD_WIN: 37,
  DOOR: 40,
  WINDOW_LIT: 42,

  ROOF_RED_L: 48,
  ROOF_RED_M: 49,
  ROOF_RED_R: 50,
  ROOF_BLUE_L: 52,
  ROOF_BLUE_M: 53,
  ROOF_BLUE_R: 54,
  ROOF_GREEN_L: 56,
  ROOF_GREEN_M: 57,
  ROOF_GREEN_R: 58,

  TREE_TOP: 64,
  TREE_TRUNK: 65,
  BUSH: 66,
  FLOWER_RED: 67,
  FLOWER_YELLOW: 68,
  FLOWER_BLUE: 69,
  LAMP_TOP: 70,
  LAMP_POST: 71,
  BENCH: 72,
  FOUNTAIN: 73,
  FENCE_H: 74,
  FENCE_V: 75,
  SIGN: 76,
} as const;
