// ================================================================= NULAB — the world: the Krator sky, the ground, the great lake, the Chimes Riba
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). Four ground meshes,
// each registered with core/drawn (KDRAWN) and each a step coarser and lower where a finer one lies over it: the town (6 m
// cells: the mound to the quays), the river's reach (10 m: the bay's head, the outlet, the works across the river), the country
// (40 m: the near ring and its fields, the bay, the plain) and the far field (500 m: the scale model out to 70 km: the basin's
// walls, Ledge's cliff across the lake, Blakhed's shoulder). The finer ones wear canvases painted from the records (never read
// back) blending the library's sets in world metres; the far field is coloured by height and slope. The water is core/water's:
// the great lake (WATER.open at 297.4 m, its bed the ground) and the Chimes Riba (WATER.flow from the bay's head down the level
// reach). [web]: canvas and three.js.
const NL_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
// ---------------------------------------------------------------- the reach: the walls stand 18-40 km off, Ledge's cliff 57 km
camera.near=.8;camera.far=150000;camera.updateProjectionMatrix();
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Kirstabal's and Thalaba's)
const NL_SKY={hour:9.6,day:150,dens:1.25};   /* the basin's air: about 1.53 atm (PLAN.md 2.1), a Csa summer morning */
const nlSkyGroup=KratorSky.attach(scene,60000);nlSkyGroup.traverse(o=>{o.userData.probeSkip=true;});
scene.fog.density=.000014;   /* the veiled rim's haze: the walls clear at 20 km, Ledge's cliff softened at 57 */
const nlHemi=scene.children.find(o=>o.isHemisphereLight);
function nlSkyTick(){KratorSky.update(camera.position,NL_SKY.hour,NL_SKY.day,NL_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(nlHemi)nlHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(nlSkyTick);nlSkyTick();
// ---------------------------------------------------------------- core/atmos for the water: the clock, the wave field, the sky in the water
ATMOS.init({THREE,scene,camera,hour:()=>NL_SKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:44311,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const NL_SKYS=new THREE.Scene(),NL_ENV={environment:null},NL_SKYC=nlSkyGroup.clone();NL_SKYS.add(NL_SKYC);
ATMOS.hook(()=>{NL_SKYC.position.set(0,0,0);nlSkyGroup.children.forEach((o,i)=>{const c=NL_SKYC.children[i];if(!c)return;
 c.position.copy(o.position);c.quaternion.copy(o.quaternion);c.scale.copy(o.scale);c.visible=o.visible;});});
ATMOS.skylight({renderer,sky:NL_SKYS,scene:NL_ENV,ground:()=>new THREE.Color(0x4a4a34)});
// ---------------------------------------------------------------- the boxes
const NL_TB={x0:-1600,x1:1000,z0:-2200,z1:1900,cell:6},NL_RB={x0:4500,x1:6400,z0:-900,z1:6300,cell:10},
 NL_CB={x0:-7000,x1:9000,z0:-6600,z1:8400,cell:40},NL_FB={x0:-70000,x1:70000,z0:-70000,z1:70000,cell:500};
const nlIn=(B,x,z,m)=>x>B.x0+(m||0)&&x<B.x1-(m||0)&&z>B.z0+(m||0)&&z<B.z1-(m||0);
// ---------------------------------------------------------------- the paint: a tint canvas and two zone masks per box, from the records
// mask A: r beaten earth (the streets, the lanes, the roads), g flagstones (the plaza, the market, the quays), b made ground
// (dirt: the yards, the zones); mask B: r sand (the shores, the river's banks), g tilled soil (the fields). None: the grass
function nlPainter(B){const PX=4096/Math.max(B.x1-B.x0,B.z1-B.z0),W=Math.ceil((B.x1-B.x0)*PX),H=Math.ceil((B.z1-B.z0)*PX);
 const mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c;};
 const P={B,PX,tint:mk(),a:mk(),b:mk(),gx:x=>(x-B.x0)*PX,gz:z=>(z-B.z0)*PX};
 P.t=P.tint.getContext('2d');P.ma=P.a.getContext('2d');P.mb=P.b.getContext('2d');
 P.t.fillStyle='#7f7f7f';P.t.fillRect(0,0,W,H);P.ma.fillStyle='#000';P.ma.fillRect(0,0,W,H);P.mb.fillStyle='#000';P.mb.fillRect(0,0,W,H);
 P.poly=(c,pts)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(P.gx(p[0]),P.gz(p[1])):c.moveTo(P.gx(p[0]),P.gz(p[1])));c.closePath();};
 P.line=(c,pts,w)=>{c.lineWidth=Math.max(1,w*PX);c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(P.gx(p[0]),P.gz(p[1])):c.moveTo(P.gx(p[0]),P.gz(p[1])));c.stroke();};
 P.rect=(c,r,w,d,m)=>{const cs=Math.cos(r.ry),sn=Math.sin(r.ry),hw=w/2+(m||0),hd=d/2+(m||0);P.poly(c,[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[r.x+a*hw*cs+b*hd*sn,r.z-a*hw*sn+b*hd*cs]));};
 P.box=(c,b)=>c.fillRect(P.gx(b[0]),P.gz(b[1]),(b[2]-b[0])*PX,(b[3]-b[1])*PX);
 /* the climate on the grass (89zn's nlWet): a dry Csa gold inland, greener by the water; the shores' and the banks' sand by the
    ground's own height, as cells */
 P.climate=(step)=>{for(let z=B.z0;z<B.z1;z+=step)for(let x=B.x0;x<B.x1;x+=step){const cx=x+step/2,cz=z+step/2,w=nlWet(cx,cz),k=Math.max(0,Math.min(1,(w-.42)/.3)),L=(a,b)=>Math.round(a+(b-a)*k);
   P.t.fillStyle='rgba('+L(184,96)+','+L(166,118)+','+L(96,70)+','+(.7-.25*k).toFixed(3)+')';P.t.fillRect(P.gx(x),P.gz(z),step*PX+1,step*PX+1);
   const y=NL_GROUND.h(cx,cz),rv=NL_GROUND.riverAt(cx,cz);
   if((y>NL_GROUND.LAKE-1.2&&y<NL_GROUND.LAKE+1.6)||(rv[0]<NL_GROUND.river.width/2+30&&y<rv[1]+4)){P.mb.fillStyle='rgb(255,0,0)';P.mb.fillRect(P.gx(x),P.gz(z),step*PX+1,step*PX+1);}}};
 return P;}
