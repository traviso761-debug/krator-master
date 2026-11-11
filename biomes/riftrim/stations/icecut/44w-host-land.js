// ================================================================= HOST — STATION 9, THE ICE-CUTTERS (a Fellgang village on the S rim's high lake; PLAN.md section 6, "Two more Fellgang villages",
// chosen by the owner 2026-11-11: "that sounds good for both")
// Scale model 5.1: the village on the north shore of the S rim's 3,570 m lake, px 470,1521 (world 940,3042 km): ~3,600-3,830 m, Dsc, ~630 mm, mean +1 degC (warmest
// month 14, coldest -12, nights to -20); the lake 608 km² in a high basin, peaks to 5.5 km beyond it south and 4.8 km west; the Rift's floor 4.2 km below within
// 20 km, the ice road's way down north-east toward Cthonos' country. `rift rim S` and `Fellgangs`. Set in winter, at dusk. The page compresses it into 6 km:
//   south      THE LAKE, frozen (station 3's WATER.ice, its drifts as wind streaks), the cut lanes of open water near the shore, the blocks stacked on the ice
//   centre     THE VILLAGE on a moraine shelf over the north shore (core/hamlet: KHAMLET.village on the Fellgang row, 84f, focus `quarry`: the ice houses,
//              barrows of turf over stone vaults, and the sledge shed), its lanes down to the ice
//   north-east THE ICE ROAD climbing over the moraine to the shelf's edge, its lantern posts, the ground beginning to fall toward the trough past the map
const STATION=(function(){const R=3000,LAKE=3570;
 const shoreZ=x=>260+90*Math.sin(x*.0011+2.1)+35*Math.sin(x*.0043+.5);   /* the lake's north shore (z) */
 const ROAD=[[-80,40],[160,-180],[420,-430],[760,-690],[1150,-980],[1600,-1320],[2100,-1700],[2700,-2200],[3200,-2650]];   /* the ice road from the village to the NE edge */
 function ground(x,z){const sz=shoreZ(x);let h;
  if(z>sz){const dIn=z-sz;h=LAKE-Math.min(40,2+dIn*.07)-(fbm(x*.004,z*.004,8401,2)-.5)*4;}
  else{const d=sz-z;h=LAKE+2+48*smooth(0,260,d)+70*smooth(300,1400,d)*(.6+.4*fbm(x*.002,z*.002,8402,2))+22*(fbm(x*.006,z*.006,8403,2)-.5);   /* the shore, the moraine shelf, the hummocky moraine behind */
   const mor=1-Math.abs(2*fbm(x*.0035,z*.0035,8404,2)-1);h+=26*mor*smooth(250,700,d);
   h+=Math.max(0,-x-900)*.14*smooth(-900,-3000,x);   /* the west rising toward the 4.8 km heights */
   h-=smooth(1800,3600,Math.hypot(x-3000,z+3000)<2600?(3600-Math.hypot(x-3000,z+3000)):0)*260;}   /* the shelf's NE edge beginning its fall toward the trough */
  if(z<=sz)h=mix(LAKE-1.2,h,smooth(0,30,sz-z));
  {const n=nearLine(ROAD,x,z);if(n.d<7)h-=.5*smooth(7,2,n.d);}   /* the road worn into the moraine */
  return h;}
 const VIL={x:-150,z:-60};
 const L=rimLand({R,ground,
  lakes:[{name:'The ice-cutters\' lake',kind:'frozen',level:LAKE,poly:[[-3600,3600],[-3600,300]].concat(Array.from({length:44},(_,k)=>{const x=-3500+k*163;return[x,shoreZ(x)-30];}),[[3600,300],[3600,3600]]),
   inside:(x,z)=>z>shoreZ(x)-30,area:608}],   /* the drawn outline's own line (the poly is the shore less 30 m): waterH and the drawn water agree */
  river:null,falls:[],
  tm:(x,z,h)=>1-6.5*(h-3700)/1000,
  wet:(x,z,h)=>.36+.08*fbm(x*.0016,z*.0016,8405,2),
  fog:(x,z,h)=>0,
  rockAt:(x,z,h,sl)=>smooth(.5,.8,sl),
  strataK:(x,z,h,sl)=>smooth(.5,.8,sl),
  snowAt:()=>0,   /* the winter's cover is the lying snow (89a, snowBase), not a barren field */
  strata:BIO.strata({recipe:'rift',seed:8406,range:[2800,4800],res:.5,private:true}),
  spine:[[VIL.x,VIL.z],[VIL.x,500],[VIL.x+400,600],[VIL.x-500,700],[420,-430],[1150,-980],[2100,-1700],[-1600,-600],[0,1800],[-2400,1500],[2200,1400]]});
 Object.assign(L,{shoreZ,LAKE,VIL,ROAD});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=STATION.RIVER_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}

const LAND={name:'The Ice-cutters (riftrim station 9)',title:'Krator biome — the rift rim: the Ice-cutters\' lake',
 hint:'Station 9 of the rift rim: a Fellgang village of ice-cutters on the S rim\'s 3,570 m lake (scale model 5.1 px 470,1521; Dsc, coldest month -12 degC). In winter they saw the lake ice into blocks, pack them in ice houses under turf, and carry them down the wall by night to the hot Rift floor, where cold is the dearest thing there is. The Cold is owed: what the lake gives is sold, never hoarded. Opens at dusk, the carry\'s lanterns lit (#hour=12 for midday)',
 region:{name:'The Ice-cutters (station 9)',x:0,z:0,r:TERR.R},rim:'s',wind:[.8,.5],arcade:false,fruitMin:0,hour:17.6,   /* the sun 4 degrees up: the low gold light before the carry */
 species:['lanternlobelia'],exportBox:[STATION.VIL.x+350,STATION.VIL.z+150,STATION.VIL.x+650,STATION.VIL.z+450],   /* the shore beside the village and the ice's edge (the flora keeps off the village itself) */
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],   /* the village and the lake's edge; no bucket here (the ice station's reason) */
 sky:{px:198,py:1191},atm:.66,cloud:.06,dust:false,   /* the sky's frame: the old canvas (5.1 px less 272,330); a clear winter evening */
 fog:{falloff:1/1500,sun:.4,sky:.25},climate:{cold:true,dry:true},wet:false,snowLine:[3300,3450],snowBase:.8,frozen:true,groundN:560,
 groundLayers:['black','lichen','iris','snowalgae','clad'],
 talusPalette:[0x3e3a3c,0x4e4846,0x5e5450,0x2e2c30,0x6a5a52],talusMatrix:0x46403e,
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),de=Math.max(0,x-S0),ds=Math.max(0,z-S0),dw=Math.max(0,-S0-x);
  if(ds>0&&ds<9000)return STATION.LAKE-1;   /* the lake runs on south past the map, then the peaks beyond it */
  /* the west rising toward the 4.8 km heights, the peaks beyond the lake's far shore, and north-east the shelf falling toward the trough (the carry's way down) */
  return g+dw*.12+(ds>=9000?(ds-9000)*.35:0)-4000*smooth(1500,15000,Math.min(de,dn)*1.4+Math.max(de,dn)*.3)+150*(fbm(x*.0008,z*.0008,8407,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farWater:{level:STATION.LAKE-1,colour:[150,170,186]},   /* the frozen lake past the map: the ice's grey-blue under snow (83) */
 farBands:[-1200,1500,2600,3100,3350],farLabel:'The S rim\'s high basin and the trough past the map',
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,V=S.VIL,F=window._ice||{};
  const vx=F.site?F.site.x:V.x,vz=F.site?F.site.z:V.z,sz=S.shoreZ(vx);
  return{
  /* the opening shot: the S rim's beacon, the nearest lantern lobelia to the village, over the frozen lake, the village and its lanterns beyond it */
  'A lantern lobelia over the frozen lake':()=>{const Ts=(RRIM.TREES||[]),t=Ts.slice().sort((a,b)=>Math.hypot(a.x-vx,a.z-vz)-Math.hypot(b.x-vx,b.z-vz))[0];
   if(!t)return[vx+340,S.LAKE+14,sz+420,vx,gh(vx,vz,4),vz];const dx=vx-t.x,dz=vz-t.z,l=Math.hypot(dx,dz)||1,cx=t.x-dx/l*22,cz=t.z-dz/l*22;return[cx,gh(cx,cz,3.2),cz,vx,gh(vx,vz,8),vz];},
  'The Ice-cutters at dusk':()=>[vx+340,S.LAKE+14,sz+420,vx,gh(vx,vz,4),vz],
  'The cut lanes on the ice':()=>{const c=(F.lanes&&F.lanes[1])||{x:vx,z:sz+120};return[c.x+40,S.LAKE+6,c.z+40,c.x,S.LAKE,c.z];},
  'The blocks stacked on the shore':()=>{const b=(F.stacks&&F.stacks[0])||{x:vx,z:sz+10};return[b.x+12,gh(b.x+12,b.z+14,2.2),b.z+14,b.x,gh(b.x,b.z,1),b.z];},
  'The ice houses':()=>{const h=((F.village&&F.village.records)||[]).find(r=>r.key==='fg-icehouse')||{x:vx,z:vz};return[h.x+22,gh(h.x+22,h.z+18,4),h.z+18,h.x,gh(h.x,h.z,2),h.z];},
  'The ice road over the moraine':()=>{const p=S.ROAD[3];return[p[0]-120,gh(p[0]-120,p[1]+90,9),p[1]+90,S.ROAD[6][0],gh(S.ROAD[6][0],S.ROAD[6][1],4),S.ROAD[6][1]];},
  'The village from the ice':()=>[vx-260,S.LAKE+40,sz+900,vx,gh(vx,vz,0),vz],
  'From afar':look(2500,2600,520,0,0,0)};},
 probes:{bed(){return[STATION.VIL.x,STATION.LAKE-4,1200];},ice:null}};
