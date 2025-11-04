"use client";

import Link from "next/link";
import { Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import type { Gig } from "../types";
import { format } from "date-fns";

interface GigCardProps {
  gig: Gig;
}

export default function GigCard({ gig }: GigCardProps) {
  const formatPrice = (price?: number) => {
    if (!price) return "Free";
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEE, MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <Link href={`/gigs/${gig.id}`}>
      <div className="bg-[#1a1a1a] rounded-lg overflow-hidden hover:bg-[#222] transition-all duration-300 border border-[#2a2a2a] hover:border-red-300/30 group cursor-pointer">
        {/* Image */}
        <div className="h-40 bg-gradient-to-br from-red-900/20 to-red-300/10 relative overflow-hidden">
          {gig.image_url ? (
            <img
              src={gig.image_url}
              alt={gig.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-red-300/30 text-6xl font-bold">
                {gig.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Genres */}
          {gig.genres && gig.genres.length > 0 && (
            <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
              {gig.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="bg-[#121212]/90 backdrop-blur-sm text-red-300 text-xs px-3 py-1 rounded-full font-medium border border-red-300/20"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-xl text-[var(--fg)] mb-2 line-clamp-1 group-hover:text-red-300 transition-colors">
            {gig.title}
          </h3>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {gig.description}
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4 text-red-300/60" />
              <span>{formatDate(gig.date)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4 text-red-300/60" />
              <span>{gig.start_time}</span>
              {gig.end_time && <span>- {gig.end_time}</span>}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-red-300/60" />
              <span className="line-clamp-1">{gig.venue_name}</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-red-300">
              <DollarSign className="w-4 h-4" />
              <span>{formatPrice(gig.price)}</span>
            </div>
          </div>

          {/* Organizer */}
          {gig.organizer && (
            <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
              <p className="text-xs text-gray-500">
                By{" "}
                <span className="font-medium text-gray-400">
                  {gig.organizer.username}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
