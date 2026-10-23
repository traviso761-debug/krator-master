// ================================================================= HOST — stage (n semiarid: a transect of the north basin)
// The ideal-type host for the N SEMIARID kit: everything a world provides that a biome does not. Renderer, lights, haze,
// the terrain with terrainH(), the local water surface waterH() (the remnant salt lake, the stream from the uplands, a
// spring pool), the climate fields the kit asks for, the painted ground, the tick list, the error panel. A real world
// (openworld/north-basin, to come) replaces this whole section with its own; the kit's fragments never read anything
// from it except through BIO.host.
//
// THE MAP (x east, z south, north is -z; origin mid-plain, R 3400). One transect of the region compressed into 6.8 km,
// so every zone of the kit stands somewhere a camera can reach (biomes/nsemiarid/PLAN.md, sections 1, 2, 7):
//   z < -900          THE OLD LAKE BED: a basin round BED (-700,-2500) falling from the plain's edge (~680 m) to a
//                     remnant salt lake at 380 m (the west lobe's in small). Its marks are core/terrain's KBASIN's: the
//                     old full level (640 m) with its beach ridge and bathtub ring, the fast drain down to the sill
//                     (560 m), and the strandlines of the slow recession down to the water; salt rising toward the
//                     lake, a dune field on its downwind (east) shore. The lowland desert (BWh)
//   -900 < z < 700    THE STEPPE: the hot steppe (BSh), 680-760 m, gently swelling
//   700 < z < 1900    THE FOOTHILLS: the Mediterranean belt (Csa), 780-1150 m, basalt ridges, a spring pool
//   z > 1900          THE UPLAND: the rainy plateau (Cfa), 1200-1450 m, the feral fruit forest
//   the STREAM        from the upland north down the transect into the lake; golden poplar where it reaches the bed
//                     (the tropical lake margins: warm, low and wet)
// The fields are the host's own (this is a showcase): wet from rain rising southward and from the stream and the lake;
// cold from height (a little, all of it warm); salt, bed, silt and strand from KBASIN; rock from the slope and the
// basalt ridges; dune on the lake's lee shore.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// dense air (~1.42 atm): a milky, warm horizon and a softer, bluer fill (biomes/WORLD.md, "The air")
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd8ccb8);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00013);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0xc8d4e4,0x6a5a44,.66));
const sun=new THREE.DirectionalLight(0xfff0d8,1.5);sun.position.set(-1000,1150,-560);scene.add(sun);
const fill=new THREE.DirectionalLight(0xd8c4a8,.24);fill.position.set(900,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:3400};
const BED={x:-700,z:-2500,r:2300};            // the old lake's basin
const LAKE={level:380,full:640,sill:560,ring:30};
const POOL={x:900,z:1350,r:38};                // the spring pool in the foothills
// the stream's centreline (x of z) from the upland down to the lake, and its channel
function xS(z){return 260+260*Math.sin(z*.0011+.6)+80*Math.sin(z*.0037)-300*smooth(-200,-1600,z);}
const SW=7;                                     // the stream's half-width (m)
function bedR(x,z){const dx=x-BED.x,dz=(z-BED.z)*1.15,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)*(1+.08*Math.sin(3*a+1)+.05*Math.sin(5*a));}
// the land without the basin's marks or the stream: a plain swelling south into foothills and the upland plateau
function baseH(x,z){
 const plain=700+30*(fbm(x*.0008+3,z*.0008-1,17,3)-.5)*2+.012*z;
 const foot=smooth(700,1900,z),up=smooth(1700,2600,z);
 let h=plain+foot*360*(.85+.3*(fbm(x*.0013-5,z*.0013+2,19,3)-.5))+up*260;
 // basalt ridges in the foothills: long benched spurs running north
 const rd=1-Math.abs(2*fbm(x*.0021+7,z*.0009-3,23,3)-1);h+=foot*(1-up*.6)*smooth(.55,.9,rd)*90;
 // the old lake's bowl: from the plain's edge down to its floor
 const r=bedR(x,z),bowl=smooth(BED.r*1.05,BED.r*.25,r);h=mix(h,LAKE.level-50+20*(fbm(x*.002,z*.002,29,2)-.5),bowl);
 // the dune field on the lake's lee (east) shore: lunettes and barchans
 const dk=duneK(x,z);if(dk>0)h+=dk*(9*Math.pow(1-Math.abs(2*fbm(x*.011+z*.003,z*.006,41,2)-1),1.6)+3);
 return h;}
