// ================================================================= HOST — stage (Korona, station 5: THE LEE GORGE)
// The same host as station 1's (src/45-host-stage.js) with another landform and another STAGE: 47 (the land) is shared.
//
// WHERE (biomes/korona/NOTES.md, "Three Koronas"): the dry side of every ring. Each ring wrings the north-west wind out on
// its windward face and leaves its lee a desert: BSh and BWh, 200 to 600 mm, 24 to 26 degC, the gorges between the
// rings at the abyss's pressure. The eastern desert's climate (the sedesert kit, read in place: dragon trees, cardon and
// candelabra stands, Joshua trees, bottle trees, boojums, quiver trees, spinifex) under tepui walls. This page is a dry
// gorge between two ring walls, 3.2 km across: a wadi down its middle that runs only after a storm, and ONE SPRING. The
// rule bites hardest where the water is: the spring's margin is leached sand, wet and warm, and every trap in Korona
// stands round the one pool a traveller has to reach.
//
// THE MAP (x east, z south, y up from the gorge floor; R 1600).
//   THE WALLS       two ring walls, west and east (mesas of weathered quartzite, the gorge between them ~1.3 km wide), their
//                   seep lines the only green on the rock; the Hum on the west wall
//   THE FLOOR       red gravel and scrub: the desert's stands; badlands of hoodoos in the north-east; a sand field south
//   THE WADI        a dry bed down the middle, sand and bleached stones
//   THE SPRING      a pool in the wadi's bend with its ring of palms and dragon trees, and the hell round the water
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
var SEDESERT_WATER={hue:.46};   // the spring's teal; the desert kit's reeds and blooms follow it

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;document.body.appendChild(renderer.domElement);
// THE LIGHT: dry, hard, a warm dusty haze
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd0c4ae);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00017);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
const hemi=new THREE.HemisphereLight(0xd8d0c0,0x5a3a2a,.6);scene.add(hemi);
const SUN_POS=[-1200,900,-600];
const sun=new THREE.DirectionalLight(0xfff0d0,1.6);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xd0b8a0,.3);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the gorge
const TERR={R:1600};
const WIND=[-Math.SQRT1_2,-Math.SQRT1_2];
// THE WADI: down the middle, north to south, dry
const WADI={x:z=>-60+110*Math.sin(z*.0017+.9)+36*Math.sin(z*.0051+2.2),w:11,name:'The wadi (dry but after a storm)'};
const wadiD=(x,z)=>Math.abs(x-WADI.x(z));
// THE SPRING: in the wadi's bend
const SPRING={x:WADI.x(300)+18,z:300,r:22,bed:false,name:'The spring (the one water in the gorge)'};
const springD=(x,z)=>Math.hypot(x-SPRING.x,z-SPRING.z);
// THE WALLS' feet, by the mesas' strike (they run north to south): the distance in from each wall's face
const WALLX=1150,WALLHALF=470;
const wallD=(x,z)=>Math.min(Math.abs(x+WALLX)-WALLHALF,Math.abs(x-WALLX)-WALLHALF);
// the floor: red gravel falling gently south, the wadi cut into it, the spring's basin, the badlands' knobs north-east,
// the sand field south; the ring walls' tops beyond R
function floorBase(x,z){const far=smooth(1450,2700,Math.hypot(x,z));
 const knobs=smooth(.55,.72,fbm(x*.006+4,z*.006-2,61,3))*9*smooth(-200,400,x)*smooth(300,-500,z);
 return 10*(fbm(x*.0009+3.1,z*.0009-1.7,17,3)-.5)*2+3*(fbm(x*.004-2,z*.004+5,29,2)-.5)*2-.004*z+knobs+far*far*700*(.8+.4*fbm(x*.0012+9,z*.0012-4,33,3));}
function floorH(x,z){const b=floorBase(x,z),cut=smooth(WADI.w+26,WADI.w*.5,wadiD(x,z)),basin=smooth(SPRING.r*3,SPRING.r*.8,springD(x,z));return b-3.5*cut-2.2*basin;}

