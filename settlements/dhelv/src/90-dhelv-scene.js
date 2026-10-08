// ================================================================= DHELV: THE SCENE (P5). Renderer, the standard Krator sky, the ground, the
// city carved from the layout (41-dhelv-layout.js) and the kit's defs placed on it, the rock meshed near the camera only.
// The kit's camera, dev tools, furnishing, night and smoke (kits/zeijani/src 92-camera.js, 91f, 91n, 93) run on what this builds.
const TITLE='Dhelv';
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.autoClear=false;document.body.appendChild(renderer.domElement);
TEXANISO=Math.max(1,Math.min(8,renderer.capabilities.getMaxAnisotropy()||1));for(const k in ZJ_LIBTEX)for(const t of Object.values(ZJ_LIBTEX[k]))if(t)t.anisotropy=TEXANISO;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xd8c4a4,.0011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.15,9000);
const skyScene=new THREE.Scene(),skyCam=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,9000);
KratorSky.attach(skyScene,4200);
const SKY={hour:10.5,day:200,dens:1.6,night:false};
const qs=new URLSearchParams(location.search);if(qs.get('hour'))SKY.hour=+qs.get('hour');
const hemi=new THREE.HemisphereLight(0xffe6c8,0x7a5a3e,.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0dc,1.7);scene.add(sun);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);{const c=sun.shadow.camera;c.left=-80;c.right=80;c.top=80;c.bottom=-80;c.near=10;c.far=900;}sun.shadow.bias=-.0005;sun.shadow.normalBias=.3;
const LIGHTDIR=new THREE.Vector3(.4,.7,.3).normalize();
function skyApply(){KratorSky.update(new THREE.Vector3(),SKY.hour,SKY.day,SKY.dens);const L=KratorSky.lighting();
 LIGHTDIR.copy(L.sunDir.y>.02?L.sunDir:new THREE.Vector3(.3,.6,-.4).normalize());sun.color.copy(L.sunColor||new THREE.Color(1,.95,.86));
 sun.intensity=L.sunDir.y>.02?L.sunIntensity*1.05:.05;hemi.intensity=.28+L.ambient*.75;scene.fog.color.copy(L.fog);}
skyApply();

// ---------------------------------------------------------------- the ground: the layout's (the flows, the kipuka's hollow, the old cone)
terrainH=DH.groundY;   /* 10-core.js's flat sheet ground, replaced: place(), the cavern and the camera read this */
const DH_GROUND={x0:-1150,x1:1700,z0:-800,z1:1100,step:5,tile:50};
const groundMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,vertexColors:true});
{const L=KMAT.mode==='lib'?KMAT.packed('zeijani','basalt'):null;   /* the young flows' basalt (the kipuka's floor tinted soil; its forest floor covers it) */
 if(L){const T=KMAT.textures(L,{aniso:TEXANISO});const g=DH_GROUND;for(const t of [T.map,T.normalMap,T.roughnessMap])if(t)t.repeat.set((g.x1-g.x0)/L.scale[0],(g.z1-g.z0)/L.scale[1]);
  groundMat.map=T.map;groundMat.normalMap=T.normalMap;groundMat.roughnessMap=T.roughnessMap;matHook(groundMat,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}}
/* the cut-away and the holes, as the kit sheet's ground (its uniforms: 40-zj-cave.js fills the holes and masses) */
const ZJ_CUTSITES={value:[]};for(let i=0;i<32;i++)ZJ_CUTSITES.value.push(new THREE.Vector4(0,0,0,0));
const ZJ_MASSES={value:[]};for(let i=0;i<32;i++)ZJ_MASSES.value.push(new THREE.Vector4(0,0,0,0));
const ZJ_HOLES={value:[]};for(let i=0;i<32;i++)ZJ_HOLES.value.push(new THREE.Vector4(0,0,0,0));
matHook(groundMat,'cutGround',sh=>{sh.uniforms.uCut=ANIMU.uCut;sh.uniforms.uCam=ANIMU.uCam;sh.uniforms.uCutSites=ZJ_CUTSITES;sh.uniforms.uMasses=ZJ_MASSES;sh.uniforms.uHoles=ZJ_HOLES;
 sh.vertexShader='varying vec3 vGW;\n'+sh.vertexShader.replace('#include <project_vertex>','vGW=(modelMatrix*vec4(transformed,1.)).xyz;\n#include <project_vertex>');
 /* (review 3: the ground still repeats from afar) over the library's breakup: the map read again at 3.7 times the size, its
    brightness against the set's mean folded in, and a broad brightness and warmth drift over tens of metres */
 sh.fragmentShader='uniform float uCut;uniform vec3 uCam;uniform vec4 uCutSites[32];uniform vec4 uMasses[32];uniform vec4 uHoles[32];varying vec3 vGW;\n'+
  'float dgH(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float dgN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(dgH(i),dgH(i+vec2(1.,0.)),f.x),mix(dgH(i+vec2(0.,1.)),dgH(i+vec2(1.,1.)),f.x),f.y);}\n'+
  sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n#ifdef USE_MAP\n{vec3 t2=mapTexelToLinear(texture2D(map,vUv*0.27+vec2(0.31,0.67))).rgb;diffuseColor.rgb*=mix(1.0,clamp(dot(t2,vec3(0.333))/0.16,0.4,1.8),0.35);}\n#endif\n'+
   'diffuseColor.rgb*=(0.8+0.4*dgN(vGW.xz*0.019))*mix(vec3(1.05,0.99,0.93),vec3(0.94,1.0,1.06),dgN(vGW.zx*0.008+3.7));').replace('void main() {',
  'void main() {\nfor(int i=0;i<32;i++){vec4 q=uHoles[i];if(q.z<=0.)continue;if(distance(vGW.xz,q.xy)<q.z&&(q.w<=0.||vGW.y<q.w-10000.))discard;}\nif(uCut>.5){for(int i=0;i<32;i++){vec4 q=uCutSites[i];if(q.z<=0.)continue;vec2 d=vGW.xz-q.xy;if(abs(d.x)<q.z&&abs(d.y)<q.w&&dot(d,uCam.xz-q.xy)>0.)discard;}}');});
/* a heightfield of the layout's ground; its colour by what it is: the plain's young flow (dark basalt), the apron (old soil),
   the plateau's top (its forest's loam), its wall (dark rock). P5b lays the biomes on it */
/* Tiles of DH_GROUND.tile, each at its own step: g.step where a sheer step of the spur passes (or the outpost, an opening),
   twice that elsewhere on the spur's ground, five times out on the far flank (the whole at 5 m was 430k triangles, in every
   view). A skirt hangs 1.5 m under a tile's edge where it meets a coarser one, against the cracks; the normals come
   from the height itself (central differences), so a tile's edge does not show in the light */
function dhGroundMesh(){const g=DH_GROUND,T=g.tile,W=DH.PLAT.cliffX,pos=[],col=[],nor=[],uv=[],idx=[],H=DH.groundY;
 const cFlow=hc(0x4e4f55),cKip=hc(0x7a6c4c),cTop=hc(0x5a4a34),cWall=hc(0x5c5a58),c=new THREE.Color();
 const vert=(x,y,z)=>{pos.push(x,y,z);
  /* the plateau's top (its forest floor's loam), its wall, the apron (old soil), the plain (young basalt) */
  const K=DH.APRON,dk=Math.hypot(x-K.c[0],(z-K.c[1])*1.3)/K.r,d=DH.plateauD(x,z);
  const old=d>1.5,wall=!old&&d>-1.5;c.copy(old?cTop:wall?cWall:dk<1.02?cKip:cFlow);if(!old&&!wall&&dk>=1.02&&dk<1+K.edge)c.lerp(cKip,.4);col.push(c.r,c.g,c.b);
  const e=1.25,nx=H(x-e,z)-H(x+e,z),nz=H(x,z-e)-H(x,z+e),l=Math.hypot(nx,2*e,nz);nor.push(nx/l,2*e/l,nz/l);uv.push((x-g.x0)/(g.x1-g.x0),(z-g.z0)/(g.z1-g.z0));return pos.length/3-1;};
 const OPN=[[DH.HALL.c,DH.HALL.throat.r1],...DH.PITS.map(P=>[P.c,P.r+2]),...DH.NODES.filter(n=>n.exit).map(n=>[[n.x,n.z],8])];
 const fine=(x0,z0)=>{if(x0<W+T&&x0+T>W-140&&z0<300&&z0+T>-300)return true;   /* the outpost and its apron */
  if(OPN.some(([c,r])=>Math.abs(c[0]-(x0+T/2))<T/2+r+10&&Math.abs(c[1]-(z0+T/2))<T/2+r+10))return true;   /* the openings' rims meet the cavern's */
  for(let x=x0;x<=x0+T;x+=g.step)for(let z=z0;z<=z0+T;z+=g.step)if(Math.abs(DH.plateauD(x,z))<14)return true;return false;};
 const spur=(x0,z0)=>DH.plateauD(x0+T/2,z0+T/2)>-260;
 const NI=Math.round((g.x1-g.x0)/T),NJ=Math.round((g.z1-g.z0)/T),STEP=[];let n5=0;
 for(let I=0;I<NI;I++)for(let J=0;J<NJ;J++){const x0=g.x0+I*T,z0=g.z0+J*T;STEP[I*NJ+J]=fine(x0,z0)?g.step:spur(x0,z0)?g.step*2:g.step*5;}
 const stepAt=(I,J)=>I<0||J<0||I>=NI||J>=NJ?1e9:STEP[I*NJ+J];   /* past the edge: the far land (coarser), so the edge gets its skirt */
 for(let I=0;I<NI;I++)for(let J=0;J<NJ;J++){const x0=g.x0+I*T,z0=g.z0+J*T,st=stepAt(I,J);if(st===g.step)n5++;
  const xs=[];for(let x=x0;x<=x0+T+1e-6;x+=st){xs.push(x);if(Math.abs(x-W)<1e-6)xs.push(x+.05);}   /* a column 5 cm past the west face's line: it stands plumb, not a ramp */
  if(x0<W&&x0+T>W&&!xs.some(x=>Math.abs(x-W)<1e-6)){xs.push(W,W+.05);xs.sort((a,b)=>a-b);}
  const nz=Math.round(T/st),nx=xs.length-1,b0=pos.length/3;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=xs[i],z=z0+j*st;vert(x,H(x,z),z);}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=b0+j*(nx+1)+i,b=a+1,d=a+nx+1,e=d+1;idx.push(a,d,b,b,d,e);}
  /* the skirt: each edge's vertices again, 1.5 m down (the outward winding: both faces drawn by the strip's two triangles a quad) */
  const edge=(L,I2,J2)=>{const dr=stepAt(I2,J2)>1e8?40:1.5;   /* the drawn ground's outer edge hangs deep: the far land's squares are coarse */
   for(let k=0;k+1<L.length;k++){const p=L[k],q=L[k+1],P=[pos[p*3],pos[p*3+1],pos[p*3+2]],Q=[pos[q*3],pos[q*3+1],pos[q*3+2]];
   const a=vert(P[0],P[1]-dr,P[2]),b=vert(Q[0],Q[1]-dr,Q[2]);idx.push(p,a,q,q,a,b,p,q,a,q,b,a);}};
  const row=j=>xs.map((_,i)=>b0+j*(nx+1)+i),colm=i=>{const o=[];for(let j=0;j<=nz;j++)o.push(b0+j*(nx+1)+i);return o;};
  /* only where the neighbour is coarser (its straight edge misses this tile's middle vertices) */
  if(stepAt(I,J-1)>st)edge(row(0),I,J-1);if(stepAt(I,J+1)>st)edge(row(nz),I,J+1);if(stepAt(I-1,J)>st)edge(colm(0),I-1,J);if(stepAt(I+1,J)>st)edge(colm(nx),I+1,J);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);
 geo.userData.fineTiles=n5;return geo;}
