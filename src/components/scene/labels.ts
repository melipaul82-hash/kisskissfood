import * as THREE from "three";

/**
 * Product labels drawn on a 2D canvas at runtime, using the real logo and the site fonts.
 * No nutrition table, barcode or claim is drawn: those must come from the validated packaging.
 */

const DISPLAY = '"Bricolage Grotesque Variable", "Arial Black", sans-serif';

let logoPromise: Promise<HTMLImageElement> | null = null;
function loadLogo() {
  if (!logoPromise) {
    logoPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = "/brand/logo-sm.png";
    });
  }
  return logoPromise;
}

async function fontsReady() {
  try {
    await document.fonts.load(`800 80px ${DISPLAY}`);
  } catch {
    /* the fallback font is fine */
  }
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, size: number) {
  let s = size;
  do {
    ctx.font = `800 ${s}px ${DISPLAY}`;
    s -= 2;
  } while (ctx.measureText(text).width > maxWidth && s > 12);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export type LabelKind = "spices" | "chips" | "drinks";

const THEMES: Record<LabelKind, { bg: string; band: string; text: string; accent: string }> = {
  spices: { bg: "#4a230c", band: "#fc5d00", text: "#fff4e0", accent: "#fcc200" },
  chips: { bg: "#fcc200", band: "#fc5d00", text: "#4a230c", accent: "#fcf767" },
  drinks: { bg: "#fff4e0", band: "#9e0f2b", text: "#4a230c", accent: "#fc5d00" },
};

/** Draws a label and returns it as a texture. `wide` labels wrap around jars and bottles. */
export async function makeLabelTexture(kind: LabelKind, name: string, wide: boolean) {
  await Promise.all([fontsReady(), loadLogo().catch(() => null)]);
  const logo = await loadLogo().catch(() => null);
  const theme = THEMES[kind];

  const W = wide ? 1024 : 640;
  const H = wide ? 512 : 900;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);

  // Splash dots, echoing the splashes around the logo
  ctx.fillStyle = theme.accent;
  const dots = wide
    ? [[90, 90, 18], [930, 120, 14], [860, 420, 22], [140, 400, 12], [300, 60, 9], [720, 470, 10]]
    : [[70, 90, 22], [570, 140, 16], [540, 760, 26], [90, 690, 14], [320, 50, 10]];
  dots.forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 1.6, 0.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Band at the bottom with the product name
  const bandH = wide ? 150 : 230;
  ctx.fillStyle = theme.band;
  ctx.fillRect(0, H - bandH, W, bandH);
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, H - bandH - 10, W, 10);

  // Logo
  if (logo) {
    const lh = wide ? 300 : 440;
    const lw = (logo.width / logo.height) * lh;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.drawImage(logo, (W - lw) / 2, wide ? 18 : 80, lw, lh);
    ctx.restore();
  }

  // Product name
  ctx.fillStyle = kind === "drinks" ? "#fff4e0" : kind === "chips" ? "#fff4e0" : theme.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const maxW = W * 0.84;
  fitText(ctx, name, maxW, wide ? 84 : 92);
  let lines = [name];
  if (ctx.measureText(name).width > maxW) {
    ctx.font = `800 ${wide ? 64 : 76}px ${DISPLAY}`;
    lines = wrapLines(ctx, name, maxW);
  }
  const lineH = parseInt(ctx.font.match(/(\d+)px/)?.[1] || "70", 10) * 1.02;
  const cy = H - bandH / 2 - ((lines.length - 1) * lineH) / 2;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, cy + i * lineH));

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
