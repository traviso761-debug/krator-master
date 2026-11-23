// ================================================================= THE SHEET'S TEST HOLD: the Tungang set carved, furnished, in three states
// South of the Fellgang rows (z 140-300), three galleries cut into a block of rock, one per state (kept, worn, abandoned), each
// lined with every Tungang def on its north wall facing the camera. Each is laid as a world lays a hold: a plan on core/city's
// cavern setting (KCITY.cavern: the gallery as the spine, the defs as wall sites placed by hand, every rule audited), the rock
// carved from the plan and the defs' void plans (KCITY.cavern.carve with TG.tg.planOf, built in KCAVERN), the sites registered
// in core/tags, then drawn through the host API (TG.tg.draw: dry, the furniture at 0.94, the lamp code as light records).
// The rock is drawn as a dollhouse (KCAVERN.drawRock with the ground dropped): from above every room shows open, its floor and
// its far walls; its ceilings face away. window._tgSheet holds what was laid and drawn, for verify.py. Host-only: three.js.
const TG_SHEET={x0:-75,spine:0,y:1,z:[170,215,260],states:['kept','worn','abandoned'],gallery:{w:8,h:5.2},
 /* the defs along the north wall, in order, west to east: [key, extra site fields] */
 row:[['tg-night-mouth'],['tg-doors',{span:8}],['tg-signal-box'],['tg-loj-hall',{loj:20}],['tg-set',{num:214}],['tg-cut',{num:218}],['tg-set',{num:222}],
  ['tg-carriage-house',{num:301}],['tg-dark-beds'],['tg-cistern'],['tg-bath'],['tg-fan-house'],['tg-last-stop']]};
/* the gallery runs the row's length with 2 m to spare at each end */
TG_SHEET.spine=TG_SHEET.row.reduce((a,[k])=>a+TG.tg.BOX[k].w+1.4,0)+2.6;
/* one gallery's plan on KCITY.cavern: its spine along +x at z, every def a wall site on the north side (facing +z) at its s */
function tgSheetPlan(st,z){const S=TG_SHEET,y=S.y,H=KCITY.cavern.create({id:'tgsheet.'+st,world:9300+S.z.indexOf(z)});
 KCITY.cavern.addDeck(H,{id:'deck0',i:0,y,name:'the Line deck',light:'green'});
 KCITY.cavern.addNode(H,{id:st+'.g:a',kind:'end',x:S.x0,y,z});KCITY.cavern.addNode(H,{id:st+'.g:b',kind:'end',x:S.x0+S.spine,y,z});
 KCITY.cavern.addWay(H,{id:st+'.gallery',kind:'gallery',a:st+'.g:a',b:st+'.g:b',w:S.gallery.w,h:S.gallery.h,deck:0,band:'cream-red'});
 let s=2;S.row.forEach(([key,x],i)=>{const B=TG.tg.BOX[key],mid=s+B.w/2;
  KCITY.cavern.addSite(H,Object.assign({id:st+'.'+i+'.'+key,at:'wall',key,way:st+'.gallery',side:-1,s:mid,x:S.x0+mid,y,z:z-S.gallery.w/2,ry:0,w:B.w,d:B.d,h:B.h,deck:0,state:st},x||{}));
  s+=B.w+1.4;});
 return H;}
function tgSheetHold(W){const S=TG_SHEET,out={plans:[],audits:[],draws:[],states:{}};
 if(typeof KCITY==='undefined'||!KCITY.cavern||typeof KCAVERN==='undefined'){reportErr('the test hold needs core/city/cavern and core/terrain');return out;}
 /* one cavern for the three galleries: the rock's top 13 m over the floors (the ground the voids are cut under) */
 const C=KCAVERN.create({ground:()=>S.y+13,cell:.5,chunk:16,seed:9300,walk:null,minRock:.8});const prims=[];
 S.states.forEach((st,k)=>{const H=tgSheetPlan(st,S.z[k]);out.plans.push(H);out.audits.push(KCITY.cavern.audit(H));
  for(const p of KCITY.cavern.carve(H,{plan:TG.tg.planOf})){const r=Object.assign({},p);delete r.prim;delete r.deck;delete r.site;delete r.room;delete r.ramp;
   if(p.prim==='stair'){C.stair({id:r.id,owner:r.owner,a:r.a,b:r.b,w:r.w,h:r.h});prims.push(p);continue;}
   if(p.prim==='room'){C.room({id:r.id,owner:r.owner,poly:r.poly,y:r.y,h:r.h,finish:p.kind==='bay'?'raw':'hewn'});prims.push(p);}}});
 C.build();out.prims=prims.length;
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,side:THREE.DoubleSide,color:hc(0xa69a88)});
 /* the rock cut (core/terrain/host/39h): every void's rock open 2 m over its own floor, so the rooms show from any side */
 if(KCAVERN.cutLayer){KCAVERN.cutLayer(mat);KCAVERN.cut.above(2.2);KCAVERN.cut.set(true);}
 const R=KCAVERN.drawRock(C,{THREE,material:mat,ground:'drop',attrs:KCAVERN.cutWeight?['aKCut']:[],weight:KCAVERN.cutWeight?KCAVERN.cutWeight(C):null,label:'The test hold\'s rock (KCAVERN, carved from the plan: core/city/cavern)',name:'tg:rock'});
 R.group.children.forEach(m=>{m.receiveShadow=true;m.castShadow=false;m.userData.probeSkip=true;});W.add(R.group);out.rock={tris:R.tris,chunks:R.chunks,ms:R.ms};out.cavern=C;
 /* register every site in core/tags before it is drawn (as a world does), then draw them through the host API */
 S.states.forEach((st,k)=>{const H=out.plans[k],sites=H.sites.map(s=>Object.assign({},s));
  sites.forEach(s=>{if(SVTAGS){const D=DEFS[s.key];SVTAGS.add({'class':'building',kind:s.key,key:s.key,name:'The test hold ('+st+'): '+(D?D.name:s.key),at:[s.x,s.y,s.z],ry:s.ry,size:[s.w,s.d,s.h],
   tags:Object.assign({},D?D.tags:{},{culture:'tungang'}),note:'carved by KCAVERN from the plan, drawn by TG.tg',frag:KIT.frag});}});
  const D=TG.tg.draw(sites,{scene:W,seed:9310+k,state:st,label:'The test hold ('+st+'): the Tungang set'});out.draws.push(D);
  out.states[st]={sites:sites.length,recs:D.recs.length,furniture:D.furniture,lights:D.lights.length,missing:D.missing,missingFurn:D.missingFurn,tris:D.tris,
   box:TG.tg.check.box(D.recs),lamps:TG.tg.check.lamps(D),audit:out.audits[k].problems.map(p=>p.msg)};});
 out.plansCheck=TG.tg.check.plans();
 /* the gallery's floor plate and its paint band on the north wall, the green lamps down the gallery (the Line's code) */
 const gl=[];S.states.forEach((st,k)=>{const z=S.z[k];for(let x=S.x0+4;x<S.x0+S.spine;x+=12)gl.push({x,y:S.y+3.8,z:z+S.gallery.w/2-.3,colour:TG.tg.LAMP.green.hex});});
 out.galleryLamps=gl.length;
 window._tgSheet=out;return out;}
const tgSheetBW=buildWorld;
buildWorld=function(){const W=tgSheetBW();try{tgSheetHold(W);}catch(err){reportErr('the sheet\'s test hold: '+(err.stack||err));}
 if(typeof nightRebuild==='function')nightRebuild();return W;};
