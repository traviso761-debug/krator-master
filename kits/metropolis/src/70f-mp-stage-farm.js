// ================================================================= METROPOLIS — the test stage: the farm belt  [web]
// The eight farm families (46f, 54f) on the test page, beside the towers' views. Each family stands three times in its own showroom, 5 km south of
// the tiers: its hero (west), its baked box shell (middle) and its impostor (east), intact and gutted; its seven ruin states in a row (MP.ruinDesign);
// all eight together; an aqueduct of ten modules on a curve (the joint the Terraces lay their lines by). The shells are KSHELL's box mode (the
// valley's middle tier for every design, biomes/ancientsvalley 70: F.shell) in an atlas of their own; the impostors a set of their own on a kit
// of their own ('mpfarm', baked apart from the towers'), one a frame like the towers'. The checks join the page's (99: MP.EXTRA_CHECKS).
const MPF={ready:false,keys:[].concat(...MP.FARM_KEYS.map(f=>['intact','gutted'].map(s=>f+'.'+s))),hero:{},rec:{},slot:{},mesh:{},imp:{},impN:0,Z:5000,row:{}};
/* every farm family takes the box shell the valley gives a design (F.shell, if the record has none) */
MP.FARM_KEYS.forEach(k=>{const F=MP.FAMILY[k];if(!F.shell)F.shell={mode:'box',inset:1.2,texel:1.0,ruinTexel:1.25,box:true};});
/* the showroom: family i at x = (i - 3.5) * 420, the intact triplet at z = Z, the gutted at Z + 300; gap: a footprint and a half between the three */
MPF.gap=k=>{const fp=MP.FAMILY[k].footprint;return Math.max(fp.w||0,fp.d||0,2*(fp.r||0))*1.25+30;};
MPF.at=(k,s,which)=>{const i=MP.FARM_KEYS.indexOf(k),x=(i-3.5)*420,z=MPF.Z+(s==='gutted'?300:0),g=MPF.gap(k);return [x+(which-1)*g,z];};
/* the farm's views and their stage: heroes through the page's own MP.show (MP_CFG), shells and the impostors' visibility here (MPF.show) */
MPF.cfg={};
(function(){const nm=F=>F.name.replace(/^The /,'');
 MP.FARM_KEYS.forEach(k=>{const F=MP.FAMILY[k],H=F.height.tip,g=MPF.gap(k);['intact','gutted'].forEach(s=>{const n='Farm, '+nm(F)+(s==='gutted'?', gutted':'')+': hero, shell, impostor',h=MPF.at(k,s,0),c=MPF.at(k,s,1);
  MP_CFG[n]={heroes:[[k+'.'+s,h[0],h[1],0]]};MPF.cfg[n]={shells:[[k+'.'+s,c[0],c[1],0]],imp:true};const d=Math.max(3.2*g,H*2.2);VIEWS[n]=[c[0],Math.max(6,H*.45),c[1]+d,c[0],H*.35,c[1]];});
  /* the seven states in a row at the origin, a footprint and a half apart, as the planned designs' rows */
  const D=Math.max(F.footprint.w||0,F.footprint.d||0),gap=D*1.35+24,row=[];MP.RUINS.forEach((s,i)=>row.push([k+'.'+s,(i-3)*gap,0,0]));const n='Farm ruins, '+nm(F);MP_CFG[n]={heroes:row};const w=gap*6;VIEWS[n]=[w*.32,Math.max(H*1.2,w*.24),w*.7,0,H*.2,0];});
 /* all eight on a grid, 180 m apart; the aqueduct of ten modules on a gentle curve (a turn of 4 degrees at each joint), the way the station lays one */
 const g8=[];MP.FARM_KEYS.forEach((k,i)=>g8.push([k+'.intact',((i%4)-1.5)*180,(Math.floor(i/4)-.5)*180,0]));MP_CFG['Farm, all eight']={heroes:g8};VIEWS['Farm, all eight']=[420,260,520,0,10,0];
 const J=MP.aqueductJoin,ch=[];let p=[-5*J.len,0],a=-.08;for(let i=0;i<10;i++){const q=[p[0]+Math.cos(a)*J.len,p[1]+Math.sin(a)*J.len];ch.push(['aqueduct.'+(i===6?'broken':i===7?'crown':'intact'),(p[0]+q[0])/2,(p[1]+q[1])/2,-a]);p=q;a+=4*Math.PI/180;}
 MPF.chain=ch;MP_CFG['Farm, an aqueduct of ten modules']={heroes:ch};VIEWS['Farm, an aqueduct of ten modules']=[60,40,340,0,12,40];})();
