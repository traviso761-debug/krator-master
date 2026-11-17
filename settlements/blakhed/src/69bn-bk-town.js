// ================================================================= BLAKHED — the town on core/city (records)
// [G data] PLAN.md sections 3.2 and 5 (step B3's first pass). One core/city instance (rand 'krand', insertion order, TUNE.exact)
// whose own steps lay the town: the raster zoned from the blocks and the quarters, the roads (the drove road from the west over
// the Blak Riba's ford, the stair road east along the river's right bank to the Icegarth and on to the Stairhead, the ice road
// south over the fells through the Fairfell, the caravan road from the east past the Golden Tears' compound), the lanes of the
// grid; then frontage-courts fills the house blocks with the Fellgang keys by wealth; then every quarter's building goes in by
// KCITY.courts.place (core/city's own lot: its plot stamped on the raster, refused where anything stands), never by a builder:
//   the Market       the square on the pin; the two meeting halls facing across it (the Fowlers' rope wall west, the Ice-cutters'
//                    tally board east: PLAN.md question 11), the head's house and the stores north, the halting houses south
//   the Icegarth     fourteen ice houses in two rows behind the ice ponds on the right bank below the town, the sledge sheds
//   the Ropewalk     twelve rope houses end to end along the bank above the town (a 240 m walk: the kit's longest is 20 m), the
//                    Fowlers' egg and honey stores beside it
//   the Folds        the beast pens and the barns at the town's west end, by the drove road
//   the carriers' yard  the sledge sheds and the pens at the town's east end, on the stair road
//   the Fairfell     south of the town: the fair pens round the ring (its rails and the booths are page geometry: 90c)
//   the Winterings   the Travellers' wagons in family rows and their halts, beside the Fairfell (TG.fg.pieces: records, not lots)
//   the cairn hall   on its knoll at the town's south edge
//   the Golden Tears' compound  the Xanadu merchant house's mission (the owner, 2026-11-16), walled, 1 km east of the Market
// Each record: {id, key, set ('fg' | 'xa' | 'piece'), x, z, ry, w, d, h, kind, quarter, name?, character?, variant?, people}.
//   BK_TOWN.make({dims, seed}) -> {records, ways, blocks, quarters, lots, people, err, frame}
var BK_TOWN=(function(){
 const G=BK_GROUND,R=G.river,D0=(x,d)=>x==null?d:x;
 /* the frame: U downstream along the river where it passes the town, N its right bank (the town's side); a point is (u, v) */
 const F0=R.along(R.sPin,0),U=[F0.tx,F0.tz],N=[F0.nx,F0.nz];
 const W=(u,v)=>[u*U[0]+v*N[0],u*U[1]+v*N[1]],UV=(x,z)=>[x*U[0]+z*U[1],x*N[0]+z*N[1]];
 const dirW=(du,dv)=>{const p=W(du,dv),l=Math.hypot(p[0],p[1])||1;return[p[0]/l,p[1]/l];};
 const RV=UV(F0.x,F0.z)[1];   /* the river's line past the town, in v (about -560) */
 /* the grid: lanes along U and across it; the Market the block on the pin */
 const UL=[-660,-450,-250,-75,75,250,450,660],VL=[-390,-205,-60,60,235,410,580];
 const LANE=5,MAIN=8;
 const USE={'3,2':'market','2,2':'hall-w','4,2':'hall-e','3,1':'head','3,3':'halting','0,1':'folds','0,2':'folds','0,3':'folds','6,0':'yard','6,1':'yard'};
 function hash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;}
 const BLOCKS=[];
 for(let i=0;i+1<UL.length;i++)for(let j=0;j+1<VL.length;j++){
  const hw=a=>a===-75||a===75||a===-60||a===60?MAIN/2+1:LANE/2+1;
  const u0=UL[i]+hw(UL[i]),u1=UL[i+1]-hw(UL[i+1]),v0=VL[j]+hw(VL[j]),v1=VL[j+1]-hw(VL[j+1]);
  const use=USE[i+','+j]||'houses',dm=Math.max(Math.abs((i-3)/3.5),Math.abs((j-2)/3));
  const kind=dm<.45?'rich':dm<.8?'middle':'poor';
  BLOCKS.push({id:'b'+i+'.'+j,i,j,use,kind,wealth:kind==='rich'?.8:kind==='middle'?.5:.2,uv:[u0,v0,u1,v1],poly:[W(u0,v0),W(u1,v0),W(u1,v1),W(u0,v1)]});}
 const ZONE=[W(UL[0],VL[0]),W(UL[7],VL[0]),W(UL[7],VL[6]),W(UL[0],VL[6])];
 const blk=(i,j)=>BLOCKS.find(b=>b.i===i&&b.j===j);

 // ---------------------------------------------------------------- the quarters outside the grid (world points)
 const sIce0=R.sPin+1000,sIce1=R.sPin+1800,sRope0=R.sPin-760,sRope1=sRope0+240;
 const FAIR={c:[120,1180],rx:90,rz:50},WINTER={c:[-720,1080],w:420,d:300,ry:.35},CAIRN=[520,860],TEARS={c:[1120,360],w:190,d:160};
 TEARS.ry=Math.atan2(.961,.276);   /* the compound turned to the caravan road from the east (Erehwon's bearing, ESE) */
 const tearsAt=(lx,lz)=>[TEARS.c[0]+lx*Math.cos(TEARS.ry)+lz*Math.sin(TEARS.ry),TEARS.c[1]-lx*Math.sin(TEARS.ry)+lz*Math.cos(TEARS.ry)];   /* local x north, z east */
 const along=(s,off)=>R.along(s,off);
 const rect=(c,w,d,ry)=>{const cs=Math.cos(ry),sn=Math.sin(ry),P=[];for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const lx=a*w/2,lz=b*d/2;P.push([c[0]+lx*cs+lz*sn,c[1]-lx*sn+lz*cs]);}return P;};
 const strip=(s0,s1,o0,o1)=>{const P=[];for(let s=s0;s<=s1+1e-6;s+=(s1-s0)/8){const a=along(s,o0);P.push([a.x,a.z]);}
  for(let s=s1;s>=s0-1e-6;s-=(s1-s0)/8){const a=along(s,o1);P.push([a.x,a.z]);}return P;};
 const QUARTERS=[
  {id:'icegarth',name:'The Icegarth',poly:strip(sIce0-250,sIce1+60,190,330)},
  {id:'ropewalk',name:'The Ropewalk',poly:strip(sRope0-30,sRope1+30,62,150)},
  {id:'fairfell',name:'The Fairfell',poly:rect(FAIR.c,420,300,0)},
  {id:'winterings',name:'The Winterings',poly:rect(WINTER.c,WINTER.w,WINTER.d,WINTER.ry)},
  {id:'cairn',name:'The cairn hall\'s knoll',poly:rect(CAIRN,40,40,0)},
  {id:'tears',name:'The Golden Tears\' compound',poly:rect(TEARS.c,TEARS.w,TEARS.d,TEARS.ry)}];

 // ---------------------------------------------------------------- the roads (world polylines), the town's lanes
 const ford=along(R.sPin-1100,0),fordIn=along(R.sPin-1100,40),fordOut=along(R.sPin-1100,-60);
 const drovers=G.fromPx(393,1338),dl=Math.hypot(drovers[0]-fordOut.x,drovers[1]-fordOut.z),dd=[(drovers[0]-fordOut.x)/dl,(drovers[1]-fordOut.z)/dl];
 const stairPts=[W(75,0),W(660,0)];for(let s=R.sPin+900;s<=R.sLip-500;s+=400){const a=along(s,s<R.sPin+2200?380:260);stairPts.push([a.x,a.z]);}
 const WAYS=[
  {id:'drove',name:'the drove road',cls:'main',pts:[W(-75,0),W(-660,0),[fordIn.x,fordIn.z],[ford.x,ford.z],[fordOut.x,fordOut.z],[fordOut.x+dd[0]*6000,fordOut.z+dd[1]*6000]]},
  {id:'stair',name:'the stair road',cls:'main',pts:stairPts},
  {id:'ice',name:'the ice road',cls:'main',pts:[W(0,60),W(0,580),[FAIR.c[0]-140,FAIR.c[1]-100],[FAIR.c[0]-150,FAIR.c[1]+260],[-200,2600],[-300,5800]]},
  {id:'caravan',name:'the caravan road',cls:'main',pts:[W(75,30),W(660,30),tearsAt(TEARS.w/2+22,-TEARS.d/2-50),tearsAt(TEARS.w/2+22,TEARS.d/2+40),[TEARS.c[0]+3200,TEARS.c[1]+900]]},   /* along the compound's north wall, past its gate */
  {id:'winter lane',name:'the Winterings lane',cls:'lane',pts:[W(-250,580),[WINTER.c[0]+150,WINTER.c[1]-120],[WINTER.c[0],WINTER.c[1]]]},
  {id:'cairn lane',name:'the cairn lane',cls:'lane',pts:[W(250,580),[CAIRN[0],CAIRN[1]-30]]},
  {id:'ice lane',name:'the Icegarth lane',cls:'lane',pts:[W(450,-390),[along(sIce0-150,200).x,along(sIce0-150,200).z],[along(sIce1,180).x,along(sIce1,180).z]]},
  {id:'rope lane',name:'the Ropewalk lane',cls:'lane',pts:[W(-250,-390),[along(sRope1+40,160).x,along(sRope1+40,160).z],[along(sRope0-40,160).x,along(sRope0-40,160).z]]}];
 for(const v of VL)if(v!==-60&&v!==60)WAYS.push({id:'lane v'+v,name:'a lane',cls:'side',pts:[W(UL[0],v),W(UL[7],v)]});
 for(const u of UL)if(u!==-75&&u!==75)WAYS.push({id:'lane u'+u,name:'a lane',cls:'side',pts:[W(u,VL[0]),W(u,VL[6])]});
 WAYS.push({id:'market n',name:'the Market\'s north side',cls:'side',pts:[W(-75,-60),W(75,-60)]},{id:'market s',name:'the Market\'s south side',cls:'side',pts:[W(-75,60),W(75,60)]});
 const WIDTH={main:MAIN,side:LANE,lane:4};
 function lineD(x,z,P){let d=1e9;for(let i=0;i+1<P.length;i++)d=Math.min(d,G.segD(x,z,P[i],P[i+1]));return d;}
 function clip(P,h){const inside=p=>Math.abs(p[0])<=h&&Math.abs(p[1])<=h,out=[];
  const cut=(a,b)=>{let lo=0,hi=1;for(let k=0;k<40;k++){const m=(lo+hi)/2,q=[a[0]+(b[0]-a[0])*m,a[1]+(b[1]-a[1])*m];if(inside(q)===inside(a))lo=m;else hi=m;}return[a[0]+(b[0]-a[0])*lo,a[1]+(b[1]-a[1])*lo];};
  for(let i=0;i<P.length;i++){const p=P[i],a=i?P[i-1]:null;if(a&&inside(a)!==inside(p))out.push(cut(a,p));if(inside(p))out.push(p);}return out;}

 // ---------------------------------------------------------------- the kit's keys for each kind of block (frontage-courts' pools)
 const POOLS={rich:[['fg-longhouse',3],['fg-house',3],['fg-store',.4],['fg-granary',.35],['fg-smithy',.25],['fg-smokehouse',.25]],
  middle:[['fg-longhouse',3],['fg-house',3],['fg-hut',1.2],['fg-smokehouse',.4],['fg-barn',.4],['fg-granary',.3],['fg-smithy',.25],['fg-tannery',.25],['fg-store',.25]],
  poor:[['fg-hut',4],['fg-house',2],['fg-longhouse',1.2],['fg-tannery',.35],['fg-smokehouse',.35],['fg-barn',.25]]};
 const SMALL={rich:[['fg-house',1]],middle:[['fg-hut',1],['fg-house',1]],poor:[['fg-hut',1]]};
 const GAPS={rich:[13,23],middle:[9,17],poor:[8,14]};
 /* residents a building holds (est.: PLAN.md section 3.1, about six a hearth): a hut one hearth of 4, a house two hearths
    of 6, a longhouse a household of 7 with its byre; the head's house 10; halting houses, works and stores none */
 const PEOPLE={'fg-hut':4,'fg-house':6,'fg-longhouse':7,'fg-headhouse':10,xa_serai:40,xa_barracks:40,xa_rich_c:16,xa_mid_a:8,xa_teahouse:4,xa_temple:4,xa_bath:2,xa_warehouse:0};
 /* the Golden Tears' compound's pieces are the Xanadu kit's (the page is Xanadu's): their whole boxes (w, d, h: the yards and
    porches with the body), for core/city's plots; the page checks them against VERN.defs */
 const XDIMS={xa_serai:[46,46,12],xa_temple:[34,32,19],xa_rich_c:[32,18,15],xa_barracks:[36,34,11],xa_teahouse:[16,16,8],xa_pens:[14,14,1.5],
  xa_bath:[34,38,17],xa_mid_a:[14,14,14],xa_warehouse:[30,20,11],xa_watch:[26,20,20]};

 function make(o){o=o||{};const seed=D0(o.seed,44120),out={records:[],ways:WAYS,blocks:BLOCKS,quarters:QUARTERS,zone:ZONE,frame:{U,N,riverV:RV},err:null,refused:[],people:{town:0,tears:0}};
  const dims=(key,v)=>{if(XDIMS[key]){const d=XDIMS[key];return{key,v:v||0,w:d[0],d:d[1],h:d[2]};}const d=o.dims(key);return d?{key,v:v||0,w:d.w,d:d.d,h:d.h}:null;};
  const TUNE={cell:3,rasterHalf:2100,maxSlope:.3,exact:true,width:{avenue:10,main:MAIN,side:LANE,alley:3,highway:10,lane:4},
   lot:{side:1.6,setback:1.4,rear:3,inset:1.0,step:3},classes:{middle:[['fg-house',0]],poor:[['fg-hut',0]]},fallback:{middle:'poor',poor:null}};
  const META={};   /* lot id -> {kind, quarter, name, set, character, variant} */
  let C=null;
  try{const L=KCITY.lib;
   /* a building of a quarter at world c facing f (a unit vector, its front), through core/city's lot; tried in a small spiral
      when refused; the refusals kept */
   const put=(key,c,f,b,meta)=>{for(let k=0;k<9;k++){const a=k*2.4,r=k?3+k*1.5:0,p=[c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r];
     const Lt=KCITY.courts.place(key,p,f,b,{margin:.8},meta.kind);if(Lt){META[Lt.id]=meta;return Lt;}}
    out.refused.push(meta.kind+' '+key+' at '+c.map(v=>Math.round(v)).join(','));return null;};
   const QB=q=>({id:'q:'+q,kind:'middle',wealth:.5});
   const steps=[
    {name:'the site: the blocks and the quarters zoned',run(){const SL=L.SL,P=L.plan(),Rs=SL.R=new L.Raster(TUNE.rasterHalf,TUNE.cell);let land=0;
     Rs.occ.fill(L.OCC.OUT);
     for(const b of BLOCKS)land+=KCITY.site.zoneRaster(Rs,b.poly,{dry:-1e9,maxSlope:TUNE.maxSlope,h:G.h});
     for(const q of QUARTERS)land+=KCITY.site.zoneRaster(Rs,q.poly,{dry:-1e9,maxSlope:.4,h:G.h});
     P.zone=ZONE;P.site=[{id:0,name:'Blakhed',type:'town',role:'town',poly:ZONE}];
     try{SL.minSpacing=KCITY.site.minSpacing();}catch(e){SL.minSpacing=LANE;}if(!(SL.minSpacing>0))SL.minSpacing=LANE;
     SL.note(0,'Blakhed: '+BLOCKS.length+' blocks, '+QUARTERS.length+' quarters, '+land+' cells of ground');}},
    {name:'the roads and the lanes',run(){const SL=L.SL;
     for(const w of WAYS){const P=clip(w.pts,TUNE.rasterHalf-20);if(P.length<2)continue;const way=SL.addWay(w.cls,P,3,{tag:w.id});way.kind=w.id;}
     SL.note(3,WAYS.length+' ways');}},
    {name:'the quarters\' buildings',run(){
     const toRiver=[-N[0],-N[1]],toTown=N,toU=U,toMinusU=[-U[0],-U[1]];
     // the Market: the double meeting hall west (both customs in one) facing the market hall east across the peace stone;
     // the head's house, granary and store north; the two halting houses (inns) south; booth rows on the square
     put('fg-doublehall',W(-106,28),toU,blk(2,2),{kind:'hall',quarter:'market',variant:'double',name:'The double meeting hall (both customs in one: the Fowlers\' rope wall and the Ice-cutters\' tally board)'});
     put('fg-markethall',W(106,-30),toMinusU,blk(4,2),{kind:'markethall',quarter:'market',name:'The market hall (the weigh-beam and the salt counters)'});
     put('fg-headhouse',W(0,-100),toTown,blk(3,1),{kind:'head',quarter:'market',name:'The head\'s house'});
     put('fg-store',W(-48,-100),toTown,blk(3,1),{kind:'store',quarter:'market',name:'A general store on the Market'});
     put('fg-granary',W(48,-100),toTown,blk(3,1),{kind:'granary',quarter:'market',name:'The town granary on the Market'});
     put('fg-halting-house',W(-36,100),toRiver,blk(3,3),{kind:'halting',quarter:'market',name:'The west halting house (an inn on the Market)'});
     put('fg-halting-house',W(36,100),toRiver,blk(3,3),{kind:'halting',quarter:'market',name:'The east halting house (an inn on the Market)'});
     put('fg-smithy',W(-106,-32),toU,blk(2,2),{kind:'smithy',quarter:'market',name:'A salvage-smithy by the Market'});
     put('fg-store',W(152,-30),toMinusU,blk(4,2),{kind:'store',quarter:'market',name:'The Fair wardens\' store'});
     for(let k=0;k<6;k++){const u=-38+(k%3)*38,v=k<3?-26:26;if(Math.abs(u)<14)continue;
      put('fg-booth',W(u,v),k<3?toTown:toRiver,blk(3,2),{kind:'booth',quarter:'market',name:'Market booths'});}
     // the Icegarth: eight great vaulted town ice houses and four smaller barrows in two rows behind the six ponds; sledge sheds and reckoning store
     for(let k=0;k<12;k++){const s=sIce0+(k>>1)*128+(k&1)*62,a=along(s,(k&1)?282:226),great=k<8;
      put(great?'fg-great-icehouse':'fg-icehouse',[a.x,a.z],toRiver,QB('icegarth'),{kind:'icehouse',quarter:'icegarth',character:'low',name:great?'A great ice house of the Icegarth':'An ice house of the Icegarth'});}
     for(let k=0;k<3;k++){const a=along(sIce0-200+k*26,250);put('fg-sledgeshed',[a.x,a.z],toRiver,QB('icegarth'),{kind:'sledges',quarter:'icegarth',character:'low',name:'The Icegarth\'s sledge shed'});}
     put('fg-store',[along(sIce0-120,300).x,along(sIce0-120,300).z],toRiver,QB('icegarth'),{kind:'store',quarter:'icegarth',character:'low',name:'The Icegarth\'s reckoning house'});
     // the Ropewalk: five 44 m town rope-walk ranges end to end along the bank (~225 m); egg and honey stores and two felt/tannery houses behind
     for(let k=0;k<5;k++){const a=along(sRope0+24+k*46,82);put('fg-ropewalk',[a.x,a.z],toTown,QB('ropewalk'),{kind:'ropewalk',quarter:'ropewalk',character:'stony',name:'The town rope walk (range '+(k+1)+' of 5)'});}
     for(let k=0;k<5;k++){const a=along(sRope0+20+k*48,118);put('fg-eggstore',[a.x,a.z],toTown,QB('ropewalk'),{kind:'eggstore',quarter:'ropewalk',character:'stony',name:'An egg and honey store (the Fowlers\' take)'});}
     for(let k=0;k<2;k++){const a=along(sRope0+44+k*110,136);put('fg-tannery',[a.x,a.z],toTown,QB('ropewalk'),{kind:'tannery',quarter:'ropewalk',character:'stony',name:'A tannery and felt house on the leat'});}
     // the Folds (west) and the carriers' yard (east): pens, barns, granaries, tannery, smithies, sledge sheds and carriers' halting house
     for(const j of[1,2,3]){const b=blk(0,j),[u0,v0,u1,v1]=b.uv;
      for(let a=0;a<3;a++)for(let c=0;c<2;c++){const key=a===1&&c===1?(j===2?'fg-granary':'fg-barn'):(a===2&&c===1&&j===1?'fg-tannery':'fg-pens');
       put(key,W(u0+30+a*(u1-u0-60)/2,v0+28+c*(v1-v0-56)),c?toTown:[-N[0],-N[1]],b,{kind:key==='fg-granary'?'granary':key==='fg-tannery'?'tannery':'folds',quarter:'folds',name:key==='fg-granary'?'A granary of the Folds':key==='fg-tannery'?'A hide and felt house of the Folds':key==='fg-barn'?'A hay barn of the Folds':'The beast pens of the Folds'});}}
     for(const j of[0,1]){const b=blk(6,j),[u0,v0,u1,v1]=b.uv;
      for(let a=0;a<3;a++){const key=a===0?(j===1?'fg-halting-house':'fg-smithy'):a===1?'fg-sledgeshed':'fg-pens';
       put(key,W(u0+32+a*(u1-u0-64)/2,(v0+v1)/2),toMinusU,b,{kind:key==='fg-halting-house'?'halting':key==='fg-smithy'?'smithy':'yard',quarter:'yard',name:key==='fg-halting-house'?'The carriers\' halting house':key==='fg-smithy'?'The carriers\' salvage-smithy':key==='fg-sledgeshed'?'A carriers\' sledge shed':'A carriers\' pens'});}}
     // the Fairfell: twelve fair pens south of the ring, eight booth rows along its north walk, and the Fair judges' stand at its east head
     for(let k=0;k<12;k++){const c=[FAIR.c[0]-150+(k%6)*60,FAIR.c[1]+80+Math.floor(k/6)*44];put('fg-pens',c,[0,-1],QB('fairfell'),{kind:'fairpens',quarter:'fairfell',name:'The Fair\'s pens'});}
     for(let k=0;k<8;k++){const c=[FAIR.c[0]-105+k*30,FAIR.c[1]-FAIR.rz-26];put('fg-booth',c,[0,1],QB('fairfell'),{kind:'booth',quarter:'fairfell',name:'The Fair\'s stalls'});}
     put('fg-fair-stand',[FAIR.c[0]+FAIR.rx+18,FAIR.c[1]],[-1,0],QB('fairfell'),{kind:'fairstand',quarter:'fairfell',name:'The Fair judges\' stand'});
     put('fg-markethall',[FAIR.c[0]+170,FAIR.c[1]-42],[-1,0],QB('fairfell'),{kind:'markethall',quarter:'fairfell',name:'The Fair\'s weigh-house'});
     // the cairn hall
     put('fg-cairnhall',CAIRN,[0,-1],QB('cairn'),{kind:'cairnhall',quarter:'cairn',name:'The cairn hall'});
     // the Golden Tears' compound (the Xanadu kit): the caravanserai of the escort, the factor's house, the hall of the Decree, the
     // escort's barracks round their yard, the teahouse, the store, the bath, the households' houses, the pens
     {const T=TEARS,cs=Math.cos(T.ry),sn=Math.sin(T.ry),at=(lx,lz)=>[T.c[0]+lx*cs+lz*sn,T.c[1]-lx*sn+lz*cs],fz=[sn,cs],fx=[cs,-sn],fb=[-sn,-cs],fw=[-cs,sn];
      const tb={id:'q:tears',kind:'rich',wealth:.8},m=(kind,name)=>({kind,quarter:'tears',set:'xa',name:'The Golden Tears\' mission: '+name});
      put('xa_serai',at(-50,10),fz,tb,m('serai','the escort\'s caravanserai'));put('xa_rich_c',at(30,-45),fz,tb,m('factor','the factor\'s house'));
      put('xa_temple',at(55,20),fw,tb,m('decree','the hall of the Decree'));put('xa_barracks',at(-45,-52),fz,tb,m('barracks','the escort\'s barracks'));
      put('xa_teahouse',at(10,50),fb,tb,m('teahouse','the teahouse'));put('xa_warehouse',at(8,-58),fz,tb,m('store','the store of the caravan\'s goods'));
      put('xa_bath',at(70,-42),fb,tb,m('bath','the bath'));
      for(let k=0;k<4;k++)put('xa_mid_a',at(-84+k*22,62),fb,tb,m('house','a household\'s house'));
      put('xa_pens',at(-84,-62),fz,tb,m('pens','the escort\'s pens'));}}},
    {name:'the house blocks: frontage and courts',run(){const P=L.plan();
     P.courts=KCITY.strategies['frontage-courts'].run(BLOCKS.filter(b=>b.use==='houses'),
      {step:6,focus:[0,0],sides:4,pools:POOLS,small:SMALL,gaps:GAPS,garden:{rich:.46,middle:.42,poor:.38},margin:.8,setback:2.4,
       infill:{step:12,yard:.7,yardR:12,reach:18}});}}];
   C=KCITY.create({name:'blakhed',tune:TUNE,seed,rand:'krand',index:{order:'insertion'},ground:{h:G.h},kit:{dims},steps});
   const PL=C.run();out.plan=PL;
   const courts=new Set(((PL.courts||{}).lots||[]).map(l=>l.id));
   for(const Lt of PL.lots){if(Lt.died!=null)continue;const M=META[Lt.id];if(!M&&!courts.has(Lt.id))continue;
    const r={id:'bk.lot.'+Lt.id,lot:Lt.id,key:Lt.key,set:M&&M.set||'fg',x:Lt.x,z:Lt.z,ry:Lt.ry,w:Lt.w,d:Lt.d,h:Lt.h,kind:M?M.kind:'house',quarter:M?M.quarter:'houses',cls:Lt.cls,
     name:M&&M.name,variant:M&&M.variant,character:M&&M.character,people:D0(PEOPLE[Lt.key],0)};
    if(r.kind==='halting'||r.kind==='store')r.people=0;
    if(!r.character){const uv=UV(r.x,r.z);r.character=uv[1]<-250?'stony':uv[0]>450?'low':(hash(r.id)%3===0?'stony':null);}
    out.records.push(r);if(r.quarter==='tears')out.people.tears+=r.people;else out.people.town+=r.people;}
  }catch(e){out.err=String(e&&e.stack||e);}
  out.lots=out.records.length;out.instance=C;
  // ---------------------------------------------------------------- the Winterings: the Travellers' wagons in family rows, their halts (pieces)
  out.pieces=[];{const W0=WINTER,cs=Math.cos(W0.ry),sn=Math.sin(W0.ry),at=(lx,lz)=>[W0.c[0]+lx*cs+lz*sn,W0.c[1]-lx*sn+lz*cs];
   for(let row=0;row<6;row++)for(let k=0;k<11;k++){const lx=-175+k*35,lz=-120+row*46,p=at(lx,lz),h=hash('wagon:'+row+':'+k);if(h%9===0)continue;
    out.pieces.push({id:'bk.wagon.'+row+'.'+k,key:h%4===0?'fg-halt':'fg-wagon',x:p[0],z:p[1],ry:W0.ry+(row&1?Math.PI:0)+((h>>4)%7-3)*.05,quarter:'winterings',family:'tr'+row});}
   /* the lantern posts along the Market's sides and the main roads in the town, every 40 m */
   for(const w of WAYS.filter(w=>w.cls==='main'))for(let i=0;i+1<w.pts.length;i++){const a=w.pts[i],b=w.pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let t=20;t<L;t+=40){const x=a[0]+(b[0]-a[0])*t/L,z=a[1]+(b[1]-a[1])*t/L;if(Math.hypot(x,z)>1300)continue;const nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
     out.pieces.push({id:'bk.lamp.'+w.id+'.'+i+'.'+Math.round(t),key:'fg-lantern-post',x:x+nx*(MAIN/2+1.2),z:z+nz*(MAIN/2+1.2),ry:0,quarter:'lanes'});}}
   /* the Icegarth's tool racks by each pond */
   for(const p of G.ponds)out.pieces.push({id:'bk.icetools.'+p.id,key:'fg-ice-tools',x:p.x+p.nx*(p.d/2+6),z:p.z+p.nz*(p.d/2+6),ry:Math.atan2(-p.nx,-p.nz),quarter:'icegarth'});
   /* the Fair's oval ring hurdles (fg-fair-hurdle, leaving gates north and south), the Fair cairn, the Market peace stone and road stones */
   const nh=76;for(let k=0;k<nh;k++){if(k===0||k===1||k===38||k===39)continue;const a=k/nh*Math.PI*2,a1=(k+1)/nh*Math.PI*2;
    const x=FAIR.c[0]+Math.cos(a)*FAIR.rx,z=FAIR.c[1]+Math.sin(a)*FAIR.rz,dx=Math.cos(a1)*FAIR.rx-Math.cos(a)*FAIR.rx,dz=Math.sin(a1)*FAIR.rz-Math.sin(a)*FAIR.rz;
    out.pieces.push({id:'bk.hurdle.'+k,key:'fg-fair-hurdle',x,z,ry:Math.atan2(dx,dz)-Math.PI/2,v:k%3,quarter:'fairfell'});}
   const mp=W(0,0);out.pieces.push({id:'bk.peace.stone',key:'fg-cairn',x:mp[0],z:mp[1],ry:Math.atan2(N[0],N[1]),v:0,quarter:'market',name:'The peace stone (where a quarrel is sworn off: the market peace)'});
   out.pieces.push({id:'bk.fair.cairn',key:'fg-cairn',x:FAIR.c[0]+FAIR.rx+28,z:FAIR.c[1]+14,ry:0,v:2,quarter:'fairfell',name:'The Fair judges\' cairn'});
   for(const [id,p,v] of [['drove',W(-650,9),0],['stair',W(650,-9),1],['ice',[8,572],2],['caravan',W(650,39),3]])
    out.pieces.push({id:'bk.sign.'+id,key:'fg-stone-sign',x:p[0],z:p[1],ry:v*1.1,v,quarter:'lanes'});}
  /* the pieces stay off the lots and the roads */
  out.pieces=out.pieces.filter(p=>p.id==='bk.peace.stone'||(!out.records.some(r=>Math.hypot(r.x-p.x,r.z-p.z)<Math.hypot(r.w,r.d)/2+2.5)&&!WAYS.some(w=>p.key!=='fg-lantern-post'&&p.key!=='fg-stone-sign'&&lineD(p.x,p.z,w.pts)<WIDTH[w.cls]/2+3)));
  out.people.travellers=out.pieces.filter(p=>p.key==='fg-wagon').length*6;
  return out;}
 return{make,frame:{U,N,W,UV},BLOCKS,QUARTERS,WAYS,WIDTH,FAIR,WINTER,CAIRN,TEARS,lineD,PEOPLE,XDIMS,ropewalk:[sRope0,sRope1],icegarth:[sIce0,sIce1]};
})();