function duneK(x,z){const dx=x-(BED.x+1200),dz=z-(BED.z+300);return smooth(1300,600,Math.hypot(dx*.8,dz*1.2))*smooth(.4,.6,fbm(x*.002+4,z*.002,43,2));}
// the old lake's marks (core/terrain/40-core-basin.js): the full level, the ring, the drain band, the strandlines
const bedMember=(x,z)=>smooth(BED.r*1.15,BED.r*.95,bedR(x,z));
const BASIN=KBASIN.create({seed:41,wind:[1,.3],strand:{a:.5},lakes:[{name:'the old lake',kind:'dam',level:LAKE.full,sill:LAKE.sill,ring:LAKE.ring,remnant:LAKE.level,member:bedMember}]});
function landH(x,z){const h=baseH(x,z);return bedMember(x,z)>0?BASIN.land(x,z,h):h;}
// the stream: a bed that never climbs downstream (north, toward the lake), sampled along z once. Walked from the upland
// north, the bed is the lowest the land has been since: where the land dips the bed follows it down, where it rises again
// (a strandline's bench, a dune's foot) the stream cuts a trench through it, never a bridge over it (2026-10-22: it took
// the highest ground north of it instead, and the water floated over every hollow). cut is how deep the trench is.
const SB=(function(){const z0=-TERR.R*1.15,z1=TERR.R*1.15,dz=10,n=Math.round((z1-z0)/dz),a=new Float32Array(n+1),cut=new Float32Array(n+1);
 for(let i=0;i<=n;i++){const z=z0+i*dz;a[i]=landH(xS(z),z)-1.6;}
 for(let i=n-1;i>=0;i--){const g=a[i];a[i]=Math.min(g,a[i+1]);cut[i]=g-a[i];}
 const at=(A,z)=>{const f=clamp((z-z0)/dz,0,n-.001),i=Math.floor(f);return lerp(A[i],A[i+1],f-i);};
 return{z0,dz,n,a,cut,at:z=>at(a,z),cutAt:z=>at(cut,z)};})();
const streamD=(x,z)=>Math.abs(x-xS(z));
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);
 // the channel: a bowl under the water (0.9 m deep at the middle, its banks over the water by the ribbon's edge), cut down
 // where the land stands higher and built up where it falls away across the stream, so the water always sits in it;
 // its sides widen with the trench's depth
 const d=streamD(x,z);if(d<60+SW*2){const ct=SB.cutAt(z),bw=SW*4+ct*2.2;if(d<bw){const t=SB.at(z)-.4+1.3*(d/SW)*(d/SW);
  h=mix(t,Math.min(h,t),smooth(SW*1.3,bw,d));}}
 const pd=Math.hypot(x-POOL.x,z-POOL.z);if(pd<POOL.r*2){h=mix(h,POOL.lv-1.6,smooth(POOL.r*1.6,POOL.r*.4,pd));}
 return h;}
POOL.lv=(function(){let lo=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;lo=Math.min(lo,landH(POOL.x+Math.cos(a)*POOL.r*1.2,POOL.z+Math.sin(a)*POOL.r*1.2));}return lo-.6;})();
// THE WATER is core/water's (core/water/README.md): the remnant salt lake and the spring pool are STILL water, the stream
// a FLOW down its bed into the lake. These records are the water's one truth: waterH below answers from them, so every
// plant kept out of the water and every seed kept above it agrees with what 89b-host-atmos.js draws from them.
// the lake's shore: rays from the bed's middle out to where the land rises over the level (a few metres more, so the
// flat water runs under the bank instead of stopping short of it); never past .62 of the bed
const LAKE_POLY=(function(){const P=[],N=96;for(let k=0;k<N;k++){const a=k/N*TAU,cx=Math.cos(a),cz=Math.sin(a);let r=20,last=20;
  for(;r<BED.r*1.2;r+=8){const x=BED.x+cx*r,z=BED.z+cz*r;if(bedR(x,z)>BED.r*.62)break;if(landH(x,z)>LAKE.level+.5)break;last=r;}
  P.push([BED.x+cx*(last+6),BED.z+cz*(last+6)]);}return P;})();
