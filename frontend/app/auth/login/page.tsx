"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/authContext";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
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
          <p className="text-gray-400 mt-2">Welcome back</p>
        </div>

        {/* Form */}
        <div className="bg-[#1a1a1a] rounded-lg p-8 border border-[#2a2a2a]">
          <h1 className="text-2xl font-bold text-[var(--fg)] mb-6">Login</h1>

          {error && (
            <div className="bg-red-900/20 border border-red-300/30 rounded-lg p-3 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-red-300 hover:text-red-200 font-medium transition"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
