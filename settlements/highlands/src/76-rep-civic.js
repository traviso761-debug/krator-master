// ================================================================= HIGHLANDS / REPUBLICAN — civic and military
// The public buildings of the Iron Republic's towns: stucco and ashlar on a stone socle with a great deal of timber
// above — loggias, galleries on carved posts, painted dougong under the eaves — and Russian rooflines (tents,
// onions, keel gables, bochka roofs, stacked tiers). Carving is formline: crest boards at the doors, friezes on
// the drums, animal totems of the gods and guilds in the precincts. Every def here is civic and electric (vLit()).
//   Temple (the pantheon church) · Civic: town hall + clocktower, hospital, city watch, theatre, school ·
//   Military: barracks, mustering ground. Seeds 20700–20999 (the guilds, 77-rep-guild.js, take 21000–21199).

// ---------------------------------------------------------------- R-B kit items (prefix hRB)
MAT.rbBronze=hStd({roughness:.45,metalness:.35});                    // bells, brass gears, orrery rings
MAT.rbDirt=vWorldUV(MAT.dirt.clone(),.125);                          // beaten earth (drill fields, yards, test range)
// bell: lathe, mouth radius 1 at y=0, crown at y=1 (hang it from the top)
kdef('hRBBell',new THREE.LatheGeometry([[.96,0],[1,.05],[.9,.13],[.74,.3],[.63,.55],[.6,.78],[.5,.92],[.3,.99],[0,1]].map(p=>new THREE.Vector2(p[0],p[1])),12),MAT.rbBronze);
// gear wheel: 18 teeth, five lightening holes; radius 1 (tip) in the xy plane, 1 thick along z, centred
function hRBGearGeo(n){const s=new THREE.Shape(),da=TAU/n;let first=true;
 for(let i=0;i<n;i++){const a=i*da;for(const [t,r] of [[a,.82],[a+da*.16,1],[a+da*.44,1],[a+da*.6,.82]]){const x=Math.cos(t)*r,y=Math.sin(t)*r;if(first){s.moveTo(x,y);first=false;}else s.lineTo(x,y);}}
 s.closePath();for(let k=0;k<5;k++){const a=k/5*TAU+.3,h=new THREE.Path();h.absarc(Math.cos(a)*.5,Math.sin(a)*.5,.19,0,TAU,true);s.holes.push(h);}
 return new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:5}).translate(0,0,-.5);}
const hRBGEAR=hRBGearGeo(18);kdef('hRBGear',hRBGEAR,MAT.rbBronze);kdef('hRBGearI',hRBGEAR,MAT.iron);
// arch panel: a 1 x 1 wall (y 0..1, z centred, 1 thick) pierced by a round-headed opening .64 wide, .87 high.
// Round when scaled with w ≈ h; the arcades, the clocktower base, gates.
function hRBArchShape(){const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(-.5,1);s.lineTo(.5,1);s.lineTo(.5,0);s.lineTo(.32,0);s.lineTo(.32,.55);
 s.absarc(0,.55,.32,0,Math.PI,false);s.lineTo(-.32,0);s.lineTo(-.5,0);return s;}
const hRBARCH=new THREE.ExtrudeGeometry(hRBArchShape(),{depth:1,bevelEnabled:false,curveSegments:12}).translate(0,0,-.5);
kdef('hRBArchS',hRBARCH,MAT.stone);kdef('hRBArchR',hRBARCH,MAT.rubbleW);kdef('hRBArchP',hRBARCH,MAT.plaster);kdef('hRBArchW',hRBARCH,MAT.wood);
// 16-sided open drums (theatre), a ring roof (a frustum, top radius .62), a flat annulus (gallery floors)
const hRBCYL=new THREE.CylinderGeometry(1,1,1,16,1,true).rotateY(Math.PI/16).translate(0,.5,0);
kdef('hRBCylW',hRBCYL,MAT.wood);kdef('hRBCylP',hRBCYL,MAT.plaster);kdef('hRBCylS',hRBCYL,MAT.rubbleW);
kdef('hRBRingSc',new THREE.CylinderGeometry(.62,1,1,16,1,true).rotateY(Math.PI/16).translate(0,.5,0),MAT.scale);
kdef('hRBAnn',new THREE.RingGeometry(.64,.985,16,1).rotateX(-Math.PI/2),MAT.wood);
// discs (axis along z, centred): targets, cart wheels, clock back-plates; a round clock face (diameter 1, faces +z)
const hRBDISC=new THREE.CylinderGeometry(1,1,1,18).rotateX(Math.PI/2);kdef('hRBDisc',hRBDISC,MAT.paint);kdef('hRBDiscW',hRBDISC,MAT.wood);
kdef('hRBClock',new THREE.CircleGeometry(.5,24),MAT.clock);
kdef('hRBHoop',new THREE.TorusGeometry(1,.035,5,32),MAT.rbBronze);
kdef('hRBBerm',vnWedgeGeo(.5,.35),MAT.turf);                          // earth berm / butt (a steep turfed wedge)
kdef('hRBDirt',VBOX,MAT.rbDirt);

// ---------------------------------------------------------------- R-B helpers (prefix hnRB)
const hRBIRON=0x2e2a26;
// arch panel standing on y, face toward ry
function hnRBArch(x,y,z,ry,w,h,d,item,c){kput(item||'hRBArchS',[x,y,z],qEuler(0,ry||0,0),[w,h,d],c||null);}
// a row of n windows centred on a face (x,z,ry = face centre + outward direction), len = the run they share
function hnRBWins(x,y,z,ry,len,n,w,h,kind,frame,c,skip){for(let i=0;i<n;i++){if(skip&&skip(i))continue;const p=loc(x,z,-len/2+len*(i+.5)/n,0,ry);vnWin(p[0],y,p[1],ry,w,h,kind,frame,c);}}
function hnRBNals(x,y,z,ry,len,n,w,h,kind,trim,o,skip){for(let i=0;i<n;i++){if(skip&&skip(i))continue;const p=loc(x,z,-len/2+len*(i+.5)/n,0,ry);hnNal(p[0],y,p[1],ry,w,h,kind,trim,o);}}
// ashlar quoins on a box of any material (hnStucco's corner stones without the render)
function hnRBQuoins(x,y,z,w,h,d,ry,qc){qc=qc||hC(vPick(HPAL.ashlar));const n=Math.floor(h/.6);for(let k=0;k<n;k++){const big=k%2===0;for(const sx of[-1,1])for(const sz of[-1,1]){
 const p=loc(x,z,sx*(w/2-(big?.28:.2)+.03),sz*(d/2+.03),ry);vB('vStone',p[0],y+k*.6,p[1],big?.62:.46,.56,.08,ry,qc);
 const q=loc(x,z,sx*(w/2+.03),sz*(d/2-(big?.2:.28)+.03),ry);vB('vStone',q[0],y+k*.6,q[1],.08,.56,big?.46:.62,ry,qc);}}}
// iron bars over a window opening
function hnRBBars(x,y,z,ry,w,h){for(let i=1;i<5;i++){const p=loc(x,z,-w/2+w*i/5,.2,ry);vB('vIron',p[0],y,p[1],.05,h,.05,ry,hC(hRBIRON));}
 const p=loc(x,z,0,.2,ry);vB('vIron',p[0],y+h*.5,p[1],w,.05,.05,ry,hC(hRBIRON));}
// iron-bound double door, shut: dark recess, two board leaves with iron straps and studs, stone or timber surround
function hnRBIronDoor(x,y,z,ry,w,h,frame,c,leafC){frame=frame||'vStone';const f=loc(x,z,0,.03,ry);vB('vDarkB',f[0],y,f[1],w,h,.1,ry);const I=hC(hRBIRON);
 for(const s of[-1,1]){const l=loc(x,z,s*w/4,.09,ry);vB('vWood',l[0],y,l[1],w/2-.04,h-.04,.08,ry,leafC||hC(vPick(HPAL.tar)));
  for(const t of[.18,.5,.82]){const b=loc(x,z,s*w/4,.14,ry);vB('vIron',b[0],y+h*t-.06,b[1],w/2-.12,.12,.03,ry,I);}
  const r=loc(x,z,s*.12,.16,ry);vBall('vBall',r[0],y+h*.5,r[1],.08,I);}
 for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.12),.12,ry);vB(frame,q[0],y,q[1],.24,h+.2,.24,ry,c);}
 const p=loc(x,z,0,.12,ry);vB(frame,p[0],y+h+.08,p[1],w+.6,.26,.3,ry,c);
 if(vLit())hnWallLamp(x,y+h+.6,z,ry);
 if(window.DOORS&&VERN.cur){const C=VERN.cur,sc=C.o.scale||1;const wp=loc(C.x,C.z,x*sc,z*sc,C.ry);DOORS.push({x:wp[0],z:wp[1],ry:ry+C.ry,y:(C.o.y||0)+y*sc,key:C.D.key});}}
// a bell hung from (x,y,z): headstock beam, bronze bell below
function hnRBBell(x,y,z,r,ry,c){kput('hRBBell',[x,y-.1-r*1.25,z],null,[r,r*1.25,r],c||hC(0xa0783a));vB('vWood',x,y-.12,z,r*1.8,.2,.22,ry||0,hC(0x3a2a20));
 vBall('vBall',x,y-.1-r*1.25-.12,z,r*.14,hC(hRBIRON));}
