import { TECH_DATA, type TechType, type TechInfo } from '../data/TechData';
import GameScene from '../scenes/GameScene';

export class TechSystem {
  private scene: GameScene;
  private researchedTechs: Set<TechType> = new Set();
  private currentAge: string = 'Dark Age';

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  public isResearched(techId: TechType): boolean {
    return this.researchedTechs.has(techId);
  }

  public getTechInfo(techId: TechType): TechInfo {
    return TECH_DATA[techId];
  }

  public canAfford(techId: TechType): boolean {
    const cost = TECH_DATA[techId].cost;
    const resources = this.scene.resourceCounts;
    return (
      resources.food >= cost.food &&
      resources.wood >= cost.wood &&
      resources.gold >= cost.gold &&
      resources.stone >= cost.stone
    );
  }

  public payCost(techId: TechType) {
    const cost = TECH_DATA[techId].cost;
    this.scene.resourceCounts.food -= cost.food;
    this.scene.resourceCounts.wood -= cost.wood;
    this.scene.resourceCounts.gold -= cost.gold;
    this.scene.resourceCounts.stone -= cost.stone;
    this.scene.updateResourceUI();
  }

  public completeResearch(techId: TechType) {
    this.researchedTechs.add(techId);
    
    // Apply effects
    const tech = TECH_DATA[techId];
    
    if (techId === 'feudal_age') {
      this.currentAge = 'Feudal Age';
      // Notify user?
      console.log("Advanced to Feudal Age!");
    }

    // Apply stat modifiers
    tech.effects.forEach(effect => {
      if (effect.target === 'villager' && effect.stat === 'hp') {
        // Apply to existing villagers
        this.scene.villagers.forEach(v => {
            v.setMaxHp(v.getMaxHp() + effect.value);
            v.setHp(v.getHp() + effect.value);
        });
      }
    });
    
    this.scene.events.emit('techResearched', techId);
  }

  public getCurrentAge(): string {
    return this.currentAge;
  }
}
