// ================================================================= HOST — STATION 4, the tree line, the tundra and the glaciers (PLAN-STATIONS.md; the final rebuild, 2026-11-02)
// Scale model 5.1 at px 1374,623 (old canvas 1102,293): ET at 4,782 m with Dfc forest below it within 30 km, 267 mm, +1 degC (14/-12), 2.1 km of
// relief within 30 km; the airless rim's wall stands east of the polygon. The page compresses the band into 6 km, rising east:
//   west          THE TREE LINE: the last spruce-fir, then krummholz spruce and bristlecones on the wind-cut ground
//   the middle    THE TUNDRA: cushions and moss, patterned ground (KGROUND's polygon kind: sorted stone nets on the flats), granite tors
//   east          A VALLEY GLACIER coming down from the rim in its U valley (host ice: the ground drawn as ice and firn, nothing roots on it), its
//                 lateral and terminal moraines (boulder fields the placement reads), and THE PROGLACIAL LAKE the end moraine dams, milky
//                 turquoise with rock flour; the airless rim's wall past the map (the far field)
const STATION=(function(){const R=3000;
 const glZ=x=>120*Math.sin(x*.0011+.5)+40*Math.sin(x*.004);
 const SNOUT=900,Wg=x=>210+70*smooth(SNOUT,3000,x);   /* the glacier's half-width */
 const ridge=(x,z,f,s)=>1-Math.abs(2*fbm(x*f,z*f,s,2)-1);
 const base=(x,z)=>{const xm=x+120*Math.sin(z*.0013)+40*Math.sin(z*.0045);return 1300+620*Math.pow(smooth(-3400,3800,xm),1.1)+smooth(-1000,2500,xm)*(ridge(x,z,.0012,24)-.55)*220+22*(fbm(x*.006,z*.006,29,2)-.5);};
 const valleyBed=x=>base(x,glZ(x))-70*smooth(SNOUT-500,SNOUT+400,x)-10;
 const iceTop=(x,d)=>{const w=Wg(x),u=clamp(d/w,0,1),th=(30+70*smooth(SNOUT,2600,x))*smooth(SNOUT-60,SNOUT+120,x);return valleyBed(x)+th*Math.sqrt(Math.max(0,1-u*u))+6*(fbm(x*.01,d*.03,161,2)-.5)*smooth(SNOUT,SNOUT+300,x);};
 const iceK=(x,z)=>{const d=Math.abs(z-glZ(x));return smooth(Wg(x)*1.02,Wg(x)*.92,d)*smooth(SNOUT-40,SNOUT+60,x);};
 const LAKE={x:SNOUT-330,z:glZ(SNOUT-330),r:210,name:'The proglacial lake',colour:0x58aab0};
 const moraineK=(x,z)=>{const d=Math.abs(z-glZ(x)),w=Wg(x),lat=smooth(.9,1.05,d/w)*smooth(1.35,1.12,d/w)*smooth(SNOUT-200,SNOUT+150,x),
  e=Math.hypot(x-(SNOUT-120),(z-glZ(x))*.8),end=smooth(w*1.25,w*1.05,e)*smooth(w*.75,w*.92,e)*smooth(SNOUT+40,SNOUT-80,x);return Math.max(lat,end);};
 function ground(x,z){let h=base(x,z);const d=Math.abs(z-glZ(x)),w=Wg(x),u=d/w;
  // the U valley, carved from the rim down past the snout, its sides steep, its floor flat
  const uk=smooth(1.9,1.0,u)*smooth(SNOUT-1100,SNOUT-300,x);if(uk>0)h=mix(h,valleyBed(x)+Math.pow(clamp(u,0,1.9)/1.9,3)*(h-valleyBed(x)),uk);
  h+=18*moraineK(x,z)*(.75+.5*fbm(x*.01,z*.01,162,2));
  const ik=iceK(x,z);if(ik>0)h=mix(h,Math.max(h,iceTop(x,d)),ik);
  return h;}
 const L=stationLand({R,ground,groundN:540,tarn:Object.assign(LAKE,{base:valleyBed(LAKE.x)-14,cirque:.2}),
  cold:(x,z,h)=>.87+(h-1300)/2600+.03*(fbm(x*.002,z*.002,133,2)-.5),   /* the kit's boreal zone thins out from .86 to .95: the tree line in the west third */
  wet:(x,z,h)=>.24+.08*fbm(x*.0016,z*.0016,139,2)+.18*iceK(x,z),
  rockAt:(x,z,h,sl)=>Math.max(smooth(.5,.8,sl),moraineK(x,z)*.7),strataK:()=>0,
  barren:(x,z,h)=>Math.max(iceK(x,z),smooth(1960,2060,h)),barrenSnow:1,upland:h=>(h-1300)/700,
  snowAt:(x,z,h,sl)=>smooth(1800,1950,h)*smooth(.7,.35,sl)*smooth(.42,.58,fbm(x*.004,z*.004,134,2)),
  polyg:(x,z,F)=>smooth(.9,.96,F.cold)*smooth(.14,.05,F.slope)*(1-F.barren)*(1-moraineK(x,z))*smooth(.45,.58,fbm(x*.003-2,z*.003+5,163,2)),
  spine:[[-2600,-1200],[-2600,1200],[-1500,0],[-700,-1600],[-700,1600],[0,0],[LAKE.x,LAKE.z],[SNOUT+400,glZ(SNOUT+400)],[1800,glZ(1800)],[1300,-1700],[1300,1700],[2600,-1500],[2600,1500]],
  rock:landH=>{if(LQ.get('landforms')==='0'||typeof KSTACKS==='undefined')return[];const out=[];
   for(let j=-7;j<=7;j++)for(let i=-7;i<=7;i++){const h0=KRAND.hash(5881,i,j,0x31),u=q=>KRAND.unit(KRAND.hash(h0,q,0,0x32)),x=(i+u(1))*400,z=(j+u(2))*400;
    if(Math.abs(x)>R-250||Math.abs(z)>R-250||u(3)>.5)continue;const hh=landH(x,z),cold=.87+(hh-1300)/2600;if(cold<.93||cold>.99||iceK(x,z)>0||moraineK(x,z)>.1||Math.hypot(x-LAKE.x,z-LAKE.z)<LAKE.r*2)continue;
    out.push(KSTACKS.make({id:'tor'+out.length,kind:'tor',x,z,ground:landH,H:3.5+5*u(4),seed:h0}));}
   out.forEach(B=>{B.name='A granite tor';});return out;}});
 L.glZ=glZ;L.SNOUT=SNOUT;L.Wg=Wg;L.iceK=iceK;L.moraineK=moraineK;L.LAKE=LAKE;return L;})();
