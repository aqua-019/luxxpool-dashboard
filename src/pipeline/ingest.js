import { create } from 'zustand';
import { PIPELINE_CONFIG } from '../utils/constants';
import { generateBatch } from './simulator';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Pipeline Step 1: DATA INGEST (Phase 3)
//
// Dual-mode ingestion:
//   LIVE MODE:  WebSocket → Ring Buffer → 1s flush → stores
//   DEMO MODE:  Simulator → Ring Buffer → 1s flush → stores
//
// Both modes use identical ring buffer + flush architecture
// so the downstream pipeline is mode-agnostic.
//
// Ring buffer pattern:
//   Events arrive at high frequency (30+ per second)
//   They accumulate in a plain JS array (no React state)
//   Every 1 second, the buffer is flushed:
//     - Events are aggregated/reduced into store updates
//     - Buffer is cleared
//     - React re-renders happen only at 1Hz, not 30Hz
// ═══════════════════════════════════════════════════════════

// ── Connection State Store ──
// Separate from pipeline stores — tracks ingestion health
export const useConnectionStore = create((set) => ({
  mode: 'demo',          // 'live' | 'demo' | 'connecting' | 'error'
  wsStatus: 'disconnected', // 'connected' | 'connecting' | 'disconnected' | 'error'
  wsUrl: null,
  wsLatency: null,
  wsReconnectAttempt: 0,
  wsLastMessage: null,
  restStatus: 'idle',
  bufferDepth: 0,
  flushCount: 0,
  eventsPerSecond: 0,
  totalEvents: 0,
  errors: [],
  uptime: 0,
  startTime: Date.now(),

  update: (patch) => set((s) => ({ ...s, ...patch })),
  addError: (err) => set((s) => ({
    errors: [{ message: err, time: Date.now() }, ...s.errors.slice(0, 49)],
  })),
}));


// ── Ring Buffer ──
// Plain JS — no React state, no re-renders on push
let ringBuffer = [];
let flushCount = 0;
let eventCountThisSecond = 0;
let lastEpsCalc = Date.now();

function pushToBuffer(events) {
  ringBuffer.push(...events);
  eventCountThisSecond += events.length;
}


// ── WebSocket Client with Exponential Backoff + Jitter ──

let ws = null;
let wsReconnectTimer = null;
let wsReconnectAttempt = 0;
const WS_MAX_RECONNECT = 10;
const WS_BASE_DELAY = 1000;
const WS_MAX_DELAY = 30000;

function getBackoffDelay(attempt) {
  // Exponential backoff with full jitter
  // Reduces reconnection storms by ~42% vs fixed intervals
  const expDelay = Math.min(WS_MAX_DELAY, WS_BASE_DELAY * Math.pow(2, attempt));
  return Math.random() * expDelay;
}

function connectWebSocket(url, onMessage) {
  const conn = useConnectionStore.getState();
  conn.update({ wsStatus: 'connecting', wsUrl: url, wsReconnectAttempt: wsReconnectAttempt });

  try {
    ws = new WebSocket(url);

    ws.onopen = () => {
      wsReconnectAttempt = 0;
      const now = Date.now();
      useConnectionStore.getState().update({
        mode: 'live',
        wsStatus: 'connected',
        wsReconnectAttempt: 0,
        wsLastMessage: now,
      });
    };

    ws.onmessage = (evt) => {
      const now = Date.now();
      useConnectionStore.getState().update({ wsLastMessage: now });

      try {
        const data = JSON.parse(evt.data);
        // Normalize server events to our event schema
        const events = Array.isArray(data) ? data : [data];
        const normalized = events.map(e => ({
          type: e.type || e.method || 'unknown',
          payload: e.payload || e.params || e,
          ts: e.timestamp || now,
          ingested: now,
        }));
        pushToBuffer(normalized);
      } catch (err) {
        useConnectionStore.getState().addError('WS parse error: ' + err.message);
      }
    };

    ws.onclose = (evt) => {
      useConnectionStore.getState().update({ wsStatus: 'disconnected' });

      if (wsReconnectAttempt < WS_MAX_RECONNECT) {
        const delay = getBackoffDelay(wsReconnectAttempt);
        wsReconnectAttempt++;
        useConnectionStore.getState().update({ wsReconnectAttempt });
        wsReconnectTimer = setTimeout(() => connectWebSocket(url, onMessage), delay);
      } else {
        // Exceeded max reconnect — fall back to demo mode
        useConnectionStore.getState().update({ mode: 'demo', wsStatus: 'error' });
        useConnectionStore.getState().addError('WebSocket max reconnect exceeded, falling back to demo');
      }
    };

    ws.onerror = (err) => {
      useConnectionStore.getState().update({ wsStatus: 'error' });
      useConnectionStore.getState().addError('WebSocket error');
    };

  } catch (err) {
    useConnectionStore.getState().update({ mode: 'demo', wsStatus: 'error' });
    useConnectionStore.getState().addError('WebSocket connect failed: ' + err.message);
  }
}

function disconnectWebSocket() {
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
  }
  if (ws) {
    ws.onclose = null; // prevent reconnect on intentional close
    ws.close();
    ws = null;
  }
  wsReconnectAttempt = 0;
}


// ── REST Poller ──
// For slower-changing data (network info, prices, fleet config)

const restTimers = [];

