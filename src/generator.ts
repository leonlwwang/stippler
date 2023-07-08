/**
 * @file generator.ts
 * @author Mike Bostock
 * @author Leon Wang
 * A modified version of Mike Bostock's weighted voronoi stippling.
 * 
 * Copyright (c) 2018-2020 Mike Bostock
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
   purpose with or without fee is hereby granted, provided that the above
   copyright notice and this permission notice appear in all copies.
   
   THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

 * https://observablehq.com/@mbostock/voronoi-stippling
 */

import { Delaunay } from 'd3-delaunay';
import './global.css'

// initialize canvas element for the output
const stippler = document.createElement("canvas");
stippler.id = "stippler";
document.body.appendChild(stippler);
const canvas = document.getElementById("stippler") as HTMLCanvasElement;
const context = canvas!.getContext("2d");

// adjustable global values
const IMG_WIDTH = 500;
const PT_WIDTH = 1;
const DENSITY = 17;
const SHARPNESS = 100;
const DRAW = true;
const DOWNLOAD = false;

/**
 * Rescales the image input and the canvas.
 * @param image the input image
 * @param width the desired width to scale to
 * @returns the scaled width and height of the image
 */
function resize(image: HTMLImageElement, width: number): { width: number, height: number } {
    const height = Math.round(width * image.height / image.width);
    context!.canvas.width = width;
    context!.canvas.height = height;
    return { width: width, height: height }
}

/**
 * Builds a raw string .svg path of the stippling, and formats the path as a 
   downloadable .svg file if the DOWNLOAD boolean flag is set to true.
 * @param context the canvas to render the stippling on
 * @param points the points of the stippling
 * @param width the width of the image
 * @param height the height of the image
 * @returns the svg path of the stippling as a raw string
 */
function createStipplingPath(points: Float64Array, width: number, height: number): string {
    let svgPath = '';

    // for every iteration, draws a point and adds the point to the .svg path
    for (let i = 0, n = points.length; i < n; i += 2) {
      const x = points[i], y = points[i + 1];
      svgPath += 'M' + x + ',' + y + ' ';
      svgPath += 'm-' + PT_WIDTH + ',0 ';
      svgPath += 'a' + PT_WIDTH + ',' + PT_WIDTH + ' 0 1,0 ' + PT_WIDTH * 2 + ',0 ';
      svgPath += 'a' + PT_WIDTH + ',' + PT_WIDTH + ' 0 1,0 -' + PT_WIDTH * 2 + ',0 ';
    }

    // download trigger
    if (DOWNLOAD) {
        createSvgDownload(svgPath, "passive.svg", width, height, "black");
    }
    return svgPath;
}

/**
 * Draws the stippling onto the canvas.
 * @param context the canvas to render the stippling on
 * @param points the points of the stippling
 * @param width the width of the image
 * @param height the height of the image
 */
function drawStippling(context: CanvasRenderingContext2D, points: Float64Array, width: number, height: number): void {
    context.fillStyle = "#FFEEDF";
    context.fillRect(0, 0, width, height);
    context.beginPath();
    console.log(points.length);

    // for every iteration, draws a point and adds the point to the .svg path
    for (let i = 0, n = points.length; i < n; i += 2) {
      const x = points[i], y = points[i + 1];
      context.moveTo(x + 1.5, y);
      context.arc(x, y, PT_WIDTH, 0, 2 * Math.PI);
    }
    context.fillStyle = "#000";
    context.fill();
}

/**
 * Takes a raw .svg string and writes it to a .svg file to download.
 * @param svgPath the raw .svg string
 * @param filename the name of the downloaded file
 * @param width the width of the image
 * @param height the height of the image
 * @param color the color of the points
 */
function createSvgDownload(svgPath: string, filename: string, width: number, height: number, color: string): void {
    let header = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\
                   <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '">\
                   <path d="';
    let footer = '" fill="' + color + '" stroke="' + color + '"/>\
                   </svg>';
    svgPath = header + svgPath + footer;

    const blob = new Blob([svgPath], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

const image = new Image();
image.src = "profile-cc.jpg";
image.onload = () => {
    // resize and load image data
    const { width, height } = resize(image, IMG_WIDTH);
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

    const svgPath = createStipplingPath(points, width, height);
    console.log(svgPath);
    // draw trigger
    if (DRAW) {
        drawStippling(context!, points, width, height);
    }
}