// ================================================================= HOST — the views, the inspector's words and the probe's checks, handed to core/host
// The views stand in the open (a camera is moved off a beam and out of the rock to the nearest clear point: eyeAt). 'The hold's massing' looks down
// on the storey from above the shelf with the outlines shown and the haze thinned; every other view restores both.
const F0=CAVE.focus,FX=F0.c[0],FZ=F0.c[2],FY=F0.c[1];
const beamNear=(x,y,z,pad)=>CAVE.beams.concat(CAVE.floor).some(r=>{if(r.kind!=='beam')return false;const dx=Math.cos(r.el)*Math.cos(r.az),dy=Math.sin(r.el),dz=Math.cos(r.el)*Math.sin(r.az),
 px=x-r.x,py=y-(r.y+r.r*.5),pz=z-r.z,t=Math.max(0,Math.min(r.len,px*dx+py*dy+pz*dz));return Math.hypot(px-dx*t,py-dy*t,pz-dz*t)<r.r+pad;});
/* the nearest clear eye to (x, y, z): in the open by .8 m and 1.2 m off any beam, searched on rings out to 12 m */
function eyeAt(x,y,z){const ok=(a,b,c)=>CAVE.C.sdf(a,b,c)>.8&&!beamNear(a,b,c,1.2);if(ok(x,y,z))return[x,y,z];
 for(let r=1;r<=12;r+=1)for(let k=0;k<12;k++){const a=k/12*TAU,px=x+r*Math.cos(a),pz=z+r*Math.sin(a);for(const dy of[0,1,-.6,2])if(ok(px,y+dy,pz))return[px,y+dy,pz];}return[x,y,z];}
const at=(c,u,d,up)=>[c[0]+u[0]*d,up,c[2]+u[1]*d];
const unit=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};
const VIEWS=(function(){const V={},HC=SITE.hold.chambers,north=CAVE.chambers.find(c=>c.id===Object.keys(HC)[0]);
 const toN=unit([FX,FZ],[north.c[0],north.c[2]]),R=F0.rx;
 {const e=eyeAt(FX+toN[0]*R*.78,FY+2.2,FZ+toN[1]*R*.78);V['The Cave of Crystals']=[e[0],e[1],e[2],FX-toN[0]*R*.3,FY+7,FZ-toN[1]*R*.3];}
 {const W=CAVE.wells.find(w=>Math.hypot(w.c[0]-FX,w.c[1]-FZ)<20)||CAVE.wells[0],e=eyeAt(W.c[0]+toN[1]*14,FY+1.7,W.c[1]-toN[0]*14);
  V['Among the beams']=[e[0],e[1],e[2],W.c[0]-toN[1]*10,FY+9,W.c[1]+toN[0]*10];
  const e2=eyeAt(W.c[0]+W.r+2.2,W.mouth+2.4,W.c[1]+.5);V['The feeder well (55 degC water below)']=[e2[0],e2[1],e2[2],W.c[0],W.level,W.c[1]];}
 if(CAVE.throats.length){const T=CAVE.throats[0],e=eyeAt(T.c[0]+9,FY+1.8,T.c[1]+7);V['Daylight down the vent']=[e[0],e[1],e[2],T.c[0],T.ground,T.c[1]];}
 {const e=eyeAt(FX-toN[0]*R*.45+3,FY+1.5,FZ-toN[1]*R*.45);V['The bladed floor']=[e[0],e[1],e[2],e[0]+toN[0]*7,FY+.2,e[2]+toN[1]*7];}
 {const W2=CAVE.hot.find(c=>c.id!==F0.id);if(W2){const u=unit([W2.c[0],W2.c[2]],[FX,FZ]),e=eyeAt(W2.c[0]+u[0]*W2.rx*.75,W2.c[1]+2,W2.c[2]+u[1]*W2.rz*.75);
  V['The west crystal chamber']=[e[0],e[1],e[2],W2.c[0],W2.c[1]+5,W2.c[2]];}}
 {const u=unit([north.c[0],north.c[2]],[FX,FZ]),e=eyeAt(north.c[0]+u[0]*north.rx*.6,north.c[1]+1.7,north.c[2]+u[1]*north.rz*.6);
  V['The hold\'s hall (reserved, empty)']=[e[0],e[1],e[2],north.c[0]-u[0]*north.rx,north.c[1]+4,north.c[2]-u[1]*north.rz];}
 V['The hold\'s massing (from above)']=[FX+40,SITE.ground(FX,FZ)+150,FZ+170,FX-40,FY,FZ-30];
 return V;})();
