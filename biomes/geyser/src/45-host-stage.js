// ================================================================= HOST — stage (the geyser basin: a basin in the Steampits)
// The ideal-type host for the GEYSER kit: renderer, light, the land before its thermal ground, and the showcase's thermal
// layout as DATA (THERMAL, below), which the kit lays out (46: GEYSER.lay) and 47 builds the land from.
//
// WHERE (the scale model, v4.20, 2 km a pixel): the Steampits are a ~150 x 110 km thermal province on the mainland's
// north shore of the Ring Sea, ~244 km north of the Throne's vent, at about the sea's level (~1.49 km below the datum:
// ~1.9 atm), hot and wet (~33 degC mean, ~1500 mm), hypertropic jungle (XA) and abyssal savanna (XV) between its
// geysers. Water boils at ~119 degC at this pressure, so its springs run hotter than Earth's before they boil.
// This page is ONE basin of it: ~2.8 km across, the size of one of Yellowstone's geyser basins.
//
// THE MAP (x east, z south, y up from the sea; R 1400).
//   THE PLATEAU   ~92 m, the hyperjungle: the hypertrees stand round the basin like a wall, 60-100 m over its floor
//   THE BASIN     a broad hollow cut ~40-55 m into the plateau, its floor ~53 m at the north foot falling to ~35 m at
//                 its south lip; its walls forested scarps. On its floor the thermal ground:
//     GEYSER HILL   the upper basin's sinter flat: the Old Kettle (a cone geyser), Grandmother (a great fountain geyser
//                   in her crater pool, the rarest and the tallest), the Bellows, the Twins, the Lantern; spouters;
//                   hot pools (funnels: blue where they boil, the mats round their rims)
//     THE PRISM     the Great Prism (a prismatic spring 92 m across, deep blue to orange and brown) on its own sinter
//                   shield in the south-west, its run-off streaming out over the apron in mat-banded fingers
//     THE EAST FLAT the Little Prism, the East Gate (a cone), the Drum (a spouter), more pools
//     THE ACID FIELD at the east wall's foot: mud pots and fumaroles in white and ochre clay, steam combs at its edge
//     THE DEAD      where the thermal ground spread into the jungle (the north-east foot, round the acid field): a dead
//                   forest drowned in silica, its snags white-socked where the sinter climbed them
//   THE STAIR     the basin's outlet: a valley from the south lip to the sea, its floor a flight of travertine terraces
//                 (the Stair Spring and the run-off feed them), warm blue pools stepping down ~35 m to the beach
//   THE CREEK     a jungle stream from the plateau in the north-west, down a ravine into the basin, across it (the
//                 run-off joins it warm) and down the Stair's west side to the sea
//   THE SEA       the Ring Sea, south: black sand beaches either side of the Stair's apron
// The hyperjungle (its own kit, read in place: build.py) grows on the plateau, the walls and the coast; this kit on the
// basin floor, the Stair and the dead forest.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
// a shader that fails to compile is only a console error in three.js and its mesh silently does not draw: the panel shows it
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
// (TAU, clamp, smooth, fbm, rng... are the core's, made globals by the hyperjungle's 41: biomes/hyperjungle/src)
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// THE LIGHT: sea level under ~1.9 atm, hot and wet: a milky sky, a strong blue-green fill, the haze thick and pale with
// the basin's steam; the sun in the south-west over the sea
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc2cabe);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00034);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,14000);
const hemi=new THREE.HemisphereLight(0xc4d4cc,0x48463a,.7);scene.add(hemi);
const SUN_POS=[-900,820,700];
const sun=new THREE.DirectionalLight(0xfff0d0,1.4);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0ccc4,.3);fill.position.set(900,400,-900);scene.add(fill);
// the sea breeze, from the south-west: the steam leans north-east (toward +x, -z)
const WIND=[.62,-.42];

