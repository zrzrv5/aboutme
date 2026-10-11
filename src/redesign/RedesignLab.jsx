import React, { Suspense, lazy, useEffect } from 'react';
import { VARIANTS as KEYS } from './variant';
import './lab.css';

const LOADERS = {
  worlds: lazy(() => import('./worlds/WorldsSite')),
  plain: lazy(() => import('./plain/PlainSite')),
  wall: lazy(() => import('./wall/WallSite')),
  margins: lazy(() => import('./margins/MarginsSite')),
};

const NOTES = {
  worlds: ['W', 'Two worlds', 'A plain professional page and a Zelda-like map of the same things. Switch between them; you land on the same item.'],
  plain: ['1', 'Plain', 'Text first, one column, system font. Figures and app art appear as you hover. Your “I’m a ___” switch filters the page.'],
  wall: ['2', 'Wall', 'Loud and visual. A strict grid, very large type, and your real figures and app art printed big, like an exhibition catalogue.'],
  margins: ['3', 'Margins', 'A properly typeset résumé with your own pen notes on top. One switch removes the notes for a clean, printable copy.'],
};

function Switcher({ current }) {
  return (
    <nav className="lab-switcher" aria-label="Redesign directions">
      <a href="?v=lab" className={current === 'lab' ? 'on' : ''}>All</a>
      {KEYS.map((key) => (
        <a key={key} href={`?v=${key}`} className={current === key ? 'on' : ''}>
          {NOTES[key][0]}
        </a>
      ))}
      <a href="/">Current</a>
    </nav>
  );
}

function Chooser() {
  return (
    <main className="lab-chooser">
      <h1>Redesign, round 2</h1>
      <ol>
        {KEYS.map((key) => (
          <li key={key}>
            <a href={`?v=${key}`}>
              {NOTES[key][0]}. {NOTES[key][1]}
            </a>
            <p>{NOTES[key][2]}</p>
          </li>
        ))}
      </ol>
      <p className="lab-foot">
        The current site is untouched at <a href="/">/</a>.
      </p>
    </main>
  );
}

export default function RedesignLab({ variant }) {
  useEffect(() => {
    document.body.classList.add('redesign-lab');
    document.body.style.backgroundColor = '';
    document.title = 'Rui Zhou';
    return () => document.body.classList.remove('redesign-lab');
  }, []);

  const Site = LOADERS[variant];

  return (
    <>
      {Site ? (
        <Suspense fallback={<div className="lab-loading" />}>
          <Site />
        </Suspense>
      ) : (
        <Chooser />
      )}
      {variant !== 'worlds' ? <Switcher current={variant} /> : null}
    </>
  );
}
