"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { FeatureCollection, Feature, GeoJsonProperties } from "geojson";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);

const geoUrl = "/map/goa-talukas.geojson";

export default function GoaMap() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [hoveredTaluka, setHoveredTaluka] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetch(geoUrl)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Failed to load GeoJSON:", err));
  }, []);

  const geoJsonStyle = (feature?: Feature) => ({
    fillColor: hoveredTaluka === feature?.properties?.NAME_3 ? "#3b82f6" : "transparent",
    weight: 1,
    opacity: 1,
    color: "#334155",
    fillOpacity: hoveredTaluka === feature?.properties?.NAME_3 ? 0.2 : 0,
  });

  const onEachFeature = (feature: Feature, layer: any) => {
    const talukaName = feature.properties?.NAME_3 as string;
    
    layer.on({
      mouseover: () => {
        setHoveredTaluka(talukaName);
        layer.setStyle({
          fillColor: "#3b82f6",
          fillOpacity: 0.2,
          weight: 3,
        });
      },
      mouseout: () => {
        setHoveredTaluka(null);
        layer.setStyle({
          fillColor: "transparent",
          fillOpacity: 0,
          weight: 2,
        });
      },
    });
  };

  if (!isClient) {
    return <div className="text-center p-8">Loading map...</div>;
  }

  if (!geoData) {
    return <div className="text-center p-8">Loading map...</div>;
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <MapContainer
        center={[15.4, 74.0]}
        zoom={9}
        style={{ height: "600px", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <GeoJSON
          data={geoData}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
      
      {hoveredTaluka && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200 z-[1000]">
          <div className="font-medium text-gray-800">{hoveredTaluka} Taluka</div>
        </div>
      )}
    </div>
  );
}