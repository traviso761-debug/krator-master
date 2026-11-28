// ================================================================= GIHON — the Landing on its stone piers (records for the region; draws nothing)
// [G data] Step G3 of PLAN.md (section 6; the owner, 2026-11-17: "the Landing, at the mouth of the Alph, will also be a little
// bigger, a village of 2.5k, built along monumental stone piers on either side of the river mouth"; 2026-11-22: "Keep at the
// outlet"). The barges' stop at the Lower Xanadu Lake's outlet (the tune's ll.landing, 932,1600: its cell beside the mouth), where
// the river leaves the lake for the cataracts past Qiblai, and the portage road's head. Over core/hamlet's 500, so laid in full on
// core/city (BUILD-OUT question 1): two instances, one a bank, each its quay street along the river, its lots behind; the two
// piers run out into the lake either side of the mouth, the barges' berths on their river faces; the transfer sheds, the barge
// office and the ox-cart yards at the portage road's head on the south bank, the temple and the serai on the north.
//
// THE FRAME   records in metres east (x) and south (z) of the mouth, scale model 5.1 px GH_LANDING.PX (933.4,1598.2: the
//             model's last dry cell before the lake, the river's first point 932,1598 just west); y over the lake. The river's
//             axis runs west-south-west (to 927,1596: Nahr ash-Shalālāt's line), u along it downstream, v across it (south +).
//             The ground is the Landing's own design (the model's cells round it are 11-30 m over the lake and 2 km wide): the
//             banks 2.5 m over the water, rising 14 m a km away from it; the river 180 m wide (1,180 m3/s) in a 4 m channel.
//
// GH_LANDING.make({dims, seed}) -> {lots, ways, piers, extra, census, frame, notes}: the records a region draws on its own ground
var GH_LANDING=(function(){
 const PX=[933.4,1598.2];
 const L0=Math.hypot(5,2),UL=[-5/L0,-2/L0],VL=[2/L0,-5/L0];   /* u downstream (west-south-west), v across it (+v the north bank) */
 const SOUTH=-1;   /* the south bank's side of v */
 const at=(u,v)=>[UL[0]*u+VL[0]*v,UL[1]*u+VL[1]*v],uvOf=([x,z])=>[x*UL[0]+z*UL[1],x*VL[0]+z*VL[1]];
 const RIVER={half:90,depth:4};
 const sm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);};
 /* the ground: the lake east of the mouth (u < 0 and off the piers), the river's channel along u > 0, the banks rising away */
 function h(x,z){const [u,v]=uvOf([x,z]),av=Math.abs(v);let y=2.5+Math.max(0,av-RIVER.half-20)*.014;
  if(u<0){const k=sm(0,-60,u);y=y*(1-k)+(-1.5-Math.min(30,(-u)*.03))*k;}   /* the lake's bed east of the shore line */
  if(av<RIVER.half+12&&u>-20){const k=sm(RIVER.half+12,RIVER.half-6,av);y=Math.min(y,y*(1-k)-RIVER.depth*k);}
  return y;}
 /* the two piers: from the bank at the mouth 220 m out into the lake, 24 m wide, their inner faces 6 m off the river's line */
 const PIER={out:220,w:24,gap:RIVER.half+8};
 /* the zones each bank's instance fills: [bank, name, u0, u1, |v| from the river's line to |v| a1] */
 const BANKS=[['north','the north bank',-10,620,RIVER.half+330],['south','the south bank (the portage road\'s head)',-10,640,RIVER.half+360]];
 const PEOPLE={xa_poor_a:6,xa_poor_b:12,xa_poor_c:4,xa_andean_poor:6,xa_mid_a:7,xa_mid_b:9,xa_mid_c:16,xa_house_turk_a:8,xa_rich_a:12,xa_rich_c:11,xa_house_turk_b:10,
  xa_shops:6,xa_shop_turk_a:8,xa_teahouse:4,xa_workshop:5,xa_smithy:4,xa_warehouse:2,xa_harbour_warehouse:3,xa_serai:20,xa_temple:6,xa_watch:4,xa_customs_house:12,xa_corral:2,xa_granary:0};
 const tune=()=>({cell:2.5,rasterHalf:900,maxSlope:.22,exact:true,width:{avenue:10,main:7,side:5,alley:3,highway:9,lane:4},
  lot:{side:1.6,setback:1.4,rear:3,inset:1,step:3},
  classes:{manor:[['xa_rich_a',0]],rich:[['xa_rich_a',0],['xa_house_turk_b',0]],middle:[['xa_mid_a',0],['xa_mid_b',0],['xa_house_turk_a',0],['xa_mid_c',0]],
   poor:[['xa_poor_a',0],['xa_poor_b',0],['xa_poor_c',0],['xa_andean_poor',0]],shop:[['xa_shops',0],['xa_shop_turk_a',0],['xa_teahouse',0]],tavern:[['xa_teahouse',0]],industrial:[['xa_workshop',0],['xa_smithy',0],['xa_warehouse',0]]},
  fallback:{manor:'rich',rich:'middle',middle:'poor',shop:'middle',tavern:'shop',industrial:'poor',poor:null},
  civic:[],civicSpacing:34,civicJitter:12,voidMax:40,voidIters:12,voidBatch:8,sideSpacing:46,sideMax:160,alleyFrac:.22,blindMax:80,interiorDepth:9,interiorRounds:2,
  avenueSnap:40,ringGap:8,verge:6,mapHalf:900,plazaArt:{rich:[],middle:[],poor:[],commerce:[]}});
 /* the bank's own pieces: [id, key, u, |v| from the river's line, faces 'river' | 'road'] */
 const PIECES={north:[['temple','xa_temple',330,250,'river'],['serai','xa_serai',520,230,'river'],['watch','xa_watch',40,150,'river']],
  south:[['office','xa_customs_house',40,150,'river'],['shed.a','xa_harbour_warehouse',110,140,'river'],['shed.b','xa_harbour_warehouse',170,140,'river'],
   ['shed.c','xa_harbour_warehouse',230,140,'river'],['granary','xa_granary',300,150,'river'],['yard.a','xa_corral',420,190,'road'],['yard.b','xa_corral',450,240,'road'],['watch','xa_watch',560,160,'river']]};
 function make(o){const L=KCITY.lib,SL=L.SL,OCC=L.OCC,Raster=L.Raster,obb=L.obb,obbCorners=L.obbCorners,seed=o.seed==null?41960:o.seed;
  const dims=(k,v)=>{const D=o.dims(k,v);return D?Object.assign({},D,{w:Math.max(D.w,(D.fw||0)+2),d:Math.max(D.d,(D.fd||0)+2)}):null;};
  const face=d=>Math.atan2(d[0],d[1]),xz=([u,v])=>at(u,v),out={lots:[],ways:[],extra:[],piers:[],notes:[]};
  const box=(c,ry,w,d,m)=>{const u=[Math.cos(ry),-Math.sin(ry)];return obb(c,u,w/2+(m||0),d/2+(m||0));};
  for(const [bank,name,u0,u1,a1] of BANKS){const sg=bank==='south'?SOUTH:-SOUTH,vv=a=>sg*a,a0=RIVER.half+30,R0=[u0,0,u1];
   const rect=[[u0,vv(a0)],[u1,vv(a0)],[u1,vv(a1)],[u0,vv(a1)]].map(xz),riverward=face(at(0,-vv(1)).map((n,i)=>n-at(0,0)[i]));
   const steps=[
    {name:'the site and its ground',run(){const R=SL.R=new Raster(L.tune().rasterHalf,L.tune().cell);R.occ.fill(OCC.OUT);const P=L.plan();
     P.site=[{id:0,name,role:'zone',poly:rect}];P.zone=rect;const land=KCITY.site.zoneRaster(R,rect,{dry:1.2,maxSlope:L.tune().maxSlope,h});
     SL.minSpacing=KCITY.site.minSpacing();SL.note(0,name+', '+land+' cells');}},
    {name:'landmarks',run(){const P=L.plan(),CG=L.cg();
     for(const [id,key,u,av,fw] of PIECES[bank]){const D0=dims(key,0);if(!D0)continue;const c=xz([u,vv(av)]),ry=fw==='river'?riverward:riverward+Math.PI,ob=box(c,ry,D0.w,D0.d);
      const Lt={id:P.lots.length,cls:'landmark',role:id,key,v:0,slot:0,wealth:1,x:c[0],z:c[1],y:CG.pad(ob),ry,w:D0.w,d:D0.d,h:D0.h,lot:ob,bo:ob,way:-1,side:0,s:0,born:1,died:null,civic:true,glId:bank+'.'+id};
      P.lots.push(Lt);SL.hashLot(Lt);SL.register(Lt);P.landmarks.push(Lt);SL.R.stampPoly(obbCorners(box(c,ry,D0.w,D0.d,3)),OCC.HARD,Lt.id);}
     SL.note(1,PIECES[bank].length+' pieces of the bank');}},
    {name:'districts',run(){}},
    {name:'avenues',run(){SL.addWay('avenue',[[-10,vv(RIVER.half+40)],[200,vv(RIVER.half+40)],[420,vv(RIVER.half+42)],[R0[2]-10,vv(RIVER.half+44)]].map(xz),3,{tag:'the quay street ('+bank+')'});
     const back=bank==='south'?[[260,vv(RIVER.half+44)],[300,vv(RIVER.half+200)],[380,vv(RIVER.half+330)]]:[[200,vv(RIVER.half+42)],[230,vv(RIVER.half+180)],[260,vv(RIVER.half+320)]];
     SL.addWay('main',back.map(xz),3,{tag:bank==='south'?'the portage road':'the north road'});SL.note(3,'the quay street and the road inland');}},
    {name:'highways',run(){}},{name:'the wall and its gates',run(){}}
   ].concat(KCITY.defaultSteps().slice(6).filter(st=>st.name!=='alleys and alley lots'));
   const C=KCITY.create({name:'landing-'+bank,tune:tune(),seed:seed+(bank==='south'?7:0),rand:'krand',index:{order:'insertion'},ground:{h},kit:{dims},
    rules:{wealth:p=>{const [u,v]=uvOf(p);return Math.max(.1,Math.min(.8,.62-Math.abs(v)/900-u/2400));},vacant:(p,rs)=>rs.chance(.05)},steps});
   C.run();const P=C.plan;
   P.lots.filter(Lt=>Lt.died==null&&Lt.bo&&Lt.key).forEach((Lt,n)=>out.lots.push({id:Lt.glId?'gl.'+Lt.glId:'gl.'+bank+'.'+n,bank,key:Lt.key,v:Lt.v|0,cls:Lt.cls,civic:!!Lt.civic,
    x:Lt.x,z:Lt.z,y:h(Lt.x,Lt.z),ry:Lt.ry,w:Lt.w,d:Lt.d,people:PEOPLE[Lt.key]||0}));
   P.ways.filter(w=>w.died==null).forEach(w=>out.ways.push({id:'gl.'+bank+'.way.'+w.id,cls:w.cls,w:w.w,tag:w.tag||null,pts:w.pts.map(p=>[p[0],p[1]])}));
   out.notes.push(...(P.log||[]));
   /* THE PIER: from the bank out into the lake, its runs the kit's mole (88f xa_mole_run), a lighthouse on its head; the barges'
      berths on its river face (moored barges, 88d), warehouses at its root */
   const Md=dims('xa_mole_run',0),run=Md?Md.w:34,n=Math.max(1,Math.round(PIER.out/run)),len=PIER.out/n,pv=vv(PIER.gap+PIER.w/2);
   const pier={id:'gl.pier.'+bank,bank,a:xz([0,pv]),b:xz([-PIER.out,pv]),w:PIER.w,deck:2.4,runs:[]};
   for(let i=0;i<n;i++){const c=xz([-(i+.5)*len,pv]);const r={id:'gl.pier.'+bank+'.'+i,key:'xa_mole_run',v:0,x:c[0],z:c[1],y:2.4,ry:riverward+Math.PI,len,kind:'pier'};out.extra.push(r);pier.runs.push(r.id);}
   {const c=xz([-PIER.out-6,pv]);out.extra.push({id:'gl.pier.'+bank+'.light',key:'xa_lighthouse',v:0,x:c[0],z:c[1],y:2.4,ry:riverward,kind:'lighthouse'});}
   for(let i=0;i<2;i++){const c=xz([-40-i*90,vv(PIER.gap-14)]);out.extra.push({id:'gl.barge.'+bank+'.'+i,key:'xa_lake_barge',v:1,x:c[0],z:c[1],y:0,ry:face(UL),kind:'boat'});}
   out.piers.push(pier);}
  /* the ferry across the mouth's first reach */
  {const c=xz([120,0]);out.extra.push({id:'gl.ferry',key:'xa_launch',v:1,x:c[0],z:c[1],y:0,ry:face(VL),kind:'boat'});}
  const census={buildings:out.lots.length+out.extra.length,people:out.lots.reduce((n,r)=>n+r.people,0),byBank:{north:out.lots.filter(r=>r.bank==='north').length,south:out.lots.filter(r=>r.bank==='south').length}};
  return Object.assign(out,{census,frame:{px:PX,u:UL,v:VL,river:RIVER,pier:PIER},h});}
 return {PX,make,h,at,uvOf,PIER,RIVER,BANKS};
})();
