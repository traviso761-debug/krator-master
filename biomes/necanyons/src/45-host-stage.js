// ================================================================= HOST — stage (the necanyons: a reach of the north-eastern canyons)
// The ideal-type host for the NECANYONS kit: renderer, light, the canyon floor, and the showcase's rock as KSTACKS records
// (core/terrain/37-core-stacks.js), which the kit lays out (46: NECANYONS.lay) and 47 builds the land from.
//
// WHERE (biomes/necanyons/PLAN.md): the transition from the central hyperjungle to Korona's coronae, north of the Beast
// Riders' country, overlying the hyperjungle's polygon on the scale model for now (the owner, 2026-10-19). Pinnacle Rock
// (px 755,351) stands on the first of these mesas. The floor is the hyperjungle's, about -950 m: ~1.9 atm, hot, 3,000 mm.
// This page is ~3.2 km of it.
//
// THE MAP (x east, z south, y up from the canyon floor; R 1600).
//   THE BENCH       a two-tier mesa east of the middle: its bench 290 m over the floor (Pinnacle Rock's height), a row of
//                   fins along its southern rim and a garden of spires and balanced rocks on it; its cap 150 m higher in
//                   the north-east, bare and dry
//   THE HIGH CAP    the tallest mesa, north-west: a 360 m plateau with a 130 m cap, hoodoos on its top
//   THE SOUTH-WEST BUTTE   a single tier, 260 m
//   THE TOWERS      five buttes 250-330 m tall and 60-95 m across, rising out of the jungle
//   THE STACKS      spires, fins and a balanced rock on the floor, 120-190 m, where the canopy thins by the creek
//   THE CREEK       a stream down the western canyon, north to south; the jungle on the floor between the rocks
// The hyperjungle (its own kit, read in place: build.py) grows on the floor; this kit on the rock, at the walls' feet and in
// the creek's light gaps.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
// (TAU, clamp, smooth, fbm, rng... are the core's, made globals by the hyperjungle's 41: biomes/hyperjungle/src)
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// THE LIGHT: the hyperjungle's (its sky is read in place and paints its sun at this position), the haze a little warmer:
// the red rock under it
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xbcc2ae);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00026);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
const hemi=new THREE.HemisphereLight(0xc4d0c4,0x4a3a2a,.64);scene.add(hemi);
const SUN_POS=[-1200,900,-600];
const sun=new THREE.DirectionalLight(0xfff0d2,1.45);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8b8a4,.3);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the canyon floor
const TERR={R:1600};
// THE CREEK: down the western canyon, north to south; its bed ~4 m under the floor, 16 m across
const CREEK={x:z=>-330+140*Math.sin(z*.0021+.4)+40*Math.sin(z*.0057+1.2),w:8,depth:.6,name:'The creek (a stream down the western canyon)'};
const creekD=(x,z)=>Math.abs(x-CREEK.x(z));
// the floor: long swells and a finer roughness, falling gently to the south; the creek cut into it
function floorBase(x,z){return 14*(fbm(x*.0009+3.1,z*.0009-1.7,17,3)-.5)*2+4*(fbm(x*.004-2,z*.004+5,29,2)-.5)*2-.004*z;}
function floorH(x,z){const b=floorBase(x,z),d=creekD(x,z),cut=smooth(CREEK.w+22,CREEK.w*.4,d);return b-4.2*cut;}

