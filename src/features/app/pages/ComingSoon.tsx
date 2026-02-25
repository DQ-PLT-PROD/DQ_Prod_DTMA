import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const PAGE_BACKGROUND =
  "radial-gradient(circle at 20% 20%, #f4f7ff 0%, #ffffff 45%, #f9fbff 100%)";
const CARD_GRADIENT = [
  "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 42%)",
  "radial-gradient(circle at 82% 28%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 40%)",
  "linear-gradient(125deg, #1839ad 0%, #2f57d4 52%, #5f88ff 100%)",
].join(", ");
const CARD_PATTERN = [
  "linear-gradient(120deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
  "linear-gradient(240deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
  "linear-gradient(0deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
].join(", ");
const CARD_PATTERN_SIZE = "120px 120px, 120px 120px, 120px 120px";
const CARD_PATTERN_POSITION = "0 0, 60px 60px, 0 0";
const CARD_SHADOW =
  "0 32px 80px rgba(9, 44, 150, 0.25), 0 16px 36px rgba(9, 44, 150, 0.15)";

const FEATURE_LABELS: Record<string, string> = {
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
  "help-center": "Help Center",
};

export const ComingSoon: React.FC<{ pageName?: string }> = ({ pageName }) => {
  const navigate = useNavigate();
  const { feature } = useParams();

  const label = pageName || (feature ? FEATURE_LABELS[feature] || "This Page" : "Help Center");

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-16 sm:py-20 text-white"
      style={{ background: PAGE_BACKGROUND }}
    >
      <div className="max-w-5xl w-full relative">
        <div
          className="absolute inset-0 -z-10 blur-3xl bg-white/50 rounded-[32px]"
          aria-hidden
        />

        <div
          className="relative rounded-[28px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-white/60"
          style={{ background: CARD_GRADIENT, boxShadow: CARD_SHADOW }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-35"
            style={{
              backgroundImage: CARD_PATTERN,
              backgroundSize: CARD_PATTERN_SIZE,
              backgroundPosition: CARD_PATTERN_POSITION,
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -left-32 bottom-10 w-96 h-96 rounded-full bg-white/15 blur-3xl" />

          <div className="relative px-6 sm:px-12 py-12 sm:py-16 text-center space-y-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.4em] md:tracking-[0.5em] uppercase text-white drop-shadow-sm">
              COMING <span className="text-white/70">SOON</span>
            </h1>

            <p className="max-w-2xl mx-auto text-white/80 text-base sm:text-lg leading-relaxed">
              {label} is being crafted with care. We're polishing the details and will be live shortly.
              In the meantime, stay tuned for updates from DTMA.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-6">
              <button
                onClick={() => navigate("/")}
                className="px-7 sm:px-9 py-3.5 rounded-full bg-white text-[#0b2fae] font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Back to Home
              </button>
              <button
                className="px-7 sm:px-9 py-3.5 rounded-full border border-white/60 text-white/95 font-semibold bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => navigate("/courses")}
              >
                Explore Courses
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 text-white/70 text-[11px] uppercase tracking-[0.28em]">
              <span>DTMA</span>
              <span className="w-10 sm:w-12 h-px bg-white/50" />
              <span>Digital Transformation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

