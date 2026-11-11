// ================================================================= HOST — the ground
// One ground mesh over the map (480 cells a side, ~13 m) on the baked field, coloured per vertex by the zones so they read from any distance: the
// paramo's gold and olive tussock on the plateau, moss and dark loam on the face where the cloud reaches, the megabreccia's warm grey on the bare
// risers, sphagnum in the bogs, the fall-out lawns' jungle green downwind of the mouths, and the collars' wet fans dark below them. Over it the
// library's layers through core/terrain's ground shader (KGROUND): the southern highlands' moss, paramo grass and sphagnum (its pack, read in place),
// this kit's megabreccia on the rock and the thermal mat on the fans (materials.json). Without the packs (?mat=proc) the vertex colours alone.
// ?kground=0 the plain ground.
const KG_ON=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0';
const KGL=(function(){if(!KG_ON)return[];
 const L=[KGROUND.layer('shigh','ground.moss',{w:'vGL.x',amt:.55,gain:1.3,tint:'diffuse',name:'forest moss'}),
  KGROUND.layer('shigh','ground.paramo',{w:'vGL.y',amt:.5,gain:1.3,tint:'diffuse',name:'paramo grass'}),
  KGROUND.layer('shigh','ground.sphagnum',{w:'vGL.z',amt:.85,gain:1.3,tint:'diffuse',name:'sphagnum'}),
  KGROUND.layer('lung','ground.breccia',{w:'vRF.x',amt:.75,gain:1.15,tint:'diffuse',name:'megabreccia'}),
  KGROUND.layer('lung','ground.fan',{w:'vRF.y',amt:.7,gain:1.1,tint:'diffuse',name:'the collar\'s wet fan'})];
 return L.filter(Boolean);})();
const MAT_GROUND=new THREE.MeshStandardMaterial({vertexColors:true,color:0xffffff,roughness:.96,metalness:0});
MAT_GROUND.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aGL;varying vec3 vGL;attribute vec2 aRF;varying vec2 vRF;')
  .replace('#include <begin_vertex>','#include <begin_vertex>\nvGL=aGL;vRF=aRF;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vGL;varying vec2 vRF;');};
if(KG_ON&&KGL.length)KGROUND.hook(MAT_GROUND,{layers:KGL,key:'clifflung-ground'});
const GROUND=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),col=new Float32Array(nx*nx*3),gl=new Float32Array(nx*nx*3),rf=new Float32Array(nx*nx*2);
 const C=h=>new THREE.Color(h).convertSRGBToLinear(),GOLD=C(0xb89a5a),OLIVE=C(0x84834a),RUST=C(0x96683c),MOSS=C(0x6e8c34),MOSSD=C(0x445e2a),LOAM=C(0x3e3828),
  ROCK=C(0x8a7e72),ROCK2=C(0x5e5650),SPH=C(0xa0b03a),PEAT=C(0x3a2e22),LAWN=C(0x6aa83a),LAWND=C(0x8a7a40),FAN=C(0x2e3428),c=new THREE.Color(),t=new THREE.Color();
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;
  const fog=FG.fog.h(x,z),rock=FG.rock.h(x,z),bog=FG.oasis.h(x,z),lw=FG.lawn.h(x,z),n=KRAND.fbm(x*.013,.5,z*.013,2,0x84),n2=KRAND.fbm(x*.0035,.5,z*.0035,2,0x85);
  let fan=0;for(const W of WELLS){const d=Math.hypot(x-W.x,z-W.z)/(W.r*3);if(d<1)fan=Math.max(fan,(1-d)*(W.live?1:.3));}
  c.copy(GOLD).lerp(OLIVE,smooth(.42,.62,n2)*.8).lerp(RUST,smooth(.6,.75,n)*.5);
  t.copy(MOSS).lerp(MOSSD,smooth(.35,.6,n)).lerp(LOAM,smooth(.55,.75,n2)*.4);c.lerp(t,smooth(.3,.65,fog));
  t.copy(SPH).lerp(PEAT,smooth(.6,.8,n)*.5);c.lerp(t,smooth(.45,.8,bog));
  t.copy(LAWN).lerp(LAWND,smooth(.75,.35,lw));c.lerp(t,smooth(.15,.6,lw)*.85);
  t.copy(ROCK).lerp(ROCK2,smooth(.4,.7,n));c.lerp(t,smooth(.3,.7,rock));
  c.lerp(FAN,smooth(.2,.8,fan)*.8);
  const kk=.92+.16*n;col[k*3]=c.r*kk;col[k*3+1]=c.g*kk;col[k*3+2]=c.b*kk;
  const open=(1-smooth(.3,.7,rock))*(1-smooth(.45,.8,bog)),f=smooth(.32,.62,fog);gl[k*3]=f*open*(1-lw);gl[k*3+1]=(1-f)*open*(1-lw)*(1-fan);gl[k*3+2]=smooth(.45,.8,bog);
  rf[k*2]=smooth(.3,.7,rock);rf[k*2+1]=smooth(.2,.8,fan);}
 const idx=new Uint32Array(N*N*6);let q=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c2=b+1,d=a+1;idx[q++]=a;idx[q++]=b;idx[q++]=d;idx[q++]=b;idx[q++]=c2;idx[q++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,3));g.setAttribute('aRF',new THREE.BufferAttribute(rf,2));
 /* the uv the KGROUND layers do not need (they read the world position) is still asked for by three's map chunks on some drivers */
 const uv=new Float32Array(nx*nx*2);for(let k=0;k<nx*nx;k++){uv[k*2]=pos[k*3]/S+.5;uv[k*2+1]=.5-pos[k*3+2]/S;}g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The southern Inner Wall (the scarp: KRELIEF.scarp on KFIELD)';scene.add(m);return m;})();
/* the bogs and the scarp's ravines as volumes (the inspector names them; the ground is their content) */
PL.bogs.forEach((B,i)=>REGISTER({name:'A bog on the paramo',x:B.x,z:B.z,y:terrainH(B.x,B.z)-6,r:B.r,h:20}));
/* the ground is probeSkip, so a ground volume holds no sample: one probe point each, on the ground at its centre (core/host's userData.probePoints) */
const GROUND_PROBE=new THREE.Object3D();GROUND_PROBE.name='ground probe points';GROUND_PROBE.userData.probePoints=[];scene.add(GROUND_PROBE);
const probeAt=(x,z,dy)=>GROUND_PROBE.userData.probePoints.push(x,terrainH(x,z)+(dy||0),z);
PL.bogs.forEach(B=>probeAt(B.x,B.z,.5));
/* the cloud sea's volume: the deck is core/atmos's mesh (not sampled); one point in its band, at its middle */
if(STN.deck!==false)GROUND_PROBE.userData.probePoints.push(0,CLOUD_Y,rimZ(0)-SCARP.run-150);
