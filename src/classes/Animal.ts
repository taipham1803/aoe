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
  private _isAggressive: boolean = false;
  private hp: number = 20;
  private maxHp: number = 20;
  private isDead: boolean = false;
  private wanderTimer: number = 0;
  private wanderInterval: number = 2000; // Change direction every 2 seconds
  private moveDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private speed: number = 20;
  
  // Combat
  private attackDamage: number = 0;
  private attackRange: number = 0;
  private attackCooldown: number = 1500;
  private lastAttackTime: number = 0;
  private target: any = null; // Unit or Villager

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
        this._isAggressive = true;
        this.speed = 25;
        this.maxHp = 75;
        this.hp = 75;
        this.attackDamage = 8;
        this.attackRange = 30;
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

    // Aggression Logic
    if (this._isAggressive && this.target) {
       this.updateCombat(delta);
       return; // Skip wandering if fighting
    }

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

  private updateCombat(delta: number) {
      if (!this.target || !this.target.active || (this.target.isDead && this.target.isDead())) {
          this.target = null;
          return;
      }

      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

      if (distance <= this.attackRange) {
          // Attack
          const now = this.scene.time.now;
          if (now - this.lastAttackTime >= this.attackCooldown) {
              this.lastAttackTime = now;
              if (this.target.takeDamage) {
                  this.target.takeDamage(this.attackDamage);
                  
                  // Animation
                  this.scene.tweens.add({
                      targets: this.sprite,
                      x: this.sprite.x + (this.target.x - this.x) * 0.2,
                      y: this.sprite.y + (this.target.y - this.y) * 0.2,
                      duration: 100,
                      yoyo: true
                  });
              }
          }
      } else {
          // Chase
          const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
          this.x += Math.cos(angle) * this.speed * (delta / 1000);
          this.y += Math.sin(angle) * this.speed * (delta / 1000);
          
          // Flip sprite
          if (Math.abs(Math.cos(angle)) > 0.1) {
             this.sprite.setFlipX(Math.cos(angle) < 0);
          }
          
          this.setDepth(this.y);
      }
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
    if (this.isDead) return 0;
    this.isDead = true;
    this.sprite.setAlpha(0.5);
    this.sprite.setTint(0x888888); // Grey out
    
    // Destroy after 10 seconds (decay)
    this.scene.time.delayedCall(10000, () => {
        this.destroy();
    });

    return this.food;
  }

  public takeDamage(amount: number, attacker?: any) {
    if (this.isDead) return;
    
    this.hp -= amount;
    
    // Retaliate if aggressive
    if (this._isAggressive && attacker && !this.target) {
        this.target = attacker;
    }
    
    // Flash red
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
        if (!this.isDead) this.sprite.clearTint();
    });

    if (this.hp <= 0) {
      this.hp = 0;
      this.kill();
    }
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

  public getMaxHp(): number {
    return this.maxHp;
  }

  public getHp(): number {
    return this.hp;
  }
}
