// ================================================================= DALAB — building blocks (prefix dn, local frame, y = base)
// Everything here builds in the same LOCAL frame as the Iziz Vernacular helpers (69c): origin at the plot centre on
// the ground, +z the front, metres. A bearing `ry` on a round building means the OUTWARD direction of that point of
// the wall, so the same ry serves vnDoor / vnWin / vnLamp unchanged: the point on a drum of radius r at bearing ry
// is dnOnRing(x,z,r,ry) = loc(x,z,0,r,ry).
//
// Dalab registers through VERN (69c) so the inspector, labels, DOORS and the city placer all work unchanged; dDef
// stamps culture:'dalab'. Tags: type (project list), wealth (peasant|noble|priest|civic, plus the Iziz tiers where a
// building is what an outsider built), lit (true only for priest / noble / civic — The God's light is the priests'
// to give), caste.
function dDef(D){D.tags=Object.assign({culture:'dalab'},D.tags||{});return VERN.def(D);}
const dnOnRing=(x,z,r,ry)=>loc(x,z,0,r,ry);
const dRi=(a,b)=>a+Math.floor(rng()*(b-a+1));
function dnDrum(item,x,y,z,r,h,c){kput(item,[x,y,z],null,[r,h,r],c||null);}

// ---------------------------------------------------------------- The God's light (night) and hearth fire (night)
// A lit window is TWO panes at the same spot — the teal unlit pane the hour shows at night, the dark green glass by
// day — so the schedule in 94-dalab-light.js is a visibility flip, no rebuild. Only ever placed under vLit().
function dnGodWin(x,y,z,ry,w,h,frameItem,c){vnWin(x,y,z,ry,w,h,'glass',frameItem,c);const f=loc(x,z,0,.11,ry);
 vB('dGlow',f[0],y,f[1],w,h,.06,ry);vB('dGlowDay',f[0],y,f[1],w,h,.06,ry);
 const g=loc(x,z,0,.5,ry);kput('dGodHalo',[g[0],y+h/2,g[1]],vQ(ry,0,0),[w*2.4,h*2.2,1],null);}
function dnGodLamp(x,y,z,ry){const a=loc(x,z,0,.05,ry),b=loc(x,z,0,.6,ry);vBeam([a[0],y,a[1]],[b[0],y+.05,b[1]],.05,vC(0x2e2a26),'vIron');
 vB('vIron',b[0],y-.02,b[1],.3,.05,.3,ry,vC(0x2e2a26));vBall('dGodBall',b[0],y-.2,b[1],.14);vBall('dGlassBall',b[0],y-.2,b[1],.14);
 kput('dGodHalo',[b[0],y-.2,b[1]],vQ(ry,0,0),[1.6,1.6,1],null);}
function dnGodPost(x,y,z,h){vPst('vPipe',x,y,z,.07,h,vC(0x2e2a26));vB('vIron',x,y+h,z,.5,.06,.5,0,vC(0x2e2a26));vBall('dGodBall',x,y+h-.2,z,.16);vBall('dGlassBall',x,y+h-.2,z,.16);
 kput('dGodHalo',[x,y+h-.2,z],vQ(0,0,0),[2,2,1],null);kput('dGodHalo',[x,y+h-.2,z],vQ(Math.PI/2,0,0),[2,2,1],null);}
function dnGodStrip(x,y,z,ry,L){const f=loc(x,z,0,.08,ry);kput('dGodStrip',[f[0],y,f[1]],vQ(ry,0,0),[L,1,1],null);kput('dGodHalo',[f[0],y,f[1]],vQ(ry,0,0),[L*1.1,.9,1],null);}
// Firelight in an opening: the kit's own flame + ember cards (69-mat-salvage). Night only. (x,z) ON the face.
function dnHearth(x,y,z,ry,w,h){const f=loc(x,z,0,.08,ry),g=loc(x,z,0,.4,ry);kput('fireWin',[f[0],y+h/2,f[1]],vQ(ry,0,0),[w,h,1],null);
 kput('ember',[g[0],y+h*.6,g[1]],vQ(ry,0,0),[w*3.4,h*3.6,1],null);}
