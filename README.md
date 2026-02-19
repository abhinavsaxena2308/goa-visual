# Goa Map Visualization

An interactive map visualization of Goa's talukas (administrative divisions) with educational statistics.

## Features

- **Interactive Map**: Hover over any taluka to view detailed statistics
- **Educational Data**: Displays literacy rates, schools, colleges, and dropout rates for each taluka
- **Custom Zoom Controls**: Easy-to-use zoom in/out buttons
- **Responsive Design**: Built with Tailwind CSS for a modern, responsive interface
- **Dynamic Markers**: Each taluka is labeled with custom map markers

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Mapping**: Leaflet & React Leaflet
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   └── GoaMap.tsx          # Main map component
├── public/
│   └── data/
│       ├── goa-talukas.geojson    # GeoJSON boundaries
│       └── taluka-data.json        # Educational statistics
└── package.json
```

## Data

The project uses two main data sources:

- **goa-talukas.geojson**: Geographic boundaries for each taluka
- **taluka-data.json**: Educational statistics including:
  - Literacy rates (overall, male, female)
  - Number of schools and colleges
  - Dropout rates

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

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


