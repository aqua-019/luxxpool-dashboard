import { lazy } from 'react';

// Lazy-load all 3D components for code splitting
// These chunks only load when the render tier is high+ and the component is visible
export const ShaderBackground = lazy(() => import('./ShaderBackground'));
export const ShareParticles = lazy(() => import('./ShareParticles'));
export const NetworkGraph = lazy(() => import('./NetworkGraph'));
