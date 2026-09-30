// ================================================================= IZIZ CITY — the build: ancient clusters, guilds and civic, vernacular fill, farms, jungle, bakes
// Order follows the brief: the ancient quarters first (ruined and reclaimed), the civic and guild buildings near the
// hills, then the vernacular fill wealthy-to-poor away from the hills along every street, then farms in what is left,
// then the hyperjungle outside the moat (and undergrowth in the parks and ruins), then one bake per store.
const BUILD_T0=performance.now();
// ---------------------------------------------------------------- the Ancients-kit catalogue (vendored builders) and how to run one at a plot
// kitSection, measureKit, trimPlinths, itemBox, kitSnapshot/kitRestore, MAT.concRust and tripodMarket are in
// the Ancients kit now (src/77z-iziz-style.js, vendored).
const KITCAT={
 honey:{fn:kitSection(buildApartments,75,235),name:'Apartments B — honeycomb wall',smax:.6,smin:.18,type:['multi-family dwelling'],kind:'mid',rowPitch:24},
 aptsA:{fn:kitSection(buildApartments,-60,60),name:'Apartments A — terrace stack',smax:.45,smin:.16,type:['multi-family dwelling'],kind:'mid'},
 aptsC:{fn:kitSection(buildApartments,265,420),name:'Apartments C — column cluster',smax:.45,smin:.16,type:['multi-family dwelling'],kind:'mid'},
 officeA:{fn:kitSection(buildOffices,-70,110),name:'Office A — flared ring',smax:.4,smin:.14,type:['market/shop','civic'],kind:'mid'},
 officeB:{fn:kitSection(buildOffices,140,245),name:'Office B — lobed tower',smax:.45,smin:.16,type:['market/shop','civic'],kind:'mid'},
 officeC:{fn:kitSection(buildOffices,262,420),name:'Office C — the Comb',smax:.55,smin:.16,type:['market/shop','civic'],kind:'mid',rowPitch:26},
 houseA:{fn:kitSection(buildHouses,-35,35),name:'House A',smax:.7,smin:.22,type:['single-family dwelling'],kind:'house'},
 houseB:{fn:kitSection(buildHouses,35,105),name:'House B',smax:.7,smin:.22,type:['single-family dwelling'],kind:'house'},
 houseC:{fn:kitSection(buildHouses,105,175),name:'House C',smax:.7,smin:.22,type:['single-family dwelling'],kind:'house'},
 houseD:{fn:kitSection(buildHouses2,-30,30),name:'House D',smax:.7,smin:.22,type:['single-family dwelling'],kind:'house'},
 houseE:{fn:kitSection(buildHouses2,30,95),name:'House E',smax:.7,smin:.22,type:['single-family dwelling'],kind:'house'},
 houseF:{fn:kitSection(buildHouses2,95,170),name:'House F',smax:.7,smin:.22,type:['single-family dwelling'],kind:'house'},
 skyA:{fn:buildSkyA,name:'Skyscraper A',smax:.3,hmax:135,smin:.14,type:['multi-family dwelling','civic'],kind:'sky'},
 skyB:{fn:buildSkyB,name:'Skyscraper B',smax:.3,hmax:135,smin:.14,type:['multi-family dwelling','civic'],kind:'sky'},
 skyC:{fn:buildSkyC,name:'Skyscraper C',smax:.3,hmax:135,smin:.14,coreFrac:.06,type:['multi-family dwelling','civic'],kind:'sky'},
 skyD:{fn:buildSkyD,name:'Skyscraper D',smax:.3,hmax:135,smin:.16,type:['multi-family dwelling','civic'],kind:'sky'},
 skyE:{fn:buildSkyE,name:'Skyscraper E',smax:.3,hmax:135,smin:.16,type:['multi-family dwelling','civic'],kind:'sky'},
 skyF:{fn:buildSkyF,name:'Skyscraper F',smax:.3,hmax:135,smin:.16,type:['multi-family dwelling','civic'],kind:'sky'},
 gov:{fn:buildGovernment,name:'Government',smax:.5,hmax:60,smin:.18,type:['civic'],kind:'civic'},
 police:{fn:buildPolice,name:'Police station',smax:.55,smin:.2,type:['civic','military'],kind:'civic'},
 lab:{fn:buildLab,name:'Laboratory',smax:.55,smin:.2,type:['civic','industry'],kind:'civic'},
 library:{fn:buildLibrary,name:'Library',smax:.6,smin:.2,type:['civic'],kind:'civic'},
 campus:{fn:buildCampus,name:'Campus',smax:.34,smin:.14,type:['civic'],kind:'civic'},
 offices:{fn:buildOffices,name:'Offices',smax:.4,smin:.14,type:['market/shop','civic'],kind:'mid',count:3},
 apts:{fn:buildApartments,name:'Apartments',smax:.4,smin:.14,type:['multi-family dwelling'],kind:'mid',count:3},
 houses:{fn:buildHouses,name:'Houses A-C',smax:.6,smin:.22,type:['single-family dwelling'],kind:'house',count:3},
 houses2:{fn:buildHouses2,name:'Houses D-F',smax:.6,smin:.22,type:['single-family dwelling'],kind:'house',count:3},
 factory:{fn:buildFactory,name:'Factory',smax:.3,smin:.12,type:['industry'],kind:'industry'},
 fuel:{fn:buildFuelStation,name:'Fuel station',smax:.42,smin:.16,type:['industry','infrastructure'],kind:'industry'},
 amph:{fn:buildAmphitheater,name:'Amphitheatre',smax:.5,smin:.2,type:['civic'],kind:'civic'},
 bunker:{fn:buildBunker,name:'Bunker',smax:.45,smin:.2,type:['military'],kind:'military'},
};
const DEADLIGHT=new THREE.Color(0x4a4744);
const AWNINGS=[];
// the tripod market in Iziz dress: Vernacular mast, finial, rope and stalls (the kit version is generic)
const IZ_TRIPOD={awnings:AWNINGS,post:'vPostS',ball:'vBall',rope:'vRope',col:vC,stall:c=>vnStall(0,0,0,c),culture:'iziz-vernacular'};
// on one of the three hills: the top, the escarpment or the skirt out to the ring road and a little beyond
function onHill(x,z){for(const k of HILLKEYS){const H=HILL[k];if(Math.hypot(x-H.x,z-H.z)<H.ring+40)return true;}return false;}
// run a kit builder at a plot: the long axis along the plot's, scaled to fit (capped), flora stripped, REG adopted.
// opt: {d-state via arg, flip, noRot, y, smax, trim, keep(OBB), tint, lit, tags, name, repairs(n passes), level}
function placeKit(key,o,d,opt){const cat=KITCAT[key];if(!cat)return null;opt=opt||{};const M=measureKit(cat);
 let rot=0;if(!opt.noRot&&((M.hx>=M.hz)!==(o.hx>=o.hz)))rot=Math.PI/2;const mhx=rot?M.hz:M.hx,mhz=rot?M.hx:M.hz;
 const scale=Math.min(opt.smax||cat.smax,(o.hx-1)/mhx,(o.hz-1)/mhz,cat.hmax?cat.hmax/M.h:9);if(scale<cat.smin)return null;
 const ry=(o.ry||0)+rot+(opt.flip?Math.PI:0);const y=opt.y!=null?opt.y:groundY(o);
 // a tower stands on the city's own square plinth (1.55 m): the kit's podium is trimmed, so its shaft is lowered onto it
 // (a toppled tower keeps its own podium: its fallen body was laid by the kit to rest on it)
 const sky=cat.kind==='sky',y0=sky?y+1.55-M.baseY*scale:y;
 // the group is shifted so the measured core centre lands on the plot centre (the builder itself is called at 0,0:
 // its KOFF is added in WORLD space after the group transform, so it cannot carry the centring)
 const gc=loc(0,0,M.cx*scale,M.cz*scale,ry);const gx=o.x-gc[0],gz=o.z-gc[1];
 const G=new THREE.Group();G.position.set(gx,y0,gz);G.rotation.y=ry;G.scale.setScalar(scale);scene.add(G);G.updateMatrix();
 const snap=kitSnapshot(),r0=REG.length;KOFF=[0,0,0];useGroupXF(G);TSTAT.cur=key+'/'+d;HOLES=d===3?.55:1;
 let H=null;try{H=withFlatGround(()=>cat.fn(G,0,0,d));}catch(e){reportErr(key+' '+e.stack);}HOLES=1;KOFF=[0,0,0];
 // the salvage dressing runs INSIDE the group transform: repairPass samples the group in its local frame, so outside
 // it every shack and patch landed at the world origin
 if(d===3&&H){for(let k=0;k<(opt.repairs||1);k++){try{repairPass(H,3);}catch(e){reportErr('repair '+key+' '+e.stack);}}}
 endGroupXF();
 for(const n of['trunk','leafCard'])if(KIT.items[n])KIT.items[n].length=snap[n]||0;      // flora is never part of a building
 if(opt.trim!==false)trimPlinths(G,snap,o,y0,scale,M.th,opt.keep,sky?y0+M.baseY*scale+.25:null);
 if(opt.tint){for(const n in KIT.items){const it=KIT.items[n];for(let i=snap[n]||0;i<it.length;i++)it[i].c=(it[i].c||new THREE.Color(1,1,1)).clone().multiply(opt.tint);}
  G.traverse(m=>{if(m.isMesh){const mm=m.material.clone();if(m.material.onBeforeCompile)mm.onBeforeCompile=m.material.onBeforeCompile;mm.color=mm.color.clone().multiply(opt.tint);m.material=mm;}});}
 const state=d===3?'reclaimed':d===0?'intact':d===2?'toppled':'ruined';
 // the lighting rule (Travis): civic is electrified; a reclaimed Ancient building only on one of the three hills, and then 50/50
 const civic=cat.kind==='civic'||cat.kind==='military';const lit=opt.lit!=null?opt.lit:(d===0||(d===3&&(civic||(onHill(o.x,o.z)&&rng()<.5))));
 if(sky)citySkyPlinth(opt.plinth||o,y,lit);
 // Skyscraper D is bare concrete in the kit: its ruined and reclaimed skins go to rust-streaked steel here (Travis)
 if(key==='skyD'&&d>0)izsRustSkin(G);
 if(!lit&&d===3){for(const n in KIT.items){if(!/^(strip|dot|cell|lampI|bulb|glow|izGlow|vBulb|tbulb)/.test(n))continue;const it=KIT.items[n];for(let i=snap[n]||0;i<it.length;i++)it[i].c=DEADLIGHT;}}
 for(let i=r0;i<REG.length;i++){const r=REG[i];const p=loc(gx,gz,r.x*scale,r.z*scale,ry);r.x=p[0];r.z=p[1];r.y=y0+(r.y||0)*scale;r.r=Math.max(6,Math.min(r.r*scale,Math.hypot(o.hx,o.hz)+(opt.keep?0:4)));r.h*=scale;
  if(opt.name)r.name=opt.name;
  r.cls='building';r.key='anc_'+key;r.tags=Object.assign({culture:d===3?'ancients-reclaimed':'ancients',type:cat.type,wealth:d===3?(civic?'civic':'middle'):'poor',state,lit},opt.tags||{});}
 if(key==='skyC'&&d===3)tripodMarket(G,o,y,scale,ry,gx,gz,y0,IZ_TRIPOD);   // after the REG adoption: the market registers itself in world space
 // level the ground under the plot (the terrain mesh is built after placement): no plinth floats or buries on a slope
 if(opt.level!==false)cityFlat(o.x,o.z,Math.hypot(o.hx,o.hz)*.95,8,y+.06);
 TSTAT.cur=null;o.built=key;occAdd(o);return G;}
