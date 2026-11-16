// ================================================================= HOST — the land: the height, the water's levels, the fields, the binding, the ground
// The same fragment for every station: 45 (the stage) says what the station is in STAGE (its ground function in coast
// coordinates, its fields, its sea or its stream, its works, its LOD spine); this fragment makes terrainH and waterH, the
// fields every kit on the page reads, the masks the build swaps per kit (88), binds the biome core, and draws the ground
// and the far country. The sea and the stream are drawn on core/water in 89w-host-water.js.
const SR=STAGE.R;
// ---------------------------------------------------------------- the height and the water's levels
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=STAGE.ground(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
const SEA=STAGE.sea||null,STREAM=STAGE.stream||null;
// the stream (an inland station's): a polyline [[x,z],...] down the slope, its bed the ground and its water depth over it
const streamD=STREAM?(x,z)=>{let m=1e9;const P=STREAM.pts;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz;
 const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),ex=a[0]+dx*t-x,ez=a[1]+dz*t-z;m=Math.min(m,Math.hypot(ex,ez));}return m;}:()=>1e9;
const HARB=STAGE.harbour||null,LAGOON=STAGE.lagoon||null;
function waterH(x,z){if(SEA&&STAGE.coastD(x,z)<6)return SEA.level;if(HARB&&HARB.at(x,z))return HARB.level;if(LAGOON&&LAGOON.at(x,z))return LAGOON.level;if(STREAM&&streamD(x,z)<STREAM.w*1.2)return terrainH(x,z)+STREAM.depth;return -1e9;}

// ---------------------------------------------------------------- the fields (BIOME-API.md): the kit's own and the ones the native forest reads
// The native forest's (biomes/nwlowlands: wet, tropic, dry, flow, upland) are set from the station's say so its zones fall
// where the land holds: wet and warm where the station's natives stand, nothing anywhere else (its mask keeps it there too).
const F=STAGE.fields,NAT=STAGE.natives||{tropic:.6};
const flowAt=STREAM?(x,z)=>smooth(STREAM.w+30,STREAM.w+2,streamD(x,z)):(x,z)=>0;
const FIELD={
 spray:F.spray,invade:F.invade,front:F.front,native:F.native,sand:F.sand,coral:F.coral,rock:F.rock,strand:F.strand,graze:F.graze,burn:F.burn,
 fog:F.fog,outrider:F.outrider||((x,z)=>0),upland:F.upland,flow:flowAt,
 bench:F.bench||((x,z)=>0),trim:F.trim||((x,z)=>0),city:F.city||((x,z)=>0),
 wet:(x,z)=>.9+.1*flowAt(x,z),salt:(x,z)=>clamp(F.spray(x,z)*.8,0,1),mist:(x,z)=>F.fog(x,z),
 tropic:(x,z)=>NAT.tropic==null?.6:(typeof NAT.tropic==='function'?NAT.tropic(x,z):NAT.tropic),dry:(x,z)=>0,cold:(x,z)=>0};
// ---------------------------------------------------------------- the masks (swapped per kit by the build, 88)
const OBSTACLES=[];
const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
// the native forest: where the station's natives stand, never on the coral, the sand, the bare rock or the burn, thin in the dead belt
const nativeMask=(x,z)=>{const n=F.native(x,z);if(n<=0)return 0;return n*waterMask(x,z)*(1-F.coral(x,z))*(1-F.sand(x,z))*(1-F.rock(x,z))*(1-F.burn(x,z))*(1-.7*F.front(x,z));};
let MASK=waterMask;
const SPINE=STAGE.spine.map(p=>STAGE.XZ(p[0],p[1]));
BIO.init({tags:'farside',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:STAGE.seed,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 eye:()=>[camera.position.x,camera.position.y,camera.position.z],
 lod:{hero:520,mid:1100,far:2600,floor:[300,700]}});
BIO.setSun(SUN_POS);
// the station's say, through the host for the kit (BIOME-API.md): the wind's direction (the onshore north-wester, down u)
BIO.host.farside={wind:[SQ,SQ],coastD:STAGE.coastD||null,station:STAGE.key};
_mark('binding');

