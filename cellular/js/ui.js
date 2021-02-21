import { Grid } from "./cellular/index.js";
import * as simulations from "./simulations/index.js";

const canvas = document.createElement("canvas");
canvas.width = 250;
canvas.height = 250;
document.querySelector("#container").appendChild(canvas);

const simulationMap = Object.values(simulations).reduce((obj, simulation) => {
  return { ...obj, [simulation.name]: simulation };
}, {});
const selectedSimulation = Object.keys(simulationMap)[0];

const grid = new Grid(canvas, simulationMap[selectedSimulation]);

let controls = {
  mouseDown: false,
  mouseState: 1,
  selectedSimulation: selectedSimulation,
  cell: null,
  frameLimit: 144,
  "Brush Size": 2,
  step: () => {
    grid.step();
  },
  fillDensity: 0.1,
  clear: () => {
    grid.clear();
  },
  fill: () => {
    grid.fill(controls.fillDensity);
  },
  toggleCell: (centerX, centerY) => {
    for (
      let y = centerY - controls["Brush Size"];
      y < centerY + controls["Brush Size"];
      y += 1
    ) {
      for (
        let x = centerX - controls["Brush Size"];
        x < centerX + controls["Brush Size"];
        x += 1
      ) {
        if (grid.isInBounds(x, y)) {
          grid
            .getCell(x, y)
            .forceState(
              JSON.parse(JSON.stringify(grid.simulation.states[controls.cell]))
            );
        }
      }
    }
  },
  setSimulation: (name) => {
    const simulation = simulationMap[name];

    grid.simulation = simulation;
    controls.fill();

    const states = Object.keys(simulation.states);
    controls.cell = states[0];
    controls.stateSelection = controls.stateSelection.options(states);
  },
};

canvas.addEventListener("mousedown", (e) => {
  controls.mouseDown = true;
  const canvasBoundingRect = canvas.getBoundingClientRect();
  const x = Math.floor(
    canvas.getAttribute("width") *
      ((e.clientX - canvasBoundingRect.x) / canvasBoundingRect.width)
  );
  const y = Math.floor(
    canvas.getAttribute("height") *
      ((e.clientY - canvasBoundingRect.y) / canvasBoundingRect.height)
  );
  controls.mouseState = controls.toggleCell(x, y);
});

window.addEventListener("mouseup", () => (controls.mouseDown = false));

canvas.addEventListener("mousemove", (e) => {
  if (controls.mouseDown) {
    const canvasBoundingRect = canvas.getBoundingClientRect();
    const x = Math.floor(
      canvas.getAttribute("width") *
        ((e.clientX - canvasBoundingRect.x) / canvasBoundingRect.width)
    );
    const y = Math.floor(
      canvas.getAttribute("height") *
        ((e.clientY - canvasBoundingRect.y) / canvasBoundingRect.height)
    );
    controls.mouseState = controls.toggleCell(x, y);
  }
});

const gui = new dat.GUI();

const simulationFolder = gui.addFolder("Simulation");
simulationFolder
  .add(controls, "selectedSimulation", Object.keys(simulationMap))
  .name("Mode")
  .onChange((name) => {
    controls.setSimulation(name);
  });
simulationFolder.add(controls, "frameLimit", 0, 144).name("FPS Limit");
simulationFolder.add(controls, "step").name("Step");

const fillFolder = gui.addFolder("Fill");
fillFolder.add(controls, "fillDensity", 0.01, 1.0).name("Density");
fillFolder.add(controls, "fill").name("Fill");
fillFolder.add(controls, "clear").name("Clear");

const interactionFolder = gui.addFolder("Interaction");
controls.stateSelection = interactionFolder
  .add(controls, "cell", [])
  .name("Cell");
interactionFolder.add(controls, "Brush Size", 2, 6, 1);

simulationFolder.open();
fillFolder.open();
interactionFolder.open();

controls.setSimulation(selectedSimulation);

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

let lastUpdate = Date.now();

function updateLoop() {
  stats.begin();
  if (Date.now() - lastUpdate > (1 / controls.frameLimit) * 1000) {
    lastUpdate = Date.now();
    grid.step();
  }
  grid.draw();
  stats.end();
  requestAnimationFrame(updateLoop);
}

updateLoop();
