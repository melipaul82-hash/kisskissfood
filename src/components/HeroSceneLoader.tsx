"use client";

import dynamic from "next/dynamic";

// WebGL only runs in the browser, so the scene is loaded on the client after the page is visible.
const HeroScene = dynamic(() => import("./scene/HeroScene"), {
  ssr: false,
  loading: () => <div className="hero-canvas hero-canvas-loading" aria-hidden="true" />,
});

export function HeroSceneLoader({ label }: { label: string }) {
  return <HeroScene label={label} />;
}
