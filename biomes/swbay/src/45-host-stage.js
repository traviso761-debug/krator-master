// ================================================================= HOST — stage
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('swbay',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// The ideal-type host for the SOUTHWEST BAY: everything a world provides that
// a biome does not. Renderer, lights, fog, the bay-and-slope terrain with
// terrainH(), the climate fields the biome asks for (wet / salt / upland /
// flow), the water (one plane at y=0 for the bay and the river's lowland
// reach, a ribbon where the river comes down the slope), the painted ground,
// the tick list, the error panel. A real world replaces this whole section
// with its own; the biome fragments never read anything from it except
// through BIO.host (see 88-host-build.js).
//
// THE MAP (x east, z south; the map's centre at CENTER, R 2500):
//   the BAY          an inlet in the SW, open toward the SW edge, centred on
//                    BAY.c; the ground round it is a metre or two above the
//                    water plane at y=0 and the bed dips under it
//   0 .. ~600 m      from the shore: the BAY HYPERJUNGLE ring (prism gums to
//                    the temple height, cap trees, fan-crowns, baobabs)
//   ~500 .. 1300 m   the ground rises: TROPICAL RAINFOREST (mid canopy)
//   1200 m +         the rise steepens and the forest breaks quickly into the
//                    PARASOL SAVANNAH of the highlands; the NE is the highest
//   the VOLCANO      stands 8 km NE of the bay on the FAR COUNTRY mesh (coarse
//                    terrain beyond the map, with the crater rim ringing it)
//   the RIVER        comes down from the NE highlands into the bay's NE shore
//                    through a small delta
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
// THE BAY COLOUR. One hue (0 red .. .33 green .. .5 cyan .. .66 blue), set by
// the host before the biome loads: the water, the shore accents and the
// moss tinge derive from it. The epiphytes stay red and purple (canon).
var SWBAY_BAY={hue:0.50};
// THE CANOPY CEILING: the tallest trees top out at the height of the Voth
// temple. The canon figure is not in this kit; 110 m is the placeholder
// (KNOWN_ISSUES). Set it before fragment 50 loads.
var SWBAY_TEMPLE_H=110;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc6ccbc);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00017);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
scene.add(new THREE.HemisphereLight(0xc8d4cc,0x4a4630,.62));
const sun=new THREE.DirectionalLight(0xfff2d4,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0cfc8,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the bay, the river, the rise
const CENTER=[-400,400];
const TERR={R:2500};
// the bay: an ellipse in coordinates rotated 45 degrees, u along the NE
// diagonal (toward the volcano), v across it; open (wider) toward the SW
const BAY={c:[-1500,1500],a:950,b:640,scale:700};
const SQ=Math.SQRT1_2;
function uvOf(x,z){const dx=x-BAY.c[0],dz=z-BAY.c[1];return[(dx-dz)*SQ,(dx+dz)*SQ];}
// signed distance-ish to the shore in metres: negative inside the water
function bayIn(x,z){const P=uvOf(x,z),u=P[0],v=P[1];
 const bw=BAY.b*(1+.55*smooth(0,-900,u)),ux=u/BAY.a,vx=v/bw,r=Math.hypot(ux,vx),ang=Math.atan2(vx,ux);
 const edge=1+.14*(fbm(Math.cos(ang)*2.6+3,Math.sin(ang)*2.6+8,51,2)-.5)*2;return(r-edge)*BAY.scale;}
// the river: from the NE highlands down the diagonal into the bay's NE shore
function vR(u){return 220*Math.sin(u*.0019+.6)+80*Math.sin(u*.0063+2)+30*Math.sin(u*.017);}
const MOUTH_U=760;
function riverD(x,z){const P=uvOf(x,z),u=P[0],v=P[1];if(u<MOUTH_U-140)return 1e9;
 let d=Math.abs(v-vR(u));
 if(u<MOUTH_U+420){const f=(MOUTH_U+420-u)/560;d=Math.min(d,Math.abs(v-(vR(u)+f*160)),Math.abs(v-(vR(u)-f*140)));}   // delta channels fan toward the mouth
 return d;}
const MOUTH_XZ=(function(){const u=MOUTH_U+120,v=vR(u);return[BAY.c[0]+(u+v)*SQ,BAY.c[1]+(v-u)*SQ];})();
function deltaK(x,z){return smooth(480,60,Math.hypot(x-MOUTH_XZ[0],z-MOUTH_XZ[1]));}
// the rise: concentric round the bay (the ring of jungle, then the rainforest
// slope, then the savannah steepening), tilted up toward the NE, hills on it
function riseAt(x,z){const d=bayIn(x,z),u=uvOf(x,z)[0];
 const dd=d+90*(fbm(x*.0012+4,z*.0012-2,43,2)-.5);
 return 24*smooth(140,700,dd)+96*smooth(620,1400,dd)+130*smooth(1250,2500,dd)+70*smooth(1400,4200,u)
  +(60*(fbm(x*.0021,z*.0021,44,3)-.5)+14*(fbm(x*.0068,z*.0068,45,2)-.5))*smooth(350,900,dd);}
// ---------------------------------------------------------------- terrain
function terrainH(x,z){
 const lk=bayIn(x,z),rd=riverD(x,z),rise=riseAt(x,z);
 const sw=fbm(x*.0008+3,z*.0008-1,17,3)-.5,ro=fbm(x*.0045-2,z*.0045+5,29,2)-.5;
 let h=1.9+sw*2.4+ro*1.1;
 const chanW=1-.5*smooth(400,1400,lk),cw=smooth(28*chanW,9*chanW,rd);
 // the channel bed climbs in STEPS of five metres once it is on the slope (the
 // cataracts: each riser a fall, each tread a pool); the banks stay smooth
 const sf=rise/5,si=Math.floor(sf),stepped=mix(rise,(si+smooth(.78,1,sf-si))*5,smooth(8,20,rise));
 h=mix(h+rise,-1.9+ro*.4+stepped,cw);                                                    // the river channel, narrower up the slope
 const inL=smooth(25,-15,lk),bed=-.6-2.0*smooth(0,-220,lk)-11*smooth(-220,-900,lk)+1.6*(fbm(x*.0018+5,z*.0018+9,77,2)-.5)*smooth(-40,-220,lk);
 return mix(h,Math.min(bed,-.35),inL);}
// the climate fields the biome asks for
const FIELD={
 upland:(x,z)=>clamp(riseAt(x,z)/240,0,1),
 wet:(x,z)=>{const up=FIELD.upland(x,z),rd=riverD(x,z),lk=bayIn(x,z);
  let w=clamp(1-.86*smooth(.18,.58,up),.14,1);
  w=Math.max(w,.95*smooth(95,22,rd)*(1-.45*smooth(.5,.8,up)),deltaK(x,z),.5*smooth(140,10,lk));return clamp(w,0,1);},
 salt:(x,z)=>{const lk=bayIn(x,z);return clamp(.35*smooth(70,6,lk)*smooth(-8,30,lk),0,1);},   // a brackish rim, nothing more
 flow:(x,z)=>clamp(smooth(150,28,riverD(x,z)),0,1)};
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: along the diagonal from the bay's mouth to the NE highlands,
// with two points out along the shore so the jungle ring keeps its detail
const spine=[[650,0],[1200,0],[1750,0],[2350,0],[3000,0],[3700,0],[1150,-620]].map(P=>[BAY.c[0]+(P[0]+P[1])*SQ,BAY.c[1]+(P[1]-P[0])*SQ]);
BIO.init({tags:'swbay',THREE:THREE,scene:scene,terrainH:terrainH,
 mask:(x,z)=>{const h=terrainH(x,z),m=h<.12?0:h<.6?(h-.12)/.48:1;return m*smooth(7,15,riverD(x,z));},   // nothing rooted under water, nor in the river's channel up the slope
 obstacles:OBSTACLES,ticks:tick,seed:11,
 origin:spine,center:CENTER,
 fields:FIELD,eye:()=>[camera.position.x,camera.position.y,camera.position.z],err:reportErr});
BIO.setSun([-1200,900,-600]);
// ---------------------------------------------------------------- the ground
// One mesh. Painted by zone from a coarse cache of the fields (the fields cost
// fbm calls; the 1536² canvas would otherwise take seconds), with a tiled
// detail texture multiplied in for the grain up close.
const BAYCOL=new THREE.Color().setHSL(SWBAY_BAY.hue,.75,.45);
const FC=(function(){const N=384,S=TERR.R*2.2,a={wet:new Float32Array(N*N),up:new Float32Array(N*N),rd:new Float32Array(N*N),lk:new Float32Array(N*N),u:new Float32Array(N*N)};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=CENTER[0]+(i/(N-1)-.5)*S,z=CENTER[1]+(j/(N-1)-.5)*S,k=j*N+i;
  a.wet[k]=FIELD.wet(x,z);a.up[k]=FIELD.upland(x,z);a.rd[k]=riverD(x,z);a.lk[k]=bayIn(x,z);a.u[k]=uvOf(x,z)[0];}
 const at=(arr,x,z)=>{const u=clamp(((x-CENTER[0])/S+.5)*(N-1),0,N-1.001),v=clamp(((z-CENTER[1])/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,S,a,at};})();
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color();
 const SAND=new THREE.Color(0xd8ccb0),LIT=new THREE.Color(0x3a2a20),LITR=new THREE.Color(0x4e3226),RAIN=new THREE.Color(0x4a3a26),RAIN2=new THREE.Color(0x5a4a30),
  SAV=new THREE.Color(0x9a8450),SAV2=new THREE.Color(0x7a7048),SAVG=new THREE.Color(0x5e6e3a),ASH=new THREE.Color(0x4e4a48),SILT=new THREE.Color(0x9a8c74),DELTA=new THREE.Color(0x574836),BED=new THREE.Color(0x8a7a66);
 const sandT=SAND.clone().lerp(BAYCOL,.06);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=CENTER[0]+(x/w-.5)*S,wz=CENTER[1]+(y/h-.5)*S;
  const n=fbm(x/26,y/26,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5);
  const up=FC.at(FC.a.up,wx,wz),wet=FC.at(FC.a.wet,wx,wz),rd=FC.at(FC.a.rd,wx,wz),lk=FC.at(FC.a.lk,wx,wz),uu=FC.at(FC.a.u,wx,wz);
  // the ground colour by zone: jungle litter round the bay, rainforest litter
  // up the slope, savannah tawny with green where the rainforest lets go,
  // volcanic ash darkening toward the NE
  c.copy(LIT).lerp(LITR,clamp(.5+n*1.8,0,1));
  t.copy(RAIN).lerp(RAIN2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.08,.26,up));
  t.copy(SAV).lerp(SAV2,clamp(.5+n*1.7,0,1)).lerp(SAVG,smooth(.62,.42,up)*.6);c.lerp(t,smooth(.40,.62,up));
  c.lerp(ASH,smooth(1800,4200,uu)*.55*smooth(.5,.8,up));
  c.lerp(sandT,smooth(90,6,lk)*.9);                                            // the beach
  c.lerp(SILT,smooth(60,14,rd)*(1-wet*.5));c.lerp(DELTA,smooth(60,14,rd)*wet*.8);   // river banks
  c.lerp(BED,smooth(0,-30,lk));
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// detail: fine grain everywhere, tiled every ~6 m
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x9a9890});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85);}');};
(function(){const N=400,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);g.translate(CENTER[0],0,CENTER[1]);
 const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,terrainH(p.getX(i),p.getZ(i)));
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The bay floor';scene.add(m);})();

