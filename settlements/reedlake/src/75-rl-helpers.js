// ================================================================= REED LAKE — registry + structural helpers (prefix hnRL)
// Local frame as in the Highlands kit: origin at the plot centre, +z the front (the landing / door side), y up,
// metres. The GROUND of every builder is y = 0 = the top of the reed island it stands on; the lake surface is at
// RL.WATER below it. A def placed on its own gets a PAD (a small floating island of its own, hnRLPad) unless
// o.pad === false — the composite islands place their buildings that way, on one shared island.
// The defs register through HL.def with branch 'tribal' only so the vendored Highlands helpers behave (no mural
// fitting pass, no pillars); the lake is its own culture (tag 'reed-lake') and uses none of the carved vocabulary.
const RL={WATER:-.45,
 def(D){D.branch='tribal';D.tags=Object.assign({culture:'reed-lake',kit:'reedlake'},D.tags||{});return HL.def(D);},
};
HL.branches.tribal='Reed Lake';   // the showcase rows and views name the branch after the lake

// ---------------------------------------------------------------- meshes with their own UVs
// fn(u,v) -> [x,y,z,U,V]; hole(u,v) drops a quad. Returns the mesh (added to G, in the builder's local frame).
function hnRLMesh(G,fn,nu,nv,mat,hole){const pos=[],uv=[],idx=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const p=fn(i/nu,j/nv);pos.push(p[0],p[1],p[2]);uv.push(p[3],p[4]);}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){if(hole&&hole((i+.5)/nu,(j+.5)/nv))continue;const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;idx.push(a,c,b,b,c,d);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setIndex(idx);geo.computeVertexNormals();return mesh(geo,mat,G);}
function hnRLTint(mat,c){const m=mat.clone();if(mat.onBeforeCompile)m.onBeforeCompile=mat.onBeforeCompile;m.color=c;return m;}

// ---------------------------------------------------------------- the floating island
// An outline: radius as a function of angle a (x = cos a, z = sin a) — an ellipse rx x rz with three octaves of
// wobble. amp ~ .12 for a tidy island, .2 for a ragged one.
function hnRLOutline(rx,rz,seed,amp){amp=amp===undefined?.13:amp;return a=>{const c=Math.cos(a),s=Math.sin(a);const r0=rx*rz/Math.sqrt(rz*rz*c*c+rx*rx*s*s);
 return r0*(1+amp*(Math.sin(a*3+seed)*.5+Math.sin(a*5+seed*1.7)*.3+Math.sin(a*8+seed*2.3)*.2));};}
// The island body at (x,z): layers of piled reed from y = -depth up to the surface at y = 0, an older, darker
// layer for each course down; the top a mat of cut reed (a lagoon inside it if o.inner(a) > 0); a fringe of loose
// reed ends hanging over the edge. Returns the outline function for the caller's reed beds and anchors.
function hnRLIsland(G,x,z,rf,o){o=o||{};const depth=o.depth||1.3,NL=4,n=o.n||Math.max(48,Math.round(rf(0)*2.5)),rin=o.inner||(a=>0);
 for(let L=0;L<NL;L++){const y1=-L*depth/NL,y0=y1-depth/NL,k=1-L*.05,ph=L*1.3+(o.seed||0);
  const m=hnRLMesh(G,(u,v)=>{const a=u*TAU;const r=rf(a)*k*(1+.025*Math.sin(a*11+ph)+.015*Math.sin(a*17-ph));return[x+Math.cos(a)*r,y0+(y1-y0)*v,z+Math.sin(a)*r,u*rf(0)*TAU/2,v*.6];},n,1,MAT.rlLayer);
  m.material=hnRLTint(MAT.rlLayer,hC(vPick(L?RPAL.strawOld:RPAL.straw)).multiplyScalar(1-L*.1));}
 // a lagoon: the same layers round its inner edge, facing in, up to the water line
 const lag=!!o.inner;if(lag)for(let L=0;L<NL;L++){const y1=Math.min(RL.WATER-.12,-L*depth/NL),y0=y1-depth/NL;if(y0>=y1)continue;const ph=L*1.7;
  const m=hnRLMesh(G,(u,v)=>{const a=-u*TAU;const r=rin(a)*(1+.03*Math.sin(a*9+ph));return[x+Math.cos(a)*r,y0+(y1-y0)*v,z+Math.sin(a)*r,u*rin(0)*TAU/2,v*.6];},Math.round(n*.6),1,MAT.rlLayer);
  m.material=hnRLTint(MAT.rlLayer,hC(vPick(RPAL.strawOld)).multiplyScalar(.9-L*.08));}
 // the top: an annulus from the lagoon edge (or the centre) to the outline, dipping to the water at the lagoon
 const top=hnRLMesh(G,(u,v)=>{const a=u*TAU;const ri=rin(a),ro=rf(a);const r=lerp(ri,ro,v);
  let y=(fbm(Math.cos(a)*r*.3+7,Math.sin(a)*r*.3,1.1,2)-.5)*.08;if(lag&&v<.14)y=lerp(RL.WATER-.15,y,v/.14);
  return[x+Math.cos(a)*r,y,z+Math.sin(a)*r,(x+Math.cos(a)*r)/3,(z+Math.sin(a)*r)/3];},n,6,MAT.rlIsland);
 top.material=hnRLTint(MAT.rlIsland,hC(vPick(RPAL.island)));top.userData.isGround=true;
 // fringe: loose reed hanging over the edge
 const nf=Math.round(n*.8);for(let i=0;i<nf;i++){const a0=i/nf*TAU,a1=(i+1)/nf*TAU,am=(a0+a1)/2;const p0=[x+Math.cos(a0)*rf(a0),z+Math.sin(a0)*rf(a0)],p1=[x+Math.cos(a1)*rf(a1),z+Math.sin(a1)*rf(a1)];
  const L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);const yaw=Math.atan2(p1[0]-p0[0],p1[1]-p0[1])+Math.PI/2;const q=qEuler(0,yaw,0).multiply(qEuler(-.45,0,0));
  const out=[Math.cos(am),Math.sin(am)];kput('hRLFringe',[(p0[0]+p1[0])/2+out[0]*.12,-.2,(p0[1]+p1[1])/2+out[1]*.12],q,[L+.1,.55,1],hC(vPick(RPAL.straw)));}
 return rf;}