function nlPaintRecords(P,detail){const K=NL_PLAN,{ma,mb,t}=P;
 /* the fields: in crop tilled (a deep shade), resting pale, the orchards a darker green on the grass */
 for(const f of NL_FIELDS){const b=f.box;if(b[2]<P.B.x0||b[0]>P.B.x1||b[3]<P.B.z0||b[1]>P.B.z1)continue;const v=(nlHash(f.id)%17)-8;
  if(f.kind==='crop'){mb.fillStyle='rgb(0,'+(200+v*4)+',0)';P.box(mb,b);t.fillStyle='rgba('+(150+v)+','+(140+v)+',90,.45)';P.box(t,b);}
  else if(f.kind==='orchard'){t.fillStyle='rgba(80,110,60,.5)';P.box(t,b);}
  else{t.fillStyle='rgba('+(176+v)+','+(160+v)+',100,.45)';P.box(t,b);}}
 for(const V of NL_RINGV){for(const l of V.lanes||[]){ma.strokeStyle='rgb(255,0,0)';P.line(ma,l.pts,nlD(l.w,4));}
  ma.fillStyle='rgb(0,0,255)';for(const r of V.records||[]){P.rect(ma,r,nlD(r.w,8),nlD(r.d,8),detail?2:3);ma.fill();}
  if(V.farm&&V.farm.tracks)for(const tr of V.farm.tracks){ma.strokeStyle='rgb(255,0,0)';P.line(ma,tr.pts,nlD(tr.w,4));}}
 if(!K)return;
 /* the town's zones: made ground, a little dirt; the yards round every building dirt */
 ma.fillStyle='rgb(0,0,150)';for(const Z of [K.zones.town,K.zones.works]){P.poly(ma,Z);ma.fill();}
 t.fillStyle='rgba(150,130,104,.22)';for(const Z of [K.zones.town,K.zones.works]){P.poly(t,Z);t.fill();}
 ma.fillStyle='rgb(0,0,255)';for(const r of K.lots.concat(K.extra))if(r.kind!=='harbour'||r.key!=='nl_ferry'){P.rect(ma,r,r.fw||r.w,r.fd||r.d,detail?1.5:3);ma.fill();}
 /* the caravan ground: beaten earth inside its fence; the granary yard and the plaza: flagstone */
 {const C=K.caravan;ma.fillStyle='rgb(0,0,255)';P.box(ma,[C.c[0]-C.w/2,C.c[1]-C.d/2,C.c[0]+C.w/2,C.c[1]+C.d/2]);}
 ma.fillStyle='rgb(0,255,0)';{const G2=K.granary;P.box(ma,[G2.c[0]-G2.w/2,G2.c[1]-G2.d/2,G2.c[0]+G2.w/2,G2.c[1]+G2.d/2]);P.box(ma,[K.plaza[0]-45,K.plaza[1]-30,K.plaza[0]+45,K.plaza[1]+30]);
  const M=K.market;P.box(ma,[M[0]-40,M[1]-40,M[0]+40,M[1]+40]);}
 /* the quays' apron */
 {const H=NL_GROUND.HARBOUR,q=K.quays;P.box(ma,[q.x-28,q.z0-10,q.x+q.w/2,q.z1+10]);}
 /* the streets and the roads: beaten earth; the earthworks' banks: dirt */
 for(const w of K.ways){ma.strokeStyle='rgb(255,0,0)';P.line(ma,w.pts,w.w+.6);t.strokeStyle=w.cls==='avenue'?'#8c8070':'#887c6c';P.line(t,w.pts,w.w+.6);}
 for(const w of K.roads){ma.strokeStyle='rgb(255,0,0)';P.line(ma,w.pts,w.w);}
 {const R=K.rings.precinct;ma.strokeStyle='rgb(0,0,255)';for(const s of R.segs)P.line(ma,s,R.w+4);}}
