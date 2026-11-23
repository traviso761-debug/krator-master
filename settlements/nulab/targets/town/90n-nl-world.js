// ================================================================= NULAB — the world: the Krator sky, the ground, the great lake, the Chimes Riba
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). Four ground meshes,
// each registered with core/drawn (KDRAWN) and each a step coarser and lower where a finer one lies over it: the coastal town and its
// surrounding field belts (6 m cells), the river's reach and copper works (10 m), the country (40 m: the near ring and its fields,
// the bay, the plain) and the far field (500 m: the scale model out to 70 km). [web]: canvas and three.js.
const NL_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
camera.near=.8;camera.far=150000;camera.updateProjectionMatrix();
const NL_SKY={hour:9.6,day:150,dens:1.25};
const nlSkyGroup=KratorSky.attach(scene,60000);nlSkyGroup.traverse(o=>{o.userData.probeSkip=true;});
scene.fog.density=.000014;
const nlHemi=scene.children.find(o=>o.isHemisphereLight);
function nlSkyTick(){KratorSky.update(camera.position,NL_SKY.hour,NL_SKY.day,NL_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(nlHemi)nlHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(nlSkyTick);nlSkyTick();
ATMOS.init({THREE,scene,camera,hour:()=>NL_SKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:44311,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const NL_SKYS=new THREE.Scene(),NL_ENV={environment:null},NL_SKYC=nlSkyGroup.clone();NL_SKYS.add(NL_SKYC);
ATMOS.hook(()=>{NL_SKYC.position.set(0,0,0);nlSkyGroup.children.forEach((o,i)=>{const c=NL_SKYC.children[i];if(!c)return;
 c.position.copy(o.position);c.quaternion.copy(o.quaternion);c.scale.copy(o.scale);c.visible=o.visible;});});
ATMOS.skylight({renderer,sky:NL_SKYS,scene:NL_ENV,ground:()=>new THREE.Color(0x4a4a34)});
// ---------------------------------------------------------------- the boxes: NL_TB frames the coastal city, its earthen mound and its three field belts
const NL_TB={x0:-2000,x1:1150,z0:-3150,z1:550,cell:6},NL_RB={x0:4500,x1:6400,z0:-900,z1:6300,cell:10},
 NL_LB={x0:-2050,x1:-1050,z0:-5650,z1:-3650,cell:6,sink:20},
 NL_CB={x0:-7000,x1:9000,z0:-6600,z1:8400,cell:40},NL_FB={x0:-70000,x1:70000,z0:-70000,z1:70000,cell:500};
const nlIn=(B,x,z,m)=>x>B.x0+(m||0)&&x<B.x1-(m||0)&&z>B.z0+(m||0)&&z<B.z1-(m||0);
function nlPainter(B){const PX=4096/Math.max(B.x1-B.x0,B.z1-B.z0),W=Math.ceil((B.x1-B.x0)*PX),H=Math.ceil((B.z1-B.z0)*PX);
 const mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c;};
 const P={B,PX,tint:mk(),a:mk(),b:mk(),gx:x=>(x-B.x0)*PX,gz:z=>(z-B.z0)*PX};
 P.t=P.tint.getContext('2d');P.ma=P.a.getContext('2d');P.mb=P.b.getContext('2d');
 P.t.fillStyle='#7f7f7f';P.t.fillRect(0,0,W,H);P.ma.fillStyle='#000';P.ma.fillRect(0,0,W,H);P.mb.fillStyle='#000';P.mb.fillRect(0,0,W,H);
 P.poly=(c,pts)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(P.gx(p[0]),P.gz(p[1])):c.moveTo(P.gx(p[0]),P.gz(p[1])));c.closePath();};
 P.line=(c,pts,w)=>{c.lineWidth=Math.max(1,w*PX);c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(P.gx(p[0]),P.gz(p[1])):c.moveTo(P.gx(p[0]),P.gz(p[1])));c.stroke();};
 P.rect=(c,r,w,d,m)=>{const cs=Math.cos(r.ry),sn=Math.sin(r.ry),hw=w/2+(m||0),hd=d/2+(m||0);P.poly(c,[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[r.x+a*hw*cs+b*hd*sn,r.z-a*hw*sn+b*hd*cs]));};
 P.box=(c,b)=>c.fillRect(P.gx(b[0]),P.gz(b[1]),(b[2]-b[0])*PX,(b[3]-b[1])*PX);
 P.climate=(step)=>{for(let z=B.z0;z<B.z1;z+=step)for(let x=B.x0;x<B.x1;x+=step){const cx=x+step/2,cz=z+step/2,w=nlWet(cx,cz),k=Math.max(0,Math.min(1,(w-.42)/.3)),L=(a,b)=>Math.round(a+(b-a)*k);
   P.t.fillStyle='rgba('+L(180,94)+','+L(164,118)+','+L(94,68)+','+(.68-.22*k).toFixed(3)+')';P.t.fillRect(P.gx(x),P.gz(z),step*PX+1,step*PX+1);
   const y=NL_GROUND.h(cx,cz),rv=NL_GROUND.riverAt(cx,cz);
   if((y>NL_GROUND.LAKE-1.2&&y<NL_GROUND.LAKE+1.6)||(rv[0]<NL_GROUND.river.width/2+30&&y<rv[1]+4)){P.mb.fillStyle='rgb(255,0,0)';P.mb.fillRect(P.gx(x),P.gz(z),step*PX+1,step*PX+1);}}};
 return P;}
