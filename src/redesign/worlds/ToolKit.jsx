import React, { useRef, useState } from 'react';
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { ITEMS, byId, itemById } from './data';
import Equipment from './Equipment';
import { skillJourney } from './skills';
import {track} from '../../site/analytics';

const FAMILIES=[
  {name:'Matter & simulation',items:['dft','md','mlip','dem','p2d','lab','mems','fluent']},
  {name:'Scientific computing',items:['python','matlab','slurm','bo','gnn']},
  {name:'Native software & AI',items:['swift','metal','agent']},
];
const LABELS={dft:'DFT',md:'Molecular dynamics',mlip:'ML potentials',dem:'Particle methods',p2d:'Cell models',lab:'Experiments',mems:'MEMS fab',fluent:'ANSYS Fluent',python:'Python',matlab:'MATLAB',slurm:'HPC',bo:'Optimization',gnn:'Graph ML',swift:'Swift',metal:'Metal',agent:'AI agents'};
const SHORT={cust:'CUST',wustl:'WUSTL',sunwoda:'Sunwoda',isu:'ISU',seagate:'Seagate',patents:'Patents'};
const ORDER=FAMILIES.flatMap(family=>family.items);
const title=id=>byId[id].roleLabel ?? byId[id].title;

function Journey({tool,onVisit,fromPlace}) {
  const journey=skillJourney(tool),max=Math.max(...journey.map(stage=>stage.level));
  const [selected,setSelected]=useState(()=>Math.max(0,journey.findIndex(stage=>stage.place===fromPlace||stage.contexts?.includes(fromPlace))));
  const nodes=useRef([]);
  const choose=index=>{const stage=journey[index];track('skill_milestone',{skill_id:tool.id,place_id:stage.place,skill_level:stage.level,status:stage.status});setSelected(index);nodes.current[index]?.scrollIntoView({block:'nearest',inline:'center'});};
  const stage=journey[selected];
  const width=Math.max(440,journey.length*142),height=244;
  const point=(entry,index)=>({x:journey.length===1?width/2:62+index*(width-124)/(journey.length-1),y:max===1?112:166-(entry.level-1)*100/(max-1)});
  const points=journey.map(point);
  return <section className="skill-growth" aria-label={`${tool.what} skill journey`}>
    <div className="skill-growth-heading"><h3>Acquired. Developed. Applied.</h3><span>Select a milestone</span></div>
    <div className="skill-route-scroll" tabIndex={0} aria-label="Skill growth route. Scroll horizontally to see all milestones.">
      <div className="skill-route" style={{width,minWidth:'100%',height}}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
          {Array.from({length:max},(_,index)=>{const y=point({level:index+1},0).y;return <g key={index}><path className="skill-guide" d={`M20 ${y}H${width-20}`}/><text x="12" y={y-9}>L{index+1}</text></g>;})}
          {points.slice(1).map((p,index)=>{const prev=points[index];return <path key={index} className={journey[index+1].status==='Applied'?'skill-route-applied':'skill-route-earned'} d={`M${prev.x} ${prev.y} C${(prev.x+p.x)/2} ${prev.y} ${(prev.x+p.x)/2} ${p.y} ${p.x} ${p.y}`}/>;})}
          {points.map((p,index)=><path className="skill-route-drop" key={index} d={`M${p.x} ${p.y+15}V207`}/>)}
        </svg>
        {journey.map((entry,index)=>{const p=points[index];return <button key={entry.place} ref={element=>{nodes.current[index]=element;}} className={`skill-node ${entry.status==='Applied'?'is-application':''}`} style={{left:`${p.x/width*100}%`,top:p.y}} aria-pressed={index===selected}
          aria-label={`${entry.status}, level ${entry.level}, ${title(entry.place)}`} onClick={()=>choose(index)}>
          <span className="skill-node-ring"><b>{entry.level}</b></span><small>{entry.status}</small>
          <span className="skill-node-place" style={{top:216-p.y}}>{SHORT[entry.place]??byId[entry.place].title}</span>
        </button>;})}
      </div>
    </div>
    <div className="skill-milestone" aria-live="polite">
      <div className="skill-milestone-number"><span>{String(selected+1).padStart(2,'0')}</span><small>/{String(journey.length).padStart(2,'0')}</small></div>
      <div className="skill-milestone-copy">
        <p className="skill-milestone-meta">{stage.status} · Lv. {stage.level}{stage.when??byId[stage.place].period?` · ${stage.when??byId[stage.place].period}`:''}</p>
        <button className="skill-visit" onClick={()=>onVisit(stage.place)}>{title(stage.place)}<ArrowUpRight size={17}/></button>
        {stage.independent?<small className="skill-independent">Independent project</small>:null}
        {stage.title?<h4>{stage.title}</h4>:null}<p>{stage.detail}</p>
      </div>
      <div className="skill-step-controls"><button aria-label="Previous milestone" disabled={selected===0} onClick={()=>choose(selected-1)}><ArrowLeft size={17}/></button><button aria-label="Next milestone" disabled={selected===journey.length-1} onClick={()=>choose(selected+1)}><ArrowRight size={17}/></button></div>
    </div>
  </section>;
}

export default function ToolKit({item,onChoose,onVisit,onPlain,fromPlace}) {
  const buttons=useRef({}),tool=itemById[item],journey=skillJourney(tool);
  const level=Math.max(...journey.map(stage=>stage.level));
  const choose=id=>{onChoose(id);buttons.current[id]?.scrollIntoView({block:'nearest',inline:'center'});};
  const navigate=(event,id)=> {
    const index=ORDER.indexOf(id);
    const next=event.key==='Home'?0:event.key==='End'?ORDER.length-1:['ArrowDown','ArrowRight'].includes(event.key)?(index+1)%ORDER.length:['ArrowUp','ArrowLeft'].includes(event.key)?(index-1+ORDER.length)%ORDER.length:null;
    if(next===null)return;event.preventDefault();onChoose(ORDER[next]);buttons.current[ORDER[next]]?.focus();
  };
  return <div className="tool-kit skill-atlas">
    <aside className="skill-catalog" aria-label="Choose a skill">
      <p className="skill-catalog-caption">FIELD NOTES <span>{ITEMS.length} skills</span></p>
      {FAMILIES.map(family=><section key={family.name}><h2>{family.name}</h2><div role="group" aria-label={family.name}>
        {family.items.map(id=><button key={id} ref={element=>{buttons.current[id]=element;}} onClick={()=>choose(id)} onKeyDown={event=>navigate(event,id)} aria-pressed={id===item} aria-label={LABELS[id]}>
          <Equipment id={id}/><span>{LABELS[id]}</span><small>{Math.max(...skillJourney(itemById[id]).map(s=>s.level))}</small>
        </button>)}
      </div></section>)}
    </aside>
    <div className="skill-workspace">
      <header className="skill-hero"><div className="skill-emblem" key={item}><Equipment id={item}/><span>Lv. {level}</span></div>
        <div><p className="skill-eyebrow">{FAMILIES.find(f=>f.items.includes(item)).name}</p><h2>{LABELS[item]}</h2><p className="skill-definition">{tool.what}</p><p className="skill-stack">{tool.tools}</p></div>
      </header>
      <Journey key={item} tool={tool} onVisit={onVisit} fromPlace={fromPlace}/>
      <footer className="skill-footer"><span>Solid path · level up &nbsp; / &nbsp; Dotted path · applied</span><button onClick={onPlain}>2D portfolio<ArrowUpRight size={13}/></button></footer>
    </div>
  </div>;
}
