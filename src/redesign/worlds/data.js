// Shared content for the plain page and the island. Home and library remain
// content anchors for older links; neither has a building on the island.
// Facts come from ResumeSlop, publications.json, project READMEs and the current site. Do not invent numbers.

export const LINKS = {
  email: 'mailto:zrzrv5@gmail.com',
  emailText: 'zrzrv5@gmail.com',
  linkedin: 'https://www.linkedin.com/in/zrzrv5/',
  scholar: 'https://scholar.google.com/citations?user=p27FiGAAAAAJ',
  orcid: 'https://orcid.org/0000-0002-5789-4629',
  github: 'https://github.com/zrzrv5',
  cv: '/ZHOU_Rui_CV-2026-Aug.pdf',
  resume: '/ZHOU_Rui_Resume.pdf',
};

export const HATS = [
  { id: 'research', label: 'PhD candidate', aside: 'Atoms go brrrrr' },
  { id: 'industry', label: 'battery engineer', aside: 'Battery R&D, simulation, optimization' },
  { id: 'apps', label: 'iOS developer', aside: 'Yep, native apps only' },
];

// One level of classification: the kind of work. Places are the playful names;
// plain/blurb are also used on the professional page and contain no game vocabulary.
export const BIOMES = [
  {
    id: 'research',
    name: 'Glasslands',
    plain: 'Materials research',
    blurb: 'Batteries, semiconductors, and the atoms underneath.',
    description: 'From solid electrolytes at Iowa State to battery engineering at Sunwoda and thin films at Seagate.',
    number: '01',
    hat: 'research',
  },
  {
    id: 'software',
    name: 'The Foundry',
    plain: 'Research tools',
    blurb: 'Simulation software, visualization, and AI research workflows.',
    description: 'Tools I build for working with atoms: from NAIIVE and native GPU computing to AI agents on research clusters.',
    number: '02',
    hat: 'research',
  },
  {
    id: 'apps',
    name: 'Orchard Village',
    plain: 'Apps & experiments',
    blurb: 'Native apps and little things made out of curiosity.',
    description: 'Amiibo, Hyrule, an Apple Watch timetable, and a few everyday experiments. Yep, native apps only.',
    number: '03',
    hat: 'apps',
  },
];

const PHD_START = Date.UTC(2023, 0, 1);
const PHD_END = Date.UTC(2027, 4, 15);

export function phdProgress(now = Date.now()) {
  const v = Math.min(1, Math.max(0, (now - PHD_START) / (PHD_END - PHD_START)));
  return Math.round(v * 100);
}

