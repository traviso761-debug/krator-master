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

// Folk villa (refs/pylon 2.jpg): three storeys of white, orange stepped arches over a recessed porch on orange round
// columns, a terrace with a scalloped rail on the second floor, a rooftop pavilion with nested panels, square corner
// piers rising above the parapet.
function buildPylFolkVilla(G,o){reseed(9011+(o.v|0));const W=10.4,D=10.6,H=3.2,Y0=.5,Z0=-1.2,PD=2.2;
 const wh=vC(vPick(PYPAL.white)),or=vC(vPick(PYPAL.orange)),st=vC(vPick(PYPAL.stoneGrey)),wal=vC(vPick(PYPAL.walnut));
 const zf=Z0+D/2,Y1=Y0+H+.3,Y2=Y1+H+.3,Y3=Y2+H*.85;
 vnReg('Folk villa (middle)',0,Z0+.4,8,Y3+1.6,{style:'folk'});
 vB('vStone',0,-.1,Z0,W+.5,Y0+.1,D+.5,0,st);
 // ground storey: the body set back behind the porch, the porch's floor and its two columns, the stepped arches
 vnBody('vPlaster',0,Y0,Z0-PD/2,W,H,D-PD,0,wh,{t:.3});
 for(const x of[-W/2+.45,W/2-.45])vB('vPlaster',x,Y0,zf-PD/2,.9,H,PD,0,wh);
 for(const x of[-1.7,1.7])vPst('vPostS',x,Y0,zf-.35,.24,H,or);
 pynStepArch(-3.3,Y0+H-1.2,zf-.25,0,2.6,2,.9,.16,.1,or);pynStepArch(0,Y0+H-1.2,zf-.25,0,2.9,2,1.0,.16,.1,or);pynStepArch(3.3,Y0+H-1.2,zf-.25,0,2.6,2,.9,.16,.1,or);
 vnDoor(0,Y0,zf-PD,0,1.2,2.4,'vPlaster',or,wal,false);vnWin(-3,Y0+.9,zf-PD,0,1.6,1.4,'glass','vPlaster',or);vnWin(3,Y0+.9,zf-PD,0,1.6,1.4,'glass','vPlaster',or);
 vnStairs(0,0,zf+.6,0,2.4,Y0,2,'vStone',st);
 pynBand(0,Y0+H,Z0,W,D,.3,.25,0,or);
 // second storey: full depth, a scalloped terrace rail over the porch, glazed doors
 vnBody('vPlaster',0,Y1,Z0-PD/2,W,H,D-PD,0,wh,{t:.3});
 pynScallop(0,Y1,zf-.1,0,W-.4,.95,-.3,15,wh,or);
 for(const x of[-2.6,0,2.6])vnWin(x,Y1+.1,zf-PD,0,1.2,2.3,'glass','vPlaster',or);
 pynBand(0,Y1+H,Z0-PD/2,W,D-PD,.3,.25,0,or);
 // the roof: a parapet with nested panels, corner piers, and the rooftop pavilion set back
 vB('vPlaster',0,Y2,Z0-PD/2,W,.9,D-PD,0,wh);vB('vPlaster',0,Y2+.9,Z0-PD/2,W+.2,.1,D-PD+.2,0,or);
 pynPanel(0,Y2+.15,zf-PD+.02,0,W-3.2,.6,or,2,.09);
 for(const sx of[-1,1])pynPier(sx*(W/2-.45),Y2,zf-PD-.45,0,.9,.9,1.8,wh,or);
 vnBody('vPlaster',0,Y2,Z0-2.6,5.2,H*.85,4.2,0,wh,{t:.25});pynBand(0,Y3,Z0-2.6,5.2,4.2,.3,.25,0,or);
 pynPanel(-1.3,Y2+.5,Z0-.5+.02,0,1.4,1.6,or,2,.12);vnDoor(1.2,Y2,Z0-.5,0,.95,2.1,'vPlaster',or,wal,false);
 // the sides
 for(const s of[-1,1])for(const y of[Y0+.9,Y1+.9])vnWin(s*W/2,y,Z0-1.8,s*Math.PI/2,1.3,1.3,'glass','vPlaster',or);
 vnWin(0,Y1+.9,Z0-D/2,Math.PI,1.6,1.3,'glass','vPlaster',or);}

