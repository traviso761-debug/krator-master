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
