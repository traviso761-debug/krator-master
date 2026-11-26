// ================================================================= HOST — STATION gills: Alph's head, the White Gills (Wāiṭ Gīl) on the twins' Xanadu side
// biomes/gills/PLAN.md section 11 item 6 (and section 5, "The White Gills"): scale model 5.1 px ~938,1496 (old canvas ~666,1166), ~6.3 km, ~0.73 atm, EF
// over the Sacred River's subglacial reservoir (DATA.tubes cav_alph_headwater, tube_xanadu_nw_09). The land contract (src/45b-host-land.js) on a 6.4 km
// square that compresses the fall from the gills to the wildwood at the Vale's upper edge (the model puts that ~4 km lower and tens of km off):
//   north-east    THE ICE: the glacier's edge at ~5,700 m on the flank of the higher cone (11,080 m, NNE, in the far field; the lower cone east)
//   the band      THE GILLS: ring cracks round the higher cone (biomes/gills GILLS.layout), 7 breathing and 2 dead, squat white branching pipes (Phlū)
//                 crowding their lips, the highest standing out of the glacier's edge as ice pipes; the breath meadow downwind (south-east) white with lime
//   the middle    ALPH'S CHASM: an amphitheatre cut 140 m into the flank at the gills' foot (5.1's Alph chasm amphitheatre), its floor a pool where the
//                 river bursts out on the out-breath (Ālph-bi Bhlo: the fountain, 89x), then a gorge running SSW down to the map's edge
//   south-west    THE FOOT: the kit's own wildwood (XANADU.build by its zones), the chasm's spray holding its frills and tree-ferns, the crag's pines
//                 above, nothing of it over 4,750 m (LAND.mask)
// The axis: up toward the higher cone (DIR, NNE); across it (PERP). No placement here: the carve reads the gills' records (GILLS.gillAt).
const STATION_GILLS=(function(){const R=3000,DIR=[.496,-.868],PERP=[.868,.496],CONE=[4000,-7000];
 const uOf=(x,z)=>x*DIR[0]+z*DIR[1],vOf=(x,z)=>x*PERP[0]+z*PERP[1];
 const nz=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o||3,s)-.5;
 const base=(x,z)=>{const u=uOf(x,z),rid=1-Math.abs(2*KRAND.fbm(x*.0016,.5,z*.0016,3,6101)-1);
  return 2900+3400*Math.pow(smooth(-4300,3700,u),1.08)+rid*rid*130*smooth(-2500,1000,u)+60*nz(x,z,.004,6102,3)+12*nz(x,z,.02,6103,2);};
 // THE SWARM: ring cracks round the higher cone, across the band 5.1-5.9 km (its radius from the cone), 7 live, 2 dead (a moved gill's pipe field: the lowest)
 const L=GILLS.layout({centre:CONE,band:[6050,7650],arc:[1.86,2.28],n:7,dead:2,seed:0x6A11,w:[14,44],d:[38,86],len:[500,2300]});
 { /* the dead gills are the lowest of the swarm (the band's outer radii): the swarm moved up the flank */ const gs=L.gills.slice().sort((a,b)=>a.r-b.r);gs.forEach((g,i)=>{g.alive=i<7;});}
 // ALPH'S CHASM: the head (the amphitheatre) on the axis below the swarm; the gorge's line meanders SSW to the edge; its bed graded, never climbing
 const HEAD={u:-150,v:-380},HR=240;
 const lineV=u=>HEAD.v+220*Math.sin(u*.0011+1)*smooth(HEAD.u,HEAD.u-900,u)+70*Math.sin(u*.0033)*smooth(HEAD.u,HEAD.u-600,u);
 const U0=HEAD.u,U1=-4500,DS=20,BED=[];{let prev=1e9;for(let u=U0;u>=U1;u-=DS){const v=lineV(u),x=u*DIR[0]+v*PERP[0],z=u*DIR[1]+v*PERP[1],D=mix(140,55,smooth(U0,U1,u));
   let b=base(x,z)-D;b=Math.min(b,prev-.04);if(prev<1e9&&Math.abs(u-(-900))<DS/2)b-=11;if(prev<1e9&&Math.abs(u-(-2300))<DS/2)b-=8;BED.push(b);prev=b;}}
 const bedAt=u=>{const t=(U0-u)/DS,i=clamp(Math.floor(t),0,BED.length-2),f=clamp(t-i,0,1);return BED[i]*(1-f)+BED[i+1]*f;};
 const halfW=u=>mix(18,46,smooth(U0,U1,u));
 const chasm=(x,z)=>{const u=uOf(x,z);if(u>U0+HR+80||u<U1)return null;const v=vOf(x,z),dv=Math.abs(v-lineV(Math.min(u,U0))),hx=HEAD.u*DIR[0]+HEAD.v*PERP[0],hz=HEAD.u*DIR[1]+HEAD.v*PERP[1],dh=Math.hypot(x-hx,z-hz);
  return{u,dv,dh,bed:bedAt(Math.min(u,U0))};};
 const HEADXZ=[HEAD.u*DIR[0]+HEAD.v*PERP[0],HEAD.u*DIR[1]+HEAD.v*PERP[1]];
 function ground(x,z){let h=base(x,z);
  // the gills: each crack carved by its record (the depth share 1 on the floor, the walls steep)
  const g=GILLS.gillAt(L,x,z);if(g)h-=g.g.d*g.k*(1+.06*nz(x,z,.03,6104,2));
  // the chasm: the gorge below the head, steep-walled, and the amphitheatre round the head
  const c=chasm(x,z);if(c){const bedH=c.bed;
   if(c.u<=U0+40){const w=halfW(c.u),t=Math.max(0,c.dv-w);const bank=bedH+(c.dv<w?-.6*(1-c.dv/w):0)+Math.min(t,12)*.35+Math.max(0,t-12)*2.6;if(bank<h)h=bank;}
   if(c.dh<HR+120){const bowl=BED[0]+(c.dh<HR*.55?-1.2*(1-c.dh/(HR*.55)):0)+150*Math.pow(smooth(HR*.55,HR+110,c.dh),1.4);if(bowl<h)h=bowl;}}
  return h;}
 const POOLY=BED[0]+.4;
 return{R,DIR,PERP,CONE,L,uOf,vOf,base,ground,chasm,bedAt,halfW,lineV,HEAD:HEADXZ,HR,U0,U1,DS,POOLY,
  river:(function(){const pts=[];for(let u=U0;u>=-3300;u-=24){const v=lineV(u),x=u*DIR[0]+v*PERP[0],z=u*DIR[1]+v*PERP[1];if(Math.max(Math.abs(x),Math.abs(z))>R*1.08)break;pts.push([x,z,bedAt(u)+.55,2*halfW(u)*.42]);}return pts;})()};})();