// Vault house (refs/pylon (4).jpg, pylon (7).jpg): three barrel-vaulted wings of graded height side by side on a raised
// plinth, each ending in a glazed tombstone arch framed in orange; portholes down the sides, the door between wings.
function buildPylVaultHouse(G,o){reseed(9021+(o.v|0));const Y0=.7,WALL=2.1;
 const wh=vC(vPick(PYPAL.white)),cr=vC(vPick(PYPAL.cream)),or=vC(vPick(PYPAL.orange)),st=vC(vPick(PYPAL.stoneGrey)),wal=vC(vPick(PYPAL.walnut));
 // [centre x, span, rise, length, front z]
 const WG=[[-4.4,4.0,1.9,7.6,2.4],[0,4.6,2.5,9.0,3.0],[4.4,3.8,1.6,6.6,1.8]];
 vnReg('Vault house (middle)',0,-1.4,7.6,Y0+WALL+2.5+.6,{style:'neo'});
 vB('vStone',0,0,-1.2,13.6,Y0,10,0,st);vnStairs(0,0,4.45,0,2.6,Y0,3,'vStone',st);
 WG.forEach(([x,w,r,L,zf],i)=>{const zc=zf-L/2,c=i===1?wh:cr;
  vnBody('vPlaster',x,Y0,zc,w,WALL,L,0,c,{t:.25});
  pynVault(x,Y0+WALL,zc,w+.2,L,r,0,'pyHalf',c);
  pynFrame('tomb',x,Y0+.25,zf,0,w-1.1,WALL+r-.6,{rim:.18,n:1,c:or,fill:'G',out:.05});
  if(i!==1)for(let k=0;k<2;k++){const s=i===0?-1:1;pynPorthole(x+s*w/2,Y0+1.3,zc+(k-.5)*L*.45,s*Math.PI/2,.35,or,'G',0);}});
 // the links between the wings: low flat-roofed blocks, the door in the west one
 for(const s of[-1,1])vnBody('vPlaster',s*2.2,Y0,-1.6,.8,WALL+.4,5.4,0,cr,{t:.2});
 vnDoor(-2.2,Y0,1.1,0,.8,2.1,'vPlaster',or,wal,false);
 vnPlanter(3.0,0,4.3,1.6,.6,0,cr);kput('vClayPot',[-3.4,0,4.4],null,[.3,.6,.3],null);}

// Terrace (refs/pylon (3).jpg, pylon (2).jpg): three storeys of stacked boxes stepping back, each storey's front a row
// of big round-headed openings framed in orange, roof terraces with parapets and planters, an outside stair with orange
// treads climbing the east side. Several households.
function buildPylTerrace(G,o){reseed(9031+(o.v|0));const Y0=.4,H=3.2;
 const wh=vC(vPick(PYPAL.white)),cr=vC(vPick(PYPAL.cream)),or=vC(vPick(PYPAL.orange)),st=vC(vPick(PYPAL.stoneGrey)),gun=vC(vPick(PYPAL.gunmetal));
 // [centre x, width, front z, depth, y, colour]
 const L=[[0,12,4.6,10.4,Y0,wh],[-.8,10.4,1.4,7.2,Y0+H+.3,cr],[-2.2,7.6,-1.6,4.2,Y0+2*(H+.3),wh]];
 vnReg('Terrace (middle, shared)',-.8,-.6,7.8,Y0+3*(H+.3)+1,{style:'neo',type:['multi-family dwelling']});
 vB('vStone',0,-.1,-.6,12.4,Y0+.1,10.8,0,st);
 L.forEach(([x,w,zf,d,y,c],i)=>{const zc=zf-d/2;vnBody('vPlaster',x,y,zc,w,H,d,0,c,{t:.3});
  vB('vPlaster',x,y+H,zc,w+.1,.3,d+.1,0,c);
  const n=i===2?2:3;for(let k=0;k<n;k++){const u=x+(k-(n-1)/2)*(w/n);
   if(i===0&&k===1)pynFrame('tomb',u,y,zf,0,1.6,2.6,{rim:.2,c:or,fill:'D',out:.05});
   else{pynFrame('tomb',u,y+.5,zf,0,2.0,2.3,{rim:.2,c:or,fill:'G',out:.05});const p=loc(u,zf,0,.2,0);vB('vIron',p[0],y+.5+1.15,p[1],2.0,.05,.05,0,gun);vB('vIron',p[0],y+.5,p[1],.05,2.3,.05,0,gun);}}
  // the terrace in front of the next storey up: a parapet and planters on this storey's roof
  if(i<2){vB('vPlaster',x,y+H+.3,zf-.1,w,.8,.2,0,c);vB('vPlaster',x,y+H+1.1,zf-.1,w+.1,.08,.3,0,or);
   vnPlanter(x-w/2+1.4,y+H+.3,zf-.8,1.6,.5,0,c);vnPlanter(x+w/2-1.6,y+H+.3,zf-.8,1.4,.5,0,c);}});
 // the outside stair up the east end: orange treads beside a white stringer wall
 const sx=6.6;vnStairs(sx,0,2.4,Math.PI,1.2,Y0+H+.3,10,'vPlaster',or);vB('vPlaster',sx+.65,0,1.0,.2,Y0+H+.9,5.4,0,wh);
 for(const s of[-1,1])vnWin(s*6,Y0+1,0,s*Math.PI/2,1.2,1.3,'glass','vPlaster',or);}

