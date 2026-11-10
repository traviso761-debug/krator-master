// ================================================================= GREENSTEP — zones (from the host's fields) and the colour maths
// The zones are computed HERE from the climate fields, never from the host's map: a world that binds the same fields gets the same zoning.
// The fields (biomes/WORLD.md): wet, flow (near the water), slope, rock, cold (0 at +16 degC, 1 at -14), fog (the falls' spray and the
// cloud deck), farm (the paddies), site (Tallwalls' promontory: nothing grows there, the settlement build's ground). The plan's belts
// (section 3), by cold on a page that spans Terrace II to Terrace IV:
//   lower    Terraces I-II (Cfa, under ~1.85 km): the SW lowlands' broadleaves, the paddies
//   spiral   Terrace III and the rille gorges (Cfa/Cfb, ~1.85-2.25 km): tier cedar and the right-handed spiral flora planted round Tallwalls
//   cloud    Terrace IV (Cfb/Dfb, ~2.5-2.75 km): the S highlands' cloud forest in the deck
//   paramo   Terrace V and the shield's rim (Dfc/ET, over ~3 km, cold over ~.22 at the shield's lapse): the S highlands' rosettes (station 6)
//   warm     the shield's warm ground (the geo field: KTHERM's vents, station 6): fumarole moss, the rosettes thickest on the warm rims
//   bank     a river's or a basin's banks (the flow and wet fields)
//   cliff    steep bare rock (a riser's colonnade): nothing roots there; every zone above is multiplied by 1 - cliff
GSTEP.TREES=[];   /* the kin trees' records (87-host-kin.js fills it: the inspector, the views and the checks read it) */
(function(){const {clamp,smooth,pick}=BIO.fn;
function zones(x,z){const F=n=>BIO.field(n,x,z);
 const wet=F('wet'),flow=F('flow'),slope=F('slope'),rock=F('rock'),cold=F('cold'),barren=F('barren'),fog=F('fog'),farm=F('farm'),site=F('site'),geo=F('geo');
 const cliff=smooth(.72,.92,slope)*smooth(.3,.6,rock),live=(1-barren)*(1-cliff)*(1-smooth(.35,.7,site)),gentle=smooth(.6,.28,slope);
 const paramo=live*smooth(.2,.26,cold);
 return{wet,flow,slope,rock,cold,barren,fog,farm,site,geo,cliff,live,gentle,paramo,warm:live*smooth(.08,.45,geo),
  lower:live*smooth(.02,.006,cold)*(1-farm),                        /* under ~1.85 km at this lapse (+16 degC and warmer: cold 0) */
  spiral:live*smooth(.006,.02,cold)*smooth(.12,.09,cold)*(1-rock*.5),  /* ~1.85-2.4 km: Terrace III and the rilles */
  cloud:live*smooth(.1,.14,cold)*(1-rock*.35)*(1-paramo*.85),        /* over ~2.4 km: Terrace IV in the deck (giving way to the paramo over ~3 km) */
  bank:Math.max(flow,smooth(.75,.95,wet))*live,
  tree:live*(1-farm)*(1-rock*.6)};}
GSTEP.zones=zones;
// ---------------------------------------------------------------- colour (the maths is the core's, BIO.col)
const {shade,bright,vary,texMean,tint}=BIO.col;
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={rock:texMean(GSTEP.ROCKTEX)};return MEAN;}
const leafCol=(set,k,dh,ds,dl)=>bright(vary(pick(set),dh==null?.04:dh,ds==null?.1:ds,dl==null?.07:dl),k==null?1.2:k);
Object.assign(GSTEP,{means,tint,bright,shade,vary,leafCol});
// keep-clear for the floor's boulders against the kin trees (core/space, filled by 87-host-kin.js)
GSTEP.SPACE=null;
GSTEP.blocked=(x,z,pad)=>!!GSTEP.SPACE&&GSTEP.SPACE.some(x,z,(pad||0)+6,o=>Math.hypot(x-o.x,z-o.z)<o.r+(pad||0));
GSTEP.nearestTree=function(key,x,z,minH){let b=null,bd=1e9;for(const T of GSTEP.TREES){if(T.key!==key||(minH&&T.H<minH))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
GSTEP._canopyH=function(x,z){let h=0;for(const T of GSTEP.TREES){if(Math.hypot(x-T.x,z-T.z)<160)h=Math.max(h,T.y0+T.H);}return h>0?h:4;};
})();
