// initialize canvas element for the output
const stippler = document.createElement("canvas");
stippler.id = "stippler";
document.body.appendChild(stippler);
const canvas = document.getElementById("stippler");
const context = canvas.getContext("2d");

// adjustable global values
const IMG_WIDTH = 500;
const PT_WIDTH = 1; // point width always looks smaller on the webpage vs downloaded svg
const DENSITY = 17; // lower is more dense
const SHARPNESS = 100;
const DRAW = false;
const DOWNLOAD = false;

const image = new Image();
image.src = "profile-cc.jpg";
image.onload = () => {
    // resize and load image data
    const { width, height } = resize(image, IMG_WIDTH);
    // comment drawImage() out to generate the randomized points in a square
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
    const { data: rgba } = context.getImageData(0, 0, width, height);
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

    console.log('points successfully generated with length: ' + points.length);
    context.clearRect(0, 0, width, height);

    const svgPath = createStipplingPath(points, width, height);
    // console.log(svgPath);
    // draw trigger
    if (DRAW) {
        // drawStipplingByPath(context, points, width, height);
        drawStipplingByElement(points, width, height);
    }
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
function createStipplingPath(points, width, height) {
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
function drawStipplingByPath(context, points, width, height) {
    context.fillStyle = "#FFEEDF";
    context.fillRect(0, 0, width, height);
    context.beginPath();
    console.log(points.length);

    // for every iteration, draws a point and adds the point to the .svg path
    for (let i = 0, n = points.length; i < n; i += 2) {
      const x = points[i], y = points[i + 1];
      console.log(x, y);
      context.moveTo(x + 1.5, y);
      context.arc(x, y, PT_WIDTH, 0, 2 * Math.PI);
    }
    context.fillStyle = "#000";
    context.fill();
}

/**
 * Draws the stippling as web elements.
 * @param points the points of the stippling
 * @param width the width of the image
 * @param height the height of the image
 */
function drawStipplingByElement(points, width, height) {
    let container = document.createElement("div");
    container.id = "container";
    document.body.appendChild(container);
    drawUniformDots(container, points, width, height);
    let dots = container.children;
    for (let i = 0, n = points.length; i < n; i += 2) {
        const x = points[i], y = points[i + 1];
        insertTransformation(dots[i/2], x, y);
        // drawDot(container, x, y);
    }
}

function drawUniformDots(container, points, w, h) {
    let numDots = points.length / 2;
    let aspectRatio = w / h;
    let numCols = Math.round(Math.sqrt(numDots * aspectRatio));
    let numRows = Math.round(numDots / numCols);
    if (numRows * numCols < numDots) {
        numRows++;
    }
    let xSpacing = w / (numCols - 1);
    let ySpacing = h / (numRows - 1);
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            let dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = (col * xSpacing) + 'px';
            dot.style.top = (row * ySpacing) + 'px';
            container.appendChild(dot);
        }
    }
}

function insertTransformation(dot, x, y) {
    moveDot(dot, x, y, 1, 'cubic-bezier(.7,0,0,1)');
}

function moveDot(dot, newX, newY, duration, curve) {
    // if (curve) {
    //     dot.style.transition = `transform ${duration}s ${curve}`;
    // } else {
    //     dot.style.transition = `transform ${duration}s`;
    // }
    const currX = dot.offsetLeft;
    const currY = dot.offsetTop;
    const translateX = newX - currX;
    const translateY = newY - currY;
    console.log(translateX, translateY);
    dot.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
}

function drawDot(container, x, y) {
    let dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    container.appendChild(dot);
}

/**
 * Takes a raw .svg string and writes it to a .svg file to download.
 * @param svgPath the raw .svg string
 * @param filename the name of the downloaded file
 * @param width the width of the image
 * @param height the height of the image
 * @param color the color of the points
 */
function createSvgDownload(svgPath, filename, width, height, color) {
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
