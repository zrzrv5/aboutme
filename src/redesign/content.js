// Shared content for the redesign directions.
// Facts mirror ResumeSlop (AGENTS.md / CANDIDATE_PROFILE.md), public/publications.json,
// and the copy already on the current site. Do not add claims those sources do not support.

export const person = {
  name: 'Rui Zhou',
  nameZh: '周睿',
  location: 'Ames, Iowa',
  graduation: 'May 2027',
  interests: 'Materials research, simulation, machine learning and software',
  availability: 'I expect to graduate in May 2027 and can start in June 2027. I’m looking for roles in computational materials and machine learning for science, and I’m happy to relocate anywhere in the U.S.',
  // Plain, first-person. No taglines.
  intro:
    'I’m a PhD candidate in Materials Science and Engineering at Iowa State University. I study ion transport and deformation in materials — from solid electrolytes to semiconductors, ceramics and metals — and build software for simulations and everyday life.',
  looking: 'I expect to graduate in May 2027 and can start in June 2027. I’m looking for roles in computational materials and machine learning for science, and I’m happy to relocate anywhere in the U.S.',
};

// The old site's "I'm ___" switch, with its original one-liners.
export const hats = [
  { id: 'research', label: 'PhD candidate', aside: 'Atoms go brrrrr' },
  { id: 'industry', label: 'battery engineer', aside: 'Battery R&D, simulation, optimization' },
  { id: 'apps', label: 'iOS developer', aside: 'Yep, native apps only' },
];

export const links = {
  email: 'mailto:zrzrv5@gmail.com',
  emailText: 'zrzrv5@gmail.com',
  linkedin: 'https://www.linkedin.com/in/zrzrv5/',
  scholar: 'https://scholar.google.com/citations?user=p27FiGAAAAAJ',
  orcid: 'https://orcid.org/0000-0002-5789-4629',
  github: 'https://github.com/zrzrv5',
  cv: '/ZHOU_Rui_CV.pdf',
  resume: '/ZHOU_Rui_Resume.pdf',
};

export const counts = { papers: 13, firstAuthor: 5, patents: 4, apps: 4, reviews: 4 };

export const experience = [
  {
    id: 'seagate',
    hat: 'industry',
    org: 'Seagate Technology',
    title: 'Advanced Data Storage Material Discovery Intern',
    short: 'Material discovery intern',
    start: 2026,
    end: 2026,
    when: 'May – Aug 2026',
    location: 'Normandale, Minnesota',
    points: [
      'Built an end-to-end thin-film ellipsometry data-analysis and characterization workflow.',
      'Graph neural networks and RDKit descriptors for chemical-property prediction.',
      'Molecular dynamics of reader-head coating materials.',
    ],
  },
  {
    id: 'isu',
    hat: 'research',
    org: 'Iowa State University',
    title: 'PhD Researcher, Materials Science and Engineering',
    short: 'PhD, Materials Science',
    start: 2023,
    end: 2027,
    when: 'Jan 2023 – May 2027 (expected)',
    location: 'Ames, Iowa',
    points: [
      'DFT and ML-potential molecular dynamics of glassy and crystalline solid electrolytes: interfaces, phase transitions, ion transport.',
      'ML interatomic potentials trained with active learning on reference data from several electronic-structure methods; ML potential + QEq for interfaces.',
      'Constrained DFT for excited states in ZnS and CdTe (photoplasticity); MP2 for combustion chemistry.',
      'Bayesian optimization for electrolyte composition search; GNNs and diffusion models for property prediction and structure generation.',
      'Python, PyTorch, MLX and Slurm workflows on HPC.',
    ],
  },
  {
    id: 'sunwoda',
    hat: 'industry',
    org: 'Sunwoda EV Battery',
    title: 'Simulation Engineer',
    short: 'Simulation engineer',
    start: 2020,
    end: 2022,
    when: 'Dec 2020 – Dec 2022',
    location: 'Shenzhen, China',
    points: [
      'Developed workflows for ML-potential training, validation and high-throughput cathode calculations.',
      'Built tools for reference-structure generation and MD/DEM data processing.',
      'Calibrated DEM contact parameters to measured density–pressure curves; explored particle-size distributions and material mixing ratios.',
      'Developed Python tools for automated simulation-parameter fitting across rates and temperatures, with PSO, differential evolution and COMSOL interfaces.',
      'Regression and symbolic regression for battery power and swelling-force studies.',
    ],
  },
];

