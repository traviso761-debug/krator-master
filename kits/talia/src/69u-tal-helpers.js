// ================================================================= 69u. TALIA: building blocks (prefix tan; local frame, y = base)
// On top of the Vernacular's vn* helpers (69c). Every face helper takes the face's outward yaw ry like vnWin and vnDoor:
// (x, z) is a point ON the face, +z of the face is outward. The arch is the opening at every tier (PLAN.md section 2);
// the accent sits in the band and the reveal; every important mass ends in a drum and a dome.

// ---------------------------------------------------------------- arches
// a slab on a face: (x, z) on the face, yc the centre height, `out` how far its front stands proud, d its depth back from there
function tanSlab(item,x,yc,z,ry,w,h,out,d,c){const f=loc(x,z,0,out-d/2,ry);vBq(item,f[0],yc,f[1],w,h,d,vQ(ry,0,0),c);}
function tanDiscAt(item,x,yc,z,ry,r,out,d,c){const f=loc(x,z,0,out-d/2,ry);kput(item,[f[0],yc,f[1]],vQ(ry,0,0),[r,r,Math.max(.02,d-.02)],c||null);}
// an arc of a band on a face: centre (x, yc, z) on the face, radius K to the band's middle, bw wide, dp deep, standing
// `out` proud, from angle a0 to a1 (from +x, counterclockwise seen from outside), in n straight segments
function tanArcBand(x,yc,z,ry,K,bw,dp,out,c,a0,a1,n,item){n=n||Math.max(4,Math.round((a1-a0)*K*3));const seg=(a1-a0)/n,L=2*K*Math.sin(seg/2)+bw*.6;
 for(let k=0;k<n;k++){const a=a0+(k+.5)*seg;const p=loc(x,z,Math.cos(a)*K,out-dp/2,ry);vBq(item||'vPlaster',p[0],yc+Math.sin(a)*K,p[1],bw,L,dp,vQ(ry,0,a),c);}}
const TA_FILL={D:['vDarkB','taDiscD','taGableD'],G:['vWinGlass','taDiscG','taGableG'],L:['vWinLit','taDiscL','taGableL'],W:['vPlaster','taDisc','vGablePl'],M:['taMarble','taDiscM','taGableM'],C:['taCobalt','taDiscC','taGableC']};
// an arched opening of width w and height h (foot to apex) on a face. o = {kind: 'round' (default) | 'point' | 'cusp' |
// 'flat' (a square head), fill: 'D' dark | 'G' glass | 'L' lit | 'W' blind (wall colour) | 'M' marble | 'C' cobalt,
// fc: fill colour, band: the archivolt's colour (none: no band), bw: the band's width (.14), out: its stand-off (.06),
// jambs: true (default) draws the band down the sides too, key: a keystone colour, sill: a sill colour, rail: an iron
// rail's colour across the foot (a loggia), rev: the reveal (the fill set back into the wall), lobes: cusps (3),
// gilt: the band in gilt}. Returns the top y.
function tanArch(x,y,z,ry,w,h,o){o=o||{};const kind=o.kind||'round',F=TA_FILL[o.fill||'D'],bw=o.bw==null?.14:o.bw,out=o.out==null?.06:o.out,rev=(o.rev==null?0:o.rev),fc=o.fc||null;
 const r=w/2,rise=kind==='flat'?0:kind==='point'?w*.72:r,hb=Math.max(.05,h-rise),yc=y+hb/2,bi=o.gilt?'taGilt':'vPlaster';
 tanSlab(F[0],x,yc,z,ry,w,hb,.03-rev,.1,fc);
 if(kind==='round'||kind==='cusp')tanDiscAt(F[1],x,y+hb,z,ry,r,.03-rev,.1,fc);
 else if(kind==='point'){const f=loc(x,z,0,-rev-.02,ry);kput(F[2],[f[0],y+hb,f[1]],vQ(ry+Math.PI/2,0,0),[.08,rise,w],fc);}
 if(o.band){const bc=o.band,K=r+bw/2;
  if(kind==='round'||kind==='cusp')tanArcBand(x,y+hb,z,ry,K,bw,.12,out,bc,0,Math.PI,null,bi);
  else if(kind==='point'){const R=(w*w/4+rise*rise)/w,cc=R-w/2,aT=Math.atan2(rise,cc);for(const s of[-1,1]){const p=loc(x,z,s*cc,0,ry);
    tanArcBand(p[0],y+hb,p[1],ry,R+bw/2,bw,.12,out,bc,s>0?Math.PI-aT:0,s>0?Math.PI:aT,6,bi);}}
  else tanSlab(bi,x,y+hb+bw/2,z,ry,w+2*bw,bw,out,.12,bc);
  if(o.jambs!==false)for(const s of[-1,1]){const p=loc(x,z,s*(r+bw/2),out-.06,ry);vB(bi,p[0],y-.02,p[1],bw,hb+.02,.12,ry,bc);}
  if(kind==='cusp'){const n=(o.lobes==null?3:o.lobes);for(let k=0;k<n;k++){const a=Math.PI*(k+.5)/n;const p=loc(x,z,Math.cos(a)*r*.84,out-.03,ry);
   kput(o.gilt?'taDiscGi':'taDisc',[p[0],y+hb+Math.sin(a)*r*.84,p[1]],vQ(ry,0,0),[r*.3,r*.3,.1],bc);}}
  if(o.key){const f=loc(x,z,0,out+.03,ry);vB('vPlaster',f[0],y+hb+rise-bw*.3,f[1],bw*1.6,bw*2,.14,ry,o.key);}}
 if(o.sill)tanSlab('vPlaster',x,y-.06,z,ry,w+2*bw+.1,.12,out+.06,.22,o.sill);
 if(o.rail){const f=loc(x,z,0,.08,ry);vB('vIron',f[0],y+.95,f[1],w,.04,.04,ry,o.rail);const n=Math.max(2,Math.round(w/.3));for(let k=0;k<=n;k++){const p=loc(x,z,-w/2+k*w/n,.08,ry);vB('vIron',p[0],y,p[1],.03,.95,.03,ry,o.rail);}}
 return y+h;}
