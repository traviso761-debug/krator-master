// ================================================================= HOST — stage (guilin: a reach of the South China karst)
// The ideal-type host for the GUILIN kit: renderer, light, the plain and the Li River, and the showcase's rock as KSTACKS
// records (core/terrain/37-core-stacks.js), which the kit lays out (46: GUILIN.lay) and 47 builds the land from.
//
// WHAT (NOTES.md): the South China Karst (UNESCO, 2007) in one page: Guilin's TOWER KARST on the Li River (fenglin, lone
// towers standing out of a flat plain of paddies, and fengcong, peaks rising out of one shared rock base) and the STONE
// FOREST of Shilin (Yunnan): grey limestone blades and pinnacles packed so close a path between them is a corridor. The two
// are 800 km apart on Earth; here they share a plain. Humid subtropical (Cfa): ~1,900 mm of rain, ~19 degC, 1 atm, mist
// on the river most mornings. Not yet placed on the scale model (biomes/WORLD.md).
//
// THE MAP (x east, z south, y up from the plain; R 1600).
//   THE LI RIVER     a broad slow river meandering north to south through the middle, ~110 m across, its banks sand and
//                    pebble bars under bamboo; a tower stands with its foot at the water here and there
//   THE FENGLIN      lone towers 90-230 m tall and 70-200 m across, each a steep grey cliff under a dome of scrub forest,
//                    scattered over the plain
//   THE FENGCONG     in the north-east a low rock base 700 m long carries a crowd of peaks whose feet run together
//   THE STONE FOREST in the south-west the plain rises a little onto a karst bench and the rock comes up through the soil
//                    as hundreds of blades and pinnacles, 7-40 m tall; a pond in its middle (Sword Peak Pond's kind)
//   THE PLAIN        paddies along the river, groves of camphor, osmanthus and pomelo, banyans by the water
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
// THE LIGHT: a soft subtropical day; the haze is the river's mist, blue-grey and thick enough that each row of towers
// stands paler than the one before it (the ink-painting look the place is known for)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb2bec2);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00038);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
const hemi=new THREE.HemisphereLight(0xc8d4dc,0x3a4634,.7);scene.add(hemi);
const SUN_POS=[-1100,1000,-500];
const sun=new THREE.DirectionalLight(0xfff2dc,1.3);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xbcc8cc,.32);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the plain, the river, the stone forest's bench
const TERR={R:1600};
// THE LI RIVER: north to south through the middle; w its half-width; its surface falls gently downstream
const RIVER={x:z=>170+290*Math.sin(z*.0014+.5)+70*Math.sin(z*.0043+2.1),w:55,level:z=>-2.4-.0006*z,
 name:'The Li River (broad and slow, between the towers)'};
const riverD=(x,z)=>Math.abs(x-RIVER.x(z));
// THE STONE FOREST: its bench a few metres over the plain, the rock up through it; the pond in its middle
const SF={c:[-780,640],rad:330,name:'The stone forest'};
const POND={x:-735,z:585,rx:46,rz:27,ry:.5,name:'The pond in the stone forest'};
const pondE=(x,z)=>{const c=Math.cos(POND.ry),s=Math.sin(POND.ry),dx=x-POND.x,dz=z-POND.z,u=(dx*c+dz*s)/POND.rx,v=(-dx*s+dz*c)/POND.rz;return Math.sqrt(u*u+v*v);};
const sfD=(x,z)=>Math.hypot(x-SF.c[0],z-SF.c[1]);
// the plain: long low swells, almost flat; the bench of the stone forest; the river's banks cut down to its bed
function plainH(x,z){return 3*(fbm(x*.0011+3.1,z*.0011-1.7,17,3)-.5)*2+1.1*(fbm(x*.005-2,z*.005+5,29,2)-.5)*2-.0006*z
 +7*smooth(SF.rad+170,SF.rad*.45,sfD(x,z));}
function floorH(x,z){const b=plainH(x,z),d=riverD(x,z),cut=smooth(RIVER.w+34,RIVER.w-4,d);let h=b;
 if(cut>0){const L=RIVER.level(z),bed=L-.5-3.6*smooth(RIVER.w*.95,RIVER.w*.1,d);h=b+(bed-b)*cut;}
 const pe=pondE(x,z);if(pe<1.3){const L=plainH(POND.x,POND.z)-.7;h=h+(Math.min(h,L-.4-2.2*smooth(1,.3,pe))-h)*smooth(1.3,.95,pe);}
 return h;}
POND.level=plainH(POND.x,POND.z)-.7;

