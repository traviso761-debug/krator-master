// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what this page has
// (riftrim's, 2026-11-03, taken as the start). THE VIEWS are the station's (LAND.views, 44w), each standing on the ground AS DRAWN: drawnH reads
// the ground mesh's own triangles (the round's lesson: a camera above terrainH can still be under the drawn mesh between its vertices), and a
// view over a rock body stands over its top (KSTACKS.topAt).
const gh=(x,z,dy)=>drawnH(x,z)+(dy||0);
/* the ground mesh's height at (x, z): the triangle (45: two per cell, a-b-d and b-c-d) the point falls in, interpolated */
function drawnH(x,z){const g=GROUND.geometry,p=g.attributes.position.array,S=TERR.R*2.2,N=ST_GROUND_N(),cs=S/N,nx=N+1;
 const u=clamp((x+S/2)/cs,0,N-1e-6),v=clamp((z+S/2)/cs,0,N-1e-6),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
 const Y=(ii,jj)=>p[((jj)*nx+ii)*3+1],a=Y(i,j),b=Y(i,j+1),c=Y(i+1,j+1),d=Y(i+1,j);
 return fu+fv<=1?a+(d-a)*fu+(b-a)*fv:c+(b-c)*(1-fu)+(d-c)*(1-fv);}
/* the highest drawn thing under (x, z): the ground mesh or a rock body's top */
const solidH=(x,z)=>Math.max(drawnH(x,z),ROCK.length?KSTACKS.topAt(ROCK,x,z):-Infinity);
/* past the ground's square a point stands on the model's surface (the far field's: a target 40 km off is the wall, not the square's edge) */
const S2H=TERR.R*1.1,anyH=(x,z)=>Math.abs(x)<S2H&&Math.abs(z)<S2H?solidH(x,z):MODEL.h(x,z);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,solidH(cx,cz)+dyc,cz,tx,anyH(tx,tz)+dyt,tz];
const KINREG=()=>REG.filter(r=>r.label&&r.label.indexOf('read in place')>=0);
function nearKin(key,x,z){let b=null,bd=1e9;for(const r of KINREG()){if(r.key!==key)continue;const d=Math.hypot(r.x-x,r.z-z);if(d<bd){bd=d;b=r;}}return b;}
/* a camera d metres from a registered thing (a kin tree, a building), looking at it */
function atRec(r,d,az,dy){const cx=r.x+Math.cos(az)*d,cz=r.z+Math.sin(az)*d;const rh=r.h==null?4:r.h;return[cx,Math.max(solidH(cx,cz)+1.7,r.y+(dy==null?rh*.5:dy)),cz,r.x,r.y+rh*.5,r.z];}
const VIEWS=LAND.views({look,gh,solidH,atRec,nearKin,drawnH});
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&GCH.plantOfItem(item),kin=o.userData.kit&&o.userData.kit!=='greatchasm'?o.userData.kit:null;
 const tg=PLT?PLT.tags:null;
 if(PLT)name=PLT.name+'  ·  '+lab;
 const cls=PLT||isItem?'flora · the Great Chasm'+(kin?' · read in place from '+kin:'')+(tg&&tg.standin?' · stand-in for '+tg.standin:''):(o.userData.post?'structure · the trade post':o.userData.rock?'rock · the chasm':'terrain');
 const H=typeof KTAGS!=='undefined'&&KTAGS.hazardAt?KTAGS.hazardAt(p.x,p.y,p.z):null;
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+(H?'\n'+H:'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+atmAt(p.y).toFixed(2)+' atm, '+tmAt(p.y).toFixed(0)+' degC mean)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:9000000,calls:500},
 cls:{pass:6000000,host:3000000},
 type:{'greatchasm/floor':'pass','greatchasm/kin':'pass','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
/* the texture units a lit program reads, counted on the linked program (its active sampler uniforms: the ground's paint, grain, strata, horizon,
   the rain's cover and its library layers). Never more than 16 (the GPUs' floor; SwiftShader would link 32) */
function unitsOf(){const gl=renderer.getContext(),T=[gl.SAMPLER_2D,gl.SAMPLER_CUBE,gl.SAMPLER_3D,gl.SAMPLER_2D_SHADOW,gl.SAMPLER_2D_ARRAY].filter(v=>v!=null);
 const count=pr=>{let n=0;const N=gl.getProgramParameter(pr,gl.ACTIVE_UNIFORMS);for(let i=0;i<N;i++){const u=gl.getActiveUniform(pr,i);if(u&&T.indexOf(u.type)>=0)n+=u.size;}return n;};
 let ground=null,worst=0,name='';const gp=renderer.properties.get(GROUND.material),cp=gp&&(gp.currentProgram||gp.program);if(cp&&cp.program)ground=count(cp.program);   /* r128 keeps it as currentProgram */
 for(const P of renderer.info.programs||[]){const n=count(P.program);if(n>worst){worst=n;name=P.name||P.cacheKey||'';}}
 return{ground,worst,name:String(name).slice(0,40),programs:(renderer.info.programs||[]).length};}
const HCHK={
 // the ground cover the station's land names (LAND.plants) is placed somewhere on its page
 placedIn(keys,st){const zero=keys.filter(k=>!(st[k]>0));return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):keys.length+' kinds placed: '+keys.map(k=>k+' '+st[k]).join(', ')};},
 // every plant carries its tags, the Koppen classes among them, inside the region's classes and outside the barren ones
 tagged(PL){const reg=Object.keys(GCH.KOPPEN).concat(['BSk']),bad=[];
  for(const k in PL){const t=PL[k].tags||{},kp=t.koppen||[];if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||!kp.length||kp.some(c=>reg.indexOf(c)<0||GCH.BARREN.indexOf(c)>=0))bad.push(k);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):Object.keys(PL).length+' plants tagged (climate, aridity, abyssal, riparian, Koppen)'};},
 // nothing grows on barren ground (over 8.8 km, the ice)
 barren(P,bf){bf=bf||FIELD.barren;const bad=P.filter(p=>bf(p[0],p[2])>.95);
  return{ok:!bad.length,detail:bad.length?bad.length+' on barren ground (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none on barren ground'};},
 // no tree on a cliff face: steep (the host's slope) and bedded rock showing (its strata weight); the kin trees only (the kit has none)
 cliffs(T,sf,tf){sf=sf||FIELD.slope;tf=tf||FIELD.strata;const bad=T.filter(t=>sf(t.x,t.z)>.97&&tf(t.x,t.z)>.5);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on cliff faces (first '+bad[0].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a bedded face'};},
 // nothing rooted on a KSTACKS body (a mesa, a fin, the horn's knobs) or at its foot
 offRock(P){const bad=P.filter(p=>{const f=KSTACKS.foot(ROCK,p[0],p[2]);return f&&f.d<.5;});
  return{ok:!bad.length,detail:bad.length?bad.length+' on a rock body (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':ROCK.length+' bodies, none under a plant'};},
 // the preset cameras stand over what is drawn: the ground mesh's triangles and the rock bodies' tops, by half a metre at least
 camerasOut(C){const bad=C.filter(c=>c.y<solidH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under what is drawn: '+bad.map(c=>c.view).join(', '):C.length+' cameras over the drawn ground and rock'};},
 // the land stands on the scale model's drawn heights: at the model's cells inside the ground's square the ground is within tol m of the cell's
 // own height, except where the station sculpts on purpose (LAND.sculpt(x, z): true there); the far field is the model's surface at its cells
 model(tol,ground){const C=MODEL.cell,R=TERR.R,bad=[];let n=0;
  for(let j=-Math.floor(R/C);j<=Math.floor(R/C);j++)for(let i=-Math.floor(R/C);i<=Math.floor(R/C);i++){const x=i*C,z=j*C;if(LAND.sculpt&&LAND.sculpt(x,z))continue;n++;
   const d=ground(x,z)-MODEL.at(x,z);if(Math.abs(d)>tol)bad.push([x,z,Math.round(d)]);}
  let far=0;if(FAR)for(const [i,j] of [[20,0],[0,-25],[-30,10],[40,40],[-45,-45]]){const x=i*C,z=j*C;if(Math.abs(MODEL.h(x,z)-MODEL.at(x,z))>1)far++;}
  return{ok:!bad.length&&far===0&&n>0,detail:(bad.length?bad.length+' of '+n+' cells off the model (first '+JSON.stringify(bad[0])+'); ':n+' cells on the model within '+tol+' m; ')+(far?far+' far cells off the model':'the far field on the model\'s cells')};},
 // the ground's lit program reads 15 texture units or fewer (ANGLE on the Arc), every lit program 16, counted on the linked programs
 units(U){const n=U.ground==null?U.worst:U.ground;return{ok:U.programs>0&&U.ground!=null&&n<=15&&U.worst<=16,detail:'the ground\'s program '+(U.ground==null?'not found':U.ground)+' sampler units (15 at most: the Arc\'s); the most of any of '+U.programs+' linked programs '+U.worst+' ('+U.name+'; 16 at most)'};},
 // the dangers are on the page: the ambient fields provided, the station's records registered with their hazard tags
 hazards(H,min){const ok=!!H&&H.ambient.indexOf('pressure')>=0&&H.ambient.indexOf('temperature')>=0&&H.records>=min;
  return{ok,detail:H?'ambient '+H.ambient.join(', ')+'; '+H.records+' hazard records (at least '+min+')':'no core/hazard on the page'};},
 // every kin row the station lists grew somewhere (a row whose kit is missing grows nothing and says so)
 kin(K,rows){if(!rows.length)return{ok:true,detail:'no kin on this station'};const zero=rows.filter(r=>!(K&&K[r.key]>0)).map(r=>r.ref);
  return{ok:!zero.length&&!(K&&K.missing),detail:zero.length?'grew none: '+zero.join(', '):rows.map(r=>r.key+' '+K[r.key]).join(', ')}}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),st=(window._biome&&window._biome.under)||{};
 add('the station\'s ground cover placed',HCHK.placedIn(LAND.plants||[],st));
 add('every plant tagged with its Koppen classes',HCHK.tagged(GCH.PLANTS));
 add('nothing grows on barren ground',HCHK.barren(P));
 add('no tree on a bedded cliff face',HCHK.cliffs(KINREG()));
 if(ROCK.length)add('nothing rooted on a rock body (a mesa, a fin, a knob)',HCHK.offRock(P));
 add('the ground stands on the scale model\'s drawn heights',HCHK.model(LAND.modelTol==null?60:LAND.modelTol,terrainH));
 add('the ground reads 15 texture units or fewer, every lit program 16',HCHK.units(unitsOf()));
 add('the dangers are registered (KHAZ)',HCHK.hazards(window._hazards,LAND.hazardMin==null?1:LAND.hazardMin));
 add('every kin row grew',HCHK.kin(window._kin,LAND.kin||[]));
 add('preset cameras over what is drawn',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 if(LAND.checks)LAND.checks(add);
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 if((LAND.plants||[]).length){const st=Object.assign({},(window._biome&&window._biome.under)||{});st[LAND.plants[0]]=0;add('a kind of ground cover never placed',HCHK.placedIn(LAND.plants,st));}
 add('a plant with no Koppen classes',HCHK.tagged({x:{tags:Object.assign({},GCH.PLANTS.needlefur.tags,{koppen:[]})}}));
 add('a plant tagged with the ice cap',HCHK.tagged({x:{tags:Object.assign({},GCH.PLANTS.needlefur.tags,{koppen:['EF']})}}));
 add('a tree on a cliff face',HCHK.cliffs([{x:0,z:0,key:'test'}],()=>1,()=>1));
 add('a plant on barren ground',HCHK.barren([[0,9500,0,'test']],()=>1));
 if(ROCK.length){const B=ROCK[0];add('a plant on a rock body',HCHK.offRock([[B.x,B.top,B.z,'test']]));}
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:drawnH(0,0)-5,z:0}]));
 add('the ground lifted off the model',HCHK.model(LAND.modelTol==null?60:LAND.modelTol,(x,z)=>terrainH(x,z)+500));
 add('a ground with 16 units',HCHK.units({ground:16,worst:16,name:'test',programs:1}));
 add('no hazard records',HCHK.hazards({ambient:['pressure','temperature'],records:0},1));
 if((LAND.kin||[]).length)add('a kin row that grew nothing',HCHK.kin({},LAND.kin));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');   /* the runtime LOD: each chunk mesh by its range */
