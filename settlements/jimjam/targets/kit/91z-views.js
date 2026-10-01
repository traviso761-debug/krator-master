// TARGET: kit — camera presets, generated from the layout. Fronts face north (world -z), so every
// view looks south from the north side. A def may add its own views in its LOCAL frame:
//   JJ.def({... views:{'Solstice — through the arch':{cam:[x,y,z],tgt:[x,y,z],sky:{hour,day}}} })
// and they are converted to world coordinates through its site. A 7th element {hour,day} on a
// preset sets the sky for that view (setView passes it to jjApplyViewSky).
const VIEWS={};
(()=>{const jjSite=jjK=>SITES.find(jjS=>jjS.key===jjK);
 const jjToWorld=(jjS,jjP)=>{const jjC=Math.cos(jjS.ry),jjSn=Math.sin(jjS.ry);return[jjS.x+jjP[0]*jjC+jjP[2]*jjSn,jjP[1],jjS.z-jjP[0]*jjSn+jjP[2]*jjC];};
 const jjH=JJ_ROW_Z['Housing — poor']||(JJ_ROWS[0]?JJ_ROW_Z[JJ_ROWS[0].name]:{z:0,width:60});
 VIEWS['Opening']=[-jjH.width*.45,46,jjH.z-70,0,6,jjH.z+30];
 const jjLast=JJ_ROWS.length?JJ_ROW_Z[JJ_ROWS[JJ_ROWS.length-1].name]:{z:0};
 // the sheet is a long north-south strip: look across it from the west so it spans the frame
 VIEWS['Overview']=[-760,430,jjLast.z*.5,0,0,jjLast.z*.5];
 VIEWS['Furniture and flora — eye level']=[0,1.7,-62,0,1.8,-30];
 for(const jjRow of JJ_ROWS){const jjR=JJ_ROW_Z[jjRow.name];const jjDist=Math.max(60,jjR.width*.55);
  VIEWS[jjRow.name+' — aerial']=[-jjR.width*.12,jjDist*.8,jjR.z-jjR.depth/2-jjDist*.42,0,4,jjR.z];}
 for(const jjK of JJ.order){const jjD=JJ.defs[jjK],jjS=jjSite(jjK);if(!jjS)continue;const jjNm=jjD.name||jjK;const jjSz=Math.max(jjD.w||16,jjD.h||10,(jjD.d||16)*.8);
  // front 3/4 from the north-west, and an eye-level shot standing in front of the door
  VIEWS[jjNm+' — front']=jjToWorld(jjS,[-jjSz*.55,(jjD.h||10)*.55+jjSz*.45,(jjD.d||16)/2+Math.min(JJ_ROW_GAP*1.6,jjSz*1.05)]).concat(jjToWorld(jjS,[0,(jjD.h||10)*.38,0]));
  VIEWS[jjNm+' — eye level']=jjToWorld(jjS,[-(jjD.w||16)*.12,1.7,(jjD.d||16)/2+Math.min(JJ_ROW_GAP-6,Math.max(9,jjSz*.6))]).concat(jjToWorld(jjS,[0,Math.min(6,(jjD.h||10)*.35),0]));
  if(jjD.views)for(const jjV in jjD.views){const jjP=jjD.views[jjV];const jjArr=jjToWorld(jjS,jjP.cam).concat(jjToWorld(jjS,jjP.tgt));if(jjP.sky)jjArr.push(jjP.sky);VIEWS[jjV]=jjArr;}}
})();
