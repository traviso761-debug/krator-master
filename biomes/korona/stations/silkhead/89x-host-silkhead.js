// ================================================================= HOST (station 7 only) — the lip, the veils, the silk spans, the winch, the dome's glass and steam
// After the water (89w: the pools' levels are set) and before the build (89z: the flora). Every thing placed is a core/tags record before
// it is drawn (BIO.record; REGISTER for the inspector's volumes where the thing is solid enough for the probe to find).
//   THE LIP        core/terrain KCARVE (36-core-carve.js): the alcove's hood meshed from its patch (45: LIP), on the walls' strata
//   THE VEILS      core/water WATER.fall + drawFall: four falls stacked down the Silkhead's north face, each fitted to land on the
//                  bench below (fit: true), the last into the trench lake; spray from core/atmos's particles at each foot
//   THE SPANS      core/biome KSPAN (45-core-span.js): catenaries between the drawn rims of the spur and the Silkhead across the
//                  gorge: two wild-silk basket spans, a braided liana ladder bridge, a liana ladder hung down the Silkhead's face to
//                  the col, and a silk-winch on the spur's tip lowering its line to the bench 560 m down
//   THE DOME       its walls and top darkened to the glass (the lateral obsidian-pancake stack, 45, shades its beds); the steam over
//                  its fissures and two ring-fault vents by the pools (core/atmos fx/89-atmos-fx-plumes.js)
//   THE HAZARDS    core/hazard records: the drop at the ledge's edge and under each span, the heat and gas at the vents
const SILK=(function(){const out={falls:[],spans:[],ladders:[],winch:null,lip:null,plumes:null,vents:[],hazards:0};
 const Q=new URLSearchParams(location.search),K=KSTACKS;
 const topBedOfTier=(B,t)=>{let r=null;B.beds.forEach(b=>{if(b.tier===t)r=b;});return r;};
 const bedAtY=(B,y)=>B.beds.find(b=>y>=b.y-.01&&y<=b.y+b.h+.01)||B.beds[B.beds.length-1];
 const hz=(o,kind,danger,shape)=>{BIO.record(Object.assign(o,{tags:{hazard:{kind,danger,shape}}}));out.hazards++;};

 // ---------------------------------------------------------------- THE LIP: the alcove's hood (KCARVE), on the walls' strata
 {const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95,metalness:0});
  const base=new THREE.Color(STAGE.rockCol.band[0]).convertSRGBToLinear();
  m.onBeforeCompile=sh=>{if(ROCK_STRATA)ROCK_STRATA.inject(sh);
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aOcc;varying float vOcc;').replace('#include <begin_vertex>','#include <begin_vertex>\nvOcc=aOcc;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vOcc;').replace('#include <map_fragment>',
    (ROCK_STRATA?'diffuseColor.rgb*=strataColor(vSWP,vSWN)':'diffuseColor.rgb*=vec3('+[base.r,base.g,base.b].map(v=>v.toFixed(4)).join(',')+')')+'*(0.3+0.7*vOcc);');};
  m.customProgramCacheKey=()=>'korona-silkhead-lip';
  REGISTER({name:LIP.Q.name,key:'carve.alcove',kind:'alcove',x:LIP.c[0],z:LIP.c[1],y:LIP.floorY,r:LIP.Q.hw+2,h:LIP.top-LIP.floorY});
  const M=KCARVE.mesh(m,{sun:SUN_POS,ao:true,gridNormals:true});
  M.forEach(me=>{me.userData.host=true;me.userData.rock=true;me.userData.inspectLabel=LIP.Q.name;scene.add(me);});out.lip={meshes:M.length,stats:LIP.Q.stats};_mark('lip');
  /* the drop at the ledge's edge, in front of the lip's mouth */
  hz({name:'The drop (the ledge\'s edge: 4,760 m to the trench floor)',key:'drop',x:LIP.c[0]+LIP.n[0]*24,z:LIP.c[1]+LIP.n[1]*24,y:0,r:16,h:LIP.floorY+2},'fall',1,{type:'cyl',r:16,h:LIP.floorY+2});}

 // ---------------------------------------------------------------- THE VEILS: four falls stacked down the Silkhead's north face
 // tier t's top edge at the veils' bearing (45: VEIL.a) is the lip; the foot is on the next tier's top (the bench), 24 m out from the
 // wall above it, or in the trench lake for the last; each curtain fitted to land there. Widths narrow downward (the water spreads to mist)
 {const a=VEIL.a,tiers=[3,2,1,0],W=[34,30,26,24],names=['The Silkhead veil (600 m free fall from the rim)','The second cascade (1,350 m)','The third cascade (1,400 m)','The last cascade (1,450 m, into the trench lake)'];
  tiers.forEach((t,i)=>{const b=topBedOfTier(TOWER,t);if(!b)return;const R=K.footR(b,a)*(1-b.ch),da=W[i]/2/R,y=b.y+b.h;
   const e0=[b.cx+Math.cos(a-da)*R,b.cz+Math.sin(a-da)*R],e1=[b.cx+Math.cos(a+da)*R,b.cz+Math.sin(a+da)*R],n=[Math.cos(a),Math.sin(a)];
   const mid=[(e0[0]+e1[0])/2,(e0[1]+e1[1])/2];let fy,fx,fz;
   if(t>0){const lb=topBedOfTier(TOWER,t-1),R2=K.footR(b,a);fx=b.cx+n[0]*(R2+24);fz=b.cz+n[1]*(R2+24);fy=terrainH(fx,fz);if(!(fy>lb.y+lb.h-6))fy=lb.y+lb.h;}
   else{fx=mid[0]+n[0]*90;fz=mid[1]+n[1]*90;fy=LAKE.y!=null?LAKE.y:terrainH(fx,fz);}
   const drop=y-fy;
   const F=WATER.fall({name:names[i],lip:[[e0[0],e0[1],y],[e1[0],e1[1],y]],dir:n,drop,foot:[fx,fz,fy],fit:true,spread:W[i]*.6});
   BIO.record({name:names[i],key:'fall',kind:'fall',x:mid[0],z:mid[1],y:fy,r:W[i],h:drop,tags:{water:{kind:'fall',drop:Math.round(drop)}}});
   const D=WATER.drawFall(F,{color:0xdfe9ec,opacity:.8,lipK:.9,footK:.55,rowStep:t===3?12:28,cols:10,plungeR:t>0?16:40,spray:t===0||t===2?'drop':true,renderOrder:3});
   D.mesh.userData.inspectLabel=names[i];out.falls.push({name:names[i],lip:[mid[0],mid[1],y],foot:[fx,fz,fy],drop,run:F.run,speed:F.speed});});}

 // ---------------------------------------------------------------- THE SPANS (KSPAN) across Silkhead Gorge
 // An anchor: the drawn rim of a body's top bed toward a side of the gorge at u (metres along the spur's axis), 1.2 m in on the rock; or a
 // point on a face at height y (a peg). The spur's anchors on its south face, the Silkhead's on its north face.
 const geo={silk:{pos:[],nrm:[],idx:[]},liana:{pos:[],nrm:[],idx:[]},timber:{pos:[],nrm:[],idx:[]},basket:{pos:[],nrm:[],idx:[]}};
 const sideAng=(B,b,u,south)=>{const s=south?400:-400,cx=S0[0]+u*AX[0]+s*PP[0],cz=S0[1]+u*AX[1]+s*PP[1];
  /* the side of the gorge: the spur's south face (toward +PP) or the Silkhead's north face (toward -PP), at the same point along the axis */
  if(B===TOWER){const tx=T0[0]+(u-T_U)*AX[0]-400*PP[0],tz=T0[1]+(u-T_U)*AX[1]-400*PP[1];return Math.atan2(tz-b.cz,tx-b.cx);}
  return Math.atan2(cz-b.cz,cx-b.cx);};
 const rimAnchor=(B,u,south,inset)=>{const b=B.beds[B.beds.length-1],a=sideAng(B,b,u,south),w=K.wall(B,b,a,1);inset=inset==null?1.2:inset;
  return [w.x-w.nx*inset,b.y+b.h+.3,w.z-w.nz*inset];};
 /* a point on the ledge under the cap (the t3 top), `out` m out from the cap's face */
 const ledgeAnchor=(B,u,south,out)=>{const b=B.beds[B.beds.length-1],a=sideAng(B,b,u,south),w=K.wall(B,b,a,0),x=w.x+w.nx*out,z=w.z+w.nz*out;return [x,terrainH(x,z)+.3,z];};
 const faceAnchor=(B,u,south,y,off)=>{const b=bedAtY(B,y),a=sideAng(B,b,u,south),w=K.wall(B,b,a,clamp((y-b.y)/b.h,0,1));off=off==null?.4:off;return [w.x+w.nx*off,y,w.z+w.nz*off];};
 // tubes and boxes merged by material (one mesh each: four draw calls for every span, ladder and winch)
 const V3=THREE.Vector3;
 const tube=(G,pts,r,sides)=>{sides=sides||5;const n=pts.length,b0=G.pos.length/3;let prevN=null;
  for(let i=0;i<n;i++){const p=new V3(...pts[i]),t=new V3(...pts[Math.min(n-1,i+1)]).sub(new V3(...pts[Math.max(0,i-1)])).normalize();
   let nn=prevN?prevN.clone().sub(t.clone().multiplyScalar(prevN.dot(t))).normalize():(Math.abs(t.y)<.9?new V3(0,1,0):new V3(1,0,0)).cross(t).normalize();prevN=nn;const bb=t.clone().cross(nn);
   for(let k=0;k<sides;k++){const f=k/sides*TAU,d=nn.clone().multiplyScalar(Math.cos(f)).add(bb.clone().multiplyScalar(Math.sin(f)));G.pos.push(p.x+d.x*r,p.y+d.y*r,p.z+d.z*r);G.nrm.push(d.x,d.y,d.z);}
   if(i>0)for(let k=0;k<sides;k++){const a0=b0+(i-1)*sides+k,a1=b0+(i-1)*sides+(k+1)%sides,c0=a0+sides,c1=a1+sides;G.idx.push(a0,c0,a1,a1,c0,c1);}}};
 const box=(G,c,ux,uy,uz,sx,sy,sz)=>{const b0=G.pos.length/3,U=[ux,uy,uz].map(v=>new V3(...v).normalize()),S=[sx/2,sy/2,sz/2];
  for(let f=0;f<6;f++){const ax=f>>1,sg=f&1?-1:1,N=U[ax].clone().multiplyScalar(sg),A=U[(ax+1)%3],B=U[(ax+2)%3];
   for(const [p,q] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const v=new V3(...c).add(N.clone().multiplyScalar(S[ax])).add(A.clone().multiplyScalar(p*S[(ax+1)%3])).add(B.clone().multiplyScalar(q*S[(ax+2)%3]));G.pos.push(v.x,v.y,v.z);G.nrm.push(N.x,N.y,N.z);}
   const k=b0+f*4;if(sg>0)G.idx.push(k,k+1,k+2,k,k+2,k+3);else G.idx.push(k,k+2,k+1,k,k+3,k+2);}};
 const lateral=(a,b,d)=>{const dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1;return[-dz/l*d,0,dx/l*d];};
 const shift=(p,o)=>[p[0]+o[0],p[1]+o[1],p[2]+o[2]];
 // A WILD-SILK BASKET SPAN: two silk cables half a width either side, sag `sag`, and a woven trough hung between them (a U, `deep` m)
 const basketSpan=(name,A,B,sag,halfW,deep,ka,kb)=>{const oL=lateral(A,B,halfW),oR=lateral(A,B,-halfW),L=KSPAN.solve(shift(A,oL),shift(B,oL),{sag}),Rr=KSPAN.solve(shift(A,oR),shift(B,oR),{sag});
  const N=72,PL=KSPAN.points(L,N),PR=KSPAN.points(Rr,N);
  BIO.record({name,key:'span.silk',kind:'span',x:(A[0]+B[0])/2,z:(A[2]+B[2])/2,y:Math.min(PL[N/2][1],PR[N/2][1])-deep,r:Math.hypot(B[0]-A[0],B[2]-A[2])/2,h:sag+deep+2,culture:'korona-tepui',
   tags:{hazard:{kind:'fall',danger:.85,shape:{type:'cyl',r:3,h:4}}}});
  tube(geo.silk,PL,.07,5);tube(geo.silk,PR,.07,5);
  /* the trough: 7 strands across the U, as one woven sheet (two-sided) */
  const G=geo.basket,b0=G.pos.length/3,M=7;
  for(let i=0;i<=N;i++){const l=PL[i],r=PR[i],mid=[(l[0]+r[0])/2,(l[1]+r[1])/2,(l[2]+r[2])/2];
   for(let k=0;k<M;k++){const f=k/(M-1)*Math.PI,c=Math.cos(f),s=Math.sin(f);G.pos.push(mid[0]+(l[0]-mid[0])*c,mid[1]+(l[1]-mid[1])*c-deep*s,mid[2]+(l[2]-mid[2])*c);G.nrm.push(0,1,0);}
   if(i>0)for(let k=0;k<M-1;k++){const a0=b0+(i-1)*M+k,a1=a0+1,c0=a0+M,c1=a1+M;G.idx.push(a0,c0,a1,a1,c0,c1);}
   if(i%6===0&&i>0&&i<N){tube(geo.silk,[l,[mid[0],mid[1]-deep,mid[2]]],.035,4);tube(geo.silk,[r,[mid[0],mid[1]-deep,mid[2]]],.035,4);}}
  out.spans.push({name,a:A,b:B,ka:ka||'top',kb:kb||'top',run:L.D,sag:L.sag,length:L.length,low:KSPAN.low(L).p});
  hz({name:name+' (the drop under it)',key:'drop',x:(A[0]+B[0])/2,z:(A[2]+B[2])/2,y:COL_Y,r:Math.hypot(B[0]-A[0],B[2]-A[2])/2,h:RIM_Y-COL_Y},'fall',.9,{type:'cyl',r:Math.hypot(B[0]-A[0],B[2]-A[2])/2,h:RIM_Y-COL_Y});};
 // A BRAIDED LIANA LADDER BRIDGE: two liana ropes, rungs every half metre (one InstancedMesh of rungs)
 const RUNGS=[];
 const ladderBridge=(name,A,B,sag,halfW)=>{const oL=lateral(A,B,halfW),oR=lateral(A,B,-halfW),L=KSPAN.solve(shift(A,oL),shift(B,oL),{sag}),Rr=KSPAN.solve(shift(A,oR),shift(B,oR),{sag});
  const N=Math.max(24,Math.round(L.D/.5)),PL=KSPAN.points(L,N),PR=KSPAN.points(Rr,N);
  BIO.record({name,key:'span.liana',kind:'span',x:(A[0]+B[0])/2,z:(A[2]+B[2])/2,y:PL[N>>1][1]-1,r:L.D/2,h:sag+2,culture:'korona-tepui',tags:{hazard:{kind:'fall',danger:.9,shape:{type:'cyl',r:2,h:3}}}});
  tube(geo.liana,PL.filter((p,i)=>i%4===0||i===N),.06,5);tube(geo.liana,PR.filter((p,i)=>i%4===0||i===N),.06,5);
  for(let i=1;i<N;i++)RUNGS.push([PL[i],PR[i],.045]);
  out.spans.push({name,a:A,b:B,ka:'top',kb:'top',run:L.D,sag:L.sag,length:L.length,low:KSPAN.low(L).p});};
 // A LIANA LADDER hung down a face: from the rim to the col, 2.2 m off the face at each bed (its ropes follow the beds' retreat)
 const hangLadder=(name,B,u,south,y0,y1)=>{const P=[],Q2=[];for(let y=y1;y>=y0;y-=10){const c=faceAnchor(B,u,south,Math.max(y0,y),2.2),side=lateral([c[0],0,c[2]],[B.x,0,B.z],.3);P.push(shift(c,side));Q2.push(shift(c,[-side[0],0,-side[2]]));}
  BIO.record({name,key:'ladder.liana',kind:'ladder',x:P[0][0],z:P[0][2],y:y0,r:3,h:y1-y0,culture:'korona-tepui',tags:{hazard:{kind:'fall',danger:.8,shape:{type:'cyl',r:3,h:y1-y0}}}});
  tube(geo.liana,P,.05,4);tube(geo.liana,Q2,.05,4);
  for(let i=0;i<P.length-1;i++)for(let s=0;s<25;s++){const t=s/25,a=P[i].map((v,k)=>v+(P[i+1][k]-v)*t),b=Q2[i].map((v,k)=>v+(Q2[i+1][k]-v)*t);RUNGS.push([a,b,.035]);}
  out.ladders.push({name,top:P[0],foot:P[P.length-1],rungs:(P.length-1)*25});};
 basketSpan('A wild-silk basket span (Silkhead Gorge, 180 m: the Hum\'s trade road over the cleft)',rimAnchor(SPUR,880,true),rimAnchor(TOWER,880,false),16,.9,.95);
 basketSpan('A wild-silk basket span (the low road: from the ledge to a peg on the Silkhead\'s face)',ledgeAnchor(SPUR,1010,true,8),faceAnchor(TOWER,1010,false,LEDGE_Y-14,.2),12,.7,.8,'ledge','face');
 ladderBridge('A braided liana ladder bridge (the cliff clans\' crossing)',rimAnchor(SPUR,760,true),rimAnchor(TOWER,760,false),20,.32);
 hangLadder('A liana ladder (down the Silkhead\'s face to the col, 600 m)',TOWER,720,false,COL_Y+.5,RIM_Y-.3);
 // THE SILK-WINCH on the spur's tip: a timber frame on the ledge, its jib out over the edge, the line down to the bench 560 m below
 {const b=topBedOfTier(SPUR,3),u=1500,a=Math.atan2(S0[1]+u*AX[1]-b.cz,S0[0]+u*AX[0]-b.cx),w=K.wall(SPUR,b,a,1),y=b.y+b.h,n=[w.nx,0,w.nz],up=[0,1,0],sd=[-w.nz,0,w.nx];
  const at=d=>[w.x-w.nx*d,y,w.z-w.nz*d],base=at(4),tip=[w.x+w.nx*3.2,y+5.6,w.z+w.nz*3.2];
  REGISTER({name:'A silk-winch station (the Hum\'s hoist: reagents, lichen dyes and obsidian blades come up from the trench)',key:'winch',kind:'winch',x:base[0],z:base[2],y,r:4.5,h:7,culture:'korona-tepui'});
  [[-1.4],[1.4]].forEach(([s])=>{const f=shift(base,sd.map(v=>v*s));box(geo.timber,shift(f,[0,2.6,0]),up,n,sd,5.2,.28,.28);});
  box(geo.timber,shift(base,[0,5.1,0]),sd,up,n,3.4,.3,.3);   /* the cross-beam */
  box(geo.timber,shift(base,[0,1.1,0]),sd,up,n,2.6,.9,.9);   /* the drum */
  {const j0=shift(base,[0,5.1,0]),d=[tip[0]-j0[0],tip[1]-j0[1],tip[2]-j0[2]],l=Math.hypot(...d);box(geo.timber,[(j0[0]+tip[0])/2,(j0[1]+tip[1])/2,(j0[2]+tip[2])/2],d,up,sd,l,.24,.24);}
  /* the line: straight down from the jib's sheave to the bench (the t2 top) under the spur's tip, a load half way */
  const fb=topBedOfTier(SPUR,2),foot=[tip[0],fb.y+fb.h,tip[2]],fy=terrainH(tip[0],tip[2]);
  tube(geo.silk,[tip,[tip[0],(tip[1]+Math.max(fy,foot[1]))/2,tip[2]],[tip[0],Math.max(fy,foot[1])+.4,tip[2]]],.05,4);
  box(geo.basket,[tip[0],(tip[1]+foot[1])/2+60,tip[2]],up,n,sd,1.4,1.1,1.1);
  out.winch={at:base,jib:tip,lineFoot:[tip[0],Math.max(fy,foot[1]),tip[2]],groundBelowJib:fy,ledge:y};
  hz({name:'The winch\'s edge (the jib over the drop)',key:'drop',x:tip[0],z:tip[2],y:fb.y+fb.h,r:6,h:y-fb.y-fb.h+6},'fall',1,{type:'cyl',r:6,h:y-fb.y-fb.h+6});}
 // the merged meshes
 const MATS={silk:new THREE.MeshStandardMaterial({color:0xe9e1c8,roughness:.75,metalness:0}),liana:new THREE.MeshStandardMaterial({color:0x5a5236,roughness:.9,metalness:0}),
  timber:new THREE.MeshStandardMaterial({color:0x6a4e34,roughness:.85,metalness:0}),basket:new THREE.MeshStandardMaterial({color:0xd8cca8,roughness:.85,metalness:0,side:THREE.DoubleSide})};
 const LABEL={silk:'Wild silk (the spans\' cables, the winch line)',liana:'Braided liana (the ladder bridge, the hung ladder)',timber:'The winch\'s timbers',basket:'A woven silk basket (the span\'s trough, the winch\'s load)'};
 Object.keys(geo).forEach(k=>{const G=geo[k];if(!G.idx.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(G.nrm,3));g.setIndex(G.idx);
  if(k==='basket')g.computeVertexNormals();g.computeBoundingSphere();const me=new THREE.Mesh(g,MATS[k]);me.userData.host=true;me.userData.inspectLabel=LABEL[k];me.userData.silk=true;scene.add(me);});
 if(RUNGS.length){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0x6e5a3a,roughness:.9}),RUNGS.length),M4=new THREE.Matrix4(),x=new V3(),y=new V3(),z=new V3();
  RUNGS.forEach(([a,b,r],i)=>{x.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const l=x.length();x.normalize();y.set(0,1,0);z.crossVectors(x,y).normalize();y.crossVectors(z,x);
   M4.makeBasis(x.clone().multiplyScalar(l),y.clone().multiplyScalar(r),z.clone().multiplyScalar(r));M4.setPosition((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);im.setMatrixAt(i,M4);});
  im.userData.host=true;im.userData.inspectLabel='Liana rungs (lashed with silk)';im.userData.silk=true;scene.add(im);out.rungs=RUNGS.length;}

 // ---------------------------------------------------------------- THE DOME: its glass, its steam
 // the lateral obsidian-pancake stack (45's strata) shades its beds; the wall and top meshes' vertex colours east of the lateral's line are
 // darkened here to the glass's (the shared rock material's base is the tepui's quartzite; the recipe's colours alone come out mid-grey)
 if(Q.get('glass')!=='0'){let n=0;scene.traverse(o=>{if(!(o.isMesh&&o.userData.rock&&o.geometry&&o.geometry.attributes.color))return;const P=o.geometry.attributes.position,C=o.geometry.attributes.color;
  for(let i=0;i<P.count;i++){const x=P.getX(i);if(x<STAGE.strata.lateral.at[0])continue;const k=.16+.1*smooth(DOME.H*.6,DOME.H,P.getY(i)-DOMEB.y0);C.setXYZ(i,C.getX(i)*k,C.getY(i)*k,C.getZ(i)*k*1.08);n++;}
  C.needsUpdate=true;});out.glass=n;}
 {const T=DOMEB.top,vents=[[0,0],[.32,.18],[-.28,.24],[.1,-.36]].map(([u,v],i)=>{const x=DOME.x+u*DOME.r,z=DOME.z+v*DOME.r;return{at:[x,terrainH(x,z)+.5,z],kind:i===0?'cooling':'vent',r:i===0?14:4,rise:i===0?260:90,life:i===0?90:30,id:'dome-vent-'+i};});
  /* two ring-fault vents at the dome's foot, between the pools */
  [[1.25,-.55],[-1.2,.35]].forEach(([u,v],i)=>{const x=DOME.x+u*DOME.r,z=DOME.z+v*DOME.r;vents.push({at:[x,terrainH(x,z)+.3,z],kind:'vent',r:3,rise:70,life:25,id:'ring-vent-'+i});});
  vents.forEach(v=>{hz({name:v.id.indexOf('ring')===0?'A ring-fault vent (steam, sulfur gas)':'A fissure on the dome (steam, sulfur gas)',key:'vent',x:v.at[0],z:v.at[2],y:v.at[1]-1,r:v.r*3,h:12},'heat',.8,{type:'cyl',r:v.r*3,h:12});
   hz({name:'Gas in the hollow round a vent',key:'gas',x:v.at[0],z:v.at[2],y:v.at[1]-2,r:v.r*6,h:4},'gas',.6,{type:'cyl',r:v.r*6,h:4});out.vents.push(v.at);});
  if(ATMOS.plumes){try{out.plumes=ATMOS.plumes(vents,{seed:7401,reach:9000});}catch(e){reportErr('plumes: '+e.stack);}}}
 return out;})();
window._silk=SILK;_mark('silkhead');
