// ================================================================= HIGHLANDS / REPUBLICAN — trade, taverns and industry
// The working town of the Iron Republic. Taverns run from the Norse-Russian log beer hall (dragon bargeboards, long
// tables outside) through the Saxon half-timbered tavern with its beer garden to the Russian traktir with a
// gallery and kryltso; the coaching inn wraps a yard in galleries. Shops are narrow gabled fronts with shutter
// counters and painted signboards; the market hall stands on stone arches under a bell turret. Industry is where
// the Iziz note is loudest: scrap smithies roofed in salvaged sheet, iron stacks, heaps of Ancient panels and pipe.
// No electric light here except the rich coaching inn and the market hall. Seeds 20400–20699.

// ---------------------------------------------------------------- R-A trade furniture (prefix hnRA)
// Painted signboard flat on a wall (y = bottom): a dark frame, a coloured board, a formline crest in the middle and
// blocky painted lettering either side.
function hnRASignboard(x,y,z,ry,w,h,bgC,frameC){hnSignBoard(x,y,z,ry,w,Math.max(h,.6),null,bgC);}   // round 2: the trade's symbol between knot panels
// Hanging sign on an iron bracket out of a wall (the board hangs across the street, crest on both faces).
function hnRAHangSign(x,y,z,ry,c,s){hnSign(x,y,z,ry,null,s||1);}   // round 2: the trade's symbol roundel
// The trade furniture is PLACED from the master catalog (FURNISH, 89y): these helpers keep their names and arguments,
// pick the harvested piece (kits/catalog, hl_rep_*) and its variant nearest the size asked for, and burn the random
// numbers their drawing used to draw (hlRngSkip), so the structure built after them does not move.
// A trestle table with two benches (length along local x of ry) and a few mugs (each mug drew 3 numbers).
function hnRATable(x,z,ry,L,c){hlRngSkip(3*Math.round(L));return FURNISH('hl_rep_trestle_table',x,0,z,ry,{v:L<3.3?0:L<4.7?1:2});}
// A barrel lying on its side, axis along local x of ry, centred at (x,z), bottom at y.
function hnRABarrelLying(x,y,z,ry,r,L,c){return FURNISH('hl_rep_barrel_lying',x,y,z,ry);}
// A pyramid of lying barrels (rows n, n-1, …), axis along local z of ry: three or six barrels
function hnRABarrelStack(x,z,ry,n,r,c){return FURNISH('hl_rep_barrel_stack',x,0,z,ry,{v:n>=3?1:0});}
// A heap of salvage: rusted plate, pipe offcuts, corrugated sheet and white Ancient panel scraps, heaped highest in the
// middle (the small heap, or the smithy's yard heap for a big one). Each scrap drew 9 to 10 numbers, by its kind.
function hnRAScrap(x,z,w,d,n){for(let i=0;i<n;i++){hlRngSkip(3);const r=rng();hlRngSkip(r<.3?6:r<.5?5:r<.72?6:r<.86?5:6);}
 return FURNISH('hl_rep_scrap_heap',x,0,z,0,{v:w*d>9?1:0});}
function hnRAAnvil(x,z,ry){return hnFurn('hl_rep_anvil',x,0,z,ry,{v:0},0,.14);}   // the piece is centred on its footprint, the stump .14 behind
// quench trough: a stone box with dark water (local x of ry = length)
function hnRATrough(x,z,ry,L,c){if(!c)rng();return FURNISH('hl_rep_quench_trough',x,0,z,ry,{v:L>1.9?1:0});}
// forge hearth against a wall (back toward -z of ry): the catalog's (stone block, ember bed, hood, bellows, a short
// stack to 3.5 m); the reclaimed-pipe stack on up through the shed roof is the shed's own. The drawing drew 16 numbers.
function hnRAHearth(x,z,ry,stackH,w){w=w||1.8;hlRngSkip(16);const r=hnFurn('hl_rep_forge_hearth',x,0,z,ry,{v:w>=1.9?1:0},-.45,0);
 vnChimney(x,3.5,z,stackH-.7,.3,true);return r;}
// wagon: bed along local z of ry (shafts toward +z); load: 'hay' | 'barrels' | 'sacks' | 'wheel' (a wheel off). Its hay
// drew a colour, its sacks 20 numbers.
function hnRAWagon(x,z,ry,c,load){hlRngSkip(load==='hay'?1:load==='sacks'?20:0);
 return hnFurn('hl_rep_wagon',x,0,z,ry,{v:{hay:0,barrels:1,sacks:2,wheel:3}[load]|0},0,1.105);}
// a horse, standing, facing +z of ry (colour c)
function hnRAHorse(x,z,ry,c){const B=(u,o)=>loc(x,z,u,o,ry),q=qEuler(0,ry,0);let p=B(0,0);kput('hPaintBall',[p[0],1.28,p[1]],q,[.3,.34,.82],c);
 for(const o of[-.55,.5])for(const s of[-1,1]){const l=B(s*.15,o);vB('hPaint',l[0],0,l[1],.1,1.12,.12,ry,c);vB('hPaint',l[0],0,l[1],.12,.12,.14,ry,hC(0x2a2420));}
 const n0=B(0,.55),n1=B(0,.95);beam('hPaint',[n0[0],1.38,n0[1]],[n1[0],1.92,n1[1]],.2,.3,c);const h=B(0,1.18);kput('hPaint',[h[0],1.8,h[1]],vQ(ry,-1.1,0),[.2,.6,.26],c);
 const t0=B(0,-.78),t1=B(0,-.98);beam('hPaint',[t0[0],1.4,t0[1]],[t1[0],.75,t1[1]],.08,.08,hC(0x2a2420));
 const m0=B(0,.62),m1=B(0,1.0);beam('hPaint',[m0[0],1.58,m0[1]],[m1[0],2.1,m1[1]],.06,.14,hC(0x2a2420));}
const HRA_HORSE=[0x6a4a30,0x4a3020,0x8a6a4a,0x2a2420,0xa89880,0x5a3a28];
// jib crane: a mast with a boom swung toward ry, a brace, a chain and hook (iron when iron=true)
function hnRACrane(x,z,ry,h,L,c,iron){const it=iron?'vPipeR':'vPostB',I=hC(0x2e2a26);vPst(it,x,0,z,iron?.14:.2,h,iron?null:c);const p=loc(x,z,0,L,ry),m=loc(x,z,0,L*.55,ry);
 beam(iron?'vIron':'vWood',[x,h-.25,z],[p[0],h-.25,p[1]],.18,.18,iron?I:c);beam(iron?'vIron':'vWood',[x,h-2.2,z],[m[0],h-.3,m[1]],.12,.12,iron?I:c);
 vPst('vRope',p[0],h-2.8,p[1],.025,2.5,hC(0x6a6258));vB('vIron',p[0],h-3,p[1],.2,.25,.08,ry,I);}
// a gallery deck along a face from (x0,z0) to (x1,z1), deck at y, projecting `out` toward the local unit vector N,
// with a cut-board balustrade on its outer edge and either raking brackets back into the wall or posts to the ground
function hnRAGallery(x0,z0,x1,z1,y,out,N,c,railC,postTop){const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(N[0],N[2]);const mx=(x0+x1)/2+N[0]*out/2,mz=(z0+z1)/2+N[2]*out/2;
 vB('vWood',mx,y-.16,mz,L,.16,out,ry,c);const fx=(x0+x1)/2+N[0]*(out-.05),fz=(z0+z1)/2+N[2]*(out-.05);
 kput('hLaceB',[fx,y+.5,fz],qEuler(0,ry,0),[L,.95,1],railC||c);vB('vWood',fx,y+.96,fz,L+.05,.1,.14,ry,c);
 const n=Math.max(1,Math.round(L/2.5));for(let i=0;i<=n;i++){const t=i/n,wx=lerp(x0,x1,t),wz=lerp(z0,z1,t),px=wx+N[0]*(out-.12),pz=wz+N[2]*(out-.12);
  if(postTop)vPst('vPostB',px,0,pz,.11,postTop,c);else hnMember('vWood',[wx+N[0]*.05,y-1.1,wz+N[2]*.05],[px,y-.18,pz],.14,.12,hRot(ry,[1,0,0]),c);}}

