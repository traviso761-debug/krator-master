// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 showcase:{tris:12800000,calls:120},   // measured at q=1 on this 6.8 km map (baseline.json), not a target (KNOWN_ISSUES)
 cls:{pass:7000000,host:900000},
 type:{'desert/trees':'pass','desert/floor':'pass','desert/fauna':'pass','desert/dress':'pass','host':'host'},
};
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),bb=new THREE.Box3();
 scene.traverse(o=>{if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);});
 return pts;}
function regOccupancy(){const n=new Array(REG.length).fill(0);const P=_probePoints();
 REG.forEach((r,i)=>{for(const p of P)if(regHas(r,p[0],p[1],p[2]))n[i]++;});
 return REG.map((r,i)=>({name:r.name,n:n[i]}));}
function nanSweep(){const bad=[];let badInst=0;
 scene.traverse(o=>{if(!o.isMesh&&!o.isInstancedMesh)return;if(o.userData&&o.userData.probeSkip)return;
  const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(p){const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.name||o.geometry.type,at:i});break;}}
  if(o.isInstancedMesh){const a=o.instanceMatrix.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){badInst++;break;}}});
 return {meshes:bad.length,first:bad.slice(0,8),instances:badInst,firstInstances:[]};}
function typeStats(){const out={};for(const k in BIO.stats){const t=BIO.stats[k],cls=BUDGET.type[k]||'pass';out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}return out;}
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
// the cataract leaves from rock, its curtain clear of the rock; the cave open under its cap; nothing grows
// under the cap; no preset camera inside rock; the candles' far spires neither float nor sink
const rockTop=(x,z)=>{const t=BIO.carve.topAt(x,z);return t===null?terrainH(x,z):t;};
const buried=(x,y,z,e)=>terrainH(x,z)>y+e||(BIO.carve.rockAt(x,y,z)&&BIO.carve.rockAt(x,y+e,z)&&BIO.carve.rockAt(x+e,y,z)&&BIO.carve.rockAt(x-e,y,z)&&BIO.carve.rockAt(x,y,z+e)&&BIO.carve.rockAt(x,y,z-e));
const worldV=m=>{const a=m.geometry.attributes.position,o=[];m.updateMatrixWorld(true);const v=new THREE.Vector3();for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);o.push([v.x,v.y,v.z]);}return o;};
// the instanced items only (what the biome roots): a mesh's bounding-box centre is not a plant
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z]);}});return o;};
// the surface as DRAWN: the ground's own triangles (terrainH holds only at their vertices, 17.8 m apart), or the
// pond's disc at PL where it covers them. Not the river's ribbon: it faces down, so from above it is culled and
// the river shows its bed (KNOWN_ISSUES); a foot under the ground is under the ribbon too
const drawnH=(function(){let P=null,X,Z,nx;const at=(A,v)=>{let lo=0,hi=A.length-2;while(lo<hi){const m=(lo+hi+1)>>1;if(A[m]<=v)lo=m;else hi=m-1;}return lo;};
 return (x,z)=>{if(!P){P=GROUND.geometry.attributes.position.array;nx=1;while(P[nx*3+2]===P[2])nx++;X=[];Z=[];
   for(let i=0;i<nx;i++)X.push(P[i*3]);for(let j=0;j<P.length/3/nx;j++)Z.push(P[j*nx*3+2]);}
  const i=at(X,x),j=at(Z,z),u=(x-X[i])/(X[i+1]-X[i]),v=(z-Z[j])/(Z[j+1]-Z[j]),h=(a,b)=>P[((j+b)*nx+i+a)*3+1];   // each cell split on its (i,j+1)-(i+1,j) diagonal (45, GROUND)
  const g=u+v<=1?h(0,0)+u*(h(1,0)-h(0,0))+v*(h(0,1)-h(0,0)):h(1,1)+(1-u)*(h(0,1)-h(1,1))+(1-v)*(h(1,0)-h(1,1));
  return Math.hypot(x-POND.x,z-POND.z)<163?Math.max(g,PL):g;};})();
