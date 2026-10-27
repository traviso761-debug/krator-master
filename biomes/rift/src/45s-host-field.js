// ================================================================= HOST — the field cache, the host binding, the ground (after the map, 45m)
// ---------------------------------------------------------------- the field cache
// The analytic fields cost a dozen fbm calls each and the biome asks for them
// on every grid cell (a million times a build), so they are sampled once on an
// 18 m lattice and read back bilinearly: the zones are hundreds of metres
// across and never notice. terrainH stays exact (the shore, the stream beds).
const FC=(function(){const N=384,S=TERR.R*2.2,a={wet:new Float32Array(N*N),salt:new Float32Array(N*N),up:new Float32Array(N*N),mist:new Float32Array(N*N),flow:new Float32Array(N*N),lk:new Float32Array(N*N),slope:new Float32Array(N*N),south:new Float32Array(N*N)};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  a.wet[k]=FIELD_RAW.wet(x,z);a.salt[k]=FIELD_RAW.salt(x,z);a.up[k]=FIELD_RAW.upland(x,z);a.mist[k]=FIELD_RAW.mist(x,z);a.flow[k]=FIELD_RAW.flow(x,z);a.lk[k]=lakeIn(x,z);a.slope[k]=slopeAt(x,z);a.south[k]=southK(x,z);}
 const at=(arr,x,z)=>{const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={wet:(x,z)=>FC.at(FC.a.wet,x,z),salt:(x,z)=>FC.at(FC.a.salt,x,z),upland:(x,z)=>FC.at(FC.a.up,x,z),flow:(x,z)=>FC.at(FC.a.flow,x,z),mist:(x,z)=>FC.at(FC.a.mist,x,z)};
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
BIO.init({tags:'rift',THREE:THREE,scene:scene,terrainH:terrainH,
 mask:(x,z)=>{const h=terrainH(x,z);if(h<.12)return 0;const w=h<.6?(h-.12)/.48:1;return w*smooth(1.6,.85,FC.at(FC.a.slope,x,z))*(typeof MAP_DRY==='function'?MAP_DRY(x,z):1);},   // nothing rooted under water or on a cliff (MAP_DRY: a station's rivers and pools above the sea's level)
 waterH:typeof MAP_WATERH==='function'?MAP_WATERH:undefined,   /* a station's water level where it is not the sea's 0 (its river, its pools): the kit's shore logic reads it */
 obstacles:OBSTACLES,ticks:tick,seed:11,
 // the LOD spine: a row of origins along x=0 from the savannah over the ridge to the shore
 origin:MAP_ORIGIN,center:[0,0],
 fields:FIELD,err:reportErr});
BIO.setSun([-1200,900,-600]);
// THE GRAPHIC-LOAD SCHEME (GRAPHIC-LOAD.md, the recommendation; nhighlands is the worked example; biomes/rift/PERF.md the numbers):
// the items' geometry welded and drawn by index (BIO.INDEX_ITEMS; ?index=0 for the soup); one LOD mesh per chunk with its rows sorted by
// range (B1/B2: ?lodmerge=0), small meshes merged up to 1500 triangles, a dithered cross-fade over the last 15% of each range (?lodfade=0:
// the pop at 1.2 km), and every loose instance culled at its own row's range in the vertex shader (BIO.LOD.cull; ?lodcull=0)
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
// ---------------------------------------------------------------- the ground
// One mesh. Painted by zone from the field cache, with a tiled detail texture
// multiplied in for the grain and the salt cracks up close.
const LAKECOL=new THREE.Color().setHSL(RIFT_LAKE.hue,.7,.45);

const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color();
 const LIT=new THREE.Color(0x3e3040),LIT2=new THREE.Color(0x30263a),LMOSS=new THREE.Color(0x4e6030),LGREEN=new THREE.Color(0x5a7a36),
  CRUST=new THREE.Color(0xe6e0b8),ALGA=new THREE.Color(0xb4b048),MUD=new THREE.Color(0x5e5a3c),BED=new THREE.Color(0x7a7448),
  SAV=new THREE.Color(0xc0a458),SAV2=new THREE.Color(0xa08c48),SAVG=new THREE.Color(0x7c8a40),EARTH=new THREE.Color(0x8a5a3a),
  ROCK=new THREE.Color(0x8a7c68),ROCK2=new THREE.Color(0x6a6052),ROCK3=new THREE.Color(0xa09480),HUMUS=new THREE.Color(0x2c3826),PEAK=new THREE.Color(0xa89c80),PEAKG=new THREE.Color(0x6a7a48),
  SILT=new THREE.Color(0x8a8a60),GRAVEL=new THREE.Color(0xb0a088);
 const crustT=CRUST.clone().lerp(LAKECOL,.12),algaT=ALGA.clone().lerp(LAKECOL,.3);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/26,y/26,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),n3=fbm(x/90,y/90,4.1,2)-.5;
  const salt=FC.at(FC.a.salt,wx,wz),wet=FC.at(FC.a.wet,wx,wz),up=FC.at(FC.a.up,wx,wz),mist=FC.at(FC.a.mist,wx,wz),flow=FC.at(FC.a.flow,wx,wz),lk=FC.at(FC.a.lk,wx,wz),sl=FC.at(FC.a.slope,wx,wz),south=FC.at(FC.a.south,wx,wz);
  const floor=smooth(.30,.10,up);
  // the valley floor: jungle litter south of the crest, dry grass north of it
  t.copy(LIT).lerp(LIT2,clamp(.5+n*1.8,0,1)).lerp(LMOSS,smooth(.3,.7,n3+wet*.3)*.75).lerp(LGREEN,smooth(.25,.6,n3+.2*n)*.35);   /* greener litter (the owner, 2026-10-27: too uniformly black); the moss layer goes over it (aLay.z) */
  c.copy(SAV).lerp(SAV2,clamp(.5+n*1.7,0,1)).lerp(SAVG,smooth(.45,.7,fbm(x/60,y/60,7,2))*.55).lerp(EARTH,smooth(.62,.78,fbm(x/40,y/40,8,2))*.5);
  c.lerp(t,south*Math.max(floor,smooth(.3,.6,mist)));   /* the cloud's ground is the litter too (station 3's face sits above the valley floor) */
  // the ridge: rock where it is steep, humus under the cloud forest, pale stony scrub on the peak
  t.copy(ROCK).lerp(ROCK2,clamp(.5+n*2.0,0,1)).lerp(ROCK3,smooth(.4,.6,fbm(x/12,y/70,9,2)));   // strata run with x
  const cloud=mist,peak=smooth(.55,.75,up)*(1-mist);
  const rockK=smooth(.55,1.05,sl)*smooth(.06,.16,up);
  c.lerp(HUMUS,cloud*.85*smooth(.12,.3,up));
  c.lerp(PEAK.clone().lerp(PEAKG,smooth(.4,.7,fbm(x/30,y/30,10,2))*.6),peak*.9);
  c.lerp(t,rockK);
  // the shore: crust, then the algal mat right at the water
  c.lerp(crustT,salt*smooth(160,20,lk)*.9);c.lerp(algaT,smooth(40,6,lk)*smooth(-20,10,lk)*.8);
  c.lerp(BED,smooth(0,-30,lk));
  // the streams and the wash
  c.lerp(SILT,smooth(.5,.9,flow)*south*.7);c.lerp(GRAVEL,smooth(.4,.8,flow)*(1-south)*.8);
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// detail: fine grain everywhere, tiled every ~6 m; salt-pan cracks weighted per
// vertex by the salt field (aCrack), so the savannah and the ridge show none
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_CRACK=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(70,60,50,.6)';g.lineCap='round';
 const P=[];for(let i=0;i<16;i++)P.push([rng()*w,rng()*h]);
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>w*.4)continue;if(rng()<.45)continue;
  g.lineWidth=rr(1.2,2.6);for(let k=-1;k<=1;k++)for(let m=-1;m<=1;m++){g.beginPath();g.moveTo(a[0]+k*w,a[1]+m*h);g.quadraticCurveTo((a[0]+b[0])/2+rr(-18,18)+k*w,(a[1]+b[1])/2+rr(-18,18)+m*h,b[0]+k*w,b[1]+m*h);g.stroke();}}});
