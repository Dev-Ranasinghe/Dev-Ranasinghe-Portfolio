// Procedural, seamlessly tiling purple marble: the wallpaper of a thousand homepages.

function lattice(n: number, rand: () => number) {
  const g = new Float32Array(n * n);
  for (let i = 0; i < g.length; i++) g[i] = rand();
  return g;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function marbleTile(size = 200): string {
  const rand = mulberry32(1996);
  const octaves = [4, 8, 16, 32].map((n) => ({ n, g: lattice(n, rand) }));
  const smooth = (t: number) => t * t * (3 - 2 * t);

  const noise = (x: number, y: number) => {
    let sum = 0;
    let amp = 1;
    let norm = 0;
    for (const { n, g } of octaves) {
      const fx = (x / size) * n;
      const fy = (y / size) * n;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = smooth(fx - x0);
      const ty = smooth(fy - y0);
      const at = (i: number, j: number) => g[(((j % n) + n) % n) * n + (((i % n) + n) % n)];
      const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
      const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
      sum += (a + (b - a) * ty) * amp;
      norm += amp;
      amp *= 0.5;
    }
    return sum / norm;
  };

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(size, size);
  const TAU = Math.PI * 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = noise(x, y);
      // integer frequencies keep the sine bands seamless across tile edges
      const m = Math.sin(((x + y) / size) * TAU * 2 + t * 11);
      // broad satin folds, lit from the upper left
      const fold = 0.5 + 0.5 * Math.sin(((x - y) / size) * TAU + t * 7);
      const vein = Math.pow(1 - Math.abs(m), 4);
      const body = 0.3 + t * 0.5 + fold * 0.35;
      const i = (y * size + x) * 4;
      img.data[i] = Math.min(255, 70 * body + 95 * vein + 14);
      img.data[i + 1] = Math.min(255, 10 * body + 34 * vein);
      img.data[i + 2] = Math.min(255, 108 * body + 115 * vein + 20);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}
