# Career film

Renders `public/media/career.mp4` (1920x1080, 30 fps, about 40 s) from the `timeline` and `figures` in `src/data/resume.json`. Re-run it after changing either.

`build.py` writes `video.html`, a page whose `render(t)` draws the frame at time `t`. `capture.mjs` steps through every frame in headless Chrome and saves PNGs; ffmpeg encodes them.

```sh
cd tools/video
python3 build.py
google-chrome --headless=new --remote-debugging-port=9333 --user-data-dir=/tmp/film-chrome about:blank &
node capture.mjs frames
ffmpeg -framerate 30 -i frames/%05d.png -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart ../../public/media/career.mp4
ffmpeg -i frames/00078.png -q:v 3 ../../public/media/career-poster.jpg
```

Needs `npm install` first (the page uses the Schibsted Grotesk files from `node_modules`), Python 3, Chrome and ffmpeg. `frames/` and `video.html` are generated and ignored.
