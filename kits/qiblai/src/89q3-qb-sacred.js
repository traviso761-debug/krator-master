// ================================================================= QIBLAI — sacred and pilgrims (Q4; PLAN.md sections 2a, 3, 5)
// The Decree (Ḍikrī) sings, it does not call: no minarets, prayer wheels instead, and each turn of a wheel sings the Song
// once and turns where the broken Wheel in the sky cannot. The eight great monasteries of the inner square (one a spoke of
// the wheel, the council's abbots: one def in eight dresses, o.v 0-7), the grammarians' college (the sound-grid script is
// holy writing), the four gate temples, the kora's chortens (three sizes), its prayer-wheel arcades (a straight and a
// corner piece) and wheel houses, the wayside shrine (the Xanadu kit's gap); and the pilgrims': the hostel, the
// caravanserai (another gap) and the ghats on the Ālph. Red on the monasteries, white and saffron on the kora, gold
// crowns on every holy roof. Electric light on all (civic). Seeds 33500-33699.

// ---------------------------------------------------------------- shared: a cloister walk on the court face of a range
// square white piers on the court side of a range, a timber lintel and a flat roof over the walk, jali screens in every
// third bay (PLAN.md section 4: jali in the monasteries' cloisters). (x,z,ry) the range's frame, L its length, dd its depth.
function qnCloister(x,y,z,ry,L,dd,c,o){o=o||{};const wk=2.2,n=Math.max(2,Math.round(L/3.2)),H=3.2,tim=xC(xPick(XPAL.dark));
 for(let i=0;i<=n;i++){const u=-L/2+L*i/n,p=loc(x,z,u,dd/2+wk-.3,ry);vB('xWashB',p[0],y,p[1],.55,H,.55,ry,c);
  if(i<n&&i%3===1){const j=loc(x,z,u+L/n/2,dd/2+wk-.3,ry);kput('xJali',[j[0],y+H*.45,j[1]],qEuler(0,ry,0),[L/n-.6,H*.8,1],xC(XPAL.white));}}
 const lp=loc(x,z,0,dd/2+wk-.3,ry);vB('vWood',lp[0],y+H,lp[1],L+.55,.3,.6,ry,tim);
 const rp=loc(x,z,0,dd/2+wk/2,ry);vB('xWashB',rp[0],y+H+.3,rp[1],L+.55,.28,wk+.2,ry,c);vB('xBandB',rp[0],y+H+.58,rp[1],L+.6,.3,wk+.24,ry,o.band||xC(xPick(XPAL.maroon)));
 if(o.drums){const d=loc(x,z,0,dd/2+.02,ry);qnDrums(d[0],y,d[1],ry,L-1.2);}}

