// ================================================================= BLAKHED — the world: the Krator sky, the painted ground, the far land, the water
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). Four ground meshes,
// each registered with core/drawn (KDRAWN) and each coarser one sunk under the finer where they overlap:
//   the town      6 km square at 10 m round the pin: the town, the Icegarth, the Ropewalk, the Fairfell, the in-field
//   the Stairhead 6 x 8 km at 12 m round the falls' lip: the Stairmen's hamlet, Dalab's toll post, the stair's head, the falls
//   the country   36 x 28 km at 50 m: the Blak Riba from 12 km above the town to the falls, the steadings, the near hamlets
//   the far land  120 km at 500 m, coloured by height and slope: the fells to 4.8 km, the rim's edge, the Rift's head 5 km down
// The near three wear canvases painted from the records (never read back): the library's sets in world metres (the Blakhed pack:
// src/89b0-bk-matlib.js) blended by three zone masks under a light tint. The water is core/water's: the Blak Riba a flow from 12 km
// above the town down the falls to their foot (white where it falls), the leat a flow, the ice ponds still water. [web]: three.js.
reseed(BK.SEED+1);const BK_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Thalaba's and Kirstabal's)
// 3,653 m, 1.01 atm: the air is Earth's sea level's, so the haze is a sea-level haze; the far land is 60 km out. An autumn morning:
// the Fair's season (PLAN.md question 6)
camera.near=.5;camera.far=90000;camera.updateProjectionMatrix();
const BK_SKY={hour:9.6,day:262,dens:1.0};
KratorSky.attach(scene,7000);scene.fog.density=.000016;
const bkHemi=scene.children.find(o=>o.isHemisphereLight);
function bkSkyTick(){KratorSky.update(camera.position,BK_SKY.hour,BK_SKY.day,BK_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(bkHemi)bkHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);scene.fog.density=.000016;renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(bkSkyTick);bkSkyTick();

// ---------------------------------------------------------------- the painter: a tint canvas and three zone masks per extent
// mask A: r flagstone (the Market, the aprons), g tilled (the fields in crop or ploughed), b dirt (the garths and made ground)
// mask B: r peat (the moor's wet hollows), g yard (the folds, the pens, the Winterings, the Fair's ground), b ruts (the roads)
// mask C: r shingle (the river's banks and bars); none the turf of the fell
const BK_EXT={town:{x0:-3000,x1:3000,z0:-3000,z1:3000,cell:10},stair:{x0:14000,x1:20000,z0:-20000,z1:-12000,cell:12},country:{x0:-14000,x1:22000,z0:-22000,z1:6000,cell:50}};
function bkPainter(E){const W=E.x1-E.x0,H=E.z1-E.z0,PX=4096/Math.max(W,H),gx=x=>(x-E.x0)*PX,gz=z=>(z-E.z0)*PX;
 const mk=()=>{const c=document.createElement('canvas');c.width=Math.ceil(W*PX);c.height=Math.ceil(H*PX);return c;};
 const P={E,W,H,PX,gx,gz,cv:mk(),ma:mk(),mb:mk(),mc:mk()};P.g=P.cv.getContext('2d');P.a=P.ma.getContext('2d');P.b=P.mb.getContext('2d');P.c=P.mc.getContext('2d');
 for(const c of[P.a,P.b,P.c]){c.fillStyle='#000';c.fillRect(0,0,P.ma.width,P.ma.height);c.globalCompositeOperation='lighter';}
 for(const c of[P.g,P.a,P.b,P.c]){c.lineCap='round';c.lineJoin='round';}
 P.g.fillStyle='#626750';P.g.fillRect(0,0,P.cv.width,P.cv.height);
 P.poly=(c,Q)=>{c.beginPath();Q.forEach((p,i)=>i?c.lineTo(gx(p[0]),gz(p[1])):c.moveTo(gx(p[0]),gz(p[1])));c.closePath();c.fill();};
 P.line=(c,Q,w)=>{c.lineWidth=Math.max(1,w*PX);c.beginPath();Q.forEach((p,i)=>i?c.lineTo(gx(p[0]),gz(p[1])):c.moveTo(gx(p[0]),gz(p[1])));c.stroke();};
 P.disc=(c,x,z,r)=>{c.beginPath();c.arc(gx(x),gz(z),Math.max(.5,r*PX),0,Math.PI*2);c.fill();};
 P.box=(c,x,z,w,d,ry)=>{const cs=Math.cos(ry||0),sn=Math.sin(ry||0),Q=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[x+a*w/2*cs+b*d/2*sn,z-a*w/2*sn+b*d/2*cs]);P.poly(c,Q);};
 P.inE=(x,z,m)=>x>E.x0-m&&x<E.x1+m&&z>E.z0-m&&z<E.z1+m;
 return P;}