// Block (refs/pylon 5.jpg, pylon3.jpg): a board-formed concrete block cantilevered over a recessed orange ground floor,
// an orange slab canopy along the front, four pill niches lined in orange with steel-grid glazing, an orange rounded
// window box on the side, triangular perforations on the solid west end. Flats over shops; three storeys, so it keeps
// the middle tier's height band (VASSAL-KITS.md section 2).
function buildPylBlock(G,o){reseed(9041+(o.v|0));const W=11.6,D=9.4,Z0=-.8,GH=3.6,H=3.3,N=2,SB=1.6;
 const conc=vC(vPick(PYPAL.formwork)),or=vC(vPick(PYPAL.orange)),gun=vC(vPick(PYPAL.gunmetal));
 const zf=Z0+D/2,TOP=GH+N*H;
 vnReg('Block (middle, flats over shops)',0,Z0,7.6,TOP+1,{style:'neo',type:['multi-family dwelling','market/shop']});
 // the ground floor, set back and rendered orange, glazed shop fronts; the slab canopy over it
 vnBody('vPlaster',0,0,Z0-SB/2,W-.6,GH,D-SB,0,or,{t:.3});
 for(const x of[-3.4,0,3.4])vnWin(x,.2,zf-SB,0,2.6,2.6,'glass','vIron',gun);
 pynCanopy(0,GH,zf-SB,0,W+.8,SB+1.2,.35,or);
 // the concrete mass and its parapet
 vnBody('pyConc',0,GH,Z0,W,N*H,D,0,conc,{t:.3});vB('pyConc',0,TOP,Z0,W+.1,.7,D+.1,0,conc);
 // the pill niches: an orange stadium lining standing proud, the glazing inside it with a steel grid
 for(let k=0;k<4;k++){const x=-W/2+1.6+k*(W-3.2)/3;
  pynStadium(x,GH+.35,zf,0,1.5,N*H-.6,.12,.12,'P',or);pynStadium(x,GH+.55,zf,0,1.0,N*H-1.0,.18,.06,'G');
  const p=loc(x,zf,0,.22,0);for(let j=1;j<4;j++)vB('vIron',p[0],GH+.55+j*(N*H-1.0)/4,p[1],1.0,.05,.04,0,gun);vB('vIron',p[0],GH+.9,p[1],.05,N*H-1.7,.04,0,gun);}
 // the side window box: a rounded orange box standing out of the east face, glazed
 pynStadium(W/2,GH+1.4,Z0+1,Math.PI/2,3.0,2.0,.7,.7,'P',or);pynStadium(W/2,GH+1.65,Z0+1,Math.PI/2,2.4,1.5,.74,.06,'G');
 vnWin(W/2,GH+H+1,Z0-2.6,Math.PI/2,1.4,1.4,'glass','vIron',gun);
 // the perforated west end: rows of small dark triangles
 for(let r=0;r<5;r++)for(let c=0;c<6;c++){const zz=Z0-D/2+1.2+c*(D-2.4)/5+(r%2?.4:0),yy=GH+.5+r*1.15;const f=loc(-W/2,zz,0,.03,-Math.PI/2);
  kput('pyGableD',[f[0],yy,f[1]],vQ(0,0,0),[.06,.5,.55],null);}
 for(let k=0;k<2;k++)vnWin(k?2.5:-2.5,GH+H*.5+.4,Z0-D/2,Math.PI,1.4,1.4,'glass','vIron',gun);
 vnDoor(-W/2+.9,0,zf-SB,0,1.0,2.4,'vIron',gun,gun,false);
 pynTank(3.6,TOP+.7,Z0-2.2,.9,1.6,vC(vPick(PYPAL.rust)));}

VERN.def({key:'pyl_folk_house',name:'Folk house',family:'dwelling',
 tags:{culture:'pylon',style:'folk',type:['single-family dwelling'],wealth:'middle',lit:false},w:11,d:14.5,h:13,build:buildPylFolkHouse});
VERN.def({key:'pyl_folk_villa',name:'Folk villa',family:'dwelling',
 tags:{culture:'pylon',style:'folk',type:['single-family dwelling'],wealth:'middle',lit:false},w:12,d:13,h:14,build:buildPylFolkVilla});
VERN.def({key:'pyl_vault_house',name:'Vault house',family:'dwelling',
 tags:{culture:'pylon',style:'neo',type:['single-family dwelling'],wealth:'middle',lit:false},w:14.5,d:12,h:7.5,build:buildPylVaultHouse});
VERN.def({key:'pyl_terrace',name:'Terrace',family:'dwelling',
 tags:{culture:'pylon',style:'neo',type:['multi-family dwelling'],wealth:'middle',lit:false},w:15,d:12,h:12,build:buildPylTerrace});
VERN.def({key:'pyl_block',name:'Block (flats over shops)',family:'dwelling',
 tags:{culture:'pylon',style:'neo',type:['multi-family dwelling','market/shop'],wealth:'middle',lit:false},w:13,d:12,h:11,build:buildPylBlock});
