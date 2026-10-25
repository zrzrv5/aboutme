// Quality steps a slow GPU can fall back through. Each one only lowers the
// drawing-buffer resolution a little; geometry, lighting and shadows remain.
export const QUALITY_TIERS=[1,.82,.68];

export function worldRenderSettings({coarse=false,pixel=false,dpr=1,width=0,height=0,tier=0}={}) {
  // Keep phones crisp without letting large touch displays allocate an
  // unbounded drawing buffer. Shadows retain their separate mobile budget.
  // Large desktop monitors get a looser budget of their own.
  const pixels=width*height,budget=pixels>0?Math.sqrt((coarse?2_000_000:4_200_000)/pixels):Infinity;
  const base=pixel?1:Math.min(dpr,coarse?2:1.5,budget);
  const scale=QUALITY_TIERS[Math.min(tier,QUALITY_TIERS.length-1)];
  // Never drop below 0.8 of a CSS pixel: past that the island turns visibly soft.
  return {shadowSize:tier>0||coarse?1024:1536,pixelRatio:pixel?1:Math.max(Math.min(base,.8),base*scale)};
}

// Frame pacing judged over a window of rendered frames. A window closes after
// `frames` frames or `span` milliseconds, whichever comes first, so a very slow
// GPU is caught within a couple of seconds. A gap far beyond its target slot
// (a hidden tab, a loading hitch) is left out rather than counted as slowness.
export function createFrameGovernor({frames=40,span=1500,limit=1.45,tiers=QUALITY_TIERS.length}={}) {
  let sum=0,count=0,time=0,last=0;
  return {
    reset(){sum=0;count=0;time=0;last=0;},
    // Returns true when the recent frames ran too slowly for the target rate.
    sample(now,target,tier) {
      const gap=last?now-last:0;last=now;
      if(!gap||gap>1000||tier>=tiers-1)return false;
      sum+=gap/target;count++;time+=gap;
      if(count<frames&&(time<span||count<6))return false;
      const slow=sum/count>limit;sum=0;count=0;time=0;
      return slow;
    },
  };
}