// ---------------------------------------------------------------- the land before the thermal ground
const TERR={R:1400};
const SEA=0;   // the Ring Sea (local); the scale model puts it ~1.49 km below the datum
// THE STAIR's line (the basin's outlet to the sea): its axis and half-width by z
const STAIR={x0:60,z0:240,w:185,name:'The Stair (travertine terraces down to the sea)'};
const stairX=z=>STAIR.x0+28*Math.sin((z-STAIR.z0)*.0065);
const stairW=z=>STAIR.w+30*Math.sin(z*.011+1.1);
// the shore: wavy, the Stair's apron built a little out into the sea
const shoreZ=x=>760+60*Math.sin(x*.0021+.4)+26*Math.sin(x*.0057+1.3)+40*Math.exp(-Math.pow((x-STAIR.x0)/230,2));
// the plateau, and the coast falling to the beach over ~330 m
function plateauH(x,z){return 92+16*(fbm(x*.0011+3,z*.0011-1,17,3)-.5)+5*(fbm(x*.005-2,z*.005+5,19,2)-.5);}
// THE BASIN: an ellipse with a ragged edge; floorH its floor, falling south
const BASIN={x:0,z:-160,rx:640,rz:470,name:'The geyser basin'};
function basinE(x,z){const dx=(x-BASIN.x)/BASIN.rx,dz=(z-BASIN.z)/BASIN.rz,a=Math.atan2(dz,dx);
 return Math.hypot(dx,dz)*(1+.07*Math.sin(3*a+.7)+.05*Math.sin(5*a+2.1)+.06*(fbm(x*.004,z*.004,31,2)-.5));}
const floorH=(x,z)=>44-.02*(z-BASIN.z)+2.5*(fbm(x*.003+1,z*.003,33,2)-.5);
// the Stair's floor: the basin's lip height at its head, down to the sea at the shore, steepest in its middle
const STAIR_TOP=floorH(stairX(STAIR.z0),STAIR.z0);
function stairU(x,z){const sz=shoreZ(stairX(z));return clamp((z-STAIR.z0)/(sz-STAIR.z0),0,1);}
const stairH=(x,z)=>{const u=stairU(x,z);return STAIR_TOP*(1-(u-.08*Math.sin(u*TAU)));};
const stairK=(x,z)=>smooth(stairW(z)+80,stairW(z)-15,Math.abs(x-stairX(z)))*smooth(STAIR.z0-60,STAIR.z0+40,z);
const basinK=(x,z)=>smooth(1.12,.86,basinE(x,z));
// the ground before the creek and the thermal relief (the kit traces the run-off on this)
function landH(x,z){const sz=shoreZ(x);
 if(z>sz)return Math.max(-28,-(z-sz)*.05)-1.5*(fbm(x*.004,z*.004,37,2)-.5)*smooth(sz,sz+60,z);
 const c=smooth(sz-330,sz,z),out=plateauH(x,z)*(1-Math.pow(c,1.3));
 const bk=basinK(x,z),sk=stairK(x,z),fl=Math.max(bk,sk);if(fl<=0)return out;
 const F=(bk*floorH(x,z)+sk*stairH(x,z))/(bk+sk);
 return mix(out,F,fl);}

// THE CREEK: from the plateau in the north-west, down its ravine into the basin, across it, down the Stair's west side.
// Its bed is graded (it never climbs): the lowest of the ground under it and the bed upstream, so it cuts its ravine
const CREEK=(function(){const C=[[-860,-1000],[-700,-820],[-570,-660],[-480,-450],[-440,-220],[-385,-10],[-300,170],[-205,300],[-128,430],[-98,600],[-86,780],[-80,940]];
 const P=[];for(let i=0;i<C.length-1;i++){const p0=C[Math.max(0,i-1)],p1=C[i],p2=C[i+1],p3=C[Math.min(C.length-1,i+2)],n=Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/4);
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;P.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
   .5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}
 P.push(C[C.length-1]);
 const n=P.length,bed=new Float32Array(n),w=new Float32Array(n),s=new Float32Array(n);let L=0;
 for(let i=0;i<n;i++){if(i)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);s[i]=L;
  // the ground under it, a little meander noise across; the bed ~1.2 m under it, never climbing (2 m in 1000 at least)
  const g=landH(P[i][0],P[i][1])-1.2;bed[i]=i?Math.min(bed[i-1]-.002*(s[i]-s[i-1]),g):g;w[i]=3.2+3.4*smooth(0,1800,L);}
 // the sea end: the bed runs out under the sea
 return{P,bed,w,s,len:L,depth:.75,name:'The creek (a jungle stream; warm below the basin)'};})();
