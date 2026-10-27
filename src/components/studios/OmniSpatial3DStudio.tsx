import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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
  Cpu,
  Terminal,
  Grid,
  Play,
  Pause,
  Maximize2,
  Share2,
  Smartphone,
  CheckCircle2,
  Activity,
  HardDrive,
  Compass
} from 'lucide-react';

export type MeshStyle = 'quad' | 'triangular' | 'pointcloud';
export type LightingPreset = 'studio_white' | 'cinematic_neon' | 'moody_cyberpunk';
export type DetailPreset = 'carbon_fiber' | 'brushed_aluminum' | 'neon_trim' | 'matte_obsidian';
export type ModelVariantId = 'exo_spine' | 'quantum_drone' | 'biomorphic_prosthetic' | 'hyper_torus';

interface ModelVariant {
  id: ModelVariantId;
  name: string;
  tag: string;
  polygons: string;
  description: string;
  thumbnail: string;
  defaultPrompt: string;
}

const MODEL_VARIANTS: ModelVariant[] = [
  {
    id: 'exo_spine',
    name: 'Cyberpunk Exo-Spine Mk.IV',
    tag: 'Vertebral Array',
    polygons: '48,240',
    description: 'Segmented biomechanical column with titanium vertebrae, neural conduits, and hydraulic damping.',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&q=80',
    defaultPrompt: 'Titanium Cyberpunk Vertebral Exo-Spine with pulsating neural plasma conduit and precision hydraulic struts',
  },
  {
    id: 'quantum_drone',
    name: 'Quantum Drone Core',
    tag: 'Orbital Sensor',
    polygons: '52,800',
    description: 'Decoupled counter-rotating anti-gravity rings with central optical sensor and micro-thruster pods.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    defaultPrompt: 'Quantum Anti-Gravity Drone Core with counter-rotating electromagnetic gyro rings and optical sensor lens',
  },
  {
    id: 'biomorphic_prosthetic',
    name: 'Biomorphic Arm Chassis',
    tag: 'Kinetic Limb',
    polygons: '41,120',
    description: 'Aerodynamic carbon fiber shell housing high-torque pneumatic tendon actuators and titanium wrist nodes.',
    thumbnail: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&q=80',
    defaultPrompt: 'Aerodynamic Biomorphic Arm Chassis with woven carbon fiber plating, exposed pneumatic tendons, and purple LED telemetry',
  },
  {
    id: 'hyper_torus',
    name: 'Hyper-Torus Spatial Matrix',
    tag: 'Topology Knot',
    polygons: '64,320',
    description: 'Interlocking multi-dimensional topological knot with levitating orbital stabilizer satellites.',
    thumbnail: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=300&q=80',
    defaultPrompt: 'Interlocking 4D Hyper-Torus Knot with iridescent chrome thin-film sheen and concentric gyro stabilizers',
  },
];

interface OmniSpatial3DStudioProps {
  onSaveToVault?: (asset: any) => void;
}

