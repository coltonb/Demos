// Water
const waterSimulation = () => {
  const name = 'Water';

  const states = {
    Water: {
      empty: false,
      water: true,
      currentFlowStep: 0,
      flowSteps: 0,
      flowDirection: 1
    },
    Empty: { empty: true },
    Dirt: { empty: false, wall: true }
  };

  const logic = {
    paint: cell => {
      cell.paint(
        cell.state.wall ? 100 : 0,
        cell.state.wall ? 100 : 0,
        cell.state.water ? 255 : 0
      );
    },
    update: (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      if (cell.state.water) {
        if (cellSpace.isInBounds(x, y + 1)) {
          const neighbor = cellSpace.getCell(x, y + 1);
          if (neighbor.state.empty && neighbor.nextState.empty) {
            cell.state.flowSteps = Math.max(cell.state.flowSteps - 10, 0);
            neighbor.nextState = cell.state;
            cell.nextState = neighbor.state;
            return;
          }
        }

        const newX = x + cell.state.flowDirection;

        if (cellSpace.isInBounds(newX, y)) {
          const neighbor = cellSpace.getCell(newX, y);
          if (neighbor.state.empty && neighbor.nextState.empty) {
            cell.state.currentFlowStep += 1;
            if (cell.state.currentFlowStep > cell.state.flowSteps) {
              cell.state.flowSteps = Math.min(cell.state.flowSteps + 1, 50);
              cell.state.currentFlowStep = 0;
              neighbor.nextState = cell.state;
              cell.nextState = neighbor.state;
            }
            return;
          }
        }

        cell.state.flowDirection = -cell.state.flowDirection;
      }
    },
    fill: (cellSpace, density) => {
      for (let y = 0; y < cellSpace.height; y += 1) {
        for (let x = 0; x < cellSpace.width; x += 1) {
          const cell = cellSpace.getCell(x, y);
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
    },
    clear: (cellSpace) => {
      for (let y = 0; y < cellSpace.height; y += 1) {
        for (let x = 0; x < cellSpace.width; x += 1) {
          cellSpace.getCell(x, y).forceState(Object.assign({}, states.Empty));
        }
      }
    }
  };

  return new Simulation(name, states, logic);
};
