// ================================================================= QIBLAI — houses (Q2; PLAN.md section 5, "Houses")
// The lay folk of the outer square live in row houses on party walls, each a white cube with a roof terrace: poor (two
// storeys over a rubble footing, shuttered windows, fodder and firewood on the parapet), middle (three storeys, a strict
// window grid with valances, a roof room set back), rich (a dressed plinth, a jharokha, a stepped roof, electric light).
// The corner house turns a street corner; the courtyard house is a rich family's four ranges round a paved court.
// Row types take o.ends (qnEnds): a side that is not an end is a party wall, finished but blank. Every type keeps the
// Xanadu kit's storeys (2.6-3.6 m), plinths (0.45-0.9 m) and footprint classes (VASSAL-KITS.md section 2), so a Xanadu
// house stands beside it on the mixed street (89q9-qb-street.js). Seeds 33100-33299.

// ---------------------------------------------------------------- POOR
function buildQbRowPoor(G,o){reseed(33101+(o.v|0));const V=xV(o),W=7.2,D=10,P=.45,E=qnEnds(o);
 const R=qnRingC('lay'),wall=R.wall.clone().multiplyScalar(rr(.88,.95)),aged=xC(xPick(XPAL.aged)),hs=V===2?[2.8,2.6,2.5]:[2.8,2.6];
 vnReg('Row house (poor)',0,0,5,P+hs.reduce((a,b)=>a+b,0)+(V===1?3.2:1));
 vB('xRubB',0,0,0,W,P,D,0,xC(xPick(XPAL.rubble)));
 const S=qnStack(0,P,0,W,D,0,hs,wall,'wash',xC(0x6a5a4a));
 qnWins(0,P,0,W,D,0,hs,S.k,{pitch:2.4,ww:.6,wh:.8,kind:V===1?'shut':'glass',trim:R.trim,left:E.l,right:E.r,skip:[[-W/2,-.5]],from:V===2?1:0});
 qnDoor(-1.75,P,D/2,0,1.0,1.9,{c:R.trim,leaf:aged,val:false});
 const top=qnRoof(0,S.y,0,S.w,S.d,0,wall,{parapet:.7});
 // the roof: firewood and fodder on the front parapet, a ladder hatch, a flag mast at the back corner, a roof hut (V1)
 xnFodder(0,top-.7+.05,S.d/2-.35,S.w-1.4,0);for(let i=0;i<3;i++)vB('vWood',-S.w/2+1+i*.5,S.y+.35,-S.d/2+.6,.36,.9,1.2,0,aged);
 vB('vDarkB',1.6,S.y+.33,-.8,.8,.02,.8,0);
 if(V===1){const k=qnCube(1.2,S.y+.3,-S.d/2+1.5,3,2.3,2.6,0,wall,'wash');qnRoof(1.2,S.y+2.6,-S.d/2+1.5,3*k,2.6*k,0,wall,{parapet:.45});
  qnDoor(1.2,S.y+.3,-S.d/2+2.8,0,.8,1.7,{c:R.trim,leaf:aged,val:false,step:false});}
 const m=[-S.w/2+.4,top,-S.d/2+.4];vPst('vPost',m[0],m[1],m[2],.05,3.2,aged);qnFlags([m[0],top+3.1,m[2]],[S.w/2-.4,top+.2,S.d/2-.4]);}

// ---------------------------------------------------------------- MIDDLE
function buildQbRowMid(G,o){reseed(33111+(o.v|0));const V=xV(o),W=9,D=12,P=.5,E=qnEnds(o);
 const R=qnRingC('lay'),wall=R.wall,hs=V===2?[3.2,3.0,2.9,2.8]:[3.2,3.0,2.9],H=hs.reduce((a,b)=>a+b,0);
 vnReg('Row house (middle)',0,0,6.5,P+H+3.4);
 qnPlinth(0,0,W,D,P,0);
 const S=qnStack(0,P,0,W,D,0,hs,wall,'wash');
 // the ground storey: a shop (V1) or a door between two windows; the grid above it on every face that is not a party wall
 if(V===1){xnTibWin(1.6,P+.75,D/2,0,2.6,1.7,'glass',R.trim,{valC:xC(XPAL.saffron)});vB('vWood',1.6,P+.1,D/2+.25,3.2,.7,.5,0,xC(xPick(XPAL.timber)));}
 qnWins(0,P,0,W,D,0,hs,S.k,{pitch:2.25,ww:.85,wh:1.15,trim:R.trim,val:'all',left:E.l,right:E.r,skip:V===1?[[-3,-.4],[0,W]]:[[-3,-.4]]});
 qnDoor(-1.7,P,D/2,0,1.1,2.1,{c:R.trim});
 const top=qnRoof(0,S.y,0,S.w,S.d,0,wall,{parapet:.75,corner:V===2?'flag':null});
 // the roof room set back, its door onto the front terrace; flags from its parapet to the front corners
 const T=qnTerraces(0,S.y+.3,0,0,[[S.w*.55,S.d*.4,2.5,S.d*.28]],wall);
 qnDoor(0,S.y+.3,T[0].z+S.d*.2,0,.9,1.8,{c:R.trim,val:false,step:false});
 qnWins(0,S.y+.3,T[0].z,S.w*.55,S.d*.4,0,[2.5],.98,{pitch:2.2,ww:.6,wh:.75,trim:R.trim,skip:[[-1,1]],left:E.l,right:E.r});
 for(const s of[-1,1])qnFlags([s*S.w*.2,T[0].top,T[0].z],[s*(S.w/2-.3),top,S.d/2-.3]);
 vnPlanter(S.w/2-1,S.y+.3,S.d/2-.8,1.2,.5,0,xC(xPick(XPAL.timber)));}