// THE LIBRARY GROUND LAYERS (materials.json ground.salt, ground.wash; 2026-10-19; core/materials/PLAN.md "Rift"): the pale
// smooth sand (ground093c) under the salt crust of the lake shore, and the fine tan sand (ground080) of the savannah's dry
// wash, over the painted ground by weight per vertex (aLay). Without the pack (?mat=proc, or an open world) the ground is
// exactly the painted one.
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=n=>KMAT.packed('rift',n);
 const a=P('ground.salt'),b=P('ground.wash'),m=P('ground.moss');if(!a||!b)return null;const T=x=>KMAT.textures(x,{aniso:8}).map;
 /* moss (ground.moss002, 2026-10-27, the owner: the jungle's floor read uniformly black): green understory over the jungle's litter, in patches */
 return{salt:T(a),saltK:1/a.scale[0],wash:T(b),washK:1/b.scale[0],moss:m?T(m):null,mossK:m?1/m.scale[0]:1};})();
/* THE RIFT'S BEDS ON THE RIDGE'S FACES (core/terrain strata: KSTRATA's `rift` recipe, STRATA-PLAN.md section 3: basement, fan gravels,
   red sandstones, lake marls with stromatolite and gypsum, basalt and ash): the shader draws the bed at each point of a cliff face by its
   world height, where the paint had a noise of three rock greys (aRock: the paint's own rock weight, so only the faces it showed as rock).
   ?strata=0 for the paint alone */