function dnFirePit(x,y,z,s){for(let k=0;k<7;k++){const a=k/7*TAU;kput('vRock',[x+Math.cos(a)*s*.9,y+.12,z+Math.sin(a)*s*.9],qEuler(rng(),rng(),0),[s*.3,s*.22,s*.3],vC(0x6a625a));}
 for(let k=0;k<3;k++)kput('vPost',[x,y+.12,z],qEuler(0,k*1.1,Math.PI/2),[.09,s*1.2,.09],vC(0x3a2a1c));firePit('dalab',x,y+.1,z,s);}

// ---------------------------------------------------------------- relief, murals, banners, gates, steles
// Carved band proud of a face; (x,z) ON the face, ry outward. dRelief tiles 1 m cells.
function dnReliefBand(x,y,z,ry,w,h,c){const f=loc(x,z,0,.07,ry);vB('dRelief',f[0],y,f[1],w,h,.16,ry,c);}
// Painted frieze on a flat face (2 m tile of avatars and heroes).
function dnMuralBand(x,y,z,ry,w,h){const f=loc(x,z,0,.04,ry);vB('dMuralB',f[0],y,f[1],w,h,.06,ry);}
// The same frieze round a drum: flat facets tangent to the wall, one whole tile each.
function dnMuralRing(x,y,z,r,h,c){const n=Math.max(6,Math.round(TAU*r/2.1));for(let k=0;k<n;k++){const a=k/n*TAU;const p=dnOnRing(x,z,r+.05,a);vPl('dMural',p[0],y+h/2,p[1],TAU*(r+.05)/n-.04,h,a,c||null);}}
// A rammed-earth wall band painted in two colours (poor houses: no mural, just a red foot and a turquoise line).
function dnPaintRing(x,y,z,r,h,c){dnDrum('dEarthDrum',x,y,z,r+.03,h,c);}
// Banner hung from a crossbar at (x,y,z); the top is fixed, the foot free. ry = the direction it faces.
function dnBanner(x,y,z,ry,w,h,c){const q=vQ(ry,0,0);kput('dBanner',[x,y-h/2,z],q,[w,h,1],c||dCol(DPAL.red));vB('vWood',x,y-.04,z,w+.3,.08,.08,ry,vC(0x5a4632));}
// Tall pole with a crossbar and a banner beside it; ry = the direction the banner faces.
function dnBannerPole(x,y,z,ry,h,c){vPst('vPost',x,y,z,.09,h,vC(0x5a4632));const p=loc(x,z,.75,0,ry);vB('vWood',p[0],y+h-.3,p[1],1.5,.08,.08,ry,vC(0x5a4632));
 kput('dBanner',[p[0],y+h-.35-h*.2,p[1]],vQ(ry,0,0),[1.0,h*.4,1],c||dCol(DPAL.red));vBall('dGiltBall',x,y+h+.15,z,.14);}
// Tiwanaku cornice: a relief band, then stepped stone courses each further out, then a cap. Returns the top y.
function dnCornice(x,y,z,w,d,ry,c,steps){dnReliefBand(x,y,z+0,0,w,.9,c);   // front only is carved; the sides get the plain courses
 vB('vStone',x,y,z,w+.16,.9,d+.16,ry,c);let yy=y+.9;steps=steps||2;for(let k=0;k<steps;k++){const o=.22+.26*k;vB('vStone',x,yy,z,w+2*o,.36,d+2*o,ry,c);yy+=.36;}
 vB('vStone',x,yy,z,w+.2,.3,d+.2,ry,c.clone().multiplyScalar(1.06));return yy+.3;}
// Trilithon gate (the Gate of the Sun): two monolithic piers, a lintel carrying a relief frieze, a stepped crest.
function dnGate(x,y,z,ry,w,h,c){for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.5),0,ry);vB('vStone',p[0],y,p[1],1.0,h,1.3,ry,c);dnReliefBand(p[0]+0,y+.6,p[1],ry,.7,h-1.2,c);}
 vB('vStone',x,y+h,z,w+2.2,1.1,1.4,ry,c);const f=loc(x,z,0,.7,ry);dnReliefBand(f[0],y+h+.1,f[1],ry,w+1.6,.9,c);
 vB('vStone',x,y+h+1.1,z,w+1.4,.3,1.2,ry,c);vB('vStone',x,y+h+1.4,z,w*.5,.35,1.0,ry,c);vB('vStone',x,y+h+1.75,z,w*.22,.35,.9,ry,c);}
