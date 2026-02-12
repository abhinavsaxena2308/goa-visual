"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { FeatureCollection, Feature, GeoJsonProperties } from "geojson";
import { MapPin } from "@deemlol/next-icons";
import { divIcon } from "leaflet";

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

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// const TileLayer = dynamic(
//   () => import("react-leaflet").then((mod) => mod.TileLayer),
//   { ssr: false }
// );

const geoUrl = "/data/goa-talukas.geojson";

export default function GoaMap() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [talukaData, setTalukaData] = useState<Record<string, any> | null>(null);
  const [hoveredTaluka, setHoveredTaluka] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [talukaCentroids, setTalukaCentroids] = useState<Array<{name: string, lat: number, lng: number}>>([]);
  const mapRef = useRef<any>(null);

  const createCustomIcon = () => {
    return divIcon({
      html: `<div class="bg-none text-red-400 w-8 h-8 flex items-center justify-center" style="transform: translateY(-50%);">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
               </svg>
             </div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  const calculateCentroids = (data: FeatureCollection) => {
    const centroids = data.features.map(feature => {
      if (feature.geometry.type === 'Polygon') {
        const coords = (feature.geometry as any).coordinates[0];
        const lat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
        const lng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
        return {
          name: feature.properties?.NAME_3 as string,
          lat,
          lng
        };
      }
      return { name: '', lat: 0, lng: 0 };
    }).filter(centroid => centroid.name !== '');
    setTalukaCentroids(centroids);
  };

  useEffect(() => {
    setIsClient(true);
    
    // Load GeoJSON data
    fetch(geoUrl)
      .then((res) => res.json())
      .then((data) => {
        setGeoData(data);
        calculateCentroids(data);
      })
      .catch((err) => console.error("Failed to load GeoJSON:", err));
    
    // Load taluka data
    fetch("/data/taluka-data.json")
      .then((res) => res.json())
      .then((data) => setTalukaData(data))
      .catch((err) => console.error("Failed to load taluka data:", err));
  }, []);

  const geoJsonStyle = (feature?: Feature) => ({
    fillColor: hoveredTaluka === feature?.properties?.NAME_3 ? "#0047ab" : "#47abcc",
    weight: 1,
    opacity: 1,
    color: "#ffffff",
    fillOpacity: hoveredTaluka === feature?.properties?.NAME_3 ? 0.7 : 0.5,
    filter: "url(#talukaShadow)",
  });

  const onEachFeature = (feature: Feature, layer: any) => {
    const talukaName = feature.properties?.NAME_3 as string;
    
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
        {/* <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        /> */}
        <GeoJSON
          data={geoData}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        /> 
        
        {/* Map Pins for each taluka */}
        {talukaCentroids.map((centroid, index) => (
          <Marker 
            key={index} 
            position={[centroid.lat, centroid.lng]}
            icon={createCustomIcon()}
          >
            <Popup>
              <div className="font-semibold text-black">{centroid.name}</div>
              {talukaData && talukaData[centroid.name] && (
                <div className="text-sm mt-1">
                  <div>Literacy: {talukaData[centroid.name].literacy_rate}%</div>
                  <div>Schools: {talukaData[centroid.name].schools}</div>
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-1000">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-colors duration-200"
          aria-label="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-colors duration-200"
          aria-label="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {(hoveredTaluka && talukaData && talukaData[hoveredTaluka]) ? (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-1000 min-w-52">
          <div className="font-bold text-black text-lg mb-2">{hoveredTaluka}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-black">Literacy Rate:</span>
              <span className="font-medium text-black">{talukaData[hoveredTaluka].literacy_rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">Male Literacy:</span>
              <span className="font-medium text-black">{talukaData[hoveredTaluka].male_literacy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">Female Literacy:</span>
              <span className="font-medium text-black">{talukaData[hoveredTaluka].female_literacy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">Schools:</span>
              <span className="font-medium text-black">{talukaData[hoveredTaluka].schools}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">Colleges:</span>
              <span className="font-medium text-black">{talukaData[hoveredTaluka].colleges}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">Dropout Rate:</span>
              <span className="font-medium text-black">{talukaData[hoveredTaluka].dropout_rate}%</span>
            </div>
          </div>
        </div>
      ) : hoveredTaluka ? (
        <div>
          <div className="text-sm text-black mt-1">Loading data...</div>
        </div>
      ) : null}
    </div>
  );
}