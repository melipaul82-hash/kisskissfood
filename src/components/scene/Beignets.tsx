"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Cheap deterministic value noise, good enough for a lumpy fried-dough surface. */
function lump(x: number, y: number, z: number, seed: number) {
  return (
    Math.sin(x * 3.1 + seed) * Math.cos(y * 2.7 + seed * 1.3) * 0.5 +
    Math.sin(y * 5.3 + z * 4.1 + seed * 2.1) * 0.25 +
    Math.sin(z * 9.7 + x * 7.9 + seed * 0.7) * 0.12 +
    Math.sin(x * 17.0 + y * 13.0 + z * 15.0 + seed) * 0.05
  );
}

export function makeBeignetGeometry(seed: number) {
  const geo = new THREE.IcosahedronGeometry(1, 24);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  const deep = new THREE.Color("#9c3f0a");
  const golden = new THREE.Color("#e98a2c");
  const pale = new THREE.Color("#f6b45a");
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = lump(v.x, v.y, v.z, seed);
    const r = 1 + n * 0.09;
    v.multiplyScalar(r);
    v.y *= 0.93;
    pos.setXYZ(i, v.x, v.y, v.z);
    const t = THREE.MathUtils.clamp((n + 0.6) / 1.2, 0, 1);
    c.copy(deep).lerp(golden, t);
    if (t > 0.75) c.lerp(pale, (t - 0.75) * 2);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Fine crust bump texture, generated once on the client. */
export function makeCrustTexture() {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const v = 150 + Math.random() * 105;
    data.set([v, v, v, 255], i * 4);
  }
  const tex = new THREE.DataTexture(data, size, size);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.needsUpdate = true;
  return tex;
}

export type BeignetSpec = {
  position: [number, number, number];
  scale: number;
  speed: number;
  seed: number;
};

export function Beignets({ items, animate }: { items: BeignetSpec[]; animate: boolean }) {
  const geometries = useMemo(() => [0, 1, 2].map((s) => makeBeignetGeometry(s * 3.7 + 1)), []);
  const crust = useMemo(() => makeCrustTexture(), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.48,
        bumpMap: crust,
        bumpScale: 0.22,
        sheen: 0.6,
        sheenColor: new THREE.Color("#ffb347"),
        sheenRoughness: 0.5,
        clearcoat: 0.25,
        clearcoatRoughness: 0.6,
      }),
    [crust]
  );
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!animate || !group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const spec = items[i];
      child.position.y = spec.position[1] + Math.sin(t * spec.speed + spec.seed) * 0.12;
      child.rotation.x = t * 0.15 * spec.speed + spec.seed;
      child.rotation.y = t * 0.2 * spec.speed;
    });
  });

  return (
    <group ref={group}>
      {items.map((b, i) => (
        <mesh
          key={i}
          geometry={geometries[i % geometries.length]}
          material={material}
          position={b.position}
          scale={b.scale}
          rotation={[b.seed, b.seed * 2, 0]}
          castShadow
        />
      ))}
    </group>
  );
}