// ---------------------------------------------------------------- the great monastery (one a spoke; eight dresses)
// the cell ranges round a cloistered court (two storeys of monks' cells, red, the maroon band), the gate range with its
// gate tower in front, the assembly hall (dukhang) at the back of the court: three storeys, a painted portico, the gilt
// crown with the wheel and deer. The court holds the spoke's own thing: a chorten, a flag mast, a wheel house or a tree.
// The dress (o.v): the spoke's own colour (QSPOKE: walls, trim, band; the owner, 2026-11-11), the hall's crown, the court's
// piece, the storeys of the ranges.
function buildQbMonastery(G,o){const V=xV(o)%8;reseed(33501+V);const W=52,D=52,P=1.2,Dr=7;
 const SP=QSPOKE[V],red=xC(SP.wall).multiplyScalar(rr(.96,1.02)),wash=xC(xPick(XPAL.wash)),stone=xC(xPick(QSTONE)),band=xC(SP.band);   /* red: the spoke's colour (QSPOKE) */
 const trim=xC(SP.trim),hr=V%2?[3.4,3.0,2.8]:[3.4,3.0];
 vnReg('Great monastery (spoke '+(V+1)+', '+SP.name+')',0,0,30,P+16+5,{colour:SP.name.toLowerCase()});
 qnPlinth(0,0,W,D,P,0,stone);
 // the four cell ranges; the front one parted by the gate
 const rr4=[[0,-D/2+Dr/2,W,Dr,Math.PI],[W/2-Dr/2,0,D-2*Dr,Dr,Math.PI/2],[-W/2+Dr/2,0,D-2*Dr,Dr,-Math.PI/2]];
 for(const s of[-1,1])rr4.push([s*(W/4+2.5),D/2-Dr/2,W/2-5,Dr,0]);
 for(const [x,z,L,dd,ry] of rr4){const S=qnStack(x,P,z,L,dd,ry,hr,red,'wash',xC(XPAL.white));
  qnWins(x,P,z,L,dd,ry,hr,S.k,{pitch:2.6,ww:.75,wh:1.0,trim,left:false,right:false,front:true,back:true,val:'all'});
  qnRoof(x,S.y,z,S.w,S.d,ry,red,{band,gold:true,parapet:.6,corner:'gold'});
  if(ry!==0)qnCloister(x,P,z,ry+Math.PI,L-2*2.4,dd,wash,{band});}
 // the gate tower: a white cube one storey over the ranges, the door, banners on its roof
 const gH=hr.reduce((a,b)=>a+b,0)+3.4,GT=qnStack(0,P,D/2-Dr/2,10,Dr+1,0,[gH],wash,'wash');
 qnDoor(0,P,D/2+.5,0,2.4,3.2,{c:xC(XPAL.red),leaf:xC(xPick(XPAL.dark)),step:false});xnFlight(0,0,D/2+.5+Math.max(2,Math.round(P/.17))*.34,0,4.4,P,'vStone',stone);
 for(const u of[-2.6,2.6])xnTibWin(u,P+gH-2.6,D/2+.45,0,1.0,1.3,'lit',trim,{valC:trim});
 const gt=qnRoof(0,GT.y,D/2-Dr/2,GT.w,GT.d,0,wash,{band,gold:true,parapet:.7});qnCrown(0,gt,D/2-Dr/2,GT.w,GT.d,0,{pav:false,deer:true,deerS:.8});
 // the assembly hall at the back of the court
 const HW=24,HD=17,hz=-D/2+Dr+2.2+HD/2,hh=[5.0,4.0,3.6];
 qnPlinth(0,hz,HW+1,HD+1,P+.6,0,stone);
 const H=qnStack(0,P+.6,hz,HW,HD,0,hh,red,'wash',xC(XPAL.white));
 qnWins(0,P+.6,hz,HW,HD,0,hh,H.k,{pitch:2.8,ww:1.0,wh:1.4,kind:'lit',trim,val:'all',skip:[[-6,6]],skipUp:[[-1.6,1.6]]});
 xnPortico(0,P+.6,hz+HD/2,0,12,3.2,4.6,wash,{band:true,valC:trim,colC:xC(XPAL.red)});
 qnDoor(0,P+.6,hz+HD/2,0,2.6,3.6,{c:xC(XPAL.red),leaf:xC(xPick(XPAL.dark)),step:false});
 xnFlight(0,P,hz+HD/2+3.2+Math.max(2,Math.round(.6/.17))*.34,0,7,.6,'vStone',stone);
 for(const s of[-1,1])qnDrums(s*(HW/2-3.2),P+.6,hz+HD/2,0,5.4);
 const ht=qnRoof(0,H.y,hz,H.w,H.d,0,red,{band,gold:true,eave:true,eaveC:xC(xPick(XPAL.dark)),parapet:.7,corner:'gold'});
 const crownTop=qnCrown(0,ht,hz,H.w,H.d,0,{pav:V===3||V===6?[H.w*.32,H.d*.32]:[H.w*.45,H.d*.42],deerS:1.3});
 if(V===5){for(const s of[-1,1])xnGiltRoof(s*H.w*.34,ht-.3,hz-H.d*.2,4,4,0,{frame:1.2,over:.7});}
 // the court: paving, and the spoke's piece on the axis in front of the hall
 const cz=(D/2-Dr+hz+HD/2+3.2)/2+2;qnPave(0,cz,W-2*Dr-6,D/2-Dr-(hz+HD/2+3.2)+2,0,P);
 const piece=V%4;
 if(piece===0)qnChorten(0,P,cz,.9);
 else if(piece===1){vPst('vPostB',0,P,cz,.22,14,xC(0x5a4632));vBall('xGold',0,P+14.2,cz,.3,xC(XPAL.gold[0]));for(let i=0;i<8;i++){const a=i*Math.PI/4;qnFlags([0,P+13.6,cz],[Math.cos(a)*14,P+3.6,cz+Math.sin(a)*8],18);}}
 else if(piece===2){kput('xDrumT',[0,P,cz],null,[2.0,.5,2.0],stone);kput('qSongDrum',[0,P+.5,cz],null,[1.6,3.4,1.6],null);for(const t of[.5,2.1,3.9])kput('xDrumS',[0,P+t,cz],null,[1.68,.2,1.68],xC(XPAL.gold[0]));qnRoof(0,P+4.2,cz,4,4,0,wash,{parapet:.3});for(const sx of[-1,1])for(const sz of[-1,1])vPst('xColS',sx*1.8,P,cz+sz*1.8,.2,4.2,stone);}
 else{xnTree(0,cz,9,null,P);vB('vStone',0,P,cz,4,.6,4,0,stone);}
 for(const s of[-1,1])vnLamp(s*3.4,P+3.4,D/2+.5,0);xnFolk(0,P,cz+4,5,6);}

