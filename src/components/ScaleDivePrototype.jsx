import React, { useEffect, useMemo, useRef, useState } from 'react';

/*
 * PROTOTYPE v3 — real continuous zoom into battery MATERIAL.
 * View at:  /industry/?proto=dive   (append &p=0.16 to freeze a frame for review)
 *
 * v2 problem: deeper scales were bounded illustrations (a bordered, labelled box),
 * so magnifying one looked like a card floating over a card — not a zoom.
 * v3 fix: every deep scale is a FULL-BLEED, borderless, soft-edged texture field
 * that overfills the screen and fades at its edges (radial mask). Magnifying the
 * current field pushes it past the camera while the next field grows from the
 * centre and dissolves in as "finer structure of the same material".
 *
 * One camera value z (0..4) drives everything; layer scale = K^(z-index).
 * The journey never fully holds, so scrolling always changes something.
 */

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

const K = 6;
const REGION_VH = 340;
const FW = 1500, FH = 1100; // full-bleed field size (overfills the viewport at scale 1)

const ZSTOPS = [
    [0.00, 0.00],
    [0.30, 3.88],   // dive: cell -> atom
    [0.44, 4.00],   // atomic read (keeps creeping)
    [0.60, 2.12],   // climb -> particle
    [0.72, 1.95],   // particle read (keeps drifting)
    [0.90, 0.12],   // climb -> cell
    [1.00, 0.00],   // cell read
];
const LAYERS = ['cell', 'electrode', 'particle', 'grain', 'atom']; // index === z-centre
const CARD_WIN = { atom: [0.30, 0.44], particle: [0.60, 0.72], cell: [0.90, 1.00] };
const RULER = [
    [-2, 'cm'], [-3, 'mm'], [-4, '100µm'], [-5, '10µm'], [-6, '1µm'],
    [-7, '100nm'], [-8, '10nm'], [-9, '1nm'], [-10, '1Å'],
];

function zAt(p) {
    for (let i = 0; i < ZSTOPS.length - 1; i++) {
        const [p0, z0] = ZSTOPS[i];
        const [p1, z1] = ZSTOPS[i + 1];
        if (p <= p1) return lerp(z0, z1, smooth(clamp((p - p0) / (p1 - p0), 0, 1)));
    }
    return ZSTOPS[ZSTOPS.length - 1][1];
}
function layerViz(i, z) {
    const d = z - i;
    const scale = Math.pow(K, d);
    let opacity;
    if (d <= -1.45 || d >= 1.55) opacity = 0;
    else if (d < -0.72) opacity = smooth((d + 1.45) / 0.73);
    else if (d > 0.95) opacity = smooth((1.55 - d) / 0.6);
    else opacity = 1;
    return { scale, opacity };
}
const zToLogm = (z) => -2 - 2 * z;
function nearestRuler(logm) {
    let best = RULER[0], dist = Infinity;
    for (const r of RULER) { const dd = Math.abs(r[0] - logm); if (dd < dist) { dist = dd; best = r; } }
    return best;
}
function stageLabel(p) {
    if (p < 0.30) return 'DIVE ↓';
    if (p < 0.44) return 'ATOMIC · Å';
    if (p < 0.60) return 'CLIMB ↑';
    if (p < 0.72) return 'PARTICLE · µm';
    if (p < 0.90) return 'CLIMB ↑';
    return 'CELL · cm';
}
function windowOpacity(p, [start, end], fade = 0.035) {
    if (p < start - fade || p > end + fade) return 0;
    return smooth(Math.min(clamp((p - start) / fade + 1, 0, 1), clamp((end - p) / fade + 1, 0, 1)));
}

