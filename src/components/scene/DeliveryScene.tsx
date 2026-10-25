"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { makeBeignetGeometry, makeCrustTexture } from "./Beignets";
import { makeBrandPanel } from "./labels";

/**
 * Restaurant concept: signature dishes packed in Kiss Kiss Food delivery boxes.
 * Everything is modelled in code; every printed surface uses the real logo.
 */

export type DeliveryLabels = { burger: string; jollof: string; beignets: string; bissap: string };

type PanelOpts = Parameters<typeof makeBrandPanel>[0];

function usePanel(opts: PanelOpts) {
  const key = JSON.stringify(opts);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.Texture | null = null;
    makeBrandPanel(JSON.parse(key)).then((t) => {
      if (alive) {
        made = t;
        setTex(t);
      } else t.dispose();
    });
    return () => {
      alive = false;
      made?.dispose();
    };
  }, [key]);
  return tex;
}

const KRAFT = "#f3e2c4";
const CARD = { roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 };

/** Open-top shell made of five thin panels. `front` gets the printed texture on its outer face. */
function Shell({
  w,
  h,
  d,
  t = 0.03,
  color,
  front,
}: {
  w: number;
  h: number;
  d: number;
  t?: number;
  color: string;
  front?: THREE.Texture | null;
}) {
  const plain = useMemo(() => new THREE.MeshPhysicalMaterial({ color, ...CARD }), [color]);
  const inner = useMemo(() => new THREE.MeshStandardMaterial({ color: KRAFT, roughness: 0.9 }), []);
  const printed = useMemo(
    () => (front ? new THREE.MeshPhysicalMaterial({ map: front, ...CARD }) : plain),
    [front, plain]
  );
  // material order for boxes: +x, -x, +y, -y, +z, -z
  const frontMats = [plain, plain, plain, plain, printed, inner];
  const backMats = [plain, plain, plain, plain, inner, plain];
  const sideL = [inner, plain, plain, plain, plain, plain];
  const sideR = [plain, inner, plain, plain, plain, plain];
  return (
    <group>
      <mesh position={[0, t / 2, 0]} material={[plain, plain, inner, plain, plain, plain]} castShadow receiveShadow>
        <boxGeometry args={[w, t, d]} />
      </mesh>
      <mesh position={[0, h / 2, d / 2 - t / 2]} material={frontMats} castShadow>
        <boxGeometry args={[w, h, t]} />
      </mesh>
      <mesh position={[0, h / 2, -d / 2 + t / 2]} material={backMats} castShadow>
        <boxGeometry args={[w, h, t]} />
      </mesh>
      <mesh position={[-w / 2 + t / 2, h / 2, 0]} material={sideL} castShadow>
        <boxGeometry args={[t, h, d - 2 * t]} />
      </mesh>
      <mesh position={[w / 2 - t / 2, h / 2, 0]} material={sideR} castShadow>
        <boxGeometry args={[t, h, d - 2 * t]} />
      </mesh>
    </group>
  );
}