// ---------------------------------------------------------------- the water
// 2026-10-20 (migration phase 3): the bay, the river, the cataracts and the outer water are core/water's. The bay and the outer water are
// WATER.open surfaces (89w-host-water.js: the CDLOD mesh with the bed baked from terrainH, a shore grid flooded from the bay, the shared wave
// field, the sky in the water); the river is the WATER.flow below (a line down vR at bed+1.1 m, never climbing downstream), the cataracts its
// WATER.fall records where the descent breaks. The page's own plane (MAT_WATER: one 300x300 plane, vertex colours by depth, ripples in its shader),
// the 10 m ribbon and the foam cards (MAT_FOAM) are gone. BIO.waterH and terrainH are unchanged.
// The bay colour is SWBAY_BAY (50-species): swap the hue there and the tints below follow.
const WATER_SHALLOW=new THREE.Color().setHSL(SWBAY_BAY.hue,.70,.50),WATER_MID=new THREE.Color().setHSL(SWBAY_BAY.hue,.74,.34),WATER_DEEP=new THREE.Color().setHSL(SWBAY_BAY.hue+.03,.70,.14),WATER_PALE=new THREE.Color().setHSL(SWBAY_BAY.hue-.03,.55,.70);
const RIVER_COL=new THREE.Color().setHSL((SWBAY_BAY.hue+.04)%1,.42,.44);
// the old foam card's canvas painted from rng(): the painter stays (the texture is not used) because every placement after it reads the same random stream
BIO.canvasTex(128,256,(g,w,h)=>{g.clearRect(0,0,w,h);
  for(let i=0;i<180;i++){const x=rng()*w,y=rng()*h,L=rr(10,40);rr(1.5,4);rr(-3,3);rng();}
  for(let i=0;i<120;i++){rng();rng();rr(1.5,4);rng();}});