const groundM=new THREE.Mesh(dhGroundMesh(),groundMat);groundM.receiveShadow=true;groundM.userData.isGround=true;scene.add(groundM);
/* the land past the drawn ground, to the horizon (a view from high on the slope saw the ground end in sky): squares of about
   100 m out to 5 km on the same land, its grid's lines on the drawn ground's edges, 0.3 m under them (the drawn ground's edge
   skirt covers the seam) */
function dhFarLand(){const g=DH_GROUND,S=100,E=5000,pos=[],col=[],uv=[],idx=[],c=hc(0x4e4f55);
 const lines=(a0,a1)=>{const L=[];for(let a=-E;a<a0-S*.5;a+=S)L.push(a);L.push(a0,a1);for(let a=Math.ceil((a1+S*.5)/S)*S;a<=E;a+=S)L.push(a);return L;};
 const xs=lines(g.x0,g.x1),zs=lines(g.z0,g.z1),NX=xs.length,id=new Int32Array(NX*zs.length).fill(-1);
 const v=(i,j)=>{const k=j*NX+i;if(id[k]>=0)return id[k];const x=xs[i],z=zs[j];pos.push(x,DH.groundY(x,z)-.3,z);col.push(c.r,c.g,c.b);uv.push((x-g.x0)/(g.x1-g.x0),(z-g.z0)/(g.z1-g.z0));return id[k]=pos.length/3-1;};
 for(let j=0;j+1<zs.length;j++)for(let i=0;i+1<NX;i++){const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2;if(x>g.x0&&x<g.x1&&z>g.z0&&z<g.z1)continue;const a=v(i,j),b=v(i+1,j),d=v(i,j+1),e=v(i+1,j+1);idx.push(a,d,b,b,d,e);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const m=new THREE.Mesh(geo,groundMat);m.receiveShadow=true;m.userData.isGround=true;m.name='far land';return m;}
const DH_FAR=dhFarLand();scene.add(DH_FAR);
/* THE SPUR'S WALLS (the owner: sheer, the light wells out of reach; review 3: "round off the upper edge a bit with some
   weathering"). The ground's 5 m grid cannot draw a sheer step (it leaves a slope a cell wide along it), so every step of the
   shelf is its own mesh in the cave's rock, the west face too: jointed basalt columns stand DH.LIP.out m out on the step's LOW
   side, from under its foot up to the foot of the lip, hiding the ground's slope from below; over them the weathered lip curves
   up and in onto the top (the layout's own shelfY, a hand above the ground's coarser copy of it). Where the slope climbs past the
   shelf (its back) the step dies away and the walls with it. Gaps: the outpost's carved fronts in the west face (their mouths
   open through the ground's plumb step there) and the scouts' exit at its foot. One winding for a whole run; drawn both sides */
function dhWalls(){const pos=[],idx=[],OUT=DH.LIP.out,RW=3,K=6,W=DH.PLAT.cliffX,west=[];
 /* a contour's points along a polyline: every 2.5 m, slid along the line's normal onto d = 0 (d positive inside) */
 const chainOf=(line,d,skip)=>{const out=[];for(let i=0;i+1<line.length;i++){const a=line[i],b=line[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/2.5),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
   let ox=uz,oz=-ux;const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;if(d(mx+ox*30,mz+oz*30)>d(mx-ox*30,mz-oz*30)){ox=-ox;oz=-oz;}   /* (ox, oz) points out of the shape */
   for(let k=0;k<n;k++){const x=a[0]+ux*L*k/n,z=a[1]+uz*L*k/n;let lo=-25,hi=25;for(let q=0;q<26;q++){const m=(lo+hi)/2;if(d(x-ox*m,z-oz*m)>0)hi=m;else lo=m;}   /* m inward: d grows with it */
    const t=(lo+hi)/2,px=x-ox*t,pz=z-oz*t;if(skip&&skip(px,pz)){out.push(null);continue;}out.push([px,pz,ox,oz]);}}return out;};
 const P=DH.PLAT.poly,shelf=[];for(let i=0;i<=P.length;i++)shelf.push(P[i%P.length]);
 const fronts=DH.SITES.filter(q=>q.district==='outpost'&&q.at==='wall');
 const skip=(x,z)=>(Math.abs(x-W)<3&&fronts.some(q=>Math.abs(z-q.z)<(DH.FOOT[q.key]?DH.FOOT[q.key][0]/2:6)+2))||DH.NODES.some(n=>n.exit==='foot'&&Math.hypot(x-n.x,z-n.z)<7)||Math.hypot(x-DH.DECOY.c[0],z-DH.DECOY.c[1])<DH.DECOY.r+2.5;   /* (and the decoy's mouth) */
 /* each run (broken where it is skipped or the step is under 4 m) is a strip: per column its rows up the face, then K rows of lip */
 let run=[];const flush=()=>{if(run.length>1)strip(run);run=[];};
 for(const c of chainOf(shelf,DH.plateauD,skip)){if(!c){flush();continue;}const yo=DH.groundY(c[0]+c[2]*(OUT+2),c[1]+c[3]*(OUT+2)),yi=DH.shelfY(c[0],c[1],0);
  if(yi-yo<4){flush();continue;}run.push([c[0],c[1],c[2],c[3],yo]);}flush();
 function strip(run){const base=pos.length/3,i0=idx.length,lowY=Math.min(...run.map(c=>c[4]))-5,rows=[];
  run.forEach((c,i)=>{const [x,z,ox,oz]=c,jc=.55*Math.sin((x+z)*.9)+.35*Math.sin(x*.31+1)+.2*Math.sin(z*2.3),T=DH.topY(x,z),R=DH.lipR(x,z)*Math.min(1,Math.max(0,(T-DH.flankY(x,z)-4)/20));
   const lip=d=>DH.shelfY(x,z,d)+.15,top=lip(-OUT),nr=Math.max(1,Math.ceil((top-lowY)/RW));
   for(let r=0;r<=nr;r++){const y=r===nr?top:lowY+r*RW,j=OUT+(r===nr?0:jc+.25*Math.sin(y*.9+i*.37));pos.push(x+ox*j,y,z+oz*j);}
   for(let k=1;k<=K;k++){const e=Math.max(R,1)*(1-Math.cos(k/K*PI/2)),d=e-OUT;pos.push(x-ox*d,lip(d),z-oz*d);}
   rows.push(nr+1);if(Math.abs(x-W)<1)west.push(z);});
  /* columns of different heights: each quad joins row r of one to row r of the next while both have it, the taller column's
     extra rows fanned to the other's top; then the lip's rows, column to column */
  let a0=base;for(let i=0;i+1<run.length;i++){const A0=a0,na=rows[i],nb=rows[i+1],B0=a0+na+K,n=Math.min(na,nb);
   for(let r=0;r<n-1;r++)idx.push(A0+r,A0+r+1,B0+r,B0+r,A0+r+1,B0+r+1);
   for(let r=n-1;r<na-1;r++)idx.push(A0+r,A0+r+1,B0+nb-1);
   for(let r=n-1;r<nb-1;r++)idx.push(B0+r,A0+na-1,B0+r+1);
   for(let k=0;k<K;k++){const a=A0+na-1+k,b=B0+nb-1+k;idx.push(a,a+1,b,b,a+1,b+1);}a0=B0;}
  /* the winding: the first face toward the low side (the rock shader reads the normals) */
  const q=i=>new THREE.Vector3(pos[idx[i0+i]*3],pos[idx[i0+i]*3+1],pos[idx[i0+i]*3+2]),f=q(1).sub(q(0)).cross(q(2).sub(q(0)));
  if(idx.length>i0&&f.x*run[0][2]+f.z*run[0][3]<0)for(let k=i0;k<idx.length;k+=3){const t=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=t;}}
 const geo=new THREE.BufferGeometry(),nv=pos.length/3;geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
 geo.setAttribute('aW',new THREE.Float32BufferAttribute(new Float32Array(nv*4),4));geo.setAttribute('aCut',new THREE.Float32BufferAttribute(new Float32Array(nv*4),4));
 const aM=new Float32Array(nv*3);for(let v=0;v<nv;v++)aM[v*3+2]=1;geo.setAttribute('aM',new THREE.BufferAttribute(aM,3));
 /* the cave's own rock shader, darker: it lifts its basalt for the dark under the rock, too bright for a sunlit wall */
 const mat=new THREE.MeshStandardMaterial({color:0x5e5c5a,roughness:.95,metalness:0,side:THREE.DoubleSide});mat.onBeforeCompile=cvRockMat.onBeforeCompile;mat.customProgramCacheKey=()=>'cliff|'+cvRockMat.customProgramCacheKey();
 const m=new THREE.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;m.userData.cliff=true;m.userData.tris=idx.length/3;
 /* the west face's columns stand on the apron's floor: their z, for walk blocks (dhSurfaceWalk) */
 west.sort((p,q)=>p-q);m.userData.westRuns=[];for(const z of west){const R=m.userData.westRuns,l=R[R.length-1];if(l&&z-l[1]<3.5)l[1]=z;else R.push([z,z]);}
 return m;}
const DH_CLIFF=dhWalls();scene.add(DH_CLIFF);

// ---------------------------------------------------------------- the sites: the layout's, each the kit's def
const SITES=DH.SITES.map(s=>({key:s.key,x:s.x,z:s.z,ry:s.ry,o:{v:s.v|0,y:s.y,walls:s.walls,liveStone:s.key==='zj_stonedoor',hill:!!s.hill},district:s.district,at:s.at}));
/* the outpost's mouths in the west face: each one's radius (the ground's hole, the cavern's opening) and its top over the floor */
const DH_MOUTH={tops:{},r:{zj_portal:6.8,zj_gallery_a:2.2,zj_gallery_b:2.2,zj_hut_c:1.6},top:{zj_portal:13.5,zj_gallery_a:4.6,zj_gallery_b:4.6,zj_hut_c:3.6}};
/* the west face where the columns leave it for the outpost's carved fronts: a dressed face of the cliff's rock 8 cm before the
   ground's plumb step (whose map streaks down a vertical face), up to the lip's foot, open at each mouth (the cavern's cliff
   round the opening fills it) */
function dhWestFace(){const W=DH.PLAT.cliffX,F=-.08,pos=[],idx=[],fl=DH.APRON.floor-1,ms=SITES.filter(s=>s.district==='outpost'&&s.at==='wall'&&DH_MOUTH.r[s.key]).map(s=>({z0:s.z-DH_MOUTH.r[s.key]-.5,z1:s.z+DH_MOUTH.r[s.key]+.5,y1:s.o.y+DH_MOUTH.top[s.key]}));
 const gaps=[],R=DH_CLIFF.userData.westRuns,zs=[-DH.PLAT.cliffZ];for(const r of R)zs.push(r[0]-1.2,r[1]+1.2);zs.push(DH.PLAT.cliffZ);
 for(let i=0;i+1<zs.length;i+=2)if(zs[i+1]-zs[i]>.5)gaps.push([zs[i],zs[i+1]]);
 for(const [g0,g1] of gaps){const cut=[g0,g1];for(const m of ms){if(m.z1>g0&&m.z0<g1)cut.push(Math.max(g0,m.z0),Math.min(g1,m.z1));}
  const Z=[...new Set(cut)].sort((a,b)=>a-b);for(let k=0;k+1<Z.length;k++){const a=Z[k],b=Z[k+1];if(b-a<.01)continue;const zc=(a+b)/2,m=ms.find(q=>zc>q.z0&&zc<q.z1);
   for(let z=a;z<b-1e-6;z+=2.5){const z2=Math.min(b,z+2.5),y0=m?m.y1:fl,ya=DH.shelfY(W,z,0)-.2,yb=DH.shelfY(W,z2,0)-.2,n=pos.length/3;if(Math.max(ya,yb)<=y0)continue;
    pos.push(W+F,y0,z,W+F,y0,z2,W+F,ya,z,W+F,yb,z2);idx.push(n,n+1,n+2,n+1,n+3,n+2);   /* facing west */}}}
 const geo=new THREE.BufferGeometry(),nv=pos.length/3;geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
 geo.setAttribute('aW',new THREE.Float32BufferAttribute(new Float32Array(nv*4),4));geo.setAttribute('aCut',new THREE.Float32BufferAttribute(new Float32Array(nv*4),4));
 const aM=new Float32Array(nv*3);for(let v=0;v<nv;v++)aM[v*3+2]=1;geo.setAttribute('aM',new THREE.BufferAttribute(aM,3));
 const m=new THREE.Mesh(geo,DH_CLIFF.material);m.receiveShadow=m.castShadow=true;m.userData.cliff=true;m.name='the west face';return m;}
const DH_WEST=dhWestFace();scene.add(DH_WEST);scene.add(dhDecoyFace(DH_CLIFF.material));   /* 86 */
const ONLY=qs.get('only');const ONLYSET=ONLY?new Set(ONLY.split(',')):null;   /* ?only=key,key places just those defs (the ways are carved still) */
const ROWS=[];

// ---------------------------------------------------------------- the ways: the layout's public ways carved in the rock
/* the hall, the satellites' pits, every tube, ramp, stair, the ledge and the scouts' ways; the square's lanes, the pits' floors and
   the kipuka's streets are floors already (the hall's, the shafts', the ground's). Ids are 'dh.*', owned by 'dhelv' */
function dhCarve(){const H=DH.HALL,C=CVC,B=DH.byId;
 C.hall({id:'dh.hall',owner:'dhelv',c:[H.c[0],H.y,H.c[1]],rx:H.rx,rz:H.rz,h:H.h,belly:H.belly,throat:{r0:H.throat.r0,r1:H.throat.r1,top:DH.groundY(H.c[0],H.c[1])+4},blend:6});
 C.opening({id:'dh.hall.well',c:H.c.slice(),r:H.throat.r1,rim:.5,kind:'well'});   /* a narrow rim: the page's ground meets the cavern's at its lip */
 /* the hall's foot: a wall plumb for 9 m round the square's edge (the dome alone curves in from the floor, and the carved fronts in
    it, their columns and their upper rooms, cut through it); the ledge runs on the shelf where the dome springs from its top */
 {const pts=[];for(let i=0;i<72;i++){const a=i/72*TAU;pts.push([H.c[0]+Math.cos(a)*H.rx,H.c[1]+Math.sin(a)*H.rz]);}
  C.room({id:'dh.hall.foot',owner:'dhelv',poly:pts,y:H.y,h:9,ceil:'flat',rise:0,r:0,rock:'basalt',finish:'raw'});}
 /* a bay before each carved front in the hall's or a well's wall: the wall curves, the front is flat, so a shallow cut (to 3.5 m
    out, up to the foot wall's 9 m) keeps the curve from burying the front's ends */
 for(const s of SITES){if(s.at!=='wall'||s.district==='outpost'||!DEFS[s.key]||!DEFS[s.key].originFront)continue;const hw=DEFS[s.key].w/2+.3,c=Math.cos(s.ry),sn=Math.sin(s.ry);
  const poly=[[-hw,.05],[hw,.05],[hw,3.5],[-hw,3.5]].map(([lx,lz])=>[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c]);
  C.room({id:'dh.bay.'+s.key+'.'+Math.round(s.x)+'.'+Math.round(s.z),owner:'dhelv',poly,y:s.o.y,h:Math.min(9,DEFS[s.key].h),ceil:'flat',rise:0,r:0,rock:'basalt',finish:'raw'});}
 /* a forecourt before each carved front a tunnel ends at (the cistern, the catacombs, the stores): a flat face for the front to
    stand on, the tunnel ending a metre short of it */
 for(const s of SITES){if(s.at!=='ground'||s.key==='zj_stonedoor'||!DEFS[s.key]||!DEFS[s.key].originFront)continue;const fw=Math.min(12,DEFS[s.key].w*.7)/2,c=Math.cos(s.ry),sn=Math.sin(s.ry);
  const poly=[[-fw,.05],[fw,.05],[fw,7],[-fw,7]].map(([lx,lz])=>[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c]);
  C.room({id:'dh.fore.'+s.key,owner:'dhelv',poly,y:s.o.y,h:6,ceil:'vault',rise:1,r:.6,rock:'basalt',finish:'hewn'});}
 for(const P of DH.PITS){const top=DH.groundY(P.c[0],P.c[1])+2;C.shaft({id:'dh.'+P.id+'.pit',owner:'dhelv',c:P.c.slice(),y0:P.floor,y1:top,r0:P.r,r1:P.r+2,floor:true,rock:'basalt',finish:'raw'});
  C.opening({id:'dh.'+P.id+'.well',c:P.c.slice(),r:P.r+2,rim:.5,kind:'well'});}
 const inPit=n=>DH.PITS.some(P=>Math.hypot(n.x-P.c[0],n.z-P.c[1])<P.r-.5);
 const stairTop=new Set(DH.EDGES.filter(e=>e.kind==='stair').map(e=>B[e.a].y>B[e.b].y?e.a:e.b));
 for(const e of DH.EDGES){const a=B[e.a],b=B[e.b];if(e.kind==='square'||e.kind==='street'||e.door==='stonedoor')continue;if(inPit(a)&&inPit(b))continue;   /* the stone door's own passage is the way through it */
  const id='dh.'+e.a+'-'+e.b;if(DH.plateauD(a.x,a.z)<0&&DH.plateauD(b.x,b.z)<0&&e.kind!=='tube')continue;   /* the apron's paths are on the ground */
  /* a stair up to a node other ways leave (the ledge's l1, l4) ends short of it on a level landing at the node's height, long
     enough that no way leaving near the stair's line lays its floor beside and over the stair (half a metre above it: a lip a
     walker coming down drops off; P6's edge check): the half widths over the sine of the angle between them, 4.5 to 12 m */
  if(e.kind==='stair'){const lo=a.y<b.y?a:b,hi=a.y<b.y?b:a,w=Math.max(1.2,e.w),L=Math.hypot(hi.x-lo.x,hi.z-lo.z),u=[(hi.x-lo.x)/L,(hi.z-lo.z)/L];
   let land=0;for(const q of DH.EDGES){if(q===e||(q.a!==hi.id&&q.b!==hi.id))continue;const o=B[q.a===hi.id?q.b:q.a],ol=Math.hypot(o.x-hi.x,o.z-hi.z)||1,c=-(u[0]*(o.x-hi.x)+u[1]*(o.z-hi.z))/ol,sn=Math.sqrt(Math.max(0,1-c*c));
    if(c>0)land=Math.max(land,Math.min(12,Math.max(4.5,(w/2+Math.max(.8,(q.w||2)-.8)/2)/Math.max(sn,.05)+.5)));}
   if(land>0&&land<L-3){const P=[hi.x-u[0]*land,hi.y,hi.z-u[1]*land];
    C.stair({id,owner:'dhelv',a:[lo.x,lo.y,lo.z],b:P,w,h:3.2,rock:'basalt',finish:'hewn'});
    C.tube({id:id+'.landing',owner:'dhelv',pts:[[P[0]-u[0]*.3,hi.y,P[2]-u[1]*.3],[hi.x+u[0]*.3,hi.y,hi.z+u[1]*.3]],w,h:3.4,blend:.5,rock:'basalt',finish:'hewn',walkW:w});
    DH_REAL[e.a+'-'+e.b]={pts:[P],kinds:e.a===lo.id?['stair','landing']:['landing','stair']};}   /* the nav walks the stair, then the landing */
   else C.stair({id,owner:'dhelv',a:[a.x,a.y,a.z],b:[b.x,b.y,b.z],w,h:3.2,rock:'basalt',finish:'hewn'});}
  else{const w=e.kind==='secret'?1.6:e.w,h=e.kind==='ledge'?3.4:e.kind==='secret'?2.4:Math.max(3,Math.min(10,w*.9+1.5));
   /* each way runs on past its ends into what it meets, so its floor overlaps the next one's (an exact abutment leaves a hairline
      a step lands in): 1.2 m into the hall or a pit (their floors stand 0.3 m in from their walls), else 0.3 m (a stair not at all:
      a walker keeps to the higher floor across an overlap). Where a stair comes up to a node, 0.3 m: run on 1.2 m, a way's floor
      roofs the stair's head at the node's height and a walker coming down drops off its end (P6's edge check) */
   const ext=id=>stairTop.has(id)?.3:dhOpens(id)?1.2:dhFace(id)?-1:.3,A=dhRun(b,a,ext(e.a)),Bp=dhRun(a,b,ext(e.b));
   C.tube({id,owner:'dhelv',pts:[A,Bp],w,h,blend:e.kind==='ledge'?.5:2,rock:'basalt',finish:e.kind==='door'?'hewn':'raw',walkW:Math.max(.8,w-.8)});}}
 /* the outpost's carved fronts open in the cliff, which is the page's ground: a hole in it at each mouth (the portal's tunnel,
    the galleries' and the lean-to's doorways), inside which the cavern meshes the cliff round the opening */
 for(const s of SITES){if(s.district!=='outpost'||s.at!=='wall')continue;const r=DH_MOUTH.r[s.key];if(!r)continue;
  const id='dh.mouth.'+s.key+'.'+Math.round(s.z);C.opening({id,c:[s.x,s.z],r,rim:.5,kind:'well'});DH_MOUTH.tops[id]=s.o.y+DH_MOUTH.top[s.key];}   /* (the same top as the page ground's hole: dhMouthHoles) */
 /* where the ways meet the open air: the portal's tunnel is the portal def's; the scouts' exits are holes in the flow */
 for(const n of DH.NODES)if(n.exit)C.opening({id:'dh.exit.'+n.id,c:[n.x,n.z],y:n.y-6,r:8,h:10,kind:'door'});
 dhCarveExtras(C);}   /* 86: the air shafts, the buried well */
const dhOpens=id=>/^h\.[wens]$|^s\d\.(in|up|e)$/.test(id);
const dhFace=id=>/^(cis|k\.head|t\.stores)$/.test(id);   /* a carved front's foot: its forecourt takes the tunnel's end */
function dhRun(p,q,ext){const dx=q.x-p.x,dy=q.y-p.y,dz=q.z-p.z,L=Math.hypot(dx,dz)||1;return [q.x+dx/L*ext,q.y+dy/L*ext,q.z+dz/L*ext];}
/* the apron's floor, for the walker (the rest of the surface is not walked) */
/* the stairs up the old cone's cliff to its two watchtowers (the layout's o.galN-o.tw1, o.galS-o.tw2): a straight flight from
   the gallery would run into the cliff, and the face beside each tower is taken (a gallery's front, a lean-to), so each is a
   built switchback of tuff ashlar against the cliff between the lean-to and the palisade: the lower flight on the outer lane
   from the clearing, a landing, the upper flight against the cliff to the cone's top, then a paved path to the tower's door.
   Drawn, put on the walk map, and handed to the nav as the way's real shape (DH_REAL: its points and kinds) */
const DH_REAL={};
function dhCliffStairs(){for(const e of DH.EDGES){const a=DH.byId[e.a],b=DH.byId[e.b];if(e.kind!=='stair'||DH.plateauD(a.x,a.z)>=0||DH.plateauD(b.x,b.z)<0)continue;   /* from the apron up the west face (none since the plateau: its face is 75 m) */
  const s=Math.sign(b.z)||1,zt=b.z,x0=DH.cliffX(zt),xi=x0-1.3,xo=x0-3.6,yb=DH.APRON.floor,yt=b.y,ym=(yb+yt)/2,zTop=zt-6.5*s,zLand=zt+11.5*s,n=Math.ceil((ym-yb)/.2),rise=(ym-yb)/n,run=Math.abs(zLand-zTop)/n,col=P('tuff');
  for(let k=0;k<n;k++){const zl=zTop+s*(k+.5)*run,zu=zLand-s*(k+.5)*run,tl=yb+(k+1)*rise,tu=ym+(k+1)*rise;
   box('ashlar',xo,yb,zl,2,tl-yb,run+.01,col);box('ashlar',xi,yb,zu,2,tu-yb,run+.01,col);
   if(k%3===0){box('ashlar',xo-1.12,tl,zl+s*run,.24,.9,run*3,col);box('ashlar',xi-1.12,tu,zu-s*run,.24,.9,run*3,col);}}   /* the parapets, over the drop */
  box('ashlar',(xo+xi)/2,yb,zLand+s*.3,4.6,ym-yb,1.4,col);box('ashlar',xo-1.12,ym,zLand+s*.88,.24,.9,.24,col);   /* the landing: past the flights' ends, lapping them 0.4 m */
  const R=REG.find(r=>!r.parent&&r.key==='zj_watchtower'&&Math.hypot(r.x-b.x,r.z-b.z)<4),F=R&&R.front&&R.front.world,D=F?[F.x+Math.sin(F.yaw),F.z+Math.cos(F.yaw)]:[b.x-3.2,b.z];
  const pv=P('tuffDark');box('paving',(xi+x0+1.2)/2,yt-.06,zTop,x0+1.2-xi+2,.08,2,pv);
  {const dx=D[0]-(x0+1.2),dz=D[1]-zTop,L=Math.hypot(dx,dz);box('paving',(x0+1.2+D[0])/2,yt-.06,(zTop+D[1])/2,1.6,.08,L+1.6,pv,Math.atan2(dx,dz));}
  KWALK.strip({a:[xo,zTop,yb],b:[xo,zLand,ym],w:2,name:'dh.'+e.a+'-'+e.b+'.lower',tag:'built:stair'});
  KWALK.floor({rect:[xo-1,xi+1,Math.min(zLand-.4*s,zLand+s),Math.max(zLand-.4*s,zLand+s)],y:ym,name:'dh.'+e.a+'-'+e.b+'.landing',tag:'built:stair'});
  KWALK.strip({a:[xi,zLand,ym],b:[xi,zTop,yt],w:2,name:'dh.'+e.a+'-'+e.b+'.upper',tag:'built:stair'});
  KWALK.strip({a:[xi-.6,zTop,yt],b:[x0+1.2,zTop,yt],w:1.2,name:'dh.'+e.a+'-'+e.b+'.top',tag:'built:path'});
  KWALK.strip({a:[x0+1.2,zTop,yt],b:[D[0],D[1],yt],w:1.6,name:'dh.'+e.a+'-'+e.b+'.path',tag:'built:path'});
  DH_REAL[e.a+'-'+e.b]={end:false,pts:[[xo,yb,zTop],[xo,ym,zLand],[xi,ym,zLand],[xi,yt,zTop],[x0+1.2,yt,zTop],[D[0],yt,D[1]]],kinds:['street','stair','landing','stair','path','path']};}}
function dhSurfaceWalk(){const K=DH.APRON,rx=K.r*.97,rz=rx/1.3,cx=DH.PLAT.cliffX-1.2,t0=Math.acos(Math.max(-1,Math.min(1,(cx-K.c[0])/rx))),pts=[];
 /* the apron's floor west of the cliff: its ellipse cut by a chord 1.2 m short of the face, where the ground's sheer step has
    not begun to rise (convex; the portal's tunnel starts 1.5 m in front of the face) */
 for(let i=0;i<=40;i++){const a=t0+(TAU-2*t0)*i/40;pts.push([K.c[0]+Math.cos(a)*rx,K.c[1]+Math.sin(a)*rz,K.floor]);}
 KWALK.poly({pts,name:'the apron\'s floor',tag:'ground'});
 /* the west face's columns stand on it: walk blocks along their runs */
 for(const [z0,z1] of DH_CLIFF.userData.westRuns)KWALK.block([DH.PLAT.cliffX-DH.LIP.out-1.6,DH.PLAT.cliffX-1.3,z0-1.6,z1+1.6,K.floor-1,K.floor+30],'cliff');   /* (on the apron only: the scouts' passage runs in the rock behind) */
 for(const e of DH.EDGES){const a=DH.byId[e.a],b=DH.byId[e.b];if(e.kind==='stair'&&DH.plateauD(a.x,a.z)<0&&DH.plateauD(b.x,b.z)<0&&!DH_REAL[e.a+'-'+e.b])KWALK.strip({a:[a.x,a.z,a.y],b:[b.x,b.z,b.y],w:e.w,name:'dh.'+e.a+'-'+e.b,tag:'built:stair'});}}

// ---------------------------------------------------------------- the rock, meshed near the camera only (PLAN.md 7: about 2M triangles in all)
const DH_STREAM={R:120,drop:170,budget:10,on:true,meshes:new Map(),keys:[],cen:null,pin:new Set(),near:[],tick:0,meshed:0,tris:0};
function dhStreamReset(){for(const m of DH_STREAM.meshes.values()){CV_GROUP.remove(m);m.geometry.dispose();}DH_STREAM.meshes.clear();DH_STREAM.tris=0;DH_STREAM.meshed=0;
 const s=CVC.chunk;DH_STREAM.keys=CVC.chunks.slice();DH_STREAM.cen=new Float32Array(DH_STREAM.keys.length*3);
 DH_STREAM.keys.forEach((k,i)=>{const q=k.split(',').map(Number);DH_STREAM.cen[i*3]=(q[0]+.5)*s;DH_STREAM.cen[i*3+1]=(q[1]+.5)*s;DH_STREAM.cen[i*3+2]=(q[2]+.5)*s;});DH_STREAM.tick=0;
 /* the chunks round the outpost's mouths: meshed now and never dropped */
 DH_STREAM.pin=new Set();const c=DH_STREAM.cen;DH_STREAM.keys.forEach((k,i)=>{if(DH_MOUTHS.some(M=>Math.hypot(c[i*3]-M.c[0],c[i*3+2]-M.c[1])<M.r+s*.75&&c[i*3+1]>M.y0-s*.5&&c[i*3+1]<M.y1+s*.5))DH_STREAM.pin.add(k);});
 DH_STREAM.keys.forEach((k,i)=>{if(!DH_STREAM.pin.has(k))return;const m=cvChunkMesh(k);DH_STREAM.meshes.set(k,m||{userData:{ci:i,tris:0},geometry:{dispose(){}}});if(m){m.userData.ci=i;CV_GROUP.add(m);DH_STREAM.tris+=m.userData.tris;}DH_STREAM.meshed++;});}
function dhStream(at,force){const S=DH_STREAM;if(!S.on||!S.cen)return 0;const p=at||camera.position;
 if(force||S.tick--<=0){S.tick=12;const c=S.cen,near=[];for(let i=0;i<S.keys.length;i++){const d=Math.hypot(c[i*3]-p.x,(c[i*3+1]-p.y)*1.5,c[i*3+2]-p.z);if(d<S.R&&!S.meshes.has(S.keys[i]))near.push([d,i]);}
  near.sort((a,b)=>a[0]-b[0]);S.near=near.map(n=>n[1]);
  for(const [k,m] of S.meshes){const i=m.userData.ci;if(!S.pin.has(k)&&Math.hypot(c[i*3]-p.x,(c[i*3+1]-p.y)*1.5,c[i*3+2]-p.z)>S.drop){CV_GROUP.remove(m);m.geometry.dispose();S.meshes.delete(k);S.tris-=m.userData.tris;}}}
 const t0=performance.now();let n=0;while(S.near.length&&(force||performance.now()-t0<S.budget)){const i=S.near.shift(),k=S.keys[i];if(S.meshes.has(k))continue;
  const m=cvChunkMesh(k);S.meshes.set(k,m||{userData:{ci:i,tris:0},geometry:{dispose(){}}});if(m){m.userData.ci=i;CV_GROUP.add(m);S.tris+=m.userData.tris;}n++;S.meshed++;}
 return n;}
FRAME_HOOKS.push(()=>dhStream());

// ---------------------------------------------------------------- what is seen (PLAN.md P5: the switch that draws only what is seen)
/* The buildings are drawn in cells (160 m, carved and surface apart), not one bucket a material for the whole map: the city and
   the outpost are 2.5 km apart, and under the rock the fog closes at about 400 m. A carved cell (its site 3 m or more under the
   ground) is drawn within DH_CELLS.under of the camera, wherever the camera is (from the surface it shows down the openings); a
   surface cell is drawn everywhere above ground, but underground only within DH_CELLS.mouth (seen out of the portal or a well).
   The furniture (most of the page's triangles, and of the draws: a group a material) goes by its site: a carved site's interior
   is behind the rock, so it is drawn only with the camera inside its box or before its front (DH_CELLS.front out, at its
   floor's height), or within DH_CELLS.near of a sunk site (open above), or in the cut-away; a built site's within DH_CELLS.built
   (its walls hide it farther off). Furniture outside every site's box goes by cell. The plants (the biome core's baked meshes,
   each one for the whole map) are cut into cells of DH_CELLS.BIO (an instanced mesh by its instances, a merged one by its
   triangles) and drawn within DH_CELLS.far (the surface's fog), underground only within DH_CELLS.mouth. Frustum culling does
   the rest. ?seeall draws everything */
const DH_CELLS={list:[],SIZE:160,BIO:400,under:420,mouth:220,near:45,front:32,built:[90,150],far:1150,treeNear:420,on:!new URLSearchParams(location.search).has('seeall'),t:0,shown:0,tris:0};
function dhCellKey(S){const u=S.o.y<DH.groundY(S.x,S.z)-3;return (u?'u':'s')+Math.floor(S.x/DH_CELLS.SIZE)+','+Math.floor(S.z/DH_CELLS.SIZE);}
/* whether a group is drawn with the camera at p (under: the camera below the ground) */
function dhSeenOne(q,p,under,cut){const C=DH_CELLS;if(!C.on)return true;const d=Math.max(0,p.distanceTo(q.c)-q.r);
 if(q.box){const b=q.box;if(cut)return d<C.under;if(!b.carved)return d<C.built[under?0:1];if(b.sunk)return d<C.near;
  const dx=p.x-b.S.x,dz=p.z-b.S.z,lx=dx*b.c-dz*b.s,lz=dx*b.s+dz*b.c,dy=p.y-b.S.o.y;
  if(lx>b.x0-3&&lx<b.x1+3&&lz>b.z0-3&&lz<b.z1+3&&p.y>b.y0-2&&p.y<b.y1+2)return true;
  return lz>-1&&lz<C.front&&Math.abs(lx)<b.x1+C.front*.8&&dy>-4&&dy<C.front*.6;}
 if(q.bio)return d<C.far&&(!under||C.open&&d<C.mouth)&&(!q.lod||(q.lod==='near'?d<C.treeNear:q.lod==='far'?d>=C.treeNear:q.lod==='snear'?d<DHG.SAP_NEAR:d>=DHG.SAP_NEAR));   /* the grove's levels (49) */
 return q.under?d<C.under:(!under||d<C.mouth);}
function dhSeen(p,under){const C=DH_CELLS,cut=ANIMU.uCut.value>.5;let n=0,t=0,f=0;
 /* underground the plants show only up an opening (the camera under the light well's throat or a well's pit) or out of the
    cliff's mouths (the portal, the galleries) */
 C.open=Math.hypot(p.x-DH.HALL.c[0],p.z-DH.HALL.c[1])<DH.HALL.throat.r0+30||DH.PITS.some(P=>Math.hypot(p.x-P.c[0],p.z-P.c[1])<P.r+30)||p.x<DH.PLAT.cliffX+150;
 for(const q of C.list){const v=dhSeenOne(q,p,under,cut);q.g.visible=v;if(v){n++;t+=q.tris;if(q.bio)f++;}}
 C.shown=n;C.tris=t;C.forest=f;return n;}
/* a merged mesh cut by key (keyOf(x, y, z) of a triangle's middle; null keeps it out): one mesh a key, its vertices shared, its
   own index and bounds. An instanced mesh cut by key of each instance's place: one instanced mesh a key, its rows copied (the
   matrices, the colours, every per-instance attribute), its bounds the instances' spread padded by the shape's own radius */
function dhSplitIndexed(m,keyOf){const P=m.geometry.attributes.position.array,X=m.geometry.index,I=X?X.array:null,N=X?X.count:m.geometry.attributes.position.count,by={},out={};
 for(let t=0;t+2<N;t+=3){const i0=I?I[t]:t,i1=I?I[t+1]:t+1,i2=I?I[t+2]:t+2,a=i0*3,b=i1*3,c=i2*3,k=keyOf((P[a]+P[b]+P[c])/3,(P[a+1]+P[b+1]+P[c+1])/3,(P[a+2]+P[b+2]+P[c+2])/3);
  if(k!==null)(by[k]||(by[k]=[])).push(i0,i1,i2);}
 for(const k in by){const g=new THREE.BufferGeometry();for(const n in m.geometry.attributes)g.setAttribute(n,m.geometry.attributes[n]);g.setIndex(new THREE.Uint32BufferAttribute(by[k],1));
  const bx=new THREE.Box3(),v=new THREE.Vector3();for(const i of by[k])bx.expandByPoint(v.set(P[i*3],P[i*3+1],P[i*3+2]));g.boundingBox=bx;g.boundingSphere=bx.getBoundingSphere(new THREE.Sphere());
  const n=new THREE.Mesh(g,m.material);n.name=m.name;n.castShadow=m.castShadow;n.receiveShadow=m.receiveShadow;n.renderOrder=m.renderOrder;n.userData=Object.assign({},m.userData);n.userData.tris=by[k].length/3;out[k]=n;}
 return out;}
function dhSplitInstanced(m,keyOf){const M=m.instanceMatrix.array,by={},out={};for(let i=0;i<m.count;i++){const k=keyOf(M[i*16+12],M[i*16+13],M[i*16+14]);if(k!==null)(by[k]||(by[k]=[])).push(i);}
 const G=m.geometry;if(!G.boundingSphere)G.computeBoundingSphere();const r0=G.boundingSphere.radius+G.boundingSphere.center.length(),inst=Object.keys(G.attributes).filter(n=>G.attributes[n].isInstancedBufferAttribute);
 for(const k in by){const L=by[k],n=L.length,g=new THREE.BufferGeometry();for(const a in G.attributes)if(!inst.includes(a))g.setAttribute(a,G.attributes[a]);if(G.index)g.setIndex(G.index);
  for(const a of inst){const A=G.attributes[a],s=A.itemSize,arr=new A.array.constructor(n*s);L.forEach((i,j)=>{for(let q=0;q<s;q++)arr[j*s+q]=A.array[i*s+q];});const B=new THREE.InstancedBufferAttribute(arr,s,A.normalized,A.meshPerAttribute);g.setAttribute(a,B);}
  const im=new THREE.InstancedMesh(g,m.material,n),bx=new THREE.Box3(),v=new THREE.Vector3();let sc=0;
  L.forEach((i,j)=>{for(let q=0;q<16;q++)im.instanceMatrix.array[j*16+q]=M[i*16+q];bx.expandByPoint(v.set(M[i*16+12],M[i*16+13],M[i*16+14]));sc=Math.max(sc,Math.hypot(M[i*16],M[i*16+1],M[i*16+2]),Math.hypot(M[i*16+4],M[i*16+5],M[i*16+6]),Math.hypot(M[i*16+8],M[i*16+9],M[i*16+10]));});
  if(m.instanceColor){const C=m.instanceColor.array,arr=new Float32Array(n*3);L.forEach((i,j)=>{arr[j*3]=C[i*3];arr[j*3+1]=C[i*3+1];arr[j*3+2]=C[i*3+2];});im.instanceColor=new THREE.InstancedBufferAttribute(arr,3);}
  const sp=bx.getBoundingSphere(new THREE.Sphere());sp.radius+=r0*sc;g.boundingSphere=sp;g.boundingBox=bx.clone().expandByScalar(r0*sc);
  im.name=m.name;im.castShadow=m.castShadow;im.receiveShadow=m.receiveShadow;im.renderOrder=m.renderOrder;im.frustumCulled=true;im.userData=Object.assign({},m.userData);im.userData.tris=(G.index?G.index.count:G.attributes.position.count)/3*n;out[k]=im;}
 return out;}
/* the plants cut into cells, once after the bake: BIO.baked holds the cut meshes after */
function dhSplitBiome(){if(typeof BIO==='undefined'||!BIO.baked||!BIO.baked.length||BIO.baked._split)return 0;const t0=performance.now(),S=DH_CELLS.BIO,groups={},keep=[];
 const keyOf=(x,y,z)=>Math.floor(x/S)+','+Math.floor(z/S);
 for(const m of BIO.baked){if(!m.parent||!m.matrixWorld.equals(new THREE.Matrix4())){keep.push(m);continue;}
  const kf=m.userData.under?(x,y,z)=>'w'+keyOf(x,y,z):keyOf,parts=m.isInstancedMesh?dhSplitInstanced(m,kf):dhSplitIndexed(m,kf);   /* the underground's plants (88, 89): cells of their own, drawn as the underground's */
  for(const k in parts){(groups[k]||(groups[k]=new THREE.Group())).add(parts[k]);keep.push(parts[k]);}m.parent.remove(m);}
 for(const k in groups){const g=groups[k];g.userData.cell='bio'+k;scene.add(g);const bx=new THREE.Box3();g.children.forEach(m=>bx.union(m.geometry.boundingBox));const sp=bx.getBoundingSphere(new THREE.Sphere());
  const w=k[0]==='w';DH_CELLS.list.push({k:'bio'+k,g,c:sp.center,r:sp.radius,under:w,bio:!w,tris:g.children.reduce((a,m)=>a+m.userData.tris,0)});}
 BIO.baked.length=0;keep.forEach(m=>BIO.baked.push(m));BIO.baked._split=true;DH_CELLS.bioMs=Math.round(performance.now()-t0);return Object.keys(groups).length;}
/* the sites' boxes for the furniture: each site's declared box, turned (a carved front's runs back from its origin), 1.5 m out,
   from 3 m under its floor to 2 m over its height; a hash of 8 m squares to the boxes over them */
function dhSiteBoxes(){const B=[],H=new Map(),E=1.5;
 SITES.forEach((S,si)=>{if(ONLYSET&&!ONLYSET.has(S.key))return;const D=DEFS[S.key],front=!!D.originFront,c=Math.cos(S.ry||0),s=Math.sin(S.ry||0),z0=front?-D.d:-D.d/2,z1=front?0:D.d/2;
  const b={S,si,c,s,x0:-D.w/2-E,x1:D.w/2+E,z0:z0-E,z1:z1+E,y0:S.o.y-3-(D.sunk?14:0),y1:S.o.y+D.h+2,carved:front||!!D.sunk,sunk:!!D.sunk};B.push(b);
  const P=[[b.x0,b.z0],[b.x1,b.z0],[b.x0,b.z1],[b.x1,b.z1]].map(([x,z])=>[S.x+x*c+z*s,S.z-x*s+z*c]),xs=P.map(q=>q[0]),zs=P.map(q=>q[1]);
  for(let i=Math.floor(Math.min(...xs)/8);i<=Math.floor(Math.max(...xs)/8);i++)for(let j=Math.floor(Math.min(...zs)/8);j<=Math.floor(Math.max(...zs)/8);j++){const k=i+','+j;(H.get(k)||H.set(k,[]).get(k)).push(b);}});
 return {B,at(x,y,z){const L=H.get(Math.floor(x/8)+','+Math.floor(z/8));if(!L)return null;for(const b of L){if(y<b.y0||y>b.y1)continue;const dx=x-b.S.x,dz=z-b.S.z,lx=dx*b.c-dz*b.s,lz=dx*b.s+dz*b.c;
   if(lx>b.x0&&lx<b.x1&&lz>b.z0&&lz<b.z1)return b;}return null;}};}
/* the furniture's batch (91f: one merged mesh a material for the whole map) cut by site and cell: each mesh keeps its vertices and
   gets one index per group (a triangle goes by its middle), with the group's own bounds */
function dhSplitFurniture(){const G=typeof ZJF!=='undefined'&&ZJF.group;if(!G||G.userData.split)return 0;G.userData.split=true;const t0=performance.now();
 const S=DH_CELLS.SIZE,SB=dhSiteBoxes(),gy=new Map(),under=(x,y,z)=>{const k=Math.round(x/4)+','+Math.round(z/4);let g=gy.get(k);if(g===undefined){g=DH.groundY(x,z);gy.set(k,g);}return y<g-3;};
 const meshes=[],groups={},info={};G.traverse(m=>{if(m.isMesh&&!m.userData.probeSkip)meshes.push(m);});G.updateMatrixWorld(true);
 const keyOf=(x,y,z)=>{const sb=SB.at(x,y,z),u=under(x,y,z),k=sb?'f'+sb.si:(u?'u':'s')+Math.floor(x/S)+','+Math.floor(z/S);if(!info[k])info[k]={under:u,site:sb};return k;};
 const I4=new THREE.Matrix4(),wb=new THREE.Box3();
 for(const m of meshes){if(!m.matrixWorld.equals(I4)){   /* a textured piece (the batch's decals: its own mesh, placed): into the cell of its middle, whole */
   m.geometry.computeBoundingBox();wb.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);const q=wb.getCenter(new THREE.Vector3()),k=keyOf(q.x,q.y,q.z);
   (groups[k]||(groups[k]=new THREE.Group())).add(m);m.matrix.copy(m.matrixWorld);m.matrix.decompose(m.position,m.quaternion,m.scale);m.userData.worldBox=wb.clone();continue;}
  const parts=dhSplitIndexed(m,keyOf);
  for(const k in parts)(groups[k]||(groups[k]=new THREE.Group())).add(parts[k]);m.parent.remove(m);}
 const triOf=m=>(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3;
 for(const k in groups){const g=groups[k],I_=info[k];g.userData.cell=k;G.add(g);const bx=new THREE.Box3();g.children.forEach(m=>bx.union(m.userData.worldBox||m.geometry.boundingBox));const sp=bx.getBoundingSphere(new THREE.Sphere());
  DH_CELLS.list.push({k,g,c:sp.center,r:sp.radius,under:I_.under,box:I_.site,site:I_.site?I_.site.S.key:null,furniture:true,tris:g.children.reduce((a,m)=>a+triOf(m),0)});}
 DH_CELLS.splitMs=Math.round(performance.now()-t0);return Object.keys(groups).length;}
FRAME_HOOKS.push(()=>{const t=performance.now();if(t-DH_CELLS.t<250)return;DH_CELLS.t=t;dhSplitFurniture();dhSplitBiome();const p=camera.position;dhSeen(p,p.y<terrainH(p.x,p.z)-2);});

/* a carved mouth's hole in the ground's face (40-zj-cave.js fills ZJ_HOLES) cuts the face only up to the mouth's top (w: that
   height + 10000; a well's hole has w 0 and goes through), and the rock round each mouth is kept meshed (DH_STREAM.pin): the hole
   always has the cavern's cliff round its opening in it, near the camera or far, so the portal reads from anywhere */
const DH_MOUTHS=[];
function dhMouthHoles(){const H=ZJ_HOLES.value,TOP=DH_MOUTH.top;DH_MOUTHS.length=0;
 for(const s of SITES){if(s.district!=='outpost'||s.at!=='wall'||!TOP[s.key])continue;const O=CVC.openings.find(o=>o.id==='dh.mouth.'+s.key+'.'+Math.round(s.z));if(!O)continue;
  const v=H.find(q=>q.z>0&&Math.abs(q.x-O.c[0])<1e-3&&Math.abs(q.y-O.c[1])<1e-3),top=s.o.y+TOP[s.key];if(v)v.w=top+10000;DH_MOUTHS.push({c:O.c,r:O.r+O.rim,y0:s.o.y-2,y1:top+2});}
 /* the decoy's (86) */
 {const D=DH.DECOY,O=CVC.openings.find(o=>o.id==='dh.mouth.decoy');if(O){const v=H.find(q=>q.z>0&&Math.abs(q.x-O.c[0])<1e-3&&Math.abs(q.y-O.c[1])<1e-3),top=D.y+D.top;if(v)v.w=top+10000;DH_MOUTHS.push({c:O.c,r:O.r+O.rim,y0:D.y-2,y1:top+2});}}}
// ---------------------------------------------------------------- (re)build the world
let WORLD=null;
function buildWorld(){if(WORLD){scene.remove(WORLD);WORLD.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
 WORLD=new THREE.Group();scene.add(WORLD);GB={};GTARGET=GB;REG.length=0;ZJ_LIFE.length=0;halosReset();SMOKES=[];GSTAT.tris=0;SBS.length=0;SB=null;resetCM();if(!ZJTAGS)zjTagsReset();
 KWALK.clear();cvNew();CULT.cur=CULT.packs.zeijani||CULT.cur;
 CV_OPTS.skipMass=true;CV_OPTS.groundKeep=(x,z,y)=>CVC.openings.some(O=>O.kind==='well'&&Math.hypot(x-O.c[0],z-O.c[1])<O.r+O.rim+.2&&!(DH_MOUTH.tops[O.id]<y));   /* at a mouth, only under its top (the page's ground is drawn over it) */CV_OPTS.wellDoor=q=>{const c=cvW(q.c[0],0,q.c[1]);return terrainH(c[0],c[2])-c[1]>3;};
 const t0=performance.now();
 dhCarve();dhGlowFungus();   /* 94-dhelv-light.js: the tunnels' glow fungus (drawn and haloed with the world) */
 const base=GB,cells={};DH_CELLS.list.length=0;   /* each site's drawing into its cell's buckets (below: what is seen) */
 for(const S of SITES){if(ONLYSET&&!ONLYSET.has(S.key))continue;const k=dhCellKey(S);GB=GTARGET=cells[k]||(cells[k]={});place(S.key,S.x,S.z,S.ry||0,S.o);}
 GB=GTARGET=base;dhCliffStairs();dhHills();dhExtras();   /* 89: the wells' floors' hills; 86: the sentinels, the buried well */
 for(const k in cells){const g=new THREE.Group();g.userData.cell=k;flushBuckets(cells[k],g,true);if(!g.children.length)continue;WORLD.add(g);
  const bx=new THREE.Box3();g.children.forEach(m=>{m.geometry.computeBoundingBox();bx.union(m.geometry.boundingBox);});const sp=bx.getBoundingSphere(new THREE.Sphere());
  DH_CELLS.list.push({k,g,c:sp.center,r:sp.radius,under:k[0]==='u',tris:g.children.reduce((a,m)=>a+m.geometry.index.count/3,0)});}
 /* the stream: a ribbon of water a hand above the apron's floor; its fall off the shelf's lip in front of the west face's columns
    into a plunge pool, and the swallow pool where it sinks into the young lava, each ringed with rocks */
 {const S=DH.STREAM,src=S[S.length-1],snk=S[0],W=DH.PLAT.cliffX,xf=W-DH.LIP.out-.7,top=DH.shelfY(W,src[1],1)+.1,fy=DH.APRON.floor,wa=P('water');
  for(const [dz,w,k] of [[0,2.4,1],[-.7,.7,1.06],[.9,.5,1.1]])box('water',xf-.05*k,fy,src[1]+dz,w,top-fy,.18,wa.clone().multiplyScalar(k));   /* the fall: a sheet and two thinner strands */
  box('water',(W+xf)/2+2,top-.25,src[1],10,.12,2.6,wa,PI/2);   /* its run over the lip */
  for(const [p,r] of [[[src[0],src[1]],4.2],[[snk[0],snk[1]],5.2]]){const y=DH.groundY(p[0],p[1]);cyl('water',p[0],y+.02,p[1],r,.04,wa,28);
   for(let i=0;i<11;i++){const a=i*TAU/11+.3*Math.sin(i*2.1),q=r+.5+.4*Math.sin(i*1.7);sph('tuffHewn',p[0]+Math.cos(a)*q,y,p[1]+Math.sin(a)*q,.5+.35*Math.abs(Math.sin(i*3.1)),P('tuffDark'),.55,8);}}}
 for(let i=1;i<DH.STREAM.length;i++){const a=DH.STREAM[i-1],b=DH.STREAM[i];if(a[0]>DH.PLAT.cliffX-1||b[0]>DH.PLAT.cliffX-1)continue;const L=Math.hypot(b[0]-a[0],b[1]-a[1]),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
  box('water',mx,DH.groundY(mx,mz)+.04,mz,3.2,.03,L+1,P('water'),Math.atan2(b[0]-a[0],b[1]-a[1]));for(const sd of [-1,1])box('earth',mx+Math.cos(Math.atan2(b[0]-a[0],b[1]-a[1]))*sd*1.9,DH.groundY(mx,mz),mz-Math.sin(Math.atan2(b[0]-a[0],b[1]-a[1]))*sd*1.9,.7,.12,L+1,P('earth'),Math.atan2(b[0]-a[0],b[1]-a[1]));}
 flushBuckets(GB,WORLD,true);
 const tc=performance.now();CVC.build();const tb=performance.now()-tc;
 while(CV_GROUP.children.length){const m=CV_GROUP.children.pop();m.geometry.dispose();}WORLD.add(CV_GROUP);cvFinishOpenings();dhMouthHoles();dhStreamReset();dhSurfaceWalk();
 CV_STATS={chunks:CVC.chunks.length,tris:0,ms:Math.round(tb),prims:CVC.prims.length};
 const forest=dhbForest();
 window._build={forest,ms:Math.round(performance.now()-t0),cavernBuildMs:Math.round(tb),tris:Math.round(GSTAT.tris),sites:SITES.length,records:REG.length,halos:HALOS.length,life:ZJ_LIFE.length,
  cavern:CV_STATS,walk:{floors:KWALK.floors.length,blocks:KWALK.blocks.length}};return WORLD;}

/* the orbit camera's floor (92-camera.js): the ground, but none while the camera is in a void under it */
function camGroundY(p){const g=terrainH(p.x,p.z);if(CVC&&p.y<g-.5&&CVC.voidSD(p.x,p.y,p.z)<0)return -1e9;return g;}
/* underground the sky is not drawn and a dark fog closes the distance (the rock past the streamed chunks is not meshed);
   the cave's own light (the wells' shafts, the lamps' pool) is P5c's */
const DH_UNDER={on:false,fog:new THREE.Color(0x1c1814),dens:.0055};
FRAME_HOOKS.push(()=>{const p=camera.position,u=p.y<terrainH(p.x,p.z)-2;if(u===DH_UNDER.on)return;DH_UNDER.on=u;skyScene.visible=!u;
 if(u){scene.fog.color.copy(DH_UNDER.fog);scene.fog.density=DH_UNDER.dens;}else{scene.fog.density=.0011;skyApply();}});
/* the cut-away (C) at Dhelv's carved sites: each room's own rock opens above its floor (40-zj-cave.js); and the rock that is not
   the site's (the hall's wall before its front, the ceiling over its bay) opens inside the site's turned box, run 3 m out past
   its front, above its floor + 2 m; the ground over it opens on the camera's side (the kit sheet's rule). The 32 sites nearest
   the camera, refreshed every half second while the cut is on */
CV_OPTS.cutBoxes=true;
const DH_CUT={t:0,FWD:3,sites:[]};
function dhCutBoxes(p){const C=SITES.filter(S=>(!ONLYSET||ONLYSET.has(S.key))&&(DEFS[S.key].originFront||DEFS[S.key].sunk)).map(S=>[S,(S.x-p.x)**2+(S.z-p.z)**2]).sort((a,b)=>a[1]-b[1]).slice(0,32);
 DH_CUT.sites=C.map(c=>c[0].key);
 for(let i=0;i<32;i++){const A=CVU.uBoxA.value[i],B=CVU.uBoxB.value[i],G=ZJ_CUTSITES.value[i],q=C[i];if(!q){A.set(0,0,0,0);B.set(0,0,0,0);G.set(0,0,0,0);continue;}
  const S=q[0],D=DEFS[S.key],c=Math.cos(S.ry||0),s=Math.sin(S.ry||0),F=D.sunk?0:DH_CUT.FWD,lz=D.sunk?0:(F-D.d)/2,hd=D.sunk?D.d/2:(D.d+F)/2,cx=S.x+s*lz,cz=S.z+c*lz;
  A.set(cx,cz,D.w/2+.3,hd);B.set(c,s,S.o.y,1);G.set(cx,cz,Math.abs(c)*D.w/2+Math.abs(s)*hd,Math.abs(s)*D.w/2+Math.abs(c)*hd);}}
FRAME_HOOKS.push(()=>{if(ANIMU.uCut.value<.5)return;const t=performance.now();if(t-DH_CUT.t<500)return;DH_CUT.t=t;dhCutBoxes(camera.position);});

// ---------------------------------------------------------------- views
function autoViews(){const V={},B=DH.byId,H=DH.HALL;
 const at=(id,dx,dy,dz,ty)=>{const n=B[id];return [n.x+dx,n.y+dy,n.z+dz,n.x,n.y+(ty===undefined?1.5:ty),n.z];};
 /* a view down a tunnel: the camera on the way from a to b, `back` metres short of b and h up, looking on to b (inside the void) */
 const along=(a,b,back,h)=>{const A=B[a],C=B[b],L=Math.hypot(C.x-A.x,C.z-A.z),t=Math.max(0,1-back/L);return [A.x+(C.x-A.x)*t,A.y+(C.y-A.y)*t+h,A.z+(C.z-A.z)*t,C.x,C.y+1.5,C.z];};
 V['The square from the ledge']=[DH.onLedge(-PI/2)[0],H.ledgeY+1.7,DH.onLedge(-PI/2)[1]+2,0,2,10];
 V['The square']=[30,3,40,0,6,-20];
 const hy=(x,z,y)=>{const q=DH.hillAt(x,z);return q?q.y:y;};   /* (the wells' floors are hills: 41) */
 V['Under the light well']=[6,hy(6,8,0)+1.7,8,0,30,0];
 V['The west mouth']=at('h.w',22,4,6,2);
 V['The braid']=along('a2','j1',16,2.4);
 V['The stone door']=along('a1','b0',14,2.2);V['The stone door from the outer tube']=along('t2','t.door',16,2.4);
 V['The outer tube']=along('t1','t2',30,3);
 V['The outpost']=[-935,DH.PLAT.plain+35,40,-735,DH.PLAT.plain+5,0];
 V['The portal']=[-735,DH.PLAT.plain+7,10,-680,DH.PLAT.plain+13,0];
 V['The plateau from the plain']=[-1100,DH.PLAT.plain+20,-420,-500,DH.PLAT.top-10,-80];
 for(const P of DH.PITS){V[P.name+': from the rim']=[P.c[0]+P.r*.8,DH.groundY(P.c[0],P.c[1])+4,P.c[1]+P.r*.8,P.c[0],P.floor+3,P.c[1]];
  {const n=B[P.id+'.in'],x=n.x+(P.c[0]-n.x)*.18,z=n.z+(P.c[1]-n.z)*.18;V[P.name+': its floor']=[x,hy(x,z,P.floor)+1.7,z,P.c[0],hy(P.c[0],P.c[1],P.floor)+3,P.c[1]];}}   /* in from its way in, up the hill */
 V['The cistern']=at('cis',8,2,8,0);
 V['The catacombs\' head']=at('k.head',-12,2,-10,0);
 V['Over the plateau (the city below)']=[-150,DH.surfaceY(0,0)+260,520,-80,DH.PLAT.top-20,60];
 V['Over the outpost']=[-1075,DH.PLAT.plain+115,300,-755,DH.PLAT.plain+5,0];
 return V;}
const ATMOS_HOOKS=[];function atmosFrame(dt){for(const f of ATMOS_HOOKS)f(dt);}
ATMOS.init({THREE,scene,camera,hour:()=>SKY.hour,onFrame:fn=>ATMOS_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:4401,err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const ATMOS_GROUND=new THREE.Color();
ATMOS.skylight({renderer,sky:skyScene,scene,ground:()=>ATMOS_GROUND.copy(hemi.groundColor).multiplyScalar(hemi.intensity),key:()=>SKY.night?'n':'d'});
/* where the cavern's ground and the page's overlap (a ring at each opening's rim), the rock wins the depth test: no fight */
cvRockMat.polygonOffset=true;cvRockMat.polygonOffsetFactor=-1;cvRockMat.polygonOffsetUnits=-2;

// ---------------------------------------------------------------- the rolling stone door (the owner: it rolls back to let the guard in)
/* The stone door's millstone is drawn here, not by the kit (o.liveStone: the record's `stone`). It stands across the passage
   through the shut hours (the life layer's DHS.DOOR_SHUT, by its clock or the sky's hour) and rolls back into its slit when
   it is open, or at night when one of the guard or the scouts comes within DH_STONE.reach of it (their way passes it: the
   door is theirs); it rolls in DH_STONE.secs, turning as it goes */
const DH_STONE={mesh:null,rec:null,k:0,secs:4,reach:14,want:0};
function dhStoneBuild(){const R=REG.find(r=>!r.parent&&r.stone);DH_STONE.rec=R||null;if(DH_STONE.mesh){scene.remove(DH_STONE.mesh);DH_STONE.mesh.geometry.dispose();DH_STONE.mesh=null;}if(!R)return;
 const S=R.stone,g=new THREE.CylinderGeometry(S.r,S.r,S.t,40,1);g.rotateX(PI/2);const col=new Float32Array(g.attributes.position.count*3),cc=new THREE.Color(S.colour);
 for(let i=0;i<col.length;i+=3){col[i]=cc.r;col[i+1]=cc.g;col[i+2]=cc.b;}g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const m=new THREE.Mesh(g,MAT.tuffHewn);m.rotation.order='YXZ';m.rotation.y=R.ry||0;m.castShadow=m.receiveShadow=true;m.userData.mk='tuffHewn';scene.add(m);DH_STONE.mesh=m;DH_STONE.k=0;}
FRAME_HOOKS.push(dt=>{const D=DH_STONE;if(!D.mesh||REG.indexOf(D.rec)<0)dhStoneBuild();if(!D.mesh)return;const S=D.rec.stone;
 let L0=null;try{L0=DHL;}catch(e){}   /* 95 declares the life layer after this runs its first frames */
 const life=!!(L0&&L0.on),h=life?L0.clock.hour:SKY.hour,w=typeof DHS!=='undefined'?DHS.DOOR_SHUT:[22,5],shut=w[0]>w[1]?(h>=w[0]||h<w[1]):(h>=w[0]&&h<w[1]);
 let near=false;if(shut&&life){const t=SIM.time(),c=S.shut;for(const a of SIM.all('actor')){if(!a.present||(a.role!=='guard'&&a.role!=='scout'))continue;const p=SIM.pose(a,t);if(!p.hidden&&Math.hypot(p.x-c[0],p.y-c[1],p.z-c[2])<D.reach){near=true;break;}}}
 D.want=shut&&!near?1:0;const step=Math.min(.1,dt||.016)/D.secs;D.k+=Math.max(-step,Math.min(step,D.want-D.k));
 const k=D.k*D.k*(3-2*D.k),x=S.open[0]+(S.shut[0]-S.open[0])*k,y=S.open[1]+(S.shut[1]-S.open[1])*k,z=S.open[2]+(S.shut[2]-S.open[2])*k;D.mesh.position.set(x,y,z);
 const L=Math.hypot(S.shut[0]-S.open[0],S.shut[2]-S.open[2]);D.mesh.rotation.z=-k*L/S.r;});