// ---------------------------------------------------------------- RICH
function buildQbRowRich(G,o){reseed(33121+(o.v|0));const V=xV(o),W=13,D=12.5,P=.9,ZB=-1.75,E=qnEnds(o);
 const R=qnRingC('lay'),wall=R.wall,stone=xC(xPick(QSTONE)),dark=xC(xPick(XPAL.dark)),hs=V===2?[3.6,3.3,3.2,3.0]:[3.6,3.3,3.2],H=hs.reduce((a,b)=>a+b,0);
 vnReg('Row house (rich)',0,ZB,8.5,P+H+3.6);
 const F=ZB+D/2;qnPlinth(0,(ZB-D/2+F+1.6)/2,W,D+1.6,P,0,stone);   // the plinth runs out under the portico
 const S=qnStack(0,P,ZB,W,D,0,hs,wall,'wash');
 qnWins(0,P,ZB,W,D,0,hs,S.k,{pitch:2.5,ww:.95,wh:1.3,trim:R.trim,val:'all',left:E.l,right:E.r,skip:[[-2.4,2.4]],skipUp:[[-2.2,2.2]],top:V===1?0:0});
 // the front: a painted portico over the door, the stair up the plinth inside the plot, a jharokha on the piano nobile
 xnPortico(0,P,F,0,4.4,1.6,3.0,wall,{valC:xC(XPAL.saffron)});qnDoor(0,P,F,0,1.5,2.4,{c:xC(XPAL.red),leaf:dark,val:false,step:false});
 xnFlight(0,0,F+1.6+Math.max(2,Math.round(P/.17))*.34,0,3.2,P,'vStone',stone);
 xnJharokha(0,P+hs[0]+.3,F-.12,0,3.0,2.6,xC(xPick(XPAL.stone)),{d:1.0,dome:V===1?'T':false});
 if(V!==1)xnTibWin(0,P+hs[0]+hs[1]+.85,F-.3,0,1.6,1.4,xLit()?'lit':'glass',R.trim,{valC:xC(XPAL.saffron)});
 const top=qnRoof(0,S.y,ZB,S.w,S.d,0,wall,{parapet:.8,corner:'flag'});
 // the stepped roof: a family room and over it a small prayer room, each set back; wind-horse flags from the top
 const T=qnTerraces(0,S.y+.3,ZB,0,[[S.w*.62,S.d*.5,2.8,S.d*.22],[S.w*.34,S.d*.28,2.5,S.d*.3]],wall,{parapet:.6});
 qnWins(0,S.y+.3,ZB+T[0].z,S.w*.62,S.d*.5,0,[2.8],.98,{pitch:2.4,ww:.75,wh:.95,trim:R.trim,left:E.l,right:E.r,back:false});
 qnDoor(0,T[1].y,ZB+T[1].z+S.d*.14,0,.9,1.8,{c:R.trim,val:false,step:false});
 vPst('vPost',0,T[1].top,ZB+T[1].z,.05,3.4,xC(0x5a4632));for(const s of[-1,1])qnFlags([0,T[1].top+3.3,ZB+T[1].z],[s*(S.w/2-.3),top,ZB+S.d/2-.3]);
 if(xLit()){vnLamp(-2.6,P+2.6,F,0);vnLamp(2.6,P+2.6,F,0);}}