// THE BAY's box: the 2.2 R square the old plane covered
const BAY_BOX=(function(){const S=TERR.R*2.2;return[CENTER[0]-S/2,CENTER[1]-S/2,CENTER[0]+S/2,CENTER[1]+S/2];})();
// THE RIVER: a flow line from the highlands (u 4300) down to the delta's head (u MOUTH_U+380) along vR, a metre and a bit over the bed but never
// climbing downstream (a running maximum from the mouth up: the water fills a hollow in the bed instead of sinking under a rise, and the bed's bumps do not tilt the ribbon), 24 m wide at the mouth to 14 m up
// in the highlands (the old ribbon's half-widths 12 to 7), quicker where it falls
const RIVER_FALL_OPT={steep:.3,minDrop:3.5};
const RIVER_U=[],RIVER_PTS=[];{let yc=-1e9;for(let u=MOUTH_U+380;u<=4300;u+=10){const v=vR(u),x=BAY.c[0]+(u+v)*SQ,z=BAY.c[1]+(v-u)*SQ;yc=Math.max(yc,terrainH(x,z)+1.1);RIVER_U.push(u);RIVER_PTS.push([x,z,yc]);}RIVER_U.reverse();RIVER_PTS.reverse();}
const RIVER=WATER.flow({name:'The river',pts:RIVER_PTS,width:RIVER_U.map(u=>2*(12-5*smooth(1000,4000,u))),
 speed:RIVER_PTS.map((p,i)=>1.1+2.6*smooth(.02,.14,i+1<RIVER_PTS.length?(p[2]-RIVER_PTS[i+1][2])/10:0))});
