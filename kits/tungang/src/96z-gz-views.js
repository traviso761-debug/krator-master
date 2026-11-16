// ================================================================= THE SHEET'S GLAZIER VIEWS (before 99-host-take.js hands VIEWS to core/host)
// The sample scarp hold of 91z-gz-sheet.js: its place is computed from the rows' layout, so the views are added here, after
// 92-world.js has built the world (window._gzSheet.scarp); the rows have the engine's own views (one a row, one a site).
function gzSheetViews(){const S=window._gzSheet&&window._gzSheet.scarp;if(!S)return;const x=S.x,z=S.z;
 Object.assign(VIEWS,{
  'Glazier scarp (the hold over the tarn)':[x+18,22,z+70,x,9,z-6],
  'Glazier scarp: the lower fronts':[x-6,5,z+22,x-6,3.5,z],
  'Glazier scarp: the ledge, the wheel walk and the tea hall':[x+6,12,z+12,x+8,9,z-8],
  'Glazier scarp: the rich house and the adits':[x-22,13,z+14,x-24,10,z-8],
  'Glazier scarp: from above (cut-away)':[x,60,z+30,x,0,z-10]});}
/* the Glazier rows' own views: the engine's stand a fixed distance in front of a row as if its defs were centred on it, which for
   a carved front puts the camera inside the rock of the row before; these stand in the gap between */
function gzRowViews(){const back=R=>Math.max(...R.keys.map(k=>TG.gz.BOX[k]?TG.gz.BOX[k].d-TG.gz.BOX[k].out+2:(DEFS[k]?DEFS[k].d/2:0)));
 ROWS.forEach((R,i)=>{if(!R.keys.some(k=>TG.gz.BOX[k]))return;const out=Math.max(...R.keys.map(k=>TG.gz.BOX[k].out)),P=ROWS[i-1],gap=P?(P.z-back(P))-(R.z+out):60,dz=Math.max(6,Math.min(34,gap-3));
  VIEWS[R.family]=[R.w*.08,Math.min(R.h*.55+3,dz*.6+2),R.z+out+dz,0,Math.min(R.h*.4,8),R.z];});
 for(const S of SITES){const B=TG.gz.BOX[S.key];if(!B)continue;const D=DEFS[S.key],nm=D.name+(S.o.v?' (variant '+S.o.v+')':'');
  VIEWS[nm+' - eye level']=[S.x+B.w*.18,1.7,S.z+B.out+5,S.x,Math.min(B.h,10)*.32,S.z];
  if(D.cut)VIEWS[nm+' - inside (cut-away)']=[S.x+B.w*.1,Math.max(6,B.h*.8),S.z+B.out+4,S.x,.6,S.z-(B.d-B.out)*.4];}}
try{gzSheetViews();gzRowViews();}catch(err){reportErr('the Glazier views: '+(err.stack||err));}
