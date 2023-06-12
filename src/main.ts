import { Delaunay, Voronoi } from 'd3-delaunay';
import './style.css'

type Point = [number, number];

function generateVoronoi(imageData: ImageData): Voronoi<Delaunay.Point> {
  const pts: Point[] = [];
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      pts.push([x, y] as Point);
    }
  }
  const delaunay = Delaunay.from(pts);
  const voronoi = delaunay.voronoi([0, 0, imageData.width, imageData.height]);
  return voronoi;
}

function renderOnCanvas(voronoi: Voronoi<Delaunay.Point>, image: HTMLImageElement): void {
  const canvas = document.getElementById('output') as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  canvas.height = image.height;
  canvas.width = image.width;

  if (context) {
    context.fillStyle = '#FFEEDF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.beginPath();

    const { circumcenters } = voronoi;
    for (let i = 0, n = 10; i < n; i += 2) {
      const x = circumcenters[i], y = circumcenters[i+1];
      console.log(x, y);
      context.moveTo(x + 1.5, y);
      context.arc(x, y, 1.5, 0, 2 * Math.PI);
    }
    
    context.fillStyle = '#000';
    context.fill();
    console.log('Render OK');
  } else {
    console.error('There was an issue rendering the diagram: ' + context);
  }
}

const imagePath = '/profile.jpg';
const image = new Image();

image.onload = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  console.log("width: " + image.width);
  console.log("height: " + image.height);
  canvas.width = image.width;
  canvas.height = image.height;
  ctx?.drawImage(image, 0, 0);
  const imageData = ctx?.getImageData(0, 0, image.width, image.height);

  if (imageData) {
    const voronoi = generateVoronoi(imageData);
    console.log(voronoi);
    renderOnCanvas(voronoi, image);
  } else {
    console.error('Failed to process image data: ' + imageData);
  }
};

image.onerror = (error) => {
  console.error('Error loading image: ', error);
}

image.src = imagePath;