function Burger() {
  const bun = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#d9822f",
        roughness: 0.45,
        clearcoat: 0.6,
        clearcoatRoughness: 0.3,
        sheen: 0.5,
        sheenColor: new THREE.Color("#ffb45c"),
      }),
    []
  );
  const seeds = useMemo(() => {
    const out: { p: [number, number, number]; r: [number, number, number] }[] = [];
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996;
      const rad = 0.08 + 0.3 * Math.sqrt((i + 0.5) / 26);
      const x = Math.cos(a) * rad;
      const z = Math.sin(a) * rad;
      const y = 0.25 * Math.sqrt(Math.max(0, 1 - (rad / 0.45) ** 2)) + 0.005;
      out.push({ p: [x, y, z], r: [Math.PI / 2, 0, a] });
    }
    return out;
  }, []);
  return (
    <group>
      <mesh position={[0, 0.06, 0]} material={bun} castShadow>
        <cylinderGeometry args={[0.42, 0.4, 0.12, 40]} />
      </mesh>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.46, 0.46, 0.1, 40]} />
        <meshStandardMaterial color="#5a2a14" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.215, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.72, 0.02, 0.72]} />
        <meshPhysicalMaterial color="#fcc200" roughness={0.35} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0.245, 0]}>
        <cylinderGeometry args={[0.49, 0.47, 0.035, 14]} />
        <meshStandardMaterial color="#62a531" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.04, 32]} />
        <meshPhysicalMaterial color="#d8341f" roughness={0.3} clearcoat={0.8} />
      </mesh>
      <group position={[0, 0.3, 0]}>
        <mesh material={bun} scale={[1, 0.62, 1]} castShadow>
          <sphereGeometry args={[0.45, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={bun} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.43, 0.02, 40]} />
        </mesh>
        {seeds.map((s, i) => (
          <mesh key={i} position={[s.p[0], s.p[1] * 1.0, s.p[2]]} rotation={s.r} scale={[0.012, 0.024, 0.008]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#fff2d6" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Open clamshell burger box with the burger inside. */
function BurgerBox({ label }: { label: string }) {
  const front = usePanel({ bg: "#fc5d00", accent: "#fcc200", caption: label, captionColor: "#fff4e0", width: 640, height: 512, logoScale: 0.58 });
  const lid = usePanel({ bg: "#fc5d00", accent: "#fcc200", width: 512, height: 512, logoScale: 0.7 });
  const W = 1.25;
  const D = 1.25;
  const H = 0.42;
  const LID = 0.36;
  return (
    <group>
      <Shell w={W} h={H} d={D} color="#fc5d00" front={front} />
      <group position={[0, 0.03, 0]} scale={0.95}>
        <Burger />
      </group>
      {/* lid, hinged on the back edge and opened backwards */}
      {/* Hinge at the back top edge. Closed, the lid would sit on the tray (top at y = LID, walls going down). */}
      <group position={[0, H, -D / 2]} rotation={[-1.95, 0, 0]}>
        <group position={[0, LID, D / 2]} rotation={[Math.PI, 0, 0]}>
          <Shell w={W} h={LID} d={D} color="#fc5d00" />
        </group>
        {/* printed inside of the lid: this is the face you see when the box is open */}
        {lid && (
          <mesh position={[0, LID - 0.032, D / 2]} rotation={[Math.PI / 2, 0, Math.PI]} scale={[1, -1, 1]}>
            <planeGeometry args={[W * 0.86, D * 0.86]} />
            <meshPhysicalMaterial map={lid} {...CARD} />
          </mesh>
        )}
      </group>
    </group>
  );
}

/** Square paper box, wider at the top, printed on all four sides. */
function TaperedBox({
  top,
  bottom,
  h,
  texture,
  color,
}: {
  top: number;
  bottom: number;
  h: number;
  texture: THREE.Texture | null;
  color: string;
}) {
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[top, bottom, h, 4, 1, true, -Math.PI / 4]} />
        {texture ? (
          <meshPhysicalMaterial key="printed" map={texture} {...CARD} flatShading />
        ) : (
          <meshPhysicalMaterial key="plain" color={color} {...CARD} flatShading />
        )}
      </mesh>
      <mesh position={[0, h / 2, 0]} scale={[0.97, 1, 0.97]}>
        <cylinderGeometry args={[top, bottom, h, 4, 1, true, -Math.PI / 4]} />
        <meshStandardMaterial color={KRAFT} roughness={0.9} side={THREE.BackSide} flatShading />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[bottom * 1.41, bottom * 1.41]} />
        <meshStandardMaterial color={KRAFT} />
      </mesh>
    </group>
  );
}

function JollofBox({ label }: { label: string }) {
  const tex = usePanel({ bg: "#fcc200", accent: "#fc5d00", caption: label, captionColor: "#4a230c", panels: 4, width: 512, height: 420, logoScale: 0.6 });
  const TOP = 0.66;
  const BOTTOM = 0.5;
  const H = 0.62;
  const half = (TOP / Math.SQRT2) * 0.93; // inner half-width at the rim
  const grains = useMemo(() => {
    const count = 1400;
    const geo = new THREE.SphereGeometry(1, 6, 4);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.55 });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const palette = ["#d9481c", "#e8622a", "#c63c16", "#ef7a35", "#b8361a"].map((c) => new THREE.Color(c));
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      const x = (rnd() * 2 - 1) * half;
      const z = (rnd() * 2 - 1) * half;
      const r2 = (x * x + z * z) / (half * half * 2);
      const y = H - 0.02 + 0.16 * (1 - r2) + rnd() * 0.03;
      e.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(0.018, 0.018, 0.048));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, palette[i % palette.length]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, [half]);
  const plantains: [number, number, number, number][] = [
    [0.18, 0.12, 0.1, 0.4],
    [0.3, -0.05, -0.25, -0.3],
    [0.08, 0.27, 0.35, 0.2],
    [-0.12, -0.25, 0.3, 0.5],
  ];
  return (
    <group>
      <TaperedBox top={TOP} bottom={BOTTOM} h={H} texture={tex} color="#fcc200" />
      {/* rice bed under the visible grains */}
      <mesh position={[0, H - 0.05, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.4, 1]}>
        <sphereGeometry args={[half * 1.38, 4, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c9441b" roughness={0.9} flatShading />
      </mesh>
      <primitive object={grains} />
      {plantains.map(([x, z, ry, rx], i) => (
        <mesh key={i} position={[x, H + 0.14, z]} rotation={[rx, ry, 0.2]} scale={[1.5, 1, 1]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.045, 24]} />
          <meshPhysicalMaterial color="#e09a2c" roughness={0.4} clearcoat={0.7} />
        </mesh>
      ))}
      {[
        [-0.2, 0.05],
        [0.0, -0.18],
        [-0.05, 0.2],
      ].map(([x, z], i) => (
        <mesh key={`h${i}`} position={[x, H + 0.17, z]} rotation={[0.4, i, 0]}>
          <sphereGeometry args={[0.035, 6, 4]} />
          <meshStandardMaterial color="#3f8f2a" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function BeignetBox({ label }: { label: string }) {
  const tex = usePanel({ bg: "#4a230c", accent: "#fc5d00", caption: label, captionColor: "#fcc200", panels: 4, width: 512, height: 440, logoScale: 0.6 });
  const geos = useMemo(() => [0, 1, 2].map((s) => makeBeignetGeometry(s * 3.7 + 1)), []);
  const crust = useMemo(() => makeCrustTexture(), []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.5,
        bumpMap: crust,
        bumpScale: 0.2,
        sheen: 0.6,
        sheenColor: new THREE.Color("#ffb347"),
        clearcoat: 0.25,
      }),
    [crust]
  );
  const H = 0.5;
  const balls: [number, number, number, number][] = [
    [-0.15, H + 0.02, -0.12, 0.17],
    [0.17, H + 0.02, -0.1, 0.16],
    [0.0, H + 0.02, 0.16, 0.17],
    [-0.18, H + 0.03, 0.17, 0.15],
    [0.19, H + 0.03, 0.18, 0.15],
    [0.0, H + 0.2, 0.0, 0.17],
    [-0.08, H + 0.18, -0.2, 0.14],
  ];
  return (
    <group>
      <TaperedBox top={0.56} bottom={0.42} h={H} texture={tex} color="#4a230c" />
      {balls.map(([x, y, z, s], i) => (
        <mesh key={i} geometry={geos[i % 3]} material={mat} position={[x, y, z]} scale={s} rotation={[i, i * 2, 0]} castShadow />
      ))}
    </group>
  );
}

function BissapCup() {
  const tex = usePanel({ bg: "#fff4e0", accent: "#9e0f2b", panels: 2, width: 512, height: 640, logoScale: 0.6 });
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.31, 0.24, 0.9, 48, 1, false, Math.PI / 2]} />
        {tex ? (
          <meshPhysicalMaterial key="printed" map={tex} {...CARD} />
        ) : (
          <meshPhysicalMaterial key="plain" color="#fff4e0" {...CARD} />
        )}
      </mesh>
      {/* bissap visible through the clear lid */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 48]} />
        <meshPhysicalMaterial color="#8c0c25" roughness={0.1} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.91, 0]} scale={[1, 0.38, 1]}>
        <sphereGeometry args={[0.32, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#ffffff" transmission={1} roughness={0.05} thickness={0.05} ior={1.4} />
      </mesh>
      <mesh position={[0.06, 1.2, 0.02]} rotation={[0, 0, -0.18]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.75, 16]} />
        <meshPhysicalMaterial color="#fc5d00" roughness={0.3} clearcoat={1} />
      </mesh>
    </group>
  );
}

