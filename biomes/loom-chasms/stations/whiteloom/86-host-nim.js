// ================================================================= HOST — STATION 5: THE WHITE LOOM'S POOLS, ITS SIFTERS AND ITS SALT CAMP, DANGERS, CHECKS, VIEWS
// THE HALITE SIFTERS (kits/fauna, the `loom` group: PLAN.md section 4): a few grazing along the rim of the biggest pool, where they break the crust
// for the brine mats; each a core/tags record before it is built, set on the drawn ground, facing the water.
// THE SALT CAMP: salt-cutters on the flat by the shore (PLAN.md section 5: caravans and expeditions make camps), here as RECORDS FIRST, drawn as
// pending stand-ins: the tents (KCAMP has no Yuni row nor a kit's tent program yet: core/camp's PLAN.md, owed), the cut slabs stacked, the hearth.
// THE DANGERS: the crust over brine round each pool and along the shore (`sink`: the shared amendment, a crust that breaks underfoot, is owed in
// core/hazard; the kind is registered as it stands), the pools' brine (`drown`, and its burn as a mild `poison`), the heat (88: the ambient field).
const NIM=(function(){const S=STATION,W=99520;
 const big=S.POOLS.slice().sort((a,b)=>b.r-a.r)[0];
 /* the sifters: four round the biggest pool's rim, outside its mats' inner edge, facing the water */
 const SIFT=[];if(big)for(let i=0;i<4;i++){const a=KRAND.unit(KRAND.hash(W,i,1,0x53))*Math.PI*2,d=big.r*(1.25+.25*KRAND.unit(KRAND.hash(W,i,2,0x53)));
  SIFT.push({id:'sifter:'+i,x:big.x+Math.cos(a)*d,z:big.z+Math.sin(a)*d,yaw:Math.atan2(big.x-(big.x+Math.cos(a)*d),big.z-(big.z+Math.sin(a)*d)),variant:i%2,seed:KRAND.hash(W,i,3,0x53)%99991+1,pool:big.id});}
 /* the camp: records in its own frame on the flat (x along the shore), each {id, name, role, kind, key, lx, lz, w, d, h} */
 const C=S.CAMP,R=[],add=o=>R.push(Object.assign({pending:true,culture:'yuni',settlement:'nim-salt-camp',x:C.x+o.lx,z:C.z+o.lz,ry:0},o));
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.3;add({id:'camp:tent-'+i,name:'A salt-cutters\' tent',role:'dwelling',kind:'tent',key:'tent',lx:Math.cos(a)*22,lz:Math.sin(a)*22,w:5,d:4,h:2.4,ry:-a});}
 add({id:'camp:hearth',name:'The camp\'s hearth',role:'hearth',kind:'hearth',key:'hearth',lx:0,lz:0,w:2,d:2,h:.5});
 for(let i=0;i<4;i++)add({id:'camp:stack-'+i,name:'Cut salt slabs, stacked for the caravan',role:'store',kind:'stack',key:'salt_stack',lx:34+i*4.5,lz:-10+i*1.5,w:3.2,d:1.6,h:1.4+.3*i});
 add({id:'camp:awning',name:'The cutters\' shade awning',role:'work',kind:'awning',key:'awning',lx:-30,lz:6,w:9,d:6,h:2.6});
 const out={records:R.length,pending:0,sifters:0};
 function build(){const acc={},put=(k,g,x,y,z,ry,sx,sy,sz)=>(acc[k]=acc[k]||[]).push({g,M:new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,0)),new THREE.Vector3(sx,sy,sz))});
  const BOX=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),CYL=new THREE.CylinderGeometry(.5,.5,1,10).translate(0,.5,0),
   TENT=(function(){const g=new THREE.CylinderGeometry(0,.5,1,4,1).rotateY(Math.PI/4).translate(0,.5,0);g.scale(1.414,1,1.414);return g;})();
  for(const r of R){const y=drawnH(r.x,r.z)-.1;r.y=y;
   REGISTER({name:r.name+' (the White Loom\'s salt camp)',key:r.id,x:r.x,z:r.z,y:y-.2,r:Math.hypot(r.w,r.d)*.5,h:r.h+.6,tags:{culture:'yuni',settlement:r.settlement,role:r.role,pending:true,kit:'yuni:'+r.key}});
   OBSTACLES.push({x:r.x,z:r.z,r:Math.hypot(r.w,r.d)*.5+1,y0:y-1,y1:y+r.h});out.pending++;
   if(r.kind==='tent')put('cloth',TENT,r.x,y,r.z,r.ry,r.w,r.h,r.d);
   else if(r.kind==='hearth')put('stone',CYL,r.x,y,r.z,0,r.w,r.h,r.d);
   else if(r.kind==='stack')put('salt',BOX,r.x,y,r.z,r.ry,r.w,r.h,r.d);
   else{put('wood',CYL,r.x-r.w/2,y,r.z-r.d/2,0,.14,r.h,.14);put('wood',CYL,r.x+r.w/2,y,r.z-r.d/2,0,.14,r.h,.14);put('wood',CYL,r.x-r.w/2,y,r.z+r.d/2,0,.14,r.h,.14);put('wood',CYL,r.x+r.w/2,y,r.z+r.d/2,0,.14,r.h,.14);
    put('cloth',BOX,r.x,y+r.h,r.z,0,r.w,.06,r.d);}}
  const COL={cloth:0xc8b896,stone:0x5a524a,salt:0xf0ece2,wood:0x6a4e36};
  for(const k in acc){const byG=new Map();for(const e of acc[k]){if(!byG.has(e.g))byG.set(e.g,[]);byG.get(e.g).push(e.M);}
   for(const [g,Ms] of byG){const m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:COL[k]}),Ms.length);Ms.forEach((M,i)=>m.setMatrixAt(i,M));m.userData.host=true;m.userData.post=true;
    m.userData.inspectLabel={cloth:'Tent cloth (a stand-in)',stone:'The hearth\'s stones',salt:'Cut salt slabs',wood:'Poles'}[k];scene.add(m);}}
  if(typeof KratorFauna!=='undefined'&&KratorFauna.has('halite-sifter'))for(const s of SIFT){s.y=drawnH(s.x,s.z);
   REGISTER({name:'A halite sifter (kits/fauna), grazing the brine mats',key:s.id,x:s.x,z:s.z,y:s.y-.2,r:3,h:2.2,tags:{fauna:'halite-sifter',kit:'kits/fauna',pool:s.pool,pose:'graze'}});
   let g;try{g=KratorFauna.build('halite-sifter',{seed:s.seed,variant:s.variant});}catch(e){reportErr('fauna halite-sifter: '+e.message);continue;}
   g.position.set(s.x,s.y,s.z);g.rotation.y=s.yaw;try{KratorFauna.animate(g,0,'graze',{phase:s.seed%10});}catch(e){}
   g.traverse(m=>{if(m.isMesh){m.userData.probeSkip=true;m.userData.inspectLabel='Halite sifter (kits/fauna)';}});g.userData.fauna=true;scene.add(g);s.g=g;out.sifters++;}
  window._nim=out;return out;}
 function hazards(){const H=[];
  for(const p of S.POOLS){H.push({name:'The crust over a brine pool (it breaks underfoot)',kind:'sink',x:p.x,z:p.z,y:p.level-2,r:p.r*1.7,h:3,danger:.6,tell:{sign:'the crust rings hollow and darkens'}});
   H.push({name:'A brine pool (hypersaline: it burns, and it is deeper than it looks)',kind:'drown',x:p.x,z:p.z,y:p.level-p.depth,r:p.r,h:p.depth+.5,danger:.5,effects:[{effect:'drown',dose:0},{effect:'poison',dose:.15}],tell:{sign:'the mats\' colours round still water'}});}
  for(let z=-2200;z<=2200;z+=880)H.push({name:'The lake\'s margin (a crust over brine mud)',kind:'sink',x:S.shoreX-40,z,y:S.LEVEL-2,r:160,h:3,danger:.5,tell:{sign:'grey slush under the white'}});
  return H;}
 // ---------------------------------------------------------------- the checks, each fed a broken input that must fail
 const CK={
  /* each pool shows: its water over the drawn ground in its bowl, the drawn rim over its level, the mats round it, a sink hazard on its crust */
  pools(P,Hz){const bad=P.filter(p=>{const c=drawnH(p.x,p.z),rim=Math.min(...[0,1,2,3,4,5].map(k=>drawnH(p.x+Math.cos(k*1.05)*p.r*1.45,p.z+Math.sin(k*1.05)*p.r*1.45)));
    return !(c<p.level-.25)||!(rim>p.level-.05)||S.mats(p.x+p.r*1.3,p.z)<.3||!Hz.some(h=>h.kind==='sink'&&Math.hypot(h.x-p.x,h.z-p.z)<2);});
   return{ok:P.length>=4&&!bad.length,detail:bad.length?bad.length+' brine pools that do not show in their bowls, or lack their mats or their crust\'s hazard (first '+bad[0].id+')':P.length+' brine pools, each its water over the drawn bowl under its rim, ringed by the mats, its crust a sink hazard'};},
  sifters(F){if(typeof KratorFauna==='undefined')return{ok:true,detail:'no fauna bundle (--no-fauna): none placed'};const p=big,bad=F.filter(s=>Math.abs((s.y==null?drawnH(s.x,s.z):s.y)-drawnH(s.x,s.z))>.3||Math.hypot(s.x-p.x,s.z-p.z)<p.r*1.05||Math.hypot(s.x-p.x,s.z-p.z)>p.r*2.2);
   return{ok:F.length>0&&!bad.length,detail:bad.length?bad.length+' sifters off the pool\'s rim or the drawn ground (first '+bad[0].id+')':F.length+' halite sifters on the drawn ground round the biggest pool\'s rim (r '+p.r.toFixed(0)+' m), grazing its mats'};},
  camp(Rs){const bad=Rs.filter(r=>{const e=4,s=Math.hypot(drawnH(r.x+e,r.z)-drawnH(r.x-e,r.z),drawnH(r.x,r.z+e)-drawnH(r.x,r.z-e))/(2*e);return s>.04||S.salt(r.x,r.z)<.3;}),pend=Rs.filter(r=>r.pending).length;
   return{ok:Rs.length>6&&!bad.length&&pend===Rs.length,detail:bad.length?bad.length+' camp records off the flat crust (first '+bad[0].id+')':Rs.length+' Yuni records on the flat salt crust (under 4% on the drawn ground), every one pending: drawn as stand-ins'};}};
 function checks(add){add('the brine pools show in their bowls, ringed by their mats',CK.pools(S.POOLS,hazards()));add('the halite sifters graze the biggest pool\'s rim (kits/fauna)',CK.sifters(SIFT));add('the salt camp is Yuni records on the flat crust, pending stand-ins',CK.camp(R));}
 function negatives(add){const p=S.POOLS[0];if(p){add('a pool standing over its rim',CK.pools([Object.assign({},p,{level:p.level+3})],hazards()));add('a pool with no crust hazard',CK.pools([p],[]));}
  if(SIFT.length)add('a sifter out in the water',CK.sifters([Object.assign({},SIFT[0],{x:big.x,z:big.z,y:null})]));
  add('a camp on the scarp\'s slope',CK.camp([Object.assign({},R[0],{x:2500,z:-2500})]));}
 // ---------------------------------------------------------------- the views (each camera over the drawn ground: 99's check)
 function views(H){const {look}=H,V={};
  V['Across the playa to Lake Nim']=look(S.shoreX+900,200,1.8,S.shoreX-3000,0,0);
  if(big){V['A brine pool and its mats']=look(big.x+big.r*2.6,big.z+big.r*1.2,1.8,big.x,big.z,0);
   const s=SIFT[0];if(s)V['The halite sifters at the pool']=look(s.x+(s.x-big.x)*.9+8,s.z+(s.z-big.z)*.9,2,s.x,s.z,.8);}
  V['The salt-cutters\' camp']=look(C.x+70,C.z+55,2,C.x,C.z,1);
  V['The scarp east']=look(0,0,2,30000,0,300);
  V['Mount Caelum far west']=look(400,600,2.5,-150000,-20000,4000);
  V['From afar']=look(2600,2600,380,-400,0,0);
  return V;}
 return{build,hazards,checks,negatives,views,R,SIFT};})();
