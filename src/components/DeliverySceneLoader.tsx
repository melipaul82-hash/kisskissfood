"use client";

import dynamic from "next/dynamic";
import type { DeliveryLabels } from "./scene/DeliveryScene";

const DeliveryScene = dynamic(() => import("./scene/DeliveryScene"), {
  ssr: false,
  loading: () => <div className="delivery-canvas" aria-hidden="true" />,
});

export function DeliverySceneLoader({ labels, label }: { labels: DeliveryLabels; label: string }) {
  return <DeliveryScene labels={labels} label={label} />;
}
