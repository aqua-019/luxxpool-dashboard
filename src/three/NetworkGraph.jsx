import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Network Topology Graph
// 3D force-directed visualization of pool connections
// Central pool node + fleet miners (green) + public miners (blue)
// ═══════════════════════════════════════════════════════════

function Node({ position, color, size = 0.08, label, isPool }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isPool ? 0.5 : 0.2);
      const scale = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {isPool ? (
          <dodecahedronGeometry args={[size * 2, 0]} />
        ) : (
          <sphereGeometry args={[size, 8, 8]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Hover handled via pointer events, no 3D text needed */}
    </group>
  );
}

function Edge({ start, end, color = '#5b9bf0', opacity = 0.15 }) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ], [start, end]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

function Graph({ fleet = [], colors = {} }) {
  const groupRef = useRef();

  // Generate node positions in a sphere around center
  const nodes = useMemo(() => {
    const result = [
      { id: 'pool', pos: [0, 0, 0], color: '#fff', size: 0.12, label: 'LUXXPOOL', isPool: true },
    ];

    // Fleet miners — inner ring
    const fleetCount = Math.min(fleet.length || 20, 20);
    for (let i = 0; i < fleetCount; i++) {
      const angle = (i / fleetCount) * Math.PI * 2;
      const r = 0.8;
      const y = (Math.random() - 0.5) * 0.4;
      const m = fleet[i] || {};
      const status = m.status || 'online';
      const nodeColor = status === 'online' ? (colors.success || '#6ee7b7')
        : status === 'offline' ? (colors.warning || '#fbbf24')
        : (colors.danger || '#f87171');

      result.push({
        id: m.id || `fleet-${i}`,
        pos: [Math.cos(angle) * r, y, Math.sin(angle) * r],
        color: nodeColor,
        size: 0.06,
        label: m.id || `L9_${String(i + 1).padStart(2, '0')}`,
        isPool: false,
      });
    }

    // Public miners — outer ring
    const pubCount = 4;
    for (let i = 0; i < pubCount; i++) {
      const angle = (i / pubCount) * Math.PI * 2 + 0.3;
      const r = 1.3;
      result.push({
        id: `pub-${i}`,
        pos: [Math.cos(angle) * r, (Math.random() - 0.5) * 0.3, Math.sin(angle) * r],
        color: colors.a1 || '#5b9bf0',
        size: 0.05,
        label: `Public miner ${i + 1}`,
        isPool: false,
      });
    }

    return result;
  }, [fleet, colors]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Edges from pool to all miners */}
      {nodes.slice(1).map((node) => (
        <Edge
          key={`edge-${node.id}`}
          start={nodes[0].pos}
          end={node.pos}
          color={node.color}
          opacity={0.12}
        />
      ))}
      {/* Nodes */}
      {nodes.map((node) => (
        <Node key={node.id} {...node} position={node.pos} />
      ))}
    </group>
  );
}

export default function NetworkGraph({ fleet = [], colors = {}, style }) {
  return (
    <div style={{
      width: '100%', height: 300, borderRadius: 12,
      overflow: 'hidden', position: 'relative',
      ...style,
    }}>
      <Canvas
        camera={{ position: [0, 1.2, 2.2], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={0.8} color="#5b9bf0" />
        <pointLight position={[-2, -1, -2]} intensity={0.4} color="#818cf8" />
        <Graph fleet={fleet} colors={colors} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI * 0.7}
          minPolarAngle={Math.PI * 0.3}
        />
      </Canvas>
    </div>
  );
}
