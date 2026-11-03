// ================================================================= HOST — STATION 1, the hot waste and the painted badlands (PLAN-STATIONS.md; the final rebuild, 2026-11-02)
// Scale model 5.1 at px 1352,844 (old canvas 1080,514): BSh at 1,101 m, 392 mm, +23 degC (34/11), 2.4 km of relief within 30 km (the badlands'
// dendritic gullies Gemini cut into the polygon, the abyss's rim west of it). The page compresses the band into 6 km on the land contract
// (44w-host-land.js's header; 44v-host-landlib.js builds it): the heights are the page's, the model's are PLAN-STATIONS.md's.
//   north-west    THE SULPHUR FLATS: vents and six acid pools (the Danakil), the brimstone reeds at their shores, stilt pods and ember crowns
//   the middle    THE PAINTED BADLANDS, dissected: dendritic gullies 60-90 m deep in the badland recipe's clays (pink, cream, gold, grey, maroon)
//   east          THE FIRST STEP of the staircase: a 230 m escarpment in the canyon recipe's sandstone, talus at its foot, slickrock domes in front,
//                 a dry slot canyon cut back into it (rope araucarias in its shade: eastabyss's, EXCHANGES.md)
//   two WADIS     dry braided washes from the step and from the south to THE PLAYA in the west (mud polygons); tamarisk (the Bowl's) and mesquite
//                 (sedesert's) on their banks (87-host-kin.js)
//   south         THE REG: desert pavement, toadstool rocks, ember crowns and sunspires on the hot flat
const STATION=(function(){const R=3000;
 const E=z=>1650+170*Math.sin(z*.0011+.6)+60*Math.sin(z*.0041);   /* the escarpment's foot line */
 const PLAYA={x:-1900,z:1250,r:850},VENTS={x:-1650,z:-1650,r:700,floor:150};
 const slotZ=x=>-500+140*Math.sin(x*.0021+1.2)+40*Math.sin(x*.0063);
 const S=BIO.strata({formations:[{recipe:'badland',top:300},{recipe:'canyon'}],seed:5821,range:[0,900],dip:[.6,-.8,.003],warp:[7,2],res:.25,dust:0xc4a084});
 const ridge=(x,z,f,s)=>1-Math.abs(2*fbm(x*f,z*f,s,2)-1);
 const base=(x,z)=>165+40*smooth(-2600,1500,x)+16*(fbm(x*.0008+3,z*.0008-1,17,3)-.5);
 const playaK=(x,z)=>smooth(1.25,.75,blobD(x,z,PLAYA.x,PLAYA.z,PLAYA.r,3));
 // the gully country: ridged noise at three scales, sharper as it is finer, its valleys branching down to the washes
 const badK=(x,z)=>smooth(.4,.56,fbm(x*.0007+9,z*.0007+4,61,2))*smooth(E(z)-80,E(z)-400,x)*(1-playaK(x,z))*(1-smooth(400,150,Math.hypot(x-VENTS.x,z-VENTS.z)-VENTS.r*.7))*smooth(2400,1600,z);
 const gully=(x,z)=>{const wx=x+60*(fbm(x*.002,z*.002,65,2)-.5),wz=z+60*(fbm(x*.002+5,z*.002,66,2)-.5);return 62*Math.pow(ridge(wx,wz,.0042,62),1.5)+24*Math.pow(ridge(wx,wz,.011,63),2)+6*Math.pow(ridge(wx,wz,.03,64),2);};
 const LANDF=(function(){if(LQ.get('landforms')==='0'||typeof KRELIEF==='undefined')return null;
  const W1=KRELIEF.wadi({pts:KRELIEF.meander([1500,350],[PLAYA.x+500,PLAYA.z-200],{amp:110,wave:620,seed:5831}),ground:base,w:12,bank:2.6,bankW:5,braids:2.6,pools:.3,fan:true,seed:5832});
  const W2=KRELIEF.wadi({pts:KRELIEF.meander([600,2700],[PLAYA.x+450,PLAYA.z+300],{amp:90,wave:520,seed:5833}),ground:base,w:9,bank:2,bankW:4,braids:2,pools:.25,fan:true,seed:5834});
  const TAL=KRELIEF.talus({h:46,reach:85,rough:.6,scale:.02,seed:5835,footD:(x,z)=>E(z)-60-x});
  return{wadis:[W1,W2],talus:TAL,box:W=>{const P=W.pts,r=W.reach+4;return[Math.min(...P.map(p=>p.x))-r,Math.min(...P.map(p=>p.z))-r,Math.max(...P.map(p=>p.x))+r,Math.max(...P.map(p=>p.z))+r];}};})();
 const WB=LANDF?LANDF.wadis.map(LANDF.box):[];
 function ground(x,z){let h=base(x,z);const e=E(z),st=smooth(e-60,e+60,x);
  h+=230*st+6*Math.sin(clamp((x-e+60)/120,0,1)*Math.PI*3)*smooth(0,.3,st)*smooth(1,.7,st)+10*(fbm(x*.003,z*.003,67,2)-.5)*st;
  const bk=badK(x,z);if(bk>0)h+=bk*gully(x,z);
  h=mix(h,150+1.2*(fbm(x*.004,z*.004,68,2)-.5),playaK(x,z));
  // the slot canyon: cut 120 m back into the step, its floor rising gently east
  if(x>e-250){const d=Math.abs(z-slotZ(x)),w=26+8*Math.sin(x*.01),fl=200+.035*Math.max(0,x-e),k=chanWallK(d/w,2.2)*smooth(e-250,e-120,x);if(k>0)h=mix(h,fl,k);}
  if(LANDF){const dE=e-60-x;if(dE>-40&&dE<160){const t=LANDF.talus(x,z);if(t>0)h=Math.max(h,base(x,z)+t);}
   for(let i=0;i<2;i++){const b=WB[i];if(x>b[0]&&x<b[2]&&z>b[1]&&z<b[3])h=KRELIEF.shape(LANDF.wadis[i],x,z,h);}}
  return h;}
 const washAt=(x,z,h)=>{if(!LANDF)return 0;let w=0;for(let i=0;i<2;i++){const b=WB[i];if(x>b[0]&&x<b[2]&&z>b[1]&&z<b[3]){const a=KRELIEF.at(LANDF.wadis[i],x,z,h);if(a)w=Math.max(w,a.part==='floor'||a.part==='bar'||a.part==='pool'||a.part==='fan'?1:a.part==='bank'?.5:0);}}return w;};
 const L=stationLand({R,ground,groundN:540,strata:S,ledges:.5,
  pools:[[-1720,-1700,44,2.2],[-1580,-1590,30,1.8],[-1800,-1530,24,1.5],[-1520,-1790,34,2.0],[-1690,-1880,22,1.3]],vents:VENTS,
  cold:(x,z,h)=>clamp((h-150)/2600+.03*(fbm(x*.002,z*.002,133,2)-.5),0,.16),
  wet:(x,z,h)=>.05+.06*fbm(x*.0016,z*.0016,139,2)+.18*washAt(x,z,h)+.25*smooth(.3,.9,chanWallK(Math.abs(z-slotZ(x))/30,2.2))*smooth(E(z)-200,E(z),x),
  geo:(x,z)=>smooth(VENTS.r,VENTS.r*.55,Math.hypot(x-VENTS.x,z-VENTS.z)*(1+.25*(fbm(x*.004,z*.004,131,2)-.5)))*smooth(.3,.5,fbm(x*.006+2,z*.006,132,2)+.25),
  rockAt:(x,z,h,sl)=>Math.max(badK(x,z)*.85,smooth(.35,.66,sl)),
  strataK:(x,z,h,sl)=>Math.max(smooth(.15,.6,badK(x,z))*.9,smooth(.35,.7,sl)),
  talus:x=>0,wash:washAt,
  pave:(x,z,F)=>smooth(.22,.08,F.slope)*smooth(.3,.12,F.wet)*(1-badK(x,z))*(1-F.geo)*(1-F.wash)*(1-playaK(x,z))*smooth(.42,.56,fbm(x*.0021+3,z*.0021-6,136,2)),
  polyg:(x,z,F)=>playaK(x,z)*smooth(.22,.08,F.slope)*(1-F.wash*.7),
  spine:[[VENTS.x,VENTS.z],[PLAYA.x,PLAYA.z],[-600,-900],[300,-200],[900,600],[1300,-1400],[E(slotZ(1500)),slotZ(1500)],[400,1900],[-900,2100],[1500,1800],[-300,700]],
  rock:landH=>{if(LQ.get('landforms')==='0'||typeof KSTACKS==='undefined')return[];const out=[];
   for(let j=-6;j<=6;j++)for(let i=-6;i<=6;i++){const h0=KRAND.hash(5841,i,j,0x31),u=q=>KRAND.unit(KRAND.hash(h0,q,0,0x32)),x=(i+u(1))*460,z=(j+u(2))*460;
    if(Math.abs(x)>R-300||Math.abs(z)>R-300)continue;const dE=E(z)-x;if(dE<220||dE>700||u(3)>.6)continue;if(Math.abs(z-slotZ(x))<150)continue;
    out.push(KSTACKS.make({id:'dome'+out.length,kind:'dome',x,z,ground:landH,H:18+26*u(4),seed:h0,sink:.15}));}
   out.forEach(B=>{B.name='A slickrock dome before the step (Navajo sandstone, cross-bedded)';});return out;}});
 L.talusAt=(x,z)=>{const dE=E(z)-60-x;return dE<-10||dE>110?0:smooth(-10,10,dE)*smooth(110,40,dE);};
 L.badK=badK;L.E=E;L.slotZ=slotZ;L.PLAYA=PLAYA;L.LANDF=LANDF;return L;})();