const NL_CROP_TINT={'giant lotus root':[68,122,58,.66],'wild rice':[80,130,58,.64],'helix bean':[88,132,54,.64],
 'ashroot':[128,128,60,.60],'valley woad':[74,118,64,.64],'sea-linen flax':[112,136,68,.60],'mist greens':[76,134,60,.66]};
function nlPaintField(P,f){const {ma,mb,t}=P,v=(nlHash(f.id)%17)-8, draw=ctx=>{if(f.infill){P.rect(ctx,f,f.w,f.d,0);ctx.fill();}else P.box(ctx,f.box);};
 if(f.infill){ma.fillStyle='rgb(0,0,0)';P.rect(ma,f,f.w,f.d,.6);ma.fill();}
 if(f.kind==='crop'){const c=NL_CROP_TINT[f.crop]||[98,132,68,.56];mb.fillStyle='rgb(0,'+(208+v*2)+',0)';draw(mb);
  t.fillStyle='rgba('+(c[0]+v)+','+(c[1]+v)+','+(c[2]+Math.round(v/2))+','+c[3]+')';draw(t);}
 else if(f.kind==='orchard'){t.fillStyle='rgba(74,112,56,.56)';draw(t);}
 else{mb.fillStyle='rgb(0,95,0)';draw(mb);t.fillStyle='rgba('+(172+v)+','+(156+v)+',96,.48)';draw(t);}}
