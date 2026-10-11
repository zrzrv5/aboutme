// Opt-in development instrumentation. No panel or timers in the shipped site.
export function createWorldProfiler(renderer,host,scene) {
  const output=document.createElement('output');
  output.className='world-performance'; output.setAttribute('aria-label','World performance');
  Object.assign(output.style,{position:'absolute',left:'12px',top:'12px',zIndex:30,maxWidth:'340px',padding:'10px',whiteSpace:'pre-wrap',font:'11px/1.5 monospace',background:'#152e32ee',color:'#fff',pointerEvents:'none'});
  host.append(output);
  const gl=renderer.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2'),pending=[];
  let query=null,frame=0,start=performance.now(),previous=start,windowStart=start,cpu=[],gpu=[],intervals=[],calls=[];
  const mean=v=>v.length?v.reduce((a,b)=>a+b,0)/v.length:0;
  const round=v=>Math.round(v*100)/100;
  return {
    begin() {
      start=performance.now();
      for(let i=pending.length-1;i>=0;i--) {
        const q=pending[i];
        if(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)) {
          if(!gl.getParameter(ext.GPU_DISJOINT_EXT)) gpu.push(gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6);
          gl.deleteQuery(q);pending.splice(i,1);
        }
      }
      if(ext&&frame%30===0&&pending.length<2) {query=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,query);}
    },
    end() {
      if(query) {gl.endQuery(ext.TIME_ELAPSED_EXT);pending.push(query);query=null;}
      const now=performance.now();cpu.push(now-start);intervals.push(now-previous);previous=now;frame++;calls.push(renderer.info.render.calls);output.dataset.frames=String(frame);
      if(now-windowStart<2000)return;
      const sorted=[...cpu].sort((a,b)=>a-b),info=renderer.info;
      const geometrySet=new Set(),textureSet=new Set();let geometryBytes=0,textureBytes=0;
      scene.traverse(node=>{if(node.geometry)geometrySet.add(node.geometry);for(const material of node.material?(Array.isArray(node.material)?node.material:[node.material]):[])for(const value of Object.values(material))if(value?.isTexture)textureSet.add(value);});
      for(const g of geometrySet){for(const a of Object.values(g.attributes))geometryBytes+=a.array.byteLength;if(g.index)geometryBytes+=g.index.array.byteLength;}
      for(const t of textureSet)textureBytes+=(t.image?.width??0)*(t.image?.height??0)*4*(t.generateMipmaps?4/3:1);
      let shadowPixels=0;scene.traverse(node=>{if(node.isLight&&node.castShadow)shadowPixels+=node.shadow.mapSize.x*node.shadow.mapSize.y;});
      const report={geometryBuffersMB:round(geometryBytes/1048576),texturePixelsMB:round(textureBytes/1048576),shadowPixels:renderer.shadowMap.enabled?shadowPixels:0,fps:round(1000/mean(intervals)),cpuMeanMs:round(mean(cpu)),cpuP95Ms:round(sorted[Math.floor(sorted.length*.95)]),gpuMs:gpu.length?round(mean(gpu)):null,drawCalls:info.render.calls,drawCallsMean:round(mean(calls)),drawCallsMax:Math.max(...calls),triangles:info.render.triangles,geometries:info.memory.geometries,textures:info.memory.textures,programs:info.programs.length,heapMB:performance.memory?round(performance.memory.usedJSHeapSize/1048576):null,pixels:renderer.domElement.width*renderer.domElement.height};
      output.textContent=JSON.stringify(report,null,2);output.dataset.report=JSON.stringify(report);
      cpu=[];gpu=[];intervals=[];calls=[];windowStart=now;
    },
    reset(state){previous=windowStart=performance.now();cpu=[];gpu=[];intervals=[];calls=[];output.dataset.state=state;},
    dispose(){for(const q of pending)gl.deleteQuery(q);output.remove();},
  };
}
