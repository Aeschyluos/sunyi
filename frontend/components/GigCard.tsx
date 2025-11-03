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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer">
        {/* Image placeholder */}
        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
          {gig.image_url ? (
            <img
              src={gig.image_url}
              alt={gig.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-2xl font-bold opacity-50">
                {gig.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Genres */}
          {gig.genres && gig.genres.length > 0 && (
            <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
              {gig.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-full font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
            {gig.title}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {gig.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(gig.date)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{gig.start_time}</span>
              {gig.end_time && <span>- {gig.end_time}</span>}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{gig.venue_name}</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <DollarSign className="w-4 h-4" />
              <span>{formatPrice(gig.price)}</span>
            </div>
          </div>

          {/* Organizer */}
          {gig.organizer && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                By{" "}
                <span className="font-medium text-gray-700">
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
