import {validSiteFocus} from './routes.js';

// Choose the visible entry nearest the upper third, without altering history.
export function readingFocus(anchors, height) {
  const target=Math.min(220,height*.3);
  const candidates=anchors.map(anchor=>({...anchor,id:anchor.id==='papers'?'library':anchor.id}))
    .filter(anchor=>validSiteFocus(anchor.id)&&anchor.bottom>80&&anchor.top<height*.5);
  candidates.sort((a,b)=>Math.abs(a.top-target)-Math.abs(b.top-target));
  return candidates[0]?.id??null;
}
