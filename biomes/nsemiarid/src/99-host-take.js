// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says
// what this page has. The presets are FOUND on the map rather than typed: one sweep scores every preset by the kit's own
// zones, nearer the LOD spine preferred, and a tree preset frames the nearest record of its species.
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const SCORES={
 desert:(Z,x,z,ld)=>Z.desert*(1-Z.pan)-ld/3000,
 pan:(Z,x,z,ld)=>Z.pan*smooth(.4,.7,FIELD.salt(x,z))-ld/3000,
 steppe:(Z,x,z,ld)=>Z.steppe-ld/3000,
 med:(Z,x,z,ld)=>Z.med-ld/3000,
 forest:(Z,x,z,ld)=>Z.forest-ld/3000,
 tugai:(Z,x,z,ld)=>Z.tugai*(1-Z.pan)-ld/3000,
 strand:(Z,x,z,ld)=>FIELD.strand(x,z)*FIELD.bed(x,z)*(1-Z.pan)-ld/4000,
 ring:(Z,x,z,ld)=>FIELD.ring(x,z)-ld/4000};
const PLACE=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-3200;z<=3200;z+=50)for(let x=-3200;x<=3200;x+=50){const Z=NSEMIARID.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,x,z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>NSEMIARID.SPECIES.indexOf(NSEMIARID.byKey[k]);
function nearTree(key,x,z,minH,pred){return NSEMIARID.nearestTree(SPI(key),x,z,minH,pred)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.6,T.z];}
const W0=NSEMIARID.WIND,UPW=Math.atan2(-W0[1],-W0[0]);   // the camera upwind of a subject sees its downwind trail
const VIEWS={
 'From afar':look(-3300,3300,600,-300,-900,150),
 'The old lake bed and its strandlines':look(BED.x+1500,BED.z+1500,90,BED.x,BED.z,0),
 'The bathtub ring':look(PLACE.ring[0]-120*W0[0],PLACE.ring[1]-120*W0[1],10,PLACE.ring[0]+60,PLACE.ring[1]+40,0),
 'The salt pan':look(PLACE.pan[0]-80,PLACE.pan[1]+70,4,PLACE.pan[0]+60,PLACE.pan[1]-60,0),
 'Crescent saxaul groves':atTree(nearTree('saxaul',PLACE.desert[0],PLACE.desert[1]),45,UPW+.5,8),
 'Crawlers on the desert':look(PLACE.desert[0]-30,PLACE.desert[1]+30,3,PLACE.desert[0]+20,PLACE.desert[1]-20,0),
 'Golden poplar at the lake margin':atTree(nearTree('poplar',PLACE.tugai[0],PLACE.tugai[1],0,T=>!T.dead),40,1.2,4),
 'Dead poplars on the salt':atTree(nearTree('poplar',BED.x,BED.z,0,T=>!!T.dead),28,2.2,3),
 'The walking steppe':look(PLACE.steppe[0]-60,PLACE.steppe[1]+40,5,PLACE.steppe[0]+40,PLACE.steppe[1]-30,1),
 'Dandelion frills':atTree(nearTree('frill',PLACE.steppe[0],PLACE.steppe[1]),38,UPW,6),
 'Helicopter trumpets':atTree(nearTree('trumpet',PLACE.steppe[0],PLACE.steppe[1]),26,UPW+.4,4),
 'Pistachio parkland':atTree(nearTree('pistachio',PLACE.steppe[0],PLACE.steppe[1]),30,2.6,3),
 'Giant dandelions and foxtails':atTree(nearTree('dandelion',PLACE.steppe[0],PLACE.steppe[1]),10,UPW+.3,1.6),
 'Judas trees and almonds':atTree(nearTree('judas',PLACE.med[0],PLACE.med[1]),20,1.8,2.5),
 'The spring pool and its plane':[POOL.x-70,Math.max(POOL.lv+14,gh(POOL.x-70,POOL.z+60,6)),POOL.z+60,POOL.x,POOL.lv+8,POOL.z],
 'Drift lanterns':atTree(nearTree('lantern',PLACE.med[0],PLACE.med[1]),14,.6,2),
 'The feral fruit forest':atTree(nearTree('apple',PLACE.forest[0],PLACE.forest[1]),24,1.4,3),
 'Kite ash':atTree(nearTree('samara',PLACE.forest[0],PLACE.forest[1]),36,2.8,5),
};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&NSEMIARID.plantOfItem(item);
 const S=o.userData.species?NSEMIARID.byKey[o.userData.species]:(best&&best.key&&NSEMIARID.byKey[best.key]),tg=S?S.tags:(PLT?PLT.tags:null);
 if(o.userData.species)name=S.name+'  ·  a variant ('+o.name.replace('variant:','')+')';
 if(PLT&&!S)name=PLT.name+'  ·  '+lab+(PLT.travel&&PLT.travel!=='none'?'  ·  travels: '+PLT.travel:'');
 if(S&&S.travel)name+='  ·  travels: '+S.travel;
 const cls=S||isItem?'flora · n semiarid'+(S&&S.alien?' · alien (Krator\'s own)':''):'terrain / water';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:19500000,calls:700},
 cls:{pass:16000000,host:900000},
 type:{'nsemiarid/trees':'pass','nsemiarid/floor':'pass','nsemiarid/nursery':'pass','host':'host'},
};
// species that yield something edible the kit does not draw as a catalog fruit: named, not hidden (the catalog owes the
// fruit trees' pieces: KNOWN_ISSUES.md)
const FRUIT_NOT_DRAWN=['pistachio','judas','almond','apple','walnut','apricot','pear','poplar','frill','trumpet','pomegranate','foxtail','dandelion'];
const inst=(pat)=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;if(pat&&!pat.test(M.name))return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name,sc.y]);}});return o;};
const near2=(A,x,z,r)=>A.filter(a=>Math.abs(a[0]-x)<r&&Math.abs(a[2]-z)<r);
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 placed(C){const zero=NSEMIARID.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:C.length===NSEMIARID.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):C.length+' species, the scarcest '+Math.min(...C)};},
 tagged(SP){const reg=Object.keys(NSEMIARID.KOPPEN),bad=[];
  for(const S of SP){const t=S.tags||{},k=t.koppen||[];if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):SP.length+' species tagged (climate, aridity, abyssal, riparian, Koppen)'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on cliff faces':T.length+' trees, none on a bare rock face'};},
 fruit(SP,PL,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const n=P.filter(p=>/fruit|gourd/.test(p[3])).length,untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  return{ok:!miss.length&&!untagged.length&&n>=150,detail:(miss.length?'edible but not named: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+n+' fruit and gourd instances drawn'};},
 variants(V,T){if(!window._variants)return{ok:true,detail:'unique trees (?unique=1)'};const P=V.protos,sps=new Set(T.map(r=>r.sp)),miss=[];
  for(const sp of sps)for(const lv of [2,1,0])for(let v=0;v<V.K;v++)if(!P.has(sp+'|n|'+v+'|'+lv)&&!P.has(sp+'|s|'+v+'|'+lv)&&!P.has(sp+'|d|'+v+'|'+lv))miss.push(NSEMIARID.SPECIES[sp].key+' v'+v+' lv'+lv);
  return{ok:!miss.length&&V.stats.drawn>0,detail:(miss.length?'missing: '+miss.slice(0,6).join(', ')+'; ':'')+P.size+' prototypes for '+T.length+' trees; '+V.stats.drawn+' drawn here, '+V.stats.tris+' triangles, grown in '+V.stats.growMs+' ms'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};},
 // THE WALKING STEPPE: the travellers keep their headings
 // a crawler's trail runs upslope of its head (it grows toward water): the nearest dead segment stands higher
 crawlers(H,D){let ok=0,n=0;for(const h of H){const d=near2(D,h[0],h[2],3);if(!d.length)continue;let b=d[0],bd=1e9;for(const q of d){const e=Math.hypot(q[0]-h[0],q[2]-h[2]);if(e<bd){bd=e;b=q;}}n++;if(terrainH(b[0],b[2])>=terrainH(h[0],h[2])-.02)ok++;}
  return{ok:n>=30&&ok/n>=.8,detail:n?ok+' of '+n+' crawler heads lie downslope of their trails':'no crawlers'};},
 // tumbler drifts pile on the windward (upwind) face of the trees, the wind read where each tree stands
 drifts(Tb,T,wf){let up=0,n=0;for(const t of T){const near=near2(Tb,t.x,t.z,4),w=wf(t.x,t.z);for(const b of near){const dx=b[0]-t.x,dz=b[2]-t.z;if(Math.hypot(dx,dz)>4)continue;n++;if(dx*w[0]+dz*w[1]<0)up++;}}
  return{ok:n>=20&&up/n>=.75,detail:n?up+' of '+n+' tumblers by a tree lie on its windward side':'no drifts'};},
 // step cones on the old bed: taller where the ground has been dry longer (a tier a wet year)
 cones(S){const pts=S.filter(s=>FIELD.bed(s[0],s[2])>.5);if(pts.length<30)return{ok:false,detail:pts.length+' step cones on the bed'};
  const xs=pts.map(s=>FIELD.dry(s[0],s[2])),ys=pts.map(s=>s[4]),mx=xs.reduce((a,b)=>a+b)/xs.length,my=ys.reduce((a,b)=>a+b)/ys.length;
  let sxy=0,sxx=0,syy=0;for(let i=0;i<xs.length;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2;syy+=(ys[i]-my)**2;}const r=sxy/Math.sqrt(sxx*syy||1);
  return{ok:r>.5,detail:pts.length+' step cones on the bed, height against years dry r = '+r.toFixed(2)};},
 // the saxaul stands only on its groves' crescents
 crescents(T){const bad=T.filter(t=>NSEMIARID.crescentAt(t.x,t.z)[0]<=0);return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' saxaul off a crescent':T.length+' saxaul, every one on a grove\'s arc'};},
 // THE WATER (core/water): the stream sits in its channel, both banks over its surface a pace either side of its line
 banks(F,lift){const P=F.pts;let bad=0,n=0,worst=0;for(let i=0;i<P.length;i+=2){const p=P[i],y=p.y+(lift||0),s=Math.max(y-terrainH(p.x-SW*1.05,p.z),y-terrainH(p.x+SW*1.05,p.z));n++;if(s>.15)bad++;worst=Math.max(worst,s);}
  return{ok:n>50&&bad/n<=.02,detail:bad+' of '+n+' stream sections spill over a bank (worst '+worst.toFixed(1)+' m)'};},
 // THE WIND (core/atmos): stepped on the module's own clock, a gale tears the winged seeds loose and a calm holds them
 gale(hold){if(typeof FLIGHT==='undefined'||!FLIGHT)return{ok:false,detail:'no seed flight (?seeds=0)'};
  const B=FLIGHT.BEAR,keep={},mode=NSWIND.mode,sc=ATMOS.windScale,heli=()=>(window._seeds.bySpecies.trumpet||0)+(window._seeds.bySpecies.samara||0);
  if(hold!=null)for(const k in B){keep[k]=B[k].hold;B[k].hold=hold;}
  const lan=()=>window._seeds.bySpecies.lantern||0;
  const run=m=>{NSWIND.set(m);ATMOS.windScale=NSWIND.SCALE[m];const h0=heli(),a0=window._seeds.released,l0=lan();for(let i=0;i<80;i++)for(const f of TICKS.slice())f(.15,0);return[heli()-h0,window._seeds.released-a0,lan()-l0];};   // 12 s of the module's clock a run
  const tr=nearTree('trumpet',PLACE.steppe[0],PLACE.steppe[1]),ln=nearTree('lantern',PLACE.steppe[0],PLACE.steppe[1]);
  let calm,high,lc,lh;try{FLIGHT.pin={x:tr.x,z:tr.z};calm=run('calm');high=run('high');   // a trumpet grove, wherever the camera is
   FLIGHT.pin={x:ln.x,z:ln.z};lc=run('calm');lh=run('high');}   // and a stand of drift lanterns: they go the other way
  finally{for(const k in keep)B[k].hold=keep[k];NSWIND.set(mode);ATMOS.windScale=sc;FLIGHT.pin=null;}
  return{ok:calm[0]===0&&high[0]>=20&&lc[2]>=3&&lh[2]===0,detail:'12 s of calm: '+calm[0]+' winged seeds loose ('+calm[1]+' in all); 12 s of high wind: '+high[0]+' ('+high[1]+' in all); lanterns lifting: '+lc[2]+' in the calm, '+lh[2]+' in the gale'};},
 // the trumpets' crowns are drawn with their pivot, so the spin turns them about the stalk
 // (every grown trumpet prototype with a crown, near or mid, carries the pivot; the far impostor has no crown)
 spin(protos){if(!window._variants)return{ok:true,detail:'unique trees (?unique=1): drawn still'};const sp=SPI('trumpet');let n=0,ok=0;
  for(const [k,P] of protos){const [s,,,lv]=k.split('|');if(+s!==sp||lv==='0')continue;n++;if(P.parts.some(q=>q.geo.attributes.aPivot))ok++;}
  return{ok:n>0&&ok===n,detail:ok+' of '+n+' trumpet prototypes turn their crown on its pivot'};},
 // the wind-shaped trees (the saxaul's lean, the frill's shed side, the dandelion's balding) are drawn turned so the wind
 // they were grown in lies along the wind where they stand: R = [x, z, the turn drawn]
 facing(R){const w0=NSEMIARID.windAt(0,0),p0=Math.atan2(w0[1],w0[0]);let bad=0;
  for(const r of R){const w=NSEMIARID.windAt(r[0],r[1]);let d=(p0-r[2])-Math.atan2(w[1],w[0]);d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)>.4)bad++;}
  return{ok:R.length>=20&&!bad,detail:bad?bad+' of '+R.length+' wind-shaped trees turned off the wind':R.length+' wind-shaped trees drawn here, each within 0.4 rad of the wind where it stands'};},
 // the furlers: placed open and shut by the gusts on the GPU (the material carries core/atmos's gust)
 furlers(meshes,shut){const live=meshes.filter(m=>m.userData.liveGusts).length;
  return{ok:meshes.length>0&&live===meshes.length&&shut===0,detail:meshes.length+' furler meshes, '+live+' shutting with core/atmos\'s gusts; '+shut+' placed shut as a still frame'};},
 // dead golden poplars stand on the salt behind the living forest
 deadPoplars(T){const bad=T.filter(t=>t.dead&&FIELD.salt(t.x,t.z)<.2&&NSEMIARID.zones(t.x,t.z).pan<.2);const dead=T.filter(t=>t.dead).length;
  return{ok:dead>0&&!bad.length,detail:bad.length?bad.length+' dead poplars off the salt':dead+' dead poplars, all on the salt'};}};
