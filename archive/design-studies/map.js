import { hash, pen, drawTerrain, drawObject, drawLandmark } from './art';

// One screen. 32 x 24 tiles of 16 px = 512 x 384 art pixels, scaled to fit whatever viewport there is.
export const T = 16;
export const W = 32;
export const H = 24;
export const MAP_W = W * T;
export const MAP_H = H * T;
const CX = 16;
const CY = 12;

// Where each entity lives. x, y = top-left tile; w, h = footprint in tiles.
// stand = the tile the frog waits on (default: below the door); face = which way it looks there.
export const PLACES = {
  home: { x: 11, y: 9, w: 3, h: 3, sprite: 'house-green' },
  library: { x: 18, y: 9, w: 3, h: 3, sprite: 'library' },
  job: { x: 14, y: 13, w: 1, h: 1, sprite: 'board' },

  isu: { x: 3, y: 2, w: 3, h: 3, sprite: 'lab' },
  phd: { x: 10, y: 3, w: 2, h: 2, sprite: 'boss' },
  sunwoda: { x: 2, y: 8, w: 3, h: 3, sprite: 'mine' },
  patents: { x: 7, y: 9, w: 1, h: 1, sprite: 'chest' },

  seagate: { x: 25, y: 6, w: 3, h: 3, sprite: 'tower-light' },

  amiibot: { x: 23, y: 13, w: 3, h: 3, sprite: 'house-blue' },
  totk: { x: 17, y: 17, w: 3, h: 3, sprite: 'house' },
  ling: { x: 21, y: 18, w: 3, h: 3, sprite: 'house-boarded' },
  naiive: { x: 26, y: 18, w: 3, h: 3, sprite: 'forge' },
  dpmetal: { x: 28, y: 14, w: 2, h: 2, sprite: 'boss', stand: [27, 15], face: 'right' },
  typeshi: { x: 26, y: 13, w: 1, h: 1, sprite: 'board-side', stand: [27, 13], face: 'left' },
  trajview: { x: 19, y: 15, w: 1, h: 1, sprite: 'board-side', stand: [18, 15], face: 'right' },
  laneloaf: { x: 28, y: 11, w: 1, h: 1, sprite: 'board-side' },
  gas: { x: 20, y: 20, w: 1, h: 1, sprite: 'board-side' },
  fuji: { x: 24, y: 20, w: 1, h: 1, sprite: 'board-side' },

  slop: { x: 3, y: 14, w: 3, h: 3, sprite: 'tower-slop' },
  dshslop: { x: 10, y: 18, w: 2, h: 2, sprite: 'boss', stand: [12, 19], face: 'left' },
  gradbench: { x: 13, y: 17, w: 1, h: 1, sprite: 'board-side' },
};

// Mario-World style paths: [x1, y1, x2, y2] straight segments.
const ROADS = [
  [2, 12, 29, 12], [16, 2, 16, 21],
  [4, 5, 20, 5], [3, 11, 3, 12], [7, 10, 7, 12], [26, 9, 26, 12],
  [14, 13, 14, 14],
  [24, 13, 24, 16], [18, 13, 18, 20], [18, 21, 27, 21], [27, 13, 27, 15],
  [4, 13, 4, 20], [12, 19, 15, 19], [13, 18, 13, 18],
];

// Biome name anchors in art pixels, plus which corner the label hangs from.
export const LABELS = {
  battery: { x: 10, y: 8, align: 'left' },
  crystal: { x: MAP_W - 10, y: 8, align: 'right' },
  swamp: { x: 10, y: MAP_H - 8, align: 'left', v: 'bottom' },
  orchard: { x: MAP_W - 10, y: MAP_H - 8, align: 'right', v: 'bottom' },
  ames: { x: CX * T, y: 7.6 * T, align: 'center' },
};

// Where the frog stands for a place, in art pixels (feet).
export function standOf(id) {
  const p = PLACES[id];
  const [tx, ty] = p.stand ?? [p.x + Math.floor(p.w / 2), p.y + p.h];
  return { x: (tx + 0.5) * T, y: (ty + 1) * T - 2 };
}

// Clickable box of a place, in art pixels. Small sprites get a bigger target.
export function hotbox(id) {
  const p = PLACES[id];
  let x = p.x * T;
  let y = p.y * T;
  let w = p.w * T;
  let h = p.h * T;
  if (p.w === 1) { x -= 7; y -= 9; w += 14; h += 14; }
  if (p.w === 2) { x -= 2; y -= 8; w += 4; h += 10; }
  return { x, y, w, h };
}