/* the shells and impostors: baked once the page's own are (MPS.ready), from the heroes; a shell atlas of their own, packed as full as it goes */
MPF.boot=function(){if(MPF.ready||!MPS.ready)return;const t0=performance.now();
 MPF.keys.forEach(k=>{const p=k.split('.');MPF.hero[k]=MP.hero(p[0],p[1]);MPF.rec[k]=KSHELL.record(MP.FAMILY[p[0]],p[1]);});
 MPF.atlases=[];MPF.atlasOf={};{let left=MPF.keys.slice();while(left.length){let n=left.length,packed=null;while(n>0){try{packed=KSHELL.pack([].concat(...left.slice(0,n).map(k=>KSHELL.slots(MPF.rec[k]))),2048);break;}catch(e){n=Math.floor(n*.7);packed=null;}}
  if(!packed||!n){reportErr('farm shells: '+left[0]+' fits no atlas');left.shift();continue;}const at=KSHELL.atlas(2048,renderer);MPF.atlases.push({at,mat:KSHELL.material(at,{steps:32})});packed.forEach(s=>{MPF.slot[s.id]=s;});left.slice(0,n).forEach(k=>{MPF.atlasOf[k]=MPF.atlases.length-1;});left=left.slice(n);}}
 MPF.packed=Object.keys(MPF.slot).length;
 MPF.keys.forEach(k=>{const A=MPF.atlases[MPF.atlasOf[k]];if(!A)return;KSHELL.bake(A.at,MPF.rec[k],MPF.slot[k],MPF.hero[k],MPF.slot[k+'.top'],MPF.slot[k+'.bot']);});MPF.atlases.forEach(A=>{KSHELL.finish(A.at);A.mat.userData.U.uPx.value=2*Math.tan(camera.fov*Math.PI/360)/Math.max(1,innerHeight);});
 MPF.keys.forEach(k=>{const A=MPF.atlases[MPF.atlasOf[k]];if(!A)return;const im=KSHELL.draw(A.at,MPF.rec[k],MPF.slot[k],A.mat,[[0,0,0]],MPF.slot[k+'.top'],MPF.slot[k+'.bot']);im.count=0;im.frustumCulled=false;scene.add(im);MPF.mesh[k]=im;});
 MPF.bakeMs=Math.round(performance.now()-t0);
 /* the impostors: a set and a kit of their own, one placed at each showroom's east stand; baked one a frame */
 const S=BIO.impostorSet('mpf',{grid:8,cell:128,slots:Math.min(25,MPF.keys.length)}),prev=BIO.kit('mpfarm');MPF.impSet=S;
 MPF.keys.forEach(k=>{const p=k.split('.'),H=MP.hero(p[0],p[1],true),names=[];H.updateMatrixWorld(true);H.traverse(m=>{if(!m.isMesh||!m.geometry||m.userData.door||m.name==='a door leaf')return;const n='mpf.'+k+'.'+names.length;BIO.def(n,m.geometry,m.material,{indexed:false});names.push([n,m]);});
  MPF.imp[k]=BIO.impostor('mpf.'+k,function(){const M=new THREE.Matrix4(),W=new THREE.Matrix4(),p3=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),c=new THREE.Color();
   names.forEach(e=>{const n=e[0],m=e[1];W.copy(m.matrixWorld);if(!m.isInstancedMesh){W.decompose(p3,q,s);BIO.put(n,[p3.x,p3.y,p3.z],q,[s.x,s.y,s.z],null);return;}
    for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);M.premultiply(W).decompose(p3,q,s);if(s.x===0&&s.y===0)continue;if(m.instanceColor)m.getColorAt(i,c);else c.setRGB(1,1,1);BIO.put(n,[p3.x,p3.y,p3.z],q,[s.x,s.y,s.z],c.clone().convertLinearToSRGB());}});},{set:S,label:k});});
 BIO.impostorItem('mpfImp',S,{label:'a far farm building'});
 BIO.range=MP_IMPFAR;BIO.minRange=0;BIO.chunk=800;MPF.keys.forEach(k=>{const p=k.split('.'),e=MPF.at(p[0],p[1],2);BIO.impostorPut('mpfImp',MPF.imp[k],[e[0],0,e[1]],0,1);});BIO.range=null;BIO.chunk=null;
 {const saved=BIO.kits;BIO.kits={mpfarm:saved.mpfarm};try{BIO.bake();}finally{BIO.kits=saved;}}BIO.kit(prev||'');
 MPF.impQ=BIO.IMP.list.slice();BIO.IMP.list.length=0;   /* the towers' own were taken off the list at their bake (70): what is on it now is the farm's */
 MPF.impMeshes=[];scene.traverse(o=>{if(o.isInstancedMesh&&/mpfImp/.test(o.name||''))MPF.impMeshes.push(o);});
 /* every farm hero, every state: its triangles, draw calls (the door leaves apart), extent and floaters, for the checks */
 MPF.stats={};MP.FARM_KEYS.forEach(f=>MP.RUINS.forEach(s=>{const k=f+'.'+s,G=MPF.hero[k]||MP.hero(f,s);MPF.stats[k]=MPF.measure(G);}));
 MPF.ready=true;MPF.show(MPS.mode);};
