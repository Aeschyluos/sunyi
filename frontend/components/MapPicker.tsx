"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: #fca5a5;
        border: 4px solid #991b1b;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  position: [number, number];
}

function LocationMarker({
  onLocationSelect,
  externalPosition,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
  externalPosition: [number, number];
}) {
  const [position, setPosition] = useState<[number, number]>(externalPosition);

  // Update marker when external position changes (from address search)
  useEffect(() => {
    setPosition(externalPosition);
  }, [externalPosition]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return <Marker position={position} icon={createCustomIcon()} />;
}

// Component to recenter map when position changes
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

export default function MapPicker({
  onLocationSelect,
  position,
}: MapPickerProps) {
  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-[#2a2a2a]">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <RecenterMap position={position} />
        <LocationMarker
          onLocationSelect={onLocationSelect}
          externalPosition={position}
        />
      </MapContainer>
    </div>
  );
}
