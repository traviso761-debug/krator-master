// prefix: tg
// ================================================================= THE TUNGANG SET: CIVIC (PLAN.md 1.2, 3.2, 5.5) and the hold's ways out
//   tg-loj-hall     the meeting: the white COUNT WALL ruled in squares behind the steward, its low lamp row behind the
//                   benches (hands are counted by their shadows on it: the one bright thing a loj makes on purpose), raked
//                   benches, the BANNER WALL (the loj's banner, the minutes on enamel), the Book's lectern, the steward's desk,
//                   the Tpresden's chair, the minute chest, the turn bell
//   tg-signal-box   the steward's office (the old signal cabin's name): the lever frame, the desk, the timetable, the rota
//   tg-doors        the hold's gate: an Ancient door kept working across the way (its two leaves folded back while the hold is
//                   open), its winding gear, the guard cut, the white lamp hooded. o.span: the way's width (default 6)
//   tg-night-mouth  the way to the surface: a porch, the hooded white lamp you are asked to cover, the click-ribs that tell who
//                   comes, the climb (a cut stair) toward the night, a door at its head
defBuilding({key:'tg-loj-hall',name:'The loj hall',seed:9311,w:14,d:17,h:6,front:{x:0,z:0},budget:22000,
 tags:{types:['civic'],wealth:'middle',style:'carved',role:'civic'},note:TG.tg.BOX['tg-loj-hall'].what,
 build(o){const C=tgCx(o),Z0=-3.3,Z1=-16.7,X=6.6,H=5.8;
  tgFront(0,2.4,2.6,C,{code:'green',leaf:'green'});
  if(tgKeep(C,1))tgFurn('tungang_common_enamel_sign',0,2.95,.08,0);
  fgText('LOJ '+(o.loj==null?20:o.loj),-.9,3.5,.06,0,.2,tgCol(C.aband?'dust':'cream',C));
  /* the foyer: the turn bell, the pipe band's pipes on their stand */
  if(tgKeep(C,2))tgFurn('tungang_court_turn_bell',-2.2,0,-2.2,PI/2);if(tgKeep(C,3))tgFurn('tungang_common_pipe_band',2.2,0,-2.2,-PI/2);
  tgLamp('wax',0,2.5,-3.2,C,{wall:true});
  /* THE COUNT WALL: the back wall plastered white to 4.8 m, ruled in squares; the steward's desk before it facing the benches */
  const wc=tgCol(C.aband?'plasterA':'plaster',C);box('plain',0,0,Z1+.02,X*2-.2,4.8,.04,wc);
  if(!C.aband)for(let i=-5;i<=5;i++){box('plain',i*1.15,.6,Z1+.05,.025,4.0,.01,tgCol('hewn',C));}
  if(!C.aband)for(let y=.6;y<=4.65;y+=.81)box('plain',0,y,Z1+.05,11.6,.025,.01,tgCol('hewn',C));
  if(tgKeep(C,10))tgFurnBack('tungang_court_count_wall',0,Z1+.08,{},1.1);   /* hung over the desk and the chair, not stood on the floor behind the dais */
  if(tgKeep(C,11))tgFurn('tungang_court_steward_desk',0,.4,Z1+1.8,0);box('wood',0,0,Z1+1.8,3.2,.4,2.4,tgCol('hewn',C));
  if(tgKeep(C,12))tgFurn('tungang_court_book_lectern',-2.6,.4,Z1+1.6,0);
  if(tgKeep(C,13))tgFurn('tungang_court_president_chair',1.6,.4,Z1+.9,0);
  if(tgKeep(C,14))tgFurnSide('tungang_court_minute_chest',1,X,Z1+2.6);
  /* THE BENCHES, raked: six rows rising toward the door (the back rows highest), an aisle down the middle */
  const rows=6;for(let r=0;r<rows;r++){const z=Z1+4.4+r*1.35,y=r*.22;if(r)box('stone',0,0,z,X*2-.4,y,1.35,tgCol('hewn',C));
   for(const s of [-1,1])if(tgKeep(C,20+r*2+(s>0)))tgFurn('tungang_court_meeting_bench',s*3.2,y,z,PI);}
  /* THE LAMP ROW behind the benches: a low row that throws the raised hands' shadows onto the count wall */
  const zl=Z1+4.4+rows*1.35+.4;if(tgKeep(C,30,.5))tgFurn('tungang_common_count_lamps',0,(rows-1)*.22,zl,PI);
  for(let k=-2;k<=2;k++)tgLamp('wax',k*1.2,(rows-1)*.22+.45,zl+.15,C,{on:!C.worn});
  /* THE BANNER WALL (the west wall): the loj's banner, the banners of the lojes it hosts; the minutes on enamel on the east wall */
  if(tgKeep(C,40))tgFurnSide('tungang_court_banner',-1,-X,-10,{},.6);if(tgKeep(C,41,.2))tgFurnSide('tungang_court_banner',-1,-X,-6.6,{v:1},.6);
  if(tgKeep(C,42,.2))tgFurnSide('tungang_court_banner',-1,-X,-13.4,{v:2},.6);
  if(tgKeep(C,43))tgFurnSide('tungang_court_enamel_minutes',1,X,-8.4,{},.5);if(tgKeep(C,44,.4))tgFurnSide('tungang_court_enamel_minutes',1,X,-12.2,{v:1},.5);
  if(tgKeep(C,45))tgFurnSide('tungang_court_crew_mosaic',1,X,-5.2,{},.4);
  for(const s of [-1,1])for(const z of [-5,-9,-13])tgLamp('wax',s*(X-.15),3.2,z,C,{wall:false});
  tgRubble(-6.4,6.4,-16.5,-3.5,C,10,60);}});
