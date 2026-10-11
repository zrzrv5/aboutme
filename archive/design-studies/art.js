// Pixel art, drawn at native resolution (1 unit = 1 pixel, 16 px tiles) and scaled up with smoothing off.
// Limited palette in the spirit of Game Boy Color games; every sprite here is original.

export const PAL = {
  k: '#20202a', w: '#f8f8f0',
  1: '#24502c', 2: '#3f7f3a', 3: '#66b046', 4: '#a6d86a',
  s: '#b8904e', t: '#e0c27c', u: '#f2dfa4',
  a: '#1f4f9a', b: '#3a86d8', c: '#7cc6f2', d: '#d4f2ff',
  r: '#4c4c5c', q: '#7e7e90', p: '#b8b8c6',
  v: '#4a2c82', x: '#8a5cd8', y: '#d0a8ff',
  g: '#1c5a78', h: '#3cb0d0', i: '#b0f4ff',
  e: '#5a3a1e', f: '#8e5c2c', j: '#c48a4c',
  m: '#9a2e26', n: '#e0503c', o: '#f6a08a',
  C: '#b88a1c', D: '#f2d24a', E: '#6e8e2a',
  L: '#7f8c62', K: '#a8b47e', J: '#c9d19c',
  M: '#283428', N: '#435238', O: '#66744a',
  R: '#c4383a', Q: '#f2e2c4',
  F: '#2a1c1c', G: '#5a2c1c', H: '#e0581c', I: '#ffb63a',
  S: '#3a4658', T: '#6a7a92', U: '#a8b8d0',
  V: '#3a6a1a', W: '#7ab62a', X: '#c6ea6a',
  P: '#efe6cc', Y: '#c8b88a',
};

// Small deterministic hash, so decoration and texture never shimmer between frames.
export function hash(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function pen(ctx) {
  const px = (x, y, c) => {
    ctx.fillStyle = PAL[c] ?? c;
    ctx.fillRect(x, y, 1, 1);
  };
  const rect = (x, y, w, h, c) => {
    ctx.fillStyle = PAL[c] ?? c;
    ctx.fillRect(x, y, w, h);
  };
  const map = (rows, ox, oy, sub = {}) => {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = sub[row[x]] ?? row[x];
        if (ch !== '.' && ch !== ' ') px(ox + x, oy + y, ch);
      }
    });
  };
  const disc = (cx, cy, r, c) => {
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) px(cx + x, cy + y, c);
  };
  return { px, rect, map, disc };
}

// ---------------------------------------------------------------- objects (16x16)

const TREE = [
  '....kkkkkkk.....',
  '..kk2333332kk...',
  '.k23344443332k..',
  '.k33444444333k..',
  'k233444443333kk.',
  'k2333444333332k.',
  'k2233333333322k.',
  'k1223333332221k.',
  '.k12222222211k..',
  '.k11122222111k..',
  '..kk1111111kk...',
  '....kkfjfkk.....',
  '.....kfjfk......',
  '.....kfffk......',
  '....kkkkkkk.....',
  '................',
];

const PINE = [
  '.......k........',
  '......k2k.......',
  '.....k232k......',
  '.....k322k......',
  '....k33222k.....',
  '....k32221k.....',
  '...k3322221k....',
  '...kk32222kk....',
  '..k332222221k...',
  '..k322222211k...',
  '.k33222222211k..',
  '.kkk1111111kkk..',
  '......kfk.......',
  '......kfk.......',
  '.....kkkkk......',
  '................',
];

const ROCK = [
  '................',
  '................',
  '.....kkkkkk.....',
  '...kkpppqqqkk...',
  '..kppppqqqqqrk..',
  '.kpppqqqqqqqrrk.',
  '.kppqqqqqqqqrrk.',
  'kppqqqqqqqqqrrrk',
  'kpqqqqqqqqqqrrrk',
  'kqqqqqqqqqqrrrrk',
  'kqqqqqqqqqrrrrrk',
  '.krqqqqqqrrrrrk.',
  '..krrrrrrrrrrk..',
  '...kkkkkkkkkk...',
  '................',
  '................',
];

const CRYSTAL = [
  '................',
  '.......k........',
  '......kyk.......',
  '......kyxk...k..',
  '..k...kyxk..kyk.',
  '.kyk..kyxk..kyxk',
  '.kyxk.kyxvk.kyxk',
  '.kyxk.kyxvk.kyvk',
  'kyxvkkkyxvkkyxvk',
  'kyxvkyxyxvvkyxvk',
  'kyxvkyxxxvvkxvvk',
  '.kxvkkyxxvvkxvk.',
  '..kvvkxxvvvkvvk.',
  '...kkkkkkkkkkk..',
  '................',
  '................',
];

