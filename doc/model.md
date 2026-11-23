# Model — Contour Explorer

The two height functions are the bowl `f(x,y) = x² + y²` and the saddle `f(x,y) = x² − y²`. The map draws curves of constant height. The saddle’s dashed curves represent negative heights, and its diagonal lines are the zero contour.

At a probe point, the model evaluates the gradient `(2x, ±2y)` and takes its dot product with the unit direction `(cos θ, sin θ)`. The angle is measured counterclockwise from the positive x-axis. The numerical readout gives the gradient magnitude and direction through its components. The displayed gradient arrow is scaled to fit the plot.

At `(1,1)` on the saddle, the direction at 45° gives zero slope. At the origin every directional derivative is zero, while the surface still rises along the x-axis and falls along the y-axis.
