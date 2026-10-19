// ================================================================= 70t. TALIA: dwellings, poor and middle (kits/talia/PLAN.md section 4)
// Seed block 9401-9499 (PLAN.md: Talia takes 9401-9799). Tags: culture 'talia', a style ('whitewash' | 'orange' |
// 'classical' | 'byzantine' | 'baroque' | 'indic'), and the project's type, wealth and lit (lit only for rich and civic:
// the Vernacular's lighting rule). No gilt below the rich tier (the owner, 2026-10-17). Whitewash is Mediterranean:
// rounded white cubes, flat roofs and terraces, the arch at every opening, the orange in the reveal and the band.
const TA_WH=()=>vC(vPick(TAPAL.white)),TA_OR=()=>vC(vPick(TAPAL.orange)),TA_ST=()=>vC(vPick(TAPAL.stone)),TA_WAL=()=>vC(vPick(TAPAL.walnut)),TA_IR=()=>vC(vPick(TAPAL.iron));

// a loggia across a face: a recess `depth` deep behind n arched bays (a floor slab, piers, an iron rail, the back wall),
// each bay's round head open into it under an orange barrel vault, spandrels closing the front round the heads; the
// ceiling slab over it in the band's colour. (x, z) is the FRONT plane, centred; the body behind must stop at -depth.
function tanLoggia(x,y,z,ry,w,h,n,depth,c,bandC,railC,o){o=o||{};const pw=.5,bay=(w-(n+1)*pw)/n,r=(bay)/2,hs=h-r-.3;
 const back=loc(x,z,0,-depth-.15,ry);vB('vPlaster',back[0],y,back[1],w,h,.3,ry,c);
 const mid=loc(x,z,0,-depth/2,ry);vB('vPlaster',mid[0],y-.22,mid[1],w,.22,depth,ry,c);vB('vPlaster',mid[0],y+h-.22,mid[1],w-.1,.22,depth,ry,bandC);
 for(let k=0;k<=n;k++){const end=k===0||k===n;const p=loc(x,z,-w/2+pw/2+k*(bay+pw),end?-depth/2:-.2,ry);vB('vPlaster',p[0],y,p[1],pw,h,end?depth:.4,ry,c);}
 for(let k=0;k<n;k++){const u=-w/2+pw+bay/2+k*(bay+pw);const p=loc(x,z,u,0,ry);
  tanSpandrel(p[0],y+hs,p[1],ry,r,r+pw/2,y+h-.22,.4,0,c);const vc=loc(x,z,u,-depth/2,ry);kput('taVault',[vc[0],y+hs,vc[1]],vQ(ry,0,0),[r,r,depth],bandC);
  tanArcBand(p[0],y+hs,p[1],ry,r+.07,.14,.12,.06,bandC,0,Math.PI);
  for(const s of[-1,1]){const q=loc(x,z,u+s*(r+.07),0,ry);vB('vPlaster',q[0],y-.02,q[1],.14,hs+.02,.12,ry,bandC);}
  if(railC){const f=loc(x,z,u,.02,ry);vB('vIron',f[0],y+.95,f[1],bay,.04,.04,ry,railC);const nn=Math.max(2,Math.round(bay/.3));for(let j=0;j<=nn;j++){const g=loc(x,z,u-bay/2+j*bay/nn,.02,ry);vB('vIron',g[0],y,g[1],.03,.95,.03,ry,railC);}
   if(o.plants)tanTrail(f[0],y+.9,f[1],ry,bay*.7,2);}}
 return hs;}