export const experienceById = Object.fromEntries(experience.map(entry => [entry.id, entry]));

export const education = [
  { id: 'isu', school: 'Iowa State University', degree: 'PhD, Materials Science and Engineering', when: experienceById.isu.when },
  {
    id: 'wustl', school: 'Washington University in St. Louis',
    degree: 'MS, Materials Science and Engineering',
    when: '2018 – 2019',
    note: 'Thesis: molecular dynamics of thin-film water evaporation on graphene-coated silicon.',
  },
  {
    id: 'cust', school: 'Changchun University of Science and Technology',
    degree: 'BS, Materials Science and Engineering',
    when: '2014 – 2018',
    note: 'Lab work on carbon anode materials: electrospinning, high-temperature high-pressure synthesis, half-cells.',
  },
];

export const tools = {
  simulation: ['VASP', 'Quantum ESPRESSO', 'GAMESS', 'LAMMPS', 'LIGGGHTS', 'ASE'],
  ml: ['PyTorch', 'MLX', 'scikit-learn', 'RDKit', 'dpdata'],
  code: ['Python', 'Swift', 'Metal', 'MATLAB', 'C', 'Slurm'],
};

// Public grant records; filing years describe when the Sunwoda work was done.
export const patents = [
  { key: 'cathode', id: 'CN114744187B', title: 'Ternary cathode material and its preparation', filed: '2022-06-09', granted: '2022-10-28' },
  { key: 'particles', id: 'CN114169233B', title: 'Optimizing the particle size of electrode material particles', filed: '2021-11-30', granted: '2025-01-07' },
  { key: 'mixing', id: 'CN115579085B', title: 'Simulation-based design of battery material mixing ratios', filed: '2022-10-14', granted: '2025-11-25' },
  { key: 'calibration', id: 'CN115392123B', title: 'Parameter identification for secondary-battery physical models', filed: '2022-08-26', granted: '2025-08-08' },
].map(patent => ({...patent, year: Number(patent.filed.slice(0,4)), href: `https://patents.google.com/patent/${patent.id}/en`}));
export const patentByKey = Object.fromEntries(patents.map(patent => [patent.key, patent]));

export const appMedia = {
  naiive: {src:'/images/projects/naiive.webp', preview:'/images/projects/naiive-thumb.webp', alt:'NAIIVE molecular visualization and node editor'},
  totk: {src:'/images/projects/totk.webp', preview:'/images/projects/totk-thumb.webp', alt:'TotK Companion map and collection tracker'},
  amiibot: {src:'/images/projects/amiibot.webp', preview:'/images/projects/amiibot-thumb.webp', alt:'AmiiBot collection and NFC features'},
  ling: {src:'/images/projects/ling.webp', preview:'/images/projects/ling-thumb.webp', alt:'L!NG timetable on Apple Watch'},
};

