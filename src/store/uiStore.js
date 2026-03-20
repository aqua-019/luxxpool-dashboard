import { create } from 'zustand';
import { DEFAULT_SKIN } from '../skins';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — UI Store
// Skin, mode, view, preferences — with localStorage persistence
// Step 6 (Feedback Loop) dispatches here
// ═══════════════════════════════════════════════════════════

function loadPref(key, fallback) {
  try { return JSON.parse(localStorage.getItem(`luxx.${key}`)) || fallback; }
  catch { return fallback; }
}

function savePref(key, value) {
  try { localStorage.setItem(`luxx.${key}`, JSON.stringify(value)); } catch {}
}

export const useUIStore = create((set) => ({
  skin: loadPref('skin', DEFAULT_SKIN),
  mode: loadPref('mode', 'public'),
  publicView: loadPref('publicView', 'pub.stats'),
  privateView: loadPref('privateView', 'prv.command'),

  // Time range for charts
  timeRange: '24h',

  // Collapsed panels (component IDs)
  collapsed: new Set(),

  // Performance monitoring state
  fps: 60,
  renderTime: 0,

  // Actions
  setSkin: (skin) => {
    savePref('skin', skin);
    set({ skin });
  },

  setMode: (mode) => {
    savePref('mode', mode);
    set({ mode });
  },

  toggleMode: () => set((state) => {
    const next = state.mode === 'public' ? 'private' : 'public';
    savePref('mode', next);
    return { mode: next };
  }),

  setPublicView: (view) => {
    savePref('publicView', view);
    set({ publicView: view });
  },

  setPrivateView: (view) => {
    savePref('privateView', view);
    set({ privateView: view });
  },

  setTimeRange: (range) => set({ timeRange: range }),

  toggleCollapse: (componentId) => set((state) => {
    const next = new Set(state.collapsed);
    if (next.has(componentId)) next.delete(componentId);
    else next.add(componentId);
    return { collapsed: next };
  }),

  updatePerf: (fps, renderTime) => set({ fps, renderTime }),
}));

// Navigation config — exported for use by NavigationShell
export const PUBLIC_TABS = [
  { id: 'pub.stats',   label: 'Pool stats' },
  { id: 'pub.connect', label: 'Connect' },
  { id: 'pub.guide',   label: 'Setup guide' },
  { id: 'pub.lookup',  label: 'Miner lookup' },
];

export const PRIVATE_TABS = [
  { id: 'prv.command',  label: 'Command' },
  { id: 'prv.security', label: 'Security' },
  { id: 'prv.fleet',    label: 'Fleet' },
  { id: 'prv.connect',  label: 'Connect' },
  { id: 'prv.ops',      label: 'Operations' },
];
