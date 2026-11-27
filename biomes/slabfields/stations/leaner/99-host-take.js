// ================================================================= HOST — station 2's views, inspector words and probe checks, handed to core/host (the Leaner)
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const lookSV=(cs,cv,dyc,ts,tv,dyt)=>{const c=L.xz(cs,cv),t=L.xz(ts,tv);return look(c[0],c[1],dyc,t[0],t[1],dyt);};
const VIEWS=(function(){const PT=SITE.patera,live=L.SPRINGS.filter(q=>!q.dead),q0=live[Math.floor(live.length/2)]||L.SPRINGS[0],
  P0=L.PONDS.slice().sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0],K0=L.CRACKS.slice().sort((a,b)=>Math.abs(a.s)-Math.abs(b.s))[0],
  sh=s=>PT.c[1]+Math.sqrt(PT.shore*PT.shore-Math.pow(s-PT.c[0],2));   /* the shore's v at s */
 const v={'The Leaner over its patera':lookSV(-1300,sh(-1300)+40,3,600,L.rimV(600),500),   /* from the shelf by the water, up past the spill to the cliff */
  'The patera lake':lookSV(600,L.rimAtS(600)+60,25,-1400,PT.c[1]+1800,-20),   /* from the rim over the lake */
  'The road down the spill':lookSV(250,-880,3,-450,-1300,0),
  'The strandlines':lookSV(-1950,sh(-1950)+190,2,-1500,sh(-1500)+25,0),   /* along the shelf: the old shores tilted against the water's line */
  'A warm spring':[q0.x+q0.r*3+4,gh(q0.x+q0.r*3+4,q0.z+q0.r*2,2.2),q0.z+q0.r*2,q0.x,gh(q0.x,q0.z,-.5),q0.z],
  'Under the face':lookSV(-400,L.footV(-400)-320,3,-250,L.rimV(-250),300),
  'The crest\'s cracks':lookSV(K0.s-K0.len*.5-60,L.rimV(K0.s)+K0.back+30,3,K0.s+K0.len*.3,L.rimV(K0.s)+K0.back,-2),
  'From afar':lookSV(-600,-2400,320,800,L.rimV(800)+300,200)};
 if(P0)v['A tilted pond on the ramp']=look(P0.x-L.xz(0,P0.r*1.6)[0],gh(P0.x-L.xz(0,P0.r*1.6)[0],P0.z-L.xz(0,P0.r*1.6)[1],2.5),P0.z-L.xz(0,P0.r*1.6)[1],P0.x,gh(P0.x,P0.z,-.5),P0.z);
 return v;})();
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
  return{ok:!zero.length&&!rz,detail:(zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', '))+(ramp?'; the ramp: cushion '+ramp.cushion+', lichen '+ramp.lichen+', sedge '+ramp.sedge:SIPHON_ON?'; the ramp: none':'')};},
 // the reed keeps to the wet; the Siphon Pits' small life to the slab
 ground(P){const bad=P.filter(p=>(p[3]==='biome:slreed'&&FIELD.wet(p[0],p[2])<.4)||(/^biome:sp(cushion|lichen|sedge)$/.test(p[3])&&!ON_SLAB(p[0],p[2])));
  return{ok:!bad.length,detail:bad.length?bad.length+' on the wrong ground (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':'reed by the water, the cushions and sedge on the slab'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned'};},
 // the slab: its crest within 150 m of the model's (edit 517's slab_leaner, 3,355 m) and its cliff a cliff (over 1 km in under 700 m)
 slab(){const cr=[...Array(41).keys()].map(i=>{const s=-2000+i*100,[x,z]=L.xz(s,L.rimV(s)+60);return landH(x,z);}),crest=Math.max(...cr),[fx,fz]=L.xz(0,L.footV(0)-40),foot=landH(fx,fz);
  const ok=Math.abs(crest-SITE.slab.crest)<=150&&crest-foot>1000;return{ok,detail:'crest '+crest.toFixed(0)+' m (model '+SITE.slab.crest+'), cliff '+(crest-foot).toFixed(0)+' m over '+(SITE.slab.run+40)+' m'};},
 // the patera: the lake at its level under the shelf, the shelf over it, the wall a wall (over 60 m from the rim to the shelf in under 100 m)
 patera(){const PT=SITE.patera,s=PT.c[0]-500,   /* west of the spill */vr=L.rimAtS(s),[ax,az]=L.xz(s,vr+20),[bx,bz]=L.xz(s,vr-80),[cx,cz]=L.xz(s,PT.c[1]+PT.shore+200),[dx,dz]=L.xz(s,PT.c[1]+PT.shore-200);
  const rim=landH(ax,az),under=landH(bx,bz),shelf=landH(cx,cz),bed=landH(dx,dz),w=waterH(dx,dz);
  const ok=rim-under>60&&shelf>PT.level&&bed<PT.level&&Math.abs(w-PT.level)<.01;return{ok,detail:'rim '+rim.toFixed(0)+', under the wall '+under.toFixed(0)+', the shelf '+shelf.toFixed(1)+', the lake\'s bed '+bed.toFixed(1)+' under '+w.toFixed(1)+' m'};},
 // the tilt: every strandline over the water, each higher toward the ENE; every pond's water in its basin's SSE half
 tilt(){const T=SITE.tilt,bad=[];T.strands.forEach((t,k)=>{if(!(L.strandH(k,-2500)>0&&L.strandH(k,0)>L.strandH(k,-2500)))bad.push('strand '+k);});
  L.PONDS.forEach(p=>{const up=L.xz(0,-p.r*.7),dn=L.xz(0,p.r*.7);if(!(waterH(p.x+dn[0],p.z+dn[1])>-1e8)||waterH(p.x+up[0],p.z+up[1])>-1e8)bad.push('pond '+p.i);});
  return{ok:!bad.length&&L.PONDS.length>=3,detail:bad.length?'wrong: '+bad.join(', '):T.strands.length+' strandlines rising ENE, '+L.PONDS.length+' ponds wet at their low ends'};},
 blocks(){const n=BLOCKS.filter(b=>!b.talus).length,big=BLOCKS.filter(b=>b.big).length,over=BLOCKS.filter((a,i)=>BLOCKS.some((b,j)=>j>i&&Math.hypot(a.x-b.x,a.z-b.z)<a.r+b.r)),road=BLOCKS.filter(b=>L.nearRoad(b.x,b.z).d<b.r+4);
  return{ok:n>=SITE.blocks.n*.5&&big>=2&&!over.length&&!road.length,detail:n+' blocks ('+big+' field-sized), '+over.length+' overlapping, '+road.length+' on the road'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};},
 water(){const w=window._water||{};return{ok:w.lake===1&&w.springs>=3&&w.ponds>=3,detail:JSON.stringify(w).slice(0,200)};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the station\'s life placed',HCHK.placed(window._station));
 add('plants on their ground (reed wet, the ramp\'s on the slab)',HCHK.ground(P));
 add('nothing rooted under the water',HCHK.dry(P));
 add('the Leaner matches the model (crest, cliff)',HCHK.slab());
 add('the patera (rim, wall, shelf, lake)',HCHK.patera());
 add('the tilt (strandlines, ponds)',HCHK.tilt());
 add('the blocks placed, kept apart, off the road',HCHK.blocks());
 add('the station\'s water drawn',HCHK.water());
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('no reed',HCHK.placed(Object.assign({},window._station,{reeds:0})));
 add('a reed on the dry apron',HCHK.ground([[L.xz(-900,0)[0],0,L.xz(-900,0)[1],'biome:slreed']]));
 add('a cushion on the shelf',HCHK.ground([[L.xz(-1500,-1500)[0],0,L.xz(-1500,-1500)[1],'biome:spcushion']]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
const HINT="Station 2 of the Slabfields (scale model 5.1, px 1601,1392; the corridor's south end at 2,110 m, 1.23 atm, BSk, 235 mm, +17 degC): the Leaner, a slab of flood basalt still tilting (a sill inflating under it lifts it 25 cm a year), its cliff 1.25 km over the corridor across the south-east, its ramp falling 6.7 degrees behind the rim with open cracks behind the lip and ponds drifted to the low ends of their basins; its old apron spilling over the rim of the patera, a collapse pit 10 km across at its foot, where a warm lake has drifted off this shore and left its strandlines tilted on the shelf; warm springs on the shelf, the live low and the dead high; the corridor road down the spill and along the shore. Rockfall and quake swarms under the face, falls into the cracks and off the patera's wall, CO2 and H2S at the springs on still nights (ideal type)";
KHOST.take({build:'slabfields-'+SKEY,title:'Krator biome — the Slabfields: '+SITE.name,hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:14},draw:SKY.draw,   /* as station 1: the giant eclipses the sun at 11:00 on the sky's day 0 here; the page opens at 14:00 */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rock':{match:o=>!!(o.userData&&o.userData.rock)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,site:()=>SITE,
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 exportBox:(function(){const q=L.SPRINGS.filter(q=>!q.dead)[0]||L.SPRINGS[0];return[q.x-200,q.z-200,q.x+200,q.z+200];})(),   /* a live spring and the lake's edge: it holds the water */
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),apron:L.apronT(x,z),heat:HEAT_AT(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
