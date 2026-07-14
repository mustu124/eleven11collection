"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Horizontally scrollable, snap-to-slide carousel. The scroll container is
 * native `overflow-x-auto` + `scroll-snap`, so touch swipe works for free on
 * mobile — the arrow buttons and dots are a desktop-friendly enhancement on
 * top of that, not the only way to navigate. Arrows/dots hide themselves
 * when there's nothing to scroll to (0 or 1 slide).
 */
export function Carousel({
  slides,
  ariaLabel,
  showDots = true,
  slideClassName = "w-full shrink-0 snap-center",
  className = "",
  autoRotate = false,
  autoRotateInterval = 5000,
}: {
  slides: React.ReactNode[];
  ariaLabel: string;
  showDots?: boolean;
  slideClassName?: string;
  className?: string;
  autoRotate?: boolean;
  autoRotateInterval?: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const canScroll = slides.length > 1;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !canScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const index = slideRefs.current.findIndex((el) => el === entry.target);
            if (index !== -1) setActiveIndex(index);
          }
        }
      },
      { root: scroller, threshold: 0.5 }
    );

    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [canScroll, slides.length]);

  function scrollToIndex(index: number) {
    const target = slideRefs.current[index];
    target?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  useEffect(() => {
    if (!canScroll || !autoRotate) return;

    const id = setInterval(() => {
      scrollToIndex((activeIndexRef.current + 1) % slides.length);
    }, autoRotateInterval);

    return () => clearInterval(id);
  }, [canScroll, autoRotate, autoRotateInterval, slides.length]);

  const dots = useMemo(() => slides.map((_, i) => i), [slides]);

  if (slides.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollerRef}
        role="region"
        aria-label={ariaLabel}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className={slideClassName}
          >
            {slide}
          </div>
        ))}
      </div>

      {canScroll && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            className="absolute left-2 top-1/2 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink shadow-sm hover:bg-white md:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => scrollToIndex(Math.min(slides.length - 1, activeIndex + 1))}
            className="absolute right-2 top-1/2 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink shadow-sm hover:bg-white md:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {canScroll && showDots && (
        <div className="mt-3 flex items-center justify-center">
          {dots.map((i) => (
            // The dot itself stays small for the visual design; the button
            // adds padding so the actual tap target meets the 44x44px
            // target-size guideline instead of just the 6px visual dot.
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIndex}
              onClick={() => scrollToIndex(i)}
              className="flex min-h-11 min-w-11 items-center justify-center"
            >
              <span
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? "w-4 bg-gold" : "w-1.5 bg-ink/20"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
