// ================================================================= HOST — stage (k-guilin: the Hykkousoi hinterlands, the lakeshore by Trigon)
// The ideal-type host for the KGUILIN kit: renderer, light, the lake, the plain and the wadi, and the showcase's rock as
// KSTACKS records (core/terrain/37-core-stacks.js), which the kit lays out (46: KGUILIN.lay) and 47 builds the land from.
//
// WHAT (PLAN.md): Krator's inland tower karst behind the NW bay (biomes/nwbay, the bay of Ys): the same limestone province as
// the bay's drowned stacks, seen where it is not drowned. Forked from biomes/guilin (Earth's South China karst, frozen).
// WHERE (PLAN.md section 1): the biome polygon k-guilin on the scale model (4.22); this page stands at px 444.5,414.5 on the
// south-west shore of the great lake, 5 km west-south-west of the Hykkousoi city of Trigon: -1,340 m, 1.89 atm, +32 degC mean
// (+37 in the warmest month, +27 in the coldest), 1,500-1,900 mm (XA: the hypertropic jungle the lake's shore wets; the
// plain beyond is tropical savanna). The lake's surface (-1,500 m on the model) is the page's y = 0.
//
// THE MAP (x east, z south, y up from the lake; R 1600).
//   THE LAKE         fresh water along the north edge, a bay of it reaching south into the page; a beach of sand and
//                    pebbles; three towers standing in its shallows with the notch at the waterline
//   THE WADI         a seasonal river (the Borun Gulusu's kind) down from the south to the lake's bay: a broad bed of sand
//                    and pebble bars with the wet season's shrunken channel of water in it
//   THE FENGLIN      lone towers 40-135 m tall in nwbay's stacks' proportions (about 2.7 times as tall as wide), each a
//                    steep grey cliff under a dome of forest, scattered over the plain
//   THE FENGCONG     in the south-east a low rock base 600 m long carries a crowd of peaks whose feet run together
//   THE STONE FOREST in the south-west the plain rises onto a karst bench (toward the upland edge and the Scyvoi's drylands)
//                    and the rock comes up through the soil as hundreds of blades and pinnacles; a pond in its middle
//   THE PLAIN        paddies on the lake's flats and along the wadi, groves of camphor, osmanthus and pomelo, banyans by the
//                    water, the jungle giants (nwbay's prism gums, ironbarks, fan-crowns) in stands between the towers
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
// (TAU, clamp, smooth, fbm, rng... are the core's, made globals by the hyperjungle's 41, read in place: build.py)
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// THE LIGHT: the shared sky sets the sun, the hemisphere, the fog and the exposure from its colour script at the hour
// (89s-host-sky.js); these are the page's lights it drives. The haze is the lake's: thick, wet air (1.9 atm), each row of
// towers paler than the one before it
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb2bec2);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00030);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
const hemi=new THREE.HemisphereLight(0xc8d4dc,0x3a4634,.7);scene.add(hemi);
const SUN_POS=[-1100,1000,-500];
const sun=new THREE.DirectionalLight(0xfff2dc,1.3);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xbcc8cc,.32);fill.position.set(800,400,900);scene.add(fill);
// NWBAY'S LOOKS ON THIS PAGE (the final rebuild, pair 13, 2026-11-09): nwbay's species read in place (48n1-48n3) take only what a host asks
// (biomes/nwbay/src/45-host-stage.js NWBAY_LOOK). Taken here: its attach-audit fixes, so nothing borrowed floats off its limb: BIO.flareJoin on
// the limbs of .25 m and up (55 J; ?joints=0) and BIO.holdTo on the blooms and the crown clumps (55 holdB, holdC; ?holds=0). Its looks (the
// back-light, the floor cover's root colour, the dry season, the bracket fungi's new shape) stay off: they are nwbay's page's, not asked for here
{const q=new URLSearchParams(location.search);window.NWBAY_LOOK={backlit:0,ground:0,season:false,fung:false,joints:q.get('joints')!=='0',holds:q.get('holds')!=='0'};}

// ---------------------------------------------------------------- the lake, the plain, the wadi, the stone forest's bench
const TERR={R:1600};
// THE LAKE: its shore a line across the north of the page (z = shoreZ(x)), a bay of it reaching south to the wadi's mouth;
// lakeD(x,z) the distance from the shore line (m: positive on land, negative over the water; along the line's normal)
const LAKE={name:'The great lake (fresh water; Trigon on its south shore, 5 km east)',level:0,bay:{x:240,w:300,d:400}};
const shoreZ=x=>-640+150*Math.sin(x*.0017+.6)+60*Math.sin(x*.0051+2)+LAKE.bay.d*Math.exp(-Math.pow((x-LAKE.bay.x)/LAKE.bay.w,2));
const lakeD=(x,z)=>{const e=4,g=(shoreZ(x+e)-shoreZ(x-e))/(2*e);return (z-shoreZ(x))/Math.sqrt(1+g*g);};
// THE WADI: from the page's south edge north to the lake's bay; w the half-width of its bed (sand and pebble bars), ww of the
// wet season's channel in it; its water falls toward the lake with the plain
const RIVER={x:z=>{const u=z-shoreZ(LAKE.bay.x);return LAKE.bay.x-.17*u+160*Math.sin(u*.0021)+45*Math.sin(z*.0063+1);},w:40,ww:9,
 name:'The wadi (a seasonal river: the wet season\'s channel in its bed of bars)'};