// the skyscraper plinth (Travis, round 3): a stepped square of board-formed concrete the size of one grid block, so
// four towers pack a 2x2 block. Two steps, a lip, lamp posts at the corners when the tower is lit.
function citySkyPlinth(o,y,lit){const w=o.hx*2+1.5,d=o.hz*2+1.5,q=qEuler(0,o.ry,0);
 kput('boxC',[o.x,y+.5,o.z],q,[w,1.0,d],vC(0xb8b0a4));kput('boxC',[o.x,y+1.25,o.z],q,[w-3,.5,d-3],vC(0xc4bcb0));kput('izBoxCap',[o.x,y+1.55,o.z],q,[w-3.4,.14,d-3.4],null);
 for(const s of[-1,1]){const p=loc(o.x,o.z,0,s*(d/2+.9),o.ry);kput('boxC',[p[0],y+.25,p[1]],q,[w*.5,.5,1.8],vC(0xb0a89c));}   // steps front and back
 if(lit)for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(o.x,o.z,sx*(w/2-1.2),sz*(d/2-1.2),o.ry);izLampColumn(p[0],p[1]);}}
// a transplant-family building at a plot
const TSCALE={dwelling:2.6,tall:2.6,hall:2.2};
function placeTrans(kind,mode,o,seed,extra){const half=TREFHALF[kind];if(!half)return null;let rot=0;if((half[0]>=half[1])!==(o.hx>=o.hz))rot=Math.PI/2;const hx=rot?half[1]:half[0],hz=rot?half[0]:half[1];
 const fam=TKINDS.dwelling.includes(kind)?'dwelling':TKINDS.tall.includes(kind)?'tall':'hall';const scale=Math.min(TSCALE[fam],(o.hx-1.5)/hx,(o.hz-1.5)/hz);if(scale<.9)return null;
 const ry=(o.ry||0)+rot+(rng()<.5?Math.PI:0),y=groundY(o);TSTAT.cur='trans_'+kind+'/'+mode;
 const P=TRANS.place(scene,kind,mode,o.x,o.z,ry,scale,seed,extra,y);TSTAT.cur=null;o.built='trans_'+kind;occAdd(o);return P;}