const MUSHROOM = [
  '................',
  '................',
  '....kkkkkkk.....',
  '...kRRQRRRRk....',
  '..kRQQRRRQRRk...',
  '.kRRQRRRRQQRRk..',
  '.kRRRRQRRRRRRk..',
  '.kkRRRRRRRQRkk..',
  '...kkkkkkkkk....',
  '.....kQQQk......',
  '.....kQQQk...kk.',
  '.....kQQQk..kRRk',
  '....kQQQQQk.kQQk',
  '....kkkkkkk.kkkk',
  '................',
  '................',
];

const DEADTREE = [
  '................',
  '..k......k......',
  '..kek...kek..k..',
  '...kek.kek..kek.',
  '....keekek.kek..',
  '..k..keeeekek...',
  '.kek..keeeek....',
  '..kekkkeefk.....',
  '....kkeeefk.....',
  '......kefk......',
  '......kefk......',
  '......kefk......',
  '.....keeffk.....',
  '....kkkkkkkk....',
  '................',
  '................',
];

const COIN = [
  '................',
  '................',
  '................',
  '.....kkkkkk.....',
  '...kkUUUUUUkk...',
  '..kUUUUkUUUUUk..',
  '..kUUUkkkUUUUk..',
  '..kUUUUkUUUUTk..',
  '..kTUUUUUUUTTk..',
  '..kkTTTTTTTTkk..',
  '..kSkkkkkkkkSk..',
  '...kkSSSSSSkk...',
  '.....kkkkkk.....',
  '................',
  '................',
  '................',
];

export function drawObject(p, kind, x, y, seed) {
  switch (kind) {
    case 'tree':
      p.map(TREE, x, y);
      break;
    case 'apple':
      p.map(TREE, x, y);
      [[5, 3], [9, 5], [3, 6], [10, 2], [7, 7], [11, 7]].forEach(([ax, ay], i) => {
        if (hash(x, y, i) > 0.25) {
          p.px(x + ax, y + ay, 'n');
          p.px(x + ax, y + ay + 1, 'm');
        }
      });
      break;
    case 'pine':
      p.map(PINE, x, y);
      break;
    case 'rock':
      p.map(ROCK, x, y);
      break;
    case 'ore':
      p.map(ROCK, x, y);
      [[5, 6], [9, 8], [7, 10], [11, 6], [4, 9]].forEach(([ax, ay], i) => p.px(x + ax, y + ay, i % 2 ? 'D' : 'i'));
      break;
    case 'crystal':
      p.map(CRYSTAL, x, y);
      break;
    case 'glass':
      p.map(CRYSTAL, x, y, { y: 'i', x: 'h', v: 'g' });
      break;
    case 'mushroom':
      p.map(MUSHROOM, x, y);
      break;
    case 'dead':
      p.map(DEADTREE, x, y);
      break;
    case 'coin':
      p.map(COIN, x, y);
      break;
    case 'shell':
      p.rect(x + 5, y + 9, 6, 1, 'k'); p.rect(x + 4, y + 10, 8, 3, 'o'); p.rect(x + 5, y + 13, 6, 1, 'k');
      p.px(x + 4, y + 10, 'k'); p.px(x + 11, y + 10, 'k'); p.px(x + 6, y + 11, 'n'); p.px(x + 8, y + 11, 'n'); p.px(x + 10, y + 11, 'n');
      p.px(x + 3, y + 11, 'k'); p.px(x + 12, y + 11, 'k'); p.px(x + 3, y + 12, 'k'); p.px(x + 12, y + 12, 'k');
      break;
    case 'flower': {
      const c = seed > 0.5 ? 'n' : 'w';
      p.px(x + 4, y + 5, c); p.px(x + 3, y + 6, c); p.px(x + 5, y + 6, c); p.px(x + 4, y + 7, c); p.px(x + 4, y + 6, 'D');
      p.px(x + 11, y + 10, c); p.px(x + 10, y + 11, c); p.px(x + 12, y + 11, c); p.px(x + 11, y + 12, c); p.px(x + 11, y + 11, 'D');
      break;
    }
    default:
  }
}

// ---------------------------------------------------------------- terrain (16x16, two animation frames)