// ---------------------------------------------------------------- the grammarians' college
// a smaller cloistered court of two-storey ranges, the library hall at the back: its walls carry the sound-grid
// syllabary (holy writing): the first line of the Song in the real Xanadui script, a band under the parapet (qnSongBand)
function buildQbCollege(G,o){reseed(33511+(o.v|0));const V=xV(o),W=34,D=32,P=1.0,Dr=6,hr=[3.4,3.0];
 const red=xC(xPick(XPAL.redwall)),wash=xC(xPick(XPAL.wash)),stone=xC(xPick(QSTONE)),band=xC(xPick(XPAL.maroon)),trim=xC(XPAL.saffron);
 vnReg("Grammarians' college",0,0,20,P+12+4);
 qnPlinth(0,0,W,D,P,0,stone);
 for(const [x,z,L,dd,ry] of[[W/2-Dr/2,2,D-Dr-4,Dr,Math.PI/2],[-W/2+Dr/2,2,D-Dr-4,Dr,-Math.PI/2],[0,D/2-Dr/2+1,W,Dr-2,0]]){const S=qnStack(x,P,z,L,dd,ry,ry===0?[4.0]:hr,ry===0?wash:red,'wash',xC(XPAL.white));
  qnWins(x,P,z,L,dd,ry,ry===0?[4.0]:hr,S.k,{pitch:2.6,ww:.8,wh:1.05,kind:'lit',trim,left:false,right:false,skip:ry===0?[[-2.5,2.5]]:[],val:'all'});
  qnRoof(x,S.y,z,S.w,S.d,ry,ry===0?wash:red,{band,parapet:.6});if(ry!==0)qnCloister(x,P,z,ry+Math.PI,L-2,dd,wash,{band});}
 qnDoor(0,P,D/2,0,2.2,3.0,{c:xC(XPAL.red),step:false});xnFlight(0,0,D/2+Math.max(2,Math.round(P/.17))*.34,0,4,P,'vStone',stone);
 // the library hall
 const HW=W-4,HD=11,hz=-D/2+HD/2,hh=[4.6,3.8];const H=qnStack(0,P,hz,HW,HD,0,hh,red,'wash',xC(XPAL.white));
 qnWins(0,P,hz,HW,HD,0,hh,H.k,{pitch:2.4,ww:1.0,wh:1.5,kind:'lit',trim,skip:[[-2,2]],val:'all',back:false});qnDoor(0,P,hz+HD/2,0,2,3,{c:xC(XPAL.red),step:false});
 // the syllabary band: the Song's first line in the chart's own script (src/89q0y-qb-script.js), along the court face at the
 // string course between the storeys (clear of the windows' lintels; the face there is the ground storey's top, 98 %)
 qnSongBand(0,P+hh[0]-.45,hz+HD*.98/2+.04,0,HW*.98-1.2,.62);
 const ht=qnRoof(0,H.y,hz,H.w,H.d,0,red,{band,gold:true,parapet:.7,corner:'gold'});qnCrown(0,ht,hz,H.w,H.d,0,{pav:[8,5],deerS:1});
 qnPave(0,2,W-2*Dr-5,D-Dr-HD-4,0,P);qnChorten(0,P,3,.55);xnFolk(0,P,6,4,4);}