// Reed beds in the water round an outline: clumps of living reed just outside the edge, thicker where o.dense,
// none across the arcs in o.gaps (the landing). Angles as in hnRLOutline.
function hnRLReeds(x,z,rf,o){o=o||{};const n=o.n||Math.round(rf(0)*3.2),gaps=o.gaps||[];const inGap=a=>gaps.some(g=>{const d=((a-g[0])%TAU+TAU)%TAU;return d<((g[1]-g[0])%TAU+TAU)%TAU;});
 for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.1,.1);if(inGap(a))continue;const r=rf(a)+rr(.4,o.spread||2.4);const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
  const s=rr(.7,1.3);kput('hRLReed',[px,RL.WATER-.1,pz],qEuler(0,rng()*TAU,0),[s*1.2,rr(1.6,2.6),s*1.2],hC(vPick(RPAL.reedGreen)));
  if(rng()<.4)kput('hRLReed',[px+rr(-.8,.8),RL.WATER-.1,pz+rr(-.8,.8)],qEuler(0,rng()*TAU,0),[s,rr(1.2,2),s],hC(vPick(RPAL.reedGreen)));}}
// A free-standing clump of reeds (in the lagoon, beside a raft)
function hnRLReedClump(x,z,n,spread){for(let k=0;k<n;k++){const s=rr(.7,1.3);kput('hRLReed',[x+rr(-spread,spread),RL.WATER-.1,z+rr(-spread,spread)],qEuler(0,rng()*TAU,0),[s*1.2,rr(1.5,2.5),s*1.2],hC(vPick(RPAL.reedGreen)));}}
// An anchor: a eucalyptus pole driven into the lake bed just off the edge, leaning out, a rope to a stake on the top.
function hnRLAnchor(x,z,rf,a){const r=rf(a);const px=x+Math.cos(a)*(r+.9),pz=z+Math.sin(a)*(r+.9);const c=hC(vPick(RPAL.pole));
 kput('vPost',[px,RL.WATER-.6,pz],qEuler(0,-a,0).multiply(qEuler(0,0,-.18)),[.09,3.2,.09],c);
 const sx=x+Math.cos(a)*(r-1.2),sz=z+Math.sin(a)*(r-1.2);vPst('vPost',sx,0,sz,.05,.5,c);
 beam('vRope',[px+Math.cos(a)*.45,RL.WATER+2.3,pz+Math.sin(a)*.45],[sx,.45,sz],.025,.025,hC(vPick(RPAL.rope)));}
// A def's own pad: a small island round the plot (W x D), reed beds round it with a gap at the front landing, two
// anchors. Skipped when o.pad === false (the def is standing on a shared island).
function hnRLPad(W,D,o,seed,cx,cz){if(o&&o.pad===false)return null;cx=cx||0;cz=cz||0;const rf=hnRLOutline(W/2+2.2,D/2+2.2,seed===undefined?rr(0,9):seed,.12);
 hnRLIsland(VERN.cur.G,cx,cz,rf,{seed:seed||0});hnRLReeds(cx,cz,rf,{gaps:[[Math.PI/2-.55,Math.PI/2+.55]]});
 hnRLAnchor(cx,cz,rf,Math.PI*1.25);hnRLAnchor(cx,cz,rf,-Math.PI*.25);return rf;}

