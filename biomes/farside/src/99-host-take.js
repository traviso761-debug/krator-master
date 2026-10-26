// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what
// this page has. The same file for every station: the views are the station's (STAGE.viewList, in coast coordinates, heights
// over the ground) and views found from what was built (a kelp stand, each kind of work, a snag, a native tree).
const VIEWS={};
(function(){const top=(x,z)=>Math.max(terrainH(x,z),SEA?SEA.level:-1e9);   /* over the ground, or over the sea */
 const V=(cu,cv,cy,tu,tv,ty)=>{const c=STAGE.XZ(cu,cv),t=STAGE.XZ(tu,tv);return[c[0],top(c[0],c[1])+cy,c[1],t[0],top(t[0],t[1])+ty,t[1]];};
 (STAGE.viewList||[]).forEach(v=>{VIEWS[v[0]]=V(v[1],v[2],v[3],v[4],v[5],v[6]);});
 const w=BIO.host.farside.wind,near=(L,x,z)=>L.slice().sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
 const k=near(FARSIDE.STANDS.filter(T=>T.key==='landkelp'&&T.lv===2&&T.H>22&&T.form==='giant'),0,0);
 if(k)VIEWS['Under the land kelp (a stand)']=[k.x-w[0]*14+w[1]*6,k.y0+3,k.z-w[1]*14-w[0]*6,k.x,k.y0+k.H*.6,k.z];
 const b=near(FARSIDE.STANDS.filter(T=>T.key==='landkelp'&&T.lv===2&&T.form==='bull'),0,0);
 if(b)VIEWS['A bull kelp']=[b.x+w[1]*9,b.y0+b.H*.8,b.z-w[0]*9,b.x,b.y0+b.H*.85,b.z];
 const s=near(FARSIDE.STANDS.filter(T=>T.key==='snag'),0,0);
 if(s)VIEWS['A drowned kauri (the dead at the front)']=[s.x-w[0]*30,s.y0+8,s.z-w[1]*30,s.x,s.y0+s.H*.6,s.z];
 if(typeof NWLOW!=='undefined'&&NWLOW.TREES&&NWLOW.TREES.length&&STAGE.natives){const n=near(NWLOW.TREES.filter(T=>T.lv===2),0,0);
  if(n)VIEWS['A native tree in the fog (sponges and wine weed)']=[n.x+12,n.y0+4,n.z+9,n.x,n.y0+n.H*.35,n.z];}
 const seen={};WORKS.forEach(o=>{if(seen[o.kind])return;seen[o.kind]=1;const r=Math.max(10,o.r*2.4);
  VIEWS['The works: '+({kelpkiln:'a kelp kiln',limekiln:'a lime kiln',wrackheap:'a wrack heap',wrackcart:'a wrack cart',terraces:'the walled terraces',fold:'a goat fold',rack:'a drying rack'}[o.kind]||o.kind)]=
   [o.x-w[0]*r+w[1]*r*.5,o.y+Math.max(4,o.r*.8),o.z-w[1]*r-w[0]*r*.5,o.x,o.y+1,o.z];});})();

