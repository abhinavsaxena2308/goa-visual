# Goa Map Visualization

An interactive map visualization of Goa's talukas (administrative divisions) with educational statistics.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Mapping**: Leaflet & React Leaflet
- **Icons**: Heroicons

## Data & Resources

The project uses geographic boundaries and educational statistics:

- **Geographic Data**:
  - [GADM](https://gadm.org/download_country.html): Source for high-resolution administrative area boundaries (Administrative Level 3 used for talukas).
  - [Mapshaper](https://mapshaper.org/): Used for processing, simplifying, and converting geographic data formats like GeoJSON.
  - `goa-talukas.geojson`: Geographic boundaries for each taluka in Goa.

- **Educational Data**:
  - `taluka-data.json`: Educational statistics including:
    - Literacy rates (overall, male, female)
    - Number of schools and colleges
    - Dropout rates

## Features in Detail

### Map Interactions

- Hover over any taluka to highlight it and view statistics
- Click zoom buttons to zoom in/out
- Scroll wheel zoom is disabled for better UX

### Data Display

The info panel shows:
- Literacy Rate
- Male Literacy
- Female Literacy
- Number of Schools
- Number of Colleges
- Dropout Rate


