// A small hysteresis band prevents labels flickering during a wheel or pinch.
export function mapLabelLevel(zoom, previous='overview') {
  return zoom >= (previous==='areas'?1.12:1.28) ? 'areas' : 'overview';
}

// Place only a handful of map labels. Try nearby screen-space positions before
// suppressing a collision; picking the actual models remains available.
export function placeMapLabels(labels,width,height) {
  const occupied=[{left:width-78,right:width-10,top:10,bottom:122}];
  return labels.map(label=>{
    if(label.hidden)return label;
    const w=Math.max(74,label.name.length*(label.kind==='region'?8.5:7)+(label.kind==='region'?44:24)),h=44;
    if(width<w+24)return {...label,hidden:true};
    const x=Math.max(w/2+12,Math.min(width-w/2-12,label.x*width/100));
    for(const offset of [0,-56,56]){
      const y=label.y*height/100+offset;
      const box={left:x-w/2,right:x+w/2,top:y-h/2,bottom:y+h/2};
      if(box.top<14||box.bottom>height-14)continue;
      if(occupied.some(other=>box.left<other.right+12&&box.right>other.left-12&&box.top<other.bottom+10&&box.bottom>other.top-10))continue;
      occupied.push(box);
      return {...label,x:x/width*100,y:y/height*100};
    }
    return {...label,hidden:true};
  });
}
