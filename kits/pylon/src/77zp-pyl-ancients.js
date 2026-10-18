// ================================================================= 77zp. PYLON: the Ancients (after 77z, whose izsFamily it uses) (PLAN.md section 5)
// The ruin field round the Monolith: six Ancient building families after the owner's board, the reclaimed temple, and
// the Monolith itself, read in place from kits/ancients (89g-monolith.js; kit.json "external").
//
// The families are Ancient Iziz Style families (77z-iziz-style.js: izsFamily, izsPlace), so the Iziz page's ruin and
// rehab passes (wreck) give each one three states for free: 'intact', 'ruin' (cut open, stripped) and 'rehab' (patched
// with scrap, planks and tarps, lived in). They are drawn in the Ancients' materials (tsand: the panel shell, metallic),
// white with saffron structure and amber glass, in the Ancients' forms: tapering blades, spindles on splayed legs,
// frustum pods, graded vaults, pointed gables, the great hoop. A VERN def wraps each (o.mode), so a city lot or a
// sheet row places them like any building; the culture tag is 'ancients', or 'ancients-reclaimed' when repaired.
// Seeds 9301-9399.
const PYA={white:0xeeebe5,cream:0xe3d9c8,saffron:0xe3a02e,tile:0xe8752a,terra:0xc8644a,gold:0xd9a23a,slot:0x2a2b30};
// a blade: a slab W x D whose width closes to a ridge at H (the tombstone and rocket profile), depth constant, corners
// rounded; the front face is the plane z + D/2
function pyaBlade(P,x,z,W,D,H,cc,p){const g=gridSurface((u,v)=>{const th=u*TAU,t=v,y=t*H,r=se(th,6);
  const hw=W/2*Math.pow(Math.max(0,1-Math.pow(t,p||2.4)),.5);return[x+hw*r*Math.cos(th),y,z+D/2*r*Math.sin(th)];},40,22,{uS:W,vS:H/6});
 mesh(g,tsand(cc),P);}
// a flat fin in the x-y plane at z: a chain of boxes through the points [[x,y],...], `t` thick and `d` deep
function pyaFin(pts,z,t,d,c){for(let k=0;k<pts.length-1;k++){const [x0,y0]=pts[k],[x1,y1]=pts[k+1],L=Math.hypot(x1-x0,y1-y0);
 vBq('vPlaster',(x0+x1)/2,(y0+y1)/2,z,L+t*.6,t,d,vQ(0,0,Math.atan2(y1-y0,x1-x0)),c);}}
// slit windows round a lathe of radius rFn(y), facing out, at heights ys and angles in [a0, a1] (0 = +x, PI/2 = +z)
function pyaSlits(x,z,rFn,ys,a0,a1,n,item,w,h){for(const y of ys)for(let k=0;k<n;k++){const a=a0+(a1-a0)*(k+.5)/n,r=rFn(y)+.06;
 kput(item||'vWinLit',[x+Math.cos(a)*r,y,z+Math.sin(a)*r],qFacing([Math.cos(a),0,Math.sin(a)]),[w||.6,h||1.6,.12],null);}}

// Blade cluster (refs/ancient 2.jpg): five tombstone blades graded about the tallest, a dark slot with amber dashes up the
// middle one, graded portholes on the others, saffron fins sweeping up from the plaza to the outer blades.
izsFamily('pyl_blades','Blade cluster',72,true,(P,x,z)=>{const sf=vC(PYA.saffron),gun=vC(vPick(PYPAL.gunmetal));
 kput('pyConc',[x,.4,z],null,[72,.8,40],vC(0xd8d2c6));kput('pyConc',[x,1.0,z+14],null,[40,.4,10],vC(0xd8d2c6));
 const B=[[0,-4,18,10,62],[-13,-2,12,8,44],[13,-2,12,8,44],[-23.5,0,9,7,30],[23.5,0,9,7,30]];
 for(const [bx,bz,W,D,H] of B)pyaBlade(P,x+bx,z+bz,W,D,H,PYA.white,bx?2.2:2.8);
 kput('vDarkB',[x,26,z+1.15],null,[2,40,.3],null);for(let y=8;y<44;y+=2.4)kput('vWinLit',[x,y,z+1.32],null,[.6,.22,.05],null);
 for(const s of[-1,1]){[[13,7,1.6],[13,15,1.2],[13,22,.9],[23.5,6,1.2],[23.5,12,.8]].forEach(([bx,y,r])=>{const b=B.find(q=>Math.abs(q[0])===bx);pynPorthole(x+s*bx,y,z+b[1]+b[3]/2,0,r,sf,'L',r>1?6:0);});
  pyaFin([[x+s*36,.8],[x+s*31,6],[x+s*28.5,14],[x+s*27.6,22]],z+1,.6,3,sf);pyaFin([[x+s*20,.8],[x+s*18.6,8],[x+s*18.4,16]],z+3,.5,2,sf);}});

