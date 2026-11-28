// ================================================================= GIHON — the world: the Krator sky, the ground, the lake, the Opal River, the moats
// Runs after 90-scene (Kirstabal's 90k, adapted). Four ground meshes, each registered with core/drawn (KDRAWN) and each a step
// coarser and lower where a finer one lies over it: the town (6 m cells), the river's valley up from the town (12 m), the country
// (the ring's floor: 50 m) and the far field (the scale model: 500 m). The finer ones wear canvases painted from the records
// (never read back) blending Kirstabal's library sets in world metres (its pack, read in place); the far field is coloured by
// height and slope. The water is core/water's: the lake (WATER.open), the Opal River (WATER.flow, down its gorge to the mouth),
// the two moats (a flow a side). [web]: canvas and three.js.
const GH_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
camera.near=.8;camera.far=90000;camera.updateProjectionMatrix();
const GH_SKY={hour:9.2,day:120,dens:1.6};   /* the Rift floor's air: about 1.98 atm, hot and wet */
const ghSkyGroup=KratorSky.attach(scene,60000);ghSkyGroup.traverse(o=>{o.userData.probeSkip=true;});
scene.fog.density=.000032;
const ghHemi=scene.children.find(o=>o.isHemisphereLight);
function ghSkyTick(){KratorSky.update(camera.position,GH_SKY.hour,GH_SKY.day,GH_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(ghHemi)ghHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(ghSkyTick);ghSkyTick();
ATMOS.init({THREE,scene,camera,hour:()=>GH_SKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:41911,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const GH_SKYS=new THREE.Scene(),GH_ENV={environment:null},GH_SKYC=ghSkyGroup.clone();GH_SKYS.add(GH_SKYC);
ATMOS.hook(()=>{GH_SKYC.position.set(0,0,0);ghSkyGroup.children.forEach((o,i)=>{const c=GH_SKYC.children[i];if(!c)return;
 c.position.copy(o.position);c.quaternion.copy(o.quaternion);c.scale.copy(o.scale);c.visible=o.visible;});});
ATMOS.skylight({renderer,sky:GH_SKYS,scene:GH_ENV,ground:()=>new THREE.Color(0x3c4a32)});
// ---------------------------------------------------------------- the boxes
const GH_TB={x0:-1400,x1:1400,z0:-1300,z1:1100,cell:6},GH_RB={x0:600,x1:4800,z0:1000,z1:5800,cell:12},GH_CB={x0:-12000,x1:8000,z0:-5000,z1:9000,cell:50},GH_FB={x0:-110000,x1:90000,z0:-70000,z1:90000,cell:500};
const ghIn=(B,x,z,m)=>x>B.x0+(m||0)&&x<B.x1-(m||0)&&z>B.z0+(m||0)&&z<B.z1-(m||0);
// ---------------------------------------------------------------- the paint (Kirstabal's: a tint canvas and two zone masks a box)
// mask A: r cobbles, g flagstones, b made ground (dirt); mask B: r sand (the beach, the river's banks), g tilled soil. None: grass
function ghPainter(B){const PX=4096/Math.max(B.x1-B.x0,B.z1-B.z0),W=Math.ceil((B.x1-B.x0)*PX),H=Math.ceil((B.z1-B.z0)*PX);
 const mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c;};
 const P={B,PX,tint:mk(),a:mk(),b:mk(),gx:x=>(x-B.x0)*PX,gz:z=>(z-B.z0)*PX};
 P.t=P.tint.getContext('2d');P.ma=P.a.getContext('2d');P.mb=P.b.getContext('2d');
 P.t.fillStyle='#7f7f7f';P.t.fillRect(0,0,W,H);P.ma.fillStyle='#000';P.ma.fillRect(0,0,W,H);P.mb.fillStyle='#000';P.mb.fillRect(0,0,W,H);
 P.poly=(c,pts)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(P.gx(p[0]),P.gz(p[1])):c.moveTo(P.gx(p[0]),P.gz(p[1])));c.closePath();};
 P.line=(c,pts,w)=>{c.lineWidth=w*PX;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(P.gx(p[0]),P.gz(p[1])):c.moveTo(P.gx(p[0]),P.gz(p[1])));c.stroke();};
 P.rect=(c,r,w,d,m)=>{const cs=Math.cos(r.ry),sn=Math.sin(r.ry),hw=w/2+(m||0),hd=d/2+(m||0);P.poly(c,[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[r.x+a*hw*cs+b*hd*sn,r.z-a*hw*sn+b*hd*cs]));};
 P.sandBands=(step)=>{P.mb.fillStyle='rgb(255,0,0)';
  for(let z=B.z0;z<B.z1;z+=step)for(let x=B.x0;x<B.x1;x+=step){const cx=x+step/2,cz=z+step/2,y=GH_GROUND.h(cx,cz),rv=GH_GROUND.riverAt(cx,cz),
   bank=rv[0]<GH_GROUND.river.width/2+30&&y<rv[1]+5;if((y>-1.5&&y<3.2&&GH_GROUND.v(cx,cz)<90)||bank)P.mb.fillRect(P.gx(x),P.gz(z),step*PX+1,step*PX+1);}};
 return P;}
