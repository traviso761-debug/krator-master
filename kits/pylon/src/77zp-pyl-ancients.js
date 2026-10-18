// ================================================================= 77zp. PYLON: the Ancients (after 77z, whose izsFamily it uses) (PLAN.md section 5)
// The ruin field round the Monolith: six Ancient building families after the owner's board, the reclaimed temple, and
// the Monolith itself, read in place from kits/ancients (89g-monolith.js; kit.json "external").
//
// The families are Ancient Iziz Style families (77z-iziz-style.js: izsFamily, izsPlace), so the Iziz page's ruin pass
// (wreck) gives each one its 'ruin' state (cut open, stripped) for free; 'intact' is the family as drawn, and 'repaired'
// is Pylon's own (pyaRepair, below). They are drawn in the Ancients' materials (tsand: the panel shell, metallic),
// white with saffron structure and amber glass, in the Ancients' forms: a fortress of slab towers, a slab after the Monolith,
// frustum pods, graded vaults, pointed gables, the great hoop. A VERN def wraps each (o.mode), so a city lot or a
// sheet row places them like any building; the culture tag is 'ancients', or 'ancients-reclaimed' when repaired.
// Seeds 9301-9399.
const PYA={white:0xeeebe5,cream:0xe3d9c8,saffron:0xe3a02e,tile:0xe8752a,terra:0xc8644a,gold:0xd9a23a,slot:0x2a2b30};
// a flat fin in the x-y plane at z: a chain of boxes through the points [[x,y],...], `t` thick and `d` deep
function pyaFin(pts,z,t,d,c){for(let k=0;k<pts.length-1;k++){const [x0,y0]=pts[k],[x1,y1]=pts[k+1],L=Math.hypot(x1-x0,y1-y0);
 vBq('vPlaster',(x0+x1)/2,(y0+y1)/2,z,L+t*.6,t,d,vQ(0,0,Math.atan2(y1-y0,x1-x0)),c);}}
// slit windows round a lathe of radius rFn(y), facing out, at heights ys and angles in [a0, a1] (0 = +x, PI/2 = +z)
function pyaSlits(x,z,rFn,ys,a0,a1,n,item,w,h){for(const y of ys)for(let k=0;k<n;k++){const a=a0+(a1-a0)*(k+.5)/n,r=rFn(y)+.06;
 kput(item||'vWinLit',[x+Math.cos(a)*r,y,z+Math.sin(a)*r],qFacing([Math.cos(a),0,Math.sin(a)]),[w||.6,h||1.6,.12],null);}}

// Fortress block (refs/fortress.jpg, at the Ancients' scale): a cluster of tall white slab towers with rounded corners
// and battlemented tops, the two in front clasped by saffron legs and an arch band over a great round-headed tunnel
// gate; orange keyhole spines and punch-card strips of small windows up the faces, tall oxide-red arched windows,
// saffron plinth columns pierced with rows of round holes at the towers' feet.
// a slab tower: a rounded-rectangle prism W x D x H on the ground, a lid, merlons round its rim
function pyaTower(P,x,z,W,D,H,cc){const g=gridSurface((u,v)=>{const th=u*TAU,r=se(th,7);return[x+W/2*r*Math.cos(th),v*H,z+D/2*r*Math.sin(th)];},44,6,{uS:W+D,vS:H/6});
 mesh(g,tsand(cc),P);kput('vPanelB',[x,H-.2,z],null,[W-.3,.4,D-.3],vC(cc));
 const n=Math.round((W+D)/1.6);for(let k=0;k<n;k++){const th=(k+.5)/n*TAU,r=se(th,7)-.04;kput('vPanelB',[x+W/2*r*Math.cos(th),H+.6,z+D/2*r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.9,1.2,.6],vC(cc));}}
// punch-card window strips on a face at z (front of a tower centred at x, w wide), from y0 to y1: c columns
function pyaStrips(x,z,w,y0,y1,c){const red=vC(0x8e2b22),or=vC(vPick(PYPAL.orange));for(let j=0;j<c;j++){const px=x-w/2+(j+.5)*w/c;
 for(let y=y0;y<y1;y+=.9){if(rng()<.25)continue;const t=rng();kput(t<.5?'vWinGlass':t<.75?'vWinLit':'vPlaster',[px,y,z+.04],null,[.42,.6,.08],t<.75?null:(t<.88?red:or));}}}
