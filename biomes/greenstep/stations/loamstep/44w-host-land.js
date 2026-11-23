// ================================================================= HOST — STATION 2, the Loam-Step (Terrace II under the Great Veil: the paddies, the cork groves, the tube barn)
// Scale model 5.1 (surveyed 2026-11-09, PLAN.md "Station 3, as built"): Terrace II round px 644,1242 stands at 1,465 m (+19 degC, warm month +32,
// cold +6, 1,396 mm, Cfa); its floor is 1,430-1,490 m from y 1,230 to 1,254, and the Great Veil (riser 2) rises ~480 m to Terrace III at
// y ~1,254-1,257. The page (6 km, x east, z south, the river running north, -z):
//   south    THE GREAT VEIL: riser 2, KRELIEF.stair's lobate front of columnar flows (~480 m), Terrace III's edge over it, and at its prow the
//            TWIN CURTAINS: the Clodosriba and the Western Rille's stream leaping side by side into THE VEIL BASIN (station 3 looks down them)
//   middle   TERRACE II, the black-earth bench falling gently north (.014): the joined Clodosriba crossing it through the Free Giants' WET
//            PADDIES (bunded plots painted on core/mask, read by their exact distance), the stripped-red CORK GROVES and the sprawl oaks
//   west     a LAVA TUBE under the bench (KRELIEF.tube: Terrace II's own flow drained), its roof fallen in a chain of pits; the largest pit is
//            THE TUBE BARN'S SITE, where the draught millipedes are stabled (the settlement build's: a core/tags record, kept clear)
const STATION=(function(){const R=3000,KR=KRAND,W0=KR.hash(1242,644,0,0x6a7f);
 // ------------------------------------------------------------ Terrace II's plain (the stair's lowest step is under it)
 const FOOT_Z=1350,plainII=(x,z)=>1478+.014*(z-FOOT_Z)+6*(fbm(x*.0018,z*.0018,95,2)-.5);
 // ------------------------------------------------------------ the Great Veil (KRELIEF.stair): Terrace III's flows stepping down to Terrace II
 const STAIR=KRELIEF.stair({a:[0,3400],b:[0,-3400],steps:[{y:1962,at:1650},{y:1300,at:7000}],w:3400,lobes:{amp:120,wave:850},slope:77,
  tongues:{per:.3,len:[30,110],w:[40,100]},flows:[10,26],riser:.32,colonnade:.48,wrinkle:1.2,seed:KR.hash(W0,1,0,0x51)});
 const LIP0=3400-1650;
 const g0=(x,z)=>Math.max(plainII(x,z),KRELIEF.shape(STAIR,x,z,-1e9));
 const T3Y=1962;
 const lipAt=x=>{let lo=LIP0-500,hi=LIP0+500;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(g0(x,m)>T3Y-20)hi=m;else lo=m;}return hi;};
 // ------------------------------------------------------------ the twin curtains and the basin under them
 const XC=170,XW=-210,ZLC=lipAt(XC),ZLW=lipAt(XW);
 const POOL={x:-20,z:Math.min(ZLC,ZLW)-330,r:170};
 const BASIN=plainII(POOL.x,POOL.z-POOL.r)-6;
 // ------------------------------------------------------------ the tube under the bench (KRELIEF.tube): its pits; the barn in the largest
 const TUBE=KRELIEF.tube({pts:KRELIEF.meander([-1500,1150],[-1050,-2900],{amp:160,wave:1300,step:25,seed:KR.hash(W0,4,0,0x54)}),ground:g0,r:17,roof:7,ridge:1.4,every:150,p:.55,sky:0,seed:KR.hash(W0,5,0,0x55)});
 const BARN=TUBE.pits.filter(Boolean).filter(q=>q.z<FOOT_Z-500&&q.z>-2500).reduce((a,q)=>!a||q.r>a.r?q:a,null);
 const ground1=(x,z)=>KRELIEF.shape(TUBE,x,z,g0(x,z));
 // ------------------------------------------------------------ the rivers: above the lips on Terrace III, and the joined river from the basin north
 const cxUp=z=>XC+(z-ZLC)*.22+30*Math.sin((z-ZLC)*.004)*smooth(0,200,z-ZLC);
 const wxUp=z=>XW-(z-ZLW)*.3-25*Math.sin((z-ZLW)*.0045)*smooth(0,200,z-ZLW);
 const cxLo=z=>POOL.x+150*Math.sin((POOL.z-z)*.0013)*smooth(0,300,POOL.z-z)+40*Math.sin((POOL.z-z)*.0051);
 const C_LIP=T3Y-2.2,W_LIP=T3Y-2.8;
 const upLevel=(z,zl,lip)=>lip+(z-zl)*.004;
 const loLevel=z=>z>POOL.z-POOL.r?BASIN:BASIN-1-(POOL.z-POOL.r-z)*.0145;   /* a little steeper than the plain (.014): in its channel, never perched */
 const OUT_Z=POOL.z-POOL.r*.85;
 // ------------------------------------------------------------ the paddies (core/mask): bunded plots either side of the river, and the cork groves past them
 const PLOTS=maskField((g,P)=>{for(let k=0;k<70;k++){const h=KR.hash(W0,60+k,0,0x6b1),u=q=>KR.unit(KR.hash(h,q,0,0x6b2));
   const z0=-2700+u(1)*2600,side=u(2)<.5?-1:1,off=60+u(3)*700,x0=cxLo(z0)+side*off,a=(u(4)-.5)*.35,L=40+55*u(5),Wd=28+40*u(6),ca=Math.cos(a),sa=Math.sin(a);
   if(Math.hypot(x0-BARN.x,z0-BARN.z)<220||Math.abs(x0-cxLo(z0))<55)continue;
   P.poly([[-L,-Wd],[L,-Wd],[L,Wd],[-L,Wd]].map(q=>[x0+q[0]*ca-q[1]*sa,z0+q[0]*sa+q[1]*ca]));}},{R,n:1024});
 const barnK=(x,z)=>BARN?smooth(BARN.r*1.25,BARN.r*.9,Math.hypot(x-BARN.x,z-BARN.z)):0;
 function ground(x,z){let h=ground1(x,z);
  // THE CLODOSRIBA above its lip, the Western Rille's stream above its own, and the joined river from the basin north
  if(z>ZLC-6){const q=Math.abs(x-cxUp(z)),lv=upLevel(z,ZLC,C_LIP),hw=14;if(q<hw*3.2){h=q<hw?Math.min(h,lv-2.6+(q/hw)*2.2):mix(h,Math.min(h,lv+.7+(q-hw)*.3),smooth(hw*3.2,hw,q));}}
  if(z>ZLW-6){const q=Math.abs(x-wxUp(z)),lv=upLevel(z,ZLW,W_LIP),hw=9;if(q<hw*3.2){h=q<hw?Math.min(h,lv-2.2+(q/hw)*1.8):mix(h,Math.min(h,lv+.6+(q-hw)*.3),smooth(hw*3.2,hw,q));}}
  if(z<OUT_Z+20){const q=Math.abs(x-cxLo(z)),lv=loLevel(z),hw=22;if(q<hw*3.2){h=q<hw?Math.min(h,lv-3+(q/hw)*2.6):mix(h,Math.min(h,lv+.7+(q-hw)*.3),smooth(hw*3.2,hw,q));}}
  // the plunge basin
  {const d=Math.hypot(x-POOL.x,(z-POOL.z)*1.15);if(d<POOL.r*1.5){const bed=BASIN-10*smooth(POOL.r,0,d);h=Math.min(h,d<POOL.r?bed:mix(bed,h,smooth(POOL.r,POOL.r*1.5,d)));}}
  // the paddies: each plot levelled and sunk 0.4 m inside its bund (0.5 m), so the water would stand in it
  {const s=PLOTS(x,z);if(s<10){h+=-.4*smooth(3,-4,s)+.5*smooth(3.5,0,Math.abs(s));}}
  return h+2.5*(fbm(x*.015,z*.015,96,2)-.5)*smooth(.2,.05,Math.abs(h-g0(x,z))/50);}
 // ------------------------------------------------------------ the water's lines
 const cPts=[];for(let z=3300;z>=ZLC+2;z-=15)cPts.push([cxUp(z),z,upLevel(z,ZLC,C_LIP)]);cPts.push([cxUp(ZLC),ZLC-3,C_LIP]);
 const wPts=[];for(let z=3300;z>=ZLW+2;z-=15)wPts.push([wxUp(z),z,upLevel(z,ZLW,W_LIP)]);wPts.push([wxUp(ZLW),ZLW-3,W_LIP]);
 const lPts=[];for(let z=OUT_Z;z>=-3300;z-=15)lPts.push([cxLo(z),z,loLevel(z)]);
 const poolPoly=Array.from({length:40},(_,k)=>{const a=k/40*TAU;return[POOL.x+Math.cos(a)*POOL.r*1.02,POOL.z+Math.sin(a)*POOL.r/1.15*1.02];});
 const fall=(name,x,zl,y,pr)=>({name,lip:[[x-22,zl,y+.3],[x+22,zl,y+.3]],dir:[0,-1],drop:y-BASIN,foot:[x*.8+POOL.x*.2,zl-150,BASIN],plungeR:pr});
 const falls=[fall('The Great Veil: the Clodosriba\'s curtain',cxUp(ZLC),ZLC,C_LIP,70),fall('The Great Veil: the Western Rille\'s curtain',wxUp(ZLW),ZLW,W_LIP,55)];
 const L=stepLand({R,ground,
  lakes:[{name:'The Veil Basin (the Great Veil\'s plunge pool)',kind:'deep',level:BASIN,poly:poolPoly,area:1}],
  rivers:[{pts:cPts,width:28,half:()=>14,name:'Clodosriba (on Terrace III)',speed:2.4},{pts:wPts,width:18,half:()=>9,name:'The Western Rille\'s stream (Da-Holwey)',speed:1.8},
   {pts:lPts,width:44,half:()=>22,name:'Clodosriba (below the Great Veil)',speed:1.8}],
  falls,
  tm:(x,z,h)=>19-6.5*(h-1465)/1000,                                     /* the model's +19 degC on Terrace II */
  wet:(x,z,h)=>.6,                                                       /* 1,396 mm */
  fog:(x,z,h)=>.85*smooth(700,120,Math.hypot(x-POOL.x,z-POOL.z)),         /* the falls' spray over the basin and the nearest paddies */
  farm:(x,z)=>smooth(6,-8,PLOTS(x,z)),
  site:barnK,
  rockAt:(x,z,h,sl)=>smooth(.5,.82,sl),
  strataK:(x,z,h,sl)=>smooth(.45,.8,sl),
  talus:(x,z)=>{const p=KRELIEF.at(STAIR,x,z);return p&&p.part!=='top'&&z<LIP0?.6:0;},
  strata:BIO.strata({recipe:'tibasalt-ponded',seed:7102,range:[1200,2200],res:.5,private:true}),
  spine:[[0,POOL.z-500],[POOL.x,POOL.z-200],[BARN.x+120,BARN.z],[cxLo(-900)+250,-900],[cxLo(-1800)-300,-1800],[700,-400],[-900,600],[XC+100,ZLC+300],[1500,-2200],[-2000,-1500],[1600,800]]});
 Object.assign(L,{shareLayers:{leafy:'grass',lichen:'moss'},STAIR,TUBE,BARN,PLOTS,POOL,BASIN,XC,XW,ZLC,ZLW,LIP0,T3Y,cxUp,wxUp,cxLo,loLevel,lipAt});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVERS_SPEC=STATION.RIVERS_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Loam-Step (greenstep station 2)',station:'loamstep',title:'Krator biome — Greenstep: the Loam-Step under the Great Veil',
 hint:'Station 2 of Greenstep: Terrace II under the Great Veil, the twin curtains into the Veil Basin, the Free Giants\' wet paddies and cork groves, a lava tube\'s fallen pits and the tube barn\'s site (the settlement build\'s); the SW lowlands\' oaks read in place (scale model 5.1, px 644,1242)',
 region:{name:'The Loam-Step (station 2)',x:0,z:0,r:TERR.R},wind:[.6,.8],sky:{px:644,py:1242},atm:1.34,cloud:.6,dust:false,
 fog:{falloff:1/650,sun:.3,sky:.5},climate:{cold:false,dry:false},wet:true,groundN:720,lod:{hero:450},kinLT:600,kinHero:340,   /* the oak leaves (sprawl and cork oaks share them) were 397k at 440 m with the groves at cell 36: the instance cap is 250k */
 groundLayers:['grass','moss','redsoil'],   /* three with a map; the litter and the lichen shared (STATION.shareLayers): fifteen units (45) */
 plants:['fern','grass','sedge','moss','begonia','rice'],
 riverLook:[0x3a7a6e,0x163e3a],
 talusPalette:[0x2e2c2e,0x3a3836,0x45403c,0x262426,0x524a44],talusMatrix:0x3a342e,
 site:STATION.BARN?{x:STATION.BARN.x,z:STATION.BARN.z,r:STATION.BARN.r,ez:1,y:STATION.BARN.y}:null,siteName:'The tube barn\'s pit',
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),ds=Math.max(0,z-S0),de=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  /* north: Terrace II, then riser 1 down to Terrace I; south: Terrace III, the Upper Citadel Scarp and Terrace IV; east and west: the ridges */
  return g-dn*.014-560*smooth(4000,5500,dn)+ds*.03+580*smooth(5000,7000,ds)+600*smooth(11000,13000,ds)+1400*smooth(16000,24000,ds)+(de+dw)*.1+260*(.5-Math.abs(2*fbm(x*.0007,z*.0007,412,2)-1))*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[300,650,2300,3300,4200],farLabel:'Greenstep\'s other terraces and the Outer Wall past the map',
 build:()=>{const B=STATION.BARN;
  /* THE TUBE BARN'S SITE (PLAN.md section 6, station 2): a core/tags record in the largest collapse pit of the tube under Terrace II */
  if(B)REGISTER({name:'The tube barn (the draught millipedes\' stable): site only, the settlement build\'s (PLAN.md)',key:'site.tubebarn',kind:'site',label:'The tube barn\'s site',x:B.x,z:B.z,y:B.y-4,r:B.r,h:40,
   site:{id:'loamstep.tubebarn',type:'barn',px:[644,1242],pit:{r:+B.r.toFixed(1),floor:+B.y.toFixed(1)},tube:{r:STATION.TUBE.r,roof:STATION.TUBE.roof},footprint:Array.from({length:16},(_,k)=>{const a=k/16*TAU;return[+(B.x+Math.cos(a)*B.r).toFixed(1),+(B.z+Math.sin(a)*B.r).toFixed(1)];}),level:+B.y.toFixed(1)}});
  /* the tube's line (its passage, for a later station's KCAVERN) and the paddies (their KMASK hash) */
  REGISTER({name:'A lava tube under Terrace II, its roof fallen in '+STATION.TUBE.pits.filter(Boolean).length+' pits (KRELIEF.tube)',key:'tube.loamstep',kind:'feature',x:-1270,z:-900,y:terrainH(-1270,-900)-40,r:2100,h:60});
  REGISTER({name:'The Free Giants\' wet paddies (plots on core/mask, '+STATION.PLOTS.hash+')',key:'farm.loamstep',kind:'farm',x:STATION.cxLo(-1300),z:-1300,y:terrainH(STATION.cxLo(-1300),-1300)-25,r:1500,h:60});
  return{tubebarn:B?1:0,pits:STATION.TUBE.pits.filter(Boolean).length,plots:STATION.PLOTS.hash};},
 kin:[
  /* Terrace II (Cfa, +19 degC): the SW lowlands' broadleaves, the cork groves thickest off the paddies, veil willows at the water */
  {ref:'swlowlands.sprawloak',key:'sprawloak',name:'Sprawl oak',cell:100,minR:14,accept:Z=>Z.tree*Z.gentle*Z.lower*.5*(1-Z.bank*.6)},
  {ref:'swlowlands.corkoak',key:'corkoak',name:'Cork oak',cell:48,minR:4,accept:(Z,x,z)=>Z.tree*Z.gentle*Z.lower*.5*(1-Z.bank)*smooth(.38,.55,fbm(x*.0011,z*.0011,97,2))},
  {ref:'swlowlands.baylaurel',key:'redbay',name:'Red bay',cell:60,minR:4,accept:Z=>Z.tree*Z.lower*.22*(1-Z.bank*.5)},
  {ref:'swlowlands.willow',key:'willow',name:'Veil willow',cell:26,minR:3,overWater:.55,accept:Z=>Z.tree*Z.bank*.5*Z.lower},
  /* the spray: crozier tree ferns (the S highlands', read in place); Terrace III's spiral flora at the lips */
  {ref:'shigh.crozier',key:'crozier',name:'Crozier tree fern',cell:26,minR:2,accept:Z=>Z.tree*(Z.fog*.3+Z.bank*.12)*smooth(.2,.6,Z.wet+Z.fog)},
  {ref:'shigh.coilbark',key:'coilbark',name:'Coilbark',cell:40,minR:3,accept:Z=>Z.tree*Z.gentle*Z.spiral*.35}],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,Pz=S.POOL,B=S.BARN;
  return{
  'The Great Veil over the paddies':[S.cxLo(-1100)+220,gh(S.cxLo(-1100)+220,-1100,40),-1100,0,S.BASIN+300,S.ZLC],
  'The twin curtains from the basin':[Pz.x-60,gh(Pz.x-60,Pz.z-460,4)+30,Pz.z-460,0,S.BASIN+230,S.ZLC],
  'The paddies':look(P.farm[0]-90,P.farm[1]-120,34,P.farm[0]+80,P.farm[1]+60,0),
  'The tube barn\'s pit':[B.x+60,gh(B.x+60,B.z+50,22),B.z+50,B.x,B.y,B.z],
  'Cork groves':atTree(nearTree('corkoak',-500,-1200),30,2.4,3),
  'Oaks on Terrace II':look(P.lower[0]-90,P.lower[1]+70,22,P.lower[0]+60,P.lower[1]-30,6),
  'From afar':look(-2600,-2900,420,200,600,300)};},
 envPoints:[[0,0],[-900,400],[600,-2300],[300,2500]],
 probes:{bed(){const z=-2400,x=STATION.cxLo(z);return[x,terrainH(x,z)+.2,z];},
  wall(){let b=null,bs=-1;for(let z=STATION.LIP0-400;z<=STATION.LIP0+100;z+=8){const x=1200,s=Math.abs(terrainH(x,z+4)-terrainH(x,z-4))/8;if(s>bs){bs=s;b=[x,z];}}return b;}}};