export function drawTerrain(p, kind, x, y, tx, ty, frame, nb) {
  const sprinkle = (base, specks, n = 6) => {
    p.rect(x, y, 16, 16, base);
    for (let i = 0; i < n; i++) {
      const sx = Math.floor(hash(tx, ty, i * 3) * 15);
      const sy = Math.floor(hash(tx, ty, i * 3 + 1) * 15);
      const c = specks[Math.floor(hash(tx, ty, i * 3 + 2) * specks.length)];
      p.px(x + sx, y + sy, c);
      if (i % 2) p.px(x + sx + 1, y + sy, c);
    }
  };
  const tuft = (c) => {
    for (let i = 0; i < 3; i++) {
      const sx = 2 + Math.floor(hash(tx, ty, 20 + i) * 11);
      const sy = 3 + Math.floor(hash(tx, ty, 30 + i) * 10);
      p.px(x + sx, y + sy, c); p.px(x + sx + 2, y + sy, c); p.px(x + sx + 1, y + sy - 1, c);
    }
  };
  switch (kind) {
    case 'grass':
      sprinkle('3', ['4', '2'], 4);
      tuft('2');
      break;
    case 'lawn':
      sprinkle('2', ['3', '1'], 6);
      tuft('1');
      break;
    case 'plaza': {
      p.rect(x, y, 16, 16, 'p');
      for (let r = 0; r < 16; r += 4) {
        p.rect(x, y + r, 16, 1, 'q');
        for (let c = (r / 4) % 2 ? 2 : 6; c < 16; c += 8) p.rect(x + c, y + r, 1, 4, 'q');
      }
      if (hash(tx, ty, 5) > 0.6) p.px(x + 3, y + 10, 'w');
      break;
    }
    case 'meadow':
      sprinkle('K', ['J', 'L'], 5);
      tuft('L');
      break;
    case 'path':
      sprinkle('t', ['s', 'u'], 7);
      break;
    case 'sand':
      sprinkle('u', ['t', 'w'], 5);
      break;
    case 'quarry':
      sprinkle('j', ['f', 's', 'e'], 9);
      break;
    case 'mud':
      sprinkle('O', ['N', 'M'], 8);
      break;
    case 'forge':
      sprinkle('G', ['F', 'e'], 8);
      if (hash(tx, ty, 9) > 0.7) { p.px(x + 7, y + 8, 'H'); p.px(x + 8, y + 8, 'H'); }
      break;
    case 'corn': {
      p.rect(x, y, 16, 16, 's');
      for (let cx = 1; cx < 16; cx += 5) {
        p.rect(x + cx + 1, y + 2, 1, 13, 'E');
        p.px(x + cx, y + 5, 'E'); p.px(x + cx + 2, y + 8, 'E'); p.px(x + cx, y + 11, 'E');
        p.px(x + cx + 1, y + 1, 'D');
        p.rect(x + cx + 2, y + 4, 1, 3, 'D');
        p.px(x + cx + 2, y + 3, 'C');
      }
      p.rect(x, y + 15, 16, 1, 'e');
      break;
    }
    case 'water':
    case 'marsh':
    case 'swampwater':
    case 'lava': {
      const pal = {
        water: ['b', 'c', 'a', 'd'],
        marsh: ['h', 'i', 'g', 'd'],
        swampwater: ['M', 'N', 'F', 'O'],
        lava: ['H', 'I', 'G', 'I'],
      }[kind];
      p.rect(x, y, 16, 16, pal[0]);
      const off = frame ? 4 : 0;
      for (let row = 2; row < 16; row += 5) {
        const sx = (Math.floor(hash(tx, ty, row) * 8) + off) % 12;
        p.rect(x + sx, y + row, 4, 1, pal[1]);
        p.px(x + ((sx + 7) % 15), y + row + 2, pal[2]);
      }
      // Foam where the liquid meets land.
      if (nb) {
        const f = pal[3];
        if (!nb.n) p.rect(x, y, 16, frame ? 2 : 1, f);
        if (!nb.s) p.rect(x, y + 15, 16, 1, pal[2]);
        if (!nb.w) p.rect(x, y, frame ? 2 : 1, 16, f);
        if (!nb.e) p.rect(x + 15, y, 1, 16, f);
      }
      break;
    }
    default:
      p.rect(x, y, 16, 16, '3');
  }
}

// ---------------------------------------------------------------- landmarks (drawn into the static map)