const MASSING_VIEW='The hold\'s massing (from above)';
function onView(name){const m=name===MASSING_VIEW;MASSING.group.visible=m||Q.get('massing')==='1';scene.fog.density=m?.0015:.014;}
// ---------------------------------------------------------------- the inspector
function hazardWords(p){return typeof KTAGS!=='undefined'&&KTAGS.hazardAt?'\n'+KTAGS.hazardAt(p.x,p.y,p.z):'';}
function describe(hit){const p=hit.point,o=hit.object,t=Math.round(CAVE.temp(p.x,p.z)),V=CAVE.HOLD.at(p.x,p.y+.5,p.z,.5);
 let head;const rec=o.userData.recs&&hit.instanceId!=null?o.userData.recs[hit.instanceId]:null;
 if(rec&&rec.kind==='beam')head='A selenite beam: '+rec.len.toFixed(1)+' m, '+(rec.r*2).toFixed(1)+' m thick, rising at '+Math.round(rec.el*180/Math.PI)+' deg (KSPELEO '+rec.id+')';
 else if(rec&&rec.kind==='block')head='Selenite blocks: '+rec.parts.length+' crystals to '+rec.len.toFixed(1)+' m (KSPELEO '+rec.id+')';
 else if(rec)head='Bladed gypsum: '+rec.pts.length+' points to '+(rec.len*100|0)+' cm (KSPELEO '+rec.id+')';
 else{let best=null;for(const r of REG){if(r.r>300||!r.tags||!r.tags.cave)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}head=(best?best.name+'  ·  ':'')+(o.userData.inspectLabel||o.name||'mesh');}
 return head+'\n'+SITE.name+' · '+(SITE.G+p.y).toFixed(0)+' m ('+(-p.y).toFixed(0)+' m under the shelf) · air '+t+' degC, near 100% humidity'+
  (V?'\nreserved for the hold: '+V.name+' ('+V.kind+', floor '+V.floor.toFixed(1)+', '+V.temp+' degC)':'')+hazardWords(p)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's checks (each with a negative below)
const BUDGET={showcase:{tris:2500000,calls:80},cls:{rock:700000,crystal:1200000,host:400000},type:{cavern:'rock',selenite:'crystal',blades:'crystal'}};
const instAxes=M=>{const out=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),d=new THREE.Vector3();if(!M)return out;
 for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,s);d.set(0,1,0).applyQuaternion(q);out.push({p:[p.x,p.y,p.z],d:[d.x,d.y,d.z],len:s.y,r:s.x/2});}return out;};
