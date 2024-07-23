export const cubic = (x1, y1, x2, y2) => {
  const p1 = { x: x1, y: y1 }
  const p2 = { x: x2, y: y2 }

  const y = (t) =>
    Math.pow(1 - t, 3) * 0 +
    3 * Math.pow(1 - t, 2) * t * p1.y +
    3 * (1 - t) * Math.pow(t, 2) * p2.y +
    Math.pow(t, 3) * 1

  const x = (t) =>
    Math.pow(1 - t, 3) * 0 +
    3 * Math.pow(1 - t, 2) * t * p1.x +
    3 * (1 - t) * Math.pow(t, 2) * p2.x +
    Math.pow(t, 3) * 1

  return { x, y }
}
