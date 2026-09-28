// ================================================================= DALAB — the sacred: temples, priests' houses, the mounds, a shrine
// The priests commune with The God from the tops of dome-shaped earth mounds built in imitation of the Ancient
// domes. Each outlying settlement has one; the High Priest's is larger, ringed by an earthwork, and faces AWAY from
// the lab (the layout pass orients them; here the front is +z and the stair climbs it). On a mound stands a stone
// temple with a relief-carved trilithon door, a stepped cornice, a shingle pyramid, banners, an altar that burns at
// night, and two four-armed giant guards; beside it the priest's round stone house.

// the temple, at scale s, standing on the ground at (x,y,z) facing ry. Reusable by the mound builders.
function dnTemple(x,y,z,ry,s,o){o=o||{};const deco=o.deco!==false;const st=o.stoneC||(deco?dCol(DPAL.sacred):dCol(DPAL.stone)),tr=deco?dCol(DPAL.trim):null,sh=dCol(DPAL.shingle);const W=10*s,D=8*s,H=4.6*s;
 const L=(lx,lz)=>loc(x,z,lx,lz,ry);const plat=deco?dCol(DPAL.trim,.92):st.clone().multiplyScalar(.9);
 // stepped platform, three courses (cream when deco), stair down the front, checker paving on the top course
 let yy=y;for(let k=0;k<3;k++){const o2=(2-k)*1.1*s;vB('vStone',x,yy,z,W+2*o2+2*s,.45*s,D+2*o2+2*s,ry,plat);yy+=.45*s;}
 {const p=L(0,D/2+1.6*s+2.2*s);vnStairs(p[0],y,p[1],ry,3.4*s,yy-y,4,'vStone',plat);}
 if(deco){const p=L(0,D/2+1.0*s);dnChecker(p[0],yy+.02,p[1],W+1.6*s,2.0*s,ry);}
 vB('vStone',x,yy,z,W,H,D,ry,st);
 // bands: a fret plinth band (colour when deco), the mural frieze, a cream string course under it
 {const f=L(0,D/2);if(deco)dnFretBand(f[0],yy+.3*s,f[1],ry,W-3.2*s,1.0*s);else dnReliefBand(f[0],yy+.3*s,f[1],ry,W-1.2*s,1.0*s,st);dnMuralBand(f[0],yy+H-2.0*s,f[1],ry,W-4.2*s,1.5*s);}
 for(const sd of[-1,1]){const f=L(sd*W/2,0);if(deco)dnFretBand(f[0],yy+.3*s,f[1],ry+sd*Math.PI/2,D-3.2*s,1.0*s);else dnReliefBand(f[0],yy+.3*s,f[1],ry+sd*Math.PI/2,D-1.2*s,1.0*s,st);dnMuralBand(f[0],yy+H-2.0*s,f[1],ry+sd*Math.PI/2,D-4.2*s,1.5*s);}
 if(deco)dnTrimBand(x,yy+H-2.15*s,z,W,D,ry,.14*s);
 // deco piers with avatar panels flanking the door and at the corners
 // (piers sit at the corners, outside the window jambs and the plinth band; windows sit below the frieze)
 if(deco){for(const lx of[-W/2+.55*s,W/2-.55*s]){const f=L(lx,D/2);dnDecoPanel(f[0],yy+.5*s,f[1],ry,.9*s,H-.9*s);}
  for(const sd of[-1,1])for(const lz of[-D/2+.55*s,D/2-.55*s]){const f=L(sd*W/2,lz);dnDecoPanel(f[0],yy+.5*s,f[1],ry+sd*Math.PI/2,.9*s,H-.9*s);}}
 const c1=dnCornice(x,yy+H,z,W,D,ry,st,2,tr);vB('vStone',x,c1,z,W-.6*s,.5*s,D-.6*s,ry,tr||st.clone().multiplyScalar(.85));
 // the stepped crest on the front parapet (deco), then the shingle pyramid and its finial
 if(deco){const c=L(0,D/2-1.0*s);dnCrest(c[0],c1+.5*s,c[1],W*.6,ry,st);}
 kput('vPyrSh',[x,c1+.5*s,z],ry?qEuler(0,ry,0):null,[W-1.4*s,3.2*s,D-1.4*s],sh);vPst('vPost',x,c1+3.4*s,z,.1*s,1.6*s,vC(0x5a4632));vBall('dGiltBall',x,c1+5.0*s,z,.32*s);
 {const g=L(0,D/2+.1);dnGate(g[0],yy,g[1],ry,2.0*s,3.2*s,st,tr);const d=L(0,D/2);vnDoor(d[0],yy,d[1],ry,1.8*s,3.0*s,'vStone',tr||st,vC(0x2a2a30),false);
  for(const lx of[-3.0*s,3.0*s]){const w=L(lx,D/2);if(o.lit!==false)dnGodWin(w[0],yy+1.0*s,w[1],ry,1.0*s,1.4*s,'vStone',tr||st);else vnWin(w[0],yy+1.0*s,w[1],ry,1.0*s,1.4*s,'open','vStone',st);}
  for(const sd of[-1,1])for(const lz of[-2*s,2*s]){const w=L(sd*W/2,lz);if(o.lit!==false)dnGodWin(w[0],yy+1.0*s,w[1],ry+sd*Math.PI/2,1.0*s,1.4*s,'vStone',tr||st);}
  for(const lx of[-2.3*s,2.3*s]){const l=L(lx,D/2);if(o.lit!==false)dnGodLamp(l[0],yy+3.9*s,l[1],ry);}}
 // banners at the platform corners, the altar, the giant guards, the priest
 for(const sd of[-1,1]){const p=L(sd*(W/2+2.6*s),D/2+2.6*s);dnBannerPole(p[0],y,p[1],ry,6.5*s,dCol(sd<0?DPAL.gold:DPAL.turq));}
 {const a=L(0,D/2+4.4*s+2.6*s);dnAltar(a[0],y,a[1],ry,st);}
 for(const sd of[-1,1]){const g=L(sd*2.4*s,D/2+3.8*s+2.6*s);dnGiant(g[0],y,g[1],ry+sd*.25,4,{spear:true});}
 {const p=L(1.2*s,D/2+6.5*s+2.6*s);dnPriest(p[0],y,p[1],ry+Math.PI);}
 return{top:c1+5.2*s,plat:yy};}