// a vernacular building at a plot
function placeVern(key,o,opt){opt=opt||{};const D=VERN.defs[key];if(!D)return null;const sc=opt.scale||1;o.hx=D.w/2*sc;o.hz=D.d/2*sc;const y=groundY(o);
 if(opt.lit==null&&D.tags.wealth==='rich')opt.lit=onHill(o.x,o.z)&&rng()<.5;   // the lighting rule: wealthy houses only on the hills, 50/50
 if(/^anc_|^port_|forgemasters|caravanserai|barracks|market|hospital|school|alchemist/.test(key))cityFlat(o.x,o.z,Math.hypot(o.hx,o.hz)*.95,8,y+.06);
 TSTAT.cur=key+'/'+(opt.v|0);const r0=REG.length;const G=VERN.place(scene,key,o.x,o.z,o.ry,{v:opt.v|0,scale:sc,y,lit:opt.lit});if(opt.lit!=null)for(let i=r0;i<REG.length;i++)REG[i].tags.lit=opt.lit;TSTAT.cur=null;o.built=key;occAdd(o);VERN_PLACED.push({key,o});return G;}
const VERN_PLACED=[];
const LANDMARKS=[];   // labelled on the map
function landmark(name,G,o,h){LANDMARKS.push({name,x:o.x,z:o.z,h:h||18});if(o){let best=null;for(let i=Math.max(0,REG.length-60);i<REG.length;i++){const r=REG[i];if(Math.hypot(r.x-o.x,r.z-o.z)<=Math.max(o.hx,o.hz)+2&&(!best||r.r>best.r))best=r;}if(best){best.tags=best.tags||{};best.tags.landmark=true;best.name=name;}}return G;}
// a ROW of parallel slabs across a slot (post-war blocks, Travis): every slab the same type and facing, long axes
// parallel to the slot's long side, stacked across the short side at the type's row pitch
function placeRow(key,s,d){const cat=KITCAT[key];const longX=s.hx>=s.hz,L=longX?s.hx:s.hz,S=longX?s.hz:s.hx;const n=Math.max(1,Math.floor(2*S/(cat.rowPitch||24)));let k=0;
 for(let i=0;i<n;i++){const off=-S+S*(2*i+1)/n;const lx=longX?0:off,lz=longX?off:0;const c=loc(s.x,s.z,lx,lz,s.ry);
  const sub={x:c[0],z:c[1],hx:longX?L:S/n-1.5,hz:longX?S/n-1.5:L,ry:s.ry,pad:.5};if(placeKit(key,sub,d,{}))k++;}
 if(k){s.built=key;}return k;}
// where a toppled tower's upper body lies, from a throwaway build at d=2 (the kit reseeds per state, so it falls the same way)
const FALLINFO={};function fallInfo(key){if(FALLINFO[key])return FALLINFO[key];const cat=KITCAT[key],M=measureKit(cat);const parts=kitBuildParts(cat,2),R0=Math.max(M.hx,M.hz)*1.3;
 let sx=0,sz=0,n=0;const far=[];for(const b of parts){const cx=(b.min.x+b.max.x)/2-M.cx,cz=(b.min.z+b.max.z)/2-M.cz;if(Math.hypot(cx,cz)<R0||b.max.y>M.h*.5)continue;far.push(b);const w=(b.max.x-b.min.x)*(b.max.z-b.min.z)+1;sx+=cx*w;sz+=cz*w;n+=w;}
 if(!n)return null;const dl=Math.hypot(sx,sz),ux=sx/dl,uz=sz/dl;let L=0,W=0;
 for(const b of far)for(const px of[b.min.x,b.max.x])for(const pz of[b.min.z,b.max.z]){const qx=px-M.cx,qz=pz-M.cz;L=Math.max(L,qx*ux+qz*uz);W=Math.max(W,Math.abs(-qx*uz+qz*ux));}
 return FALLINFO[key]={ux,uz,L,W};}