const GH_EARTH=[[-1150,40],[1150,40],[1150,1520],[-1150,1520]].map(([u,v])=>GH_GROUND.at(u,v));
function ghPaintClimate(P,step){const B=P.B;for(let z=B.z0;z<B.z1;z+=step)for(let x=B.x0;x<B.x1;x+=step){const w=ghWet(x+step/2,z+step/2);
 const k=Math.max(0,Math.min(1,(w-.38)/.4)),L=(a,b)=>Math.round(a+(b-a)*k);
 P.t.fillStyle='rgba('+L(196,78)+','+L(164,100)+','+L(84,62)+','+(.8-.3*k).toFixed(3)+')';P.t.fillRect(P.gx(x),P.gz(z),step*P.PX+1,step*P.PX+1);}}
function ghPaintTown(P){const K=GH_PLAN;if(!K)return;const {ma,mb,t}=P;
 ghPaintClimate(P,10);P.sandBands(4);
 for(const M of GH_GROUND.moats()){mb.fillStyle='rgb(255,0,0)';P.line(mb,M.line,M.width+12);t.strokeStyle='rgba(80,72,60,.45)';P.line(t,M.line,M.width+12);}
 ma.fillStyle='rgb(0,0,200)';P.poly(ma,GH_EARTH);ma.fill();t.fillStyle='rgba(140,130,118,.25)';P.poly(t,GH_EARTH);t.fill();
 /* the yards as garden plots (Kirstabal's): every 3 m cell of the walled zone not under a building, its doorstep or a street,
    in 9 m plots, each by its hash green garden, tilled beds or beaten earth */
 {const Z=GH_TOWN.ZONE,S=3,at=GH_GROUND.at;let ng=0,nb=0;
  const under=(x,z)=>{for(const s of GH_WAYS.query(x,z,1))if(KCITY.lib.segDist([x,z],s.a,s.b)<s.w/2+.8)return true;
   for(const p of GH_SPACE.query(x,z,1)){const D=VERN.defs[p.key];if(!D)continue;const dx=x-p.x,dz=z-p.z,c=Math.cos(p.ry),s=Math.sin(p.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;
    if(Math.abs(lx)<(D.fw||D.w)/2+1.2&&Math.abs(lz)<(D.fd||D.d)/2+1.2)return true;}return false;};
  const FB=K.fc&&K.fc.box;
  for(let vv=Z[0][1];vv<Z[2][1];vv+=S)for(let uu=Z[0][0];uu<Z[1][0];uu+=S){if(FB&&uu>FB[0]&&uu<FB[2]&&vv>FB[1]&&vv<FB[3])continue;const m=at(uu+S/2,vv+S/2);
   if(GH_GROUND.h(m[0],m[1])<1.4||!ghInWall(m[0],m[1])||under(m[0],m[1]))continue;
   const k=KRAND.unit(KRAND.cell(41927,Math.floor(uu/9),Math.floor(vv/9)));if(k>=.85)continue;
   const q=[[uu,vv],[uu+S,vv],[uu+S,vv+S],[uu,vv+S]].map(([u,v])=>at(u,v));
   ma.fillStyle='rgb(0,0,0)';P.poly(ma,q);ma.fill();
   if(k<.55){t.fillStyle='rgba(92,126,60,.32)';P.poly(t,q);t.fill();ng++;}
   else{mb.fillStyle='rgb(0,255,0)';P.poly(mb,q);mb.fill();t.fillStyle='rgba(88,70,48,.22)';P.poly(t,q);t.fill();nb++;}}
  window._ghGardens={green:ng,beds:nb,m2:(ng+nb)*S*S};}
 /* the forbidden city's terrace: flagstone, its parade ground and courts */
 if(K.fc&&K.fc.box){const B=K.fc.box,c=[[B[0]+6,B[1]+6],[B[2]-6,B[1]+6],[B[2]-6,B[3]-6],[B[0]+6,B[3]-6]].map(([u,v])=>GH_GROUND.at(u,v));ma.fillStyle='rgb(0,255,0)';P.poly(ma,c);ma.fill();}
 ma.fillStyle='rgb(0,0,255)';for(const r of K.lots.concat(K.extra))if(r.kind!=='mole'&&r.kind!=='quay'&&r.kind!=='boat'&&r.kind!=='bridge'){
  const D=K.lots.indexOf(r)>=0&&VERN.defs[r.key];if(D){P.rect(ma,r,(D.fw||D.w)+2.4,(D.fd||D.d)+2.4,0);}else P.rect(ma,r,r.w,r.d,1);ma.fill();}
 for(const w of K.ways){ma.strokeStyle=w.cls==='avenue'?'rgb(0,255,0)':'rgb(255,0,0)';P.line(ma,w.pts,w.w+.6);t.strokeStyle=w.cls==='avenue'?'#8a8680':'#86827c';P.line(t,w.pts,w.w+.6);}
 for(const w of K.roads){ma.strokeStyle='rgb(0,0,255)';P.line(ma,w.pts,w.w);}
 {const H=GH_GROUND.HARBOUR,c=[[H.u0-20,-2],[H.u1+20,-2],[H.u1+20,44],[H.u0-20,44]].map(([u,v])=>GH_GROUND.at(u,v));ma.fillStyle='rgb(0,255,0)';P.poly(ma,c);ma.fill();
  const B2=K.places.bazaar,s=[[B2[0]-36,B2[1]-36],[B2[0]+36,B2[1]-36],[B2[0]+36,B2[1]+36],[B2[0]-36,B2[1]+36]].map(([u,v])=>GH_GROUND.at(u,v));P.poly(ma,s);ma.fill();}}
function ghPaintCountry(P){const K=GH_PLAN;ghPaintClimate(P,25);P.sandBands(25);const {ma,mb}=P;
 if(K){ma.fillStyle='rgba(0,0,120,1)';P.poly(ma,GH_EARTH);ma.fill();for(const w of K.roads){ma.strokeStyle='rgb(0,0,255)';P.line(ma,w.pts,w.w);}}
 for(const f of GH_FIELDS){const b=f.box,X=P.gx(b[0]),Z=P.gz(b[1]),W2=(b[2]-b[0])*P.PX,H2=(b[3]-b[1])*P.PX;
  if(f.kind==='tilled'||f.kind==='crop'){mb.fillStyle=f.kind==='tilled'?'rgb(0,255,0)':'rgb(0,150,0)';mb.fillRect(X,Z,W2,H2);}
  else{P.t.fillStyle=f.kind==='fallow'?'rgba(160,150,90,.45)':'rgba(120,128,90,.3)';P.t.fillRect(X,Z,W2,H2);}}
 for(const V of GH_RINGV){ma.fillStyle='rgb(0,0,255)';for(const r of V.records||[]){P.rect(ma,r,r.w,r.d,2);ma.fill();}}}
// ---------------------------------------------------------------- the ground's material: Kirstabal's sets (its pack, kit.json packFrom)
function ghGroundMat(P,key){const tex=new THREE.CanvasTexture(P.tint);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const mA=new THREE.CanvasTexture(P.a),mB=new THREE.CanvasTexture(P.b);mA.encoding=mB.encoding=THREE.LinearEncoding;
 const lib=k=>{const t=MAT[k]&&MAT[k].map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.needsUpdate=true;}return t;};
 const sc=k=>{const L=KMAT.packed&&KMAT.packed('kirstabal',k);return L&&L.scale?L.scale[0]:3;};
 const U={tGrass:{value:lib('ksGrass')},tDirt:{value:lib('ksDirt')},tCobble:{value:lib('ksCobble')},tFlag:{value:lib('ksFlag')},tSand:{value:lib('ksSand')},tTill:{value:lib('ksTilled')},
  tMA:{value:mA},tMB:{value:mB},kT:{value:new THREE.Vector4(1/sc('ksGrass'),1/sc('ksDirt'),1/sc('ksCobble'),1/sc('ksFlag'))},kT2:{value:new THREE.Vector2(1/sc('ksSand'),1/sc('ksTilled'))}};
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGhW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGhW=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vGhW;uniform sampler2D tGrass,tDirt,tCobble,tFlag,tSand,tTill,tMA,tMB;uniform vec4 kT;uniform vec2 kT2;')
   .replace('#include <map_fragment>',['#ifdef USE_MAP','vec4 ghT=mapTexelToLinear(texture2D(map,vUv));vec4 ghA=texture2D(tMA,vUv);vec4 ghB=texture2D(tMB,vUv);vec2 kw=vGhW.xz;',
    'vec3 kc=sRGBToLinear(texture2D(tGrass,kw*kT.x)).rgb;kc=mix(kc,sRGBToLinear(texture2D(tDirt,kw*kT.y)).rgb,ghA.b);',
    'kc=mix(kc,sRGBToLinear(texture2D(tSand,kw*kT2.x)).rgb,ghB.r);kc=mix(kc,sRGBToLinear(texture2D(tTill,kw*kT2.y)).rgb,ghB.g);',
    'kc=mix(kc,sRGBToLinear(texture2D(tCobble,kw*kT.z)).rgb,ghA.r);kc=mix(kc,sRGBToLinear(texture2D(tFlag,kw*kT.w)).rgb,ghA.g);',
    'diffuseColor.rgb*=kc*ghT.rgb*4.6;','#endif'].join('\n'));};
 mat.polygonOffset=true;mat.polygonOffsetFactor=key==='country'?-1:-2;mat.polygonOffsetUnits=key==='country'?-2:-4;
 mat.customProgramCacheKey=()=>'gihon-ground-'+key;return mat;}
