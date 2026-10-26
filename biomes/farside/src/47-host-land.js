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
function waterH(x,z){if(SEA&&STAGE.coastD(x,z)<6)return SEA.level;if(STREAM&&streamD(x,z)<STREAM.w*1.2)return terrainH(x,z)+STREAM.depth;return -1e9;}

// ---------------------------------------------------------------- the fields (BIOME-API.md): the kit's own and the ones the native forest reads
// The native forest's (biomes/nwlowlands: wet, tropic, dry, flow, upland) are set from the station's say so its zones fall
// where the land holds: wet and warm where the station's natives stand, nothing anywhere else (its mask keeps it there too).
const F=STAGE.fields,NAT=STAGE.natives||{tropic:.6};
const flowAt=STREAM?(x,z)=>smooth(STREAM.w+30,STREAM.w+2,streamD(x,z)):(x,z)=>0;
const FIELD={
 spray:F.spray,invade:F.invade,front:F.front,native:F.native,sand:F.sand,coral:F.coral,rock:F.rock,strand:F.strand,graze:F.graze,burn:F.burn,
 fog:F.fog,outrider:F.outrider||((x,z)=>0),upland:F.upland,flow:flowAt,
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
// the ground's seven layers: the forest floor under everything, then sand, wrack, coral, wet rock, burn and turf by weight
const LAYER_KEYS=['ground.floor','ground.sand','ground.wrack','ground.coral','ground.rock','ground.burn','ground.turf'];
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
 'ground.turf':[greyTex((x,y)=>200+40*(fbm(x/4,y/4,29,2)-.5)+30*(_h3(x,y,30)-.5),0x5a6a34),1.8]};
const layer=k=>LIBG[k]?{map:LIBG[k].map,s:LIBG[k].scale,lib:true}:{map:PROC[k][0],s:PROC[k][1],lib:false};
const LAYERS=LAYER_KEYS.map(layer);LAYERS.forEach(L=>{L.map.wrapS=L.map.wrapT=THREE.RepeatWrapping;});

// ---------------------------------------------------------------- the ground (one mesh: seven layers by vertex weight, tinted)
// DITHERED SAMPLING (Korona's lesson: a library tile repeats visibly over a slope): each layer is read twice, at its scale and
// at 0.37 of it turned, and the two blended by a slow noise, so no tile's repeat reads at a distance.
const GROUND_MAT=new THREE.MeshLambertMaterial({vertexColors:true,color:0xffffff});
GROUND_MAT.onBeforeCompile=sh=>{
 LAYERS.forEach((L,i)=>{sh.uniforms['uL'+i]={value:L.map};});
 const sc=LAYERS.map(L=>(1/L.s).toFixed(4));
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW0;attribute vec2 aW1;varying vec4 vW0;varying vec2 vW1;varying vec3 vGWP;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvW0=aW0;vW1=aW1;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+LAYERS.map((L,i)=>'uniform sampler2D uL'+i+';').join('')+'varying vec4 vW0;varying vec2 vW1;varying vec3 vGWP;\n'+
  'vec3 gS(sampler2D t,float s,float k){vec2 p=vGWP.xz*s;vec2 q=mat2(0.8,-0.6,0.6,0.8)*p*0.37+0.31;return mix(texture2D(t,p).rgb,texture2D(t,q).rgb,k);}')
  .replace('#include <map_fragment>','{float k=clamp(0.5+0.9*(sin(vGWP.x*0.013+cos(vGWP.z*0.011)*1.7)*cos(vGWP.z*0.017-vGWP.x*0.004)),0.0,1.0)*0.55;\n'+
   'vec3 g=gS(uL0,'+sc[0]+',k);g=mix(g,gS(uL6,'+sc[6]+',k),vW1.y);g=mix(g,gS(uL5,'+sc[5]+',k),vW1.x);g=mix(g,gS(uL3,'+sc[3]+',k),vW0.z);'+
   'g=mix(g,gS(uL1,'+sc[1]+',k),vW0.x);g=mix(g,gS(uL2,'+sc[2]+',k),vW0.y);g=mix(g,gS(uL4,'+sc[4]+',k),vW0.w);diffuseColor.rgb*=pow(g,vec3(2.2));}');};   /* the layers are sRGB: decoded here (a raw sampler skips three's decode) */
