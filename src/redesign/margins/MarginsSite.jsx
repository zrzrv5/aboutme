import React, { useEffect, useState } from 'react';
import { links, patents } from '../content';
import usePublications from '../usePublications';
import { Hl, Under, Note } from './ink';
import Chem from '../Chem';
import PaperAuthors from '../PaperAuthors';
import { ITEMS, EDUCATION, byId } from '../worlds/data';
import { skillJourney } from '../worlds/skills';
import { marginTarget, siteUrl } from '../../site/routes';
import { track, trackOnce } from '../../site/analytics';
import Privacy from '../../site/Privacy';
import './margins.css';

function Row({ children, label, note, className = '', id, project = false }) {
  return <div className={`mg-row ${className}`} id={id} tabIndex={id ? -1 : undefined} data-project-id={project ? id : undefined}>
    <div className="mg-label">{label}</div>
    <div className="mg-body">{children}</div>
    {note ? <aside className="mg-margin">{note}</aside> : <div className="mg-margin"/>}
  </div>;
}

function ProjectLinks({project}) {
  if(!project.links?.length)return null;
  return <p className="mg-project-links">{project.links.map(link=><a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<span aria-hidden="true"> ↗</span></a>)}</p>;
}

const APP_NOTES={
  naiive:<Note arrow tilt={-2}>built to look at my own simulations</Note>,
  totk:<Note arrow tilt={2}>built in two days, back in 2023</Note>,
  amiibot:<Note arrow tilt={3}>a pandemic project that unexpectedly went viral</Note>,
  ling:<Note tilt={-3}>bring back Time Travel!</Note>,
};
const APP_COPY={
  naiive:'A workspace for seeing what a simulation is actually doing. Open trajectories and ML-potential datasets, build a view with nodes, then inspect the atoms on screen or in AR.',
  totk:'A map and collection tracker for Tears of the Kingdom, with iCloud sync. An early experiment in building an app with generative AI; it reached #2 in the US App Store after launch.',
  amiibot:'A collection tracker that connects the digital list to the figures on your shelf, using NFC scanning and writing.',
  ling:'My first App Store app: a timetable designed for the wrist. Built around the Apple Watch and its then-new ways of moving through time. Now retired.',
};
const EXPERIMENTS=[
  ['typeshi','Element hypotheses from anonymous atom types and geometry.'],
  ['dpmetal','ML-potential inference on Apple GPUs, directly from Swift.'],
  ['trajview','Preview atomistic trajectories inside VS Code.'],
  ['slop','An agent runtime for remote research calculations.'],
  ['dshslop','Machine context and job tracking for agents on HPC.'],
  ['gradbench','Checking whether agents finish and verify research work.'],
  ['laneloaf','Dashcam footage turned into trip logs.'],
  ['gas','Compare cheaper fuel against the extra drive.'],
  ['fuji','A Bluetooth camera shutter on Apple Watch.'],
];
const SCHOOL_NAMES=Object.fromEntries(EDUCATION.map(school=>[school.id,school.school]));
const JOURNEY=[
  {id:'isu',title:'Iowa State University',role:'PhD candidate · Materials Science and Engineering',period:'2023 – May 2027 (expected)',text:'Electronic-structure calculations, active learning and ML potentials are my day-to-day tools for studying atomic motion. I also build the software I need to inspect and organize the resulting data.'},
  {id:'seagate',title:'Seagate Technology',role:'Advanced Data Storage Material Discovery Intern',period:'Summer 2026 · Minnesota',text:'Storage materials brought together thin-film ellipsometry data, chemical-property prediction and molecular dynamics of reader-head and coating materials.'},
  {id:'sunwoda',title:'Sunwoda Electric Vehicle Battery Co., Ltd.',role:'Simulation Engineer',period:'Dec 2020 – Dec 2022 · Shenzhen',text:byId.sunwoda.summary,work:[
    {title:'ML potentials & research software',text:'I worked on cathode ML-potential training and validation, and built tools to generate reference structures and analyze diffusion, lattice changes and material stability.'},
    {title:'Powder compaction',text:'I fitted DEM contact parameters to experimental density–pressure curves, then used the calibrated models to explore particle-size distributions and mixing ratios.'},
    {title:'Automatic model fitting',text:'I built Python tools to fit models across rates and temperatures, using particle-swarm and differential-evolution algorithms and interfaces to COMSOL.'},
  ]},
];

