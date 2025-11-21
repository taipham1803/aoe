import GameScene from '../scenes/GameScene';

export class Minimap {
  private scene: GameScene;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLDivElement;
  private size: number = 150;
  private scale: number;

  constructor(scene: GameScene, mapWidth: number, mapHeight: number) {
    this.scene = scene;
    
    // Calculate scale to fit map into minimap
    this.scale = this.size / Math.max(mapWidth, mapHeight);
    
    this.createMinimapHTML();
    this.canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.container = document.getElementById('minimap-container') as HTMLDivElement;
    
    this.setupClickHandler();
  }

  private createMinimapHTML(): void {
    const minimapHTML = `
      <div id="minimap-container" style="
        position: fixed;
        top: 10px;
        right: 10px;
        width: ${this.size}px;
        height: ${this.size}px;
        border: 2px solid #8B4513;
        background: rgba(0, 0, 0, 0.7);
        cursor: pointer;
        z-index: 1000;
      ">
        <canvas id="minimap-canvas" width="${this.size}" height="${this.size}"></canvas>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', minimapHTML);
  }

  private setupClickHandler(): void {
    this.container.addEventListener('click', (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Convert minimap coordinates to world coordinates
      const worldX = (x / this.scale);
      const worldY = (y / this.scale);
      
      // Center camera on clicked position
      this.scene.cameras.main.centerOn(worldX, worldY);
    });
  }

  public update(): void {
    // Clear canvas
    this.ctx.fillStyle = '#2d5016'; // Grass green
    this.ctx.fillRect(0, 0, this.size, this.size);
    
    // Draw water
    this.drawWater();
    
    // Draw resources
    this.drawResources();
    
    // Draw buildings
    this.drawBuildings();
    
    // Draw units
    this.drawUnits();
    
    // Draw viewport indicator
    this.drawViewport();
  }

  private drawWater(): void {
    // Get water tiles from scene
    const waterTiles = this.scene.getWaterTiles?.() || [];
    
    this.ctx.fillStyle = '#4a90e2'; // Water blue
    waterTiles.forEach((tile: { x: number; y: number }) => {
      const x = tile.x * this.scale;
      const y = tile.y * this.scale;
      this.ctx.fillRect(x, y, this.scale * 32, this.scale * 32);
    });
  }

  private drawResources(): void {
    // Draw trees
    this.ctx.fillStyle = '#1a3d0a'; // Dark green for trees
    const trees = this.scene.getResources?.('tree') || [];
    trees.forEach((tree: any) => {
      const x = tree.x * this.scale;
      const y = tree.y * this.scale;
      this.ctx.fillRect(x - 1, y - 1, 2, 2);
    });
    
    // Draw gold mines
    this.ctx.fillStyle = '#ffd700'; // Gold
    const goldMines = this.scene.getResources?.('gold') || [];
    goldMines.forEach((mine: any) => {
      const x = mine.x * this.scale;
      const y = mine.y * this.scale;
      this.ctx.fillRect(x - 1, y - 1, 3, 3);
    });
    
    // Draw stone mines
    this.ctx.fillStyle = '#808080'; // Gray
    const stoneMines = this.scene.getResources?.('stone') || [];
    stoneMines.forEach((mine: any) => {
      const x = mine.x * this.scale;
      const y = mine.y * this.scale;
      this.ctx.fillRect(x - 1, y - 1, 3, 3);
    });
  }

  private drawBuildings(): void {
    const buildings = this.scene.getBuildings?.() || [];
    
    buildings.forEach((building: any) => {
      const x = building.x * this.scale;
      const y = building.y * this.scale;
      const size = 4;
      
      // Different colors for different buildings
      if (building.type === 'townCenter') {
        this.ctx.fillStyle = '#ff6b6b'; // Red for TC
      } else {
        this.ctx.fillStyle = '#4ecdc4'; // Cyan for other buildings
      }
      
      this.ctx.fillRect(x - size/2, y - size/2, size, size);
    });
  }

  private drawUnits(): void {
    const units = this.scene.getUnits?.() || [];
    
    this.ctx.fillStyle = '#4169e1'; // Royal blue for player units
    units.forEach((unit: any) => {
      const x = unit.x * this.scale;
      const y = unit.y * this.scale;
      this.ctx.fillRect(x - 1, y - 1, 2, 2);
    });
  }

  private drawViewport(): void {
    const camera = this.scene.cameras.main;
    
    // Calculate viewport rectangle in minimap coordinates
    const viewX = camera.scrollX * this.scale;
    const viewY = camera.scrollY * this.scale;
    const viewW = camera.width * this.scale / camera.zoom;
    const viewH = camera.height * this.scale / camera.zoom;
    
    // Draw white rectangle for viewport
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(viewX, viewY, viewW, viewH);
  }

  public destroy(): void {
    this.container.remove();
  }
}
