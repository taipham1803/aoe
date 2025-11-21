export type TechType = 'feudal_age' | 'loom';

export interface TechEffect {
  target: string; // 'villager', 'all', etc.
  stat: string; // 'hp', 'attack', etc.
  value: number; // Additive or multiplier? Let's assume additive for now
}

export interface TechInfo {
  id: TechType;
  name: string;
  cost: { food: number; wood: number; gold: number; stone: number };
  researchTime: number; // ms
  effects: TechEffect[];
  description: string;
}

export const TECH_DATA: Record<TechType, TechInfo> = {
  'feudal_age': {
    id: 'feudal_age',
    name: 'Feudal Age',
    cost: { food: 500, wood: 0, gold: 0, stone: 0 },
    researchTime: 5000, // 5s for testing (usually much longer)
    effects: [],
    description: 'Advance to the Feudal Age. Unlocks new buildings and units.'
  },
  'loom': {
    id: 'loom',
    name: 'Loom',
    cost: { food: 0, wood: 0, gold: 50, stone: 0 },
    researchTime: 3000,
    effects: [
      { target: 'villager', stat: 'hp', value: 15 }
    ],
    description: 'Villagers +15 HP.'
  }
};
