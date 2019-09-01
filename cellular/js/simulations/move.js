// Basic Movement
const moveSimulation = () => {
  const name = 'Move';

  const states = { Alive: 1, Dead: 0 };

  const logic = {
    paint: cell => {
      cell.paint(0, cell.state === 1 ? 255 : 0, 0);
    },
    update: (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      if (cell.state !== states.Alive) return;

      const newX = x + Math.floor(Math.random() * 3) - 1;
      const newY = y + Math.floor(Math.random() * 3) - 1;

      if (cellSpace.isInBounds(newX, newY)) {
        const neighbor = cellSpace.getCell(newX, newY);
        if (
          neighbor.state !== states.Alive &&
          neighbor.nextState !== states.Alive
        ) {
          neighbor.nextState = states.Alive;
          cell.nextState = states.Dead;
        }
      }
    }
  };

  return new Simulation(name, states, logic);
};
