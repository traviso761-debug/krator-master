// ================================================================= round 7 — the East Highland frame (replaces the half-timbering)
// Travis: "the half-timbering looks a bit too european and terrestrial. let's get rid of it and expand the east asian
// influence instead. More extensive dougong capping off posts that support the walls and galleries; walls are curtain
// walls or plank walls; windows have a more east asian form, galleries are sometimes seen. Posts have the same colour
// scheme as the dougong and when forming galleries, sometimes are carved posts. Rooflines do not become chinese however
// but remain Alpine and Eastern European. In places where appropriate, Caihua is seen with the same colour scheme we
// have been using for murals." (after a Yingxian-pagoda model, a Fenghuang river front and a Chuan-dou timber house)
//
// HOW. The Republican builders all wall their timber storeys through hnFachBox / hnFachFace (72) and their windows
// through vnWin / hnNal. This fragment re-points those four at a post-and-beam frame when HL_WALLS==='frame' (the
// default now), so every Republican building converts at once and the roofs — hnGable, hnTier, onions, tents — are
// untouched. HL_WALLS='fach' brings the old half-timbering back. Rustic and Tribal are untouched.
//
// A frame storey, per face:
//   posts every ~2.2 m in red lacquer with a teal-and-white banded capital — the dougong's own colours — each capped by
//     a bracket set (hnDougong) under the head plate; rich and civic faces add a set mid-bay (bujian puzuo);
//   a painted architrave between the posts: CAIHUA (xuanzi whorls at the ends, a long panel in the middle, in the mural
//     palette — teal, red, black, white, ochre, a Russian blue) on middle/rich/civic houses, plain lacquer on the poor;
//   infill by the house's STYLE: 'plank' (vertical boards, the poor and most middle houses), 'lattice' (curtain walls of
//     geshan leaves — plank dado, lattice upper, dark or lit behind — the rich and civic), 'mixed' (plank walls with a
//     lattice clerestory band);
//   windows are lattice windows (grid, step-fret or lantern pattern) in lacquered frames, a caihua head board over the
//     better ones; the carved nalichnik surround is dropped;
//   the FRONT face of an upper storey sometimes opens into a GALLERY: a cantilevered deck on carved brackets, lacquered
//     (or, on the better houses, carved) posts each capped by a bracket set, a fret balustrade and a lattice valance
//     hung under the architrave.
let HL_WALLS='frame';
function hlFrameOn(){const c=VERN.cur;return HL_WALLS==='frame'&&!!c&&c.D.branch==='republican';}
// ---------------------------------------------------------------- textures
// plank wall: five vertical boards per metre, a dark joint and a grain streak each; pale so the instance colour tints it
TEX.hPlank=canvasTex(128,128,(g,w,h)=>{const n=5,bw=w/n;for(let k=0;k<n;k++){const v=200+((k*37)%5)*8;g.fillStyle=`rgb(${v},${v-6},${v-14})`;g.fillRect(k*bw,0,bw,h);
  for(let s=0;s<5;s++){g.fillStyle=`rgba(90,70,50,${.08+.05*(s%2)})`;g.fillRect(k*bw+3+((k*7+s*5)%(bw-6)),0,1,h);}
  g.fillStyle='rgba(30,20,14,.7)';g.fillRect(k*bw,0,2,h);}
 for(let k=0;k<3;k++){g.fillStyle='rgba(40,28,20,.35)';g.beginPath();g.ellipse(bw*(k*1.7+.6),h*(.2+k*.27),2.5,5,0,0,TAU);g.fill();}});   // knots
