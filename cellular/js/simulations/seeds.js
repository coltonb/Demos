// Seeds
const seedsSimulation = () => {
  const name = 'Seeds';

  const states = { Alive: 1, Dead: 0 };

  const logic = {
    paint: cell => {
      cell.paint(0, cell.state === states.Alive ? 255 : 0, 0);
    },
    update: (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      const activeNeighborCount = cellSpace.neighborsWithState(
        x,
        y,
        states.Alive
      );

      if (cell.state === states.Alive) {
        cell.nextState = states.Dead;
      } else if (activeNeighborCount === 2) {
        cell.nextState = states.Alive;
      }
    }
  };

  return new Simulation(name, states, logic);
};