// an arcade along a face centred at (x, z): n arches of span w with piers `pier` wide between and at the ends (or
// columns of order o.col at the piers' places, radius pier*.4, standing o.colOut in front); o passes to tanArch.
// Returns the run's length
function tanArcade(x,y,z,ry,n,w,h,pier,o){o=o||{};const len=n*w+(n+1)*pier;for(let k=0;k<n;k++){const u=-len/2+pier+w/2+k*(w+pier);const p=loc(x,z,u,0,ry);tanArch(p[0],y,p[1],ry,w,h,o);}
 if(o.col)for(let k=0;k<=n;k++){const u=-len/2+pier/2+k*(w+pier);const p=loc(x,z,u,o.colOut==null?.3:o.colOut,ry);tanColumn(p[0],y,p[1],h,pier*.4,o.col,o.cc,o.capC);}
 return len;}

// ---------------------------------------------------------------- columns, balusters, entablature
// a column of height h and foot radius r: a square plinth, a torus base, the shaft (a lathe with entasis), the capital by
// order ('doric': an echinus and an abacus; 'ionic': the same with two volutes; 'corinthian': a bell and an abacus;
// 'plain': a small echinus), c the stone, capC the capital (gilt on the rich and civic; defaults to c). Returns the top y
function tanColumn(x,y,z,h,r,order,c,capC){order=order||'doric';capC=capC||c;const ab=r*.32,cap=order==='corinthian'?r*2.2:r*1.1,sh=h-ab*2-cap;
 vB('taMarble',x,y,z,r*2.4,ab,r*2.4,0,c);kput('taRingMs',[x,y+ab+r*.1,z],null,[r*1.0,r*1.0,r*1.0],c);
 vPst('taCol',x,y+ab,z,r,sh,c);
 const yt=y+ab+sh;
 if(order==='corinthian'){kput('taBellGi',[x,yt,z],null,[r*.95,cap,r*.95],capC);for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;kput('taGiltNub',[x+Math.sin(a)*r*1.15,yt+cap*.5,z+Math.cos(a)*r*1.15],null,[r*.3,r*.5,r*.3],capC);}}
 else if(order==='plain')kput('taEchinus',[x,yt,z],null,[r*1.1,cap,r*1.1],c);
 else{kput('taEchinus',[x,yt,z],null,[r*1.3,cap,r*1.3],capC);if(order==='ionic')for(const s of[-1,1])kput('taRingGiS',[x+s*r*1.3,yt+cap*.5,z],qEuler(0,0,Math.PI/2),[r*.42,r*.42,r*.42],capC);}
 vB('taMarble',x,yt+cap,z,r*2.4,ab,r*2.4,0,capC);
 return y+h;}
// a colonnade along a face: n+1 columns from -len/2 to len/2 about (x, z) on the face, standing `out` in front of it
function tanColonnade(x,y,z,ry,len,n,h,r,order,c,capC,out){for(let k=0;k<=n;k++){const p=loc(x,z,-len/2+k*len/n,(out==null?0:out),ry);tanColumn(p[0],y,p[1],h,r,order,c,capC);}}
// a balustrade along a face, centred at (x, z), `len` long, h high (1.0): a plinth rail, a baluster every .36 m, a top
// rail, a post at each end (o.ball: a ball on each post, o.gilt: in gilt). o.plain: the plaster items (poor and middle)
function tanBalustrade(x,y,z,ry,len,c,h,o){o=o||{};h=(h==null?1.0:h);const it=o.plain?'taBalusterP':'taBaluster',bx=o.plain?'vPlaster':'taMarble';
 vB(bx,x,y,z,len,.1,.26,ry,c);vB(bx,x,y+h-.12,z,len,.12,.24,ry,c);
 const n=Math.max(1,Math.round((len-.4)/.36));for(let k=0;k<=n;k++){const p=loc(x,z,-(len-.4)/2+k*(len-.4)/n,0,ry);kput(it,[p[0],y+.1,p[1]],null,[.34,h-.22,.34],c);}
 for(const s of[-1,1]){const p=loc(x,z,s*(len/2-.12),0,ry);vB(bx,p[0],y,p[1],.24,h+.1,.3,ry,c);if(o.ball)kput(o.gilt?'taGiltBall':'taBallM',[p[0],y+h+.22,p[1]],null,[.14,.14,.14],o.gilt||c);}}
// a balustrade round a block's roof edge (four sides), the block w x d centred at (x, z)
function tanParapet(x,y,z,w,d,ry,c,h,o){for(const [lx,lz,a,L] of[[0,d/2,0,w],[0,-d/2,Math.PI,w],[w/2,0,Math.PI/2,d],[-w/2,0,-Math.PI/2,d]]){const p=loc(x,z,lx,lz,ry);tanBalustrade(p[0],y,p[1],ry+a,L,c,h,o);}}
// an entablature over a block w x d at (x, z): an architrave, a frieze (friezeC: the orange or gilt band), a row of
// dentils and a cornice stepping out; returns the top y. o = {dentils: true, friezeH: .34, cornice: .38, proud: .12}
function tanEntablature(x,y,z,w,d,ry,c,friezeC,o){o=o||{};const pr=o.proud==null?.12:o.proud,fh=o.friezeH==null?.34:o.friezeH,ch=o.cornice==null?.38:o.cornice;let yy=y;
 vB('taMarble',x,yy,z,w+2*pr,.22,d+2*pr,ry,c);yy+=.22;
 vB('vPlaster',x,yy,z,w+2*pr+.04,fh,d+2*pr+.04,ry,friezeC||c);yy+=fh;
 if(o.dentils!==false){const dd=pr+.14;for(const [lx,lz,a,L] of[[0,d/2+dd,0,w+2*dd],[0,-d/2-dd,Math.PI,w+2*dd],[w/2+dd,0,Math.PI/2,d],[-w/2-dd,0,-Math.PI/2,d]]){
   const cc=loc(x,z,lx,lz,ry),n=Math.max(2,Math.round(L/.5));for(let k=0;k<n;k++){const p=loc(cc[0],cc[1],-L/2+(k+.5)*L/n,0,ry+a);vB('taMarble',p[0],yy,p[1],.22,.18,.24,ry+a,c);}}
  yy+=.18;}
 vB('taMarble',x,yy,z,w+2*pr+.3,.12,d+2*pr+.3,ry,c);yy+=.12;vB('taMarble',x,yy,z,w+2*pr+.5,ch-.12,d+2*pr+.5,ry,c);yy+=ch-.12;
 return yy;}