// lattice panels: white bars on transparent, a 0.5 m tile whose edge bars join the next tile's
function hlLatt(fn){return canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#fff';fn(g,w,h);g.fillRect(0,0,w,4);g.fillRect(0,0,4,h);g.fillRect(0,h-4,w,4);g.fillRect(w-4,0,4,h);});}
TEX.hLattA=hlLatt((g,w,h)=>{for(let k=1;k<6;k++){g.fillRect(k*w/6-1.5,0,3,h);g.fillRect(0,k*h/6-1.5,w,3);}});                                     // grid (fangge)
TEX.hLattB=hlLatt((g,w,h)=>{const u=w/8,b=3;const L=(x0,y0,x1,y1)=>g.fillRect(Math.min(x0,x1)*u-b/2,Math.min(y0,y1)*u-b/2,Math.abs(x1-x0)*u+b,Math.abs(y1-y0)*u+b);
 for(const [ox,oy] of[[0,0],[4,4],[4,0],[0,4]]){L(ox+1,oy+1,ox+3,oy+1);L(ox+3,oy+1,ox+3,oy+3);L(ox+3,oy+3,ox+2,oy+3);L(ox+2,oy+3,ox+2,oy+2);L(ox+1,oy+1,ox+1,oy+4);L(ox,oy+4,ox+1,oy+4);}});  // step fret (huiwen)
TEX.hLattC=hlLatt((g,w,h)=>{const b=3;g.fillRect(w*.25,h*.25,w*.5,b);g.fillRect(w*.25,h*.75-b,w*.5,b);g.fillRect(w*.25,h*.25,b,h*.5);g.fillRect(w*.75-b,h*.25,b,h*.5);   // lantern (denglong kuang)
 for(const [a,c] of[[.5,0],[.5,.75],[0,.5],[.75,.5]]){if(a===.5)g.fillRect(w*.5-b/2,h*c,b,h*.25);else g.fillRect(w*a,h*.5-b/2,w*.25,b);}
 for(const s of[.12,.88])for(const t of[.12,.88]){g.fillRect(w*s-6,h*t-b/2,12,b);g.fillRect(w*s-b/2,h*t-6,b,12);}});
// caihua: the painted beam, stretched over one bay (plane UVs 0..1). Xuanzi whorl-flowers at both ends in teal and blue,
// white and black outlines, a long red panel (fangxin) with ochre cloud scrolls in the middle, gold dots at the joints.
TEX.hCaihua=canvasTex(512,64,(g,w,h)=>{const P={teal:'#2e9488',red:'#b3322a',white:'#efe7d6',black:'#201a18',blue:'#3a6aa8',green:'#3f7a4a',ochre:'#d19a3a'};
 g.fillStyle=P.blue;g.fillRect(0,0,w,h);g.fillStyle=P.green;g.fillRect(0,0,w,h*.14);g.fillRect(0,h*.86,w,h*.14);
 const whorl=(cx,cy,R)=>{for(const [r,c] of[[R,P.white],[R*.86,P.teal],[R*.62,P.white],[R*.5,P.blue],[R*.26,P.ochre]]){g.fillStyle=c;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();}
  g.strokeStyle=P.black;g.lineWidth=1.5;for(let k=0;k<8;k++){const a=k/8*TAU;g.beginPath();g.arc(cx+Math.cos(a)*R*.74,cy+Math.sin(a)*R*.74,R*.2,a+Math.PI*.5,a+Math.PI*1.5);g.stroke();}};
 for(const e of[0,1]){const x0=e?w*.78:0,x1=e?w:w*.22;g.fillStyle=P.teal;g.fillRect(x0,h*.14,x1-x0,h*.72);
  whorl(e?w*.89:w*.11,h*.5,h*.3);for(const s of[-1,1])whorl((e?w*.89:w*.11)+s*w*.07,h*.5,h*.19);
  g.fillStyle=P.white;g.fillRect(e?x0:x1-3,0,3,h);g.fillStyle=P.black;g.fillRect(e?x0+3:x1-5,0,2,h);}
 // the long panel (fangxin), pointed ends, red ground, ochre scrolls
 g.fillStyle=P.white;g.beginPath();g.moveTo(w*.25,h*.5);g.lineTo(w*.3,h*.1);g.lineTo(w*.7,h*.1);g.lineTo(w*.75,h*.5);g.lineTo(w*.7,h*.9);g.lineTo(w*.3,h*.9);g.closePath();g.fill();
 g.fillStyle=P.red;g.beginPath();g.moveTo(w*.26,h*.5);g.lineTo(w*.305,h*.16);g.lineTo(w*.695,h*.16);g.lineTo(w*.74,h*.5);g.lineTo(w*.695,h*.84);g.lineTo(w*.305,h*.84);g.closePath();g.fill();
 g.strokeStyle=P.ochre;g.lineWidth=3;for(let k=0;k<6;k++){const cx=w*(.33+k*.068),cy=h*(.5+(k%2?.1:-.1));g.beginPath();g.arc(cx,cy,h*.16,Math.PI*(k%2?0:1),Math.PI*(k%2?1:2));g.stroke();
  g.beginPath();g.arc(cx+h*.1,cy,h*.07,0,TAU);g.stroke();}
 g.strokeStyle=P.black;g.lineWidth=1.5;g.strokeRect(1,1,w-2,h-2);
 g.fillStyle=P.ochre;for(const x of[w*.22,w*.25,w*.75,w*.78])for(const y of[h*.3,h*.7]){g.beginPath();g.arc(x,y,2.5,0,TAU);g.fill();}});
MAT.hPlank=hStd({map:TEX.hPlank,roughness:.88});vWorldUV(MAT.hPlank,1);
MAT.hLattA=hStd({map:TEX.hLattA,alphaTest:.5,roughness:.7});MAT.hLattB=hStd({map:TEX.hLattB,alphaTest:.5,roughness:.7});MAT.hLattC=hStd({map:TEX.hLattC,alphaTest:.5,roughness:.7});
hWorldUV(MAT.hLattA,2,2);hWorldUV(MAT.hLattB,2,2);hWorldUV(MAT.hLattC,2,2);
MAT.hCaihua=hStd({map:TEX.hCaihua,roughness:.7});
kdef('hPlankB',VBOX,MAT.hPlank);kdef('hLattA',VPLANE,MAT.hLattA);kdef('hLattB',VPLANE,MAT.hLattB);kdef('hLattC',VPLANE,MAT.hLattC);kdef('hCaihua',VPLANE,MAT.hCaihua);
kdef('hCol',new THREE.CylinderGeometry(1,1,1,10).translate(0,.5,0),MAT.paint);    // lacquered round post, base at y=0
// ---------------------------------------------------------------- the house's frame, chosen once (like the Fachwerk style was)
const HFRAME={post:[0x9a2c22,0x8e2a20,0xa4342a],postPoor:[0x6a3024,0x5e2a20,0x72382a,0x4e2a22],
 plank:[0x6a4a34,0x5a3e2c,0x7a5a40,0x4e3626,0x8a6a4c],plankRich:[0x4a2a20,0x5a3024,0x3e2a22]};
function hlFrameOf(){const c=VERN.cur;if(c.frame)return c.frame;const w=c.D.tags.wealth,rich=w==='rich'||w==='civic';
 const st=rich?(rng()<.6?'lattice':'mixed'):w==='middle'?(rng()<.45?'mixed':'plank'):(rng()<.85?'plank':'mixed');
 c.frame={st,rich,poor:w==='poor',
  post:hC(vPick(w==='poor'?HFRAME.postPoor:HFRAME.post)),plank:hC(vPick(rich?HFRAME.plankRich:HFRAME.plank)),
  caihua:rich||(w==='middle'&&rng()<.45),latt:vPick(rich?['hLattB','hLattC','hLattA']:['hLattA','hLattA','hLattB']),
  gallery:rich?.55:w==='middle'?.35:.12,carved:rich?.6:w==='middle'?.25:0,galleryUsed:false,
  dutch:rich?.5:w==='middle'?.33:.1,roofC:hC(vPick(HPAL.slate))};
 return c.frame;}
// ---------------------------------------------------------------- the pieces
// a lattice window: backing (glass / lit / dark — the fitting pass reads these as windows), the lattice in front, a
// lacquered frame, a sill, and on the better houses a caihua head board
function hnLatWin(x,y,z,ry,w,h,kind,frameC){const F=hlFrameOf();frameC=frameC||F.post;const f=loc(x,z,0,.04,ry);
 vB(kind==='lit'?'vWinLit':kind==='glass'?'vWinGlass':'vDarkB',f[0],y,f[1],w,h,.08,ry);
 const l=loc(x,z,0,.11,ry);kput(F.latt,[l[0],y+h/2,l[1]],qEuler(0,ry,0),[w,h,1],hC(0x3a2a22));
 const p=loc(x,z,0,.13,ry);for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.06),.13,ry);vB('hPaint',q[0],y-.06,q[1],.12,h+.12,.1,ry,frameC);}
 vB('hPaint',p[0],y+h,p[1],w+.24,.12,.12,ry,frameC);vB('vWood',p[0],y-.14,p[1],w+.3,.1,.22,ry,hC(0x3a2a22));
 if(F.caihua){const c=loc(x,z,0,.2,ry);kput('hCaihua',[c[0],y+h+.26,c[1]],qEuler(0,ry,0),[w+.24,.22,1],null);vB('hPaint',p[0],y+h+.12,p[1],w+.3,.3,.1,ry,frameC);}}
