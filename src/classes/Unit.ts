import Phaser from 'phaser';

export class Unit extends Phaser.GameObjects.Container {
  private selectionCircle: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Sprite;
  private moveTarget: Phaser.Math.Vector2 | null = null;
  private speed: number = 2; // Pixels per frame, roughly

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y);

    // Create selection circle (hidden by default)
    this.selectionCircle = scene.add.graphics();
    this.selectionCircle.lineStyle(2, 0x00ff00);
    this.selectionCircle.strokeEllipse(0, 0, 32, 16); // Isometric circle
    this.selectionCircle.setVisible(false);
    this.add(this.selectionCircle);

    // Create unit sprite
    this.sprite = scene.add.sprite(0, -16, texture); // Offset to stand on tile center
    this.add(this.sprite);

    // Add container to scene
    scene.add.existing(this);
    
    // Set size for interaction
    this.setSize(32, 32);
    this.setInteractive(new Phaser.Geom.Rectangle(-16, -32, 32, 32), Phaser.Geom.Rectangle.Contains);
  }

  public select() {
    this.selectionCircle.setVisible(true);
  }

  public deselect() {
    this.selectionCircle.setVisible(false);
  }

  public moveUnitTo(x: number, y: number) {
    this.moveTarget = new Phaser.Math.Vector2(x, y);
  }

  public update() {
    if (this.moveTarget) {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.moveTarget.x, this.moveTarget.y);
      
      if (distance < 4) {
        this.x = this.moveTarget.x;
        this.y = this.moveTarget.y;
        this.moveTarget = null;
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.moveTarget.x, this.moveTarget.y);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
        
        // Update depth based on Y position for isometric sorting
        this.setDepth(this.y);
      }
    }
  }

  public isMoving(): boolean {
    return this.moveTarget !== null;
  }
}
