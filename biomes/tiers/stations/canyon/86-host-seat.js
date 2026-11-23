// ================================================================= HOST — STATION 2: THE SEAT OF THE COYOTE KINGDOM (its landmarks; PLAN.md section 6)
// An NPC settlement, not a player outpost. The capital of the Tierhounds (the Coyote Men of the Tiers; the owner, 2026-11-10): the king's house at
// the canyon's head over the spring, a stepped town down the walls (Masuleh's rule: each row's roofs the lane of the row above), terraced gardens on
// every ledge, the trickster's shrine, contour carvings on the walls. RECORDS FIRST, keyed by the Coyote kit's own defs (kits/coyote/PLAN.md section 3,
// draft 2026-11-16: cy_spring_hall, cy_treasury, cy_council, cy_runner_shrine, cy_rock_facade, cy_milestone), each registered in core/tags before it
// is drawn, every one `pending` and drawn as a stand-in at its box until the kit's bundle (KratorCoyote, its phase C9) is on the page: then dims(key)
// and the drawing are the kit's (SEAT_DIMS below gives way to KratorCoyote.dims when it is loaded).
// WHAT IS HERE: the landmarks the plan places (the spring hall over the spring, the treasury and the council in the head's bowl, the runner bird's
// shrine at the stair road's foot, rock-cut façades on the walls' risers, milestones along the road). WHAT IS NOT: the town's rows on the walls. The
// layout of a capital belongs on core/city (CLAUDE.md), which has no terraced (Masuleh) mode yet: the Coyote kit's plan leaves that rule at a city's
// size to the city session (its section 4, amendment 2); KNOWN_ISSUES.md holds the question.
const SEAT_DIMS={cy_spring_hall:{w:16,d:26,h:8},cy_treasury:{w:9,d:9,h:7},cy_council:{w:12,d:22,h:7},cy_runner_shrine:{w:9,d:9,h:3.2},
 cy_rock_facade:{w:10,d:1.2,h:12},cy_milestone:{w:.8,d:.6,h:2.2}};
