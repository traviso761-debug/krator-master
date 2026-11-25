// ================================================================= OPEN WORLD — probe (window._api), for verify.py
// [web] What verify.py --assert measures, from inside the page, after the first view has loaded:
//  - cell seeding: a flora tile built alone, built again after its neighbours, and built again with the neighbours in
//    the reverse order gives the same records, bit for bit (biomes/WORLD.md: test against the global functions);
//  - the land is continuous: no step over a few centimetres anywhere on a sample of lines across the region;
//  - nothing roots in the water unless its pass stands in the shallows, and nothing grows outside the polygon;
//  - no NaN in any record or in the drawn terrain;
//  - every named river (region.json rivers) has water in its channel at each station down to its mouth;
//  - every landform record (a relief region's) near the camera stands out of the land, inside the region and dry;
//  - every small stream (a relief region's) falls to its mouth and is carved in the land, and the wet ones near the camera
//    are drawn with their water in their beds.
// Each check has a NEGATIVE: a broken input it must reject (a tile seeded by Math.random, a tree put in the sea, a step
// put in the land, a tree put outside the polygon).
window._api=(function(){
const recKey=R=>JSON.stringify(R.map(r=>[r.k,r.sp,r.sap,r.v,+r.x.toFixed(3),+r.z.toFixed(3),+r.rot.toFixed(4),+r.Ht.toFixed(3)]));
function seeding(tx,tz,build){build=build||FLORA.buildTile;const a=recKey(build(tx,tz));
 for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]])build(tx+dx,tz+dz);const b=recKey(build(tx,tz));
 for(const [dx,dz] of [[0,1],[0,-1],[1,0],[-1,0]])build(tx+dx,tz+dz);const c=recKey(build(tx,tz));
 return{ok:a===b&&b===c&&a.length>2,detail:'tile '+tx+','+tz+': '+(a.length>2?JSON.parse(a).length+' records':'empty')+(a===b&&b===c?', identical in three orders':', DIFFERS by order')};}
function continuity(lines,Hf){Hf=Hf||WORLD.H;let worst=0,at=null,n=0;
 for(const L of lines){for(let t=0;t<=1;t+=1/4000){const x=L[0]+(L[2]-L[0])*t,z=L[1]+(L[3]-L[1])*t,h0=Hf(x,z),h1=Hf(x+.02,z+.02);n++;
  if(!isFinite(h0))return{ok:false,detail:'NaN at '+x+','+z};const d=Math.abs(h1-h0);if(d>worst){worst=d;at=[Math.round(x),Math.round(z)];}}}
 return{ok:worst<1.2,detail:n+' samples, largest change over 2.8 cm: '+worst.toFixed(3)+' m at '+JSON.stringify(at)};}
function rooted(recs){let bad=0,first=null,out=0;
 for(const r of recs){const P=FLORA.KITS[r.k].passes[r.pass],wl=WORLD.water(r.x,r.z);
  if(!P.inWater&&wl>r.y+.3+.3){bad++;first=first||r;}if(!WORLD.inside(r.x,r.z))out++;
  if(![r.x,r.y,r.z,r.rot,r.Ht].every(isFinite)){bad++;first=first||r;}}
 return{ok:bad===0&&out===0&&recs.length>0,detail:recs.length+' records; '+bad+' in water or NaN, '+out+' outside the polygon'+(first?' (first '+Math.round(first.x)+','+Math.round(first.z)+')':'')};}