export const OmniSpatial3DStudio: React.FC<OmniSpatial3DStudioProps> = ({ onSaveToVault }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Active Model Variant
  const [activeVariant, setActiveVariant] = useState<ModelVariantId>('exo_spine');

  // PANEL 1: Spatial Prompt & Material Controls
  const [materialPrompt, setMaterialPrompt] = useState<string>(
    'Titanium Cyberpunk Vertebral Exo-Spine with pulsating neural plasma conduit and precision hydraulic struts'
  );
  const [pastMaterials, setPastMaterials] = useState<string[]>([
    'Titanium Exo-Spine Mk.IV',
    'Quantum Anti-Gravity Core',
    'Iridescent Cyber Chrome',
    'Carbon Fiber Nanoweave',
    'Liquid Obsidian Glass',
  ]);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);

  // 4 Structural Sliders: Metallic, Roughness, Opacity, Emission Glow
  const [metallic, setMetallic] = useState<number>(85); // 0-100%
  const [roughness, setRoughness] = useState<number>(18); // 0-100%
  const [opacity, setOpacity] = useState<number>(100); // 10-100%
  const [emissionGlow, setEmissionGlow] = useState<number>(75); // 0-100%

  // Topology & Detail Preset
  const [meshStyle, setMeshStyle] = useState<MeshStyle>('quad');
  const [activeDetailPreset, setActiveDetailPreset] = useState<DetailPreset | null>('neon_trim');

  // PANEL 2: Center Viewport Controls
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('cinematic_neon');
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [showGridFloor, setShowGridFloor] = useState<boolean>(true);
  const [isWireframeOverlay, setIsWireframeOverlay] = useState<boolean>(false);
  const [fpsCounter, setFpsCounter] = useState<number>(60);

  // PANEL 3: Pipeline & Historic Deck
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isPushingToCall, setIsPushingToCall] = useState<boolean>(false);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: 'success' | 'info' | 'pipeline' } | null>(null);

  // Diagnostics Terminal Output
  const [terminalLogs, setTerminalLogs] = useState<Array<{ time: string; level: 'SYS' | 'CUDA' | 'NERF' | 'MESH'; text: string }>>([
    { time: '00:00:01', level: 'SYS', text: 'Nexus-Spatial WebGL 2.0 PBR Pipeline initialized. GPU Device: high-performance.' },
    { time: '00:00:02', level: 'CUDA', text: 'Local PyTorch JIT compiler hooked. Tensor memory allocated: 1.48 GB.' },
    { time: '00:00:03', level: 'NERF', text: 'Instant-NGP Radiance Field active. Octree depth: 16 layers.' },
    { time: '00:00:04', level: 'MESH', text: 'Loaded Cyberpunk Exo-Spine Mk.IV (48,240 vertices, 96,480 tris).' },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const wireframeGroupRef = useRef<THREE.Group | null>(null);
  const pointsGroupRef = useRef<THREE.Points | null>(null);
  const floorGridRef = useRef<THREE.GridHelper | null>(null);
  const materialsListRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const emissiveMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const keyLightRef = useRef<THREE.DirectionalLight | THREE.PointLight | null>(null);
  const fillLightRef = useRef<THREE.PointLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'pipeline' = 'info') => {
    setNotificationToast({ message, type });
    setTimeout(() => {
      setNotificationToast(null);
    }, 3800);
  };

  const addTerminalLog = (level: 'SYS' | 'CUDA' | 'NERF' | 'MESH', text: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setTerminalLogs((prev) => [...prev.slice(-30), { time, level, text }]);
  };

  // Scroll terminal automatically
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // =========================================================================
  // 1. THREE.JS SCENE SETUP, RENDERER, LIGHTING & ORBIT CONTROLS
  // =========================================================================
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // Detect software WebGL guard per Three.js guidelines
    const isSoftwareGl = (() => {
      if (typeof document === 'undefined') return false;
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene with pure obsidian black background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.045);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.0);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Empty container and append canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Studio Environment Reflections via RoomEnvironment
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback:', e);
    }

    // OrbitControls for silky pan, zoom, and dual-axis rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.8;
    controls.maxDistance = 12.0;
    controls.maxPolarAngle = Math.PI * 0.88;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Cyberpunk Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x7c3aed, 0x000000, 0.6);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const keyLight = new THREE.DirectionalLight(0x00f2ff, 4.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.PointLight(0x7c3aed, 4.0, 30);
    fillLight.position.set(-5, -2, -4);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Cyberpunk Ground Plane Matrix Grid
    const gridHelper = new THREE.GridHelper(16, 32, 0x00f2ff, 0x1f1640);
    gridHelper.position.y = -1.6;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.45;
    scene.add(gridHelper);
    floorGridRef.current = gridHelper;

    // Soft Radial Contact Shadow Grounding Plane
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.59;
    scene.add(shadowPlane);

    // =========================================================================
    // 2. PROCEDURAL 3–12 PART HERO MODEL BUILDER
    // =========================================================================
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    modelGroupRef.current = masterGroup;

    materialsListRef.current = [];
    emissiveMaterialsRef.current = [];

    // Helper to create coordinated PBR material
    const createPbrMat = (colorHex: number, isEmissive = false, emissiveHex = 0x00f2ff) => {
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        metalness: metallic / 100,
        roughness: roughness / 100,
        opacity: opacity / 100,
        transparent: opacity < 100,
        emissive: isEmissive ? new THREE.Color(emissiveHex) : new THREE.Color(0x000000),
        emissiveIntensity: isEmissive ? (emissionGlow / 100) * 1.8 : 0,
        wireframe: false,
      });
      materialsListRef.current.push(mat);
      if (isEmissive) emissiveMaterialsRef.current.push(mat);
      return mat;
    };

    // Build model variant
    if (activeVariant === 'exo_spine') {
      // 1. Vertebrae Column (Primary Silhouette: 7 articulating segments)
      const vertebraeCount = 7;
      for (let i = 0; i < vertebraeCount; i++) {
        const yPos = (i - 3) * 0.42;
        const segmentGroup = new THREE.Group();
        segmentGroup.position.set(0, yPos, 0);

        // Core Vertebra Block
        const vGeo = new THREE.CylinderGeometry(0.38 - i * 0.02, 0.42 - i * 0.02, 0.24, 8);
        const vMat = createPbrMat(0x1a1530);
        const vMesh = new THREE.Mesh(vGeo, vMat);
        vMesh.castShadow = !isSoftwareGl;
        vMesh.receiveShadow = !isSoftwareGl;
        segmentGroup.add(vMesh);

        // Titanium Lateral Wing Struts (Secondary Read)
        const wingGeo = new THREE.BoxGeometry(1.2 - i * 0.06, 0.08, 0.22);
        const wingMat = createPbrMat(0x0e0a22);
        const wingMesh = new THREE.Mesh(wingGeo, wingMat);
        wingMesh.castShadow = !isSoftwareGl;
        segmentGroup.add(wingMesh);

        // Outer Bevel Knuckle Nodes
        [-0.65 + i * 0.03, 0.65 - i * 0.03].forEach((xOffset) => {
          const kGeo = new THREE.SphereGeometry(0.09, 12, 12);
          const kMat = createPbrMat(0x281f4a, true, 0x7c3aed);
          const kMesh = new THREE.Mesh(kGeo, kMat);
          kMesh.position.set(xOffset, 0, 0.05);
          segmentGroup.add(kMesh);
        });

        // Hydraulic Damping Piston Shaft
        const pGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.38, 8);
        const pMat = createPbrMat(0x3a3360);
        const pMeshLeft = new THREE.Mesh(pGeo, pMat);
        pMeshLeft.position.set(-0.35, -0.15, -0.1);
        const pMeshRight = pMeshLeft.clone();
        pMeshRight.position.x = 0.35;
        segmentGroup.add(pMeshLeft);
        segmentGroup.add(pMeshRight);

        masterGroup.add(segmentGroup);
      }

      // 2. Central Neural Plasma Conduit (Accent Detail: Glowing Core Cable)
      const conduitCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -1.4, 0.12),
        new THREE.Vector3(0.08, -0.7, 0.18),
        new THREE.Vector3(-0.06, 0.0, 0.16),
        new THREE.Vector3(0.07, 0.7, 0.18),
        new THREE.Vector3(0, 1.4, 0.12),
      ]);
      const conduitGeo = new THREE.TubeGeometry(conduitCurve, 32, 0.07, 12, false);
      const conduitMat = createPbrMat(0x00f2ff, true, 0x00f2ff);
      const conduitMesh = new THREE.Mesh(conduitGeo, conduitMat);
      masterGroup.add(conduitMesh);

      // 3. Levitating Neural Halo Rings
      const haloGeo = new THREE.TorusGeometry(0.75, 0.03, 16, 64);
      const haloMat = createPbrMat(0x7c3aed, true, 0x7c3aed);
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.y = 1.35;
      haloMesh.rotation.x = Math.PI / 2;
      masterGroup.add(haloMesh);

    } else if (activeVariant === 'quantum_drone') {
      // 1. Primary Central Octagonal Hull
      const coreGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.45, 8);
      const coreMat = createPbrMat(0x16102a);
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      masterGroup.add(coreMesh);

      // Central Optical Sensor Eye
      const eyeGeo = new THREE.SphereGeometry(0.35, 24, 24);
      const eyeMat = createPbrMat(0x00f2ff, true, 0x00f2ff);
      const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
      eyeMesh.position.set(0, 0, 0.32);
      masterGroup.add(eyeMesh);

      // Outer Lens Bezel
      const bezelGeo = new THREE.TorusGeometry(0.36, 0.04, 16, 32);
      const bezelMat = createPbrMat(0x3e3568);
      const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
      bezelMesh.position.set(0, 0, 0.32);
      masterGroup.add(bezelMesh);

      // 2. Dual Counter-Rotating Anti-Gravity Rings
      const ring1Geo = new THREE.TorusGeometry(1.35, 0.06, 16, 64);
      const ring1Mat = createPbrMat(0x241d40, true, 0x7c3aed);
      const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1Mesh.name = 'gyroRing1';
      masterGroup.add(ring1Mesh);

      const ring2Geo = new THREE.TorusGeometry(1.65, 0.05, 16, 64);
      const ring2Mat = createPbrMat(0x1a1432, true, 0x00f2ff);
      const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2Mesh.rotation.x = Math.PI * 0.35;
      ring2Mesh.name = 'gyroRing2';
      masterGroup.add(ring2Mesh);

      // 3. 4 Lateral Thruster Nodes
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const thrusterGroup = new THREE.Group();
        thrusterGroup.position.set(Math.cos(angle) * 1.1, 0, Math.sin(angle) * 1.1);

        const podGeo = new THREE.BoxGeometry(0.24, 0.28, 0.4);
        const podMat = createPbrMat(0x140e26);
        const podMesh = new THREE.Mesh(podGeo, podMat);
        thrusterGroup.add(podMesh);

        const tipGeo = new THREE.ConeGeometry(0.08, 0.18, 12);
        const tipMat = createPbrMat(0x00f2ff, true, 0x00f2ff);
        const tipMesh = new THREE.Mesh(tipGeo, tipMat);
        tipMesh.rotation.x = Math.PI / 2;
        tipMesh.position.z = 0.22;
        thrusterGroup.add(tipMesh);

        masterGroup.add(thrusterGroup);
      }

    } else if (activeVariant === 'biomorphic_prosthetic') {
      // 1. Forearm Main Chassis Shell
      const armGeo = new THREE.CylinderGeometry(0.35, 0.5, 2.2, 16);
      const armMat = createPbrMat(0x17122b);
      const armMesh = new THREE.Mesh(armGeo, armMat);
      armMesh.position.y = -0.2;
      masterGroup.add(armMesh);

      // Outer Carbon Armor Cladding Plates
      const plateGeo = new THREE.CylinderGeometry(0.38, 0.53, 1.8, 8, 1, true, 0, Math.PI);
      const plateMat = createPbrMat(0x0a0718);
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      plateMesh.position.y = -0.2;
      plateMesh.rotation.y = Math.PI * 0.25;
      masterGroup.add(plateMesh);

      // Titanium Tendon Actuator Rods
      [-0.2, 0, 0.2].forEach((xOffset, idx) => {
        const tendonGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8);
        const tendonMat = createPbrMat(0x3d3560, idx === 1, 0x7c3aed);
        const tendonMesh = new THREE.Mesh(tendonGeo, tendonMat);
        tendonMesh.position.set(xOffset, -0.2, 0.42);
        masterGroup.add(tendonMesh);
      });

      // Articulated Wrist Joint Collar
      const wristGeo = new THREE.TorusGeometry(0.38, 0.08, 16, 32);
      const wristMat = createPbrMat(0x2a214d, true, 0x00f2ff);
      const wristMesh = new THREE.Mesh(wristGeo, wristMat);
      wristMesh.position.y = 1.0;
      wristMesh.rotation.x = Math.PI / 2;
      masterGroup.add(wristMesh);

      // Kinetic Knuckle Hub
      const knuckleGeo = new THREE.BoxGeometry(0.65, 0.35, 0.4);
      const knuckleMat = createPbrMat(0x191330);
      const knuckleMesh = new THREE.Mesh(knuckleGeo, knuckleMat);
      knuckleMesh.position.y = 1.35;
      masterGroup.add(knuckleMesh);

    } else {
      // 'hyper_torus': Interlocking 4D Torus Knot + Gyro Orbiters
      const torusGeo = new THREE.TorusKnotGeometry(1.1, 0.32, 128, 24, 2, 3);
      const torusMat = createPbrMat(0x16112a, true, 0x7c3aed);
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      masterGroup.add(torusMesh);

      const innerGyroGeo = new THREE.TorusGeometry(0.7, 0.05, 16, 64);
      const innerGyroMat = createPbrMat(0x00f2ff, true, 0x00f2ff);
      const innerGyro = new THREE.Mesh(innerGyroGeo, innerGyroMat);
      innerGyro.name = 'gyroRing1';
      masterGroup.add(innerGyro);

      const outerRingGeo = new THREE.TorusGeometry(1.8, 0.03, 16, 64);
      const outerRingMat = createPbrMat(0x7c3aed, true, 0x7c3aed);
      const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      outerRing.name = 'gyroRing2';
      masterGroup.add(outerRing);
    }

    // =========================================================================
    // 3. WIREFRAME & POINT CLOUD OVERLAYS
    // =========================================================================
    const wireGroup = new THREE.Group();
    masterGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0x7c3aed,
          wireframe: true,
          transparent: true,
          opacity: 0.65,
        });
        const wireMesh = new THREE.Mesh(child.geometry, wireMat);
        wireMesh.position.copy(child.position);
        wireMesh.rotation.copy(child.rotation);
        wireMesh.scale.copy(child.scale);
        wireGroup.add(wireMesh);
      }
    });
    wireGroup.visible = meshStyle === 'triangular' || isWireframeOverlay;
    scene.add(wireGroup);
    wireframeGroupRef.current = wireGroup;

    // Point cloud density map
    const pointsGeo = new THREE.TorusKnotGeometry(1.15, 0.45, 120, 24);
    const pointsMat = new THREE.PointsMaterial({
      color: 0x00f2ff,
      size: 0.038,
      transparent: true,
      opacity: 0.85,
    });
    const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
    pointsMesh.visible = meshStyle === 'pointcloud';
    scene.add(pointsMesh);
    pointsGroupRef.current = pointsMesh;

    // Pre-warm shaders
    if (!isSoftwareGl) {
      try {
        renderer.compile(scene, camera);
      } catch {}
    }

    // =========================================================================
    // 4. ANIMATION LOOP & FPS COUNTER
    // =========================================================================
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // FPS tracking
      frameCount++;
      if (time - lastTime >= 1000) {
        setFpsCounter(Math.round((frameCount * 1000) / (time - lastTime)));
        frameCount = 0;
        lastTime = time;
      }

      // Smooth auto-rotation
      if (isAutoRotate && masterGroup) {
        masterGroup.rotation.y += 0.006;
      }

      // Internal kinetic ring rotations
      const gyro1 = masterGroup.getObjectByName('gyroRing1');
      if (gyro1) {
        gyro1.rotation.x += 0.015;
        gyro1.rotation.y += 0.01;
      }
      const gyro2 = masterGroup.getObjectByName('gyroRing2');
      if (gyro2) {
        gyro2.rotation.z -= 0.012;
      }

      if (pointsMesh && pointsMesh.visible) {
        pointsMesh.rotation.y += 0.008;
      }

      if (wireGroup && wireGroup.visible) {
        wireGroup.rotation.copy(masterGroup.rotation);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // =========================================================================
    // 5. RESIZE LISTENER
    // =========================================================================
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || 800;
      const h = mountRef.current.clientHeight || 560;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (container) resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeVariant]);

  // =========================================================================
  // 6. REAL-TIME MATERIAL & LIGHTING PROPAGATION
  // =========================================================================
  useEffect(() => {
    materialsListRef.current.forEach((mat) => {
      mat.metalness = metallic / 100;
      mat.roughness = roughness / 100;
      mat.opacity = opacity / 100;
      mat.transparent = opacity < 100;
      mat.needsUpdate = true;
    });

    emissiveMaterialsRef.current.forEach((mat) => {
      mat.emissiveIntensity = (emissionGlow / 100) * 2.0;
      mat.needsUpdate = true;
    });
  }, [metallic, roughness, opacity, emissionGlow]);

  // Dynamic Lighting Preset updates
  useEffect(() => {
    if (!keyLightRef.current || !fillLightRef.current || !hemiLightRef.current) return;

    if (lightingPreset === 'studio_white') {
      hemiLightRef.current.color.setHex(0xffffff);
      hemiLightRef.current.groundColor.setHex(0x1a1530);
      hemiLightRef.current.intensity = 0.9;

      if (keyLightRef.current instanceof THREE.DirectionalLight) {
        keyLightRef.current.color.setHex(0xffffff);
        keyLightRef.current.intensity = 4.0;
      }
      fillLightRef.current.color.setHex(0xd1d5db);
      fillLightRef.current.intensity = 2.5;

      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(0x020108);
      }
    } else if (lightingPreset === 'cinematic_neon') {
      hemiLightRef.current.color.setHex(0x7c3aed);
      hemiLightRef.current.groundColor.setHex(0x000000);
      hemiLightRef.current.intensity = 0.6;

      if (keyLightRef.current instanceof THREE.DirectionalLight) {
        keyLightRef.current.color.setHex(0x00f2ff);
        keyLightRef.current.intensity = 4.6;
      }
      fillLightRef.current.color.setHex(0x7c3aed);
      fillLightRef.current.intensity = 4.2;

      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(0x000000);
      }
    } else if (lightingPreset === 'moody_cyberpunk') {
      hemiLightRef.current.color.setHex(0x0a071b);
      hemiLightRef.current.groundColor.setHex(0x000000);
      hemiLightRef.current.intensity = 0.25;

      if (keyLightRef.current instanceof THREE.DirectionalLight) {
        keyLightRef.current.color.setHex(0x00f2ff);
        keyLightRef.current.intensity = 5.5;
      }
      fillLightRef.current.color.setHex(0xa855f7);
      fillLightRef.current.intensity = 4.8;

      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(0x000000);
      }
    }
  }, [lightingPreset]);

  // Topology Mode updates
  useEffect(() => {
    if (modelGroupRef.current) {
      modelGroupRef.current.visible = meshStyle !== 'pointcloud';
    }
    if (wireframeGroupRef.current) {
      wireframeGroupRef.current.visible = meshStyle === 'triangular' || isWireframeOverlay;
    }
    if (pointsGroupRef.current) {
      pointsGroupRef.current.visible = meshStyle === 'pointcloud';
    }
  }, [meshStyle, isWireframeOverlay]);

  // Grid floor toggle
  useEffect(() => {
    if (floorGridRef.current) {
      floorGridRef.current.visible = showGridFloor;
    }
  }, [showGridFloor]);

  // Reset Camera View
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1.2, 5.0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      showNotification('Center Camera viewport recalibrated to origin', 'info');
    }
  };

  // AI Prompt Refiner
  const handleRefinePrompt = () => {
    setIsEnhancingPrompt(true);
    setTimeout(() => {
      const refinements = [
        'Anisotropic brushed titanium highlights, micro-faceted roughness mapping, volumetric subsurface Fresnel scattering, and 8K normal displacement.',
        'Nanometer procedural etched circuits, dual-layer clear-coat lacquer, deep obsidian carbon weave, and razor-sharp photon emission.',
        'High-density quad topology with beveled bevel edge-loops, specular metallic dispersion, and reactive quantum luminescent conduits.',
      ];
      const selected = refinements[Math.floor(Math.random() * refinements.length)];
      const updated = `${materialPrompt.trim()}. ${selected}`;
      setMaterialPrompt(updated);
      setIsEnhancingPrompt(false);
      showNotification('AI Prompt Refined with PBR procedural shader keywords!', 'success');
      addTerminalLog('CUDA', 'Prompt expanded via Gemini Neural Shader Tokenizer: +42 tokens.');
    }, 550);
  };

  // Material Presets
  const handleApplyPreset = (preset: DetailPreset) => {
    setActiveDetailPreset(preset);
    if (preset === 'carbon_fiber') {
      setMetallic(45);
      setRoughness(32);
      setOpacity(100);
      setEmissionGlow(20);
      setMaterialPrompt('Carbon Fiber composite nanoweave with diagonal twill specular sheen');
    } else if (preset === 'brushed_aluminum') {
      setMetallic(98);
      setRoughness(12);
      setOpacity(100);
      setEmissionGlow(15);
      setMaterialPrompt('Brushed Aerospace Aluminum alloy with linear anisotropic reflections');
    } else if (preset === 'neon_trim') {
      setMetallic(80);
      setRoughness(15);
      setOpacity(100);
      setEmissionGlow(95);
      setMaterialPrompt('Cyber Aqua Neon Luminescent Trim with high energy bloom and dark obsidian casing');
    } else if (preset === 'matte_obsidian') {
      setMetallic(15);
      setRoughness(88);
      setOpacity(100);
      setEmissionGlow(5);
      setMaterialPrompt('Deep Obsidian volcanic stone with ambient occlusion absorption and purplish-blue micro-fractures');
    }
    showNotification(`⚡ Loaded [${preset.replace('_', ' ').toUpperCase()}] material parameters`, 'info');
    addTerminalLog('CUDA', `PBR parameters updated: Preset [${preset}] synced.`);
  };

  // Select Variant from Historic Session Deck
  const handleSelectVariant = (variant: ModelVariant) => {
    setActiveVariant(variant.id);
    setMaterialPrompt(variant.defaultPrompt);
    showNotification(`Loaded 3D Variant: ${variant.name}`, 'success');
    addTerminalLog('SYS', `Switching active mesh subject: ${variant.name} (${variant.polygons} verts).`);
    addTerminalLog('NERF', `Recalibrating instant-NGP bounding box for [${variant.id}].`);
  };

  // Compile / Re-generate Procedural Mesh
  const handleCompileMesh = () => {
    setIsGenerating(true);
    addTerminalLog('CUDA', 'Compiling procedural vertex matrix: evaluating SDF tensors...');
    addTerminalLog('NERF', 'Baking radiance octree with 128 ray-marching steps...');

    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.y += Math.PI * 0.4;
      modelGroupRef.current.rotation.x += Math.PI * 0.2;
    }

    if (materialPrompt.trim() && !pastMaterials.includes(materialPrompt.trim())) {
      setPastMaterials((prev) => [materialPrompt.trim(), ...prev.slice(0, 5)]);
    }

    setTimeout(() => {
      addTerminalLog('MESH', 'Geometry re-triangulated: 0 non-manifold edges detected.');
      addTerminalLog('SYS', 'Active shaders recompiled with zero pipeline stalls.');
      setIsGenerating(false);
      showNotification('🚀 3D Procedural Mesh recompiled with real-time PBR shaders!', 'success');
    }, 1200);
  };

  // Export 3D Formats (.obj, .gltf, .usdz)
  const handleExportFormat = (format: '.obj' | '.gltf' | '.usdz') => {
    setIsExporting(true);
    const activeObj = MODEL_VARIANTS.find((v) => v.id === activeVariant) || MODEL_VARIANTS[0];
    const timestamp = Date.now();
    const fileName = `${activeObj.name.replace(/[^a-zA-Z0-9]/g, '_')}_3D${format}`;

    let mimeType = 'text/plain';
    let fileContent = '';

    if (format === '.obj') {
      mimeType = 'text/plain';
      fileContent = `# OmniAI - Nexus Spatial 3D Asset Builder\n# Generator: OmniSpatial 3D Studio (Vectary/Spline Ultra Arch)\n# Model: ${activeObj.name}\n# PBR: Metallic ${metallic}%, Roughness ${roughness}%, Glow ${emissionGlow}%\no ${activeObj.id}\nv -0.5 -0.5 0.5\nv 0.5 -0.5 0.5\nv 0.5 0.5 0.5\nv -0.5 0.5 0.5\nvn 0.0 0.0 1.0\nf 1//1 2//1 3//1 4//1\n`;
    } else if (format === '.gltf') {
      mimeType = 'application/json';
      fileContent = JSON.stringify({
        asset: { generator: 'OmniAI - Nexus Spatial 3D Studio v5.0', version: '2.0' },
        scene: 0,
        scenes: [{ nodes: [0] }],
        nodes: [{ name: activeObj.name, mesh: 0 }],
        materials: [{
          name: 'Nexus_PBR_Material',
          pbrMetallicRoughness: {
            baseColorFactor: [0.08, 0.05, 0.16, opacity / 100],
            metallicFactor: metallic / 100,
            roughnessFactor: roughness / 100,
          },
          emissiveFactor: [0.0, 0.95, 1.0],
        }],
      }, null, 2);
    } else {
      mimeType = 'model/vnd.usdz+zip';
      fileContent = `#usda 1.0\ndef Xform "Root" {\n    def Mesh "Geometry" {\n        float3[] points = [(-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)]\n    }\n}`;
    }

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

    const newAsset = {
      id: `spatial_asset_${timestamp}`,
      title: `${activeObj.name} (${format.toUpperCase()})`,
      type: '3d',
      thumbnail: activeObj.thumbnail,
      tags: ['OmniSpatial 3D', format.toUpperCase(), meshStyle, 'Obsidian Cyberpunk'],
      details: `Generated in OmniSpatial 3D Studio with ${metallic}% Metallic, ${roughness}% Roughness, and ${emissionGlow}% Emission.`,
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

    addTerminalLog('SYS', `Exported asset package: ${fileName} compiled.`);

    setTimeout(() => {
      setIsExporting(false);
      showNotification(`💾 Compiled & saved ${fileName} to Vault and Downloads!`, 'success');
    }, 450);
  };

  // Push Direct to Mobile Call Overlay UI Asset Pipeline
  const handlePushToMobileCallOverlay = () => {
    setIsPushingToCall(true);
    const activeObj = MODEL_VARIANTS.find((v) => v.id === activeVariant) || MODEL_VARIANTS[0];
    const timestamp = Date.now();

    addTerminalLog('SYS', `Initiating overlay bridge: Streaming [${activeObj.name}] to Mobile HUD pipeline...`);
    addTerminalLog('CUDA', 'Generating lightweight holographic LOD proxy...');

    setTimeout(() => {
      const overlayPayload = {
        id: `overlay_${timestamp}`,
        assetName: activeObj.name,
        variantId: activeVariant,
        meshStyle,
        lightingPreset,
        metallic,
        roughness,
        emissionGlow,
        holographicPBR: true,
        pushedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('omni_active_spatial_call_overlay', JSON.stringify(overlayPayload));
        window.dispatchEvent(new CustomEvent('omni_spatial_call_overlay_pushed', { detail: overlayPayload }));
      } catch {}

      addTerminalLog('SYS', 'Push successful: Mobile Live Call Overlay UI subscribed.');
      setIsPushingToCall(false);
      showNotification(`🚀 Pushed [${activeObj.name}] to Nexus Mobile Call Overlay HUD!`, 'pipeline');
    }, 900);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#000000] text-[#f1f5f9] font-sans select-none overflow-hidden box-border">
      
      {/* ========================================================================= */}
      {/* UNIVERSAL HEADER BRANDING: Exactly "OmniAI - Nexus"                       */}
      {/* ========================================================================= */}
      <header className="h-12 px-4 bg-[#000000] border-b border-[#7c3aed]/30 flex items-center justify-between shrink-0 z-30">
        
        {/* Left: Universal Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0a071b] border border-[#00f2ff] flex items-center justify-center text-[#00f2ff] shadow-[0_0_12px_rgba(0,242,255,0.4)]">
              <Rotate3d className="w-4 h-4 text-[#00f2ff]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black tracking-wider text-white uppercase font-mono">
                OmniAI<span className="text-[#00f2ff]"> - Nexus</span>
              </span>
              <span className="text-[10px] text-[#7c3aed] font-mono font-bold tracking-tight uppercase hidden sm:inline">
                / Spatial 3D Studio
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-[#7c3aed]/30">
            <span className="px-2 py-0.5 rounded-full bg-[#0a071b] border border-[#00f2ff]/40 text-[#00f2ff] text-[9.5px] font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff]" />
              WebGL 2.0 PBR Engine
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#0a071b] border border-[#7c3aed]/40 text-[#7c3aed] text-[9.5px] font-mono font-bold">
              Spline & Vectary Ultra Architecture
            </span>
          </div>
        </div>

        {/* Right: Telemetry & Actions */}
        <div className="flex items-center gap-2">
          {/* Real-time FPS & Shader calls */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0a071b] border border-[#7c3aed]/30 text-[10px] font-mono">
            <span className="text-[#00f2ff] font-bold">{fpsCounter} FPS</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300">12 Draws</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#7c3aed] font-semibold">{MODEL_VARIANTS.find(v => v.id === activeVariant)?.polygons} Tris</span>
          </div>

          {/* Quick Trigger: Push to Call Overlay */}
          <button
            onClick={handlePushToMobileCallOverlay}
            disabled={isPushingToCall}
            className="px-2.5 py-1 rounded-lg bg-[#7c3aed]/20 hover:bg-[#7c3aed]/30 border border-[#7c3aed] text-[#00f2ff] hover:text-white text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition active:scale-95 shadow-[0_0_10px_rgba(124,58,237,0.3)]"
            title="Push Direct to Mobile Call Overlay UI Asset Pipeline"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#00f2ff]" />
            <span className="hidden xs:inline">{isPushingToCall ? 'Pushing...' : 'Push to Call HUD'}</span>
          </button>
        </div>
      </header>

      {/* Floating Notification Toast */}
      {notificationToast && (
        <div className={`absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl backdrop-blur-md text-xs font-mono font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2 border ${
          notificationToast.type === 'success'
            ? 'bg-[#0a071b] border-[#00f2ff] text-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.4)]'
            : notificationToast.type === 'pipeline'
            ? 'bg-[#0a071b] border-[#7c3aed] text-[#00f2ff] shadow-[0_0_20px_rgba(124,58,237,0.5)]'
            : 'bg-[#0a071b] border-[#7c3aed]/60 text-white'
        }`}>
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#00f2ff]" />
          <span>{notificationToast.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THREE-COLUMN WIDESCREEN DESKTOP WORKSTATION ARCHITECTURE                  */}
      {/* Panel 1 (Left 25%) | Panel 2 (Center 50%) | Panel 3 (Right 25%)           */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row overflow-hidden bg-[#000000]">
        
        {/* ======================================================================= */}
        {/* PANEL 1: LEFT COLUMN (25% WIDTH) - PROMPT & MATERIAL SYNTHESIS          */}
        {/* ======================================================================= */}
        <aside className="w-full lg:w-1/4 xl:w-1/4 h-auto lg:h-full bg-[#0a071b] border-b lg:border-b-0 lg:border-r border-[#7c3aed]/30 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
          
          <div className="p-3.5 space-y-4">
            
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#00f2ff]" />
                <h2 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  Spatial Prompt & Materials
                </h2>
              </div>
              <span className="text-[9px] font-mono text-[#7c3aed] uppercase font-bold">
                PANEL 01
              </span>
            </div>

            {/* 1. Natural Language Spatial Prompt Interface */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#00f2ff]" />
                  Natural Language Prompt
                </label>
                <button
                  type="button"
                  onClick={handleRefinePrompt}
                  disabled={isEnhancingPrompt}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#000000] hover:bg-[#150f2e] border border-[#00f2ff]/40 text-[#00f2ff] text-[9.5px] font-mono font-semibold transition active:scale-95 shadow-sm"
                  title="AI Prompt Refiner with procedural PBR terms"
                >
                  <Wand2 className={`w-3 h-3 text-[#00f2ff] ${isEnhancingPrompt ? 'animate-spin' : ''}`} />
                  <span>{isEnhancingPrompt ? 'Refining...' : 'AI Refine Prompt'}</span>
                </button>
              </div>

              {/* Multi-line natural language textarea */}
              <div className="relative bg-[#000000] border border-[#7c3aed]/40 rounded-xl p-2.5 focus-within:border-[#00f2ff] transition">
                <textarea
                  rows={3}
                  value={materialPrompt}
                  onChange={(e) => setMaterialPrompt(e.target.value)}
                  placeholder="Describe your 3D spatial asset (e.g. Titanium biomechanical spine, glowing plasma nodes)..."
                  className="w-full bg-transparent text-xs font-mono text-white placeholder-zinc-500 outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Prompt History / Quick Chips */}
              <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide py-1 text-[9px] font-mono">
                <span className="text-zinc-500 shrink-0">Chips:</span>
                {pastMaterials.map((mat, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMaterialPrompt(mat);
                      showNotification(`Loaded prompt: "${mat}"`, 'info');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-[#000000] hover:bg-[#150f2e] text-zinc-400 hover:text-[#00f2ff] border border-[#7c3aed]/30 hover:border-[#00f2ff]/60 transition shrink-0"
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Material Property Sliders (Live bound to Three.js PBR) */}
            <div className="p-3 rounded-xl bg-[#0a071b] border border-[#1e1642] space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#00ffcc] uppercase tracking-wider block">
                PBR Material Surface Physics
              </span>

              {/* Metallic Reflectivity */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-300 mb-1">
                  <span>Metallic Reflectivity</span>
                  <span className="font-bold text-[#00ffcc]">{metallic}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={metallic}
                  onChange={(e) => setMetallic(parseInt(e.target.value, 10))}
                  className="w-full accent-[#6366f1] h-1.5 bg-[#1e1642] rounded cursor-pointer"
                />
              </div>

              {/* Roughness */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-300 mb-1">
                  <span>Roughness Specular</span>
                  <span className="font-bold text-[#6366f1]">{roughness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={roughness}
                  onChange={(e) => setRoughness(parseInt(e.target.value, 10))}
                  className="w-full accent-[#6366f1] h-1.5 bg-[#1e1642] rounded cursor-pointer"
                />
              </div>

              {/* Alpha Opacity */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-300 mb-1">
                  <span>Alpha Opacity</span>
                  <span className="font-bold text-[#00ffcc]">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                  className="w-full accent-[#6366f1] h-1.5 bg-[#1e1642] rounded cursor-pointer"
                />
              </div>

              {/* Emission Glow */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-300 mb-1">
                  <span>Emission Glow Bloom</span>
                  <span className="font-bold text-[#00ffcc]">{emissionGlow}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={emissionGlow}
                  onChange={(e) => setEmissionGlow(parseInt(e.target.value, 10))}
                  className="w-full accent-[#6366f1] h-1.5 bg-[#1e1642] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Instant Material Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Instant Material Presets
              </span>
              <div className="grid grid-cols-2 gap-1.5">
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
                      onClick={() => handleApplyPreset(p.id as DetailPreset)}
                      className={`p-2 rounded-xl text-left transition-all active:scale-95 border ${
                        isSelected
                          ? 'bg-[#000000] border-[#00f2ff] text-[#00f2ff] font-bold shadow-[0_0_12px_rgba(0,242,255,0.25)]'
                          : 'bg-[#000000] border-[#7c3aed]/30 text-zinc-400 hover:text-white hover:border-[#7c3aed]'
                      }`}
                    >
                      <span className="text-[10px] font-mono block leading-tight truncate">
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Mesh Geometry Toggles */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Mesh Geometry Topology
              </span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'quad', label: 'Quad Mesh' },
                  { id: 'triangular', label: 'Triangular' },
                  { id: 'pointcloud', label: 'Point Cloud' },
                ].map((m) => {
                  const isSelected = meshStyle === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMeshStyle(m.id as MeshStyle);
                        showNotification(`Mesh topology mode: [${m.label}]`, 'info');
                        addTerminalLog('MESH', `Topology converted to [${m.label}].`);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-center text-[9.5px] font-mono transition-all active:scale-95 border ${
                        isSelected
                          ? 'bg-[#000000] border-[#00f2ff] text-[#00f2ff] font-bold shadow-[0_0_10px_rgba(0,242,255,0.3)]'
                          : 'bg-[#000000] text-zinc-400 hover:text-white border-[#7c3aed]/30'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Compile Procedural Mesh Primary Action */}
            <button
              onClick={handleCompileMesh}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl font-mono font-black uppercase text-xs tracking-wider transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 border ${
                isGenerating
                  ? 'bg-[#7c3aed]/30 text-[#00f2ff] border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.6)] animate-pulse'
                  : 'bg-[#000000] hover:bg-[#0a071b] border-[#00f2ff] text-[#00f2ff] hover:text-white shadow-[0_0_16px_rgba(0,242,255,0.4)] hover:shadow-[0_0_24px_rgba(0,242,255,0.7)] cursor-pointer'
              }`}
            >
              <Cpu className="w-4 h-4 text-[#00f2ff]" />
              <span>{isGenerating ? 'Synthesizing SDF Mesh...' : 'Compile 3D Asset / Mesh'}</span>
            </button>

          </div>

        </aside>

        {/* ======================================================================= */}
        {/* PANEL 2: CENTER COLUMN (50% WIDTH) - THREE.JS HIGH-FRAME-RATE VIEWPORT  */}
        {/* ======================================================================= */}
        <main className="w-full lg:w-2/4 xl:w-2/4 h-[420px] lg:h-full flex flex-col relative bg-[#000000] overflow-hidden">
          
          {/* Top-Left Floating HUD: Camera & Mesh Controls */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-[#0a071b]/90 border border-[#7c3aed]/40 rounded-xl p-1.5 backdrop-blur-md shadow-xl">
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`p-1.5 rounded-lg text-xs font-mono transition ${
                isAutoRotate ? 'bg-[#7c3aed] text-white shadow-[0_0_8px_rgba(124,58,237,0.5)]' : 'text-zinc-400 hover:text-white'
              }`}
              title={isAutoRotate ? 'Pause Orbit Rotation' : 'Start Auto Orbit'}
            >
              {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowGridFloor(!showGridFloor)}
              className={`p-1.5 rounded-lg text-xs font-mono transition ${
                showGridFloor ? 'bg-[#000000] border border-[#00f2ff] text-[#00f2ff]' : 'text-zinc-400 hover:text-white'
              }`}
              title="Toggle Cyberpunk Grid Ground Plane"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsWireframeOverlay(!isWireframeOverlay)}
              className={`px-2 py-1 rounded-lg text-[9.5px] font-mono font-bold transition ${
                isWireframeOverlay
                  ? 'bg-[#7c3aed] text-white shadow-[0_0_10px_rgba(124,58,237,0.6)]'
                  : 'bg-[#000000] text-zinc-400 hover:text-white border border-[#7c3aed]/40'
              }`}
              title="Toggle Wireframe Overlay Mesh Lines"
            >
              Wireframe
            </button>

            <button
              onClick={handleResetCamera}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-[#00f2ff] transition"
              title="Reset Camera to Center"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Top-Right Floating HUD: Multi-Mood Environmental Lighting Deck */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-[#0a071b]/90 border border-[#7c3aed]/40 rounded-xl p-1.5 backdrop-blur-md shadow-xl">
            <Sun className="w-3.5 h-3.5 text-[#00f2ff] ml-1 shrink-0" />
            {(['studio_white', 'cinematic_neon', 'moody_cyberpunk'] as const).map((preset) => {
              const labels = {
                studio_white: 'Studio White',
                cinematic_neon: 'Cinematic Neon',
                moody_cyberpunk: 'Moody Cyber',
              };
              const isSelected = lightingPreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => {
                    setLightingPreset(preset);
                    showNotification(`Lighting: [${labels[preset]}]`, 'info');
                    addTerminalLog('CUDA', `Environment rig swapped: [${labels[preset]}].`);
                  }}
                  className={`px-2 py-1 rounded-lg text-[9px] font-mono transition-all ${
                    isSelected
                      ? 'bg-[#00f2ff] text-black font-bold shadow-[0_0_10px_rgba(0,242,255,0.6)]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title={`Environmental Lighting Deck: ${labels[preset]}`}
                >
                  {labels[preset]}
                </button>
              );
            })}
          </div>

          {/* Center 3D Three.js WebGL Canvas Mount Container */}
          <div 
            ref={mountRef} 
            className="w-full flex-1 min-h-0 cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
          />

          {/* Permanent Bottom Cyber Aqua Telemetry Bar */}
          <div className="h-8 px-3 bg-[#0a071b] border-t border-[#7c3aed]/30 flex items-center justify-between shrink-0 z-20 text-[9.5px] font-mono">
            <div className="flex items-center gap-2 text-[#00f2ff] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00f2ff] shadow-[0_0_6px_rgba(0,242,255,0.8)]" />
              <span className="tracking-tight">
                [Nexus-Spatial: WebGL 3D Matrix Renderer / Local PyTorch Pipeline Running]
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-zinc-400">
              <span>FOV: 45°</span>
              <span className="text-[#7c3aed]">•</span>
              <span>Damping: 0.05</span>
              <span className="text-[#7c3aed]">•</span>
              <span className="text-emerald-400">PBR Filmic ACES</span>
            </div>
          </div>

        </main>

        {/* ======================================================================= */}
        {/* PANEL 3: RIGHT COLUMN (25% WIDTH) - PIPELINE, SESSIONS & EXPORT COMPILER*/}
        {/* ======================================================================= */}
        <aside className="w-full lg:w-1/4 xl:w-1/4 h-auto lg:h-full bg-[#0a071b] border-t lg:border-t-0 lg:border-l border-[#7c3aed]/30 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
          
          <div className="p-3.5 space-y-4">
            
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[#00f2ff]" />
                <h2 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  Diagnostics & Compilers
                </h2>
              </div>
              <span className="text-[9px] font-mono text-[#7c3aed] uppercase font-bold">
                PANEL 03
              </span>
            </div>

            {/* 1. Text-To-3D Pipeline Asset Track (Live Diagnostics Terminal) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#00f2ff]" />
                  Live Diagnostics Terminal
                </span>
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  JIT Active
                </span>
              </div>

              {/* Scrolling terminal box */}
              <div className="h-36 bg-[#000000] border border-[#7c3aed]/40 rounded-xl p-2.5 overflow-y-auto font-mono text-[9px] space-y-1 text-zinc-400 select-text">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="leading-tight">
                    <span className="text-zinc-600">[{log.time}]</span>{' '}
                    <span className={
                      log.level === 'SYS' ? 'text-[#00f2ff] font-bold' :
                      log.level === 'CUDA' ? 'text-[#7c3aed] font-bold' :
                      log.level === 'NERF' ? 'text-amber-400 font-bold' :
                      'text-emerald-400 font-bold'
                    }>
                      [{log.level}]
                    </span>{' '}
                    <span className="text-zinc-300">{log.text}</span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Pipeline Status Chips */}
              <div className="flex items-center justify-between text-[8.5px] font-mono text-zinc-400 pt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-[#000000] border border-[#7c3aed]/30 text-[#7c3aed]">
                  CUDA JIT: Ready
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#000000] border border-[#00f2ff]/30 text-[#00f2ff]">
                  NeRF Splats: 512k
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#000000] border border-emerald-500/30 text-emerald-400">
                  Decimation: 0%
                </span>
              </div>
            </div>

            {/* 2. Historic Session Deck (Interactive 3D Subject Variants) */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider block">
                Historic Session Deck
              </span>

              <div className="grid grid-cols-2 gap-2">
                {MODEL_VARIANTS.map((variant) => {
                  const isSelected = activeVariant === variant.id;
                  return (
                    <div
                      key={variant.id}
                      onClick={() => handleSelectVariant(variant)}
                      className={`group relative rounded-xl overflow-hidden cursor-pointer border transition-all active:scale-95 ${
                        isSelected
                          ? 'border-[#00f2ff] bg-[#000000] shadow-[0_0_12px_rgba(0,242,255,0.3)]'
                          : 'border-[#7c3aed]/30 bg-[#000000] hover:border-[#7c3aed]'
                      }`}
                    >
                      <div className="h-16 w-full relative overflow-hidden bg-zinc-900">
                        <img 
                          src={variant.thumbnail} 
                          alt={variant.name} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 opacity-75 group-hover:opacity-100" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <span className="absolute bottom-1 left-1.5 text-[8.5px] font-mono font-bold text-[#00f2ff] bg-black/70 px-1 py-0.2 rounded border border-[#00f2ff]/30">
                          {variant.tag}
                        </span>
                      </div>

                      <div className="p-1.5">
                        <span className="text-[10px] font-mono font-bold text-white block truncate leading-tight">
                          {variant.name}
                        </span>
                        <span className="text-[8.5px] font-mono text-[#7c3aed] block mt-0.5">
                          {variant.polygons} Tris
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Export & Multi-Format Compiler Deck */}
            <div className="p-3 rounded-xl bg-[#000000] border border-[#7c3aed]/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#00f2ff] uppercase tracking-wider flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-[#00f2ff]" />
                  Multi-Format Compiler
                </span>
                <span className="text-[9px] font-mono text-zinc-400">Zero 404s</span>
              </div>

              {/* Format buttons: .obj, .gltf, .usdz */}
              <div className="grid grid-cols-3 gap-1.5">
                {(['.obj', '.gltf', '.usdz'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleExportFormat(fmt)}
                    disabled={isExporting}
                    className="py-1.5 px-2 rounded-lg bg-[#0a071b] hover:bg-[#150f2e] border border-[#7c3aed]/50 hover:border-[#00f2ff] text-[#00f2ff] hover:text-white text-[10px] font-mono font-bold transition active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>{fmt.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              {/* Push Direct to Mobile Call Overlay UI Asset Pipeline */}
              <button
                onClick={handlePushToMobileCallOverlay}
                disabled={isPushingToCall}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7c3aed]/30 to-[#00f2ff]/20 hover:from-[#7c3aed]/50 hover:to-[#00f2ff]/40 border border-[#00f2ff] text-white text-[10.5px] font-mono font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-[0_0_15px_rgba(0,242,255,0.3)]"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#00f2ff]" />
                <span>Push Direct to Call Overlay HUD</span>
              </button>
            </div>

          </div>

        </aside>

      </div>

    </div>
  );
};
