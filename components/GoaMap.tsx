"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const geoUrl = "/map/goa-talukas.geojson";

export default function GoaMap() {
  const [hovered, setHovered] = useState("");

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      
      {hovered && (
        <div className="absolute top-4 left-4 bg-white shadow-lg p-3 rounded border">
          <strong>{hovered}</strong>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [74.0, 15.4],
          scale: 8000,
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onMouseEnter={() => {
                  setHovered(
                    geo.properties.NAME_3 || 
                    geo.properties.name || 
                    "Taluka"
                  );
                }}
                onMouseLeave={() => {
                  setHovered("");
                }}
                style={{
                  default: {
                    fill: "#90cdf4",
                    outline: "none",
                  },
                  hover: {
                    fill: "#2b6cb0",
                    outline: "none",
                  },
                  pressed: {
                    fill: "#1a365d",
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}