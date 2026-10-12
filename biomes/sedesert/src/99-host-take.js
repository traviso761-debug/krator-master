// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are found on the map rather than typed: the river meanders, and
// the scrub's stands (candelabra / cardon / Joshua) are an fbm field
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
// one sweep of the map scores every preset at once: the species' own acceptance
// (SEDESERT.PASSES), nearer the spine preferred
const ACC=sp=>SEDESERT.PASSES.find(p=>p.sp===sp).accept;
const SCORES={
 cand:(Z,x,z,ld)=>ACC(1)(Z,x,z)-ld/6000,
 card:(Z,x,z,ld)=>ACC(2)(Z,x,z)-ld/6000,
 josh:(Z,x,z,ld)=>ACC(11)(Z,x,z)-ld/6000,
 bad:(Z,x,z,ld)=>badK(x,z)*(1-Z.can)*(1-Z.rim)-Z.up*3-ld/4000,   // badK: the host's own badland field
 quiv:(Z,x,z,ld)=>x>-1800?-1e9:Z.mtn*smooth(.7,.3,Z.up)-ld/8000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-1900;z<=1900;z+=45)for(let x=-2900;x<=2950;x+=45){const Z=SEDESERT.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,x,z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const P_CAND=P.cand,P_CARD=P.card,P_JOSH=P.josh,P_BAD=P.bad,P_QUIV=P.quiv;
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
// the fauna nearest a point: a thermal, a flock, a band (the layout the fauna pass left)
function nearFauna(kind,x,z){const L=(SEDESERT.FAUNA_LAYOUT||{})[kind]||[];let b=null,bd=1e9;for(const f of L){const d=Math.hypot(f.x-x,f.z-z);if(d<bd){bd=d;b=f;}}return b||{x:x,z:z,y0:gh(x,z)+80,r:60,len:80};}
const TH=nearFauna('thermals',BUTTE.x-200,BUTTE.z-400),FL=nearFauna('flocks',POND.x,POND.z),BD=nearFauna('bands',600,zR(600));
// the deer herd nearest a coyote loop (2026-10): the camera stands off its far side, at the deer's height
const HD=(function(){const L=SEDESERT.FAUNA_LAYOUT||{},Hs=L.herds||[],Ps=L.packs||[];let b=null,bd=1e9;
 for(const H of Hs){let d=1e9;for(const P of Ps)d=Math.min(d,Math.hypot(P.x-H.x,P.z-H.z)-P.r);if(d<bd){bd=d;b=H;}}return b||{x:600,z:zR(600),r:20};})();
// the nearest built hero of a species to a point, so a preset frames a real tree
function nearTree(sp,x,z,minH){return SEDESERT.nearestTree(sp,x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.6,T.z];}
const rimN=(x,k)=>zR(x)-Wc(x)*(k==null?1.1:k),rimS=(x,k)=>zR(x)+Wc(x)*(k==null?1.1:k);
const VIEWS={
 'The linear oasis':look(400,rimN(400,1.15),10,900,zR(900),4),
 'Dragon trees on the rim':atTree(nearTree(0,-150,rimS(-150,1.1)),42,.6),
 'Mesquite bosque':atTree(nearTree(6,1100,zR(1100)+10,10),46,2.2,5),
 'The wadi gorge':look(-2380,zR(-2380)+26,5,-2650,zR(-2650),12),
 'The rain-shadow pond':[POND.x-230,PL+22,POND.z-190,POND.x+20,PL+.5,POND.z+10],
 'The butte':look(BUTTE.x-1500,BUTTE.z-650,55,BUTTE.x,BUTTE.z,100),
 'Candelabra scrub':atTree(nearTree(1,P_CAND[0],P_CAND[1]),95,2.3),
 'Cardon stand':atTree(nearTree(2,P_CARD[0],P_CARD[1]),80,2.0),
 'Joshua trees':atTree(nearTree(11,P_JOSH[0],P_JOSH[1]),40,2.6),
 'Badlands and hoodoos':look(P_BAD[0]-260,P_BAD[1]+220,60,P_BAD[0]+40,P_BAD[1]-40,12),
 'Quiver trees at the wall foot':atTree(nearTree(5,P_QUIV[0],P_QUIV[1]),60,.2,6),
 'Trackless red desert':look(600,2250,14,900,2950,8),
 'The tower':look(TOWER.x-430,TOWER.z-260,40,TOWER.x,TOWER.z,90),
 'Under the tower':look(TOWER.x+40,TOWER.z-70,4,TOWER.x,TOWER.z,80),
 'Kites in a thermal':[TH.x-TH.r*2.4,gh(TH.x-TH.r*2.4,TH.z+TH.r,14),TH.z+TH.r,TH.x,TH.y0+10,TH.z],
 'Swifts over the water':[FL.x-FL.r*.9,FL.y0+2,FL.z+FL.r*.7,FL.x,FL.y0,FL.z],
 'Sand striders':look(BD.x-24,BD.z+18,2.4,BD.x,BD.z,2.2),
 'The cataract':[FALL.x+420,FALL.y-110,FALL.z+300,FALL.x+60,FALL.y-260,FALL.z],
 'The undercut lip':[LIP.x+150,LIP.floorY+18,LIP.z+110,LIP.x-8,LIP.floorY+24,LIP.z],
 'Behind the cataract':[LIP.x-18,LIP.floorY+9,LIP.z-10,LIP.x+300,LIP.floorY-25,LIP.z+28],
 'Into the Abyss':[3060,gh(3060,zR(3060)-220,26),zR(3060)-220,3700,-140,zR(3150)+60],
 'From afar':look(-2500,2550,360,0,0,40),
 'Krator rising':[-600,gh(-600,600,30),600,1900,900,-2100],
};
// the walkers move, so these two presets are getters: each frames the animal where it stands when chosen
// (one deer of that herd, the nearest coyote loop's leader), from the side at its own height
const animalView=(mesh,i,d,fb)=>{const m=scene.getObjectByName(mesh);if(!m||i<0)return fb;const M=new THREE.Matrix4();m.getMatrixAt(i,M);const e=M.elements;
 return[e[12]-d*.8,e[13]+d*.28,e[14]+d*.6,e[12],e[13]+d*.1,e[14]];};
Object.defineProperty(VIEWS,'Mule deer',{enumerable:true,get(){const L=SEDESERT.FAUNA_LAYOUT||{};
 return animalView('biome:deer',(L.deer||[]).indexOf(HD.deer&&HD.deer[0]),8,look(HD.x-24,HD.z+12,3,HD.x,HD.z,.9));}});
Object.defineProperty(VIEWS,'Coyotes',{enumerable:true,get(){const L=SEDESERT.FAUNA_LAYOUT||{},C=L.coyotes||[];let b=-1,bd=1e9;
 C.forEach((c,i)=>{const d=Math.hypot(c.P.x-HD.x,c.P.z-HD.z);if(!c.back&&d<bd){bd=d;b=i;}});return animalView('biome:coyote',b,6,look(HD.x-24,HD.z+12,3,HD.x,HD.z,.9));}});
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the tags and the harvest: a tree from its registered volume, a floor plant from the item it clicked
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&SEDESERT.plantOfItem(item),S=best&&best.key&&SEDESERT.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 if(tg)name+='\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+
  (tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'');
 return name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 showcase:{tris:12800000,calls:120},   // measured at q=1 on this 6.8 km map (baseline.json), not a target (KNOWN_ISSUES)
 cls:{pass:7000000,host:900000},
 type:{'desert/trees':'pass','desert/floor':'pass','desert/fauna':'pass','desert/dress':'pass','host':'host'},
};
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
// ---------------------------------------------------------------- the page, handed to the host
KHOST.take({build:'sedesert',title:'Krator biome — the eastern high desert',
 hint:"The eastern high desert: red desert, the river's linear oasis, the rain-shadow pond, the cataract into the Abyss (ideal type)",
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 // the eye kept over the ground, and out of the carved cap's rock (on top of it)
 clampCam(cp){const g=terrainH(cp.x,cp.z)+1.8;if(cp.y<g)cp.y=g;
  if(BIO.carve.rockAt(cp.x,cp.y,cp.z))cp.y=(BIO.carve.topAt(cp.x,cp.z)??cp.y)+1.8;},
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
