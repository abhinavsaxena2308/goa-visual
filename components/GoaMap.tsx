"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { FeatureCollection } from "geojson";
import type { Layer, LeafletMouseEvent } from "leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);

const geoUrl = "/map/goa-talukas.geojson";

export default function GoaMap() {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [hovered, setHovered] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Failed to load GeoJSON:", err));
  }, []);

  const onEachFeature = (feature: GeoJSON.Feature, layer: Layer) => {
    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const target = e.target;
        target.setStyle({
          fillColor: "#2563eb",
          fillOpacity: 0.7,
        });
        setHovered(
          feature.properties?.NAME_3 ||
          feature.properties?.NAME_2 ||
          "Taluka"
        );
      },
      mouseout: (e: LeafletMouseEvent) => {
        const target = e.target;
        target.setStyle({
          fillColor: "#cbd5e1",
          fillOpacity: 0.5,
        });
        setHovered("");
      },
    });
  };

  const geoJsonStyle = () => ({
    fillColor: "#cbd5e1",
    weight: 1,
    opacity: 1,
    color: "#334155",
    fillOpacity: 0.5,
  });

  if (!isClient || !geoData) {
    return <div className="text-center p-8">Loading map...</div>;
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {hovered && (
        <div className="absolute top-4 left-4 bg-white shadow-lg p-3 rounded border z-10">
          <strong>{hovered}</strong>
        </div>
      )}

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
    </div>
  );
}