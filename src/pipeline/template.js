import { VIEW_TEMPLATES, COMPONENT_REGISTRY } from '../utils/constants';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Pipeline Step 3: TEMPLATE SELECT
// Maps (view + state + context) → component IDs from registry
// Generative: state-driven injection of components
// ═══════════════════════════════════════════════════════════

const SCOPE_FILTER = {
  public:  (meta) => meta.scope === 'both' || meta.scope === 'public',
  private: () => true, // private sees everything
};

/**
 * Select which component templates to render.
 *
 * @param {Object} derived - from deriveState()
 * @param {Object} context - { mode, viewport, skin, activeView }
 * @returns {number[]} ordered array of component IDs
 */
export function selectTemplates(derived, context) {
  const { mode, activeView } = context;

  // Base templates from view mapping
  let templates = [...(VIEW_TEMPLATES[activeView] || [])];

  // ── Generative injections based on derived state ──

  // Fresh block found → promote Block Timeline to position 2
  if (derived.uiHints.freshBlock && !templates.includes(11)) {
    templates.splice(1, 0, 11);
  }

  // Workers down → inject Operator Panel
  if (derived.anomalies.workerDown.length > 0 && mode === 'private' && !templates.includes(24)) {
    templates.push(24);
  }

  // Thermal warning → surface Fleet Matrix
  if (derived.thresholds.thermalWarn && mode === 'private' && !templates.includes(3)) {
    templates.push(3);
  }

  // Reject spike → inject Share Heatmap
  if (derived.thresholds.rejectWarn && mode === 'private' && !templates.includes(7)) {
    templates.push(7);
  }

  // Security event (critical) → inject Security Engine
  if (derived.security.activeAlerts > 0 && mode === 'private' && !templates.includes(17)) {
    templates.splice(1, 0, 17);
  }

  // ── Filter by mode scope ──
  const scopeFilter = SCOPE_FILTER[mode];
  templates = templates.filter(id => {
    const meta = COMPONENT_REGISTRY[id];
    return meta && scopeFilter(meta);
  });

  // ── Deduplicate while preserving order ──
  const seen = new Set();
  templates = templates.filter(id => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return templates;
}

/**
 * Get the render priority for a component based on current state.
 * Lower number = higher priority = loads first.
 */
export function getComponentPriority(id, derived) {
  const meta = COMPONENT_REGISTRY[id];
  if (!meta) return 99;

  // Base priority from tier
  let priority = meta.tier === 'critical' ? 0 :
                 meta.tier === 'above-fold' ? 1 : 2;

  // Boost priority if component matches current focus
  if (derived.uiHints.focus === 'blocks' && id === 11) priority = 0;
  if (derived.uiHints.focus === 'fleet' && (id === 3 || id === 24)) priority = 0;
  if (derived.uiHints.focus === 'shares' && id === 7) priority = 0;

  return priority;
}
