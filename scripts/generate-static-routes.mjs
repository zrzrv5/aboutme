import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {createServer} from 'vite';
import {SITE_ORIGIN,VIEW_TITLES} from '../src/site/routes.js';
import {person,links} from '../src/redesign/content.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const publications=JSON.parse(await readFile(path.join(root,'public/publications.json'),'utf8'));
const template=await readFile(path.join(dist,'index.html'),'utf8');
const manifest=JSON.parse(await readFile(path.join(dist,'.vite/manifest.json'),'utf8'));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const description='Rui Zhou — computational materials researcher, battery simulation engineer, and native app developer. Research, experience, publications, and personal projects.';
// Link previews: 1200×630 screenshots of each view (public/previews/).
const PREVIEWS={
  portfolio:{src:'/previews/portfolio.jpg',alt:'The first screen of Rui Zhou’s portfolio: name, research summary and links.'},
  world:{src:'/previews/world.jpg',alt:'A low-poly island with buildings for Rui Zhou’s schools, workplaces and projects.'},
};
const server=await createServer({server:{middlewareMode:true},appType:'custom',optimizeDeps:{noDiscovery:true,include:[]}});
let resume;
try {
  const {default:App}=await server.ssrLoadModule('/src/App.jsx');
  resume=renderToString(React.createElement(React.StrictMode,null,React.createElement(App,{initialPublications:publications,initialRoute:{view:'resume',focus:null,notFound:false}})));
} finally {await server.close();}
const fallback=`<main class="static-fallback"><h1>Rui Zhou</h1><p>${escape(person.intro)}</p><p>${escape(person.looking)}</p><nav><a href="/">Read my research and projects</a><a href="${links.cv}">Academic CV (PDF)</a><a href="${links.email}">Email</a></nav><p>The interactive island opens with JavaScript. All professional information is also available in the 2D portfolio.</p></main>`;
const profile={
  '@context':'https://schema.org','@type':'ProfilePage',url:SITE_ORIGIN+'/',name:VIEW_TITLES.resume,
  mainEntity:{'@type':'Person',name:'Rui Zhou',alternateName:'周睿',url:SITE_ORIGIN,jobTitle:'PhD candidate in Materials Science and Engineering',affiliation:{'@type':'CollegeOrUniversity',name:'Iowa State University'},sameAs:[links.linkedin,links.github,links.scholar,links.orcid]},
};
const routes=[
  {path:'/',title:VIEW_TITLES.resume,body:resume,resume:true},
  {path:'/world/',title:VIEW_TITLES.world,body:fallback,preview:'world'},
  {path:'/about/',title:VIEW_TITLES.resume,canonical:'/',body:resume,resume:true},
  ...['academic','industry','developer'].map(p=>({path:`/${p}/`,title:VIEW_TITLES.resume,canonical:'/',body:resume,resume:true})),
  {path:'/404.html',title:'Page not found · Rui Zhou',body:'<main class="site-recovery"><h1>Page not found</h1><p>This address does not lead to a page on my site.</p><a href="/world/">Explore the island</a><a href="/">View my portfolio</a></main>',noindex:true},
];
for(const route of routes){
  const canonical=SITE_ORIGIN+(route.canonical??route.path);
  const css=route.resume?(manifest['index.html']?.css??[]):[];
  const preview=PREVIEWS[route.preview??'portfolio'];
  const head=`<title>${escape(route.title)}</title>
  <meta name="description" content="${escape(description)}">
  <meta name="robots" content="${route.noindex?'noindex, follow':'index, follow'}">
  <meta name="theme-color" content="${route.resume?'#e8e6e0':'#d8e6df'}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="profile"><meta property="og:site_name" content="Rui Zhou">
  <meta property="og:title" content="${escape(route.title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE_ORIGIN}${preview.src}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(preview.alt)}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(route.title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${SITE_ORIGIN}${preview.src}">
  ${route.noindex?'':`<script type="application/ld+json">${JSON.stringify({...profile,url:canonical,name:route.title}).replaceAll('<','\\u003c')}</script>`}
  ${route.resume?'<link rel="preload" href="/fonts/eb-garamond-normal-latin.woff2" as="font" type="font/woff2" crossorigin>':''}
  ${css.filter(file=>!template.includes(file)).map(file=>`<link rel="stylesheet" href="/${file}">`).join('\n  ')}`;
  const seed=route.resume?`<script type="application/json" id="site-publications">${JSON.stringify(publications).replaceAll('<','\\u003c')}</script>`:'';
  const html=template.replace(/<title>[\s\S]*?<\/title>/i,'').replace(/<meta name="description"[^>]*>/i,'').replace(/<link rel="canonical"[^>]*>/i,'').replace('</head>',`${head}\n</head>`).replace('<div id="root"></div>',`<div id="root"${route.resume?' data-ssr="portfolio"':''}>${route.body}</div>${seed}`);
  const file=path.join(dist,route.path==='/404.html'?'404.html':route.path==='/'?'index.html':route.path.slice(1)+'index.html');
  await mkdir(path.dirname(file),{recursive:true});await writeFile(file,html);
}
// Earlier links pointed at dated CV files; keep them working.
for(const legacy of ['ZHOU_Rui_CV-2026-Aug.pdf'])await copyFile(path.join(dist,links.cv.slice(1)),path.join(dist,legacy));
await writeFile(path.join(dist,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`);
await writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/world/'].map(p=>`<url><loc>${SITE_ORIGIN+p}</loc></url>`).join('')}</urlset>\n`);
console.log('Generated world, server-rendered résumé, legacy entry points, 404, and sitemap.');