// gear wheel on a face: (x,y,z) centre, facing ry, radius r, thickness t
function hnRBGear(x,y,z,ry,r,t,iron,spin,c){kput(iron?'hRBGearI':'hRBGear',[x,y,z],vQ(ry,0,spin||0),[r,r,t],c||(iron?null:hC(0xb8903a)));
 const p=loc(x,z,0,t*.5,ry);kput('hRBDisc',[p[0],y,p[1]],qEuler(0,ry,0),[r*.2,r*.2,t*1.2],hC(hRBIRON));}
// flag on a mast: an iron pole, gilt ball, a painted flag with the formline crest on both faces
function hnRBFlag(x,y,z,ry,h,c,crest){vPst('vPipe',x,y,z,.07,h,hC(hRBIRON));vBall('hGold',x,y+h+.1,z,.14,hC(HPAL.gold[0]));
 const p=loc(x,z,1.05,0,ry);vB('hPaint',p[0],y+h-1.45,p[1],2,1.3,.04,ry,c||hC(HPAL.red));
 if(crest!==false)for(const s of[-1,1]){const q=loc(x,z,1.05,s*.03,ry);kput('hFormA',[q[0],y+h-.8,q[1]],qEuler(0,ry+(s<0?Math.PI:0),0),[1.4,.7,1],null);}}
// hazard pennant: a thin pole with a triangular pennant pointing along ry
function hnRBPennant(x,y,z,ry,h,c){vPst('vPost',x,y,z,.05,h,hC(0x4a3a2a));kput('hGablePaint',[x,y+h-.4,z],qEuler(0,ry,0).multiply(qEuler(Math.PI/2,0,0)),[.03,1.3,.6],c||hC(HPAL.red));}
// weapon rack: two trestles, a rail, spears leaning on it and a few round shields. Furniture, placed from the catalog
// (2.4 or 3.4 m); its shields drew a colour each.
function hnRBRack(x,z,ry,L){hlRngSkip(Math.floor(L/1.2));return hnFurn('hl_rep_weapon_rack',x,0,z,ry,{v:L>2.9?1:0},0,.155);}
// ranks of soldiers (the kit figure, in the Republic's dark red), n x m, facing +z of ry
function hnRBRanks(x,z,ry,n,m,dx,dz,c){c=c||hC(0x7a2a22);for(let i=0;i<n;i++)for(let j=0;j<m;j++){const p=loc(x,z,(i-(n-1)/2)*dx,(j-(m-1)/2)*dz,ry);
 kput('figB',[p[0],0,p[1]],qEuler(0,ry,0),1,c);kput('figH',[p[0],0,p[1]],null,1,hC(0xc9a17e));const g=loc(p[0],p[1],.24,.05,ry);kput('vWood',[g[0],1.2,g[1]],null,[.04,1.3,.04],hC(0x3a2a20));}}
// a tree: trunk and a few leaf masses
function hnRBTree(x,z,h){vPst('vPostB',x,0,z,.16,h*.55,hC(0x5a4632));for(let k=0;k<5;k++)kput('vLeaf',[x+rr(-.8,.8),h*rr(.55,.85),z+rr(-.8,.8)],null,[rr(1,1.5),rr(.9,1.3),rr(1,1.5)],hC(vPick([0x3f7a34,0x4f8a3a,0x2f6a2a])));}
// lamp posts at a list of local points (electric: only under vLit): the Republic's lamp standard from the catalog
function hnRBLamps(pts,h){if(!vLit())return;for(const [x,z] of pts)FURNISH('hl_rep_lamp_standard',x,0,z,0,{v:(h||3.4)>=3.8?1:0});}

// ================================================================= TEMPLE
// Round 7b (Travis: "redesign grand temple so it's more like this structure from the Izmailovo kremlin"): the
// pantheon as a great timber terem. Three stepped log tiers, each ringed by a gallery on bracketed posts under a flared
// skirt roof; steep gabled pavilions with lace bargeboards and painted pediments on every tier; a grand covered stair up
// the front to the first terrace; four corner turrets under harlequin tents; and on top the great oval dome in green
// and lime harlequin with a clock lantern and two spires. The gods still stand round the precinct as carved pillars.
function hnSkirt(y,w,d,out,drop,item,c,gap){const O=Array.isArray(out)?out:[out,out,out,out];   // O: front(+z), right(+x), back, left
 for(let k=0;k<4;k++){const a=k*Math.PI/2,o=O[k],dist=(k%2?w:d)/2,L=(k%2?d:w)+O[(k+1)%4]+O[(k+3)%4],th=Math.atan2(drop,o),len=o/Math.cos(th)+.15;
  const q=qEuler(0,a,0).multiply(qEuler(th,0,0)),yc=y-drop/2+.08;
  const seg=(u0,u1)=>{const p=loc(0,0,(u0+u1)/2,dist+o/2,a);kput(item,[p[0],yc,p[1]],q,[u1-u0,.16,len],c);};
  if(k===0&&gap){seg(-L/2,-gap);seg(gap,L/2);}else seg(-L/2,L/2);
  const e=loc(0,0,0,dist+o,a);vB('hPaint',e[0],y-drop-.2,e[1],L+.1,.2,.08,a,hC(HPAL.white));}}                       // white eave board
