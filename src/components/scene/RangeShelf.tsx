"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { CristalBox } from "./CristalBox";
import { ChipsPouch, DrinkBottle, SpiceJar } from "./Products";

export type ShelfNames = { cristal: string; spices: string; chips: string; drinks: string };

const KEYS = ["cristal", "spices", "chips", "drinks"] as const;

/** One product on the shelf: turns gently, lifts and turns to face you when pointed at or tapped. */
function Slot({
  index,
  position,
  animate,
  active,
  onActivate,
  children,
}: {
  index: number;
  position: [number, number, number];
  animate: boolean;
  active: boolean;
  onActivate: (i: number | null) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-delta * 5);
    const idle = animate ? Math.sin(t * 0.6 + index * 1.3) * 0.5 : 0.25;
    const targetRot = active ? state.pointer.x * 0.6 : idle;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetRot, k);
    const bob = animate ? Math.sin(t * 1.1 + index) * 0.04 : 0;
    g.position.y = THREE.MathUtils.lerp(g.position.y, position[1] + (active ? 0.28 : 0) + bob, k);
    const s = THREE.MathUtils.lerp(g.scale.x, active ? 1.08 : 1, k);
    g.scale.setScalar(s);
  });
  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onActivate(index);
      }}
      onPointerOut={() => onActivate(null)}
      onClick={(e) => {
        e.stopPropagation();
        onActivate(active ? null : index);
      }}
    >
      {children}
    </group>
  );
}

function Shelf({ names, animate }: { names: ShelfNames; animate: boolean }) {
  const { size, camera } = useThree();
  const [active, setActive] = useState<number | null>(null);
  const aspect = size.width / Math.max(1, size.height);
  const grid = aspect < 1.7;

  const positions: [number, number, number][] = grid
    ? [
        [-1.15, 1.05, 0],
        [1.15, 1.05, 0],
        [-1.15, -1.25, 0],
        [1.15, -1.25, 0],
      ]
    : [
        [-3.3, 0, 0],
        [-1.1, 0, 0],
        [1.1, 0, 0],
        [3.3, 0, 0],
      ];

  // Pull the camera back just enough to fit the layout in the frame.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const halfW = grid ? 2.0 : 4.1;
    const halfH = grid ? 2.4 : 1.3;
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const dist = Math.max(halfH / tan, halfW / (tan * aspect)) + 0.2;
    cam.position.set(0, 0.25, dist);
    cam.lookAt(0, grid ? -0.1 : 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, aspect, grid]);

  const items = [
    <group key="c" scale={0.72}>
      <CristalBox />
    </group>,
    <SpiceJar key="s" name={names.spices} />,
    <ChipsPouch key="p" name={names.chips} />,
    <DrinkBottle key="d" name={names.drinks} />,
  ];

  const shadowRows = grid ? [-0.05, -2.35] : [-0.95];

  return (
    <>
      {KEYS.map((k, i) => (
        <Slot key={k} index={i} position={positions[i]} animate={animate} active={active === i} onActivate={setActive}>
          {items[i]}
        </Slot>
      ))}
      {shadowRows.map((y) => (
        <ContactShadows key={y} position={[0, y, 0]} opacity={0.55} scale={grid ? 6 : 11} blur={2.4} far={2} color="#000000" />
      ))}
    </>
  );
}

export default function RangeShelf({ names, label }: { names: ShelfNames; label: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px 0px" });
    if (wrapper.current) io.observe(wrapper.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="shelf-canvas" role="img" aria-label={label}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0.25, 9], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 5, 5]} intensity={2.4} color="#fff1d6" castShadow />
        <pointLight position={[-5, 1, 3]} intensity={22} color="#fcc200" />
        <pointLight position={[5, -1, 3]} intensity={14} color="#fc5d00" />
        <Suspense fallback={null}>
          <Shelf names={names} animate={!reduced} />
          <Environment resolution={128} frames={1}>
            <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[10, 2, 1]} color="#fff6e0" />
            <Lightformer form="rect" intensity={2} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#fcc200" />
            <Lightformer form="rect" intensity={1.5} position={[6, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#fc5d00" />
            <Lightformer form="ring" intensity={2} position={[2, 3, 4]} scale={1.5} color="#ffffff" />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
