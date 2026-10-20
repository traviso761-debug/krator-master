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
   etFigure(fx,PL,1.2,FH,{pose:'lintel',metal:'gold'});}
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
