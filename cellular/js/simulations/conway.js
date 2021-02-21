import { Simulation, SimulationLogic } from "./simulation.js";

const states = { Alive: 1, Dead: 0 };

const draw = (cell) => {
  cell.draw(0, cell.state === states.Alive ? 255 : 0, 0);
};

const update = (grid, x, y) => {
  const cell = grid.getCell(x, y);
  const activeNeighborCount = grid.neighborsWithState(x, y, 1);

  if (cell.state === states.Alive) {
    if (activeNeighborCount < 2 || activeNeighborCount > 3) {
      cell.nextState = states.Dead;
    }
  } else if (activeNeighborCount === 3) {
    cell.nextState = states.Alive;
  }
};

const logic = new SimulationLogic(draw, update);
const simulation = new Simulation("Conway", states, logic);

export default simulation;
