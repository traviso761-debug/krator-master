// ================================================================= HOST — the young flows frozen by core/terrain's lava-flow module (KLAVA.bake; 2026-11-24, PLAN.md "the row's terrain")
// THRONE.flowHistory (src/46) lays each flow as the kit's own sheet: flat-topped, steep-edged, along a wandering fall line. A flow given `klava`
// is left out of that and run instead as eruptions of a Bingham lava over the ground the older flows left (core/terrain/LAVA.md, MAGFLOW's
// rule): lobes that spread where the slope eases and stop at the yield thickness, ponding in the hollows. What it froze is laid into the same
// mosaic (thick, age, id), so everything that reads THRONE.ageAt, flowAt and thickAt reads it. F.path is the vent alone (a host that reads a
// flow's path gives that flow no klava).
//   THRONE_KLAVA_FLOWS(o) as THRONE.flowHistory(o), each F.klava {vents: [{x, z, r, Q, duration, T}], cell (10), pad (400) | box, seed, rough, rheo}
//   ?klava=0 every flow on the kit's sheet, as before. FL.klava: [{key, ms, volume, frozen, lost, cells}] for the page's check
function THRONE_KLAVA_FLOWS(o){const Q=new URLSearchParams(location.search),K=(o.flows||[]).filter(F=>F.klava);
 if(!K.length||typeof KLAVA==='undefined'||!KLAVA.bake||Q.get('klava')==='0'){const FL=THRONE.flowHistory(o);FL.klava=[];return FL;}
 /* the kit's run first, the KLAVA flows given no length (their sheet empty: a path of one point at the vent, which F.path keeps) */
 const FL=THRONE.flowHistory(Object.assign({},o,{flows:o.flows.map(F=>F.klava?Object.assign({},F,{len:0,w:[0,0],th:[0,0]}):F)}));
 const {thick,age,id,N,cs,x0,z0}=FL,base=o.baseH,out=[];
 /* the KLAVA flows oldest first, each over the ground as it stands */
 const byAge=FL.flows.filter(F=>F.klava).sort((a,b)=>b.age-a.age);
 for(const F of byAge){const L=F.klava,c=L.cell==null?10:L.cell,pad=L.pad==null?400:L.pad;
  let bx0=1e9,bz0=1e9,bx1=-1e9,bz1=-1e9;for(const V of L.vents){bx0=Math.min(bx0,V.x);bz0=Math.min(bz0,V.z);bx1=Math.max(bx1,V.x);bz1=Math.max(bz1,V.z);}
  const R=o.R==null?2700:o.R,b0=L.box||[bx0-pad,bz0-pad,bx1+pad,bz1+pad],box=[Math.max(-R+20,b0[0]),Math.max(-R+20,b0[1]),Math.min(R-20,b0[2]),Math.min(R-20,b0[3])];
  const B=KLAVA.bake({h:(x,z)=>base(x,z)+FL.thickAt(x,z),box,cell:c,seed:L.seed==null?KRAND.hash(571,F.fi,0x1A7A):L.seed,rough:L.rough==null?.4:L.rough,rheo:L.rheo,
   dtMin:120,dtMax:120,edge:'drain',eruptions:L.vents.map(V=>({x:V.x,z:V.z,r:V.r==null?c*2:V.r,Q:V.Q,duration:V.duration,T:V.T}))});
  /* lay it into the mosaic: the deposit bilinear at each of the mosaic's lattice points in the box */
  const dhAt=(x,z)=>{const u=(x-B.x0)/B.cell,v=(z-B.z0)/B.cell;if(u<0||v<0||u>B.nx-1||v>B.nz-1)return 0;const i=Math.min(B.nx-2,Math.floor(u)),j=Math.min(B.nz-2,Math.floor(v)),fu=u-i,fv=v-j,k=j*B.nx+i;
   return B.dh[k]*(1-fu)*(1-fv)+B.dh[k+1]*fu*(1-fv)+B.dh[k+B.nx]*(1-fu)*fv+B.dh[k+B.nx+1]*fu*fv;};
  let cells=0;const i0=Math.max(0,Math.floor((box[0]-x0)/cs)),i1=Math.min(N-1,Math.ceil((box[2]-x0)/cs)),j0=Math.max(0,Math.floor((box[1]-z0)/cs)),j1=Math.min(N-1,Math.ceil((box[3]-z0)/cs));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*N+i,v=dhAt(x0+i*cs,z0+j*cs);if(!(v>0))continue;thick[k]+=v;if(v>.35){age[k]=F.age;id[k]=F.fi;cells++;}}
  F.cells=cells;let vol=0,fr=0,lost=0;B.eruptions.forEach(e=>{vol+=e.volume;fr+=e.frozen;lost+=e.lost;});
  out.push({key:F.key,ms:B.ms,volume:Math.round(vol),frozen:Math.round(fr),lost:Math.round(lost),cells,box});}
 FL.klava=out;return FL;}
