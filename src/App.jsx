import { useEffect, useMemo, Suspense, useCallback } from 'react';
import { usePoolStore } from './store/poolStore';
import { useFleetStore } from './store/fleetStore';
import { useNetworkStore } from './store/networkStore';
import { useSecurityStore } from './store/securityStore';
import { useUIStore, PUBLIC_TABS, PRIVATE_TABS } from './store/uiStore';
import { connectIngest, useConnectionStore } from './pipeline/ingest';
import { deriveState } from './pipeline/derive';
import { selectTemplates } from './pipeline/template';
import { renderComponents } from './pipeline/render';
import { computeLayout } from './pipeline/layout';
import { startPerfMonitor } from './pipeline/feedback';
import { useViewport } from './hooks/useViewport';
import { usePerformance } from './hooks/usePerformance';
import { getSkin, SKIN_LIST } from './skins';
import { ShaderBackground, ShareParticles } from './three';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — GenUI Pipeline Orchestrator
//
// Step 1: INGEST  → connectIngest() feeds zustand stores
// Step 2: DERIVE  → deriveState() computes metrics + UI hints
// Step 3: SELECT  → selectTemplates() picks component IDs
// Step 4: RENDER  → renderComponents() lazy-loads + binds data
// Step 5: LAYOUT  → computeLayout() computes grid placement
// Step 6: FEEDBACK → perf monitor + user interactions → re-trigger
// ═══════════════════════════════════════════════════════════

// Skeleton fallback for Suspense
function SkeletonCard() {
  return (
    <div style={{
      background: '#0c1845',
      border: '0.5px solid rgba(91,155,240,0.08)',
      borderRadius: 12,
      padding: '14px 16px',
      minHeight: 60,
    }}>
      <div style={{
        height: 8, width: '40%', borderRadius: 3, marginBottom: 8,
        background: 'linear-gradient(90deg, rgba(91,155,240,0.04) 25%, rgba(91,155,240,0.08) 50%, rgba(91,155,240,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s ease-in-out infinite',
      }} />
      <div style={{
        height: 20, width: '30%', borderRadius: 3,
        background: 'linear-gradient(90deg, rgba(91,155,240,0.04) 25%, rgba(91,155,240,0.08) 50%, rgba(91,155,240,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s ease-in-out infinite',
      }} />
    </div>
  );
}