// ---------------------------------------------------------------- TAVERNS AND INNS
// A — the beer hall: a long hall of tarred logs, gable to the street under a steep shingle roof whose bargeboards
// cross into dragon heads; a horned porch, a loft balcony in the gable, painted shields along the walls, a smoke
// louvre on the ridge; long tables and a fire outside, a pyramid of barrels.
function buildHlRepTavernA(G,o){reseed(20401+(o.v|0));const W=11,D=20,Y0=.6,H=3.8,P=1.35,ZC=-5,zf=ZC+D/2;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.3,1.6)),tar=hC(vPick(HPAL.tar)),sh=hC(vPick(HPAL.shingle)),pine=hC(vPick(HPAL.pine)),trim=hC(vPick([HPAL.red,HPAL.teal,HPAL.ochre]));
 const yw=Y0+H,rise=P*W/2;vnReg('Beer hall',0,ZC+2,13,yw+rise+1.4);
 vB('hRubB',0,0,ZC,W+.5,Y0,D+.5,0,hC(vPick(HPAL.rubble)));hnLogBox(0,Y0,ZC,W,H,D,0,log);
 hnGable(0,yw,ZC,D,W,P,Math.PI/2,'vShingleB',sh,.9,'hGableLog',log);hnBarge(0,yw,ZC,D,W,rise,Math.PI/2,.9,pine,'dragon');
 // side windows with simple painted surrounds, round shields between them
 for(const s of[-1,1])for(let i=0;i<5;i++){const z=ZC-7.2+i*3.6;hnNal(s*W/2,Y0+1.3,z,s*Math.PI/2,.7,.8,'glass',trim,{});
  if(i<4){const zz=z+1.8,c=hC([HPAL.red,HPAL.teal,HPAL.white,HPAL.black,HPAL.ochre][(i+(s>0?2:0))%5]);kput('vPost',[s*(W/2+.02),Y0+2.4,zz],qEuler(0,0,-s*Math.PI/2),[.42,.07,.42],c);vBall('vBall',s*(W/2+.1),Y0+2.4,zz,.09);}}
 // the porch: carved posts, a horned gable, a double door
 const PW=4.8,PD=3.4,pz=zf+PD/2;vB('vWood',0,Y0-.2,pz,PW,.2,PD,0,log);vnStairs(0,0,zf+PD+.45,0,2.6,Y0,3,'vWood',log);
 for(const sx of[-1,1])for(const z of[zf+.3,zf+PD-.2]){vPst('vPostB',sx*(PW/2-.2),Y0,z,.16,2.7,pine);kput('hPaintBall',[sx*(PW/2-.2),Y0+2.2,z],null,[.2,.24,.2],trim);}
 for(const sx of[-1,1])vB('vWood',sx*(PW/2-.2),Y0+2.62,pz,.22,.22,PD+.2,0,log);vB('vWood',0,Y0+2.62,zf+PD-.2,PW,.22,.22,0,log);
 // (the porch roof runs 1.5 m back into the hall so its rear horns are buried in the hall's roof)
 hnGable(0,Y0+2.8,pz-1.7,PD+3.8,PW,1.3,Math.PI/2,'vShingleB',sh,.4,'vGableW',log);hnBarge(0,Y0+2.8,pz-1.7,PD+3.8,PW,1.3*PW/2,Math.PI/2,.4,pine,'horns');
 hnForm('hFormT',0,Y0+3.05,pz-.2+(PD+.8)/2+.02,0,2.4,1.2);
 vnDoor(0,Y0,zf,0,1.9,2.4,'vWood',tar,tar,false);
 // the loft balcony high in the gable, clear of the porch horns
 const yb=yw+4;hnBalcony(0,yb,zf,0,2.2,.9,tar,trim,false);vnDoor(0,yb,zf,0,.85,1.65,'vWood',tar,tar,false);
 for(const s of[-1,1])vnWin(s*2.6,yw+.6,zf,0,.6,.8,'glass','hPaint',trim);
 // smoke louvre on the ridge
 vB('vWood',0,yw+rise-.6,ZC-3,1.4,1.3,2.2,0,log);for(const s of[-1,1])vB('vDarkB',s*.71,yw+rise-.1,ZC-3,.02,.5,1.8,0);
 vnGableRoof(0,yw+rise+.7,ZC-3,2.8,2,1,Math.PI/2,'vShingleB',sh,.25);
 // outside: long tables and benches, a fire, barrels, a hanging sign
 const tz=zf+PD+4.4;for(const x of[-3.4,3.4])hnRATable(x,tz,Math.PI/2,5.2,pine);hnFirepit(0,0,tz+.6,.7);
 hnRABarrelStack(-W/2-1.7,zf-2.4,0,3,.36,pine);for(let k=0;k<3;k++)hnBarrel(W/2+1,0,zf-1-k*1.2,.38,.95);
 hnRAHangSign(PW/2-.2,Y0+2.4,zf+PD-.2,0,trim,.8);vnBannerPole(-W/2-1.2,0,zf+2.2,0,6.5,hC(HPAL.red));
 vnFolk(0,tz,6,3.4);vnFolk(2,zf+PD+1.5,2,1.5);}
// B — the Saxon tavern: rendered ground storey on a socle with cellar hatches, a hanging sign and a painted board
// over the door, a jettied half-timbered upper floor, a steep red scale roof with dormers; beside it a beer garden
// under a vine pergola behind a picket fence.
function buildHlRepTavernB(G,o){reseed(20411+(o.v|0));const HX=-4,W=12,D=9,S=.5,H1=3.2,H2=2.9;
 const wall=hC(vPick(HPAL.saxon)),cream=hC(vPick(HPAL.stucco)),beamC=hC(vPick(HPAL.redwood)),roof=hC(vPick([...HPAL.roofRed,...HPAL.roofRed,HPAL.slate[1]])),trim=hC(vPick([HPAL.teal,HPAL.green,HPAL.red,HPAL.blue])),
  ash=hC(vPick(HPAL.ashlar)),pine=hC(vPick(HPAL.pine)),tar=hC(vPick(HPAL.tar));
 vnReg('Saxon tavern',HX,0,8,S+H1+H2+6.8);vnReg('Saxon tavern beer garden',HX+W/2+4.6,.8,4.8,3.2);
 hnSocle(HX,0,0,W,S,D,0);hnStucco(HX,S,0,W,H1,D,0,wall,ash);
 vnDoor(HX,S,D/2,0,1.3,2.3,'vStone',ash,tar,false);vnStairs(HX,0,D/2+.55,0,1.8,S,2,'vStone',ash);
 hnRASignboard(HX,S+2.5,D/2,0,3.2,.5,hC(vPick([HPAL.ochre,HPAL.white,HPAL.teal])),tar);
 for(const u of[-4.2,-2.3,2.3,4.2]){vnWin(HX+u,S+1,D/2,0,.9,1.3,'glass','vStone',ash);hnRAShutters(HX+u,S+1,D/2,0,.9,1.3,trim);}
 for(const z of[-2.5,0,2.5])vnWin(HX-W/2,S+1,z,-Math.PI/2,.8,1.3,'glass','vStone',ash);
 // cellar hatches either side of the door: sloping double leaves between stone cheeks
 for(const u of[-3.25,3.25]){const x=HX+u;kput('vWood',[x,.36,D/2+.5],vQ(0,.62,0),[1.2,.06,1.15],tar);for(const s of[-1,1]){vB('vStone',x+s*.68,0,D/2+.5,.16,.7-.3,1.0,0,ash);kput('vIron',[x+s*.3,.38,D/2+.52],vQ(0,.62,0),[.06,.08,1.05],hC(0x2e2a26));}}
 hnRAHangSign(HX+W/2-.6,S+2.9,D/2,0,trim);
 // jettied half-timber upper floor, the roof, dormers, crest boards
 const y2=S+H1+.12;hnJetty(HX,y2,0,W,D,0,beamC,.35);hnFachBox(HX,y2,0,W+.1,H2,D+.7,0,cream,beamC,'glass');
 const y3=y2+H2,span=D+.7,P=1.35;const top=hnGable(HX,y3,0,W+.1,span,P,0,'hGableSc',roof,.5,'vGablePl',cream);
 for(const u of[-2.6,2.6])hnRADormer(HX,y3,0,0,span,P,1,u,span/2-1,1.2,1.4,cream,roof,trim,'glass');hnRAEyelid(HX,y3,0,0,span,P,1,0,span/2-3,1.2,.55,roof);
 for(const s of[-1,1])hnForm('hFormT',HX+s*(W/2+.1),y3+1,0,s*Math.PI/2,2.2,1.1);
 hnStoneChimney(HX-2.4,top-2.2,-1,2.8,.7);
 // the beer garden: gravel, a vine pergola on posts, tables, a fence with a gate
 const gx=HX+W/2+4.6,gz=.8,GW=7.4,GD=8.4;vnPaving(gx,.02,gz,GW,GD,0,hC(vPick(HPAL.rubble)).multiplyScalar(1.1),22);
 for(const i of[-1,0,1])for(const s of[-1,1])vPst('vPost',gx+i*3.2,0,gz+s*2.6,.1,2.7,pine);
 for(const s of[-1,1])vB('vWood',gx,2.6,gz+s*2.6,7,.16,.16,0,pine);for(let k=0;k<9;k++)vB('vWood',gx-3.4+k*.85,2.76,gz,.08,.1,6,0,pine);
 for(let k=0;k<16;k++)kput('vLeaf',[gx+rr(-3.4,3.4),2.95+rr(0,.2),gz+rr(-2.8,2.8)],null,[rr(.6,1.1),rr(.18,.3),rr(.6,1.1)],hC(vPick([0x3f7a34,0x4f8a3a,0x5a9a40])));
 for(const s of[-1,1])for(const i of[-1,1])for(let k=0;k<2;k++)kput('vLeaf',[gx+i*3.2+rr(-.2,.2),.6+k*.9,gz+s*2.6],null,[.3,.5,.3],hC(0x3f7a34));
 for(const z of[-1.3,1.3])hnRATable(gx,gz+z,0,4.2,pine);vnFence(gx,0,gz,GW,GD,0,pine,1.6,1.05);
 hnRABarrelStack(HX-W/2-1.2,-1,0,2,.36,pine);hnBarrel(HX+W/2+.5,0,D/2-.5,.36,.9);
 vnFolk(gx,gz,4,2.5);vnFolk(HX,D/2+2.6,2,2);}
