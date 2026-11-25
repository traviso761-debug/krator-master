// ================================================================= THE FLASHING EYE — the revamp's roofs and towers (helpers, prefix fe)
// The owner, 2026-11-23 (four references): white-washed walls under red tiled roofs with upturned eaves, tiered on the towers
// and gates, the complex climbing its terraces; tall towers, one white and tapering under a round red cap with a crimson band (the
// first reference), one white with its painted window bays one over another, a crimson band, a gallery and a broad roof (the
// second). These are the shapes the records of 89qf draw with, on the Qiblai kit's helpers (qnCube, qnWins, qnDoor) and the
// kit's instancing (kdef, kput, vB). Local frame as the kit's: +z the front, y up, metres. No gold here: the gilt finials are
// the callers' (only the Assembly Hall's crown and the Ember's sanctum may have them).
const FE_RED=0xb03a2c,FE_TEAL=0x4f9e94,FE_DARK=0x2a2422,FE_OCHRE=0xc8962e;
const feCol=h=>xC(h);
// ---------------------------------------------------------------- the hip roof with upturned eaves: a unit shape per aspect
// One geometry per aspect bucket (width over depth), x and z in [-.5, .5], y in [0, 1]: concave slopes from the ridge to the eave,
// the eave rising toward the corners (the swept eave), the hips meeting the ridge. kput scales it to (w, h, d) at a base y.
const FE_ROOF_A=[1,1.5,2,3,4,6,9];
const FE_ROOF_DEF={};
function feRoofKey(a){let b=FE_ROOF_A[0];for(const x of FE_ROOF_A)if(Math.abs(x-a)<Math.abs(b-a))b=x;const key='feRoofA'+String(b).replace('.','_');
 if(FE_ROOF_DEF[key])return key;
 const W=b,r=(b-1)/2,nx=Math.max(10,Math.round(b*10)),nz=10,pos=[],uv=[],idx=[];
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const X=-W/2+W*i/nx,Z=-.5+j/nz,cx=Math.max(0,Math.abs(X)-r)/.5,cz=Math.abs(Z)/.5,m=Math.max(cx,cz);
  const lift=.24*Math.pow(Math.min(cx,cz),2.6)+.05*Math.pow(m,4);   /* the corners swept up; the whole eave a little */
  pos.push(X/W,Math.pow(1-m,1.45)+lift,Z);uv.push(X,Z);}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a0=j*(nx+1)+i,a1=a0+1,b0=a0+nx+1,b1=b0+1;idx.push(a0,b0,a1,a1,b0,b1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(idx);g.computeVertexNormals();kdef(key,g,MAT.feRoof);FE_ROOF_DEF[key]=1;return key;}
// a roof over (x, z) at y: w across, d deep, h tall; its ridge along the longer side; c its colour (red by default)
function feRoof(x,y,z,w,d,ry,h,c){ry=ry==null?0:ry;let W=w,D=d,R=ry;if(D>W){W=d;D=w;R=ry+Math.PI/2;}
 kput(feRoofKey(W/D),[x,y,z],R?qEuler(0,R,0):null,[W,h,D],c||feCol(FE_RED));
 if(W/D>1.25)vB('xPaint',x,y+h*.93,z,(W-D)*1.02+.4,.32,.34,R,feCol(0x7a2018));   /* the ridge's cap */
 return y+h;}
// the round cap of the first reference: a broad brim, a steep cone, a stub; one lathe, scaled to radius R and height H
kdef('feCap',new THREE.LatheGeometry([[0,1],[.06,.97],[.13,.84],[.26,.6],[.48,.34],[.74,.14],[.95,.04],[1.03,.02],[1.0,-.03],[.6,-.01],[0,.02]].map(p=>new THREE.Vector2(p[0],p[1])),24),MAT.feRoof);
function feCapRoof(x,y,z,R,H,c){kput('feCap',[x,y,z],null,[R,H,R],c||feCol(FE_RED));return y+H;}
// a finial: a dark post, a ball, a pennant (the gilt one only where the caller passes gold)
function feFinial(x,y,z,h,c){c=c||feCol(FE_DARK);vPst('vPost',x,y-.2,z,.07,h,c);vBall('xPaint',x,y+h*.55,z,.22,c);vB('vClothB',x+.45,y+h*.72,z,.8,.32,.03,0,feCol(0xa8302a));return y+h;}
// the teal frieze of the references, its red roundels every `pitch` m, round a block at y (w x d)
function feFrieze(x,y,z,w,d,ry,h,roundels){vB('xPaint',x,y,z,w+.08,h,d+.08,ry,feCol(FE_TEAL));
 if(roundels)for(const s of[-1,1]){const n=Math.max(1,Math.floor(w/3));for(let i=0;i<n;i++){const u=-w/2+(i+.5)*w/n,p=loc(x,z,u,s*(d/2+.06),ry);vB('xPaint',p[0],y+h*.2,p[1],.5,h*.6,.04,ry,feCol(0xa8302a));}}}
