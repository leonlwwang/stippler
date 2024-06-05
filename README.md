# `Animated Stippling`

[Try it live](https://leonlwwang.github.io/stippler/)

Using an implementation of [voronoi stippling](https://observablehq.com/@mbostock/voronoi-stippling), creates a stipple drawing of an image input and animates it. Uses the [`d3-delaunay`](https://github.com/d3/d3-delaunay) library.

Revamped with matured UI, major performance enhancements including offloaded point rendering to a web worker and rendering the stipple as a bitmap instead of a vector.
