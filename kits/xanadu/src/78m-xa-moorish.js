// ================================================================= XANADU — the Moorish and Mughal vocabulary (Erewhon's citadel, 2026-11-09)
// The owner's brief for the citadel (settlements/xanadu/citadel/refs/citadel/STYLE.md): Moorish and Mughal, psychedelic in
// its own way, every surface patterned, the geometry carrying the ornament. This fragment is the reusable part:
//   XMOOR             [G data] the parameters (78l-xa-moorish-data.js): an arch's opening outline (pointed, horseshoe,
//                     cusped), the cells of a muqarnas hood or cornice, a star-polygon ceiling's panels and ribs, a pointed
//                     barrel's section. Godot builds the same shapes from them.
//   materials         the citadel's surfaces as MAT keys, each wired in materials.json to the set it is owed
//                     (core/materials/PROMPTS-NEEDED.md section 41) with the nearest library set until it is delivered
//                     (KNOWN_ISSUES.md): xZel zellige, xHaft haft-rangi, xGiltC the Mughal gilt ceiling, xYes yeseria,
//                     xMuqT muqarnas tile, xBandR the rainbow band, xPietra pietra dura, xSandR red sandstone, xMarW and
//                     xMarK white and black marble, xJaliC the jali card (procedural alpha until its card is delivered)
//   kit items         instanced, one per shape and material: xm* boxes; the arch heads xmHead.<kind>.<mat> (a wall panel
//                     with the opening cut) and their rings; the muqarnas cell; the star ceilings' panels; the barrel vault
//                     and its rib; the jali card
//   helpers (xm*)     xmArchHead, xmMuqHood, xmMuqCornice, xmStarCeiling, xmVault, xmJali, xmIwan, xmBasin, xmFountain,
//                     xmRill, xmColumnPair, xmBalustrade: drawn in the running builder's frame like the kit's other helpers
// No rnd() here: the citadel's builders (78n) reseed.

// ---------------------------------------------------------------- materials (wired in materials.json: the owed set, a library fallback)
MAT.xZel=xStd({roughness:.3});MAT.xHaft=xStd({roughness:.35});MAT.xGiltC=xStd({roughness:.45,metalness:.15});MAT.xYes=xStd({roughness:.9});
MAT.xMuqT=xStd({roughness:.3});MAT.xBandR=xStd({roughness:.55});MAT.xPietra=xStd({roughness:.3});MAT.xSandR=xStd({roughness:.9});
MAT.xMarW=xStd({roughness:.25});MAT.xMarK=xStd({roughness:.2});
MAT.xJaliC=xStd({map:TEX.xJali,alphaTest:.5,roughness:.6});   // the procedural jali's alpha until patterns/xanadu/jali is delivered
vWorldUV(MAT.xZel,1/1.6);vWorldUV(MAT.xHaft,1/1.2,1/.8);vWorldUV(MAT.xGiltC,1/1.2);vWorldUV(MAT.xYes,1/1.5);vWorldUV(MAT.xMuqT,1/1.2);vWorldUV(MAT.xBandR,1/1.5);
vWorldUV(MAT.xPietra,1/1.2);vWorldUV(MAT.xSandR,.5);vWorldUV(MAT.xMarW,.5);vWorldUV(MAT.xMarK,.5);vWorldUV(MAT.xJaliC,1.6,1.6);
const XM_MAT={Zel:MAT.xZel,Haft:MAT.xHaft,Gilt:MAT.xGiltC,Yes:MAT.xYes,Muq:MAT.xMuqT,Band:MAT.xBandR,Pietra:MAT.xPietra,Sand:MAT.xSandR,MarW:MAT.xMarW,MarK:MAT.xMarK,
 Wash:MAT.xWash,Gold:MAT.xGoldDS,Paint:MAT.xPaint};
for(const k in XM_MAT)kdef('xm'+k,VBOX,XM_MAT[k]);
kdef('xmJali',VPLANE,MAT.xJaliC);