function roofHouse(p, x, y, roof, roofDark, wall, opts = {}) {
  // 48 x 48
  const cx = x + 24;
  for (let r = 0; r < 22; r++) {
    const half = Math.min(22, 7 + r);
    p.rect(cx - half, y + 3 + r, half * 2, 1, r % 5 === 4 ? roofDark : roof);
    p.px(cx - half - 1, y + 3 + r, 'k');
    p.px(cx + half, y + 3 + r, 'k');
  }
  p.rect(cx - 7, y + 2, 14, 1, 'k');
  p.rect(cx - 23, y + 25, 46, 1, 'k');
  // walls
  p.rect(x + 5, y + 26, 38, 18, wall);
  p.rect(x + 4, y + 26, 1, 18, 'k');
  p.rect(x + 43, y + 26, 1, 18, 'k');
  p.rect(x + 4, y + 44, 40, 1, 'k');
  p.rect(x + 5, y + 26, 38, 2, 'e');
  // door
  if (opts.boarded) {
    p.rect(x + 19, y + 32, 10, 12, 'e');
    p.rect(x + 17, y + 34, 14, 2, 'j');
    p.rect(x + 17, y + 39, 14, 2, 'j');
  } else {
    p.rect(x + 19, y + 31, 10, 13, 'k');
    p.rect(x + 20, y + 32, 8, 12, 'f');
    p.rect(x + 20, y + 32, 8, 1, 'e');
    p.px(x + 26, y + 38, 'D');
  }
  // windows
  for (const wx of [x + 9, x + 33]) {
    p.rect(wx - 1, y + 30, 8, 8, 'k');
    p.rect(wx, y + 31, 6, 6, opts.dark ? 'S' : 'c');
    p.rect(wx + 2, y + 31, 1, 6, 'k');
    p.rect(wx, y + 33, 6, 1, 'k');
    if (!opts.dark) p.px(wx + 1, y + 31, 'd');
  }
  // sign above the door
  if (opts.sign) {
    p.rect(x + 16, y + 20, 16, 7, 'k');
    p.rect(x + 17, y + 21, 14, 5, 'j');
    opts.sign(p, x + 17, y + 21);
  }
  p.rect(x + 6, y + 45, 36, 2, '1');
}

function stoneBuilding(p, x, y, glassRoof) {
  // research station: stone base, glass greenhouse roof (48 x 48)
  p.rect(x + 4, y + 8, 40, 2, 'k');
  for (let r = 0; r < 14; r++) {
    const inset = Math.max(0, 8 - r);
    p.rect(x + 4 + inset, y + 10 + r, 40 - inset * 2, 1, r % 4 === 0 ? 'g' : glassRoof);
    p.px(x + 3 + inset, y + 10 + r, 'k');
    p.px(x + 44 - inset, y + 10 + r, 'k');
  }
  for (let gx = x + 10; gx < x + 40; gx += 7) p.rect(gx, y + 11, 1, 13, 'g');
  p.px(x + 14, y + 13, 'w'); p.px(x + 15, y + 14, 'w'); p.px(x + 29, y + 15, 'w');
  p.rect(x + 3, y + 24, 42, 1, 'k');
  p.rect(x + 4, y + 25, 40, 19, 'p');
  for (let row = 0; row < 19; row += 4) {
    for (let col = (row / 4) % 2 ? 2 : 0; col < 40; col += 8) p.rect(x + 4 + col, y + 25 + row, 1, 4, 'q');
    p.rect(x + 4, y + 25 + row, 40, 1, 'q');
  }
  p.rect(x + 3, y + 25, 1, 19, 'k'); p.rect(x + 44, y + 25, 1, 19, 'k'); p.rect(x + 3, y + 44, 42, 1, 'k');
  p.rect(x + 19, y + 31, 10, 13, 'k'); p.rect(x + 20, y + 32, 8, 12, 'g'); p.rect(x + 21, y + 33, 6, 5, 'h');
  p.rect(x + 6, y + 45, 36, 2, '1');
}

function library(p, x, y) {
  // columns and a pediment
  for (let r = 0; r < 10; r++) {
    const half = 4 + r * 2;
    p.rect(x + 24 - half, y + 4 + r, half * 2, 1, r === 9 ? 'q' : 'P');
    p.px(x + 23 - half, y + 4 + r, 'k'); p.px(x + 24 + half, y + 4 + r, 'k');
  }
  p.rect(x + 22, y + 8, 4, 3, 'm');
  p.rect(x + 1, y + 14, 46, 3, 'k'); p.rect(x + 2, y + 15, 44, 1, 'Y');
  for (let c = 0; c < 6; c++) {
    const cx = x + 4 + c * 8;
    p.rect(cx, y + 17, 4, 22, 'P'); p.rect(cx + 3, y + 17, 1, 22, 'Y'); p.rect(cx - 1, y + 17, 1, 22, 'k'); p.rect(cx + 4, y + 17, 1, 22, 'k');
  }
  for (let c = 0; c < 5; c++) p.rect(x + 9 + c * 8, y + 18, 2, 21, 'r');
  p.rect(x + 20, y + 26, 8, 13, 'k'); p.rect(x + 21, y + 27, 6, 12, 'f');
  p.rect(x + 1, y + 39, 46, 2, 'k'); p.rect(x + 2, y + 41, 44, 2, 'p'); p.rect(x + 0, y + 43, 48, 2, 'q'); p.rect(x, y + 45, 48, 1, 'k');
}