// A carved stele (Ponce monolith): a battered shaft with a relief front and a squared head.
function dnStele(x,y,z,ry,h,c){vB('vStone',x,y,z,1.0,h,.7,ry,c);const f=loc(x,z,0,.35,ry);dnReliefBand(f[0],y+.4,f[1],ry,.7,h-.9,c);vB('vStone',x,y+h,z,1.1,.3,.8,ry,c);
 const g=loc(x,z,0,.4,ry);vB('vDarkB',g[0],y+h-.55,g[1],.5,.25,.05,ry);}
// Altar: a stone table with a brazier (fire by night) in front of a temple door.
function dnAltar(x,y,z,ry,c){vB('vStone',x,y,z,2.2,1.0,1.2,ry,c);dnReliefBand(x,y+.15,z,ry,2.0,.7,c);vB('vStone',x,y+1.0,z,2.5,.2,1.5,ry,c);vPst('vPipe',x,y+1.2,z,.35,.6,vC(0x2e2a26));firePit('dalab',x,y+1.55,z,.7);}

// ---------------------------------------------------------------- the round house
// o: {wall:item, wallC, roof:'thatch'|'shingle'|'scrap'|'tile', rise, roofC, door:ry, win:[ry...], winKind, band:'mural'|'paint'|'relief'|null,
//     hearth:bool, finial:bool, wood:colour, foot:bool}
function dnRoundHouse(x,y,z,r,h,o){o=o||{};const wall=o.wall||'dEarthDrum',wc=o.wallC||dCol(DPAL.earth),wood=o.wood||dCol(DPAL.woodGrey);
 dnDrum(wall,x,y,z,r,h,wc);
 if(o.foot!==false)dnDrum(wall==='dStoneDrum'?'dStoneDrum':'dEarthDrum',x,y-.05,z,r+.1,.45,wall==='dStoneDrum'?wc.clone().multiplyScalar(.85):dCol(DPAL.earthDark));
 const rise=o.rise||r*1.05,rc=o.roofC;
 if(o.roof==='shingle'){kput('dConeSh',[x,y+h-.35,z],null,[r*1.22,rise+.35,r*1.22],rc||dCol(DPAL.shingle));dnDrum('vWood',x,y+h-.55,z,r*1.24,.22,wood);}
 else if(o.roof==='scrap'){kput('dConeScrap',[x,y+h-.3,z],null,[r*1.2,rise+.3,r*1.2],null);for(let k=0;k<Math.round(r*2);k++){const a=rng()*TAU,rr0=rr(r*.3,r*1.0);const t=rr0/(r*1.2);kput('vRock',[x+Math.cos(a)*rr0,y+h-.3+(rise+.3)*(1-t)+.1,z+Math.sin(a)*rr0],qEuler(rng(),rng(),0),[.3,.2,.28],vC(0x6a625a));}}
 else if(o.roof==='tile'){kput('dConeTile',[x,y+h-.35,z],null,[r*1.22,rise+.35,r*1.22],rc||null);dnDrum('vStone',x,y+h-.5,z,r*1.24,.2,wc);}
 else{vnThatchCone(x,y+h,z,r,rise,rc||dCol(DPAL.thatch));}
 if(o.finial!==false){vPst('vPost',x,y+h+rise-.4,z,.07,1.3,vC(0x5a4632));if(o.roof==='thatch'||!o.roof)kput('dConeT',[x,y+h+rise-.5,z],null,[.7,.9,.7],rc||dCol(DPAL.thatch));else vBall('dGiltBall',x,y+h+rise+.9,z,.16);}
 if(o.band==='mural')dnMuralRing(x,y+h-1.55,z,r,1.2);
 else if(o.band==='relief'){dnDrum('dReliefDrum',x,y+h-1.25,z,r+.06,.9,wc);}
 else if(o.band==='paint'){dnDrum('dEarthDrum',x,y+h-.5,z,r+.03,.22,dCol(DPAL.turq));dnDrum('dEarthDrum',x,y+.4,z,r+.03,.5,dCol(DPAL.red));}
 const dr=o.door!==undefined?o.door:0;const dp=dnOnRing(x,z,r,dr);vnDoor(dp[0],y,dp[1],dr,o.doorW||.95,o.doorH||1.9,o.frame||'vWood',wood,o.leafC||vC(0x6a5a48),false);
 (o.win||[]).forEach((wr,i)=>{const p=dnOnRing(x,z,r,wr);if(o.lit)dnGodWin(p[0],y+1.25,p[1],wr,.8,.7,o.frame||'vWood',wood);else vnWin(p[0],y+1.25,p[1],wr,.8,.7,o.winKind||'open',o.frame||'vWood',wood);
  if(o.hearth&&i===0)dnHearth(p[0],y+1.25,p[1],wr,.8,.7);});
 return y+h+rise;}

