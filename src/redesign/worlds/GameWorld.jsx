import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Compass, Menu, X } from 'lucide-react';
import { ENTITIES, ITEMS, LINKS, byId, itemById, biomeById, progressOf, papersForExperience, QUEST_KINDS, normalizeFocus } from './data';
import WorldEnvironment from './WorldEnvironment';
import { gameAreaById } from './world-layout';
import Equipment from './Equipment';
import ToolKit from './ToolKit';
import usePublications from '../usePublications';
import Chem from '../Chem';
import PaperAuthors from '../PaperAuthors';
import ProjectMedia from '../ProjectMedia';
import { skillsForExperience } from './skills';
import './atlas.css';
import './game.css';
import { writeSiteRoute } from '../../site/routes';
import { track, trackOnce } from '../../site/analytics';
import Privacy from '../../site/Privacy';
import './tools.css';

const QUESTS = ENTITIES.filter(entity => QUEST_KINDS[entity.kind]);

function validFocus(id) {
  const focus = normalizeFocus(id);
  if (focus === 'library') return 'isu';
  if (byId[focus]?.gameParent) return byId[focus].gameParent;
  if (byId[focus]) return focus;
  if (focus?.startsWith('item:') && itemById[focus.slice(5)]) return focus;
  if (focus?.startsWith('biome:') && (gameAreaById[focus.slice(6)] || biomeById[focus.slice(6)])) return focus;
  return 'home';
}

function Progress({ entity }) {
  const value = progressOf(entity);
  if (!value) return null;
  return <div className="atlas-progress">
    <div role="progressbar" aria-label={entity.title} aria-valuenow={value.pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{width:`${value.pct}%`}} />
    </div>
    <span>{value.text}</span>
  </div>;
}

