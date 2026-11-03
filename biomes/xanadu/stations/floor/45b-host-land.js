// ================================================================= HOST - the land: STATION 5, THE RIFT FLOOR (PLAN-STATIONS.md; the owner, 2026-11-03)
// On src/45b-host-land.js's LAND CONTRACT (TERR, terrainH, FIELD_RAW, LAND). The easternmost lake of the Rift's floor, under the cataract: scale model 5.1
// basins.json, a salt lake at 5.1 px 909,1556 (old canvas ~637,1226), -1,362 m, 176 km2, XV, with two hypertropic (XA) salt lakes just west (869,1558 at
// -1,645 m; 883,1552 at -1,150 m). 1.9 atm, ~2,260 mm, +28 degC. The page's datum is the lake: page y = model m + 1,362.
//   THE LAKE      the north-east of the page, a shallow salt lake (most of it under 6 m) with a pale crust on its flats, running on off the map
//   THE SHORE     a low beach and salt flats, then the floor
//   THE FLOOR     rolling jungle rising south-west to +140 m, cut by two shallow creek beds (dry channels the rains fill)
//   THE FRONT     where the Vale's flora carried down Alph from the north-west (tall in the dense air) meets the Rift's own: a noise-warped line across the
//                 floor north-east to south-west, the two floras crossing over ~900 m (87-host-floor.js: FLOOR.front)
// The cataract stands off the page to the south-east (bearing ~146 degrees from the lake, the step at old px 635-670, 1230-1265): its spray on the sky (89).
const TERR={R:3200,X0:-3400,X1:3400,Z0:-3400,Z1:3400};
const FLOORLAND=(function(){
 const nz=(x,z,f,s,o)=>fbm(x*f+s*.37,z*f-s*.21,s,o||3)-.5;
 /* the shore's line: the lake north of it (z < shoreZ), the line running a little north-east, wandering */
 const shoreZ=x=>-700+.32*x+260*nz(x,0,.0007,611,3)*2+90*nz(x,0,.0031,612,2)*2;
 const sd=(x,z)=>(z-shoreZ(x))*.952;   /* the signed distance to the shore, m (land +): the line's slope .32 -> cos */
 /* the floor: rising south-west, swells, two creek beds from the south-west down to the lake */
 const creeks=[[-2600,2900,-300,-560],[1300,3200,1900,-120]].map(c=>({a:[c[0],c[1]],b:[c[2],c[3]]}));
 const creekD=(x,z)=>{let d=1e9;for(const C of creeks){const dx=C.b[0]-C.a[0],dz=C.b[1]-C.a[1],l2=dx*dx+dz*dz,t=clamp(((x-C.a[0])*dx+(z-C.a[1])*dz)/l2,0,1);
  d=Math.min(d,Math.hypot(C.a[0]+dx*t-x,C.a[1]+dz*t-z));}return d;};
 const creekDW=(x,z)=>creekD(x+60*nz(x,z,.003,614,2)*2,z+60*nz(x,z,.003,615,2)*2);
 function H(x,z){const s=sd(x,z);
  if(s<0){const d=-s,bed=-Math.min(9,1.1+d*.006)-1.2*smooth(.2,.7,nz(x,z,.002,616,2)+.5);return mix(bed,.6,smooth(-60,0,s));}   /* the lake: shallow, flats near shore */
  const sw=smooth(-1800,4200,(-x+z)*.707+800*nz(x,z,.0004,617,2)),rise=8+130*sw+18*nz(x,z,.0016,618,3)*2*smooth(0,400,s)+6*nz(x,z,.006,619,2)*2*smooth(0,120,s);
  let h=mix(.6+s*.04,rise,smooth(0,500,s));
  const cd=creekDW(x,z);if(cd<60){const bedH=Math.max(.4,h-3.5*smooth(60,8,cd));h=mix(h,bedH,smooth(60,10,cd));}
  return h;}
 /* the front (87): + toward the Vale (the north-west, Alph's side), - toward the Rift's own; the line runs north-east to south-west across the floor */
 const front=(x,z)=>(-x-z)*.707+420*nz(x,z,.0006,620,3)*2+120*nz(x,z,.0025,621,2)*2;
 return{H,sd,shoreZ,creekD:creekDW,front};})();