// a string course: a slab round a block standing `proud` of its walls
function tanString(x,y,z,w,d,ry,c,proud,h){proud=proud==null?.14:proud;h=(h==null?.18:h);vB('vPlaster',x,y,z,w+2*proud,h,d+2*proud,ry,c);}
// a pilaster: a flat strip proud of a face with a small capital and base, w wide, h high
function tanPilaster(x,y,z,ry,w,h,c,capC){const f=loc(x,z,0,.08,ry);vB('taMarble',f[0],y,f[1],w,h,.16,ry,c);const g=loc(x,z,0,.11,ry);vB('taMarble',g[0],y+h-.3,g[1],w+.2,.3,.22,ry,capC||c);vB('taMarble',g[0],y,g[1],w+.16,.22,.2,ry,c);}
// a pediment on a face: a triangular wedge w wide rising `rise`, standing out `out` and `depth` deep, a cornice bar under
// it; tympC paints the tympanum (a thinner inner wedge, proud) in another colour; ball: a gilt ball's colour on the apex
function tanPediment(x,y,z,ry,w,rise,c,out,depth,tympC,ball){out=out==null?.1:out;depth=(depth==null?.5:depth);const f=loc(x,z,0,out-depth/2,ry);
 kput('vGablePl',[f[0],y+.14,f[1]],vQ(ry+Math.PI/2,0,0),[depth,rise,w],c);vB('vPlaster',f[0],y,f[1],w+.2,.14,depth+.1,ry,c);
 if(tympC){const g=loc(x,z,0,out+.02,ry);kput('vGablePl',[g[0],y+.26,g[1]],vQ(ry+Math.PI/2,0,0),[.08,rise*.7,w*.72],tympC);}
 if(ball){vPst('taGiltPost',f[0],y+.14+rise-.02,f[1],.05,.16,ball);kput('taGiltBall',[f[0],y+.14+rise+.28,f[1]],null,[.16,.16,.16],ball);}}
// a scroll gable: a pediment's cheeks curled (a half disc at each foot), the baroque crown over a bay
function tanScrollGable(x,y,z,ry,w,rise,c,out,ball){out=out==null?.1:out;tanPediment(x,y,z,ry,w*.72,rise,c,out,.4,null,ball);
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2-rise*.28),out-.2,ry);kput('taDisc',[p[0],y+rise*.28,p[1]],vQ(ry,0,0),[rise*.28,rise*.28,.38],c);
  const q=loc(x,z,s*(w*.36-rise*.14),out-.2,ry);vB('vPlaster',q[0],y,q[1],rise*.28,rise*.28,.38,ry,c);}}

// ---------------------------------------------------------------- drums, domes, lanterns
// a finial: a gilt ball on a short spike, a smaller ball over it
function tanFinial(x,y,z,r,c){vPst('taGiltPost',x,y,z,r*.35,r*2.2,c);kput('taGiltBall',[x,y+r*2.2+r*.8,z],null,[r,r,r],c);kput('taGiltBall',[x,y+r*4.2,z],null,[r*.45,r*.7,r*.45],c);}
// a dome of radius r on (x, y, z): o = {kind: 'hemi' (default) | 'egg' | 'melon' | 'onion', item: the kit item (default
// by kind: tile), c: its colour, h: its height (default by kind), ribs: n (melon: 12), ribItem, ribC, finial: colour,
// fr: finial radius}. Returns the top y
function tanDome(x,y,z,r,o){o=o||{};const kind=o.kind||'hemi';let item=o.item,h=o.h;
 if(kind==='egg'){item=item||'taEggT';h=h||r*1.35;}else if(kind==='onion'){item=item||'taOnionT';h=h||r*1.5;}else{item=item||'taDome';h=h||r;}
 kput(item,[x,y,z],null,[r,h,r],o.c||null);
 const ribs=o.ribs==null?(kind==='melon'?12:0):o.ribs;
 if(ribs){const ri=o.ribItem||'taRib';for(let k=0;k<ribs;k++)kput(ri,[x,y,z],vQ(k*TAU/ribs,0,0),[r+.03,h+.03,r+.03],o.ribC||o.c||null);}
 if(o.finial)tanFinial(x,y+h-.02,z,o.fr||Math.max(.1,r*.08),o.finial);
 return y+h;}
// a drum of radius r and height h: a cylinder with n arched windows round it (dark; o.fill 'L' when lit), pilasters
// between when o.pil, a cornice ring on top. c the wall. o.round: the 24-sided drum (taDrum; else the 8-sided post);
// o.ww, o.wh: the windows' width and height (default by r and h). Returns the top y
function tanDrum(x,y,z,r,h,n,c,o){o=o||{};vPst(o.round?'taDrum':'vPostS',x,y,z,r,h,c);
 const ww=o.ww==null?Math.min(1.2,r*.5):o.ww,wh=o.wh==null?Math.min(h-.5,ww*2.2):o.wh;
 for(let k=0;k<n;k++){const a=k*TAU/n+(o.a0||0);const p=[x+Math.sin(a)*r,z+Math.cos(a)*r];
  tanArch(p[0],y+(h-wh)/2,p[1],a,ww,wh,{fill:o.fill||'D',band:o.band,bw:.1,out:.04,gilt:o.gilt});
  if(o.pil){const b=(k+.5)*TAU/n+(o.a0||0);const q=[x+Math.sin(b)*r,z+Math.cos(b)*r];tanPilaster(q[0],y,q[1],b,.4,h-.1,o.pilC||c,o.capC);}}
 kput('taRing',[x,y+h,z],null,[r+.06,r+.06,1.2],o.corniceC||c);
 return y+h;}
