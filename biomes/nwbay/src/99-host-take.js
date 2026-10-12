// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are written in the bay's own coordinates (u along the NW
// diagonal from the bay's centre, inland; v across it, toward the NE; heights
// above the ground). SV looks at a karst stack from a bearing and a range.
const V=(cu,cv,cy,tu,tv,ty)=>{const c=XZ(cu,cv),t=XZ(tu,tv);return[c[0],terrainH(c[0],c[1])+cy,c[1],t[0],terrainH(t[0],t[1])+ty,t[1]];};
const SV=(i,az,dist,cy,ty)=>{const S=STACKS[i],cx=S.x+Math.cos(az)*dist,cz=S.z+Math.sin(az)*dist;return[cx,Math.max(cy,groundH(cx,cz)+3),cz,S.x,ty,S.z];};
const TV=(key,x,z,k)=>{let b=null,bd=1e9;for(const t of NWBAY.TREES){if(t.lv!==2||NWBAY.SPECIES[t.sp].key!==key)continue;const d=Math.hypot(t.x-x,t.z-z);if(d<bd){bd=d;b=t;}}
 if(!b)return V(1000,-250,14,640,-120,40);const R=Math.max(6,(b.spread||b.crownR)*k+b.H*.6),a=h3a(b.seed),cx=b.x+Math.cos(a)*R,cz=b.z+Math.sin(a)*R;return[cx,Math.max(b.y0+b.H*.45+2,terrainH(cx,cz)+2.5),cz,b.x,b.y0+b.H*.5,b.z];};