// ---------------------------------------------------------------- the gate temple (one at each ring gate on the avenues)
function buildQbGateTemple(G,o){reseed(33521+(o.v|0));const V=xV(o),W=16,D=13,P=1.4,ZB=-1.5;
 const R=qnRingC('temple'),wash=R.wall,red=xC(xPick(XPAL.redwall)),stone=xC(xPick(QSTONE)),band=R.band;
 vnReg('Gate temple',0,ZB,11,P+13+5);
 qnPlinth(0,ZB+.9,W+1,D+2.8,P,0,stone);const F=ZB+D/2;
 const S=qnStack(0,P,ZB,W,D,0,[4.6,3.6],wash,'wash');qnWins(0,P,ZB,W,D,0,[4.6,3.6],S.k,{pitch:2.6,ww:.9,wh:1.2,kind:'lit',trim:R.trim,skip:[[-3.2,3.2]],val:'all'});
 xnPortico(0,P,F,0,7,1.8,4.2,wash,{band:true,valC:xC(XPAL.saffron)});qnDoor(0,P,F,0,2,3,{c:xC(XPAL.red),step:false});
 xnFlight(0,0,F+1.8+Math.max(2,Math.round(P/.17))*.34,0,5,P,'vStone',stone);
 const t1=qnRoof(0,S.y,ZB,S.w,S.d,0,wash,{band,parapet:.6,corner:'gold'});
 // the red sanctum on the roof under the gilt crown; drum rows along the flanks
 const T=qnTerraces(0,S.y+.3,ZB,0,[[S.w*.62,S.d*.6,3.6,S.d*.08]],red,{band,parapet:.6});
 qnWins(0,S.y+.3,ZB+T[0].z,S.w*.62,S.d*.6,0,[3.6],.98,{pitch:2.4,ww:.85,wh:1.1,kind:'lit',trim:xC(XPAL.saffron),val:'all'});
 qnCrown(0,T[0].top,ZB+T[0].z,T[0].w,T[0].d,0,{deerS:.9,pav:V===1?false:undefined});
 for(const s of[-1,1])qnDrums(s*(W/2+.1),P,ZB,s*Math.PI/2,D-3);}

// ---------------------------------------------------------------- the chorten (three sizes: o.v 0 small, 1 crossing, 2 great)
function buildQbChorten(G,o){reseed(33531+(o.v|0));const V=xV(o),s=[.6,1.0,1.7][V],stone=xC(xPick(QSTONE));
 vnReg('Chorten',0,0,3*s+1,7*s);
 if(V>0){vB('vStone',0,0,0,6.4*s,.3,6.4*s,0,stone);for(const a of[0,1,2,3]){const p=loc(0,0,0,3.2*s-.5,a*Math.PI/2);qnDrums(p[0],.3,p[1],a*Math.PI/2,5.4*s);}}
 qnChorten(0,V>0?.3:0,0,s);
 if(V===2)for(const sx of[-1,1])for(const sz of[-1,1])qnBanner(sx*2.9*s,.3,sz*2.9*s,2.6);}

// ---------------------------------------------------------------- the kora's prayer-wheel arcade (straight and corner)
// a roofed gallery along the kora: a white back wall with the band, a row of hand prayer-wheels under the roof, red
// posts at the front, a flat roof with the frieze and the band; o.v dresses the wall (white, saffron-trimmed, red).
function qnArcadeRun(x,z,ry,L,V){const dep=3.4,H=3.4,wash=xC(xPick(V===2?XPAL.redwall:XPAL.wash)),band=xC(xPick(XPAL.maroon)),red=xC(XPAL.red),stone=xC(xPick(QSTONE));
 const b=loc(x,z,0,-dep/2+.3,ry);qnCube(b[0],0,b[1],L,H,.6,ry,wash,'wash');
 vB('vStone',x,0,z,L,.25,dep,ry,stone);
 const d=loc(x,z,0,-dep/2+.62,ry);qnDrums(d[0],.25,d[1],ry,L-.8);
 const n=Math.max(2,Math.round(L/2.6));for(let i=0;i<=n;i++){const p=loc(x,z,-L/2+.2+(L-.4)*i/n,dep/2-.3,ry);xnCol(p[0],.25,p[1],H-.25,.15,ry,red,xC(XPAL.saffron));}
 const r=loc(x,z,0,0,ry);vB('vWood',r[0],H,r[1],L+.2,.24,dep+.3,ry,xC(xPick(XPAL.dark)));vB('xWashB',r[0],H+.24,r[1],L+.3,.3,dep+.4,ry,wash);
 vB('xBandB',r[0],H+.54,r[1],L+.36,.32,dep+.46,ry,band);const f=loc(x,z,0,dep/2+.25,ry);xvFr(f[0],H+.86,f[1],L+.36,.28,.04,ry,null);vB('xWashB',r[0],H+.86,r[1],L+.3,.42,dep+.4,ry,wash);}
