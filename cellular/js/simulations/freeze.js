// Basic Movement + Cell Freezing
const freezeSimulation = () => {
  const name = 'Freeze';

  const states = { Frozen: 2, Moving: 1, Dead: 0 };

  const logic = {
    paint: cell => {
      cell.paint(
        0,
        cell.state === states.Moving ? 255 : 0,
        cell.state === states.Frozen ? 255 : 0
      );
    },
    update: (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      if (cell.state !== states.Moving) return;

      if (cellSpace.hasNeighborWithState(x, y, states.Frozen)) {
        cell.nextState = states.Frozen;
      } else {
        const newX = x + Math.floor(Math.random() * 3) - 1;
        const newY = y + Math.floor(Math.random() * 3) - 1;

        if (cellSpace.isInBounds(newX, newY)) {
          const neighbor = cellSpace.getCell(newX, newY);
          if (
            neighbor.state === states.Dead &&
            neighbor.nextState === states.Dead
          ) {
            neighbor.nextState = states.Moving;
            cell.nextState = states.Dead;
          }

          if (
            cellSpace.isAtEdge(newX, newY) ||
            cellSpace.hasNeighborWithState(newX, newY, states.Frozen)
          ) {
            neighbor.nextState = states.Frozen;
          }
        }
      }
    }
  };

  return new Simulation(name, states, logic);
};
