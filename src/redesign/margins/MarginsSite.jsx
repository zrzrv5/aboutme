import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { links, patents, person, counts, experienceById, appById } from '../content';
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
import ProjectMedia from '../ProjectMedia';
import { readingFocus } from '../../site/reading-focus.js';
const subscribeNotes = () => () => {};
const savedNotes = () => {try{return localStorage.getItem('portfolio-notes')!=='off';}catch{return true;}};

function Row({ children, label, note, className = '', id, project = false }) {
  return <div className={`mg-row ${className}`} id={id} tabIndex={id ? -1 : undefined} data-project-id={project ? id : undefined} data-reading-focus={id}>
    <div className="mg-label">{label}</div>
    <div className="mg-body">{children}</div>
    {note ? <aside className="mg-margin">{note}</aside> : <div className="mg-margin"/>}
  </div>;
}

function ProjectLinks({project}) {
  if(!project.links?.length)return null;
  return <p className="mg-project-links">{project.links.map(link=><a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<span aria-hidden="true"> <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></span></a>)}</p>;
}

const APP_NOTES={
  naiive:<Note arrow="up-left" tilt={-2}>built to look at my own simulations</Note>,
  totk:<Note arrow="up-right" tilt={2}>built in two days, back in 2023</Note>,
  amiibot:<Note arrow="up-left" tilt={3}>a pandemic project that unexpectedly went viral</Note>,
  ling:<Note tilt={-3}>bring back Time Travel!</Note>,
};
const APP_COPY={
  naiive:'A workspace for seeing what a simulation is actually doing. Open trajectories and ML-potential datasets, build a view with nodes, then inspect the atoms on screen or in AR.',
  totk:'A map and collection tracker for Tears of the Kingdom, with iCloud sync. An early experiment in building an app with ChatGPT and Midjourney; it reached #2 in the US App Store after launch and #1 in other regions.',
  amiibot:'A collection tracker that connects the digital list to the figures on your shelf, using NFC scanning and writing.',
  ling:'My first App Store app: a timetable designed for the wrist. Built around the Apple Watch and its then-new ways of moving through time. Now retired.',
};
const EXPERIMENTS=[
  ['typeshi','Element hypotheses from anonymous atom types and geometry. A 1.9 MB model that answers in under a second on a CPU.'],
  ['dpmetal','ML-potential inference on Apple GPUs, directly from Swift. Verified up to 256,000 atoms on M1 Max and M4.'],
  ['trajview','Preview atomistic trajectories inside VS Code.'],
  ['slop','A research-agent runtime connecting reusable methods, remote machines and long-running calculations.'],
  ['dshslop','Persistent cluster sessions, machine notes and a Slurm/PBS job ledger for research agents.'],
  ['gradbench','Research-workflow benchmarks for comparing models and harnesses on recovery, completion and verification.'],
  ['laneloaf','Dashcam footage turned into trip logs.'],
  ['gas','Compare cheaper fuel against the extra drive.'],
  ['fuji','A Bluetooth camera shutter on Apple Watch.'],
];
const EXPERIMENT_STATUS={slop:'Private project',dshslop:'In development',gradbench:'In development',fuji:'Unreleased'};
const SCHOOL_NAMES=Object.fromEntries(EDUCATION.map(school=>[school.id,school.school]));
const JOURNEY=[
  {id:'isu',title:'Iowa State University',role:'PhD candidate · Materials Science and Engineering',period:experienceById.isu.when,text:'Electronic-structure calculations, active learning and ML potentials are my day-to-day tools for studying atomic motion. I also build the software I need to inspect and organize the resulting data.'},
  {id:'seagate',title:'Seagate Technology',role:'Advanced Data Storage Material Discovery Intern',period:`${experienceById.seagate.when} · ${experienceById.seagate.location}`,text:'At Seagate, I developed an end-to-end machine-learning workflow for thin-film ellipsometry data analysis, built graph-neural-network and RDKit-descriptor models for chemical-property prediction, and used molecular dynamics to study reader-head coating materials.'},
  {id:'sunwoda',title:experienceById.sunwoda.org,role:'Simulation Engineer',period:`${experienceById.sunwoda.when} · ${experienceById.sunwoda.location}`,text:byId.sunwoda.summary,work:[
    {title:'ML potentials & research software',text:'I worked on cathode ML-potential training and validation, and built tools to generate reference structures and analyze diffusion, lattice changes and material stability. I also ran high-throughput DFT and force-field screening of dopants for NCM and LFMP cathodes (patent CN114744187B).'},
    {title:'Powder compaction',text:'I fitted DEM contact parameters to experimental density–pressure curves, then used the calibrated models to explore particle-size distributions and mixing ratios (patents CN114169233B and CN115579085B).'},
    {title:'Automatic model fitting',text:'I built Python tools to identify parameters for DEM, P2D/ECM and FEM battery models across rates and temperatures, using particle-swarm and differential-evolution algorithms and interfaces to COMSOL (patent CN115392123B).'},
  ]},
];