defBuilding({key:'tg-signal-box',name:'The signal box (the steward\'s office)',seed:9312,w:6.4,d:5.2,h:3,front:{x:0,z:0},budget:7000,
 tags:{types:['civic'],wealth:'middle',style:'carved',role:'civic'},note:TG.tg.BOX['tg-signal-box'].what,
 build(o){const C=tgCx(o);tgFront(0,1.1,2.05,C,{code:'green',leaf:'plate'});
  if(tgKeep(C,1))tgFurn('tungang_common_enamel_sign',0,2.4,.08,0);fgText('BOX',-.32,2.55,.12,0,.14,tgCol('enamelR',C));
  /* the room x -3..3, z -.5..-5.1: the lever frame along the back, the desk, the timetable and the rota on the walls */
  if(tgKeep(C,10))tgFurnBack('tungang_common_lever_frame',0,-5.1);if(tgKeep(C,11))tgFurn('tungang_court_steward_desk',-1.6,0,-2.2,PI/2);
  if(tgKeep(C,12))tgFurnSide('tungang_common_timetable',1,3,-2.6,{},1.0);if(tgKeep(C,13))tgFurnSide('tungang_common_rota_board',-1,-3,-3.9,{},1.0);
  if(tgKeep(C,14))tgFurnSide('tungang_common_lockers',1,3,-4.3);tgLamp('wax',.6,2.5,-4.95,C,{wall:true});tgLamp('green',-2.4,2.4,-.65,C,{wall:false});
  tgRubble(-2.9,2.9,-5,-.6,C,4,30);}});
defBuilding({key:'tg-doors',name:'The doors (the hold\'s gate)',seed:9313,w:10,d:4.4,h:5,front:{x:0,z:0},budget:9000,
 tags:{types:['military'],wealth:'middle',style:'salvage',role:'defense'},note:TG.tg.BOX['tg-doors'].what,
 build(o){const C=tgCx(o),span=o.span==null?6:o.span,gx=1.2,H=Math.min(4.6,(o.h==null?5:o.h)-.3),pc=tgCol('steel',C),lc=tgCol(C.aband?'rust':'plateG',C);
  /* the frame across the way: two posts, a lintel, the bronze band; the two leaves folded back along the way's walls (kept,
     worn), one fallen across (abandoned) */
  for(const z of [.1,span-.1])box('iron',gx,0,z,.5,H+.4,.4,pc);box('iron',gx,H,span/2,.5,.5,span,pc);box('brass',gx,H-.2,span/2,.52,.12,span-.4,tgCol('brass',C));
  if(!C.aband){box('plate',gx+span/4,0,.3,span/2-.1,H-.1,.14,lc);box('plate',gx+span/4,0,span-.3,span/2-.1,H-.1,.14,lc);}
  else{box('plate',gx+.8,0,span/2,.14,.6,span/2,lc,0,0,1.2);box('plate',gx+span/4,0,span-.3,span/2-.1,H-.1,.14,lc);}
  for(let k=0;k<3;k++)if(!C.aband)box('iron',gx+span/4,.6+k*1.4,.4,span/2-.2,.1,.05,pc);
  /* the winding gear on the wall and the guard cut behind it */
  if(tgKeep(C,10))tgFurn('tungang_court_door_winch',gx-1.4,0,.5,0);
  tgFront(-3.4,1,2,C,{code:'white',ribs:false,lampSide:1});tgLamp('white',gx-.6,H-.4,.3,C,{wall:true,hood:true});
  if(tgKeep(C,20))tgFurnSide('tungang_poor_gallery_bunk',-1,-4.9,-2.4);if(tgKeep(C,21))tgFurnBack('tungang_common_hook_rack',-3.2,-4.2,{},.9);
  tgLamp('red',-2.2,1.9,-4.05,C,{wall:true});tgRubble(-4.8,-2,-4,-.8,C,3,40);}});
defBuilding({key:'tg-night-mouth',name:'The night mouth',seed:9314,w:3.4,d:16,h:3,front:{x:0,z:0},budget:7000,
 tags:{types:['military','infrastructure'],wealth:'poor',style:'carved',role:'defense'},note:TG.tg.BOX['tg-night-mouth'].what,
 build(o){const C=tgCx(o);tgFront(0,1.3,2.2,C,{code:'white',leaf:'plate',ribs:true});
  /* the porch: the second click-ribs, a hooded white lamp the comer covers, a bench for the watch */
  if(tgKeep(C,1))tgFurnSide('tungang_common_click_ribs',1,1.3,-1.6,{v:1});if(tgKeep(C,2))tgFurnSide('tungang_common_bench',-1,-1.3,-1.8);
  tgLamp('white',.9,2.2,-3,C,{wall:true,hood:true});
  /* the climb: treads cut in the rock from z -3 up 4.2 m to z -15.4, a hand rope, a lamp at its head, the door at the top */
  const a=[0,0,-3],b=[0,4.2,-15.4],n=Math.round(4.2/.18);for(let k=0;k<n;k++){const t=k/n,t1=(k+1)/n,y=b[1]*t1,z0=a[2]+(b[2]-a[2])*t,z1=a[2]+(b[2]-a[2])*t1;
   box('stone',0,y-.18,(z0+z1)/2,1.5,.18,Math.abs(z1-z0)+.01,tgCol('hewn',C));}
  if(!C.aband)sagRope('rope',[-.7,1,-3],[-.7,5.2,-15.2],.15,.02,tgCol('canvas',C),10);
  box('plate',0,4.2,-15.35,1.2,2.1,.08,tgCol('plate',C));tgLamp('white',.5,6.3,-15.1,C,{wall:true,hood:true});
  fgText('NIGHT',-.4,6.5,-15.3,0,.12,tgCol('cream',C));tgRubble(-.7,.7,-15,-3.2,C,3,20);}});
