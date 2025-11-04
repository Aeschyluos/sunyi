"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/authContext";
import Header from "../../../components/Header";
import { gigsAPI } from "../../../lib/api";
import { Loader2, MapPin, Search } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import for map picker
const MapPicker = dynamic(() => import("../../../components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-[#1a1a1a] rounded-lg flex items-center justify-center border border-[#2a2a2a]">
      <Loader2 className="w-8 h-8 animate-spin text-red-300" />
    </div>
  ),
});

export default function CreateGigPage() {
  const router = useRouter();
  const { user, isOrganizer, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchingLocation, setSearchingLocation] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue_name: "",
    venue_address: "",
    latitude: -6.2088,
    longitude: 106.8456,
    date: "",
    start_time: "",
    end_time: "",
    price: "",
    genres: "",
  });

  useEffect(() => {
    // Redirect if not organizer
    if (!authLoading && (!user || !isOrganizer)) {
      router.push("/");
    }
  }, [user, isOrganizer, authLoading, router]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
    });
  };

  // Geocode address to coordinates
  const searchAddress = async (): Promise<void> => {
    if (!formData.venue_address.trim()) {
      setError("Please enter an address first");
      return;
    }

    setSearchingLocation(true);
    setError("");

    try {
      // Add "Jakarta" to search query for better results
      const searchQuery = `${formData.venue_address}, Jakarta, Indonesia`;
      const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? "";

      if (!GEOAPIFY_KEY) {
        throw new Error("Geoapify API key is not set.");
      }

      const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        searchQuery
      )}&limit=1&apiKey=${encodeURIComponent(GEOAPIFY_KEY)}`;

      const response = await fetch(url);

      if (!response.ok) {
        // try to parse JSON error body if present, otherwise throw generic
        let errBody: any = null;
        try {
          errBody = await response.json();
        } catch (_) {
          // ignore parse error
        }
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Try again later.");
        }
        throw new Error(
          errBody?.error?.message || `Geocoding failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (data?.features && data.features.length > 0) {
        const feat = data.features[0];
        const [lon, lat] = feat.geometry.coordinates;
        setFormData({
          ...formData,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        });
      } else {
        setError(
          "Address not found. Please try a different address or click on the map."
        );
      }
    } catch (err) {
      // Narrow unknown -> safe handling
      const message =
        err instanceof Error ? err.message : String(err ?? "Unknown error");
      console.error("searchAddress error:", err);
      setError(
        message || "Failed to search address. Please click on the map instead."
      );
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Parse genres
      const genresArray = formData.genres
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g.length > 0);

      // Parse price
      const price = formData.price ? parseFloat(formData.price) : undefined;

      await gigsAPI.create({
        title: formData.title,
        description: formData.description,
        venue_name: formData.venue_name,
        venue_address: formData.venue_address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time || undefined,
        price: price,
        genres: genresArray,
      });

      router.push("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to create gig. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-300" />
      </div>
    );
  }

  if (!user || !isOrganizer) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--fg)] mb-2">
            Create a <span className="text-red-300">Gig</span>
          </h1>
          <p className="text-gray-400">Share your event with the community</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-8 border border-[#2a2a2a]">
          {error && (
            <div className="bg-red-900/20 border border-red-300/30 rounded-lg p-3 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                  text-[var(--fg)] placeholder-gray-500
                  focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                  transition"
                placeholder="Jazz Night at the Cafe"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                  text-[var(--fg)] placeholder-gray-500
                  focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                  transition resize-none"
                placeholder="Tell people what to expect..."
              />
            </div>

            {/* Venue Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                required
                value={formData.venue_name}
                onChange={(e) =>
                  setFormData({ ...formData, venue_name: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                  text-[var(--fg)] placeholder-gray-500
                  focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                  transition"
                placeholder="The Jazz Cafe"
              />
            </div>

            {/* Venue Address with Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Venue Address *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.venue_address}
                  onChange={(e) =>
                    setFormData({ ...formData, venue_address: e.target.value })
                  }
                  className="flex-1 px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                    text-[var(--fg)] placeholder-gray-500
                    focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                    transition"
                  placeholder="Jl. Senayan No. 12, Jakarta"
                />
                <button
                  type="button"
                  onClick={searchAddress}
                  disabled={searchingLocation}
                  className="px-4 py-3 bg-red-300 text-[#121212] rounded-lg font-semibold
                    hover:bg-red-200 disabled:opacity-50 hover:cursor-pointer
                    transition flex items-center gap-2"
                >
                  {searchingLocation ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Click search to find the address, or click on the map below
              </p>
            </div>

            {/* Location Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location on Map *
              </label>
              <MapPicker
                onLocationSelect={handleLocationSelect}
                position={[formData.latitude, formData.longitude]}
              />
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {formData.latitude.toFixed(6)},{" "}
                  {formData.longitude.toFixed(6)}
                </span>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                    text-[var(--fg)] placeholder-gray-500
                    focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                    transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                    text-[var(--fg)] placeholder-gray-500
                    focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                    transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                    text-[var(--fg)] placeholder-gray-500
                    focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                    transition"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ticket Price (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                  text-[var(--fg)] placeholder-gray-500
                  focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                  transition"
                placeholder="150000 (leave empty for free)"
              />
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genres
              </label>
              <input
                type="text"
                value={formData.genres}
                onChange={(e) =>
                  setFormData({ ...formData, genres: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                  text-[var(--fg)] placeholder-gray-500
                  focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                  transition"
                placeholder="jazz, blues, soul (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple genres with commas
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 bg-[#262626] text-white py-3 rounded-lg font-semibold
                  hover:bg-[#1d1d1d] hover:cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-300 text-[#121212] py-3 rounded-lg font-semibold
                  hover:bg-red-200 hover:cursor-pointer active:bg-red-400
                  disabled:opacity-50
                  transition duration-200
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Gig"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
