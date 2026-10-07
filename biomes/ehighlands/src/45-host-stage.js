// ================================================================= HOST — stage
// The ideal-type host for the EASTERN HIGHLANDS: everything a world provides that a biome does not. Renderer, the
// light of thin air, the terrain with terrainH(), the local water surface waterH() (the tarn, the bog's pools, the
// stream), the climate fields the kit asks for, the tick list, the error panel. The ground and the water are painted
// later (84-host-ground.js). A real world replaces this whole section with its own; the kit's fragments never read
// anything from it except through BIO.host.
//
// THE MAP (x east, z south, north is -z; origin at the map's centre, R 2600). A 5.2 km piece of the high plateau
// (the owner's altiplano: about 0.6 atm, cold, clear):
//   the puna          215-240 m: a rolling plain of gold bunchgrass and sedge turf, poured cushions and woolbacks
//   THE MOTHER        one cushion grown over a whole hill, 520 m across and 42 m high, north-east of the centre,
//   CUSHION           higher on its giant-facing side; two rills cut through it
//   THE BOFEDAL       a cushion bog on the valley floor in the west: a green quilt with dark pools, the frozen tarn
//                     at its west end, the stream coming down to it from the range's gully
//   THE RANGE         the south: the plateau climbs to a ridge at ~700 m. Its north face is the sunward one (the dry
//                     slope: vigil spikes, thorn cushions, hoar cereus), scree above it (glass towers, woolbacks,
//                     snow wool), snow on the crest. Two gullies (quebradas) cut it: ragbark woods in them
//   THE GEYSER FIELD  a sinter shield in the east, six vents
//   TORS              five dark volcanic outcrops on the plain (the woolbacks' boulders, the bees' cliffs)
// THE GIANT stands in the north-east (azimuth 66, altitude 25: LORE.md). Everything the kit grows leans and fans toward
// it; the host only says where it is (EHIGH.setGiant).
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
// a shader that fails to compile is only a console error in three.js, and its mesh silently does not draw: the panel
// shows it, so verify.py fails on it (crater-drylands' lesson)
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT OF THIN AIR (biomes/WORLD.md, the dense-air section read the other way): at ~0.6 atm and 0.75 g the column
// overhead is about 0.8x Earth's. The zenith is a deep blue, the sun white and hard, the fill weak (less of the light is
// skylight), so shadows are dark and the key-to-fill ratio high; distance barely fades: ridges 20 km off stay sharp.
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb4c8e4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.000042);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,16000);
scene.add(new THREE.HemisphereLight(0x7c9ed8,0x8a7656,.52));
const SUNP=[-820,1150,-640];
const sun=new THREE.DirectionalLight(0xfff4e4,1.72);sun.position.set(...SUNP);scene.add(sun);
const fill=new THREE.DirectionalLight(0x9ab4e4,.12);fill.position.set(800,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
// the giant's bearing on the ground (azimuth 66 from north, clockwise; x east, z south)
const GIANT_AZ=66,GX=Math.sin(GIANT_AZ*Math.PI/180),GZ=-Math.cos(GIANT_AZ*Math.PI/180);
// the Mother Cushion: centre, radius, height; its crown sits toward the giant (PEAK m along its bearing)
const MOTHER={x:520,z:-760,r:260,h:42,peak:62,name:'The Mother Cushion'};
// the tors: dark volcanic outcrops on the plain
const TORS=[{x:-250,z:-1350,r:95,h:30,s:1.3,name:'The Hive Tor'},{x:1250,z:-1500,r:70,h:22,s:2.2},{x:-1800,z:-700,r:80,h:26,s:3.1},
 {x:120,z:620,r:60,h:18,s:4.4},{x:1850,z:900,r:75,h:20,s:5.6}];
// the bofedal (a rotated ellipse) and the tarn at its west end
const BOG={x:-650,z:280,rx:760,rz:270,a:.12,y:214};
const TARN={x:-1180,z:250,r:170};
// the range: its foot runs east-west at zF(x); it climbs to the crest about 1.3 km south of that
function zF(x){return 760+180*Math.sin(x*.0011+.7)+70*Math.sin(x*.0029+2)+20*Math.sin(x*.011);}
// the gullies: they run north out of the range; xg(z) is each one's line
const GULLY=[{x0:-860,a:130,k:.0021,ph:.4,w:70,name:'The west gully'},{x0:760,a:110,k:.0024,ph:2.1,w:60,name:'The east gully'}];
const xg=(G,z)=>G.x0+G.a*Math.sin(z*G.k+G.ph)+30*Math.sin(z*.007+G.ph);
// the geyser field
const GEO={x:1560,z:240,r:280};
const VENTS=[[1520,200,1],[1600,300,.7],[1660,150,.55],[1450,320,.6],[1700,280,.45],[1560,90,.5]].map(v=>({x:v[0],z:v[1],k:v[2]}));

function torAt(x,z){let h=0,rock=0,foot=0;
 for(let i=0;i<TORS.length;i++){const K=TORS[i],dx=x-K.x,dz=z-K.z,D=Math.hypot(dx,dz);if(D>K.r*1.7)continue;
  const a=Math.atan2(dz,dx),d=D/(K.r*(1+.2*Math.sin(3*a+K.s)+.12*Math.sin(7*a+2*K.s)+.15*(fbm(x*.02+K.s,z*.02,300+i,2)-.5)));
  // a blocky volcanic tor: columnar risers and broken ledges, not a granite dome
  const core=smooth(1.0,.45,d);let hh=K.h*Math.pow(core,.45)*(.8+.4*fbm(x*.04,z*.04,310+i,2));
  const q=hh/4.5;hh=mix(hh,(Math.floor(q)+smooth(.7,.95,q-Math.floor(q)))*4.5,.6*core);
  hh+=K.h*.08*smooth(1.5,.95,d)*smooth(.65,1.0,d);
  h=Math.max(h,hh);rock=Math.max(rock,smooth(1.15,.9,d));foot=Math.max(foot,smooth(1.0,1.15,d)*smooth(1.6,1.2,d));}
 return{h,rock,foot};}
function bogAt(x,z){const ca=Math.cos(BOG.a),sa=Math.sin(BOG.a),dx=x-BOG.x,dz=z-BOG.z,u=(dx*ca+dz*sa)/BOG.rx,v=(-dx*sa+dz*ca)/BOG.rz;
 const d=Math.hypot(u,v)*(1+.14*(fbm(x*.004,z*.004,41,2)-.5));return smooth(1.05,.75,d);}
function motherAt(x,z){const dx=x-MOTHER.x,dz=z-MOTHER.z,u=dx*GX+dz*GZ,v=-dx*GZ+dz*GX;
 // lopsided: the crown sits PEAK m toward the giant, the giant side short and steep, the far side long
 const uu=u-MOTHER.peak,ru=uu>0?MOTHER.r*.72:MOTHER.r*1.18,a=Math.atan2(v,u);
 const r=Math.hypot(uu/ru,v/(MOTHER.r*.95))*(1+.08*Math.sin(5*a+1)+.05*Math.sin(9*a+2.3));
 return{r,m:smooth(1.0,.86,r),h:MOTHER.h*Math.pow(Math.max(0,1-r*r),.7)};}
// the rills through the Mother: two lines crossing it, cut by meltwater
function rillD(x,z){const dx=x-MOTHER.x,dz=z-MOTHER.z;
 const d1=Math.abs(dz-(-.55*dx+30+14*Math.sin(dx*.03))),d2=Math.abs(dx-(.35*dz-70+10*Math.sin(dz*.04)));return Math.min(d1,d2);}
function rangeH(x,z){const f=zF(x),t=clamp((z-f)/1350,0,1.4);
 const crest=470+60*(fbm(x*.0016+2,1.3,51,2)-.5);
 let h=crest*Math.pow(smooth(0,1.05,t),1.25);
 // the face is ribbed by spurs and runnels, rougher higher up
 h+=t>0?(26*(fbm(x*.006,z*.006,53,3)-.5)+14*(fbm(x*.02,z*.02,54,2)-.5))*smooth(0,.4,t):0;
 return h;}
function gullyCut(x,z){let cut=0,flow=0,wall=0;
 for(const G of GULLY){const d=Math.abs(x-xg(G,z)),f=zF(x),t=clamp((z-f+150)/1200,0,1);if(t<=0)continue;
  const depth=46*smooth(0,.35,t)*smooth(1,.7,t),w=G.w*(.5+.6*smooth(0,.5,t));
  cut=Math.max(cut,depth*Math.pow(smooth(w,0,d),1.3));flow=Math.max(flow,smooth(w*.35,0,d)*smooth(0,.12,t));wall=Math.max(wall,smooth(w,w*.25,d)*smooth(0,.25,t));}
 return{cut,flow,wall};}
// the stream: from the west gully's floor down onto the plain, through the bofedal into the tarn, out to the west
const SPTS=(function(){const P=[],G=GULLY[0];for(let z=1650;z>=zF(xg(G,z))-60;z-=40)P.push([xg(G,z),z]);
 const e=P[P.length-1];[[e[0]-60,e[1]-140],[e[0]-110,e[1]-260],[-930,330],[-1020,290],[TARN.x+TARN.r*.6,TARN.z+20]].forEach(p=>P.push(p));
 [[TARN.x-TARN.r*.7,TARN.z-10],[-1550,200],[-1900,240],[-2250,170],[-2700,190]].forEach(p=>P.push(p));return P;})();
const STREAMW=4.5;
function streamD(x,z){let best=1e9,bt=0;for(let i=0;i<SPTS.length-1;i++){const a=SPTS[i],b=SPTS[i+1],ux=b[0]-a[0],uz=b[1]-a[1],L2=ux*ux+uz*uz;
  let t=((x-a[0])*ux+(z-a[1])*uz)/L2;t=clamp(t,0,1);const d=Math.hypot(x-a[0]-ux*t,z-a[1]-uz*t);if(d<best){best=d;bt=i+t;}}
 return{d:best,s:bt};}
function geoAt(x,z){const d=Math.hypot(x-GEO.x,z-GEO.z)/GEO.r*(1+.12*(fbm(x*.01,z*.01,61,2)-.5));return smooth(1.05,.75,d);}
function plainH(x,z){return 226+10*(fbm(x*.0007+3,z*.0007-1,17,3)-.5)+5*(fbm(x*.0025-5,z*.0025+2,19,2)-.5)-8*smooth(-200,-2400,x)*smooth(-600,600,z);}
function landH(x,z){let h=plainH(x,z)+rangeH(x,z);
 const T=torAt(x,z);h+=T.h;
 const M=motherAt(x,z);h+=M.h;
 const g=geoAt(x,z);if(g>0){const d=Math.hypot(x-GEO.x,z-GEO.z),q=(d/GEO.r)*6;h+=4*g+1.2*g*(smooth(.75,.95,q-Math.floor(q)));}   // a terraced sinter shield
 const b=bogAt(x,z);if(b>0)h=mix(h,BOG.y+1.2*(fbm(x*.01,z*.01,71,2)-.5),b);
 return h;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);
 h-=gullyCut(x,z).cut;
 // the rills cut through the Mother's cushion and the peat under it
 const M=motherAt(x,z);if(M.m>0){const rd=rillD(x,z);h-=3.2*smooth(5,1,rd)*smooth(.2,.6,M.m);}
 const S=streamD(x,z);if(S.d<STREAMW+5)h-=1.5*smooth(STREAMW+5,STREAMW*.5,S.d);
 const dt=Math.hypot(x-TARN.x,z-TARN.z);if(dt<TARN.r*1.5)h=mix(h,TARN.y0-5*smooth(TARN.r,0,dt),smooth(TARN.r*1.35,TARN.r*.85,dt));
 for(const P of POOLS){const dp=Math.hypot(x-P.x,z-P.z);if(dp<P.r*1.5)h-=1.1*smooth(P.r*1.4,P.r*.5,dp);}
 return h;}