function buildQbKoraArcade(G,o){reseed(33541+(o.v|0));const V=xV(o);vnReg('Kora arcade',0,0,12,5);qnArcadeRun(0,0,0,24,V);xnFolk(0,0,2.6,3,9);}
function buildQbKoraCorner(G,o){reseed(33551+(o.v|0));const V=xV(o);vnReg('Kora arcade corner',0,0,9,8);
 // two runs meeting at the plot's back-left: one along the back (front +z), one along the left side (front +x), and a
 // chorten-capped corner block where they meet
 qnArcadeRun(1.7,-5,0,10.6,V);qnArcadeRun(-5,1.7,Math.PI/2,10.6,V);
 const wash=xC(xPick(XPAL.wash));qnCube(-5,0,-5,3.4,4.6,3.4,0,wash,'wash');const t=qnRoof(-5,4.6,-5,3.3,3.3,0,wash,{band:xC(xPick(XPAL.maroon)),parapet:.4});qnChorten(-5,t,-5,.3);}

// ---------------------------------------------------------------- the wheel house: a great prayer wheel in a cube house
// (at the kora's corners and gates, PLAN.md section 4: "great prayer wheels in wheel houses instead of minarets"); the
// wheel is seen through the open front. o.v 2: the water-driven wheel on the Ālph, its race under the house.
function buildQbWheelHouse(G,o){reseed(33561+(o.v|0));const V=xV(o),W=10,D=10,P=.8,H=7.2;
 const wash=xC(xPick(XPAL.wash)),band=xC(xPick(XPAL.maroon)),stone=xC(xPick(QSTONE)),g=xC(xPick(XPAL.gold)),red=xC(XPAL.red);
 vnReg('Wheel house',0,-.5,7,P+H+5);
 qnPlinth(0,-.5,W+1,D,P,0,stone);
 // three walls, the front open on two red columns; the inside the room's dim back
 for(const [x,z,w,d] of[[0,-D/2+.3,W,.6],[-W/2+.3,0,.6,D-.6],[W/2-.3,0,.6,D-.6]])qnCube(x,P,z-.5,w,H,d,0,wash,'wash');
 xnRoom(0,P,-.6-D/2+.65,W-1.4,H-.2,.1,0);
 for(const s of[-1,1])xnCol(s*2.6,P,D/2-1.2,H-.4,.25,0,red,xC(XPAL.saffron));
 const t=qnRoof(0,P+H,-.5,W,D,0,wash,{band,gold:true,parapet:.6});qnCrown(0,t,-.5,W,D,0,{pav:[5,4.4],deerS:.85});
 // the wheel: a tall drum in the mosaic (the Song in the sound-grid script), gilt bands, a red cap, on its axle
 const cz=-.8,R2=2.0,Hw=5.2;kput('xDrumS',[0,P,cz],null,[R2+.3,.4,R2+.3],stone);
 kput('qSongDrum',[0,P+.4,cz],null,[R2,Hw,R2],null);for(const t2 of[.4,P+Hw*.5-.4,Hw+.25])kput('xDrumS',[0,P+t2,cz],null,[R2+.08,.16,R2+.08],g);
 kput('xDomeT',[0,P+.4+Hw,cz],null,[R2,.6,R2],red);vPst('vIron',0,P+Hw+.9,cz,.08,H-Hw-1.2,xC(0x3a3430));
 if(V===2){vB('xWaterB',0,.05,0,2.2,.15,D+2,0,xC(XPAL.water));vB('vStone',-1.4,0,0,.5,.6,D+2,0,stone);vB('vStone',1.4,0,0,.5,.6,D+2,0,stone);}
 xnFolk(0,0,D/2+1.2,3,2);}