// a geshan leaf row filling a bay: stiles, a plank dado, a lattice upper panel, a small top panel
function hnGeshan(x,y,z,ry,u0,u1,y0,y1,kind){const F=hlFrameOf();const W=u1-u0,H=y1-y0,n=Math.max(2,Math.round(W/.72)),lw=W/n;
 for(let k=0;k<n;k++){const um=u0+lw*(k+.5);const b=loc(x,z,um,.04,ry);
  vB('hPlankB',b[0],y0,b[1],lw-.04,H*.34,.06,ry,F.plank);                                                       // dado (qunban)
  const g=loc(x,z,um,.02,ry);vB(kind==='lit'&&k%2?'vWinLit':'vDarkB',g[0],y0+H*.38,g[1],lw-.1,H*.5,.04,ry);
  const l=loc(x,z,um,.07,ry);kput(F.latt,[l[0],y0+H*.63,l[1]],qEuler(0,ry,0),[lw-.1,H*.5,1],hC(0x3a2a22));
  vB('hPlankB',b[0],y0+H*.9,b[1],lw-.04,H*.1,.06,ry,F.plank);
  for(const s of[-1,1]){const q=loc(x,z,um+s*(lw/2-.03),.09,ry);vB('hPaint',q[0],y0,q[1],.06,H,.07,ry,F.post);}
  for(const t of[.34,.88]){const q=loc(x,z,um,.09,ry);vB('hPaint',q[0],y0+H*t,q[1],lw,.05,.07,ry,F.post);}}}
