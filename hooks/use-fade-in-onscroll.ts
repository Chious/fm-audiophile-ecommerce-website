import { useEffect, useRef } from "react";

/**
 * Hook to interate with fade-in animate
 *
 * @export
 * @param {*} [{
 *   threshold = 0.35,
 *   rootMargin = '0px 0px -120px 0px',
 * }={}]
 * @return array of refs can reference to the jsx. For example:  ref={(el) => {
              itemsRef.current[index] = el;
            }}
 */
export function useFadeInOnScroll({
  threshold = 0.35,
  rootMargin = "0px 0px -120px 0px",
} = {}) {
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    const items = [...itemsRef.current];
    items.forEach((el) => {
      if (el) {
        // keep target transparent before observed
        el.classList.add("fade-in-target");
        observer.observe(el);
      }
    });

    return () => items.forEach((el) => el && observer.unobserve(el));
  }, [threshold, rootMargin]);

  return itemsRef;
}
