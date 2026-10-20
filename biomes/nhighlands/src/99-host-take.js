// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);else NHL.setNight(m==='night'?1:0);};
// THE PRESET VIEWS: [camera xyz, target xyz, light mode]. The close ones are found in the built scene
// (along the stream, at a fall, at a species' most open hero, in a colony), never aimed at arithmetic.
const VIEWS={};
(function(){const G=(x,z)=>terrainH(x,z),P=(s,t)=>xzOf(s,t);
 const add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};};
 {const c=P(4250,tStream(4250)-260),t=P(-1400,0);add('Overview from the SE crest',[c[0],G(c[0],c[1])+170,c[1],t[0],G(t[0],t[1])+40,t[1]]);}
 {const c=P(1900,900),t=P(-9000,-600);add('The lowlands from the flank',[c[0],G(c[0],c[1])+140,c[1],t[0],-250,t[1]]);}
 const sIdx=s=>clamp(Math.round((S_SRC-s)/12),0,STREAM.P.length-1);
 const streamView=(s,back,side,up,ahead)=>{const i=sIdx(s),j=clamp(i+back,0,STREAM.P.length-1),k=clamp(i-ahead,0,STREAM.P.length-1),p=STREAM.P[j],a=STREAM.P[Math.max(0,j-1)],b=STREAM.P[Math.min(STREAM.P.length-1,j+1)];
  const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,cx=p[0]+nx*side,cz=p[1]+nz*side,q=STREAM.P[k];
  return[cx,Math.max(G(cx,cz),STREAM.level[j])+up,cz,q[0],STREAM.level[k]+up*.6,q[1]];};
 add('The stream',streamView(-2350,4,7,2.2,6));
 {const f=STREAM.falls.length?STREAM.falls[STREAM.falls.length-1]:sIdx(420),i=clamp(f+11,0,STREAM.P.length-1),p=STREAM.P[i],q=STREAM.P[Math.max(0,f-1)];
  add('The waterfall',[p[0],STREAM.level[i]+5,p[1],q[0],(STREAM.level[Math.max(0,f-3)]+STREAM.level[i])/2+4,q[1]]);}
 if(STREAM.falls.length>1){const f=STREAM.falls[0],i=clamp(f+7,0,STREAM.P.length-1),p=STREAM.P[i],q=STREAM.P[Math.max(0,f-1)];add('The upper fall',[p[0],STREAM.level[i]+6,p[1],q[0],(STREAM.level[Math.max(0,f-3)]+STREAM.level[i])/2+3,q[1]]);}
 {const a=Math.atan2(TARN.z-STREAM.P[20][1],TARN.x-STREAM.P[20][0]),cx=TARN.x+Math.cos(a)*(TARN.r+40),cz=TARN.z+Math.sin(a)*(TARN.r+40);add('The tarn',[cx,G(cx,cz)+6,cz,TARN.x,TARN.level+2,TARN.z]);}
 if(TOWER.top){const y=TOWER.y0,a=Math.atan2(TOWER.z-STREAM.P[sIdx(TOWER.s)][1],TOWER.x-STREAM.P[sIdx(TOWER.s)][0])+Math.PI,cx=TOWER.x+Math.cos(a)*120,cz=TOWER.z+Math.sin(a)*120;
  add('The tower',[cx,Math.max(G(cx,cz),y)+38,cz,TOWER.x,y+55,TOWER.z]);
  {const ux=Math.cos(a),uz=Math.sin(a),cx3=TOWER.x+ux*58,cz3=TOWER.z+uz*58;add('Up the tower',[cx3,Math.max(G(cx3,cz3),y)+2,cz3,TOWER.x+ux*24,y+62,TOWER.z+uz*24]);}   // from outside its foot, up the face it turns to the stream
  const cx2=TOWER.x+Math.cos(a)*62,cz2=TOWER.z+Math.sin(a)*62;add('Night: the tower',[cx2,Math.max(G(cx2,cz2),y)+18,cz2,TOWER.x,y+30,TOWER.z],'night');}
 add('Night: the stream',streamView(-1800,3,6,2,7),'night');
 // trees found in the scene
 const HT=new Map();NHL.TREES.forEach(T=>{const k=Math.floor(T.x/50)+','+Math.floor(T.z/50);(HT.get(k)||HT.set(k,[]).get(k)).push(T);});
 const around=(x,z,r)=>{const o=[];for(let i=Math.floor((x-r)/50);i<=Math.floor((x+r)/50);i++)for(let j=Math.floor((z-r)/50);j<=Math.floor((z+r)/50);j++){const L=HT.get(i+','+j);if(L)L.forEach(T=>{if(Math.hypot(T.x-x,T.z-z)<r)o.push(T);});}return o;};
 const blockedLine=(T,cx,cz)=>{for(const O of around((T.x+cx)/2,(T.z+cz)/2,Math.hypot(T.x-cx,T.z-cz)/2+12)){if(O===T||O.H<6)continue;const dx=cx-T.x,dz=cz-T.z,l2=dx*dx+dz*dz,t=clamp(((O.x-T.x)*dx+(O.z-T.z)*dz)/l2,0,1);if(Math.hypot(T.x+dx*t-O.x,T.z+dz*t-O.z)<Math.max(1.5,O.rb*2)+1)return true;}return false;};
 const heroesOf=key=>NHL.TREES.filter(T=>T.sp===NHL.KEY[key]&&T.lv===2&&Math.abs(T.x)<3000&&Math.abs(T.z)<3000);
 const specimen=(key,dist,h,lookK)=>{const C=heroesOf(key);let best=null;
  C.slice(0,500).forEach(T=>{const crowd=around(T.x,T.z,dist+10).length;if(best&&crowd>=best.crowd)return;
   for(let q=0;q<16;q++){const a=q/16*TAU,cx=T.x+Math.cos(a)*dist,cz=T.z+Math.sin(a)*dist;if(BIO.mask(cx,cz)<.1||blockedLine(T,cx,cz))continue;best={T,crowd,cx,cz};break;}});
  if(!best)return null;const T=best.T;return[best.cx,G(best.cx,best.cz)+h,best.cz,T.x,T.y0+T.H*(lookK||.5),T.z];};
 add('Great trumpet',specimen('greattrumpet',62,9,.62));
 {const C=NHL.COLONIES.filter(c=>c.lv===2&&c.n>=12&&c.sp===NHL.KEY.trumpet);const c=C.sort((a,b)=>b.n-a.n)[0];
  if(c){const a=rr(0,TAU),cx=c.x+Math.cos(a)*(c.r+14),cz=c.z+Math.sin(a)*(c.r+14);add('Trumpet colony',[cx,G(cx,cz)+3.5,cz,c.x,G(c.x,c.z)+5,c.z]);}}
 {const C=heroesOf('greatspruce').concat(heroesOf('cathedralcedar')).filter(T=>T.H>66);const T=C.sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[0];
  if(T){const a=rr(0,TAU),cx=T.x+Math.cos(a)*(T.rb*2+9),cz=T.z+Math.sin(a)*(T.rb*2+9);add('Temperate cathedral',[cx,G(cx,cz)+1.7,cz,T.x,T.y0+T.H*.75,T.z]);}}
 add('Old wood',specimen('gnarloak',22,3,.45));
 add('Moss maple',specimen('mossmaple',30,4,.45));
 add('Boreal band',specimen('spirespruce',55,6,.5));
 {const C=heroesOf('burnsnag');const T=C.sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[0];if(T){const cx=T.x+40,cz=T.z+30;add('The burn',[cx,G(cx,cz)+5,cz,T.x,G(T.x,T.z)+6,T.z]);}}
 {const C=NHL.TREES.filter(T=>T.sp===NHL.KEY.windspruce&&T.lv===2);const T=C.sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[0];
  if(T){const cx=T.x-28,cz=T.z-22;add('Treeline and snow',[cx,G(cx,cz)+4,cz,T.x+60,G(T.x+60,T.z+50)+8,T.z+50]);}}
 if(PILLARS.length){const Pl=PILLARS.slice().sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[0],a=Math.atan2(-Pl.z,-Pl.x),cx=Pl.x+Math.cos(a)*130,cz=Pl.z+Math.sin(a)*130;add('Crag pillars',[cx,G(cx,cz)+30,cz,Pl.x,Pl.top-6,Pl.z]);}
 // MORNING FOG: low among the temperate giants, looking toward the low sun through the trunks (the amber-fog reference)
 {const C=heroesOf('greatspruce').concat(heroesOf('shadowhemlock'));const T=C.filter(T=>Math.hypot(T.x-TOWER.x,T.z-TOWER.z)>200&&BIO.clearOf(T.x,T.z,60)).sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[2]||C[0];
  if(T){const sd=new THREE.Vector3(-SUN_POS[0],0,-SUN_POS[2]).normalize(),cx=T.x+sd.x*45,cz=T.z+sd.z*45;add('Morning fog',[cx,G(cx,cz)+2.2,cz,T.x-sd.x*60,G(T.x,T.z)+12,T.z-sd.z*60],'dawn');}}
 // THE NEW FLORA (HANDOFF-FLORA.md): a view of each new tree, the hummocks, and the spore lamps by night
 add('A veil banyan',specimen('banyan',70,8,.4));
 add('Serpentwood in the mist',specimen('serpentwood',20,3,.5));
 add('Shag maple',specimen('shagmaple',28,4,.4));
 add('Table cedar',specimen('tablecedar',60,8,.55));
 add('Fan-leaf',specimen('fanleaf',36,4,.55));
 add('Ghost alders',specimen('ghostalder',26,2.5,.5));
 if(NHL.HUMMOCKS&&NHL.HUMMOCKS.length){const near=L=>L.slice().sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[0],view=(h,d,up)=>{const a=rr(0,TAU),cx=h.x+Math.cos(a)*(h.r+d),cz=h.z+Math.sin(a)*(h.r+d);return[cx,G(cx,cz)+up,cz,h.x,h.y,h.z];};
  add('Moss hummocks',view(near(NHL.HUMMOCKS.filter(h=>h.r>1.2)),9,2.4));const L=NHL.HUMMOCKS.filter(h=>h.lamp);if(L.length)add('Night: spore lamps',view(near(L),2.2,.9),'night');}
})();
// ---------------------------------------------------------------- the inspector's words
// THE INSPECTOR: the plant's name, its class and its tags (climate, aridity, abyssal, riparian, harvest);
// a tree's bole names itself through its registered volume, a small plant through its item's label
function tagText(t){if(!t)return'';const g=t.tags,h=g.harvest||{};return '\n'+t.cls+'  ·  '+g.climate+' / '+g.aridity+' / '+(g.abyssal?'abyssal':'non-abyssal')+' / riparian: '+g.riparian+
 '\nharvest: wood '+h.wood+(h.edible&&h.edible.length?' · edible: '+h.edible.join(', '):' · not edible')+(h.medicinal?' · medicinal':'')+(h.fruit?' · catalog '+h.fruit:'')+(h.notes?'\n'+h.notes:'');}
