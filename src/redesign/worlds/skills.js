import {patentByKey} from '../content.js';
import { ITEMS } from './data.js';

// Growth stages follow the user's learning history and the work in data.js.
// Applied stages retain the earned level. Contexts associate independent
// projects with a period of study without claiming institutional ownership.
export const SKILL_JOURNEYS = {
  dft: [
    { place:'sunwoda', level:1, detail:'High-throughput DFT screening of NCM and LFMP cathodes.' },
    { place:'isu', level:2, detail:'Electronic-structure reference data for ML potentials and interfaces; constrained DFT for excited states in ZnS and CdTe.' },
  ],
  md: [
    { place:'wustl', level:1, title:'MS thesis', detail:'Thin-film water evaporation on graphene-coated silicon.' },
    { place:'sunwoda', level:2, detail:'Atomistic modeling and force-field screening of battery materials.' },
    { place:'isu', level:3, detail:'ML-potential molecular dynamics of phase transitions, interfaces and ion transport.' },
    { place:'seagate', level:3, status:'Applied', detail:'Molecular dynamics of reader-head coating materials.' },
  ],
  mlip: [
    { place:'sunwoda', level:1, detail:'Built cathode ML-potential training and validation workflows, with automated DFT reference-structure generation and comparison against electronic-structure calculations.' },
    { place:'isu', level:2, detail:'Active learning and ML potential + QEq models for solid electrolytes and interfaces; photoplasticity and dislocations in ZnS, CdTe, carbides and Mg–Bi alloys.' },
    { place:'dpmetal', level:2, status:'Applied', title:'Native ML-potential inference', detail:'Pretrained DPA4C potentials on Apple GPUs: energies, forces and virials from Swift.' },
  ],
  python: [
    { place:'cust', level:1, detail:'Started learning Python during undergraduate study at Changchun University of Science and Technology.' },
    { place:'sunwoda', level:2, detail:'Built Python tools for reference structures, simulation analysis and automated model calibration; used regression for battery power and swelling force.' },
    { place:'isu', level:2, status:'Applied', detail:'Python, PyTorch and MLX for simulation data, active learning and HPC research workflows.' },
    { place:'seagate', level:2, status:'Applied', detail:'Thin-film ellipsometry analysis and GNN/RDKit chemical-property workflows.' },
    { place:'typeshi', level:2, status:'Applied', contexts:['isu'], independent:true, when:'2026', detail:'Partial-RDF descriptors and a set-transformer for identifying chemical elements from MD geometry.' },
  ],
  swift: [
    { place:'ling', level:1, contexts:['cust'], independent:true, when:'2017', detail:'L!NG: an Apple Watch timetable and the first App Store release.' },
    { place:'amiibot', level:2, contexts:['wustl'], independent:true, when:'2020', detail:'AmiiBot: collection management with NFC scanning and writing.' },
    { place:'totk', level:3, contexts:['isu'], independent:true, when:'2023', detail:'TotK Companion: maps, collection tracking and iCloud sync.' },
    { place:'naiive', level:4, contexts:['isu'], independent:true, when:'2026', detail:'NAIIVE: a node-based scientific visualization app with 2D and spatial 3D views, built with Swift and Metal.' },
  ],
  metal: [
    { place:'naiive', level:1, contexts:['isu'], independent:true, when:'2026', title:'Scientific rendering', detail:'Real-time atomistic rendering and spatial visualization in NAIIVE.' },
    { place:'dpmetal', level:1, status:'Applied', contexts:['isu'], independent:true, title:'GPU compute', detail:'Native ML-potential inference with Core AI + Metal; energies, forces and virials from Swift.' },
  ],
  bo: [
    { place:'sunwoda', level:1, title:'Model parameter identification', detail:'Developed particle-swarm and differential-evolution fitting workflows: DEM contact parameters from compression measurements, and battery-model calibration across rates and temperatures.' },
    { place:'isu', level:1, status:'Applied', title:'Electrolyte composition search', detail:'Applied Bayesian optimization to search solid-electrolyte compositions.' },
  ],
  slurm: [
    { place:'wustl', level:1, title:'MS simulation work', detail:'Acquired HPC skills while carrying out molecular-dynamics thesis research.' },
    { place:'isu', level:2, detail:'Slurm-managed simulations and active-learning workflows for computational materials research.' },
    { place:'dshslop', level:3, contexts:['isu'], independent:true, title:'Persistent cluster workflows', detail:'DSH-SLOP: persistent cluster sessions, per-machine knowledge and a Slurm/PBS job ledger.' },
  ],
  dem: [
    { place:'sunwoda', level:1, detail:'LIGGGHTS powder-compaction workflows: fit contact parameters to measured density–pressure curves, then explore particle-size distributions and mixing ratios.' },
    { place:'patents', level:1, status:'Applied', title:'Electrode-design patents', when:'2021–2022', detail:`Simulation-based particle-size and mixing-ratio design: ${patentByKey.particles.id} and ${patentByKey.mixing.id}.` },
  ],
  p2d: [
    { place:'sunwoda', level:1, detail:'Parameter identification for P2D, ECM and FEM battery models.' },
    { place:'patents', level:1, status:'Applied', title:'Battery-model identification patent', when:'2021–2022', detail:`Parameter identification for secondary-battery physical models: ${patentByKey.calibration.id}.` },
  ],
  gnn: [
    { place:'isu', level:1, detail:'Acquired graph-neural-network skills through materials property prediction and structure-generation research.' },
    { place:'seagate', level:1, status:'Applied', detail:'Applied GNNs and RDKit descriptors to chemical-property prediction.' },
  ],
  agent: [
    { place:'slop', level:1, title:'Research agent runtime', detail:'S.L.O.P.: an AI agent runtime for computational materials science.' },
    { place:'dshslop', level:2, title:'Agents on HPC', detail:'Persistent login, searchable machine notes and job tracking for agents on research clusters.' },
    { place:'gradbench', level:3, title:'Research workflow evaluation', detail:'GradBench: heavy-task and regression benchmarks for comparing models, harnesses and prompts.' },
  ],
  matlab: [
    { place:'cust', level:1, detail:'Acquired MATLAB during undergraduate study at Changchun University of Science and Technology.' },
  ],
  mems: [
    { place:'wustl', level:1, title:'MEMS course team project', when:'2019', detail:'Passive-mixer microfluidic-device fabrication: a team course project covering photolithography, PDMS soft lithography and plasma bonding.' },
  ],
  fluent: [
    { place:'wustl', level:1, title:'Master’s course project', detail:'Acquired CFD simulation experience using ANSYS Fluent in a master’s course project.' },
  ],
  lab: [
    { place:'cust', level:1, title:'Carbon-anode research', detail:'Electrospinning, high-temperature high-pressure synthesis and half-cell testing of carbon anode materials.' },
  ],
};

