import React, { useEffect, useState, useRef, Children } from "react";
// Hook to detect when an element is visible in viewport
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit & { triggerOnce?: boolean } = {}
): [React.RefObject<T>, boolean] {
  const { triggerOnce, ...observerOptions } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const wasInView = useRef(false);

  useEffect(() => {
    // Set a fallback in case IntersectionObserver isn't working
    // This ensures elements become visible even if the observer fails
    const timeoutId = setTimeout(() => {
      if (!isInView) {
        setIsInView(true);
        wasInView.current = true;
      }
    }, 1000);

    // Use IntersectionObserver when available
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          const shouldUpdate =
            !triggerOnce || (triggerOnce && !wasInView.current);
          if (shouldUpdate) {
            setIsInView(true);
            wasInView.current = true;
            clearTimeout(timeoutId); // Clear timeout if observer works
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      }, observerOptions);

      const currentRef = ref.current;
      if (currentRef) {
        observer.observe(currentRef);
      }
      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
        clearTimeout(timeoutId); // Clear timeout on cleanup
      };
    }
    return () => clearTimeout(timeoutId);
  }, [observerOptions, triggerOnce]);

  return [ref, isInView];
}
// Animated text component for word-by-word animation
// 🔄 Drop-in replacement for AnimatedText
export const AnimatedText = ({
  text,
  className = "",
  delay = 0.1,
  duration = 0.5,
  once = true,
  /** Option A: CSS word spacing applied to the wrapper */
  wordSpacing, // e.g. "0.75rem" | "12px"
  /** Option B: margin gap between word spans (ignored if wordSpacing is set) */
  gap, // e.g. "0.75rem" | "12px"
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  wordSpacing?: string;
  gap?: string;
}) => {
  const words = text.split(" ");
  const [ref, isInView] = useInView({
    triggerOnce: once,
    threshold: 0.1,
    rootMargin: "0px 0px -20% 0px",
  });

  const [hasAnimated, setHasAnimated] = React.useState(false);
  const [forceShow, setForceShow] = React.useState(false);

  // Fallback: ensure text shows even if observer doesn’t fire
  React.useEffect(() => {
    const timer = setTimeout(() => setForceShow(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const shouldAnimate =
    forceShow || (once ? isInView && !hasAnimated : isInView);

  React.useEffect(() => {
    if (isInView && !hasAnimated && once) setHasAnimated(true);
  }, [isInView, hasAnimated, once]);
  return <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {words.map((word, i) => <span key={i} className="inline-block" style={{
      opacity: shouldAnimate ? 1 : 0,
      transform: shouldAnimate ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity ${duration}s ease-out, transform ${duration}s ease-out`,
      transitionDelay: `${delay * i}s`,
      marginRight: '1rem',
    }}>
          {word}{' '}
        </span>)}
    </span>;
};

// Animated element that fades and slides up when scrolled into view
export function FadeInUpOnScroll({
  children,
  className = "",
  delay = 0,
  threshold = 0.1,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  once?: boolean;
}) {
  const [ref, isInView] = useInView({
    threshold,
    triggerOnce: once,
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  // Always default to showing content after a short delay
  const [forceShow, setForceShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setForceShow(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  const shouldAnimate =
    forceShow || (once ? isInView && !hasAnimated : isInView);
  useEffect(() => {
    if (isInView && !hasAnimated && once) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, once]);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shouldAnimate ? 1 : 0,
        transform: shouldAnimate ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.8s ease-out, transform 0.8s ease-out`,
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
// Staggered animation for a list of items
export const StaggeredFadeIn = ({
  children,
  staggerDelay = 0.1,
  className = "",
  threshold = 0.1,
  once = true,
}) => {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => (
        <FadeInUpOnScroll
          delay={index * staggerDelay}
          threshold={threshold}
          once={once}
        >
          {child}
        </FadeInUpOnScroll>
      ))}
    </div>
  );
};
// Typing animation effect
// export const TypingAnimation = ({
//   text,
//   speed = 50,
//   className = "",
//   delay = 0,
// }) => {
//   const [displayedText, setDisplayedText] = useState("");
//   const [ref, isInView] = useInView({
//     threshold: 0.5,
//   });
//   const hasStartedRef = useRef(false);
//   // Fallback to show full text if animation doesn't trigger
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (displayedText !== text) {
//         setDisplayedText(text);
//       }
//     }, 2000);
//     return () => clearTimeout(timer);
//   }, [text, displayedText]);
//   useEffect(() => {
//     if (isInView && !hasStartedRef.current) {
//       hasStartedRef.current = true;
//       const timer = setTimeout(() => {
//         let i = 0;
//         const typingInterval = setInterval(() => {
//           setDisplayedText(text.substring(0, i));
//           i++;
//           if (i > text.length) {
//             clearInterval(typingInterval);
//           }
//         }, speed);
//         return () => clearInterval(typingInterval);
//       }, delay * 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [isInView, text, speed, delay]);
//   return (
//     <span ref={ref} className={className}>
//       {displayedText}
//     </span>
//   );
// };