const h3a=s=>(s%628)/100;
const VIEWS={
 'The bay from the shore':V(1000,-250,14,640,-120,40),
 'Sea stacks':SV(0,2.2,330,36,52),
 'The headland stack':SV(4,-2.6,420,80,70),
 'Under the cliff figs':SV(4,-2.3,170,28,118),
 'A sea stack close':SV(2,-.9,150,24,60),
 'The travertine terraces':(function(){const u=1700;return V(u-110,vR(u-110)+44,30,u+220,vR(u+220),6);})(),
 'A terrace pool':(function(){const u=1560;return V(u-70,vR(u-70)+26,12,u+60,vR(u+60),3);})(),
 'The cascades':(function(){const u=2100;return V(u-90,vR(u-90)+30,24,u+200,vR(u+200),4);})(),
 'The tsingy':V(2200,-1150,70,2560,-830,10),
 // down a canyon: the open canyon point nearest the massif's heart, looking along its joint
 'Into the tsingy':(function(){let best=null;for(let i=0;i<4000&&!best;i++){const a=i*2.39996,r=4*Math.sqrt(i),x=TSINGY.x+Math.cos(a)*r,z=TSINGY.z+Math.sin(a)*r;if(canyonK(x,z)>.9&&pinAt(x,z)>2.5&&tsingyK(x,z)>.7)best=[x,z];}
  if(!best)best=[TSINGY.x,TSINGY.z];const j=TSINGY.joints[0],y=groundH(best[0],best[1]);let jj=j;
  {const f=d=>{let n=0;for(let t=8;t<=60;t+=8)if(canyonK(best[0]+Math.cos(d)*t,best[1]+Math.sin(d)*t)>.5)n++;return n;};const c=[j,j+Math.PI,TSINGY.joints[1],TSINGY.joints[1]+Math.PI];jj=c.reduce((m,d)=>f(d)>f(m)?d:m,c[0]);}
  return[best[0]-Math.cos(jj)*4,y+2.6,best[1]-Math.sin(jj)*4,best[0]+Math.cos(jj)*60,y+9,best[1]+Math.sin(jj)*60];})(),
 'Over the blades':V(2700,-1000,34,2520,-800,4),
 'The tiankeng':(function(){const S=SINKS[0];return[S.x+150,S.top+90,S.z+120,S.x,S.floorY+10,S.z];})(),
 'In the tiankeng':(function(){const S=SINKS[0];return[S.x-30,S.floorY+S.talus*.2+6,S.z+20,S.x+60,S.floorY+40,S.z-40];})(),
 'A cenote':(function(){const S=SINKS[1];return[S.x+22,S.top+34,S.z+18,S.x,-2,S.z];})(),
 // the Madagascarene flora: a hero of the species nearest a place, seen from a few crown-widths off
 'Spinewands':TV('spinewand',TSINGY.x,TSINGY.z,2.2),
 'Rock bottles':TV('rockbottle',TSINGY.x,TSINGY.z,2.6),
 'Avenue baobabs':TV('avenuebaobab',CENTER[0],CENTER[1],1.6),
 "Traveller's fans":TV('travellerfan',SINKS[0].x,SINKS[0].z,1.8),
 'Shelf pools':(function(){const S=SHELVES[0].xz;return[S[0]+42,groundH(S[0]+42,S[1]+30)+9,S[1]+30,S[0],groundH(S[0],S[1])+2.5,S[1]];})(),
 'The mangrove lagoon':V(820,-110,6,960,-60,3),
 'Lotus trumpets':(function(){const u=1290;return V(u-50,vR(u-50)+42,8,u+40,vR(u+40)+16,6);})(),
 'Reed beds':(function(){const d=MOUTH_XZ;let best=null,bd=1e9;for(const B of (NWBAY.REEDBEDS||[])){if(B.n<100)continue;const dd=Math.hypot(B.x-d[0],B.z-d[1]);if(dd<bd){bd=dd;best=B;}}
  if(!best)return V(840,300,8,900,340,2);return[best.x+best.r*2.2,7,best.z+best.r*1.4,best.x,1,best.z];})(),
 'Pandans on the shore':V(990,-40,4,950,-110,3),
 'Flame-crowns on the terraces':V(1480,520,10,1700,600,14),
 'Flame-crowns from above':V(1500,440,70,1750,560,10),
 'Cinder pines on the lava':V(300,-790,8,440,-690,12),
 'The basalt headland':V(280,-540,22,150,-660,6),
 'The black cove':V(290,620,12,440,760,3),
 'The river mouth':V(760,110,22,1000,270,3),
 'Soarers over the bay':V(960,120,30,400,-100,70),
 'The jetty':(function(){const J=window.JETTY;if(!J)return V(950,-250,6,850,-250,2);const c=[J.head[0]-J.dir[1]*40+J.dir[0]*-30,J.head[1]+J.dir[0]*40+J.dir[1]*-30],t=[J.head[0]+J.dir[0]*J.L*.45,J.head[1]+J.dir[1]*J.L*.45];return[c[0],9,c[1],t[0],3,t[1]];})(),
 'Bay swimmers':(function(){const p=(NWBAY.FAUNA&&NWBAY.FAUNA.pods&&NWBAY.FAUNA.pods[0])||{x:BAY.c[0],z:BAY.c[1],r:100};const cx=p.x+p.r*.9,cz=p.z+p.r*.55;return[cx,16,cz,p.x,0,p.z];})(),
 'Under the prism gums':V(1150,200,8,1400,260,40),
 'Ironbarks':V(1180,-60,8,1420,-20,44),
 'The fan-crowns':V(1300,460,12,1500,620,34),
 'The jungle from above':V(1080,0,160,1500,120,30),
 'The tower':(function(){const T=window.TOWER;if(!T)return V(1020,-520,70,1180,-300,90);return[T.x+280,T.y0+90,T.z+200,T.x,T.y0+80,T.z];})(),
 'Into the rainforest':V(1700,100,10,1950,150,28),
 'Tree ferns':V(1900,-220,5,2050,-270,8),
 'The upper slopes':V(2400,0,12,2700,100,20),
 'Baobab stands':V(2800,300,6,3100,360,28),
 'Umbrella thorns':V(2650,-450,5,2850,-520,14),
 'From the Inner Wall':V(3600,0,120,1000,0,0),
 'From over the bay':V(-200,0,220,1200,0,30),
 'The volcano':(function(){const c=XZ(900,-300);return[c[0],terrainH(c[0],c[1])+60,c[1],VOLC.c[0],1000,VOLC.c[1]];})(),
 'Krator rising':(function(){const c=XZ(900,0),t=XZ(300,2600);return[c[0],terrainH(c[0],c[1])+30,c[1],t[0],650,t[1]];})(),
};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the species' harvest tag (biomes/FRUIT.md), when the point is under a registered tree
 const S=best&&NWBAY.SPECIES.find(s=>s.name===best.name),hv=S&&S.tags.harvest;
 return name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 showcase:{tris:10000000,calls:300},   // the ceiling for this 5 km map at q=1 (KNOWN_ISSUES). Calls were ~100 at the first view before the trees became variants: each variant part is one InstancedMesh (~140 of them), the shape Godot draws as MultiMeshes
 cls:{pass:7500000,host:900000},
 type:{'nwbay/trees':'pass','nwbay/floor':'pass','nwbay/reeds':'pass','nwbay/dress':'pass','nwbay/fauna':'pass','host':'host'},
};
// the biome's own invariants: the height ceiling (nothing Girder-sized), the
// karst mask (nothing rooted on a cliff face), the figs on the karst
// species that yield something edible the kit does not draw as a catalog fruit (nectar, fiddleheads, gum, propagules,
// petals, shoots): named in the tags, not hidden
const FRUIT_NOT_DRAWN=['prismgum','treefern','thorn','mangrove','lotustrumpet','matreed'];
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// fruit: every fruiting species names a catalog piece and every species carries a harvest tag, and the fruit is drawn
// (the figs on the cliff figs, the pods of both baobabs; the pandan heads and the traveller's-fan arils as before)
function fruitCheck(SP,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
 const figs=P.filter(p=>/:fig$/.test(p[3])).length,pods=P.filter(p=>/:pod$/.test(p[3])).length,untagged=SP.filter(S=>!S.tags||!S.tags.harvest).map(S=>S.key);
 return{ok:!miss.length&&!untagged.length&&figs>=100&&pods>=20,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+figs+' figs and '+pods+' baobab pods drawn; catalog keys: '+NWBAY.FRUIT_KEYS.join(', ')};}
