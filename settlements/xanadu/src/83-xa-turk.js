// ================================================================= XANADU — the Turkish note (package X-J, round 5)
// Travis: a temple straight from the Ortaköy mosque; houses and shops straight from the old Turkish mansion — the
// konak with its tiled hip roof on wide eaves, timber cumbas with arched tops, tile panels between the windows,
// iron balconies; the timber corner house with an octagonal bay over glazed-tile bands — and the street lights of
// the lanes: wicker basket lanterns and open umbrellas hung on wires between the buildings. Seeds 32000–32199.

// ---------------------------------------------------------------- shared bits of the Turkish houses (prefix xnXT)
const XTURK={tile:0xb8563a,tile2:0xa84a32,timber:0xb87030,timberD:0x7a4a22,cream:0xefe4c8,ochre:0xd8b070,sage:0x8aa08a,brick:0xa8804e,iron:0x2e2a26};
// a red clay-tiled hip roof on very wide eaves, with rafter ends showing under the eave and a chimney
function xnXTRoof(x,y,z,w,d,ry,c,over,rise){over=over||1.5;rise=rise||Math.min(w,d)*.28;const tim=xC(XTURK.timberD);
 const n=Math.round(w/.7),m=Math.round(d/.7);for(let i=0;i<=n;i++)for(const s of[-1,1]){const p=loc(x,z,-w/2+w*i/n,s*(d/2+over-.5),ry);vB('vWood',p[0],y-.18,p[1],.12,.14,over+.2,ry,tim);}
 for(let j=0;j<=m;j++)for(const s of[-1,1]){const p=loc(x,z,s*(w/2+over-.5),-d/2+d*j/m,ry);vB('vWood',p[0],y-.18,p[1],over+.2,.14,.12,ry,tim);}
 vB('vWood',x,y-.04,z,w+2*over,.08,d+2*over,ry,xC(XTURK.timber));vnHipRoof('xHipT',x,y+.4,z,w,d,rise,ry,c||xC(XTURK.tile),over);
 vB('xPaint',x,y+.4+rise-.1,z,w>=d?w-d+.6:.4,.2,w>=d?.4:d-w+.6,ry,xC(XTURK.tile2));}
// a round-arched window: an arched dark recess in a stone or painted surround, glazing bars, a keystone
function xnXTArchWin(x,y,z,ry,w,h,c,kind,lit){const f=loc(x,z,0,.03,ry);vB(lit?'vWinLit':'vWinGlass',f[0],y,f[1],w,h-.1,.1,ry);
 kput('xArcDark',[f[0],y+h-w/2-.1,f[1]],qEuler(0,ry,0),[w,w/2+.1,.1]);
 const p=loc(x,z,0,.1,ry);for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.07),.1,ry);vB(kind||'vStone',q[0],y-.05,q[1],.14,h-w/2+.05,.18,ry,c);}
 kput('xArcP',[p[0],y+h-w/2-.14,p[1]],qEuler(0,ry,0),[w+.28,w/2+.32,.18],c);kput('xArcDark',[loc(x,z,0,.12,ry)[0],y+h-w/2-.1,loc(x,z,0,.12,ry)[1]],qEuler(0,ry,0),[w,w/2+.1,.12]);
 vB(kind||'vStone',p[0],y-.14,p[1],w+.34,.12,.26,ry,c);vB('vWood',p[0],y,p[1],.05,h-.1,.08,ry,c);for(const t of[.33,.66])vB('vWood',p[0],y+(h-.1)*t,p[1],w,.05,.08,ry,c);
 vB('xPaint',p[0],y+h-.08,p[1],.22,.3,.2,ry,c.clone().multiplyScalar(1.15));}
// a timber bay (the Turkish cumba) with ARCHED windows in a close row, tile panels in the aprons, a moulded sill
function xnXTBay(x,y,z,ry,w,h,d,c,winC,tileItem){xnCumba(x,y,z,ry,w,h,d,{item:'vPlaster',c,beamC:xC(XTURK.timberD),winC,n:1,valC:false,kind:'glass'});
 const wn=Math.max(2,Math.round(w/1.3)),ww=Math.min(1.0,w/wn-.35);
 for(let i=0;i<wn;i++){const f=loc(x,z,-w/2+w*(i+.5)/wn,d,ry);xnXTArchWin(f[0],y+h*.3,f[1],ry,ww,h*.5,winC,'vWood');
  if(tileItem){const t=loc(x,z,-w/2+w*(i+.5)/wn,d+.03,ry);kput(tileItem,[t[0],y+h*.15,t[1]],qEuler(0,ry,0),[ww+.2,h*.2,1],null);}}
 const s=loc(x,z,0,d+.05,ry);vB('vWood',s[0],y+h*.28,s[1],w+.2,.12,.16,ry,xC(XTURK.timberD));}