// Spindle row (refs/honeycomb arch.jpg): five pointed spindles graded about the tallest, each on three splayed saffron
// legs, graded portholes up their fronts, dark glazed curtains between them.
izsFamily('pyl_spindles','Spindle row',60,true,(P,x,z)=>{const sf=vC(PYA.saffron);
 kput('pyConc',[x,.3,z],null,[56,.6,16],vC(0xd8d2c6));
 const S=[[-20,30],[-10,38],[0,46],[10,38],[20,30]],R=3.4;
 S.forEach(([sx,H],i)=>{const rF=y=>R*Math.pow(Math.max(0,1-y/H),.55)*(1+.45*Math.max(0,1-y/5));
  mesh(lathe({rFn:rF,H,flutes:6,amp:.05,nu:36,nv:24}),tsand(PYA.white),P,x+sx,.6,z);
  for(let k=0;k<3;k++){const a=-Math.PI/2+k*TAU/3;vBeam([x+sx+Math.cos(a)*6.5,0,z+Math.sin(a)*6.5],[x+sx+Math.cos(a)*2.4,7,z+Math.sin(a)*2.4],.7,sf,'vPlaster');}
  [[8,1.2],[14,.95],[19,.75],[23.5,.55],[27,.4]].forEach(([y,r])=>{if(y<H*.7)pynPorthole(x+sx,y,z+rF(y-.6)+.05,0,r,sf,'L',r>.9?6:0);});
  if(i<4)kput('vWinGlass',[x+sx+5,9,z-.6],null,[4.4,17,.3],null);});});

// Pod cluster (refs/pylon6.jpg, re-skinned): truncated cones of white shell with orange-rimmed glass skylights, a ring of
// slit windows, joined by covered bridges.
izsFamily('pyl_pods','Pod cluster',44,false,(P,x,z)=>{const or=vC(vPick(PYPAL.orange)),wh=vC(PYA.white);
 const C=[[-12,-6,5,7],[0,-9,6.2,9],[12,-5,4.6,6.5],[-6,6,4.2,6],[8,7,5,7.5],[19,5,3.6,5]];
 for(const [cx,cz,R,h] of C){const rF=y=>R*(1-.4*y/h);mesh(lathe({rFn:rF,H:h,nu:32,nv:4}),tsand(PYA.white),P,x+cx,0,z+cz);
  kput('pyRing',[x+cx,h,z+cz],qEuler(Math.PI/2,0,0),[R*.5,R*.5,R*.5],or);kput('pyDiscG',[x+cx,h-.02,z+cz],qEuler(Math.PI/2,0,0),[R*.5,R*.5,.1],null);
  pyaSlits(x+cx,z+cz,rF,[2.6],0,TAU,10,'vWinGlass',.9,1.3);}
 const L=[[0,1],[0,2],[1,4],[3,4],[0,3],[4,5]];
 for(const [a,b] of L){const A=C[a],Bq=C[b];vBeam([x+A[0],3.4,z+A[1]],[x+Bq[0],3.4,z+Bq[1]],1.8,wh,'vPanelB');}});

// Vault chapel (refs/ancient apt.jpg): five half-vaults of graded size nested one behind the next, orange shell under
// white rims, glazed ends; a slab bell tower behind.
izsFamily('pyl_vaults','Vault chapel',44,true,(P,x,z)=>{const tile=vC(PYA.tile),wh=vC(PYA.white);
 for(let i=0;i<5;i++){const span=10+3.2*i,rise=span/2,zc=z+8-i*4.6;
  pynVault(x,0,zc,span,4.6,rise,0,'pyHalf',tile);pynArc(x,0,zc+2.3,0,rise-.35,.8,.7,wh,16);
  if(i===0)pynTomb(x,0,zc+2.32,0,span-1.6,rise-.8+(span-1.6)/2,.06,.1,'L');}
 kput('vPanelB',[x+2,18,z-15],null,[3.6,36,3.6],wh);for(let y=6;y<34;y+=3)kput('vDarkB',[x+2,y,z-13.15],null,[1.6,1.6,.1],null);});

