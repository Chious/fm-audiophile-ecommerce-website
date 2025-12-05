"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Hook for staggered fade-in animation when container enters viewport
 * Elements will animate in sequence from left to right (or top to bottom)
 */
export function useFadeInStagger({
  threshold = 0.2,
  rootMargin = "0px 0px -100px 0px",
  stagger = 0.15,
  y = 30,
  duration = 0.6,
} = {}) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(
      container.querySelectorAll<HTMLElement>("[data-stagger-item]")
    );
    children.forEach((el) => {
      el.classList.add("fade-in-target");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const children = Array.from(
              container.querySelectorAll<HTMLElement>("[data-stagger-item]")
            );

            // Set initial state
            gsap.set(children, { opacity: 0, y });

            // Animate with stagger
            gsap.to(children, {
              opacity: 1,
              y: 0,
              duration,
              stagger,
              ease: "power2.out",
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, stagger, y, duration]);

  return containerRef;
}
