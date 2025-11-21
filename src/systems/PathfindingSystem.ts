import Phaser from 'phaser';
import { MapSystem } from './MapSystem';

interface Node {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic to end
  f: number; // Total cost
  parent: Node | null;
}

export class PathfindingSystem {
  private mapSystem: MapSystem;

  constructor(mapSystem: MapSystem) {
    this.mapSystem = mapSystem;
  }

  public findPath(startX: number, startY: number, endX: number, endY: number): Phaser.Math.Vector2[] {
    // Basic validation
    if (!this.mapSystem.isWalkable(endX, endY)) {
      // If target is blocked, try to find a neighbor
      const neighbors = this.getNeighbors({ x: endX, y: endY } as Node);
      let bestDist = Infinity;
      let bestNeighbor = null;

      for (const neighbor of neighbors) {
        if (this.mapSystem.isWalkable(neighbor.x, neighbor.y)) {
          const dist = Phaser.Math.Distance.Between(startX, startY, neighbor.x, neighbor.y);
          if (dist < bestDist) {
            bestDist = dist;
            bestNeighbor = neighbor;
          }
        }
      }

      if (bestNeighbor) {
        endX = bestNeighbor.x;
        endY = bestNeighbor.y;
      } else {
        return []; // Cannot reach
      }
    }

    const openList: Node[] = [];
    const closedList: Set<string> = new Set();

    const startNode: Node = {
      x: startX,
      y: startY,
      g: 0,
      h: 0,
      f: 0,
      parent: null
    };

    openList.push(startNode);

    while (openList.length > 0) {
      // Sort by lowest f
      openList.sort((a, b) => a.f - b.f);
      const currentNode = openList.shift()!;

      // Check if reached end
      if (currentNode.x === endX && currentNode.y === endY) {
        return this.reconstructPath(currentNode);
      }

      closedList.add(`${currentNode.x},${currentNode.y}`);

      const neighbors = this.getNeighbors(currentNode);

      for (const neighbor of neighbors) {
        if (closedList.has(`${neighbor.x},${neighbor.y}`)) {
          continue;
        }

        if (!this.mapSystem.isWalkable(neighbor.x, neighbor.y)) {
          continue;
        }

        const gScore = currentNode.g + 1; // Assuming uniform cost
        let neighborNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!neighborNode) {
          neighborNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: gScore,
            h: this.heuristic(neighbor.x, neighbor.y, endX, endY),
            f: 0,
            parent: currentNode
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openList.push(neighborNode);
        } else if (gScore < neighborNode.g) {
          neighborNode.g = gScore;
          neighborNode.f = neighborNode.g + neighborNode.h;
          neighborNode.parent = currentNode;
        }
      }
    }

    return []; // No path found
  }

  private getNeighbors(node: Node): { x: number, y: number }[] {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 }, // Up
      { x: 0, y: 1 },  // Down
      { x: -1, y: 0 }, // Left
      { x: 1, y: 0 },  // Right
      { x: -1, y: -1 }, // Up-Left
      { x: 1, y: -1 },  // Up-Right
      { x: -1, y: 1 },  // Down-Left
      { x: 1, y: 1 }    // Down-Right
    ];

    for (const dir of directions) {
      neighbors.push({ x: node.x + dir.x, y: node.y + dir.y });
    }

    return neighbors;
  }

  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    // Manhattan distance is usually good for grid
    // But since we allow diagonals, Diagonal distance (Chebyshev) or Euclidean might be better
    return Phaser.Math.Distance.Between(x1, y1, x2, y2);
  }

  private reconstructPath(node: Node): Phaser.Math.Vector2[] {
    const path: Phaser.Math.Vector2[] = [];
    let current: Node | null = node;

    while (current) {
      // Convert grid coordinates to world coordinates (isometric)
      const { isoX, isoY } = this.mapSystem.cartesianToIso(current.x, current.y);
      path.push(new Phaser.Math.Vector2(isoX, isoY));
      current = current.parent;
    }

    return path.reverse();
  }
}