// ---------------------------------------------------------------- a frame face (the new hnFachFace)
// (x,z,ry) the face centre and outward direction, w the face width, h the storey; wins: bay indices with windows (-1 =
// every other bay); kind: window kind. Returns nothing. Everything stays inside y..y+h so storeys stack.
function hnFrameFace(x,y,z,ry,w,h,c,wins,kind,winC,o){o=o||{};const F=hlFrameOf();
 const nb=Math.max(1,Math.round(w/2.2)),bw=w/nb,T=.1;
 const isWin=i=>wins===-1?(nb===1||i%2===1||(nb===2&&i===0)):(wins||[]).indexOf(i)>=0;
 const ds=Math.max(.3,Math.min(.46,bw*.2)),tall=h>=2.3,yTop=y+h,archH=tall?.26:.2,yA=yTop-.1-archH;
 const C=VERN.cur,dq=C.fdg||(C.fdg=[]);
 const P=(u,oo)=>loc(x,z,u,oo,ry);const teal=hC(HPAL.teal),white=hC(HPAL.white);
 // sill, head plate, architrave (caihua or lacquer)
 {const p=P(0,T*.6);vB('vWood',p[0],y,p[1],w,.18,.2,ry,hC(0x3a2a22));vB('hPaint',p[0],yA,p[1],w,archH,.16,ry,F.caihua?teal:F.post);
  if(tall)vB('hPaint',p[0],yTop-.1,p[1],w+.1,.1,.26,ry,teal);}
 if(F.caihua)for(let i=0;i<nb;i++){const um=-w/2+bw*(i+.5),p=P(um,T*.6+.085);kput('hCaihua',[p[0],yA+archH/2,p[1]],qEuler(0,ry,0),[bw-.18,archH-.03,1],null);}
 // infill, bay by bay
 for(let i=0;i<nb;i++){const u0=-w/2+i*bw+.1,u1=u0+bw-.2,um=(u0+u1)/2,y0=y+.18,y1=yA,H=y1-y0;const m=P(um,0);
  if(isWin(i)){const ww=Math.min(bw*.62,1.6),wy=y0+H*.3,wh=H*.52;vB('hPlankB',m[0],y0,m[1],u1-u0,H,.08,ry,F.plank);
   hnLatWin(m[0],wy,m[1],ry,ww,wh,kind||'glass',F.post);}
  else if(F.st==='lattice'&&!o.plainBays)hnGeshan(x,y,z,ry,u0,u1,y0,y1,kind);
  else{vB('hPlankB',m[0],y0,m[1],u1-u0,H,.08,ry,F.plank);
   if(F.st==='mixed'&&H>1.6){const l=P(um,.07);vB('vDarkB',l[0],y1-H*.2,l[1],u1-u0-.12,H*.16,.03,ry);kput(F.latt,[l[0],y1-H*.12,l[1]],qEuler(0,ry,0),[u1-u0-.12,H*.16,1],hC(0x3a2a22));}
   else{const r=P(um,.06);vB('vWood',r[0],y0+H*.48,r[1],u1-u0,.08,.05,ry,F.plank.clone().multiplyScalar(.7));}}}   // a rail across the boards
 // posts with banded capitals, each capped by a bracket set; the rich add a set mid-bay on the architrave
 if(!o.noPosts)for(let i=0;i<=nb;i++){const u=Math.max(-w/2+.12,Math.min(w/2-.12,-w/2+i*bw)),p=P(u,T);
  kput('hCol',[p[0],y,p[1]],null,[.13,yA-y,.13],F.post);kput('hCol',[p[0],yA-.2,p[1]],null,[.145,.16,.145],teal);kput('hCol',[p[0],yA-.24,p[1]],null,[.146,.04,.146],white);
  if(tall)dq.push({x:p[0],z:p[1],ry,s:ds,top:yTop});}
 if(tall&&!o.noPosts)(C.ffaces||(C.ffaces=[])).push({x:P(0,0)[0],z:P(0,0)[1],ry,w,s:ds,top:yTop});
 if(tall&&!o.noPosts&&(F.rich||F.caihua))for(let i=0;i<nb;i++){const p=P(-w/2+bw*(i+.5),T);dq.push({x:p[0],z:p[1],ry,s:ds*.85,top:yTop});}}
// a gallery in front of a face: deck on carved cantilevers, posts (lacquered or carved) capped by bracket sets, a fret
// balustrade, a lattice valance under the architrave. dep: how far it stands out.
function hnGalleryFace(x,y,z,ry,w,h,dep,kind){const F=hlFrameOf();const nb=Math.max(2,Math.round(w/2.2)),bw=w/nb;const P=(u,oo)=>loc(x,z,u,oo,ry);const teal=hC(HPAL.teal);
 const ds=Math.max(.3,Math.min(.4,bw*.18)),dgH=.9*ds,yWall=y+h,yTop=yWall-.55,yDg=yTop-dgH,archH=.24,yA=yDg-archH;const dark=hC(0x3a2a22);
 {const d=P(0,dep/2);vB('vWood',d[0],y-.14,d[1],w,.14,dep,ry,F.plank);const e=P(0,dep-.04);vB('hPaint',e[0],y-.3,e[1],w+.04,.18,.1,ry,F.post);}   // deck + lacquered fascia
 for(let i=0;i<=nb;i++){const u=Math.max(-w/2+.12,Math.min(w/2-.12,-w/2+i*bw));
  const k=P(u,dep*.42);kput('hArmW',[k[0],y-.5,k[1]],qEuler(0,ry,0).multiply(qEuler(0,Math.PI/2,0)),[.2,.62,dep*.9],F.post);   // carved cantilever under each post
  const p=P(u,dep-.16);const carved=i>0&&i<nb&&F.carved>0&&(F.carvedPick==null?(F.carvedPick=rng()<F.carved):F.carvedPick);
  if(carved)hnPillar(p[0],y,p[1],.13,yA-y,ry,{});
  else{kput('hCol',[p[0],y,p[1]],null,[.12,yA-y,.12],F.post);kput('hCol',[p[0],yA-.2,p[1]],null,[.135,.16,.135],teal);}
  hnDougong(p[0],yDg,p[1],ry,ds);}
 {const a=P(0,dep-.16);vB('hPaint',a[0],yA,a[1],w,archH,.14,ry,F.caihua?teal:F.post);vB('hPaint',a[0],yTop-.1,a[1],w+.1,.1,.24,ry,teal);
  if(F.caihua)for(let i=0;i<nb;i++){const c=P(-w/2+bw*(i+.5),dep-.08);kput('hCaihua',[c[0],yA+archH/2,c[1]],qEuler(0,ry,0),[bw-.2,archH-.03,1],null);}
  for(let i=0;i<nb;i++){const v=P(-w/2+bw*(i+.5),dep-.14);kput(F.rich?'hLattC':'hLattB',[v[0],yA-.2,v[1]],qEuler(0,ry,0),[bw-.3,.36,1],F.post);}}   // hanging valance (guazi)
 // the pent roof (yan): from the wall top down over the gallery, clear of the brackets; its own eave board
 {const run=dep+.4,k=(yWall-yTop+.02)/run,th=Math.atan(k),Lr=run/Math.cos(th),c=P(0,run/2),yc=yWall-k*run/2+.07;
  kput(F.roofItem||'vShingleB',[c[0],yc,c[1]],qEuler(0,ry,0).multiply(qEuler(th,0,0)),[w+.6,.12,Lr+.1],F.roofC||hC(vPick(HPAL.shingle)));
  const e=P(0,run-.02);vB('hPaint',e[0],yWall-k*run-.14,e[1],w+.6,.14,.06,ry,F.post);}
 // fret balustrade: front and both ends
 const railI=F.rich||F.caihua?'hRailP':'hRailC',railC=railI==='hRailP'?null:F.plank.clone().lerp(hC(0xe8d4b0),.45);
 const rail=(a,b,rry,L)=>{const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];kput(railI,[m[0],y+.45,m[1]],qEuler(0,rry,0),[L-.1,.7,1],railC);
  vB('hPaint',m[0],y+.84,m[1],L,.09,.14,rry,F.post);vB('vWood',m[0],y,m[1],L,.1,.1,rry,dark);};
 {const a=P(-w/2,dep-.16),b=P(w/2,dep-.16);rail(a,b,ry,w);for(const s of[-1,1]){const a2=P(s*(w/2-.08),.1),b2=P(s*(w/2-.08),dep-.16);rail(a2,b2,ry+Math.PI/2,dep-.26);}}}