function nlPaintRecords(P,detail){const K=NL_PLAN,{ma,mb,t}=P;
 if(K){
  /* the town's zones first (light dirt under the wards), so infill crop plots painted after stay crisp and green */
  ma.fillStyle='rgb(0,0,145)';for(const Z of [K.zones.town,K.zones.works]){P.poly(ma,Z);ma.fill();}
  t.fillStyle='rgba(150,130,104,.20)';for(const Z of [K.zones.town,K.zones.works]){P.poly(t,Z);t.fill();}
  ma.fillStyle='rgb(0,0,245)';for(const r of K.lots.concat(K.extra))if(r.kind!=='harbour'||r.key!=='nl_ferry'){P.rect(ma,r,r.fw||r.w,r.fd||r.d,detail?1.4:2.8);ma.fill();}}
 /* every field parcel (surrounding town belts, ring villages, and the infill crop plots inside the city's empty lots) */
 for(const f of NL_FIELDS){const b=f.box;if(b[2]<P.B.x0||b[0]>P.B.x1||b[3]<P.B.z0||b[1]>P.B.z1)continue;nlPaintField(P,f);}
 for(const F of NL_TOWNF){ma.fillStyle='rgb(0,0,255)';for(const r of F.records||[]){P.rect(ma,r,nlD(r.w,20),nlD(r.d,20),detail?2:3);ma.fill();}
  if(F.farm&&F.farm.tracks)for(const tr of F.farm.tracks){ma.strokeStyle='rgb(255,0,0)';P.line(ma,tr.pts,nlD(tr.w,4));}}
 for(const V of NL_RINGV){for(const l of V.lanes||[]){ma.strokeStyle='rgb(255,0,0)';P.line(ma,l.pts,nlD(l.w,4));}
  ma.fillStyle='rgb(0,0,255)';for(const r of V.records||[]){P.rect(ma,r,nlD(r.w,8),nlD(r.d,8),detail?2:3);ma.fill();}
  if(V.farm&&V.farm.tracks)for(const tr of V.farm.tracks){ma.strokeStyle='rgb(255,0,0)';P.line(ma,tr.pts,nlD(tr.w,4));}}
 if(!K)return;
 {const C=K.caravan;ma.fillStyle='rgb(0,0,255)';P.box(ma,[C.c[0]-C.w/2,C.c[1]-C.d/2,C.c[0]+C.w/2,C.c[1]+C.d/2]);}
 ma.fillStyle='rgb(0,255,0)';{const G2=K.granary;P.box(ma,[G2.c[0]-G2.w/2,G2.c[1]-G2.d/2,G2.c[0]+G2.w/2,G2.c[1]+G2.d/2]);
  P.box(ma,[K.plaza[0]-43,K.plaza[1]-29,K.plaza[0]+43,K.plaza[1]+29]);
  const M=K.market;P.box(ma,[M[0]-40,M[1]-40,M[0]+40,M[1]+40]);}
 {const q=K.quays;P.box(ma,[q.x-28,q.z0-10,q.x+q.w/2,q.z1+10]);}
 if(typeof NL_LPLAN!=='undefined'&&NL_LPLAN){const L=NL_LPLAN;
  ma.strokeStyle='rgb(0,0,245)';P.line(ma,[L.atS(1340,0),L.atS(L.portal.s+5,0)],76);
  t.strokeStyle='rgba(128,118,104,.55)';P.line(t,[L.atS(1340,0),L.atS(L.portal.s+5,0)],76);
  ma.strokeStyle='rgb(0,255,0)';P.line(ma,[L.atS(1364,8),L.atS(1516,8)],56);}
 for(const w of K.ways){ma.strokeStyle='rgb(255,0,0)';P.line(ma,w.pts,w.w+.6);t.strokeStyle=w.cls==='avenue'?'#8c8070':'#887c6c';P.line(t,w.pts,w.w+.6);}
 for(const w of K.roads){ma.strokeStyle='rgb(255,0,0)';P.line(ma,w.pts,w.w);}
 ma.strokeStyle='rgb(0,0,220)';
 for(const s of K.rings.precinct.segs)P.line(ma,s,K.rings.precinct.w+5);
 for(const s of K.rings.outer.segs)P.line(ma,s,K.rings.outer.w+6);}
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
 const off={town:[-2,-4],river:[-2,-4],line:[-2,-4],country:[-1,-2]}[key]||[0,0];mat.polygonOffset=true;mat.polygonOffsetFactor=off[0];mat.polygonOffsetUnits=off[1];
 mat.customProgramCacheKey=()=>'nulab-ground-'+key;return mat;}
function nlGroundMesh(B,name,mat,over,sink,colour,holeFn){const nx=Math.round((B.x1-B.x0)/B.cell),nz=Math.round((B.z1-B.z0)/B.cell),W=B.x1-B.x0,Hh=B.z1-B.z0;
 const geo=new THREE.PlaneGeometry(W,Hh,nx,nz),p=geo.attributes.position,uv=geo.attributes.uv,cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2,hs=new Float32Array(p.count);
 const col=colour?new Float32Array(p.count*3):null,ovList=over?[].concat(over):null;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;let y=terrainH(x,z);
  if(ovList){let ds=0;for(const O of ovList)if(nlIn(O,x,z,B.cell))ds=Math.max(ds,O.sink==null?sink:O.sink);y-=ds;}
  p.setZ(i,y);hs[i]=y;
  uv.setXY(i,(x-B.x0)/W,1-(z-B.z0)/Hh);if(col){const c=colour(x,z,y);col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];}}
 if(holeFn&&geo.index){const idx=geo.index.array,keep=[];
  for(let t=0;t<idx.length;t+=3){const a=idx[t],b=idx[t+1],c=idx[t+2];
   const ax=p.getX(a)+cx,az=-p.getY(a)+cz,bx=p.getX(b)+cx,bz=-p.getY(b)+cz,cx2=p.getX(c)+cx,cz2=-p.getY(c)+cz;
   if(!holeFn(ax,az)&&!holeFn(bx,bz)&&!holeFn(cx2,cz2)&&!holeFn((ax+bx+cx2)/3,(az+bz+cz2)/3))keep.push(a,b,c);}
  geo.setIndex(keep);}
 if(col)geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.rotation.x=-Math.PI/2;m.position.set(cx,0,cz);
 m.userData.isGround=true;m.userData.ground=true;m.userData.probeSkip=true;m.name=name;scene.add(m);
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.grid({x0:B.x0,z0:B.z0,dx:W/nx,dz:Hh/nz,nx,nz,h:hs}));
 return m;}
