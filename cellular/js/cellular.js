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

  hasUnchangedState(state) {
    return this.state === state && this.nextState === state;
  }

  commitStateChange() {
    this.needsPainting = this.needsPainting || this.state !== this.nextState;
    this.state = this.nextState;
  }
}

class Simulation {
  constructor(name, paintLogic, updateLogic) {
    this.name = name;
    this.paintLogic = paintLogic;
    this.updateLogic = updateLogic;
  }
}

const defaultSimulationsList = [
  new Simulation(
    'Conway',
    cell => {
      cell.paint(0, cell.state === 1 ? 255 : 0, 0);
    },
    (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      const activeNeighborCount = cellSpace.neighborsWithState(x, y, 1);

      if (cell.state === 1) {
        if (activeNeighborCount < 2 || activeNeighborCount > 3) {
          cell.nextState = 0;
        }
      } else if (activeNeighborCount === 3) {
        cell.nextState = 1;
      }
    }
  ),

  new Simulation(
    'Move',
    cell => {
      cell.paint(0, cell.state === 1 ? 255 : 0, 0);
    },
    (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      if (cell.state !== 1) return;

      const newX = x + Math.floor(Math.random() * 3) - 1;
      const newY = y + Math.floor(Math.random() * 3) - 1;

      if (cellSpace.isInBounds(newX, newY)) {
        const neighbor = cellSpace.getCell(newX, newY);
        if (neighbor.state !== 1 && neighbor.nextState !== 1) {
          neighbor.nextState = 1;
          cell.nextState = 0;
        }
      }
    }
  ),

  new Simulation(
    'Freeze',
    cell => {
      cell.paint(0, cell.state === 1 ? 255 : 0, cell.state === 2 ? 255 : 0);
    },
    (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      if (cell.state !== 1) return;

      if (cellSpace.hasNeighborWithState(x, y, 2)) {
        cell.nextState = 2;
      } else {
        const newX = x + Math.floor(Math.random() * 3) - 1;
        const newY = y + Math.floor(Math.random() * 3) - 1;

        if (cellSpace.isInBounds(newX, newY)) {
          const neighbor = cellSpace.getCell(newX, newY);
          if (neighbor.state === 0 && neighbor.nextState === 0) {
            neighbor.nextState = 1;
            cell.nextState = 0;
          }

          if (
            cellSpace.isAtEdge(newX, newY) ||
            cellSpace.hasNeighborWithState(newX, newY, 2)
          ) {
            neighbor.nextState = 2;
          }
        }
      }
    }
  ),

  new Simulation(
    'Seeds',
    cell => {
      cell.paint(0, cell.state === 1 ? 255 : 0, 0);
    },
    (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      const activeNeighborCount = cellSpace.neighborsWithState(x, y, 1);

      if (cell.state === 1) {
        cell.nextState = 0;
      } else if (activeNeighborCount === 2) {
        cell.nextState = 1;
      }
    }
  ),

  new Simulation(
    "Brain's Brain",
    cell => {
      cell.paint(
        cell.state === 1 ? 255 : 0,
        cell.state === 1 ? 255 : 0,
        cell.state > 0 ? 255 : 0
      );
    },
    (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      const activeNeighborCount = cellSpace.neighborsWithState(x, y, 1);

      if (cell.state === 0) {
        if (activeNeighborCount === 2) {
          cell.nextState = 1;
        }
      } else {
        cell.nextState = (cell.state + 1) % 3;
      }
    }
  ),

  new Simulation(
    'Mirage',
    cell => {
      cell.paint(cell.state === 1 ? 255 : 0, cell.state === 1 ? 255 : 0, 0);
    },
    (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      const newX = x + Math.floor(Math.random() * 3) - 1;
      const newY = y + 1;

      if (cellSpace.isInBounds(newX, newY)) {
        const neighbor = cellSpace.getCell(newX, newY);

        if (neighbor.state === 1) {
          cell.nextState = 1;
        } else {
          cell.nextState = 0;
        }
      }
    }
  )
];

class CellSpace {
  constructor(canvas, simulations = defaultSimulationsList, currentSimulation = 0) {
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
    return this.simulations[this.currentSimulation].name;
  }

  setCurrentSimulation(simulationName) {
    this.simulations.forEach((simulation, index) => {
      if (simulation.name === simulationName) {
        this.currentSimulation = index;
      }
    })
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

    this.simulations[this.currentSimulation].updateLogic(this, x, y);
  }

  paintCell(x, y) {
    this.validateIsInBounds(x, y);

    const cell = this.getCell(x, y);
    if (!cell.needsPainting) return;

    this.simulations[this.currentSimulation].paintLogic(cell);
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
