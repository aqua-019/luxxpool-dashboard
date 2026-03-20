import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Share Particles
// Ambient particle system representing share submissions
// Share rate → particle velocity, block found → burst effect
// ═══════════════════════════════════════════════════════════

const PARTICLE_COUNT = 200;

function Particles({ shareRate = 1800, freshBlock = false, color = '#5b9bf0' }) {
  const pointsRef = useRef();
  const burstRef = useRef(0);

  const { positions, velocities, lifetimes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const life = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      vel[i * 3]     = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = 0.005 + Math.random() * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
      life[i] = Math.random();
    }
    return { positions: pos, velocities: vel, lifetimes: life };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position;
    const speed = 0.5 + (shareRate / 3000) * 1.5;

    // Burst on block found
    if (freshBlock && burstRef.current < 1) {
      burstRef.current = Math.min(1, burstRef.current + delta * 3);
    } else if (!freshBlock) {
      burstRef.current = Math.max(0, burstRef.current - delta * 0.5);
    }
    const burst = burstRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      lifetimes[i] += delta * speed * (0.3 + burst * 2);

      if (lifetimes[i] > 1) {
        // Respawn
        pos.array[i * 3]     = (Math.random() - 0.5) * 4;
        pos.array[i * 3 + 1] = -1.5;
        pos.array[i * 3 + 2] = (Math.random() - 0.5) * 2;
        lifetimes[i] = 0;

        // Randomize velocity
        velocities[i * 3]     = (Math.random() - 0.5) * (0.01 + burst * 0.05);
        velocities[i * 3 + 1] = 0.005 + Math.random() * (0.015 + burst * 0.04);
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
      }

      pos.array[i * 3]     += velocities[i * 3] * speed;
      pos.array[i * 3 + 1] += velocities[i * 3 + 1] * speed;
      pos.array[i * 3 + 2] += velocities[i * 3 + 2] * speed;
    }
    pos.needsUpdate = true;
  });

  const particleColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={particleColor}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ShareParticles({ shareRate = 1800, freshBlock = false, color, style }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1,
      pointerEvents: 'none', opacity: 0.8,
      ...style,
    }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <Particles shareRate={shareRate} freshBlock={freshBlock} color={color || '#5b9bf0'} />
      </Canvas>
    </div>
  );
}
