import Phaser from 'phaser';

export type AnimalType = 'sheep' | 'deer' | 'boar';

export const AnimalType = {
  SHEEP: 'sheep' as AnimalType,
  DEER: 'deer' as AnimalType,
  BOAR: 'boar' as AnimalType
} as const;

export class Animal extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  // private _animalType: AnimalType; // For future use (AI behavior)
  private food: number = 100;
  // private _isAggressive: boolean = false; // For future use (attack player)
  private isDead: boolean = false;
  private wanderTimer: number = 0;
  private wanderInterval: number = 2000; // Change direction every 2 seconds
  private moveDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private speed: number = 20;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    type: AnimalType
  ) {
    super(scene, x, y);
    // this._animalType = type;

    // Set properties based on type
    switch (type) {
      case AnimalType.SHEEP:
        this.food = 100;
        // this._isAggressive = false;
        this.speed = 15;
        break;
      case AnimalType.DEER:
        this.food = 140;
        // this._isAggressive = false;
        this.speed = 30;
        break;
      case AnimalType.BOAR:
        this.food = 200;
        // this._isAggressive = true;
        this.speed = 25;
        break;
    }

    // Create sprite
    this.sprite = scene.add.sprite(0, -16, texture);
    this.add(this.sprite);

    // Set depth for isometric sorting
    this.setDepth(y);

    scene.add.existing(this);

    // Start with random direction
    this.setRandomDirection();
  }

  public update(delta: number) {
    if (this.isDead) return;

    // Wander behavior
    this.wanderTimer += delta;
    if (this.wanderTimer >= this.wanderInterval) {
      this.wanderTimer = 0;
      this.setRandomDirection();
    }

    // Move
    this.x += this.moveDirection.x * this.speed * (delta / 1000);
    this.y += this.moveDirection.y * this.speed * (delta / 1000);

    // Update depth for isometric sorting
    this.setDepth(this.y);
  }

  private setRandomDirection() {
    // Random chance to stop
    if (Math.random() < 0.3) {
      this.moveDirection.set(0, 0);
    } else {
      const angle = Math.random() * Math.PI * 2;
      this.moveDirection.set(Math.cos(angle), Math.sin(angle));
    }
  }

  public kill(): number {
    this.isDead = true;
    this.sprite.setAlpha(0.5);
    return this.food;
  }

  public getFood(): number {
    return this.food;
  }

  public isKilled(): boolean {
    return this.isDead;
  }

  public getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      this.x - 16,
      this.y - 16,
      32,
      32
    );
  }
}
