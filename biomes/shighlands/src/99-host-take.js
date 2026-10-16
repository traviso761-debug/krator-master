// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are FOUND on the map rather than typed: the best point of each zone near the spine, and a tree preset
// frames the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>SHIGH.SPECIES.indexOf(SHIGH.byKey[k]);
const SCORES={
 forest:(Z,ld)=>Z.forest*(1-Z.ravine)-ld/3000,ravine:(Z,ld)=>Z.ravine*Z.forest-ld/3000,elfin:(Z,ld)=>Z.elfin-ld/3000,
 paramo:(Z,ld)=>Z.paramo*(1-Z.crag)-ld/3000,bog:(Z,ld)=>Z.bog-ld/3000,dry:(Z,ld)=>Z.dry-ld/3000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-2400;z<=2400;z+=50)for(let x=-2400;x<=2400;x+=50){if(Math.hypot(x,z)>2350)continue;if(BIO.mask(x,z)<=0)continue;const Z=SHIGH.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
function nearTree(key,x,z,minH,hand){return SHIGH.nearestTree(SPI(key),x,z,minH,hand?{hand}:null)||SHIGH.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.6:ty),T.z];}
// from a point, looking a given way across the ground
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
const W0=TOR[0],MIR=SHIGH.mirrorAt[0]||{x:0,z:-1200};
// over the rim: from the paramo's edge, looking north over the cloud forest to the cloud sea and the Throne
const RIMX=-300,RIMZ=rimZ(-300);
const VIEWS={
 'The paramo':(function(){const T=nearTree('groundsel',P.paramo[0],P.paramo[1],5.5);return atTree(T,34,2.3,2.4,.25);})(),
 'Above the cloud sea':(function(){const z=RIMZ+150;return[RIMX,gh(RIMX,z,22),z,RIMX-80,CLOUD_Y+30,RIMZ-700];})(),
 'The cloud forest':across(P.forest[0],P.forest[1],-1.2,60,2,5),
 'Spiral trumpets':atTree(nearTree('trumpet',P.forest[0],P.forest[1],16),26,.8,3,.6),
 'A volute tree':atTree(nearTree('volute',P.forest[0],P.forest[1],20),42,2.4,6,.7),
 'Crozier tree ferns in a ravine':atTree(nearTree('crozier',P.ravine[0],P.ravine[1],5),9,1.6,1.8,.8),
 'Screw palms by the stream':atTree(nearTree('screwpine',P.ravine[0],P.ravine[1],8),18,2.2,2,.55),
 'The mirror-handed coilbark':atTree(nearTree('coilbark',MIR.x,MIR.z,0,-1),20,1.2,2.2,.45),
 'Coilbark':atTree(nearTree('coilbark',P.elfin[0],P.elfin[1],10),22,.4,2.5,.5),
 'Begonias and fiddleheads':(function(){const x=P.forest[0]+12,z=P.forest[1]+8;return[x,gh(x,z,1.3),z,x+4,gh(x+4,z-3,.1),z-3];})(),
 'A ruffle-crown':atTree(nearTree('ruffle',P.paramo[0],P.paramo[1],8),15,2.0,3,.85),
 'A spiral frill tree':atTree(nearTree('frill',P.elfin[0],P.elfin[1],18),26,1.1,4,.55),
 'Giant groundsels':atTree(nearTree('groundsel',P.paramo[0],P.paramo[1],5),14,-.6,1.8,.6),
 'Lobelias in the bog':atTree(nearTree('lobelia',P.bog[0],P.bog[1],3.5),9,1.0,1.3,.5),
 'Spiral aloes on the dry side':(function(){const T=nearTree('aloe',P.dry[0],P.dry[1]);return atTree(T,2.4,.7,1.5,.1);})(),
 'Corkscrew cereus':atTree(nearTree('cereus',P.dry[0],P.dry[1],4.5),12,2.6,2,.6),
 'The Whorl Stone':look(W0.x+W0.r*2.3,W0.z+W0.r*1.2,14,W0.x,W0.z,W0.h*.5),
 'The tarn':(function(){const x=TARN.x+TARN.r*2.6,z=TARN.z+TARN.r*1.8;return[x,Math.max(gh(x,z,3),TARNL+9),z,TARN.x,TARNL+1,TARN.z];})(),
 'From afar':look(-2300,2300,160,300,-900,40),
};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the classification and the tags (README.md, DEV TOOLS): a plant is flora of this kit, with its species' tags
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&SHIGH.plantOfItem(item);
 const S=best&&best.key&&SHIGH.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem?'flora · southern highlands'+(S&&S.alien?' · alien':''):'terrain / water';
 const hand=best&&best.hand!=null?(best.hand<0?'  ·  MIRROR-HANDED':'  ·  right-handed'):'';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · spiral: '+tg.spiral+hand+' · Koppen '+tg.koppen.join(' '):'')+
  (S&&S.how?'\n'+S.how:'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nin cloud '+(FIELD.fog(p.x,p.z)*100|0)+'% of days\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:19500000,calls:120},   // measured 18.5M at q=1 on this 5.2 km map (2026-10-06), not a target
 cls:{pass:14000000,host:900000},
 type:{'shigh/trees':'pass','shigh/floor':'pass','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // every species of the table is placed somewhere on the stage
 placed(C){const zero=SHIGH.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:C.length===SHIGH.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):C.length+' species, the scarcest '+Math.min(...C)};},
 // EVERYTHING SPIRALS: every species and every floor plant carries its tags and one of the four kinds of spiral, the
 // Koppen classes inside the region's
 tagged(SP,PL){const reg=Object.keys(SHIGH.KOPPEN),bad=[];
  for(const S of SP.concat(PL)){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||SHIGH.SPIRALS.indexOf(t.spiral)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged, without a spiral, or tagged outside the region: '+bad.join(', '):SP.length+' species and '+PL.length+' floor plants tagged, each with its spiral'};},
 // ONE HAND: every tree right-handed but the mirror-handed few, and at least one of those (the showcase plants one)
 hands(T){const mir=T.filter(t=>t.hand<0).length,bad=T.filter(t=>t.hand!==1&&t.hand!==-1).length,share=T.length?mir/T.length:0;
  return{ok:!bad&&mir>=1&&share<.02,detail:(bad?bad+' trees with no hand; ':'')+mir+' mirror-handed of '+T.length+' ('+(share*100).toFixed(2)+'%)'};},
 // the cloud forest stands in the cloud: most cloud-forest trees where the fog field is high, the paramo's rosette trees
 // above it
 cloud(T){const cf=['coilbark','trumpet','volute','crozier','frill'].map(SPI),pr=['groundsel','ruffle'].map(SPI);
  const a=T.filter(t=>cf.indexOf(t.sp)>=0),b=T.filter(t=>pr.indexOf(t.sp)>=0),fa=a.filter(t=>t.fog>.3).length/Math.max(1,a.length),fb=b.filter(t=>t.fog<.6).length/Math.max(1,b.length);
  return{ok:a.length>0&&b.length>0&&fa>.85&&fb>.85,detail:'cloud-forest trees in cloud '+(fa*100).toFixed(1)+'%, paramo trees above it '+(fb*100).toFixed(1)+'%'};},
 // nothing roots under the water: no instance's origin more than a metre under the local surface (rush stands in 0.4 m)
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // nothing grows under the cloud deck's floor: no tree below the deck by more than its lower layer (the jungle is not drawn)
 deck(T){const bad=T.filter(t=>t.y0<CLOUD_Y-60);return{ok:!bad.length,detail:bad.length?bad.length+' trees under the deck (first '+SHIGH.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].y0|0,bad[0].z|0]+')':T.length+' trees, none lost under the cloud'};},
 // no tree on a sheer rock face (the tors' steepest granite)
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on sheer rock (first '+SHIGH.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a sheer face'};},
 // THE CLOUD DECK is the shared module's and is exported for a game engine: one record, and the field's top inside its
 // band [y-down, y+up] everywhere
 clouddeck(R,hf){const P=ATMOS.PRESETS.clouddeck,r=R.filter(f=>f.type==='clouddeck');let lo=1e9,hi=-1e9;
  for(let i=0;i<400;i++){const x=-2500+(i%20)*263,z=-2500+Math.floor(i/20)*263,t=i*7.3,v=hf(x,z,t);lo=Math.min(lo,v);hi=Math.max(hi,v);}
  const ok=r.length===1&&lo>=CLOUD_Y-P.down-1e-6&&hi<=CLOUD_Y+P.up+1e-6&&hi-lo>P.up*.5;
  return{ok,detail:r.length+' deck record(s); the top ranges '+lo.toFixed(1)+' .. '+hi.toFixed(1)+' m (band '+(CLOUD_Y-P.down)+' .. '+(CLOUD_Y+P.up)+')'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('every species placed',HCHK.placed(SHIGH.COUNTS||[]));
 add('every plant tagged with its spiral',HCHK.tagged(SHIGH.SPECIES,Object.values(SHIGH.PLANTS)));
 add('one hand: every spiral right-handed but the rare mirror',HCHK.hands(SHIGH.TREES));
 add('the cloud forest in the cloud, the paramo above it',HCHK.cloud(SHIGH.TREES));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree under the cloud deck',HCHK.deck(SHIGH.TREES));
 add('no tree on a sheer rock face',HCHK.cliffs(SHIGH.TREES));
 add('the cloud deck: shared, exported, inside its band',HCHK.clouddeck(ATMOS.fx,(x,z,t)=>ATMOS.deckHeight(x,z,t,CLOUD_Y)));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(SHIGH.COUNTS||[]).slice();C[SPI('aloe')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no spiral',HCHK.tagged(SHIGH.SPECIES.map((S,i)=>i===2?Object.assign({},S,{tags:Object.assign({},S.tags,{spiral:null})}):S),[]));
 add('a floor plant with a made-up spiral',HCHK.tagged([],[Object.assign({},SHIGH.PLANTS.moss,{tags:Object.assign({},SHIGH.PLANTS.moss.tags,{spiral:'zigzag'})})]));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},SHIGH.SPECIES[0],{tags:Object.assign({},SHIGH.SPECIES[0].tags,{koppen:['Af']})})],[]));
 add('no mirror-handed tree',HCHK.hands(SHIGH.TREES.map(t=>Object.assign({},t,{hand:1}))));
 add('half the trees mirror-handed',HCHK.hands(SHIGH.TREES.map((t,i)=>Object.assign({},t,{hand:i%2?-1:1}))));
 add('the cloud forest out of the cloud',HCHK.cloud(SHIGH.TREES.map(t=>Object.assign({},t,{fog:0}))));
 add('a plant on the tarn bed',HCHK.dry([[TARN.x,TARNL-2.5,TARN.z,'test']]));
 add('a tree under the deck',HCHK.deck([{x:0,y0:CLOUD_Y-200,z:-2500,sp:0}]));
 // the steepest granite on the Whorl Stone (found, not typed)
 {let bx=TOR[0].x,bz=TOR[0].z,bs=-1;for(let z=TOR[0].z-200;z<=TOR[0].z+200;z+=4)for(let x=TOR[0].x-200;x<=TOR[0].x+200;x+=4){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}
  add('a tree on the tor\'s sheer face',HCHK.cliffs([{x:bx,z:bz,sp:0}]));}
 add('a deck not recorded',HCHK.clouddeck([],(x,z,t)=>ATMOS.deckHeight(x,z,t,CLOUD_Y)));
 add('a deck that rises out of its band',HCHK.clouddeck(ATMOS.fx,(x,z,t)=>ATMOS.deckHeight(x,z,t,CLOUD_Y)+60));
 add('a camera under the tarn',HCHK.camerasOut([{view:'under',x:TARN.x,y:TARNL-5,z:TARN.z}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.take({build:'shighlands',title:'Krator biome — the southern highlands',
 hint:"The southern highlands: the spiral biome. A cloud forest on the Inner Wall's scarp where the cloud sea laps against it, and above the cloud a paramo of giant rosettes; every plant grows in a spiral, and every spiral turns the same way (ideal type)",
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,
 // the atmosphere's export (core/atmos/GODOT.md): the cloud deck's record and its presets, for the Godot importer
 atmos:()=>ATMOS.export(),
 // the climate at a point, for the probe and for --eval: the fields and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=SHIGH.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
