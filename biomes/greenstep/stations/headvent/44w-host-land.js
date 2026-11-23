// ================================================================= HOST — STATION 6, the Fissure Shield (Terrace V: the warm crater bog, the Clodosriba's source, the Headwall Falls)
// Scale model 5.1 (surveyed 2026-11-09, PLAN.md "Station 3, as built"): the shield's warm crater floor is at px 668,1338, 3,280 m (+7 degC, warm
// month +20, cold -6, 769 mm; the plan's 668,1344 is 4,656 m, over its rim: the station stands at 668,1338, as the plan's notes say); the rim
// is ~3,420 m. The Clodosriba's record starts here (3,280 m). The page (4.8 km, x east, z south, the river running north, -z):
//   south    THE OUTER WALL'S HEADSCARP (KRELIEF.range): the Mist-Wall amphitheatre's back, ~1,100 m of it on the page; THE HEADWALL FALLS, two
//            spring lines breaking from its face, into the Mist-Wall fen at its foot (a peat tarn) and a pool
//   middle   THE GREENSTEP FISSURE SHIELD (KRELIEF.volcano: a low shield, its rim ~3,420 m), its crater's floor a warm iron-red bog at 3,280 m
//            round a tarn (the Clodosriba's source) and hot springs (core/water/geyser: WATER.spring); the fissure that fed the five terrace
//            flows crossing it as a low spatter rampart with spatter cones, warm along its cleft. THE WARM GROUND is KTHERM's: fumaroles on
//            the crater floor, the fissure a line vent, the cones; the zones read it (the geo field: fumarole moss, the rosettes thickest there)
//   north    the Clodosriba out through the rim's northern breach, down the shield's flank in a gorge and across TERRACE V to the lip of RISER 4
//            (the Mist-Curtain Scarp, KRELIEF.stair): it leaps toward Terrace IV (station 5 looks up it)
const STATION=(function(){const R=2400,KR=KRAND,W0=KR.hash(1338,668,0,0x6a82);
 // ------------------------------------------------------------ Terrace V's plain rising south; riser 4 (KRELIEF.stair) at the north edge
 const LIPZ=-1900,plainV=(x,z)=>3180+.03*(z-LIPZ)+5*(fbm(x*.0016,z*.0016,111,2)-.5);
 const STAIR=KRELIEF.stair({a:[0,2600],b:[0,-2600],steps:[{y:3180,at:2600-LIPZ},{y:2585,at:9000}],w:2600,lobes:{amp:110,wave:800},slope:74,
  tongues:{per:.35,len:[30,110],w:[40,100]},flows:[8,22],riser:.36,colonnade:.45,wrinkle:1.4,seed:KR.hash(W0,1,0,0x51)});
 // ------------------------------------------------------------ the shield (KRELIEF.volcano) and its crater, the fissure and its spatter cones, the headscarp (KRELIEF.range)
 const SC={x:0,z:300},SHIELD=KRELIEF.volcano({c:[SC.x,SC.z],h:290,r:1800,k:1.6,crater:{r:430,d:190},gullies:9,gully:.05,seed:KR.hash(W0,2,0,0x52)});
 const FLOOR=3280,CR=430;
 const FIS=[[-420,-1150],[-140,-300],[90,560],[380,1500]];   /* the fissure's line, NNW-SSE across the shield */
 const RAMP=KRELIEF.range({a:FIS[0],b:FIS[3],h:13,w:34,crest:.6,toe:.25,serr:.45,seed:KR.hash(W0,3,0,0x53)});
 const CONES=[[-330,-880,24,70],[-60,-40,0,0],[230,1010,30,80],[330,1340,18,55]].filter(c=>c[2]>0).map(c=>({x:c[0],z:c[1],f:KRELIEF.volcano({c:[c[0],c[1]],h:c[2],r:c[3],k:2.4,crater:{r:c[3]*.2,d:c[2]*.35},gullies:0,seed:KR.hash(W0,4,c[0]|0,0x54)})}));
 const HEAD=KRELIEF.range({a:[-4200,2620],b:[4200,2900],h:1300,w:1400,crest:.35,toe:.18,serr:.08,seed:KR.hash(W0,5,0,0x55)});
 const fisQ=(x,z)=>{let b=1e9;for(let i=0;i<FIS.length-1;i++){const a=FIS[i],c=FIS[i+1],dx=c[0]-a[0],dz=c[1]-a[1],u=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);b=Math.min(b,Math.hypot(x-a[0]-dx*u,z-a[1]-dz*u));}return b;};
 const inCrater=(x,z)=>smooth(CR*.95,CR*.75,Math.hypot(x-SC.x,z-SC.z));
 function base(x,z){let h=plainV(x,z)+SHIELD(x,z)+HEAD(x,z);
  const cd=Math.hypot(x-SC.x,z-SC.z);if(cd<CR)h=Math.max(h,FLOOR+.3*(fbm(x*.02,z*.02,112,2)-.5));   /* the crater's floor: a flat bog */
  const ic=inCrater(x,z);h+=RAMP(x,z)*(1-ic);for(const c of CONES)h+=c.f(x,z)*(1-ic);
  const fq=fisQ(x,z);if(fq<4&&ic<.5)h-=7*smooth(4,0,fq)*(1-ic);   /* the fissure's cleft along the rampart's crest */
  return h-3000*smooth(LIPZ+140,LIPZ-80,z);}                         /* north of riser 4's lip the stair is the ground */
 const g0=(x,z)=>Math.max(KRELIEF.shape(STAIR,x,z,-1e9),base(x,z));
 // ------------------------------------------------------------ the water: the crater tarn, the Clodosriba north through the breach, the Headwall Falls and the fen
 const TARN={x:SC.x+40,z:SC.z+30,level:FLOOR-.45};
 const cxN=z=>SC.x+60*Math.sin((SC.z-z)*.0024)*smooth(SC.z-CR,SC.z-CR-300,z)+30*Math.sin(z*.006);
 const BR_Z=SC.z-CR+20;   /* the breach: the river leaves the crater here */
 const RIVER_DROP=.04,riverLv=(x,z)=>Math.min(TARN.level-.3-RIVER_DROP*Math.max(0,BR_Z+120-z),plainV(x,z)-3.2);
 const lipAtX=x=>{let lo=LIPZ-300,hi=LIPZ+300;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(g0(x,m)>3165)hi=m;else lo=m;}return hi;};
 const ZL=lipAtX(cxN(LIPZ)),POOL4={x:cxN(ZL)+10,z:ZL-260,r:45,level:2582};
 const FEN={x:-880,z:1330,r:150},FALLS_X=[-880,1150];
 const footAt=x=>{let lo=600,hi=2400;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(HEAD(x,m)>25)hi=m;else lo=m;}return lo;};
 const HF=FALLS_X.map((x,i)=>{const zf=footAt(x),zl=zf+330,yl=g0(x,zl);return{x,zf,zl,yl,foot:i?{x:x,z:zf-40,r:30}:FEN};});
 FEN.level=plainV(FEN.x,FEN.z)+SHIELD(FEN.x,FEN.z)-3.5;HF[1].foot.level=g0(HF[1].x,HF[1].foot.z)-2.5;
 // KTHERM: the shield's warm ground (fumaroles on the crater floor, the fissure a line vent, the cones)
 const FUM=[[-120,240],[150,380],[-40,470],[200,180],[-190,420]].map(([x,z],k)=>({id:'fumarole'+k,kind:'point',x:SC.x+x*.9,z:SC.z+(z-300)*.9,T:88,reach:130,decay:3}));
 const THERM=KTHERM.create({soil:6,world:W0,detail:{amp:1.2,scale:.02,seed:KR.hash(W0,6,0,0x56)},
  vents:FUM.concat([{id:'fissure',kind:'line',pts:FIS,T:34,reach:40,decay:2}],CONES.map((c,k)=>({id:'cone'+k,kind:'point',x:c.x,z:c.z,T:48,reach:70,decay:2.5})))});
 const SPRINGS=[[-150,250,9,.75,'iron'],[170,390,7,.6,'iron'],[-60,480,6,.5,'sulfur']].map(([x,z,r,t,m],k)=>({key:'gstep-spring'+k,x:SC.x+x*.9,z:SC.z+(z-300)*.9,r,temp:t,mineral:m,level:FLOOR-.2}));
 function ground(x,z){let h=g0(x,z);
  // the crater tarn's hollow (a peat bog: shallow), the hot springs' basins
  {const d=blobD(x,z,TARN.x,TARN.z,120,3);if(d<1.4)h=Math.min(h,mix(TARN.level-2.2,h,smooth(.85,1.4,d)));}
  for(const s of SPRINGS){const d=Math.hypot(x-s.x,z-s.z);if(d<s.r*1.3)h=Math.min(h,mix(s.level-1.4,h+.15,smooth(s.r*.55,s.r*1.08,d)));}   /* the basin's lip crosses the level just inside the disc's rim */
  // THE CLODOSRIBA: out of the tarn through the northern breach (a gorge down the shield's flank, steep-banked), across Terrace V to the lip
  if(z<TARN.z-60&&z>ZL-6){const c=cxN(z),q=Math.abs(x-c),lv=riverLv(c,z),hw=9;if(q<160)h=Math.min(h,q<hw?lv-2.2+(q/hw)*1.8:lv+.6+(q-hw)*mix(1.1,.3,smooth(lv+8,lv+2,h)));}
  // the plunge pool on Terrace IV under riser 4
  {const d=Math.hypot(x-POOL4.x,z-POOL4.z);if(d<POOL4.r*1.5){const bed=POOL4.level-6*smooth(POOL4.r,0,d);h=Math.min(h,d<POOL4.r?bed:mix(bed,h,smooth(POOL4.r,POOL4.r*1.5,d)));}}
  // the Mist-Wall fen and the second fall's pool at the headscarp's foot
  for(const P of [FEN,HF[1].foot]){const d=blobD(x,z,P.x,P.z,P.r,P===FEN?5:6);if(d<1.5)h=Math.min(h,mix(P.level-2.5,h,smooth(.85,1.5,d)));}
  return h;}
 // ------------------------------------------------------------ the water's lines
 const nPts=[];for(let z=TARN.z-70;z>=ZL+2;z-=12){const c=cxN(z);nPts.push([c,z,riverLv(c,z)]);}nPts.push([cxN(ZL),ZL-3,riverLv(cxN(ZL),ZL+3)]);
 const disc=(X,Z,r,n)=>Array.from({length:n||32},(_,k)=>{const a=k/(n||32)*TAU;return[X+Math.cos(a)*r,Z+Math.sin(a)*r];});
 const blobPoly=(P,i)=>Array.from({length:40},(_,k)=>{const a=k/40*TAU;let lo=0,hi=P.r*1.5;for(let t=0;t<20;t++){const m=(lo+hi)/2;if(blobD(P.x+Math.cos(a)*m,P.z+Math.sin(a)*m,P.x,P.z,P.r,i)<.9)lo=m;else hi=m;}return[P.x+Math.cos(a)*lo,P.z+Math.sin(a)*lo];});
 const falls=[{name:'The Mist-Curtain Scarp: the Clodosriba off Terrace V',lip:[[cxN(ZL)-10,ZL,riverLv(cxN(ZL),ZL+3)+.3],[cxN(ZL)+10,ZL,riverLv(cxN(ZL),ZL+3)+.3]],dir:[0,-1],drop:riverLv(cxN(ZL),ZL+3)-POOL4.level,foot:[POOL4.x,POOL4.z+25,POOL4.level],plungeR:36}]
  .concat(HF.map((f,i)=>({name:'The Headwall Falls'+(i?' (the east spring line)':' (the west spring line, into the Mist-Wall fen)'),lip:[[f.x-6,f.zl,f.yl-.6],[f.x+6,f.zl,f.yl-.6]],dir:[0,-1],drop:f.yl-.6-f.foot.level,foot:[f.foot.x,f.foot.z+f.foot.r*.4,f.foot.level],plungeR:i?18:24})));
 const L=stepLand({R,ground,
  lakes:[{name:'The crater tarn (the Clodosriba\'s warm source, an iron-red bog round it)',kind:'peat',level:TARN.level,poly:blobPoly({x:TARN.x,z:TARN.z,r:120},3),area:2},
   {name:'The Mist-Wall fen (under the Headwall Falls)',kind:'peat',level:FEN.level,poly:blobPoly(FEN,5),area:1.5},
   {name:'The east Headwall Fall\'s pool',kind:'deep',level:HF[1].foot.level,poly:blobPoly(HF[1].foot,6),area:.5},
   {name:'The Mist-Curtain\'s head pool (on Terrace IV)',kind:'deep',level:POOL4.level,poly:disc(POOL4.x,POOL4.z,POOL4.r*1.02),area:1}],
  pools:SPRINGS,
  rivers:[{pts:nPts,width:18,half:()=>9,name:'Clodosriba (from its source to the Mist-Curtain Scarp)',speed:2}],
  falls,
  tm:(x,z,h)=>7-6.5*(h-3280)/1000,                                      /* the model's +7 degC on the crater floor */
  wet:(x,z,h)=>.55+.25*smooth(200,40,Math.hypot(x-TARN.x,z-TARN.z)-100), /* 769 mm; the bog */
  fog:(x,z,h)=>Math.max(.5*smooth(1600,2300,z),.9*smooth(8,30,THERM.heatAt(x,z)-6)*inCrater(x,z),.55*smooth(220,40,Math.hypot(x-FEN.x,z-FEN.z))),   /* the Mist-Wall's cloud; the crater's steam */
  geo:(x,z,h)=>smooth(1,28,THERM.heatAt(x,z)-6),
  rockAt:(x,z,h,sl)=>Math.max(smooth(.5,.82,sl),smooth(4,0,fisQ(x,z))*.7),
  strataK:(x,z,h,sl)=>smooth(.45,.8,sl),
  talus:(x,z)=>{const p=KRELIEF.at(STAIR,x,z);return p&&p.part!=='top'&&z<LIPZ?.5:smooth(25,140,HEAD(x,z))*smooth(500,150,HEAD(x,z))*.8;},
  strata:BIO.strata({recipe:'tibasalt-ponded',seed:7106,range:[2500,4800],res:.5,private:true}),
  spine:[[TARN.x,TARN.z-80],[SC.x-260,SC.z+120],[SC.x+300,SC.z-250],[cxN(-600)+80,-600],[cxN(ZL+200)-60,ZL+200],[FEN.x+120,FEN.z-200],[HF[1].x,HF[1].zf-200],[-1300,-500],[1300,-200],[0,-1500],[-1500,800],[1500,900]]});
 Object.assign(L,{shareLayers:{leafy:'grass',lichen:'moss'},STAIR,SHIELD,SC,CR,FLOOR,TARN,FEN,HF,FIS,CONES,THERM,SPRINGS,POOL4,ZL,LIPZ,cxN,riverLv,inCrater});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVERS_SPEC=STATION.RIVERS_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Fissure Shield (greenstep station 6)',station:'headvent',title:'Krator biome — Greenstep: the Fissure Shield and the Headwall Falls',
 hint:'Station 6 of Greenstep: Terrace V, the fissure shield whose flows made the five terraces, its warm crater bog and hot springs (the Clodosriba\'s source; KTHERM, core/water/geyser), the spatter fissure, the Headwall Falls off the Outer Wall\'s headscarp, the S highlands\' paramo rosettes read in place (scale model 5.1, px 668,1338)',
 region:{name:'The Fissure Shield (station 6)',x:0,z:0,r:TERR.R},wind:[.6,.8],sky:{px:668,py:1338},atm:1.05,cloud:.7,dust:false,
 fog:{falloff:1/500,sun:.3,sky:.5},climate:{cold:false,dry:false},wet:true,groundN:640,lod:{hero:450},kinLT:600,kinHero:420,
 groundLayers:['grass','moss','redsoil'],   /* three with a map; the litter and the lichen shared (STATION.shareLayers): fifteen units (45) */
 plants:['fern','grass','sedge','moss'],
 riverLook:[0x4a6a5a,0x22322a],lakeLook:{deep:[0x3a2416],shallow:0x6a4428},   /* the tarn: peat-brown over the bog's iron-red */
 talusPalette:[0x2e2c2e,0x3a3836,0x45403c,0x262426,0x524a44],talusMatrix:0x3a342e,
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),ds=Math.max(0,z-S0),de=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  /* north: riser 4 and Terrace IV, the lower steps beyond; south: the Outer Wall's crest past the headscarp; east and west: the amphitheatre's arms */
  return g-dn*.02-560*smooth(3000,4500,dn)-580*smooth(7000,9000,dn)+ds*.12+400*smooth(1500,4000,ds)+(de+dw)*.18+300*(.5-Math.abs(2*fbm(x*.0007,z*.0007,412,2)-1))*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[300,650,2300,3300,4200],farLabel:'Greenstep\'s lower terraces and the Outer Wall past the map',
 build:()=>{const S=STATION;
  REGISTER({name:'The Greenstep Fissure Shield\'s crater (the warm bog, 3,280 m: KTHERM\'s fumaroles)',therm:S.THERM.export({box:[S.SC.x-S.CR,S.SC.z-S.CR,S.SC.x+S.CR,S.SC.z+S.CR],cell:40}),key:'feature.crater',kind:'feature',x:S.SC.x,z:S.SC.z,y:S.FLOOR-6,r:S.CR,h:160});
  REGISTER({name:'The fissure (the five terrace flows\' vent): a spatter rampart, warm along its cleft',key:'feature.fissure',kind:'feature',x:0,z:180,y:terrainH(0,180)-30,r:1500,h:80});
  return{springs:S.SPRINGS.length,vents:S.THERM.export({box:[-100,-100,100,100],cell:50}).vents.length};},
 kin:[
  /* Terrace V and the shield (Dfc/ET, ~7 degC): the S highlands' paramo; the rosettes thickest on the warm ground (KTHERM's geo field) */
  {ref:'shigh.ruffle',key:'ruffle',name:'Ruffle-crown',cell:30,minR:2.5,accept:Z=>Z.tree*Z.gentle*Z.paramo*(.22+.5*Z.warm)},
  {ref:'shigh.groundsel',key:'groundsel',name:'Giant groundsel',cell:28,minR:1.5,accept:Z=>Z.tree*Z.paramo*(.35+.2*Z.wet)},
  {ref:'shigh.lobelia',key:'lobelia',name:'Spiral lobelia',cell:26,minR:1,accept:Z=>Z.tree*Z.paramo*.3*(1-Z.bank*.5)},
  /* not the spiral aloe: a rosette under a metre has no far form, so 12,788 of the first run's 18,313 drew nothing (empty registered volumes); it
     belongs on a floor pass, not a kin row (KNOWN_ISSUES.md) */
  /* the warm crater: tree ferns in the steam (the S highlands' crozier, read in place) */
  {ref:'shigh.crozier',key:'crozier',name:'Crozier tree fern',cell:18,minR:2,accept:Z=>Z.tree*Z.warm*.45*smooth(.2,.6,Z.wet+Z.fog)}],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,T=S.TARN,F=S.FEN,h1=S.HF[1];
  return{
  'The crater bog from the rim':[S.SC.x-S.CR*.8,Math.max(gh(S.SC.x-S.CR*.8,S.SC.z+80,40),S.FLOOR+200),S.SC.z+80,T.x+60,T.level,T.z-20],
  'The hot springs':[S.SPRINGS[0].x-40,S.FLOOR+12,S.SPRINGS[0].z-30,S.SPRINGS[0].x,S.FLOOR,S.SPRINGS[0].z],
  'The Headwall Falls over the fen':[F.x+220,gh(F.x+220,F.z-420,14),F.z-420,F.x,F.level+250,F.z+200],
  'The fissure\'s spatter cones':(()=>{const c=S.CONES[0];return[c.x-160,gh(c.x-160,c.z-120,10),c.z-120,c.x,gh(c.x,c.z,10),c.z];})(),
  'The Clodosriba at the Mist-Curtain\'s lip':[S.cxN(S.ZL+90)+40,gh(S.cxN(S.ZL+90)+40,S.ZL+90,6),S.ZL+90,S.POOL4.x,S.POOL4.level+80,S.POOL4.z-200],
  'Ruffle-crowns on the warm rim':atTree(nearTree('ruffle',S.SC.x+S.CR*.6,S.SC.z),16,2.4,2),
  'From afar':look(-1900,-2200,420,0,500,200)};},
 envPoints:[[0,0],[-900,-300],[600,-1500],[300,1000]],
 probes:{bed(){const z=-1200,x=STATION.cxN(z);return[x,terrainH(x,z)+.2,z];},
  wall(){let b=null,bs=-1;for(let z=STATION.LIPZ-250;z<=STATION.LIPZ+50;z+=6){const x=1300,s=Math.abs(terrainH(x,z+3)-terrainH(x,z-3))/6;if(s>bs){bs=s;b=[x,z];}}return b;}}};
