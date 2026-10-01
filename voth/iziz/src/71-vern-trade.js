// ================================================================= IZIZ VERNACULAR — trade and industry
// Shops, the tavern, workshops, the scrap smithy, the market canopy, the
// warehouse. None of these are civic, so none carry electric light; the
// smithy and the kiln glow with fire, which is allowed.

// A market stall: four posts, a striped canopy, a counter with goods, crates behind.
function vnStall(x,z,ry,c){const W2=1.3,D2=.9;const wood=vC(vPick(VPAL.woodMid));
 [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(p=>{const q=loc(x,z,p[0]*W2,p[1]*D2,ry);vPst('vPost',q[0],0,q[1],.06,2.4,wood);});
 kput('vClothB',[x,2.45,z],vQ(ry,.1,0),[W2*2+.7,.06,D2*2+.7],c||vC(vPick(VPAL.awning)));
 const cq=loc(x,z,0,D2*.55,ry);vB('vWood',cq[0],0,cq[1],W2*1.9,.95,.7,ry,wood);
 for(let k=0;k<4;k++){const g=loc(x,z,-W2*.7+k*W2*.47,D2*.55,ry);const r=rng();
  if(r<.4)vnCrate(g[0],.95,g[1],.42,ry+rr(-.3,.3));else if(r<.7)vPst('vClayPot',g[0],.95,g[1],.17,.4,vC(vPick([0x9a5a38,0xb87a4a,0x7a4a30])));else kput('vSack',[g[0],1.12,g[1]],null,[.22,.18,.22],vC(vPick(VPAL.awning)));}
 const bq=loc(x,z,0,-D2*.5,ry);vnCrate(bq[0],0,bq[1],.8,ry,wood);vnSacks(bq[0]-.9,0,bq[1],2);}
// hanging sign board on an iron bracket
function vnSign(x,y,z,ry,c){const a=loc(x,z,0,.05,ry),b=loc(x,z,0,1.1,ry);vBeam([a[0],y,a[1]],[b[0],y,b[1]],.05,vC(0x2e2a26),'vIron');
 const s=loc(x,z,0,.7,ry);kput('vWood',[s[0],y-.5,s[1]],vQ(ry+Math.PI/2,0,0),[.9,.7,.05],c||vC(vPick(VPAL.awning)));vB('vIron',s[0],y-.15,s[1],.04,.15,.04,0,vC(0x2e2a26));}

// ---------------------------------------------------------------- shop row: three units under one salvaged-sheet roof
function buildVernShops(G,o){reseed(7401+(o.v|0));const U=4.6,N=3,W=U*N,D=7.4,H=3.3,Y0=.3;const wood=vC(vPick(VPAL.woodMid));
 vnReg('Shop row (three units)',0,0,9,Y0+H+3.6);
 vB('vStone',0,-.1,0,W+.5,.4,D+.5,0,vC(vPick(VPAL.stoneDark)));vnPaving(0,.02,D/2+1.6,W+2,2.6,0,vC(vPick(VPAL.stoneDark)),14);
 const pls=[vC(vPick(VPAL.sand)),vC(vPick(VPAL.adobe)),vC(vPick(VPAL.sand))];
 for(let i=0;i<N;i++){const x=-W/2+U*(i+.5);vB('vPlaster',x,Y0,0,U,H,D,0,pls[i]);}
 for(let i=0;i<=N;i++){const x=-W/2+U*i;for(const s of[-1,1])vPst('vPost',x,Y0,s*(D/2-.02),.16,H+.4,wood);}
 const top=vnCornice('vWood',0,Y0+H,0,W,D,0,wood,1);
 vnGableRoof(0,top,0,W,D,2.2,0,'vGableC',null,1.0,'vGablePl',pls[1],.16);
 // attic shutter strips over each unit
 for(let i=0;i<N;i++){const x=-W/2+U*(i+.5);vnStrip(x,top+.35,D/2-.05,0,.6,1.3,'vWood',wood);}
 for(let i=0;i<N;i++){const x=-W/2+U*(i+.5),c=vC(VPAL.awning[i*2%VPAL.awning.length]);
  // the shop front: a wide opening, its board shutter propped up as a hood, a counter, an awning, a sign
  vB('vDarkB',x,Y0+.9,D/2-.05,U-1.2,1.7,.2,0);vB('vWood',x,Y0,D/2+.2,U-1.0,.95,.6,0,wood);
  kput('vWood',[x,Y0+2.75,D/2+.75],vQ(0,-.75,0),[U-1.0,.06,1.7],wood.clone().multiplyScalar(.9));
  vnAwning(x,Y0+2.55,D/2,0,U-.9,1.5,c);vnSign(x-U/2+.35,Y0+2.35,D/2,0,c);
  for(let k=0;k<3;k++){const gx=x-(U-1.6)/2+(U-1.6)*(k+.5)/3;const r=rng();
   if(r<.35)vnCrate(gx,Y0+.95,D/2+.2,.5,rr(-.3,.3));else if(r<.7)vPst('vClayPot',gx,Y0+.95,D/2+.2,.2,.5,vC(vPick([0x9a5a38,0xb87a4a])));else kput('vClothB',[gx,Y0+1.1,D/2+.2],qEuler(0,rr(-.3,.3),0),[.6,.3,.45],vC(vPick(VPAL.awning)));}
  vnDoor(x+U/2-.75,Y0,D/2-.05,0,.9,2.1,'vWood',wood,vC(0x6a4a30),false);
  vnWin(x,Y0+1.4,-D/2+.05,Math.PI,1.1,1.1,'shut','vWood',wood);}
 for(const s of[-1,1])vnWin(s*W/2,Y0+1.4,0,s*Math.PI/2,1.1,1.1,'open','vWood',wood,true);
 vnBarrel(W/2+.9,0,D/2-1.2,.4,1.0,wood);vnSacks(-W/2-1.0,0,D/2-1.5,4);vnBannerPole(-W/2-.6,0,D/2+1.8,0,5.5);vnBannerPole(W/2+.6,0,D/2+1.8,0,5.5);
 vnFolk(0,D/2+3.2,5,3.5);}

// ---------------------------------------------------------------- tavern: the deco long hall in timber, cross-gabled porch, inn rooms above
function buildVernTavern(G,o){reseed(7411+(o.v|0));const W=16,D=10,H=4.0,H2=2.6,Y0=.35;const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.sand)),sh=vC(vPick([0x8a6a4a,0x6a4e38,0x9a7a56]));
 vnReg('Tavern (long hall)',0,0,12,Y0+H+H2+4.6);
 vB('vStone',0,-.1,0,W+.6,.45,D+.6,0,vC(vPick(VPAL.stoneDark)));
 vnFrame(0,Y0,0,W,H,D,0,wood,.18);vB('vPlaster',0,Y0,0,W-.16,H,D-.16,0,pl);
 vB('vWood',0,Y0+H,0,W+.4,.3,D+.4,0,wood);                                           // string course
 vB('vWood',0,Y0+H+.3,0,W,H2,D,0,wood.clone().multiplyScalar(.9));                    // upper storey: boards
 const top=vnCornice('vWood',0,Y0+H+.3+H2,0,W,D,0,wood,2);
 vnGableRoof(0,top,0,W,D,4.2,0,'vGableS',sh,1.1,'vGableW',wood,.2);
 for(const s of[-1,1]){vB('vWood',s*(W/2+1.1),top+4.2-.4,0,.5,2.2,.5,0,wood);kput('vBall',[s*(W/2+1.1),top+6.2,0],null,[.25,.25,.25],vC(0x8a6a2a));}   // ridge finials
 // porch: cross gable on four posts, benches, barrels
 {const PZ=D/2+2.2,PW=6.4,PD=3.6;vB('vWood',0,Y0-.05,PZ,PW,.28,PD,0,wood);
  for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(PW/2-.2),Y0,PZ+sz*(PD/2-.2),.17,3.4,wood);
  vB('vWood',0,Y0+3.4,PZ,PW+.4,.3,PD+.4,0,wood);vnGableRoof(0,Y0+3.7,PZ,PW,PD+.6,2.3,Math.PI/2,'vGableS',sh,.8,'vGableW',wood,.2);
  for(const s of[-1,1]){vB('vWood',s*(PW/2-.5),Y0+.28,PZ,.45,.45,2.6,0,wood);}
  vnDoor(0,Y0,D/2-.06,0,1.5,2.5,'vWood',wood,vC(0x5a3a24),false);}
 for(const x of[-5.5,-3,3,5.5])vnWin(x,Y0+1.3,D/2-.06,0,1.3,1.4,'open','vWood',wood,true);
 for(const s of[-1,1])for(const z of[-3,0,3])vnWin(s*W/2,Y0+1.3,z,s*Math.PI/2,1.2,1.3,'open','vWood',wood,true);
 for(const x of[-5.5,-2.75,0,2.75,5.5])vnWin(x,Y0+1.3,-D/2+.06,Math.PI,1.1,1.3,'shut','vWood',wood);
 for(const x of[-6,-3.6,-1.2,1.2,3.6,6])vnStrip(x,Y0+H+.6,D/2+.02,0,.6,1.8,'vWood',wood);
 for(const s of[-1,1])for(const z of[-3,0,3])vnStrip(s*W/2,Y0+H+.6,z,s*Math.PI/2,.6,1.8,'vWood',wood);
 // stone chimney at the back, sign, banners, barrel stack, drying rack for the kitchen
 vB('vStone',-W/2+2,Y0,-D/2-.6,1.6,H+H2+5.6,1.3,0,vC(vPick(VPAL.stoneDark)));vB('vStone',-W/2+2,Y0+H+H2+5.6,-D/2-.6,2.0,.3,1.7,0,vC(vPick(VPAL.stone)));
 vnSign(3.8,Y0+3.4,D/2,0,vC(0xc9442a));vnBannerPole(-W/2-.8,0,D/2+1.0,0,6.5,vC(0xe07a2a));vnBannerPole(W/2+.8,0,D/2+1.0,0,6.5,vC(0x9c2d2d));
 for(let k=0;k<4;k++)vnBarrel(W/2+.9+(k%2)*.95,k<2?0:.95,-D/2+1.5+(k%2)*.9*(k<2?1:0)+ (k>=2?.45:0),.42,.95,wood);
 vnSacks(W/2+1.2,0,1.5,3);vnDryingRack(-W/2-1.8,0,-1,Math.PI/2,3.6);
 vnPaving(0,.02,D/2+5.2,10,2.6,0,vC(vPick(VPAL.stoneDark)),12);vnFolk(0,D/2+5.6,5,3);}