// an iron balcony on carved brackets: deck, scrolled railing of bars, a flower box
function xnXTBalcony(x,y,z,ry,w,d,c){const iron=xC(XTURK.iron);const bc=loc(x,z,0,d/2,ry);vB('vStone',bc[0],y-.16,bc[1],w,.16,d,ry,c);
 for(const u of[-w/2+.3,w/2-.3])xnBracket(loc(x,z,u,0,ry)[0],y-.16,loc(x,z,u,0,ry)[1],ry,d*.9,.7,.18,c,'xArmS');
 const rail=(a,b)=>{vBeam([a[0],y+1.0,a[1]],[b[0],y+1.0,b[1]],.05,iron,'vIron');vBeam([a[0],y+.12,a[1]],[b[0],y+.12,b[1]],.04,iron,'vIron');const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(2,Math.round(L/.18));
  for(let k=0;k<=n;k++){const t=k/n;vPst('vPipe',lerp(a[0],b[0],t),y+.12,lerp(a[1],b[1],t),.015,.9,iron);}};
 rail(loc(x,z,-w/2,d,ry),loc(x,z,w/2,d,ry));for(const s of[-1,1])rail(loc(x,z,s*w/2,0,ry),loc(x,z,s*w/2,d,ry));
 const fb=loc(x,z,0,d+.1,ry);vB('vWood',fb[0],y+.9,fb[1],w-.6,.2,.2,ry,xC(XTURK.timberD));for(let k=0;k<Math.round(w*1.6);k++){const p=loc(x,z,rr(-w/2+.4,w/2-.4),d+.12,ry);kput('xLeaf',[p[0],y+1.12,p[1]],null,[.16,.13,.16],xC(0x3f7a34));kput('xPaintBall',[p[0]+rr(-.06,.06),y+1.22,p[1]],null,[.07,.06,.07],xC(xPick([0xd0302a,0xe8a0c0,0xf0e060,0xf0f0f0])));}}
// a stone quay edge with a strip of water in front (the Bosphorus for the showcase)
function xnXTQuay(x,z,w,d){vB('vStone',x,0,z,w,.5,.9,0,xC(xPick(XPAL.stone)));vB('xWaterB',x,-.3,z+d/2+.45,w+6,.3,d,0,xC(0x2a8a9a));for(let k=0;k<Math.round(w/1.4);k++)vPst('vIron',x-w/2+.7+k*1.4,.5,z,.12,.5,xC(XTURK.iron));}

// a great prayer wheel: a maroon drum banded in gold on a gold axle, under a square tiled kiosk on four posts
function xnXTBigWheel(x,z,ry,stone,gold,maroon){vB('vStone',x,0,z,4.2,.5,4.2,ry,stone);for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*1.7,sz*1.7,ry);vPst('xColS',p[0],.5,p[1],.28,3.6,stone);}
 vPst('xGold',x,.5,z,.14,3.6,gold);vPst('xDrumM',x,1.0,z,1.3,2.6,maroon);for(const yy of[1.0,2.2,3.4])vPst('xDiscG',x,yy,z,1.36,.2,gold);
 for(let k=0;k<8;k++){const a=k/8*TAU;vB('xGoldB',x+Math.sin(a)*1.32,1.9,z+Math.cos(a)*1.32,.3,.5,.06,a,gold);}
 vB('vWood',x,4.1,z,4.4,.3,4.4,ry,xC(XTURK.timberD));vnHipRoof('xHipT',x,4.4,z,4.0,4.0,1.3,ry,xC(XTURK.tile),.6);vBall('xGold',x,5.75,z,.22,gold);}