MPF.impTick=function(){if(!MPF.impQ||!MPF.impQ.length)return;const r=MPF.impQ.shift();BIO.IMP.list.length=0;BIO.IMP.list.push(r);MPF.impN+=BIO.bakeImpostors(renderer,{wait:0})||0;};
/* the view's shells, and the impostors only in the farm's triplet views (the showroom lies 5 km off: nothing else sees them, but the tiers would) */
MPF.show=function(name){if(!MPF.ready)return;const c=MPF.cfg[name]||{},n={},M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1),p=new THREE.Vector3();
 MPF.keys.forEach(k=>n[k]=0);(c.shells||[]).forEach(s=>{const im=MPF.mesh[s[0]];if(!im)return;M.compose(p.set(s[1],0,s[2]),Q.setFromAxisAngle(Y,s[3]||0),one);im.setMatrixAt(n[s[0]]++,M);});
 MPF.keys.forEach(k=>{const im=MPF.mesh[k];if(!im)return;im.count=n[k];im.instanceMatrix.needsUpdate=true;});MPF.impMeshes.forEach(o=>o.visible=!!c.imp);
 MPF.atlases.forEach(A=>A.mat.userData.U.uBand.value.set(0,0,.15));};
{const show0=MP.show;MP.show=function(name){show0(name);MPF.show(name);};}
/* a hero's numbers: triangles and draw calls (a door leaf is a placed hero's own moving part, not counted), its box, and its floaters: a mesh's
   connected pieces (by shared corners, 1 cm) whose box touches neither the ground nor another piece's box within 0.5 m */
