"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { Beignets, type BeignetSpec } from "./Beignets";
import { CristalBox } from "./CristalBox";

const BEIGNETS_FULL: BeignetSpec[] = [
  { position: [-0.8, -1.1, 0.6], scale: 0.4, speed: 0.9, seed: 0.3 },
  { position: [1.45, -1.0, 0.9], scale: 0.36, speed: 1.1, seed: 1.7 },
  { position: [1.75, 0.95, -0.4], scale: 0.3, speed: 0.8, seed: 2.9 },
  { position: [-1.35, 1.15, -0.6], scale: 0.27, speed: 1.2, seed: 4.1 },
  { position: [0.55, -1.45, 1.4], scale: 0.3, speed: 1.0, seed: 5.3 },
  { position: [-0.9, 0.2, 1.3], scale: 0.22, speed: 1.3, seed: 6.6 },
  { position: [2.4, -0.2, -1.2], scale: 0.26, speed: 0.7, seed: 7.2 },
  { position: [-2.3, -0.1, -1.0], scale: 0.24, speed: 0.95, seed: 8.8 },
];
// Fewer beignets on phones, and none low in the middle where the headline sits.
const BEIGNETS_LIGHT = [0, 1, 2, 3, 5].map((i) => BEIGNETS_FULL[i]);

const DROPS: { p: [number, number, number]; s: number; r: number }[] = [
  { p: [-0.95, 1.45, 0.4], s: 0.07, r: 0.6 },
  { p: [1.05, 1.55, 0.3], s: 0.06, r: -0.5 },
  { p: [1.25, -0.25, 1.0], s: 0.05, r: -1.1 },
  { p: [-1.2, -0.35, 1.0], s: 0.055, r: 1.0 },
  { p: [0.2, 1.75, -0.2], s: 0.045, r: 0.1 },
];

function Drops() {
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#fcc200",
        roughness: 0.05,
        metalness: 0.1,
        clearcoat: 1,
        transmission: 0.25,
        thickness: 0.4,
        ior: 1.45,
        emissive: new THREE.Color("#fc5d00"),
        emissiveIntensity: 0.15,
      }),
    []
  );
  return (
    <>
      {DROPS.map((d, i) => (
        <mesh key={i} position={d.p} rotation={[0, 0, d.r]} scale={[d.s, d.s * 1.9, d.s]} material={material}>
          <sphereGeometry args={[1, 24, 24]} />
        </mesh>
      ))}
    </>
  );
}

/**
 * On narrow screens the canvas covers the whole hero, and the products sit in the top part,
 * above the headline. This shifts the scene (and its shadow) so it lands there.
 */
function Layout({ children, ground }: { children: React.ReactNode; ground: React.ReactNode }) {
  const { size, camera } = useThree();
  const narrow = size.width < 760;
  let offset = 0;
  let scale = 1;
  if (narrow) {
    const cam = camera as THREE.PerspectiveCamera;
    const visibleHeight = 2 * cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const vh = typeof window === "undefined" ? 800 : window.innerHeight;
    const pxPerUnit = size.height / visibleHeight;
    // The free zone is between the header (70px) and the text, which starts at 52% of the screen height.
    const targetPx = 70 + vh * 0.25;
    offset = (size.height / 2 - targetPx) / pxPerUnit;
    scale = Math.min(1, (vh * 0.3) / (1.95 * pxPerUnit));
  }
  return (
    <group position={[0, offset, 0]} scale={scale}>
      {children}
      {/* On phones the ground shadow is seen edge-on and draws a line across the text, so it is left out. */}
      {narrow ? null : ground}
    </group>
  );
}

/** Tilts the whole product group toward the pointer and turns it as the page scrolls. */
function Rig({ animate, children }: { animate: boolean; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { size } = useThree();
  const narrow = size.width < 760;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const scroll = Math.min(1.2, window.scrollY / Math.max(1, window.innerHeight));
    const px = animate ? state.pointer.x : 0;
    const py = animate ? state.pointer.y : 0;
    const spin = animate ? state.clock.elapsedTime * 0.18 : 0;
    const targetY = -0.45 + Math.sin(spin) * 0.35 + px * 0.35 + scroll * 2.4;
    const targetX = 0.08 - py * 0.18 + scroll * 0.25;
    const k = 1 - Math.exp(-delta * 4);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, k);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, k);
    g.position.y = THREE.MathUtils.lerp(g.position.y, (narrow ? -0.1 : 0) + scroll * 1.1, k);
  });

  return (
    <group ref={group} position={narrow ? [0, -0.1, 0] : [1.6, 0, 0]} scale={1}>
      {children}
    </group>
  );
}

export default function HeroScene({ label }: { label: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [dpr, setDpr] = useState(1.5);
  const [light, setLight] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    const cores = navigator.hardwareConcurrency || 4;
    setLight(window.innerWidth < 760 || cores <= 4);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    if (wrapper.current) io.observe(wrapper.current);
    return () => {
      mq.removeEventListener("change", onChange);
      io.disconnect();
    };
  }, []);

  const animate = !reduced;

  return (
    <div ref={wrapper} className="hero-canvas" role="img" aria-label={label}>
      <Canvas
        shadows
        dpr={[1, dpr]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0.2, 6.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} color="#fff1d6" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-4, -1, 2]} intensity={18} color="#fcc200" />
        <Suspense fallback={null}>
          <Layout
            ground={
              <ContactShadows position={[0, -1.9, 0]} opacity={0.35} scale={9} blur={2.6} far={3} color="#4a230c" />
            }
          >
          <Rig animate={animate}>
            <Float speed={animate ? 1.4 : 0} rotationIntensity={0.25} floatIntensity={0.6}>
              <CristalBox />
            </Float>
            <Beignets items={light ? BEIGNETS_LIGHT : BEIGNETS_FULL} animate={animate} />
            <Drops />
          </Rig>
          </Layout>
          <Environment resolution={light ? 128 : 256} frames={1}>
            <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} color="#fff6e0" />
            <Lightformer form="rect" intensity={2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#fcc200" />
            <Lightformer form="rect" intensity={1.5} position={[5, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#fc5d00" />
            <Lightformer form="ring" intensity={2} position={[2, 3, 4]} scale={1.5} color="#ffffff" />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
