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

const geoUrl = "/data/goa-talukas.geojson";

export default function GoaMap() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [talukaData, setTalukaData] = useState<Record<string, any> | null>(null);
  const [hoveredTaluka, setHoveredTaluka] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Load GeoJSON data
    fetch(geoUrl)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Failed to load GeoJSON:", err));
    
    // Load taluka data
    fetch("/data/taluka-data.json")
      .then((res) => res.json())
      .then((data) => setTalukaData(data))
      .catch((err) => console.error("Failed to load taluka data:", err));
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
      
      {(hoveredTaluka && talukaData && talukaData[hoveredTaluka]) ? (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-[1000] min-w-[200px]">
          <div className="font-bold text-gray-800 text-lg mb-2">{hoveredTaluka}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Literacy Rate:</span>
              <span className="font-medium">{talukaData[hoveredTaluka].literacy_rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Male Literacy:</span>
              <span className="font-medium">{talukaData[hoveredTaluka].male_literacy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Female Literacy:</span>
              <span className="font-medium">{talukaData[hoveredTaluka].female_literacy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Schools:</span>
              <span className="font-medium">{talukaData[hoveredTaluka].schools}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Colleges:</span>
              <span className="font-medium">{talukaData[hoveredTaluka].colleges}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dropout Rate:</span>
              <span className="font-medium">{talukaData[hoveredTaluka].dropout_rate}%</span>
            </div>
          </div>
        </div>
      ) : hoveredTaluka ? (
        <div>
          <div className="text-sm text-gray-500 mt-1">Loading data...</div>
        </div>
      ) : null}
    </div>
  );
}