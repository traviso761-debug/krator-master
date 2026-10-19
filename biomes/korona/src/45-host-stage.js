// ================================================================= HOST — stage (Korona, station 1: THE TEPUI)
// The ideal-type host for the KORONA kit: renderer, light, the gorge floor, and the station's rock as KSTACKS records
// (core/terrain/37-core-stacks.js), which the necanyons layout zones (46, read in place) and 47 builds the land from.
// Everything a station decides is in STAGE at the end: 47 (the land) is the same fragment for every station.
//
// WHERE (biomes/korona/NOTES.md, "Candidate station sites"): a table standing in Korona's main trench, scale model px
// (813..823, 192..196): its top at ~1,500 m (Cfa, 1.3 atm, cloud on it most mornings), the gorge floor at -500 to -1,000 m
// (Af, 1.7 atm, 2,000 to 4,000 mm), the salt lake out of reach at -2,100 m. The wind is from the north-west and the table
// wrings it out: its windward face takes 3,500 mm and its lee 300. This page is the table's upper 530 m and the gorge
// floor round it, 3.2 km across.
//
// THE MAP (x east, z south, y up from the gorge floor; R 1600).
//   THE TABLE       a tepui of two tiers: the body (380 m of near-vertical quartzite wall in five or six beds, each
//                   parting a ledge with its hanging garden), and the SUMMIT block (150 m) set back on it, so a SHOULDER
//                   runs round under the summit's wall; the summit a bare pavement with bogs in its hollows
//   THE OUTLIER     a butte to the south-west, cut off from the table by a side gorge
//   THE STACKS      spires and a fin on the floor east of the table: the remains of a fallen rim
//   THE STREAM      down the windward (west) side of the gorge, north to south
//   THE GORGE FLOOR the hyperjungle's (its kit read in place), thinner on the lee, bare where the ground is poor
// The far walls of the trench rise beyond R on every side (the ring ridges), into the haze.
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
// (TAU, clamp, smooth, fbm, rng... are the core's, made globals by the hyperjungle's 41: biomes/hyperjungle/src)
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// THE LIGHT: the hyperjungle's sky (read in place) paints its sun at this position; the haze a little cooler and bluer
// than the canyons' (wet air, dark rock)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb4bfb6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00024);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
const hemi=new THREE.HemisphereLight(0xc0ccc4,0x3a3630,.66);scene.add(hemi);
const SUN_POS=[-1200,900,-600];
const sun=new THREE.DirectionalLight(0xfff0d2,1.4);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8c0b4,.3);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the gorge floor
const TERR={R:1600};
const WIND=[-Math.SQRT1_2,-Math.SQRT1_2];   // from the north-west: a face whose outward normal points this way is windward
// THE STREAM: down the windward side of the gorge, north to south; its bed ~4 m under the floor, 14 m across
const STREAM={x:z=>-640+90*Math.sin(z*.0019+.7)+30*Math.sin(z*.0061+2.1),w:7,depth:.6,name:'The gorge stream (down the windward side)'};
const streamD=(x,z)=>Math.abs(x-STREAM.x(z));
// the floor: long swells and a finer roughness, falling gently south; beyond R the trench's far walls rise into the haze
function floorBase(x,z){const d=Math.hypot(x,z),far=smooth(1380,2700,d);
 return 12*(fbm(x*.0009+3.1,z*.0009-1.7,17,3)-.5)*2+4*(fbm(x*.004-2,z*.004+5,29,2)-.5)*2-.003*z+far*far*900*(.75+.5*fbm(x*.0012+9,z*.0012-4,33,3));}
function floorH(x,z){const b=floorBase(x,z),d=streamD(x,z),cut=smooth(STREAM.w+20,STREAM.w*.4,d);return b-4.2*cut;}