function buildHlRepTemple(G,o){reseed(20701+(o.v|0));const S=1.4;
 const log=hC(vPick(HPAL.pine)),sh=hC(0xb89a70),gold=hC(HPAL.gold[0]),ash=hC(vPick(HPAL.ashlar)),white=hC(HPAL.white),red=hC(HPAL.red),tar=hC(vPick(HPAL.tar)),teal=hC(HPAL.teal),lit=vLit()?'lit':'glass';
 const T=[{w:32,d:24,h:5.5},{w:24,d:17,h:4.6},{w:16,d:11,h:3.8}];let y=S;const ys=[];
 const stone=hC(vPick([0xd8ccb0,0xcfc2a4,0xe0d4b8,0xd0c8b4]));   // round 8 (Travis: "squatter, wider, and in stone"): ashlar tiers, the timber kept for galleries and gables
 vnReg('Temple of the Pantheon',0,0,24,30);
 hnSocle(0,0,-1,42,S,34,0,null,ash);
 // the tiers: ashlar blocks with quoins and a string course, each ringed by lattice windows; a gallery on bracketed posts round each under its skirt
 T.forEach((t,i)=>{ys.push(y);vB('vStone',0,y,0,t.w,t.h,t.d,0,stone);hnRBQuoins(0,y,0,t.w,t.h,t.d,0,ash);vB('vStone',0,y+t.h-.3,0,t.w+.3,.3,t.d+.3,0,ash);
  for(const [a,L] of[[0,t.w],[Math.PI/2,t.d],[Math.PI,t.w],[-Math.PI/2,t.d]]){const n=Math.max(2,Math.round(L/3.2));for(let k=0;k<n;k++){const u=-L/2+L*(k+.5)/n;if(i===0&&a===0&&Math.abs(u)<3)continue;
   const p=loc(0,0,u,(a===0||a===Math.PI?t.d:t.w)/2,a);hnNal(p[0],y+t.h*.38,p[1],a,.9,t.h*.34,lit,white,{keel:true});}}
  y+=t.h;});
 const yT=y;
 // skirts: tier 1 over a ground gallery (out 2.4, a gap for the stair), tiers 2 and 3 out over the terrace below
 const galleryRing=(yb,t,o,drop,gap)=>{const ds=.42;
  for(const [a,L,D] of[[0,t.w,t.d],[Math.PI/2,t.d,t.w],[Math.PI,t.w,t.d],[-Math.PI/2,t.d,t.w]]){const n=Math.max(3,Math.round((L+2*o)/3));
   for(let k=0;k<=n;k++){const u=-(L/2+o-.3)+(L+2*o-.6)*k/n;if(gap&&a===0&&Math.abs(u)<gap+.2)continue;const po=o-.35;const p=loc(0,0,u,D/2+po,a);
    const top=yb+t.h-drop*po/o-.9*ds-.05;const carved=(k%2===1);
    if(carved)hnPillar(p[0],yb,p[1],.16,top-yb,a,{});else{kput('hCol',[p[0],yb,p[1]],null,[.15,top-yb,.15],red);kput('hCol',[p[0],top-.24,p[1]],null,[.17,.18,.17],teal);}
    hnDougong(p[0],top,p[1],a,ds);}}};
 hnSkirt(ys[0]+T[0].h,T[0].w,T[0].d,2.4,1.1,'vShingleB',sh,3.2);galleryRing(ys[0],T[0],2.4,1.1,3.2);
 for(const s of[-1,1])for(const [a,L,D] of[[0,T[0].w,T[0].d],[Math.PI,T[0].w,T[0].d],[Math.PI/2,T[0].d,T[0].w],[-Math.PI/2,T[0].d,T[0].w]]){   // ground balustrade between the posts
  const p=loc(0,0,s*(L/4+(a===0?1.6:0)),D/2+2.05,a);kput('hLaceB',[p[0],S+.5,p[1]],qEuler(0,a,0),[a===0?L/2-3.4:L/2,.9,1],log);}
 for(let i=1;i<3;i++){const lo=T[i-1],t=T[i],ox=(lo.w-t.w)/2,oz=(lo.d-t.d)/2;hnSkirt(ys[i]+t.h,t.w,t.d,[oz+.7,ox+.7,oz+.7,ox+.7],1.0+.1*i,'vShingleB',sh);
  galleryRing(ys[i],{w:t.w,d:t.d,h:t.h},Math.min(ox,oz)+.3,1.0,0);
  for(const [a,L,D] of[[0,lo.w,lo.d],[Math.PI,lo.w,lo.d],[Math.PI/2,lo.d,lo.w],[-Math.PI/2,lo.d,lo.w]]){const p=loc(0,0,0,D/2-.15,a);kput('hLaceB',[p[0],ys[i]+.5,p[1]],qEuler(0,a,0),[L-.4,.9,1],log);vB('vWood',p[0],ys[i]+.95,p[1],L-.3,.1,.14,a,tar);}}   // terrace balustrades
 // the gabled pavilions (teremki): a log bay under a steep gable with lace bargeboards, a painted pediment and a window
 const pav=(u,a,dist,yb,w,h0,dep,pitch)=>{const c=loc(0,0,u,dist+dep/2-.4,a);vB('vStone',c[0],yb,c[1],w,h0,dep,a,stone);
  const r=pitch*w/2,top=hnGable(c[0],yb+h0,c[1],dep+.2,w,pitch,a+Math.PI/2,'vShingleB',sh,.5,'vGableW',log);
  hnBarge(c[0],yb+h0,c[1],dep+.2,w,r,a+Math.PI/2,.5,white,'lace');
  const f=loc(c[0],c[1],0,dep/2+.02,a);hnForm('hFormT',f[0],yb+h0+r*.22,f[1],a,w*.5,r*.42);
  const wv=loc(c[0],c[1],0,dep/2,a);hnNal(wv[0],yb+h0*.3,wv[1],a,Math.min(1.1,w*.3),h0*.45,lit,white);
  vPst('vIron',c[0],top,c[1],.04,1.2,hC(0x2e2a26));vBall('hGold',c[0],top+1.2,c[1],.18,gold);};
 pav(0,0,T[1].d/2,ys[1],7,2.4,3.2,1.9);for(const s of[-1,1])pav(s*8.5,0,T[0].d/2,ys[0]+T[0].h-.9,4.4,1.8,2.6,2);   // front: the great pediment above the stair, two on the first skirt
 for(const a of[Math.PI/2,-Math.PI/2,Math.PI])pav(0,a,(a===Math.PI?T[1].d:T[1].w)/2,ys[1],5.4,2.1,2.6,1.9);
 for(const a of[0,Math.PI/2,Math.PI,-Math.PI/2])pav(0,a,(a%Math.PI===0?T[2].d:T[2].w)/2,ys[2],4,1.8,2.2,1.9);
 // the grand stair: 30 steps from the forecourt to the first terrace, under stepped gable canopies on red posts
 {const Y0=0,rise=ys[1],steps=30,run=steps*.32,z1=T[0].d/2+.2,zc=z1+run/2;vnStairs(0,Y0,zc,0,4.6,rise,steps,'vStone',ash);   // from the forecourt up over the socle
  for(const s of[-1,1]){kput('hLaceB',[s*2.4,Y0+rise/2+.5,zc],qEuler(0,Math.PI/2,0).multiply(qEuler(0,0,s*0)),[run,.9,1],log);}
  for(let k=0;k<3;k++){const zz=z1+run*(k+.5)/3,yy=Y0+rise*(1-(k+.5)/3)+2.6;for(const sx of[-1,1])for(const sz of[-1,1]){const pz=zz+sz*run/6.4;const py=Y0+rise*(1-(pz-z1)/run);kput('hCol',[sx*2.3,py,pz],null,[.12,yy-py,.12],red);}
   const top=hnGable(0,yy,zz,run/3+.3,5.4,1.6,Math.PI/2,'vShingleB',sh,.4,'vGableW',log);hnBarge(0,yy,zz,run/3+.3,5.4,1.6*2.7,Math.PI/2,.4,white,'lace');}
  const land=loc(0,0,0,T[1].d/2+.1,0);vnDoor(land[0],ys[1],land[1],0,2,3,'hPaint',red,tar,false);hnEmblem(0,ys[1]+4.3,T[1].d/2+3.1,0,1.6);}
 // the ground porches flanking the stair: doors into the first tier under bochka roofs
 for(const s of[-1,1]){const x=s*9.5,z=T[0].d/2;vnDoor(x,S,z,0,1.8,2.8,'hPaint',red,tar,false);hnBochka(x,S+3.4,z+1.3,3,3.4,1.8,Math.PI/2,'hKeelSh',sh);
  for(const u of[-1.3,1.3])kput('hCol',[x+u,S,z+2.6],null,[.13,3.4,.13],red);hnForm('hFormA',x,S+3.55,z+2.95,0,2.2,1);}
 // the corner turrets: octagonal ashlar shafts through the skirts, harlequin tents, gold spires
 [[-1,1,'hTentTile'],[1,1,'hTentTileD'],[-1,-1,'hTentTileD'],[1,-1,'hTentTile']].forEach(([sx,sz,tent])=>{const x=sx*(T[0].w/2+.6),z=sz*(T[0].d/2+.6);
  kput('hOctS',[x,S,z],null,[2,9,2],stone);for(const yy of[S+2.4,S+6.2]){const ad=Math.atan2(sx,sz),p=loc(x,z,0,1.76,ad);hnNal(p[0],yy,p[1],ad,.55,1,lit,white,{keel:true});}
  kput('hOctW',[x,S+9,z],null,[2.3,.3,2.3],white);for(let k=0;k<8;k++){const a=k*Math.PI/4;const d=loc(x,z,0,2,a);hnDougong(d[0],S+8.3,d[1],a,.34);}
  kput(tent,[x,S+9.3,z],null,[2.5,5.2,2.5],null);vPst('vIron',x,S+14.4,z,.04,1.2,hC(0x2e2a26));vBall('hGold',x,S+15.3,z,.24,gold);});
 // the crown: an octagonal drum ringed by kokoshniki, the great harlequin dome, a clock lantern and two spires
 kput('hOctS',[0,yT,0],null,[6.4,1.6,5.2],stone);for(let k=0;k<8;k++){const a=k*Math.PI/4,p=loc(0,0,0,5.5,a);hnKokoshnik(p[0],yT+1.6,p[1],a,3.6,1.5,'hKeelSh',sh);}
 const yD=yT+1.6+.4;kput('hDomeTile',[0,yD,0],null,[9.6,7.2,6.8],null);vB('hPaint',0,yD-.2,0,19.6,.3,14,0,white);   // the long cushion dome, rounded-rectangle in plan
 {const UP=[[1.1,.38],[1.05,.52],[.95,.64],[.8,.75],[.6,.85],[.36,.93],[.14,.98],[0,1]],hAt=f=>{for(let i=0;i<UP.length-1;i++){const [r0,y0]=UP[i],[r1,y1]=UP[i+1];if(f<=r0&&f>=r1)return y0+(y1-y0)*(r0-f)/(r0-r1);}return 1;};
  let pv=null;for(let k=0;k<=8;k++){const x=-6.8+k*1.7,yy=yD+7.2*hAt(Math.abs(x)/9.6)+.02;vPst('vIron',x,yy,0,.03,.5,gold);vBall('hGold',x,yy+.56,0,.11,gold);if(pv)beam('hGoldB',[pv[0],pv[1]+.3,0],[x,yy+.3,0],.06,.06,gold);pv=[x,yy];}}   // gilt cresting along the ridge
 const yL=yD+7.2-.3;hnLogBox(0,yL,0,2.4,1.9,1.6,0,log,.12);kput('hClock',[0,yL+1,.83],null,[1.3,1.3,1],hC(0xffffff));kput('hTentTileD',[0,yL+1.9,0],null,[1.9,1.3,1.9],null);
 for(const s of[-1,1]){const x=s*1.9;kput('hOctW',[x,yL-.2,0],null,[.55,2.4,.55],red);kput('hTentTile',[x,yL+2.2,0],null,[.6,3.6,.6],null);
  vPst('vIron',x,yL+5.8,0,.03,.9,hC(0x2e2a26));kput('hDiscG',[x,yL+7.05,0],qEuler(Math.PI/2,0,0),[.55,.05,.55],gold);hnEmblem(x,yL+7.05,.04,0,.8);}
 // the precinct: the gods as carved pillars in a ring, the paved way, lamps
 [35,65,100,135,225,260,295,325].forEach((deg,k)=>{const a=deg*Math.PI/180,p=loc(0,0,0,23.2,a);vB('vStone',p[0],0,p[1],1.3,.25,1.3,a,ash);
  hnTotem(p[0],.25,p[1],.42,k%2?9:7.5,a,{wings:k%2?1.7:0,painted:k%2===0,hat:k%3===0});});
 vnPaving(0,0,23.4,7,3,0,ash,6);hnRBLamps([[-4.6,22.6],[4.6,22.6],[-14,19],[14,19]],3.6);
 vnFolk(3,23,3,2);vnFolk(-11,19,2,1.5);}