// ---------------------------------------------------------------- geometry
// a closed outline [[x,y],...] -> a THREE.Shape
function xmShape(P){const s=new THREE.Shape();s.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)s.lineTo(P[i][0],P[i][1]);s.lineTo(P[0][0],P[0][1]);return s;}
// an arch head: a unit wall panel (x [-.5,.5], y [0,1] above the springing, z [-.5,.5] through the wall) with the opening cut
// through it (the arch scaled to fill the panel's width; its crown at 0.86 of the panel's height)
// (one outline round the U: the opening meets the panel's foot, so it is not a hole; under a horseshoe's springing the panel
// keeps the strip where the opening is narrower than the jambs)
function xmHeadGeo(kind){const A=XMOOR.arch(kind),c=XMOOR.crown(kind),k=.86/c,H=A.map(p=>[p[0],Math.max(0,p[1]*k)]);
 const out=[[-.5,0],[-.5,1],[.5,1],[.5,0]].concat(H.slice().reverse());
 return new THREE.ExtrudeGeometry(xmShape(out),{depth:1,bevelEnabled:false,curveSegments:1}).translate(0,0,-.5);}
// an arch's ring (the archivolt): the band between the opening and the opening grown by 10% of the span, depth 1
function xmRingGeo(kind){const A=XMOOR.arch(kind),c=XMOOR.crown(kind),k=.86/c,I=A.map(p=>[p[0],p[1]*k]),g=.1;
 const O=I.map(p=>[p[0]*(1+g*1.6),p[1]*(1+g)+g*.3]);const out=O.concat(I.slice().reverse());
 return new THREE.ExtrudeGeometry(xmShape(out),{depth:1,bevelEnabled:false,curveSegments:1}).translate(0,0,-.5);}
// a muqarnas cell: a niche's hood, a quarter sphere standing on its base (y 0..1), open toward +z, its back at z -1..0
const XM_CELL=new THREE.SphereGeometry(1,8,4,0,Math.PI,0,Math.PI/2).rotateY(Math.PI).scale(.5,1,1);
// a star ceiling's panels of one role, flat in x-z facing down (unit square)
function xmStarGeo(n,role){const S=XMOOR.star(n),geos=[];for(const p of S.panels){if(p.role!==role)continue;const g=new THREE.ShapeGeometry(xmShape(p.pts.map(q=>[q[0],q[1]])));
  g.rotateX(Math.PI/2);geos.push(g);}
 return vMergeGeosXM(geos);}
// a pointed barrel: the section XMOOR.barrel (span 1, rise 1) swept along z [-.5,.5]; the inside faces down
function xmBarrelGeo(){const P=XMOOR.barrel(12),pos=[],uv=[],idx=[];let acc=0;const len=[0];for(let i=1;i<P.length;i++){acc+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);len.push(acc);}
 for(let i=0;i<P.length;i++)for(const z of[-.5,.5]){pos.push(P[i][0],P[i][1],z);uv.push(len[i]/acc,z+.5);}
 for(let i=0;i+1<P.length;i++){const a=i*2,b=a+1,c=a+2,d=a+3;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
// a rib along the barrel's section: a flat band 1 deep (scaled to the rib's width) from the section to 8% inside it
function xmRibGeo(){const P=XMOOR.barrel(12),I=P.map(p=>[p[0]*.92,p[1]*.94]);return new THREE.ExtrudeGeometry(xmShape(P.concat(I.reverse())),{depth:1,bevelEnabled:false,curveSegments:1}).translate(0,0,-.5);}
function vMergeGeosXM(geos){geos=geos.map(g=>g.index?g.toNonIndexed():g);let n=0;for(const g of geos)n+=g.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2),idx=[];let o=0;
 for(const g0 of geos){const g=g0.index?g0.toNonIndexed():g0;const c=g.attributes.position.count;pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);
  if(g.attributes.uv)uv.set(g.attributes.uv.array,o*2);for(let i=0;i<c;i++)idx.push(o+i);o+=c;}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos.slice(0,o*3),3));G.setAttribute('normal',new THREE.BufferAttribute(nor.slice(0,o*3),3));G.setAttribute('uv',new THREE.BufferAttribute(uv.slice(0,o*2),2));G.setIndex(idx);return G;}
