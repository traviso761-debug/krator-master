// ================================================================= HOST — stage (Farside, station 2: THE FRONT)
// The same host as station 1's with another landform and another STAGE: 44z (the shell) and 47 (the land) are shared.
//
// WHERE (PLAN.md sections 4 and 6): 10 to 25 km in from the sea, ~800 to 1,800 m (scale model px ~45,200, between Farport and
// Yith), where the spray fades and the sea's flora stops. The front has stood still for a generation (the owner, 2026-10-23:
// a steady state under aggressive measures): the goats crop it, it is burned back in the dry weeks, the kelp is cut.
// This page is the front compressed into 3 km: the kelp coast's last stands in the west, the dead belt across the middle,
// the native forest (biomes/nwlowlands, read in place) holding the east.
//
// THE MAP (x east, z south, y up from the page's low corner; R 1600; u runs inland, east-south-east, up the slope):
//   THE KELP         u < ~ -500: the last land kelp stands, thinning, goat-cropped clearings among them
//   THE DEAD BELT    u ~ -600 .. +600: the land forest's trees dead or dying (drowned kauri and meranti, silvered), hung with
//                    wine weed and wrack; kelp seedlings coming up under them; burned strips; the goats' fold
//   THE NATIVE FOREST u > ~ +300: sky meranti, column kauri, mist palms, tree ferns (nwlowlands), the first wine weed on them
//   THE STREAM       down the slope from the east, through the dead belt, toward the sea far to the west
const SQ=Math.SQRT1_2;
const UV=(x,z)=>[(x+z)*SQ,(z-x)*SQ],XZ=(u,v)=>[(u-v)*SQ,(u+v)*SQ];
const vS=u=>180*Math.sin(u*.0019+.4)+60*Math.sin(u*.0057+1.1)-150;
const streamV=(x,z)=>{const p=UV(x,z);return Math.abs(p[1]-vS(p[0]));};
function groundH(x,z){const p=UV(x,z),u=p[0],n=fbm(x*.0016+4,z*.0016-2,441,3)-.5,n2=fbm(x*.006-1,z*.006+3,442,2)-.5;
 let h=120+.085*u+90*n+14*n2;const sd=streamV(x,z);h-=16*smooth(70,6,sd)+6*smooth(160,40,sd);return h;}
const frontK=(x,z)=>{const u=UV(x,z)[0];return Math.exp(-Math.pow((u+40*(fbm(x*.002,z*.002,443,2)-.5)*8)/520,2));};
const STAGE={
 key:'front',name:'Farside: the front',R:1600,seed:2647,
 site:{px:45,py:200},   /* 5.1 px 317,530: 2,179 m on map 5.1 (Round 2 restored it; the plan's band is ~800-1,800 m: KNOWN_ISSUES.md) */
air:{pressure:1.15,humidity:.9},clouds:{cover:.6},fogDensity:.00024,weather:'clear',
 ground:groundH,coastD:null,UV,XZ,sea:null,
 fields:{
  spray:(x,z)=>clamp(.32-UV(x,z)[0]*.00012,.05,.5),
  invade:(x,z)=>smooth(300,-700,UV(x,z)[0]+60*(fbm(x*.003,z*.003,444,2)-.5)*6),
  front:frontK,
  native:(x,z)=>smooth(-250,450,UV(x,z)[0]+60*(fbm(x*.003+7,z*.003,445,2)-.5)*6),
  sand:(x,z)=>0,coral:(x,z)=>0,
  rock:(x,z)=>smooth(.7,.78,fbm(x*.01+3,z*.01-5,446,3))*.8,
  strand:(x,z)=>0,
  graze:(x,z)=>smooth(.55,.65,fbm(x*.004+11,z*.004-4,447,2))*smooth(500,-200,UV(x,z)[0]),
  burn:(x,z)=>smooth(.6,.66,fbm(x*.0035-6,z*.0035+2,448,2))*frontK(x,z),
  fog:(x,z)=>clamp(.25+.5*smooth(-1200,1400,UV(x,z)[0]),0,1),
  outrider:(x,z)=>smooth(1100,200,UV(x,z)[0])*smooth(-300,300,UV(x,z)[0]),
  upland:(x,z)=>clamp((groundH(x,z)-0)/320,0,1)},
 natives:{q:1.1,tropic:.76},
 stream:{pts:(function(){const P=[];for(let u=1650;u>=-1650;u-=20)P.push(XZ(u,vS(u)));return P;})(),w:4,depth:.7,speed:1.6,name:'The stream through the front'},
 farLift:(x,z)=>{const p=UV(x,z);return 1100*smooth(1800,9000,p[0])*(.7+.5*fbm(x*.0005,z*.0005,449,3))-200*smooth(-2000,-8000,p[0])+250*(fbm(x*.0012,z*.0012,450,2)-.4);},
 works:[['fold',-700,450,0],['wrackcart',-600,250,.3],['terraces',-900,-500,.1],['rack',-650,280,.4]],
 spine:[[-700,0],[-250,300],[0,-250],[300,200],[700,-100]],
 viewList:[['Across the dead belt',-450,-150,12,250,0,20],['The front from the kelp side',-900,200,20,0,100,25],
  ['Into the native forest',250,-400,6,600,-300,20],['The stream through the front',-100,vS(-100)+40,10,200,vS(200),2],
  ['The burned strips',-150,450,40,150,350,0],['The front from above',-1300,0,220,600,0,0]]};
