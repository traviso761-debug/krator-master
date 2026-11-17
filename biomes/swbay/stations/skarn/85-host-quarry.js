// ================================================================= HOST — the quarry's works: the mole, the outer breakwater, the visor's lip, the cut blocks
// (station 3, the skarn-marble cliffs) Built before the biome (88-host-build.js), so their footprints are in OBSTACLES and every piece is
// registered (core/tags, through REGISTER) before it is drawn.
//   THE MOLE and THE OUTER BREAKWATER (45's MASONRY: the sections terrainH stands on): courses of marble ashlar, 1.1-1.5 m high and
//   2-3.6 m long, stepped back tier by tier; the lowest course on the sea floor; a dark weed band where the tide washes them
//   THE VISOR (the plan's "wave-notched carbonate-shelf visor"): the shelf's front, its top carried 0.7 m out over the water on a lip
//   1.2-1.6 m above the sea, the notch under it (45's shelfH keeps the notch's floor at 0.35 m); drawn in the ground's own material, so
//   the carbonate-shelf's beds run through it
//   THE CUT BLOCKS: the quarry's last blocks on the harbour bench and on the treads of its stepped face, where they were split off
const QUARRY={blocks:[],masonryBlocks:0,lip:null,groups:[]};
function masonMat(vc){const m=new THREE.MeshStandardMaterial({vertexColors:vc,roughness:.6,metalness:0});
 m.onBeforeCompile=sh=>{KCOLOR.include(sh);sh.uniforms.uRG={value:GRAIN.map};sh.uniforms.uRGs={value:GRAIN.s*1.6};sh.uniforms.uRGm={value:GRAIN.mean};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vMP;varying vec3 vMN;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvMP=(modelMatrix*vec4(transformed,1.0)).xyz;vMN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uRG;uniform float uRGs;uniform float uRGm;varying vec3 vMP;varying vec3 vMN;')
   .replace('#include <color_fragment>',['#include <color_fragment>',
    '{vec3 gn=abs(vMN);gn/=gn.x+gn.y+gn.z;vec3 rt=sampleSRGB(uRG,vMP.zy*uRGs).rgb*gn.x+sampleSRGB(uRG,vMP.xz*uRGs).rgb*gn.y+sampleSRGB(uRG,vMP.xy*uRGs).rgb*gn.z;',
    ' diffuseColor.rgb*=mix(1.0,clamp(dot(rt,vec3(0.333))/uRGm,0.5,1.6),0.55);}'].join('\n'));};
 m.customProgramCacheKey=()=>'swbay-skarn-mason'+(vc?'-vc':'');return m;}
const MASON_MAT=masonMat(true),BLOCK_MAT=masonMat(false);   /* the blocks' colour is their instance colour (no vertex colours on the box) */
// a block: centre (x, y0..y1, z), its length along u [ux, uz] and its width across; a few cm in from its neighbours (the joints)
function QBox(P,C,x,z,y0,y1,u,len,wid,col){const ux=u[0],uz=u[1],vx=-uz,vz=ux,hl=len/2-.04,hw=wid/2-.04;
 const cr=[[-hl,-hw],[hl,-hw],[hl,hw],[-hl,hw]].map(q=>[x+ux*q[0]+vx*q[1],z+uz*q[0]+vz*q[1]]);
 const V=(k,y)=>[cr[k][0],y,cr[k][1]],quad=(a,b,c,d)=>{for(const p of [a,b,c,a,c,d]){P.push(p[0],p[1],p[2]);C.push(col[0],col[1],col[2]);}};
 const t=y1-.03,b0=y0;
 quad(V(0,t),V(3,t),V(2,t),V(1,t));                         /* the top */
 for(let k=0;k<4;k++){const k2=(k+1)%4;quad(V(k,b0),V(k,t),V(k2,t),V(k2,b0));}}   /* the sides, wound outward */
// a marble's colour: white, the grey-blue vein, the rose; darker and greener in the wash of the tide
function marbleCol(seed,y){const u=KRAND.unit(KRAND.hash(seed,1)),v=KRAND.unit(KRAND.hash(seed,2));
 let c=u<.62?[.93,.92,.89]:u<.88?[.84,.87,.9]:[.92,.86,.83];const k=.9+.1*v;c=c.map(q=>q*k);
 const w=smooth(1.8,.3,y);return [mix(c[0],.32,w),mix(c[1],.36,w),mix(c[2],.3,w)];}