// ---------------------------------------------------------------- the MUDHIF (the reed arch house)
// A hall of reed-bundle arches: ribs every ~1.2 m along the long axis (local z — the door is on the +z end),
// horizontal purlin bundles lashed over them, a skin of woven matting; each end a row of free-standing bundle
// columns with matting below and open lattice above, a tall doorway in the middle of the front.
// V = {x,z,L (length along z),S (span),H, cols, door:true, back:'lattice'|'mat', rib (rib radius), col (column
//      radius), hl (height of the mat band), c (bundle tint), skinC}. Returns {y(t): the arch height at t=-1..1}.
function hnRLMudhif(G,V){const {x,z,L,S,H}=V,n=V.cols||5,rib=V.rib||.16,cr=V.col||.22,c=V.c||hC(vPick(RPAL.straw)),pw=2.4;
 const Y=t=>H*Math.pow(Math.max(0,1-Math.pow(Math.abs(t),pw)),1/pw);const P=t=>[x+S/2*t,Y(t)];
 const hl=V.hl||clamp(H*.4,1.3,3.2);
 // skin
 const arc=[];let acc=0;for(let k=0;k<=32;k++){const t=k/32*2-1;if(k){const a=P(t),b=P(k/32*2-1-2/32);acc+=Math.hypot(a[0]-b[0],a[1]-b[1]);}arc.push(acc);}
 const sk=hnRLMesh(G,(u,v)=>{const t=v*2-1;const p=P(t);const k=1-.012;return[x+(p[0]-x)*k,p[1]*k-.02,z-L/2+u*L,u*L/1.5,arc[Math.round(v*32)]/1.5];},Math.max(8,Math.round(L/1.2)),32,MAT.rlMatM);
 sk.material=hnRLTint(MAT.rlMatM,V.skinC||hC(vPick(RPAL.straw)));
 // ribs (bundle arches, over the skin) and purlins
 const nr=Math.max(3,Math.round(L/1.25));for(let i=0;i<=nr;i++){const zz=z-L/2+L*i/nr;let a=null;
  for(let k=0;k<=16;k++){const t=k/16*2-1;const p=P(t);const b=[x+(p[0]-x)*(1+.03),p[1]*1.03+.06,zz];if(a)beam('hRLBundleC',a,b,rib*2,rib*2,c);a=b;}}
 for(const t of[-.92,-.7,-.45,-.2,.05,.3,.55,.8]){const p=P(t);const pc=[x+(p[0]-x)*1.04,p[1]*1.04+.1,z];kput('hRLBundleX',pc,qEuler(0,Math.PI/2,0),[L+.4,rib*.55,rib*.55],c.clone().multiplyScalar(.9));}
 // the ends: columns, mats, lattice, the door
 for(const s of[1,-1]){const ze=z+s*L/2;const isFront=s>0;const lat=isFront||V.back!=='mat';const dw=Math.min(1.7,S*.26),dh=hl+.5;
  const doorHere=isFront&&V.door!==false;
  const holeL=doorHere?(u,v)=>Math.abs(u*2-1)*S/2<dw/2:null;
  const wallY=(v,t)=>Math.min(hl,Y(t));
  const w1=hnRLMesh(G,(u,v)=>{const t=u*2-1;const yy=wallY(v,t)*v;return[x+S/2*t*.985,yy,ze-s*.12,u*S/2,yy/2];},24,3,MAT.rlMatM,holeL);w1.material=sk.material;
  if(lat){const w2=hnRLMesh(G,(u,v)=>{const t=u*2-1;const y0=Math.min(hl,Y(t)),y1=Math.max(y0,Y(t)-.05);const yy=lerp(y0,y1,v);return[x+S/2*t*.985,yy,ze-s*.14,u*S/2,yy/2];},24,6,MAT.rlLattice);}
  else{const w2=hnRLMesh(G,(u,v)=>{const t=u*2-1;const y0=Math.min(hl,Y(t)),y1=Math.max(y0,Y(t)-.05);const yy=lerp(y0,y1,v);return[x+S/2*t*.985,yy,ze-s*.12,u*S/2,yy/2];},24,6,MAT.rlMatM);w2.material=sk.material;}
  for(let i=0;i<n;i++){const t=-.86+1.72*i/(n-1);const p=P(t);const h=p[1]+.45;vPst('hRLBundle',p[0],0,ze+s*.05,cr,h,c);
   for(let k=0;k<3;k++)vPst('hRLBundleC',p[0],h+.1+k*.02,ze+s*.05,cr*.3,.24,c.clone().multiplyScalar(1.05));}   // the tied top
  kput('hRLBundleX',[x,hl+.02,ze+s*.2],null,[S*.97,rib*.6,rib*.6],c.clone().multiplyScalar(.9));               // the bundle across the front at the mat/lattice line
  if(doorHere){vB('vDarkB',x,0,ze-s*.06,dw,dh,.1,0);
   for(const q of[-1,1])hnMember('hRLBundleC',[x+q*dw/2,dh-.3,ze+s*.16],[x,dh+.7,ze+s*.16],.2,.2,[0,0,1],c);   // the pointed head of the doorway
   for(const q of[-1,1])vPst('hRLBundle',x+q*(dw/2+.14),0,ze+s*.12,.1,dh-.2,c);
   vB('hRLMatB',x,-.02,ze+s*.5,dw+.8,.08,.9,0,hC(vPick(RPAL.strawOld)));}
  if(!isFront){for(const q of[-1,1])vB('vDarkB',x+q*S*.22,hl*.5,ze-s*.16,.7,.7,.06,0);}}   // small openings at the back
 return{y:Y,hl};}

