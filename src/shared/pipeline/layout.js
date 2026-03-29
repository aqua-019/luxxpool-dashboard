import { COMPONENT_REGISTRY } from '../utils/constants';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Pipeline Step 5: ADAPTIVE LAYOUT
// Computes CSS Grid placement for each component based on
// viewport breakpoint, device tier, and component metadata
// ═══════════════════════════════════════════════════════════

/**
 * Compute the grid layout for rendered components.
 *
 * @param {Array} components - from renderComponents()
 * @param {Object} viewport - from useViewport()
 * @returns {Object} { grid, placements }
 */
export function computeLayout(components, viewport) {
  const { bp, cols, gap, pad, chartH, renderTier } = viewport;

  const grid = { cols, gap, pad, chartH };

  const placements = components.map(c => {
    const meta = COMPONENT_REGISTRY[c.id];
    if (!meta) return { ...c, gridColumn: 'span 1', gridRow: 'span 1' };

    // Get span for current breakpoint
    const spanDef = meta.span?.[bp] || [1, 1];
    const [spanCols, spanRows] = spanDef;

    // Clamp span to available columns
    const effectiveCols = Math.min(spanCols, cols);

    return {
      ...c,
      gridColumn: `span ${effectiveCols}`,
      gridRow: spanRows > 1 ? `span ${spanRows}` : undefined,
      chartDimensions: {
        height: chartH * spanRows,
      },
      // Never exceed device render tier
      effectiveTier: Math.min(
        meta.tier === 'critical' ? 3 : meta.tier === 'above-fold' ? 2 : 1,
        renderTier + 1 // renderTier is 0-3, tiers are 1-3
      ),
    };
  });

  return { grid, placements };
}