// the items: arch heads and rings by kind and material, the cells, the star panels, the vaults
const XM_ARCH={};
for(const k of['pointed','horseshoe','cusped']){const hg=xmHeadGeo(k),rg=xmRingGeo(k);XM_ARCH[k]={head:hg,ring:rg};
 for(const m of['Yes','Sand','MarW','MarK','Haft','Band','Wash','Zel'])kdef('xmHead.'+k+'.'+m,hg,XM_MAT[m]);
 for(const m of['Gold','Band','Sand','Zel','Haft','MarK'])kdef('xmRing.'+k+'.'+m,rg,XM_MAT[m]);}
kdef('xmCell',XM_CELL,MAT.xMuqT);kdef('xmCellG',XM_CELL,MAT.xGoldDS);kdef('xmCellY',XM_CELL,MAT.xYes);kdef('xmCellW',XM_CELL,MAT.xMarW);
for(const n of[8,12]){kdef('xmStar'+n+'.star',xmStarGeo(n,'star'),MAT.xGiltC);kdef('xmStar'+n+'.dart',xmStarGeo(n,'dart'),MAT.xPietra);kdef('xmStar'+n+'.kite',xmStarGeo(n,'kite'),MAT.xGiltC);}
{const bg=xmBarrelGeo(),rb=xmRibGeo();kdef('xmVault.Band',bg,MAT.xBandR);kdef('xmVault.Haft',bg,MAT.xHaft);kdef('xmVault.Gilt',bg,MAT.xGiltC);
 kdef('xmRib.Gold',rb,MAT.xGoldDS);kdef('xmRib.Sand',rb,MAT.xSandR);kdef('xmRib.Zel',rb,MAT.xZel);}
for(const k in MAT)if(/^x(Zel|Haft|GiltC|Yes|MuqT|BandR|Pietra|SandR|MarW|MarK|JaliC)$/.test(k))MAT[k].side=THREE.DoubleSide;

// ---------------------------------------------------------------- helpers (the running builder's frame)
// the colours a pattern keeps (its own) and the tints the grey sets take
const XM_C={white:null,ochre:xC(0xd8a060),sand:xC(0xe8c890),cobalt:xC(0x1c2fb8),gold:xC(0xe8bc48),red:xC(0x9a3a2a),black:xC(0x1a1614)};
// an arch head in a wall: (x,z) the opening's middle on the wall line, ry the wall's facing, w the span, y the springing, hh the
// head's height, t the wall's thickness; mat the panel's material key (XM_MAT), ring a ring material or null
function xmArchHead(kind,x,y,z,ry,w,hh,t,mat,ring,c){kput('xmHead.'+kind+'.'+mat,[x,y,z],qEuler(0,ry,0),[w,hh,t],c===undefined?null:c);
 if(ring)kput('xmRing.'+kind+'.'+ring,[x,y,z],qEuler(0,ry,0),[w,hh,t+.08],ring==='Gold'?XM_C.gold:null);}
