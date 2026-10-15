// A small hysteresis band prevents labels flickering during a wheel or pinch.
export function mapLabelLevel(zoom, previous='overview') {
  return zoom >= (previous==='areas'?1.12:1.28) ? 'areas' : 'overview';
}

// Labels stay pinned to their anchors and never move to dodge each other.
// When two collide, the one already on screen keeps its place and the other
// fades out; a hidden label needs a little extra room from its neighbours
// before it returns, so nothing flickers while the camera turns. Boxes are in CSS pixels.
export function resolveMapLabels(labels,width,height,{gap=10,hysteresis=12}={}) {
  const taken=[{left:width-78,right:width-10,top:10,bottom:122}];
  const order=labels.map((label,index)=>({label,index})).sort((a,b)=>(b.label.shown?1:0)-(a.label.shown?1:0)||a.index-b.index);
  const visible=labels.map(()=>false);
  for(const {label,index} of order) {
    if(label.offscreen||!label.w)continue;
    const box={left:label.x-label.w/2,right:label.x+label.w/2,top:label.y-label.h/2,bottom:label.y+label.h/2};
    if(box.left<4||box.right>width-4||box.top<4||box.bottom>height-4)continue;
    const room=gap+(label.shown?0:hysteresis);
    if(taken.some(other=>box.left<other.right+room&&box.right>other.left-room&&box.top<other.bottom+room&&box.bottom>other.top-room))continue;
    taken.push(box);visible[index]=true;
  }
  return visible;
}