const SEAT=(function(){const S=STATION,A=S.at,LEN=S.LEN;
 const dims=k=>(typeof KratorCoyote!=='undefined'&&KratorCoyote.dims&&KratorCoyote.dims(k))||SEAT_DIMS[k];
 const R=[],add=o=>{const d=dims(o.key);R.push(Object.assign({pending:true,culture:'coyote',tribe:'tier',settlement:'tiers-coyote-canyon',w:d.w,d:d.d,h:d.h},o));};
 /* the axis' direction at s (its unit vector up-canyon) */
 /* a point pulled in toward the axis until it stands on the canyon's floor (a building of the seat stands on a tread, not up a wall) */
 const onFloor=(x,z,s)=>{const p=A(s);for(let k=0;k<60;k++){const a=S.partAt(x,z);if(a&&a.part==='floor'&&(a.e==null||a.e>12))return[x,z];const dx=p[0]-x,dz=p[1]-z,l=Math.hypot(dx,dz);if(l<3)return[x,z];x+=dx/l*3;z+=dz/l*3;}return[x,z];};
 const dirAt=s=>{const p=A(s-5),q=A(s+5),l=Math.hypot(q[0]-p[0],q[1]-p[1])||1;return[(q[0]-p[0])/l,(q[1]-p[1])/l];};
 // THE KING'S HOUSE over the spring at the head, its long axis up-canyon (a megaron: its porch toward the town), the stores beside it
 {const [ux,uz]=dirAt(LEN-70),ry=Math.atan2(ux,uz);
  add({id:'seat:spring-hall',key:'cy_spring_hall',name:'The spring hall (the king\'s house over the spring: a megaron, its pool hall under it)',role:'palace',x:S.SPRING.x,z:S.SPRING.z,ry});
  const p=A(LEN-200),tp=onFloor(p[0]-uz*45,p[1]+ux*45,LEN-200);add({id:'seat:treasury',key:'cy_treasury',name:'The treasury (a corbelled tholos store for the Gate\'s toll)',role:'store',x:tp[0],z:tp[1],ry});
  const q=A(LEN-330),cp=onFloor(q[0]+uz*55,q[1]-ux*55,LEN-330);add({id:'seat:council',key:'cy_council',name:'The council (a megaron)',role:'civic',x:cp[0],z:cp[1],ry});}
 // THE RUNNER BIRD'S SHRINE at the stair road's foot (the trickster's shrines stand at road feet)
 {const P=S.ROADS[0].pts[0],Q=S.ROADS[0].pts[1],l=Math.hypot(Q[0]-P[0],Q[1]-P[1]);
  add({id:'seat:runner-shrine',key:'cy_runner_shrine',name:'The runner bird\'s shrine (the trickster\'s, at the stair road\'s foot)',role:'religious',x:P[0]-(Q[1]-P[1])/l*14,z:P[1]+(Q[0]-P[0])/l*14,ry:Math.atan2(Q[0]-P[0],Q[1]-P[1])});}
 // THE ROCK-CUT FAÇADES (the Phrygian manner: a carved gable over a niche) on the walls' lowest risers, facing the floor: shrines and tombs
 [[.42,-1],[.58,1],[.72,-1],[.8,1]].forEach(([f,sd],i)=>{const s=LEN*f,p=A(s),[ux,uz]=dirAt(s),nx=-uz*sd,nz=ux*sd;let hit=null;
  for(let o=S.W*.6;o<S.W+160;o+=2){const x=p[0]+nx*o,z=p[1]+nz*o,a=S.partAt(x,z);if(a&&a.part==='riser'){hit=[x-nx*1.5,z-nz*1.5];break;}}
  if(hit)add({id:'seat:facade-'+i,key:'cy_rock_facade',name:'A rock-cut façade (a carved gable over a niche: a '+(i%2?'tomb':'shrine')+')',role:i%2?'funerary':'religious',x:hit[0],z:hit[1],ry:Math.atan2(-nx,-nz),onWall:true});});
 // THE MILESTONES along the stair road, every 500 m (contour-carved: the Hum; the carving is the Coyote kit's cyContour)
 {const P=S.ROADS[0].pts;let acc=0,k=0;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
   for(let s=acc>0?500-acc:250;s<L;s+=500){const x=a[0]+(b[0]-a[0])*s/L+(b[1]-a[1])/L*5,z=a[1]+(b[1]-a[1])*s/L-(b[0]-a[0])/L*5;
    add({id:'seat:milestone-'+(k++),key:'cy_milestone',name:'A Hum milestone (contour-carved: the distance to the spring hall)',role:'milestone',x,z,ry:Math.atan2(b[0]-a[0],b[1]-a[1])});}acc=(acc+L)%500;}}
 R.forEach(r=>{r.y=terrainH(r.x,r.z);});
 // ---------------------------------------------------------------- the drawing: stand-ins at the records' boxes, one merged mesh per surface
 const SURF={mud:{c:0x7a5a40,label:'Coyote mud brick, timber-laced (stand-in: kits/coyote)'},roof:{c:0x5e4632,label:'Flat roofs and parapets (stand-in)'},
  stone:{c:0x6a625a,label:'Cut stone (stand-in: kits/coyote)'},wood:{c:0x5a4230,label:'Posts and beams'}};
 const ACC={};for(const k in SURF)ACC[k]={pos:[],nor:[],idx:[]};
 const T=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),Vv=new THREE.Vector3(),Sv=new THREE.Vector3(),N3=new THREE.Matrix3();
 function put(surf,geo,x,y,z,ry,sx,sy,sz){const Ac=ACC[surf],p=geo.attributes.position,n=geo.attributes.normal,o=Ac.pos.length/3;
  T.compose(Vv.set(x,y,z),Q.setFromEuler(E.set(0,ry,0)),Sv.set(sx,sy,sz));N3.getNormalMatrix(T);const v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.set(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(T);Ac.pos.push(v.x,v.y,v.z);v.set(n.getX(i),n.getY(i),n.getZ(i)).applyMatrix3(N3).normalize();Ac.nor.push(v.x,v.y,v.z);}
  if(geo.index)for(let i=0;i<geo.index.count;i++)Ac.idx.push(o+geo.index.getX(i));else for(let i=0;i<p.count;i++)Ac.idx.push(o+i);}
 const BOX=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),CYL=new THREE.CylinderGeometry(.5,.5,1,10,1).translate(0,.5,0);
 const DOME=new THREE.SphereGeometry(.5,12,8,0,TAU,0,Math.PI/2),GABLE=new THREE.CylinderGeometry(.5,.5,1,3,1).rotateZ(Math.PI/2).rotateY(Math.PI/2).translate(0,.25,0);
 const foot=r=>{let m=terrainH(r.x,r.z);for(const [a,b] of [[.45,.45],[-.45,.45],[.45,-.45],[-.45,-.45]]){const c=Math.cos(r.ry||0),s=Math.sin(r.ry||0),dx=a*r.w,dz=b*r.d;m=Math.min(m,terrainH(r.x+dx*c+dz*s,r.z-dx*s+dz*c));}return m;};
 /* a point d metres along the record's own axis (its +z: the long axis, the porch end) */
 const along=(r,d)=>[r.x+Math.sin(r.ry)*d,r.z+Math.cos(r.ry)*d];
 function draw(r){const yb=foot(r)-.4,y0=Math.max(r.y,foot(r)),top=y0+r.h;
  switch(r.key){
   case 'cy_spring_hall':case 'cy_council':{   /* a megaron: the long hall, the porch between the wall-ends with two posts, a smoke hole's lantern */
    const hall=r.d*.78;const c=along(r,-r.d*.11);put('mud',BOX,c[0],yb,c[1],r.ry,r.w,top-yb,hall);put('roof',BOX,c[0],top,c[1],r.ry,r.w+.4,.4,hall+.4);
    const pc=along(r,r.d*.39);for(const sx of [-.42,.42]){const ex=pc[0]+Math.cos(r.ry)*sx*r.w,ez=pc[1]-Math.sin(r.ry)*sx*r.w;put('mud',BOX,ex,yb,ez,r.ry,r.w*.12,top-yb,r.d*.22);}
    for(const sx of [-.16,.16]){const px=pc[0]+Math.cos(r.ry)*sx*r.w,pz=pc[1]-Math.sin(r.ry)*sx*r.w;put('wood',CYL,px,yb,pz,0,.6,top-yb,.6);}
    put('roof',BOX,pc[0],top,pc[1],r.ry,r.w+.4,.4,r.d*.24);put('stone',BOX,c[0],top+.4,c[1],r.ry,r.w*.18,1.2,r.w*.18);break;}
   case 'cy_treasury':put('stone',CYL,r.x,yb,r.z,0,r.w,y0+r.h*.35-yb,r.d);put('stone',DOME,r.x,y0+r.h*.35,r.z,0,r.w,r.h*1.3,r.d);break;   /* a tholos: a drum and its corbelled dome */
   case 'cy_runner_shrine':put('stone',BOX,r.x,yb,r.z,r.ry,r.w,y0+.9-yb,r.d);put('stone',BOX,r.x,y0+.9,r.z,r.ry,.9,r.h,.5);put('wood',CYL,along(r,r.d*.35)[0],y0+.9,along(r,r.d*.35)[1],0,.12,2.6,.12);break;
   case 'cy_rock_facade':put('stone',BOX,r.x,yb,r.z,r.ry,r.w,r.h*.8,r.d);put('stone',GABLE,r.x,yb+r.h*.8,r.z,r.ry,r.w*1.05,r.h*.4,r.d);break;   /* the face on the riser, its gable */
   default:put('stone',BOX,r.x,yb,r.z,r.ry,r.w,top-yb,r.d);}}
 const MESHES=[],PP=[];   /* PP: one probe point a record, the middle of its box (a merged mesh's box centre is one sample: core/host's probe) */
 function build(){
  R.forEach(r=>{REGISTER({name:r.name,key:r.key,cls:'building',kind:'building',culture:'coyote',pending:true,id:r.id,x:r.x,z:r.z,y:foot(r)-.4,r:Math.max(1.2,Math.hypot(r.w,r.d)*.5),h:r.h+1.6,
    tags:{settlement:r.settlement,role:r.role,culture:'coyote',tribe:'tier',pending:true}});
   OBSTACLES.push({x:r.x,z:r.z,r:Math.hypot(r.w,r.d)*.5+2});draw(r);PP.push(r.x,Math.max(r.y,foot(r))+Math.min(r.h*.5,3),r.z);});
  for(const k in ACC){const Ac=ACC[k];if(!Ac.idx.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(Ac.pos,3));
   g.setAttribute('normal',new THREE.Float32BufferAttribute(Ac.nor,3));g.setIndex(Ac.idx);
   const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:SURF[k].c}));m.userData.host=true;m.userData.village=true;m.userData.inspectLabel=SURF[k].label;scene.add(m);MESHES.push(m);}
  if(MESHES.length)MESHES[0].userData.probePoints=new Float32Array(PP);
  return{records:R.length,keys:[...new Set(R.map(r=>r.key))].join(', ')};}
 return{records:R,build,meshes:MESHES};})();
// the 99 checks read a settlement's records as VILLAGE (registered and pending); station 2's are the seat's
const VILLAGE=SEAT;
