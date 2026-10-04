// Original "Nomai-style" spiral writing: a log spiral with a few short side branches.
export function nomaiSpiral(cx, cy, turns = 2.6, scale = 3, branches = 5) {
  const pts = [];
  const steps = Math.round(turns * 48);
  for (let i = 0; i <= steps; i++) {
    const th = (i / 48) * Math.PI * 2;
    const r = scale * Math.exp(0.22 * th);
    pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]);
  }
  let d = 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
  for (let b = 1; b <= branches; b++) {
    const [x, y] = pts[Math.floor((pts.length * b) / (branches + 1))];
    const ang = Math.atan2(y - cy, x - cx) + 0.9;
    const len = 6 + b * 2;
    d += `M${x.toFixed(1)} ${y.toFixed(1)}q${(Math.cos(ang) * len).toFixed(1)} ${(Math.sin(ang) * len).toFixed(1)} ${(Math.cos(ang + 0.8) * len * 1.4).toFixed(1)} ${(Math.sin(ang + 0.8) * len * 1.4).toFixed(1)}`;
  }
  return d;
}