function tower(p, x, y, body, dark, top, glow) {
  // 48 x 48, the tower itself is ~24 wide
  const l = x + 12;
  p.rect(l + 11, y, 2, 6, 'k'); p.px(l + 11, y, glow);
  for (let r = 0; r < 8; r++) {
    const half = 2 + r;
    p.rect(l + 12 - half, y + 5 + r, half * 2, 1, top);
    p.px(l + 11 - half, y + 5 + r, 'k'); p.px(l + 12 + half, y + 5 + r, 'k');
  }
  p.rect(l - 1, y + 13, 26, 1, 'k');
  p.rect(l, y + 14, 24, 30, body);
  for (let r = 0; r < 30; r += 5) p.rect(l, y + 14 + r, 24, 1, dark);
  p.rect(l - 1, y + 14, 1, 30, 'k'); p.rect(l + 24, y + 14, 1, 30, 'k'); p.rect(l - 1, y + 44, 26, 1, 'k');
  p.rect(l + 9, y + 18, 6, 6, 'k'); p.rect(l + 10, y + 19, 4, 4, glow);
  p.rect(l + 8, y + 33, 8, 11, 'k'); p.rect(l + 9, y + 34, 6, 10, 'f');
  p.rect(l + 1, y + 45, 22, 2, '1');
}

function cave(p, x, y, rock, rockDark, inside, glow) {
  // rocky mound with an arch (48 x 48)
  for (let r = 0; r < 34; r++) {
    const half = Math.min(23, Math.round(9 + Math.sqrt(r) * 4.4));
    p.rect(x + 24 - half, y + 10 + r, half * 2, 1, r % 6 === 5 ? rockDark : rock);
    p.px(x + 23 - half, y + 10 + r, 'k'); p.px(x + 24 + half, y + 10 + r, 'k');
  }
  p.rect(x + 15, y + 9, 18, 1, 'k');
  for (let i = 0; i < 14; i++) p.px(x + 6 + Math.floor(hash(x, i) * 36), y + 16 + Math.floor(hash(i, y) * 22), rockDark);
  for (let r = 0; r < 18; r++) {
    const half = r < 6 ? 3 + r : 9;
    p.rect(x + 24 - half, y + 26 + r, half * 2, 1, r < 2 ? 'k' : inside);
    p.px(x + 23 - half, y + 26 + r, 'k'); p.px(x + 24 + half, y + 26 + r, 'k');
  }
  if (glow) {
    p.rect(x + 19, y + 36, 10, 8, glow);
    p.rect(x + 21, y + 34, 6, 2, glow);
  }
  p.rect(x + 1, y + 44, 46, 1, 'k');
}

function mine(p, x, y) {
  cave(p, x, y, 'f', 'e', 'F');
  // timber frame
  p.rect(x + 13, y + 26, 3, 18, 'j'); p.rect(x + 32, y + 26, 3, 18, 'j'); p.rect(x + 12, y + 25, 24, 3, 'j');
  p.rect(x + 12, y + 25, 24, 1, 'k'); p.rect(x + 12, y + 28, 24, 1, 'k');
  // rails and a cart of cathode powder
  for (let r = 36; r < 48; r += 3) p.rect(x + 18, y + r, 12, 1, 'e');
  p.rect(x + 19, y + 34, 1, 14, 'q'); p.rect(x + 28, y + 34, 1, 14, 'q');
  p.rect(x + 36, y + 37, 10, 7, 'k'); p.rect(x + 37, y + 38, 8, 5, 'q'); p.rect(x + 37, y + 36, 8, 2, 'r');
  p.px(x + 39, y + 36, 'i'); p.px(x + 42, y + 35, 'D');
  p.px(x + 38, y + 44, 'k'); p.px(x + 43, y + 44, 'k');
}

function board(p, x, y, paper) {
  p.rect(x + 2, y + 2, 12, 9, 'k'); p.rect(x + 3, y + 3, 10, 7, 'f');
  p.rect(x + 4, y + 4, 4, 4, paper); p.rect(x + 9, y + 4, 3, 5, 'P');
  p.rect(x + 4, y + 11, 2, 4, 'k'); p.rect(x + 10, y + 11, 2, 4, 'k');
  p.rect(x + 3, y + 15, 10, 1, '1');
}

function chest(p, x, y) {
  p.rect(x + 2, y + 4, 12, 10, 'k'); p.rect(x + 3, y + 5, 10, 8, 'f'); p.rect(x + 3, y + 5, 10, 3, 'j');
  p.rect(x + 3, y + 8, 10, 1, 'k'); p.rect(x + 7, y + 7, 2, 3, 'D'); p.rect(x + 3, y + 14, 10, 1, '1');
}

const SIGNS = {
  totk: (p, x, y) => { p.rect(x + 5, y + 1, 4, 3, 'D'); p.px(x + 6, y + 1, 'C'); },
  amiibot: (p, x, y) => { p.rect(x + 4, y + 1, 6, 3, 'R'); p.rect(x + 5, y + 2, 4, 1, 'w'); },
  ling: (p, x, y) => { p.rect(x + 4, y + 1, 6, 3, 'S'); p.px(x + 7, y + 2, 'w'); },
  home: (p, x, y) => { p.rect(x + 5, y + 1, 4, 3, '3'); p.px(x + 6, y + 2, 'k'); p.px(x + 8, y + 2, 'k'); },
};

