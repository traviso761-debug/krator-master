// ================================================================= HOST — the ground model: THE NORTH SHIELD OVER THE VAULT (station 9)
// The shield at 12.1 km (map 5.1's relief, REGION, with the flank's detail): thin black flows falling north at ~0.08, the old fountains' black
// bead sand in the hollows, frost in the shade; over the tube a faint sinuous swell (a tube's roof stands a little proud of the flows it fed).
// The vault and the tubes under it are KCAVERN's (87-host-tube.js); this is the ground over them.
const TB={y0:12149,depth:58,dir:[.22,-.976],conduit:[.79,-.61]};
const LOCAL=(x,z)=>TB.y0+(REGION?(REGION.h(x+260,z)+REGION.h(x-260,z)+REGION.h(x,z+260)+REGION.h(x,z-260))*.25:.08*z);
function shieldH(x,z){const lobes=4*(1-Math.abs(fb(x*.0019+fb(z*.0005,x*.0005,2,WORLD+110)*2,z*.0005,2,WORLD+111)*2-1));
 return LOCAL(x,z)+16*(fb(x*.0005,z*.0005,2,WORLD+112)-.5)+lobes+1.1*(vn(x*.03,z*.03,WORLD+113)-.5);}
// the tube's line on the surface (north-south through the vault: tube_god_n_12's px run), its swell 2.5 m over 30 m
const tubeX=z=>40*Math.sin(z*.0011+.4);
function preH(x,z){const d=Math.abs(x-tubeX(z));return shieldH(x,z)+2.5*smooth(34,6,d);}
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,9,0x57A7),formations:[{recipe:'tibasalt'}],range:[11400,12900],dip:[TB.dir[0],TB.dir[1],.004],warp:[5,1.4],wash:{m:2},regolith:.35,dust:0x2a2624});
function baseH(x,z){const g=preH(x,z);return REGION?REGION.blend(g,x,z,5400,9500,TB.y0):g;}
const VENT={x:1e6,z:1e6,r:0,h:0,throat:0,crater:0,cd:0,base:0,top:0,lavaY:0,name:'(no vent on this station)'};
const MODEL={fieldsAt(x,z,sl,hollow,o){o.face=sl>.8?smooth(.8,1.1,sl):0;o.talus=0;o.rampart=0;o.vent=0;o.glass=0;o.orange=0;
  o.halo=clamp((.15+.85*hollow)*smooth(.9,.4,sl)*.8,0,1);return o;},
 after(){}};
var PORTAL=null;
