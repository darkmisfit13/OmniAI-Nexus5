import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type OrbPhase = 
  | 'idle' 
  | 'thinking'
  | 'observing' 
  | 'analyzing' 
  | 'suggesting' 
  | 'typing' 
  | 'auto' 
  | 'talking' 
  | 'texting'
  | 'listening'
  | 'processing'
  | 'directAction';

export interface HoloOrbProps {
  phase?: OrbPhase;
  status?: OrbPhase; // Alias support for status === 'idle' | 'thinking' | 'talking'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero' | '220' | 'chat220' | string;
  className?: string;
  onClick?: () => void;
  showStatusLabel?: boolean;
}

// Raw 3D Perlin Noise GLSL
const noiseGLSL = /* glsl */ `
vec3 hash3(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise3(vec3 p) {
  vec3 i = floor(p), f = fract(p), u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(
      mix(dot(hash3(i), f), dot(hash3(i + vec3(1, 0, 0)), f - vec3(1, 0, 0)), u.x),
      mix(dot(hash3(i + vec3(0, 1, 0)), f - vec3(0, 1, 0)), dot(hash3(i + vec3(1, 1, 0)), f - vec3(1, 1, 0)), u.x),
      u.y
    ),
    mix(
      mix(dot(hash3(i + vec3(0, 0, 1)), f - vec3(0, 0, 1)), dot(hash3(i + vec3(1, 0, 1)), f - vec3(1, 0, 1)), u.x),
      mix(dot(hash3(i + vec3(0, 1, 1)), f - vec3(0, 1, 1)), dot(hash3(i + vec3(1, 1, 1)), f - vec3(1, 1, 1)), u.x),
      u.y
    ),
    u.z
  );
}

float fbm(vec3 p) {
  return noise3(p) * 0.57 + noise3(p * 2.03 + 3.1) * 0.28 + noise3(p * 4.07 + 7.4) * 0.15;
}
`;

const vertexShader = /* glsl */ `
uniform float uTime, uTurbulence, uPulse, uHover, uWaveMorph;
uniform vec2 uPointer;
varying vec3 vPosition, vNormal, vView;
${noiseGLSL}

void main() {
  vec3 n = normalize(position);
  float flow = fbm(n * 3.6 + vec3(uTime * 0.18, -uTime * 0.22, uTime * 0.11));
  vec3 pull = vec3(uPointer * 0.85, 0.8);
  float attraction = exp(-length(n.xy - uPointer * 0.75) * 3.2) * uHover;
  
  // Audio wave displacement mapping when talking: dynamically morphs shell with speech harmonics
  float audioWave = sin(n.y * 14.0 + uTime * 8.5) * cos(n.x * 12.0 + uTime * 6.2) * uWaveMorph * 0.16;
  float pScale = 1.0 + flow * uTurbulence * 0.32 + sin(uTime * uPulse) * 0.035 + audioWave;

  vec3 p = position * pScale;
  p += pull * attraction * 0.2;
  p.xy += vec2(-n.y, n.x) * flow * uHover * 0.14;
  vPosition = p;
  vNormal = normalize(normalMatrix * n);
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  vView = -view.xyz;
  gl_Position = projectionMatrix * view;
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime, uTurbulence, uPulse, uHover, uMagentaShift;
uniform vec2 uPointer;
uniform vec3 uCrimsonCore, uDeepRuby, uDeepMagenta, uSparkleWhite;
varying vec3 vPosition, vNormal, vView;
${noiseGLSL}

void main() {
  vec3 p = normalize(vPosition);
  vec3 q = p * 3.2 + vec3(uTime * 0.14, -uTime * 0.2, uTime * 0.1);
  q.xy += uPointer * uHover * 0.35;
  float n = fbm(q + fbm(q + 2.8) * (1.5 + uTurbulence));
  float ribbon = pow(1.0 - abs(sin(p.y * 11.0 + p.x * 3.2 + n * 8.5 - uTime * 0.8)), 10.0);
  float fine = pow(1.0 - abs(sin(p.y * 24.0 - n * 14.0 + uTime * 0.45)), 22.0);
  float facing = max(dot(normalize(vNormal), normalize(vView)), 0.0);
  float rim = pow(1.0 - facing, 2.6);
  float core = pow(facing, 6.8) * (0.45 + 0.15 * sin(uTime * uPulse));
  float tint = clamp(n * 2.3 + p.x * 0.5 + 0.5, 0.0, 1.0);

  // Dynamic Shift towards Deep Magenta (#ff007f) when in thinking state
  vec3 targetCore = mix(uCrimsonCore, uDeepMagenta, uMagentaShift);
  vec3 targetRuby = mix(uDeepRuby, vec3(0.5, 0.02, 0.35), uMagentaShift);

  vec3 energy = mix(targetRuby, targetCore, tint);
  energy = mix(energy, uSparkleWhite, smoothstep(0.75, 0.98, p.x + n) * 0.45);

  vec3 col = energy * (0.16 + ribbon * 2.4 + fine * 0.7 + rim * 1.35);
  col += targetCore * core * 1.8 + mix(targetCore, targetRuby, 0.45) * pow(facing, 18.0) * 0.85;

  gl_FragColor = vec4(col, 0.88 + ribbon * 0.12);
}
`;

