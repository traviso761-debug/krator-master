// ================================================================= HOST — stage (Korona, station 4: THE TRENCHES)
// The same host as station 1's (src/45-host-stage.js) with another landform and another STAGE: 47 (the land) is shared.
//
// WHERE (biomes/korona/NOTES.md, "Candidate station sites"): a ring ridge at 1,600 to 1,700 m between two arms of the main
// trench's salt lake at -2,100 m (scale model px 784, 188): 4,200 m of wall on each side, the crest astride the rain line
// (3,600 mm at its west foot, 900 on the crest, 280 on the lee), Cfa on the crest and BSh on the lee shoulder, the abyssal
// salt lake (WX, 40 degC, 2.1 atm) below. This page is the crest and the top of its two faces, 3.2 km across; the lake is
// drawn at the page's edges far below its true depth (a stage cannot hold 4 km of wall).
//
// THE MAP (x east, z south, y up from the crest's foot; R 1600).
//   THE CREST       runs north to south down the middle, 420 m over the page's edges: a row of fins along it, THE PROW (a
//                   butte with a bench and a cap) at its north end: the summit life on it, the Hum on its face
//   THE WINDWARD FACE  west: wet, gullied, the rainforest climbing it from the salt, lace fans in the gullies, great sundews
//                   and the traps on its poor wet rock, the man-eaters low down where the air is hot
//   THE LEE         east: dry, bare, scree and rock, almost nothing growing (the rain shadow)
//   THE SALT        at both edges: the lake's arms, a white crust round them where nothing grows
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
var SEDESERT_WATER={hue:.46};   // the desert kit's reeds and blooms (none here: the lee has no water) follow it

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;document.body.appendChild(renderer.domElement);
// THE LIGHT: thin dry air on the crest, the salt's glare in the haze below
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc8c4b4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00019);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
const hemi=new THREE.HemisphereLight(0xc8ccc0,0x4a4238,.62);scene.add(hemi);
const SUN_POS=[-1200,900,-600];
const sun=new THREE.DirectionalLight(0xfff0d0,1.5);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8c0b0,.3);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the ridge
const TERR={R:1600};
const WIND=[-Math.SQRT1_2,-Math.SQRT1_2];
// THE SALT: the lake's two arms at the page's edges, their level -440 (far above the true floor)
const SALT=[{x:-2500,z:0,r:1250,y:-440,bed:false,name:'The salt lake (its western arm)'},{x:2500,z:0,r:1250,y:-440,bed:false,name:'The salt lake (its eastern arm)'}];
const saltD=(x,z)=>Math.min(Math.hypot(x-SALT[0].x,z)-SALT[0].r,Math.hypot(x-SALT[1].x,z)-SALT[1].r);
// the crest: a ridge along z at x ~ 0 (wandering a little), 420 m high, its windward face gullied, its lee smoother
const crestX=z=>80*Math.sin(z*.0013+.6)+30*Math.sin(z*.0041);
function floorBase(x,z){const dx=x-crestX(z),w=dx<0?520:460,f=Math.exp(-(dx*dx)/(w*w)),foot=smooth(-520,-380,-Math.abs(dx)*0-440+0);
 const gully=dx<0?-28*(1-Math.abs(fbm(z*.004+dx*.0012,dx*.0009,61,3)*2-1))*smooth(0,-250,dx):0;
 const h=-440+860*f+gully+8*(fbm(x*.0015+3,z*.0015-1,17,3)-.5)*2+2.5*(fbm(x*.006-2,z*.006+5,29,2)-.5)*2;
 return Math.max(h,-442+2*smooth(40,-40,saltD(x,z)));}
function floorH(x,z){return floorBase(x,z);}