TARN.y0=BOG.y-.4;
// the bog's pools: dark round water among the cushions (placed by a fixed stream of numbers)
const POOLS=(function(){reseed(4407);const P=[];let tries=0;
 while(P.length<34&&tries++<4000){const x=BOG.x+rr(-BOG.rx,BOG.rx),z=BOG.z+rr(-BOG.rz,BOG.rz);if(bogAt(x,z)<.85||Math.hypot(x-TARN.x,z-TARN.z)<TARN.r*1.6||streamD(x,z).d<20)continue;
  const r=rr(5,17);if(P.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+r+8))continue;P.push({x,z,r});}return P;})();
const TARNL=(function(){let lo=1e9;for(let k=0;k<24;k++){const a=k/24*TAU;lo=Math.min(lo,terrainH0(TARN.x+Math.cos(a)*TARN.r*1.2,TARN.z+Math.sin(a)*TARN.r*1.2));}return lo-.25;})();
POOLS.forEach(P=>{let lo=1e9;for(let k=0;k<12;k++){const a=k/12*TAU;lo=Math.min(lo,terrainH0(P.x+Math.cos(a)*P.r*1.15,P.z+Math.sin(a)*P.r*1.15));}P.y=lo-.12;});
// the stream's water: a little under the bank's line at the nearest point of the bed (the bed was cut 1.5 m)
function waterH(x,z){if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r*1.3)return TARNL;
 for(const P of POOLS)if(Math.hypot(x-P.x,z-P.z)<P.r*1.2)return P.y;
 const S=streamD(x,z);if(S.d<STREAMW+1){const i=Math.min(SPTS.length-2,Math.floor(S.s)),t=S.s-i,px=mix(SPTS[i][0],SPTS[i+1][0],t),pz=mix(SPTS[i][1],SPTS[i+1][1],t);return landH(px,pz)-gullyCut(px,pz).cut-.75;}
 return -1e9;}