// ---------------------------------------------------------------- the library layers (or procedural without the pack)
// the ground's eight layers: the forest floor under everything, then sand, wrack, coral, wet rock, burn and turf by weight, and the
// tsunami's scour bench over the rock (ground.bench, delivered 2026-11-10: its weight FIELD.bench times the rock's)
const LAYER_KEYS=['ground.floor','ground.sand','ground.wrack','ground.coral','ground.rock','ground.burn','ground.turf','ground.bench'];
const LIBG=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return {};const o={};
 LAYER_KEYS.forEach(k=>{const P=KMAT.packed('farside',k);if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
const greyTex=(fn,col)=>BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data,c=new THREE.Color(col);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=clamp(fn(x,y),0,255)/200;d[i]=clamp(c.r*255*v,0,255);d[i+1]=clamp(c.g*255*v,0,255);d[i+2]=clamp(c.b*255*v,0,255);d[i+3]=255;}g.putImageData(id,0,0);});
const _h3=BIO.fn.h3;
const PROC={
 'ground.floor':[greyTex((x,y)=>190+50*(fbm(x/7,y/7,3,2)-.5)+30*(_h3(x,y,4)-.5),0x4e4630),3],
 'ground.sand':[greyTex((x,y)=>200+20*(fbm(x/5,y/5,8,2)-.5)+30*(_h3(x,y,9)-.5),0xb8a888),2],
 'ground.wrack':[greyTex((x,y)=>170+60*(fbm(x/4,y/4,21,3)-.5)+20*(_h3(x,y,22)-.5),0x4a4220),1.5],
 'ground.coral':[greyTex((x,y)=>210+30*(fbm(x/6,y/6,23,3)-.5)-40*smooth(.6,.7,fbm(x/3,y/3,24,2)),0xe4ddd2),2],
 'ground.rock':[greyTex((x,y)=>160+40*(fbm(x/9,y/9,25,3)-.5)+30*(_h3(x,y,26)-.5),0x34363a),4],
 'ground.burn':[greyTex((x,y)=>150+50*(fbm(x/6,y/6,27,2)-.5)+30*(_h3(x,y,28)-.5),0x2e2a26),2.5],
 'ground.turf':[greyTex((x,y)=>200+40*(fbm(x/4,y/4,29,2)-.5)+30*(_h3(x,y,30)-.5),0x5a6a34),1.8],
 'ground.bench':[greyTex((x,y)=>190+30*(fbm(x/12,y/3,31,3)-.5)+20*(_h3(x,y,32)-.5),0x9a968c),3]};
const layer=k=>LIBG[k]?{map:LIBG[k].map,s:LIBG[k].scale,lib:true}:{map:PROC[k][0],s:PROC[k][1],lib:false};
const LAYERS=LAYER_KEYS.map(layer);LAYERS.forEach(L=>{L.map.wrapS=L.map.wrapT=THREE.RepeatWrapping;});

