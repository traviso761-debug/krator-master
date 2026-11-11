// ================================================================= METROPOLIS — the hero kit: materials, the builder  [draw]
// The heroes' parts, in a few buckets, each one material and one merged mesh; everything that repeats (piers, mullions, jambs, fillers) is
// one instanced box. A hero is about eight draw calls whatever its size. Materials come from the library (materials.json) in world metres.
// MP.ROOM_GLSL is interior mapping: a room behind each window. The hero's glass and the shell's window mask run this same chunk, so
// they read alike at the switch.
MP.ROOM_GLSL=[
'vec3 mpRoom(vec3 P,vec3 rd,vec3 n,float seed){',
' const float S=3.6,W=5.4,D=7.0;',
' vec3 t=normalize(cross(vec3(0.0,1.0,0.0),n));float a=dot(P,t)+seed;',
' float ia=floor(a/W),fa=a/W-ia,iy=floor(P.y/S),fy=P.y/S-iy;',
' vec3 q=vec3(dot(rd,t),rd.y,-dot(rd,n));',
' float tx=(q.x>0.0?1.0-fa:fa)*W/max(abs(q.x),1e-3),ty=(q.y>0.0?1.0-fy:fy)*S/max(abs(q.y),1e-3),tz=D/max(q.z,1e-3),T=min(tx,min(ty,tz));',
' float h=fract(sin(ia*12.9898+iy*78.233)*43758.5453);',
' vec3 c=T==ty?(q.y>0.0?vec3(.20,.20,.19):vec3(.11,.10,.09)):(T==tz?mix(vec3(.10,.11,.12),vec3(.20,.19,.17),h):vec3(.15,.15,.15));',
' return c*exp(-T*.14)*(.45+.7*h);}'].join('\n');
MP.mats=(function(){let M=null;
 /* the geometry's uvs are in 4 m units; a family's library scale sets its repeat (the white skin's panels are 16 m) */
 const fam=(name,o)=>{const P=KMAT.mode==='lib'?KMAT.packed('metropolis',name):null,T=P?KMAT.textures(P,{aniso:8}):{};if(P&&P.scale)[T.map,T.normalMap,T.roughnessMap].forEach(t=>{if(t)t.repeat.set(4/P.scale[0],4/P.scale[1]);});
  return new THREE.MeshStandardMaterial(Object.assign({map:T.map||null,normalMap:T.normalMap||null,roughnessMap:T.roughnessMap||null,vertexColors:true,metalness:P?P.metal||0:0,roughness:1},o||{}));};
 return function(){if(M)return M;
  M={white:fam('white',{metalness:.12}),concrete:fam('concrete'),relief:fam('relief'),rubble:fam('rubble'),adobe:fam('adobe'),baroque:fam('baroque'),
   /* the Wedge's black curtain glass (no room behind it shows: the Ancients at their most closed) and the planted green of a deck or a forest */
   glassBlack:new THREE.MeshStandardMaterial({color:0x0a0e13,roughness:.07,metalness:.75,vertexColors:true}),green:new THREE.MeshStandardMaterial({color:0x5a7a42,roughness:.95,metalness:0,vertexColors:true}),
   /* a glass you see through (the Terrarium's dome over its forest): drawn after the solids, no depth written */
   glassClear:new THREE.MeshStandardMaterial({color:0x9fc3cf,roughness:.05,metalness:.2,transparent:true,opacity:.28,depthWrite:false,vertexColors:true,side:THREE.DoubleSide}),bronze:fam('bronze',{metalness:.35,color:0xd8b48a}),
   dark:new THREE.MeshStandardMaterial({color:0x17181a,roughness:1,metalness:0,vertexColors:true}),
   cyan:new THREE.MeshStandardMaterial({color:0x8fe9ee,emissive:0x35d8e0,emissiveIntensity:1.1,roughness:.4,metalness:0,vertexColors:true}),
   cyanDead:new THREE.MeshStandardMaterial({color:0x2a3336,roughness:.8,metalness:.1,vertexColors:true}),
   glass:MP.windowMat({color:0x0b1a22,roughness:.12,metalness:.3},1),glassOut:MP.windowMat({color:0x050505,roughness:1,metalness:0},0)};
  M.panel=fam('white',{metalness:.12});M.panel.vertexColors=false;M.slab=fam('concrete',{vertexColors:false});
  for(const k in M)M[k].name='mp.'+k;
  M.glass.userData.win=1;M.glassOut.userData.win=1;return M;};})();
