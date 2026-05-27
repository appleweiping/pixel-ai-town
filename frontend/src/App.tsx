import { useEffect, useRef } from 'react'
import * as Phaser from 'phaser'
import { TownScene } from './game/TownScene'
import { DialoguePanel } from './ui/DialoguePanel'
import { useGameStore } from './store/gameStore'
import './App.css'

function App() {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedAgent = useGameStore(s => s.selectedAgent)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      pixelArt: false,
      backgroundColor: '#f5f0e8',
      scene: [TownScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    })

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <div className="game-container">
      <div ref={containerRef} className="phaser-canvas" />
      {selectedAgent && <DialoguePanel agentId={selectedAgent} />}
      <div className="hud">
        <span className="hud-title">Agent Town</span>
        <span className="hud-sep">|</span>
        <span className="hud-item">Click to move</span>
        <span className="hud-sep">|</span>
        <span className="hud-item">Click agent to chat</span>
      </div>
    </div>
  )
}

export default App
