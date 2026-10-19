// ================================================================= 69q. PYLON: building blocks (prefix pyn; local frame, y = base)
// On top of the Vernacular's vn* helpers (69c). Every helper takes the face's outward yaw ry like vnWin and vnDoor: (x, z)
// is a point ON the face, +z of the face is outward. The profile helpers (tombstone, stadium, pointed hexagon, nested
// rims, portholes, hex lattice) come with the neo-Ancient tier (PLAN.md P1); these are the folk tier's.

// a cornice band round a block: a slab proud of the wall on every side (the folk houses' thick orange bands)
function pynBand(x,y,z,w,d,h,proud,ry,c){vB('vPlaster',x,y,z,w+2*proud,h,d+2*proud,ry,c);}
// a nested-rectangle panel on a face: n frames of thin bars, each inset by step, standing proud of the face
function pynPanel(x,y,z,ry,w,h,c,n,step){n=n==null?1:n;step=step==null?.12:step;const t=.07;
 for(let k=0;k<n;k++){const ww=w-2*k*step,hh=h-2*k*step;if(ww<.2||hh<.2)break;const yb=y+k*step,dz=.04+.02*k;
  const f=loc(x,z,0,dz,ry);vB('vPlaster',f[0],yb,f[1],ww,t,.06,ry,c);vB('vPlaster',f[0],yb+hh-t,f[1],ww,t,.06,ry,c);
  for(const s of[-1,1]){const g=loc(x,z,s*(ww/2-t/2),dz,ry);vB('vPlaster',g[0],yb,g[1],t,hh,.06,ry,c);}}}
// a lozenge inset: a square turned 45 degrees on the face, centred at height yc
function pynDiamond(x,yc,z,ry,s,c){const f=loc(x,z,0,.05,ry);vBq('vPlaster',f[0],yc,f[1],s,s,.07,vQ(ry,0,Math.PI/4),c);}
// a disc inset (a short drum laid flat on the face), centred at height yc
function pynDisc(x,yc,z,ry,r,c){const f=loc(x,z,0,.03,ry);kput('vPost',[f[0],yc,f[1]],vQ(ry,Math.PI/2,0),[r,.08,r],c||null);}
// a pier banded with horizontal stripes: n slats proud of a white pier, the folk houses' corner flourish
function pynStripes(x,y,z,ry,w,h,n,c){const f=loc(x,z,0,.05,ry);for(let k=0;k<n;k++){const yy=y+(k+.5)*h/n-.09;vB('vPlaster',f[0],yy,f[1],w,.18,.1,ry,c);}}
// a corner parapet pier: a block rising above the roof with a cap that oversails it, a panel and a disc on its face
function pynPier(x,y,z,ry,w,d,h,white,orange){vB('vPlaster',x,y,z,w,h,d,ry,white);vB('vPlaster',x,y+h,z,w+.3,.22,d+.3,ry,orange);vB('vPlaster',x,y+h+.22,z,w+.1,.14,d+.1,ry,white);
 const f=loc(x,z,0,d/2,ry);pynPanel(f[0],y+.25,f[1],ry,w*.5,h-.6,orange,1);}
// a scalloped parapet: a low wall in n segments whose tops dip toward the middle, capped in orange (the curved balcony front)
function pynScallop(x,y,z,ry,w,h,dip,n,white,orange){n=n||7;for(let k=0;k<n;k++){const u=(k+.5)/n-.5,hh=h-dip*Math.cos(u*Math.PI);const p=loc(x,z,u*w,0,ry);
 vB('vPlaster',p[0],y,p[1],w/n+.01,hh,.22,ry,white);vB('vPlaster',p[0],y+hh,p[1],w/n+.02,.1,.3,ry,orange);}}
// a striped column: a round shaft in bands of white and orange on a square base, a square cap
function pynColumn(x,y,z,h,r,white,orange,bands){bands=bands||4;vB('vPlaster',x,y,z,r*2.4,.3,r*2.4,0,white);const hb=(h-.6)/bands;
 for(let k=0;k<bands;k++)vPst('vPostS',x,y+.3+k*hb,z,r,hb,k%2?white:orange);vB('vPlaster',x,y+h-.3,z,r*2.4,.3,r*2.4,0,orange);}