MPF.measure=function(G){G.updateMatrixWorld(true);let tris=0,calls=0;const bb=new THREE.Box3(),pieces=[],v=new THREE.Vector3();
 G.traverse(m=>{if(!m.isMesh||!m.geometry||m.name==='a door leaf')return;let o=m,deb=false;while(o&&o!==G){if(/debris|rubble/i.test(o.name||''))deb=true;o=o.parent;}if(deb)return;   /* the rubble lies where it fell (KRUBBLE, MP.debris): not a builder's piece */calls++;const g=m.geometry,I=g.index,P=g.attributes.position,nt=(I?I.count:P.count)/3;tris+=nt*(m.isInstancedMesh?m.count:1);
  if(m.isInstancedMesh){const M=new THREE.Matrix4();for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);if(M.elements[0]===0&&M.elements[5]===0)continue;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox.clone().applyMatrix4(M).applyMatrix4(m.matrixWorld);bb.union(b);pieces.push(b);}return;}
  /* union-find over the triangles by their corners' positions */
  const key=i=>Math.round(P.getX(i)*100)+','+Math.round(P.getY(i)*100)+','+Math.round(P.getZ(i)*100),id=new Map(),par=[],find=a=>{while(par[a]!==a){par[a]=par[par[a]];a=par[a];}return a;},at=q=>I?I.getX(q):q;
  const vk=[];for(let q=0;q<(I?I.count:P.count);q++){const k=key(at(q));let x=id.get(k);if(x==null){x=par.length;par.push(x);id.set(k,x);}vk.push(x);}
  for(let t=0;t+2<vk.length;t+=3){const a=find(vk[t]),b=find(vk[t+1]),c=find(vk[t+2]);par[b]=a;par[find(c)]=a;}
  const boxes=new Map();for(let q=0;q<vk.length;q++){const r=find(vk[q]);let b=boxes.get(r);if(!b){b=new THREE.Box3();boxes.set(r,b);}v.fromBufferAttribute(P,at(q)).applyMatrix4(m.matrixWorld);b.expandByPoint(v);}
  boxes.forEach(b=>{bb.union(b);pieces.push(b);});});
 const e=.5,touch=(a,b)=>a.min.x-e<=b.max.x&&b.min.x-e<=a.max.x&&a.min.y-e<=b.max.y&&b.min.y-e<=a.max.y&&a.min.z-e<=b.max.z&&b.min.z-e<=a.max.z;
 /* a piece floats when no chain of touching pieces reaches the ground (a flood from the pieces on the ground) */
 const on=pieces.map(b=>b.min.y<.6);let grew=true;while(grew){grew=false;for(let i=0;i<pieces.length;i++){if(on[i])continue;for(let j=0;j<pieces.length;j++)if(on[j]&&touch(pieces[i],pieces[j])){on[i]=true;grew=true;break;}}}
 const fl=pieces.filter((b,i)=>!on[i]);return{tris:Math.round(tris),calls,box:[bb.min.x,bb.min.y,bb.min.z,bb.max.x,bb.max.y,bb.max.z].map(x=>+x.toFixed(1)),pieces:pieces.length,floaters:fl.length,floatAt:fl.slice(0,3).map(b=>[b.min.x,b.min.y,b.min.z].map(x=>+x.toFixed(1)))};};
tick(function(){if(!MPF.ready)MPF.boot();else{const px=2*Math.tan(camera.fov*Math.PI/360)/Math.max(1,innerHeight);MPF.atlases.forEach(A=>{A.mat.userData.U.uPx.value=px;});MPF.impTick();}});
/* the farm's records on the page */
MP.FARM_KEYS.forEach(k=>{const F=MP.FAMILY[k];REGISTER({name:F.name+' (the farm belt)',x:0,z:0,r:Math.max(F.footprint.w||0,F.footprint.d||0)/2,h:F.height.tip,tags:{kind:'farm',family:k}});});
/* THE CHECKS (verify.py --assert, through 99's MP.EXTRA_CHECKS), each with its negative in MP.EXTRA_NEGATIVES:
   - every family's plans pass the audit; every state builds under the family's budget with no NaN and no floating piece; what stands of a ruin is
     lower than the intact, its rubble at its foot (the debris plan); a shell and an impostor baked for every look
   - the pod's dome stands on its plinth (the dome's foot is the plinth's top, inside its rim); the aqueduct's modules meet end to end */