const BK_COL={turf:'#626750',dirt:'#6e6555',flag:'#726d66',till:'#665848',crop:'#847e56',fallow:'#74735e',meadow:'#6e7856',peat:'#48433a',yard:'#6c6150',ruts:'#686052',shingle:'#7e7970'};
function bkPaint(P){const G=BK_GROUND,T=BK_TOWN,E=P.E;
 // the moor's wet hollows (peat), from the ground's own shape: a cell lower than its ring of neighbours 60 m out, on the gentle fell
 {const st=E.x1-E.x0>20000?200:60;for(let x=E.x0;x<E.x1;x+=st)for(let z=E.z0;z<E.z1;z+=st){const h=terrainH(x,z),r=(terrainH(x+st,z)+terrainH(x-st,z)+terrainH(x,z+st)+terrainH(x,z-st))/4;
   if(r-h>.6&&(bkHash('peat:'+x+':'+z)%3)){P.b.fillStyle='rgb(160,0,0)';P.g.fillStyle=BK_COL.peat;const R=st*(.5+(r-h)*.15);for(const c of[P.g,P.b])P.disc(c,x,z,Math.min(st*.9,R));}}}
 // the fields
 for(const f of BK_FIELDS){if(!P.inE(f.c[0],f.c[1],80))continue;const v=(bkHash(f.id)%15)-7;
  P.g.fillStyle=f.kind==='crop'?'rgb('+(132+v)+','+(126+v)+',86)':f.kind==='tilled'?'rgb('+(104+v)+','+(90+v)+','+(74+v)+')':f.kind==='fallow'?'rgb('+(116+v)+','+(115+v)+','+(94+v)+')':'rgb('+(110+v)+','+(122+v)+',86)';
  P.poly(P.g,f.poly);if(f.kind!=='meadow'){P.a.fillStyle=f.kind==='crop'?'rgb(0,200,0)':f.kind==='tilled'?'rgb(0,255,0)':'rgb(0,110,0)';P.poly(P.a,f.poly);}}
 // the town's blocks (garths: dirt and turf round the inner and middle rings; outer lobes feather organically from the plots),
 // the Market's ceremonial flagstone sanctuary & border, Dalab's paved court, the Travellers' circular greens, and the Fair's oval meadow
 for(const b of T.BLOCKS){if(b.use==='market'){
   const Wm=T.frame.W,sPoly=[Wm(-40.6,-30.6),Wm(40.6,-30.6),Wm(40.6,30.6),Wm(-40.6,30.6)];
   P.g.fillStyle='#787268';P.poly(P.g,sPoly);P.a.fillStyle='rgb(255,0,0)';P.poly(P.a,sPoly);
   /* warm dressed-flagstone sanctuary inner court + central Peace Ring round (0, 0) + cardinal processional walks */
   P.g.strokeStyle='#867e72';P.line(P.g,[Wm(-40.2,0),Wm(40.2,0)],7.6);P.line(P.g,[Wm(0,-30.2),Wm(0,30.2)],7.6);
   P.g.fillStyle='#888072';P.disc(P.g,0,0,9.2);P.g.fillStyle='#6e675c';P.disc(P.g,0,0,6.6);
   continue;}
  if(b.use==='dalab'){P.g.fillStyle='#786d5c';P.poly(P.g,b.poly);P.a.fillStyle='rgb(190,0,150)';P.poly(P.a,b.poly);continue;}
  if(b.j>=3&&b.use==='houses')continue;
  P.g.fillStyle=b.use==='folds'||b.use==='yard'?BK_COL.yard:'#686554';P.poly(P.g,b.poly);
  if(b.use==='folds'||b.use==='yard'){P.b.fillStyle='rgb(0,190,0)';P.poly(P.b,b.poly);}else{P.a.fillStyle=b.j<=1?'rgb(0,0,130)':'rgb(0,0,85)';P.poly(P.a,b.poly);}}
 for(const q of T.QUARTERS){if(q.id==='dalab'||q.id==='winterings'||q.id==='fairfell')continue;
  const yard=q.id==='tears';P.g.fillStyle=yard?BK_COL.yard:BK_COL.dirt;P.poly(P.g,q.poly);
  if(yard){P.b.fillStyle='rgb(0,170,0)';P.poly(P.b,q.poly);}else{P.a.fillStyle='rgb(0,0,200)';P.poly(P.a,q.poly);}}
 if(BK_PLAN&&BK_PLAN.camps){
  /* organic grassy halting greens round each Traveller family circle, worn circular wagon-wheel ruts, ash fire patches and pony paddocks */
  for(const cp of BK_PLAN.camps){P.g.fillStyle=BK_COL.meadow;P.disc(P.g,cp.x,cp.z,cp.R+24);
   if(cp.paddock)P.disc(P.g,cp.paddock.x,cp.paddock.z,16);}
  for(const cp of BK_PLAN.camps){
   const R0=cp.R+2.6,Q=[];for(let k=0;k<=28;k++){const a=k/28*Math.PI*2;Q.push([cp.x+Math.cos(a)*R0,cp.z+Math.sin(a)*R0]);}
   P.g.strokeStyle=BK_COL.ruts;P.line(P.g,Q,6.5);P.b.strokeStyle='rgb(0,140,220)';P.line(P.b,Q,6.5);
   P.g.fillStyle=BK_COL.dirt;P.disc(P.g,cp.x,cp.z,5.6);P.a.fillStyle='rgb(0,0,220)';P.disc(P.a,cp.x,cp.z,5.6);
   const mth=[cp.x+cp.way[0]*(cp.R+9),cp.z+cp.way[1]*(cp.R+9)];P.g.strokeStyle=BK_COL.ruts;P.line(P.g,[[cp.x+cp.way[0]*4,cp.z+cp.way[1]*4],mth],4.5);P.b.strokeStyle='rgb(0,0,220)';P.line(P.b,[[cp.x+cp.way[0]*4,cp.z+cp.way[1]*4],mth],4.5);
   if(cp.paddock){const pd=cp.paddock;P.g.fillStyle=BK_COL.yard;P.box(P.g,pd.x,pd.z,pd.w,pd.d,pd.ry);P.b.fillStyle='rgb(0,210,0)';P.box(P.b,pd.x,pd.z,pd.w,pd.d,pd.ry);}}}
 // the Fair's ground: soft trodden oval apron round the beast ring, booths and pens (no hard rectangular box)
 {const F=T.FAIR,Q=[],Q2=[];for(let k=0;k<48;k++){const a=k/48*Math.PI*2;Q.push([F.c[0]+Math.cos(a)*F.rx,F.c[1]+Math.sin(a)*F.rz]);
   Q2.push([F.c[0]+10+Math.cos(a)*(F.rx+92),F.c[1]+18+Math.sin(a)*(F.rz+78)]);}
  P.g.fillStyle=BK_COL.yard;P.poly(P.g,Q2);P.b.fillStyle='rgb(0,130,0)';P.poly(P.b,Q2);
  P.g.fillStyle=BK_COL.dirt;P.poly(P.g,Q);P.a.fillStyle='rgb(0,0,255)';P.poly(P.a,Q);}
 // every building's apron (made ground round its plot, plus a soft circular garth halo so outer houses feather organically into the fell)
 const apron=(r,m)=>{const rw=bkD(r.w,10)+m,rd=bkD(r.d,10)+m;
  if(r.quarter==='houses'){P.g.fillStyle='#686454';P.disc(P.g,r.x,r.z,Math.max(rw,rd)*.78+3);P.a.fillStyle='rgb(0,0,80)';P.disc(P.a,r.x,r.z,Math.max(rw,rd)*.72+2);}
  P.g.fillStyle=BK_COL.dirt;P.box(P.g,r.x,r.z,rw,rd,r.ry);P.a.fillStyle='rgb(0,0,150)';P.box(P.a,r.x,r.z,rw,rd,r.ry);};
 if(BK_PLAN)for(const r of BK_PLAN.records)if(P.inE(r.x,r.z,40))apron(r,r.kind==='icehouse'?10:4);
 for(const V of BK_VILLAGES)for(const r of V.records||[])if(P.inE(r.x,r.z,40))apron(r,4);
 for(const t of BK_TOLL)if(P.inE(t.x,t.z,60)){const D=VERN.defs[t.key];if(D)apron({x:t.x,z:t.z,w:D.w,d:D.d,ry:t.ry},6);}
 // the villages' lanes
 for(const V of BK_VILLAGES)for(const l of V.lanes||[]){const pts=l.pts||l;if(!Array.isArray(pts)||pts.length<2||!Array.isArray(pts[0]))continue;
  P.g.strokeStyle=BK_COL.dirt;P.line(P.g,pts,5.2);P.a.strokeStyle='rgb(0,0,120)';P.line(P.a,pts,5.2);
  P.g.strokeStyle=BK_COL.ruts;P.line(P.g,pts,3.4);P.b.strokeStyle='rgb(0,0,210)';P.line(P.b,pts,3.4);}
 // the roads and lanes at their widths (soft dusty earth shoulder under an isotropic gravelly-earth beaten crown), the stair
 for(const w of T.WAYS){const wd=T.WIDTH[w.cls]||5;
  P.g.strokeStyle=BK_COL.dirt;P.line(P.g,w.pts,wd+2.6);P.a.strokeStyle='rgb(0,0,130)';P.line(P.a,w.pts,wd+2.6);
  P.g.strokeStyle=BK_COL.ruts;P.line(P.g,w.pts,wd);P.b.strokeStyle='rgb(0,0,245)';P.line(P.b,w.pts,wd);}
 if(BK_RINGS){P.g.strokeStyle=BK_COL.ruts;P.line(P.g,BK_RINGS.stair.pts,BK_RINGS.stair.w+1);P.b.strokeStyle='rgb(0,0,255)';P.line(P.b,BK_RINGS.stair.pts,BK_RINGS.stair.w+1);}
 // the river's shingle banks, the leat's, the ponds' rims
 {const R=G.river.pts,Q=R.map(p=>[p.x,p.z]);P.g.strokeStyle=BK_COL.shingle;P.line(P.g,Q,R[0].w+10);P.c.strokeStyle='rgb(255,0,0)';P.line(P.c,Q,R[0].w+10);}
 P.g.strokeStyle=BK_COL.dirt;P.line(P.g,G.leat,5);P.a.strokeStyle='rgb(0,0,255)';P.line(P.a,G.leat,5);
 for(const p of G.ponds){P.g.fillStyle=BK_COL.shingle;P.box(P.g,p.x,p.z,p.w+8,p.d+8,p.ry);P.c.fillStyle='rgb(255,0,0)';P.box(P.c,p.x,p.z,p.w+8,p.d+8,p.ry);}}