const smooth = (x, y, s, k = 3) => {
  let v = 0;
  for (let i = 0; i < k; i++) v += hash(Math.floor((x + i * 1.7) / 3), Math.floor((y + i * 2.3) / 3), s + i);
  return v / k;
};

const near = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;

export function biomeAt(x, y) {
  // Ames is a rounded block in the middle.
  const dx = Math.abs((x + 0.5 - CX) / 7);
  const dy = Math.abs((y + 0.5 - CY) / 4.5);
  if (dx ** 3 + dy ** 3 < 1) return 'ames';
  // Wobble the quadrant borders a little so they don't look ruled.
  const wx = x + Math.round((hash(0, y, 7) - 0.5) * 2);
  const wy = y + Math.round((hash(x, 0, 8) - 0.5) * 2);
  if (wx < CX && wy < CY) return 'battery';
  if (wx >= CX && wy < CY) return 'crystal';
  if (wx >= CX && wy >= CY) return 'orchard';
  return 'swamp';
}

const isForge = (x, y) => (x >= 26 && y >= 13) || (x >= 25 && y >= 17);

export function buildWorld() {
  const terrain = new Array(W * H);
  const objects = new Array(W * H).fill(null);
  const biome = new Array(W * H);
  const owner = new Array(W * H).fill(null);
  const idx = (x, y) => y * W + x;

  // ---- base terrain per biome
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const b = biomeAt(x, y);
      biome[idx(x, y)] = b;
      let t = 'grass';
      if (b === 'battery') {
        t = 'sand';
        const coast = 1 + Math.round(smooth(0, y, 21) * 1.6);
        const top = 1 + Math.round(smooth(x, 0, 22) * 1.4);
        if (x < coast || y < top) t = 'water';
        else if ((x < coast + 1 || y < top + 1) && hash(x, y, 23) > 0.55) t = 'marsh';
        if (near(x, y, 4, 3, 4.4) && !near(x, y, 4, 3, 2.3)) t = smooth(x, y, 2, 2) > 0.56 ? 'marsh' : 'grass';
        if (x >= 1 && near(x, y, 3, 9.5, 3.3)) t = 'quarry';
      } else if (b === 'crystal') {
        t = 'meadow';
      } else if (b === 'orchard') {
        t = isForge(x, y) ? 'forge' : 'lawn';
      } else if (b === 'swamp') {
        t = 'mud';
        const pool = hash(x >> 1, y >> 1, 3) > 0.74 && hash(x, y, 13) > 0.2;
        const clear = near(x, y, 4, 15, 3.2) || near(x, y, 11, 18.5, 2.6) || near(x, y, 13, 17, 1.6) || near(x, y, 5, 20, 1.6);
        if (pool && !clear) t = 'swampwater';
      } else if (b === 'ames') {
        t = 'grass';
        const plaza = x >= 14 && x <= 18 && y >= 11 && y <= 14;
        const field = (y <= 8 || y >= 15) && Math.abs(x - CX) > 1 && hash(x >> 1, y >> 1, 4) > 0.3;
        if (plaza) t = 'plaza';
        else if (field) t = 'corn';
      }
      terrain[idx(x, y)] = t;
    }
  }
  // Lava pools in the Metal Forge.
  for (const [lx, ly] of [[29, 17], [29, 18], [30, 18], [25, 18], [28, 13]]) terrain[idx(lx, ly)] = 'lava';

  // ---- paths
  const carve = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    terrain[idx(x, y)] = 'path';
    objects[idx(x, y)] = null;
  };
  for (const [x1, y1, x2, y2] of ROADS) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) carve(x, y);
  }

  // ---- map edge: a ring of whatever grows in that biome
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const ring = x < 1 || y < 1 || x >= W - 1 || y >= H - 1;
      const second = !ring && (x < 2 || y < 2 || x >= W - 2 || y >= H - 2) && hash(x, y, 6) > 0.55;
      if (!ring && !second) continue;
      const b = biome[idx(x, y)];
      const t = terrain[idx(x, y)];
      if (t === 'path' && !ring) continue;
      if (b === 'battery') terrain[idx(x, y)] = 'water';
      else if (b === 'crystal') objects[idx(x, y)] = hash(x, y, 5) > 0.5 ? 'rock' : 'pine';
      else if (b === 'orchard') objects[idx(x, y)] = t === 'forge' || t === 'lava' ? 'rock' : 'tree';
      else if (b === 'swamp') objects[idx(x, y)] = hash(x, y, 5) > 0.4 ? 'dead' : 'mushroom';
      else objects[idx(x, y)] = 'tree';
      if (objects[idx(x, y)] && t === 'lava') terrain[idx(x, y)] = 'forge';
      if (objects[idx(x, y)] && (t === 'water' || t === 'swampwater')) terrain[idx(x, y)] = b === 'swamp' ? 'mud' : 'grass';
    }
  }

  // ---- footprints
  const reserved = new Set();
  for (const [id, p] of Object.entries(PLACES)) {
    for (let y = p.y - 1; y <= p.y + p.h; y++)
      for (let x = p.x - 1; x <= p.x + p.w; x++) reserved.add(idx(x, y));
    for (let y = p.y; y < p.y + p.h; y++)
      for (let x = p.x; x < p.x + p.w; x++) {
        owner[idx(x, y)] = id;
        objects[idx(x, y)] = null;
        const t = terrain[idx(x, y)];
        if (t === 'water' || t === 'marsh' || t === 'corn' || t === 'swampwater' || t === 'lava') terrain[idx(x, y)] = p.sprite === 'boss' && biome[idx(x, y)] === 'orchard' ? 'forge' : 'grass';
      }
    const [sx, sy] = p.stand ?? [p.x + Math.floor(p.w / 2), p.y + p.h];
    if (terrain[idx(sx, sy)] !== 'path') carve(sx, sy);
    reserved.add(idx(sx, sy));
  }

  // ---- decoration
  const LIQUID = new Set(['water', 'marsh', 'swampwater', 'lava', 'corn', 'path', 'plaza']);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = idx(x, y);
      if (objects[i] || owner[i] || reserved.has(i)) continue;
      const t = terrain[i];
      if (LIQUID.has(t)) continue;
      const r = hash(x, y, 11);
      const b = biome[i];
      let o = null;
      if (b === 'battery') {
        if (t === 'grass' && r > 0.6) o = 'glass';
        else if (t === 'quarry' && r > 0.7) o = 'ore';
        else if (t === 'sand' && r > 0.94) o = 'coin';
        else if (t === 'sand' && r > 0.88) o = 'shell';
        else if (t === 'sand' && r > 0.84) o = 'rock';
      } else if (b === 'crystal') {
        if (r > 0.84) o = 'crystal';
        else if (r > 0.74) o = 'pine';
        else if (r > 0.68) o = 'rock';
        else if (r > 0.62) o = 'flower';
      } else if (b === 'orchard') {
        if (t === 'forge') o = r > 0.86 ? 'rock' : null;
        else if (smooth(x, y, 31, 2) > 0.5 && r > 0.3) o = 'apple';
        else if (r > 0.82) o = 'flower';
      } else if (b === 'swamp') {
        if (r > 0.86) o = 'mushroom';
        else if (r > 0.76) o = 'dead';
      } else if (b === 'ames') {
        if (r > 0.88) o = 'flower';
      }
      objects[i] = o;
    }
  }

  return { terrain, objects, biome, owner };
}

