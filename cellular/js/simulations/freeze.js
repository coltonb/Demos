import { Simulation, SimulationLogic } from "./simulation.js";

const states = { Frozen: 2, Moving: 1, Dead: 0 };

const draw = (cell) => {
  cell.draw(
    0,
    cell.state === states.Moving ? 255 : 0,
    cell.state === states.Frozen ? 255 : 0
  );
};

const update = (grid, x, y) => {
  const cell = grid.getCell(x, y);
  if (cell.state !== states.Moving) return;

  if (grid.hasNeighborWithState(x, y, states.Frozen)) {
    cell.nextState = states.Frozen;
  } else {
    const newX = x + Math.floor(Math.random() * 3) - 1;
    const newY = y + Math.floor(Math.random() * 3) - 1;

    if (grid.isInBounds(newX, newY)) {
      const neighbor = grid.getCell(newX, newY);
      if (
        neighbor.state === states.Dead &&
        neighbor.nextState === states.Dead
      ) {
        neighbor.nextState = states.Moving;
        cell.nextState = states.Dead;
      }

      if (
        grid.isAtEdge(newX, newY) ||
        grid.hasNeighborWithState(newX, newY, states.Frozen)
      ) {
        neighbor.nextState = states.Frozen;
      }
    }
  }
};

const logic = new SimulationLogic(draw, update);
const simulation = new Simulation("Freeze", states, logic);

export default simulation;