export default function MarginsSite({focusId, onSwitch, initialPublications}) {
  const storedNotes=useSyncExternalStore(subscribeNotes,savedNotes,()=>true);
  const [noteChoice,setNotes]=useState(null);
  const notes=noteChoice??storedNotes;
  const [reading,setReading]=useState(focusId);
  const readAnchor=useRef(null);
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
  useEffect(()=>{
    let frame;
    const update=()=>{
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        const anchors=[...document.querySelectorAll('[data-reading-focus]')].map(el=>({id:el.dataset.readingFocus,top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom}));
        const next=readingFocus(anchors,window.innerHeight,focusId);
        readAnchor.current=next;setReading(next);
      });
    };
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
  },[focusId]);
  function toggleNotes(){
    const visible=!notes;setNotes(visible);track('notes_toggle',{visible});
    document.documentElement.dataset.marginNotes=visible?'on':'off';
    try{localStorage.setItem('portfolio-notes',visible?'on':'off');}catch{/* Notes still work without storage. */}
  }
  return <div className={`rz-margins ${notes?'notes-on':'notes-off'}`}>
    <nav className="mg-tools" aria-label="Page view">
      <a className="mg-explore" href={siteUrl('world',reading)} title="Explore the same research and projects on an interactive island" onClick={event=>{if(onSwitch&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();onSwitch(readAnchor.current??reading);}}}>
        <span>Explore in 3D</span><ArrowUpRight className="mg-tab-arrow" size={20} aria-hidden="true"/>
      </a>
      <button className="mg-notes-toggle" type="button" role="switch" aria-checked={notes} onClick={toggleNotes} aria-label="Margin notes and highlights" title={notes?'Hide handwritten notes and highlights':'Show handwritten notes and highlights'}>
        <svg className="mg-note-check" viewBox="0 0 24 24" width="23" height="23" aria-hidden="true"><path className="mg-note-box" d="m4 5 15-1 1 16-16-1Z"/><path className="mg-note-tick" d="m6 11 5 5L21 3"/></svg>
        <span>margin notes</span>
      </button>
    </nav>

    <main id="main-content" className="mg-sheet" aria-label="Rui Zhou’s research and projects" tabIndex={-1}>
      <header className="mg-head" id="profile" tabIndex={-1}>
        <Row note={<Note tilt={-3} delay={300}>atoms go brrrrr</Note>}>
          <h1>Rui Zhou</h1>
          <p className="mg-role">I study materials and build software to work with them.</p>
          <p className="mg-intro">My work spans battery materials, semiconductors, ceramics and metals. I combine DFT and molecular dynamics with machine-learned interatomic potentials to understand how they behave — and build tools for exploring the results.</p>
          <p className="mg-current">PhD candidate · Iowa State University<br/><span>Previously <a href="#seagate">Seagate</a> (R&amp;D intern, {experienceById.seagate.start})</span> · <span><a href="#sunwoda">{experienceById.sunwoda.org}</a> (simulation engineer, {experienceById.sunwoda.start}–{String(experienceById.sunwoda.end).slice(2)})</span></p>
          <p className="mg-availability">{person.availability}</p>
          <p className="mg-proof"><strong>{papers.length||counts.papers}</strong> peer-reviewed papers · <strong>{selectedPapers.length||counts.firstAuthor}</strong> first-author · <strong>{patents.length}</strong> granted patents · <strong>{counts.apps}</strong> released apps</p>
          <p className="mg-contact"><a href={links.email}>Email</a><a href={links.linkedin}>LinkedIn</a><a href={links.scholar}>Google Scholar</a><a href={links.github}>GitHub</a></p>
        </Row>
      </header>

      <section data-reading-focus="isu" id="summary" tabIndex={-1}>
        <Row label={<h2 className="mg-h">Research</h2>}>
          <h3 className="mg-entry-title">Ion transport and interfacial reactions</h3>
          <p>In solid electrolytes, I study how disorder, phase changes and interfaces shape <Hl>ion transport</Hl>. My systems include thiophosphate glasses, closo-hydroborates and metal oxyhalides.</p>
          <p className="mg-result">At lithium–sulfide interfaces, our simulations linked faster interphase growth to phosphorus-rich chemistry and showed how a crystallization event could slow further thickening.</p>
          <p className="mg-project-links"><a data-analytics="publication" href="https://doi.org/10.1039/D6TA01253A" target="_blank" rel="noreferrer">Lithium–electrolyte interfaces <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a><a data-analytics="publication" href="https://doi.org/10.1021/acsaem.6c00367" target="_blank" rel="noreferrer">Closo-hydroborates <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a></p>
        </Row>
        <Row>
          <h3 className="mg-entry-title">Defects and mechanical response</h3>
          <p>I also contribute to studies of <Hl>how crystals deform</Hl>, using ML potentials: dislocation slip in Mg–Bi alloys and high-entropy carbides, and photoplasticity in ZnS and CdTe, where constrained DFT provides the excited-state reference data.</p>
          <p className="mg-result">In our ZnS study, photoexcitation increased the stress needed for dislocations to move, helping explain why illumination makes the crystal harder to deform.</p>
          <p className="mg-project-links"><a data-analytics="publication" href="https://doi.org/10.1021/acsaenm.4c00280" target="_blank" rel="noreferrer">Carbide ceramics <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a><a data-analytics="publication" href="https://doi.org/10.1103/l83s-dwqz" target="_blank" rel="noreferrer">Mg–Bi alloys <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a><a data-analytics="publication" href="https://doi.org/10.1021/acsmaterialslett.4c01982" target="_blank" rel="noreferrer">ZnS photoplasticity <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a><a data-analytics="publication" href="https://doi.org/10.1016/j.ijmecsci.2025.110765" target="_blank" rel="noreferrer">CdTe photoplasticity <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a></p>
        </Row>
        <Row id="papers" className="mg-pub">
          <details className="mg-reading" open>
            <summary>First-author papers</summary>
            {status==='loading'?<p role="status">Loading publications…</p>:status==='error'?<p>Find the publication list on <a href={links.scholar}>Google Scholar</a>.</p>:null}
            <ol>{selectedPapers.map(p=><li key={p.link}><a data-analytics="publication" href={p.link} target="_blank" rel="noreferrer"><Chem>{p.title}</Chem></a><PaperAuthors authors={p.authors}/><small>{p.venue} · {p.year}</small></li>)}</ol>
            <a href={links.scholar}>All publications on Google Scholar <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a>
          </details>
        </Row>
      </section>

      <section id="software" tabIndex={-1}>
        <Row label={<h2 className="mg-h">Software</h2>}/>
        <div className="mg-software-grid">
        {['naiive','totk','amiibot','ling'].map(id=>{
          const app=byId[id];
          return <article key={id} id={id} tabIndex={-1} data-project-id={id} data-reading-focus={id} className="mg-app">
            <h3 className="mg-entry-title">{app.title}</h3>
            <div className="mg-app-copy"><p>{APP_COPY[id]}</p><p className="mg-app-facts">{appById[id].meta}</p></div>
            <ProjectMedia title={app.title} media={app.media}/>
            <div className="mg-app-links"><ProjectLinks project={app}/></div>
            <aside className="mg-app-note">{APP_NOTES[id]}</aside>
          </article>;
        })}
        </div>
      </section>

      <section id="projects" tabIndex={-1}>
        <Row label={<h2 className="mg-h">Experiments</h2>}><p className="mg-section-intro">Smaller tools and open questions, often prompted by something I wanted to use myself.</p></Row>
        <div className="mg-experiments-grid">
          {EXPERIMENTS.map(([id,description])=>{const project=byId[id];return <article id={id} tabIndex={-1} data-project-id={id} data-reading-focus={id} key={id} className="mg-experiment">
            <h3>{project.title}</h3><p>{description}</p>{EXPERIMENT_STATUS[id]?<small className="mg-project-status">{EXPERIMENT_STATUS[id]}</small>:null}<ProjectLinks project={project}/>
          </article>;})}
        </div>
      </section>

      <section id="experience" tabIndex={-1}>
        {JOURNEY.map((entry,index)=><Row key={entry.id} id={entry.id} label={index===0?<h2 className="mg-h">Along the way</h2>:null} className="mg-job">
          <h3 className="mg-entry-title">{entry.title}</h3><p className="mg-title">{entry.role}</p><p className="mg-when">{entry.period}</p><p>{entry.text}</p>
          {entry.work?<dl className="mg-work-notes">{entry.work.map(work=><div key={work.title}><dt>{work.title}</dt><dd>{work.text}</dd></div>)}</dl>:null}
          {entry.id==='sunwoda'?<details id="patents" tabIndex={-1} className="mg-reading" open={focusId==='patents'||undefined}><summary>{patents.length} granted patents from battery R&amp;D</summary><ul>{patents.map(p=><li key={p.id}><a href={p.href} target="_blank" rel="noreferrer">{p.title} · {p.id} <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a><small className="mg-patent-dates">Filed {p.filed} · Granted {p.granted}</small></li>)}</ul></details>:null}
        </Row>)}
      </section>

      <section id="education" tabIndex={-1}>
        <Row label={<h2 className="mg-h">Earlier</h2>} id="wustl"><h3 className="mg-entry-title">Washington University in St. Louis</h3><p className="mg-title">Master of Science · Materials Science and Engineering</p><p className="mg-when">2018 – 2019 · St. Louis, Missouri</p><p>Studying water evaporating from graphene-coated silicon introduced me to molecular dynamics and working on a cluster.</p><p className="mg-coursework">Course projects added MEMS microfabrication — a team project building a passive-mixer microfluidic device — and CFD simulation with ANSYS Fluent.</p><p className="mg-project-links"><a data-analytics="publication" href="https://openscholarship.wustl.edu/eng_etds/694/" target="_blank" rel="noreferrer">Read the thesis <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a></p></Row>
        <Row id="cust"><h3 className="mg-entry-title">Changchun University of Science and Technology</h3><p className="mg-title">Bachelor of Science · Materials Science and Engineering</p><p className="mg-when">2014 – 2018 · Changchun, China</p><p>My starting point was experimental: carbon anode materials, electrospinning, synthesis and half-cell testing. Python and MATLAB began here, too.</p><p className="mg-project-links"><a data-analytics="publication" href="https://doi.org/10.1016/j.jcis.2017.07.117" target="_blank" rel="noreferrer">Carbon nanofibers <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a></p></Row>
      </section>

      <section data-reading-focus="item:python" id="skills" tabIndex={-1}>
        <Row label={<h2 className="mg-h">Skills</h2>} className="mg-skills">
          <details className="mg-skill-routes" open={focusId?.startsWith('item:')||undefined}>
            <summary>Skills &amp; where I’ve used them</summary>
            {ITEMS.map(tool=><details key={tool.id} open={focusId===`item:${tool.id}`||undefined} onToggle={event=>{if(event.target===event.currentTarget&&event.currentTarget.open)track('skill_select',{skill_id:tool.id});}}>
              <summary>{tool.what}</summary><ol>{skillJourney(tool).map(stage=><li key={stage.place}><b>{SCHOOL_NAMES[stage.place]??byId[stage.place].title}</b>{stage.title?<small>{stage.title}</small>:null}<p>{stage.detail}</p></li>)}</ol>
            </details>)}
          </details>
        </Row>
      </section>

      <footer className="mg-footer">
        <Row label={<h2 className="mg-h">Say hello</h2>}>
          <p>If you have a role or a project in mind, <Under seed={4}>I’d like to hear from you</Under>.</p>
          <p className="mg-project-links"><a href={links.email}>{links.emailText}</a><a href={links.cv}>Academic CV (PDF)</a><a href={links.resume}>Résumé (PDF)</a><a href={links.linkedin}>LinkedIn</a></p>
        </Row>
      </footer>
    </main>
    <Privacy/>
  </div>;
}
