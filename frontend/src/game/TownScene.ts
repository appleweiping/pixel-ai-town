import * as Phaser from 'phaser'
import { useGameStore } from '../store/gameStore'

const MAP_W = 1536
const MAP_H = 1024

interface ZoneHotspot {
  name: string
  x: number
  y: number
  radius: number
}

const ZONES: ZoneHotspot[] = [
  { name: 'Central Plaza', x: 768, y: 580, radius: 100 },
  { name: 'Town Hall', x: 768, y: 280, radius: 90 },
  { name: 'Memory Library', x: 450, y: 200, radius: 80 },
  { name: 'Knowledge Tower', x: 1100, y: 200, radius: 80 },
  { name: 'Skill Workshop', x: 280, y: 400, radius: 80 },
  { name: 'Resource Market', x: 1250, y: 400, radius: 80 },
  { name: 'Devtools Lab', x: 280, y: 700, radius: 80 },
  { name: 'Agent Homes', x: 650, y: 750, radius: 90 },
  { name: 'Dream Garden', x: 1250, y: 750, radius: 90 },
]

const AGENT_HOMES: Record<string, { x: number; y: number }> = {
  opus: { x: 768, y: 300 },
  pixelcat: { x: 280, y: 420 },
  sonnet: { x: 450, y: 220 },
  codex: { x: 900, y: 580 },
  haiku: { x: 650, y: 770 },
  deepseek: { x: 1100, y: 600 },
  aris: { x: 1100, y: 220 },
}

export class TownScene extends Phaser.Scene {
  private agentSprites: Map<string, Phaser.GameObjects.Container> = new Map()
  private bgReady = false

  constructor() {
    super({ key: 'TownScene' })
  }

  preload() {
    this.load.image('town-map', '/assets/town-map.png')
    const agentIds = ['opus', 'pixelcat', 'sonnet', 'codex', 'haiku', 'deepseek', 'aris']
    for (const id of agentIds) {
      this.load.image(`char-${id}`, `/assets/characters/${id}.png`)
    }
    this.load.on('filecomplete-image-town-map', () => { this.bgReady = true })
    this.load.on('loaderror', () => { this.bgReady = false })
  }

  create() {
    if (this.bgReady) {
      const bg = this.add.image(MAP_W / 2, MAP_H / 2, 'town-map')
      bg.setDisplaySize(MAP_W, MAP_H)
    } else {
      this.createFallbackBackground()
    }

    this.createZoneLabels()
    this.createAgents()
    this.setupCamera()
    this.setupInput()
    this.startTickLoop()
  }

  private createFallbackBackground() {
    const g = this.add.graphics()
    g.fillStyle(0xf5f0e8)
    g.fillRect(0, 0, MAP_W, MAP_H)

    g.lineStyle(1, 0xd4c8b0)
    for (let x = 0; x < MAP_W; x += 64) g.lineBetween(x, 0, x, MAP_H)
    for (let y = 0; y < MAP_H; y += 64) g.lineBetween(0, y, MAP_W, y)

    for (const zone of ZONES) {
      g.lineStyle(2, 0x8b6b4a, 0.3)
      g.strokeCircle(zone.x, zone.y, zone.radius)
      g.fillStyle(0xf0e8d8, 0.5)
      g.fillCircle(zone.x, zone.y, zone.radius)
    }

    this.add.text(MAP_W / 2, 50, 'Town map image not found — run art generation to create assets', {
      fontSize: '14px', color: '#8b6b4a', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)
  }

  private createZoneLabels() {
    for (const zone of ZONES) {
      const label = this.add.text(zone.x, zone.y - zone.radius - 12, zone.name, {
        fontSize: '12px',
        color: '#4a3a2a',
        fontFamily: 'Georgia, serif',
        backgroundColor: '#f5f0e8cc',
        padding: { x: 6, y: 3 },
      }).setOrigin(0.5)
      label.setDepth(10)
    }
  }

  private createAgents() {
    const agents = useGameStore.getState().agents
    for (const agent of agents) {
      const home = AGENT_HOMES[agent.id] || { x: 768, y: 512 }
      const container = this.add.container(home.x, home.y)

      const shadow = this.add.ellipse(0, 24, 36, 12, 0x000000, 0.15)

      let charSprite: Phaser.GameObjects.Image | Phaser.GameObjects.Arc
      if (this.textures.exists(`char-${agent.id}`)) {
        charSprite = this.add.image(0, 0, `char-${agent.id}`)
        charSprite.setDisplaySize(48, 48)
      } else {
        charSprite = this.add.circle(0, 0, 16, 0xffffff)
        ;(charSprite as Phaser.GameObjects.Arc).setStrokeStyle(2, 0x4a3a2a)
      }

      const label = this.add.text(0, -32, agent.name.split(' ')[0], {
        fontSize: '10px', color: '#4a3a2a', fontFamily: 'Georgia, serif',
        backgroundColor: '#f5f0e8dd', padding: { x: 4, y: 2 },
      }).setOrigin(0.5)

      container.add([shadow, charSprite, label])
      container.setSize(48, 48)
      container.setInteractive()
      container.setDepth(20)

      container.on('pointerdown', () => {
        useGameStore.getState().selectAgent(agent.id)
      })

      this.agentSprites.set(agent.id, container)
    }
  }

  private setupCamera() {
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H)
    this.cameras.main.setZoom(1)
    this.cameras.main.centerOn(MAP_W / 2, MAP_H / 2)
  }

  private setupInput() {
    const cursors = this.input.keyboard!.createCursorKeys()
    const cam = this.cameras.main
    const speed = 8

    this.input.on('wheel', (_p: any, _gos: any, _dx: number, dy: number) => {
      const newZoom = Phaser.Math.Clamp(cam.zoom - dy * 0.001, 0.6, 2.5)
      cam.setZoom(newZoom)
    })

    this.events.on('update', () => {
      if (cursors.left.isDown) cam.scrollX -= speed
      if (cursors.right.isDown) cam.scrollX += speed
      if (cursors.up.isDown) cam.scrollY -= speed
      if (cursors.down.isDown) cam.scrollY += speed
    })
  }

  private startTickLoop() {
    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: () => this.simulateTick(),
    })
  }

  private simulateTick() {
    const agents = useGameStore.getState().agents
    const updated = agents.map(a => {
      const home = AGENT_HOMES[a.id] || { x: 768, y: 512 }
      const targetZone = ZONES[Phaser.Math.Between(0, ZONES.length - 1)]
      const useHome = Math.random() > 0.6
      const target = useHome ? home : { x: targetZone.x, y: targetZone.y }
      const newX = Phaser.Math.Clamp(target.x + Phaser.Math.Between(-40, 40), 50, MAP_W - 50)
      const newY = Phaser.Math.Clamp(target.y + Phaser.Math.Between(-40, 40), 50, MAP_H - 50)
      return { ...a, x: newX, y: newY }
    })
    useGameStore.getState().setAgents(updated)

    for (const agent of updated) {
      const sprite = this.agentSprites.get(agent.id)
      if (sprite) {
        this.tweens.add({
          targets: sprite,
          x: agent.x,
          y: agent.y,
          duration: 3000,
          ease: 'Sine.easeInOut',
        })
      }
    }
  }
}
