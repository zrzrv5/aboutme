import React, { Component, Suspense } from 'react';
import WorldsSite from './redesign/worlds/WorldsSite';

class SiteBoundary extends Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){
    if(this.state.failed)return <main className="site-recovery"><h1>Rui Zhou</h1><p>This view could not be loaded. Please try reloading, or open the portfolio.</p><a href="/">View the portfolio</a><button onClick={()=>window.location.reload()}>Reload</button><a href="/ZHOU_Rui_CV-2026-Aug.pdf">Academic CV (PDF)</a></main>;
    return this.props.children;
  }
}
export default function App(){
  return <SiteBoundary><Suspense fallback={<div className="site-loading" role="status">Loading…</div>}><WorldsSite/></Suspense></SiteBoundary>;
}
