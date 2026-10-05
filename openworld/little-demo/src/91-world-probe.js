// ================================================================= OPEN WORLD — probe (window._api), for verify.py
// [web] What verify.py --assert measures, from inside the page, after the first view has loaded:
//  - cell seeding: a flora tile built alone, built again after its neighbours, and built again with the neighbours in
//    the reverse order gives the same records, bit for bit (biomes/WORLD.md: test against the global functions);
//  - the land is continuous: no step over a few centimetres anywhere on a sample of lines across the region;
//  - nothing roots in the water unless its pass stands in the shallows, and nothing grows outside the polygon;
//  - no NaN in any record or in the drawn terrain;
//  - every named river (region.json rivers) has water in its channel at each station down to its mouth.
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
 for(const r of R)for(let i=0;i<r.line.length-1;i++){const a=r.line[i],b=r.line[i+1],x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=-(b[1]-a[1])/l,nz=(b[0]-a[0])/l;
  n++;let ok=false;for(let s=-500;s<=500&&!ok;s+=8){const px=x+nx*s,pz=z+nz*s;if(waterF(px,pz)>WORLD.H(px,pz)+.5)ok=true;}
  if(ok)wet++;else first=first||[Math.round(x),Math.round(z)];}
 return{ok:R.length>0&&wet===n,detail:R.length+' rivers, '+n+' stations, '+wet+' with water in the channel'+(first?' (first dry at '+first+')':'')};}
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
 out.push({name:'no NaN in the drawn terrain',ok:nan===0&&TERRAIN.meshes().length>0,detail:TERRAIN.meshes().length+' chunks drawn, '+nan+' with NaN'});
 return out;}
function hostNegatives(){const out=[],P=HOST.camera.position,[tx,tz]=tileOf(P.x,P.z);
 const rnd=(a,b)=>FLORA.buildTile(a,b).map(r=>Object.assign({},r,{x:r.x+Math.random()*1e-3}));
 out.push(Object.assign({name:'negative: a tile seeded by Math.random'},seeding(tx,tz,rnd)));
 // a point in the sea: the first along a line west from the Ring Sea's ruin (Lunapolis) where the water stands over the ground
 const wet=[{k:0,sp:0,sap:false,v:0,x:0,y:-3000,z:0,rot:0,Ht:5,pass:0}];let sx=null,sz=-20000;
 for(let x=-260000;x>-560000&&sx===null;x-=4000){const w=WORLD.water(x,sz);if(w>WORLD.H(x,sz)+5)sx=x;}
 out.push(Object.assign({name:'negative: a tree put under the water'+(sx===null?' (no sea found: the control cannot run)':'')},rooted(allRecs().slice(0,50).concat(sx===null?[]:[Object.assign({},wet[0],{x:sx,z:sz,y:WORLD.H(sx,sz)})]))));
 out.push(Object.assign({name:'negative: a tree put outside the polygon'},rooted(allRecs().slice(0,50).concat([Object.assign({},wet[0],{x:WORLD.box()[0]+500,z:WORLD.box()[1]+500,y:9000})]))));
 {const T=FLORA.buildTile(tx,tz).slice(0,40);if(T.length){const a=T[0];T.push(Object.assign({},a,{x:a.x+.5,Ht:a.Ht-1}));}
  out.push(Object.assign({name:'negative: a tree put at the foot of another'},spaced(T)));}
 out.push(Object.assign({name:'negative: a river with its water taken away'},rivers((x,z)=>-1e9)));
 const L0=lines()[0],xs=(L0[0]+L0[2])/2;   // the step crosses the first test line at its middle
 out.push(Object.assign({name:'negative: a 3 m step put in the land'},continuity(lines(),(x,z)=>WORLD.H(x,z)+(x>xs?3:0))));
 return out;}
return{ready:()=>START.ready,hostChecks,hostNegatives,
 stats:()=>({terrain:TERRAIN.stats,flora:FLORA.stats,floor:FLOOR.stats,nursery:Object.assign({},NURSERY.stats,{queued:NURSERY.queued()}),
  render:{calls:HOST.renderer.info.render.calls,triangles:HOST.renderer.info.render.triangles},channels:WORLD.channelCount}),
 views:()=>CAM.GO.map((g,i)=>i+': '+g.label),
 go:i=>{CAM.GO[i].fn();},
 view:(x,z,agl,yaw,pitch)=>CAM.setView(x,z,agl,yaw,pitch),
 // draw one frame now (a screenshot after settle): the sky, the labels, the map, then the scene
 render:()=>{document.getElementById('load').style.display='none';{const P=HOST.camera.position;HOST.scene.fog.density=1/(90000+Math.max(0,P.y-WORLD.H(P.x,P.z,400))*12);}SKY.follow();WATER.frame();PLACES.update();CAM.drawMap();for(const f of HOST.TICKS)f(.016,1);
  HOST.renderer.render(HOST.scene,HOST.camera);return{calls:HOST.renderer.info.render.calls,triangles:HOST.renderer.info.render.triangles};},
 // stream until the view is complete (headless screenshots): every queue drained or ms spent
 settle:(ms)=>{const t0=performance.now();ms=ms||60000;let k=0;
  while(performance.now()-t0<ms){START.pump(true);FLORA.draw();k++;if(TERRAIN.pending()===0&&NURSERY.queued()===0&&FLOOR.stats.waiting===0&&FLORA.stats.queue===0&&k>3)break;}
  FLORA.draw();return{rounds:k,ms:Math.round(performance.now()-t0),terrainPending:TERRAIN.pending(),nurseryQueued:NURSERY.queued(),floorWaiting:FLOOR.stats.waiting,floraQueue:FLORA.stats.queue};}};})();