// the mouth: where the wadi's line meets the shore (found once by halving); upstream of it the wadi, past it the lake
RIVER.z0=(function(){let a=-1600,b=1600;for(let i=0;i<60;i++){const m=(a+b)/2;if(lakeD(RIVER.x(m),m)<0)a=m;else b=m;}return b;})();
const riverD=(x,z)=>z<RIVER.z0?Math.hypot(x-RIVER.x(RIVER.z0),z-RIVER.z0):Math.abs(x-RIVER.x(z));
// the plain's rise from the shore (the model: about 40 m over the page), without its swells: the wadi's water follows it
const riseAt=d=>.9+.0125*Math.max(0,d);
RIVER.level=z=>{const zz=Math.max(z,RIVER.z0);return Math.max(.15,riseAt(lakeD(RIVER.x(zz),zz))-2.6);};
// THE STONE FOREST: its bench a few metres over the plain, the rock up through it; the pond in its middle
const SF={c:[-820,760],rad:330,name:'The stone forest'};
const POND={x:-775,z:705,rx:46,rz:27,ry:.5,name:'The pond in the stone forest'};
const pondE=(x,z)=>{const c=Math.cos(POND.ry),s=Math.sin(POND.ry),dx=x-POND.x,dz=z-POND.z,u=(dx*c+dz*s)/POND.rx,v=(-dx*s+dz*c)/POND.rz;return Math.sqrt(u*u+v*v);};
const sfD=(x,z)=>Math.hypot(x-SF.c[0],z-SF.c[1]);
// the plain: the rise from the shore, long low swells, the bench of the stone forest; under the water the lake's bed falls
// away from a beach (the waterline about 13 m out from the shore line) to 30 m
function plainH(x,z){const d=lakeD(x,z);
 if(d<0)return Math.max(-30,.9+d*.07)+1.2*(fbm(x*.004+7,z*.004-2,31,2)-.5);
 const sw=smooth(0,90,d);
 return riseAt(d)+sw*(3*(fbm(x*.0011+3.1,z*.0011-1.7,17,3)-.5)*2+1.1*(fbm(x*.005-2,z*.005+5,29,2)-.5)*2)
  +7*smooth(SF.rad+170,SF.rad*.45,sfD(x,z));}
// the wadi's bed: cut under the plain, the channel a little deeper in it, the bars a little higher at its sides
function floorH(x,z){const b=plainH(x,z),d=riverD(x,z),cut=z>RIVER.z0-60?smooth(RIVER.w+34,RIVER.w-4,d):0;let h=b;
 if(cut>0){const L=RIVER.level(z),bed=L-.4-2.2*smooth(RIVER.ww*1.2,RIVER.ww*.1,d)+.6*smooth(RIVER.ww*1.4,RIVER.w,d);h=b+(Math.min(b,bed)-b)*cut;}
 const pe=pondE(x,z);if(pe<1.3){const L=plainH(POND.x,POND.z)-.7;h=h+(Math.min(h,L-.4-2.2*smooth(1,.3,pe))-h)*smooth(1.3,.95,pe);}
 return h;}
POND.level=plainH(POND.x,POND.z)-.7;

