// ================================================================= HOST — the inspector's words and the probe's checks, handed to core/host
// Forked from biomes/hearths' (its hold's checks left out). The views are 98v's, the eye's helpers 98u's.
// ---------------------------------------------------------------- the inspector
function hazardWords(p){return typeof KTAGS!=='undefined'&&KTAGS.hazardAt?'\n'+KTAGS.hazardAt(p.x,p.y,p.z):'';}
function describe(hit){const p=hit.point,o=hit.object,t=Math.round(CAVE.temp(p.x,p.z));
 let head;const rec=o.userData.recs&&hit.instanceId!=null?o.userData.recs[hit.instanceId]:null;
 if(rec&&rec.kind==='block')head='Gypsum blocks: '+rec.parts.length+' crystals to '+rec.len.toFixed(1)+' m (KSPELEO '+rec.id+')';
 else if(rec&&rec.kind==='druse')head='Bladed gypsum: '+rec.pts.length+' points to '+(rec.len*100|0)+' cm (KSPELEO '+rec.id+')';
 else{let best=null;for(const r of REG){if(r.r>300||!r.tags||!r.tags.cave)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}head=(best?best.name+'  ·  ':'')+(o.userData.inspectLabel||o.name||'mesh');}
 return head+'\n'+SITE.region+' · '+(SITE.G+p.y).toFixed(0)+' m · 6.2 km of rock overhead · air '+t+' degC'+hazardWords(p)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's checks (each with a negative below)
const BUDGET={showcase:{tris:2500000,calls:80},cls:{rock:900000,crystal:1200000,host:400000},type:{cavern:'rock',hypogene:'crystal',selenite:'crystal',blades:'crystal'}};
const hazList=()=>typeof KHAZ!=='undefined'?KHAZ.list().map(r=>KHAZ.of(r)||r).filter(Boolean):[];
const HCHK={
 // the rock drawn: KCAVERN's chunks meshed (a cavern never built lists no chunk, and the page draws its crystals in the dark)
 rock(R){return{ok:R.chunks>0&&R.tris>0&&R.meshes>0,detail:R.chunks+' chunks, '+R.meshes+' meshes, '+R.tris+' triangles'};},
 /* the Marble Hall carved as the tube record has it: open at its middle and out toward its ends and sides, under its crown */
 hall(Hl,sdf){const P=[[0,2,0],[.75,2,0],[-.75,2,0],[0,2,.75],[0,2,-.75],[0,.8,0]].map(q=>[Hl.c[0]+q[0]*Hl.rx,Hl.c[1]+(q[1]>1.5?q[1]:Hl.h*q[1]),Hl.c[2]+q[2]*Hl.rz]);
  const shut=P.filter(p=>sdf(p[0],p[1],p[2])<=.3),ok=!shut.length&&Hl.rx*2>=240&&Hl.rz*2>=150&&Hl.h>=55;
  return{ok,detail:(Hl.rx*2)+' x '+(Hl.rz*2)+' m, '+Hl.h+' m; '+(P.length-shut.length)+' of '+P.length+' test points open'};},
 /* the hall's floor in the plan's band for the upper level (5.6-5.9 km: section 2a, "no point of the walk stands over 5.9 km") */
 level(y){const a=SITE.G+y;return{ok:a>=5600&&a<=5900,detail:'the hall\'s floor at '+a.toFixed(0)+' m'};},
 /* every cupola open at its middle */
 cupolas(L,sdf){const shut=L.filter(u=>sdf(u.c[0],u.c[1]+u.h*.4,u.c[2])<=.2);return{ok:L.length>=3&&!shut.length,detail:L.length+' cupolas, '+shut.length+' shut'};},
 /* the dress: the hypogene crust's pieces and the floor's gypsum */
 dress(H,F){return{ok:H.length>0&&F.length>0,detail:H.length+' hypogene pieces, '+F.length+' gypsum floor groups'};},
 /* bad air pooled on every chamber of the lower storey (KKARST's gas, shape.pool) */
 gas(L){const n=CAVE.chambers.filter(c=>c.storey===0).length,G=L.filter(r=>r.kind==='gas'&&r.shape&&r.shape.pool);return{ok:n>0&&G.length>=n,detail:G.length+' pooled gas hazards for '+n+' chambers of the lower storey'};},
 /* the water is scalding only near the feeders (KTHERM): every pool at the scald or over has a heat hazard, none under it does */
 poolHeat(P,L){const hz=new Set(L.filter(r=>/:heat$/.test(r.id)).map(r=>r.id.replace(/:heat$/,''))),hot=P.filter(p=>p.temp>=SITE.therm.scald),miss=hot.filter(p=>!hz.has(p.id)),extra=P.filter(p=>p.temp<SITE.therm.scald&&hz.has(p.id));
  return{ok:P.length>0&&!miss.length&&!extra.length,detail:miss.length?miss.length+' scalding pools without a heat hazard':extra.length?extra.length+' warm pools marked scalding':P.length+' pools: '+hot.length+' scalding, '+(P.length-hot.length)+' warm'};},
 /* sealed: no vent breaks the surface 6 km up, no daylight anywhere */
 sealed(T,g){return{ok:!T.length&&g>=6000,detail:T.length+' vents; the crest '+g.toFixed(0)+' m over the hall'};},
 /* every view's eye stands in the open */
 eyes(Cm){const bad=Cm.filter(c=>CAVE.C.sdf(c.x,c.y,c.z)<.3||c.y<WL+.3);return{ok:!bad.length&&Cm.length>=5,detail:bad.length?'in the rock or the water: '+bad.map(c=>c.view).join(', '):Cm.length+' view cameras in the open air'};}};
const _sdf=(x,y,z)=>CAVE.C.sdf(x,y,z);
const _cams=()=>Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),Hl=CAVE.hall;
 add('the Marble Hall carved as the tube record has it (240 x 150 m, 55 m)',HCHK.hall(Hl,_sdf));
 add('its floor in the upper level\'s band (5.6-5.9 km)',HCHK.level(Hl.c[1]));
 add('the cupolas in its roof open',HCHK.cupolas(CAVE.hallCupolas,_sdf));
 add('the hypogene dress and the gypsum floor drawn',HCHK.dress(CAVE.hypo,CAVE.floor));
 add('bad air pooled on every chamber of the lower storey',HCHK.gas(hazList()));
 add('the water scalds only near the feeders (KTHERM)',HCHK.poolHeat(CAVE.water?CAVE.water.pools:[],CAVE.hazards));
 add('sealed under the crest (no vent, no daylight)',HCHK.sealed(CAVE.throats,SITE.ground(Hl.c[0],Hl.c[2])-Hl.c[1]));
 add('the cave\'s rock drawn (KCAVERN\'s chunks)',HCHK.rock(ROCK));
 add('the views\' cameras stand in the open',HCHK.eyes(_cams()));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),Hl=CAVE.hall;
 add('the hall filled with rock',HCHK.hall(Hl,()=>-1));
 add('the hall\'s floor at 6.5 km',HCHK.level(Hl.c[1]+800));
 add('a cupola shut',HCHK.cupolas(CAVE.hallCupolas,()=>0));
 add('no dress',HCHK.dress([],CAVE.floor));
 add('no pooled gas',HCHK.gas([]));
 {const P=(CAVE.water?CAVE.water.pools:[]).map(p=>Object.assign({},p));const h=P.find(p=>p.temp>=SITE.therm.scald);
  add('a pool marked wrongly',h?HCHK.poolHeat(P,CAVE.hazards.filter(r=>r.id!==h.id+':heat')):HCHK.poolHeat(P.length?[Object.assign({},P[0],{temp:SITE.therm.scald+10})]:[],[]));}
 add('a vent to the surface',HCHK.sealed([{c:[0,0]}],6200));
 add('the cavern never built',HCHK.rock({chunks:0,meshes:0,tris:0}));
 add('a camera in the rock',HCHK.eyes([{view:'rock',x:Hl.c[0],y:Hl.c[1]-8,z:Hl.c[2]}]));
 return R;}
