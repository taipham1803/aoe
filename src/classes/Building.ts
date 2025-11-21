import Phaser from 'phaser';

export type BuildingType = 'house' | 'town_center' | 'barracks' | 'market' | 'mill' | 'farm';

export class Building extends Phaser.GameObjects.Container {
  public static COSTS: Record<BuildingType, { wood?: number; food?: number; gold?: number; stone?: number }> = {
    'house': { wood: 50 },
    'town_center': { wood: 275, stone: 100 },
    'barracks': { wood: 175 },
    'market': { wood: 175 },
    'mill': { wood: 100 },
    'farm': { wood: 60 }
  };

  private sprite: Phaser.GameObjects.Sprite;
  public buildingType: BuildingType;
  private maxHp: number;
  private hp: number;
  public widthInTiles: number = 1;
  public heightInTiles: number = 1;
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
    this.buildingType = _type;
    this.maxHp = maxHp;
    this.hp = 1; // Start with low HP

    // Set size based on type
    switch (_type) {
      case 'town_center':
      case 'barracks':
      case 'market':
        this.widthInTiles = 2;
        this.heightInTiles = 2;
        break;
      default:
        this.widthInTiles = 1;
        this.heightInTiles = 1;
        break;
    }

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

  public takeDamage(amount: number) {
    if (!this.isCompleted) {
        // Double damage if under construction?
        amount *= 2;
    }
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.destroy();
    }
    
    // Flash red
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
        this.sprite.clearTint();
    });
  }

  public isDead(): boolean {
    return this.hp <= 0;
  }

  public getHp(): number {
    return this.hp;
  }

  public getMaxHp(): number {
    return this.maxHp;
  }

  private productionQueue: { type: 'unit' | 'tech'; id: string }[] = [];
  private productionProgress: number = 0;
  private productionDuration: number = 3000; // 3s per unit

  public queueUnit(unitType: string) {
    this.productionQueue.push({ type: 'unit', id: unitType });
  }

  public queueResearch(techId: string) {
    this.productionQueue.push({ type: 'tech', id: techId });
  }

  public update(delta: number) {
     if (this.productionQueue.length > 0) {
       this.productionProgress += delta;
       
       // Different duration for tech?
       // For now use same duration or get from TechData if possible.
       // But Building doesn't know about TechData directly easily without importing.
       // Let's assume standard time for now or pass it in.
       // Actually, let's just use a fixed time or check type.
       
       const currentItem = this.productionQueue[0];
       let duration = this.productionDuration;
       
       if (currentItem.type === 'tech') {
           duration = 5000; // 5s for tech
       }

       if (this.productionProgress >= duration) {
         const item = this.productionQueue.shift();
         this.productionProgress = 0;
         
         if (item) {
             if (item.type === 'unit') {
                 this.scene.events.emit('unitCreated', { type: item.id, x: this.x, y: this.y });
             } else if (item.type === 'tech') {
                 // Complete research
                 // We need to access TechSystem. 
                 // Ideally GameScene listens to event or we call method.
                 // Let's emit event.
                 // Actually TechSystem handles logic.
                 // Let's emit 'researchComplete'
                 (this.scene as any).techSystem.completeResearch(item.id);
             }
         }
       }
     }
  }
}