const FALL_BAD={1:1,2:1,3:1,8:1,9:1,11:1};   // plaza, park, boulevard (rings, thoroughfares, gate roads, highways), water, court, rock
// try 16 headings for the fall; take the first that crosses nothing important, else (strict=false) the least bad
function placeToppled(key,o,strict,target){const cat=KITCAT[key],M=measureKit(cat),F=fallInfo(key);if(!F)return null;
 const scale=Math.min(cat.smax,(o.hx-1)/M.hx,(o.hz-1)/M.hz,cat.hmax/M.h);const Ls=F.L*scale+3,Ws=F.W*scale+3;let best=null;
 // a given target: the one heading that lays the fall toward it (a rotation by ry turns a local bearing phi into phi-ry)
 const heads=target?[Math.atan2(F.uz,F.ux)-Math.atan2(target[1]-o.z,target[0]-o.x)]:[...Array(16).keys()].map(k=>o.ry+k/16*TAU);
 for(const ry of heads){const dw=loc(0,0,F.ux,F.uz,ry);const fx=dw[0],fz=dw[1];
  const f0=Math.max(o.hx,o.hz)+1,fl=Math.max(4,(Ls-f0)/2);const fall={x:o.x+fx*(f0+fl),z:o.z+fz*(f0+fl),hx:fl,hz:Ws/2,ry:Math.atan2(-fz,fx),pad:.5};
  let bad=occFree(fall,.5)?0:20;for(let t=f0;t<=Ls;t+=4)for(const w of[-Ws/2,0,Ws/2]){const x=o.x+fx*t-fz*w,z=o.z+fz*t+fx*w;if(!insideWall(x,z,30)||FALL_BAD[klass(x,z)]||inPrecinct(x,z,0))bad++;}
  if(!best||bad<best.bad)best={bad,ry,fall};if(!bad)break;}
 if(!best||(strict&&best.bad))return null;
 const lot=Object.assign({},o,{ry:best.ry});// the plinth stays square to the street grid (the slot's own orientation), whatever way the tower fell
 const G=placeKit(key,lot,2,{noRot:true,lit:false,keep:best.fall,plinth:o,name:cat.name+' (toppled)',tags:{landmark:true}});
 if(G){best.fall.built='toppled';occAdd(best.fall);footprint(obbCorners(best.fall,0),'rgba(70,60,50,.5)');}return G;}
// ---------------------------------------------------------------- 1. the ancient quarters
const KIT_TRI_CAP=9.0e6;   // past this the remaining kit slots become transplant lots (the budget is the whole scene)
(function buildAncient(){reseed(SEED_CITY+6);let n=0,kitN=0,transN=0;
 // the toppled towers first, so the slots their falls cross stay empty (rubble lots)
 for(const C of CLUSTERS)for(const s of C.slots)if(s.toppled){if(placeToppled(s.kit,s,false,s.fallToward))kitN++;}
 for(const C of CLUSTERS){const d=C.state==='rehab'?3:1,mode=C.state==='rehab'?'ancrehab':'ancruin';
  for(const s of C.slots){let G=null;if(s.toppled||!occFree(s,0))continue;
   if(s.group==='quad'&&s.cells){let k=0;const n=1+Math.floor(rng()*s.cells.length);for(const c of s.cells.slice(0,Math.max(n,Math.min(2,s.cells.length)))){if(placeKit(s.kit,c,d,{flip:rng()<.5})){k++;kitN++;}}if(k)continue;}
   else if(s.group==='row'){if(placeRow(s.kit,s,d)){kitN++;continue;}}
   else if(s.kit&&kitTris()<KIT_TRI_CAP){G=placeKit(s.kit,s,d,{flip:rng()<.5,trim:true});if(G)kitN++;}
   if(!G){const kind=s.trans||(s.kind==='sky'||s.kind==='mid'?vPick(TKINDS.tall):s.kind==='house'?vPick(TKINDS.dwelling):vPick(TKINDS.hall));
    const m=rng()<.35?(mode==='ancrehab'?'rehab':'ruin'):mode;G=placeTrans(kind,m,s,SEED_CITY*3+n*7+1,{quarter:C.state==='rehab'?'reclaimed':'ruined'});if(G)transN++;}
   n++;}}
 window._ancientKit=kitN;window._ancientTrans=transN;window._kitTris=kitTris();
})();
// ---------------------------------------------------------------- 3b. two deliberate towers: The Project (A, reclaimed, in the slums) and a toppled B
// candidate lots on a 20 m grid over the plateau, free and on buildable ground
function towerLots(hx){const out=[];for(let x=-460;x<=460;x+=20)for(let z=-460;z<=460;z+=20){const o={x,z,hx,hz:hx,ry:-AG.rot,pad:2};
 if(!insideWall(x,z,50))continue;if(!groundOK(o,{margin:40,ppad:4}))continue;if(!occFree(o,3))continue;out.push(o);}return out;}
