"use client";

import { useEffect, useState } from "react";
import { gigsAPI } from "../lib/api";
import type { Gig } from "../types";
import Header from "../components/Header";
import GigCard from "../components/GigCard";
import GigMap from "../components/GigMap";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const data = await gigsAPI.getAll();
      setGigs(data);
    } catch (err) {
      console.error("Failed to fetch gigs:", err);
      setError("Failed to load gigs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Local Gigs
          </h1>
          <p className="text-gray-600">
            Find amazing music events happening in Jakarta
          </p>
        </div>

        {/* View Toggle - Mobile optimized */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium transition ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium transition ${
              viewMode === "map"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Map View
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && gigs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No gigs found</p>
            <p className="text-gray-400">Check back later for new events!</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && gigs.length > 0 && (
          <>
            {viewMode === "list" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} />
                ))}
              </div>
            ) : (
              <div className="h-[600px]">
                <GigMap
                  gigs={gigs}
                  center={{
                    lat: parseFloat(
                      process.env.NEXT_PUBLIC_MAP_CENTER_LAT || "-6.2088"
                    ),
                    lng: parseFloat(
                      process.env.NEXT_PUBLIC_MAP_CENTER_LNG || "106.8456"
                    ),
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