// ---------------------------------------------------------------- the rock (KSTACKS records)
const ROCK=(function(){const K=KSTACKS,L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<32;i++){const a=i/32*TAU;for(const k of [.4,.8,1.15])m=Math.min(m,floorH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-3;};
 /* the ground's drop across a stack's foot (a stack on a slope: its foot is set under the lowest ground, so KSTACKS lifts it by this) */
 const dropAt=(x,z,r)=>{let lo=1e9,hi=-1e9;for(let i=0;i<16;i++){const a=i/16*TAU,h=floorH(x+Math.cos(a)*r*1.15,z+Math.sin(a)*r*1.15);if(h<lo)lo=h;if(h>hi)hi=h;}return hi-lo;};
 const add=(B,name)=>{B.name=B.plates?'A pile of plates (Roraima\'s kind: thin beds, deep partings, a top-heavy head)':name;L.push(B);return B;};   /* plates: KSTACKS, Roraima's piles */
 // THE PROW: a butte with a bench and a cap at the crest's north end. Its foot is set under the lowest ground round it (the
 // flanks, ~260 m below the crest), so the first tier is that much taller: the body stands in the ridge and the bench and
 // the cap stand 110 and 180 m CLEAR OF THE CREST (the owner, 2026-10-19: the prow was wholly inside the ridge)
 const PX=crestX(-900),PZ=-900,PY=footY(PX,PZ,240),CREST_Y=floorH(PX,PZ);
 add(K.make({id:'prow',kind:'mesa',x:PX,z:PZ,y0:PY,seed:6201,bed:[35,80],lobes:.24,weather:.9,tiers:[{h:110+(CREST_Y-PY),r:240,e:1.5,ry:1.5},{h:70,r:150,e:1.3,ry:1.5,dx:0,dz:-20}]}),'The prow (a butte at the crest\'s north end)');
 // THE FINS along the crest, each its own height, taper and crown; lifted by the ground's fall across its foot
 K.row({id:'crestfin',seed:6301,a:[crestX(-400),-400],b:[crestX(1100),1100],n:8,H:[30,120],r:[8,16],e:[4,7],jitter:14,taper:[.25,.5],crown:[.5,1],plates:[2,6],platesShare:.4,lift:dropAt,ground:(x,z)=>footY(x,z,14)+2}).forEach(B=>add(B,'A fin on the crest'));
 const big=L.slice();
 const clear=(x,z,r,pad)=>{for(const B of big){const f=K.foot([B],x,z);if(f&&f.d<r+pad)return false;}return saltD(x,z)>r+80&&Math.hypot(x,z)<TERR.R*.92;};
 // SPIRES on the windward face (a 50 degree slope: each is lifted by the drop across its foot, so it stands as tall above
 // the uphill ground as its height says), each its own taper, lean, girth and crown
 K.cluster({id:'facestack',seed:6302,c:[-520,200],rad:420,n:6,H:[35,130],r:[7,18],gap:40,kinds:{spire:.75,balanced:.25},taper:[.3,.6],lean:[0,.12],e:[1,1.6],crown:[.45,1],plates:[2,6],platesShare:.5,lift:dropAt,ground:(x,z)=>footY(x,z,14)+2,accept:(x,z,r)=>clear(x,z,r,50)}).forEach(B=>add(B,B.kind==='balanced'?'A balanced rock on the windward face':'A spire on the windward face'));
 return L;})();
const PROW=ROCK[0];

