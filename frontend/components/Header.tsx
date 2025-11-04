"use client";

import Link from "next/link";
import { useAuth } from "../lib/authContext";
import { User, LogOut, Plus } from "lucide-react";

export default function Header() {
  const { user, logout, isOrganizer } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-1 text-xl group">
            <span className="font-bold text-[var(--fg)] group-hover:text-red-300 hover:text-red-300 transition-colors">
              sunyi
            </span>
            <span className="text-red-300 group-hover:text-[var(--fg)] hover:text-[var(--fg)] transition-colors">
              .
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {isOrganizer && (
                  <Link
                    href="/gigs/create"
                    className="flex items-center gap-1 bg-[#262626] text-red-300 px-4 py-2 rounded-lg 
                  hover:bg-[#1d1d1d] hover:transform-[scale(1.05)] active:transform-[scale(1.15)]
                  active:bg-[#3c3c3c] transition duration-300 ease"
                  >
                    <Plus className="w-4 h-4 mb-1" />
                    Create
                  </Link>
                )}

                <Link
                  href="/"
                  className="flex items-center gap-2 text-white hover:text-red-300 transition"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-white hover:text-red-300 hover:cursor-pointer transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-white hover:text-red-300 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-[#262626] text-red-300 px-4 py-2 rounded-lg 
                  hover:bg-[#1d1d1d] hover:transform-[scale(1.05)] active:transform-[scale(1.15)]
                  active:bg-[#3c3c3c] transition duration-300 ease"
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