// the ground's material: the tint as its map, the eight sets sampled in world metres by core/terrain's KGROUND (one layer each, in the
// order they were mixed: turf under all, then peat, tilled, dirt, yard, shingle, ruts, flag), blended by the three masks under the tint.
// KGROUND draws them as the page's own shader did: one scale (far off), no hex tiling, a plain mix (blend 0), three's sRGB curve, the
// ruts' turned second sample (turn). BK_KGARRAY (the owner, 2026-11-24, "put blakhed shader in core terrain"): the eight maps one
// texture array (KGROUND's array option), so the ground's program takes 5 samplers instead of 12; ?kgarray=0 draws the eight samplers
const BK_KGARRAY=true;
function bkGroundMat(P,key){const T=c=>{const t=new THREE.CanvasTexture(c);t.encoding=THREE.LinearEncoding;t.anisotropy=4;return t;};
 const tex=new THREE.CanvasTexture(P.cv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const lib=k=>{const t=MAT[k]&&MAT[k].map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.needsUpdate=true;}return t;};
 const sc=k=>{const L=KMAT.packed&&KMAT.packed('blakhed',k);return 1/(L&&L.scale?L.scale[0]:3);};
 const U={tMA:{value:T(P.ma)},tMB:{value:T(P.mb)},tMC:{value:T(P.mc)}};
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tMA,tMB,tMC;')
   .replace('#include <map_fragment>',['#ifdef USE_MAP','vec4 bkT=mapTexelToLinear(texture2D(map,vUv));vec3 mA=texture2D(tMA,vUv).rgb,mB=texture2D(tMB,vUv).rgb,mC=texture2D(tMC,vUv).rgb;',
    '/*KGROUND*/','diffuseColor.rgb*=bkT.rgb*4.6;','#endif'].join('\n'));};
 if(key==='country'){mat.polygonOffset=true;mat.polygonOffsetFactor=1;mat.polygonOffsetUnits=2;}
 mat.customProgramCacheKey=()=>'blakhed-ground-'+key;
 /* a layer of the set k at weight w (a GLSL float of the masks); the ruts mixed as before: mix(bc, mix(A, B, .45), mB.b) */
 const L=(k,w,x)=>Object.assign({map:lib(k),k:sc(k),w,lin:'srgb',name:k},x);
 KGROUND.hook(mat,{layers:[L('bkTurf','1.0'),L('bkPeat','mB.r'),L('bkTilled','mA.g'),L('bkDirt','mA.b'),L('bkYard','mB.g'),L('bkShingle','mC.r'),
   L('bkRuts','mB.b',{turn:{m:[.8,-.6,.6,.8],scale:.41,off:[.37,.71],mix:.45}}),L('bkFlag','mA.r')],
  hex:false,far:false,blend:0,array:BK_KGARRAY||null,key:'bk'});
 return mat;}
