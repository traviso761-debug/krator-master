// ================================================================= KIRSTABAL — the world: the Krator sky, the ground, the lake, Keb Riwa
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). Three ground
// meshes, each registered with core/drawn (KDRAWN) and each a step coarser and lower where the finer one lies over it: the
// town (6 m cells), the country (the ring's floor, the lake's south shore and the river's mouth: 50 m) and the far field (the
// scale model: the Lower Xanadu Lake, the scarp, the lip: 500 m). The town's and the country's wear canvases painted from the
// records (never read back) blending the library's sets in world metres; the far field is coloured by height and slope. The
// water is core/water's: the lake (WATER.open, its bed baked near the town), Keb Riwa (WATER.flow, white water down the scarp
// from the lip, the cataract, then its channel across the apron to the lake). [web]: canvas and three.js.
const KS_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
// ---------------------------------------------------------------- the reach: the scarp and the cataract stand 15-25 km off
camera.near=.8;camera.far=90000;camera.updateProjectionMatrix();
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Qiblai's and Erewhon's)
const KS_SKY={hour:9.2,day:120,dens:1.6};   /* the Rift floor's air: about 1.98 atm, hot and wet (the Rift climate) */
const ksSkyGroup=KratorSky.attach(scene,60000);ksSkyGroup.traverse(o=>{o.userData.probeSkip=true;});
scene.fog.density=.000032;   /* the Rift floor's heat haze: the scarp's face clear at 15 km, the lip softened at 25 */
const ksHemi=scene.children.find(o=>o.isHemisphereLight);
function ksSkyTick(){KratorSky.update(camera.position,KS_SKY.hour,KS_SKY.day,KS_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(ksHemi)ksHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(ksSkyTick);ksSkyTick();
// ---------------------------------------------------------------- core/atmos for the water: the clock, the wave field, the sky in the water
// (a copy of the Krator sky, given to the water only: the tuned materials stay as they are; Ys's way)
ATMOS.init({THREE,scene,camera,hour:()=>KS_SKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:41611,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const KS_SKYS=new THREE.Scene(),KS_ENV={environment:null},KS_SKYC=ksSkyGroup.clone();KS_SKYS.add(KS_SKYC);
ATMOS.hook(()=>{KS_SKYC.position.set(0,0,0);ksSkyGroup.children.forEach((o,i)=>{const c=KS_SKYC.children[i];if(!c)return;
 c.position.copy(o.position);c.quaternion.copy(o.quaternion);c.scale.copy(o.scale);c.visible=o.visible;});});
ATMOS.skylight({renderer,sky:KS_SKYS,scene:KS_ENV,ground:()=>new THREE.Color(0x3c4a32)});
// ---------------------------------------------------------------- the boxes
const KS_TB={x0:-1300,x1:1300,z0:-1300,z1:1300,cell:6},KS_RB={x0:2700,x1:7200,z0:-4300,z1:-2900,cell:10},KS_CB={x0:-12000,x1:7000,z0:-6000,z1:14000,cell:50},KS_FB={x0:-125000,x1:45000,z0:-40000,z1:40000,cell:500};
const ksIn=(B,x,z,m)=>x>B.x0+(m||0)&&x<B.x1-(m||0)&&z>B.z0+(m||0)&&z<B.z1-(m||0);
// ---------------------------------------------------------------- the paint: a tint canvas and two zone masks per box, from the records
// mask A: r cobbles (the streets), g flagstones (the avenues, the quays, the bazaar), b made ground (dirt: the yards, the roads);
// mask B: r sand (the beach, the river's banks), g tilled soil (the ring's fields). None of them: the grass
function ksPainter(B){const PX=4096/Math.max(B.x1-B.x0,B.z1-B.z0),W=Math.ceil((B.x1-B.x0)*PX),H=Math.ceil((B.z1-B.z0)*PX);
 const mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c;};
 const P={B,PX,tint:mk(),a:mk(),b:mk(),gx:x=>(x-B.x0)*PX,gz:z=>(z-B.z0)*PX};
 P.t=P.tint.getContext('2d');P.ma=P.a.getContext('2d');P.mb=P.b.getContext('2d');
 P.t.fillStyle='#7f7f7f';P.t.fillRect(0,0,W,H);P.ma.fillStyle='#000';P.ma.fillRect(0,0,W,H);P.mb.fillStyle='#000';P.mb.fillRect(0,0,W,H);
 P.poly=(c,pts)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(P.gx(p[0]),P.gz(p[1])):c.moveTo(P.gx(p[0]),P.gz(p[1])));c.closePath();};
 P.line=(c,pts,w)=>{c.lineWidth=w*PX;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(P.gx(p[0]),P.gz(p[1])):c.moveTo(P.gx(p[0]),P.gz(p[1])));c.stroke();};
 P.rect=(c,r,w,d,m)=>{const cs=Math.cos(r.ry),sn=Math.sin(r.ry),hw=w/2+(m||0),hd=d/2+(m||0);P.poly(c,[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[r.x+a*hw*cs+b*hd*sn,r.z-a*hw*sn+b*hd*cs]));};
 /* a band along the shore and the river's banks: sand, by the ground's own height (sampled on a grid, painted as cells) */
 P.sandBands=(step)=>{P.mb.fillStyle='rgb(255,0,0)';P.t.fillStyle='rgba(150,140,120,.35)';
  for(let z=B.z0;z<B.z1;z+=step)for(let x=B.x0;x<B.x1;x+=step){const cx=x+step/2,cz=z+step/2,y=KS_GROUND.h(cx,cz),rv=KS_GROUND.riverAt(cx,cz),
   bank=rv[0]<KS_GROUND.river.width/2+40&&y<rv[1]+6;if((y>-1.5&&y<3.2&&KS_GROUND.v(cx,cz)<90)||bank){P.mb.fillRect(P.gx(x),P.gz(z),step*PX+1,step*PX+1);}}};
 return P;}
