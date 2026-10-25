"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { makeLabelTexture, type LabelKind } from "./labels";

function useLabel(kind: LabelKind, name: string, wide: boolean) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.Texture | null = null;
    makeLabelTexture(kind, name, wide).then((t) => {
      if (alive) {
        made = t;
        setTex(t);
      } else t.dispose();
    });
    return () => {
      alive = false;
      made?.dispose();
    };
  }, [kind, name, wide]);
  return tex;
}

/** Glass spice jar with an orange lid and a wrap-around label. About 1.4 units tall. */
export function SpiceJar({ name }: { name: string }) {
  const label = useLabel("spices", name, true);
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        roughness: 0.04,
        transmission: 1,
        thickness: 0.25,
        ior: 1.5,
        clearcoat: 1,
      }),
    []
  );
  const LABEL_ARC = 3.3;
  return (
    <group position={[0, -0.12, 0]}>
      <mesh material={glass} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.1, 64]} />
      </mesh>
      {/* the spice blend inside */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.465, 0.465, 0.98, 48]} />
        <meshStandardMaterial color="#b8461a" roughness={1} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.53, 0.53, 0.3, 64]} />
        <meshPhysicalMaterial color="#fc5d00" roughness={0.3} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      {label && (
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.507, 0.507, 0.74, 64, 1, true, -LABEL_ARC / 2, LABEL_ARC]} />
          <meshPhysicalMaterial map={label} roughness={0.35} clearcoat={0.6} side={THREE.FrontSide} />
        </mesh>
      )}
    </group>
  );
}

/** Pillow-shaped snack pouch with crimped ends. */
export function ChipsPouch({ name }: { name: string }) {
  const label = useLabel("chips", name, false);
  const geometry = useMemo(() => {
    const w = 1.15;
    const h = 1.62;
    const geo = new THREE.PlaneGeometry(w, h, 48, 48);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) / w + 0.5;
      const v = pos.getY(i) / h + 0.5;
      const crimp = v > 0.93 || v < 0.07 ? 0.04 : 1;
      const su = Math.max(0, Math.sin(Math.PI * u));
      const sv = Math.max(0, Math.sin(Math.PI * v));
      const bulge = 0.2 * Math.pow(su, 0.6) * Math.pow(sv, 0.45) * crimp;
      // the bag pinches in slightly at the sides when it is full
      pos.setX(i, pos.getX(i) * (1 - 0.05 * Math.sin(Math.PI * v)));
      pos.setZ(i, bulge + 0.005);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  const foil = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#fcc200",
        roughness: 0.28,
        metalness: 0.15,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
      }),
    []
  );
  return (
    <group>
      <mesh geometry={geometry} castShadow>
        {label ? (
          <meshPhysicalMaterial map={label} roughness={0.28} clearcoat={1} clearcoatRoughness={0.1} metalness={0.1} />
        ) : (
          <primitive object={foil} attach="material" />
        )}
      </mesh>
      <mesh geometry={geometry} material={foil} rotation={[0, Math.PI, 0]} castShadow />
      {[0.79, -0.79].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[1.15, 0.07, 0.03]} />
          <meshPhysicalMaterial color="#fc5d00" roughness={0.4} clearcoat={1} />
        </mesh>
      ))}
    </group>
  );
}

/** Bissap-red glass bottle with a gold cap and a wrap-around label. */
export function DrinkBottle({ name }: { name: string }) {
  const label = useLabel("drinks", name, true);
  const geometry = useMemo(() => {
    const profile: [number, number][] = [
      [0, 0],
      [0.36, 0],
      [0.4, 0.05],
      [0.41, 0.15],
      [0.41, 1.0],
      [0.39, 1.12],
      [0.3, 1.28],
      [0.19, 1.42],
      [0.16, 1.55],
      [0.16, 1.7],
      [0.18, 1.72],
      [0, 1.72],
    ];
    return new THREE.LatheGeometry(
      profile.map(([x, y]) => new THREE.Vector2(x, y)),
      64
    );
  }, []);
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#d01a3c",
        roughness: 0.06,
        transmission: 0.85,
        thickness: 0.9,
        ior: 1.5,
        attenuationColor: new THREE.Color("#6e0718"),
        attenuationDistance: 0.5,
        clearcoat: 1,
      }),
    []
  );
  const LABEL_ARC = 3.4;
  return (
    <group position={[0, -0.86, 0]}>
      <mesh geometry={geometry} material={glass} castShadow />
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.19, 0.19, 0.2, 32]} />
        <meshStandardMaterial color="#fcc200" metalness={0.8} roughness={0.25} />
      </mesh>
      {label && (
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.415, 0.415, 0.66, 64, 1, true, -LABEL_ARC / 2, LABEL_ARC]} />
          <meshPhysicalMaterial map={label} roughness={0.35} clearcoat={0.5} />
        </mesh>
      )}
    </group>
  );
}
