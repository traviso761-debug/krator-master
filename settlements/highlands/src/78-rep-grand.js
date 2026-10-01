// ================================================================= HIGHLANDS / REPUBLICAN — grand works (package R-C)
// The seat and the sinews of the Iron Republic: the Hall of the Republic, the fortress, the Peles-style town wall
// with its towers and gate, the Forgehouse and the generator. Massing of the Hall after the "hall of the republic"
// sketch (a broad raised platform, a great stepped pyramidal roof rising to a central spire, an arched entrance
// hall, tiered spire-pavilions at the corners, colonnaded verandas); its details after Peles (rubble socle, cream
// stucco and ashlar, red-brown half-timber and carved loggias, dark slate, gold finials, clock faces) and the kit's
// own notes (painted dougong under every tier, formline crest boards, a monumental totem pair at the stair).
// Industry keeps the Iziz note: salvaged Ancient sheet and pipe, corrugate patches, rusted iron stacks.
// Seeds 21200–21499 (this file) and 21500–21799 (79-rep-land.js).

// ---------------------------------------------------------------- package helpers (prefix hnRC / hRC)
// Frustum skirts for the stepped roofs: a wedge whose top is (tx*w, tz*d). One kit item per quantised top ratio,
// defined on first use (a handful per scene), so every tier is one instance.
const HRC_SK={};
function hRCSkItem(tx,tz,mat){const q=v=>Math.round(Math.min(.96,Math.max(.04,v))*50)/50;tx=q(tx);tz=q(tz);mat=mat||'scale';
 const k='hRCSk_'+mat+'_'+Math.round(tx*100)+'_'+Math.round(tz*100);if(!HRC_SK[k]){HRC_SK[k]=1;kdef(k,vnWedgeGeo(tx,tz),MAT[mat]);}return k;}
// skirt from w x d at y up to tw x td at y+rise
function hnRCSkirt(x,y,z,w,d,tw,td,rise,ry,c,mat){kput(hRCSkItem(tw/w,td/d,mat),[x,y,z],ry?qEuler(0,ry,0):null,[w,rise,d],c||null);}
// A flared roof tier (the stepped roof of the Hall, the pavilions): a shallow kick at the eave and a steeper
// upper skirt, a painted fascia and gilded upturned corner horns. Eave outline ow x od at y, top tw x td.
function hnRCTier(x,y,z,ow,od,tw,td,rise,ry,c,o){o=o||{};const K=.3,KR=.15;const kw=ow-(ow-tw)*K,kd=od-(od-td)*K;
 hnRCSkirt(x,y,z,ow,od,kw,kd,rise*KR,ry,c);hnRCSkirt(x,y+rise*KR-.03,z,kw,kd,tw,td,rise*(1-KR)+.03,ry,c);
 const fc=o.fasciaC||hC(HPAL.red);
 for(const s of[-1,1]){let p=loc(x,z,0,s*(od/2+.07),ry);vB('hPaint',p[0],y-.34,p[1],ow+.24,.36,.1,ry,fc);
  p=loc(x,z,s*(ow/2+.07),0,ry);vB('hPaint',p[0],y-.34,p[1],.1,.36,od+.04,ry,fc);}
 if(o.horns!==false)for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(ow/2+.05),sz*(od/2+.05),ry);
  kput('hArm',[p[0],y-.02,p[1]],qEuler(0,ry+Math.atan2(sx,sz)+Math.PI/2,0),[1.2,.75,.3],o.hornC||hC(HPAL.gold[0]));}
 return y+rise;}
// A slender pyramidal spire with an iron finial, gold ball and a pennant; returns the tip.
function hnRCSpire(x,y,z,b,h,ry,c,o){o=o||{};kput(o.tile?'hPyrTile':'hPyrSc',[x,y,z],qEuler(0,ry,0),[b,h,b],o.tile?null:c||null);const gold=hC(HPAL.gold[0]);
 const t=y+h*.97,fh=Math.max(1.2,h*.1);vPst('vIron',x,t-.4,z,.05+b*.006,fh+.6,hC(0x2e2a26));vBall('hGold',x,t+.15,z,.16+b*.025,gold);vBall('hGold',x,t+fh*.75,z,.1+b*.01,gold);
 if(o.flag){const p=loc(x,z,.75,0,ry);kput('vCloth',[p[0],t+fh-.25,p[1]],qEuler(0,ry,0),[1.5,.8,1],o.flagC||hC(HPAL.red));}
 return t+fh+.2;}
// Dormers (lucarnes) on the four faces of a pyramid of base b, height h standing at y: plaster cheeks, a little
// scale gable, a window.
function hnRCDormers(x,y,z,b,h,ry,c,wallC,frac){frac=frac||.16;const t=h*frac,dist=b/2*(1-frac),dw=Math.max(.7,b*.2),dh=Math.max(.8,b*.2);
 for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;const p=loc(x,z,0,dist-dw*.35,a);vB('vPlaster',p[0],y+t,p[1],dw,dh,dw*1.3,a,wallC);
  const f=loc(x,z,0,dist-dw*.35+dw*.65,a);vnWin(f[0],y+t+dh*.18,f[1],a,dw*.5,dh*.55,'glass','hPaint',hC(HPAL.white));
  vnGableRoof(p[0],y+t+dh,p[1],dw*1.3,dw,dw*.7,a+Math.PI/2,'hGableSc',c,.12);}}
// A carved loggia belt (the Peles signature) of side L and height LH standing at y: plank floor, dark core, carved
// posts with keel arches between them, lace balustrade, a formline frieze on the head beam. Returns the top.
function hnRCLoggia(x,y,z,L,LH,ry,wood,o){o=o||{};vB('vWood',x,y,z,L+.1,.22,L+.1,ry,wood);const Y=y+.22;vB('vDarkB',x,Y,z,L-1.1,LH,L-1.1,ry);
 const n=Math.max(2,Math.round(L/1.6));
 for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;const f=loc(x,z,0,L/2-.02,a);kput('hLaceB',[f[0],Y+.5,f[1]],qEuler(0,a,0),[L-.1,.95,1],wood);
  const r=loc(x,z,0,L/2-.08,a);vB('vWood',r[0],Y+.95,r[1],L,.1,.16,a,wood);
  for(let i=0;i<n;i++){const p=loc(x,z,-L/2+.12+(L-.24)*i/n,L/2-.12,a);vPst('vPost',p[0],Y,p[1],.1,LH,wood);}
  for(let i=0;i<n;i++){const p=loc(x,z,-L/2+.12+(L-.24)*(i+.5)/n,L/2-.1,a);kput('hKeelW',[p[0],Y+LH-.8,p[1]],qEuler(0,a,0),[(L-.24)/n-.22,.78,.1],wood);}
  if(o.frieze!==false)hnFrieze(r[0],Y+LH,r[1],a,L+.06,.42);}
 vB('vWood',x,Y+LH,z,L-.1,.44,L-.1,ry,wood);if(o.lit)vBall('vBulb',x,Y+LH-.3,z,.18);
 return Y+LH+.44;}
// Solid stone flight (monumental stairs): steps rise toward -z of ry from the front edge at (x,z).
function hnRCFlight(x,y,z,ry,w,rise,item,c){const n=Math.max(2,Math.round(rise/.16)),tr=.34;for(let k=0;k<n;k++){const p=loc(x,z,0,-(k+.5)*tr,ry);vB(item||'vStone',p[0],y,p[1],w,rise*(k+1)/n,tr+.01,ry,c);}return n*tr;}
// Grid paving: flags with joints (no overlapping slabs, so no z-fighting), on a darker bed.
function hnRCPave(x,z,w,d,ry,c,cell){cell=cell||2.2;const nx=Math.max(1,Math.round(w/cell)),nz=Math.max(1,Math.round(d/cell));vB('vStone',x,0,z,w,.14,d,ry,c.clone().multiplyScalar(.6));   // round 10: a 14 cm bed, clear of levelled terrain
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const p=loc(x,z,-w/2+(i+.5)*w/nx,-d/2+(j+.5)*d/nz,ry);vB('vFlag',p[0],.14,p[1],w/nx-.08,.04+rng()*.012,d/nz-.08,ry,c.clone().multiplyScalar(rr(.9,1.06)));}}
// Low ashlar balustrade from a to b (local [x,z]) at base y: a parapet with a coping and posts every ~3.5 m.
function hnRCBalus(a,b,y,c,h){h=h||.95;const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ry=Math.atan2(dx,dz)-Math.PI/2,m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 vB('vStone',m[0],y,m[1],L,h-.14,.32,ry,c);vB('vStone',m[0],y+h-.14,m[1],L+.1,.14,.44,ry,c.clone().multiplyScalar(1.05));
 const n=Math.max(1,Math.round(L/3.5));for(let i=0;i<=n;i++){const t=i/n;vB('vStone',a[0]+dx*t,y,a[1]+dz*t,.55,h+.2,.55,ry,c);}}
// Arch in a face: a voussoir ring of radius R springing at y+Hs over an opening of width 2R that the caller leaves
// open, and stepped spandrel fill (depth T behind the face) from the springing up to fillTo, out to half-width Wo.
function hnRCArch(x,y,z,ry,R,Hs,T,fillTo,Wo,fillItem,fillC,vC_){const n=11;
 for(let i=0;i<n;i++){const th=(i+.5)/n*Math.PI;const p=loc(x,z,(R+.35)*Math.cos(th),.08,ry);
  kput('vStone',[p[0],y+Hs+(R+.35)*Math.sin(th),p[1]],vQ(ry,0,th+Math.PI/2),[Math.PI*(R+.35)/n+.02,.7,T*.5+.2],vC_);}
 const m=6;for(let j=0;j<m;j++){const y0=Hs+R*j/m,y1=j===m-1?Math.max(Hs+R,fillTo-y):Hs+R*(j+1)/m;const xin=Math.sqrt(Math.max(0,R*R-Math.pow(R*j/m,2)));
  for(const s of[-1,1]){const u0=xin,u1=Wo;if(u1<=u0)continue;const p=loc(x,z,s*(u0+u1)/2,-T/2,ry);vB(fillItem,p[0],y+y0,p[1],u1-u0,y1-y0,T,ry,fillC);}}
 if(fillTo>y+Hs+R){const p=loc(x,z,0,-T/2,ry);vB(fillItem,p[0],y+Hs+R*(m-1)/m,p[1],2*R*.6,fillTo-(y+Hs+R*(m-1)/m),T,ry,fillC);}}

// Townsfolk standing on a floor at height y (vnFolk always stands them on the ground).
function hnRCFolk(x,y,z,n,spread){for(let i=0;i<n;i++){const px=x+rr(-spread,spread),pz=z+rr(-spread,spread),c=hC(vPick([0xe8d9b8,0xc9442a,0x2f8f8a,0x7a3d8a,0xe0a030,0x3b4a8a,0x8a6a3a]));
 kput('figB',[px,y,pz],qEuler(0,rng()*TAU,0),1,c);kput('figH',[px,y,pz],null,1,hC(0xc9a17e));}}
