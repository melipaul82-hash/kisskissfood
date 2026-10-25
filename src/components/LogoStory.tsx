"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dictionary } from "@/i18n";

// Where each part sits on the logo, in % of the image (left, top, size).
const SPOTS: Record<string, { x: number; y: number; r: number }[]> = {
  toque: [{ x: 47, y: 11, r: 22 }],
  levres: [{ x: 50, y: 46, r: 19 }],
  eclaboussures: [
    { x: 5, y: 50, r: 11 },
    { x: 95, y: 44, r: 11 },
  ],
};

export function LogoStory({ items }: { items: Dictionary["brand"]["items"] }) {
  const [active, setActive] = useState(items[0].key);

  return (
    <div className="logo-story">
      <div className="logo-story-figure">
        <Image src="/brand/logo.png" alt="Logo Kiss Kiss Food" width={940} height={920} sizes="(max-width: 760px) 90vw, 46vw" />
        {SPOTS[active]?.map((s, i) => (
          <span
            key={`${active}-${i}`}
            className="logo-spot"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.r}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
      <ul className="logo-story-list" role="list">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className="logo-story-item"
              aria-pressed={active === item.key}
              onMouseEnter={() => setActive(item.key)}
              onFocus={() => setActive(item.key)}
              onClick={() => setActive(item.key)}
            >
              <span className="logo-story-name">{item.name}</span>
              <span className="logo-story-text">{item.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