// ---------------------------------------------------------------- the ground (one mesh: eight layers by vertex weight, tinted)
// DITHERED SAMPLING (the owner, 2026-10-26: "ground needs dithering for most textures"): Korona's hex-cell bomb (biomes/korona,
// 47-host-land.js, the owner's 2026-10-19 rulings), copied whole: the plane is cut into triangles ~2 tiles across, each corner
// turns and shifts the tile by its own hash and a point blends the three corners' reads (weights cubed: no ghosting), at the
// map's scale and again at a third of it mixed by a value noise, and a coarse mottle (kmacro) over the lot for the ground's own
// light and dark. Every layer but the wet rock is read this way; the rock keeps its strata level (kditherW: the shift, a few
// degrees of turn). A layer is read only where its weight is above 0.004. GLSL ES 1.0; the hash is Hoskins' fract hash.
// (Core since 2026-10-26: core/biome/31-core-dither.js, BIO.DITHER, the same text; build.py lists it.)
const GDITHER=BIO.DITHER;   /* the hex-cell bomb, now core/biome/31-core-dither.js (X4, 2026-10-26): the same text, one copy */
const GROUND_MAT=new THREE.MeshLambertMaterial({vertexColors:true,color:0xffffff});
// THE LAYERS ON KGROUND (core/terrain 43; BACKPORT.md's ground row, the final rebuild, pair 10, 2026-11-04): the seven library layers
// in the same order with the same weights (the floor under everything, then turf, burn, coral, sand, wrack, the wet rock), hex-tiled,
// scaled with distance and blended by height in place of the hex-cell bomb; the sand is KGROUND's 'sand' kind (BACKPORT.md's row,
// "sand on the strand": wind ripples across the onshore north-wester, glints of single grains). The coarse mottle (kmacro, from
// BIO.DITHER) stays over the lot. All or none: a page missing a layer's set keeps the old bomb whole. ?kground=0 for the old one.
// The eighth, the scour bench (2026-11-10), lies last over the wet rock; its grooves turn with the hex tiles (KGROUND's rot .6), not one way
const USE_KG=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0';
const KG_LAYERS=USE_KG?[['floor','1.0'],['turf','vW1.y'],['burn','vW1.x'],['coral','vW0.z'],['sand','vW0.x',{kind:'sand',ripple:.11,wind:[Math.SQRT1_2,Math.SQRT1_2],seed:311,crest:.1,glintDensity:.12}],['wrack','vW0.y'],['rock','vW0.w'],['bench','vW1.z']]
 .map(L=>KGROUND.layer('farside','ground.'+L[0],Object.assign({w:L[1],amt:1,gain:1,name:L[0]},L[2]||{}))):[];
const KG_ON=KG_LAYERS.length===8&&KG_LAYERS.every(Boolean);
GROUND_MAT.onBeforeCompile=sh=>{
 const sc=LAYERS.map(L=>L.s.toFixed(3)),rd=(i,w)=>(w?'if('+w+'>0.004)':'')+'{vec3 t=pow(kdither'+(i===4?'W':'')+'(uL'+i+',p/'+sc[i]+').rgb,vec3(2.2));g=mix(g,t,'+(w||'1.0')+');}';
 if(!KG_ON)LAYERS.forEach((L,i)=>{sh.uniforms['uL'+i]={value:L.map};});
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW0;attribute vec3 aW1;varying vec4 vW0;varying vec3 vW1;varying vec3 vGWP;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvW0=aW0;vW1=aW1;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+(KG_ON?'':LAYERS.map((L,i)=>'uniform sampler2D uL'+i+';').join(''))+'varying vec4 vW0;varying vec3 vW1;varying vec3 vGWP;\n'+GDITHER)
  .replace('#include <map_fragment>',KG_ON?'diffuseColor.rgb=vec3(0.18);\n/*KGROUND*/\ndiffuseColor.rgb*=kmacro(vGWP.xz);':['{vec2 p=vGWP.xz;vec3 g=vec3(0.0);',
   rd(0,null),rd(6,'vW1.y'),rd(5,'vW1.x'),rd(3,'vW0.z'),rd(1,'vW0.x'),rd(2,'vW0.y'),rd(4,'vW0.w'),rd(7,'vW1.z'),
   'diffuseColor.rgb*=g*kmacro(p);}'].join('\n'));};   /* the layers are sRGB: decoded per read (a raw sampler skips three's decode) */
