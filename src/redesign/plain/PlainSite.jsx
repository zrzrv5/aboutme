import React, { useCallback, useEffect, useRef, useState } from 'react';
import { person, hats, links, experience, education, patents, apps, sideProjects, figures, tools } from '../content';
import usePublications from '../usePublications';
import './plain.css';

// Follows the cursor with a little lag and shows the figure for the hovered row.
function usePreview() {
  const ref = useRef(null);
  const [fig, setFig] = useState(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return undefined;
    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${pos.current.x + 24}px, ${pos.current.y - 40}px, 0)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove);
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const bind = useCallback(
    (key) =>
      key
        ? {
            onMouseEnter: (e) => {
              if (!window.matchMedia('(pointer: fine)').matches) return;
              if (!fig) pos.current = { x: e.clientX, y: e.clientY };
              setFig(key);
            },
            onMouseLeave: () => setFig(null),
          }
        : {},
    [fig],
  );

  const node = (
    <div className="pl-preview" ref={ref} aria-hidden="true">
      {Object.entries(figures).map(([key, f]) => (
        <img
          key={key}
          src={f.src}
          alt=""
          width={f.w}
          height={f.h}
          className={fig === key ? 'on' : ''}
          style={{ aspectRatio: `${f.w} / ${f.h}`, width: f.h > f.w ? 220 : 320 }}
          loading="lazy"
        />
      ))}
    </div>
  );

  return { bind, node };
}

function Section({ title, count, hidden, children }) {
  return (
    <section className={`pl-section ${hidden ? 'is-hidden' : ''}`} aria-hidden={hidden || undefined}>
      <div className="pl-collapse">
        <div>
          <h2>
            {title}
            {count != null && <span className="pl-count">{count}</span>}
          </h2>
          {children}
        </div>
      </div>
    </section>
  );
}