// Heaps (coal, spoil, gravel, grain), furnace glow, still water — kit items of this package.
kdef('hRCHeap',VCONE,MAT.rubbleW);MAT.rcGlow=new THREE.MeshBasicMaterial({color:0xd8380a,toneMapped:false});kdef('hRCGlow',VBOX,MAT.rcGlow);
MAT.rcWater=hStd({color:0xffffff,roughness:.18,metalness:.2});kdef('hRCWater',VBOX,MAT.rcWater);
kdef('hRCLeaf',new THREE.IcosahedronGeometry(1,0),MAT.moss);kdef('hRCHedgeB',VBOX,MAT.moss);   // cheap foliage: crops, topiary, hedges
// a heap of radius r, height h (a cone with a few lumps round its foot)
function hnRCHeap(x,y,z,r,h,c,lumps){kput('hRCHeap',[x,y-.05,z],qEuler(0,rng()*TAU,0),[r,h,r*rr(.8,1)],c);const n=lumps===undefined?Math.round(r*2):lumps;
 for(let i=0;i<n;i++){const a=rng()*TAU,d=r*rr(.75,1.05);kput('vRock',[x+Math.cos(a)*d,y+.08,z+Math.sin(a)*d],qEuler(rng(),rng(),0),[rr(.15,.4),rr(.1,.25),rr(.15,.4)],c);}}
// A wheel (water wheel, headframe sheave, cart wheel) with its axle along local x of ry: two rims, spokes, and
// paddles/buckets between the rims (np=0: none).
function hnRCWheel(x,y,z,r,wd,ry,c,ns,np,rimC){const q0=qEuler(0,ry+Math.PI/2,0);ns=ns||8;
 for(const s of[-1,1]){const p=loc(x,z,s*wd/2,0,ry);kput('vHoop',[p[0],y,p[1]],q0,[r,r,1.6],rimC||c);
  for(let k=0;k<ns/2;k++)kput('vWood',[p[0],y,p[1]],q0.clone().multiply(qEuler(0,0,k*TAU/ns)),[2*r*.96,Math.max(.06,r*.035),Math.max(.06,r*.035)],c);}
 const xa=hRot(ry+Math.PI/2,[1,0,0]);
 for(let k=0;k<(np||0);k++){const th=k*TAU/np;const R=r*.9;kput('vWood',[x+xa[0]*Math.cos(th)*R,y+Math.sin(th)*R,z+xa[2]*Math.cos(th)*R],q0.clone().multiply(qEuler(0,0,th)),[r*.24,.07,wd],c);}
 const a=loc(x,z,-wd/2-.5,0,ry),b=loc(x,z,wd/2+.5,0,ry);vBeam([a[0],y,a[1]],[b[0],y,b[1]],Math.max(.12,r*.06),hC(0x2e2a26),'vIron');}
// A jib crane: timber mast on a stone foot, a jib at `jy` swung to yaw a, a tie from the mast head, a chain and a load.
function hnRCJib(x,z,h,L,a,c,load){const iron=hC(0x2e2a26);vB('vStone',x,0,z,1.4,.5,1.4,0,hC(vPick(HPAL.rubble)));vPst('vPost',x,.5,z,.26,h,c);const jy=h*.78;
 const e=[x+Math.sin(a)*L,jy,z+Math.cos(a)*L];vBeam([x,jy,z],e,.26,c);vBeam([x,h+.4,z],[e[0],e[1]+.1,e[2]],.05,iron,'vRope');vBeam([x+Math.sin(a)*L*.5,jy-1.6,z+Math.cos(a)*L*.5],[x,jy-3.2,z],.2,c);
 vB('vIron',e[0],jy-.4,e[2],.4,.4,.4,a,iron);const hy=Math.max(1.4,jy*.35);vBeam([e[0],jy-.4,e[2]],[e[0],hy+.5,e[2]],.04,iron,'vRope');vB('vIron',e[0],hy+.2,e[2],.3,.3,.3,a,iron);
 if(load)kput(load,[e[0],hy-.4,e[2]],qEuler(0,a,0),[1.8,.7,.9],null);}
// Scattered salvage (the Iziz note): heaps of Ancient salvage from the catalog, one per ~20 scraps asked for, spread
// along the area's long side. Each scrap drew 10 numbers (9 for a pipe).
function hnRCScrap(x,z,rx,rz,n){for(let i=0;i<n;i++){hlRngSkip(2);const r=rng();hlRngSkip(r<.5?7:r<.75?6:7);}
 const m=Math.max(1,Math.round(n/20)),X=rx>=rz;for(let k=0;k<m;k++){const t=m>1?-1+2*k/(m-1):0;
  FURNISH('hl_rep_scrap_heap',x+(X?t*(rx-1.8):0),0,z+(X?0:t*(rz-1.8)),X?0:Math.PI/2,{v:1});}}
// A tapering brick stack from y: three stages, iron bands, a soot cap. Returns the top.
function hnRCStack(x,y,z,b,h,c){c=c||hC(vPick([0x8a4a36,0x7a4232,0x965640]));let yy=y,w=b;const iron=hC(0x2e2a26);for(let k=0;k<3;k++){const hh=h/3;vB('vStone',x,yy,z,w,hh+.02,w,0,c);
 vB('vIron',x,yy+hh-.5,z,w+.08,.14,w+.08,0,iron);yy+=hh;w*=.84;}
 vB('vStone',x,yy,z,w+.5,.5,w+.5,0,c.clone().multiplyScalar(.7));vB('vDarkB',x,yy+.5,z,w*.6,.02,w*.6,0);return yy+.5;}
// Ground-level rails (a narrow-gauge track) from a to b (local [x,z]).
function hnRCRails(a,b,gauge){gauge=gauge||1.0;const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ry=Math.atan2(dx,dz),iron=hC(0x3a3632),wd=hC(vPick(HPAL.aged));
 for(const s of[-1,1]){const p=loc((a[0]+b[0])/2,(a[1]+b[1])/2,s*gauge/2,0,ry);vB('vIron',p[0],.1,p[1],.08,.1,L,ry,iron);}
 const n=Math.round(L/.8);for(let i=0;i<=n;i++){vB('vWood',a[0]+dx*i/n,0,a[1]+dz*i/n,gauge+.6,.1,.22,ry,wd);}}
// An ore tub on the rails at (x,z) heading ry, loaded: furniture, the catalog's coal tub.
function hnRCTub(x,z,ry,loadC){return FURNISH('hl_rep_rail_tub',x,0,z,ry,{v:0});}

// ---------------------------------------------------------------- the Peles tower (wall towers, gate, fortress)
// o: {roof:'spire'|'tent'|'tiers', tiers, loggia(default true), clock, lit, rubbleTo (fraction), cream, roofC,
//     beamC, flag, pinnacles}. Returns the tip y.
function hnRCTower(x,y,z,w,h,ry,o){o=o||{};const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),cream=o.cream||hC(vPick(HPAL.stucco)),wood=o.beamC||hC(vPick(HPAL.redwood)),roofC=o.roofC||hC(vPick(HPAL.slate));
 const lit=o.lit?'lit':'glass';
 vB('hRubB',x,y,z,w+1.2,1.1,w+1.2,ry,rub.clone().multiplyScalar(.85));vB('vStone',x,y+1.1,z,w+.9,.22,w+.9,ry,ash);
 const hs=Math.max(3,h*(o.rubbleTo===undefined?.42:o.rubbleTo));vB('hRubB',x,y+1.32,z,w,hs-1.32,w,ry,rub);vB('vStone',x,y+hs,z,w+.22,.3,w+.22,ry,ash);
 hnStucco(x,y+hs+.3,z,w,h-hs-.3,w,ry,cream,ash);
 const clockY=y+h-w*.36-.5;
 for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;
  for(let yy=y+2.4;yy<y+hs-1.5;yy+=3.4){const p=loc(x,z,0,w/2+.02,a);vB('vDarkB',p[0],yy,p[1],.2,1.2,.08,a);const q=loc(x,z,0,w/2+.05,a);vB('vStone',q[0],yy+1.2,q[1],.55,.2,.1,a,ash);}
  const top=o.clock?clockY-w*.3-1.9:y+h-2.4;
  for(let yy=y+hs+1.3;yy<top;yy+=3.8){const p=loc(x,z,0,w/2,a);vnWin(p[0],yy,p[1],a,.8,1.6,lit,'vStone',ash);const q=loc(x,z,0,w/2+.12,a);kput('hKeelP',[q[0],yy+1.72,q[1]],qEuler(0,a,0),[1.3,.62,.12],ash);}
  if(o.clock){const p=loc(x,z,0,w/2+.08,a);vB('vStone',p[0],clockY-w*.33,p[1],w*.66,w*.66,.1,a,ash);const q=loc(x,z,0,w/2+.16,a);kput('hClock',[q[0],clockY,q[1]],qEuler(0,a,0),[w*.56,w*.56,1],null);}
  // corbel table carrying the loggia
  const nc=Math.max(3,Math.round(w/.8));for(let i=0;i<nc;i++){const p=loc(x,z,-w/2+.3+(w-.6)*i/(nc-1),w/2+.22,a);vB('vStone',p[0],y+h-.55,p[1],.34,.55,.5,a,ash);}}
 vB('vStone',x,y+h,z,w+1.0,.3,w+1.0,ry,ash);let top=y+h+.3;
 const L=w+.9;
 if(o.loggia!==false)top=hnRCLoggia(x,top,z,L,o.LH||2.8,ry,wood,{lit:o.lit});
 const roof=o.roof||'spire';
 if(roof==='spire'){const b=L+.7,hh=o.spireH||w*2.3;hnRCDormers(x,top-.1,z,b,hh,ry,roofC,cream);
  if(o.pinnacles!==false)for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(L/2-.1),sz*(L/2-.1),ry);kput('hOctP',[p[0],top-.1,p[1]],null,[.5,1.3,.5],cream);
   kput(o.tile?'hTentTileW':'hTentSc',[p[0],top+1.15,p[1]],null,[.62,2.1,.62],o.tile?null:roofC);vBall('hGold',p[0],top+3.3,p[1],.12,hC(HPAL.gold[0]));}
  return hnRCSpire(x,top-.1,z,b,hh,ry,roofC,{flag:o.flag,flagC:o.flagC,tile:o.tile});}
 if(roof==='tent'){const r=(L+1.2)*.62,hh=o.spireH||w*1.8;kput(o.tile?'hTentTileW':'hTentSc',[x,top-.15,z],qEuler(0,ry,0),[r,hh,r],o.tile?null:roofC);
  for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;const p=loc(x,z,0,r*.62,a);vB('vPlaster',p[0],top+hh*.16,p[1],.8,.9,1.0,a,cream);vnGableRoof(p[0],top+hh*.16+.9,p[1],1.0,.8,.5,a+Math.PI/2,'hGableSc',roofC,.1);}
  const t=top-.15+hh;vPst('vIron',x,t-.4,z,.06,2,hC(0x2e2a26));vBall('hGold',x,t+.2,z,.2,hC(HPAL.gold[0]));
  if(o.flag){const p=loc(x,z,.75,0,ry);kput('vCloth',[p[0],t+1.2,p[1]],qEuler(0,ry,0),[1.5,.8,1],o.flagC||hC(HPAL.red));}return t+1.7;}
 return hnRCPagoda(x,top,z,L,ry,o.tiers||2,roofC,{cream,wood});}