// Gem shrine (refs/ancient massing.jpg): a tall pointed bay of glass between two lower pointed wings, each wing set with
// an elongated hexagonal gem window; amber lines tracing the gables; a reflecting pool.
izsFamily('pyl_gems','Gem shrine',36,true,(P,x,z)=>{const sf=vC(PYA.saffron),wh=vC(PYA.white),gun=vC(vPick(PYPAL.gunmetal));
 kput('pyConc',[x,.4,z],null,[34,.8,26],vC(0xd8d2c6));
 const bay=(bx,W,H,rise,D)=>{kput('vPanelB',[x+bx,.8+H/2,z-3],null,[W,H,D],wh);kput('vGableP',[x+bx,.8+H,z-3],vQ(Math.PI/2,0,0),[D,rise,W],wh);
  for(const s of[-1,1])vBeam([x+bx+s*W/2,.8+H+.05,z-3+D/2+.08],[x+bx,.8+H+rise+.05,z-3+D/2+.08],.12,null,'vWinLit');};
 bay(0,8,13,6,7);bay(-8.5,7,7,4,6);bay(8.5,7,7,4,6);
 pynPointed(x,1.2,z+.5,0,6,17.4,.08,.12,'G',null,5.2);for(let y=3;y<14;y+=2.2)kput('vIron',[x,y,z+.62],null,[6,.08,.06],gun);
 for(const s of[-1,1])pynFrame('hex',x+s*8.5,1.6,z,0,2.4,5.6,{rim:.22,n:2,cs:[sf,wh],fill:'G',out:.06});
 kput('vStone',[x,.85,z+8],null,[12,.1,6],vC(0x9a948a));kput('vWinGlass',[x,.92,z+8],null,[11,.03,5],null);});

// Hoop gate (refs/honeycomb complex.jpg, pylon8.jpg): a great standing ring on a low plinth, its foot sunk in the ground,
// and two fallen hoops half buried beside it.
izsFamily('pyl_hoop','Hoop gate',36,true,(P,x,z)=>{const wh=vC(PYA.white),sf=vC(PYA.saffron);
 kput('pyConc',[x,.3,z],null,[20,.6,6],vC(0xd8d2c6));kput('pyRing',[x,8.6,z],null,[8,8,8],wh);
 kput('pyRing',[x,8.6,z],null,[6.9,6.9,1.4],sf);
 kput('pyRing',[x+12,.6,z+6],vQ(.6,1.25,0),[4.4,4.4,4.4],wh);kput('pyRing',[x-11,.2,z+7],vQ(-.3,1.45,.2),[3.2,3.2,3.2],wh);});

// The temple (refs/ancient temple.jpg, ancient.jpg): Pylon's temple, an Ancient building reclaimed. A podium with a dark
// arcade and saffron ribs, four round towers and a taller central one under terracotta domes, slit windows of amber up
// them, a beehive dome pocked with windows, three great arches glazed in amber and rimmed in gold, a rose window, a
// broad stair. Placed 'repaired' (o.mode default) on the city's repaired side (the owner, 2026-10-17).
izsFamily('pyl_temple','Temple of the Ancients',96,true,(P,x,z)=>{const wh=vC(PYA.white),sf=vC(PYA.saffron),gold=vC(PYA.gold),terra=vC(PYA.terra);
 const PZ=z,PW=64,PD=40,PH=6,BZ=z-6;
 kput('vPanelB',[x,PH/2,PZ],null,[PW,PH,PD],wh);
 for(let k=0;k<11;k++){const ax=x-PW/2+3+k*(PW-6)/10;if(Math.abs(ax-x)<5)continue;pynFrame('tomb',ax,.4,PZ+PD/2,0,2.6,4.6,{rim:.2,c:sf,fill:'D',out:.05});}
 for(let k=0;k<8;k++){const rx=x-PW/2+4+k*(PW-8)/7;if(Math.abs(rx-x)<6)continue;pyaFin([[rx,0],[rx+.6,3],[rx,PH]],PZ+PD/2+1.4,.5,1.2,sf);}
 vnStairs(x,0,PZ+PD/2+4.5,0,10,PH,18,'vStone',vC(0x9a948a));
 // the towers
 const T=[[-15,BZ+8,4.4,32],[15,BZ+8,4.4,32],[-15,BZ-10,4.6,38],[15,BZ-10,4.6,38],[0,BZ-10,5.6,48]];
 for(const [tx,tz,R,H] of T){const rF=y=>R*(1-.06*y/H);mesh(lathe({rFn:rF,H,flutes:10,amp:.03,nu:40,nv:6}),tsand(PYA.white),P,x+tx,PH,tz);
  kput('vDomeP',[x+tx,PH+H,tz],null,[R*.97,R*1.1,R*.97],terra);kput('vFinial',[x+tx,PH+H+R*1.1,tz],null,[.4,.6,.4],gold);
  pyaSlits(x+tx,tz,y=>rF(y-PH),[PH+H*.35,PH+H*.62,PH+H*.86],Math.PI/2-.55,Math.PI/2+.55,3,'vWinLit',.8,H*.16);}
 // the body between the towers, its beehive dome, the three great arches and the rose
 kput('vPanelB',[x,PH+9,BZ-1],null,[26,18,22],wh);
 const rB=y=>11*Math.sqrt(Math.max(0,1-Math.pow(y/19,2)));mesh(lathe({rFn:rB,H:19,nu:40,nv:14}),tsand(PYA.white),P,x,PH+18,BZ-1);
 for(const [y,n] of[[3,12],[7,10],[11,8],[14.5,6]])pyaSlits(x,BZ-1,rB,[PH+18+y],Math.PI/2-1.3,Math.PI/2+1.3,n,'vDarkB',.7,.7);
 [[-8.5,5,13],[0,7,16],[8.5,5,13]].forEach(([ax,w,h])=>pynFrame('tomb',x+ax,PH,BZ+10,0,w,h,{rim:.4,n:2,cs:[gold,sf],fill:'L',out:.08}));
 pynPorthole(x,PH+38,BZ-10+5.4,0,3.2,gold,'L',12);});