const LAKE_W=WATER.still({name:'The remnant salt lake',level:LAKE.level,poly:LAKE_POLY});
const POOL_W=WATER.still({name:'The spring pool',level:POOL.lv,poly:Array.from({length:32},(_,k)=>[POOL.x+Math.cos(k/32*TAU)*POOL.r*1.3,POOL.z+Math.sin(k/32*TAU)*POOL.r*1.3])});
// the stream: from the upland's edge north, 10 m a step, on the bed (never below the lake it runs into), until it is in it
const STREAM_PTS=(function(){const P=[];for(let z=TERR.R*1.1;z>-TERR.R*1.15;z-=10){const x=xS(z),y=Math.max(SB.at(z)+.5,LAKE.level);P.push([x,z,y]);if(LAKE_W.contains(x,z))break;}return P;})();
const STREAM=WATER.flow({name:'The stream',pts:STREAM_PTS,width:SW*2,speed:STREAM_PTS.map((p,i)=>{const q=STREAM_PTS[Math.min(i+1,STREAM_PTS.length-1)];return clamp(.5+(p[2]-q[2])*.6,.4,2.2);})});
// the cheap tests only skip what cannot be wet; what can is asked of the record (core/water's order: still before flow)
function waterH(x,z){if(bedR(x,z)<BED.r*.66&&LAKE_W.contains(x,z))return LAKE.level;
 if(Math.abs(x-POOL.x)<POOL.r*1.4&&Math.abs(z-POOL.z)<POOL.r*1.4&&POOL_W.contains(x,z))return POOL.lv;
 if(streamD(x,z)<SW*1.6&&STREAM.contains(x,z))return STREAM.heightAt(x,z);
 return -1e9;}

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
const BS={};
function fieldsAt(x,z,h,slope){const sd=streamD(x,z),wd=waterH(x,z),near=wd>-1e8&&h-wd<3?1:0;
 const B=BASIN.sample(x,z,h,BS),r=bedR(x,z);
 // rain: the steppe's ~400 mm on the plain, ~250 on the bed, ~700 in the foothills, ~1,300 on the upland (wet ~ rain/1800)
 let wet=.2+.18*smooth(600,1900,z)+.32*smooth(1700,2600,z)-.08*smooth(BED.r*1.1,BED.r*.6,r);
 const nearS=smooth(70,8,sd);wet=Math.max(wet,nearS*.85,near*.9,smooth(BED.r*.7,BED.r*.55,r)*smooth(LAKE.level+25,LAKE.level+3,h)*.85);
 const flow=Math.max(smooth(40,6,sd),smooth(POOL.r*2.4,POOL.r*1.1,Math.hypot(x-POOL.x,z-POOL.z))*.9)*(wd>-1e8&&h-wd>4?.4:1);
 const ridge=smooth(.55,.9,1-Math.abs(2*fbm(x*.0021+7,z*.0009-3,23,3)-1))*smooth(700,1900,z);
 const rock=clamp(Math.max(smooth(.38,.7,slope)*.9,ridge*smooth(.25,.45,slope)*.8),0,1);
 return{wet:clamp(wet,0,1),flow:clamp(flow,0,1),upland:clamp((h-650)/800,0,1),canyon:0,rim:0,rock,dune:duneK(x,z),oasis:0,slope,abyss:0,
  salt:B.salt,cold:clamp((h-900)/2600,0,1),bed:B.bed,silt:B.silt,strand:B.strand,ring:B.ring,shore:B.shore,band:B.band,scour:0,dry:B.dry/1000};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','bed','silt','strand','ring','shore','band','scour','dry'];
const FC=(function(){const N=420,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the transect's showplaces, the lake shore to the upland, along the stream
const SPINE=[[BED.x+300,BED.z+900],[BED.x-600,BED.z+1200],[BED.x+1100,BED.z+300],[BED.x+400,BED.z-200]];
for(let z=-1700;z<=3000;z+=600)SPINE.push([xS(z),z]);
SPINE.push([-1600,-300],[1500,-200],[-1400,1200],[POOL.x,POOL.z],[1700,1500],[-1200,2600],[1400,2700]);
BIO.init({tags:'nsemiarid',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,seed:17,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:400,mid:1000,far:2600,floor:[360,880]},
 windows:{water:[-TERR.R,-TERR.R,TERR.R,TERR.R]}});
BIO.setSun([-1000,1150,-560]);
const WIND=[1,.3];   // the prevailing wind this stage binds (NSEMIARID.setWind in 88-host-build: the kit loads after the stage)

// ---------------------------------------------------------------- the ground
// One mesh, painted by zone from the field cache: the steppe's tan and sage, the bed's pale silt with its strandlines
// and the bathtub ring's bleached band, salt white toward the lake, the dunes' sand, olive foothills with their basalt,
// the upland's green, grass and damp at the stream.
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const STEP=K(0xb4a07a),STEP2=K(0xa89a74),SAGE=K(0x9aa284),SILT=K(0xcdbfa2),SILT2=K(0xc2b294),SALT=K(0xf0ece2),SALT2=K(0xe4ddd0),RING=K(0xe8e2d4),STRAND=K(0xa8987a),
  SAND=K(0xdcc49a),SAND2=K(0xe8d4ac),OLIVE=K(0x8a8a5a),OLIVE2=K(0x9a9466),BASALT=K(0x4e4844),BASALT2=K(0x5e5650),GREEN=K(0x5e8a3a),GREEN2=K(0x6e9644),
  SOIL=K(0x7a6248),GRASS=K(0x7a9a44),DAMP=K(0x4a4430);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),F=nm=>FC.at(FC.a[nm],wx,wz);
  const wet=F('wet'),flow=F('flow'),rock=F('rock'),salt=F('salt'),bed=F('bed'),silt=F('silt'),strand=F('strand'),ring=F('ring'),dune=F('dune'),up=F('upland');
  // the steppe: tan and sage
  c.copy(STEP).lerp(STEP2,clamp(.5+n*1.8,0,1)).lerp(SAGE,smooth(.45,.7,fbm(x/60+3,y/60,.6,2))*.5);
  // the foothills: olive, the upland: green over red-brown soil
  t.copy(OLIVE).lerp(OLIVE2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.3,.42,wet)*.8);
  t.copy(GREEN).lerp(GREEN2,clamp(.5+n*1.6,0,1)).lerp(SOIL,smooth(.55,.75,fbm(x/50,y/50,.8,2))*.35);c.lerp(t,smooth(.46,.6,wet)*(1-flow*.3));
  // the old bed: pale silt, the strandlines a little darker, the ring bleached, salt toward the water
  t.copy(SILT).lerp(SILT2,clamp(.5+n*1.6,0,1));c.lerp(t,bed*smooth(.1,.5,silt)*.9);
  c.lerp(STRAND,strand*.14);c.lerp(RING,ring*.75);
  t.copy(SALT).lerp(SALT2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.25,.75,salt)*.92);
  // the dunes: sand
  t.copy(SAND).lerp(SAND2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.1,.5,dune)*.9);
  // basalt where the rock shows
  t.copy(BASALT).lerp(BASALT2,clamp(.5+n*1.8,0,1));c.lerp(t,smooth(.45,.85,rock)*.6);
  // the stream's banks: grass, damp at the water
  c.lerp(GRASS,smooth(.3,.8,flow)*.55);c.lerp(DAMP,smooth(.75,1,flow)*.5);
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// mud cracks on the dry bed (a polygon net), in the vertex weight aCrack
const TEX_CRACK=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(90,80,64,.55)';g.lineCap='round';
 const P=[];for(let i=0;i<22;i++)P.push([rng()*w,rng()*h]);
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>w*.34)continue;if(rng()<.45)continue;
  g.lineWidth=rr(1.2,2.4);for(let k=-1;k<=1;k++)for(let m=-1;m<=1;m++){g.beginPath();g.moveTo(a[0]+k*w,a[1]+m*h);g.quadraticCurveTo((a[0]+b[0])/2+rr(-14,14)+k*w,(a[1]+b[1])/2+rr(-14,14)+m*h,b[0]+k*w,b[1]+m*h);g.stroke();}}});