const TERR={R:STATION_GILLS.R,X0:-3200,X1:3200,Z0:-3200,Z1:3200};
function terrainH(x,z){return STATION_GILLS.ground(x,z);}
// ---------------------------------------------------------------- the climate fields (the kit's zones read them: 55 XANADU.zones)
// upland: 3,000-4,800 m (the crag's pines toward the top, the open wildwood at the foot); wet: the flank is dry (ET, ~100 mm on the model; the page's foot
// takes the Vale's upper Csb), the chasm's spray and the fountain wet; mist: the fountain's and the gorge's spray (the chasm zone: frills, tree-ferns); flow: the river
const FIELD_RAW={
 wet:(x,z)=>{const c=STATION_GILLS.chasm(x,z),h=terrainH(x,z);let w=mix(.55,.3,smooth(3200,4400,h));if(c){w=Math.max(w,.95*smooth(140,10,c.dv),.9*smooth(500,60,c.dh));}return clamp(w+.08*(KRAND.fbm(x*.002,.5,z*.002,2,6111)-.5),0,1);},
 salt:(x,z)=>0,
 upland:(x,z)=>clamp((terrainH(x,z)-3000)/1800,0,1),
 flow:(x,z)=>{const c=STATION_GILLS.chasm(x,z);return c?clamp(smooth(80,6,c.dv)*(c.u<=STATION_GILLS.U0?1:0),0,1):0;},
 mist:(x,z)=>{const c=STATION_GILLS.chasm(x,z);if(!c)return 0;return clamp(Math.max(smooth(620,60,c.dh),.9*smooth(200,25,c.dv)*smooth(-3200,STATION_GILLS.U0,c.u)),0,1);}};