GROUND_MAT.customProgramCacheKey=()=>'farside-ground-'+(KG_ON?'kground':'dither');
if(KG_ON)KGROUND.hook(GROUND_MAT,{key:'farside-ground',at:'/*KGROUND*/',layers:KG_LAYERS});
window._kground=KG_ON?KG_LAYERS.map(L=>L.name):null;
const GROUND=(function(){const S=SR*2.2,N=STAGE.groundN||480,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,n=p.count,w0=new Float32Array(n*4),w1=new Float32Array(n*3),col=new Float32Array(n*3),c=new THREE.Color(),OL=new THREE.Color(0x8a8c50),DULL=new THREE.Color(0x9a9a78),SALT=new THREE.Color(0xd8d6cc);   /* SALT: the bench's salt-bleached bedrock */
 for(let i=0;i<n;i++){const x=p.getX(i),z=p.getZ(i),y=terrainH(x,z);p.setY(i,y);
  const sand=F.sand(x,z),coral=F.coral(x,z),rock=F.rock(x,z),strand=F.strand(x,z),inv=F.invade(x,z),burn=F.burn(x,z),graze=F.graze(x,z),fr=F.front(x,z),bench=FIELD.bench(x,z);
  // wrack: the strand's wrack line, and the kelp coast's floor (the fall of blades and wrack under the stands), thinner where grazed
  const wr=clamp(Math.max(strand*.95,inv*(1-sand)*(1-coral)*(.74+.26*fbm(x*.02,z*.02,411,2))*(1-graze*.7)),0,1);
  w0[i*4]=sand;w0[i*4+1]=wr*(1-rock);w0[i*4+2]=coral;w0[i*4+3]=rock;
  w1[i*3]=burn;w1[i*3+1]=clamp(graze*(1-sand)*(1-coral)*.65,0,1);w1[i*3+2]=clamp(bench*rock,0,1);
  // the tint: the wet shine under the sea's flora (olive), a whitewash on the cove's terraces (the harbour's own lime), under water darker;
  // the bench's salt-white only without its set (the set is salt-bleached itself)
  c.setRGB(1,1,1).lerp(OL,inv*(1-sand)*(1-coral)*(1-bench*.6)*.4).lerp(DULL,graze*.45).lerp(SALT,bench*rock*(LAYERS[7].lib?0:.55)).multiplyScalar(1-.3*F.native(x,z));if(y<0)c.multiplyScalar(.7);
  c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('aW0',new THREE.BufferAttribute(w0,4));g.setAttribute('aW1',new THREE.BufferAttribute(w1,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
 g.computeVertexNormals();const m=new THREE.Mesh(g,GROUND_MAT);m.userData.probeSkip=true;m.userData.host=true;m.userData.inspectLabel=STAGE.name+': the ground';scene.add(m);return m;})();
_mark('ground');
// ---------------------------------------------------------------- the far country
// The coast carried on beyond the page and the land climbing to the outer wall's foothills (STAGE.farLift). The final rebuild (pair 10;
// BACKPORT.md's ground row): core/terrain's far field (KFAR), a lattice from the ground's square out to 14 km, its colour the
// same as before (the forest, the kelp, the rock, the snow, the sand, the sea's bed); inside the page it lies under the fine mesh (the
// lowest ground of its cell, two metres down). KHORIZON is baked over the square with the lattice past it: the far heights' and the
// bluffs' shadows on the ground and, after the bake (88), on the flora. ?far=0 the old 20 km plane, ?hz=0 no horizon.
const FARC=(function(){const FOREST=new THREE.Color(0x3e4a2c),KELP=new THREE.Color(0x5e5426),ROCK=new THREE.Color(0x6a6c6a),SNOWC=new THREE.Color(0xc8ccd0),SANDC=new THREE.Color(0xa8987a),BED=new THREE.Color(0x4a5a58),c=new THREE.Color();
 return (x,z,y)=>{const n=fbm(x*.001,z*.001,412,2)-.5,inv=F.invade(x,z),nat=F.native(x,z);
  c.copy(FOREST).lerp(KELP,clamp(inv*(1-nat),0,1)*.8).lerp(ROCK,smooth(1400,2600,y)).lerp(SNOWC,smooth(2900,3600,y)).lerp(SANDC,smooth(3,.5,y)*smooth(-2,0,y)).lerp(BED,smooth(0,-6,y));
  c.multiplyScalar(1+n*.18).convertSRGBToLinear();return [c.r,c.g,c.b];};})();
const farH=(x,z)=>terrainH(x,z)+(STAGE.farLift?STAGE.farLift(x,z):0);
const FAR=(function(){const Q=new URLSearchParams(location.search);
 if(typeof KFAR!=='undefined'&&Q.get('far')!=='0'){
  const S0=SR*1.1,ROUT=14000,cs=40;
  const G=KFAR.grid({lines:KFAR.lines({cell:cs,inner:S0+cs,out:ROUT,grow:1.035}),dense:true,
   h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0){let lo=terrainH(x,z);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)lo=Math.min(lo,terrainH(x+a*cs*.5,z+b*cs*.5));return lo-2;}return farH(x,z);},
   skip:(x0,z0,x1,z1)=>x0>-S0+80&&x1<S0-80&&z0>-S0+80&&z1<S0-80,   /* none under the ground's square */
   color:(x,z,y)=>FARC(x,z,y)});
  const mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'farside-far';
  const m=new THREE.Mesh(KFAR.geometry(G),mat);m.userData.probeSkip=true;m.userData.host=true;m.userData.farField=true;m.frustumCulled=false;
  m.userData.inspectLabel='The far country (the coast, the outer wall\'s foothills)';scene.add(m);m.userData.G=G;window._far={kfar:true,tris:G.count.tris};return m;}
 const S=20000,N=220,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,col=new Float32Array(p.count*3),NEAR=SR*1.1,cs=S/N;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),inside=Math.max(Math.abs(x),Math.abs(z))<NEAR;let y;
  if(inside){let lo=terrainH(x,z);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)lo=Math.min(lo,terrainH(x+a*cs*.5,z+b*cs*.5));y=lo-2;}
  else y=farH(x,z);
  p.setY(i,y);const k=FARC(x,z,y);col[i*3]=k[0];col[i*3+1]=k[1];col[i*3+2]=k[2];}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.userData.probeSkip=true;m.userData.host=true;m.userData.farField=true;m.userData.inspectLabel='The far country (the coast, the outer wall\'s foothills)';scene.add(m);window._far={kfar:false};return m;})();