// ---------------------------------------------------------------- the wayside shrine (the Xanadu kit's gap: shrine keepers)
// a small white cube with a niche of butter lamps behind glass, a mani-stone pile, prayer flags to a pole
function buildQbShrine(G,o){reseed(33571+(o.v|0));const V=xV(o),wash=xC(xPick(XPAL.wash)),stone=xC(xPick(QSTONE)),g=xC(xPick(XPAL.gold));
 vnReg('Wayside shrine',0,0,2.6,4.6);
 vB('vStone',0,0,0,2.8,.4,2.4,0,stone);qnCube(0,.4,0,2.2,2.2,1.8,0,wash,'wash');
 const t=qnRoof(0,2.6,0,2.15,1.75,0,wash,{band:xC(xPick(XPAL.maroon)),parapet:.3});
 xnPane(0,1.0,.9,1.0,1.0,.4,0,'lit');for(let i=0;i<5;i++)vBall('xGold',-.4+i*.2,1.1,.75,.05,g);
 if(V===1)qnChorten(0,t,0,.18);else qnWheelDeer(0,t,.3,0,.35,g);
 for(let i=0;i<9;i++)vB('vStone',1.9+rr(-.5,.5),i<5?0:.32,rr(-.6,.6),rr(.4,.7),.32,rr(.3,.5),rr(0,3),xC(xPick([0xd8d0c0,0xc8c0b0,0xa8a090])));
 vPst('vPost',-1.9,0,-.6,.05,3.6,xC(0x5a4632));qnFlags([-1.9,3.5,-.6],[1.2,t,.8]);}

// ---------------------------------------------------------------- the pilgrims' hostel (on the kora)
function buildQbHostel(G,o){reseed(33581+(o.v|0));const V=xV(o),W=24,D=14,P=.7,hs=[3.6,3.1,3.0];
 const R=qnRingC('kora'),wash=R.wall,stone=xC(xPick(QSTONE));
 vnReg("Pilgrims' hostel",0,-1,13,P+9.7+3.4);
 qnPlinth(0,-1,W,D,P,0,stone);const S=qnStack(0,P,-1,W,D,0,hs,wash,'wash');const F=-1+D/2;
 qnWins(0,P,-1,W,D,0,hs,S.k,{pitch:2.5,ww:.8,wh:1.05,kind:'lit',trim:R.trim,skip:[[-2,2]],val:'all'});
 qnDoor(0,P,F,0,1.8,2.6,{c:xC(XPAL.red)});for(const s of[-1,1])qnDrums(s*7,P,F,0,7.6);
 const top=qnRoof(0,S.y,-1,S.w,S.d,0,wash,{band:R.band,frieze:true,parapet:.75});
 const T=qnTerraces(0,S.y+.3,-1,0,[[S.w*.4,S.d*.5,2.7,S.d*.15]],wash,{band:R.band});qnDoor(0,S.y+.3,-1+T[0].z+S.d*.25,0,1,1.9,{c:R.trim,val:false,step:false});
 for(const s of[-1,1])qnFlags([s*S.w*.2,T[0].top,-1+T[0].z],[s*(S.w/2-.3),top,F-.3]);
 xnFolk(0,0,F+2,5,6);if(V!==1)vnSacks(-8,0,F+1.6,4);}

