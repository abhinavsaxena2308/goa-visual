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

const geoUrl = "/data/goa-talukas.geojson";

// Talukas to merge into a single entity
const MERGED_TALUKAS = ["Panaji", "XYZ"];
const MERGED_TALUKA_NAME = "Panaji + XYZ";

export default function GoaMap() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [talukaData, setTalukaData] = useState<Record<string, any> | null>(null);
  const [hoveredTaluka, setHoveredTaluka] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Load GeoJSON data
    fetch(geoUrl)
      .then((res) => res.json())
      .then((data) => {
        setGeoData(data);
      })
      .catch((err) => console.error("Failed to load GeoJSON:", err));
    
    // Load taluka data
    fetch("/data/taluka-data.json")
      .then((res) => res.json())
      .then((data) => setTalukaData(data))
      .catch((err) => console.error("Failed to load taluka data:", err));
  }, []);

  const getDisplayTalukaName = (talukaName: string): string => {
    if (MERGED_TALUKAS.includes(talukaName)) {
      return MERGED_TALUKA_NAME;
    }
    return talukaName;
  };

  const isMergedTaluka = (talukaName: string): boolean => {
    return MERGED_TALUKAS.includes(talukaName);
  };

  const geoJsonStyle = (feature?: Feature) => {
    const talukaName = feature?.properties?.NAME_3 as string;
    const isHovered = hoveredTaluka && (
      hoveredTaluka === talukaName || 
      (isMergedTaluka(hoveredTaluka) && isMergedTaluka(talukaName))
    );
    return {
      fillColor: isHovered ? "#0047ab" : "#47abcc",
      weight: 1,
      opacity: 1,
      color: "#ffffff",
      fillOpacity: isHovered ? 0.7 : 0.5,
      filter: "url(#talukaShadow)",
    };
  };

  const onEachFeature = (feature: Feature, layer: any) => {
    const talukaName = feature.properties?.NAME_3 as string;
    const displayName = getDisplayTalukaName(talukaName);
    
    layer.on({
      mouseover: () => {
        setHoveredTaluka(talukaName);
        layer.setStyle({
          fillColor: "#0047ab",
          fillOpacity: 0.7,
          weight: 1,
          filter: "url(#talukaShadow)",
        });
      },
      mouseout: () => {
        setHoveredTaluka(null);
        layer.setStyle({
          fillColor: "#47abcc",
          fillOpacity: 0.5,
          weight: 1,
          filter: "url(#talukaShadow)",
        });
      },
    });
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
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
        style={{ height: "600px", width: "100%", backgroundColor: "#e6f3ff" }}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
      >
        <GeoJSON
          data={geoData}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        /> 
        
        
      </MapContainer>
      
      {/* zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-1000">
        <button 
          onClick={handleZoomIn}
          className="w-8 h-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-colors duration-200"
          aria-label="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-8 h-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-colors duration-200"
          aria-label="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {hoveredTaluka && talukaData ? (
        talukaData[hoveredTaluka] || (isMergedTaluka(hoveredTaluka) && talukaData[MERGED_TALUKAS[0]]) ? (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-1000 min-w-52">
            <div className="font-bold text-black text-lg mb-2">{getDisplayTalukaName(hoveredTaluka)}</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-black">Literacy Rate:</span>
                <span className="font-medium text-black">
                  {isMergedTaluka(hoveredTaluka) 
                    ? talukaData["Panaji"]?.literacy_rate
                    : talukaData[hoveredTaluka]?.literacy_rate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Male Literacy:</span>
                <span className="font-medium text-black">
                  {isMergedTaluka(hoveredTaluka) 
                    ? talukaData["Panaji"]?.male_literacy
                    : talukaData[hoveredTaluka]?.male_literacy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Female Literacy:</span>
                <span className="font-medium text-black">
                  {isMergedTaluka(hoveredTaluka) 
                    ? talukaData["Panaji"]?.female_literacy
                    : talukaData[hoveredTaluka]?.female_literacy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Schools:</span>
                <span className="font-medium text-black">
                  {isMergedTaluka(hoveredTaluka) 
                    ? talukaData["Panaji"]?.schools
                    : talukaData[hoveredTaluka]?.schools}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Colleges:</span>
                <span className="font-medium text-black">
                  {isMergedTaluka(hoveredTaluka) 
                    ? talukaData["Panaji"]?.colleges
                    : talukaData[hoveredTaluka]?.colleges}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Dropout Rate:</span>
                <span className="font-medium text-black">
                  {isMergedTaluka(hoveredTaluka) 
                    ? talukaData["Panaji"]?.dropout_rate
                    : talukaData[hoveredTaluka]?.dropout_rate}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-black mt-1">Loading data...</div>
          </div>
        )
      ) : null}
    </div>
  );
}