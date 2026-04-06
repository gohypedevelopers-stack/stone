import React, { useState, useEffect, useRef } from "react";

/**
 * LazySection Wrapper
 * Only renders its children when they enter the viewport.
 * This significantly improves the performance of long pages by reducing the number of active React components and DOM nodes.
 */
const LazySection = ({ children, threshold = 0.1, rootMargin = "100px", minHeight = "200px" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [threshold, rootMargin]);

  return (
    <div
      ref={sectionRef}
      style={{ minHeight: isVisible ? "auto" : minHeight }}
      className={`transition-opacity duration-700 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {isVisible ? children : null}
    </div>
  );
};

export default React.memo(LazySection);
