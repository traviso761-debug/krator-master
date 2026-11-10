// ================================================================= HOST — STATION 4, the Hollow Way (the Western Rille's tube under Terrace III, its skylights and its open trench)
// PLAN.md section 6, station 4 (5.1 px 636,1274; the plan's +1,860 m is the tube's floor under Tallwalls' rock, Cfb, ~1,680 mm): the 35 m-wide
// Western Rille, Da-Holwey, where its tube's roof has fallen and where it stands. The page (4.8 km, x east, z south; the stream runs east, toward
// the Citadel Step's brink, as station 3 has it):
//   THE TUBE      KRELIEF.tube under Terrace III (~1,975 m here): 35 m wide, ~30 m high, its crown ~18 m under the bench; its floor steps down 14 m
//                 at a lava fall in its western stretch (the flow's own cascade inside the tube)
//   THE TRENCH    KRELIEF.tubeRille: where the roof fell (the west, to the Hollow Way's west portal, and a short window in the middle) the bench
//                 is cut to the tube's floor, a vertical-walled trench with talus at its foot; the stream runs in it, leaps the lava fall, and
//                 sinks into the breakdown at the west portal (the Hollow Way's water goes on under the roof: lore and the settlement build's)
//   THE CAVERN    KCAVERN (39-core-cavern.js): the roofed stretch between the west portal and the window, and 420 m past the window toward the
//                 Undergate (closed there: beyond is Tallwalls' forge gallery, the settlement build's), each a chain of short tubes; THE GREAT
//                 SKYLIGHT, a 90 m collapse through the roof over a breakdown mound (C.shaft, C.monolith), and the small skylights tubeRille
//                 found where the roof stands thin; a 'well' opening at each skylight and portal, where the ground mesh is left to the cavern
//   THE FORGES    Tallwalls' Four-Arm Smithies stand in this gallery: their site is published as a core/tags record (underground: no field keeps
//                 the bench above clear), their wheels and hammers are the settlement build's
const STATION=(function(){const R=2400,KR=KRAND,W0=KR.hash(1274,636,0,0x6a80);
 // ------------------------------------------------------------ Terrace III here: a ponded bench falling gently east (toward the brink)
 const g0=(x,z)=>1975-.006*x+.004*z+4*(fbm(x*.0016,z*.0016,98,2)-.5)+1.2*Math.pow(1-Math.abs(2*fbm(x*.004,z*.004,99,2)-1),3);
 // ------------------------------------------------------------ the tube (KRELIEF.tube), its floor stepped at the lava fall
 const TP=KRELIEF.meander([-2700,350],[2700,-250],{amp:160,wave:1500,step:30,seed:KR.hash(W0,1,0,0x61)});
 const TUBE=KRELIEF.tube({pts:TP,ground:g0,r:17.5,roof:18,ridge:1.5,every:500,p:0,sky:0,seed:KR.hash(W0,2,0,0x62)});
 const sOf=[0];for(let i=1;i<TUBE.pts.length;i++)sOf.push(sOf[i-1]+Math.hypot(TUBE.pts[i].x-TUBE.pts[i-1].x,TUBE.pts[i].z-TUBE.pts[i-1].z));
 const LEN=sOf[sOf.length-1],FALL_S=1150,FALL_D=14;
 TUBE.pts.forEach((p,i)=>{if(sOf[i]>FALL_S)p.y-=FALL_D*smooth(FALL_S,FALL_S+12,sOf[i]);});   /* the lava fall: the floor steps down 14 m over 12 m */
 const at=s=>{let i=0;while(i<sOf.length-2&&sOf[i+1]<s)i++;const t=clamp((s-sOf[i])/((sOf[i+1]-sOf[i])||1),0,1),a=TUBE.pts[i],b=TUBE.pts[i+1];return{x:mix(a.x,b.x,t),z:mix(a.z,b.z,t),y:mix(a.y,b.y,t),dx:(b.x-a.x)/((sOf[i+1]-sOf[i])||1),dz:(b.z-a.z)/((sOf[i+1]-sOf[i])||1)};};
 // the fallen spans: the west (to the Hollow Way's west portal) and the window; the roof stands elsewhere
 const PW=1900,WIN=[2900,3180],EAST_END=3180+420,SKY_S=2420;
 const RILLE=KRELIEF.tubeRille(TUBE,{ground:g0,id:'hollowway',thin:0,spans:[[0,PW],WIN],widen:1.25,talus:.24,overhang:.25,skylight:{every:180,p:.6,under:40},seed:KR.hash(W0,3,0,0x63)});
 const ground1=(x,z)=>KRELIEF.shape(RILLE,x,z,g0(x,z));
 // ------------------------------------------------------------ the stream: in the trench, over the lava fall, into the west portal's breakdown
 const sNear=(x,z)=>{let b=0,bd=1e18;for(let s=0;s<=LEN;s+=10){const p=at(s),d=(p.x-x)**2+(p.z-z)**2;if(d<bd){bd=d;b=s;}}return b;};
 const lvl=s=>at(s).y+.9;
 const sPts=[];for(let s=0;s<=FALL_S-2;s+=12){const p=at(s);sPts.push([p.x,p.z,lvl(s)]);}
 const s2Pts=[];for(let s=FALL_S+16;s<=PW-28;s+=12){const p=at(s);s2Pts.push([p.x,p.z,lvl(s)]);}
 // ------------------------------------------------------------ THE CAVERN (KCAVERN): the roofed stretches drawn, the great skylight, the openings
 function ground(x,z){let h=ground1(x,z);
  // the stream's channel in the trench's floor (the trench floor is the tube's)
  const p=g0(x,z)-h>1?KRELIEF.at(RILLE,x,z,h):null;   /* in the trench only (the cut is under the bench) */
  if(p&&(p.part==='floor'||p.part==='talus')){const s=sNear(x,z);if(s<PW-20){const c=at(s),q=Math.abs((x-c.x)*-c.dz+(z-c.z)*c.dx),hw=6;if(q<hw*3)h=Math.min(h,q<hw?c.y-.8+(q/hw)*1.2:mix(h,c.y+.5,smooth(hw*3,hw,q)));}}
  return h;}
 const C=KCAVERN.create({ground,cell:2,chunk:18,seed:KR.hash(W0,7,0,0xCA7E),minRock:.8});
 const chain=(id,s0,s1)=>{const P=[];for(let s=s0;s<s1;s+=30){const p=at(s);P.push([p.x,p.y,p.z]);}const e=at(s1);P.push([e.x,e.y,e.z]);
  for(let i=1;i<P.length;i++)C.tube({id:id+'#'+i,owner:'greenstep',pts:[P[i-1],P[i]],w:TUBE.r*2,h:TUBE.passage.h,spring:.45,ledge:{v:TUBE.passage.h*.3,d:1.4},blend:5,rock:'basalt',finish:'raw'});};
 chain('hollowway-mid',PW-26,WIN[0]+26);chain('hollowway-east',WIN[1]-26,EAST_END);
 const SK=at(SKY_S),SKY={x:SK.x,z:SK.z,r:45,rim:16,floor:SK.y,crown:SK.y+TUBE.passage.h,top:g0(SK.x,SK.z)};
 C.shaft({id:'great-skylight',owner:'greenstep',c:[SKY.x,SKY.z],y0:SKY.crown-2,y1:SKY.top+10,r0:32,r1:SKY.r});
 C.monolith({id:'great-skylight-breakdown',owner:'greenstep',poly:discPolyL(SKY.x,SKY.z,26,20),y0:SKY.floor-2,y1:SKY.floor+7,taper:.35,cap:4,block:false});
 /* a shaft's radius where it meets the ground (r0 at y0 to r1 at y1): the ground mesh's exact cut (45 SKYHOLES), a lip of half a metre over it */
 const rAtGround=(x,z,y0,y1,r0,r1)=>r1-(r1-r0)*clamp((y1-g0(x,z))/(y1-y0),0,1)-.5;
 const OPEN=[{id:'great-skylight:well',c:[SKY.x,SKY.z],r:SKY.r,rim:SKY.rim,kind:'sky',rg:rAtGround(SKY.x,SKY.z,SKY.crown-2,SKY.top+10,32,SKY.r)}];
 [[PW,'west portal'],[WIN[0],'window, west'],[WIN[1],'window, east']].forEach(([s,n],k)=>{const p=at(s);OPEN.push({id:'portal'+k,c:[p.x,p.z],r:TUBE.r*1.2,rim:16,kind:'portal',name:n});});
 RILLE.skylights.filter(q=>(q.s>PW+40&&q.s<WIN[0]-40&&Math.abs(q.s-SKY_S)>90)||(q.s>WIN[1]+40&&q.s<EAST_END-40)).forEach((q,k)=>{
  const y0=at(q.s).y+TUBE.passage.h-2,y1=g0(q.x,q.z)+8;C.shaft({id:'skylight'+k,owner:'greenstep',c:[q.x,q.z],y0,y1,r0:q.r*.8,r1:q.r});OPEN.push({id:'skylight'+k+':well',c:[q.x,q.z],r:q.r,rim:6,kind:'sky',rg:rAtGround(q.x,q.z,y0,y1,q.r*.8,q.r)});});
 OPEN.forEach(o=>C.opening({id:o.id,c:o.c,r:o.r,rim:o.rim,kind:'well'}));
 C.build();
 /* the ground mesh leaves out a portal's cells (hole); a skylight's is an exact cut in the ground's shader (SKYHOLES); nothing roots in either (noRoot) */
 const hole=(x,z,pad)=>{for(const o of OPEN){if(o.kind==='portal'&&Math.hypot(x-o.c[0],z-o.c[1])<o.r+o.rim*.5+(pad==null?0:pad))return true;}return false;};
 const noRoot=(x,z)=>hole(x,z,6)||OPEN.some(o=>o.kind==='sky'&&Math.hypot(x-o.c[0],z-o.c[1])<o.rg+4);
 const fall={name:'The Hollow Way\'s lava fall: the stream\'s leap where the tube\'s floor steps down',lip:[[at(FALL_S-2).x,at(FALL_S-2).z-5,lvl(FALL_S-2)+.3],[at(FALL_S-2).x,at(FALL_S-2).z+5,lvl(FALL_S-2)+.3]],
  dir:[at(FALL_S).dx,at(FALL_S).dz],drop:lvl(FALL_S-2)-lvl(FALL_S+16),foot:[at(FALL_S+14).x,at(FALL_S+14).z,lvl(FALL_S+16)],plungeR:9};
 const MID=at((PW+WIN[0])/2),EM=at((WIN[1]+EAST_END)/2);
 const L=stepLand({R,ground,
  rivers:[{pts:sPts,width:12,half:()=>6,name:'The Hollow Way\'s stream (Da-Holwey), above the lava fall',speed:1.6},{pts:s2Pts,width:12,half:()=>6,name:'The Hollow Way\'s stream, to the west portal',speed:1.4}],
  falls:[fall],
  tm:(x,z,h)=>15-6.5*(h-1985)/1000,                                     /* Tallwalls' +15 degC (the model, 1,985 m), by a lapse rate */
  wet:(x,z,h)=>.66,
  fog:(x,z,h)=>{const p=KRELIEF.at(RILLE,x,z,h);return p?.45:.12*smooth(60,10,Math.hypot(x-SKY.x,z-SKY.z)-SKY.r);},   /* the trench holds its damp; the skylight breathes */
  rockAt:(x,z,h,sl)=>smooth(.5,.82,sl),
  strataK:(x,z,h,sl)=>smooth(.45,.8,sl),
  talus:(x,z)=>{const p=KRELIEF.at(RILLE,x,z);return p&&p.part==='talus'?.8:0;},
  hole,
  strata:BIO.strata({recipe:'tibasalt-ponded',seed:7104,range:[1800,2100],res:.5,private:true}),
  spine:[[SKY.x,SKY.z-90],[at(PW-200).x,at(PW-200).z],[at(FALL_S).x,at(FALL_S).z+60],[MID.x,MID.z+120],[at(WIN[0]+120).x,at(WIN[0]+120).z-80],[EM.x,EM.z+100],[-1500,-1300],[1400,1300],[-1700,1500],[1700,-1500]]});
 Object.assign(L,{shareLayers:{leafy:'grass',lichen:'moss'},TUBE,RILLE,SKY,OPEN,PW,WIN,EAST_END,FALL_S,LEN,at,lvl,
  noRoot,SKYHOLES:OPEN.filter(o=>o.kind==='sky').map(o=>[o.c[0],o.c[1],o.rg]),CAVERN:C,CAVERN_OPENINGS:OPEN,CAVERN_LABEL:'The Hollow Way\'s rock: titanium basalt, glazed where the lava drained (KCAVERN)',
  CAVERN_VOIDS:[{name:'The Hollow Way (Da-Holwey): the Western Rille\'s tube under its roof, 35 m wide',key:'cavern.hollowway.mid',x:MID.x,z:MID.z,y:MID.y-2,r:(WIN[0]-PW)/2+20,h:TUBE.passage.h+6},
   {name:'The Hollow Way toward the Undergate (closed 420 m past the window: Tallwalls\' forge gallery is the settlement build\'s)',key:'cavern.hollowway.east',x:EM.x,z:EM.z,y:EM.y-2,r:(EAST_END-WIN[1])/2+20,h:TUBE.passage.h+6},
   {name:'The great skylight (90 m across, over its breakdown mound)',key:'cavern.skylight',x:SKY.x,z:SKY.z,y:SKY.floor-2,r:SKY.r,h:SKY.top-SKY.floor+12}]});
 return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVERS_SPEC=STATION.RIVERS_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Hollow Way (greenstep station 4)',station:'rilleforge',title:'Krator biome — Greenstep: the Hollow Way and its skylight',
 hint:'Station 4 of Greenstep: the Western Rille\'s lava tube under Terrace III (KRELIEF.tube, KRELIEF.tubeRille, KCAVERN): its open trench and lava fall, the west portal where the stream goes under, the great 90 m skylight over the gallery where Tallwalls\' forges will stand (the settlement build\'s), the S highlands\' spiral flora on the roof (scale model 5.1, px 636,1274)',
 region:{name:'The Hollow Way (station 4)',x:0,z:0,r:TERR.R},wind:[.6,.8],sky:{px:636,py:1274},atm:1.27,cloud:.65,dust:false,
 fog:{falloff:1/650,sun:.3,sky:.5},climate:{cold:false,dry:false},wet:true,groundN:720,lod:{hero:450},kinLT:600,kinHero:420,
 groundLayers:['grass','moss','redsoil'],   /* three with a map; the litter and the lichen shared (STATION.shareLayers): fifteen units (45) */
 plants:['fern','grass','sedge','moss','begonia'],
 riverLook:[0x3a7a6e,0x163e3a],
 talusPalette:[0x2e2c2e,0x3a3836,0x45403c,0x262426,0x524a44],talusMatrix:0x3a342e,
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),ds=Math.max(0,z-S0),de=Math.max(0,x-S0),dw=Math.max(0,-S0-x);
  /* north: the Great Veil's drop to Terrace II; south: the Upper Citadel Scarp and Terrace IV; east: Tallwalls' promontory and the brink; west: the amphitheatre */
  return g-480*smooth(1500,2500,dn)+600*smooth(2500,3500,ds)+620*smooth(9000,11000,ds)+1400*smooth(14000,22000,ds)-470*smooth(1500,2500,de)+dw*.04+260*(.5-Math.abs(2*fbm(x*.0007,z*.0007,412,2)-1))*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[300,650,2300,3300,4200],farLabel:'Greenstep\'s other terraces and the Outer Wall past the map',
 build:()=>{const S=STATION,G=S.at((S.PW+S.WIN[0])/2+120);
  /* THE FOUR-ARM SMITHIES' SITE (PLAN.md section 4.2 and station 4): underground, on the gallery's floor beside the great skylight; a core/tags record
     with its footprint along the tube (no surface field: the bench above is not the forges' ground) */
  REGISTER({name:'The Four-Arm Smithies (the rille-forges): site only, the settlement build\'s (PLAN.md)',key:'site.rilleforge',kind:'site',label:'The rille-forges\' site (in the tube)',x:G.x,z:G.z,y:G.y-1,r:60,h:S.TUBE.passage.h,
   site:{id:'rilleforge.smithies',type:'forge',px:[636,1274],underground:true,floor:+G.y.toFixed(1),tube:{w:S.TUBE.r*2,h:+S.TUBE.passage.h.toFixed(1)},
    footprint:[-60,-20,20,60].map(d=>{const p=S.at((S.PW+S.WIN[0])/2+120+d);return[+p.x.toFixed(1),+p.z.toFixed(1)];}),level:+G.y.toFixed(1)}});
  REGISTER({name:'The Hollow Way\'s open trench (the tube\'s roof fallen: KRELIEF.tubeRille)',key:'trench.hollowway',kind:'feature',x:S.at(S.PW/2).x,z:S.at(S.PW/2).z,y:S.at(S.PW/2).y-4,r:S.PW/2,h:70});
  return{forges:1,skylights:S.OPEN.length-4,cavern:!!S.CAVERN};},
 kin:[
  /* Terrace III (Cfa/Cfb, ~15 degC): the right-handed spiral flora on the roof; tree ferns in the trench's damp and round the skylight */
  {ref:'shigh.coilbark',key:'coilbark',name:'Coilbark',cell:36,minR:3,accept:Z=>Z.tree*Z.gentle*Z.spiral*.32},
  {ref:'shigh.trumpet',key:'trumpet',name:'Spiral trumpet',cell:60,minR:5,accept:Z=>Z.tree*Z.gentle*Z.spiral*.3},
  {ref:'shigh.volute',key:'volute',name:'Volute tree',cell:70,minR:6,accept:Z=>Z.tree*Z.gentle*Z.spiral*.22},
  {ref:'shigh.crozier',key:'crozier',name:'Crozier tree fern',cell:22,minR:2,accept:Z=>Z.tree*(Z.spiral*.06+Z.fog*.5+Z.bank*.2)*smooth(.2,.6,Z.wet+Z.fog)},
  {ref:'swlowlands.baylaurel',key:'redbay',name:'Red bay',cell:60,minR:4,accept:Z=>Z.tree*Z.gentle*Z.spiral*.1},
  {ref:'swlowlands.willow',key:'willow',name:'Veil willow',cell:26,minR:3,overWater:.55,accept:Z=>Z.tree*Z.bank*.4}],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,A=s=>S.at(s),K=S.SKY,f=A(S.FALL_S),pw=A(S.PW),w0=A(S.WIN[0]),w1=A(S.WIN[1]);
  return{
  'The Hollow Way\'s open trench':(()=>{const c=A(S.PW-420),t=A(S.PW);return[c.x,c.y+9,c.z,t.x,t.y+12,t.z];})(),
  'The lava fall in the trench':(()=>{const c=A(S.FALL_S+90);return[c.x,c.y+7,c.z,f.x,f.y+6,f.z];})(),
  'The west portal (the stream goes under)':(()=>{const c=A(S.PW-110);return[c.x,c.y+6,c.z,pw.x,pw.y+10,pw.z];})(),
  'Down the great skylight':[K.x-K.r*.7,K.top+75,K.z+K.r*.35,K.x+4,K.floor+2,K.z-2],
  'Into the window\'s east portal':(()=>{const c=A(S.WIN[0]+60);return[c.x,c.y+6,c.z,w1.x,w1.y+12,w1.z];})(),
  'The window from the roof':[w0.x-50,gh(w0.x-50,w0.z+70,14),w0.z+70,(w0.x+w1.x)/2,w0.y+4,(w0.z+w1.z)/2],
  'Spiral flora on the roof':atTree(nearTree('trumpet',P.spiral[0],P.spiral[1]),30,2.4,3),
  'From afar':look(-2000,-2200,380,200,0,0)};},
 envPoints:[[0,0],[-900,700],[600,-1500],[300,1500]],
 probes:{bed(){const p=STATION.at(600);return[p.x,terrainH(p.x,p.z)+.2,p.z];},
  /* the trench's wall, found on the host's own fields (the check reads them on a ~13 m grid): the steepest bedded point beside the open span */
  wall(){let b=null,bs=-1;for(let s=300;s<=1800;s+=20){const p=STATION.at(s),nx=-p.dz,nz=p.dx;for(let d=8;d<=44;d+=2){const x=p.x+nx*d,z=p.z+nz*d,v=FIELD.slope(x,z)+FIELD.strata(x,z);if(v>bs){bs=v;b=[x,z];}}}return b;}}};
