// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are FOUND on the map rather than typed: a plant preset frames the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>EHIGH.SPECIES.indexOf(EHIGH.byKey[k]);
function nearTree(key,x,z,minH,o){return EHIGH.nearestTree(SPI(key),x,z,minH,o)||EHIGH.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:3,crownR:2};}
// a camera d metres from a plant on bearing az (radians, x east z south), looking at it
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,1.6),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.5:ty),T.z];}
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
const GAZ=Math.atan2(GZ,GX),SAZ=Math.atan2(SUNP[2],SUNP[0]);   // the bearings (x east z south) of the giant and the sun
// the best point of a zone near the spine (scored by the kit's zones on a 40 m sweep)
const P=(function(){const S={gully:Z=>Z.gully,scree:Z=>Z.scree,fell:Z=>Z.fell,dry:Z=>Z.dry,bog:Z=>Z.bog};const best={},bs={};for(const k in S){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-2400;z<=2400;z+=40)for(let x=-2400;x<=2400;x+=40){if(Math.hypot(x,z)>2300)continue;const Z=EHIGH.zones(x,z),ld=BIO.lodD(x,z);for(const k in S){const s=S[k](Z)-ld/2000;if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const WG=GULLY[0],WGZ=zF(WG.x0)+330;
const VIEWS={
 'The Mother Cushion, under the giant':(function(){const cx=MOTHER.x-GX*820-GZ*120,cz=MOTHER.z-GZ*820+GX*120;return[cx,gh(cx,cz,5),cz,MOTHER.x+GX*60,gh(MOTHER.x,MOTHER.z,10),MOTHER.z+GZ*60];})(),
 'On the Mother Cushion':(function(){const x=MOTHER.x-GX*90+40,z=MOTHER.z-GZ*90+30;return[x,gh(x,z,4.5),z,x+GX*60,gh(x+GX*60,z+GZ*60,2),z+GZ*60];})(),
 'Vigil spikes in flower':(function(){const T=nearTree('vigil',FLOWERING.x,FLOWERING.z,10,{stage:'flower'});return atTree(T,T.H*1.6,GAZ+Math.PI/2,2,.5);})(),
 'Every spike leans to the giant':(function(){const x=FLOWERING.x-GZ*-330,z=FLOWERING.z+GX*-330;return[x,gh(x,z,6),z,FLOWERING.x,gh(FLOWERING.x,FLOWERING.z,8),FLOWERING.z];})(),
 'Dead torches':(function(){const T=nearTree('vigil',FLOWERING.x+600,FLOWERING.z,8,{stage:'torch'});return atTree(T,T.H*1.3,GAZ+Math.PI*.6,2.5,.45);})(),
 'Glass towers, backlit':(function(){const T=nearTree('glasstower',P.scree[0],P.scree[1],2.6);return atTree(T,6,SAZ+Math.PI,.9,.55);})(),
 'Wormwick in the turf':(function(){const W=EHIGH.WICKS||[];const w=W.slice().sort((a,b)=>BIO.lodD(a[0],a[1])-BIO.lodD(b[0],b[1]))[0]||[P.fell[0],P.fell[1]];return[w[0]+1.2,gh(w[0]+1.2,w[1]+.7,.6),w[1]+.7,w[0],gh(w[0],w[1],.05),w[1]];})(),
 'Tower honey on the cliff':(function(){const c=(EHIGH.COMBS||[]).slice().sort((a,b)=>BIO.lodD(a[0],a[2])-BIO.lodD(b[0],b[2]))[0];if(!c)return look(WG.x0+60,WGZ,4,WG.x0,WGZ,3);
  const e=1.5,gx=terrainH(c[0]+e,c[2])-terrainH(c[0]-e,c[2]),gz=terrainH(c[0],c[2]+e)-terrainH(c[0],c[2]-e),gl=Math.hypot(gx,gz)||1,nx=-gx/gl,nz=-gz/gl;
  const cx=c[0]+nx*5-nz*1.5,cz=c[2]+nz*5+nx*1.5;return[cx,Math.max(gh(cx,cz,1.4),c[1]-.3),cz,c[0],c[1]-.5,c[2]];})(),
 'A ragbark gully':(function(){const z0=WGZ-120,z1=WGZ+260;return[xg(WG,z0),gh(xg(WG,z0),z0,7),z0,xg(WG,z1),gh(xg(WG,z1),z1,6),z1];})(),
 'Ragbark':(function(){const T=nearTree('ragbark',xg(WG,WGZ),WGZ,7);return atTree(T,12,GAZ+Math.PI/2,2,.5);})(),
 'Poured cushions over the boulders':(function(){const T=nearTree('cushion',P.fell[0],P.fell[1],0,{minR:3.5});return atTree(T,T.crownR*3,GAZ+Math.PI*.75,2.2,.2);})(),
 'Woolbacks on the fell':(function(){const T=nearTree('woolback',P.fell[0],P.fell[1]);return atTree(T,7,GAZ+Math.PI*1.3,1.8,.3);})(),
 'Thorn cushions in flower':(function(){const T=nearTree('thorn',P.dry[0],P.dry[1]);return atTree(T,4.5,GAZ,1.4,.4);})(),
 'Hoar cereus':(function(){const T=nearTree('cereus',P.dry[0],P.dry[1]);return atTree(T,8,GAZ+Math.PI/2,1.8,.55);})(),
 'The bofedal and the frozen tarn':(function(){const x=BOG.x+380,z=BOG.z+60;return[x,gh(x,z,7),z,TARN.x,TARNL+2,TARN.z];})(),
 'The geyser field':(function(){const x=GEO.x-260,z=GEO.z+200;return[x,gh(x,z,14),z,VENTS[0].x,VENTS[0].y+8,VENTS[0].z];})(),
 'From afar':look(-900,-2400,260,300,600,60),
};
// ---------------------------------------------------------------- the inspector's words
const BEAR=v=>{const a=(Math.atan2(v[0],-v[1])*180/Math.PI+360)%360;return Math.round(a)+'°';};
// points (the snow, the steam) are not things: the first hit that is not one
function describe(h0,hits){hits=hits.filter(h=>!h.object.isPoints);if(!hits.length)return '(nothing)';const p=hits[0].point,o=hits[0].object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the classification and the tags (README.md, DEV TOOLS): a plant is flora of this kit, with its species' tags
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&EHIGH.plantOfItem(item);
 const S=best&&best.key&&EHIGH.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem||(best&&best.key==='mother')?'flora · eastern highlands'+(S&&S.alien?' · alien':''):'terrain / water';
 // the plant's lean: the bearing it grows toward (the giant's is GIANT_AZ)
 let lean='';if(S){let bT=null,bd=1e9;for(const T of EHIGH.TREES){if(T.sp!==S.i)continue;const d=Math.hypot(T.x-p.x,T.z-p.z);if(d<bd){bd=d;bT=T;}}if(bT&&bT.lean)lean='\ngrows toward '+BEAR(bT.lean)+' (the giant: '+GIANT_AZ+'°)'+(bT.stage?' · '+bT.stage:'');}
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · form: '+tg.form+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  lean+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:16000000,calls:120},   // the first build's measure goes in KNOWN_ISSUES; not a target
 cls:{pass:12000000,host:900000},
 type:{'ehigh/trees':'pass','ehigh/floor':'pass','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // every species of the table is placed somewhere on the stage
 placed(C){const zero=EHIGH.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:C.length===EHIGH.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):C.length+' species, the scarcest '+Math.min(...C)};},
 // every species carries its tags, the Koppen classes inside the region's
 tagged(SP){const reg=Object.keys(EHIGH.KOPPEN),bad=[];
  for(const S of SP){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||!t.form||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):SP.length+' species tagged (climate, aridity, abyssal, riparian, form, harvest, Koppen)'};},
 // THE LEAN: every plant grows toward the giant (its recorded bearing within 40 degrees of the giant's)
 lean(T,g){const c=Math.cos(40*Math.PI/180),bad=T.filter(t=>!t.lean||t.lean[0]*g[0]+t.lean[1]*g[1]<c);
  return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' of '+T.length+' plants turned away from the giant (first '+EHIGH.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' plants, every one toward the giant'};},
 // the vigil spikes stand in every stage: rosettes, this year's flowering stand, dead torches
 vigil(T){const n={rosette:0,young:0,flower:0,torch:0};T.forEach(t=>{if(t.stage)n[t.stage]++;});const low=Object.keys(n).filter(k=>!(n[k]>=3));
  return{ok:!low.length,detail:(low.length?'too few: '+low.join(', ')+'; ':'')+Object.keys(n).map(k=>k+' '+n[k]).join(', ')};},
 // the glass towers' chemistry is drawn: wormwick round them and combs on the cliffs, each wormwick near a tower
 chemistry(W,Cm,T5){const far=W.filter(w=>!T5.some(t=>Math.hypot(t.x-w[0],t.z-w[1])<25));
  return{ok:W.length>=20&&Cm.length>=3&&!far.length,detail:(far.length?far.length+' wormwick more than 25 m from any tower; ':'')+W.length+' wormwick, '+Cm.length+' comb clusters'};},
 // the Mother Cushion is drawn and big: its skin covers more than 100,000 m^2 (about 1,000 triangles of 2 m cells per ... )
 mother(tris){return{ok:tris>=40000,detail:tris+' triangles of cushion skin on the Mother'};},
 // nothing roots under the water: no instance's origin more than a metre under the local surface
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // no plant on a sheer rock face (the gullies' walls, the tors' risers)
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' plants on sheer rock (first '+EHIGH.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' plants, none on a sheer face'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.3);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const T5=()=>EHIGH.TREES.filter(t=>t.sp===SPI('glasstower'));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),b=window._biome||{};
 add('every species placed',HCHK.placed(EHIGH.COUNTS||[]));
 add('every species tagged',HCHK.tagged(EHIGH.SPECIES));
 add('every plant grows toward the giant',HCHK.lean(EHIGH.TREES,EHIGH.GIANT));
 add('the vigil spikes in every stage',HCHK.vigil(EHIGH.TREES.filter(t=>t.sp===SPI('vigil')&&t.lv>0)));
 add('the glass towers\' chemistry drawn',HCHK.chemistry(EHIGH.WICKS||[],EHIGH.COMBS||[],T5()));
 add('the Mother Cushion drawn',HCHK.mother((b.tris&&b.tris.mother)||0));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no plant on a sheer rock face',HCHK.cliffs(EHIGH.TREES));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(EHIGH.COUNTS||[]).slice();C[SPI('cereus')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no form',HCHK.tagged(EHIGH.SPECIES.map((S,i)=>i===2?Object.assign({},S,{tags:Object.assign({},S.tags,{form:null})}):S)));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},EHIGH.SPECIES[0],{tags:Object.assign({},EHIGH.SPECIES[0].tags,{koppen:['Af']})})]));
 add('a spike turned away from the giant',HCHK.lean([Object.assign({},EHIGH.TREES[0],{lean:[-EHIGH.GIANT[0],-EHIGH.GIANT[1]]})],EHIGH.GIANT));
 add('a plateau where no stand flowers',HCHK.vigil(EHIGH.TREES.filter(t=>t.sp===SPI('vigil')&&t.lv>0&&t.stage!=='flower')));
 add('a wormwick far from any tower',HCHK.chemistry((EHIGH.WICKS||[]).concat([[TORS[2].x,TORS[2].z]]),EHIGH.COMBS||[],T5()));
 add('no Mother',HCHK.mother(0));
 add('a plant on the tarn bed',HCHK.dry([[TARN.x,TARNL-3,TARN.z,'test']]));
 // the steepest rock on the west gully's walls (found, not typed)
 {let bx=0,bz=0,bs=-1;const G=GULLY[0];for(let z=zF(G.x0)+100;z<=zF(G.x0)+900;z+=4)for(let x=xg(G,z)-90;x<=xg(G,z)+90;x+=4){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}
  add('a plant on the gully\'s sheer wall',HCHK.cliffs([{x:bx,z:bz,sp:4}]));}
 add('a camera under the tarn',HCHK.camerasOut([{view:'under',x:TARN.x,y:TARNL-8,z:TARN.z}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.take({build:'ehighlands',title:'Krator biome — the eastern highlands',
 hint:'The eastern highlands: a cold high plateau in thin air (~0.6 atm). Poured cushions and the Mother Cushion, woolbacks, thorn cushions, vigil spikes, ragbark gullies, glass towers, a cushion bog and a frozen tarn, a geyser field; everything grows toward the giant (ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.2,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,
 // the climate at a point, for the probe and for --eval: the fields and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=EHIGH.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
