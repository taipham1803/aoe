import Phaser from 'phaser';

export class MapSystem {
  private scene: Phaser.Scene;
  private mapWidth: number;
  private mapHeight: number;
  private tileWidth: number;
  private tileHeight: number;
  private tiles: Phaser.GameObjects.Image[][] = [];
  private blockedTiles: Set<string> = new Set(); // Format: "x,y"

  constructor(scene: Phaser.Scene, mapWidth: number, mapHeight: number, tileWidth: number, tileHeight: number) {
    this.scene = scene;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  public createIsoMap() {
    for (let y = 0; y < this.mapHeight; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        const { isoX, isoY } = this.cartesianToIso(x, y);
        
        const tile = this.scene.add.image(isoX, isoY, 'tile').setOrigin(0.5, 0);
        tile.setDepth(isoY); // Simple depth sorting
        this.tiles[y][x] = tile;
      }
    }
  }

  public cartesianToIso(x: number, y: number): { isoX: number, isoY: number } {
    const isoX = (x - y) * (this.tileWidth / 2);
    const isoY = (x + y) * (this.tileHeight / 2);
    return { isoX, isoY };
  }

  public isoToCartesian(isoX: number, isoY: number): { x: number, y: number } {
    const halfWidth = this.tileWidth / 2;
    const halfHeight = this.tileHeight / 2;
    
    const y = (isoY / halfHeight - isoX / halfWidth) / 2;
    const x = (isoY / halfHeight + isoX / halfWidth) / 2;
    
    return { x: Math.round(x), y: Math.round(y) };
  }
  
  public getTileAt(x: number, y: number): Phaser.GameObjects.Image | null {
      if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
          return this.tiles[y][x];
      }
      return null;
  }

  public setTileTexture(x: number, y: number, texture: string) {
    const tile = this.getTileAt(x, y);
    if (tile) {
      tile.setTexture(texture);
    }
  }

  public isWalkable(x: number, y: number): boolean {
    // Check bounds
    if (x < 0 || x >= this.mapWidth || y < 0 || y >= this.mapHeight) {
      return false;
    }
    
    // Check if tile exists and has a texture that implies walkability
    // For now, we'll assume everything is walkable unless explicitly blocked
    // In a real implementation, we might check tile types (water vs land)
    
    // Check specific tile types that are not walkable by default (like deep water)
    // This depends on how we store tile data. For now, let's rely on an external collision map
    // or check the texture key if we want to be simple.
    const tile = this.getTileAt(x, y);
    if (!tile) return false;
    
    const texture = tile.texture.key;
    if (texture === 'water') return false; // Deep water blocks movement
    
    // Check dynamic obstacles
    if (this.blockedTiles.has(`${x},${y}`)) {
      return false;
    }

    return true;
  }

  public getWidth(): number {
    return this.mapWidth;
  }

  public getHeight(): number {
    return this.mapHeight;
  }

  public setBlocked(x: number, y: number, blocked: boolean) {
    if (blocked) {
      this.blockedTiles.add(`${x},${y}`);
    } else {
      this.blockedTiles.delete(`${x},${y}`);
    }
  }
}
