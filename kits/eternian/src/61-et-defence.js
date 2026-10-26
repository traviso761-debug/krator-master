// prefix: et
// ================================================================= THE WALL AND ITS GATES (PLAN.md section 4, P4). Pale brick on a
// stone base; the towers are pier bundles; a city gate is held up by ancestors with arms spread (arch-18), a colossus per
// gate (section 5). The frontier army's barracks stand outside the wall, a pattern-block quadrangle the State distrusts.

/* the city gate: two towers of stepped piers either side of the road, between them two colossal ancestors in gold on
   stepped plinths, arms spread, holding up the gate's lintel, the bronze leaves between their feet; a guardroom door in
   each tower (the census's town guard) */
defBuilding({key:'et_gate',name:'City gate',seed:7110,w:26,d:10,h:30,budget:180000,
 tags:{types:['military'],wealth:'rich',style:'ministry'},
 note:'two pier-bundle towers, between them two colossal gold ancestors holding up the lintel with arms spread, the bronze gate between their feet, guardroom doors',
 build(o){const sd=P('stoneD'),br=P('brick'),brD=new THREE.Color(br).multiplyScalar(.86),FH=10.5,PL=1.4,LY=PL+FH*1.18;
  for(const s of [-1,1]){pushM(TF(s*9,0,0));box('stone',0,0,0,8.4,1.2,8.4,sd);
   pushM(TF(0,1.2,-3));const R=etPierBundle({n:5,w:8,d:6,h0:LY+2,step:1.8,mk:'brick',col:br,niches:true});
    R.niches.forEach((q,i)=>etHead(q[0],q[1]+.04,q[2]-.3,R.pw*.62,{metal:i===2?'gold':'bronze'}));popM();
   etMazeBand(0,LY-1,.02,8,.7);
   pushM(TF(-s*2.2,0,.02));etWall(2.6,1.2,3.4,'brick',br,[{x:0,w:1.1,h:2.4,door:true,maskMetal:'lead'}],{t:.04,frame:brD});popM();
   popM();
   const fx=s*5.6;for(let k=0;k<3;k++)box('stone',fx,k*PL/3,1.2,3.4-k*.5,PL/3,4-k*.5,sd);
   etFigure(fx,PL,1.2,FH,{pose:'lintel',metal:'gold',spread:.26});}   /* arms raised close, each over its own half */
  box('stone',0,LY,1.2,20.4,1.4,3.2,sd);for(let k=0;k<3;k++)box('brick',0,LY+1.4+k*.5,1.2,18-k*4,.5,2.6,brD);
  etFrieze(0,LY+.1,2.82,19.4,1.2);
  for(const s of [-1,1])box('bronze',s*1.25,0,-1.5,2.5,6.5,.16,P('bronze'));door(0,0,-1.2,0,5);
  box('paving',0,0,0,6,.05,10,P('paving'));}});

/* a wall segment, 20 m: pale brick on a dark stone base, a walk behind stepped merlons, a string course */
defBuilding({key:'et_wall',name:'City wall',seed:7111,cls:'feature',kind:'wall',w:20,d:5,h:10,budget:30000,
 front:{x:0,z:2.5,yaw:0},tags:{types:['military']},
 note:'a 20 m segment: pale brick on a dark stone base, a walk behind stepped merlons',
 build(o){const sd=P('stoneD'),br=P('brick'),brD=new THREE.Color(br).multiplyScalar(.86);
  box('stone',0,0,0,20,1.6,4.4,sd);box('brick',0,1.6,0,20,6.4,3.6,br);box('brick',0,5.6,1.85,20,.3,.2,brD);
  box('paving',0,8,0,20,.1,3.6,P('paving'));
  for(let i=0;i<10;i++){const x=-9+i*2;box('brick',x,8,1.55,1.2,1.0,.5,br);box('brick',x,9,1.55,.7,.4,.5,brD);}
  box('brick',0,8,-1.6,20,1.0,.4,br);}});