// Tiered pagoda-spire crown on a square body of side w whose top is y (the Hall's pavilions and central tower):
// n flared tiers separated by short painted bands, then a slender spire. Returns the tip.
function hnRCPagoda(x,y,z,w,ry,n,c,o){o=o||{};const cream=o.cream||hC(vPick(HPAL.stucco)),wood=o.wood||hC(vPick(HPAL.redwood));let cw=w,yy=y;
 for(let i=0;i<n;i++){const ow=cw+(i===0?2.6:1.8),tw=cw*.64,rise=cw*.3;hnRCTier(x,yy,z,ow,ow,tw,tw,rise,ry,c,{fasciaC:o.fasciaC});yy+=rise;
  const bw=tw*.9,bh=Math.max(1.3,cw*.24);vB('vPlaster',x,yy-.35,z,bw,bh+.35,bw,ry,cream);
  for(let k=0;k<4;k++){const a=ry+k*Math.PI/2;const f=loc(x,z,0,bw/2,a);vnWin(f[0],yy+bh*.22,f[1],a,Math.min(.9,bw*.22),bh*.5,o.lit?'lit':'glass','hPaint',wood);
   for(const s of[-1,1]){const p=loc(x,z,s*(bw/2-.08),bw/2+.02,a);vB('vWood',p[0],yy-.1,p[1],.18,bh+.1,.08,a,wood);}
   const h2=loc(x,z,0,bw/2+.03,a);vB('vWood',h2[0],yy+bh-.2,h2[1],bw+.06,.2,.1,a,wood);}
  yy+=bh;cw=bw;}
 return hnRCSpire(x,yy-.1,z,cw+1.4,Math.max(4,cw*2.8),ry,c,{flag:o.flag});}

// ---------------------------------------------------------------- the town wall
// A straight run along local x of (x,z,ry), centred, OUTER face toward +z of ry. Tiles end to end (no overhang
// along the run). o: {H, T, hoard (default true: a roofed half-timber hoarding on stone corbels; false: stone
// crenellation), stair: -1|1 (a stone stair up the inner face at that end), ends (close the hoarding roof), c, roofC}
function hnRCWallRun(x,z,len,ry,o){o=o||{};const H=o.H||9,T=o.T||3.2,rub=o.c||hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),wood=o.wood||hC(vPick(HPAL.redwood)),roofC=o.roofC||hC(vPick(HPAL.slate)),cream=hC(vPick(HPAL.stucco));
 const P=(u,oo)=>loc(x,z,u,oo,ry);let p=P(0,0);
 vB('hRubB',p[0],0,p[1],len,1.0,T+1.1,ry,rub.clone().multiplyScalar(.86));vB('vStone',p[0],1.0,p[1],len,.24,T+.8,ry,ash);vB('hRubB',p[0],1.24,p[1],len,H-1.24,T,ry,rub);
 p=P(0,0);vB('vStone',p[0],H-2.1,p[1],len,.22,T+.14,ry,ash);                                          // string course
 // buttresses and arrow slits on the outer face
 const nb=Math.max(0,Math.floor(len/10));for(let i=0;i<nb;i++){const u=-len/2+len*(i+.5)/nb;p=P(u,T/2+.5);vB('hRubB',p[0],1.0,p[1],1.5,H-3.4,1.0,ry,rub.clone().multiplyScalar(.95));
  const q=P(u,T/2+.62);kput('hGableRub',[q[0],H-2.4,q[1]],qEuler(0,ry+Math.PI/2,0),[1.0,.9,1.5],rub);}
 const ns=Math.max(1,Math.round(len/3.4));for(let i=0;i<ns;i++){const u=-len/2+len*(i+.5)/ns;if(nb&&Math.abs(((u+len/2)/(len/nb))%1-.5)<.1)continue;p=P(u,T/2+.02);vB('vDarkB',p[0],3.6,p[1],.2,1.3,.08,ry);}
 p=P(0,0);vB('vWood',p[0],H,p[1],len,.1,T-.1,ry,hC(vPick(HPAL.aged)));                                 // wall-walk planking
 if(o.hoard!==false){
  const nc=Math.max(2,Math.round(len/1.6));for(let i=0;i<nc;i++){const u=-len/2+len*(i+.5)/nc;p=P(u,T/2+.45);vB('vStone',p[0],H-.9,p[1],.42,.7,.9,ry,ash);}
  p=P(0,T/2+.55);vB('vWood',p[0],H-.22,p[1],len,.2,1.3,ry,wood);                                       // hoarding floor on the corbels
  const HH=2.4;p=P(0,T/2+1.12);vB('vPlaster',p[0],H-.02,p[1],len,HH,.12,ry,cream);
  const f=P(0,T/2+1.18);hnFachFace(f[0],H-.02,f[1],ry,len,HH,wood,[],'glass');
  const nl=Math.max(1,Math.round(len/2.3));for(let i=0;i<nl;i++){const q=P(-len/2+len*(i+.5)/nl,T/2+1.26);vB('vDarkB',q[0],H+.75,q[1],.16,.7,.04,ry);}
  const ni=Math.max(1,Math.round(len/2.8));for(let i=0;i<=ni;i++){const q=P(-len/2+.15+(len-.3)*i/ni,-T/2+.22);vPst('vPost',q[0],H+.1,q[1],.1,HH+.1,wood);}
  p=P(0,-T/2+.22);vB('vWood',p[0],H+1.0,p[1],len,.1,.1,ry,wood);
  // the roof: a gable over the walk and the hoarding, ridge along the run
  const sp=T+1.3,oc=(1.3)/2-.05,pitch=o.pitch||.95,rise=pitch*sp/2,rc=P(0,oc);hnRCGableX(rc[0],H+HH-.02,rc[1],len,sp,rise,ry,'vCorr',o.sheetC||hC(vPick(HSV.corr)),.55,0,o.ends?'vGablePl':null,cream);}
 else{p=P(0,T/2-.3);vB('hRubB',p[0],H,p[1],len,1.0,.6,ry,rub);const nm=Math.max(2,Math.round(len/2.3));
  for(let i=0;i<nm;i++){const q=P(-len/2+len*(i+.5)/nm,T/2-.3);vB('hRubB',q[0],H+1.0,q[1],1.2,1.1,.6,ry,rub);vB('vStone',q[0],H+2.1,q[1],1.36,.16,.74,ry,ash);}
  p=P(0,-T/2+.2);vB('vStone',p[0],H,p[1],len,.9,.4,ry,ash);}
 if(o.stair){const s=o.stair,n=Math.round((H+.1)/.26),tr=.3;for(let k=0;k<n;k++){const u=s*(len/2-.6)-s*(k+.5)*tr;const q=P(u,-T/2-.75);vB('vStone',q[0],0,q[1],tr+.01,(H+.1)*(k+1)/n,1.5,ry,ash.clone().multiplyScalar(.92));}}
 if(o.lamps&&vLit()){const nl=Math.max(1,Math.round(len/14));for(let i=0;i<nl;i++){const q=P(-len/2+len*(i+.5)/nl,-T/2);hnWallLamp(q[0],H-1.4,q[1],ry+Math.PI);}}}
// Gable slabs with the ridge along local x and SEPARATE overhangs: `over` at the eaves, `overX` along the run (0 so
// that runs tile without overlapping slabs); optional end wedges. (vnGableRoof uses one overhang for both.)
function hnRCGableX(x,y,z,w,d,rise,ry,slabItem,slabC,over,overX,endItem,endC){const thick=.22;if(endItem)kput(endItem,[x,y,z],ry?qEuler(0,ry,0):null,[w,rise,d],endC||null);
 const a=Math.atan2(rise,d/2),ext=d/2+over,S=Math.hypot(ext,rise*ext/(d/2))+.1;
 for(const s of[-1,1]){const p=loc(x,z,0,s*ext/2,ry);const q=vQ(ry,s*a,0);const n=new THREE.Vector3(0,1,0).applyQuaternion(q).multiplyScalar(thick*.5);
  kput(slabItem,[p[0]+n.x,y+(rise-over*rise/(d/2))/2+n.y,p[1]+n.z],q,[w+2*overX,thick,S],slabC||null);}
 vB('vWood',x,y+rise+thick*.3,z,w+2*overX,.2,.44,ry,slabC?slabC.clone().multiplyScalar(.7):null);return y+rise;}

