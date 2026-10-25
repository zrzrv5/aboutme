import React, { useEffect, useRef, useState } from 'react';

// Hand-drawn marks. Paths are jittered with a seeded random so they look drawn but never change between renders.

function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function ellipsePath(w, h, seed = 1) {
  const r = rng(seed);
  const cx = w / 2;
  const cy = h / 2;
  const pts = [];
  const turns = 1.06;
  const steps = 40;
  const start = -2.6 + r() * 0.4;
  for (let i = 0; i <= steps; i++) {
    const t = start + (i / steps) * Math.PI * 2 * turns;
    const wob = 1 + (r() - 0.5) * 0.05;
    const grow = 1 + (i / steps) * 0.06;
    pts.push([cx + Math.cos(t) * (w / 2) * wob * grow, cy + Math.sin(t) * (h / 2) * wob]);
  }
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
}

function linePath(w, y, seed = 1, wave = 1.6) {
  const r = rng(seed);
  const steps = Math.max(6, Math.round(w / 14));
  let d = `M0 ${(y + (r() - 0.5) * 2).toFixed(1)}`;
  for (let i = 1; i <= steps; i++) {
    const x = (i / steps) * w;
    d += ` L${x.toFixed(1)} ${(y + (r() - 0.5) * wave * 2 + (i / steps) * -1.2).toFixed(1)}`;
  }
  return d;
}

function scribblePath(w, h, seed = 1) {
  // Back-and-forth cross-out, like the old site's skill scratches.
  const r = rng(seed);
  const passes = 2;
  let d = `M-2 ${h * 0.58}`;
  for (let i = 1; i <= passes * 2; i++) {
    const x = i % 2 ? w + r() * 4 : -r() * 4;
    const y = h * 0.42 + r() * h * 0.26;
    d += ` Q${(w / 2).toFixed(1)} ${(y + (r() - 0.5) * 6).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

// Fires once when the element scrolls into view.
function useSeen(ref) {
  // Server and client both start with readable annotations, including without JS.
  const [seen, setSeen] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return seen;
}

function useSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

// Highlighter swipe behind text.
export function Hl({ children, delay = 0 }) {
  const ref = useRef(null);
  const seen = useSeen(ref);
  return (
    <mark ref={ref} className={`mg-hl ${seen ? 'in' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </mark>
  );
}

// Pen circle around text.
export function Circle({ children, seed = 3, delay = 0 }) {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const { w, h } = useSize(ref);
  const pw = w + 14;
  const ph = h + 4;
  return (
    <span ref={ref} className="mg-circle">
      {children}
      {w > 0 && (
        <svg className="mg-ink" width={pw} height={ph} viewBox={`0 0 ${pw} ${ph}`} style={{ left: -7, top: -2 }} aria-hidden="true">
          <path
            d={ellipsePath(pw - 4, ph - 4, seed)}
            transform="translate(2 2)"
            pathLength="1"
            className={`mg-stroke ${seen ? 'in' : ''}`}
            style={{ transitionDelay: `${delay}ms` }}
          />
        </svg>
      )}
    </span>
  );
}

// Pen underline.
export function Under({ children, seed = 5, delay = 0 }) {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const { w, h } = useSize(ref);
  return (
    <span ref={ref} className="mg-under">
      {children}
      {w > 0 && (
        <svg className="mg-ink" width={w + 6} height={10} viewBox={`0 0 ${w + 6} 10`} style={{ left: -3, top: h - 3 }} aria-hidden="true">
          <path d={linePath(w + 6, 5, seed)} pathLength="1" className={`mg-stroke ${seen ? 'in' : ''}`} style={{ transitionDelay: `${delay}ms` }} />
        </svg>
      )}
    </span>
  );
}

// Scribbled-out text, with a replacement written next to it.
export function Scratch({ children, seed = 7, delay = 0 }) {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const { w, h } = useSize(ref);
  return (
    <span ref={ref} className="mg-scratch">
      <span className="mg-scratch-text">{children}</span>
      {w > 0 && (
        <svg className="mg-ink mg-red" width={w + 8} height={h} viewBox={`-4 0 ${w + 8} ${h}`} style={{ left: -4, top: 0 }} aria-hidden="true">
          <path d={scribblePath(w, h, seed)} pathLength="1" className={`mg-stroke ${seen ? 'in' : ''}`} style={{ transitionDelay: `${delay}ms` }} />
        </svg>
      )}
    </span>
  );
}

// A correction: the printed words struck through in red, with the
// handwritten replacement after them. With notes off, the print reads alone.
export function Fix({ children, to, seed = 7, delay = 400 }) {
  return (
    <span className="mg-fix">
      <del><Scratch seed={seed} delay={delay}>{children}</Scratch></del>{' '}
      <ins className="mg-fix-new">{to}</ins>
    </span>
  );
}

// Match the arrow to the annotation's position relative to its subject.
const NOTE_ARROWS={
  left:['M34 8 C 26 4, 14 6, 6 15','M6 15 L8 7 M6 15 L14 14'],
  'up-left':['M34 27 C 16 29, 5 19, 7 4','M7 4 L2 12 M7 4 L15 10'],
  'up-right':['M6 27 C 24 29, 35 19, 33 4','M33 4 L25 10 M33 4 L38 12'],
};
export function Note({ children, arrow = false, tilt = -2, delay = 250, className = '' }) {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const direction=typeof arrow==='string'?arrow:'left';
  return (
    <span
      ref={ref}
      className={`mg-note ${seen ? 'in' : ''} ${className}`}
      style={{ '--tilt': `${tilt}deg`, transitionDelay: `${delay}ms` }}
    >
      {arrow && (
        <svg className={`mg-arrow mg-arrow-${direction}`} width="40" height="32" viewBox="0 0 40 32" aria-hidden="true">
          {(NOTE_ARROWS[direction]??NOTE_ARROWS.left).map((path,index)=><path key={index} d={path}/>)}
        </svg>
      )}
      <span className="mg-note-text">{children}</span>
    </span>
  );
}
