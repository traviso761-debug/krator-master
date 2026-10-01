// Presets, five per type, written off ROWS so they follow any re-spacing:
//   <name> — row     the four states west to east, by day
//   <name> — intact  close on the intact one, by day
//   <name> — ruined  close on the ruin, by day
//   <name> — worn    close on the worn one, by day
//   <name> — night   the repaired one at night, when its lights show
const VIEWS={};
VIEWS['Yuni variants']=[-900,820,1650,250,0,520];
for(const k in ROWS){const R=ROWS[k],nm=YV_NAME[k],h=R.h,rs=R.rs;
 const W=R.w+R.s+2*rs,cx=(R.w-R.s)/2;
 // the row shot stands south of the row but short of the next one; when the
 // gap is too small it climbs instead, keeping the same distance to the row
 let gap=1e9;for(const j in ROWS)if(ROWS[j].z>R.z)gap=Math.min(gap,ROWS[j].z-ROWS[j].r-R.z);
 const far=W*.72,dz=Math.min(far*.85,gap*.92),dy=Math.max(h*.6+W*.12,Math.sqrt(Math.max(0,far*far-dz*dz)));
 VIEWS[nm+' — row']=[cx,dy,R.z+dz,cx,h*.3,R.z];
 VIEWS[nm+' — intact']=[-R.s+rs*1.3,h*.55+rs*.45,R.z+rs*1.9,-R.s,h*.35,R.z];
 VIEWS[nm+' — ruined']=[R.s+rs*1.3,h*.55+rs*.45,R.z+rs*1.9,R.s,h*.3,R.z];
 VIEWS[nm+' — worn']=[R.w+rs*1.3,h*.55+rs*.45,R.z+rs*1.9,R.w,h*.35,R.z];
 VIEWS[nm+' — night']=[-rs*1.3,h*.55+rs*.45,R.z+rs*1.9,0,h*.3,R.z,1];}
