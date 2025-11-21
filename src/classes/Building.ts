import Phaser from 'phaser';

export type BuildingType = 'house' | 'town_center' | 'barracks' | 'market' | 'mill' | 'farm';

export class Building extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  // private buildingType: BuildingType; // Unused for now
  private maxHp: number;
  private hp: number;
  private constructionProgress: number = 0; // 0 to 100
  private isCompleted: boolean = false;
  private selectionCircle: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    _type: BuildingType,
    maxHp: number = 1000
  ) {
    super(scene, x, y);
    // this.buildingType = type;
    this.maxHp = maxHp;
    this.hp = 1; // Start with low HP

    // Selection circle
    this.selectionCircle = scene.add.graphics();
    this.selectionCircle.lineStyle(2, 0x00ff00);
    this.selectionCircle.strokeEllipse(0, 0, 64, 32); // Adjust size based on building
    this.selectionCircle.setVisible(false);
    this.add(this.selectionCircle);

    // Sprite
    this.sprite = scene.add.sprite(0, -24, texture); // Offset
    this.sprite.setAlpha(0.5); // Transparent when under construction
    this.add(this.sprite);

    scene.add.existing(this);
    
    // Interaction
    this.setSize(64, 64);
    this.setInteractive(new Phaser.Geom.Rectangle(-32, -48, 64, 64), Phaser.Geom.Rectangle.Contains);
  }

  public construct(amount: number): boolean {
    if (this.isCompleted) return true;

    this.constructionProgress += amount;
    this.hp = Math.min(this.maxHp, this.hp + amount * 10); // HP increases with construction

    if (this.constructionProgress >= 100) {
      this.constructionProgress = 100;
      this.isCompleted = true;
      this.sprite.setAlpha(1); // Fully visible
      this.hp = this.maxHp;
      return true;
    }

    return false;
  }

  public isConstructed(): boolean {
    return this.isCompleted;
  }

  public select() {
    this.selectionCircle.setVisible(true);
  }

  public deselect() {
    this.selectionCircle.setVisible(false);
  }
}