function ghGroundMesh(B,name,mat,over,sink,colour){const nx=Math.round((B.x1-B.x0)/B.cell),nz=Math.round((B.z1-B.z0)/B.cell),W=B.x1-B.x0,Hh=B.z1-B.z0;
 const geo=new THREE.PlaneGeometry(W,Hh,nx,nz),p=geo.attributes.position,uv=geo.attributes.uv,cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2,hs=new Float32Array(p.count);
 const col=colour?new Float32Array(p.count*3):null;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;let y=terrainH(x,z);if(over&&[].concat(over).some(O=>ghIn(O,x,z,B.cell)))y-=sink;p.setZ(i,y);hs[i]=y;
  uv.setXY(i,(x-B.x0)/W,1-(z-B.z0)/Hh);if(col){const c=colour(x,z,y);col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];}}
 if(col)geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.rotation.x=-Math.PI/2;m.position.set(cx,0,cz);
 m.userData.isGround=true;m.userData.ground=true;m.userData.probeSkip=true;m.name=name;scene.add(m);
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.grid({x0:B.x0,z0:B.z0,dx:W/nx,dz:Hh/nz,nx,nz,h:hs}));
 return m;}
const GH_PT=ghPainter(GH_TB);ghPaintTown(GH_PT);
const GH_PC=ghPainter(GH_CB);ghPaintCountry(GH_PC);
groundM=ghGroundMesh(GH_TB,'terrain',ghGroundMat(GH_PT,'town'),null,0);
/* the Opal River's valley up from the town (its 60 m channel would be bridged by the country's 50 m cells) */
const GH_PR=ghPainter(GH_RB);ghPaintClimate(GH_PR,12);GH_PR.sandBands(8);{const K=GH_PLAN;if(K)for(const w of K.roads){GH_PR.ma.strokeStyle='rgb(0,0,255)';GH_PR.line(GH_PR.ma,w.pts,w.w);}}
const GH_RIVERG=ghGroundMesh(GH_RB,'terrain-river',ghGroundMat(GH_PR,'river'),GH_TB,6);
const GH_COUNTRY=ghGroundMesh(GH_CB,'terrain-country',ghGroundMat(GH_PC,'country'),[GH_TB,GH_RB],8);
const ghLin=c=>{const k=new THREE.Color(c).convertSRGBToLinear();return[k.r,k.g,k.b];};
const GH_FCOL={bed:ghLin(0x40463a),floor:ghLin(0x6f7a4c),forest:ghLin(0x4c5c36),face:ghLin(0x8a7a62),lip:ghLin(0x80845a)};
const ghMixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const ghFarColour=(x,z,y)=>{const e=400,gx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),gz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e),sl=Math.hypot(gx,gz);
 let c=y<0?GH_FCOL.bed:y<160?GH_FCOL.floor:y<2400?GH_FCOL.forest:GH_FCOL.lip;if(y>=160&&y<2400&&sl>.18)c=ghMixC(c,GH_FCOL.face,Math.min(1,(sl-.18)*3));return c;};
