// ================================================================= HIGHLANDS / REPUBLICAN — Astronomers' and Scavengers' guilds
// Round 5 (Travis): the orrery leaves the Mechanics' Guild for a guild of its own, and the Scavengers get a hall.
// Seeds 21101–21129 (R-B's block). Civic, lit.
//
// Astronomers' Guild: a stucco-and-half-timber hall painted with the heavens, an observatory dome with its slit and
// brass telescope at one end, and the ORRERY TOWER — an octagonal stone shaft carrying a wide open belvedere (posts
// well clear of the orrery's reach) in which the sky turns: the gilt sun, the green gas giant on its great ring, and
// round the giant Krator and two lesser moons. A sundial and an armillary sphere in the court.
//
// Scavengers' Guild: the guild of those who strip the Ancient ruins. A rubble-and-log hall under a salvaged metal
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
 kput('hOctS',[HX+5,0,FZ+3],null,[.7,.9,.7],ash);kput('hRBDisc',[HX+5,.95,FZ+3],null,[.75,.05,.75],hC(0xb8903a));
 kput('vPipeC',[HX+5,.95,FZ+3.1],qEuler(-.8,0,0),[.03,.7,.03],hC(0x7a5a2a));
 kput('hOctS',[HX-1.5,0,FZ+3],null,[.5,1.1,.5],ash);{const c=[HX-1.5,1.9,FZ+3];vBall('hGold',c[0],c[1],c[2],.1,hC(HPAL.gold[0]));
  for(const q of[qEuler(0,0,0),qEuler(Math.PI/2,0,0),qEuler(Math.PI/2,Math.PI/2,0),qEuler(.4,0,.4)])kput('hRBHoop',c,q,[.7,.7,1]);}
 hnRBLamps([[HX-2.6,FZ+4.6],[HX+2.6,FZ+4.6],[TX-2,TZ+5.8]],3.4);vnFolk(HX+1,FZ+4.4,3,3);}

