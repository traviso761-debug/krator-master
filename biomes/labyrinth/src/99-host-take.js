// ================================================================= HOST — the views, inspector words and probe checks (every station), handed to core/host
// copperglacier's take, its views and checks the Gate's: the Hall, the stacks, the pond, the river, the knobs; the checks' negative controls.
const drawnH=(function(){const p=GROUND.geometry.attributes.position.array,N=480,nx=N+1,S=TERR.R*2.2,cs=S/N,H=k=>p[k*3+1];
 return(x,z)=>{const fu=clamp((x+S/2)/cs,0,N-1e-6),fv=clamp((z+S/2)/cs,0,N-1e-6),i=Math.floor(fu),j=Math.floor(fv),u=fu-i,v=fv-j,a=j*nx+i,b=a+nx,c=b+1,d=a+1;
  return u+v<=1?H(a)+(H(d)-H(a))*u+(H(b)-H(a))*v:H(c)+(H(b)-H(c))*(1-u)+(H(d)-H(c))*(1-v);};})();
const gh=(x,z,dy)=>Math.max(terrainH(x,z),drawnH(x,z),waterH(x,z))+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const lookY=(cx,cy,cz,tx,ty,tz)=>[cx,cy,cz,tx,ty,tz];
const recOf=re=>REG.find(r=>re.test(r.name));
const stk=k=>STACKS.find(S=>S.key===k);
const VIEWS=(function(){const V={},Y=LEVEL;
 // the Hall from the south-east bank across the pond, the stacks behind it and the walls far off
 V['The Hall of Heroes']=lookY(-760,Y+210,980,160,Y+180,-260);   /* from the south-west bank: the stacks behind the Hall, the neck's walls far off north-east */
 // from the neck, looking west up the Labyrinth: the Hall in its pond, the chaos's knobs, the north wall's toe
 V['Into the Labyrinth']=lookY(2300,Y+120,300,-400,Y+180,-200);
 // the neck from the Hall's upper slab: the river leaving east between the walls (the north wall's toe at 2.4-6.4 km, the south side)
 V['The neck']=lookY(300,Y+300,150,6000,Y+900,-2500);
 // the funeral road: causeway 3 (south-west), its skull poles toward the plinth (the Kimr's necropolis)
 {const a=2*Math.PI/3;V['The funeral road']=look(Math.cos(a)*400,Math.sin(a)*400+16,1.8,Math.cos(a)*190,Math.sin(a)*190,14);}
 // the stacks from the pond's north-east bank: the bridges, the saucers, the Garden Stack's fall
 {const S=stk('S1');V['The stacks']=look(420,-80,30,S.x,S.z,170);}
 // the Garden Stack's fall into its pool
 {const f=GATE.plan.falls[0];if(f)V['The Garden Stack\'s fall']=look(f.x+f.nx*240+f.nz*80,f.z+f.nz*240-f.nx*80,20,f.x,f.z,120);}
 // the Gowd Warra above the pond, its gallery woods
 {const P=RIVER.lines[0],a=P[Math.floor(P.length*.45)],b=P[Math.floor(P.length*.75)];V['The Gowd Warra']=look(a[0],a[1]+60,8,b[0],b[1],2);}
 // a knob of the chaos
 {const K=KNOBS[0];V['A knob of the chaos']=look(K.x+K.R*2.4,K.z+K.R*1.6,20,K.x,K.z,(K.top-K.y0)*.4);}
 V['From afar']=lookY(-2400,Y+700,2600,0,Y+120,0);
 return V;})();