// a lantern: a small drum of open arches under a small dome and a finial. Returns the top y (under the finial)
function tanLantern(x,y,z,r,h,c,domeC,finialC,o){o=o||{};tanDrum(x,y,z,r,h,(o.n==null?6:o.n),c,{fill:'D',band:o.band});
 return tanDome(x,y+h+.08,z,r+.1,{kind:o.kind||'hemi',c:domeC,item:o.item,finial:finialC,fr:Math.max(.08,r*.18)});}
// a drum and dome: the drum, its cornice, the dome, the lantern: the named ending of every important mass
// o = {drumH, n: windows (8), kind, drumC, domeC, item, ribs, ribItem, ribC, lantern: false to omit, lanternC, finial:
// colour, gilt: a colour (the ribs, the lantern's finial and the drum's capitals in it), lit: true (lit windows), band,
// pil: pilasters between the windows}
function tanDrumDome(x,y,z,r,o){o=o||{};const dh=o.drumH||r*.8,n=(o.n==null?8:o.n),gi=o.gilt||null,dc=o.drumC||vC(vPick(TAPAL.white));
 const yt=tanDrum(x,y,z,r,dh,n,dc,{fill:o.fill||(o.lit?'L':'D'),band:o.band,pil:o.pil,pilC:o.pilC,capC:gi||o.capC,gilt:!!gi,round:o.round,ww:o.ww,wh:o.wh});
 const yd=tanDome(x,yt,z,r+.1,{kind:o.kind,c:o.domeC,item:o.item,ribs:o.ribs,ribItem:gi?'taRibGi':o.ribItem,ribC:gi||o.ribC,finial:o.lantern===false?(o.finial||gi):null,fr:o.fr});
 if(o.lantern!==false)return tanLantern(x,yd-.08,z,Math.max(.4,r*.22),Math.max(.8,r*.4),dc,o.lanternC||o.domeC,o.finial||gi,{band:o.band});
 return yd;}
// a chhatri: a kiosk of n columns under a ribbed dome on a plinth (the roof kiosk, the stair head). Returns the top y
function tanKiosk(x,y,z,r,h,n,c,o){o=o||{};n=(n==null?6:n);vB('vPlaster',x,y,z,r*2.4,.25,r*2.4,0,c);
 for(let k=0;k<n;k++){const a=k*TAU/n;tanColumn(x+Math.sin(a)*r,y+.25,z+Math.cos(a)*r,h,Math.max(.1,r*.09),o.order||'plain',c,o.capC);}
 kput('taRing',[x,y+.25+h,z],null,[r+.14,r+.14,1.6],c);vB('vPlaster',x,y+.25+h,z,r*2.2,.14,r*2.2,0,c);
 return tanDome(x,y+.39+h,z,r*1.05,{kind:o.kind||'melon',c:o.domeC,item:o.item,ribs:o.ribs,ribC:o.ribC,ribItem:o.ribItem,finial:o.finial,fr:o.fr});}

// ---------------------------------------------------------------- bays, screens, stairs, paving
// a jharokha: a projecting bay on a face, w wide, h high, standing `out` from the wall, its floor at y: two corbels
// under it, a balustrade front, a cusped arch opening on the front between two colonnettes, small arches on the
// cheeks, a small ribbed dome over it (o.dome false: a flat cap). c the body, bandC the bands, o = {domeC, fill, finial}
function tanJharokha(x,y,z,ry,w,h,out,c,bandC,o){o=o||{};const f=loc(x,z,0,out/2,ry);
 vB('vPlaster',f[0],y-.22,f[1],w,.22,out,ry,c);
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2-.3),out*.4,ry);vB('vPlaster',p[0],y-.7,p[1],.3,.5,out*.6,ry,c);vB('vPlaster',p[0],y-1.05,p[1],.3,.38,out*.3,ry,c);}
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2-.08),out/2,ry);vB('vPlaster',p[0],y,p[1],.16,h,out,ry,c);
  const q=loc(x,z,s*(w/2),out/2,ry);tanArch(q[0],y+.95,q[1],ry+s*Math.PI/2,Math.min(.8,out*.6),Math.min(1.6,h-1.3),{kind:'cusp',fill:o.fill||'D',band:bandC,bw:.08,out:.04,lobes:3});}
 const fr=loc(x,z,0,out,ry);tanBalustrade(fr[0],y,fr[1],ry,w-.3,c,.95,{plain:true});
 if(o.jali!==false&&TAL_MATLIB.taJaliA)tanJali(fr[0],y+1.0,fr[1],ry,w-1.1,Math.max(.6,h-2.0),c,null,true);
 vB('vPlaster',fr[0],y+h-.3,fr[1],w,.3,.16,ry,c);
 tanArch(fr[0],y+.95,fr[1],ry,w-.7,h-1.25,{kind:'cusp',fill:o.fill||'D',band:bandC,bw:.1,out:.05,jambs:false,lobes:5});
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2-.25),out-.1,ry);vPst('taColP',p[0],y+.95,p[1],.08,h-1.25,bandC);}
 vB('vPlaster',f[0],y+h,f[1],w+.2,.14,out+.2,ry,c);
 if(o.dome!==false)tanDome(f[0],y+h+.14,f[1],Math.min(w,out)*.5,{kind:'melon',c:o.domeC||bandC,ribs:8,ribC:c,finial:o.finial,fr:.06});
 return y+h+.14;}
