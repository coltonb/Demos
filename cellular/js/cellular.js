class Cell {
  constructor(state, color = { r: 0, g: 0, b: 0 }) {
    this.color = color;
    this.state = state;
    this.nextState = state;
  }

  forceState(state) {
    this.state = state;
    this.nextState = state;
  }

  setColor(r, g, b) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
  }
}

const MODES = {
  Move: "0",
  Freeze: "1",
  Conway: "2",
  Seeds: "3",
  "Brian's Brain": "4",
  Mirage: "5"
};

class CellSpace {
  constructor(canvas, mode = MODES.Conway) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    this.imageData = this.context.createImageData(this.width, this.height);
    this.cellSpace = CellSpace.generateCellSpace(this.width, this.height);
    this.iteration = 0;
    this.mode = mode;
  }

  static randomColor() {
    return Math.floor(Math.random() * 255);
  }

  static get outOfBoundsError() {
    return new Error("Coordinates are out of bounds!");
  }

  static get activeError() {
    return new Error(
      "There is already an active cell at the given coordinates!"
    );
  }

  static get notActiveError() {
    return new Error("There is no active cell at the given coordinates!");
  }

  rescale(scale) {
    this.canvas.style.transform = `scale(${scale})`;
  }

  clear() {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const cell = this.getCell(x, y);
        cell.forceState(0);
      }
    }
  }

  randomFill(density = 0.1) {
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

  isInBounds(x, y) {
    return x >= 0 && x < this.width && (y >= 0 && y < this.height);
  }

  isAtEdge(x, y) {
    return (
      x === 0 || x === this.width - 1 || (y === 0 || y === this.height - 1)
    );
  }

  validateIsInBounds(x, y) {
    if (!this.isInBounds(x, y)) throw CellSpace.outOfBoundsError;
  }

  getCell(x, y) {
    this.validateIsInBounds(x, y);

    return this.cellSpace[y][x];
  }

  setCell(x, y, cell) {
    this.validateIsInBounds(x, y);

    this.cellSpace[y][x] = cell;
  }

  updateCell(x, y) {
    this.validateIsInBounds(x, y);

    const cell = this.getCell(x, y);
    if (this.mode === MODES.Move) {
      if (cell.state !== 1) return;

      const newX = x + Math.floor(Math.random() * 3) - 1;
      const newY = y + Math.floor(Math.random() * 3) - 1;

      if (this.isInBounds(newX, newY)) {
        const neighbor = this.getCell(newX, newY);
        if (neighbor.state !== 1 && neighbor.nextState !== 1) {
          neighbor.nextState = 1;
          cell.nextState = 0;
        }
      }
    } else if (this.mode === MODES.Freeze) {
      if (cell.state !== 1) return;

      const newX = x + Math.floor(Math.random() * 3) - 1;
      const newY = y + Math.floor(Math.random() * 3) - 1;

      if (this.isInBounds(newX, newY)) {
        const neighbor = this.getCell(newX, newY);
        if (neighbor.state === 0 && neighbor.nextState === 0) {
          neighbor.nextState = 1;
          cell.nextState = 0;
        }

        if (
          this.isAtEdge(newX, newY) ||
          this.hasNeighborWithState(newX, newY, 2)
        ) {
          neighbor.nextState = 2;
        }
      } else if (this.hasNeighborWithState(x, y, 2)) {
        cell.nextState = 2;
      }
    } else if (this.mode === MODES.Conway) {
      const activeNeighborCount = this.neighborsWithState(x, y, 1);

      if (cell.state === 1) {
        if (activeNeighborCount < 2 || activeNeighborCount > 3) {
          cell.nextState = 0;
        }
      } else if (activeNeighborCount === 3) {
        cell.nextState = 1;
      }
    } else if (this.mode === MODES.Seeds) {
      const activeNeighborCount = this.neighborsWithState(x, y, 1);

      if (cell.state === 1) {
        cell.nextState = 0;
      } else if (activeNeighborCount === 2) {
        cell.nextState = 1;
      }
    } else if (this.mode === MODES["Brian's Brain"]) {
      const activeNeighborCount = this.neighborsWithState(x, y, 1);

      if (cell.state === 0) {
        if (activeNeighborCount === 2) {
          cell.nextState = 1;
        }
      } else {
        cell.nextState = (cell.state + 1) % 3;
      }
    } else if (this.mode === MODES.Mirage) {
      const newX = x + Math.floor(Math.random() * 3) - 1;
      const newY = y + 1;

      if (this.isInBounds(newX, newY)) {
        const neighbor = this.getCell(newX, newY);

        if (neighbor.state === 1) {
          cell.nextState = 1;
        } else {
          cell.nextState = 0;
        }
      }
    }
  }

  paintCell(x, y) {
    this.validateIsInBounds(x, y);

    const cell = this.getCell(x, y);
    if (this.mode === MODES.Move) {
      cell.setColor(0, cell.state === 1 ? 255 : 0, 0);
    } else if (this.mode === MODES.Freeze) {
      cell.setColor(0, cell.state === 1 ? 255 : 0, cell.state === 2 ? 255 : 0);
    } else if (this.mode === MODES.Conway) {
      cell.setColor(0, cell.state === 1 ? 255 : 0, 0);
    } else if (this.mode === MODES.Seeds) {
      cell.setColor(0, cell.state === 1 ? 255 : 0, 0);
    } else if (this.mode === MODES["Brian's Brain"]) {
      cell.setColor(
        cell.state === 1 ? 255 : 0,
        cell.state === 1 ? 255 : 0,
        cell.state > 0 ? 255 : 0
      );
    } else if (this.mode === MODES.Mirage) {
      cell.setColor(cell.state === 1 ? 255 : 0, cell.state === 1 ? 255 : 0, 0);
    }
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
        const cell = this.getCell(x, y);
        cell.state = cell.nextState;
      }
    }
  }

  paintCells() {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        this.paintCell(x, y);
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
    this.paintCells();
    this.updateImageData();
    this.drawImageData();
  }
}
