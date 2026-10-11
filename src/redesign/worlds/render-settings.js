export function worldRenderSettings({coarse=false,pixel=false,dpr=1,width=0,height=0}={}) {
  // Keep phones crisp without letting large touch displays allocate an
  // unbounded drawing buffer. Shadows retain their separate mobile budget.
  const budget=coarse&&width>0&&height>0?Math.sqrt(2_000_000/(width*height)):Infinity;
  return {shadowSize:coarse?1024:1536,pixelRatio:pixel?1:Math.min(dpr,coarse?2:1.5,budget)};
}