// ---------------------------------------------------------------- the station's say: STAGE (47 reads it)
const windwardOf=(x,z)=>smooth(320,-320,x-crestX(z));
const heightK=(x,z)=>clamp((floorH(x,z)+440)/860,0,1);   // 0 at the salt, 1 on the crest
const STAGE={
 name:'Korona: the trenches',R:TERR.R,bodies:ROCK,floor:floorH,capY:PROW.top-40,seed:14,talusH:18,
 stream:null,streamD:()=>1e9,pools:SALT,heroR:1600,
 bare:(x,z)=>smooth(-330,-392,floorH(x,z)),
 windward:windwardOf,
 // the salt: nothing roots on the crust (wet taken away, poor given)
 wetExtra:(x,z)=>-.9*smooth(-300,-410,floorH(x,z))+.12*(1-heightK(x,z))*windwardOf(x,z),
 poorExtra:(x,z)=>.9*smooth(-300,-410,floorH(x,z))+.15*smooth(.6,.9,heightK(x,z)),
 // hot and dense at the salt (40 degC, 2.1 atm), cool on the crest
 warm:(x,z)=>.3+.7*(1-heightK(x,z)),
 // the windward gullies hold soil; the crest's pockets; the lee has little
 rich:(x,z)=>{const t=NECANYONS.top(x,z);if(t>-1e8)return .5*smooth(.55,.7,fbm(x*.013+2,z*.013-6,51,2));return clamp((.55*windwardOf(x,z)*smooth(.52,.66,fbm(x*.0025-4,z*.0025+1,52,3))+.1)*smooth(-380,-250,floorH(x,z)),0,1);},
 bogAt:(x,z)=>.3*smooth(.5,.62,fbm(x*.02+5,z*.02+1,53,2))*windwardOf(x,z),
 // THE RAIN LINE (the owner, 2026-10-19: the two faces were too alike): the windward face wears sphagnum (the fourth layer)
 // over litter tinted green, thickest low on the face where the rain is, thinning to the crest; the lee is pale warm scree
 layers:{a:'ground.litter',b:'ground.talus',c:'ground.sand',d:'ground.bog'},layerCol:[0x3a3a28,0x8a8278,0xe8e4dc,0x5a6a30],
 layerMul:[[.52,.92,.42],[1.1,1.04,.94],[1,1,1],[.42,1,.4]],   /* the library's litter and sphagnum are yellow-olive at a distance: pulled green */
 weights:(x,z)=>{const w=windwardOf(x,z),h=floorH(x,z),k=heightK(x,z),salt=smooth(-300,-420,h);
  return[(1-w)*.9+.3*smooth(.75,1,k),salt,w*(1-salt)*smooth(.98,.5,k)*(.4+.6*smooth(.38,.62,fbm(x*.008+3,z*.008-5,55,2)))];},
 rockCol:{band:[0x8a7f78,0x9a8e86,0x7a6e68,0xa89c94],top:0xa39890,soil:0x6a5a48},waterCol:0x8ab0a8,
 floorLabel:'The ridge (the crest and its two faces)',waterLabel:'The salt lake (an arm of it, far below its true depth)',
 // the rainforest climbs the windward face from the salt; nothing of it on the lee or the crest
 // (denser and higher up the windward face since 2026-10-19: the rain line is the station's point)
 // THE LEE'S OWN (KNOWN_ISSUES, closed 2026-10-19): the eastern desert's Socotran kit (biomes/sedesert, read in place as the
 // gorge reads it) on the rain shadow's scree below the crest, thin: dragon trees and the stands on its shoulder
 desert:(x,z)=>(1-windwardOf(x,z))*smooth(.97,.6,heightK(x,z))*smooth(-410,-330,floorH(x,z)),desertQ:.85,
 fields:{canyon:(x,z)=>Math.max(.4*(1-windwardOf(x,z)),smooth(220,40,NECANYONS.footD(x,z))),oasis:(x,z)=>0,dune:(x,z)=>smooth(.52,.68,fbm(x*.0022-7,z*.0022+3,62,2))*(1-windwardOf(x,z))*smooth(.6,.25,heightK(x,z)),rim:(x,z)=>smooth(.7,.95,heightK(x,z))*(1-windwardOf(x,z)),abyss:(x,z)=>0},
 jungle:(x,z)=>windwardOf(x,z)*smooth(1,.72,heightK(x,z))*smooth(-410,-330,floorH(x,z)),jungleQ:.9,necQ:.9,
 bias:{lacefan:(x,z)=>2*windwardOf(x,z),cointree:.6,rainbowfan:1,lacepitcher:1,stormpod:1.2,greatsundew:(x,z)=>1.5*windwardOf(x,z),
  cobralily:.6,bloodbulb:.4,bloodtrumpet:.6,maneater:.8,coiltendril:.6,groundstar:.6,punjipit:.7,beartrap:.7,numbthorn:.8,snareflower:.6},
 carvings:{body:'prow',tier:0,a0:1.9,a1:3.3,y0:1.6,h:2.8,name:'Contour carvings: the Hum (a crest tribe\'s road-marks, on the prow\'s face)'},
 spine:(function(){const S=[];for(let z=-1400;z<=1400;z+=400)S.push([crestX(z),z]);S.push([PROW.x,PROW.z],[-520,200],[-900,600],[-1100,-500],[700,300]);return S;})(),
};