// THE TERRAIN'S HORIZON (core/terrain 45): eight directions over the ground's square (256 a side, ~15 m) and the far heights past it
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=SR*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,far:{h:farH,box:[-14000,-14000,14000,14000],n:200}});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(GROUND_MAT,H);return H;})();
_mark('far');
// ---------------------------------------------------------------- the tsunami's reach (a coast station on map 5.1; ?tsunami=0 none)
// DATA.tsunami_farside: the run-up ceiling (100 m) and the scour bench's top (65 m), drawn as two ribbons lying on the ground where it
// first stands at those heights inland of the shore (STAGE.tsunami.contour; broken where the harbour's valley runs inland): the run-up
// line red, the bench's line amber. A layer of its own in the panel ('the tsunami's reach'); the stones on the line are works (86).
const TSU_LINES=(function(){const T=STAGE.tsunami;if(!T||!T.contour||new URLSearchParams(location.search).get('tsunami')==='0')return null;
 const grp=new THREE.Group();grp.userData.host=true;grp.userData.tsunami=true;
 const line=(hh,col,w)=>{const segs=[];let cur=[];for(let v=T.along[0];v<=T.along[1];v+=8){const u=T.contour(v,hh);
   if(u==null||(cur.length&&Math.abs(u-cur[cur.length-1][0])>40)){if(cur.length>1)segs.push(cur);cur=[];if(u==null)continue;}cur.push([u,v]);}
  if(cur.length>1)segs.push(cur);const pos=[],idx=[];
  segs.forEach(sg=>{const b=pos.length/3;sg.forEach(([u,v],k)=>{const a=STAGE.XZ(u,v-w/2),c2=STAGE.XZ(u,v+w/2),e=STAGE.XZ(u-w/2,v),f=STAGE.XZ(u+w/2,v);
    /* a ribbon across the slope (along u), lying on the ground a little over it */
    pos.push(e[0],terrainH(e[0],e[1])+.35,e[1],f[0],terrainH(f[0],f[1])+.35,f[1]);if(k)idx.push(b+2*k-2,b+2*k-1,b+2*k,b+2*k-1,b+2*k+1,b+2*k);});});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.75,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,fog:true}));
  m.renderOrder=3;m.userData.probeSkip=true;m.userData.host=true;m.userData.tsunami=true;m.userData.inspectLabel=hh===T.runup?'The tsunami\'s run-up ceiling ('+hh+' m: DATA.tsunami_farside)':'The scour bench\'s top ('+hh+' m)';grp.add(m);return segs.reduce((a,s)=>a+s.length,0);};
 const n1=line(T.runup,0xd2402c,3.2),n2=line(T.bench,0xe0a030,2.2);scene.add(grp);window._tsunami={runup:T.runup,bench:T.bench,pts:[n1,n2]};return grp;})();
