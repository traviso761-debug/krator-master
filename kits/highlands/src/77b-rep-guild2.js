// ================================================================= HIGHLANDS / REPUBLICAN — Astronomers' and Salvagers' guilds
// Round 5 (Travis): the orrery leaves the Mechanics' Guild for a guild of its own, and the Scavengers (now the Salvagers) get a hall.
// Seeds 21101–21129 (R-B's block). Civic, lit.
//
// Astronomers' Guild: a stucco-and-half-timber hall painted with the heavens, an observatory dome with its slit and
// brass telescope at one end, and the ORRERY TOWER — an octagonal stone shaft carrying a wide open belvedere (posts
// well clear of the orrery's reach) in which the sky turns: the gilt sun, the green gas giant on its great ring, and
// round the giant Krator and two lesser moons. A sundial and an armillary sphere in the court.
//
// Salvagers' Guild: the guild of those who strip the Ancient ruins. A rubble-and-log hall under a salvaged metal
// roof, faced at the gable with bleached Ancient panels; its gate is two Ancient tank sections under a panel lintel;
// behind, a yard fenced in plate and pipe where the haul is sorted into heaps (panels, sheet, pipe, tanks), a pipe
// gantry crane with a panel on its hook, a weighbridge and its booth, carts.

// a mural of a GIVEN motif (not a random pick), fitted like hnForm's (hlFlush)
function hnMural(item,x,y,z,ry,w,h){const C=VERN.cur;(C.murals||(C.murals=[])).push({item,x,y,z,ry,w,h});}
// the sky of Krator in brass, centred at (x,y,z); `R` = the great ring radius. Reach: R + 1.45.
// Travis: the orrery TURNS. It is built of real meshes (not kit instances) in nested groups — the giant's arm turns
// about the great ring's axis, each moon's arm about its own ring's axis, the sun and the giant spin — and every
// turning group is registered in HLANIM (rad/s about its local z), which the frame hook in 94-hl-anim.js drives.
const HLANIM=[];
const HORR={};
function hlOrreryMats(){if(HORR.brass)return HORR;HORR.brass=MAT.rbBronze;HORR.sun=MAT.gold;
 HORR.giant=new THREE.MeshStandardMaterial({roughness:.55,map:canvasTex(64,128,(g,w,h)=>{const B=['#4f7e68','#8fb896','#c3dcb8','#5f927a','#9cc4a4','#2e9488','#b4d0a4','#7aa888','#4f7e68'];
  B.forEach((c,i)=>{g.fillStyle=c;g.fillRect(0,i*h/B.length,w,h/B.length+1);});})});
 HORR.krator=new THREE.MeshStandardMaterial({color:0x4f86a8,roughness:.6});HORR.land=new THREE.MeshStandardMaterial({color:0x5f9a4a,roughness:.8});
 HORR.moonA=new THREE.MeshStandardMaterial({color:0xb8b0a0,roughness:.8});HORR.moonB=new THREE.MeshStandardMaterial({color:0xd19a3a,roughness:.7});return HORR;}