// The timber bell-and-clock tower (after Travis's clocktower reference): an arched rubble base with a great bell,
// three levels of braced oak framing hung with bells, clock faces on all four sides, exposed gearing, a skirt, an
// open lantern with a bell and a tented spire. Shared by the town hall and the Mechanics' Guild.
// o: {B base height, TH belfry height, roof, oak, tar, rub, ash, bigGear (a great wheel across the front, the
// Mechanics' version), gears (extra gear trains)}. Local frame; returns the spire tip y.
function hnRBClockTower(TX,TZ,o){const {B,TH,roof,oak,tar,rub,ash}=o;
 hnRBArch(TX,0,TZ+3.1,0,7,B,.8,'hRBArchR',rub);hnRBArch(TX,0,TZ-3.1,0,7,B,.8,'hRBArchR',rub);
 for(const s of[-1,1])hnRBArch(TX+s*3.1,0,TZ,Math.PI/2,5.4,B,.8,'hRBArchR',rub);
 for(const sx of[-1,1])for(const sz of[-1,1])vB('vStone',TX+sx*3.08,0,TZ+sz*3.08,1,B,1,0,ash);
 vB('vStone',TX,B,TZ,7.5,.45,7.5,0,ash);const y0=B+.45;vB('vStone',TX,0,TZ,5.4,.1,5.4,0,rub);
 for(const s of[-1,1]){vPst('vPost',TX+s*1.4,0,TZ,.14,3.1,oak);}vB('vWood',TX,3,TZ,3.2,.25,.3,0,oak);hnRBBell(TX,3,TZ,1.05);
 vnLadder(TX-2,0,TZ-1.8,Math.PI/2,B,oak);
 // the timber belfry: a core, corner and middle posts, level beams, braced bays
 vB('vWood',TX,y0,TZ,5,TH,5,0,tar);const LV=[0,3.6,7.3,TH];
 for(const sx of[-1,1])for(const sz of[-1,1])vB('vWood',TX+sx*3,y0,TZ+sz*3,.5,TH,.5,0,oak);
 for(let k=0;k<4;k++){const a=k*Math.PI/2,N=hRot(a,[0,0,1]);
  for(const u of[-1,1]){const p=loc(TX,TZ,u,3,a);vB('vWood',p[0],y0,p[1],.32,TH,.32,a,oak);}
  for(const l of LV){const p=loc(TX,TZ,0,3.05,a);vB('vWood',p[0],y0+l-(l?.3:0),p[1],6.7,.3,.4,a,oak);}
  for(let j=0;j<3;j++){const ya=y0+LV[j]+.3,yb=y0+LV[j+1]-.3;
   for(const [u0,u1] of[[-3,-1],[1,3]]){if(k===0&&j===1)continue;const A=hnOn(TX,ya,TZ,a,u0,3.2),Bp=hnOn(TX,yb,TZ,a,u1,3.2),C2=hnOn(TX,ya,TZ,a,u1,3.2),D2=hnOn(TX,yb,TZ,a,u0,3.2);
    hnMember('vWood',A,Bp,.2,.12,N,oak);hnMember('vWood',C2,D2,.2,.12,N,oak);}}
  // the clock: a timber back-plate, the face, a hood
  const c=loc(TX,TZ,0,3.32,a);kput('hRBDiscW',[c[0],y0+5.45,c[1]],qEuler(0,a,0),[1.85,1.85,.18],oak);
  const cf=loc(TX,TZ,0,3.43,a);kput('hRBClock',[cf[0],y0+5.45,cf[1]],qEuler(0,a,0),[3.2,3.2,1]);
  // bells on outriggers from the corner posts at the top level, and on the middle level off the side faces
  for(const s of[-1,1]){const r0=loc(TX,TZ,s*3,3.2,a),r1=loc(TX,TZ,s*3,4.5,a);vBeam([r0[0],y0+TH-.6,r0[1]],[r1[0],y0+TH-.6,r1[1]],.22,oak);
   hnRBBell(r1[0]-.0,y0+TH-.72,r1[1],rr(.34,.5),a);vB('vWood',r1[0],y0+TH-1.4,r1[1],.2,.8,.2,a,oak);}
  if(k>0)for(const s of[-1,1]){const r0=loc(TX,TZ,s*2,3.2,a),r1=loc(TX,TZ,s*2,4.1,a);vBeam([r0[0],y0+3.4,r0[1]],[r1[0],y0+3.4,r1[1]],.18,oak);hnRBBell(r1[0],y0+3.3,r1[1],rr(.28,.4),a);}}
 // exposed gearing on the front, a weight on a rope
 if(o.bigGear){hnRBGear(TX-.6,y0+2.1,TZ+3.45,0,1.9,.26,false,.15);hnRBGear(TX+1.95,y0+2.95,TZ+3.52,0,.85,.22,true,.4);hnRBGear(TX+2.05,y0+1.1,TZ+3.5,0,.55,.2,false,.2);
  for(let k=1;k<4;k++){const a=k*Math.PI/2;hnRBGear(...(p=>[p[0],y0+1.8,p[1]])(loc(TX,TZ,-1.3,3.42,a)),a,1.05,.22,k%2===0,.3*k);hnRBGear(...(p=>[p[0],y0+2.6,p[1]])(loc(TX,TZ,1.4,3.46,a)),a,.6,.2,k%2===1,.2);}}
 else{hnRBGear(TX-1.7,y0+2,TZ+3.38,0,.95,.22,false,.1);hnRBGear(TX-.2,y0+1.3,TZ+3.42,0,.62,.2,true,.3);hnRBGear(TX+1.7,y0+2.3,TZ+3.38,0,.8,.22,false,.5);}
 vPst('vRope',TX+2.6,y0+1.2,TZ+3.6,.025,TH-1.8,hC(0xb8a888));kput('vBarrel',[TX+2.6,y0+.55,TZ+3.6],null,[.18,.7,.18],hC(0x6a5a48));
 // skirt, lantern with a bell, spire
 const TOP=y0+TH;vnPyrRoof('hPyrSc',TX,TOP,TZ,6.6,6.6,3.6,0,roof,1.1);
 kput('hOctW',[TX,TOP+1.85,TZ],null,[2,.25,2],oak);for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;vPst('vPost',TX+Math.sin(a)*1.75,TOP+2.1,TZ+Math.cos(a)*1.75,.1,2.4,oak);}
 for(let k=0;k<8;k++){const a=k*Math.PI/4,p=loc(TX,TZ,0,1.68,a);kput('hLaceB',[p[0],TOP+2.55,p[1]],qEuler(0,a,0),[1.25,.8,1],oak);}
 hnRBBell(TX,TOP+4.35,TZ,.5);kput('hOctW',[TX,TOP+4.5,TZ],null,[2.15,.3,2.15],oak);
 const tip=hnTent(TX,TOP+4.8,TZ,2.25,7.8,'hTentSc',roof);vPst('vIron',TX,tip-.4,TZ,.05,1.6,hC(hRBIRON));vBall('hGold',TX,tip+.35,TZ,.2,hC(HPAL.gold[0]));return tip+1;}

// ================================================================= CIVIC
// Town hall: a stucco-and-half-timber hall on a rubble socle, the council chamber opening onto a timber loggia
// over a stone arcade under a lace-barged cross gable, dougong under the loggia; beside it the clocktower after
// the timber bell towers — an arched stone base, three storeys of heavy braced framing hung with bells, clock
// faces and exposed gears, a flared skirt, an open lantern with a bell and a needle spire.
function buildHlRepTownHall(G,o){reseed(20711+(o.v|0));const HX=-4,W=22,D=13,S=.9,H1=4.2,H2=3.8,TX=10.5,TZ=2.5,B=7.5,TH=11;
 const cream=hC(vPick(HPAL.stucco)),beamC=hC(vPick(HPAL.redwood)),roof=hC(vPick(HPAL.roofGreen)),ash=hC(vPick(HPAL.ashlar)),rub=hC(vPick(HPAL.rubble)),
  oak=hC(vPick(HPAL.tar)).multiplyScalar(1.45),tar=hC(vPick(HPAL.tar)),white=hC(HPAL.white),lit=vLit()?'lit':'glass';
 vnReg('Town hall',HX,0,12,18);vnReg('Clocktower',TX,TZ,5,33);
 hnSocle(HX,0,0,W,S,D,0);hnStucco(HX,S,0,W,H1,D,0,cream,ash);vB('vStone',HX,S+H1-.3,0,W+.3,.3,D+.3,0,ash);
 for(const x of[-13.2,-10.6,2.4,5])vnWin(x,S+.9,D/2,0,1.1,2.2,lit,'vStone',ash);
 hnRBWins(HX,S+.9,-D/2,Math.PI,W-2,7,1.1,2.2,lit,'vStone',ash);hnRBWins(HX-W/2,S+.9,0,-Math.PI/2,D-3,3,1.1,2.2,lit,'vStone',ash);
 const y3=S+H1+H2;hnFachBox(HX,S+H1,0,W,H2,D,0,cream,beamC,lit);
 for(const s of[-1,1])hnFrieze(HX+s*8,y3-.5,D/2+.04,0,5.6,.45);
 const top=hnGable(HX,y3,0,W,D,1.25,0,'hGableSc',roof,.7,'vGablePl',cream);hnBarge(HX,y3,0,W,D,1.25*D/2,0,.7,white,'lace');
 // the council risalit: stone arcade below, timber loggia above, cross gable with the crest of the town
 vB('vStone',HX,0,D/2+1.6,9,S,3.2,0,ash);vnStairs(HX,0,9.7+.64,0,6,S,4,'vStone',ash);
 for(const u of[-3,0,3])hnRBArch(HX+u,S,9.35,0,3,H1,.7,'hRBArchS',ash);for(const s of[-1,1])hnRBArch(HX+s*4.15,S,7.75,Math.PI/2,2.5,H1,.7,'hRBArchS',ash);
 vnDoor(HX,S,D/2,0,1.8,3.1,'vStone',ash,oak,false);for(const u of[-3,3])vnWin(HX+u,S+.9,D/2,0,1.1,2.2,lit,'vStone',ash);
 vB('vWood',HX,S+H1-.05,8.1,9.3,.3,3.4,0,oak);
 const posts=[-4.1,-1.4,1.4,4.1];for(const u of posts)hnTotemPost(HX+u,S+H1+.25,9.35,.2,3,0,true);
 for(let i=0;i<3;i++){const u=(posts[i]+posts[i+1])/2,w=posts[i+1]-posts[i]-.45;if(i===1)hnForm('hFormA',HX+u,S+H1+.3,9.35,0,w,1);else kput('hLaceB',[HX+u,S+H1+.8,9.4],null,[w,.95,1],oak);}
 for(const s of[-1,1])kput('hLaceB',[HX+s*4.3,S+H1+.8,8.1],qEuler(0,Math.PI/2,0),[2.4,.95,1],oak);
 hnBracketRow(HX,S+H1+3.25,9.35,0,9,4,.62);
 hnGable(HX,y3,5.55,8.7,9.6,1.25,Math.PI/2,'hGableSc',roof,.5,'vGablePl',cream);hnBarge(HX,y3,5.55,8.7,9.6,6,Math.PI/2,.5,white,'lace');
 hnForm('hFormT',HX,y3+.8,9.9,0,4,2);
 // dormers and chimneys
 for(const x of[HX-7.6,HX+7.6]){vB('vPlaster',x,y3+2.3,3.2,1.6,1.9,1.6,0,cream);vnWin(x,y3+2.8,4,0,.7,.8,lit,'vWood',beamC);vnGableRoof(x,y3+4.2,3.2,1.6,1.8,.9,Math.PI/2,'hGableSc',roof,.15);}
 hnStoneChimney(HX-8,y3+3,-2.5,5.8,.8);hnStoneChimney(HX+3,y3+3,-2.5,5.8,.8);
 hnRBClockTower(TX,TZ,{B,TH,roof,oak,tar,rub,ash});
 // the square: paving, a fountain, flags of the Republic, lamps
 vnPaving(HX+2,0,14,20,6,0,ash,14);
 FURNISH('hl_rep_fountain',HX+2,0,14.2,0);
 for(const s of[-1,1])hnRBFlag(HX+s*5.2,0,11.2,0,8,hC(vPick([HPAL.red,HPAL.teal])));
 hnRBLamps([[HX-3.4,11],[HX+3.4,11],[TX,TZ+5.2]],3.4);
 vnFolk(HX+2,15,4,4);}