// the contract's names (44w-host-land.js's header)
const TERR=STATION.TERR,VENTS=STATION.VENTS,POOLS=STATION.POOLS,POOLL=STATION.POOLL,TARN=null,TARNL=-1e9,RIVER_SPEC=null,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function poolD(x,z){return STATION.poolD(x,z);}
function badK(x,z){return STATION.badK(x,z);}
function fieldsAt(x,z,h,slope){const F=STATION.fieldsAt(x,z,h,slope);F.talus=STATION.talusAt(x,z)*smooth(.1,.3,slope);F.rock=Math.max(F.rock,F.talus*.6);return F;}
const LAND={name:'The hot waste (ebadlands station 1)',title:'Krator biome — the eastern badlands: the hot waste',
 hint:'Station 1 of the eastern badlands: the sulphur flats and their acid pools, the painted badlands cut into gullies, two dry washes to a playa, the reg, and the first step of the staircase with a slot canyon (BSh, 1.1 km on the model)',
 region:{name:'The hot waste (station 1)',x:0,z:0,r:TERR.R,h:700},arcade:false,species:['needlebloom','embercrown','sunspire','stiltpod','yucca','juniper','pinyon'],sky:{px:1080,py:514},
 fog:{falloff:1/700,sun:.4,sky:.25},climate:{dry:true},snowLine:null,groundN:540,
 // the dust's own country: the waste is where the wind lifts it (89a)
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dx=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  return g+dx*.12*smooth(0,4000,dx)+260*smooth(2000,7000,dx)-dw*.18*smooth(0,5000,dw)+90*(fbm(x*.0009,z*.0009,412,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[1e4,1e4,1e4,1e4,1e4],farLabel:'The waste past the map: the abyss\'s rim falling west, the staircase rising east',
 exportBox:[POOLS[0][0]-150,POOLS[0][1]-150,POOLS[0][0]+150,POOLS[0][1]+150],
 // the export's profile without buckets: the waste's trees are variants (instanced prototypes, not baked bark) and its reeds are cards, so no 300 m
 // cell holding water holds a bark bucket (the kin's trees grow on the wadis, far from the pools)
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,P0=POOLS[0],E=STATION.E,sz=STATION.slotZ,PL=STATION.PLAYA,LF=STATION.LANDF;
  const wv=(W,f0,f1,dh)=>{const p=W.pts,a=p[Math.floor(p.length*f0)],b=p[Math.floor(p.length*f1)];return[a.x+30,gh(a.x+30,a.z,dh),a.z,b.x,gh(b.x,b.z,1),b.z];};
  return{
  'The sulphur flats':[P0[0]-160,POOLL[0]+16,P0[1]+130,P0[0],POOLL[0]+1,P0[1]],
  'Brimstone reeds at a sulphur pool':(function(){const a=2.6,c=[P0[0]+Math.cos(a)*P0[2]*1.32,P0[1]+Math.sin(a)*P0[2]*1.32],t=[P0[0]+Math.cos(a+.55)*P0[2]*1.08,P0[1]+Math.sin(a+.55)*P0[2]*1.08];return[c[0],Math.max(gh(c[0],c[1],3),POOLL[0]+4),c[1],t[0],POOLL[0]+1.2,t[1]];})(),
  'Stilt pods at the vents':atTree(nearTree('stiltpod',VENTS.x,VENTS.z),26,.8,2),
  'Ember crowns and sunspires':atTree(nearTree('embercrown',P.waste[0],P.waste[1]),38,2.4,3),
  'Needle bloom stand':atTree(nearTree('needlebloom',P.waste[0],P.waste[1]),14,1.2,2),
  'The dissected badlands from the step':[E(-900)+120,gh(E(-900)+120,-900,30),-900,E(-900)-1300,gh(E(-900)-1300,-700,0),-700],
  'Badland gullies':look(P.bad[0]-200,P.bad[1]+150,26,P.bad[0]+60,P.bad[1]-50,4),
  ...(LF?{'The dry wash (a wadi)':wv(LF.wadis[0],.4,.55,12),'The wash where it fans onto the playa':wv(LF.wadis[0],.85,.99,18)}:{}),
  'The playa\'s mud polygons':[PL.x+520,gh(PL.x+520,PL.z,9),PL.z,PL.x,gh(PL.x,PL.z,0),PL.z-150],
  'Desert pavement on the reg':look(300,2100,4,500,1900,0),
  'Talus under the step':(function(){const z=900,x=E(z)-170;return[x,gh(x,z,8),z,E(z)+40,gh(E(z)+40,z,-30),z+60];})(),
  'The slot canyon':(function(){const x=E(sz(1700))-120,z=sz(x);return[x-60,gh(x-60,z,6),z,x+180,gh(x+180,sz(x+180),12),sz(x+180)];})(),
  'Slickrock domes before the step':ROCK.length?(function(){const B=ROCK[0];return[B.x-B.R*3,gh(B.x-B.R*3,B.z+B.R,6),B.z+B.R,B.x,B.y0+(B.top-B.y0)*.5,B.z];})():look(1200,0,6,1600,0,40),
  'The whole waste from the step':look(2400,-2200,420,-600,600,0)};},
 probes:{wall(){const E=STATION.E;let bx=0,bz=0,bs=-1;for(let z=-1500;z<=1500;z+=150)for(let x=E(z)-80;x<E(z)+80;x+=4){const s=FIELD.slope(x,z)*FIELD.strata(x,z);if(s>bs){bs=s;bx=x;bz=z;}}return[bx,bz];},
  bed(){const P=POOLS[0];return[P[0],POOLL[0]-1.5,P[1]];}}};
