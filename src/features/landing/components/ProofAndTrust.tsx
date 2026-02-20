import React, { useEffect, useState } from "react";
import { FadeInUpOnScroll } from "@/components/AnimationUtils";
import { PageContainer } from "@/components/layouts/PageContainer";

const typingWords = ["leaders", "workers"];

const whyHighlights = [
  {
    title: "Master the skills that matter in the AI era",
    description:
      "Bite‑sized, practical lessons that make digital transformation simple, clear, and actionable.",
  },
  {
    title: "Learn through a proven digital transformation framework",
    description:
      "Every course follows a structure, which is your roadmap for understanding and leading change.",
  },
  {
    title: "Built for busy professionals who need results",
    description:
      "Tools, playbooks, and frameworks you can apply immediately to grow your career or transform your organization.",
  },
];

/**
 * Benefits section — "Built for modern leaders/workers" copy + Why DTMA highlights.
 * The metrics/stats bar lives in MetricsSection (its own viewport section).
 */
const ProofAndTrust: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = typingWords[currentWordIndex];
    const letterDelay = Math.max(1000 / currentWord.length, 60);
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 4000);
    } else if (isDeleting && displayText === "") {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % typingWords.length);
      }, 1000);
    } else {
      const nextLength = isDeleting
        ? displayText.length - 1
        : displayText.length + 1;
      const nextText = currentWord.slice(0, Math.max(nextLength, 0));
      timeout = setTimeout(() => setDisplayText(nextText), letterDelay);
    }

    return () => clearTimeout(timeout);
  }, [displayText, currentWordIndex, isDeleting]);

  return (
    <div className="w-full flex flex-col justify-center py-16 sm:py-20">
      <PageContainer>
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
          <FadeInUpOnScroll className="space-y-6 text-left flex flex-col items-start">
            <img
              src="/images/landing/leaders-collaborating.png"
              alt="Leaders collaborating"
              className="w-full max-w-sm rounded-full"
            />
            <h2 className="text-3xl md:text-4xl font-bold text-[#030C2B] leading-tight max-w-4xl pr-6">
              Built for modern{" "}
              <span
                className="typing-word"
                aria-live="polite"
                aria-label={typingWords[currentWordIndex]}
              >
                {displayText}
              </span>{" "}
              rooted in real digital transformation.
            </h2>
          </FadeInUpOnScroll>
          <FadeInUpOnScroll className="space-y-6 text-left lg:pl-6 pr-6 lg:pr-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#1839AD]">
              Why DTMA?
            </p>
            <div className="space-y-5">
              {whyHighlights.map((item) => (
                <div key={item.title}>
                  <p className="text-base font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </FadeInUpOnScroll>
        </div>
      </PageContainer>
    </div>
  );
};

export default ProofAndTrust;
