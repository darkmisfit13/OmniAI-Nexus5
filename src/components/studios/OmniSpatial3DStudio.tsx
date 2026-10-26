import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Rotate3d, 
  Sparkles, 
  Wand2, 
  Download, 
  Sliders, 
  Sun, 
  Layers, 
  Box, 
  FolderLock, 
  Check, 
  RefreshCw,
  Eye,
  Zap,
  Cpu
} from 'lucide-react';

export type MeshStyle = 'quad' | 'triangular' | 'pointcloud';
export type LightingPreset = 'studio_white' | 'cinematic_neon' | 'moody_cyberpunk';
export type DetailPreset = 'carbon_fiber' | 'brushed_aluminum' | 'neon_trim' | 'matte_obsidian';

interface OmniSpatial3DStudioProps {
  onSaveToVault?: (asset: any) => void;
}

export const OmniSpatial3DStudio: React.FC<OmniSpatial3DStudioProps> = ({ onSaveToVault }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // ZONE 1: Live Spatial Viewport States
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('cinematic_neon');

  // ZONE 2: Model Constructor & Export Deck States
  const [meshStyle, setMeshStyle] = useState<MeshStyle>('quad');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // ZONE 3: Texture & Inpainting Deck States
  const [materialPrompt, setMaterialPrompt] = useState<string>('Iridescent Cyber Chrome with etched micro-circuits');
  const [pastMaterials, setPastMaterials] = useState<string[]>([
    'Iridescent Cyber Chrome',
    'Matte Damascus Steel',
    'Liquid Obsidian Glass',
    'Bioluminescent Nanoweave',
  ]);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);

  // 4 Structural Sliders: Metallic, Roughness, Opacity, Emission Glow
  const [metallic, setMetallic] = useState<number>(85); // 0-100%
  const [roughness, setRoughness] = useState<number>(20); // 0-100%
  const [opacity, setOpacity] = useState<number>(100); // 0-100%
  const [emissionGlow, setEmissionGlow] = useState<number>(45); // 0-100%

  // Detail Preset active state
  const [activeDetailPreset, setActiveDetailPreset] = useState<DetailPreset | null>('neon_trim');

  // Generation status & notification toast
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Object3D | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | THREE.PointsMaterial | null>(null);
  const lightKeyRef = useRef<THREE.PointLight | null>(null);
  const lightFillRef = useRef<THREE.PointLight | null>(null);
  const lightAmbientRef = useRef<THREE.AmbientLight | null>(null);

  const showNotification = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast(null);
    }, 3200);
  };

  // Three.js Initialization & Lifecycle
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 398;
    const height = container.clientHeight || 380;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0816);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    // 3. Renderer with antialiasing and high pixel ratio
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Clean container before appending
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    lightAmbientRef.current = ambientLight;

    const keyLight = new THREE.PointLight(0x00ffcc, 4.0, 50);
    keyLight.position.set(4, 4, 4);
    scene.add(keyLight);
    lightKeyRef.current = keyLight;

    const fillLight = new THREE.PointLight(0x6c63ff, 3.0, 50);
    fillLight.position.set(-4, -3, -3);
    scene.add(fillLight);
    lightFillRef.current = fillLight;

    // 5. Geometry Construction: Modern Spatial Torus Ring with Core Orb
    const group = new THREE.Group();

    // Main Geometry: Torus Knot / Complex Polyhedron
    const torusGeo = new THREE.TorusKnotGeometry(1.0, 0.32, 100, 24);
    
    // PBR Material
    const pbrMat = new THREE.MeshStandardMaterial({
      color: 0x131024,
      metalness: metallic / 100,
      roughness: roughness / 100,
      opacity: opacity / 100,
      transparent: opacity < 100,
      wireframe: isWireframe,
      emissive: new THREE.Color(0x00ffcc),
      emissiveIntensity: (emissionGlow / 100) * 0.9,
    });
    materialRef.current = pbrMat;

    let mainObject: THREE.Object3D;
    if (meshStyle === 'pointcloud') {
      const pointMat = new THREE.PointsMaterial({
        color: 0x00ffcc,
        size: 0.045,
        transparent: true,
        opacity: opacity / 100,
      });
      materialRef.current = pointMat;
      mainObject = new THREE.Points(torusGeo, pointMat);
    } else {
      mainObject = new THREE.Mesh(torusGeo, pbrMat);
    }

    group.add(mainObject);

    // Subtle Inner Levitating Gyro Ring
    const innerRingGeo = new THREE.TorusGeometry(0.55, 0.04, 16, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    group.add(innerRing);

    scene.add(group);
    meshRef.current = group;

    // 6. Interactive Touch & Mouse Drag to Orbit
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const handlePointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      prevMousePos = { x: clientX, y: clientY };
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!isDragging || !meshRef.current) return;
      const deltaX = clientX - prevMousePos.x;
      const deltaY = clientY - prevMousePos.y;
      meshRef.current.rotation.y += deltaX * 0.012;
      meshRef.current.rotation.x += deltaY * 0.012;
      prevMousePos = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => handlePointerDown(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 7. Animation Loop with continuous spinning
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (meshRef.current) {
        if (!isDragging) {
          meshRef.current.rotation.y += 0.008;
          meshRef.current.rotation.x += 0.003;
        }
        if (innerRing) {
          innerRing.rotation.z += 0.02;
          innerRing.rotation.x += 0.01;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler & Structural Layout Recalculation Loop
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth || 398;
      const h = mountRef.current.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    // Force structural layout recalculation script upon initialization to auto-fit viewport
    handleResize();
    const initTimer1 = setTimeout(handleResize, 50);
    const initTimer2 = setTimeout(handleResize, 250);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (container) {
      resizeObserver.observe(container);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(initTimer1);
      clearTimeout(initTimer2);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      if (container && domElement && container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [meshStyle]);

  // Update Dynamic Lighting Preset
  useEffect(() => {
    if (!lightKeyRef.current || !lightFillRef.current || !lightAmbientRef.current) return;

    if (lightingPreset === 'studio_white') {
      lightAmbientRef.current.color.setHex(0xffffff);
      lightAmbientRef.current.intensity = 0.6;
      lightKeyRef.current.color.setHex(0xffffff);
      lightKeyRef.current.intensity = 4.0;
      lightFillRef.current.color.setHex(0xe2e8f0);
      lightFillRef.current.intensity = 2.5;
    } else if (lightingPreset === 'cinematic_neon') {
      lightAmbientRef.current.color.setHex(0x131024);
      lightAmbientRef.current.intensity = 0.35;
      lightKeyRef.current.color.setHex(0x00ffcc);
      lightKeyRef.current.intensity = 4.5;
      lightFillRef.current.color.setHex(0x6c63ff);
      lightFillRef.current.intensity = 3.2;
    } else if (lightingPreset === 'moody_cyberpunk') {
      lightAmbientRef.current.color.setHex(0x0b0816);
      lightAmbientRef.current.intensity = 0.2;
      lightKeyRef.current.color.setHex(0x00ffcc);
      lightKeyRef.current.intensity = 5.2;
      lightFillRef.current.color.setHex(0xec4899);
      lightFillRef.current.intensity = 3.8;
    }
  }, [lightingPreset]);

  // Update Dynamic PBR Material Parameters (Metallic, Roughness, Opacity, Emission, Wireframe)
  useEffect(() => {
    if (!materialRef.current) return;

    if ('metalness' in materialRef.current) {
      materialRef.current.metalness = metallic / 100;
      materialRef.current.roughness = roughness / 100;
      materialRef.current.opacity = opacity / 100;
      materialRef.current.transparent = opacity < 100;
      materialRef.current.wireframe = isWireframe;
      materialRef.current.emissiveIntensity = (emissionGlow / 100) * 1.2;
      materialRef.current.needsUpdate = true;
    } else if ('size' in materialRef.current) {
      materialRef.current.opacity = opacity / 100;
      materialRef.current.needsUpdate = true;
    }
  }, [metallic, roughness, opacity, emissionGlow, isWireframe]);

  // Apply Detail Preset
  const handleApplyDetailPreset = (preset: DetailPreset) => {
    setActiveDetailPreset(preset);
    if (preset === 'carbon_fiber') {
      setMetallic(40);
      setRoughness(35);
      setOpacity(100);
      setEmissionGlow(15);
      setMaterialPrompt('Carbon Fiber composite with diagonal micro-weave');
    } else if (preset === 'brushed_aluminum') {
      setMetallic(95);
      setRoughness(12);
      setOpacity(100);
      setEmissionGlow(10);
      setMaterialPrompt('Brushed Aerospace Aluminum with linear specular highlights');
    } else if (preset === 'neon_trim') {
      setMetallic(75);
      setRoughness(18);
      setOpacity(100);
      setEmissionGlow(90);
      setMaterialPrompt('Cyan Neon Luminescent Trim with high energy bloom');
    } else if (preset === 'matte_obsidian') {
      setMetallic(15);
      setRoughness(85);
      setOpacity(100);
      setEmissionGlow(0);
      setMaterialPrompt('Matte Obsidian volcanic stone with light absorption');
    }
    showNotification(`⚡ Loaded [${preset.replace('_', ' ').toUpperCase()}] material parameters`);
  };

  // AI "Enhance Prompt" wand button
  const handleEnhancePrompt = () => {
    setIsEnhancingPrompt(true);
    setTimeout(() => {
      const enhancements = [
        'Anisotropic specular reflections, nanometer procedural displacement, raytraced ambient occlusion, 8K subsurface scattering.',
        'Sub-surface photonic emission, iridescent thin-film interference, micro-faceted roughness mapping, metallic foil sheen.',
        'Nocturnal high-contrast curvature map, volumetric Fresnel edge gradient, dual-coat clear lacquer finish.',
      ];
      const selected = enhancements[Math.floor(Math.random() * enhancements.length)];
      setMaterialPrompt((prev) => `${prev.trim()}. ${selected}`);
      setIsEnhancingPrompt(false);
      showNotification('✨ Material prompt enhanced with PBR procedural shader keywords!');
    }, 600);
  };

  // Export 3D Format File Simulation (.obj, .glTF, .usdz)
  const handleExportFormat = (format: '.obj' | '.glTF' | '.usdz') => {
    setIsExporting(true);

    // Create file compilation payload
    const activeName = materialPrompt.slice(0, 24).trim() || 'Spatial3D_Object';
    const timestamp = Date.now();
    const fileName = `${activeName.replace(/\s+/g, '_')}_model${format}`;

    let mimeType = 'text/plain';
    let fileContent = '';

    if (format === '.obj') {
      mimeType = 'text/plain';
      fileContent = `# Omnispacial 3D Studio Export - Wavefront OBJ\n# Material: ${materialPrompt}\no ${activeName}\nv -0.5 -0.5 0.5\nv 0.5 -0.5 0.5\nv 0.5 0.5 0.5\nv -0.5 0.5 0.5\nvn 0.0 0.0 1.0\nf 1//1 2//1 3//1 4//1\n`;
    } else if (format === '.glTF') {
      mimeType = 'application/json';
      fileContent = JSON.stringify({
        asset: { generator: 'Omnispacial 3D Studio v4.2', version: '2.0' },
        scene: 0,
        scenes: [{ nodes: [0] }],
        nodes: [{ name: activeName, mesh: 0 }],
        materials: [{
          name: 'Omni_PBR_Material',
          pbrMetallicRoughness: {
            baseColorFactor: [0.07, 0.06, 0.14, opacity / 100],
            metallicFactor: metallic / 100,
            roughnessFactor: roughness / 100,
          },
          emissiveFactor: [0.0, 1.0, 0.8],
        }],
      }, null, 2);
    } else {
      // .usdz
      mimeType = 'model/vnd.usdz+zip';
      fileContent = `#usda 1.0\ndef Xform "Root" {\n    def Mesh "Geometry" {\n        float3[] points = [(-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)]\n    }\n}`;
    }

    // Trigger local browser file download
    try {
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}

    // Save as asset to local vault
    const newAsset = {
      id: `3d_asset_${timestamp}`,
      title: `${activeName} (${format.toUpperCase()})`,
      type: '3d',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
      tags: ['Omnispacial 3D', format.toUpperCase(), meshStyle, 'PBR Material'],
      details: `Generated in Omnispacial 3D Studio with ${metallic}% Metallic, ${roughness}% Roughness, and ${emissionGlow}% Emission.`,
      createdAt: new Date().toISOString(),
    };

    if (onSaveToVault) {
      onSaveToVault(newAsset);
    }

    try {
      const existing = JSON.parse(localStorage.getItem('omni_vault_assets') || '[]');
      localStorage.setItem('omni_vault_assets', JSON.stringify([newAsset, ...existing]));
      window.dispatchEvent(new CustomEvent('omni_vault_updated', { detail: { asset: newAsset } }));
    } catch {}

    setTimeout(() => {
      setIsExporting(false);
      showNotification(`💾 Compiled & saved ${fileName} to local storage and Vault!`);
    }, 400);
  };

  // Execution: "Generate 3D Object"
  const handleGenerate3DObject = () => {
    setIsGenerating(true);

    if (meshRef.current) {
      // Rotation kick animation
      meshRef.current.rotation.x += Math.PI * 0.5;
      meshRef.current.rotation.y += Math.PI * 0.5;
    }

    // Add prompt to past materials list if unique
    if (materialPrompt.trim() && !pastMaterials.includes(materialPrompt.trim())) {
      setPastMaterials((prev) => [materialPrompt.trim(), ...prev.slice(0, 5)]);
    }

    setTimeout(() => {
      setIsGenerating(false);
      showNotification('🚀 3D Object Mesh recompiled with real-time procedural PBR shaders!');
    }, 1200);
  };

  return (
    <div className="w-full flex items-center justify-center p-0 sm:p-2 bg-black font-sans select-none overflow-hidden box-border">
      
      {/* ========================================================= */}
      {/* MOBILE VIEWPORT CONTAINER: Sit strictly beneath top header */}
      {/* ========================================================= */}
      <div 
        className="w-full max-w-[420px] h-full mx-auto overflow-hidden relative flex flex-col bg-[#000000] text-white border-x border-[#1a1630] box-border"
        style={{ boxSizing: 'border-box' }}
      >
        
        {/* ========================================================= */}
        {/* ABSOLUTE TOP SAFE-AREA BOUNDARY ANCHOR                     */}
        {/* Sits strictly beneath OmniAI header with safe-area padding */}
        {/* ========================================================= */}
        <div className="pt-[max(env(safe-area-inset-top,0px),2px)] bg-[#0b0816] border-b border-[#2a2254] shrink-0 z-30 box-border">
          <div className="h-10 px-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#131024] border border-[#00ffcc]/50 flex items-center justify-center text-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.3)]">
                <Rotate3d className="w-3.5 h-3.5 text-[#00ffcc]" />
              </div>
              <div>
                <h1 className="text-xs font-black tracking-wider text-white flex items-center gap-1.5 uppercase font-mono">
                  Omnispacial 3D Studio
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div className="px-2 py-0.5 rounded-full bg-[#131024] border border-[#00ffcc]/40 text-[9px] font-mono text-[#00ffcc] font-bold">
                WebGL 2.0 PBR
              </div>
            </div>
          </div>
        </div>

        {/* Floating Notification Banner */}
        {notificationToast && (
          <div className="absolute top-12 inset-x-3 z-40 p-2 rounded-lg bg-[#131024]/95 border border-[#00ffcc] text-[#00ffcc] text-[10.5px] font-mono shadow-[0_0_15px_rgba(0,255,204,0.4)] backdrop-blur-md animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0 animate-spin" />
            <span className="truncate">{notificationToast}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* ZONE 1: VERTICAL FOV SCALED 3D VIEWPORT CONTAINER         */}
        {/* Restricted bounds prevent overflowing upwards into notch  */}
        {/* ========================================================= */}
        <div 
          className="w-full h-[310px] xs:h-[340px] max-h-[44vh] min-h-[220px] relative bg-[#0b0816] overflow-hidden border-b border-[#2a2254] shrink-0 box-border"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Top-Left Corner: Compact [Wireframe Toggle Switch] styled in neon #00ffcc */}
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 bg-[#131024]/85 border border-zinc-800 rounded-lg p-1 backdrop-blur-md">
            <button
              onClick={() => setIsWireframe(!isWireframe)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[9.5px] font-mono font-bold transition-all active:scale-95 ${
                isWireframe 
                  ? 'bg-[#00ffcc] text-black shadow-[0_0_10px_rgba(0,255,204,0.6)]' 
                  : 'bg-[#0b0816] text-[#00ffcc] border border-[#00ffcc]/40 hover:bg-[#1a1630]'
              }`}
              title="Toggle 3D model between solid rendering and neon vector wireframe grid line mode"
            >
              <Cpu className="w-3 h-3 text-inherit" />
              <span>{isWireframe ? 'Wireframe: ON' : 'Wireframe'}</span>
            </button>
          </div>

          {/* Top-Right Corner: Small horizontal slider tracking Lighting Presets */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-[#131024]/85 border border-zinc-800 rounded-lg p-1 backdrop-blur-md">
            <Sun className="w-3 h-3 text-[#00ffcc] ml-1 shrink-0" />
            {(['studio_white', 'cinematic_neon', 'moody_cyberpunk'] as const).map((preset) => {
              const labels = {
                studio_white: 'White',
                cinematic_neon: 'Neon',
                moody_cyberpunk: 'Cyber',
              };
              const isSelected = lightingPreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => setLightingPreset(preset)}
                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono transition-all ${
                    isSelected
                      ? 'bg-[#00ffcc] text-black font-bold shadow-[0_0_8px_rgba(0,255,204,0.5)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title={`Lighting Preset: ${labels[preset]}`}
                >
                  {labels[preset]}
                </button>
              );
            })}
          </div>

          {/* Center Viewport: Responsive WebGL canvas holding placeholder spinning 3D mesh model */}
          <div 
            ref={mountRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
          />

          {/* Spatial Interaction HUD Overlay Info */}
          <div className="absolute bottom-2 inset-x-2.5 z-20 flex items-center justify-between pointer-events-none text-[8.5px] font-mono text-zinc-400">
            <span className="bg-black/60 px-1.5 py-0.5 rounded border border-zinc-800 backdrop-blur-sm">
              Touch / Drag to orbit 3D space
            </span>
            <span className="bg-[#131024]/80 px-1.5 py-0.5 rounded border border-[#00ffcc]/30 text-[#00ffcc] backdrop-blur-sm">
              60 FPS • Real-Time PBR
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ZONE 2: DEDICATED BOTTOM DASHBOARD CONTROL LANE           */}
        {/* Pinned cleanly BELOW the 3D canvas container              */}
        {/* ========================================================= */}
        <div 
          className="w-full py-2 px-3 bg-[#131024] border-b border-[#2a2254] shrink-0 space-y-1.5 z-20 box-border"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Row 1: Mesh Styles Tabs: [Quad Mesh], [Triangular Mesh], [Point Cloud] */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[9px] font-mono text-[#00ffcc] uppercase tracking-wider shrink-0 font-bold">
              Mesh Topology:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap no-scrollbar">
              {[
                { id: 'quad', label: 'Quad Mesh' },
                { id: 'triangular', label: 'Triangular Mesh' },
                { id: 'pointcloud', label: 'Point Cloud' },
              ].map((m) => {
                const isSelected = meshStyle === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMeshStyle(m.id as MeshStyle);
                      showNotification(`Mesh topology switched to [${m.label}]`);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-mono transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#00ffcc] text-black font-bold shadow-[0_0_10px_rgba(0,255,204,0.45)]'
                        : 'bg-[#0b0816] text-zinc-400 hover:text-white border border-[#2a2254]'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Export Formats: [.obj], [.glTF], [.usdz] */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#2a2254]">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Download className="w-2.5 h-2.5 text-[#00ffcc]" />
              Export Model:
            </span>
            <div className="flex items-center gap-1.5">
              {(['.obj', '.glTF', '.usdz'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleExportFormat(fmt)}
                  disabled={isExporting}
                  className="px-2.5 py-0.5 rounded-md bg-[#0b0816] hover:bg-[#1c1833] border border-[#00ffcc]/40 hover:border-[#00ffcc] text-[#00ffcc] text-[9.5px] font-mono font-bold transition active:scale-95 flex items-center gap-1 shadow-sm"
                >
                  <span>{fmt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ZONE 3: TEXTURE & INPAINTING DECK (SCROLLABLE LOWER DECK) */}
        {/* ========================================================= */}
        <div 
          className="w-full flex-1 min-h-0 bg-[#000000] p-3 flex flex-col justify-between overflow-y-auto box-border space-y-2.5"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Prompt Section: Compact Material Prompt text field, log, and AI wand */}
          <div className="space-y-1.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00ffcc]" />
                Material Prompt
              </span>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancingPrompt}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#131024] hover:bg-[#1a1630] border border-[#00ffcc]/40 text-[#00ffcc] text-[9px] font-mono font-semibold transition active:scale-95"
                title="AI Enhance Prompt with procedural PBR shader terms"
              >
                <Wand2 className={`w-2.5 h-2.5 text-[#00ffcc] ${isEnhancingPrompt ? 'animate-spin' : ''}`} />
                <span>{isEnhancingPrompt ? 'Enhancing...' : 'Enhance Prompt'}</span>
              </button>
            </div>

            {/* Input Row */}
            <div className="flex items-center gap-1.5 bg-[#0b0816] border border-zinc-800 rounded-lg px-2 py-1 focus-within:border-[#00ffcc]/70 transition">
              <input
                type="text"
                value={materialPrompt}
                onChange={(e) => setMaterialPrompt(e.target.value)}
                placeholder="Describe material (e.g. Damascus steel, obsidian glass)..."
                className="w-full bg-transparent text-[10.5px] font-mono text-white placeholder-zinc-500 outline-none"
              />
            </div>

            {/* Running horizontal log of past materials */}
            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide py-0.5 text-[8.5px] font-mono">
              <span className="text-zinc-500 shrink-0">Log:</span>
              {pastMaterials.map((mat, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMaterialPrompt(mat);
                    showNotification(`Loaded past material: "${mat}"`);
                  }}
                  className="px-1.5 py-0.5 rounded bg-[#131024] text-zinc-400 hover:text-[#00ffcc] border border-zinc-800/80 transition shrink-0"
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* Structural Sliders: Metallic, Roughness, Opacity, Emission Glow */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 shrink-0 pt-1 border-t border-zinc-900 text-[9.5px] font-mono">
            {/* 1. Metallic */}
            <div>
              <div className="flex justify-between text-zinc-300 mb-0.5">
                <span>Metallic</span>
                <span className="font-bold text-[#00ffcc]">{metallic}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={metallic}
                onChange={(e) => setMetallic(parseInt(e.target.value, 10))}
                className="w-full accent-[#00ffcc] h-1 bg-zinc-800 rounded cursor-pointer"
              />
            </div>

            {/* 2. Roughness */}
            <div>
              <div className="flex justify-between text-zinc-300 mb-0.5">
                <span>Roughness</span>
                <span className="font-bold text-[#00ffcc]">{roughness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={roughness}
                onChange={(e) => setRoughness(parseInt(e.target.value, 10))}
                className="w-full accent-[#00ffcc] h-1 bg-zinc-800 rounded cursor-pointer"
              />
            </div>

            {/* 3. Opacity */}
            <div>
              <div className="flex justify-between text-zinc-300 mb-0.5">
                <span>Opacity</span>
                <span className="font-bold text-[#00ffcc]">{opacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                className="w-full accent-[#00ffcc] h-1 bg-zinc-800 rounded cursor-pointer"
              />
            </div>

            {/* 4. Emission Glow */}
            <div>
              <div className="flex justify-between text-zinc-300 mb-0.5">
                <span>Emission Glow</span>
                <span className="font-bold text-[#00ffcc]">{emissionGlow}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={emissionGlow}
                onChange={(e) => setEmissionGlow(parseInt(e.target.value, 10))}
                className="w-full accent-[#00ffcc] h-1 bg-zinc-800 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Holographic Detail Presets: 4-item micro-grid */}
          <div className="shrink-0 pt-1 border-t border-zinc-900">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
              Instant Texture Presets
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'carbon_fiber', label: 'Carbon Fiber' },
                { id: 'brushed_aluminum', label: 'Brushed Alum' },
                { id: 'neon_trim', label: 'Neon Trim' },
                { id: 'matte_obsidian', label: 'Matte Obsidian' },
              ].map((p) => {
                const isSelected = activeDetailPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleApplyDetailPreset(p.id as DetailPreset)}
                    className={`p-1.5 rounded-lg text-center transition-all active:scale-95 border ${
                      isSelected
                        ? 'bg-[#131024] border-[#00ffcc] text-[#00ffcc] font-bold shadow-[0_0_8px_rgba(0,255,204,0.3)]'
                        : 'bg-[#0b0816] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[8.5px] font-mono block leading-tight truncate">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Execution Control: Main Full-Width Action Button */}
          <button
            onClick={handleGenerate3DObject}
            disabled={isGenerating}
            className={`w-full py-2.5 px-4 rounded-xl font-black uppercase text-xs tracking-wider transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 ${
              isGenerating
                ? 'bg-[#00ffcc]/80 text-black shadow-[0_0_20px_rgba(0,255,204,0.8)] animate-pulse'
                : 'bg-[#00ffcc] hover:bg-[#00e6b8] text-black shadow-[0_0_18px_rgba(0,255,204,0.6)] hover:shadow-[0_0_26px_rgba(0,255,204,0.85)] cursor-pointer'
            }`}
            style={{ boxSizing: 'border-box' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-black animate-spin" />
            <span>
              {isGenerating ? 'Compiling 3D Procedural Mesh...' : 'Generate 3D Object'}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};