// C — the traktir: a two-storey log tea-house, gable to the street with lace, a painted signboard across the
// ground floor, a gallery along the side, a kryltso climbing to the upper rooms; a hitching rail with a horse.
function buildHlRepTavernC(G,o){reseed(20421+(o.v|0));const W=10,D=10,S=.45,H1=2.9,H2=3,ZC=-2.5;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.85,1)),roof=hC(vPick([...HPAL.roofGreen,...HPAL.shingle])),trim=hC(vPick([HPAL.white,HPAL.white,HPAL.teal,HPAL.blue])),acc=hC(vPick([HPAL.red,HPAL.teal,HPAL.ochre])),
  dark=hC(vPick(HPAL.redwood)),zf=ZC+D/2,yw=S+H1+H2;
 vnReg('Traktir',0,ZC,8.5,yw+6.6);
 vB('hRubB',0,0,ZC,W+.3,S,D+.3,0,hC(vPick(HPAL.rubble)));hnLogBox(0,S,ZC,W,H1,D,0,log);hnLogBox(0,S+H1,ZC,W,H2,D,0,log);
 vB('vWood',0,S+H1-.1,ZC,W+.3,.2,D+.3,0,dark);                                                           // floor band
 hnGable(0,yw,ZC,D,W,1.2,Math.PI/2,'hGableSc',roof,.8,'hGableLog',log);hnBarge(0,yw,ZC,D,W,6,Math.PI/2,.8,trim,'lace');
 // ground floor: tea-room door, nalichniki, the painted signboard
 vnDoor(-2.6,S,zf,0,1.1,2.05,'hPaint',trim,dark,false);vB('vWood',-2.6,0,zf+.45,1.8,S,.8,0,log);
 for(const u of[-.6,1.4])hnNal(u,S+.95,zf,0,.8,1.1,'glass',trim,{shutters:true,accent:acc});
 hnRASignboard(-1.6,S+2.25,zf,0,5.2,.5,hC(vPick([HPAL.ochre,HPAL.red,HPAL.teal])),dark);
 for(const u of[-3,-1,1])hnNal(u,S+H1+.95,zf,0,.75,1.15,'glass',trim,{keel:true,accent:acc});
 hnNal(0,yw+.9,zf,0,.7,.9,'glass',trim,{keel:true});hnForm('hFormT',0,yw+2.3,zf+.02,0,1.6,.8);
 for(const z of[-3,0,3])hnNal(-W/2,S+.95,ZC+z,-Math.PI/2,.75,1.1,'glass',trim,{});
 // the side gallery on posts along +x, the upper door onto the kryltso landing
 hnRAGallery(W/2,ZC-D/2+.4,W/2,zf,S+H1,1.6,[1,0,0],dark,trim,S+H1+2.3);vB('vWood',W/2+.8,S+H1+2.2,ZC+.2,1.9,.12,D-.4,0,dark);
 vnShedRoof(W/2+.9,S+H1+2.3,ZC+.2,D-.4,1.8,.35,-Math.PI/2,'hGableSc',roof,.2);
 for(const z of[-2.5,.5])vnDoor(W/2,S+H1,ZC+z,Math.PI/2,.9,1.9,'hPaint',trim,dark,false);
 const kx=W/2-1.4;vnDoor(kx,S+H1,zf,0,.95,1.95,'hPaint',trim,dark,false);hnRAKryltso(kx,0,zf,0,1.5,S+H1,dark,'hKeelSc',roof,trim,2.4);
 // chimney, hitching rail, horse, tables, samovar table
 hnStoneChimney(-2,yw+2,ZC-1,3,.7);
 const hz=zf+3.4;FURNISH('hl_rep_hitching_rail',-4.4,0,hz,0);hnRAHorse(-4.6,hz+.1,Math.PI/2*.1+Math.PI,hC(vPick(HRA_HORSE)));
 hlRngSkip(6);FURNISH('hl_rep_samovar_table',-.8,0,zf+2.6,0);   // the table with its samovar (its mugs drew 6 numbers)
 hnWaterButt(-W/2-.6,0,zf-1,.4,1);hnWoodpile(-W/2-.9,0,ZC-2.5,Math.PI/2,3.2,1.5);
 vnFolk(0,zf+3.2,4,2.6);}
// D — the coaching inn: three storeys around a yard. A front range over an arched carriage passage (ashlar and render
// below, jettied half-timber above, a bell cupola on the ridge), two wings with galleries on the yard side, a
// stable and hay-loft range closing the back; a coach and horses in the yard. Rich: electric lamps at the gate.
function buildHlRepInn(G,o){reseed(20431+(o.v|0));const W=26,H1=3.4,H2=3,S=.4,yT=S+H1+2*H2;
 const wall=hC(vPick(HPAL.stucco)),ash=hC(vPick(HPAL.ashlar)),beamC=hC(vPick(HPAL.redwood)),roof=hC(vPick([...HPAL.roofRed,...HPAL.slate,...HPAL.roofRed])),trim=hC(vPick([HPAL.teal,HPAL.red,HPAL.green])),
  log=hC(vPick(HPAL.pine)),tar=hC(vPick(HPAL.tar)),lit=vLit()?'lit':'glass';
 vnReg('Coaching inn — front range',0,8,13,yT+6.5);vnReg('Coaching inn — wings and yard',0,-4,13,yT+3.8);
 // FRONT RANGE (z 4…12): two stone blocks either side of the carriage passage, two timber storeys over all
 const fz=8,fd=8,gw=4.4;for(const s of[-1,1]){const bw=W/2-gw/2;hnStucco(s*(gw/2+bw/2),0,fz,bw,S+H1,fd,0,wall,ash);}
 vB('vDarkB',0,0,fz,gw,S+H1-.1,fd-.2,0);vB('vWood',0,S+H1-.3,fz,gw,.3,fd,0,beamC);vnPaving(0,.03,fz,gw,fd,0,hC(vPick(HPAL.rubble)),10);
 for(const s of[-1,1])kput('hRAArchS',[0,0,fz+s*(fd/2+.12)],null,[gw+1.6,S+H1,.3],ash);
 hnForm('hFormA',0,S+H1-.6,fz+fd/2+.28,0,1.2,.6);
 for(const u of[-10.5,-8,-5.2,5.2,8])vnWin(u,S+1,fz+fd/2,0,.9,1.4,lit,'vStone',ash);
 vnDoor(10.6,S,fz+fd/2,0,1.3,2.4,'vStone',ash,tar,false);vnStairs(10.6,0,fz+fd/2+.5,0,1.9,S,2,'vStone',ash);
 vB('vStone',0,S+H1-.05,fz,W+.2,.22,fd+.2,0,ash);
 const y2=S+H1+.12;hnFachBox(0,y2,fz,W,H2,fd,0,wall,beamC,lit);hnJetty(0,y2+H2,fz,W,fd,0,beamC,.3);hnFachBox(0,y2+H2,fz,W+.1,H2-.12,fd+.6,0,wall,beamC,lit);
 hnRASignboard(0,y2+.25,fz+fd/2+.05,0,5.4,.7,hC(vPick([HPAL.ochre,HPAL.white])),tar);
 hnBracketRow(0,y2-.32,fz+fd/2+.36,0,gw+1.2,2,.42);
 const span=fd+.6,P=1.2;const rt=hnGable(0,yT,fz,W+.1,span,P,0,'hGableSc',roof,.55,'vGablePl',wall);
 for(const u of[-9,-5.2,5.2,9])hnRADormer(0,yT,fz,0,span,P,1,u,span/2-1,1.2,1.3,wall,roof,trim,lit);
 // the clock gable: a big dormer over the gate with the inn's clock in its gable
 {const t=span/2-.7;hnRADormer(0,yT,fz,0,span,P,1,0,t,3.6,1.8,wall,roof,trim,lit);kput('hClock',[0,yT+P*(span/2-t)+1.8+.8,fz+t+.34],null,[1.05,1.05,1]);
  hnForm('hFormA',0,yT+P*(span/2-t)+1.5,fz+t+.02,0,.8,.3);}
 hnRAHangSign(-4.4,S+3.2,fz+fd/2,0,trim);
 for(const s of[-1,1])hnForm('hFormT',s*(W/2+.08),yT+1.1,fz,s*Math.PI/2,2.6,1.3);
 // bell cupola on the ridge
 {const cy=rt-.6;vB('vWood',0,cy,fz,1.8,1.6,1.8,0,beamC);kput('hOctW',[0,cy+1.6,fz],null,[1.05,1.3,1.05],log);for(let k=0;k<8;k++){const a=k/8*TAU;vB('vDarkB',Math.sin(a)*1,cy+1.85,fz+Math.cos(a)*1,.36,.8,.04,a);}
  const t=hnTent(0,cy+2.9,fz,1.35,2.6,'hTentSc',roof);vPst('vIron',0,t-.2,fz,.04,1.1,hC(0x2e2a26));vBall('hGold',0,t+.3,fz,.13,hC(HPAL.gold[0]));}
 hnStoneChimney(-7,rt-2.2,fz-1,2.6,.8);hnStoneChimney(7,rt-2.2,fz-1,2.6,.8);
 // WINGS (x ±7…13, z −12…4) with galleries on the yard side
 const wz=-4,wd=16,wx=10,ww=6;
 for(const s of[-1,1]){const x=s*wx;hnStucco(x,0,wz,ww,S+H1,wd,0,wall,false);hnFachBox(x,S+H1,wz,ww,2*H2,wd,0,wall,beamC,lit);
  hnGable(x,yT,wz+1.5,wd+3,ww,P,Math.PI/2,'hGableSc',roof,.55,'vGablePl',wall);
  for(const z of[-10,-6,-2,2])vnWin(x+s*ww/2,S+1,z,s*Math.PI/2,.9,1.3,lit,'vStone',ash);
  for(const f of[0,1])hnRAGallery(s*7,-6,s*7,4,S+H1+f*H2,1.5,[-s,0,0],log,trim,f?null:yT-.8);
  for(const z of[-4.5,-.5,3])for(const f of[0,1])vnDoor(s*7,S+H1+f*H2,z,-s*Math.PI/2,.9,1.95,'hPaint',trim,tar,false);
  for(const z of[-4.5,.5])vnDoor(s*7,S,z,-s*Math.PI/2,1,2.1,'vStone',ash,tar,false);}
 for(let k=0;k<5;k++)for(const s of[-1,1])vPst('vPostB',s*5.62,0,-6+k*2.5,.11,S+H1+H2-.2,log);
 for(const f of[0,1])hnRAGallery(-5.5,4,5.5,4,S+H1+f*H2,1.5,[0,0,-1],log,trim,null);
 {const sx=-5.1;vnStairs(sx,0,-3.4,Math.PI,1.1,S+H1,18,'vWood',log);}
 // STABLE range across the back with the hay loft: stall doors, a hoist, hay
 const sz=-9,sd=6;hnStucco(0,0,sz,14,S+H1,sd,0,hC(vPick(HPAL.rubble)),ash);hnLogBox(0,S+H1,sz,14,2.4,sd,0,log,0);
 hnGable(0,S+H1+2.4,sz,14.6,sd,1.1,0,'vShingleB',hC(vPick(HPAL.shingle)),.5,'hGableLog',log);
 for(let i=0;i<5;i++){const x=-5.6+i*2.8;vB('vDarkB',x,0,sz+sd/2,1.4,2.3,.1,0);vB('vWood',x,0,sz+sd/2+.04,1.3,1.2,.1,0,tar);}
 vnDoor(0,S+H1,sz+sd/2,0,1.4,1.8,'vWood',log,tar,false);vB('vWood',0,S+H1+2.2,sz+sd/2+.8,.2,.2,1.8,0,log);vPst('vRope',0,S+H1-1.2,sz+sd/2+1.6,.02,3.4,hC(0xa89878));
 kput('vThatchB',[0,S+H1+.4,sz+sd/2+.05],null,[1.3,.5,.3],hC(vPick(VPAL.thatch)));
 // the yard: paving, a coach, horses at a trough, a well, lamps
 vnPaving(0,.02,-1,13,9.5,0,hC(vPick(HPAL.rubble)),30);hnRAWagon(-1.8,-.8,Math.PI*.1,log,'barrels');
 hnRATrough(2.6,-5,0,2.4);for(const x of[1.8,3.5])hnRAHorse(x,-3.8,Math.PI,hC(vPick(HRA_HORSE)));hnRAHorse(-1.6,2.4,Math.PI*.95,hC(vPick(HRA_HORSE)));
 if(vLit()){hnWallLamp(-3.2,S+2.8,fz+fd/2,0);hnWallLamp(3.2,S+2.8,fz+fd/2,0);hnLampPost(3.5,0,1.5,3);hnLampPost(-3.5,0,-4.5,3);}
 for(const s of[-1,1])FURNISH('hl_rep_door_bench',s*4.6,0,fz+fd/2+.6,0,{v:1});
 vnFolk(0,fz+fd/2+2.5,4,4);vnFolk(0,-1,3,4);}

