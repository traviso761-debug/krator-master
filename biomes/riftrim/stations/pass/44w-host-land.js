// ================================================================= HOST — STATION 5, the crossing (the W rift highland into the S rim, on Dalab's road)
// Scale model 5.1 (PLAN.md, "Dalab's road on 5.1"): the road's least-cost line over the Outer Wall, 528 km from Dalab to Ledge, 24 km of it over
// 9 km; the crest 9,645 m at px 483,1236; the tunnel's SOUTH PORTAL where the road falls back under 8 km, px 477,1245 (world 954,2490 km;
// 8,052 m, HF, no rain on the model, -23 degC, 0.58 atm). The Ancient tunnel runs under everything over 8 km (~60 km). The page compresses the
// south face of the Wall into 6 km, falling south:
//   north    THE PORTAL in the face at ~8 km under the ice cap (the crest past the map to the north-east, in the far field); the Tungangs'
//            signal lamps in its mouth (glowing at dusk); the waystation's ground before it (a level apron: the waystation's own build is a
//            settlement's, as Ledge's is)
//   middle   bare rock, snow and ice: nothing grows over ~7 km; the road winding down in switchbacks
//   south    THE HIGH TUNDRA, 5.9-6.4 km: the S rim's fellfield (prism heath, cushion anemones, reindeer lichen), the road running on south
const STATION=(function(){const R=3000,PY=8040,PZ=-2550;
 const ridge=(x,z,f,s)=>1-Math.abs(2*fbm(x*f,z*f,s,2)-1);
 const base=(x,z)=>{const u=(z+3000)/6000;return PY+40-2450*Math.pow(clamp(u,0,1.1),.85)+260*(ridge(x,z,.0011,71)-.5)+30*(fbm(x*.008,z*.008,72,2)-.5)+smooth(-2600,-3000,z)*320;};   /* the face steepening at the north edge only */
 // the road: switchbacks down the face from the portal's apron, then a long line south over the tundra
 const ROAD=[[0,PZ+90],[420,PZ+380],[-380,PZ+760],[460,PZ+1150],[-300,PZ+1560],[380,PZ+1980],[-200,PZ+2450],[150,PZ+3000],[-80,PZ+3700],[200,PZ+4600],[0,PZ+5700]];
 const APRON={x:0,z:PZ+60,r:110};
 function ground(x,z){let h=base(x,z);
  // the portal's face: a cliff cut north of the apron (the tunnel's mouth opens in it), the apron levelled before it
  const ad=Math.hypot(x-APRON.x,(z-APRON.z)*1.3);if(ad<APRON.r*2.2)h=mix(PY,h,smooth(APRON.r,APRON.r*2.2,ad));
  if(z<PZ&&Math.abs(x)<260)h=Math.max(h,PY+70*smooth(PZ,PZ-40,z));
  // the road bench: the ground levelled across the road's 8 m width
  const n=nearLine(ROAD,x,z);if(n.d<14){const a=ROAD[n.i],b=ROAD[Math.min(ROAD.length-1,n.i+1)],ry=base(mix(a[0],b[0],n.u),mix(a[1],b[1],n.u));h=mix(h,ry,smooth(14,5,n.d));}
  return h;}
 const L=rimLand({R,ground,
  tm:(x,z,h)=>-23+6.5*(PY-h)/1000,
  wet:(x,z,h)=>.2+.08*fbm(x*.0016,z*.0016,139,2),
  barren:(x,z,h)=>smooth(6700,6900,h),
  ice:(x,z)=>{const h=base(x,z);return smooth(7300,7500,h)*smooth(.42,.55,fbm(x*.0018,z*.0018,73,2)+.15);},
  rockAt:(x,z,h,sl)=>Math.max(smooth(.45,.78,sl),smooth(6500,7000,h)*.6),
  strataK:(x,z,h,sl)=>smooth(.5,.85,sl)*.7,
  snowAt:(x,z,h,sl)=>smooth(6200,6600,h)*smooth(.75,.4,sl)*smooth(.3,.5,fbm(x*.004,z*.004,134,2)+.2*smooth(6600,7200,h)),
  polyg:(x,z,F)=>smooth(.75,.82,F.cold)*smooth(.14,.05,F.slope)*(1-F.rock)*(1-F.snow),
  strata:BIO.strata({recipe:'rift-basement',seed:6805,range:[5000,9200],res:.5,private:true}),
  spine:[[APRON.x,APRON.z+40]].concat(ROAD.slice(1,9))});
 Object.assign(L,{PY,PZ,ROAD,APRON,base});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=STATION.RIVER_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){const F=STATION.fieldsAt(x,z,h,slope),n=nearLine(STATION.ROAD,x,z);F.road=smooth(6,3,n.d);return F;}
const LAND={name:'The crossing (riftrim station 5)',title:'Krator biome — the rift rim: the crossing',
 hint:'Station 5 of the rift rim: Dalab\'s road at the Ancient tunnel\'s south portal, 8 km up the Outer Wall under a near-airless sky (0.58 atm), the Tungangs\' signal lamps in its mouth, the road winding down the ice and rock to the high tundra (scale model 5.1, px 477,1245)',
 region:{name:'The crossing (station 5)',x:0,z:0,r:TERR.R},rim:'s',lamps:true,wind:[.3,1],arcade:false,fruitMin:0,
 species:['lanternlobelia'],exportBox:[-150,2500,150,2800],exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],   /* no tree grows here: no bucket to export */
 sky:{px:205,py:915},atm:.58,cloud:.08,dust:false,   /* the sky's frame: the old canvas (5.1 px less 272,330) */
 fog:{falloff:1/2600,sun:.5,sky:.15},climate:{cold:true,dry:true},wet:false,snowLine:[6200,6600],snowBase:0,frozen:true,groundN:540,
 groundLayers:['black','lichen','clad','snowalgae','iris'],
 talusPalette:[0x5e5a56,0x6e6a66,0x4e4a48,0x7a7672],talusMatrix:0x5a5652,
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),ds=Math.max(0,z-S0),de=Math.max(0,x-S0);
  return g+dn*.45*(1+.4*smooth(0,9000,dn))+de*.15*smooth(0,4000,dn)-ds*.32*smooth(0,9000,ds)+220*(fbm(x*.0008,z*.0008,412,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[0,4000,5500,6400,7000],farLabel:'The Outer Wall\'s crest and the S rim past the map',
 // the Tungangs' signal lamps in the portal's mouth (the plan's station 5: "the Tungangs' signal lamps in the tunnel's mouth"): the lobelia's
 // night glow item, set in a row across the apron's back; the portal itself is a cut face (KCARVE's mouth is owed: PLAN.md "Core adoption")
 build:()=>{const A=STATION.APRON,pv=BIO.kit('riftrim'),c0=BIO.cur;BIO.cur='riftrim/floor';let n=0;
  try{for(let k=-3;k<=3;k++){const x=A.x+k*14,z=STATION.PZ-6,y=terrainH(x,z+10);BIO.put('glow',[x,y,z+10],null,[.35,1.6,.35],0xffffff);n++;}}finally{BIO.kit(pv);BIO.cur=c0;}
  REGISTER({name:'The Ancient tunnel\'s south portal (Dalab\'s road: the waystation\'s ground before it)',key:'site.portal',x:A.x,z:A.z,y:STATION.PY-10,r:A.r,h:90});
  return{lamps:n};},
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,R=S.ROAD;
  return{
  'The high tundra':look(P.alpine[0]-10,P.alpine[1]+8,1.6,P.alpine[0]+10,P.alpine[1]-6,0),
  'The portal and its lamps':[S.APRON.x+60,S.PY+14,S.APRON.z+260,S.APRON.x,S.PY+20,S.PZ-30],
  'The road down from the portal':[R[1][0]+40,gh(R[1][0]+40,R[1][1],8),R[1][1],R[5][0],gh(R[5][0],R[5][1],0),R[5][1]],
  'Under a near-airless sky':[0,S.PY+60,S.APRON.z+400,0,S.PY+1600,S.PZ-4000],
  'From afar':look(2600,2800,500,0,-1500,600)};},
 probes:{ice(){return[0,STATION.PZ+300];}}};
