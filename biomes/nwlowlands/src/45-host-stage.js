// ================================================================= HOST — stage
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('nwlowlands',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// The ideal-type host for the NORTHWESTERN LOWLANDS: renderer, lights, fog, the terrain
// with terrainH(), the climate fields the biome asks for, the water (one plane at y=0
// for the lake, the lowland river and the ponds, a ribbon where the river comes down out
// of the foothills), the painted ground, the road, the tick list, the error panel. A real
// world replaces this whole section; the biome reads it only through BIO.host.
//
// THE MAP (x east, z south, origin mid-lowland, R 3000). One axis does the work: s runs
// NW -> SE (s=(x+z)/sqrt2), t across it toward the NE. We are in Krator's NW quadrant:
// the great LAKE lies to the NW with the Outer Wall far beyond it; the Inner Wall's
// mountains rise to the SE; the country is OPEN to the NE and SW.
//   s < ~-1900        the LAKE (jade over sand; coves; a river mouth)
//   -1900 .. -1250    a brief strip of RAINFOREST at the shore, paperbark swamps, lotus ponds
//   -1250 .. +900     the long HUMID SUBTROPICAL tract: gums, kauri, birch and cedar
//                     stands, bamboo groves by the water
//   +900 .. +3000     MEDITERRANEAN foothills climbing toward the Inner Wall (to ~350 m)
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc6ccc0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00020);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
scene.add(new THREE.HemisphereLight(0xc8d4d0,0x4a4030,.62));
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(-1200,900,-600);scene.add(sun);   // WNW, over the sea
const fill=new THREE.DirectionalLight(0xb4cec4,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the axis, the sea, the river
const TERR={R:3000};
const RT2=Math.SQRT1_2;
const sOf=(x,z)=>(x+z)*RT2, tOf=(x,z)=>(x-z)*RT2;
const xzOf=(s,t)=>[(s+t)*RT2,(s-t)*RT2];
// the zone coordinate: s, wobbled along t so no boundary is a ruled line
function sw(x,z){const t=tOf(x,z);return sOf(x,z)+110*Math.sin(t*.0012+.4)+45*Math.sin(t*.0041);}
// the shore: s of the waterline as a function of t (coves and a delta bulge)
function shoreS(t){return -1900+170*(fbm(t*.0011+3,1.7,41,3)-.5)*2+40*Math.sin(t*.006)+90*smooth(420,60,Math.abs(t-RIVER_T(-1900)));}
// signed distance-ish to the shore in metres, negative out in the sea
function seaIn(x,z){const t=tOf(x,z);return sOf(x,z)-shoreS(t);}
// the river: t as a function of s, meandering down from the SE hills to the delta
function RIVER_T(s){return -120+260*Math.sin(s*.00115+.6)+90*Math.sin(s*.0043+1.3)+30*Math.sin(s*.011);}
function riverD(x,z){const s=sOf(x,z),t=tOf(x,z);if(s>TERR.R*1.2)return 1e9;
 let d=Math.abs(t-RIVER_T(s));
 // the delta: two distributaries fan out over the last 500 m
 const sh=shoreS(RIVER_T(s)),f=smooth(sh+520,sh+40,s);
 if(f>0){d=Math.min(d,Math.abs(t-(RIVER_T(s)+f*210)),Math.abs(t-(RIVER_T(s)-f*170)));}
 return d;}
// the river's width grows toward the sea
function riverW(x,z){const s=sOf(x,z);return mix(9,26,smooth(1800,-1500,s));}
// a bayou: sloughs and pools in the coastal lowland, oxbow ponds up the valley
function swampK(x,z){const s=sw(x,z),sh=shoreS(tOf(x,z));return smooth(-1050,-1350,s)*smooth(sh+10,sh+90,sOf(x,z));}
// THE GHOST-GUM AVENUE: a pale road across the plain toward the tower, t as a function of s.
// The host owns the road; the biome plants its two rows (NWLOW.build({avenues})).
const ROAD_S=[-1000,-420];
function ROAD_T(s){return 300+22*Math.sin(s*.006);}
function roadD(x,z){const s=sOf(x,z),t=tOf(x,z);if(s<ROAD_S[0]-60||s>ROAD_S[1]+60||Math.abs(t-300)>90)return 1e9;
 const sc=clamp(s,ROAD_S[0],ROAD_S[1]),slope=22*.006*Math.cos(sc*.006);return Math.hypot(s-sc,(t-ROAD_T(sc))/Math.sqrt(1+slope*slope));}
const ROAD=[];for(let s=ROAD_S[0];s<=ROAD_S[1]+.1;s+=20)ROAD.push(xzOf(s,ROAD_T(s)));
// ---------------------------------------------------------------- terrain
function baseH(x,z){const s=sw(x,z);
 // the lowland shelf, the long subtropical rise, then the foothills of the Inner Wall range
 return 1.25+2.8*smooth(-1500,-300,s)+9*smooth(-400,900,s)+90*smooth(800,2200,s)+220*smooth(1900,3600,s);}
function hillH(x,z){const s=sw(x,z),k=smooth(300,1300,s);
 return k*(mix(46,110,smooth(1500,3000,s))*(fbm(x*.0016+2,z*.0016-4,63,3)-.5)+18*(fbm(x*.006-1,z*.006+7,64,2)-.5))+(1-k)*(1.6*(fbm(x*.004,z*.004,65,2)-.5));}
function terrainH(x,z){
 let h=baseH(x,z)+hillH(x,z);const h0=h;
 const s=sOf(x,z),rd=riverD(x,z),W=riverW(x,z);
 // bayou pools and sloughs: standing water a few tens of metres across
 const sk=swampK(x,z);if(sk>0){const pool=fbm(x*.0068+11,z*.0068-7,313,2);h-=sk*3.6*smooth(.43,.29,pool);}
 // oxbow ponds up the subtropical valley, near the river only
 const ox=smooth(-1100,-700,sw(x,z))*smooth(600,300,sw(x,z))*smooth(420,120,rd);if(ox>0){const p=fbm(x*.011-3,z*.011+5,317,2);h-=ox*4.2*smooth(.70,.665,p);}
 // the valley the river cut (wider in the hills), and the channel itself
 const vk=smooth(W*9+120,W*1.2,rd)*smooth(200,900,sw(x,z));h-=vk*Math.max(0,h-baseH(x,z)*.8)*.55;
 const bank=smooth(W+10,W*.6,rd);
 // in the lowland the bed drops under the water plane; up in the hills it is a 2.8 m trench the ribbon runs in
 if(bank>0){const lowland=smooth(250,-150,sw(x,z));h=mix(h,Math.min(h-.2,mix(h-2.8,-2.2,lowland)),bank);}
 // the sea: a sandy shelf then the deep
 const si=seaIn(x,z);if(si<30){const bed=-.4-1.6*smooth(0,-160,si)-9*smooth(-160,-700,si)+.8*(fbm(x*.004,z*.004,71,2)-.5)*smooth(-20,-150,si);
  h=mix(h,Math.min(bed,-.25),smooth(30,-12,si));}
 // the road: a level bed, a hand's depth under the verge, no ponds on it
 const rdd=roadD(x,z);if(rdd<16)h=mix(h,h0-.12,smooth(16,5,rdd));
 return h;}
// ---------------------------------------------------------------- the climate fields
// wet 0..1 (annual moisture), tropic 0..1 (frost-free and hot: 1 in the
// rainforest), dry 0..1 (summer drought: 1 in the Mediterranean hills), salt
// (brackish ground at the sea), flow (river banks), upland (0 lowland .. 1 hilltops)
const FIELD={
 tropic:(x,z)=>smooth(-600,-1650,sw(x,z)),   // the rainforest proper is where this passes ~.75 (s < ~-1150)
 dry:(x,z)=>smooth(700,1400,sw(x,z)),
 wet:(x,z)=>{const s=sw(x,z),rd=riverD(x,z),h=terrainH(x,z);
  let w=mix(.96,.80,smooth(-1400,-600,s));w=mix(w,.34,smooth(450,1300,s));w=mix(w,.22,smooth(1800,2900,s));
  // the north-facing draws hold water in the hills: madrone and sycamore country
  w+=.14*smooth(600,1400,s)*(fbm(x*.0021-6,z*.0021+2,66,2)-.5)*2;
  w=Math.max(w,.97*smooth(W_R(x,z)*4+60,W_R(x,z),rd),.95*smooth(1.2,-.4,h)*smooth(-600,-1000,s));return clamp(w,0,1);},
 salt:(x,z)=>0,   // a freshwater lake
 flow:(x,z)=>clamp(smooth(W_R(x,z)*5+90,W_R(x,z)+4,riverD(x,z)),0,1),
 upland:(x,z)=>clamp((terrainH(x,z)-10)/240,0,1)};
function W_R(x,z){return riverW(x,z);}
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,
 mask:(x,z)=>{if(roadD(x,z)<11.5)return 0;const h=terrainH(x,z);return h<.12?0:h<.6?(h-.12)/.48:1;},   // nothing on the road or its mown verges   // nothing rooted under water (the mangrove pass asks past the mask itself)
 obstacles:OBSTACLES,ticks:tick,seed:23,
 // the LOD spine: a row of origins down the NW -> SE axis, sea to hills
 origin:[-2300,-1650,-1000,-350,300,950,1600,2250].map(s=>xzOf(s,0)),center:[0,0],
 fields:FIELD,err:reportErr});