/* the town's beaten ground: wider than the build zone (it was the zone until the town was tightened, 2026-11-16), so the
   gardens, the seat, the barracks and the edges of the town stand on dust, not on the lakeside's lawn */
const KS_EARTH=[[-620,20],[700,20],[700,860],[-620,860]].map(([u,v])=>KS_GROUND.at(u,v));
function ksPaintTown(P){const K=KS_PLAN;if(!K)return;const {ma,mb,t}=P;
 ksPaintClimate(P,10);P.sandBands(4);
 /* the town's made ground (the quarters inside the zone) a little dirt, the yards round every building dirt */
 ma.fillStyle='rgb(0,0,200)';P.poly(ma,KS_EARTH);ma.fill();   /* packed earth: a hot town's ground, not a lawn */t.fillStyle='rgba(140,130,118,.25)';P.poly(t,KS_EARTH);t.fill();
 /* the yards as garden plots (the owner, 2026-11-16: "Paint the yards as green garden plots"): every 3 m cell of the build zone
    that is not under a building (its footprint and a 1.2 m doorstep) or on a street, in 9 m plots of the shore frame, each by its
    hash green garden (55 %: grass, a green wash), tilled beds (30 %: the tilled soil, a darker wash) or left beaten earth */
 {const Z=KS_TOWN.ZONE,S=3,at=KS_GROUND.at,cell=[0,0,0];let ng=0,nb=0;
  const under=(x,z)=>{for(const s of KS_WAYS.query(x,z,1))if(KCITY.lib.segDist([x,z],s.a,s.b)<s.w/2+.8)return true;
   for(const p of KS_SPACE.query(x,z,1)){const D=VERN.defs[p.key];if(!D)continue;const dx=x-p.x,dz=z-p.z,c=Math.cos(p.ry),s=Math.sin(p.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;
    if(Math.abs(lx)<(D.fw||D.w)/2+1.2&&Math.abs(lz)<(D.fd||D.d)/2+1.2)return true;}return false;};
  for(let vv=Z[0][1];vv<Z[2][1];vv+=S)for(let uu=Z[0][0];uu<Z[1][0];uu+=S){const m=at(uu+S/2,vv+S/2);if(KS_GROUND.h(m[0],m[1])<1.4||!ksInWall(m[0],m[1])||under(m[0],m[1]))continue;
   const k=KRAND.unit(KRAND.cell(41627,Math.floor(uu/9),Math.floor(vv/9)));if(k>=.85)continue;
   const q=[[uu,vv],[uu+S,vv],[uu+S,vv+S],[uu,vv+S]].map(([u,v])=>at(u,v));
   ma.fillStyle='rgb(0,0,0)';P.poly(ma,q);ma.fill();   /* not dirt: grass, or the tilled soil below */
   if(k<.55){t.fillStyle='rgba(92,126,60,.32)';P.poly(t,q);t.fill();ng++;}
   else{mb.fillStyle='rgb(0,255,0)';P.poly(mb,q);mb.fill();t.fillStyle='rgba(88,70,48,.22)';P.poly(t,q);t.fill();nb++;}}
  window._ksGardens={green:ng,beds:nb,m2:(ng+nb)*S*S};}
 /* the buildings' own ground: their footprints and a 1.2 m doorstep, beaten earth (the extras, the town's own pieces, their plots) */
 ma.fillStyle='rgb(0,0,255)';for(const r of K.lots.concat(K.extra))if(r.kind!=='mole'&&r.kind!=='quay'&&r.kind!=='boat'&&r.kind!=='bridge'){
  const D=K.lots.indexOf(r)>=0&&VERN.defs[r.key];if(D){P.rect(ma,r,(D.fw||D.w)+2.4,(D.fd||D.d)+2.4,0);}else P.rect(ma,r,r.w,r.d,1);ma.fill();}
 /* the latex house's court, beaten earth */
 {const X=K.latex,c=[[X.u0,X.v0],[X.u1,X.v0],[X.u1,X.v1],[X.u0,X.v1]].map(([u,v])=>KS_GROUND.at(u,v));ma.fillStyle='rgb(0,0,255)';P.poly(ma,c);ma.fill();}
 /* the streets: the avenues in flagstone, the rest cobbled; the Strongbow road beaten earth */
 for(const w of K.ways){ma.strokeStyle=w.cls==='avenue'?'rgb(0,255,0)':'rgb(255,0,0)';P.line(ma,w.pts,w.w+.6);t.strokeStyle=w.cls==='avenue'?'#8a8680':'#86827c';P.line(t,w.pts,w.w+.6);}
 for(const w of K.roads){ma.strokeStyle='rgb(0,0,255)';P.line(ma,w.pts,w.w);}
 /* the quays' apron and the bazaar square in flagstone */
 {const H=KS_GROUND.HARBOUR,c=[[H.u0-20,-2],[H.u1+20,-2],[H.u1+20,44],[H.u0-20,44]].map(([u,v])=>KS_GROUND.at(u,v));ma.fillStyle='rgb(0,255,0)';P.poly(ma,c);ma.fill();
  const B2=K.places.bazaar,s=[[B2[0]-32,B2[1]-32],[B2[0]+32,B2[1]-32],[B2[0]+32,B2[1]+32],[B2[0]-32,B2[1]+32]].map(([u,v])=>KS_GROUND.at(u,v));P.poly(ma,s);ma.fill();}}
/* the climate on the grass (the Rift floor: 89zk's ksWet): tawny savannah inland, a deeper green by the lake, Keb Riwa and the
   scarp's foot, painted as cells on the tint */
function ksPaintClimate(P,step){const B=P.B;for(let z=B.z0;z<B.z1;z+=step)for(let x=B.x0;x<B.x1;x+=step){const w=ksWet(x+step/2,z+step/2);
 const k=Math.max(0,Math.min(1,(w-.36)/.4)),L=(a,b)=>Math.round(a+(b-a)*k);   /* .36 (inland) tawny, .76 and wetter a deep green */
 P.t.fillStyle='rgba('+L(196,78)+','+L(164,100)+','+L(84,62)+','+(.8-.3*k).toFixed(3)+')';
 P.t.fillRect(P.gx(x),P.gz(z),step*P.PX+1,step*P.PX+1);}}
function ksPaintCountry(P){const K=KS_PLAN;ksPaintClimate(P,25);P.sandBands(25);const {ma,mb}=P;
 if(K){ma.fillStyle='rgba(0,0,120,1)';P.poly(ma,KS_EARTH);ma.fill();for(const w of K.roads){ma.strokeStyle='rgb(0,0,255)';P.line(ma,w.pts,w.w);}}
 /* the ring's fields: strips round each farming village (and the ranch's paddocks), tilled, standing or fallow by their own hash,
    kept off the village's lanes and buildings, the water and the town */
 for(const f of KS_FIELDS){const b=f.box,X=P.gx(b[0]),Z=P.gz(b[1]),W2=(b[2]-b[0])*P.PX,H2=(b[3]-b[1])*P.PX;   /* 89zk's records */
  if(f.kind==='tilled'||f.kind==='crop'){mb.fillStyle=f.kind==='tilled'?'rgb(0,255,0)':'rgb(0,150,0)';mb.fillRect(X,Z,W2,H2);}
  else{P.t.fillStyle=f.kind==='fallow'?'rgba(160,150,90,.45)':'rgba(120,128,90,.3)';P.t.fillRect(X,Z,W2,H2);}}
 for(const V of KS_RINGV){ma.fillStyle='rgb(0,0,255)';for(const r of V.records||[]){P.rect(ma,r,r.w,r.d,2);ma.fill();}}}
// ---------------------------------------------------------------- the ground's material: the sets in world metres, blended by the masks
function ksGroundMat(P,key){const tex=new THREE.CanvasTexture(P.tint);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const mA=new THREE.CanvasTexture(P.a),mB=new THREE.CanvasTexture(P.b);mA.encoding=mB.encoding=THREE.LinearEncoding;
 const lib=k=>{const t=MAT[k]&&MAT[k].map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.needsUpdate=true;}return t;};
 const sc=k=>{const L=KMAT.packed&&KMAT.packed('kirstabal',k);return L&&L.scale?L.scale[0]:3;};
 const U={tGrass:{value:lib('ksGrass')},tDirt:{value:lib('ksDirt')},tCobble:{value:lib('ksCobble')},tFlag:{value:lib('ksFlag')},tSand:{value:lib('ksSand')},tTill:{value:lib('ksTilled')},
  tMA:{value:mA},tMB:{value:mB},kT:{value:new THREE.Vector4(1/sc('ksGrass'),1/sc('ksDirt'),1/sc('ksCobble'),1/sc('ksFlag'))},kT2:{value:new THREE.Vector2(1/sc('ksSand'),1/sc('ksTilled'))}};
 const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vKsW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvKsW=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vKsW;uniform sampler2D tGrass,tDirt,tCobble,tFlag,tSand,tTill,tMA,tMB;uniform vec4 kT;uniform vec2 kT2;')
   .replace('#include <map_fragment>',['#ifdef USE_MAP','vec4 ksT=mapTexelToLinear(texture2D(map,vUv));vec4 ksA=texture2D(tMA,vUv);vec4 ksB=texture2D(tMB,vUv);vec2 kw=vKsW.xz;',
    'vec3 kc=sRGBToLinear(texture2D(tGrass,kw*kT.x)).rgb;kc=mix(kc,sRGBToLinear(texture2D(tDirt,kw*kT.y)).rgb,ksA.b);',
    'kc=mix(kc,sRGBToLinear(texture2D(tSand,kw*kT2.x)).rgb,ksB.r);kc=mix(kc,sRGBToLinear(texture2D(tTill,kw*kT2.y)).rgb,ksB.g);',
    'kc=mix(kc,sRGBToLinear(texture2D(tCobble,kw*kT.z)).rgb,ksA.r);kc=mix(kc,sRGBToLinear(texture2D(tFlag,kw*kT.w)).rgb,ksA.g);',
    'diffuseColor.rgb*=kc*ksT.rgb*4.6;','#endif'].join('\n'));};
 mat.polygonOffset=true;mat.polygonOffsetFactor=key==='country'?-1:-2;mat.polygonOffsetUnits=key==='country'?-2:-4;   /* the finer ground in front where the meshes meet */
 mat.customProgramCacheKey=()=>'kirstabal-ground-'+key;return mat;}