// ---------------------------------------------------------------- the temple after Ortaköy
function buildXaTempleOrtakoy(G,o){reseed(32001+(o.v|0));const V=xV(o),W=19,H=15,lit=xLit();
 const stone=xC(xPick([0xefe8d8,0xe8e0cc,0xf2ece0])),lead=xC(V===1?0xd0a040:V===2?0x2a4aa8:0x2aa5a0),gold=xC(xPick(XPAL.gold)),iron=xC(XTURK.iron),maroon=xC(xPick(XPAL.maroon)),ochre=xC(xPick(XPAL.ochre)),trimC=xC(xPick([XPAL.turquoise,XPAL.lapis,XPAL.red]));
 vnReg('Temple after Ortaköy',0,-2,13,H+14);vnReg('Temple after Ortaköy — pavilion',-16,3,9,10);vnReg('Temple after Ortaköy — prayer wheel',W/2+3.6,-2+W/2+3.6,2.2,6);
 // the terrace, the quay and the water in front
 xnPave(0,4,52,30,0,stone,2.6);xnXTQuay(0,19,52,10);
 // the hall: a square block of pale stone; on every face a great arch holding a tall window between two lesser
 // ones, a second tier of round arches above, pilasters, a moulded cornice
 xnWall(0,0,-2,W,H,W,0,stone,'dressed');vB('vStone',0,H-.3,-2,W+.6,.4,W+.6,0,stone.clone().multiplyScalar(1.05));
 for(let k=0;k<4;k++){const a=k*Math.PI/2;const f=loc(0,-2,0,W/2,a);const F=(u,v)=>loc(f[0],f[1],u,v,a);
  const g=F(0,.02);kput('xArchS',[g[0],1.2,g[1]],qEuler(0,a,0),[9,12.6,.6],stone.clone().multiplyScalar(.96));
  xnXTArchWin(F(0,.62)[0],2.2,F(0,.62)[1],a,2.8,7.8,stone,'vStone',lit);for(const s of[-1,1])xnXTArchWin(F(s*2.6,.62)[0],2.2,F(s*2.6,.62)[1],a,1.5,5.4,stone,'vStone',lit);
  for(const s of[-1,1])xnXTArchWin(F(s*6.8,.02)[0],1.6,F(s*6.8,.02)[1],a,1.6,4.6,trimC,'xPaint',lit);
  for(const s of[-1,1])xnXTArchWin(F(s*6.8,.02)[0],8.6,F(s*6.8,.02)[1],a,1.4,3.2,trimC,'xPaint',lit);
  for(const u of[-8.6,-5.2,5.2,8.6]){const p=F(u,.15);vB('xPaint',p[0],0,p[1],.9,H-.4,.3,a,ochre);vB('xGoldB',p[0],H-.9,p[1],1.1,.5,.36,a,gold);}
  for(const s of[-1,1]){const sp=F(s*3.7,.63);kput('xMosA',[sp[0],11.6,sp[1]],qEuler(0,a,0),[1.6,1.6,1],null);}   // mosaic in the spandrels of the great arch
  const sp2=F(0,.63);kput('xMosB',[sp2[0],12.4,sp2[1]],qEuler(0,a,0),[2.6,1.2,1],null);
  const tb=F(0,.16);vB('xTilesB',tb[0],7.2,tb[1],W-1.6,.6,.12,a,xC(xPick(XPAL.tile)));
  const fr=F(0,.2);vB('xFriezeB',fr[0],H-1.2,fr[1],W-1.2,.6,.1,a);}
 // four corner turrets with gold bulbs, the drum with its windows, the great lead dome, the crescent-and-ball finial
 for(const sx of[-1,1])for(const sz of[-1,1]){const tx=sx*(W/2-1.2),tz=-2+sz*(W/2-1.2);vPst('xColS',tx,H-2,tz,1.3,5.6,stone);vB('vStone',tx,H+3.6,tz,3.0,.3,3.0,0,stone);
  kput('xBulbG',[tx,H+3.9,tz],null,[1.3,1.6,1.3],gold);vBall('xGold',tx,H+5.7,tz,.16,gold);}
 const top=xnDome(0,H,-2,7.2,'W',{drum:3.4,drumItem:'xDrumS',drumC:stone,c:lead,fin:3.2});
 vB('xGoldB',0,H+3.4-.3,-2,13.6,.3,13.6,0,gold);
 // the great prayer wheels: one at each corner of the hall, a maroon-and-gold drum as tall as a man and a half
 // turning on a gold axle under its own tiled kiosk; a rail of small wheels along the front terrace between them
 for(const sx of[-1,1])for(const sz of[-1,1])xnXTBigWheel(sx*(W/2+3.6),-2+sz*(W/2+3.6),Math.atan2(sx,sz),stone,gold,maroon);
 xnXDDrums(0,0,-2+W/2+7.5,Math.PI,12,10);
 // colour: pennants along the quay, coloured lamps
 xnPennants([-24,6,17.5],[24,6,17.5],14);
 // the pavilion wing: two storeys of stone with rows of arched windows, a flat roof with a tile coping
 {const X=-16,Z=3,PW=16,PD=10;xnWall(X,0,Z,PW,8.6,PD,0,stone,'dressed');for(const yy of[1.2,5.2])for(let i=0;i<5;i++){const u=-PW/2+PW*(i+.5)/5;xnXTArchWin(X+u,yy,Z+PD/2,0,1.4,2.8,stone,'vStone',lit);xnXTArchWin(X+u,yy,Z-PD/2,Math.PI,1.4,2.8,stone,'vStone',lit);}
  for(const yy of[1.2,5.2])for(const v of[-3,0,3])xnXTArchWin(X-PW/2,yy,Z+v,-Math.PI/2,1.4,2.8,stone,'vStone',lit);
  vB('vStone',X,8.3,Z,PW+.5,.4,PD+.5,0,stone.clone().multiplyScalar(1.05));xnParapet(X,8.7,Z,PW,PD,0,.7,stone);vnDoor(X+3.2,0,Z+PD/2,0,1.6,3,'vStone',stone,xC(XTURK.timberD),true);}
 // the door: a great arch on the front, a flight, lamps, folk
 vnDoor(0,0,-2+W/2+.62,0,2.6,4.2,'xPaint',maroon,xC(XTURK.timberD),false);vB('xGoldB',0,H+3.4,-2,9,.4,9,0,gold);xnFlight(0,0,-2+W/2+.7+1.4,0,6,.5,'vStone',stone);
 if(lit)for(const s of[-1,1]){vnLampPost(s*5,0,-2+W/2+5,3.4);vnLampPost(s*14,0,15,3.4);}vnFolk(0,10,5,4);}

