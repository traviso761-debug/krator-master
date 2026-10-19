// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are FOUND on the map rather than typed: the features where the data put them, and a tree preset frames
// the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>THRONE.SPECIES.indexOf(THRONE.byKey[k]);
const coneOf=k=>CONES.find(c=>c.key===k),flowOf=k=>FLOWS.flows.find(f=>f.key===k);
// where the plume's edge crosses a line of latitude (z)
const seamX=z=>{let bx=0,bd=9;for(let x=-2400;x<=2400;x+=20){const d=Math.abs(plumeAt(x,z)-.5);if(d<bd){bd=d;bx=x;}}return bx;};
function nearTree(key,x,z,minH){return THRONE.nearestTree(SPI(key),x,z,minH)||THRONE.nearestTree(SPI(key),x,z)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.6:ty),T.z];}
function nearItem(name,x,z){let bx=x,bz=z,bd=1e9;const m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||M.name!=='biome:'+name)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,s);const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;bx=p.x;bz=p.z;}}});return[bx,bz];}
function atItem(name,x,z,d,az,dy,ty){const c=nearItem(name,x,z),cx=c[0]+Math.cos(az)*d,cz=c[1]+Math.sin(az)*d,y0=gh(c[0],c[1]);
 return[cx,Math.max(gh(cx,cz,1.2),y0+(dy==null?1.4:dy)),cz,c[0],y0+(ty==null?.4:ty),c[1]];}