// ---------------------------------------------------------------- the town gate
// Twin Peles towers flanking an arched passage (open, with a raised portcullis and the leaves swung back), a crest
// and a clock over the arch, a jettied half-timber storey and a steep gable with a flèche. Wall line along local x
// at z=0, field side +z. o: {tw, th, stubs (m of wall each side), roofC, clock}
function hnRCGate(x,z,ry,o){o=o||{};const TW=o.tw||8.5,TH=o.th||17,BW=10,BD=10,R=2.5,Hs=4.4,top=13;
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),cream=hC(vPick(HPAL.stucco)),wood=hC(vPick(HPAL.redwood)),roofC=o.roofC||hC(vPick(HPAL.slate)),tar=hC(vPick(HPAL.tar)),iron=hC(0x2e2a26),lit=vLit();
 const P=(u,oo)=>loc(x,z,u,oo,ry);let p;
 // piers either side of the passage, the mass over it (rubble to 8 m, cream stucco above)
 for(const s of[-1,1]){p=P(s*(R+(BW/2-R)/2),0);vB('hRubB',p[0],0,p[1],BW/2-R,8,BD,ry,rub);}
 p=P(0,0);vB('hRubB',p[0],Hs+R+.6,p[1],2*R+.02,8-(Hs+R+.6),BD-1.6,ry,rub);vB('vStone',p[0],8,p[1],BW+.2,.3,BD+.2,ry,ash);hnStucco(p[0],8.3,p[1],BW,top-8.3,BD,ry,cream,ash);
 for(const s of[1,-1]){const f=P(0,s*BD/2);hnRCArch(f[0],0,f[1],ry+(s>0?0:Math.PI),R,Hs,.8,Hs+R+.6,BW/2,'hRubB',rub,ash);
  for(const t of[-1,1]){const j=P(t*(R+.25),s*(BD/2+.06));vB('vStone',j[0],0,j[1],.5,Hs,.14,ry,ash);}}
 p=P(0,0);vB('vDarkB',p[0],Hs+R-.2,p[1],2*R-.2,.8,BD-1.7,ry);                                      // vault shadow
 // portcullis (raised), gate leaves swung back against the passage walls, cobbles
 {const zq=BD/2-1.2;for(let i=0;i<=10;i++){const q=P(-R+.1+(2*R-.2)*i/10,zq);vB('vIron',q[0],Hs-.2,q[1],.09,R+1.0,.09,ry,iron);kput('vConeI',[q[0],Hs-.45,q[1]],qEuler(Math.PI,0,0),[.07,.3,.07],iron);}
  for(let j=0;j<4;j++){const q=P(0,zq);vB('vIron',q[0],Hs+j*.8,q[1],2*R-.1,.08,.1,ry,iron);}
  for(const s of[-1,1]){const q=P(s*(R-.12),zq-2.0);vB('vWood',q[0],0,q[1],.14,Hs+.6,2.4,ry,tar);for(const yy of[.8,2.4,4.0])vB('vIron',q[0]-s*.02,yy,q[1],.16,.12,2.3,ry,iron);}
  p=P(0,0);vB('vStone',p[0],0,p[1],2*R,.04,BD+2,ry,hC(vPick(HPAL.rubble)).multiplyScalar(.8));}
 // over the arch on the field side: the painted crest, the clock, lamps
 {const f=P(0,BD/2);hnForm('hFormA',f[0],8.5,f[1],ry,4.4,2.2);if(o.clock!==false){const q=P(0,BD/2+.06);vB('vStone',q[0],10.9,q[1],2.9,2.2*1.3,.1,ry,ash);const c2=P(0,BD/2+.14);kput('hClock',[c2[0],12.0,c2[1]],qEuler(0,ry,0),[2.4,2.4,1],null);}
  if(lit)for(const s of[1,-1])for(const t of[-1,1]){const q=P(t*(R+1.1),s*BD/2);hnWallLamp(q[0],4.2,q[1],ry+(s>0?0:Math.PI));}
  const b=P(0,-BD/2);hnForm('hFormA',b[0],8.6,b[1],ry+Math.PI,3.6,1.8);}
 // jettied half-timber storey and the steep gable, gable end to the field, with a flèche on the ridge
 p=P(0,0);vB('vStone',p[0],top,p[1],BW+.6,.25,BD+.6,ry,ash);hnJetty(p[0],top+.6,p[1],BW,BD,ry,wood,.4);
 hnFachBox(p[0],top+.6,p[1],BW,3.4,BD+.8,ry,cream,wood,lit?'lit':'glass');const y3=top+4.0;
 const rt=hnGable(p[0],y3,p[1],BD+.8,BW,1.45,ry+Math.PI/2,'hGableSc',roofC,.6,'vGablePl',cream);hnBarge(p[0],y3,p[1],BD+.8,BW,1.45*BW/2,ry+Math.PI/2,.6,wood,'lace');
 {const f=P(0,(BD+.8)/2+.02);hnForm('hFormT',f[0],y3+1.2,f[1],ry,3.2,1.6);}
 {const q=P(0,-1);kput('hOctW',[q[0],rt-1.2,q[1]],qEuler(0,ry,0),[1.0,2.6,1.0],wood);hnRCSpire(q[0],rt+1.3,q[1],2.3,6.5,ry,roofC,{flag:true,flagC:hC(HPAL.teal)});}
 // the twin towers, pushed a little toward the field
 for(const s of[-1,1]){const q=P(s*(BW/2+TW/2),.8);hnRCTower(q[0],0,q[1],TW,TH,ry,{roof:'spire',tile:o.tile,lit,roofC,beamC:wood,cream,flag:s>0});}
 if(o.stubs){for(const s of[-1,1]){const q=P(s*(BW/2+TW+o.stubs/2-.4),0);hnRCWallRun(q[0],q[1],o.stubs+.8,ry,{roofC,wood,c:rub,ends:true});}}
 if(lit)for(const s of[-1,1]){const q=P(s*(BW/2+1.2),BD/2+4);hnLampPost(q[0],0,q[1],4.2);}}

