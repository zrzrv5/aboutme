import React, { useEffect, useState } from 'react';
import { person, hats, links, experience, education, patents, apps, sideProjects, figures, tools } from '../content';
import usePublications from '../usePublications';
import './wall.css';

// The wall: real images at real proportions, numbered like catalogue plates.
const PLATES = [
  { fig: 'cover', span: 'a', title: 'Na₂B₁₂H₁₂, superionic phase', kind: 'Cover art, ACS Electrochemistry', year: 2024, href: 'https://doi.org/10.1021/acselectrochem.4c00077' },
  { fig: 'naiive', span: 'b', title: 'NAIIVE', kind: 'Atomistic visualizer for Apple platforms', year: 2026, href: 'https://naiive.1sec.plus' },
  { fig: 'closo', span: 'c', title: 'Anion topology in closo-hydroborates', kind: 'ACS Appl. Energy Mater.', year: 2026, href: 'https://doi.org/10.1021/acsaem.6c00367' },
  { fig: 'totk', span: 'd', title: 'TotK Companion', kind: '#2 in the US App Store', year: 2023, href: 'https://apps.apple.com/us/app/tears-of-the-kingdom-companion/id6448892536' },
  { fig: 'lisips', span: 'e', title: 'Lithium sulfide glass electrolytes', kind: 'ACS Appl. Mater. Interfaces', year: 2024, href: 'https://doi.org/10.1021/acsami.4c00618' },
  { fig: 'amiibot', span: 'f', title: 'AmiiBot', kind: 'NFC Amiibo tracker, 10K+ downloads', year: 2020, href: 'https://apps.apple.com/us/app/amiibot/id1514835611' },
  { fig: 'ling', span: 'g', title: 'L!NG', kind: 'Timetable for Apple Watch', year: 2017, href: null },
  { fig: 'carbon', span: 'h', title: 'N-doped carbon nanofibers', kind: 'J. Colloid Interface Sci.', year: 2017, href: 'https://doi.org/10.1016/j.jcis.2017.07.117' },
];

const pad = (n) => String(n).padStart(2, '0');

// Archivo's ampersand reads like a typo in "R&D"; set it in Helvetica instead.
const amp = (text) =>
  text.split('&').flatMap((part, i) => (i ? [<span key={i} className="wl-amp">&amp;</span>, part] : [part]));

function Plate({ p, i }) {
  const f = figures[p.fig];
  const Tag = p.href ? 'a' : 'div';
  return (
    <Tag
      className={`wl-plate wl-span-${p.span}`}
      {...(p.href ? { href: p.href, target: '_blank', rel: 'noreferrer' } : {})}
    >
      <span className="wl-img" style={{ aspectRatio: `${f.w} / ${f.h}` }}>
        <img src={f.src} alt={p.title} width={f.w} height={f.h} loading="lazy" />
      </span>
      <span className="wl-cap">
        <span className="wl-no">{pad(i + 1)}</span>
        <span className="wl-cap-t">{p.title}</span>
        <span className="wl-cap-k">
          {p.kind}, {p.year}
        </span>
      </span>
    </Tag>
  );
}