// ---------------------------------------------------------------- the rock (KSTACKS records)
const ROCK=(function(){const K=KSTACKS,L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<32;i++){const a=i/32*TAU;for(const k of [.4,.8,1.15])m=Math.min(m,floorH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-3;};
 /* the ground's drop across a stack's foot (a stack on a slope: its foot is set under the lowest ground, so KSTACKS lifts it by this) */
 const dropAt=(x,z,r)=>{let lo=1e9,hi=-1e9;for(let i=0;i<16;i++){const a=i/16*TAU,h=floorH(x+Math.cos(a)*r*1.15,z+Math.sin(a)*r*1.15);if(h<lo)lo=h;if(h>hi)hi=h;}return hi-lo;};
 const add=(B,name)=>{B.name=B.plates?'A pile of plates (Roraima\'s kind: thin beds, deep partings, a top-heavy head)':name;L.push(B);return B;};   /* plates: KSTACKS, Roraima's piles */
 // THE WALLS: two ring walls, elongated north to south, the gorge between them
 add(K.make({id:'westwall',kind:'mesa',x:-WALLX,z:0,y0:footY(-WALLX+WALLHALF,0,120),seed:7201,bed:[50,100],lobes:.22,weather:.8,tiers:[{h:320,r:700,e:2.2,ry:Math.PI/2},{h:120,r:600,e:2.2,ry:Math.PI/2,dx:-60}]}),'The west wall (a ring\'s lee face)');
 add(K.make({id:'eastwall',kind:'mesa',x:WALLX,z:120,y0:footY(WALLX-WALLHALF,120,120),seed:7202,bed:[50,100],lobes:.22,weather:.8,tiers:[{h:300,r:700,e:2.2,ry:Math.PI/2},{h:110,r:600,e:2.2,ry:Math.PI/2,dx:60}]}),'The east wall (the next ring\'s windward face, out of the rain here)');
 const big=L.slice();
 const clear=(x,z,r,pad)=>{for(const B of big){const f=K.foot([B],x,z);if(f&&f.d<r+pad)return false;}return wadiD(x,z)>r+40&&springD(x,z)>r+120&&Math.hypot(x,z)<TERR.R*.9;};
 // THE BADLANDS: hoodoos and a fin in the north-east
// THE VARIETY of the stacks (the owner, 2026-10-19: no two neighbours alike): each draws its own taper, lean, girth and crown
 // (KSTACKS cluster: taper, lean, e, crown ranges; lift for a stack on a slope)
 K.cluster({id:'hoodoo',seed:7301,c:[420,-620],rad:420,n:9,H:[12,48],r:[2.5,9],gap:12,kinds:{spire:.7,balanced:.2,fin:.1},taper:[.15,.55],lean:[0,.15],e:[1,1.5],crown:[.4,1.15],plates:[1.2,3.5],platesShare:.5,lift:dropAt,ground:(x,z)=>footY(x,z,8)+2,accept:(x,z,r)=>clear(x,z,r,30)}).forEach(B=>add(B,B.kind==='balanced'?'A balanced rock of the badlands':B.kind==='fin'?'A fin of the badlands':'A hoodoo'));
 // STACKS on the floor
 K.cluster({id:'gorgestack',seed:7302,c:[-300,700],rad:500,n:4,H:[50,135],r:[9,22],gap:40,kinds:{spire:.7,balanced:.3},taper:[.3,.6],lean:[0,.12],e:[1,1.6],crown:[.45,1],plates:[2,6],platesShare:.5,lift:dropAt,ground:(x,z)=>footY(x,z,16)+2,accept:(x,z,r)=>clear(x,z,r,60)}).forEach(B=>add(B,B.kind==='balanced'?'A balanced rock':'A quartzite spire'));
 return L;})();
const WEST=ROCK[0];

// ---------------------------------------------------------------- the station's say: STAGE (47 reads it)
const STAGE={
 name:'Korona: the lee gorge',R:TERR.R,bodies:ROCK,floor:floorH,capY:WEST.y0+400,seed:15,talusH:24,heroR:1600,
 stream:null,streamD:()=>1e9,pools:[SPRING],
 bare:(x,z)=>smooth(SPRING.r*1.35,SPRING.r*.95,springD(x,z)),   /* the pool itself: nothing roots in it */
 // the rain shadow: nothing is windward here; the wet is the spring's
 windward:(x,z)=>0,
 wetExtra:(x,z)=>.9*smooth(150,30,springD(x,z))+.12*smooth(30,0,wadiD(x,z)),
 warm:(x,z)=>{const t=NECANYONS.top(x,z);return t>-1e8?.7:1;},
 // the gorge's sand is leached: the spring's margin stays poor though wet (the hell round the water); a little silt
 // on the wadi's banks, pockets on the benches
 rich:(x,z)=>{const t=NECANYONS.top(x,z);if(t>-1e8)return .45*smooth(.55,.7,fbm(x*.013+2,z*.013-6,51,2));return .12*smooth(140,30,springD(x,z))+.25*smooth(60,10,wadiD(x,z));},
 poorExtra:(x,z)=>.78,
 bogAt:(x,z)=>0,
 // red gravel, the wadi's sand and the spring's margin, the spring's green ring
 layers:{a:'ground.talus',b:'ground.sand',c:'ground.bog'},layerCol:[0x9a5a3a,0xc8a070,0x5a6a30],
 weights:(x,z)=>[smooth(WADI.w+30,WADI.w+4,wadiD(x,z))+smooth(90,40,springD(x,z)),smooth(70,22,springD(x,z))],
 rockCol:{band:[0xa88478,0xb89486,0x9a7868,0xc4a494],top:0xb09a8c,soil:0x8a5a40},waterCol:0x1e4a48,
 floorLabel:'The gorge floor (red gravel, leached sand)',waterLabel:'The spring',
 // the desert kit on the whole floor; no rainforest in a rain shadow
 desert:(x,z)=>1,desertQ:.85,jungleQ:0,necQ:.7,
 // the desert kit's fields (biomes/sedesert: canyon, oasis, dune)
 fields:{canyon:(x,z)=>smooth(260,60,wallD(x,z)),oasis:(x,z)=>smooth(170,40,springD(x,z)),dune:(x,z)=>smooth(.5,.66,fbm(x*.0022-7,z*.0022+3,62,2))*smooth(300,700,z),rim:(x,z)=>0,abyss:(x,z)=>0},
 bias:{lacefan:0,cointree:.5,lacepitcher:.2,stormpod:.5,rainbowfan:1,greatsundew:1,cobralily:.6,bloodbulb:.4,bloodtrumpet:.5,maneater:1.6,coiltendril:1,groundstar:.9,punjipit:1.1,beartrap:1.1,numbthorn:.9,snareflower:.7},
 carvings:{body:'westwall',tier:0,a0:-.55,a1:.4,y0:1.6,h:3,name:'Contour carvings: the Hum (the gorge tribe\'s warning of the spring, on the west wall)'},
 spine:(function(){const S=[[SPRING.x,SPRING.z]];for(let z=-1300;z<=1300;z+=520)S.push([WADI.x(z),z]);S.push([-WALLX+WALLHALF+40,-300],[-WALLX+WALLHALF+40,500],[WALLX-WALLHALF-40,-200],[WALLX-WALLHALF-40,600],[420,-620],[-300,700]);return S;})(),
};