(function theProject(){reseed(SEED_CITY+31);
 // the slum: the free lot farthest from every hill's ring (the poor live far from the hills)
 const lots=towerLots(20).map(o=>({o,d:nearestHill(o.x,o.z).d})).sort((a,b)=>b.d-a.d);if(!lots.length){reportErr('no lot for The Project');return;}
 const o=lots[Math.min(2,lots.length-1)].o;
 const G=placeKit('skyA',o,3,{lit:true,smax:.42,tint:new THREE.Color(1.45,.8,.42),repairs:3,name:'The Project',
  tags:{role:'The Project',culture:'ancients-reclaimed',type:['multi-family dwelling'],wealth:'poor',note:'Skyscraper A, repaired and packed with Izani families; painted Iziz orange'}});
 if(G){landmark('The Project',G,o,140);connectRoad(o.x+Math.cos(-AG.rot)*(o.hx+3),o.z-Math.sin(-AG.rot)*(o.hx+3),6,KL.settler);window._project=[o.x|0,o.z|0];}
})();
(function toppledB(){reseed(SEED_CITY+32);
 const lots=towerLots(14.5).map(o=>({o,d:nearestHill(o.x,o.z).d})).filter(c=>c.d>60&&c.d<280);
 for(let i=lots.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));const t=lots[i];lots[i]=lots[j];lots[j]=t;}
 for(const c of lots){const G=placeToppled('skyB',c.o,true);if(G){window._toppled={x:c.o.x|0,z:c.o.z|0};return;}}
 reportErr('toppled B: no lot where the fall hits nothing important');
})();
// ---------------------------------------------------------------- 2. the bunkers across the moat, the amphitheatre at the arena's foot
(function buildOutworks(){reseed(SEED_CITY+9);
 const N=8;for(let k=0;k<N;k++){let a=(k+.5)/N*TAU;while(GATES.some(g=>angDiff(a,g)<.2))a+=.22;const R=wallR(a)+82;const o={x:R*Math.cos(a),z:R*Math.sin(a),hx:40,hz:40,ry:Math.atan2(Math.cos(a),Math.sin(a))};   // gate (+z) faces out, away from the wall
  const G=placeKit('bunker',o,1,{noRot:true,trim:false,y:terrainH(o.x,o.z)-.5,tags:{role:'moat bunker'}});if(G)BIO_OBSTACLES.push({x:o.x,z:o.z,r:34});}
 // the Ancient amphitheatre: intact, in the arena's rust colours
 const o={x:AMPH.x,z:AMPH.z,hx:AMPH.r-2,hz:AMPH.r-2,ry:0};placeKit('amph',o,0,{noRot:true,trim:false,y:CITY.PLATEAU+.6,tint:new THREE.Color(.62,.34,.22),tags:{state:'intact',finish:'rust'}});
})();
// ---------------------------------------------------------------- 3. guilds, embassy, chapterhouse, forge, civic buildings — near the hills, on the network
function placeNear(key,tx,tz,opt){opt=opt||{};const D=VERN.defs[key];const sc=opt.scale||1;let o=findSpot(D.w/2*sc+1,D.d/2*sc+1,tx,tz,0,{faceRoad:true,R:opt.R||160,step:opt.step||10,pad:2,margin:26,ppad:2});
 if(!o)o=findSpot(D.w/2*sc+1,D.d/2*sc+1,tx,tz,0,{faceRoad:true,R:(opt.R||160)*2.2,step:(opt.step||10)*1.4,pad:2,margin:26,ppad:2});
 if(!o){reportErr('no room for '+key+' near '+(tx|0)+','+(tz|0));return null;}return placeVern(key,o,{v:opt.v|0,scale:sc});}
// a building on a hill TOP (the mask says plaza there, so the mask and precinct are ignored; occupancy and the top's edge are not)
function placeOnTop(key,H,a0,r,opt){opt=opt||{};const D=VERN.defs[key];for(let k=0;k<11;k++){const a=a0+(k%2?1:-1)*Math.ceil(k/2)*.2;   /* sweep ±1 rad round a0, never round to the gate side */const x=H.x+r*Math.cos(a),z=H.z+r*Math.sin(a);const ry=Math.atan2(H.x-x,H.z-z);
  const o={x,z,hx:D.w/2+1,hz:D.d/2+1,ry,pad:2};if(Math.hypot(x-H.x,z-H.z)+Math.max(o.hx,o.hz)>H.r0-5)continue;if(!occFree(o,2))continue;
  let onRoad=false;for(const c of obbCorners(o,1)){const kk=klass(c[0],c[1]);if(kk>=3&&kk<=6)onRoad=true;}if(onRoad)continue;
  return placeVern(key,o,opt);}reportErr('no room on the '+key+' top');return null;}
// the hills of Rome (Travis): the temple and arena tops carry a district of their own — random lots on the top, facing the centre
function fillTop(H,picks,n,rmin){reseed(SEED_CITY+21+Math.round(H.x));let k=0;for(let t=0;t<n*40&&k<n;t++){const a=rng()*TAU,r=rmin+Math.sqrt(rng())*(H.r0-8-rmin);const x=H.x+r*Math.cos(a),z=H.z+r*Math.sin(a);
  const key=vPick(picks),D=VERN.defs[key];const ry=Math.atan2(H.x-x,H.z-z)+rr(-.3,.3);const o={x,z,hx:D.w/2+.5,hz:D.d/2+.5,ry,pad:1.5};
  if(Math.hypot(x-H.x,z-H.z)+Math.max(o.hx,o.hz)>H.r0-5)continue;if(!occFree(o,1.5))continue;
  let bad=false;for(const c of obbCorners(o,.5).concat([[x,z]])){const kk=klass(c[0],c[1]);if(kk>=3&&kk<=6||kk===KL.rock)bad=true;}if(bad)continue;
  placeVern(key,o,{v:Math.floor(rng()*6)});k++;}return k;}