// the window: a standard material whose emissive is the room behind the pane. The grey of the room is added, so a pane's colour and gloss stay the glass's
MP.windowMat=function(o,gl){const m=new THREE.MeshStandardMaterial(Object.assign({vertexColors:true},o));
 m.onBeforeCompile=function(sh){
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vMpW;varying vec3 vMpN;varying vec3 vMpC;').replace('#include <begin_vertex>','#include <begin_vertex>\nvMpW=(modelMatrix*vec4(position,1.0)).xyz;vMpN=normalize(mat3(modelMatrix)*normal);vMpC=-(transpose(mat3(viewMatrix))*viewMatrix[3].xyz);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vMpW;varying vec3 vMpN;varying vec3 vMpC;\n'+MP.ROOM_GLSL).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=mpRoom(vMpW,normalize(vMpW-vMpC),normalize(vMpN),0.0)*'+(gl?'0.55':'1.0')+';');};
 m.customProgramCacheKey=()=>'mpwin'+gl;return m;};

// ---- the builder: buckets of quads, one instanced panel box
// lite: the impostors' bake. A tower 128 px tall holds no mullion, and 128 renders of a full hero lost the GPU context (four heroes, 50 M triangles in one call): a third of the sides, only the big panels
MP.builder=function(lite){const B={b:{},panels:[]};
 const K=n=>B.b[n]||(B.b[n]={p:[],n:[],u:[],c:[],i:[]});
 // a strip of quads from a polyline in two dimensions swept round the axis: pts [[r, y], ...]; seg sides; col(th, y) -> [r, g, b]; skip(th, y); m metres a uv;
 // cx, cz the axis (0, 0); mod(th) a factor on the radius (a scallop, a polygon: 54's)
 B.lathe=function(name,pts,seg,o){o=o||{};if(lite)seg=Math.max(12,Math.ceil(seg/3));const q=K(name),U=o.uv==null?4:o.uv,th0=o.a0||0,th1=o.a1==null?Math.PI*2:o.a1,ox=o.cx==null?0:o.cx,oz=o.cz==null?0:o.cz,md=o.mod;
  for(let j=0;j+1<pts.length;j++){const a=pts[j],b=pts[j+1],dr=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dr,dy)||1,nr=dy/L*(o.flip?-1:1),ny=-dr/L*(o.flip?-1:1);
   for(let i=0;i<seg;i++){const t0=th0+(th1-th0)*i/seg,t1=th0+(th1-th0)*(i+1)/seg,tm=(t0+t1)/2,ym=(a[1]+b[1])/2;
    if(o.skip&&o.skip(tm,ym))continue;
    const v=q.p.length/3;
    [[t0,a],[t1,a],[t1,b],[t0,b]].forEach(function(e){const t=e[0],P=e[1],c=Math.cos(t),s=Math.sin(t),cl=o.col?o.col(t,P[1]):null;
     const kk=md?md(t):1;q.p.push(ox+P[0]*c*kk,P[1],oz+P[0]*s*kk);q.n.push(nr*c,ny,nr*s);q.u.push(t*Math.max(P[0],6)/U,P[1]/U);if(cl)q.c.push(cl[0],cl[1],cl[2]);else q.c.push(1,1,1);});
    q.i.push(v,v+3,v+1,v+1,v+3,v+2);}}};
 // a quad, corners in order, seen from the side of n
 B.quad=function(name,A,Bb,C,D,n,o){o=o||{};const q=K(name),U=o.uv==null?4:o.uv,cl=o.col||[1,1,1],v=q.p.length/3,w=Math.hypot(Bb[0]-A[0],Bb[1]-A[1],Bb[2]-A[2]),h=Math.hypot(D[0]-A[0],D[1]-A[1],D[2]-A[2]);
  [A,Bb,C,D].forEach(function(P,i){q.p.push(P[0],P[1],P[2]);q.n.push(n[0],n[1],n[2]);q.u.push((i===1||i===2?w:0)/U,(i>1?h:0)/U);q.c.push(cl[0],cl[1],cl[2]);});
  q.i.push(v,v+1,v+3,v+1,v+2,v+3);};
 B.box=function(name,x0,x1,y0,y1,z0,z1,o){const Q=(a,b,c,d,n)=>B.quad(name,a,b,c,d,n,o);
  Q([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1]);Q([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1]);
  Q([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0]);Q([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0]);
  Q([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0]);};
 // a closed box turned by yaw (its +z to the outward, as a panel's), all six faces: a door frame is seen from in and out and from under
 B.obox=function(name,cx,cy,cz,yaw,w,h,d,o){const c=Math.cos(yaw),s=Math.sin(yaw),T=(x,y,z)=>[cx+x*c+z*s,cy+y,cz-x*s+z*c],N=(x,y,z)=>[x*c+z*s,y,-x*s+z*c],a=w/2,b=h/2,e=d/2,Q=(p,q,r,t,n)=>B.quad(name,T(...p),T(...q),T(...r),T(...t),N(...n),o);
  Q([-a,-b,e],[a,-b,e],[a,b,e],[-a,b,e],[0,0,1]);Q([a,-b,-e],[-a,-b,-e],[-a,b,-e],[a,b,-e],[0,0,-1]);Q([a,-b,e],[a,-b,-e],[a,b,-e],[a,b,e],[1,0,0]);Q([-a,-b,-e],[-a,-b,e],[-a,b,e],[-a,b,-e],[-1,0,0]);
  Q([-a,b,e],[a,b,e],[a,b,-e],[-a,b,-e],[0,1,0]);Q([-a,-b,-e],[a,-b,-e],[a,-b,e],[-a,-b,e],[0,-1,0]);};
 // one instanced box: centre, yaw (its +z turned to the outward), width, height, depth, colour
 B.panel=function(x,y,z,yaw,w,h,d,c){if(lite&&w<.8)return;B.panels.push(x,y,z,yaw,w,h,d,c[0],c[1],c[2]);};
 B.finish=function(F,state){const G=new THREE.Group(),M=MP.mats();G.name=F.id+'.'+state;let tris=0,calls=0;
  for(const name in B.b){const q=B.b[name];if(!q.i.length)continue;const g=new THREE.BufferGeometry();
   g.setAttribute('position',new THREE.Float32BufferAttribute(q.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(q.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(q.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(q.c,3));
   g.setIndex(q.p.length/3>65535?new THREE.Uint32BufferAttribute(q.i,1):new THREE.Uint16BufferAttribute(q.i,1));const m=new THREE.Mesh(g,M[name]);m.name=G.name+'.'+name;G.add(m);tris+=q.i.length/3;calls++;}
  const n=B.panels.length/10;if(n){const g=MP.panelGeo();
   const im=new THREE.InstancedMesh(g,M.panel,n),m4=new THREE.Matrix4(),q4=new THREE.Quaternion(),e=new THREE.Euler(),c=new THREE.Color();im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(n*3),3);
   for(let i=0;i<n;i++){const o=i*10,p=B.panels;e.set(0,p[o+3],0);q4.setFromEuler(e);m4.compose(new THREE.Vector3(p[o],p[o+1],p[o+2]),q4,new THREE.Vector3(p[o+4],p[o+5],p[o+6]));im.setMatrixAt(i,m4);im.setColorAt(i,c.setRGB(p[o+7],p[o+8],p[o+9]));}
   im.frustumCulled=false;im.name=G.name+'.panels';G.add(im);tris+=n*g.index.count/3;calls++;}
  G.userData={family:F.id,state:state,tris:tris,calls:calls,panels:n};return G;};
 return B;};

// an entrance's leaves: each opening {x, z, yaw, w, h} (its centre at the foot, +z to the outward) takes two glass leaves in bronze frames, which slide apart along the
// opening when a walker comes near (MP.doorTick). They are meshes of the hero's own, named 'a door leaf', so a placed clone moves its own
MP.doorLeaves=function(G,list){if(!list.length)return;const M=MP.mats(),glass=MP.doorGlass||(MP.doorGlass=new THREE.MeshStandardMaterial({color:0x1f3038,roughness:.06,metalness:.55,name:'mp.doorGlass'})),cache={};
 list.forEach(function(o){
  /* a ruin's doorway (o.dark): no leaves, a dark face 1.5 m in that closes the hollow building from afar, gone when the walker comes near (the lobby opens then) */
  if(o.dark){const c=Math.cos(o.yaw),s=Math.sin(o.yaw),m=new THREE.Mesh(MP.doorDarkGeo||(MP.doorDarkGeo=new THREE.BoxGeometry(1,1,.1)),M.dark);m.scale.set(o.w+.6,o.h+.4,1);m.position.set(o.x-s*1.5,(o.y==null?0:o.y)+(o.h+.4)/2,o.z-c*1.5);m.rotation.y=o.yaw;m.name='a door leaf';m.userData.door={ax:[0,0],w:o.w/2,dark:true};G.add(m);return;}
  const lw=o.w/2-.02,key=lw.toFixed(2)+'x'+o.h.toFixed(2);
  if(!cache[key]){const B=MP.builder(),f=.09;B.obox('bronze',-lw/2+f/2,o.h/2,0,0,f,o.h,.1,{uv:2});B.obox('bronze',lw/2-f/2,o.h/2,0,0,f,o.h,.1,{uv:2});B.obox('bronze',0,o.h-f/2,0,0,lw,f,.1,{uv:2});B.obox('bronze',0,.08,0,0,lw,.16,.1,{uv:2});B.obox('bronze',0,1.05,.07,0,lw*.6,.05,.04,{uv:2});
   cache[key]={frame:B.finish({id:'door'},'leaf').children[0].geometry,glass:new THREE.BoxGeometry(lw-2*f,o.h-f-.16,.03).translate(0,(o.h-f+.16)/2,0)};}
  /* 0.27 m inside the screen's plane, behind its posts (0.3 deep), so an open leaf slides behind the jamb and the sidelight, not through them */
  const c=Math.cos(o.yaw),s=Math.sin(o.yaw),ax=[c,-s],ix=-s*.27,iz=-c*.27;
  [-1,1].forEach(function(side){const px=o.x+ix+ax[0]*side*o.w/4,pz=o.z+iz+ax[1]*side*o.w/4;[[cache[key].frame,M.bronze],[cache[key].glass,glass]].forEach(function(gm){const m=new THREE.Mesh(gm[0],gm[1]);m.position.set(px,o.y==null?0:o.y,pz);m.rotation.y=o.yaw;m.name='a door leaf';m.userData.door={ax:[ax[0]*side,ax[1]*side],w:o.w/2};G.add(m);});});});};
// the panel: a unit box of its front (+z), two sides and top: 8 triangles, a pier in a recess shows no more
MP.panelGeo=function(){const P=[],Nn=[],U=[],I=[],face=(a,b,c,d,n)=>{const v=P.length/3;[a,b,c,d].forEach((q,i)=>{P.push(q[0]-.5,q[1]-.5,q[2]-.5);Nn.push(n[0],n[1],n[2]);U.push(i===1||i===2?.5:0,i>1?.5:0);});I.push(v,v+1,v+3,v+1,v+2,v+3);};
 face([0,0,1],[1,0,1],[1,1,1],[0,1,1],[0,0,1]);face([1,0,1],[1,0,0],[1,1,0],[1,1,1],[1,0,0]);face([0,0,0],[0,0,1],[0,1,1],[0,1,0],[-1,0,0]);face([0,1,1],[1,1,1],[1,1,0],[0,1,0],[0,1,0]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);return g;};
// the streak and stain of a ruin: pale at the head of a bay, dark running down from each ledge. vnoise of (theta, y)
MP.stain=function(seed,k){return function(a,b){const n=KRAND.vnoise(a,b*.03,0,seed),m=KRAND.vnoise(a*.25,b*.012,5,seed),v=1-k*(.18+.55*Math.max(0,n-.42)+.3*Math.max(0,m-.5));return [v*.98,v*.95,v*.9];};};