izsFamily('pyl_fort','Fortress block',66,true,(P,x,z)=>{const sf=vC(PYA.saffron),or=vC(vPick(PYPAL.orange)),red=vC(0x8e2b22),wh=PYA.white;
 const GW=11,GH=19,T=[[-12,4,13,11,50],[12,4,13,11,44],[-6,-9,12,10,62],[8,-10,11,10,56],[25,-3,10,9,32]];
 kput('pyConc',[x+3,.3,z-2],null,[64,.6,34],vC(0xd8d2c6));
 for(const [tx,tz,W,D,H] of T){pyaTower(P,x+tx,z+tz,W,D,H,wh);const zf=z+tz+D/2;
  if(tz>0)continue;pyaStrips(x+tx,zf,W*.7,8,H-6,4);}
 // the front pair: keyhole spines, red arched windows, strips beside, perforated saffron columns at the outer feet
 for(const s of[-1,1]){const [tx,tz,W,D,H]=T[s<0?0:1],zf=z+tz+D/2,cx=x+tx+s*2.2;
  pynPointed(cx,22,zf,0,2.4,H-30,.12,.12,'P',or,1.6,true);pyaStrips(x+tx-s*3.4,zf,2.6,22,H-4,2);
  for(let k=0;k<2;k++)pynFrame('tomb',x+tx+s*(k?4.6:-1.2),6+k*.0,zf,0,1.6,7.5,{rim:.25,c:red,fill:'G',out:.05});
  const px=x+tx+s*(W/2-1.2);kput('vPlaster',[px,7,zf+1.4],null,[2.6,14,2.6],sf);
  for(let r=0;r<6;r++)for(const u of[-.6,.6])pynEnd('pyDiscD',px+u,2+r*2.1,zf+2.7,0,.42,.05,.08,null);}
 // the gate: saffron legs on the towers' inner faces, an arch band front and back, the tunnel's dark soffit, a bridge
 for(const s of[-1,1])kput('vPlaster',[x+s*(GW/2+.9),GH/2-3,z+4],null,[1.8,GH-6,13],sf);
 for(const zz of[z+4+6.6,z+4-6.6])pynArc(x,GH-GW/2-3,zz,zz>z+4?0:Math.PI,GW/2+.9,1.8,1.2,sf,18);
 kput('pyHalf',[x,GH-GW/2-3,z+4],null,[GW/2,GW/2,13],vC(0x3a3632));kput('pyConc',[x,.62,z+4],null,[GW-.4,.06,22],vC(0xb8b2a6));
 kput('vPanelB',[x,GH+1.5,z+4],null,[GW+4,6,11],vC(wh));pyaStrips(x,z+9.5,GW,GH-.6,GH+4,6);});