// ---------------------------------------------------------------- workshops
// A — carpenter: open-fronted shed, benches, timber stacks, sawpit
function buildVernWorkshopA(G,o){reseed(7421+(o.v|0));const W=9,D=7,H=3.4;const wood=vC(vPick(VPAL.woodMid));
 vnReg('Carpenter\'s workshop',0,0,7.5,H+2.6);
 vB('vStone',0,-.1,0,W+.4,.3,D+.4,0,vC(0x9a8a78));vnFrame(0,.2,0,W,H,D,0,wood,.16);
 vB('vWood',0,.2,-D*.225,W-.2,H,D*.55,0,wood.clone().multiplyScalar(.95));   // back half enclosed, front open
 vnPatch(-W/2+.1,.2,-D*.22,-Math.PI/2,D*.55,H,2);
 vnShedRoof(0,.2+H,0,W,D,1.3,0,'vCorr',null,.9,.12);
 // the open front: benches, tool rack, stacked planks, sawhorses
 vB('vWood',-2.2,.2,D/2-1.4,3.2,.9,.9,0,wood);vB('vWood',2.4,.2,D/2-1.3,2.4,.9,.8,0,wood);
 for(let k=0;k<6;k++)vB('vWood',-3.2+k*.5,1.1,D/2-1.4,.08,.6,.08,0,vC(0x2e2a26));                 // tools standing on the bench
 for(let k=0;k<7;k++)kput('vWood',[W/2-1.2,.35+k*.16,-D*.1],qEuler(0,rr(-.06,.06),0),[.28,.14,4.2],wood.clone().multiplyScalar(rr(.85,1.1)));   // plank stack
 for(const x of[-1,1])for(const s of[-1,1])kput('vWood',[x*.9+s*.35,.55,D/2-3.2],vQ(0,0,s*.35),[.08,1.1,.08],wood);kput('vWood',[0,1.05,D/2-3.2],null,[2.6,.14,.14],wood);   // sawhorses + beam
 for(let k=0;k<5;k++)vPst('vPostB',-W/2-1.2+rr(-.3,.3),0,-2+k*.9,rr(.18,.3),rr(1.5,3.2),vC(vPick(VPAL.woodPoor)),qEuler(Math.PI/2*.98,rng()*.3,0));   // logs lying outside
 vB('vDarkB',0,-.02,D/2+2.4,3.0,.06,1.2,0);for(const s of[-1,1])vB('vWood',s*1.6,0,D/2+2.4,.12,.3,1.3,0,wood);                                   // sawpit
 vnCrate(W/2+.8,0,1.2,.9,.4,wood);vnBarrel(W/2+1,0,-.6,.4,1,wood);vnFolk(-1,D/2+4.2,2,1.2);}
