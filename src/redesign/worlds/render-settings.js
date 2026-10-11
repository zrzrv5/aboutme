export function worldRenderSettings({coarse=false,pixel=false,dpr=1}={}) {
  return {shadowSize:coarse?1024:1536,pixelRatio:pixel?1:Math.min(dpr,coarse?1.25:1.5)};
}
