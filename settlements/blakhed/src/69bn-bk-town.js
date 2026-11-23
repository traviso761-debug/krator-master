// ================================================================= BLAKHED — the town on core/city and core/camp (records)
// [G data] PLAN.md sections 3.2 and 5. One core/city instance (rand 'krand', insertion order, TUNE.exact) whose steps lay a
// compact Fellgang market town loosely clustered round the central Marketplace (instead of a wide uniform grid):
//   the Market          an intimate 92 x 72 m flagged square on the pin round the peace stone; the double meeting hall west
//                       facing the market hall east across eight booth stalls, the head's house, granary and store north, the
//                       two halting houses (inns) south
//   the clustered town  irregular radial-concentric polygon blocks round crooked ring lanes and eight converging spoke roads,
//                       dense round the Marketplace and tapering along the road fingers into the fell
//   the Dalab mission   near the centre of town (~185 m ESE of the peace stone, on the inner-to-middle ring by the caravan road):
//                       100-150 people of the Realm in the Dalab kit's pieces — the chief factor's manor, the temple of The God
//                       and genepriests' house, the scribes' reckoning hall, the couriers' lodge, warehouse, exchange shops,
//                       clerks' terrace rows, stacked house, retainers' compound, well court and gate watchtower
//   the Folds & yard    beast pens, barns, granary, tannery, sledge sheds and carriers' inn on the west and east road approaches
//   the Ropewalk        five 44 m rope-walk ranges along the river bank just above the town, with the Fowlers' egg stores
//   the Icegarth        eight great vaulted town ice houses and four smaller barrows behind the six ice ponds just below the town
//   the Fairfell        just south of the town: the oval beast-racing ring of hurdles, judges' stand, weigh-house, booths and pens
//   the Winterings      the Travellers' campground beside the Fairfell, pitched on core/camp (KCAMP.pitch, culture 'traveller'):
//                       seven extended-family vardo & bender-tent circles/horseshoes round iron-tripod campfires, tinsmith and
//                       clothesline pitches, and hurdle-fenced pony paddocks along a winding grassy halting green
//   the cairn hall      on its knoll south-east of the town
//   the Golden Tears    the Xanadu merchant house's walled compound (~150 people) on the caravan road east of the town
// Each record: {id, key, set ('fg' | 'xa' | 'dalab' | 'piece'), x, z, ry, w, d, h, kind, quarter, name?, character?, variant?, people}.
var BK_TOWN=(function(){
 const G=BK_GROUND,R=G.river,D0=(x,d)=>x==null?d:x;
 /* the frame: U downstream along the river where it passes the town, N its right bank (away from the water, SSE); (0, 0) is the pin */
 const F0=R.along(R.sPin,0),U=[F0.tx,F0.tz],N=[F0.nx,F0.nz];
 const W=(u,v)=>[u*U[0]+v*N[0],u*U[1]+v*N[1]],UV=(x,z)=>[x*U[0]+z*U[1],x*N[0]+z*N[1]];
 const dirW=(du,dv)=>{const p=W(du,dv),l=Math.hypot(p[0],p[1])||1;return[p[0]/l,p[1]/l];};
 const RV=UV(F0.x,F0.z)[1];
 function hash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;}

 // ---------------------------------------------------------------- geometry helpers for organic street-bounded polygon blocks
 const LANE=5,MAIN=7.5,WIDTH={main:MAIN,side:LANE,lane:4};
 function polyArea(P){let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;}
 function clipHalf(P,p0,nx,nz,off){const out=[],f=p=>(p[0]-p0[0])*nx+(p[1]-p0[1])*nz-off;
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],fa=f(a),fb=f(b);
   if(fa<=0)out.push(a);if((fa<0&&fb>0)||(fa>0&&fb<0)){const t=fa/(fa-fb);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}
  return out;}
 /* inset each edge i of polygon P0 inward by margins[i] (or uniform m) so buildings never touch bounding streets */
 function insetPoly(P0,margins){let P=polyArea(P0)<0?P0.slice().reverse():P0.slice();
  const c=P.reduce((s,p)=>[s[0]+p[0]/P.length,s[1]+p[1]/P.length],[0,0]);
  for(let i=0;i<P0.length&&P.length>=3;i++){const a=P0[i],b=P0[(i+1)%P0.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;
   let nx=dz/L,nz=-dx/L;const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;if((mx-c[0])*nx+(mz-c[1])*nz<0){nx=-nx;nz=-nz;}
   const m=Array.isArray(margins)?margins[i]:margins;P=clipHalf(P,[mx,mz],nx,nz,-m);}
  return P;}
 const rect=(c,w,d,ry)=>{const cs=Math.cos(ry),sn=Math.sin(ry),P=[];for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const lx=a*w/2,lz=b*d/2;P.push([c[0]+lx*cs+lz*sn,c[1]-lx*sn+lz*cs]);}return P;};
 const along=(s,off)=>R.along(s,off);
 const strip=(s0,s1,o0,o1)=>{const P=[];for(let s=s0;s<=s1+1e-6;s+=(s1-s0)/8){const a=along(s,o0);P.push([a.x,a.z]);}
  for(let s=s1;s>=s0-1e-6;s-=(s1-s0)/8){const a=along(s,o1);P.push([a.x,a.z]);}return P;};

 // ---------------------------------------------------------------- the Marketplace & organic radial-ring town web
 // 8 sectors clockwise in (u, v) from East (0: E/ESE, 1: SE/SSE, 2: S/SSW, 3: SW/WSW, 4: W/WNW, 5: NW, 6: N, 7: NE):
 // Ring R0 frames the 92 x 72 m Marketplace; Ring R1 (~112 m) holds the civic frontages and inner rich courts; Ring R2 (~248 m)
 // holds the middle town cluster (with sector 0 dedicated to Dalab's mission right beside the Market!); Ring R3 (~355 m) holds
 // irregular road-hugging outer lobes (Folds west, Carriers' yard east, croft clusters along the spokes, open fell indentations between).
 const MARKET={u0:-46,u1:46,v0:-36,v1:36,poly:[W(-46,-36),W(46,-36),W(46,36),W(-46,36)]};
 const R0=[[46,-36],[46,36],[-46,36],[-46,-36]];   /* NE, SE, SW, NW corners of the Market street */
 /* 8-node inner ring (~108-124 m), 8-node middle ring (~236-272 m), and irregular road-finger outer lobes (~285-395 m) */
 const R1UV=[[110,-32],[106,36],[42,98],[-44,96],[-114,30],[-112,-30],[-42,-94],[44,-92]];
 const R2UV=[[264,-68],[258,138],[88,236],[-96,232],[-256,82],[-252,-68],[-92,-224],[96,-218]];
 const R3UV=[[376,-72],[306,168],[108,342],[-118,314],[-382,102],[-368,-86],[-104,-294],[126,-298]];
 const R1=R1UV.map(p=>W(p[0],p[1])),R2=R2UV.map(p=>W(p[0],p[1])),R3=R3UV.map(p=>W(p[0],p[1]));
 const mMain=MAIN/2+2.9,mSide=LANE/2+2.3;
 const BLOCKS=[{id:'market',i:0,j:0,use:'market',kind:'rich',wealth:.9,poly:insetPoly(MARKET.poly,mMain)}];
 /* Inner collar round the Market: 4 cardinal civic blocks + 4 corner rich court blocks */
 const innerRaw=[
  {id:'b0.hall-e',i:1,j:0,use:'hall-e',kind:'rich',raw:[W(46,-36),R1[0],R1[1],W(46,36)],m:[mMain,mSide,mMain,mMain]},
  {id:'b0.se',i:1,j:1,use:'houses',kind:'rich',raw:[W(46,36),R1[1],R1[2],[W(46,36)[0]*.1+W(0,36)[0]*.9,W(46,36)[1]*.1+W(0,36)[1]*.9]],skip:true},
  {id:'b0.halting',i:0,j:1,use:'halting',kind:'rich',raw:[W(-46,36),W(46,36),R1[2],R1[3]],m:[mMain,mMain,mSide,mMain]},
  {id:'b0.hall-w',i:-1,j:0,use:'hall-w',kind:'rich',raw:[R1[5],W(-46,-36),W(-46,36),R1[4]],m:[mMain,mMain,mMain,mSide]},
  {id:'b0.head',i:0,j:-1,use:'head',kind:'rich',raw:[R1[6],R1[7],W(46,-36),W(-46,-36)],m:[mSide,mSide,mMain,mSide]},
  {id:'b0.c-ne',i:1,j:-1,use:'houses',kind:'rich',raw:[W(46,-36),R1[7],R1[0]],m:[mSide,mSide,mSide]},
  {id:'b0.c-se',i:1,j:1,use:'houses',kind:'rich',raw:[W(46,36),R1[1],R1[2]],m:[mMain,mSide,mMain]},
  {id:'b0.c-sw',i:-1,j:1,use:'houses',kind:'rich',raw:[W(-46,36),R1[2],R1[3],R1[4]],skip:true},
  {id:'b0.c-sw2',i:-1,j:1,use:'houses',kind:'rich',raw:[W(-46,36),R1[3],R1[4]],m:[mMain,mSide,mSide]},
  {id:'b0.c-nw',i:-1,j:-1,use:'houses',kind:'rich',raw:[W(-46,-36),R1[5],R1[6]],m:[mSide,mSide,mMain]}];
 for(const b of innerRaw)if(!b.skip){const P=insetPoly(b.raw,b.m);if(P.length>=3)BLOCKS.push({id:b.id,i:b.i,j:b.j,use:b.use,kind:b.kind,wealth:.82,poly:P});}
 /* Middle ring (8 organic radial wedges between R1 and R2): sector 0 (ESE, right off the Market) is the Dalab mission! */
 for(let k=0;k<8;k++){const k1=(k+1)%8,raw=[R1[k],R2[k],R2[k1],R1[k1]];
  const isMainSpoke=s=>s===0||s===1||s===2||s===4||s===5;
  const m=[isMainSpoke(k)?mMain:mSide,mSide,isMainSpoke(k1)?mMain:mSide,mSide];
  const use=k===0?'dalab':'houses',kind=k===1||k===3||k===6||k===7?'rich':'middle';
  const P=insetPoly(raw,m);if(P.length>=3)BLOCKS.push({id:'bm.'+k,i:k+2,j:2,use,kind,wealth:kind==='rich'?.76:.52,poly:P});}
 /* Outer clustered lobes (between R2 and R3): sector 7 (ENE/stair) is Carriers' Yard, sector 4 (W/drove) is the Folds;
    sectors 1, 2, 3, 5, 6 are tapering house clusters, while sector 0 stays open outside Dalab's gate toward the Caravan Road! */
 for(const k of[1,2,3,4,5,6,7]){const k1=(k+1)%8,raw=[R2[k],R3[k],R3[k1],R2[k1]];
  const isMainSpoke=s=>s===0||s===1||s===2||s===4||s===5;
  const use=k===4?'folds':k===7?'yard':'houses',kind=k===2||k===5?'middle':'poor';
  const m=[isMainSpoke(k)?mMain:mSide,mSide,isMainSpoke(k1)?mMain:mSide,mSide];
  const P=insetPoly(raw,m);if(P.length>=3)BLOCKS.push({id:'bo.'+k,i:k+10,j:3,use,kind,wealth:kind==='middle'?.44:.24,poly:P});}
 const ZONE=R3.slice();
 const blk=id=>BLOCKS.find(b=>b.id===id);

 // ---------------------------------------------------------------- the quarters round the clustered town
 const sIce0=R.sPin+560,sIce1=R.sPin+1120,sRope0=R.sPin-340,sRope1=sRope0+240;
 /* Dalab's mission right near the centre of town (sector 0, ~180 m ESE of the Peace Stone, fronting the Market approach & caravan road) */
 const DALAB=(()=>{const b=blk('bm.0'),c=b.poly.reduce((s,p)=>[s[0]+p[0]/b.poly.length,s[1]+p[1]/b.poly.length],[0,0]);
  const f=dirW(-1,-.18);return{c,w:122,d:104,ry:Math.atan2(f[0],f[1]),poly:b.poly};})();
 /* Fairfell, Winterings (Travellers' camp), Cairn Hall and Golden Tears pulled in close so the whole settlement coheres */
 const FAIR={c:W(72,438),rx:84,rz:46,ry:Math.atan2(U[0],U[1])};
 const WINTER={c:W(-225,418),w:310,d:250,ry:Math.atan2(U[0],U[1])+.22};
 const CAIRN=W(268,342);
 const TEARS={c:W(515,128),w:188,d:158,ry:Math.atan2(.961,.276)};
 const tearsAt=(lx,lz)=>[TEARS.c[0]+lx*Math.cos(TEARS.ry)+lz*Math.sin(TEARS.ry),TEARS.c[1]-lx*Math.sin(TEARS.ry)+lz*Math.cos(TEARS.ry)];
 const QUARTERS=[
  {id:'dalab',name:'The Dalab mission',poly:DALAB.poly},
  {id:'icegarth',name:'The Icegarth',poly:strip(sIce0-160,sIce1+50,182,316)},
  {id:'ropewalk',name:'The Ropewalk',poly:strip(sRope0-30,sRope1+30,62,150)},
  {id:'fairfell',name:'The Fairfell',poly:rect(FAIR.c,360,250,0)},
  {id:'winterings',name:'The Winterings (the Travellers\' campground)',poly:rect(WINTER.c,WINTER.w,WINTER.d,WINTER.ry)},
  {id:'cairn',name:'The cairn hall\'s knoll',poly:rect(CAIRN,40,40,0)},
  {id:'tears',name:'The Golden Tears\' compound',poly:rect(TEARS.c,TEARS.w,TEARS.d,TEARS.ry)}];

 // ---------------------------------------------------------------- the converging roads and crooked ring lanes
 const ford=along(R.sPin-820,0),fordIn=along(R.sPin-820,42),fordOut=along(R.sPin-820,-58);
 const drovers=G.fromPx(393,1338),dl=Math.hypot(drovers[0]-fordOut.x,drovers[1]-fordOut.z),dd=[(drovers[0]-fordOut.x)/dl,(drovers[1]-fordOut.z)/dl];
 const stairPts=[W(46,-36),R1[0],R2[0],R3[0]];
 for(let s=R.sPin+540;s<=R.sLip-500;s+=380){const a=along(s,s<R.sPin+1400?335:260);stairPts.push([a.x,a.z]);}
 /* winding halting track through the Travellers' campground */
 const winAt=(lx,lz)=>{const cs=Math.cos(WINTER.ry),sn=Math.sin(WINTER.ry);return[WINTER.c[0]+lx*cs+lz*sn,WINTER.c[1]-lx*sn+lz*cs];};
 const winTrack=[R3[3],winAt(95,-105),winAt(42,-48),winAt(-8,4),winAt(-58,52),winAt(-112,92)];
 const WAYS=[
  {id:'drove',name:'the drove road',cls:'main',pts:[W(-46,-36),R1[5],R2[5],R3[5],[fordIn.x,fordIn.z],[ford.x,ford.z],[fordOut.x,fordOut.z],[fordOut.x+dd[0]*6000,fordOut.z+dd[1]*6000]]},
  {id:'stair',name:'the stair road',cls:'main',pts:stairPts},
  {id:'ice',name:'the ice road',cls:'main',pts:[W(46,36),R1[2],R2[2],R3[2],[FAIR.c[0]-122,FAIR.c[1]-86],[FAIR.c[0]-130,FAIR.c[1]+160],[-180,2200],[-300,5800]]},
  {id:'caravan',name:'the caravan road',cls:'main',pts:[W(46,36),R1[1],R2[1],tearsAt(TEARS.w/2+20,-TEARS.d/2-40),tearsAt(TEARS.w/2+20,TEARS.d/2+40),[TEARS.c[0]+3200,TEARS.c[1]+900]]},
  {id:'drove-s',name:'the Folds gate lane',cls:'main',pts:[W(-46,36),R1[4],R2[4],R3[4]]},
  {id:'winter lane',name:'the Winterings halting track',cls:'lane',pts:[W(-46,36),R1[3],R2[3]].concat(winTrack)},
  {id:'fair-winter',name:'the Fair-to-Winterings greenway',cls:'lane',pts:[[FAIR.c[0]-122,FAIR.c[1]-20],winAt(95,-45),winAt(42,-48)]},
  {id:'cairn lane',name:'the cairn lane',cls:'lane',pts:[R2[1],R3[1],[CAIRN[0],CAIRN[1]-26]]},
  {id:'ice lane',name:'the Icegarth lane',cls:'lane',pts:[R3[0],[along(sIce0-90,195).x,along(sIce0-90,195).z],[along(sIce1,182).x,along(sIce1,182).z]]},
  {id:'rope lane',name:'the Ropewalk lane',cls:'lane',pts:[R1[6],R2[6],R3[6],[along(sRope1+34,158).x,along(sRope1+34,158).z],[along(sRope0-34,158).x,along(sRope0-34,158).z]]},
  {id:'beck lane',name:'the river meadow lane',cls:'side',pts:[W(46,-36),R1[7],R2[7],R3[7]]},
  /* Market perimeter streets, two crooked concentric ring lanes round the centre, and short crooked croft spurs (no hard outer polygon road) */
  {id:'market-ring',name:'the Market square street',cls:'main',pts:[R0[0],R0[1],R0[2],R0[3],R0[0]]},
  {id:'ring-inner',name:'the inner ring lane',cls:'side',pts:R1.concat([R1[0]])},
  {id:'ring-middle',name:'the middle ring lane',cls:'side',pts:R2.concat([R2[0]])},
  {id:'spur-se',name:'the south-east croft lane',cls:'lane',pts:[W(184,186),W(212,248),W(164,284)]},
  {id:'spur-s',name:'the south garth lane',cls:'lane',pts:[W(8,234),W(18,292),W(-44,304)]},
  {id:'spur-sw',name:'the west fell spur',cls:'lane',pts:[W(-182,162),W(-238,208),W(-292,184)]},
  {id:'spur-nw',name:'the north-west garth lane',cls:'lane',pts:[W(-176,-148),W(-228,-196),W(-168,-242)]},
  {id:'spur-n',name:'the river-meadow spur',cls:'lane',pts:[W(6,-222),W(14,-274),W(68,-268)]}];
 function lineD(x,z,P){let d=1e9;for(let i=0;i+1<P.length;i++)d=Math.min(d,G.segD(x,z,P[i],P[i+1]));return d;}
 function clip(P,h){const inside=p=>Math.abs(p[0])<=h&&Math.abs(p[1])<=h,out=[];
  const cut=(a,b)=>{let lo=0,hi=1;for(let k=0;k<40;k++){const m=(lo+hi)/2,q=[a[0]+(b[0]-a[0])*m,a[1]+(b[1]-a[1])*m];if(inside(q)===inside(a))lo=m;else hi=m;}return[a[0]+(b[0]-a[0])*lo,a[1]+(b[1]-a[1])*lo];};
  for(let i=0;i<P.length;i++){const p=P[i],a=i?P[i-1]:null;if(a&&inside(a)!==inside(p))out.push(cut(a,p));if(inside(p))out.push(p);}return out;}

 // ---------------------------------------------------------------- pools, people counts & foreign mission footprints
 const POOLS={rich:[['fg-longhouse',3.4],['fg-house',3.2],['fg-store',.45],['fg-granary',.35],['fg-smithy',.28],['fg-smokehouse',.25]],
  middle:[['fg-longhouse',3.2],['fg-house',3.4],['fg-hut',1.2],['fg-smokehouse',.38],['fg-barn',.35],['fg-granary',.28],['fg-smithy',.24],['fg-tannery',.22],['fg-store',.25]],
  poor:[['fg-hut',3.6],['fg-house',2.6],['fg-longhouse',1.6],['fg-tannery',.3],['fg-smokehouse',.35],['fg-barn',.25]]};
 const SMALL={rich:[['fg-house',1]],middle:[['fg-house',1.2],['fg-hut',1]],poor:[['fg-hut',1],['fg-house',.6]]};
 /* tight market-town frontage and courtyard packing round the Market, looser at the outer croft edge */
 const GAPS={rich:[2.1,4.5],middle:[2.1,4.6],poor:[3.2,6.4]};
 const PEOPLE={'fg-hut':4,'fg-house':6,'fg-longhouse':7,'fg-headhouse':10,
  xa_serai:40,xa_barracks:40,xa_rich_c:16,xa_mid_a:8,xa_teahouse:4,xa_temple:4,xa_bath:2,xa_warehouse:0,
  dalab_noble_c:14,dalab_temple:6,dalab_priest_house:6,dalab_scribes:8,dalab_inn:24,dalab_warehouse:0,dalab_shops:8,
  dalab_rowhouse:18,dalab_tenement:16,dalab_compound:12,dalab_well:0,dalab_watchtower:4,dalab_shrine:0};
 const XDIMS={xa_serai:[46,46,12],xa_temple:[34,32,19],xa_rich_c:[32,18,15],xa_barracks:[36,34,11],xa_teahouse:[16,16,8],xa_pens:[14,14,1.5],
  xa_bath:[34,38,17],xa_mid_a:[14,14,14],xa_warehouse:[30,20,11],xa_watch:[26,20,20]};
 const DDIMS={dalab_noble_c:[30,28,13],dalab_temple:[26,30,14],dalab_priest_house:[14,14,8],dalab_scribes:[24,20,9],
  dalab_inn:[32,30,10],dalab_warehouse:[28,20,9],dalab_shops:[20,14,10],dalab_rowhouse:[20,14,7],dalab_tenement:[16,14,10],
  dalab_compound:[20,20,7],dalab_well:[10,10,5],dalab_watchtower:[12,12,17],dalab_shrine:[8,8,5]};

 // ---------------------------------------------------------------- Traveller culture row from core/camp/fellgang/52-camp-fellgang.js
 function ensureTravellerRow(){if(typeof KCAMP==='undefined'||!KCAMP.CULTURES||!KCAMP.CULTURES.traveller)
  throw new Error('BK_TOWN: load core/camp/fellgang/52-camp-fellgang.js before 69bn-bk-town.js');
  return KCAMP.CULTURES.traveller;}

 function make(o){o=o||{};const seed=D0(o.seed,44120);
  const out={records:[],ways:WAYS,blocks:BLOCKS,quarters:QUARTERS,zone:ZONE,frame:{U,N,riverV:RV},err:null,refused:[],camps:[],
   people:{town:0,dalab:0,tears:0,travellers:0}};
  const dims=(key,v)=>{if(XDIMS[key]){const d=XDIMS[key];return{key,v:v||0,w:d[0],d:d[1],h:d[2]};}
   if(DDIMS[key]){const d=DDIMS[key];return{key,v:v||0,w:d[0],d:d[1],h:d[2]};}
   const d=o.dims(key);return d?{key,v:v||0,w:d.w,d:d.d,h:d.h}:null;};
  const TUNE={cell:2.5,rasterHalf:1800,maxSlope:.32,exact:true,width:{avenue:10,main:MAIN,side:LANE,alley:3,highway:10,lane:4},
   lot:{side:1.2,setback:1.1,rear:2.2,inset:.8,step:2.5},classes:{middle:[['fg-house',0]],poor:[['fg-hut',0]]},fallback:{middle:'poor',poor:null}};
  const META={};
  let C=null;
  try{const L=KCITY.lib;
   const put=(key,c,f,b,meta,mg)=>{for(let k=0;k<14;k++){const a=k*2.399,r=k?2.5+k*1.6:0,p=[c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r];
     const Lt=KCITY.courts.place(key,p,f,b,{margin:mg==null?.65:mg},meta.kind);if(Lt){META[Lt.id]=meta;return Lt;}}
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
     for(const w of WAYS){const P=clip(w.pts,TUNE.rasterHalf-20);if(P.length<2)continue;const way=SL.addWay(w.cls,P,2.5,{tag:w.id});way.kind=w.id;}
     SL.note(3,WAYS.length+' ways');}},
    {name:'the quarters\' buildings',run(){
     const toRiver=[-N[0],-N[1]],toTown=N,toU=U,toMinusU=[-U[0],-U[1]];
     // 1. The Marketplace: sworn zone of truce and hospitality round the 92 x 72 m flagged square, Peace Ring, civic halls and Market dugout ice-house
     put('fg-doublehall',W(-68,4),toU,blk('b0.hall-w'),{kind:'hall',quarter:'market',variant:'double',name:'The double meeting hall (both customs in one: the Fowlers\' rope wall and the Ice-cutters\' tally board)'});
     put('fg-smithy',W(-68,-18),toU,blk('b0.hall-w'),{kind:'smithy',quarter:'market',name:'A salvage-smithy on the Market'});
     put('fg-markethall',W(68,-4),toMinusU,blk('b0.hall-e'),{kind:'markethall',quarter:'market',name:'The market hall (the weigh-beam and the salt counters)'});
     put('fg-store',W(68,18),toMinusU,blk('b0.hall-e'),{kind:'store',quarter:'market',name:'The Fair wardens\' store on the Market'});
     put('fg-headhouse',W(0,-54),toTown,blk('b0.head'),{kind:'head',quarter:'market',name:'The head\'s house'});
     put('fg-store',W(-24,-54),toTown,blk('b0.head'),{kind:'store',quarter:'market',name:'A general store on the Market'});
     put('fg-granary',W(24,-54),toTown,blk('b0.head'),{kind:'granary',quarter:'market',name:'The town granary on the Market'});
     put('fg-halting-house',W(-20,54),toRiver,blk('b0.halting'),{kind:'halting',quarter:'market',name:'The west halting house (an inn on the Market)'});
     put('fg-halting-house',W(20,54),toRiver,blk('b0.halting'),{kind:'halting',quarter:'market',name:'The east halting house (an inn on the Market)'});
     put('fg-dugout-icehouse',W(0,75),toRiver,blk('b0.halting'),{kind:'dugout',quarter:'market',character:'low',name:'The Market dugout ice-house (earth-bermed cold cellar serving the inns and stalls)'});
     for(const [u,v,f] of [[-21,-17,toTown],[21,-17,toTown],[-21,17,toRiver],[21,17,toRiver],[-31,-11,toU],[-31,11,toU],[31,-11,toMinusU],[31,11,toMinusU]])
      put('fg-booth',W(u,v),f,blk('market'),{kind:'booth',quarter:'market',name:'Market booths'},.35);

     // 2. The Dalab mission near the centre of town (sector bm.0, ~185 m ESE of the Marketplace, 100-150 people)
     {const bD=blk('bm.0'),dm=(kind,name)=>({kind,quarter:'dalab',set:'dalab',name});
      /* bilinear coordinate inside trapezoid bm.0 (su 0..1 from inner ring to middle ring, sv 0..1 north to south) */
      const dAt=(su,sv)=>{const a0=R1UV[0],a1=R1UV[1],b0=R2UV[0],b1=R2UV[1];
       const u=(a0[0]*(1-sv)+a1[0]*sv)*(1-su)+(b0[0]*(1-sv)+b1[0]*sv)*su;
       const v=(a0[1]*(1-sv)+a1[1]*sv)*(1-su)+(b0[1]*(1-sv)+b1[1]*sv)*su;return W(u,v);};
      const fW=toMinusU,fE=toU,fN=toRiver,fS=toTown;
      put('dalab_temple',dAt(.66,.46),fW,bD,dm('dalab-temple','The Dalab Mission'),.45);
      put('dalab_priest_house',dAt(.84,.58),fW,bD,dm('dalab-priest','Dalab genepriests\' house'),.45);
      put('dalab_noble_c',dAt(.50,.20),fS,bD,dm('dalab-manor','Dalab chief factor\'s manor'),.45);
      put('dalab_scribes',dAt(.24,.26),fE,bD,dm('dalab-scribes','Dalab scribes\' reckoning hall'),.45);
      put('dalab_inn',dAt(.56,.74),fN,bD,dm('dalab-inn','Dalab caravan lodge'),.45);
      put('dalab_warehouse',dAt(.24,.72),fE,bD,dm('dalab-store','Dalab toll and caravan store'),.45);
      put('dalab_shops',dAt(.20,.50),fE,bD,dm('dalab-shops','Dalab factors\' exchange row'),.45);
      put('dalab_rowhouse',dAt(.80,.20),fS,bD,dm('dalab-row','Dalab clerks\' row'),.45);
      put('dalab_rowhouse',dAt(.82,.80),fN,bD,dm('dalab-row','Dalab guards\' row'),.45);
      put('dalab_tenement',dAt(.38,.48),fE,bD,dm('dalab-tenement','Dalab retainers\' house'),.45);
      put('dalab_compound',dAt(.86,.40),fW,bD,dm('dalab-compound','Dalab hired men\'s compound'),.45);
      put('dalab_well',dAt(.44,.38),fW,bD,dm('dalab-well','Dalab mission well'),.35);
      put('dalab_watchtower',dAt(.15,.16),fW,bD,dm('dalab-watch','Dalab mission watchtower'),.35);}

     // 3. The Icegarth: eight great vaulted town ice houses, four barrows and three earth-bermed dugout ice-houses behind the six ponds
     for(let k=0;k<12;k++){const s=sIce0+(k>>1)*92+(k&1)*46,a=along(s,(k&1)?266:214),great=k<8;
      put(great?'fg-great-icehouse':'fg-icehouse',[a.x,a.z],toRiver,QB('icegarth'),{kind:'icehouse',quarter:'icegarth',character:'low',name:great?'A great ice house of the Icegarth':'An ice house of the Icegarth'});}
     for(let k=0;k<3;k++){const a=along(sIce0+68+k*184,296);put('fg-dugout-icehouse',[a.x,a.z],toRiver,QB('icegarth'),{kind:'dugout',quarter:'icegarth',character:'low',name:'A dugout ice-house of the Icegarth'});}
     for(let k=0;k<3;k++){const a=along(sIce0-115+k*26,236);put('fg-sledgeshed',[a.x,a.z],toRiver,QB('icegarth'),{kind:'sledges',quarter:'icegarth',character:'low',name:'The Icegarth\'s sledge shed'});}
     put('fg-store',[along(sIce0-72,282).x,along(sIce0-72,282).z],toRiver,QB('icegarth'),{kind:'store',quarter:'icegarth',character:'low',name:'The Icegarth\'s reckoning house'});

     // 4. The Ropewalk: five 44 m town rope-walk ranges end to end along the bank (~225 m); egg stores, dugout ice-cellar and two tanneries behind
     for(let k=0;k<5;k++){const a=along(sRope0+24+k*46,82);put('fg-ropewalk',[a.x,a.z],toTown,QB('ropewalk'),{kind:'ropewalk',quarter:'ropewalk',character:'stony',name:'The town rope walk (range '+(k+1)+' of 5)'});}
     for(let k=0;k<5;k++){const a=along(sRope0+20+k*48,118);put('fg-eggstore',[a.x,a.z],toTown,QB('ropewalk'),{kind:'eggstore',quarter:'ropewalk',character:'stony',name:'An egg and honey store (the Fowlers\' take)'});}
     for(let k=0;k<2;k++){const a=along(sRope0+44+k*110,136);put('fg-tannery',[a.x,a.z],toTown,QB('ropewalk'),{kind:'tannery',quarter:'ropewalk',character:'stony',name:'A tannery and felt house on the leat'});}
     {const a=along(sRope0+204,138);put('fg-dugout-icehouse',[a.x,a.z],toRiver,QB('ropewalk'),{kind:'dugout',quarter:'ropewalk',character:'low',name:'The Fowlers\' dugout ice-cellar'});}

     // 5. The Folds (west drove-road lobe bo.4) and the carriers' yard (east stair-road lobe bo.7)
     {const bF=blk('bo.4');
      for(let a=0;a<4;a++)for(let c=0;c<4;c++){const u=-272-a*24,v=-44+c*34;
       const key=a===1&&c===1?'fg-granary':a===2&&c===2?'fg-tannery':(a+c)%5===0?'fg-barn':'fg-pens';
       put(key,W(u,v),c%2?toTown:toRiver,bF,{kind:key==='fg-granary'?'granary':key==='fg-tannery'?'tannery':'folds',quarter:'folds',
        name:key==='fg-granary'?'A granary of the Folds':key==='fg-tannery'?'A hide and felt house of the Folds':key==='fg-barn'?'A hay barn of the Folds':'The beast pens of the Folds'},.5);}}
     {const bY=blk('bo.7');
      const yAt=(su,sv)=>{const a0=R2UV[7],a1=R2UV[0],b0=R3UV[7],b1=R3UV[0];
       const u=(a0[0]*(1-sv)+a1[0]*sv)*(1-su)+(b0[0]*(1-sv)+b1[0]*sv)*su;
       const v=(a0[1]*(1-sv)+a1[1]*sv)*(1-su)+(b0[1]*(1-sv)+b1[1]*sv)*su;return W(u,v);};
      const items=[['fg-halting-house',.45,.20],['fg-smithy',.45,.36],['fg-sledgeshed',.45,.54],['fg-sledgeshed',.45,.72],['fg-pens',.74,.38],['fg-pens',.74,.68]];
      for(const [key,su,sv] of items)put(key,yAt(su,sv),toTown,bY,{kind:key==='fg-halting-house'?'halting':key==='fg-smithy'?'smithy':'yard',quarter:'yard',
       name:key==='fg-halting-house'?'The carriers\' halting house':key==='fg-smithy'?'The carriers\' salvage-smithy':key==='fg-sledgeshed'?'A carriers\' sledge shed':'A carriers\' pens'},.5);}

     // 6. The Fairfell: twelve fair pens south of the oval ring, eight booth rows along its north walk, judges' stand and weigh-house
     for(let k=0;k<12;k++){const c=[FAIR.c[0]-135+(k%6)*54,FAIR.c[1]+68+Math.floor(k/6)*38];put('fg-pens',c,[0,-1],QB('fairfell'),{kind:'fairpens',quarter:'fairfell',name:'The Fair\'s pens'});}
     for(let k=0;k<8;k++){const c=[FAIR.c[0]-98+k*28,FAIR.c[1]-FAIR.rz-24];put('fg-booth',c,[0,1],QB('fairfell'),{kind:'booth',quarter:'fairfell',name:'The Fair\'s stalls'});}
     put('fg-fair-stand',[FAIR.c[0]+FAIR.rx+16,FAIR.c[1]],[-1,0],QB('fairfell'),{kind:'fairstand',quarter:'fairfell',name:'The Fair judges\' stand'});
     put('fg-markethall',[FAIR.c[0]+144,FAIR.c[1]-36],[-1,0],QB('fairfell'),{kind:'markethall',quarter:'fairfell',name:'The Fair\'s weigh-house'});

     // 7. The cairn hall
     put('fg-cairnhall',CAIRN,toRiver,QB('cairn'),{kind:'cairnhall',quarter:'cairn',name:'The cairn hall'});

     // 8. The Golden Tears' compound (the Xanadu kit): walled compound on the caravan road east of the town
     {const T=TEARS,cs=Math.cos(T.ry),sn=Math.sin(T.ry),at=(lx,lz)=>[T.c[0]+lx*cs+lz*sn,T.c[1]-lx*sn+lz*cs],fz=[sn,cs],fb=[-sn,-cs],fw=[-cs,sn];
      const tb={id:'q:tears',kind:'rich',wealth:.8},m=(kind,name)=>({kind,quarter:'tears',set:'xa',name:'The Golden Tears\' mission: '+name});
      put('xa_serai',at(-50,10),fz,tb,m('serai','the escort\'s caravanserai'));put('xa_rich_c',at(30,-45),fz,tb,m('factor','the factor\'s house'));
      put('xa_temple',at(55,20),fw,tb,m('decree','the hall of the Decree'));put('xa_barracks',at(-45,-52),fz,tb,m('barracks','the escort\'s barracks'));
      put('xa_teahouse',at(10,50),fb,tb,m('teahouse','the teahouse'));put('xa_warehouse',at(8,-58),fz,tb,m('store','the store of the caravan\'s goods'));
      put('xa_bath',at(70,-42),fb,tb,m('bath','the bath'));
      for(let k=0;k<4;k++)put('xa_mid_a',at(-84+k*22,62),fb,tb,m('house','a household\'s house'));
      put('xa_pens',at(-84,-62),fz,tb,m('pens','the escort\'s pens'));}}},
    {name:'the house blocks: dense frontage and courts round the Market',run(){const P=L.plan();
     P.courts=KCITY.strategies['frontage-courts'].run(BLOCKS.filter(b=>b.use==='houses'),
      {step:6,focus:W(0,0),sides:6,pools:POOLS,small:SMALL,gaps:GAPS,garden:{rich:.07,middle:.09,poor:.16},margin:.7,setback:1.5,
       lane:{w:4.2,min:94},infill:{step:6.8,jitter:1.4,yard:.22,yardR:6.5,reach:20,yardReach:24,dooryard:1.8}});}}];
   C=KCITY.create({name:'blakhed',tune:TUNE,seed,rand:'krand',index:{order:'insertion'},ground:{h:G.h},kit:{dims},steps});
   const PL=C.run();out.plan=PL;
   const courts=new Set(((PL.courts||{}).lots||[]).map(l=>l.id));
   for(const Lt of PL.lots){if(Lt.died!=null)continue;const M=META[Lt.id];if(!M&&!courts.has(Lt.id))continue;
    const r={id:'bk.lot.'+Lt.id,lot:Lt.id,key:Lt.key,set:M&&M.set||'fg',x:Lt.x,z:Lt.z,ry:Lt.ry,w:Lt.w,d:Lt.d,h:Lt.h,kind:M?M.kind:'house',quarter:M?M.quarter:'houses',cls:Lt.cls,
     name:M&&M.name,variant:M&&M.variant,character:M&&M.character,people:D0(PEOPLE[Lt.key],0)};
    if(r.kind==='halting'||r.kind==='store')r.people=0;
    if(!r.character&&r.set==='fg'){const uv=UV(r.x,r.z);r.character=uv[1]<-160?'stony':uv[0]>220?'low':(hash(r.id)%3===0?'stony':null);}
    out.records.push(r);
    if(r.quarter==='tears')out.people.tears+=r.people;
    else if(r.quarter==='dalab')out.people.dalab+=r.people;
    else out.people.town+=r.people;}
  }catch(e){out.err=String(e&&e.stack||e);}
  out.lots=out.records.length;out.instance=C;

  // ---------------------------------------------------------------- The Winterings: Irish Traveller / Romani campground on core/camp (KCAMP)
  // Seven extended-family rings & horseshoes pitched off the winding halting track round central tripod campfires, each with its
  // painted spoked vardos (fg-wagon), arched bender tents (fg-bender), tinsmith & clothesline pitch (fg-tinsmith), lantern posts
  // and downwind hurdle-fenced pony paddock!
  out.pieces=[];
  {const TR=ensureTravellerRow();
   const pDims=k=>TR.pending&&TR.pending[k]||dims(k)||{w:4,d:4,h:2.5};
   const CLANS=[
    {id:'tr.connors',name:'The Connors family circle',at:[106,-62],toTrack:[95,-105],wagons:9,benders:3,halts:1,form:'horseshoe',common:9.5},
    {id:'tr.ward',name:'The Ward family circle',at:[46,-98],toTrack:[42,-48],wagons:8,benders:3,halts:0,form:'horseshoe',common:8.8},
    {id:'tr.boswell',name:'The Boswell family ring',at:[64,8],toTrack:[42,-48],wagons:9,benders:2,halts:1,form:'ring',common:9.2},
    {id:'tr.joyce',name:'The Joyce family circle',at:[-8,-58],toTrack:[-8,4],wagons:8,benders:3,halts:1,form:'horseshoe',common:8.6},
    {id:'tr.lovell',name:'The Lovell family circle',at:[-6,64],toTrack:[-8,4],wagons:8,benders:2,halts:1,form:'horseshoe',common:8.8},
    {id:'tr.mcdonagh',name:'The McDonagh family ring',at:[-68,-10],toTrack:[-58,52],wagons:8,benders:3,halts:0,form:'ring',common:8.6},
    {id:'tr.cooper',name:'The Cooper family circle',at:[-88,88],toTrack:[-112,92],wagons:8,benders:2,halts:1,form:'horseshoe',common:8.6}];
   const campOk=(x,z)=>!WAYS.some(w=>lineD(x,z,w.pts)<WIDTH[w.cls]/2+2.6)&&!out.records.some(r=>Math.hypot(r.x-x,r.z-z)<Math.hypot(r.w,r.d)/2+4);
   for(let ci=0;ci<CLANS.length;ci++){const cl=CLANS[ci],sc=winAt(cl.at[0],cl.at[1]),tk=winAt(cl.toTrack[0],cl.toTrack[1]);
    const way=[tk[0]-sc[0],tk[1]-sc[1]],wl=Math.hypot(way[0],way[1])||1,wu=[way[0]/wl,way[1]/wl];
    const prog={tents:[{key:'fg-wagon',n:cl.wagons},{key:'fg-bender',n:cl.benders}].concat(cl.halts?[{key:'fg-halt',n:cl.halts}]:[]).concat([{key:'fg-tinsmith',n:1}]),pens:[]};
    const cen=typeof KCAMP!=='undefined'?KCAMP.census({id:cl.id,world:seed+50,culture:'traveller',program:prog}):{pop:cl.wagons*6+cl.benders*4};
    const cp=typeof KCAMP!=='undefined'?KCAMP.pitch({id:cl.id,world:seed+50,culture:'traveller',program:prog,site:{x:sc[0],z:sc[1]},
     dims:pDims,ground:{ok:campOk},way:wu,wind:[-wu[0],-wu[1]],formation:cl.form,gap:1.15,common:cl.common}):null;
    if(cp&&cp.records.length){
     out.people.travellers+=cen.pop||0;
     cp.records.forEach((pr,pi)=>{const hh=hash(pr.id);
      out.pieces.push({id:'bk.'+pr.id,key:pr.key,x:pr.x,z:pr.z,ry:pr.ry+((hh%7)-3)*.035,v:(ci*5+pi)%12,quarter:'winterings',family:cl.id,
       name:cl.name+': '+(pr.key==='fg-wagon'?'a family vardo':pr.key==='fg-bender'?'a bender tent':pr.key==='fg-tinsmith'?'the tinsmith pitch and washing line':'a road shelter')});});
     /* central family campfire with iron tripod kettle, and a lantern stake by the horseshoe's mouth */
     out.pieces.push({id:'bk.hearth.'+cl.id,key:'fg-camp-hearth',x:cp.hearth.x,z:cp.hearth.z,ry:ci*1.1,v:ci%4,quarter:'winterings',family:cl.id,name:cl.name+': campfire and tripod kettle'});
     out.pieces.push({id:'bk.camplamp.'+cl.id,key:'fg-lantern-post',x:sc[0]+wu[0]*(cp.R+2.2)-wu[1]*3.6,z:sc[1]+wu[1]*(cp.R+2.2)+wu[0]*3.6,ry:0,quarter:'winterings'});
     /* downwind pony/cob paddock of hurdles behind each family circle (leaving a gate facing the vardos) */
     const pdDist=cp.R+12.5,px0=sc[0]-wu[0]*pdDist,pz0=sc[1]-wu[1]*pdDist,prx=7.8,prz=6.2,pry=Math.atan2(-wu[0],-wu[1]);
     const pcs=Math.cos(pry),psn=Math.sin(pry),pat=(lx,lz)=>[px0+lx*pcs+lz*psn,pz0-lx*psn+lz*pcs];
     const sides=[[[-prx,-prz],[prx,-prz],3],[[prx,-prz],[prx,prz],2],[[prx,prz],[-prx,prz],3],[[-prx,prz],[-prx,-prz],2]];
     let hi=0;for(let si=0;si<4;si++){const [a0,b0,nh]=sides[si],p0=pat(a0[0],a0[1]),p1=pat(b0[0],b0[1]);
      for(let k=0;k<nh;k++){if(si===2&&k===1)continue;   /* gate facing the family ring */
       const t=(k+.5)/nh,hx=p0[0]+(p1[0]-p0[0])*t,hz=p0[1]+(p1[1]-p0[1])*t;
       if(campOk(hx,hz))out.pieces.push({id:'bk.paddock.'+ci+'.'+(hi++),key:'fg-fair-hurdle',x:hx,z:hz,ry:Math.atan2(p1[0]-p0[0],p1[1]-p0[1])-Math.PI/2,v:(ci+k)%3,quarter:'winterings',name:cl.name+': pony corral hurdle'});}}
     out.camps.push({id:cl.id,name:cl.name,x:sc[0],z:sc[1],R:cp.R,way:wu,pop:cen.pop||0,paddock:{x:px0,z:pz0,w:prx*2,d:prz*2,ry:pry},records:cp.records.length});}}
   /* central Camp Green gathering fire & horse-flashing hurdle rail along the green */
   const cg=winAt(22,-18);
   out.pieces.push({id:'bk.hearth.green',key:'fg-camp-hearth',x:cg[0],z:cg[1],ry:.4,v:0,quarter:'winterings',name:'The Winterings green: the elders\' council fire'});
   for(let k=0;k<6;k++){const p0=winAt(36-k*14,-28),p1=winAt(36-(k+1)*14,-28);if(campOk(p0[0],p0[1]))
    out.pieces.push({id:'bk.trot.'+k,key:'fg-fair-hurdle',x:p0[0],z:p0[1],ry:Math.atan2(p1[0]-p0[0],p1[1]-p0[1])-Math.PI/2,v:k%3,quarter:'winterings',name:'The Travellers\' cob-trotting rail'});}

   /* lantern posts along the Market's streets and the main roads in the town, every 34 m */
   for(const w of WAYS.filter(w=>w.cls==='main'))for(let i=0;i+1<w.pts.length;i++){const a=w.pts[i],b=w.pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let t=16;t<L;t+=34){const x=a[0]+(b[0]-a[0])*t/L,z=a[1]+(b[1]-a[1])*t/L;if(Math.hypot(x,z)>760)continue;const nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
     out.pieces.push({id:'bk.lamp.'+w.id+'.'+i+'.'+Math.round(t),key:'fg-lantern-post',x:x+nx*(MAIN/2+1.1),z:z+nz*(MAIN/2+1.1),ry:0,quarter:'lanes'});}}
   /* the Icegarth's tool racks by each pond */
   for(const p of G.ponds)out.pieces.push({id:'bk.icetools.'+p.id,key:'fg-ice-tools',x:p.x+p.nx*(p.d/2+6),z:p.z+p.nz*(p.d/2+6),ry:Math.atan2(-p.nx,-p.nz),quarter:'icegarth'});
   /* the Fair's oval ring hurdles (leaving gates north and south), the Fair cairn, the Market sanctuary ring & boundary stones, and road signs */
   const nh=72;for(let k=0;k<nh;k++){if(k===0||k===1||k===36||k===37)continue;const a=k/nh*Math.PI*2,a1=(k+1)/nh*Math.PI*2;
    const x=FAIR.c[0]+Math.cos(a)*FAIR.rx,z=FAIR.c[1]+Math.sin(a)*FAIR.rz,dx=Math.cos(a1)*FAIR.rx-Math.cos(a)*FAIR.rx,dz=Math.sin(a1)*FAIR.rz-Math.sin(a)*FAIR.rz;
    out.pieces.push({id:'bk.hurdle.'+k,key:'fg-fair-hurdle',x,z,ry:Math.atan2(dx,dz)-Math.PI/2,v:k%3,quarter:'fairfell'});}
   /* Central Peace Sanctuary Ring: the standing Peace Stone + communal Hospitality Hearth & kettle + 4 compass oath-cairns */
   const mp=W(-1.8,0),mh=W(3.4,0);
   out.pieces.push({id:'bk.peace.stone',key:'fg-cairn',x:mp[0],z:mp[1],ry:Math.atan2(N[0],N[1]),v:0,quarter:'market',name:'The peace stone (where a quarrel is sworn off: the market peace)'});
   out.pieces.push({id:'bk.market.hearth',key:'fg-camp-hearth',x:mh[0],z:mh[1],ry:.5,v:0,quarter:'market',name:'The Market hospitality hearth (perpetual kettle and fire for guests entering the truce)'});
   /* 16 stone truce & hospitality boundary posts marking the Marketplace sanctuary perimeter (8 paired gate monoliths + 8 corner/flank stones) */
   const yawU=Math.atan2(U[0],U[1]),yawN=Math.atan2(N[0],N[1]);
   const trucePosts=[
    /* West Drove Gate (paired gate stones with braziers, facing -U) */ [-40.2,-5.4,yawU+Math.PI,0,'West Truce Gate (north stone)'],[-40.2,5.4,yawU+Math.PI,2,'West Truce Gate (south stone)'],
    /* East Caravan/Dalab Gate (facing +U) */ [40.2,-5.4,yawU,0,'East Truce Gate (north stone)'],[40.2,5.4,yawU,2,'East Truce Gate (south stone)'],
    /* North Head's Gate (facing -N) */ [-5.4,-30.2,yawN+Math.PI,0,'North Truce Gate (west stone)'],[5.4,-30.2,yawN+Math.PI,2,'North Truce Gate (east stone)'],
    /* South Inns/Fair Gate (facing +N) */ [-5.4,30.2,yawN,2,'South Truce Gate (west stone)'],[5.4,30.2,yawN,0,'South Truce Gate (east stone)'],
    /* Four Sanctuary Corners (with braziers) */ [-40.2,-30.2,yawN+Math.PI+.6,0,'North-west Truce Corner'],[40.2,-30.2,yawN+Math.PI-.6,2,'North-east Truce Corner'],
    [40.2,30.2,yawN+.6,0,'South-east Truce Corner'],[-40.2,30.2,yawN-.6,2,'South-west Truce Corner'],
    /* Four Mid-Boundary Flank Stones */ [-22.5,-30.2,yawN+Math.PI,1,'North truce boundary stone'],[22.5,-30.2,yawN+Math.PI,3,'North truce boundary stone'],
    [-22.5,30.2,yawN,3,'South truce boundary stone'],[22.5,30.2,yawN,1,'South truce boundary stone']];
   trucePosts.forEach((tp,ti)=>{const p=W(tp[0],tp[1]);
    out.pieces.push({id:'bk.truce.'+ti,key:'fg-truce-post',x:p[0],z:p[1],ry:tp[2],v:tp[3],quarter:'market',name:'The Market Truce: '+tp[4]});});
   out.pieces.push({id:'bk.fair.cairn',key:'fg-cairn',x:FAIR.c[0]+FAIR.rx+26,z:FAIR.c[1]+12,ry:0,v:2,quarter:'fairfell',name:'The Fair judges\' cairn'});
   for(const [id,p,v] of [['drove',W(-370,-52),0],['stair',W(370,-60),1],['ice',W(95,335),2],['caravan',W(255,134),3]])
    out.pieces.push({id:'bk.sign.'+id,key:'fg-stone-sign',x:p[0],z:p[1],ry:v*1.1,v,quarter:'lanes'});}
  /* pieces stay off town building footprints and off roadways (camp pieces already passed KCAMP's OBB + campOk check) */
  out.pieces=out.pieces.filter(p=>p.id==='bk.peace.stone'||p.id==='bk.market.hearth'||p.key==='fg-truce-post'||(!out.records.some(r=>Math.hypot(r.x-p.x,r.z-p.z)<Math.hypot(r.w,r.d)/2+2.2)&&!WAYS.some(w=>p.key!=='fg-lantern-post'&&p.key!=='fg-stone-sign'&&lineD(p.x,p.z,w.pts)<WIDTH[w.cls]/2+2.2)));
  return out;}
 return{make,frame:{U,N,W,UV},BLOCKS,QUARTERS,WAYS,WIDTH,MARKET,DALAB,FAIR,WINTER,CAIRN,TEARS,lineD,PEOPLE,XDIMS,DDIMS,ropewalk:[sRope0,sRope1],icegarth:[sIce0,sIce1]};
})();
