"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/** The 375 g Cristal box. Proportions follow the packaging mockup. */
export function CristalBox() {
  const [front, side, top] = useTexture([
    "/brand/box-front.jpg",
    "/brand/box-side.jpg",
    "/brand/box-top.jpg",
  ]);

  const materials = useMemo(() => {
    [front, side, top].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
    const make = (map: THREE.Texture) =>
      new THREE.MeshPhysicalMaterial({
        map,
        roughness: 0.38,
        clearcoat: 0.9,
        clearcoatRoughness: 0.18,
        sheen: 0.2,
      });
    const f = make(front);
    const s = make(side);
    const t = make(top);
    // order: +x, -x, +y, -y, +z, -z
    return [s, s, t, t, f, f];
  }, [front, side, top]);

  return (
    <mesh material={materials} castShadow>
      <boxGeometry args={[1.3, 1.95, 0.52]} />
    </mesh>
  );
}
