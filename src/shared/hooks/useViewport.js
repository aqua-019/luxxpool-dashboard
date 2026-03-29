import { useState, useEffect, useMemo } from 'react';
import { BREAKPOINTS } from '../utils/constants.js';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — useViewport Hook
// Viewport detection + device capabilities + responsive config
// Extended from v3.1 useViewport() with GPU/memory/DPR detection
// ═══════════════════════════════════════════════════════════

export function useViewport() {
  const [size, setSize] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  useEffect(() => {
    let raf;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setSize({ w: window.innerWidth, h: window.innerHeight });
      });
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
      cancelAnimationFrame(raf);
    };
  }, []);

  return useMemo(() => {
    const w = size.w;
    const h = size.h;

    // Breakpoint classification
    const mobile = w < 768;
    const tablet = w >= 768 && w < 1200;
    const desktop = w >= 1200 && w < 1600;
    const wide = w >= 1600;
    const bp = mobile ? 'mobile' : tablet ? 'tablet' : desktop ? 'desktop' : 'wide';

    // Grid config from breakpoint
    const config = BREAKPOINTS[bp];
    const cols = config.cols;
    const gap = config.gap;
    const pad = config.pad + 'px';
    const fontSize = config.fontSize;
    const chartH = config.chartH;

    // Device capabilities (Phase 1: basic detection, Phase 4: full WebGL probing)
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const touch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // GPU tier detection (simplified for Phase 1)
    let gpuTier = 'high'; // default
    if (mobile) gpuTier = 'medium';
    if (mobile && dpr < 2) gpuTier = 'low';

    // Render tier: ultra > high > medium > low
    const renderTier = gpuTier === 'ultra' ? 3 : gpuTier === 'high' ? 2 : gpuTier === 'medium' ? 1 : 0;

    return {
      w, h, bp, mobile, tablet, desktop, wide,
      cols, gap, pad, fontSize, chartH,
      dpr, touch, gpuTier, renderTier,
      // Convenience: is this at least X?
      isTabletUp: !mobile,
      isDesktopUp: desktop || wide,
    };
  }, [size.w, size.h]);
}
