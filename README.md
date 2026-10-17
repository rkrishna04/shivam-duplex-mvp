# Shivam Duplex Smart Society — 3D Platform MVP

Interactive 3D digital twin of **Shivam Duplex**, Vadodara (off D Mart Road, near Kapurai Police Station).

Built from the exact annotated satellite map:
- **Black dots** → ~155 duplex houses
- **Yellow lines** → internal road network
- **Green areas** → community parks
- **Pink dot** → Society Office
- **Red outline** → society boundary

## Features

- Full 3D aerial view with orbit / pan / zoom
- 2D Plan mode
- Street-level walk mode (W/A/S/D)
- Click any house → edit owner, phone, vehicle, plate
- Committee houses pre-highlighted (gold)
- Society Office (pink building)
- 16 street lights + 5 CCTV poles with coverage cones
- Report / resolve infrastructure faults
- Schedule road closures (tent + barricades)
- Day / Dusk / Night lighting
- Mini radar
- Liquid Glass UI
- State saved in browser localStorage

## Run locally

```bash
npx serve .
# or
python3 -m http.server 8765
```

Open http://localhost:8765

## Deploy

Just import this repo on [vercel.com/new](https://vercel.com/new) — no build step required.