BIO.setSun([-1200,900,-600]);
// ---------------------------------------------------------------- the ground
// One mesh, painted from a coarse cache of the fields (each costs fbm calls),
// with a tiled grain texture multiplied in. The red soils of the hills are
// the same family of colours as the bark.
const FC=(function(){const N=320,S=TERR.R*2.2,a={wet:new Float32Array(N*N),dry:new Float32Array(N*N),tr:new Float32Array(N*N),rd:new Float32Array(N*N),si:new Float32Array(N*N),up:new Float32Array(N*N),sk:new Float32Array(N*N)};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  a.wet[k]=FIELD.wet(x,z);a.dry[k]=FIELD.dry(x,z);a.tr[k]=FIELD.tropic(x,z);a.rd[k]=riverD(x,z);a.si[k]=seaIn(x,z);a.up[k]=FIELD.upland(x,z);a.sk[k]=swampK(x,z);}
 const at=(arr,x,z)=>{const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,S,a,at};})();
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color();
 const MUD=new THREE.Color(0x2c3428),LIT=new THREE.Color(0x2a3424),LITG=new THREE.Color(0x344a2c),
  SUB=new THREE.Color(0x3e5a2e),SUBG=new THREE.Color(0x5a7a36),
  GOLD=new THREE.Color(0xa89a64),GOLD2=new THREE.Color(0x8e8a5a),OCHRE=new THREE.Color(0x9a7a56),REDSOIL=new THREE.Color(0x9a5a3e),SCRUB=new THREE.Color(0x56664a),
  SAND=new THREE.Color(0xd6c6a0),WETSAND=new THREE.Color(0x8e7c5c),SILT=new THREE.Color(0x7a6a50),BED=new THREE.Color(0x9a8a62);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/26,y/26,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),n3=fbm(x/90,y/90,1.7,2)-.5;
  const tr=FC.at(FC.a.tr,wx,wz),dry=FC.at(FC.a.dry,wx,wz),wet=FC.at(FC.a.wet,wx,wz),rd=FC.at(FC.a.rd,wx,wz),si=FC.at(FC.a.si,wx,wz),sk=FC.at(FC.a.sk,wx,wz);
  // subtropical: leaf litter under the trees, grass in the glades
  c.copy(SUB).lerp(SUBG,clamp(.5+n3*2.4+n*.8,0,1));
  // the rainforest: dark red litter
  t.copy(LIT).lerp(LITG,clamp(.45+n*1.8,0,1));c.lerp(t,tr);
  // the bayou: mud
  c.lerp(MUD,sk*.7);
  // the Mediterranean: golden grass, ochre and red soil where it is bare, scrub where it is wetter
  t.copy(GOLD).lerp(GOLD2,clamp(.5+n*1.8,0,1)).lerp(OCHRE,clamp(n3*2.2,0,.6)).lerp(REDSOIL,smooth(.16,.3,n3)*.8).lerp(SCRUB,smooth(.3,.5,wet)*.55);c.lerp(t,dry);
  // river banks: silt; the beach: sand, darker where the sea wets it
  c.lerp(SILT,smooth(60,14,rd)*.7);
  c.lerp(SAND,smooth(150,40,si)*(1-sk)*(1-smooth(80,20,rd)));c.lerp(WETSAND,smooth(25,0,si)*.8);
  c.lerp(BED,smooth(0,-40,si));
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x9a9890});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85);}');};
(function(){const N=400,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,terrainH(p.getX(i),p.getZ(i)));
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The lowland floor';scene.add(m);})();

// ---------------------------------------------------------------- the water
// One plane at y=0 carries the inland sea, the bayou and the river's lowland
// reach; its vertex colour is the water's own: a clear green-blue sea over
// sand, tea-dark in the bayou, silty in the river. Where the river runs down
// through the hills it is a ribbon in the same material.
const SEA_SHALLOW=new THREE.Color(0x5aa8a8),SEA_MID=new THREE.Color(0x2a7a90),SEA_DEEP=new THREE.Color(0x163e6a),SEA_PALE=new THREE.Color(0xa8d8cc);   // the lake: jade to blue
const BAYOU_COL=new THREE.Color(0x2e4a44),RIVER_COL=new THREE.Color(0x3e6a64);
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(-1200,900,-600).normalize()},uSky:{value:new THREE.Color(0xd8e2dc)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' float dcam=length(cameraPosition-vWP);float rk=1.0-smoothstep(120.0,420.0,dcam);',   // ripples fade with range or they alias into a moire
  ' vec3 n=normalize(vec3(rk*(0.035*sin(vWP.x*0.31+uT*1.1)+0.02*sin(vWP.z*0.53-uT*0.7+vWP.x*0.11)),1.0,rk*(0.035*cos(vWP.z*0.27+uT*0.9)+0.02*sin(vWP.x*0.47+uT*1.3))));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(1.0-max(dot(n,V),0.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.08+fr*0.62);',
  ' vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.75*vec3(1.0,0.96,0.86);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
function waterColorAt(x,z,out){const h=terrainH(x,z),d=Math.max(0,-h),si=seaIn(x,z),rd=riverD(x,z);
 const shoal=fbm(x*.0031+2,z*.0031-4,505,2);
 out.copy(SEA_SHALLOW).lerp(SEA_PALE,Math.max(smooth(.5,.68,shoal)*smooth(2.2,.3,d),smooth(.5,.08,d)*.6)).lerp(SEA_MID,smooth(1.4,4,d)).lerp(SEA_DEEP,smooth(4.5,10,d));
 out.lerp(BAYOU_COL,smooth(-30,60,si)*.9);                                   // everything inland of the shore is fresh and dark
 out.lerp(RIVER_COL,smooth(60,15,rd)*smooth(-200,20,si)*.85);return out;}
(function(){const N=300,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
 for(let i=0;i<p.count;i++){waterColorAt(p.getX(i),p.getZ(i),c);c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel='The lake';m.renderOrder=1;scene.add(m);
 // the river down through the hills: a ribbon at bed+0.6 wherever the bed is above the plane
 const pos=[],cc=[],rc=RIVER_COL.clone().convertSRGBToLinear(),ds=24;
 for(let s=-300;s<TERR.R*1.25;s+=ds){const t0=RIVER_T(s),t1=RIVER_T(s+ds);
  const a=xzOf(s,t0),b=xzOf(s+ds,t1),w=riverW(a[0],a[1])*.8;
  const ya=terrainH(a[0],a[1])+.6,yb=terrainH(b[0],b[1])+.6;if(ya<.05&&yb<.05)continue;
  // the across-stream offset is along t, i.e. (RT2,-RT2) in x,z
  const ox=RT2*w,oz=-RT2*w;
  pos.push(a[0]-ox,ya,a[1]-oz, b[0]-ox,yb,b[1]-oz, b[0]+ox,yb,b[1]+oz,  a[0]-ox,ya,a[1]-oz, b[0]+ox,yb,b[1]+oz, a[0]+ox,ya,a[1]+oz);for(let k=0;k<6;k++)cc.push(rc.r,rc.g,rc.b);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cc,3));geo.computeVertexNormals();
 const rm=new THREE.Mesh(geo,MAT_WATER);rm.userData.probeSkip=true;rm.userData.inspectLabel='The river';scene.add(rm);})();
// ---------------------------------------------------------------- the road
// A ribbon a few cm over the ground in its own dirt texture: two wheel ruts, a grassy
// crown, leaf litter, pale sand. (The ground canvas is ~4 m a pixel; a road needs its own.)
// the height of the RENDERED ground (400 cells of ~16 m, split on the same diagonal as PlaneGeometry):
// between its vertices it rides above or below terrainH, and a road laid on terrainH sinks into it
function meshH(x,z){const N=400,S=TERR.R*2.2,c=S/N,u=(x+S/2)/c,v=(z+S/2)/c,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,X=k=>-S/2+k*c;
 const h00=terrainH(X(i),X(j)),h10=terrainH(X(i+1),X(j)),h01=terrainH(X(i),X(j+1)),h11=terrainH(X(i+1),X(j+1));
 return fu+fv<=1?h00+(h10-h00)*fu+(h01-h00)*fv:h11+(h01-h11)*(1-fu)+(h10-h11)*(1-fv);}
(function(){const TEX=BIO.canvasTex(256,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,u=x/w,q=(u-.5)/.4+.5,rut=Math.max(smooth(.12,0,Math.abs(q-.28)),smooth(.12,0,Math.abs(q-.72))),crown=smooth(.1,0,Math.abs(q-.5)),verge=smooth(.19,.22,Math.abs(u-.5));
   const n=(fbm(x/14,y/14,2.1,3)-.5)*40+(BIO.fn.h3(x,y,5)-.5)*22;let r=206+n-rut*26,g2=190+n-rut*24,b=152+n-rut*20;   // the road in the middle 40%, mown grass verges either side
   r=mix(r,120,crown*.45);g2=mix(g2,132,crown*.45);b=mix(b,70,crown*.45);
   const gn=(fbm(x/8,y/8,4.4,2)-.5)*50;r=mix(r,96+gn*.6,verge);g2=mix(g2,118+gn,verge);b=mix(b,62+gn*.4,verge);
   if(fbm(x/6,y/6,7.7,2)>.62){r*=.72;g2*=.64;b*=.52;}   // fallen leaves
   d[i]=clamp(r,0,255);d[i+1]=clamp(g2,0,255);d[i+2]=clamp(b,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 const pos=[],uv=[],W=11;let v=0;
 for(let s=ROAD_S[0];s<ROAD_S[1];s+=4){const a=xzOf(s,ROAD_T(s)),b=xzOf(s+4,ROAD_T(s+4)),dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),nx=-dz/L*W,nz=dx/L*W;
  const P=[[a[0]-nx,a[1]-nz,0,v],[a[0]+nx,a[1]+nz,1,v],[b[0]+nx,b[1]+nz,1,v+L/44],[b[0]-nx,b[1]-nz,0,v+L/44]];   // one tile per 44 m along, ~22 m across: texels square
  [0,2,1,0,3,2].forEach(k=>{const p=P[k];pos.push(p[0],Math.max(terrainH(p[0],p[1]),meshH(p[0],p[1]))+.08,p[1]);uv.push(p[2],p[3]);});v+=L/44;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:TEX,color:0xaaa498,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
 m.userData.probeSkip=true;m.userData.inspectLabel='The ghost-gum avenue';scene.add(m);})();