// ---------- full-bleed field geometry (deterministic, built once) ----------
const ELE = (() => {
    const out = []; let i = 0;
    for (let y = 30; y < FH; y += 92) for (let x = 30; x < FW; x += 92) {
        i++;
        const r = 20 + hash(i * 3.1) * 28;
        const kind = hash(i * 4.9);
        out.push({ x: x + hash(i * 1.7) * 44 - 22, y: y + hash(i * 2.3) * 44 - 22, r, fill: kind > 0.8 ? '#4f46e5' : (hash(i * 5.5) > 0.5 ? '#334155' : '#3b4a63') });
    }
    return out;
})();
const PARTS = (() => {
    const cx = FW / 2, cy = FH / 2, out = [{ x: cx, y: cy, r: 300 }];
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.35; const rad = 440 + hash(k * 3) * 70; out.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad * 0.82, r: 165 + hash(k * 7) * 95 }); }
    return out;
})();
const GRAIN = (() => { const l = []; for (let i = -12; i < 60; i++) l.push({ x1: 0, y1: i * 27, x2: FW, y2: i * 27 - 300 }); return l; })();
const ATOMS = (() => {
    const atoms = [], bonds = [], grid = [], dx = 84, dy = 78;
    const cols = Math.ceil(FW / dx) + 3, rows = Math.ceil(FH / dy) + 3;
    for (let r = 0; r < rows; r++) { grid[r] = []; for (let c = 0; c < cols; c++) { const x = c * dx + (r % 2) * (dx / 2) - dx; const y = r * dy - dy; const li = (r * 3 + c) % 5 === 0; grid[r][c] = { x, y }; atoms.push({ x, y, rad: li ? 9 : 6.5, li }); } }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { if (c < cols - 1) bonds.push([grid[r][c].x, grid[r][c].y, grid[r][c + 1].x, grid[r][c + 1].y]); if (r < rows - 1) bonds.push([grid[r][c].x, grid[r][c].y, grid[r][c].x, grid[r + 1][c].y]); }
    return { atoms, bonds };
})();

const softMask = 'radial-gradient(circle at 50% 50%, #000 42%, rgba(0,0,0,0.5) 62%, transparent 78%)';
const Field = ({ children }) => (
    <div style={{ width: FW, height: FH, WebkitMaskImage: softMask, maskImage: softMask }}>{children}</div>
);

// establishing object (bounded on purpose — it's "the whole cell")
const CellArt = () => (
    <svg width="440" height="230" viewBox="0 0 360 188" fill="none">
        <rect x="70" y="18" width="42" height="26" rx="4" fill="#c7cbd1" /><text x="91" y="37" textAnchor="middle" fontSize="18" fontWeight="700" fill="#334155">+</text>
        <rect x="248" y="18" width="42" height="26" rx="4" fill="#f6a96b" /><text x="269" y="37" textAnchor="middle" fontSize="18" fontWeight="700" fill="#7c2d12">–</text>
        <rect x="34" y="42" width="292" height="120" rx="12" fill="#0b1220" stroke="#334155" strokeWidth="1.5" />
        <rect x="42" y="50" width="118" height="104" rx="6" fill="#4f46e5" opacity="0.85" />
        <rect x="168" y="50" width="24" height="104" fill="#fde68a" opacity="0.9" />
        <rect x="200" y="50" width="118" height="104" rx="6" fill="#475569" />
        <text x="101" y="176" textAnchor="middle" fontSize="10" fill="#818cf8" letterSpacing="1">CATHODE</text>
        <text x="180" y="176" textAnchor="middle" fontSize="9" fill="#eab308">SSE</text>
        <text x="259" y="176" textAnchor="middle" fontSize="10" fill="#34d399" letterSpacing="1">ANODE</text>
    </svg>
);
const ElectrodeArt = () => (
    <Field><svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} fill="none">
        {ELE.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} stroke="#0b1220" strokeWidth="1.5" />)}
    </svg></Field>
);
const ParticleArt = () => (
    <Field><svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} fill="none">
        <defs><radialGradient id="pg" cx="38%" cy="30%" r="75%"><stop offset="0%" stopColor="#8a97ab" /><stop offset="100%" stopColor="#2b3648" /></radialGradient></defs>
        {PARTS.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="url(#pg)" stroke="#94a3b8" strokeOpacity="0.25" strokeWidth="2" />)}
    </svg></Field>
);
const GrainArt = () => (
    <Field><svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} fill="none">
        <rect width={FW} height={FH} fill="#1e293b" />
        <g stroke="#8595ab" strokeWidth="2.5" opacity="0.38">{GRAIN.map((l, i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />)}</g>
    </svg></Field>
);
const AtomArt = () => (
    <Field><svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} fill="none">
        <g stroke="#3730a3" strokeWidth="2.5">{ATOMS.bonds.map((b, i) => <line key={i} x1={b[0]} y1={b[1]} x2={b[2]} y2={b[3]} />)}</g>
        {ATOMS.atoms.map((a, i) => <circle key={i} cx={a.x} cy={a.y} r={a.rad} fill={a.li ? '#818cf8' : '#334155'} stroke={a.li ? '#c7d2fe' : '#475569'} strokeWidth="1.5" />)}
        <circle r="10" fill="#a5b4fc" stroke="#e0e7ff" strokeWidth="2"><animateMotion dur="3s" repeatCount="indefinite" path={`M${FW * 0.42},${FH * 0.36} L${FW * 0.5},${FH * 0.5} L${FW * 0.58},${FH * 0.36} L${FW * 0.5},${FH * 0.5} L${FW * 0.58},${FH * 0.64}`} /></circle>
    </svg></Field>
);
const ART = { cell: <CellArt />, electrode: <ElectrodeArt />, particle: <ParticleArt />, grain: <GrainArt />, atom: <AtomArt /> };

