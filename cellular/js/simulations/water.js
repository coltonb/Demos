import { Simulation, SimulationLogic } from "./simulation.js";

const states = {
  Water: {
    empty: false,
    water: true,
    currentFlowStep: 0,
    flowSteps: 0,
    flowDirection: 1,
  },
  Empty: { empty: true },
  Dirt: { empty: false, wall: true },
};

const draw = (cell) => {
  cell.draw(
    cell.state.wall ? 100 : 0,
    cell.state.wall ? 100 : 0,
    cell.state.water ? 255 : 0
  );
};

const update = (grid, x, y) => {
  const cell = grid.getCell(x, y);

  if (cell.state.water) {
    if (grid.isInBounds(x, y + 1)) {
      const neighbor = grid.getCell(x, y + 1);
      if (neighbor.state.empty && neighbor.nextState.empty) {
        cell.state.flowSteps = Math.max(cell.state.flowSteps - 10, 0);
        neighbor.nextState = cell.state;
        cell.nextState = neighbor.state;
        return;
      }
      if (neighbor.state.water && neighbor.nextState.water) {
        neighbor.state.flowSteps = Math.max(neighbor.state.flowSteps - 10, 0);
      }
    }

    const newX = x + cell.state.flowDirection;

    if (grid.isInBounds(newX, y)) {
      const neighbor = grid.getCell(newX, y);
      if (neighbor.state.empty && neighbor.nextState.empty) {
        cell.state.currentFlowStep += 1;
        if (cell.state.currentFlowStep > cell.state.flowSteps) {
          cell.state.flowSteps += 1;
          cell.state.currentFlowStep = 0;
          neighbor.nextState = cell.state;
          cell.nextState = neighbor.state;
        }
        return;
      }
      if (neighbor.state.water && neighbor.nextState.water) {
        cell.state.flowSteps += 1;
        neighbor.state.flowSteps = Math.max(neighbor.state.flowSteps - 1, 0);
      }
    }

    cell.state.flowDirection = -cell.state.flowDirection;
  }
};

const fill = (grid, density) => {
  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      const cell = grid.getCell(x, y);
      if (Math.random() >= 1 - density) {
        if (Math.random() > 0.8) {
          cell.forceState(Object.assign({}, states.Water));
        } else {
          cell.forceState(Object.assign({}, states.Dirt));
        }
      } else {
        cell.forceState(Object.assign({}, states.Empty));
      }
    }
  }
};

const clear = (grid) => {
  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      grid.getCell(x, y).forceState(Object.assign({}, states.Empty));
    }
  }
};

const logic = new SimulationLogic(draw, update, fill, clear);
const simulation = new Simulation("Water", states, logic);

export default simulation;