// ---------------------------------------------------------------- SHOPS AND WORKSHOPS
// shop row: three narrow gabled fronts — Russian log, Saxon half-timber, painted log — each with a shutter counter
// (lower leaf dropped as a counter, upper propped as a hood), a signboard, goods, living quarters above.
function buildHlRepShops(G,o){reseed(20441+(o.v|0));const U=4.8,N=3,W=U*N,D=9,H1=3.2;
 const ash=hC(vPick(HPAL.ashlar));vnReg('Shop row (three fronts)',0,0,8.6,H1+3+5.5);
 vnPaving(0,.02,D/2+1.4,W+1,2.6,0,hC(vPick(HPAL.rubble)),14);
 for(let i=0;i<N;i++){const x=-W/2+U*(i+.5),kind=(i+(o.v|0))%3,H2=rr(2.8,3.1),P=rr(1.3,1.6),y2=H1;
  const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.85,1.05)),trim=hC(vPick([HPAL.white,HPAL.teal,HPAL.red,HPAL.blue,HPAL.ochre])),wall=hC(vPick(HPAL.saxon)),beamC=hC(vPick(HPAL.redwood)),
   roof=kind===0?hC(vPick(HPAL.shingle)):hC(vPick(kind===1?HPAL.roofRed:HPAL.roofGreen)),wood=kind===2?log:hC(vPick(HPAL.tar));
  // ground: stone/render shop storey (log for the painted log house)
  if(kind===2)hnLogBox(x,0,0,U-.02,H1,D,0,log,0);else hnStucco(x,0,0,U-.02,H1,D,0,wall,ash);
  // the shop front: opening, counter leaf on brackets, hood leaf propped, goods, awning or not
  const ox=x-.45,ow=2.7;vB('vDarkB',ox,.9,D/2-.04,ow,1.7,.12,0);for(const s of[-1,1])vB('hPaint',ox+s*(ow/2+.06),.85,D/2+.02,.12,1.85,.1,0,trim);
  vB('vWood',ox,.84,D/2+.32,ow,.08,.62,0,wood);for(const s of[-1,1])hnMember('vWood',[ox+s*(ow/2-.2),.35,D/2+.04],[ox+s*(ow/2-.2),.8,D/2+.55],.08,.08,[1,0,0],wood);
  kput('vWood',[ox,2.95,D/2+.42],vQ(0,-1.0,0),[ow,.06,1.0],wood);for(const s of[-1,1])beam('vIron',[ox+s*(ow/2-.1),2.6,D/2+.04],[ox+s*(ow/2-.1),2.72,D/2+.8],.03,.03,hC(0x2e2a26));
  for(let k=0;k<4;k++){const gx=ox-ow/2+.35+k*(ow-.7)/3;const r=rng();
   if(r<.3)vnCrate(gx,.88,D/2+.32,.36,rr(-.3,.3));else if(r<.55)vPst('vClayPot',gx,.88,D/2+.32,.13,.34,hC(vPick([0x9a5a38,0xb87a4a,0x7a4a30])));
   else if(r<.8)kput('vClothB',[gx,.98,D/2+.32],qEuler(0,rr(-.3,.3),0),[.5,.18,.4],hC(vPick(VPAL.awning.concat([HPAL.teal,HPAL.red]))));else kput('vSack',[gx,1.04,D/2+.32],null,[.2,.17,.2],hC(0xb8a080));}
  vnDoor(x+1.6,0,D/2,0,.9,2.1,'hPaint',trim,wood,true);
  hnRASignboard(x-.2,2.42,D/2+.02,0,U-1.2,.42,hC(vPick([HPAL.ochre,HPAL.white,HPAL.teal,HPAL.red])),wood);
  if(i===1)vnAwning(ox,2.35,D/2+.1,0,ow+.4,1.3,hC(vPick([HPAL.red,HPAL.teal,HPAL.ochre])));
  // upper storey: log with nalichniki | half-timber | painted log with keel nalichniki
  if(kind===1){hnJetty(x,y2+.12,0,U-.02,D,0,beamC,.3);hnFachBox(x,y2+.12,0,U-.02,H2,D+.6,0,hC(vPick(HPAL.stucco)),beamC,'glass');}
  else{hnLogBox(x,y2,0,U-.02,H2,D,0,log,0);for(const u of[-1,1])hnNal(x+u*1,y2+.9,D/2,0,.7,1.1,'glass',trim,{keel:kind===2,shutters:kind===0});}
  const yr=y2+H2+(kind===1?.12:0),dz=kind===1?D+.6:D;hnGable(x,yr,0,dz,U-.02,P,Math.PI/2,kind===0?'vShingleB':'hGableSc',roof,.35,kind===1?'vGablePl':'hGableLog',kind===1?hC(vPick(HPAL.stucco)):log);
  if(kind!==1)hnBarge(x,yr,0,dz,U-.02,P*(U-.02)/2,Math.PI/2,.35,trim,'lace');else hnForm('hFormT',x,yr+.6,dz/2+.02,0,1.6,.8);
  vnWin(x,yr+.5,dz/2+.02,0,.6,.8,'shut','vWood',wood);vB('vWood',x,yr+P*(U/2)-1.1,dz/2+.5,.16,.16,1.1,0,wood);   // loft door and hoist beam
  vnWin(x,1.1,-D/2,Math.PI,.8,1,'shut','vWood',wood);}
 for(const s of[-1,1])vB('vStone',s*(W/2+.05),0,D/2-.05,.2,H1,.3,0,ash);
 hnBarrel(-W/2-.7,0,D/2-1,.36,.9);hnSacks(W/2+1,0,D/2-1.3,3);vnFolk(0,D/2+2.8,5,4);}