// ---------------------------------------------------------------- the caravanserai (on the Erewhon road; the Xanadu kit's gap)
function buildQbCaravanserai(G,o){reseed(33591+(o.v|0));const V=xV(o),W=44,D=44,Dr=6.5,P=.6,hr=[3.6,3.0];
 const R=qnRingC('lay'),wash=R.wall,stone=xC(xPick(QSTONE)),tim=xC(xPick(XPAL.timber)),aged=xC(xPick(XPAL.aged));
 vnReg('Caravanserai',0,0,26,P+11+3);
 qnPlinth(0,0,W,D,P,0,stone);
 const rs=[[0,-D/2+Dr/2,W,Dr,Math.PI],[W/2-Dr/2,0,D-2*Dr,Dr,Math.PI/2],[-W/2+Dr/2,0,D-2*Dr,Dr,-Math.PI/2]];for(const s of[-1,1])rs.push([s*(W/4+3),D/2-Dr/2,W/2-6,Dr,0]);
 for(const [x,z,L,dd,ry] of rs){const S=qnStack(x,P,z,L,dd,ry,hr,wash,'wash');
  qnWins(x,P,z,L,dd,ry,hr,S.k,{pitch:3,ww:.75,wh:.95,trim:R.trim,left:false,right:false,from:1,val:'all'});
  qnWins(x,P,z,L,dd,ry,hr,S.k,{pitch:3,ww:.9,wh:1.1,trim:R.trim,left:false,right:false,front:false,top:1});
  qnRoof(x,S.y,z,S.w,S.d,ry,wash,{parapet:.7});
  // the stables' lean-to along the court face, on posts
  const lp=loc(x,z,0,-dd/2-1.6,ry);kput('vWood',[lp[0],P+2.6,lp[1]],vQ(ry,.12,0),[L-4,.12,3.4],aged);
  const n=Math.max(2,Math.round((L-4)/3.4));for(let i=0;i<=n;i++){const p=loc(x,z,-(L-4)/2+(L-4)*i/n,-dd/2-3.1,ry);vPst('vPost',p[0],P,p[1],.08,2.3,aged);}}
 // the gate block: a tall cube with the arch through it, rooms over it, flags
 const GB=qnStack(0,P,D/2-Dr/2,12,Dr+1,0,[hr[0]+hr[1]+3],wash,'wash');vB('vDarkB',0,P,D/2-Dr/2,4,4.2,Dr+1.1,0);
 xnArch('xArchS',0,P,D/2+.52,0,5.4,5.4,.4,stone);qnWins(0,P,D/2-Dr/2,12,Dr+1,0,[hr[0]+hr[1]+3],GB.k,{pitch:2.8,ww:.85,wh:1.1,trim:R.trim,left:false,right:false,from:0,skip:[[-3,3]],sill:5.4});
 const gt=qnRoof(0,GB.y,D/2-Dr/2,GB.w,GB.d,0,wash,{parapet:.8,corner:'flag'});
 xnFlight(0,0,D/2+.5+Math.max(2,Math.round(P/.17))*.34,0,5.4,P,'vStone',stone);
 // the court: the well, the yaks, bales, the caravan's loads
 xnFountain(0,P,0,1.2);for(let i=0;i<(V===1?6:4);i++)xnYak(-10+i*5,6-(i%2)*10,i*.9,P);
 for(let i=0;i<6;i++)kput('vThatchB',[12+(i%3)*1.4,P+.35,-8+Math.floor(i/3)*1.2],null,[1.2,.7,1],xC(xPick(VPAL.thatch)));
 vnSacks(-12,P,-10,6);vnCrate(-9,P,-12,.8);vnCrate(-8,P,-10.6,.7);xnFolk(0,P,4,6,8);}

// ---------------------------------------------------------------- the ghats on the Ālph (PLAN.md section 2a: the sacred river)
// stone stairs down to the water (+z the river), three landings with bathing platforms run out into it, a ghat shrine on
// the top terrace with its crown, a chhatri at each end, umbrellas over the priests' seats. The river is at the plot's
// front, at grade (y 0); the ghat rises from it to the top terrace (H) at the back.
function buildQbGhats(G,o){reseed(33601+(o.v|0));const V=xV(o),W=48,D=30,H=4.8,stone=xC(xPick(QSTONE)),wash=xC(xPick(XPAL.wash)),g=xC(xPick(XPAL.gold));
 vnReg('Ghats',0,-2,26,H+12);
 // the river strip in front, the steps rising from it
 vB('xWaterB',0,0,D/2-3.5,W,.12,7,0,xC(XPAL.water));
 const top=-D/2+8,run=(D/2-7)-top,nSt=Math.round(H/.3);
 // nested slabs, each higher one shorter toward the water and a centimetre narrower (no coplanar ends)
 for(let i=0;i<nSt;i++){const ze=top+run*(nSt-i)/nSt;vB('qAshB',0,0,(top+ze)/2,W-i*.02,H*(i+1)/nSt,ze-top,0,stone.clone().multiplyScalar(1-.02*(i%2)));}
 vB('qAshB',0,0,-D/2+4,W,H,8,0,stone);
 // the bathing platforms out into the water, each with its umbrella seat
 for(const u of[-14,0,14]){vB('vStone',u,0,D/2-4,6,.4,4,0,stone);vPst('vPost',u+2,0.4,D/2-4,.05,2.6,xC(0x5a4632));
  kput('xConeT',[u+2,3.0,D/2-4],null,[1.6,.6,1.6],xC(xPick([XPAL.saffron,XPAL.red,XPAL.white])));xnFolk(u,.4,D/2-4,2,1.5);}
 // the ghat shrine on the top terrace, its crown; the chhatris at the ends
 const sz=-D/2+4;qnCube(0,H,sz,8,4.6,6,0,wash,'wash');const t=qnRoof(0,H+4.6,sz,7.8,5.8,0,wash,{band:xC(xPick(XPAL.maroon)),gold:true,parapet:.5});
 qnDoor(0,H,sz+3,0,1.6,2.6,{c:xC(XPAL.red),step:false});qnCrown(0,t,sz,7.8,5.8,0,{pav:[4,3],deerS:.7});
 for(const s of[-1,1])xnChhatri(s*(W/2-3),H,sz,1.6,3.2,stone,g,6);
 qnDrums(0,H,sz-3.2,Math.PI,6);xnFolk(0,H,sz+5,6,8);
 if(V===1)for(let i=0;i<5;i++)vBall('xGold',-6+i*3,.2,D/2-1.5,.12,xC(0xe8a030));}   // the evening's floated lamps