// B — potter: plaster workshop with a domed clay kiln, drying racks of pots, chimney
function buildVernWorkshopB(G,o){reseed(7431+(o.v|0));const W=8,D=7,H=3.2,Y0=.3;const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.adobe));
 vnReg('Potter\'s workshop and kiln',0,0,8.5,Y0+H+3);
 vB('vStone',0,-.1,0,W+.4,.4,D+.4,0,vC(0x9a8a78));vnFrame(0,Y0,0,W,H,D,0,wood,.15);vB('vPlaster',0,Y0,0,W-.14,H,D-.14,0,pl);
 vnCornice('vWood',0,Y0+H,0,W,D,0,wood,1,false);vnHipRoof('vHipC',0,Y0+H+.32,0,W,D,2.1,0,null,1.1);
 vB('vDarkB',-1.2,Y0+.6,D/2-.05,3.4,2.0,.2,0);vB('vWood',-1.2,Y0,D/2+.15,3.2,.9,.5,0,wood);      // open sales front with counter
 for(let k=0;k<5;k++)vPst('vClayPot',-2.4+k*.6,Y0+.9,D/2+.15,rr(.14,.22),rr(.3,.55),vC(vPick([0x9a5a38,0xb87a4a,0x7a4a30,0xc89a6a])));
 vnDoor(2.4,Y0,D/2-.05,0,1.0,2.1,'vWood',wood,vC(0x6a4a30),false);vnAwning(-1.2,Y0+2.6,D/2,0,3.6,1.6,vC(0xe0a030));
 for(const s of[-1,1])vnWin(s*W/2,Y0+1.3,0,s*Math.PI/2,1.0,1.0,'open','vWood',wood,true);
 // kiln: a clay dome on a stone base with a stoke hole and a tall clay chimney; pots drying on shelves beside
 {const kx=W/2+3.2,kz=-.8;vB('vStone',kx,0,kz,3.6,.7,3.6,0,vC(0x8a7a6a));kput('vDomeP',[kx,.7,kz],null,[1.7,1.7,1.7],vC(0xa06a44));
  vB('vDarkB',kx,.7,kz+1.55,.8,.7,.3,0);vBall('vEmber',kx,1.05,kz+1.5,.18);vPst('vClayPot',kx-.3,2.2,kz-.5,.28,2.2,vC(0xa06a44));vnChimney(kx-.3,4.4,kz-.5,.6,.2,true);
  for(let k=0;k<2;k++){vB('vWood',kx-.2,1.6+k*.8,kz+2.6,3.0,.08,.5,0,wood);for(let j=0;j<6;j++)vPst('vClayPot',kx-1.5+j*.55,1.68+k*.8,kz+2.6,.15,.35,vC(vPick([0xb08a6a,0x9a5a38])));}
  for(const s of[-1,1])vPst('vPost',kx-.2+s*1.5,0,kz+2.6,.06,2.6,wood);}
 vnBarrel(-W/2-.8,0,D/2-1.4,.42,1.0,wood);vB('vClayB',-W/2-1.0,0,-1.6,1.4,.6,1.4,.3,vC(0x8a5a3a));   // clay heap
 vnFolk(0,D/2+3.4,2,1.2);}