// a hidden mesh (a runtime LOD chunk out of range) is not what was clicked: the first visible hit
function describe(h0,hits){hits=hits.filter(h=>h.object.visible);if(!hits.length)return '(nothing)';const p=hits[0].point,o=hits[0].object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,isBole=!o.isInstancedMesh&&o.userData.biome;
 let name,tags=null;
 if(isItem){tags=NHL.tagsOf(lab);name=lab+(best&&best.kind==='tree'?'  (on '+best.name+')':'');if(!tags&&best&&best.kind==='tree')tags=NHL.tagsOf(best.name);}
 else if(isBole&&best&&best.kind==='tree'){name=best.name+'  ·  '+lab;tags=NHL.tagsOf(best.name);}
 else{name=(best?best.name+'  ·  ':'')+lab+(o.userData.host?'\nstructure (host)':'');}
 return name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m'+tagText(tags);}
// the presets for the host: the camera's six numbers (each preset also carries its light, set by onView)
const HOST_VIEWS={};for(const k in VIEWS)HOST_VIEWS[k]=VIEWS[k].v;
// day / dawn / night, lit on the button of the mode that is on
const LCTL=['day','dawn','night'].map(m=>({button:m[0].toUpperCase()+m.slice(1),title:m==='night'?'Night (N): the bell-bulbs and lantern pods glow':'',on:()=>lightMode(m),m}));
if(typeof LIGHT_HOOKS!=='undefined')LIGHT_HOOKS.push(m=>{for(const c of LCTL)if(c.el)c.el.classList.toggle('on',c.m===m);});
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per biome pass come from BIO.stats
// (charged by BIO.cur inside the biome); the biome's own invariants (every
// species placed, the stream descending, nothing rooted in the water or on a
// cliff, the tower hung with growth, the night lighting the glow) are measured
// here from the built scene.
const BUDGET={
 showcase:{tris:32000000,calls:520,rendered:15000000},   // held in memory (stand-ins included) / drawn at any one camera, with the runtime LOD
 cls:{pass:22000000,host:1500000},
 type:{'nhighlands/trees':'pass','nhighlands/floor':'pass','nhighlands/dress':'pass','host':'host'},
};
// the instances of one item, as positions
function itemPositions(name,every){const out=[],m=new THREE.Matrix4();every=every||1;
 BIO.baked.forEach(o=>{if(!o.isInstancedMesh||o.name!=='biome:'+name)return;for(let i=0;i<o.count;i+=every){o.getMatrixAt(i,m);out.push([m.elements[12],m.elements[13],m.elements[14]]);}});return out;}
function biomeChecks(){const R={};
 // every species placed at least once
 R.missing=NHL.SPECIES.filter((S,i)=>!NHL.TREES.some(T=>T.sp===i)).map(S=>S.key);
 R.bySpecies=NHL.SPECIES.map((S,i)=>S.key+':'+NHL.TREES.filter(T=>T.sp===i).length).join(' ');
 // the stream descends: its surface never climbs, its bed is always under its surface
 let mono=true,under=true;for(let i=1;i<STREAM.level.length;i++){if(STREAM.level[i]>STREAM.level[i-1]+1e-6)mono=false;if(STREAM.bed[i]>STREAM.level[i])under=false;}
 R.stream={monotone:mono,bedUnder:under,drop:+(STREAM.level[0]-STREAM.level[STREAM.level.length-1]).toFixed(1),falls:STREAM.falls.length,lenKm:+(STREAM.LEN/1000).toFixed(2)};
 // nothing rooted in the water: trees, and the floor's plants (the stepping stones are the one thing meant to stand in it)
 R.treesInWater=NHL.TREES.filter(T=>BIO.depth(T.x,T.z)>.05).length;
 const FLOOR=['frond','lady','lace','pleat','blade','bell','heath','sorrel','ucard','mondo','spike','paddle','spurge','smoke','disc','cane','bracken','zebra','wheel','sporepin'];
 let wet=0,n=0;FLOOR.forEach(it=>itemPositions(it,7).forEach(p=>{n++;if(BIO.depth(p[0],p[2])>.35)wet++;}));R.floorInWater={wet,of:n};
 // nothing rooted on a cliff
 R.treesOnCliffs=NHL.TREES.filter(T=>FC.at(FC.a.slope,T.x,T.z)>1.5&&T.lv>0).length;
 // the probe's finds: a great trumpet, a colony of understorey trumpets, the glow
 R.greatTrumpets=NHL.TREES.filter(T=>T.sp===NHL.KEY.greattrumpet).length;
 R.biggestColony=NHL.COLONIES.reduce((m,c)=>Math.max(m,c.sp===NHL.KEY.trumpet?c.n:0),0);
 R.bulbs=itemPositions('bulb').length;R.pods=itemPositions('lantern').length;
 // the tower carries hanging growth under its slabs
 let hang=0;if(TOWER.top)['drape','beard','bulb','lantern'].forEach(it=>itemPositions(it).forEach(p=>{if(Math.abs(p[0]-TOWER.x)<27&&Math.abs(p[2]-TOWER.z)<27&&p[1]>TOWER.y0+3&&p[1]<TOWER.top+2)hang++;}));R.towerHanging=hang;
 // and its upper floors run colder: beard lichen above, hanging moss below
 if(TOWER.top){const mid=(TOWER.y0+TOWER.top)/2;const cnt=(it,lo,hi)=>itemPositions(it).filter(p=>Math.abs(p[0]-TOWER.x)<27&&Math.abs(p[2]-TOWER.z)<27&&p[1]>lo&&p[1]<hi).length;
  R.towerGradient={mossLow:cnt('drape',TOWER.y0,mid),mossHigh:cnt('drape',mid,TOWER.top+2),lichenLow:cnt('beard',TOWER.y0,mid),lichenHigh:cnt('beard',mid,TOWER.top+2)};}
 // the night raises the glow
 const was=NHL._night,nk=NHL.setNight(1);R.night={bulb:+nk.bulb.toFixed(2),pod:+nk.pod.toFixed(2)};NHL.setNight(was);R.day=NHL.setNight(was);
 return R;}
// THE HOST'S OWN CHECKS (verify.py runs them when present), each with a broken input that must fail
// species and plants that yield something edible the kit does not draw as a catalog fruit (tips, sap, shoots...): named, not hidden
const FRUIT_NOT_DRAWN=['greatspruce','shadowhemlock','mossmaple','greattrumpet','trumpet','normanspruce','mountainmaple','larch','birch','cragpine','frosttrumpet','forestlime',
 'Sword ferns','Lady ferns','Disc stalks','Trumpet saplings','Wood sorrel','Spikes','Mountain cane','Reindeer lichen','Mushrooms','fanleaf','banyan'];
const HCHK={
 // fruit: every fruiting species and plant names a catalog piece, and each kind of fruit is drawn on the stage
 // (N: instances of 'berry' = arils, rowan, bilberries; 'lantern' = lantern pods; 'mast' = beechmast and acorns)
 fruit(SP,PL,N){const id=x=>x.key||x.label,miss=SP.concat(PL).filter(x=>x.tags.harvest&&x.tags.harvest.edible.length&&!x.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(id(x))<0).map(id);
  const untagged=SP.concat(PL).filter(x=>!x.tags.harvest).map(id),thin=['berry','lantern','mast'].filter(k=>!(N[k]>=20));
  return{ok:!miss.length&&!untagged.length&&!thin.length,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+
   (thin.length?'too few drawn: '+thin.join(', ')+'; ':'')+N.berry+' berries and arils, '+N.lantern+' lantern pods, '+N.mast+' mast drawn; catalog keys: '+NHL.FRUIT_KEYS.length+' ('+NHL.FRUIT_KEYS.join(', ')+')'};}};
const fruitN=()=>({berry:itemPositions('berry').length,lantern:itemPositions('lantern').length,mast:itemPositions('mast').length});
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(NHL.SPECIES,NHL.PLANTS,fruitN()));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=fruitN();
 add('a fruiting species with no catalog fruit',HCHK.fruit(NHL.SPECIES.map(S=>S.key==='rowan'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),NHL.PLANTS,N));
 add('no mast drawn',HCHK.fruit(NHL.SPECIES,NHL.PLANTS,Object.assign({},N,{mast:0})));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