const HCHK={
 /* no drawn crystal stands in a reserved volume (every selenite along its axis, every blade at its point) */
 massingClear(A,B){const H=CAVE.HOLD;let bad=null,n=0;
  for(const a of A){n++;for(let t=a.r;t<=a.len;t+=1){const V=H.at(a.p[0]+a.d[0]*t,a.p[1]+a.d[1]*t,a.p[2]+a.d[2]*t,a.r*.5);if(V){bad=bad||[V.id,a.p.map(v=>v|0)];break;}}}
  for(const b of B){n++;const V=H.at(b.p[0]+b.d[0]*b.len*.5,b.p[1]+b.d[1]*b.len*.5,b.p[2]+b.d[2]*b.len*.5,0);if(V&&!bad)bad=[V.id,b.p.map(v=>v|0)];}
  return{ok:!bad&&n>0,detail:bad?'a crystal in '+bad[0]+' at '+bad[1]:n+' crystals drawn, none in the '+H.volumes.length+' reserved volumes'};},
 /* every reserved volume is open void: its floor's middle and four points round it, 1.5 m up, are in the open */
 massingOpen(L){const bad=[];L.forEach(V=>{const s=V.shape;let P;
   if(s.type==='ellipse')P=[[s.c[0],s.c[1]]].concat([0,1,2,3].map(k=>[s.c[0]+s.rx*.6*Math.cos(k*TAU/4),s.c[1]+s.rz*.6*Math.sin(k*TAU/4)]));
   else if(s.type==='poly'){const c=s.pts.reduce((a,p)=>[a[0]+p[0]/s.pts.length,a[1]+p[1]/s.pts.length],[0,0]);P=[c].concat(s.pts.map(p=>[c[0]+(p[0]-c[0])*.5,c[1]+(p[1]-c[1])*.5]));}
   else{P=[];for(let i=0;i+1<s.pts.length;i++)for(const t of[.2,.5,.8]){const a=s.pts[i],b=s.pts[i+1];P.push([a[0]+(b[0]-a[0])*t,a[2]+(b[2]-a[2])*t,a[1]+(b[1]-a[1])*t]);}}   /* a capsule inside its run (its ends meet a chamber or the page's edge), its floor's height there */
   const shut=P.filter(p=>CAVE.C.sdf(p[0],(p[2]==null?V.floor:p[2])+1.5,p[1])<=.2);if(shut.length)bad.push(V.id+' ('+shut.length+'/'+P.length+')');});
  return{ok:!bad.length&&L.length>0,detail:bad.length?'rock in: '+bad.join(', '):L.length+' volumes open at their floors'};},
 /* the chambers' and shelves' floors are level: the floor under five points within 0.8 m of the record's */
 massingLevel(L){const bad=[];L.forEach(V=>{const s=V.shape;if(s.type==='capsule')return;let P;
   if(s.type==='ellipse')P=[[s.c[0],s.c[1]]].concat([0,1,2,3].map(k=>[s.c[0]+s.rx*.5*Math.cos(k*TAU/4+.4),s.c[1]+s.rz*.5*Math.sin(k*TAU/4+.4)]));
   else{/* a shelf over its rock: between its edge on the chamber's wall and its back, the corners kept off */const E=V.edge,B=[s.pts[1],s.pts[2]],L=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
    P=[];for(const t of[.35,.8])for(const u of[.25,.5,.75])P.push(L(L(E[0],B[0],t),L(E[1],B[1],t),u));}
   const off=P.map(p=>{let y=V.floor+.5;for(let k=0;k<12&&CAVE.C.sdf(p[0],y-.25,p[1])>.05;k++)y-=.25;return Math.abs(y-V.floor);});const m=Math.max(...off);if(m>.8)bad.push(V.id+' '+m.toFixed(1)+' m');});
  return{ok:!bad.length,detail:bad.length?'not level: '+bad.join(', '):'every chamber and shelf floor level to 0.8 m'};},
 /* the beams stand only in the hot chambers (the megacrystals grew over the feeders) */
 beamsHot(R){const bad=R.filter(r=>r.kind==='beam'&&!CAVE.hot.some(c=>Math.hypot((r.x-c.c[0])/(c.rx+2),(r.z-c.c[2])/(c.rz+2))<=1));
  return{ok:!bad.length&&R.some(r=>r.kind==='beam'),detail:bad.length?bad.length+' beams outside the feeder chambers (first '+bad[0].id+')':R.filter(r=>r.kind==='beam').length+' beams, all in the feeder chambers'};},
 /* the heat is a hazard with soak over every hot chamber, and the beams are slippery */
 heat(L){const H=L.filter(r=>r.kind==='heat'&&r.soak&&r.danger>=1),S=L.filter(r=>r.kind==='slip');
  return{ok:H.length>=CAVE.hot.length&&S.length>=CAVE.hot.length&&CAVE.hot.length>0,detail:H.length+' lethal heat hazards with soak, '+S.length+' slip, for '+CAVE.hot.length+' hot chambers'};},
 /* every view's eye stands in the open (the massing view is over the shelf, in the sky) */
 eyes(Cm){const bad=Cm.filter(c=>c.view!==MASSING_VIEW&&CAVE.C.sdf(c.x,c.y,c.z)<.3);return{ok:!bad.length,detail:bad.length?'in the rock: '+bad.map(c=>c.view).join(', '):Cm.length+' view cameras in the open'};}};