// the temple's rose window: the star disc card (TAL_MATLIB.taRose) on a face, radius r, its centre at y (the card's disc
// fills .93 of its square); without the library, a cobalt disc
function tanRoseWindow(x,y,z,ry,r){const f=loc(x,z,0,.06,ry);if(TAL_MATLIB.taRose){kput('taRose',[f[0],y,f[1]],vQ(ry,0,0),[r*2.15,r*2.15,1],null);return;}
 kput('taDiscC',[f[0],y,f[1]],vQ(ry,0,0),[r,r,.08],null);}
// a jali: a lattice screen filling a rectangle on a face: vertical and horizontal bars of the wall colour over a dark
// ground (rich only)
// with the library bound (TAL_MATLIB.taJaliA, taJaliG: the owner's cut-out cards, one tile a metre, chosen by place) the
// lattice is one card plane; `bare` leaves out the dark ground (a lit opening behind shows through the cut-out)
function tanJali(x,y,z,ry,w,h,c,pitch,bare){pitch=(pitch==null?.22:pitch);const f=loc(x,z,0,.02,ry);const nx=Math.round(w/pitch),ny=Math.round(h/pitch);
 if(TAL_MATLIB.taJaliA){if(!bare)vB('vDarkB',f[0],y,f[1],w,h,.04,ry);const g=loc(x,z,0,.08,ry);
  kput(((Math.round(x*7+z*13)&1)?'taJaliG':'taJaliA'),[g[0],y+h/2,g[1]],vQ(ry,0,0),[w,h,1],c||null);return;}
 vB('vDarkB',f[0],y,f[1],w,h,.04,ry);for(let k=0;k<=nx;k++){const p=loc(x,z,-w/2+k*w/nx,.05,ry);vB('vPlaster',p[0],y,p[1],.04,h,.05,ry,c);}
 for(let k=0;k<=ny;k++)vB('vPlaster',f[0],y+k*h/ny-.02,f[1],w,.04,.1,ry,c);}
// an outside straight stair along a wall face: its foot at (x, z) on the face, climbing along the face toward local
// x * dir, w wide, `rise` over `steps`; treads in treadC (orange on Talia) with a sloping stringer wall in c on the open side
function tanWallStair(x,y,z,ry,dir,rise,steps,w,c,treadC){const run=steps*.32;const p=loc(x,z,dir*run/2,w/2+.02,ry);
 vnStairs(p[0],y,p[1],ry-dir*Math.PI/2,w,rise,steps,'vPlaster',treadC);
 const q=loc(x,z,dir*run/2,w+.14,ry),ang=Math.atan2(rise,run);kput('vPlaster',[q[0],y+rise/2+.35,q[1]],vQ(ry,0,dir*ang),[Math.hypot(run,rise)+.3,.9,.2],c);
 for(let k=0;k<steps;k++){const t=(k+.5)/steps;const s=loc(x,z,dir*run*t,w/2+.02,ry);vB('vPlaster',s[0],y,s[1],.34,rise*k/steps+.01,w,ry,c);}}
// an imperial stair up to a terrace of height `rise` whose edge is the face at (x, z): two flights beside each other
// climb from the ground to a landing at half height, turn, and one broad flight... no: Talia's (talia (2).jpg) is the
// other way: one broad lower flight from the ground to a landing, then two narrower flights turning back to the
// terrace either side of it. Balustrades on the open sides, a runner in treadC on the lower flight, balls on the
// newels (o.gilt: a colour, in gilt). w the lower flight's width. Returns the stair's reach out from the face
function tanImperialStair(x,y,z,ry,w,rise,c,treadC,o){o=o||{};const h1=rise/2,n1=Math.max(3,Math.round(h1/.17)),run1=n1*.32,n2=n1,run2=run1,LD=1.5,uw=w*.42,W=w+2*uw+.5;
 // the upper flights, from the landing's ends up to the face; the wall between them under the terrace; the fill under each
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2+uw/2+.25),run2/2,ry);vnStairs(p[0],y+h1,p[1],ry,uw,h1,n2,'taMarble',c);vB('taMarble',p[0],y,p[1],uw,h1,run2,ry,c);
  const q=loc(x,z,s*(W/2-.12),run2/2,ry),ang=Math.atan2(h1,run2);kput('taMarble',[q[0],y+h1*1.5+.45,q[1]],vQ(ry,ang,0),[.24,.9,Math.hypot(run2,h1)],c);}
 const M=loc(x,z,0,run2/2,ry);vB('taMarble',M[0],y,M[1],w,h1+.3,run2,ry,c);tanArch(loc(x,z,0,run2,ry)[0],y,loc(x,z,0,run2,ry)[1],ry,Math.min(1.6,w*.5),h1-.1,{fill:'D',band:c,bw:.12});
 // the landing and the lower flight beyond it
 const L=loc(x,z,0,run2+LD/2,ry);vB('taMarble',L[0],y,L[1],W,h1,LD,ry,c);
 const F=loc(x,z,0,run2+LD+run1/2,ry);vnStairs(F[0],y,F[1],ry,w,h1,n1,'taMarble',c);
 const ang1=Math.atan2(h1,run1);kput('vPlaster',[F[0],y+h1/2+.09,F[1]],vQ(ry,ang1,0),[w*.4,.03,Math.hypot(run1,h1)-.2],treadC);
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.12),run2+LD+run1/2,ry);kput('taMarble',[p[0],y+h1/2+.4,p[1]],vQ(ry,ang1,0),[.24,.9,Math.hypot(run1,h1)+.2],c);
  const q=loc(x,z,s*(w/2+.12),run2+LD+run1+.15,ry);vB('taMarble',q[0],y,q[1],.42,.95,.42,ry,c);kput(o.gilt?'taGiltBall':'taBallM',[q[0],y+1.12,q[1]],null,[.18,.18,.18],o.gilt||c);
  const e=loc(x,z,s*(W/2-.12),run2+LD/2,ry);tanBalustrade(e[0],y+h1,e[1],ry+s*Math.PI/2,LD,c,.95,{ball:o.gilt||c,gilt:o.gilt});
  const g=loc(x,z,s*(w/2+uw+.25+.12),run2+LD-.12,ry);tanBalustrade(g[0],y+h1,g[1],ry,uw+.26,c,.95,{});}
 return run2+LD+run1;}
