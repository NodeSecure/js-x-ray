// Import Internal Dependencies
import { rootLocation } from "./rootLocation.js"

export function toArrayLocation(location = rootLocation()) {
  const { start, end = start } = location;

  return [
    [start.line || 0, start.column || 0],
    [end.line || 0, end.column || 0]
  ];
}