function extra(){const R=[];const T=NWBAY.TREES||[];
 let tallest=0,tallSp='';T.forEach(t=>{if(t.H>tallest){tallest=t.H;tallSp=NWBAY.SPECIES[t.sp].key;}});
 R.push({name:'height-ceiling',ok:tallest<=NWBAY.TEMPLE_H*1.01+.5,detail:'tallest tree '+tallest.toFixed(1)+' m ('+tallSp+') against a ceiling of '+NWBAY.TEMPLE_H+' m'});
 let onFace=0;T.forEach(t=>{const k=BIO.field('karst',t.x,t.z);if(k>.03&&k<.9)onFace++;});
 R.push({name:'nothing-on-a-cliff-face',ok:onFace===0,detail:onFace+' trees rooted where karst is between .03 and .9 (the rim band)'});
 const figs=T.filter(t=>NWBAY.SPECIES[t.sp].key==='clifffig'),figsOnKarst=figs.filter(t=>BIO.field('karst',t.x,t.z)>.9).length;
 R.push({name:'figs-on-the-karst',ok:figs.length>0&&figsOnKarst===figs.length,detail:figs.length+' cliff figs, '+figsOnKarst+' of them on the karst'});
 const under=T.filter(t=>t.y0<-1.9&&NWBAY.SPECIES[t.sp].key!=='mangrove').length;
 R.push({name:'nothing-rooted-under-water',ok:under===0,detail:under+' non-mangrove trees with their foot below -1.9 m'});
 // the tsingy and the sinkholes (host geometry the biome cannot see): no tree rooted inside a blade's footprint or
 // on a sinkhole's wall band, and the Madagascarene flora where the zones say
 if(typeof pinAt==='function'){let inBlade=0;T.forEach(t=>{if(tsingyK(t.x,t.z)>0&&pinAt(t.x,t.z)<0)inBlade++;});
  R.push({name:'nothing-in-a-blade',ok:inBlade===0,detail:inBlade+' trees rooted inside a tsingy blade ('+PINS.length+' blades)'});}
 if(typeof sinkAt==='function'){let onWall=0;T.forEach(t=>{const Q=sinkAt(t.x,t.z);if(Q&&Q.d>-4&&Q.d<4)onWall++;});
  const floor=T.filter(t=>BIO.field('hollow',t.x,t.z)>.5).length;
  R.push({name:'nothing-on-a-sinkhole-wall',ok:onWall===0,detail:onWall+' trees within 4 m of a sinkhole rim; '+floor+' on the floors'});}
 const mada=['spinewand','rockbottle','avenuebaobab','travellerfan'].map(k=>k+':'+T.filter(t=>NWBAY.SPECIES[t.sp].key===k).length);
 R.push({name:'madagascarene-flora',ok:mada.every(x=>+x.split(':')[1]>0),detail:mada.join(' ')});
 // every hero is a variant (biomes/WORLD.md: trees as variants), and no species has more than NWBAY.VARIANTS of them
 {const heroes=T.filter(t=>t.lv>0),byV={};heroes.forEach(t=>{const k=t.sp;(byV[k]=byV[k]||new Set()).add(t.variant);});
  const most=Math.max(0,...Object.values(byV).map(s=>s.size)),nov=heroes.filter(t=>t.variant==null).length;
  R.push({name:'heroes-are-variants',ok:nov===0&&most<=NWBAY.VARIANTS,detail:heroes.length+' heroes drawn from '+(NWBAY.PROTOS?NWBAY.PROTOS.size:0)+' prototypes; at most '+most+' variants a species; '+nov+' without one'});}
 // fruit, and its negative controls (a broken input that must fail)
 {const P=instPoints(),f=fruitCheck(NWBAY.SPECIES,P);R.push({name:'fruit-tagged-catalogued-drawn',ok:f.ok,detail:f.detail});
  const n1=fruitCheck(NWBAY.SPECIES.map(S=>S.key==='clifffig'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),P);
  R.push({name:'negative: a fruiting species with no catalog fruit',ok:!n1.ok,detail:n1.detail});
  const n2=fruitCheck(NWBAY.SPECIES,P.filter(p=>!/:fig$/.test(p[3])));
  R.push({name:'negative: no figs drawn',ok:!n2.ok,detail:n2.detail});}
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.take({build:'nwbay',title:'Krator biome — the north-west bay',
 hint:'The north-west bay (the biome of Ys): karst stacks in a turquoise bay, travertine terraces, lava coves, mangrove lagoons, the volcano in the SE (ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);if(typeof wallSky!=='undefined')wallSky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[sky,giant,giantRing,typeof wallSky!=='undefined'?wallSky:null]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 extra,
 biome:()=>window._biome}});
