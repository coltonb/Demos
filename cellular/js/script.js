class Cell {
  constructor(properties = {}, color = { r: 0, g: 0, b: 0 }) {
    this.color = color;
    this.properties = properties;
  }

  setColor(r, g, b) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
  }

  updateProperties(properties) {
    Object.assign(
      this.properties,
      properties
    );
  }

  clearProperties() {
    this.properties = {};
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
    this.cellSpace = CellSpace.generateCellSpace(this.width, this.height)
  }

  randomFill(density = 0.10) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const randomValue = Math.random();
        const cell = this.getCell(x, y);
        if (randomValue >= 1 - density) {
          cell.properties = { active: true };
          cell.setColor(0, 255, 0);
        } else {
          cell.clearProperties();
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
      if (!cell.properties.active || cell.properties.lastUpdate === this.iteration) return;

      const newX = x + Math.floor(Math.random() * 3) - 1;
      const newY = y + Math.floor(Math.random() * 3) - 1;

      if (this.isInBounds(newX, newY) && !this.getCell(newX, newY).properties.active)
        this.swapCells(x, y, newX, newY);
    } else if (this.mode == CellSpace.FREEZE_MODE) {
      if (!cell.properties.active || cell.properties.frozen
        || cell.properties.lastUpdate === this.iteration) return;

      cell.properties.lastUpdate = this.iteration;

      const newX = x + Math.floor(Math.random() * 3) - 1;
      const newY = y + Math.floor(Math.random() * 3) - 1;
      if (this.isInBounds(newX, newY) && !this.getCell(newX, newY).properties.active) {
        this.swapCells(x, y, newX, newY);

        if (this.isAtEdge(newX, newY) || this.hasNeighborWithProperty(newX, newY, 'frozen', true)) {
          cell.properties.frozen = true;
          cell.setColor(0, 0, 255);
        }
      } else {
        if (this.isAtEdge(x, y) || this.hasNeighborWithProperty(x, y, 'frozen', true)) {
          cell.properties.frozen = true;
          cell.setColor(0, 0, 255);
        }
      }
    } else if (this.mode == CellSpace.FALL_MODE) {
      if (!cell.properties.active || cell.properties.lastUpdate === this.iteration) return;

      cell.properties.lastUpdate = this.iteration;
      if (this.isInBounds(x, y + 1) && !this.getCell(x, y + 1).properties.active)
        this.swapCells(x, y, x, y + 1);
    } else if (this.mode == CellSpace.CONWAY_MODE) {
      const activeNeighborCount =
        this.neighborsWithProperty(x, y, 'active', true).length;
      if (cell.properties.active) {
        if (activeNeighborCount < 2 || activeNeighborCount > 3) {
          cell.properties.nextActive = false;
        }
      } else {
        if (activeNeighborCount === 3) {
          cell.properties.nextActive = true;
        }
      }
    }
  }

  hasNeighborWithProperty(x, y, property, value) {
    const self = this;
    return this.neighborList(x, y)
      .some((neighbor) => self.getCell(neighbor.x, neighbor.y).properties[property] === value);
  }

  neighborsWithProperty(x, y, property, value) {
    const self = this;
    return this.neighborList(x, y)
      .map((neighbor) => self.getCell(neighbor.x, neighbor.y))
      .filter((cell) => cell.properties[property] === value);
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
    if (this.mode == CellSpace.CONWAY_MODE) {
      for (let y = 0; y < this.height; y += 1) {
        for (let x = 0; x < this.width; x += 1) {
          const cell = this.getCell(x, y);
          cell.properties.active = cell.properties.nextActive;
          cell.setColor(0, cell.properties.active ? 255 : 0, 0);
        }
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
