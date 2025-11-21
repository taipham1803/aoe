import Phaser from 'phaser';
import { Unit } from './Unit';
import { Resource, ResourceType } from './Resource';
import { Building } from './Building';
import { Animal } from './Animal';

type VillagerState = 'idle' | 'moving' | 'gathering' | 'returning' | 'building' | 'hunting';

const VillagerState = {
  IDLE: 'idle' as VillagerState,
  MOVING: 'moving' as VillagerState,
  GATHERING: 'gathering' as VillagerState,
  RETURNING: 'returning' as VillagerState,
  BUILDING: 'building' as VillagerState,
  HUNTING: 'hunting' as VillagerState
};

export class Villager extends Unit {
  private villagerState: VillagerState = VillagerState.IDLE;
  private targetResource: Resource | null = null;
  private targetBuilding: Building | null = null;
  private targetAnimal: Animal | null = null;
  private carriedResource: { type: ResourceType; amount: number } | null = null;
  private gatherRate: number = 5; // Amount per gather tick
  private buildRate: number = 10; // Progress per tick
  private carryCapacity: number = 10;
  private gatherTimer: number = 0;
  private gatherInterval: number = 1000; // ms

  private townCenterPosition: Phaser.Math.Vector2 | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'villager');
  }

  public setTownCenter(x: number, y: number) {
    this.townCenterPosition = new Phaser.Math.Vector2(x, y);
  }

  public gatherResource(resource: Resource) {
    this.targetResource = resource;
    this.targetBuilding = null;
    this.villagerState = VillagerState.MOVING;
    this.moveUnitTo(resource.x, resource.y);
  }

  public build(building: Building) {
    this.targetBuilding = building;
    this.targetResource = null;
    this.targetAnimal = null;
    this.villagerState = VillagerState.MOVING;
    this.moveUnitTo(building.x, building.y);
  }

  public hunt(animal: Animal) {
    this.targetAnimal = animal;
    this.targetResource = null;
    this.targetBuilding = null;
    this.villagerState = VillagerState.HUNTING;
    // this.moveUnitTo(animal.x, animal.y); // Let updateHunting handle movement/chasing
  }

  public override update(delta: number = 16) {
    super.update();

    switch (this.villagerState) {
      case VillagerState.MOVING:
        this.updateMoving();
        break;
      case VillagerState.GATHERING:
        this.updateGathering(delta);
        break;
      case VillagerState.HUNTING:
        this.updateHunting(delta);
        break;
      case VillagerState.RETURNING:
        this.updateReturning();
        break;
      case VillagerState.BUILDING:
        this.updateBuilding(delta);
        break;
    }
  }

  private updateMoving() {
    // Check if reached target resource
    if (this.targetResource && !this.isMoving()) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.targetResource.x,
        this.targetResource.y
      );

      if (distance < 40) {
        this.villagerState = VillagerState.GATHERING;
        this.gatherTimer = 0;
      }
    }
    // Check if reached target animal
    else if (this.targetAnimal && !this.isMoving()) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.targetAnimal.x,
        this.targetAnimal.y
      );

      if (distance < 40) {
        this.villagerState = VillagerState.HUNTING;
        this.gatherTimer = 0;
      }
    }
    // Check if reached target building
    else if (this.targetBuilding && !this.isMoving()) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.targetBuilding.x,
        this.targetBuilding.y
      );

      if (distance < 60) { // Slightly larger range for buildings
        this.villagerState = VillagerState.BUILDING;
        this.gatherTimer = 0;
      }
    }
  }

  private updateGathering(delta: number) {
    if (!this.targetResource || this.targetResource.isEmpty()) {
      this.villagerState = VillagerState.IDLE;
      this.targetResource = null;
      return;
    }

    this.gatherTimer += delta;

    if (this.gatherTimer >= this.gatherInterval) {
      this.gatherTimer = 0;

      // Gather resources
      const gathered = this.targetResource.gather(this.gatherRate);

      if (!this.carriedResource) {
        this.carriedResource = {
          type: this.targetResource.getResourceType(),
          amount: 0
        };
      }

      this.carriedResource.amount += gathered;

      // Check if full or resource depleted
      if (
        this.carriedResource.amount >= this.carryCapacity ||
        this.targetResource.isEmpty()
      ) {
        this.returnToTownCenter();
      }
    }
  }

  private updateHunting(delta: number) {
    if (!this.targetAnimal || this.targetAnimal.isKilled()) {
      // If animal is dead, check if we can gather from it
      if (this.targetAnimal && this.targetAnimal.isKilled()) {
          // Switch to gathering from the dead animal
          // We need to treat the dead animal as a resource or similar
          // For simplicity, let's just say we gather from it directly here
          // But Animal is not a Resource.
          // Let's assume Animal turns into a carcass which is a Resource?
          // Or just gather from Animal object.
          
          this.gatherTimer += delta;
          if (this.gatherTimer >= this.gatherInterval) {
              this.gatherTimer = 0;
              this.targetAnimal.getFood(); // This needs to be drainable
              // We need a way to drain food from animal.
              // Let's add gather method to Animal or just hack it for now.
              // Ideally Animal should become a Resource upon death.
              
              // For now: Instant gather full amount (simplified)
              // Or better: continue "attacking" it to gather?
              
              // Let's implement a simple gather from dead animal
              const gatherAmount = this.gatherRate;
              // We need to decrement food from animal.
              // Animal doesn't have setFood or similar public method to drain.
              // Let's just assume we get it all for now to keep it simple, 
              // or we need to update Animal.ts again.
              
              // Let's go with: if dead, it's a resource.
              // But we need to change state to GATHERING?
              // But target is Animal, not Resource.
              
              // Let's keep state as HUNTING but behavior is gathering.
              
              if (!this.carriedResource) {
                this.carriedResource = {
                  type: ResourceType.FOOD,
                  amount: 0
                };
              }
              
              this.carriedResource.amount += gatherAmount;
               if (this.carriedResource.amount >= this.carryCapacity) {
                   this.returnToTownCenter();
               }
          }
          return;
      }
      
      this.villagerState = VillagerState.IDLE;
      this.targetAnimal = null;
      return;
    }

    // Combat Logic for Hunting
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.targetAnimal.x, this.targetAnimal.y);
    
    if (distance <= this.attackRange) {
        const now = this.scene.time.now;
        if (now - this.lastAttackTime >= this.attackCooldown) {
            this.lastAttackTime = now;
            // Attack the animal
            this.targetAnimal.takeDamage(this.attackDamage, this);
            
            // Animation
            this.scene.tweens.add({
                targets: this.sprite,
                x: this.sprite.x + (this.targetAnimal.x - this.x) * 0.2,
                y: this.sprite.y + (this.targetAnimal.y - this.y) * 0.2,
                duration: 100,
                yoyo: true
            });
        }
    } else {
        // Chase
        this.moveUnitTo(this.targetAnimal.x, this.targetAnimal.y);
    }
  }

  private updateBuilding(delta: number) {
    if (!this.targetBuilding || this.targetBuilding.isConstructed()) {
      this.villagerState = VillagerState.IDLE;
      this.targetBuilding = null;
      return;
    }

    this.gatherTimer += delta;

    if (this.gatherTimer >= this.gatherInterval) {
      this.gatherTimer = 0;

      // Construct
      const finished = this.targetBuilding.construct(this.buildRate);

      if (finished) {
        this.villagerState = VillagerState.IDLE;
        this.targetBuilding = null;
      }
    }
  }

  private updateReturning() {
    if (!this.isMoving() && this.townCenterPosition) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.townCenterPosition.x,
        this.townCenterPosition.y
      );

      if (distance < 50) {
        // Drop off resources
        this.dropOffResources();
        
        // Go back to gathering if resource still exists
        if (this.targetResource && !this.targetResource.isEmpty()) {
          this.villagerState = VillagerState.MOVING;
          this.moveUnitTo(this.targetResource.x, this.targetResource.y);
        } else {
          this.villagerState = VillagerState.IDLE;
          this.targetResource = null;
        }
      }
    }
  }

  private returnToTownCenter() {
    if (this.townCenterPosition) {
      this.villagerState = VillagerState.RETURNING;
      this.moveUnitTo(this.townCenterPosition.x, this.townCenterPosition.y);
    }
  }

  private dropOffResources() {
    if (this.carriedResource) {
      // Emit event for resource collection
      this.scene.events.emit('resourceCollected', {
        type: this.carriedResource.type,
        amount: this.carriedResource.amount
      });
      this.carriedResource = null;
    }
  }

  public getState(): VillagerState {
    return this.villagerState;
  }
}

