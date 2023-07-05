# `Animated Stippling`

Taking an implementation of [voronoi stippling](https://observablehq.com/@mbostock/voronoi-stippling) and using SVG morphing to animate it. Need to optimize because the current animation is too CPU heavy for web at the moment. Using the [`d3-delaunay`](https://github.com/d3/d3-delaunay) library.




https://github.com/leonlwwang/stippler/assets/69338674/ef43a90a-108f-49f9-b5fc-49bde7951557




## `Usage`

Pull, run `npm install` and run `npm run dev`. 

The `main.ts` file generates the static stippling images.

The `animator.ts` file animates the stippling SVG paths.

`cache.ts` has raw SVG path data in it.