// the runtime LOD: which chunk meshes this camera draws (after the camera is placed, before the draw)
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.take({build:'nhighlands',title:'Krator Northern Highlands',
 hint:'The Northern Highlands: old-growth temperate forest rising to boreal on the north-western flank of the Inner Wall; trumpet trees, glowing bell-bulbs, a stream from its tarn, a ruined Girder tower hung with growth (ideal type). N for night',
 scene,camera,renderer,ground:terrainH,clear:1.6,minR:2,maxR:9000,registry:REG,views:HOST_VIEWS,ticks:TICKS,
 onView:k=>lightMode(VIEWS[k].mode),controls:LCTL,
 keys:{n:()=>lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night')},
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:'The Northern Highlands'},
 budget:BUDGET,types:()=>BIO.stats,
 // the kit's own occupancy count, as its 91-host-probe.js had it: a tree's volume counts as filled, and an instanced mesh
 // gives at most ~4000 samples (the host's generic count samples every instance and every volume)
 probeSample:4000,
 api:{hostChecks,hostNegatives,
  regOccupancy(){const n=new Array(REG.length).fill(0);const P=KHOST.probe.probePoints();
   REG.forEach((r,i)=>{if(r.kind==='tree'){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});
   return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));},
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biomeChecks,itemPositions,
 biome:()=>window._biome}});
