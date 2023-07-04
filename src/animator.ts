import './style.css'

async function addSVG(fname: string, id: string): Promise<void> {
    // fetch svg data and load into svg element
    const f = await fetch(fname).then(response => response.text());
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.innerHTML = f;

    // adjust svg dimensions
    const svgContent = svg.querySelector("svg");
    const svgWidth = svgContent!.getAttribute("width");
    const svgHeight = svgContent!.getAttribute("height");
    svg.setAttribute("width", svgWidth!);
    svg.setAttribute("height", svgHeight!);

    // append the element to the DOM
    const container = document.createElement("div");
    container.id = id;
    container.appendChild(svg);
    document.body.appendChild(container);
}

// addSVG("svg/passive.svg", "passive");
addSVG("svg/active.svg", "active");
