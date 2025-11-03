"use client";

import { useEffect, useRef } from "react";
import type { Gig } from "../types";

interface GigMapProps {
  gigs: Gig[];
  center?: { lat: number; lng: number };
  onGigClick?: (gig: Gig) => void;
}

export default function GigMap({ gigs, center, onGigClick }: GigMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // actual map here
  }, [gigs]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full bg-gray-100 rounded-lg overflow-hidden relative"
    >
      {/* Placeholder - we'll add Leaflet map next */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-gray-500">Map will appear here</p>
      </div>
    </div>
  );
}