// ---------------------------------------------------------------- the earth mound
// A dome-shaped ceremonial mound: a turfed lathe (real mesh) whose profile is a smoothstep from the foot radius r
// to a flat plateau of radius rt at height h — flat at the foot and the top, steepest half way, walkable. A stone
// stair with kerbs climbs the front (bearing ry) from an apron to the plateau. Optional o.terrace={r,h}: a lower,
// broader terrace ring round the foot. Returns {top:h, prof(rho)}.
function dnMoundProfile(r,rt,h){return rho=>{if(rho<=rt)return h;if(rho>=r)return 0;const t=1-(rho-rt)/(r-rt);return h*t*t*(3-2*t);};}
function dnMound(x,z,r,rt,h,ry,o){o=o||{};const G=VERN.cur.G;const prof=dnMoundProfile(r,rt,h);
 const mk=(R,RT,H,pf)=>{const pts=[];const N=22;for(let k=0;k<=N;k++){const rho=R-(R-RT)*k/N;pts.push(new THREE.Vector2(rho*(1+(fbm(k*.7,R,3.3,2)-.5)*.02),pf(rho)));}
  pts.push(new THREE.Vector2(RT*.6,H),new THREE.Vector2(0,H));const g=new THREE.LatheGeometry(pts,72);g.computeVertexNormals();return g;};
 mesh(mk(r,rt,h,prof),MAT.dTurfMesh,G,x,-.05,z);
 if(o.terrace){const T=o.terrace;const pf=dnMoundProfile(T.r,r-2,T.h);mesh(mk(T.r,r-2,T.h,pf),MAT.dTurfMesh,G,x,-.06,z);}
 const stC=o.stoneC||dCol(DPAL.stone);
 // the stair: treads every ~0.85 m of radius from an apron outside the foot to the plateau lip
 {const r0=r+2.5,r1=rt-1.0;const n=Math.round((r0-r1)/.85);const base=o.terrace?0:0;
  for(let k=0;k<=n;k++){const rho=r0-(r0-r1)*k/n;const yy=(o.terrace&&rho>r?dnMoundProfile(o.terrace.r,r-2,o.terrace.h)(rho):prof(rho))+(o.terrace&&rho<=r?0:0);
   const p=dnOnRing(x,z,rho,ry);vB('vStone',p[0],Math.max(0,yy-.2),p[1],3.6,.5,1.1,ry,stC);
   if(k%2===0)for(const s of[-1,1]){const q=loc(x,z,s*2.05,rho,ry);vB('vStone',q[0],Math.max(0,yy-.1),q[1],.5,.7,1.0,ry,stC.clone().multiplyScalar(.9));}}
  for(const s of[-1,1]){const q=loc(x,z,s*2.6,r0+.8,ry);dnStele(q[0],0,q[1],ry,3.2,stC);const t=loc(x,z,s*2.6,r1-.6,ry);dnStele(t[0],h,t[1],ry,2.6,stC);}
  const ap=loc(x,z,0,r0+3.2,ry);vnPaving(ap[0],.02,ap[1],7,4,ry,stC,10);}
 return{top:h,prof};}