// a muqarnas hood in a recess: (x,y,z) the middle of the back wall at the springing, ry facing out of the recess
function xmMuqHood(x,y,z,ry,w,d,h,o){o=o||{};const cells=XMOOR.muqHood(w,d,h,(o.tiers==null?5:o.tiers),(o.cell==null?1.1:o.cell)),item=o.item||'xmCell';
 for(const C of cells){const p=loc(x,z,C.x,C.z,ry),it2=C.tier%2&&o.alt?o.alt:item;kput(it2,[p[0],y+C.y,p[1]],qEuler(0,ry+C.a,0),[C.w,C.h,C.d],it2==='xmCellG'?XM_C.gold:null);}
 // the backing: a half dome over the whole recess, so no sky shows between the tiers; the crown's boss
 const R0=Math.min(d,w/2),b=loc(x,z,0,R0,ry);kput(o.back||'xmCell',[b[0],y,b[1]],qEuler(0,ry,0),[w,h*1.02,R0],null);
 const q=loc(x,z,0,d*.55,ry);vBall('xGold',q[0],y+h*.97,q[1],Math.min(.35,w*.05),XM_C.gold);
 return cells.length;}
// a muqarnas cornice along a wall: (x,z) its middle on the wall's inner face, ry facing into the room, L long, top y
function xmMuqCornice(x,top,z,ry,L,o){o=o||{};const cells=XMOOR.muqCornice(L,(o.tiers==null?2:o.tiers),(o.cell==null?.9:o.cell),(o.th==null?.45:o.th),(o.dz==null?.32:o.dz));
 for(const C of cells){const p=loc(x,z,C.u,C.o,ry),it2=C.tier%2?(o.alt||'xmCellG'):(o.item||'xmCell');kput(it2,[p[0],top+C.y,p[1]],qEuler(0,ry,0),[C.w,C.h,C.d],it2==='xmCellG'?XM_C.gold:null);}
 const b=loc(x,z,0,.04,ry);vB(o.band||'xmGilt',b[0],top-((o.tiers==null?2:o.tiers))*((o.th==null?.45:o.th))-.12,b[1],L,.14,.1,ry);return cells.length;}
// a star-polygon ceiling under a ceiling at y: the room (x0..x1, z0..z1) tiled with square stars of n points along its long
// side, the field in gilt, the ribs in red sandstone (or o.rib)
function xmStarCeiling(x0,x1,z0,z1,y,o){o=o||{};const W=x1-x0,D=z1-z0,S=Math.min(W,D),along=W>=D,N=Math.max(1,Math.round((along?W:D)/S)),n=o.n||(S>14?12:8);
 vB(o.field||'xmGilt',(x0+x1)/2,y-.06,(z0+z1)/2,W,.06,D,0,null);
 const st=XMOOR.star(n);let k=0;
 for(let i=0;i<N;i++){const L=(along?W:D)/N,cx=along?x0+L*(i+.5):(x0+x1)/2,cz=along?(z0+z1)/2:z0+L*(i+.5),s=Math.min(L,S)*.96;
  for(const r of['kite','dart','star']){const dr={star:.24,dart:.16,kite:.08}[r]*s/8;kput('xmStar'+n+'.'+r,[cx,y-.07-dr,cz],null,[s,1,s],null);}
  for(const R of st.ribs){const a=[cx+R[0][0]*s,cz+R[0][1]*s],b=[cx+R[1][0]*s,cz+R[1][1]*s],L2=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L2<.05)continue;
   vB(o.rib||'xmSand',(a[0]+b[0])/2,y-.07-.24*s/8-.06,(a[1]+b[1])/2,L2,.1+.24*s/8,.12,Math.atan2(-(b[1]-a[1]),b[0]-a[0]),o.ribC||XM_C.red);k++;}
  vBall('xGold',cx,y-.07-.3*s/8,cz,Math.min(.35,s*.016),XM_C.gold);}
 return k;}