export const apps = [
  {
    id: 'naiive',
    name: 'NAIIVE',
    year: 2026,
    what: 'Visualizer for atomistic simulations and ML-potential datasets, 2D and spatial 3D, with a node editor. Swift and Metal.',
    meta: 'Available on the App Store',
    note: 'Available on the App Store; TestFlight carries experimental builds.',
    figure: 'naiive',
    href: 'https://naiive.1sec.plus',
    links: [
      { label: 'Website', href: 'https://naiive.1sec.plus' },
      { label: 'App Store', href: 'https://apps.apple.com/us/app/naiive/id6758065886' },
      { label: 'TestFlight', href: 'https://testflight.apple.com/join/VrYnN9nE' },
      { label: 'GitHub', href: 'https://github.com/zrzrv5/NAIIVE' },
    ],
  },
  {
    id: 'totk',
    name: 'TotK Companion',
    year: 2023,
    what: 'Map and tracker for Tears of the Kingdom: shrines, collectibles, iCloud sync. Reached #2 in the US App Store after launch (#1 in other regions).',
    meta: '10K+ downloads',
    note: 'Vibe-coding before it was cool. Built in two days with ChatGPT and Midjourney.',
    figure: 'totk',
    href: 'https://apps.apple.com/us/app/tears-of-the-kingdom-companion/id6448892536',
    links: [{ label: 'App Store', href: 'https://apps.apple.com/us/app/tears-of-the-kingdom-companion/id6448892536' }],
  },
  {
    id: 'amiibot',
    name: 'AmiiBot',
    year: 2020,
    what: 'Amiibo collection tracker with NFC scanning and writing.',
    meta: '10K+ downloads',
    note: 'A 2020 pandemic project to kill some time. Unexpectedly went viral.',
    figure: 'amiibot',
    href: 'https://apps.apple.com/us/app/amiibot/id1514835611',
    links: [{ label: 'App Store', href: 'https://apps.apple.com/us/app/amiibot/id1514835611' }],
  },
  {
    id: 'ling',
    name: 'L!NG',
    year: 2017,
    what: 'Timetable app built for the Apple Watch. My first App Store release.',
    meta: '1K–5K downloads · retired',
    note: 'Bring back Time Travel on Apple Watch!!!',
    figure: 'ling',
    href: null,
    links: [],
  },
];

export const appById = Object.fromEntries(apps.map(app => [app.id, app]));

export const sideProjects = [
  { name: 'Quick TrajView', what: 'VS Code extension that previews MD trajectories.', href: 'https://github.com/zrzrv5/QuickTrajView-vscode' },
  { name: 'LaneLoaf', what: 'Turns dashcam footage into trip logs.', href: 'https://laneloaf.1sec.plus' },
  { name: 'Gas MinMax', what: 'Costco or Sam’s Club: is the cheaper gas worth the drive?', href: 'https://testflight.apple.com/join/g1fW16zk' },
  { name: 'Fujifilm remote', what: 'Camera shutter remote for Apple Watch over Bluetooth. Unreleased.', href: null },
];

// Short names for journals, used when listing publications.json.
const VENUE_SHORT = {
  'Journal of Materials Chemistry A': 'J. Mater. Chem. A',
  'ACS Applied Energy Materials': 'ACS Appl. Energy Mater.',
  'Physical Review Materials': 'Phys. Rev. Materials',
  'Chemical Communications': 'Chem. Commun.',
  'Journal of Chemical Information and Modeling': 'J. Chem. Inf. Model.',
  'International Journal of Mechanical Sciences': 'Int. J. Mech. Sci.',
  'ACS Electrochemistry': 'ACS Electrochem.',
  'ACS Applied Materials & Interfaces': 'ACS Appl. Mater. Interfaces',
  'ACS Materials Letters': 'ACS Mater. Lett.',
  'ACS Applied Engineering Materials': 'ACS Appl. Eng. Mater.',
  'Journal of Colloid and Interface Science': 'J. Colloid Interface Sci.',
  'Chemical Engineering Journal': 'Chem. Eng. J.',
};

export function normalizePublications(raw) {
  const list = Array.isArray(raw) ? raw : raw?.publications ?? [];
  return list.map((p) => {
    const authors = p.authors.split(', ');
    const first = authors[0] === 'Rui Zhou';
    return {
      title: p.title.replace('Na2B12H12', 'Na₂B₁₂H₁₂'),
      authors,
      firstAuthor: first,
      venue: VENUE_SHORT[p.journal] ?? p.journal,
      year: p.year,
      link: p.link,
    };
  });
}
