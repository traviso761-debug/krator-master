// prefix: tg
// ================================================================= THE TUNGANG SET: HOMES (PLAN.md 3.2, poor to rich) and the last stop
// Each def draws in its front-foot frame (44-tg-kit.js): the rooms of its void plan behind its front, at -z. The rock itself is
// the world's (KCAVERN carves TG.tg.plan); the builder draws what stands in the voids: frames, plaster, curtains, lamps, the
// furniture (the catalog's Tungang pieces at 0.94: tgFurn), and by the state the rags and the dust.
//   tg-cut             a single hewn cell: a curtain door, a red lamp, a bunk, a glow-cap jar, a peg wall
//   tg-set             a household's set: the doorway plastered white with the berth numbers; the hearth room (drum stove,
//                      trestle, seats), the sleeping room (box beds behind curtains), the store
//   tg-carriage-house  a Line carriage drawn into a cut bay: plated windows, the livery band, a brass bell, the household's
//                      banner, a cut galley behind
//   tg-last-stop       the sealed siding of the dead: the seal plates with the berth numbers, the last lamps burning down
//                      (lit in every state: a lamp burns until its wax is gone)
defBuilding({key:'tg-cut',name:'A cut (a hewn cell)',seed:9301,w:2.8,d:3.6,h:2.4,front:{x:0,z:0},budget:3000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'carved',role:'home'},note:TG.tg.BOX['tg-cut'].what,
 build(o){const C=tgCx(o);tgFront(0,1.1,2.05,C,{num:o.num==null?100+C.v:o.num,code:'red',curtain:'canvas'});
  /* the cell: x -1.25..1.25, z -.6..-3.6 */
  if(tgKeep(C,1))tgFurnSide('tungang_poor_gallery_bunk',-1,-1.25,-2.2);
  if(tgKeep(C,2))tgFurnBack('tungang_poor_peg_wall',.55,-3.6,{},.9);
  if(tgKeep(C,3,.2))tgFurn('tungang_poor_glowcap_jar',.85,0,-1.1,0);
  if(tgKeep(C,4))tgFurn('tungang_poor_footlocker',.7,0,-2.6,-PI/2);
  tgLamp('glow',.9,1.9,-3.45,C,{wall:true});tgRubble(-1.2,1.2,-3.5,-.7,C,3,10);}});