export default function WallSite() {
  const [hover, setHover] = useState(null);
  const { list: papers } = usePublications();

  useEffect(() => {
    document.body.classList.add('wl-body');
    return () => document.body.classList.remove('wl-body');
  }, []);

  const target = { research: '#research', industry: '#industry', apps: '#apps' };

  return (
    <div className="rz-wall">
      <header className="wl-strip">
        <span className="wl-c1">
          <b>Rui Zhou</b> {person.nameZh}
        </span>
        <span className="wl-c2">
          Computational materials,
          <br />
          batteries, iOS apps
        </span>
        <span className="wl-c3">
          Ames, Iowa
          <br />
          Free from May 2027
        </span>
        <nav className="wl-c4" aria-label="Contact">
          <a href={links.email}>Email</a>
          <a href={links.resume}>Résumé</a>
          <a href={links.cv}>CV</a>
          <a href={links.scholar}>Scholar</a>
          <a href={links.linkedin}>LinkedIn</a>
          <a href={links.github}>GitHub</a>
        </nav>
      </header>

      <section className="wl-hero" aria-label="Introduction">
        <p className="wl-im">I’m a</p>
        <h1 className="wl-hats">
          {hats.map((h) => (
            <a
              key={h.id}
              href={target[h.id]}
              className={`wl-hat ${hover && hover !== h.id ? 'dim' : ''}`}
              onMouseEnter={() => setHover(h.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(h.id)}
              onBlur={() => setHover(null)}
            >
              <span className="wl-hat-word">{h.label}</span>
              <span className="wl-hat-aside">{amp(h.aside)}</span>
            </a>
          ))}
        </h1>
        <div className="wl-hero-foot">
          <p className="wl-lede">
            At Iowa State I simulate battery and semiconductor materials with DFT and machine-learning
            potentials. Before that, two years of battery simulation at Sunwoda; in 2026, an internship at Seagate.
          </p>
          <p className="wl-lede wl-lede-2">{amp(person.looking)}</p>
        </div>
      </section>

      <section className="wl-wall" aria-label="Selected work">
        <h2 className="wl-label">
          <span>Plates</span>
          <span>Figures, covers and apps, 2017–2026</span>
        </h2>
        <div className="wl-grid">
          {PLATES.map((p, i) => (
            <Plate key={p.fig} p={p} i={i} />
          ))}
        </div>
      </section>

      <section className="wl-work" id="industry" aria-label="Work">
        <h2 className="wl-label">
          <span>Work</span>
          <span>{experience.length} positions</span>
        </h2>
        {experience.map((job) => (
          <article key={job.id} className="wl-job" id={job.id === 'isu' ? 'research' : undefined}>
            <p className="wl-job-years">
              {job.start === job.end ? job.start : `${job.start}–${String(job.end).slice(2)}`}
            </p>
            <div className="wl-job-head">
              <h3>{job.org}</h3>
              <p>{job.title}</p>
              <p className="wl-dim">{job.when}</p>
            </div>
            <ul className="wl-job-pts">
              {job.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="wl-index" aria-label="Papers and patents">
        <h2 className="wl-label">
          <span>Index</span>
          <span>
            {papers.length || 13} papers, {patents.length} patents
          </span>
        </h2>
        <table className="wl-table">
          <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col">Year</th>
              <th scope="col">Title</th>
              <th scope="col">Where</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p, i) => (
              <tr key={p.link}>
                <td className="wl-num">{pad(i + 1)}</td>
                <td className="wl-num">{p.year}</td>
                <td>
                  <a href={p.link} target="_blank" rel="noreferrer">
                    {p.title}
                  </a>
                  {p.firstAuthor ? <span className="wl-first">First author</span> : null}
                </td>
                <td className="wl-dim">{p.venue}</td>
              </tr>
            ))}
            {patents.map((p, i) => (
              <tr key={p.id}>
                <td className="wl-num">{pad(papers.length + i + 1)}</td>
                <td className="wl-num">{p.year}</td>
                <td>{p.title}</td>
                <td className="wl-dim wl-mono">{p.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="wl-apps" id="apps" aria-label="Apps">
        <h2 className="wl-label">
          <span>Apps</span>
          <span>Yep, native apps only</span>
        </h2>
        <div className="wl-cols">
          {apps.map((a) => (
            <div key={a.id} className="wl-app">
              <p className="wl-app-year">{a.year}</p>
              <h3>{a.name}</h3>
              <p>{a.what}</p>
              <p className="wl-dim">{a.meta}</p>
              {a.links.length ? (
                <p className="wl-app-links">
                  {a.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                  ))}
                </p>
              ) : null}
            </div>
          ))}
        </div>
        <div className="wl-cols wl-side">
          {sideProjects.map((s) => (
            <div key={s.name} className="wl-app">
              <h3>
                {s.href ? (
                  <a href={s.href} target="_blank" rel="noreferrer">
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
              </h3>
              <p className="wl-dim">{s.what}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wl-misc" aria-label="Education and tools">
        <div>
          <h2 className="wl-label wl-label-small">
            <span>Education</span>
          </h2>
          {education.map((e) => (
            <p key={e.school} className="wl-edu">
              <b>{e.school}</b>
              <br />
              {e.degree}, {e.when}
            </p>
          ))}
        </div>
        <div>
          <h2 className="wl-label wl-label-small">
            <span>Tools</span>
          </h2>
          <p className="wl-edu">{tools.simulation.join(', ')}</p>
          <p className="wl-edu">{tools.ml.join(', ')}</p>
          <p className="wl-edu">{tools.code.join(', ')}</p>
        </div>
      </section>

      <footer className="wl-foot">
        <p className="wl-label">
          <span>Contact</span>
          <span>{amp(person.looking)}</span>
        </p>
        <a className="wl-mail" href={links.email}>
          {links.emailText}
        </a>
        <p className="wl-foot-links">
          <a href={links.resume}>Résumé (PDF)</a>
          <a href={links.cv}>CV (PDF)</a>
          <a href={links.scholar}>Google Scholar</a>
          <a href={links.orcid}>ORCID</a>
          <a href={links.linkedin}>LinkedIn</a>
          <a href={links.github}>GitHub</a>
        </p>
      </footer>
    </div>
  );
}
