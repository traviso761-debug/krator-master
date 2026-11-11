// ================================================================= HOST — STATION 1, THE WEAVERS' CRADLE: its land (and its farms as records)
// The plan's site is 1555,1142 (2,180 m, "Aina Bruk off the fan"). THE SURVEY (PLAN.md 7b, 2026-11-11): the fan is near flat on the model (2,153-2,177 m
// over 8 km, falling north and east), and AINA BRUK (r174: perennial, 26.9 m3/s) rises at 1557.7,1139.2 where two seasonal wadis meet, Apa Aina Guli
// (r632, from the west) and Norta Waita Guli (r780, from the south-west): 7 km from the plan's site, off its page. The station stands at 1558,1140
// (2,168 m, Cwb, tm 11 degC (22/0), 439 mm, 1.22 atm) with the spring, both wadis and the river's first 3.5 km on the page; Spindle Fan (1561,1140)
// 6 km east, past its edge. On the model's surface the station sets:
//   THE WADIS     the two guli as dry cobble channels down to the spring (KRELIEF.wadi on the rivers' own lines, rivers.json)
//   THE SPRING    a pool where they meet (a still, the spring's look): Aina Bruk's head, the Yuni's "spring outpost" water
//   AINA BRUK     the river east from the pool (a WATER.flow on KRELIEF.river's levels, which never climb downstream), its channel cut in the fan
//   THE FIELDS    terraced treads east of the spring on both banks (KRELIEF.terraces: 0.5 m risers on a 0.4% fan, 60 m fields), one crop each
//                 (kits/crops: CROPS.at on the Cradle's bands, CROPS.pick seeded by the field's id)
//   THE FARMS     a Yuni farming village (the owner, 2026-11-11: the Cradle's farmers are Yuni colonists) on core/hamlet: KHAMLET.village with the Yuni
//                 row (core/hamlet/ext/21), its records laid HERE, before the ground is drawn, so its lanes are the ground's road field; drawn in 86
//   THE ROAD      from the village east toward Spindle Fan and the Weave-Step: the road "setting out east"
const STATION=(function(){
 const PX=(px,py)=>[(px-SITE.px)*2000,(py-SITE.py)*2000];   /* a 5.1 pixel to the page (the site's pixel at 0,0) */
 const base=(x,z)=>MODEL.h(x,z);
 const SPRING=PX(1557.7,1139.2);
 // the wadis on rivers.json's own lines (r632 Apa Aina Guli, r780 Norta Waita Guli), meandered between their points; both end at the spring
 const APA=KRELIEF.meander(PX(1549.69,1139.19),SPRING,{amp:90,wave:900,seed:99501}),NORTA=KRELIEF.meander(PX(1555.7,1141.2),SPRING,{amp:70,wave:700,seed:99502});
 const NORTA_W=[PX(1549.7,1141.2)].concat(NORTA);
 const W1=KRELIEF.wadi({pts:APA,ground:base,w:10,bank:1.8,bankW:4,braids:2,pools:0,fan:false,seed:99511});
 const W2=KRELIEF.wadi({pts:NORTA_W,ground:base,w:8,bank:1.6,bankW:4,braids:2,pools:0,fan:false,seed:99512});
 const g1=(x,z)=>KRELIEF.shape(W2,x,z,KRELIEF.shape(W1,x,z,base(x,z)));
 // Aina Bruk: from the spring east on r174's line (its next point 1559.7,1139.2, then 1561.69,1139.47), its water on KRELIEF.river's levels
 const RLINE=KRELIEF.meander(SPRING,PX(1559.7,1139.25),{amp:60,wave:800,seed:99503}).concat(KRELIEF.meander(PX(1559.7,1139.25),PX(1561.69,1139.47),{amp:60,wave:800,seed:99504}).slice(1));
 const RIVW=18,RLEV=KRELIEF.river(RLINE,g1,{depth:1.3,sample:6}).map(p=>[p.x,p.z,p.y]);
 const POOL={x:SPRING[0],z:SPRING[1],r:34,level:RLEV[0][2]+.25};
 function wet(x,z){const n=nearLine(RLINE,x,z);return{d:n.d,y:(()=>{const a=RLEV[n.i],b=RLEV[Math.min(RLEV.length-1,n.i+1)];return mix(a[2],b[2],n.u);})()};}
 // the terraces: east of the spring on both banks, a 30 m strip kept wild along the river and the wadis
 const ZONE=[PX(1557.9,1138.6),PX(1559.45,1138.6),PX(1559.45,1140.25),PX(1558.5,1140.45),PX(1557.95,1140.0)];
 const TER=KRELIEF.terraces({rise:.5,riser:.18,bund:.22,field:60,wobble:.1,fill:.5,zone:{poly:ZONE},fade:40,seed:99520});
 function ground(x,z){let h=KRELIEF.shape(TER,x,z,g1(x,z));
  const r=wet(x,z),hw=RIVW*.5;if(r.d<hw*3.2){const bed=r.y-1.3;h=r.d<hw?Math.min(h,bed+1.0*(r.d/hw)*(r.d/hw)):mix(Math.min(h,r.y+.5+(r.d-hw)*.06),h,smooth(hw*1.6,hw*3.2,r.d));}
  const dp=Math.hypot(x-POOL.x,z-POOL.z);if(dp<POOL.r*1.8)h=mix(Math.min(h,POOL.level-2.2*smooth(POOL.r,POOL.r*.3,dp)-.2),h,smooth(POOL.r,POOL.r*1.8,dp));
  return h;}
 const terAt=(x,z)=>{const a=KRELIEF.at(TER,x,z,g1(x,z));return a&&a.w>.5?a:null;};
 const farm=(x,z)=>{const a=terAt(x,z);if(!a||a.part!=='tread')return 0;const r=wet(x,z);return smooth(26,40,r.d)*smooth(.5,.9,a.w)*(washAt(x,z)?0:1);};
 const washAt=(x,z)=>{for(const W of [W1,W2]){const a=KRELIEF.at(W,x,z,base(x,z));if(a&&(a.part==='floor'||a.part==='bar'||a.part==='bank'))return true;}return false;};
 // THE FARMS: core/hamlet's village on the Yuni row, laid here as data (its records drawn in 86); its works reach the fields
 const site=PX(1557.55,1140.4),link=PX(1559.5,1140.0);
 const okGround=(x,z)=>{if(washAt(x,z)||wet(x,z).d<45||Math.hypot(x-POOL.x,z-POOL.z)<POOL.r*2)return false;const a=terAt(x,z);if(a&&a.part==='tread'&&a.w>.6)return false;
  const e=6,s=Math.hypot(base(x+e,z)-base(x-e,z),base(x,z+e)-base(x,z-e))/(2*e);return s<.12;};
 const VILLAGE=KHAMLET.village({id:'cradle-farms',world:99530,culture:'yuni',focus:'farming',site:{x:site[0],z:site[1]},link:{x:link[0],z:link[1]},
  resource:{x:PX(1558.2,1140.1)[0],z:PX(1558.2,1140.1)[1]},ground:{ok:okGround}});
 const ROAD={name:'The road east (to Spindle Fan and the Weave-Step)',pts:[[VILLAGE.site?VILLAGE.site.x:site[0],VILLAGE.site?VILLAGE.site.z:site[1]],PX(1558.6,1140.35),PX(1559.2,1140.2),PX(1559.5,1140.12)],w:5};
 const laneD=(x,z)=>{let d=nearLine(ROAD.pts,x,z).d/ROAD.w;for(const l of VILLAGE.lanes||[])d=Math.min(d,nearLine(l.pts,x,z).d/(l.w*.5));return d;};
 const PAVE=KRELIEF.pavement({h:ground,ground:base,wadis:[W1,W2],slope:[.04,.14],patch:.6,seed:99540});
 const L=chasmLand({R:2600,ground,
  lakes:[{name:'The spring of Aina Bruk',kind:'spring',level:POOL.level,poly:discPolyL(POOL.x,POOL.z,POOL.r,40)}],
  river:{pts:RLEV,width:RIVW,name:'Aina Bruk (from its spring)',speed:1.1},
  rockAt:(x,z,h,sl)=>smooth(.5,.85,sl),strataK:(x,z,h,sl)=>smooth(.45,.8,sl),
  wash:(x,z)=>washAt(x,z)?1:0,farm,road:(x,z)=>smooth(1.6,.6,laneD(x,z)),
  pave:(x,z)=>(washAt(x,z)||terAt(x,z))?0:PAVE(x,z)*.5,
  strata:GCH_STRATA({seed:99550}),
  spine:[[POOL.x,POOL.z],[site[0],site[1]],[0,0],PX(1558.4,1139.5),PX(1559,1139.3),PX(1558.8,1140.1),PX(1556.9,1139.6),PX(1557,1140.8)]});
 Object.assign(L,{PX,SPRING,POOL,APA,NORTA:NORTA_W,W1,W2,RLINE,RLEV,RIVW,TER,terAt,farm,washAt,VILLAGE,ROAD,laneD,ZONE,wet});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=STATION.RIVER_SPEC,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Weavers\' Cradle (loom-chasms station 1)',title:'Krator biome — the Loom-Chasms: the Weavers\' Cradle',build_id:'loom-chasms-cradle',
 hint:'Station 1 of the Loom-Chasms: the Weavers\' Cradle (scale model 5.1 px 1558,1140; 2,168 m, 1.22 atm, Cwb, 439 mm): Aina Bruk\'s spring where two wadis meet on the fan, the river setting out east, a Yuni farming village and its terraced fields, Spindle Fan 6 km east',
 region:{name:'The Weavers\' Cradle (station 1)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(SITE.h),cloud:.3,
 fog:{falloff:1/1300,sun:.3,sky:.35},climate:{cold:false,dry:true},wet:false,groundN:600,shimmer:false,
 groundLayers:['field','steppe','grass','wadi'],
 riverLook:[0x6aa8a4,0x2a6466],
 plants:['needle','grass','sac'],
 modelTol:12,sculpt:(x,z)=>STATION.wet(x,z).d<STATION.RIVW*3.2||Math.hypot(x-STATION.POOL.x,z-STATION.POOL.z)<STATION.POOL.r*1.8,
 /* nothing of the wild ground cover on the fields, the village's footprints and lanes (the crops and the buildings are there) */
 noRoot:(x,z)=>STATION.farm(x,z)>.2||(typeof CRADLE!=='undefined'&&CRADLE.occupied(x,z)),
 farLabel:'The Weavers\' Cradle\'s fans, the Stalker Range west, the Weave-Step falling east to the chasms (the scale model 5.1)',
 /* the neighbours' trees, read in place (station.json): nsemiarid's golden poplar as the windbreaks along the water, its wild apricot as the
    village's orchards (PLAN.md section 4: "hedges, windbreaks, orchards on the fans"; kits/crops lists the apricot for these bands) */
 kin:[{ref:'nsemiarid.poplar',key:'poplar',name:'Golden poplar (the windbreaks: nsemiarid\'s, read in place)',cell:28,minR:3,
   accept:(Z,x,z)=>{const w=STATION.wet(x,z).d;return (w>24&&w<60?.7:0)*(STATION.washAt(x,z)?0:1)*(STATION.farm(x,z)>.1?0:1);}},
  {ref:'nsemiarid.apricot',key:'apricot',name:'Wild apricot (the orchards: nsemiarid\'s, read in place)',cell:16,minR:3,
   accept:(Z,x,z)=>{const V=STATION.VILLAGE.site;if(!V)return 0;const d=Math.hypot(x-V.x,z-V.z);return d>110&&d<260&&STATION.farm(x,z)<.1&&!STATION.washAt(x,z)?.45:0;}}],
 prebuild:()=>typeof CRADLE!=='undefined'?CRADLE.build():null,
 build:()=>typeof CRADLE!=='undefined'?CRADLE.plant():null,
 hazards:()=>typeof CRADLE!=='undefined'?CRADLE.hazards():[],
 hazardMin:2,
 views:H=>typeof CRADLE!=='undefined'?CRADLE.views(H):{'From afar':H.look(-2600,2600,400,0,0,0)},
 checks:add=>{if(typeof CRADLE!=='undefined')CRADLE.checks(add);},
 negatives:add=>{if(typeof CRADLE!=='undefined')CRADLE.negatives(add);},
 probes:{}};