/* a wall tower: the pier bundle in the round, a lancet slit, a walk on top; the frontier's (v 1) taller and blind */
defBuilding({key:'et_wall_tower',name:'Wall tower',seed:7112,w:11,d:11,h:26,budget:60000,front:{x:0,z:5,yaw:0},
 tags:{types:['military'],wealth:'middle',style:'ministry'},
 note:'a pier-bundle tower on a stone base, a lancet slit and a door; the frontier variant (v 1) taller and blind',
 build(o){const sd=P('stoneD'),br=P('brick'),fr=(o.v|0)===1,H=fr?17:12;
  box('stone',0,0,0,10,1.6,10,sd);
  pushM(TF(0,1.6,0));const R=etPierBundle({n:5,w:9,d:9,h0:H,step:1.6,mk:'brick',col:br,niches:!fr});
   if(!fr)R.niches.forEach((q,i)=>etHead(q[0],q[1]+.04,q[2]-.3,R.pw*.6,{metal:i===2?'silver':'gunmetal'}));popM();
  if(!fr){etLancet(0,8,4.52,.5,3.2,{light:'glass',tracery:false});
   pushM(TF(0,1.6,4.5));etWall(2.4,0,3,'brick',br,[{x:0,w:1.0,h:2.3,door:true,maskMetal:'lead'}],{t:.04});popM();}
  else box('stone',0,1.6,4.55,1.4,.4,.1,sd);}});

/* the barracks of the frontier army: a quadrangle of pattern block round a drill yard, outside the wall; the gate through
   the front range, flat roofs behind parapets, a flagpole with the State's banner (the census's soldiers) */
defBuilding({key:'et_barracks',name:'Barracks',seed:7113,cut:true,w:25,d:21,h:12,budget:140000,
 tags:{types:['military'],wealth:'poor',style:'common'},
 note:'a pattern-block quadrangle round a drill yard, a gate through the front range, flat roofs, a flagpole with the banner; mats and benches inside',
 build(o){const bl=P('block'),ls=P('limeShade'),W=24,D=20,dep=5,H=3.4,G=.3;
  box('paving',0,0,0,W-2*dep,.05,D-2*dep,P('earth'));
  const range=(x,z,ry,L,front)=>{pushM(TF(x,0,z,ry));box('stone',0,0,0,L,G,dep,P('stoneD'));
   const inn=[],out=[];for(let i=0;i<Math.floor(L/4);i++){const xx=-L/2+2+i*4;if(front&&Math.abs(xx)<2.5)continue;inn.push({x:xx,w:.9,h:2.1,door:true,mask:false},{x:xx+1.4,w:.6,h:.8,y:1.3,dark:true,head:'flat'});out.push({x:xx,w:.5,h:.6,y:1.8,dark:true,head:'flat',shut:false});}
   if(front){inn.push({x:0,w:3,h:2.9,gap:true});out.push({x:0,w:3,h:2.9,gap:true});}
   etWalls(L,dep,G,H,'block',bl,{front:out,back:inn},{frame:bl});
   if(front)box('paving',0,G-.02,0,3,.06,dep,P('paving'));
   box('block',0,G+H,0,L+.2,.2,dep+.2,ls);etParapet(L+.2,dep+.2,G+H+.2,.5,{col:bl,cope:ls});popM();};
  range(0,D/2-dep/2,0,W,true);range(0,-D/2+dep/2,PI,W,false);
  range(W/2-dep/2,0,PI/2,D-2*dep,false);range(-W/2+dep/2,0,-PI/2,D-2*dep,false);
  etStepHead(0,G+3.0,D/2+.05,3.4,{mk:'block',col:ls});
  cyl('iron',0,0,0,.08,11,P('iron'),6);etBanner(.55,10.6,0,1.0,3.2);
  for(const x of [-8,-4,4,8])FURNISH('eternian_poor_reed_mat',x,G,-D/2+dep-1.3,0);
  FURNISH('eternian_poor_block_bench',-6,G,-D/2+.52,0);FURNISH('eternian_poor_block_bench',6,G,-D/2+.52,0);
  FURNISH('eternian_common_table',W/2-dep/2,G,0,PI/2);FURNISH('eternian_poor_hearth',-W/2+.62,G,2,PI/2);FURNISH('generic_barrel',-W/2+dep-.8,G,-2,0);}});

