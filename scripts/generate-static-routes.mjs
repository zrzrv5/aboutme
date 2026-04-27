import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');

const SITE_URL = 'https://me.1sec.plus';
const LAST_MODIFIED = '2026-04-27';
const GA_ID = 'G-BPBV7R290N';

const publicationsData = JSON.parse(
  await readFile(path.join(publicDir, 'publications.json'), 'utf8'),
);
const publications = publicationsData.publications ?? publicationsData;
const metadata = publicationsData.metadata ?? {};

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const escapeAttr = escapeHtml;

const absoluteUrl = (url = '') => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const firstImage = (publication) => {
  const image = publication.coverImage ?? publication.abstractImage;
  return image?.large ?? image?.medium ?? image?.small;
};

const person = {
  '@id': `${SITE_URL}/#rui-zhou`,
  '@type': 'Person',
  name: 'Rui Zhou',
  alternateName: 'zrzrv5',
  url: SITE_URL,
  jobTitle: 'Ph.D. Candidate in Materials Science and Engineering',
  affiliation: {
    '@type': 'CollegeOrUniversity',
    name: 'Iowa State University',
  },
  knowsAbout: [
    'Solid-state batteries',
    'Battery materials',
    'Machine-learning force fields',
    'Molecular dynamics',
    'Density functional theory',
    'Discrete element methods',
    'iOS development',
  ],
  sameAs: [
    'https://scholar.google.com/citations?user=p27FiGAAAAAJ',
    'https://orcid.org/0000-0002-5789-4629',
    'https://github.com/zrzrv5',
    'https://www.linkedin.com/in/zrzrv5',
  ],
};

const scholarlyArticles = publications.map((publication) => ({
  '@type': 'ScholarlyArticle',
  headline: publication.title,
  author: publication.authors
    .split(', ')
    .filter(Boolean)
    .map((name) => ({
      '@type': 'Person',
      name,
    })),
  datePublished: String(publication.year),
  isPartOf: publication.journal
    ? {
        '@type': 'Periodical',
        name: publication.journal,
      }
    : undefined,
  url: publication.link,
  abstract: publication.abstract || undefined,
  image: absoluteUrl(firstImage(publication)),
}));

const webPageJsonLd = ({ url, title, description, hasPart = [] }) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url,
  name: title,
  description,
  dateModified: `${LAST_MODIFIED}T00:00:00-05:00`,
  mainEntity: person,
  hasPart,
});

const renderNav = () => `
  <nav class="static-fallback-nav" aria-label="Portfolio sections">
    <a href="/academic/">Academic</a>
    <a href="/industry/">Industry</a>
    <a href="/developer/">Developer</a>
  </nav>`;

const renderPublication = (publication) => {
  const title = escapeHtml(publication.title);
  const titleNode = publication.link
    ? `<a href="${escapeAttr(publication.link)}">${title}</a>`
    : title;
  const image = firstImage(publication);

  return `
    <article class="static-fallback-item">
      ${image ? `<img src="${escapeAttr(image)}" alt="Figure for ${title}" loading="lazy">` : ''}
      <div>
        <h3>${titleNode}</h3>
        <p><strong>${escapeHtml(publication.journal)}</strong>, ${escapeHtml(publication.year)}</p>
        <p>${escapeHtml(publication.authors)}</p>
        ${publication.abstract ? `<p>${escapeHtml(publication.abstract)}</p>` : ''}
      </div>
    </article>`;
};

const homeFallback = `
  <main class="static-fallback">
    ${renderNav()}
    <header>
      <h1>Rui Zhou</h1>
      <p>Battery materials researcher, simulation engineer, and iOS developer working across atomistic modeling, solid-state electrolytes, and practical app products.</p>
    </header>
    <section>
      <h2>Battery Research And Industry Work</h2>
      <p>I study solid-state battery materials with molecular dynamics, density functional theory, machine-learning force fields, and process-level simulation. My industry experience includes cathode materials, particle-scale modeling, electrode optimization, and parameter identification for battery models.</p>
    </section>
    <section>
      <h2>Explore</h2>
      <ul>
        <li><a href="/academic/">Academic research, publications, patents, education, and CV</a></li>
        <li><a href="/industry/">Industry-facing battery R&amp;D portfolio and resume</a></li>
        <li><a href="/developer/">iOS apps, TestFlight projects, and developer work</a></li>
      </ul>
    </section>
  </main>`;

