// ================================================================= PORTED — the Order of Historians' chapterhouse (from the Yuni set)
// Re-description of Yuni's `civic_chapter_house` ("Chapter house of the Historians": laterite drum halls under tile
// cones with lanterns, round relief-ringed windows, curved arcaded gallery wings, a carved forecourt wall with a
// parabolic gate) crossed with the Order's Djenne-type civic vocabulary (`civic_hall_records`, `civic_sankore_spire`:
// battered banco walls, pilaster-buttresses with pinnacles, toron rows, blue-and-white mosaic string courses) and the
// Locus Geomancers' chapterhouse's nested-archivolt porch. Ochre / laterite / dark-umber earth palette; the only
// saturated colour is the Order's blue in the mosaic bands and the electric light. Uses the shared vp* kit from 75.
//
// Programme, local frame (+z front): a walled forecourt with a parabolic gate between two pylons; two arcaded
// wings (the archive stacks, the scriptorium) with a drum pavilion at each front corner; the READING HALL across
// the back — a battered block whose great drum carries a tile cone and a lantern; the Order's bell tower (a
// Sankore-style pyramid bristling with toron) at the back corner. Electric lamps: the Order runs the Vault's cable.

// battered face: half-depth of a `vpBanco7` block (7 % taper) at height y above its base
const vpBat7=(D,H,y)=>D/2*(1-.07*clamp(y/H,0,1));
// Yuni window on a battered banco face: dark reveal + pane (lit if electric), a small banco sill; (x,z) ON the face
function vpYWin(x,y,z,ry,w,h,c,lit){const f=loc(x,z,0,.03,ry);vB('vDarkB',f[0],y-.06,f[1],w+.24,h+.12,.14,ry);const p=loc(x,z,0,.06,ry);vB(lit?'vWinLit':'vDarkB',p[0],y,p[1],w,h,.12,ry);
 const s=loc(x,z,0,.16,ry);vB('vpBancoB',s[0],y-.2,s[1],w+.5,.2,.36,ry,c);}
// round Order window: banco relief ring, dark socket, a pane that glows if electric. r = pane radius. Faces `ry`.
function vpRoundWin(x,y,z,ry,r,c,lit){const q=vQ(ry,0,0);const a=loc(x,z,0,.14,ry),b=loc(x,z,0,.02,ry),d=loc(x,z,0,-.04,ry);
 kput('vpRingB',[a[0],y,a[1]],q,[r*1.25,r*1.25,r*1.25],c);kput('vpDiscDark',[b[0],y,b[1]],q,[r*1.15,r*1.15,.16],null);kput(lit?'vpDiscLit':'vpDiscDark',[d[0],y,d[1]],q,[r,r,.3],null);}
// a row of toron (projecting timber posts) along a face: from (x0,z0) to (x1,z1) at height y, n posts, outward (nx,nz)
function vpTorons(x0,z0,x1,z1,y,n,nx,nz,len){const c=vC(0x4a3624);for(let i=0;i<n;i++){const t=(i+.5)/n;const x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;vBeam([x-nx*.3,y,z-nz*.3],[x+nx*(len||.95),y-.06,z+nz*(len||.95)],.17,c);}}
// pilaster-buttress with a pinnacle cone and a gilt ball: a battered post proud of a wall, base at (x,z)
function vpPinnacle(x,y,z,w,h,c,ry){kput('vpBanco7',[x,y,z],ry?qEuler(0,ry,0):null,[w,h,w],c);kput('vpBancoCone',[x,y+h-.05,z],null,[w*.42,w*1.1,w*.42],c);vBall('vpGilt',x,y+h+w*1.1+.12,z,.17);}
// drum pavilion: laterite drum, dark relief band, tile cone, 8-post lantern with a dark core, small cone, gilt ball. Returns the top.
function vpDrumHall(x,y,z,R,H,lat,dk,tile){vPst('vpDrumB',x,y,z,R,H,lat);vPst('vpDrumB',x,y+H-1.3,z,R+.08,.7,dk);vPst('vpDrumB',x,y+H-.3,z,R*1.04,.3,lat);
 const rb=R+.85,rt=R*.42,rh=R*.36;kput('vpTileCone',[x,y+H,z],null,[rb,rh+rt*.0+R*.02,rb],tile);   // the cone is a frustum in the source; a cone whose tip is buried under the lantern floor reads the same
 vPst('vpDrumB',x,y+H+rh*.7,z,rt+.3,.35,dk);const lr=rt*.82,lh=R*.3+.9;for(let i=0;i<8;i++){const a=i/8*TAU;vPst('vpBancoPost',x+Math.cos(a)*lr,y+H+rh*.7+.35,z+Math.sin(a)*lr,.16,lh,lat);}
 kput('vpDiscDark',[x,y+H+rh*.7+.35+lh/2,z],qEuler(Math.PI/2,0,0),[lr*.5,lr*.5,lh],null);kput('vpTileCone',[x,y+H+rh*.7+.35+lh,z],null,[rt+.9,R*.28+.6,rt+.9],tile.clone().multiplyScalar(.9));
 const top=y+H+rh*.7+.35+lh+R*.28+.6;vBall('vpGilt',x,top+.2,z,.24);return top;}