// ---------------------------------------------------------------- scrap smithy: forge under a salvaged roof on pipe posts, scrap heaps, a hoist frame
function buildVernSmithy(G,o){reseed(7441+(o.v|0));const W=11,D=8,H=3.8;const wood=vC(vPick(VPAL.woodPoor)),iron=vC(0x2e2a26);
 vnReg('Scrap smithy',0,0,9.5,H+7.5);
 vnPaving(0,.02,0,W+4,D+4,0,vC(0x6a625a),24);vB('vStone',0,-.05,0,W,.25,D,0,vC(0x7a7068));
 // pipe posts, salvaged-panel roof in two pitches with a gap for smoke
 for(const sx of[-1,1])for(const z of[-D/2+.3,0,D/2-.3])vPst('vPipeR',sx*(W/2-.3),.2,z,.14,H,null);
 for(const s of[-1,1]){const zc=s*D/4;const q=vQ(0,s*.3,0);kput(s<0?'vPanelB':'vRustB',[0,H+.9+ .1,zc],q,[W+1.2,.12,D/2+.8],null);}
 vB('vIron',0,H+.1,-D/2+.2,W+1.2,.2,.2,0,iron);vB('vIron',0,H+.1,D/2-.2,W+1.2,.2,.2,0,iron);vB('vIron',0,H+1.65,0,W+1.4,.2,.2,0,iron);
 // back wall of plate and sheet, patched
 vB('vRustB',0,.2,-D/2+.15,W-.2,H-.2,.15,0);vnPatch(0,.2,-D/2+.15,0,W,H-.4,5);
 // forge hearth: stone block, ember bed, hood and a tall reclaimed-pipe stack through the roof
 {const fx=-2.6,fz=-D/2+1.6;vB('vStone',fx,.2,fz,2.8,1.1,2.0,0,vC(0x6a625a));vB('vDarkB',fx,1.3,fz,2.2,.15,1.4,0);for(let k=0;k<5;k++)vBall('vEmber',fx+rr(-.8,.8),1.42,fz+rr(-.5,.5),rr(.1,.2));
  kput('vRustB',[fx,2.9,fz],null,[2.6,1.2,1.8],null);kput('vRustB',[fx,2.3,fz],null,[3.0,.2,2.2],null);vnChimney(fx,3.5,fz,H+4.2,.42,true);}
 // anvil on a stump, quench barrel, bellows box, workbench with tongs
 vPst('vPostB',.6,.2,-.4,.34,.75,wood);vB('vIron',.6,.95,-.4,1.1,.35,.4,0,iron);vB('vIron',.6,1.3,-.4,.5,.12,.3,0,iron);
 vnWaterButt(2.0,.2,-1.4,.45,.9);vB('vWood',-2.6,.2,-D/2+3.4,1.6,.7,1.0,0,wood);vB('vTarpB',-2.6,.9,-D/2+3.4,1.4,.35,.8,0,vC(0x8a7a5a));
 vB('vWood',3.6,.2,-D/2+1.2,3.0,.9,.9,0,wood);for(let k=0;k<4;k++)vB('vIron',2.6+k*.6,1.1,-D/2+1.2,.05,.7,.05,0,iron);
 // scrap heaps: rusted plates, pipe offcuts, ghost panel scraps
 for(let i=0;i<40;i++){const x=W/2+1.6+rr(-1.3,1.7),z=rr(-D/2,D/2);const r=rng();const hgt=Math.pow(rng(),2)*.45;
  if(r<.5)kput('vRustB',[x,hgt+.05,z],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[rr(.5,1.2),rr(.03,.07),rr(.4,1.0)],null);
  else if(r<.8)kput('vPipeR',[x,hgt+.08,z],qEuler(Math.PI/2,rng()*TAU,rr(-.3,.3)),[rr(.05,.12),rr(.7,2.0),rr(.05,.12)],null);
  else kput('vPanelB',[x,hgt+.05,z],qEuler(rr(-.4,.4),rng()*TAU,rr(-.4,.4)),[rr(.5,1.1),.06,rr(.5,1.1)],null);}
 for(let i=0;i<10;i++)kput('vIron',[-W/2-1.4+rr(-.8,.8),rr(.1,.6),rr(-2,2)],qEuler(rng(),rng()*TAU,rng()),[rr(.3,.9),rr(.2,.5),rr(.3,.9)],iron);
 // hoist: an A-frame of pipe with a rope and hook over the yard
 {const hx=3.4,hz=D/2+2.4;for(const s of[-1,1])vPst('vPipeR',hx+s*1.4,0,hz,.12,5.2,null,qEuler(0,0,-s*.27));vB('vIron',hx,5.05,hz,1.0,.2,.2,0,iron);
  vPst('vRope',hx,2.4,hz,.03,2.7,vC(0xa89878));vB('vIron',hx,2.1,hz,.25,.3,.08,0,iron);}
 vnFolk(0,D/2+3.4,2,1.4);}

