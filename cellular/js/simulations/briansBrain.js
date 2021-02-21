import { Simulation, SimulationLogic } from "./simulation.js";

const states = { Alive: 1, Dying: 2, Dead: 0 };

const draw = (cell) => {
  cell.draw(
    cell.state === states.Alive ? 255 : 0,
    cell.state === states.Alive ? 255 : 0,
    cell.state >= states.Alive ? 255 : 0
  );
};

const update = (grid, x, y) => {
  const cell = grid.getCell(x, y);
  const activeNeighborCount = grid.neighborsWithState(x, y, states.Alive);

  if (cell.state === states.Dead) {
    if (activeNeighborCount === 2) {
      cell.nextState = states.Alive;
    }
  } else if (cell.state === states.Alive) {
    cell.nextState = states.Dying;
  } else if (cell.state === states.Dying) {
    cell.nextState = states.Dead;
  }
};

const logic = new SimulationLogic(draw, update);
const simulation = new Simulation("Brian's Brain", states, logic);

export default simulation;