(function buildCivic(){reseed(SEED_CITY+10);const P=HILL.palace,T=HILL.temple,A=HILL.arena;
 const at=(H,a,r)=>[H.x+(H.ring+r)*Math.cos(a),H.z+(H.ring+r)*Math.sin(a)];const gate=(deg,inset)=>{const g=deg*Math.PI/180,R=wallR(g)-inset;return[R*Math.cos(g),R*Math.sin(g)];};
 let p;
 // the generators that power the three hill tops (Travis: the citadel, the arena and the grand temple are electrified)
 placeOnTop('vern_generator',P,P.gate+.78,72,{v:7});placeOnTop('vern_generator',A,A.gate-2.62,74,{v:9});
 p=at(P,P.gate+1.15,34);landmark('Voth Embassy',placeNear('port_voth_embassy',p[0],p[1]),p,26);
 p=at(P,P.gate-1.25,36);landmark("Forgemasters' Hall",placeNear('vern_forgemasters_hall',p[0],p[1]),p,20);
 p=at(P,P.gate+2.3,40);landmark('Barracks (palace)',placeNear('vern_barracks',p[0],p[1]),p,16);
 placeOnTop('vern_generator',T,T.gate+Math.PI,74,{v:8});
 {const G=placeOnTop('port_order_chapterhouse',T,T.gate+1.75,68,{});if(G){const o=OCC.list[OCC.list.length-1];landmark('Order Chapterhouse',G,o,24);}}
 {const G=placeOnTop('vern_alchemist',T,T.gate-1.75,68,{});if(G){const o=OCC.list[OCC.list.length-1];landmark("Alchemist's compound",G,o,20);}}
 {const G=placeOnTop('vern_beast_hunters_guild',A,A.gate+2.62,72,{});if(G){const o=OCC.list[OCC.list.length-1];landmark("Beast Hunters' Guild",G,o,16);}}
 p=at(A,A.gate-1.6,40);landmark("Salvagers' Guild",placeNear('anc_salvagers_guild',p[0],p[1],{scale:.5,R:340,step:14}),p,46);
 p=gate(200,130);landmark('Mercenary Guild',placeNear('anc_mercenary_guild',p[0],p[1],{scale:.45,R:340,step:14}),p,24);
 p=gate(90,110);landmark("Farmers' Guild",placeNear('vern_farmers_guild',p[0],p[1]),p,16);
 p=gate(200,60);landmark('Caravanserai (west)',placeNear('vern_caravanserai',p[0],p[1],{R:160}),p,14);
 p=gate(30,70);landmark('Caravanserai (east)',placeNear('vern_caravanserai',p[0],p[1],{v:1,R:160}),p,14);
 p=gate(90,60);landmark('Barracks (south gate)',placeNear('vern_barracks',p[0],p[1],{v:1}),p,16);
 window._topFill={temple:fillTop(T,['vern_house_rich_a','vern_house_rich_b','vern_shops','vern_tavern','vern_house_mid_b'],12,52),arena:fillTop(A,['vern_tavern','vern_shops','vern_house_rich_a','vern_house_rich_b','vern_market','vern_house_mid_a'],14,56)};
 // schools, hospitals, markets, generators, tanks, silos, warehouses: one district each
 HILLKEYS.forEach((k,i)=>{const H=HILL[k];
  p=at(H,H.gate+2.9,60);placeNear('vern_school',p[0],p[1],{v:i});
  p=at(H,H.gate-2.6,30);placeNear('vern_market',p[0],p[1],{v:i});
  p=at(H,H.gate+.7,26);placeNear('vern_market',p[0],p[1],{v:i+3});
  p=at(H,H.gate+1.9,70);placeNear('vern_generator',p[0],p[1],{v:i});
  p=at(H,H.gate-2.0,90);placeNear('vern_tank',p[0],p[1],{v:i});
  if(k!=='temple'){p=at(H,H.gate-.6,80);placeNear('vern_hospital',p[0],p[1],{v:i});}});
 [90,200,315,30].forEach((deg,i)=>{p=gate(deg,150);placeNear('vern_silos',p[0],p[1],{v:i});p=gate(deg,95);placeNear('vern_warehouse',p[0],p[1],{v:i});});
})();
// the settler streets must not cut through anything already standing: paint the footprints placed so far into the mask
for(const o of OCC.list)footprint(obbCorners(o,0));cityBakeMasks();
// ---------------------------------------------------------------- 4. settler streets: a jittered lattice per hill district, grown out from the network so every street connects
(function settlerStreets(){reseed(SEED_CITY+14);cityBakeMasks();const ST={};window._settler=ST;
 const pitch=44;const nodes={};const key=(i,j)=>i+','+j;
 for(const k of HILLKEYS){const H=HILL[k];const rot=Math.atan2(H.z,H.x)+rr(-.2,.2);const c=Math.cos(rot),s=Math.sin(rot);
  const W=(u,v)=>[u*c-v*s,u*s+v*c];
  // nodes of this district's lattice: on the plateau, this hill the nearest, jittered
  const N=Math.ceil(CITY.R*1.2/pitch);const mine={};
  for(let i=-N;i<=N;i++)for(let j=-N;j<=N;j++){const w=W(i*pitch+rr(-4,4),j*pitch+rr(-4,4));if(!insideWall(w[0],w[1],30))continue;if(nearestHill(w[0],w[1]).key!==k)continue;if(inPrecinct(w[0],w[1],4))continue;
   let on=klass(w[0],w[1])>=3&&klass(w[0],w[1])<=6,bld=canBuild(w[0],w[1]);
   // a node that lands on a building slides to the nearest free ground within 16 m (it used to be dropped, and the
   // district's street network with it)
   if(!on&&!bld){let f=null;for(let r=4;r<=16&&!f;r+=4)for(let a=0;a<8&&!f;a++){const x=w[0]+r*Math.cos(a*TAU/8),z=w[1]+r*Math.sin(a*TAU/8);if(canBuild(x,z)&&insideWall(x,z,30)&&!inPrecinct(x,z,4))f=[x,z];}
    if(!f)continue;w[0]=f[0];w[1]=f[1];bld=true;}
   mine[key(i,j)]={p:w,i,j,conn:on,done:false};}
  // is the straight run between two nodes clear (buildable or road all the way)?
  const clear=(a,b)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=3;t<L-3;t+=3){const x=a[0]+(b[0]-a[0])*t/L,z=a[1]+(b[1]-a[1])*t/L;const kk=klass(x,z);if(!(canBuild(x,z)||(kk>=3&&kk<=6)))return false;if(inPrecinct(x,z,2))return false;}return true;};
  // BFS from the connected nodes
  const q=Object.values(mine).filter(n=>n.conn);if(!q.length){let b=null,bd=1e9;for(const n of Object.values(mine)){const r=nearestRoadPt(n.p[0],n.p[1]);if(r&&r.d<bd){bd=r.d;b=n;}}if(b){connectRoad(b.p[0],b.p[1],6,KL.settler);b.conn=true;q.push(b);}}
  // nodes not yet on the network join it by a short spur when they are close to a road (the old 'blocked = connected' shortcut)
  for(const n of Object.values(mine)){if(n.conn)continue;const r=nearestRoadPt(n.p[0],n.p[1]);if(r&&r.d<16&&clear(n.p,[r.x,r.z])){road([n.p,[r.x,r.z]],6,KL.settler,{zone:'settler:'+k});n.conn=true;q.push(n);}}
  let head=0;const st=ST[k]={nodes:Object.keys(mine).length,seeds:q.length,tried:0,unclear:0,roads:0};
  while(head<q.length){const n=q[head++];for(const d of[[1,0],[-1,0],[0,1],[0,-1]]){const m=mine[key(n.i+d[0],n.j+d[1])];if(!m||m.conn&&m.done)continue;
   if(rng()<.08)continue;   // the odd missing link keeps it from reading as a grid
   st.tried++;let path=null;if(clear(n.p,m.p))path=[n.p,m.p];
   else{// detour round whatever stands in the way: a dog-leg through a point off to either side of the straight run
    const dx=m.p[0]-n.p[0],dz=m.p[1]-n.p[1],L=Math.hypot(dx,dz),px=-dz/L,pz=dx/L;
    for(const off of[12,-12,20,-20,28,-28]){const w=[(n.p[0]+m.p[0])/2+px*off,(n.p[1]+m.p[1])/2+pz*off];if(clear(n.p,w)&&clear(w,m.p)){path=[n.p,w,m.p];st.detour=(st.detour||0)+1;break;}}}
   if(!path){st.unclear++;continue;}road(path,6,KL.settler,{zone:'settler:'+k});st.roads++;if(!m.conn){m.conn=true;q.push(m);}}n.done=true;}}
 cityBakeMasks();
})();
// ---------------------------------------------------------------- 5. the vernacular fill: frontage along every street, wealthy near the hills, poor toward the wall
const HOUSES={0:['vern_house_poor_a','vern_house_poor_b','vern_house_poor_c'],1:['vern_house_mid_a','vern_house_mid_b','vern_house_mid_c'],2:['vern_house_rich_a','vern_house_rich_b']};
const FILLCOUNT={market:0};
function gateDist(x,z){let d=1e9;for(const g of GATES){const p=gatePos(g);d=Math.min(d,Math.hypot(x-p[0],z-p[1]));}return d;}
function pickVern(x,z,r){const nh=nearestHill(x,z),d=nh.d,gd=gateDist(x,z);const isRing=r.zone&&r.zone.indexOf('ring')===0,isBoul=r.cls===KL.boulevard;
 const w=rng();let wealth=d<70?(w<.62?2:1):d<190?(w<.68?1:w<.88?0:2):(w<.74?0:1);if(isRing&&wealth<1&&rng()<.6)wealth=1;
 let com=d<110?.4:(isBoul?.3:.13);if(gd<150)com+=.15;
 if(rng()<com){const c=rng();
  if(gd<150&&c<.3)return{key:rng()<.55?'vern_warehouse':'vern_tavern'};
  if(d<110&&c<.1&&FILLCOUNT.market<4){FILLCOUNT.market++;return{key:'vern_market'};}
  if(c<.5)return{key:'vern_shops'};if(c<.62)return{key:'vern_tavern'};if(c<.84)return{key:rng()<.5?'vern_workshop_a':'vern_workshop_b'};if(c<.92)return{key:'vern_smithy'};return{key:'vern_warehouse'};}
 return{key:vPick(HOUSES[wealth]),v:Math.floor(rng()*6)};}
