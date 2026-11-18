# Convolution Lab

An interactive, browser-based convolution playground. Edit a 3×3 or 5×5 kernel, draw on a 28×28 grayscale grid, and inspect the live feature map. Hover or click the output to highlight its input neighborhood; the arrow keys also move the selected output cell when the feature map is focused.

The calculation uses image intensity 0 for white and 1 for black, stride 1, zero padding, and an unflipped kernel (cross-correlation, as commonly used in neural networks). The displayed output is normalized to the current feature map's minimum and maximum; a constant map is shown in neutral gray. The selected raw output is shown separately. This is an educational visualization, not image processing on an uploaded file.

## Run locally

Open `index.html` in a browser, or run `python -m http.server 8000` and open http://localhost:8000.

## GitHub Pages

Push the files to GitHub, then in **Settings → Pages** select **Deploy from a branch**, choose the branch and `/ (root)`, and save. The site is static and needs no build step or server.
