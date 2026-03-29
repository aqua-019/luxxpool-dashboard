import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Shader Background
// Generative background driven by pool metrics
// Urgency → color intensity, hashrate → wave speed
// ═══════════════════════════════════════════════════════════

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uUrgency;
  uniform float uHashrate;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uAccent;
  varying vec2 vUv;

  // Simplex-style noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    float speed = 0.15 + uHashrate * 0.3;
    float n1 = snoise(vUv * 2.0 + uTime * speed * 0.3) * 0.5 + 0.5;
    float n2 = snoise(vUv * 3.5 - uTime * speed * 0.2 + 10.0) * 0.5 + 0.5;
    float n3 = snoise(vUv * 1.2 + uTime * speed * 0.15 + 20.0) * 0.5 + 0.5;

    vec3 base = mix(uColor1, uColor2, n1 * 0.6 + vUv.y * 0.4);
    vec3 glow = uAccent * n2 * n3 * (0.08 + uUrgency * 0.12);
    vec3 color = base + glow;

    // Vignette
    float vignette = 1.0 - length((vUv - 0.5) * 1.4);
    vignette = smoothstep(0.0, 0.7, vignette);
    color *= vignette * 0.85 + 0.15;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderPlane({ urgency = 0, hashrate = 0.5, colors }) {
  const meshRef = useRef();
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uUrgency: { value: urgency },
    uHashrate: { value: hashrate },
    uColor1: { value: new THREE.Color(colors?.bg || '#070e28') },
    uColor2: { value: new THREE.Color(colors?.card || '#0c1845') },
    uAccent: { value: new THREE.Color(colors?.a1 || '#5b9bf0') },
  });

  useFrame((_, delta) => {
    const u = uniformsRef.current;
    u.uTime.value += delta;
    u.uUrgency.value += (urgency - u.uUrgency.value) * 0.05;
    u.uHashrate.value += (hashrate - u.uHashrate.value) * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniformsRef.current}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function ShaderBackground({ urgency = 0, hashrate = 0.5, colors, style }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0,
      pointerEvents: 'none', opacity: 0.6,
      ...style,
    }}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <ShaderPlane urgency={urgency} hashrate={hashrate} colors={colors} />
      </Canvas>
    </div>
  );
}