// ---------------------------------------------------------------- the inspector's words: a plant names its species, what it yields, the zone
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1200)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,'').replace(/^.*\|/,''):null;
 const S=(item&&FARSIDE.speciesOfItem(item))||(best&&FARSIDE.byKey[best.key])||null,hv=S&&S.tags.harvest,Z=FARSIDE.zones(p.x,p.z);
 const zone=['strand','kelpcoast','front','cloud','lee'].map(k=>[k,Z[k]]).sort((a,b)=>b[1]-a[1])[0];
 return (S?S.name+(S.model?'  ('+S.model+')':''):best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+(best&&S&&best.name!==S.name?'  ·  '+best.name:'')+
  (hv?'\nharvest: edible '+(hv.edible.join(', ')||'none')+(hv.uses.length?' · '+hv.uses.join(', '):'')+(hv.crop?' · crop '+hv.crop:''):'')+
  (best&&best.tags&&best.tags.culture?'\n'+best.tags.culture+' furniture · job '+best.tags.job+' (to backport: kits/eternian)':'')+
  '\nzone '+zone[0]+' · spray '+Z.spray.toFixed(2)+' · invade '+Z.inv.toFixed(2)+' · front '+Z.front.toFixed(2)+' · fog '+Z.fog.toFixed(2)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:16000000,calls:460},   /* Korona's (2026-10-26: the kelp forest's understorey and the 3D coral raised it) */
 cls:{pass:9000000,host:2500000},
 type:{'farside/stands':'pass','farside/floor':'pass','farside/dress':'pass','nwlow/trees':'pass','nwlow/floor':'pass','host':'host'},
};
// the crops kits/crops files Farside's yields under (kits/crops/src/20-crop-records.js, 22-crop-material.js: the farside rows)
const FARSIDE_CROPS=['kelp','wineweed','sea-lettuce','sea-grapes','coral-lime','eelgrass','kelp-ash'];
const instOf=re=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome||!re.test(M.name))return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push({x:p.x,y:p.y,z:p.z,q:q.clone(),name:M.name});}});return o;};
const HCHK={
 // harvest: every species carries a harvest tag, and every edible one names a crop kits/crops files it under
 harvest(SP,crops){const miss=SP.filter(S=>!S.tags.harvest).map(S=>S.key),nocrop=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&crops.indexOf(S.tags.harvest.crop)<0).map(S=>S.key);
  return{ok:!miss.length&&!nocrop.length,detail:(miss.length?'no harvest tag: '+miss.join(', ')+'; ':'')+(nocrop.length?'edible but no crop: '+nocrop.join(', ')+'; ':'')+SP.length+' species; crops '+crops.join(', ')};},
 // THE BLADES STREAM INLAND (PLAN.md section 3): a blade's hanging axis (its local -y) leans down the onshore wind
 stream(B,wind){if(!B.length)return{ok:!STAGE.fields.invade(0,0),detail:'no blades drawn (no land kelp on this page)'};const d=new THREE.Vector3();let down=0;
  B.forEach(b=>{d.set(0,-1,0).applyQuaternion(b.q);if(d.x*wind[0]+d.z*wind[1]>0)down++;});
  return{ok:down/B.length>.85,detail:down+' of '+B.length+' blades lean down the wind ('+(100*down/B.length).toFixed(0)+'%, at least 85%)'};},
 // nothing of the sea's flora stands in the sea or the stream, and no kelp stand on the sand, the coral or the surf rock
 place(ST){const bad=ST.filter(T=>T.key==='landkelp'&&(waterMask(T.x,T.z)<.5||F.sand(T.x,T.z)>.5||F.coral(T.x,T.z)>.6||F.rock(T.x,T.z)>.6));
  return{ok:!bad.length&&(ST.some(T=>T.key==='landkelp')||!STAGE.fields.invade(0,0)),detail:bad.length?bad.length+' stands misplaced, first at '+bad[0].x.toFixed(0)+','+bad[0].z.toFixed(0):ST.length+' stands, none in the water, on the sand, the coral or the rock'};},
 // the works: every one the station names is drawn and registered as Eternian furniture (to be backported)
 works(W,R){const named=(STAGE.works||[]).length,rec=R.filter(r=>r.tags&&r.tags.culture==='eternian'&&r.cls==='furniture');
  return{ok:W.length===named&&rec.length===named,detail:W.length+' of '+named+' works drawn; '+rec.length+' registered as Eternian furniture'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('every species has a harvest; the edible ones a crop',HCHK.harvest(FARSIDE.SPECIES,FARSIDE_CROPS));
 add('the kelp blades stream inland on the wind',HCHK.stream(instOf(/blade[0-2]$/),BIO.host.farside.wind));
 add('the sea\'s flora placed on land, off the sand, the coral and the rock',HCHK.place(FARSIDE.STANDS));
 add('the works drawn and tagged as Eternian furniture',HCHK.works(WORKS,REG));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('an edible species with no crop',HCHK.harvest(FARSIDE.SPECIES,FARSIDE_CROPS.filter(c=>c!=='kelp')));
 {const B=instOf(/blade[0-2]$/);   /* a page with no blades (the fog belt) is handed one, hanging straight up the wind */
  add('blades streaming out to sea',HCHK.stream(B.length?B:[{q:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),new THREE.Vector3(1,0,1).normalize())}],BIO.host.farside.wind.map(v=>-v)));}
 {const p=SEA?STAGE.XZ(-1400,0):STREAM?STREAM.pts[STREAM.pts.length>>1]:[0,0];   /* in the sea, or in an inland station's stream */
  add('a kelp stand in the water',HCHK.place(FARSIDE.STANDS.concat([{key:'landkelp',x:p[0],z:p[1],y0:-10,H:30}])));}
 add('a work not registered',HCHK.works(WORKS,REG.filter(r=>!(r.tags&&r.tags.culture))));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.take({build:'farside',title:'Krator biome — '+STAGE.name,
 hint:STAGE.name+': the sea\'s plants come ashore (land kelp, storm wrack, spray coral, eelgrass, sea palms, wine weed, sea lettuce, fog sponges, anemones)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 /* the hour slider and run / hold in the panel (core/host shows them when the page takes the hour: onSet; the sky reads the clock
    each frame, so there is nothing more to do); the page opens at 10:00, in full daylight (the owner, 2026-10-26) */
 clock:{hour:STAGE.hour==null?10:STAGE.hour,onSet:h=>{}},draw:()=>SKY.render(),
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'works and ground':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