// the priest's house: a round terracotta house with a cream fret band, a shingle cone with a gilt finial, God-lit
function dnPriestHouse(x,y,z,ry,r){r=r||3.4;const st=dCol(DPAL.sacred),tr=dCol(DPAL.trim);
 dnRoundHouse(x,y,z,r,2.9,{wall:'dStoneDrum',wallC:st,roof:'shingle',rise:r*1.1,door:ry,doorW:1.1,doorH:2.1,frame:'vStone',win:[ry+Math.PI*.6,ry-Math.PI*.6],lit:true,band:null,wood:tr,leafC:vC(0x2a2a30)});
 dnDrum('dStoneDrum',x,y+2.9-1.3,z,r+.04,.9,tr);for(let k=0;k<8;k++){const a=k/8*TAU+ry+.2;if(Math.abs(((a-ry)%TAU+TAU)%TAU)<.35)continue;const p=dnOnRing(x,z,r+.04,a);dnFretBand(p[0],y+2.9-1.2,p[1],a,.7,.7);}
 dnDrum('dStoneDrum',x,y+.35,z,r+.04,.28,tr);
 const p=dnOnRing(x,z,r,ry);dnGodLamp(p[0],y+2.5,p[1],ry);}

function buildDalabTemple(G,o){reseed(8601+(o.v|0));vnReg("Priests' temple",0,0,10,12);dnTemple(0,0,0,0,1,{});vnPaving(0,.02,12,6,4,0,dCol(DPAL.stone),8);dnFolk(0,15,3,2);}
function buildDalabPriestHouse(G,o){reseed(8611+(o.v|0));vnReg("Priest's house",0,0,5.5,8);dnPriestHouse(0,0,0,0,3.4);dnJar(4.6,0,1,.3);vnPaving(0,.02,5,2.6,2.4,0,dCol(DPAL.stone),4);dnPriest(1.5,0,6,Math.PI);}
// wayside shrine: a stele, a banner, an offering slab, a God-post
function buildDalabShrine(G,o){reseed(8621+(o.v|0));const st=dCol(DPAL.sacred);vnReg('Wayside shrine',0,0,3.5,5,{type:['religious']});
 vB('vStone',0,0,0,4,.4,4,0,dCol(DPAL.trim));dnChecker(0,.42,0,3.4,3.4,0);dnStele(0,.4,-.8,0,3.4,st,true);vB('vStone',0,.4,1.0,1.8,.5,.9,0,st);for(let k=0;k<4;k++)vBall('vGourd',-.6+k*.4,.9,1.0,.14,dCol([0xb08a4a,0x8a9a3a,0xc09a5a]),.18);
 dnBannerPole(-1.6,.4,-1.4,0,4.2,dCol(DPAL.red));dnGodPost(1.6,.4,-1.4,3.2);dnFolk(0,3.5,1,.5);}