// ================================================================= MONUMENTS
// ---------------------------------------------------------------- Hall of the Republic
function buildHlRepHallRepublic(G,o){reseed(21201+(o.v|0));
 const P=2.4,FL=P+.04,ZC=-10,lit=vLit()?'lit':'glass';
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),cream=hC(vPick(HPAL.stucco)),red=hC(vPick(HPAL.redwood)),gold=hC(HPAL.gold[0]),white=hC(HPAL.white);
 const roofC=(o.v|0)%2?hC(vPick(HPAL.roofGreen)):hC(HPAL.slate[1]),pavC=hC(vPick(HPAL.roofGreen)),flagC=hC(HPAL.red);
 vnReg('Hall of the Republic',0,-6,58,68);vnReg('Hall of the Republic — forecourt',0,40,22,14);
 // ---- the platform: rubble socle with an ashlar cap, balustrade, the grand stair, side flights
 hnSocle(0,0,-6,110,P,76,0,rub,ash);
 for(const s of[-1,1]){hnRCBalus([s*14.6,32],[s*34.5,32],FL,ash);hnRCBalus([s*45.5,32],[s*54.6,32],FL,ash);hnRCBalus([s*54.6,32],[s*54.6,-43.6],FL,ash);}
 hnRCBalus([-54.6,-43.6],[54.6,-43.6],FL,ash);
 hnRCFlight(0,0,37.1,0,28,P,'vStone',ash);for(const s of[-1,1]){vB('vStone',s*14.6,0,34.5,1.2,P+.9,5.4,0,ash);hnRCFlight(s*40,0,37.1,0,10,P,'vStone',ash);for(const t of[-1,1])vB('vStone',s*40+t*5.4,0,34.5,.8,P+.7,5.4,0,ash);}
 // the forecourt: paving, lamps, the monumental totem pair on their pedestals, flag poles
 hnRCPave(0,44,34,13.6,0,hC(vPick(HPAL.ashlar)).multiplyScalar(.95),2.6);
 for(const s of[-1,1]){vB('vStone',s*16.5,0,39.6,2.6,1.3,2.6,0,ash);vB('vStone',s*16.5,1.3,39.6,2.2,.2,2.2,0,rub);hnTotem(s*16.5,1.5,39.6,.62,12.5,0,{wings:3.4,wingAt:.8,hat:true,painted:s>0});
  for(let k=0;k<2;k++){vB('vStone',s*(8+k*9),0,48.6,1.1,.6,1.1,0,ash);vnBannerPole(s*(8+k*9),.6,48.6,0,9,k%2?flagC:hC(HPAL.teal));}
  if(vLit())for(let k=0;k<2;k++)hnLampPost(s*(5+k*8),0,41.5,4.2);}
 // ---- the ring hall: cream stucco with quoins and pilasters, arched lit windows, a cornice with dougong
 const RW=62,RD=52,RH=7.5,rz0=ZC-RD/2,rz1=ZC+RD/2;hnStucco(0,FL,ZC,RW,RH,RD,0,cream,ash);vB('vStone',0,FL+RH-.4,ZC,RW+.3,.4,RD+.3,0,ash);
 vB('vStone',0,FL,ZC,RW+.3,.6,RD+.3,0,rub);
 const face=(a,L,fn)=>{for(let u=-L/2+2.6;u<=L/2-2.5;u+=4.4)fn(u,a);};
 for(const [a,L,D] of [[0,RW,RD],[Math.PI,RW,RD],[Math.PI/2,RD,RW],[-Math.PI/2,RD,RW]])face(a,L,(u,a)=>{const c=loc(0,ZC,u,D/2,a);
  if(a===0&&Math.abs(u)<12)return;vnWin(c[0],FL+1.8,c[1],a,1.3,2.6,lit,'vStone',ash);const q=loc(0,ZC,u,D/2+.12,a);kput('hKeelP',[q[0],FL+4.5,q[1]],qEuler(0,a,0),[2.1,.9,.12],ash);
  const pp=loc(0,ZC,u+2.2,D/2+.05,a);vB('vStone',pp[0],FL+.6,pp[1],.6,RH-1.0,.12,a,ash);});
 // ---- the core: rises through the ring roof as a half-timber clerestory
 const CW=44,CD=36;hnStucco(0,FL,ZC,CW,15.4-FL,CD,0,cream,false);hnFachBox(0,15.4,ZC,CW,4.6,CD,0,cream,red,lit);
 // tier A: the ring roof, dougong under its eaves on the flanks and back
 hnBracketRow(0,FL+RH-1.15,rz0,Math.PI,RW-2,18,.75);for(const s of[-1,1])hnBracketRow(s*RW/2,FL+RH-1.15,ZC,s*Math.PI/2,RD-2,15,.75);
 hnRCTier(0,FL+RH+.05,ZC,RW+2.6,RD+2.6,CW,CD,6.0,0,roofC);
 // tier B, band B, tier C, band C, tier D — the great stepped roof, dougong under each eave
 let y=20;hnBracketRow(0,y-1.25,ZC+CD/2,0,CW-2,13,.95);hnBracketRow(0,y-1.25,ZC-CD/2,Math.PI,CW-2,13,.95);for(const s of[-1,1])hnBracketRow(s*CW/2,y-1.25,ZC,s*Math.PI/2,CD-2,11,.95);
 y=hnRCTier(0,y,ZC,CW+5,CD+5,30,24,5.6,0,roofC);
 hnFachBox(0,y-.4,ZC,28,3.8,22,0,cream,red,lit);y+=3.4;
 hnBracketRow(0,y-1.05,ZC+11,0,26,8,.8);hnBracketRow(0,y-1.05,ZC-11,Math.PI,26,8,.8);for(const s of[-1,1])hnBracketRow(s*14,y-1.05,ZC,s*Math.PI/2,20,6,.8);
 y=hnRCTier(0,y,ZC,32,26,18,14,4.6,0,roofC);
 vB('vPlaster',0,y-.4,ZC,17,3.2,13,0,cream);for(const [a,L,D] of [[0,17,13],[Math.PI,17,13],[Math.PI/2,13,17],[-Math.PI/2,13,17]]){const f=loc(0,ZC,0,D/2,a);hnFrieze(f[0],y+2.2,f[1],a,L,.5);
  for(const u of[-L/2+2.5,0,L/2-2.5]){const q=loc(0,ZC,u,D/2,a);vnWin(q[0],y+.4,q[1],a,1.1,1.5,lit,'hPaint',red);}}
 y+=2.8;y=hnRCTier(0,y,ZC,20,16,10,10,3.4,0,roofC);
 // the central tower: clock stage, loggia, a tiered crown and the spire
 {const TWc=9.4,yb=y-.4;hnStucco(0,yb,ZC,TWc,6.4,TWc,0,cream,ash);vB('vStone',0,yb+6.4,ZC,TWc+.4,.3,TWc+.4,0,ash);
  for(let k=0;k<4;k++){const a=k*Math.PI/2;const p=loc(0,ZC,0,TWc/2+.08,a);vB('vStone',p[0],yb+1.2,p[1],4.6,4.6,.1,a,ash);const q=loc(0,ZC,0,TWc/2+.16,a);kput('hClock',[q[0],yb+3.5,q[1]],qEuler(0,a,0),[4,4,1],null);
   const g=loc(0,ZC,0,TWc/2+.2,a);kput('hKeelG',[g[0],yb+5.85,g[1]],qEuler(0,a,0),[3.2,.9,.06]);}
  let t=hnRCLoggia(0,yb+6.7,ZC,TWc+.8,2.9,0,red,{lit:vLit()});
  hnRCPagoda(0,t,ZC,TWc+.8,0,2,roofC,{cream,wood:red,lit:vLit(),flag:true});}
 // ---- the entrance hall: a keel-vaulted (bochka) pavilion with the great arched portal
 {const EW=22,ED=14,EZ=ZC+RD/2+ED/2,EH=9;hnStucco(0,FL,EZ,EW,EH,ED,0,cream,ash);vB('vStone',0,FL,EZ,EW+.3,.6,ED+.3,0,rub);
  const fz=EZ+ED/2;hnBochka(0,FL+EH,EZ-1,ED+3,EW+1.6,9.4,Math.PI/2,'hKeelSc',roofC);
  kput('hKeelG',[0,FL+EH-.02,fz+1.57],null,[EW+.9,9.0,.08]);kput('hKeelP',[0,FL+EH+.1,fz+1.66],null,[EW-.4,8.2,.08],cream);
  hnForm('hFormA',0,FL+EH+1.2,fz+1.64,0,9.6,4.8);
  for(const s of[-1,1]){const q=[s*(EW/2-1.6),fz+1.66];hnForm('hFormV',q[0],FL+EH+.4,q[1],0,1.6,3.2);}
  // the portal: ashlar jambs and keel head, a painted formline tympanum, carved leaves
  vB('vStone',0,FL,fz+.02,11,7.6,.12,0,ash);kput('hKeelP',[0,FL+6.1,fz+.04],null,[11,3.0,.12],ash);
  vB('vDarkB',0,FL,fz+.1,8.2,6.2,.1,0);kput('hKeelDark',[0,FL+6.1,fz+.12],null,[8.2,2.4,.1]);hnForm('hFormW',0,FL+5.95,fz+.1,0,5.2,2.0);
  for(const s of[-1,1])hnForm('hFormV',s*2.05,FL+.15,fz+.12,0,3.9,5.7);
  if(vLit())for(const s of[-1,1])hnWallLamp(s*6.4,FL+4.8,fz,0);
  for(const s of[-1,1])for(const z of[EZ-3,EZ+3]){const q=[s*EW/2,z];vnWin(q[0],FL+2.2,q[1],s*Math.PI/2,1.3,2.8,lit,'vStone',ash);}
  // flanking spire-pavilions in front of the veranda
  for(const s of[-1,1]){const px=s*(EW/2+4.2),pz=fz-2.5;hnSocle(px,FL,pz,5.6,1.0,5.6,0,rub,ash);hnStucco(px,FL+1.0,pz,5.2,6.2,5.2,0,cream,ash);
   for(let k=0;k<4;k++){const a=k*Math.PI/2;const f=loc(px,pz,0,2.6,a);vnWin(f[0],FL+3,f[1],a,.8,1.8,lit,'vStone',ash);}
   const t=hnRCLoggia(px,FL+7.2,pz,6,2.4,0,red,{lit:vLit()});hnRCPagoda(px,t,pz,6,0,2,roofC,{cream,wood:red});}}
 // ---- colonnaded verandas on carved totem posts with dougong along the ring front and the wing fronts
 const verandaRun=(x0,x1,zw,depth)=>{const L=x1-x0,n=Math.max(2,Math.round(L/3.4)),zp=zw+depth-.4;
  for(let i=0;i<=n;i++){const x=x0+.3+(L-.6)*i/n;hnTotemPost(x,FL,zp,.24,4.4,0,i%2===1);hnDougong(x,FL+4.4,zp,0,.62);}
  vB('vWood',(x0+x1)/2,FL+4.4+.9*.62,zp,L,.34,.5,0,red);hnFrieze((x0+x1)/2,FL+4.4+.9*.62-.02,zp+.25,0,L,.4);
  vnShedRoof((x0+x1)/2,FL+5.3,zw+depth/2-.1,L,depth+.2,1.6,0,'hScaleB',roofC,.5,.18);
  if(vLit())for(let i=0;i<n;i++)vBall('vBulb',x0+(L)*(i+.5)/n,FL+4.3,zp-.3,.12);};
 for(const s of[-1,1]){verandaRun(s>0?11.2:-31,s>0?31:-11.2,rz1,5.6);}
 // ---- the wings to the corner pavilions: stucco, half-timber upper storey, hipped roofs, verandas
 for(const s of[-1,1]){const wx=s*37.5,WZ=-9,WW=13,WD=22;hnStucco(wx,FL,WZ,WW,4.2,WD,0,cream,ash);hnFachBox(wx,FL+4.2,WZ,WW,3.4,WD,0,cream,red,lit);
  vnHipRoof('hHipSc',wx,FL+7.6,WZ,WW+2,WD,6.2,0,roofC,1.0);
  for(const z of[WZ-6,WZ+6]){const f=[s*44,z];vnWin(f[0],FL+1.3,f[1],s*Math.PI/2,1.1,2.0,lit,'vStone',ash);}
  vnDoor(wx,FL,WZ+WD/2,0,1.8,2.8,'vStone',ash,hC(vPick(HPAL.tar)),false);hnForm('hFormA',wx,FL+3.05,WZ+WD/2+.02,0,2.2,1.1);
  verandaRun(s>0?31.2:-42.4,s>0?42.4:-31.2,WZ+WD/2,4.6);
  // corner pavilions: Peles towers crowned with three flared tiers and a spire
  for(const pz of[WZ+WD/2-1,WZ-WD/2+1]){hnRCTower(s*47,FL,pz,9,10.5,0,{roof:'tiers',tiers:3,lit:vLit(),roofC,beamC:red,cream,rubbleTo:.3});}}
 // ---- the back: a door and stair to the service yard
 vnDoor(0,FL,rz0,Math.PI,2.2,3.2,'vStone',ash,hC(vPick(HPAL.tar)),false);hnForm('hFormA',0,FL+3.45,rz0-.02,Math.PI,2.6,1.3);
 // ---- parterres either side of the forecourt: lawns in clipped hedges, topiary cones, and clipped balls along the platform
 for(const s of[-1,1]){const gx=s*26.5,gz=44.5;vB('hPaint',gx,0,gz,15,.2,12,0,hC(0x5a8a3e));
  for(const [u,v,w,d] of [[0,5.6,15,.8],[0,-5.6,15,.8],[7.1,0,.8,10.4],[-7.1,0,.8,10.4],[0,0,9,.6],[0,0,.6,7]])vB('hRCHedgeB',gx+u,0,gz+v,w,.9,d,0,hC(0x3f6a2e));
  for(const [u,v] of [[-4,-2.6],[4,-2.6],[-4,2.6],[4,2.6]]){kput('hRCLeaf',[gx+u,1.7,gz+v],null,[.85,1.7,.85],hC(0x3a6a2c));}
  for(let k=0;k<6;k++){const x=s*(20+k*5.6);vB('vStone',x,FL,33.2-2.4,1.2,.6,1.2,0,ash);kput('hRCLeaf',[x,FL+1.3,30.8],null,[.8,.8,.8],hC(0x3f6a2e));}}
 vnFolk(0,45,10,5);hnRCFolk(-22,FL,26,4,3);hnRCFolk(22,FL,26,4,3);hnRCFolk(-22,FL,19.2,3,1.8);hnRCFolk(22,FL,19.2,3,1.8);}