const STRATA=typeof KSTRATA!=='undefined'&&KSTRATA.shade&&new URLSearchParams(location.search).get('strata')!=='0'?BIO.strata({recipe:'rift',seed:1137,range:[-80,720],dip:[.8,.6,.01],warp:[7,2],private:true}):null;
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x9a9890});
MAT_GROUND.onBeforeCompile=sh=>{if(STRATA)STRATA.inject(sh);sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};sh.uniforms.uCrack={value:hostGroundLib('groundCrack',TEX_CRACK)};if(GLAY){sh.uniforms.uLSalt={value:GLAY.salt};sh.uniforms.uLWash={value:GLAY.wash};if(GLAY.moss)sh.uniforms.uLMoss={value:GLAY.moss};}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;varying float vCrack;attribute vec3 aLay;varying vec3 vLay;attribute float aRock;varying float vRock;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvLay=aLay;vRock=aRock;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uCrack;varying vec3 vGWP;varying float vCrack;varying vec3 vLay;varying float vRock;'+(GLAY?'uniform sampler2D uLSalt,uLWash;'+(GLAY.moss?'uniform sampler2D uLMoss;':''):''))
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 ck=texture2D(uCrack,vGWP.xz*0.14).rgb;'+(STRATA?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN)*(0.85+0.3*dt.r),vRock*0.9);':'')+'diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85)*mix(vec3(1.0),ck,vCrack);'+
  // the shore's pale sand and the wash's tan sand over the painted ground (a custom sampler is not decoded from sRGB:
  // pow 2.2 by hand), each on two tiles, one turned, blended by a slow wave so the repeat shows no grid
  (GLAY?'{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(-0.3,0.3,sin(p.x*0.017+2.0*sin(p.y*0.011))*sin(p.y*0.013+1.3));'+
   'vec3 ts=mix(pow(texture2D(uLSalt,p*'+GLAY.saltK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uLSalt,q*'+(GLAY.saltK*.47).toFixed(4)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt);'+
   'vec3 tw=mix(pow(texture2D(uLWash,p*'+GLAY.washK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uLWash,q*'+(GLAY.washK*.47).toFixed(4)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt);'+
   'diffuseColor.rgb=mix(diffuseColor.rgb,mix(diffuseColor.rgb,diffuse*ts*1.3,0.8),vLay.x);diffuseColor.rgb=mix(diffuseColor.rgb,mix(diffuseColor.rgb,diffuse*tw*1.3,0.8),vLay.y);'+
   // the moss: its own colour (darkened a little under the canopy), over the litter by aLay.z
   (GLAY.moss?'vec3 tm=mix(pow(texture2D(uLMoss,p*'+GLAY.mossK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uLMoss,q*'+(GLAY.mossK*.47).toFixed(4)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt);'+
    'diffuseColor.rgb=mix(diffuseColor.rgb,tm*0.62*(0.85+0.3*dt.r),vLay.z);':'')+'}':'')+'}');};
