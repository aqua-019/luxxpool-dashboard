import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { TOKENS } from '@shared/tokens';
import { useViewport } from '@shared/hooks/useViewport';
import { usePerformance } from '@shared/hooks/usePerformance';
import { ACTIVE_COINS, PIPELINE_CONFIG } from '@shared/utils/constants';

import StatsPage from './pages/StatsPage';
import ConnectPage from './pages/ConnectPage';
import FAQPage from './pages/FAQPage';
import PublicHeader from './components/PublicHeader';

const PoolScene = lazy(() => import('@shared/three/PoolScene'));

const TABS = [
  { id: 'stats', label: 'Pool Stats' },
  { id: 'connect', label: 'Connect' },
  { id: 'faq', label: 'FAQ' },
];

// Demo data for development — will be replaced by WebSocket in production
function useDemoData() {
  const [data, setData] = useState({
    hashrate: 325e9,
    miners: 22,
    workers: 26,
    difficulty: 33.94e6,
    netHashrate: 856.2e12,
    poolShare: 0.038,
    fee: 2,
    blockReward: 6.25,
    uptime: 1234567,
    ltcPrice: 90,
    dogePrice: 0.17,
    hrHistory: Array.from({ length: 48 }, (_, i) => 310e9 + Math.sin(i * 0.3) * 15e9 + Math.random() * 5e9),
    blocks: [
      { coin: 'LTC', height: 2847261, reward: '6.25 LTC', age: 15, worker: 'L9_07', confirmations: 0 },
      { coin: 'DOGE', height: 5482910, reward: '10,000 DOGE', age: 68, worker: 'L9_03', confirmations: 12 },
      { coin: 'BELLS', height: 892014, reward: '50 BELLS', age: 340, worker: 'L9_11', confirmations: 48 },
      { coin: 'LTC', height: 2847249, reward: '6.25 LTC', age: 1200, worker: 'L9_01', confirmations: 120 },
      { coin: 'DOGE', height: 5482880, reward: '10,000 DOGE', age: 1800, worker: 'L9_15', confirmations: 200 },
      { coin: 'LKY', height: 1204831, reward: '88 LKY', age: 3600, worker: 'L9_09', confirmations: 500 },
      { coin: 'LTC', height: 2847230, reward: '6.25 LTC', age: 5400, worker: 'L9_02', confirmations: 1000 },
      { coin: 'SHIC', height: 403291, reward: '125 SHIC', age: 7200, worker: 'L9_18', confirmations: 800 },
      { coin: 'DOGE', height: 5482790, reward: '10,000 DOGE', age: 9000, worker: 'L9_06', confirmations: 1500 },
      { coin: 'PEP', height: 654320, reward: '500 PEP', age: 12000, worker: 'L9_14', confirmations: 2000 },
    ],
    freshBlock: false,
    lockdownLevel: 0,
    coins: ACTIVE_COINS,
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        hashrate: prev.hashrate + (Math.random() - 0.5) * 5e9,
        hrHistory: [...prev.hrHistory.slice(1), prev.hashrate + (Math.random() - 0.5) * 10e9],
        blocks: prev.blocks.map(b => ({ ...b, age: b.age + 10 })),
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return data;
}

export default function App() {
  const [tab, setTab] = useState('stats');
  const viewport = useViewport();
  const perf = usePerformance();
  const data = useDemoData();

  return (
    <div style={{
      minHeight: '100vh',
      background: TOKENS.surface.base,
      fontFamily: TOKENS.fonts.body,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* R3F ambient scene */}
      {perf.can3D && (
        <Suspense fallback={null}>
          <PoolScene
            shareRate={data.miners}
            freshBlock={data.freshBlock}
            color={TOKENS.brand.primary}
          />
        </Suspense>
      )}

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 1200,
        margin: '0 auto',
        padding: viewport.mobile ? '0 12px' : '0 32px',
      }}>
        <PublicHeader
          tabs={TABS}
          activeTab={tab}
          onTabChange={setTab}
          mobile={viewport.mobile}
        />

        <main style={{ paddingBottom: 64 }}>
          {tab === 'stats' && <StatsPage data={data} viewport={viewport} />}
          {tab === 'connect' && <ConnectPage mobile={viewport.mobile} />}
          {tab === 'faq' && <FAQPage mobile={viewport.mobile} />}
        </main>
      </div>
    </div>
  );
}
