class Cell {
  constructor(state, color = { r: 0, g: 0, b: 0 }) {
    this.color = color;
    this.state = state;
    this.nextState = state;
    this.needsPainting = false;
  }

  forceState(state) {
    this.state = state;
    this.nextState = state;
    this.needsPainting = true;
  }

  paint(r, g, b) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
    this.needsPainting = false;
  }

  commitStateChange() {
    this.needsPainting = this.needsPainting || this.state !== this.nextState;
    this.state = this.nextState;
  }
}

class Simulation {
  constructor(name, states = {}, logic = {}) {
    this.name = name;
    this.states = states;
    this.logic = logic;
  }
}

class CellSpace {
  constructor(canvas, simulations = [], currentSimulation) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext('2d');
    this.imageData = this.context.createImageData(this.width, this.height);
    this.cellSpace = CellSpace.generateCellSpace(this.width, this.height);
    this.iteration = 0;
    this.simulations = simulations;
    this.currentSimulation = currentSimulation;
  }

  static randomColor() {
    return Math.floor(Math.random() * 255);
  }

  static get outOfBoundsError() {
    return new Error('Coordinates are out of bounds');
  }

  static get activeError() {
    return new Error(
      'There is already an active cell at the given coordinates'
    );
  }

  static get notActiveError() {
    return new Error('There is no active cell at the given coordinates');
  }

  get simulationNames() {
    return this.simulations.map(simulation => simulation.name);
  }

  get currentSimulationName() {
    return this.currentSimulation.name;
  }

  setCurrentSimulation(simulationName) {
    this.simulations.forEach((simulation, index) => {
      if (simulation.name === simulationName) {
        this.currentSimulation = simulation;
      }
    });
  }

  rescale(scale) {
    this.canvas.style.transform = `scale(${scale})`;
  }

  clear() {
    if (this.currentSimulation.logic.clear !== undefined) {
      this.currentSimulation.logic.clear(cellSpace);
    } else {
      for (let y = 0; y < this.height; y += 1) {
        for (let x = 0; x < this.width; x += 1) {
          const cell = this.getCell(x, y);
          cell.forceState(0);
        }
      }
    }
  }

  fill(density = 0.1) {
    if (this.currentSimulation.logic.fill !== undefined) {
      this.currentSimulation.logic.fill(cellSpace, density);
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

    this.currentSimulation.logic.update(this, x, y);
  }

  paintCell(x, y) {
    this.validateIsInBounds(x, y);

    const cell = this.getCell(x, y);
    if (!cell.needsPainting) return;

    this.currentSimulation.logic.paint(cell);
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
