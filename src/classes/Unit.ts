import type GameScene from '../scenes/GameScene';

export class Unit extends Phaser.GameObjects.Container {
  private selectionCircle: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Sprite;
  private path: Phaser.Math.Vector2[] = [];
  private currentPathIndex: number = 0;
  private speed: number = 2; // Pixels per frame, roughly
  
  // Combat Stats
  protected maxHp: number = 50;
  protected hp: number = 50;
  protected attackDamage: number = 5;
  protected attackRange: number = 40; // Pixels
  protected attackCooldown: number = 1000; // ms
  protected lastAttackTime: number = 0;
  protected target: Unit | Phaser.GameObjects.Container | null = null; // Generic target

  public getMaxHp(): number { return this.maxHp; }
  public setMaxHp(val: number) { this.maxHp = val; }
  public getHp(): number { return this.hp; }
  public setHp(val: number) { this.hp = val; }

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

  public setPath(path: Phaser.Math.Vector2[]) {
    this.path = path;
    this.currentPathIndex = 0;
  }

  public moveUnitTo(x: number, y: number) {
    const scene = this.scene as GameScene;
    const mapSystem = scene.getMapSystem();
    const pathfinding = scene.getPathfindingSystem();

    if (mapSystem && pathfinding) {
      const start = mapSystem.isoToCartesian(this.x, this.y);
      const end = mapSystem.isoToCartesian(x, y);

      const path = pathfinding.findPath(start.x, start.y, end.x, end.y);
      if (path.length > 0) {
        this.setPath(path);
      } else {
        // Fallback or stop
        this.path = [];
      }
    } else {
      // Fallback if systems not ready
      this.path = [new Phaser.Math.Vector2(x, y)];
      this.currentPathIndex = 0;
    }
  }

  public attackTarget(target: Unit | Phaser.GameObjects.Container) {
    this.target = target;
    this.path = []; // Stop moving to previous location
  }

  public update() {
    // Combat Logic
    if (this.target) {
      // Check if target is dead
      // We need a way to check if target is dead. 
      // For now, check if active or if it has isDead method
      let isDead = false;
      if ('isDead' in this.target && typeof (this.target as any).isDead === 'function') {
        isDead = (this.target as any).isDead();
      } else if (!this.target.active) {
        isDead = true;
      }

      if (isDead) {
        this.target = null;
        return;
      }

      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
      
      if (distance <= this.attackRange) {
        // In range, attack
        this.path = []; // Stop moving
        
        const now = this.scene.time.now;
        if (now - this.lastAttackTime >= this.attackCooldown) {
          this.lastAttackTime = now;
          // Perform attack
          if ('takeDamage' in this.target && typeof (this.target as any).takeDamage === 'function') {
            (this.target as any).takeDamage(this.attackDamage);
            
            // Animation (simple lunge)
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
        // Move towards target
        // Re-calculate path occasionally? For now, just move directly or use pathfinding
        // If using pathfinding, we need to update path as target moves.
        // For simplicity, let's just move directly if close, or re-path if far.
        // Actually, let's just use moveUnitTo but we need to call it repeatedly?
        // Or simpler: just set moveTarget logic here.
        
        if (!this.isMoving()) {
             this.moveUnitTo(this.target.x, this.target.y);
        } else {
            // Check if path end is close to target?
            // If target moved significantly, re-path.
            // For now, simple: if not moving, move to target.
        }
      }
    }

    if (this.path.length > 0 && this.currentPathIndex < this.path.length) {
      const target = this.path[this.currentPathIndex];
      const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
      
      if (distance < 4) {
        this.x = target.x;
        this.y = target.y;
        this.currentPathIndex++;
        
        if (this.currentPathIndex >= this.path.length) {
          this.path = [];
        }
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
        
        // Update depth based on Y position for isometric sorting
        this.setDepth(this.y);
        
        // Flip sprite based on direction
        if (Math.abs(Math.cos(angle)) > 0.1) {
            this.sprite.setFlipX(Math.cos(angle) < 0);
        }
      }
    }
  }

  public isMoving(): boolean {
    return this.path.length > 0;
  }

  public takeDamage(amount: number) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
    // Flash red
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
        this.sprite.clearTint();
    });
  }

  protected die() {
    this.destroy();
  }

  public isDead(): boolean {
    return this.hp <= 0;
  }
}