// market hall: an open arcade of stone round arches on all four sides, the council's hall above in half-timber, a
// steep scale roof with painted dougong along the front and a tent-roofed bell turret; stalls under the arches.
function buildHlRepMarketHall(G,o){reseed(20451+(o.v|0));const W=18,D=11,H1=4.2,H2=3.4;
 const ash=hC(vPick(HPAL.ashlar)),cream=hC(vPick(HPAL.stucco)),beamC=hC(vPick(HPAL.redwood)),roof=hC(vPick([...HPAL.roofGreen,...HPAL.roofRed])),trim=hC(vPick([HPAL.teal,HPAL.red])),
  log=hC(vPick(HPAL.pine)),lit=vLit()?'lit':'glass';
 vnReg('Market hall',0,0,11,H1+H2+11);
 vnPaving(0,.02,0,W+3,D+3,0,hC(vPick(HPAL.rubble)),50);vB('vStone',0,-.1,0,W+.6,.24,D+.6,0,ash);
 const nb=5,bw=W/nb;for(let i=0;i<nb;i++)for(const s of[-1,1])kput('hRAArchS',[-W/2+bw*(i+.5),0,s*(D/2-.3)],null,[bw,H1,.6],ash);
 const ns=3,sw=(D-1.2)/ns;for(let j=0;j<ns;j++)for(const s of[-1,1])kput('hRAArchS',[s*(W/2-.3),0,-D/2+.6+sw*(j+.5)],qEuler(0,Math.PI/2,0),[sw,H1,.6],ash);
 for(let i=1;i<nb;i++)vPst('vPostS',-W/2+bw*i,0,0,.3,H1,ash);vB('vWood',0,H1-.35,0,W-1,.35,D-1,0,beamC);
 for(let i=1;i<nb;i++)vB('vWood',-W/2+bw*i,H1-.65,0,.3,.3,D-1.2,0,beamC);
 // upper hall: half-timber jettied out over the arcades on painted dougong set over the piers, a formline frieze
 const J=.6,DU=D+2*J;vB('vWood',0,H1,0,W+.3,.2,DU+.2,0,beamC);hnFachBox(0,H1+.2,0,W,H2,DU,0,cream,beamC,lit);hnFrieze(0,H1+.22,DU/2+.02,0,W-.4,.46);
 for(const s of[-1,1]){for(let i=0;i<=nb;i++){const u=clamp(-W/2+bw*i,-W/2+.35,W/2-.35);const p=loc(0,s*D/2,u,0,s>0?0:Math.PI);hnDougong(p[0],H1-.58,p[1],s>0?0:Math.PI,.55);}
  vB('hPaint',0,H1-.76,s*(D/2+.1),W-.2,.18,.2,0,hC(HPAL.teal));}
 const y3=H1+.2+H2,P=1.2;
 const top=hnGable(0,y3,0,W+.2,DU+.2,P,0,'hGableSc',roof,.7,'vGablePl',cream);for(const s of[-1,1])hnForm('hFormT',s*(W/2+.12),y3+1,0,s*Math.PI/2,2.6,1.3);
 // the bell turret on the ridge: a timber belfry, an octagonal tent, a gold spike
 {const by=top-.9;vB('vWood',0,by,0,2.2,1.4,2.2,0,beamC);for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*.9,by+1.4,sz*.9,.1,1.8,log);
  vB('vWood',0,by+1.4,0,2.3,.14,2.3,0,log);vB('vWood',0,by+3.1,0,2.4,.2,2.4,0,beamC);kput('vConeC',[0,by+2.05,0],null,[.45,.8,.45],hC(0xb88a4a));kput('hLaceB',[0,by+1.95,1.1],null,[1.8,.7,1],trim);
  const t=hnTent(0,by+3.3,0,1.75,4.2,'hTentSc',roof);vPst('vIron',0,t-.3,0,.05,1.4,hC(0x2e2a26));vBall('hGold',0,t+.35,0,.17,hC(HPAL.gold[0]));}
 // external stair to the hall at the −x end, its landing and door
 vnStairs(-W/2-1,0,1.2,0,1.3,H1+.2,22,'vStone',ash);vB('vStone',-W/2-1,0,-4.4,1.6,H1+.2,1.6,0,ash);vnDoor(-W/2,H1+.2,-4.4,-Math.PI/2,1.1,2.1,'hPaint',trim,beamC,false);
 for(let k=0;k<3;k++)vB('vIron',-W/2-1.75,H1+.2,-4.8+k*.4,.05,1,.05,0,hC(0x2e2a26));
 // stalls under the arches: counters and goods, a weighing beam
 for(let i=0;i<nb;i++){FURNISH('hl_rep_market_counter',-W/2+bw*(i+.5),0,D/2-1.4,0,{v:0});   // its three goods drew 2 or 3 numbers each
  for(let k=0;k<3;k++){const r=rng();hlRngSkip(r<.35?2:1);}}
 FURNISH('hl_rep_weighing_beam',3,0,-1.5,0);
 hnSacks(-5,0,-2,5);hnSacks(5.5,0,-2.5,4);hnCrate(-2,0,-3,.8,.2);
 if(vLit())for(const sx of[-1,1])for(const sz of[-1,1])hnLampPost(sx*(W/2+1.2),0,sz*(D/2+1.2),3.4);
 vnFolk(0,0,8,6);vnFolk(0,D/2+2.4,4,5);}
// A — carpenter and wheelwright: a log shop, its back half closed, its front open on posts under one shingle
// roof; benches, a wheel on the stand, finished wheels, a wagon awaiting a wheel; timber stacks and a sawpit.
function buildHlRepWorkshopA(G,o){reseed(20461+(o.v|0));const W=12,D=8,H=3.3,Y0=.25;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.8,.95)),aged=hC(vPick(HPAL.aged)),sh=hC(vPick(HPAL.shingle)),trim=hC(vPick([HPAL.red,HPAL.teal,HPAL.ochre]));
 vnReg("Wheelwright's workshop",0,0,9,Y0+H+4.6);
 vB('hRubB',0,0,0,W+.3,Y0,D+.3,0,hC(vPick(HPAL.rubble)));hnLogBox(0,Y0,-D/4,W,H,D/2,0,log);
 for(const u of[-W/2+.15,-W/4,0,W/4,W/2-.15])vPst('vPostB',u,Y0,D/2-.15,.15,H,log);vB('vWood',0,Y0+H-.24,D/2-.15,W+.2,.26,.28,0,log);
 for(const s of[-1,1])vB('vWood',s*(W/2-.15),Y0+H-.24,D/4,.26,.26,D/2,0,log);
 hnGable(0,Y0+H,0,W,D,.95,0,'vShingleB',sh,.7,'vGableW',log);hnBarge(0,Y0+H,0,W,D,.95*D/2,0,.7,trim,'lace');
 hnRARoofPatch('vCorr',0,Y0+H,0,0,D,.95,1,rr(-3,3),1.8,2.4,1.8);
 vnDoor(-2,Y0,0,0,1,2.1,'vWood',log,aged,false);vnWin(2.5,Y0+1.1,0,0,1,.9,'shut','vWood',log);
 // benches, tools on the wall, a wheel on its stand, finished wheels leaning on the posts
 FURNISH('hl_rep_workbench',-3.6,Y0,1.1,0,{v:0});FURNISH('hl_rep_tool_rail',-3.7,Y0,.1,0);
 FURNISH('hl_rep_wheel_stand',1.2,Y0,1.6,0);
 for(let k=0;k<3;k++){const x=W/2-1-k*.3;kput('vHoop',[x,.72,D/2-.7],qEuler(0,Math.PI/2,.12),[.6,.6,2],hC(0x3a3028));}
 FURNISH('hl_rep_cartwheels',-W/2+1.4,Y0,2.6,.2,{v:0});
 // outside: a wagon waiting for its wheel, timber stacks under a lean-to, a sawpit with a log on trestles
 hnRAWagon(3.2,D/2+2.8,Math.PI/2,log,'wheel');
 {const tx=-W/2-2;hlRngSkip(20);FURNISH('hl_rep_timber_stack',tx,0,-1.48,Math.PI/2,{v:0});   // the logs (their shades drew 20 numbers)
  for(const z of[-3.4,3.4])vPst('vPost',tx+1.1,0,z,.08,2.4,aged);vnShedRoof(tx+.2,2.2,0,D-1,2.4,.4,-Math.PI/2,'vShingleB',sh,.2);
  hlRngSkip(16);FURNISH('hl_rep_timber_stack',tx-1.2,0,2.4,Math.PI/2,{v:1});}   // the sawn planks beside them (16 numbers)
 hnFurn('hl_rep_sawpit',-2.2,0,D/2+3,0,{},.8,0);   // the sawpit, a log on its trestles, the sawdust
 hnRAHangSign(W/2-.15,Y0+2.6,D/2-.15,0,trim,.8);vnFolk(-1,D/2+1.6,3,2);}
// B — brewery and cooperage: a stone brewhouse with a log loft, a malt kiln tower whose steep roof ends in a
// vented cowl, a copper under an open shed, and the cooper's yard of barrels, staves and hoops.
function buildHlRepWorkshopB(G,o){reseed(20471+(o.v|0));const W=12,D=9,H1=3.6,H2=2.6;
 const log=hC(vPick(HPAL.pine)),rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),sh=hC(vPick(HPAL.shingle)),trim=hC(vPick([HPAL.red,HPAL.teal,HPAL.ochre])),tar=hC(vPick(HPAL.tar)),cu=hC(0xc07a48);
 vnReg('Brewery and cooperage',-1,0,10,15);
 vB('hRubB',-2,0,0,W,H1,D,0,rub);for(const sx of[-1,1])for(let k=0;k<6;k++)vB('vStone',-2+sx*(W/2-.26+.03),k*.6,D/2+.03-.3,.62,.56,.66,0,ash);
 hnLogBox(-2,H1,0,W,H2,D,0,log);hnGable(-2,H1+H2,0,W,D,1.1,0,'vShingleB',sh,.6,'hGableLog',log);hnBarge(-2,H1+H2,0,W,D,1.1*D/2,0,.6,trim,'lace');
 vnDoor(-3.2,0,D/2,0,2.2,2.8,'vStone',ash,tar,false);for(const u of[-6.4,0])vnWin(u,1.2,D/2,0,.9,1.1,'shut','vStone',ash);
 for(const u of[-5.5,-1,2])hnNal(u,H1+.7,D/2,0,.7,1,'glass',trim,{});hnRASignboard(-3.2,2.95,D/2+.02,0,3,.48,hC(vPick([HPAL.ochre,HPAL.teal])),tar);
 {const rv=H1+H2+1.1*D/2;vB('vWood',-2,rv-.4,0,3,1,1.2,0,log);for(const s of[-1,1])vB('vDarkB',-2,rv-.1,s*.61,2.6,.45,.02,0);vnGableRoof(-2,rv+.55,0,3.4,1.8,.7,0,'vShingleB',sh,.2);}
 // the malt kiln: a square stone tower, a steep pyramid roof, the vented cowl on top
 {const kx=W/2+.6,kz=-.8,kw=4.4,kh=7;hnStucco(kx,0,kz,kw,kh,kw,0,hC(vPick(HPAL.stucco)),ash);
  vnDoor(kx,0,kz+kw/2,0,1,2,'vStone',ash,tar,false);vB('vDarkB',kx,.3,kz+kw/2+.01,.7,.5,.04,0);vBall('vEmber',kx,.45,kz+kw/2+.04,.14);
  for(const y of[3.4,5.2])vnWin(kx+kw/2,y,kz,Math.PI/2,.6,.7,'shut','vStone',ash);
  vnPyrRoof('hPyrSc',kx,kh,kz,kw,kw,4.8,0,hC(vPick(HPAL.roofRed)),.35);
  const cy=kh+4.2;vB('vWood',kx,cy,kz,1,1.2,1,0,log);for(let k=0;k<4;k++){const a=k*Math.PI/2;for(let j=0;j<3;j++){const p=loc(kx,kz,0,.52,a);vB('vWood',p[0],cy+.2+j*.34,p[1],.9,.08,.12,a,tar);}}
  vnPyrRoof('vPyrSh',kx,cy+1.2,kz,1.1,1.1,.9,0,sh,.25);vPst('vIron',kx,cy+2,kz,.03,.9,hC(0x2e2a26));kput('vIron',[kx+.25,cy+2.7,kz],null,[.6,.2,.02],hC(0x2e2a26));}
 // the copper under an open shed at −x
 {const cx=-W/2-3.2;for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',cx+sx*1.5,0,sz*1.6,.1,3,log);vnShedRoof(cx,3,0,3.4,3.6,.5,-Math.PI/2,'vShingleB',sh,.3);
  FURNISH('hl_rep_brew_copper',cx,0,0,0);vPst('vPipeC',cx,3.5,0,.12,.7,cu);}   // the copper; its flue on up through the shed roof
 // cooper's yard: barrels lying and standing, staves, hoops, a barrel being raised round a fire basket
 hnRABarrelStack(-4,D/2+3,0,3,.4,log);for(let k=0;k<4;k++)hnBarrel(1.4+k*.9,0,D/2+1.6+(k%2)*.8,.38,.95);
 FURNISH('hl_rep_cooper_fire',3.6,0,D/2+4.4,0);
 for(let k=0;k<6;k++)kput('vWood',[-.6+rr(-.2,.2),.08+k*.06,D/2+3.6],qEuler(0,rr(-.1,.1),0),[1.3,.05,.6],log);
 for(let k=0;k<4;k++)kput('vHoop',[W/2-1.4+k*.08,.5,D/2+.3],qEuler(0,0,.1),[.46,.46,1.4],hC(0x2e2a26));
 hnRAWagon(-10.4,D/2+3.5,Math.PI*.55,log,'barrels');vnFolk(-1,D/2+3,4,3);}

