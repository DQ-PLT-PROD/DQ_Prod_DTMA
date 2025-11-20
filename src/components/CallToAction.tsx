import React from "react";
import { ArrowRight } from "lucide-react";
import { FadeInUpOnScroll } from "./AnimationUtils";
import {
  BRAND_GRADIENT,
  BRAND_PRIMARY,
  BRAND_BACKDROP_BLUR,
} from "../constants/branding";

const CallToAction: React.FC = () => {
  return (
    <section
      id="final-cta"
      className="relative overflow-hidden py-16"
      style={{
        backgroundColor: "rgba(46, 70, 158, 0.03)",
      }}
    >
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 text-[#030C2B]">
        <FadeInUpOnScroll className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Grow in the AI Working Era?
          </h2>
          <p className="text-lg text-[#030C2B]/80">
            Join DTMA to learn practical, future-ready skills and prove them
            with a Digital Qatalyst Recognition Badge.
          </p>
        </FadeInUpOnScroll>

        <FadeInUpOnScroll delay={0.2}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl hover:opacity-90"
              style={{ backgroundColor: BRAND_PRIMARY }}
            >
              Start Your Learning Journey
              <ArrowRight size={16} className="ml-2" />
            </a>
          </div>
        </FadeInUpOnScroll>
      </div>
    </section>
  );
};

export default CallToAction;