// tiers: n roofs stacked, each a skirt over a smaller white drum (its teal band), the last a full roof and a finial; returns the top
function feTiers(x,y,z,w,d,ry,n,o){o=o||{};let yy=y,ww=w,dd=d;const ov=o.ov==null?1.6:o.ov,step=o.step==null?.74:o.step,drum=o.drum==null?2.2:o.drum,wash=o.wash||xC(xPick(XPAL.wash));
 for(let i=0;i<n;i++){const last=i===n-1,rh=last?Math.min(ww,dd)*.46+.6:Math.min(ww,dd)*.2+.4;
  feRoof(x,yy,z,ww+2*ov,dd+2*ov,ry,rh,o.roofC);
  if(last){yy+=rh*.92;break;}
  ww*=step;dd*=step;const y0=yy+rh*.5;qnCube(x,y0,z,ww,drum,dd,ry,wash,'wash');feFrieze(x,y0+drum-.55,z,ww,dd,ry,.4,false);yy=y0+drum;}
 return o.finial===false?yy:feFinial(x,yy-.3,z,o.finialH==null?2.4:o.finialH,o.finialC);}
// a battered white apron down a cliff's face under a building standing on the Lip: three courses, each a little proud of the last
function feApron(x,z,w,d,ry,drop,c){const k=Math.max(1,Math.round(drop/10)),h=drop/k;for(let i=0;i<k;i++){const g=(k-i)*.7;vB('qAshB',x,-drop+i*h,z,w+2*g,h+.05,d+2*g,ry,c);}}

// ---------------------------------------------------------------- the towers
// the first reference: a white shaft tapering in four lifts, a slit of windows up its front, a crimson band, an open lantern under
// a broad round red cap. o: W (base), H (the shaft), lantern (m), mirror, basket (the fire basket), drop (an apron down a face)
function feTowerRound(o){const W=o.W,H=o.H,wash=xC(xPick(XPAL.wash)),red=feCol(0xa8302a),dark=feCol(FE_DARK),L=o.lantern==null?2.6:o.lantern;
 if(o.drop)feApron(0,0,W+1.2,W+1.2,0,o.drop,wash.clone().multiplyScalar(.92));
 qnPlinth(0,0,W+1.2,W+1.2,.6,0,xC(xPick(QSTONE)));let y=.6,w=W;
 /* o.lifts (4): the shaft's lifts, each a storey of its interior (a lift's underside would be a false ceiling in a taller room) */
 const nl=o.lifts==null?4:o.lifts;for(let i=0;i<nl;i++){const h=H/nl,w1=w*.94;qnCube(0,y,0,w,h,w,0,wash,'wash');y+=h;w=w1;}
 vB('xPaint',0,.6+H*.18,W/2-.02-H*.012,.8,H*.62,.14,0,dark);   /* the slit of windows */
 for(let i=1;i<6;i++)vB('xPaint',0,.6+H*.18+i*H*.62/6,W/2+.02-H*.012,1.1,.14,.2,0,wash);
 qnDoor(0,.6,W/2,0,1.5,2.4,{c:xC(XPAL.red),valC:red});
 qnCube(0,y,0,w,1.9,w,0,red,'wash');vB('xPaint',0,y+1.9,0,w+.3,.25,w+.3,0,dark);y+=2.15;   /* the crimson band and its cornice */
 const lw=w*.92;vB('qAshB',0,y,0,lw,.25,lw,0,wash);
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(lw/2-.25),y,sz*(lw/2-.25),.18,L,red);
 /* the lantern's low parapet: a ring, so the lantern's floor (y + .25) is a floor to stand on (the Eye Post's heliograph and fire
    basket are the catalog's, placed on it by the interiors, targets/cone/90fk) */
 for(const s of[-1,1]){vB('xPaint',0,y+.25,s*(lw*.49-.1),lw,.9,.2,0,red);vB('xPaint',s*(lw/2-.1),y+.25,0,.2,.9,lw*.98-.4,0,red);}
 if(o.mirror)for(let i=0;i<(o.mirror===true?1:o.mirror);i++){const a=-.6+i*.6,mx=Math.sin(a)*lw*.3,mz=Math.cos(a)*lw*.3;vPst('vPost',mx,y+.25,mz,.04,.92,dark);vB('xPaint',mx,y+1.15,mz,.62,.62,.07,a,feCol(0xa07a48));}
 /* the fire basket's coals (their own item, lit by the hour: 90fh), where the catalog's basket holds them */
 if(o.basket){vB('feFireB',-lw*.25,y+.25+.82,-lw*.25,.36,.28,.36,0,xC(0xffffff));feLamp(-lw*.25,y+.25+1.2,-lw*.25,'fire');}
 y+=L;const top=feCapRoof(0,y,0,lw*.5+W*.34,W*.62,feCol(FE_RED));
 feFinial(0,top-.2,0,2.6);return top+2.4;}