const academicFallback = `
  <main class="static-fallback">
    ${renderNav()}
    <header>
      <h1>Rui Zhou Academic Profile</h1>
      <p>Ph.D. candidate in Materials Science and Engineering at Iowa State University, focused on computational battery materials, solid electrolytes, and machine-learning force-field simulations.</p>
      <p><a class="static-fallback-button" href="/ZHOU_Rui_CV-2026-Apr.pdf">Download Academic CV</a></p>
    </header>
    <section>
      <h2>Research Areas</h2>
      <ul>
        <li>Computational materials modeling with DFT, MD, ML-FF, MC, and DEM.</li>
        <li>Solid-state battery materials including sulfide, hydride, and oxyhalide electrolytes.</li>
        <li>Semiconductor materials including ZnS and CdTe photoplasticity studies.</li>
      </ul>
    </section>
    <section>
      <h2>Publications</h2>
      <p>${publications.length} publications, ${escapeHtml(metadata.patents ?? 4)} patents, and ${escapeHtml(metadata.peerReviews ?? 2)} peer reviews. Updated ${escapeHtml(metadata.lastUpdated ?? LAST_MODIFIED)}.</p>
      ${publications.map(renderPublication).join('')}
    </section>
    <section>
      <h2>Education And Experience</h2>
      <ul>
        <li>Ph.D. in Materials Science and Engineering, Iowa State University, Jan 2023 - present.</li>
        <li>Simulation Engineer, Sunwoda Electric Vehicle Battery Co., Ltd., Dec 2020 - Dec 2022.</li>
        <li>M.S. in Materials Science and Engineering, Washington University in St. Louis.</li>
        <li>B.S. in Materials Science and Engineering, Changchun University of Science and Technology.</li>
      </ul>
    </section>
  </main>`;

const industryFallback = `
  <main class="static-fallback">
    ${renderNav()}
    <header>
      <h1>Rui Zhou Industry Battery R&amp;D</h1>
      <p>Battery simulation and materials R&amp;D experience across cathodes, solid electrolytes, anodes, particle-scale electrode structure, parameter identification, and data-driven modeling.</p>
      <p><a class="static-fallback-button" href="/ZHOU_Rui_Resume_2025.pdf">Download Resume</a></p>
    </header>
    <section>
      <h2>Industry Focus</h2>
      <ul>
        <li>Cathode materials: NCM, LFP, and LFMP for energy density, high-voltage stability, and low-temperature performance.</li>
        <li>Solid-state electrolytes: glassy and crystalline sulfide, hydride, and oxyhalide materials for lithium and sodium batteries.</li>
        <li>Anodes and interphases: lithium-metal solid electrolyte interphase mechanisms and carbon-based anode experience.</li>
      </ul>
    </section>
    <section>
      <h2>Simulation Scales</h2>
      <ul>
        <li>Atomic scale with density functional theory and molecular dynamics.</li>
        <li>Particle scale with discrete element methods and electrode process optimization.</li>
        <li>Cell and system models with parameter identification for electrochemical and thermal simulation workflows.</li>
      </ul>
    </section>
  </main>`;

const developerFallback = `
  <main class="static-fallback">
    ${renderNav()}
    <header>
      <h1>Rui Zhou Developer Portfolio</h1>
      <p>Released iOS apps and experimental software projects built around native Apple platforms, scientific visualization, mapping, and small practical tools.</p>
    </header>
    <section>
      <h2>Released Apps</h2>
      <ul>
        <li>NAIIVE: experimental scientific visualization with spatial rendering and a node-based editor.</li>
        <li>TotK Companion: Tears of the Kingdom companion app that reached high App Store chart positions after launch.</li>
        <li>AmiiBot: Amiibo collection tracking with NFC scanning and writing.</li>
        <li>L!NG: customizable timetable app optimized for Apple Watch.</li>
      </ul>
    </section>
    <section>
      <h2>Ongoing Projects</h2>
      <ul>
        <li>Gas MinMax: compare nearby Costco and Sam's Club gas prices.</li>
        <li>LaneLoaf: turn dashcam footage into trip logs.</li>
        <li>Quick TrajView: view atom simulation trajectories directly in VS Code Server.</li>
      </ul>
    </section>
  </main>`;