// ---------------------------------------------------------------- the rock (KSTACKS records: core/terrain/37-core-stacks.js)
// A body's foot is set under the lowest floor round it, so its wall always meets the ground (or the lake's bed).
// A TOWER is KSTACKS.tower (core/terrain): a cliff standing almost sheer for half its height or more, then a dome closing in
// to a small cap. HEIGHTS AND PROPORTIONS ARE NWBAY'S (the owner, 2026-10-26: one landscape with the bay's drowned stacks):
// 40-135 m over the ground (the bay's 42-132 m over its water), about 2.7 times as tall as wide (R = H/2.7, as
// biomes/nwbay/src/45-host-stage.js makes its stacks). The record stays a plain KSTACKS record: KSTACKS.mesh draws it and
// KGUILIN.lay (46) reads its walls' slope. tower:true marks it.
const ROCK=(function(){const K=KSTACKS,L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<32;i++){const a=i/32*TAU;for(const k of [.4,.8,1.15])m=Math.min(m,floorH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-3;};
 const add=(B,name)=>{B.name=name;L.push(B);return B;};
 function tower(id,seed,x,z,H,R,name,y0){return add(K.tower({id,seed,x,z,H,R,y0,foot:footY}),name);}   // the tower's profile: KSTACKS.tower (core/terrain)
 const big=[];
 // THE FENGCONG: one low base in the south-east, its peaks crowded on it
 const FC={x:900,z:880},base=add(K.make({id:'fcbase',kind:'butte',x:FC.x,z:FC.z,y0:footY(FC.x,FC.z,330),seed:2101,
  tiers:[{h:30,r:290,e:1.45,ry:-.5}],bed:[10,20],lobes:.3,weather:.5}),'The fengcong\'s base (one rock under a crowd of peaks)');big.push(base);
 const onBase=(x,z,r)=>{const a=K.at([base],x,z);if(!a||a.d>-(r*.55+12))return false;for(let k=0;k<12;k++){const q=k/12*TAU,b2=K.at([base],x+Math.cos(q)*r*.6,z+Math.sin(q)*r*.6);if(!b2)return false;}return true;};
 {const s=KRAND.stream(KRAND.hash(2102,1)),pk=[];
  for(let t=0;t<400&&pk.length<8;t++){const a=s.range(0,TAU),d=290*1.2*Math.sqrt(s.next()),x=FC.x+Math.cos(a)*d,z=FC.z+Math.sin(a)*d,H=s.range(60,125),R=H/2.7*s.range(.9,1.15);
   if(!onBase(x,z,R))continue;if(pk.some(p=>Math.hypot(p.x-x,p.z-z)<p.R+R-6))continue;pk.push({x,z,R,H});}
  pk.forEach((p,i)=>big.push(tower('fcpeak'+i,2110+i,p.x,p.z,p.H,p.R,'A peak of the fengcong',base.top-2)));}
 // IN THE LAKE: three towers in the shallows off the shore, their feet on the lake's bed, their tops [2] m over the water
 [[-700,150,118],[560,110,92],[-120,230,70]].forEach((q,i)=>{const x=q[0],z=shoreZ(x)-q[1],R=q[2]/2.7,y0=footY(x,z,R*1.15);
  big.push(tower('lake'+i,2190+i,x,z,q[2]-y0,R,'A karst tower standing in the lake',y0));});
 // THE FENGLIN: lone towers over the plain, off the lake and the wadi (two with their feet at its bed's edge), off the stone
 // forest and the fengcong
 const bz=[-60,620];big.push(tower('bendN',2201,RIVER.x(bz[0])+RIVER.w+52,bz[0],128,128/2.7,'A karst tower at the wadi\'s edge'));
 big.push(tower('bendS',2202,RIVER.x(bz[1])-RIVER.w-46,bz[1],104,104/2.7,'A karst tower at the wadi\'s edge'));
 {const s=KRAND.stream(KRAND.hash(2203,1));let n=0;
  for(let t=0;t<1200&&n<22;t++){const x=s.range(-1.5,1.5)*TERR.R,z=s.range(-1.5,1.5)*TERR.R,H=s.range(40,135),R=H/2.7*s.range(.88,1.14);
   if(Math.hypot(x,z)>TERR.R*.93-R)continue;if(lakeD(x,z)<R+40)continue;if(riverD(x,z)<RIVER.w+R*1.08+6)continue;if(sfD(x,z)<SF.rad+R+90)continue;
   if(Math.hypot(x-FC.x,z-FC.z)<380+R)continue;if(big.some(B=>Math.hypot(B.x-x,B.z-z)<B.R*.85+R+s.range(40,150)))continue;
   big.push(tower('tower'+n,2210+n,x,z,H,R,'A karst tower (fenglin: alone on the plain)'));n++;}}
 // THE STONE FOREST: blades (fins) and pinnacles (spires) packed close on the bench in thickets, a corridor's width
 // apart, taller toward its middle, thinning to grass and pines at its edge; none in the pond. Each grooved top to bottom
 // by the rain (the rock's texture: karren)
 const dens=(x,z)=>{const d=sfD(x,z)/SF.rad;return smooth(1.02,.5,d)*smooth(.36,.56,fbm(x*.011+5,z*.011-3,57,2));};
 K.cluster({id:'sf',seed:2301,c:SF.c,rad:SF.rad,n:900,H:[12,28],r:[1.5,5],gap:.35,kinds:{fin:.55,spire:.45},
  taper:[.3,.65],crown:[.14,.45],e:[1.3,3.2],lean:[0,.07],lift:(x,z)=>15*smooth(SF.rad*.9,SF.rad*.15,sfD(x,z)),
  ground:(x,z)=>footY(x,z,4)+2,
  accept:(x,z,r)=>pondE(x,z)>1.35+r/30&&KRAND.unit(KRAND.hash(2302,Math.round(x*4),Math.round(z*4)))<dens(x,z)})
  .forEach(B=>add(B,B.kind==='fin'?'A blade of the stone forest':'A pinnacle of the stone forest'));
 return L;})();
