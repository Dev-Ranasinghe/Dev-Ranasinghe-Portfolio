// Synthetic "photostream" thumbnails drawn from Dev's actual work: smears, heatmaps, curves.

export type Shot = { title: string; url: string };

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")!] as const;
}

/** The 2006 photo treatment: warm cross-processed tint and a soft vignette. */
function finish(ctx: CanvasRenderingContext2D, s: number) {
  const v = ctx.createRadialGradient(s / 2, s / 2, s * 0.25, s / 2, s / 2, s * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = "rgba(255,200,120,0.08)";
  ctx.fillRect(0, 0, s, s);
}

function smear(s: number, boxes: boolean) {
  const [c, ctx] = canvas(s);
  const r = rng(boxes ? 7 : 3);
  ctx.fillStyle = "#f3e3ea";
  ctx.fillRect(0, 0, s, s);
  const cells: [number, number, number][] = [];
  for (let i = 0; i < 26; i++) cells.push([r() * s, r() * s, 9 + r() * 6]);
  for (const [x, y, rad] of cells) {
    const g = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, rad);
    g.addColorStop(0, "#f7b8c8");
    g.addColorStop(0.7, "#e58aa5");
    g.addColorStop(1, "#c8607f");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  // a few infected cells with dark ring-form parasites
  const infected = cells.slice(0, 4);
  for (const [x, y] of infected) {
    ctx.strokeStyle = "#5b1a6e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 1, y, 3, 0.3, Math.PI * 1.8);
    ctx.stroke();
    ctx.fillStyle = "#3a0a4a";
    ctx.beginPath();
    ctx.arc(x + 3.5, y - 1.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  if (boxes) {
    ctx.lineWidth = 2;
    infected.forEach(([x, y, rad], i) => {
      ctx.strokeStyle = i % 2 ? "#18c018" : "#ffcc00";
      ctx.strokeRect(x - rad - 3, y - rad - 3, rad * 2 + 6, rad * 2 + 6);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillRect(x - rad - 3, y - rad - 12, 30, 9);
      ctx.fillStyle = "#000";
      ctx.font = "bold 7px Verdana";
      ctx.fillText(i % 2 ? "P.v 0.91" : "P.f 0.97", x - rad - 1, y - rad - 5);
    });
  }
  finish(ctx, s);
  return c.toDataURL("image/jpeg", 0.8);
}

function gradcam(s: number) {
  const [c, ctx] = canvas(s);
  ctx.fillStyle = "#e9d6de";
  ctx.fillRect(0, 0, s, s);
  const img = ctx.getImageData(0, 0, s, s);
  const hot = [
    [s * 0.42, s * 0.45, s * 0.22],
    [s * 0.7, s * 0.68, s * 0.14],
  ];
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      let v = 0;
      for (const [hx, hy, hr] of hot) v += Math.exp(-((x - hx) ** 2 + (y - hy) ** 2) / (2 * hr * hr));
      v = Math.min(1, v);
      // jet colormap
      const r = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * v - 3)));
      const g = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * v - 2)));
      const b = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * v - 1)));
      const i = (y * s + x) * 4;
      img.data[i] = img.data[i] * 0.35 + r * 255 * 0.65;
      img.data[i + 1] = img.data[i + 1] * 0.35 + g * 255 * 0.65;
      img.data[i + 2] = img.data[i + 2] * 0.35 + b * 255 * 0.65;
    }
  }
  ctx.putImageData(img, 0, 0);
  finish(ctx, s);
  return c.toDataURL("image/jpeg", 0.8);
}

function lossCurve(s: number) {
  const [c, ctx] = canvas(s);
  ctx.fillStyle = "#fbfbf4";
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = "#dde3ea";
  for (let i = 1; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(10, (s / 6) * i);
    ctx.lineTo(s - 6, (s / 6) * i);
    ctx.stroke();
  }
  const r = rng(11);
  const line = (color: string, offset: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= s - 16; x += 2) {
      const t = x / (s - 16);
      const y = s * 0.12 + s * 0.7 * Math.exp(-4 * t) + offset * t + (r() - 0.5) * 4;
      if (x === 0) ctx.moveTo(10 + x, y);
      else ctx.lineTo(10 + x, y);
    }
    ctx.stroke();
  };
  line("#2a6ad4", 8);
  line("#f07a2a", 18);
  ctx.fillStyle = "#334";
  ctx.font = "bold 8px Verdana";
  ctx.fillText("loss", 12, 12);
  finish(ctx, s);
  return c.toDataURL("image/jpeg", 0.85);
}

function confusion(s: number) {
  const [c, ctx] = canvas(s);
  const n = 6;
  const cell = (s - 12) / n;
  const r = rng(5);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const v = i === j ? 0.75 + r() * 0.25 : r() * 0.12;
      ctx.fillStyle = `rgb(${255 - v * 230},${255 - v * 170},${255 - v * 60})`;
      ctx.fillRect(6 + j * cell, 6 + i * cell, cell - 1, cell - 1);
    }
  }
  finish(ctx, s);
  return c.toDataURL("image/jpeg", 0.85);
}

function terminal(s: number) {
  const [c, ctx] = canvas(s);
  ctx.fillStyle = "#14161c";
  ctx.fillRect(0, 0, s, s);
  const lines = ["$ python train.py", "epoch 12/50", "loss 0.084", "recall 0.94", "fp -15.4%", "saved best.pt"];
  ctx.font = "8px Monaco, monospace";
  lines.forEach((l, i) => {
    ctx.fillStyle = i === 0 ? "#9cd" : i > 2 ? "#7f7" : "#ddd";
    ctx.fillText(l, 6, 14 + i * 12);
  });
  finish(ctx, s);
  return c.toDataURL("image/jpeg", 0.85);
}

export function makePhotostream(size = 96): Shot[] {
  return [
    { title: "blood smear, 100x", url: smear(size, false) },
    { title: "Grad-CAM says: here", url: gradcam(size) },
    { title: "detections w/ CBAM", url: smear(size, true) },
    { title: "loss going down :)", url: lossCurve(size) },
    { title: "16-class confusion", url: confusion(size) },
    { title: "late night training", url: terminal(size) },
  ];
}