// ---------------------------------------------------------------- the three meshes: a plane of B's cells, its heights the ground's, lowered
// `sink` m where a finer box lies over it (its rim left on the ground, so the two meet), registered with core/drawn
function ksGroundMesh(B,name,mat,over,sink,colour){const nx=Math.round((B.x1-B.x0)/B.cell),nz=Math.round((B.z1-B.z0)/B.cell),W=B.x1-B.x0,Hh=B.z1-B.z0;
 const geo=new THREE.PlaneGeometry(W,Hh,nx,nz),p=geo.attributes.position,uv=geo.attributes.uv,cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2,hs=new Float32Array(p.count);
 const col=colour?new Float32Array(p.count*3):null;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;let y=terrainH(x,z);if(over&&[].concat(over).some(O=>ksIn(O,x,z,B.cell)))y-=sink;   /* a full cell inside the finer box: no dip at its rim */p.setZ(i,y);hs[i]=y;
  uv.setXY(i,(x-B.x0)/W,1-(z-B.z0)/Hh);if(col){const c=colour(x,z,y);col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];}}
 if(col)geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.rotation.x=-Math.PI/2;m.position.set(cx,0,cz);
 m.userData.isGround=true;m.userData.ground=true;m.userData.probeSkip=true;m.name=name;scene.add(m);
 /* core/drawn: the plane's vertex heights, row by row along +z (three's PlaneGeometry order: its first row is the north edge) */
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.grid({x0:B.x0,z0:B.z0,dx:W/nx,dz:Hh/nz,nx,nz,h:hs}));
 return m;}