// ---------------------------------------------------------------- the corner house
// a middle house on a street corner: its front (+z) and its right side (+x) are both streets, with a shop on the corner of
// each; the left side a party wall unless o.ends says otherwise. Its roof steps up toward the back-left corner.
function buildQbCorner(G,o){reseed(33131+(o.v|0));const V=xV(o),W=12,D=12,P=.5,E=qnEnds(o.ends==null?{ends:'r'}:o);
 const R=qnRingC('lay'),wall=R.wall,hs=[3.4,3.0,2.9],H=hs.reduce((a,b)=>a+b,0);
 vnReg('Corner house',0,0,8.2,P+H+3.2);
 qnPlinth(0,0,W,D,P,0);
 const S=qnStack(0,P,0,W,D,0,hs,wall,'wash');
 // the two shop fronts meeting at the corner, a door on the side street
 xnTibWin(W/2-2.2,P+.7,D/2,0,2.6,1.8,'glass',R.trim,{valC:xC(XPAL.saffron)});xnTibWin(W/2,P+.7,D/2-2.2,Math.PI/2,2.6,1.8,'glass',R.trim,{valC:xC(XPAL.saffron)});
 for(const [x,z,ry] of[[W/2-2.2,D/2+.32,0],[W/2+.32,D/2-2.2,Math.PI/2]])vB('vWood',x,P+.1,z,3.1,.7,.45,ry,xC(xPick(XPAL.timber)));
 qnWins(0,P,0,W,D,0,hs,S.k,{pitch:2.3,ww:.85,wh:1.15,trim:R.trim,val:'all',left:E.l,right:true,skip:[[-4.2,-2.4],[1,W]]});
 qnDoor(-3.3,P,D/2,0,1.1,2.1,{c:R.trim});
 const top=qnRoof(0,S.y,0,S.w,S.d,0,wall,{parapet:.75});
 const T=qnTerraces(-S.w*.2,S.y+.3,0,0,[[S.w*.55,S.d*.5,2.7,S.d*.25]],wall);
 qnWins(-S.w*.2,S.y+.3,T[0].z,S.w*.55,S.d*.5,0,[2.7],.98,{pitch:2.3,ww:.7,wh:.85,trim:R.trim,left:E.l,skip:[[-.8,.8]]});
 qnDoor(-S.w*.2,S.y+.3,T[0].z+S.d*.25,0,.9,1.8,{c:R.trim,val:false,step:false});
 if(V!==1)vnAwning(W/2-2.2,P+2.75,D/2,0,3.2,1.2,xC(xPick(XPAL.cloth)));
 qnFlags([-S.w*.2,T[0].top,T[0].z],[S.w/2-.3,top,S.d/2-.3]);}