KHOST.on(function shadowTick(){if(window._shadow)window._shadow.update();},'view');
/* the frame: the shared sky's pass, then the world; with the heat shimmer (89a) the sky goes into the shimmer's target first and the world over it */
/* renderer.info counts the whole frame (sky, world, pass), not the last quad: reset by hand at the frame's start */
if(SHIMMER)renderer.info.autoReset=false;
const DRAW=SHIMMER?function(sc,cam,dt){renderer.info.reset();renderer.setRenderTarget(SHIMMER.target);SKY.renderSky();renderer.clearDepth();const ac=renderer.autoClear;renderer.autoClear=false;
 try{SHIMMER.draw(sc,cam,dt);}finally{renderer.autoClear=ac;}}:SKY.draw;
KHOST.take({build:LAND.build_id||'greatchasm',title:LAND.title||'Krator biome — the Great Chasm',
 hint:LAND.hint||'The Great Chasm',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 /* THE HOUR THE PAGE OPENS: 14:00, not the shared 11:00. On game start's day (the spring equinox) the giant eclipses the sun at the chasm's
    longitude from 10:00 to 12:00 (ATMOS.sunHidden at 5.1 px ~1700: the sun is 0 at 11:00, the world unlit), so the shared hour would open the
    page in the eclipse; 14:00 is the floor's hot afternoon (?hour= still sets any hour, the eclipse included) */
 clock:{hour:LAND.hour==null?14:LAND.hour},draw:DRAW,
 controls:[AIR_CONTROL].filter(Boolean),
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,drawnH,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,
 at:(x,z)=>{const o={h:terrainH(x,z),drawn:drawnH(x,z),model:MODEL.at(x,z),atm:+atmAt(terrainH(x,z)).toFixed(3),tm:+tmAt(terrainH(x,z)).toFixed(1)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=GCH.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
