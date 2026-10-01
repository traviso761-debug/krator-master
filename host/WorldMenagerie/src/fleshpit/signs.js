// ---------- the park's lettering ----------
// Every sign in the park was a blank brown box until this file: the right shape in the right place, saying
// nothing. The whole joke of the place is in what the signs say - the Park Service's calm, level voice,
// telling you to hold the handrail while the wall breathes - so they are lettered now, on canvas, in this
// project's own words. Nothing here copies the Park Service's arrowhead or anyone's artwork.
//
// A texture is cached by its words and style, so the same sign on two decks is one upload.
const CACHE = new Map();

// the styles: [board, legend, rule]. 'nps' is the brown-and-cream of a park sign, 'warn' the yellow of a
// safety notice, 'company' Anodyne's white and red, 'night' the red of the emergency boards.
const STYLE = {
  nps: ['#5a3f2c', '#f1e4c4', '#c9b58c'],
  warn: ['#e2b23a', '#1d1812', '#1d1812'],
  company: ['#efe9dc', '#a8281f', '#a8281f'],
  night: ['#3a0c0c', '#ff6b4a', '#ff6b4a'],
};

// A board: one or two lines, the first big and the second small, with a rule round the edge.
export function signTexture(THREE, lines, style = 'nps', w = 512, h = 256) {
  const key = String(style) + '|' + w + 'x' + h + '|' + lines.join('\n');
  if (CACHE.has(key)) return CACHE.get(key);
  const [bg, fg, rule] = Array.isArray(style) ? style : (STYLE[style] || STYLE.nps);   // or [board, legend, rule]
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = rule; g.lineWidth = Math.max(4, h * 0.03);
  const m = h * 0.07; g.strokeRect(m, m, w - 2 * m, h - 2 * m);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  const [a, b] = lines;
  const fit = (t, size, font) => {                 // shrink a line until it fits inside the rule
    let s = size; g.font = font(s);
    while (s > 8 && g.measureText(t).width > w - 4 * m) { s -= 2; g.font = font(s); }
  };
  const serif = s => `bold ${s}px Georgia, 'Times New Roman', serif`;
  const sans = s => `${s}px 'Helvetica Neue', Arial, sans-serif`;
  if (a) { fit(a, Math.round(h * (b ? 0.26 : 0.34)), serif); g.fillText(a, w / 2, b ? h * 0.40 : h / 2); }
  if (b) { fit(b, Math.round(h * 0.14), sans); g.fillText(b, w / 2, h * 0.70); }
  // weather: a little grime, so the boards do not read as printed yesterday
  for (let k = 0; k < 40; k++) {
    g.fillStyle = `rgba(20,10,5,${(0.02 + ((k * 7919) % 97) / 97 * 0.05).toFixed(3)})`;
    g.fillRect(((k * 4271) % w), ((k * 2713) % h), 6 + (k % 9) * 4, 2 + (k % 5) * 3);
  }
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
  CACHE.set(key, t);
  return t;
}

// A board as a mesh: a thin box whose front (+z) face carries the lettering. lit=true makes it self-lit,
// which is what a sign three kilometres underground has to be if anyone is going to read it.
export function signBoard(THREE, lines, { style = 'nps', w = 4, h = 2, lit = true, depth = 0.25 } = {}) {
  const tex = signTexture(THREE, lines, style, 512, Math.round(512 * h / w));
  const face = lit ? new THREE.MeshBasicMaterial({ map: tex, color: 0xdcd2c0 }) : new THREE.MeshLambertMaterial({ map: tex });
  const edge = new THREE.MeshLambertMaterial({ color: (Array.isArray(style) ? style : (STYLE[style] || STYLE.nps))[0] });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), [edge, edge, edge, edge, face, edge]);
  m.userData.face = face;
  return m;
}

// the angle that turns a board's front to face a point (a sign on the wall facing the axis, say)
export const faceTowards = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
