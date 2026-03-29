import { useState, useEffect, Suspense, lazy } from 'react';
import { TOKENS } from '@shared/tokens';
import { useViewport } from '@shared/hooks/useViewport';
import { usePerformance } from '@shared/hooks/usePerformance';
import { LockdownBanner } from '@shared/components';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import MinerHeader from './components/MinerHeader';

const MinerScene = lazy(() => import('@shared/three/MinerScene'));

// Demo miner data — will be replaced by API/WebSocket in production
function useDemoMinerData(address) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!address) { setData(null); return; }

    // Simulate API fetch
    const minerData = {
      address,
      hashrate: 325e9,
      reportedHashrate: 335e9,
      workersOnline: 18,
      workersTotal: 20,
      pendingBalance: 2.1061,
      totalPaid: 48.62,
      totalShares: 1847293,
      lastShare: 12,
      hrHistory: Array.from({ length: 48 }, (_, i) => 310e9 + Math.sin(i * 0.3) * 15e9 + Math.random() * 5e9),
      workers: Array.from({ length: 20 }, (_, i) => ({
        name: `L9_${String(i + 1).padStart(2, '0')}`,
        hashrate: i < 18 ? (15.5e9 + Math.random() * 2e9) : 0,
        difficulty: i < 18 ? (2 + Math.random() * 6).toFixed(1) : '—',
        status: i < 18 ? 'online' : i < 19 ? 'offline' : 'dead',
        lastShare: i < 18 ? Math.floor(Math.random() * 60) : 900 + Math.floor(Math.random() * 3600),
        temp: i < 18 ? 58 + Math.floor(Math.random() * 17) : 0,
        power: i < 18 ? 3200 + Math.floor(Math.random() * 100) : 0,
      })),
      pendingByCoins: [
        { coin: 'LTC', amount: 2.1061 },
        { coin: 'DOGE', amount: 3654.3 },
        { coin: 'BELLS', amount: 12.5 },
        { coin: 'LKY', amount: 88.2 },
        { coin: 'PEP', amount: 432.1 },
        { coin: 'DINGO', amount: 156.7 },
        { coin: 'SHIC', amount: 94.3 },
      ],
      payments: Array.from({ length: 12 }, (_, i) => ({
        coin: ['LTC', 'DOGE', 'LTC', 'BELLS', 'LTC', 'DOGE', 'LKY', 'LTC', 'DOGE', 'PEP', 'LTC', 'SHIC'][i],
        amount: [0.0847, 1500, 0.0923, 12.5, 0.0756, 1200, 44.1, 0.0681, 980, 216, 0.0912, 47.2][i],
        txid: `${Math.random().toString(36).slice(2, 10)}...${Math.random().toString(36).slice(2, 6)}`,
        age: (i + 1) * 3600 * 4 + Math.floor(Math.random() * 3600),
      })),
      freshBlock: false,
      lockdownLevel: 0,
    };
    setData(minerData);
  }, [address]);

  // Simulate live updates when connected
  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          hashrate: prev.hashrate + (Math.random() - 0.5) * 5e9,
          hrHistory: [...prev.hrHistory.slice(1), prev.hashrate + (Math.random() - 0.5) * 10e9],
          lastShare: Math.floor(Math.random() * 30),
        };
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [!!data]);

  return data;
}

export default function App() {
  const [address, setAddress] = useState('');
  const viewport = useViewport();
  const perf = usePerformance();
  const data = useDemoMinerData(address);

  const handleLogin = (addr) => setAddress(addr);
  const handleLogout = () => setAddress('');

  return (
    <div style={{
      minHeight: '100vh',
      background: TOKENS.surface.base,
      fontFamily: TOKENS.fonts.body,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* R3F miner scene */}
      {perf.can3D && address && data && (
        <Suspense fallback={null}>
          <MinerScene
            hashrate={data.hashrate}
            workers={data.workersOnline}
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
        <MinerHeader
          address={address}
          onLogout={handleLogout}
          mobile={viewport.mobile}
        />

        {/* Lockdown banner */}
        {data?.lockdownLevel > 0 && (
          <div style={{ marginBottom: 12 }}>
            <LockdownBanner level={data.lockdownLevel} />
          </div>
        )}

        <main style={{ paddingBottom: 64 }}>
          {!address ? (
            <AuthPage onLogin={handleLogin} mobile={viewport.mobile} />
          ) : data ? (
            <DashboardPage data={data} viewport={viewport} />
          ) : (
            <div style={{
              textAlign: 'center',
              padding: 48,
              color: TOKENS.text.secondary,
              fontSize: 14,
            }}>Loading miner data...</div>
          )}
        </main>
      </div>
    </div>
  );
}