// ---------------------------------------------------------------- SMITHIES
// small scrap smithy: an open forge shed on log posts under a shingle roof half-mended in corrugated sheet; a stone
// hearth and an iron stack, anvil on a stump, quench trough, a grindstone, and a heap of salvaged Ancient scrap.
function buildHlRepSmithySmall(G,o){reseed(20481+(o.v|0));const W=6.4,D=5.2,H=2.9;
 const aged=hC(vPick(HPAL.aged)),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.85);
 vnReg('Scrap smithy (small)',0,0,6.5,H+5.5);
 vnPaving(0,.02,0,W+1,D+1,0,hC(0x6a625a),10);
 for(const sx of[-1,0,1])for(const sz of[-1,1])vPst('vPostB',sx*(W/2-.2),0,sz*(D/2-.2),.14,H,aged);
 for(const s of[-1,1])vB('vWood',0,H-.2,s*(D/2-.2),W+.2,.22,.22,0,aged);for(const s of[-1,1])vB('vWood',s*(W/2-.2),H-.2,0,.22,.22,D,0,aged);
 hnGable(0,H,0,W,D,.8,0,'vShingleB',sh,.6,'vGableW',aged);
 hnRARoofPatch('vCorr',0,H,0,0,D,.8,1,-1.2,1.3,2.8,1.9);hnRARoofPatch('vRustB',0,H,0,0,D,.8,-1,1.4,1.4,2.2,1.7);hnRARoofPatch('vCorr',0,H,0,0,D,.8,-1,-1.6,1.1,1.8,1.5);
 // back wall: low rubble with salvage plates above, patched
 vB('hRubB',0,0,-D/2+.15,W-.4,1.1,.4,0);kput('vRustB',[0,1.1+(H-1.3)/2,-D/2+.15],null,[W-.4,H-1.3,.1],null);vnPatch(0,1.1,-D/2+.2,0,W-.6,H-1.2,3);
 hnRAHearth(-1.5,-D/2+1,0,H+2.6,1.6);hnRAAnvil(.6,.1,.3);hnRATrough(1.9,-1.4,0,1.4);
 FURNISH('hl_rep_workbench',2.2,0,1.2,0,{v:1});FURNISH('hl_rep_grindstone',-W/2-.8,0,1.4,0);
 hnRAScrap(W/2+2.4,-.2,3.6,4.6,46);for(let k=0;k<4;k++)kput('vPanelB',[-W/2-.4,.7,-1.6+k*.18],qEuler(0,Math.PI/2,-.2),[1.8,1.3,.06],null);
 vnFolk(.9,1.2,1,.3);vnFolk(0,D/2+2,2,1.5);}
// large scrap smithy: a stone-and-log forge hall open to the yard, two hearths with tall iron stacks, a bellows
// house with its rocker beam, a raised ridge vent, a jib crane over the yard, a sheet-fenced scrap yard.
function buildHlRepSmithyLarge(G,o){reseed(20491+(o.v|0));const W=16,D=10,H=4.4,HX=-3;
 const log=hC(vPick(HPAL.aged)).multiplyScalar(1.05),sh=hC(vPick(HPAL.shingle)),rub=hC(vPick(HPAL.rubble)),I=hC(0x2e2a26);
 vnReg('Scrap smithy (large)',HX,0,10.5,H+10.5);vnReg('Scrap smithy yard',HX+W/2+4.5,0,5,2.4);
 vnPaving(HX,.02,1,W+2,D+4,0,hC(0x6a625a),30);
 // walls: rubble to 1.4 m, logs above on the back and ends; front on posts, open
 vB('hRubB',HX,0,-D/2+.25,W,1.4,.5,0,rub);for(const s of[-1,1])vB('hRubB',HX+s*(W/2-.25),0,0,.5,1.4,D,0,rub);
 vB('hLogB',HX,1.4,-D/2+.25,W,H-1.4,.45,0,log);for(const s of[-1,1])vB('hLogB',HX+s*(W/2-.25),1.4,0,.45,H-1.4,D,0,log);
 for(let i=0;i<=4;i++)vPst('vPostB',HX-W/2+.25+(W-.5)*i/4,0,D/2-.2,.2,H,log);vB('vWood',HX,H-.3,D/2-.2,W+.2,.3,.3,0,log);
 for(let i=1;i<4;i++)vB('vWood',HX-W/2+W*i/4,H-.3,0,.24,.24,D,0,log);
 const P=.85,top=hnGable(HX,H,0,W,D,P,0,'vShingleB',sh,.8,'vGableW',log);
 for(const [s,u,t] of[[1,-5,1.6],[1,2,2.4],[1,5.5,1.4],[-1,-3,1.8],[-1,4,2]])hnRARoofPatch(vPick(['vCorr','vCorr','vRustB']),HX,H,0,0,D,P,s,u,t,rr(2.2,3.4),rr(1.6,2.4));
 vB('vWood',HX,top-.3,0,6,.9,1.4,0,log);for(const s of[-1,1])vB('vDarkB',HX,top+.05,s*.71,5.6,.4,.02,0);vnGableRoof(HX,top+.6,0,6.4,2.2,.7,0,'vCorr',null,.25);
 // the forge hall is a room (kits/interiors/sets/highlands.js): the interiors place its forges, anvils, troughs and
 // racks. Its two tall iron stacks stay, rising from the roof as they did (the hearths, troughs and racks drew 16+1
 // numbers each hearth and 14 for the bar stock)
 for(const u of[-3.6,2.8]){hlRngSkip(16);vnChimney(HX+u,5.3,-D/2+1.2,H+5.5-2.5,.3,true);rng();}
 hlRngSkip(14);
 // bellows house at −x: a log shed, the great bellows seen through its open side, the rocker beam through the wall
 {const bx=HX-W/2-2.2;hnLogBox(bx,0,-1.5,3.6,3,4.4,0,log,.2);vnShedRoof(bx,3,-1.5,4,4.8,.7,-Math.PI/2,'vCorr',null,.3);
  vB('vDarkB',bx,.4,-1.5+2.21,2.4,2.2,.04,0);kput('vTarpB',[bx,1.2,.9],qEuler(-.25,0,0),[1.8,.35,1.3],hC(0x6a4a30));vB('vWood',bx,.8,.9,1.9,.12,1.4,0,log);
  beam('vWood',[bx+1.8,2.6,-1.2],[bx-.6,2.2,.6],.14,.14,log);vPst('vRope',bx-.6,1.2,.6,.03,1,hC(0xa89878));kput('vStone',[bx-.6,1.05,.6],null,[.4,.3,.4],rub);}
 // jib crane over the yard, hoisting a salvaged panel
 hnRACrane(HX+4,D/2+2.2,Math.PI/2,5.2,3.4,log,true);kput('vPanelB',[HX+4,1.9,D/2+2.2+3.4],null,[1.4,.06,1],null);
 FURNISH('hl_rep_cartwheels',HX-1.85,0,D/2+1.6,.2,{v:0});   // wheels in the yard
 // the scrap yard: posts and corrugated sheet, heaps inside, a stack of white Ancient panels
 {const yx=HX+W/2+4.6,yw=8,yd=10;const pts=[[yx-yw/2,-yd/2],[yx+yw/2,-yd/2],[yx+yw/2,yd/2],[yx+1.2,yd/2]];
  for(let i=0;i+1<pts.length;i++){const [x0,z0]=pts[i],[x1,z1]=pts[i+1];const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(z1-z0,x1-x0),n=Math.max(1,Math.round(L/2));
   for(let k=0;k<=n;k++)vPst('vPipeR',lerp(x0,x1,k/n),0,lerp(z0,z1,k/n),.07,2.1,null);
   for(let k=0;k<n;k++){const t=(k+.5)/n;kput(vPick(['vSheet','vSheet','vPlate','vPlateW']),[lerp(x0,x1,t),1.02,lerp(z0,z1,t)],qEuler(0,-ry,rr(-.05,.05)),[L/n+.1,1.9,1],null);}}
  hnRAScrap(yx-.6,-1.8,5,4.2,60);hnRAScrap(yx+1.2,2.6,3.6,3.2,34);hlRngSkip(5);FURNISH('hl_rep_plate_stack',yx+yw/2-1.3,0,-3.6,Math.PI,{v:1});}   // the stack of white Ancient panels
 vnFolk(HX,1,3,4);vnFolk(HX+5,D/2+3,2,1.5);}