const EXPORT_BOX=[FX-60,FZ-60,FX+60,FZ+60].map(Math.round);
KHOST.take({build:'neouterwall-cave',title:'Krator biome — the NE outer wall: '+STATION.name,
 hint:'The Epidote Cave (tube_epidote_16, scale model 5.1 px '+SITE.px+','+SITE.py+'): the Marble Hall, '+(SITE.G+CAVE.hall.c[1]).toFixed(0)+' m, 6.2 km of rock overhead; '+
  'the dry upper storey (KKARST hypogene, KSPELEO gypsum), the lower storey\'s hot water 80 m below (KTHERM). The lamp is the only light (?lamp=0). PLAN.md section 2a',
 scene,camera,renderer,ground:groundEye,clear:1.5,registry:REG,regHas,views:VIEWS,onView,ticks:TICKS,
 clock:{hour:12},inspect:describe,stats:()=>'blocks '+CRYSTALS.blocks+' · blades '+CRYSTALS.points+' · rock '+ROCK.tris+' tris',
 layers:{'gypsum':{match:o=>!!(o.userData&&o.userData.crystal)},'rock':{match:o=>!!(o.userData&&o.userData.rock)},
  ...(typeof KTAGS!=='undefined'&&KTAGS.hazardLayer?{'hazards':KTAGS.hazardLayer()}:{})},
 exporters:{biome:()=>BIO.export(),cave:()=>CAVE.export()},
 minimap:{title:STATION.name},
 guards:false,   /* the biome core's card guards: no foliage on this page, so their negatives could not fail */
 budget:BUDGET,types:()=>({cavern:{tris:ROCK.tris,inst:0,meshes:ROCK.meshes},hypogene:{tris:HYPO.tris,inst:0,meshes:HYPO.mesh?1:0},selenite:{tris:CRYSTALS.tris.selenite,inst:CRYSTALS.sel?CRYSTALS.sel.count:0,meshes:1},
  blades:{tris:CRYSTALS.tris.blades,inst:CRYSTALS.blades?CRYSTALS.blades.count:0,meshes:1}}),
 api:{hostChecks,hostNegatives,
  get totals(){return {tris:ROCK.tris+HYPO.tris+CRYSTALS.tris.selenite+CRYSTALS.tris.blades,inst:window._instances,meshes:ROCK.meshes+3,registered:REG.length,types:4};},
  cave:()=>({chambers:CAVE.chambers.length,passages:CAVE.passages.length,hot:CAVE.hot.map(c=>c.id),hall:CAVE.hall,cupolas:CAVE.hallCupolas.length,blocks:CRYSTALS.blocks,points:CRYSTALS.points,hypo:CAVE.hypo.length}),
  exportProfile:['registry','hazards','terrain','stage','atmos','water'],   /* no flora: no items, buckets or BIO materials */
  exportBox:EXPORT_BOX,
  at:(x,z)=>({floor:terrainH(x,z),water:waterH(x,z),temp:CAVE.temp(x,z)})}});