// ---------------------------------------------------------------- the Uros huts
// Thatch hut: mat walls with bundle corner posts and rails, a steep totora gable, a ridge bundle, a fringe at
// the eaves, a doorway with a mat awning. Ridge along local x; door on +z. Returns the ridge height.
function hnRLHut(x,z,W,D,H,ry,o){o=o||{};const c=o.c||hC(vPick(RPAL.straw)),th=o.th||hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld));
 vB('hRLMatB',x,0,z,W,H,D,ry,c);
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(W/2+.02),sz*(D/2+.02),ry);vPst('hRLBundle',p[0],0,p[1],.09,H+.15,old);}
 for(const yy of[.1,H-.1])for(const s of[-1,1]){const a=loc(x,z,-W/2-.1,s*(D/2+.1),ry),b=loc(x,z,W/2+.1,s*(D/2+.1),ry);beam('hRLBundleC',[a[0],yy,a[1]],[b[0],yy,b[1]],.12,.12,old);
  const e=loc(x,z,s*(W/2+.1),-D/2-.1,ry),f=loc(x,z,s*(W/2+.1),D/2+.1,ry);beam('hRLBundleC',[e[0],yy,e[1]],[f[0],yy,f[1]],.12,.12,old);}
 const pitch=o.pitch||1.3,rise=pitch*D/2,over=o.over||.6;
 vnGableRoof(x,H,z,W,D,rise,ry,'hRLGableT',th,over,'hRLGableM',c,.3);
 kput('hRLBundleX',[x,H+rise+.04,z],qEuler(0,ry,0),[W+2*over+.4,.14,.14],old);                                   // ridge bundle
 for(const s of[-1,1]){const a=loc(x,z,-W/2-over,s*(D/2+over),ry),b=loc(x,z,W/2+over,s*(D/2+over),ry);hnRLEaveFringe(a,b,H-over*pitch-.05,ry+(s>0?0:Math.PI),c);}
 if(o.door!==false){const d=loc(x,z,o.doorX||0,D/2+.02,ry);vnDoor(d[0],0,d[1],ry,.9,1.7,'vWood',old,c,false);
  const aw=loc(x,z,o.doorX||0,D/2+.55,ry);kput('hRLMatP',[aw[0],1.95,aw[1]],vQ(ry,-Math.PI/2+.35,0),[1.6,1.1,1],c);
  for(const q of[-1,1]){const p=loc(x,z,(o.doorX||0)+q*.7,D/2+1.05,ry);vPst('hRLBundle',p[0],0,p[1],.04,1.75,old);}}
 return H+rise;}
// Fringe of loose reed ends hanging below an eave from a to b (points at deck level y), the face's outward ry.
// atan2(dx, dz) points a unit plane's normal along a→b; the +PI/2 lays its width along it.
function hnRLEaveFringe(a,b,y,ry,c){const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const yaw=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2;const o=loc(0,0,0,.06,ry);
 kput('hRLFringe',[(a[0]+b[0])/2+o[0],y-.2,(a[1]+b[1])/2+o[1]],qEuler(0,yaw,0).multiply(qEuler(0,0,0)),[L,.45,1],c||null);}
// Cone hut: tiers of thatch stepping down to the ground with a fringe at every tier, a tied topknot of splayed
// stalks, a low doorway with a mat leaning beside it. R = footprint radius, H = height to the topknot.
function hnRLConeHut(x,z,R,H,ry,o){o=o||{};const th=o.th||hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld));const tiers=o.tiers||3;
 for(let k=tiers-1;k>=0;k--){const y0=k*H*.26,r=R*(1-k*.24),h=H-y0;kput('hRLConeT',[x,y0-.05,z],null,[r,h,r],k?th:th.clone().multiplyScalar(.94));
  const nf=Math.max(8,Math.round(r*6));for(let i=0;i<nf;i++){const a0=i/nf*TAU,a1=(i+1)/nf*TAU,am=(a0+a1)/2,L=r*TAU/nf;
   kput('hRLFringe',[x+Math.cos(am)*(r+.05),y0+.02,z+Math.sin(am)*(r+.05)],qEuler(0,-am+Math.PI/2,0).multiply(qEuler(-.5,0,0)),[L+.06,.5,1],th);}}
 for(let k=0;k<7;k++){const a=k/7*TAU;beam('hRLBundleC',[x,H-.5,z],[x+Math.cos(a)*.42,H+.55,z+Math.sin(a)*.42],.07,.07,old);}
 vPst('hRLBundleC',x,H-.35,z,.16,.4,old);
 const d=loc(x,z,0,R*.92,ry);vB('vDarkB',d[0],0,d[1],.8,1.4,.4,ry);const m=loc(x,z,.8,R*.95,ry);kput('hRLMatP',[m[0],.75,m[1]],vQ(ry+.5,.25,0),[.9,1.5,1],th);
 return H;}