// ---------------------------------------------------------------- the courtyard house (rich)
// four ranges round a paved court: the gate range in front (two storeys), the side ranges, and the family's hall range at
// the back (three storeys, the jharokha over the court, a prayer room on its roof). Blank ground storeys outside, the
// windows on the court; a well, a tree and an incense burner in the court.
function buildQbCourt(G,o){reseed(33141+(o.v|0));const V=xV(o),W=26,D=24,P=.6;
 const R=qnRingC('lay'),wall=R.wall,stone=xC(xPick(QSTONE)),dark=xC(xPick(XPAL.dark));
 vnReg('Courtyard house (rich)',0,0,15,P+10+3.4);
 qnPlinth(0,.7,W,D+1.4,P,0,stone);   // the plinth runs out under the gate's portico
 const hb=V===2?[3.6,3.3,3.2,3.0]:[3.6,3.3,3.2],hf=[3.4,3.1];const Db=7.5,Df=5,Ds=4.6;
 // the hall range (back), the gate range (front), the side ranges between them
 const B=qnStack(0,P,-D/2+Db/2,W,Db,0,hb,wall,'wash');
 qnWins(0,P,-D/2+Db/2,W,Db,0,hb,B.k,{pitch:2.5,ww:.95,wh:1.3,trim:R.trim,val:'all',from:0,skip:[[-2.4,2.4]],skipUp:[[-2.2,2.2]]});
 const Fr=qnStack(0,P,D/2-Df/2,W,Df,0,hf,wall,'wash');
 qnWins(0,P,D/2-Df/2,W,Df,0,hf,Fr.k,{pitch:2.5,ww:.85,wh:1.1,trim:R.trim,from:1,skipUp:[[-2.6,2.6]]});
 for(const s of[-1,1]){const x=s*(W/2-Ds/2),Ls=D-Db-Df;const Sd=qnStack(x,P,(Df-Db)/2,Ds,Ls,0,hf,wall,'wash');
  qnWins(x,P,(Df-Db)/2,Ds,Ls,0,hf,Sd.k,{pitch:2.5,ww:.8,wh:1.05,trim:R.trim,front:false,back:false,left:s>0,right:s<0,val:true});
  qnWins(x,P,(Df-Db)/2,Ds,Ls,0,hf,Sd.k,{pitch:2.5,ww:.7,wh:.9,trim:R.trim,front:false,back:false,left:s<0,right:s>0,from:1});
  qnRoof(x,Sd.y,(Df-Db)/2,Sd.w,Sd.d,0,wall,{parapet:.7});}
 qnRoof(0,Fr.y,D/2-Df/2,Fr.w,Fr.d,0,wall,{parapet:.75,corner:'flag'});
 const top=qnRoof(0,B.y,-D/2+Db/2,B.w,B.d,0,wall,{parapet:.8});
 // the gate: a painted portico and a double door, the stair up the plinth inside the plot
 xnPortico(0,P,D/2,0,5,1.4,3.0,wall,{valC:xC(XPAL.saffron)});qnDoor(0,P,D/2,0,2.4,2.7,{c:xC(XPAL.red),leaf:dark,val:false,step:false});
 xnFlight(0,0,D/2+1.4+1.0,0,3.6,P,'vStone',stone);
 // the court: the hall's door, the jharokha over it, the side ranges' doors, paving, a well, a tree, the burner
 const Bz=-D/2+Db;qnDoor(0,P,Bz,0,1.6,2.5,{c:xC(XPAL.red),leaf:dark,val:true,step:false});
 xnJharokha(0,P+hb[0]+.3,Bz-.12,0,3.4,2.6,xC(xPick(XPAL.stone)),{d:1.0,dome:V===1?'G':'T'});
 for(const s of[-1,1])qnDoor(s*(W/2-Ds),P,(Df-Db)/2,s>0?-Math.PI/2:Math.PI/2,1.0,2.1,{c:R.trim,val:false,step:false});
 const Cw=W-2*Ds,Cd=D-Db-Df;qnPave(0,(Df-Db)/2,Cw-.4,Cd-.4,0,P);
 xnFountain(-Cw/4,P,(Df-Db)/2,.9);xnTree(Cw/4,(Df-Db)/2-1,5.5,null,P);
 kput('xDrumS',[Cw/4-2.4,P,(Df-Db)/2+2.4],null,[.5,1.1,.5],stone);kput('xBulbG',[Cw/4-2.4,P+1.1,(Df-Db)/2+2.4],null,[.42,.55,.42],xC(xPick(XPAL.gold)));
 // the prayer room on the hall's roof, its flags; electric lamps at the gate (rich)
 const T=qnTerraces(0,B.y+.3,-D/2+Db/2,0,[[B.w*.3,B.d*.6,2.6,B.d*.12]],wall,{parapet:.6});
 qnDoor(0,B.y+.3,-D/2+Db/2+T[0].z+B.d*.3,0,.9,1.8,{c:R.trim,val:false,step:false});
 for(const s of[-1,1])qnFlags([s*B.w*.15,T[0].top,-D/2+Db/2+T[0].z],[s*(W/2-.3),Fr.y+.8,D/2-.3]);
 if(xLit()){vnLamp(-2.9,P+2.7,D/2+.02,0);vnLamp(2.9,P+2.7,D/2+.02,0);}}

QB.def({key:'qb_row_poor',name:'Row house (poor)',family:'Houses — poor and middle',tags:QTAG('poor',['single-family dwelling']),w:7.2,d:10,h:9,fw:7.2,fd:10,build:buildQbRowPoor});
QB.def({key:'qb_row_mid',name:'Row house (middle)',family:'Houses — poor and middle',tags:QTAG('middle',['single-family dwelling']),w:9,d:12,h:15,fw:9,fd:12,build:buildQbRowMid});
QB.def({key:'qb_corner_house',name:'Corner house',family:'Houses — poor and middle',tags:QTAG('middle',['single-family dwelling','market/shop']),w:12,d:12,h:16,fw:12,fd:12,build:buildQbCorner});
QB.def({key:'qb_row_rich',name:'Row house (rich)',family:'Houses — rich',tags:QTAG('rich',['single-family dwelling']),w:13,d:16,h:19,fw:13,fd:14.1,build:buildQbRowRich});
QB.def({key:'qb_court_house',name:'Courtyard house (rich)',family:'Houses — rich',tags:QTAG('rich',['single-family dwelling']),w:26,d:30,h:17,fw:26,fd:25.4,build:buildQbCourt});