// THE LIBRARY GROUND LAYERS (materials.json ground.*): seven surfaces blended per vertex by zone over the painted ground,
// as the eastern badlands' host does. A keep-0 layer multiplies the painted colour by its relief, a keep-1 layer shows its
// own colour, the others mix the two. Without the pack (?mat=proc, or no tex/) the ground is exactly the painted one.
// GL: [library set, weight(F)] with F the cached fields at the vertex.
const GL=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;
 const P=n=>KMAT.packed('nsemiarid','ground.'+n),rk=F=>smooth(.45,.85,F.rock),dn=F=>smooth(.1,.5,F.dune),open=F=>(1-F.bed*.9)*(1-dn(F))*(1-rk(F));
 const L=[['steppe',F=>smooth(.42,.3,F.wet)*open(F)],['withered',F=>smooth(.3,.42,F.wet)*smooth(.6,.46,F.wet)*open(F)],
  ['grass',F=>smooth(.46,.6,F.wet)*open(F)],['silt',F=>.6*F.bed*smooth(.1,.5,F.silt)*smooth(.6,.3,F.salt)*(1-dn(F))*(1-F.ring)],
  ['crust',F=>.5*clamp(F.ring*.8+smooth(.2,.45,F.salt)*smooth(.85,.6,F.salt),0,1)*(1-dn(F))],['sand',F=>dn(F)],['basalt',F=>rk(F)*.85]];
 if(L.some(l=>!P(l[0])))return null;
 return L.map(l=>{const e=P(l[0]);return{name:l[0],w:l[1],tex:KMAT.textures(e,{aniso:8}).map,scale:e.scale[0],keep:e.tint,mean:e.mean};});})();
