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
  selectedSimulation: selectedSimulation,
  Cell: null,
  "FPS Limit": 60,
  "Brush Size": 1,
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
  toggleCell: (startX, startY) => {
    const size = controls["Brush Size"] - 1;

    for (let y = startY; y <= startY + size; y += 1) {
      for (let x = startX; x <= startX + size; x += 1) {
        if (grid.isInBounds(x, y)) {
          const state = JSON.parse(
            JSON.stringify(grid.simulation.states[controls.Cell])
          );
          grid.getCell(x, y).forceState(state);
        }
      }
    }
  },
  setSimulation: (name) => {
    const simulation = simulationMap[name];

    grid.simulation = simulation;
    controls.fill();

    const states = Object.keys(simulation.states);
    controls.Cell = states[0];
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
  controls.toggleCell(x, y);
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
    controls.toggleCell(x, y);
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
simulationFolder.add(controls, "FPS Limit", 0, 144);
simulationFolder.add(controls, "step").name("Step");

const fillFolder = gui.addFolder("Fill");
fillFolder.add(controls, "fillDensity", 0.01, 1.0).name("Density");
fillFolder.add(controls, "fill").name("Fill");
fillFolder.add(controls, "clear").name("Clear");

const interactionFolder = gui.addFolder("Interaction");
controls.stateSelection = interactionFolder.add(controls, "Cell", []);
interactionFolder.add(controls, "Brush Size", 1, 10, 1);

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

  let deltatime = Date.now() - lastUpdate;
  const frameDuration = (1 / controls["FPS Limit"]) * 1000;
  while (deltatime > frameDuration) {
    lastUpdate = Date.now();
    deltatime -= frameDuration;
    grid.step();
  }
  grid.draw();

  stats.end();
  requestAnimationFrame(updateLoop);
}

updateLoop();