const hazList=()=>typeof KHAZ!=='undefined'?KHAZ.list().map(r=>KHAZ.of(r)||r).filter(Boolean):[];
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('no crystal stands in the hold\'s reserved volumes',HCHK.massingClear(instAxes(CRYSTALS.sel),instAxes(CRYSTALS.blades)));
 add('every reserved volume is open void',HCHK.massingOpen(CAVE.HOLD.volumes));
 add('the reserved chambers and shelves have level floors',HCHK.massingLevel(CAVE.HOLD.volumes));
 add('the selenite beams stand in the feeder chambers only',HCHK.beamsHot(CAVE.beams.concat(CAVE.floor)));
 add('the hot chambers are lethal heat (soak) and slippery (core/hazard)',HCHK.heat(hazList()));
 add('the views\' cameras stand in the open',HCHK.eyes(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const N=CAVE.HOLD.volumes.find(v=>v.kind==='chamber'),c=N.shape.c;
 add('a beam through the hold\'s hall',HCHK.massingClear([{p:[c[0]-6,N.floor+.5,c[1]],d:[1,0,0],len:12,r:.6}],[]));
 add('a reserved volume in the rock',HCHK.massingOpen([Object.assign({},N,{id:'fake',shape:Object.assign({},N.shape,{c:[c[0]+SITE.half*3,c[1]]})})]));
 add('a reserved floor 3 m off',HCHK.massingLevel([Object.assign({},N,{id:'fake',floor:N.floor+3})]));
 add('a beam in the hold\'s hall',HCHK.beamsHot([{kind:'beam',id:'fake',x:c[0],z:c[1]}]));
 add('no heat hazard',HCHK.heat([]));
 add('a camera in the rock',HCHK.eyes([{view:'rock',x:c[0],y:N.floor-5,z:c[1]}]));
 return R;}
const EXPORT_BOX=[FX-60,FZ-60,FX+60,FZ+60].map(Math.round);
KHOST.take({build:'hearths-crystals',title:'Krator biome — the Hearths: '+SITE.name,
 hint:SITE.region+': '+(SITE.G-40)+' m, 40 m under the shelf; the Naica of the Hearth hold (KKARST hypogene, KSPELEO selenite, KTHERM '+Math.round(CAVE.temp(FX,FZ))+' degC); '+
  'the hold\'s spaces massed and empty (?massing=1); scale model 5.1 px '+SITE.px+','+SITE.py+' (PLAN.md section 18)',
 scene,camera,renderer,ground:groundEye,clear:1.5,registry:REG,regHas,views:VIEWS,onView,ticks:TICKS,
 clock:{hour:12},inspect:describe,stats:()=>'beams '+CRYSTALS.beams+' · blades '+CRYSTALS.points+' · rock '+ROCK.tris+' tris',
 layers:{'crystals':{match:o=>!!(o.userData&&o.userData.crystal)},'rock':{match:o=>!!(o.userData&&o.userData.rock)},'massing':{objects:()=>[MASSING.group]},
  ...(typeof KTAGS!=='undefined'&&KTAGS.hazardLayer?{'hazards':KTAGS.hazardLayer()}:{})},
 exporters:{biome:()=>BIO.export(),cave:()=>CAVE.export(),hold:()=>CAVE.HOLD.export()},
 minimap:{title:SITE.name},
 guards:false,   /* the biome core's card guards: no foliage on this page, so their negatives could not fail */
 budget:BUDGET,types:()=>({cavern:{tris:ROCK.tris,inst:0,meshes:ROCK.meshes},selenite:{tris:CRYSTALS.tris.selenite,inst:CRYSTALS.sel?CRYSTALS.sel.count:0,meshes:1},
  blades:{tris:CRYSTALS.tris.blades,inst:CRYSTALS.blades?CRYSTALS.blades.count:0,meshes:1}}),
 api:{hostChecks,hostNegatives,
  get totals(){return {tris:ROCK.tris+CRYSTALS.tris.selenite+CRYSTALS.tris.blades,inst:window._instances,meshes:ROCK.meshes+2,registered:REG.length,types:3};},
  hold:()=>CAVE.HOLD.export(),cave:()=>({chambers:CAVE.chambers.length,passages:CAVE.passages.length,hot:CAVE.hot.map(c=>c.id),beams:CRYSTALS.beams,blocks:CRYSTALS.blocks,points:CRYSTALS.points}),
  exportProfile:['registry','hazards','terrain','stage','atmos','water'],   /* no flora: no items, buckets or BIO materials */
  exportBox:EXPORT_BOX,
  at:(x,z)=>({floor:terrainH(x,z),water:waterH(x,z),temp:CAVE.temp(x,z)})}});