const GH_FAR=ghGroundMesh(GH_FB,'terrain-far',new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}),GH_CB,12,ghFarColour);
// ---------------------------------------------------------------- the water
const ghLinC=c=>new THREE.Color(c).convertSRGBToLinear();
const GH_LAKE=(function(){try{const W=WATER.open({name:'The Lower Xanadu Lake',level:0,field:.12,bounds:[GH_FB.x0,GH_FB.z0,GH_FB.x1,GH_FB.z1],bed:terrainH,bedBox:[-3400,-4800,3000,600],bedCell:16});
  const D=WATER.draw(W,{renderOrder:1,roughness:.1,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,shallow:ghLinC(0x6a8064),deep:ghLinC(0x22484a)});
  D.mesh.userData.inspectLabel='The Lower Xanadu Lake';D.mesh.userData.probeSkip=true;return D;}catch(e){reportErr('lake: '+(e&&e.stack||e));return null;}})();
/* the Opal River (Sitār Ḍrāi, r682: 115 m3/s): down its gorge from the far field to its mouth past the town's river front */
const GH_RIVER=(function(){const pts=GH_GROUND.river.pts.filter(p=>GH_GROUND.v(p[0],p[1])>-40).map(p=>[p[0],p[1],p[2]]),width=pts.map(()=>GH_GROUND.river.width);   /* to the shore: the lake takes it from there */
 try{const F=WATER.flow({name:'the Opal River',pts,width,speed:1.8,rapids:[.01,.06],densify:30});
  const D=WATER.drawFlow(F,{shallow:ghLinC(0x7a8a6c),deep:ghLinC(0x3a5a50),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.45,step:16,across:6,margin:6,renderOrder:2});
  if(D&&D.mesh){D.mesh.userData.inspectLabel='The Opal River (Sitār Ḍrāi, r682: 115 m3/s)';D.mesh.userData.probeSkip=true;}return {F,D,pts};}
 catch(e){reportErr('the Opal River: '+(e&&e.stack||e));return null;}})();