// the ceremonial mound of an outlying settlement: r 30, plateau r 13, h 13; the temple and the priest's house on top;
// a stele-lined apron and a small plaza at the foot
function buildDalabMound(G,o){reseed(8631+(o.v|0));const R=30,RT=13,H=13;const st=dCol(DPAL.stone);
 vnReg('Ceremonial mound',0,0,R+4,H+14,{landmark:true});
 dnMound(0,0,R,RT,H,0,{stoneC:st});
 dnTemple(0,H,-3.5,0,.72,{stoneC:st});
 dnPriestHouse(-8.5,H,4.5,Math.PI*.6,2.6);
 for(let k=0;k<6;k++){const a=k/6*TAU+.3;if(Math.abs(a-Math.PI*.5)<.4||Math.abs(a-TAU+.3)<.5)continue;const p=dnOnRing(0,0,RT-.8,a);if(Math.abs(p[0])<3&&p[1]>4)continue;dnBannerPole(p[0],H,p[1],a,5.5,dCol([DPAL.red,DPAL.turq,DPAL.gold][k%3]));}
 // the plaza at the foot: paving, a stele pair, a fire, the folk gathering to watch the ceremony
 vnPaving(0,.02,R+9,16,8,0,st.clone().multiplyScalar(.92),18);dnFirePit(0,0,R+11,.9);dnFolk(0,R+9,6,4);dnPriest(0,H,RT+.5-1,0);}
// the High Priest's mound: r 46, plateau r 20, h 20 with a terrace ring; a greater temple and two halls on top; the
// ring earthwork (r 68, h 4.5, palisaded) with one entrance at the front
function buildDalabHighMound(G,o){reseed(8641+(o.v|0));const R=46,RT=20,H=20;const st=dCol(DPAL.stone);
 vnReg("High Priest's mound",0,0,R+4,H+18,{landmark:true,role:'high priest'});vnReg("High Priest's ring",0,0,74,6,{part:'wall',type:['religious','military']});
 dnMound(0,0,R,RT,H,0,{stoneC:st,terrace:{r:56,h:5}});
 dnTemple(0,H,-6,0,1.0,{stoneC:st});
 dnPriestHouse(-13,H,6,Math.PI*.55,3.2);dnPriestHouse(13,H,6,-Math.PI*.55,3.2);
 for(let k=0;k<8;k++){const a=k/8*TAU+.2;const p=dnOnRing(0,0,RT-1.2,a);if(Math.abs(p[0])<5&&p[1]>8)continue;if(p[1]<-12)continue;dnStele(p[0],H,p[1],a+Math.PI,2.8,st);}
 dnRingBank(0,0,68,4.5,9,0,10,{palisade:true});
 for(const s of[-1,1]){dnStele(s*7.5,0,68+6,0,3.6,dCol(DPAL.sacred),true);dnGiant(s*4,0,68+3,s*.2,4,{spear:true});}
 vnPaving(0,.02,R+12,18,10,0,st.clone().multiplyScalar(.92),20);dnFirePit(0,0,R+14,1.0);dnFolk(0,R+11,6,5);
 dnFolk(0,62,4,3);}

