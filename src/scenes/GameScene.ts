import Phaser from 'phaser';
import { MapSystem } from '../systems/MapSystem';
import { Unit } from '../classes/Unit';
import { Villager } from '../classes/Villager';
import { Resource, ResourceType } from '../classes/Resource';
import { Building, type BuildingType } from '../classes/Building';
import { Animal, AnimalType } from '../classes/Animal';
import { Militia } from '../classes/Militia';
import { Minimap } from '../components/Minimap';
import { PathfindingSystem } from '../systems/PathfindingSystem';

export default class GameScene extends Phaser.Scene {
  private mapSystem!: MapSystem;
  private pathfindingSystem!: PathfindingSystem;
  private minimap!: Minimap;
  private units: Unit[] = [];
  public villagers: Villager[] = [];
  private resources: Resource[] = [];
  private buildings: Building[] = [];
  private animals: Animal[] = [];
  private selectedUnits: Unit[] = [];
  private selectedBuilding: Building | null = null;
  private selectionGraphics!: Phaser.GameObjects.Graphics;
  private isDragging: boolean = false;
  private dragStart: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  
  // Economy
  public resourceCounts = {
    wood: 200,
    food: 200,
    gold: 100,
    stone: 100
  };
  private currentPopulation: number = 0;
  private maxPopulation: number = 5; // Base 5 from Town Center
  private townCenterPos!: Phaser.Math.Vector2;

  // ... (rest of properties)



