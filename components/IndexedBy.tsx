"use client";

import { useEffect, useRef } from "react";

type IndexingPartner = {
  id?: number;
  name?: string;
  image?: string | null;
  logo?: string | null;
  url?: string | null;
};

type IndexedByProps = {
  partners?: IndexingPartner[] | null;
};

export default function IndexedBy({ partners }: IndexedByProps) {
  const items =
    partners?.filter((partner) => {
      const logo = partner.logo ?? partner.image;
      return Boolean(logo && partner.url);
    }) ?? [];

  const loopItems = items.length > 0 ? [...items, ...items] : [];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const isPausedRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragMovedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0) {
      return;
    }

    let animationId = 0;
    let lastTime = performance.now();
    const speed = 0.04;

    const tick = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isDraggingRef.current && !isPausedRef.current) {
        container.scrollLeft += speed * delta;
        const maxScroll = container.scrollWidth / 2;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft -= maxScroll;
        }
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [items.length]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    isDraggingRef.current = true;
    dragMovedRef.current = false;
    isPausedRef.current = true;
    container.setPointerCapture(event.pointerId);
    startXRef.current = event.clientX;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !isDraggingRef.current) {
      return;
    }

    const diff = event.clientX - startXRef.current;
    if (Math.abs(diff) > 5) {
      dragMovedRef.current = true;
    }
    container.scrollLeft = scrollLeftRef.current - diff;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    isDraggingRef.current = false;
    container.releasePointerCapture(event.pointerId);
    isPausedRef.current = false;
  };

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
              Indexed By
            </h2>
            <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
              Trusted discovery platforms for global visibility.
            </p>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]/70">
            Partners
          </span>
        </div>
        {items.length > 0 ? (
          <div
            ref={containerRef}
            className="mt-6 marquee select-none rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-40)] p-4 shadow-[var(--shadow-card)]"
            onPointerDownCapture={handlePointerDown}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => {
              isPausedRef.current = true;
            }}
            onMouseLeave={() => {
              if (!isDraggingRef.current) {
                isPausedRef.current = false;
              }
            }}
          >
            <div className="marquee-track" style={{ gap: "16px" }}>
              {loopItems.map((partner, index) => {
                const logo = partner.logo ?? partner.image;
                const key = `${partner.id ?? partner.url ?? partner.name}-${index}`;
                return (
                  <a
                    key={key}
                    href={partner.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-[140px] items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] px-4 py-3 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[color:var(--color-border-strong)] cursor-grab active:cursor-grabbing"
                    title={partner.name ?? ""}
                    aria-label={partner.name ?? "Indexing partner"}
                    aria-hidden={index >= items.length}
                    onDragStart={(event) => event.preventDefault()}
                    onClick={(event) => {
                      if (dragMovedRef.current) {
                        event.preventDefault();
                        event.stopPropagation();
                      }
                    }}
                  >
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt={partner.name ?? "Indexing partner"}
                        draggable={false}
                        className="h-10 w-auto object-contain sm:h-12"
                      />
                    ) : null}
                  </a>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 text-sm text-[color:var(--color-text-secondary)]">
            No indexing partners.
          </div>
        )}
      </div>
    </section>
  );
}
