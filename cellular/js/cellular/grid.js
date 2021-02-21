import { Cell } from "./cell.js";

class Grid {
  constructor(canvas, simulation) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    this.imageData = this.context.createImageData(this.width, this.height);
    this.grid = Grid.generateCellSpace(this.width, this.height);
    this.iteration = 0;
    this.simulation = simulation;
  }

  static randomColor() {
    return Math.floor(Math.random() * 255);
  }

  static get outOfBoundsError() {
    return new Error("Coordinates are out of bounds");
  }

  clear() {
    this.simulation.logic.clear(this);
  }

  fill(density = 0.1) {
    if (this.simulation.logic.fill !== undefined) {
      this.simulation.logic.fill(this, density);
    } else {
      for (let y = 0; y < this.height; y += 1) {
        for (let x = 0; x < this.width; x += 1) {
          const randomValue = Math.random();
          const cell = this.getCell(x, y);
          if (randomValue >= 1 - density) {
            cell.forceState(1);
          } else {
            cell.forceState(0);
          }
        }
      }
    }
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  isAtEdge(x, y) {
    return x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1;
  }

  validateIsInBounds(x, y) {
    if (!this.isInBounds(x, y)) throw new CoordinatesOutOfBoundError();
  }

  getCell(x, y) {
    this.validateIsInBounds(x, y);

    return this.grid[y][x];
  }

  setCell(x, y, cell) {
    this.validateIsInBounds(x, y);

    this.grid[y][x] = cell;
  }

  updateCell(x, y) {
    this.validateIsInBounds(x, y);

    this.simulation.logic.update(this, x, y);
  }

  drawCell(x, y) {
    this.validateIsInBounds(x, y);

    const cell = this.getCell(x, y);
    if (!cell.needsDraw) return;

    this.simulation.logic.draw(cell);
  }

  hasNeighborWithState(x, y, state) {
    for (let dY = y - 1; dY <= y + 1; dY += 1) {
      for (let dX = x - 1; dX <= x + 1; dX += 1) {
        if (
          !(dX === x && dY === y) &&
          this.isInBounds(dX, dY) &&
          this.getCell(dX, dY).state === state
        ) {
          return true;
        }
      }
    }
    return false;
  }

  neighborsWithState(x, y, state) {
    let count = 0;
    for (let dY = y - 1; dY <= y + 1; dY += 1) {
      for (let dX = x - 1; dX <= x + 1; dX += 1) {
        if (
          !(dX === x && dY === y) &&
          this.isInBounds(dX, dY) &&
          this.getCell(dX, dY).state === state
        ) {
          count += 1;
        }
      }
    }
    return count;
  }

  static generateCellSpace(width, height) {
    const cells = [];
    for (let y = 0; y < height; y += 1) {
      cells.push(new Array(width));
      for (let x = 0; x < width; x += 1) {
        cells[y][x] = new Cell();
      }
    }
    return cells;
  }

  updateCells() {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        this.updateCell(x, y);
      }
    }
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        this.getCell(x, y).commitStateChange();
      }
    }
  }

  drawCells() {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        this.drawCell(x, y);
      }
    }
  }

  updateImageData() {
    const { data } = this.imageData;
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % this.width;
      const y = Math.floor(i / 4 / this.width);
      const cell = this.getCell(x, y);
      data[i] = cell.color.r;
      data[i + 1] = cell.color.g;
      data[i + 2] = cell.color.b;
      data[i + 3] = 255;
    }
  }

  drawImageData() {
    this.context.putImageData(this.imageData, 0, 0);
  }

  step() {
    this.iteration += 1;
    this.updateCells();
  }

  draw() {
    this.drawCells();
    this.updateImageData();
    this.drawImageData();
  }
}

export { Grid };