// Hospital: long two-storey ward wings round a garden court — stucco ground floor, half-timber wards above, many
// windows — entered through a small chapel pavilion with keel gables and a green onion dome.
function buildHlRepHospital(G,o){reseed(20721+(o.v|0));const S=.6,H1=3.6,H2=3.2,P=1.1,y2=S+H1,y3=y2+H2;
 const cream=hC(vPick(HPAL.stucco)),beamC=hC(vPick(HPAL.redwood)),roof=hC(vPick(HPAL.roofRed)),ash=hC(vPick(HPAL.ashlar)),grn=hC(vPick(HPAL.roofGreen)),
  white=hC(HPAL.white),oak=hC(vPick(HPAL.tar)).multiplyScalar(1.4),lit=vLit()?'lit':'glass';
 vnReg('Hospital',0,-1,18,13);vnReg('Hospital chapel',0,10.2,4.5,15);
 // back ward wing (ridge along x) and the two side wings (ridge along z)
 hnSocle(0,0,-12,36,S,8);hnStucco(0,S,-12,36,H1,8,0,cream,ash);hnFachBox(0,y2,-12,36,H2,8,0,cream,beamC,lit);
 hnGable(0,y3,-12,36,8,P,0,'hGableSc',roof,.6,'vGablePl',cream);hnBarge(0,y3,-12,36,8,P*4,0,.6,white,'lace');
 hnRBWins(0,S+.8,-16,Math.PI,34,12,1,1.8,lit,'vStone',ash);hnRBWins(0,S+.8,-8,0,18,6,1,1.8,lit,'vStone',ash);
 for(const s of[-1,1]){const x=s*14;hnSocle(x,0,1,8,S,18);hnStucco(x,S,1,8,H1,18,0,cream,ash);hnFachBox(x,y2,1,8,H2,18,0,cream,beamC,lit);
  hnGable(x,y3,-1,22,8,P,Math.PI/2,'hGableSc',roof,.6,'vGablePl',cream);hnBarge(x,y3,-1,22,8,P*4,Math.PI/2,.6,white,'lace');
  hnForm('hFormT',x,y3+.7,10+.02,0,2.8,1.3);
  hnRBWins(s*18,S+.8,1,s*Math.PI/2,16,6,1,1.8,lit,'vStone',ash);hnRBWins(s*10,S+.8,1,-s*Math.PI/2,16,5,1,1.8,lit,'vStone',ash,i=>i===3);
  vnDoor(s*10,S,6.3,-s*Math.PI/2,1.3,2.4,'vStone',ash,oak);vB('vStone',s*10.5,0,6.3,1,S,1.8,0,ash);
  for(const u of[-2,2])vnWin(x+u,S+.8,10,0,1,1.8,lit,'vStone',ash);
  for(const u of[-5,3])hnStoneChimney(x+.9,y3+2,u,3.4,.7);}
 for(const u of[-9,0,9])hnStoneChimney(u,y3+2,-13,3.4,.7);
 // the court: an arcaded wall either side of the chapel, paths, beds, trees, a well
 for(const s of[-1,1]){for(const u of[-1.62,1.62])hnRBArch(s*6.75+u,0,9.6,0,3.25,3.3,.5,'hRBArchP',cream);vB('vStone',s*6.75,3.3,9.6,6.6,.22,.8,0,ash);vnGableRoof(s*6.75,3.52,9.6,6.5,.8,.35,0,'hGableSc',roof,.12);}
 vnPaving(0,0,1.5,3,15,0,ash,8);vnPaving(0,0,1.5,18,2.4,0,ash,8);
 for(const sx of[-1,1])for(const sz of[-1,1]){hnPlanter(sx*5,0,1.5+sz*4.2,4,2.4,0,oak);hnRBTree(sx*7.5,1.5+sz*5.6,5);}
 FURNISH('hl_rep_civic_well',0,0,1.5,0,{v:0});
 for(const s of[-1,1])FURNISH('hl_rep_door_bench',s*3.2,0,-6.8,0,{v:1});
 // the chapel pavilion: stucco cube, keel gables, a green onion; porch on carved posts
 hnSocle(0,0,10.2,7,S,7);hnStucco(0,S,10.2,7,5,7,0,white,ash);
 for(let k=0;k<4;k++){const a=k*Math.PI/2,p=loc(0,10.2,0,3.62,a);hnKokoshnik(p[0],S+5,p[1],a,5,2.8,'hKeelSc',grn);
  if(k===1||k===3){const w=loc(0,10.2,0,3.5,a);vnWin(w[0],S+1.2,w[1],a,1,2.2,lit,'vStone',ash);}}
 vnPyrRoof('hPyrSc',0,S+5,10.2,7,7,2.6,0,grn,.3);hnOnion(0,S+6.6,10.2,1.7,'Sc',grn,2.2,'hOctP',white);
 vnDoor(0,S,13.7,0,1.8,2.8,'vStone',ash,oak,false);
 vB('vStone',0,0,14.6,3.6,S,1.8,0,ash);vnStairs(0,0,15.5+.48,0,3,S,3,'vStone',ash);
 for(const s of[-1,1])hnTotemPost(s*1.5,S,15.2,.16,2.8,0,true);hnBracketRow(0,S+2.85,15.2,0,3.4,2,.5);vnHipRoof('hHipSc',0,S+3.45,14.5,3.4,1.8,1,0,grn,.35);
 hnForm('hFormA',0,S+3.15,13.7,0,2.2,1);
 hnRBLamps([[-3,16.5],[3,16.5]],3.2);vnFolk(0,3,3,5);vnFolk(3,17,2,1.5);}

