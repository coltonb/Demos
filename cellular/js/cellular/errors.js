function CoordinatesOutOfBoundError() {
  throw new Error("Coordinates out of bounds");
}

CoordinatesOutOfBoundError.prototype = Error.prototype;

export { CoordinatesOutOfBoundError };
