"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { FeatureCollection, Feature } from "geojson";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

const MERGED_TALUKAS = ["Panaji", "XYZ"] as const;
const MERGED_NAME = "Panaji + XYZ";
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
  const [talukaData, setTalukaData] = useState<Record<string, any>>(DEFAULT_DATA);
  const [hoveredTaluka, setHoveredTaluka] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<any>(null);

  const isMerged = (name: string) => MERGED_TALUKAS.includes(name as typeof MERGED_TALUKAS[number]);
  const getData = (name: string) => (isMerged(name) ? talukaData["Panaji"] : talukaData[name]) || DEFAULT_DATA;
  const getDisplayName = (name: string) => (isMerged(name) ? MERGED_NAME : name);

  useEffect(() => {
    setIsClient(true);
    fetch("/data/goa-talukas.geojson").then((r) => r.json()).then(setGeoData).catch(console.error);
    fetch("/data/taluka-data.json").then((r) => r.json()).then(setTalukaData).catch(console.error);
  }, []);

  const getStyle = (feature?: Feature) => {
    const name = feature?.properties?.NAME_3 as string;
    const hovered = hoveredTaluka && (hoveredTaluka === name || (isMerged(hoveredTaluka) && isMerged(name)));
    return { fillColor: hovered ? "#0047ab" : "#47abcc", weight: 1, opacity: 1, color: "#ffffff", fillOpacity: hovered ? 0.7 : 0.5 };
  };

  const onEachFeature = (feature: Feature, layer: any) => {
    const name = feature.properties?.NAME_3 as string;
    layer.on({
      mouseover: () => { setHoveredTaluka(name); layer.setStyle({ fillColor: "#0047ab", fillOpacity: 0.7 }); },
      mouseout: () => { setHoveredTaluka(null); layer.setStyle({ fillColor: "#47abcc", fillOpacity: 0.5 }); },
    });
  };

  const data = hoveredTaluka ? getData(hoveredTaluka) : null;

  if (!isClient || !geoData) return <div className="text-center p-8">Loading map...</div>;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <MapContainer center={[15.4, 74.0]} zoom={9} style={{ height: "600px", width: "100%", backgroundColor: "#e6f3ff" }} scrollWheelZoom={false} zoomControl={false} attributionControl={false} ref={mapRef}>
        <GeoJSON data={geoData} style={getStyle} onEachFeature={onEachFeature} />
      </MapContainer>
      
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-1000">
        <button onClick={() => mapRef.current?.zoomIn()} className="w-8 h-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-colors duration-200" aria-label="Zoom in">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button onClick={() => mapRef.current?.zoomOut()} className="w-8 h-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-colors duration-200" aria-label="Zoom out">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {data && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-1000 min-w-52">
          <div className="font-bold text-black text-lg mb-2">{getDisplayName(hoveredTaluka!)}</div>
          {[
            ["Literacy Rate", data.literacy_rate, "%"],
            ["Male Literacy", data.male_literacy, "%"],
            ["Female Literacy", data.female_literacy, "%"],
            ["Schools", data.schools, ""],
            ["Colleges", data.colleges, ""],
            ["Dropout Rate", data.dropout_rate, "%"],
          ].map(([label, value, suffix]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-black">{label}:</span>
              <span className="font-medium text-black">{value}{suffix}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}