// ---------------------------------------------------------------- the four overrides
const _hlFachFace0=hnFachFace,_hlFachBox0=hnFachBox,_hlVnWin0=vnWin,_hlNal0=hnNal,_hlShut0=hnRAShutters;
// swinging European shutters go: a lattice window closes with its own inner panels
hnRAShutters=function(){if(!hlFrameOn())return _hlShut0.apply(null,arguments);};
hnFachFace=function(x,y,z,ry,w,h,c,wins,kind,winC){if(!hlFrameOn())return _hlFachFace0(x,y,z,ry,w,h,c,wins,kind,winC);return hnFrameFace(x,y,z,ry,w,h,c,wins,kind,winC);};
hnFachBox=function(x,y,z,w,h,d,ry,wallC,beamC,kind){if(!hlFrameOn())return _hlFachBox0(x,y,z,w,h,d,ry,wallC,beamC,kind);const F=hlFrameOf();
 vB('hPlankB',x,y,z,w-.1,h,d-.1,ry,F.plank.clone().multiplyScalar(.8));                               // the closed core behind the frame
 (VERN.cur.fstor||(VERN.cur.fstor=[])).push({x,z,w,d,ry,top:y+h,ds:Math.max(.3,Math.min(.46,Math.max(w,d)/Math.max(1,Math.round(Math.max(w,d)/2.2))*.2))});
 // one gallery per house at most, on the front of a storey wide and tall enough, above the ground
 const gal=!F.galleryUsed&&y>1.5&&w>=5&&h>=2.4&&rng()<F.gallery;if(gal)F.galleryUsed=true;
 for(const s of[1,-1]){const p=loc(x,z,0,s*d/2,ry),fr=ry+(s>0?0:Math.PI);
  if(s>0&&gal){hnFrameFace(p[0],y,p[1],fr,w,h,beamC,-1,kind==='lit'?'lit':kind,null,{noPosts:true});hnGalleryFace(p[0],y,p[1],fr,w,h,Math.min(1.3,Math.max(.9,d*.14)),kind);}
  else hnFrameFace(p[0],y,p[1],fr,w,h,beamC,-1,kind);}
 for(const s of[1,-1]){const p=loc(x,z,s*w/2,0,ry);hnFrameFace(p[0],y,p[1],ry+s*Math.PI/2,d,h,beamC,d>5?-1:[],kind);}};
vnWin=function(x,y,z,ry,w,h,kind,frameItem,c,shutters){if(!hlFrameOn())return _hlVnWin0(x,y,z,ry,w,h,kind,frameItem,c,shutters);return hnLatWin(x,y,z,ry,w,h,kind,null);};
// the nalichnik becomes a lattice window with a lacquered surround and a small bracketed hood board
hnNal=function(x,y,z,ry,w,h,kind,trimC,o){if(!hlFrameOn())return _hlNal0(x,y,z,ry,w,h,kind,trimC,o);const F=hlFrameOf();hnLatWin(x,y,z,ry,w,h,kind||'glass',F.post);
 const hb=loc(x,z,0,.2,ry);vB('hPaint',hb[0],y+h+.44,hb[1],w+.6,.08,.42,ry,hC(HPAL.teal));
 for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.2),.2,ry);kput('hArm',[q[0],y+h+.3,q[1]],qEuler(0,ry,0).multiply(qEuler(0,Math.PI/2,0)),[.1,.26,.36],F.post);}};