// ---------------------------------------------------------------- the ground's material: the sets in world metres, blended by the masks
function nlGroundMat(P,key){const tex=new THREE.CanvasTexture(P.tint);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const mA=new THREE.CanvasTexture(P.a),mB=new THREE.CanvasTexture(P.b);mA.encoding=mB.encoding=THREE.LinearEncoding;
 const lib=k=>{const t=MAT[k]&&MAT[k].map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.needsUpdate=true;}return t;};
 const sc=k=>{const L=KMAT.packed&&KMAT.packed('nulab',k);return L&&L.scale?L.scale[0]:3;};
 const U={tGrass:{value:lib('nlGrass')},tDirt:{value:lib('nlDirt')},tEarth:{value:lib('nlEarth')},tFlag:{value:lib('nlFlag')},tSand:{value:lib('nlSand')},tTill:{value:lib('nlTilled')},
  tMA:{value:mA},tMB:{value:mB},kT:{value:new THREE.Vector4(1/sc('nlGrass'),1/sc('nlDirt'),1/sc('nlEarth'),1/sc('nlFlag'))},kT2:{value:new THREE.Vector2(1/sc('nlSand'),1/sc('nlTilled'))}};
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vNlW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvNlW=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vNlW;uniform sampler2D tGrass,tDirt,tEarth,tFlag,tSand,tTill,tMA,tMB;uniform vec4 kT;uniform vec2 kT2;')
   .replace('#include <map_fragment>',['#ifdef USE_MAP','vec4 nlT=mapTexelToLinear(texture2D(map,vUv));vec4 nlA=texture2D(tMA,vUv);vec4 nlB=texture2D(tMB,vUv);vec2 nw=vNlW.xz;',
    'vec3 nc=sRGBToLinear(texture2D(tGrass,nw*kT.x)).rgb;nc=mix(nc,sRGBToLinear(texture2D(tDirt,nw*kT.y)).rgb,nlA.b);',
    'nc=mix(nc,sRGBToLinear(texture2D(tSand,nw*kT2.x)).rgb,nlB.r);nc=mix(nc,sRGBToLinear(texture2D(tTill,nw*kT2.y)).rgb,nlB.g);',
    'nc=mix(nc,sRGBToLinear(texture2D(tEarth,nw*kT.z)).rgb,nlA.r);nc=mix(nc,sRGBToLinear(texture2D(tFlag,nw*kT.w)).rgb,nlA.g);',
    'diffuseColor.rgb*=nc*nlT.rgb*4.6;','#endif'].join('\n'));};
 const off={town:[-2,-4],river:[-2,-4],country:[-1,-2]}[key]||[0,0];mat.polygonOffset=true;mat.polygonOffsetFactor=off[0];mat.polygonOffsetUnits=off[1];   /* the finer ground in front where the meshes meet */
 mat.customProgramCacheKey=()=>'nulab-ground-'+key;return mat;}
// ---------------------------------------------------------------- the meshes: a plane of B's cells, its heights the ground's, lowered `sink` m
// where a finer box lies over it (its rim left on the ground, so the two meet), registered with core/drawn
function nlGroundMesh(B,name,mat,over,sink,colour){const nx=Math.round((B.x1-B.x0)/B.cell),nz=Math.round((B.z1-B.z0)/B.cell),W=B.x1-B.x0,Hh=B.z1-B.z0;
 const geo=new THREE.PlaneGeometry(W,Hh,nx,nz),p=geo.attributes.position,uv=geo.attributes.uv,cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2,hs=new Float32Array(p.count);
 const col=colour?new Float32Array(p.count*3):null;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;let y=terrainH(x,z);if(over&&[].concat(over).some(O=>nlIn(O,x,z,B.cell)))y-=sink;p.setZ(i,y);hs[i]=y;
  uv.setXY(i,(x-B.x0)/W,1-(z-B.z0)/Hh);if(col){const c=colour(x,z,y);col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];}}
 if(col)geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.rotation.x=-Math.PI/2;m.position.set(cx,0,cz);
 m.userData.isGround=true;m.userData.ground=true;m.userData.probeSkip=true;m.name=name;scene.add(m);
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.grid({x0:B.x0,z0:B.z0,dx:W/nx,dz:Hh/nz,nx,nz,h:hs}));
 return m;}