function buildMasonry(){const P=[],C=[];let n=0;
 MASONRY.forEach((M,mi)=>{const u=M.u,v=[-u[1],u[0]],T=M.tiers;
  for(let ti=0;ti<T.length;ti++){const c0=ti?T[ti-1][0]:0,c1=T[ti][0],top=T[ti][1],low=ti+1<T.length?T[ti+1][1]:null;
   const across=ti?1:Math.max(1,Math.round(c1/3));   /* the crest: blocks of ~3 m across each half */
   const band=(c1-c0)/across;
   // the courses: from the next tier's top (or the sea floor) to this one's, 1.1-1.5 m each
   const course=(y0,y1,k)=>{const nC=Math.max(1,Math.round((y1-y0)/1.3)),out=[];for(let q=0;q<nC;q++)out.push([y0+(y1-y0)*q/nC,y0+(y1-y0)*(q+1)/nC]);return out;};
   const bed=low==null?-6:low;   /* the lowest course stands 6 m down, into the sea floor */
   for(const side of [-1,1])for(let ac=0;ac<across;ac++){const cm=c0+band*(ac+.5);
    // along the straight run, blocks of 2-3.6 m, each course's joints staggered from the one under it
    course(bed,top).forEach((cy,q)=>{let t=0,row=0,first=(q%2)?.9+.8*KRAND.unit(KRAND.hash(WORLD,89+mi,ti,q)):0;
     while(t<M.L-.1){const sd=KRAND.hash(WORLD,90+mi,ti*8+ac*2+(side>0?1:0),row*16+q),len=Math.min(M.L-t,first||2+1.6*KRAND.unit(sd));first=0;
      const tm=t+len/2,x=M.a[0]+u[0]*tm+v[0]*side*cm,z=M.a[1]+u[1]*tm+v[1]*side*cm;
      QBox(P,C,x,z,cy[0],cy[1],u,len,band,marbleCol(sd,cy[1]));n++;t+=len;row++;}});}
   // the rounded head: the band round the end in blocks of ~2.6 m of arc
   if(M.round){const rm=(c0+c1)/2,nA=Math.max(3,Math.round(Math.PI*rm/2.6));
    for(let k=0;k<nA;k++){const th=-Math.PI/2+Math.PI*(k+.5)/nA,dx=u[0]*Math.cos(th)+v[0]*Math.sin(th),dz=u[1]*Math.cos(th)+v[1]*Math.sin(th);
     const x=M.b[0]+dx*rm,z=M.b[1]+dz*rm,tg=[-dz,dx],len=Math.PI*rm/nA+.1,sd=KRAND.hash(WORLD,95+mi,ti,k);
     course(bed,top).forEach((cy,q)=>{QBox(P,C,x,z,cy[0],cy[1],tg,len,c1-c0,marbleCol(sd+q,cy[1]));n++;});}
    if(ti===0){const sd=KRAND.hash(WORLD,97+mi);QBox(P,C,M.b[0],M.b[1],T[1]?T[1][1]:top-1.2,top,u,c1*1.1,c1*1.1,marbleCol(sd,top));n++;}}}
  const xm=(M.a[0]+M.b[0])/2,zm=(M.a[1]+M.b[1])/2;
  REGISTER({name:M.name,key:'struct.mole',kind:'structure',x:xm,z:zm,y:-4,r:M.L/2+M.W,h:T[0][1]+5});
  OBSTACLES.push({x:xm,z:zm,r:M.L/2+M.W,y1:T[0][1]});});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();
 const me=new THREE.Mesh(g,MASON_MAT);me.userData.host=true;
 /* the probe's samples: along each one's crest (one merged mesh for both: its box's middle is in neither's registered volume) */
 me.userData.probePoints=MASONRY.flatMap(M=>[.15,.5,.85].flatMap(t=>[M.a[0]+(M.b[0]-M.a[0])*t,M.tiers[0][1]-.5,M.a[1]+(M.b[1]-M.a[1])*t]));   /* flat: x, y, z, x, y, z ... */me.userData.inspectLabel='Marble ashlar (the ancient quarry\'s mole and breakwater)';scene.add(me);
 QUARRY.masonryBlocks=n;QUARRY.masonryTris=P.length/9;}