function buildVpChapterhouse(G,o){reseed(7811+(o.v|0));
 const och=vC(vPick([0xc89a62,0xbc8e58,0xd4a66e])),och2=och.clone().multiplyScalar(.9),dk=vC(0x8a6a48),lat=vC(vPick([0xb4683e,0xa85c36,0xc07448])),lat2=lat.clone().multiplyScalar(.8),tile=vC(vPick([0xb8633a,0xa85832,0xc47044])),pave=vC(0xd8cdb4),plank=vC(0x8a6c48),white=vC(0xf2eee2);
 const lit=vLit();const Y0=.45;
 vnReg('Chapterhouse of the Order of Historians',0,0,24.5,21,{role:'chapterhouse'});
 // plinth: a low battered banco platform the whole compound stands on, with a mosaic dado along its front
 kput('vpBanco7',[0,0,0],null,[36,Y0,30],dk);
 for(let k=0;k<12;k++){const x=-13.2+k*2.4;if(Math.abs(x)<3.6)continue;vB('vpMosaicB',x,.06,14.85,2.3,.32,.16,0,null);}
 // ================================================================ the reading hall (back), battered block with parapet, pilasters, toron, mosaic string course
 const HW=22,HD=11,HH=8.6,hz=-8.5;
 kput('vpBanco7',[0,Y0,hz],null,[HW,HH,HD],och);
 {const tw=vpBat7(HW,HH,HH)*2,td=vpBat7(HD,HH,HH)*2;vB('vpBancoB',0,Y0+HH-.05,hz,tw+.3,.5,td+.3,0,dk);                     // dark eaves band
  vB('vpBancoB',0,Y0+HH+.45,hz,tw+.1,.9,.6,0,och);vB('vpBancoB',0,Y0+HH+.45,hz-td/2+.3,tw+.1,.9,.6,0,och);              // parapet: front + back
  for(const s of[-1,1])vB('vpBancoB',s*(tw/2-.25),Y0+HH+.45,hz,.6,.9,td-.4,0,och);vB('vpBancoB',0,Y0+HH+.45,hz+td/2-.3,tw+.1,.9,.6,0,och);
  vB('vpBancoB',0,Y0+HH+.45,hz,tw-1.4,.12,td-1.4,0,vC(0xb89a6e));                                                             // roof deck
  for(let vx=0;vx<5;vx++)for(let vz=0;vz<2;vz++)vBall('vLeaf',-8+vx*4,Y0+HH+.95,hz-3+vz*6,.42,vC((vx+vz)%2?0xb8633a:0x98764e),.5);   // pots along the roof terrace
  // mosaic string course below the eaves and a whitewash band at the floor line: the Order's blue-and-white
  const my=Y0+HH-1.6,mw=vpBat7(HW,HH,HH-1.6)*2,md=vpBat7(HD,HH,HH-1.6)*2;vB('vpMosaicB',0,my,hz+md/2-.1,mw+.2,.5,.3,0,null);vB('vpMosaicB',0,my,hz-md/2+.1,mw+.2,.5,.3,0,null);
  for(const s of[-1,1])vB('vpMosaicB',s*(mw/2-.1),my,hz,.3,.5,md+.2,0,null);
  vB('vpBancoB',0,Y0+.02,hz,HW+.3,.9,HD+.3,0,white);}
 // pilaster-buttresses with pinnacles: 7 across the front (the middle three frame the porch), 7 behind, 3 each side, corners heavier
 {const zf=hz+HD/2,zb=hz-HD/2;for(let i=0;i<=6;i++){const x=-HW/2+HW*i/6,k=(i===0||i===6)?1.5:1.15;if(Math.abs(x)<4)continue;vpPinnacle(x,Y0,zf+.35,k,HH+1.4,och2);vpPinnacle(x,Y0,zb-.35,k,HH+1.4,och2);}
  for(let j=1;j<3;j++){const z=zb+HD*j/3;vpPinnacle(-HW/2-.35,Y0,z,1.15,HH+1.4,och2);vpPinnacle(HW/2+.35,Y0,z,1.15,HH+1.4,och2);}
  // toron rows between the pilasters, two heights, all four faces (the face recedes with height)
  for(const yy of[4.9,7.9]){const zf2=hz+vpBat7(HD,HH,yy),zb2=hz-vpBat7(HD,HH,yy),xw=vpBat7(HW,HH,yy);
   for(let i=0;i<6;i++){const x0=-HW/2+HW*i/6+.9,x1=-HW/2+HW*(i+1)/6-.9;if(Math.abs((x0+x1)/2)<4&&yy<6)continue;vpTorons(x0,zf2,x1,zf2,Y0+yy,3,0,1);vpTorons(x0,zb2,x1,zb2,Y0+yy,3,0,-1);}
   for(let j=0;j<3;j++){const z0=zb2+HD*j/3+.7,z1=zb2+HD*(j+1)/3-.7;vpTorons(xw,z0,xw,z1,Y0+yy,3,1,0);vpTorons(-xw,z0,-xw,z1,Y0+yy,3,-1,0);}}
  // the porch: three nested parabolic archivolts (banco · mosaic · banco) stepping in to the doors, between the two middle pilasters
  const pz=zf+vpBat7(HD,HH,0)-HD/2;   // = face at the base
  kput('vpBayArchB',[0,Y0,pz+1.9],null,[1.7,1.6,2.0],och2);kput('vpBayArchM',[0,Y0,pz+1.15],null,[1.45,1.42,1.2],null);kput('vpBayArchB',[0,Y0,pz+.45],null,[1.25,1.27,.9],och);
  vB('vpBancoB',0,Y0+6.4,pz+1.1,6.0,.5,2.8,0,dk);vB('vpBancoB',0,Y0+6.9,pz+1.1,5.4,.6,2.2,0,och2);vpRoundWin(0,Y0+7.5,pz+2.52,0,.5,och2,lit);
  for(const s of[-1,1])vpPinnacle(s*3.1,Y0,pz+2.6,1.1,7.3,och2);
  vB('vDarkB',0,Y0,pz-.3,2.9,3.9,.8,0);for(const s of[-1,1])kput('vWood',[s*.72,Y0+1.95,pz-.1],vQ(0,0,0).multiply(qEuler(0,s*.25,0)),[1.4,3.8,.08],plank);
  for(let i=0;i<3;i++)for(let j=0;j<5;j++)for(const s of[-1,1])vB('vIron',s*(.3+i*.42),Y0+.5+j*.75,pz+.02,.09,.09,.08,0,vC(0xb08a3a));   // brass studs
  vB('vpBancoB',0,Y0,pz+2.9,5.6,.14,1.4,0,dk);   // threshold slab
  if(lit){vnLamp(-2.5,Y0+4.4,pz+2.9,0);vnLamp(2.5,Y0+4.4,pz+2.9,0);}
  // windows: tall paired reading-hall windows either side of the porch, round windows above; sides and back likewise
  for(const s of[-1,1])for(const x of[5.4,9.2]){vpYWin(s*x,Y0+1.6,hz+vpBat7(HD,HH,1.6),0,1.0,2.6,och2,lit);vpRoundWin(s*x,Y0+6.2,hz+vpBat7(HD,HH,6.2),0,.5,och2,lit);}
  for(const s of[-1,1])for(const z of[-2.6,0,2.6]){vpYWin(s*vpBat7(HW,HH,1.6),Y0+1.6,hz+z,s*Math.PI/2,1.0,2.4,och2,lit);vpRoundWin(s*vpBat7(HW,HH,5.6),Y0+5.6,hz+z,s*Math.PI/2,.45,och2,lit);}
  for(const x of[-8,-4,0,4,8])vpYWin(x,Y0+1.8,hz-vpBat7(HD,HH,1.8),Math.PI,1.0,2.2,och2,false);for(const x of[-6,0,6])vpRoundWin(x,Y0+5.8,hz-vpBat7(HD,HH,5.8),Math.PI,.5,och2,lit);}
 // the great drum over the hall: laterite, round windows, tile cone, lantern
 {const top=vpDrumHall(0,Y0+HH+.5,hz,4.8,3.6,lat,dk,tile);
  for(let k=0;k<6;k++){const a=k/6*TAU+Math.PI/6;vpRoundWin(Math.sin(a)*4.8,Y0+HH+2.3,hz+Math.cos(a)*4.8,a,.5,lat2,lit);}
  for(let k=0;k<12;k++){const a=k/12*TAU;vBeam([Math.sin(a)*4.6,Y0+HH+3.0,hz+Math.cos(a)*4.6],[Math.sin(a)*5.5,Y0+HH+2.95,hz+Math.cos(a)*5.5],.16,vC(0x4a3624));}   // toron ring under the eaves
  void top;}
 // stair up to the roof terrace on the right flank, as a Yuni roof is living space
 {const sx=HW/2+1.2;for(let i=0;i<12;i++)vB('vpBancoB',sx,Y0+i*.7,hz+4.2-i*.72,1.3,.7,.75,0,och2);vB('vpBancoB',sx+.75,Y0,hz+.2,.25,HH+.9,9.0,0,och2);}
 // ================================================================ the wings: archive stacks (left), scriptorium (right) — battered ranges with parabolic arcades to the court
 for(const s of[-1,1]){const wx=s*15.3,WW=5.2,WD=11,wz=1.5,WH=4.6;kput('vpBanco7',[wx,Y0,wz],null,[WW,WH,WD],och);
  const tw=vpBat7(WW,WH,WH)*2,td=vpBat7(WD,WH,WH)*2;vB('vpBancoB',wx,Y0+WH-.05,wz,tw+.25,.4,td+.25,0,dk);vB('vpBancoB',wx,Y0+WH+.35,wz,tw,.6,td,0,och);vB('vpBancoB',wx,Y0+WH+.35,wz,tw-1.0,.7,td-1.0,0,vC(0xb89a6e));
  for(let j=0;j<=3;j++)vpPinnacle(wx+s*(WW/2+.3),Y0,wz-WD/2+WD*j/3,.95,WH+1.1,och2);
  for(const yy of[3.5]){const xo=wx+s*vpBat7(WW,WH,yy);for(let j=0;j<3;j++)vpTorons(xo,wz-WD/2+WD*j/3+.6,xo,wz-WD/2+WD*(j+1)/3-.6,Y0+yy,3,s,0);}
  for(const z of[-3.5,0,3.5])vpYWin(wx+s*vpBat7(WW,WH,2.0),Y0+1.3,wz+z,s*Math.PI/2,.8,1.5,och2,lit);   // outer face: small windows
  vB('vpMosaicB',wx+s*(vpBat7(WW,WH,WH-.3)),Y0+WH-.5,wz,.26,.4,td-.6,0,null);
  // arcade: 3 parabolic bays on the court side carrying a flat roof back to the wing; lit doors behind
  const ax=wx-s*(WW/2+1.6);for(let j=0;j<3;j++){const z=wz-WD/2+WD*(j+.5)/3;kput('vpBayArchB',[ax,Y0,z],qEuler(0,s*Math.PI/2,0),[WD/3/3.2*1.02,1.0,1.0],och2);
   const bx=wx-s*vpBat7(WW,WH,1.2);if(j===1){vB('vDarkB',bx,Y0,z,.3,2.5,1.6,0);kput('vWood',[bx+s*.02,Y0+1.25,z],qEuler(0,Math.PI/2,0),[1.5,2.4,.08],plank);if(lit)vnLamp(bx,Y0+3.0,z,-s*Math.PI/2);}
   else vpYWin(bx,Y0+1.5,z,-s*Math.PI/2,1.0,1.6,och2,lit);}
  vB('vpBancoB',(ax+wx)/2,Y0+4.0,wz,Math.abs(wx-ax)+.6,.45,WD+.2,0,och2);vB('vpBancoB',(ax+wx)/2,Y0+4.45,wz,Math.abs(wx-ax)+.2,.35,WD-.2,0,dk);
  for(let j=0;j<=3;j++)vpTorons(ax-s*.2,wz-WD/2+WD*j/3,ax-s*.2,wz-WD/2+WD*j/3,Y0+3.5,1,-s,0,.7);
  // drum pavilion at the wing's front end (the chapter house's paired drums flank the gate)
  const dz=wz+WD/2+3.0,dx=s*14.6;vpDrumHall(dx,Y0,dz,3.1,6.4,lat,dk,tile);
  for(const a of[0.55,1.2].map(v=>s<0?Math.PI-v:v))vpRoundWin(dx+Math.cos(a)*3.1,Y0+4.4,dz+Math.sin(a)*3.1,Math.PI/2-a,.55,lat2,lit);
  {const a=s<0?-.4:Math.PI+.4;vB('vDarkB',dx+Math.cos(a)*3.05,Y0,dz+Math.sin(a)*3.05,1.3,2.3,.3,Math.PI/2-a);kput('vWood',[dx+Math.cos(a)*2.98,Y0+1.15,dz+Math.sin(a)*2.98],qEuler(0,Math.PI/2-a,0),[1.2,2.2,.08],plank);}
  for(let k=0;k<10;k++){const a=k/10*TAU+.15;vBeam([dx+Math.cos(a)*2.95,Y0+2.6,dz+Math.sin(a)*2.95],[dx+Math.cos(a)*3.85,Y0+2.55,dz+Math.sin(a)*3.85],.15,vC(0x4a3624));}}
 // ================================================================ the forecourt wall and the gate
 {const gz=13.4,GW=7.0;for(const s of[-1,1]){const x0=s*(GW/2+.2),x1=s*11.4,L=Math.abs(x1-x0),cx=(x0+x1)/2;vB('vpBancoB',cx,Y0,gz,L,3.4,.7,0,och);vB('vpBancoB',cx,Y0+3.3,gz,L+.2,.35,.95,0,dk);
   // carved glyph panels with mosaic diamonds along the wall, as the source's forecourt wall carries
   for(let g=0;g<3;g++){const x=x0+(x1-x0)*(g+.5)/3;vB('vpBancoB',x,Y0+.5,gz+.4,1.9,2.3,.16,0,och2);kput('vpMosaicB',[x,Y0+1.65,gz+.52],vQ(0,0,Math.PI/4),[.9,.9,.1],null);vB('vpBancoB',x,Y0+.5,gz-.4,1.9,2.3,.16,0,och2);}}
  // gate: a parabolic arch slab between two pylons with pinnacles, a relief band and a round window above the arch; lamps
  kput('vpGateArchB',[0,Y0,gz],null,[1,1,1],och2);vB('vpBancoB',0,Y0+6.5,gz,7.4,.4,2.0,0,dk);vB('vpBancoB',0,Y0+6.9,gz,6.6,.7,1.6,0,och);
  kput('vpArchRingM',[0,Y0,gz+.95],null,[1,1,1],null);kput('vpArchRingB',[0,Y0,gz-.9],null,[1,1,1],dk);   // archivolts: mosaic to the street, dark banco to the court
  for(const s of[-1,1]){vpPinnacle(s*4.1,Y0,gz,1.7,7.6,och2);if(lit){vnLamp(s*2.6,Y0+4.2,gz+.8,0);}}
  for(let k=0;k<3;k++)vB('vpBancoB',0,Y0-(k+1)*.15,gz+1.2+k*.5,6.4-k*.4,.15,.6,0,dk);   // steps down to the street
  for(const s of[-1,1])vnLampPost(s*5.6,0,gz+2.4,3.6);
  vpHang(-4.1,Y0+6.2,gz+.92,0,1.1,2.6,vC(0x2a6ab0));vpHang(4.1,Y0+6.2,gz+.92,0,1.1,2.6,vC(0xffffff,1.6));}   // the Order's blue and white on the pylons
 // ================================================================ the court: paving, reflecting pool, a gnomon, planters, lamps, a bench, folk
 vnPaving(0,Y0+.02,4,20,16,0,pave,40);vB('vFlag',0,Y0+.03,6.5,3.6,.1,13,0,pave.clone().multiplyScalar(.92));
 {const px=-6,pz=5;vB('vpBancoB',px,Y0,pz,5.2,.55,5.2,0,lat);vB('vpBancoB',px,Y0+.55,pz,5.6,.15,5.6,0,dk);vB('vpMosaicB',px,Y0+.2,pz,4.4,.4,4.4,0,null);
  mesh(new THREE.BoxGeometry(4.3,.06,4.3),MAT.glass,G,px,Y0+.62,pz);}
 {const gx=6.5,gz2=5.5;vB('vpBancoB',gx,Y0,gz2,2.6,.5,2.6,0,och2);vB('vpBancoB',gx,Y0+.5,gz2,2.0,.4,2.0,0,dk);vBeam([gx,Y0+.9,gz2],[gx+1.1,Y0+3.6,gz2-.3],.1,vC(0xb08a3a),'vIron');
  for(let k=0;k<7;k++)vB('vpMosaicB',gx-1.2+k*.4,Y0+.5,gz2+1.3,.3,.06,.3,0,null);}
 for(const x of[-9,9]){vB('vpBancoB',x,Y0,10.5,2.6,.6,1.2,0,lat);for(let k=0;k<3;k++)kput('vLeaf',[x+rr(-.8,.8),Y0+.75,10.5+rr(-.3,.3)],null,[rr(.3,.5),rr(.3,.45),rr(.3,.5)],vC(vPick([0x5e7444,0x6a7e4c,0x7a8a58])));}
 for(const x of[-4,4])vB('vpBancoB',x,Y0,-1.6,3.0,.5,.8,0,och2);   // benches before the porch
 for(const s of[-1,1])vnLampPost(s*8.5,Y0,1,3.4);
 // ================================================================ the bell tower: Sankore-type pyramid bristling with toron, a second stage, cone and gilt ball, the bell in an opening
 {const tx=-15.2,tz=-11.2,TW=5.6,TH=13.5;kput('vpBanco5',[tx,Y0,tz],null,[TW,TH,TW],och);const hw=y=>TW/2*(1-.45*y/TH);
  kput('vpBanco5',[tx,Y0+TH,tz],null,[TW*.55,4.4,TW*.55],och2);const hw2=y=>TW*.55/2*(1-.45*y/4.4);
  kput('vpBancoCone',[tx,Y0+TH+4.3,tz],null,[.95,2.2,.95],och2);vBall('vpGilt',tx,Y0+TH+6.7,tz,.3);
  for(const q of[[-1,-1],[1,-1],[-1,1],[1,1]])kput('vpBancoCone',[tx+q[0]*(TW*.55/2+.35),Y0+TH-.1,tz+q[1]*(TW*.55/2+.35)],null,[.3,.9,.3],och2);
  for(let r=0;r<7;r++){const y=2.6+r*1.6,h=hw(y),n=Math.max(1,Math.floor(2*h/1.25));for(let i=0;i<n;i++){const o=(i-(n-1)/2)*1.15+((r%2)?.25:0)*(n>1?1:0);
   const c=vC(0x4a3624);vBeam([tx+o,Y0+y,tz+h-.3],[tx+o,Y0+y-.05,tz+h+.85],.16,c);vBeam([tx+o,Y0+y,tz-h+.3],[tx+o,Y0+y-.05,tz-h-.85],.16,c);vBeam([tx+h-.3,Y0+y,tz+o],[tx+h+.85,Y0+y-.05,tz+o],.16,c);vBeam([tx-h+.3,Y0+y,tz+o],[tx-h-.85,Y0+y-.05,tz+o],.16,c);}}
  for(let r=0;r<2;r++){const y=TH+1.2+r*1.5,h=hw2(y-TH);for(const nn of[[0,1],[0,-1],[1,0],[-1,0]])vBeam([tx+nn[0]*(h-.3),Y0+y,tz+nn[1]*(h-.3)],[tx+nn[0]*(h+.75),Y0+y-.05,tz+nn[1]*(h+.75)],.14,vC(0x4a3624));}
  // bell opening on the front face of the upper stage, with the bell
  {const y=TH+1.6,h=hw2(y-TH);vB('vDarkB',tx,Y0+y,tz+h-.2,1.1,1.5,.5,0);kput('vpBrassBell',[tx,Y0+y+.95,tz+h-.1],null,[.4,.5,.4],null);vB('vIron',tx,Y0+y+1.36,tz+h-.1,1.2,.08,.08,0,vC(0x3a2f22));}
  vB('vDarkB',tx,Y0+7.6,tz+hw(7.6)-.15,.5,1.1,.4,0);vB('vDarkB',tx+hw(4.5)-.15,Y0+4.5,tz,.4,1.1,.5,0);
  vB('vDarkB',tx,Y0,tz+hw(0)-.3,1.2,2.2,.8,0);kput('vWood',[tx,Y0+1.1,tz+hw(0)+.1],null,[1.1,2.1,.08],plank);vB('vpBancoB',tx,Y0+2.2,tz+hw(0)+.1,1.9,.3,.5,0,dk);
  if(lit)vnLamp(tx+1.1,Y0+2.7,tz+hw(0)+.02,0);}
 // a low archive annex behind the hall on the right (the stacks overflow), flat-roofed with pinnacles and a hatch
 {const ax=15.6,az=-9,AW=5.2,AD=7.4,AH=3.4;kput('vpBanco7',[ax,Y0,az],null,[AW,AH,AD],och2);vB('vpBancoB',ax,Y0+AH-.05,az,AW*.94,.4,AD*.94,0,dk);vB('vpBancoB',ax,Y0+AH+.3,az,AW*.9,.5,AD*.9,0,och2);
  for(const s of[-1,1])vpPinnacle(ax+AW/2+.2,Y0,az+s*(AD/2-.2),.9,AH+1.0,och2);vpTorons(ax+vpBat7(AW,AH,2.4),az-3.0,ax+vpBat7(AW,AH,2.4),az+3.0,Y0+2.4,5,1,0,.8);
  for(const z of[-2.2,2.2])vpYWin(ax+vpBat7(AW,AH,1.6),Y0+1.6,az+z,Math.PI/2,.8,1.0,och2,false);vB('vDarkB',ax-vpBat7(AW,AH,1.1)+.1,Y0,az+2.6,.3,2.2,1.1,0);}
 vnFolk(0,7,4,3);vnFolk(0,17.5,3,2);}

VERN.def({key:'port_order_chapterhouse',name:'Order Chapterhouse',family:'ported',tags:{culture:'yuni-order',type:['civic','religious'],wealth:'civic',lit:true,role:'chapterhouse'},w:38,d:34,h:21,build:buildVpChapterhouse});