// ---------------------------------------------------------------- the VERN defs: one per family, the state in o.mode
// izsPlace builds in the WORLD frame (it parents its own group to the scene), so the def hands it the site's world
// position and suspends the placer's group transform while it runs; then it names and tags what it registered.
// o.mode: 'intact', 'ruin' (77z's wreck), 'rehab' (77z's: rusted, scrap-roofed, the Iziz way) or 'repaired' (Pylon's:
// the shell kept white and whole, lived in round its foot: pyaRepair)
function pyaPlace(fam,label,seed,o){const C=VERN.cur,r0=REG.length,mode=o.mode||'intact',sv=KXF;KXF=null;
 try{izsPlace(scene,fam,mode==='repaired'?'intact':mode,C.x,C.z,C.ry,o.scale||1,seed,o.y||0);if(mode==='repaired')pyaRepair(C,seed+7);}finally{KXF=sv;}
 const re=mode==='rehab'||mode==='repaired',tags=Object.assign({},C.D.tags,{culture:re?'ancients-reclaimed':'ancients',state:mode},mode==='repaired'?{lit:true}:{});
 for(let i=r0;i<REG.length;i++){const r=REG[i];r.name=label+' ('+(mode==='ruin'?'ruined':mode==='rehab'?'patched':mode==='repaired'?'repaired':'intact')+')';r.cls=C.D.cls;r.key=C.D.key;r.tags=tags;}}
// Pylon's repaired state: a reoccupied Ancient building. Round the foot of the plot (its def's w x d about the site):
// salvage shelters and market stalls along the sides and back, a scaffold at a front corner where the repair goes on,
// orange banners and electric lamp posts either side of the way in (the front middle is left clear). World frame.
function pyaRepair(C,seed){reseed(seed);const D=C.D,s=C.o.scale||1,hw=D.w/2*s-2,hd=D.d/2*s-2,P=(lx,lz)=>loc(C.x,C.z,lx,lz,C.ry);
 const gun=vC(vPick(PYPAL.gunmetal)),wood=vC(vPick(VPAL.woodPoor)),or=vC(vPick(PYPAL.orange)),wh=vC(vPick(PYPAL.white));
 const spots=[];for(let k=0;k<7;k++){const t=rng();if(t<.4)spots.push([-hw+1.6,rr(-hd,hd*.6),Math.PI/2]);else if(t<.8)spots.push([hw-1.6,rr(-hd,hd*.6),-Math.PI/2]);else spots.push([rr(-hw*.8,hw*.8),-hd+1.6,0]);}
 for(const [lx,lz,a] of spots){const p=P(lx,lz),ry=C.ry+a;
  if(rng()<.5){vB(rng()<.5?'vCorr':'vPanelB',p[0],0,p[1],2.8,2.3,2.4,ry,rng()<.5?null:wh);vnShedRoof(p[0],2.3,p[1],3.2,2.8,.4,ry,'vCorr',null,.2,.08);
   const d=loc(p[0],p[1],0,1.21,ry);vB('vDarkB',d[0],0,d[1],.8,1.8,.05,ry);}
  else vnStall(p[0],p[1],ry,vC(vPick(VPAL.awning)));
  const q=loc(p[0],p[1],1.6,.6,ry);if(rng()<.5)vnCrate(q[0],0,q[1],.6,ry,wood);else vnBarrel(q[0],0,q[1],.32,.9,null);}
 // the scaffold at the front left corner: four poles, three plank decks, a ladder
 const sc=P(-hw+3,hd-3);for(const [a,b] of[[-1.2,-1],[1.2,-1],[-1.2,1],[1.2,1]]){const q=loc(sc[0],sc[1],a,b,C.ry);vPst('vPipe',q[0],0,q[1],.06,9.5,gun);}
 for(const y of[3,6,9])vB('vWood',sc[0],y,sc[1],2.8,.08,2.4,C.ry,wood);const lq=loc(sc[0],sc[1],0,1.3,C.ry);vnLadder(lq[0],0,lq[1],C.ry,9,wood);
 for(const sx of[-1,1]){const b=P(sx*5,hd);vnBannerPole(b[0],0,b[1],C.ry,7,or);const l=P(sx*3.2,hd-.4);vnLampPost(l[0],0,l[1],3.2);}}
