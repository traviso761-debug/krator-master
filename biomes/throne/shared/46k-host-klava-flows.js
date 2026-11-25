// ================================================================= HOST — the young flows frozen by core/terrain's lava-flow module (KLAVA.bake; 2026-11-24, PLAN.md "the row's terrain")
// THRONE.flowHistory (src/46) lays each flow as the kit's own sheet: flat-topped, steep-edged, along a wandering fall line. A flow given `klava`
// keeps the kit's path (F.path: a host's tube, streams and views read it) but not its sheet: its rock is a Bingham lava's, run over the ground the
// older flows left (core/terrain/LAVA.md, MAGFLOW's rule): lobes that spread where the slope eases and stop at the yield thickness, ponding in
// the hollows and parting round the old hills. What it froze is laid into the same mosaic (thick, age, id), so everything that reads
// THRONE.ageAt, flowAt and thickAt reads it.
//   THRONE_KLAVA_FLOWS(o) as THRONE.flowHistory(o), and
//     F.klava {vents: [{x, z, r, Q, duration, T}], cell (10), pad (400) | box, seed, rough, rheo}: baked here, at load (a small flow: the vents')
//     F.klava {baked: true} with o.baked: a build-time bake's result (a station's bake-flows.js: {x0, z0, cell, nx, nz, dh: base64 Uint16 cm,
//       top: base64 Uint8, the 1-based index in o.flows of the last flow that froze over a cell}) laid in as it is (the kipuka's five)
//   ?klava=0 every flow on the kit's sheet, as before. FL.klava: [{key, ms, volume, frozen, lost, cells}] for the page's check
function THRONE_KLAVA_FLOWS(o){const Q=new URLSearchParams(location.search),K=(o.flows||[]).filter(F=>F.klava);
 const baked=o.baked&&K.some(F=>F.klava.baked);
 if(!K.length||Q.get('klava')==='0'||(!baked&&(typeof KLAVA==='undefined'||!KLAVA.bake))){const FL=THRONE.flowHistory(o);FL.klava=[];return FL;}
 /* the kit's run first: the KLAVA flows keep their paths, their sheets are none (thickness 0) */
 const FL=THRONE.flowHistory(Object.assign({},o,{flows:o.flows.map(F=>F.klava?Object.assign({},F,{th:[0,0]}):F)}));
 const {thick,age,id,N,cs,x0,z0}=FL,out=[],fiOf=k=>FL.flows.findIndex(F=>F.key===o.flows[k].key);
 /* lay a deposit (dhAt: metres at a point; topAt: the flow index in FL.flows that froze on top there, or -1) into the mosaic over a box */
 function lay(box,dhAt,topAt,cellsOf){const i0=Math.max(0,Math.floor((box[0]-x0)/cs)),i1=Math.min(N-1,Math.ceil((box[2]-x0)/cs)),j0=Math.max(0,Math.floor((box[1]-z0)/cs)),j1=Math.min(N-1,Math.ceil((box[3]-z0)/cs));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*N+i,x=x0+i*cs,z=z0+j*cs,v=dhAt(x,z);if(!(v>.35))continue;   /* a film under .35 m is not laid: the mosaic would count its ground still old (a kipuka, a stream's bank) */
   thick[k]+=v;{const f=topAt(x,z);if(f>=0){age[k]=FL.flows[f].age;id[k]=f;cellsOf[f]=(cellsOf[f]||0)+1;}}}}
 const bil=(A,B,x,z)=>{const u=(x-B.x0)/B.cell,v=(z-B.z0)/B.cell;if(u<0||v<0||u>B.nx-1||v>B.nz-1)return 0;const i=Math.min(B.nx-2,Math.floor(u)),j=Math.min(B.nz-2,Math.floor(v)),fu=u-i,fv=v-j,k=j*B.nx+i;
  return A[k]*(1-fu)*(1-fv)+A[k+1]*fu*(1-fv)+A[k+B.nx]*(1-fu)*fv+A[k+B.nx+1]*fu*fv;};
 if(baked){const B=o.baked,b64=s=>{const t=atob(s),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);return u;};
  const u8=b64(B.dh),dh=new Float32Array(u8.length/2),top=b64(B.top);for(let k=0;k<dh.length;k++)dh[k]=(u8[2*k]|u8[2*k+1]<<8)/100;
  const topAt=(x,z)=>{const i=Math.round((x-B.x0)/B.cell),j=Math.round((z-B.z0)/B.cell);if(i<0||j<0||i>=B.nx||j>=B.nz)return -1;const t=top[j*B.nx+i];return t?fiOf(t-1):-1;};
  const cells={},box=[B.x0,B.z0,B.x0+(B.nx-1)*B.cell,B.z0+(B.nz-1)*B.cell];lay(box,(x,z)=>bil(dh,B,x,z),topAt,cells);
  (B.flows||[]).forEach((r,n)=>{const f=fiOf(n);if(f>=0)FL.flows[f].cells=cells[f]||0;out.push(Object.assign({},r,{cells:cells[f]||0}));});}
 /* the flows baked here, oldest first, each over the ground as it stands */
 const byAge=FL.flows.filter(F=>F.klava&&!F.klava.baked).sort((a,b)=>b.age-a.age);
 for(const F of byAge){const L=F.klava,c=L.cell==null?10:L.cell,pad=L.pad==null?400:L.pad;
  let bx0=1e9,bz0=1e9,bx1=-1e9,bz1=-1e9;for(const V of L.vents){bx0=Math.min(bx0,V.x);bz0=Math.min(bz0,V.z);bx1=Math.max(bx1,V.x);bz1=Math.max(bz1,V.z);}
  const R=o.R==null?2700:o.R,b0=L.box||[bx0-pad,bz0-pad,bx1+pad,bz1+pad],box=[Math.max(-R+20,b0[0]),Math.max(-R+20,b0[1]),Math.min(R-20,b0[2]),Math.min(R-20,b0[3])];
  const B=KLAVA.bake({h:(x,z)=>o.baseH(x,z)+FL.thickAt(x,z),box,cell:c,seed:L.seed==null?KRAND.hash(571,F.fi,0x1A7A):L.seed,rough:L.rough==null?.4:L.rough,rheo:L.rheo,
   dtMin:120,dtMax:120,edge:'drain',eruptions:L.vents.map(V=>({x:V.x,z:V.z,r:V.r==null?c*2:V.r,Q:V.Q,duration:V.duration,T:V.T}))});
  const cells={},fi=FL.flows.indexOf(F);lay(box,(x,z)=>bil(B.dh,B,x,z),()=>fi,cells);F.cells=cells[fi]||0;
  let vol=0,fr=0,lost=0;B.eruptions.forEach(e=>{vol+=e.volume;fr+=e.frozen;lost+=e.lost;});
  out.push({key:F.key,ms:B.ms,volume:Math.round(vol),frozen:Math.round(fr),lost:Math.round(lost),cells:F.cells,box});}
 FL.klava=out;return FL;}
