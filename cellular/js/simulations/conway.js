// Conway's Game of Life
const conwaySimulation = () => {
  const name = 'Conway';

  const states = { Alive: 1, Dead: 0 };

  const logic = {
    paint: cell => {
      cell.paint(0, cell.state === states.Alive ? 255 : 0, 0);
    },

    update: (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      const activeNeighborCount = cellSpace.neighborsWithState(x, y, 1);

      if (cell.state === states.Alive) {
        if (activeNeighborCount < 2 || activeNeighborCount > 3) {
          cell.nextState = states.Dead;
        }
      } else if (activeNeighborCount === 3) {
        cell.nextState = states.Alive;
      }
    }
  };

  return new Simulation(name, states, logic);
};