// City watch: a stone ground floor with barred cell windows and an iron-bound door, a tarred-log watch room above
// under a steep slate gable, and a tall log lookout tower with a bell under a shingle tent.
function buildHlRepWatch(G,o){reseed(20731+(o.v|0));const BX=2.5,W=13,D=9,H1=3.8,H2=3.2,TX=-7,TZ=-1,TH=14;
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),tar=hC(vPick(HPAL.tar)).multiplyScalar(1.15),slate=hC(vPick(HPAL.slate)),red=hC(HPAL.red),sh=hC(vPick(HPAL.shingle)),lit=vLit()?'lit':'glass';
 vnReg('City watch house',BX,0,8,13);vnReg('Watch tower',TX,TZ,3.5,24);
 vB('hRubB',BX,0,0,W,H1,D,0,rub);hnRBQuoins(BX,0,0,W,H1,D,0,ash);vB('vStone',BX,H1-.2,0,W+.3,.25,D+.3,0,ash);
 for(const u of[-4.6,-2.4,2.4,4.6]){vnWin(BX+u,1.5,D/2,0,.7,.9,'glass','vStone',ash);hnRBBars(BX+u,1.5,D/2,0,.7,.9);}
 for(const s of[-1,1])for(const z of[-2.2,2.2]){const x=BX+s*W/2;vnWin(x,1.5,z,s*Math.PI/2,.7,.9,'glass','vStone',ash);hnRBBars(x,1.5,z,s*Math.PI/2,.7,.9);}
 hnRBWins(BX,1.5,-D/2,Math.PI,W-2,4,.7,.9,'glass','vStone',ash);
 hnRBIronDoor(BX,.25,D/2,0,1.8,2.6,'vStone',ash);vB('vStone',BX,0,D/2+.5,3,.25,1,0,ash);hnForm('hFormA',BX,3.05,D/2,0,2.4,.7);
 hnLogBox(BX,H1,0,W,H2,D,0,tar);hnRBNals(BX,H1+.9,D/2,0,W-1,4,.8,1.2,lit,red,{shutters:true});
 for(const s of[-1,1])hnRBNals(BX+s*W/2,H1+.9,0,s*Math.PI/2,D-2,2,.8,1.2,lit,red,{});
 const top=hnGable(BX,H1+H2,0,W,D,1.2,0,'hGableSc',slate,.7,'hGableLog',tar);hnBarge(BX,H1+H2,0,W,D,1.2*D/2,0,.7,red,'lace');
 hnStoneChimney(BX+3.5,H1+H2+1,-1.6,4.8,.7);
 for(const u of[-3.2,3.2]){vB('vWood',BX+u,8.5,2.4,1.4,1.6,1.6,0,tar);vnWin(BX+u,8.85,3.2,0,.6,.7,lit,'vWood',red);vnGableRoof(BX+u,10.1,2.4,1.4,1.8,.8,Math.PI/2,'hGableSc',slate,.15);}
 // the lookout tower
 hnSocle(TX,0,TZ,4.6,1.2,4.6,0,rub,ash);hnLogBox(TX,1.2,TZ,4,TH,4,0,tar);
 vnDoor(TX,1.2,TZ+2,0,1,2.1,'vWood',tar);vnStairs(TX,0,TZ+2.3+.64,0,1.4,1.2,4,'vWood',tar);
 for(let y=5;y<TH;y+=3.8)for(let k=0;k<3;k++){const a=k*Math.PI/2,p=loc(TX,TZ,0,2,a);vnWin(p[0],y,p[1],a,.35,.9,'open','vWood',tar);}
 const PY=TH+1.2;for(let k=0;k<4;k++){const a=k*Math.PI/2;for(const u of[-1.4,1.4]){const A=hnOn(TX,PY-2.2,TZ,a,u,2.05),Bp=hnOn(TX,PY-.1,TZ,a,u,2.9);beam('vWood',A,Bp,.18,.18,tar);}}
 vB('vWood',TX,PY,TZ,6,.3,6,0,tar);const FY=PY+.3;
 for(const u of[-2.85,0,2.85])for(const v of[-2.85,0,2.85]){if(u===0&&v===0)continue;vPst('vPost',TX+u,FY,TZ+v,.1,2.6,tar);}
 for(let k=0;k<4;k++){const a=k*Math.PI/2,p=loc(TX,TZ,0,2.85,a);kput('hLaceB',[p[0],FY+.5,p[1]],qEuler(0,a,0),[5.6,.95,1],red);vB('vWood',p[0],FY+2.5,p[1],6,.2,.2,a,tar);}
 vB('vWood',TX,FY+2.3,TZ,5.8,.2,.25,0,tar);hnRBBell(TX,FY+2.3,TZ,.55);
 const tip=hnTent(TX,FY+2.6,TZ,3.7,6.4,'hTentSh',sh);vPst('vIron',TX,tip-.3,TZ,.04,1.2,hC(hRBIRON));vBall('hGold',TX,tip+.3,TZ,.15,hC(HPAL.gold[0]));
 kput('figB',[TX+1.6,FY,TZ+1.8],qEuler(0,.4,0),1,hC(0x7a2a22));kput('figH',[TX+1.6,FY,TZ+1.8],null,1,hC(0xc9a17e));
 // the yard: stocks, a notice board, a rack of halberds, a lamp
 FURNISH('hl_rep_stocks',BX+8,0,6.5,0);FURNISH('hl_rep_notice_board',BX+5.3,0,D/2+1.3,0);
 hnRBRack(TX+2.8,TZ+4.2,0,2.4);hnRBLamps([[BX-3,D/2+2.5],[BX+10,3]],3.2);vnFolk(BX,D/2+3,2,2);}

// Theatre: a round timber playhouse — a galleried sixteen-sided drum with formline friezes and dougong under a
// shingled ring roof, open to the sky over the yard; the stage house rises behind under a tall tent, and the
// entrance is a porch on painted totem posts under a keel roof.
function buildHlRepTheater(G,o){reseed(20741+(o.v|0));const R=14,DH=10.5,DZ=-1.5,A=R*Math.cos(Math.PI/16),F=2*R*Math.sin(Math.PI/16);
 const wood=hC(vPick(HPAL.pine)).multiplyScalar(.9),tar=hC(vPick(HPAL.tar)).multiplyScalar(1.3),rub=hC(vPick(HPAL.rubble)),sh=hC(vPick(HPAL.shingle)),
  roofC=hC(vPick(HPAL.roofRed)),cream=hC(vPick(HPAL.stucco)),beamC=hC(vPick(HPAL.redwood)),ash=hC(vPick(HPAL.ashlar)),white=hC(HPAL.white),lit=vLit()?'lit':'glass';
 vnReg('Theatre',0,DZ,15,14);vnReg('Stage house',0,-11.5,6.5,28);
 kput('hRBCylW',[0,0,DZ],null,[R,DH+.55,R],wood);kput('hRBCylS',[0,0,DZ],null,[R+.12,1,R+.12],rub);
 for(let k=0;k<16;k++){const a=k*Math.PI/8,p=loc(0,DZ,0,A,a),v=loc(0,DZ,0,R+.05,a+Math.PI/16);
  vPst('vPost',v[0],1,v[1],.2,DH-1,tar);
  for(const y of[3.2,6.7])hnFrieze(p[0],y,p[1],a,F-.35,.5);hnFrieze(p[0],DH-.75,p[1],a,F-.35,.7);
  if(k>=7&&k<=9)continue;
  for(const u of[-1.3,1.3]){const w=loc(0,DZ,u,A,a);vnWin(w[0],4.4,w[1],a,.6,1.2,'glass','vWood',tar);vnWin(w[0],7.6,w[1],a,.8,1.5,lit,'vWood',tar);}
  hnDougong(p[0],DH-.52,p[1],a,.6);
  if(k===4||k===12){vnDoor(p[0],0,p[1],a,1.5,2.4,'vWood',tar,tar);}
  else if(k===1||k===15){hnForm('hFormV',p[0],1.3,p[1],a,1.1,1.7);const q=loc(0,DZ,1.3*(k===1?-1:1),A,a);hnForm('hFormW',q[0],1.4,q[1],a,1.2,1.5);}}
 kput('hRBRingSc',[0,DH-.15,DZ],null,[R+.9,3,R+.9],sh);kput('hRBCylP',[0,DH-.3,DZ],null,[9.2,3.2,9.2],white);
 for(let k=0;k<16;k++){const a=k*Math.PI/8,p=loc(0,DZ,0,9.2*Math.cos(Math.PI/16)-.02,a);hnFrieze(p[0],DH+.4,p[1],a+Math.PI,3.4,.8);}
 // inside: gallery floors, posts and rails on the yard side, the yard, the stage under its keel canopy
 for(const y of[3.5,7])kput('hRBAnn',[0,y,DZ],null,[R,1,R],tar);
 for(let k=0;k<16;k++){const a=k*Math.PI/8,v=loc(0,DZ,0,9.05,a+Math.PI/16);vPst('vPost',v[0],0,v[1],.15,DH,tar);
  if(k>=7&&k<=9)continue;const p=loc(0,DZ,0,8.95,a);for(const y of[3.5,7])kput('hLaceB',[p[0],y+.5,p[1]],qEuler(0,a+Math.PI,0),[3.4,.95,1],beamC);}
 vB('hRBDirt',0,0,DZ,17,.05,17,0,hC(0xd8c8a8));
 vB('vWood',0,0,-5.75,9,1.4,3.5,0,tar);vB('vWood',0,1.4,-5.75+1.3,.9,.02,.9,0,hC(0x2a2018));
 for(const s of[-1,1])hnTotemPost(s*4,1.4,-4.3,.2,4.6,0,true);
 hnBochka(0,6.2,-5.9,9.8,3.8,1.9,0,'hKeelSc',roofC);hnForm('hFormA',0,6.25,-3.95,0,3.4,1.3);
 // the stage house: stucco below, half-timber above, a dark stage opening, the tent roof and a flag
 hnStucco(0,0,-11.5,11,7.5,8,0,cream,ash);hnFachBox(0,7.5,-11.5,11,3.8,8,0,cream,beamC,lit);hnFachBox(0,11.3,-11.5,11,3.8,8,0,cream,beamC,lit);
 vB('vDarkB',0,1.4,-7.46,7.4,4.6,.1,0,null);for(const s of[-1,1])vB('vStone',s*3.95,1.4,-7.4,.5,4.8,.25,0,ash);vB('vStone',0,6,-7.4,8.4,.5,.25,0,ash);
 vB('hPaint',0,6,-7.3,7.4,.02,.02,0,hC(HPAL.red));for(let i=0;i<7;i++)kput('hPaint',[-3.2+i*1.07,5.3,-7.36],null,[.9,1.2,.05],hC(i%2?HPAL.red:0x8a2420));
 const t=hnTent(0,15.1,-11.5,7.1,9.5,'hTentSc',roofC);hnOnion(0,t-1.2,-11.5,.6,'G',hC(HPAL.gold[0]),.6,'hOctP',cream);hnRBFlag(0,t+.8,-11.5,0,2.4,hC(HPAL.teal));
 // the entrance porch
 const PZ=DZ+A;vB('vStone',0,0,PZ+1.7,7.6,.2,3.6,0,ash);vnDoor(0,.2,PZ,0,2,2.8,'hPaint',hC(HPAL.red),tar,false);
 for(const u of[-3.2,-1.2,1.2,3.2])hnTotemPost(u,.2,PZ+3.1,.2,3.6,0,Math.abs(u)<2);
 hnBracketRow(0,3.8,PZ+3.1,0,7.2,4,.55);hnBochka(0,4.45,PZ+1.3,4.8,7.8,2.9,Math.PI/2,'hKeelSc',roofC);hnForm('hFormT',0,4.7,PZ+3.72,0,3.4,1.5);
 hnRBLamps([[-4.6,PZ+4.3],[4.6,PZ+4.3],[-10,PZ-1],[10,PZ-1]],3.4);vnFolk(0,PZ+5.5,4,3.5);vnFolk(0,DZ+2,6,4);}

