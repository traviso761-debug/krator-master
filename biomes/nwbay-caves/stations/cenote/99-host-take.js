// ================================================================= HOST — the views, the inspector's words and the probe's checks, handed to core/host
// The views stand in the open (a camera is moved out of the rock to the nearest clear point: eyeAt), in the water or the shaft's air.
const C0=CAVE.C,WL=SITE.water.level;
function eyeAt(x,y,z){const ok=(a,b,c)=>C0.sdf(a,b,c)>.8;if(ok(x,y,z))return[x,y,z];
 for(let r=1;r<=12;r+=1)for(let k=0;k<12;k++){const a=k/12*TAU,px=x+r*Math.cos(a),pz=z+r*Math.sin(a);for(const dy of[0,1,-.6,2,-1.5])if(ok(px,y+dy,pz))return[px,y+dy,pz];}return[x,y,z];}
const VIEWS=(function(){const V={},M=CAVE.M,ch=CAVE.N2.chambers.slice().sort((a,b)=>b.rx*b.rz-a.rx*a.rz),hr=CE.hall;
 {const e=eyeAt(CE.x+CE.r*.55,WL+1.6,CE.z+CE.r*.25);V['The cenote, from its water']=[e[0],e[1],e[2],CE.x-CE.r*.2,CE.rim+2,CE.z-CE.r*.1];}
 {const e=eyeAt(CE.x-hr.rx*.55,CE.floor+5,CE.z+hr.rz*.35);V['Under the cenote (the light through the water)']=[e[0],e[1],e[2],CE.x+2,WL-2,CE.z-1];}
 {const sk=CAVE.N2.sinks.find(q=>q.id===CE.sink),n=sk?CAVE.N2.passages.find(p=>p.a===sk.node||p.b===sk.node):null;   /* from the foot of the cenote's sink down its passage */
  if(sk&&n){const a=M[sk.node],b=M[n.a===sk.node?n.b:n.a],e=eyeAt(a.x,a.y+1.3,a.z);V['Into the drowned passage']=[e[0],e[1],e[2],b.x,b.y+1.3,b.z];}}
 if(ch[0]){const c=ch[0],e=eyeAt(c.c[0]+c.rx*.6,c.c[1]+c.h*.4,c.c[2]);V['A drowned chamber']=[e[0],e[1],e[2],c.c[0]-c.rx*.5,c.c[1]+c.h*.3,c.c[2]];}
 {const st=CAVE.dress.filter(r=>r.kind==='stalactite'||r.kind==='straw'||r.kind==='curtain'),by={};st.forEach(r=>{const k=Math.round(r.x/20)+','+Math.round(r.z/20);(by[k]=by[k]||[]).push(r);});
  const best=Object.values(by).sort((a,b)=>b.length-a.length)[0];if(best){const r=best[0],e=eyeAt(r.x+4,r.y-3,r.z+3);V['Stalactites under the sea']=[e[0],e[1],e[2],r.x,r.y-1,r.z];}}
 {const sp=CAVE.water.spring,n=M[sp.node];if(n){const e=eyeAt(n.x-4,n.y+1.5,n.z-6);V['The spring\'s passage (toward the shore)']=[e[0],e[1],e[2],n.x,n.y+1,n.z];}}
 return V;})();