/** Paper delivery bag with handles. */
function DeliveryBag() {
  const front = usePanel({
    bg: "#fc5d00",
    accent: "#fcc200",
    caption: "Le goût qui vous fait craquer !",
    captionColor: "#fff4e0",
    width: 560,
    height: 720,
    logoScale: 0.6,
  });
  const W = 1.45;
  const H = 1.85;
  const D = 0.8;
  const plain = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#fc5d00", ...CARD }), []);
  const printed = useMemo(
    () => (front ? new THREE.MeshPhysicalMaterial({ map: front, ...CARD }) : plain),
    [front, plain]
  );
  return (
    <group>
      <mesh position={[0, H / 2, 0]} material={[plain, plain, plain, plain, printed, plain]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
      </mesh>
      {[0.2, -0.2].map((z) => (
        <mesh key={z} position={[0, H, z]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.32, 0.03, 12, 40, Math.PI]} />
          <meshStandardMaterial color="#4a230c" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Composition({ labels, animate }: { labels: DeliveryLabels; animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { size, camera } = useThree();
  const aspect = size.width / Math.max(1, size.height);

  // Fit the whole set in the frame, whatever the screen width.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const halfW = 2.95;
    const halfH = 1.25;
    const dist = Math.max(halfH / tan, halfW / (tan * aspect)) + 0.5;
    const dir = new THREE.Vector3(0, 0.45, 1).normalize();
    cam.position.copy(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, 0.95, 0));
    cam.lookAt(0, 0.95, 0);
    cam.updateProjectionMatrix();
  }, [camera, aspect]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.exp(-delta * 3);
    const sway = animate ? Math.sin(state.clock.elapsedTime * 0.35) * 0.12 : 0;
    const target = sway + (animate ? state.pointer.x * 0.25 : 0);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, target, k);
  });

  return (
    <group ref={group}>
      <group position={[-0.35, 0, -1.25]} rotation={[0, 0.12, 0]}>
        <DeliveryBag />
      </group>
      <group position={[-1.75, 0, 0.15]} rotation={[0, 0.45, 0]}>
        <BurgerBox label={labels.burger} />
      </group>
      <group position={[0.15, 0, 0.55]} rotation={[0, -0.12, 0]}>
        <JollofBox label={labels.jollof} />
      </group>
      <group position={[1.55, 0, 0.0]} rotation={[0, -0.4, 0]}>
        <BeignetBox label={labels.beignets} />
      </group>
      <group position={[2.45, 0, -0.95]}>
        <BissapCup />
      </group>
      <ContactShadows position={[0, 0.001, 0]} opacity={0.45} scale={10} blur={2.2} far={2.5} color="#4a230c" />
    </group>
  );
}

export default function DeliveryScene({ labels, label }: { labels: DeliveryLabels; label: string }) {
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
    <div ref={wrapper} className="delivery-canvas" role="img" aria-label={label}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 3, 8], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 6, 4]} intensity={2.3} color="#fff1d6" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-4, 2, 3]} intensity={16} color="#fcc200" />
        <Suspense fallback={null}>
          <Composition labels={labels} animate={!reduced} />
          <Environment resolution={128} frames={1}>
            <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[10, 2, 1]} color="#fff6e0" />
            <Lightformer form="rect" intensity={1.6} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#fcc200" />
            <Lightformer form="rect" intensity={1.2} position={[6, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} color="#fc5d00" />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
