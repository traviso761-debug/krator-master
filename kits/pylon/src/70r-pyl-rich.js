// ================================================================= 70r. PYLON: the rich dwellings, neo-Ancient (PLAN.md section 4)
// Concrete and white render behind a walled court, the Ancient profiles at their grandest (nested portals, pill fins,
// porthole walls), electric lamps (the lighting rule: rich and civic only). Seeds 9091-9099.

// Neo villa: a walled court with a reflecting pool; the house at the back, a white rendered ground storey under a
// cantilevered concrete upper storey ranked with orange pill fins; a nested tombstone portal on the axis; an annexe of
// portholes on the east.
function buildPylNeoVilla(G,o){reseed(9091+(o.v|0));const CW=25,CD=23,WH=2.4,ZH=-5.2,GW=15,GD=8.4,GH=4,UW=17,UD=8,UH=3.6;
 const wh=vC(vPick(PYPAL.white)),conc=vC(vPick(PYPAL.formwork)),or=vC(vPick(PYPAL.orange)),st=vC(vPick(PYPAL.stoneGrey)),gun=vC(vPick(PYPAL.gunmetal)),wal=vC(vPick(PYPAL.walnut));
 const zf=ZH+GD/2;
 vnReg('Neo villa (rich)',0,ZH,10,GH+UH+.8,{style:'neo'});vnReg('Neo villa — court',0,4,10,WH,{style:'neo'});
 // the court wall, its gate between two piers, the paving and the pool
 for(const s of[-1,1]){vB('pyConc',s*(CW/2-.2),0,0,.4,WH,CD,0,conc);vB('pyConc',s*(CW/4+1.6),0,CD/2-.2,CW/2-3.2,WH,.4,0,conc);
  vB('vPlaster',s*(CW/4+1.6),WH,CD/2-.2,CW/2-3.2,.12,.6,0,or);vB('pyConc',s*3.2,0,CD/2-.2,1.0,WH+.9,1.0,0,conc);vB('vPlaster',s*3.2,WH+.9,CD/2-.2,1.2,.2,1.2,0,or);}
 vB('pyConc',0,0,-CD/2+.2,CW,WH,.4,0,conc);
 vB('vStone',0,0,2.6,6.6,.12,7.2,0,st);vB('vWinGlass',0,.12,2.6,5.6,.03,6.2,0,null);
 for(const s of[-1,1]){vnLampPost(s*4.2,0,5.6,2.8);}
 // the ground storey: white, glazed either side of the portal
 vnBody('vPlaster',0,0,ZH,GW,GH,GD,0,wh,{t:.3});
 pynFrame('tomb',0,0,zf,0,2.2,3.4,{rim:.24,n:3,c:wh,fill:'D',out:.07});
 const pf=loc(0,zf,0,.5,0);vB('vPlaster',pf[0],0,pf[1],3.9,.12,.3,0,or);
 for(const s of[-1,1]){vnWin(s*4.9,.35,zf,0,4.2,2.8,'glass','vIron',gun);vnLamp(s*2.3,3.1,zf+.02,0);}
 // the upper storey: concrete, cantilevered past the ground storey, ranked with orange pill fins
 vnBody('pyConc',0,GH,ZH+.6,UW,UH,UD+1.2,0,conc,{t:.3});vB('vPlaster',0,GH+UH,ZH+.6,UW+.1,.25,UD+1.3,0,or);vB('pyConc',0,GH+UH+.25,ZH+.6,UW-.3,.12,UD+.9,0,conc);
 const uf=ZH+.6+(UD+1.2)/2;
 for(let k=0;k<9;k++){const x=-UW/2+1+k*(UW-2)/8;if(k===4)continue;pynStadium(x,GH+.3,uf,0,.42,UH-.6,.5,.5,'P',or);}
 vnWin(0,GH+.5,uf,0,2.6,2.4,'lit','vIron',gun);
 // the annexe on the east: a single storey of concrete, porthole-pierced
 vnBody('pyConc',GW/2+2.2,0,ZH-1,4.4,3.2,6.4,0,conc,{t:.25});vB('vPlaster',GW/2+2.2,3.2,ZH-1,4.5,.15,6.5,0,or);vB('pyConc',GW/2+2.2,3.35,ZH-1,4.2,.1,6.2,0,conc);
 pynPortCluster(GW/2+2.2,.6,ZH+2.2,0,3.6,2.4,4,.55,or,'G');
 vnPaving(0,0,7.2,4,6.8,0,st,1);}