defBuilding({key:'tg-set',name:'A set (a household\'s cut rooms)',seed:9302,w:7.4,d:8.6,h:2.6,front:{x:0,z:0},budget:9000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'carved',role:'home'},note:TG.tg.BOX['tg-set'].what,
 build(o){const C=tgCx(o),n=o.num==null?200+C.v*3:o.num;
  tgFront(0,1.2,2.1,C,{num:n+(tgU(C,5)<.5?' '+(n+1):''),code:'red',plaster:true,curtain:tgU(C,6)<.5?'blanketR':'canvas'});
  /* a child's chalk on the plaster by the door (PLAN.md 5.5), kept homes only */
  if(!C.worn)for(let i=0;i<4;i++)box('plain',1.5+.18*i,.5+.2*tgU(C,7+i),.0,.12,.04,.01,hc(0xf0eee6),tgU(C,11+i)*2);
  /* THE HEARTH ROOM (x -2.3..2.3, z -.6..-4.2): the drum stove in the back corner, the trestle, seats, the peg wall, the bait locker */
  tgPlaster(-2.3,2.3,0,2.4,-4.2,C);
  if(tgKeep(C,20))tgFurn('tungang_poor_drum_stove',-1.65,0,-3.55,PI/4);
  if(tgKeep(C,21))tgFurn('tungang_poor_trestle',.2,0,-2.3,0);
  if(tgKeep(C,22))tgFurn('tungang_poor_drum_seat',.2,0,-1.45,0);if(tgKeep(C,23))tgFurn('tungang_poor_drum_seat',1.1,0,-2.4,-PI/2);
  if(tgKeep(C,24))tgFurnSide('tungang_poor_peg_wall',1,2.3,-2.4,{},.95);
  if(tgKeep(C,25))tgFurnSide('tungang_poor_bait_locker',-1,-2.3,-1.6);
  if(!C.aband)smokeAt(-1.65,1.3,-3.55,{r:.12});
  tgLamp('wax',.0,2.15,-4.05,C,{wall:true});
  /* THE SLEEPING ROOM (x -3.5..-.1, z -4.9..-8.3): two box beds behind their curtains */
  if(tgKeep(C,30))tgFurnSide('tungang_common_box_bed',-1,-3.5,-6.6);
  if(tgKeep(C,31))tgFurnBack('tungang_common_box_bed',-1.2,-8.3,{v:1});
  if(tgKeep(C,32))tgFurn('tungang_poor_footlocker',-.7,0,-5.6,PI);
  if(!C.aband)box('plain',-1.8,0.2,-4.95,.88,1.75,.03,tgCol('blanketB',C));
  tgLamp('glow',-.45,1.9,-8.15,C,{wall:true});
  /* THE STORE (x 1..3.4, z -5..-7.8): shelves, the mash bin, the water butt */
  if(tgKeep(C,40))tgFurnBack('tungang_common_plate_shelves',2.2,-7.8);
  if(tgKeep(C,41))tgFurnSide('tungang_common_mash_bin',1,3.4,-5.8);
  if(tgKeep(C,42))tgFurnSide('tungang_common_water_butt',-1,1,-6.9);
  tgRubble(-2.2,2.2,-4.1,-.7,C,4,50);tgRubble(-3.4,-.2,-8.2,-5,C,3,70);}});
defBuilding({key:'tg-carriage-house',name:'A carriage house',seed:9303,w:27,d:8.6,h:5.4,front:{x:0,z:0},budget:16000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'salvage',role:'home'},note:TG.tg.BOX['tg-carriage-house'].what,
 build(o){const C=tgCx(o),L=23.4,hw=1.75,cz=-2.6,fy=.55,ry=4.05,pl=tgCol(C.aband?'rust':'plate',C),liv=tgCol(tgU(C,3)<.5?'plateG':'oxide',C);
  /* the bay's floor plates and the two short rails the carriage was drawn in on */
  for(const s of [-1,1])box('iron',0,0,cz+s*.8,L+1.6,.12,.12,tgCol('steel',C));
  /* the carriage: a riveted plate body over its two bogies, the livery band, the windows plated to slits, a door each end */
  for(const x of [-L/2+3.8,L/2-3.8]){box('iron',x,0,cz,2.6,.5,2.4,tgCol('dark',C));for(const s of [-1,1])cyl('iron',x+s*.8,.0,cz+1.25,.42,.12,tgCol('steel',C),12,null,null);}
  box('plate',0,fy,cz,L,ry-fy-.3,hw*2,pl);box('plate',0,ry-.3,cz,L-.2,.32,hw*2-.12,pl);
  box('paint',0,fy+.9,cz+hw+.01,L-.3,.5,.02,liv);box('paint',0,fy+1.5,cz+hw+.01,L-.3,.1,.02,tgCol('cream',C));
  for(let x=-L/2+2.2;x<L/2-2;x+=1.8){box('plate',x,fy+1.9,cz+hw+.02,1.3,.9,.02,tgCol('plate',C));box(C.aband?'glass':'plain',x,fy+2.25,cz+hw+.03,1.1,.12,.02,tgCol('dark',C));
   for(const y of [fy+1.95,fy+2.75])for(const xx of [x-.6,x+.6])box('iron',xx,y,cz+hw+.035,.04,.04,.01,tgCol('steel',C));}
  box('plate',-L/2+1.2,fy,cz+hw+.03,.95,2.05,.03,tgCol(C.aband?'rust':'plateG',C));
  if(!C.aband)for(let k=0;k<3;k++)box('iron',-L/2+1.2,fy-.2-k*.18,cz+hw+.25+k*.2,.9,.06,.25,tgCol('steel',C));
  /* the enamel number plate and the brass bell on its bracket at the near end */
  box('paint',L/2-3,fy+1.2,cz+hw+.04,.7,.4,.02,tgCol('enamel',C));if(o.num!=null||!C.aband)fgText(String(o.num==null?300+C.v:o.num),L/2-3.25,fy+1.27,cz+hw+.06,0,.14,tgCol('enamelR',C));
  if(!C.aband){box('iron',L/2-1,ry-.6,cz+hw+.1,.06,.06,.3,tgCol('steel',C));cone('brass',L/2-1,ry-.95,cz+hw+.25,.16,.3,tgCol('brass',C),10);}
  /* the household's banner on the bay's back wall, the carriage seats set out before it, the galley behind */
  if(tgKeep(C,30))tgFurnBack('tungang_court_banner',-6,-5,{},.9);
  if(tgKeep(C,31))tgFurn('tungang_common_carriage_seats',-4,0,-.15+.4,PI);
  if(tgKeep(C,32))tgFurn('tungang_common_lantern_stand',6,0,-.4,0);
  tgFront(3,1,2,C,{code:'red',ribs:false,lampSide:-1});
  if(tgKeep(C,40))tgFurnBack('tungang_common_carriage_galley',3,-8.3);if(tgKeep(C,41))tgFurnSide('tungang_common_mash_bin',1,5.2,-6.4);
  tgLamp('wax',1.3,2.1,-8.15,C,{wall:true});tgLamp('red',-L/2+1.2,fy+2.4,cz+hw+.15,C);tgRubble(-12,12,-4.8,-.4,C,8,90);}});