export function drawLandmark(p, sprite, x, y, id) {
  switch (sprite) {
    case 'house':
      roofHouse(p, x, y, 'n', 'm', 'P', { sign: SIGNS[id] });
      break;
    case 'house-blue':
      roofHouse(p, x, y, 'b', 'a', 'P', { sign: SIGNS[id] });
      break;
    case 'house-green':
      roofHouse(p, x, y, '3', '2', 'u', { sign: SIGNS[id] });
      break;
    case 'house-boarded':
      roofHouse(p, x, y, 'q', 'r', 'Y', { boarded: true, dark: true, sign: SIGNS[id] });
      break;
    case 'lab':
      stoneBuilding(p, x, y, 'h');
      break;
    case 'library':
      library(p, x, y);
      break;
    case 'tower-light':
      tower(p, x, y, 'p', 'q', 'b', 'i');
      break;
    case 'tower-slop':
      tower(p, x, y, 'N', 'M', 'V', 'X');
      break;
    case 'cave':
      cave(p, x, y, 'x', 'v', 'F', 'y');
      break;
    case 'forge':
      cave(p, x, y, 'r', 'F', 'F', 'H');
      p.rect(x + 34, y + 2, 6, 12, 'k'); p.rect(x + 35, y + 3, 4, 11, 'q');
      break;
    case 'mine':
      mine(p, x, y);
      break;
    case 'board':
      board(p, x, y, 'n');
      break;
    case 'board-side':
      board(p, x, y, 'D');
      break;
    case 'chest':
      chest(p, x, y);
      break;
    default:
  }
}

// ---------------------------------------------------------------- bosses (32x32, drawn live so they can bob)

