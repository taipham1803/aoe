import Phaser from 'phaser';
import { Unit } from './Unit';

export class Militia extends Unit {
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'militia');
    
    this.maxHp = 60;
    this.hp = 60;
    this.attackDamage = 6;
    this.attackRange = 40; // Close range
    this.attackCooldown = 1000;
  }

  public override update() {
    super.update();
    
    // State machine logic
    // ...
  }
}