// A ring earthwork (the High Priest's wall): a turf bank of width w and height h at radius r, open for gapW at gapRy;
// the bank ends are faced with rammed earth. A shallow ditch band outside it.
function dnRingBank(x,z,r,h,w,gapRy,gapW,o){const G=VERN.cur.G;const ga=gapW/(2*r);
 const pts=[new THREE.Vector2(r-w/2,0),new THREE.Vector2(r-w*.3,h*.85),new THREE.Vector2(r-w*.12,h),new THREE.Vector2(r+w*.12,h),new THREE.Vector2(r+w*.3,h*.85),new THREE.Vector2(r+w/2,0)];
 const g=new THREE.LatheGeometry(pts,140,gapRy+ga,TAU-2*ga);g.computeVertexNormals();mesh(g,MAT.dTurfMesh,G,x,-.05,z);
 for(const s of[-1,1]){const a=gapRy+s*ga;const p=dnOnRing(x,z,r,a);kput('dEarthBat',[p[0],0,p[1]],qEuler(0,-a+Math.PI/2,0),[1.4,h+.2,w*.9],dCol(DPAL.earth));
  const q=dnOnRing(x,z,r,a+s*ga*.06);vB('dEarth',q[0],h-.1,q[1],3,.5,w*.9,a+Math.PI/2,dCol(DPAL.earthDark));}
 if(o&&o.palisade){const n=Math.round(TAU*r/.45);const c=vC(0x7a5a3e);for(let k=0;k<n;k++){const a=k/n*TAU;let d=Math.abs(((a-gapRy)%TAU+TAU)%TAU);if(d>Math.PI)d=TAU-d;if(d<ga+.02)continue;
  const p=dnOnRing(x,z,r,a);vPst('vPostB',p[0],h-.3,p[1],.16,2.4+rr(-.2,.2),c.clone().multiplyScalar(rr(.85,1.1)));}}}
// Battered rammed-earth platform (a noble's house stands on one).
function dnPlatform(x,y,z,w,d,h,ry,c){kput('dEarthBat',[x,y,z],ry?qEuler(0,ry,0):null,[w,h,d],c||dCol(DPAL.earth));vB('dEarth',x,y+h-.06,z,w*.88,.12,d*.88,ry,dCol(DPAL.earthDark));}
// Rectangular rammed-earth compound wall, battered, with a cap, drum buttresses at the corners, a gate in the front
// (+z) of width `gate` flanked by pylons; o.relief carves a band on the outer front; o.mural paints one instead.
function dnEarthWall(x,y,z,w,d,ry,h,gate,o){o=o||{};const c=o.c||dCol(DPAL.earth),t=o.t||1.1;
 const seg=(lx,lz,L,a)=>{const p=loc(x,z,lx,lz,ry);kput('dEarthBat',[p[0],y,p[1]],qEuler(0,ry+a,0),[L,h,t],c);vB('dEarth',p[0],y+h-.05,p[1],L+.1,.25,t*.86+.2,ry+a,dCol(DPAL.earthDark));};
 seg(0,-d/2,w,0);seg(-w/2,0,d,Math.PI/2);seg(w/2,0,d,Math.PI/2);
 if(gate){const L=(w-gate)/2-1.2;seg(-(gate/2+1.2+L/2),d/2,L,0);seg(gate/2+1.2+L/2,d/2,L,0);
  for(const s of[-1,1]){const p=loc(x,z,s*(gate/2+.7),d/2,ry);vB(o.stoneGate?'vStone':'dEarth',p[0],y,p[1],1.4,h+1.3,t+.8,ry,o.stoneGate?dCol(DPAL.stone):c);
   const f=loc(x,z,s*(gate/2+.7),d/2+t/2+.4,ry);dnReliefBand(f[0],y+.5,f[1],ry,1.0,h+.3,o.stoneGate?dCol(DPAL.stone):c);}
  if(o.lintel!==false){const p=loc(x,z,0,d/2,ry);vB('vWood',p[0],y+h+.9,p[1],gate+2.8,.4,t+.6,ry,dCol(DPAL.wood));}
  if(o.relief){for(const s of[-1,1]){const f=loc(x,z,s*(gate/2+1.2+L/2),d/2+t/2+.02,ry);dnReliefBand(f[0],y+h*.45,f[1],ry,L-.6,1.0,c);}}
  if(o.mural){for(const s of[-1,1]){const f=loc(x,z,s*(gate/2+1.2+L/2),d/2+t/2+.02,ry);dnMuralBand(f[0],y+h*.3,f[1],ry,L-.6,Math.min(2,h-.8));}}}
 else seg(0,d/2,w,0);
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*w/2,sz*d/2,ry);dnDrum('dEarthDrumB',p[0],y,p[1],t*1.1,h+.5,c);}}
// A circular wall of box segments (stone or earth) with a gap of gapW at bearing gapRy; buttress drums every 1/8.
function dnRingWall(x,y,z,r,h,gapRy,gapW,item,c,t){t=t||1.0;const n=Math.round(TAU*r/2.6);const ga=gapW/(2*r);
 for(let k=0;k<n;k++){const a=(k+.5)/n*TAU;let d=Math.abs(((a-gapRy)%TAU+TAU)%TAU);if(d>Math.PI)d=TAU-d;if(d<ga)continue;const p=dnOnRing(x,z,r,a);vB(item,p[0],y,p[1],TAU*r/n+.12,h,t,a,c);
  if(k%Math.round(n/8)===0)dnDrum(item==='vStone'?'dStoneDrumB':'dEarthDrumB',p[0],y,p[1],t*1.3,h+.4,c);}
 for(const s of[-1,1]){const p=dnOnRing(x,z,r,gapRy+s*ga);vB(item,p[0],y,p[1],1.6,h+1.2,t+.9,gapRy+s*ga,c);}}

