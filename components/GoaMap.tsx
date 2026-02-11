"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";

const geoUrl = "/map/goa-talukas.geojson";

// Map GeoJSON names → correct taluka names
const NAME_MAP: Record<string, string> = {
  Dicholi: "Bicholim",
  Mapuca: "Bardez",
  "n.a. ( 1882)": "Tiswadi",
  Panaji: "Tiswadi",
  Pernem: "Pernem",
  Ponda: "Ponda",
  Valpoy: "Sattari",
  Chauri: "Canacona",
  Madgaon: "Salcete",
  Quepem: "Quepem",
  Sambaji: "Mormugao",
  Sanguem: "Sanguem",
};

// North Goa talukas get green shades, South Goa talukas get orange shades
const NORTH_COLORS = [
  "#bbf7d0", // green-200
  "#86efac", // green-300
  "#4ade80", // green-400
  "#a7f3d0", // emerald-200
  "#6ee7b7", // emerald-300
  "#34d399", // emerald-400
  "#99f6e4", // teal-200
];

const SOUTH_COLORS = [
  "#fed7aa", // orange-200
  "#fdba74", // orange-300
  "#fb923c", // orange-400
  "#fde68a", // amber-200
  "#fcd34d", // amber-300
];

export default function GoaMap() {
  const [hovered, setHovered] = useState("");
  const [hoveredDistrict, setHoveredDistrict] = useState("");

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-1">Goa Talukas Map</h2>
      <p className="text-center text-gray-500 text-xs mb-3">12 Talukas across 2 Districts</p>

      {/* Hover info */}
      <div className="text-center h-8 mb-2">
        {hovered ? (
          <span className="bg-gray-800 text-white px-4 py-1 rounded-full text-sm font-medium">
            {hovered} &middot; {hoveredDistrict}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Hover over a taluka</span>
        )}
      </div>

      <div className="border-2 border-gray-300 rounded-lg bg-blue-50 overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [74.05, 15.35],
            scale: 28000,
          }}
          width={800}
          height={900}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) => {
              const goaTalukas = geographies.filter(
                (geo) => geo.properties.COUNTRY === "India"
              );

              let northIdx = 0;
              let southIdx = 0;

              // Track which labels we've already rendered (for Tiswadi which has 2 features)
              const labelledNames = new Set<string>();

              return (
                <>
                  {/* Render taluka shapes */}
                  {goaTalukas.map((geo) => {
                    const rawName = geo.properties.NAME_3 || "";
                    const name = NAME_MAP[rawName] || rawName;
                    const isNorth = geo.properties.NAME_2 === "North Goa";
                    const color = isNorth
                      ? NORTH_COLORS[northIdx++ % NORTH_COLORS.length]
                      : SOUTH_COLORS[southIdx++ % SOUTH_COLORS.length];

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => {
                          setHovered(name);
                          setHoveredDistrict(geo.properties.NAME_2);
                        }}
                        onMouseLeave={() => {
                          setHovered("");
                          setHoveredDistrict("");
                        }}
                        style={{
                          default: {
                            fill: color,
                            stroke: "#1e293b",
                            strokeWidth: 1.5,
                            outline: "none",
                          },
                          hover: {
                            fill: color,
                            stroke: "#000",
                            strokeWidth: 3,
                            outline: "none",
                            cursor: "pointer",
                            filter: "brightness(0.8)",
                          },
                          pressed: {
                            fill: color,
                            stroke: "#000",
                            strokeWidth: 3,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })}

                  {/* Render taluka name labels */}
                  {goaTalukas.map((geo) => {
                    const rawName = geo.properties.NAME_3 || "";
                    const name = NAME_MAP[rawName] || rawName;

                    // Skip duplicate label for Tiswadi (has 2 features)
                    if (labelledNames.has(name)) return null;
                    labelledNames.add(name);

                    // For Tiswadi, find all its features to compute a combined centroid
                    const sameName = goaTalukas.filter(
                      (g) => (NAME_MAP[g.properties.NAME_3] || g.properties.NAME_3) === name
                    );
                    // Use the largest feature's centroid
                    const mainFeature = sameName.reduce((a, b) => {
                      const aCoords = JSON.stringify(a.geometry?.coordinates || "");
                      const bCoords = JSON.stringify(b.geometry?.coordinates || "");
                      return aCoords.length > bCoords.length ? a : b;
                    });
                    const centroid = geoCentroid(mainFeature);

                    return (
                      <Marker key={geo.rsmKey + "-label"} coordinates={centroid}>
                        <text
                          textAnchor="middle"
                          dy={-2}
                          fontSize={10}
                          fontWeight="700"
                          fill="#0f172a"
                          stroke="#fff"
                          strokeWidth={3}
                          paintOrder="stroke"
                          style={{ pointerEvents: "none" }}
                        >
                          {name}
                        </text>
                      </Marker>
                    );
                  })}
                </>
              );
            }}
          </Geographies>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded border border-gray-400 bg-green-300"></div>
          <span className="text-gray-700 font-medium">North Goa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded border border-gray-400 bg-orange-300"></div>
          <span className="text-gray-700 font-medium">South Goa</span>
        </div>
      </div>
      <p className="text-center text-gray-400 text-xs mt-2">
        Note: Dharbandora (est. 2015) is included within Sanguem in this map data.
      </p>
    </div>
  );
}