// ================================================================= HOST — STATION 3, the Citadel Step (Terrace III, Tallwalls' promontory and the Great Veil)
// Scale model 5.1 (surveyed 2026-11-09, PLAN.md "Station 3, as built"): Tallwalls' site at px 650,1268 stands at 1,985 m (Dfb on the class
// layer, tm +15 degC, warm month +28, cold month +2, 1,522 mm). Terrace III's floor is 1,940-2,040 m from px y 1,257 to 1,287; the Great Veil
// (riser 2) falls ~480 m to Terrace II (1,430-1,490 m) at y ~1,254-1,257; the Upper Citadel Scarp (riser 3) rises to Terrace IV (2,590-2,620 m)
// at y ~1,287-1,293. The Clodosriba (r030) comes down 662,1304 -> 654,1286 -> 646,1268 -> 644,1242, its bed 2,595 -> 2,089 -> 1,924 -> 1,465 m.
// The page compresses those ~60 km of benches into 6 km (as riftrim's gorge compresses its notch), x east, z south, the river running north (-z):
//   north    TERRACE II at ~1,480 m, the plunge basin under the falls and the joined Clodosriba going on north past the paddies
//   the lip  THE GREAT VEIL: riser 2, a lobate stair of three columnar flow fronts (~470 m), and over it, side by side at the promontory's prow,
//            the twin curtains: the Clodosriba's and the Western Rille's stream, each ~430 m
//   middle   TERRACE III at ~1,960-2,040 m, its two rilles converging on the brink: the Clodosriba's slot gorge from the south-east, the
//            Western Rille (the Hollow Way's collapsed stretch) from the west; between them TALLWALLS' PROMONTORY, a kipuka standing ~25 m
//            over the bench (site only: a core/tags record and its footprint, kept clear of flora; the buildings are the settlement build's)
//   south    RISER 3: the Upper Citadel Scarp in two columnar tiers with a hanging ledge between, the Clodosriba falling over both into the
//            head of its rille; TERRACE IV at ~2,560 m behind it, in the cloud deck
const STATION=(function(){const R=3000;
 const ridge=(x,z,f,s)=>1-Math.abs(2*fbm(x*f,z*f,s,2)-1);
 // ------------------------------------------------------------ the risers' plan lines (lobate: a flow front swings either way)
 const lipZ=x=>-1300+150*Math.sin(x*.0012+.5)+55*Math.sin(x*.0035+1.3)+14*Math.sin(x*.019+.4)+30*(fbm(x*.006,.5,77,2)-.5);   /* riser 2's lip (the Great Veil's brink): lobes, and the fronts' small bays and buttresses */
 const r3Z=x=>1900+130*Math.sin(x*.001+2)+45*Math.sin(x*.004+.7)+12*Math.sin(x*.021+1.1)+26*(fbm(x*.006,.5,78,2)-.5);   /* riser 3's foot */
 // a riser's stair: d metres past its line, `steps` flow fronts in `run` metres, each a cliff over `cliff` of its share then a ledge
 const stair=(d,run,steps,cliff)=>{if(d<=0)return 0;if(d>=run)return 1;const t=d/run*steps,i=Math.floor(t),u=t-i;return(i+smooth(0,cliff,u))/steps;};
 const H3=(x,z)=>{const zl=lipZ(x),z3=r3Z(x),t=clamp((z-zl)/(z3-zl),0,1);return 1960+70*t+5*(fbm(x*.003,z*.003,71,2)-.5);};   /* Terrace III's bench */
 const R2RUN=230,R2DROP=472;   /* the Great Veil: three fronts in 230 m, ~470 m */
 const R3RUN=200,T4=2560;
 const VEIL_K=x=>smooth(650,320,Math.abs(x+10));   /* the prow's sheer stretch of the Great Veil, between and round the two lips (x ~ -200 .. 180) */      /* the Upper Citadel Scarp: two tiers (the hanging ledge between) to Terrace IV */
 function bench(x,z){const zl=lipZ(x),z3=r3Z(x);
  if(z<zl){const dj=18*(fbm(x*.011,z*.004,79,2)-.5)*(1-VEIL_K(x)),d=Math.max(0,zl-z+dj*smooth(0,30,zl-z)),top=H3(x,zl);/* each front jogs in and out (dj): the colonnade's buttresses and bays. AT THE PROW (VEIL_K) the three fronts are one sheer wall, the
      Great Veil proper, the twin curtains falling free down it; the stair comes back either side */
   const vk=VEIL_K(x),s3=stair(d,R2RUN,3,.5+.12*(fbm(x*.004,d*.01,80,1)-.5)),s1=stair(d,R2RUN,1,.22);let h=top-R2DROP*mix(s3,s1,vk);
   if(d>R2RUN)h=top-R2DROP-(d-R2RUN)*.014+8*(fbm(x*.002,z*.002,72,2)-.5);   /* Terrace II, falling gently north */
   const ft=mix(R2RUN,R2RUN*.22,vk);h+=26*smooth(ft+90,ft,d)*smooth(ft-20,ft+5,d)*(1-vk*.7);   /* the talus apron at the foot (the basin takes the prow's) */
   return h;}
  if(z>z3){const dj=14*(fbm(x*.011,z*.004,81,2)-.5),d=Math.max(0,z-z3+dj*smooth(0,30,z-z3)),foot=H3(x,z3);let h=foot+(T4-foot)*stair(d,R3RUN,2,.42);if(d>R3RUN)h=T4+(d-R3RUN)*.01+6*(fbm(x*.002,z*.002,73,2)-.5);return h;}
  return H3(x,z);}
 // ------------------------------------------------------------ the rivers (by z for the Clodosriba, by x for the Western Rille's stream)
 const XC=180,XW=-200,ZLC=lipZ(XC),ZLW=lipZ(XW);   /* the two lips at the prow, ~380 m apart */
 let Z3C=r3Z(700);                                   /* riser 3's foot where the Clodosriba comes over it (two passes: the river's x there depends on it) */
 const POOL={x:-10,z:Math.min(ZLC,ZLW)-R2RUN*.22-150,r:175};   /* the plunge basin at the sheer wall's foot, under the twin curtains */
 const cxUp=z=>XC+(z-ZLC)/(Z3C-ZLC)*460+60*Math.sin((z-ZLC)*.0024)*smooth(0,400,z-ZLC);         /* the Clodosriba above the brink */
 Z3C=r3Z(cxUp(Z3C));
 const cxLo=z=>POOL.x+90*Math.sin((POOL.z-z)*.0016)*smooth(0,300,POOL.z-z);                       /* the joined river below the basin */
 const cx=z=>z>=ZLC?cxUp(z):z<=POOL.z?cxLo(z):mix(POOL.x,XC,(z-POOL.z)/(ZLC-POOL.z));
 const wzOf=x=>ZLW+(XW-x)*.42+110*Math.sin((XW-x)*.0021)*smooth(0,500,XW-x);                    /* the Western Rille, coming in from the west */
 // levels: the rille floors fall gently to the brink; the falls; the basin; Terrace II
 const C_TOP=H3(cxUp(Z3C),Z3C)-105,C_LIP=H3(XC,ZLC)-52,LEDGE=H3(cxUp(Z3C),Z3C)+(T4-H3(cxUp(Z3C),Z3C))*.5,BASIN=bench(POOL.x,POOL.z-POOL.r)-6;   /* the basin's level: under Terrace II's plain at its rim (the plain falls north, the river with it) */
 const T1=R3RUN*.21,T2=R3RUN*.71;   /* riser 3's two tiers end 42 m and 142 m past its foot (stair: two fronts, each a cliff over .42 of its share) */
 const W_TOP=1925,W_LIP=H3(XW,ZLW)-48;
 function cLevel(z){if(z>Z3C+T2)return T4-3+(z-Z3C-T2)*.004;   /* on Terrace IV, a shallow channel */
  if(z>Z3C+T1)return LEDGE-2;                                     /* the hanging ledge's pool between the two tiers */
  if(z>=ZLC)return mix(C_LIP,C_TOP,(z-ZLC)/(Z3C+T1-ZLC))+1.5;      /* down the rille to the brink */
  if(z>POOL.z-POOL.r)return BASIN;                                       /* the basin */
  return BASIN-1-(POOL.z-POOL.r-z)*.0145;}                                /* north across Terrace II, a little steeper than the plain (.014): in its channel, never perched */
 const wLevel=x=>x<XW?mix(W_LIP,W_TOP,clamp((XW-x)/(R+XW),0,1))+1.2:BASIN;
 const CHW=z=>z>Z3C+T2?9:z>=ZLC?mix(28,16,smooth(ZLC,ZLC+250,z)):z>POOL.z-POOL.r?18:22;   /* the Clodosriba's half-width: narrow on Terrace IV, in the slot, wider below */
 const WHW=x=>mix(14,7,smooth(XW,XW-250,x));   /* the stream spreads at the brink into its curtain */
 // the rille's cross-section: q metres off its line, `fy` the floor, `top` the bench, `fw` the floor's half-width: columnar walls (a near
 // vertical colonnade over a talus fan at the foot), and the overhanging fan of columns at the lip read by the strata shader's columns
 const rille=(q,fy,top,fw)=>{if(q<=fw)return fy+3.5*smooth(fw*.55,fw,q);const w=q-fw;return fy+3.5+Math.min(top-fy-3.5,(top-fy)*smooth(0,26,w)*1.02+10*smooth(0,8,w)*smooth(20,8,w));};
 const SITE={x:-60,z:ZLC+430,r:290,y:H3(-60,ZLC+430)+24};   /* Tallwalls' promontory: the kipuka between the rilles, near their meeting at the prow */
 const siteK=(x,z)=>smooth(SITE.r*1.25,SITE.r*.95,Math.hypot(x-SITE.x,(z-SITE.z)*1.1));
 function ground(x,z){let h=bench(x,z);const zl=lipZ(x),z3=r3Z(x);
  // the promontory: an older kipuka standing over the bench, its edge a small scarp
  {const d=Math.hypot(x-SITE.x,(z-SITE.z)*1.1),k=smooth(SITE.r*1.5,SITE.r*1.15,d)*(z>zl+20?1:0);if(k>0)h=Math.max(h,mix(h,SITE.y+3*(fbm(x*.01,z*.01,74,2)-.5),k));}
  // THE CLODOSRIBA: a shallow channel on Terrace IV, the slot rille through Terrace III, its channel on Terrace II
  {const c=cx(z),q=Math.abs(x-c),lv=cLevel(z),hw=CHW(z);
   if(z>=ZLC&&z<=Z3C+T1){const top=Math.max(h,lv+8),fw=hw+14+10*smooth(ZLC,ZLC+600,z);if(q<fw+60)h=Math.min(h,rille(q,lv-3.2,top,fw));}
   else if(q<hw*3.2&&!(z<ZLC&&z>POOL.z-POOL.r*.9)){const bed=lv-3-(z<ZLC?1.5:0);   /* not down the wall: the curtain falls free off the lip (the sheer wall has no jog at the prow) */h=q<hw?Math.min(h,bed+(q/hw)*2.6):mix(h,Math.min(h,lv+.7+(q-hw)*.3),smooth(hw*3.2,hw,q));}}
  // THE WESTERN RILLE (the Hollow Way's open, collapsed stretch) and its stream
  if(x<XW+40){const wz=wzOf(Math.min(x,XW)),q=Math.abs(z-wz),lv=wLevel(Math.min(x,XW)-1);
   if(x<=XW+4&&q<120){const top=Math.max(h,lv+8),fw=WHW(x)+16;h=Math.min(h,rille(q,lv-2.4,top,fw));}}
  // the plunge basin, carved into Terrace II under the curtains
  {const d=Math.hypot(x-POOL.x,(z-POOL.z)*1.15);if(d<POOL.r*1.5){const bed=BASIN-9*smooth(POOL.r,0,d);h=Math.min(h,d<POOL.r?bed:mix(bed,h,smooth(POOL.r,POOL.r*1.5,d)));}}
  // the benches' small relief away from the cliffs
  return h+3*(fbm(x*.015,z*.015,75,2)-.5)*smooth(.2,.05,Math.abs(h-bench(x,z))/50);}
 // ------------------------------------------------------------ the water's lines
 const cPts=[],lPts=[];for(let z=3300;z>=ZLC-1;z-=15)cPts.push([cx(z),z,cLevel(z)]);cPts.push([cx(ZLC-2),ZLC-2,cLevel(ZLC)]);   /* the Clodosriba to the brink */
 for(let z=POOL.z-POOL.r*.85;z>=-3300;z-=15)lPts.push([cx(z),z,cLevel(z)]);   /* and from the basin's mouth north: the falls join the two */
 const wPts=[];for(let x=-3300;x<=XW;x+=15)wPts.push([x,wzOf(x),wLevel(x)]);
 wPts.push([XW+4,ZLW-4,wLevel(XW-1)]);
 // ------------------------------------------------------------ the falls: [x, z] of the lip line's ends, the lip's level, the drop, the foot
 const fall=(name,a,b,y,drop,dir,foot,pr)=>({name,lip:[[a[0],a[1],y+.3],[b[0],b[1],y+.3]],dir,drop,foot,plungeR:pr});
 const falls=[
  fall('The Great Veil: the Clodosriba\'s curtain',[XC-30,ZLC],[XC+30,ZLC],cLevel(ZLC+1),cLevel(ZLC+1)-BASIN,[0,-1],[XC*.9,ZLC-R2RUN*.3,BASIN],70),
  fall('The Great Veil: the Western Rille\'s curtain',[XW-15,ZLW],[XW+15,ZLW],wLevel(XW-1),wLevel(XW-1)-BASIN,[0,-1],[XW*.9,ZLW-R2RUN*.3,BASIN],55),
  fall('The Upper Citadel Scarp: the lower tier',[cx(Z3C+T1)-12,Z3C+T1],[cx(Z3C+T1)+12,Z3C+T1],LEDGE-2,LEDGE-2-cLevel(Z3C-40),[0,-1],[cx(Z3C-40),Z3C-40,cLevel(Z3C-40)],28),
  fall('The Upper Citadel Scarp: the upper tier',[cx(Z3C+T2)-8,Z3C+T2],[cx(Z3C+T2)+8,Z3C+T2],T4-3,T4-3-(LEDGE-2),[0,-1],[cx(Z3C+75),Z3C+75,LEDGE-2],22)];
 const poolPoly=Array.from({length:40},(_,k)=>{const a=k/40*TAU;return[POOL.x+Math.cos(a)*POOL.r*1.02,POOL.z+Math.sin(a)*POOL.r/1.15*1.02];});
 const L=stepLand({R,ground,
  lakes:[{name:'The Veil Basin (the Great Veil\'s plunge pool)',kind:'deep',level:BASIN,poly:poolPoly,area:1}],
  rivers:[{pts:cPts,width:44,half:(x,z)=>CHW(z),name:'Clodosriba',speed:2.4},{pts:lPts,width:44,half:(x,z)=>CHW(z),name:'Clodosriba (below the Great Veil)',speed:2},{pts:wPts,width:28,half:x=>WHW(x),name:'The Western Rille\'s stream (Da-Holwey)',speed:1.8}],
  falls,
  tm:(x,z,h)=>15-6.5*(h-1985)/1000,                                     /* the model's +15 degC at the site, carried by a lapse rate */
  wet:(x,z,h)=>.62+.18*smooth(2350,2550,h),                              /* 1,522 mm at the site; wetter in the cloud deck */
  fog:(x,z,h)=>{const dV=Math.hypot(x-POOL.x,z-POOL.z),d3=Math.hypot(x-cx(Z3C),z-Z3C);
   return Math.max(smooth(2380,2560,h)*.9,.85*smooth(650,120,dV),.6*smooth(380,80,d3));},   /* the cloud deck on Terrace IV; the falls' spray */
  farm:(x,z)=>{const zl=lipZ(x);if(z>zl-R2RUN-200)return 0;const q=Math.abs(x-cx(z));return smooth(140,240,q)*smooth(1500,1200,q)*smooth(.5,.62,fbm(x*.0016,z*.0011,76,2));},   /* the Free Giants' paddies on Terrace II */
  site:(x,z)=>siteK(x,z),
  rockAt:(x,z,h,sl)=>smooth(.5,.82,sl),
  strataK:(x,z,h,sl)=>smooth(.45,.8,sl),
  talus:(x,z)=>{const zl=lipZ(x),d=zl-z;return d>R2RUN-30&&d<R2RUN+80?smooth(R2RUN+80,R2RUN+10,d):0;},
  strata:BIO.strata({recipe:'tibasalt-ponded',seed:7103,range:[1200,2800],res:.5,private:true}),
  spine:[[SITE.x,SITE.z],[-720,lipZ(-720)+60],[XC+60,ZLC+200],[XW-120,ZLW+260],[0,POOL.z-260],[-300,POOL.z-700],[cx(800),800],[cx(Z3C)-140,Z3C-160],[-900,400],[900,-200],[300,-2400],[-1200,-2100],[600,2500]]});
 Object.assign(L,{H3c:H3(-720,lipZ(-720)),lipZ,r3Z,cx,wzOf,cLevel,wLevel,XC,XW,ZLC,ZLW,Z3C,POOL,SITE,BASIN,LEDGE,T4,T1,T2,R2RUN,R3RUN});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVERS_SPEC=STATION.RIVERS_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Citadel Step (greenstep station 3)',station:'tallwalls',title:'Krator biome — Greenstep: the Citadel Step and the Great Veil',
 hint:'Station 3 of Greenstep: Terrace III between the Great Veil and the Upper Citadel Scarp, the Clodosriba and the Western Rille falling side by side at Tallwalls\' promontory (its site only: the settlement build\'s), the S highlands\' spiral flora and the SW lowlands\' oaks read in place (scale model 5.1, px 650,1268)',
 region:{name:'The Citadel Step (station 3)',x:0,z:0,r:TERR.R},wind:[.6,.8],sky:{px:650,py:1268},atm:1.25,cloud:.65,dust:false,
 fog:{falloff:1/650,sun:.3,sky:.5},climate:{cold:false,dry:false},wet:true,groundN:640,lod:{hero:450},kinLT:650,kinHero:440,   /* the kin's hero forms within 440 m of the spine (the SW lowlands' oak leaves stay under the 250k instance cap) */
 groundLayers:['grass','leafy','moss','redsoil','lichen'],
 plants:['fern','grass','sedge','moss','begonia','rice'],
 riverLook:[0x3a7a6e,0x163e3a],
 talusPalette:[0x2e2c2e,0x3a3836,0x45403c,0x262426,0x524a44],talusMatrix:0x3a342e,   /* the risers' talus: titanium basalt, dark (riftrim's default is the rift's red scree) */
 site:STATION.SITE,
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),ds=Math.max(0,z-S0),de=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  /* north: Terrace II and the lower steps falling to the Giant Country piedmont; south: Terrace IV, then riser 4 and the Outer Wall rising; east and west: the polygon's bounding ridges */
  return g-dn*.06*smooth(0,6000,dn)-480*smooth(6000,9000,dn)+ds*.08+620*smooth(4000,6000,ds)+2200*smooth(7000,13000,ds)+(de+dw)*.12+300*(.5-Math.abs(2*fbm(x*.0007,z*.0007,412,2)-1))*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[300,650,2300,3300,4200],   /* the far benches green (the pines' and the spruce's colours stand for the forest), snow on the Outer Wall */farLabel:'Greenstep\'s other terraces and the Outer Wall past the map',
 build:()=>{const S=STATION.SITE;
  /* TALLWALLS' SITE (PLAN.md "Decided at the build"): a core/tags record with its footprint on the promontory, published for the settlement build */
  REGISTER({name:'Tallwalls (Talodunon / Da-Talwal): site only, the settlement build\'s (PLAN.md)',key:'site.tallwalls',kind:'site',label:'Tallwalls\' site',x:S.x,z:S.z,y:S.y-6,r:S.r,h:60,
   site:{id:'stallwalls01',type:'city',px:[650,1268],footprint:Array.from({length:24},(_,k)=>{const a=k/24*TAU;return[+(S.x+Math.cos(a)*S.r).toFixed(1),+(S.z+Math.sin(a)*S.r/1.1).toFixed(1)];}),level:+S.y.toFixed(1)}});
  return{tallwalls:1};},
 kin:[
  /* the lower benches (Terraces II and III's lower edge, Cfa): the SW lowlands' broadleaves */
  {ref:'swlowlands.sprawloak',key:'sprawloak',name:'Sprawl oak',cell:95,minR:14,accept:Z=>Z.tree*Z.gentle*(Z.lower*.55+Z.spiral*.12)*(1-Z.bank*.6)},
  {ref:'swlowlands.corkoak',key:'corkoak',name:'Cork oak',cell:50,minR:4,accept:Z=>Z.tree*Z.gentle*Z.lower*.3*(1-Z.bank)},
  {ref:'swlowlands.baylaurel',key:'redbay',name:'Red bay',cell:56,minR:4,accept:Z=>Z.tree*(Z.lower*.28+Z.spiral*.14)*(1-Z.bank*.5)},
  {ref:'swlowlands.willow',key:'willow',name:'Veil willow',cell:26,minR:3,overWater:.55,accept:Z=>Z.tree*Z.bank*.45*(Z.lower+Z.spiral*.6)},
  /* OWED: swlowlands.cedar (the tier cedar, the murus gallicus' timber): riftrim's gorge found its pads off the limbs (attach audit, KNOWN_ISSUES.md); grown when swlowlands holds them */
  /* the Citadel Step and the rille gorges (Cfa/Cfb): the right-handed spiral flora, planted round Tallwalls (PLAN.md section 3) */
  {ref:'shigh.coilbark',key:'coilbark',name:'Coilbark',cell:36,minR:3,accept:Z=>Z.tree*Z.gentle*(Z.spiral*.3+Z.cloud*.15)},
  {ref:'shigh.trumpet',key:'trumpet',name:'Spiral trumpet',cell:60,minR:5,accept:Z=>Z.tree*Z.gentle*Z.spiral*.32},
  {ref:'shigh.volute',key:'volute',name:'Volute tree',cell:70,minR:6,accept:Z=>Z.tree*Z.gentle*(Z.spiral*.22+Z.cloud*.1)},
  {ref:'shigh.crozier',key:'crozier',name:'Crozier tree fern',cell:26,minR:2,accept:Z=>Z.tree*(Z.spiral*.08+Z.cloud*.22+Z.bank*.2)*smooth(.2,.6,Z.wet+Z.fog)},
  /* Terrace IV, the cloud deck: the S highlands' cloud forest */
  {ref:'shigh.frill',key:'frill',name:'Spiral frill tree',cell:36,minR:3,accept:Z=>Z.tree*Z.gentle*Z.cloud*.35},
  {ref:'shigh.screwpine',key:'screwpine',name:'Screw palm',cell:30,minR:2.5,accept:Z=>Z.tree*(Z.cloud*.22+Z.spiral*.05)}],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,Lc=[S.XC,S.ZLC],Lw=[S.XW,S.ZLW],Pz=S.POOL;
  return{
  'The Great Veil from the basin':[Pz.x-80,gh(Pz.x-80,Pz.z-520,3)+40,Pz.z-520,0,S.BASIN+240,S.ZLC],
  'The brink at the prow':[-720,S.H3c+45,S.lipZ(-720)+30,S.XW+20,S.BASIN+260,S.ZLW-30],   /* from Terrace III's edge west of the prow: the Western Rille's curtain, the Clodosriba's beyond it, the basin below */
  'Tallwalls\' promontory (its site)':[S.SITE.x+520,Math.max(S.SITE.y+90,gh(S.SITE.x+520,S.SITE.z+380,60)),S.SITE.z+380,S.SITE.x,S.SITE.y,S.SITE.z],
  'The Clodosriba\'s rille':[S.cx(600)+30,S.cLevel(600)+60,600,S.cx(-200),S.cLevel(-200)+10,-200],
  'The Upper Citadel Scarp':[S.cx(S.Z3C-700),gh(S.cx(S.Z3C-700),S.Z3C-700,30),S.Z3C-700,S.cx(S.Z3C),S.LEDGE,S.Z3C+80],
  'Spiral flora on the Citadel Step':atTree(nearTree('trumpet',P.spiral[0],P.spiral[1]),30,2.4,3),
  'Oaks on Terrace II':look(P.lower[0]-60,P.lower[1]+40,8,P.lower[0]+60,P.lower[1]-30,6),
  'From afar':look(-2700,-2900,520,300,0,30)};},
 envPoints:[[0,0],[-900,400],[600,-2300],[300,2500]],
 probes:{bed(){const z=-2400,x=STATION.cx(z);return[x,terrainH(x,z)+.2,z];},
  wall(){let b=null,bs=-1;for(let z=-1500;z<=-1000;z+=10){const x=400,s=Math.abs(terrainH(x,z+5)-terrainH(x,z-5))/10;if(s>bs){bs=s;b=[x,z];}}return b;}}};
