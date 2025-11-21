import Phaser from 'phaser';

export type ResourceType = 'wood' | 'food' | 'gold' | 'stone';

export const ResourceType = {
  WOOD: 'wood' as ResourceType,
  FOOD: 'food' as ResourceType,
  GOLD: 'gold' as ResourceType,
  STONE: 'stone' as ResourceType
};

export class Resource extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private resourceType: ResourceType;
  private amount: number;
  private maxAmount: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    resourceType: ResourceType,
    amount: number = 500
  ) {
    super(scene, x, y);
    this.resourceType = resourceType;
    this.amount = amount;
    this.maxAmount = amount;

    // Create resource sprite
    this.sprite = scene.add.sprite(0, -16, texture);
    this.add(this.sprite);

    // Add container to scene
    scene.add.existing(this);

    // Set size for interaction
    this.setSize(32, 32);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-16, -32, 32, 32),
      Phaser.Geom.Rectangle.Contains
    );
  }

  public gather(gatherAmount: number): number {
    const gathered = Math.min(gatherAmount, this.amount);
    this.amount -= gathered;

    // Update visual based on remaining amount
    const ratio = this.amount / this.maxAmount;
    this.sprite.setAlpha(0.5 + ratio * 0.5);

    if (this.amount <= 0) {
      this.destroy();
    }

    return gathered;
  }

  public getResourceType(): ResourceType {
    return this.resourceType;
  }

  public getAmount(): number {
    return this.amount;
  }

  public isEmpty(): boolean {
    return this.amount <= 0;
  }
}
