// ================================================================= HOST — stage (Korona, station 3: THE FERTILE BASIN)
// The same host as station 1's (src/45-host-stage.js) with another landform and another STAGE: 47 (the land) is shared.
//
// WHERE (biomes/korona/NOTES.md, "Candidate station sites"): the Tiers' lake, a closed basin in the eastern rings at scale
// model px (957, 228), its lake drawn at 379 m over 3,440 km2, fed by the Tiers stream from the eastern ring: Af on every
// shore, 28 degC, 1,400 to 2,700 mm, 1.65 atm. The near-idyllic end of the rule: the shore is silt, nothing here needs to
// eat what it catches, and the reagents grow in meadows where elsewhere they hide in a pocket. One bog corner in the
// south-west, leached and acid, keeps the warning. This page is the lake's western shore, 3.2 km across.
//
// THE MAP (x east, z south, y up from the lake; R 1600).
//   THE LAKE        from x ~ 500 eastward (the near shore of a lake 60 km across), its level the page's zero
//   THE SHORE       sand and silt meadows along it: rainbow fans in drifts, lace fans at the water, cobra lilies harmless
//                   at the seeps; the Tiers stream coming down from the north-west into the lake
//   THE RAINFOREST  behind the shore, up the basin's gentle slopes (the hyperjungle, read in place)
//   THE BENCH       a two-tier mesa on the north-west: the summit life on its cap, the Hum on its face
//   THE BOG CORNER  south-west: a leached hollow where the floor is poor and wet again: the first traps
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
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;document.body.appendChild(renderer.domElement);
// THE LIGHT: bright, humid, the lake's glare in the haze
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc4ccc0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00021);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
const hemi=new THREE.HemisphereLight(0xc8d4cc,0x3a3a2e,.7);scene.add(hemi);
const SUN_POS=[-1200,900,-600];
const sun=new THREE.DirectionalLight(0xfff2d8,1.45);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8c4b8,.3);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the basin
const TERR={R:1600};
// THE LAKE: a disc far larger than the page, its near shore crossing the stage at x ~ 500; its level is y 0 (set here)
const LAKE={x:2100,z:0,r:1600,y:0,bed:false,name:'The Tiers\' lake'};
const lakeD=(x,z)=>Math.hypot(x-LAKE.x,z-LAKE.z)-LAKE.r;   // negative inside the lake
// THE STREAM: the Tiers stream, down from the north-west into the lake (a line along z; it meets the shore in the north)
const STREAM={x:z=>-420+70*Math.sin(z*.0021+.4)+24*Math.sin(z*.0063+1.5),w:7,depth:.5,name:'The Tiers stream (down to the lake)'};
const streamD=(x,z)=>Math.abs(x-STREAM.x(z));
// THE BOG CORNER: a hollow in the south-west
const BOG={x:-700,z:760,r:330};
const bogK=(x,z)=>smooth(BOG.r*1.15,BOG.r*.55,Math.hypot(x-BOG.x,z-BOG.z));
// the floor: the shore slopes gently up westward from the lake (the basin's floor), the bog corner sunk a little, the
// lake bed falling away under the water; the basin's walls rise far off
function floorBase(x,z){const d=lakeD(x,z);
 const rough=4*(fbm(x*.0012+3.1,z*.0012-1.7,17,3)-.5)*2+1.5*(fbm(x*.005-2,z*.005+5,29,2)-.5)*2;
 if(d<0)return -2-.03*(-d)-6*smooth(0,-120,d)+rough*.3;   /* the lake bed, falling away under the water */
 const far=smooth(1400,2800,Math.hypot(x+600,z))*smooth(-50,200,d);   /* the basin's walls: on the land side only */
 return 1.5+.02*d+rough+far*far*500*(.8+.4*fbm(x*.0012+9,z*.0012-4,33,3))-8*bogK(x,z);}
function floorH(x,z){const b=floorBase(x,z),sd=streamD(x,z),cut=smooth(STREAM.w+18,STREAM.w*.4,sd)*smooth(-40,40,lakeD(x,z));return b-3.6*cut;}

// ---------------------------------------------------------------- the rock (KSTACKS records)
const ROCK=(function(){const K=KSTACKS,L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<32;i++){const a=i/32*TAU;for(const k of [.4,.8,1.15])m=Math.min(m,floorH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-3;};
 /* the ground's drop across a stack's foot (a stack on a slope: its foot is set under the lowest ground, so KSTACKS lifts it by this) */
 const dropAt=(x,z,r)=>{let lo=1e9,hi=-1e9;for(let i=0;i<16;i++){const a=i/16*TAU,h=floorH(x+Math.cos(a)*r*1.15,z+Math.sin(a)*r*1.15);if(h<lo)lo=h;if(h>hi)hi=h;}return hi-lo;};
 const add=(B,name)=>{B.name=B.plates?'A pile of plates (Roraima\'s kind: thin beds, deep partings, a top-heavy head)':name;L.push(B);return B;};   /* plates: KSTACKS, Roraima's piles */
 add(K.make({id:'bench',kind:'mesa',x:-760,z:-640,y0:footY(-760,-640,300),seed:5201,bed:[35,80],lobes:.22,weather:.8,tiers:[{h:120,r:300,e:1.35,ry:.6},{h:70,r:180,e:1.2,ry:.6,dx:30,dz:20}]}),'The bench (a two-tier mesa over the shore)');
 const big=L.slice();
 const clear=(x,z,r,pad)=>{for(const B of big){const f=K.foot([B],x,z);if(f&&f.d<r+pad)return false;}return lakeD(x,z)>r+30&&streamD(x,z)>r+40&&Math.hypot(x,z)<TERR.R*.92&&Math.hypot(x-BOG.x,z-BOG.z)>BOG.r+r;};
 // STACKS on the shore: spires standing in the meadows and one in the shallows
// THE VARIETY of the stacks (the owner, 2026-10-19: no two neighbours alike): each draws its own taper, lean, girth and crown
 // (KSTACKS cluster: taper, lean, e, crown ranges; lift for a stack on a slope)
 K.cluster({id:'shorestack',seed:5301,c:[150,-200],rad:600,n:6,H:[40,135],r:[8,20],gap:40,kinds:{spire:.7,fin:.2,balanced:.1},taper:[.3,.6],lean:[0,.12],e:[1,1.6],crown:[.45,1],plates:[2,6],platesShare:.5,lift:dropAt,ground:(x,z)=>footY(x,z,16)+2,accept:(x,z,r)=>clear(x,z,r,50)}).forEach(B=>add(B,B.kind==='fin'?'A quartzite fin on the shore':B.kind==='balanced'?'A balanced rock on the shore':'A quartzite spire on the shore'));
 return L;})();
