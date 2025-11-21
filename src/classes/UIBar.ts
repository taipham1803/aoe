import Phaser from 'phaser';

export class UIBar {
  private _scene: Phaser.Scene;
  private background: Phaser.GameObjects.Graphics;
  private container: Phaser.GameObjects.Container;
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this._scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Create background
    this.background = scene.add.graphics();
    this.background.setScrollFactor(0); // Fixed to camera
    this.background.setDepth(1999);
    this.drawBackground();

    // Create container for UI elements
    this.container = scene.add.container(x, y);
    this.container.setScrollFactor(0); // Fixed to camera
    this.container.setDepth(2000);
  }

  private drawBackground() {
    this.background.clear();
    
    // Set position to ensure it's in screen space
    this.background.setPosition(0, 0);
    
    // Dark background
    this.background.fillStyle(0x1a1a1a, 0.95);
    this.background.fillRect(this.x, this.y, this.width, this.height);
    
    // Gold border
    this.background.lineStyle(3, 0xd4af37, 1);
    this.background.strokeRect(this.x, this.y, this.width, this.height);
    
    // Inner shadow effect
    this.background.lineStyle(1, 0x000000, 0.5);
    this.background.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
  }

  public add(element: Phaser.GameObjects.GameObject) {
    this.container.add(element);
  }

  public clear() {
    this.container.removeAll(true);
  }

  public setVisible(visible: boolean) {
    this.background.setVisible(visible);
    this.container.setVisible(visible);
  }

  public destroy() {
    this.background.destroy();
    this.container.destroy();
  }

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }
}