const routes = [
  {
    path: '/',
    output: 'index.html',
    title: 'Rui Zhou | Battery Materials Research, Simulation, And iOS Apps',
    description:
      'Rui Zhou is a battery materials researcher, simulation engineer, and iOS developer focused on solid-state electrolytes, machine-learning force fields, and practical app products.',
    image: `${SITE_URL}/images/publications/ACS_Na2B10H10_medium.png`,
    fallback: homeFallback,
    jsonLd: webPageJsonLd({
      url: SITE_URL,
      title: 'Rui Zhou',
      description:
        'Battery materials researcher, simulation engineer, and iOS developer.',
    }),
  },
  {
    path: '/academic/',
    output: 'academic/index.html',
    title: 'Academic | Rui Zhou Battery Materials Research',
    description:
      'Academic profile for Rui Zhou: publications, patents, education, computational materials research, and solid-state battery materials work.',
    image: `${SITE_URL}/images/publications/ACS_Na2B10H10_medium.png`,
    fallback: academicFallback,
    jsonLd: webPageJsonLd({
      url: `${SITE_URL}/academic/`,
      title: 'Academic | Rui Zhou',
      description:
        'Publications, patents, education, and computational battery materials research by Rui Zhou.',
      hasPart: scholarlyArticles,
    }),
  },
  {
    path: '/industry/',
    output: 'industry/index.html',
    title: 'Industry | Rui Zhou Battery R&D And Simulation',
    description:
      'Industry-facing battery R&D portfolio for Rui Zhou: cathode materials, solid electrolytes, DEM, DFT, MD, parameter identification, and data-driven modeling.',
    image: `${SITE_URL}/images/publications/ACS_Na2B12H12_medium.png`,
    fallback: industryFallback,
    jsonLd: webPageJsonLd({
      url: `${SITE_URL}/industry/`,
      title: 'Industry | Rui Zhou Battery R&D',
      description:
        'Battery R&D, simulation engineering, materials modeling, and industry-facing experience by Rui Zhou.',
    }),
  },
  {
    path: '/developer/',
    output: 'developer/index.html',
    title: 'Developer | Rui Zhou iOS Apps And Scientific Tools',
    description:
      'Developer portfolio for Rui Zhou: released iOS apps, TestFlight projects, scientific visualization tools, and native Apple platform work.',
    image: `${SITE_URL}/images/naiive/naiive_me_banner-1.png`,
    fallback: developerFallback,
    jsonLd: webPageJsonLd({
      url: `${SITE_URL}/developer/`,
      title: 'Developer | Rui Zhou',
      description:
        'Released iOS apps, scientific visualization tools, and native Apple platform projects by Rui Zhou.',
    }),
  },
];

const stripManagedHead = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/\s*<meta\s+name=["']description["'][^>]*>\s*/gi, '')
    .replace(/\s*<meta\s+name=["']robots["'][^>]*>\s*/gi, '')
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, '')
    .replace(/\s*<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi, '')
    .replace(/\s*<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi, '')
    .replace(/\s*<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');

const injectHead = (html, route) => {
  const canonicalUrl = `${SITE_URL}${route.path === '/' ? '' : route.path}`;
  const head = [
    `<title>${escapeHtml(route.title)}</title>`,
    `<meta name="description" content="${escapeAttr(route.description)}">`,
    '<meta name="robots" content="index, follow">',
    `<link rel="canonical" href="${escapeAttr(canonicalUrl)}">`,
    '<meta property="og:type" content="profile">',
    `<meta property="og:site_name" content="Rui Zhou">`,
    `<meta property="og:title" content="${escapeAttr(route.title)}">`,
    `<meta property="og:description" content="${escapeAttr(route.description)}">`,
    `<meta property="og:url" content="${escapeAttr(canonicalUrl)}">`,
    `<meta property="og:image" content="${escapeAttr(route.image)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeAttr(route.title)}">`,
    `<meta name="twitter:description" content="${escapeAttr(route.description)}">`,
    `<meta name="twitter:image" content="${escapeAttr(route.image)}">`,
    `<script type="application/ld+json">${JSON.stringify(route.jsonLd)}</script>`,
  ].join('\n  ');

  return stripManagedHead(html).replace(
    /(<meta name="viewport"[^>]*>\s*)/i,
    `$1\n  ${head}\n`,
  );
};

const injectFallback = (html, fallback) =>
  html.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);

const writeRoute = async (template, route) => {
  const outputPath = path.join(distDir, route.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, injectFallback(injectHead(template, route), route.fallback));
};

const writeRobots = async () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
  await writeFile(path.join(distDir, 'robots.txt'), body);
};

const writeSitemap = async () => {
  const staticUrls = [
    ...routes.map((route) => ({
      loc: `${SITE_URL}${route.path === '/' ? '' : route.path}`,
      priority: route.path === '/' ? '1.0' : '0.9',
    })),
    {
      loc: `${SITE_URL}/publications.json`,
      priority: '0.4',
    },
    {
      loc: `${SITE_URL}/ZHOU_Rui_CV-2026-Apr.pdf`,
      priority: '0.5',
    },
    {
      loc: `${SITE_URL}/ZHOU_Rui_Resume_2025.pdf`,
      priority: '0.5',
    },
  ];

  const urls = staticUrls
    .map(
      ({ loc, priority }) => `  <url>
    <loc>${escapeHtml(loc)}</loc>
    <lastmod>${LAST_MODIFIED}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`,
    )
    .join('\n');

  await writeFile(
    path.join(distDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  );
};

const template = await readFile(path.join(distDir, 'index.html'), 'utf8');

await Promise.all(routes.map((route) => writeRoute(template, route)));
await Promise.all([writeRobots(), writeSitemap()]);

console.log(`Generated ${routes.length} static routes, robots.txt, and sitemap.xml for ${SITE_URL}`);
