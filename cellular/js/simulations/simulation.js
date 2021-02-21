class SimulationLogic {
  _defaultClear(grid) {
    for (let y = 0; y < grid.height; y += 1) {
      for (let x = 0; x < grid.width; x += 1) {
        const cell = grid.getCell(x, y);
        cell.forceState(0);
      }
    }
  }

  constructor(draw, update, fill, clear = this._defaultClear) {
    this.draw = draw;
    this.update = update;
    this.fill = fill;
    this.clear = clear;
  }
}

class Simulation {
  constructor(name, states, logic) {
    this.name = name;
    this.states = states;
    this.logic = logic;
  }
}

export { SimulationLogic, Simulation };