// ---------------------------------------------------------------- the rock (KSTACKS records: core/terrain/37-core-stacks.js)
// A body's foot is set under the lowest floor round it, so its wall always meets the ground.
const ROCK=(function(){const K=KSTACKS,L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<32;i++){const a=i/32*TAU;for(const k of [.4,.8,1.15])m=Math.min(m,floorH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-3;};
 const add=(B,name)=>{B.name=name;L.push(B);return B;};
 // THE TABLE: the body (380 m, beds 55 to 110 m thick: each parting a ledge) and the summit block set back on it
 add(K.make({id:'table',kind:'mesa',x:60,z:-120,y0:footY(60,-120,560),seed:2101,bed:[55,110],lobes:.14,
  tiers:[{h:380,r:560,e:1.35,ry:.45},{h:150,r:455,e:1.3,ry:.45,dx:30,dz:-25}]}),'The table (a tepui: its walls, its shoulder, its summit)');
 // THE OUTLIER: a butte cut off from the table's south-west by a side gorge
 add(K.make({id:'outlier',kind:'butte',x:-860,z:640,y0:footY(-860,640,190),seed:2102,bed:[40,90],tiers:[{h:300,r:190,e:1.2,ry:-.5}]}),'The outlier (a butte cut off from the table)');
 const big=L.slice();
 const clear=(x,z,r,pad)=>{for(const B of big){const f=K.foot([B],x,z);if(f&&f.d<r+pad)return false;}return streamD(x,z)>r+40&&Math.hypot(x,z)<TERR.R*.9;};
 // THE STACKS on the floor east of the table: the remains of a fallen rim
 K.cluster({id:'gorgestack',seed:2201,c:[760,520],rad:480,n:5,H:[90,170],r:[14,26],gap:40,kinds:{spire:.6,fin:.25,balanced:.15},
  ground:(x,z)=>footY(x,z,24)+2,accept:(x,z,r)=>clear(x,z,r,80)}).forEach(B=>add(B,B.kind==='fin'?'A quartzite fin (a fallen rim)':B.kind==='balanced'?'A balanced rock':'A quartzite spire (a fallen rim)'));
 return L;})();
const TABLE=ROCK[0];

// ---------------------------------------------------------------- the station's say: STAGE (47 reads it; the pitcher hollow's 45 writes its own)
// windward: 1 on the north-west faces and the ground before them, 0 in the table's lee (the rain shadow); the same for
// a point on the floor, since the gorge lies round the table
const windwardOf=(x,z)=>{const a=Math.atan2(z-TABLE.z,x-TABLE.x),w=Math.cos(a)*WIND[0]+Math.sin(a)*WIND[1];return smooth(-.55,.55,w);};
const STAGE={
 name:'Korona: the tepui',R:TERR.R,bodies:ROCK,floor:floorH,capY:TABLE.y0+470,seed:11,talusH:22,
 stream:STREAM,streamD,pools:[],
 windward:windwardOf,
 // the dense hot air of the gorge (1.7 atm, 30 degC): 1 on the floor, falling up the wall to .25 on the summit
 warm:(x,z)=>1-.75*clamp((NECANYONS.top(x,z)-TABLE.y0)/530,0,1),
 // alluvium: the stream's banks and the gorge floor's bottoms, and the pockets of soil on the summit
 rich:(x,z)=>{const t=NECANYONS.top(x,z);if(t>-1e8)return .55*smooth(.6,.75,fbm(x*.011+2,z*.011-6,51,2));
  return clamp(.75*smooth(60,10,streamD(x,z))+.4*smooth(.52,.66,fbm(x*.0018-4,z*.0018+1,52,3)),0,1);},
 // the summit's bogs: the wet hollows of the pavement on the windward half
 bogAt:(x,z)=>smooth(.5,.62,fbm(x*.017+5,z*.017+1,53,2))*mix(.35,1,windwardOf(x,z)),
 // the floor's layers (47): litter everywhere, quartz scree at the walls' feet, sand by the stream
 layers:{a:'ground.litter',b:'ground.talus',c:'ground.sand'},layerCol:[0x3a3a28,0x8a8278,0xa89a86],
 weights:(x,z)=>{const fd=NECANYONS.footD(x,z),sd=streamD(x,z);return[smooth(48,4,fd)*(.7+.3*fbm(x*.02,z*.02,41,2)),smooth(STREAM.w+16,STREAM.w+2,sd)];},
 rockCol:{band:[0x8a7f78,0x9a8e86,0x7a6e68,0xa89c94],top:0xa39890,soil:0x6a5a48},
 // the hyperjungle: on the gorge floor, off the walls' feet and the stream, thinner on the lee and on poor ground
 jungle:(x,z)=>mix(.5,1,windwardOf(x,z)),
 // THE CARVINGS: the Hum's contour carvings (LORE.md 6.18) on the summit block's lowest bed, above the shoulder, on the
 // dry lee face where the tribe's ledges are: angle band a0..a1 about the bed's centre, h tall, y0 above the bed's foot
 carvings:{body:'table',tier:1,a0:-1.1,a1:.35,y0:4,h:3.2,name:'Contour carvings: the Hum (one groove a syllable, above or below the line)'},
 // the LOD spine: the table's rim all round, the shoulder, the summit, the stream, the outlier
 spine:(function(){const S=[];for(let k=0;k<10;k++){const a=k/10*TAU,b=TABLE.beds[0];S.push([b.cx+Math.cos(a)*KSTACKS.footR(b,a)*1.05,b.cz+Math.sin(a)*KSTACKS.footR(b,a)*1.05]);}
  S.push([TABLE.x,TABLE.z],[TABLE.x+120,TABLE.z-80],[STREAM.x(300),300],[STREAM.x(-600),-600],[-860,640],[760,520]);return S;})(),
};