const particleVertex = /* glsl */ `
uniform float uTime, uPulse, uRingTightness;
attribute float aSeed;
varying float vSeed;

void main() {
  vSeed = aSeed;
  vec3 p = position;
  
  // In thinking mode: compress sparkles into a tight high-velocity spinning sparkle ring
  float spinSpeed = mix(0.25 + aSeed * 0.35, 4.2 + aSeed * 1.5, uRingTightness);
  float angle = uTime * spinSpeed;
  float c = cos(angle), s = sin(angle);
  p.xz = mat2(c, -s, s, c) * p.xz;

  // Modulate radius: when uRingTightness is high, sparkles collapse into orbital equator ring
  float ringRadius = mix(1.0, 0.72 + sin(aSeed * 6.28) * 0.08, uRingTightness);
  p.xz *= ringRadius;
  p.y = mix(p.y, sin(angle * 2.0 + aSeed * 3.14) * 0.18, uRingTightness * 0.85);

  p *= 1.0 + sin(uTime * uPulse + aSeed * 6.28) * 0.06;
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = mix(2.0 + aSeed * 2.6, 3.2 + aSeed * 3.0, uRingTightness) * (3.8 / -view.z);
}
`;

const particleFragment = /* glsl */ `
uniform vec3 uCrimsonCore, uDeepMagenta, uSparkleWhite;
uniform float uMagentaShift;
varying float vSeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  vec3 baseColor = mix(uCrimsonCore, uDeepMagenta, uMagentaShift);
  vec3 c = mix(baseColor, uSparkleWhite, vSeed);
  gl_FragColor = vec4(c, (1.0 - smoothstep(0.04, 0.5, d)) * 0.95);
}
`;