const BOOK = [
  '................................',
  '................................',
  '.....kkkkkk..........kkkkkk.....',
  '...kkPPPPPPkk......kkPPPPPPkk...',
  '..kPPYPPPPPPPkk..kkPPPPPPPYPPk..',
  '.kPPPPPPPPPPPPPkkPPPPPPPPPPPPPk.',
  '.kPYYYYPPPPPPPPPkPPPPPPPPYYYYPk.',
  'kPPPPPPPPPPPPPPPkPPPPPPPPPPPPPPk',
  'kPPkkkkPPPPPPPPPkPPPPPPPkkkkPPPk',
  'kPkwwwwkPPPPPPPPkPPPPPPkwwwwkPPk',
  'kPkwkkwkPPPPPPPPkPPPPPPkwkkwkPPk',
  'kPkwkkwkPPYYYYPPkPPYYYYkwkkwkPPk',
  'kPPkwwkPPPPPPPPPkPPPPPPPkwwkPPPk',
  'kPPPkkPPPPPPPPPPkPPPPPPPPkkPPPPk',
  'kPYYYYYYPPPPPPPPkPPPPPPPPYYYYYPk',
  'kPPPPPPPPPPkkkkkkkkkkkPPPPPPPPPk',
  'kPPPPPPPPPkwkwkwkwkwkwkPPPPPPPPk',
  'kPPPPPPPPPkRRRRRRRRRRRkPPPPPPPPk',
  'kPYYYYYYPPkwkwkwkwkwkwkPPYYYYYPk',
  'kPPPPPPPPPPkkkkkkkkkkkPPPPPPPPPk',
  'kmmPPPPPPPPPPPPPkPPPPPPPPPPPPmmk',
  'kmmmmPPPPPPPPPPPkPPPPPPPPPPmmmmk',
  '.kmmmmmmPPPPPPPPkPPPPPPPPmmmmmk.',
  '..kkmmmmmmmmmmmmkmmmmmmmmmmmkk..',
  '....kkkkmmmmmmmmkmmmmmmmkkkk....',
  '........kkkkkkkkkkkkkkkk........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const GOLEM = [
  '................................',
  '...........kkkkkkkkkk...........',
  '..........kUUUUUUUUTTk..........',
  '.........kUTTTTTTTTTTSk.........',
  '.........kUTkkkkkkkkTSk.........',
  '.........kUTkIIkkIIkTSk.........',
  '.........kUTkIIkkIIkTSk.........',
  '.........kUTkkkkkkkkTSk.........',
  '.........kUTTTkkkkTTTSk.........',
  '..........kSSSSSSSSSSk..........',
  '....kkkk...kkkkkkkkkk...kkkk....',
  '...kUUTTk.kTTTTTTTTTTk.kTTUUk...',
  '..kUTTTSSkTUUUUUUUUUUTkSSTTTUk..',
  '..kUTTSSkTUSSSSSSSSSSUTkSSTTUk..',
  '..kUTTSSkTUSkkkkkkkkSUTkSSTTUk..',
  '..kTTSSSkTUSkHIIIIHkSUTkSSSTTk..',
  '...kSSSkkTUSkIHIIHIkSUTkkSSSk...',
  '...kSSkk.kTUSkkkkkkSUTk.kkSSk...',
  '...kUUk..kTUSSSSSSSSUTk..kUUk...',
  '..kUUUUk.kTTUUUUUUUUTTk.kUUUUk..',
  '..kkkkkk..kkkkkkkkkkkk..kkkkkk..',
  '.........kTTSk....kSTTk.........',
  '.........kTTSk....kSTTk.........',
  '........kUTTSk....kSTTUk........',
  '........kkkkkk....kkkkkk........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const HYDRA = [
  '................................',
  '....kkkk......kkkk......kkkk....',
  '...kXWWWk....kXWWWk....kXWWWk...',
  '..kXWkWkWk..kXWkWkWk..kXWkWkWk..',
  '..kWWWWWWk..kWWWWWWk..kWWWWWWk..',
  '..kWkRRkWk..kWkRRkWk..kWkRRkWk..',
  '...kWWWWk....kWWWWk....kWWWWk...',
  '....kWWk......kWWk......kWWk....',
  '....kWVk......kWVk......kWVk....',
  '....kWVk......kWVk......kVWk....',
  '.....kWVk.....kWVk.....kVWk.....',
  '......kWVk....kWVk....kVWk......',
  '.......kWVkkkkkWVkkkkkkVWk......',
  '.....kkkWWWWWWWWWWWWWWWWWkkk....',
  '....kXXWWWWWWWWWWWWWWWWWWWWVk...',
  '...kXWWWWWWWWWWWWWWWWWWWWWWWVk..',
  '..kXWWWWkkWWWWWWWWWWWWkkWWWWVk..',
  '..kWWWWkwwkWWWWWWWWWWkwwkWWWVk..',
  '..kWWWWkwkkWWWWWWWWWWkwkkWWWVk..',
  '..kWWWWWkkWWWWWWWWWWWWkkWWWWVk..',
  '..kVWWWWWWWWWkkkkkkWWWWWWWWVVk..',
  '..kVVWWWWWWWWWWWWWWWWWWWWWVVVk..',
  '..kXkVVWWWWWWWWWWWWWWWWWVVVkXk..',
  '..kXk.kkVVVVVVVVVVVVVVVVVkk.kXk.',
  '...k....kkkkkkkkkkkkkkkkk....k..',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

export const BOSS_ART = { phd: BOOK, dpmetal: GOLEM, dshslop: HYDRA };

// ---------------------------------------------------------------- item icons (16x16)

const ICONS = {
  dft: [
    '............kk..', '...........kwwk.', '..........kwppk.', '.........kwppk..', '........kwppk...',
    '.......kwppk....', '......kwppk.....', '..kk.kwppk......', '..kDkkppk.......', '...kDDkk........',
    '....kDDk........', '...kfkkDk.......', '..kfk..kk.......', '..kk............', '................', '................',
  ],
  md: [
    '.....kk.........', '....kfjk........', '...kfk.kw.......', '..kfk...kw......', '..kfk....kw.....',
    '.kfk......kw....', '.kfkkkkkkkkkkk..', '.kfk......kw....', '..kfk....kw.....', '..kfk...kw......',
    '...kfk.kw.......', '....kfjk........', '.....kk.........', '................', '................', '................',
  ],
  mlip: [
    '................', '..........kkkk..', '.........kppppk.', '........kpkkkpk.', '.......kpk..kpk.',
    '......kpk..kpk..', '.....kqk..kpk...', '....kqk...kk....', '...kqk..........', '..kSSk..........',
    '.kSTTSk.........', '.kSTTSk.........', '..kSSk..........', '...kk...........', '................', '................',
  ],
  dem: [
    '..........k.....', '.........kDk....', '........kk.k....', '.......kk.......', '.....kkkkkk.....',
    '....kSSSSSSk....', '...kSTUSSSSSk...', '...kSUSSSSSSk...', '...kSSSSSSSSk...', '...kSSSSSSSSk...',
    '...kSSSSSSSSk...', '....kSSSSSSk....', '.....kkkkkk.....', '................', '................', '................',
  ],
  p2d: [
    '................', '.....kkkkkk.....', '...kkDDDDDDkk...', '..kDDwwwwwwDDk..', '..kDwwwwnwwwDk..',
    '.kDwwwwnnwwwwDk.', '.kDwwwnnwwwwwDk.', '.kDwwwwkwwwwwDk.', '.kDwwwwwkwwwwDk.', '.kDwwwwwwkwwwDk.',
    '..kDwwwwwwwwDk..', '..kDDwwwwwwDDk..', '...kkDDDDDDkk...', '.....kkkkkk.....', '................', '................',
  ],
  gnn: [
    '................', '....kkkkk.......', '...kiiiiik......', '..kiidkiiik.....', '..kidkidkik.....',
    '..kikdkkdik.....', '..kiidkdiik.....', '...kiiiiikk.....', '....kkkkkfjk....', '.........kfjk...',
    '..........kfjk..', '...........kfjk.', '............kk..', '................', '................', '................',
  ],
  bo: [
    '.......kk.......', '......kDDk......', '.....kDDDDk.....', '....kDDwDDDk....', '....kDwDDDDk....',
    '...kDDDDDDDDk...', '...kDDDDDDDDk...', '..kDDDDDDDDDDk..', '..kCCCCCCCCCCk..', '..kkkkkkkkkkkk..',
    '.......kDk......', '........k.......', '................', '................', '................', '................',
  ],
  python: [
    '................', '..kkkkkkk.......', '.kbbbbbbbkkk....', '.kbwbbbbbbbbk...', '.kbbbbbbbbbbbk..',
    '..kkkkkkkbbbbk..', '.........kbbbk..', '..kkkkk...kkk...', '.kDDDDDk........', '.kDDDDDDkkkkk...',
    '..kDDDDDDDDDDk..', '...kDDDDDDDwDk..', '....kkkkDDDDDk..', '........kkkkk...', '................', '................',
  ],
  slurm: [
    '......kkkk......', '.....k....k.....', '.....kkkkkk.....', '....kqqqqqqk....', '...kqkDDDDkqk...',
    '...kqkDIIDkqk...', '...kqkDIIDkqk...', '...kqkDDDDkqk...', '....kqqqqqqk....', '.....kkkkkk.....',
    '.....krrrrk.....', '......kkkk......', '................', '................', '................', '................',
  ],
  swift: [
    '...........kk...', '..........kwwk..', '.........kwwnk..', '........kwwnnk..', '.......kwwnnk...',
    '......kwwnnk....', '.....kwwnnk.....', '....kwwnnk......', '...kwwnnk.......', '...kwnnk........',
    '..kwnnk.........', '..knnk..........', '.kfk............', '.kk.............', '................', '................',
  ],
  metal: [
    '................', '...kk.kk.kk.....', '..kUUkUUkUUk....', '..kUTkUTkUTkk...', '..kUTkUTkUTkUk..',
    '..kUTTTTTTTkTk..', '..kUTTTTTTTTTk..', '..kSTTIITTTTSk..', '..kSTTIITTTSk...', '...kSTTTTTSk....',
    '...kSSSSSSSk....', '...kTTTTTTTk....', '...kkkkkkkkk....', '................', '................', '................',
  ],
  agent: [
    '......kkkk......', '......kffk......', '.....kkkkkk.....', '.....kddddk.....', '....kddddddk....',
    '...kddXXXXddk...', '...kdXkXXkXdk...', '...kdXXXXXXdk...', '...kdXkkkkXdk...', '...kddXXXXddk...',
    '...kddddddddk...', '....kddddddk....', '.....kkkkkk.....', '................', '................', '................',
  ],
};

ICONS.heart = [
  '................', '................', '..kkk....kkk....', '.knnnk..knnnk...', 'knownnkknnnnnk..', 'knonnnnnnnnnnk..',
  'knnnnnnnnnnnnk..', '.knnnnnnnnnnk...', '..knnnnnnnmk....', '...knnnnnmk.....', '....knnnmk......', '.....knmk.......',
  '......kk........', '................', '................', '................',
];
ICONS.scroll = [
  '................', '..kkkkkkkkkk....', '.kYPPPPPPPPYk...', '.kkPPPPPPPPkk...', '..kPkkkkkkPk....', '..kPPPPPPPPk....',
  '..kPkkkkkPPk....', '..kPPPPPPPPk....', '..kPkkkkkkPk....', '..kPPPPPPPPk....', '.kkPPPPPPPPkk...', '.kYPPPPPPPPYk...',
  '..kkkkkkkkkk....', '................', '................', '................',
];
ICONS.apple = [
  '................', '.......kk.......', '......kek.kk....', '...kkkkekk3k....', '..knnnnkkk3k....', '.knonnnnnnkk....',
  '.knonnnnnnnk....', '.knnnnnnnnnk....', '.knnnnnnnnnk....', '.kmnnnnnnnmk....', '..kmnnnnnmk.....', '...kmmkmmk......',
  '....kk.kk.......', '................', '................', '................',
];

export function drawIcon(ctx, id) {
  const rows = ICONS[id];
  if (!rows) return;
  pen(ctx).map(rows, 0, 0);
}