// Hex villa (refs/pylon (5).jpg, ancient massing.jpg): a court behind a porthole wall pierced with hex-grilled
// portholes, entered through a nested pointed-hexagon portal; the house at the back in two flat-roofed blocks of two
// heights, a tall hexagonal gem window on the taller, a triangular one on the lower.
function buildPylHexVilla(G,o){reseed(9096+(o.v|0));const CW=23,CD=21,FZ=9.6,WH=3.4;
 const wh=vC(vPick(PYPAL.white)),cr=vC(vPick(PYPAL.cream)),conc=vC(vPick(PYPAL.formwork)),or=vC(vPick(PYPAL.orange)),st=vC(vPick(PYPAL.stoneGrey)),gun=vC(vPick(PYPAL.gunmetal));
 vnReg('Hex villa (rich)',1,-5.2,9,8.6,{style:'neo'});vnReg('Hex villa — porthole wall and court',0,4,10,WH+2.4,{style:'neo'});
 // the front wall and the portal block
 for(const s of[-1,1]){vB('vPlaster',s*(CW/4+1.6),0,FZ,CW/2-3.2,WH,.6,0,wh);vB('vPlaster',s*(CW/4+1.6),WH,FZ,CW/2-3.0,.14,.8,0,or);
  pynPortCluster(s*(CW/4+1.6),.5,FZ+.3,0,CW/2-4.4,WH-.9,5,.62,or,'G',true);}
 vB('vPlaster',0,0,FZ-.4,6.4,WH+2.4,1.4,0,cr);vB('vPlaster',0,WH+2.4,FZ-.4,6.6,.18,1.6,0,or);
 pynFrame('hex',0,.0,FZ+.3,0,2.2,4.8,{rim:.22,n:4,cs:[wh,or],fill:'D',out:.06});
 for(const s of[-1,1])vnLamp(s*2.6,3.2,FZ+.3,0);
 // the side and back walls, lower
 for(const s of[-1,1])vB('vPlaster',s*(CW/2-.2),0,0,.4,2.4,CD,0,cr);vB('vPlaster',0,0,-CD/2+.2,CW,2.4,.4,0,cr);
 // the house: the lower block (west) and the taller (east), white render, orange cornices
 const A=[-3.4,-4.6,11.6,8.6,4.4],B=[5.2,-5.4,7.4,7.4,7.6];
 for(const [x,z,w,d,h] of[A,B]){vnBody('vPlaster',x,0,z,w,h,d,0,wh,{t:.3});vB('vPlaster',x,h,z,w+.3,.3,d+.3,0,or);vB('vPlaster',x,h+.3,z,w,.5,d,0,wh);}
 pynFrame('hex',B[0],1.2,B[1]+B[3]/2,0,1.6,5.2,{rim:.2,n:2,c:or,fill:'G',out:.05});
  // the lower block's front: the door on its middle, the triangular gem window over it, a lit window either side
 const ta=loc(A[0],A[1]+A[3]/2,0,.12,0);kput('pyGableG',[ta[0],3.42,ta[1]],vQ(Math.PI/2,0,0),[.1,.72,1.3],null);
 const tb=loc(A[0],A[1]+A[3]/2,0,.06,0);kput('vGablePl',[tb[0],3.3,tb[1]],vQ(Math.PI/2,0,0),[.1,1.0,1.8],or);
 vnDoor(A[0],0,A[1]+A[3]/2,0,1.3,2.6,'vPlaster',or,vC(vPick(PYPAL.walnut)),false);
 for(const x of[A[0]-3.6,A[0]+3.6])vnWin(x,1,A[1]+A[3]/2,0,1.4,1.6,'lit','vPlaster',or);
 // the court: paving, a narrow pool on the axis, lamp posts
 pynHexPave(0,0,3.4,10,8,0,st);vB('vStone',0,0,3.4,1.6,.12,6.4,0,st);vB('vWinGlass',0,.12,3.4,1.0,.03,5.8,0,null);
 for(const s of[-1,1])vnLampPost(s*1.7,0,6.3,2.6);}   // flanking the pool, clear of the door

VERN.def({key:'pyl_neo_villa',name:'Neo villa',family:'dwelling',
 tags:{culture:'pylon',style:'neo',type:['single-family dwelling'],wealth:'rich',lit:true},w:26,d:24,h:9,build:buildPylNeoVilla});
VERN.def({key:'pyl_hex_villa',name:'Hex villa',family:'dwelling',
 tags:{culture:'pylon',style:'neo',type:['single-family dwelling'],wealth:'rich',lit:true},w:24,d:22,h:9,build:buildPylHexVilla});
