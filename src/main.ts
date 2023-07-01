import { Delaunay } from 'd3-delaunay';
import './style.css'

const canvas = document.getElementById("stippler") as HTMLCanvasElement;
const context = canvas!.getContext("2d");
const WIDTH = 750;
const DENSITY = 15;
const SHARPNESS = 100;

function resize(image: HTMLImageElement, width: number): { width: number, height: number } {
    const height = Math.round(width * image.height / image.width);
    context!.canvas.width = width;
    context!.canvas.height = height;
    return { width: width, height: height }
}

function drawVoronoi(context: CanvasRenderingContext2D, points: Float64Array, width: number, height: number) {
    context.fillStyle = "#FFEEDF";
    context.fillRect(0, 0, width, height);
    context.beginPath();
    for (let i = 0, n = points.length; i < n; i += 2) {
      const x = points[i], y = points[i + 1];
      context.moveTo(x + 1.5, y);
      context.arc(x, y, 1, 0, 2 * Math.PI);
    }
    context.fillStyle = "#000";
    context.fill();
}  

const image = new Image();
image.src = "profile-c.jpg";
image.onload = () => {
    // resize and load image data
    const { width, height } = resize(image, WIDTH);
    context!.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
    const { data: rgba } = context!.getImageData(0, 0, width, height);
    const data = new Float64Array(width * height);
    for (let i = 0, n = rgba.length / 4; i < n; ++i) data[i] = Math.max(0, 1 - rgba[i * 4] / 254);
    const n = Math.round(width * height / DENSITY)
    
    // generate random points
    const points = new Float64Array(n * 2);
    for (let i = 0; i < n; ++i) {
        for (let j = 0; j < 50; ++j) {
            const x = points[i * 2] = Math.floor(Math.random() * width);
            const y = points[i * 2 + 1] = Math.floor(Math.random() * height);
            if (Math.random() < data[y * width + x]) break;
        }
    }

    // use points to make voronoi
    const delaunay = new Delaunay(points);
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    // relax the diagram around the image data
    const c = new Float64Array(n * 2);
    const s = new Float64Array(n);
    for (let k = 0; k < SHARPNESS; ++k) {
        // compute the weighted centroid for each Voronoi cell
        c.fill(0);
        s.fill(0);
        for (let y = 0, i = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const w = data[y * width + x];
                i = delaunay.find(x + 0.5, y + 0.5, i);
                s[i] += w;
                c[i * 2] += w * (x + 0.5);
                c[i * 2 + 1] += w * (y + 0.5);
            }
        }

        // relax the diagram by moving points to the weighted centroid
        const w = Math.pow(k + 1, -0.8) * 10;
        for (let i = 0; i < n; ++i) {
            const x0 = points[i * 2], y0 = points[i * 2 + 1];
            const x1 = s[i] ? c[i * 2] / s[i] : x0, y1 = s[i] ? c[i * 2 + 1] / s[i] : y0;
            points[i * 2] = x0 + (x1 - x0) * 1.8 + (Math.random() - 0.5) * w;
            points[i * 2 + 1] = y0 + (y1 - y0) * 1.8 + (Math.random() - 0.5) * w;
        }

        voronoi.update();
    }
    console.log(voronoi);
    drawVoronoi(context!, points, width, height);
}