// ---------------------------------------------------------------- the meshes: a plane of the extent's cells, its heights the ground's, sunk
// `sink` m where a finer extent lies over it (a full cell inside), registered with core/drawn
const bkIn=(E,x,z,m)=>x>E.x0+m&&x<E.x1-m&&z>E.z0+m&&z<E.z1-m;
function bkGroundMesh(E,name,mat,over,sink,colour){const nx=Math.round((E.x1-E.x0)/E.cell),nz=Math.round((E.z1-E.z0)/E.cell),W=E.x1-E.x0,Hh=E.z1-E.z0;
 const geo=new THREE.PlaneGeometry(W,Hh,nx,nz),p=geo.attributes.position,uv=geo.attributes.uv,cx=(E.x0+E.x1)/2,cz=(E.z0+E.z1)/2,hs=new Float32Array(p.count);
 const col=colour?new Float32Array(p.count*3):null;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;let y=terrainH(x,z);
  /* on coarse country/far meshes (>= 25 m cells), keep straddling cells down at the riverbed so triangles never bridge dry over the water */
  if(E.cell>=25){const rn=BK_GROUND.river.near(x,z);if(rn&&rn.d<E.cell*.9+rn.w*.5)y=Math.min(y,rn.bed);}
  if(over&&over.some(O=>bkIn(O,x,z,E.cell)))y-=sink;p.setZ(i,y);hs[i]=y;
  uv.setXY(i,(x-E.x0)/W,1-(z-E.z0)/Hh);if(col){const c=colour(x,z,y);col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];}}
 if(col)geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.rotation.x=-Math.PI/2;m.position.set(cx,0,cz);m.receiveShadow=true;
 m.userData.isGround=true;m.userData.ground=true;m.userData.probeSkip=true;m.name=name;scene.add(m);
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.grid({x0:E.x0,z0:E.z0,dx:W/nx,dz:Hh/nz,nx,nz,h:hs}));
 return m;}