function EntityDetails({ entity, papers }) {
  return <>
    <p className="game-prose">{entity.summary}</p>
    {entity.details?.length ? <ul className="atlas-details">{entity.details.map(detail => <li key={detail}>{detail}</li>)}</ul> : null}
    {entity.list ? <ul className="atlas-details">{entity.list.map(detail => <li key={detail}>{detail}</li>)}</ul> : null}
    <Progress entity={entity} />
    {entity.media?<ProjectMedia title={entity.title} media={entity.media}/>:null}
    {entity.stats ? <div className="atlas-stats">{entity.stats.map(stat => <span key={stat.label}><b>{stat.value}%</b>{stat.label}</span>)}</div> : null}
    {entity.papers ? <ol className="atlas-papers">{papers.map(paper => <li key={paper.link}>
      <a data-analytics="publication" href={paper.link} target="_blank" rel="noreferrer"><Chem>{paper.title}</Chem> <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a>
      <PaperAuthors authors={paper.authors}/>
      <small>{paper.year} · {paper.venue}{paper.firstAuthor ? ' · first author' : ''}</small>
    </li>)}</ol> : null}
    {entity.links?.length ? <div className="atlas-links">{entity.links.map(link => <a key={link.href} href={link.href} target={link.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer">{link.label}<ArrowUpRight size={14}/></a>)}</div> : null}
  </>;
}

function ExperienceSkills({ entity, onInspect }) {
  const skills = skillsForExperience(entity.id);
  if (!skills.length) return null;
  return <section className="game-experience-skills" aria-label="Skills acquired and developed">
    <h2>{entity.roleLabel ? 'Skills acquired & developed' : 'Skills in practice'}</h2>
    <ul className="game-skill-list">{skills.map(({tool,place,level,status,title,detail,independent}) => <li key={tool.id}>
      <button onClick={() => onInspect(tool.id)} aria-label={`Explore ${tool.what}${level ? `, level ${level}` : ''} skill journey`}>
        <Equipment id={tool.id}/>
        <span className="game-skill-copy"><strong>{tool.what}</strong>
          {place !== entity.id ? <span className="game-skill-context">{independent ? 'Independent project' : 'Project'} · {byId[place].title}</span> : title ? <span className="game-skill-context">{title}</span> : null}
          {detail ? <small>{detail}</small> : null}
        </span>
        <span className="game-skill-status">{level ? <b>Lv. {level}</b> : null}<small>{status}</small></span>
      </button>
    </li>)}</ul>
  </section>;
}

function ExperienceDetails({ entity, papers, publicationStatus, publicationMeta, section, onSection, onInspect }) {
  const relevantPapers = papersForExperience(entity,papers);
  const firstAuthorCount = relevantPapers.filter(paper => paper.firstAuthor).length;
  const record = byId[entity.record];
  const sections = [{id:'overview',label:entity.sectionLabel}];
  if (entity.publicationYears) sections.push({id:'papers',label:`Papers${publicationStatus === 'ready' ? ` · ${relevantPapers.length}` : ''}`});
  if (record) sections.push({id:'record',label:record.id === 'patents' ? `Patents · ${record.list.length}` : 'Dissertation'});
  if (skillsForExperience(entity.id).length) sections.push({id:'skills',label:'Skills'});
  return <div className="game-experience">
    {sections.length > 1 ? <nav className="game-experience-sections" aria-label={`${entity.roleLabel} sections`}>
      {sections.map(entry => <button key={entry.id} aria-pressed={section === entry.id} onClick={() => onSection(entry.id)}>{entry.label}</button>)}
    </nav> : null}
    {section === 'papers' ? <section className="game-experience-content" aria-label={entity.publicationLabel}>
      <h2>{entity.publicationLabel}</h2>
      {publicationStatus === 'loading' ? <p className="game-prose" role="status">Loading papers…</p> : publicationStatus === 'error' ? <p className="game-prose">The paper list could not be loaded. You can find it on Google Scholar.</p> : <>
        <p className="game-experience-caption">{relevantPapers.length} peer-reviewed{firstAuthorCount ? ` · ${firstAuthorCount} first-author` : ''}</p>
        <ol className="atlas-papers">{relevantPapers.map(paper => <li key={paper.link}>
          <a data-analytics="publication" href={paper.link} target="_blank" rel="noreferrer"><Chem>{paper.title}</Chem> <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a>
          <PaperAuthors authors={paper.authors}/>
          <small>{paper.year} · {paper.venue}{paper.firstAuthor ? ' · first author' : ''}</small>
        </li>)}</ol>
      </>}
      {entity.id === 'isu' && publicationMeta?.peerReviews ? <p className="game-experience-caption">Peer review: {publicationMeta.peerReviews} manuscripts.</p> : null}
      <div className="atlas-links"><a href={LINKS.scholar} target="_blank" rel="noreferrer">Google Scholar<ArrowUpRight size={14}/></a><a href={LINKS.orcid} target="_blank" rel="noreferrer">ORCID<ArrowUpRight size={14}/></a></div>
    </section> : section === 'skills' ? <ExperienceSkills entity={entity} onInspect={onInspect}/>
    : section === 'record' && record ? <section className="game-experience-content" aria-label={record.title}>
      <h2>{record.title}</h2><EntityDetails entity={record} papers={papers}/>
    </section> : <section className="game-experience-content" aria-label={entity.sectionLabel}>
      <p className="game-experience-caption">{entity.meta.split(' · ')[0]}</p>
      <EntityDetails entity={entity} papers={papers}/>
      {entity.relatedResearch?.map(id => <section className="game-experience-related" key={id}>
        <h2>{byId[id].title}</h2><EntityDetails entity={byId[id]} papers={papers}/>
      </section>)}
    </section>}
  </div>;
}

// Native modal behavior supplies Escape, focus containment and focus restoration.
// A project conversation below is deliberately nonmodal, so another building can
// be clicked without first dismissing the dialogue.
function GameWindow({ kind, title, onClose, children }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} className={`game-window game-window-${kind}`} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <div className="game-window-heading"><h1 id={titleId}>{title}</h1><button className="game-close" onClick={onClose} aria-label="Return to the island" autoFocus><X size={18}/></button></div>
    <div className="game-window-body">{children}</div>
  </dialog>;
}

export default function GameWorld({ focusId, onSwitch }) {
  const [selection, setSelection] = useState(() => validFocus(focusId));
  const [surface, setSurface] = useState(() => {
    const focus = validFocus(focusId);
    return focus.startsWith('item:') ? 'items' : focus !== 'home' ? 'talk' : null;
  });
  const [item, setItem] = useState(() => {
    const focus = validFocus(focusId);
    return focus.startsWith('item:') ? focus.slice(5) : ITEMS[0].id;
  });
  const [expanded, setExpanded] = useState(false);
  const [experienceSection, setExperienceSection] = useState(() => focusId === 'library' ? 'papers' : 'overview');
  const [openQuest, setOpenQuest] = useState(null);
  const [cameraUsed, setCameraUsed] = useState(false);
  const [cameraMoved, setCameraMoved] = useState(false);
  const [cameraReset, setCameraReset] = useState(0);
  const art='illustrated';
  const menuButton = useRef(null);
  const talkClose = useRef(null);
  const talkBody = useRef(null);
  const { list:papers, status:publicationStatus, meta:publicationMeta } = usePublications();
  const entity = byId[selection];
  const biome = selection.startsWith('biome:') ? gameAreaById[selection.slice(6)] ?? biomeById[selection.slice(6)] : null;
  const switchAt = surface === 'items' ? `item:${item}` : surface === 'quests' && openQuest ? openQuest : surface === 'talk' && entity?.publicationYears && experienceSection === 'papers' ? 'library' : biome?.plainFocus ?? selection;
  const sceneTarget = surface === 'items' ? '@items' : surface === 'quests' ? '@quests' : selection;

  useEffect(() => {
    const initial=validFocus(focusId);
    if(initial.startsWith('item:'))trackOnce('skill_select',`entry:${initial}`,{skill_id:initial.slice(5)});
    else if(initial!=='home')trackOnce('content_open',`entry:${initial}`,{content_id:initial,content_type:byId[initial]?.roleLabel?'experience':'project'});
  },[focusId]);

  useEffect(() => {
    const escape = event => {
      if (event.key !== 'Escape' || event.target.closest?.('dialog')) return;
      event.preventDefault();
      setSurface(current => current ? null : 'menu');
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);

  useEffect(() => {
    if (surface === 'talk') talkClose.current?.focus({preventScroll:true});
  }, [surface]);

  const close = () => {
    setSurface(null);
    writeSiteRoute('world',null,{replace:true});
    menuButton.current?.focus({preventScroll:true});
  };
  const cross = () => { setSurface(null); onSwitch(switchAt); };
  const select = id => {
    if (id === '@mirror') { cross(); return; }
    if (id === '@items') { inspectTool(item); return; }
    if (id === '@quests') {
      setSurface('quests');
      track('content_open',{content_id:'journal',content_type:'journal'});
      return;
    }
    const valid = validFocus(id);
    setSelection(valid);
    setExpanded(false);
    setExperienceSection(id === 'library' ? 'papers' : 'overview');
    setSurface('talk');
    talkBody.current?.scrollTo({top:0});
    writeSiteRoute('world',valid,{replace:true});
    track('content_open',{content_id:valid,content_type:byId[valid]?.roleLabel?'experience':valid.startsWith('biome:')?'area':'project'});
  };
  const inspectTool = id => {
    setItem(id);
    setSurface('items');
    writeSiteRoute('world',`item:${id}`,{replace:true});
    track('skill_select',{skill_id:id});
  };
  const resetView = () => {
    setCameraReset(current => current + 1);
    setCameraMoved(false);
    setSurface(null);
  };

  return <main className="atlas-world game-world" data-art={art}>
    <div className="game-stage">
      <WorldEnvironment art={art} selection={sceneTarget} paused={surface === 'items' || surface === 'quests' || surface === 'menu'} onSelect={select}
        onMiss={() => { if (surface === 'talk') setSurface(null); }} inspecting={surface === 'talk'}
        onInteract={() => { setCameraUsed(true); setCameraMoved(true); }}
        onViewReset={() => setCameraMoved(false)} resetKey={cameraReset} />
    </div>

    <button id="world-menu" ref={menuButton} className="game-menu-trigger" onClick={() => setSurface('menu')} aria-label="Open game menu" title="Menu · Esc"><Menu size={21}/></button>
    {cameraMoved ? <button className="game-camera-reset" onClick={resetView} aria-label="Reset island view" title="Reset view"><Compass size={21}/></button> : null}
    {!cameraUsed && !surface ? <p className="game-camera-hint"><span className="camera-hint-desktop">Drag to rotate · Scroll to zoom</span><span className="camera-hint-touch">Drag to rotate · Pinch to zoom</span></p> : null}

    {surface === 'talk' && (entity || biome) ? <section className={`game-dialogue ${expanded || entity?.roleLabel ? 'is-expanded' : ''}`} role="dialog" aria-labelledby="game-speaker" data-project-id={entity && !entity.roleLabel ? entity.id : undefined}>
      <div className="game-speaker-row">
        <img src="/game/portrait.png" width="36" height="36" alt="" />
        <div><h1 id="game-speaker">{biome?.name ?? entity.roleLabel ?? entity.title}</h1><p>{biome?.plain ?? (entity.roleLabel ? entity.title : entity.meta)}{entity?.period ? <span className="game-experience-period">{entity.period}{entity.location ? ` · ${entity.location}` : ''}</span> : null}</p></div>
        <button ref={talkClose} className="game-close" onClick={close} aria-label="Close dialogue"><X size={18}/></button>
      </div>
      <div className="game-dialogue-body" ref={talkBody}>
        {biome ? <>
          <p className="game-prose">{biome.description}</p>
          {expanded ? <ul className="game-destinations">{(biome.members ? biome.members.map(id=>byId[id]) : ENTITIES.filter(place => place.biome === biome.id && !place.gameParent)).map(place => <li key={place.id}><button onClick={() => select(place.id)}><span>{place.roleLabel ?? place.title}</span><ArrowUpRight size={15}/></button></li>)}</ul> : null}
        </> : entity.roleLabel ? <ExperienceDetails entity={entity} papers={papers} publicationStatus={publicationStatus} publicationMeta={publicationMeta} section={experienceSection}
          onSection={section => { track('content_section',{content_id:entity.id,section_id:section}); setExperienceSection(section); talkBody.current?.scrollTo({top:0}); }} onInspect={inspectTool}/>
        : expanded ? <>
          <EntityDetails entity={entity} papers={papers}/>
          {entity.relatedProjects ? <ul className="game-destinations">{entity.relatedProjects.map(id=><li key={id}><button onClick={()=>select(id)}><span>{byId[id].title}</span><ArrowUpRight size={15}/></button></li>)}</ul> : null}
          <ExperienceSkills entity={entity} onInspect={inspectTool}/>
        </> : <p className="game-prose">{entity.summary}</p>}
      </div>
      <div className={`game-dialogue-actions ${entity?.roleLabel ? 'is-experience' : ''}`}>
        {!entity?.roleLabel ? <button onClick={() => setExpanded(current => !current)} aria-expanded={expanded}>{expanded ? 'Less' : biome ? 'Look around' : 'Read more'}<ChevronDown size={14} className={expanded ? 'turned' : ''}/></button> : null}
        <button onClick={cross}>2D portfolio · through the mirror<ArrowUpRight size={14}/></button>
      </div>
    </section> : null}

    {surface === 'items' ? <GameWindow kind="inventory" title="Skills & tools" onClose={close}>
      <ToolKit item={item} onChoose={inspectTool} onVisit={select} onPlain={cross} fromPlace={selection}/>
    </GameWindow> : null}

    {surface === 'quests' ? <GameWindow kind="journal" title="Field journal" onClose={close}>
      <ul className="game-quest-list">{QUESTS.map(quest => <li key={quest.id}>
        <button className="game-quest-heading" aria-expanded={openQuest === quest.id} onClick={() => setOpenQuest(current => current === quest.id ? null : quest.id)}>
          <span><small>{QUEST_KINDS[quest.kind]}</small><b>{quest.title}</b></span><span>{progressOf(quest) ? `${progressOf(quest).pct}%` : '+'}</span>
        </button>
        {openQuest === quest.id ? <div className="game-quest-notes"><EntityDetails entity={quest} papers={papers}/><div className="game-quest-actions"><button className="game-action" onClick={() => select(quest.id)}>Go there<ArrowUpRight size={14}/></button><button className="game-action" onClick={cross}>View the portfolio<ArrowUpRight size={14}/></button></div></div> : null}
      </li>)}</ul>
    </GameWindow> : null}

    {surface === 'menu' ? <GameWindow kind="pause" title="Rui’s island" onClose={close}>
      <img className="game-pause-portrait" src="/game/portrait.png" alt=""/>
      <p className="game-profile">{byId.home.details[0]}</p>
      <div className="game-profile-links"><a href={LINKS.email}>Email</a><a href={LINKS.cv} target="_blank" rel="noreferrer">CV</a><a href={LINKS.github} target="_blank" rel="noreferrer">GitHub</a></div>
      <div className="game-menu-actions">
        <button onClick={close}>Return to the island</button>
        <button onClick={resetView}>Reset island view<Compass size={16}/></button>
        <button onClick={cross}>View the portfolio<ArrowUpRight size={16}/></button>
      </div>

      <Privacy/>
      <p className="game-menu-hint">Drag to rotate. Scroll or pinch to zoom.<br/>Arrow keys rotate; + / − zoom; Home resets.<br/><br/>The tool chest holds my skills.<br/>The noticeboard keeps my field journal.<br/>The mirror opens my portfolio.</p>
      <p className="game-build-credit">Built with GPT-6 Astra :)<br/><a href="https://github.com/zrzrv5/aboutme/tree/main" target="_blank" rel="noreferrer">Source on GitHub <ArrowUpRight className="inline-link-arrow" aria-hidden="true"/></a></p>
    </GameWindow> : null}
  </main>;
}
