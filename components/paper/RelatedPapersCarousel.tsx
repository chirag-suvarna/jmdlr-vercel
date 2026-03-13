"use client";

import { useRef } from "react";
import PaperCard from "@/components/paper/PaperCard";
import type { RelatedPaperItem } from "@/components/paper/types";

export type RelatedPapersCarouselProps = {
  papers: RelatedPaperItem[];
  onSelect: (paper: RelatedPaperItem) => void;
};

export default function RelatedPapersCarousel({
  papers,
  onSelect,
}: RelatedPapersCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  if (!papers.length) {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
          Related Papers
        </h3>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          No related papers found.
        </p>
      </section>
    );
  }

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
          Related Papers
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            aria-label="Scroll left"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
          >
            <svg
              aria-hidden
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            aria-label="Scroll right"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
          >
            <svg
              aria-hidden
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="scrollbar-hidden flex gap-4 overflow-x-auto scroll-smooth pb-2 bg-transparent"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {papers.map((paper) => (
          <div
            key={paper.id}
            className="snap-start"
            style={{ scrollSnapAlign: "start" }}
          >
            <PaperCard paper={paper} onClick={() => onSelect(paper)} />
          </div>
        ))}
      </div>
    </section>
  );
}
