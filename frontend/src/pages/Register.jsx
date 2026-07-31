import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PixelArtBg from "../components/PixelArtBg.jsx";
import { hapticTap } from "../hooks/useHaptics.js";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("Registration is disabled — this app has a single account");
    return;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Pixel Art Background */}
      <PixelArtBg />

      {/* Glass Card */}

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div
          className="relative rounded-[28px] overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            }}
          />

          <div className="px-8 pt-10 pb-8">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] mb-4"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 32, color: "rgba(255,255,255,0.9)" }}
                >
                  person_add
                </span>
              </div>
              <h1 className="text-4xl font-display font-800 text-white tracking-tight">
                VEST<span style={{ color: "#90EE90" }}>IO</span>
              </h1>
              <p className="text-white/60 text-sm mt-2 font-body">
                Start your digital closet
              </p>
            </div>

            {error && (
              <div
                className="mb-5 px-4 py-3 rounded-2xl text-sm text-red-300"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/50 font-display font-600 mb-2 pl-1">
                  Email
                </label>
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <span
                    className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ fontSize: 18, color: "rgba(255,255,255,0.4)" }}
                  >
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-transparent text-white text-sm font-body placeholder:text-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/50 font-display font-600 mb-2 pl-1">
                  Password
                </label>
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <span
                    className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ fontSize: 18, color: "rgba(255,255,255,0.4)" }}
                  >
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-11 pr-12 py-3.5 bg-transparent text-white text-sm font-body placeholder:text-white/30 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowPassword(!showPassword); hapticTap("light"); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18 }}
                    >
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-2xl font-display font-700 uppercase tracking-wide text-sm text-white disabled:opacity-50 transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #4B5C3F 0%, #36402F 100%)",
                  boxShadow:
                    "0 4px 16px rgba(75, 92, 63, 0.4), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 0 1px rgba(75, 92, 63, 0.3)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-display">
                or
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            </div>

            <p className="text-center text-sm text-white/50 font-body">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-600 transition-colors"
                style={{ color: "#90EE90" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6 font-body">
          VESTIO — Your private digital closet
        </p>
      </div>
    </div>
  );
}