// spacing: no two trees closer than the stronger one's keep-clear radius plus the other's pad, across tile edges too
function spaced(recs){const B=new Map(),C=24,key=(i,j)=>i*100003+j;let bad=0,first=null,n=0;
 for(const q of recs){const k=key(Math.floor(q.x/C),Math.floor(q.z/C));let L=B.get(k);if(!L){L=[];B.set(k,L);}L.push(q);}
 for(const q of recs){n++;for(let j=Math.floor((q.z-60)/C);j<=Math.floor((q.z+60)/C);j++)for(let i=Math.floor((q.x-60)/C);i<=Math.floor((q.x+60)/C);i++){const L=B.get(key(i,j));if(!L)continue;
  for(const o of L){if(o===q||!(o.Ht>q.Ht||(o.Ht===q.Ht&&o!==q&&o.x<q.x)))continue;if(Math.hypot(o.x-q.x,o.z-q.z)<o.r+q.pad-1e-6){bad++;first=first||[q.x,q.z];}}}}
 return{ok:bad===0&&n>0,detail:n+' trees; '+bad+' inside a stronger tree keep-clear'+(first?' (first at '+first.map(Math.round)+')':'')};}
// rivers: at every station along each named river (the middle of each step of its line), water stands in the channel
// somewhere across it within 500 m (the carve's warp moves the bed off the drawn line by up to ~250 m)
function rivers(waterF){waterF=waterF||WORLD.water;const R=WORLD_DATA.meta.rivers||[];let n=0,wet=0,first=null;
 /* a river the model records dry (depth_m 0: a dry valley, which the world carves but fills with no water) is not judged */
 /* a smoothed region carves each river along its curve (WORLD.riverCourse, exact), which can pass more than the 500 m
    searched from a long chord's middle: there each station moves onto the course, abreast of the chord's middle */
 const CO={};if(WORLD.riverCourse)for(const c of WORLD.riverCourse())if(c.exact)CO[c.name]=c.pts;
 for(const r of R){if(r.depth_m!=null&&!(r.depth_m>0))continue;for(let i=0;i<r.line.length-1;i++){const a=r.line[i],b=r.line[i+1];let x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=-(b[1]-a[1])/l,nz=(b[0]-a[0])/l;
  const C=CO[r.name];if(C&&C.length>1){let k=0,d=1e18;for(let j=0;j<C.length;j++){const q=(C[j][0]-x)*(C[j][0]-x)+(C[j][1]-z)*(C[j][1]-z);if(q<d){d=q;k=j;}}
   const p=C[Math.max(0,k-1)],n=C[Math.min(C.length-1,k+1)],tl=Math.hypot(n[0]-p[0],n[1]-p[1])||1;x=C[k][0];z=C[k][1];nx=-(n[1]-p[1])/tl;nz=(n[0]-p[0])/tl;}
  /* a station outside the region's polygon (a river through the cut's margin) is not judged: the world draws no water there */
  if(!WORLD.inside(x,z))continue;
  n++;let ok=false;for(let s=-500;s<=500&&!ok;s+=8){const px=x+nx*s,pz=z+nz*s;if(waterF(px,pz)>WORLD.H(px,pz)+.5)ok=true;}
  if(ok)wet++;else first=first||[Math.round(x),Math.round(z)];}}
 return{ok:R.length>0&&wet===n,detail:R.length+' rivers, '+n+' stations, '+wet+' with water in the channel'+(first?' (first dry at '+first+')':'')};}
// the small streams (a relief region's, region.json `streams`; core/world/PLAN-RELIEF.md P3): every bed falls from head
// to mouth (44-world-streams.js WSTREAMS.check), and at a station every 300 m down a sample of the streams the ground is
// carved (WORLD.streamAt: a cut of 0.3 m or more where the line runs). rev: read each line backwards; off: move each
// station that far sideways (the negatives)
function streams(rev,off){const L=WORLD.streams?WORLD.streams():[];if(!L.length)return{ok:true,detail:'no streams in this region'};
 const pick=L.filter((_,i)=>i%Math.max(1,Math.floor(L.length/300))===0),beds=pick.map(S=>rev?S.pts.slice().reverse():S.pts);
 const prob=WSTREAMS.check(beds);let n=0,cut=0,first=null;
 for(const S of pick){const P=S.pts;let acc=300;for(let i=1;i<P.length;i++){acc+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);if(acc<300)continue;acc=0;
  const a=P[i-1],b=P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,x=b[0]-(b[1]-a[1])/l*(off||0),z=b[1]+(b[0]-a[0])/l*(off||0);
  if(!WORLD.inside(x,z))continue;n++;const c=WORLD.streamAt(x,z);if(c&&c.k>=.3)cut++;else first=first||[Math.round(x),Math.round(z)];}}
 return{ok:prob.length===0&&n>0&&cut>=.97*n,detail:L.length+' streams ('+L.filter(S=>S.wet).length+' wet), '+pick.length+' sampled: '+(prob.length?prob.length+' beds rising (first: '+prob[0]+')':'every bed falls')+
  '; '+cut+' of '+n+' stations carved'+(first?' (first not at '+first+')':'')};}