// Schoolhouse: a pine log school on a stone socle, a row of nalichnik windows, a kryltso porch, an open bell turret
// on the ridge; a fenced yard with a swing, a seesaw, a slate board, benches and children.
function buildHlRepSchool(G,o){reseed(20751+(o.v|0));const W=16,D=8,S=.7,H=3.4,Z=-2;
 const log=hC(vPick(HPAL.pine)),grn=hC(vPick(HPAL.roofGreen)),white=hC(HPAL.white),trim=hC(vPick([HPAL.teal,HPAL.blue,HPAL.red])),oak=hC(vPick(HPAL.tar)).multiplyScalar(1.3),lit=vLit()?'lit':'glass';
 vnReg('Schoolhouse',0,Z,9,13.5);
 hnSocle(0,0,Z,W+.3,S,D+.3);hnLogBox(0,S,Z,W,H,D,0,log);
 hnRBNals(0,S+.85,Z+D/2,0,W-.4,6,.9,1.4,lit,white,{accent:trim},i=>false);
 for(const s of[-1,1])hnRBNals(s*W/2,S+.85,Z,s*Math.PI/2,D-2,2,.9,1.4,lit,white,{accent:trim});
 hnRBNals(0,S+.85,Z-D/2,Math.PI,W-2,5,.9,1.4,lit,white,{});
 const top=hnGable(0,S+H,Z,W,D,1.2,0,'hGableSc',grn,.7,'hGableLog',log);hnBarge(0,S+H,Z,W,D,1.2*D/2,0,.7,white,'lace');
 for(const s of[-1,1])hnForm('hFormT',s*(W/2+.02),S+H+.7,Z,s*Math.PI/2,2.6,1.2);
 // porch: the door sits between the middle windows
 vnDoor(0,S,Z+D/2,0,1.1,2.2,'hPaint',white,oak,false);hnKryltso(0,0,Z+D/2,0,1.4,S,'hKeelSc',grn,log);
 // the bell turret on the ridge
 vB('vWood',0,top-1.3,Z,1.6,1.6,1.6,0,log);for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*.68,top+.3,Z+sz*.68,.08,1.7,log);
 kput('hLaceB',[0,top+.62,Z+.8],null,[1.5,.6,1],white);hnRBBell(0,top+1.9,Z,.34);
 const tt=hnTent(0,top+2,Z,1.3,2.3,'hTentSc',grn);kput('hOnionG',[0,tt-.25,Z],null,[.2,.5,.2],hC(HPAL.gold[0]));
 hnStoneChimney(4.5,S+H+2,Z-1.2,3.6,.6);
 // the yard
 vnFence(0,0,2.5,25,19,0,log,2.4,1.2);vnPaving(0,0,8.5,2,6,0,hC(vPick(HPAL.ashlar)),5);
 FURNISH('hl_rep_swing',-6,0,7,0,{v:1});FURNISH('hl_rep_swing',6,0,7,0,{v:0});FURNISH('hl_rep_slate_board',3.2,0,9.6,0);   // seesaw, swing, slate board
 for(const x of[-9,9])FURNISH('hl_rep_door_bench',x,0,4.5,0,{v:2});hnRBTree(-9.5,-8,5.5);hnWoodpile(9.6,0,Z-1,Math.PI/2,4,1.4);
 for(let i=0;i<7;i++){const x=rr(-8,8),z=rr(4,10);kput('figB',[x,0,z],qEuler(0,rng()*TAU,0),.66,hC(vPick([0xc9442a,0x2f8f8a,0x3b4a8a,0xe0a030,0xe8d9b8])));kput('figH',[x,0,z],null,.66,hC(0xc9a17e));}
 vnFolk(2.4,8.6,1,.3);hnRBLamps([[-1.8,12.5],[1.8,12.5]],3);}

// ================================================================= MILITARY
// Barracks: three long two-storey blocks round a drill yard — rubble ground storey, tarred-log upper storey, slate
// gables — closed at the front by a crenellated wall and a gatehouse (stone arch, log guard room, tent roof,
// dougong and the crest of the legion); a squat stone armoury with an iron door inside the yard.
function buildHlRepBarracks(G,o){reseed(20761+(o.v|0));const H1=3.4,H2=3,P=1.1;
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),tar=hC(vPick(HPAL.tar)).multiplyScalar(1.15),slate=hC(vPick(HPAL.slate)),red=hC(HPAL.red),lit=vLit()?'lit':'glass';
 vnReg('Barracks',0,-3,21,11);vnReg('Barracks gatehouse',0,13.6,4,14);
 const block=(x,z,w,d)=>{vB('hRubB',x,0,z,w,H1,d,0,rub);hnRBQuoins(x,0,z,w,H1,d,0,ash);vB('vStone',x,H1-.2,z,w+.3,.25,d+.3,0,ash);hnLogBox(x,H1,z,w,H2,d,0,tar);};
 block(0,-15,40,8);hnGable(0,H1+H2,-15,40,8,P,0,'hGableSc',slate,.6,'hGableLog',tar);
 hnRBWins(0,1.2,-11,0,22,8,.8,1.2,'glass','vStone',ash,i=>i===3||i===4);vnDoor(0,0,-11,0,1.6,2.4,'vStone',ash,tar);hnForm('hFormA',0,2.75,-11,0,2.2,.6);
 hnRBNals(0,H1+.8,-11,0,38,12,.7,1.1,lit,red,{});hnRBNals(0,H1+.8,-19,Math.PI,38,12,.7,1.1,lit,red,{});hnRBWins(0,1.4,-19,Math.PI,38,12,.5,.9,'glass','vStone',ash);
 for(const s of[-1,1]){const x=s*16;block(x,1.5,8,25);hnGable(x,H1+H2,-.5,29,8,P,Math.PI/2,'hGableSc',slate,.6,'hGableLog',tar);hnBarge(x,H1+H2,-.5,29,8,P*4,Math.PI/2,.6,red,'lace');
  hnForm('hFormT',x,H1+H2+.6,14.02,0,2.6,1.2);for(const u of[-2,2])vnWin(x+u,1.4,14,0,.6,1,'glass','vStone',ash);
  hnRBWins(s*12,1.2,1.5,-s*Math.PI/2,22,7,.8,1.2,'glass','vStone',ash,i=>i===1||i===5);for(const z of[-5.8,8.8])vnDoor(s*12,0,z,-s*Math.PI/2,1.4,2.3,'vStone',ash,tar);
  hnRBNals(s*12,H1+.8,1.5,-s*Math.PI/2,23,7,.7,1.1,lit,red,{});hnRBNals(s*20,H1+.8,1.5,s*Math.PI/2,23,7,.7,1.1,lit,red,{});hnRBWins(s*20,1.4,1.5,s*Math.PI/2,23,7,.5,.9,'glass','vStone',ash);
  hnStoneChimney(x+1,H1+H2+2,-6,3.4,.7);hnStoneChimney(x+1,H1+H2+2,6,3.4,.7);}
 for(const x of[-10,10])hnStoneChimney(x,H1+H2+2,-16,3.4,.7);
 // front wall with merlons, the gatehouse
 for(const s of[-1,1]){const x=s*7.6;vB('hRubB',x,0,13.6,8.8,4,.9,0,rub);vB('vStone',x,4,13.6,9,.2,1.1,0,ash);for(let i=0;i<7;i++)vB('hRubB',x-3.9+i*1.3,4.2,13.6,.65,.7,.9,0,rub);}
 hnRBArch(0,0,13.6,0,6.4,5.4,3.2,'hRBArchS',ash);vB('vStone',0,5.4,13.6,6.8,.25,3.6,0,ash);
 for(const s of[-1,1])kput('vWood',[s*1.6,2.1,12.2],qEuler(0,s*1.2,0),[1.8,4.1,.14],tar);
 hnForm('hFormA',0,4.6,15.2,0,2.4,.7);
 hnLogBox(0,5.65,13.6,6.8,3,3.8,0,tar);hnRBNals(0,6.5,15.5,0,5,2,.6,1,lit,red,{});hnBracketRow(0,7.9,15.5,0,6.4,3,.5);hnBracketRow(0,7.9,11.7,Math.PI,6.4,3,.5);
 const tip=hnTent(0,8.65,13.6,4.9,5.6,'hTentSc',slate);vPst('vIron',0,tip-.3,13.6,.05,1.2,hC(hRBIRON));vBall('hGold',0,tip+.3,13.6,.16,hC(HPAL.gold[0]));
 for(const s of[-1,1])hnRBFlag(s*3.4,8.65,15.1,0,4.2,hC(HPAL.red));
 // the armoury
 vB('hRubB',7,0,-4,8,3.6,5,0,rub);hnRBQuoins(7,0,-4,8,3.6,5,0,ash);vnHipRoof('hHipSc',7,3.6,-4,8,5,2.4,0,slate,.4);
 hnRBIronDoor(3,0,-4,-Math.PI/2,1.6,2.4,'vStone',ash);for(const z of[-5.6,-2.4]){vnWin(3,1.8,z,-Math.PI/2,.35,.8,'open','vStone',ash);}hnForm('hFormA',3,2.75,-4,-Math.PI/2,1.8,.6);
 // the yard: well, racks, a company at drill, lamps
 FURNISH('hl_rep_civic_well',-6,0,-4,0,{v:0});
 hnRBRack(-10.4,-7,Math.PI/2,3);hnRBRack(10.4,5,-Math.PI/2,3);hnRBRanks(-1,4,0,6,3,1.1,1.1);kput('figB',[-1,0,7.2],qEuler(0,Math.PI,0),1,hC(0x3a2a3a));kput('figH',[-1,0,7.2],null,1,hC(0xc9a17e));
 hnRBLamps([[-4.2,17],[4.2,17],[-9,-9],[9,9]],3.4);}