// ---------------------------------------------------------------- Turkish houses
// A — the konak: a stone ground storey with arched windows and a raised door, a rendered upper storey with two
// arched timber bays and a tile panel between them, an iron balcony, the red-tiled hip roof on very wide eaves
function buildXaHouseTurkA(G,o){reseed(32021+(o.v|0));const V=xV(o),W=13,D=10,H1=3.6,H2=3.4,lit=xLit()?'lit':'glass';
 const stone=xC(xPick(XPAL.stone)),wall=xC(xPick([XTURK.cream,XTURK.ochre,XTURK.sage,0xe0c8a0,0xc8d0c0])),tim=xC(XTURK.timberD),win=xC(xPick([XTURK.timber,XTURK.timberD,0x8a6a48])),tile=xC(V===2?XTURK.tile2:XTURK.tile);
 vnReg('Konak (middle)',0,0,9.5,H1+H2+5);
 xnWall(0,0,0,W+.4,.6,D+.4,0,stone,'dressed');vB('vStone',0,.6,0,W,H1,D,0,stone.clone().multiplyScalar(.96));
 vnDoor(-3.6,.6,D/2,0,1.3,2.4,'vStone',stone,tim,false);xnFlight(-3.6,0,D/2+1.1,0,2.2,.6,'vStone',stone);kput('xArcP',[-3.6,.6+2.4,D/2+.1],null,[1.9,.9,.2],stone.clone().multiplyScalar(1.05));
 for(const u of[-.6,1.6,3.8])xnXTArchWin(u,1.5,D/2,0,1.2,2.2,stone,'vStone',lit==='lit');
 for(const s of[-1,1])for(const z of[-3,0,3])xnXTArchWin(s*W/2,1.5,z,s*Math.PI/2,1.1,2.1,stone,'vStone',lit==='lit');
 const Y=.6+H1;vB('vPlaster',0,Y,0,W,H2,D,0,wall);vB('vWood',0,Y-.16,0,W+.5,.22,D+.5,0,tim);
 // the bays: two on the front (three on v3), one on each end; tile panels between
 const bays=V===3?[-4.2,0,4.2]:[-3.4,3.4];for(const u of bays)xnXTBay(u,Y+.15,D/2,0,3.4,H2-.3,1.1,wall,win,'xMosA');
 for(const s of[-1,1])xnXTBay(s*W/2,Y+.15,-1,s*Math.PI/2,3.6,H2-.3,1.0,wall,win,'xMosB');
 if(bays.length===2){xnMural('xMosA',0,Y+.8,D/2+.02,0,1.8,1.6);xnXTBalcony(0,Y+.15,D/2+.02,0,2.6,1.1,stone);vnDoor(0,Y+.15,D/2,0,1.0,2.1,'vWood',tim,tim,false);}
 for(const u of[-3.4,3.4])xnXTArchWin(u,Y+.9,-D/2,Math.PI,1.1,2.0,wall,'vWood',lit==='lit');
 // the roof: the wide-eaved tiled hip, a chimney; v1 a flat roof with a parapet and a rooftop kiosk instead
 if(V===1){xnFlatRoof(0,Y+H2,0,W,D,0,wall,{eave:true,eaveC:tim,parapet:.6});xnPavilion(2,Y+H2+.6-.3,-1,3,2.6,2.4,0,{c:xC(XTURK.timberD),tileC:tile});}
 else{xnXTRoof(0,Y+H2,0,W+.4,D+.4,0,tile,1.5);vB('vStone',3.5,Y+H2+1.4,-2,.8,2.6,.8,0,stone);vB('vStone',3.5,Y+H2+4,-2,1.1,.2,1.1,0,stone);}
 // the garden: a low wall, a tree, planters, a bench
 for(const s of[-1,1])vB('vStone',s*(W/2+2.5),0,D/2+2,.4,1.0,7,0,stone);vB('vStone',0,0,D/2+5.5,W+5,1.0,.4,0,stone);vB('vDarkB',-1.4,0,D/2+5.5,1.8,1.0,.5,0);
 xnTree(W/2+.6,D/2+3.5,4.2);vnPlanter(2.6,0,D/2+1.2,2,.6,0,tim);vB('vWood',-W/2-.8,.45,D/2+3,.5,.08,1.8,0,tim);vnFolk(0,D/2+7,2,1.5);}