// the masks (relief P14): the relief leaves the model's water alone: at every wet point on a 2 km lattice within 40 km of
// the camera (the model's wet cells, WORLD.wetCell over 0.9: the mask's own water; WORLD.lakeWater answers a cell past them), the
// relief's mask is 0. neg: the dry
// points read the same way (the mask is 1 there, so it must fail)
function masks(neg){if(!WORLD.reliefMask||!WORLD_DATA.meta.relief)return{ok:true,detail:'no relief in this region'};const P=HOST.camera.position;let n=0,bad=0,first=null;
 const wet=(x,z)=>WORLD.wetCell(x,z)>.9;
 for(let z=P.z-40000;z<=P.z+40000;z+=2000)for(let x=P.x-40000;x<=P.x+40000;x+=2000){if(!WORLD.inside(x,z))continue;
  const inner=wet(x,z);if(neg?inner||WORLD.wetCell(x,z)>0:!inner)continue;
  n++;if(!(WORLD.reliefMask(x,z)<=1e-6)){bad++;first=first||[x,z];}}
 return{ok:bad===0&&n>0,detail:n+(neg?' dry':' wet')+' points; '+bad+' where the relief still works'+(first?' (first '+first.map(Math.round)+')':'')};}
// the landform records (a relief region's: 43b-world-landforms.js, PLAN-RELIEF.md P4, P7) within 20 km of the camera: each
// (a fissure: is cut into it, its middle half its depth under the ground beside it) stands out of the land (the ground at or by its middle at least half its height over its foot), inside the region and out
// of the water. Hf: the ground as the check reads it (the negative: the land at a detail no record shows at)
function landforms(Hf){Hf=Hf||((x,z)=>WORLD.H(x,z,0));if(!WORLD.landforms)return{ok:true,detail:'no landform records in this region'};
 const P=HOST.camera.position,L=WORLD.landforms(P.x-20000,P.z-20000,P.x+20000,P.z+20000);if(!L.length)return{ok:true,detail:'no landform records within 20 km'};
 let low=0,wet=0,out=0,first=null;const k={};
 for(const B of L){k[B.kind]=(k[B.kind]||0)+1;
  if(B.carve){/* a fissure (relief P7): its middle at least half its depth under the ground either side of it */
   const ux=B.b[0]-B.a[0],uz=B.b[1]-B.a[1],ul=Math.hypot(ux,uz),nx=-uz/ul,nz=ux/ul,wb=Math.min(B.kind==='gja'?40:12,B.w*1.5),o=B.w/2+B.d/20+wb+4;
   let g0=1e9;for(let q=-wb-B.w/2;q<=wb+B.w/2;q+=Math.max(.5,B.w/8))g0=Math.min(g0,Hf(B.x+nx*q,B.z+nz*q));   /* its line wanders: the lowest across */
   const g1=Math.min(Hf(B.x+nx*o,B.z+nz*o),Hf(B.x-nx*o,B.z-nz*o));
   if(!(g0<g1-.5*B.d)){low++;first=first||B;}continue;}
  const q=B.R*.25,g=Math.max(Hf(B.x,B.z),Hf(B.x+q,B.z),Hf(B.x-q,B.z),Hf(B.x,B.z+q),Hf(B.x,B.z-q)),H=(B.top==null?B.R:B.top-B.y0);   /* a kopje's middle may lie between its columns */
  if(!(g>=B.y0+.5*H)){low++;first=first||B;}if(!B.pinned&&!WORLD.inside(B.x,B.z)){out++;first=first||B;}if(!B.pinned&&WORLD.lakeWater(B.x,B.z)>g-1){wet++;first=first||B;}}
 return{ok:low===0&&wet===0&&out===0,detail:L.length+' records '+JSON.stringify(k)+'; '+low+' not standing out of the land, '+wet+' in the water, '+out+' outside the region'+
  (first?' (first: '+first.id+' at '+Math.round(first.x)+','+Math.round(first.z)+')':'')};}
