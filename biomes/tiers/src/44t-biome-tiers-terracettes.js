// ================================================================= THE TIERS — terracettes: the little soil steps on grazed slopes  [G data]
// PLAN.md section 10, amendment 3: "the level soil steps that line grazed slopes, as a KRELIEF.shape form beside pavement, with a lip line the
// tiergrass reads. Kit work first." So it is shaped as KRELIEF.pavement is (a builder over the finished ground returning functions), with a
// KRELIEF kind's three answers, ready to lift into core/terrain as a kind:
//   TIERS_TERRACETTES({h (the finished ground), zone (x, z) -> 0..1 (where the herds graze: the host's or the kit's), step (.42 m: a riser's
//     height), slope [lo, hi] (.22, .95: they form on slopes of ~12-45 degrees, none on the flats or the cliffs), rise (.28: the riser's share of
//     a step's run), wander {amp (.22 m), scale (1/38)} (the rows wander off the contour a little), breaks (.35: the share of a row broken),
//     seed})
//   -> {kind: 'terracettes', record (JSON-safe: what a port or the core lift needs), k(x, z) (0..1: how strongly they form here), at(x, z, g)
//      ({part: 'tread' | 'riser' | 'lip', u (0..1 up the step), k} or null), lip(x, z, g) (0..1: the lip line, the step's outer edge, where the
//      tiergrass stands), shape(x, z, g) (the stepped ground: g with the treads cut level and the risers between, cut and fill balanced, eased in
//      by k)}
// A step is a band of the ground's height: u = (g + wander) / step, its fraction. The tread runs level over 1 - rise of it, the riser climbs the
// rest; the lip is the top of the riser (the tread's outer edge), where the trampled soil holds a row of grass. The page's ground mesh (~7 m) is
// far coarser than a step (.42 m over ~.7-1.9 m of run), so the ground keeps its own surface and the floor DRAWS the terracettes as soil lips on
// the rows (60: 'tlip'), the tiergrass on them; shape() is for a fine ground (a near-field heightfield, a port) and for the test.
var TIERS_TERRACETTES=function(o){
 if(!o||!o.h)throw new Error('TIERS_TERRACETTES: h(x, z) is needed');
 const h=o.h,step=o.step==null?.42:o.step,s0=o.slope?o.slope[0]:.22,s1=o.slope?o.slope[1]:.95,rise=o.rise==null?.28:o.rise,
  amp=o.wander&&o.wander.amp!=null?o.wander.amp:.22,sc=o.wander&&o.wander.scale!=null?o.wander.scale:1/38,brk=o.breaks==null?.35:o.breaks,seed=(o.seed==null?64301:o.seed)>>>0;
 const sm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
 const slopeAt=(x,z)=>{const e=2,gx=(h(x+e,z)-h(x-e,z))/(2*e),gz=(h(x,z+e)-h(x,z-e))/(2*e);return Math.hypot(gx,gz);};
 /* how strongly they form: the grazed zone, the slope's band (they fade on the flats and break up toward the cliffs), the rows broken in patches */
 function k(x,z){const zn=o.zone?o.zone(x,z):1;if(!(zn>0))return 0;const s=slopeAt(x,z),band=sm(s0*.8,s0*1.4,s)*(1-sm(s1*.8,s1,s));if(!(band>0))return 0;
  return zn*band*sm(brk-.1,brk+.1,KRAND.fbm(x*.05,0,z*.05,2,seed+7));}
 const wand=(x,z)=>amp*(KRAND.fbm(x*sc,0,z*sc,2,seed)-.5)*2;
 function uAt(x,z,g){const f=(g+wand(x,z))/step;return f-Math.floor(f);}
 function at(x,z,g){const kk=k(x,z);if(!(kk>0))return null;g=g==null?h(x,z):g;const u=uAt(x,z,g);
  return{part:u>1-rise*.25?'lip':u>1-rise?'riser':'tread',u,k:kk};}
 function lip(x,z,g){const kk=k(x,z);if(!(kk>0))return 0;g=g==null?h(x,z):g;const u=uAt(x,z,g);return kk*sm(1-rise*.55,1-rise*.15,u)*(1-sm(.985,1,u));}
 /* the stepped ground: in a step's band (u 0..1 of its height) the tread runs level at (1 - rise) / 2 of a step over the first 1 - rise of the
    band, the riser climbs one step over the rest: the profile's mean over the band is the ground's own (cut and fill balance) */
 const prof=u=>u<1-rise?.5*(1-rise):.5*(1-rise)+(u-(1-rise))/rise;
 function shape(x,z,g){const kk=k(x,z);if(!(kk>0))return g;const w=wand(x,z),f=(g+w)/step,i=Math.floor(f);return g+kk*((i+prof(f-i))*step-w-g);}
 return{kind:'terracettes',prof,record:{kind:'terracettes',step,slope:[s0,s1],rise,wander:{amp,scale:sc},breaks:brk,seed},k,at,lip,shape,slopeAt};};
