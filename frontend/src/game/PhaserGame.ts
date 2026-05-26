import Phaser from 'phaser';
import { CozyTownScene } from './scenes/CozyTownScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 800,
    pixelArt: true,
    backgroundColor: '#87ceeb',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [CozyTownScene],
  };

  return new Phaser.Game(config);
}