// the twist-candles' far spires, laid out for every clump (SEDESERT.spiresOf: this spine keeps all of them heroes)
const candleSpires=()=>{const sp=SEDESERT.SPECIES.indexOf(SEDESERT.byKey.candle);return SEDESERT.TREES.filter(T=>T.sp===sp).flatMap(T=>SEDESERT.spiresOf(T));};
// species that yield something edible the kit does not draw as a catalog fruit (the cardon's fruit, the agave's heart,
// the Joshua tree's buds, the bottle tree's water): named, not hidden. And the item that draws each catalog fruit.
const FRUIT_NOT_DRAWN=['cardon','bottle','agave','yucca'];
const FRUIT_ITEM={generic_fruit_tuna:'fruit',generic_fruit_mesquite:'pods',generic_fruit_wadi_date:'dates'};
const itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome)n[M.name.replace(/^biome:/,'')]=(n[M.name.replace(/^biome:/,'')]||0)+M.count;});return n;};
const HCHK={
 // fruit: every species and floor plant carries a harvest tag; every edible species names a catalog piece (or is
 // listed as not drawn); every catalog fruit the kit names is drawn by its item (the tunas at least 200 times)
 fruit(SP,PL,N){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  const keys=[...new Set(SP.map(S=>S.tags.harvest&&S.tags.harvest.fruit).concat(Object.values(PL).map(P=>P.tags.harvest&&P.tags.harvest.fruit)).filter(Boolean))];
  const undrawn=keys.filter(k=>!FRUIT_ITEM[k]||!(N[FRUIT_ITEM[k]]>=(k==='generic_fruit_tuna'?200:1)));
  return{ok:!miss.length&&!untagged.length&&!undrawn.length,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+
   (undrawn.length?'not drawn: '+undrawn.join(', ')+'; ':'')+keys.map(k=>k.replace('generic_fruit_','')+' '+(N[FRUIT_ITEM[k]]||0)).join(', ')+' instances; '+SP.length+' species and '+Object.keys(PL).length+' plants tagged'};},
 // the curtain: no vertex buried in rock, and its top row stands on rock (the river does not run out over air)
 curtain(V,name){const inRock=V.filter(v=>buried(v[0],v[1],v[2],.3)).length,top=Math.max(...V.map(v=>v[1])),T=V.filter(v=>v[1]>top-.01);
  const air=T.filter(v=>rockTop(v[0]-4,v[2])<v[1]-3).length;
  return{ok:!inRock&&!air,detail:name+': '+V.length+' vertices, '+inRock+' inside the rock; '+air+'/'+T.length+' of the top row over air 4 m back'};},
 carveOpen(Q){const q=Q.depth*.45,x=Q.c[0]-Q.n[0]*q,z=Q.c[1]-Q.n[1]*q,ym=Q.floorY+Q.h*.45,c=BIO.carve.covered(x,z);
  const open=!BIO.carve.rockAt(x,ym,z)&&terrainH(x,z)<ym,hood=c!==null&&BIO.carve.rockAt(x,c+2,z);
  return{ok:open&&hood,detail:Q.id+': the void at '+ym.toFixed(0)+' m '+(open?'open':'IN ROCK')+'; 2 m over its ceiling '+(c===null?'no ceiling':hood?'rock':'AIR')};},
 noHoodFlora(P){const bad=P.filter(p=>BIO.carve.topAt(p[0],p[2])!==null&&p[1]<(BIO.carve.covered(p[0],p[2])??1e9));
  return{ok:!bad.length,detail:bad.length?bad.length+' rooted under the cap (first at '+bad[0].map(v=>v|0)+')':P.length+' instances, none under the cap'};},
 camerasOut(C){const bad=C.filter(c=>buried(c.x,c.y,c.z,.3));return{ok:!bad.length,detail:bad.length?'in the rock: '+bad.map(c=>c.view).join(', '):C.length+' cameras in the open'};},
 // a spire stands in the water: its foot at or under the ground as drawn (it does not float over the bed), its
 // top 0.5 m clear of the water and of terrainH (it does not sink; the drawn ground's chords are KNOWN_ISSUES')
 spires(S,name){let fl=0,sk=0,hi=-1e9,lo=1e9;for(const s of S){const f=s.foot-drawnH(s.x,s.z),c=s.top-Math.max(terrainH(s.x,s.z),waterH(s.x,s.z));
   if(f>.05)fl++;if(c<.5)sk++;hi=Math.max(hi,f);lo=Math.min(lo,c);}
  return{ok:S.length>0&&!fl&&!sk,detail:name+': '+S.length+' spires; '+fl+' feet over the drawn ground (highest '+hi.toFixed(2)+' m), '+sk+' tops under 0.5 m clear (lowest '+lo.toFixed(2)+' m)'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('cataract-leaves-from-rock-clear-of-it',HCHK.curtain(worldV(FALL.mesh),'the cataract'));
 for(const Q of BIO.carve.patches)add('carve: '+Q.id+' open under rock',HCHK.carveOpen(Q));
 add('carve: nothing grows under the cap',HCHK.noHoodFlora(instPoints().filter(p=>Math.abs(p[0]-LIP.x)<80&&Math.abs(p[2]-LIP.z)<80)));
 add('preset-cameras-out-of-the-rock',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('candles: far spires neither float nor sink',HCHK.spires(candleSpires(),'the twist-candles'));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(SEDESERT.SPECIES,SEDESERT.PLANTS,itemCounts()));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const V=worldV(FALL.mesh);add('the cataract pushed 12 m back into the promontory',HCHK.curtain(V.map(v=>[v[0]-12,v[1],v[2]]),'curtain-12'));
 add('the cataract started 30 m out over the Abyss',HCHK.curtain(V.map(v=>[v[0]+30,v[1],v[2]]),'curtain+30'));
 const Q=BIO.carve.patches[0];add('the cave probed 40 m above its floor',HCHK.carveOpen(Object.assign({},Q,{floorY:Q.floorY+40})));
 add('a plant on the cave floor',HCHK.noHoodFlora([[Q.c[0]-10,Q.floorY,Q.c[1]]]));
 add('a camera inside the cap',HCHK.camerasOut([{view:'in-cap',x:Q.c[0]-12,y:BIO.carve.covered(Q.c[0]-12,Q.c[1])+4,z:Q.c[1]}]));
 const S=candleSpires();add('the candle spires footed on the water, not the bed',HCHK.spires(S.map(s=>Object.assign({},s,{foot:Math.max(waterH(s.x,s.z),terrainH(s.x,s.z))})),'spires on the water'));
 add('the candle spires sunk to their tips',HCHK.spires(S.map(s=>Object.assign({},s,{foot:2*s.foot-s.top,top:s.foot})),'spires sunk'));
 add('a fruiting species with no catalog fruit',HCHK.fruit(SEDESERT.SPECIES.map(S=>S.key==='mesquite'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),SEDESERT.PLANTS,itemCounts()));
 add('the tunas never drawn',HCHK.fruit(SEDESERT.SPECIES,SEDESERT.PLANTS,Object.assign(itemCounts(),{fruit:0})));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 biome:()=>window._biome};
window._registered=REG.length;