// kind: hub | area | sub | boss | mini | side | trophy | main
export const ENTITIES = [
  // ---------------- Ames (hub) ----------------
  {
    id: 'home',
    biome: 'ames',
    kind: 'hub',
    name: 'Rui’s house',
    title: 'Rui Zhou 周睿',
    meta: 'Ames, Iowa',
    summary: 'PhD candidate in Materials Science and Engineering at Iowa State University.',
    details: [
      'I study how materials transport ions, deform and respond to their surroundings, and build software for simulations and everyday life.',
      'Before the PhD: two years of battery simulation at Sunwoda. In summer 2026: an internship at Seagate.',
    ],
  },
  {
    id: 'job',
    biome: 'ames',
    kind: 'main',
    name: 'Quest board',
    title: 'Open to opportunities',
    status: 'From May 2027',
    meta: 'From May 2027',
    summary: 'I expect to graduate in May 2027 and welcome opportunities across roles and industries. Happy to move anywhere in the U.S.',
    details: ['Open to jobs, collaborations and new directions. Get in touch if you have an opportunity in mind.'],
    links: [
      { label: 'Email me', href: LINKS.email },
      { label: 'Résumé (PDF)', href: LINKS.resume },
      { label: 'CV (PDF)', href: LINKS.cv },
      { label: 'LinkedIn', href: LINKS.linkedin },
    ],
  },
  {
    id: 'library',
    biome: 'ames',
    kind: 'trophy',
    name: 'Parks Library',
    title: 'Papers',
    meta: '13 peer-reviewed · 5 first-author',
    summary: 'Every paper so far, newest first. I also review for journals (4 reviews).',
    papers: true,
    links: [{ label: 'Google Scholar', href: LINKS.scholar }],
  },

  // ---------------- Materials research ----------------
  {
    id: 'isu',
    biome: 'research',
    kind: 'area',
    name: 'Iowa State Campus',
    roleLabel: 'PhD @ ISU',
    title: 'Iowa State University',
    period: 'Jan 2023 – May 2027 (expected)',
    sectionLabel: 'Research',
    publicationYears: [2023, 2027],
    publicationLabel: 'Papers during my PhD',
    relatedResearch: ['photo'],
    record: 'phd',
    meta: 'PhD researcher · Jan 2023 – May 2027',
    summary: 'Atomic-scale studies of solid electrolytes, semiconductors, ceramics and metals using electronic-structure calculations and ML potentials.',
    details: [
      'Interfaces, phase transitions and ion transport in glassy and crystalline solid electrolytes, including Li–Si–P–S, closo-hydroborates and Li–Al–Cl–O.',
      'Collaborative work on photoexcited ZnS and CdTe, dislocations in high-entropy carbides, and Mg–Bi alloys.',
      'ML interatomic potentials trained with active learning on reference data from several electronic-structure methods; ML potential + QEq for interfaces.',
      'Bayesian optimization for electrolyte composition search; GNNs and diffusion models for property prediction and structure generation.',
      'Python, PyTorch, MLX and Slurm workflows on HPC.',
    ],
    links: [{ label: 'Cover article, ACS Electrochemistry', href: 'https://doi.org/10.1021/acselectrochem.4c00077' }],
  },
  {
    id: 'wustl',
    biome: 'research',
    kind: 'education',
    name: 'Brookings Hall',
    roleLabel: 'Master’s @ WUSTL',
    title: 'Washington University in St. Louis',
    period: '2018 – 2020',
    sectionLabel: 'Study',
    meta: 'MS, Materials Science and Engineering · 2018 – 2020',
    summary: 'My master’s years in St. Louis: molecular dynamics of thin-film water evaporation on graphene-coated silicon.',
    details: [
      'MS in Materials Science and Engineering, 2018–2020.',
      'Thesis research on thin-film water evaporation using molecular dynamics.',
      'Course projects: MEMS microfabrication in a team project on passive-mixer microfluidic devices, and simulation with ANSYS Fluent.',
    ],
  },
  {
    id: 'cust',
    biome: 'research',
    kind: 'education',
    name: '理工门 · Gate of Light',
    roleLabel: 'Undergrad @ CUST',
    title: '长春理工大学 · CUST',
    period: '2014 – 2018',
    sectionLabel: 'Study',
    publicationYears: [2014, 2018],
    publicationLabel: 'Undergraduate papers',
    meta: 'BS, Materials Science and Engineering · 2014 – 2018',
    summary: 'My undergraduate years at Changchun University of Science and Technology, with early lab work on carbon anode materials.',
    details: [
      'BS in Materials Science and Engineering, 2014–2018.',
      'Carbon anode materials: electrospinning, high-temperature high-pressure synthesis, and half-cell testing.',
    ],
  },
  {
    id: 'phd',
    biome: 'research',
    kind: 'boss',
    name: 'The Dissertation',
    title: 'PhD dissertation',
    meta: 'Final boss · May 2027',
    summary: 'In progress: solid electrolytes and interfaces, with graduation expected in May 2027.',
    details: ['The bar is just the calendar: January 2023 to May 2027.'],
    progress: { kind: 'time', label: 'of the PhD behind me' },
  },
  {
    id: 'sunwoda',
    biome: 'research',
    kind: 'sub',
    name: 'Cathode Quarry',
    roleLabel: 'Simulation engineer @ Sunwoda',
    title: 'Sunwoda EV Battery',
    location: 'Shenzhen, China',
    period: 'Dec 2020 – Dec 2022',
    sectionLabel: 'Work',
    record: 'patents',
    meta: 'Simulation engineer · Dec 2020 – Dec 2022',
    summary: 'I developed simulation workflows and Python tools for battery R&D, alongside studies of cathode materials, powder compaction and cell behavior.',
    details: [
      'Materials modeling: ML-potential training and validation for cathodes, with automated generation of DFT reference structures and analysis of diffusion, lattice changes and stability.',
      'Powder compaction: calibrated DEM contact parameters against measured density–pressure curves, then explored particle-size distributions and material mixing ratios.',
      'Model calibration: developed Python tools to fit simulation parameters across charge/discharge rates and temperatures, using particle-swarm and differential-evolution algorithms.',
      'Research software: tools for reference-structure generation and MD/DEM data processing, and Python interfaces to run and fit COMSOL models.',
      'Data-driven models: regression and symbolic regression for battery power and swelling-force studies.',
    ],
  },
  {
    id: 'patents',
    biome: 'research',
    kind: 'trophy',
    name: 'Four heart pieces',
    title: 'Patents',
    meta: '4 granted · 2021–2022',
    summary: 'All four came out of the Sunwoda years.',
    list: [
      'Ternary cathode material and its preparation · CN114744187B',
      'Optimizing the particle size of electrode material particles · CN114169233A',
      'Simulation-based design of battery material mixing ratios · CN115579085A',
      'Parameter identification for secondary-battery physical models · CN115392123A',
    ],
  },

  // Semiconductor and storage research
  {
    id: 'seagate',
    biome: 'research',
    kind: 'area',
    name: 'Thin-Film Peak',
    roleLabel: 'Intern @ Seagate',
    title: 'Seagate Technology',
    location: 'Minnesota, USA',
    period: 'May – Aug 2026',
    sectionLabel: 'Work',
    meta: 'Material discovery intern · May – Aug 2026',
    status: 'Cleared',
    summary: 'Advanced data-storage material discovery.',
    details: [
      'Built an end-to-end thin-film ellipsometry data-analysis and characterization workflow.',
      'Graph neural networks and RDKit descriptors for chemical-property prediction.',
      'Molecular dynamics of reader-head and advanced coating materials.',
    ],
  },
  {
    id: 'photo',
    biome: 'research',
    kind: 'area',
    gameParent: 'isu',
    name: 'Semiconductors and hard materials',
    title: 'Semiconductors and hard materials',
    meta: 'Iowa State · co-authored work',
    summary: 'What light and defects do to crystals.',
    details: [
      'Photoplasticity in ZnS and CdTe: constrained DFT for excited states, then ML potentials for dislocations.',
      'Dislocations in high-entropy carbide ceramics and Mg–Bi alloys with ML potentials.',
    ],
    links: [
      { label: 'ZnS, ACS Mater. Lett. 2024', href: 'https://doi.org/10.1021/acsmaterialslett.4c01982' },
      { label: 'CdTe, Int. J. Mech. Sci. 2025', href: 'https://doi.org/10.1016/j.ijmecsci.2025.110765' },
    ],
  },

  // ---------------- Native apps and scientific software ----------------
  {
    id: 'totk',
    biome: 'apps',
    kind: 'area',
    name: 'TotK Companion',
    title: 'TotK Companion',
    meta: '2023 · 10K+ downloads',
    summary: 'Map and tracker for Tears of the Kingdom. Reached #2 in the US App Store after launch (#1 in other regions).',
    details: ['Vibe-coding before it was cool: built in two days with ChatGPT and Midjourney.'],
    links: [
      { label: 'App screenshots', href: '/images/totk/banner_large.png' },{ label: 'App Store', href: 'https://apps.apple.com/us/app/tears-of-the-kingdom-companion/id6448892536' }],
  },
  {
    id: 'amiibot',
    biome: 'apps',
    kind: 'area',
    name: 'AmiiBot',
    title: 'AmiiBot',
    meta: '2020 · 10K+ downloads',
    summary: 'Amiibo collection tracker with NFC scanning and writing.',
    details: ['A pandemic side project that turned into an app for other collectors.'],
    links: [
      { label: 'App screenshots', href: '/images/amiibot/old@3x.png' },{ label: 'App Store', href: 'https://apps.apple.com/us/app/amiibot/id1514835611' }],
  },
  {
    id: 'ling',
    biome: 'apps',
    kind: 'area',
    name: 'L!NG',
    title: 'L!NG',
    meta: '2017 · 1K–5K downloads · retired',
    summary: 'Timetable app built for the Apple Watch. My first App Store release.',
    details: ['My first App Store release, built around having a timetable on the wrist. Now retired.'],
    links: [{ label: 'App screenshots', href: '/images/mytimetable/app@3x.png' }],
  },
  {
    id: 'naiive',
    biome: 'software',
    kind: 'sub',
    name: 'NAIIVE',
    title: 'NAIIVE',
    meta: 'Apple platforms · Swift & Metal',
    status: 'Released',
    summary: 'Node-based visualization studio for atomistic simulations and ML-potential datasets, in Swift and Metal.',
    details: ['Inspect atomistic trajectories and ML-potential datasets with a node-based editor, real-time rendering and spatial / AR views.', 'Released on Apple platforms; TestFlight carries the latest experiments.'],
    links: [
      { label: 'App screenshots', href: '/images/naiive/naiive_me_banner.png' },
      { label: 'Website', href: 'https://naiive.1sec.plus' },
      { label: 'TestFlight', href: 'https://testflight.apple.com/join/VrYnN9nE' },
      { label: 'GitHub', href: 'https://github.com/zrzrv5/NAIIVE' },
    ],
  },
  {
    id: 'dpmetal',
    biome: 'software',
    kind: 'mini',
    name: 'DPMetal',
    title: 'DPMetal',
    meta: 'In progress',
    summary: 'Run pretrained interatomic potentials on Apple GPUs, with energies, forces and virials available directly from Swift.',
    details: [
      'Verified up to 256,000 atoms on M1 Max and M4.',
      'Core AI + Metal inference, checked against a Python reference. A separate demo explores atom and cell minimization.',
      'Not yet wired into NAIIVE.',
    ],
    links: [{ label: 'Project post on LinkedIn', href: 'https://lnkd.in/p/gGVtrd8x' }],
  },
  {
    id: 'typeshi',
    biome: 'software',
    kind: 'side',
    name: 'TypeSHI',
    title: 'TypeSHI',
    meta: 'Side quest · 2026',
    status: 'Experiment',
    summary: 'Recover likely element names from simulation files that contain only anonymous atom types and coordinates.',
    details: [
      'Partial-RDF descriptors and a 1.85M-parameter set-transformer; a 1.9 MB int8 model, under a second on CPU.',
      'The output is a ranked set of hypotheses, not a unique answer: different elements can have similar local geometry.',
    ],
    stats: [
      { label: 'top-1', value: 60 },
      { label: 'top-3', value: 82 },
      { label: 'top-5', value: 93 },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/zrzrv5/TypeSHI' }],
  },
  {
    id: 'trajview',
    biome: 'software',
    kind: 'side',
    name: 'Quick TrajView',
    title: 'Quick TrajView',
    meta: 'Side quest · VS Code',
    status: 'VS Code',
    summary: 'Preview MD trajectories (VASP, LAMMPS, DeepMD, CP2K, XYZ…) right inside VS Code.',
    links: [{ label: 'GitHub', href: 'https://github.com/zrzrv5/QuickTrajView-vscode' }],
  },
  {
    id: 'laneloaf',
    biome: 'apps',
    kind: 'side',
    name: 'LaneLoaf',
    title: 'LaneLoaf',
    meta: 'Side quest · ongoing',
    status: 'Ongoing',
    summary: 'Turns dashcam footage into trip logs.',
    links: [{ label: 'Website', href: 'https://laneloaf.1sec.plus' }],
  },
  {
    id: 'gas',
    biome: 'apps',
    kind: 'side',
    name: 'Gas MinMax',
    title: 'Gas MinMax',
    meta: 'Side quest · TestFlight',
    status: 'TestFlight',
    summary: 'Costco or Sam’s Club: is the cheaper gas worth the drive?',
    links: [{ label: 'TestFlight', href: 'https://testflight.apple.com/join/g1fW16zk' }],
  },
  {
    id: 'fuji',
    biome: 'apps',
    kind: 'side',
    name: 'Fujifilm remote',
    title: 'Fujifilm remote',
    meta: 'Side quest · unreleased',
    status: 'Unreleased',
    summary: 'An unreleased Apple Watch experiment: trigger a Fujifilm camera shutter over Bluetooth.',
  },

  // ---------------- AI for science ----------------
  {
    id: 'slop',
    biome: 'software',
    group: 'agents',
    kind: 'area',
    name: 'S.L.O.P.',
    relatedProjects: ['dshslop', 'gradbench'],
    title: 'S.L.O.P.',
    meta: 'Private repo',
    summary: 'An AI agent runtime for computational materials science.',
    details: ['An experiment in giving an agent reusable methods, remote machines and a way to follow long-running calculations.'],
  },
  {
    id: 'dshslop',
    biome: 'software',
    group: 'agents',
    kind: 'boss',
    name: 'DSH-SLOP',
    title: 'DSH-SLOP',
    meta: 'HPC agent plugin · in development',
    status: 'In development',
    summary: 'Persistent machine connections, reusable notes and job tracking for agents working on HPC clusters.',
    details: [
      'Machine: log in once, password and 2FA stay out of the model transcript.',
      'Knowledge: per-machine notes the agent can search.',
      'Queue: a ledger of submitted Slurm/PBS jobs that tells the chat when something changes.',
    ],
  },
  {
    id: 'gradbench',
    biome: 'software',
    group: 'agents',
    kind: 'side',
    name: 'GradBench',
    title: 'GradBench',
    meta: 'Side quest · benchmark',
    status: 'Benchmark',
    summary: 'Tests whether AI agents complete research tasks, recover from mistakes and verify the delivered work.',
    details: ['Tasks drawn from research workflows: recover partial work, follow jobs to completion, use the right evidence and verify the delivered files.', 'Models, harnesses and prompts are compared under the same task conditions.'],
  },

];

// Tools are the items. `found` is where each one was first picked up.
export const ITEMS = [
  { id: 'dft', name: 'DFT Blade', what: 'Density functional theory', tools: 'VASP, Quantum ESPRESSO, GAMESS', found: 'sunwoda', used: ['isu'] },
  { id: 'md', name: 'MD Bow', what: 'Molecular dynamics', tools: 'LAMMPS, ASE', found: 'wustl', foundNote: 'Picked up in 2018 for an MS thesis on thin-film evaporation', used: ['sunwoda', 'isu', 'seagate'] },
  { id: 'mlip', name: 'Hookshot', what: 'ML interatomic potentials', tools: 'Active learning, DeepMD / DPA, dpdata', found: 'sunwoda', used: ['isu', 'dpmetal'] },
  { id: 'dem', name: 'DEM Bombs', what: 'Discrete element method', tools: 'LIGGGHTS', found: 'sunwoda', used: ['patents'] },
  { id: 'p2d', name: 'Ohm Compass', what: 'Electrochemical cell models', tools: 'P2D, ECM, FEM parameter identification', found: 'sunwoda', used: ['patents'] },
  { id: 'gnn', name: 'Graph Lens', what: 'Graph neural networks', tools: 'GNNs, RDKit, diffusion models', found: 'isu', used: ['seagate'] },
  { id: 'bo', name: 'Optimization Bell', what: 'Optimization', tools: 'Parameter identification, model fitting, Bayesian optimization', found: 'sunwoda', used: ['isu'] },
  { id: 'python', name: 'Py Ocarina', what: 'Python', tools: 'NumPy, PyTorch, MLX, scikit-learn', found: 'cust', used: ['sunwoda', 'isu', 'seagate', 'typeshi'] },
  { id: 'slurm', name: 'Slurm Lantern', what: 'HPC', tools: 'Slurm, PBS, job workflows', found: 'wustl', used: ['isu', 'dshslop'] },
  { id: 'swift', name: 'Swift Feather', what: 'Swift', tools: 'SwiftUI, Core NFC, CloudKit, MapKit', found: 'ling', used: ['totk', 'amiibot', 'naiive'] },
  { id: 'metal', name: 'Metal Gauntlet', what: 'GPU programming', tools: 'Metal, Core AI', found: 'naiive', used: ['dpmetal'] },
  { id: 'agent', name: 'Bottled Agent', what: 'LLM agents', tools: 'Codex, Claude Code, DeepSeek Harness', found: 'slop', used: ['dshslop', 'gradbench'] },
  { id: 'matlab', name: 'Matrix Scroll', what: 'MATLAB', tools: 'Numerical computing, matrices and visualization', found: 'cust', used: [] },
  { id: 'lab', name: 'Lab Flask', what: 'Materials experiments', tools: 'Electrospinning, high-temperature high-pressure synthesis, half-cell testing', found: 'cust', used: [] },
  { id: 'mems', name: 'MEMS fabrication', what: 'MEMS fabrication', tools: 'Course project · microfluidic-device fabrication', found: 'wustl', used: [] },
  { id: 'fluent', name: 'ANSYS Fluent', what: 'CFD simulation', tools: 'ANSYS Fluent · course project', found: 'wustl', used: [] },
];

export const EDUCATION = [
  { id: 'isu', school: 'Iowa State University', degree: 'PhD, Materials Science and Engineering', when: '2023 – 2027' },
  { id: 'wustl', school: 'Washington University in St. Louis', degree: 'MS, Materials Science and Engineering', when: '2018 – 2020', note: 'Thesis: molecular dynamics of thin-film water evaporation on graphene-coated silicon.' },
  { id: 'cust', school: 'Changchun University of Science and Technology', degree: 'BS, Materials Science and Engineering', when: '2014 – 2018', note: 'Lab work on carbon anode materials.' },
];

export const byId = Object.fromEntries(ENTITIES.map((e) => [e.id, e]));
export const itemById = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
export const biomeById = Object.fromEntries(BIOMES.map((b) => [b.id, b]));

// Periods describe the stage of study, rather than inferring institutional
// affiliations from publication dates. Keep the complete list on the plain page.
export function papersForExperience(entity, papers) {
  if (!entity.publicationYears) return [];
  const [start,end] = entity.publicationYears;
  return papers.filter(paper => paper.year >= start && paper.year <= end);
}

// Keep links from the earlier four-biome exploration working.
export function normalizeFocus(id) {
  const aliases = { 'biome:battery': 'biome:research', 'biome:crystal': 'biome:research', 'biome:orchard': 'biome:apps', 'biome:swamp': 'biome:software', 'biome:agents': 'biome:software', 'biome:ames': 'home' };
  return aliases[id] ?? id;
}

export function progressOf(e) {
  if (!e.progress) return null;
  if (e.progress.kind === 'time') return { pct: phdProgress(), text: `${phdProgress()}% ${e.progress.label}` };
  const pct = Math.round((e.progress.value / e.progress.max) * 100);
  return { pct, text: `${e.progress.value.toLocaleString('en-US')} ${e.progress.label}` };
}

export const QUEST_KINDS = { main: 'Main quest', boss: 'Boss', mini: 'Mini-boss', side: 'Side quest' };
