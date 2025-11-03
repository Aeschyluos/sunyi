"use client";

import Link from "next/link";
import { useAuth } from "../lib/authContext";
import { Music, User, LogOut, Plus } from "lucide-react";

export default function Header() {
  const { user, logout, isOrganizer } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900"
          >
            <Music className="w-6 h-6" />
            Sunyi
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-gray-900 transition"
                >
                  Gigs
                </Link>

                {isOrganizer && (
                  <Link
                    href="/gigs/create"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Create Gig
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-gray-900 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