const Card = ({ eyebrow, accent, title, body, tags, style }) => (
    <div style={style} className="pointer-events-auto w-[340px] max-w-[86vw]">
        <div className="relative rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/10 p-6 shadow-2xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
            <div className="text-[11px] font-semibold tracking-[0.2em] mb-2" style={{ color: accent }}>{eyebrow}</div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm leading-relaxed text-slate-300">{body}</p>
            {tags && <div className="mt-4 flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">{t}</span>)}</div>}
        </div>
    </div>
);

export default function ScaleDivePrototype() {
    const wrapRef = useRef(null);
    const frozen = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const v = new URLSearchParams(window.location.search).get('p');
        const n = v === null ? NaN : parseFloat(v);
        return Number.isFinite(n) ? clamp(n, 0, 1) : null;
    }, []);
    const [p, setP] = useState(frozen ?? 0);
    const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

    useEffect(() => {
        document.body.style.backgroundColor = '#020617';
        return () => { document.body.style.backgroundColor = ''; };
    }, []);
    useEffect(() => {
        if (reduced || frozen !== null) return;
        let ticking = false;
        const update = () => {
            const el = wrapRef.current;
            if (el) { const total = el.offsetHeight - window.innerHeight; setP(total <= 0 ? 0 : clamp(-el.getBoundingClientRect().top / total, 0, 1)); }
            ticking = false;
        };
        const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
    }, [reduced, frozen]);

    const z = zAt(p);
    const logm = zToLogm(z);
    const near = nearestRuler(logm);
    const rulerY = (d) => ((d + 2) / -8) * 100;
    const reading = Math.max(windowOpacity(p, CARD_WIN.atom), windowOpacity(p, CARD_WIN.particle), windowOpacity(p, CARD_WIN.cell));
    const diveFocus = 1 - reading;

    if (reduced) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-16 max-w-3xl mx-auto space-y-8">
                <p className="text-xs tracking-widest text-indigo-400">REDUCED-MOTION VIEW</p>
                <div className="flex justify-center overflow-hidden h-64">{ART.atom}</div>
                <Card eyebrow="ATOMIC · Å" accent="#818cf8" title="Atomic scale — DFT / MD" body="First-principles insight into ion transport and interfacial phenomena." tags={['DFT', 'MD']} />
                <div className="flex justify-center overflow-hidden h-64">{ART.particle}</div>
                <Card eyebrow="PARTICLE · µm" accent="#2dd4bf" title="Particle scale — DEM" body="Electrode packing, size distribution and calendering pressure." tags={['DEM', 'Sunwoda']} />
                <div className="flex justify-center">{ART.cell}</div>
                <Card eyebrow="CELL / SYSTEM · cm" accent="#fb7185" title="Cell & system modeling" body="P2D + thermal simulation, optimization automation, data-driven models." tags={['PyBaMM', 'COMSOL']} />
            </div>
        );
    }

    return (
        <div ref={wrapRef} style={{ height: `${REGION_VH}vh` }} className="relative bg-slate-950">
            <div className="sticky top-0 h-screen w-full overflow-hidden text-slate-100">
                {/* nested full-bleed zoom scene */}
                <div className="absolute inset-0">
                    {LAYERS.map((key, i) => {
                        const { scale, opacity } = layerViz(i, z);
                        if (opacity <= 0.01) return null;
                        return (
                            <div key={key} style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) scale(${scale})`, opacity, willChange: 'transform, opacity' }}>
                                {ART[key]}
                            </div>
                        );
                    })}
                </div>

                {/* focus reticle at the dive centre */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: diveFocus * 0.4 }}>
                    <div className="w-14 h-14 rounded-full border border-indigo-400/40" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-20 bg-indigo-400/20" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-20 bg-indigo-400/20" />
                </div>

                {/* vignette */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2,6,23,0.92) 100%)' }} />

                <div className="absolute top-6 left-6"><span className="text-[11px] font-mono tracking-[0.35em] text-indigo-300">{stageLabel(p)}</span></div>
                <div className="absolute top-6 right-8 text-right">
                    <div className="text-4xl font-black text-white tabular-nums leading-none">{near[1]}</div>
                    <div className="text-[10px] tracking-[0.3em] text-slate-500 mt-1">FIELD OF VIEW</div>
                </div>

                {/* scale ruler */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 h-[58vh] w-px bg-white/15">
                    {RULER.map(([d, label]) => {
                        const active = Math.round(logm) === d;
                        return (
                            <div key={d} className="absolute right-0 flex items-center gap-2" style={{ top: `${rulerY(d)}%`, transform: 'translateY(-50%)' }}>
                                <span className={`text-[10px] font-mono tabular-nums ${active ? 'text-indigo-300' : 'text-slate-600'}`}>{label}</span>
                                <span className={`block h-px ${active ? 'w-4 bg-indigo-400' : 'w-2 bg-white/20'}`} />
                            </div>
                        );
                    })}
                    <div className="absolute -right-1 w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.9)]" style={{ top: `${rulerY(logm)}%`, transform: 'translate(50%,-50%)' }} />
                </div>

                {/* dwell cards */}
                <Card eyebrow="ATOMIC · Å" accent="#818cf8" title="Atomic scale — DFT / MD" body="Most of my time here: first-principles insight into ion transport and interfacial phenomena." tags={['DFT', 'MD', 'first-principles']}
                    style={{ position: 'absolute', left: '7%', bottom: '12%', opacity: windowOpacity(p, CARD_WIN.atom), transition: 'opacity .2s' }} />
                <Card eyebrow="PARTICLE · µm" accent="#2dd4bf" title="Particle scale — DEM" body="At Sunwoda I built a DEM workflow linking particle-size distribution and calendering pressure to electrode packing, then wrapped it in an optimizer." tags={['DEM', 'PSD', 'calendering']}
                    style={{ position: 'absolute', right: '16%', bottom: '14%', opacity: windowOpacity(p, CARD_WIN.particle), transition: 'opacity .2s' }} />
                <Card eyebrow="CELL / SYSTEM · cm" accent="#fb7185" title="Cell & system modeling" body="Optimization tied to COMSOL / PyBaMM for P2D + thermal models, plus data-driven models for fast trend predictions." tags={['P2D', 'PyBaMM', 'optimization', 'ML']}
                    style={{ position: 'absolute', left: '50%', bottom: '14%', transform: 'translateX(-50%)', opacity: windowOpacity(p, CARD_WIN.cell), transition: 'opacity .2s' }} />

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center" style={{ opacity: clamp(1 - p * 25, 0, 1) }}>
                    <div className="text-[10px] tracking-[0.4em] text-slate-500 animate-pulse">SCROLL TO DIVE ↓</div>
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-500" style={{ width: `${p * 100}%` }} />

                {frozen !== null && (
                    <div className="absolute bottom-4 left-6 text-[10px] font-mono tracking-widest text-amber-400/80 border border-amber-400/30 rounded px-2 py-1">
                        ⏸ FROZEN p={frozen.toFixed(2)} — remove &amp;p= from URL to scroll
                    </div>
                )}
            </div>
        </div>
    );
}
