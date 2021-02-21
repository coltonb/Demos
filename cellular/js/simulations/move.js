import { Simulation, SimulationLogic } from "./simulation.js";

const states = { Alive: 1, Dead: 0 };

const draw = (cell) => {
  cell.draw(0, cell.state === 1 ? 255 : 0, 0);
};

const update = (grid, x, y) => {
  const cell = grid.getCell(x, y);
  if (cell.state !== states.Alive) return;

  const newX = x + Math.floor(Math.random() * 3) - 1;
  const newY = y + Math.floor(Math.random() * 3) - 1;

  if (grid.isInBounds(newX, newY)) {
    const neighbor = grid.getCell(newX, newY);
    if (
      neighbor.state !== states.Alive &&
      neighbor.nextState !== states.Alive
    ) {
      neighbor.nextState = states.Alive;
      cell.nextState = states.Dead;
    }
  }
};

const logic = new SimulationLogic(draw, update);
const simulation = new Simulation("Move", states, logic);

export default simulation;