// ---------------------------------------------------------------- POOR
// Cube house (refs/talia2.jpg): two rounded whitewashed cubes, the upper one set back-left so the rest of the roof is a
// terrace; flat roofs behind low parapets; an orange door and orange reveals; an outside stair up the east flank; a
// pot and a vine on the terrace.
function buildTalCubeHouse(G,o){reseed(9401+(o.v|0));const W=6.4,D=6.0,H1=3.1,H2=2.8,Z0=-1.4,zf=Z0+D/2;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST();
 vnReg('Cube house (poor)',0,Z0,4.6,H1+H2+.8,{style:'whitewash'});
 vnPaving(0,.04,zf+2.2,8,3.6,0,st,6);
 tanRoundBox(0,0,Z0,W,H1,D,0,wh,.35);tanParapetWall(0,H1,Z0,W,D,0,wh,.6,or);
 tanRoundBox(-1.0,H1,Z0-.6,4.2,H2,4.4,0,wh,.3);tanParapetWall(-1.0,H1+H2,Z0-.6,4.2,4.4,0,wh,.5,or);
 tanDoor(.9,0,zf,0,.95,2.1,'vPlaster',or,or,false);vnStairs(.9,0,zf+.45,0,1.6,.18,1,'vStone',st);
 tanArch(-1.7,.9,zf,0,.8,1.5,{fill:'D',band:or,bw:.1,sill:wh});
 tanArch(-1.0,H1+.9,Z0-.6+2.2,0,.9,1.5,{fill:'D',band:or,bw:.1,sill:wh});
 tanArch(-W/2,1.0,Z0+.6,-Math.PI/2,.8,1.4,{fill:'D',band:or,bw:.1});tanArch(0,1.0,Z0-D/2,Math.PI,1.0,1.5,{fill:'D',band:or,bw:.1});
 tanWallStair(W/2,0,zf-.3,Math.PI/2,1,H1,10,.9,wh,or);
 tanPot(2.2,H1,Z0+1.4,.32);tanPot(-2.6,0,zf+.5,.28);tanTrail(2.3,H1+.6,zf+.02,0,1.8,2);
 vnWaterButt(-W/2-.6,0,Z0-1.2,.36,.9);}

// Lane row (refs/talia2.jpg, talia5.jpg): a row of narrow two-storey houses behind a rill running down the lane, each
// with an orange door, an arched upper window and a roof terrace; o.len houses (3). The ends are finished (o.ends is
// honoured by the placer; every face is closed here).
function buildTalLaneRow(G,o){reseed(9411+(o.v|0));const n=(o.len==null?3:o.len),HW=4.2,D=6,H=2.7,Z0=-1.0,zf=Z0+D/2,L=n*HW;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST(),ir=TA_IR();
 vnReg('Lane row (poor, shared)',0,Z0,L/2+1,2*H+1.4,{style:'whitewash',type:['multi-family dwelling']});
 for(let k=0;k<n;k++){const x=-L/2+HW/2+k*HW,two=k%2===0,top=two?2*H+.1:H+.1;const c=k%3===1?vC(vPick(TAPAL.marble)):wh;
  vnBody('vPlaster',x,0,Z0,HW,H,D,0,c,{t:.25});vB('vPlaster',x,H,Z0,HW+.06,.1,D+.06,0,or);
  if(two)vnBody('vPlaster',x,H+.1,Z0,HW,H,D,0,c,{t:.25});
  tanParapetWall(x,top,Z0,HW,D,0,c,.55,or);
  tanDoor(x-.9,0,zf,0,.9,2.0,'vPlaster',or,k%2?TA_WAL():or,false);vnStairs(x-.9,0,zf+.42,0,1.4,.16,1,'vStone',st);
  tanArch(x+1.1,.9,zf,0,.75,1.4,{fill:'D',band:or,bw:.1,sill:c});
  if(two)tanArch(x,H+.9,zf,0,1.0,1.6,{fill:'D',band:or,bw:.1,rail:ir});else tanPot(x+1.2,top,zf-1,.3);
  if(two&&k%2===0)tanTrail(x-1,H+.8,zf+.02,0,1.4,1);}
 for(const s of[-1,1])tanArch(s*L/2,1.0,Z0,s*Math.PI/2,.8,1.4,{fill:'D',band:or,bw:.1});
 // the rill: an orange stone channel along the lane with water in it, a slab bridge to each door
 vB('vPlaster',0,0,zf+1.9,L+.6,.26,.6,0,or);vB('vWinGlass',0,.14,zf+1.9,L+.4,.1,.4,0,null);
 for(let k=0;k<n;k++){const x=-L/2+HW/2+k*HW-.9;vB('vStone',x,.26,zf+1.9,1.2,.08,.8,0,st);}
 vnPaving(0,.04,zf+3.0,L+2,1.6,0,st,8);vnWaterButt(L/2+.6,0,Z0-1.5,.34,.9);}

