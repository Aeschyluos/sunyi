"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Gig } from "../types";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

const icon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #fca5a5;
        border: 3px solid #991b1b;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

interface GigMapProps {
  gigs: Gig[];
  center?: { lat: number; lng: number };
  onGigClick?: (gig: Gig) => void;
}

// Component to fit bounds when gigs change
function MapBounds({ gigs }: { gigs: Gig[] }) {
  const map = useMap();

  useEffect(() => {
    if (gigs.length > 0) {
      const bounds = L.latLngBounds(
        gigs.map((gig) => [gig.latitude, gig.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [gigs, map]);

  return null;
}

export default function GigMap({ gigs, center, onGigClick }: GigMapProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const defaultCenter: [number, number] = center
    ? [center.lat, center.lng]
    : [-6.2088, 106.8456]; // Jakarta center

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-[#2a2a2a] ">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {gigs.length > 0 && <MapBounds gigs={gigs} />}

        {gigs.map((gig) => (
          <Marker
            key={gig.id}
            position={[gig.latitude, gig.longitude]}
            icon={createCustomIcon()}
            eventHandlers={{
              click: () => {
                if (onGigClick) onGigClick(gig);
              },
            }}
          >
            <Popup className="custom-popup" maxWidth={250}>
              <div className="bg-[#1a1a1a] p-3 rounded-lg -m-3">
                <h3 className="font-bold text-[var(--fg)] mb-2 text-base">
                  {gig.title}
                </h3>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-red-300/60" />
                    <span>{formatDate(gig.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-red-300/60" />
                    <span>{gig.venue_name}</span>
                  </div>
                </div>

                {/* <Link
                  href={`/gigs/${gig.id}`}
                  className="block text-center bg-[#262626] py-2 px-3 rounded hover:bg-[#1e1e1e] hover:transform-[scale(1.05)] 
                  transition duration-300 ease"
                >
                  <span className="text-sm font-semibold text-red-300">
                    View Details
                  </span>
                </Link> */}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