function hazardWords(p){return typeof KTAGS!=='undefined'&&KTAGS.hazardAt?'\n'+KTAGS.hazardAt(p.x,p.y,p.z):'';}
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 const name=best?best.name+'  ·  '+lab:lab;
 return name+'\n'+(isItem?'flora (the nwlowlands kit, read in place) · '+SITE.name:o.userData.host?'structure · '+SITE.name:'terrain / water')+
  '\nwet '+(FIELD.wet(p.x,p.z)*100|0)+'% · rock '+(FIELD.rock(p.x,p.z)*100|0)+'% · meadow '+(FIELD.meadow(p.x,p.z)*100|0)+'%'+
  hazardWords(p)+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:16000000,calls:220},cls:{pass:15000000,host:4000000},type:{['labyrinth/'+SITE.key]:'pass','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const HCHK={
 // the Hall, its stacks, its tombs and its funeral road drawn on the page
 hall(g,ga){const ok=!!(g&&g.tris>50000&&ga&&ga.ruin&&ga.ruin.tombs>100&&ga.ruin.poles>20);
  return{ok,detail:g?('the Hall '+g.tris+' triangles; '+(ga&&ga.ruin?ga.ruin.tombs+' tombs, '+ga.ruin.poles+' skull poles':'no ruin')):'no Hall'};},
 // nothing roots in the pond, the river or on the rock
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6;});return{ok:!bad.length,detail:bad.length?bad.length+' plants under the water (first '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' plants, none drowned'};},
 offRock(P){const bad=P.filter(p=>rockFoot(p[0],p[2])<1);return{ok:!bad.length,detail:bad.length?bad.length+' plants inside a stack or knob (first '+bad[0].slice(0,3).map(v=>v|0)+')':'none on the rock'};},
 // the river never climbs (the owner's rule)
 graded(L){let up=0;L.forEach(P=>{for(let i=1;i<P.length;i++)if(P[i][2]>P[i-1][2]+1e-6)up++;});return{ok:!up,detail:up?up+' river steps climb':L.reduce((s,P)=>s+P.length,0)+' river points, none climbing'};},
 // the bridges' stack ends are in the rock (fit to the drawn outline: GATESTACKS.EMBED)
 bridges(B){const bad=B.filter(b=>[b.a,b.b].some(e=>e.stack&&!(KSTACKS.topAt(STACKS.filter(S=>S.key===e.stack),e.x,e.z)>=b.y)));return{ok:B.length>=6&&!bad.length,detail:bad.length?bad.length+' bridge ends in the air ('+bad.map(b=>b.key).join(' ')+')':B.length+' bridges, every stack end embedded'};},
 camerasOut(Cm){const bad=Cm.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):Cm.length+' cameras above the ground'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the Hall of Heroes, its tombs and the funeral road drawn',HCHK.hall(window._gate,window._gatearc));
 add('nothing rooted under the water',HCHK.dry(P));
 add('nothing rooted on the rock',HCHK.offRock(P));
 add('the Gowd Warra never climbs',HCHK.graded(RIVER.lines));
 add('every bridge\'s stack end is in its rock',HCHK.bridges(GATE.plan.bridges));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('no Hall',HCHK.hall(null,null));
 add('a plant drowned',HCHK.dry([[0,LEVEL-3,PONDD.b*.6,'biome:x']]));
 {const S=STACKS[0];add('a plant inside a stack',HCHK.offRock([[S.x,S.y0+LEVEL,S.z,'biome:x']]));}
 add('a river that climbs',HCHK.graded([[[0,0,10],[10,0,12]]]));
 {const b=GATE.plan.bridges[0],bad=Object.assign({},b,{b:Object.assign({},b.b,{x:b.b.face[0]+b.b.n[0]*30,z:b.b.face[1]+b.b.n[1]*30})});add('a bridge end in the air',HCHK.bridges([bad].concat(GATE.plan.bridges.slice(1))));}
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:300,y:LEVEL-20,z:600}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
const MS=STILLS[0];
const EXPORT_BOX=(function(){const c=[PONDD.a*.5,PONDD.b+120];return[c[0]-300,c[1]-300,c[0]+300,c[1]+300].map(Math.round);})();
const MIRROR=MS&&WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[MS.mat],level:MS.level,center:MS.center,radius:MS.radius,far:MS.far,
 hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.take({build:'labyrinth-'+SITE.key,title:'Krator biome — the Labyrinth: '+SITE.name,
 hint:SITE.region+' ('+SITE.koppen.join(', ')+', '+SITE.floor+' m, '+SITE.atm+' atm, '+SITE.rain+' mm): the Hall of Heroes (the Kimrs\' ancestral arcology, their necropolis) in its pond on the Gowd Warra, its five carved stacks bridged to it, the chaos\'s knobs; scale model 5.1 px '+SITE.px+','+SITE.py,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:MIRROR?()=>{MIRROR.update();SKY.draw();}:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]},
  ...(typeof KTAGS!=='undefined'&&KTAGS.hazardLayer?{'hazards':KTAGS.hazardLayer()}:{})},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris+(GATE?GATE.tris:0),inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,gate:()=>window._gate,
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 exportBox:EXPORT_BOX,
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
