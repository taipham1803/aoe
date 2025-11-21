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
  private huntInterval: number = 800; // Faster than gathering
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
    this.villagerState = VillagerState.MOVING;
    this.moveUnitTo(animal.x, animal.y);
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
      this.villagerState = VillagerState.IDLE;
      this.targetAnimal = null;
      return;
    }

    this.gatherTimer += delta;

    if (this.gatherTimer >= this.huntInterval) {
      this.gatherTimer = 0;

      // Kill the animal and get food
      const food = this.targetAnimal.kill();

      if (!this.carriedResource) {
        this.carriedResource = {
          type: ResourceType.FOOD,
          amount: 0
        };
      }

      this.carriedResource.amount += Math.min(food, this.carryCapacity - this.carriedResource.amount);

      // Return to town center with meat
      this.returnToTownCenter();
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

