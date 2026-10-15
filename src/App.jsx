import React, { Component } from 'react';
import WorldsSite from './redesign/worlds/WorldsSite';

class SiteBoundary extends Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){
    if(this.state.failed)return <main className="site-recovery"><h1>Rui Zhou</h1><p>This view could not be loaded. Please try reloading, or open the portfolio.</p><a href="/">View the portfolio</a><button onClick={()=>window.location.reload()}>Reload</button><a href="/ZHOU_Rui_CV.pdf">Academic CV (PDF)</a></main>;
    return this.props.children;
  }
}
export default function App(props){
  return <SiteBoundary><WorldsSite {...props}/></SiteBoundary>;
}