// the layers' anti-tiling (2026-10-22): a library set repeats every few metres, and over a plain the repeat reads as a
// grid. Each layer is sampled twice, the second turned 37 degrees, scaled by 1.37 and shifted, and the two are blended by
// a value noise about eight tiles across, so neighbouring tiles never match (a game engine does the same in its ground
// shader: two taps and a noise)
const GTEX=['float gHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
 'float gNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(gHash(i),gHash(i+vec2(1.0,0.0)),f.x),mix(gHash(i+vec2(0.0,1.0)),gHash(i+vec2(1.0,1.0)),f.x),f.y);}',
 'vec3 gTex(sampler2D s,vec2 p){float n=gNoise(p*0.13)*0.65+gNoise(p*0.41+7.3)*0.35;vec2 q=vec2(p.x*0.7986-p.y*0.6018,p.x*0.6018+p.y*0.7986)*1.37+vec2(0.37,0.71);',
 ' return mix(texture2D(s,p).rgb,texture2D(s,q).rgb,smoothstep(0.3,0.7,n));}'].join('\n');
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xa8a29a});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uCrack={value:TEX_CRACK};
 let lay='';
 if(GL){GL.forEach((l,i)=>{sh.uniforms['uGL'+i]={value:l.tex};});
  // a custom sampler is not decoded from sRGB for us: pow 2.2 by hand; a keep-0 layer is its relief, normalised by the
  // pack's mean brightness so the painted colour keeps its level
  // with distance a layer's grain fades toward the painted ground (from 60 m to 450 m): far off its crack nets and tufts
  // read as a lattice, not as ground
  lay='{vec3 _b=diffuseColor.rgb,_a=vec3(0.0);float _s=0.0;vec2 _p=vGWP.xz;float _fd=1.0-0.75*smoothstep(60.0,450.0,length(cameraPosition-vGWP));'+GL.map((l,i)=>{const m=Math.pow(l.mean==null?.78:l.mean,2.2).toFixed(4),
    w='vGL'+Math.floor(i/4)+'.'+'xyzw'[i%4];
   return 'if('+w+'>0.003){vec3 t=pow(gTex(uGL'+i+',_p*'+(1/l.scale).toFixed(4)+'),vec3(2.2));_a+='+w+'*mix(_b*t/'+m+',t,'+l.keep.toFixed(2)+');_s+='+w+';}';}).join('')+
   'diffuseColor.rgb=mix(_b,_a/max(_s,0.001),clamp(_s*_fd,0.0,1.0));vGLs=_s*_fd;}';}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;varying float vCrack;'+(GL?'attribute vec4 aGL0,aGL1;varying vec4 vGL0,vGL1;':''))
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;'+(GL?'vGL0=aGL0;vGL1=aGL1;':''));
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uCrack;varying vec3 vGWP;varying float vCrack;'+
   (GL?'varying vec4 vGL0,vGL1;'+GL.map((l,i)=>'uniform sampler2D uGL'+i+';').join('')+GTEX:''))
  .replace('#include <map_fragment>','#include <map_fragment>\n{float vGLs=0.0;vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 ck=texture2D(uCrack,vGWP.xz*0.11).rgb;'+lay+
   // the procedural grain gives way where a library layer carries its own; the mud cracks stay (the bed's polygons are larger)
   'diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85*(1.0-0.7*clamp(vGLs,0.0,1.0)))*mix(vec3(1.0),ck,vCrack);}');};
