// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Pipeline Step 6: FEEDBACK LOOP
// Captures user interactions, monitors performance,
// and feeds signals back into the pipeline for re-generation
// ═══════════════════════════════════════════════════════════

/**
 * Start FPS monitoring. Returns a stop function.
 * Updates the UI store with current FPS for render tier decisions.
 */
export function startPerfMonitor(updateFn) {
  let frames = 0;
  let lastTime = performance.now();
  let rafId;

  function tick(now) {
    frames++;
    if (now - lastTime >= 1000) {
      const fps = Math.round(frames * 1000 / (now - lastTime));
      const renderTime = frames > 0 ? Math.round((now - lastTime) / frames) : 0;
      updateFn(fps, renderTime);
      frames = 0;
      lastTime = now;
    }
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(rafId);
}

/**
 * Interaction dispatchers — these are passed to components
 * and feed back into the pipeline by updating UI store state.
 *
 * In Phase 3, some of these will also send analytics events.
 */
export const interactions = {
  timeRangeChange: (range, setTimeRange) => {
    setTimeRange(range);
  },

  skinSwitch: (skin, setSkin) => {
    setSkin(skin);
  },

  modeToggle: (toggleMode) => {
    toggleMode();
  },

  viewNavigate: (view, setView) => {
    setView(view);
  },

  componentExpand: (id, toggleCollapse) => {
    toggleCollapse(id);
  },
};

/**
 * Event-driven re-composition signals.
 * These are checked by the template selector (Step 3).
 *
 * In Phase 3, these come from WebSocket events.
 * In Phase 1, they're derived from state changes in deriveState().
 */
export const eventSignals = {
  BLOCK_FOUND: 'block.found',
  WORKER_DOWN: 'worker.down',
  PAYOUT_READY: 'payout.ready',
  SECURITY_ALERT: 'security.alert',
  THERMAL_WARN: 'thermal.warn',
  REJECT_SPIKE: 'reject.spike',
};