// ---------------------------------------------------------------- the neo-Ancient profiles (PLAN.md section 2)
// Three outlines carry the style: the TOMBSTONE (a rectangle under a semicircle), the STADIUM (a rounded rectangle with
// round ends) and the POINTED HEXAGON (a rectangle under a gable point, or pointed at both ends). Each is a slab on a
// face: (x, z) on the face, ry its outward yaw, y the bottom of the outline, w x h the outline, `out` how far its
// front stands proud of the face, d its depth (it runs back from its front by d). `kind` picks the material:
// P render, C concrete, G dark glass, D a dark opening, R rust, L lit glass (rich, civic, the Ancients' amber). A round end is a disc 2 cm thinner than the slab, so
// where the two overlap the slab's face wins cleanly and no faces share a plane.
const PY_KIND={P:['vPlaster','pyDisc','vGablePl'],C:['pyConc','pyDiscC','pyGableC'],G:['vWinGlass','pyDiscG','pyGableG'],D:['vDarkB','pyDiscD','pyGableD'],R:['vRustB','pyDiscR','vGableP'],L:['vWinLit','pyDiscL','pyGableL']};
function pynSlab(item,x,yc,z,ry,w,h,out,d,c){const f=loc(x,z,0,out-d/2,ry);vBq(item,f[0],yc,f[1],w,h,d,vQ(ry,0,0),c);}
function pynEnd(item,x,yc,z,ry,r,out,d,c){const f=loc(x,z,0,out-d/2,ry);kput(item,[f[0],yc,f[1]],vQ(ry,0,0),[r,r,Math.max(.02,d-.02)],c||null);}
function pynTomb(x,y,z,ry,w,h,out,d,kind,c){const K=PY_KIND[kind||'P'],r=w/2,hb=Math.max(.05,h-r);
 pynSlab(K[0],x,y+hb/2,z,ry,w,hb,out,d,c);pynEnd(K[1],x,y+hb,z,ry,r,out,d,c);}
function pynStadium(x,y,z,ry,w,h,out,d,kind,c){const K=PY_KIND[kind||'P'],r=Math.min(w,h)/2;
 if(h>=w){const hb=h-w;if(hb>.02)pynSlab(K[0],x,y+r+hb/2,z,ry,w,hb,out,d,c);pynEnd(K[1],x,y+r,z,ry,r,out,d,c);pynEnd(K[1],x,y+h-r,z,ry,r,out,d,c);}
 else{const wb=w-h;pynSlab(K[0],x,y+r,z,ry,wb,h,out,d,c);for(const s of[-1,1]){const p=loc(x,z,s*wb/2,0,ry);pynEnd(K[1],p[0],y+r,p[1],ry,r,out,d,c);}}}
// rise: the point's height; both: pointed at the foot too (the elongated hexagon)
function pynPointed(x,y,z,ry,w,h,out,d,kind,c,rise,both){const K=PY_KIND[kind||'P'];rise=rise==null?w*.45:rise;const y0=both?y+rise:y,hb=Math.max(.05,h-rise*(both?2:1));
 pynSlab(K[0],x,y0+hb/2,z,ry,w,hb,out,d,c);const f=loc(x,z,0,out-d/2,ry);
 kput(K[2],[f[0],y0+hb,f[1]],vQ(ry+Math.PI/2,0,0),[d-.02,rise,w],c||null);
 if(both)kput(K[2],[f[0],y0,f[1]],vQ(ry+Math.PI/2,0,0).multiply(qEuler(0,0,Math.PI)),[d-.02,rise,w],c||null);}
const PY_SHAPE={tomb:pynTomb,stadium:pynStadium,point:pynPointed,hex:(x,y,z,ry,w,h,out,d,k,c)=>pynPointed(x,y,z,ry,w,h,out,d,k,c,w*.42,true)};
// a framed opening: n rims round a fill, each rim `rim` wide, the outermost nearest the wall and each inner one standing
// further out, so the frame steps toward the viewer (the nested portals); the fill stands proudest
// o = {rim: .16, n: 1, c: rim colour (or cs: colours, outermost first, repeating), fill: 'G', fc: fill colour,
//      out: .06 (the step per rim), d: .12}
function pynFrame(shape,x,y,z,ry,w,h,o){o=o||{};const F=PY_SHAPE[shape],n=o.n==null?1:o.n,rim=o.rim==null?.16:o.rim,st=o.out==null?.06:o.out,d=o.d==null?.12:o.d;
 for(let k=0;k<n;k++){const g=rim*(n-k);F(x,y-g,z,ry,w+2*g,h+2*g,st*(k+1),d+st*k,o.kind||'P',o.cs?o.cs[k%o.cs.length]:o.c);}
 F(x,y,z,ry,w,h,st*(n+.4),d,o.fill||'G',o.fc||null);}