// Hill stack (refs/talia2.jpg, talia fancy.jpg): three tiers of rounded cubes stepping back up a slope, each tier's
// roof the next one's terrace, a stair up the east flank at every tier; the ground under the back tiers is the hill (a
// white retaining mass here; on a slope the placer sets o.slope and the site's terrain carries it). Several households.
function buildTalHillStack(G,o){reseed(9491+(o.v|0));const CW=5.2,CD=5.4,H=3.0,T=3.2,XC=-.65,SB=3.8,Z00=3.0;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST(),cr=vC(vPick(TAPAL.marble));
 vnReg('Hill stack (poor, shared)',XC,-1.4,7,3*T+1,{style:'whitewash',type:['multi-family dwelling']});
 for(let k=0;k<3;k++){const y=k*T,zc=Z00-k*SB,zf=zc+CD/2;
  // the hill under this tier (behind the tier below) and the floor over the tier below
  if(k>0){const zb=Z00-(k-1)*SB-CD/2;vB('vPlaster',XC+.65,0,(zc-CD/2+zb)/2,2*CW+.6+1.3,y,zb-(zc-CD/2),0,st);
   vB('vPlaster',XC,y-.2,zc,2*CW+.6,.2,CD,0,wh);}
  for(const s of[-1,1]){const x=XC+s*2.9,c=(k+s)%2?wh:cr;tanRoundBox(x,y,zc,CW,H,CD,0,c,.32);tanParapetWall(x,y+H,zc,CW,CD,0,c,.5,or);
   if(s<0){tanDoor(x-.8,y,zf,0,.9,2.0,'vPlaster',or,or,false);tanArch(x+1.3,y+.9,zf,0,.8,1.4,{fill:'D',band:or,bw:.1,sill:c});}
   else{tanArch(x-1.2,y+.9,zf,0,.8,1.4,{fill:'D',band:or,bw:.1,sill:c});tanDoor(x+1.0,y,zf,0,.9,2.0,'vPlaster',or,TA_WAL(),false);}
   tanPot(x+s*1.6,y+H,zc+.8,.28);}
  // the stair up this tier's east flank, on its own plinth down to the ground
  const sx=XC+2.9+CW/2;if(k>0)vB('vPlaster',sx+.62,0,zc+.2,1.3,y,CD-.4,0,st);
  tanWallStair(sx,y,zf-.2,Math.PI/2,1,T,10,.9,wh,or);
  tanTrail(XC-2.9+1,y+H+.4,zf+.02,0,2,1);}
 vnPaving(XC,.04,Z00+CD/2+1.6,12,2.2,0,st,8);}