const KS_PT=ksPainter(KS_TB);ksPaintTown(KS_PT);
const KS_PC=ksPainter(KS_CB);ksPaintCountry(KS_PC);
groundM=ksGroundMesh(KS_TB,'terrain',ksGroundMat(KS_PT,'town'),null,0);
/* Keb Riwa's last 4 km, its mouth and the bridge (the channel is 135 m: the country's 50 m cells would bridge it) */
const KS_PR=ksPainter(KS_RB);ksPaintClimate(KS_PR,10);KS_PR.sandBands(6);{const K=KS_PLAN;if(K)for(const w of K.roads){KS_PR.ma.strokeStyle='rgb(0,0,255)';KS_PR.line(KS_PR.ma,w.pts,w.w);}}
const KS_RIVERG=ksGroundMesh(KS_RB,'terrain-river',ksGroundMat(KS_PR,'river'),null,0);
const KS_COUNTRY=ksGroundMesh(KS_CB,'terrain-country',ksGroundMat(KS_PC,'country'),[KS_TB,KS_RB],8);   /* well under: its 50 m cells bridge the river's 5 m-deep channel */
/* the far field, coloured by height and slope: the lake's bed, the Af floor, the forested scarp (Cfa, 1,100-1,500 mm), the bare
   upper face and the lip's grass (Cfb) */
