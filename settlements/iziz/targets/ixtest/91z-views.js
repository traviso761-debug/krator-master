// TARGET: ixtest — the views: an overview, each row from the front, and each Ancient site at street level
const RV=(ri,dist,h,ty)=>[0,h,ROWZ[ri]+dist,0,ty,ROWZ[ri]];
const VIEWS={'Overview':[-700,420,GROUND_C+520,0,10,GROUND_C]};
ROWNAMES.forEach((n,i)=>{VIEWS[n]=RV(i,i===1||i===2?190:150,i>=2&&i<=4?70:45,i>=2&&i<=4?25:6);});
for(const S of SITES){if(!/^ixt_|^anc_|^port_|^vern_/.test(S.key)||/_ix$/.test(S.key))continue;const D=VERN.defs[S.key];
 VIEWS[(D&&D.name||S.key)+' — street']=[S.x+12,2,S.z+(D?Math.max(D.w,D.d)*.55:30),S.x,4,S.z];}
