"use client";

import dynamic from "next/dynamic";
import type { ShelfNames } from "./scene/RangeShelf";

const RangeShelf = dynamic(() => import("./scene/RangeShelf"), {
  ssr: false,
  loading: () => <div className="shelf-canvas" aria-hidden="true" />,
});

export function RangeShelfLoader({ names, label }: { names: ShelfNames; label: string }) {
  return <RangeShelf names={names} label={label} />;
}