function buildPylAncBlades(G,o){reseed(9301+(o.v|0));pyaPlace('pyl_blades','Blade cluster',9302+(o.v|0),o);}
function buildPylAncSpindles(G,o){reseed(9311+(o.v|0));pyaPlace('pyl_spindles','Spindle row',9312+(o.v|0),o);}
function buildPylAncPods(G,o){reseed(9321+(o.v|0));pyaPlace('pyl_pods','Pod cluster',9322+(o.v|0),o);}
function buildPylAncVaults(G,o){reseed(9331+(o.v|0));pyaPlace('pyl_vaults','Vault chapel',9332+(o.v|0),o);}
function buildPylAncGems(G,o){reseed(9341+(o.v|0));pyaPlace('pyl_gems','Gem shrine',9342+(o.v|0),o);}
function buildPylAncHoop(G,o){reseed(9351+(o.v|0));pyaPlace('pyl_hoop','Hoop gate',9352+(o.v|0),o);}
function buildPylTemple(G,o){reseed(9361+(o.v|0));pyaPlace('pyl_temple','Temple of the Ancients',9362+(o.v|0),Object.assign({mode:'repaired'},o));}
// The Monolith: kits/ancients' buildMonolith (89g, read in place), at decay o.d (default 1, the ruin Pylon stands round).
function buildPylMonolith(G,o){reseed(9391+(o.v|0));const r0=VERN.cur.r0,d=o.d==null?1:o.d;
 buildMonolith(G,0,0,d);KOFF=[0,0,0];vnAdoptREG(r0,n=>'The Monolith — '+n,{culture:'ancients',state:d?'ruin':'intact'});}

const PY_TAG_ANC={culture:'ancients',type:['civic'],wealth:'civic',lit:false,style:'ancient'};
VERN.def({key:'anc_pyl_blades',name:'Blade cluster',family:'ancients',tags:PY_TAG_ANC,w:76,d:42,h:64,build:buildPylAncBlades});
VERN.def({key:'anc_pyl_spindles',name:'Spindle row',family:'ancients',tags:PY_TAG_ANC,w:60,d:18,h:48,build:buildPylAncSpindles});
VERN.def({key:'anc_pyl_pods',name:'Pod cluster',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['multi-family dwelling']}),w:50,d:34,h:10,build:buildPylAncPods});
VERN.def({key:'anc_pyl_vaults',name:'Vault chapel',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['religious']}),w:26,d:30,h:38,build:buildPylAncVaults});
VERN.def({key:'anc_pyl_gems',name:'Gem shrine',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['religious']}),w:34,d:28,h:22,build:buildPylAncGems});
VERN.def({key:'anc_pyl_hoop',name:'Hoop gate',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['infrastructure']}),w:32,d:20,h:18,build:buildPylAncHoop});
VERN.def({key:'pyl_temple',name:'Temple of the Ancients',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['religious'],lit:true}),w:66,d:62,h:62,build:buildPylTemple});
VERN.def({key:'anc_monolith',name:'The Monolith',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['multi-family dwelling','civic']}),w:760,d:420,h:1110,build:buildPylMonolith});
