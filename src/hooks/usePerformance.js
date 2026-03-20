import { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — usePerformance Hook
// Real GPU capability detection, FPS sampling, memory tracking,
// automatic render tier degradation when performance drops
//
// Tiers: ultra (3) → high (2) → medium (1) → low (0)
//   ultra:  WebGPU + full 3D + particles + shaders
//   high:   WebGL 2 + 3D + reduced particles
//   medium: Simple 3D, no particles, reduced chart points
//   low:    2D only, no Canvas, no WebGL, minimal animations
// ═══════════════════════════════════════════════════════════

/** Probe actual GPU capabilities via WebGL */
function detectGPU() {
  const result = {
    webgl: false,
    webgl2: false,
    webgpu: false,
    renderer: 'unknown',
    vendor: 'unknown',
    maxTextureSize: 0,
    maxViewportDims: [0, 0],
    tier: 'low',
  };

  try {
    // WebGL 2 probe
    const canvas = document.createElement('canvas');
    let gl = canvas.getContext('webgl2');
    if (gl) {
      result.webgl2 = true;
      result.webgl = true;
    } else {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) result.webgl = true;
    }

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        result.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
        result.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown';
      }
      result.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
      result.maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) || [0, 0];
    }

    // WebGPU probe (async, but we check synchronously for the API existence)
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      result.webgpu = true;
    }
  } catch (e) {
    // GPU detection failed — stay at low tier
  }

  // Classify tier from capabilities
  const r = result.renderer.toLowerCase();
  const isIntegrated = r.includes('intel') || r.includes('mesa') || r.includes('swiftshader') || r.includes('llvmpipe');
  const isMobile = /android|iphone|ipad/i.test(navigator.userAgent || '');
  const isLowEnd = r.includes('mali-4') || r.includes('adreno 3') || r.includes('powervr');

  if (result.webgpu && !isIntegrated && !isMobile) {
    result.tier = 'ultra';
  } else if (result.webgl2 && !isLowEnd) {
    result.tier = isMobile ? 'medium' : (isIntegrated ? 'medium' : 'high');
  } else if (result.webgl) {
    result.tier = 'medium';
  } else {
    result.tier = 'low';
  }

  return result;
}

/** Get memory info if available */
function getMemoryInfo() {
  if (typeof performance !== 'undefined' && performance.memory) {
    return {
      usedJSHeap: performance.memory.usedJSHeapSize,
      totalJSHeap: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      pct: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
    };
  }
  return null;
}

const TIER_VALUES = { ultra: 3, high: 2, medium: 1, low: 0 };
const TIER_NAMES = ['low', 'medium', 'high', 'ultra'];

export function usePerformance() {
  const [gpu] = useState(() => detectGPU());
  const [fps, setFps] = useState(60);
  const [memory, setMemory] = useState(null);
  const [effectiveTier, setEffectiveTier] = useState(gpu.tier);
  const [degraded, setDegraded] = useState(false);

  const frameRef = useRef({ count: 0, lastTime: performance.now() });
  const lowFpsCount = useRef(0);

  // FPS sampler — runs continuously
  useEffect(() => {
    let rafId;
    const sample = (now) => {
      frameRef.current.count++;
      const elapsed = now - frameRef.current.lastTime;

      if (elapsed >= 1000) {
        const currentFps = Math.round((frameRef.current.count * 1000) / elapsed);
        setFps(currentFps);
        frameRef.current.count = 0;
        frameRef.current.lastTime = now;

        // Memory sampling (Chrome only)
        setMemory(getMemoryInfo());

        // Automatic tier degradation
        if (currentFps < 25) {
          lowFpsCount.current++;
          if (lowFpsCount.current >= 3) { // 3 consecutive seconds below 25fps
            setEffectiveTier(prev => {
              const currentVal = TIER_VALUES[prev] || 0;
              if (currentVal > 0) {
                setDegraded(true);
                return TIER_NAMES[currentVal - 1];
              }
              return prev;
            });
            lowFpsCount.current = 0;
          }
        } else if (currentFps > 50) {
          lowFpsCount.current = Math.max(0, lowFpsCount.current - 1);
        }
      }

      rafId = requestAnimationFrame(sample);
    };

    rafId = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Manual tier override
  const setTier = useCallback((tier) => {
    setEffectiveTier(tier);
    setDegraded(false);
  }, []);

  return {
    gpu,
    fps,
    memory,
    tier: effectiveTier,
    tierValue: TIER_VALUES[effectiveTier] || 0,
    baseTier: gpu.tier,
    degraded,
    setTier,

    // Convenience flags for components
    can3D: TIER_VALUES[effectiveTier] >= 2,       // high+
    canParticles: TIER_VALUES[effectiveTier] >= 2, // high+
    canShaders: TIER_VALUES[effectiveTier] >= 3,   // ultra only
    canBlur: TIER_VALUES[effectiveTier] >= 1,      // medium+
    canAnimate: TIER_VALUES[effectiveTier] >= 1,   // medium+
  };
}