// B — the timber corner house: a brick ground storey with big arched windows, two timber storeys above with an
// octagonal bay on the street corner, glazed-tile bands between the storeys and beside the windows, a wide timber
// eave, a flat roof. Rich.
function buildXaHouseTurkB(G,o){reseed(32031+(o.v|0));const V=xV(o),W=12,D=11,H1=3.8,H2=3.4,H3=3.2,lit=xLit()?'lit':'glass';
 const brick=xC(XTURK.brick),tim=xC(xPick([XTURK.timber,0xc08040,0xa86a30])),timD=xC(XTURK.timberD),tile=xC(xPick(XPAL.tile)),stone=xC(xPick(XPAL.stone));
 vnReg('Timber corner house (rich)',0,0,9,H1+H2+H3+3);
 xnWall(0,0,0,W+.4,.5,D+.4,0,stone,'dressed');vB('vStone',0,.5,0,W,H1,D,0,brick);
 for(const u of[-3.6,0])xnXTArchWin(u,1.3,D/2,0,2.4,3.0,tim,'vWood',lit==='lit');vnDoor(3.9,.5,D/2,0,1.4,2.8,'vWood',tim,timD,false);kput('xArcP',[3.9,.5+2.8,D/2+.1],null,[2.1,1.0,.2],tim);xnFlight(3.9,0,D/2+.9,0,2.2,.5,'vStone',stone);
 for(const z of[-3,0,3])xnXTArchWin(W/2,1.3,z,Math.PI/2,2.0,3.0,tim,'vWood',lit==='lit');
 for(const s of[-1,1])vB('xTilesB',0,.5+H1-.5,s*(D/2+.06),W+.2,.5,.1,0,tile);vB('xTilesB',W/2+.06,.5+H1-.5,0,.1,.5,D,0,tile);
 // the timber storeys: board walls in a heavy frame, tile bands at each floor, arched windows with tile jambs
 const Y=.5+H1;for(const [yy,hh] of[[Y,H2],[Y+H2,H3]]){vB('vWood',0,yy,0,W,hh,D,0,tim);vnFrame(0,yy,0,W,hh,D,0,timD,.12);
  for(const u of[-4,-1.5,1])xnXTArchWin(u,yy+.8,D/2+.14,0,1.2,2.2,timD,'vWood',lit==='lit');for(const z of[-3.5,-1,1.5])xnXTArchWin(W/2+.14,yy+.8,z,Math.PI/2,1.2,2.2,timD,'vWood',lit==='lit');
  for(const u of[-2.75,-.25])vB('xMosAB',u,yy+.4,D/2+.15,.5,hh-.6,.06,0);for(const z of[-2.25,.25])vB('xMosAB',W/2+.15,yy+.4,z,.06,hh-.6,.5,0);
  vB('xTilesB',0,yy+hh-.4,D/2+.16,W+.2,.4,.08,0,tile);vB('xTilesB',W/2+.16,yy+hh-.4,0,.08,.4,D+.2,0,tile);}
 // the octagonal corner bay over the street corner, on struts, arched windows on three of its faces
 {const bx=W/2-.4,bz=D/2-.4,R=2.6,yb=Y+.2,hb=H2+H3-.6;const q=qEuler(0,Math.PI/4,0);kput('xOctW',[bx+.6,yb,bz+.6],q,[R,hb,R],tim);kput('xOctP',[bx+.6,yb-.2,bz+.6],q,[R+.2,.22,R+.2],timD);kput('xOctP',[bx+.6,yb+hb,bz+.6],q,[R+.3,.22,R+.3],timD);
  for(const a of[Math.PI/4,0,Math.PI/2]){const ap=R*Math.cos(Math.PI/8);const p=loc(bx+.6,bz+.6,0,ap,a);for(const yy of[yb+.7,yb+H2+.5])xnXTArchWin(p[0],yy,p[1],a,1.2,2.2,timD,'vWood',lit==='lit');
   const t=loc(bx+.6,bz+.6,0,ap+.02,a);kput('xMosB',[t[0],yb+H2-.1,t[1]],qEuler(0,a,0),[1.6,.5,1],null);}
  for(const a of[.2,Math.PI/4,Math.PI/2-.2]){const p=loc(bx+.6,bz+.6,0,R*.9,a),f=loc(bx+.6,bz+.6,0,R*.3,a);xnMember('vWood',[f[0],yb-1.6,f[1]],[p[0],yb-.2,p[1]],.16,.14,xRot(a,[1,0,0]),timD);}   // struts: foot on the wall, head under the bay's edge
  xnMember('vWood',[bx+.6,yb-1.7,bz+.6],[bx+.6,yb-.2,bz+.6],.2,.2,[1,0,0],timD);}
 // the eave and the flat roof (v1: a tiled hip)
 const YT=Y+H2+H3;if(V===1)xnXTRoof(0,YT,0,W,D,0,xC(XTURK.tile),1.4);else{xnEave(0,YT-.65,0,W,D,0,timD,1.1);xnFlatRoof(0,YT,0,W,D,0,tim,{parapet:.5,corner:'pinnacle'});}
 for(let k=0;k<3;k++)vPst('vClayPot',-W/2-.9,0,D/2-1-k*1.1,.32,.6,xC(0x9a5a38));xnTree(-W/2-2.4,D/2+1,3.8);vnFolk(2,D/2+3,2,1.5);}