function hnRBOrrery(x,y,z,R){const M=hlOrreryMats(),P=VERN.cur.G;const O=new THREE.Group();O.position.set(x,y,z);P.add(O);
 const ball=(r,mat,par,px,py,pz)=>mesh(new THREE.SphereGeometry(r,20,14),mat,par,px||0,py||0,pz||0);
 const hoop=(r,par)=>mesh(new THREE.TorusGeometry(r,.035,6,48),M.brass,par);
 const rod=(len,par,r)=>{const m=mesh(new THREE.CylinderGeometry(r||.035,r||.035,len,6).rotateZ(Math.PI/2).translate(len/2,0,0),M.brass,par);return m;};
 mesh(new THREE.CylinderGeometry(.08,.08,1.5,8).translate(0,-1.15,0),M.brass,O);                      // the column
 const sun=ball(.45,M.sun,O);HLANIM.push({o:sun,w:.25,axis:'y'});
 // the great ring and the giant's arm
 const plane=new THREE.Group();plane.quaternion.copy(qEuler(Math.PI/2+.08,0,.05));O.add(plane);hoop(R,plane);
 const arm=new THREE.Group();arm.rotation.z=.7;plane.add(arm);HLANIM.push({o:arm,w:.16});rod(R*.82,arm,.04);
 const GG=new THREE.Group();GG.position.set(R,0,0);arm.add(GG);
 const giant=ball(.44,M.giant,GG);giant.rotation.x=Math.PI/2;HLANIM.push({o:giant,w:.9,axis:'y'});
 const gr=new THREE.Group();gr.quaternion.copy(qEuler(-.35,0,.2));GG.add(gr);hoop(.64,gr);
 // the three moons about the giant: Krator (blue, green land) and two lesser moons
 [[1,.3,2.4,.21,M.krator,true,.55],[.72,-.25,.9,.1,M.moonA,false,.9],[1.3,.15,4.4,.13,M.moonB,false,.38]].forEach(([r,tilt,ph,rad,mat,krator,w])=>{
  const mp=new THREE.Group();mp.quaternion.copy(qEuler(tilt,0,tilt*.6));GG.add(mp);hoop(r,mp);
  const ma=new THREE.Group();ma.rotation.z=ph;mp.add(ma);HLANIM.push({o:ma,w});rod(r*.9,ma,.024);
  const m=ball(rad,mat,ma,r,0,0);if(krator)ball(rad*.55,M.land,ma,r*1.02,rad*.3,0);});
 return O;}
