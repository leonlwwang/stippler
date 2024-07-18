import { Delaunay } from 'd3-delaunay'

self.onmessage = async (event) => {
  const start = new Date()
  console.log('worker started')

  const { imageData, density, sharpness } = event.data
  const points = await generateVoronoiPoints(imageData, density, sharpness)

  const end = new Date()
  console.log('worker finished in ' + (end - start) / 1000 + ' sec')

  self.postMessage(points)
}

const generateVoronoiPoints = async (imageData, density, sharpness) => {
  const { width, height, data: rgba } = imageData
  const data = convertToGrayscale(rgba, width, height)
  const points = generateRandomPoints(width, height, density, data)

  const delaunay = new Delaunay(points)
  const voronoi = delaunay.voronoi([0, 0, width, height])

  refinePoints(points, data, width, height, sharpness, delaunay, voronoi)

  return points
}

const convertToGrayscale = (rgba, width, height) => {
  const data = new Float64Array(width * height)
  for (let i = 0, n = rgba.length / 4; i < n; ++i) {
    data[i] = Math.max(0, 1 - rgba[i * 4] / 254)
  }
  return data
}

const generateRandomPoints = (width, height, density, data) => {
  const n = Math.round((width * height) / density)
  const points = new Float64Array(n * 2)
  for (let i = 0; i < n; ++i) {
    for (let j = 0; j < 50; ++j) {
      const x = (points[i * 2] = Math.floor(Math.random() * width))
      const y = (points[i * 2 + 1] = Math.floor(Math.random() * height))
      if (Math.random() < data[y * width + x]) break
    }
  }
  return points
}

const refinePoints = (points, data, width, height, sharpness, delaunay, voronoi) => {
  const n = points.length / 2
  const c = new Float64Array(n * 2)
  const s = new Float64Array(n)

  for (let k = 0; k < sharpness; ++k) {
    c.fill(0)
    s.fill(0)
    for (let y = 0, i = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const w = data[y * width + x]
        i = delaunay.find(x + 0.5, y + 0.5, i)
        s[i] += w
        c[i * 2] += w * (x + 0.5)
        c[i * 2 + 1] += w * (y + 0.5)
      }
    }

    const w = Math.pow(k + 1, -0.8) * 10
    for (let i = 0; i < n; ++i) {
      const x0 = points[i * 2],
        y0 = points[i * 2 + 1]
      const x1 = s[i] ? c[i * 2] / s[i] : x0,
        y1 = s[i] ? c[i * 2 + 1] / s[i] : y0
      points[i * 2] = x0 + (x1 - x0) * 1.8 + (Math.random() - 0.5) * w
      points[i * 2 + 1] = y0 + (y1 - y0) * 1.8 + (Math.random() - 0.5) * w
    }

    voronoi.update()
  }
}
