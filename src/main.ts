import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import './style.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#2d2d2d',
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true, // Good for pixel art style games like AOE
};

new Phaser.Game(config);
