// ================================================================= REED LAKE — hospitality: Reed's Local, the lake people's drinking hall
// A great reed-bundle arch hall (a mudhif, 28 m long) for drinking, eating and talk, with a smaller mudhif joined at
// its right for the kitchen and the store, a mat terrace across the front, and a covered landing on bundle pontoons
// running out over the water where the canoes tie up. Under the landing's front gable hangs the sign, REED'S LOCAL,
// woven in the Andean palette. Fire only: the cook-fire on its mud slab, braziers, fire-cages.
// STRUCTURE only inside (floor mat, the built-in mat benches along both walls of the hall, the cook-fire on its
// slab, the kitchen/store partition, hung cloths, pennants and fire-cages): the interiors set
// (kits/interiors/sets/reedlake.js, rl_tavern) furnishes the rooms. The landing's dressing stays kit items.
// Seeds 25600–25649.

// ---------------------------------------------------------------- the sign (colour-carrying map: never tint it)
// A woven board: a madder field, black selvedges, white zigzags, stepped diamonds at the ends, the name in black on
// an undyed panel. 512 x 128 = the board's 4:1.
TEX.rlTavSign=canvasTex(512,128,(g,w,h)=>{g.fillStyle=RAND.red;g.fillRect(0,0,w,h);
 g.fillStyle=RAND.black;g.fillRect(0,0,w,h*.07);g.fillRect(0,h*.93,w,h*.07);g.fillRect(0,0,w*.018,h);g.fillRect(w*.982,0,w*.018,h);
 g.fillStyle=RAND.ochre;g.fillRect(0,h*.08,w,h*.04);g.fillRect(0,h*.88,w,h*.04);
 hRLZig(g,w*.02,w*.98,h*.165,h*.025,w/24,h*.025,RAND.white);hRLZig(g,w*.02,w*.98,h*.835,h*.025,w/24,h*.025,RAND.white);
 for(const s of[-1,1]){const cx=w/2+s*w*.43;hRLStepDiamond(g,cx,h/2,h*.26,3,RAND.black);hRLStepDiamond(g,cx,h/2,h*.17,2,RAND.ochre);hRLStepDiamond(g,cx,h/2,h*.07,1,RAND.white);}
 g.fillStyle=RAND.white;g.fillRect(w*.13,h*.23,w*.74,h*.54);g.fillStyle=RAND.black;g.fillRect(w*.13,h*.23,w*.74,h*.025);g.fillRect(w*.13,h*.745,w*.74,h*.025);
 g.font='900 '+Math.round(h*.4)+'px "Arial Black", Impact, "Helvetica Neue", Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';
 g.fillStyle=RAND.red;g.fillText("REED'S LOCAL",w/2+2,h/2+3,w*.68);g.fillStyle=RAND.black;g.fillText("REED'S LOCAL",w/2,h/2+1,w*.68);});
MAT.rlTavSign=hStd({map:TEX.rlTavSign,roughness:.85});
kdef('hRLTavSign',VBOX,MAT.rlTavSign);   // a thin board: a box shows the lettering the right way round from both faces

// The plan, in the def's local frame (origin at the plot centre on the island top, +z the front). The interiors set
// (kits/interiors/sets/reedlake.js) reads these numbers: change them together.
//   hall    mudhif centred (XH, ZH), L along z, span S, crown H: x -8.75..2.75, z -16..12, door (XH, 12) 1.7 wide
//   annex   mudhif centred (XA, ZA): x 3.35..9.75, z -2..10, door (XA, 10) 1.66 wide; partition at z ZP, doorway 1.0
//   terrace z 12..17.4 before the hall; the landing deck z LZ0..LZ1 (17.4..24.5), x XH +- LW/2, over the water past z = 18
const RLTAV={W:26,D:36,LAND:6.5,XH:-3,ZH:-2,L:28,S:11.5,H:9.4,XA:6.55,ZA:4,LA:12,SA:6.4,HA:5.4,ZP:3.5,LW:8,LZ0:17.4,LZ1:24.5,
 BENCH:{x0:4.6,x1:5.55,h:.42}};   // the built-in mat benches: |x - XH| in x0..x1, the hall's whole length less the end gaps