function buildHlRepGuildAstro(G,o){reseed(21101+(o.v|0));const HX=-4,HZ=-1,W=16,D=10,S=.6,H1=4,H2=3.2,TX=10,TZ=-1;
 const cream=hC(vPick(HPAL.stucco)),beamC=hC(vPick(HPAL.redwood)),slate=hC(vPick(HPAL.slate)),ash=hC(vPick(HPAL.ashlar)),tar=hC(vPick(HPAL.tar)).multiplyScalar(1.25),
  cu=hC(0x5f9a88),iron=hC(hRBIRON),lit=vLit()?'lit':'glass';
 vnReg("Astronomers' Guild",HX,HZ,9.5,16);vnReg("Astronomers' orrery tower",TX,TZ,5.4,23);vnReg("Astronomers' observatory",HX-W/2-3.6,HZ,4,12);
 // the hall
 hnSocle(HX,0,HZ,W,S,D);hnStucco(HX,S,HZ,W,H1,D,0,cream,ash);const FZ=HZ+D/2,y2=S+H1,y3=y2+H2;
 for(const u of[-5.6,-2.8,2.8,5.6])vnWin(HX+u,S+.9,FZ,0,1.1,2.2,lit,'vStone',ash);
 hnRBWins(HX,S+.9,HZ-D/2,Math.PI,W-2,5,1.1,2.2,lit,'vStone',ash);
 vnDoor(HX,S,FZ,0,1.7,3,'vStone',ash,tar,false);vB('vStone',HX,0,FZ+.6,3,S,1.2,0,ash);
 hnMural('hM_w_heavens',HX,S+3.15,FZ,0,2.6,1.3);
 hnFachBox(HX,y2,HZ,W,H2,D,0,cream,beamC,lit);
 const top=hnGable(HX,y3,HZ,W,D,1.2,0,'hGableSc',slate,.6,'vGablePl',cream);hnBarge(HX,y3,HZ,W,D,6,0,.6,beamC,'lace');
 hnMural('hM_g_giant',HX+W/2+.02,y3+.9,HZ,Math.PI/2,3.4,1.7);hnMural('hM_g_tree',HX-W/2-.02,y3+.9,HZ,-Math.PI/2,3.4,1.7);
 for(let i=0;i<5;i++){const x=HX-W/2+2+i*3;vBall('hGold',x,top+.25,HZ,.16,hC(HPAL.gold[0]));}                                        // gilt stars along the ridge
 hnStoneChimney(HX-3,top-1.4,HZ-2,2.2,.7);
 // the observatory: a stone drum, a copper dome with its shutter slit open, a brass telescope through it
 const OX=HX-W/2-3.6;kput('hOctS',[OX,0,HZ],qEuler(0,Math.PI/8,0),[4.2,7,4.2],ash);vB('vStone',OX,7,HZ,8.2,.3,8.2,0,ash);
 kput('vDomeC',[OX,7.2,HZ],null,[3.8,3.6,3.8],cu);
 const sl=loc(OX,HZ,0,0,0);kput('vDarkB',[sl[0],9.4,sl[1]+2.4],qEuler(-.72,0,0),[1.1,3.2,.3]);                                        // the open slit (toward +z, climbing the dome)
 kput('vPipeC',[OX,9.6,HZ+.8],qEuler(-.95,0,0),[.34,4.2,.34],hC(0xb8903a));kput('vPipeC',[OX,9.6,HZ+.8],qEuler(-.95,0,0),[.42,.6,.42],hC(0x7a5a2a));   // telescope + collar
 for(let k=0;k<8;k++){const a=k*Math.PI/4;if(k===0)continue;const p=loc(OX,HZ,0,3.9,a);vnWin(p[0],2.4,p[1],a,.6,1.4,lit,'vStone',ash);}
 vnDoor(OX,0,HZ+3.95,0,1.1,2.2,'vStone',ash,tar);
 // the orrery tower: octagonal shaft, a wide belvedere (posts at r 4.9 — the orrery reaches 3.9), a bulb roof
 const SH=13;kput('hOctS',[TX,0,TZ],qEuler(0,Math.PI/8,0),[3.3,SH,3.3],ash);for(const y of[4.4,8.8])kput('hOctS',[TX,y,TZ],qEuler(0,Math.PI/8,0),[3.45,.3,3.45],ash);
 for(let k=0;k<8;k++){const a=k*Math.PI/4;if(k===0)continue;const p=loc(TX,TZ,0,3.05,a);vnWin(p[0],1.8,p[1],a,.6,1.5,lit,'vStone',ash);vnWin(p[0],6.2,p[1],a,.6,1.5,lit,'vStone',ash);}
 vnDoor(TX,0,TZ+3.05,0,1.2,2.4,'vStone',ash,tar);vnWin(TX,6.2,TZ+3.05,0,.6,1.5,lit,'vStone',ash);
 for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8,r=3.3,p=[TX+Math.sin(a)*r,TZ+Math.cos(a)*r];hnMember('vWood',[p[0],SH-2.4,p[1]],[TX+Math.sin(a)*5,SH-.1,TZ+Math.cos(a)*5],.22,.22,[Math.sin(a+Math.PI/2),0,Math.cos(a+Math.PI/2)],tar);}   // raking brackets under the deck
 kput('hOctS',[TX,SH,TZ],qEuler(0,Math.PI/8,0),[5.4,.4,5.4],ash);const BY=SH+.4,PR=4.9,PH=4.2;
 for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;vPst('vPost',TX+Math.sin(a)*PR,BY,TZ+Math.cos(a)*PR,.13,PH,tar);
  const p=loc(TX,TZ,0,PR*Math.cos(Math.PI/8),k*Math.PI/4);kput('hLaceB',[p[0],BY+.5,p[1]],qEuler(0,k*Math.PI/4,0),[3.6,.9,1],beamC);vB('vWood',p[0],BY+.98,p[1],3.75,.1,.14,k*Math.PI/4,tar);}
 hnRBOrrery(TX,BY+2.2,TZ,2.35);
 kput('hOctW',[TX,BY+PH,TZ],qEuler(0,Math.PI/8,0),[5.5,.4,5.5],tar);
 for(let k=0;k<8;k++){const a=k*Math.PI/4;const p=loc(TX,TZ,0,5.05,a);hnFrieze(p[0],BY+PH+.05,p[1],a,4.1,.3);}
 kput('hBulbSc',[TX,BY+PH+.4,TZ],null,[4.6,4.4,4.6],cu);const tp=BY+PH+4.8;vPst('vIron',TX,tp-.3,TZ,.05,1.6,iron);hnRBGear(TX,tp+1.5,TZ,0,.4,.07,false,0,hC(HPAL.gold[0]));
 // the court: a sundial and an armillary sphere
 vnPaving(HX+4,0,FZ+3,12,4,0,ash,10);
 FURNISH('hl_rep_sundial',HX+5,0,FZ+3,0,{v:0});FURNISH('hl_rep_sundial',HX-1.5,0,FZ+3,0,{v:1});   // the sundial, the armillary sphere
 hnRBLamps([[HX-2.6,FZ+4.6],[HX+2.6,FZ+4.6],[TX-2,TZ+5.8]],3.4);vnFolk(HX+1,FZ+4.4,3,3);}