export default function MarginsSite({focusId, onSwitch, initialPublications}) {
  const [notes,setNotes]=useState(()=>{try{return localStorage.getItem('portfolio-notes')!=='off';}catch{return true;}});
  const {list:papers,status}=usePublications(initialPublications);
  const selectedPapers=papers.filter(p=>p.firstAuthor);

  useEffect(()=>{
    document.body.classList.add('mg-body-bg');
    return ()=>document.body.classList.remove('mg-body-bg');
  },[]);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      const target=document.getElementById(marginTarget(focusId));
      if(focusId&&target){target.scrollIntoView({block:'start'});target.focus({preventScroll:true});}
    });
    return ()=>cancelAnimationFrame(frame);
  },[focusId,status]);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting)trackOnce('section_view',entry.target.id,{section_id:entry.target.id});
    }),{threshold:.15});
    document.querySelectorAll('.mg-sheet > section[id]').forEach(section=>observer.observe(section));
    return ()=>observer.disconnect();
  },[]);
  function toggleNotes(){
    const visible=!notes;setNotes(visible);track('notes_toggle',{visible});
    try{localStorage.setItem('portfolio-notes',visible?'on':'off');}catch{/* Notes still work without storage. */}
  }
  return <div className={`rz-margins ${notes?'notes-on':'notes-off'}`}>
    <nav className="mg-tools" aria-label="Page view">
      <a className="mg-explore" href={siteUrl('world',focusId)} title="Explore the same research and projects on an interactive island" onClick={event=>{if(onSwitch&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();onSwitch(focusId);}}}>
        <span>Explore in 3D</span><span className="mg-tab-arrow" aria-hidden="true">↗</span>
      </a>
      <button className="mg-notes-toggle" type="button" role="switch" aria-checked={notes} onClick={toggleNotes} aria-label="My notes and highlights" title={notes?'Hide handwritten notes and highlights':'Show handwritten notes and highlights'}>
        <svg className="mg-note-check" viewBox="0 0 24 24" width="23" height="23" aria-hidden="true"><path className="mg-note-box" d="m4 5 15-1 1 16-16-1Z"/><path className="mg-note-tick" d="m6 11 5 5L21 3"/></svg>
        <span>my notes</span>
      </button>
    </nav>

    <article className="mg-sheet" aria-label="Rui Zhou’s research and projects">
      <header className="mg-head" id="profile" tabIndex={-1}>
        <Row note={<Note tilt={-3} delay={300}>atoms go brrrrr</Note>}>
          <h1>Rui Zhou</h1>
          <p className="mg-role">I study materials and build software to work with them.</p>
          <p className="mg-intro">My work spans battery materials, semiconductors, ceramics and metals. I use atomic simulations and machine learning to understand how they behave — and make tools for exploring the results.</p>
          <p className="mg-current">PhD candidate in Materials Science and Engineering at Iowa State University · Ames, Iowa · expected May 2027</p>
          <p className="mg-contact"><a href={links.email}>Email</a><a href={links.linkedin}>LinkedIn</a><a href={links.scholar}>Google Scholar</a><a href={links.github}>GitHub</a></p>
        </Row>
      </header>

      <section id="summary" tabIndex={-1}>
        <Row label={<h2 className="mg-h">Research</h2>}>
          <h3 className="mg-entry-title">How atoms move, and why it matters</h3>
          <p>In solid electrolytes, I study how disorder, phase changes and interfaces shape <Hl>ion transport</Hl>. My systems include thiophosphate glasses, closo-hydroborates and metal oxyhalides.</p>
          <p className="mg-project-links"><a data-analytics="publication" href="https://doi.org/10.1039/D6TA01253A" target="_blank" rel="noreferrer">Lithium–electrolyte interfaces ↗</a><a data-analytics="publication" href="https://doi.org/10.1021/acsaem.6c00367" target="_blank" rel="noreferrer">Closo-hydroborates ↗</a></p>
        </Row>
        <Row>
          <h3 className="mg-entry-title">When crystals deform</h3>
          <p>Other collaborations follow dislocations in high-entropy carbides and Mg–Bi alloys, and the effect of light on ZnS and CdTe. Electronic-structure calculations and ML potentials help connect atomic changes to <Hl>mechanical response</Hl>.</p>
          <p className="mg-project-links"><a data-analytics="publication" href="https://doi.org/10.1021/acsaenm.4c00280" target="_blank" rel="noreferrer">Carbide ceramics ↗</a><a data-analytics="publication" href="https://doi.org/10.1103/l83s-dwqz" target="_blank" rel="noreferrer">Mg–Bi alloys ↗</a><a data-analytics="publication" href="https://doi.org/10.1021/acsmaterialslett.4c01982" target="_blank" rel="noreferrer">ZnS photoplasticity ↗</a></p>
        </Row>
        <Row id="papers" className="mg-pub">
          <details className="mg-reading" open={focusId==='library'||undefined}>
            <summary>Selected papers &amp; authors</summary>
            {status==='loading'?<p role="status">Loading publications…</p>:status==='error'?<p>Find the publication list on <a href={links.scholar}>Google Scholar</a>.</p>:null}
            <ol>{selectedPapers.map(p=><li key={p.link}><a data-analytics="publication" href={p.link} target="_blank" rel="noreferrer"><Chem>{p.title}</Chem></a><PaperAuthors authors={p.authors}/><small>{p.venue} · {p.year}</small></li>)}</ol>
            <a href={links.scholar}>All publications on Google Scholar ↗</a>
          </details>
        </Row>
      </section>

      <section id="software" tabIndex={-1}>
        {['naiive','totk','amiibot','ling'].map((id,index)=>{
          const app=byId[id];
          return <Row key={id} id={id} project label={index===0?<h2 className="mg-h">Software</h2>:null} note={APP_NOTES[id]} className="mg-app">
            <h3 className="mg-entry-title">{app.title}</h3>
            <p>{APP_COPY[id]}</p>
            {id==='naiive'?<a className="mg-project-image" href="https://naiive.1sec.plus" target="_blank" rel="noreferrer" aria-label="Explore NAIIVE on its website"><img src="/images/projects/naiive-preview.jpg" width="600" height="300" loading="lazy" decoding="async" alt="NAIIVE’s molecular visualization and node editor"/></a>:null}
            <ProjectLinks project={app}/>
          </Row>;
        })}
      </section>

      <section id="projects" tabIndex={-1}>
        <Row label={<h2 className="mg-h">Experiments</h2>}><p className="mg-section-intro">Smaller tools and open questions, often prompted by something I wanted to use myself.</p></Row>
        <div className="mg-experiments-grid">
          {EXPERIMENTS.map(([id,description])=>{const project=byId[id];return <article id={id} tabIndex={-1} data-project-id={id} key={id} className="mg-experiment">
            <h3>{project.title}</h3><p>{description}</p><ProjectLinks project={project}/>
          </article>;})}
        </div>
      </section>

      <section id="experience" tabIndex={-1}>
        {JOURNEY.map((entry,index)=><Row key={entry.id} id={entry.id} label={index===0?<h2 className="mg-h">Along the way</h2>:null} className="mg-job">
          <h3 className="mg-entry-title">{entry.title}</h3><p className="mg-title">{entry.role}</p><p className="mg-when">{entry.period}</p><p>{entry.text}</p>
          {entry.work?<dl className="mg-work-notes">{entry.work.map(work=><div key={work.title}><dt>{work.title}</dt><dd>{work.text}</dd></div>)}</dl>:null}
          {entry.id==='sunwoda'?<details id="patents" tabIndex={-1} className="mg-reading" open={focusId==='patents'||undefined}><summary>Four patents from battery R&amp;D</summary><ul>{patents.map(p=><li key={p.id}>{p.title}. <span className="mg-dim">{p.id}</span></li>)}</ul></details>:null}
        </Row>)}
      </section>

      <section id="education" tabIndex={-1}>
        <Row label={<h2 className="mg-h">Earlier</h2>} id="wustl"><h3 className="mg-entry-title">Washington University in St. Louis</h3><p className="mg-title">Master of Science · Materials Science and Engineering</p><p className="mg-when">2018 – 2020 · St. Louis, Missouri</p><p>Studying water evaporating from graphene-coated silicon introduced me to molecular dynamics and working on a cluster.</p><p className="mg-coursework">Course projects added MEMS microfabrication — a team project building a passive-mixer microfluidic device — and CFD simulation with ANSYS Fluent.</p><p className="mg-project-links"><a data-analytics="publication" href="https://openscholarship.wustl.edu/eng_etds/694/" target="_blank" rel="noreferrer">Read the thesis ↗</a></p></Row>
        <Row id="cust"><h3 className="mg-entry-title">Changchun University of Science and Technology</h3><p className="mg-title">Bachelor of Science · Materials Science and Engineering</p><p className="mg-when">2014 – 2018 · Changchun, China</p><p>My starting point was experimental: carbon anode materials, electrospinning, synthesis and half-cell testing. Python and MATLAB began here, too.</p><p className="mg-project-links"><a data-analytics="publication" href="https://doi.org/10.1016/j.jcis.2017.07.117" target="_blank" rel="noreferrer">Carbon nanofibers ↗</a></p></Row>
      </section>

      <section id="skills" tabIndex={-1}>
        <Row label={<h2 className="mg-h">Skills</h2>} className="mg-skills">
          <details className="mg-skill-routes" open={focusId?.startsWith('item:')||undefined}>
            <summary>Skills &amp; where I’ve used them</summary>
            {ITEMS.map(tool=><details key={tool.id} open={focusId===`item:${tool.id}`||undefined} onToggle={event=>{if(event.target===event.currentTarget&&event.currentTarget.open)track('skill_select',{skill_id:tool.id});}}>
              <summary>{tool.what}</summary><ol>{skillJourney(tool).map(stage=><li key={stage.place}><b>Lv. {stage.level} · {stage.status} @ {SCHOOL_NAMES[stage.place]??byId[stage.place].title}</b><p>{stage.detail}</p></li>)}</ol>
            </details>)}
          </details>
        </Row>
      </section>

      <footer className="mg-footer">
        <Row label={<h2 className="mg-h">Say hello</h2>}>
          <p>I’m open to a wide range of roles and collaborations. I expect to graduate in May 2027. If you have an opportunity in mind, <Under seed={4}>I’d like to hear from you</Under>.</p>
          <p className="mg-project-links"><a href={links.email}>Email me</a><a href={links.cv}>Academic CV (PDF)</a><a href={links.resume}>Résumé (PDF)</a></p>
        </Row>
      </footer>
    </article>
    <Privacy/>
  </div>;
}
