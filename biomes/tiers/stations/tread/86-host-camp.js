// ================================================================= HOST — STATION 4: THE HERDERS' SUMMER CAMP and their flocks (PLAN.md section 6)
// An NPC band's camp, not a player outpost (the owner's rule). PLAN.md section 6: herders' camps on the great tread and the high steps in summer
// (the middle steps in winter), goat, sheep and ostrich herds, seasonal camps that move with the treads: core/camp (KCAMP). Here as RECORDS FIRST:
//   THE ROW      a culture row for the Tierhounds' herders (KCAMP.CULTURES['tierhound-herd'], this station's data until kits/coyote writes it: the
//                Coyote kit's plan names no camp pieces yet): their black goat-hair tents (a household each, the headman's the largest), the dairy
//                tent where the cheese is pressed, a store; the stone folds and the ostrich pen downwind; a dry-stone wall round it all
//   THE PITCH    KCAMP.pitch on the tread's open ground (44w: openK), a horseshoe open toward the gorge's head (the way down to the water in
//                the gorge's tanks); KCAMP.census deals the households; every record registered in core/tags (pending: kits/coyote) before it is drawn
//   THE DRAWING  stand-ins at the records' boxes, one merged mesh per surface: a black tent a low ridge of goat-hair cloth on poles, a fold a ring of
//                dry stone, the wall a row of stone with its gates left open
//   THE FLOCKS   goats and sheep in three flocks and the ostriches in one, each walking a loop out on the steppe round the camp (BIO.walker: a pose
//                from the clock, so the export bakes one lap), the animals milling round their leader, heads down
// CAMP.build() runs first in the build (89z: LAND.prebuild), so the kit's plants keep clear of the boxes (OBSTACLES).
const CAMP=(function(){
 const ROW='tierhound-herd',SITE_C={x:-450,z:-650};
 if(typeof KCAMP!=='undefined'&&!KCAMP.CULTURES[ROW])KCAMP.CULTURES[ROW]={
  kind:k=>/^cy_herd_tent_head/.test(k)?'chief':/^cy_herd_tent/.test(k)?'dwelling':/^cy_herd_(dairy|store)/.test(k)?'trade':/^cy_herd_(fold|ostrich)/.test(k)?'pen':null,
  households:{cy_herd_tent_head:1,cy_herd_tent:1},household:[4,7],chiefHousehold:[6,8],sleepers:[2,3],
  work:{cy_herd_dairy:{role:'cheesemaker',n:1},cy_herd_store:{role:'herder',n:1},cy_herd_fold:{role:'herder',n:2},cy_herd_ostrich:{role:'herder',n:1}},
  elderShare:.35,mountsPer:0,wind:[.7071,.7071],formation:'horseshoe'};   /* the tread's westerlies blow to the south-east: the folds go that way */
 const PROGRAM={tents:[{key:'cy_herd_tent_head',n:1,v:0},{key:'cy_herd_tent',n:7,v:0},{key:'cy_herd_dairy',n:1,v:0},{key:'cy_herd_store',n:1,v:0}],
  pens:[{key:'cy_herd_fold',n:3,v:0},{key:'cy_herd_ostrich',n:1,v:0}],hedge:{key:'cy_herd_wall',v:0},pasture:null};
 const DIMS=(key)=>/tent_head/.test(key)?{w:11,d:8,h:3.4}:/_tent/.test(key)?{w:7,d:5.5,h:2.6}:/dairy/.test(key)?{w:6,d:5,h:2.6}:/store/.test(key)?{w:3.5,d:3.5,h:2}:
  /fold/.test(key)?{w:16,d:13,h:1.3}:/ostrich/.test(key)?{w:20,d:18,h:1.6}:{w:3,d:3,h:1.5};
 const slopeAt=(x,z)=>{const e=3;return Math.hypot(terrainH(x+e,z)-terrainH(x-e,z),terrainH(x,z+e)-terrainH(x,z-e))/(2*e);};
 const ok=(x,z)=>STATION.openK(x,z)>.6&&slopeAt(x,z)<.14;
 let C=null,census=null,err=null;
 try{if(typeof KCAMP==='undefined')throw new Error('core/camp is not on the page');
  const toward=STATION.GL[0],way=[toward[0]-SITE_C.x,toward[1]-SITE_C.z],wl=Math.hypot(way[0],way[1]);
  C=KCAMP.pitch({id:'tiers-herders',world:6140,culture:ROW,program:PROGRAM,site:SITE_C,dims:DIMS,ground:{ok},way:[way[0]/wl,way[1]/wl],gap:3,common:12});
  census=KCAMP.census({id:'tiers-herders',world:6140,culture:ROW,program:PROGRAM});}catch(e){err=String(e&&e.message||e);}
 const recs=C?C.records.slice():[];
 const NAME={cy_herd_tent_head:'The headman\'s tent (goat-hair cloth)',cy_herd_tent:'A herding household\'s black tent',cy_herd_dairy:'The dairy tent (the cheese pressed and dried)',
  cy_herd_store:'The store (fodder, salt, the winter\'s cheese)',cy_herd_fold:'A stone fold (goats and sheep at night)',cy_herd_ostrich:'The ostrich pen'};
 recs.forEach(r=>{r.y=terrainH(r.x,r.z);r.name=(NAME[r.key]||r.key)+' (pending: kits/coyote)';});
 // ---------------------------------------------------------------- the drawing: stand-ins at the records' boxes, one merged mesh per surface
 const SURF={cloth:{c:0x2a2522,label:'Goat-hair tent cloth (stand-in: kits/coyote, planned)'},pole:{c:0x6a5038,label:'Tent poles and guy ropes'},
  stone:{c:0x77726a,label:'Dry-stone folds and the camp\'s wall (stand-in)'},hearth:{c:0x3a3430,label:'The hearth (stand-in)'}};
 const ACC={};for(const k in SURF)ACC[k]={pos:[],nor:[],idx:[]};
 const T=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),Vv=new THREE.Vector3(),Sv=new THREE.Vector3(),N3=new THREE.Matrix3();
 function put(surf,geo,x,y,z,ry,sx,sy,sz){const A=ACC[surf],p=geo.attributes.position,n=geo.attributes.normal,o=A.pos.length/3;
  T.compose(Vv.set(x,y,z),Q.setFromEuler(E.set(0,ry,0)),Sv.set(sx,sy,sz));N3.getNormalMatrix(T);const v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.set(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(T);A.pos.push(v.x,v.y,v.z);v.set(n.getX(i),n.getY(i),n.getZ(i)).applyMatrix3(N3).normalize();A.nor.push(v.x,v.y,v.z);}
  if(geo.index)for(let i=0;i<geo.index.count;i++)A.idx.push(o+geo.index.getX(i));else for(let i=0;i<p.count;i++)A.idx.push(o+i);}
 const BOX=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),CYL=new THREE.CylinderGeometry(.5,.5,1,6,1).translate(0,.5,0);
 /* a black tent: a low ridge along the box's width (local x), the cloth sloping to the ground on both long sides, the door (+z) under its eave */
 const RIDGE=(function(){const g=new THREE.CylinderGeometry(.5,.5,1,3,1,false);g.rotateZ(Math.PI/2);g.rotateX(Math.PI);g.translate(0,.25,0);g.computeVertexNormals();return g;})();
 const foot=r=>{let m=terrainH(r.x,r.z);const c=Math.cos(r.ry||0),s=Math.sin(r.ry||0);for(const [a,b] of [[.45,.45],[-.45,.45],[.45,-.45],[-.45,-.45]]){const dx=a*r.w,dz=b*r.d;m=Math.min(m,terrainH(r.x+dx*c+dz*s,r.z-dx*s+dz*c));}return m;};
 const loc=(r,a,b)=>{const c=Math.cos(r.ry||0),s=Math.sin(r.ry||0),dx=a*r.w,dz=b*r.d;return[r.x+dx*c+dz*s,r.z-dx*s+dz*c];};
 function wallAlong(pts,closed,h,w,gates,L0){   /* dry stone along a polyline: a block every 1.6 m, each sunk to the ground under it; gates (distances) left open 4 m */
  let s=0;const n=pts.length;for(let i=0;i<(closed?n:n-1);i++){const a=pts[i],b=pts[(i+1)%n],l=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=Math.atan2(b[1]-a[1],-(b[0]-a[0]));
   for(let t=.8;t<l;t+=1.6){const S=s+t;if(gates&&gates.some(g=>Math.abs(g-S)<2.2))continue;const x=a[0]+(b[0]-a[0])*t/l,z=a[1]+(b[1]-a[1])*t/l,y=terrainH(x,z);
    put('stone',BOX,x,y-.35,z,ry+Math.PI/2,1.7,h+.35,w);}s+=l;}}
 function draw(r){const yb=foot(r)-.3;
  if(r.kind==='pen'){const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(([a,b])=>loc(r,a,b));wallAlong(P,true,r.h,.7,[r.w*.5],0);return;}
  if(/store/.test(r.key)){put('stone',BOX,r.x,yb,r.z,r.ry,r.w,r.h+.3,r.d);put('cloth',BOX,r.x,yb+r.h+.3,r.z,r.ry,r.w+.4,.25,r.d+.4);return;}
  /* the tent: the cloth's ridge on poles, its skirt to the ground, two poles at the ridge's ends and the door's pair */
  put('cloth',RIDGE,r.x,yb,r.z,r.ry,r.w,(r.h-yb+foot(r))*2,r.d);
  for(const a of [-.42,.42]){const p=loc(r,a,0);put('pole',CYL,p[0],yb,p[1],0,.12,r.h+.6,.12);}
  for(const a of [-.2,.2]){const p=loc(r,a,.55);put('pole',CYL,p[0],yb,p[1],0,.08,r.h*.6,.08);}}
 const MESHES=[],PP=[],FLOCKS=[];
 function build(){if(err){reportErr('the herders\' camp: '+err);return{records:0,error:err};}
  REGISTER({name:'The herders\' summer camp (the Tierhounds; a band of '+census.pop+')',kind:'camp',cls:'settlement',culture:'coyote',pending:true,id:'tiers-herders',x:C.site.x,z:C.site.z,y:terrainH(C.site.x,C.site.z),r:C.R+30,h:6,
   tags:{camp:{id:'tiers-herders',culture:ROW,records:recs.map(r=>r.id)},culture:'coyote',pending:true}});
  recs.forEach(r=>{REGISTER({name:r.name,key:r.key,cls:'building',kind:r.kind==='pen'?'pen':'tent',culture:'coyote',pending:true,id:r.id,x:r.x,z:r.z,y:foot(r)-.3,r:Math.hypot(r.w,r.d)*.5,h:r.h+1,
   tags:{settlement:'tiers-herders',role:r.kind,culture:'coyote',pending:true}});
   OBSTACLES.push({x:r.x,z:r.z,r:Math.hypot(r.w,r.d)*.5+1.5});draw(r);PP.push(r.x,foot(r)+r.h*.5,r.z);});
  /* the hearth in the common, and the wall round it all with its gates */
  {const h=C.hearth,y=terrainH(h.x,h.z);for(let k=0;k<9;k++){const a=k/9*TAU;put('hearth',BOX,h.x+Math.cos(a)*1.1,y-.15,h.z+Math.sin(a)*1.1,a,.4,.4,.4);}
   REGISTER({name:'The hearth (the common, dung fire)',kind:'hearth',culture:'coyote',pending:true,id:'tiers-herders:hearth',x:h.x,z:h.z,y,r:1.6,h:1});}
  if(C.hedge)wallAlong(C.hedge.pts,true,1.1,.8,C.hedge.gates,0);
  for(const k in ACC){const A=ACC[k];if(!A.idx.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));
   g.setAttribute('normal',new THREE.Float32BufferAttribute(A.nor,3));g.setIndex(A.idx);
   const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:SURF[k].c}));m.userData.host=true;m.userData.village=true;m.userData.inspectLabel=SURF[k].label;scene.add(m);MESHES.push(m);}
  if(MESHES.length)MESHES[0].userData.probePoints=new Float32Array(PP);
  const chk=KCAMP.check(C,{ok});
  return{records:recs.length,pop:census.pop,households:census.households.length==null?census.households:census.households.length,short:C.short.length,overlaps:chk.overlaps,offGround:chk.offGround};}
 // ---------------------------------------------------------------- the flocks (after the kit's plants: 89z calls CAMP.flocks once BIO's clock runs)
 /* a beast's body: an ellipsoid on four legs, a neck and a head (goat and sheep), or a round body on two long legs with a long neck (ostrich); a unit
    body, scaled per instance; +z its head */
 function beastGeo(bird){const P=[],N=[],I=[];const add=(geo,x,y,z,sx,sy,sz,rx)=>{const M4=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,0,0)),new THREE.Vector3(sx,sy,sz)),
   N9=new THREE.Matrix3().getNormalMatrix(M4),p=geo.attributes.position,n=geo.attributes.normal,o=P.length/3,v=new THREE.Vector3();
   for(let i=0;i<p.count;i++){v.set(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(M4);P.push(v.x,v.y,v.z);v.set(n.getX(i),n.getY(i),n.getZ(i)).applyMatrix3(N9).normalize();N.push(v.x,v.y,v.z);}
   if(geo.index)for(let i=0;i<geo.index.count;i++)I.push(o+geo.index.getX(i));else for(let i=0;i<p.count;i++)I.push(o+i);};
  const S=new THREE.SphereGeometry(.5,8,6),L=new THREE.CylinderGeometry(.5,.5,1,5,1).translate(0,.5,0);
  if(!bird){add(S,0,.62,0,.5,.42,.95);for(const [x,z] of [[-.14,.3],[.14,.3],[-.14,-.3],[.14,-.3]])add(L,x,0,z,.07,.5,.07);add(L,0,.7,.38,.12,.32,.12,.7);add(S,0,.98,.58,.16,.16,.3);}
  else{add(S,0,1.15,0,.75,.55,.95);for(const x of [-.12,.12])add(L,x,0,0,.08,.95,.08);add(L,0,1.2,.32,.07,.95,.07,.25);add(S,0,2.1,.5,.13,.12,.2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setIndex(I);return g;}
 function flocks(){if(err||!C)return{flocks:0};const {TAU:TA,smooth:sm}=BIO.fn,st={flocks:0,beasts:0};
  const kinds=[{name:'A flock of the herders\' goats',n:[26,40],bird:false,cols:[0x2c2420,0x6a5a48,0xc8bca8,0x8a6a4a],sc:[.9,1.1],r:[220,360],speed:.35},
   {name:'A flock of the herders\' fat-tailed sheep',n:[34,50],bird:false,cols:[0xd8d0c0,0xc4b8a2,0x5a4a3a],sc:[1,1.2],r:[260,420],speed:.3},
   {name:'A flock of the herders\' goats',n:[22,32],bird:false,cols:[0x2c2420,0x4a3a30,0xb0a088],sc:[.9,1.05],r:[300,480],speed:.35},
   {name:'The herders\' ostriches',n:[10,16],bird:true,cols:[0x1c1a18,0x5a524a],sc:[.95,1.1],r:[340,520],speed:.5}];
  const okF=(x,z)=>STATION.openK(x,z)>.4&&slopeAt(x,z)<.3&&!OBSTACLES.some(o=>Math.hypot(o.x-x,o.z-z)<o.r+3);
  const GEO=[beastGeo(false),beastGeo(true)],MAT=new THREE.MeshLambertMaterial({color:0xffffff});
  kinds.forEach((K,fi)=>{const rand=KRAND.stream(KRAND.hash(6140,fi,0x46)).next,rr=(a,b)=>a+(b-a)*rand();
   const a0=fi/kinds.length*TA+rand()*.8,R0=rr(K.r[0],K.r[1]),cx=C.site.x+Math.cos(a0)*R0,cz=C.site.z+Math.sin(a0)*R0;let pts=null;
   for(const f of [1,.6,.35])if(!pts)pts=BIO.walkLoop(cx,cz,(70+rand()*40)*f,okF,rand);
   if(!pts)return;const W=BIO.walker(pts,[{i:1,d:180},{i:Math.floor(pts.length/2),d:240}],K.speed,6,rand()*900,.5),P0=W.P;
   const n=Math.round(rr(K.n[0],K.n[1])),an=[];for(let i=0;i<n;i++){const a=rand()*TA,d=Math.sqrt(rand())*(K.bird?14:18);an.push({ox:Math.cos(a)*d,oz:Math.sin(a)*d,sc:rr(K.sc[0],K.sc[1]),ph:rand()*TA,col:K.cols[Math.floor(rand()*K.cols.length)]});}
   const qw=w=>TA*Math.max(1,Math.round(w*P0/TA))/P0,w1=qw(.21),w2=qw(.17),w3=qw(.4);
   const im=BIO.dynamic('fauna:flock'+fi,GEO[K.bird?1:0],MAT,n,{label:K.name,motion:{period:()=>P0,hz:4}});const col=new THREE.Color();
   an.forEach((a,i)=>{im.setColorAt(i,col.setHex(a.col).convertSRGBToLinear());});if(im.instanceColor)im.instanceColor.needsUpdate=true;
   const M4=new THREE.Matrix4(),Pv=new THREE.Vector3(),Qv=new THREE.Quaternion(),Sv2=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
   const upd=t=>{const o=BIO.walkAt(W,t,0,8);an.forEach((a,i)=>{const x=o.x+a.ox+Math.sin(t*w1+a.ph)*2.5,z=o.z+a.oz+Math.cos(t*w2+a.ph)*2.5;
     Pv.set(x,terrainH(x,z),z);Qv.setFromAxisAngle(UP,o.hd+Math.sin(t*w3+a.ph)*.6);Sv2.set(a.sc,a.sc,a.sc);M4.compose(Pv,Qv,Sv2);im.setMatrixAt(i,M4);});im.instanceMatrix.needsUpdate=true;};
   upd(BIO.WIND.t.value);BIO.host.ticks(()=>upd(BIO.WIND.t.value));
   REGISTER({name:K.name+' (grazing the steppe round the camp)',kind:'fauna',label:K.name,culture:'coyote',x:cx,z:cz,y:terrainH(cx,cz),r:90,h:3,tags:{settlement:'tiers-herders',herd:K.bird?'ostrich':fi===1?'sheep':'goat',n}});
   FLOCKS.push({name:K.name,n,x:cx,z:cz,walker:W});st.flocks++;st.beasts+=n;});
  return st;}
 return{C,census,records:recs,build,flocks,flocksList:FLOCKS,meshes:MESHES,error:err,site:SITE_C,program:PROGRAM,ok};})();