export const HoloOrb: React.FC<HoloOrbProps> = ({
  phase,
  status,
  size = 'md',
  className = '',
  onClick,
  showStatusLabel = false,
}) => {
  const activePhase = (status || phase || 'idle') as OrbPhase;
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  const sizeStyles: Record<string, string> = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-20 h-20',
    hero: 'w-60 h-60 sm:w-72 sm:h-72',
    '220': 'w-[220px] h-[220px]',
    chat220: 'w-[220px] h-[220px]',
  };

  const resolvedSizeClass = className.includes('w-') && className.includes('h-') 
    ? '' 
    : (sizeStyles[size] || 'w-11 h-11');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.z = 4.2;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const width = container.clientWidth || 44;
      const height = container.clientHeight || 44;
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      // Massive luminescent Deep Crimson Red Orb palette:
      // Crimson (#e11d48 / #dc2626), Deep Ruby (#881337 / #500724), Deep Magenta (#ff007f), Sparkles (#ffffff)
      const uCrimsonCore = new THREE.Color('#dc2626');
      const uDeepRuby = new THREE.Color('#7f1d1d');
      const uDeepMagenta = new THREE.Color('#ff007f');
      const uSparkleWhite = new THREE.Color('#ffffff');

      const uniforms = {
        uTime: { value: 0 },
        uTurbulence: { value: 0.16 },
        uPulse: { value: 1.0 },
        uHover: { value: 0 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uCrimsonCore: { value: uCrimsonCore },
        uDeepRuby: { value: uDeepRuby },
        uDeepMagenta: { value: uDeepMagenta },
        uSparkleWhite: { value: uSparkleWhite },
        uMagentaShift: { value: 0.0 },
        uRingTightness: { value: 0.0 },
        uWaveMorph: { value: 0.0 },
      };

      const geometry = new THREE.SphereGeometry(1, 48, 36);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
      });
      const orbMesh = new THREE.Mesh(geometry, material);

      const particleCount = 580;
      const positions = new Float32Array(particleCount * 3);
      const seeds = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        const y = 1 - 2 * (i + 0.5) / particleCount;
        const radius = Math.sqrt(1 - y * y);
        const angle = i * 2.3999632;
        const shell = 1.08 + 0.22 * (0.5 + 0.5 * Math.sin(i * 18.31));
        positions[i * 3] = Math.cos(angle) * radius * shell;
        positions[i * 3 + 1] = y * shell;
        positions[i * 3 + 2] = Math.sin(angle) * radius * shell;
        seeds[i] = (i * 0.6180339) % 1;
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

      const particleMat = new THREE.ShaderMaterial({
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const particleMesh = new THREE.Points(particleGeo, particleMat);

      const group = new THREE.Group();
      group.add(orbMesh);
      group.add(particleMesh);
      scene.add(group);

      const targetPointer = new THREE.Vector2(0, 0);
      const currentPointer = new THREE.Vector2(0, 0);
      let targetHover = 0;
      let currentHover = 0;

      const handlePointerMove = (e: MouseEvent | TouchEvent) => {
        const rect = container.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        targetPointer.x = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
        targetPointer.y = -(((clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
        targetHover = 1.7;
      };

      const handlePointerLeave = () => {
        targetPointer.set(0, 0);
        targetHover = 0;
      };

      container.addEventListener('mousemove', handlePointerMove);
      container.addEventListener('mouseleave', handlePointerLeave);
      container.addEventListener('touchmove', handlePointerMove);
      container.addEventListener('touchend', handlePointerLeave);

      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.1);

        let speedMultiplier = 1.0;
        let targetTurbulence = 0.16;
        let targetPulse = 1.0;
        let targetMagentaShift = 0.0;
        let targetRingTightness = 0.0;
        let targetWaveMorph = 0.0;

        // Specific status hooks per specification:
        // 1. status === 'idle' -> Slow radial gradient breathing pulse with floating sparkles
        // 2. status === 'thinking' -> Tight, high-velocity spinning sparkle ring, shifting toward deep magenta
        // 3. status === 'talking' -> Audio wave displacement mapping that morphs the crimson orb shell dynamically in sync with the speech stream
        if (activePhase === 'idle') {
          speedMultiplier = 0.45;
          targetTurbulence = 0.08;
          targetPulse = 0.75;
          targetMagentaShift = 0.0;
          targetRingTightness = 0.0;
          targetWaveMorph = 0.0;
        } else if (activePhase === 'thinking' || activePhase === 'analyzing' || activePhase === 'processing') {
          speedMultiplier = 3.8;
          targetTurbulence = 0.75;
          targetPulse = 4.5;
          targetMagentaShift = 1.0; // Shifting toward deep magenta (#ff007f)
          targetRingTightness = 1.0; // Tight high-velocity spinning sparkle ring
          targetWaveMorph = 0.2;
        } else if (activePhase === 'talking') {
          speedMultiplier = 2.6;
          targetTurbulence = 0.55;
          targetPulse = 6.8;
          targetMagentaShift = 0.3;
          targetRingTightness = 0.25;
          targetWaveMorph = 1.0; // Audio wave displacement mapping morphs shell dynamically
        } else if (activePhase === 'listening') {
          speedMultiplier = 2.2;
          targetTurbulence = 0.4;
          targetPulse = 3.6;
          targetMagentaShift = 0.4;
          targetRingTightness = 0.3;
          targetWaveMorph = 0.5;
        } else if (activePhase === 'auto' || activePhase === 'directAction') {
          speedMultiplier = 3.6;
          targetTurbulence = 0.7;
          targetPulse = 4.8;
          targetMagentaShift = 0.8;
          targetRingTightness = 0.8;
          targetWaveMorph = 0.4;
        } else {
          speedMultiplier = 1.2;
          targetTurbulence = 0.22;
          targetPulse = 1.8;
        }

        uniforms.uTime.value += delta * speedMultiplier;
        uniforms.uTurbulence.value += (targetTurbulence - uniforms.uTurbulence.value) * 0.12;
        uniforms.uPulse.value += (targetPulse - uniforms.uPulse.value) * 0.12;
        uniforms.uMagentaShift.value += (targetMagentaShift - uniforms.uMagentaShift.value) * 0.12;
        uniforms.uRingTightness.value += (targetRingTightness - uniforms.uRingTightness.value) * 0.12;
        uniforms.uWaveMorph.value += (targetWaveMorph - uniforms.uWaveMorph.value) * 0.15;

        currentPointer.lerp(targetPointer, 0.12);
        currentHover += (targetHover - currentHover) * 0.12;
        uniforms.uPointer.value.copy(currentPointer);
        uniforms.uHover.value = currentHover;

        group.rotation.y += delta * (0.45 + targetRingTightness * 1.8) * speedMultiplier;
        group.rotation.x += delta * 0.18;

        renderer?.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 44;
        const h = container.clientHeight || 44;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mousemove', handlePointerMove);
        container.removeEventListener('mouseleave', handlePointerLeave);
        container.removeEventListener('touchmove', handlePointerMove);
        container.removeEventListener('touchend', handlePointerLeave);
        if (renderer?.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        geometry.dispose();
        material.dispose();
        particleGeo.dispose();
        particleMat.dispose();
        renderer?.dispose();
      };
    } catch (err) {
      console.warn('ThreeJS WebGL context init notice:', err);
      setHasWebGL(false);
    }
  }, [activePhase]);

  const getStatusLabel = () => {
    switch (phase) {
      case 'talking':
        return 'OmniVoice Speaking';
      case 'texting':
      case 'typing':
        return 'Texting Stream';
      case 'thinking':
      case 'analyzing':
      case 'processing':
        return 'Omni Thinking';
      case 'listening':
        return 'Omni Listening';
      case 'auto':
      case 'directAction':
        return 'Auto-Pilot Active';
      case 'observing':
        return 'Scanning Viewport';
      case 'suggesting':
        return 'Suggestions Ready';
      case 'idle':
      default:
        return 'Omni Core Idle';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer ${resolvedSizeClass} ${className}`}
      title={`OmniAI Orb — ${getStatusLabel()}`}
    >
      {/* Matte black foundation with Deep Crimson & Ruby pulsing box-shadow halo */}
      <div 
        className="absolute inset-0 rounded-full bg-[#000000] shadow-[0_0_16px_rgba(220,38,38,0.35),0_0_24px_rgba(127,29,29,0.3),inset_0_0_10px_rgba(220,38,38,0.25)] transition-all duration-500 border border-red-600/40"
      />

      {/* 3D WebGL Canvas */}
      {hasWebGL ? (
        <div ref={containerRef} className="w-full h-full relative z-10 rounded-full overflow-hidden" />
      ) : (
        <div className="w-full h-full rounded-full bg-[#000000] border border-red-600/60 flex items-center justify-center relative z-10">
          <div className="w-2/3 h-2/3 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-red-500 animate-pulse" />
        </div>
      )}

      {/* Active Phase Ping Badge */}
      {(phase === 'analyzing' || phase === 'processing') && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-85" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
        </span>
      )}

      {showStatusLabel && (
        <span className="absolute -bottom-5 text-[10px] text-red-400 font-mono tracking-wider whitespace-nowrap drop-shadow-[0_0_6px_rgba(220,38,38,0.6)]">
          {getStatusLabel()}
        </span>
      )}
    </div>
  );
};