// a ring medallion in the paving: an orange ring round a white disc with an orange boss, laid flat at y
function tanMosaicRing(x,y,z,r,c1,c2){const M=!!TAL_MATLIB.taMosaic;kput('taRing',[x,y+.02,z],null,[r,.3,r],c1);if(M)kput('taDiscMo',[x,y+.008,z],qEuler(Math.PI/2,0,0),[r*.95,r*.95,.02],null);kput('taDisc',[x,y+.012,z],qEuler(Math.PI/2,0,0),[r*(M?.6:.88),r*(M?.6:.88),.02],c2);kput('taDisc',[x,y+.03,z],qEuler(Math.PI/2,0,0),[r*.3,r*.3,.02],c1);}
// a meander border: a strip round a rectangle w x d at y with small white squares along it (the key pattern's reading)
function tanMeander(x,y,z,w,d,ry,c,t){t=(t==null?.3:t);const wh=vC(0xf4f1ea),M=!!TAL_MATLIB.taMeander&&Math.abs(t-.3)<.01;/* M: the library's band (taMeanderB, .3 m wide) */
 for(const [lx,lz,a,L] of[[0,d/2-t/2,0,w],[0,-d/2+t/2,Math.PI,w],[w/2-t/2,0,Math.PI/2,d-2*t],[-w/2+t/2,0,-Math.PI/2,d-2*t]]){const p=loc(x,z,lx,lz,ry);vB(M?'taMeanderB':'vPlaster',p[0],y,p[1],L,.03,t,ry+a,M?null:c);
  if(M)continue;const n=Math.max(1,Math.round(L/(t*2)));for(let k=0;k<n;k++){const q=loc(p[0],p[1],-L/2+(k+.5)*L/n,0,ry+a);vB('vPlaster',q[0],y+.03,q[1],t*.5,.012,t*.5,ry+a,wh);}}}
// a rounded block: a box whose vertical edges are rounded by r (a cross of two boxes and four corner posts); the deeper
// box through vnBody so a hollow set can take it later. c the wash
// With an interior (VERN.cur.hollow: the def has an item in kits/interiors/sets/talia.js and the page asks for interiors)
// the cross of two boxes would fill the room, so it draws ONE hollow body w x d with a round pier on each corner (69e
// draws four straight walls); a world without interiors keeps the true rounded corners.
function tanRoundBox(x,y,z,w,h,d,ry,c,r){r=(r==null?.3:r);
 if(VERN.cur&&VERN.cur.hollow){vnBody('vPlaster',x,y,z,w,h,d,ry,c,{t:.3});for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*w/2,sz*d/2,ry);vPst('vPostS',p[0],y,p[1],r,h,c);}return;}
 vnBody('vPlaster',x,y,z,w,h,d-2*r,ry,c,{t:.3});vB('vPlaster',x,y,z,w-2*r,h,d,ry,c);
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2-r),sz*(d/2-r),ry);vPst('vPostS',p[0],y,p[1],r,h,c);}}
// a flat roof's parapet: a low wall round the block with a coping (poor and middle: no balusters)
function tanParapetWall(x,y,z,w,d,ry,c,h,capC){h=(h==null?.7:h);for(const [lx,lz,a,L] of[[0,d/2-.12,0,w],[0,-d/2+.12,0,w],[w/2-.12,0,Math.PI/2,d],[-w/2+.12,0,Math.PI/2,d]]){const p=loc(x,z,lx,lz,ry);vB('vPlaster',p[0],y,p[1],L,h,.24,ry+a,c);vB('vPlaster',p[0],y+h,p[1],L+.06,.08,.32,ry+a,capC||c);}}
// a potted plant: a terracotta pot with leaves, on poor and middle terraces
function tanPot(x,y,z,r,c){kput('vClayPot',[x,y,z],null,[r,r*1.5,r],c||vC(vPick(TAPAL.tile)));for(let k=0;k<3;k++)kput('vLeaf',[x+rr(-r*.4,r*.4),y+r*1.7,z+rr(-r*.4,r*.4)],null,[r*.9,r*.7,r*.9],vC(vPick([0x4e7a3a,0x5a8a44,0x3f6b32])));}
// hanging plants over a rail: n clumps of leaves trailing down a face from y
function tanTrail(x,y,z,ry,w,n){for(let k=0;k<n;k++){const p=loc(x,z,rr(-w/2,w/2),.18,ry);for(let j=0;j<3;j++)kput('vLeaf',[p[0],y-j*.28,p[1]],null,[.26,.2,.2],vC(vPick([0x4e7a3a,0x5a8a44,0x6a9a4a])));}}

// ---------------------------------------------------------------- vaults, courts, shop fronts (the trade buildings, 71t)
// a barrel vault: its springing at y, centred at (x, z), radius r, len long along local z (ry turns it), the shell in
// item ('taVault' plaster, 'taVaultT' tile) tinted c, a tympanum disc in endC closing each end (standing .04 proud of
// the end wall, whose top is buried in it). Returns the crown y
function tanVault(x,y,z,ry,r,len,c,item,endC){kput(item||'taVault',[x,y,z],vQ(ry,0,0),[r,r,len-.1],c);
 for(const s of[-1,1]){const p=loc(x,z,0,s*len/2,ry);kput('taDisc',[p[0],y,p[1]],vQ(ry,0,0),[r,r,.08],endC||c);}return y+r;}
