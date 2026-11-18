// ================================================================= HOST — station 3's views, inspector words and probe checks, handed to core/host (the Halves)
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const VIEWS=(function(){const PT=SITE.patera,live=L.SPRINGS.filter(q=>!q.dead&&q.pit==null),q0=live[Math.floor(live.length/2)]||L.SPRINGS[0],P0=L.PITS[0],big=BLOCKS.filter(b=>b.big),B0=big[0]||BLOCKS[0];
 return{'The south-east half over the pool':look(-900,-1150,3,1800,2300,700),   /* from the shore: the cliff and its torn end over the patera's wall */
  'The north-west half across the water':look(300,700,30,-1000,-9000,600),
  'The torn end':look(-700,1600,40,700,3000,500),
  'A pit of the chain':look(P0.c[0]+P0.r*1.25,P0.c[1]-P0.r*.6,4,P0.c[0],P0.c[1],-P0.depth*.8),
  'A warm spring':[q0.x+q0.r*3+4,gh(q0.x+q0.r*3+4,q0.z-q0.r*2,2.2),q0.z-q0.r*2,q0.x,gh(q0.x,q0.z,-.5),q0.z],
  'A field-sized block':look(B0.x-B0.r*2.6,B0.z-B0.r*2.2,2,B0.x,B0.z,(B0.top-B0.y0)*.5),
  'From afar':look(-2200,-1900,380,900,1800,500)};})();
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(SLAB.plantOfItem(item)||(typeof SIPHON!=='undefined'&&SIPHON.plantOfItem&&SIPHON.plantOfItem(item)));
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null;
 return name+'\n'+(isItem?'flora · '+SITE.name:'terrain / water')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\nwet '+(FIELD.wet(p.x,p.z)*100|0)+'% · apron '+(FIELD.apron(p.x,p.z)*100|0)+'% · ground '+HEAT_AT(p.x,p.z).toFixed(0)+' degC\n'+
  p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+' ('+(1.6*Math.exp(-p.y/8000)).toFixed(2)+' atm)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:10000000,calls:140},cls:{apron:4000000,pass:3000000,host:3000000},type:{'slabfields/apron':'apron','siphon/cold':'pass','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const HCHK={
 placed(st){const need=['reeds','grass','lichen'],zero=need.filter(k=>!(st&&st[k]>0)),ramp=st&&st.ramp?st.ramp:null,rz=SIPHON_ON?(!ramp||!(ramp.cushion>0&&ramp.lichen>0)):false;
  return{ok:!zero.length&&!rz,detail:(zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', '))+(ramp?'; the cold ground: cushion '+ramp.cushion+', lichen '+ramp.lichen+', sedge '+ramp.sedge:SIPHON_ON?'; the cold ground: none':'')};},
 // the reed keeps to the wet; the Siphon Pits' small life off the apron and the patera's floor
 ground(P){const bad=P.filter(p=>(p[3]==='biome:slreed'&&FIELD.wet(p[0],p[2])<.4)||(/^biome:sp(cushion|lichen|sedge)$/.test(p[3])&&!ON_SLAB(p[0],p[2])));
  return{ok:!bad.length,detail:bad.length?bad.length+' on the wrong ground (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':'reed by the water, the cushions off the rubble and the floor'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned'};},
 // the halves: each crest within 150 m of the model's (edit 517: 4,875 and 4,674 m), the south-east cliff a cliff (over 1.2 km in under 800 m)
 halves(){const H=SITE.halves,se=Math.max(...[...Array(21).keys()].map(i=>landH(1400+i*100,2200+60))),nw=Math.max(...[...Array(21).keys()].map(i=>landH(-8000+i*300,-14600+60))),foot=landH(2400,2200-H[0].run-40);
  const ok=Math.abs(se-H[0].crest)<=150&&Math.abs(nw-H[1].crest)<=150&&se-foot>1200;return{ok,detail:'south-east crest '+se.toFixed(0)+' m (model '+H[0].crest+'), north-west '+nw.toFixed(0)+' m (model '+H[1].crest+'), the cliff '+(se-foot).toFixed(0)+' m'};},
 // the patera: the pool at its level, the floor over it, the wall a wall (over 150 m from the bench to the floor)
 patera(){const PT=SITE.patera,rim=landH(0,PT.c[1]+PT.r+30),fl=landH(0,PT.c[1]+PT.r-300),bed=landH(0,PT.c[1]+PT.shore-200),w=waterH(0,PT.c[1]+PT.shore-200);
  const ok=rim-fl>150&&fl>PT.level&&bed<PT.level&&Math.abs(w-PT.level)<.01;return{ok,detail:'the bench '+rim.toFixed(0)+', the floor '+fl.toFixed(1)+', the pool\'s bed '+bed.toFixed(1)+' under '+w.toFixed(1)+' m'};},
 // the pits: each its depth under the bench, its seep wet
 pits(){const bad=L.PITS.filter(p=>{const b=landH(p.c[0]+p.r+40,p.c[1]),f=landH(p.c[0],p.c[1]);return b-f<p.depth*.8;}),seeps=L.SPRINGS.filter(q=>q.pit!=null&&waterH(q.x,q.z)>-1e8).length;
  return{ok:!bad.length&&seeps===L.PITS.length,detail:L.PITS.length+' pits, '+bad.length+' too shallow, '+seeps+' seeps wet'};},
 blocks(){const n=BLOCKS.filter(b=>!b.talus).length,big=BLOCKS.filter(b=>b.big).length,over=BLOCKS.filter((a,i)=>BLOCKS.some((b,j)=>j>i&&Math.hypot(a.x-b.x,a.z-b.z)<a.r+b.r));
  return{ok:n>=SITE.blocks.n*.4&&big>=2&&!over.length,detail:n+' blocks ('+big+' field-sized), '+over.length+' overlapping'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};},
 water(){const w=window._water||{};return{ok:w.lake===1&&w.springs>=3,detail:JSON.stringify(w).slice(0,200)};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the station\'s life placed',HCHK.placed(window._station));
 add('plants on their ground (reed wet, the cold ground\'s off the rubble)',HCHK.ground(P));
 add('nothing rooted under the water',HCHK.dry(P));
 add('the halves match the model (crests, cliff)',HCHK.halves());
 add('the patera (bench, wall, floor, pool)',HCHK.patera());
 add('the pit chain (depth, seeps)',HCHK.pits());
 add('the blocks placed, kept apart',HCHK.blocks());
 add('the station\'s water drawn',HCHK.water());
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('no reed',HCHK.placed(Object.assign({},window._station,{reeds:0})));
 add('a reed on the dry bench',HCHK.ground([[-2000,0,2000,'biome:slreed']]));
 add('a cushion on the apron',HCHK.ground([[2600,0,1000,'biome:spcushion']]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
const HINT="Station 3 of the Slabfields (scale model 5.1, px 1722,1376; the patera's floor at 3,108 m in the middle bench, 1.06 atm, Dsc, 173 mm, +7 degC): the Halves, one slab of flood basalt cut by a fault and pulled apart as Hi'iaka Montes are; the south-east half's north cliff, 1.5 km, and its torn west end across the south-east, its apron run out toward the patera with blocks on it; the north-west half across the water, its torn end facing back; between them the patera, a collapse pit 10 km across with a warm pool on its floor of old lava crust and warm springs on the shore; two pits of the chain along the split fault on the bench, each with a seep and CO2 on its floor. Rockfall under the face, falls off the walls, CO2 in the pits and the springs' hollows (ideal type; the outlaws the plan proposes for the Halves are not drawn)";
KHOST.take({build:'slabfields-'+SKEY,title:'Krator biome — the Slabfields: '+SITE.name,hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:14},draw:SKY.draw,   /* as station 1 (the giant's eclipse at 11:00 on the sky's day 0): the page opens at 14:00 */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rock':{match:o=>!!(o.userData&&o.userData.rock)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,site:()=>SITE,
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 exportBox:(function(){const q=L.SPRINGS.filter(q=>!q.dead&&q.pit==null)[0]||L.SPRINGS[0];return[q.x-200,q.z-200,q.x+200,q.z+200];})(),   /* a warm spring and the pool's edge: it holds the water */
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),apron:L.apronT(x,z),heat:HEAT_AT(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