// the Palace mound: the High Priest's palace BUILT INTO the front of a mound. Three battered stone ranges are cut
// into the slope, each with its own paved landing and balustrade in front of it; the stair climbs the axis from the
// ground to the first landing, then a pair of side flights from each landing to the next (past the ends of the
// range above), and a last pair up to the plateau, where the palace hall (a greater temple) and two wings stand.
// The great trilithon door into the mound's heart is on the lowest range; the relief bands stop clear of the
// doors. The flanks are terraced gardens: contour beds behind low retaining walls, planted from the lowlands
// biome (skirt palms, ember manzanita, pompom cycads, young jacarandas and ringbarks; shrubs, azaleas, agaves,
// aloes, yuccas, golden grass, toyon, ferns).
function buildDalabPalaceMound(G,o){reseed(8651+(o.v|0));const R=42,RT=18,H=17;const st=dCol(DPAL.sacred),stD=dCol(DPAL.trim,.92),tr=dCol(DPAL.trim),sh=dCol(DPAL.shingle),grey=dCol(DPAL.stone);
 vnReg("High Priest's palace mound",0,0,R+4,H+18,{landmark:true,role:'palace'});
 const M=dnMound(0,0,R,RT,H,0,{stoneC:grey,noStair:true});const pf=M.prof;
 // the terraces: [face radius, depth, height, width]; the landing in front of each is (range width + 9) wide
 const TERR=[[33.5,6.5,4.2,26],[29,6,4.0,20],[25,5.5,3.8,16]];
 const yfs=TERR.map(T=>pf(T[0]));const LW=TERR.map((T,i)=>i===0?T[3]+9:TERR[i-1][3]+9);const SX=TERR.map(T=>T[3]/2+2.6);
 const LD=3.8;                                                                        // landing depth
 // ground apron and the axial flight to the first landing
 vnPaving(0,.02,R+5,16,8,0,grey.clone().multiplyScalar(.92),18);dnChecker(0,.03,R+5,5,8,0);dnStele(-3.6,0,R+3.6,0,3.2,st,true);dnStele(3.6,0,R+3.6,0,3.2,st,true);
 dnFlight(0,0,R+3,0,yfs[0],TERR[0][0]+LD,4.6,grey,-1);
 TERR.forEach((T,i)=>{const [rf,depth,hh,ww]=T;const yf=yfs[i];const zc=rf-depth/2;const lw=LW[i];
  // the landing: a stone platform faced down to the slope, paved, with a balustrade on its front edge and ends
  const yb=pf(rf+LD+1.5)-1.2;vB('vStone',0,yb,rf+LD/2,lw,yf-yb,LD,0,grey.clone().multiplyScalar(.9));dnChecker(0,yf+.02,rf+LD/2,lw-1,LD-.6,0);
  const gaps=i===0?[[-2.6,2.6]]:[[-SX[i-1]-2.6,-SX[i-1]+2.6],[SX[i-1]-2.6,SX[i-1]+2.6]];
  let xs=-lw/2+.3;const zf=rf+LD-.2;for(const g of gaps){dnBalustrade(xs,yf,zf,g[0],yf,zf,tr);xs=g[1];}dnBalustrade(xs,yf,zf,lw/2-.3,yf,zf,tr);
  for(const sd of[-1,1])dnBalustrade(sd*(lw/2-.3),yf,zf,sd*(lw/2-.3),yf,rf-.5,tr);
  // the range: buried at the back, battered face, relief either side of the door, a colonnade, a corniced parapet
  vB('vStone',0,yf-.3,zc,ww,hh+.3,depth,0,st);
  for(const sd of[-1,1])dnFretBand(sd*(ww/4+1.4),yf+.4,rf,0,ww/2-3.2,1.0);for(const sd of[-1,1])dnDecoPanel(sd*(ww/2-1.1),yf+.4,rf,0,.9,hh-.8);
  const c=dnCornice(0,yf+hh,zc,ww,depth,0,st,2,tr);vB('vStone',0,c,zc,ww-.8,.5,depth-.8,0,stD);if(i===2)dnCrest(0,c+.5,zc,ww*.55,0,st);
  for(const sd of[-1,1])for(let k=0;k<3;k++){const x=sd*(3.4+k*3.6);if(Math.abs(x)>ww/2-1.2)continue;dnGodWin(x,yf+1.6,rf,0,1.0,1.5,'vStone',st);}
  for(const sd of[-1,1])for(let k=0;k<Math.floor((ww/2-3)/3.6)+1;k++){const x=sd*(3.6+k*3.6);if(Math.abs(x)>ww/2-1)continue;vPst('vPostS',x,yf,rf+1.6,.26,hh-.4,tr);}
  vB('vStone',0,yf+hh-.5,rf+1.0,ww+.4,.4,2.6,0,tr);
  for(const sd of[-1,1])dnGodLamp(sd*2.6,yf+3.2,rf,0);
  if(i===0){dnGate(0,yf,rf+.45,0,2.6,4.0,st,tr);vnDoor(0,yf,rf+.12,0,2.4,3.8,'vStone',st,vC(0x2a2a30),false);dnGiant(-4.6,yf,rf+2.6,.2,4,{spear:true});dnGiant(4.6,yf,rf+2.6,-.2,4,{spear:true});}
  else{vnDoor(0,yf,rf+.12,0,1.8,3.0,'vStone',tr,vC(0x2a2a30),false);vB('vStone',0,yf+3.0,rf+.14,2.6,.3,.5,0,tr);dnFretBand(0,yf+3.35,rf,0,2.8,.5);}
  for(const sd of[-1,1])dnBanner(sd*(ww/2-1.5),yf+hh-.2,rf+.3,0,.9,2.6,dCol(sd<0?DPAL.gold:DPAL.turq));
  // the side flights up to the next landing (or the plateau), on solid stone walls
  const sx=SX[i];const next=i<TERR.length-1?{y:yfs[i+1],z:TERR[i+1][0]+LD}:{y:H,z:RT-1.5};
  for(const sd of[-1,1])dnFlight(sd*sx,yf,rf+LD-2.2,sd*sx,next.y,next.z,4.0,grey,yf-1.2);});
 // the plateau: a rim balustrade across the front between the last flights, the palace hall and its wings
 {const sx=SX[2];dnBalustrade(-sx+2.4,H,RT-1.5,sx-2.4,H,RT-1.5,tr);for(const sd of[-1,1])vB('vStone',sd*(sx+2.2),H-.05,RT-1.6,1.0,1.4,1.0,0,tr),vBall('dGiltBall',sd*(sx+2.2),H+1.5,RT-1.6,.16);dnChecker(0,H+.02,RT-6,12,8,0);}
 dnTemple(0,H,-7,0,1.05,{stoneC:st});
 for(const sd of[-1,1]){const wx=sd*12.5,wz=-2;vB('vStone',wx,H,wz,7,4.4,12,0,st);dnFretBand(wx,H+.3,wz+6,0,5.5,.9);dnDecoPanel(wx-sd*3.5,H+.5,wz-4.5,-sd*Math.PI/2,.9,3.4);const c=dnCornice(wx,H+4.4,wz,7,12,0,st,2,tr);
  vnPyrRoof('vPyrSh',wx,c,wz,7,12,2.2,0,sh,.3);for(const z of[-1,3])dnGodWin(wx-sd*3.5,H+1.6,wz+z,-sd*Math.PI/2,1.0,1.4,'vStone',tr);
  vnDoor(wx-sd*3.5,H,wz+6-2.5,-sd*Math.PI/2,1.3,2.5,'vStone',tr,vC(0x2a2a30),false);}
 for(let k=0;k<6;k++){const a=k/6*TAU+.5;const p=dnOnRing(0,0,RT-1.4,a);if(p[1]>9&&Math.abs(p[0])<5)continue;dnBannerPole(p[0],H,p[1],a,5.5,dCol([DPAL.red,DPAL.turq,DPAL.gold][k%3]));}
 // THE GARDENS: contour beds on both flanks (bearings 42..142 degrees off the front), each a low retaining wall of
 // stone along the arc with a flat turf bed behind it, planted from the lowlands biome
 BIO.cur='lowlands/garden';
 const BEDS=[39.5,35.5,31.5,27.5,23.5];const wallC=grey.clone().multiplyScalar(.95);
 BEDS.forEach((rho,bi)=>{const yb=pf(rho);const inner=rho-2.8;
  for(const sd of[1]){const a0=.74,a1=TAU-.74;const n=Math.round((a1-a0)*rho/2.2);
   for(let k=0;k<n;k++){const a=sd*(a0+(a1-a0)*(k+.5)/n);const p=dnOnRing(0,0,rho+.25,a);const yw=pf(rho+1.4)-.3;vB('vStone',p[0],yw,p[1],(a1-a0)*rho/n+.1,yb+.55-yw,.5,a,wallC);   // retaining wall
    const q=dnOnRing(0,0,rho-1.4,a);vB('dTurf',q[0],yb-1.4,q[1],(a1-a0)*rho/n+.15,1.42,2.8,a,dCol(DPAL.turf));}                             // the bed
   // plants: a small tree every ~9 m of arc, ground plants every ~2.4 m
   const L=(a1-a0)*rho;const nt=Math.round(L/9),np=Math.round(L/2.4);const TREES=['skirtpalm','manzanita','pompom','jacaranda','ringbark','manzanita','skirtpalm'];const TS={skirtpalm:.75,manzanita:.8,pompom:.8,jacaranda:.42,ringbark:.55};
   for(let k=0;k<nt;k++){const a=sd*(a0+(a1-a0)*(k+.5)/nt+rr(-.04,.04));if(Math.abs(a-Math.PI)<.12)continue;/* the back flight */const p=dnOnRing(0,0,inner+1.1,a);const sp=TREES[(k+bi)%TREES.length];dnTree(sp,p[0],yb,p[1],{scale:TS[sp]*rr(.85,1.1)});}
   const PL=['shrub','azalea','agave','grassgold','aloe','toyon','yucca','fern','shrub','blooms','grass','pincushion'];
   for(let k=0;k<np;k++){const a=sd*(a0+(a1-a0)*(k+.3+rng()*.4)/np);const p=dnOnRing(0,0,inner+.6+rng()*1.6,a);const kind=PL[(k*5+bi*3)%PL.length];dnPlant(kind,p[0],yb+.02,p[1],{k:kind==='shrub'?.7:undefined});}}});
 BIO.cur=null;
 // garden stairs: a narrow flight on each flank from the ground to the lowest bed, and between beds
 for(const a of[1.62,-1.62,Math.PI]){let prevR=R+2.5,prevY=0;for(const rho of BEDS){const p0=dnOnRing(0,0,prevR,a),p1=dnOnRing(0,0,rho-1.2,a);dnFlight(p0[0],prevY,p0[1],p1[0],pf(rho)+.02,p1[1],1.6,grey,prevY-.6);prevR=rho-2.4;prevY=pf(rho)+.02;}}
 // the back flight ends at a small viewing platform on the plateau rim
 {const p=dnOnRing(0,0,RT-3,Math.PI);dnChecker(p[0],H+.02,p[1],5,4,0);dnBalustrade(p[0]-2.5,H,p[1]-2,p[0]+2.5,H,p[1]-2,tr);dnStele(p[0]-3,H,p[1],Math.PI,2.6,st,true);dnStele(p[0]+3,H,p[1],Math.PI,2.6,st,true);}
 vnPaving(0,.02,R+12,20,10,0,grey.clone().multiplyScalar(.92),22);dnFirePit(0,0,R+14,1.0);dnFolk(0,R+11,6,5);dnPriest(0,H,RT-3,0);dnFolk(-6,yfs[0],TERR[0][0]+2,2,1.4);}
