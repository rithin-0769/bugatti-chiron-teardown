# Bugatti Chiron Teardown

An interactive Bugatti Chiron teardown experience built with React, Vite, and React Three Fiber.

## Overview

This project showcases a visually rich landing page with:

- scroll-driven hero animation using 160 frame images
- feature cards with animated reveal sections
- a fully interactive 3D teardown scene built with React Three Fiber
- smooth scroll and motion-driven UI transitions
- a custom footer with author credit and quick links

## Built With

- React
- Vite
- React Three Fiber
- @react-three/drei
- GSAP
- Framer Motion
- Lenis

## Project Structure

- `index.html` — main HTML entry point
- `package.json` — dependencies and scripts
- `vite.config.js` — Vite configuration
- `src/` — application source code
  - `App.jsx` — page composition and section order
  - `sections.jsx` — main sections used by the page
  - `components/Scene3D.jsx` — interactive 3D teardown experience
  - `components/Footer.jsx` — footer layout (unused active footer is in `sections.jsx`)
- `public/hero_frames/` — hero animation frame images

## Available Scripts

From the project directory, run:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to view locally.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Deployment

This project is Vite-ready and can be deployed to Vercel or any static host that supports Vite builds.

Recommended settings:

- Build command: `npm run build`
- Output directory: `dist`

## Notes

- The current page renders the active footer defined in `src/sections.jsx`.
- The 3D teardown section is powered by `src/components/Scene3D.jsx`.
- `<Scene3DSection />` is now included in `src/App.jsx`.

## Author

Made by **Rithin Ravoori**.

## License

This project is provided as-is for demonstration and learning purposes.