(function(){const N=460,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,ck=new Float32Array(p.count),lay=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,terrainH(x,z));ck[i]=smooth(.3,.8,FC.at(FC.a.salt,x,z));
  lay[i*3]=ck[i]*smooth(160,20,FC.at(FC.a.lk,x,z))*smooth(-30,0,FC.at(FC.a.lk,x,z));lay[i*3+1]=smooth(.4,.8,FC.at(FC.a.flow,x,z))*(1-FC.at(FC.a.south,x,z));
  /* the moss: the jungle's floor (the lake side, the valley floor, damp), in patches 60-200 m across, none on the shore's crust, the
     river beds, the cliffs or the ridge's peak */
  const sth=FC.at(FC.a.south,x,z),wet=FC.at(FC.a.wet,x,z),flr=Math.max(smooth(.30,.10,FC.at(FC.a.up,x,z)),smooth(.3,.6,FC.at(FC.a.mist,x,z))),patch=smooth(.38,.62,fbm(x*.006+11,z*.006-3,231,3));
  lay[i*3+2]=sth*flr*smooth(.5,.8,wet)*(.35+.6*patch)*(1-ck[i])*(1-smooth(.3,.7,FC.at(FC.a.flow,x,z)))*smooth(1.0,.6,FC.at(FC.a.slope,x,z))*smooth(10,60,FC.at(FC.a.lk,x,z));}
 g.setAttribute('aLay',new THREE.BufferAttribute(lay,3));
 {const rk=new Float32Array(p.count);for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);rk[i]=smooth(.55,1.05,FC.at(FC.a.slope,x,z))*smooth(.06,.16,FC.at(FC.a.up,x,z));}g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));}   /* the paint's rockK per vertex: where the strata show */
 g.setAttribute('aCrack',new THREE.BufferAttribute(ck,1));
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The Rift floor';scene.add(m);})();

// ---------------------------------------------------------------- the water
// The lake and the streams' last reach are core/water's (89w-host-water.js, from 2026-10-20; before, one plane at y=0 with a vertex
// colour by depth). The lake colour is RIFT_LAKE (50-species): swap the hue there and everything follows.
const WATER_SHALLOW=new THREE.Color().setHSL(RIFT_LAKE.hue,.62,.50),WATER_MID=new THREE.Color().setHSL(RIFT_LAKE.hue-.01,.58,.32),WATER_DEEP=new THREE.Color().setHSL(RIFT_LAKE.hue-.02,.45,.13),WATER_PALE=new THREE.Color().setHSL(RIFT_LAKE.hue+.02,.55,.72);
const RIVER_COL=new THREE.Color().setHSL((RIFT_LAKE.hue+.28)%1,.35,.30);
// The water itself is core/water's now (89w-host-water.js: WATER.open for the lake, WATER.flow for the streams' last reach); this file keeps the
// lake's colours (WATER_*, RIVER_COL), which that fragment hands to the water, and the lake's and streams' geometry (lakeIn, xsE, xsW) above.