// a priests' compound at ground level: a stone ring wall round three priests' houses, a chapel drum, a stele court,
// a garden, God-posts; the priests who serve a settlement live here below the mound
function buildDalabPriestCompound(G,o){reseed(8661+(o.v|0));const R=22;const st=dCol(DPAL.stone),sc=dCol(DPAL.sacred),tr=dCol(DPAL.trim),sh=dCol(DPAL.shingle),wood=dCol(DPAL.wood);
 vnReg("Priests' compound",0,0,R+2,12);vnReg("Priests' compound wall",0,0,R+1,4,{part:'wall'});
 dnRingWall(0,0,0,R,3.4,0,4.4,'vStone',sc,1.0);dnGate(0,0,R+.3,0,3.8,4.0,sc,tr);
 vnPaving(0,.02,0,R*1.5,R*1.5,0,st.clone().multiplyScalar(.92),50);dnChecker(0,.03,R-8,4.6,16,0);dnChecker(0,.03,9,14,4,0);
 dnPriestHouse(-11,0,-6,Math.PI*.35,3.4);dnPriestHouse(11,0,-6,-Math.PI*.35,3.4);dnPriestHouse(0,0,-14,0,3.0);
 // the chapel: a stone drum with a relief band, a shingle cone, an altar before it
 dnDrum('dStoneDrumB',0,0,2,4.6,5,sc);dnDrum('dStoneDrum',0,3.3,2,4.42,1.2,tr);for(let k=0;k<10;k++){const a=k/10*TAU+.3;const p=dnOnRing(0,2,4.44,a);dnFretBand(p[0],3.45,p[1],a,.9,.9);}dnMuralRing(0,1.0,2,4.6,1.3);dnDrum('dStoneDrum',0,.4,2,4.62,.3,tr);
 kput('dConeSh',[0,4.7,2],null,[5.6,4.6,5.6],sh);vBall('dGiltBall',0,9.2,2,.3);for(const sd of[-1,1]){const p=dnOnRing(0,2,4.62,sd*.55);dnDecoPanel(p[0],.8,p[1],sd*.55,.8,2.2);}
 vnDoor(0,0,6.6,0,1.4,2.6,'vStone',st,vC(0x2a2a30),false);dnGodLamp(-1.6,3.2,6.6,0);dnGodLamp(1.6,3.2,6.6,0);for(const a of[Math.PI*.5,-Math.PI*.5]){const p=dnOnRing(0,2,4.6,a);dnGodWin(p[0],2.2,p[1],a,.9,1.4,'vStone',st);}
 dnAltar(0,0,11,0,st);
 for(let k=0;k<6;k++){const a=k/6*TAU+.52;const p=dnOnRing(0,0,R-4,a);if(p[1]>R-8)continue;dnStele(p[0],0,p[1],a+Math.PI,3.0,sc,true);}
 vnPlanter(-12,0,6,5,1.4,0,wood);vnPlanter(12,0,6,5,1.4,0,wood);vnPlanter(-12,0,9.5,5,1.4,0,wood);vnPlanter(12,0,9.5,5,1.4,0,wood);
 dnGodPost(-4,0,15,4);dnGodPost(4,0,15,4);dnGodPost(-4,0,R+1.5,3.6);dnGodPost(4,0,R+1.5,3.6);
 dnPriest(-3,0,13,.5);dnPriest(3,0,9,-1.2);dnPriest(0,0,-8,Math.PI);dnFolk(0,R+5,3,2);}
