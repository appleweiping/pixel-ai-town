import { MAP_COLS, MAP_ROWS, ZONE_LAYOUT, type ZoneId } from './cozyMapData';
import { TILE } from './placeholderTileset';

export function generateTerrainLayer(): number[][] {
  const map: number[][] = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    const r: number[] = [];
    for (let col = 0; col < MAP_COLS; col++) {
      r.push(pickTerrainTile(col, row));
    }
    map.push(r);
  }
  return map;
}

export function generatePathLayer(): number[][] {
  const map: number[][] = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    const r: number[] = [];
    for (let col = 0; col < MAP_COLS; col++) {
      r.push(isPath(col, row) ? pickPathTile(col, row) : -1);
    }
    map.push(r);
  }
  return map;
}

export function generateBuildingLayer(): number[][] {
  const map: number[][] = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    const r: number[] = [];
    for (let col = 0; col < MAP_COLS; col++) {
      r.push(getBuildingTile(col, row));
    }
    map.push(r);
  }
  return map;
}

export function generatePropsLayer(): number[][] {
  const map: number[][] = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    const r: number[] = [];
    for (let col = 0; col < MAP_COLS; col++) {
      r.push(getPropTile(col, row));
    }
    map.push(r);
  }
  return map;
}

function pickTerrainTile(col: number, row: number): number {
  const hash = simpleHash(col, row);
  if (isWater(col, row)) return hash % 2 === 0 ? TILE.WATER : TILE.WATER_DARK;
  const variants = [TILE.GRASS, TILE.GRASS, TILE.GRASS_DARK, TILE.GRASS_LIGHT, TILE.GRASS_FLOWERS];
  return variants[hash % variants.length];
}

function isPath(col: number, row: number): boolean {
  const plazaCenter = ZONE_LAYOUT.plaza;
  const cx = plazaCenter.col + plazaCenter.w / 2;
  const cy = plazaCenter.row + plazaCenter.h / 2;

  // Main horizontal road
  if (row >= 24 && row <= 25 && col >= 4 && col <= 76) return true;
  // Main vertical road
  if (col >= 35 && col <= 36 && row >= 4 && row <= 46) return true;
  // Plaza area cobblestone
  if (col >= plazaCenter.col + 2 && col < plazaCenter.col + plazaCenter.w - 2 &&
      row >= plazaCenter.row + 2 && row < plazaCenter.row + plazaCenter.h - 2) return true;
  // Branch paths to each zone
  for (const z of Object.values(ZONE_LAYOUT)) {
    const zx = z.col + Math.floor(z.w / 2);
    const zy = z.row + Math.floor(z.h / 2);
    if ((col === zx || col === zx + 1) && row >= Math.min(zy, 24) && row <= Math.max(zy, 25)) return true;
    if ((row === zy || row === zy + 1) && col >= Math.min(zx, 35) && col <= Math.max(zx, 36)) return true;
  }
  return false;
}

function pickPathTile(col: number, row: number): number {
  const hash = simpleHash(col, row);
  const variants = [TILE.COBBLE, TILE.COBBLE, TILE.COBBLE_DARK, TILE.COBBLE_LIGHT];
  return variants[hash % variants.length];
}

function isWater(col: number, row: number): boolean {
  // Small pond near dream garden
  const px = 8, py = 34;
  const dx = col - px, dy = row - py;
  return dx * dx + dy * dy <= 6;
}

function getBuildingTile(col: number, row: number): number {
  for (const [id, z] of Object.entries(ZONE_LAYOUT)) {
    const bCol = z.col + 2;
    const bRow = z.row + 2;
    const bW = z.w - 4;
    const bH = z.h - 4;

    if (col < bCol || col >= bCol + bW || row < bRow || row >= bRow + bH) continue;

    const localRow = row - bRow;
    const localCol = col - bCol;

    // Roof (top row)
    if (localRow === 0) {
      if (localCol === 0) return getRoofTile(id as ZoneId, 'L');
      if (localCol === bW - 1) return getRoofTile(id as ZoneId, 'R');
      return getRoofTile(id as ZoneId, 'M');
    }
    // Walls
    if (localRow > 0 && localRow < bH - 1) {
      if (localCol === Math.floor(bW / 2) && localRow === bH - 2) return TILE.DOOR;
      if (localRow === 1 && localCol % 3 === 1) return TILE.WINDOW_LIT;
      return getWallTile(id as ZoneId);
    }
    // Floor
    if (localRow === bH - 1) return TILE.WOOD;
  }
  return -1;
}

