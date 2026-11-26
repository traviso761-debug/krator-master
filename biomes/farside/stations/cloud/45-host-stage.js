// ================================================================= HOST — stage (Farside, station 4: THE FOG BELT)
// The same host as station 1's with another landform and another STAGE: 44z (the shell) and 47 (the land) are shared.
//
// WHERE (PLAN.md sections 4 and 6): Yith's ridge (scale model px 74,88, 1,615 m, 2,900 mm), 25 to 50 km in, ~1,800 to 3,000 m,
// in the fog that almost never lifts. The native wet forest (biomes/nwlowlands, read in place) holds it, its trunks crusted
// with FOG SPONGES and the first WINE WEED hung in its crowns: the sea's outriders. Yith itself is a settlement build (the
// owner: works only): its walled terraces, a goat fold and a drying rack of wine weed stand on the ridge.
//
// THE MAP (x east, z south, y up from the page's low corner; R 1600; u across the ridge, v along it):
//   THE RIDGE        along v through the middle, its crest ~300 m over the valley, Yith's works on it
//   THE SLOPES       falling both ways under the native forest, gullies down them
//   THE VALLEY       to the west (u ~ -1000): a stream along it, falling toward -v
const SQ=Math.SQRT1_2;
const UV=(x,z)=>[(x+z)*SQ,(z-x)*SQ],XZ=(u,v)=>[(u-v)*SQ,(u+v)*SQ];
const crestU=v=>60*Math.sin(v*.0021+.3)+25*Math.sin(v*.0063);
const valleyU=v=>-1020+70*Math.sin(v*.0024+1.2)+30*Math.sin(v*.007);
function groundH(x,z){const p=UV(x,z),u=p[0],v=p[1],a=Math.abs(u-crestU(v)),n=fbm(x*.0018+4,z*.0018-2,461,3)-.5,n2=fbm(x*.007-1,z*.007+3,462,2)-.5;
 let h=330-260*Math.pow(smooth(0,1250,a),.85)+.05*v+70*n+12*n2;
 const gully=Math.abs(fbm(x*.0024+9,z*.0024-6,463,2)-.5);h-=18*smooth(.05,0,gully)*smooth(120,500,a);
 const sd=Math.abs(u-valleyU(v));h-=22*smooth(90,6,sd);return h;}
const STAGE={
 key:'cloud',name:'Farside: the fog belt (Yith\'s ridge)',R:1600,seed:2659,
 site:{px:74,py:88},air:{pressure:1.0,humidity:.98},clouds:{cover:.85},fogDensity:.0011,weather:'fog',   /* 5.1 px 346,418: 1,611 m (the plan's 1,615) */
 /* THE FOG BELT (core/atmos: ATMOS.fogBelt; BACKPORT.md's row): the belt over the page's ridge (the page's heights run ~70-330 m; the real belt
    is ~1.8-3 km): the north-wester's windward face west, a broken top the crest pierces, thinner in the lee */
 belt:{y0:110,y1:520,windward:[-Math.SQRT1_2,-Math.SQRT1_2],density:.0012,depth:70,lee:.35,rise:.5},
 ground:groundH,coastD:null,UV,XZ,sea:null,
 fields:{
  spray:(x,z)=>.04,invade:(x,z)=>0,front:(x,z)=>0,native:(x,z)=>1,
  sand:(x,z)=>0,coral:(x,z)=>0,
  rock:(x,z)=>{const p=UV(x,z),a=Math.abs(p[0]-crestU(p[1]));return smooth(.66,.74,fbm(x*.011+3,z*.011-5,464,3))*(.5+.5*smooth(200,0,a));},
  strand:(x,z)=>0,
  graze:(x,z)=>{const p=UV(x,z),a=Math.abs(p[0]-crestU(p[1]));return smooth(110,40,a)*smooth(.45,.55,fbm(x*.005,z*.005,465,2));},
  burn:(x,z)=>0,fog:(x,z)=>1,
  outrider:(x,z)=>.15+.35*smooth(.5,.62,fbm(x*.003+2,z*.003-8,466,2)),
  upland:(x,z)=>clamp(groundH(x,z)/340,0,1)},
 natives:{q:1.4,tropic:.58},
 stream:{pts:(function(){const P=[];for(let v=1650;v>=-1650;v-=20)P.push(XZ(valleyU(v),v));return P;})(),w:3.5,depth:.6,speed:1.8,name:'The valley stream under Yith'},
 farLift:(x,z)=>{const p=UV(x,z);return 1600*smooth(2500,9000,p[0])*(.7+.5*fbm(x*.0005,z*.0005,467,3))+400*(fbm(x*.0012,z*.0012,468,2)-.4);},
 works:[['terraces',40,-420,0],['terraces',60,380,.1],['fold',-60,40,0],['rack',30,-160,0],['wrackcart',20,-120,1.4]],
 spine:[[0,-500],[0,0],[0,500],[-600,0],[-1000,-200]],
 viewList:[['Yith\'s ridge in the fog',-260,-700,30,0,-200,10],['Under the native forest (sponges on the trunks)',-450,150,3,-380,200,6],
  ['The first wine weed (the outriders)',-300,-250,10,-260,-200,26],['Down to the valley stream',-700,0,40,-1000,100,0],
  ['The ridge from the valley',-1000,300,8,0,300,30],['The fog belt from above',-1500,0,260,200,0,0]]};