// the healers' hall: where Dalab's prized healers treat the townsfolk — a long stone hall with a God-lit ward, a herb
// garden, a drum dispensary, a queue of the sick on benches
function buildDalabHealers(G,o){reseed(8671+(o.v|0));const W=20,D=9,H=4.4,Y0=.6;const st=dCol(DPAL.stone),stD=st.clone().multiplyScalar(.85),sh=dCol(DPAL.shingle),wood=dCol(DPAL.wood);
 vnReg("Healers' hall",0,0,15,H+8);
 dnPlatform(0,0,0,W+8,D+8,Y0,0);vnStairs(0,0,D/2+4+1.0,0,4,Y0,3,'vStone',st);
 vB('vStone',0,Y0,0,W,H,D,0,st);dnReliefBand(0,Y0+.3,D/2,0,W-1.5,.9,st);dnMuralBand(0,Y0+H-1.9,D/2,0,W-4,1.5);
 const c=dnCornice(0,Y0+H,0,W,D,0,st,2);vnHipRoof('vHipS',0,c,0,W,D,2.8,0,sh,.4);
 dnGate(0,Y0,D/2+.1,0,2.0,3.2,st);vnDoor(0,Y0,D/2,0,1.8,3.0,'vStone',st,vC(0x2a2a30),false);
 for(const x of[-8,-5.6,-3.2,3.2,5.6,8])dnGodWin(x,Y0+1.6,D/2,0,1.1,1.6,'vStone',st);for(const s of[-1,1])for(const z of[-2.5,2.5])dnGodWin(s*W/2,Y0+1.6,z,s*Math.PI/2,1.0,1.5,'vStone',st);
 for(const x of[-2.6,2.6])dnGodLamp(x,Y0+3.6,D/2,0);
 // the dispensary drum at one end, the herb garden at the other
 dnDrum('dStoneDrumB',W/2+3.2,Y0,-1,2.8,4.0,st);kput('dConeSh',[W/2+3.2,Y0+3.7,-1],null,[3.4,2.8,3.4],sh);const dp=dnOnRing(W/2+3.2,-1,2.8,.9);vnDoor(dp[0],Y0,dp[1],.9,1.0,2.0,'vStone',st,vC(0x2a2a30),false);
 for(let k=0;k<4;k++)vnPlanter(-W/2-3.2,Y0,-3+k*2.2,2.6,1.2,0,wood);
 // benches for the sick, a brazier, the healers in white
 for(let k=0;k<3;k++)vB('vWood',-4+k*4,Y0+.4,D/2+2.4,2.8,.1,.4,0,wood);dnFolk(-4,D/2+2.6,2,1.2,Y0);dnFolk(4,D/2+2.6,2,1.2,Y0);dnFirePit(-8,Y0,D/2+3,.6);
 dnPriest(1.2,Y0,D/2+1.6,Math.PI);dnPriest(-6,Y0,D/2+.8,-.6);dnGodPost(-6,0,D/2+6,3.6);dnGodPost(6,0,D/2+6,3.6);dnFolk(0,D/2+9,3,2);}