function getRoofTile(zone: ZoneId, pos: 'L' | 'M' | 'R'): number {
  const roofColors: Record<string, number[]> = {
    town_hall: [TILE.ROOF_RED_L, TILE.ROOF_RED_M, TILE.ROOF_RED_R],
    memory_library: [TILE.ROOF_BLUE_L, TILE.ROOF_BLUE_M, TILE.ROOF_BLUE_R],
    skill_workshop: [TILE.ROOF_GREEN_L, TILE.ROOF_GREEN_M, TILE.ROOF_GREEN_R],
    knowledge_tower: [TILE.ROOF_BLUE_L, TILE.ROOF_BLUE_M, TILE.ROOF_BLUE_R],
    devtools_lab: [TILE.ROOF_GREEN_L, TILE.ROOF_GREEN_M, TILE.ROOF_GREEN_R],
    resource_market: [TILE.ROOF_RED_L, TILE.ROOF_RED_M, TILE.ROOF_RED_R],
    dream_garden: [TILE.ROOF_GREEN_L, TILE.ROOF_GREEN_M, TILE.ROOF_GREEN_R],
    agent_homes: [TILE.ROOF_RED_L, TILE.ROOF_RED_M, TILE.ROOF_RED_R],
    plaza: [TILE.COBBLE, TILE.COBBLE, TILE.COBBLE],
  };
  const tiles = roofColors[zone] || [TILE.ROOF_RED_L, TILE.ROOF_RED_M, TILE.ROOF_RED_R];
  return pos === 'L' ? tiles[0] : pos === 'R' ? tiles[2] : tiles[1];
}

function getWallTile(zone: ZoneId): number {
  const walls: Record<string, number> = {
    town_hall: TILE.WALL_PLASTER,
    memory_library: TILE.WALL_STONE,
    skill_workshop: TILE.WALL_WOOD,
    knowledge_tower: TILE.WALL_STONE,
    devtools_lab: TILE.WALL_PLASTER,
    resource_market: TILE.WALL_WOOD,
    dream_garden: TILE.WALL_WOOD,
    agent_homes: TILE.WALL_PLASTER,
    plaza: TILE.COBBLE,
  };
  return walls[zone] || TILE.WALL_PLASTER;
}

function getPropTile(col: number, row: number): number {
  const hash = simpleHash(col, row);

  // Trees along edges
  if ((col === 0 || col === MAP_COLS - 1 || row === 0 || row === MAP_ROWS - 1) && hash % 3 === 0) {
    return row % 2 === 0 ? TILE.TREE_TOP : TILE.TREE_TRUNK;
  }

  // Flowers near paths
  if (isPath(col - 1, row) || isPath(col + 1, row) || isPath(col, row - 1) || isPath(col, row + 1)) {
    if (!isPath(col, row) && hash % 7 === 0) {
      return [TILE.FLOWER_RED, TILE.FLOWER_YELLOW, TILE.FLOWER_BLUE][hash % 3];
    }
  }

  // Lamps along main roads
  if (isPath(col, row) && hash % 12 === 0 && (row === 24 || col === 35)) {
    return TILE.LAMP_TOP;
  }

  // Benches near plaza
  const pz = ZONE_LAYOUT.plaza;
  if (col === pz.col + 1 && row >= pz.row + 3 && row <= pz.row + pz.h - 3 && hash % 4 === 0) {
    return TILE.BENCH;
  }

  // Signs at zone entrances
  for (const z of Object.values(ZONE_LAYOUT)) {
    if (col === z.col + Math.floor(z.w / 2) && row === z.row + z.h && hash % 2 === 0) {
      return TILE.SIGN;
    }
  }

  // Scattered bushes
  if (!isPath(col, row) && hash % 20 === 0) return TILE.BUSH;

  return -1;
}

function simpleHash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return Math.abs(h) % 1000;
}