defBuilding({key:'tg-last-stop',name:'The last stop (sealed)',seed:9304,w:7,d:12,h:3,front:{x:0,z:0},budget:7000,
 tags:{types:['funerary'],wealth:'poor',style:'carved',role:'religious'},note:TG.tg.BOX['tg-last-stop'].what,
 build(o){const C=tgCx(o),lit=!C.aband||tgU(C,1)<.5;
  /* THE SEAL: a wall of seal plates across the siding's mouth (z -1.35), a berth number painted on each, the last lamps on the
     ledge before it, burning down (lit in every state but the oldest) */
  const sc=tgCol('rust',C);box('plate',0,0,-1.35,5.6,2.8,.08,sc);
  for(let i=0;i<5;i++){const x=-2.2+i*1.1;tgFurn('tungang_poor_seal_plate',x,.4,-1.28,0,{v:i%3});
   box('paint',x,1.95,-1.29,.5,.22,.01,tgCol('rose',C));fgText(String(400+i*7+C.v),x-.18,2.0,-1.28,0,.11,tgCol('dark',C));}
  box('stone',0,0,-1.0,5.2,.35,.4,tgCol('hewn',C));
  for(let i=0;i<5;i++){const x=-2.2+i*1.1;tgFurn('tungang_poor_last_lamp',x,.35,-1.0,0);if(lit&&tgU(C,10+i)<.8)tgLamp('wax',x,.62,-.95,C,{on:true});}
  /* THE SIDING behind (z -1.4..-11.9): the dead laid in berths on plate shelves down both walls, wrapped in canvas */
  for(const s of [-1,1])for(let z=-2.6;z>-11.2;z-=2.1)for(const y of [.4,1.4]){box('plate',s*2.2,y-.05,z,.9,.05,1.9,tgCol('rust',C));
   box('plain',s*2.2,y,z,.55,.32,1.75,tgCol('canvas',C));}
  tgPlaster(-2.6,2.6,0,2.6,-11.9,C);fgText('OFF SHIFT',-1.05,2.05,-11.86,0,.16,tgCol('dark',C));tgRubble(-2.4,2.4,-11.7,-1.6,C,4,30);}});