// the wind-shaped trees drawn now, [x, z, the turn], from the variants' pools; and the furlers' meshes
function windShapedDrawn(){const o=[];for(const p of VARIANTS.pools.values()){if(!NSEMIARID.SPECIES[p.sp].windShaped)continue;
 for(let i=0;i<p.n;i++){const m=p.arr,k=i*16;o.push([m[k+12],m[k+14],Math.atan2(m[k+8],m[k])]);}}return o;}
function furlerMeshes(){const o=[];scene.traverse(m=>{if(m.isInstancedMesh&&m.name==='biome:furler')o.push(m);});return o;}
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=inst(),T=NSEMIARID.TREES;
 add('every species placed',HCHK.placed(NSEMIARID.COUNTS||[]));
 add('every species tagged with its Koppen classes',HCHK.tagged(NSEMIARID.SPECIES));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a bare rock face',HCHK.cliffs(T));
 if(typeof VARIANTS!=='undefined')add('trees drawn as shared variants',HCHK.variants(VARIANTS,T));
 add('fruit tagged and drawn',HCHK.fruit(NSEMIARID.SPECIES,NSEMIARID.PLANTS,P));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('crawlers grow downslope (their trails upslope)',HCHK.crawlers(inst(/^biome:crawler$/),inst(/crawlerDead/)));
 add('tumbler drifts on the windward faces',HCHK.drifts(inst(/tumbler/),T,NSEMIARID.windAt));
 add('step cones read the years dry',HCHK.cones(inst(/stepcone/)));
 add('saxaul on its crescents',HCHK.crescents(T.filter(t=>t.sp===SPI('saxaul'))));
 add('dead poplars on the salt',HCHK.deadPoplars(T.filter(t=>t.sp===SPI('poplar'))));
 add('the stream sits in its banks (core/water)',HCHK.banks(STREAM));
 add('the trumpets turn on a pivot',HCHK.spin(VARIANTS.protos));
 add('a gale tears the winged seeds loose, a calm holds them; the lanterns the other way (core/atmos)',HCHK.gale());
 if(window._variants)add('wind-shaped trees face the wind where they stand',HCHK.facing(windShapedDrawn()));
 add('the furlers shut with the gusts (core/atmos)',HCHK.furlers(furlerMeshes(),(window._biome&&window._biome.under&&window._biome.under.furlersShut)||0));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=inst(),T=NSEMIARID.TREES;
 const C=(NSEMIARID.COUNTS||[]).slice();C[SPI('lantern')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no Koppen classes',HCHK.tagged(NSEMIARID.SPECIES.map((S,i)=>i===3?Object.assign({},S,{tags:Object.assign({},S.tags,{koppen:[]})}):S)));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},NSEMIARID.SPECIES[0],{tags:Object.assign({},NSEMIARID.SPECIES[0].tags,{koppen:['EF']})})]));
 add('a plant on the lake bed under the water',HCHK.dry([[BED.x,LAKE.level-6,BED.z,'test']]));
 if(window._variants)add('a species with no variants grown',HCHK.variants({K:VARIANTS.K,protos:new Map(),stats:VARIANTS.stats},T));
 add('a fruiting species not named',HCHK.fruit(NSEMIARID.SPECIES.map(S=>S.key==='apple'?Object.assign({},S,{key:'apple?'}):S),NSEMIARID.PLANTS,P));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 // the crawlers turned round: heads swapped with their trails
 {const H=inst(/^biome:crawler$/),D=inst(/crawlerDead/);add('crawlers growing uphill',HCHK.crawlers(D.slice(0,H.length*3),H));}
 add('drifts against the wind turned round',HCHK.drifts(inst(/tumbler/),T,(x,z)=>{const w=NSEMIARID.windAt(x,z);return[-w[0],-w[1]];}));
 {const S=inst(/stepcone/),ys=S.map(s=>s[4]).reverse();add('step cones heights shuffled',HCHK.cones(S.map((s,i)=>[s[0],s[1],s[2],s[3],ys[i]])));}
 {let off=null;for(let z=-1000;z<1000&&!off;z+=7)for(let x=-1000;x<1000;x+=7)if(NSEMIARID.crescentAt(x,z)[0]<=0){off={x,z};break;}add('a saxaul off its crescent',HCHK.crescents([off]));}
 add('a dead poplar on the steppe',HCHK.deadPoplars([{x:PLACE.steppe[0],z:PLACE.steppe[1],dead:true}]));
 add('the stream lifted 3 m over its banks',HCHK.banks(STREAM,3));
 add('a gale that tears nothing loose',HCHK.gale(1e9));
 if(window._variants){const R=windShapedDrawn();add('wind-shaped trees turned at random',HCHK.facing(R.map((r,i)=>[r[0],r[1],r[2]+1+(i%5)])));}
 add('furlers placed shut, a still frame',HCHK.furlers(furlerMeshes(),12));
 if(window._variants){const M=new Map();for(const [k,P] of VARIANTS.protos)M.set(k,{parts:P.parts.map(q=>({geo:{attributes:{}}}))});add('trumpet crowns with no pivot',HCHK.spin(M));}
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'nsemiarid',title:'Krator biome — the northern semiarid country',
 hint:'The walking steppe: an old lake bed with its strandlines and a remnant salt lake in the north, the hot steppe, the Mediterranean foothills and the feral fruit forest on the rainy upland in the south; everything here travels (ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances+'  wind '+NSWIND.mode+' '+NSWIND.mean().toFixed(1)+' m/s',controls:[WIND_CONTROL],
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'seed weather':{objects:()=>(SEEDS?[SEEDS.points]:[]).concat(FLIGHT?FLIGHT.meshes:[])},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals(),nu=BIO.stats['nsemiarid/nursery'],v=window._variants&&typeof VARIANTS!=='undefined'?VARIANTS.stats:null;
  return {tris:t.tris-(nu?nu.tris:0)+(v?v.tris:0),inst:t.inst-(nu?nu.inst:0)+(v?v.drawn:0),meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 variants:()=>typeof VARIANTS!=='undefined'?VARIANTS.stats:null,
 biome:()=>window._biome,
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=NSEMIARID.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