// ---------------------------------------------------------------- people
// Green-skinned townsfolk (the photosynthesis mod is near-universal).
function dnFolk(x,z,n,spread,y){y=y||0;for(let i=0;i<n;i++){const px=x+rr(-spread,spread),pz=z+rr(-spread,spread);kput('figB',[px,y,pz],qEuler(0,rng()*TAU,0),1,dCol(DPAL.robe));kput('figH',[px,y,pz],null,1,dCol(DPAL.skin));}}
// A priest: white robe, gold head-dress, a staff.
function dnPriest(x,y,z,ry){kput('figB',[x,y,z],qEuler(0,ry,0),[1.05,1.1,1.05],dCol(DPAL.priest));kput('figH',[x,y,z],null,[1,1.1,1],dCol(DPAL.skin));vB('dGilt',x,y+1.72,z,.42,.14,.42,ry);
 const p=loc(x,z,.4,0,ry);vPst('vPost',p[0],y,p[1],.03,2.3,vC(0x5a4632));vBall('dGiltBall',p[0],y+2.35,p[1],.1);}
// A Giant of Dalab: 3.8 m, green, two or four arms, spear. Caste guards for the priests (arms=4) or the city watch (2).
function dnGiant(x,y,z,ry,arms,o){o=o||{};const skin=o.skin||dCol(DPAL.skin,.8);const S=o.s||2.3;
 kput('figB',[x,y,z],qEuler(0,ry,0),[S,S*1.08,S],skin);kput('figH',[x,y,z],null,[S*1.05,S*1.08,S*1.05],skin.clone().multiplyScalar(1.1));
 vB('vTarpB',x,y+S*.66,z,S*.55,S*.42,S*.5,ry,dCol(DPAL.red));                                            // loincloth
 vB('dGilt',x,y+1.62*S*1.08+.02,z,S*.32,.1,S*.32,ry);                                                     // gold circlet
 // arms: the figure cylinder rolled past the vertical so it hangs from the shoulder, splayed a little; the lower
 // pair of a four-armed guard reaches forward
 const arm=(lx,ly,tilt,roll)=>{const p=loc(x,z,lx,0,ry);kput('figB',[p[0],y+ly,p[1]],vQ(ry,tilt,roll),[S*.26,S*.62,S*.26],skin);};
 arm(-S*.30,S*1.42,0,Math.PI-.28);arm(S*.30,S*1.42,0,-(Math.PI-.28));
 if(arms>=4){arm(-S*.30,S*1.18,-1.2,Math.PI-.5);arm(S*.30,S*1.18,-1.2,-(Math.PI-.5));}
 if(o.spear!==false){const p=loc(x,z,S*.5,S*.18,ry);vPst('vPost',p[0],y,p[1],.045,S*2.3,vC(0x4a3a2a));kput('vConeI',[p[0],y+S*2.3,p[1]],null,[.14,.6,.14],vC(0x3a3a3a));}
 if(o.shield){const p=loc(x,z,-S*.5,S*.1,ry);kput('vStone',[p[0],y+S*1.0,p[1]],vQ(ry,0,0),[S*.6,S*.8,.08],dCol(DPAL.red));}}