// a porthole: a bezel ring of radius r (its tube 12% of r), a fill disc, and a grille of `bars` radial bars (0: none)
function pynPorthole(x,yc,z,ry,r,ringC,fill,bars,barC){const f=loc(x,z,0,.06,ry);kput('pyRing',[f[0],yc,f[1]],vQ(ry,0,0),[r,r,r*.9],ringC||null);
 pynEnd(PY_KIND[fill||'G'][1],x,yc,z,ry,r*.94,.05,.06,null);
 if(bars==='hex'){if(PYL_MATLIB.pyGrille){const g=loc(x,z,0,.1,ry);kput('pyGrilleD',[g[0],yc,g[1]],vQ(ry,0,0),[r*.94,r*.94,1],null);return;}bars=6;}
 for(let k=0;k<(bars||0);k++){const a=k*Math.PI/bars,g=loc(x,z,0,.09,ry);vBq('vIron',g[0],yc,g[1],r*1.86,.05,.04,vQ(ry,0,a),barC||null);}}
// a cluster of portholes on a face rectangle (cx at the middle, y0..y0+h, width w): graded, big low and small high,
// placed by rejection so none overlap; n tries for `count` holes. Uses the builder's own rng stream.
function pynPortCluster(x,y0,z,ry,w,h,count,rMax,ringC,fill,grille){const P=[];for(let t=0;t<count*30&&P.length<count;t++){const v=rng();const r=rMax*(1-.65*v)*(.8+.2*rng());
 const u=rr(-w/2+r,w/2-r),yy=y0+r+v*(h-2*r);if(P.some(q=>Math.hypot(q[0]-u,q[1]-yy)<q[2]+r+.15))continue;P.push([u,yy,r]);}
 for(const q of P){const p=loc(x,z,q[0],0,ry);pynPorthole(p[0],q[1],p[1],ry,q[2],ringC,fill,grille?'hex':q[2]>.7?6:0);}return P.length;}
// a flat hex-grille panel on a face (the library's card, a .8 m tile), w x h, its foot at y; nothing without the library
function pynGrille(x,y,z,ry,w,h){if(!PYL_MATLIB.pyGrille)return;const g=loc(x,z,0,.08,ry);kput('pyGrille',[g[0],y+h/2,g[1]],vQ(ry,0,0),[w,h,1],null);}
// hex paving: a slab w x d of the library's hex tile, laid flat, its top at y+.04, tinted c; it draws the five numbers vnPaving's
// one flag drew, so the builder's stream goes on as before
function pynHexPave(x,y,z,w,d,ry,c){if(!PYL_MATLIB.pyHexTile){vnPaving(x,y,z,w,d,ry,c,1);return;}for(let i=0;i<5;i++)rng();vB('pyHexTile',x,y-.04,z,w,.08,d,ry,c);}
// a cantilevered slab off a face: w along the face, reaching d out, t thick, its top at y
function pynCanopy(x,y,z,ry,w,d,t,c,item){const f=loc(x,z,0,d/2,ry);vB(item||'vPlaster',f[0],y-t,f[1],w,t,d,ry,c);}
// a barrel vault: a half-vault of span w and rise over a run of `len` along the local axis turned by ry (ry = 0: the
// vault's axis is z, its ends face +-z), its springing at y
function pynVault(x,y,z,w,len,rise,ry,item,c){kput(item||'pyHalf',[x,y,z],vQ(ry,0,0),[w/2,rise,len],c||null);}
// a hex pod: a hexagonal prism of radius r running `len` out of a face along its outward axis, its front at the face
// plus `out`, a dark (or glazed) hexagon set into its front
function pynHexPod(x,yc,z,ry,r,len,out,c,fill,item){const f=loc(x,z,0,out-len/2,ry);kput(item||'pyHex',[f[0],yc,f[1]],vQ(ry,0,0),[r,r,len],c||null);
 const g=loc(x,z,0,out+.02,ry);kput(fill==='G'?'pyHexG':'pyHexD',[g[0],yc,g[1]],vQ(ry,0,0),[r*.8,r*.8,.06],null);}
// a capsule tank standing on the ground: a cylinder of radius r and height h with a dome cap (rust unless item given)
function pynTank(x,y,z,r,h,c,cap){vPst('vTankR',x,y,z,r,h,c);kput(cap||'pyDomeR',[x,y+h,z],null,[r,r*.75,r],c||null);}
// a stepped (multifoil-stepped) arch outline over an opening w wide whose springing is at y: `steps` boxes each side
// climbing toward the middle, a band `t` thick, standing `out` proud (refs/pylon 2.jpg's orange porch arches)
function pynStepArch(x,y,z,ry,w,steps,rise,t,out,c){const st=steps||3,sw=w/(2*st+2),sh=rise/(st+1);
 const bar=(u,yy,bw,bh)=>{const p=loc(x,z,u,out,ry);vB('vPlaster',p[0],yy,p[1],bw,bh,.14,ry,c);};
 for(let k=0;k<=st;k++){const a=w/2-k*sw;
  for(const s of[-1,1]){bar(s*(a-sw/2),y+k*sh,sw+t,t);bar(s*(a-sw),y+k*sh,t,sh+t);}}
 bar(0,y+(st+1)*sh,sw*.6+t,t);}
