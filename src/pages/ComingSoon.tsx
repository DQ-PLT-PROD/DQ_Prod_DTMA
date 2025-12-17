import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const GRADIENT_BG = "#ffffff";
const CARD_GRADIENT =
  "linear-gradient(135deg, #1839AD 0%, #2f57d4 50%, #5f88ff 100%)";

const FEATURE_LABELS: Record<string, string> = {
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
  "help-center": "Help Center",
};

export const ComingSoon: React.FC = () => {
  const navigate = useNavigate();
  const { feature } = useParams();

  const label = feature ? FEATURE_LABELS[feature] || "This Page" : "This Page";

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-12 text-white"
      style={{ background: GRADIENT_BG }}
    >
      <div className="max-w-5xl w-full relative">
        <div className="absolute inset-0 blur-3xl opacity-30 bg-white" aria-hidden />

        <div
          className="relative rounded-3xl shadow-2xl overflow-hidden border border-white/10"
          style={{ background: CARD_GRADIENT }}
        >
          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -left-32 bottom-0 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

          <div className="relative px-6 sm:px-12 py-12 sm:py-16 text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.35em] text-white">
              COMING <span className="text-white/70">SOON</span>
            </h1>

            <p className="max-w-2xl mx-auto text-white/80 text-base sm:text-lg">
              {label} is being crafted with care. We’re polishing the details and will be live shortly.
              In the meantime, stay tuned for updates from DTMA.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
              <button
                onClick={() => navigate("/")}
                className="px-6 sm:px-8 py-3 rounded-full bg-white text-[#0a32a0] font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Back to Home
              </button>
              <button
                className="px-6 sm:px-8 py-3 rounded-full border border-white/40 text-white/90 font-semibold hover:bg-white/10 transition-all"
                onClick={() => navigate("/marketplace/courses")}
              >
                Explore Courses
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/60 text-xs uppercase tracking-wide">
              <span>DTMA</span>
              <span className="w-8 h-px bg-white/40" />
              <span>Digital Transformation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
