// ================================================================= HOST — STATION 2, the lakes of the north rim (the N rim, the glass rim)
// Scale model 5.1: the N rim's largest lake, 1,120 km² at 3,272 m (px 533,1391, world 1066,2782 km), its shore Dsc, ~950 mm, +1.7 degC; the
// station on its east shore (545,1400: 4,019 m, Dsc, 816 mm, +1 (13/-12), 0.97 atm). The page compresses the site into 6 km:
//   west       THE LAKE (an algal lake: teal and violet mats and stromatolite domes in its shallows, glass canes standing in them)
//   east       THE GLASS FOREST rising from the shore: frost frills in stands over the water, bell firs between, starberry and prism heath under
//              them, lenswort on the open rock; the tree line near 3.9 km at the east edge
//   north-east TWO TARNS stepping down to the lake (3,420 and 3,350 m: a peat tarn and an algal one), their stream falling between them
//   south      THE RIM'S EDGE: the lake's outlet running south to a HANGING VALLEY's lip and falling into the trough (a tall fall), the Rift's
//              floor far below in the far field
const STATION=(function(){const R=3000,LAKE=3272,T1=3420,T2=3350;
 const shoreX=z=>-700+260*Math.sin(z*.0011+.3)+90*Math.sin(z*.0037);
 const T1C=[1500,-1900,320],T2C=[700,-1150,240];                         /* the tarns: x, z, r */
 const stream=[[T1C[0]-T1C[2]*.8,T1C[1]+T1C[2]*.5],[1050,-1450],[T2C[0]+T2C[2]*.5,T2C[1]-T2C[2]*.6]].concat([[T2C[0]-T2C[2]*.7,T2C[1]+T2C[2]*.6],[100,-700],[shoreX(-500)+20,-500]]);
 const EDGE=2350;                                                           /* the rim's edge (z), the hanging valley's lip on it */
 const OUT=[];for(let t=0;t<=1.0001;t+=1/40){const z=mix(900,EDGE+60,t);OUT.push([shoreX(900)+300+180*Math.sin(t*3.1),z]);}
 const ridge=(x,z,f,s)=>1-Math.abs(2*fbm(x*f,z*f,s,2)-1);
 const base=(x,z)=>{const d=Math.max(0,x-shoreX(z));return LAKE+2+d*.17*(1-.3*smooth(0,3000,d))+120*(ridge(x,z,.0014,41)-.5)*smooth(0,500,d)+16*(fbm(x*.01,z*.01,42,2)-.5);};
 const tarnBowl=(x,z,C,lv,i)=>{const td=blobD(x,z,C[0],C[1],C[2],i);return td<3.4?{td,h:lv-Math.max(0,1.05-td)*14+Math.max(0,td-.9)*30}:null;};
 function ground(x,z){let h=base(x,z);const sx=shoreX(z),dIn=sx-x;
  if(dIn>0)h=Math.min(h,LAKE-Math.min(70,4+dIn*.06)-(fbm(x*.004,z*.004,43,2)-.5)*6);else h=mix(LAKE-1.5,h,smooth(0,60,-dIn));
  // the two tarns in their cirques
  for(const [C,lv,i] of [[T1C,T1,1],[T2C,T2,2]]){const b=tarnBowl(x,z,C,lv,i);if(b)h=mix(b.h,h,smooth(1.4,3.4,b.td));}
  // the tarns' stream down to the lake, a shallow cut
  {const n=nearLine(stream,x,z);if(n.d<30)h-=3.5*smooth(30,4,n.d);}
  // the rim's edge: the ground falling into the trough past EDGE (800 m within the page's last 600 m), the outlet's hanging valley cut back into it
  if(z>EDGE-200){const n=nearLine(OUT,x,z),v=smooth(260,40,n.d);h-=smooth(EDGE-150,EDGE+650,z+60*v*smooth(EDGE,EDGE-200,z))*900*(1-.15*v);}
  // the outlet stream across the shore flat to the lip
  if(z>800&&z<EDGE+80){const n=nearLine(OUT,x,z);if(n.d<40)h=Math.min(h,mix(h,LAKE-4.5-n.t*6,smooth(40,10,n.d)));}
  return h;}
 const lipZ=EDGE+40,lp=OUT[OUT.length-2];
 const L=rimLand({R,ground,
  lakes:[{name:'The great lake of the north rim',kind:'algal',level:LAKE,poly:[[-3600,-3600]].concat(Array.from({length:42},(_,k)=>{const z=-3500+k*170;return[shoreX(z)+50,z];}),[[-3600,3600]]),area:1120},
   {name:'The upper tarn',kind:'peat',level:T1,poly:discPolyL(T1C[0],T1C[1],T1C[2]*1.35),area:.3},
   {name:'The lower tarn',kind:'algal',level:T2,poly:discPolyL(T2C[0],T2C[1],T2C[2]*1.35),area:.2}],
  river:{pts:OUT.slice(0,-2).map((p,i)=>[p[0],p[1],LAKE-2-i/(OUT.length-3)*6]),width:18,name:'The lake\'s outlet',speed:1.6},
  falls:[{name:'The hanging valley\'s fall into the trough',lip:[[lp[0]-9,lipZ,LAKE-8.2],[lp[0]+9,lipZ,LAKE-8.2]],dir:[0,1],drop:640,foot:[lp[0],lipZ+560,LAKE-650],plungeR:40}],
  tm:(x,z,h)=>1.7-6.5*(h-LAKE)/1000,
  wet:(x,z,h)=>.5+.1*fbm(x*.0016,z*.0016,139,2),
  fog:(x,z,h)=>.12*smooth(-1000,-2600,z),
  rockAt:(x,z,h,sl)=>Math.max(smooth(.55,.85,sl),smooth(.6,.66,fbm(x*.003,z*.003,145,2))*smooth(3600,3800,h)),
  strataK:(x,z,h,sl)=>smooth(.55,.85,sl)*smooth(EDGE-300,EDGE,z),
  snowAt:(x,z,h,sl)=>smooth(3950,4100,h)*smooth(.7,.35,sl),
  polyg:(x,z,F)=>smooth(.58,.66,F.cold)*smooth(.14,.05,F.slope)*(1-F.rock),
  strata:BIO.strata({recipe:'rift',seed:6802,range:[1800,4400],res:.5,private:true}),
  spine:[[shoreX(0)+200,0],[shoreX(-800)+150,-800],[shoreX(700)+250,700],[T2C[0],T2C[1]],[T1C[0],T1C[1]],[1200,300],[2200,-600],[lp[0],EDGE-150],[600,1500],[-2000,0],[2500,1600]]});
 Object.assign(L,{shoreX,LAKE,T1C,T2C,T1,T2,EDGE,OUT,lp,lipZ,stream});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=STATION.RIVER_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}

const LAND={name:'The lakes of the north rim (riftrim station 2)',title:'Krator biome — the rift rim: the lakes of the north rim',
 hint:'Station 2 of the rift rim, the glass rim (the N rim): frost frills and bell firs over the 1,120 km² lake at 3,272 m, glass canes and algal domes in its shallows, two tarns stepping down to it, the outlet falling off the rim into the trough (scale model 5.1, px 545,1400)',
 region:{name:'The lakes of the north rim (station 2)',x:0,z:0,r:TERR.R},rim:'n',wind:[1,0],arcade:false,fruitMin:40,
 species:['frostfrill','bellfir'],sky:{px:273,py:1070},atm:.97,cloud:.3,dust:false,   /* the sky's frame: the old canvas (5.1 px less 272,330) */
 fog:{falloff:1/1300,sun:.35,sky:.3},climate:{cold:true,dry:false},wet:false,snowLine:[3950,4150],snowBase:0,groundN:560,
 groundLayers:['needles','tundra','lenswort','algal','lichen'],
 lakeLook:{deep:[0x1e5a5a,0x103a40],shallow:0x3a8a7e},riverLook:[0x4a8a80,0x2a5a58],
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),de=Math.max(0,x-S0),ds=Math.max(0,z-S0),dw=Math.max(0,-S0-x);
  return (x<STATION.shoreX(clamp(z,-S0,S0))&&ds<1?Math.min(g,STATION.LAKE-2):g)+de*.25+dn*.1-ds*.9*smooth(0,5000,ds)+160*(fbm(x*.0008,z*.0008,412,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[0,2600,3300,3900,4300],farLabel:'The north rim and the trough past the map',
 kin:[
  /* OWED: rift.beardtree (the beard tree): its builder (rift src/55, B[27]) scatters blooms and anemones up to .8 m round a limb point, and with four trees the attach audit failed at 1.86% here; grown again once the Rift holds them (BIO.holdTo). KNOWN_ISSUES.md */
  /* OWED: rift.araucaria (the monkey-puzzle): its builder (rift src/55, B[9]) scatters its blooms up to .6 of a pad off the pad, and the attach audit failed at 51% here (1,982 of 2,039 blooms floating); grown again once the Rift holds them (BIO.holdTo). KNOWN_ISSUES.md */
  /* the cloud tree-fern (rift.cloudfern) grows on the N rim's warm lower edge (PLAN.md section 3), not at 3.3 km: not on this page */
  {ref:'shigh.crozier',key:'crozier',name:'Crozier tree fern',cell:36,minR:2,accept:Z=>(Z.lake*.3+Z.montane*.03*smooth(.4,.6,Z.wet))*Z.tree}],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION;
  return{
  'The glass forest over the lake':[S.shoreX(-200)-300,S.LAKE+18,-200,S.shoreX(-200)+600,S.LAKE+40,-120],
  'Frost frills lit from inside':atTree(nearTree('frostfrill',P.lake[0],P.lake[1],20),22,3.6,3),
  'A frost frill close-up':atTree(nearTree('frostfrill',P.montane[0],P.montane[1],20),11,.6,2),
  'Bell firs':atTree(nearTree('bellfir',P.montane[0],P.montane[1]),26,1.8,3),
  'Glass canes in the shallows':(function(){const x=S.shoreX(300)-30,z=300;return[x+40,S.LAKE+3,z+20,x-30,S.LAKE+1.5,z];})(),
  'The tarns stepping down':[S.T2C[0]-500,gh(S.T2C[0]-500,S.T2C[1]+300,30),S.T2C[1]+300,S.T1C[0],S.T1+10,S.T1C[1]],
  'Starberry, prism heath and lenswort':look(P.montane[0]-8,P.montane[1]+6,1.6,P.montane[0]+6,P.montane[1]-4,0),
  'The fall into the trough':[S.lp[0]+380,gh(S.lp[0]+380,S.EDGE-150,40),S.EDGE-150,S.lp[0],S.LAKE-300,S.lipZ+300],
  'From afar':look(2800,-2800,400,-800,600,100)};},
 probes:{bed(){const p=STATION.OUT[10];return[p[0],terrainH(p[0],p[1])+.2,p[1]];},ice:null}};