// The tavern's own pad (standing alone; skipped when o.pad === false): a squarer island than hnRLPad's ellipse (a
// superellipse, n = 4, with a light wobble) so the corners of the terrace, the yard and the jar store are on reed;
// reed beds round it with a gap at the landing, anchors at the back corners. Returns the outline.
function hnRLTavPad(o){if(o&&o.pad===false)return null;const rx=15,rz=20,n=4;
 const rf=a=>{const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));const r0=1/Math.pow(Math.pow(c/rx,n)+Math.pow(s/rz,n),1/n);
  return r0*(1+.05*(Math.sin(a*3+4.1)*.5+Math.sin(a*5+1.3)*.3+Math.sin(a*8+2.9)*.2));};
 hnRLIsland(VERN.cur.G,0,0,rf,{seed:41,n:64});hnRLReeds(0,0,rf,{gaps:[[Math.PI/2-.58,Math.PI/2+.58]]});
 hnRLAnchor(0,0,rf,Math.PI*1.25);hnRLAnchor(0,0,rf,-Math.PI*.25);hnRLAnchor(0,0,rf,Math.PI*.85);return rf;}

function buildRLTavern(G,o){reseed(25601+(o.v|0));const T=RLTAV,{XH,ZH,L,S,H}=T;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld)),pole=hC(vPick(RPAL.pole)),mud=hC(vPick(RPAL.mud)),rope=hC(vPick(RPAL.rope));
 const fz=ZH+L/2,zl0=T.LZ0,zl1=T.LZ1,zlm=(zl0+zl1)/2,LW=T.LW,afz=T.ZA+T.LA/2;
 vnReg("Reed's Local",XH,ZH,L/2,H+1.5);vnReg("Reed's Local — kitchen and store",T.XA,T.ZA,T.LA/2,T.HA+.6);vnReg("Reed's Local — landing",XH,zlm,5.5,6);
 hnRLTavPad(o);

 // ---- the hall: nine columns each end, the arch 9.4 m at the crown, a mat back
 const M=hnRLMudhif(G,{x:XH,z:ZH,L,S,H,cols:9,rib:.22,col:.3,c,back:'mat'});
 vB('hRLMatB',XH,-.03,ZH,S-.5,.06,L-.5,0,old.clone().multiplyScalar(.96));                                  // the floor mat
 // the built-in benches along both walls (mud cores, mat tops, a bundle kerb, woven bolsters): the guests sit along the walls
 {const B=T.BENCH,bw=B.x1-B.x0,z0=ZH-L/2+.35,z1=fz-.4,bl=z1-z0,bz=(z0+z1)/2;
  for(const s of[-1,1]){const bx=XH+s*(B.x0+B.x1)/2;vB('hRLMud',bx,-.02,bz,bw,B.h-.12,bl,0,mud);vB('hRLMatB',bx,B.h-.14,bz,bw,.14,bl,0,c);
   kput('hRLBundleX',[XH+s*(B.x0+.1),B.h-.2,bz],qEuler(0,Math.PI/2,0),[bl,.2,.2],old);
   const nb=Math.round(bl/2.25);for(let k=0;k<nb;k++)kput('hRLRoll',[XH+s*(B.x1-.18),B.h+.12,z0+(k+.5)*bl/nb],qEuler(0,Math.PI/2,0),[bl/nb-.08,.13,.13],hC(vPick([RPAL.red,RPAL.ochre,0x2f4a7a,0xe8dcc0])));}}
 // the cook-fire on its mud slab in the back half: a stone ring, a tripod and pot, a spit of fish on forked posts
 {const x=XH,z=ZH-3;vB('hRLMud',x,-.02,z,2.6,.22,2.6,0,mud);hnFirepit(x,.2,z,.7);
  for(let k=0;k<3;k++){const a=k/3*TAU+.4;beam('vIron',[x+Math.sin(a)*.8,.22,z+Math.cos(a)*.8],[x,1.75,z],.04,.04,hC(0x2e2a26));}vBall('vBall',x,1.0,z,.3,hC(0x2e2a26),.26);
  for(const s of[-1,1])vPst('hRLBundleC',x+s*1.1,.22,z+.75,.05,1.1,old);beam('vIron',[x-1.15,1.3,z+.75],[x+1.15,1.3,z+.75],.025,.025,hC(0x3a3430));
  for(let k=0;k<5;k++)kput('hPaintBall',[x-.6+k*.3,1.12,z+.75],qEuler(0,0,0),[.05,.2,.11],hC(vPick([0xb8bcb0,0xa0a898,0xc8c8b8])));}
 // inside dressing: pennant strings across the arch, fire-cages hung on long ropes, woven cloths high on the back wall
 const Yh=t=>M.y(t);
 for(let k=0;k<5;k++){const z=ZH-L/2+3+k*5.6,t0=.72,ya=Yh(t0)-.2;const a=[XH-S/2*t0,ya,z],b=[XH+S/2*t0,ya,z],m=[XH,ya-1.1,z];
  beam('vRope',a,m,.012,.012,rope);beam('vRope',m,b,.012,.012,rope);
  for(let j=1;j<12;j++){const u=j/12,p=u<.5?[lerp(a[0],m[0],u*2),lerp(a[1],m[1],u*2)]:[lerp(m[0],b[0],u*2-1),lerp(m[1],b[1],u*2-1)];
   kput('vCloth',[p[0],p[1]-.2,z],null,[.26,.36,1],hC(vPick([0xa8352a,0xd19a3a,0x2f4a7a,0x3f7a5a,0xefe4cc])));}}
 for(let k=0;k<4;k++)for(const s of[-1,1]){const x=XH+s*2.6,z=ZH-L/2+4.5+k*6.2,top=Yh(2.6/(S/2))-.1;vPst('vRope',x,5.2,z,.01,top-5.2,rope);hnRLCage(x,5.2,z);}
 for(const u of[-3.1,0,3.1])hnRLCloth(XH+u,2.4,ZH-L/2+.14,0,2.4,1.25);
 for(const s of[-1,1])hnRLCloth(XH+s*3.2,2.3,fz-.32,Math.PI,1.8,1.1);
 // ---- the front: banded posts with chakana discs and pennants, cloths, the finial, gourds, braziers, the terrace
 vB('hRLMatB',XH,-.02,fz+2.7,S+6,.12,5.4,0,old);
 for(const s of[-1,1]){const xa=XH+s*LW/2,xb=XH+s*(S/2+3.2),w=Math.abs(xb-xa);   // the bundle edge, open where the landing joins
  for(const k of[0,1])kput('hRLBundleX',[(xa+xb)/2,.1+k*.2,fz+5.4-k*.2],null,[w-k*.2,.2,.2],old.clone().multiplyScalar(1-k*.08));}
 for(const s of[-1,1]){hnRLPost(XH+s*(S/2+1),0,fz+1.3,.36,6.8,0,{disc:true,pennant:true});hnRLBrazier(XH+s*4.6,fz+4.1,1);
  hnRLCloth(XH+s*2.8,.5,fz+.2,0,2.4,1.3);hnRLCloth(XH+s*(S/2-.8),.4,fz+.2,0,.7,M.hl-.7);}
 hnRLCloth(XH,M.hl+.9,fz+.16,0,3,1.4);hnRLFinial(XH,H+.1,fz+.1,0,1.3);
 for(let k=0;k<8;k++){const x=XH-4.9+k*1.4;if(Math.abs(x-XH)<1.2)continue;hnRLGourd(x,M.hl-.1,fz+.24);}
 for(const s of[-1,1]){const x=XH+s*(S/2+2.4),z=fz+4.8;vPst('vPost',x,0,z,.07,3.6,pole);beam('vWood',[x,3.45,z],[x-s*.55,3.45,z],.05,.05,pole);hnRLCage(x-s*.5,3.45,z);}

 // ---- the annex: kitchen (front) and store (back), a mat partition with a doorway between them
 const A=hnRLMudhif(G,{x:T.XA,z:T.ZA,L:T.LA,S:T.SA,H:T.HA,cols:5,rib:.15,col:.21,c:old,back:'mat'});
 {const pm=hnRLMesh(G,(u,v)=>{const t=u*2-1;const yy=A.y(t)*v*.985;return[T.XA+T.SA/2*t*.97,yy,T.ZP,u*T.SA/2,yy/2];},24,10,MAT.rlMatM,
   (u,v)=>Math.abs(u*2-1)*T.SA/2<.5&&v*A.y(u*2-1)<2.1);pm.material=hnRLTint(MAT.rlMatM,c);
  for(const s of[-1,1])vPst('hRLBundle',T.XA+s*.6,0,T.ZP,.08,2.25,old);kput('hRLBundleX',[T.XA,2.22,T.ZP],null,[1.4,.08,.08],old);}
 vB('hRLMatB',T.XA,-.03,T.ZA,T.SA-.4,.06,T.LA-.4,0,old.clone().multiplyScalar(.92));
 vB('hRLMatB',T.XA,-.02,afz+1.3,T.SA+1,.1,2.6,0,old);hnRLPost(T.XA+T.SA/2+.5,0,afz+.8,.2,3.6,0,{pennant:true});
 hnRLCloth(T.XA-1.9,.4,afz+.18,0,1.2,A.hl-.6);hnRLCloth(T.XA+1.9,.4,afz+.18,0,1.2,A.hl-.6);hnRLFinial(T.XA,T.HA+.08,afz+.08,0,.8);
 for(const u of[-2.3,-1.4,1.4,2.3])hnRLGourd(T.XA+u,A.hl-.05,afz+.24);

 // ---- the jar store behind the annex: a thatch lean-to over the beer jars and the gourds (outdoor stock)
 {const x=7.4,z=-10,w=7,d=4.2;for(const sx of[-1,1])for(const sz of[-1,1])vPst('hRLBundle',x+sx*w/2,0,z+sz*d/2,.09,sz<0?2.3:1.9,old);
  vnShedRoof(x,1.9,z,w,d,.45,0,'hRLThatchB',c,.4,.2);vB('hRLMatB',x,-.02,z,w,.08,d,0,old);
  for(let r=0;r<2;r++)for(let k=0;k<6;k++){const px=x-2.8+k*1.12+(r?.5:0),pz=z-1.1+r*1.3;kput('vClayPot',[px,.04,pz],null,[.34,.8,.34],hC(vPick([0x9a5a38,0x8a4a30,0xa86a44])));}
  for(let k=0;k<9;k++)vBall('vGourd',x+rr(-3,3),.2+(k>5?.3:0),z+1.6+rr(-.3,.3),.2,hC(vPick([0xb08a4a,0x9a8a3a,0xc0a060])),.24);
  for(let k=0;k<5;k++)hnRLGourd(x-2.6+k*1.3,1.85,z+d/2+.35);}
 // ---- the yard on the left: the fish rail, reed drying, sheaves
 hnRLFishRail([-11.4,-11],[-11.4,-4],2,9);hnRLSheaves(-11.6,-14.5,Math.PI/2,3,{stook:true});hnRLReedLay(-11.3,2,Math.PI/2,4,2.4);
 hnRLSheaves(11.6,-2,Math.PI/2,3,{});

 // ---- the landing: bundle pontoons under a mat deck, eucalyptus piles, a thatch gable on bundle posts, the sign
 {const n=Math.round(LW/.46);for(let i=0;i<n;i++){const x=XH-LW/2+.23+(LW-.46)*i/(n-1);kput('hRLBundleX',[x,RL.WATER+.21,zlm],qEuler(0,Math.PI/2,0),[zl1-zl0,.23,.23],c.clone().multiplyScalar(rr(.92,1.04)));}
  vB('hRLMatB',XH,-.05,zlm,LW,.1,zl1-zl0,0,c.clone().multiplyScalar(.95));
  for(let k=0;k<=5;k++){const z=zl0+.3+(zl1-zl0-.6)*k/5;kput('hRLBundleX',[XH,.07,z],null,[LW+.1,.06,.06],old);}
  for(const s of[-1,1])kput('hRLBundleX',[XH+s*(LW/2-.08),.1,zlm],qEuler(0,Math.PI/2,0),[zl1-zl0,.12,.12],old);
  const ph=3.3,pz=[zl0+.5,zlm,zl1-.3];
  for(const s of[-1,1])for(const z of pz){const x=XH+s*(LW/2-.2);vPst('vPost',x,RL.WATER-.9,z,.1,.95,pole);vPst('hRLBundle',x,0,z,.14,ph,old);}
  for(const s of[-1,1])beam('hRLBundleC',[XH+s*(LW/2-.2),ph,zl0+.2],[XH+s*(LW/2-.2),ph,zl1],.16,.16,old);
  for(const z of[zl0+.5,zl1-.3])kput('hRLBundleX',[XH,ph+.04,z],null,[LW+.2,.14,.14],old);
  const rise=2.1;vnGableRoof(XH,ph+.08,zlm,zl1-zl0+.4,LW-.4,rise,Math.PI/2,'hRLGableT',c,.55,'hRLGableM',c,.28);
  kput('hRLBundleX',[XH,ph+.08+rise+.08,zlm],qEuler(0,Math.PI/2,0),[zl1-zl0+1.6,.15,.15],old);
  // a fringe of loose reed under each long eave (planes laid along z)
  for(const s of[-1,1]){const xe=XH+s*(LW/2-.2+.55);kput('hRLFringe',[xe+s*.06,ph+.08-.55*rise/((LW-.4)/2)-.22,zlm],qEuler(0,Math.PI/2,0),[zl1-zl0+1.2,.45,1],c);}
  hnRLFinial(XH,ph+.08+rise+.15,zl1+.4,0,.7);
  // the sign, hung on ropes from the front tie-beam: REED'S LOCAL, facing the water
  const sz=zl1-.12,sy=2.62;kput('hRLTavSign',[XH,sy,sz],null,[4.6,1.15,.06],null);kput('hRLBundleX',[XH,sy+.62,sz],null,[4.9,.06,.06],old);
  for(const s of[-1,1]){beam('vRope',[XH+s*2.1,sy+.62,sz],[XH+s*2.1,ph,zl1-.3],.012,.012,rope);kput('vCloth',[XH+s*2.38,sy-.75,sz],null,[.1,.4,1],hC(vPick([0xa8352a,0xd19a3a])));}
  // dressing on the deck: long bundle benches down both sides, braziers on mud at the front, fire-cages under the eaves
  for(const s of[-1,1]){const x=XH+s*(LW/2-.75);for(const yy of[.18,.42])kput('hRLBundleX',[x,yy,zlm-.4],qEuler(0,Math.PI/2,0),[4.6,.14,.2],old);vB('hRLMatB',x,.5,zlm-.4,.5,.06,4.6,0,c);
   hnRLBrazier(XH+s*(LW/2-.9),zl1-1.2,.7);hnRLCage(XH+s*(LW/2-.2),ph-.05,zl1-.3);}
  // canoes tied along both sides of the landing, the great boat lying off its right-hand corner
  hnRLMoor(G,XH-LW/2-.25,zl0+4.4,Math.PI,{L:4.4,W:1.15,folk:1});hnRLMoor(G,XH+LW/2+.25,zl0+5,0,{L:5,W:1.25,folk:1});
  hnRLBoat(G,XH+LW/2+4.2,zl1+.4,.12,8,2,{heads:2,cabin:true,folk:2});beam('vRope',[XH+LW/2-.2,RL.WATER+.9,zl1-.3],[XH+LW/2+3.4,RL.WATER+.4,zl1-1.8],.02,.02,rope);}
 // folk: on the terrace, at the door, on the landing
 vnFolk(XH,fz+3,4,2.6);hnRLFolk(XH,0,zlm,3,2.2);vnFolk(T.XA,afz+1.6,1,.8);}

RL.def({key:'rl_tavern',name:"Reed's Local",family:'Hospitality',tags:{type:['tavern/inn'],wealth:'middle',lit:false,landmark:true},
 w:RLTAV.W,d:RLTAV.D,h:12,landing:RLTAV.LAND,build:buildRLTavern});
