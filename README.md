# Shivam Duplex Smart Society — 3D Platform MVP

Interactive 3D digital twin of **Shivam Duplex** (Vadodara, Gujarat) built with Three.js.

## Features

- Full-bleed 3D aerial map (orbit / pan / zoom)
- Street View (eye-level walk mode)
- 2D top-down plan
- Clickable plots with homeowner + vehicle registry
- Private CCTV cone registration
- Street-light & society CCTV fault reporting
- Road-closure / event scheduling with 3D tents & barricades
- Day / Dusk / Night lighting
- Apple Liquid Glass inspired floating UI
- State persisted in browser localStorage
- Mobile-responsive (bottom sheet on small screens)

## Live Demo

After deploying to Vercel the URL will appear here.

## Run locally

```bash
# Any static server works
python3 -m http.server 8765
# or
npx serve
```

Then open http://localhost:8765

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to https://vercel.com/new
3. Import the repository
4. Click **Deploy** (no build settings needed — pure static)

Or use the Vercel CLI:

```bash
npx vercel
```

## Tech

- Three.js r170 (CDN)
- Vanilla JS + modern CSS (backdrop-filter glass)
- No build step required