/* THE MOATS: the town's (Chiang Mai's, 16 m) and the forbidden city's (12 m), each as four flows, one a side, corner to corner */
const GH_MOAT=(function(){const out=[];for(const M of GH_GROUND.moats()){const L=M.line,n=L.length-1,k=n/4;
 for(let sd=0;sd<4;sd++){const pts=[];for(let i=Math.round(sd*k);i<=Math.round((sd+1)*k);i++){const p=L[i%n];pts.push([p[0],p[1],GH_GROUND.moatLevel(p[0],p[1])]);}
  try{const F=WATER.flow({name:'the moat',pts,width:pts.map(()=>M.width-1),speed:.15,densify:20});
   const D=WATER.drawFlow(F,{shallow:ghLinC(0x6c7a5c),deep:ghLinC(0x34483e),color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.45,step:8,across:4,margin:2,renderOrder:2});
   if(D&&D.mesh){D.mesh.userData.inspectLabel='The moat';D.mesh.userData.probeSkip=true;out.push(D);}}
  catch(e){reportErr('the moat: '+(e&&e.stack||e));}}}
 return out;})();
window._worldMs=Math.round(performance.now()-GH_T0);
window._ghWater={lake:!!GH_LAKE,river:!!(GH_RIVER&&GH_RIVER.D),riverPts:GH_RIVER?GH_RIVER.pts.length:0,moat:GH_MOAT.length};
