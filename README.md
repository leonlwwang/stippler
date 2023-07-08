# `Animated Stippling`

Taking an implementation of [voronoi stippling](https://observablehq.com/@mbostock/voronoi-stippling) and using SVG morphing to animate it. Using the [`d3-delaunay`](https://github.com/d3/d3-delaunay) library.




https://github.com/leonlwwang/stippler/assets/69338674/ef43a90a-108f-49f9-b5fc-49bde7951557




## `Usage`

Pull to local machine, `npm install`, and `npm run dev`. 

The `main.ts` and `index.html` files use CSS .svg morphing to animate the stippling paths.

The `generator.ts` and `generator.html` files generate the static stippling images used for animation. Activating the `DOWNLOAD` flag in the generator saves the .svg file locally. Examples located in `svg/`.

`cache.ts` has raw SVG path data in it, it's used as an import in main.
