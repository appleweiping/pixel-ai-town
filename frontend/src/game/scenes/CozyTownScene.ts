import Phaser from 'phaser';
import { TILE_SIZE, MAP_COLS, MAP_ROWS, DISPLAY_SCALE, ZONE_LAYOUT, getZoneForPosition, type ZoneId } from '../map/cozyMapData';
import { generatePlaceholderTileset, TILE } from '../map/placeholderTileset';
import { generateTerrainLayer, generatePathLayer, generateBuildingLayer, generatePropsLayer } from '../map/terrainGenerator';
import { useTownStore } from '../../store/townStore';
import type { TownAgent } from '../../types';

export class CozyTownScene extends Phaser.Scene {
  private terrainLayer!: Phaser.Tilemaps.TilemapLayer;
  private pathLayer!: Phaser.Tilemaps.TilemapLayer;
  private buildingLayer!: Phaser.Tilemaps.TilemapLayer;
  private propsLayer!: Phaser.Tilemaps.TilemapLayer;

  private agentSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private syncTimer: Phaser.Time.TimerEvent | null = null;
  private debugMode = false;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super({ key: 'CozyTownScene' });
  }

  create() {
    generatePlaceholderTileset(this);
    this.buildTilemap();
    this.setupCamera();
    this.setupInput();
    this.addZoneLabels();

    this.syncTimer = this.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => this.syncState(),
    });
  }

  shutdown() {
    this.syncTimer?.destroy();
    this.agentSprites.clear();
  }

  private buildTilemap() {
    const terrainData = generateTerrainLayer();
    const pathData = generatePathLayer();
    const buildingData = generateBuildingLayer();
    const propsData = generatePropsLayer();

    const map = this.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: MAP_COLS,
      height: MAP_ROWS,
    });

    const tileset = map.addTilesetImage('placeholder-tileset', 'placeholder-tileset', TILE_SIZE, TILE_SIZE)!;

    this.terrainLayer = map.createBlankLayer('terrain', tileset, 0, 0, MAP_COLS, MAP_ROWS)!;
    this.pathLayer = map.createBlankLayer('paths', tileset, 0, 0, MAP_COLS, MAP_ROWS)!;
    this.buildingLayer = map.createBlankLayer('buildings', tileset, 0, 0, MAP_COLS, MAP_ROWS)!;
    this.propsLayer = map.createBlankLayer('props', tileset, 0, 0, MAP_COLS, MAP_ROWS)!;

    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        if (terrainData[row][col] >= 0) this.terrainLayer.putTileAt(terrainData[row][col], col, row);
        if (pathData[row][col] >= 0) this.pathLayer.putTileAt(pathData[row][col], col, row);
        if (buildingData[row][col] >= 0) this.buildingLayer.putTileAt(buildingData[row][col], col, row);
        if (propsData[row][col] >= 0) this.propsLayer.putTileAt(propsData[row][col], col, row);
      }
    }

    this.terrainLayer.setDepth(0);
    this.pathLayer.setDepth(1);
    this.buildingLayer.setDepth(2);
    this.propsLayer.setDepth(3);
  }

  private setupCamera() {
    const worldW = MAP_COLS * TILE_SIZE;
    const worldH = MAP_ROWS * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setZoom(DISPLAY_SCALE);
    this.cameras.main.centerOn(worldW / 2, worldH / 2);
  }

  private setupInput() {
    let dragging = false;
    let dragStart = { x: 0, y: 0 };
    let camStart = { x: 0, y: 0 };

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() || pointer.middleButtonDown()) {
        dragging = true;
        dragStart = { x: pointer.x, y: pointer.y };
        camStart = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY };
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (dragging) {
        const dx = (pointer.x - dragStart.x) / this.cameras.main.zoom;
        const dy = (pointer.y - dragStart.y) / this.cameras.main.zoom;
        this.cameras.main.scrollX = camStart.x - dx;
        this.cameras.main.scrollY = camStart.y - dy;
      }
    });

    this.input.on('pointerup', () => { dragging = false; });

    this.input.on('wheel', (_p: any, _gos: any, _dx: number, dy: number) => {
      const cam = this.cameras.main;
      const newZoom = Phaser.Math.Clamp(cam.zoom - dy * 0.002, 1.5, 5);
      cam.setZoom(newZoom);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) return;
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      const col = Math.floor(worldX / TILE_SIZE);
      const row = Math.floor(worldY / TILE_SIZE);

      if (col >= 0 && col < MAP_COLS && row >= 0 && row < MAP_ROWS) {
        const zone = getZoneForPosition(col, row);
        if (zone) {
          const state = useTownStore.getState().state;
          const building = state?.buildings.find(b => b.zone === zone);
          if (building) {
            useTownStore.getState().selectBuilding(building);
            return;
          }
        }
        fetch('/api/town/player/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: Math.floor(col * 40 / MAP_COLS), y: Math.floor(row * 30 / MAP_ROWS) }),
        }).catch(() => {});
      }
    });

    this.input.keyboard?.on('keydown-F3', () => {
      this.debugMode = !this.debugMode;
      this.toggleDebugOverlay();
    });
  }

  private addZoneLabels() {
    for (const [id, z] of Object.entries(ZONE_LAYOUT)) {
      const x = (z.col + z.w / 2) * TILE_SIZE;
      const y = z.row * TILE_SIZE - 4;
      const label = this.add.text(x, y, z.label, {
        fontSize: '5px',
        color: '#f8e8d4',
        fontFamily: 'sans-serif',
        stroke: '#1a1a2e',
        strokeThickness: 1.5,
        align: 'center',
      });
      label.setOrigin(0.5, 1);
      label.setDepth(8);
    }
  }

  private toggleDebugOverlay() {
    if (this.debugMode) {
      if (!this.debugGraphics) {
        this.debugGraphics = this.add.graphics();
        this.debugGraphics.setDepth(9);
      }
      this.debugGraphics.clear();
      this.debugGraphics.lineStyle(0.5, 0xffffff, 0.15);
      for (let x = 0; x <= MAP_COLS; x++) {
        this.debugGraphics.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, MAP_ROWS * TILE_SIZE);
      }
      for (let y = 0; y <= MAP_ROWS; y++) {
        this.debugGraphics.lineBetween(0, y * TILE_SIZE, MAP_COLS * TILE_SIZE, y * TILE_SIZE);
      }
      for (const [, z] of Object.entries(ZONE_LAYOUT)) {
        this.debugGraphics.lineStyle(1, 0xe94560, 0.5);
        this.debugGraphics.strokeRect(z.col * TILE_SIZE, z.row * TILE_SIZE, z.w * TILE_SIZE, z.h * TILE_SIZE);
      }
    } else {
      this.debugGraphics?.clear();
    }
  }

  private syncState() {
    const state = useTownStore.getState().state;
    if (!state) return;
    for (const agent of state.agents) {
      this.updateAgentSprite(agent);
    }
  }

  private updateAgentSprite(agent: TownAgent) {
    let container = this.agentSprites.get(agent.id);
    if (!container) {
      container = this.createAgentSprite(agent);
      this.agentSprites.set(agent.id, container);
    }

    // Map backend 40×30 grid to our 80×50 tile world
    const targetX = (agent.position[0] / 40) * MAP_COLS * TILE_SIZE + TILE_SIZE / 2;
    const targetY = (agent.position[1] / 30) * MAP_ROWS * TILE_SIZE + TILE_SIZE / 2;

    const speed = 0.12;
    container.x += (targetX - container.x) * speed;
    container.y += (targetY - container.y) * speed;
    container.setDepth(4 + container.y * 0.001);
  }

  private createAgentSprite(agent: TownAgent): Phaser.GameObjects.Container {
    const x = (agent.position[0] / 40) * MAP_COLS * TILE_SIZE + TILE_SIZE / 2;
    const y = (agent.position[1] / 30) * MAP_ROWS * TILE_SIZE + TILE_SIZE / 2;

    const colors: Record<string, number> = {
      opus: 0x9b59b6, pixelcat: 0xf39c12, codex: 0x3498db,
      sonnet: 0x2ecc71, haiku: 0x1abc9c, deepseek: 0x2980b9,
      openhands: 0x8e44ad, aris: 0xe74c3c, player: 0xff69b4,
    };
    const color = colors[agent.id] || 0xffffff;

    // Shadow
    const shadow = this.add.ellipse(0, 5, 10, 4, 0x000000, 0.2);

    // Body (placeholder — will be replaced by sprite)
    const body = this.add.rectangle(0, -2, 8, 12, color);
    body.setStrokeStyle(1, 0x2a2a3a);

    // Head
    const head = this.add.circle(0, -10, 4, color);
    head.setStrokeStyle(1, 0x2a2a3a);

    // Name
    const shortName = agent.name.split(' ')[0];
    const nameLabel = this.add.text(0, -18, shortName, {
      fontSize: '4px',
      color: '#f8e8d4',
      fontFamily: 'sans-serif',
      stroke: '#1a1a2e',
      strokeThickness: 1,
    });
    nameLabel.setOrigin(0.5);

    // Activity indicator
    const actIcons: Record<string, string> = {
      thinking: '?', reading_memory: '♦', learning_skill: '★',
      chatting: '♪', working: '⚡', resting: '~', walking: '→', exploring: '◊',
    };
    const actText = this.add.text(6, -14, actIcons[agent.current_activity] || '', {
      fontSize: '4px', color: '#ffe4a0',
    });
    actText.setName('activity');

    const container = this.add.container(x, y, [shadow, body, head, nameLabel, actText]);
    container.setSize(12, 20);
    container.setInteractive(new Phaser.Geom.Rectangle(-6, -18, 12, 24), Phaser.Geom.Rectangle.Contains);

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      useTownStore.getState().selectAgent(agent);
    });

    container.on('pointerover', () => { body.setScale(1.15); head.setScale(1.15); });
    container.on('pointerout', () => { body.setScale(1); head.setScale(1); });

    // Idle animation
    this.tweens.add({
      targets: container,
      y: y - 1,
      duration: 1800 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return container;
  }
}