// Mustering ground: a beaten-earth drill field inside a low rubble wall, a covered tribune on carved posts with
// dougong and a keel gable for the reviewing officers, masts of the Republic's colours, weapon racks, shooting
// butts against an earth bank, a pair of field guns and a company drawn up in ranks. Placed beside the barracks.
function buildHlRepMuster(G,o){reseed(20771+(o.v|0));const FX=25.5,FZ0=-15.6,FZ1=17;
 const rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),tar=hC(vPick(HPAL.tar)).multiplyScalar(1.2),grn=hC(vPick(HPAL.roofGreen)),red=hC(HPAL.red),white=hC(HPAL.white);
 vnReg('Mustering ground',0,1,26,3);vnReg('Reviewing tribune',0,-12.5,7.5,9);
 vB('hRBDirt',0,0,.7,2*FX-.6,.22,FZ1-FZ0-.6,0,hC(0xe8dcc4));   // round 10: .22 thick, clear of the levelled terrain (it z-fought at .05)
 // low wall: back, sides, front with a wide entrance
 const wall=(a,b)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=Math.atan2(b[0]-a[0],b[1]-a[1])-Math.PI/2;const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  vB('hRubB',m[0],0,m[1],L,.8,.6,ry,rub);vB('vStone',m[0],.8,m[1],L+.1,.14,.75,ry,ash);};
 wall([-FX,FZ0],[FX,FZ0]);wall([-FX,FZ0+.3],[-FX,FZ1]);wall([FX,FZ0+.3],[FX,FZ1]);wall([-FX+.3,FZ1],[-4.5,FZ1]);wall([4.5,FZ1],[FX-.3,FZ1]);
 for(const s of[-1,1]){vB('hRubB',s*4.5,0,FZ1,1,1.6,1,0,rub);vB('vStone',s*4.5,1.6,FZ1,1.2,.2,1.2,0,ash);vBall('hGold',s*4.5,1.95,FZ1,.18,hC(HPAL.gold[0]));}
 // the tribune
 const TZ=-12.5;hnSocle(0,0,TZ,14,1.8,5,0,rub,ash);vnStairs(0,0,TZ+2.5+.96,0,3,1.8,6,'vStone',ash);
 vB('vWood',0,1.8,TZ-2.2,14,3.6,.3,0,tar);hnFrieze(0,4.6,TZ-2.05,0,14,.5);
 for(const u of[-4.5,0,4.5]){hnForm('hFormV',u,2.2,TZ-2.05,0,1.1,2.3);}
 for(const u of[-6.6,-3.3,3.3,6.6])hnTotemPost(u,1.8,TZ+2.2,.2,3.1,0,Math.abs(u)<4);
 for(const u of[-4.95,4.95])kput('hLaceB',[u,2.3,TZ+2.25],null,[2.7,.9,1],red);
 hnBracketRow(0,4.5,TZ+2.2,0,13.6,6,.55);vnHipRoof('hHipSc',0,5.35,TZ,14,4.4,2.4,0,grn,.9);
 hnKokoshnik(0,5.1,TZ+2.3,0,5.2,3.1,'hKeelSc',grn,false);hnForm('hFormT',0,5.45,TZ+2.3+.12,0,2.8,1.3);
 for(const s of[-1,1])hnRBFlag(s*8.4,0,TZ,0,9,hC(s<0?HPAL.red:HPAL.teal));
 // masts along the front, racks along the west wall, butts against an earth bank on the east
 [-20,-12,12,20].forEach((x,i)=>hnRBFlag(x,0,14.8,0,7.5,hC([HPAL.red,HPAL.teal,HPAL.ochre,HPAL.red][i])));
 for(const z of[-7,-1,5,11])hnRBRack(-23.6,z,Math.PI/2,3.4);
 kput('hRBBerm',[23.2,0,1],qEuler(0,Math.PI/2,0),[22,3,3.2],hC(vPick(HPAL.turf)));
 for(const z of[-7,-2.5,2,6.5,11])hnFurn('hl_rep_training_butt',21.2,0,z,-Math.PI/2,{v:0},0,.05);   // straw butts with their targets
 for(const z of[-7,-2.5,2,6.5,11]){vB('vWood',8,.22,z,.3,.03,1.2,0,white);kput('figB',[7.4,0,z],qEuler(0,Math.PI/2,0),1,hC(0x7a2a22));kput('figH',[7.4,0,z],null,1,hC(0xc9a17e));
  kput('vWood',[7.7,1.35,z],qEuler(0,0,-Math.PI/2+.1),[.04,1.1,.04],hC(0x2e2a26));}
 // two field guns (the Republic's trade), a company in ranks with an officer
 for(const x of[12,17]){const z=13;kput('vPipe',[x,1,z-.3],qEuler(-Math.PI/2+.12,0,0),[.2,2.4,.2],hC(0x3a3834));vB('vWood',x,.5,z+.6,.5,.35,1.8,0,tar);
  for(const s of[-1,1])kput('hRBDiscW',[x+s*.55,.65,z],qEuler(0,Math.PI/2,0),[.65,.65,.08],tar);}
 hnRBRanks(-4,1,0,8,4,1.1,1.2);kput('figB',[-4,0,-2.6],qEuler(0,0,0),1,hC(0x3a2a3a));kput('figH',[-4,0,-2.6],null,1,hC(0xc9a17e));
 hnRBLamps([[-FX+1,FZ0+1],[FX-1,FZ0+1],[-FX+1,FZ1-1],[FX-1,FZ1-1],[-5.5,FZ1-.8],[5.5,FZ1-.8]],3.6);}

const HRB_CIVIC={wealth:'civic',lit:true};
HL.def({key:'hl_rep_temple',name:'Temple of the Pantheon',branch:'republican',family:'Temple',tags:Object.assign({type:['religious'],landmark:true},HRB_CIVIC),w:48,d:48,h:32,build:buildHlRepTemple});
HL.def({key:'hl_rep_town_hall',name:'Town hall',branch:'republican',family:'Civic',tags:Object.assign({type:['civic'],landmark:true},HRB_CIVIC),w:32,d:34,h:33,build:buildHlRepTownHall});
HL.def({key:'hl_rep_hospital',name:'Hospital',branch:'republican',family:'Civic',tags:Object.assign({type:['civic']},HRB_CIVIC),w:38,d:34,h:15,build:buildHlRepHospital});
HL.def({key:'hl_rep_watch',name:'City watch',branch:'republican',family:'Civic',tags:Object.assign({type:['civic','military']},HRB_CIVIC),w:24,d:18,h:24,build:buildHlRepWatch});
HL.def({key:'hl_rep_theater',name:'Theatre',branch:'republican',family:'Civic',tags:Object.assign({type:['civic']},HRB_CIVIC),w:32,d:34,h:25,build:buildHlRepTheater});
HL.def({key:'hl_rep_school',name:'Schoolhouse',branch:'republican',family:'Civic',tags:Object.assign({type:['civic']},HRB_CIVIC),w:26,d:21,h:14,build:buildHlRepSchool});
HL.def({key:'hl_rep_barracks',name:'Barracks',branch:'republican',family:'Military',tags:Object.assign({type:['military']},HRB_CIVIC),w:42,d:38,h:15,build:buildHlRepBarracks});
HL.def({key:'hl_rep_muster',name:'Mustering ground',branch:'republican',family:'Military',tags:Object.assign({type:['military']},HRB_CIVIC),w:52,d:34,h:10,build:buildHlRepMuster});