// ---------------------------------------------------------------- furniture
// Market stall: counter, four posts, a thatch or cloth shed roof, goods.
function dnStall(x,z,ry,o){o=o||{};const wood=dCol(DPAL.woodGrey);const W=3.2,D=2.2;
 const c=loc(x,z,0,0,ry);vB('vWood',c[0],.8,c[1],W,.12,.9,ry,wood);for(const s of[-1,1]){const p=loc(x,z,s*(W/2-.2),.2,ry);vB('vWood',p[0],0,p[1],.3,.8,.6,ry,wood);}
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(W/2-.1),sz*(D/2-.1),ry);vPst('vPost',p[0],0,p[1],.06,2.3+(sz<0?.5:0),wood);}
 if(o.cloth){kput('vClothB',[...(()=>{const p=loc(x,z,0,0,ry);return[p[0],2.55,p[1]];})()],vQ(ry,.2,0),[W+.5,.05,D+.6],dCol([0xa8382a,0x2f9a8a,0xd8a838,0xe8dcc0]));}
 else vnShedRoof(x,2.3,z,W,D,.5,ry,'vThatchB',dCol(DPAL.thatch),.45,.28);
 const g=loc(x,z,0,-.2,ry);const kind=o.kind!==undefined?o.kind:dRi(0,3);
 if(kind===0)for(let k=0;k<5;k++)vBall('vGourd',g[0]+rr(-1.2,1.2),1.05,g[1]+rr(-.25,.25),.17,dCol([0xb08a4a,0x8a9a3a,0xc09a5a,0x6a9a4a]),.2);
 else if(kind===1)for(let k=0;k<4;k++)vPst('vClayPot',g[0]-1.1+k*.72,.92,g[1],.2,.45,dCol([0x9a5a38,0xa86a44,0x7a4a2a]));
 else if(kind===2)vnSacks(g[0],.92,g[1],3);
 else for(let k=0;k<3;k++)kput('vClothB',[g[0]-.8+k*.8,1.0,g[1]],null,[.6,.25,.5],dCol(DPAL.robe));
 if(o.folk!==false)dnFolk(x,z,1,.4);}
// Raised granary basket on stilts: a stave drum under a thatch cone, a ladder.
function dnGranary(x,y,z,r,h,o){o=o||{};const wood=dCol(DPAL.woodGrey);const FL=o.fl||1.6;
 for(let k=0;k<6;k++){const a=k/6*TAU;vPst('vPostB',x+Math.cos(a)*r*.8,y-.2,z+Math.sin(a)*r*.8,.14,FL+.2,wood);vB('vStone',x+Math.cos(a)*r*.8,y+FL-.1,z+Math.sin(a)*r*.8,.6,.1,.6,0,vC(0x9a8a78));}   // rat guards
 vB('vWood',x,y+FL,z,r*2.2,.16,r*2.2,0,wood);dnDrum('dStaveDrum',x,y+FL+.16,z,r,h,dCol(DPAL.wood));
 for(const yy of[.3,h*.5,h-.3])kput('dRopeRing',[x,y+FL+.16+yy,z],qEuler(Math.PI/2,0,0),[r*1.03,r*1.03,1],vC(0xb8a888));
 vnThatchCone(x,y+FL+.16+h,z,r,r*1.1,dCol(DPAL.thatch));kput('dConeT',[x,y+FL+.16+h+r*1.1-.4,z],null,[.6,.8,.6],dCol(DPAL.thatch));
 const dp=dnOnRing(x,z,r,o.door||0);vB('vDarkB',dp[0],y+FL+.6,dp[1],.7,.8,.1,o.door||0);vB('vWood',dp[0],y+FL+.6,dp[1]+0,.75,.8,.05,o.door||0,wood);
 const lp=dnOnRing(x,z,r+.9,o.door||0);vnLadder(lp[0],y,lp[1],(o.door||0)+Math.PI,FL+.9,wood);}
// A drying rack of maize / a stack of firewood / a water jar: peasant-yard clutter.
function dnJar(x,y,z,r){vPst('vClayPot',x,y,z,r,r*2.2,dCol([0x9a5a38,0xa86a44,0x7a4a2a]));vBall('vGourd',x,y+r*2.2,z,r*.7,vC(0x6a4a30),r*.3);}
function dnWoodpile(x,y,z,ry,L){for(let k=0;k<3;k++)for(let j=0;j<4-k;j++){const p=loc(x,z,0,-.45+j*.3+k*.15,ry);kput('vPost',[p[0],y+.15+k*.28,p[1]],vQ(ry,0,Math.PI/2),[.14,L,.14],dCol(DPAL.wood));}}
// Live-oak vault trees are the biome's job; the kit has none.