// ---------------------------------------------------------------- MIDDLE
// Loggia house (refs/talia.jpg): three storeys of stacked arched loggias with orange arch bands and orange vaults, iron
// rails and hanging plants; a rounded white body; a roof terrace with a plain kiosk. Middle: no gilt, no light.
function buildTalLoggiaHouse(G,o){reseed(9421+(o.v|0));const W=9.6,D=8.8,LD=1.4,H=3.2,Y0=.4,Z0=-1.2,zb=Z0+D/2,zf=zb+LD,LW=7.2;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST(),ir=TA_IR(),wal=TA_WAL();
 vnReg('Loggia house (middle)',0,Z0,7,Y0+3*H+3.4,{style:'whitewash'});
 vB('vStone',0,-.1,Z0+LD/2,W+.4,Y0+.1,D+LD+.4,0,st);
 for(let k=0;k<3;k++){const y=Y0+k*H;tanRoundBox(0,y,Z0,W,H,D,0,wh,.3);
  tanLoggia(0,y,zf,0,LW,H,2,LD,wh,or,ir,{plants:k>0});
  for(const s of[-1,1])vB('vPlaster',s*(W/2-.6),y,zb+LD/2,1.2,H,LD,0,wh);
  if(k===0)tanDoor(-1.6,y,zb,0,1.0,2.3,'vPlaster',or,wal,false);else{tanArch(-1.6,y+.3,zb,0,1.0,2.3,{fill:'G',band:or,bw:.1});}
  tanArch(1.7,y+.9,zb,0,1.0,1.5,{fill:'G',band:or,bw:.1,sill:wh});
  for(const s of[-1,1])tanArch(s*W/2,y+.9,Z0-1.2,s*Math.PI/2,1.0,1.5,{fill:'G',band:or,bw:.1,sill:wh});
  tanArch(0,y+.9,Z0-D/2,Math.PI,1.2,1.6,{fill:'G',band:or,bw:.1,sill:wh});
  if(k<2)tanString(0,y+H-.06,Z0+LD/2,W,D+LD,0,or,.1,.12);}
 const top=Y0+3*H;tanParapetWall(0,top,Z0+LD/2,W,D+LD,0,wh,.7,or);
 tanKiosk(-2.2,top,Z0-1.4,1.3,2.4,6,wh,{domeC:vC(vPick(TAPAL.tile)),ribC:wh});
 tanPot(2.6,top,Z0+1.5,.34);tanPot(3.2,top,Z0-2,.3);
 vnStairs(-1.6,0,zf+.4,0,1.8,Y0,2,'vStone',st);vnPaving(0,.04,zf+2,10,2.6,0,st,8);}

