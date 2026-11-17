# GTA VI Countdown

A static, no-build countdown to Grand Theft Auto VI (19 November 2026), live at https://gta6.snippface.vip.

- **Your countdown:** detects your time zone and counts down to your local unlock.
- **World map:** every country is coloured by when it unlocks and labelled with a live `days:hours:minutes:seconds` timer. Drag to pan, scroll or pinch to zoom, and tap a country to put it on the main clock. Large countries with several zones (Australia, Russia, Brazil, Mexico, Indonesia) show pins for each zone when you zoom in.
- **Country list:** about 250 countries and territories, with search and sorting by unlock time or name.

Each country unlocks at midnight local time. The US store region (US, Canada and US territories) unlocks together at midnight Eastern.

## Files

- `index.html` – page markup
- `assets/style.css` – styles
- `assets/app.js` – countdown, country data, list
- `assets/map.js` – interactive map
- `assets/world-50m.js` – country shapes (Natural Earth 1:50m via [world-atlas](https://github.com/topojson/world-atlas), ISC), keyed by ISO alpha-2
- `assets/vendor/` – [D3](https://d3js.org) 7.9.0 (ISC) and [topojson-client](https://github.com/topojson/topojson-client) 3.1.0 (ISC)

Open `index.html` directly or host the folder with GitHub Pages.

Unofficial fan project, not affiliated with Rockstar Games or Take-Two Interactive.