QB.def({key:'qb_monastery',name:'Great monastery',family:'Sacred — the monasteries',tags:QTAG('civic',['religious','multi-family dwelling'],{job:'worship',note:'one of the eight, a spoke of the wheel (o.v 0-7); names asked of the owner'}),w:52,d:56,h:28,fw:52,fd:52,nv:8,build:buildQbMonastery});
QB.def({key:'qb_college',name:"Grammarians' college",family:'Sacred — the monasteries',tags:QTAG('civic',['religious','civic'],{job:'scribing'}),w:34,d:36,h:20,fw:34,fd:32,build:buildQbCollege});
QB.def({key:'qb_gate_temple',name:'Gate temple',family:'Sacred — the kora',tags:QTAG('civic',['religious']),w:17,d:20,h:20,fw:17,fd:15.8,build:buildQbGateTemple});
QB.def({key:'qb_chorten',name:'Chorten',family:'Sacred — the kora',tags:QTAG('civic',['religious'],{landmark:true}),w:12,d:12,h:12,fw:11,fd:11,build:buildQbChorten});
QB.def({key:'qb_kora_arcade',name:'Kora arcade',family:'Sacred — the kora',tags:QTAG('civic',['religious','infrastructure']),w:24.4,d:6,h:5,fw:24.4,fd:3.6,build:buildQbKoraArcade});
QB.def({key:'qb_kora_corner',name:'Kora arcade corner',family:'Sacred — the kora',tags:QTAG('civic',['religious','infrastructure']),w:14,d:14,h:7,fw:14,fd:14,build:buildQbKoraCorner});
QB.def({key:'qb_wheel_house',name:'Wheel house',family:'Sacred — the kora',tags:QTAG('civic',['religious']),w:12,d:12,h:14,fw:11,fd:10,build:buildQbWheelHouse});
QB.def({key:'qb_shrine',name:'Wayside shrine',family:'Sacred — the kora',tags:QTAG('civic',['religious'],{job:'worship'}),w:6,d:4,h:5,fw:3,fd:2.6,build:buildQbShrine});
QB.def({key:'qb_hostel',name:"Pilgrims' hostel",family:'Pilgrims',tags:QTAG('civic',['tavern/inn','multi-family dwelling']),w:24,d:18,h:16,fw:24,fd:14,build:buildQbHostel});
QB.def({key:'qb_caravanserai',name:'Caravanserai',family:'Pilgrims',tags:QTAG('civic',['tavern/inn','infrastructure']),w:44,d:48,h:14,fw:44,fd:44,build:buildQbCaravanserai});
QB.def({key:'qb_ghats',name:'Ghats',family:'Pilgrims',tags:QTAG('civic',['religious','infrastructure'],{note:'the stairs to the sacred river; +z is the water'}),w:48,d:30,h:14,fw:48,fd:24,build:buildQbGhats});