// one storey of a gallery round a court: the court's inner faces (the ranges' walls) IW x ID about (x, z); on each face
// an arch per bay (dark: the rooms off the walk; o.fill), columns (o.order, radius o.r) standing `walk` in front at
// every bay, arch bands between their tops in bandC, the walk's slab at y + h in c with its court edge in bandC.
// o.rail: a balustrade along the slab's court edge at y (an upper storey; o.plain for plaster balusters, o.ball and
// o.gilt as tanBalustrade). o.gate: a half-width about the front face's axis kept clear of columns (a gate's bay).
// o.bay the bay (3.2), o.cc the columns' colour, o.capC their capitals. Each corner column is drawn once
function tanCourtGallery(x,y,z,IW,ID,h,walk,c,bandC,o){o=o||{};const bay=o.bay==null?3.2:o.bay,cr=o.r==null?.18:o.r,cc=o.cc||c,G=o.gate||0;
 [[0,-ID/2,0,IW],[0,ID/2,Math.PI,IW],[IW/2,0,-Math.PI/2,ID],[-IW/2,0,Math.PI/2,ID]].forEach(([lx,lz,a,L],i)=>{
  const f=loc(x,z,lx,lz,0),run=L-2*walk,n=Math.max(2,Math.round(run/bay)),b=run/n,r=b/2-cr-.12,hc=h-r-.3,gate=G&&a===Math.PI;
  for(let k=0;k<n;k++){const u=-run/2+k*b,ub=u+b/2;const w=loc(f[0],f[1],ub,0,a);tanArch(w[0],y,w[1],a,b-.9,h-.6,{fill:o.fill||'D',band:bandC,bw:.12});
   if(!(gate&&Math.abs(u)<G)){const p=loc(f[0],f[1],u,walk,a);tanColumn(p[0],y,p[1],hc,cr,o.order||'doric',cc,o.capC);}
   if(!(gate&&Math.abs(ub)<G+b/2)){const q=loc(f[0],f[1],ub,walk,a);tanArcBand(q[0],y+hc+.1,q[1],a,r+.07,.16,.4,0,bandC,0,Math.PI,10);}}
  const s=loc(f[0],f[1],0,walk/2,a);if(i<2)vB('vPlaster',s[0],y+h,s[1],L,.3,walk+.2,a,c);else vB('vPlaster',s[0],y+h+.01,s[1],run-.4,.28,walk+.2,a,c);
  const e=loc(f[0],f[1],0,walk+.05,a);vB('vPlaster',e[0],y+h+.3,e[1],run+(i<2?.3:-.3),.1,.26,a,bandC);
  if(o.rail){const g=loc(f[0],f[1],0,walk-.15,a);tanBalustrade(g[0],y,g[1],a,run-2*cr-.6,cc,.95,{plain:o.plain,ball:o.ball,gilt:o.gilt});}});}
// a shop front on a face: an opening w wide and h high in a band of bandC (flat-headed; o.kind 'round'), the leaf of a
// timber door folded back at its left jamb, a counter board across the rest with goods on it (crates, pots, a sack), an
// awning over it (o.awning false to omit; o.awnC its cloth) and a sign board on a bracket at its right (o.sign: colour)
function tanShopFront(x,y,z,ry,w,h,bandC,o){o=o||{};const wood=o.woodC||vC(vPick(VPAL.woodMid));tanArch(x,y,z,ry,w,h,{kind:o.kind||'flat',fill:'D',band:bandC,bw:.14,key:o.key});
 const l=loc(x,z,-w/2+.3,.42,ry);kput('vWood',[l[0],y+h/2-.1,l[1]],vQ(ry,0,0).multiply(qEuler(0,-1.15,0)),[.9,h-.2,.06],o.leafC||wood);
 const cw=w-1.4,b=loc(x,z,.4,.35,ry);vB('vWood',b[0],y,b[1],cw,.9,.6,ry,wood);
 for(let k=0;k<3;k++){const g=loc(x,z,.4-cw/2+(k+.5)*cw/3,.35,ry);const t=rng();if(t<.4)vnCrate(g[0],y+.9,g[1],.38,ry+rr(-.3,.3));else if(t<.7)vPst('vClayPot',g[0],y+.9,g[1],.16,.38,vC(vPick(TAPAL.tile)));else kput('vSack',[g[0],y+1.06,g[1]],null,[.2,.17,.2],vC(vPick(VPAL.awning)));}
 if(o.awning!==false)vnAwning(x,y+2.7,z,ry,w+.6,1.4,o.awnC);
 if(o.sign){const s=loc(x,z,w/2+.5,0,ry);vnSign(s[0],y+2.9,s[1],ry,o.sign);}}

// ---------------------------------------------------------------- P4: tiers, petals, rays, coffers, niches (72t-73t)
// a run of boxes round a horizontal arc centred (x, z): mid radius r, yaw a0 to a1 (a point at yaw a is (x + sin a r,
// z + cos a r), as the drums place theirs), each box dr deep radially and h high from y, in n pieces (default by length):
// a theatre's tier, a curved wall, a ring's coping
function tanArcRun(x,y,z,r,a0,a1,dr,h,item,c,n){n=n==null?Math.max(3,Math.round(Math.abs(a1-a0)*r/1.2)):n;const seg=(a1-a0)/n,L=2*r*Math.abs(Math.sin(seg/2))+.06;
 for(let k=0;k<n;k++){const a=a0+(k+.5)*seg;vB(item||'vPlaster',x+Math.sin(a)*r,y,z+Math.cos(a)*r,L,h,dr,a,c);}}