MP.FARM_CHECK={
 audit(k,F){const A=MP.audit(F||MP.FAMILY[k]);return{ok:A.ok,detail:A.ok?A.storeys+' storeys, '+A.rooms+' rooms':A.fails[0]};},
 built(k,S){const F=MP.FAMILY[k],bad=[];MP.RUINS.forEach(s=>{const m=S[k+'.'+s];if(!m){bad.push(s+' not built');return;}if(m.pieces&&m.box.some(x=>!isFinite(x)))bad.push(s+' NaN');   /* no piece at all (a fallen aqueduct is rubble only) is an empty box, not a fault */if(s==='intact'&&m.tris>F.tris)bad.push('intact '+m.tris+' over '+F.tris);if(m.calls>12)bad.push(s+' '+m.calls+' calls');if(m.floaters&&(s==='intact'||s==='gutted'))bad.push(s+': '+m.floaters+' floating at '+JSON.stringify(m.floatAt[0]));});
  /* a ruin past gutted is the kit's cut (59b), the same for every design: a skeleton's piers stand between its slabs, the tear leaves a pier's head over a
     dropped panel. Those remnants are counted, not failed (KNOWN_ISSUES.md); the builder's own pieces (intact, gutted) must all reach the ground */
  const rf=MP.RUINS.slice(2).reduce((n,s)=>n+((S[k+'.'+s]||{}).floaters||0),0),i=S[k+'.intact'];
  return{ok:!bad.length,detail:bad.length?bad.slice(0,3).join('; '):'7 states; intact '+i.tris+' tris (budget '+F.tris+'), '+i.calls+' calls, '+i.pieces+' pieces, none floating whole or gutted; '+rf+' remnants loose in the ruins'};},
 ruinsLower(k,S){const F=MP.FAMILY[k],tip=F.height.tip,bad=[];['crown','broken','stump'].forEach(s=>{const R=MP.ruin(F,s);if(!(R.top<tip))bad.push(s+' stands to '+R.top.toFixed(1));});
  const st=MP.ruin(F,'stump').top,br=MP.ruin(F,'broken').top;if(!(st<br))bad.push('the stump over the broken');return{ok:!bad.length,detail:bad.length?bad.join('; '):'crown '+MP.ruin(F,'crown').top.toFixed(1)+', broken '+br.toFixed(1)+', stump '+st.toFixed(1)+' m of '+tip};},
 /* a ruin is cut, not erased: the drawn crown and broken heroes stand to at least half their record's cut (the ruin cut drops a triangle whole, so a
    single tall quad, a pier or a wall, went entirely: 2026-11-10, the broken aqueduct was heaps on the ground) */
 stands(k,S){const F=MP.FAMILY[k],bad=[];['crown','broken'].forEach(s=>{const m=S[k+'.'+s],c=MP.ruin(F,s).cut;if(!m||!(m.box[4]>=.5*c))bad.push(s+' stands to '+(m?m.box[4]:'?')+' of its cut '+c.toFixed(1));});return{ok:!bad.length,detail:bad.length?bad.join('; '):'crown to '+S[k+'.crown'].box[4]+' m, broken to '+S[k+'.broken'].box[4]+' m'};},
 baked(k){const s=['intact','gutted'].map(st=>k+'.'+st),ok=s.every(x=>MPF.mesh[x]&&MPF.slot[x]&&MPF.imp[x]);return{ok,detail:ok?'2 shells in '+MPF.atlases.length+' atlas(es), 2 impostors':'missing '+s.filter(x=>!(MPF.mesh[x]&&MPF.slot[x]&&MPF.imp[x])).join(', ')};},
 /* the dome on its plinth: the lowest glass of the dome at the plinth's top (within 5 cm), its foot inside the plinth's rim */
 podSeat(G){const F=MP.DESIGNS.pod;let lo=1e9,rr=0;G.updateMatrixWorld(true);G.traverse(m=>{if(!m.isMesh||!/glassClear/.test(m.material&&m.material.name||''))return;const P=m.geometry.attributes.position,v=new THREE.Vector3();for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);if(v.y<lo+.01){if(v.y<lo-.01)rr=0;lo=Math.min(lo,v.y);rr=Math.max(rr,Math.hypot(v.x,v.z));}}});
  const ok=Math.abs(lo-F.plinth)<.05&&rr<=F.hex+.01&&rr>0;return{ok,detail:'the dome\'s foot at '+lo.toFixed(2)+' m (the plinth '+F.plinth+'), '+rr.toFixed(1)+' m out (the rim '+F.hex+')'};},
 /* the chain: each module's east end where the next's west end is (0.6 m: the joint's turn opens the outer edge a little), the channel's floor the same height */
 chain(C){const J=MP.aqueductJoin;let worst=0;for(let i=1;i<C.length;i++){const a=C[i-1],b=C[i],ea=[a[1]+Math.cos(-a[3])*J.len/2,a[2]+Math.sin(-a[3])*J.len/2],wb=[b[1]-Math.cos(-b[3])*J.len/2,b[2]-Math.sin(-b[3])*J.len/2];worst=Math.max(worst,Math.hypot(ea[0]-wb[0],ea[1]-wb[1]));}
  return{ok:C.length>1&&worst<.6,detail:C.length+' modules, the worst joint '+worst.toFixed(2)+' m apart'};}};