function terrainH(x,z){return FLOORLAND.H(x,z);}
// ---------------------------------------------------------------- the climate fields (the kit's zones read them: XANADU.zones; its floor planters run on them)
// Hypertropic: wet everywhere (.82-.97), the forest zone (low, wet) under the canopy; no uplands; mist over the lake and the creeks at dawn; salt on the flats
const FIELD_RAW={
 wet:(x,z)=>{const s=FLOORLAND.sd(x,z),c=FLOORLAND.creekD(x,z);return clamp(.84+.06*(fbm(x*.0021,z*.0021,631,2)-.5)+.12*smooth(60,5,c)+.1*smooth(200,0,s),0,1);},
 salt:(x,z)=>{const s=FLOORLAND.sd(x,z);return clamp(smooth(120,10,s)*smooth(-40,10,s),0,1);},
 upland:(x,z)=>clamp(.02+.08*smooth(60,160,terrainH(x,z)),0,1),
 /* over the salt lake flow reads 1: the kit's lotus pass grows pads only on still fresh water (it takes 1 - flow), and a saline lake grows none */
 flow:(x,z)=>FLOORLAND.sd(x,z)<0?1:clamp(smooth(55,6,FLOORLAND.creekD(x,z))*.6,0,1),
 mist:(x,z)=>{const s=FLOORLAND.sd(x,z);return clamp(.3*smooth(300,0,s)*smooth(-200,0,s)+.25*smooth(50,5,FLOORLAND.creekD(x,z)),0,1);}};
// ---------------------------------------------------------------- the land, for the shared host
const FLOOR_SPINE=[[-1400,-200],[-500,500],[300,1100],[1000,300],[-1700,1300],[700,1900],[-300,-300]];   /* the LOD origins: along the front and the shore (heroes within 320 m) */
const LAND={station:'floor',label:'The Rift floor',
 hint:'Xanadu, the Rift floor (station 5): the easternmost lake of the Rift under the cataract, where the Vale\'s flora carried down Alph grows tall in the dense air and meets the Rift\'s own (1.9 atm, -1,362 m)',
 sd:(x,z)=>FLOORLAND.sd(x,z),
 /* the kit's own tree pass stays off (the Vale's trees here are the tall cousins, 87); its floor planters run, off the creek beds' water */
 mask:(x,z)=>{if(BIO.cur==='xanadu/trees'&&!(typeof FLOOR!=='undefined'&&FLOOR.planting))return 0;return 1;},
 spine:FLOOR_SPINE,snowH:1e5,lake:true,river:null,waterY:0,bands:{upland:[0,160]},
 belt:null,   /* no fog belt: the lake's dawn mist is the height fog's (89a) */
 fruitAll:false,   /* the tall cousins carry the Vale's tags, but the Vale's fruit trees (olives, cacao's pods by the kit's own pass) are not grown by the kit here */
 /* feetOwed: 508 of 41,730 sampled feet off the drawn ground, measured 2026-11-03 (SwiftShader; NOTES.md): the kit's fern fronds (457) and mushrooms (37) on
    its fallen logs' backs (held by the log, not the ground: src/99's HELD_ITEMS lacks them), 14 grass and cobra lilies. A ratchet, down never up */
 dome:false,feetOwed:508,R:TERR.R+300,
 far:{label:'The Rift floor round the lake',
  h:(x,z)=>{const g=terrainH(clamp(x,TERR.X0,TERR.X1),clamp(z,TERR.Z0,TERR.Z1)),d=Math.max(Math.abs(x)-3400,Math.abs(z)-3400,0);
   if(FLOORLAND.sd(x,z)<-120&&z<-2000+.3*x)return -.4;   /* the lake past the water's box */
   const rid=1-Math.abs(2*KRAND.fbm(x*.0005,.5,z*.0005,3,641)-1),se=(x+z)*.707,step=smooth(3500,6500,se)*(-300),
    wall=smooth(6000,12000,Math.hypot(x,z))*(700+600*rid),nw=smooth(4000,10000,(-x-z)*.707)*(900+500*rid);
   return Math.max(g*smooth(1400,0,d)+40*smooth(0,1500,d)+step,wall,nw);},
  color:(x,z,y,q)=>{const L=a=>a.map(v=>Math.pow(v/255,2.2)),M=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
   if(y<0)return M(L([150,186,170]),L([110,124,128]),.4*smooth(4500,13000,q.r));
   let c=M(L([30,58,30]),L([46,74,38]),smooth(-.3,.3,KRAND.fbm(x*.002,.5,z*.002,2,642)-.5));c=M(c,L([118,104,92]),smooth(300,1100,y));
   return M(c,L([100,112,118]),.5*smooth(4500,13000,q.r));}},
 mirror:()=>({materials:[LAKE_DRAW.mesh.material],level:0,center:[1200,-2600],radius:1400,far:4500})};
