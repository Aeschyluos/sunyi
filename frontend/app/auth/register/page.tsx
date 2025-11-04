"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/authContext";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as "user" | "organizer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.role
      );
      router.push("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-3xl group"
          >
            <span className="font-bold text-[var(--fg)] group-hover:text-red-300 transition-colors">
              sunyi
            </span>
            <span className="text-red-300 group-hover:text-[var(--fg)] transition-colors">
              .
            </span>
          </Link>
          <p className="text-gray-400 mt-2">Join the community</p>
        </div>

        {/* Form */}
        <div className="bg-[#1a1a1a] rounded-lg p-8 border border-[#2a2a2a]">
          <h1 className="text-2xl font-bold text-[var(--fg)] mb-6">
            Create Account
          </h1>

          {error && (
            <div className="bg-red-900/20 border border-red-300/30 rounded-lg p-3 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                  text-[var(--fg)] placeholder-gray-500
                  focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                  transition"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                  text-[var(--fg)] placeholder-gray-500
                  focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                  transition"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                  text-[var(--fg)] placeholder-gray-500
                  focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                  transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg 
                  text-[var(--fg)] placeholder-gray-500
                  focus:outline-none focus:border-red-300/50 focus:ring-1 focus:ring-red-300/50
                  transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                I want to...
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-[#121212] border border-[#2a2a2a] rounded-lg cursor-pointer hover:border-red-300/30 transition">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === "user"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "user",
                      })
                    }
                    className="w-4 h-4 text-red-300 focus:ring-red-300"
                  />
                  <div>
                    <p className="font-medium text-[var(--fg)]">Attend gigs</p>
                    <p className="text-sm text-gray-400">
                      Discover and attend local events
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-[#121212] border border-[#2a2a2a] rounded-lg cursor-pointer hover:border-red-300/30 transition">
                  <input
                    type="radio"
                    name="role"
                    value="organizer"
                    checked={formData.role === "organizer"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "organizer",
                      })
                    }
                    className="w-4 h-4 text-red-300 focus:ring-red-300"
                  />
                  <div>
                    <p className="font-medium text-[var(--fg)]">
                      Organize gigs
                    </p>
                    <p className="text-sm text-gray-400">
                      Create and manage your own events
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-300 text-[#121212] py-3 rounded-lg font-semibold
                hover:bg-red-200 active:bg-red-400
                disabled:opacity-50 disabled:cursor-not-allowed
                transition duration-200
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-red-300 hover:text-red-200 font-medium transition"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