// ---------------------------------------------------------------- the inspector
function hazardWords(p){return typeof KTAGS!=='undefined'&&KTAGS.hazardAt?'\n'+KTAGS.hazardAt(p.x,p.y,p.z):'';}
function describe(hit){const p=hit.point,o=hit.object;let best=null;for(const r of REG){if(r.r>300||!r.tags||!r.tags.cave)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 return (best?best.name+'  ·  ':'')+(o.userData.inspectLabel||o.name||'mesh')+'\n'+SITE.name+' · '+(p.y<WL?(WL-p.y).toFixed(1)+' m under the sea (brackish, '+SITE.airT+' degC air over it)':(p.y-WL).toFixed(1)+' m over the water')+hazardWords(p)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+' (nwbay\'s frame)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's checks (each with a negative below)
const BUDGET={showcase:{tris:1500000,calls:60},cls:{rock:600000,dress:300000,host:200000},type:{cavern:'rock',dress:'dress'}};
const HCHK={
 /* the cenote opens where nwbay's is: its hall within 1 m of nwbay's centre, the ground round its rim at nwbay's rim height, open to the rim */
 cenote(c,cen){const dc=Math.hypot(c.hall.c[0]-cen.x,c.hall.c[2]-cen.z);let g=0;for(let k=0;k<16;k++){const a=k/16*TAU;g+=SITE.ground(cen.x+Math.cos(a)*cen.r*cen.e,cen.z+Math.sin(a)*cen.r)/16;}
  const open=C0.sdf(cen.x,cen.rim-1,cen.z)>0;return{ok:dc<=1&&Math.abs(g-cen.rim)<=2&&open,detail:'centre '+dc.toFixed(2)+' m off nwbay\'s, the ground at the rim '+g.toFixed(1)+' (nwbay '+cen.rim+'), '+(open?'open to the rim':'shut under the rim')};},
 /* the cave meets the surface only at the cenote: no void 1 m under the ground outside its rim (an 8 m lattice over the box) */
 surface(cen){let bad=null,n=0;for(let x=CAVE.box[0];x<=CAVE.box[2];x+=8)for(let z=CAVE.box[1];z<=CAVE.box[3];z+=8){if(Math.hypot(x-cen.x,z-cen.z)<cen.r*cen.e+4)continue;n++;
   if(!bad&&C0.sdf(x,SITE.ground(x,z)-1,z)>0)bad=[x,z];}return{ok:!bad&&n>0,detail:bad?'the cave breaks the surface at '+bad.join(', '):n+' points under the ground outside the cenote, all rock'};},
 /* drowned: every sump and flooded chamber has a drowning record for air-breathers (the Hykkousoi breathe water) */
 drown(L){const D=L.filter(h=>h.tags.hazard.kind==='drown'),air=D.filter(h=>h.tags.breathers==='air'),need=CAVE.water.sumps+CAVE.water.pools;
  return{ok:need>0&&D.length>=need&&air.length===D.length,detail:D.length+' drowning records ('+air.length+' for air-breathers) for '+need+' sumps and flooded chambers'};},
 /* every speleothem is fixed to the rock: a hanging one at its roof, a standing one on its floor, a column at both */
 attached(R){const down=k=>k==='stalactite'||k==='straw'||k==='curtain',bad=R.filter(r=>{const top=r.roof==null?r.y:r.roof,bot=r.floor==null?r.y:r.floor;
   if(r.kind==='column')return C0.sdf(r.x,top+.4,r.z)>.3||C0.sdf(r.x,bot-.4,r.z)>.3;return down(r.kind)?C0.sdf(r.x,top+.4,r.z)>.3:C0.sdf(r.x,bot-.4,r.z)>.3;});
  return{ok:R.length>0&&bad.length<=R.length*.01,detail:bad.length+' of '+R.length+' speleothems not at their rock (1% allowed: the 1 m lattice)'+(bad.length?' (first '+bad[0].id+')':'')};},
 eyes(Cm){const bad=Cm.filter(c=>C0.sdf(c.x,c.y,c.z)<.3);return{ok:!bad.length,detail:bad.length?'in the rock: '+bad.map(c=>c.view).join(', '):Cm.length+' view cameras in the water or the air'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('the cenote opens where nwbay\'s is (centre, rim)',HCHK.cenote(CE,SITE.cenote));
 add('the cave meets the surface only at the cenote',HCHK.surface(SITE.cenote));
 add('every sump and flooded chamber drowns air-breathers only (the Hykkousoi\'s roads)',HCHK.drown(CAVE.hazards));
 add('every speleothem is fixed to the rock',HCHK.attached(CAVE.dress));
 add('the views\' cameras stand in the open',HCHK.eyes(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('the cenote 40 m off nwbay\'s',HCHK.cenote(CE,Object.assign({},SITE.cenote,{x:SITE.cenote.x+40})));
 add('the surface checked round the wrong place (the real cenote breaks it)',HCHK.surface(Object.assign({},SITE.cenote,{x:SITE.cenote.x+120})));
 add('drowning records without the breathers\' tag',HCHK.drown(CAVE.hazards.map(h=>Object.assign({},h,{tags:{hazard:h.tags.hazard}}))));
 {const c=CAVE.N2.chambers[0];add('a stalactite hanging in the water',HCHK.attached([{id:'fake',kind:'stalactite',x:c.c[0],y:c.c[1]+c.h*.5,z:c.c[2],roof:c.c[1]+c.h*.5}]));}
 {const c=CAVE.N2.chambers[0];add('a camera in the rock',HCHK.eyes([{view:'rock',x:c.c[0],y:c.c[1]-6,z:c.c[2]}]));}
 return R;}
const EXPORT_BOX=[CE.x-60,CE.z-60,CE.x+60,CE.z+60].map(Math.round);
KHOST.take({build:'nwbay-caves-cenote',title:'Krator biome — the bay\'s drowned caves: '+SITE.name,
 hint:SITE.region+': nwbay\'s NE cenote ('+Math.round(CE.rim)+' m rim, its water at the sea) over a drowned branchwork (KKARST, site 1), stalactites under the sea (KSPELEO limestone), the Hykkousoi\'s roads; scale model 5.1 about '+SITE.px+','+SITE.py+' (PLAN.md)',
 scene,camera,renderer,ground:groundEye,clear:1.2,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:12},inspect:describe,stats:()=>'speleothems '+CAVE.dress.length+' · rock '+ROCK.tris+' tris',
 layers:{'dress':{match:o=>!!(o.userData&&o.userData.dress)},'rock':{match:o=>!!(o.userData&&o.userData.rock)},...(typeof KTAGS!=='undefined'&&KTAGS.hazardLayer?{'hazards':KTAGS.hazardLayer()}:{})},
 exporters:{biome:()=>BIO.export(),cave:()=>CAVE.export()},
 minimap:{title:SITE.name},
 guards:false,   /* the biome core's card guards: no foliage on this page, so their negatives could not fail */
 budget:BUDGET,types:()=>({cavern:{tris:ROCK.tris,inst:0,meshes:ROCK.meshes},dress:{tris:DRESS.tris,inst:0,meshes:DRESS.mesh?1:0}}),
 api:{hostChecks,hostNegatives,
  get totals(){return {tris:ROCK.tris+DRESS.tris,inst:window._instances,meshes:ROCK.meshes+1,registered:REG.length,types:2};},
  cave:()=>({chambers:CAVE.N2.chambers.length,passages:CAVE.N2.passages.length,sumps:CAVE.water.sumps,dress:CAVE.dress.length,cenote:CE.sink}),
  exportProfile:['registry','hazards','terrain','stage','atmos','water'],   /* no flora: no items, buckets or BIO materials */
  exportBox:EXPORT_BOX,
  at:(x,z)=>({floor:terrainH(x,z),water:waterH(x,z)})}});