// the visor's lip along the shelf's front (marble's share under .35, a -125..330, off the mole)
function buildVisor(){const pts=COAST.xz,P=[],U=[],G=[],idx=[],SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,rows=[];
 for(let i=1;i+1<pts.length;i++){const p=pts[i],a=aOf(p[0],p[1]);if(a<-125||a>330||marbleK(p[0],p[1])>.35)continue;
  const ex=pts[i+1][0]-pts[i-1][0],ez=pts[i+1][1]-pts[i-1][1],L=Math.hypot(ex,ez),nx=ez/L,nz=-ex/L;   /* n: inland */
  if(masonryAt(p[0]-nx*1.5,p[1]-nz*1.5))continue;
  const top=groundH(p[0]+nx*2.8,p[1]+nz*2.8)+.03,lip=1.5+.25*NZ(p[0],p[1],.08,61,2);
  rows.push([[p[0]+nx*2.8,top,p[1]+nz*2.8],[p[0]-nx*.7,top-.06,p[1]-nz*.7],[p[0]-nx*.7,lip,p[1]-nz*.7],[p[0]+nx*1.5,lip-.35,p[1]+nz*1.5]]);}
 rows.forEach((R,j)=>R.forEach(q=>{P.push(q[0],q[1],q[2]);U.push((q[0]-TERR.X0)/SX,1-(q[2]-TERR.Z0)/SZ);G.push(0,0,0,1);}));
 for(let j=0;j+1<rows.length;j++){const r0=rows[j],r1=rows[j+1];if(Math.hypot(r1[0][0]-r0[0][0],r1[0][2]-r0[0][2])>12)continue;
  for(let k=0;k<3;k++){const a=j*4+k,b=a+1,c=a+4,d=c+1;idx.push(a,b,c,b,d,c);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
 g.setAttribute('aGL',new THREE.Float32BufferAttribute(G,4));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.material.side=THREE.FrontSide;m.userData.host=true;m.userData.inspectLabel='The visor (the carbonate shelf\'s front, notched by the tide)';
 const mid=rows[rows.length>>1][1];REGISTER({name:'The tidal visor (carbonate-shelf)',key:'land.visor',kind:'landform',x:mid[0],z:mid[2],y:-.5,r:Math.min(260,rows.length*4),h:6});
 scene.add(m);QUARRY.lip={rows:rows.length,tris:idx.length/3,mesh:m};GROUND_MESHES.push(m);}
// the cut blocks: on the harbour bench and the stepped face's treads, in the quarry's stretch; each where the drawn ground is flat
// under its whole footprint (HL's slope at its corners), one InstancedMesh, registered by 40 m group
function quarryD0(a){const q=quarryK(a);return 1.8+22+12*ALONG(a,21,.006)+20*q;}
function buildBlocks(){const B=QUARRY.blocks,rand=KRAND.stream(KRAND.hash(WORLD,70,1)).next;
 const atAD=(a,d)=>{let lo=-300,hi=600;for(let i=0;i<36;i++){const b=(lo+hi)/2,p=xzOf(a,b);if(SDF(p[0],p[1])<d)lo=b;else hi=b;}return xzOf(a,(lo+hi)/2);};
 for(let k=0;k<520&&B.length<150;k++){const a=690+250*rand(),d0=quarryD0(a),onBench=rand()<.6,tread=1+Math.floor(rand()*10);
  const d=onBench?3+rand()*(d0-7):d0+tread*QSTEP.tread+.9+rand()*2.6,p=atAD(a,d),x=p[0],z=p[1],h=HL.h(x,z);
  const L=1.3+rand()*2,W=1+rand()*.8,H=.9+rand()*.7,ry=rand()*Math.PI,ok=[[L,W],[-L,W],[L,-W],[-L,-W]].every(c=>{const cx=x+c[0]*.5*Math.cos(ry)-c[1]*.5*Math.sin(ry),cz=z+c[0]*.5*Math.sin(ry)+c[1]*.5*Math.cos(ry);
   return HL.slope(cx,cz)<.12&&Math.abs(HL.h(cx,cz)-h)<.25;});
  if(!ok||h<30||B.some(o=>Math.hypot(o.x-x,o.z-z)<(o.L+L)*.6))continue;
  B.push({x,z,y:h,L,W,H,ry,seed:KRAND.hash(WORLD,71,k),a});}
 const geo=new THREE.BoxGeometry(1,1,1);geo.translate(0,.5,0);
 const im=new THREE.InstancedMesh(geo,BLOCK_MAT,Math.max(1,B.length)),M=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3(),pv=new THREE.Vector3(),col=new Float32Array(Math.max(1,B.length)*3);
 // the groups (40 m of coast each) registered first, then drawn
 const groups={};B.forEach(o=>{const gk=Math.floor((o.a-690)/40);(groups[gk]=groups[gk]||[]).push(o);});
 Object.keys(groups).forEach(gk=>{const L=groups[gk],cx=L.reduce((t,o)=>t+o.x,0)/L.length,cz=L.reduce((t,o)=>t+o.z,0)/L.length,r=Math.max(6,...L.map(o=>Math.hypot(o.x-cx,o.z-cz)+o.L));
  const y0=Math.min(...L.map(o=>o.y)),y1=Math.max(...L.map(o=>o.y+o.H));
  REGISTER({name:'Cut marble blocks (the quarry\'s last)',key:'struct.quarryblocks',kind:'structure',x:cx,z:cz,y:y0-1,r,h:y1-y0+3});QUARRY.groups.push({x:cx,z:cz,r,n:L.length});});
 B.forEach((o,i)=>{q.setFromAxisAngle(new THREE.Vector3(0,1,0),o.ry);s.set(o.L,o.H,o.W);pv.set(o.x,o.y-.08,o.z);M.compose(pv,q,s);im.setMatrixAt(i,M);
  const c=marbleCol(o.seed,9);col.set(c,i*3);OBSTACLES.push({x:o.x,z:o.z,r:o.L*.7,y1:o.y+o.H});});
 im.instanceColor=new THREE.InstancedBufferAttribute(col,3);im.count=B.length;im.userData.host=true;im.userData.inspectLabel='A cut marble block';scene.add(im);}
function buildQuarry(){buildMasonry();buildVisor();buildBlocks();return QUARRY;}
// THE TREES ON THE LEDGES (the plan: "draped on upper ledges by gate baobabs, umbrella monkey puzzles, and prism gums"): the kit's own
// trees where the host puts them (SWBAY.treeAt, between SWBAY.build and BIO.bake: 88): monkey puzzles on the quarry's upper treads (the
// abandoned workings, a tread's middle), prism gums and gate baobabs on the crown's lip over the headland. Each spot KRAND's, by (station,
// slot); a spot whose drawn ground is not flat under the bole is passed over
function ledgeTrees(){const out=[],rand=KRAND.stream(KRAND.hash(WORLD,80,2)).next;
 const atAD=(a,d)=>{let lo=-300,hi=900;for(let i=0;i<36;i++){const b=(lo+hi)/2,p=xzOf(a,b);if(SDF(p[0],p[1])<d)lo=b;else hi=b;}return xzOf(a,(lo+hi)/2);};
 const flat=(x,z,r)=>{const h=HL.h(x,z);for(let k=0;k<8;k++){const t=k/8*TAU,cx=x+Math.cos(t)*r,cz=z+Math.sin(t)*r;if(Math.abs(HL.h(cx,cz)-h)>.6||HL.slope(cx,cz)>.3)return false;}return true;};
 const put=(key,x,z,o)=>{if(!flat(x,z,o.r))return;if(SWBAY.blocked&&SWBAY.blocked(x,z,o.r))return;if(OBSTACLES.some(b=>Math.hypot(b.x-x,b.z-z)<b.r+o.r))return;
  const T=SWBAY.treeAt(key,x,HL.h(x,z),z,{seed:KRAND.hash(WORLD,81,out.length),scale:o.scale,wet:.5});if(T)out.push({key,x,z,y:T.y0,H:T.H});};
 for(let k=0;k<36&&out.length<12;k++){const a=720+190*rand(),q=quarryK(a);if(q<.95)continue;const tread=6+Math.floor(rand()*5),d=quarryD0(a)+tread*QSTEP.tread+QSTEP.tread*.34,p=atAD(a,d);put('puzzle',p[0],p[1],{r:1.4,scale:.75});}
 const nP=out.length;
 for(let k=0;k<40&&out.length<nP+12;k++){const a=700+420*rand(),d=quarryD0(a)+80+25*rand(),p=atAD(a,d),h=HL.h(p[0],p[1]);if(h<214||h>262)continue;
  put(rand()<.5?'prismgum':'baobab',p[0],p[1],{r:7,scale:.85});}
 return out;}