function buildHlRepGuildScav(G,o){reseed(21111+(o.v|0));const HX=-7,HZ=-2,W=15,D=10,S=1,H1=3.6,H2=3,YX=8,YZ=-1;
 const rub=hC(vPick(HPAL.rubble)),log=hC(vPick(HPAL.pine)).multiplyScalar(.9),ash=hC(vPick(HPAL.ashlar)),tar=hC(vPick(HPAL.tar)),trim=hC(vPick([HPAL.teal,HPAL.red])),iron=hC(hRBIRON),lit=vLit()?'lit':'glass';
 vnReg("Scavengers' Guild",HX,HZ,9,14);vnReg("Scavengers' yard",YX,YZ,9.5,9);
 // the hall: rubble below, logs above, a salvaged metal roof, the gable faced with bleached Ancient panels
 vB('hRubB',HX,0,HZ,W,S+H1,D,0,rub);vB('vStone',HX,S+H1-.2,HZ,W+.2,.2,D+.2,0,ash);const FZ=HZ+D/2,y2=S+H1,y3=y2+H2;
 for(const u of[-5,-2.4,2.4,5])vnWin(HX+u,S+.8,FZ,0,1,1.9,lit,'vStone',ash,true);hnRBWins(HX,S+.8,HZ-D/2,Math.PI,W-2,4,1,1.9,lit,'vStone',ash);
 vnDoor(HX,S,FZ,0,1.8,2.8,'vStone',ash,tar,false);vnStairs(HX,0,FZ+.9,0,2.4,S,4,'vStone',ash);
 hnMural('hM_w_emblem',HX,S+3.05,FZ,0,2.2,1.1);
 hnLogBox(HX,y2,HZ,W,H2,D,0,log);for(const u of[-5,-1.7,1.7,5])hnNal(HX+u,y2+.7,FZ,0,.8,1.1,lit,trim);
 const top=hnGable(HX,y3,HZ,W,D,1.15,0,'hGableR',null,.7,'vGableP',null);
 for(let k=0;k<5;k++){const u=rr(-W/2+1,W/2-1),v=rr(-D/2+.8,D/2-.8);kput(vPick(['vPlate','vSheet','vPlateW']),[HX+u,y3+1.15*(D/2-Math.abs(v))+.26,HZ+v],qEuler(-Math.PI/2+Math.sign(v)*Math.atan(1.15),0,rr(-.15,.15)),[rr(1.2,2.2),rr(1,1.8),1],null);}
 for(const s of[-1,1])for(let k=0;k<3;k++)kput('vPlateW',[HX+s*(W/2+.06),y3+.5+k*.9,HZ+rr(-1,1)],qEuler(0,s*Math.PI/2,rr(-.08,.08)),[rr(1.6,2.6),.85,1],null);   // Ancient panels nailed on the gable
 hnStoneChimney(HX+3,top-1.5,HZ-2,2.2,.7);vnChimney(HX-4,top-1.2,HZ+1.5,2.4,.14,true);
 // the gate: two Ancient tank sections under a panel lintel, the guild's roundel on it
 const GX=YX,GZ=YZ+8;for(const s of[-1,1])vPst('vTankW',GX+s*2.6,0,GZ,.55,4.2,null);vB('vPanelB',GX,4.2,GZ,6.4,.8,1.2,0,null);
 kput(HMOTIF.sign.salvage,[GX,4.6,GZ+.62],null,[1.2,1.2,1],null);
 // the yard fence: plate on pipe posts, three sides + the front either side of the gate
 const segs=[[[YX-8,YZ-7],[YX+8,YZ-7]],[[YX+8,YZ-7],[YX+8,GZ]],[[YX-8,GZ],[YX-8,YZ-7]],[[YX-8,GZ],[GX-3.2,GZ]],[[GX+3.2,GZ],[YX+8,GZ]]];
 for(const [[ax,az],[bx,bz]] of segs){const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/2.2)),ry=Math.atan2(bx-ax,bz-az)+Math.PI/2;
  for(let i=0;i<=n;i++)vPst('vPipeR',ax+(bx-ax)*i/n,0,az+(bz-az)*i/n,.06,2.3,null);
  for(let i=0;i<n;i++){const t=(i+.5)/n;kput(vPick(['vPlate','vSheet','vPlate','vPlateW']),[ax+(bx-ax)*t,1.05+rr(-.08,.08),az+(bz-az)*t],qEuler(0,ry,rr(-.05,.05)),[L/n+.1,2+rr(-.2,.1),1],null);}}
 // sorted heaps
 const heap=(x,z,items,n,r)=>{const MH=r*.42;hnRCHeap(x,0,z,r*1.05,MH,hC(vPick([0x5a4a3e,0x6a5040,0x4a4038])),0);   // a mound of mixed scrap and earth
  for(let i=0;i<n;i++){const a=rng()*TAU,d=Math.sqrt(rng())*r*.9,sy=Math.max(0,MH*(1-d/(r*1.05))-.12);const it=vPick(items);   // sy: just under the mound's (conical) surface there
  if(it==='vPipeR')kput('vPipeR',[x+Math.cos(a)*d,sy+.05,z+Math.sin(a)*d],qEuler(Math.PI/2+rr(-.3,.3),rng()*TAU,0),[rr(.08,.2),rr(1.5,3),rr(.08,.2)],null);
  else if(it==='vTankR'){const tr=rr(.4,.7);kput('vTankR',[x+Math.cos(a)*d,sy+tr*.5,z+Math.sin(a)*d],qEuler(0,rng()*TAU,Math.PI/2).multiply(qEuler(0,0,0)),[tr,rr(1,2),tr],null);}
  else kput(it,[x+Math.cos(a)*d,sy+.04,z+Math.sin(a)*d],qEuler(0,rng()*TAU,0).multiply(qEuler(-Math.PI/2+rr(-.25,.25),0,0)),[rr(1,2.2),rr(.8,1.6),1],null);}};
 heap(YX-4.5,YZ-3.5,['vPlateW','vPlateW','vPlate'],26,2.6);heap(YX+.5,YZ-4,['vSheet','vPlate'],22,2.4);heap(YX+5,YZ-3.5,['vPipeR'],24,2.3);heap(YX+5,YZ+2.5,['vTankR','vPipeR'],8,2);
 // the gantry: two pipe A-frames, a beam, a chain and a panel on the hook
 const CX=YX-2.5,CZ=YZ+1.5,CH=5.2;for(const s of[-1,1]){beam('vPipeR',[CX+s*3.4,0,CZ-1.3],[CX+s*3.4,CH,CZ],.18,.18);beam('vPipeR',[CX+s*3.4,0,CZ+1.3],[CX+s*3.4,CH,CZ],.18,.18);}
 kput('vIron',[CX,CH+.12,CZ],null,[7.2,.3,.3],iron);vB('vIron',CX+.6,CH-.15,CZ,.5,.3,.4,0,iron);vPst('vRope',CX+.6,2.5,CZ,.03,2.5,hC(0x5a5048));kput('vPlateW',[CX+.6,1.7,CZ],qEuler(0,.3,.06),[2.2,1.4,1],null);
 // the weighbridge and its booth
 vB('vIron',YX+4,0,YZ+5.2,3,.12,2.2,0,iron);vB('vWood',YX+6.3,0,YZ+5.2,1.4,2.3,1.4,0,log);vnShedRoof(YX+6.3,2.3,YZ+5.2,1.6,1.6,.3,0,'hGableR',null,.15,.08);vnWin(YX+6.3,1,YZ+5.9,0,.6,.6,'open','vWood',tar);
 hnRCCart(YX-5.5,YZ+4.5,.4,tar,true);hnRCCart(GX+1,GZ+3,-.2,tar,true);
 hnRBLamps([[GX-3.6,GZ+.8],[GX+3.6,GZ+.8],[HX-2.4,FZ+2.4]],3.4);vnFolk(YX,YZ+2,4,4);vnFolk(HX,FZ+2.5,2,2);}

HL.def({key:'hl_rep_guild_astro',name:"Astronomers' Guild",branch:'republican',family:'Guilds',tags:Object.assign({type:['civic']},HRB_GUILD),w:42,d:22,h:24,build:buildHlRepGuildAstro});
HL.def({key:'hl_rep_guild_scav',name:"Scavengers' Guild",branch:'republican',family:'Guilds',tags:Object.assign({type:['civic','industry']},HRB_GUILD),w:36,d:22,h:14,build:buildHlRepGuildScav});