const NL_PT=nlPainter(NL_TB);NL_PT.climate(8);nlPaintRecords(NL_PT,true);
const NL_PR=nlPainter(NL_RB);NL_PR.climate(10);nlPaintRecords(NL_PR,true);
const NL_PL=nlPainter(NL_LB);NL_PL.climate(8);nlPaintRecords(NL_PL,true);
const NL_PC=nlPainter(NL_CB);NL_PC.climate(40);nlPaintRecords(NL_PC,false);
groundM=nlGroundMesh(NL_TB,'terrain',nlGroundMat(NL_PT,'town'),null,0);
const NL_RIVERG=nlGroundMesh(NL_RB,'terrain-river',nlGroundMat(NL_PR,'river'),null,0);
const NL_LINEG=nlGroundMesh(NL_LB,'terrain-line',nlGroundMat(NL_PL,'line'),null,0,null,typeof NL_LPLAN!=='undefined'&&NL_LPLAN?NL_LPLAN.portalHole:null);
const NL_COUNTRY=nlGroundMesh(NL_CB,'terrain-country',nlGroundMat(NL_PC,'country'),[NL_TB,NL_RB,NL_LB],6);
const nlLin=c=>{const k=new THREE.Color(c).convertSRGBToLinear();return[k.r,k.g,k.b];};
const NL_FCOL={bed:nlLin(0x3c4436),plain:nlLin(0x8a8456),forest:nlLin(0x4e5c38),face:nlLin(0x7a7266),alpine:nlLin(0x7c7a5a),snow:nlLin(0xe8eaee)};
const nlMixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const nlFarColour=(x,z,y)=>{const e=500,gx=(NL_GROUND.model(x+e,z)-NL_GROUND.model(x-e,z))/(2*e),gz=(NL_GROUND.model(x,z+e)-NL_GROUND.model(x,z-e))/(2*e),sl=Math.hypot(gx,gz);
 let c=y<NL_GROUND.LAKE?NL_FCOL.bed:y<1100?NL_FCOL.plain:y<2800?NL_FCOL.forest:y<4600?NL_FCOL.alpine:NL_FCOL.snow;
 if(y>=600&&y<4600&&sl>.16)c=nlMixC(c,NL_FCOL.face,Math.min(1,(sl-.16)*2.5));return c;};
const NL_FAR=nlGroundMesh(NL_FB,'terrain-far',new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}),NL_CB,10,nlFarColour);
// ---------------------------------------------------------------- the water
const nlLinC=c=>new THREE.Color(c).convertSRGBToLinear();
const NL_LAKE=(function(){try{const W=WATER.open({name:'The great lake',level:NL_GROUND.LAKE,field:.14,bounds:[NL_FB.x0,NL_FB.z0,NL_FB.x1,NL_FB.z1],bed:terrainH,bedBox:[400,-2800,4200,400],bedCell:16});
  const D=WATER.draw(W,{renderOrder:1,roughness:.1,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,shallow:nlLinC(0x6a8264),deep:nlLinC(0x1e4048)});
  D.mesh.userData.inspectLabel='The great lake (297 m; its name is the owner\'s)';D.mesh.userData.probeSkip=true;return D;}catch(e){reportErr('lake: '+(e&&e.stack||e));return null;}})();
const NL_RIVER=(function(){const R=NL_GROUND.river,pts=R.pts.map(p=>[p[0],p[1],p[2]]);
 try{const F=WATER.flow({name:'The Chimes Riba',pts,width:R.width,speed:1.1,densify:40});
  const D=WATER.drawFlow(F,{shallow:nlLinC(0x6a8064),deep:nlLinC(0x2a4c4a),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.45,step:20,across:6,margin:6,renderOrder:2});
  if(D&&D.mesh){D.mesh.userData.inspectLabel='The Chimes Riba (r005: 943 m3/s at the outlet)';D.mesh.userData.probeSkip=true;}return {F,D,pts};}
 catch(e){reportErr('Chimes Riba: '+(e&&e.stack||e));return null;}})();
window._worldMs=Math.round(performance.now()-NL_T0);
window._nlWater={lake:!!NL_LAKE,river:!!(NL_RIVER&&NL_RIVER.D),riverPts:NL_RIVER?NL_RIVER.pts.length:0};