// ---------------------------------------------------------------- the climate fields (cached below; these are the definitions)
// The kit reads the world's fields (biomes/WORLD.md): wet, flow, rock, slope, cold, upland; and three of this region's:
// bog (the bofedal), mother (the Mother Cushion), geo (the sinter of the geyser field), gully (a quebrada's floor and
// walls, the ragbark's shelter), sun (how squarely a slope faces the sun: the dry slope).
const SUNH=(function(){const l=Math.hypot(SUNP[0],SUNP[2]);return[SUNP[0]/l,SUNP[2]/l];})();
function fieldsAt(x,z,h,slope,gx,gz){const T=torAt(x,z),G=gullyCut(x,z),S=streamD(x,z),M=motherAt(x,z),b=bogAt(x,z),geo=geoAt(x,z);
 const rd=M.m>0?rillD(x,z):1e9,mother=M.m*smooth(2.5,6,rd);
 const tarn=smooth(TARN.r*1.5,TARN.r*.9,Math.hypot(x-TARN.x,z-TARN.z));
 const cold=clamp(.16+(h-226)/560,0,1);
 // exposed rock: the tors, steep ground, and the range's upper face (scree), barer as it gets colder
 const rock=clamp(Math.max(T.rock*smooth(.1,.3,slope+.25*T.rock),smooth(.55,.85,slope)*.75,smooth(.45,.8,cold)*smooth(.2,.5,slope+.15)*.85,geo*.4),0,1);
 const flow=Math.max(smooth(STREAMW+14,STREAMW*.6,S.d),G.flow*.8,smooth(4,1,rd)*M.m);
 const wet=clamp(.2+.06*(fbm(x*.0015,z*.0015,131,2)-.5)+.75*b+.5*flow+.2*T.foot+.3*tarn+.25*M.m+.15*G.wall,0,1);
 // facing the sun: the slope's downhill direction against the sun's bearing (gx,gz the gradient)
 const gl=Math.hypot(gx,gz)||1,sunF=clamp(-(gx*SUNH[0]+gz*SUNH[1])/gl,0,1)*smooth(.08,.3,slope);
 return{wet,flow,upland:clamp((h-226)/470,0,1),rock,slope,cold,bog:b,mother,geo,gully:Math.max(G.wall,G.flow),sun:sunF,tarn,tor:T.rock,
  canyon:0,rim:0,dune:0,oasis:0,abyss:0,salt:0,barren:0};}
