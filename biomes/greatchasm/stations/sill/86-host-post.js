// ================================================================= HOST — STATION 1: THE TRADE POST (name TBD; PLAN.md section 5)
// An NPC settlement, not a player outpost (the owner, 2026-11-09). A Yuni trading family holds the serai under the Emir's licence and the Peak
// tribe of the Coyote Men holds its own half (proposed, the plan's): neither rules the other, and a line of contour-carved boundary stones runs
// across the market court between them. Both build in mud. Here as RECORDS FIRST (POST.records: plain data, one per building or piece, each with
// its culture, half, role and box, keyed by a stable id), registered in core/tags before anything is drawn, then drawn as STAND-INS AT THEIR
// BOXES: every record is `pending` (core/hamlet's word: a building the kit does not have yet), because
//   - the Yuni half's buildings are the Yuni kit's (kits/yuni: the caravanserai in banco adobe with Tiebele chevron bands, a Musgum shell house,
//     the tower-house, the yellow hyperboloid over the gate), which draw through the Yuni engine that stays in the worlds that forked it
//     (MODULARITY-PLAN.md step 4b): no page outside settlements/yuni reads it yet;
//   - the Coyote half's (the stepped mud-brick rooms, the runner-bird shrine, the contour-carved stones) wait for kits/coyote (planned);
//   - core/hamlet has no `trade` focus and no Yuni or Coyote culture row (PLAN.md section 8, amendment 1: owed), so the layout below is laid by
//     hand on the terrace, in the post's own frame, and moves onto KHAMLET.village when core/hamlet gains the trade post.
// The stand-ins keep each culture's colour and massing (the serai a square court behind a gated wall, the shell houses domes, the Coyote rooms
// stepping up the slope with flat roofs as terraces), so the post reads right at range. Owed with them: core/simulation's books (the
// settlement's stock and its caravans' trade, PLAN.md section 5), core/camp's `court` for the caravans' stop, a pin in model/src/60-settlements.js
// (KNOWN_ISSUES.md). The qanat's open shafts and the cistern's lip are hazards (POST.hazards: 88 registers them).
const POST=(function(){const P=STATION.PAD,y0=P.y;
 // ---------------------------------------------------------------- the records (data): {id, name, culture, half, role, kind, x, z, ry, w, d, h, y?}
 const R=[],add=(o)=>{R.push(Object.assign({pending:true,settlement:'post'},o));};
 // the Yuni half (west of the stones): the caravanserai's court behind its walls, the gate in its north wall under the hyperboloid, the family's
 // tower-house, two Musgum shell houses, the cistern's stone kerb
 const SX=-75,SZ=25,SW=64,ST=1.6,SH=6.5,ry=0;
 add({id:'post:serai:wall-n-w',name:'The caravanserai (its north wall, west of the gate)',culture:'yuni',half:'yuni',role:'serai',kind:'wall',x:SX-SW/4-2.5,z:SZ-SW/2,ry,w:SW/2-5,d:ST,h:SH});
 add({id:'post:serai:wall-n-e',name:'The caravanserai (its north wall, east of the gate)',culture:'yuni',half:'yuni',role:'serai',kind:'wall',x:SX+SW/4+2.5,z:SZ-SW/2,ry,w:SW/2-5,d:ST,h:SH});
 add({id:'post:serai:wall-s',name:'The caravanserai (its south wall)',culture:'yuni',half:'yuni',role:'serai',kind:'wall',x:SX,z:SZ+SW/2,ry,w:SW,d:ST,h:SH});
 add({id:'post:serai:wall-w',name:'The caravanserai (its west wall)',culture:'yuni',half:'yuni',role:'serai',kind:'wall',x:SX-SW/2,z:SZ,ry,w:ST,d:SW,h:SH});
 add({id:'post:serai:wall-e',name:'The caravanserai (its east wall)',culture:'yuni',half:'yuni',role:'serai',kind:'wall',x:SX+SW/2,z:SZ,ry,w:ST,d:SW,h:SH});
 add({id:'post:serai:gate',name:'The serai\'s gate (the yellow hyperboloid over it)',culture:'yuni',half:'yuni',role:'gate',kind:'hyperboloid',x:SX,z:SZ-SW/2,ry,w:10,d:10,h:14});
 for(let k=0;k<6;k++)add({id:'post:serai:bay-'+k,name:'A bay of the serai (stores and stalls under the wall)',culture:'yuni',half:'yuni',role:'store',kind:'room',
  x:SX-SW/2+6+k*10.4,z:SZ+SW/2-5,ry,w:9,d:8,h:4.2});
 add({id:'post:tower',name:'The family\'s tower-house',culture:'yuni',half:'yuni',role:'house',kind:'tower',x:SX-SW/2-16,z:SZ-12,ry,w:9,d:9,h:19});
 add({id:'post:shell-1',name:'A Musgum shell house',culture:'yuni',half:'yuni',role:'house',kind:'shell',x:SX-SW/2-14,z:SZ+18,ry,w:7,d:7,h:8.5});
 add({id:'post:shell-2',name:'A Musgum shell house',culture:'yuni',half:'yuni',role:'house',kind:'shell',x:SX-SW/2-6,z:SZ+34,ry,w:6,d:6,h:7.5});
 const C=STATION.CIST;
 add({id:'post:cistern',name:'The cistern\'s kerb (Yuni stone; the qanat feeds it)',culture:'yuni',half:'yuni',role:'cistern',kind:'kerb',x:(C.x0+C.x1)/2,z:(C.z0+C.z1)/2,ry,w:C.x1-C.x0+1.6,d:C.z1-C.z0+1.6,h:.7,y:y0});
 // the market court between the halves (open ground; its records are the stones and the stalls), the line of boundary stones across it N-S
 for(let k=0;k<7;k++)add({id:'post:stone-'+k,name:'A boundary stone (contour-carved: the Coyote Men\'s Hum)',culture:'coyote',half:'line',role:'boundary',kind:'stone',x:28+(k%2)*1.5,z:-108+k*12,ry:.2*k,w:.7,d:.5,h:1.6});
 for(let k=0;k<4;k++)add({id:'post:stall-y'+k,name:'A Yuni market stall (an awning on poles)',culture:'yuni',half:'yuni',role:'stall',kind:'stall',x:4+(k%2)*10,z:-112+Math.floor(k/2)*16,ry,w:6,d:4,h:2.8});
 for(let k=0;k<4;k++)add({id:'post:stall-c'+k,name:'A Coyote market stall (hides on a frame)',culture:'coyote',half:'coyote',role:'stall',kind:'stall',x:46+(k%2)*10,z:-108+Math.floor(k/2)*16,ry,w:5,d:4,h:2.4});
 // the Coyote half (east of the stones): stepped mud-brick rooms climbing the slope behind the court, flat roofs as terraces; the runner bird's
 // shrine at the bench road's head
 for(let t=0;t<3;t++)for(let k=0;k<4;k++)add({id:'post:coyote-'+t+'-'+k,name:'A Coyote room (stepped mud brick, its roof the next one\'s terrace)',culture:'coyote',half:'coyote',role:'house',kind:'room',
  x:92+t*11,z:-60+k*13+(t%2)*4,ry:0,w:10,d:11,h:3.6,y:y0+t*2.8});
 add({id:'post:shrine',name:'The runner bird\'s shrine (at the bench road\'s head)',culture:'coyote',half:'coyote',role:'shrine',kind:'shrine',x:236,z:-118,ry:.6,w:2.4,d:2.4,h:3.2});
 // outside the walls: the ostriches' pen (the Coyote Men's riding birds) and the Yuni draught beasts' pen, each a fenced ring
 add({id:'post:pen-ostrich',name:'The ostriches\' pen',culture:'coyote',half:'coyote',role:'pen',kind:'pen',x:165,z:-120,ry:0,w:34,d:34,h:1.6});
 add({id:'post:pen-beasts',name:'The draught beasts\' pen (the Yuni caravans\')',culture:'yuni',half:'yuni',role:'pen',kind:'pen',x:-170,z:-70,ry:0,w:40,d:40,h:1.8});
 // the qanat: its shafts' spoil rings every 70 m from the cistern up the sill to the south-east (its mother well past the page)
 const QA=[[-12,-74],[60,180],[260,800],[520,1500],[760,2500]],qanat=[];
 {let acc=0;for(let i=0;i<QA.length-1;i++){const a=QA[i],b=QA[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=acc>0?70-acc:70;s<L;s+=70){qanat.push([a[0]+(b[0]-a[0])*s/L,a[1]+(b[1]-a[1])*s/L]);}acc=(acc+L)%70;}}
 qanat.forEach((q,i)=>add({id:'post:qanat-'+i,name:'A qanat shaft (its spoil ring; open below)',culture:'yuni',half:'yuni',role:'qanat',kind:'shaft',x:q[0],z:q[1],ry:0,w:7,d:7,h:1.2}));
 R.forEach(r=>{if(r.y==null)r.y=terrainH(r.x,r.z);});
 // ---------------------------------------------------------------- the drawing: stand-ins at the records' boxes, one merged mesh per surface
 const SURF={adobe:{c:0xb4875a,label:'Banco adobe (stand-in: the Yuni kit\'s)'},band:{c:0x2e2622,label:'Tiebele chevron band (stand-in)'},
  ochre:{c:0xd8b040,label:'The yellow hyperboloid (stand-in)'},mud:{c:0x9a6c4a,label:'Coyote mud brick (stand-in: kits/coyote, planned)'},
  stone:{c:0x6e6862,label:'Contour-carved stone (stand-in)'},wood:{c:0x6a4e36,label:'Poles and frames'},cloth:{c:0xc8b48a,label:'Awnings and hides'},
  spoil:{c:0x8e7c64,label:'Qanat spoil'}};
 const ACC={};for(const k in SURF)ACC[k]={pos:[],nor:[],idx:[]};
 const T=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),V=new THREE.Vector3(),S=new THREE.Vector3(),N3=new THREE.Matrix3();
 function put(surf,geo,x,y,z,ry,sx,sy,sz){const A=ACC[surf],g=geo.index?geo:geo,p=g.attributes.position,n=g.attributes.normal,o=A.pos.length/3;
  T.compose(V.set(x,y,z),Q.setFromEuler(E.set(0,ry,0)),S.set(sx,sy,sz));N3.getNormalMatrix(T);const v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.set(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(T);A.pos.push(v.x,v.y,v.z);v.set(n.getX(i),n.getY(i),n.getZ(i)).applyMatrix3(N3).normalize();A.nor.push(v.x,v.y,v.z);}
  if(g.index)for(let i=0;i<g.index.count;i++)A.idx.push(o+g.index.getX(i));else for(let i=0;i<p.count;i++)A.idx.push(o+i);}
 const BOX=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),CYL=new THREE.CylinderGeometry(.5,.5,1,10,1).translate(0,.5,0);
 const DOME=new THREE.SphereGeometry(.5,12,8,0,TAU,0,Math.PI/2).scale(1,2,1);   /* a shell house: a tall dome, unit across, 1 high */
 const HYP=(function(){const pts=[];for(let k=0;k<=8;k++){const t=k/8,r=.5*Math.sqrt(.35+3*(t-.5)*(t-.5));pts.push(new THREE.Vector2(r,t));}return new THREE.LatheGeometry(pts,14);})();
 const RING=new THREE.TorusGeometry(.5,.18,5,12).rotateX(Math.PI/2).translate(0,.06,0);
 const foot=r=>Math.min(terrainH(r.x,r.z),terrainH(r.x+r.w*.4,r.z+r.d*.4),terrainH(r.x-r.w*.4,r.z-r.d*.4),terrainH(r.x+r.w*.4,r.z-r.d*.4),terrainH(r.x-r.w*.4,r.z+r.d*.4));
 function draw(r){const yb=Math.min(r.y,foot(r))-.4,top=r.y+r.h;   /* each piece sunk to the lowest ground under its box: no gap on a slope */
  switch(r.kind){
   case 'wall':put('adobe',BOX,r.x,yb,r.z,r.ry,r.w,top-yb,r.d);put('band',BOX,r.x,r.y+r.h*.62,r.z,r.ry,r.w+.02,.5,r.d+.06);break;   /* the chevron band: a dark course along the wall */
   case 'room':put(r.culture==='yuni'?'adobe':'mud',BOX,r.x,yb,r.z,r.ry,r.w,top-yb,r.d);if(r.culture==='coyote')put('mud',BOX,r.x,top,r.z,r.ry,r.w+.4,.35,r.d+.4);break;
   case 'tower':put('adobe',BOX,r.x,yb,r.z,r.ry,r.w,top-yb,r.d);for(let k=1;k<4;k++)put('band',BOX,r.x,r.y+r.h*k/4,r.z,r.ry,r.w+.06,.45,r.d+.06);put('adobe',BOX,r.x,top,r.z,r.ry,r.w*.6,1.6,r.d*.6);break;
   case 'shell':put('adobe',DOME,r.x,yb,r.z,0,r.w,top-yb,r.d);break;
   case 'hyperboloid':put('adobe',BOX,r.x-4,yb,r.z,r.ry,2.2,r.y+6.5-yb,ST+.4);put('adobe',BOX,r.x+4,yb,r.z,r.ry,2.2,r.y+6.5-yb,ST+.4);
    put('ochre',HYP,r.x,r.y+6.5,r.z,0,7,r.h-6.5,7);break;
   case 'kerb':put('stone',BOX,r.x,r.y-.3,r.z-r.d/2,r.ry,r.w,r.h+.3,.8);put('stone',BOX,r.x,r.y-.3,r.z+r.d/2,r.ry,r.w,r.h+.3,.8);
    put('stone',BOX,r.x-r.w/2,r.y-.3,r.z,r.ry,.8,r.h+.3,r.d);put('stone',BOX,r.x+r.w/2,r.y-.3,r.z,r.ry,.8,r.h+.3,r.d);break;
   case 'stone':put('stone',BOX,r.x,yb,r.z,r.ry,r.w,top-yb,r.d);break;
   case 'stall':for(const [dx,dz] of [[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]])put('wood',CYL,r.x+dx*r.w,yb,r.z+dz*r.d,0,.12,top-yb,.12);put('cloth',BOX,r.x,top,r.z,r.ry,r.w+.3,.08,r.d+.3);break;
   case 'shrine':put('stone',BOX,r.x,yb,r.z,r.ry,r.w,.8+r.y-yb,r.d);put('stone',BOX,r.x,r.y+.8,r.z,r.ry,.6,r.h-.8,.45);break;
   case 'pen':{const n=Math.round(Math.PI*r.w/2.5);for(let k=0;k<n;k++){const a=k/n*TAU,px=r.x+Math.cos(a)*r.w/2,pz=r.z+Math.sin(a)*r.w/2,py=terrainH(px,pz);put('wood',CYL,px,py-.3,pz,0,.14,r.h+.3,.14);}
    for(let k=0;k<n;k++){const a=(k+.5)/n*TAU,px=r.x+Math.cos(a)*r.w/2,pz=r.z+Math.sin(a)*r.w/2,py=terrainH(px,pz);put('wood',BOX,px,py+r.h*.7,pz,-a,.08,.1,2.6);}break;}
   case 'shaft':put('spoil',RING,r.x,r.y,r.z,0,r.w,r.h*2,r.d);break;}}
 const anchors=new THREE.Group();anchors.userData.host=true;
 function build(){
  for(const r of R){r.regY=Math.min(r.y,foot(r))-.5;REGISTER({name:r.name,key:r.id,x:r.x,z:r.z,y:r.regY,r:Math.max(1.2,Math.hypot(r.w,r.d)*.5),h:r.y+r.h+1.5-r.regY,
   tags:{culture:r.culture,settlement:'trade-post',half:r.half,role:r.role,pending:true}});
   OBSTACLES.push({x:r.x,z:r.z,r:Math.hypot(r.w,r.d)*.5+1,y0:r.y-2,y1:r.y+r.h});}
  R.forEach(draw);
  const out={meshes:0,tris:0};
  for(const k in ACC){const A=ACC[k];if(!A.idx.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));
   g.setAttribute('normal',new THREE.Float32BufferAttribute(A.nor,3));g.setIndex(A.idx);
   const m=new THREE.MeshLambertMaterial({color:SURF[k].c});const me=new THREE.Mesh(g,m);me.userData.host=true;me.userData.post=true;me.userData.inspectLabel=SURF[k].label;scene.add(me);
   out.meshes++;out.tris+=A.idx.length/3;}
  /* an invisible anchor at each record's middle: the probe's registered-volume check finds something inside each (a court, a pen) */
  const A=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),R.length),M4=new THREE.Matrix4();
  R.forEach((r,i)=>{M4.makeTranslation(r.x,r.regY+(r.y+r.h+1.5-r.regY)*.5,r.z);A.setMatrixAt(i,M4);});A.userData.host=true;A.userData.inspectLabel='post anchors';A.frustumCulled=false;scene.add(A);
  out.records=R.length;out.pending=R.filter(r=>r.pending).length;out.yuni=R.filter(r=>r.half==='yuni').length;out.coyote=R.filter(r=>r.half==='coyote').length;window._post=out;return out;}
 function hazards(){return R.filter(r=>r.kind==='shaft').map(r=>({name:'An open qanat shaft (a fall of 20-40 m)',kind:'pit',x:r.x,z:r.z,r:1.4,h:3,y:r.y-1.5,danger:.8,
   tell:{sign:'a ring of spoil round a dark hole'}})).concat([{name:'The cistern (its open tank)',kind:'drown',x:(C.x0+C.x1)/2,z:(C.z0+C.z1)/2,r:Math.hypot(C.x1-C.x0,C.z1-C.z0)*.5,h:4,y:C.floor,danger:.4,
   tell:{sign:'the kerb and the dark water under it'}}]);}
 return{records:R,build,hazards,qanat};})();