// the CATARACTS: the slope breaks of the line, each a curtain leaving the lip at the speed that lands it at the foot of the chute (the line's samples
// are 10 m apart, so a five-metre fall is a chute of about 26 degrees: KNOWN_ISSUES.md). The river steps down in terraces of five metres: 58 curtains,
// of which 89w-host-water.js draws the ones within 900 m of the camera)
const RIVER_FALLS=WATER.fallsOf(RIVER,Object.assign({fit:true},RIVER_FALL_OPT)).map(f=>WATER.fall(f));   // fit: the foot fallsOf returns (2026-10-21), the curtain lands on it

// ---------------------------------------------------------------- the far country
// A coarse second terrain, 18 km across (70 m cells), carrying what the map's edge would
// otherwise cut off: the VOLCANO in the north-east (a concave-flanked cone
// with a notched summit, a parasitic cone on its SW flank, ash gullies), the
// crater's RIM ringing the horizon at ~7 km, and the water the bay opens
// into in the SW. Inside the map it duplicates terrainH two metres down so
// the fine mesh always wins. Host-only; the biome never sees it.
const VOLC={c:[4300,-4300],R:3400,H:1900};
function farH(x,z){
 const d=Math.hypot(x-VOLC.c[0],z-VOLC.c[1]),ang=Math.atan2(z-VOLC.c[1],x-VOLC.c[0]);
 let h=8+70*(fbm(x*.00045,z*.00045,301,3)-.5)+14*(fbm(x*.0021,z*.0021,304,2)-.5);
 const t=clamp(1-d/VOLC.R,0,1);
 const ridges=1+.10*(fbm(ang*2.2+9,d*.0011,302,3)-.5)*2*smooth(.05,.5,t);            // ridges and gullies down the flanks
 h+=VOLC.H*Math.pow(t,1.75)*ridges-300*smooth(560,180,d);                              // the cone, the summit notch
 const d2=Math.hypot(x-(VOLC.c[0]-1500),z-(VOLC.c[1]+1350));h+=420*Math.pow(clamp(1-d2/950,0,1),1.5);   // the parasitic cone
 const rd=Math.hypot(x-CENTER[0],z-CENTER[1]),ra=Math.atan2(z-CENTER[1],x-CENTER[0]);
 h+=560*smooth(6300,8300,rd)*(.55+.45*fbm(ra*4+3,rd*.0007,303,3));                    // the crater rim
 const u=uvOf(x,z)[0],v=uvOf(x,z)[1];h-=34*smooth(-1300,-2500,u)*smooth(2600,1100,Math.abs(v));   // the water the bay opens into
 return h;}