// ---------------------------------------------------------------- the rock (KSTACKS records: core/terrain/37-core-stacks.js)
// A body's foot is set under the lowest floor round it, so its wall always meets the ground.
// A TOWER is a KSTACKS spire (one column, its beds' taper running on into each other: partings, not ledges) whose beds
// are then given the karst tower's profile: a cliff standing almost sheer for 45-62% of its height, then a dome closing
// in to a small cap (a superellipse, so one is a sugarloaf and the next a beehive), its upper beds drifting off the axis
// (one face steeper than the other). The record stays a plain KSTACKS record: KSTACKS.mesh draws it and GUILIN.lay (46)
// reads its walls' slope (a dome's beds slope enough to hold a forest; the cliff's do not). tower:true marks it.
const ROCK=(function(){const K=KSTACKS,L=[];
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<32;i++){const a=i/32*TAU;for(const k of [.4,.8,1.15])m=Math.min(m,floorH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-3;};
 const add=(B,name)=>{B.name=name;L.push(B);return B;};
 function tower(id,seed,x,z,H,R,name,y0){const s=KRAND.stream(KRAND.hash(seed,0x70E)),e=s.range(1.0,1.3);
  const B=K.make({id,kind:'spire',x,z,y0:y0==null?footY(x,z,R*Math.sqrt(e)):y0,seed,H,r:R,e,ry:s.range(0,TAU),lean:s.range(0,.045),taper:0,crown:1});
  const tw=s.range(.45,.62),pw=s.range(.84,.94),kx=s.range(1.7,2.7),phi=s.range(0,TAU),drift=s.range(.04,.16)*R;
  const prof=t=>t<=tw?1-(1-pw)*t/tw:pw*Math.pow(Math.max(0,1-.95*Math.pow((t-tw)/(1-tw),kx)),1/kx);
  const sh=t=>t<=tw?0:drift*Math.pow((t-tw)/(1-tw),1.5);   // the dome's drift off the axis
  B.beds.forEach(b=>{const t0=(b.y-B.y0)/H,t1=(b.y+b.h-B.y0)/H,f0=prof(t0),f1=prof(t1);b.rx*=f0;b.rz*=f0;b.tp=f1/Math.max(.01,f0);b.lob=.2;
   b.cx+=Math.cos(phi)*sh(t0);b.cz+=Math.sin(phi)*sh(t0);b.tx+=Math.cos(phi)*(sh(t1)-sh(t0));b.tz+=Math.sin(phi)*(sh(t1)-sh(t0));});
  let RR=0;B.beds.forEach(b=>{RR=Math.max(RR,Math.max(b.rx,b.rz)*(1+2.5*b.lob)+Math.hypot(b.cx-x,b.cz-z));});B.R=RR+2;B.tower=true;
  return add(B,name);}
 const big=[];
 // THE FENGCONG: one low base in the north-east, its peaks crowded on it
 const FC={x:930,z:-940},base=add(K.make({id:'fcbase',kind:'butte',x:FC.x,z:FC.z,y0:footY(FC.x,FC.z,380),seed:2101,
  tiers:[{h:46,r:330,e:1.45,ry:.6}],bed:[10,20],lobes:.3,weather:.5}),'The fengcong\'s base (one rock under a crowd of peaks)');big.push(base);
 const onBase=(x,z,r)=>{const a=K.at([base],x,z);if(!a||a.d>-(r*.55+12))return false;for(let k=0;k<12;k++){const q=k/12*TAU,b2=K.at([base],x+Math.cos(q)*r*.6,z+Math.sin(q)*r*.6);if(!b2)return false;}return true;};
 {const s=KRAND.stream(KRAND.hash(2102,1)),pk=[];
  for(let t=0;t<400&&pk.length<9;t++){const a=s.range(0,TAU),d=330*1.2*Math.sqrt(s.next()),x=FC.x+Math.cos(a)*d,z=FC.z+Math.sin(a)*d,R=s.range(42,80),H=s.range(95,175);
   if(!onBase(x,z,R))continue;if(pk.some(p=>Math.hypot(p.x-x,p.z-z)<p.R+R-8))continue;pk.push({x,z,R,H});}
  pk.forEach((p,i)=>big.push(tower('fcpeak'+i,2110+i,p.x,p.z,p.H,p.R,'A peak of the fengcong',base.top-2)));}
 // THE FENGLIN: lone towers over the plain, off the river's water (a few with their feet at its edge), off the stone forest
 // and the fengcong; two set by hand where the river bends under them
 big.push(tower('bendN',2201,RIVER.x(-560)+RIVER.w+72,-560,205,70,'A karst tower at the river\'s edge'));
 big.push(tower('bendS',2202,RIVER.x(420)-RIVER.w-66,420,170,62,'A karst tower at the river\'s edge'));
 {const s=KRAND.stream(KRAND.hash(2203,1));let n=0;
  for(let t=0;t<900&&n<24;t++){const x=s.range(-1.5,1.5)*TERR.R,z=s.range(-1.5,1.5)*TERR.R,R=s.range(38,96),H=R*s.range(1.7,2.6)+s.range(0,40);
   if(Math.hypot(x,z)>TERR.R*.93-R)continue;if(riverD(x,z)<RIVER.w+R*1.08+6)continue;if(sfD(x,z)<SF.rad+R+90)continue;
   if(Math.hypot(x-FC.x,z-FC.z)<420+R)continue;if(big.some(B=>Math.hypot(B.x-x,B.z-z)<B.R*.85+R+s.range(35,140)))continue;
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