// ---------------------------------------------------------------- STABLES AND WAREHOUSES
// stables / caravanserai: a walled court entered under a gate tower with a tent roof; stall ranges under lean-to
// roofs round three sides, a two-storey stable and hay loft at the back, a wagon yard, a stone trough.
function buildHlRepStables(G,o){reseed(20501+(o.v|0));const W=30,D=24,WH=3.2,T=.6;
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.85,1)),aged=hC(vPick(HPAL.aged)),sh=hC(vPick(HPAL.shingle)),roofT=hC(vPick([...HPAL.roofGreen,...HPAL.shingle])),trim=hC(vPick([HPAL.red,HPAL.teal]));
 vnReg('Caravanserai — gate tower',0,D/2,4,15);vnReg('Caravanserai — court',0,-1,15,6.5);
 // the court walls with a shingle coping; a gap for the gate tower
 const G2=2.8;const wall=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0)+Math.PI/2,mx=(x0+x1)/2,mz=(z0+z1)/2;vB('hRubB',mx,0,mz,L,WH,T,ry,rub);vnGableRoof(mx,WH,mz,L+.2,T+.2,.3,ry,'vShingleB',sh,.15);};
 wall(-W/2,-D/2,-W/2,D/2);wall(W/2,-D/2,W/2,D/2);wall(-W/2,D/2,-G2,D/2);wall(G2,D/2,W/2,D/2);
 // gate tower: rubble base with the arched passage, a log chamber, a flared skirt and the tent
 {const tz=D/2,tw=5.6,th=5.6;for(const s of[-1,1])vB('hRubB',s*(tw/2-.7),0,tz,1.4,th,tw,0,rub);vB('hRubB',0,th-1.2,tz,tw-2.8,1.2,tw,0,rub);
  for(const s of[-1,1])kput('hRAArchS',[0,0,tz+s*(tw/2+.1)],null,[tw,th-.4,.2],ash);vB('vWood',0,th-1.3,tz,2.8,.12,tw,0,log);
  hnForm('hFormA',0,th-1.18,tz+tw/2+.18,0,1.5,.75);
  hnLogBox(0,th,tz,tw+.4,3,tw+.4,0,log,.3);for(let k=0;k<4;k++){const a=k*Math.PI/2,p=loc(0,tz,0,tw/2+.2,a);hnNal(p[0],th+.9,p[1],a,.7,1,'glass',trim,{});}
  hnBracketRow(0,th+2.55,tz+tw/2+.3,0,tw,3,.42);
  vnHipRoof('hHipSh',0,th+3.2,tz,tw+.4,tw+.4,1,0,roofT,.9);const t=hnTent(0,th+3.9,tz,2.9,6,'hTentSc',roofT);vPst('vIron',0,t-.3,tz,.05,1.5,hC(0x2e2a26));vBall('hGold',0,t+.4,tz,.16,hC(HPAL.gold[0]));
  for(const s of[-1,1])vB('vWood',s*1.05,0,tz+tw/2+.2,1.3,3.9,.12,0,hC(vPick(HPAL.tar)));}
 // stall ranges on the two sides: lean-to roofs from the wall top toward the court, partitions, mangers, horses
 for(const s of[-1,1]){const x0=s*(W/2-T/2),xin=s*(W/2-4.2),z0=-D/2+6,z1=D/2-1;const L=z1-z0,zc=(z0+z1)/2;
  vnShedRoof((x0+xin)/2,2.4,zc,L,Math.abs(x0-xin)+.2,.8,s*Math.PI/2,'vShingleB',sh,.35);
  const n=Math.round(L/2.6);for(let i=0;i<=n;i++){const z=z0+L*i/n;vPst('vPost',xin,0,z,.1,2.45,log);}
  vB('vWood',xin,2.3,zc,.2,.2,L,0,log);for(let i=0;i<n;i++){const z=z0+L*(i+.5)/n;FURNISH('hl_rep_horse_stall',(x0+xin)/2,0,z,-s*Math.PI/2);   // partitions and manger, open to the court
   if(rng()<.55)hnRAHorse(xin+s*1.6,z,s>0?-Math.PI/2:Math.PI/2,hC(vPick(HRA_HORSE)));}}
 // the stable and hay-loft range across the back
 {const bz=-D/2+3,bd=6-T,bw=W-T*2;vB('hRubB',0,0,bz,bw,2.8,bd,0,rub);hnLogBox(0,2.8,bz,bw,2.6,bd,0,log,0);
  hnGable(0,5.4,bz,bw+.2,bd,1.1,0,'vShingleB',sh,.5,'hGableLog',log);
  for(let i=0;i<6;i++){const x=-11+i*4.4;vB('vDarkB',x,0,bz+bd/2,1.5,2.3,.1,0);vB('vWood',x,0,bz+bd/2+.05,1.4,1.15,.08,0,hC(vPick(HPAL.tar)));}
  for(const x of[-7,7]){vnDoor(x,2.9,bz+bd/2,0,1.5,1.9,'vWood',log,hC(vPick(HPAL.tar)),false);kput('vThatchB',[x,3.3,bz+bd/2+.08],null,[1.2,.7,.25],hC(vPick(VPAL.thatch)));vB('vWood',x,5.3,bz+bd/2+.7,.2,.2,1.5,0,log);vPst('vRope',x,3.4,bz+bd/2+1.3,.02,1.9,hC(0xa89878));}
  vnLadder(0,0,bz+bd/2+.5,0,2.9,log);}
 // the wagon yard, the trough and a haystack
 vnPaving(0,.02,1,W-10,D-8,0,hC(vPick(HPAL.rubble)),40);
 hnRAWagon(-5.2,1.2,Math.PI*.08,log,'hay');hnRAWagon(-1.4,-.6,-Math.PI*.06,log,'sacks');hnRAWagon(4.2,.8,Math.PI*1.1,log,'barrels');
 hnRATrough(3,6.6,0,3,ash);for(const x of[2,4])hnRAHorse(x,7.6,Math.PI,hC(vPick(HRA_HORSE)));
 hlRngSkip(2);FURNISH('hl_rep_haystack',8.4,0,-4.2,.3,{v:1});   // the hay rick (its hay drew 2 colours)
 hnWaterButt(-W/2+5.2,0,D/2-2,.45,1.1);vnFolk(0,3,5,6);vnFolk(0,D/2+3,2,2);}
// A — log warehouse on a stone base: two log storeys and a loft, gable to the street, a column of loading doors
// under a hoist gable that projects from the apex, a loading platform with steps and a cart of sacks.
function buildHlRepWarehouseA(G,o){reseed(20511+(o.v|0));const W=10,D=16,S=1.4,H=3,P=1.3;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.8,.95)),rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),sh=hC(vPick(HPAL.shingle)),tar=hC(vPick(HPAL.tar)),trim=hC(vPick([HPAL.red,HPAL.teal,HPAL.white]));
 const yw=S+2*H,rise=P*W/2;vnReg('Log warehouse',0,0,10,yw+rise+1);
 hnSocle(0,0,0,W,S,D,0,rub,ash);for(const z of[-5,0,5])for(const s of[-1,1])vB('vDarkB',s*(W/2+.02),.5,z,.04,.4,.8,0);
 hnLogBox(0,S,0,W,H,D,0,log);hnLogBox(0,S+H,0,W,H,D,0,log);vB('vWood',0,S+H-.1,0,W+.25,.2,D+.25,0,tar);
 hnGable(0,yw,0,D,W,P,Math.PI/2,'vShingleB',sh,.7,'hGableLog',log);hnBarge(0,yw,0,D,W,rise,Math.PI/2,.7,trim,'lace');
 // the door column and the hoist gable
 const zf=D/2;for(const [y,h] of[[S,2.3],[S+H+.1,2.2],[yw+.4,1.8]]){vB('vDarkB',0,y,zf+.02,1.6,h,.06,0);for(const s of[-1,1])kput('vWood',[s*1.1,y+h/2,zf+.3],qEuler(0,s*1.2,0),[.8,h-.05,.06],tar);vB('vWood',0,y+h,zf+.08,2,.16,.16,0,tar);}
 {const hy=yw+2.6,out=1.8;vB('vWood',0,hy,zf+out/2,.26,.26,out+1.2,0,tar);vnGableRoof(0,hy+.4,zf+out/2-.1,out+.8,2,1.3,Math.PI/2,'vShingleB',sh,.25,'vGableW',log);
  vB('vWood',0,hy-.02,zf+out-.1,.3,.2,.3,0,hC(0x2e2a26));vPst('vRope',0,S+1.4,zf+out-.1,.025,hy-S-1.4,hC(0xa89878));kput('vSack',[0,S+1.2,zf+out-.1],qEuler(0,.4,0),[.32,.42,.3],hC(0xb8a080));}
 for(const s of[-1,1])for(const z of[-5.5,-2,2,5.5])for(const f of[0,1])vnWin(s*W/2,S+f*H+1.1,z,s*Math.PI/2,.7,.7,'shut','vWood',tar);
 // loading platform and steps, a cart, sacks, a lamp bracket
 vB('vStone',0,0,zf+1.4,W,S,2.8,0,rub);vB('vStone',0,S-.12,zf+1.4,W+.2,.14,3,0,ash);vnStairs(W/2-1.2,0,zf+3.35,0,1.4,S,6,'vStone',ash);
 hnSacks(-2.6,S,zf+1.4,5);hnCrate(2,S,zf+1.2,.9,.2,log);hnRAWagon(-1,zf+4.5,0,log,'sacks');hnRAHorse(-1,zf+7.5,0,hC(vPick(HRA_HORSE)));
 hnRASignboard(0,S+H-.95,zf+.02,0,3.4,.5,hC(vPick([HPAL.ochre,HPAL.white])),tar);
 vnFolk(2,zf+4,3,2);}