// a ring of n lotus petals round (x, z) at radius r, from y up h: white ellipsoids leaning out by tilt, each backed by a
// slightly larger, thinner one in rimC (gilt: the edge that shows round the petal); returns the petals' top y
function tanLotus(x,y,z,r,h,n,c,rimC,tilt){tilt=tilt==null?.32:tilt;const pw=Math.max(.12,r*Math.sin(Math.PI/n)*1.25),pt=Math.max(.05,h*.07);
 for(let k=0;k<n;k++){const a=k*TAU/n,px=x+Math.sin(a)*r*.82,pz=z+Math.cos(a)*r*.82,q=vQ(a,tilt,0);
  kput('taBallM',[px,y+h*.48,pz],q,[pw,h*.52,pt],c);
  if(rimC){const b=loc(px,pz,0,-pt*.7,a);kput('taGiltBall',[b[0],y+h*.48,b[1]],q,[pw*1.1,h*.56,pt*.6],rimC);}}
 return y+h;}
// a lotus roof (refs/talia ornament.jpg): tiers of petals rising and narrowing round a white egg core, a gilt finial;
// r the base radius at y. Returns the top y (under the finial)
function tanLotusRoof(x,y,z,r,c,rimC,tiers){tiers=tiers==null?4:tiers;kput('taEgg',[x,y,z],null,[r*.78,r*2.3,r*.78],c);
 for(let k=0;k<tiers;k++){const kr=r*(1-k*.2),ky=y+k*r*.52,kh=r*.95*(1-k*.13);tanLotus(x,ky,z,kr,kh,Math.max(6,12-2*k),c,rimC,.3-k*.05);}
 const top=y+r*2.3-.05;if(rimC)tanFinial(x,top,z,Math.max(.12,r*.12),rimC);return top;}
// a sunburst on a face: n rays (long and short alternating) from r0 to r1 round a gilt disc of r0, centred at yc on
// the face (x, z), standing out .08; half: the upper half only (over an arch). c the rays (gilt)
function tanSunburst(x,yc,z,ry,r0,r1,n,c,half){tanDiscAt('taDiscGi',x,yc,z,ry,r0,.1,.1,c);const a1=half?Math.PI:TAU,m=half?n+1:n;
 for(let k=0;k<m;k++){const a=half?k*Math.PI/n:k*TAU/n,re=k%2?r0+(r1-r0)*.7:r1,rm=(r0+re)/2;if(half&&(a<0||a>a1))continue;
  const p=loc(x,z,Math.cos(a)*rm,.05,ry);vBq('taGilt',p[0],yc+Math.sin(a)*rm,p[1],(k%2?.08:.12),re-r0,.05,vQ(ry,0,a-Math.PI/2),c);}}
// a coffered soffit: a slab w x d whose underside is at y (c: the vault's orange), with a grid of ribs hanging under it
// every `pitch` both ways (gridC: white), turned by ry about (x, z): the cloister walks' ceilings (talia-cloisters.jpg)
function tanCoffers(x,y,z,w,d,ry,c,gridC,pitch){pitch=pitch==null?1.1:pitch;vB('vPlaster',x,y,z,w,.14,d,ry,c);
 const nx=Math.max(1,Math.round(w/pitch)),nz=Math.max(1,Math.round(d/pitch));
 for(let k=0;k<=nx;k++){const p=loc(x,z,-w/2+k*w/nx,0,ry);vB('vPlaster',p[0],y-.14,p[1],.12,.14,d,ry,gridC);}
 for(let k=0;k<=nz;k++){const p=loc(x,z,0,-d/2+k*d/nz,ry);vB('vPlaster',p[0],y-.14,p[1],w,.14,.12,ry,gridC);}}
// a statue on a plinth (a figure of marble), standing at (x, y, z) facing ry; s its scale (1: life size)
function tanStatue(x,y,z,ry,s,c,plinthC){s=s==null?1:s;vB('taMarble',x,y,z,.7*s,.6*s,.7*s,ry,plinthC||c);kput('figB',[x,y+.6*s,z],qEuler(0,ry,0),[s*1.05,s,s*1.05],c);kput('taBallM',[x,y+.6*s+1.62*s,z],null,[.16*s,.2*s,.16*s],c);}
// a statue niche on a face: a round-headed recess (fill marble in a shade darker than the wall) in a band, a statue in it
function tanNiche(x,y,z,ry,w,h,c,bandC,statueC){tanArch(x,y,z,ry,w,h,{fill:'M',fc:c.clone().multiplyScalar(.8),band:bandC,bw:.12,sill:bandC});
 const p=loc(x,z,0,.38,ry);tanStatue(p[0],y,p[1],ry,Math.min(1,(h-.8)/2.4),statueC||c);}
// a pane fill for tanArch (fill 'P': the glasshouse's pale glass, taPaneB / taDiscP; a pointed head stays dark glass)
TA_FILL.P=['taPaneB','taDiscP','taGableG'];
// a spandrel: the face between an arch of radius R centred at yc and a level line `top`, over the half-width hw (<= R)
// about (x, z) on a face, filled with n vertical strips dp deep whose front stands `out` from the face: closes the
// corners over a vaulted passage's ends, or the bridge's face between its arch and its deck
function tanSpandrel(x,yc,z,ry,R,hw,top,dp,out,c,n){n=n==null?Math.max(6,Math.round(hw*4)):n;const sw=2*hw/n;
 for(let k=0;k<n;k++){const u=-hw+(k+.5)*sw,ua=Math.min(R,Math.abs(u)),yb=yc+Math.sqrt(Math.max(0,R*R-ua*ua));if(yb>=top-.01)continue;
  const p=loc(x,z,u,out-dp/2,ry);vB('vPlaster',p[0],yb,p[1],sw+.01,top-yb,dp,ry,c);}}
// a round window on a face: a lit (fill 'L'), cobalt ('C') or dark-glass ('G') disc of radius r in a ring band, centred at yc
function tanOculus(x,yc,z,ry,r,fill,bandC,gilt){tanDiscAt(fill==='C'?'taDiscC':fill==='G'?'taDiscG':'taDiscL',x,yc,z,ry,r,.03,.1,null);
 tanArcBand(x,yc,z,ry,r+.08,.16,.12,.07,bandC,0,TAU,14,gilt?'taGilt':'vPlaster');}
