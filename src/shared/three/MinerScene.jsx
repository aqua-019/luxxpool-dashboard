import { memo, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MAX_PARTICLES = 300;

function HashrateParticles({ hashrate = 0, workers = 1, freshBlock = false, color = '#4a9eff' }) {
  const mesh = useRef();
  const density = Math.min(MAX_PARTICLES, Math.max(50, Math.floor((hashrate / 1e9) * 2)));

  const positions = useMemo(() => {
    const arr = new Float32Array(MAX_PARTICLES * 3);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return arr;
  }, []);

  const velocities = useMemo(() => {
    const arr = new Float32Array(MAX_PARTICLES * 3);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const cluster = i % Math.max(1, workers);
      const cx = (cluster / Math.max(1, workers) - 0.5) * 6;
      arr[i * 3] = (Math.random() - 0.5) * 0.008;
      arr[i * 3 + 1] = Math.random() * 0.005 + 0.002;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }
    return arr;
  }, [workers]);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const pos = mesh.current.geometry.attributes.position.array;
    const speed = 0.5 + (hashrate / 1e12) * 0.5;
    for (let i = 0; i < density; i++) {
      const idx = i * 3;
      pos[idx] += velocities[idx] * speed;
      pos[idx + 1] += velocities[idx + 1] * speed;
      pos[idx + 2] += velocities[idx + 2] * speed;
      if (pos[idx + 1] > 3) {
        pos[idx] = (Math.random() - 0.5) * 8;
        pos[idx + 1] = -3;
        pos[idx + 2] = (Math.random() - 0.5) * 3;
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.geometry.setDrawRange(0, density);
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={MAX_PARTICLES} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={freshBlock ? 0.08 : 0.04}
        transparent
        opacity={freshBlock ? 0.9 : 0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function MinerScene({ hashrate, workers, freshBlock, color, style }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity: 0.5,
      ...style,
    }}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'low-power', alpha: true }}
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <HashrateParticles
          hashrate={hashrate}
          workers={workers}
          freshBlock={freshBlock}
          color={color}
        />
      </Canvas>
    </div>
  );
}

export default memo(MinerScene);