// ---------------------------------------------------------------- Turkish shops
// A — the shop row: three arched shopfronts in stone with timber-and-glass fronts and awnings, café tables under
// them, a timber bay-window storey above with tile panels and an iron balcony, the tiled hip roof
function buildXaShopTurkA(G,o){reseed(32041+(o.v|0));const V=xV(o),N=V===3?4:3,W=N*5,D=9,H1=3.6,H2=3.2;
 const stone=xC(xPick(XPAL.stone)),wall=xC(xPick([XTURK.cream,XTURK.ochre,XTURK.sage,0xc8b8a0])),tim=xC(XTURK.timberD),win=xC(xPick([XTURK.timber,0x8a6a48])),tile=xC(XTURK.tile),iron=xC(XTURK.iron);
 vnReg('Turkish shop row',0,0,9.5,H1+H2+5);
 vB('vStone',0,0,0,W,H1,D,0,stone.clone().multiplyScalar(.96));vB('vStone',0,0,0,W+.4,.3,D+.4,0,stone);
 const bw=W/N;for(let i=0;i<N;i++){const x=-W/2+bw*(i+.5);xnArch('xArchS',x,.3,D/2,0,bw-.4,H1-.4,.5,stone,{});
  vB('vWood',x,.3,D/2+.2,bw*.6,.1,.1,0,tim);vB('vWinGlass',x+bw*.15,.4,D/2+.18,bw*.3,2.0,.08,0);vB('vWood',x+bw*.15,2.4,D/2+.2,bw*.3+.1,.12,.12,0,tim);   // the glazed shopfront and the door beside it
  vnDoor(x-bw*.18,.3,D/2+.2,0,.95,2.1,'vWood',tim,xC(xPick([XTURK.timber,0x2a5aa8,0x2f7a4a])),false);
  vnAwning(x,H1-.55,D/2+.3,0,bw-.9,1.8,xC(xPick([0xa8382a,0x2f7a4a,0xe8a030,0x1e3f8a])));
  // café tables and chairs under the awning
  for(const t of[-1,1]){const tx=x+t*1.1,tz=D/2+1.6;vPst('vPipe',tx,0,tz,.03,.72,iron);vPst('xDisc',tx,.72,tz,.32,.03,xC(0xf4efe4));for(const s of[-1,1])vB('vWood',tx+s*.5,.42,tz,.36,.04,.36,0,xC(0x3f7a34));}
  const sg=loc(x,D/2,bw/2-.3,.06,0);vB('xPaint',sg[0],H1-.9,sg[1],.9,.5,.06,0,xC(xPick([0xa8382a,0x1e3f8a,0xf2c12e])));}
 // the storey above: rendered, a timber bay over every shop, tile panels between, an iron balcony on the middle one
 const Y=H1;vB('vPlaster',0,Y,0,W,H2,D,0,wall);vB('vWood',0,Y-.16,0,W+.5,.22,D+.5,0,tim);
 for(let i=0;i<N;i++){const x=-W/2+bw*(i+.5);if(i===Math.floor(N/2)&&V!==2){xnXTBalcony(x,Y+.15,D/2+.02,0,2.6,1.1,stone);vnDoor(x,Y+.15,D/2,0,1.0,2.1,'vWood',tim,tim,false);xnMural('xMosA',x,Y+2.4,D/2+.02,0,2.0,.5);}
  else xnXTBay(x,Y+.15,D/2,0,bw-1.4,H2-.3,1.0,wall,win,'xMosA');}
 for(const s of[-1,1])xnXTArchWin(s*W/2,Y+.8,-1,s*Math.PI/2,1.2,2.0,wall,'vWood',false);
 if(V===1)xnFlatRoof(0,Y+H2,0,W,D,0,wall,{eave:true,eaveC:tim,parapet:.6,corner:'flag'});else xnXTRoof(0,Y+H2,0,W+.4,D+.4,0,tile,1.4);
 vnFolk(0,D/2+3.5,4,3);}