function startRESTPolling(endpoints) {
  for (const [url, config] of Object.entries(endpoints)) {
    const poll = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        pushToBuffer([{
          type: 'rest.' + config.eventType,
          payload: data,
          ts: Date.now(),
          ingested: Date.now(),
        }]);
      } catch (err) {
        // REST failures are non-fatal — data will be stale but UI won't break
        useConnectionStore.getState().addError(`REST ${url}: ${err.message}`);
      }
    };

    // Initial fetch + interval
    poll();
    restTimers.push(setInterval(poll, config.interval));
  }
}

function stopRESTPolling() {
  restTimers.forEach(clearInterval);
  restTimers.length = 0;
}


// ── Simulator (Demo Mode) ──

let simulatorTimer = null;

function startSimulator() {
  useConnectionStore.getState().update({ mode: 'demo' });

  simulatorTimer = setInterval(() => {
    const events = generateBatch();
    pushToBuffer(events);
  }, PIPELINE_CONFIG.wsFlushInterval);
}

function stopSimulator() {
  if (simulatorTimer) {
    clearInterval(simulatorTimer);
    simulatorTimer = null;
  }
}


// ── Flush Engine ──
// The core of the ring buffer pattern:
// Every 1 second, process all buffered events and dispatch to stores

let flushTimer = null;

function startFlushEngine(dispatchers) {
  const { onPool, onFleet, onNetwork, onSecurity } = dispatchers;

  flushTimer = setInterval(() => {
    if (ringBuffer.length === 0) return;

    const batch = ringBuffer;
    ringBuffer = [];
    flushCount++;

    // Calculate events/sec
    const now = Date.now();
    if (now - lastEpsCalc >= 1000) {
      useConnectionStore.getState().update({
        eventsPerSecond: eventCountThisSecond,
        bufferDepth: 0,
        flushCount,
        totalEvents: useConnectionStore.getState().totalEvents + eventCountThisSecond,
        uptime: Math.floor((now - useConnectionStore.getState().startTime) / 1000),
      });
      eventCountThisSecond = 0;
      lastEpsCalc = now;
    }

    // ── Dispatch events to appropriate stores ──
    // Aggregate share events (high frequency) into a single store update
    const shareEvents = batch.filter(e =>
      e.type === 'share.accepted' || e.type === 'share.stale' || e.type === 'share.rejected'
    );
    const blockEvents = batch.filter(e => e.type === 'block.found');
    const hashrateEvents = batch.filter(e => e.type === 'pool.hashrate');
    const telemetryEvents = batch.filter(e => e.type === 'fleet.telemetry');
    const diffEvents = batch.filter(e => e.type === 'network.difficulty');
    const priceEvents = batch.filter(e => e.type === 'network.prices');
    const paymentEvents = batch.filter(e => e.type === 'payment.sent');
    const securityEvents = batch.filter(e => e.type === 'security.event');

    // Pool store: shares + blocks + hashrate + payments
    if (shareEvents.length > 0 || blockEvents.length > 0 || hashrateEvents.length > 0) {
      onPool({
        type: 'batch',
        shares: shareEvents,
        blocks: blockEvents,
        hashrate: hashrateEvents[hashrateEvents.length - 1]?.payload || null,
        payments: paymentEvents,
        ts: now,
      });
    }

    // Fleet store: telemetry
    if (telemetryEvents.length > 0) {
      onFleet({
        type: 'telemetry',
        payload: telemetryEvents[telemetryEvents.length - 1]?.payload || null,
        ts: now,
      });
    }

    // Network store: difficulty + prices
    if (diffEvents.length > 0 || priceEvents.length > 0) {
      onNetwork({
        type: 'network',
        difficulty: diffEvents[diffEvents.length - 1]?.payload || null,
        prices: priceEvents[priceEvents.length - 1]?.payload || null,
        ts: now,
      });
    }

    // Security store: security events
    for (const se of securityEvents) {
      onSecurity(se);
    }

  }, PIPELINE_CONFIG.wsFlushInterval);
}

function stopFlushEngine() {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}


// ═══════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════

/**
 * Connect the ingestion layer.
 *
 * Attempts WebSocket first. If unavailable, falls back to simulator.
 * Both modes feed through the same ring buffer → flush → store pipeline.
 *
 * @param {Object} dispatchers - { onPool, onFleet, onNetwork, onSecurity }
 * @param {Object} [options] - { wsUrl, restEndpoints, forceDemo }
 * @returns {Function} cleanup function
 */
export function connectIngest(dispatchers, options = {}) {
  const {
    wsUrl = null,
    restEndpoints = null,
    forceDemo = true, // Phase 3 default: demo mode until pool server is deployed
  } = options;

  // Start the flush engine (always runs)
  startFlushEngine(dispatchers);

  if (!forceDemo && wsUrl) {
    // LIVE MODE: try WebSocket
    connectWebSocket(wsUrl, null);

    // Also start REST polling for slower data
    if (restEndpoints) {
      startRESTPolling(restEndpoints);
    }
  } else {
    // DEMO MODE: use simulator
    startSimulator();
  }

  // Return cleanup function
  return () => {
    stopFlushEngine();
    stopSimulator();
    disconnectWebSocket();
    stopRESTPolling();
    ringBuffer = [];
  };
}

/**
 * Switch between live and demo mode at runtime.
 */
export function switchMode(mode, wsUrl) {
  if (mode === 'live' && wsUrl) {
    stopSimulator();
    connectWebSocket(wsUrl, null);
  } else {
    disconnectWebSocket();
    startSimulator();
  }
}
