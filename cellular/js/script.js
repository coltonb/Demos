class Cell {
  constructor(state, color = { r: 0, g: 0, b: 0 }) {
    this.color = color;
    this.state = state;
    this.nextState = state;
  }

  setColor(r, g, b) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
  }
}

class CellSpace {
  constructor(canvas, mode) {
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

  static get MOVE_MODE() {
    return 0;
  }

  static get FREEZE_MODE() {
    return 1;
  }

  static get FALL_MODE() {
    return 2;
  }

  static get CONWAY_MODE() {
    return 3;
  }

  static get BRIANS_BRAIN() {
    return 4;
  }

  static get outOfBoundsError() {
    return new Error('Coordinates are out of bounds!');
  }

  static get activeError() {
    return new Error('There is already an active \
      cell at the given coordinates!');
  }

  static get notActiveError() {
    return new Error('There is no active cell at the given coordinates!');
  }

  rescale(scale) {
    this.canvas.style.transform = `scale(${scale})`;
  }

  clear() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell(x, y);
        cell.state = 0;
        cell.nextState = 0;
        cell.setColor(0, 0, 0);
      }
    }
  }

  randomFill(density = 0.10) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const randomValue = Math.random();
        const cell = this.getCell(x, y);
        if (randomValue >= 1 - density) {
          cell.state = 1;
          cell.nextState = 1;
          cell.setColor(0, 255, 0);
        } else {
          cell.state = 0;
          cell.nextState = 0;
          cell.setColor(0, 0, 0);
        }
      }
    }
  }

  isInBounds(x, y) {
    return (x >= 0 && x < this.width) && (y >= 0 && y < this.height);
  }

  isAtEdge(x, y) {
    return (x === 0 || x === this.width - 1) || (y === 0 || y === this.height - 1);
  }

  validateIsInBounds(x, y) {
    if (!this.isInBounds(x, y)) throw CellSpace.outOfBoundsError;
  }

  getCell(x, y) {
    this.validateIsInBounds(x, y)

    return this.cellSpace[y][x];
  }

  modifyCell(x, y, properties = {}) {
    this.validateIsInBounds(x, y);

    const cell = this.getCell(x, y)
    cell.updateProperties(properties);
    return cell;
  }

  setCell(x, y, cell) {
    this.validateIsInBounds(x, y);

    this.cellSpace[y][x] = cell;
  }

  swapCells(x, y, newX, newY) {
    this.validateIsInBounds(newX, newY);

    const firstCell = this.getCell(x, y);
    const secondCell = this.getCell(newX, newY);
    this.setCell(x, y, secondCell);
    this.setCell(newX, newY, firstCell);
  }

  neighborList(x, y) {
    const self = this;
    return [
      { x: x + 0, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x + 1, y: y + 0 },
      { x: x + 1, y: y + 1 },
      { x: x + 0, y: y + 1 },
      { x: x - 1, y: y + 1 },
      { x: x - 1, y: y + 0 },
      { x: x - 1, y: y - 1 }
    ].filter((neighbor) => self.isInBounds(neighbor.x, neighbor.y));
  }

  updateCell(x, y) {
    this.validateIsInBounds(x, y);

    const cell = this.getCell(x, y);
    if (this.mode == CellSpace.MOVE_MODE) {
      if (cell.state !== 1) return;

      const newX = x + Math.floor(Math.random() * 3) - 1;
      const newY = y + Math.floor(Math.random() * 3) - 1;

      if (this.isInBounds(newX, newY)) {
        const neighbor = this.getCell(newX, newY);
        if (neighbor.state !== 1 && neighbor.nextState !== 1) {
          neighbor.nextState = 1;
          neighbor.setColor(0, 255, 0);

          cell.nextState = 0;
          cell.setColor(0, 0, 0);
        }
      }
    } else if (this.mode == CellSpace.FREEZE_MODE) {
      if (cell.state !== 1) return;

      const newX = x + Math.floor(Math.random() * 3) - 1;
      const newY = y + Math.floor(Math.random() * 3) - 1;

      if (this.isInBounds(newX, newY)) {
        const neighbor = this.getCell(newX, newY);
        if (neighbor.state === 0 && neighbor.nextState === 0) {
          neighbor.nextState = 1;
          neighbor.setColor(0, 255, 0);

          cell.nextState = 0;
          cell.setColor(0, 0, 0);
        }

        if (this.isAtEdge(newX, newY) || this.hasNeighborWithState(newX, newY, 2)) {
          neighbor.nextState = 2;
          neighbor.setColor(0, 0, 255);
        }
      } else {
        if (this.hasNeighborWithState(x, y, 2)) {
          cell.nextState = 2;
          cell.setColor(0, 0, 255);
        }
      }
    } else if (this.mode == CellSpace.CONWAY_MODE) {
      const activeNeighborCount =
        this.neighborsWithState(x, y, 1).length;

      if (cell.state === 1) {
        if (activeNeighborCount < 2 || activeNeighborCount > 3) {
          cell.nextState = 0;
        }
      } else {
        if (activeNeighborCount === 3) {
          cell.nextState = 1;
          cell.setColor(0, 255, 0);
        }
      }

      cell.setColor(0, cell.state === 1 ? 255 : 0, 0);
    } else if (this.mode == CellSpace.BRIANS_BRAIN) {
      const activeNeighborCount =
        this.neighborsWithState(x, y, 1).length;

      if (cell.state === 1) {
        cell.nextState = 2;
      } else if (cell.state === 2) {
        cell.nextState = 0;
      } else if (activeNeighborCount === 2) {
        cell.nextState = 1;
      }

      cell.setColor(cell.nextState === 2 ? 255 : 0, cell.nextState > 0 ? 255 : 0, cell.nextState === 2 ? 255 : 0)
    }
  }

  hasNeighborWithState(x, y, state) {
    const self = this;
    return this.neighborList(x, y)
      .some((neighbor) => self.getCell(neighbor.x, neighbor.y).state === state);
  }

  neighborsWithState(x, y, state) {
    const self = this;
    return this.neighborList(x, y)
      .map((neighbor) => self.getCell(neighbor.x, neighbor.y))
      .filter((cell) => cell.state === state);
  }

  static generateCellSpace(width, height) {
    let cells = [];
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

  updateImageData() {
    let data = this.imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % this.width;
      const y = ~~((i / 4) / this.width);
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

  update() {
    this.iteration += 1;
    this.updateCells();
    this.updateImageData();
    this.drawImageData();
  }
}