// ---------------------------------------------------------------- the fortress
// A square curtain of rubble and ashlar with a roofed half-timber hoarding, Peles towers at the corners (spires to
// the field, tent roofs behind), the gatehouse in the front wall, a tall keep with a jettied timber storey and
// corner bartizans, the commandant's palace, a barracks, stables and a smithy in the bailey.
function buildHlRepFortress(G,o){reseed(21211+(o.v|0));const X=36,Z=32,TW=10,TH=17,H=9.5;
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),cream=hC(vPick(HPAL.stucco)),red=hC(vPick(HPAL.redwood)),slate=hC(vPick(HPAL.slate)),lit=vLit()?'lit':'glass',tar=hC(vPick(HPAL.tar));
 vnReg('Fortress',0,0,48,44);vnReg('Fortress — keep',-14,-14,9,44);
 // curtain walls between the towers; the front is split by the gatehouse
 const wo={H,roofC:slate,wood:red,c:rub,lamps:true};
 hnRCWallRun(0,-Z,2*X-TW,Math.PI,Object.assign({},wo,{stair:1}));
 hnRCWallRun(X,0,2*Z-TW,Math.PI/2,Object.assign({},wo,{stair:-1}));hnRCWallRun(-X,0,2*Z-TW,-Math.PI/2,Object.assign({},wo,{stair:1}));
 const gEdge=5+8.5,fl=X-TW/2-gEdge;for(const s of[-1,1])hnRCWallRun(s*(gEdge+fl/2),Z,fl,0,Object.assign({},wo,{stair:s}));
 hnRCGate(0,Z,0,{tw:8.5,th:TH,roofC:slate});
 for(const sx of[-1,1])for(const sz of[-1,1])hnRCTower(sx*X,0,sz*Z,TW,TH,0,{roof:sz>0?'spire':'tent',lit:vLit(),roofC:slate,beamC:red,cream,flag:sz<0&&sx>0});
 // the keep
 {const kx=-14,kz=-14,KW=14,KH=24;vB('hRubB',kx,0,kz,KW+1.6,1.4,KW+1.6,0,rub.clone().multiplyScalar(.85));vB('hRubB',kx,1.4,kz,KW,11-1.4,KW,0,rub);vB('vStone',kx,11,kz,KW+.24,.3,KW+.24,0,ash);
  hnStucco(kx,11.3,kz,KW,KH-11.3,KW,0,cream,ash);
  for(let k=0;k<4;k++){const a=k*Math.PI/2;for(const u of[-3.6,0,3.6]){const f=loc(kx,kz,u,KW/2,a);for(const yy of[4,7.6])vB('vDarkB',f[0],yy,f[1],.24,1.3,.08,a);
    for(const yy of[13,17.5]){vnWin(f[0],yy,f[1],a,.9,1.9,lit,'vStone',ash);const q=loc(kx,kz,u,KW/2+.12,a);kput('hKeelP',[q[0],yy+2.02,q[1]],qEuler(0,a,0),[1.4,.62,.12],ash);}}
   const nc=16;for(let i=0;i<nc;i++){const p=loc(kx,kz,-KW/2+.4+(KW-.8)*i/(nc-1),KW/2+.25,a);vB('vStone',p[0],KH-.6,p[1],.36,.6,.52,a,ash);}}
  // clock on the bailey face, door at first-floor level up an external stair
  {const f=loc(kx,kz,0,KW/2+.1,0);vB('vStone',f[0],KH-4.7,f[1],3.4,3.4,.1,0,ash);kput('hClock',[f[0],KH-3.0,f[1]+.1],null,[3,3,1],null);}
  vnDoor(kx+3.6,5.2,kz+KW/2,0,1.4,2.4,'vStone',ash,tar,false);vB('vStone',kx+3.6,0,kz+KW/2+1.0,2.4,5.0,2,0,ash);hnRCFlight(kx+2.4-31*.34,0,kz+KW/2+1.0,-Math.PI/2,1.6,5.0,'vStone',ash);
  vB('vStone',kx,KH,kz,KW+1.2,.3,KW+1.2,0,ash);hnJetty(kx,KH+.8,kz,KW+.6,KW+.6,0,red,.45);hnFachBox(kx,KH+.8,kz,KW+.6,3.4,KW+1.5,0,cream,red,lit);
  const ry0=KH+4.2;vnHipRoof('hHipSc',kx,ry0,kz,KW+1.5,KW+1.5,9,0,slate,.8);
  for(const sx of[-1,1])for(const sz of[-1,1]){const bx=kx+sx*(KW/2+.2),bz=kz+sz*(KW/2+.2);kput('vConeI',[bx,KH-2.4,bz],qEuler(Math.PI,0,0),[1.1,1.6,1.1],ash);
   kput('hOctP',[bx,KH-2.45,bz],null,[1.15,KH-(KH-2.45)+4.2,1.15],cream);vB('vStone',bx,KH+4.2,bz,2.5,.2,2.5,Math.PI/8,ash);kput('hTentSc',[bx,KH+4.35,bz],null,[1.5,5,1.5],slate);vBall('hGold',bx,KH+9.4,bz,.16,hC(HPAL.gold[0]));
   for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4*(sx*sz);const p=loc(bx,bz,0,1.12,a);vnWin(p[0],KH+1.5,p[1],a,.4,1.1,lit,'hPaint',red);}}
  kput('hOctW',[kx,ry0+7.2,kz],null,[1.2,2.4,1.2],red);hnRCSpire(kx,ry0+9.5,kz,2.8,8,0,slate,{flag:true,flagC:hC(HPAL.red)});}
 // the commandant's palace along the back wall: Peles in small — stucco, half-timber, loggia tower
 {const px=15,pz=-21,PW=24,PD=10;hnSocle(px,0,pz,PW,1.0,PD,0,rub,ash);hnStucco(px,1.0,pz,PW,4.0,PD,0,cream,ash);
  for(const u of[-9,-5,5,9])vnWin(px+u,2.0,pz+PD/2,0,1.1,2,lit,'vStone',ash);vnDoor(px,1.0,pz+PD/2,0,1.6,2.6,'vStone',ash,tar,false);hnForm('hFormA',px,3.75,pz+PD/2+.02,0,2.2,1.1);
  hnRCFlight(px,0,pz+PD/2+1.8,0,3,1.0,'vStone',ash);
  hnFachBox(px,5.0,pz,PW,3.3,PD,0,cream,red,lit);const t=hnGable(px,8.3,pz,PW,PD,1.3,0,'hGableSc',slate,.7,'vGablePl',cream);
  hnRCDormers(px+4,8.3,pz,4.6,5,0,slate,cream,.18);
  vB('vWood',px-2,7.8,pz+PD/2+.6,5,.4,1.3,0,red);hnFachBox(px-2,8.2,pz+PD/2,5,2.6,2.2,0,cream,red,lit);hnGable(px-2,10.8,pz+PD/2,2.2,5,1.3,Math.PI/2,'hGableSc',slate,.4,'vGablePl',cream);hnBarge(px-2,10.8,pz+PD/2,2.2,5,3.25,Math.PI/2,.4,red,'lace');
  hnTower(px+PW/2-1,0,pz+1,4.4,12.6,0,{loggia:true,roof:'spire',roofC:slate,beamC:red,c:cream,lit:vLit()});
  hnStoneChimney(px-7,t-1.8,pz-1.5,2.6,.8);}
 // barracks along the west wall: stucco ground storey, log upper storey, shingle
 {const bx=-26,bz=10,BW=9,BL=24,log=hC(vPick(HPAL.pine));hnSocle(bx,0,bz,BW,.6,BL,0,rub,ash);hnStucco(bx,.6,bz,BW,3.0,BL,0,hC(vPick(HPAL.saxon)),ash);hnLogBox(bx,3.6,bz,BW,2.8,BL,0,log);
  hnGable(bx,6.4,bz,BL,BW,1.15,Math.PI/2,'vShingleB',hC(vPick(HPAL.shingle)),.7,'hGableLog',log);hnBarge(bx,6.4,bz,BL,BW,1.15*BW/2,Math.PI/2,.7,hC(HPAL.white),'lace');
  for(const z of[-8,-3,3,8]){vnWin(bx+BW/2,1.6,bz+z,Math.PI/2,.9,1.3,'glass','vStone',ash);hnNal(bx+BW/2,4.3,bz+z,Math.PI/2,.8,1.1,'glass',hC(HPAL.white));}
  vnDoor(bx+BW/2,.6,bz+.5,Math.PI/2,1.3,2.3,'vWood',log,tar,false);vnStairs(bx+BW/2+.9,0,bz+.5,Math.PI/2,1.6,.6,3,'vStone',ash);
  hnForm('hFormA',bx+BW/2+.02,3.05,bz+.5,Math.PI/2,1.8,.5);
  for(let k=0;k<4;k++)FURNISH('hl_rep_training_butt',bx+BW/2+5,0,bz-6+k*1.6,0,{v:1});}   // the pells
 // stables and the smithy lean-to along the east wall
 {const sx=27.5,sz=6,SL=22,wood=hC(vPick(HPAL.aged));for(let k=0;k<=5;k++)vPst('vPostB',sx-2.6,0,sz-SL/2+k*SL/5,.14,3.1,wood);vB('vWood',sx+2.8,0,sz,.2,4.4,SL,0,wood);
  vnShedRoof(sx,3.1,sz,SL,5.6,1.4,-Math.PI/2,'vShingleB',hC(vPick(HPAL.shingle)),.4);
  for(let k=0;k<4;k++){vB('vWood',sx,0,sz-SL/2+2.8+k*4.6,5,1.3,.12,0,wood);}
  for(let k=0;k<3;k++){const z=sz-SL/2+5+k*4.6;vB('vWood',sx+.4,.9,z,1.9,.9,.8,Math.PI/2,hC(vPick([0x5a3a28,0x3a2a22,0x7a5a3a])));vB('vWood',sx-.7,1.4,z,.7,.55,.4,Math.PI/2,hC(0x4a3224));
   for(const dx of[-.6,1.2])for(const dz of[-.25,.25])vPst('vPost',sx+dx,0,z+dz,.07,.95,hC(0x3a2a20));}
  // the smithy: the bailey forge and an iron block anvil from the catalog (the embers drew 12 numbers); its stack on
  // up through the lean-to roof is the lean-to's own
  const fz=sz+SL/2-2.4;hlRngSkip(12);FURNISH('hl_rep_hooded_forge',sx+.8,0,fz,0,{v:1});FURNISH('hl_rep_anvil',sx-.8,0,fz,0,{v:1});
  vnChimney(sx+1.3,4.08,fz-.5,3.32,.25,true);}
 // the bailey: a well, a cart, barrels, a pell-post and the garrison
 FURNISH('hl_rep_civic_well',6,0,2,0,{v:1});   // the windlass well
 hnRCPave(0,22,8,14,0,hC(vPick(HPAL.rubble)),2.2);
 for(let k=0;k<4;k++)hnBarrel(20+k*.8,0,-10+(k%2)*.8,.35,.9);hnCrate(18,0,-9,1,.3);
 vnFolk(0,14,8,8);vnFolk(-18,4,4,3);}

// ================================================================= WALLS AND GATES
function buildHlRepWall(G,o){reseed(21221+(o.v|0));const len=o.len||40;
 vnReg('Town wall',0,0,Math.min(len/2,26),12);if(len>52)for(const s of[-1,1])vnReg('Town wall',s*len/3,0,len/6+1,12);
 hnRCWallRun(0,0,len,0,{hoard:(o.v|0)%2===0,stair:1,ends:true,lamps:true});vnFolk(0,-5,2,len/4);}
function buildHlRepWallTower(G,o){reseed(21231+(o.v|0));const W=8.5,H=16;const red=hC(vPick(HPAL.redwood)),slate=hC(vPick(HPAL.slate));
 vnReg('Wall tower',0,0,9,H+26);
 for(const s of[-1,1])hnRCWallRun(s*(W/2+2.6),0,5.6,0,{wood:red,roofC:slate,ends:true});
 hnRCTower(0,0,.6,W,H,0,{roof:(o.v|0)%2?'tent':'spire',clock:(o.v|0)%3===2,lit:vLit(),roofC:slate,beamC:red,flag:true});
 vnDoor(0,0,.6-W/2,Math.PI,1.4,2.3,'vStone',hC(vPick(HPAL.ashlar)),hC(vPick(HPAL.tar)),false);vnFolk(0,-7,1,2);}
function buildHlRepGate(G,o){reseed(21241+(o.v|0));
 vnReg('Town gate',0,0,16,44);
 hnRCGate(0,0,0,{stubs:5});
 hnRCPave(0,8.5,12,6,0,hC(vPick(HPAL.rubble)),1.6);hnRCPave(0,-8.5,12,6,0,hC(vPick(HPAL.rubble)),1.6);
 vnFolk(0,10,4,4);for(const s of[-1,1])vnFolk(s*3.2,5.8,1,.2);}

