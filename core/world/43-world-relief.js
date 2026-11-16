// ================================================================= OPEN WORLD — relief: the land below the model's 2 km
// [G data] Plain maths of (x, z): no THREE, no DOM, no Math.random, no Math.sin, cos or exp (only + - * / floor sqrt); the
// draws from core/rand (KRAND), so a Godot port gives the same land. core/world/PLAN-RELIEF.md is the plan; this is its P1:
//   S1 styles   every overlay of the model gets a land style of its own (41's BIOME_STYLE named a few; the rest fell back
//               to 'desert', whose terraces were the strongest): WRELIEF.styleOf(name)
//   S2 benches  terraces only where a caprock lies, on beds that dip and warp, of irregular thickness, only the hard ones
//               standing out as benches: WRELIEF.bench. It replaces 41's terraces on the absolute height (h / step), which
//               ringed every hill like a contour map
// A region opts in (openworld/SITES.json "relief": 1; region.json `relief`); 41 calls WRELIEF only then, so a region
// without it keeps its land exactly.
//
//   WRELIEF.styleOf(name)          the style key (41's STYLES) for an overlay's name, or null for one this table does not
//                                  know (41 keeps its own BIOME_STYLE first)
//   WRELIEF.init({ox, oz, seed})   the region's frame (metres of its origin from the model's: noise and dips are read at the
//                                  world-absolute point, so two cuts of one place agree) and the world's seed
//   WRELIEF.bench(h, x, z, S, rel, minWave)  the ground h with its caprock benches; S the style blend (terr, step), rel the
//                                  model's local relief (m). Returns h unchanged where no caprock lies
//   WRELIEF.caprock(x, z, S, rel)  0..1: how much caprock lies here (the bench's weight)
var WRELIEF=(function(){'use strict';
const R={version:1};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};

// ---------------------------------------------------------------- S1: every overlay's style
// Keyed by the model's overlay names (lower case), as tools/scale-model/extract_region.py groups them into its families;
// the styles are 41's (STYLES). Only the land's SHAPE takes this style: its colours stay 41's (BIOME_STYLE or 'desert'),
// so turning relief on moves no colour (a palette per new style is the owner's call, PLAN-RELIEF.md)
const FAMILY={
 karst:['k-guilin','nw bay'],
 scabland:['n semiarid','ria valley','floodzone','scablands'],
 maar:['siphon pits','region 99'],
 ringfold:['sw highlands'],
 badland:['e badlands','painted highlands','yuni valley'],
 tableland:['sedesert','w outer wall','tiers','the cut','crater drylands','crater drylands n','crater drylands s'],
 savanna:['e savannah rim','se savannah rim','ne rim'],
 yardang:['the bowl','the catch','e abysss','e abyss'],
 volcanic:['throne/volcano','godthrone','godstep valley','steaming seamounts','godshearth','twins','firebliss','geyser'],
 alpine:['n highlands','s highlands','e inner wall','e highlands','nw outer wall','ne outer wall','se outer wall','copper glacier',
  'tharn uplands','rift rim n','rift rim s','w rift highland','stalker range','stalker gate','mid basin','n outlands','s outlands',
  'outlands','outland gate','high rift','xanadu','opal valley','rift','loom chasms','labyrinth','great chasm'],
 tepui:['korona / ne','arachnoid canyons'],
 humid:['hyperjungle','hyperjungle n','hyperjungle s','savage hyperjungle','sw lowlands','nw lowlands','double delta','farside',
  'arch','crook','sw bay','spider lake','green step','nw boreal'],
 vale:['oidong valley'],
 sea:['ring sea','deeps']};
// a family's style in 41's STYLES. Tableland keeps 'desert' (it is the caprock country: its benches are real); alpine is
// 'highland' (S4's peaks come later); karst and loess get styles of their own with their submodules (S8, S5)
const FAMILY_STYLE={karst:'highland',scabland:'dryland',maar:'volcanic',ringfold:'highland',badland:'badland',tableland:'desert',
 savanna:'savanna',yardang:'abyss',volcanic:'volcanic',alpine:'highland',tepui:'korona',humid:'jungle',vale:'vale',sea:'sea'};
const STYLE_OF={};for(const f in FAMILY)for(const n of FAMILY[f])STYLE_OF[n]=FAMILY_STYLE[f];
R.FAMILY=FAMILY;R.STYLE_OF=STYLE_OF;
R.styleOf=name=>{const s=STYLE_OF[String(name||'').toLowerCase()];return s===undefined?null:s;};

// ---------------------------------------------------------------- the frame and the noise
let OX=0,OZ=0,SEED=0x52454C;
R.init=function(o){o=o||{};OX=o.ox||0;OZ=o.oz||0;SEED=(o.seed==null?0x52454C:o.seed)>>>0;return R;};
const vn=(x,z,s)=>KRAND.vnoise(x,z,.5,s);
function fbm(x,z,o,s){let a=0,f=1,w=0,t=1;for(let i=0;i<o;i++){a+=vn(x*f,z*f,s+i)*t;w+=t;t*=.5;f*=2.03;}return a/w;}

// ---------------------------------------------------------------- S2: caprock benches
// Where a caprock lies: the style's terrace share (S.terr), where the relief allows mesas (41's band: 40 m to 4.2 km over a
// cell's neighbourhood), and in patches (formations a few tens of km across: about a third of the ground)
R.caprock=function(x,z,S,rel){if(!(S.terr>.01))return 0;
 const band=smooth(40,250,rel)*smooth(4200,1800,rel);if(band<=0)return 0;
 return S.terr*band*smooth(.53,.6,fbm((x+OX)/16000,(z+OZ)/16000,3,SEED^0x4341));};   /* the fbm's 65th to 85th percentile */
// The beds: stratigraphic height hs = h + a structure surface + a warp, so a bed's outcrop crosses the contours instead of
// tracing them. The structure is smooth noise ~400 m in amplitude over ~30 km: dips of 0.5..2 %, as real caprock dips, that turn with it (never a
// plane times the absolute coordinates, whose turning would crowd the beds). A bed's base sits at step*(k + jitter(k)): irregular thicknesses, no rhythm.
// A hard bed (about 4 in 10, KRAND by its index) is a bench: flat tread, then a riser in its top fifth. A soft one is left
// as the slope it was. hs moves by the tread's offset, so the ground is continuous at every bed's edge.
const HARD=.4,RISER=.2,JIT=.35;
function bedBase(k,s){return k+JIT*(KRAND.unit(KRAND.hash(s,k|0,0x42))-.5);}
R.bench=function(h,x,z,S,rel,minWave){
 if(minWave!=null&&minWave>=600)return h;
 const cw=R.caprock(x,z,S,rel);if(cw<.01)return h;
 const ax=x+OX,az=z+OZ;
 const step=S.step*(.75+.5*vn(ax/9000,az/9000,SEED^0x5354));
 /* the structure: a smooth surface ~400 m in amplitude over ~30 km (dips of 0.5-2 %), plus a warp of half a bed over ~6 km */
 const hs=h+400*(fbm(ax/30000,az/30000,2,SEED^0x4458)-.5)+(fbm(ax/6000,az/6000,2,SEED^0x5741)-.5)*.6*step;
 const t=hs/step,s=SEED^0x4245;let k=Math.floor(t);
 if(t<bedBase(k,s))k--;else if(t>=bedBase(k+1,s))k++;
 const b0=bedBase(k,s),b1=bedBase(k+1,s);
 if(!(KRAND.unit(KRAND.hash(s,k|0,0x48))<HARD))return h;
 const f=(t-b0)/(b1-b0),g=f<1-RISER?0:smooth(1-RISER,1,f),off=(b0+g*(b1-b0)-t)*step;
 return h+cw*off;};
return R;})();
if(typeof module!=='undefined')module.exports=WRELIEF;