// ---------------------------------------------------------------- reed boats
// A totora boat: two bundles lashed together, the ends swept up into points; a carved and painted head on the
// bow (o.heads = 1 | 2), a mat cabin amidships (o.cabin), paddles and folk. Axis along local z, bow at +z.
// L length, W beam. Floats on the lake (deck ~ .3 above the water). Returns the deck height.
function hnRLBoat(G,x,z,ry,L,W,o){o=o||{};const c=o.c||hC(vPick(RPAL.straw)),D=W*.55,rise=o.rise||L*.16,yw=RL.WATER;
 const wf=s=>W/2*Math.sqrt(Math.max(0,1-Math.pow(Math.abs(s),3.2))),yc=s=>yw+D*.35+rise*Math.pow(Math.abs(s),3)+.12*Math.pow(Math.abs(s),8)*rise,hf=s=>D*.5*(1-.55*Math.pow(Math.abs(s),6));
 const m=hnRLMesh(G,(u,v)=>{const s=u*2-1,ph=v*TAU;const w=wf(s),h=hf(s);const lobe=1+.14*Math.abs(Math.cos(ph))*(Math.abs(Math.sin(ph))<.98?1:0);
  const lx=Math.cos(ph)*w*lobe,ly=yc(s)-Math.sin(ph)*h*(ph<Math.PI?1:.28);const p=loc(x,z,lx,s*L/2,ry);return[p[0],ly,p[1],v*2,s*L/2];},36,18,MAT.rlBundleX);
 m.material=hnRLTint(MAT.rlBundleX,c);
 const deck=yc(0)+hf(0)*.28;
 // lashings across the hull every ~0.9 m
 for(let s=-.8;s<=.8;s+=1.6/Math.max(2,Math.round(L/.9))){const w=wf(s),h=hf(s);const p=loc(x,z,0,s*L/2,ry);kput('vHoop',[p[0],yc(s)-h*.15,p[1]],qEuler(0,ry,0),[w*1.06,h*1.03,.45],hC(0x8a7250));}
 // heads
 const heads=o.heads===undefined?1:o.heads;for(let k=0;k<heads;k++){const s=k?-1:1;const tip=loc(x,z,0,s*(L/2-.12),ry);const ty=yc(.97);
  const nk=[tip[0],ty+.15,tip[1]],hd=loc(x,z,0,s*(L/2+.32),ry);beam('hRLBundleC',nk,[hd[0],ty+.55,hd[1]],.18,.18,c);
  kput('hRLHead',[hd[0],ty+.66,hd[1]],qEuler(0,ry+(s>0?0:Math.PI),0),[.15,.17,.22],null);
  for(const q of[-1,1]){const e=loc(x,z,q*.13,s*(L/2+.3),ry);kput('hRLHorn',[e[0],ty+.78,e[1]],qEuler(0,0,q*-.35),[.04,.16,.04],hC(HPAL.black));}
  const mn=loc(x,z,0,s*(L/2+.2),ry);kput('hRLFringe',[mn[0],ty+.75,mn[1]],qEuler(0,ry+Math.PI/2,0).multiply(qEuler(0,0,s*.5)),[.5,.4,1],c);}
 if(o.cabin){const cw=W*.7,cl=L*.32;vB('hRLMatB',x,deck-.05,z,cw,.12,cl,ry,c);for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*cw/2,sz*cl/2,ry);vPst('hRLBundle',p[0],deck,p[1],.05,1.5,c);}
  vB('hRLMatB',x,deck+.05,z-0,cw*.9,1.2,cl*.9,ry,c.clone().multiplyScalar(.95));vnGableRoof(x,deck+1.3,z,cl,cw,.6,ry+Math.PI/2,'hRLGableT',c,.25,'hRLGableM',c,.2);
  const d=loc(x,z,0,cl/2*.9,ry);vB('vDarkB',d[0],deck+.1,d[1],.6,1,.1,ry);}
 if(o.folk){for(let k=0;k<o.folk;k++){const p=loc(x,z,rr(-W*.15,W*.15),rr(-L*.28,L*.28),ry);kput('figB',[p[0],deck-.15,p[1]],qEuler(0,ry+rr(-.6,.6),0),.9,hC(vPick([0xe8d9b8,0xc9442a,0x2f8f8a,0xe0a030,0x8a6a3a])));kput('figH',[p[0],deck-.15,p[1]],null,.9,hC(0xc9a17e));}}
 if(o.paddle!==false){const p=loc(x,z,W*.42,L*.1,ry);kput('vWood',[p[0],deck+.2,p[1]],qEuler(0,ry,0).multiply(qEuler(.5,0,.9)),[.05,2.2,.14],hC(vPick(RPAL.pole)));}
 return deck;}
// A flat reed raft: bundles side by side under a mat deck, cross-bundles lashed over, on the water at (x,z).
function hnRLRaft(x,z,ry,L,W,c){c=c||hC(vPick(RPAL.straw));const n=Math.max(3,Math.round(W/.5));const r=.24;
 for(let i=0;i<n;i++){const u=-W/2+r+(W-2*r)*i/(n-1);const p=loc(x,z,u,0,ry);kput('hRLBundleX',[p[0],RL.WATER+r*.55,p[1]],qEuler(0,ry+Math.PI/2,0),[L,r,r],c);}
 for(const s of[-.38,.38]){const p=loc(x,z,0,s*L,ry);kput('hRLBundleX',[p[0],RL.WATER+r*1.55+.04,p[1]],qEuler(0,ry,0),[W+.2,r*.5,r*.5],c.clone().multiplyScalar(.9));}
 return RL.WATER+r*1.55;}