// ---------------------------------------------------------------- market canopy: a great two-tier rain roof over rows of stalls
function buildVernMarket(G,o){reseed(7451+(o.v|0));const W=24,D=17,H=5.2;const wood=vC(vPick(VPAL.woodMid)),th=vC(vPick(VPAL.thatch));
 vnReg('Market canopy',0,0,15,H+6);
 vnPaving(0,.02,0,W+4,D+4,0,vC(vPick(VPAL.stoneDark)),60);
 // outer posts and ring beams, inner posts higher for the clerestory
 const nx=6,nz=4;for(let i=0;i<=nx;i++)for(const s of[-1,1]){vPst('vPostB',-W/2+W*i/nx,0,s*D/2,.2,H,wood);}
 for(let j=1;j<nz;j++)for(const s of[-1,1])vPst('vPostB',s*W/2,0,-D/2+D*j/nz,.2,H,wood);
 for(const s of[-1,1]){vB('vWood',0,H-.15,s*D/2,W+.4,.3,.3,0,wood);vB('vWood',s*W/2,H-.15,0,.3,.3,D+.4,0,wood);}
 for(let i=0;i<=nx;i++)vB('vWood',-W/2+W*i/nx,H-.15,0,.22,.22,D,0,wood);                       // tie beams
 // lower thatch skirt all round (two long slabs, two short) and an upper hip over the middle third
 vnHipRoof('vHipT',0,H,0,W,D,2.6,0,th,1.3);
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPostB',sx*W/6,H+1.4,sz*D/8,.16,2.2,wood);
 vnHipRoof('vHipT',0,H+3.4,0,W*.42,D*.5,2.0,0,th,.9);
 vB('vWood',0,H+3.4,0,W*.42+.4,.25,.25,0,wood);vB('vWood',0,H+3.4,0,.25,.25,D*.5+.4,0,wood);
 // banners on alternate outer posts, gourds and lanterns from the tie beams
 for(let i=0;i<=nx;i+=2)vnBannerPole(-W/2+W*i/nx,0,D/2+.5,0,H+1.2,vC(vPick(VPAL.orange.concat([0x9c2d2d,0x2f8f8a]))));
 // rows of stalls with an aisle down the middle
 for(let i=0;i<5;i++){const x=-W/2+2.6+i*(W-5.2)/4;vnStall(x,-D/2+3.4,0);vnStall(x,D/2-3.4,Math.PI);}
 for(let i=0;i<3;i++){const x=-W/2+4+i*(W-8)/2;vnStall(x,-1.6,Math.PI);vnStall(x,1.6,0);}
 vnWaterButt(-W/2-1.2,0,-D/2-1,.5,1.1);vnCrate(W/2+1.2,0,D/2-2,.9,.3,wood);vnSacks(W/2+1.4,0,-D/2+2,5);
 vnFolk(0,0,10,7);vnFolk(0,D/2+3,4,3);}

