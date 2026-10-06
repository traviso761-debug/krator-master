// ================================================================= YS CITY — the EDITS: hand placements and deletions, as data
// Travis's edits from the live editor (94-city-editor.js, "Copy JSON" writes this literal). `python3 build.py` honours
// them: 88-city-place.js calls ysApplyEdits() once its pass is done, so the edits are the last word on PLACE.blds and the
// draw pass (88b) builds them like any other record. A `del` entry removes every PLACE.blds record of that key within 1 m
// of (x,z) and frees its box from the occupancy; an `add` entry stands a def exactly where the editor put it (margin 0,
// nothing in the way refuses it; `y` is the ground the editor read, the placer's own ground when absent). No KRAND here:
// the pass before this is untouched, and the edits apply in list order, deletions first. [G data]: records in, records out.
const YS_EDITS={add:[/*{key,x,z,ry,y?}*/],del:[/*{key,x,z} rounded to .1*/]};
// free a box taken by ysPlTake: out of PLACE.occ and out of every hash cell it was filed under
function ysPlFree(B){if(!B)return;const i=PLACE.occ.indexOf(B);if(i>=0)PLACE.occ.splice(i,1);
 for(const k of ysPlKeys(B)){const L=PLACE.grid.get(k);if(!L)continue;const j=L.indexOf(B);if(j>=0)L.splice(j,1);}}
function ysApplyEdits(E){E=E||YS_EDITS;const out={del:0,add:0,missed:[],refused:[]};
 for(const d of (E.del||[])){let hit=0;for(let i=PLACE.blds.length-1;i>=0;i--){const r=PLACE.blds[i];if(r.key!==d.key||Math.hypot(r.x-d.x,r.z-d.z)>1)continue;
   PLACE.blds.splice(i,1);ysPlFree(r.box);hit++;}
  if(hit)out.del+=hit;else out.missed.push(d.key+' @ '+d.x+','+d.z);}
 for(const a of (E.add||[])){if(!HYK.defs[a.key]){out.refused.push('no def '+a.key);continue;}
  const before=Object.assign({},PLACE.refused);
  const r=ysPlByName(a.key,a.x,a.z,a.ry||0,'edit',null,{y:a.y!=null?a.y:undefined,margin:0,skip:/./});
  if(r){r.edit=true;out.add++;}else{const why=Object.keys(PLACE.refused).find(k=>PLACE.refused[k]!==before[k])||'refused';out.refused.push(a.key+' @ '+a.x+','+a.z+' ('+why+')');}}
 PLACE.edits=out;return out;}