const BK_PT=bkPainter(BK_EXT.town);bkPaint(BK_PT);
groundM=bkGroundMesh(BK_EXT.town,'terrain',bkGroundMat(BK_PT,'town'),null,0);
const BK_PS=bkPainter(BK_EXT.stair);bkPaint(BK_PS);
const BK_STAIRG=bkGroundMesh(BK_EXT.stair,'terrain: the Stairhead',bkGroundMat(BK_PS,'stair'),null,0);
const BK_PC=bkPainter(BK_EXT.country);bkPaint(BK_PC);
const BK_COUNTRY=bkGroundMesh(BK_EXT.country,'terrain: the country',bkGroundMat(BK_PC,'country'),[BK_EXT.town,BK_EXT.stair],6);
/* the far land, coloured by height and slope: the bench's Dsb meadow, the fells' Dsc turf, the bare high fell, snow over 4.7 km; the
   rim's edge bare rock; the warm basin's green under 2.5 km */
const bkLin=c=>{const k=new THREE.Color(c).convertSRGBToLinear();return[k.r,k.g,k.b];};
const BK_FCOL={basin:bkLin(0x5c6e44),scarp:bkLin(0x625a4c),bench:bkLin(0x626750),fell:bkLin(0x5b5b4c),high:bkLin(0x74726a),snow:bkLin(0xe4e8ee),rock:bkLin(0x4c4844)};
const bkMixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const bkFarColour=(x,z,y)=>{const e=500,gx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),gz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e),sl=Math.hypot(gx,gz);
 let c=y<2500?BK_FCOL.basin:y<3300?BK_FCOL.scarp:y<3900?BK_FCOL.bench:y<4400?BK_FCOL.fell:y<4750?BK_FCOL.high:BK_FCOL.snow;
 if(sl>.16&&y<4750)c=bkMixC(c,BK_FCOL.rock,Math.min(1,(sl-.16)*3));return c;};
