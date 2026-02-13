"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { FeatureCollection, Feature } from "geojson";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const MERGED_TALUKAS = ["Panaji", "XYZ"] as const;
const MERGED_NAME = "Tiswadi";
const DEFAULT_DATA = {
  literacy_rate: "-",
  male_literacy: "-",
  female_literacy: "-",
  schools: "-",
  colleges: "-",
  dropout_rate: "-",
};

export default function GoaMap() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [talukaData, setTalukaData] =
    useState<Record<string, any>>(DEFAULT_DATA);
  const [hoveredTaluka, setHoveredTaluka] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<any>(null);

  const isMerged = (name: string) =>
    MERGED_TALUKAS.includes(name as (typeof MERGED_TALUKAS)[number]);
  const getData = (name: string) =>
    (isMerged(name) ? talukaData["Panaji"] : talukaData[name]) || DEFAULT_DATA;
  const getDisplayName = (name: string) =>
    isMerged(name) ? MERGED_NAME : name;

  useEffect(() => {
    setIsClient(true);
    fetch("/data/goa-talukas.geojson")
      .then((r) => r.json())
      .then(setGeoData)
      .catch(console.error);
    fetch("/data/taluka-data.json")
      .then((r) => r.json())
      .then(setTalukaData)
      .catch(console.error);
  }, []);

  const getStyle = (feature?: Feature) => {
    const name = feature?.properties?.NAME_3 as string;
    const hovered =
      hoveredTaluka &&
      (hoveredTaluka === name || (isMerged(hoveredTaluka) && isMerged(name)));
    return {
      fillColor: hovered ? "#096e77" : "#129eaa",
      weight: 1,
      opacity: 2,
      color: "#ffffff",
      fillOpacity: hovered ? 0.7 : 0.5,
    };
  };

  const onEachFeature = (feature: Feature, layer: any) => {
    const name = feature.properties?.NAME_3 as string;
    layer.on({
      mouseover: () => {
        setHoveredTaluka(name);
        layer.setStyle({ fillColor: "#0047ab", fillOpacity: 0.7 });
      },
      mouseout: () => {
        setHoveredTaluka(null);
        layer.setStyle({ fillColor: "#47abcc", fillOpacity: 0.5 });
      },
    });
  };

  const getCentroid = (coords: number[][][]): [number, number] => {
    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;
    const points = coords.flat(2);
    for (let i = 0; i < points.length; i += 2) {
      const lng = points[i];
      const lat = points[i + 1];
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
    return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
  };

  const getTalukaMarkers = () => {
    if (!geoData?.features) return [];

    // Debug: log all taluka names
    const allNames = geoData.features.map((f) => f.properties?.NAME_3);
    // console.log("All talukas:", allNames.filter(Boolean));

    return geoData.features
      .filter((feature) => {
        const name = feature.properties?.NAME_3 as string;
        if (name === "XYZ") return false;
        return true;
      })
      .map((feature) => {
        const name = feature.properties?.NAME_3 as string;
        if (feature.geometry.type === "Polygon") {
          const coords = feature.geometry.coordinates as number[][][];
          let centroid = getCentroid(coords);
          if (name === "Pernem") {
            centroid = [centroid[0] - 0.04, centroid[1]  - 0.02];
          }
          if (name === "Bardez") {
            centroid = [centroid[0] - 0.02, centroid[1] - 0.04];
          } 
          if (name === "Bicholim") {
            centroid = [centroid[0], centroid[1] - 0.05];
          }
          if (name === "Panaji") {
            centroid = [centroid[0] - 0.03, centroid[1] ];
          }
          if (name === "Canacona") {
            centroid = [centroid[0] - 0.05, centroid[1] + 0.02];
          }
          if (name === "Quepem") {
            centroid = [centroid[0] - 0.06, centroid[1] -0.02];
          }
          if (name === "Ponda") {
            centroid = [centroid[0] - 0.03, centroid[1] ];
          }
          if (name === "Salcette") {
            centroid = [centroid[0] - 0.03, centroid[1]];
          }
          if (name === "Satari") {
            centroid = [centroid[0] + 0.03, centroid[1] - 0.05];
          }
          if (name === "Satari") {
            centroid = [centroid[0] - 0.07, centroid[1]+0.06];
          }
          if (name === "Sanguem") {
            centroid = [centroid[0] + 0.05, centroid[1] ];
          }
          if (name === "Sambaji") {
            centroid = [centroid[0] - 0.01, centroid[1] - 0.02];
          }
          return { name, centroid };
        }
        return null;
      })
      .filter(Boolean);
  };

  const createIcon = (name: string) => {
    const L = require("leaflet");
    return L.divIcon({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 40"><path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="#E53E3E"/><circle cx="16" cy="14" r="6" fill="white"/></svg>
          <div style="font-weight: bold; color: #ffffff; font-size: 11px; white-space: nowrap; padding: 1px 3px;">${getDisplayName(name)}</div>
        </div>
      `,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 35],
    });
  };

  const data = hoveredTaluka ? getData(hoveredTaluka) : null;

  if (!isClient || !geoData)
    return <div className="text-center p-8">Loading map...</div>;

  return (
    <div className="relative w-full max-w-4xl mx-auto ">
      <MapContainer
        center={[15.4, 74.0]}
        zoom={10}
        style={{ height: "800px", width: "100%", backgroundColor: "#e6f3fe" }}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
      >
        <GeoJSON
          data={geoData}
          style={getStyle}
          onEachFeature={onEachFeature}
        />
        {getTalukaMarkers().map((marker) => (
          <Marker
            key={marker!.name}
            position={marker!.centroid}
            icon={createIcon(marker!.name)}
          />
        ))}
      </MapContainer>

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-1000">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-8 h-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-colors duration-200"
          aria-label="Zoom in"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-700"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-8 h-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-colors duration-200"
          aria-label="Zoom out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-700"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {data && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-1000 min-w-52">
          <div className="font-bold text-red-400 justify-center flex text-lg mb-2">
            {getDisplayName(hoveredTaluka!)}
          </div>
          {[
            ["Literacy Rate", data.literacy_rate, "%"],
            ["Male Literacy", data.male_literacy, "%"],
            ["Female Literacy", data.female_literacy, "%"],
            ["Schools", data.schools, ""],
            ["Colleges", data.colleges, ""],
            ["Dropout Rate", data.dropout_rate, "%"],
          ].map(([label, value, suffix]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-blue-800 font-bold ">{label}:</span>
              <span className="font-medium text-blue-400">
                {value}
                {suffix}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