// Pre-render the static map (two frames, for water and lava).
export function renderMap(world, frame) {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_W;
  canvas.height = MAP_H;
  const ctx = canvas.getContext('2d');
  const p = pen(ctx);
  const liquid = (x, y, kind) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return true;
    return world.terrain[y * W + x] === kind;
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = world.terrain[y * W + x];
      const nb = ['water', 'marsh', 'swampwater', 'lava'].includes(t)
        ? { n: liquid(x, y - 1, t), s: liquid(x, y + 1, t), w: liquid(x - 1, y, t), e: liquid(x + 1, y, t) }
        : null;
      drawTerrain(p, t, x * T, y * T, x, y, frame, nb);
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const o = world.objects[y * W + x];
      if (o) drawObject(p, o, x * T, y * T, hash(x, y, 12));
    }
  }
  for (const [id, pl] of Object.entries(PLACES)) {
    if (pl.sprite === 'boss') {
      ctx.fillStyle = 'rgba(32,32,42,0.22)';
      ctx.fillRect(pl.x * T + 2, (pl.y + pl.h) * T - 6, pl.w * T - 4, 5);
      continue;
    }
    const ox = pl.x * T + ((pl.w * T - (pl.w >= 3 ? 48 : 16)) >> 1);
    const oy = (pl.y + pl.h) * T - (pl.h >= 3 ? 48 : 16);
    drawLandmark(p, pl.sprite, ox, oy, id);
  }
  return canvas;
}