// highways: the ground under each road's centre line is the road's finished height (within 0.3 m) and no step of the
// line is steeper than the ruling grade (+ 0.5 % for the rounding); eF: the road's height as the check reads it
// A station within 12 m of another road, or of another stretch of its own (a hairpin), or at a road's end (where it meets a
// camp's levelled pad: 2026-11-16, a gate's first 1.9 m fell 0.8 m off the pad) is a junction (two grounds share the land
// there): counted, not judged
function highways(eF){const R=(WORLD_DATA.roads&&WORLD_DATA.roads.roads)||[],G=(WORLD_DATA.roads&&WORLD_DATA.roads.grade)||.08;eF=eF||(p=>p[2]);
 const C=256,B=new Map();
 R.forEach((r,ri)=>{for(let i=0;i<r.pts.length-1;i++){const a=r.pts[i],b=r.pts[i+1];
  for(let j=Math.floor((Math.min(a[1],b[1])-12)/C);j<=Math.floor((Math.max(a[1],b[1])+12)/C);j++)for(let k=Math.floor((Math.min(a[0],b[0])-12)/C);k<=Math.floor((Math.max(a[0],b[0])+12)/C);k++){
   const key=k*100003+j;let L=B.get(key);if(!L){L=[];B.set(key,L);}L.push([ri,a,b,i]);}}});
 /* another road's carriageway within 12 m, or another stretch of its own (a hairpin: more than 40 points along it), where
    two carriageways share the ground and the land takes their mean */
 const nearOther=(ri,x,z,pi)=>{const L=B.get(Math.floor(x/C)*100003+Math.floor(z/C));if(!L)return false;
  for(const [rj,a,b,si] of L){if(rj===ri&&(pi==null||Math.abs(si-pi)<=40))continue;const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;let t=((x-a[0])*dx+(z-a[1])*dz)/l2;t=t<0?0:t>1?1:t;
   if(Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z)<12)return true;}return false;};
 let n=0,off=0,steep=0,worst=0,at=null,mg=0,junc=0,deck=0;
 /* a station on a bridge's deck (a road's `spans`, 42b-world-bridges.js) stands over the water, not on the ground: its
    grade is judged, its height over the ground is the bridge's own check (88b) */
 const onDeck=(r,i)=>(r.spans||[]).some(S=>i>=S[0]&&i<=S[1]);
 for(let ri=0;ri<R.length;ri++){const r=R[ri];for(let i=0;i<r.pts.length;i+=5){const p=r.pts[i];
  if(nearOther(ri,p[0],p[1],i)||i<2||i>r.pts.length-3){junc++;continue;}   /* a road's ends meet a pad (a camp's gate, the rock's ring): its ground is shared there */
  if(onDeck(r,i)){deck++;if(i+1<r.pts.length){const q=r.pts[i+1],g=Math.abs(eF(q)-eF(p))/Math.hypot(q[0]-p[0],q[1]-p[1]);if(g>mg)mg=g;if(g>G+.005)steep++;}continue;}
  const h=WORLD.H(p[0],p[1]),d=Math.abs(h-eF(p));n++;if(d>worst){worst=d;at=[Math.round(p[0]),Math.round(p[1])];}if(d>.3)off++;
  if(i+1<r.pts.length){const q=r.pts[i+1],g=Math.abs(eF(q)-eF(p))/Math.hypot(q[0]-p[0],q[1]-p[1]);if(g>mg)mg=g;if(g>G+.005)steep++;}}}
 return{ok:R.length>0&&off===0&&steep===0,detail:R.length+' roads, '+n+' stations (+'+junc+' at junctions'+(deck?', '+deck+' on bridges':'')+'); '+off+' off the ground by over 0.3 m (worst '+worst.toFixed(2)+' m at '+JSON.stringify(at)+'), '+steep+' steeper than '+(G*100)+' % (steepest '+(mg*100).toFixed(1)+' %)'};}
