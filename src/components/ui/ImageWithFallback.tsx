"use client";

import Image, { type ImageProps } from "next/image";
import { Component, useState, type ReactNode } from "react";

const FALLBACK_SRC = "/banner-fallback.svg";

/**
 * next/image throws synchronously (not a catchable onError) when a src's
 * hostname isn't in next.config.js's remotePatterns — which is exactly
 * what happens the moment an admin pastes a URL from some host we've never
 * heard of. onError alone only covers network-level failures (404s, a
 * reachable host serving a broken file); this boundary covers the
 * render-time throw too, so one bad admin-entered URL can't crash the page.
 */
class ImageErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Expected for admin-entered URLs from unconfigured/unreachable hosts — no need to log.
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function ImageWithFallback({ src, alt, ...props }: ImageProps) {
  // Track *which* src failed, not just a boolean — so if src later changes
  // (e.g. an admin editing the URL field live), a new value gets a clean
  // attempt instead of being stuck showing the fallback forever.
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const failed = failedSrc === src;
  const fallback = <Image {...props} src={FALLBACK_SRC} alt="Image unavailable" />;

  if (failed) return fallback;

  return (
    <ImageErrorBoundary key={String(src)} fallback={fallback}>
      <Image {...props} src={src} alt={alt} onError={() => setFailedSrc(src)} />
    </ImageErrorBoundary>
  );
}
