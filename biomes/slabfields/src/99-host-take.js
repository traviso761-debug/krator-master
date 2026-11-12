// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const VIEWS=(function(){const S=SITE,zf=L.footZ(0),zt=L.toeZ(0)||-2000,big=BLOCKS.filter(b=>b.big),B0=big[0]||BLOCKS[0],s=L.SEEPS[Math.floor(L.SEEPS.length/2)];
 return{'The Anvil from its apron':look(-300,zt+500,2,0,zf+400,900),
  'The cliff\'s face':look(400,zf-700,30,200,zf+300,700),
  'Under the face (the talus)':look(-600,zf-260,2,-500,zf+100,300),
  'A field-sized block':look(B0.x-B0.r*2.6,B0.z-B0.r*2.2,2,B0.x,B0.z,(B0.top-B0.y0)*.5),
  'The spring line':look(s.x+60,s.z-80,1.8,s.x,s.z,0),
  'Along the toe':look(-2000,(L.toeZ(-1200)||zt)-60,4,1500,(L.toeZ(1200)||zt)+40,10),
  'From afar':look(-1600,-2700,260,0,zf,600)};})();
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(SLAB.plantOfItem(item)||(typeof OIDONG!=='undefined'&&OIDONG.plantOfItem&&OIDONG.plantOfItem(item)));
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null;
 return name+'\n'+(isItem?'flora · '+SITE.name:'terrain / water')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\nwet '+(FIELD.wet(p.x,p.z)*100|0)+'% · apron '+(FIELD.apron(p.x,p.z)*100|0)+'% · cold '+(FIELD.cold(p.x,p.z)*100|0)+'%\n'+
  p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+' ('+(1.6*Math.exp(-p.y/8000)).toFixed(2)+' atm)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:10000000,calls:140},cls:{apron:4000000,pass:6000000,host:3000000},type:{'slabfields/apron':'apron','oidong/high':'pass','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const HCHK={
 placed(st){const need=['ferns','reeds','grass','lichen'],zero=need.filter(k=>!(st&&st[k]>0));return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', ')};},
 // the reed keeps to the spring line; the fern to the blocks' shade
 ground(P){const bad=P.filter(p=>(p[3]==='biome:slreed'&&FIELD.wet(p[0],p[2])<.4)||(p[3]==='biome:slfern'&&FIELD.shade(p[0],p[2])<.1));
  return{ok:!bad.length,detail:bad.length?bad.length+' on the wrong ground (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':'reed at the spring line, fern in the shade'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned'};},
 // the slab: its crest stands within 150 m of the model's (edit 513's slab_anvil, 5,356 m) and its cliff is a cliff (2 km in under 900 m)
 slab(){const zr=L.rimZ(0),crest=Math.max(...[...Array(51).keys()].map(i=>{const x=-2500+i*100;return landH(x,L.rimZ(x)+80);})),   /* the crest along the page (the scar cuts its middle back) */foot=landH(0,L.footZ(0)-40),run=L.footZ(0)-40-zr;
  const ok=Math.abs(crest-SITE.slab.crest)<=150&&crest-foot>1600&&Math.abs(run)<900;return{ok,detail:'crest '+crest.toFixed(0)+' m (model '+SITE.slab.crest+'), cliff '+(crest-foot).toFixed(0)+' m over '+Math.abs(run).toFixed(0)+' m'};},
 blocks(){const n=BLOCKS.filter(b=>!b.talus).length,big=BLOCKS.filter(b=>b.big).length,over=BLOCKS.filter((a,i)=>BLOCKS.some((b,j)=>j>i&&Math.hypot(a.x-b.x,a.z-b.z)<a.r+b.r));
  return{ok:n>=SITE.blocks.n*.6&&big>=3&&!over.length,detail:n+' blocks ('+big+' field-sized), '+over.length+' overlapping'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};},
 water(){const w=window._water||{};return{ok:w.seeps>=3&&w.brook>4,detail:JSON.stringify(w).slice(0,200)};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the apron\'s life placed',HCHK.placed(window._station));
 add('plants on their ground (reed wet, fern shaded)',HCHK.ground(P));
 add('nothing rooted under the water',HCHK.dry(P));
 add('the Anvil matches the model (crest, cliff)',HCHK.slab());
 add('the blocks placed, kept apart',HCHK.blocks());
 add('the station\'s water drawn',HCHK.water());
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('no reed',HCHK.placed(Object.assign({},window._station,{reeds:0})));
 add('a reed on the dry apron',HCHK.ground([[0,0,L.footZ(0)-1500,'biome:slreed']]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
const HINT="Station 1 of the Slabfields (scale model 5.1, px 1662,1369; the middle bench at 3,290 m, 1.07 atm, Dsc, 141 mm): the Anvil, a lone slab of flood basalt thrust up and tilted as Io's mountains are, its 2 km north cliff along the south; the last collapse's apron of crushed basalt and field-sized blocks filling the page; the spring line at its toe, its seeps and their brook; void fern in the blocks' shade, reed at the seeps, bunch grass and lichen. Rockfall under the face, CO2 in the hollows on still nights (ideal type)";
KHOST.take({build:'slabfields'+(SKEY==='foot'?'':'-'+SKEY),title:'Krator biome — the Slabfields: '+SITE.name,hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:14},draw:SKY.draw,   /* the giant eclipses the sun at 11:00 on the sky's day 0 at this longitude (the Siphon Pits' finding): the page opens at 14:00 */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rock':{match:o=>!!(o.userData&&o.userData.rock)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,site:()=>SITE,
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 exportBox:(function(){const s=L.SEEPS[Math.floor(L.SEEPS.length/2)];return[s.x-200,s.z-200,s.x+200,s.z+200];})(),   /* the spring line: it holds the water */
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),apron:L.apronT(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