// the second reference: a tall white shaft, a column of painted window bays up its front, a crimson band with its windows, a gallery
// on brackets and a broad red roof. o: W, H, bays (storeys of bays)
function feTowerBays(o){const W=o.W,H=o.H,wash=xC(xPick(XPAL.wash)),red=feCol(0xa8302a),ochre=feCol(FE_OCHRE),dark=feCol(FE_DARK),n=o.bays==null?6:o.bays;
 if(o.drop)feApron(0,0,W+1.2,W+1.2,0,o.drop,wash.clone().multiplyScalar(.92));
 qnPlinth(0,0,W+1.4,W+1.4,.8,0,xC(xPick(QSTONE)));let y=.8;
 const S=qnCube(0,y,0,W,H,W,0,wash,'wash'),wt=W*S;
 const sh=H/(n+1);for(let i=0;i<n;i++){const yb=y+sh*(i+.7),f=W/2+.18;   /* the bays, one over another */
  vB('xPaint',0,yb-.2,f,3.3,sh*.82,.36,0,ochre);vB('xPaint',0,yb+.1,f+.05,2.4,sh*.58,.36,0,dark);vB('xPaint',0,yb+sh*.62,f+.18,3.9,.3,.7,0,dark);
  for(const s of[-1,1])vB('xPaint',s*.65,yb+.1,f+.12,.12,sh*.58,.2,0,ochre);}
 qnDoor(0,y,W/2,0,2,3,{c:xC(XPAL.red),valC:red});
 y+=H;qnCube(0,y,0,wt,3,wt,0,red,'wash');   /* the crimson band and its windows */
 for(const s of[-1,1])for(const [dx,dz,ry] of[[0,s*(wt/2+.05),0],[s*(wt/2+.05),0,Math.PI/2]])for(let i=-1;i<=1;i++){const p=[dx+(ry?0:i*wt*.3),dz+(ry?i*wt*.3:0)];vB('xPaint',p[0],y+.7,p[1],ry?.1:1.1,1.4,ry?1.1:.1,0,wash);}
 for(let i=0;i<7;i++)for(const s of[-1,1]){const u=-wt/2+.5+i*(wt-1)/6;vB('xPaint',s*(wt/2+.5),y-1.2+(i%2)*.3,u,1,.5,.4,0,dark);}   /* the brackets */
 y+=3;vB('qAshB',0,y,0,wt+2.4,.3,wt+2.4,0,wash);   /* the gallery's floor */
 for(let i=0;i<=8;i++){const u=-(wt/2+1)+i*(wt+2)/8;for(const s of[-1,1]){vPst('vPost',u,y+.3,s*(wt/2+1),.06,1.1,red);vPst('vPost',s*(wt/2+1),y+.3,u,.06,1.1,red);}}
 for(const s of[-1,1]){vB('xPaint',0,y+1.35,s*(wt/2+1),wt+2,.12,.12,0,ochre);vB('xPaint',s*(wt/2+1),y+1.35,0,.12,.12,wt+2,0,ochre);}
 qnCube(0,y+.3,0,wt*.86,2.8,wt*.86,0,wash,'wash');feFrieze(0,y+2.5,0,wt*.86,wt*.86,0,.5,true);
 const top=feRoof(0,y+3.1,0,wt+6.5,wt+6.5,0,wt*.36,feCol(FE_RED));
 if(o.mirror)vB('xPaint',0,y+1.6,wt/2+1.05,.62,.62,.07,0,feCol(0xa07a48));
 feFinial(0,top-.4,0,2.8);return top+2.4;}
// the third and fourth references' smaller towers: a white tapering shaft, a teal band, two red tiers. o: W, H, drop
function feTowerPagoda(o){const W=o.W,H=o.H,wash=xC(xPick(XPAL.wash));
 if(o.drop)feApron(0,0,W+1,W+1,0,o.drop,wash.clone().multiplyScalar(.92));
 qnPlinth(0,0,W+1,W+1,.5,0,xC(xPick(QSTONE)));const S=qnStack(0,.5,0,W,W,0,[H*.5,H*.5],wash,'wash',false);
 qnWins(0,.5,0,W,W,0,[H*.5,H*.5],S.k,{pitch:2.4,ww:.45,wh:.8,kind:'lit',trim:feCol(0xa8302a)});
 feFrieze(0,.5+H-.9,0,S.w,S.d,0,.6,true);vB('xPaint',0,.5+H-.2,0,S.w+.3,.2,S.d+.3,0,feCol(0xa8302a));
 return feTiers(0,.5+H,0,S.w,S.d,0,2,{ov:1.3,step:.72,drum:2,wash});}