const TERR=STATION.TERR,VENTS=null,POOLS=[],POOLL=[],TARN=STATION.TARN,TARNL=STATION.TARNL,RIVER_SPEC=null,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function poolD(x,z){return[1e9,-1];}
function fieldsAt(x,z,h,slope){const F=STATION.fieldsAt(x,z,h,slope);F.talus=STATION.moraineK(x,z)*.8;return F;}
const LAND={name:'The tree line, the tundra and the glacier (ebadlands station 4)',title:'Krator biome — the eastern badlands: the tree line, the tundra and the glacier',
 hint:'Station 4 of the eastern badlands: krummholz and bristlecones at the tree line, tundra with patterned ground and tors, a valley glacier off the airless rim, its moraines and its milky lake (ET, 4.8 km on the model)',
 region:{name:'The tree line and the tundra (station 4)',x:0,z:0,r:TERR.R,h:1100},arcade:false,sky:{px:1102,py:293},
 fog:{falloff:1/500,sun:.3,sky:.35},climate:{cold:true,dry:true},snowLine:[1780,1960],snowBase:0,groundN:540,
 groundLayers:['steppe','needles','tundra'],talusPalette:[0x8a8680,0x9a958e,0x6e6a66,0xa8a49c,0x7a7672],talusMatrix:0x7a746c,   /* the moraine's granite */
 // the airless rim's wall past the map's east edge: the ground climbing some 4 km in 8
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dx=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  return g+4200*smooth(0,8000,dx)+dx*.05-dw*.12+200*(fbm(x*.0009,z*.0009,412,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[0,0,1300,1500,2000],farLabel:'The airless rim, past the map',
 exportBox:[STATION.LAKE.x-150,STATION.LAKE.z-150,STATION.LAKE.x+150,STATION.LAKE.z+150],
 build:()=>({moraine:landBoulders((x,z)=>STATION.moraineK(x,z),{seed:5891,dens:.9,r:1.3,cell:12,tint:0x8a8680,label:'Moraine boulders'})}),
 views:H=>{const {P,look,atTree,nearTree,gh}=H,g=STATION.glZ,S=STATION.SNOUT,LK=STATION.LAKE;
  return{
  'The treeline, krummholz and bristlecones':atTree(nearTree('bristlecone',P.tundra[0],P.tundra[1]),22,3.4,2),
  'Krummholz on the wind-cut ground':atTree(nearTree('spruce',-1600,0,0),14,1.2,1.5),
  'The last spruce-fir':(function(){const T=nearTree('spruce',P.boreal[0],P.boreal[1],12),a=Math.atan2(-T.z,-T.x)+.4;return atTree(T,60,a,10);})(),
  'The tundra\'s patterned ground':look(P.tundra[0]+400,P.tundra[1]+200,5,P.tundra[0]+500,P.tundra[1]+120,0),
  'Granite tors':ROCK.length?(function(){const B=ROCK[0];return[B.x-14,gh(B.x-14,B.z+10,2),B.z+10,B.x,B.y0+(B.top-B.y0)*.6,B.z];})():look(0,0,5,100,0,0),
  'The glacier\'s tongue':[S-500,gh(S-500,g(S-500)+260,30),g(S-500)+260,S+500,gh(S+500,g(S+500),10),g(S+500)],
  'The proglacial lake':[LK.x-LK.r*1.4,Math.max(TARNL+6,gh(LK.x-LK.r*1.4,LK.z+LK.r*.6,3)),LK.z+LK.r*.6,LK.x+LK.r,TARNL+10,LK.z-LK.r*.3],
  'A lateral moraine':(function(){const x=S+700,z=g(x)+STATION.Wg(x)*1.1;return[x-200,gh(x-200,z+60,6),z+60,x+150,gh(x+150,z,4),z];})(),
  'The ice and the airless rim':look(S-900,g(S-900)-600,120,2900,0,400)};},
 probes:{ice(){const x=STATION.SNOUT+900;return[x,STATION.glZ(x)];}}};
