// One view per row: the camera stands south of the row and a little up, as far back as the next row allows
// (intact west, rehabilitated centre, destroyed east). The first view is the whole showcase from the south-west.
const VIEWS={};
{const zs=Object.values(ROWS).map(r=>r.z),z1=Math.max(...zs);
 VIEWS['Overview']=[-2600,2200,-900,0,0,z1*.45];
 for(const k in ROWS){const R=ROWS[k],N=Object.values(ROWS).filter(o=>o.z>R.z).sort((a,b)=>a.z-b.z)[0];
  // stop short of the next row south, or the camera stands inside its buildings
  const d=Math.min(R.s*1.9+R.r,N?N.z-N.r-R.z-25:1e9),h=Math.max(30,R.r*1.1);
  VIEWS[IZS_ROWNAME[k]]=[0,h,R.z+d,0,R.r*.45,R.z];}}
