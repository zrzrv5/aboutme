import React, { useEffect, useRef, useState } from 'react';
import { ENTITIES, BIOMES, ITEMS, EDUCATION, HATS, LINKS, byId, progressOf } from './data';
import usePublications from '../usePublications';
import Chem from '../Chem';
import PaperAuthors from '../PaperAuthors';

const PLACES_BY_BIOME = Object.fromEntries(
  BIOMES.map((b) => [b.id, ENTITIES.filter((e) => e.biome === b.id && e.kind !== 'education')]),
);

function Details({ e }) {
  return (
    <div className="wp-more">
      {e.details?.length ? (
        <ul>
          {e.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ) : null}
      {e.list ? (
        <ul>
          {e.list.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ) : null}
      {e.stats ? (
        <p className="wp-stats">
          {e.stats.map((s) => (
            <span key={s.label}>
              {s.label} <b>{s.value}%</b>
            </span>
          ))}
        </p>
      ) : null}
      {e.links?.length ? (
        <p className="wp-links">
          {e.links.map((l) => (
            <a key={l.href} href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer">
              {l.label}
            </a>
          ))}
        </p>
      ) : null}
    </div>
  );
}

// The plain world never uses game words.
const plainMeta = (m) => {
  const t = m.replace(/^(Final boss|Mini-boss|Boss|Side quest) · /, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

function Row({ e, open, onToggle, flash }) {
  const prog = progressOf(e);
  const hasMore = e.details?.length || e.list || e.links?.length || e.stats;
  return (
    <li className={`wp-row ${open ? 'is-open' : ''} ${flash ? 'is-flash' : ''}`} data-entity={e.id}>
      <button type="button" className="wp-row-btn" onClick={onToggle} aria-expanded={open} disabled={!hasMore}>
        <span className="wp-main">
          <span className="wp-title">{e.title}</span>
          <span className="wp-meta">{plainMeta(e.meta)}{e.location ? ` · ${e.location}` : ''}</span>
          <span className="wp-sum">{e.summary}</span>
          {prog ? (
            <span className="wp-prog">
              <span className="wp-bar">
                <span style={{ width: `${prog.pct}%` }} />
              </span>
              {prog.text}
            </span>
          ) : null}
        </span>
        {hasMore ? <span className="wp-plus" aria-hidden="true" /> : null}
      </button>
      <div className="wp-collapse" inert={!open} aria-hidden={!open}>
        <div>
          <Details e={e} />
        </div>
      </div>
    </li>
  );
}

export default function PlainWorld({ focusId, onSwitch }) {
  const [open, setOpen] = useState(() => new Set(focusId ? [focusId] : []));
  const [flash, setFlash] = useState(focusId);
  const [hat, setHat] = useState(null);
  const last = useRef(focusId);
  const { list: papers, meta } = usePublications();

  useEffect(() => {
    if (!focusId) {
      window.scrollTo(0, 0);
      return undefined;
    }
    const raf = requestAnimationFrame(() => {
      const el = [...document.querySelectorAll('[data-entity]')].find((node) => node.dataset.entity === focusId);
      if (!el) return;
      const r = el.getBoundingClientRect();
      window.scrollTo(0, Math.max(0, r.top + window.scrollY - window.innerHeight * 0.3));
    });
    const t = setTimeout(() => setFlash(null), 1800);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [focusId]);

  const toggle = (id) => {
    last.current = id;
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  // Which entity is the reader looking at? The one nearest the middle of the screen.
  const current = () => {
    const els = [...document.querySelectorAll('[data-entity]')];
    const mid = window.innerHeight * 0.45;
    let best = null;
    let bd = Infinity;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      const d = Math.abs((r.top + r.bottom) / 2 - mid);
      if (d < bd) {
        bd = d;
        best = el.dataset.entity;
      }
    }
    if (last.current) {
      const el = [...document.querySelectorAll('[data-entity]')].find((node) => node.dataset.entity === last.current);
      const r = el?.getBoundingClientRect();
      if (r && r.bottom > 0 && r.top < window.innerHeight) return last.current;
    }
    return best;
  };

  const active = HATS.find((h) => h.id === hat);
  const home = byId.home;
  const job = byId.job;

  return (
    <div className="rz-wplain">
      <button type="button" className="wp-switch" onClick={() => onSwitch(current())}>
        <img src="/game/portrait.png" width="20" height="20" alt="" />
        Explore the island ↗
      </button>

      <main className="wp-page">
        <header className="wp-head" data-entity="home">
          <h1>
            Rui Zhou <span className="wp-dim">周睿</span>
          </h1>
          <p className="wp-hats">
            I’m a{' '}
            {HATS.map((h, i) => (
              <React.Fragment key={h.id}>
                <button
                  type="button"
                  className={`wp-hat ${hat === h.id ? 'on' : ''}`}
                  onClick={() => setHat((c) => (c === h.id ? null : h.id))}
                  aria-pressed={hat === h.id}
                >
                  {h.label}
                </button>
                {i === 0 ? ', ' : i === 1 ? ', and ' : '.'}
              </React.Fragment>
            ))}
            <span className={`wp-aside ${active ? 'on' : ''}`} aria-live="polite">
              {active?.aside}
            </span>
          </p>
          <p>{home.details[0].replace('I simulate', 'At Iowa State I simulate')}</p>
          <p>{home.details[1]}</p>
        </header>

        <section className="wp-job" data-entity="job">
          <p>{job.summary}</p>
          <nav className="wp-contact" aria-label="Contact">
            <a href={LINKS.email}>Email</a>
            <a href={LINKS.resume}>Résumé</a>
            <a href={LINKS.cv}>CV</a>
            <a href={LINKS.scholar}>Scholar</a>
            <a href={LINKS.linkedin}>LinkedIn</a>
            <a href={LINKS.github}>GitHub</a>
          </nav>
        </section>

        <nav className="wp-index" aria-label="Areas of work">
          {BIOMES.map((b) => <a key={b.id} href={`#work-${b.id}`}><span>{b.number}</span>{b.plain}<span>↗</span></a>)}
        </nav>

        {BIOMES.map((b) => (
          <section key={b.id} id={`work-${b.id}`} className={`wp-section ${flash === `biome:${b.id}` ? 'is-flash' : ''}`} data-entity={`biome:${b.id}`}>
            <p className="wp-section-number">{b.number}</p>
            <h2>{b.plain}</h2>
            <p className="wp-section-intro">{b.blurb}</p>
            {b.id === 'software' ? <h3 className="wp-subheading">Simulation & visualization</h3> : null}
            <ul className="wp-list">
              {PLACES_BY_BIOME[b.id].filter((e) => e.group !== 'agents').map((e) => (
                <Row key={e.id} e={e} open={open.has(e.id)} onToggle={() => toggle(e.id)} flash={flash === e.id} />
              ))}
            </ul>
            {b.id === 'software' ? <><h3 className="wp-subheading">Agents & research workflows</h3><ul className="wp-list">{PLACES_BY_BIOME[b.id].filter((e) => e.group === 'agents').map((e) => <Row key={e.id} e={e} open={open.has(e.id)} onToggle={() => toggle(e.id)} flash={flash === e.id} />)}</ul></> : null}
          </section>
        ))}

        <section className="wp-section" data-entity="library">
          <h2>
            Papers
          </h2>
          <p className="wp-section-intro">{papers.length || 13} peer-reviewed, {papers.filter((paper) => paper.firstAuthor).length || 5} as first author. Reviewer for {meta?.peerReviews ?? 4} manuscripts.</p>
          <ol className={`wp-papers ${flash === 'library' ? 'is-flash' : ''}`}>
            {papers.map((p) => (
              <li key={p.link}>
                <span className="wp-year">{p.year}</span>
                <a href={p.link} target="_blank" rel="noreferrer">
                  <Chem>{p.title}</Chem>
                </a>
                <PaperAuthors authors={p.authors}/>
                <span className="wp-meta">
                  {p.venue}
                  {p.firstAuthor ? ' · first author' : ''}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="wp-section">
          <h2>
            Tools <span>and where I used them</span>
          </h2>
          <ul className="wp-tools">
            {ITEMS.map((i) => (
              <li key={i.id} data-entity={`item:${i.id}`}>
                <b>{i.what}</b>
                <span>{i.tools}</span>
                <span className="wp-meta">
                  {[i.found, ...i.used]
                    .filter((u) => u !== 'home')
                    .map((u) => byId[u].title)
                    .join(', ') || i.foundNote}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="wp-section">
          <h2>Education</h2>
          <ul className="wp-tools">
            {EDUCATION.map((e) => (
              <li key={e.id} data-entity={e.id === 'isu' ? undefined : e.id} className={flash === e.id ? 'is-flash' : undefined}>
                <b>{e.school}</b>
                <span>
                  {e.degree}, {e.when}
                </span>
                {e.note ? <span className="wp-meta">{e.note}</span> : null}
              </li>
            ))}
          </ul>
        </section>

        <footer className="wp-foot">
          <p>Rui Zhou · Ames, Iowa.</p><a href="?v=lab">Other explorations ↗</a><a href="/">Original site ↗</a>
        </footer>
      </main>
    </div>
  );
}
