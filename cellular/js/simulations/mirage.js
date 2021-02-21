import { Simulation, SimulationLogic } from "./simulation.js";

const states = { Alive: 1, Dead: 0 };

const draw = (cell) => {
  cell.draw(
    cell.state === states.Alive ? 255 : 0,
    cell.state === states.Alive ? 255 : 0,
    0
  );
};

const update = (grid, x, y) => {
  const cell = grid.getCell(x, y);
  const newX = x + Math.floor(Math.random() * 3) - 1;
  const newY = y + 1;

  if (grid.isInBounds(newX, newY)) {
    const neighbor = grid.getCell(newX, newY);

    if (neighbor.state === states.Alive) {
      cell.nextState = states.Alive;
    } else {
      cell.nextState = states.Dead;
    }
  }
};

const logic = new SimulationLogic(draw, update);
const simulation = new Simulation("Mirage", states, logic);

export default simulation;