GROUND_MAT.customProgramCacheKey=()=>'farside-ground';
const GROUND=(function(){const S=SR*2.2,N=STAGE.groundN||480,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,n=p.count,w0=new Float32Array(n*4),w1=new Float32Array(n*2),col=new Float32Array(n*3),c=new THREE.Color(),OL=new THREE.Color(0x8a8c50),DULL=new THREE.Color(0x9a9a78);
 for(let i=0;i<n;i++){const x=p.getX(i),z=p.getZ(i),y=terrainH(x,z);p.setY(i,y);
  const sand=F.sand(x,z),coral=F.coral(x,z),rock=F.rock(x,z),strand=F.strand(x,z),inv=F.invade(x,z),burn=F.burn(x,z),graze=F.graze(x,z),fr=F.front(x,z);
  // wrack: the strand's wrack line, and the kelp coast's floor (the fall of blades and wrack under the stands), thinner where grazed
  const wr=clamp(Math.max(strand*.95,inv*(1-sand)*(1-coral)*(.74+.26*fbm(x*.02,z*.02,411,2))*(1-graze*.7)),0,1);
  w0[i*4]=sand;w0[i*4+1]=wr*(1-rock);w0[i*4+2]=coral;w0[i*4+3]=rock;
  w1[i*2]=burn;w1[i*2+1]=clamp(graze*(1-sand)*(1-coral)*.65,0,1);
  // the tint: the wet shine under the sea's flora (olive), a whitewash on the cove's terraces (the harbour's own lime), under water darker
  c.setRGB(1,1,1).lerp(OL,inv*(1-sand)*(1-coral)*.4).lerp(DULL,graze*.45).multiplyScalar(1-.3*F.native(x,z));if(y<0)c.multiplyScalar(.7);
  c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('aW0',new THREE.BufferAttribute(w0,4));g.setAttribute('aW1',new THREE.BufferAttribute(w1,2));g.setAttribute('color',new THREE.BufferAttribute(col,3));
 g.computeVertexNormals();const m=new THREE.Mesh(g,GROUND_MAT);m.userData.probeSkip=true;m.userData.host=true;m.userData.inspectLabel=STAGE.name+': the ground';scene.add(m);return m;})();
_mark('ground');
// ---------------------------------------------------------------- the far country
// A coarse second terrain, 20 km across, carrying the coast on beyond the page and the land climbing to the outer wall's
// foothills (STAGE.farLift). Inside the page it lies under the fine mesh (the lowest ground of its cell, two metres down).
const FAR=(function(){const S=20000,N=220,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color(),NEAR=SR*1.1,cs=S/N;
 const FOREST=new THREE.Color(0x3e4a2c),KELP=new THREE.Color(0x5e5426),ROCK=new THREE.Color(0x6a6c6a),SNOWC=new THREE.Color(0xc8ccd0),SANDC=new THREE.Color(0xa8987a),BED=new THREE.Color(0x4a5a58);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),inside=Math.max(Math.abs(x),Math.abs(z))<NEAR;let y;
  if(inside){let lo=terrainH(x,z);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)lo=Math.min(lo,terrainH(x+a*cs*.5,z+b*cs*.5));y=lo-2;}
  else y=terrainH(x,z)+(STAGE.farLift?STAGE.farLift(x,z):0);
  p.setY(i,y);const n=fbm(x*.001,z*.001,412,2)-.5,inv=F.invade(x,z),nat=F.native(x,z);
  c.copy(FOREST).lerp(KELP,clamp(inv*(1-nat),0,1)*.8).lerp(ROCK,smooth(1400,2600,y)).lerp(SNOWC,smooth(2900,3600,y)).lerp(SANDC,smooth(3,.5,y)*smooth(-2,0,y)).lerp(BED,smooth(0,-6,y));
  c.multiplyScalar(1+n*.18).convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.userData.probeSkip=true;m.userData.host=true;m.userData.inspectLabel='The far country (the coast, the outer wall\'s foothills)';scene.add(m);return m;})();
_mark('far');