export default function App() {
  const viewport = useViewport();
  const perf = usePerformance();

  // ── UI Store (individual selectors — prevents re-render on unrelated changes) ──
  const skin = useUIStore(s => s.skin);
  const mode = useUIStore(s => s.mode);
  const publicView = useUIStore(s => s.publicView);
  const privateView = useUIStore(s => s.privateView);
  const setSkin = useUIStore(s => s.setSkin);
  const toggleMode = useUIStore(s => s.toggleMode);
  const setPublicView = useUIStore(s => s.setPublicView);
  const setPrivateView = useUIStore(s => s.setPrivateView);
  const updatePerf = useUIStore(s => s.updatePerf);

  // ── Connection state (from ingest pipeline) ──
  const connMode = useConnectionStore(s => s.mode);
  const connEps = useConnectionStore(s => s.eventsPerSecond);
  const connTotal = useConnectionStore(s => s.totalEvents);
  const connUptime = useConnectionStore(s => s.uptime);
  const connFlushes = useConnectionStore(s => s.flushCount);

  // ── Skin resolution ──
  const skinData = useMemo(() => getSkin(skin), [skin]);
  const colors = skinData.colors;
  const fonts = skinData.fonts;
  const isPrivate = mode === 'private';
  const activeView = isPrivate ? privateView : publicView;
  const tabs = isPrivate ? PRIVATE_TABS : PUBLIC_TABS;
  const setView = isPrivate ? setPrivateView : setPublicView;

  // ── Merge viewport with real GPU tier from usePerformance ──
  const enhancedViewport = useMemo(() => ({
    ...viewport,
    gpuTier: perf.tier,
    renderTier: perf.tierValue,
    fps: perf.fps,
    can3D: perf.can3D,
    canParticles: perf.canParticles,
    canShaders: perf.canShaders,
    canBlur: perf.canBlur,
    canAnimate: perf.canAnimate,
    degraded: perf.degraded,
  }), [viewport, perf.tier, perf.tierValue, perf.fps, perf.can3D, perf.canParticles, perf.canShaders, perf.canBlur, perf.canAnimate, perf.degraded]);

  // ── STEP 1: DATA INGEST (Phase 3: ring buffer + simulator) ──
  useEffect(() => {
    const cleanup = connectIngest({
      onPool: usePoolStore.getState().ingest,
      onFleet: useFleetStore.getState().ingest,
      onNetwork: useNetworkStore.getState().ingest,
      onSecurity: useSecurityStore.getState().ingest,
    }, {
      forceDemo: true, // Switch to false + provide wsUrl when pool server is live
      // wsUrl: 'wss://api.luxxpool.com/ws',
    });
    return cleanup;
  }, []);

  // ── Store selectors (shallow for performance) ──
  const pool = usePoolStore();
  const fleet = useFleetStore();
  const network = useNetworkStore();
  const security = useSecurityStore();

  // ── STEP 2: STATE DERIVE ──
  const derived = useMemo(
    () => deriveState({ pool, fleet, network, security }),
    [pool, fleet, network, security]
  );

  // ── STEP 3: TEMPLATE SELECT ──
  const templateIds = useMemo(
    () => selectTemplates(derived, { mode, viewport: enhancedViewport, skin, activeView }),
    [derived, mode, enhancedViewport, skin, activeView]
  );

  // ── STEP 4: RENDER GENERATE ──
  const components = useMemo(
    () => renderComponents(templateIds, derived),
    [templateIds, derived]
  );

  // ── STEP 5: ADAPTIVE LAYOUT ──
  const layout = useMemo(
    () => computeLayout(components, enhancedViewport),
    [components, enhancedViewport]
  );

  // ── STEP 6: FEEDBACK LOOP (perf monitor) ──
  useEffect(() => {
    const stop = startPerfMonitor(updatePerf);
    return stop;
  }, [updatePerf]);

  // ── Accent color for mode ──
  const accent = isPrivate ? colors.a5 : colors.a1;

  return (
    <>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { width: 100%; min-height: 100vh; overflow-x: hidden; }
        body { background: ${colors.bg}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${colors.bg}; }
        ::-webkit-scrollbar-thumb { background: ${colors.luxx400 || '#1a3480'}; border-radius: 2px; }
        input:focus { outline: none; }
      `}</style>

      <div style={{
        minHeight: '100vh', width: '100%',
        background: colors.bg,
        fontFamily: fonts.body,
        fontSize: viewport.fontSize * 16 + 'px',
        color: colors.dim,
      }}>
        {/* ═══ HEADER / NAVIGATION ═══ */}
        <header style={{
          padding: viewport.mobile ? '8px 12px' : `10px ${viewport.pad}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: viewport.mobile ? 6 : 12,
          borderBottom: `0.5px solid ${colors.luxx500 || '#1a1a1a'}22`,
          background: colors.bg,
          position: 'sticky', top: 0, zIndex: 100,
          flexWrap: viewport.mobile ? 'wrap' : 'nowrap',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          {/* Logo */}
          <div style={{
            fontSize: viewport.mobile ? 16 : 20,
            fontFamily: fonts.display,
            fontWeight: 500,
            color: colors.br,
            letterSpacing: '-0.03em',
            flexShrink: 0,
          }}>
            LUXX<span style={{ color: colors.a5 }}>POOL</span>
            <span style={{
              fontSize: 9, color: colors.dim, marginLeft: 8,
              fontFamily: fonts.body, fontWeight: 400, letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              v4.0
            </span>
          </div>

          {/* Skin switcher */}
          <div style={{
            display: 'flex', gap: 2,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6, padding: 2, flexShrink: 0,
          }}>
            {SKIN_LIST.map(s => (
              <button key={s.id} onClick={() => setSkin(s.id)} style={{
                padding: viewport.mobile ? '3px 8px' : '4px 12px',
                border: 'none', borderRadius: 4, cursor: 'pointer',
                fontSize: viewport.mobile ? 9 : 11,
                fontFamily: fonts.body, fontWeight: 500, letterSpacing: '0.05em',
                background: skin === s.id ? accent + '18' : 'transparent',
                color: skin === s.id ? accent : '#444',
                transition: 'all 0.15s',
              }}>
                {s.name}
              </button>
            ))}
          </div>

          {/* View tabs */}
          <div style={{
            display: 'flex', gap: viewport.mobile ? 2 : 4,
            flexWrap: 'wrap', justifyContent: 'center', flex: 1,
          }}>
            {tabs.map(t => (
              <span key={t.id} onClick={() => setView(t.id)} style={{
                padding: viewport.mobile ? '3px 6px' : '4px 12px',
                cursor: 'pointer',
                fontSize: viewport.mobile ? 9 : 12,
                fontFamily: fonts.body,
                color: activeView === t.id ? colors.br : colors.dim,
                background: activeView === t.id ? accent + '0a' : 'transparent',
                borderBottom: activeView === t.id ? `1px solid ${accent}44` : '1px solid transparent',
                fontWeight: activeView === t.id ? 600 : 400,
                letterSpacing: '0.04em',
                borderRadius: '4px 4px 0 0',
                transition: 'all 0.15s',
              }}>
                {t.label}
              </span>
            ))}
          </div>

          {/* Mode toggle + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: viewport.mobile ? 6 : 12, flexShrink: 0 }}>
            <div onClick={toggleMode} style={{
              cursor: 'pointer',
              padding: viewport.mobile ? '3px 8px' : '4px 14px',
              borderRadius: 20, border: `0.5px solid ${accent}33`,
              fontSize: viewport.mobile ? 9 : 11,
              fontFamily: fonts.body, fontWeight: 500,
              color: accent, letterSpacing: '0.06em',
              transition: 'all 0.2s',
            }}>
              {isPrivate ? 'Private' : 'Public'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: connMode === 'live' ? colors.success : colors.a5,
                boxShadow: `0 0 6px ${connMode === 'live' ? colors.success : colors.a5}88`,
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              {!viewport.mobile && (
                <span style={{ fontSize: 10, color: connMode === 'live' ? colors.success : colors.a5 }}>
                  {connMode === 'live' ? 'live' : 'demo'}{connEps > 0 ? ` · ${connEps} evt/s` : ''}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ═══ PIPELINE INFO BAR (private only) ═══ */}
        {isPrivate && !viewport.mobile && (
          <div style={{
            padding: `4px ${viewport.pad}`,
            borderBottom: `0.5px solid ${colors.luxx500 || '#1a1a1a'}11`,
            display: 'flex', gap: 12, fontSize: 9,
            fontFamily: fonts.mono, color: colors.dim,
          }}>
            <span>GenUI pipeline: 6 steps</span>
            <span>·</span>
            <span>Mode: <span style={{ color: connMode === 'live' ? colors.success : colors.a5 }}>{connMode}</span></span>
            <span>·</span>
            <span>Events: <span style={{ color: colors.a1 }}>{connEps}/s</span> ({connTotal.toLocaleString()} total)</span>
            <span>·</span>
            <span>Flushes: {connFlushes.toLocaleString()}</span>
            <span>·</span>
            <span>Components: {templateIds.length} / 40</span>
            <span>·</span>
            <span>View: {activeView}</span>
            <span>·</span>
            <span>Viewport: {enhancedViewport.bp} ({enhancedViewport.w}×{enhancedViewport.h})</span>
            <span>·</span>
            <span>Tier: <span style={{ color: perf.degraded ? colors.warning : colors.a1 }}>{perf.tier}{perf.degraded ? ' (degraded)' : ''}</span></span>
            <span>·</span>
            <span>FPS: <span style={{ color: perf.fps < 25 ? colors.danger : perf.fps < 50 ? colors.warning : colors.success }}>{perf.fps}</span></span>
            <span>·</span>
            <span>GPU: {perf.gpu.renderer?.split('/')[0]?.slice(0, 20) || 'unknown'}</span>
            <span>·</span>
            <span>3D: {perf.can3D ? 'on' : 'off'}</span>
            <span>·</span>
            <span>Uptime: {connUptime}s</span>
          </div>
        )}

        {/* ═══ MAIN CONTENT — PIPELINE OUTPUT ═══ */}
        <main style={{
          padding: enhancedViewport.pad,
          width: '100%',
          position: 'relative',
        }}>
          {/* 3D Background — only renders on high+ tier */}
          {perf.canShaders && !enhancedViewport.mobile && (
            <Suspense fallback={null}>
              <ShaderBackground
                urgency={derived.uiHints?.urgency || 0}
                hashrate={derived.hashrate?.effective ? Math.min(1, derived.hashrate.effective / 400e9) : 0.5}
                colors={colors}
                style={{ borderRadius: 12, opacity: 0.4 }}
              />
            </Suspense>
          )}

          {/* Share Particles — on high+ tier, bursts on block found */}
          {perf.canParticles && !enhancedViewport.mobile && (
            <Suspense fallback={null}>
              <ShareParticles
                shareRate={derived.shares?.rate || 1800}
                freshBlock={derived.uiHints?.freshBlock || false}
                color={colors.a1}
                style={{ borderRadius: 12, opacity: 0.5 }}
              />
            </Suspense>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${layout.grid.cols}, 1fr)`,
            gap: layout.grid.gap,
            position: 'relative',
            zIndex: 2,
          }}>
            {layout.placements.map(({ id, Component, props, gridColumn, gridRow }) => (
              <div key={id} style={{
                gridColumn,
                gridRow: gridRow || undefined,
              }}>
                <Suspense fallback={<SkeletonCard />}>
                  <Component
                    {...props}
                    viewport={enhancedViewport}
                    skin={skinData}
                  />
                </Suspense>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {layout.placements.length === 0 && (
            <div style={{
              textAlign: 'center', padding: 60,
              color: colors.dim, fontSize: 14,
            }}>
              No components for this view. Switch views or check the template configuration.
            </div>
          )}
        </main>

        {/* ═══ FOOTER ═══ */}
        <footer style={{
          padding: `10px ${viewport.pad}`,
          borderTop: `0.5px solid ${colors.luxx500 || '#1a1a1a'}11`,
          fontSize: viewport.mobile ? 9 : 11,
          color: colors.dim,
          fontFamily: fonts.body,
          display: 'flex', justifyContent: 'space-between',
          letterSpacing: '0.04em',
        }}>
          <span>LUXXPOOL v4.0 · Christina Lake, BC · {connMode.toUpperCase()} mode</span>
          <span>
            {isPrivate
              ? `Operator · Fleet: 20 · Public: 2 · GenUI pipeline active`
              : `Scrypt multi-coin · PPLNS · 10 merged chains`
            }
          </span>
        </footer>
      </div>
    </>
  );
}
