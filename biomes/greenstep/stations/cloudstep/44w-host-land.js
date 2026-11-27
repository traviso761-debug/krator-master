// ================================================================= HOST — STATION 5, the Cloud Bench (Terrace IV: the cloud forest and the basalt bridges over the upper Clodosriba)
// Scale model 5.1 (surveyed 2026-11-09, PLAN.md "Station 3, as built"): Terrace IV round px 662,1304 stands at 2,595 m (+11 degC, warm month +24,
// cold -2, 925 mm: the plan's rain is high, the deck is drawn by fog), Terrace III's 1,940-2,040 m below riser 3 to the north and Terrace V
// (~3,120 m) above riser 4 to the south. The Clodosriba (r030) comes down 666,1325 -> 662,1304 -> 654,1286 here. The page (4.8 km, x east,
// z south, the river running north, -z):
//   south    RISER 4, the Mist-Curtain Scarp (KRELIEF.stair, ~540 m), Terrace V's edge over it; the Clodosriba leaps it into the head of its rille
//   middle   TERRACE IV in the cloud deck, the upper Clodosriba in its LAVA TUBE (KRELIEF.tube) whose roof has fallen along its length
//            (KRELIEF.tubeRille: a steaming, fern-choked trench) but for THREE NATURAL BRIDGES, 45-75 m long, each a stretch of roof left
//            standing: KCAVERN carves the tube under each (the bridge's arch), and the stream runs on under them
//   north    RISER 3, the Upper Citadel Scarp (~585 m): the stream leaps it from the trench's mouth toward Terrace III (station 3 looks up it)
const STATION=(function(){const R=2400,KR=KRAND,W0=KR.hash(1304,662,0,0x6a81);
 // ------------------------------------------------------------ the three steps (KRELIEF.stair): Terrace V, Terrace IV, Terrace III
 const STAIR=KRELIEF.stair({a:[0,2800],b:[0,-2800],steps:[{y:3120,at:1050},{y:2585,at:4550},{y:2000,at:9000}],w:2800,lobes:{amp:120,wave:800},slope:74,
  tongues:{per:.35,len:[30,120],w:[40,100]},flows:[8,22],riser:.36,colonnade:.45,wrinkle:1.4,seed:KR.hash(W0,1,0,0x51)});
 const T4Y=2585,T5Y=3120,T3Y=2000,g0=(x,z)=>KRELIEF.shape(STAIR,x,z,-1e9)+2.5*(fbm(x*.002,z*.002,101,2)-.5);
 const lipAt=(x,top,z0)=>{let lo=z0-500,hi=z0+500;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(g0(x,m)>top-20)hi=m;else lo=m;}return hi;};
 const footAt=(x,top,z0)=>{let lo=z0-500,hi=z0+500;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(g0(x,m)>top+15)hi=m;else lo=m;}return lo;};
 // ------------------------------------------------------------ the tube (KRELIEF.tube) from riser 4's foot to riser 3's lip; its floor falling gently north
 const X4=-260,Z4=footAt(X4,T4Y,2800-1050-150)-6,X3=240,Z3=lipAt(X3,T4Y,2800-4550)+4;
 const TUBE=KRELIEF.tube({pts:KRELIEF.meander([X4,Z4],[X3,Z3],{amp:140,wave:1100,step:25,seed:KR.hash(W0,2,0,0x62)}),ground:g0,r:14,roof:12,ridge:1.2,every:500,p:0,sky:0,seed:KR.hash(W0,3,0,0x63)});
 const sOf=[0];for(let i=1;i<TUBE.pts.length;i++)sOf.push(sOf[i-1]+Math.hypot(TUBE.pts[i].x-TUBE.pts[i-1].x,TUBE.pts[i].z-TUBE.pts[i-1].z));
 const LEN=sOf[sOf.length-1],Y0=T4Y-12-TUBE.passage.h-2;
 TUBE.pts.forEach((p,i)=>{p.y=Y0-.008*sOf[i];});   /* set, not found: the stream's grade, never climbing */
 const at=s=>{s=clamp(s,0,LEN);let i=0;while(i<sOf.length-2&&sOf[i+1]<s)i++;const t=clamp((s-sOf[i])/((sOf[i+1]-sOf[i])||1),0,1),a=TUBE.pts[i],b=TUBE.pts[i+1];
  return{x:mix(a.x,b.x,t),z:mix(a.z,b.z,t),y:mix(a.y,b.y,t),dx:(b.x-a.x)/((sOf[i+1]-sOf[i])||1),dz:(b.z-a.z)/((sOf[i+1]-sOf[i])||1)};};
 // the bridges: three stretches of roof left standing (s0, s1), the rest fallen
 const BR=[[.27,60],[.52,45],[.76,75]].map(([f,l],k)=>({k,s0:f*LEN-l/2,s1:f*LEN+l/2,len:l}));
 const spans=[[0,BR[0].s0],[BR[0].s1,BR[1].s0],[BR[1].s1,BR[2].s0],[BR[2].s1,LEN]];
 const RILLE=KRELIEF.tubeRille(TUBE,{ground:g0,id:'clodosriba-upper',thin:0,spans,widen:1.3,talus:.26,overhang:.25,skylight:false,seed:KR.hash(W0,4,0,0x64)});
 const ground1=(x,z)=>KRELIEF.shape(RILLE,x,z,g0(x,z));
 // ------------------------------------------------------------ the stream: its channel in the trench's floor, under the bridges too
 const sNear=(x,z)=>{let b=0,bd=1e18;for(let s=0;s<=LEN;s+=8){const p=at(s),d=(p.x-x)**2+(p.z-z)**2;if(d<bd){bd=d;b=s;}}return b;};
 const lvl=s=>at(s).y+.9;
 const POOL4={x:X4,z:Z4+8,r:30,level:Y0+1.6};
 function ground(x,z){let h=ground1(x,z);
  if(g0(x,z)-h>1){const p=KRELIEF.at(RILLE,x,z,h);if(p&&(p.part==='floor'||p.part==='talus')){const s=sNear(x,z),c=at(s),q=Math.abs((x-c.x)*-c.dz+(z-c.z)*c.dx),hw=5.5;
   if(q<hw*3)h=Math.min(h,q<hw?c.y-.8+(q/hw)*1.2:mix(h,c.y+.5,smooth(hw*3,hw,q)));}}
  // the plunge pool at the rille's head, under riser 4's fall
  {const d=Math.hypot(x-POOL4.x,z-POOL4.z);if(d<POOL4.r*1.5){const bed=POOL4.level-6*smooth(POOL4.r,0,d);h=Math.min(h,d<POOL4.r?bed:mix(bed,h,smooth(POOL4.r,POOL4.r*1.5,d)));}}
  // the Clodosriba's shallow channel on Terrace V to its lip
  if(z>Z4+60){const q=Math.abs(x-cx5(z)),hw=10,lv=T5Y-2.2+(z-Z5)*.004;if(q<hw*3)h=q<hw?Math.min(h,lv-2+(q/hw)*1.6):mix(h,Math.min(h,lv+.6+(q-hw)*.3),smooth(hw*3,hw,q));}
  // Terrace III below riser 3: the plunge pool and the stream's channel north
  if(z<Z3-80){const d=Math.hypot(x-POOL3.x,z-POOL3.z);if(d<POOL3.r*1.5){const bed=POOL3.level-7*smooth(POOL3.r,0,d);h=Math.min(h,d<POOL3.r?bed:mix(bed,h,smooth(POOL3.r,POOL3.r*1.5,d)));}
   if(z<POOL3.z){const q=Math.abs(x-cx3(z)),hw=11,lv=POOL3.level-(POOL3.z-z)*.004;if(q<hw*3)h=q<hw?Math.min(h,lv-2.4+(q/hw)*2):mix(h,Math.min(h,lv+.6+(q-hw)*.3),smooth(hw*3,hw,q));}}
  return h;}
 const Z5=lipAt(X4,T5Y,2800-1050),cx5=z=>X4+(z-Z5)*.18+30*Math.sin((z-Z5)*.005)*smooth(0,150,z-Z5);
 const F3=footAt(X3,T3Y,2800-4550-170),POOL3={x:X3+20,z:F3-90,r:55,level:T3Y-4},cx3=z=>POOL3.x+60*Math.sin((POOL3.z-z)*.004);
 // ------------------------------------------------------------ the cavern: the tube under each bridge (KCAVERN), one well over each bridge
 const C=KCAVERN.create({ground,cell:1.5,chunk:24,seed:KR.hash(W0,7,0,0xCA7E),minRock:.8});
 const OPEN=[];
 BR.forEach(B=>{const P=[];for(let s=B.s0-24;s<B.s1+24;s+=15){const p=at(s);P.push([p.x,p.y,p.z]);}const e=at(B.s1+24);P.push([e.x,e.y,e.z]);
  for(let i=1;i<P.length;i++)C.tube({id:'bridge'+B.k+'#'+i,owner:'greenstep',pts:[P[i-1],P[i]],w:TUBE.r*2,h:TUBE.passage.h,spring:.45,ledge:{v:TUBE.passage.h*.3,d:1.2},blend:4,rock:'basalt',finish:'raw'});
  const m=at((B.s0+B.s1)/2);B.x=m.x;B.z=m.z;B.y=m.y;B.deck=g0(m.x,m.z);OPEN.push({id:'bridge'+B.k+':well',c:[m.x,m.z],r:B.len/2+TUBE.r*1.3,rim:14,kind:'portal'});});
 OPEN.forEach(o=>C.opening({id:o.id,c:o.c,r:o.r,rim:o.rim,kind:'well'}));
 C.build();
 const inWell=(x,z,pad)=>{for(const o of OPEN)if(Math.hypot(x-o.c[0],z-o.c[1])<o.r+o.rim*.5+pad)return true;return false;};
 const hole=(x,z,pad)=>inWell(x,z,pad==null?0:pad);
 /* nothing roots where the ground is the cavern's and a void lies just under it (the arch's mouth): a bridge's deck is rock, and grows */
 const noRoot=(x,z)=>inWell(x,z,6)&&C.voidSD(x,ground(x,z)-1.5,z)<3;
 /* the checks' negative: a point in the first bridge's mouth where noRoot holds (the arch's void just under the ground) */
 let NOROOT_PROBE=null;for(let s=BR[0].s0-4;s<BR[0].s0+TUBE.r*1.5&&!NOROOT_PROBE;s+=1)for(let q=-13;q<=13&&!NOROOT_PROBE;q+=1){const p=at(s),x=p.x-p.dz*q,z=p.z+p.dx*q;if(noRoot(x,z))NOROOT_PROBE=[x,z];}   /* across the mouth: on the centreline the stream's channel is cut to its bed */
 // ------------------------------------------------------------ the water's lines
 const sPts=[];for(let s=0;s<=LEN-3;s+=10){const p=at(s);sPts.push([p.x,p.z,lvl(s)]);}
 const t5Pts=[];for(let z=2700;z>=Z5+2;z-=12)t5Pts.push([cx5(z),z,T5Y-2.2+(z-Z5)*.004]);t5Pts.push([cx5(Z5),Z5-3,T5Y-2.2]);
 const t3Pts=[];for(let z=POOL3.z-POOL3.r*.8;z>=-2700;z-=12)t3Pts.push([cx3(z),z,POOL3.level-(POOL3.z-z)*.004]);
 const ME=at(LEN);
 const falls=[{name:'The Mist-Curtain Scarp: the Clodosriba off Terrace V',lip:[[cx5(Z5)-12,Z5,T5Y-2.2+.3],[cx5(Z5)+12,Z5,T5Y-2.2+.3]],dir:[0,-1],drop:T5Y-2.2-POOL4.level,foot:[POOL4.x,POOL4.z,POOL4.level],plungeR:26},
  {name:'The Upper Citadel Scarp: the Clodosriba off Terrace IV',lip:[[ME.x-8,ME.z,lvl(LEN)+.3],[ME.x+8,ME.z,lvl(LEN)+.3]],dir:[ME.dx,ME.dz],drop:lvl(LEN)-POOL3.level,foot:[POOL3.x,POOL3.z+20,POOL3.level],plungeR:45}];
 const disc=(X,Z,r)=>Array.from({length:32},(_,k)=>{const a=k/32*TAU;return[X+Math.cos(a)*r,Z+Math.sin(a)*r];});
 const L=stepLand({R,ground,
  lakes:[{name:'The Mist-Curtain\'s plunge pool (the rille\'s head)',kind:'deep',level:POOL4.level,poly:disc(POOL4.x,POOL4.z,POOL4.r*1.02),area:1},
   {name:'The Upper Citadel Scarp\'s plunge pool',kind:'deep',level:POOL3.level,poly:disc(POOL3.x,POOL3.z,POOL3.r*1.02),area:1.5}],
  rivers:[{pts:t5Pts,width:20,half:()=>10,name:'Clodosriba (on Terrace V)',speed:2},{pts:sPts,width:11,half:()=>5.5,name:'Clodosriba (in its rille on Terrace IV, under the bridges)',speed:2.2},
   {pts:t3Pts,width:22,half:()=>11,name:'Clodosriba (on Terrace III)',speed:2}],
  falls,
  tm:(x,z,h)=>11-6.5*(h-2595)/1000,                                     /* the model's +11 degC on Terrace IV */
  wet:(x,z,h)=>.62,                                                      /* 925 mm on the model: the deck's fog drip is the fog field */
  fog:(x,z,h)=>{const p=g0(x,z)-h>1?KRELIEF.at(RILLE,x,z,h):null;return Math.max(.85*smooth(2420,2560,h)*smooth(3050,2900,h),p?.95:0,.8*smooth(220,40,Math.hypot(x-POOL3.x,z-POOL3.z)));},   /* the deck; the trench steams */
  rockAt:(x,z,h,sl)=>smooth(.5,.82,sl),
  strataK:(x,z,h,sl)=>smooth(.45,.8,sl),
  talus:(x,z)=>{const p=KRELIEF.at(STAIR,x,z);return p&&p.part!=='top'?.5:0;},
  hole,
  strata:BIO.strata({recipe:'tibasalt-ponded',seed:7105,range:[1900,3250],res:.5,private:true}),
  spine:[[BR[1].x+60,BR[1].z],[BR[0].x-50,BR[0].z],[BR[2].x+50,BR[2].z],[POOL4.x+80,POOL4.z-120],[ME.x-90,ME.z+80],[-900,300],[900,-300],[1400,900],[-1300,-900],[0,2200],[0,-2250]]});
 Object.assign(L,{shareLayers:{leafy:'grass',lichen:'moss'},STAIR,TUBE,RILLE,BR,POOL4,POOL3,X4,Z4,X3,Z3,Z5,LEN,at,lvl,cx5,cx3,T4Y,T5Y,T3Y,noRoot,NOROOT_PROBE,
  CAVERN:C,CAVERN_OPENINGS:OPEN,CAVERN_LABEL:'A natural bridge: the tube\'s roof left standing (titanium basalt, KCAVERN)',
  CAVERN_VOIDS:BR.map(B=>({name:'The '+['first','second','third'][B.k]+' natural bridge over the Clodosriba ('+B.len+' m of the tube\'s roof left standing)',key:'cavern.bridge'+B.k,x:B.x,z:B.z,y:B.y-2,r:B.len/2+10,h:B.deck-B.y+6}))});
 return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVERS_SPEC=STATION.RIVERS_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Cloud Bench (greenstep station 5)',station:'cloudstep',title:'Krator biome — Greenstep: the Cloud Bench and the basalt bridges',
 hint:'Station 5 of Greenstep: Terrace IV in the cloud deck between the Mist-Curtain Scarp and the Upper Citadel Scarp, the upper Clodosriba in its unroofed lava tube under three natural bridges (KRELIEF.tube, KRELIEF.tubeRille, KCAVERN), the S highlands\' cloud forest read in place (scale model 5.1, px 662,1304)',
 region:{name:'The Cloud Bench (station 5)',x:0,z:0,r:TERR.R},wind:[.6,.8],sky:{px:662,py:1304},atm:1.15,cloud:.75,dust:false,
 fog:{falloff:1/420,sun:.25,sky:.55},climate:{cold:false,dry:false},wet:true,groundN:720,lod:{hero:450},kinLT:600,kinHero:420,
 groundLayers:['grass','moss','redsoil'],   /* three with a map; the litter and the lichen shared (STATION.shareLayers): fifteen units (45) */
 plants:['fern','grass','sedge','moss','begonia'],
 riverLook:[0x3a7a6e,0x163e3a],
 talusPalette:[0x2e2c2e,0x3a3836,0x45403c,0x262426,0x524a44],talusMatrix:0x3a342e,
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),ds=Math.max(0,z-S0),de=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  /* north: Terrace III, the Great Veil and the lower steps; south: Terrace V, the fissure shield and the Outer Wall rising; east and west: the ridges */
  return g-dn*.02-480*smooth(4000,5000,dn)-520*smooth(9000,10500,dn)+ds*.02+300*smooth(3000,5000,ds)+1500*smooth(6000,12000,ds)+(de+dw)*.12+300*(.5-Math.abs(2*fbm(x*.0007,z*.0007,412,2)-1))*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[300,650,2300,3300,4200],farLabel:'Greenstep\'s other terraces and the Outer Wall past the map',
 build:()=>{const S=STATION;
  REGISTER({name:'The upper Clodosriba\'s rille: its tube\'s roof fallen but for three bridges (KRELIEF.tubeRille)',key:'trench.clodosriba.upper',kind:'feature',x:S.at(S.LEN/2).x,z:S.at(S.LEN/2).z,y:S.at(S.LEN/2).y-4,r:S.LEN/2,h:80});
  return{bridges:S.BR.length,cavern:!!S.CAVERN};},
 kin:[
  /* Terrace IV, the cloud deck (Cfb/Dfb, ~11 degC): the S highlands' cloud forest; coilbarks on the drier lips; tree ferns choke the rille */
  {ref:'shigh.frill',key:'frill',name:'Spiral frill tree',cell:44,minR:3,accept:Z=>Z.tree*Z.gentle*Z.cloud*.32},   /* its frill fins were 289k at cell 34 (the instance cap is 250k) */
  {ref:'shigh.screwpine',key:'screwpine',name:'Screw palm',cell:28,minR:2.5,accept:Z=>Z.tree*Z.cloud*.24},
  {ref:'shigh.coilbark',key:'coilbark',name:'Coilbark',cell:40,minR:3,accept:Z=>Z.tree*Z.gentle*(Z.cloud*.16+Z.spiral*.3)},
  {ref:'shigh.crozier',key:'crozier',name:'Crozier tree fern',cell:20,minR:2,accept:Z=>Z.tree*(Z.cloud*.2+Z.fog*.25+Z.bank*.2)*smooth(.2,.6,Z.wet+Z.fog)},
  {ref:'shigh.volute',key:'volute',name:'Volute tree',cell:80,minR:6,accept:Z=>Z.tree*Z.gentle*(Z.cloud*.08+Z.spiral*.2)},
  /* Terrace V's edge over riser 4 (the paramo begins) */
  {ref:'shigh.groundsel',key:'groundsel',name:'Giant groundsel',cell:22,minR:1.5,accept:Z=>Z.tree*Z.paramo*.45}],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,B=S.BR,m=S.at((B[1].s0+B[1].s1)/2),u=S.at(B[1].s0-70);
  return{
  'The bridges from the rim':(()=>{const a=S.at(B[0].s1+70),n=-a.dz,o=a.dx;return[a.x+n*22,gh(a.x+n*22,a.z+o*22,9),a.z+o*22,B[0].x,B[0].y+8,B[0].z];})(),
  'Under the middle bridge':[u.x,u.y+5,u.z,m.x,m.y+10,m.z],
  'On the third bridge':(()=>{const c=S.at(B[2].s1+40);return[c.x,B[2].deck+3,c.z,B[2].x,B[2].deck+1,B[2].z].map((v,i)=>i===1?Math.max(v,gh(c.x,c.z,3)):v);})(),
  'The Mist-Curtain falls':[S.POOL4.x+60,gh(S.POOL4.x+60,S.POOL4.z-420,6)+20,S.POOL4.z-420,S.POOL4.x,S.T5Y-180,S.Z5],
  'The Clodosriba over the Upper Citadel Scarp':(()=>{const e=S.at(S.LEN-120);return[e.x-90,gh(e.x-90,e.z,8),e.z,S.POOL3.x,S.POOL3.level+150,S.POOL3.z];})(),
  'Cloud forest on Terrace IV':atTree(nearTree('frill',P.cloud[0],P.cloud[1]),28,2.4,3),
  'From afar':look(-2000,-2200,380,0,0,0)};},
 envPoints:[[0,0],[-900,300],[600,-1500],[300,1200]],
 probes:{bed(){const p=STATION.at(STATION.LEN*.4);return[p.x,terrainH(p.x,p.z)+.2,p.z];},
  wall(){let b=null,bs=-1;for(let z=-2000;z<=-1500;z+=6){const x=1200,s=Math.abs(terrainH(x,z+3)-terrainH(x,z-3))/6;if(s>bs){bs=s;b=[x,z];}}return b;}}};