// Round 10 (Travis: "make scavenger guild larger and more elaborate and move it just outside the port gate"): the guild
// as a compound. The GUILDHALL (rubble ground storey, frame upper storey, a salvaged metal gable faced with Ancient
// panels, the guild's roundel over the door) with, bridged to it, the STAGE TOWER — a spent rocket stage stood on end,
// rings of windows cut in it, a frame lookout and a spire on top. Behind, the HULL DEPOT under a curved hull panel. To
// the east the SORTING YARD, fenced in plate on pipe posts and entered through a gate of stacked tank sections: sorted
// heaps with their painted boards, a gantry crane spanning the yard with a hull section on its chains, a row of container
// stores, a furnace with its stack, the weighbridge and booth, carts. Along the road front, the guild's salvage market.
function buildHlRepGuildScav(G,o){reseed(21111+(o.v|0));
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),tar=hC(vPick(HPAL.tar)),trim=hC(vPick([HPAL.teal,HPAL.red])),iron=hC(hRBIRON),lit=vLit()?'lit':'glass';
 const rust=hC(vPick(HSV.rust)),conc=hC(vPick(HSV.conc)),hull=hC(vPick([0x9a968c,0x8e8a80,0xa49e90])),plank=hC(vPick(HFRAME.plank));
 const HX=-18,HZ=-2,W=22,D=12,S=1,H1=3.8,H2=3.2,FZ=HZ+D/2,y2=S+H1,y3=y2+H2;
 vnReg("Salvagers' Guild",HX,HZ,12,y3+7);vnReg("Salvagers' stage tower",-4,-9,4,26);vnReg("Salvagers' hull depot",HX,-17.5,11,10);vnReg("Salvagers' yard",16,-1,16,6);
 // ---- the guildhall
 vB('hRubB',HX,0,HZ,W,S+H1,D,0,rub);vB('vStone',HX,S+H1-.2,HZ,W+.2,.2,D+.2,0,ash);
 for(const u of[-8,-5,5,8])vnWin(HX+u,S+.8,FZ,0,1,1.9,lit,'vStone',ash,true);hnRBWins(HX,S+.8,HZ-D/2,Math.PI,W-2,6,1,1.9,lit,'vStone',ash);
 kput('hRAArchS',[HX,0,FZ+.15],null,[4.4,S+3.4,.34],ash);vnDoor(HX,S,FZ+.02,0,2.2,2.9,'vStone',ash,tar,false);
 vB('vStone',HX,0,FZ+1.6,7,S,3,0,ash);vnStairs(HX,0,FZ+3.1+.64,0,5,S,4,'vStone',ash);
 hnMural('hM_w_emblem',HX,S+3.7,FZ,0,2.6,1.3);
 hnFachBox(HX,y2,HZ,W,H2,D,0,null,null,lit);
 const top=hnGable(HX,y3,HZ,W,D,1.15,0,'hGableR',null,.7,'vGableP',null);
 for(let k=0;k<7;k++){const u=rr(-W/2+1,W/2-1),v=rr(-D/2+.8,D/2-.8);kput(vPick(['vPlate','vSheet','vPlateW']),[HX+u,y3+1.15*(D/2-Math.abs(v))+.26,HZ+v],qEuler(-Math.PI/2+Math.sign(v)*Math.atan(1.15),0,rr(-.15,.15)),[rr(1.2,2.2),rr(1,1.8),1],null);}
 for(const s of[-1,1])for(let k=0;k<4;k++)kput('vPlateW',[HX+s*(W/2+.06),y3+.4+k*.9,HZ+rr(-1.4,1.4)],qEuler(0,s*Math.PI/2,rr(-.08,.08)),[rr(1.6,2.8),.85,1],null);
 kput(HMOTIF.sign.salvage,[HX,y3+2.6,FZ+.75],null,[2,2,1],null);
 hnStoneChimney(HX+6,top-1.6,HZ-2,2.4,.8);vnChimney(HX-6,top-1.2,HZ+1.5,2.6,.14,true);
 for(const s of[-1,1]){vnBannerPole(HX+s*5.2,0,FZ+3.6,0,8,hC(s<0?HPAL.red:HPAL.teal));}
 // ---- the stage tower, bridged from the upper storey
 {const TX=-4,TZ=-9,R=2.6,TH=16;for(const a of[0,2.1,4.2])vB('boxCR',TX+Math.cos(a)*2,0,TZ+Math.sin(a)*2,1.2,1.4,1.2,a,conc);
  kput('hTankC',[TX,1.2+TH/2,TZ],null,[R,TH,R],rust);for(let y=2.5;y<TH;y+=3.6){kput('vHoop',[TX,1.2+y+1.5,TZ],qEuler(Math.PI/2,0,0),[R*1.01,R*1.01,1],iron);for(const a of[.3,1.8,-1.2,3])hnLatWin(TX+Math.sin(a)*R,1.2+y-.2,TZ+Math.cos(a)*R,a,.8,1,lit,null);}
  vnDoor(TX,1.2,TZ+R+.02,0,1,2.1,'hPaint',hC(vPick(HFRAME.post)),tar,false);vB('boxCR',TX,0,TZ+R+.7,2,1.2,1.4,0,conc);
  const ty=1.2+TH;vB('vWood',TX,ty,TZ,6.6,.25,6.6,0,tar);hnFachBox(TX,ty+.25,TZ,5,2.8,5,0,null,null,lit);
  hnRCSpire(TX,ty+3.05,TZ,5.8,8,0,hC(vPick(HPAL.slate)),{flag:true,flagC:hC(HPAL.red)});
  const by=y2+.1;vB('vWood',(TX+HX+W/2)/2,by-.2,TZ+3,TX-R-(HX+W/2)+1.2,.2,1.6,0,plank);kput('hRailC',[(TX+HX+W/2)/2,by+.45,TZ+3.78],null,[TX-R-(HX+W/2)+1,.7,1],tar);
  for(const x of[HX+W/2+1.2,TX-R-1])vPst('vPipeR',x,0,TZ+3,.12,by-.2,null);}
 // ---- the hull depot behind the hall
 {const L=22,R=6.2,arc=Math.PI*.84,he=Math.cos(arc/2)*R,hw=Math.sin(arc/2)*R,eave=3.2,yc=eave-he,DZ=-17.5;
  vB('boxCR',HX,0,DZ,L+1,.3,2*hw+.8,0,conc);kput('hVault',[HX,.3+yc,DZ],null,[L,R,R],hull);for(let k=0;k<=7;k++)kput('hVaultR',[HX-L/2+L*k/7,.3+yc,DZ],null,[.28,R+.06,R+.06],rust);
  for(const s of[-1,1]){for(let i=0;i<=7;i++){const x=HX-L/2+.3+(L-.6)*i/7;kput('hCol',[x,.3,DZ+s*(hw-.25)],null,[.15,eave-.65,.15],hC(vPick(HFRAME.postPoor)));}
   vB('hPlankB',HX,.3,DZ+s*(hw-.45),L-.4,eave-.8,.12,0,plank);vnPatch(HX+rr(-6,6),.6,DZ+s*(hw-.35),s>0?0:Math.PI,5,1.6,5);}
  for(const e of[-1,1]){const x=HX+e*(L/2-.1);for(let u=-hw+.4;u<hw;u+=.8){const h=yc+Math.sqrt(Math.max(0,R*R-u*u))-.15;vB('hPlankB',x,.3,DZ+u,.14,h,.82,0,plank);}}
  vB('vDarkB',HX+L/2+.05,.3,DZ,.08,4,5,0);}
 // ---- the sorting yard: fence, the tank gate, heaps, the gantry, the stores, the furnace, the weighbridge
 const YX0=-4,YX1=34,YZ0=-23,YZ1=21,GX=16,IT=[['vPlateW','vPlateW','vPlate'],['vSheet','vPlate'],['vPipeR'],['vTankR','vPipeR'],['vPlateW','vSheet'],['vPlate','vPipeR']];
 const segs=[[[YX0+8,YZ0],[YX1,YZ0]],[[YX1,YZ0],[YX1,YZ1]],[[YX0+8,YZ1],[GX-3.6,YZ1]],[[GX+3.6,YZ1],[YX1,YZ1]],[[YX0+8,YZ0],[YX0+8,-12]]];
 for(const [[ax,az],[bx,bz]] of segs){const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/2.2)),ry=Math.atan2(bx-ax,bz-az)+Math.PI/2;
  for(let i=0;i<=n;i++)vPst('vPipeR',ax+(bx-ax)*i/n,0,az+(bz-az)*i/n,.06,2.5,null);
  for(let i=0;i<n;i++){const t=(i+.5)/n;kput(vPick(['vPlate','vSheet','vPlate','vPlateW']),[ax+(bx-ax)*t,1.15+rr(-.08,.08),az+(bz-az)*t],qEuler(0,ry,rr(-.05,.05)),[L/n+.1,2.2+rr(-.2,.1),1],null);}}
 for(const s of[-1,1]){for(let k=0;k<2;k++)kput('hTankC',[GX+s*3.3,1.6+k*3.2,YZ1],null,[1.1,3.2,1.1],rust.clone().multiplyScalar(k?.9:1));kput('hTankCap',[GX+s*3.3,6.4,YZ1],null,[1.1,.45,1.1],rust);}
 vB('vPanelB',GX,6.5,YZ1,8.4,1,1.4,0,null);kput(HMOTIF.sign.salvage,[GX,7,YZ1+.72],null,[1.4,1.4,1],null);for(let k=0;k<6;k++)hnLantern(GX-3+k*1.2,6.45,YZ1+.8);
 const heap=(x,z,items,n,r)=>{const MH=r*.42;hnRCHeap(x,0,z,r*1.05,MH,hC(vPick([0x5a4a3e,0x6a5040,0x4a4038])),0);
  for(let i=0;i<n;i++){const a=rng()*TAU,d=Math.sqrt(rng())*r*.9,sy=Math.max(0,MH*(1-d/(r*1.05))-.12);const it=vPick(items);
   if(it==='vPipeR')kput('vPipeR',[x+Math.cos(a)*d,sy+.05,z+Math.sin(a)*d],qEuler(Math.PI/2+rr(-.3,.3),rng()*TAU,0),[rr(.08,.2),rr(1.5,3),rr(.08,.2)],null);
   else if(it==='vTankR'){const tr=rr(.4,.7);kput('vTankR',[x+Math.cos(a)*d,sy+tr*.5,z+Math.sin(a)*d],qEuler(0,rng()*TAU,Math.PI/2),[tr,rr(1,2),tr],null);}
   else kput(it,[x+Math.cos(a)*d,sy+.04,z+Math.sin(a)*d],qEuler(0,rng()*TAU,0).multiply(qEuler(-Math.PI/2+rr(-.25,.25),0,0)),[rr(1,2.2),rr(.8,1.6),1],null);}};
 const HP=[[10,-8],[18,-8],[26,-8],[10,4],[26,4],[30,13]];HP.forEach(([x,z],i)=>{heap(x,z,IT[i],32,3.5);hnSignBoard(x,.1,z+3.3,0,1.8,.6,'salvage',hC(vPick([HPAL.ochre,HPAL.white,HPAL.teal])));});
 {const CZ=-2,CH=10;for(const x of[YX0+10,YX1-2]){beam('vPipeR',[x,0,CZ-2],[x,CH,CZ],.24,.24);beam('vPipeR',[x,0,CZ+2],[x,CH,CZ],.24,.24);vB('vIron',x,CH*.45,CZ,.2,.2,2.2,0,iron);}
  vB('hPaint',(YX0+10+YX1-2)/2,CH+.1,CZ,YX1-YX0-10,.6,.5,0,hC(vPick(HFRAME.post)));vB('hPaint',(YX0+10+YX1-2)/2,CH+.7,CZ,YX1-YX0-9.6,.12,.7,0,hC(HPAL.teal));
  const TXr=18;vB('vIron',TXr,CH-.3,CZ,1.4,.4,1,0,iron);for(const s of[-1,1])hnCable([TXr,CH-.3,CZ+s*.35],[TXr+s*1.8,5.2,CZ],iron);
  kput('hHullSeg',[TXr,3.4,CZ],qEuler(0,0,Math.PI/2).multiply(qEuler(0,-Math.PI*.31,0)),[2.6,6,2.6],rust);}
 for(let k=0;k<5;k++){const c=hContC();hnCont(4+k*6.2,0,YZ0+1.8,0,6,c,{door:1.5});}
 {const fx=31,fz=18;vB('hRubB',fx,0,fz,4,2.4,3.4,0,rub);kput('hTankC',[fx,3.6,fz],qEuler(0,0,Math.PI/2),[1.3,3.6,1.3],rust);vB('vDarkB',fx,.2,fz-1.72,1.2,1,.06,0);vBall('vEmber',fx,.55,fz-1.75,.3,null,.1);hnRCStack(fx+2.8,0,fz,1.8,14);}
 vB('vIron',GX,0,YZ1-5,3.4,.14,5,0,iron);vB('vIron',GX,.14,YZ1-5,3.2,.02,4.8,0,hC(0x6a6258));
 vB('hPlankB',GX+4.2,0,YZ1-4,1.8,2.4,1.8,0,plank);vnShedRoof(GX+4.2,2.4,YZ1-4,2,2,.35,0,'vCorr',null,.2,.08);vnWin(GX+4.2,1,YZ1-3.08,0,.7,.6,'open','vWood',tar);
 hnRCCart(8,14,.4,tar,true);hnRCCart(24,16,-.3,tar,true);hnRCCart(GX,YZ1-5,0,tar,true);
 hlRngSkip(8);FURNISH('hl_rep_plate_stack',1.49,0,14,0,{v:1});   // the stack of Ancient panels
 // ---- the salvage market along the road front
 for(let k=0;k<4;k++)hnStall(HX-9+k*6,0,FZ+8.5,0,hC(vPick(HPAL.aged)));
 hnBunting([HX-12,3,FZ+9.6],[HX+10,3,FZ+9.6],12);
 hnRBLamps([[GX-4.6,YZ1+1],[GX+4.6,YZ1+1],[HX-3.4,FZ+4.2],[HX+3.4,FZ+4.2]],3.6);vnFolk(16,2,6,8);vnFolk(HX,FZ+7,5,6);}

HL.def({key:'hl_rep_guild_astro',name:"Astronomers' Guild",branch:'republican',family:'Guilds',tags:Object.assign({type:['civic']},HRB_GUILD),w:42,d:22,h:24,build:buildHlRepGuildAstro});
HL.def({key:'hl_rep_guild_scav',name:"Salvagers' Guild",branch:'republican',family:'Guilds',tags:Object.assign({type:['civic','industry']},HRB_GUILD),w:72,d:48,h:28,build:buildHlRepGuildScav});
