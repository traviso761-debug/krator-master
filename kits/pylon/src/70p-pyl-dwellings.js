// ================================================================= 70p. PYLON: dwellings (kits/pylon/PLAN.md section 4)
// Seed block 9001-9099 (PLAN.md: Pylon takes 9001-9399). Tags: culture 'pylon', a style ('ancient' | 'neo' | 'folk' |
// 'salvage'), and the project's type, wealth and lit (lit only for rich and civic: the Vernacular's lighting rule).

// ---------------------------------------------------------------- MIDDLE
// Folk house (refs/pylon.jpg): the post-Cataclysm imitation of the Ancients' white and orange in render. Two storeys of
// white on a grey stone plinth, a thick orange cornice band at each floor, corner parapet piers with panel insets, the
// upper storey set back behind a scalloped balcony front, a pedimented porch on striped columns, a striped side pier,
// diamond and disc insets on the parapet. Built a little back on its plot so the porch and steps stay inside it.
function buildPylFolkHouse(G,o){reseed(9001+(o.v|0));const W=9.6,D=10.4,H1=3.4,H2=3.2,Y0=.45,Z0=-1.4,BK=2.4;
 const wh=vC(vPick(PYPAL.white)),or=vC(vPick(PYPAL.orange)),st=vC(vPick(PYPAL.stoneGrey)),wal=vC(vPick(PYPAL.walnut)),tile=vC(0xc0583a);
 const zf=Z0+D/2,zu=zf-BK,Y1=Y0+H1+.35,Y2=Y1+H2;
 vnReg('Folk house (middle)',0,Z0+.6,7.6,Y2+2.6,{style:'folk'});
 // plinth, ground storey, the floor band, the upper storey set back, the roof band and parapet
 vB('vStone',0,-.1,Z0,W+.5,Y0+.1,D+.5,0,st);
 vnBody('vPlaster',0,Y0,Z0,W,H1,D,0,wh,{t:.3});
 pynBand(0,Y0+H1,Z0,W,D,.35,.25,0,or);
 vnBody('vPlaster',0,Y1,Z0-BK/2,W,H2,D-BK,0,wh,{t:.3});
 pynBand(0,Y2,Z0-BK/2,W,D-BK,.4,.3,0,or);
 vB('vPlaster',0,Y2+.4,Z0-BK/2,W,.8,D-BK,0,wh);vB('vPlaster',0,Y2+1.2,Z0-BK/2,W+.2,.12,D-BK+.2,0,or);
 // the corner parapet piers on the front corners of the upper storey, and a panel band between them
 for(const s of[-1,1])pynPier(s*(W/2-.45),Y2+.4,zu-.45,0,.9,.9,1.9,wh,or);
 pynPanel(0,Y2+.55,zu+.02,0,W-3,.6,or,2,.1);
 for(const s of[-1,1])pynDiamond(s*1.6,Y2+.85,zu+.12,0,.34,or);pynDisc(0,Y2+.85,zu+.12,0,.24,or);
 // the balcony: the scalloped front over the ground storey's band, its cheek walls, the upper doors and windows behind it
 pynScallop(0,Y1,zf+.05,0,W-1.4,1.05,.45,15,wh,or);
 for(const s of[-1,1]){vB('vPlaster',s*(W/2-.35),Y1,zf-BK/2+.05,.7,1.3,BK,0,wh);vB('vPlaster',s*(W/2-.35),Y1+1.3,zf-BK/2+.05,.85,.12,BK+.1,0,or);}
 vnDoor(-1.4,Y1,zu,0,1.0,2.2,'vPlaster',or,wal,false);vnWin(1.6,Y1+.8,zu,0,1.8,1.4,'glass','vPlaster',or);
 // ground storey: the porch, the door, a window either side, the striped pier at the left corner
 const px=1.1,pz=zf+1.5,pw=3.4;
 for(const s of[-1,1])pynColumn(px+s*(pw/2-.25),Y0,pz+.9,H1-.2,.17,wh,or,5);
 vB('vPlaster',px,Y0+H1-.2,pz,pw+.2,.3,2.0,0,or);
 vnGableRoof(px,Y0+H1+.1,pz+.1,2.2,pw+.2,1.0,Math.PI/2,'vClayB',tile,.25,'vGablePl',wh,.14);
 pynDisc(px,Y0+H1+.48,pz+1.18,0,.28,vC(0x8a2a22));
 vB('vStone',px,-.1,pz,pw+.2,Y0+.1,2.0,0,st);vnStairs(px,0,pz+1.6,0,pw-.6,Y0,2,'vStone',st);
 vnDoor(px,Y0,zf,0,1.15,2.4,'vPlaster',or,wal,false);
 vnWin(-2.6,Y0+.9,zf,0,1.7,1.5,'glass','vPlaster',or);vnWin(4.0,Y0+.9,zf,0,.8,1.5,'glass','vPlaster',or);
 vB('vPlaster',-W/2+.47,Y0,zf-.3,.9,Y2-Y0+.4,.6,0,wh);pynStripes(-W/2+.45,Y0+.3,zf,0,.8,Y2-Y0-.6,12,or);
 // the sides: one window a storey, framed in orange
 for(const s of[-1,1]){vnWin(s*W/2,Y0+.9,Z0-1,s*Math.PI/2,1.4,1.4,'glass','vPlaster',or);vnWin(s*W/2,Y1+.8,Z0-1.8,s*Math.PI/2,1.4,1.3,'glass','vPlaster',or);}
 vnWin(0,Y0+.9,Z0-D/2,Math.PI,1.6,1.4,'glass','vPlaster',or);
 // the yard: a planter and a water jar by the steps
 vnPlanter(-2.6,0,zf+1.3,2.2,.6,0,wh);
}

VERN.def({key:'pyl_folk_house',name:'Folk house',family:'dwelling',
 tags:{culture:'pylon',style:'folk',type:['single-family dwelling'],wealth:'middle',lit:false},w:11,d:14.5,h:13,build:buildPylFolkHouse});