// a pointed barrel vault over a room, along its long side, springing at ys up to the crown at yc; ribs every ~2.6 m.
// mat 'Band' (the painted private halls), 'Haft' (the tiled arcades), 'Gilt'; rib 'Gold' | 'Sand' | 'Zel'
function xmVault(x0,x1,z0,z1,ys,yc,mat,rib){const W=x1-x0,D=z1-z0,along=W>=D,span=along?D:W,len=along?W:D,cx=(x0+x1)/2,cz=(z0+z1)/2,ry=along?Math.PI/2:0;
 kput('xmVault.'+mat,[cx,ys,cz],qEuler(0,ry,0),[span,yc-ys,len],null);
 const n=Math.max(1,Math.round(len/2.6));for(let i=0;i<=n;i++){const u=-len/2+len*i/n,p=along?[cx+u,cz]:[cx,cz+u];kput('xmRib.'+(rib||'Gold'),[p[0],ys-.01,p[1]],qEuler(0,ry,0),[span,(yc-ys)*1.0,.22],(rib||'Gold')==='Gold'?XM_C.gold:null);}
 // the spandrels above the springing on the two long walls are the walls' own skins; a gilt cornice at the springing
 for(const s of[-1,1]){const p=along?[cx,cz+s*(span/2-.05)]:[cx+s*(span/2-.05),cz];vB('xmGold',p[0],ys-.12,p[1],along?len:.14,.12,along?.14:len,0,XM_C.gold);}
 return n+1;}
// a jali screen in an opening: (x,z) the middle of the wall line, ry its facing, w x h from y; the card on both faces, a glass pane behind
function xmJali(x,y,z,ry,w,h,o){o=o||{};kput('xmJali',[x,y+h/2,z],qEuler(0,ry,0),[w,h,1],o.c||null);const b=loc(x,z,0,-.01,ry);kput('xmJali',[b[0],y+h/2,b[1]],qEuler(0,ry+Math.PI,0),[w,h,1],o.c||null);
 if(o.glass){const g=loc(x,z,0,-.06,ry);vB('vWinClear',g[0],y,g[1],w,h,.03,ry);}}
// a balustrade of jali between posts along a rail: from a to b (local [x,z]) at floor y
function xmBalustrade(a,b,y,o){o=o||{};const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.3)return;const ry=Math.atan2(dx,dz)-Math.PI/2,m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 vB(o.rail||'xmMarW',m[0],y+.95,m[1],L,.1,.22,ry,null);vB(o.rail||'xmMarW',m[0],y,m[1],L,.12,.22,ry,null);
 const n=Math.max(1,Math.round(L/1.6));for(let i=0;i<=n;i++){const p=[a[0]+dx*i/n,a[1]+dz*i/n];vB(o.post||'xmSand',p[0],y,p[1],.2,1.1,.2,ry,null);}
 for(let i=0;i<n;i++){const p=[a[0]+dx*(i+.5)/n,a[1]+dz*(i+.5)/n];kput('xmJali',[p[0],y+.53,p[1]],qEuler(0,ry,0),[L/n-.22,.8,1],null);}}
// a pair of slender marble columns (the Moorish court's), base at y, h high, d apart along ry's x; their shared impost
function xmColumnPair(x,y,z,ry,h,o){o=o||{};const r=(o.r==null?.13:o.r),d=(o.d==null?.42:o.d);for(const s of[-1,1]){const p=loc(x,z,s*d/2,0,ry);vPst('xColS',p[0],y,p[1],r,h,XM_C.white);
  vB('xmMarW',p[0],y,p[1],r*2.6,.25,r*2.6,ry,null);vB('xmGold',p[0],y+h-.22,p[1],r*2.2,.14,r*2.2,ry,XM_C.gold);}
 vB(o.impost||'xmYes',x,y+h,z,d+r*3,.35,r*3,ry,XM_C.ochre);}
// water: an octagonal basin (r), a fountain (a basin, a stem and a bowl, the jet), a rill from a to b (w wide) lined with zellige
function xmBasin(x,y,z,r){kput('xOctS',[x,y,z],null,[r,.42,r],XM_C.white);kput('xOctT',[x,y+.42,z],null,[r*1.04,.08,r*1.04],xC(XPAL.turquoise));kput('xOctW',[x,y+.06,z],null,[r*.9,.3,r*.9],xC(XPAL.water));}
function xmFountain(x,y,z,r){xmBasin(x,y,z,r);vPst('xColS',x,y,z,.16,1.0,XM_C.white);kput('xBulbW',[x,y+1.0,z],qEuler(Math.PI,0,0),[.55,.22,.55],XM_C.white);
 kput('xDiscWater',[x,y+.96,z],null,[.48,.05,.48],xC(XPAL.water));vPst('xColS',x,y+1.0,z,.04,.35,xC(XPAL.water));vBall('xGold',x,y+1.4,z,.07,XM_C.gold);}