// B — the corner café: two storeys on a street corner, an arched shopfront on both faces, an octagonal timber
// bay on the upper corner, tables with umbrellas outside, a lantern line to a pole across the lane
function buildXaShopTurkB(G,o){reseed(32051+(o.v|0));const V=xV(o),W=10,D=9,H1=3.4,H2=3.2;
 const stone=xC(xPick(XPAL.stone)),wall=xC(xPick([XTURK.cream,XTURK.ochre,0xd8c0a0])),tim=xC(xPick([XTURK.timber,XTURK.timberD])),timD=xC(XTURK.timberD),tile=xC(V===2?XTURK.tile2:XTURK.tile),iron=xC(XTURK.iron);
 vnReg('Corner café',0,0,8,H1+H2+5);
 vB('vStone',0,0,0,W,H1,D,0,stone.clone().multiplyScalar(.96));vB('vStone',0,0,0,W+.4,.3,D+.4,0,stone);
 for(const u of[-2.6,.4])xnArch('xArchS',u,.3,D/2,0,2.6,H1-.4,.5,stone,{});vB('vWinGlass',-2.6,.4,D/2+.18,1.6,2.0,.08,0);vnDoor(.4,.3,D/2+.2,0,1.0,2.1,'vWood',timD,xC(0x2f7a4a),false);
 for(const z of[-2.5,.5])xnArch('xArchS',W/2,.3,z,Math.PI/2,2.6,H1-.4,.5,stone,{});vB('vWinGlass',W/2+.18,.4,-2.5,.08,2.0,1.6,0);vB('vWinGlass',W/2+.18,.4,.5,.08,2.0,1.6,0);
 vnAwning(-1.1,H1-.55,D/2+.3,0,5.4,1.8,xC(xPick([0xa8382a,0x2f7a4a,0xe8a030])));vnAwning(W/2+.3,H1-.55,-1,Math.PI/2,5,1.6,xC(xPick([0xa8382a,0x2f7a4a,0xe8a030])));
 vB('xPaint',3.6,H1-1.0,D/2+.06,1.6,.6,.06,0,xC(0xa8382a));xnMural('xMosB',-W/2+1.4,1.2,D/2+.02,0,1.2,1.6);
 // above: render, the octagonal corner bay, arched windows, tile band, the roof
 const Y=H1;vB('vPlaster',0,Y,0,W,H2,D,0,wall);vB('vWood',0,Y-.16,0,W+.5,.22,D+.5,0,timD);vB('xTilesB',0,Y+H2-.5,D/2+.06,W,.5,.1,0,xC(xPick(XPAL.tile)));
 for(const u of[-3.2,-.8])xnXTArchWin(u,Y+.9,D/2,0,1.1,2.0,tim,'vWood',false);for(const z of[-2.8,-.4])xnXTArchWin(W/2,Y+.9,z,Math.PI/2,1.1,2.0,tim,'vWood',false);
 {const bx=W/2-.2,bz=D/2-.2,R=2.2,yb=Y+.2,hb=H2-.3;const q=qEuler(0,Math.PI/4,0);kput('xOctW',[bx+.5,yb,bz+.5],q,[R,hb,R],tim);kput('xOctP',[bx+.5,yb-.2,bz+.5],q,[R+.2,.22,R+.2],timD);kput('xOctP',[bx+.5,yb+hb,bz+.5],q,[R+.3,.22,R+.3],timD);
  for(const a of[Math.PI/4,0,Math.PI/2]){const ap=R*Math.cos(Math.PI/8);const p=loc(bx+.5,bz+.5,0,ap,a);xnXTArchWin(p[0],yb+.6,p[1],a,1.1,2.0,timD,'vWood',false);}
  for(const a of[.2,Math.PI/4,Math.PI/2-.2]){const p=loc(bx+.5,bz+.5,0,R*.9,a),f=loc(bx+.5,bz+.5,0,R*.3,a);xnMember('vWood',[f[0],yb-1.5,f[1]],[p[0],yb-.2,p[1]],.16,.14,xRot(a,[1,0,0]),timD);}}
 if(V===1)xnFlatRoof(0,Y+H2,0,W,D,0,wall,{eave:true,eaveC:timD,parapet:.5});else xnXTRoof(0,Y+H2,0,W+.4,D+.4,0,tile,1.3);
 // the terrace: tables with umbrellas on the corner, a lantern line to a pole across the lane
 for(const [tx,tz] of[[-2.8,D/2+2.2],[.4,D/2+2.6],[W/2+2.4,-1.5],[W/2+2.6,1.6]]){vPst('vPipe',tx,0,tz,.03,.72,iron);vPst('xDisc',tx,.72,tz,.36,.03,xC(0xf4efe4));for(const s of[-1,1])vB('vWood',tx+s*.55,.42,tz,.36,.04,.36,0,xC(0x3f7a34));
  vPst('vPipe',tx,.75,tz,.02,1.9,iron);kput('xConeP',[tx,2.55,tz],null,[1.2,.4,1.2],xC(xPick([0xa8382a,0xe8a030,0x2a5aa8,0xf4efe4])));}
 vPst('vPost',W/2+4,0,D/2+4.5,.08,5.2,xC(0x5a4632));xnBasketLights([W/2+.2,Y+H2+.2,D/2+.2],[W/2+4,5.1,D/2+4.5],5);
 vnFolk(1,D/2+4.6,3,2);}