MP.EXTRA_CHECKS=(MP.EXTRA_CHECKS||[]).concat([function(add){
 add('the farm stage booted',MPF.ready,MPF.ready?MPF.keys.length+' looks, '+MPF.packed+' shell slots, '+MPF.impN+' impostors baked':'');if(!MPF.ready)return;
 MP.FARM_KEYS.forEach(k=>{const C=MP.FARM_CHECK;let r=C.audit(k);add(k+': the farm plans pass the audit',r.ok,r.detail);r=C.built(k,MPF.stats);add(k+': every state built, under budget, nothing floating',r.ok,r.detail);
  r=C.ruinsLower(k);add(k+': the ruins stand lower than the intact',r.ok,r.detail);r=C.stands(k,MPF.stats);add(k+': a ruin is cut, not erased',r.ok,r.detail);r=C.baked(k);add(k+': a shell and an impostor',r.ok,r.detail);});
 add(MPF.keys.length+' farm impostors baked',MPF.impN===MPF.keys.length,''+MPF.impN);
 let r=MP.FARM_CHECK.podSeat(MPF.hero['pod.intact']);add('the pod\'s dome sits on its plinth',r.ok,r.detail);r=MP.FARM_CHECK.chain(MPF.chain);add('the aqueduct\'s modules meet end to end',r.ok,r.detail);}]);
/* a negative's add(name, failed): failed is true when the broken input fails its check, as it must */
MP.EXTRA_NEGATIVES=(MP.EXTRA_NEGATIVES||[]).concat([function(add){if(!MPF.ready)return;
 {const F=JSON.parse(JSON.stringify(MP.FAMILY.pod));F.envR=MP.FAMILY.pod.envR;F.core.shafts[0].x=6;add('a farm shaft out of its core',!MP.FARM_CHECK.audit('pod',F).ok);}
 add('a farm hero over its budget',!MP.FARM_CHECK.built('pod',Object.assign({},MPF.stats,{'pod.intact':Object.assign({},MPF.stats['pod.intact'],{tris:1e6})})).ok);
 {const G=MPF.hero['pod.intact'].clone(),m=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),MP.mats().concrete);m.position.set(0,60,0);G.add(m);add('a piece floating 60 m over the pod',MPF.measure(G).floaters>0);}
 {const G=MPF.hero['pod.intact'].clone();G.traverse(m=>{if(m.isMesh&&/glassClear/.test(m.material&&m.material.name||''))m.position.y+=3;});add('the dome lifted 3 m off its plinth',!MP.FARM_CHECK.podSeat(G).ok);}
 add('an aqueduct with a 3 m gap',!MP.FARM_CHECK.chain(MPF.chain.map((c,i)=>i>4?[c[0],c[1]+3*Math.cos(-c[3]),c[2]+3*Math.sin(-c[3]),c[3]]:c)).ok);
 add('a family with no shell baked',!MP.FARM_CHECK.baked('nosuch').ok);
 add('a broken aqueduct erased to its rubble',!MP.FARM_CHECK.stands('aqueduct',Object.assign({},MPF.stats,{'aqueduct.broken':Object.assign({},MPF.stats['aqueduct.broken'],{box:[0,0,0,0,1.5,0]})})).ok);}]);