// ---------------------------------------------------------------- warehouse: long timber shed clad in board and sheet, gable-end doors, loading dock and hoist
function buildVernWarehouse(G,o){reseed(7461+(o.v|0));const W=22,D=12,H=5.2,Y0=.9;const wood=vC(vPick(VPAL.woodMid));
 vnReg('Warehouse',0,0,14,Y0+H+5);
 vB('vStone',0,-.1,0,W+.6,Y0+.1,D+.6,0,vC(vPick(VPAL.stoneDark)));                       // loading-height plinth
 vnFrame(0,Y0,0,W,H,D,0,wood,.2);vB('vWood',0,Y0,0,W-.2,H,D-.2,0,wood.clone().multiplyScalar(.92));
 // sheet cladding on the lower half, boards above; patches
 for(const s of[-1,1]){vB('vCorr',0,Y0,s*(D/2-.05),W-.4,H*.45,.1,0);vnPatch(0,Y0+H*.45,s*(D/2-.05),s>0?0:Math.PI,W-.4,H*.5,4);}
 for(const s of[-1,1])vB('vCorr',s*(W/2-.05),Y0,0,.1,H*.45,D-.4,0);
 vnGableRoof(0,Y0+H,0,D,W,3.4,Math.PI/2,'vGableP',null,1.0,'vGableW',wood,.16);   // ridge along z (long axis)
 for(let k=0;k<4;k++)kput('vIron',[-W/2+3+k*(W-6)/3,Y0+H+3.9,0],null,[.9,.6,1.4],vC(0x4a4640));   // roof vents
 // gable-end doors on the front (+z... the ridge runs along z, so the gable ends face ±x): put the doors on +x and the dock along +z
 {const dx=W/2-.05;vB('vDarkB',dx,Y0,-1.0,.2,3.8,3.6,0);for(const s of[-1,1])kput('vWood',[dx+.12,Y0+1.9,-1.0+s*1.05],vQ(Math.PI/2,0,0).multiply(qEuler(0,s*.55,0)),[1.9,3.7,.08],wood.clone().multiplyScalar(.85));
  vB('vWood',dx+.1,Y0+3.8,-1.0,.3,.3,4.4,0,wood);vB('vDarkB',dx,Y0+H+1.6,-1.0,.2,1.4,1.4,0);vB('vWood',dx+.9,Y0+H+2.9,-1.0,2.2,.25,.25,0,wood);vPst('vRope',dx+1.8,Y0+1.2,-1.0,.03,Y0+H+1.7-Y0-1.2,vC(0xa89878));vnCrate(dx+1.8,Y0+.5,-1.0,.9,.2,wood);}
 // loading dock along the front with stairs, ramp, crates and barrels; a lean-to office
 vB('vWood',0,Y0-.28,D/2+1.4,W-2,.28,2.8,0,wood);for(let i=0;i<=8;i++)vPst('vPostB',-W/2+1+(W-2)*i/8,-.1,D/2+2.7,.13,Y0-.2,wood);
 vnStairs(W/2-2.2,0,D/2+3.4,0,1.4,Y0,3,'vWood',wood);kput('vWood',[-W/2+2.6,Y0/2-.1,D/2+4.2],vQ(0,Math.atan2(Y0,3.2),0),[2.2,.12,3.4],wood);
 for(let k=0;k<5;k++)vnCrate(-W/2+4+k*2.4,Y0,D/2+1.2,rr(.7,1.1),rr(-.2,.2),wood);vnBarrel(W/2-4,Y0,D/2+1.0,.42,1.0,wood);vnBarrel(W/2-4.9,Y0,D/2+1.0,.42,1.0,wood);vnSacks(-1,Y0,D/2+1.6,5);
 for(const x of[-6,0,6])vnDoor(x,Y0,D/2-.05,0,2.2,3.0,'vWood',wood,vC(0x6a4a30),false);
 for(const x of[-8,-4,4,8])vnWin(x,Y0+3.6,D/2-.05,0,1.1,.9,'shut','vWood',wood);for(const x of[-8,-4,0,4,8])vnWin(x,Y0+3.6,-D/2+.05,Math.PI,1.1,.9,'shut','vWood',wood);
 {const ox=-W/2-2.6;vB('vWood',ox,0,D/2-2.5,4.6,3.0,4.8,0,wood.clone().multiplyScalar(.9));vnShedRoof(ox,3.0,D/2-2.5,4.6,4.8,1.0,Math.PI/2,'vCorr',null,.6,.12);
  vnDoor(ox,0,D/2-.1,0,1.0,2.1,'vWood',wood,vC(0x6a4a30));vnWin(ox-2.3,1.3,D/2-2.5,-Math.PI/2,1.0,1.0,'open','vWood',wood,true);vnChimney(ox-1.6,3.6,D/2-4.2,1.4,.12,true);}
 vnFolk(2,D/2+5.6,4,2.5);}