// A pontoon walkway from a to b (world-local [x,z] pairs): bundles lengthwise floating on the water, a mat deck
// at island level, cross-lashings, a post at each end. w = deck width.
function hnRLPontoon(a,b,w,c){c=c||hC(vPick(RPAL.straw));const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
 const r=.23;const n=Math.max(2,Math.round(w/.42));for(let i=0;i<n;i++){const u=-w/2+r+(w-2*r)*i/(n-1);const p=loc(mx,mz,u,0,yaw);kput('hRLBundleX',[p[0],RL.WATER+r*.9,p[1]],qEuler(0,yaw+Math.PI/2,0),[L,r,r],c);}
 vB('hRLMatB',mx,RL.WATER+r*1.8,mz,w,.06,L,yaw,c.clone().multiplyScalar(.95));
 const nl=Math.max(1,Math.round(L/1.6));for(let i=0;i<=nl;i++){const p=loc(mx,mz,0,-L/2+L*i/nl,yaw);kput('hRLBundleX',[p[0],RL.WATER+r*1.8+.1,p[1]],qEuler(0,yaw,0),[w+.1,.07,.07],c.clone().multiplyScalar(.85));}
 for(const s of[-1,1]){const p=loc(mx,mz,w/2+.15,s*(L/2-.3),yaw);vPst('vPost',p[0],RL.WATER-.5,p[1],.07,1.5,hC(vPick(RPAL.pole)));}}
// A mooring post at the island's edge with a canoe alongside (o.boat = false for the post alone)
function hnRLMoor(G,x,z,ry,o){o=o||{};vPst('vPost',x,RL.WATER-.5,z,.08,1.6,hC(vPick(RPAL.pole)));
 if(o.boat!==false){const p=loc(x,z,o.off===undefined?1.1:o.off,0,ry);hnRLBoat(G,p[0],p[1],ry,o.L||4.2,o.W||1.1,{heads:1,folk:o.folk||0});
  beam('vRope',[x,RL.WATER+.8,z],[p[0],RL.WATER+.5,p[1]],.02,.02,hC(vPick(RPAL.rope)));}}

// ---------------------------------------------------------------- yard furniture of the lake
// A clay hearth: fire needs a floor that will not burn — a slab of lake mud, then stones and the fire.
function hnRLHearth(x,z,r){vB('hRLMud',x,-.02,z,r*3.2,.2,r*3.2,rr(0,.5),hC(vPick(RPAL.mud)));hnFirepit(x,.18,z,r);}
// A clay brazier on a mud pad (the halls' braziers), s ~ 1 = a 1 m bowl rim
function hnRLBrazier(x,z,s){s=s||1;vB('hRLMud',x,-.02,z,1.1*s,.16,1.1*s,0,hC(vPick(RPAL.mud)));vPst('vClayPot',x,.14,z,.34*s,.7*s,hC(0x9a5a38));
 vBall('vEmber',x,.8*s,z,.26*s,null,.08*s);for(let k=0;k<3;k++)kput('hRLFlame',[x+rr(-.1,.1)*s,.8*s,z+rr(-.1,.1)*s],null,[.11*s,rr(.35,.6)*s,.11*s],null);}
// A woven finial on a point (the front apex of a hall, a granary peak): a tied topknot of stalks and a chakana disc
function hnRLFinial(x,y,z,ry,s){s=s||1;const old=hC(vPick(RPAL.strawOld));for(let k=0;k<5;k++){const a=k/5*TAU;beam('hRLBundleC',[x,y-.1*s,z],[x+Math.cos(a)*.22*s,y+.45*s,z+Math.sin(a)*.22*s],.05*s,.05*s,old);}
 vPst('hRLBundleC',x,y-.05*s,z,.1*s,.16*s,old);kput('hRLChakana',[x,y+.85*s,z],qEuler(0,ry,0),[.7*s,.7*s,1],null);}
// A standing post of the lake: a thick reed bundle with woven bands round it, a tassel of dyed wool, and — for
// the posts at a door or a gate — a chakana disc on top and a pennant (o.disc, o.pennant). The lake's answer to
// the highland totem: nothing carved.
function hnRLPost(x,y,z,r,h,ry,o){o=o||{};const c=hC(vPick(RPAL.straw));vPst('hRLBundle',x,y,z,r,h,c);
 for(const f of[.3,.62,.86])kput('hRLBandCyl',[x,y+h*f-r*.9,z],qEuler(0,ry,0),[r*1.06,r*1.8,r*1.06],null);
 for(let k=0;k<3;k++)vPst('hRLBundleC',x,y+h+.06+k*.02,z,r*.3,.2,c.clone().multiplyScalar(1.05));
 const t=loc(x,z,r*.9,r*.5,ry);kput('vCloth',[t[0],y+h*.62-.5,t[1]],qEuler(0,ry,0),[.14,.6,1],hC(vPick([0xa8352a,0xd19a3a,0x2f4a7a,0x3f7a5a])));
 if(o.disc)kput('hRLChakana',[x,y+h+.45+r,z],qEuler(0,ry,0),[r*3.2,r*3.2,1],null);
 if(o.pennant){const p=loc(x,z,r+.5,0,ry);beam('hRLBundleC',[x,y+h-.1,z],[p[0],y+h+.15,p[1]],.05,.05,c);kput('hRLBandP',[p[0]+.0,y+h-.55,p[1]],qEuler(0,ry,0),[.9,.5,1],null);}}