// the creek's segments in a hash (cell 24 m) for the nearest-point query every terrainH call makes
const CRH=(function(){const C=24,H=new Map(),P=CREEK.P;
 for(let i=0;i<P.length-1;i++){const pad=CREEK.w[i]+40,x0=Math.min(P[i][0],P[i+1][0])-pad,x1=Math.max(P[i][0],P[i+1][0])+pad,z0=Math.min(P[i][1],P[i+1][1])-pad,z1=Math.max(P[i][1],P[i+1][1])+pad;
  for(let gz=Math.floor(z0/C);gz<=Math.floor(z1/C);gz++)for(let gx=Math.floor(x0/C);gx<=Math.floor(x1/C);gx++){const k=gx*8192+gz;let L=H.get(k);if(!L)H.set(k,L=[]);L.push(i);}}
 return{C,H};})();
// the nearest point of the creek: {d (m), i (segment), t, bed, w}; d 1e9 when it is far
const _cq={d:1e9,i:0,t:0,bed:0,w:0};
function creekAt(x,z){const L=CRH.H.get(Math.floor(x/CRH.C)*8192+Math.floor(z/CRH.C));_cq.d=1e9;if(!L)return _cq;const P=CREEK.P;
 for(let k=0;k<L.length;k++){const i=L[k],a=P[i],b=P[i+1],vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz||1;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;t=t<0?0:t>1?1:t;
  const d=Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t);if(d<_cq.d){_cq.d=d;_cq.i=i;_cq.t=t;}}
 const i=_cq.i,t=_cq.t;_cq.bed=CREEK.bed[i]*(1-t)+CREEK.bed[i+1]*t;_cq.w=CREEK.w[i]*(1-t)+CREEK.w[i+1]*t;return _cq;}