// Dome house (PLAN.md): a two-storey white house with a round corner stair tower under a ribbed melon dome, a Doric
// porch with an orange tympanum, round-arched windows in orange bands, an orange string course, a roof terrace behind
// a plain balustrade.
function buildTalDomeHouse(G,o){reseed(9431+(o.v|0));const W=10,D=9,H=3.3,Y0=.45,Z0=-1.2,zf=Z0+D/2,TR=1.9,TX=W/2-.6,TZ=zf-.6;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST(),wal=TA_WAL(),tile=vC(vPick(TAPAL.tile));
 vnReg('Dome house (middle)',0,Z0,7.2,Y0+2*H+TR+4.2,{style:'byzantine'});
 vB('vStone',0,-.1,Z0,W+.5,Y0+.1,D+.5,0,st);
 vnBody('vPlaster',0,Y0,Z0,W,H,D,0,wh,{t:.3});tanString(0,Y0+H-.1,Z0,W,D,0,or,.16,.16);
 vnBody('vPlaster',0,Y0+H+.06,Z0,W,H,D,0,wh,{t:.3});
 const top=Y0+2*H+.06;vB('vPlaster',0,top,Z0,W+.2,.2,D+.2,0,or);tanParapet(0,top+.2,Z0,W-.3,D-.3,0,wh,.95,{plain:true});
 // the stair tower on the front-right corner, its small arched slits, the melon dome
 vPst('vPostS',TX,Y0,TZ,TR,2*H+1.4,wh);kput('taRing',[TX,Y0+2*H+1.4,TZ],null,[TR+.1,TR+.1,1.2],or);
 for(let k=0;k<3;k++){const a=.3+k*.9,yy=Y0+1.2+k*1.9;tanArch(TX+Math.sin(a)*TR,yy,TZ+Math.cos(a)*TR,a,.5,1.1,{fill:'D',band:or,bw:.08});}
 tanDome(TX,Y0+2*H+1.5,TZ,TR+.1,{kind:'melon',c:tile,ribs:12,ribC:wh});kput('taBallM',[TX,Y0+2*H+1.5+TR+.2,TZ],null,[.18,.24,.18],wh);
 // the porch: two Doric columns under a pediment, the door behind
 const px=-1.6;for(const s of[-1,1])tanColumn(px+s*1.5,Y0,zf+1.5,H-.5,.2,'doric',wh);
 vB('taMarble',px,Y0+H-.5,zf+.75,3.9,.3,1.9,0,wh);tanPediment(px,Y0+H-.2,zf+1.7,0,4.1,1.0,wh,.1,1.9,or);
 vB('vStone',px,-.1,zf+.9,4.2,Y0+.1,1.9,0,st);vnStairs(px,0,zf+2.1,0,3,Y0,2,'vStone',st);
 tanDoor(px,Y0,zf,0,1.15,2.4,'vPlaster',or,wal,false);
 // windows: round-arched in orange bands, glazed
 tanArch(2.0,Y0+.9,zf,0,1.2,1.9,{fill:'G',band:or,bw:.12,sill:wh,key:wh});
 for(const x of[-3.2,-.4,2.4])tanArch(x,Y0+H+.9,zf,0,1.1,1.8,{fill:'G',band:or,bw:.12,sill:wh});
 for(const s of[-1,1])for(const [yy,zz] of[[Y0+.9,Z0-1.4],[Y0+H+.9,Z0-2.2],[Y0+H+.9,Z0+.8]])if(s<0||zz<TZ-TR-.8)tanArch(s*W/2,yy,zz,s*Math.PI/2,1.1,1.8,{fill:'G',band:or,bw:.12,sill:wh});
 for(const x of[-2.6,2.6])tanArch(x,Y0+H+.9,Z0-D/2,Math.PI,1.1,1.8,{fill:'G',band:or,bw:.12,sill:wh});
 tanPot(2.8,top+.2,Z0-2.6,.34);tanPot(-3.4,0,zf+1.2,.3);vnPaving(0,.04,zf+3,8,2,0,st,6);}

