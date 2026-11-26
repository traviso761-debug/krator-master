// ================================================================= HOST — STATION 1, the Gate-Step (Terrace I, the Outer Gate-Scarp and the Clodosriba's gorge)
// Scale model 5.1 (surveyed 2026-11-09, PLAN.md "Station 3, as built"): Terrace I round px 638,1212 stands at ~805-920 m (+23 degC, warm month
// +36, cold +10, 1,522 mm, Cfa); the Clodosriba's bed is flat at 804.5 m over three points there (a pond on the model: the Gate Mere here);
// Terrace II (1,430-1,490 m) is the bench above riser 1. The plan (section 2.1) has riser 1 "breached by the Lower Clodosriba gorge": the river
// does not leap the scarp's face here, its fall has cut back into Terrace II and stands at a gorge's head, and the gorge carries it out through
// the scarp onto Terrace I. The page (6 km, x east, z south, the river running north, -z):
//   south    TERRACE II at ~1,465 m (a ponded flow: flat), the Clodosriba in its channel to the gorge's rim
//   the head THE GATE FALLS: the Clodosriba's ~600 m leap off Terrace II into its plunge pool at the gorge's head (~600 m back from the scarp)
//   the scarp RISER 1, the Outer Gate-Scarp: KRELIEF.stair's lobate front (~600 m of columnar flows, a bench on each flow's top), the GORGE
//            (KRELIEF.rille, its walls stepping on the same flows' tops) breaching it; on its crest either side of the gorge's mouth the two
//            WATCH-TOWERS' SITES (the settlement build's: core/tags records and their footprints, kept clear), sighted north toward Tallhouse
//   north    TERRACE I at ~830-850 m, gently dished: the river out of the gorge's mouth into THE GATE MERE (805 m, the model's flat bed) and on
//            north toward Tallhouse; the Free Giants' gardens by the mere (plots painted on core/mask)
const STATION=(function(){const R=3000,KR=KRAND,W0=KR.hash(1212,638,0,0x6a7e);
 // ------------------------------------------------------------ Terrace I's plain (under the stair: the stair's lowest step is buried by it)
 const MERE={x:-260,z:-980,r:420,level:805.5};
 const plainI=(x,z)=>838+.006*z+5*(fbm(x*.0022,z*.0022,91,2)-.5)-38*Math.exp(-((x-MERE.x)**2+((z-MERE.z)*1.25)**2)/(MERE.r*MERE.r*1.1));
 // ------------------------------------------------------------ riser 1: the god's stair (KRELIEF.stair) from Terrace II down; its last step (700 m) is under the plain
 const STAIR=KRELIEF.stair({a:[0,3400],b:[0,-3400],steps:[{y:1465,at:2500},{y:700,at:6000}],w:3400,lobes:{amp:150,wave:950},slope:72,
  tongues:{per:.45,len:[40,150],w:[40,120]},flows:[9,24],riser:.38,colonnade:.45,wrinkle:1.2,seed:KR.hash(W0,1,0,0x51)});
 const LIP_Z=3400-2500;   /* the scarp's lip, before its lobes (z ~ +900) */
 const g0=(x,z)=>Math.max(plainI(x,z),KRELIEF.shape(STAIR,x,z,-1e9));
 // ------------------------------------------------------------ the Clodosriba's gorge (KRELIEF.rille): from the falls' pool north through the scarp to its mouth
 const HX=140,HZ=LIP_Z+640,MX=300,MZ=LIP_Z-330;   /* the gorge's head (the plunge pool) and its mouth on Terrace I */
 const GP=KRELIEF.meander([HX,HZ],[MX,MZ],{amp:45,wave:520,step:20,seed:KR.hash(W0,2,0,0x52)});
 const GORGE=KRELIEF.rille({pts:GP,ground:g0,w:150,depth:40,floorW:.2,talus:.16,talusA:34,face:80,bench:7,tops:STAIR.flowTops,seed:KR.hash(W0,3,0,0x53)});
 /* the floor is set, not found: the plunge pool's level at the head (858 m), falling to the plain at the mouth (KRELIEF.rille's floor is the
    lowest ground less a depth, which would ramp it down the scarp: the fall has cut back, so the gorge's floor is level with Terrace I) */
 const POOL_Y=857,MOUTH_Y=plainI(MX,MZ)-3.5;
 {const L=GORGE.pts.length-1;GORGE.pts.forEach((p,i)=>{p.y=mix(POOL_Y-4,MOUTH_Y,smooth(0,1,i/L));});}
 const ground1=(x,z)=>KRELIEF.shape(GORGE,x,z,g0(x,z));
 // ------------------------------------------------------------ the river: its line and levels (by z: it runs north the whole way)
 const RIM_Z=HZ+148,T2Y=1465;   /* where the Clodosriba comes over the gorge's head wall */
 const cxT2=z=>HX+40*Math.sin((z-RIM_Z)*.0021)*smooth(0,300,z-RIM_Z)+70*Math.sin((z-RIM_Z)*.0009);   /* on Terrace II */
 const gorgeX=z=>{let b=GORGE.pts[0];for(const p of GORGE.pts)if(Math.abs(p.z-z)<Math.abs(b.z-z))b=p;return b.x;};
 const cxI=z=>MX+(MERE.x-MX)*smooth(MZ,MERE.z,z)+60*Math.sin((MZ-z)*.004)*smooth(MZ,MZ-200,z)*smooth(MERE.z+300,MERE.z+600,z);   /* the mouth to the mere */
 const cxN=z=>MERE.x+120*Math.sin((MERE.z-MERE.r-z)*.0017)*smooth(MERE.z-MERE.r,MERE.z-MERE.r-300,z);   /* the mere to the north edge */
 const OUT_Z=MERE.z-MERE.r*.9;
 function cLevel(z){if(z>RIM_Z)return T2Y-2.4-(z-RIM_Z)*-.0006;                       /* Terrace II: a shallow channel, falling a little north */
  if(z>MZ)return mix(MOUTH_Y,POOL_Y,smooth(MZ,HZ,z))+1.2;                                   /* the gorge, from the pool to the mouth */
  if(z>OUT_Z)return mix(MERE.level,MOUTH_Y+1,smooth(MERE.z,MZ,z));                           /* across Terrace I into the mere */
  return MERE.level-.5-(OUT_Z-z)*.0058;}                                                     /* out of the mere north: in its channel (the plain falls .006) */
 const cx=z=>z>RIM_Z?cxT2(z):z>MZ?gorgeX(z):z>OUT_Z?cxI(z):cxN(z);
 const CHW=z=>z>RIM_Z?13:z>MZ?mix(20,16,smooth(MZ,HZ,z)):z>OUT_Z?17:20;
 // ------------------------------------------------------------ the watch-towers' sites: on the scarp's crest either side of the gorge's mouth
 const lipAt=x=>{let lo=LIP_Z-400,hi=LIP_Z+400;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(g0(x,m)>T2Y-30)hi=m;else lo=m;}return hi+28;};   /* 28 m back from the edge */
 const SITES=[[-360,'west'],[620,'east']].map(([x,w])=>{const z=lipAt(x);return{x,z,r:42,ez:1,y:g0(x,z),key:'site.watchtower.'+w,name:'The Gate-Step\'s '+w+' watch-tower'};});
 const siteK=(x,z)=>{let k=0;for(const s of SITES)k=Math.max(k,smooth(s.r*1.25,s.r*.95,Math.hypot(x-s.x,z-s.z)));return k;};
 // ------------------------------------------------------------ the Free Giants' gardens by the mere: plots on core/mask (KMASK), read by their distance
 const PLOTS=maskField((g,P)=>{for(let k=0;k<14;k++){const h=KR.hash(W0,40+k,0,0x6a1),u=q=>KR.unit(KR.hash(h,q,0,0x6a2));
   const cx0=MERE.x+(u(1)-.5)*1500,cz0=MERE.z+250+u(2)*900,a=.3+(u(3)-.5)*.5,L=70+90*u(4),Wd=40+50*u(5),ca=Math.cos(a),sa=Math.sin(a);
   if(Math.hypot(cx0-MERE.x,(cz0-MERE.z)*1.25)<MERE.r*1.15)continue;
   P.poly([[-L,-Wd],[L,-Wd],[L,Wd],[-L,Wd]].map(q=>[cx0+q[0]*ca-q[1]*sa,cz0+q[0]*sa+q[1]*ca]));}},{R,n:768});
 function ground(x,z){let h=ground1(x,z);
  // THE CLODOSRIBA: its channel on Terrace II (to the gorge's head wall), in the gorge (the rille's floor), across Terrace I
  {const c=cx(z),q=Math.abs(x-c),lv=cLevel(z),hw=CHW(z);
   if(q<hw*3.2&&!(z<=RIM_Z+10&&z>HZ-40)){const bed=lv-2.6;h=q<hw?Math.min(h,bed+(q/hw)*2.2):mix(h,Math.min(h,lv+.7+(q-hw)*.3),smooth(hw*3.2,hw,q));}}
  // the plunge pool at the gorge's head
  {const d=Math.hypot(x-HX,z-(HZ+10));if(d<95){const bed=POOL_Y-8*smooth(70,0,d);h=Math.min(h,d<70?bed:mix(bed,h,smooth(70,95,d)));}}
  // the garden plots: levelled a little and bunded (the plot's edge stands 0.4 m)
  {const s=PLOTS(x,z);if(s<8){h+=-.25*smooth(4,-6,s)+.4*smooth(4,0,Math.abs(s));}}
  return h+2.5*(fbm(x*.015,z*.015,93,2)-.5)*smooth(.2,.05,Math.abs(h-g0(x,z))/50);}
 // ------------------------------------------------------------ the water's lines
 const tPts=[];for(let z=3300;z>=RIM_Z+2;z-=15)tPts.push([cx(z),z,cLevel(z)]);tPts.push([cx(RIM_Z),RIM_Z-2,cLevel(RIM_Z+3)]);
 const gPts=[];for(let z=HZ-30;z>=OUT_Z-1;z-=15)gPts.push([cx(z),z,cLevel(z)]);
 const nPts=[];for(let z=OUT_Z;z>=-3300;z-=15)nPts.push([cx(z),z,cLevel(z)]);
 const mPoly=Array.from({length:48},(_,k)=>{const a=k/48*TAU;let r=MERE.r*.4;for(let t=0;t<24;t++){const rr=MERE.r*.4+t*24;if(plainI(MERE.x+Math.cos(a)*rr,MERE.z+Math.sin(a)*rr)>MERE.level+.3){r=rr;break;}r=rr;}return[MERE.x+Math.cos(a)*r,MERE.z+Math.sin(a)*r];});
 const poolPoly=Array.from({length:32},(_,k)=>{const a=k/32*TAU;return[HX+Math.cos(a)*72,HZ+10+Math.sin(a)*72];});
 const falls=[{name:'The Gate Falls: the Clodosriba off Terrace II into its gorge',lip:[[cx(RIM_Z)-14,RIM_Z,cLevel(RIM_Z+3)+.3],[cx(RIM_Z)+14,RIM_Z,cLevel(RIM_Z+3)+.3]],dir:[0,-1],
  drop:cLevel(RIM_Z+3)-POOL_Y,foot:[HX,HZ+30,POOL_Y],plungeR:60}];
 const L=stepLand({R,ground,
  lakes:[{name:'The Gate Mere (the Clodosriba\'s pond on Terrace I)',kind:'deep',level:MERE.level,poly:mPoly,area:2},
   {name:'The Gate Falls\' plunge pool',kind:'deep',level:POOL_Y,poly:poolPoly,area:1}],
  rivers:[{pts:tPts,width:28,half:(x,z)=>CHW(z),name:'Clodosriba (on Terrace II)',speed:2.2},{pts:gPts,width:40,half:(x,z)=>CHW(z),name:'Clodosriba (the gorge and Terrace I)',speed:2.6},
   {pts:nPts,width:40,half:(x,z)=>CHW(z),name:'Clodosriba (toward Tallhouse)',speed:1.6}],
  falls,
  tm:(x,z,h)=>23-6.5*(h-805)/1000,                                       /* the model's +23 degC on Terrace I, carried by a lapse rate */
  wet:(x,z,h)=>.6+.1*smooth(1200,1450,h),                                /* 1,522 mm */
  fog:(x,z,h)=>Math.max(.9*smooth(420,90,Math.hypot(x-HX,z-HZ)),.4*smooth(260,60,Math.abs(x-gorgeX(z)))*smooth(MZ-60,MZ+100,z)*smooth(HZ+80,HZ-40,z)),   /* the falls' spray up the gorge */
  farm:(x,z)=>smooth(6,-10,PLOTS(x,z)),
  site:siteK,
  rockAt:(x,z,h,sl)=>smooth(.5,.82,sl),
  strataK:(x,z,h,sl)=>smooth(.45,.8,sl),
  talus:(x,z)=>{const p=KRELIEF.at(STAIR,x,z);return p&&p.part!=='top'?.6:0;},
  strata:BIO.strata({recipe:'tibasalt-ponded',seed:7101,range:[600,1700],res:.5,private:true}),
  spine:[[MX,MZ-80],[HX,HZ-200],[SITES[0].x,SITES[0].z],[SITES[1].x,SITES[1].z],[MERE.x+300,MERE.z+200],[MERE.x-500,MERE.z-300],[cx(2000),2000],[-1100,-300],[1200,-600],[-300,-2400],[1500,2200],[-1600,1900]]});
 Object.assign(L,{shareLayers:{leafy:'grass',lichen:'moss'},STAIR,GORGE,MERE,SITES,PLOTS,HX,HZ,MX,MZ,RIM_Z,LIP_Z,POOL_Y,T2Y,cx,cLevel,gorgeX,lipAt});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVERS_SPEC=STATION.RIVERS_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Gate-Step (greenstep station 1)',station:'gatestep',title:'Krator biome — Greenstep: the Gate-Step and the Clodosriba\'s gorge',
 hint:'Station 1 of Greenstep: Terrace I under the Outer Gate-Scarp, the Clodosriba leaping off Terrace II at the Gate Falls and running out of its gorge through the scarp into the Gate Mere; the two watch-towers\' sites on the crest (the settlement build\'s); the SW lowlands\' oaks and willows read in place (scale model 5.1, px 638,1212)',
 region:{name:'The Gate-Step (station 1)',x:0,z:0,r:TERR.R},wind:[.6,.8],sky:{px:638,py:1212},atm:1.43,cloud:.6,dust:false,
 fog:{falloff:1/700,sun:.3,sky:.5},climate:{cold:false,dry:false},wet:true,groundN:640,lod:{hero:450},kinLT:600,kinHero:300,   /* the oak leaves were 456k at 440 m (the instance cap is 250k) */
 groundLayers:['grass','moss','redsoil'],   /* three with a map; the litter and the lichen shared (STATION.shareLayers): fifteen units (45) */
 plants:['fern','grass','sedge','moss','begonia','rice'],
 riverLook:[0x3a7a6e,0x163e3a],
 talusPalette:[0x2e2c2e,0x3a3836,0x45403c,0x262426,0x524a44],talusMatrix:0x3a342e,
 sites:STATION.SITES,siteName:'The watch-towers\' sites',
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),ds=Math.max(0,z-S0),de=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  /* north: Terrace I falling to the Giant Country piedmont and the Lake of Shim's plain; south: Terrace II, then the Great Veil and the higher steps;
     east and west: the polygon's bounding ridges */
  return g-dn*.02-120*smooth(3000,9000,dn)+520*smooth(5000,7000,ds)+560*smooth(11000,13000,ds)+1400*smooth(16000,24000,ds)+(de+dw)*.1+260*(.5-Math.abs(2*fbm(x*.0007,z*.0007,412,2)-1))*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[300,650,2300,3300,4200],farLabel:'Greenstep\'s higher terraces and the piedmont past the map',
 build:()=>{STATION.SITES.forEach((S,i)=>{
  /* THE WATCH-TOWERS' SITES (PLAN.md section 6, station 1): core/tags records with their footprints on the crest, published for the settlement build */
  REGISTER({name:S.name+' (site only: the settlement build\'s, PLAN.md)',key:S.key,kind:'site',label:S.name+'\'s site',x:S.x,z:S.z,y:S.y-6,r:S.r,h:40,
   site:{id:'gatestep.watch.'+(i?'e':'w'),type:'watchtower',px:[638,1212],sighted:'Tallhouse (px 683,1184)',footprint:Array.from({length:16},(_,k)=>{const a=k/16*TAU;return[+(S.x+Math.cos(a)*S.r).toFixed(1),+(S.z+Math.sin(a)*S.r).toFixed(1)];}),level:+S.y.toFixed(1)}});});
  /* the gardens: one record for the plots (their KMASK hash is the export's proof that a port paints the same) */
  REGISTER({name:'The Free Giants\' gardens by the Gate Mere (plots on core/mask, '+STATION.PLOTS.hash+')',key:'farm.gatestep',kind:'farm',x:STATION.MERE.x,z:STATION.MERE.z+700,y:STATION.MERE.level-4,r:800,h:30});
  return{watchtowers:STATION.SITES.length,plots:STATION.PLOTS.hash};},
 kin:[
  /* Terrace I and II (Cfa, +19 to +23 degC): the SW lowlands' broadleaves; veil willows round the mere and the gorge's mouth */
  {ref:'swlowlands.sprawloak',key:'sprawloak',name:'Sprawl oak',cell:95,minR:14,accept:Z=>Z.tree*Z.gentle*Z.lower*.45*(1-Z.bank*.6)},
  {ref:'swlowlands.corkoak',key:'corkoak',name:'Cork oak',cell:56,minR:4,accept:Z=>Z.tree*Z.gentle*Z.lower*.22*(1-Z.bank)},
  {ref:'swlowlands.baylaurel',key:'redbay',name:'Red bay',cell:56,minR:4,accept:Z=>Z.tree*Z.lower*.3*(1-Z.bank*.5)},
  {ref:'swlowlands.willow',key:'willow',name:'Veil willow',cell:26,minR:3,overWater:.55,accept:Z=>Z.tree*Z.bank*.5*Z.lower},
  /* OWED: swlowlands.cedar (KNOWN_ISSUES.md) */
  /* the gorge's spray: crozier tree ferns (the S highlands', read in place) */
  {ref:'shigh.crozier',key:'crozier',name:'Crozier tree fern',cell:26,minR:2,accept:Z=>Z.tree*(Z.fog*.4+Z.bank*.12)*smooth(.2,.6,Z.wet+Z.fog)}],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,M=S.MERE,W=S.SITES[0],E=S.SITES[1];
  return{
  'The Gate Falls from the gorge':[S.gorgeX(S.HZ-420),S.cLevel(S.HZ-420)+28,S.HZ-420,S.HX,S.POOL_Y+260,S.HZ+60],
  'The gorge\'s mouth from Terrace I':[S.MX-260,gh(S.MX-260,S.MZ-900,30),S.MZ-900,S.MX,gh(S.MX,S.MZ+200,180),S.MZ+200],
  'The Gate-Scarp from the mere':[M.x-200,M.level+40,M.z-300,M.x+400,gh(M.x+400,S.LIP_Z+100,-60),S.LIP_Z+100],
  'The west watch-tower\'s crest':[W.x-60,W.y+30,W.z+40,M.x,M.level,M.z],
  'Over the gorge from the east tower':[E.x+40,E.y+35,E.z+30,S.gorgeX(S.LIP_Z),S.POOL_Y+80,S.LIP_Z],
  'Oaks on Terrace I':look(P.lower[0]-60,P.lower[1]+40,8,P.lower[0]+60,P.lower[1]-30,6),
  'Willows at the Gate Mere':atTree(nearTree('willow',M.x,M.z),26,2.4,3),
  'From afar':look(-2600,-2900,420,200,600,200)};},
 envPoints:[[0,0],[STATION.MERE.x,STATION.MERE.z-500],[600,-2300],[300,2500]],
 probes:{bed(){const z=-2400,x=STATION.cx(z);return[x,terrainH(x,z)+.2,z];},
  wall(){let b=null,bs=-1;for(let z=STATION.LIP_Z-300;z<=STATION.LIP_Z+200;z+=8){const x=-1200,s=Math.abs(terrainH(x,z+4)-terrainH(x,z-4))/8;if(s>bs){bs=s;b=[x,z];}}return b;}}};