// from a point, looking a given way across the ground
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
const NC=coneOf('newcone'),SN=coneOf('sentinel'),FN=flowOf('new'),SK=TUBE.sky[Math.floor(TUBE.sky.length/2)]||{x:0,z:0,r:12,d:10};
const FNp=FN&&FN.path?FN.path[Math.floor(FN.path.length*.45)]:{x:NC.x,z:NC.z+400};
const s0=seamX(200),G0=GULLY[0];
const VMODE={};
const VIEWS={
 'The plume\'s edge':across(s0-420,200,-.05,900,3.2,6),
 'The rift from above':look(-1600,-2300,700,700,900,0),
 'The new cone, steaming':across(NC.x-420,NC.z+260,-.55,480,6,40),
 'The new flow (two years old)':across(FNp.x-30,FNp.z-40,Math.atan2(FN.path[FN.path.length-1].z-FNp.z,FN.path[FN.path.length-1].x-FNp.x),240,3,2),
 'The acid lake':(function(){const x=PIT.x+DN[0]*PIT.r*1.35+PERP[0]*PIT.r*.3,z=PIT.z+DN[1]*PIT.r*1.35+PERP[1]*PIT.r*.3;return[x,gh(x,z,22),z,PIT.x-DN[0]*PIT.r*.2,PIT.lake,PIT.z-DN[1]*PIT.r*.2];})(),
 'The hot pools':[POOLS[0].x-40,POOLL[0]+9,POOLS[0].z-30,POOLS[1].x,POOLL[1]+1,POOLS[1].z],
 'Bone bells in the steam':atTree(nearTree('bonebell',NC.x,NC.z),30,2.6,4,.5),
 'A wild Ranj tree':atTree(nearTree('spice',s0,0,9),11,2.2,2.5,.45),
 'Gill-parasols on the seam':atTree(nearTree('gillparasol',s0,200,14),40,3.0,4,.6),
 'Under the plume: pagoda caps':atTree(nearTree('pagoda',1700,300,14),38,2.8,3,.55),
 'Drizzle trumpets':atTree(nearTree('drizzle',1500,600),16,2.4,2.5,.6),
 'Puffball rope-trees':atTree(nearTree('ropepuff',1600,-300),20,3.4,3,.55),
 'Stilt parasols in a gully':atTree(nearTree('stilt',G0.x,G0.z,16),30,1.0,3,.6),
 'The shoulder: ash pines and trumpet trees':atTree(nearTree('ashpine',-1500,-600,20),46,.4,4,.5),
 'Star aloes on a young flow':atTree(nearTree('staraloe',-500,800),14,2.0,2.4,.5),
 'A skylight into the tube':[SK.x+SK.r*1.6,gh(SK.x,SK.z,SK.d+6),SK.z+SK.r*.8,SK.x,gh(SK.x,SK.z,1),SK.z],
 'Night: lamp caps under the plume':atTree(nearTree('lampcap',1500,400),5,2.0,1.2,.4),
 'Night: under the plume':across(1300,-200,1.3,600,5,2),
 'Red velvet and wire-stalks at the pools':atItem('sporeball',POOLS[0].x,POOLS[0].z,4.5,1.8,1.3,.8),
 'Snare rafts on the acid lake':atItem('acidpad',PIT.x,PIT.z,10,.9,3,.2),
 'Chalice parasols on the shore':atTree(nearTree('chalice',PIT.x,PIT.z,20),46,2.4,6,.5),
 'Lace fans at a vent':atTree(nearTree('lacefan',NC.x,NC.z),15,2.4,3,.5),
 'A medusa cap':atTree(nearTree('medusa',PIT.x,PIT.z),11,2.2,2,.45),
 'Cage lanterns':atTree(nearTree('cagebulb',NC.x,NC.z),14,2.6,3,.6),
 'From afar':look(-1800,2600,260,400,-1200,60),
};
VMODE['Night: lamp caps under the plume']='night';VMODE['Night: under the plume']='night';
const goLight=k=>{setLightMode(VMODE[k]||'day');};   // the host's onView: the preset's light (and weather); the host sets the camera
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the classification and the tags (README.md, DEV TOOLS)
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&THRONE.plantOfItem(item);
 const S=best&&best.key&&THRONE.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 // the ground's own history at the point: the flow under it and its age; how far under the plume
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'the shield\'s old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+gr+' · plume '+plumeAt(p.x,p.z).toFixed(2)+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:20000000,calls:140},   // a ceiling, not a target: measure and record it in KNOWN_ISSUES
 cls:{pass:16000000,host:900000},
 type:{'throne/trees':'pass','throne/floor':'pass','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const ORIGINS=['earth','krator','native'],LIVES=['shoulder','seam','plume','vent','windward'];
const HCHK={
 // every species of the table is placed somewhere on the stage
 // (the species of this station: the windward ones live on the windward stations' pages)
 placed(C){const here=THRONE.SPECIES.filter(S=>S.tags.plume!=='windward'&&!S.vents&&!S.cold&&(S.rift||!S.ashp)),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:C.length===THRONE.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species of this station, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 // every species and floor plant carries its tags: the project's, its origin and where it lives, Koppen inside the region
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):L.length+' species and plants tagged (climate, aridity, abyssal, riparian, origin, plume, harvest, Koppen)'};},
 // THE MOSAIC: every stage of the flows covers a real share of the map (the fresh one is a single flow: 1%; the others 2%)
 mosaic(sh){const low=['fresh','young','mature','old'].filter(k=>!(sh[k]>=(k==='fresh'?.01:.02)));
  return{ok:!low.length,detail:(low.length?'stages under their share of the map: '+low.join(', ')+'; ':'')+Object.keys(sh).map(k=>k+' '+(sh[k]*100).toFixed(1)+'%').join(', ')};},
 // THE TURN: deep under the plume the trees are Krator's own; in the shoulder's clear air they are not
 turn(T,pl){const deep=T.filter(t=>pl(t.x,t.z)>.85),clear=T.filter(t=>pl(t.x,t.z)<.12),nat=L=>L.filter(t=>THRONE.SPECIES[t.sp].tags.origin==='native').length/Math.max(1,L.length);
  const a=nat(deep),b=nat(clear);return{ok:deep.length>20&&clear.length>20&&a>=.85&&b<=.12,detail:'under the plume '+(a*100).toFixed(0)+'% native of '+deep.length+'; in clear air '+(b*100).toFixed(0)+'% of '+clear.length};},
 // the young lie on the old: the new flow is the age of the ground along most of its own path
 onTop(F,key,age){const f=F.flows.find(x=>x.key===key);if(!f||!f.path)return{ok:false,detail:'no flow '+key};const P=f.path.filter((p,i)=>i%3===0),hit=P.filter(p=>F.ageAt(p.x,p.z)===age).length/Math.max(1,P.length);
  return{ok:hit>=.9,detail:(hit*100).toFixed(0)+'% of the '+key+' flow\'s path is '+age+' years old ground'};},
 // the bone bells grow only in the vents' steam
 bells(T,v){const b=T.filter(t=>THRONE.SPECIES[t.sp].key==='bonebell'),bad=b.filter(t=>v(t.x,t.z)<.06);
  return{ok:b.length>0&&!bad.length,detail:bad.length?bad.length+' bone bells out of the steam (first at '+[bad[0].x|0,bad[0].z|0]+')':b.length+' bone bells, all in the steam'};},
 // the new flora stays on its own page: every placed tree with rift or ashp is on a page whose field exists
 ownPage(T,rf,af){const bad=T.filter(t=>{const S=t.S||THRONE.SPECIES[t.sp];return S&&(S.rift||S.ashp)&&!((S.rift&&rf)||(S.ashp&&af));});
  return{ok:!bad.length,detail:bad.length?bad.length+' new-flora trees off their page (first '+(bad[0].S||THRONE.SPECIES[bad[0].sp]).key+')':'the new flora stays on its own page'};},
 // the night lights Krator's own life: the glow at night is many times the day's
 glow(f){const d=f(0),n=f(1);f(LIGHT_MODE==='night'?1:0);return{ok:n.lamp>d.lamp*4&&n.bracket>d.bracket*4,detail:'lamp '+d.lamp.toFixed(2)+' to '+n.lamp.toFixed(2)+', bracket '+d.bracket.toFixed(2)+' to '+n.bracket.toFixed(2)};},
 // nothing roots under the water: no instance's origin more than a metre under the local surface
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // no tree on a sheer rock face (a flow's front, a crater wall)
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on sheer rock (first '+THRONE.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a sheer face'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('every species placed',HCHK.placed(THRONE.COUNTS||[]));
 add('every species and plant tagged, with its origin and where it lives',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('every stage of the flow mosaic present',HCHK.mosaic(FLOWS.shares()));
 add('the plume turns the life to Krator\'s own',HCHK.turn(THRONE.TREES,plumeAt));
 add('the new flow lies on top',HCHK.onTop(FLOWS,'new',2));
 add('bone bells only in the steam',HCHK.bells(THRONE.TREES,FIELD.vent));
 add('the new flora stays on its own page',HCHK.ownPage(THRONE.TREES,BIO.hasField('riftlife'),BIO.hasField('ashlife')));
 add('the night lights the native life',HCHK.glow(THRONE.setNight));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a sheer rock face',HCHK.cliffs(THRONE.TREES));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(THRONE.COUNTS||[]).slice();C[SPI('lampcap')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===3?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},THRONE.SPECIES[0],{tags:Object.assign({},THRONE.SPECIES[0].tags,{koppen:['EF']})})]));
 add('a map with no fresh lava',HCHK.mosaic(Object.assign({},FLOWS.shares(),{fresh:0})));
 add('the plume read backwards',HCHK.turn(THRONE.TREES,(x,z)=>1-plumeAt(x,z)));
 add('a flow buried by an older one',HCHK.onTop(FLOWS,'new',38));
 add('a bone bell on the shoulder',HCHK.bells([{sp:SPI('bonebell'),x:-2000,z:-500}],FIELD.vent));
 add('an ash-desert tree on the rift',HCHK.ownPage(THRONE.TREES.concat([{sp:SPI('pyre')>=0?SPI('pyre'):0,S:{key:'pyre',ashp:true}}]),BIO.hasField('riftlife'),BIO.hasField('ashlife')));
 add('a glow that ignores the night',HCHK.glow(()=>({lamp:.2,bracket:.1})));
 add('a plant on the acid lake\'s bed',HCHK.dry([[PIT.x,PIT.lake-3,PIT.z,'test']]));
 {let bx=PIT.x,bz=PIT.z,bs=-1;for(let z=PIT.z-200;z<=PIT.z+200;z+=4)for(let x=PIT.x-200;x<=PIT.x+200;x+=4){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}
  add('a tree on the pit crater\'s wall',HCHK.cliffs([{x:bx,z:bz,sp:0}]));}
 add('a camera in the acid lake',HCHK.camerasOut([{view:'under',x:PIT.x,y:PIT.floor-5,z:PIT.z}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',title:'Night (N): Krator\'s own life glows',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'throne',title:'Krator biome — the Throne',
 hint:"The Throne, station 1: the plume's edge on the south-east shoulder (~1.9 km). A rift of cinder cones, a pit crater's acid lake and steaming vents; lava flows of every age; the shoulder's familiar trees giving way, under the plume, to Krator's own life (ideal type) · N night",
 scene,camera,renderer,ground:terrainH,floor:(x,z)=>Math.max(terrainH(x,z),waterH(x,z)),clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 onView:goLight,controls:LCTL,keys:{n:()=>setLightMode(LIGHT_MODE==='night'?'day':'night')},
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 setLightMode,
 biome:()=>window._biome,
 flows:()=>({flows:FLOWS.flows.map(f=>({key:f.key,age:f.age,cells:f.cells,steps:f.path.length})),shares:FLOWS.shares()}),
 // the climate at a point, for the probe and for --eval: the fields, the flow and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),age:FLOWS.ageAt(x,z),thick:FLOWS.thickAt(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