const FNAMES=['wet','flow','upland','rock','slope','cold','bog','mother','geo','gully','sun','tarn','tor','canyon','rim','dune','oasis','abyss','salt','barren'];
const FC=(function(){const N=420,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope,hx,hz);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
// the Mother's own field is read at full resolution (the kit drapes its cushion over it, 2 m a cell)
FIELD.mother=(x,z)=>{const M=motherAt(x,z);if(M.m<=0)return 0;return M.m*smooth(2.5,6,rillD(x,z));};

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the Mother, the bog, the gullies' mouths, the dry slope, the scree, the tors, the geysers
const SPINE=[[MOTHER.x,MOTHER.z],[MOTHER.x-MOTHER.r*1.3,MOTHER.z+MOTHER.r*.9],[BOG.x,BOG.z],[TARN.x,TARN.z],[BOG.x+500,BOG.z+60],[GEO.x,GEO.z]];
GULLY.forEach(G=>{const z=zF(G.x0)+260;SPINE.push([xg(G,z),z],[xg(G,z+380),z+380]);});
for(let x=-1600;x<=1600;x+=800){const z=zF(x)+330;SPINE.push([x,z],[x,z+650]);}
TORS.forEach(K=>SPINE.push([K.x,K.z]));
// this year's flowering stand of vigil spikes (the kit flowers its stands together): on the dry slope, between the gullies
const FLOWERING={x:-120,z:zF(-120)+380,r:280};SPINE.push([FLOWERING.x,FLOWERING.z]);
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 obstacles:OBSTACLES,ticks:tick,seed:37,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:300,mid:820,far:2500,floor:[260,640]},
 windows:{water:[TARN.x-TARN.r*1.4,BOG.z-BOG.rz*1.3,BOG.x+BOG.rx*1.1,BOG.z+BOG.rz*1.3],
  mother:[MOTHER.x-MOTHER.r*1.35,MOTHER.z-MOTHER.r*1.35,MOTHER.x+MOTHER.r*1.35,MOTHER.z+MOTHER.r*1.35]}});
BIO.setSun(SUNP);