const ksLin=c=>{const k=new THREE.Color(c).convertSRGBToLinear();return[k.r,k.g,k.b];};
const KS_FCOL={bed:ksLin(0x40463a),floor:ksLin(0x6f7a4c),forest:ksLin(0x4c5c36),face:ksLin(0x8a7a62),lip:ksLin(0x80845a)};
const ksMixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const ksFarColour=(x,z,y)=>{const e=400,gx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),gz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e),sl=Math.hypot(gx,gz);
 let c=y<0?KS_FCOL.bed:y<120?KS_FCOL.floor:y<2400?KS_FCOL.forest:KS_FCOL.lip;if(y>=120&&y<2400&&sl>.18)c=ksMixC(c,KS_FCOL.face,Math.min(1,(sl-.18)*3));return c;};
const KS_FAR=ksGroundMesh(KS_FB,'terrain-far',new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}),KS_CB,12,ksFarColour);
// ---------------------------------------------------------------- the water
const ksLinC=c=>new THREE.Color(c).convertSRGBToLinear();
/* the Lower Xanadu Lake: fresh, warm and green-brown at the river's mouth, its bed baked round the town (still water, no surf) */
const KS_LAKE=(function(){try{const W=WATER.open({name:'The Lower Xanadu Lake',level:0,field:.12,bounds:[KS_FB.x0,KS_FB.z0,KS_FB.x1,KS_FB.z1],bed:terrainH,bedBox:[-3200,-4600,2600,2600],bedCell:16});
  const D=WATER.draw(W,{renderOrder:1,roughness:.1,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,shallow:ksLinC(0x6a8064),deep:ksLinC(0x22484a)});
  D.mesh.userData.inspectLabel='The Lower Xanadu Lake';D.mesh.userData.probeSkip=true;return D;}catch(e){reportErr('lake: '+(e&&e.stack||e));return null;}})();
/* Keb Riwa: from the lip (the cataract: about 1,080 m down the scarp in 8 km, white all the way) to its mouth; the scarp's part on
   the model's ground (just over it: the far field has no channel), then the channel KS_GROUND cuts across the apron */
const KS_RIVER=(function(){const G=KS_GROUND,up=[[1000.5,1598],[999.5,1597.6],[998.5,1597.2],[997.5,1596.8],[996.5,1596.5],[995.6,1596.9],[994.8,1597.3],[993.9,1597.7]]
  .map(([px,py])=>{const [x,z]=G.fromPx(px,py);return[x,z,G.model(x,z)+1.2];});
 for(let i=1;i<up.length;i++)up[i][2]=Math.min(up[i][2],up[i-1][2]);
 const pts=up.concat(G.river.pts.map(p=>[p[0],p[1],p[2]])),n=pts.length,width=pts.map((p,i)=>i<up.length?55+40*i/up.length:G.river.width);
 try{const F=WATER.flow({name:'Keb Riwa',pts,width,speed:2.4,rapids:[.01,.07],densify:40});
  const D=WATER.drawFlow(F,{shallow:ksLinC(0x7a8a6c),deep:ksLinC(0x3a5a50),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.45,step:20,across:6,margin:6,renderOrder:2});
  if(D&&D.mesh){D.mesh.userData.inspectLabel='Keb Riwa (r107: 780 m3/s; the cataract down the scarp)';D.mesh.userData.probeSkip=true;}return {F,D,pts};}
 catch(e){reportErr('Keb Riwa: '+(e&&e.stack||e));return null;}})();
window._worldMs=Math.round(performance.now()-KS_T0);
window._ksWater={lake:!!KS_LAKE,river:!!(KS_RIVER&&KS_RIVER.D),riverPts:KS_RIVER?KS_RIVER.pts.length:0};