// ---------------------------------------------------------------- the street lights (between buildings)
// A wire from a (local [x,y,z]) to b with n wicker basket lanterns hung on it, each with a warm bulb inside, the wire
// sagging like a catenary. The baskets are inverted tapering cylinders in the wood-stave map, tinted wicker.
function xnBasketLights(a,b,n,cols){cols=cols||[0xc8a068,0xd8b070,0xb89058,0xa87848,0xd0a880];const iron=xC(XTURK.iron);const L=Math.hypot(b[0]-a[0],b[2]-a[2]),sag=Math.min(1.2,L*.06);
 const P=t=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-sag*4*t*(1-t),lerp(a[2],b[2],t)];let pv=P(0);for(let k=1;k<=8;k++){const q=P(k/8);vBeam(pv,q,.02,iron,'vRope');pv=q;}
 for(let k=0;k<n;k++){const t=(k+.5)/n,p=P(t),h=rr(.5,.75),r=rr(.28,.4);vBeam(p,[p[0],p[1]-.35,p[2]],.015,iron,'vRope');
  kput('vBarrel',[p[0],p[1]-.35,p[2]],qEuler(Math.PI,rng()*TAU,0),[r,h,r],xC(cols[k%cols.length]).multiplyScalar(rr(.85,1.1)));   // the basket, mouth down
  vBall('vBulb',p[0],p[1]-.35-h*.7,p[2],.07);}}
// A wire from a to b with n open umbrellas hung from it, canopies up, in the bright colours of the lane.
function xnUmbrellaLights(a,b,n,cols){cols=cols||[0xd04a8a,0x2a5aa8,0xe8a030,0x3fbf4a,0x8a3aa8,0x39b0b8,0xf07aa8,0xf2c12e];const iron=xC(XTURK.iron);const L=Math.hypot(b[0]-a[0],b[2]-a[2]),sag=Math.min(1.0,L*.05);
 const P=t=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-sag*4*t*(1-t),lerp(a[2],b[2],t)];let pv=P(0);for(let k=1;k<=8;k++){const q=P(k/8);vBeam(pv,q,.02,iron,'vRope');pv=q;}
 for(let k=0;k<n;k++){const t=(k+.5)/n,p=P(t),r=rr(.55,.7);const c=xC(cols[(k+Math.floor(rng()*2))%cols.length]);
  kput('xConeP',[p[0],p[1]-.3,p[2]],qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),[r,r*.42,r],c);vPst('vPipe',p[0],p[1]-.95,p[2],.012,.7,iron);vBall('xPaintBall',p[0],p[1]-.98,p[2],.03,iron);}}
// the lane: two Turkish fronts facing each other across a paved lane, basket lines and umbrella lines strung between them
function buildXaLane(G,o){reseed(32071+(o.v|0));const V=xV(o),LW=7;
 vnReg('Lane of lights',0,0,12,12);
 xnPave(0,0,LW,34,0,xC(xPick(XPAL.stone)),1.6);
 xnSub('xa_shop_turk_a',-LW/2-4.5,0,-6,Math.PI/2,{v:(V+1)%5});xnSub('xa_house_turk_a',LW/2+5,0,-7,-Math.PI/2,{v:V%5});xnSub('xa_shop_turk_b',LW/2+4.5,0,9,-Math.PI/2,{v:(V+2)%5});
 const yl=V===2?5.2:6.6;for(let k=0;k<6;k++){const z=-14+k*5.2;const A=[-LW/2,yl+(k%2)*.6,z],B=[LW/2,yl+((k+1)%2)*.6,z];
  if(V===1?k%2===0:(V===2?true:k%2===1))xnUmbrellaLights(A,B,4);else xnBasketLights(A,B,4);}
 xnBasketLights([-LW/2,yl+.4,-14],[-LW/2,yl+.4,12],9);xnUmbrellaLights([LW/2,yl+.4,-14],[LW/2,yl+.4,12],9);
 vnFolk(0,2,4,3);}

XA.def({key:'xa_temple_ortakoy',name:'Temple after Ortaköy',family:'Sacred',tags:{type:['religious'],wealth:'civic',lit:true,landmark:true},w:60,d:44,h:26,fw:22,fd:22,build:buildXaTempleOrtakoy});
XA.def({key:'xa_house_turk_a',name:'Konak',family:'Housing — middle',tags:{type:['single-family dwelling'],wealth:'middle',lit:false},w:22,d:20,h:12,fw:13.4,fd:10.4,build:buildXaHouseTurkA});
XA.def({key:'xa_house_turk_b',name:'Timber corner house',family:'Housing — rich',tags:{type:['single-family dwelling'],wealth:'rich',lit:true},w:20,d:18,h:14,fw:12.4,fd:11.4,build:buildXaHouseTurkB});
XA.def({key:'xa_shop_turk_a',name:'Turkish shop row',family:'Trade',tags:{type:['market/shop','multi-family dwelling'],wealth:'middle',lit:false},w:24,d:18,h:11,fw:15,fd:9,build:buildXaShopTurkA});
XA.def({key:'xa_shop_turk_b',name:'Corner café',family:'Trade',tags:{type:['market/shop','tavern/inn'],wealth:'middle',lit:false},w:20,d:18,h:10,fw:10,fd:9,build:buildXaShopTurkB});
XA.def({key:'xa_lane',name:'Lane of lights',family:'Street',tags:{type:['infrastructure','market/shop'],wealth:'middle',lit:false},w:34,d:40,h:12,fw:30,fd:36,nv:3,eye:[0,20,0,-8],build:buildXaLane});