// ---------------------------------------------------------------- the thermal layout (the showcase's; the kit's records)
// What the kit lays out (46: GEYSER.lay; BIOME-API.md says what each field means). Periods are compressed for a page
// (a real Old Kettle would play every few hours): the timetable (90) shows them and any one can be set off by hand.
// kind: cone (a jet from a sinter cone), fountain (bursts out of a pool), spouter (never stops splashing).
//   H the column (m); period, pre (the preplay's surging), dur (the column), steam (the roaring steam after) in seconds;
//   cone {r,h} the cone, mound {r,h} the sinter shield under it, pool the fountain's pool radius; off its clock's phase
// springs: kind prismatic (a broad shallow spring on its shield), pool, funnel (deep, steep-sided); temp 0..1 (1 boils
// at its middle: deep blue; cooler the mats reach in: green, yellow, orange); out how many run-off channels it feeds
const THERMAL={seed:631,amb:33,ground:landH,sea:SEA,wind:WIND,
 geysers:[
  {key:'kettle',name:'The Old Kettle (a cone geyser)',kind:'cone',x:-120,z:-300,H:52,period:190,pre:24,dur:32,steam:40,off:30,cone:{r:9,h:6.5},mound:{r:36,h:2.6}},
  {key:'grandmother',name:'Grandmother (a great fountain geyser in her crater pool)',kind:'fountain',x:95,z:-430,H:64,period:330,pre:40,dur:50,steam:60,off:150,pool:11,mound:{r:44,h:1.9}},
  {key:'bellows',name:'The Bellows (a fountain geyser)',kind:'fountain',x:160,z:-250,H:26,period:110,pre:14,dur:18,steam:20,off:70,pool:6,mound:{r:24,h:1.2}},
  {key:'twins',name:'The Twins (two cones that play together)',kind:'cone',x:-282,z:-198,H:17,period:70,pre:8,dur:12,steam:12,off:10,cone:{r:3.6,h:2.3},mound:{r:15,h:.9},twin:[13,-11]},
  {key:'lantern',name:'The Lantern (a tall cone)',kind:'cone',x:-22,z:-478,H:36,period:150,pre:18,dur:22,steam:26,off:100,cone:{r:5.2,h:4.8,spire:true},mound:{r:22,h:1.6}},
  {key:'eastgate',name:'The East Gate (a cone geyser)',kind:'cone',x:250,z:-80,H:22,period:95,pre:10,dur:15,steam:16,off:45,cone:{r:4.2,h:2.2},mound:{r:18,h:1.1}},
  {key:'chatter',name:'The Chatterer (a spouter)',kind:'spouter',x:-206,z:-372,H:4.5,pool:2.6,mound:{r:12,h:.6}},
  {key:'sputter',name:'A spouter',kind:'spouter',x:38,z:-196,H:3.2,pool:2,mound:{r:9,h:.4}},
  {key:'drum',name:'The Drum (a spouter)',kind:'spouter',x:362,z:-58,H:5.5,pool:3,mound:{r:13,h:.7}}],
 springs:[
  {key:'prism',name:'The Great Prism (a prismatic spring)',kind:'prismatic',x:-170,z:42,r:46,temp:1.0,out:5,shield:2.2},
  {key:'littleprism',name:'The Little Prism',kind:'prismatic',x:305,z:42,r:16,temp:.85,out:2,shield:1},
  {key:'stair',name:'The Stair Spring (a travertine spring: it feeds the terraces)',kind:'pool',x:62,z:316,r:11,temp:.85,out:3,outW:2.6,spread:1.1,milky:true,shield:1.2},
  {key:'glory',name:'The Glory Pool (a funnel: blue at its throat, the mats round its rim)',kind:'funnel',x:-62,z:-160,r:5.2,temp:.8,out:1},
  {key:'sapphire',name:'The Sapphire (a boiling funnel)',kind:'funnel',x:-205,z:-262,r:4.2,temp:1.0,out:1},
  {key:'emerald',name:'The Emerald (a cooler pool: green)',kind:'pool',x:205,z:-158,r:6.2,temp:.6,out:1},
  {key:'chromatic',name:'The Chromatic Pool',kind:'pool',x:382,z:105,r:5.2,temp:.68,out:1},
  {key:'ochre',name:'An ochre pool (cool: the mats fill it)',kind:'pool',x:330,z:-128,r:3.6,temp:.4,out:0},
  {key:'pearl',name:'A boiling funnel',kind:'funnel',x:-312,z:-332,r:3,temp:1.0,out:1},
  {key:'opal',name:'The Opal Pool',kind:'funnel',x:138,z:122,r:4.2,temp:.75,out:1},
  {key:'teal',name:'A teal pool',kind:'pool',x:-40,z:-372,r:3.4,temp:.85,out:1}],
 // the acid field: its mud pots (n of them in r) and fumaroles; its clay white and ochre
 acid:[{key:'acid',name:'The acid field (mud pots and fumaroles)',x:468,z:-300,r:120,mud:9,fumaroles:20}],
 // fumaroles elsewhere: steaming vents in the sinter
 fumaroles:[{x:-60,z:-560,r:90,n:7},{x:300,z:-380,r:70,n:5},{x:-330,z:-60,r:60,n:4},{x:210,z:220,r:60,n:3}],
 // the sinter flats (ellipses; a the long axis' bearing)
 flats:[{key:'hill',name:'Geyser Hill (the upper basin\'s sinter flat)',x:-50,z:-330,rx:300,rz:190,a:.15},
  {key:'prismflat',name:'The Prism\'s apron',x:-165,z:50,rx:175,rz:140,a:-.3},
  {key:'east',name:'The east flat',x:300,z:-60,rx:160,rz:190,a:.4},
  {key:'acidflat',name:'The acid field\'s white clay',x:470,z:-305,rx:150,rz:135,a:0},
  {key:'neck',name:'The sinter neck to the Stair',x:70,z:230,rx:110,rz:90,a:0}],
 // where the thermal ground spread into the jungle: the dead forest
 dead:[{key:'northeast',name:'The dead forest (drowned in silica)',x:400,z:-560,r:165},{key:'acideast',name:'The dead forest by the acid field',x:600,z:-250,r:110},
  {key:'west',name:'Dead trees at the Prism\'s edge',x:-330,z:120,r:80}],
 // THE STAIR's flight: pools where its mask is (47 gives it): S2 the tiers' step (m), cu x cv the pools' cell across and
 // down the slope (a third dropped), lip and depth of the pools, the temperature from its head to the sea
 terraces:[{key:'stair',name:'The Stair (travertine terraces)',S2:2.6,cu:30,cv:18,drop:.3,lip:.16,depth:.35,temp:[72,36]}],
 runLen:520};