// Arch slab (after the Monolith, kits/ancients/src/89g-monolith.js, at a city block's scale): one slab, 40 m tall,
// 28 m wide at the foot tapering to 23, 10 m deep, with the Monolith's three subtractions: a round-headed through-arch off
// centre to the west with a way through it, and three circular through-oculi (a great one near the top, a smaller one
// lower and east, a small one west), each a real hole with a stepped rim and a bridge across the great one. The faces
// wear a skin of orange and ochre cladding panels standing proud of the white stone, some slit, some with a porthole;
// the west end is left bare: the carved white city stepped out in blocks with windows and balconies.
izsFamily('pyl_slab','Arch slab',46,true,(P,x,z)=>{const H=40,W0=28,W1=23,D=10,AX=-5,AW=8,AH=12;
 const OC=[[1.5,30.5,4.2],[6.8,18.5,2.3],[-6.6,21.5,1.5]];
 const hw=y=>W0/2+(W1-W0)/2*y/H;
 const S=new THREE.Shape();S.moveTo(-W0/2,0);S.lineTo(AX-AW/2,0);S.lineTo(AX-AW/2,AH-AW/2);S.absarc(AX,AH-AW/2,AW/2,Math.PI,0,true);
 S.lineTo(AX+AW/2,0);S.lineTo(W0/2,0);S.lineTo(W1/2,H);S.lineTo(-W1/2,H);S.lineTo(-W0/2,0);
 for(const [ox,oy,r] of OC){const h=new THREE.Path();h.absarc(ox,oy,r,0,TAU,true);S.holes.push(h);}
 const g=new THREE.ExtrudeGeometry(S,{depth:D,bevelEnabled:false,curveSegments:24});g.translate(x,0,z-D/2);mesh(g,tsand(PYA.white),P);
 // the oculi's stepped rims, front and back, and a bridge gallery across the great one
 const or=vC(vPick(PYPAL.orange)),och=vC(0xd9a04a),wh=vC(PYA.white),gun=vC(vPick(PYPAL.gunmetal));
 for(const [ox,oy,r] of OC)for(const s of[-1,1]){kput('pyRing',[x+ox,oy,z+s*(D/2+.05)],null,[r+.2,r+.2,r*.6],wh);kput('pyRing',[x+ox,oy,z+s*(D/2+.25)],null,[r+.55,r+.55,r*.35],och);}
 kput('vPanelB',[x+OC[0][0],OC[0][1]-OC[0][2]+.9,z],null,[OC[0][2]*2+.4,.5,D+.6],wh);
 for(const s of[-1,1])for(let k=0;k<6;k++)kput('vIron',[x+OC[0][0]-OC[0][2]+.4+k*(OC[0][2]*2-.8)/5,OC[0][1]-OC[0][2]+1.15+.5,z+s*(D/2+.25)],null,[.05,1,.05],gun);
 // the way through the arch, and its soffit painted dark (nothing in a sheet casts the shade)
 kput('pyConc',[x+AX,.06,z],null,[AW-.4,.12,D+6],vC(0xb8b2a6));kput('pyHalf',[x+AX,AH-AW/2-.02,z],null,[AW/2-.05,AW/2-.05,D+.02],vC(0x3a3632));
 // the cladding: a panel grid on both faces, kept clear of the arch, the oculi's rims and the carved west end
 const CW=2.6,CH=1.7,clear=(px,py,pw,ph)=>{if(px-pw/2<-hw(py)+6.5)return false;if(px+pw/2>hw(py+ph)-.3)return false;
  if(Math.abs(px-AX)<AW/2+.6&&py<AH+.6)return false;for(const [ox,oy,r] of OC){const dx=Math.max(Math.abs(px-ox)-pw/2,0),dy=Math.max(Math.abs(py+ph/2-oy)-ph/2,0);if(Math.hypot(dx,dy)<r+.8)return false;}return true;};
 for(const s of[-1,1])for(let py=.6;py<H-1.4;py+=CH+.12)for(let px=-W0/2+CW/2;px<W0/2;px+=CW+.12){if(!clear(px,py,CW,CH)||rng()<.12)continue;
  const zz=z+s*(D/2+.12+rng()*.18),c=rng()<.55?or:och;kput('vPlaster',[x+px,py+CH/2,zz],null,[CW,CH,.25],c);
  const t=rng();if(t<.18)kput('vDarkB',[x+px,py+CH/2,zz+s*.14],null,[CW*.7,.16,.04],null);else if(t<.3)pynPorthole(x+px,py+CH/2,zz+s*.12,s>0?0:Math.PI,.42,gun,'G',0);}
 // the carved west end: white blocks stepped out in three layers, windows and balconies
 for(let k=0;k<9;k++){const by=k*4.2+.2,bw=hw(by)-hw(by)+0,ex=-hw(by)+3.4;for(let j=0;j<3;j++){const bx=ex-1.2+j*1.6,bd=D+1.2-j*.8,bh=3.6-j*.5;
  kput('vPanelB',[x+bx,by+bh/2,z],null,[2,bh,bd],wh);}
  for(const s of[-1,1]){kput('vDarkB',[x+ex-.6,by+1.6,z+s*(D/2+.62)],null,[1.2,1.4,.04],null);if(k%2)kput('vPanelB',[x+ex-.6,by+.2,z+s*(D/2+1.2)],null,[1.6,.15,1.1],wh);}}});

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
// o.mode: 'intact', 'ruin' (77z's wreck) or 'repaired' (Pylon's:
// the shell kept white and whole, lived in round its foot: pyaRepair)
// (77z's 'rehab' caps a broken top with a flat round scrap roof at its bounding box's height and drapes tarps: right for
// Iziz's drums and boxes, a floating disc over these blades and vaults (the owner, 2026-10-18), so it is taken as 'repaired')
function pyaPlace(fam,label,seed,o){const C=VERN.cur,r0=REG.length,mode=o.mode==='rehab'?'repaired':(o.mode||'intact'),sv=KXF;KXF=null;
 try{izsPlace(scene,fam,mode==='repaired'?'intact':mode,C.x,C.z,C.ry,o.scale||1,seed,o.y||0);if(mode==='repaired')pyaRepair(C,seed+7);}finally{KXF=sv;}
 const re=mode==='rehab'||mode==='repaired',tags=Object.assign({},C.D.tags,{culture:re?'ancients-reclaimed':'ancients',state:mode},mode==='repaired'?{lit:true}:{});
 for(let i=r0;i<REG.length;i++){const r=REG[i];r.name=label+' ('+(mode==='ruin'?'ruined':mode==='repaired'?'repaired':'intact')+')';r.cls=C.D.cls;r.key=C.D.key;r.tags=tags;}}
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
function buildPylAncFort(G,o){reseed(9301+(o.v|0));pyaPlace('pyl_fort','Fortress block',9302+(o.v|0),o);}
function buildPylAncSlab(G,o){reseed(9311+(o.v|0));pyaPlace('pyl_slab','Arch slab',9312+(o.v|0),o);}
function buildPylAncPods(G,o){reseed(9321+(o.v|0));pyaPlace('pyl_pods','Pod cluster',9322+(o.v|0),o);}
function buildPylAncVaults(G,o){reseed(9331+(o.v|0));pyaPlace('pyl_vaults','Vault chapel',9332+(o.v|0),o);}
function buildPylAncGems(G,o){reseed(9341+(o.v|0));pyaPlace('pyl_gems','Gem shrine',9342+(o.v|0),o);}
function buildPylAncHoop(G,o){reseed(9351+(o.v|0));pyaPlace('pyl_hoop','Hoop gate',9352+(o.v|0),o);}
function buildPylTemple(G,o){reseed(9361+(o.v|0));pyaPlace('pyl_temple','Temple of the Ancients',9362+(o.v|0),Object.assign({mode:'repaired'},o));}
// The Monolith: kits/ancients' buildMonolith (89g, read in place), at decay o.d (default 1, the ruin Pylon stands round).
function buildPylMonolith(G,o){reseed(9391+(o.v|0));const r0=VERN.cur.r0,d=o.d==null?1:o.d;
 buildMonolith(G,0,0,d);KOFF=[0,0,0];vnAdoptREG(r0,n=>'The Monolith — '+n,{culture:'ancients',state:d?'ruin':'intact'});}