dDef({key:'dalab_temple',name:"Priests' temple",family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true},w:26,d:30,h:14,build:buildDalabTemple});
dDef({key:'dalab_priest_house',name:"Priest's house",family:'sacred',tags:Object.assign({wealth:'priest',lit:true},{type:['single-family dwelling','religious']}),w:14,d:14,h:8,build:buildDalabPriestHouse});
dDef({key:'dalab_shrine',name:'Wayside shrine',family:'sacred',tags:{type:['religious'],wealth:'priest',lit:true},w:8,d:8,h:5,build:buildDalabShrine});
dDef({key:'dalab_mound',name:'Ceremonial mound',family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true,landmark:true},w:76,d:90,h:28,build:buildDalabMound});
dDef({key:'dalab_high_mound',name:"High Priest's mound",family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true,landmark:true,role:'high priest'},w:160,d:170,h:40,build:buildDalabHighMound});
dDef({key:'dalab_palace_mound',name:"High Priest's palace mound",family:'sacred',tags:{type:['religious','civic'],wealth:'priest',lit:true,landmark:true,role:'palace'},w:100,d:110,h:36,build:buildDalabPalaceMound});
dDef({key:'dalab_priest_compound',name:"Priests' compound",family:'sacred',tags:{type:['religious','single-family dwelling'],wealth:'priest',lit:true},w:52,d:52,h:12,build:buildDalabPriestCompound});
dDef({key:'dalab_healers',name:"Healers' hall",family:'civic',tags:{type:['civic','religious'],wealth:'civic',lit:true,role:'healers'},w:36,d:28,h:13,build:buildDalabHealers});