(function frontage(){reseed(SEED_CITY+15);let placed=0;const F={ground:0,occ:0,len:0,segs:0};
 for(const r of ROADS){if(r.zone==='link'||r.zone==='highway')continue;const P=r.pts;
  for(let sg=0;sg<P.length-1;sg++){const ax=P[sg][0],az=P[sg][1],bx=P[sg+1][0],bz=P[sg+1][1];const L=Math.hypot(bx-ax,bz-az);if(L<6)continue;const ux=(bx-ax)/L,uz=(bz-az)/L,nx=-uz,nz=ux;
   for(const side of[-1,1]){let s=rr(1,7);
    while(s<L-3){const fx=ax+ux*s,fz=az+uz*s;const pk=pickVern(fx+nx*side*14,fz+nz*side*14,r);const D=VERN.defs[pk.key];const sc=pk.scale||1;const hx=D.w/2*sc,hz=D.d/2*sc;
     const off=r.w/2+hz+rr(.8,2.2);const cx=fx+nx*side*off,cz=fz+nz*side*off;const ry=Math.atan2(-nx*side,-nz*side)+rr(-.06,.06);
     const o={x:cx,z:cz,hx,hz,ry,pad:1.2};
     if(!groundOK(o,{margin:24})){F.ground++;const c=obbCorners(o,0).concat([[o.x,o.z]]);let why='mask';for(const q of c){if(!insideWall(q[0],q[1],24)){why='wall';break;}if(inPrecinct(q[0],q[1],0)){why='prec';break;}}F[why]=(F[why]||0)+1;if(why==='mask'){const kk=[...c.map(q=>klass(q[0],q[1]))];F['k'+kk.find(v=>v!==0)]=(F['k'+kk.find(v=>v!==0)]||0)+1;}s+=3.5;}else if(!occFree(o,1.2)){F.occ++;s+=3.5;}else{placeVern(pk.key,o,{v:pk.v,scale:sc});placed++;s+=hx*2+rr(1.5,5);}}}F.len+=L;F.segs++;}}
 window._vernPlaced=placed;window._frontage=F;
})();
// ---------------------------------------------------------------- 5b. infill: the chaotic settler fabric behind the frontages, each house on a footpath to its street
(function infill(){reseed(SEED_CITY+17);let n=0;
 for(let x=-480;x<=480;x+=9)for(let z=-480;z<=480;z+=9){const jx=x+rr(-3,3),jz=z+rr(-3,3);if(!insideWall(jx,jz,30))continue;if(!canBuild(jx,jz)||inPrecinct(jx,jz,2))continue;
  const nr=nearestRoadPt(jx,jz);if(!nr||nr.d>64)continue;
  const nh=nearestHill(jx,jz).d,w=rng();const wealth=nh<80?(w<.5?1:2):nh<200?(w<.6?1:0):(w<.8?0:1);
  const pk=rng()<.12?{key:vPick(['vern_workshop_a','vern_workshop_b','vern_smithy'])}:{key:vPick(HOUSES[wealth]),v:Math.floor(rng()*6)};const D=VERN.defs[pk.key];
  const ry=Math.atan2(nr.x-jx,nr.z-jz)+rr(-.25,.25);const o={x:jx,z:jz,hx:D.w/2,hz:D.d/2,ry,pad:1.5};
  if(groundOK(o,{margin:26})&&occFree(o,1.8)){placeVern(pk.key,o,{v:pk.v});n++;
   if(nr.d>o.hz+3){const f=loc(jx,jz,0,o.hz+.5,ry);cstroke(cg,[[f[0],f[1]],[nr.x,nr.z]],2.2,'#7a6a58');cstroke(kg,[[f[0],f[1]],[nr.x,nr.z]],2.2,KLCOL(KL.minor));}}}
 window._infill=n;
})();
// ---------------------------------------------------------------- 6. farms: every open plot left inside the wall
const cropMat=new THREE.MeshLambertMaterial({color:0xffffff});kdef('cityCrop',VBOX,cropMat);kdef('cityFencePost',VBOX,MAT.wood);
(function farms(){reseed(SEED_CITY+16);let n=0;
 for(let x=-500;x<=500;x+=11)for(let z=-500;z<=500;z+=11){const jx=x+rr(-2,2),jz=z+rr(-2,2);if(!insideWall(jx,jz,34))continue;let o=null;
  for(const CELL of[24,18,13]){const H=CELL/2-1;const t={x:jx,z:jz,hx:H,hz:H,ry:0,pad:1.5};if(groundOK(t,{margin:30,ppad:3})&&occFree(t,2)){o=t;break;}}
  if(!o)continue;const H=o.hx;
  occAdd(o);o.built='farm';
  const corners=obbCorners(o,0);cpoly(cg,corners,vPick(['#7a6a3a','#6e5e34','#857240','#6a6a3a']));cpoly(kg,corners,KLCOL(KL.field));
  for(let k=0;k<5;k++){cstroke(cg,[[jx-H+1,jz-H+2+k*(2*H-4)/4],[jx+H-1,jz-H+2+k*(2*H-4)/4]],1.2,'rgba(40,30,15,.5)');}
  const green=new THREE.Color().setHSL(rr(.18,.3),rr(.35,.6),rr(.22,.36));const rows=Math.floor((2*H-2)/2.4);
  for(let k=0;k<rows;k++){const rz=jz-H+1.6+k*2.4;const rx=jx;const y=terrainH(rx,rz);kput('cityCrop',[rx,y+.3,rz],null,[2*H-2.4,rr(.5,.9),rr(.7,1.1)],green.clone().offsetHSL(rr(-.02,.02),0,rr(-.04,.04)));}
  for(let k=0;k<4;k++){const c=corners[k];kput('cityFencePost',[c[0],terrainH(c[0],c[1])+.5,c[1]],null,[.2,1.1,.2],vC(0x6a5a44));}
  REG.push({name:'Farm plot',x:jx,y:terrainH(jx,jz),z:jz,r:H+.5,h:2,cls:'farm',key:'city_farm',tags:{culture:'iziz-vernacular',type:['farm'],wealth:'poor',lit:false,biome:'hypertropic/wet'}});n++;}
 window._farms=n;
})();
// ---------------------------------------------------------------- 7. footprints into the mask (for the jungle and the paths overlay), then the hyperjungle
for(const o of OCC.list)footprint(obbCorners(o,.6));
cityBakeMasks();
cityTerrainMesh();   // now: every plot is levelled
(function jungle(){BIO.setScene(scene);const q=CITY.QUALITY;const t0=performance.now();
 BIO.host.mask=bioTreeMaskFn;BIO.cur='jungle/trees';let T={};try{T=HYPERJUNGLE.buildTrees(2000,1800,q);}catch(e){reportErr('jungle trees: '+e.stack);}
 BIO.host.mask=bioMaskFn;BIO.cur='jungle/floor';let F={};try{F=HYPERJUNGLE.buildFloor(1500,q);}catch(e){reportErr('jungle floor: '+e.stack);}
 BIO.cur=null;const b=BIO.bake();window._biome={trees:T.trees,hyper:T.hyper,saplings:T.saplings,tris:T.tris&&T.tris.total,floorTris:F.tris,calls:b.calls,inst:b.inst,ms:Math.round(performance.now()-t0)};
 BIO._tickWind&&BIO._tickWind();
})();
// ---------------------------------------------------------------- 8. bakes and labels
if(AWNINGS.length){const byC={};for(const w of AWNINGS)(byC[w.c]||(byC[w.c]=[])).push(w.g);for(const c in byC){const m=MAT.cloth.clone();m.onBeforeCompile=MAT.cloth.onBeforeCompile;m.color=vC(+c);meshMerged(byC[c],m,scene);}}
kbake(scene);TRANS.bake(scene);
window._registered=REG.length;window._buildMs=Math.round(performance.now()-BUILD_T0);window._occ=OCC.list.length;
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
// building labels: the atlas in src/93-labels.js (one draw call, toggled by the Labels button); landmarks are the REG entries with a role tag