// ================================================================= INDUSTRY
// The glowing hearth seen through a doorway (face at z, facing +z): a stone hearth, its fire, embers, an iron hood.
// Furniture: the catalog's Forgehouse hearth, standing in the doorway against its dark (the drawing drew 11 numbers).
function hnRCHearth(x,y,z,big){hlRngSkip(11);return hnFurn('hl_rep_wall_forge',x,y,z,0,{v:big?1:0},0,.145);}
// ---------------------------------------------------------------- the Forgehouse
// The Republic's great smithy: a long stone-and-timber forge hall with a clerestory lantern on the ridge and iron
// stacks through the roof, a perpendicular finishing hall, two masonry furnaces with brick stacks and glowing tap
// mouths in the yard, a water wheel on a stone race driving the hammers, jib cranes, the coal yard with its tub
// line, and the scrap yard of salvaged Ancient sheet, panel and pipe.
function buildHlRepForgehouse(G,o){reseed(21301+(o.v|0));
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),tar=hC(vPick(HPAL.tar)),red=hC(vPick(HPAL.redwood)),aged=hC(vPick(HPAL.aged)),slate=hC(vPick(HPAL.slate)),cream=hC(vPick(HPAL.stucco)),iron=hC(0x2e2a26),coal=hC(0x262422),lit=vLit()?'lit':'glass';
 vnReg('Forgehouse',-6,-9,32,30);vnReg('Forgehouse — furnaces',-23,12,10,36);vnReg('Forgehouse — finishing hall',37,-7,14,20);vnReg('Forgehouse — yards',-4,24,26,8);
 vB('vStone',-2,0,14,88,.03,28,0,hC(0x5a5650));                                                      // cinder yard
 // ---- the forge hall
 const MX=-6,MZ=-9,ML=60,MD=22,S1=1.0,H1=6.0,H2=4.0;
 hnSocle(MX,0,MZ,ML,S1,MD,0,rub,ash);vB('hRubB',MX,S1,MZ,ML,H1-S1,MD,0,rub);vB('vStone',MX,H1-.3,MZ,ML+.3,.3,MD+.3,0,ash);
 for(const s of[1,-1])for(let u=-ML/2;u<=ML/2+.01;u+=6){const p=loc(MX,MZ,u,s*(MD/2+.1),0);vB('vStone',p[0],S1,p[1],.9,H1-S1-.3,.2,0,ash);}
 // upper storey: tarred boards with a clerestory of lit windows between redwood posts
 vB('vWood',MX,H1,MZ,ML-.2,H2,MD-.2,0,tar);
 for(const s of[1,-1]){const a=s>0?0:Math.PI;for(let u=-ML/2+1.5;u<ML/2;u+=3){const p=loc(MX,MZ,u,s*(MD/2-.1),0);vnWin(p[0],H1+1.1,p[1],a,1.8,1.9,lit,'vWood',red);}
  for(let u=-ML/2;u<=ML/2+.01;u+=3){const p=loc(MX,MZ,u,s*(MD/2-.04),0);vB('vWood',p[0],H1,p[1],.24,H2,.1,0,red);}}
 for(const s of[-1,1])for(const z of[-6,0,6])vnWin(MX+s*(ML/2-.1),H1+1.1,MZ+z,s*Math.PI/2,1.6,1.9,lit,'vWood',red);
 const pitch=.78,Y2=H1+H2;const ridge=hnGable(MX,Y2,MZ,ML,MD,pitch,0,'hScaleB',slate,1.0,'vGableW',tar);
 // corrugate patches on the slate (the Iziz note), a little proud of the slab
 for(let i=0;i<10;i++){const s=rng()<.5?1:-1,u=rr(-ML/2+3,ML/2-3),t=rr(.2,.75);const run=MD/2+1.0,zz=s*run*(1-t),yy=Y2-pitch*1.0+pitch*run*t+.4;
  kput(rng()<.7?'vSheet':'vPlate',[MX+u,yy,MZ+zz],vQ(s>0?0:Math.PI,-Math.PI/2+Math.atan(pitch),rr(-.05,.05)),[rr(2,4),rr(1.6,3),1],null);}
 // clerestory lantern along the ridge
 {const LL=40,LW=4.6,ly=ridge-1.8;vB('vWood',MX,ly,MZ,LL,2.6,LW,0,aged);for(let u=-LL/2+.6;u<LL/2;u+=1.2)for(const s of[1,-1])vB('vDarkB',MX+u,ly+.5,MZ+s*(LW/2+.01),.6,1.6,.04,0);
  hnRCGableX(MX,ly+2.6,MZ,LL,LW,1.4,0,'vCorr',null,.7,.6,'vGableW',aged);}
 // the front: four great arched doorways with ashlar surrounds; two stand open on the forges within
 for(let i=0;i<4;i++){const fz=MZ+MD/2,px=MX-21+i*14;vB('vStone',px,S1,fz+.02,6.6,4.8,.14,0,ash);kput('hKeelP',[px,S1+4.6,fz+.06],null,[6.6,1.9,.14],ash);
  vB('vDarkB',px,S1,fz+.12,5,4.6,.08,0);kput('hKeelDark',[px,S1+4.6,fz+.14],null,[5,1.3,.08]);
  if(i%2){hnRCHearth(px,S1,fz+.16,true);for(const s of[-1,1])kput('vWood',[px+s*3.1,S1+2.25,fz+1.1],qEuler(0,s*1.2,0),[2.4,4.5,.12],tar);}
  else{for(const s of[-1,1])vB('vWood',px+s*1.26,S1,fz+.2,2.4,4.5,.12,0,tar);for(const yy of[1,3.2])vB('vIron',px,S1+yy,fz+.28,4.9,.14,.06,0,iron);}
  hnRCFlight(px,0,fz+2.8,0,6,S1,'vStone',ash);if(vLit())hnWallLamp(px+3.5,S1+3.2,fz+.1,0);}
 hnForm('hFormA',MX,H1+H2-1.7,MZ+MD/2+.02,0,4,1.6);
 // iron stacks through the roof, guyed
 for(const u of[-20,-2,16]){const x=MX+u,z=MZ-3;vPst('vPipeR',x,Y2,z,.75,24,null);for(const yy of[Y2+6,Y2+12,Y2+18])kput('vHoop',[x,yy,z],qEuler(Math.PI/2,0,0),[.78,.78,2],iron);
  vB('vIron',x,Y2+24,z,2.0,.16,2.0,0,iron);for(let k=0;k<3;k++){const a=k*TAU/3+.4,gx=x+Math.sin(a)*8,gz=z+Math.cos(a)*5;vBeam([x,Y2+17,z],[gx,Y2+pitch*(MD/2-Math.abs(gz-MZ))+.3,gz],.035,iron,'vRope');}}
 // ---- the finishing hall, gable to the yard
 {const FX=37,FZ=-7,FW=18,FD=38;hnSocle(FX,0,FZ,FW,S1,FD,0,rub,ash);vB('hRubB',FX,S1,FZ,FW,4.2,FD,0,rub);vB('vStone',FX,S1+4.2,FZ,FW+.3,.3,FD+.3,0,ash);
  hnFachBox(FX,S1+4.5,FZ,FW,3.6,FD,0,cream,red,lit);const y3=S1+8.1;
  hnGable(FX,y3,FZ,FD,FW,1.05,Math.PI/2,'hScaleB',slate,.8,'vGablePl',cream);hnBarge(FX,y3,FZ,FD,FW,1.05*FW/2,Math.PI/2,.8,red,'lace');
  for(let i=0;i<5;i++){const t=rr(.2,.7),s=rng()<.5?1:-1,zz=rr(-FD/2+3,FD/2-3),run=FW/2+.8;kput('vSheet',[FX+s*run*(1-t),y3-1.05*.8+1.05*run*t+.44,FZ+zz],vQ(s*Math.PI/2,-Math.PI/2+Math.atan(1.05),0),[rr(2,3.4),rr(1.6,2.6),1],null);}
  const fz=FZ+FD/2;vB('vStone',FX,S1,fz+.02,6.2,5.0,.14,0,ash);vB('vDarkB',FX,S1,fz+.12,4.8,4.4,.08,0);hnRCHearth(FX,S1,fz+.16,false);
  for(const s of[-1,1])kput('vWood',[FX+s*3.0,S1+2.2,fz+1.1],qEuler(0,s*1.2,0),[2.3,4.4,.12],tar);hnRCFlight(FX,0,fz+2.8,0,6,S1,'vStone',ash);
  for(const s of[-1,1])vnWin(FX+s*6,S1+1.4,fz,0,1.4,2.2,lit,'vStone',ash);hnForm('hFormT',FX,y3+1.4,fz+.45,0,3.2,1.6);vnWin(FX,y3+4.2,fz+.42,0,1,1.1,lit,'hPaint',red);
  for(let z=-15;z<=15;z+=5)for(const s of[-1,1])vnWin(FX+s*FW/2,S1+1.4,FZ+z,s*Math.PI/2,1.4,2.2,lit,'vStone',ash);
  vPst('vPipeR',FX+4,y3+2,FZ-8,.5,14,null);vB('vIron',FX+4,y3+16,FZ-8,1.4,.14,1.4,0,iron);
  if(vLit())hnWallLamp(FX+3.3,S1+3.4,fz+.1,0);}
 // ---- the water wheel on its stone race at the west end, driving the hammer shaft into the hall
 {const RX=-41,RW=4.4;for(const s of[-1,1])vB('hRubB',RX+s*(RW/2+.4),0,-8,.8,1.5,34,0,rub);vB('hRCWater',RX,0,-8,RW,.45,34,0,hC(0x4a6874));
  for(let k=0;k<9;k++)vBall('vBallW',RX+rr(-1.6,1.6),.46,-8+rr(-3,3),rr(.15,.35),hC(0xe8eef0),.04);
  hnRCWheel(RX,5.6,-8,5.0,2.2,0,red,12,20);vBeam([RX+1.2,5.6,-8],[MX-ML/2,5.6,-8],.34,iron,'vIron');vB('vStone',RX+RW/2+1.4,0,-8,1.2,5.4,1.2,0,ash);
  for(const s of[-1,1])vPst('vPost',RX+s*(RW/2+.4),1.5,-23,.14,3,aged);vB('vWood',RX,4.3,-23,RW+1.2,.3,.3,0,aged);vB('vWood',RX,1.2,-23,RW-.1,2.2,.12,0,aged);}
 // ---- the furnaces: battered masonry, brick stacks, glowing tap mouths, a charging ramp
 for(const [fx,sh] of [[-30,26],[-16,30]]){const fz=12;kput('hBatterRub',[fx,0,fz],null,[8.4,7.2,8.4],rub);vB('vStone',fx,7.0,fz,7.4,.4,7.4,0,ash);
  hnRCStack(fx,7.4,fz,3.4,sh);
  for(let k=0;k<4;k++){const a=k*Math.PI/2;const p=loc(fx,fz,0,3.95,a);vB('vIron',p[0],1.4,p[1],3.8,.18,.12,a,iron);}
  const mz=fz+4.3;vB('vStone',fx,0,mz-.3,3.2,3.2,.6,0,ash);vB('vDarkB',fx,.3,mz+.01,1.8,2.0,.06,0);vB('hRCGlow',fx,.3,mz+.05,1.4,1.0,.06,0);
  for(let k=0;k<5;k++)vBall('vEmber',fx+rr(-.6,.6),.25+rr(0,.3),mz+.3+rr(0,.8),rr(.1,.2));kput('vRustB',[fx,3.5,mz+.5],vQ(0,-.3,0),[2.6,.2,1.6],null);}
 {const a=[-46,0,12],b=[-34.2,7.0,12];for(let k=1;k<=5;k++){const t=k/5,x=lerp(a[0],b[0],t),y=lerp(a[1],b[1],t);for(const s of[-1,1])vPst('vPost',x,0,12+s*.9,.12,y,aged);}
  kput('vWood',[(a[0]+b[0])/2,(a[1]+b[1])/2+.08,12],qEuler(0,0,Math.atan2(b[1]-a[1],b[0]-a[0])),[Math.hypot(b[0]-a[0],b[1]-a[1]),.16,2.2],aged);vB('vWood',-24.5,7.4,12,14,.16,2.4,0,aged);}
 // ---- the coal yard with its tub line, the scrap yard
 for(let i=0;i<3;i++){const bx=-42+i*7.5,bz=25;vB('hRubB',bx,0,bz-2.8,6.8,1.4,.5,0,rub);for(const s of[-1,1])vB('hRubB',bx+s*3.2,0,bz,.5,1.4,5.6,0,rub);hnRCHeap(bx,0,bz,2.6,2.4,coal,5);}
 hnRCRails([-46,19.5],[-12,19.5]);hnRCTub(-36,19.5,Math.PI/2,coal);hnRCTub(-22,19.5,Math.PI/2,coal);
 hnRCScrap(14,24,8,4,40);hnRCHeap(7,0,26,3,1.8,hC(0x7a5040),4);kput('vPlateW',[22,2.0,28],qEuler(-.25,.3,0),[4.2,4.4,1],null);kput('vPlateW',[19.5,1.6,28.6],qEuler(-.3,-.2,.1),[3,3.4,1],null);
 // ---- jib cranes, lamps, the smiths
 hnRCJib(-3,12,9,7,.9,red,'vRustB');hnRCJib(25,14,8,6,-.5,red,'vRustB');
 if(vLit()){for(const x of[-40,-20,0,20,40])hnLampPost(x,0,31,4.4);hnLampPost(-8,0,8,4.4);}
 vnFolk(0,8,5,3.5);vnFolk(-18,23,3,2);vnFolk(14,20,3,4);vnFolk(32,16,2,3);}

