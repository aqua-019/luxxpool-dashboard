import { memo, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 150;

function Particles({ shareRate = 1, freshBlock = false, color = '#4a9eff' }) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);

  const velocities = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.005;
      arr[i * 3 + 1] = Math.random() * 0.003 + 0.001;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const pos = mesh.current.geometry.attributes.position.array;
    const speed = 0.3 + shareRate * 0.1;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      pos[idx] += velocities[idx] * speed;
      pos[idx + 1] += velocities[idx + 1] * speed;
      pos[idx + 2] += velocities[idx + 2] * speed;
      if (pos[idx + 1] > 3.5) {
        pos[idx] = (Math.random() - 0.5) * 10;
        pos[idx + 1] = -3.5;
        pos[idx + 2] = (Math.random() - 0.5) * 4;
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={freshBlock ? 0.06 : 0.035}
        transparent
        opacity={freshBlock ? 0.8 : 0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function PoolScene({ shareRate, freshBlock, color, style }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity: 0.6,
      ...style,
    }}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'low-power', alpha: true }}
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Particles shareRate={shareRate} freshBlock={freshBlock} color={color} />
      </Canvas>
    </div>
  );
}

export default memo(PoolScene);