// nothing grows on a carriageway or on a town's ground
function clearOf(recs){let road=0,town=0,first=null;
 for(const r of recs){if(WORLD.roadD(r.x,r.z)<.5){road++;first=first||r;}if(WORLD.townW(r.x,r.z)>0){town++;first=first||r;}}
 return{ok:road===0&&town===0&&recs.length>0,detail:recs.length+' records; '+road+' on a road, '+town+' in a town'+(first?' (first '+Math.round(first.x)+','+Math.round(first.z)+')':'')};}
// ground styles: every overlay of the region has its own style and palette (41 BIOME_GROUND), none fallen to the desert's
function styled(names){const miss=names.filter(n=>!WORLD.groundOf(n));
 return{ok:names.length>0&&miss.length===0,detail:names.length+' overlays'+(miss.length?'; NO GROUND STYLE for '+miss.join(', '):', each with its style and palette')};}
const overlayNames=()=>(WORLD_DATA.meta.biomes||[]).map(b=>b.name);
const allRecs=()=>{const o=[];for(const t of FLORA.tiles.values())for(const r of t.recs)o.push(r);return o;};
// lines across the region: through each built settlement, and the box's two diagonals' middle 200 km
function lines(){const L=[];for(const p of PLACES.list.filter(p=>p.build||p.cand))L.push([p.x-3000,p.z-1700,p.x+3000,p.z+1700]);L.push([-100000,-100000,100000,100000],[-90000,80000,90000,-80000]);return L;}
function tileOf(x,z){return[Math.floor(x/FLORA.TS),Math.floor(z/FLORA.TS)];}
function hostChecks(){const out=[],P=HOST.camera.position,[tx,tz]=tileOf(P.x,P.z);
 // the busiest tile near the camera
 let best=[tx,tz],bn=-1;for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){const n=FLORA.buildTile(tx+dx,tz+dz).length;if(n>bn){bn=n;best=[tx+dx,tz+dz];}}
 out.push(Object.assign({name:'flora placement is seeded by cell (order-free)'},seeding(best[0],best[1])));
 out.push(Object.assign({name:'the land is continuous'},continuity(lines())));
 out.push(Object.assign({name:'nothing roots in the water or outside the region'},rooted(allRecs())));
 // the tiles round the camera, built fresh in a row (so their edges meet): the spacing holds across them
 {const T=[];for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)T.push(...FLORA.buildTile(best[0]+dx,best[1]+dz));
  out.push(Object.assign({name:'trees keep their spacing, across tile edges'},spaced(T)));}
 let nan=0;for(const m of TERRAIN.meshes()){const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){nan++;break;}}
 out.push(Object.assign({name:'the named rivers carry water to their mouths'},rivers()));
 out.push(Object.assign({name:'the small streams fall to their mouths, carved in the land'},streams()));
 out.push(Object.assign({name:'the landform records stand out of the land, inside the region and dry'},landforms()));
 {const r=masks(false);if(!/^0 wet|no relief/.test(r.detail))out.push(Object.assign({name:'the relief leaves the water alone (and works on dry land: its negative)'},Object.assign(r,{ok:r.ok&&!masks(true).ok})));}
 if(typeof STREAMW!=='undefined'&&STREAMW)out.push(Object.assign({name:'the wet streams near the camera carry their water in their beds'},STREAMW.check()));
 out.push(Object.assign({name:'the highways lie on the land and keep their grade'},highways()));
 out.push(Object.assign({name:'nothing grows on a highway or in a town'},clearOf(allRecs())));
 out.push({name:'no NaN in the drawn terrain',ok:nan===0&&TERRAIN.meshes().length>0,detail:TERRAIN.meshes().length+' chunks drawn, '+nan+' with NaN'});
 if(WORLD.coast&&WORLD.coast.list.length)out.push(WORLD.coast.check(300));   /* core/coast (44c): ground, water and mask agree on the shore */
 /* its negative runs here too (the regions' verify.py read hostChecks only): a name with no entry must be refused */
 {const r=styled(overlayNames()),n=styled(['no such biome']);
  out.push({name:'every biome overlay has its own ground style',ok:r.ok&&!n.ok,detail:r.detail+(n.ok?'; NEGATIVE MISSED: a name with no entry passed':'; negative (a name with no entry) refused')});}
 return out;}