// A woven cloth hung on a wall face (the awayo): w x h, its top at y + h
function hnRLCloth(x,y,z,ry,w,h){const p=loc(x,z,0,.08,ry);kput('hRLCloth',[p[0],y+h/2,p[1]],qEuler(0,ry,0),[w,h,1],null);const q=loc(x,z,0,.11,ry);vB('hRLBundle',q[0],y+h-.03,q[1],w+.2,.07,.07,ry,hC(vPick(RPAL.strawOld)));}
// A woven band across a wall face (lintels, the belt of a hall)
function hnRLBandOn(x,y,z,ry,w,h){const p=loc(x,z,0,.06,ry);kput('hRLBandP',[p[0],y+h/2,p[1]],qEuler(0,ry,0),[w,h,1],null);}
// Sheaves of cut reed: n standing in a row along ry (tied, splayed tops), some leaning together in a stook
function hnRLSheaves(x,z,ry,n,o){o=o||{};const c=hC(vPick(RPAL.straw));for(let i=0;i<n;i++){const p=loc(x,z,(i-(n-1)/2)*.75,0,ry);kput('hRLSheaf',[p[0],0,p[1]],qEuler(0,rng()*TAU,0),[.3,rr(1.7,2.3),.3],c.clone().multiplyScalar(rr(.9,1.05)));}
 if(o.stook){const p=loc(x,z,0,1.4,ry);for(let k=0;k<5;k++){const a=k/5*TAU;beam('hRLBundleC',[p[0]+Math.cos(a)*.7,0,p[1]+Math.sin(a)*.7],[p[0],2.4,p[1]],.22,.22,c);}}}
// Reed laid out to dry: flat bundles in rows on the island top, w across (along ry), d deep
function hnRLReedLay(x,z,ry,w,d){const c=hC(vPick(RPAL.straw));const n=Math.round(d/.45);for(let i=0;i<n;i++){const p=loc(x,z,0,-d/2+.2+i*.45,ry);kput('hRLBundleX',[p[0],.1,p[1]],qEuler(0,ry+rr(-.06,.06),0),[w*rr(.85,1),.1,.1],c.clone().multiplyScalar(rr(.9,1.1)));}}
// Rolled mats (finished work) lying on the ground / stacked
function hnRLRolls(x,z,ry,n){for(let i=0;i<n;i++){const lvl=Math.floor(i/3),p=loc(x,z,(i%3-1)*.42,lvl*.05,ry);kput('hRLRoll',[p[0],.2+lvl*.36,p[1]],qEuler(0,ry,0),[rr(1.6,2.2),.2,.2],hC(vPick(RPAL.straw)));}}
// A hanging net between two posts (a,b at deck level), h deep, with floats along the top line
function hnRLNet(a,b,h,c){const L=Math.hypot(b[0]-a[0],b[2]-a[2]),yaw=Math.atan2(b[0]-a[0],b[2]-a[2]);const m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
 for(const p of[a,b])vPst('vPost',p[0],p[1],p[2],.06,h+.3,c||hC(vPick(RPAL.pole)));beam('vRope',[a[0],a[1]+h+.2,a[2]],[b[0],b[1]+h+.2,b[2]],.02,.02,hC(vPick(RPAL.rope)));
 kput('hRLNet',[m[0],m[1]+h/2+.1,m[2]],qEuler(0,yaw+Math.PI/2,0).multiply(qEuler(0,0,rr(-.06,.06))),[L-.2,h*.9,1],null);
 for(let k=1;k<Math.round(L/.7);k++){const t=k/Math.round(L/.7);vBall('vGourd',lerp(a[0],b[0],t),m[1]+h+.2,lerp(a[2],b[2],t),.06,hC(0xd8c27e));}}
// Fish hung to dry on a rail from a to b
function hnRLFishRail(a,b,y,n){const c=hC(vPick(RPAL.pole));for(const p of[a,b])vPst('vPost',p[0],0,p[1],.05,y+.1,c);beam('hRLBundleC',[a[0],y,a[1]],[b[0],y,b[1]],.06,.06,hC(vPick(RPAL.straw)));
 for(let k=0;k<n;k++){const t=(k+.5)/n;kput('hPaintBall',[lerp(a[0],b[0],t),y-.22,lerp(a[1],b[1],t)],qEuler(0,rng()*.5,0),[.05,.2,.11],hC(vPick([0xb8bcb0,0xa0a898,0xc8c8b8])));}}
