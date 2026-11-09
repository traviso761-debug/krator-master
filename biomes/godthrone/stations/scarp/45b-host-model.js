// ================================================================= HOST — the ground model: THE BASAL ESCARPMENT (station 4)
// PLAN.md section 4 ("The basal escarpments": cliffs and steep slopes kilometres high cutting the stack of flows, each one a ledge,
// the bead horizons as orange stripes between; thick flows stand in colonnades, refs/01) on map 5.1's site (px 752,1213: 7,066 m,
// the raster falling south-west at ~0.1). Its own frame (x east, z south, origin at the site):
//   THE UPPER SLOPE  the shield's foot above the scarp, falling gently south-west (~0.035), old flows' lobes, snow in its hollows
//   THE SCARP        KRELIEF.scarp across the map: 600 m in a 520 m run, three benches, ravines cut back into it, buttresses
//                    standing out between them, talus at its foot; every face on the ledge pass (each flow a ledge: KSTRATA)
//   THE LOWER SLOPE  the talus aprons and the ground below, falling on to the bay (~0.035)
// The rock: the shield's thin flows (`tibasalt`) over thick ponded flows that cooled slowly into colonnades (`tibasalt-ponded`,
// fx.columns) in the scarp's lower half; every bead bed under the dry-cold line is palagonite (the recipes' alteration).
const DOWN=[-.83,-.557],ACROSS=[.557,-.83],SC={y0:7066,slope:.035,d:-260,h:600,run:520};
const dOf=(x,z)=>x*DOWN[0]+z*DOWN[1],aOf=(x,z)=>x*ACROSS[0]+z*ACROSS[1],xzDA=(d,a)=>[d*DOWN[0]+a*ACROSS[0],d*DOWN[1]+a*ACROSS[1]];
// the slopes either side (the scarp's drop is KRELIEF's): the site's height at the scarp's middle
function slopeH(x,z){const d=dOf(x,z),a=aOf(x,z);
 const lobes=4*(1-Math.abs(fb(a*.0017+fb(d*.0005,a*.0005,2,WORLD+70)*2,d*.0005,2,WORLD+71)*2-1));
 return SC.y0+SC.h*.5-SC.slope*d+30*(fb(x*.00035,z*.00035,2,WORLD+72)-.5)+lobes+1.2*(vn(x*.03,z*.03,WORLD+73)-.5);}
const SCARP=KRELIEF.scarp({pts:[-6200,-4000,-1800,0,1900,4100,6200].map((a,i)=>xzDA(SC.d+60*Math.sin(i*1.3+.4)+25*Math.cos(i*2.9),a)),side:1,h:SC.h,run:SC.run,power:1.1,drop:true,
 benches:{n:3,w:22},ravines:{n:6,w:[60,110],head:[120,320],depth:[60,170],fan:{r:220,h:22}},buttresses:{sp:520,w:.3,amp:60},
 talus:{h:42,reach:190},rim:{lip:3,w:30},rough:.02,warp:{amp:40,scale:1/900},ends:1500,seed:KR.hash(WORLD,41,0,0x5CA4)});
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,4,0x57A7),formations:[{recipe:'tibasalt-ponded',top:6950},{recipe:'tibasalt'}],range:[6100,8000],
 dip:[DOWN[0],DOWN[1],.012],warp:[4,1.2],wash:{m:2},regolith:.4,dust:0x3a332c});
const _ground=KRELIEF.apply(slopeH,[SCARP]);
/* past the map the scale model's own relief (station.json "region", src/45a5-host-region.js): the far country is 5.1's */
function baseH(x,z){const g=_ground(x,z);return REGION?REGION.blend(g,x,z,5400,9500,SC.y0):g;}
const VENT={x:1e6,z:1e6,r:0,h:0,throat:0,crater:0,cd:0,base:0,top:0,lavaY:0,name:'(no vent on this station)'};
const MODEL={fieldsAt(x,z,sl,hollow,o){const c=KRELIEF.at(SCARP,x,z,slopeH(x,z)),y=terrainH(x,z);
  const part=c?c.part:null;o.face=part==='face'||part==='ravine'||part==='buttress'?smooth(.45,.8,sl):0;
  o.talus=part==='talus'||part==='fan'?1:part==='bench'?.4:0;o.rampart=0;o.vent=0;o.glass=0;o.orange=0;
  /* the drifts: palagonite sand and the bead glass's ochre wash in the hollows (all of this is under the line) */
  o.halo=0;o.palag=clamp((.25+.75*hollow)*smooth(.9,.35,sl)*.85,0,1);
  /* snow: on the benches and in the hollows above ~6.8 km (HT, ~675 mm: it lies), more on the shaded faces' ledges */
  const north=clamp(-(terrainH(x,z+12)-terrainH(x,z-12))/24/.5,-1,1);
  o.snow=clamp((part==='bench'?.8:.35*hollow)*smooth(6700,7200,y)*smooth(.9,.4,sl)*(.6+.4*smooth(-.2,.4,-north))*(.5+.5*vn(x*.012,z*.012,WORLD+74)),0,1);
  o.crust=clamp(smooth(.7,.3,sl)*(1-o.snow)*smooth(.4,.7,vn(x*.02,z*.02,WORLD+75))*(part==='talus'?1:.6),0,1)*.7;
  return o;},
 farColor(x,z,h,sl,c,K){const pal=K.L([150,108,58]);return K.mixC(c,pal,.35*smooth(.6,.2,sl));},
 after(){}};
var PORTAL=null;