// ---------------------------------------------------------------- the generator
// The Republic's electric house: a stone engine hall with tall arched lit windows, gable to the road, a boiler
// lean-to and a brick stack; a fenced transformer yard with its gantry and the line of poles leaving it.
function buildHlRepGenerator(G,o){reseed(21311+(o.v|0));
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),cream=hC(vPick(HPAL.stucco)),red=hC(vPick(HPAL.redwood)),slate=hC(vPick(HPAL.slate)),aged=hC(vPick(HPAL.aged)),iron=hC(0x2e2a26),por=hC(0xd8d0c0),coal=hC(0x262422),lit=vLit()?'lit':'glass';
 vnReg('Generator house',-5,-3,10,30);vnReg('Generator — transformer yard',10,2,7,9);
 const HX=-5,HZ=-3,HW=12,HD=20,S=1.0,H=7;
 hnSocle(HX,0,HZ,HW,S,HD,0,rub,ash);hnStucco(HX,S,HZ,HW,H,HD,0,cream,ash);vB('vStone',HX,S+H-.35,HZ,HW+.3,.35,HD+.3,0,ash);
 for(const s of[-1,1])for(const z of[-6,0,6]){const p=[HX+s*HW/2,HZ+z];vnWin(p[0],S+1.2,p[1],s*Math.PI/2,1.3,3.6,lit,'vStone',ash);const q=loc(p[0],p[1],0,.12,s*Math.PI/2);kput('hKeelP',[q[0],S+4.95,q[1]],qEuler(0,s*Math.PI/2,0),[2.0,.9,.12],ash);}
 const top=hnGable(HX,S+H,HZ,HD,HW,1.0,Math.PI/2,'hScaleB',slate,.7,'vGablePl',cream);hnBarge(HX,S+H,HZ,HD,HW,HW/2,Math.PI/2,.7,red,'lace');
 for(const s of[1,-1]){const f=loc(HX,HZ,0,s*HD/2,0);hnFrieze(f[0],S+H-.95,f[1],s>0?0:Math.PI,HW,.5);}
 {const f=HZ+HD/2;vB('vStone',HX,S,f+.02,4.4,4.4,.12,0,ash);kput('hKeelP',[HX,S+4.3,f+.06],null,[4.4,1.5,.12],ash);vB('vDarkB',HX,S,f+.1,3.2,4.0,.06,0);kput('hKeelDark',[HX,S+4.0,f+.12],null,[3.2,1.1,.06]);
  // the dynamo seen through the open doors: a copper drum on its bed
  kput('vPipeC',[HX,S+1.1,f-.2],qEuler(0,0,Math.PI/2),[.8,2.4,.8],null);vB('vIron',HX,S,f-.2,2.6,.5,1.2,0,iron);
  for(const s of[-1,1])kput('vWood',[HX+s*2.2,S+2,f+.8],qEuler(0,s*1.25,0),[1.6,4,.1],red);hnRCFlight(HX,0,f+2.6,0,4.4,S,'vStone',ash);
  hnForm('hFormA',HX,S+5.6,f+.02,0,2.4,1.2);vB('vStone',HX,top-3.4,f+.02,1.8,1.8,.1,0,ash);vB('vWinLit',HX,top-3.2,f+.06,1.4,1.4,.06,0);
  if(vLit())for(const s of[-1,1])hnWallLamp(HX+s*2.6,S+3.4,f,0);}
 // ridge vent
 vB('vWood',HX,top-.4,HZ,1.8,1.2,8,0,aged);vnGableRoof(HX,top+.8,HZ,8,1.8,.7,Math.PI/2,'hScaleB',slate,.35);
 // boiler house lean-to, coal, the brick stack
 {const bx=HX-HW/2-3.4,bz=HZ-2;vB('hRubB',bx,0,bz,6.8,4.4,12,0,rub);vnShedRoof(bx,4.4,bz,12,6.8,1.6,-Math.PI/2,'hScaleB',slate,.4);
  vB('vDarkB',bx-3.42,0,bz+2,.06,2.6,2,0);hnRCStoke(bx-3.5,bz+2);
  hnRCHeap(bx-6.5,0,bz+3,2.6,2.0,coal,5);hnRCStack(bx,0,bz-8,3.2,27);}
 // transformer yard: gravel pad, three transformers with fins and porcelain bushings, the gantry, the fence
 {const tx=10,tz=2;vB('vStone',tx,0,tz,11,.06,15,0,hC(0x8a8680));vnFence(tx,0,tz,11,15,0,aged,2,1.8);
  for(let i=0;i<3;i++){const z=tz-5+i*5;vB('vStone',tx-1,0,z,2.6,.4,2.4,0,ash);vB('hPaint',tx-1,.4,z,1.8,2.0,1.6,0,hC(0x4a5a50));
   for(let k=0;k<5;k++)vB('hPaint',tx-1-.8+k*.4,.6,z+.95,.06,1.6,.3,0,hC(0x44524a));
   for(let k=0;k<3;k++){const bx=tx-1.5+k*.5;vPst('vPipe',bx,2.4,z,.03,.4,iron);for(let j=0;j<4;j++)vBall('vBallW',bx,2.55+j*.16,z,.1,por,.06);
    vBeam([bx,3.1,z],[tx+3,7.6,z+(k-1)*.9],.025,iron,'vRope');}}
  for(const s of[-1,1]){vPst('vPost',tx+3,0,tz+s*6.4,.16,8.2,aged);}vB('vWood',tx+3,7.6,tz,.24,.24,13.4,0,aged);
  for(let k=0;k<6;k++)vBall('vBallW',tx+3,7.9,tz-5+k*2,.1,por,.12);
  // the line to the hall and the poles leaving the yard
  vBeam([HX+HW/2,S+H-.6,HZ+4],[tx+3,7.9,tz-5],.03,iron,'vRope');vBeam([HX+HW/2,S+H-.6,HZ+5],[tx+3,7.9,tz-3],.03,iron,'vRope');
  let last=[tx+3,7.9,tz+5];for(const [px,pz] of [[18,7],[17,13]]){vPst('vPost',px,0,pz,.14,8.6,aged);vB('vWood',px,8.0,pz,1.8,.14,.14,0,aged);for(const s of[-1,1])vBall('vBallW',px+s*.7,8.25,pz,.09,por,.12);
   vBeam(last,[px-.7,8.25,pz],.025,iron,'vRope');last=[px-.7,8.25,pz];}}
 if(vLit()){hnLampPost(HX+6,0,HZ+HD/2+3,4);hnLampPost(HX-6,0,HZ+HD/2+3,4);hnLampPost(16,0,-5,4);}
 hnCrate(HX-8,0,HZ+8,1,.3);hnBarrel(HX+7,0,HZ-8,.4,1);vnFolk(HX,HZ+HD/2+4,2,2);}
// the stoker's fire-door in the boiler house wall (face toward -x)
function hnRCStoke(x,z){vB('hRCGlow',x,.5,z,.06,.7,1.2,0);for(let k=0;k<3;k++)vBall('vEmber',x-.15,.6+rr(0,.3),z+rr(-.4,.4),.1);}

const HTAG_RC_CIV={wealth:'civic',lit:true};
HL.def({key:'hl_rep_hall_republic',name:'Hall of the Republic',branch:'republican',family:'Monuments',tags:Object.assign({type:['civic'],landmark:true},HTAG_RC_CIV),w:112,d:100,h:72,roofTile:'hTileW',build:buildHlRepHallRepublic});
HL.def({key:'hl_rep_fortress',name:'Fortress',branch:'republican',family:'Monuments',tags:Object.assign({type:['military']},HTAG_RC_CIV),w:86,d:78,h:46,build:buildHlRepFortress});
HL.def({key:'hl_rep_wall',name:'Town wall',branch:'republican',family:'Walls and gates',tags:Object.assign({type:['military','infrastructure']},HTAG_RC_CIV),w:40,d:8,h:13,build:buildHlRepWall});
HL.def({key:'hl_rep_wall_tower',name:'Wall tower',branch:'republican',family:'Walls and gates',tags:Object.assign({type:['military','infrastructure']},HTAG_RC_CIV),w:20,d:12,h:44,build:buildHlRepWallTower});
HL.def({key:'hl_rep_gate',name:'Town gate',branch:'republican',family:'Walls and gates',tags:Object.assign({type:['military','infrastructure']},HTAG_RC_CIV),w:44,d:22,h:44,build:buildHlRepGate});
HL.def({key:'hl_rep_forgehouse',name:'Forgehouse',branch:'republican',family:'Industry',tags:Object.assign({type:['industry']},HTAG_RC_CIV),w:90,d:64,h:42,build:buildHlRepForgehouse});
HL.def({key:'hl_rep_generator',name:'Generator house',branch:'republican',family:'Industry',tags:Object.assign({type:['infrastructure']},HTAG_RC_CIV),w:36,d:28,h:28,build:buildHlRepGenerator});