function WorkRow({ job, open, onToggle }) {
  const years = job.start === job.end ? `${job.start}` : `${job.start}–${String(job.end).slice(2)}`;
  return (
    <li className={`pl-row pl-work ${open ? 'is-open' : ''}`}>
      <button type="button" className="pl-row-btn" onClick={onToggle} aria-expanded={open}>
        <span className="pl-year">{years}</span>
        <span className="pl-main">
          {job.org}
          <span className="pl-dim"> · {job.short}</span>
        </span>
        <span className="pl-plus" aria-hidden="true" />
      </button>
      <div className="pl-collapse">
        <div>
          <ul className="pl-points">
            <li className="pl-full-title">
              {job.title}, {job.when}
            </li>
            {job.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

export default function PlainSite() {
  const [hat, setHat] = useState(null);
  const [openJob, setOpenJob] = useState(null);
  const [allPapers, setAllPapers] = useState(false);
  const { list: papers, meta } = usePublications();
  const { bind, node } = usePreview();

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.classList.add('pl-body');
    return () => {
      document.body.classList.remove('pl-body');
      document.body.style.background = prev;
    };
  }, []);

  const show = (h) => hat === null || hat === h;
  const pick = (id) => setHat((cur) => (cur === id ? null : id));
  const active = hats.find((h) => h.id === hat);
  const shownPapers = allPapers ? papers : papers.filter((p) => p.firstAuthor || p.figure).slice(0, 6);

  return (
    <div className="rz-plain">
      <main className="pl-page">
        <header className="pl-head">
          <h1>
            Rui Zhou <span className="pl-dim pl-zh">{person.nameZh}</span>
          </h1>
          <p className="pl-hats">
            I’m a{' '}
            {hats.map((h, i) => (
              <React.Fragment key={h.id}>
                <button
                  type="button"
                  className={`pl-hat ${hat === h.id ? 'on' : ''} ${hat && hat !== h.id ? 'off' : ''}`}
                  aria-pressed={hat === h.id}
                  onClick={() => pick(h.id)}
                >
                  {h.label}
                </button>
                {i === 0 ? ', ' : i === 1 ? ', and ' : '.'}
              </React.Fragment>
            ))}
            <span className={`pl-aside ${active ? 'on' : ''}`} aria-live="polite">
              {active?.aside}
            </span>
          </p>
          <p>
            At Iowa State I simulate battery and semiconductor materials with DFT and machine-learning potentials.
            Before that I spent two years on battery simulation at Sunwoda, and in summer 2026 I interned at Seagate.
          </p>
          <p>{person.looking}</p>
          <nav className="pl-links" aria-label="Contact">
            <a href={links.email}>Email</a>
            <a href={links.resume}>Résumé</a>
            <a href={links.cv}>CV</a>
            <a href={links.scholar}>Scholar</a>
            <a href={links.linkedin}>LinkedIn</a>
            <a href={links.github}>GitHub</a>
          </nav>
        </header>

        <Section title="Work" hidden={hat === 'apps'}>
          <ul className="pl-list">
            {experience.map((job) =>
              show(job.hat) ? (
                <WorkRow
                  key={job.id}
                  job={job}
                  open={openJob === job.id}
                  onToggle={() => setOpenJob((cur) => (cur === job.id ? null : job.id))}
                />
              ) : null,
            )}
          </ul>
        </Section>

        <Section title="Papers" count={meta ? papers.length : null} hidden={!show('research')}>
          <ul className="pl-list">
            {shownPapers.map((p) => (
              <li key={p.link} className="pl-row" {...bind(p.figure)}>
                <a href={p.link} className="pl-row-link" target="_blank" rel="noreferrer">
                  <span className="pl-year">{p.year}</span>
                  <span className="pl-main">
                    {p.title}
                    <span className="pl-sub">
                      {p.venue}
                      {p.firstAuthor ? ' · first author' : ''}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {papers.length > shownPapers.length || allPapers ? (
            <button type="button" className="pl-more" onClick={() => setAllPapers((v) => !v)}>
              {allPapers ? 'Fewer' : `All ${papers.length}`}
            </button>
          ) : null}
        </Section>

        <Section title="Patents" count={patents.length} hidden={!show('industry')}>
          <ul className="pl-list">
            {patents.map((p) => (
              <li key={p.id} className="pl-row">
                <div className="pl-row-static">
                  <span className="pl-year">{p.year}</span>
                  <span className="pl-main">
                    {p.title}
                    <span className="pl-sub pl-mono">{p.id}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Apps" hidden={!show('apps')}>
          <ul className="pl-list">
            {apps.map((a) => {
              const Tag = a.href ? 'a' : 'div';
              return (
                <li key={a.id} className="pl-row" {...bind(a.figure)}>
                  <Tag
                    className={a.href ? 'pl-row-link' : 'pl-row-static'}
                    {...(a.href ? { href: a.href, target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    <span className="pl-year">{a.year}</span>
                    <span className="pl-main">
                      {a.name}
                      <span className="pl-sub">{a.what}</span>
                      <span className="pl-sub pl-note">{a.note}</span>
                    </span>
                    <span className="pl-meta">{a.meta}</span>
                  </Tag>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title="On the side" hidden={!show('apps')}>
          <ul className="pl-list">
            {sideProjects.map((s) => {
              const Tag = s.href ? 'a' : 'div';
              return (
                <li key={s.name} className="pl-row">
                  <Tag
                    className={s.href ? 'pl-row-link' : 'pl-row-static'}
                    {...(s.href ? { href: s.href, target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    <span className="pl-year" />
                    <span className="pl-main">
                      {s.name}
                      <span className="pl-sub">{s.what}</span>
                    </span>
                  </Tag>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title="Education" hidden={hat === 'apps' || hat === 'industry'}>
          <ul className="pl-list">
            {education.map((e) => (
              <li key={e.school} className="pl-row">
                <div className="pl-row-static">
                  <span className="pl-year">{e.when.slice(-4)}</span>
                  <span className="pl-main">
                    {e.school}
                    <span className="pl-sub">
                      {e.degree}
                      {e.note ? `. ${e.note}` : ''}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Tools" hidden={false}>
          <p className="pl-tools">
            {[...tools.simulation, ...tools.ml, ...tools.code].join(', ')}.
          </p>
        </Section>

        <footer className="pl-foot">
          <p>
            Ames, Iowa{meta?.lastUpdated ? ` · updated ${meta.lastUpdated}` : ''}
          </p>
        </footer>
      </main>
      {node}
    </div>
  );
}