function hostNegatives(){const out=[],P=HOST.camera.position,[tx,tz]=tileOf(P.x,P.z);
 const rnd=(a,b)=>FLORA.buildTile(a,b).map(r=>Object.assign({},r,{x:r.x+Math.random()*1e-3}));
 out.push(Object.assign({name:'negative: a tile seeded by Math.random'},seeding(tx,tz,rnd)));
 // a point in the sea: the first along a line west from the Ring Sea's ruin (Lunapolis) where the water stands over the ground
 const wet=[{k:0,sp:0,sap:false,v:0,x:0,y:-3000,z:0,rot:0,Ht:5,pass:0}];let sx=null,sz=-20000;
 for(let x=-260000;x>-560000&&sx===null;x-=4000){const w=WORLD.water(x,sz);if(w>WORLD.H(x,sz)+5)sx=x;}
 /* another region: the first wet point inside it on a lattice over its box (a lake, a river's reach), so the control runs
    wherever the region holds water (2026-11-24, Stage 8 B7, S3-26: the regions' verify now needs every negative to fail) */
 if(sx===null){const B=WORLD.box(),st=Math.max(2000,(B[2]-B[0])/80,(B[3]-B[1])/80);
  for(let z=B[1]+st/2;z<B[3]&&sx===null;z+=st)for(let x=B[0]+st/2;x<B[2]&&sx===null;x+=st)if(WORLD.inside(x,z)&&WORLD.water(x,z)>WORLD.H(x,z)+5){sx=x;sz=z;}}
 out.push(Object.assign({name:'negative: a tree put under the water'+(sx===null?' (no sea found: the control cannot run)':'')},rooted(allRecs().slice(0,50).concat(sx===null?[]:[Object.assign({},wet[0],{x:sx,z:sz,y:WORLD.H(sx,sz)})]))));
 out.push(Object.assign({name:'negative: a tree put outside the polygon'},rooted(allRecs().slice(0,50).concat([Object.assign({},wet[0],{x:WORLD.box()[0]+500,z:WORLD.box()[1]+500,y:9000})]))));
 {const T=FLORA.buildTile(tx,tz).slice(0,40);if(T.length){const a=T[0];T.push(Object.assign({},a,{x:a.x+.5,Ht:a.Ht-1}));}
  out.push(Object.assign({name:'negative: a tree put at the foot of another'},spaced(T)));}
 out.push(Object.assign({name:'negative: a river with its water taken away'},rivers((x,z)=>-1e9)));
 if(WORLD.landforms&&WORLD.landforms(P.x-20000,P.z-20000,P.x+20000,P.z+20000).length)out.push(Object.assign({name:'negative: the land read at a detail no record shows at'},landforms((x,z)=>WORLD.H(x,z,5000))));
 if(WORLD.streams&&WORLD.streams().length){out.push(Object.assign({name:'negative: the streams read backwards'},streams(true,0)));
  out.push(Object.assign({name:'negative: each stream station moved 150 m aside'},streams(false,150)));}
 if(typeof STREAMW!=='undefined'&&STREAMW&&STREAMW.stats().pieces)out.push(Object.assign({name:'negative: the stream water read 2 m lower'},STREAMW.check(true)));
 out.push(Object.assign({name:'negative: a highway read 2 m high, rising 1 m a step'},highways(p=>p[2]+2+(Math.round(p[0])%2?1:0))));
 {const r=((WORLD_DATA.roads&&WORLD_DATA.roads.roads)||[])[0],T=WORLD.towns&&WORLD.towns[0],F=allRecs().slice(0,20),o=F[0]||{k:0,sp:0,x:0,y:0,z:0,Ht:5};
  if(r)F.push(Object.assign({},o,{x:r.pts[0][0],z:r.pts[0][1]}));if(T)F.push(Object.assign({},o,{x:T.x,z:T.z}));
  out.push(Object.assign({name:'negative: a tree put on a highway and one in a town'},clearOf(F)));}
 const L0=lines()[0],xs=(L0[0]+L0[2])/2;   // the step crosses the first test line at its middle
 out.push(Object.assign({name:'negative: a 3 m step put in the land'},continuity(lines(),(x,z)=>WORLD.H(x,z)+(x>xs?3:0))));
 if(WORLD.coast&&WORLD.coast.list.length){const r=WORLD.coast.check(300,'mask');out.push(Object.assign(r,{name:'negative: the coast against the bodies\' old masks'}));}
 out.push(Object.assign({name:'negative: an overlay with no ground style'},styled(overlayNames().concat(['no such biome']))));
 return out;}