const PY_TAG_ANC={culture:'ancients',type:['civic'],wealth:'civic',lit:false,style:'ancient'};
VERN.def({key:'anc_pyl_fort',name:'Fortress block',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['civic','military']}),w:68,d:36,h:64,build:buildPylAncFort});
VERN.def({key:'anc_pyl_slab',name:'Arch slab',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['multi-family dwelling','civic']}),w:32,d:18,h:42,build:buildPylAncSlab});
VERN.def({key:'anc_pyl_pods',name:'Pod cluster',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['multi-family dwelling']}),w:50,d:34,h:10,build:buildPylAncPods});
VERN.def({key:'anc_pyl_vaults',name:'Vault chapel',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['religious']}),w:26,d:30,h:38,build:buildPylAncVaults});
VERN.def({key:'anc_pyl_gems',name:'Gem shrine',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['religious']}),w:34,d:28,h:22,build:buildPylAncGems});
VERN.def({key:'anc_pyl_hoop',name:'Hoop gate',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['infrastructure']}),w:32,d:20,h:18,build:buildPylAncHoop});
VERN.def({key:'pyl_temple',name:'Temple of the Ancients',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['religious'],lit:true}),w:66,d:62,h:62,build:buildPylTemple});
VERN.def({key:'anc_monolith',name:'The Monolith',family:'ancients',tags:Object.assign({},PY_TAG_ANC,{type:['multi-family dwelling','civic']}),w:760,d:420,h:1110,build:buildPylMonolith});
