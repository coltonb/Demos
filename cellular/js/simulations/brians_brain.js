// Brian's Brain
const briansBrainSimulation = () => {
  const name = "Brian's Brain";

  const states = { Alive: 1, Dying: 2, Dead: 0 };

  const logic = {
    paint: cell => {
      cell.paint(
        cell.state === states.Alive ? 255 : 0,
        cell.state === states.Alive ? 255 : 0,
        cell.state >= states.Alive ? 255 : 0
      );
    },
    update: (cellSpace, x, y) => {
      const cell = cellSpace.getCell(x, y);
      const activeNeighborCount = cellSpace.neighborsWithState(
        x,
        y,
        states.Alive
      );

      if (cell.state === states.Dead) {
        if (activeNeighborCount === 2) {
          cell.nextState = states.Alive;
        }
      } else if (cell.state === states.Alive) {
        cell.nextState = states.Dying;
      } else if (cell.state === states.Dying) {
        cell.nextState = states.Dead;
      }
    }
  };

  return new Simulation(name, states, logic);
};
