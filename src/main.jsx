import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './site/site.css'
import './site/fonts.css'
import App from './App.jsx'
import { initAnalytics } from './site/analytics'

initAnalytics()

const root=document.getElementById('root');
let publications;
try{publications=JSON.parse(document.getElementById('site-publications')?.textContent??'null');}catch{/* Fetch remains available. */}
const hydrated=root.dataset.ssr==='portfolio';
const app=<StrictMode><App initialPublications={publications} initialRoute={hydrated?{view:'resume',focus:null,notFound:false}:undefined}/></StrictMode>;
if(hydrated)hydrateRoot(root,app);
else createRoot(root).render(app);