// ---------------------------------------------------------------- the frame and the roof (round 7b)
// Travis: "many buildings have brackets clipping through the slope of the roof ... where the slope of the roof comes
// down into the dougong it looks good, but on the side where the gables are it's not clear what they're interfacing
// with. We may need to try replacing some of these roofs with dutch gabled roofs."
// A gable or hip roof laid on a frame storey (its base at the storey top, its centre over the storey) is LIFTED by the
// bracket band: L = the set's height + its reach x the roof pitch, so the slab clears every set. The band is closed by a
// plank frieze, and everything the builder then lays above the storey top inside the roof's footprint — bargeboards,
// dormers, chimneys, finials, gable murals — rides up with it (the kput wrapper below). Some gables become DUTCH gables
// (a hip with a small gable at the top), which have eaves on all four sides. The storey's bracket sets are placed last
// (hlFrameFlush): in the band on every eave face; on a plain gable's end faces none (the frieze shows instead); inside
// the storey top when no roof sits on it (a storey above).
// round 7c: the roof is matched to a storey by FOOTPRINT (a wing roof is often centred off its storey — the hospital);
// the lift raises only what sits in the roof's own footprint and height band, never a tower drawn through it (the Peles
// villa's loggia); each eave face gets an eave beam across its bracket tips and the lift is sized so the roof comes
// down onto that beam; on a Dutch gable, whatever the builder put on the gable wall moves up onto the small top gable.
const hlInRect=(px,pz,r,mx,mz)=>{const dx=px-r.x,dz=pz-r.z,c=Math.cos(r.ry),s=Math.sin(r.ry);const lx=c*dx-s*dz,lz=s*dx+c*dz;return Math.abs(lx)<=r.w/2+mx&&Math.abs(lz)<=r.d/2+mz?[lx,lz]:null;};
function hlRoofOn(x,y,z,w,d,ry){const C=VERN.cur;if(!C||!C.fstor||!hlFrameOn())return null;const R={x,z,w,d,ry:ry||0};
 for(const s of C.fstor){if(Math.abs(s.top-y)<.35&&hlInRect(s.x,s.z,R,.6,.6))return s;}return null;}
function hlLiftAt(p){const C=VERN.cur;if(!C||!C.lifts||C.liftOff)return null;for(const L of C.lifts){if(p[1]<=L.y0+.02||p[1]>L.y0+L.rise+2.2)continue;
  const q=hlInRect(p[0],p[2],L,L.over,L.over);if(q)return{L,lx:q[0],lz:q[1]};}return null;}
const _hlKputLift=kput;
kput=function(name,p,q,s,c){const h=hlLiftAt(p);
 if(h){const L=h.L;
  if(L.kind==='dutch'&&Math.abs(h.lx)>L.w*.31+.15&&p[1]<L.y0+L.rise*.9&&Math.abs(h.lz)<L.d/2+.6){   // a gable-wall piece: onto the small top gable, smaller
   const sg=Math.sign(h.lx),nlx=sg*(L.w*.31+(Math.abs(h.lx)-L.w/2)),c0=Math.cos(L.ry),s0=Math.sin(L.ry);
   const wx=L.x+c0*nlx+s0*h.lz,wz=L.z-s0*nlx+c0*h.lz;p=[wx,L.y0+L.L+L.rise*.48+(p[1]-L.y0)*.45,wz];
   s=typeof s==='number'?s*.55:[s[0]*.55,s[1]*.55,s[2]*.55];}
  else p=[p[0],p[1]+L.L,p[2]];}
 return _hlKputLift(name,p,q,s,c);};
function hlLift(st,x,y,z,w,d,ry,pitch,over,kind,rise){const C=VERN.cur;const s=st.ds;const L=Math.min(1.7,.9*s+.2+pitch*(s+.25));
 C.liftOff=true;vB('hPlankB',st.x,st.top,st.z,st.w-.14,L+.05,st.d-.14,st.ry,hlFrameOf().plank.clone().multiplyScalar(.65));C.liftOff=false;   // the frieze behind the sets
 const ov=over===undefined?.9:over;const r={x,z,y0:y,L,ry,kind,w,d,rise,over:ov};(C.froofs||(C.froofs=[])).push(r);(C.lifts||(C.lifts=[])).push(r);return r;}
const HHIPOF={hGableSc:'hHipSc',hGableTurf:'hHipTurf',vGableS:'vHipS',vGableT:'vHipT',vGableCu:'vHipCu',vGableC:'vHipC'};
const _hlGable0=vnGableRoof,_hlHip0=vnHipRoof,_hlBarge0=hnBarge,_hlTower0=hnTower,_hlClock0=hnRBClockTower;
vnGableRoof=function(x,y,z,w,d,rise,ry,slabItem,slabC,over,endItem,endC,thick){const st=hlRoofOn(x,y,z,w,d,ry);
 if(!st)return _hlGable0(x,y,z,w,d,rise,ry,slabItem,slabC,over,endItem,endC,thick);
 const F=hlFrameOf();const dutch=w>=5&&rng()<F.dutch;const r=hlLift(st,x,y,z,w,d,ry||0,rise/(d/2),over,dutch?'dutch':'gable',rise);
 F.roofItem=slabItem;F.roofC=slabC||F.roofC;const C=VERN.cur;C.liftOff=true;const Y=y+r.L;
 if(dutch){// the hip below (same pitch), the small gable on top with its upright end triangle set back from the hip ends
  const hip=HHIPOF[slabItem]&&KIT.defs[HHIPOF[slabItem]]?HHIPOF[slabItem]:'hHipSh';_hlHip0(hip,x,Y,z,w,d,rise,ry,slabC,over===undefined?.9:over);
  _hlGable0(x,Y+rise*.48,z,w*.62,d*.52,rise*.52,ry,slabItem,slabC,.28,endItem||'vGablePl',endC||hC(vPick(HPAL.stucco)),thick);}
 else _hlGable0(x,Y,z,w,d,rise,ry,slabItem,slabC,over,endItem,endC,thick);
 C.liftOff=false;};
