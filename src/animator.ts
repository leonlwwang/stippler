import './style.css'
import { ACTIVE, PASSIVE } from './cache'

/**
 * Loads a local .svg file onto the DOM.
 * @param fname file path
 * @param func callback function
 */
async function drawSVG(fname: string, func: Function | null): Promise<void> {
    const f = await fetch(fname).then(response => response.text());

    // Create a temporary div element to parse the SVG content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = f;
  
    // Extract the inner SVG element
    const innerSvg = tempDiv.querySelector("svg");
  
    // Assign ID and adjust dimensions
    innerSvg!.id = "stippling";
    const svgWidth = innerSvg!.getAttribute("width");
    const svgHeight = innerSvg!.getAttribute("height");
    innerSvg!.setAttribute("width", svgWidth!);
    innerSvg!.setAttribute("height", svgHeight!);
  
    // Give path element a CSS class
    const pathElement = innerSvg!.querySelector("path");
    pathElement!.id = "stippling-passive";
  
    // Append the inner SVG element to the document body
    document.body.appendChild(innerSvg!);

    // callback
    if (func) {
        func();
    }
}

/**
 * Animate the stippling.
 */
function animate(): void {
    const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animate.id = "stippling-active";
    animate.setAttribute("dur", "5s");
    animate.setAttribute("repeatCount", "infinite");
    animate.setAttribute("attributeName", "d");
    animate.setAttribute("values", PASSIVE + ';' + ACTIVE + ';' + ACTIVE);
    animate.setAttribute("fill", "freeze");
    animate.setAttribute("calcMode", "spline");
    animate.setAttribute("keySplines", "0.4 0 0.2 1; 0.4 0 0.2 1");
    const path = document.getElementById("stippling-passive");
    path!.appendChild(animate);
}

drawSVG("svg/passive.svg", () => animate());