(function(){const S=18000,N=260,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);g.translate(CENTER[0],0,CENTER[1]);
 const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color(),t=new THREE.Color();
 const NEAR=TERR.R*1.1,SAV=new THREE.Color(0x8e7a4c),ASH=new THREE.Color(0x5a5452),LAVA=new THREE.Color(0x36302e),CAP=new THREE.Color(0xc8c0b4),RIM=new THREE.Color(0x707a7a),BED=new THREE.Color(0x6a7a70);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),dx=Math.abs(x-CENTER[0]),dz=Math.abs(z-CENTER[1]),inside=Math.max(dx,dz)<NEAR;
  let y;if(inside){const e=smooth(NEAR,NEAR-220,Math.max(dx,dz));y=terrainH(x,z)-2*e;}else y=farH(x,z);p.setY(i,y);
  const d=Math.hypot(x-VOLC.c[0],z-VOLC.c[1]),up=clamp(y/VOLC.H,0,1),n=fbm(x*.0012,z*.0012,305,2)-.5;
  const ang=Math.atan2(z-VOLC.c[1],x-VOLC.c[0]),flow=smooth(.56,.7,fbm(ang*5+2,d*.0016,306,2))*smooth(.1,.3,up)*smooth(.9,.6,up);   // lava flows: dark tongues down from the notch
  c.copy(SAV).lerp(ASH,smooth(.03,.25,up)+smooth(2400,1400,d)*.5).lerp(LAVA,clamp(.35+n*1.4,0,1)*smooth(.2,.6,up)).lerp(CAP,smooth(.72,.9,up)*.85).lerp(new THREE.Color(0x241c1a),flow*.9);
  c.lerp(RIM,smooth(6200,7600,Math.hypot(x-CENTER[0],z-CENTER[1])));c.lerp(BED,smooth(2,-12,y));
  c.multiplyScalar(1+n*.12).convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
 const fm=new THREE.MeshLambertMaterial({vertexColors:true,color:0xa8a49c});
 fm.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',TEX_DETAIL)};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;')
   .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.012).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.0017+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.8);}');};
 const m=new THREE.Mesh(g,fm);m.userData.probeSkip=true;m.userData.inspectLabel='The far country (the volcano, the rim)';m.renderOrder=0;scene.add(m);
 // the far water is core/water's too (89w-host-water.js: a flat open surface under it all, the bay's deep colour)
 // the plume: a chain of soft grey globes off the summit, rising and leaning east, fading as it goes
 const smoke=new THREE.MeshBasicMaterial({color:0xb4b0ac,transparent:true,opacity:.30,depthWrite:false,fog:true});
 const sx=VOLC.c[0],sz=VOLC.c[1],sy=farH(sx,sz)+80;
 for(let i=0;i<16;i++){const tt=i/15,r=170+tt*980,mesh=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),smoke.clone());
  mesh.material.opacity=.32*(1-tt*.8);mesh.position.set(sx+tt*tt*2600+Math.sin(i*2.1)*90,sy+250+tt*2300+Math.cos(i*1.7)*60,sz+Math.sin(i*1.3)*120);
  mesh.userData.probeSkip=true;mesh.userData.inspectLabel='The plume';mesh.renderOrder=2;scene.add(mesh);}
 // fumaroles: three thin plumes off the flanks, leaning the same way
 [[1100,.9],[1500,2.4],[900,4.1]].forEach(F=>{const fx=VOLC.c[0]+Math.cos(F[1])*F[0],fz=VOLC.c[1]+Math.sin(F[1])*F[0],fy=farH(fx,fz)+20;
  for(let i=0;i<7;i++){const tt=i/6,r=40+tt*150,mesh=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),smoke.clone());mesh.material.opacity=.26*(1-tt*.8);
   mesh.position.set(fx+tt*tt*420,fy+80+tt*520,fz+Math.sin(i*1.9)*30);mesh.userData.probeSkip=true;mesh.userData.inspectLabel='A fumarole';mesh.renderOrder=2;scene.add(mesh);}});
})();