vnHipRoof=function(item,x,y,z,w,d,rise,ry,c,over){const st=hlRoofOn(x,y,z,w,d,ry);if(!st)return _hlHip0(item,x,y,z,w,d,rise,ry,c,over);
 const r=hlLift(st,x,y,z,w,d,ry||0,rise/(Math.min(w,d)/2),over,'hip',rise);const C=VERN.cur;C.liftOff=true;_hlHip0(item,x,y+r.L,z,w,d,rise,ry,c,over);C.liftOff=false;};
// lace bargeboards on a Dutch gable go on its small top gable only (raised by hand: the lift is off inside)
// bargeboards ride their roof's lift AS A WHOLE (piece by piece, the lower rake pieces stayed behind and the lace splayed
// off the lifted roof — Travis, round 7c); on a Dutch gable they go on its small top gable only
hnBarge=function(x,y,z,w,d,rise,ry,over,c,style,endOver){const C=VERN.cur;const r=C&&C.froofs&&C.froofs.find(r=>Math.abs(r.y0-y)<.35&&hlInRect(x,z,r,1.2,1.2));
 if(!r)return _hlBarge0(x,y,z,w,d,rise,ry,over,c,style,endOver);const o=C.liftOff;C.liftOff=true;
 const v=r.kind==='dutch'?_hlBarge0(x,y+r.L+rise*.48,z,w*.62,d*.52,rise*.52,ry,.28,c,style,endOver):_hlBarge0(x,y+r.L,z,w,d,rise,ry,over,c,style,endOver);C.liftOff=o;return v;};
// towers and clock towers rise THROUGH roofs: nothing of theirs rides a lift
function hlNoLift(f){return function(){const C=VERN.cur;const o=C&&C.liftOff;if(C)C.liftOff=true;try{return f.apply(null,arguments);}finally{if(C)C.liftOff=o;}};}
hnTower=hlNoLift(_hlTower0);hnRBClockTower=hlNoLift(_hlClock0);
// the storeys' bracket sets and eave beams, once the roofs are known
function hlFrameFlush(){const C=VERN.cur;if(!C||!C.fdg)return;C.liftOff=true;
 const roofAt=(x,z,top)=>(C.froofs||[]).find(r=>Math.abs(r.y0-top)<.35&&hlInRect(x,z,r,1.2,1.2));
 const isEave=(ry,r)=>{const fn=loc(0,0,0,1,ry),rz=loc(0,0,0,1,r.ry);return Math.abs(fn[0]*rz[0]+fn[1]*rz[1])>.7;};
 for(const g of C.fdg){const r=roofAt(g.x,g.z,g.top);
  if(!r){hnDougong(g.x,g.top-.1-.9*g.s*.8,g.z,g.ry,g.s*.8);continue;}                     // a storey above: small sets inside the storey top
  if(isEave(g.ry,r)||r.kind!=='gable')hnDougong(g.x,g.top,g.z,g.ry,g.s);}
 for(const f of C.ffaces||[]){const r=roofAt(f.x,f.z,f.top);if(!r||!(isEave(f.ry,r)||r.kind!=='gable'))continue;   // the eave beam on the set tips, under the roof
  const b=loc(f.x,f.z,0,.1+f.s*1.05,f.ry);vB('hPaint',b[0],f.top+.9*f.s,b[1],f.w+.3,.17,.22,f.ry,hC(HPAL.teal));
  const e=loc(f.x,f.z,0,.1+f.s*1.05+.12,f.ry);vB('hPaint',e[0],f.top+.9*f.s+.04,e[1],f.w+.3,.09,.02,f.ry,hC(HPAL.white));}
 C.fdg=null;C.ffaces=null;C.liftOff=false;}
const _hlFlush0=hlFlush;
hlFlush=function(){hlFrameFlush();const C=VERN.cur;const r=_hlFlush0();if(C)C.lifts=null;return r;};   // murals placed in the flush still ride the lift
// ---------------------------------------------------------------- harlequin roofs (the Izmailovo temple, round 7b)
// Diamond-checked tile in two tones with a gold seam: green/lime for the great dome and some tents, red/white for
// the others. The pattern repeats round a lathe (u) and up it (v); instance colour stays white.
function hlHarl(a,b,seam){return canvasTex(128,128,(g,w,h)=>{g.fillStyle=a;g.fillRect(0,0,w,h);g.fillStyle=b;
 for(const [cx,cy] of[[w/2,h/2]]){g.beginPath();g.moveTo(cx,cy-h/2);g.lineTo(cx+w/2,cy);g.lineTo(cx,cy+h/2);g.lineTo(cx-w/2,cy);g.closePath();g.fill();}
 g.strokeStyle=seam;g.lineWidth=3;g.beginPath();g.moveTo(0,h/2);g.lineTo(w/2,0);g.lineTo(w,h/2);g.lineTo(w/2,h);g.closePath();g.stroke();
 g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.arc(w*.5,h*.38,6,0,TAU);g.fill();});}