// Tenement (refs/talia14.jpg): the orange quarter: five storeys of burnt-orange render with rows of small arched
// windows in white bands and timber shutters, a terracotta hip roof on short eaves, a round turret on the front-left
// corner under a tile cone, a shop arch and a door on the ground floor. The bridge to the Vernacular (VASSAL-KITS.md).
function buildTalTenement(G,o){reseed(9441+(o.v|0));const W=11,D=10.5,H=3.0,N=5,Y0=.3,Z0=-.8,zf=Z0+D/2,TOP=Y0+N*H;
 const bo=vC(vPick(TAPAL.burnt)),wh=TA_WH(),st=TA_ST(),wood=vC(vPick(VPAL.woodMid)),tile=vC(vPick(TAPAL.tile)),wal=TA_WAL();
 vnReg('Tenement (middle, shared)',0,Z0,8,TOP+3.4,{style:'orange',type:['multi-family dwelling']});
 vB('vStone',0,-.1,Z0,W+.4,Y0+.1,D+.4,0,st);
 for(let k=0;k<N;k++){const y=Y0+k*H;vnBody(TAL_MATLIB.taRenderW?'taRenderW':'vPlaster',0,y,Z0,W,H,D,0,TAL_MATLIB.taRenderW?null:bo,{t:.3});if(k>0)tanString(0,y-.06,Z0,W,D,0,wh,.08,.1);
  if(k===0){tanArch(1.8,y,zf,0,2.6,3.0-.4,{fill:'D',band:wh,bw:.16,key:wh});tanDoor(-2.4,y,zf,0,1.0,2.3,'vPlaster',wh,wal,false);vnStairs(-2.4,0,zf+.4,0,1.5,Y0,1,'vStone',st);
   vnAwning(1.8,y+2.3,zf,0,3.0,1.3,vC(vPick(VPAL.awning)));for(const s of[-1,1])tanArch(s*W/2,y+.9,Z0-1.2,s*Math.PI/2,.9,1.5,{fill:'D',band:wh,bw:.12});}
  else{for(let j=0;j<4;j++){const x=-3.9+j*2.6;if((j+k)%3===0)tanWin(x,y+.9,zf,0,.9,1.5,'glass','vWood',wood,true);else tanArch(x,y+.8,zf,0,.9,1.7,{fill:'G',band:wh,bw:.12,sill:wh});}
   for(const s of[-1,1])for(const zz of[Z0-2.6,Z0,Z0+2.6]){if(s<0&&zz>Z0+1&&k>0)continue;if((k+1)%2===0&&zz===Z0)tanWin(s*W/2,y+.9,zz,s*Math.PI/2,.9,1.5,'glass','vWood',wood,true);else tanArch(s*W/2,y+.8,zz,s*Math.PI/2,.9,1.7,{fill:'G',band:wh,bw:.12,sill:wh});}
   for(const x of[-2.6,2.6])tanArch(x,y+.8,Z0-D/2,Math.PI,.9,1.7,{fill:'G',band:wh,bw:.12,sill:wh});}}
 vB('vPlaster',0,TOP,Z0,W+.3,.3,D+.3,0,wh);
 vnHipRoof('taHipTile',0,TOP+.3,Z0,W,D,2.4,0,tile,.4);
 // the turret: corbelled out from the second storey on the front-left corner, a tile cone over it
 const tx=-W/2+.2,tz=zf-.2,ty=Y0+H;kput('taEchinus',[tx,ty-.9,tz],null,[1.3,.9,1.3],bo);vPst('vPostS',tx,ty,tz,1.3,TOP+.6-ty,bo);
 for(let k=1;k<N;k++)tanArch(tx+Math.sin(-.6)*1.3,Y0+k*H+.9,tz+Math.cos(-.6)*1.3,-.6,.6,1.3,{fill:'G',band:wh,bw:.1});
 kput('taRing',[tx,TOP+.6,tz],null,[1.4,1.4,1.2],wh);kput('taCone',[tx,TOP+.6,tz],null,[1.55,2.6,1.55],tile);kput('taBallM',[tx,TOP+3.2,tz],null,[.14,.18,.14],wh);
 vnChimney(2.8,TOP+1.9,Z0-2,1.4,.2,false);vnPaving(0,.04,zf+1.6,12,1.8,0,st,8);}

