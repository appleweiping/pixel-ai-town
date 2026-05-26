import Phaser from 'phaser';

export const TILE_SIZE = 16;
export const MAP_COLS = 80;
export const MAP_ROWS = 50;
export const DISPLAY_SCALE = 3;

export const ZONE_LAYOUT = {
  dream_garden:    { col: 2,  row: 28, w: 10, h: 8, label: '梦境花园' },
  resource_market: { col: 14, row: 28, w: 10, h: 8, label: '资源市场' },
  memory_library:  { col: 2,  row: 16, w: 12, h: 10, label: '记忆图书馆' },
  plaza:           { col: 28, row: 20, w: 16, h: 12, label: '中央广场' },
  town_hall:       { col: 30, row: 6,  w: 14, h: 10, label: '镇政厅' },
  skill_workshop:  { col: 54, row: 16, w: 12, h: 10, label: '技能工坊' },
  knowledge_tower: { col: 16, row: 6,  w: 10, h: 10, label: '知识塔' },
  devtools_lab:    { col: 56, row: 28, w: 12, h: 8, label: '开发实验室' },
  agent_homes:     { col: 68, row: 16, w: 10, h: 12, label: '居民住宅' },
} as const;

export type ZoneId = keyof typeof ZONE_LAYOUT;

export function getZoneCenter(zone: ZoneId): { x: number; y: number } {
  const z = ZONE_LAYOUT[zone];
  return {
    x: (z.col + z.w / 2) * TILE_SIZE,
    y: (z.row + z.h / 2) * TILE_SIZE,
  };
}

export function getZoneForPosition(col: number, row: number): ZoneId | null {
  for (const [id, z] of Object.entries(ZONE_LAYOUT)) {
    if (col >= z.col && col < z.col + z.w && row >= z.row && row < z.row + z.h) {
      return id as ZoneId;
    }
  }
  return null;
}