const BK_FAR=bkGroundMesh({x0:-60000,x1:60000,z0:-60000,z1:60000,cell:500},'terrain: the far land',new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}),[BK_EXT.country],14,bkFarColour);
BK_FAR.userData.lodSkip=true;
window._worldMs=Math.round(performance.now()-BK_T0);

// ---------------------------------------------------------------- the water (core/water; the page writes no water shader)
ATMOS.init({THREE,scene,camera,hour:()=>BK_SKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:BK.SEED+7,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const bkLinC=c=>new THREE.Color(c).convertSRGBToLinear();
const BKWATER=(function(){const out={flows:[],stills:[]};
 /* the Blak Riba: every 25 m Catmull-Rom point of the line so bends and bed knees never clip into the banks; white where it falls */
 try{const R=BK_GROUND.river.pts,P=[],Wd=[];for(let i=0;i<R.length;i++){P.push([R[i].x,R[i].z,R[i].surf]);Wd.push(R[i].w+6);}
  const S=WATER.flow({name:'The Blak Riba',pts:P,width:Wd,speed:2.2,rapids:[.02,.1],densify:25});
  const D=WATER.drawFlow(S,{shallow:bkLinC(0x6a7a72),deep:bkLinC(0x2e4448),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.45,step:16,across:6,margin:4,renderOrder:2});
  if(D.mesh.material){D.mesh.material.polygonOffset=true;D.mesh.material.polygonOffsetFactor=-1;D.mesh.material.polygonOffsetUnits=-2;}
  D.mesh.userData.inspectLabel='The Blak Riba (r116: ~31 m3/s past the town, 40 at the falls; the falls 3,070 m to 1,230 m)';D.mesh.userData.probeSkip=true;out.flows.push({S,D,n:P.length});}
 catch(e){reportErr('the Blak Riba: '+(e&&e.stack||e));}
 /* the leat to the ice ponds */
 try{const S=WATER.flow({name:'The Icegarth\'s leat',pts:BK_GROUND.leat.map(p=>[p[0],p[1],p[2]+.4]),width:2.0,speed:.6});
  const D=WATER.drawFlow(S,{shallow:bkLinC(0x6a7a6e),deep:bkLinC(0x3a4a46),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.45,step:4,across:2,margin:.2});
  if(D.mesh.material){D.mesh.material.polygonOffset=true;D.mesh.material.polygonOffsetFactor=-1;D.mesh.material.polygonOffsetUnits=-2;}
  D.mesh.userData.inspectLabel=S.name;D.mesh.userData.probeSkip=true;out.flows.push({S,D,n:BK_GROUND.leat.length});}
 catch(e){reportErr('the leat: '+(e&&e.stack||e));}
 /* the ice ponds: still water, one mesh */
 for(const p of BK_GROUND.ponds){const Q=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[p.x+p.tx*a*p.w/2+p.nx*b*p.d/2,p.z+p.tz*a*p.w/2+p.nz*b*p.d/2]);
  out.stills.push(WATER.still({name:'An ice pond of the Icegarth ('+p.id+')',level:p.level,poly:Q}));}
 const pos=[],nor=[],idx=[];
 out.stills.forEach(S=>{const o=pos.length/3,P=S.poly;for(const q of P){pos.push(q[0],S.level,q[1]);nor.push(0,1,0);}idx.push(o,o+2,o+1,o,o+3,o+2,o,o+1,o+2,o,o+2,o+3);});   /* both windings: the rectangle's turn follows the river */
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);g.computeBoundingSphere();
 const mesh=new THREE.Mesh(g,WATER.stillMaterial({color:bkLinC(0x2c4446),roughness:.06,metalness:.12,envMapIntensity:.5}));
 mesh.name='water:still';mesh.userData.probeSkip=true;mesh.userData.inspectLabel='The ice ponds (filled from the leat; cut when frozen)';mesh.renderOrder=1;scene.add(mesh);
 out.stillMesh=mesh;return out;})();
window._bkWater={flows:BKWATER.flows.length,stills:BKWATER.stills.length,riverPts:BKWATER.flows[0]?BKWATER.flows[0].n:0,leat:BK_GROUND.leat.length};
