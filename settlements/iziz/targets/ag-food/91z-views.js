// TARGET: ag-food - the views: the row from above, then each building at eye level from its front
const VIEWS={'Overview':[0,70,140,0,0,10]};
for(const S of SITES){const D=VERN.defs[S.key];const r=Math.max(D.w,D.d)+6;VIEWS[D.name+' - eye level']=[S.x+r*.35,1.7,S.z+r,S.x,Math.min(D.h*.35,4),S.z];
 VIEWS[D.name+' - from above']=[S.x+r*.6,r*.9,S.z+r*.8,S.x,0,S.z];}