const BENCH=ROCK[0];

// ---------------------------------------------------------------- the station's say: STAGE (47 reads it)
const STAGE={
 name:'Korona: the fertile basin',R:TERR.R,bodies:ROCK,floor:floorH,capY:BENCH.y0+150,seed:13,talusH:16,
 air:{pressure:1.44},stream:STREAM,streamD,pools:[LAKE],
 windward:(x,z)=>.85+.15*smooth(600,-600,x),
 wetExtra:(x,z)=>.3*bogK(x,z)+.15*smooth(120,0,lakeD(x,z)),
 warm:(x,z)=>{const t=NECANYONS.top(x,z);return t>-1e8?.75:1;},
 // THE SILT: the whole shore and the slopes are rich (the lake's alluvium, the rainforest's litter); the bench's pockets;
 // the bog corner has nothing
 rich:(x,z)=>{const t=NECANYONS.top(x,z);if(t>-1e8)return .55*smooth(.5,.65,fbm(x*.013+2,z*.013-6,51,2));return clamp(.85*(1-bogK(x,z))*smooth(-30,30,lakeD(x,z)),0,1);},
 poorExtra:(x,z)=>.8*bogK(x,z),
 bogAt:(x,z)=>.4*smooth(.5,.62,fbm(x*.02+5,z*.02+1,53,2)),
 layers:{a:'ground.litter',b:'ground.sand',c:'ground.bog'},layerCol:[0x3a3a28,0xa89a86,0x5a6a30],
 weights:(x,z)=>[smooth(140,10,lakeD(x,z))*(.8+.2*fbm(x*.02,z*.02,41,2))+smooth(STREAM.w+14,STREAM.w+2,streamD(x,z)),bogK(x,z)*smooth(.4,.6,fbm(x*.01,z*.01,54,2))],
 rockCol:{band:[0x8a7f78,0x9a8e86,0x7a6e68,0xa89c94],top:0xa39890,soil:0x6a5a48},waterCol:0x1e3a3c,
 floorLabel:'The basin\'s shore (silt and sand: rich ground)',waterLabel:'The Tiers\' lake (and the stream down to it)',
 // the rainforest behind the shore meadows, not on the bog corner
 jungle:(x,z)=>smooth(60,220,lakeD(x,z))*(1-.9*bogK(x,z)),jungleQ:.75,necQ:.8,
 // THE SHORE'S OWN (NOTES.md, "The life"; KNOWN_ISSUES, closed 2026-10-19): the north-western lowlands' kit (biomes/nwlowlands,
 // read in place as the trenches read the sedesert) on the band along the water, within ~200 m of the lake, off the bog
 // corner and off the rock: its shore and bamboo zones (reeds, iris, sea pens, the groves), its glow-willows and paperbarks
 // at the water, its ferns under the rainforest's edge. Its fields: tropic (Af on every shore) and dry (none here)
 shore:(x,z)=>smooth(200,30,lakeD(x,z))*(1-bogK(x,z)),shoreQ:.5,
 // the glow-willows line the water (the kit's avenue option, a row along a host path: here the shore's edge, 14 m out from
 // the water, one tree every ~70 m; the waterside of the row falls in the lake and is skipped). The kit's shore zone alone
 // (its reading of the terrain's height) gave one willow on the whole shore
 shoreRows:[{path:(function(){const P=[],r=LAKE.r+14;for(let z=-1450;z<=1450;z+=100)P.push([LAKE.x-Math.sqrt(Math.max(0,r*r-(z-LAKE.z)*(z-LAKE.z))),z]);return P;})(),spacing:70,offset:6,species:'glowwillow'}],
 fields:{tropic:(x,z)=>1,dry:(x,z)=>0},
 bias:{rainbowfanFloor:(x,z)=>.9*smooth(260,30,lakeD(x,z))*smooth(60,220,lakeD(x,z)*-1+280),rainbowfan:1.2,lacefan:(x,z)=>1.8*smooth(220,20,lakeD(x,z)),
  cointree:.5,lacepitcher:.8,stormpod:.5,greatsundew:.5,cobralily:1.2,bloodbulb:.5,bloodtrumpet:.6,maneater:.9,coiltendril:.6,groundstar:.6,punjipit:.8,beartrap:.8,numbthorn:.8,snareflower:.6},
 carvings:{body:'bench',tier:0,a0:-.3,a1:1.2,y0:1.6,h:2.8,name:'Contour carvings: the Hum (the shore tribe\'s tally of the lake\'s years, on the bench\'s face)'},
 spine:(function(){const S=[[0,0],[300,-500],[300,500],[-300,0],[STREAM.x(-600),-600],[STREAM.x(200),200],[BENCH.x,BENCH.z],[BOG.x,BOG.z],[150,-200]];return S;})(),
};
