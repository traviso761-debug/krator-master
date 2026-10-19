// ================================================================= HOST — stage (Korona, station 2: THE PITCHER HOLLOW)
// The same host as station 1's (src/45-host-stage.js) with another landform and another STAGE: 47 (the land) is shared.
//
// WHERE (biomes/korona/NOTES.md, "Candidate station sites"): a closed hollow of 32 km2 at scale model px (713, 212), its
// floor at -668 m and its spill at -466 m, the inner ring's wall rising to 2,000 m within 20 km on its east: Af, 30 degC
// (45 in the extremes), 2,100 mm on the floor and 3,200 on the wall, 1.74 atm. Nothing drains out of it. The floor is
// leached acid peat with standing water: nothing in the soil, so everything that grows there eats what it catches. This
// page is the hollow's middle, 3.2 km across: the floor, its sucking pools, the slopes up to the rim with the rainforest
// on them, a butte on the south rim.
//
// THE MAP (x east, z south, y up from the floor; R 1600).
//   THE FLOOR       flat within ~650 m of the middle (-170 m under the rim): THE MOOR of blood bulbs on the open flats,
//                   the man-eaters and coil tendrils where it is wettest, ground stars and snare flowers between
//   THE POOLS       nine black pools in the floor's dips, their beds a carpet of bladders, trap pads floating on them
//   THE COBRA MEADOW a ring where the slopes' seeps run out onto the floor (~600 to 760 m out)
//   THE SLOPES      rising to the rim: the rainforest (the hyperjungle, read in place), lace fans at its foot
//   THE RIM BUTTE   a butte on the south rim with a bench and a cap: the summit life on it, the Hum carved on its face
//   THE SAFE PATH   from the west rim through the floor and out to the north-east, lined with cairns
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: hot, wet, still: a thicker, greener haze than the tepui's; the sun a little lower (the hollow's wall)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xaab8a4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00031);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
const hemi=new THREE.HemisphereLight(0xbccabc,0x2a2a22,.7);scene.add(hemi);
const SUN_POS=[-1200,760,-600];
const sun=new THREE.DirectionalLight(0xfff0d2,1.3);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0bca8,.32);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the hollow
const TERR={R:1600};
// THE POOLS: in the floor's dips, within 520 m of the middle; r 14 to 40 m; their y is set by 47 (the ground round them)
const POOLS=(function(){const o=[];for(let i=0;i<9;i++){const r=KRAND.stream(KRAND.hash(4101,i,7)),a=r.range(0,TAU),d=90+430*Math.sqrt(r.next()),x=Math.cos(a)*d,z=Math.sin(a)*d,pr=r.range(14,40);
  if(o.some(p=>Math.hypot(p.x-x,p.z-z)<p.r+pr+40))continue;o.push({x,z,r:pr,bed:true,name:'A sucking pool'});}return o;})();
const poolDip=(x,z)=>{let c=0;for(const p of POOLS){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r*1.8)c=Math.max(c,1.4*smooth(p.r*1.6,p.r*.7,d));}return c;};
// the bowl: a flat floor, the slopes to the rim (0 m at ~1500), the inner ring's wall rising beyond R on the east
function floorBase(x,z){const d=Math.hypot(x,z),slope=smooth(640,1520,d),far=smooth(1450,2700,d)*(.5+.5*smooth(-800,900,x));
 return -170+170*slope*slope+far*far*700*(.8+.4*fbm(x*.0012+9,z*.0012-4,33,3))+3*(fbm(x*.0012+3.1,z*.0012-1.7,17,3)-.5)*2+1.2*(fbm(x*.006-2,z*.006+5,29,2)-.5)*2;}
function floorH(x,z){return floorBase(x,z)-poolDip(x,z);}

// ---------------------------------------------------------------- the rock (KSTACKS records)
const ROCK=(function(){const K=KSTACKS,L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<32;i++){const a=i/32*TAU;for(const k of [.4,.8,1.15])m=Math.min(m,floorH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-3;};
 const add=(B,name)=>{B.name=name;L.push(B);return B;};
 // THE RIM BUTTE on the south rim: a bench and a cap
 add(K.make({id:'rimbutte',kind:'mesa',x:-200,z:1180,y0:footY(-200,1180,230),seed:4201,bed:[30,70],lobes:.2,weather:.7,tiers:[{h:120,r:230,e:1.3,ry:.3},{h:70,r:150,e:1.2,ry:.3,dx:20,dz:10}]}),'The rim butte (a bench and a cap on the hollow\'s south rim)');
 const big=L.slice();
 const clear=(x,z,r,pad)=>{for(const B of big){const f=K.foot([B],x,z);if(f&&f.d<r+pad)return false;}return Math.hypot(x,z)>700&&Math.hypot(x,z)<TERR.R*.92&&!POOLS.some(p=>Math.hypot(p.x-x,p.z-z)<p.r+r+20);};
 // STACKS on the slopes: spires out of the rainforest
 K.cluster({id:'slopestack',seed:4301,c:[600,-700],rad:520,n:5,H:[60,130],r:[10,20],gap:40,kinds:{spire:.7,fin:.2,balanced:.1},ground:(x,z)=>footY(x,z,18)+2,accept:(x,z,r)=>clear(x,z,r,60)}).forEach(B=>add(B,B.kind==='fin'?'A quartzite fin on the slope':B.kind==='balanced'?'A balanced rock on the slope':'A quartzite spire on the slope'));
 return L;})();
