class Cell {
  constructor(state, color = { r: 0, g: 0, b: 0 }) {
    this.color = color;
    this.state = state;
    this.nextState = state;
    this.needsDraw = false;
  }

  forceState(state) {
    this.state = state;
    this.nextState = state;
    this.needsDraw = true;
  }

  draw(r, g, b) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
    this.needsDraw = false;
  }

  commitStateChange() {
    this.needsDraw = this.needsDraw || this.state !== this.nextState;
    this.state = this.nextState;
  }
}

export { Cell };