// THE STREAM'S ROWS (2026-10-23, the owner: "stream is not continuous"): a cell is 13.4 m and the stream 14 m wide, so a
// triangle whose corners missed the channel bridged it and hid the water in long gaps. In every row the stream crosses,
// the vertex nearest it moves onto its centreline and the next ones onto its banks (6.5 m, under the water's edge; 17 m,
// up the bank), a monotone shift along the row; and those quads take the lower of their two diagonals, so the channel
// runs down the triangles instead of across them.
const GROUND=(function(){const N=560,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),ck=new Float32Array(nx*nx);
 const g0=GL?new Float32Array(nx*nx*4):null,g1=GL?new Float32Array(nx*nx*4):null,F={};
 const sz0=STREAM_PTS[STREAM_PTS.length-1][1]-cs*2,sz1=STREAM_PTS[0][1]+cs*2,IC=new Int32Array(nx).fill(-99);
 for(let j=0;j<nx;j++){const z=-S/2+j*cs;if(z>=sz0&&z<=sz1)IC[j]=Math.round((xS(z)+S/2)/cs);}
 const KNOT=[0,6.5,17];
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,z=-S/2+j*cs,o=i-IC[j];let x=-S/2+i*cs;
  if(Math.abs(o)<=2&&i>0&&i<N)x=xS(z)+Math.sign(o)*KNOT[Math.abs(o)];
  const y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  ck[k]=FC.at(FC.a.bed,x,z)*smooth(.15,.5,FC.at(FC.a.silt,x,z))*(1-smooth(.3,.7,FC.at(FC.a.dune,x,z)))*smooth(.05,.4,FC.at(FC.a.salt,x,z)+.1)*.85;
  if(GL){FNAMES.forEach(n=>F[n]=FC.at(FC.a[n],x,z));let s=0;const w=GL.map(l=>{const v=clamp(l.w(F),0,1);s+=v;return v;}),k1=s>1?1/s:1;
   for(let q=0;q<4;q++){g0[k*4+q]=w[q]*k1;g1[k*4+q]=(w[q+4]||0)*k1;}}}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;
  if(Math.abs(i-IC[j])<=3&&pos[a*3+1]+pos[c*3+1]<pos[b*3+1]+pos[d*3+1]){idx[t++]=a;idx[t++]=b;idx[t++]=c;idx[t++]=a;idx[t++]=c;idx[t++]=d;}   // the lower diagonal (a stream row)
  else{idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aCrack',new THREE.BufferAttribute(ck,1));
 if(GL){g.setAttribute('aGL0',new THREE.BufferAttribute(g0,4));g.setAttribute('aGL1',new THREE.BufferAttribute(g1,4));}
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The northern semiarid country';scene.add(m);return m;})();

// ---------------------------------------------------------------- the water
// drawn by core/water in 89b-host-atmos.js (it needs core/atmos's clock, wave chunk and sky light, bound there); here the
// volumes the inspector names
REGISTER({name:'The old lake bed (the west lobe in small)',x:BED.x,z:BED.z,y:LAKE.level-60,r:BED.r,h:LAKE.full-LAKE.level+120});
REGISTER({name:'The spring pool',x:POOL.x,z:POOL.z,y:POOL.lv-10,r:POOL.r*5,h:60});