const LAND={station:'gills',label:'Alph\'s head: the White Gills (Wāiṭ Gīl)',
 hint:'Alph\'s head on the twins\' Xanadu side: ring gills that breathe once a day at the giant\'s nod (Bhlo, the out-breath; Suq, the in-breath), squat white breath pipes (Phlū) out of the glacier\'s edge, the chasm where the Sacred River is forced up on the breath (Ālph-bi Bhlo), the Vale\'s wildwood at the foot',
 sd:(x,z)=>1e4,lake:false,waterY:-1e4,R:3300,dome:false,belt:null,snowH:5700,bands:{upland:[3000,4800]},
 feetOwed:691/*2026-11-03 re-measured after the feet tolerance and the quaternion fix*/,fruitAll:false,   /* 2026-11-03, SwiftShader: the kit's floor clusters (grass, clubmoss, mushroom, blade, lobe...) scatter round a masked centre onto this flank's slopes, up to 4.7 m off the drawn ground; the kit's to fix (60), ratchet down */
 // nothing of the Vale's flora over 4,750 m (it does not climb: PLAN.md section 7, "Guests"), none in a gill or the river's channel, none on the pool's floor
 /* and none where the drawn ground (46's 10 m mesh, KSEAT) is more than .5 m off terrainH: the gills' and the amphitheatre's walls are steeper than a
    cell can follow, so a plant placed there floats or sinks (the feet check) */
 mask:(x,z)=>{const h=terrainH(x,z);if(h>4740)return 0;if(GROUND_SEAT&&Math.abs(drawnH(x,z)-h)>.5)return 0;if(GILLS.gillAt(STATION_GILLS.L,x,z))return 0;const c=STATION_GILLS.chasm(x,z);if(c){if(c.u<=STATION_GILLS.U0&&c.dv<STATION_GILLS.halfW(c.u)*.6+3)return 0;if(c.dh<STATION_GILLS.HR*.6)return 0;}return 1;},
 spine:[[-2400,2300],[-1500,1500],[-700,900],STATION_GILLS.HEAD,[0,0],[700,-900],[1300,-1500],[-200,-1400],[1600,200],[-1700,-200]],
 river:null,
 // the far field: the higher cone (11,080 m) NNE, the lower (8,535 m) east, the flank falling SSW toward the Vale in the haze
 far:(function(){const C1=[4000,-7000],C2=[9000,500],L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  const C={rock:L([118,112,112]),dark:L([72,70,74]),snow:L([232,236,242]),wood:L([62,82,52]),far:L([150,166,180])};
  const cone=(x,z,c,H,k)=>H*Math.max(0,1-Math.pow(Math.hypot(x-c[0],z-c[1])/k,.85));
  return{label:'The twin cones and the flank falling to the Vale',
   h:(x,z)=>{const u=STATION_GILLS.uOf(x,z),edge=terrainH(clamp(x,-3200,3200),clamp(z,-3200,3200)),d=Math.max(Math.abs(x)-3200,Math.abs(z)-3200,0);
    const flank=2900+3400*Math.pow(smooth(-4300,3700,u),1.08)-900*smooth(-4300,-14000,u);
    return Math.max(mix(edge,flank,smooth(0,1400,d)),cone(x,z,C1,11080,6200),cone(x,z,C2,8535,5200));},
   color:(x,z,y,q)=>{let c=mixC(C.wood,C.rock,smooth(3200,4600,y));c=mixC(c,C.dark,smooth(7000,9000,y)*.6);c=mixC(c,C.snow,smooth(5800,6100,y)*(1-smooth(9500,10500,y)*.5));return mixC(c,C.far,.55*smooth(4000,13000,q.r));}};})()};
