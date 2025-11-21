import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import './style.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#2d2d2d',
  parent: 'game-container',
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true,
};

// @ts-ignore
let game: Phaser.Game;

// Aggressive cleanup
// @ts-ignore
if (window.game) {
  // @ts-ignore
  window.game.destroy(true);
}

// Also manually clear the container to be sure
const container = document.getElementById('game-container');
if (container) {
    container.innerHTML = '';
}

// Remove any stray canvases in body
document.querySelectorAll('canvas').forEach(canvas => canvas.remove());

game = new Phaser.Game(config);
// @ts-ignore
window.game = game;

// HMR handling
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // @ts-ignore
    if (window.game) {
      // @ts-ignore
      window.game.destroy(true);
    }
  });
}