TEX.hHarlG=hlHarl('#2e6e3a','#7fa848','#c89a30');TEX.hHarlG.repeat.set(12,6);
TEX.hHarlR=hlHarl('#9a2420','#d8cfbe','#c89a30');TEX.hHarlR.repeat.set(5,3);
TEX.hHarlGt=hlHarl('#1f5a40','#5f9a50','#c89a30');TEX.hHarlGt.repeat.set(5,3);
MAT.hHarlG=hStd({map:TEX.hHarlG,roughness:.45,metalness:.1});MAT.hHarlR=hStd({map:TEX.hHarlR,roughness:.5});MAT.hHarlGt=hStd({map:TEX.hHarlGt,roughness:.5});
// the great dome: a bulb fatter than the onion, its widest point low, drawn to a short neck
const HGDOME=new THREE.LatheGeometry([[0,0],[.86,0],[1.06,.12],[1.16,.28],[1.14,.44],[1.0,.6],[.74,.76],[.44,.88],[.18,.96],[.06,.99],[0,1]].map(p=>new THREE.Vector2(p[0],p[1])),32);
kdef('hDomeHG',HGDOME,MAT.hHarlG);kdef('hTentHR',HTENT,MAT.hHarlR);kdef('hTentHG',HTENT,MAT.hHarlGt);kdef('hBulbHG',HBULB,MAT.hHarlGt);
// ---------------------------------------------------------------- balustrades (round 7c)
// Travis: "make the balcony railings less asian and give them more of a circular motif with triskelions and/or make them
// more carved/painted wooden balcony railings." One baluster panel per 0.5 m: two stiles, a great ring holding a
// triskelion between small rings above and below, top and bottom rails. PAINTED: teal rings, red triskelion, ochre
// stiles, dark outlines (the mural palette); CARVED: pale, tinted by the house's wood.
function hlRailTex(painted){return canvasTex(128,160,(g,w,h)=>{g.clearRect(0,0,w,h);
 const P=painted?{stile:'#c8902e',ring:'#2e9488',tri:'#b3322a',rail:'#8a2e22',line:'#201a18'}:{stile:'#fff',ring:'#fff',tri:'#fff',rail:'#fff',line:'rgba(0,0,0,.45)'};
 const bar=(x,y,ww,hh,c)=>{g.fillStyle=c;g.fillRect(x,y,ww,hh);};
 bar(0,0,w,10,P.rail);bar(0,h-10,w,10,P.rail);bar(6,0,7,h,P.stile);bar(w-13,0,7,h,P.stile);
 const cx=w/2,cy=h/2,R=34;const ring=(x,y,r,c,lw)=>{g.strokeStyle=P.line;g.lineWidth=lw+3;g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();};
 bar(cx-3,10,6,h-20,P.stile);ring(cx,cy,R,P.ring,7);ring(cx,24,12,P.ring,5);ring(cx,h-24,12,P.ring,5);
 for(let k=0;k<3;k++){const a0=k*TAU/3;for(const [c,lw] of[[P.line,8],[P.tri,5]]){g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.beginPath();
  for(let t=0;t<=1.001;t+=.05){const r=t*R*.82,a=a0+t*2.5,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;t?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}}
 g.fillStyle=P.tri;g.beginPath();g.arc(cx,cy,5,0,TAU);g.fill();});}
TEX.hRailP=hlRailTex(true);TEX.hRailC=hlRailTex(false);
MAT.hRailP=hStd({map:TEX.hRailP,alphaTest:.5,roughness:.7});MAT.hRailC=hStd({map:TEX.hRailC,alphaTest:.5,roughness:.8});
hWorldUV(MAT.hRailP,2,1/.7);hWorldUV(MAT.hRailC,2,1/.7);
kdef('hRailP',VPLANE,MAT.hRailP);kdef('hRailC',VPLANE,MAT.hRailC);
// ---------------------------------------------------------------- the temple's great dome, flattened (round 7c)
// Travis: "give Temple of the Pantheon more of a rectangular/flattened dome like in the previously sent pics" — the
// Izmailovo dome is a long cushion: a rounded-rectangle plan (a superellipse ring at every height of a lathe profile)
// on a broad, flat-shouldered profile.
function hlSquircleLathe(prof,seg,n){const pos=[],uv=[],idx=[];const e=2/n;
 prof.forEach(([r,y],i)=>{for(let j=0;j<=seg;j++){const a=j/seg*TAU,c=Math.cos(a),s=Math.sin(a);
  pos.push(r*Math.sign(c)*Math.pow(Math.abs(c),e),y,r*Math.sign(s)*Math.pow(Math.abs(s),e));uv.push(j/seg,i/(prof.length-1));}});
 for(let i=0;i<prof.length-1;i++)for(let j=0;j<seg;j++){const a=i*(seg+1)+j,b=a+seg+1;idx.push(a,b,a+1,a+1,b,b+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
const HGDOME2=hlSquircleLathe([[.9,0],[1.02,.08],[1.09,.22],[1.1,.38],[1.05,.52],[.95,.64],[.8,.75],[.6,.85],[.36,.93],[.14,.98],[0,1]],48,3.4);
kdef('hDomeHG2',HGDOME2,MAT.hHarlG);