return{ready:()=>START.ready,hostChecks,hostNegatives,
 stats:()=>({terrain:TERRAIN.stats,flora:FLORA.stats,floor:FLOOR.stats,nursery:Object.assign({},NURSERY.stats,{queued:NURSERY.queued()}),seas:SEAS.stats(),rivers:RIVERS.stats(),
  render:{calls:HOST.renderer.info.render.calls,triangles:HOST.renderer.info.render.triangles},channels:WORLD.channelCount}),
 views:()=>CAM.GO.map((g,i)=>i+': '+g.label),
 // the towns near the camera, loaded (a promise: verify.py awaits it before a screenshot)
 towns:()=>TOWNS_DRAW.ready().then(()=>Object.assign({},TOWNS_DRAW.stats)),
 go:i=>{CAM.GO[i].fn();},
 view:(x,z,agl,yaw,pitch)=>CAM.setView(x,z,agl,yaw,pitch),
 // draw one frame now (a screenshot after settle): the sky, the labels, the map, then the scene
 render:()=>{document.getElementById('load').style.display='none';{const P=HOST.camera.position;HOST.scene.fog.density=1/(90000+Math.max(0,P.y-WORLD.H(P.x,P.z,400))*12);}SKY.follow();PLACES.update();CAM.drawMap();for(const f of HOST.TICKS)f(.016,1);
  HOST.renderer.render(HOST.scene,HOST.camera);return{calls:HOST.renderer.info.render.calls,triangles:HOST.renderer.info.render.triangles};},
 // stream until the view is complete (headless screenshots): every queue drained or ms spent
 settle:(ms)=>{const t0=performance.now();ms=ms||60000;let k=0;
  while(performance.now()-t0<ms){START.pump(true);FLORA.draw();k++;if(TERRAIN.pending()===0&&NURSERY.queued()===0&&FLOOR.stats.waiting===0&&FLORA.stats.queue===0&&SEAS.pending()===0&&(typeof STREAMW==='undefined'||!STREAMW||STREAMW.pending()===0)&&k>3)break;}
  FLORA.draw();return{rounds:k,ms:Math.round(performance.now()-t0),terrainPending:TERRAIN.pending(),nurseryQueued:NURSERY.queued(),floorWaiting:FLOOR.stats.waiting,floraQueue:FLORA.stats.queue,seas:SEAS.stats()};}};})();
