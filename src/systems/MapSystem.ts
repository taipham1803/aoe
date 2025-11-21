import Phaser from 'phaser';

export class MapSystem {
  private scene: Phaser.Scene;
  private mapWidth: number;
  private mapHeight: number;
  private tileWidth: number;
  private tileHeight: number;
  private tiles: Phaser.GameObjects.Image[][] = [];

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
}