VERN.def({key:'vern_shops',name:'Shop row',family:'trade',tags:{type:['market/shop'],wealth:'middle',lit:false},w:18,d:12,h:10,build:buildVernShops});
VERN.def({key:'vern_tavern',name:'Tavern',family:'trade',tags:{type:['tavern/inn'],wealth:'middle',lit:false},w:22,d:20,h:15,build:buildVernTavern});
VERN.def({key:'vern_workshop_a',name:'Carpenter\'s workshop',family:'industry',tags:{type:['industry'],wealth:'middle',lit:false},w:14,d:12,h:6,build:buildVernWorkshopA});
VERN.def({key:'vern_workshop_b',name:'Potter\'s workshop',family:'industry',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},w:16,d:12,h:7,build:buildVernWorkshopB});
VERN.def({key:'vern_smithy',name:'Scrap smithy',family:'industry',tags:{type:['industry'],wealth:'poor',lit:false},w:18,d:14,h:12,build:buildVernSmithy});
VERN.def({key:'vern_market',name:'Market canopy',family:'trade',tags:{type:['market/shop'],wealth:'middle',lit:false},w:30,d:22,h:12,build:buildVernMarket});
VERN.def({key:'vern_warehouse',name:'Warehouse',family:'industry',tags:{type:['industry'],wealth:'middle',lit:false},w:30,d:20,h:11,build:buildVernWarehouse});