// Arcade block (refs/talia13.jpg): flats over a street arcade: the upper storeys cantilevered over a walk behind round
// arches on paired colonnettes, round-arched windows in orange bands above, a plain balustrade round the roof terrace.
function buildTalArcadeBlock(G,o){reseed(9451+(o.v|0));const W=13,D=9.5,GH=3.6,H=3.1,SB=1.8,Y0=.1,Z0=-1.0,zf=Z0+D/2,TOP=Y0+GH+2*H;
 const wh=TA_WH(),or=TA_OR(),st=TA_ST(),wal=TA_WAL(),cr=vC(vPick(TAPAL.marble));
 vnReg('Arcade block (middle, shared)',0,Z0,8,TOP+1.4,{style:'classical',type:['multi-family dwelling','market/shop']});
 vB('vStone',0,-.1,Z0,W+.3,Y0+.1,D+.3,0,st);
 // the ground storey, set back behind the walk; shop arches and the door on its front
 vnBody('vPlaster',0,Y0,Z0-SB/2,W,GH,D-SB,0,wh,{t:.3});
 for(const x of[-4.2,0])tanArch(x,Y0,zf-SB,0,2.2,GH-.5,{fill:'D',band:or,bw:.14,key:wh});tanDoor(4.2,Y0,zf-SB,0,1.1,2.4,'vPlaster',or,wal,false);
 // the arcade: five bays on paired colonnettes, arches under the slab's edge
 const n=5,bay=W/n,r=bay/2-.35;for(let k=0;k<=n;k++){const x=-W/2+k*bay;if(k===0||k===n){vB('vPlaster',x+(k===0?.3:-.3),Y0,zf-.4,.6,GH,.8,0,wh);continue;}
  for(const dz of[-.45,.15])tanColumn(x,Y0,zf+dz,GH-1.3,.17,'doric',cr);}
 for(let k=0;k<n;k++){const x=-W/2+bay/2+k*bay;tanArcBand(x,Y0+GH-1.3+.1,zf-.1,0,r+.07,.16,.5,.05,or,0,Math.PI,10);}
 vB('vPlaster',0,Y0+GH,Z0,W+.2,.3,D+.2,0,or);
 // the upper storeys, full depth, round-arched windows; the roof terrace
 for(let k=0;k<2;k++){const y=Y0+GH+.3+k*H;vnBody('vPlaster',0,y,Z0,W,H-.3,D,0,wh,{t:.3});
  for(let j=0;j<5;j++)tanArch(-W/2+bay/2+j*bay,y+.7,zf,0,1.1,1.9,{fill:'G',band:or,bw:.12,sill:wh,rail:j%2?TA_IR():null});
  for(const s of[-1,1])for(const zz of[Z0-2.6,Z0+.4])tanArch(s*W/2,y+.7,zz,s*Math.PI/2,1.0,1.8,{fill:'G',band:or,bw:.12,sill:wh});
  for(const x of[-3.6,0,3.6])tanArch(x,y+.7,Z0-D/2,Math.PI,1.0,1.8,{fill:'G',band:or,bw:.12,sill:wh});
  if(k===0)tanString(0,y+H-.36,Z0,W,D,0,or,.1,.12);}
 vB('vPlaster',0,TOP+.3,Z0,W+.2,.2,D+.2,0,or);tanParapet(0,TOP+.5,Z0,W-.3,D-.3,0,wh,.95,{plain:true});
 tanPot(3.8,TOP+.5,Z0-2,.34);tanPot(-4.4,TOP+.5,Z0+1,.3);vnPaving(0,.04,zf+1.8,14,1.6,0,st,8);}

const TA_TAG=(style,wealth,type,lit)=>({culture:'talia',style,type:type||['single-family dwelling'],wealth,lit:!!lit});
VERN.def({key:'tal_cube_house',name:'Cube house',family:'dwelling',tags:TA_TAG('whitewash','poor'),w:10,d:11,h:8,build:buildTalCubeHouse});
VERN.def({key:'tal_lane_row',name:'Lane row',family:'dwelling',tags:TA_TAG('whitewash','poor',['multi-family dwelling']),w:14,d:9,h:8,build:buildTalLaneRow});
VERN.def({key:'tal_hill_stack',name:'Hill stack',family:'dwelling',tags:TA_TAG('whitewash','poor',['multi-family dwelling']),w:14,d:14,h:11,build:buildTalHillStack});
VERN.def({key:'tal_loggia_house',name:'Loggia house',family:'dwelling',tags:TA_TAG('whitewash','middle'),w:12,d:13,h:14,build:buildTalLoggiaHouse});
VERN.def({key:'tal_dome_house',name:'Dome house',family:'dwelling',tags:TA_TAG('byzantine','middle'),w:14,d:14,h:13,build:buildTalDomeHouse});
VERN.def({key:'tal_tenement',name:'Tenement (the orange quarter)',family:'dwelling',tags:TA_TAG('orange','middle',['multi-family dwelling']),w:13,d:13,h:20,build:buildTalTenement});
VERN.def({key:'tal_arcade_block',name:'Arcade block (flats over a walk)',family:'dwelling',tags:TA_TAG('classical','middle',['multi-family dwelling','market/shop']),w:16,d:13,h:12,build:buildTalArcadeBlock});
