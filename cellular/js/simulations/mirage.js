// Mirage-like effect
const mirageSimulation = () => {
  const name = 'Mirage';

  const states = { Alive: 1, Dead: 0 };

  const logic = {
    paint: cell => {
      cell.paint(
        cell.state === states.Alive ? 255 : 0,
        cell.state === states.Alive ? 255 : 0,
        0
      );
    },
    update: (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      const newX = x + Math.floor(Math.random() * 3) - 1;
      const newY = y + 1;

      if (cellSpace.isInBounds(newX, newY)) {
        const neighbor = cellSpace.getCell(newX, newY);

        if (neighbor.state === states.Alive) {
          cell.nextState = states.Alive;
        } else {
          cell.nextState = states.Dead;
        }
      }
    }
  };

  return new Simulation(name, states, logic);
};