/* the frontier fort (the owner, 2026-10-22): the frontier army's hexagon, the Sanctum's six-fold plan in pale brick. Curtain
   walls on a platform of made ground in its moat; a hexagonal tower at each corner with its point outward like a bastion,
   closed-eyed gold faces on its outer faces watching the frontier and a celadon pavilion on top; the city gate (et_gate, a
   child record) in the front face and a bridge over the moat to it; inside, ranges against the other five walls (two
   barracks, the stores, the armoury with its glaive racks, the mess) and two stairs to the wall walk; in the middle the keep,
   three storeys of brick under a celadon ogee with a gold face on every face of its top storey (the State keeps its eye on
   its army), two bronze ancestors at its steps, the banner on its pole and a cistern */
const ET_FORT={R:34,platform:8,moat:14,PH:1.25};
defBuilding({key:'et_fort',name:'Frontier fort',seed:7114,cut:true,w:98,d:88,h:32,budget:1400000,front:{x:0,z:44,yaw:0},
 tags:{types:['military'],wealth:'middle',style:'ministry'},
 note:'a hexagon of pale-brick curtain walls on a platform in its moat, a hexagonal corner tower at each point under celadon with gold faces watching outward, the city gate and a bridge, ranges inside (barracks, stores, armoury, mess), stairs to the walk, and the hexagonal keep under a celadon ogee with a gold face on every side',
 build(o){const R=ET_FORT.R,ap=R*ET_HEX_AP,PH=ET_FORT.PH,Rp=R+ET_FORT.platform,Rm=R+ET_FORT.moat,sd=P('stoneD'),br=P('brick'),
  brD=new THREE.Color(br).multiplyScalar(.86),dark=new THREE.Color(0x0e0d0c),hp=etHex(Rp),hm=etHex(Rm);
  /* the moat (its water between the platform's revetment and an outer kerb) and the platform in its stone revetment */
  for(let i=0;i<6;i++){const j=(i+1)%6;etPoly('water',[[hp[i][0],.3,hp[i][1]],[hp[j][0],.3,hp[j][1]],[hm[j][0],.3,hm[j][1]],[hm[i][0],.3,hm[i][1]]],new THREE.Color(ET_WATER));}
  etHexFaces(Rm*ET_HEX_AP+.25,()=>box('stone',0,0,0,Rm+.6,.55,.5,sd));
  prism('stone',hp,0,PH-.05,sd);prism('earth',etHex(Rp-.25),PH-.05,PH,P('earth'));
  pushM(TF(0,PH,0));
  prism('paving',etHex(R-2.5),0,.02,P('paving'));
  /* the bridge: level with the platform over the moat, stepping down at its outer end (each step a little narrower, so no
     two share a side) */
  {const z0=Rp*ET_HEX_AP,z1=Rm*ET_HEX_AP+.6,zc=(z0+z1)/2,L=z1-z0;box('stone',0,-.35,zc,6,.35,L,sd);
   for(const s of [-1,1]){box('stone',s*2.85,0,zc,.3,.9,L,sd);box('stone',s*2.3,-PH,zc,.9,PH-.35,1.4,sd);}
   for(let k=0;k<4;k++)box('stone',0,-PH,z1+k*.35+.175,6-k*.1,PH*(3-k)/4+.001,.35,sd);}
  /* the curtain: a stone base, the brick, a string course, the walk behind stepped merlons; the gate face open in its middle */
  const STAIR={0:7,2:-7},seg=(L,x)=>{box('stone',x,0,0,L,1.6,4.4,sd);box('brick',x,1.6,0,L,6.4,3.6,br);box('brick',x,5.6,1.85,L,.3,.2,brD);
   box('paving',x,8,0,L,.1,3.6,P('paving'));for(let xx=x-L/2+1;xx<x+L/2-.4;xx+=2){box('brick',xx,8,1.55,1.2,1.0,.5,br);box('brick',xx,9,1.55,.7,.4,.5,brD);}};
  etHexFaces(ap,(k)=>{const g=12.9;
   if(k===1)for(const s of [-1,1])seg(R/2-g,s*(g+R/2)/2);else seg(R,0);
   const gx=STAIR[k],cuts=k===1?[[-R/2,-g],[g,R/2]]:gx==null?[[-R/2,R/2]]:[[-R/2,gx-.8],[gx+.8,R/2]];
   for(const [a,b] of cuts)box('brick',(a+b)/2,8,-1.6,b-a,1.0,.4,br);   /* the inner parapet, open at a stair's head */
   if(gx!=null){for(let i=0;i<20;i++)box('brick',gx,i*.4,-7.8+i*.3+.15,1.4,.4,.3,i%2?br:brD);
    for(const s of [-1,1]){const x=gx+s*.68,t=[[x,0,-7.8],[x,0,-1.85],[x,7.93,-1.85]];etPoly('brick',t,brD);etPoly('brick',t.slice().reverse(),brD);}}});
  /* the corner towers: points outward, gold faces on the outer faces, slits, a door from the court, a celadon pavilion */
  for(let i=0;i<6;i++){const a=i*PI/3;pushM(TF(R*Math.cos(a),0,R*Math.sin(a)));
   prism('stone',etHex(5.8),0,.6,sd);prism('brick',etHex(5.2),.6,13,br);prism('brick',etHex(5.6),13,13.5,brD);
   etHexFaces(5.2*ET_HEX_AP,(k,ph)=>{const c=Math.cos(ph-a);
    box('stone',0,3.6,.02,.28,1.8,.06,dark);box('stone',0,9.6,.02,.28,1.4,.06,dark);
    if(c>.4)etHead(0,6.1,.35,1.5,{metal:'gold'});
    else if(c<-.8&&Math.sin(ph-a)>0){box('timber',0,.6,.03,1.2,2.4,.06,P('timber'));box('stone',0,3.0,.06,1.6,.25,.12,sd);door(0,.6,.1,0,1.2);}});
   etHexFaces(5.6*ET_HEX_AP-.25,()=>{for(const xx of [-1.4,1.4]){box('brick',xx,13.5,0,1.1,1.1,.5,br);box('brick',xx,14.6,0,.6,.4,.5,brD);}});
   prism('brick',etHex(3.4),13.5,16.6,br);etHexHip(3.4,16.6,2.8,{mk:'celadon',ov:.7});
   cone('verdigris',0,19.4,0,.22,1.2,P('verdigris'),6);popM();}
  place('et_gate',0,ap,0,{y:0});
  /* the ranges against the walls, each a lean-to of cast block with its front on the court */
  const RANGES={0:{x:-3,w:14,furn:[['eternian_poor_reed_mat',-4.5,-1.7,0],['eternian_poor_reed_mat',-1.5,-1.7,0],['eternian_poor_reed_mat',1.5,-1.7,0],['eternian_poor_reed_mat',4.5,-1.7,0],['eternian_poor_block_bench',-3,1.9,PI],['eternian_common_chest',5.6,1.2,-PI/2]]},
   2:{x:3,w:14,furn:[['eternian_common_bunk',-4.5,-1.85,0],['eternian_common_bunk',-1.5,-1.85,0],['eternian_common_bunk',1.5,-1.85,0],['eternian_common_bunk',4.5,-1.85,0],['eternian_poor_block_bench',3,1.9,PI],['eternian_common_chest',-5.6,1.2,PI/2]]},
   3:{w:18,furn:[['generic_barrel',-7,-1.8,0],['generic_barrel',-6,-1.8,0],['generic_barrel',-7,-.8,0],['generic_sack',-3,-1.9,0],['generic_sack',-2,-1.9,0],['generic_crate',2,-1.8,0],['generic_crate',3.2,-1.8,0],['job_pole_rack',6.5,-2.2,0]]},
   4:{w:18,furn:[['eternian_common_arms_rack',-4.5,-2.74,0],['eternian_common_arms_rack',-1.5,-2.74,0],['eternian_common_arms_rack',1.5,-2.74,0],['eternian_common_arms_rack',4.5,-2.74,0],['eternian_court_visor_case',-7.2,0,PI/2],['eternian_common_chest',7.2,0,-PI/2],['eternian_common_bench',0,1.6,PI]]},
   5:{w:18,chimney:[7.2,-2.6],furn:[['eternian_common_table',-3,0,0],['eternian_common_table',3,0,0],['eternian_common_bench',-3,-1.1,0],['eternian_common_bench',3,-1.1,0],['eternian_common_bench',-3,1.1,PI],['eternian_common_bench',3,1.1,PI],['eternian_common_stove',7.0,-2.3,0]]}};
  etHexFaces(ap,(k)=>{const r=RANGES[k];if(!r)return;pushM(TF(r.x||0,0,-1.8-3.25,PI));
   etTrade({w:r.w,d:6.2,storeys:1,sh:3.2,mk:'block',upMk:'block',roof:'pent',roofMk:'tile',roofH:1.0,mask:'lead',chimney:r.chimney,furn:r.furn,
    });
   popM();});
  /* the keep: a stepped plinth, three storeys of brick, the ogee, a gold face on every face of the top storey */
  const KR=8,KG=1.0,kap=(KR+.3)*ET_HEX_AP;
  etTrade({plan:'hex',R:KR,storeys:3,sh:3.6,G:KG,mk:'brick',upMk:'brick',roof:'ogee',roofMk:'celadon',steel:true,mask:'terracotta',
   furn:[['eternian_common_register_desk',4,1.0,0],['eternian_common_archive_shelf',3,.5,0],['eternian_common_bench',5,.6,0],['eternian_common_table',0,1.4,0],
    ['eternian_common_bed',2,.8,1],['eternian_common_bed',3,.8,1],['eternian_common_bed',0,.8,1],['eternian_common_chest',4,.5,1],
    ['eternian_common_tube_rack',4,.4,2],['eternian_court_petition_stand',2,1.2,2],['eternian_court_alabaster_lamp',0,.6,2],['eternian_common_mask_shelf',3,.4,2]],
   extra:F=>etHexFaces(F.ap+ET_T/2,()=>etHead(0,F.G+2*3.6+2.45,.3,.95,{metal:'gold'}))});
  for(let s=0;s<3;s++)box('stone',0,0,kap+.15+s*.3,3.2-s*.1,KG*(3-s)/3,.3,sd);   /* the keep's steps, each a little narrower */
  for(const s of [-1,1]){box('stone',s*2.9,0,kap+1.6,1.2,1.0,1.2,sd);etFigure(s*2.9,1.0,kap+1.6,3.4,{pose:'folded',metal:'bronze'});}
  {const z0=kap+1.05,z1=ap-5;box('paving',0,.02,(z0+z1)/2,3.6,.03,z1-z0,new THREE.Color(P('paving')).multiplyScalar(.9));}
  cyl('iron',-13,0,9,.1,14,P('iron'),6);etBanner(-12.4,13.6,9,1.2,3.6);
  etBasin(13,0,9,3.2,3.2,.7);
  popM();}});