function xmRill(a,b,y,w){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ry=Math.atan2(dx,dz),m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 vB('xmZel',m[0],y,m[1],w+.5,.06,L,ry,null);vB('xWaterB',m[0],y+.02,m[1],w*.7,.06,L,ry,xC(XPAL.water));
 for(const s of[-1,1]){const p=loc(m[0],m[1],s*(w/2+.12),0,ry);vB('xmMarW',p[0],y,p[1],.24,.12,L,ry,null);}}
// an iwan: a pishtaq (the tall frame) on the front face at (x,z), ry facing out, its opening w wide, the crown at y+h, the recess
// d deep behind it (the back wall at the frame's line - d), a muqarnas hood from the springing, tile frame bands; o: {fw (the
// frame's width), fh (its height above y), t (its thickness), mat ('Haft'), band ('Band'), back (true: draw the back wall with
// its door left to the caller), star (a jali star window over the door)}
function xmIwan(x,y,z,ry,w,h,d,o){o=o||{};const fw=o.fw||w+4,fh=o.fh||h+2.2,t=(o.t==null?1:o.t),mat=o.mat||'Haft',P=(u,v)=>loc(x,z,u,v,ry),hh=Math.min(w*1.05,h*.55),s=h-hh*.86;
 // the frame: two piers, the band over the crown, the head with the opening, the borders
 for(const sg of[-1,1]){const p=P(sg*(w/2+(fw-w)/4),-t/2);vB('xm'+mat,p[0],y,p[1],(fw-w)/2,fh,t,ry,null);
  const b=P(sg*(fw/2-.18),.02);vB('xmBand',b[0],y,b[1],.36,fh,t+.06,ry,null);const c=P(sg*(w/2+.12),.02);vB('xmZel',c[0],y,c[1],.24,s,t+.08,ry,null);}
 {const p=P(0,-t/2);vB('xm'+mat,p[0],y+h,p[1],w,fh-h,t,ry,null);const b=P(0,.02);vB('xmBand',b[0],y+fh-.36,b[1],fw,.36,t+.06,ry,null);vB('xmGold',b[0],y+fh,b[1],fw+.2,.18,t+.2,ry,XM_C.gold);}
 {const p=P(0,-t/2);xmArchHead('pointed',p[0],y+s,p[1],ry,w,hh,t,mat,'Gold');}
 // the recess: side walls and soffit, the hood
 for(const sg of[-1,1]){const p=P(sg*(w/2+.2),-t-d/2);vB('xm'+mat,p[0],y,p[1],.4,s,d,ry,null);const q=P(sg*(w/2-.05),-t-d/2);vB('xmSand',q[0],y,q[1],.12,1.2,d,ry,null);}
 const n=xmMuqHood(P(0,-t-d)[0],y+s,P(0,-t-d)[1],ry,w,d+t*.5,hh*.86,{tiers:(o.tiers==null?5:o.tiers),cell:(o.cell==null?1.0:o.cell),alt:'xmCellG',back:'xmCell'});
 if(o.back!==false){const p=P(0,-t-d-.3);vB('xm'+mat,p[0],y,p[1],w+.8,s,.6,ry,null);}
 if(o.star){const p=P(0,-t-d+.02);kput('xmJali',[p[0],y+s-o.star*.6-.4,p[1]],qEuler(0,ry,0),[o.star,o.star,1],null);}
 return{s,hh,n};}