  // Building System
  private placingBuilding: { type: BuildingType; ghost: Phaser.GameObjects.Sprite } | null = null;
  private buildButton!: Phaser.GameObjects.Text;
  private buildingButtons: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('GameScene');
  }

  preload() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Grass Tile (Rich Green with texture)
    graphics.fillStyle(0x4a9d3f);
    graphics.beginPath();
    graphics.moveTo(32, 0);
    graphics.lineTo(64, 16);
    graphics.lineTo(32, 32);
    graphics.lineTo(0, 16);
    graphics.closePath();
    graphics.fillPath();
    
    // Add grass texture details
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(8, 56);
      const y = Phaser.Math.Between(4, 28);
      graphics.fillStyle(0x3d8534, 0.3);
      graphics.fillCircle(x, y, 1);
    }
    
    graphics.lineStyle(1, 0x3d8534);
    graphics.strokePath();
    graphics.generateTexture('tile', 64, 32);

    // Sand Tile (Beach/Desert)
    graphics.clear();
    graphics.fillStyle(0xd4a574);
    graphics.beginPath();
    graphics.moveTo(32, 0);
    graphics.lineTo(64, 16);
    graphics.lineTo(32, 32);
    graphics.lineTo(0, 16);
    graphics.closePath();
    graphics.fillPath();
    
    // Add sand texture
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(8, 56);
      const y = Phaser.Math.Between(4, 28);
      graphics.fillStyle(0xc49563, 0.4);
      graphics.fillCircle(x, y, 1);
    }
    
    graphics.lineStyle(1, 0xc49563);
    graphics.strokePath();
    graphics.generateTexture('sand', 64, 32);

    // Water Tile (Deep Blue with waves)
    graphics.clear();
    graphics.fillStyle(0x2b5a9e);
    graphics.beginPath();
    graphics.moveTo(32, 0);
    graphics.lineTo(64, 16);
    graphics.lineTo(32, 32);
    graphics.lineTo(0, 16);
    graphics.closePath();
    graphics.fillPath();
    
    // Add water shimmer
    graphics.fillStyle(0x4a7bc4, 0.3);
    graphics.fillRect(10, 8, 20, 3);
    graphics.fillRect(35, 18, 15, 2);
    
    graphics.lineStyle(1, 0x1e4a7d);
    graphics.strokePath();
    graphics.generateTexture('water', 64, 32);

    // Shore Tile (Transition)
    graphics.clear();
    graphics.fillStyle(0xc4a574);
    graphics.beginPath();
    graphics.moveTo(32, 0);
    graphics.lineTo(64, 16);
    graphics.lineTo(32, 32);
    graphics.lineTo(0, 16);
    graphics.closePath();
    graphics.fillPath();
    
    // Add water edge
    graphics.fillStyle(0x3b6ba8, 0.5);
    graphics.fillRect(0, 16, 64, 8);
    
    graphics.lineStyle(1, 0xa48d5d);
    graphics.strokePath();
    graphics.generateTexture('shore', 64, 32);

    // Villager texture (brown with shadow)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillEllipse(16, 26, 12, 6);
    // Body
    graphics.fillStyle(0x8B4513);
    graphics.fillCircle(16, 16, 10);
    // Head
    graphics.fillStyle(0xD2691E);
    graphics.fillCircle(16, 12, 6);
    graphics.generateTexture('villager', 32, 32);

    // Tree texture (Detailed with shadow)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(16, 28, 16, 8);
    // Trunk
    graphics.fillStyle(0x654321);
    graphics.fillRect(14, 12, 4, 12);
    // Foliage (layered)
    graphics.fillStyle(0x1a5f1a);
    graphics.fillCircle(16, 10, 14);
    graphics.fillStyle(0x228B22);
    graphics.fillCircle(16, 8, 12);
    graphics.fillStyle(0x2d9e2d);
    graphics.fillCircle(16, 6, 10);
    graphics.generateTexture('tree', 32, 32);

    // Palm Tree
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(16, 28, 14, 6);
    // Trunk
    graphics.fillStyle(0x8B7355);
    graphics.fillRect(14, 8, 4, 20);
    // Leaves
    graphics.fillStyle(0x228B22);
    graphics.fillEllipse(16, 6, 18, 8);
    graphics.fillEllipse(8, 8, 12, 6);
    graphics.fillEllipse(24, 8, 12, 6);
    graphics.generateTexture('palm', 32, 32);

    // Berry bush (Detailed with berries)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(16, 26, 14, 6);
    // Bush
    graphics.fillStyle(0x2d6b2d);
    graphics.fillCircle(16, 16, 11);
    graphics.fillStyle(0x3a8a3a);
    graphics.fillCircle(16, 14, 9);
    // Berries
    graphics.fillStyle(0xDC143C);
    graphics.fillCircle(12, 12, 3);
    graphics.fillCircle(20, 12, 3);
    graphics.fillCircle(16, 18, 3);
    graphics.fillCircle(10, 16, 2);
    graphics.fillCircle(22, 16, 2);
    graphics.generateTexture('berry', 32, 32);

    // Gold mine (Shiny with rocks)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillEllipse(16, 26, 18, 8);
    // Rock base
    graphics.fillStyle(0x8B8B8B);
    graphics.fillCircle(16, 16, 14);
    // Gold veins
    graphics.fillStyle(0xFFD700);
    graphics.fillCircle(12, 14, 6);
    graphics.fillCircle(20, 16, 5);
    graphics.fillCircle(16, 20, 4);
    // Highlights
    graphics.fillStyle(0xFFF8DC);
    graphics.fillCircle(12, 12, 2);
    graphics.fillCircle(20, 14, 2);
    graphics.generateTexture('gold', 32, 32);

    // Stone mine (Rocky with depth)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillEllipse(16, 26, 18, 8);
    // Rocks
    graphics.fillStyle(0x696969);
    graphics.fillCircle(16, 16, 13);
    graphics.fillStyle(0x808080);
    graphics.fillCircle(14, 14, 8);
    graphics.fillCircle(20, 18, 7);
    graphics.fillStyle(0x989898);
    graphics.fillCircle(16, 12, 5);
    graphics.generateTexture('stone', 32, 32);

    // Town Center (Asian style with roof)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillEllipse(24, 52, 50, 12);
    // Base
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(0, 24, 48, 24);
    // Roof
    graphics.fillStyle(0x4169E1);
    graphics.beginPath();
    graphics.moveTo(24, 8);
    graphics.lineTo(52, 20);
    graphics.lineTo(48, 26);
    graphics.lineTo(0, 26);
    graphics.lineTo(-4, 20);
    graphics.closePath();
    graphics.fillPath();
    // Roof details
    graphics.fillStyle(0x5a8fd4);
    graphics.fillRect(0, 24, 48, 2);
    // Door
    graphics.fillStyle(0x654321);
    graphics.fillRect(18, 32, 12, 16);
    graphics.generateTexture('townCenter', 48, 48);

    // House (Small Asian style)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillEllipse(16, 36, 34, 8);
    // Base
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(0, 16, 32, 16);
    // Roof
    graphics.fillStyle(0x654321);
    graphics.beginPath();
    graphics.moveTo(16, 4);
    graphics.lineTo(36, 14);
    graphics.lineTo(32, 18);
    graphics.lineTo(0, 18);
    graphics.lineTo(-4, 14);
    graphics.closePath();
    graphics.fillPath();
    // Door
    graphics.fillStyle(0x4a3621);
    graphics.fillRect(12, 20, 8, 12);
    graphics.generateTexture('house', 32, 32);

    // Barracks (Military building)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillEllipse(20, 44, 42, 10);
    // Base
    graphics.fillStyle(0x696969);
    graphics.fillRect(0, 16, 40, 24);
    // Roof
    graphics.fillStyle(0x8B0000);
    graphics.beginPath();
    graphics.moveTo(20, 4);
    graphics.lineTo(44, 14);
    graphics.lineTo(40, 18);
    graphics.lineTo(0, 18);
    graphics.lineTo(-4, 14);
    graphics.closePath();
    graphics.fillPath();
    // Door
    graphics.fillStyle(0x4a3621);
    graphics.fillRect(15, 24, 10, 16);
    graphics.generateTexture('barracks', 40, 40);

    // Market
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillEllipse(20, 44, 42, 10);
    // Base
    graphics.fillStyle(0xDAA520);
    graphics.fillRect(0, 16, 40, 24);
    // Roof
    graphics.fillStyle(0xFF8C00);
    graphics.beginPath();
    graphics.moveTo(20, 4);
    graphics.lineTo(44, 14);
    graphics.lineTo(40, 18);
    graphics.lineTo(0, 18);
    graphics.lineTo(-4, 14);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('market', 40, 40);

    // Mill
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillEllipse(16, 36, 34, 8);
    // Base
    graphics.fillStyle(0xA0522D);
    graphics.fillRect(4, 16, 24, 20);
    // Roof (cone)
    graphics.fillStyle(0x8B4513);
    graphics.beginPath();
    graphics.moveTo(16, 4);
    graphics.lineTo(32, 16);
    graphics.lineTo(0, 16);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('mill', 32, 32);

    // Farm (field with crops)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(16, 30, 30, 6);
    // Field
    graphics.fillStyle(0x8B7355);
    graphics.fillRect(0, 8, 32, 20);
    // Crops (green dots)
    graphics.fillStyle(0x228B22);
    for (let i = 0; i < 12; i++) {
      const x = 4 + (i % 4) * 8;
      const y = 10 + Math.floor(i / 4) * 6;
      graphics.fillCircle(x, y, 2);
    }
    graphics.generateTexture('farm', 32, 32);

    // Sheep (white fluffy)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(16, 26, 14, 6);
    // Body
    graphics.fillStyle(0xF5F5F5);
    graphics.fillCircle(16, 16, 10);
    graphics.fillCircle(12, 16, 8);
    graphics.fillCircle(20, 16, 8);
    // Head
    graphics.fillStyle(0xE8E8E8);
    graphics.fillCircle(16, 12, 6);
    // Legs
    graphics.fillStyle(0x696969);
    graphics.fillRect(12, 20, 2, 6);
    graphics.fillRect(18, 20, 2, 6);
    graphics.generateTexture('sheep', 32, 32);

    // Deer (brown with antlers)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(16, 26, 16, 6);
    // Body
    graphics.fillStyle(0x8B4513);
    graphics.fillCircle(16, 16, 9);
    graphics.fillEllipse(16, 14, 10, 12);
    // Head
    graphics.fillStyle(0xA0522D);
    graphics.fillCircle(16, 10, 5);
    // Antlers
    graphics.lineStyle(2, 0x654321);
    graphics.beginPath();
    graphics.moveTo(14, 8);
    graphics.lineTo(12, 4);
    graphics.moveTo(18, 8);
    graphics.lineTo(20, 4);
    graphics.strokePath();
    graphics.lineStyle(1, 0x000000, 0); // Reset line style
    // Legs
    graphics.fillStyle(0x654321);
    graphics.fillRect(12, 20, 2, 6);
    graphics.fillRect(18, 20, 2, 6);
    graphics.generateTexture('deer', 32, 32);

    // Boar (dark brown, aggressive)
    graphics.clear();
    // Shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillEllipse(16, 26, 18, 7);
    // Body
    graphics.fillStyle(0x3d2817);
    graphics.fillCircle(16, 16, 11);
    graphics.fillEllipse(16, 14, 12, 14);
    // Head
    graphics.fillStyle(0x4a3621);
    graphics.fillCircle(16, 10, 6);
    // Tusks
    graphics.fillStyle(0xFFF8DC);
    graphics.fillRect(12, 12, 2, 4);
    graphics.fillRect(18, 12, 2, 4);
    // Legs
    graphics.fillStyle(0x2d1f12);
    graphics.fillRect(11, 20, 3, 6);
    graphics.fillRect(18, 20, 3, 6);
    graphics.generateTexture('boar', 32, 32);
  }

  create() {
    // Initialize HTML UI elements
    const resourcesDisplay = document.getElementById('resources-display');
    const ageDisplay = document.getElementById('age-display');
    const selectionNameDisplay = document.getElementById('selection-name');
    const selectionHPDisplay = document.getElementById('selection-hp');
    const actionButtonsContainer = document.getElementById('action-buttons');
    
    if (!resourcesDisplay || !ageDisplay || !selectionNameDisplay || !selectionHPDisplay || !actionButtonsContainer) {
      console.error('HTML UI elements not found!');
      return;
    }
    
    // Store references
    (this as any).resourcesDisplay = resourcesDisplay;
    (this as any).ageDisplay = ageDisplay;
    (this as any).selectionNameDisplay = selectionNameDisplay;
    (this as any).selectionHPDisplay = selectionHPDisplay;
    (this as any).actionButtonsContainer = actionButtonsContainer;

    // Initialize Map System (50x50 Map)
    const mapSize = 50;
    this.mapSystem = new MapSystem(this, mapSize, mapSize, 64, 32);
    this.mapSystem.createIsoMap();

    // Initialize Pathfinding System
    this.pathfindingSystem = new PathfindingSystem(this.mapSystem);

    // Generate varied terrain
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        // Create water body in one corner
        const distFromWater = Math.sqrt((x - 10) ** 2 + (y - 10) ** 2);
        
        if (distFromWater < 8) {
          // Deep water
          this.mapSystem.setTileTexture(x, y, 'water');
        } else if (distFromWater < 10) {
          // Shore
          this.mapSystem.setTileTexture(x, y, 'shore');
        } else if (distFromWater < 13) {
          // Sand beach
          this.mapSystem.setTileTexture(x, y, 'sand');
        }
        
        // Add river
        const riverY = Math.floor(mapSize / 2 + Math.sin(x / 5) * 5);
        if (y === riverY) {
          this.mapSystem.setTileTexture(x, y, 'water');
        } else if (y === riverY - 1 || y === riverY + 1) {
          this.mapSystem.setTileTexture(x, y, 'shore');
        } else if (y === riverY - 2 || y === riverY + 2) {
          this.mapSystem.setTileTexture(x, y, 'sand');
        }
      }
    }

    // Create Town Center (Centered)
    const tcX = 25;
    const tcY = 25;
    const tcPos = this.mapSystem.cartesianToIso(tcX, tcY);
    this.townCenterPos = new Phaser.Math.Vector2(tcPos.isoX, tcPos.isoY);
    
    const tc = new Building(this, tcPos.isoX, tcPos.isoY, 'townCenter', 'town_center');
    tc.construct(100);
    this.buildings.push(tc);

    // Create villagers around TC
    this.spawnVillager(tcX - 1, tcY + 1);
    this.spawnVillager(tcX + 1, tcY + 1);
    this.spawnVillager(tcX, tcY + 2);
    this.spawnVillager(tcX - 1, tcY - 1);
    this.spawnVillager(tcX + 1, tcY - 1);

    // Generate Resources with variety
    // Forest clusters (regular trees)
    this.generateResourceCluster(tcX - 6, tcY - 6, 'tree', ResourceType.WOOD, 15);
    this.generateResourceCluster(tcX + 6, tcY - 6, 'tree', ResourceType.WOOD, 12);
    this.generateResourceCluster(tcX - 8, tcY + 8, 'tree', ResourceType.WOOD, 18);
    
    // Palm trees near beaches
    this.generateResourceCluster(15, 15, 'palm', ResourceType.WOOD, 8);
    this.generateResourceCluster(12, 8, 'palm', ResourceType.WOOD, 6);

    // Berry Bushes
    this.generateResourceCluster(tcX + 4, tcY + 4, 'berry', ResourceType.FOOD, 8);
    this.generateResourceCluster(tcX - 3, tcY + 5, 'berry', ResourceType.FOOD, 6);

    // Gold Mines
    this.generateResourceCluster(tcX - 7, tcY + 2, 'gold', ResourceType.GOLD, 5);
    this.generateResourceCluster(tcX + 8, tcY - 3, 'gold', ResourceType.GOLD, 4);

    // Stone Mines
    this.generateResourceCluster(tcX + 7, tcY + 7, 'stone', ResourceType.STONE, 5);
    this.generateResourceCluster(tcX - 6, tcY - 8, 'stone', ResourceType.STONE, 4);

    // Spawn Animals
    // Sheep (peaceful, near town)
    this.spawnAnimal(tcX + 3, tcY - 3, 'sheep', AnimalType.SHEEP);
    this.spawnAnimal(tcX + 4, tcY - 2, 'sheep', AnimalType.SHEEP);
    this.spawnAnimal(tcX + 5, tcY - 3, 'sheep', AnimalType.SHEEP);
    
    // Deer (in forests)
    this.spawnAnimal(tcX - 7, tcY - 7, 'deer', AnimalType.DEER);
    this.spawnAnimal(tcX - 5, tcY - 8, 'deer', AnimalType.DEER);
    this.spawnAnimal(tcX + 7, tcY - 8, 'deer', AnimalType.DEER);
    this.spawnAnimal(tcX + 8, tcY - 7, 'deer', AnimalType.DEER);
    
    // Boar (scattered)
    this.spawnAnimal(tcX - 10, tcY + 5, 'boar', AnimalType.BOAR);
    this.spawnAnimal(tcX + 10, tcY + 3, 'boar', AnimalType.BOAR);
    this.spawnAnimal(tcX + 2, tcY + 10, 'boar', AnimalType.BOAR);

    // Setup camera
    this.cameras.main.centerOn(tcPos.isoX, tcPos.isoY);
    this.cameras.main.setZoom(1);

    // Initialize Minimap
    const mapWidth = this.mapSystem.getWidth() * 64; // tile width
    const mapHeight = this.mapSystem.getHeight() * 32; // tile height
    this.minimap = new Minimap(this, mapWidth, mapHeight);

    // Selection Graphics
    this.selectionGraphics = this.add.graphics();
    this.selectionGraphics.setDepth(1000);

    // Resource collection event
    this.events.on('resourceCollected', (data: { type: ResourceType; amount: number }) => {
      this.resourceCounts[data.type] += data.amount;
      this.updateResourceUI();
    });

    // Unit creation event
    this.events.on('unitCreated', (data: { type: string; x: number; y: number }) => {
      this.spawnUnit(data.type, data.x, data.y);
    });

    // Input Handling
    this.input.mouse?.disableContextMenu();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.handleRightClick(pointer);
      } else {
        this.handleLeftClick(pointer);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerMove(pointer);
    });

    this.input.on('pointerup', () => {
      this.handlePointerUp();
    });

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number, _deltaZ: number) => {
      const zoom = this.cameras.main.zoom - deltaY * 0.001;
      this.cameras.main.setZoom(Phaser.Math.Clamp(zoom, 0.5, 2));
    });

    // UI
    this.add.text(10, 10, 'AOE Clone - Phase 3: Building', { 
      color: '#ffffff', 
      fontSize: '20px',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(2000);

    this.add.text(10, 40, 'Left Click: Select | Right Click: Move/Gather/Build', { 
      color: '#cccccc', 
      fontSize: '14px',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(2000);

    // Update HTML resource display
    this.updateResourceUI();
    this.updatePopulationUI();

    // Building Menu (Hidden by default)
    const buildMenuX = 10;
    const buildMenuY = 100;
    const buttonSpacing = 35;

    // Build House
    this.buildButton = this.add.text(buildMenuX, buildMenuY, '🏠 House (50W)', {
      color: '#ffffff',
      fontSize: '14px',
      backgroundColor: '#444444',
      padding: { x: 8, y: 4 }
    })
    .setScrollFactor(0)
    .setDepth(2000)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.startBuildingPlacement('house'))
    .setVisible(false);

    // Build Barracks
    const barracksButton = this.add.text(buildMenuX, buildMenuY + buttonSpacing, '⚔️ Barracks (150W)', {
      color: '#ffffff',
      fontSize: '14px',
      backgroundColor: '#444444',
      padding: { x: 8, y: 4 }
    })
    .setScrollFactor(0)
    .setDepth(2000)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.startBuildingPlacement('barracks'))
    .setVisible(false);

    // Build Market
    const marketButton = this.add.text(buildMenuX, buildMenuY + buttonSpacing * 2, '🏪 Market (100W, 50G)', {
      color: '#ffffff',
      fontSize: '14px',
      backgroundColor: '#444444',
      padding: { x: 8, y: 4 }
    })
    .setScrollFactor(0)
    .setDepth(2000)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.startBuildingPlacement('market'))
    .setVisible(false);

    // Build Mill
    const millButton = this.add.text(buildMenuX, buildMenuY + buttonSpacing * 3, '🌾 Mill (100W)', {
      color: '#ffffff',
      fontSize: '14px',
      backgroundColor: '#444444',
      padding: { x: 8, y: 4 }
    })
    .setScrollFactor(0)
    .setDepth(2000)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.startBuildingPlacement('mill'))
    .setVisible(false);

    // Build Farm
    const farmButton = this.add.text(buildMenuX, buildMenuY + buttonSpacing * 4, '🚜 Farm (60W)', {
      color: '#ffffff',
      fontSize: '14px',
      backgroundColor: '#444444',
      padding: { x: 8, y: 4 }
    })
    .setScrollFactor(0)
    .setDepth(2000)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.startBuildingPlacement('farm'))
    .setVisible(false);

    // Store all building buttons for easy show/hide
    this.buildingButtons = [this.buildButton, barracksButton, marketButton, millButton, farmButton];
  }

  update(_time: number, delta: number) {
    this.units.forEach(unit => unit.update());
    this.villagers.forEach(villager => villager.update(delta));
    this.animals.forEach(animal => animal.update(delta));
    
    if (this.minimap) {
      this.minimap.update();
    }
    
    // Update building menu visibility
    const hasVillagerSelected = this.selectedUnits.some(unit => unit instanceof Villager);
    const showMenu = hasVillagerSelected && !this.placingBuilding;
    this.buildingButtons.forEach(btn => btn.setVisible(showMenu));
  }

  private spawnVillager(x: number, y: number) {
    if (this.currentPopulation >= this.maxPopulation) {
      // TODO: Show "Population Limit Reached" message
      return;
    }

    const { isoX, isoY } = this.mapSystem.cartesianToIso(x, y);
    const villager = new Villager(this, isoX, isoY);
    villager.setTownCenter(this.townCenterPos.x, this.townCenterPos.y);
    this.villagers.push(villager);
    this.units.push(villager);
    this.currentPopulation++;
    this.updatePopulationUI();
    
    // Select the new villager
    this.deselectAll();
    this.selectUnit(villager);

    // Cleanup on destroy
    villager.once('destroy', () => {
      this.units = this.units.filter(u => u !== villager);
      this.villagers = this.villagers.filter(v => v !== villager);
      this.selectedUnits = this.selectedUnits.filter(u => u !== villager);
      this.updateBottomBarUI();
      this.currentPopulation--;
      this.updatePopulationUI();
    });
  }

  private spawnResource(x: number, y: number, texture: string, type: ResourceType) {
    const { isoX, isoY } = this.mapSystem.cartesianToIso(x, y);
    const resource = new Resource(this, isoX, isoY, texture, type, 500);
    this.resources.push(resource);
  }

  private generateResourceCluster(centerX: number, centerY: number, texture: string, type: ResourceType, count: number) {
    for (let i = 0; i < count; i++) {
      // Random position around center
      const offsetX = Phaser.Math.Between(-2, 2);
      const offsetY = Phaser.Math.Between(-2, 2);
      const x = centerX + offsetX;
      const y = centerY + offsetY;

      // Simple check to avoid overlapping too much (not perfect but works for now)
      // In a real game we'd check grid occupancy
      this.spawnResource(x, y, texture, type);
    }
  }

  private spawnAnimal(x: number, y: number, texture: string, type: AnimalType) {
    const { isoX, isoY } = this.mapSystem.cartesianToIso(x, y);
    const animal = new Animal(this, isoX, isoY, texture, type);
    this.animals.push(animal);
    
    animal.once('destroy', () => {
        this.animals = this.animals.filter(a => a !== animal);
    });
  }

  private spawnUnit(type: string, x: number, y: number) {
    if (this.currentPopulation >= this.maxPopulation) {
      // TODO: Show warning
      return;
    }

    // Spawn near the building (x, y are building coordinates)
    // Let's spawn slightly offset
    const spawnX = x + 32;
    const spawnY = y + 32;

    if (type === 'villager') {
      const villager = new Villager(this, spawnX, spawnY);
      villager.setTownCenter(this.townCenterPos.x, this.townCenterPos.y);
      this.villagers.push(villager);
      this.units.push(villager);
    } else if (type === 'militia') {
      const militia = new Militia(this, spawnX, spawnY);
      this.units.push(militia);
      
      militia.once('destroy', () => {
        this.units = this.units.filter(u => u !== militia);
        this.selectedUnits = this.selectedUnits.filter(u => u !== militia);
        this.updateBottomBarUI();
        // Militia doesn't count towards population? In AOE they do.
        // Let's assume they do for now.
        this.currentPopulation--;
        this.updatePopulationUI();
      });
    }

    this.currentPopulation++;
    this.updatePopulationUI();
  }

  public updateResourceUI() {
    const resourcesDisplay = (this as any).resourcesDisplay as HTMLElement;
    if (resourcesDisplay) {
      resourcesDisplay.textContent = `🪵 Wood: ${this.resourceCounts.wood}  🍖 Food: ${this.resourceCounts.food}  💰 Gold: ${this.resourceCounts.gold}  🪨 Stone: ${this.resourceCounts.stone}`;
    }
  }

  private updatePopulationUI() {
    const popDisplay = document.getElementById('population-display');
    if (popDisplay) {
      popDisplay.textContent = `👥 ${this.currentPopulation}/${this.maxPopulation}`;
      // Visual warning if at max population
      if (this.currentPopulation >= this.maxPopulation) {
        popDisplay.style.color = '#ff6b6b';
      } else {
        popDisplay.style.color = '#ffffff';
      }
    }
  }

  private clearActionButtons() {
    const container = (this as any).actionButtonsContainer as HTMLElement;
    if (container) {
      container.innerHTML = '';
    }
  }

  private createActionButton(label: string, callback: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'action-btn';
    button.textContent = label;
    button.onclick = callback;
    return button;
  }

  private updateBottomBarUI() {
    this.clearActionButtons();
    const container = (this as any).actionButtonsContainer as HTMLElement;
    const selectionNameDisplay = (this as any).selectionNameDisplay as HTMLElement;
    const selectionHPDisplay = (this as any).selectionHPDisplay as HTMLElement;

    if (!container || !selectionNameDisplay || !selectionHPDisplay) return;

    // Update selection info
    if (this.selectedUnits.length === 1) {
      const unit = this.selectedUnits[0];
      selectionNameDisplay.textContent = unit instanceof Villager ? 'VILLAGER' : 'UNIT';
      selectionHPDisplay.textContent = `HP: ${unit.getHp()}/${unit.getMaxHp()}`;
      selectionNameDisplay.style.display = 'block';
      selectionHPDisplay.style.display = 'block';

      // Show build menu for villagers
      if (unit instanceof Villager && !this.placingBuilding) {
        container.appendChild(this.createActionButton('🏠 House\n50W', () => this.startBuildingPlacement('house')));
        container.appendChild(this.createActionButton('⚔️ Barracks\n150W', () => this.startBuildingPlacement('barracks')));
        container.appendChild(this.createActionButton('🏪 Market\n100W 50G', () => this.startBuildingPlacement('market')));
        container.appendChild(this.createActionButton('🌾 Mill\n100W', () => this.startBuildingPlacement('mill')));
        container.appendChild(this.createActionButton('🚜 Farm\n60W', () => this.startBuildingPlacement('farm')));
      }
    } else if (this.selectedUnits.length > 1) {
      selectionNameDisplay.textContent = `${this.selectedUnits.length} Units Selected`;
      selectionHPDisplay.textContent = '';
      selectionNameDisplay.style.display = 'block';
      selectionHPDisplay.style.display = 'none';
    } else if (this.selectedBuilding) {
      selectionNameDisplay.textContent = this.selectedBuilding.buildingType.toUpperCase().replace('_', ' ');
      selectionHPDisplay.textContent = `HP: ${this.selectedBuilding.getHp()}/${this.selectedBuilding.getMaxHp()}`;
      selectionNameDisplay.style.display = 'block';
      selectionHPDisplay.style.display = 'block';

      // Show production buttons
      if (this.selectedBuilding.isConstructed()) {
        if (this.selectedBuilding.buildingType === 'town_center') {
          container.appendChild(this.createActionButton('Create Villager\n50F', () => {
            if (this.resourceCounts.food >= 50) {
              this.resourceCounts.food -= 50;
              this.updateResourceUI();
              this.selectedBuilding?.queueUnit('villager');
            }
          }));
        } else if (this.selectedBuilding.buildingType === 'barracks') {
          container.appendChild(this.createActionButton('Create Militia\n60F 20G', () => {
            if (this.resourceCounts.food >= 60 && this.resourceCounts.gold >= 20) {
              this.resourceCounts.food -= 60;
              this.resourceCounts.gold -= 20;
              this.updateResourceUI();
              this.selectedBuilding?.queueUnit('militia');
            }
          }));
        }
      }
    } else {
      selectionNameDisplay.style.display = 'none';
      selectionHPDisplay.style.display = 'none';
    }
  }


  private startBuildingPlacement(type: BuildingType) {
    if (this.placingBuilding) return;

    // Create ghost sprite
    const ghost = this.add.sprite(0, 0, type);
    ghost.setAlpha(0.5);
    ghost.setDepth(10000); // Always on top
    
    this.placingBuilding = { type, ghost };
  }

  private handleLeftClick(pointer: Phaser.Input.Pointer) {
    if (this.placingBuilding) {
      // Place building
      const { x, y } = this.mapSystem.isoToCartesian(pointer.worldX, pointer.worldY);
      // Snap to grid
      const gridX = Math.round(x);
      const gridY = Math.round(y);
      const { isoX, isoY } = this.mapSystem.cartesianToIso(gridX, gridY);

      const cost = Building.COSTS[this.placingBuilding.type];
      if (this.resourceCounts.wood >= (cost.wood || 0) &&
          this.resourceCounts.food >= (cost.food || 0) &&
          this.resourceCounts.gold >= (cost.gold || 0) &&
          this.resourceCounts.stone >= (cost.stone || 0)) {

        const building = new Building(this, isoX, isoY, this.placingBuilding.type, this.placingBuilding.type);
        this.buildings.push(building);
        
        // Increase population limit if House
        if (this.placingBuilding.type === 'house') {
          this.maxPopulation += 5;
          this.updatePopulationUI();
        }
        
        // Deduct resources
        this.resourceCounts.wood -= (cost.wood || 0);
        this.resourceCounts.food -= (cost.food || 0);
        this.resourceCounts.gold -= (cost.gold || 0);
        this.resourceCounts.stone -= (cost.stone || 0);
        this.updateResourceUI();

        // Command selected villagers to build
        this.selectedUnits.forEach(unit => {
          if (unit instanceof Villager) {
            unit.build(building);
          }
        });

        // Cleanup ghost
        this.placingBuilding.ghost.destroy();
        this.placingBuilding = null;
      } else {
        console.log("Not enough wood!");
        // Cancel placement
        this.placingBuilding.ghost.destroy();
        this.placingBuilding = null;
      }
      return;
    }

    this.isDragging = true;
    this.dragStart.set(pointer.worldX, pointer.worldY);
    
    if (!pointer.event.shiftKey) {
      this.deselectAll();
    }
  }

  private handleRightClick(pointer: Phaser.Input.Pointer) {
    if (this.placingBuilding) {
      // Cancel placement
      this.placingBuilding.ghost.destroy();
      this.placingBuilding = null;
      return;
    }

    if (this.selectedUnits.length > 0) {
      // Check if clicking on a resource
      const clickedResource = this.resources.find(resource => 
        resource.getBounds().contains(pointer.worldX, pointer.worldY)
      );

      // Check if clicking on an animal
      const clickedAnimal = this.animals.find(animal => 
        animal.getBounds().contains(pointer.worldX, pointer.worldY) && !animal.isKilled()
      );

      // Check if clicking on a building
      const clickedBuilding = this.buildings.find(building => 
        building.getBounds().contains(pointer.worldX, pointer.worldY)
      );

      if (clickedResource) {
        // Command villagers to gather
        this.selectedUnits.forEach(unit => {
          if (unit instanceof Villager) {
            unit.gatherResource(clickedResource);
          }
        });
      } else if (clickedAnimal) {
        // Command villagers to hunt, others to attack
        this.selectedUnits.forEach(unit => {
          if (unit instanceof Villager) {
            unit.hunt(clickedAnimal);
          } else {
            // Military units attack
            unit.attackTarget(clickedAnimal);
          }
        });
      } else if (clickedBuilding) {
        // Command villagers to build or repair
        this.selectedUnits.forEach(unit => {
          if (unit instanceof Villager) {
            unit.build(clickedBuilding);
          }
        });
      } else {
        // Move selected units
        this.selectedUnits.forEach(unit => {
          unit.moveUnitTo(pointer.worldX, pointer.worldY);
        });
      }
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (this.placingBuilding) {
      // Move ghost building
      const { x, y } = this.mapSystem.isoToCartesian(pointer.worldX, pointer.worldY);
      const gridX = Math.round(x);
      const gridY = Math.round(y);
      const { isoX, isoY } = this.mapSystem.cartesianToIso(gridX, gridY);
      
      this.placingBuilding.ghost.setPosition(isoX, isoY - 24); // Offset
      this.placingBuilding.ghost.setDepth(isoY + 100);
      return;
    }

    if (this.isDragging) {
      this.selectionGraphics.clear();
      this.selectionGraphics.lineStyle(1, 0x00ff00);
      this.selectionGraphics.fillStyle(0x00ff00, 0.2);
      
      const rect = new Phaser.Geom.Rectangle(
        this.dragStart.x,
        this.dragStart.y,
        pointer.worldX - this.dragStart.x,
        pointer.worldY - this.dragStart.y
      );
      
      this.selectionGraphics.strokeRectShape(rect);
      this.selectionGraphics.fillRectShape(rect);
    } else if (pointer.middleButtonDown()) {
      this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
      this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
    }
  }

  private handlePointerUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.selectionGraphics.clear();

      const selectionRect = new Phaser.Geom.Rectangle(
        Math.min(this.dragStart.x, this.input.activePointer.worldX),
        Math.min(this.dragStart.y, this.input.activePointer.worldY),
        Math.abs(this.input.activePointer.worldX - this.dragStart.x),
        Math.abs(this.input.activePointer.worldY - this.dragStart.y)
      );

      if (selectionRect.width < 5 && selectionRect.height < 5) {
        const clickedUnit = this.units.find(unit => 
          unit.getBounds().contains(this.input.activePointer.worldX, this.input.activePointer.worldY)
        );
        if (clickedUnit) {
          this.selectUnit(clickedUnit);
        } else {
            // Check for buildings
            const clickedBuilding = this.buildings.find(building => 
                building.getBounds().contains(this.input.activePointer.worldX, this.input.activePointer.worldY)
            );
            if (clickedBuilding) {
                this.selectBuilding(clickedBuilding);
            }
        }
      } else {
        this.selectUnitsInRect(selectionRect);
      }
    }
  }

  private selectUnit(unit: Unit) {
    unit.select();
    if (!this.selectedUnits.includes(unit)) {
      this.selectedUnits.push(unit);
    }
    this.updateBottomBarUI();
  }

  private deselectAll() {
    this.selectedUnits.forEach(unit => unit.deselect());
    this.selectedUnits = [];
    if (this.selectedBuilding) {
        this.selectedBuilding.deselect();
        this.selectedBuilding = null;
    }
    this.updateBottomBarUI();
  }

  private selectBuilding(building: Building) {
      this.deselectAll();
      this.selectedBuilding = building;
      building.select();
      this.updateBottomBarUI();
  }

  private selectUnitsInRect(rect: Phaser.Geom.Rectangle) {
    this.units.forEach(unit => {
      if (rect.contains(unit.x, unit.y)) {
        unit.select();
        if (!this.selectedUnits.includes(unit)) {
          this.selectedUnits.push(unit);
        }
      }
    });
    this.updateBottomBarUI();
  }

  public getMapSystem(): MapSystem {
    return this.mapSystem;
  }

  public getPathfindingSystem(): PathfindingSystem {
    return this.pathfindingSystem;
  }

  public getWaterTiles(): { x: number, y: number }[] {
    const waterTiles: { x: number, y: number }[] = [];
    for (let y = 0; y < this.mapSystem.getHeight(); y++) {
      for (let x = 0; x < this.mapSystem.getWidth(); x++) {
        const tile = this.mapSystem.getTileAt(x, y);
        if (tile && tile.texture.key === 'water') {
          const { isoX, isoY } = this.mapSystem.cartesianToIso(x, y);
          waterTiles.push({ x: isoX, y: isoY });
        }
      }
    }
    return waterTiles;
  }

  public getResources(type?: string): { x: number, y: number }[] {
    const result: { x: number, y: number }[] = [];
    this.resources.forEach(res => {
      if (!type || (res as any).texture.key === type) {
         result.push({ x: res.x, y: res.y });
      }
    });
    return result;
  }

  public getBuildings(): { x: number, y: number, type: string }[] {
    return this.buildings.map(b => ({ x: b.x, y: b.y, type: (b as any).buildingType || 'building' }));
  }

  public getUnits(): { x: number, y: number }[] {
    return this.units.map(u => ({ x: u.x, y: u.y }));
  }
}
