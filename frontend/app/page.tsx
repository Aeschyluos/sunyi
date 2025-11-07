"use client";

import { useEffect, useState } from "react";
import { gigsAPI } from "../lib/api";
import type { Gig } from "../types";
import Header from "../components/Header";
import GigCard from "../components/GigCard";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const GigMap = dynamic(() => import("../components/GigMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1a1a1a] rounded-lg flex items-center justify-center border border-[#2a2a2a]">
      <Loader2 className="w-8 h-8 animate-spin text-red-300" />
    </div>
  ),
});

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
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold">
            <span className="text-red-300">Gigs</span> Near You
          </h1>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium transition 
              hover:cursor-pointer hover:transform-[scale(1.05)] active:transform-[scale(1.1)]
              ${
                viewMode === "list"
                  ? "bg-[#ded7d7] text-gray-700 border border-gray-300"
                  : "hover:bg-[#1d1d1d] text-red-300"
              }`}
            style={{
              transition: "transform 0.4s ease",
            }}
          >
            Gigs
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium transition 
              hover:cursor-pointer hover:transform-[scale(1.05)] active:transform-[scale(1.1)]
              ${
                viewMode === "map"
                  ? "bg-[#ded7d7] text-gray-700 border border-gray-300"
                  : "hover:bg-[#1d1d1d] text-red-300"
              }`}
            style={{
              transition: "transform 0.4s ease",
            }}
          >
            Map
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && gigs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Lagi gaada nih.</p>
            <p className="text-red-300">Check back later for new events!</p>
          </div>
        )}

        {!loading && !error && gigs.length > 0 && (
          <>
            {viewMode === "list" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} />
                ))}
              </div>
            ) : (
              <div className="h-[600px] mb-12">
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