const NL_PT=nlPainter(NL_TB);NL_PT.climate(8);nlPaintRecords(NL_PT,true);
const NL_PR=nlPainter(NL_RB);NL_PR.climate(10);nlPaintRecords(NL_PR,true);
const NL_PC=nlPainter(NL_CB);NL_PC.climate(40);nlPaintRecords(NL_PC,false);
groundM=nlGroundMesh(NL_TB,'terrain',nlGroundMat(NL_PT,'town'),null,0);
const NL_RIVERG=nlGroundMesh(NL_RB,'terrain-river',nlGroundMat(NL_PR,'river'),null,0);
const NL_COUNTRY=nlGroundMesh(NL_CB,'terrain-country',nlGroundMat(NL_PC,'country'),[NL_TB,NL_RB],6);
/* the far field: the lake's bed, the basin's Csa plain, the walls' forest and their bare faces, the shoulders' alpine grass, snow */
const nlLin=c=>{const k=new THREE.Color(c).convertSRGBToLinear();return[k.r,k.g,k.b];};
const NL_FCOL={bed:nlLin(0x3c4436),plain:nlLin(0x8a8456),forest:nlLin(0x4e5c38),face:nlLin(0x7a7266),alpine:nlLin(0x7c7a5a),snow:nlLin(0xe8eaee)};
const nlMixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const nlFarColour=(x,z,y)=>{const e=500,gx=(NL_GROUND.model(x+e,z)-NL_GROUND.model(x-e,z))/(2*e),gz=(NL_GROUND.model(x,z+e)-NL_GROUND.model(x,z-e))/(2*e),sl=Math.hypot(gx,gz);
 let c=y<NL_GROUND.LAKE?NL_FCOL.bed:y<1100?NL_FCOL.plain:y<2800?NL_FCOL.forest:y<4600?NL_FCOL.alpine:NL_FCOL.snow;
 if(y>=600&&y<4600&&sl>.16)c=nlMixC(c,NL_FCOL.face,Math.min(1,(sl-.16)*2.5));return c;};
const NL_FAR=nlGroundMesh(NL_FB,'terrain-far',new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}),NL_CB,10,nlFarColour);
// ---------------------------------------------------------------- the water
const nlLinC=c=>new THREE.Color(c).convertSRGBToLinear();
/* the great lake: fresh, cool-bottomed, a warm green shelf along the south shore; its bed the ground, baked fine round the harbour */
const NL_LAKE=(function(){try{const W=WATER.open({name:'The great lake',level:NL_GROUND.LAKE,field:.14,bounds:[NL_FB.x0,NL_FB.z0,NL_FB.x1,NL_FB.z1],bed:terrainH,bedBox:[400,-2800,4200,400],bedCell:16});
  const D=WATER.draw(W,{renderOrder:1,roughness:.1,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,shallow:nlLinC(0x6a8264),deep:nlLinC(0x1e4048)});
  D.mesh.userData.inspectLabel='The great lake (297 m; its name is the owner\'s)';D.mesh.userData.probeSkip=true;return D;}catch(e){reportErr('lake: '+(e&&e.stack||e));return null;}})();
/* the Chimes Riba: from the bay's head through the outlet and down the level reach, in its channel (40-nl-ground.js) */
const NL_RIVER=(function(){const R=NL_GROUND.river,pts=R.pts.map(p=>[p[0],p[1],p[2]]);
 try{const F=WATER.flow({name:'The Chimes Riba',pts,width:R.width,speed:1.1,densify:40});
  const D=WATER.drawFlow(F,{shallow:nlLinC(0x6a8064),deep:nlLinC(0x2a4c4a),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.45,step:20,across:6,margin:6,renderOrder:2});
  if(D&&D.mesh){D.mesh.userData.inspectLabel='The Chimes Riba (r005: 943 m3/s at the outlet)';D.mesh.userData.probeSkip=true;}return {F,D,pts};}
 catch(e){reportErr('Chimes Riba: '+(e&&e.stack||e));return null;}})();
window._worldMs=Math.round(performance.now()-NL_T0);
window._nlWater={lake:!!NL_LAKE,river:!!(NL_RIVER&&NL_RIVER.D),riverPts:NL_RIVER?NL_RIVER.pts.length:0};