const BUTTE=ROCK[0];
// THE SAFE PATH: from the west rim through the floor and out to the north-east
const PATH=[[-1480,300],[-1150,250],[-820,170],[-520,70],[-220,-30],[80,-120],[360,-300],[640,-540],[960,-800],[1240,-1020],[1480,-1180]];

// ---------------------------------------------------------------- the station's say: STAGE (47 reads it)
const dOf=(x,z)=>Math.hypot(x,z);
const STAGE={
 name:'Korona: the pitcher hollow',R:TERR.R,bodies:ROCK,floor:floorH,capY:BUTTE.y0+150,seed:12,talusH:14,
 stream:null,streamD:()=>1e9,pools:POOLS,path:PATH,heroR:1600,
 // the whole floor is wet (2,100 mm, nothing drains); the east, under the wall, wetter
 windward:(x,z)=>.8+.2*smooth(-600,700,x),
 wetExtra:(x,z)=>.25*smooth(900,620,dOf(x,z)),
 // hot, dense, still air: the whole hollow is warm; the butte's cap a little less
 warm:(x,z)=>{const t=NECANYONS.top(x,z);return t>-1e8?.7:1-.12*smooth(900,1500,dOf(x,z));},
 // rich: the slopes' leaf litter (the rainforest's ground), the butte's pockets; the floor has nothing
 rich:(x,z)=>{const t=NECANYONS.top(x,z);if(t>-1e8)return .5*smooth(.55,.7,fbm(x*.013+2,z*.013-6,51,2));return .7*smooth(700,1000,dOf(x,z));},
 // THE ACID FLOOR: poor by itself, whatever the rock says; strongest in the middle, fading up the slopes
 poorExtra:(x,z)=>.85*smooth(1000,620,dOf(x,z)),
 bogAt:(x,z)=>.35*smooth(.5,.62,fbm(x*.02+5,z*.02+1,53,2)),
 // the floor's layers: black peat on the floor, the rainforest's litter on the slopes, sand at the pools' margins
 layers:{a:'ground.peat',b:'ground.litter',c:'ground.sand'},layerCol:[0x2a2420,0x3a3a28,0xa89a86],
 weights:(x,z)=>{const d=dOf(x,z);let pm=0;for(const p of POOLS){const dd=Math.hypot(x-p.x,z-p.z);if(dd<p.r*2)pm=Math.max(pm,smooth(p.r*1.9,p.r*1.05,dd));}return[smooth(660,980,d)*(.8+.2*fbm(x*.02,z*.02,41,2)),pm];},
 rockCol:{band:[0x8a7f78,0x9a8e86,0x7a6e68,0xa89c94],top:0xa39890,soil:0x6a5a48},waterCol:0x14110e,
 floorLabel:'The hollow\'s floor (acid peat: nothing in it)',waterLabel:'A sucking pool (black water over a bed of bladders)',
 // the rainforest on the slopes only (the floor is the traps')
 jungle:(x,z)=>smooth(640,960,dOf(x,z)),jungleQ:.75,necQ:.8,
 // the plants' densities, this station's say (57 and 60 multiply by them)
 bias:{
  cobraMeadow:(x,z)=>smooth(560,610,dOf(x,z))*smooth(790,720,dOf(x,z))*.9,
  cobralily:.4,bloodbulb:(x,z)=>1.5*smooth(620,520,dOf(x,z)),maneater:1.3,coiltendril:1.3,groundstar:1.2,snareflower:1,bloodtrumpet:1.1,greatsundew:.5,
  punjipit:1.3,beartrap:1.2,numbthorn:1.2,lacefan:(x,z)=>1.6*smooth(560,760,dOf(x,z)),cointree:.4,rainbowfan:1,lacepitcher:1,stormpod:.6},
 carvings:{body:'rimbutte',tier:0,a0:-2.2,a1:-.9,y0:9,h:2.6,name:'Contour carvings: the Hum (the hollow\'s warning, cut on the butte\'s face)'},
 spine:(function(){const S=[[0,0]];PATH.forEach((p,i)=>{if(i%2===0)S.push(p);});POOLS.forEach(p=>S.push([p.x,p.z]));S.push([BUTTE.x,BUTTE.z],[600,-700]);return S;})(),
};