// ---------------------------------------------------------------- the rock (KSTACKS records: core/terrain/37-core-stacks.js)
// A body's foot is set under the lowest floor round it, so its wall always meets the ground.
const ROCK=(function(){const K=KSTACKS,L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<32;i++){const a=i/32*TAU;for(const k of [.4,.8,1.15])m=Math.min(m,floorH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-3;};
 const add=(B,name)=>{B.name=name;L.push(B);return B;};
 const mesa=(id,seed,x,z,tiers,name)=>add(K.make({id,kind:tiers.length>1?'mesa':'butte',x,z,y0:footY(x,z,tiers[0].r*Math.sqrt(tiers[0].e||1.3)),seed,tiers}),name);
 mesa('bench',1101,420,-60,[{h:290,r:420,e:1.5,ry:.35},{h:150,r:200,e:1.3,dx:110,dz:-150}],'The Bench (a two-tier mesa: its bench and its cap)');
 mesa('highcap',1102,-900,-760,[{h:360,r:280,e:1.25,ry:-.6},{h:130,r:160,e:1.2,dx:-50,dz:-20}],'The High Cap (the tallest mesa)');
 mesa('swbutte',1103,-860,720,[{h:260,r:160,e:1.25,ry:.9}],'The South-West Butte');
 [[-60,560,300,75],[180,-1000,330,95],[1130,780,280,85],[1080,-930,250,65],[-1280,60,290,80]].forEach((t,i)=>
  mesa('tower'+i,1110+i,t[0],t[1],[{h:t[2],r:t[3],e:1.15+.1*(i%3),ry:i*.7}],'A sandstone tower'));
 const big=L.slice();
 const clear=(x,z,r,pad)=>{for(const B of big){const f=K.foot([B],x,z);if(f&&f.d<r+pad)return false;}return creekD(x,z)>r+70&&Math.hypot(x,z)<TERR.R*.86;};
 // the stacks on the floor, where the canopy thins by the creek
 K.cluster({id:'floorstack',seed:1201,c:[-80,140],rad:620,n:6,H:[120,190],r:[16,28],gap:40,kinds:{spire:.6,fin:.25,balanced:.15},
  ground:(x,z)=>footY(x,z,26)+2,accept:(x,z,r)=>clear(x,z,r,60)}).forEach(B=>add(B,B.kind==='fin'?'A sandstone fin':B.kind==='balanced'?'A balanced rock':'A sandstone spire'));
 // ON THE BENCH: a row of fins along its southern rim, and a garden of spires and balanced rocks (Pinnacle Rock's kinds)
 const bench=L[0],onBench=(x,z,pad)=>{const a=K.at([bench],x,z);return a&&a.b.tier===0&&a.d<-pad?a:null;};
 const benchTop=(x,z)=>K.topAt([bench],x,z);
 const capFoot=(x,z)=>{const cb=bench.beds.find(b=>b.tier===1);return Math.hypot(x-cb.cx,z-cb.cz)-KSTACKS.footR(cb,Math.atan2(z-cb.cz,x-cb.cx));};
 K.row({id:'benchfin',seed:1301,a:[150,150],b:[520,270],n:6,H:[50,90],r:[8,13],e:[5,8],jitter:10,ground:(x,z)=>benchTop(x,z)})
  .filter(B=>onBench(B.x,B.z,30)&&capFoot(B.x,B.z)>40).forEach(B=>add(B,'A fin on the Bench\'s rim'));
 K.cluster({id:'benchgarden',seed:1302,c:[200,-30],rad:170,n:10,H:[35,80],r:[6,14],gap:12,kinds:{spire:.55,balanced:.3,fin:.15},
  ground:(x,z)=>benchTop(x,z),accept:(x,z,r)=>!!onBench(x,z,r+25)&&capFoot(x,z)>r+40&&L.every(B=>B.kind!=='fin'||Math.hypot(B.x-x,B.z-z)>r+30)})
  .forEach(B=>add(B,B.kind==='balanced'?'A balanced rock on the Bench':'A spire on the Bench'));
 // ON THE HIGH CAP: hoodoos
 const hc=L[1],onCap=(x,z,pad)=>{const a=K.at([hc],x,z);return a&&a.b.tier===1&&a.d<-pad;};
 K.cluster({id:'caphoodoo',seed:1303,c:[hc.beds[hc.beds.length-1].cx,hc.beds[hc.beds.length-1].cz],rad:110,n:7,H:[16,36],r:[3.5,7],gap:8,kinds:{spire:.7,balanced:.3},
  ground:(x,z)=>K.topAt([hc],x,z),accept:(x,z,r)=>onCap(x,z,r+10)}).forEach(B=>add(B,'A hoodoo on the High Cap'));
 return L;})();