export function skillJourney(tool) {
  return (SKILL_JOURNEYS[tool.id] ?? []).map((stage,index) => ({
    ...stage,status:stage.status ?? (index === 0 ? 'Acquired' : 'Level up'),
  }));
}

export function skillAtExperience(tool,place) {
  const journey=skillJourney(tool);
  const direct=journey.filter(stage => stage.place === place);
  const candidates=direct.length ? direct : journey.filter(stage => stage.contexts?.includes(place));
  // Ties retain the earning milestone rather than a later application.
  if(candidates.length) return candidates.reduce((best,stage) => stage.level > best.level ? stage : best);
  if(tool.used.includes(place)) return {place,status:'Applied'};
  return null;
}

export function skillsForExperience(place) {
  return ITEMS.flatMap(tool => {
    const stage=skillAtExperience(tool,place);
    return stage ? [{tool,...stage}] : [];
  }).sort((a,b) => Number(a.place !== place)-Number(b.place !== place));
}

// The last tool row can be incomplete; vertical keys retain their column.
export function nextSkillIndex(index,key,count,columns=4) {
  if(key === 'Home') return 0;
  if(key === 'End') return count-1;
  if(key === 'ArrowLeft') return (index-1+count)%count;
  if(key === 'ArrowRight') return (index+1)%count;
  const column=index%columns;
  if(key === 'ArrowDown') return index+columns < count ? index+columns : column;
  if(key === 'ArrowUp') return index-columns >= 0 ? index-columns : column+Math.floor((count-1-column)/columns)*columns;
  return null;
}