// B — stone-and-iron warehouse: rubble walls with ashlar quoins and pilasters, riveted plate doors in iron frames, a
// corrugated iron roof on iron trusses showing at the gables, a raised loading dock under an iron canopy, a crane.
function buildHlRepWarehouseB(G,o){reseed(20521+(o.v|0));const W=20,D=12,H=6,S=1.2;
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),I=hC(0x2e2a26),log=hC(vPick(HPAL.pine));
 vnReg('Stone-and-iron warehouse',0,0,12,H+4.5);
 vB('hRubB',0,0,0,W,H,D,0,rub);for(const sx of[-1,1])for(const sz of[-1,1])for(let k=0;k<Math.floor(H/.6);k++){const big=k%2===0;vB('vStone',sx*(W/2-(big?.3:.22)+.03),k*.6,sz*(D/2+.03),big?.62:.46,.56,.08,0,ash);vB('vStone',sx*(W/2+.03),k*.6,sz*(D/2-(big?.22:.3)+.03),.08,.56,big?.46:.62,0,ash);}
 for(const x of[-5,0,5])vB('vStone',x,0,D/2+.1,.7,H,.22,0,ash);vB('vStone',0,H-.4,0,W+.3,.4,D+.3,0,ash);
 // iron-framed plate doors, three bays, at dock height; high windows with iron bars
 for(const x of[-7.5,-2.5,2.5,7.5]){const dx=x;if(Math.abs(x)>6){vnWin(dx,S+2.4,D/2,0,1.4,1.2,'glass','vIron',I);continue;}
  vB('vDarkB',dx,S,D/2+.02,3,3.2,.05,0);for(const s of[-1,1])vB('vIron',dx+s*1.6,S,D/2+.1,.2,3.4,.18,0,I);vB('vIron',dx,S+3.3,D/2+.1,3.4,.2,.18,0,I);
  kput('vRustB',[dx-.75,S+1.6,D/2+.1],null,[1.46,3.1,.06],null);kput('vPlate',[dx+.9,S+1.6,D/2+.35],qEuler(0,-.6,0),[1.46,3.1,1],null);
  for(let k=0;k<5;k++)vB('vIron',dx-.75,S+.2+k*.7,D/2+.14,1.4,.05,.03,0,I);}
 for(const x of[-7.5,-2.5,2.5,7.5])vnWin(x,H-1.9,D/2,0,1.2,1,'glass','vIron',I);
 for(const z of[-3.5,0,3.5])for(const s of[-1,1])vnWin(s*W/2,H-2,z,s*Math.PI/2,1.1,1,'glass','vIron',I);
 // corrugated roof on iron trusses (the truss shows under the gable overhang)
 const P=.6,rs=P*D/2;hnGable(0,H,0,W,D,P,0,'vCorr',hC(0xa8a49c),.7,'vGableC',null);
 for(const s of[-1,1]){const x=s*(W/2+.4);beam('vIron',[x,H+.05,-D/2-.5],[x,H+rs+.1,0],.14,.14,I);beam('vIron',[x,H+.05,D/2+.5],[x,H+rs+.1,0],.14,.14,I);beam('vIron',[x,H+.05,-D/2-.5],[x,H+.05,D/2+.5],.14,.14,I);
  for(const t of[-.5,.5]){beam('vIron',[x,H+.05,t*D*.5],[x,H+rs*(1-Math.abs(t))+.05,t*D*.5],.07,.07,I);beam('vIron',[x,H+.05,t*D*.5],[x,H+rs+.05,0],.06,.06,I);}}
 for(let k=0;k<3;k++){const x=-6+k*6;vB('vIron',x,H+rs-.1,0,1.2,.7,1,0,I);vnGableRoof(x,H+rs+.6,0,1.4,1.2,.4,0,'vCorr',hC(0x8a8680),.15);}
 // the loading dock: stone, iron bollards, stairs, a canopy on iron brackets, a crane, goods, a wagon backed up
 vB('vStone',0,0,D/2+1.6,W-2,S,3.2,0,rub);vB('vStone',0,S-.1,D/2+1.6,W-1.8,.12,3.4,0,ash);vnStairs(-W/2+1.8,0,D/2+3.8,0,1.4,S,6,'vStone',ash);
 for(let k=0;k<6;k++)vPst('vPipe',-7+k*2.8,S,D/2+3.1,.1,.6,I);
 for(const x of[-8,-4,0,4,8]){beam('vIron',[x,H-.9,D/2+.12],[x,H-1.6,D/2+2.9],.1,.1,I);beam('vIron',[x,H-2.4,D/2+.12],[x,H-1.62,D/2+1.6],.07,.07,I);}
 vnShedRoof(0,H-1.9,D/2+1.6,W-1,3,.55,0,'vCorr',hC(0x98948a),.2);
 hnRACrane(W/2-1.3,D/2+2.4,.4,5,2.6,log,true);
 for(let k=0;k<5;k++)hnCrate(-6+k*2.2+rr(-.3,.3),S,D/2+1.2,rr(.8,1.1),rr(-.2,.2),log);hnSacks(3,S,D/2+2,4);hnBarrel(6.5,S,D/2+1.2,.4,1);hnBarrel(7.4,S,D/2+1.4,.4,1);
 hnRAWagon(-3,D/2+4.9,0,log,'barrels');hnRAHorse(-3,D/2+7.9,0,hC(vPick(HRA_HORSE)));
 vnFolk(0,D/2+1.6,3,5);vnFolk(4,D/2+5,2,2);}

// ---------------------------------------------------------------- registry
const HRA_TAV={type:['tavern/inn']},HRA_SHOP={type:['market/shop']},HRA_IND={type:['industry']};
HL.def({key:'hl_rep_tavern_a',name:'Beer hall',branch:'republican',family:'Taverns and inns',tags:Object.assign({wealth:'middle',lit:false},HRA_TAV),w:18,d:34,h:14,build:buildHlRepTavernA});
HL.def({key:'hl_rep_tavern_b',name:'Saxon tavern',branch:'republican',family:'Taverns and inns',tags:Object.assign({wealth:'middle',lit:false},HRA_TAV),w:22,d:14,h:15,build:buildHlRepTavernB});
HL.def({key:'hl_rep_tavern_c',name:'Traktir',branch:'republican',family:'Taverns and inns',tags:Object.assign({wealth:'middle',lit:false},HRA_TAV),w:18,d:24,h:14,build:buildHlRepTavernC});
HL.def({key:'hl_rep_inn',name:'Coaching inn',branch:'republican',family:'Taverns and inns',tags:Object.assign({wealth:'rich',lit:true},HRA_TAV),w:28,d:30,h:20,build:buildHlRepInn});
HL.def({key:'hl_rep_shops',name:'Shop row',branch:'republican',family:'Shops and workshops',tags:Object.assign({wealth:'middle',lit:false},HRA_SHOP),w:17,d:14,h:12,build:buildHlRepShops});
HL.def({key:'hl_rep_market_hall',name:'Market hall',branch:'republican',family:'Shops and workshops',tags:{type:['market/shop','civic'],wealth:'rich',lit:true},w:24,d:16,h:20,build:buildHlRepMarketHall});
HL.def({key:'hl_rep_workshop_a',name:"Wheelwright's workshop",branch:'republican',family:'Shops and workshops',tags:Object.assign({wealth:'middle',lit:false},HRA_IND),w:20,d:18,h:8,build:buildHlRepWorkshopA});
HL.def({key:'hl_rep_workshop_b',name:'Brewery and cooperage',branch:'republican',family:'Shops and workshops',tags:Object.assign({wealth:'middle',lit:false},HRA_IND),w:26,d:20,h:15,build:buildHlRepWorkshopB});
HL.def({key:'hl_rep_smithy_small',name:'Scrap smithy (small)',branch:'republican',family:'Smithies',tags:Object.assign({wealth:'poor',lit:false},HRA_IND),w:14,d:10,h:8,build:buildHlRepSmithySmall});
HL.def({key:'hl_rep_smithy_large',name:'Scrap smithy (large)',branch:'republican',family:'Smithies',tags:Object.assign({wealth:'middle',lit:false},HRA_IND),w:30,d:18,h:15,build:buildHlRepSmithyLarge});
HL.def({key:'hl_rep_stables',name:'Caravanserai',branch:'republican',family:'Stables and warehouses',tags:{type:['infrastructure','tavern/inn'],wealth:'middle',lit:false},w:31,d:32,h:20,build:buildHlRepStables});
HL.def({key:'hl_rep_warehouse_a',name:'Log warehouse',branch:'republican',family:'Stables and warehouses',tags:Object.assign({wealth:'middle',lit:false},HRA_IND),w:12,d:30,h:15,build:buildHlRepWarehouseA});
HL.def({key:'hl_rep_warehouse_b',name:'Stone-and-iron warehouse',branch:'republican',family:'Stables and warehouses',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},w:22,d:26,h:12,build:buildHlRepWarehouseB});