// A conical basket fish-trap (lying or standing)
function hnRLTrap(x,y,z,ry,L){kput('hRLLattice',[x,y+.25,z],qEuler(0,ry,0).multiply(qEuler(0,0,Math.PI/2)),[L,.5,1],null);kput('hRLMatCyl',[x,y,z],qEuler(0,ry,0).multiply(qEuler(0,0,Math.PI/2)),[.24,L,.24],hC(vPick(RPAL.strawOld)));}
// Beasts of the lake: 'buffalo' (water buffalo — big, dark, sweeping horns), 'duck', 'goat'
function hnRLBeast(x,y,z,ry,kind){const K={buffalo:[2.3,1.1,.9,.72],goat:[.9,.42,.32,.5],duck:[.4,.22,.22,.14]}[kind]||[1,.5,.4,.5];const [L,Hb,Wb,Lg]=K;
 const c=kind==='buffalo'?hC(vPick([0x4a4038,0x3e3630,0x56483e])):kind==='goat'?hC(vPick([0xd8d0c0,0x6a5a4a])):hC(vPick([0xe8e0d0,0x6a5a44,0x9a8a70,0xf0ece0]));
 const item=kind==='buffalo'?'hRLHide':'vWood';const P=(u,yy,v)=>{const p=loc(x,z,v,u,ry);return[p[0],y+yy,p[1]];};const q=qEuler(0,ry,0);
 if(kind==='duck'){kput('hRLHideBall',P(0,Lg+Hb/2,0),q,[Wb*.5,Hb*.5,L*.5],c);kput('hRLHideBall',P(L*.4,Lg+Hb*1.1,0),q,[.08,.08,.08],c);kput('vConeI',P(L*.55,Lg+Hb*1.1,0),q.clone().multiply(qEuler(Math.PI/2,0,0)),[.03,.1,.03],hC(0xd88a2a));return;}
 kput(item,P(0,Lg+Hb/2,0),q,[Wb,Hb,L],c);
 for(const a of[-1,1])for(const b of[-1,1])kput(item,P(a*L*.36,Lg/2,b*Wb*.32),q,[.12,Lg,.12],c.clone().multiplyScalar(.85));
 const hy=Lg+Hb*(kind==='buffalo'?.55:.9),hz=L/2+.15;kput(item,P(hz,hy,0),q.clone().multiply(qEuler(kind==='buffalo'?.25:.5,0,0)),[Wb*.7,Hb*.55,Hb*.9],c);
 if(kind==='buffalo')for(const s of[-1,1]){let p=P(hz-.05,hy+Hb*.32,s*Wb*.3);let d=[s*1,.3,-.2];for(let k=0;k<4;k++){d=[d[0]*.75,d[1]+.35,d[2]+.25];const r=hRot(ry,hNorm(d));const qn=[p[0]+r[0]*.28,p[1]+r[1]*.28,p[2]+r[2]*.28];beam('hPaint',p,qn,.09-k*.015,.09-k*.015,hC(0x3a3230));p=qn;}}
 else for(const s of[-1,1]){const h=P(hz-.05,hy+Hb*.3,s*Wb*.3);beam('hPaint',h,[h[0]+s*Math.cos(ry)*.2,h[1]+.16,h[2]-s*Math.sin(ry)*.2],.04,.04,hC(0xd8ccb0));}
 kput(item,P(-L/2-.05,Lg+Hb*.7,0),q.clone().multiply(qEuler(-.6,0,0)),[.06,.06,.3],c);}
// People standing at a height (a deck, a boat) — vnFolk always stands them on y = 0
function hnRLFolk(x,y,z,n,spread){for(let i=0;i<n;i++){const px=x+rr(-spread,spread),pz=z+rr(-spread,spread);kput('figB',[px,y,pz],qEuler(0,rng()*TAU,0),1,hC(vPick([0xe8d9b8,0xc9442a,0x2f8f8a,0xe0a030,0x3b4a8a,0x8a6a3a])));kput('figH',[px,y,pz],null,1,hC(0xc9a17e));}}
// A hanging fire-cage (bamboo cage with a fire pot — the tribes' night light; nothing electric on the lake)
function hnRLCage(x,y,z){vPst('vRope',x,y-.3,z,.01,.3,hC(0x9a8a6a));const bm=hC(vPick(RPAL.strawOld));vB('hPaint',x,y-.34,z,.3,.05,.3,0,hC(HPAL.black));vB('hPaint',x,y-.8,z,.3,.05,.3,0,hC(HPAL.black));
 for(const [a,b] of[[-1,-1],[1,-1],[1,1],[-1,1]])vPst('hBamboo',x+a*.13,y-.78,z+b*.13,.016,.44,bm);vBall('vEmber',x,y-.62,z,.08,null,.1);}
// A gourd hanging from an eave
function hnRLGourd(x,y,z){vPst('vRope',x,y-.35,z,.01,.35,hC(0x9a8a6a));vBall('vGourd',x,y-.5,z,.15,hC(vPick([0xb08a4a,0x9a8a3a,0xc0a060])),.2);}
// A lashed reed-bundle fence (posts of bundle, two horizontal bundles) round a rectangle, gap at the front
function hnRLFence(x,z,w,d,ry,gate,h){h=h||1.1;const c=hC(vPick(RPAL.strawOld));const segs=[[[-w/2,-d/2],[w/2,-d/2]],[[w/2,-d/2],[w/2,d/2]],[[-w/2,d/2],[-w/2,-d/2]]];
 if(gate){segs.push([[-w/2,d/2],[-gate/2,d/2]],[[gate/2,d/2],[w/2,d/2]]);}else segs.push([[w/2,d/2],[-w/2,d/2]]);
 for(const s of segs){const L=Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1]);const n=Math.max(1,Math.round(L/1.5));
  for(let i=0;i<=n;i++){const p=loc(x,z,s[0][0]+(s[1][0]-s[0][0])*i/n,s[0][1]+(s[1][1]-s[0][1])*i/n,ry);vPst('hRLBundle',p[0],0,p[1],.07,h,c);}
  const a=loc(x,z,s[0][0],s[0][1],ry),b=loc(x,z,s[1][0],s[1][1],ry);for(const yy of[h*.45,h*.92])beam('hRLBundleC',[a[0],yy,a[1]],[b[0],yy,b[1]],.1,.1,c);}}
